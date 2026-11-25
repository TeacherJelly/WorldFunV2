import React, { useEffect, useRef } from 'react';

export type TeamAnimMood =
  | 'idle'
  | 'active_even'
  | 'winning_pull'
  | 'losing_pull'
  | 'won'
  | 'lost';

export type Live2DSceneKey =
  | 'idle'
  | 'left_win_1'
  | 'left_win_2'
  | 'left_celebrate'
  | 'right_win_1'
  | 'right_win_2'
  | 'right_celebrate';

interface Live2DTugOfWarSceneProps {
  shiftPx: number;
  team1Mood: TeamAnimMood;
  team2Mood: TeamAnimMood;
  isActivePlay: boolean;
  lastScorer: 1 | 2 | null;
  team1Score: number;
  team2Score: number;
}

const SCENE_URLS: Record<Live2DSceneKey, string> = {
  idle: '/assets/aistudio/tug_idle.png',
  left_win_1: '/assets/aistudio/tug_left_win_1.png',
  left_win_2: '/assets/aistudio/tug_left_win_2.png',
  left_celebrate: '/assets/aistudio/tug_left_celebrate.png',
  right_win_1: '/assets/aistudio/tug_right_win_1.png',
  right_win_2: '/assets/aistudio/tug_right_win_2.png',
  right_celebrate: '/assets/aistudio/tug_right_celebrate.png',
};

const ALL_KEYS = Object.keys(SCENE_URLS) as Live2DSceneKey[];

const SRC_W = 1344;
const SRC_H = 756;

// Full head-to-toe viewport inside 1344x756 with extra vertical headroom for Sakuga jumps & confetti
const VIEW_X = 12;
const VIEW_Y = 126;
const VIEW_W = 1320;
const VIEW_H = 550;

// Exact eye blink targets in 1344x756 source space for open-eyed characters in tug_idle.png
interface EyeTarget {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  skin: string;
  tilt: number;
}

const IDLE_RIGHT_EYES: { group: number; eyes: EyeTarget[] }[] = [
  {
    group: 0, // R1 (orange shirt)
    eyes: [
      { cx: 819, cy: 336, rx: 14.5, ry: 14.5, skin: 'rgb(252,202,160)', tilt: -0.05 },
      { cx: 873, cy: 337, rx: 13.5, ry: 13.5, skin: 'rgb(252,200,158)', tilt: 0.04 },
    ],
  },
  {
    group: 1, // R2 (blue cap)
    eyes: [
      { cx: 992, cy: 322, rx: 14, ry: 14, skin: 'rgb(250,199,157)', tilt: -0.04 },
      { cx: 1045, cy: 327, rx: 13, ry: 13.5, skin: 'rgb(250,199,157)', tilt: 0.04 },
    ],
  },
  {
    group: 2, // R3 (pink shirt)
    eyes: [
      { cx: 1138, cy: 344, rx: 13.5, ry: 14, skin: 'rgb(253,215,186)', tilt: -0.04 },
      { cx: 1192, cy: 352, rx: 14, ry: 14.5, skin: 'rgb(251,210,181)', tilt: 0.05 },
    ],
  },
];

interface SpriteLayer {
  canvas: HTMLCanvasElement;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  anchorX: number;
  anchorY: number;
}

interface StandingRig {
  kind: 'standing';
  leftTeam: SpriteLayer;
  rightTeam: SpriteLayer;
  knot: SpriteLayer;
  ropeTile: SpriteLayer;
  knotLeftX: number;
  knotRightX: number;
  ropeMidY: number;
}

interface LeftCelebrateRig {
  kind: 'left_celebrate';
  leftJumpers: SpriteLayer; // L1 + L2 disconnected island
  leftL3: SpriteLayer; // L3 holding left side of rope
  knot: SpriteLayer; // Diagonal knot section
  fallenRight: SpriteLayer; // Grounded R1+R2+R3
  ropeTile: SpriteLayer;
  sparkles: SpriteLayer[]; // Floating stars above L1/L2
  dizzySwirl: SpriteLayer | null; // Comic swirl above R2
  ropeLeftCutX: number;
  ropeLeftY: number;
  ropeRightCutX: number;
  ropeRightY: number;
}

interface RightCelebrateRig {
  kind: 'right_celebrate';
  fallenLeft: SpriteLayer; // Grounded L1+L2+L3
  winRight: SpriteLayer; // Jumping R1+R2+R3 + slack rope
  confetti: SpriteLayer[]; // Floating confetti & sparkles
}

type PreparedRig = StandingRig | LeftCelebrateRig | RightCelebrateRig;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function easeOutCubic(t: number): number {
  const u = 1 - clamp(t, 0, 1);
  return 1 - u * u * u;
}

