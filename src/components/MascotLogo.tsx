import React, { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

const RAW_MASCOT_SRC = '/src/assets/images/charismatic_logo_mascot_1795009587376.jpg';

interface EyeMetric {
  cx: number; // normalized [0..1]
  cy: number; // normalized [0..1]
  rx: number; // normalized half-width
  ry: number; // normalized half-height
}

interface MascotRigAssets {
  pngUrl: string;
  canvas: HTMLCanvasElement;
  leftEye: EyeMetric;
  rightEye: EyeMetric;
  lidColor: string;
  lashColor: string;
}

let cachedAssets: MascotRigAssets | null = null;

function detectEyeBounds(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  uMin: number,
  uMax: number,
  fallback: EyeMetric
): EyeMetric {
  const x0 = Math.max(0, Math.floor(uMin * w));
  const x1 = Math.min(w - 1, Math.ceil(uMax * w));
  const y0 = Math.max(0, Math.floor(0.335 * h));
  const y1 = Math.min(h - 1, Math.ceil(0.445 * h));

  let minX = x1;
  let maxX = x0;
  let minY = y1;
  let maxY = y0;
  let count = 0;

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const p = (y * w + x) * 4;
      const a = data[p + 3];
      if (a < 180) continue;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];

      const isDarkEye = r < 115 && g < 72 && b < 50;
      const isWhiteSclera = r > 238 && g > 234 && b > 226;

      if (isDarkEye || isWhiteSclera) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        count++;
      }
    }
  }

  if (count < 40 || maxX - minX < 8 || maxY - minY < 8) {
    return fallback;
  }

  return {
    cx: (minX + maxX) / (2 * w),
    cy: (minY + maxY) / (2 * h),
    rx: ((maxX - minX) / (2 * w)) * 1.08,
    ry: ((maxY - minY) / (2 * h)) * 1.08,
  };
}

function sampleLidFurColor(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  eye: EyeMetric
): string {
  const sampleX = Math.round(eye.cx * w);
  const sampleY = Math.max(0, Math.round((eye.cy - eye.ry - 0.015) * h));
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let n = 0;

  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -5; dx <= 5; dx++) {
      const x = Math.max(0, Math.min(w - 1, sampleX + dx));
      const y = Math.max(0, Math.min(h - 1, sampleY + dy));
      const p = (y * w + x) * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      if (r > 205 && g > 175 && b > 135) {
        rSum += r;
        gSum += g;
        bSum += b;
        n++;
      }
    }
  }

  if (n === 0) return '#FFE8C8';
  return `rgb(${Math.round(rSum / n)}, ${Math.round(gSum / n)}, ${Math.round(bSum / n)})`;
}

/**
 * Flood-fills bright neutral background pixels connected to image borders
 * so the character logo has a truly transparent background while keeping
 * interior white details (eyes, book pages, highlights) intact, and detects
 * exact eye geometry for Live2D blinking.
 */
