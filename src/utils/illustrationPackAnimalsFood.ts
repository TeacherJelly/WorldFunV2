import { IllustrationPreset } from '../types';
import { makeSvg } from './svgHelper';

export const ANIMAL_AND_FOOD_ILLUSTRATIONS: IllustrationPreset[] = [
  // EXTRA ANIMALS (48)
  {
    id: 'fox',
    label: 'Fox',
    category: 'Animals',
    keywords: ['fox', 'foxes', 'forest', 'clever', 'orange'],
    imageUrl: makeSvg('#FFF7ED', `
      <polygon points="48,96 42,38 88,68" fill="#EA580C"/>
      <polygon points="152,96 158,38 112,68" fill="#EA580C"/>
      <polygon points="54,84 48,50 78,68" fill="#FED7AA"/>
      <polygon points="146,84 152,50 122,68" fill="#FED7AA"/>
      <ellipse cx="100" cy="112" rx="54" ry="44" fill="#F97316"/>
      <path d="M48 116 Q100 100 152 116 Q138 156 100 156 Q62 156 48 116 Z" fill="#FFF"/>
      <circle cx="80" cy="100" r="6" fill="#1E293B"/><circle cx="78" cy="98" r="2" fill="#FFF"/>
      <circle cx="120" cy="100" r="6" fill="#1E293B"/><circle cx="118" cy="98" r="2" fill="#FFF"/>
      <circle cx="100" cy="128" r="7" fill="#1E293B"/>
    `),
  },
  {
    id: 'panda',
    label: 'Panda',
    category: 'Animals',
    keywords: ['panda', 'pandas', 'bamboo', 'china', 'cute'],
    imageUrl: makeSvg('#ECFDF5', `
      <circle cx="56" cy="58" r="20" fill="#1E293B"/>
      <circle cx="144" cy="58" r="20" fill="#1E293B"/>
      <circle cx="100" cy="108" r="52" fill="#FFF" stroke="#CBD5E1" stroke-width="3"/>
      <ellipse cx="78" cy="100" rx="14" ry="18" fill="#1E293B" transform="rotate(-15 78 100)"/>
      <ellipse cx="122" cy="100" rx="14" ry="18" fill="#1E293B" transform="rotate(15 122 100)"/>
      <circle cx="80" cy="98" r="5" fill="#FFF"/><circle cx="80" cy="98" r="2.5" fill="#0F172A"/>
      <circle cx="120" cy="98" r="5" fill="#FFF"/><circle cx="120" cy="98" r="2.5" fill="#0F172A"/>
      <ellipse cx="100" cy="120" rx="8" ry="5" fill="#1E293B"/>
      <path d="M90 130 Q100 138 110 130" stroke="#1E293B" stroke-width="3" fill="none" stroke-linecap="round"/>
    `),
  },
  {
    id: 'tiger',
    label: 'Tiger',
    category: 'Animals',
    keywords: ['tiger', 'tigers', 'stripes', 'roar', 'wild'],
    imageUrl: makeSvg('#FEF3C7', `
      <circle cx="58" cy="64" r="18" fill="#F97316"/><circle cx="58" cy="64" r="9" fill="#FED7AA"/>
      <circle cx="142" cy="64" r="18" fill="#F97316"/><circle cx="142" cy="64" r="9" fill="#FED7AA"/>
      <circle cx="100" cy="108" r="50" fill="#FB923C"/>
      <path d="M92 60 L100 78 L108 60 M54 96 L72 102 L56 110 M146 96 L128 102 L144 110" stroke="#1E293B" stroke-width="5" stroke-linecap="round" fill="none"/>
      <ellipse cx="100" cy="126" rx="24" ry="16" fill="#FFF"/>
      <circle cx="82" cy="102" r="6" fill="#1E293B"/><circle cx="80" cy="100" r="2" fill="#FFF"/>
      <circle cx="118" cy="102" r="6" fill="#1E293B"/><circle cx="116" cy="100" r="2" fill="#FFF"/>
      <polygon points="100,122 93,115 107,115" fill="#F43F5E"/>
      <path d="M90 130 Q100 138 110 130" stroke="#1E293B" stroke-width="3" fill="none" stroke-linecap="round"/>
    `),
  },
  {
    id: 'giraffe',
    label: 'Giraffe',
    category: 'Animals',
    keywords: ['giraffe', 'giraffes', 'tall', 'neck', 'spots', 'zoo'],
    imageUrl: makeSvg('#FEF9C3', `
      <rect x="78" y="106" width="44" height="72" rx="16" fill="#FBBF24"/>
      <circle cx="92" cy="140" r="8" fill="#B45309"/><circle cx="110" cy="160" r="7" fill="#B45309"/>
      <line x1="80" y1="62" x2="74" y2="38" stroke="#B45309" stroke-width="6" stroke-linecap="round"/>
      <line x1="120" y1="62" x2="126" y2="38" stroke="#B45309" stroke-width="6" stroke-linecap="round"/>
      <circle cx="74" cy="36" r="6" fill="#78350F"/><circle cx="126" cy="36" r="6" fill="#78350F"/>
      <ellipse cx="58" cy="76" rx="14" ry="9" fill="#FBBF24" transform="rotate(-20 58 76)"/>
      <ellipse cx="142" cy="76" rx="14" ry="9" fill="#FBBF24" transform="rotate(20 142 76)"/>
      <ellipse cx="100" cy="88" rx="38" ry="34" fill="#FACC15"/>
      <ellipse cx="100" cy="104" rx="24" ry="16" fill="#FDE68A"/>
      <circle cx="84" cy="78" r="5" fill="#1E293B"/><circle cx="116" cy="78" r="5" fill="#1E293B"/>
      <circle cx="92" cy="100" r="3" fill="#78350F"/><circle cx="108" cy="100" r="3" fill="#78350F"/>
    `),
  },
  {
    id: 'zebra',
    label: 'Zebra',
    category: 'Animals',
    keywords: ['zebra', 'zebras', 'stripes', 'black', 'white'],
    imageUrl: makeSvg('#E0F2FE', `
      <rect x="92" y="34" width="16" height="24" rx="6" fill="#1E293B"/>
      <polygon points="62,74 54,40 80,62" fill="#FFF" stroke="#CBD5E1" stroke-width="2"/>
      <polygon points="138,74 146,40 120,62" fill="#FFF" stroke="#CBD5E1" stroke-width="2"/>
      <ellipse cx="100" cy="110" rx="44" ry="48" fill="#FFF" stroke="#CBD5E1" stroke-width="2"/>
      <path d="M62 88 L84 94 M138 88 L116 94 M58 106 L82 110 M142 106 L118 110" stroke="#1E293B" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="100" cy="134" rx="26" ry="18" fill="#64748B"/>
      <circle cx="84" cy="96" r="5" fill="#1E293B"/><circle cx="116" cy="96" r="5" fill="#1E293B"/>
      <circle cx="91" cy="132" r="3" fill="#FFF"/><circle cx="109" cy="132" r="3" fill="#FFF"/>
    `),
  },
  {
    id: 'koala',
    label: 'Koala',
    category: 'Animals',
    keywords: ['koala', 'koalas', 'australia', 'eucalyptus', 'sleepy'],
    imageUrl: makeSvg('#E0F2FE', `
      <circle cx="48" cy="92" r="28" fill="#94A3B8"/><circle cx="48" cy="92" r="16" fill="#E2E8F0"/>
      <circle cx="152" cy="92" r="28" fill="#94A3B8"/><circle cx="152" cy="92" r="16" fill="#E2E8F0"/>
      <circle cx="100" cy="108" r="46" fill="#94A3B8"/>
      <ellipse cx="100" cy="112" rx="11" ry="16" fill="#1E293B"/>
      <circle cx="78" cy="98" r="6" fill="#0F172A"/><circle cx="76" cy="96" r="2" fill="#FFF"/>
      <circle cx="122" cy="98" r="6" fill="#0F172A"/><circle cx="120" cy="96" r="2" fill="#FFF"/>
      <path d="M90 134 Q100 140 110 134" stroke="#334155" stroke-width="3" fill="none" stroke-linecap="round"/>
    `),
  },
  {
    id: 'kangaroo',
    label: 'Kangaroo',
    category: 'Animals',
    keywords: ['kangaroo', 'kangaroos', 'joey', 'pouch', 'hop'],
    imageUrl: makeSvg('#FEF3C7', `
      <ellipse cx="78" cy="52" rx="10" ry="28" fill="#D97706" transform="rotate(-10 78 52)"/>
      <ellipse cx="122" cy="52" rx="10" ry="28" fill="#D97706" transform="rotate(10 122 52)"/>
      <ellipse cx="100" cy="94" rx="34" ry="30" fill="#F59E0B"/>
      <ellipse cx="100" cy="144" rx="38" ry="30" fill="#D97706"/>
      <path d="M78 144 Q100 166 122 144 Z" fill="#FDE68A"/>
      <circle cx="86" cy="88" r="5" fill="#1E293B"/><circle cx="114" cy="88" r="5" fill="#1E293B"/>
      <ellipse cx="100" cy="102" rx="7" ry="5" fill="#451A03"/>
    `),
  },
  {
    id: 'penguin',
    label: 'Penguin',
    category: 'Animals',
    keywords: ['penguin', 'penguins', 'ice', 'snow', 'waddle'],
    imageUrl: makeSvg('#DBEAFE', `
      <ellipse cx="100" cy="108" rx="48" ry="56" fill="#1E293B"/>
      <ellipse cx="100" cy="118" rx="32" ry="42" fill="#FFF"/>
      <ellipse cx="52" cy="116" rx="12" ry="26" fill="#334155" transform="rotate(18 52 116)"/>
      <ellipse cx="148" cy="116" rx="12" ry="26" fill="#334155" transform="rotate(-18 148 116)"/>
      <circle cx="84" cy="88" r="6" fill="#0F172A"/><circle cx="82" cy="86" r="2" fill="#FFF"/>
      <circle cx="116" cy="88" r="6" fill="#0F172A"/><circle cx="114" cy="86" r="2" fill="#FFF"/>
      <polygon points="90,98 110,98 100,112" fill="#F97316"/>
      <ellipse cx="78" cy="164" rx="14" ry="7" fill="#F97316"/>
      <ellipse cx="122" cy="164" rx="14" ry="7" fill="#F97316"/>
    `),
  },
  {
    id: 'whale',
    label: 'Whale',
    category: 'Animals',
    keywords: ['whale', 'whales', 'ocean', 'big', 'spout'],
    imageUrl: makeSvg('#EFF6FF', `
      <path d="M100 56 Q88 34 74 42 M100 56 Q112 34 126 42" stroke="#38BDF8" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M36 116 Q36 66 98 66 Q146 66 154 106 Q172 90 176 112 Q160 124 148 122 Q140 150 92 150 Q36 150 36 116 Z" fill="#0284C7"/>
      <path d="M44 126 Q92 152 140 128 Q128 148 92 148 Q54 148 44 126 Z" fill="#BAE6FD"/>
      <circle cx="68" cy="102" r="6" fill="#FFF"/><circle cx="67" cy="102" r="3" fill="#0F172A"/>
      <path d="M56 118 Q68 126 80 118" stroke="#0F172A" stroke-width="3" fill="none" stroke-linecap="round"/>
    `),
  },
  {
    id: 'dolphin',
    label: 'Dolphin',
    category: 'Animals',
    keywords: ['dolphin', 'dolphins', 'sea', 'splash', 'jump'],
    imageUrl: makeSvg('#E0F2FE', `
      <path d="M40 132 Q66 56 126 68 Q158 76 168 104 Q146 106 138 118 Q112 96 76 124 L62 148 L48 134 Z" fill="#0EA5E9"/>
      <polygon points="94,70 110,44 114,72" fill="#0284C7"/>
      <circle cx="144" cy="90" r="4.5" fill="#0F172A"/>
      <path d="M24 156 Q62 144 100 156 Q138 168 176 156" stroke="#38BDF8" stroke-width="6" stroke-linecap="round" fill="none"/>
    `),
  },
  {
    id: 'octopus',
    label: 'Octopus',
    category: 'Animals',
    keywords: ['octopus', 'tentacles', 'squid', 'ocean', 'eight'],
    imageUrl: makeSvg('#FAF5FF', `
      <circle cx="100" cy="84" r="44" fill="#A855F7"/>
      <path d="M62 118 Q44 150 58 158 M80 124 Q70 158 84 162 M100 126 Q100 162 110 160 M120 124 Q132 158 144 156 M138 116 Q158 146 166 136" stroke="#9333EA" stroke-width="12" stroke-linecap="round" fill="none"/>
      <circle cx="84" cy="82" r="8" fill="#FFF"/><circle cx="84" cy="82" r="4" fill="#1E293B"/>
      <circle cx="116" cy="82" r="8" fill="#FFF"/><circle cx="116" cy="82" r="4" fill="#1E293B"/>
      <path d="M90 100 Q100 108 110 100" stroke="#4C1D95" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    `),
  },
  {
    id: 'shark',
    label: 'Shark',
    category: 'Animals',
    keywords: ['shark', 'sharks', 'fin', 'teeth', 'ocean'],
    imageUrl: makeSvg('#DBEAFE', `
      <polygon points="88,68 112,34 118,72" fill="#475569"/>
      <ellipse cx="96" cy="106" rx="56" ry="34" fill="#64748B"/>
      <polygon points="148,106 178,80 170,106 178,132" fill="#475569"/>
      <path d="M44 112 Q96 138 142 114 Q120 138 92 138 Q60 138 44 112 Z" fill="#F1F5F9"/>
      <circle cx="66" cy="96" r="5" fill="#0F172A"/>
      <polygon points="56,114 64,122 72,114 80,122 88,114" fill="#FFF"/>
    `),
  },
  {
    id: 'crab',
    label: 'Crab',
    category: 'Animals',
    keywords: ['crab', 'crabs', 'claw', 'beach', 'sand'],
    imageUrl: makeSvg('#FEF2F2', `
      <circle cx="52" cy="64" r="18" fill="#EF4444"/><polygon points="52,64 68,52 68,76" fill="#FEF2F2"/>
      <circle cx="148" cy="64" r="18" fill="#EF4444"/><polygon points="148,64 132,52 132,76" fill="#FEF2F2"/>
      <path d="M58 120 L34 136 M64 134 L42 152 M142 120 L166 136 M136 134 L158 152" stroke="#DC2626" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="100" cy="118" rx="46" ry="32" fill="#EF4444"/>
      <line x1="82" y1="88" x2="82" y2="72" stroke="#DC2626" stroke-width="5"/>
      <line x1="118" y1="88" x2="118" y2="72" stroke="#DC2626" stroke-width="5"/>
      <circle cx="82" cy="70" r="7" fill="#FFF"/><circle cx="82" cy="70" r="3.5" fill="#0F172A"/>
      <circle cx="118" cy="70" r="7" fill="#FFF"/><circle cx="118" cy="70" r="3.5" fill="#0F172A"/>
      <path d="M86 122 Q100 132 114 122" stroke="#7F1D1D" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    `),
  },
  {
    id: 'seahorse',
    label: 'Seahorse',
    category: 'Animals',
    keywords: ['seahorse', 'ocean', 'sea', 'coral'],
    imageUrl: makeSvg('#E0F2FE', `
      <path d="M98 40 C128 40 132 76 112 94 C132 112 126 144 98 154 C80 160 76 142 90 138" stroke="#F59E0B" stroke-width="22" stroke-linecap="round" fill="none"/>
      <polygon points="84,54 58,64 84,72" fill="#FBBF24"/>
      <polygon points="122,88 144,80 140,104 120,104" fill="#F97316"/>
      <circle cx="96" cy="56" r="5" fill="#0F172A"/>
    `),
  },
  {
    id: 'jellyfish',
    label: 'Jellyfish',
    category: 'Animals',
    keywords: ['jellyfish', 'ocean', 'sea', 'glow'],
    imageUrl: makeSvg('#EDE9FE', `
      <path d="M50 100 C50 48 150 48 150 100 Z" fill="#EC4899"/>
      <circle cx="82" cy="74" r="8" fill="#FBCFE8" opacity="0.7"/><circle cx="116" cy="80" r="6" fill="#FBCFE8" opacity="0.7"/>
      <path d="M68 100 Q60 132 70 160 M90 100 Q98 134 88 164 M112 100 Q104 134 114 164 M134 100 Q142 132 132 160" stroke="#F472B6" stroke-width="7" stroke-linecap="round" fill="none"/>
      <circle cx="84" cy="84" r="4" fill="#FFF"/><circle cx="116" cy="84" r="4" fill="#FFF"/>
    `),
  },
  {
    id: 'snail',
    label: 'Snail',
    category: 'Animals',
    keywords: ['snail', 'snails', 'shell', 'slow', 'garden'],
    imageUrl: makeSvg('#ECFCCB', `
      <path d="M36 144 Q100 156 154 140 Q168 134 162 114 Q156 96 142 104 Q134 124 116 128 L42 130 Z" fill="#84CC16"/>
      <circle cx="92" cy="102" r="40" fill="#F59E0B"/>
      <path d="M92 102 m-24,0 a24,24 0 1,0 48,0 a16,16 0 1,0 -32,0 a8,8 0 1,0 16,0" stroke="#B45309" stroke-width="5" fill="none"/>
      <line x1="150" y1="102" x2="158" y2="82" stroke="#65A30D" stroke-width="3.5"/>
      <line x1="160" y1="106" x2="172" y2="88" stroke="#65A30D" stroke-width="3.5"/>
      <circle cx="158" cy="80" r="5" fill="#0F172A"/><circle cx="172" cy="86" r="5" fill="#0F172A"/>
    `),
  },
  {
    id: 'bee',
    label: 'Bee',
    category: 'Animals',
    keywords: ['bee', 'bees', 'honey', 'buzz', 'insect'],
    imageUrl: makeSvg('#FEF9C3', `
      <ellipse cx="82" cy="64" rx="22" ry="28" fill="#E0F2FE" stroke="#7DD3FC" stroke-width="3" transform="rotate(-20 82 64)"/>
      <ellipse cx="118" cy="64" rx="22" ry="28" fill="#E0F2FE" stroke="#7DD3FC" stroke-width="3" transform="rotate(20 118 64)"/>
      <ellipse cx="100" cy="112" rx="46" ry="34" fill="#FACC15"/>
      <rect x="82" y="80" width="12" height="64" rx="4" fill="#1E293B"/>
      <rect x="108" y="80" width="12" height="64" rx="4" fill="#1E293B"/>
      <circle cx="68" cy="106" r="5" fill="#0F172A"/>
      <path d="M64 120 Q72 126 78 120" stroke="#0F172A" stroke-width="3" fill="none" stroke-linecap="round"/>
    `),
  },
  {
    id: 'ladybug',
    label: 'Ladybug',
    category: 'Animals',
    keywords: ['ladybug', 'bug', 'beetle', 'spotted', 'insect'],
    imageUrl: makeSvg('#DCFCE7', `
      <circle cx="100" cy="64" r="24" fill="#1E293B"/>
      <circle cx="100" cy="114" r="48" fill="#EF4444"/>
      <line x1="100" y1="74" x2="100" y2="162" stroke="#1E293B" stroke-width="4"/>
      <circle cx="78" cy="100" r="8" fill="#1E293B"/><circle cx="122" cy="100" r="8" fill="#1E293B"/>
      <circle cx="74" cy="130" r="7" fill="#1E293B"/><circle cx="126" cy="130" r="7" fill="#1E293B"/>
      <circle cx="91" cy="58" r="4" fill="#FFF"/><circle cx="109" cy="58" r="4" fill="#FFF"/>
    `),
  },
  {
    id: 'ant',
    label: 'Ant',
    category: 'Animals',
    keywords: ['ant', 'ants', 'insect', 'tiny'],
    imageUrl: makeSvg('#FEF3C7', `
      <ellipse cx="62" cy="116" rx="26" ry="20" fill="#78350F"/>
      <circle cx="102" cy="108" r="18" fill="#92400E"/>
      <circle cx="138" cy="96" r="22" fill="#B45309"/>
      <path d="M96 124 L84 152 M106 124 L106 154 M114 124 L128 152" stroke="#451A03" stroke-width="4" stroke-linecap="round"/>
      <path d="M142 76 Q152 54 164 58 M132 76 Q134 52 146 50" stroke="#451A03" stroke-width="3" fill="none"/>
      <circle cx="144" cy="92" r="4" fill="#FFF"/><circle cx="145" cy="92" r="2" fill="#000"/>
    `),
  },
  {
    id: 'spider',
    label: 'Spider',
    category: 'Animals',
    keywords: ['spider', 'spiders', 'web', 'eight'],
    imageUrl: makeSvg('#F3E8FF', `
      <line x1="100" y1="18" x2="100" y2="74" stroke="#94A3B8" stroke-width="3"/>
      <path d="M68 104 L36 86 M66 114 L32 114 M68 124 L36 142 M132 104 L164 86 M134 114 L168 114 M132 124 L164 142" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
      <circle cx="100" cy="114" r="34" fill="#1E293B"/>
      <circle cx="88" cy="108" r="6" fill="#FFF"/><circle cx="88" cy="108" r="3" fill="#0F172A"/>
      <circle cx="112" cy="108" r="6" fill="#FFF"/><circle cx="112" cy="108" r="3" fill="#0F172A"/>
      <path d="M90 126 Q100 134 110 126" stroke="#F472B6" stroke-width="3" fill="none" stroke-linecap="round"/>
    `),
  },
  {
    id: 'caterpillar',
    label: 'Caterpillar',
    category: 'Animals',
    keywords: ['caterpillar', 'worm', 'bug', 'leaf'],
    imageUrl: makeSvg('#ECFDF5', `
      <circle cx="52" cy="120" r="22" fill="#22C55E"/>
      <circle cx="80" cy="112" r="24" fill="#4ADE80"/>
      <circle cx="110" cy="116" r="24" fill="#22C55E"/>
      <circle cx="142" cy="98" r="28" fill="#16A34A"/>
      <circle cx="136" cy="92" r="5" fill="#FFF"/><circle cx="136" cy="92" r="2.5" fill="#0F172A"/>
      <circle cx="152" cy="92" r="5" fill="#FFF"/><circle cx="152" cy="92" r="2.5" fill="#0F172A"/>
      <path d="M136 108 Q144 114 152 108" stroke="#064E3B" stroke-width="3" fill="none" stroke-linecap="round"/>
      <line x1="136" y1="70" x2="128" y2="52" stroke="#15803D" stroke-width="4" stroke-linecap="round"/>
      <line x1="150" y1="70" x2="158" y2="52" stroke="#15803D" stroke-width="4" stroke-linecap="round"/>
    `),
  },
  {
    id: 'cow',
    label: 'Cow',
    category: 'Animals',
    keywords: ['cow', 'cows', 'moo', 'milk', 'farm'],
    imageUrl: makeSvg('#ECFDF5', `
      <ellipse cx="48" cy="84" rx="16" ry="10" fill="#1E293B" transform="rotate(-20 48 84)"/>
      <ellipse cx="152" cy="84" rx="16" ry="10" fill="#1E293B" transform="rotate(20 152 84)"/>
      <path d="M68 62 Q62 42 74 44 M132 62 Q138 42 126 44" stroke="#FBBF24" stroke-width="7" stroke-linecap="round" fill="none"/>
      <circle cx="100" cy="102" r="46" fill="#FFF" stroke="#CBD5E1" stroke-width="3"/>
      <circle cx="78" cy="78" r="14" fill="#1E293B"/>
      <ellipse cx="100" cy="128" rx="34" ry="22" fill="#FBCFE8"/>
      <circle cx="84" cy="94" r="5" fill="#1E293B"/><circle cx="116" cy="94" r="5" fill="#1E293B"/>
      <circle cx="88" cy="126" r="4" fill="#BE185D"/><circle cx="112" cy="126" r="4" fill="#BE185D"/>
    `),
  },
  {
    id: 'pig',
    label: 'Pig',
    category: 'Animals',
    keywords: ['pig', 'pigs', 'oink', 'farm', 'pink'],
    imageUrl: makeSvg('#FDF2F8', `
      <polygon points="56,78 48,44 82,62" fill="#F472B6"/>
      <polygon points="144,78 152,44 118,62" fill="#F472B6"/>
      <circle cx="100" cy="108" r="50" fill="#F9A8D4"/>
      <ellipse cx="100" cy="120" rx="22" ry="15" fill="#F472B6"/>
      <circle cx="92" cy="120" r="4" fill="#831843"/><circle cx="108" cy="120" r="4" fill="#831843"/>
      <circle cx="80" cy="94" r="6" fill="#1E293B"/><circle cx="120" cy="94" r="6" fill="#1E293B"/>
      <path d="M88 140 Q100 148 112 140" stroke="#831843" stroke-width="3" fill="none" stroke-linecap="round"/>
    `),
  },
  {
    id: 'sheep',
    label: 'Sheep / Lamb',
    category: 'Animals',
    keywords: ['sheep', 'lamb', 'wool', 'baa', 'farm'],
    imageUrl: makeSvg('#E0F2FE', `
      <circle cx="72" cy="76" r="26" fill="#FFF"/><circle cx="128" cy="76" r="26" fill="#FFF"/>
      <circle cx="62" cy="112" r="26" fill="#FFF"/><circle cx="138" cy="112" r="26" fill="#FFF"/>
      <circle cx="100" cy="64" r="26" fill="#FFF"/><circle cx="100" cy="142" r="26" fill="#FFF"/>
      <ellipse cx="56" cy="102" rx="14" ry="8" fill="#334155" transform="rotate(-25 56 102)"/>
      <ellipse cx="144" cy="102" rx="14" ry="8" fill="#334155" transform="rotate(25 144 102)"/>
      <ellipse cx="100" cy="112" rx="30" ry="34" fill="#334155"/>
      <circle cx="100" cy="82" r="18" fill="#FFF"/>
      <circle cx="88" cy="106" r="4.5" fill="#FFF"/><circle cx="112" cy="106" r="4.5" fill="#FFF"/>
      <path d="M92 126 Q100 132 108 126" stroke="#FFF" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    `),
  },
  {
    id: 'horse',
    label: 'Horse / Pony',
    category: 'Animals',
    keywords: ['horse', 'horses', 'pony', 'gallop', 'farm'],
    imageUrl: makeSvg('#FEF3C7', `
      <polygon points="74,64 68,36 90,54" fill="#92400E"/>
      <polygon points="126,64 132,36 110,54" fill="#92400E"/>
      <rect x="74" y="48" width="16" height="44" rx="8" fill="#451A03"/>
      <ellipse cx="100" cy="100" rx="38" ry="44" fill="#B45309"/>
      <ellipse cx="100" cy="130" rx="28" ry="24" fill="#FDE68A"/>
      <circle cx="84" cy="92" r="5" fill="#1E293B"/><circle cx="116" cy="92" r="5" fill="#1E293B"/>
      <circle cx="91" cy="128" r="3.5" fill="#451A03"/><circle cx="109" cy="128" r="3.5" fill="#451A03"/>
    `),
  },
  {
    id: 'goat',
    label: 'Goat',
    category: 'Animals',
    keywords: ['goat', 'goats', 'farm', 'horn'],
    imageUrl: makeSvg('#ECFCCB', `
      <path d="M78 62 Q64 36 52 44 M122 62 Q136 36 148 44" stroke="#78350F" stroke-width="8" stroke-linecap="round" fill="none"/>
      <ellipse cx="100" cy="106" rx="40" ry="44" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="3"/>
      <polygon points="90,148 110,148 100,170" fill="#CBD5E1"/>
      <circle cx="84" cy="94" r="5" fill="#0F172A"/><circle cx="116" cy="94" r="5" fill="#0F172A"/>
      <ellipse cx="100" cy="122" rx="16" ry="12" fill="#FBCFE8"/>
    `),
  },
  {
    id: 'duck',
    label: 'Duck / Duckling',
    category: 'Animals',
    keywords: ['duck', 'ducks', 'duckling', 'quack', 'pond'],
    imageUrl: makeSvg('#FEF9C3', `
      <circle cx="100" cy="96" r="46" fill="#FACC15"/>
      <path d="M96 50 Q100 36 112 42" stroke="#EAB308" stroke-width="6" stroke-linecap="round" fill="none"/>
      <circle cx="82" cy="88" r="6" fill="#0F172A"/><circle cx="80" cy="86" r="2" fill="#FFF"/>
      <circle cx="118" cy="88" r="6" fill="#0F172A"/><circle cx="116" cy="86" r="2" fill="#FFF"/>
      <ellipse cx="100" cy="112" rx="22" ry="12" fill="#F97316"/>
    `),
  },
  {
    id: 'chicken',
    label: 'Chicken / Chick',
    category: 'Animals',
    keywords: ['chicken', 'chick', 'hen', 'egg', 'farm'],
    imageUrl: makeSvg('#FFFBEB', `
      <circle cx="92" cy="48" r="10" fill="#EF4444"/><circle cx="106" cy="46" r="11" fill="#EF4444"/>
      <circle cx="100" cy="108" r="48" fill="#FFF" stroke="#E2E8F0" stroke-width="3"/>
      <circle cx="82" cy="94" r="6" fill="#1E293B"/><circle cx="118" cy="94" r="6" fill="#1E293B"/>
      <polygon points="92,106 108,106 100,120" fill="#F59E0B"/>
      <ellipse cx="100" cy="126" rx="9" ry="7" fill="#EF4444"/>
    `),
  },
  {
    id: 'rooster',
    label: 'Rooster',
    category: 'Animals',
    keywords: ['rooster', 'cock', 'morning', 'crow', 'farm'],
    imageUrl: makeSvg('#FEE2E2', `
      <circle cx="86" cy="44" r="11" fill="#DC2626"/><circle cx="102" cy="40" r="12" fill="#DC2626"/><circle cx="116" cy="48" r="10" fill="#DC2626"/>
      <ellipse cx="100" cy="112" rx="44" ry="48" fill="#FDBA74"/>
      <circle cx="84" cy="94" r="5.5" fill="#0F172A"/><circle cx="116" cy="94" r="5.5" fill="#0F172A"/>
      <polygon points="92,104 108,104 100,118" fill="#F59E0B"/>
      <circle cx="100" cy="128" r="10" fill="#DC2626"/>
    `),
  },
  {
    id: 'owl',
    label: 'Owl',
    category: 'Animals',
    keywords: ['owl', 'owls', 'night', 'wise', 'hoot'],
    imageUrl: makeSvg('#EDE9FE', `
      <polygon points="62,64 52,38 82,54" fill="#92400E"/>
      <polygon points="138,64 148,38 118,54" fill="#92400E"/>
      <ellipse cx="100" cy="108" rx="48" ry="50" fill="#B45309"/>
      <ellipse cx="100" cy="128" rx="28" ry="26" fill="#FDE68A"/>
      <circle cx="80" cy="92" r="18" fill="#FFF"/><circle cx="80" cy="92" r="8" fill="#1E293B"/>
      <circle cx="120" cy="92" r="18" fill="#FFF"/><circle cx="120" cy="92" r="8" fill="#1E293B"/>
      <polygon points="94,104 106,104 100,118" fill="#F59E0B"/>
    `),
  },
  {
    id: 'eagle',
    label: 'Eagle / Hawk',
    category: 'Animals',
    keywords: ['eagle', 'hawk', 'bird', 'soar', 'fly'],
    imageUrl: makeSvg('#E0F2FE', `
      <path d="M26 96 Q64 56 100 94 Q136 56 174 96 Q142 116 116 112 L100 144 L84 112 Q58 116 26 96 Z" fill="#78350F"/>
      <circle cx="100" cy="92" r="24" fill="#FFF"/>
      <circle cx="91" cy="88" r="4" fill="#0F172A"/><circle cx="109" cy="88" r="4" fill="#0F172A"/>
      <polygon points="94,96 106,96 100,110" fill="#FACC15"/>
    `),
  },
  {
    id: 'flamingo',
    label: 'Flamingo',
    category: 'Animals',
    keywords: ['flamingo', 'pink', 'bird', 'tropical'],
    imageUrl: makeSvg('#FCE7F3', `
      <line x1="100" y1="126" x2="100" y2="174" stroke="#F59E0B" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="100" cy="122" rx="34" ry="24" fill="#F472B6"/>
      <path d="M124 114 Q136 62 110 52" stroke="#EC4899" stroke-width="14" stroke-linecap="round" fill="none"/>
      <circle cx="106" cy="52" r="16" fill="#EC4899"/>
      <polygon points="92,50 74,60 88,66" fill="#1E293B"/>
      <circle cx="104" cy="48" r="3.5" fill="#FFF"/>
    `),
  },
  {
    id: 'peacock',
    label: 'Peacock',
    category: 'Animals',
    keywords: ['peacock', 'feathers', 'colorful', 'bird'],
    imageUrl: makeSvg('#ECFEFF', `
      <circle cx="100" cy="96" r="64" fill="#10B981"/>
      <circle cx="56" cy="76" r="10" fill="#3B82F6"/><circle cx="100" cy="52" r="10" fill="#3B82F6"/><circle cx="144" cy="76" r="10" fill="#3B82F6"/>
      <circle cx="56" cy="76" r="5" fill="#FACC15"/><circle cx="100" cy="52" r="5" fill="#FACC15"/><circle cx="144" cy="76" r="5" fill="#FACC15"/>
      <ellipse cx="100" cy="124" rx="22" ry="34" fill="#0284C7"/>
      <circle cx="100" cy="88" r="16" fill="#0284C7"/>
      <circle cx="94" cy="84" r="3" fill="#FFF"/><circle cx="106" cy="84" r="3" fill="#FFF"/>
      <polygon points="96,92 104,92 100,102" fill="#FBBF24"/>
    `),
  },
  {
    id: 'swan',
    label: 'Swan',
    category: 'Animals',
    keywords: ['swan', 'lake', 'white', 'graceful'],
    imageUrl: makeSvg('#E0F2FE', `
      <ellipse cx="108" cy="134" rx="44" ry="26" fill="#FFF" stroke="#CBD5E1" stroke-width="3"/>
      <path d="M74 128 Q62 66 94 56" stroke="#FFF" stroke-width="18" stroke-linecap="round" fill="none"/>
      <circle cx="96" cy="56" r="15" fill="#FFF" stroke="#CBD5E1" stroke-width="2"/>
      <polygon points="108,52 126,60 108,64" fill="#F97316"/>
      <circle cx="98" cy="52" r="3" fill="#0F172A"/>
    `),
  },
  {
    id: 'parrot',
    label: 'Parrot',
    category: 'Animals',
    keywords: ['parrot', 'macaw', 'jungle', 'talk', 'bird'],
    imageUrl: makeSvg('#DCFCE7', `
      <ellipse cx="100" cy="112" rx="36" ry="48" fill="#EF4444"/>
      <ellipse cx="76" cy="120" rx="18" ry="30" fill="#3B82F6"/>
      <ellipse cx="124" cy="120" rx="18" ry="30" fill="#FACC15"/>
      <circle cx="100" cy="76" r="28" fill="#EF4444"/>
      <circle cx="88" cy="72" r="7" fill="#FFF"/><circle cx="88" cy="72" r="3.5" fill="#0F172A"/>
      <circle cx="112" cy="72" r="7" fill="#FFF"/><circle cx="112" cy="72" r="3.5" fill="#0F172A"/>
      <path d="M92 84 Q100 102 108 84 Z" fill="#1E293B"/>
    `),
  },
  {
    id: 'crocodile',
    label: 'Crocodile / Alligator',
    category: 'Animals',
    keywords: ['crocodile', 'alligator', 'gator', 'swamp', 'river'],
    imageUrl: makeSvg('#D1FAE5', `
      <rect x="44" y="88" width="112" height="44" rx="22" fill="#16A34A"/>
      <circle cx="82" cy="84" r="12" fill="#16A34A"/><circle cx="82" cy="84" r="6" fill="#FFF"/><circle cx="82" cy="84" r="3" fill="#0F172A"/>
      <circle cx="118" cy="84" r="12" fill="#16A34A"/><circle cx="118" cy="84" r="6" fill="#FFF"/><circle cx="118" cy="84" r="3" fill="#0F172A"/>
      <path d="M56 114 L144 114" stroke="#064E3B" stroke-width="4"/>
      <polygon points="64,114 70,124 76,114 96,124 102,114 124,124 130,114" fill="#FFF"/>
    `),
  },
  {
    id: 'hippo',
    label: 'Hippo',
    category: 'Animals',
    keywords: ['hippo', 'hippopotamus', 'river', 'zoo'],
    imageUrl: makeSvg('#EDE9FE', `
      <circle cx="66" cy="64" r="14" fill="#8B5CF6"/><circle cx="134" cy="64" r="14" fill="#8B5CF6"/>
      <circle cx="100" cy="96" r="42" fill="#8B5CF6"/>
      <ellipse cx="100" cy="126" rx="48" ry="30" fill="#C4B5FD"/>
      <circle cx="82" cy="88" r="5" fill="#0F172A"/><circle cx="118" cy="88" r="5" fill="#0F172A"/>
      <circle cx="82" cy="122" r="5" fill="#6D28D9"/><circle cx="118" cy="122" r="5" fill="#6D28D9"/>
      <rect x="78" y="142" width="10" height="10" rx="2" fill="#FFF"/><rect x="112" y="142" width="10" height="10" rx="2" fill="#FFF"/>
    `),
  },
  {
    id: 'rhino',
    label: 'Rhino',
    category: 'Animals',
    keywords: ['rhino', 'rhinoceros', 'horn', 'safari'],
    imageUrl: makeSvg('#E2E8F0', `
      <ellipse cx="106" cy="108" rx="48" ry="42" fill="#64748B"/>
      <polygon points="56,104 34,76 74,92" fill="#F8FAFC"/>
      <polygon points="74,90 68,72 86,86" fill="#E2E8F0"/>
      <circle cx="96" cy="96" r="5" fill="#0F172A"/>
      <ellipse cx="122" cy="70" rx="10" ry="16" fill="#475569"/>
    `),
  },
  {
    id: 'camel',
    label: 'Camel',
    category: 'Animals',
    keywords: ['camel', 'camels', 'desert', 'hump', 'sand'],
    imageUrl: makeSvg('#FEF3C7', `
      <rect x="58" y="122" width="12" height="44" rx="5" fill="#B45309"/>
      <rect x="120" y="122" width="12" height="44" rx="5" fill="#B45309"/>
      <path d="M52 124 C52 72 88 72 94 102 C100 72 136 72 136 124 Z" fill="#D97706"/>
      <path d="M128 110 Q152 96 154 68" stroke="#D97706" stroke-width="16" stroke-linecap="round" fill="none"/>
      <ellipse cx="158" cy="66" rx="18" ry="12" fill="#F59E0B"/>
      <circle cx="162" cy="63" r="3.5" fill="#0F172A"/>
    `),
  },
  {
    id: 'deer',
    label: 'Deer / Reindeer',
    category: 'Animals',
    keywords: ['deer', 'reindeer', 'fawn', 'antlers', 'forest'],
    imageUrl: makeSvg('#ECFDF5', `
      <path d="M80 68 L64 34 M72 52 L54 48 M120 68 L136 34 M128 52 L146 48" stroke="#78350F" stroke-width="6" stroke-linecap="round" fill="none"/>
      <ellipse cx="62" cy="78" rx="14" ry="8" fill="#B45309" transform="rotate(-18 62 78)"/>
      <ellipse cx="138" cy="78" rx="14" ry="8" fill="#B45309" transform="rotate(18 138 78)"/>
      <ellipse cx="100" cy="112" rx="40" ry="44" fill="#D97706"/>
      <ellipse cx="100" cy="128" rx="22" ry="16" fill="#FDE68A"/>
      <circle cx="84" cy="100" r="5" fill="#0F172A"/><circle cx="116" cy="100" r="5" fill="#0F172A"/>
      <circle cx="100" cy="122" r="7" fill="#451A03"/>
    `),
  },
  {
    id: 'squirrel',
    label: 'Squirrel',
    category: 'Animals',
    keywords: ['squirrel', 'squirrels', 'acorn', 'tail', 'nut'],
    imageUrl: makeSvg('#FFF7ED', `
      <path d="M126 144 C172 132 174 58 132 54 C112 52 114 82 126 96" stroke="#B45309" stroke-width="26" stroke-linecap="round" fill="none"/>
      <ellipse cx="92" cy="116" rx="34" ry="38" fill="#D97706"/>
      <polygon points="74,78 72,54 90,72" fill="#B45309"/>
      <polygon points="104,78 108,54 92,72" fill="#B45309"/>
      <circle cx="80" cy="92" r="5" fill="#0F172A"/><circle cx="102" cy="92" r="5" fill="#0F172A"/>
      <ellipse cx="92" cy="128" rx="18" ry="22" fill="#FDE68A"/>
    `),
  },
  {
    id: 'hedgehog',
    label: 'Hedgehog',
    category: 'Animals',
    keywords: ['hedgehog', 'spiky', 'forest', 'cute'],
    imageUrl: makeSvg('#FEF3C7', `
      <circle cx="100" cy="104" r="54" fill="#78350F"/>
      <ellipse cx="100" cy="124" rx="42" ry="30" fill="#FDE68A"/>
      <circle cx="84" cy="116" r="5" fill="#0F172A"/><circle cx="116" cy="116" r="5" fill="#0F172A"/>
      <circle cx="100" cy="128" r="7" fill="#451A03"/>
    `),
  },
  {
    id: 'bat',
    label: 'Bat',
    category: 'Animals',
    keywords: ['bat', 'bats', 'night', 'cave', 'halloween'],
    imageUrl: makeSvg('#312E81', `
      <path d="M30 92 Q56 64 84 96 L84 120 Q62 110 30 124 Z" fill="#475569"/>
      <path d="M170 92 Q144 64 116 96 L116 120 Q138 110 170 124 Z" fill="#475569"/>
      <polygon points="82,76 76,52 94,70" fill="#334155"/>
      <polygon points="118,76 124,52 106,70" fill="#334155"/>
      <circle cx="100" cy="104" r="28" fill="#334155"/>
      <circle cx="90" cy="100" r="5" fill="#FACC15"/><circle cx="110" cy="100" r="5" fill="#FACC15"/>
      <path d="M90 114 Q100 120 110 114" stroke="#FFF" stroke-width="2.5" fill="none"/>
    `),
  },
  {
    id: 'seal',
    label: 'Seal / Sea Lion',
    category: 'Animals',
    keywords: ['seal', 'sea lion', 'arctic', 'ocean'],
    imageUrl: makeSvg('#E0F2FE', `
      <ellipse cx="100" cy="122" rx="48" ry="36" fill="#94A3B8"/>
      <circle cx="100" cy="86" r="34" fill="#CBD5E1"/>
      <circle cx="86" cy="78" r="5.5" fill="#0F172A"/><circle cx="114" cy="78" r="5.5" fill="#0F172A"/>
      <ellipse cx="100" cy="98" rx="18" ry="12" fill="#F8FAFC"/>
      <circle cx="100" cy="92" r="5" fill="#0F172A"/>
    `),
  },
  {
    id: 'walrus',
    label: 'Walrus',
    category: 'Animals',
    keywords: ['walrus', 'tusks', 'arctic', 'sea'],
    imageUrl: makeSvg('#DBEAFE', `
      <circle cx="100" cy="98" r="48" fill="#92400E"/>
      <polygon points="82,124 78,162 90,124" fill="#FFF"/>
      <polygon points="118,124 122,162 110,124" fill="#FFF"/>
      <ellipse cx="100" cy="116" rx="30" ry="16" fill="#D97706"/>
      <circle cx="82" cy="88" r="5" fill="#0F172A"/><circle cx="118" cy="88" r="5" fill="#0F172A"/>
      <ellipse cx="100" cy="106" rx="8" ry="5" fill="#451A03"/>
    `),
  },
  {
    id: 'cheetah',
    label: 'Cheetah / Leopard',
    category: 'Animals',
    keywords: ['cheetah', 'leopard', 'fast', 'spots', 'safari'],
    imageUrl: makeSvg('#FEF9C3', `
      <circle cx="62" cy="64" r="16" fill="#F59E0B"/><circle cx="138" cy="64" r="16" fill="#F59E0B"/>
      <circle cx="100" cy="106" r="48" fill="#FBBF24"/>
      <circle cx="72" cy="82" r="5" fill="#78350F"/><circle cx="128" cy="82" r="5" fill="#78350F"/><circle cx="100" cy="74" r="5" fill="#78350F"/>
      <ellipse cx="100" cy="124" rx="22" ry="16" fill="#FEF3C7"/>
      <circle cx="82" cy="100" r="6" fill="#0F172A"/><circle cx="118" cy="100" r="6" fill="#0F172A"/>
      <polygon points="100,120 94,114 106,114" fill="#451A03"/>
    `),
  },
  {
    id: 'meerkat',
    label: 'Meerkat',
    category: 'Animals',
    keywords: ['meerkat', 'desert', 'lookout', 'safari'],
    imageUrl: makeSvg('#FEF3C7', `
      <ellipse cx="100" cy="140" rx="30" ry="38" fill="#D97706"/>
      <ellipse cx="100" cy="144" rx="18" ry="26" fill="#FDE68A"/>
      <circle cx="100" cy="82" r="32" fill="#F59E0B"/>
      <circle cx="68" cy="74" r="8" fill="#78350F"/><circle cx="132" cy="74" r="8" fill="#78350F"/>
      <circle cx="86" cy="78" r="10" fill="#451A03"/><circle cx="86" cy="78" r="4" fill="#FFF"/>
      <circle cx="114" cy="78" r="10" fill="#451A03"/><circle cx="114" cy="78" r="4" fill="#FFF"/>
      <circle cx="100" cy="92" r="5" fill="#1E293B"/>
    `),
  },
  {
    id: 'chameleon',
    label: 'Chameleon / Lizard',
    category: 'Animals',
    keywords: ['chameleon', 'lizard', 'iguana', 'reptile', 'green'],
    imageUrl: makeSvg('#DCFCE7', `
      <path d="M54 128 C54 78 136 74 148 112 C156 138 122 146 116 126 C112 114 128 108 130 120" stroke="#10B981" stroke-width="22" stroke-linecap="round" fill="none"/>
      <circle cx="62" cy="96" r="22" fill="#22C55E"/>
      <circle cx="64" cy="90" r="10" fill="#FFF"/><circle cx="64" cy="90" r="5" fill="#0F172A"/>
      <path d="M44 104 Q32 116 40 124" stroke="#EC4899" stroke-width="4" stroke-linecap="round" fill="none"/>
    `),
  },

  // FOOD & TREATS (47)
  {
    id: 'orange',
    label: 'Orange',
    category: 'Food & Treats',
    keywords: ['orange', 'oranges', 'tangerine', 'citrus', 'fruit'],
    imageUrl: makeSvg('#FFF7ED', `
      <ellipse cx="116" cy="48" rx="16" ry="8" fill="#22C55E" transform="rotate(-20 116 48)"/>
      <circle cx="100" cy="108" r="52" fill="#F97316"/>
      <circle cx="80" cy="86" r="10" fill="#FED7AA" opacity="0.5"/>
    `),
  },
  {
    id: 'strawberry',
    label: 'Strawberry',
    category: 'Food & Treats',
    keywords: ['strawberry', 'strawberries', 'berry', 'red', 'sweet'],
    imageUrl: makeSvg('#FFE4E6', `
      <polygon points="74,56 100,40 126,56 112,68 88,68" fill="#16A34A"/>
      <path d="M62 72 C52 108 78 158 100 162 C122 158 148 108 138 72 C128 56 72 56 62 72 Z" fill="#F43F5E"/>
      <circle cx="84" cy="92" r="3" fill="#FEF08A"/><circle cx="116" cy="92" r="3" fill="#FEF08A"/>
      <circle cx="100" cy="112" r="3" fill="#FEF08A"/><circle cx="88" cy="130" r="3" fill="#FEF08A"/><circle cx="112" cy="130" r="3" fill="#FEF08A"/>
    `),
  },
  {
    id: 'grapes',
    label: 'Grapes',
    category: 'Food & Treats',
    keywords: ['grapes', 'grape', 'purple', 'fruit', 'vine'],
    imageUrl: makeSvg('#FAF5FF', `
      <path d="M100 32 L100 58" stroke="#15803D" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="122" cy="46" rx="16" ry="9" fill="#22C55E" transform="rotate(-20 122 46)"/>
      <circle cx="80" cy="76" r="18" fill="#9333EA"/><circle cx="120" cy="76" r="18" fill="#A855F7"/>
      <circle cx="68" cy="104" r="18" fill="#7E22CE"/><circle cx="100" cy="104" r="18" fill="#9333EA"/><circle cx="132" cy="104" r="18" fill="#7E22CE"/>
      <circle cx="84" cy="132" r="18" fill="#A855F7"/><circle cx="116" cy="132" r="18" fill="#9333EA"/>
      <circle cx="100" cy="156" r="16" fill="#7E22CE"/>
    `),
  },
  {
    id: 'cherry',
    label: 'Cherries',
    category: 'Food & Treats',
    keywords: ['cherry', 'cherries', 'red', 'fruit'],
    imageUrl: makeSvg('#FFF1F2', `
      <path d="M74 116 Q88 64 116 42 Q126 66 130 116" stroke="#16A34A" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="132" cy="48" rx="16" ry="8" fill="#22C55E" transform="rotate(20 132 48)"/>
      <circle cx="72" cy="128" r="28" fill="#E11D48"/>
      <circle cx="130" cy="128" r="28" fill="#E11D48"/>
      <circle cx="62" cy="118" r="6" fill="#FFF" opacity="0.5"/>
      <circle cx="120" cy="118" r="6" fill="#FFF" opacity="0.5"/>
    `),
  },
  {
    id: 'peach',
    label: 'Peach / Apricot',
    category: 'Food & Treats',
    keywords: ['peach', 'apricot', 'fruit', 'sweet'],
    imageUrl: makeSvg('#FFF7ED', `
      <ellipse cx="118" cy="46" rx="18" ry="9" fill="#22C55E" transform="rotate(-24 118 46)"/>
      <circle cx="84" cy="108" r="40" fill="#FB923C"/>
      <circle cx="116" cy="108" r="40" fill="#FDBA74"/>
      <path d="M100 68 Q108 108 100 148" stroke="#EA580C" stroke-width="4" fill="none"/>
    `),
  },
  {
    id: 'pear',
    label: 'Pear',
    category: 'Food & Treats',
    keywords: ['pear', 'pears', 'green', 'fruit'],
    imageUrl: makeSvg('#ECFCCB', `
      <line x1="100" y1="34" x2="100" y2="54" stroke="#78350F" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="118" cy="44" rx="14" ry="7" fill="#16A34A" transform="rotate(-20 118 44)"/>
      <path d="M100 50 C80 50 74 78 66 96 C54 124 68 160 100 160 C132 160 146 124 134 96 C126 78 120 50 100 50 Z" fill="#84CC16"/>
      <circle cx="84" cy="116" r="7" fill="#ECFCCB" opacity="0.5"/>
    `),
  },
  {
    id: 'pineapple',
    label: 'Pineapple',
    category: 'Food & Treats',
    keywords: ['pineapple', 'pineapples', 'tropical', 'fruit'],
    imageUrl: makeSvg('#FEF9C3', `
      <polygon points="100,26 84,68 116,68" fill="#16A34A"/>
      <polygon points="72,38 86,70 102,64" fill="#22C55E"/>
      <polygon points="128,38 114,70 98,64" fill="#22C55E"/>
      <ellipse cx="100" cy="116" rx="40" ry="48" fill="#F59E0B"/>
      <path d="M68 94 L132 138 M68 138 L132 94" stroke="#B45309" stroke-width="4" opacity="0.6"/>
    `),
  },
  {
    id: 'mango',
    label: 'Mango',
    category: 'Food & Treats',
    keywords: ['mango', 'mangoes', 'taiwan', 'tropical', 'fruit'],
    imageUrl: makeSvg('#FEF3C7', `
      <ellipse cx="100" cy="104" rx="42" ry="52" fill="#FBBF24" transform="rotate(20 100 104)"/>
      <ellipse cx="88" cy="88" rx="18" ry="26" fill="#F97316" opacity="0.5" transform="rotate(20 88 88)"/>
      <ellipse cx="122" cy="48" rx="14" ry="7" fill="#16A34A" transform="rotate(-20 122 48)"/>
    `),
  },
  {
    id: 'lemon',
    label: 'Lemon',
    category: 'Food & Treats',
    keywords: ['lemon', 'lemons', 'sour', 'yellow', 'citrus'],
    imageUrl: makeSvg('#FEFCE8', `
      <ellipse cx="100" cy="104" rx="58" ry="42" fill="#FDE047"/>
      <circle cx="42" cy="104" r="9" fill="#FDE047"/><circle cx="158" cy="104" r="9" fill="#FDE047"/>
      <ellipse cx="120" cy="58" rx="16" ry="8" fill="#22C55E" transform="rotate(-25 120 58)"/>
    `),
  },
  {
    id: 'avocado',
    label: 'Avocado',
    category: 'Food & Treats',
    keywords: ['avocado', 'avocados', 'green', 'fruit'],
    imageUrl: makeSvg('#DCFCE7', `
      <path d="M100 38 C78 38 66 78 60 112 C56 142 74 164 100 164 C126 164 144 142 140 112 C134 78 122 38 100 38 Z" fill="#15803D"/>
      <path d="M100 46 C84 46 74 82 68 112 C66 138 80 156 100 156 C120 156 134 138 132 112 C126 82 116 46 100 46 Z" fill="#A3E635"/>
      <circle cx="100" cy="124" r="22" fill="#78350F"/>
    `),
  },
  {
    id: 'coconut',
    label: 'Coconut',
    category: 'Food & Treats',
    keywords: ['coconut', 'coconuts', 'island', 'drink'],
    imageUrl: makeSvg('#E0F2FE', `
      <circle cx="100" cy="112" r="46" fill="#78350F"/>
      <ellipse cx="100" cy="82" rx="34" ry="18" fill="#FFF"/>
      <ellipse cx="100" cy="84" rx="26" ry="12" fill="#BAE6FD"/>
      <line x1="108" y1="84" x2="128" y2="40" stroke="#F43F5E" stroke-width="6" stroke-linecap="round"/>
    `),
  },
  {
    id: 'kiwi',
    label: 'Kiwi',
    category: 'Food & Treats',
    keywords: ['kiwi', 'fruit', 'green'],
    imageUrl: makeSvg('#ECFCCB', `
      <circle cx="100" cy="100" r="54" fill="#92400E"/>
      <circle cx="100" cy="100" r="46" fill="#84CC16"/>
      <circle cx="100" cy="100" r="18" fill="#ECFCCB"/>
      <circle cx="80" cy="84" r="3" fill="#1E293B"/><circle cx="120" cy="84" r="3" fill="#1E293B"/>
      <circle cx="76" cy="104" r="3" fill="#1E293B"/><circle cx="124" cy="104" r="3" fill="#1E293B"/>
      <circle cx="84" cy="122" r="3" fill="#1E293B"/><circle cx="116" cy="122" r="3" fill="#1E293B"/>
    `),
  },
  {
    id: 'carrot',
    label: 'Carrot',
    category: 'Food & Treats',
    keywords: ['carrot', 'carrots', 'vegetable', 'veggie', 'orange'],
    imageUrl: makeSvg('#ECFDF5', `
      <path d="M100 56 L84 30 M100 56 L100 26 M100 56 L116 30" stroke="#16A34A" stroke-width="8" stroke-linecap="round"/>
      <polygon points="72,56 128,56 100,168" fill="#F97316"/>
      <line x1="82" y1="84" x2="104" y2="84" stroke="#EA580C" stroke-width="4" stroke-linecap="round"/>
      <line x1="92" y1="112" x2="112" y2="112" stroke="#EA580C" stroke-width="4" stroke-linecap="round"/>
    `),
  },
  {
    id: 'tomato',
    label: 'Tomato',
    category: 'Food & Treats',
    keywords: ['tomato', 'tomatoes', 'vegetable', 'red'],
    imageUrl: makeSvg('#FEE2E2', `
      <circle cx="100" cy="110" r="50" fill="#EF4444"/>
      <polygon points="82,62 100,46 118,62 106,72 94,72" fill="#16A34A"/>
      <circle cx="78" cy="96" r="8" fill="#FFF" opacity="0.45"/>
    `),
  },
  {
    id: 'corn',
    label: 'Corn',
    category: 'Food & Treats',
    keywords: ['corn', 'maize', 'vegetable', 'yellow'],
    imageUrl: makeSvg('#FEF9C3', `
      <ellipse cx="100" cy="96" rx="28" ry="56" fill="#FACC15"/>
      <path d="M62 104 Q76 156 100 160 Q82 128 62 104 Z" fill="#22C55E"/>
      <path d="M138 104 Q124 156 100 160 Q118 128 138 104 Z" fill="#16A34A"/>
      <line x1="84" y1="74" x2="116" y2="74" stroke="#CA8A04" stroke-width="3"/><line x1="80" y1="96" x2="120" y2="96" stroke="#CA8A04" stroke-width="3"/>
    `),
  },
  {
    id: 'broccoli',
    label: 'Broccoli',
    category: 'Food & Treats',
    keywords: ['broccoli', 'vegetable', 'green', 'healthy'],
    imageUrl: makeSvg('#ECFDF5', `
      <rect x="86" y="106" width="28" height="58" rx="10" fill="#84CC16"/>
      <circle cx="70" cy="84" r="26" fill="#16A34A"/><circle cx="130" cy="84" r="26" fill="#16A34A"/>
      <circle cx="100" cy="64" r="28" fill="#22C55E"/><circle cx="100" cy="94" r="24" fill="#15803D"/>
    `),
  },
  {
    id: 'potato',
    label: 'Potato',
    category: 'Food & Treats',
    keywords: ['potato', 'potatoes', 'vegetable', 'fries'],
    imageUrl: makeSvg('#FEF3C7', `
      <ellipse cx="100" cy="104" rx="54" ry="38" fill="#D97706" transform="rotate(-12 100 104)"/>
      <circle cx="76" cy="94" r="4" fill="#78350F"/><circle cx="118" cy="110" r="4" fill="#78350F"/><circle cx="106" cy="86" r="3" fill="#78350F"/>
    `),
  },
  {
    id: 'onion',
    label: 'Onion / Garlic',
    category: 'Food & Treats',
    keywords: ['onion', 'garlic', 'vegetable', 'cook'],
    imageUrl: makeSvg('#FAF5FF', `
      <path d="M100 34 C94 54 54 76 54 114 C54 146 76 164 100 164 C124 164 146 146 146 114 C146 76 106 54 100 34 Z" fill="#C084FC"/>
      <path d="M100 50 Q80 106 100 160 M100 50 Q120 106 100 160" stroke="#A855F7" stroke-width="3" fill="none"/>
    `),
  },
  {
    id: 'mushroom',
    label: 'Mushroom',
    category: 'Food & Treats',
    keywords: ['mushroom', 'mushrooms', 'toadstool', 'forest'],
    imageUrl: makeSvg('#FEF2F2', `
      <rect x="82" y="102" width="36" height="60" rx="14" fill="#FEF3C7"/>
      <path d="M40 106 C40 48 160 48 160 106 Z" fill="#EF4444"/>
      <circle cx="74" cy="80" r="10" fill="#FFF"/><circle cx="112" cy="70" r="8" fill="#FFF"/><circle cx="132" cy="90" r="7" fill="#FFF"/>
    `),
  },
  {
    id: 'spinach',
    label: 'Spinach / Salad',
    category: 'Food & Treats',
    keywords: ['spinach', 'salad', 'lettuce', 'greens', 'vegetable'],
    imageUrl: makeSvg('#ECFDF5', `
      <ellipse cx="82" cy="96" rx="30" ry="44" fill="#16A34A" transform="rotate(-18 82 96)"/>
      <ellipse cx="118" cy="96" rx="30" ry="44" fill="#22C55E" transform="rotate(18 118 96)"/>
      <line x1="84" y1="68" x2="96" y2="152" stroke="#BBF7D0" stroke-width="4" stroke-linecap="round"/>
      <line x1="116" y1="68" x2="104" y2="152" stroke="#BBF7D0" stroke-width="4" stroke-linecap="round"/>
    `),
  },
  {
    id: 'pizza',
    label: 'Pizza',
    category: 'Food & Treats',
    keywords: ['pizza', 'pizzas', 'cheese', 'slice', 'lunch'],
    imageUrl: makeSvg('#FFF7ED', `
      <polygon points="100,164 42,58 158,58" fill="#FACC15"/>
      <path d="M38 56 Q100 38 162 56" stroke="#D97706" stroke-width="18" stroke-linecap="round" fill="none"/>
      <circle cx="86" cy="88" r="10" fill="#EF4444"/><circle cx="116" cy="96" r="10" fill="#EF4444"/><circle cx="98" cy="126" r="9" fill="#EF4444"/>
    `),
  },
  {
    id: 'burger',
    label: 'Burger / Hamburger',
    category: 'Food & Treats',
    keywords: ['burger', 'hamburger', 'cheeseburger', 'lunch', 'fast food'],
    imageUrl: makeSvg('#FEF3C7', `
      <path d="M44 92 C44 46 156 46 156 92 Z" fill="#F59E0B"/>
      <circle cx="76" cy="68" r="3" fill="#FEF3C7"/><circle cx="102" cy="62" r="3" fill="#FEF3C7"/><circle cx="126" cy="70" r="3" fill="#FEF3C7"/>
      <path d="M42 96 Q70 106 100 96 Q130 106 158 96" stroke="#22C55E" stroke-width="9" stroke-linecap="round" fill="none"/>
      <rect x="40" y="106" width="120" height="22" rx="10" fill="#78350F"/>
      <polygon points="56,106 144,106 112,124" fill="#FACC15"/>
      <rect x="44" y="130" width="112" height="22" rx="10" fill="#F59E0B"/>
    `),
  },
  {
    id: 'sandwich',
    label: 'Sandwich',
    category: 'Food & Treats',
    keywords: ['sandwich', 'sandwiches', 'bread', 'lunch', 'picnic'],
    imageUrl: makeSvg('#FFFBEB', `
      <polygon points="36,126 106,52 166,126" fill="#FDE68A" stroke="#D97706" stroke-width="5" stroke-linejoin="round"/>
      <rect x="44" y="126" width="114" height="10" rx="4" fill="#22C55E"/>
      <rect x="44" y="136" width="114" height="10" rx="4" fill="#EF4444"/>
      <rect x="40" y="146" width="122" height="16" rx="6" fill="#F59E0B"/>
    `),
  },
  {
    id: 'hotdog',
    label: 'Hot Dog',
    category: 'Food & Treats',
    keywords: ['hotdog', 'hot dog', 'sausage', 'snack'],
    imageUrl: makeSvg('#FFF7ED', `
      <rect x="38" y="84" width="124" height="44" rx="22" fill="#FBBF24"/>
      <rect x="28" y="92" width="144" height="28" rx="14" fill="#DC2626"/>
      <path d="M44 106 Q58 96 72 106 Q86 116 100 106 Q114 96 128 106 Q142 116 156 106" stroke="#FACC15" stroke-width="5" fill="none" stroke-linecap="round"/>
    `),
  },
  {
    id: 'fries',
    label: 'French Fries',
    category: 'Food & Treats',
    keywords: ['fries', 'french fries', 'chips', 'snack'],
    imageUrl: makeSvg('#FEF2F2', `
      <rect x="64" y="42" width="14" height="60" rx="5" fill="#FACC15"/>
      <rect x="84" y="34" width="14" height="68" rx="5" fill="#FDE047"/>
      <rect x="104" y="38" width="14" height="64" rx="5" fill="#FACC15"/>
      <rect x="124" y="46" width="14" height="56" rx="5" fill="#FDE047"/>
      <polygon points="56,88 144,88 134,162 66,162" fill="#EF4444"/>
      <circle cx="100" cy="124" r="14" fill="#FACC15"/>
    `),
  },
  {
    id: 'taco',
    label: 'Taco',
    category: 'Food & Treats',
    keywords: ['taco', 'tacos', 'food', 'dinner'],
    imageUrl: makeSvg('#FFFBEB', `
      <circle cx="76" cy="96" r="18" fill="#22C55E"/><circle cx="122" cy="96" r="18" fill="#EF4444"/><circle cx="100" cy="88" r="16" fill="#22C55E"/>
      <path d="M38 136 A62 62 0 0 1 162 136 Z" fill="#FBBF24" stroke="#D97706" stroke-width="4"/>
      <circle cx="76" cy="118" r="4" fill="#B45309"/><circle cx="104" cy="112" r="4" fill="#B45309"/><circle cx="126" cy="122" r="4" fill="#B45309"/>
    `),
  },
  {
    id: 'noodles',
    label: 'Noodles / Ramen',
    category: 'Food & Treats',
    keywords: ['noodles', 'noodle', 'ramen', 'pasta', 'spaghetti', 'dinner'],
    imageUrl: makeSvg('#FEF2F2', `
      <line x1="112" y1="38" x2="164" y2="62" stroke="#92400E" stroke-width="6" stroke-linecap="round"/>
      <line x1="112" y1="48" x2="166" y2="76" stroke="#92400E" stroke-width="6" stroke-linecap="round"/>
      <path d="M56 102 Q72 64 90 102 Q106 64 124 102" stroke="#FACC15" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M44 102 A56 54 0 0 0 156 102 Z" fill="#EF4444"/>
      <rect x="78" y="150" width="44" height="10" rx="4" fill="#B91C1C"/>
    `),
  },
  {
    id: 'rice',
    label: 'Rice Bowl',
    category: 'Food & Treats',
    keywords: ['rice', 'bowl', 'dinner', 'lunch', 'meal'],
    imageUrl: makeSvg('#EFF6FF', `
      <path d="M48 100 A52 46 0 0 1 152 100 Z" fill="#FFF" stroke="#E2E8F0" stroke-width="3"/>
      <path d="M44 100 A56 56 0 0 0 156 100 Z" fill="#3B82F6"/>
      <rect x="76" y="150" width="48" height="10" rx="4" fill="#1D4ED8"/>
    `),
  },
  {
    id: 'bread',
    label: 'Bread',
    category: 'Food & Treats',
    keywords: ['bread', 'toast', 'loaf', 'bakery', 'breakfast'],
    imageUrl: makeSvg('#FFFBEB', `
      <path d="M52 84 C52 50 148 50 148 84 L138 148 C138 156 62 156 62 148 Z" fill="#D97706"/>
      <path d="M62 88 C62 60 138 60 138 88 L130 142 L70 142 Z" fill="#FDE68A"/>
    `),
  },
  {
    id: 'croissant',
    label: 'Croissant',
    category: 'Food & Treats',
    keywords: ['croissant', 'bakery', 'bread', 'breakfast'],
    imageUrl: makeSvg('#FFF7ED', `
      <path d="M36 122 Q100 54 164 122 Q132 140 100 132 Q68 140 36 122 Z" fill="#F59E0B"/>
      <path d="M74 88 Q82 114 78 134 M126 88 Q118 114 122 134" stroke="#B45309" stroke-width="4" fill="none"/>
    `),
  },
  {
    id: 'pretzel',
    label: 'Pretzel',
    category: 'Food & Treats',
    keywords: ['pretzel', 'snack', 'bakery'],
    imageUrl: makeSvg('#FEF3C7', `
      <path d="M100 148 C52 148 38 102 64 78 C84 60 102 88 100 116 C98 88 116 60 136 78 C162 102 148 148 100 148 Z" stroke="#B45309" stroke-width="14" fill="none" stroke-linejoin="round"/>
      <circle cx="64" cy="96" r="3" fill="#FFF"/><circle cx="136" cy="96" r="3" fill="#FFF"/><circle cx="100" cy="144" r="3" fill="#FFF"/>
    `),
  },
  {
    id: 'donut',
    label: 'Donut',
    category: 'Food & Treats',
    keywords: ['donut', 'doughnut', 'sweet', 'dessert'],
    imageUrl: makeSvg('#FDF2F8', `
      <circle cx="100" cy="100" r="56" fill="#F59E0B"/>
      <path d="M44 100 A56 56 0 1 1 156 100 Q140 114 126 102 Q112 118 100 104 Q86 118 72 102 Q58 114 44 100 Z" fill="#EC4899"/>
      <circle cx="100" cy="100" r="20" fill="#FDF2F8"/>
      <rect x="70" y="64" width="12" height="5" rx="2.5" fill="#FACC15" transform="rotate(30 76 66)"/>
      <rect x="116" y="68" width="12" height="5" rx="2.5" fill="#38BDF8" transform="rotate(-25 122 70)"/>
      <rect x="96" y="54" width="12" height="5" rx="2.5" fill="#FFF"/>
    `),
  },
  {
    id: 'cookie',
    label: 'Cookie',
    category: 'Food & Treats',
    keywords: ['cookie', 'cookies', 'biscuit', 'snack', 'sweet'],
    imageUrl: makeSvg('#FEF3C7', `
      <circle cx="100" cy="100" r="54" fill="#D97706"/>
      <circle cx="78" cy="82" r="8" fill="#451A03"/><circle cx="118" cy="78" r="7" fill="#451A03"/>
      <circle cx="122" cy="116" r="8" fill="#451A03"/><circle cx="80" cy="122" r="7" fill="#451A03"/><circle cx="100" cy="102" r="6" fill="#451A03"/>
    `),
  },
  {
    id: 'ice_cream',
    label: 'Ice Cream',
    category: 'Food & Treats',
    keywords: ['ice cream', 'icecream', 'cone', 'dessert', 'summer', 'cold'],
    imageUrl: makeSvg('#FCE7F3', `
      <polygon points="72,102 128,102 100,172" fill="#F59E0B"/>
      <circle cx="100" cy="80" r="32" fill="#F472B6"/>
      <circle cx="100" cy="48" r="24" fill="#38BDF8"/>
      <circle cx="100" cy="28" r="7" fill="#EF4444"/>
    `),
  },
  {
    id: 'popsicle',
    label: 'Popsicle',
    category: 'Food & Treats',
    keywords: ['popsicle', 'ice pop', 'summer', 'cold'],
    imageUrl: makeSvg('#E0F2FE', `
      <rect x="92" y="132" width="16" height="40" rx="8" fill="#FDE68A"/>
      <rect x="64" y="40" width="72" height="98" rx="34" fill="#F43F5E"/>
      <rect x="64" y="96" width="72" height="22" fill="#FACC15"/>
      <rect x="78" y="54" width="10" height="48" rx="5" fill="#FFF" opacity="0.4"/>
    `),
  },
  {
    id: 'chocolate',
    label: 'Chocolate',
    category: 'Food & Treats',
    keywords: ['chocolate', 'candy', 'sweet', 'dessert'],
    imageUrl: makeSvg('#FFF7ED', `
      <rect x="56" y="38" width="88" height="90" rx="8" fill="#78350F"/>
      <rect x="64" y="46" width="32" height="26" rx="4" fill="#92400E"/><rect x="104" y="46" width="32" height="26" rx="4" fill="#92400E"/>
      <rect x="64" y="80" width="32" height="26" rx="4" fill="#92400E"/><rect x="104" y="80" width="32" height="26" rx="4" fill="#92400E"/>
      <rect x="52" y="106" width="96" height="60" rx="8" fill="#EF4444"/>
    `),
  },
  {
    id: 'honey',
    label: 'Honey Jar',
    category: 'Food & Treats',
    keywords: ['honey', 'jam', 'jar', 'sweet', 'bee'],
    imageUrl: makeSvg('#FEF9C3', `
      <rect x="72" y="44" width="56" height="18" rx="6" fill="#B45309"/>
      <rect x="58" y="62" width="84" height="96" rx="22" fill="#F59E0B"/>
      <rect x="70" y="92" width="60" height="40" rx="8" fill="#FFF"/>
      <circle cx="100" cy="112" r="10" fill="#FBBF24"/>
    `),
  },
  {
    id: 'egg',
    label: 'Egg / Breakfast',
    category: 'Food & Treats',
    keywords: ['egg', 'eggs', 'breakfast', 'morning'],
    imageUrl: makeSvg('#EFF6FF', `
      <path d="M56 112 C44 82 72 52 104 56 C138 60 156 92 144 126 C134 152 68 148 56 112 Z" fill="#FFF" stroke="#E2E8F0" stroke-width="4"/>
      <circle cx="100" cy="102" r="26" fill="#FACC15"/>
      <circle cx="92" cy="94" r="6" fill="#FEF9C3" opacity="0.7"/>
    `),
  },
  {
    id: 'cheese',
    label: 'Cheese',
    category: 'Food & Treats',
    keywords: ['cheese', 'mouse', 'sandwich', 'dairy'],
    imageUrl: makeSvg('#FEFCE8', `
      <polygon points="36,136 164,136 138,56" fill="#FACC15"/>
      <polygon points="36,136 164,136 164,104 36,104" fill="#EAB308"/>
      <circle cx="80" cy="120" r="9" fill="#CA8A04"/><circle cx="122" cy="116" r="11" fill="#CA8A04"/><circle cx="104" cy="90" r="6" fill="#CA8A04"/>
    `),
  },
  {
    id: 'pancakes',
    label: 'Pancakes',
    category: 'Food & Treats',
    keywords: ['pancake', 'pancakes', 'breakfast', 'syrup'],
    imageUrl: makeSvg('#FFF7ED', `
      <ellipse cx="100" cy="138" rx="64" ry="16" fill="#CBD5E1"/>
      <ellipse cx="100" cy="128" rx="50" ry="14" fill="#D97706"/>
      <ellipse cx="100" cy="112" rx="48" ry="14" fill="#F59E0B"/>
      <ellipse cx="100" cy="96" rx="46" ry="14" fill="#FBBF24"/>
      <rect x="90" y="76" width="20" height="14" rx="3" fill="#FEF08A"/>
    `),
  },
  {
    id: 'muffin',
    label: 'Muffin',
    category: 'Food & Treats',
    keywords: ['muffin', 'muffins', 'bakery', 'snack'],
    imageUrl: makeSvg('#FCE7F3', `
      <path d="M54 96 C54 54 146 54 146 96 Z" fill="#D97706"/>
      <circle cx="84" cy="76" r="5" fill="#451A03"/><circle cx="112" cy="82" r="5" fill="#451A03"/><circle cx="100" cy="64" r="5" fill="#451A03"/>
      <polygon points="58,96 142,96 130,156 70,156" fill="#EC4899"/>
    `),
  },
  {
    id: 'soup',
    label: 'Soup / Dinner',
    category: 'Food & Treats',
    keywords: ['soup', 'hot', 'bowl', 'dinner', 'spoon'],
    imageUrl: makeSvg('#FFF7ED', `
      <path d="M80 68 Q72 52 82 40 M104 68 Q96 52 106 40 M124 68 Q116 52 126 40" stroke="#CBD5E1" stroke-width="5" stroke-linecap="round" fill="none"/>
      <ellipse cx="100" cy="98" rx="58" ry="18" fill="#F59E0B"/>
      <path d="M42 98 A58 56 0 0 0 158 98 Z" fill="#0EA5E9"/>
    `),
  },
  {
    id: 'smoothie',
    label: 'Smoothie / Milkshake',
    category: 'Food & Treats',
    keywords: ['smoothie', 'milkshake', 'shake', 'drink', 'berry'],
    imageUrl: makeSvg('#FCE7F3', `
      <line x1="112" y1="72" x2="132" y2="34" stroke="#10B981" stroke-width="6" stroke-linecap="round"/>
      <path d="M68 82 A32 32 0 0 1 132 82 Z" fill="#FFF"/>
      <polygon points="66,82 134,82 122,162 78,162" fill="#EC4899"/>
      <circle cx="100" cy="54" r="7" fill="#EF4444"/>
    `),
  },
  {
    id: 'juice',
    label: 'Juice Box',
    category: 'Food & Treats',
    keywords: ['juice', 'drink', 'orange', 'box'],
    imageUrl: makeSvg('#FFF7ED', `
      <path d="M112 66 L112 42 L134 36" stroke="#3B82F6" stroke-width="6" stroke-linecap="round" fill="none"/>
      <rect x="64" y="64" width="72" height="98" rx="12" fill="#F97316"/>
      <circle cx="100" cy="114" r="20" fill="#FACC15"/>
    `),
  },
  {
    id: 'tea',
    label: 'Tea / Cocoa Cup',
    category: 'Food & Treats',
    keywords: ['tea', 'coffee', 'cocoa', 'hot', 'mug', 'cup'],
    imageUrl: makeSvg('#ECFDF5', `
      <path d="M138 92 A18 18 0 0 1 138 128" stroke="#0EA5E9" stroke-width="9" fill="none"/>
      <path d="M62 82 L138 82 L130 144 C128 156 72 156 70 144 Z" fill="#38BDF8"/>
      <ellipse cx="100" cy="82" rx="38" ry="10" fill="#78350F"/>
      <path d="M88 64 Q82 50 92 40 M112 64 Q106 50 116 40" stroke="#94A3B8" stroke-width="4" stroke-linecap="round" fill="none"/>
    `),
  },
  {
    id: 'popcorn',
    label: 'Popcorn',
    category: 'Food & Treats',
    keywords: ['popcorn', 'movie', 'cinema', 'snack'],
    imageUrl: makeSvg('#FEF2F2', `
      <circle cx="76" cy="70" r="16" fill="#FEF9C3"/><circle cx="100" cy="60" r="18" fill="#FFF"/>
      <circle cx="124" cy="70" r="16" fill="#FEF9C3"/><circle cx="88" cy="80" r="15" fill="#FFF"/><circle cx="114" cy="80" r="15" fill="#FFF"/>
      <polygon points="60,82 140,82 128,162 72,162" fill="#EF4444"/>
      <polygon points="82,82 96,82 92,162 82,162" fill="#FFF"/><polygon points="106,82 118,82 114,162 104,162" fill="#FFF"/>
    `),
  },
  {
    id: 'candy',
    label: 'Candy / Lollipop',
    category: 'Food & Treats',
    keywords: ['candy', 'lollipop', 'sweet', 'sugar', 'treat'],
    imageUrl: makeSvg('#FDF2F8', `
      <rect x="95" y="114" width="10" height="56" rx="5" fill="#CBD5E1"/>
      <circle cx="100" cy="82" r="42" fill="#EC4899"/>
      <path d="M100 82 m-26,0 a26,26 0 1,0 52,0 a16,16 0 1,0 -32,0 a6,6 0 1,0 12,0" stroke="#FFF" stroke-width="6" fill="none" stroke-linecap="round"/>
    `),
  },
];
