import { DotNode, GameItem, VocabFolder } from '../types';

export const CANDY_COLORS = [
  { bg: 'from-rose-400 to-rose-600', solid: 'bg-rose-500', border: 'border-rose-200', hex: '#F43F5E', glow: 'rgba(244,63,94,0.45)' },
  { bg: 'from-amber-400 to-orange-500', solid: 'bg-amber-500', border: 'border-amber-200', hex: '#F59E0B', glow: 'rgba(245,158,11,0.45)' },
  { bg: 'from-emerald-400 to-teal-600', solid: 'bg-emerald-500', border: 'border-emerald-200', hex: '#10B981', glow: 'rgba(16,185,129,0.45)' },
  { bg: 'from-sky-400 to-blue-600', solid: 'bg-sky-500', border: 'border-sky-200', hex: '#0EA5E9', glow: 'rgba(14,165,233,0.45)' },
  { bg: 'from-violet-400 to-purple-600', solid: 'bg-violet-500', border: 'border-violet-200', hex: '#8B5CF6', glow: 'rgba(139,92,246,0.45)' },
  { bg: 'from-pink-400 to-fuchsia-600', solid: 'bg-pink-500', border: 'border-pink-200', hex: '#EC4899', glow: 'rgba(236,72,153,0.45)' },
  { bg: 'from-cyan-400 to-teal-500', solid: 'bg-cyan-500', border: 'border-cyan-200', hex: '#06B6D4', glow: 'rgba(6,182,212,0.45)' },
  { bg: 'from-indigo-400 to-blue-600', solid: 'bg-indigo-500', border: 'border-indigo-200', hex: '#6366F1', glow: 'rgba(99,102,241,0.45)' },
];

export function extractTokens(item: GameItem): string[] {
  const words = item.text
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0);
  if (words.length >= 2) {
    return words;
  }
  return item.text
    .replace(/[^A-Za-z0-9]/g, '')
    .split('');
}

/**
 * Generates well-spaced, scrambled dot positions across the playfield,
 * keeping the top-left clue card area unobstructed.
 */
export function generateDotNodes(tokens: string[]): DotNode[] {
  const count = tokens.length;
  const nodes: DotNode[] = [];

  const slotIndices = Array.from({ length: count }, (_, i) => i);
  for (let i = slotIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [slotIndices[i], slotIndices[j]] = [slotIndices[j], slotIndices[i]];
  }

  const attemptsLimit = 220;
  const minDistancePct = count <= 5 ? 24 : count <= 8 ? 19 : 15;

  for (let i = 0; i < count; i++) {
    const spatialSlot = slotIndices[i];
    let bestX = 55;
    let bestY = 55;
    let bestMinDist = -1;

    for (let attempt = 0; attempt < attemptsLimit; attempt++) {
      const angle = (spatialSlot / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.9;
      const rx = 25 + Math.random() * 17;
      const ry = 22 + Math.random() * 17;

      let cx = 56 + Math.cos(angle) * rx + (Math.random() - 0.5) * 14;
      let cy = 53 + Math.sin(angle) * ry + (Math.random() - 0.5) * 14;

      if (cx < 32 && cy < 46) {
        cx = Math.max(34, cx + 22);
      }

      cx = Math.max(14, Math.min(88, cx));
      cy = Math.max(18, Math.min(84, cy));

      let minDist = 999;
      for (const n of nodes) {
        const dx = n.x - cx;
        const dy = n.y - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < minDist) minDist = d;
      }

      if (nodes.length === 0 || minDist >= minDistancePct) {
        bestX = cx;
        bestY = cy;
        break;
      }

      if (minDist > bestMinDist) {
        bestMinDist = minDist;
        bestX = cx;
        bestY = cy;
      }
    }

    nodes.push({
      id: `dot-${i}-${tokens[i]}-${Math.random().toString(36).slice(2, 6)}`,
      text: tokens[i],
      targetIndex: i,
      x: bestX,
      y: bestY,
      colorIndex: i % CANDY_COLORS.length,
    });
  }

  return nodes;
}

export function filterItemsByFolder(
  items: GameItem[],
  folderId: string
): GameItem[] {
  return items.filter(it => it.folderId === folderId);
}

export function getNextPlayableFolder(
  folders: VocabFolder[],
  items: GameItem[],
  currentFolderId: string
): VocabFolder | null {
  if (folders.length <= 1) return null;
  const currentIdx = folders.findIndex(f => f.id === currentFolderId);
  const start = currentIdx >= 0 ? currentIdx : 0;

  for (let offset = 1; offset < folders.length; offset++) {
    const candidate = folders[(start + offset) % folders.length];
    if (items.some(it => it.folderId === candidate.id)) {
      return candidate;
    }
  }
  return null;
}