function buildMascotRigAssets(img: HTMLImageElement): MascotRigAssets {
  const maxDim = 768;
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      pngUrl: RAW_MASCOT_SRC,
      canvas,
      leftEye: { cx: 0.398, cy: 0.39, rx: 0.06, ry: 0.05 },
      rightEye: { cx: 0.602, cy: 0.39, rx: 0.06, ry: 0.05 },
      lidColor: '#FFE8C8',
      lashColor: '#4E1C07',
    };
  }

  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const total = w * h;
  const visited = new Uint8Array(total);
  const removed = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const isBgPixel = (idx: number): boolean => {
    const p = idx * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const minC = Math.min(r, g, b);
    const maxC = Math.max(r, g, b);
    return minC >= 212 && maxC - minC <= 26;
  };

  const enqueueIfBg = (x: number, y: number) => {
    const idx = y * w + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    if (isBgPixel(idx)) {
      removed[idx] = 1;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < w; x++) {
    enqueueIfBg(x, 0);
    enqueueIfBg(x, h - 1);
  }
  for (let y = 1; y < h - 1; y++) {
    enqueueIfBg(0, y);
    enqueueIfBg(w - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % w;
    const y = (idx / w) | 0;

    if (x > 0) enqueueIfBg(x - 1, y);
    if (x + 1 < w) enqueueIfBg(x + 1, y);
    if (y > 0) enqueueIfBg(x, y - 1);
    if (y + 1 < h) enqueueIfBg(x, y + 1);
  }

  for (let i = 0; i < total; i++) {
    if (removed[i]) {
      data[i * 4 + 3] = 0;
      continue;
    }
    const x = i % w;
    const y = (i / w) | 0;
    const touchesRemoved =
      (x > 0 && removed[i - 1]) ||
      (x + 1 < w && removed[i + 1]) ||
      (y > 0 && removed[i - w]) ||
      (y + 1 < h && removed[i + w]);
    if (touchesRemoved) {
      const p = i * 4;
      const lum = (data[p] + data[p + 1] + data[p + 2]) / 3;
      if (lum > 185) {
        data[p + 3] = Math.round(data[p + 3] * 0.45);
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const leftEye = detectEyeBounds(data, w, h, 0.315, 0.468, {
    cx: 0.398,
    cy: 0.39,
    rx: 0.06,
    ry: 0.05,
  });
  const rightEye = detectEyeBounds(data, w, h, 0.532, 0.685, {
    cx: 0.602,
    cy: 0.39,
    rx: 0.06,
    ry: 0.05,
  });
  const lidColor = sampleLidFurColor(data, w, h, leftEye);

  return {
    pngUrl: canvas.toDataURL('image/png'),
    canvas,
    leftEye,
    rightEye,
    lidColor,
    lashColor: '#4E1C07',
  };
}

// --- Live2D-Style Parametric Mesh Deformation ---
interface Live2DParams {
  breath: number; // -1..1
  angleX: number; // -1..1 (pseudo-3D yaw)
  angleY: number; // -1..1 (nod)
  angleZ: number; // radians (head roll)
  earL: number; // radians
  earR: number; // radians
  tailWag: number; // radians
  tuftBounce: number; // normalized y offset
  bodySway: number; // radians
  blink: number; // 0 (open) .. 1 (closed)
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function rotateAround(
  x: number,
  y: number,
  px: number,
  py: number,
  angle: number
): [number, number] {
  const dx = x - px;
  const dy = y - py;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [px + dx * c - dy * s, py + dx * s + dy * c];
}

function deformPoint(u: number, v: number, p: Live2DParams): [number, number] {
  let x = u;
  let y = v;

  // 1. Fluffy tail sway on the left silhouette behind the hip (isolated cleanly from leg/book)
  const tailWeightU = 1 - smoothstep(0.325, 0.375, u);
  const tailWeightV = smoothstep(0.49, 0.56, v) * (1 - smoothstep(0.80, 0.85, v));
  const tailWeight = tailWeightU * tailWeightV;
  if (tailWeight > 0.001) {
    const [tx, ty] = rotateAround(x, y, 0.355, 0.72, p.tailWag * tailWeight);
    x = tx;
    y = ty + Math.sin(p.tailWag * 6) * 0.003 * tailWeight;
  }

  // 2. Torso & Book breathing (chest expands subtly & lifts slightly)
  const torsoWeight =
    smoothstep(0.47, 0.56, v) *
    (1 - smoothstep(0.78, 0.87, v)) *
    (1 - tailWeight * 0.85);
  if (torsoWeight > 0.001) {
    x = 0.5 + (x - 0.5) * (1 + p.breath * 0.013 * torsoWeight);
    y += -p.breath * 0.0065 * torsoWeight;
    const [bx, by] = rotateAround(x, y, 0.5, 0.84, p.bodySway * torsoWeight);
    x = bx;
    y = by;
  }

  // 3. Articulated Head (neck pivot at 0.50, 0.525 with smooth collar blend)
  const neckBlend = 1 - smoothstep(0.465, 0.548, v);
  const headMask = neckBlend * (1 - tailWeight * 0.9);

  if (headMask > 0.001) {
    // Head roll & slight nod around neck joint
    const [hx, hy] = rotateAround(x, y, 0.5, 0.525, p.angleZ * headMask);
    x = hx;
    y = hy + p.angleY * 0.009 * headMask - p.breath * 0.0055 * headMask;

    // Live2D 2.5D pseudo-3D yaw parallax: inner face shifts slightly more than silhouette
    const distFromFaceCenter = Math.hypot((u - 0.5) / 0.2, (v - 0.38) / 0.14);
    const faceInnerWeight = Math.max(0, 1 - smoothstep(0.25, 1.15, distFromFaceCenter));
    x += p.angleX * (0.006 + faceInnerWeight * 0.011) * headMask;
    y += p.angleX * (u - 0.5) * 0.012 * headMask;
  }

  // 4. Independent Springy Ear Physics
  const earFadeV = 1 - smoothstep(0.22, 0.295, v);
  const leftEarW = earFadeV * (1 - smoothstep(0.39, 0.45, u));
  if (leftEarW > 0.001) {
    const [ex, ey] = rotateAround(x, y, 0.37, 0.27, p.earL * leftEarW);
    x = ex;
    y = ey;
  }
  const rightEarW = earFadeV * smoothstep(0.55, 0.61, u);
  if (rightEarW > 0.001) {
    const [ex, ey] = rotateAround(x, y, 0.63, 0.27, p.earR * rightEarW);
    x = ex;
    y = ey;
  }

  // 5. Top hair tuft secondary bounce
  const tuftW =
    (1 - smoothstep(0.18, 0.23, v)) *
    smoothstep(0.41, 0.46, u) *
    (1 - smoothstep(0.54, 0.59, u));
  if (tuftW > 0.001) {
    y += p.tuftBounce * tuftW;
  }

  return [x, y];
}

// --- WebGL Watertight Mesh Renderer ---
interface WebGLMeshRenderer {
  canvas: HTMLCanvasElement;
  render: (params: Live2DParams) => boolean;
  dispose: () => void;
}

function createWebGLMeshRenderer(sourceCanvas: HTMLCanvasElement): WebGLMeshRenderer | null {
  const canvas = document.createElement('canvas');
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;

  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: false,
    antialias: true,
  });
  if (!gl) return null;

  const vsSource = `
    attribute vec2 a_pos;
    attribute vec2 a_uv;
    varying vec2 v_uv;
    void main() {
      v_uv = a_uv;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;
  const fsSource = `
    precision mediump float;
    uniform sampler2D u_tex;
    varying vec2 v_uv;
    void main() {
      gl_FragColor = texture2D(u_tex, v_uv);
    }
  `;

  const compileShader = (type: number, src: string) => {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  };

  const vs = compileShader(gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

  const cols = 28;
  const rows = 28;
  const vertCount = (cols + 1) * (rows + 1);
  const uvs = new Float32Array(vertCount * 2);
  const positions = new Float32Array(vertCount * 2);
  const indices = new Uint16Array(cols * rows * 6);

  let vi = 0;
  for (let r = 0; r <= rows; r++) {
    const v = r / rows;
    for (let c = 0; c <= cols; c++) {
      const u = c / cols;
      uvs[vi * 2] = u;
      uvs[vi * 2 + 1] = v;
      positions[vi * 2] = u * 2 - 1;
      positions[vi * 2 + 1] = 1 - v * 2;
      vi++;
    }
  }

  let ii = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tl = r * (cols + 1) + c;
      const tr = tl + 1;
      const bl = tl + (cols + 1);
      const br = bl + 1;
      indices[ii++] = tl;
      indices[ii++] = bl;
      indices[ii++] = tr;
      indices[ii++] = tr;
      indices[ii++] = bl;
      indices[ii++] = br;
    }
  }

  const posBuf = gl.createBuffer();
  const uvBuf = gl.createBuffer();
  const idxBuf = gl.createBuffer();
  const tex = gl.createTexture();
  if (!posBuf || !uvBuf || !idxBuf || !tex) return null;

  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
  gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCanvas);

  gl.useProgram(program);
  const aPos = gl.getAttribLocation(program, 'a_pos');
  const aUv = gl.getAttribLocation(program, 'a_uv');
  const uTex = gl.getUniformLocation(program, 'u_tex');
  gl.uniform1i(uTex, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const render = (params: Live2DParams): boolean => {
    if (gl.isContextLost()) return false;

    let ptr = 0;
    for (let r = 0; r <= rows; r++) {
      const v = r / rows;
      for (let c = 0; c <= cols; c++) {
        const u = c / cols;
        const [dx, dy] = deformPoint(u, v, params);
        positions[ptr++] = dx * 2 - 1;
        positions[ptr++] = 1 - dy * 2;
      }
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    return true;
  };

  const dispose = () => {
    gl.deleteBuffer(posBuf);
    gl.deleteBuffer(uvBuf);
    gl.deleteBuffer(idxBuf);
    gl.deleteTexture(tex);
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
  };

  return { canvas, render, dispose };
}

function drawLive2DEyeOverlay(
  ctx: CanvasRenderingContext2D,
  eye: EyeMetric,
  w: number,
  h: number,
  params: Live2DParams,
  lidColor: string,
  lashColor: string
) {
  if (params.blink <= 0.025) return;

  const [cxN, cyN] = deformPoint(eye.cx, eye.cy, params);
  const [rxN, rxYN] = deformPoint(eye.cx + eye.rx, eye.cy, params);
  const [topXN, topN] = deformPoint(eye.cx, eye.cy - eye.ry, params);

  const cx = cxN * w;
  const cy = cyN * h;
  const rx = Math.max(4, Math.hypot((rxN - cxN) * w, (rxYN - cyN) * h));
  const ry = Math.max(4, Math.hypot((topXN - cxN) * w, (topN - cyN) * h));

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(params.angleZ);

  // Clip strictly to the eye opening capsule so lid fur blends seamlessly
  ctx.beginPath();
  ctx.ellipse(0, 0, rx * 1.05, ry * 1.06, 0, 0, Math.PI * 2);
  ctx.clip();

  // Natural Live2D descending upper eyelid + gentle blinking lash arc
  const b = params.blink;
  const lidBottomY = -ry * 0.96 + b * (ry * 1.62);
  const curveDip = ry * (0.28 - b * 0.06);

  ctx.fillStyle = lidColor;
  ctx.beginPath();
  ctx.moveTo(-rx * 1.2, -ry * 1.25);
  ctx.lineTo(rx * 1.2, -ry * 1.25);
  ctx.lineTo(rx * 1.2, lidBottomY);
  ctx.quadraticCurveTo(0, lidBottomY + curveDip, -rx * 1.2, lidBottomY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = lashColor;
  ctx.lineWidth = Math.max(2.0, rx * 0.13);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-rx * 0.82, lidBottomY - ry * 0.04);
  ctx.quadraticCurveTo(0, lidBottomY + curveDip * 0.95, rx * 0.82, lidBottomY - ry * 0.04);
  ctx.stroke();

  ctx.restore();
}

interface MascotLogoProps {
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const MascotLogo: React.FC<MascotLogoProps> = ({
  className = 'w-32 h-32 sm:w-44 sm:h-44',
  onClick,
}) => {
  const [assets, setAssets] = useState<MascotRigAssets | null>(() => cachedAssets);
  const [failed, setFailed] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (cachedAssets) {
      setAssets(cachedAssets);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      try {
        const built = buildMascotRigAssets(img);
        cachedAssets = built;
        setAssets(built);
      } catch {
        setFailed(true);
      }
    };
    img.onerror = () => {
      if (!cancelled) setFailed(true);
    };
    img.src = RAW_MASCOT_SRC;

    return () => {
      cancelled = true;
    };
  }, []);

  // 60fps Live2D-style Parametric Mesh Idle Animator
  useEffect(() => {
    if (!assets || !canvasRef.current) return;
    const displayCanvas = canvasRef.current;
    const ctx2d = displayCanvas.getContext('2d');
    if (!ctx2d) return;

    const w = assets.canvas.width;
    const h = assets.canvas.height;
    displayCanvas.width = w;
    displayCanvas.height = h;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const glRenderer = prefersReducedMotion ? null : createWebGLMeshRenderer(assets.canvas);

    let rafId = 0;
    const startTime = performance.now();
    let nextBlinkAt = 2.1;
    let blinkIsDouble = false;
    let nextEarFlickAt = 3.6;

    const renderFrame = (now: number) => {
      const t = (now - startTime) / 1000;

      // Natural Live2D blink envelope (single + occasional cute double-blink)
      let blink = 0;
      if (!prefersReducedMotion) {
        if (t >= nextBlinkAt) {
          const elapsed = t - nextBlinkAt;
          const singleDur = 0.24;
          const totalDur = blinkIsDouble ? 0.54 : singleDur;

          if (elapsed <= singleDur) {
            blink = Math.sin((elapsed / singleDur) * Math.PI);
            blink = Math.min(1, blink * 1.28);
          } else if (blinkIsDouble && elapsed >= 0.3 && elapsed <= 0.54) {
            blink = Math.sin(((elapsed - 0.3) / 0.24) * Math.PI);
            blink = Math.min(1, blink * 1.22);
          } else if (elapsed > totalDur) {
            nextBlinkAt = t + 2.8 + Math.random() * 2.4;
            blinkIsDouble = Math.random() < 0.28;
          }
        }
      }

      // Periodic independent ear flick physics
      let earFlickL = 0;
      let earFlickR = 0;
      if (!prefersReducedMotion) {
        if (t >= nextEarFlickAt) {
          const dt = t - nextEarFlickAt;
          if (dt <= 0.45) {
            const env = Math.sin((dt / 0.45) * Math.PI) * Math.sin(dt * 28);
            if (Math.floor(nextEarFlickAt) % 2 === 0) {
              earFlickL = env * 0.11;
            } else {
              earFlickR = env * 0.11;
            }
          } else {
            nextEarFlickAt = t + 4.2 + Math.random() * 3.0;
          }
        }
      }

      const idleBreath = prefersReducedMotion ? 0 : Math.sin(t * 1.92);
      const idleWaveA = prefersReducedMotion ? 0 : Math.sin(t * 1.15);
      const idleWaveB = prefersReducedMotion ? 0 : Math.sin(t * 0.72 + 0.8);

      const angleZ = idleWaveA * 0.042 + idleWaveB * 0.02;
      const angleX = idleWaveB * 0.55;
      const angleY = idleBreath * 0.38 + Math.sin(t * 1.45) * 0.25;

      // Secondary spring lag on ears and tail (authentic Live2D physics feel)
      const earBaseL = prefersReducedMotion
        ? 0
        : Math.sin(t * 1.15 - 0.55) * 0.048 + Math.sin(t * 2.4) * 0.015;
      const earBaseR = prefersReducedMotion
        ? 0
        : Math.sin(t * 1.15 - 0.45) * 0.048 - Math.sin(t * 2.25) * 0.015;

      const tailWag = prefersReducedMotion
        ? 0
        : Math.sin(t * 2.35) * 0.088 + Math.sin(t * 4.7) * 0.016;

      const params: Live2DParams = {
        breath: idleBreath,
        angleX,
        angleY,
        angleZ,
        earL: earBaseL + earFlickL,
        earR: earBaseR + earFlickR,
        tailWag,
        tuftBounce: prefersReducedMotion ? 0 : Math.sin(t * 1.92 - 0.5) * 0.0045,
        bodySway: prefersReducedMotion ? 0 : idleWaveB * 0.014,
        blink,
      };

      ctx2d.clearRect(0, 0, w, h);

      if (glRenderer && glRenderer.render(params)) {
        ctx2d.drawImage(glRenderer.canvas, 0, 0, w, h);
      } else {
        // Fallback smooth 2D Canvas idle breathing/sway if WebGL is unavailable
        ctx2d.save();
        ctx2d.translate(w * 0.5, h * 0.87);
        ctx2d.rotate(params.bodySway + params.angleZ * 0.35);
        ctx2d.scale(1 + params.breath * 0.008, 1 - params.breath * 0.008);
        ctx2d.translate(-w * 0.5, -h * 0.87);
        ctx2d.drawImage(assets.canvas, 0, 0, w, h);
        ctx2d.restore();
      }

      // Draw crisp Live2D vector blinking eyelids
      drawLive2DEyeOverlay(
        ctx2d,
        assets.leftEye,
        w,
        h,
        params,
        assets.lidColor,
        assets.lashColor
      );
      drawLive2DEyeOverlay(
        ctx2d,
        assets.rightEye,
        w,
        h,
        params,
        assets.lidColor,
        assets.lashColor
      );

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      glRenderer?.dispose();
    };
  }, [assets]);

  const inner = !failed ? (
    <canvas
      ref={canvasRef}
      aria-label="Word Fun Charismatic Fox Mascot"
      className={`pointer-events-none relative z-10 w-full h-full object-contain select-none drop-shadow-[0_10px_14px_rgba(15,23,42,0.22)] transition-opacity duration-200 ${
        assets ? 'opacity-100' : 'opacity-0'
      }`}
    />
  ) : (
    <div className="pointer-events-none relative z-10 w-full h-full flex items-center justify-center">
      <Sparkles className="w-16 h-16 text-amber-500" />
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Word Fun Charismatic Fox Mascot"
        className={`relative z-20 flex items-center justify-center bg-transparent border-0 p-0 select-none focus:outline-none ${className}`}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={`relative flex items-center justify-center bg-transparent select-none ${className}`}>
      {inner}
    </div>
  );
};
