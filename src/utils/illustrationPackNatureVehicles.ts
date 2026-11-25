import { IllustrationPreset } from '../types';
import { makeSvg } from './svgHelper';

export const NATURE_AND_VEHICLE_ILLUSTRATIONS: IllustrationPreset[] = [
  // NATURE & SKY (28)
  {
    id: 'moon',
    label: 'Moon',
    category: 'Nature & Sky',
    keywords: ['moon', 'night', 'sleep', 'crescent', 'sky'],
    imageUrl: makeSvg('#1E1B4B', `
      <circle cx="52" cy="54" r="4" fill="#FDE047"/><circle cx="152" cy="64" r="3" fill="#FDE047"/><circle cx="144" cy="144" r="4" fill="#FDE047"/>
      <path d="M114 44 A56 56 0 1 0 144 138 A44 44 0 1 1 114 44 Z" fill="#FACC15"/>
    `),
  },
  {
    id: 'earth',
    label: 'Earth / World',
    category: 'Nature & Sky',
    keywords: ['earth', 'world', 'globe', 'planet', 'nature'],
    imageUrl: makeSvg('#EFF6FF', `
      <circle cx="100" cy="100" r="60" fill="#0EA5E9"/>
      <path d="M62 74 Q88 64 96 92 Q78 112 60 100 Z" fill="#22C55E"/>
      <path d="M110 86 Q142 82 146 118 Q124 142 106 122 Z" fill="#16A34A"/>
      <circle cx="100" cy="100" r="60" fill="none" stroke="#0284C7" stroke-width="4"/>
    `),
  },
  {
    id: 'volcano',
    label: 'Volcano',
    category: 'Nature & Sky',
    keywords: ['volcano', 'lava', 'mountain', 'eruption'],
    imageUrl: makeSvg('#FFF7ED', `
      <circle cx="100" cy="48" r="14" fill="#94A3B8"/><circle cx="116" cy="42" r="12" fill="#CBD5E1"/>
      <polygon points="32,162 82,78 118,78 168,162" fill="#78350F"/>
      <path d="M84 78 Q94 106 100 94 Q108 116 116 78 Z" fill="#EF4444"/>
      <circle cx="88" cy="62" r="5" fill="#F97316"/><circle cx="114" cy="60" r="5" fill="#FACC15"/>
    `),
  },
  {
    id: 'mountain',
    label: 'Mountains',
    category: 'Nature & Sky',
    keywords: ['mountain', 'mountains', 'hill', 'peak', 'climb', 'landscape'],
    imageUrl: makeSvg('#E0F2FE', `
      <polygon points="28,156 82,58 136,156" fill="#64748B"/>
      <polygon points="84,156 128,74 172,156" fill="#475569"/>
      <polygon points="65,88 82,58 99,88 89,82 82,90 74,82" fill="#FFF"/>
      <polygon points="113,102 128,74 143,102 134,96 128,104 121,96" fill="#FFF"/>
    `),
  },
  {
    id: 'island',
    label: 'Tropical Island',
    category: 'Nature & Sky',
    keywords: ['island', 'beach', 'palm', 'ocean', 'sand'],
    imageUrl: makeSvg('#E0F2FE', `
      <rect x="20" y="138" width="160" height="42" rx="18" fill="#0EA5E9"/>
      <path d="M44 142 A56 30 0 0 1 156 142 Z" fill="#FDE047"/>
      <path d="M104 122 Q92 94 106 70" stroke="#92400E" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M106 70 Q76 58 64 78 M106 70 Q136 58 148 78 M106 70 Q106 44 84 46" stroke="#16A34A" stroke-width="10" stroke-linecap="round" fill="none"/>
    `),
  },
  {
    id: 'wave',
    label: 'Ocean Wave',
    category: 'Nature & Sky',
    keywords: ['wave', 'ocean', 'sea', 'water', 'surf'],
    imageUrl: makeSvg('#EFF6FF', `
      <path d="M26 146 C38 82 96 52 136 74 C156 84 152 108 130 106 C112 104 118 88 128 92 C104 98 92 126 174 146 Z" fill="#0284C7"/>
      <path d="M26 150 Q62 134 100 150 Q138 166 174 150" stroke="#38BDF8" stroke-width="8" stroke-linecap="round" fill="none"/>
    `),
  },
  {
    id: 'waterfall',
    label: 'Waterfall / River',
    category: 'Nature & Sky',
    keywords: ['waterfall', 'river', 'stream', 'water', 'nature'],
    imageUrl: makeSvg('#ECFDF5', `
      <rect x="34" y="48" width="46" height="98" rx="8" fill="#78350F"/>
      <rect x="120" y="48" width="46" height="98" rx="8" fill="#78350F"/>
      <rect x="74" y="54" width="52" height="98" fill="#38BDF8"/>
      <line x1="88" y1="68" x2="88" y2="132" stroke="#E0F2FE" stroke-width="5" stroke-linecap="round"/>
      <line x1="112" y1="74" x2="112" y2="138" stroke="#E0F2FE" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="100" cy="154" rx="54" ry="14" fill="#BAE6FD"/>
    `),
  },
  {
    id: 'cactus',
    label: 'Cactus / Desert',
    category: 'Nature & Sky',
    keywords: ['cactus', 'desert', 'plant', 'dry'],
    imageUrl: makeSvg('#FEF3C7', `
      <rect x="86" y="46" width="28" height="114" rx="14" fill="#16A34A"/>
      <path d="M86 106 L64 106 L64 78" stroke="#16A34A" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M114 96 L136 96 L136 68" stroke="#16A34A" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="100" cy="42" r="8" fill="#F43F5E"/>
    `),
  },
  {
    id: 'leaf',
    label: 'Autumn Leaf',
    category: 'Nature & Sky',
    keywords: ['leaf', 'leaves', 'autumn', 'fall', 'maple'],
    imageUrl: makeSvg('#FFF7ED', `
      <path d="M100 36 C60 56 46 108 100 148 C154 108 140 56 100 36 Z" fill="#F97316"/>
      <line x1="100" y1="54" x2="100" y2="168" stroke="#9A3412" stroke-width="6" stroke-linecap="round"/>
      <line x1="100" y1="90" x2="76" y2="74" stroke="#FED7AA" stroke-width="4" stroke-linecap="round"/>
      <line x1="100" y1="110" x2="124" y2="94" stroke="#FED7AA" stroke-width="4" stroke-linecap="round"/>
    `),
  },
  {
    id: 'acorn',
    label: 'Acorn',
    category: 'Nature & Sky',
    keywords: ['acorn', 'nut', 'oak', 'autumn'],
    imageUrl: makeSvg('#FEF3C7', `
      <path d="M64 82 C64 134 86 158 100 162 C114 158 136 134 136 82 Z" fill="#D97706"/>
      <path d="M54 82 C54 52 146 52 146 82 Z" fill="#78350F"/>
      <line x1="100" y1="52" x2="100" y2="36" stroke="#78350F" stroke-width="8" stroke-linecap="round"/>
    `),
  },
  {
    id: 'clover',
    label: 'Clover / Lucky',
    category: 'Nature & Sky',
    keywords: ['clover', 'lucky', 'green', 'plant'],
    imageUrl: makeSvg('#ECFDF5', `
      <path d="M100 116 Q100 146 112 164" stroke="#15803D" stroke-width="8" stroke-linecap="round" fill="none"/>
      <circle cx="80" cy="76" r="22" fill="#22C55E"/><circle cx="120" cy="76" r="22" fill="#22C55E"/>
      <circle cx="80" cy="112" r="22" fill="#16A34A"/><circle cx="120" cy="112" r="22" fill="#16A34A"/>
    `),
  },
  {
    id: 'sunflower',
    label: 'Sunflower',
    category: 'Nature & Sky',
    keywords: ['sunflower', 'flower', 'yellow', 'summer'],
    imageUrl: makeSvg('#E0F2FE', `
      <rect x="95" y="106" width="10" height="68" rx="5" fill="#16A34A"/>
      <circle cx="100" cy="84" r="46" fill="#FACC15"/>
      <circle cx="100" cy="84" r="26" fill="#78350F"/>
    `),
  },
  {
    id: 'tulip',
    label: 'Tulip',
    category: 'Nature & Sky',
    keywords: ['tulip', 'flower', 'spring', 'garden'],
    imageUrl: makeSvg('#FCE7F3', `
      <rect x="95" y="102" width="10" height="68" rx="5" fill="#16A34A"/>
      <path d="M98 144 Q64 128 66 106 Q86 116 98 144 Z" fill="#22C55E"/>
      <path d="M68 52 C68 106 132 106 132 52 L114 70 L100 46 L86 70 Z" fill="#EC4899"/>
    `),
  },
  {
    id: 'rose',
    label: 'Rose',
    category: 'Nature & Sky',
    keywords: ['rose', 'flower', 'red', 'love'],
    imageUrl: makeSvg('#FFF1F2', `
      <rect x="95" y="98" width="10" height="72" rx="5" fill="#16A34A"/>
      <circle cx="100" cy="76" r="32" fill="#E11D48"/>
      <path d="M100 76 m-18,0 a18,18 0 1,0 36,0 a10,10 0 1,0 -20,0" stroke="#FDA4AF" stroke-width="5" fill="none"/>
    `),
  },
  {
    id: 'snowman',
    label: 'Snowman',
    category: 'Nature & Sky',
    keywords: ['snowman', 'snow', 'winter', 'cold'],
    imageUrl: makeSvg('#DBEAFE', `
      <circle cx="100" cy="134" r="38" fill="#FFF"/>
      <circle cx="100" cy="84" r="26" fill="#FFF"/>
      <rect x="78" y="54" width="44" height="8" rx="4" fill="#1E293B"/>
      <rect x="86" y="34" width="28" height="22" rx="4" fill="#1E293B"/>
      <rect x="76" y="104" width="48" height="10" rx="5" fill="#EF4444"/>
      <polygon points="100,84 122,88 100,92" fill="#F97316"/>
      <circle cx="90" cy="78" r="3.5" fill="#1E293B"/><circle cx="110" cy="78" r="3.5" fill="#1E293B"/>
    `),
  },
  {
    id: 'snowflake',
    label: 'Snowflake / Winter',
    category: 'Nature & Sky',
    keywords: ['snowflake', 'snow', 'winter', 'ice', 'cold'],
    imageUrl: makeSvg('#EFF6FF', `
      <g stroke="#38BDF8" stroke-width="8" stroke-linecap="round">
        <line x1="100" y1="32" x2="100" y2="168"/>
        <line x1="42" y1="66" x2="158" y2="134"/>
        <line x1="158" y1="66" x2="42" y2="134"/>
      </g>
      <circle cx="100" cy="100" r="16" fill="#0EA5E9"/>
    `),
  },
  {
    id: 'lightning',
    label: 'Lightning / Thunder',
    category: 'Nature & Sky',
    keywords: ['lightning', 'thunder', 'storm', 'electric', 'flash'],
    imageUrl: makeSvg('#334155', `
      <circle cx="76" cy="68" r="24" fill="#CBD5E1"/><circle cx="106" cy="58" r="28" fill="#CBD5E1"/><circle cx="132" cy="72" r="22" fill="#CBD5E1"/>
      <polygon points="108,84 82,124 102,124 90,168 128,114 106,114" fill="#FACC15"/>
    `),
  },
  {
    id: 'tornado',
    label: 'Wind / Breeze',
    category: 'Nature & Sky',
    keywords: ['wind', 'breeze', 'tornado', 'air', 'blow'],
    imageUrl: makeSvg('#E0F2FE', `
      <path d="M40 76 L136 76 A14 14 0 1 0 124 54" stroke="#0EA5E9" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M32 106 L156 106 A14 14 0 1 1 144 128" stroke="#38BDF8" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M52 136 L118 136" stroke="#7DD3FC" stroke-width="10" stroke-linecap="round" fill="none"/>
    `),
  },
  {
    id: 'sunrise',
    label: 'Sunrise / Horizon',
    category: 'Nature & Sky',
    keywords: ['sunrise', 'horizon', 'morning', 'dawn'],
    imageUrl: makeSvg('#FEF3C7', `
      <circle cx="100" cy="116" r="42" fill="#F59E0B"/>
      <rect x="24" y="116" width="152" height="54" rx="14" fill="#38BDF8"/>
      <path d="M60 138 Q100 128 140 138" stroke="#FFF" stroke-width="5" stroke-linecap="round" fill="none"/>
    `),
  },
  {
    id: 'sunset',
    label: 'Sunset / Dusk',
    category: 'Nature & Sky',
    keywords: ['sunset', 'evening', 'orange', 'sky'],
    imageUrl: makeSvg('#FCE7F3', `
      <circle cx="100" cy="108" r="40" fill="#FB7185"/>
      <rect x="24" y="120" width="152" height="50" rx="14" fill="#4F46E5"/>
      <line x1="68" y1="136" x2="132" y2="136" stroke="#FDE047" stroke-width="5" stroke-linecap="round"/>
    `),
  },
  {
    id: 'fossil',
    label: 'Fossil',
    category: 'Nature & Sky',
    keywords: ['fossil', 'fossils', 'ancient', 'bone', 'stone'],
    imageUrl: makeSvg('#F1F5F9', `
      <circle cx="100" cy="100" r="56" fill="#CBD5E1"/>
      <path d="M100 100 m-32,0 a32,32 0 1,0 64,0 a20,20 0 1,0 -40,0 a10,10 0 1,0 20,0" stroke="#64748B" stroke-width="7" fill="none" stroke-linecap="round"/>
    `),
  },
  {
    id: 'gem',
    label: 'Gem / Diamond',
    category: 'Nature & Sky',
    keywords: ['gem', 'diamond', 'crystal', 'jewel', 'shiny'],
    imageUrl: makeSvg('#E0F2FE', `
      <polygon points="62,56 138,56 164,92 100,162 36,92" fill="#38BDF8"/>
      <polygon points="62,56 138,56 122,92 78,92" fill="#BAE6FD"/>
      <polygon points="78,92 122,92 100,162" fill="#0284C7"/>
    `),
  },
  {
    id: 'shell',
    label: 'Seashell',
    category: 'Nature & Sky',
    keywords: ['shell', 'seashell', 'beach', 'ocean'],
    imageUrl: makeSvg('#FFF7ED', `
      <path d="M40 122 C40 60 160 60 160 122 L124 152 L76 152 Z" fill="#FDBA74"/>
      <line x1="100" y1="150" x2="64" y2="86" stroke="#EA580C" stroke-width="4"/>
      <line x1="100" y1="150" x2="100" y2="72" stroke="#EA580C" stroke-width="4"/>
      <line x1="100" y1="150" x2="136" y2="86" stroke="#EA580C" stroke-width="4"/>
    `),
  },
  {
    id: 'coral',
    label: 'Coral',
    category: 'Nature & Sky',
    keywords: ['coral', 'reef', 'ocean', 'sea'],
    imageUrl: makeSvg('#E0F2FE', `
      <path d="M100 160 L100 72 M100 112 L68 78 M100 128 L134 92 M68 112 L68 58" stroke="#FB7185" stroke-width="14" stroke-linecap="round" fill="none"/>
    `),
  },
  {
    id: 'rainforest',
    label: 'Rainforest / Jungle',
    category: 'Nature & Sky',
    keywords: ['rainforest', 'jungle', 'ecosystem', 'habitat', 'woods'],
    imageUrl: makeSvg('#DCFCE7', `
      <rect x="64" y="106" width="18" height="58" fill="#78350F"/>
      <rect x="118" y="98" width="18" height="66" fill="#78350F"/>
      <circle cx="72" cy="84" r="38" fill="#16A34A"/>
      <circle cx="128" cy="76" r="40" fill="#22C55E"/>
      <circle cx="100" cy="64" r="32" fill="#15803D"/>
    `),
  },
  {
    id: 'bamboo',
    label: 'Bamboo',
    category: 'Nature & Sky',
    keywords: ['bamboo', 'green', 'panda', 'plant'],
    imageUrl: makeSvg('#ECFDF5', `
      <rect x="78" y="34" width="16" height="44" rx="4" fill="#22C55E"/><rect x="78" y="82" width="16" height="44" rx="4" fill="#16A34A"/><rect x="78" y="130" width="16" height="40" rx="4" fill="#22C55E"/>
      <rect x="112" y="48" width="16" height="44" rx="4" fill="#16A34A"/><rect x="112" y="96" width="16" height="44" rx="4" fill="#22C55E"/><rect x="112" y="144" width="16" height="26" rx="4" fill="#16A34A"/>
    `),
  },
  {
    id: 'pinecone',
    label: 'Pine Tree / Evergreen',
    category: 'Nature & Sky',
    keywords: ['pine', 'evergreen', 'forest', 'mountain'],
    imageUrl: makeSvg('#ECFDF5', `
      <rect x="90" y="140" width="20" height="32" fill="#78350F"/>
      <polygon points="100,32 58,86 142,86" fill="#16A34A"/>
      <polygon points="100,62 46,118 154,118" fill="#15803D"/>
      <polygon points="100,92 38,144 162,144" fill="#166534"/>
    `),
  },
  {
    id: 'starry_night',
    label: 'Night Sky / Eclipse',
    category: 'Nature & Sky',
    keywords: ['universe', 'galaxy', 'cosmos', 'night', 'eclipse'],
    imageUrl: makeSvg('#0F172A', `
      <circle cx="52" cy="54" r="4" fill="#FDE047"/><circle cx="148" cy="48" r="5" fill="#FDE047"/><circle cx="48" cy="144" r="3" fill="#FFF"/>
      <circle cx="100" cy="100" r="36" fill="#FACC15"/>
      <circle cx="114" cy="96" r="32" fill="#0F172A"/>
    `),
  },

  // VEHICLES & SPACE (22)
  {
    id: 'car',
    label: 'Car',
    category: 'Vehicles & Space',
    keywords: ['car', 'cars', 'drive', 'auto', 'vehicle'],
    imageUrl: makeSvg('#EFF6FF', `
      <path d="M56 102 L74 68 L128 68 L146 102 Z" fill="#EF4444"/>
      <rect x="34" y="100" width="132" height="38" rx="14" fill="#DC2626"/>
      <polygon points="78,74 122,74 134,98 66,98" fill="#BAE6FD"/>
      <circle cx="66" cy="140" r="16" fill="#1E293B"/><circle cx="66" cy="140" r="7" fill="#E2E8F0"/>
      <circle cx="134" cy="140" r="16" fill="#1E293B"/><circle cx="134" cy="140" r="7" fill="#E2E8F0"/>
    `),
  },
  {
    id: 'school_bus',
    label: 'School Bus',
    category: 'Vehicles & Space',
    keywords: ['bus', 'school bus', 'ride', 'school'],
    imageUrl: makeSvg('#FEF9C3', `
      <rect x="34" y="66" width="132" height="70" rx="14" fill="#FACC15"/>
      <rect x="46" y="78" width="24" height="24" rx="4" fill="#BAE6FD"/>
      <rect x="78" y="78" width="24" height="24" rx="4" fill="#BAE6FD"/>
      <rect x="110" y="78" width="24" height="24" rx="4" fill="#BAE6FD"/>
      <rect x="140" y="78" width="18" height="28" rx="4" fill="#BAE6FD"/>
      <circle cx="64" cy="140" r="16" fill="#1E293B"/><circle cx="64" cy="140" r="7" fill="#CBD5E1"/>
      <circle cx="136" cy="140" r="16" fill="#1E293B"/><circle cx="136" cy="140" r="7" fill="#CBD5E1"/>
    `),
  },
  {
    id: 'fire_truck',
    label: 'Fire Truck',
    category: 'Vehicles & Space',
    keywords: ['fire truck', 'firetruck', 'emergency', 'siren'],
    imageUrl: makeSvg('#FEF2F2', `
      <rect x="36" y="72" width="90" height="62" rx="8" fill="#EF4444"/>
      <rect x="122" y="84" width="44" height="50" rx="8" fill="#DC2626"/>
      <rect x="132" y="92" width="24" height="20" rx="4" fill="#BAE6FD"/>
      <rect x="44" y="56" width="76" height="10" rx="4" fill="#CBD5E1"/>
      <circle cx="142" cy="78" r="7" fill="#38BDF8"/>
      <circle cx="64" cy="138" r="15" fill="#1E293B"/><circle cx="140" cy="138" r="15" fill="#1E293B"/>
    `),
  },
  {
    id: 'police_car',
    label: 'Police Car',
    category: 'Vehicles & Space',
    keywords: ['police', 'police car', 'patrol', 'siren'],
    imageUrl: makeSvg('#EFF6FF', `
      <rect x="90" y="56" width="20" height="12" rx="4" fill="#EF4444"/>
      <path d="M56 102 L74 68 L128 68 L146 102 Z" fill="#1E293B"/>
      <rect x="34" y="100" width="132" height="38" rx="14" fill="#1E293B"/>
      <rect x="74" y="104" width="52" height="28" fill="#FFF"/>
      <circle cx="66" cy="140" r="16" fill="#0F172A"/><circle cx="134" cy="140" r="16" fill="#0F172A"/>
    `),
  },
  {
    id: 'ambulance',
    label: 'Ambulance',
    category: 'Vehicles & Space',
    keywords: ['ambulance', 'hospital', 'doctor', 'emergency'],
    imageUrl: makeSvg('#ECFDF5', `
      <rect x="34" y="72" width="132" height="64" rx="12" fill="#FFF" stroke="#CBD5E1" stroke-width="3"/>
      <rect x="70" y="88" width="12" height="32" rx="2" fill="#EF4444"/>
      <rect x="60" y="98" width="32" height="12" rx="2" fill="#EF4444"/>
      <rect x="128" y="84" width="28" height="24" rx="4" fill="#BAE6FD"/>
      <circle cx="64" cy="140" r="15" fill="#1E293B"/><circle cx="136" cy="140" r="15" fill="#1E293B"/>
    `),
  },
  {
    id: 'taxi',
    label: 'Taxi',
    category: 'Vehicles & Space',
    keywords: ['taxi', 'cab', 'car', 'city'],
    imageUrl: makeSvg('#FEF9C3', `
      <rect x="86" y="54" width="28" height="12" rx="4" fill="#1E293B"/>
      <path d="M56 102 L74 68 L128 68 L146 102 Z" fill="#FACC15"/>
      <rect x="34" y="100" width="132" height="38" rx="14" fill="#EAB308"/>
      <polygon points="78,74 122,74 134,98 66,98" fill="#BAE6FD"/>
      <circle cx="66" cy="140" r="16" fill="#1E293B"/><circle cx="134" cy="140" r="16" fill="#1E293B"/>
    `),
  },
  {
    id: 'bicycle',
    label: 'Bicycle',
    category: 'Vehicles & Space',
    keywords: ['bicycle', 'bike', 'cycle', 'ride', 'pedal'],
    imageUrl: makeSvg('#ECFDF5', `
      <circle cx="58" cy="126" r="26" fill="none" stroke="#1E293B" stroke-width="6"/>
      <circle cx="142" cy="126" r="26" fill="none" stroke="#1E293B" stroke-width="6"/>
      <path d="M58 126 L94 126 L124 88 L82 88 Z M124 88 L142 126 M82 88 L78 72 M124 88 L130 70" stroke="#0EA5E9" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    `),
  },
  {
    id: 'scooter',
    label: 'Scooter',
    category: 'Vehicles & Space',
    keywords: ['scooter', 'kick', 'ride', 'park'],
    imageUrl: makeSvg('#F0FDFA', `
      <line x1="60" y1="136" x2="132" y2="136" stroke="#0EA5E9" stroke-width="10" stroke-linecap="round"/>
      <line x1="132" y1="136" x2="118" y2="56" stroke="#0284C7" stroke-width="7" stroke-linecap="round"/>
      <line x1="104" y1="56" x2="132" y2="56" stroke="#1E293B" stroke-width="7" stroke-linecap="round"/>
      <circle cx="60" cy="144" r="12" fill="#1E293B"/><circle cx="134" cy="144" r="12" fill="#1E293B"/>
    `),
  },
  {
    id: 'motorcycle',
    label: 'Motorcycle',
    category: 'Vehicles & Space',
    keywords: ['motorcycle', 'motorbike', 'fast', 'ride'],
    imageUrl: makeSvg('#FFF7ED', `
      <circle cx="56" cy="130" r="22" fill="none" stroke="#1E293B" stroke-width="8"/>
      <circle cx="144" cy="130" r="22" fill="none" stroke="#1E293B" stroke-width="8"/>
      <path d="M56 126 L92 94 L126 94 L144 126" stroke="#F97316" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <line x1="118" y1="74" x2="136" y2="94" stroke="#64748B" stroke-width="7" stroke-linecap="round"/>
    `),
  },
  {
    id: 'tractor',
    label: 'Tractor',
    category: 'Vehicles & Space',
    keywords: ['tractor', 'farm', 'field'],
    imageUrl: makeSvg('#ECFCCB', `
      <rect x="60" y="64" width="44" height="44" rx="6" fill="#22C55E"/>
      <rect x="70" y="72" width="24" height="22" rx="3" fill="#BAE6FD"/>
      <rect x="96" y="90" width="54" height="36" rx="8" fill="#16A34A"/>
      <circle cx="72" cy="134" r="26" fill="#1E293B"/><circle cx="72" cy="134" r="12" fill="#FACC15"/>
      <circle cx="140" cy="142" r="16" fill="#1E293B"/><circle cx="140" cy="142" r="7" fill="#FACC15"/>
    `),
  },
  {
    id: 'sailboat',
    label: 'Sailboat / Boat',
    category: 'Vehicles & Space',
    keywords: ['boat', 'sailboat', 'sail', 'sea', 'ocean', 'voyage'],
    imageUrl: makeSvg('#E0F2FE', `
      <line x1="100" y1="38" x2="100" y2="128" stroke="#78350F" stroke-width="6"/>
      <polygon points="104,44 104,118 152,118" fill="#FFF"/>
      <polygon points="96,54 96,118 54,118" fill="#F43F5E"/>
      <polygon points="44,126 156,126 138,156 62,156" fill="#D97706"/>
    `),
  },
  {
    id: 'ship',
    label: 'Ship',
    category: 'Vehicles & Space',
    keywords: ['ship', 'cruise', 'ocean', 'voyage', 'sea'],
    imageUrl: makeSvg('#EFF6FF', `
      <rect x="78" y="48" width="16" height="34" fill="#EF4444"/><rect x="104" y="48" width="16" height="34" fill="#EF4444"/>
      <rect x="58" y="78" width="84" height="36" rx="6" fill="#FFF"/>
      <polygon points="36,112 164,112 146,152 54,152" fill="#1E293B"/>
    `),
  },
  {
    id: 'submarine',
    label: 'Submarine',
    category: 'Vehicles & Space',
    keywords: ['submarine', 'underwater', 'ocean', 'sea'],
    imageUrl: makeSvg('#0284C7', `
      <path d="M100 66 L100 44 L118 44" stroke="#FACC15" stroke-width="7" stroke-linecap="round" fill="none"/>
      <rect x="74" y="64" width="52" height="26" rx="8" fill="#F59E0B"/>
      <ellipse cx="100" cy="112" rx="62" ry="30" fill="#FACC15"/>
      <circle cx="76" cy="112" r="10" fill="#BAE6FD"/><circle cx="104" cy="112" r="10" fill="#BAE6FD"/><circle cx="132" cy="112" r="10" fill="#BAE6FD"/>
    `),
  },
  {
    id: 'helicopter',
    label: 'Helicopter',
    category: 'Vehicles & Space',
    keywords: ['helicopter', 'chopper', 'fly', 'sky'],
    imageUrl: makeSvg('#E0F2FE', `
      <line x1="40" y1="54" x2="160" y2="54" stroke="#1E293B" stroke-width="7" stroke-linecap="round"/>
      <line x1="100" y1="54" x2="100" y2="76" stroke="#475569" stroke-width="7"/>
      <line x1="136" y1="104" x2="172" y2="96" stroke="#F97316" stroke-width="8" stroke-linecap="round"/>
      <ellipse cx="96" cy="106" rx="46" ry="32" fill="#F97316"/>
      <path d="M56 106 A30 22 0 0 1 100 84 L100 110 Z" fill="#BAE6FD"/>
      <line x1="68" y1="148" x2="126" y2="148" stroke="#1E293B" stroke-width="6" stroke-linecap="round"/>
    `),
  },
  {
    id: 'hot_air_balloon',
    label: 'Hot Air Balloon',
    category: 'Vehicles & Space',
    keywords: ['hot air balloon', 'balloon', 'fly', 'adventure'],
    imageUrl: makeSvg('#E0F2FE', `
      <circle cx="100" cy="78" r="46" fill="#F43F5E"/>
      <ellipse cx="100" cy="78" rx="22" ry="46" fill="#FACC15"/>
      <rect x="86" y="144" width="28" height="22" rx="4" fill="#92400E"/>
      <line x1="82" y1="120" x2="88" y2="144" stroke="#64748B" stroke-width="3"/>
      <line x1="118" y1="120" x2="112" y2="144" stroke="#64748B" stroke-width="3"/>
    `),
  },
  {
    id: 'ufo',
    label: 'UFO / Spaceship',
    category: 'Vehicles & Space',
    keywords: ['ufo', 'alien', 'spaceship', 'space'],
    imageUrl: makeSvg('#1E1B4B', `
      <path d="M68 96 A32 32 0 0 1 132 96 Z" fill="#38BDF8"/>
      <ellipse cx="100" cy="104" rx="64" ry="20" fill="#94A3B8"/>
      <circle cx="64" cy="104" r="6" fill="#FACC15"/><circle cx="100" cy="108" r="6" fill="#4ADE80"/><circle cx="136" cy="104" r="6" fill="#FACC15"/>
    `),
  },
  {
    id: 'satellite',
    label: 'Satellite',
    category: 'Vehicles & Space',
    keywords: ['satellite', 'orbit', 'space', 'signal'],
    imageUrl: makeSvg('#0F172A', `
      <rect x="30" y="76" width="44" height="48" rx="4" fill="#3B82F6" stroke="#93C5FD" stroke-width="3"/>
      <rect x="126" y="76" width="44" height="48" rx="4" fill="#3B82F6" stroke="#93C5FD" stroke-width="3"/>
      <rect x="82" y="76" width="36" height="48" rx="8" fill="#E2E8F0"/>
      <path d="M90 128 Q100 148 110 128" stroke="#FACC15" stroke-width="4" fill="none"/>
    `),
  },
  {
    id: 'astronaut',
    label: 'Astronaut',
    category: 'Vehicles & Space',
    keywords: ['astronaut', 'space', 'helmet', 'moon'],
    imageUrl: makeSvg('#1E1B4B', `
      <circle cx="100" cy="100" r="52" fill="#FFF"/>
      <rect x="64" y="74" width="72" height="50" rx="22" fill="#38BDF8"/>
      <ellipse cx="86" cy="92" rx="12" ry="6" fill="#BAE6FD" opacity="0.6"/>
    `),
  },
  {
    id: 'comet',
    label: 'Comet / Meteor',
    category: 'Vehicles & Space',
    keywords: ['comet', 'meteor', 'meteors', 'shooting star', 'space'],
    imageUrl: makeSvg('#1E1B4B', `
      <polygon points="62,126 154,48 112,138" fill="#F97316"/>
      <polygon points="72,118 144,58 104,126" fill="#FACC15"/>
      <circle cx="64" cy="128" r="24" fill="#38BDF8"/>
    `),
  },
  {
    id: 'telescope',
    label: 'Telescope',
    category: 'Vehicles & Space',
    keywords: ['telescope', 'stars', 'space', 'discovery'],
    imageUrl: makeSvg('#EEF2FF', `
      <line x1="100" y1="106" x2="72" y2="164" stroke="#475569" stroke-width="7" stroke-linecap="round"/>
      <line x1="100" y1="106" x2="128" y2="164" stroke="#475569" stroke-width="7" stroke-linecap="round"/>
      <polygon points="50,104 140,62 152,86 60,120" fill="#0284C7"/>
      <circle cx="146" cy="74" r="14" fill="#BAE6FD" stroke="#0369A1" stroke-width="4"/>
    `),
  },
  {
    id: 'traffic_light',
    label: 'Traffic Light',
    category: 'Vehicles & Space',
    keywords: ['traffic', 'signal', 'stop', 'go', 'street'],
    imageUrl: makeSvg('#F1F5F9', `
      <rect x="70" y="32" width="60" height="136" rx="16" fill="#1E293B"/>
      <circle cx="100" cy="60" r="14" fill="#EF4444"/>
      <circle cx="100" cy="100" r="14" fill="#FACC15"/>
      <circle cx="100" cy="140" r="14" fill="#22C55E"/>
    `),
  },
  {
    id: 'saturn',
    label: 'Planet / Saturn',
    category: 'Vehicles & Space',
    keywords: ['planet', 'saturn', 'gravity', 'orbit', 'space'],
    imageUrl: makeSvg('#1E1B4B', `
      <circle cx="100" cy="100" r="38" fill="#F59E0B"/>
      <ellipse cx="100" cy="100" rx="68" ry="18" fill="none" stroke="#FDE047" stroke-width="8" transform="rotate(-18 100 100)"/>
    `),
  },
];
