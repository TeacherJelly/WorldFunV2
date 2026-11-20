import { DotNode, GameItem, GameMode, GradeLevel, SemesterNumber, UnitNumber } from '../types';
import { DEFAULT_SENTENCE_ITEMS, DEFAULT_SPELLING_ITEMS } from './defaultData';

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

export const GRADES: GradeLevel[] = [1, 2, 3, 4, 5, 6];
export const SEMESTERS: SemesterNumber[] = [1, 2];
export const UNITS: UnitNumber[] = [1, 2, 3, 4];

export const SEMESTER_META: Record<
  SemesterNumber,
  {
    label: string;
    shortLabel: string;
  }
> = {
  1: { label: '1st Semester', shortLabel: 'Sem 1' },
  2: { label: '2nd Semester', shortLabel: 'Sem 2' },
};

export const GRADE_META: Record<
  GradeLevel,
  {
    label: string;
    shortLabel: string;
    suggestedTargetSentence: number;
    suggestedTargetWords: number;
    unitTitles: Record<SemesterNumber, Record<UnitNumber, string>>;
  }
> = {
  1: {
    label: 'Grade 1',
    shortLabel: 'G1',
    suggestedTargetSentence: 3,
    suggestedTargetWords: 3,
    unitTitles: {
      1: {
        1: 'Animals & Pets',
        2: 'Sunny Nature',
        3: 'Yummy Food',
        4: 'Home & Play',
      },
      2: {
        1: 'Pond & Meadow',
        2: 'Colors & Sky',
        3: 'Snack Time',
        4: 'Toys & Stories',
      },
    },
  },
  2: {
    label: 'Grade 2',
    shortLabel: 'G2',
    suggestedTargetSentence: 4,
    suggestedTargetWords: 4,
    unitTitles: {
      1: {
        1: 'Friendly Pets',
        2: 'Garden & Sky',
        3: 'Fun & Music',
        4: 'Sweet Treats',
      },
      2: {
        1: 'Forest Friends',
        2: 'Seasons & Rain',
        3: 'Travel & Wheels',
        4: 'Bakery & Fruit',
      },
    },
  },
  3: {
    label: 'Grade 3',
    shortLabel: 'G3',
    suggestedTargetSentence: 5,
    suggestedTargetWords: 5,
    unitTitles: {
      1: {
        1: 'Wild Animals',
        2: 'Space & Sky',
        3: 'School & Friends',
        4: 'Garden Wonders',
      },
      2: {
        1: 'Ocean & Coast',
        2: 'Stars & Planets',
        3: 'Art & Reading',
        4: 'Harvest Market',
      },
    },
  },
  4: {
    label: 'Grade 4',
    shortLabel: 'G4',
    suggestedTargetSentence: 6,
    suggestedTargetWords: 6,
    unitTitles: {
      1: {
        1: 'Amazing Creatures',
        2: 'Adventure & Travel',
        3: 'Earth & Weather',
        4: 'Tasty Harvest',
      },
      2: {
        1: 'Safari & Arctic',
        2: 'Maps & Horizons',
        3: 'Storms & Sunshine',
        4: 'Orchard & Kitchen',
      },
    },
  },
  5: {
    label: 'Grade 5',
    shortLabel: 'G5',
    suggestedTargetSentence: 6,
    suggestedTargetWords: 7,
    unitTitles: {
      1: {
        1: 'Wildlife & Dino',
        2: 'Science & Space',
        3: 'Creative Arts',
        4: 'Healthy Living',
      },
      2: {
        1: 'Fossils & Habitats',
        2: 'Light & Galaxies',
        3: 'Theater & Music',
        4: 'Fresh Nutrition',
      },
    },
  },
  6: {
    label: 'Grade 6',
    shortLabel: 'G6',
    suggestedTargetSentence: 7,
    suggestedTargetWords: 8,
    unitTitles: {
      1: {
        1: 'Nature Ecosystems',
        2: 'Discovery & Tech',
        3: 'Stories & Culture',
        4: 'World & Earth',
      },
      2: {
        1: 'Oceans & Wildlife',
        2: 'Future & Robotics',
        3: 'Festivals & Heritage',
        4: 'Peaks & Communities',
      },
    },
  },
};

export function getNextUnitOrGrade(
  grade: GradeLevel,
  semester: SemesterNumber,
  unit: UnitNumber
): { grade: GradeLevel; semester: SemesterNumber; unit: UnitNumber; label: string } | null {
  if (unit < 4) {
    const nextUnit = (unit + 1) as UnitNumber;
    return {
      grade,
      semester,
      unit: nextUnit,
      label: `Grade ${grade} · ${SEMESTER_META[semester].shortLabel} · Unit ${nextUnit}`,
    };
  }
  if (semester === 1) {
    return {
      grade,
      semester: 2,
      unit: 1,
      label: `Grade ${grade} · 2nd Semester · Unit 1`,
    };
  }
  if (grade < 6) {
    const nextGrade = (grade + 1) as GradeLevel;
    return {
      grade: nextGrade,
      semester: 1,
      unit: 1,
      label: `Grade ${nextGrade} · 1st Semester · Unit 1`,
    };
  }
  return null;
}

export function extractTokens(item: GameItem): string[] {
  if (item.mode === 'sentence') {
    return item.text
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0);
  }
  return item.text
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
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

export function filterItems(
  items: GameItem[],
  mode: GameMode,
  grade: GradeLevel,
  semester: SemesterNumber,
  unit: UnitNumber,
  targetCount: number
): GameItem[] {
  const modeItems = items.filter(it => it.mode === mode);
  const fallbackPool = mode === 'sentence' ? DEFAULT_SENTENCE_ITEMS : DEFAULT_SPELLING_ITEMS;
  const pool = modeItems.length > 0 ? modeItems : fallbackPool;

  const unitMatches = pool.filter(
    it => it.grade === grade && it.semester === semester && it.unit === unit
  );
  const semMatches = pool.filter(it => it.grade === grade && it.semester === semester);
  const gradeMatches = pool.filter(it => it.grade === grade);
  const activePool =
    unitMatches.length > 0
      ? unitMatches
      : semMatches.length > 0
      ? semMatches
      : gradeMatches.length > 0
      ? gradeMatches
      : pool;

  return [...activePool].sort((a, b) => {
    const lenA =
      mode === 'sentence'
        ? a.text.trim().split(/\s+/).length
        : a.text.replace(/[^A-Za-z0-9]/g, '').length;
    const lenB =
      mode === 'sentence'
        ? b.text.trim().split(/\s+/).length
        : b.text.replace(/[^A-Za-z0-9]/g, '').length;
    return Math.abs(lenA - targetCount) - Math.abs(lenB - targetCount);
  });
}