function easeInOutQuad(t: number): number {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function easeOutBack(t: number): number {
  const x = clamp(t, 0, 1);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

/**
 * Asymmetric anime tug-of-war "Wind-up -> Snap Pull -> Taut Hold -> Reset" curve.
 * Returns normalized effort in [-0.28 .. +1.0]:
 *   -0.28 = brief forward wind-up before pulling
 *   +1.00 = snappy backward heave & taut isometric hold
 */
function animeTugCycle(phase01: number): {
  pull: number;
  snapImpact: number;
  stepLift: number;
} {
  const p = ((phase01 % 1) + 1) % 1;
  if (p < 0.20) {
    // Crisp anticipation wind-up
    const u = easeInOutQuad(p / 0.20);
    return { pull: -0.26 * u, snapImpact: 0, stepLift: 0 };
  }
  if (p < 0.42) {
    // Snappy anime power heave
    const u = (p - 0.20) / 0.22;
    const snap = easeOutBack(u);
    return {
      pull: -0.26 + 1.26 * snap,
      snapImpact: Math.sin(u * Math.PI),
      stepLift: Math.sin(u * Math.PI),
    };
  }
  if (p < 0.78) {
    // Firm isometric hold (zero wobble, slight settle)
    const u = (p - 0.42) / 0.36;
    return {
      pull: 1.0 - 0.08 * easeInOutQuad(u),
      snapImpact: Math.max(0, 1 - u * 3.2) * 0.25,
      stepLift: 0,
    };
  }
  // Smooth reset for next heave
  const u = easeInOutQuad((p - 0.78) / 0.22);
  return {
    pull: 0.92 * (1 - u),
    snapImpact: 0,
    stepLift: 0,
  };
}

/**
 * Crisp Sakuga parabolic victory hop with grounded anticipation squash & landing cushion.
 */
function animeSakugaJump(phase01: number): {
  jump01: number;
  scaleX: number;
  scaleY: number;
  tiltSign: number;
} {
  const p = ((phase01 % 1) + 1) % 1;
  if (p < 0.13) {
    // Grounded anticipation crouch before leap
    const u = Math.sin((p / 0.13) * Math.PI);
    return {
      jump01: -0.05 * u,
      scaleX: 1 + 0.036 * u,
      scaleY: 1 - 0.044 * u,
      tiltSign: -0.4 * u,
    };
  }
  if (p < 0.76) {
    // Parabolic air arc with subtle launch stretch
    const u = (p - 0.13) / 0.63;
    const arc = 4 * u * (1 - u);
    const stretch = Math.sin(clamp(u * 2.2, 0, 1) * Math.PI) * 0.03;
    return {
      jump01: arc,
      scaleX: 1 - stretch * 0.6,
      scaleY: 1 + stretch,
      tiltSign: (0.5 - u) * 0.8,
    };
  }
  if (p < 0.91) {
    // Soft landing cushion
    const u = Math.sin(((p - 0.76) / 0.15) * Math.PI);
    return {
      jump01: -0.04 * u,
      scaleX: 1 + 0.032 * u,
      scaleY: 1 - 0.038 * u,
      tiltSign: 0.3 * u,
    };
  }
  return { jump01: 0, scaleX: 1, scaleY: 1, tiltSign: 0 };
}

/**
 * Natural anime eyelid blink envelope in [0..1] (0 = open, 1 = closed).
 */
function computeBlinkAmount(timeSec: number, seed: number): number {
  const period = 3.9 + (seed % 3) * 0.85;
  const t = (timeSec + seed * 1.37) % period;
  // Occasional cute double-blink on second cycle
  const cycleIdx = Math.floor((timeSec + seed * 1.37) / period);
  const isDouble = cycleIdx % 3 === 1;

  const singleBlink = (localT: number) => {
    const dur = 0.145;
    if (localT < 0 || localT > dur) return 0;
    const u = localT / dur;
    if (u < 0.42) return easeOutCubic(u / 0.42);
    if (u < 0.56) return 1;
    return 1 - easeOutCubic((u - 0.56) / 0.44);
  };

  let v = singleBlink(t);
  if (isDouble) {
    v = Math.max(v, singleBlink(t - 0.21));
  }
  return v;
}

function makeSubCanvas(
  src: HTMLCanvasElement | HTMLImageElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, sw);
  c.height = Math.max(1, sh);
  const cx = c.getContext('2d');
  if (cx) {
    cx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
  }
  return c;
}

function makeMaskedCanvas(
  srcData: ImageData,
  mask: Uint8Array,
  targetLabel: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
): HTMLCanvasElement {
  const sw = Math.max(1, maxX - minX + 1);
  const sh = Math.max(1, maxY - minY + 1);
  const c = document.createElement('canvas');
  c.width = sw;
  c.height = sh;
  const cx = c.getContext('2d');
  if (!cx) return c;
  const out = cx.createImageData(sw, sh);
  const s = srcData.data;
  const d = out.data;
  for (let y = 0; y < sh; y++) {
    const sy = minY + y;
    for (let x = 0; x < sw; x++) {
      const sx = minX + x;
      const si = sy * SRC_W + sx;
      if (mask[si] === targetLabel) {
        const si4 = si * 4;
        const di4 = (y * sw + x) * 4;
        d[di4] = s[si4];
        d[di4 + 1] = s[si4 + 1];
        d[di4 + 2] = s[si4 + 2];
        d[di4 + 3] = s[si4 + 3];
      }
    }
  }
  cx.putImageData(out, 0, 0);
  return c;
}

interface ComponentInfo {
  label: number;
  area: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function extractConnectedComponents(
  imgData: ImageData
): { labels: Uint8Array; comps: ComponentInfo[] } {
  const labels = new Uint8Array(SRC_W * SRC_H); // up to 255
  const data = imgData.data;
  const comps: ComponentInfo[] = [];
  const queue = new Int32Array(SRC_W * SRC_H);
  let nextLabel = 1;

  for (let y = 0; y < SRC_H; y++) {
    for (let x = 0; x < SRC_W; x++) {
      const idx = y * SRC_W + x;
      if (labels[idx] !== 0 || data[idx * 4 + 3] <= 15) continue;

      const label = nextLabel < 254 ? nextLabel++ : 254;
      let head = 0;
      let tail = 0;
      queue[tail++] = idx;
      labels[idx] = label;

      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;

      while (head < tail) {
        const cur = queue[head++];
        const cx = cur % SRC_W;
        const cy = (cur / SRC_W) | 0;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        if (cx > 0) {
          const nb = cur - 1;
          if (labels[nb] === 0 && data[nb * 4 + 3] > 15) {
            labels[nb] = label;
            queue[tail++] = nb;
          }
        }
        if (cx + 1 < SRC_W) {
          const nb = cur + 1;
          if (labels[nb] === 0 && data[nb * 4 + 3] > 15) {
            labels[nb] = label;
            queue[tail++] = nb;
          }
        }
        if (cy > 0) {
          const nb = cur - SRC_W;
          if (labels[nb] === 0 && data[nb * 4 + 3] > 15) {
            labels[nb] = label;
            queue[tail++] = nb;
          }
        }
        if (cy + 1 < SRC_H) {
          const nb = cur + SRC_W;
          if (labels[nb] === 0 && data[nb * 4 + 3] > 15) {
            labels[nb] = label;
            queue[tail++] = nb;
          }
        }
      }

      if (label < 254) {
        comps.push({ label, area: tail, minX, maxX, minY, maxY });
      }
    }
  }

  return { labels, comps };
}

function buildPreparedRig(img: HTMLImageElement, key: Live2DSceneKey): PreparedRig {
  const full = makeSubCanvas(img, 0, 0, SRC_W, SRC_H);
  const fctx = full.getContext('2d')!;
  const imgData = fctx.getImageData(0, 0, SRC_W, SRC_H);
  const px = imgData.data;

  // Helper to scan vertical alpha spans in a given X window
  const scanCol = (x: number) => {
    let minY = SRC_H;
    let maxY = -1;
    for (let y = 0; y < SRC_H; y++) {
      if (px[(y * SRC_W + x) * 4 + 3] > 15) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    return { minY, maxY };
  };

  if (key === 'left_celebrate') {
    const { labels, comps } = extractConnectedComponents(imgData);
    // Largest island with minX < 120 is L1 + L2
    const leftJumpComp =
      comps.find(c => c.area > 30000 && c.minX < 150) ?? comps[0];
    // Largest overall island is L3 + rope + fallenRight
    const mainComp =
      comps.reduce((best, c) => (c.area > best.area ? c : best), comps[0]);

    // Sparkles above L1 & L2
    const sparkles: SpriteLayer[] = comps
      .filter(c => c.area >= 120 && c.area < 2000 && c.minY < 260 && c.maxX < 460)
      .map(c => ({
        canvas: makeMaskedCanvas(imgData, labels, c.label, c.minX, c.minY, c.maxX, c.maxY),
        sx: c.minX,
        sy: c.minY,
        sw: c.maxX - c.minX + 1,
        sh: c.maxY - c.minY + 1,
        anchorX: (c.minX + c.maxX) / 2,
        anchorY: (c.minY + c.maxY) / 2,
      }));

    // Comic spiral swirl above R2
    const swirlComp = comps.find(
      c => c.area >= 300 && c.area < 2500 && c.minX > 880 && c.maxX < 1020 && c.minY < 370
    );
    const dizzySwirl: SpriteLayer | null = swirlComp
      ? {
          canvas: makeMaskedCanvas(
            imgData,
            labels,
            swirlComp.label,
            swirlComp.minX,
            swirlComp.minY,
            swirlComp.maxX,
            swirlComp.maxY
          ),
          sx: swirlComp.minX,
          sy: swirlComp.minY,
          sw: swirlComp.maxX - swirlComp.minX + 1,
          sh: swirlComp.maxY - swirlComp.minY + 1,
          anchorX: (swirlComp.minX + swirlComp.maxX) / 2,
          anchorY: (swirlComp.minY + swirlComp.maxY) / 2,
        }
      : null;

    // Preserve L3 + rope + fallenRight plus small accent strokes (L3 cheer lines, R1/R3 sweat drops),
    // excluding only the separately animated leftJumpers, sparkles, and dizzySwirl
    const excludedLabels = new Set<number>([leftJumpComp.label]);
    const sparkleComps = comps.filter(
      c => c.area >= 120 && c.area < 2000 && c.minY < 260 && c.maxX < 460
    );
    sparkleComps.forEach(c => excludedLabels.add(c.label));
    if (swirlComp) excludedLabels.add(swirlComp.label);

    const mainMasked = document.createElement('canvas');
    mainMasked.width = SRC_W;
    mainMasked.height = SRC_H;
    const mmCtx = mainMasked.getContext('2d')!;
    const mmOut = mmCtx.createImageData(SRC_W, SRC_H);
    const md = mmOut.data;
    for (let i = 0; i < SRC_W * SRC_H; i++) {
      const lbl = labels[i];
      if (lbl !== 0 && !excludedLabels.has(lbl)) {
        const i4 = i * 4;
        md[i4] = px[i4];
        md[i4 + 1] = px[i4 + 1];
        md[i4 + 2] = px[i4 + 2];
        md[i4 + 3] = px[i4 + 3];
      }
    }
    mmCtx.putImageData(mmOut, 0, 0);

    // Find clean rope-only column on left of knot (~622) and right of knot (~693)
    let ropeLeftCutX = 622;
    for (let x = 616; x <= 634; x++) {
      const { minY, maxY } = scanCol(x);
      if (minY >= 435 && maxY <= 458) {
        ropeLeftCutX = x;
        break;
      }
    }
    let ropeRightCutX = 693;
    for (let x = 688; x <= 700; x++) {
      const { minY, maxY } = scanCol(x);
      if (minY >= 450 && maxY <= 476) {
        ropeRightCutX = x;
        break;
      }
    }

    const leftRopeSpan = scanCol(ropeLeftCutX);
    const rightRopeSpan = scanCol(ropeRightCutX);
    const ropeLeftY = (leftRopeSpan.minY + leftRopeSpan.maxY) / 2;
    const ropeRightY = (rightRopeSpan.minY + rightRopeSpan.maxY) / 2;

    const l3MinX = Math.max(0, mainComp.minX);
    const l3Sw = Math.max(1, ropeLeftCutX - l3MinX);
    const knotSw = Math.max(1, ropeRightCutX - ropeLeftCutX);
    const rightSw = Math.max(1, SRC_W - ropeRightCutX);

    return {
      kind: 'left_celebrate',
      leftJumpers: {
        canvas: makeMaskedCanvas(
          imgData,
          labels,
          leftJumpComp.label,
          leftJumpComp.minX,
          leftJumpComp.minY,
          leftJumpComp.maxX,
          leftJumpComp.maxY
        ),
        sx: leftJumpComp.minX,
        sy: leftJumpComp.minY,
        sw: leftJumpComp.maxX - leftJumpComp.minX + 1,
        sh: leftJumpComp.maxY - leftJumpComp.minY + 1,
        anchorX: 250,
        anchorY: 590,
      },
      leftL3: {
        canvas: makeSubCanvas(mainMasked, l3MinX, 0, l3Sw, SRC_H),
        sx: l3MinX,
        sy: 0,
        sw: l3Sw,
        sh: SRC_H,
        anchorX: 500,
        anchorY: 592,
      },
      knot: {
        canvas: makeSubCanvas(mainMasked, ropeLeftCutX, 428, knotSw, 118),
        sx: ropeLeftCutX,
        sy: 428,
        sw: knotSw,
        sh: 118,
        anchorX: (ropeLeftCutX + ropeRightCutX) / 2,
        anchorY: (ropeLeftY + ropeRightY) / 2,
      },
      fallenRight: {
        canvas: makeSubCanvas(mainMasked, ropeRightCutX, 0, rightSw, SRC_H),
        sx: ropeRightCutX,
        sy: 0,
        sw: rightSw,
        sh: SRC_H,
        anchorX: 985,
        anchorY: 596,
      },
      ropeTile: {
        canvas: makeSubCanvas(mainMasked, ropeLeftCutX, 434, 10, 26),
        sx: ropeLeftCutX,
        sy: 434,
        sw: 10,
        sh: 26,
        anchorX: 5,
        anchorY: 13,
      },
      sparkles,
      dizzySwirl,
      ropeLeftCutX,
      ropeLeftY,
      ropeRightCutX,
      ropeRightY,
    };
  }

  if (key === 'right_celebrate') {
    const { labels, comps } = extractConnectedComponents(imgData);
    // Fallen Left island (minX < 150, area > 40000)
    const fallenComp =
      comps.find(c => c.area > 40000 && c.minX < 180) ?? comps[0];
    // Winning Right + Rope island (maxX > 1100, area > 40000)
    const winComp =
      comps.find(c => c.area > 40000 && c.maxX > 1000 && c.label !== fallenComp.label) ??
      comps[0];

    // Floating confetti & sparkles around winning right team
    const confetti: SpriteLayer[] = comps
      .filter(
        c =>
          c.area >= 40 &&
          c.area < 2500 &&
          c.label !== fallenComp.label &&
          c.label !== winComp.label &&
          c.minX > 660 &&
          c.maxY < 470
      )
      .map(c => ({
        canvas: makeMaskedCanvas(imgData, labels, c.label, c.minX, c.minY, c.maxX, c.maxY),
        sx: c.minX,
        sy: c.minY,
        sw: c.maxX - c.minX + 1,
        sh: c.maxY - c.minY + 1,
        anchorX: (c.minX + c.maxX) / 2,
        anchorY: (c.minY + c.maxY) / 2,
      }));

    // Keep any small sweat/puff accents on the left side with fallenLeft
    const fallenCanvas = document.createElement('canvas');
    fallenCanvas.width = SRC_W;
    fallenCanvas.height = SRC_H;
    const fCtx = fallenCanvas.getContext('2d')!;
    fCtx.drawImage(
      makeMaskedCanvas(imgData, labels, fallenComp.label, 0, 0, SRC_W - 1, SRC_H - 1),
      0,
      0
    );
    for (const c of comps) {
      if (
        c.label !== fallenComp.label &&
        c.label !== winComp.label &&
        c.maxX <= 680
      ) {
        fCtx.drawImage(
          makeMaskedCanvas(imgData, labels, c.label, c.minX, c.minY, c.maxX, c.maxY),
          c.minX,
          c.minY
        );
      }
    }

    return {
      kind: 'right_celebrate',
      fallenLeft: {
        canvas: fallenCanvas,
        sx: 0,
        sy: 0,
        sw: SRC_W,
        sh: SRC_H,
        anchorX: 350,
        anchorY: 598,
      },
      winRight: {
        canvas: makeMaskedCanvas(
          imgData,
          labels,
          winComp.label,
          winComp.minX,
          winComp.minY,
          winComp.maxX,
          winComp.maxY
        ),
        sx: winComp.minX,
        sy: winComp.minY,
        sw: winComp.maxX - winComp.minX + 1,
        sh: winComp.maxY - winComp.minY + 1,
        anchorX: 1015,
        anchorY: 598,
      },
      confetti,
    };
  }

  // Standing poses: idle, left_win_1, left_win_2, right_win_1, right_win_2
  // Detect exact knot columns in x=636..714 where the hanging bandana extends below y=466
  let knotLeftX = 644;
  let knotRightX = 702;
  const knotCols: number[] = [];
  for (let x = 634; x <= 716; x++) {
    const { maxY } = scanCol(x);
    if (maxY > 466) knotCols.push(x);
  }
  if (knotCols.length >= 10) {
    knotLeftX = Math.max(630, knotCols[0] - 2);
    knotRightX = Math.min(718, knotCols[knotCols.length - 1] + 2);
  }

  // Locate cleanest rope-only strip (12px wide) adjacent to the knot for seamless dynamic rope bridge
  let ropeTileX = knotLeftX - 16;
  let bestSpan = 999;
  for (let x = 616; x <= 724; x++) {
    if (x + 12 >= knotLeftX && x <= knotRightX) continue;
    let ok = true;
    let maxSpan = 0;
    for (let dx = 0; dx < 12; dx++) {
      const { minY, maxY } = scanCol(x + dx);
      const span = maxY - minY;
      if (minY < 430 || maxY > 464 || span <= 0) {
        ok = false;
        break;
      }
      if (span > maxSpan) maxSpan = span;
    }
    if (ok && maxSpan < bestSpan) {
      bestSpan = maxSpan;
      ropeTileX = x;
    }
  }

  const midL = scanCol(knotLeftX - 1);
  const midR = scanCol(knotRightX + 1);
  const ropeMidY =
    midL.maxY > 0 && midR.maxY > 0
      ? (midL.minY + midL.maxY + midR.minY + midR.maxY) / 4
      : 445;

  return {
    kind: 'standing',
    leftTeam: {
      canvas: makeSubCanvas(full, 0, 0, knotLeftX, SRC_H),
      sx: 0,
      sy: 0,
      sw: knotLeftX,
      sh: SRC_H,
      anchorX: 356,
      anchorY: 594,
    },
    rightTeam: {
      canvas: makeSubCanvas(full, knotRightX, 0, SRC_W - knotRightX, SRC_H),
      sx: knotRightX,
      sy: 0,
      sw: SRC_W - knotRightX,
      sh: SRC_H,
      anchorX: 1004,
      anchorY: 594,
    },
    knot: {
      canvas: makeSubCanvas(full, knotLeftX, 426, knotRightX - knotLeftX, 126),
      sx: knotLeftX,
      sy: 426,
      sw: knotRightX - knotLeftX,
      sh: 126,
      anchorX: (knotLeftX + knotRightX) / 2,
      anchorY: ropeMidY,
    },
    ropeTile: {
      canvas: makeSubCanvas(full, ropeTileX, 430, 12, 32),
      sx: ropeTileX,
      sy: 430,
      sw: 12,
      sh: 32,
      anchorX: 6,
      anchorY: 16,
    },
    knotLeftX,
    knotRightX,
    ropeMidY,
  };
}

function drawGroundShadow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  opacity: number
) {
  ctx.save();
  ctx.fillStyle = `rgba(15, 23, 42, ${opacity.toFixed(3)})`;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEyeBlinks(
  ctx: CanvasRenderingContext2D,
  timeSec: number,
  reducedMotion: boolean
) {
  if (reducedMotion) return;
  for (const charGroup of IDLE_RIGHT_EYES) {
    const blink = computeBlinkAmount(timeSec, charGroup.group);
    if (blink <= 0.02) continue;

    for (const eye of charGroup.eyes) {
      ctx.save();
      ctx.translate(eye.cx, eye.cy);
      ctx.rotate(eye.tilt);

      // Clip tightly to the eye oval so eyebrows and hair remain 100% crisp
      ctx.beginPath();
      ctx.ellipse(0, 0, eye.rx, eye.ry, 0, 0, Math.PI * 2);
      ctx.clip();

      // Upper eyelid dropping down smoothly in exact warm skin tone
      const lidBottom = -eye.ry + blink * (eye.ry * 2.08);
      ctx.fillStyle = eye.skin;
      ctx.beginPath();
      ctx.rect(-eye.rx - 2, -eye.ry - 2, eye.rx * 2 + 4, lidBottom + eye.ry + 2);
      ctx.fill();

      // Crisp anime dark-brown upper lash arc along closing eyelid edge
      const curveDip = (blink - 0.5) * 4.5;
      ctx.strokeStyle = '#47291f';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-eye.rx + 2, lidBottom);
      ctx.quadraticCurveTo(0, lidBottom + curveDip, eye.rx - 2, lidBottom);
      ctx.stroke();

      ctx.restore();
    }
  }
}

function drawBraidedRopeBridge(
  ctx: CanvasRenderingContext2D,
  ropeTile: SpriteLayer,
  x0: number,
  y0: number,
  x1: number,
  y1: number
) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return;

  const angle = Math.atan2(dy, dx);
  ctx.save();
  ctx.translate(x0, y0);
  ctx.rotate(angle);

  // Tile the crisp 12px braided rope texture across the exact span
  const tileW = ropeTile.sw;
  const halfH = ropeTile.sh / 2;
  let cursor = -3;
  while (cursor < dist + 3) {
    const drawW = Math.min(tileW, dist + 3 - cursor);
    ctx.drawImage(
      ropeTile.canvas,
      0,
      0,
      drawW,
      ropeTile.sh,
      cursor,
      -halfH,
      drawW,
      ropeTile.sh
    );
    cursor += drawW;
  }
  ctx.restore();
}

function drawLayerWithTransform(
  ctx: CanvasRenderingContext2D,
  layer: SpriteLayer,
  dx: number,
  dy: number,
  rotRad: number,
  scaleX = 1,
  scaleY = 1,
  skewX = 0
) {
  ctx.save();
  ctx.translate(layer.anchorX + dx, layer.anchorY + dy);
  if (rotRad !== 0) ctx.rotate(rotRad);
  if (skewX !== 0) ctx.transform(1, 0, skewX, 1, 0, 0);
  if (scaleX !== 1 || scaleY !== 1) ctx.scale(scaleX, scaleY);
  ctx.translate(-layer.anchorX, -layer.anchorY);
  ctx.drawImage(layer.canvas, layer.sx, layer.sy);
  ctx.restore();
}

export const Live2DTugOfWarScene: React.FC<Live2DTugOfWarSceneProps> = ({
  shiftPx,
  team1Mood,
  team2Mood,
  isActivePlay,
  lastScorer,
  team1Score,
  team2Score,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stateRef = useRef({
    shiftPx,
    team1Mood,
    team2Mood,
    isActivePlay,
    lastScorer,
    team1Score,
    team2Score,
  });
  stateRef.current = {
    shiftPx,
    team1Mood,
    team2Mood,
    isActivePlay,
    lastScorer,
    team1Score,
    team2Score,
  };

  // Shuffle controller for alternating cleanly between variant 1 and variant 2 on active side
  const shuffleRef = useRef<{
    side: 'none' | 'left' | 'right';
    variant: 1 | 2;
    nextShuffleAt: number;
    prevScorer: 1 | 2 | null;
    prevT1Score: number;
    prevT2Score: number;
  }>({
    side: 'none',
    variant: 1,
    nextShuffleAt: 0,
    prevScorer: null,
    prevT1Score: team1Score,
    prevT2Score: team2Score,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const rigs = new Map<Live2DSceneKey, PreparedRig>();

    let cancelled = false;
    ALL_KEYS.forEach(key => {
      const img = new Image();
      img.src = SCENE_URLS[key];
      img.onload = () => {
        if (cancelled) return;
        rigs.set(key, buildPreparedRig(img, key));
      };
    });

    let smoothShift = stateRef.current.shiftPx * 0.3;
    let knotAngleSpring = 0;
    let knotVelSpring = 0;
    let prevArenaShift = smoothShift;
    let activeKey: Live2DSceneKey = 'idle';
    let prevKey: Live2DSceneKey | null = null;
    let crossfade = 1;
    let rafId = 0;
    let lastTs = performance.now();

    const pickTargetSceneKey = (
      now: number
    ): { key: Live2DSceneKey; isActiveEven: boolean } => {
      const {
        team1Mood: m1,
        team2Mood: m2,
        lastScorer: scorer,
        team1Score: s1,
        team2Score: s2,
      } = stateRef.current;
      const sh = shuffleRef.current;

      if (m1 === 'won') {
        sh.side = 'none';
        return { key: 'left_celebrate', isActiveEven: false };
      }
      if (m2 === 'won') {
        sh.side = 'none';
        return { key: 'right_celebrate', isActiveEven: false };
      }

      const targetSide: 'none' | 'left' | 'right' =
        m1 === 'winning_pull' ? 'left' : m2 === 'winning_pull' ? 'right' : 'none';

      if (targetSide === 'none') {
        sh.side = 'none';
        sh.prevScorer = scorer;
        sh.prevT1Score = s1;
        sh.prevT2Score = s2;
        return {
          key: 'idle',
          isActiveEven: m1 === 'active_even' || m2 === 'active_even',
        };
      }

      const scoredChanged =
        scorer !== sh.prevScorer || s1 !== sh.prevT1Score || s2 !== sh.prevT2Score;
      sh.prevScorer = scorer;
      sh.prevT1Score = s1;
      sh.prevT2Score = s2;

      if (sh.side !== targetSide) {
        sh.side = targetSide;
        sh.variant = Math.random() < 0.5 ? 1 : 2;
        sh.nextShuffleAt = now + 1500 + Math.random() * 600;
      } else if (scoredChanged || now >= sh.nextShuffleAt) {
        sh.variant = sh.variant === 1 ? 2 : 1;
        sh.nextShuffleAt = now + 1500 + Math.random() * 600;
      }

      if (targetSide === 'left') {
        return {
          key: sh.variant === 1 ? 'left_win_1' : 'left_win_2',
          isActiveEven: false,
        };
      }
      return {
        key: sh.variant === 1 ? 'right_win_1' : 'right_win_2',
        isActiveEven: false,
      };
    };

    const drawRigScene = (
      rig: PreparedRig,
      sceneKey: Live2DSceneKey,
      alpha: number,
      timeSec: number,
      arenaShift: number,
      isActiveEven: boolean
    ) => {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = alpha;

      if (rig.kind === 'standing') {
        // Breathing curves (smooth 3.4s anime idle breath)
        const breathL = reducedMotion ? 0 : Math.sin(timeSec * 1.85);
        const breathR = reducedMotion ? 0 : Math.sin(timeSec * 1.85 + 0.9);

        // Compute rigid cel motion per side using asymmetric anime keyframe curves
        let leftDx = arenaShift;
        let leftDy = 0;
        let leftRot = 0;
        let leftSkew = 0;
        let leftSx = 1 - breathL * 0.003;
        let leftSy = 1 + breathL * 0.009;

        let rightDx = arenaShift;
        let rightDy = 0;
        let rightRot = 0;
        let rightSkew = 0;
        let rightSx = 1 - breathR * 0.003;
        let rightSy = 1 + breathR * 0.009;

        if (!reducedMotion) {
          if (sceneKey === 'idle' && !isActiveEven) {
            // Calm Live2D idle: subtle grounded breathing + gentle 0.35° sway
            leftRot = Math.sin(timeSec * 1.1) * 0.006;
            rightRot = Math.sin(timeSec * 1.1 + 1.4) * 0.006;
          } else if (sceneKey === 'idle' && isActiveEven) {
            // Active tied standoff: synchronized rhythmic heaves
            const tCycle = animeTugCycle(timeSec / 1.45);
            leftDx += -tCycle.pull * 4.2;
            leftDy += -tCycle.stepLift * 1.8;
            leftRot += -tCycle.pull * 0.022;
            leftSkew += -tCycle.pull * 0.012;

            rightDx += tCycle.pull * 4.2;
            rightDy += -tCycle.stepLift * 1.8;
            rightRot += tCycle.pull * 0.022;
            rightSkew += tCycle.pull * 0.012;
          } else if (sceneKey === 'left_win_1' || sceneKey === 'left_win_2') {
            // Left wins active tug: snappy anime "Heave -> Hold" lean back
            const winCycle = animeTugCycle(timeSec / 1.32);
            leftDx += -winCycle.pull * 6.8;
            leftDy += -winCycle.stepLift * 2.6;
            leftRot += -winCycle.pull * 0.036;
            leftSkew += -winCycle.pull * 0.016;
            leftSy += winCycle.snapImpact * 0.012;

            // Right team reactive recoil synced to Left's power snap (no rubbery wobble)
            const recoil = winCycle.snapImpact;
            const brace = Math.max(0, winCycle.pull) * 0.35;
            rightDx += -recoil * 4.6 + brace * 2.0;
            rightDy += recoil * 1.2;
            rightRot += -recoil * 0.024 + brace * 0.012;
            rightSkew += -recoil * 0.014;
          } else if (sceneKey === 'right_win_1' || sceneKey === 'right_win_2') {
            // Right wins active tug: snappy anime "Heave -> Hold" lean back
            const winCycle = animeTugCycle(timeSec / 1.32);
            rightDx += winCycle.pull * 6.8;
            rightDy += -winCycle.stepLift * 2.6;
            rightRot += winCycle.pull * 0.036;
            rightSkew += winCycle.pull * 0.016;
            rightSy += winCycle.snapImpact * 0.012;

            // Left team reactive recoil synced to Right's power snap
            const recoil = winCycle.snapImpact;
            const brace = Math.max(0, winCycle.pull) * 0.35;
            leftDx += recoil * 4.6 - brace * 2.0;
            leftDy += recoil * 1.2;
            leftRot += recoil * 0.024 - brace * 0.012;
            leftSkew += recoil * 0.014;
          }
        }

        // Ground contact shadows anchored beneath feet
        drawGroundShadow(ctx, 355 + leftDx * 0.7, 599, 215, 11, 0.085);
        drawGroundShadow(ctx, 1005 + rightDx * 0.7, 599, 215, 11, 0.085);

        // Compute exact world positions of rope anchor points on Left and Right sprites
        const leftRopeWorldX = rig.knotLeftX + leftDx - 6;
        const leftRopeWorldY = rig.ropeMidY + leftDy + leftRot * (rig.knotLeftX - rig.leftTeam.anchorX);
        const rightRopeWorldX = rig.knotRightX + rightDx + 6;
        const rightRopeWorldY = rig.ropeMidY + rightDy + rightRot * (rig.knotRightX - rig.rightTeam.anchorX);

        // 1. Continuous braided rope bridge behind the red knot (zero gap!)
        drawBraidedRopeBridge(
          ctx,
          rig.ropeTile,
          leftRopeWorldX,
          leftRopeWorldY,
          rightRopeWorldX,
          rightRopeWorldY
        );

        // 2. Left Team rigid cel sprite
        drawLayerWithTransform(
          ctx,
          rig.leftTeam,
          leftDx,
          leftDy,
          leftRot,
          leftSx,
          leftSy,
          leftSkew
        );

        // 3. Right Team rigid cel sprite + locked anime eye blinking (in idle)
        ctx.save();
        ctx.translate(rig.rightTeam.anchorX + rightDx, rig.rightTeam.anchorY + rightDy);
        if (rightRot !== 0) ctx.rotate(rightRot);
        if (rightSkew !== 0) ctx.transform(1, 0, rightSkew, 1, 0, 0);
        if (rightSx !== 1 || rightSy !== 1) ctx.scale(rightSx, rightSy);
        ctx.translate(-rig.rightTeam.anchorX, -rig.rightTeam.anchorY);
        ctx.drawImage(rig.rightTeam.canvas, rig.rightTeam.sx, rig.rightTeam.sy);
        if (sceneKey === 'idle') {
          drawEyeBlinks(ctx, timeSec, reducedMotion);
        }
        ctx.restore();

        // 4. Center Red Knot with pendulum sway pinned to exact midpoint
        const midX = (leftRopeWorldX + rightRopeWorldX) / 2;
        const midY = (leftRopeWorldY + rightRopeWorldY) / 2;
        const knotDx = midX - rig.knot.anchorX;
        const knotDy = midY - rig.knot.anchorY;
        const knotSway = reducedMotion
          ? 0
          : clamp(knotAngleSpring + Math.sin(timeSec * 2.2) * 0.025, -0.18, 0.18);

        drawLayerWithTransform(ctx, rig.knot, knotDx, knotDy, knotSway);
      } else if (rig.kind === 'left_celebrate') {
        const j12 = reducedMotion ? { jump01: 0, scaleX: 1, scaleY: 1, tiltSign: 0 } : animeSakugaJump(timeSec / 1.15);
        const j3 = reducedMotion ? { jump01: 0, scaleX: 1, scaleY: 1, tiltSign: 0 } : animeSakugaJump(timeSec / 1.15 + 0.42);
        const sigh = reducedMotion ? 0 : Math.sin(timeSec * 2.1);

        const jump12Y = -j12.jump01 * 28;
        const jump3Y = -j3.jump01 * 11;
        const shift = arenaShift * 0.5;

        // Ground contact shadows scaling cleanly with jump height
        drawGroundShadow(
          ctx,
          255 + shift,
          596,
          175 * (1 - j12.jump01 * 0.16),
          10 * (1 - j12.jump01 * 0.18),
          0.095 * (1 - j12.jump01 * 0.35)
        );
        drawGroundShadow(
          ctx,
          505 + shift,
          596,
          105 * (1 - j3.jump01 * 0.12),
          9,
          0.09
        );
        drawGroundShadow(ctx, 985 + shift, 616, 255, 13, 0.085);

        // Slack braided rope joining L3's hand edge to R1's hand edge cleanly
        const l3RopeY = rig.ropeLeftY + jump3Y * 0.7;
        const r1RopeY = rig.ropeRightY;
        drawBraidedRopeBridge(
          ctx,
          rig.ropeTile,
          rig.ropeLeftCutX + shift - 6,
          l3RopeY,
          rig.ropeRightCutX + shift + 6,
          r1RopeY
        );

        // L1 + L2 high Sakuga victory bounce
        drawLayerWithTransform(
          ctx,
          rig.leftJumpers,
          shift,
          jump12Y,
          j12.tiltSign * 0.02,
          j12.scaleX,
          j12.scaleY
        );

        // L3 staggered joyful fist-pump bounce
        drawLayerWithTransform(
          ctx,
          rig.leftL3,
          shift,
          jump3Y,
          j3.tiltSign * 0.014,
          j3.scaleX,
          j3.scaleY
        );

        // Bouncing knot centered along diagonal rope
        const knotMidY = (l3RopeY + r1RopeY) / 2;
        drawLayerWithTransform(
          ctx,
          rig.knot,
          shift,
          knotMidY - rig.knot.anchorY,
          reducedMotion ? 0 : Math.sin(timeSec * 3.4) * 0.045
        );

        // Grounded fallen Right team with gentle exhausted sighing
        drawLayerWithTransform(
          ctx,
          rig.fallenRight,
          shift,
          0,
          reducedMotion ? 0 : Math.sin(timeSec * 1.7) * 0.005,
          1 - sigh * 0.004,
          1 + sigh * 0.011
        );

        // Sparkles twinkling above L1 & L2
        rig.sparkles.forEach((sp, i) => {
          const tw = reducedMotion ? 0 : Math.sin(timeSec * 4.8 + i * 1.9);
          const sc = 1 + tw * 0.12;
          drawLayerWithTransform(
            ctx,
            sp,
            shift,
            jump12Y * 0.45 - tw * 4,
            tw * 0.08,
            sc,
            sc
          );
        });

        // Spinning dizzy comic swirl above R2
        if (rig.dizzySwirl) {
          const rot = reducedMotion ? 0 : timeSec * 2.2;
          const pulse = reducedMotion ? 1 : 1 + Math.sin(timeSec * 4.2) * 0.06;
          drawLayerWithTransform(
            ctx,
            rig.dizzySwirl,
            shift,
            sigh * 1.5,
            rot,
            pulse,
            pulse
          );
        }
      } else if (rig.kind === 'right_celebrate') {
        const jWin = reducedMotion
          ? { jump01: 0, scaleX: 1, scaleY: 1, tiltSign: 0 }
          : animeSakugaJump(timeSec / 1.15);
        const sigh = reducedMotion ? 0 : Math.sin(timeSec * 2.1);
        const shift = arenaShift * 0.5;
        const winJumpY = -jWin.jump01 * 24;

        // Ground contact shadows
        drawGroundShadow(ctx, 355 + shift, 612, 265, 13, 0.085);
        drawGroundShadow(
          ctx,
          1015 + shift,
          608,
          245 * (1 - jWin.jump01 * 0.14),
          12 * (1 - jWin.jump01 * 0.16),
          0.095 * (1 - jWin.jump01 * 0.35)
        );

        // Grounded fallen Left team with gentle exhausted sigh
        drawLayerWithTransform(
          ctx,
          rig.fallenLeft,
          shift,
          0,
          reducedMotion ? 0 : Math.sin(timeSec * 1.6) * 0.005,
          1 - sigh * 0.004,
          1 + sigh * 0.011
        );

        // Winning Right team + slack rope doing crisp Sakuga celebration bounce
        drawLayerWithTransform(
          ctx,
          rig.winRight,
          shift,
          winJumpY,
          jWin.tiltSign * 0.018,
          jWin.scaleX,
          jWin.scaleY
        );

        // Fluttering confetti & sparkles around winners
        rig.confetti.forEach((cf, i) => {
          const ph = timeSec * 3.6 + i * 1.35;
          const bob = reducedMotion ? 0 : Math.sin(ph) * 5.5;
          const drift = reducedMotion ? 0 : Math.cos(ph * 0.7) * 3.0;
          const rot = reducedMotion ? 0 : Math.sin(ph * 0.9) * 0.18;
          const sc = reducedMotion ? 1 : 1 + Math.sin(ph * 1.3) * 0.08;
          drawLayerWithTransform(
            ctx,
            cf,
            shift + drift,
            winJumpY * 0.4 + bob,
            rot,
            sc,
            sc
          );
        });
      }

      ctx.restore();
    };

    const renderFrame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;
      const timeSec = now / 1000;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.max(320, Math.round(rect.width * dpr));
      const targetH = Math.max(110, Math.round(rect.height * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const { shiftPx: curShift, isActivePlay: active, team1Mood: m1, team2Mood: m2 } =
        stateRef.current;

      const lerpRate = reducedMotion ? 1 : 1 - Math.exp(-8.5 * dt);
      const targetShift = curShift * 0.3;
      smoothShift += (targetShift - smoothShift) * lerpRate;

      const { key: desiredKey, isActiveEven } = pickTargetSceneKey(now);
      if (desiredKey !== activeKey && rigs.has(desiredKey)) {
        prevKey = activeKey;
        activeKey = desiredKey;
        crossfade = reducedMotion ? 1 : 0;
      }
      if (crossfade < 1) {
        // Snappy 145ms anime cel pose transition
        crossfade = Math.min(1, crossfade + dt * 6.8);
        if (crossfade >= 1) prevKey = null;
      }

      const arenaShift = smoothShift;
      const shiftAccel = (arenaShift - prevArenaShift) / dt;
      prevArenaShift = arenaShift;

      // Damped pendulum spring for center bandana knot
      if (!reducedMotion) {
        const targetAngle = clamp(
          -shiftAccel * 0.0018 + (active && m1 !== 'won' && m2 !== 'won' ? Math.sin(timeSec * 4.5) * 0.035 : 0),
          -0.22,
          0.22
        );
        const springF = (targetAngle - knotAngleSpring) * 42 - knotVelSpring * 7.5;
        knotVelSpring += springF * dt;
        knotAngleSpring += knotVelSpring * dt;
      } else {
        knotAngleSpring = 0;
        knotVelSpring = 0;
      }

      ctx.clearRect(0, 0, targetW, targetH);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const scale = Math.min(targetW / VIEW_W, targetH / VIEW_H);
      const offsetX = (targetW - VIEW_W * scale) / 2;
      const offsetY = (targetH - VIEW_H * scale) / 2;

      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      ctx.translate(-VIEW_X, -VIEW_Y);

      const prevRig = prevKey ? rigs.get(prevKey) : undefined;
      const activeRig = rigs.get(activeKey);

      if (prevRig && crossfade < 1) {
        const fadeOut = 1 - easeOutCubic(crossfade);
        drawRigScene(prevRig, prevKey!, fadeOut, timeSec, arenaShift, isActiveEven);
      }
      if (activeRig) {
        const fadeIn = prevRig && crossfade < 1 ? easeOutCubic(crossfade) : 1;
        drawRigScene(activeRig, activeKey, fadeIn, timeSec, arenaShift, isActiveEven);
      }

      ctx.restore();
      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Live2D students playing tug of war"
      className="w-full h-full block"
    />
  );
};
