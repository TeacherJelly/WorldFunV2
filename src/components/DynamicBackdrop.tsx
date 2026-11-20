import React, { useEffect, useRef, useState } from 'react';
import { GameMode } from '../types';

interface DynamicBackdropProps {
  variant: 'title' | 'playing';
  mode: GameMode;
  focusedMenu?: boolean;
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  life: number;
  maxLife: number;
  spriteIdx: number;
}

export function triggerBackdropBurst(clientX: number, clientY: number, color = '#FBBF24', count = 12) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('worddot:burst', {
      detail: { x: clientX, y: clientY, color, count },
    })
  );
}

const WALLPAPER_SRC = '/src/assets/images/live_desktop_wallpaper_1795009587534.jpg';

// Module-level cache of one-time pre-baked DoF + bokeh wallpaper variants (0 continuous GPU blur cost)
const prebakedDofCache: Record<string, string> = {};

function bakeDofBokehOnce(
  img: HTMLImageElement,
  variant: 'title' | 'playing',
  mode: GameMode
): string {
  const aspect = img.naturalHeight / Math.max(1, img.naturalWidth);
  const w = variant === 'title' ? 720 : 560;
  const h = Math.max(200, Math.round(w * aspect));
  const blurPx = variant === 'title' ? 7.5 : 5.5;

  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const ctx = off.getContext('2d');
  if (!ctx) return WALLPAPER_SRC;

  const pad = Math.ceil(blurPx * 2.5);
  if ('filter' in ctx) {
    ctx.filter = `blur(${blurPx}px)`;
  }
  ctx.drawImage(img, -pad, -pad, w + pad * 2, h + pad * 2);
  if ('filter' in ctx) {
    ctx.filter = 'none';
  }

  // Soft depth-of-field scrim to put clean visual focus on active menus / puzzle boards
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  if (variant === 'playing') {
    if (mode === 'sentence') {
      grad.addColorStop(0, 'rgba(224, 242, 254, 0.56)');
      grad.addColorStop(0.5, 'rgba(255, 251, 235, 0.42)');
      grad.addColorStop(1, 'rgba(209, 250, 229, 0.54)');
    } else {
      grad.addColorStop(0, 'rgba(224, 231, 255, 0.54)');
      grad.addColorStop(0.5, 'rgba(240, 249, 255, 0.40)');
      grad.addColorStop(1, 'rgba(252, 231, 243, 0.48)');
    }
  } else {
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.24)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.16)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.28)');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Paint soft optical bokeh orbs onto the DoF texture once
  const bokehOrbs: Array<[number, number, number, string]> = [
    [w * 0.14, h * 0.18, w * 0.08, 'rgba(254, 240, 138, 0.26)'],
    [w * 0.84, h * 0.22, w * 0.10, 'rgba(125, 211, 252, 0.22)'],
    [w * 0.26, h * 0.78, w * 0.07, 'rgba(255, 255, 255, 0.20)'],
    [w * 0.72, h * 0.74, w * 0.09, 'rgba(167, 243, 208, 0.22)'],
    [w * 0.50, h * 0.34, w * 0.11, 'rgba(255, 255, 255, 0.16)'],
  ];
  for (const [bx, by, br, color] of bokehOrbs) {
    const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    bGrad.addColorStop(0, color);
    bGrad.addColorStop(0.7, color);
    bGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  return off.toDataURL('image/jpeg', 0.88);
}

function createSparkleSprite(color: string): HTMLCanvasElement {
  const size = 28;
  const off = document.createElement('canvas');
  off.width = size;
  off.height = size;
  const octx = off.getContext('2d');
  if (!octx) return off;

  const c = size / 2;
  const grad = octx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.35, color);
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  octx.fillStyle = grad;
  octx.fillRect(0, 0, size, size);

  octx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  octx.beginPath();
  octx.ellipse(c, c, 1.6, 8, 0, 0, Math.PI * 2);
  octx.ellipse(c, c, 8, 1.6, 0, 0, Math.PI * 2);
  octx.fill();
  return off;
}

