import { IllustrationPreset } from '../types';
import { makeSvg } from './svgHelper';

export const SCHOOL_AND_TOY_ILLUSTRATIONS: IllustrationPreset[] = [
  // SCHOOL & HOME (27)
  {
    id: 'pencil',
    label: 'Pencil',
    category: 'School & Home',
    keywords: ['pencil', 'write', 'draw', 'school'],
    imageUrl: makeSvg('#FEF9C3', `
      <g transform="rotate(-45 100 100)">
        <rect x="86" y="42" width="28" height="16" rx="4" fill="#F472B6"/>
        <rect x="86" y="58" width="28" height="84" fill="#FACC15"/>
        <polygon points="86,142 114,142 100,172" fill="#FDE68A"/>
        <polygon points="95,160 105,160 100,172" fill="#1E293B"/>
      </g>
    `),
  },
  {
    id: 'pen',
    label: 'Pen',
    category: 'School & Home',
    keywords: ['pen', 'ink', 'write', 'school'],
    imageUrl: makeSvg('#EFF6FF', `
      <g transform="rotate(-45 100 100)">
        <rect x="88" y="40" width="24" height="100" rx="6" fill="#3B82F6"/>
        <polygon points="88,140 112,140 100,168" fill="#94A3B8"/>
      </g>
    `),
  },
  {
    id: 'crayon',
    label: 'Crayons',
    category: 'School & Home',
    keywords: ['crayon', 'crayons', 'color', 'art', 'draw'],
    imageUrl: makeSvg('#FFF7ED', `
      <rect x="52" y="68" width="24" height="92" rx="4" fill="#EF4444"/><polygon points="52,68 76,68 64,40" fill="#EF4444"/>
      <rect x="88" y="60" width="24" height="100" rx="4" fill="#FACC15"/><polygon points="88,60 112,60 100,32" fill="#FACC15"/>
      <rect x="124" y="68" width="24" height="92" rx="4" fill="#3B82F6"/><polygon points="124,68 148,68 136,40" fill="#3B82F6"/>
    `),
  },
  {
    id: 'paintbrush',
    label: 'Paintbrush',
    category: 'School & Home',
    keywords: ['paintbrush', 'brush', 'paint', 'painting', 'art'],
    imageUrl: makeSvg('#FAF5FF', `
      <g transform="rotate(-45 100 100)">
        <rect x="92" y="88" width="16" height="82" rx="8" fill="#B45309"/>
        <rect x="88" y="72" width="24" height="18" fill="#CBD5E1"/>
        <path d="M84 72 C84 42 100 30 100 30 C100 30 116 42 116 72 Z" fill="#EC4899"/>
      </g>
    `),
  },
  {
    id: 'palette',
    label: 'Paint Palette',
    category: 'School & Home',
    keywords: ['palette', 'paint', 'art', 'color', 'artist'],
    imageUrl: makeSvg('#FFFBEB', `
      <ellipse cx="100" cy="100" rx="58" ry="48" fill="#FDE68A" stroke="#D97706" stroke-width="4"/>
      <circle cx="72" cy="82" r="10" fill="#EF4444"/><circle cx="104" cy="70" r="10" fill="#FACC15"/>
      <circle cx="132" cy="88" r="10" fill="#22C55E"/><circle cx="122" cy="120" r="10" fill="#3B82F6"/>
      <circle cx="74" cy="120" r="10" fill="#FFFBEB"/>
    `),
  },
  {
    id: 'scissors',
    label: 'Scissors',
    category: 'School & Home',
    keywords: ['scissors', 'cut', 'craft', 'school'],
    imageUrl: makeSvg('#EFF6FF', `
      <line x1="76" y1="120" x2="132" y2="44" stroke="#94A3B8" stroke-width="10" stroke-linecap="round"/>
      <line x1="124" y1="120" x2="68" y2="44" stroke="#CBD5E1" stroke-width="10" stroke-linecap="round"/>
      <circle cx="70" cy="136" r="18" fill="none" stroke="#EF4444" stroke-width="8"/>
      <circle cx="130" cy="136" r="18" fill="none" stroke="#EF4444" stroke-width="8"/>
    `),
  },
  {
    id: 'ruler',
    label: 'Ruler',
    category: 'School & Home',
    keywords: ['ruler', 'measure', 'math', 'school'],
    imageUrl: makeSvg('#FEF9C3', `
      <g transform="rotate(-35 100 100)">
        <rect x="34" y="80" width="132" height="40" rx="6" fill="#FACC15" stroke="#CA8A04" stroke-width="4"/>
        <line x1="56" y1="80" x2="56" y2="96" stroke="#78350F" stroke-width="4"/>
        <line x1="80" y1="80" x2="80" y2="102" stroke="#78350F" stroke-width="4"/>
        <line x1="104" y1="80" x2="104" y2="96" stroke="#78350F" stroke-width="4"/>
        <line x1="128" y1="80" x2="128" y2="102" stroke="#78350F" stroke-width="4"/>
      </g>
    `),
  },
  {
    id: 'eraser',
    label: 'Eraser',
    category: 'School & Home',
    keywords: ['eraser', 'rubber', 'school', 'pencil'],
    imageUrl: makeSvg('#FCE7F3', `
      <g transform="rotate(-25 100 100)">
        <rect x="46" y="76" width="64" height="48" rx="8" fill="#F472B6"/>
        <rect x="104" y="76" width="46" height="48" rx="8" fill="#38BDF8"/>
      </g>
    `),
  },
  {
    id: 'glue',
    label: 'Glue Stick',
    category: 'School & Home',
    keywords: ['glue', 'stick', 'craft', 'school'],
    imageUrl: makeSvg('#EDE9FE', `
      <rect x="74" y="70" width="52" height="84" rx="10" fill="#FACC15"/>
      <rect x="78" y="46" width="44" height="24" rx="6" fill="#EF4444"/>
      <rect x="74" y="138" width="52" height="20" rx="6" fill="#3B82F6"/>
    `),
  },
  {
    id: 'backpack',
    label: 'Backpack / Bag',
    category: 'School & Home',
    keywords: ['backpack', 'bag', 'schoolbag', 'school'],
    imageUrl: makeSvg('#EFF6FF', `
      <path d="M84 52 A16 16 0 0 1 116 52" stroke="#1D4ED8" stroke-width="8" fill="none"/>
      <rect x="52" y="54" width="96" height="106" rx="26" fill="#3B82F6"/>
      <rect x="66" y="106" width="68" height="42" rx="12" fill="#FACC15"/>
      <line x1="82" y1="118" x2="118" y2="118" stroke="#B45309" stroke-width="4" stroke-linecap="round"/>
    `),
  },
  {
    id: 'notebook',
    label: 'Notebook',
    category: 'School & Home',
    keywords: ['notebook', 'diary', 'journal', 'knowledge', 'write'],
    imageUrl: makeSvg('#ECFDF5', `
      <rect x="54" y="40" width="94" height="120" rx="10" fill="#10B981"/>
      <rect x="74" y="64" width="54" height="26" rx="4" fill="#FFF"/>
      <circle cx="54" cy="64" r="6" fill="#334155"/><circle cx="54" cy="90" r="6" fill="#334155"/>
      <circle cx="54" cy="116" r="6" fill="#334155"/><circle cx="54" cy="142" r="6" fill="#334155"/>
    `),
  },
  {
    id: 'blackboard',
    label: 'Blackboard / Classroom',
    category: 'School & Home',
    keywords: ['blackboard', 'chalkboard', 'classroom', 'teacher', 'study'],
    imageUrl: makeSvg('#FFFBEB', `
      <rect x="34" y="52" width="132" height="92" rx="10" fill="#065F46" stroke="#B45309" stroke-width="10"/>
      <text x="100" y="108" text-anchor="middle" font-size="30" font-weight="bold" font-family="Fredoka, sans-serif" fill="#FFF">ABC</text>
    `),
  },
  {
    id: 'clock',
    label: 'Clock / Time',
    category: 'School & Home',
    keywords: ['clock', 'time', 'hour', 'watch'],
    imageUrl: makeSvg('#E0F2FE', `
      <circle cx="100" cy="100" r="56" fill="#FFF" stroke="#0EA5E9" stroke-width="10"/>
      <line x1="100" y1="100" x2="100" y2="64" stroke="#1E293B" stroke-width="6" stroke-linecap="round"/>
      <line x1="100" y1="100" x2="130" y2="100" stroke="#EF4444" stroke-width="5" stroke-linecap="round"/>
      <circle cx="100" cy="100" r="6" fill="#1E293B"/>
    `),
  },
  {
    id: 'alarm_clock',
    label: 'Alarm Clock',
    category: 'School & Home',
    keywords: ['alarm', 'wake', 'morning', 'clock'],
    imageUrl: makeSvg('#FEF2F2', `
      <circle cx="62" cy="54" r="16" fill="#EF4444"/><circle cx="138" cy="54" r="16" fill="#EF4444"/>
      <circle cx="100" cy="104" r="48" fill="#EF4444"/><circle cx="100" cy="104" r="36" fill="#FFF"/>
      <line x1="100" y1="104" x2="100" y2="80" stroke="#1E293B" stroke-width="5" stroke-linecap="round"/>
      <line x1="100" y1="104" x2="120" y2="112" stroke="#1E293B" stroke-width="5" stroke-linecap="round"/>
    `),
  },
  {
    id: 'lamp',
    label: 'Lamp / Light',
    category: 'School & Home',
    keywords: ['lamp', 'light', 'desk', 'idea'],
    imageUrl: makeSvg('#FEF9C3', `
      <polygon points="70,48 130,48 148,96 52,96" fill="#FACC15"/>
      <rect x="94" y="96" width="12" height="52" fill="#64748B"/>
      <rect x="70" y="148" width="60" height="12" rx="6" fill="#475569"/>
    `),
  },
  {
    id: 'bed',
    label: 'Bed',
    category: 'School & Home',
    keywords: ['bed', 'bedroom', 'sleep', 'pillow'],
    imageUrl: makeSvg('#EDE9FE', `
      <rect x="36" y="72" width="14" height="84" rx="4" fill="#92400E"/>
      <rect x="150" y="96" width="14" height="60" rx="4" fill="#92400E"/>
      <rect x="44" y="114" width="112" height="28" rx="6" fill="#3B82F6"/>
      <rect x="52" y="96" width="32" height="18" rx="6" fill="#FFF"/>
    `),
  },
  {
    id: 'sofa',
    label: 'Sofa / Couch',
    category: 'School & Home',
    keywords: ['sofa', 'couch', 'living room', 'sit'],
    imageUrl: makeSvg('#FFF7ED', `
      <rect x="44" y="72" width="112" height="50" rx="14" fill="#F97316"/>
      <rect x="34" y="98" width="22" height="44" rx="8" fill="#EA580C"/>
      <rect x="144" y="98" width="22" height="44" rx="8" fill="#EA580C"/>
      <rect x="46" y="118" width="108" height="24" rx="6" fill="#FB923C"/>
    `),
  },
  {
    id: 'chair',
    label: 'Chair',
    category: 'School & Home',
    keywords: ['chair', 'seat', 'sit', 'desk'],
    imageUrl: makeSvg('#FEF3C7', `
      <rect x="64" y="42" width="14" height="122" rx="4" fill="#B45309"/>
      <rect x="122" y="42" width="14" height="62" rx="4" fill="#B45309"/>
      <rect x="64" y="46" width="72" height="26" rx="4" fill="#D97706"/>
      <rect x="62" y="102" width="76" height="16" rx="6" fill="#D97706"/>
      <rect x="122" y="114" width="14" height="50" rx="4" fill="#B45309"/>
    `),
  },
  {
    id: 'key',
    label: 'Key',
    category: 'School & Home',
    keywords: ['key', 'keys', 'unlock', 'door'],
    imageUrl: makeSvg('#FEF9C3', `
      <circle cx="70" cy="100" r="28" fill="none" stroke="#EAB308" stroke-width="14"/>
      <line x1="96" y1="100" x2="162" y2="100" stroke="#EAB308" stroke-width="14" stroke-linecap="round"/>
      <line x1="138" y1="100" x2="138" y2="124" stroke="#EAB308" stroke-width="12" stroke-linecap="round"/>
      <line x1="156" y1="100" x2="156" y2="120" stroke="#EAB308" stroke-width="12" stroke-linecap="round"/>
    `),
  },
  {
    id: 'lock',
    label: 'Lock',
    category: 'School & Home',
    keywords: ['lock', 'safe', 'secret', 'secure'],
    imageUrl: makeSvg('#EFF6FF', `
      <path d="M74 88 L74 64 A26 26 0 0 1 126 64 L126 88" stroke="#64748B" stroke-width="12" fill="none"/>
      <rect x="56" y="88" width="88" height="70" rx="14" fill="#F59E0B"/>
      <circle cx="100" cy="118" r="10" fill="#1E293B"/>
      <rect x="96" y="122" width="8" height="18" rx="3" fill="#1E293B"/>
    `),
  },
  {
    id: 'fridge',
    label: 'Refrigerator / Kitchen',
    category: 'School & Home',
    keywords: ['refrigerator', 'fridge', 'kitchen', 'cold'],
    imageUrl: makeSvg('#E0F2FE', `
      <rect x="62" y="36" width="76" height="128" rx="12" fill="#38BDF8"/>
      <line x1="62" y1="84" x2="138" y2="84" stroke="#0284C7" stroke-width="4"/>
      <line x1="76" y1="54" x2="76" y2="72" stroke="#FFF" stroke-width="5" stroke-linecap="round"/>
      <line x1="76" y1="98" x2="76" y2="126" stroke="#FFF" stroke-width="5" stroke-linecap="round"/>
    `),
  },
  {
    id: 'cooking_pot',
    label: 'Kitchen Pot / Cook',
    category: 'School & Home',
    keywords: ['cook', 'cooking', 'kitchen', 'pot', 'meal'],
    imageUrl: makeSvg('#FFF7ED', `
      <ellipse cx="100" cy="76" rx="48" ry="12" fill="#64748B"/>
      <circle cx="100" cy="60" r="8" fill="#475569"/>
      <rect x="52" y="78" width="96" height="68" rx="16" fill="#EF4444"/>
      <line x1="36" y1="98" x2="52" y2="98" stroke="#475569" stroke-width="8" stroke-linecap="round"/>
      <line x1="148" y1="98" x2="164" y2="98" stroke="#475569" stroke-width="8" stroke-linecap="round"/>
    `),
  },
  {
    id: 'toothbrush',
    label: 'Toothbrush',
    category: 'School & Home',
    keywords: ['toothbrush', 'teeth', 'brush', 'clean'],
    imageUrl: makeSvg('#E0F2FE', `
      <g transform="rotate(-30 100 100)">
        <rect x="34" y="96" width="132" height="14" rx="7" fill="#0EA5E9"/>
        <rect x="122" y="76" width="38" height="20" rx="4" fill="#FFF"/>
        <path d="M126 76 Q142 64 156 76" stroke="#34D399" stroke-width="8" stroke-linecap="round" fill="none"/>
      </g>
    `),
  },
  {
    id: 'soap',
    label: 'Soap & Bubbles',
    category: 'School & Home',
    keywords: ['soap', 'wash', 'bubbles', 'clean', 'bath'],
    imageUrl: makeSvg('#FDF2F8', `
      <rect x="52" y="92" width="96" height="54" rx="24" fill="#F472B6"/>
      <circle cx="74" cy="64" r="14" fill="#BAE6FD" stroke="#38BDF8" stroke-width="3"/>
      <circle cx="118" cy="54" r="18" fill="#BAE6FD" stroke="#38BDF8" stroke-width="3"/>
      <circle cx="140" cy="80" r="10" fill="#BAE6FD" stroke="#38BDF8" stroke-width="3"/>
    `),
  },
  {
    id: 'laptop',
    label: 'Laptop / Computer',
    category: 'School & Home',
    keywords: ['laptop', 'computer', 'coding', 'algorithm', 'tech'],
    imageUrl: makeSvg('#EFF6FF', `
      <rect x="46" y="52" width="108" height="74" rx="8" fill="#1E293B"/>
      <rect x="54" y="60" width="92" height="58" rx="4" fill="#38BDF8"/>
      <polygon points="34,126 166,126 176,144 24,144" fill="#94A3B8"/>
    `),
  },
  {
    id: 'phone',
    label: 'Phone',
    category: 'School & Home',
    keywords: ['phone', 'smartphone', 'call', 'mobile'],
    imageUrl: makeSvg('#F3E8FF', `
      <rect x="66" y="34" width="68" height="132" rx="14" fill="#1E293B"/>
      <rect x="74" y="48" width="52" height="96" rx="6" fill="#38BDF8"/>
      <circle cx="100" cy="154" r="5" fill="#94A3B8"/>
    `),
  },
  {
    id: 'tv',
    label: 'Television',
    category: 'School & Home',
    keywords: ['tv', 'television', 'screen', 'watch'],
    imageUrl: makeSvg('#FEF3C7', `
      <line x1="84" y1="62" x2="66" y2="38" stroke="#475569" stroke-width="5" stroke-linecap="round"/>
      <line x1="116" y1="62" x2="134" y2="38" stroke="#475569" stroke-width="5" stroke-linecap="round"/>
      <rect x="38" y="60" width="124" height="86" rx="14" fill="#334155"/>
      <rect x="48" y="70" width="84" height="66" rx="8" fill="#38BDF8"/>
      <circle cx="146" cy="88" r="6" fill="#FACC15"/><circle cx="146" cy="110" r="6" fill="#EF4444"/>
    `),
  },

  // TOYS & MUSIC (22)
  {
    id: 'piano',
    label: 'Piano / Keyboard',
    category: 'Toys & Music',
    keywords: ['piano', 'keyboard', 'melodies', 'music'],
    imageUrl: makeSvg('#F8FAFC', `
      <rect x="38" y="62" width="124" height="76" rx="8" fill="#1E293B"/>
      <rect x="44" y="68" width="26" height="64" rx="3" fill="#FFF"/>
      <rect x="73" y="68" width="26" height="64" rx="3" fill="#FFF"/>
      <rect x="102" y="68" width="26" height="64" rx="3" fill="#FFF"/>
      <rect x="131" y="68" width="25" height="64" rx="3" fill="#FFF"/>
      <rect x="62" y="68" width="16" height="40" rx="2" fill="#0F172A"/>
      <rect x="91" y="68" width="16" height="40" rx="2" fill="#0F172A"/>
      <rect x="120" y="68" width="16" height="40" rx="2" fill="#0F172A"/>
    `),
  },
  {
    id: 'drum',
    label: 'Drum',
    category: 'Toys & Music',
    keywords: ['drum', 'drums', 'beat', 'music', 'band'],
    imageUrl: makeSvg('#FFF1F2', `
      <line x1="60" y1="42" x2="96" y2="74" stroke="#92400E" stroke-width="6" stroke-linecap="round"/>
      <line x1="140" y1="42" x2="104" y2="74" stroke="#92400E" stroke-width="6" stroke-linecap="round"/>
      <rect x="52" y="84" width="96" height="64" rx="14" fill="#EF4444"/>
      <ellipse cx="100" cy="84" rx="48" ry="14" fill="#FEF9C3"/>
      <path d="M56 106 L80 144 L100 106 L120 144 L144 106" stroke="#FACC15" stroke-width="5" fill="none"/>
    `),
  },
  {
    id: 'trumpet',
    label: 'Trumpet / Horn',
    category: 'Toys & Music',
    keywords: ['trumpet', 'horn', 'brass', 'concert', 'music'],
    imageUrl: makeSvg('#FEF9C3', `
      <rect x="44" y="92" width="74" height="16" rx="6" fill="#F59E0B"/>
      <polygon points="116,92 162,64 162,136 116,108" fill="#FACC15"/>
      <rect x="76" y="76" width="8" height="18" fill="#D97706"/><rect x="92" y="76" width="8" height="18" fill="#D97706"/>
    `),
  },
  {
    id: 'violin',
    label: 'Violin / Guitar',
    category: 'Toys & Music',
    keywords: ['violin', 'cello', 'guitar', 'music', 'concert'],
    imageUrl: makeSvg('#FFF7ED', `
      <rect x="94" y="34" width="12" height="58" rx="4" fill="#451A03"/>
      <circle cx="100" cy="96" r="26" fill="#D97706"/>
      <circle cx="100" cy="132" r="34" fill="#B45309"/>
      <line x1="100" y1="44" x2="100" y2="152" stroke="#FDE68A" stroke-width="3"/>
    `),
  },
  {
    id: 'flute',
    label: 'Flute / Recorder',
    category: 'Toys & Music',
    keywords: ['flute', 'recorder', 'music', 'wind'],
    imageUrl: makeSvg('#E0F2FE', `
      <g transform="rotate(-35 100 100)">
        <rect x="30" y="90" width="140" height="20" rx="8" fill="#94A3B8"/>
        <circle cx="76" cy="100" r="4" fill="#1E293B"/><circle cx="96" cy="100" r="4" fill="#1E293B"/>
        <circle cx="116" cy="100" r="4" fill="#1E293B"/><circle cx="136" cy="100" r="4" fill="#1E293B"/>
      </g>
    `),
  },
  {
    id: 'microphone',
    label: 'Microphone / Sing',
    category: 'Toys & Music',
    keywords: ['microphone', 'sing', 'song', 'karaoke', 'voice'],
    imageUrl: makeSvg('#FAF5FF', `
      <g transform="rotate(-30 100 100)">
        <circle cx="100" cy="66" r="24" fill="#64748B"/>
        <polygon points="88,88 112,88 106,154 94,154" fill="#1E293B"/>
      </g>
    `),
  },
  {
    id: 'headphones',
    label: 'Headphones',
    category: 'Toys & Music',
    keywords: ['headphones', 'listen', 'audio', 'music'],
    imageUrl: makeSvg('#EFF6FF', `
      <path d="M52 110 A48 48 0 0 1 148 110" stroke="#3B82F6" stroke-width="12" fill="none"/>
      <rect x="40" y="100" width="22" height="44" rx="10" fill="#1E293B"/>
      <rect x="138" y="100" width="22" height="44" rx="10" fill="#1E293B"/>
    `),
  },
  {
    id: 'kite',
    label: 'Kite',
    category: 'Toys & Music',
    keywords: ['kite', 'fly', 'wind', 'park'],
    imageUrl: makeSvg('#E0F2FE', `
      <polygon points="100,32 146,84 100,136 54,84" fill="#F43F5E"/>
      <polygon points="100,32 146,84 100,84" fill="#FACC15"/>
      <polygon points="100,84 54,84 100,136" fill="#38BDF8"/>
      <path d="M100 136 Q84 156 106 172" stroke="#64748B" stroke-width="4" fill="none"/>
    `),
  },
  {
    id: 'yoyo',
    label: 'Yo-Yo',
    category: 'Toys & Music',
    keywords: ['yoyo', 'yo-yo', 'toy', 'spin'],
    imageUrl: makeSvg('#FEF2F2', `
      <path d="M100 28 L100 84" stroke="#94A3B8" stroke-width="4"/>
      <circle cx="100" cy="114" r="42" fill="#EF4444"/>
      <circle cx="100" cy="114" r="22" fill="#FACC15"/>
    `),
  },
  {
    id: 'teddy',
    label: 'Teddy Bear Toy',
    category: 'Toys & Music',
    keywords: ['teddy', 'plush', 'toy', 'hug'],
    imageUrl: makeSvg('#FDF2F8', `
      <circle cx="62" cy="56" r="16" fill="#D97706"/><circle cx="138" cy="56" r="16" fill="#D97706"/>
      <circle cx="100" cy="84" r="34" fill="#F59E0B"/>
      <ellipse cx="100" cy="140" rx="38" ry="30" fill="#D97706"/>
      <polygon points="90,114 110,114 100,122" fill="#EF4444"/>
      <circle cx="88" cy="78" r="4.5" fill="#1E293B"/><circle cx="112" cy="78" r="4.5" fill="#1E293B"/>
      <ellipse cx="100" cy="94" rx="14" ry="10" fill="#FDE68A"/>
    `),
  },
  {
    id: 'blocks',
    label: 'Toy Blocks',
    category: 'Toys & Music',
    keywords: ['blocks', 'lego', 'build', 'toy'],
    imageUrl: makeSvg('#EFF6FF', `
      <rect x="44" y="102" width="52" height="52" rx="8" fill="#EF4444"/>
      <rect x="104" y="102" width="52" height="52" rx="8" fill="#3B82F6"/>
      <rect x="74" y="48" width="52" height="52" rx="8" fill="#FACC15"/>
      <text x="100" y="84" text-anchor="middle" font-size="26" font-weight="bold" fill="#78350F">A</text>
    `),
  },
  {
    id: 'puzzle',
    label: 'Puzzle Piece',
    category: 'Toys & Music',
    keywords: ['puzzle', 'game', 'solve', 'think'],
    imageUrl: makeSvg('#ECFDF5', `
      <rect x="58" y="64" width="84" height="84" rx="12" fill="#10B981"/>
      <circle cx="100" cy="58" r="16" fill="#10B981"/>
      <circle cx="146" cy="106" r="16" fill="#10B981"/>
      <circle cx="58" cy="106" r="14" fill="#ECFDF5"/>
    `),
  },
  {
    id: 'robot',
    label: 'Robot',
    category: 'Toys & Music',
    keywords: ['robot', 'robotics', 'machine', 'tech', 'invention'],
    imageUrl: makeSvg('#E0F2FE', `
      <line x1="100" y1="36" x2="100" y2="56" stroke="#64748B" stroke-width="6"/>
      <circle cx="100" cy="34" r="8" fill="#EF4444"/>
      <rect x="56" y="56" width="88" height="68" rx="16" fill="#38BDF8"/>
      <circle cx="80" cy="84" r="10" fill="#FFF"/><circle cx="80" cy="84" r="4" fill="#0F172A"/>
      <circle cx="120" cy="84" r="10" fill="#FFF"/><circle cx="120" cy="84" r="4" fill="#0F172A"/>
      <rect x="78" y="104" width="44" height="10" rx="5" fill="#1E293B"/>
      <rect x="66" y="130" width="68" height="36" rx="10" fill="#0284C7"/>
    `),
  },
  {
    id: 'skateboard',
    label: 'Skateboard',
    category: 'Toys & Music',
    keywords: ['skateboard', 'skate', 'board', 'park'],
    imageUrl: makeSvg('#FFF7ED', `
      <g transform="rotate(-20 100 100)">
        <rect x="34" y="88" width="132" height="20" rx="10" fill="#F97316"/>
        <circle cx="62" cy="116" r="11" fill="#1E293B"/>
        <circle cx="138" cy="116" r="11" fill="#1E293B"/>
      </g>
    `),
  },
  {
    id: 'roller_skate',
    label: 'Roller Skate',
    category: 'Toys & Music',
    keywords: ['skate', 'roller', 'wheels', 'play'],
    imageUrl: makeSvg('#FDF2F8', `
      <path d="M58 54 L94 54 L102 98 L142 104 L142 128 L58 128 Z" fill="#EC4899"/>
      <circle cx="72" cy="142" r="12" fill="#FACC15"/><circle cx="128" cy="142" r="12" fill="#FACC15"/>
    `),
  },
  {
    id: 'balloon',
    label: 'Balloons',
    category: 'Toys & Music',
    keywords: ['balloon', 'balloons', 'party', 'celebrate', 'float'],
    imageUrl: makeSvg('#EFF6FF', `
      <path d="M76 116 Q70 144 80 166" stroke="#94A3B8" stroke-width="3" fill="none"/>
      <path d="M124 116 Q130 144 120 166" stroke="#94A3B8" stroke-width="3" fill="none"/>
      <ellipse cx="76" cy="78" rx="30" ry="38" fill="#EF4444"/>
      <ellipse cx="124" cy="84" rx="30" ry="38" fill="#3B82F6"/>
    `),
  },
  {
    id: 'gift',
    label: 'Gift / Present',
    category: 'Toys & Music',
    keywords: ['gift', 'present', 'box', 'celebrate', 'birthday'],
    imageUrl: makeSvg('#FFF1F2', `
      <rect x="48" y="76" width="104" height="84" rx="10" fill="#F43F5E"/>
      <rect x="42" y="58" width="116" height="24" rx="6" fill="#E11D48"/>
      <rect x="92" y="58" width="16" height="102" fill="#FACC15"/>
      <circle cx="84" cy="46" r="12" fill="none" stroke="#FACC15" stroke-width="7"/>
      <circle cx="116" cy="46" r="12" fill="none" stroke="#FACC15" stroke-width="7"/>
    `),
  },
  {
    id: 'dice',
    label: 'Game Dice',
    category: 'Toys & Music',
    keywords: ['dice', 'game', 'luck', 'roll'],
    imageUrl: makeSvg('#EFF6FF', `
      <rect x="52" y="52" width="96" height="96" rx="20" fill="#FFF" stroke="#CBD5E1" stroke-width="5"/>
      <circle cx="78" cy="78" r="8" fill="#1E293B"/><circle cx="122" cy="78" r="8" fill="#1E293B"/>
      <circle cx="100" cy="100" r="8" fill="#EF4444"/>
      <circle cx="78" cy="122" r="8" fill="#1E293B"/><circle cx="122" cy="122" r="8" fill="#1E293B"/>
    `),
  },
  {
    id: 'chess',
    label: 'Chess Knight',
    category: 'Toys & Music',
    keywords: ['chess', 'knight', 'strategy', 'game'],
    imageUrl: makeSvg('#FEF3C7', `
      <path d="M74 148 L74 114 Q72 72 110 54 L126 74 Q112 88 126 118 L126 148 Z" fill="#1E293B"/>
      <rect x="60" y="148" width="80" height="14" rx="6" fill="#334155"/>
    `),
  },
  {
    id: 'camera',
    label: 'Camera',
    category: 'Toys & Music',
    keywords: ['camera', 'photo', 'picture', 'snapshot'],
    imageUrl: makeSvg('#E0F2FE', `
      <rect x="76" y="48" width="48" height="18" rx="6" fill="#334155"/>
      <rect x="38" y="64" width="124" height="84" rx="16" fill="#475569"/>
      <circle cx="100" cy="106" r="28" fill="#38BDF8" stroke="#FFF" stroke-width="6"/>
      <circle cx="140" cy="82" r="6" fill="#FACC15"/>
    `),
  },
  {
    id: 'pinwheel',
    label: 'Pinwheel',
    category: 'Toys & Music',
    keywords: ['pinwheel', 'wind', 'spin', 'toy'],
    imageUrl: makeSvg('#ECFDF5', `
      <rect x="96" y="96" width="8" height="74" rx="4" fill="#92400E"/>
      <polygon points="100,96 60,56 100,56" fill="#EF4444"/>
      <polygon points="100,96 140,56 140,96" fill="#FACC15"/>
      <polygon points="100,96 140,136 100,136" fill="#3B82F6"/>
      <polygon points="100,96 60,136 60,96" fill="#22C55E"/>
      <circle cx="100" cy="96" r="8" fill="#FFF"/>
    `),
  },
  {
    id: 'magnet',
    label: 'Magnet',
    category: 'Toys & Music',
    keywords: ['magnet', 'science', 'attract'],
    imageUrl: makeSvg('#FEF2F2', `
      <path d="M62 54 L62 114 A38 38 0 0 0 138 114 L138 54" stroke="#EF4444" stroke-width="24" fill="none" stroke-linecap="butt"/>
      <rect x="50" y="48" width="24" height="22" fill="#CBD5E1"/>
      <rect x="126" y="48" width="24" height="22" fill="#CBD5E1"/>
    `),
  },
];
