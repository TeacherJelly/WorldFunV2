import { IllustrationPreset } from '../types';
import { makeSvg } from './svgHelper';

export const LIFE_AND_PLAY_ILLUSTRATIONS: IllustrationPreset[] = [
  // SPORTS & OUTDOOR (16)
  {
    id: 'soccer',
    label: 'Soccer Ball',
    category: 'Sports & Outdoor',
    keywords: ['soccer', 'football', 'kick', 'goal', 'sport'],
    imageUrl: makeSvg('#ECFDF5', `
      <circle cx="100" cy="100" r="56" fill="#FFF" stroke="#1E293B" stroke-width="5"/>
      <polygon points="100,80 120,94 112,118 88,118 80,94" fill="#1E293B"/>
      <polygon points="100,44 114,56 86,56" fill="#1E293B"/>
      <polygon points="52,86 64,74 64,98" fill="#1E293B"/>
      <polygon points="148,86 136,74 136,98" fill="#1E293B"/>
    `),
  },
  {
    id: 'basketball',
    label: 'Basketball',
    category: 'Sports & Outdoor',
    keywords: ['basketball', 'hoop', 'dribble', 'sport'],
    imageUrl: makeSvg('#FFF7ED', `
      <circle cx="100" cy="100" r="56" fill="#F97316" stroke="#9A3412" stroke-width="4"/>
      <line x1="44" y1="100" x2="156" y2="100" stroke="#7C2D12" stroke-width="4"/>
      <line x1="100" y1="44" x2="100" y2="156" stroke="#7C2D12" stroke-width="4"/>
      <path d="M64 56 Q96 100 64 144 M136 56 Q104 100 136 144" stroke="#7C2D12" stroke-width="4" fill="none"/>
    `),
  },
  {
    id: 'baseball',
    label: 'Baseball',
    category: 'Sports & Outdoor',
    keywords: ['baseball', 'bat', 'catch', 'sport'],
    imageUrl: makeSvg('#FEF2F2', `
      <circle cx="100" cy="100" r="54" fill="#FFF" stroke="#CBD5E1" stroke-width="4"/>
      <path d="M70 58 Q92 100 70 142" stroke="#EF4444" stroke-width="5" stroke-dasharray="6 6" fill="none"/>
      <path d="M130 58 Q108 100 130 142" stroke="#EF4444" stroke-width="5" stroke-dasharray="6 6" fill="none"/>
    `),
  },
  {
    id: 'tennis',
    label: 'Tennis Racket',
    category: 'Sports & Outdoor',
    keywords: ['tennis', 'racket', 'sport', 'ball'],
    imageUrl: makeSvg('#ECFCCB', `
      <g transform="rotate(-35 100 100)">
        <ellipse cx="100" cy="76" rx="34" ry="42" fill="none" stroke="#10B981" stroke-width="10"/>
        <rect x="93" y="118" width="14" height="50" rx="6" fill="#1E293B"/>
      </g>
      <circle cx="136" cy="134" r="16" fill="#A3E635"/>
    `),
  },
  {
    id: 'badminton',
    label: 'Badminton',
    category: 'Sports & Outdoor',
    keywords: ['badminton', 'shuttlecock', 'sport', 'feather'],
    imageUrl: makeSvg('#E0F2FE', `
      <polygon points="100,122 66,52 134,52" fill="#FFF" stroke="#CBD5E1" stroke-width="4"/>
      <line x1="84" y1="52" x2="96" y2="120" stroke="#94A3B8" stroke-width="3"/>
      <line x1="116" y1="52" x2="104" y2="120" stroke="#94A3B8" stroke-width="3"/>
      <circle cx="100" cy="134" r="18" fill="#EF4444"/>
    `),
  },
  {
    id: 'goggles',
    label: 'Swimming Goggles',
    category: 'Sports & Outdoor',
    keywords: ['swim', 'swimming', 'goggles', 'pool'],
    imageUrl: makeSvg('#E0F2FE', `
      <line x1="42" y1="100" x2="158" y2="100" stroke="#0284C7" stroke-width="10" stroke-linecap="round"/>
      <rect x="46" y="78" width="46" height="44" rx="16" fill="#38BDF8" stroke="#0369A1" stroke-width="6"/>
      <rect x="108" y="78" width="46" height="44" rx="16" fill="#38BDF8" stroke="#0369A1" stroke-width="6"/>
    `),
  },
  {
    id: 'trophy',
    label: 'Trophy / Winner',
    category: 'Sports & Outdoor',
    keywords: ['trophy', 'win', 'winner', 'champion', 'prize'],
    imageUrl: makeSvg('#FEF9C3', `
      <path d="M56 56 L144 56 L132 108 C126 128 74 128 68 108 Z" fill="#FACC15"/>
      <path d="M56 64 C36 64 36 96 58 96" stroke="#EAB308" stroke-width="8" fill="none"/>
      <path d="M144 64 C164 64 164 96 142 96" stroke="#EAB308" stroke-width="8" fill="none"/>
      <rect x="92" y="122" width="16" height="24" fill="#EAB308"/>
      <rect x="68" y="146" width="64" height="16" rx="6" fill="#B45309"/>
    `),
  },
  {
    id: 'medal',
    label: 'Gold Medal',
    category: 'Sports & Outdoor',
    keywords: ['medal', 'gold', 'award', 'first', 'win'],
    imageUrl: makeSvg('#EFF6FF', `
      <polygon points="74,36 100,96 86,102 58,36" fill="#EF4444"/>
      <polygon points="126,36 100,96 114,102 142,36" fill="#3B82F6"/>
      <circle cx="100" cy="120" r="38" fill="#FACC15" stroke="#D97706" stroke-width="6"/>
      <polygon points="100,98 106,114 122,114 110,124 114,140 100,130 86,140 90,124 78,114 94,114" fill="#FFF"/>
    `),
  },
  {
    id: 'whistle',
    label: 'Whistle',
    category: 'Sports & Outdoor',
    keywords: ['whistle', 'coach', 'blow', 'sport'],
    imageUrl: makeSvg('#F1F5F9', `
      <circle cx="90" cy="110" r="34" fill="#64748B"/>
      <rect x="86" y="76" width="70" height="26" rx="8" fill="#94A3B8"/>
      <circle cx="90" cy="110" r="14" fill="#334155"/>
    `),
  },
  {
    id: 'sneaker',
    label: 'Running Shoe / Sneaker',
    category: 'Sports & Outdoor',
    keywords: ['shoe', 'shoes', 'sneaker', 'run', 'walk', 'sport'],
    imageUrl: makeSvg('#EFF6FF', `
      <path d="M44 128 L44 92 L76 80 L108 106 L156 112 L156 134 L44 134 Z" fill="#3B82F6"/>
      <rect x="42" y="132" width="118" height="16" rx="6" fill="#FFF"/>
      <line x1="88" y1="88" x2="104" y2="102" stroke="#FFF" stroke-width="4" stroke-linecap="round"/>
    `),
  },
  {
    id: 'tent',
    label: 'Camping Tent',
    category: 'Sports & Outdoor',
    keywords: ['tent', 'camp', 'camping', 'sanctuary', 'outdoor'],
    imageUrl: makeSvg('#ECFDF5', `
      <polygon points="32,152 100,52 168,152" fill="#F97316"/>
      <polygon points="78,152 100,104 122,152" fill="#7C2D12"/>
    `),
  },
  {
    id: 'campfire',
    label: 'Campfire',
    category: 'Sports & Outdoor',
    keywords: ['campfire', 'fire', 'warm', 'camp'],
    imageUrl: makeSvg('#1E293B', `
      <path d="M100 44 C76 74 68 100 84 126 C92 134 108 134 116 126 C132 100 124 74 100 44 Z" fill="#F97316"/>
      <path d="M100 72 C88 92 86 112 100 126 C114 112 112 92 100 72 Z" fill="#FACC15"/>
      <rect x="48" y="132" width="104" height="14" rx="7" fill="#92400E" transform="rotate(14 100 138)"/>
      <rect x="48" y="132" width="104" height="14" rx="7" fill="#78350F" transform="rotate(-14 100 138)"/>
    `),
  },
  {
    id: 'compass',
    label: 'Compass',
    category: 'Sports & Outdoor',
    keywords: ['compass', 'direction', 'north', 'explore', 'adventure'],
    imageUrl: makeSvg('#FEF3C7', `
      <circle cx="100" cy="100" r="54" fill="#F59E0B"/>
      <circle cx="100" cy="100" r="42" fill="#FFF"/>
      <polygon points="100,66 112,100 100,100 88,100" fill="#EF4444"/>
      <polygon points="100,134 112,100 100,100 88,100" fill="#3B82F6"/>
    `),
  },
  {
    id: 'map',
    label: 'Treasure Map',
    category: 'Sports & Outdoor',
    keywords: ['map', 'treasure', 'island', 'explore'],
    imageUrl: makeSvg('#FEF9C3', `
      <polygon points="36,56 78,44 122,58 164,46 164,146 122,158 78,144 36,156" fill="#FDE68A" stroke="#B45309" stroke-width="5"/>
      <path d="M56 120 Q88 86 112 108 T140 82" stroke="#D97706" stroke-width="4" stroke-dasharray="6 6" fill="none"/>
      <path d="M132 74 L148 90 M148 74 L132 90" stroke="#EF4444" stroke-width="6" stroke-linecap="round"/>
    `),
  },
  {
    id: 'binoculars',
    label: 'Binoculars',
    category: 'Sports & Outdoor',
    keywords: ['binoculars', 'look', 'see', 'birdwatch', 'safari'],
    imageUrl: makeSvg('#ECFDF5', `
      <rect x="46" y="64" width="44" height="76" rx="14" fill="#334155"/>
      <rect x="110" y="64" width="44" height="76" rx="14" fill="#334155"/>
      <rect x="86" y="88" width="28" height="20" fill="#1E293B"/>
      <circle cx="68" cy="128" r="14" fill="#38BDF8"/><circle cx="132" cy="128" r="14" fill="#38BDF8"/>
    `),
  },
  {
    id: 'lantern',
    label: 'Lantern / Festival Light',
    category: 'Sports & Outdoor',
    keywords: ['lantern', 'festivals', 'festival', 'light', 'night'],
    imageUrl: makeSvg('#FFF1F2', `
      <line x1="100" y1="30" x2="100" y2="50" stroke="#B45309" stroke-width="5"/>
      <ellipse cx="100" cy="96" rx="44" ry="42" fill="#EF4444"/>
      <rect x="78" y="48" width="44" height="10" rx="4" fill="#FACC15"/>
      <rect x="78" y="134" width="44" height="10" rx="4" fill="#FACC15"/>
      <line x1="100" y1="144" x2="100" y2="170" stroke="#F59E0B" stroke-width="6" stroke-linecap="round"/>
    `),
  },

  // CLOTHES & BODY (15)
  {
    id: 'tshirt',
    label: 'T-Shirt',
    category: 'Clothes & Body',
    keywords: ['shirt', 't-shirt', 'clothes', 'wear'],
    imageUrl: makeSvg('#EFF6FF', `
      <polygon points="62,48 138,48 168,78 148,98 134,86 134,156 66,156 66,86 52,98 32,78" fill="#38BDF8"/>
      <path d="M84 48 A16 14 0 0 0 116 48" fill="#EFF6FF"/>
    `),
  },
  {
    id: 'dress',
    label: 'Dress',
    category: 'Clothes & Body',
    keywords: ['dress', 'skirt', 'wear', 'clothes', 'pink'],
    imageUrl: makeSvg('#FDF2F8', `
      <polygon points="74,46 126,46 116,90 152,156 48,156 84,90" fill="#EC4899"/>
      <rect x="78" y="88" width="44" height="8" rx="4" fill="#FACC15"/>
    `),
  },
  {
    id: 'pants',
    label: 'Jeans / Pants',
    category: 'Clothes & Body',
    keywords: ['pants', 'jeans', 'trousers', 'shorts', 'wear'],
    imageUrl: makeSvg('#E0F2FE', `
      <polygon points="62,44 138,44 146,158 112,158 100,98 88,158 54,158" fill="#2563EB"/>
      <rect x="62" y="44" width="76" height="12" fill="#92400E"/>
    `),
  },
  {
    id: 'jacket',
    label: 'Jacket / Coat',
    category: 'Clothes & Body',
    keywords: ['jacket', 'coat', 'sweater', 'warm', 'winter'],
    imageUrl: makeSvg('#FFF7ED', `
      <polygon points="64,46 136,46 162,84 144,102 134,88 134,154 66,154 66,88 56,102 38,84" fill="#F97316"/>
      <line x1="100" y1="54" x2="100" y2="154" stroke="#FFF" stroke-width="4"/>
    `),
  },
  {
    id: 'hat',
    label: 'Sun Hat',
    category: 'Clothes & Body',
    keywords: ['hat', 'sun hat', 'summer', 'beach'],
    imageUrl: makeSvg('#FEF9C3', `
      <path d="M62 110 C62 62 138 62 138 110 Z" fill="#FBBF24"/>
      <ellipse cx="100" cy="112" rx="68" ry="18" fill="#FACC15"/>
      <rect x="64" y="96" width="72" height="10" rx="4" fill="#EF4444"/>
    `),
  },
  {
    id: 'cap',
    label: 'Baseball Cap',
    category: 'Clothes & Body',
    keywords: ['cap', 'hat', 'wear', 'head'],
    imageUrl: makeSvg('#EFF6FF', `
      <path d="M52 116 A48 48 0 0 1 148 116 Z" fill="#3B82F6"/>
      <path d="M52 116 L170 116 Q168 128 138 128 L52 122 Z" fill="#1D4ED8"/>
    `),
  },
  {
    id: 'glasses',
    label: 'Glasses',
    category: 'Clothes & Body',
    keywords: ['glasses', 'eyeglasses', 'read', 'see'],
    imageUrl: makeSvg('#F8FAFC', `
      <circle cx="68" cy="100" r="26" fill="#E0F2FE" stroke="#1E293B" stroke-width="8"/>
      <circle cx="132" cy="100" r="26" fill="#E0F2FE" stroke="#1E293B" stroke-width="8"/>
      <line x1="94" y1="100" x2="106" y2="100" stroke="#1E293B" stroke-width="8"/>
    `),
  },
  {
    id: 'sunglasses',
    label: 'Sunglasses',
    category: 'Clothes & Body',
    keywords: ['sunglasses', 'cool', 'sun', 'summer'],
    imageUrl: makeSvg('#FEF9C3', `
      <rect x="38" y="80" width="52" height="40" rx="14" fill="#1E293B"/>
      <rect x="110" y="80" width="52" height="40" rx="14" fill="#1E293B"/>
      <line x1="90" y1="92" x2="110" y2="92" stroke="#1E293B" stroke-width="8"/>
    `),
  },
  {
    id: 'boots',
    label: 'Rain Boots',
    category: 'Clothes & Body',
    keywords: ['boots', 'rain', 'shoes', 'puddle'],
    imageUrl: makeSvg('#FEF9C3', `
      <path d="M68 48 L108 48 L108 122 L144 128 L144 152 L68 152 Z" fill="#FACC15"/>
      <rect x="64" y="148" width="84" height="12" rx="4" fill="#B45309"/>
    `),
  },
  {
    id: 'socks',
    label: 'Colorful Socks',
    category: 'Clothes & Body',
    keywords: ['sock', 'socks', 'feet', 'warm'],
    imageUrl: makeSvg('#FCE7F3', `
      <path d="M70 46 L106 46 L106 116 L136 130 A16 16 0 0 1 122 158 L70 138 Z" fill="#F43F5E"/>
      <rect x="70" y="58" width="36" height="12" fill="#FACC15"/>
    `),
  },
  {
    id: 'gloves',
    label: 'Mittens / Gloves',
    category: 'Clothes & Body',
    keywords: ['glove', 'gloves', 'mitten', 'winter', 'hands'],
    imageUrl: makeSvg('#E0F2FE', `
      <rect x="64" y="46" width="62" height="92" rx="30" fill="#EF4444"/>
      <rect x="114" y="86" width="32" height="24" rx="12" fill="#EF4444" transform="rotate(-30 130 98)"/>
      <rect x="62" y="132" width="66" height="20" rx="8" fill="#FFF"/>
    `),
  },
  {
    id: 'scarf',
    label: 'Scarf',
    category: 'Clothes & Body',
    keywords: ['scarf', 'winter', 'warm', 'neck'],
    imageUrl: makeSvg('#EFF6FF', `
      <ellipse cx="100" cy="76" rx="48" ry="22" fill="#0EA5E9"/>
      <rect x="108" y="84" width="28" height="72" rx="8" fill="#0284C7"/>
      <rect x="70" y="84" width="26" height="58" rx="8" fill="#38BDF8"/>
    `),
  },
  {
    id: 'umbrella',
    label: 'Umbrella',
    category: 'Clothes & Body',
    keywords: ['umbrella', 'rain', 'rainy', 'wet'],
    imageUrl: makeSvg('#E0F2FE', `
      <path d="M100 100 L100 148 A14 14 0 0 0 128 148" stroke="#78350F" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M36 100 A64 56 0 0 1 164 100 Z" fill="#EC4899"/>
      <line x1="100" y1="36" x2="100" y2="46" stroke="#1E293B" stroke-width="6" stroke-linecap="round"/>
    `),
  },
  {
    id: 'heart',
    label: 'Heart / Love',
    category: 'Clothes & Body',
    keywords: ['heart', 'love', 'like', 'kind', 'friend'],
    imageUrl: makeSvg('#FFF1F2', `
      <path d="M100 156 C52 126 34 94 34 68 C34 44 58 34 78 44 C90 50 96 60 100 66 C104 60 110 50 122 44 C142 34 166 44 166 68 C166 94 148 126 100 156 Z" fill="#F43F5E"/>
    `),
  },
  {
    id: 'hand_wave',
    label: 'Hand / Hello',
    category: 'Clothes & Body',
    keywords: ['hand', 'hello', 'hi', 'wave', 'volunteer', 'help'],
    imageUrl: makeSvg('#FEF9C3', `
      <rect x="64" y="82" width="68" height="68" rx="28" fill="#FBBF24"/>
      <rect x="66" y="42" width="14" height="52" rx="7" fill="#FBBF24"/>
      <rect x="84" y="34" width="14" height="56" rx="7" fill="#FBBF24"/>
      <rect x="102" y="38" width="14" height="54" rx="7" fill="#FBBF24"/>
      <rect x="120" y="52" width="14" height="46" rx="7" fill="#FBBF24"/>
      <rect x="44" y="96" width="28" height="14" rx="7" fill="#FBBF24" transform="rotate(30 58 103)"/>
    `),
  },

  // PEOPLE, PLACES & HOLIDAYS/FANTASY (17)
  {
    id: 'doctor',
    label: 'Doctor / Nurse',
    category: 'People & Places',
    keywords: ['doctor', 'nurse', 'health', 'vitamin', 'protein'],
    imageUrl: makeSvg('#ECFDF5', `
      <path d="M62 56 L62 96 A38 38 0 0 0 138 96 L138 56" stroke="#334155" stroke-width="10" fill="none" stroke-linecap="round"/>
      <line x1="100" y1="134" x2="100" y2="152" stroke="#334155" stroke-width="8"/>
      <circle cx="100" cy="156" r="14" fill="#38BDF8"/>
    `),
  },
  {
    id: 'chef',
    label: 'Chef / Baker',
    category: 'People & Places',
    keywords: ['chef', 'cook', 'baker', 'hat'],
    imageUrl: makeSvg('#FFF7ED', `
      <circle cx="72" cy="74" r="24" fill="#FFF" stroke="#CBD5E1" stroke-width="3"/>
      <circle cx="100" cy="60" r="28" fill="#FFF" stroke="#CBD5E1" stroke-width="3"/>
      <circle cx="128" cy="74" r="24" fill="#FFF" stroke="#CBD5E1" stroke-width="3"/>
      <rect x="64" y="92" width="72" height="56" rx="6" fill="#FFF" stroke="#CBD5E1" stroke-width="3"/>
    `),
  },
  {
    id: 'firefighter',
    label: 'Firefighter Helmet',
    category: 'People & Places',
    keywords: ['firefighter', 'helmet', 'rescue', 'hero'],
    imageUrl: makeSvg('#FEF2F2', `
      <path d="M52 118 A48 48 0 0 1 148 118 Z" fill="#EF4444"/>
      <ellipse cx="100" cy="120" rx="64" ry="14" fill="#DC2626"/>
      <polygon points="100,72 116,96 84,96" fill="#FACC15"/>
    `),
  },
  {
    id: 'scientist',
    label: 'Science / Discovery',
    category: 'People & Places',
    keywords: ['science', 'scientist', 'experiment', 'invention', 'discovery'],
    imageUrl: makeSvg('#EFF6FF', `
      <rect x="86" y="38" width="28" height="36" fill="#BAE6FD" stroke="#0284C7" stroke-width="5"/>
      <polygon points="86,74 114,74 148,154 52,154" fill="#38BDF8" stroke="#0284C7" stroke-width="5" stroke-linejoin="round"/>
      <polygon points="70,116 130,116 144,150 56,150" fill="#10B981"/>
    `),
  },
  {
    id: 'school_building',
    label: 'School Building',
    category: 'People & Places',
    keywords: ['school', 'community', 'building', 'classroom'],
    imageUrl: makeSvg('#FEF3C7', `
      <polygon points="100,40 44,84 156,84" fill="#EF4444"/>
      <rect x="50" y="84" width="100" height="76" fill="#FDE68A"/>
      <circle cx="100" cy="68" r="10" fill="#FFF"/>
      <rect x="86" y="118" width="28" height="42" fill="#92400E"/>
      <rect x="60" y="96" width="18" height="18" fill="#38BDF8"/><rect x="122" y="96" width="18" height="18" fill="#38BDF8"/>
    `),
  },
  {
    id: 'hospital',
    label: 'Hospital',
    category: 'People & Places',
    keywords: ['hospital', 'clinic', 'health', 'city'],
    imageUrl: makeSvg('#ECFDF5', `
      <rect x="46" y="48" width="108" height="112" rx="10" fill="#FFF" stroke="#CBD5E1" stroke-width="4"/>
      <rect x="92" y="64" width="16" height="42" rx="3" fill="#EF4444"/>
      <rect x="79" y="77" width="42" height="16" rx="3" fill="#EF4444"/>
      <rect x="82" y="122" width="36" height="38" rx="4" fill="#38BDF8"/>
    `),
  },
  {
    id: 'castle',
    label: 'Castle',
    category: 'People & Places',
    keywords: ['castle', 'palace', 'kingdom', 'heritage'],
    imageUrl: makeSvg('#EDE9FE', `
      <rect x="46" y="68" width="24" height="92" fill="#C4B5FD"/><polygon points="42,68 58,40 74,68" fill="#EF4444"/>
      <rect x="130" y="68" width="24" height="92" fill="#C4B5FD"/><polygon points="126,68 142,40 158,68" fill="#EF4444"/>
      <rect x="68" y="88" width="64" height="72" fill="#DDD6FE"/>
      <path d="M86 160 L86 126 A14 14 0 0 1 114 126 L114 160 Z" fill="#78350F"/>
    `),
  },
  {
    id: 'lighthouse',
    label: 'Lighthouse',
    category: 'People & Places',
    keywords: ['lighthouse', 'ocean', 'coast', 'light'],
    imageUrl: makeSvg('#E0F2FE', `
      <polygon points="82,66 118,66 128,162 72,162" fill="#FFF"/>
      <polygon points="78,94 122,94 124,118 76,118" fill="#EF4444"/>
      <rect x="84" y="44" width="32" height="22" fill="#FACC15"/>
      <polygon points="78,44 100,26 122,44" fill="#EF4444"/>
    `),
  },
  {
    id: 'ferris_wheel',
    label: 'Ferris Wheel / Park',
    category: 'People & Places',
    keywords: ['ferris', 'carnival', 'amusement', 'park'],
    imageUrl: makeSvg('#EFF6FF', `
      <line x1="100" y1="92" x2="66" y2="162" stroke="#64748B" stroke-width="7"/>
      <line x1="100" y1="92" x2="134" y2="162" stroke="#64748B" stroke-width="7"/>
      <circle cx="100" cy="92" r="50" fill="none" stroke="#EC4899" stroke-width="6"/>
      <circle cx="100" cy="42" r="9" fill="#FACC15"/><circle cx="100" cy="142" r="9" fill="#3B82F6"/>
      <circle cx="50" cy="92" r="9" fill="#10B981"/><circle cx="150" cy="92" r="9" fill="#F97316"/>
    `),
  },
  {
    id: 'circus',
    label: 'Theater / Circus Tent',
    category: 'People & Places',
    keywords: ['circus', 'theater', 'show', 'stage'],
    imageUrl: makeSvg('#FEF2F2', `
      <polygon points="38,94 100,40 162,94" fill="#EF4444"/>
      <rect x="46" y="94" width="108" height="66" fill="#FFF"/>
      <rect x="66" y="94" width="24" height="66" fill="#EF4444"/><rect x="110" y="94" width="24" height="66" fill="#EF4444"/>
    `),
  },
  {
    id: 'pumpkin',
    label: 'Pumpkin / Halloween',
    category: 'Holidays & Magic',
    keywords: ['pumpkin', 'halloween', 'autumn', 'orange'],
    imageUrl: makeSvg('#FFF7ED', `
      <rect x="94" y="42" width="12" height="22" rx="4" fill="#16A34A"/>
      <ellipse cx="100" cy="112" rx="58" ry="44" fill="#F97316"/>
      <polygon points="74,98 84,84 94,98" fill="#1E293B"/>
      <polygon points="106,98 116,84 126,98" fill="#1E293B"/>
      <path d="M74 122 Q100 138 126 122" stroke="#1E293B" stroke-width="6" fill="none" stroke-linecap="round"/>
    `),
  },
  {
    id: 'ghost',
    label: 'Friendly Ghost',
    category: 'Holidays & Magic',
    keywords: ['ghost', 'spooky', 'boo', 'halloween'],
    imageUrl: makeSvg('#312E81', `
      <path d="M56 154 L56 94 A44 44 0 0 1 144 94 L144 154 L126 138 L110 154 L90 138 L74 154 Z" fill="#FFF"/>
      <circle cx="84" cy="92" r="7" fill="#1E293B"/><circle cx="116" cy="92" r="7" fill="#1E293B"/>
      <circle cx="100" cy="112" r="8" fill="#1E293B"/>
    `),
  },
  {
    id: 'christmas_tree',
    label: 'Christmas Tree',
    category: 'Holidays & Magic',
    keywords: ['christmas', 'holiday', 'tradition', 'santa'],
    imageUrl: makeSvg('#EFF6FF', `
      <rect x="88" y="138" width="24" height="28" fill="#78350F"/>
      <polygon points="100,38 56,92 144,92" fill="#16A34A"/>
      <polygon points="100,66 44,120 156,120" fill="#15803D"/>
      <polygon points="100,92 36,144 164,144" fill="#166534"/>
      <circle cx="100" cy="34" r="9" fill="#FACC15"/>
      <circle cx="86" cy="108" r="6" fill="#EF4444"/><circle cx="118" cy="128" r="6" fill="#38BDF8"/>
    `),
  },
  {
    id: 'santa_hat',
    label: 'Holiday Hat',
    category: 'Holidays & Magic',
    keywords: ['santa', 'christmas', 'winter', 'holiday'],
    imageUrl: makeSvg('#FEF2F2', `
      <path d="M48 128 Q68 48 140 54 Q146 96 140 128 Z" fill="#EF4444"/>
      <rect x="42" y="122" width="108" height="22" rx="11" fill="#FFF"/>
      <circle cx="148" cy="60" r="14" fill="#FFF"/>
    `),
  },
  {
    id: 'magic_wand',
    label: 'Magic Wand',
    category: 'Holidays & Magic',
    keywords: ['magic', 'wand', 'fairy', 'wish'],
    imageUrl: makeSvg('#FAF5FF', `
      <line x1="48" y1="152" x2="118" y2="82" stroke="#7C3AED" stroke-width="12" stroke-linecap="round"/>
      <polygon points="122,42 132,64 156,66 138,82 144,106 122,94 100,106 106,82 88,66 112,64" fill="#FACC15"/>
    `),
  },
  {
    id: 'unicorn',
    label: 'Unicorn',
    category: 'Holidays & Magic',
    keywords: ['unicorn', 'magic', 'rainbow', 'fantasy'],
    imageUrl: makeSvg('#FDF2F8', `
      <polygon points="94,58 102,24 114,58" fill="#FACC15"/>
      <circle cx="100" cy="104" r="44" fill="#FFF" stroke="#E2E8F0" stroke-width="3"/>
      <ellipse cx="100" cy="126" rx="28" ry="18" fill="#FBCFE8"/>
      <circle cx="84" cy="96" r="5" fill="#1E293B"/><circle cx="116" cy="96" r="5" fill="#1E293B"/>
      <path d="M58 84 Q72 64 90 70" stroke="#EC4899" stroke-width="10" stroke-linecap="round" fill="none"/>
    `),
  },
  {
    id: 'dragon',
    label: 'Friendly Dragon',
    category: 'Holidays & Magic',
    keywords: ['dragon', 'monster', 'fantasy', 'wings'],
    imageUrl: makeSvg('#ECFDF5', `
      <polygon points="60,84 34,58 58,112" fill="#F59E0B"/>
      <polygon points="140,84 166,58 142,112" fill="#F59E0B"/>
      <circle cx="100" cy="108" r="46" fill="#10B981"/>
      <circle cx="82" cy="96" r="6" fill="#FFF"/><circle cx="82" cy="96" r="3" fill="#0F172A"/>
      <circle cx="118" cy="96" r="6" fill="#FFF"/><circle cx="118" cy="96" r="3" fill="#0F172A"/>
      <path d="M84 126 Q100 136 116 126" stroke="#064E3B" stroke-width="4" fill="none" stroke-linecap="round"/>
    `),
  },
];