export const DynamicBackdrop: React.FC<DynamicBackdropProps> = ({
  variant,
  mode,
  focusedMenu = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgFailed, setImgFailed] = useState(false);

  const cacheKey = `${variant}-${mode}`;
  const [dofBackdropUrl, setDofBackdropUrl] = useState<string>(
    () => prebakedDofCache[cacheKey] || WALLPAPER_SRC
  );

  const showDof = variant === 'playing' || focusedMenu;

  // One-time offscreen DoF + bokeh bake per variant+mode (zero runtime GPU blur!)
  useEffect(() => {
    const cached = prebakedDofCache[cacheKey];
    if (cached) {
      setDofBackdropUrl(cached);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      try {
        const baked = bakeDofBokehOnce(img, variant, mode);
        prebakedDofCache[cacheKey] = baked;
        setDofBackdropUrl(baked);
      } catch {
        setDofBackdropUrl(WALLPAPER_SRC);
      }
    };
    img.onerror = () => {
      if (!cancelled) setImgFailed(true);
    };
    img.src = WALLPAPER_SRC;

    return () => {
      cancelled = true;
    };
  }, [cacheKey, variant, mode]);

  // On-demand sparkle burst canvas (0% idle CPU/GPU; wakes briefly only for interactive bursts)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const palette =
      mode === 'sentence'
        ? ['#FBBF24', '#38BDF8', '#34D399', '#F472B6', '#FFFFFF']
        : ['#A78BFA', '#38BDF8', '#FBBF24', '#FB7185', '#FFFFFF'];

    const burstSprites = palette.map(c => createSparkleSprite(c));

    let width = 1280;
    let height = 720;
    let animId = 0;
    let lastDraw = 0;
    const bursts: BurstParticle[] = [];

    const resize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.min(0.8, 1280 / Math.max(1, vw));
      width = Math.max(320, Math.round(vw * scale));
      height = Math.max(240, Math.round(vh * scale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      ctx.clearRect(0, 0, width, height);
    };

    resize();
    window.addEventListener('resize', resize);

    const stopLoop = () => {
      if (animId !== 0) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    const tick = (now: number) => {
      if (document.hidden || bursts.length === 0) {
        bursts.length = 0;
        ctx.clearRect(0, 0, width, height);
        animId = 0;
        return;
      }

      const dt = Math.min((now - lastDraw) / 1000, 0.05);
      lastDraw = now;

      ctx.clearRect(0, 0, width, height);

      for (let i = bursts.length - 1; i >= 0; i--) {
        const p = bursts[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 220 * dt;
        p.vx *= 0.95;
        p.life += dt;
        const progress = p.life / p.maxLife;
        if (progress >= 1) {
          bursts.splice(i, 1);
          continue;
        }
        const size = p.r * 2 * (1 - progress * 0.3);
        ctx.globalAlpha = (1 - progress) * p.alpha;
        ctx.drawImage(burstSprites[p.spriteIdx], p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      if (bursts.length > 0) {
        animId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
        animId = 0;
      }
    };

    const onBurst = (e: Event) => {
      if (prefersReducedMotion || document.hidden) return;
      const ce = e as CustomEvent<{ x: number; y: number; color: string; count: number }>;
      const scaleX = width / Math.max(1, window.innerWidth);
      const scaleY = height / Math.max(1, window.innerHeight);
      const bx = ce.detail.x * scaleX;
      const by = ce.detail.y * scaleY;
      const spriteIdx = Math.max(0, palette.indexOf(ce.detail.color));
      const clampedCount = Math.min(ce.detail.count, 10);

      if (bursts.length > 24) bursts.splice(0, bursts.length - 24);

      for (let i = 0; i < clampedCount; i++) {
        const angle = (Math.PI * 2 * i) / clampedCount + (Math.random() - 0.5) * 0.35;
        const speed = (65 + Math.random() * 120) * scaleX;
        bursts.push({
          x: bx,
          y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 22 * scaleY,
          r: (9 + Math.random() * 6) * scaleX,
          alpha: 0.95,
          life: 0,
          maxLife: 0.48 + Math.random() * 0.2,
          spriteIdx: i % 3 === 0 ? palette.length - 1 : spriteIdx,
        });
      }

      if (animId === 0) {
        lastDraw = performance.now();
        animId = requestAnimationFrame(tick);
      }
    };

    window.addEventListener('worddot:burst', onBurst);

    return () => {
      stopLoop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('worddot:burst', onBurst);
    };
  }, [mode]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Layer 1: Crisp Static Desktop Wallpaper (Unblurred by default, still and static) */}
      {!imgFailed ? (
        <>
          <img
            src={WALLPAPER_SRC}
            alt=""
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out ${
              showDof ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* Layer 1B: Pre-Baked Depth-of-Field + Bokeh Focus Layer (Cross-fades cleanly when a menu is active) */}
          <img
            src={dofBackdropUrl}
            alt=""
            decoding="async"
            referrerPolicy="no-referrer"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out ${
              showDof ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-200" />
      )}

      {/* Layer 2: Lightweight Live-Desktop Atmosphere (Drifting Clouds & Meadow Butterflies, Compositor-Only) */}
      <div
        className={`absolute inset-0 overflow-hidden transition-opacity duration-500 ${
          showDof ? 'opacity-35' : 'opacity-90'
        }`}
      >
        {/* Drifting Sky Clouds */}
        <svg
          viewBox="0 0 120 56"
          aria-hidden="true"
          className="absolute top-5 left-0 w-28 h-13 opacity-65 animate-cloud-slow motion-reduce:animate-none"
        >
          <path
            d="M24 44h70a14 14 0 0 0 2-28 20 20 0 0 0-38-6 16 16 0 0 0-28 10A12 12 0 0 0 24 44Z"
            fill="#FFFFFF"
          />
        </svg>
        <svg
          viewBox="0 0 120 56"
          aria-hidden="true"
          className="absolute top-16 left-0 w-22 h-10 opacity-50 animate-cloud-slower motion-reduce:animate-none"
          style={{ animationDelay: '-28s' }}
        >
          <path
            d="M24 44h70a14 14 0 0 0 2-28 20 20 0 0 0-38-6 16 16 0 0 0-28 10A12 12 0 0 0 24 44Z"
            fill="#FFFFFF"
          />
        </svg>

        {/* Two Tiny Meadow Butterflies gliding softly across the live wallpaper */}
        <svg
          viewBox="0 0 36 28"
          aria-hidden="true"
          className="absolute bottom-[24%] left-0 w-7 h-6 opacity-85 animate-butterfly-slow motion-reduce:animate-none"
          style={{ animationDelay: '-8s' }}
        >
          <ellipse cx="13" cy="12" rx="7" ry="5.5" transform="rotate(-20 13 12)" fill="#FBBF24" />
          <ellipse cx="23" cy="12" rx="7" ry="5.5" transform="rotate(20 23 12)" fill="#FDE047" />
          <ellipse cx="14" cy="18" rx="4.5" ry="4" fill="#F59E0B" />
          <ellipse cx="22" cy="18" rx="4.5" ry="4" fill="#F59E0B" />
          <rect x="17" y="9" width="2" height="12" rx="1" fill="#78350F" />
        </svg>

        <svg
          viewBox="0 0 36 28"
          aria-hidden="true"
          className="absolute bottom-[36%] left-0 w-6 h-5 opacity-80 animate-butterfly-slow motion-reduce:animate-none"
          style={{ animationDelay: '-23s' }}
        >
          <ellipse cx="13" cy="12" rx="7" ry="5.5" transform="rotate(-20 13 12)" fill="#38BDF8" />
          <ellipse cx="23" cy="12" rx="7" ry="5.5" transform="rotate(20 23 12)" fill="#7DD3FC" />
          <ellipse cx="14" cy="18" rx="4.5" ry="4" fill="#0284C7" />
          <ellipse cx="22" cy="18" rx="4.5" ry="4" fill="#0284C7" />
          <rect x="17" y="9" width="2" height="12" rx="1" fill="#0F172A" />
        </svg>
      </div>

      {/* Layer 3: On-Demand Sparkle Burst Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
