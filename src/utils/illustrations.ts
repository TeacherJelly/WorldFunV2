import { IllustrationPreset } from '../types';

const makeSvg = (bg: string, body: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" rx="36" fill="${bg}"/>${body}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const ILLUSTRATION_LIBRARY: IllustrationPreset[] = [
  // ANIMALS
  {
    id: 'puppy',
    label: 'Puppy / Dog',
    category: 'Animals',
    keywords: ['puppy', 'puppies', 'dog', 'dogs', 'doggy', 'hound', 'bark', 'woof', 'pet'],
    imageUrl: makeSvg('#FEF3C7', `
      <ellipse cx="48" cy="78" rx="18" ry="34" fill="#B45309" transform="rotate(-18 48 78)"/>
      <ellipse cx="152" cy="78" rx="18" ry="34" fill="#B45309" transform="rotate(18 152 78)"/>
      <ellipse cx="100" cy="108" rx="54" ry="46" fill="#F59E0B"/>
      <circle cx="80" cy="98" r="8" fill="#1E293B"/><circle cx="78" cy="95" r="3" fill="#FFF"/>
      <circle cx="120" cy="98" r="8" fill="#1E293B"/><circle cx="118" cy="95" r="3" fill="#FFF"/>
      <ellipse cx="100" cy="122" rx="24" ry="17" fill="#FDE68A"/>
      <polygon points="100,118 92,110 108,110" fill="#1E293B"/>
      <path d="M90 125 Q100 135 110 125" stroke="#1E293B" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <ellipse cx="100" cy="136" rx="7" ry="8" fill="#F43F5E"/>
    `),
  },
  {
    id: 'cat',
    label: 'Cat / Kitty',
    category: 'Animals',
    keywords: ['cat', 'cats', 'kitty', 'kitten', 'kittens', 'meow', 'purr'],
    imageUrl: makeSvg('#FCE7F3', `
      <polygon points="50,92 42,40 90,66" fill="#FB923C"/>
      <polygon points="150,92 158,40 110,66" fill="#FB923C"/>
      <polygon points="56,82 50,52 80,68" fill="#FBCFE8"/>
      <polygon points="144,82 150,52 120,68" fill="#FBCFE8"/>
      <circle cx="100" cy="112" r="50" fill="#FB923C"/>
      <ellipse cx="80" cy="105" rx="8" ry="10" fill="#10B981"/><circle cx="80" cy="105" r="4" fill="#064E3B"/><circle cx="78" cy="102" r="2" fill="#FFF"/>
      <ellipse cx="120" cy="105" rx="8" ry="10" fill="#10B981"/><circle cx="120" cy="105" r="4" fill="#064E3B"/><circle cx="118" cy="102" r="2" fill="#FFF"/>
      <polygon points="100,120 94,114 106,114" fill="#F43F5E"/>
      <path d="M100 120 L100 127 M92 127 Q100 134 108 127" stroke="#431407" stroke-width="3" stroke-linecap="round" fill="none"/>
      <line x1="60" y1="115" x2="36" y2="110" stroke="#431407" stroke-width="2.5"/>
      <line x1="60" y1="123" x2="35" y2="124" stroke="#431407" stroke-width="2.5"/>
      <line x1="140" y1="115" x2="164" y2="110" stroke="#431407" stroke-width="2.5"/>
      <line x1="140" y1="123" x2="165" y2="124" stroke="#431407" stroke-width="2.5"/>
    `),
  },
  {
    id: 'frog',
    label: 'Frog',
    category: 'Animals',
    keywords: ['frog', 'frogs', 'toad', 'ribbit', 'jump', 'hop', 'pond', 'lily'],
    imageUrl: makeSvg('#ECFDF5', `
      <ellipse cx="100" cy="154" rx="72" ry="22" fill="#059669"/>
      <circle cx="70" cy="74" r="20" fill="#10B981"/><circle cx="70" cy="74" r="11" fill="#FFF"/><circle cx="72" cy="74" r="6" fill="#064E3B"/>
      <circle cx="130" cy="74" r="20" fill="#10B981"/><circle cx="130" cy="74" r="11" fill="#FFF"/><circle cx="128" cy="74" r="6" fill="#064E3B"/>
      <ellipse cx="100" cy="116" rx="52" ry="38" fill="#10B981"/>
      <ellipse cx="100" cy="122" rx="34" ry="24" fill="#A7F3D0"/>
      <path d="M78 116 Q100 134 122 116" stroke="#064E3B" stroke-width="4" stroke-linecap="round" fill="none"/>
      <circle cx="72" cy="115" r="5" fill="#F472B6" opacity="0.65"/>
      <circle cx="128" cy="115" r="5" fill="#F472B6" opacity="0.65"/>
    `),
  },
  {
    id: 'fish',
    label: 'Fish',
    category: 'Animals',
    keywords: ['fish', 'fishes', 'goldfish', 'swim', 'swims', 'ocean', 'sea', 'water'],
    imageUrl: makeSvg('#EFF6FF', `
      <circle cx="48" cy="65" r="7" fill="#93C5FD" opacity="0.7"/>
      <circle cx="62" cy="45" r="5" fill="#93C5FD" opacity="0.7"/>
      <polygon points="146,100 182,72 176,100 182,128" fill="#F97316"/>
      <ellipse cx="105" cy="100" rx="50" ry="35" fill="#FB923C"/>
      <path d="M105 68 Q116 100 105 132" stroke="#FFF" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M126 73 Q135 100 126 127" stroke="#FFF" stroke-width="6" stroke-linecap="round" fill="none"/>
      <circle cx="76" cy="94" r="8" fill="#FFF"/><circle cx="74" cy="94" r="4" fill="#1E293B"/><circle cx="72" cy="92" r="1.5" fill="#FFF"/>
      <path d="M98 106 Q112 126 95 120 Z" fill="#EA580C"/>
    `),
  },
  {
    id: 'butterfly',
    label: 'Butterfly',
    category: 'Animals',
    keywords: ['butterfly', 'butterflies', 'bug', 'flutter', 'wings', 'insect'],
    imageUrl: makeSvg('#FAF5FF', `
      <ellipse cx="64" cy="76" rx="34" ry="38" fill="#C084FC" transform="rotate(-20 64 76)"/>
      <ellipse cx="64" cy="76" rx="18" ry="22" fill="#F472B6" transform="rotate(-20 64 76)"/>
      <ellipse cx="136" cy="76" rx="34" ry="38" fill="#C084FC" transform="rotate(20 136 76)"/>
      <ellipse cx="136" cy="76" rx="18" ry="22" fill="#F472B6" transform="rotate(20 136 76)"/>
      <ellipse cx="74" cy="126" rx="24" ry="28" fill="#A855F7"/>
      <ellipse cx="126" cy="126" rx="24" ry="28" fill="#A855F7"/>
      <ellipse cx="100" cy="100" rx="9" ry="42" fill="#4A044E"/>
      <path d="M96 60 Q80 40 70 45" stroke="#4A044E" stroke-width="3" fill="none"/>
      <circle cx="70" cy="45" r="4" fill="#E879F9"/>
      <path d="M104 60 Q120 40 130 45" stroke="#4A044E" stroke-width="3" fill="none"/>
      <circle cx="130" cy="45" r="4" fill="#E879F9"/>
    `),
  },
  {
    id: 'elephant',
    label: 'Elephant',
    category: 'Animals',
    keywords: ['elephant', 'elephants', 'trunk', 'safari', 'giant'],
    imageUrl: makeSvg('#E0F2FE', `
      <ellipse cx="46" cy="100" rx="30" ry="44" fill="#94A3B8"/>
      <ellipse cx="154" cy="100" rx="30" ry="44" fill="#94A3B8"/>
      <ellipse cx="48" cy="102" rx="18" ry="28" fill="#FBCFE8"/>
      <ellipse cx="152" cy="102" rx="18" ry="28" fill="#FBCFE8"/>
      <circle cx="100" cy="98" r="46" fill="#64748B"/>
      <circle cx="82" cy="88" r="6" fill="#0F172A"/><circle cx="80" cy="86" r="2" fill="#FFF"/>
      <circle cx="118" cy="88" r="6" fill="#0F172A"/><circle cx="116" cy="86" r="2" fill="#FFF"/>
      <path d="M92 108 Q92 155 120 148 Q128 145 124 134" stroke="#64748B" stroke-width="18" stroke-linecap="round" fill="none"/>
    `),
  },
  {
    id: 'lion',
    label: 'Lion',
    category: 'Animals',
    keywords: ['lion', 'lions', 'roar', 'king', 'mane'],
    imageUrl: makeSvg('#FEF9C3', `
      <circle cx="100" cy="102" r="62" fill="#D97706"/>
      <circle cx="62" cy="64" r="14" fill="#F59E0B"/>
      <circle cx="138" cy="64" r="14" fill="#F59E0B"/>
      <circle cx="100" cy="104" r="44" fill="#FBBF24"/>
      <circle cx="84" cy="96" r="6" fill="#1E293B"/><circle cx="82" cy="94" r="2" fill="#FFF"/>
      <circle cx="116" cy="96" r="6" fill="#1E293B"/><circle cx="114" cy="94" r="2" fill="#FFF"/>
      <polygon points="100,115 92,107 108,107" fill="#78350F"/>
      <path d="M100 115 L100 122 M90 124 Q100 132 110 124" stroke="#78350F" stroke-width="3" stroke-linecap="round" fill="none"/>
    `),
  },
  {
    id: 'bear',
    label: 'Bear',
    category: 'Animals',
    keywords: ['bear', 'bears', 'teddy', 'grizzly', 'panda', 'forest'],
    imageUrl: makeSvg('#FEF3C7', `
      <circle cx="56" cy="60" r="20" fill="#92400E"/><circle cx="56" cy="60" r="11" fill="#FDE68A"/>
      <circle cx="144" cy="60" r="20" fill="#92400E"/><circle cx="144" cy="60" r="11" fill="#FDE68A"/>
      <circle cx="100" cy="106" r="52" fill="#B45309"/>
      <ellipse cx="100" cy="122" rx="24" ry="18" fill="#FDE68A"/>
      <circle cx="82" cy="94" r="6" fill="#1E293B"/><circle cx="80" cy="92" r="2" fill="#FFF"/>
      <circle cx="118" cy="94" r="6" fill="#1E293B"/><circle cx="116" cy="92" r="2" fill="#FFF"/>
      <ellipse cx="100" cy="116" rx="9" ry="6" fill="#451A03"/>
      <path d="M91 128 Q100 135 109 128" stroke="#451A03" stroke-width="3" stroke-linecap="round" fill="none"/>
    `),
  },
  {
    id: 'monkey',
    label: 'Monkey',
    category: 'Animals',
    keywords: ['monkey', 'monkeys', 'chimp', 'ape', 'banana', 'jungle'],
    imageUrl: makeSvg('#ECFCCB', `
      <circle cx="48" cy="96" r="18" fill="#92400E"/><circle cx="48" cy="96" r="10" fill="#FDE68A"/>
      <circle cx="152" cy="96" r="18" fill="#92400E"/><circle cx="152" cy="96" r="10" fill="#FDE68A"/>
      <circle cx="100" cy="104" r="48" fill="#92400E"/>
      <ellipse cx="86" cy="94" rx="18" ry="18" fill="#FDE68A"/>
      <ellipse cx="114" cy="94" rx="18" ry="18" fill="#FDE68A"/>
      <ellipse cx="100" cy="122" rx="34" ry="24" fill="#FDE68A"/>
      <circle cx="85" cy="92" r="6" fill="#1E293B"/><circle cx="83" cy="90" r="2" fill="#FFF"/>
      <circle cx="115" cy="92" r="6" fill="#1E293B"/><circle cx="113" cy="90" r="2" fill="#FFF"/>
      <path d="M84 124 Q100 138 116 124" stroke="#78350F" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    `),
  },
  {
    id: 'turtle',
    label: 'Turtle',
    category: 'Animals',
    keywords: ['turtle', 'turtles', 'tortoise', 'shell', 'slow'],
    imageUrl: makeSvg('#D1FAE5', `
      <ellipse cx="64" cy="144" rx="14" ry="10" fill="#10B981"/>
      <ellipse cx="136" cy="144" rx="14" ry="10" fill="#10B981"/>
      <circle cx="156" cy="112" r="20" fill="#10B981"/>
      <circle cx="162" cy="108" r="4" fill="#064E3B"/>
      <path d="M40 132 C40 72 140 72 140 132 Z" fill="#059669"/>
      <polygon points="75,90 105,90 115,112 90,126 65,112" fill="#34D399" opacity="0.7"/>
      <rect x="34" y="128" width="112" height="14" rx="7" fill="#FBBF24"/>
    `),
  },
  {
    id: 'bird',
    label: 'Bird / Owl',
    category: 'Animals',
    keywords: ['bird', 'birds', 'owl', 'chick', 'duck', 'penguin', 'fly', 'sing'],
    imageUrl: makeSvg('#E0F2FE', `
      <ellipse cx="100" cy="112" rx="46" ry="44" fill="#38BDF8"/>
      <ellipse cx="100" cy="124" rx="28" ry="26" fill="#E0F2FE"/>
      <ellipse cx="56" cy="116" rx="16" ry="24" fill="#0284C7" transform="rotate(16 56 116)"/>
      <ellipse cx="144" cy="116" rx="16" ry="24" fill="#0284C7" transform="rotate(-16 144 116)"/>
      <circle cx="84" cy="96" r="7" fill="#0F172A"/><circle cx="82" cy="94" r="2.5" fill="#FFF"/>
      <circle cx="116" cy="96" r="7" fill="#0F172A"/><circle cx="114" cy="94" r="2.5" fill="#FFF"/>
      <polygon points="92,106 108,106 100,118" fill="#F59E0B"/>
    `),
  },
  {
    id: 'dinosaur',
    label: 'Dinosaur',
    category: 'Animals',
    keywords: ['dinosaur', 'dino', 'dinosaurs', 'rex', 'dragon'],
    imageUrl: makeSvg('#DCFCE7', `
      <polygon points="72,48 86,34 94,54" fill="#F59E0B"/>
      <polygon points="56,74 70,58 76,78" fill="#F59E0B"/>
      <polygon points="48,104 60,90 66,110" fill="#F59E0B"/>
      <path d="M55 155 L55 100 Q55 55 105 55 Q148 55 148 88 Q148 112 115 112 L115 155 Z" fill="#22C55E"/>
      <circle cx="122" cy="78" r="6" fill="#0F172A"/><circle cx="120" cy="76" r="2" fill="#FFF"/>
      <path d="M114 96 Q130 104 142 94" stroke="#064E3B" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="84" cy="122" r="8" fill="#86EFAC"/>
      <circle cx="98" cy="140" r="6" fill="#86EFAC"/>
    `),
  },
  {
    id: 'rabbit',
    label: 'Rabbit / Bunny',
    category: 'Animals',
    keywords: ['rabbit', 'bunny', 'bunnies', 'hare', 'carrot'],
    imageUrl: makeSvg('#FCE7F3', `
      <ellipse cx="78" cy="56" rx="14" ry="38" fill="#FFF" stroke="#E2E8F0" stroke-width="3"/>
      <ellipse cx="78" cy="58" rx="7" ry="26" fill="#F9A8D4"/>
      <ellipse cx="122" cy="56" rx="14" ry="38" fill="#FFF" stroke="#E2E8F0" stroke-width="3"/>
      <ellipse cx="122" cy="58" rx="7" ry="26" fill="#F9A8D4"/>
      <circle cx="100" cy="116" r="46" fill="#FFF" stroke="#E2E8F0" stroke-width="3"/>
      <circle cx="84" cy="108" r="6" fill="#1E293B"/>
      <circle cx="116" cy="108" r="6" fill="#1E293B"/>
      <polygon points="100,122 94,116 106,116" fill="#F43F5E"/>
      <path d="M90 128 Q100 136 110 128" stroke="#64748B" stroke-width="2.5" fill="none"/>
    `),
  },

  // FOOD & TREATS
  {
    id: 'apple',
    label: 'Apple',
    category: 'Food & Treats',
    keywords: ['apple', 'apples', 'fruit', 'crunchy', 'orchard', 'red'],
    imageUrl: makeSvg('#FEE2E2', `
      <path d="M100 45 C100 22 124 18 128 20" stroke="#15803D" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M124 20 C140 16 148 30 134 36 C120 40 120 26 124 20 Z" fill="#22C55E"/>
      <path d="M100 60 C78 40 42 52 46 98 C50 144 94 172 100 172 C106 172 150 144 154 98 C158 52 122 40 100 60 Z" fill="#EF4444"/>
      <circle cx="78" cy="86" r="8" fill="#FFF" opacity="0.55"/>
      <path d="M86 124 Q100 138 114 124" stroke="#7F1D1D" stroke-width="4" stroke-linecap="round" fill="none"/>
    `),
  },
  {
    id: 'banana',
    label: 'Banana',
    category: 'Food & Treats',
    keywords: ['banana', 'bananas', 'yellow'],
    imageUrl: makeSvg('#FEF9C3', `
      <path d="M52 130 Q100 165 156 68 Q162 56 148 52 Q125 112 58 118 Q44 120 52 130 Z" fill="#FACC15" stroke="#CA8A04" stroke-width="3"/>
      <rect x="148" y="44" width="10" height="12" rx="3" fill="#78350F" transform="rotate(20 152 50)"/>
    `),
  },
  {
    id: 'cake',
    label: 'Cake / Birthday',
    category: 'Food & Treats',
    keywords: ['cake', 'cakes', 'cupcake', 'birthday', 'sweet', 'party', 'candy'],
    imageUrl: makeSvg('#FCE7F3', `
      <rect x="95" y="42" width="10" height="28" rx="3" fill="#38BDF8"/>
      <path d="M100 24 Q108 34 100 42 Q92 34 100 24 Z" fill="#F59E0B"/>
      <rect x="52" y="70" width="96" height="32" rx="12" fill="#F472B6"/>
      <rect x="44" y="102" width="112" height="48" rx="12" fill="#FDE68A"/>
      <path d="M44 104 Q58 122 72 104 Q86 122 100 104 Q114 122 128 104 Q142 122 156 104" fill="#FFF"/>
      <circle cx="72" cy="84" r="5" fill="#FACC15"/>
      <circle cx="100" cy="84" r="5" fill="#34D399"/>
      <circle cx="128" cy="84" r="5" fill="#38BDF8"/>
    `),
  },
  {
    id: 'watermelon',
    label: 'Watermelon',
    category: 'Food & Treats',
    keywords: ['watermelon', 'melon', 'summer', 'juice', 'snack'],
    imageUrl: makeSvg('#DCFCE7', `
      <path d="M36 92 A64 64 0 0 0 164 92 Z" fill="#16A34A"/>
      <path d="M46 92 A54 54 0 0 0 154 92 Z" fill="#BBF7D0"/>
      <path d="M52 92 A48 48 0 0 0 148 92 Z" fill="#EF4444"/>
      <circle cx="80" cy="108" r="3.5" fill="#1E293B"/>
      <circle cx="100" cy="118" r="3.5" fill="#1E293B"/>
      <circle cx="120" cy="108" r="3.5" fill="#1E293B"/>
      <circle cx="92" cy="102" r="3" fill="#1E293B"/>
      <circle cx="110" cy="102" r="3" fill="#1E293B"/>
    `),
  },
  {
    id: 'milk',
    label: 'Milk / Drink',
    category: 'Food & Treats',
    keywords: ['milk', 'drink', 'drinks', 'cup', 'glass', 'breakfast'],
    imageUrl: makeSvg('#E0F2FE', `
      <polygon points="68,52 132,52 124,158 76,158" fill="#FFF" stroke="#38BDF8" stroke-width="5" stroke-linejoin="round"/>
      <polygon points="72,82 128,82 122,154 78,154" fill="#F1F5F9"/>
      <path d="M72 82 Q100 92 128 82" stroke="#CBD5E1" stroke-width="3" fill="none"/>
      <circle cx="90" cy="118" r="4" fill="#38BDF8"/>
      <circle cx="110" cy="118" r="4" fill="#38BDF8"/>
      <path d="M92 130 Q100 137 108 130" stroke="#0284C7" stroke-width="3" stroke-linecap="round" fill="none"/>
    `),
  },

  // NATURE & SKY
  {
    id: 'sun',
    label: 'Sun',
    category: 'Nature & Sky',
    keywords: ['sun', 'sunny', 'sunshine', 'bright', 'warm', 'day', 'morning', 'shine', 'shines'],
    imageUrl: makeSvg('#FFFBEB', `
      <g stroke="#F59E0B" stroke-width="7" stroke-linecap="round">
        <line x1="100" y1="22" x2="100" y2="40"/><line x1="100" y1="160" x2="100" y2="178"/>
        <line x1="22" y1="100" x2="40" y2="100"/><line x1="160" y1="100" x2="178" y2="100"/>
        <line x1="44" y1="44" x2="58" y2="58"/><line x1="142" y1="142" x2="156" y2="156"/>
        <line x1="44" y1="156" x2="58" y2="142"/><line x1="142" y1="58" x2="156" y2="44"/>
      </g>
      <circle cx="100" cy="100" r="46" fill="#FBBF24"/>
      <circle cx="85" cy="94" r="5.5" fill="#78350F"/><circle cx="115" cy="94" r="5.5" fill="#78350F"/>
      <path d="M85 110 Q100 124 115 110" stroke="#78350F" stroke-width="4" stroke-linecap="round" fill="none"/>
    `),
  },
  {
    id: 'rainbow',
    label: 'Rainbow',
    category: 'Nature & Sky',
    keywords: ['rainbow', 'rainbows', 'colorful', 'colors', 'sky'],
    imageUrl: makeSvg('#E0F2FE', `
      <ellipse cx="100" cy="142" rx="74" ry="74" fill="none" stroke="#EF4444" stroke-width="11"/>
      <ellipse cx="100" cy="142" rx="63" ry="63" fill="none" stroke="#F59E0B" stroke-width="11"/>
      <ellipse cx="100" cy="142" rx="52" ry="52" fill="none" stroke="#10B981" stroke-width="11"/>
      <ellipse cx="100" cy="142" rx="41" ry="41" fill="none" stroke="#3B82F6" stroke-width="11"/>
      <ellipse cx="100" cy="142" rx="30" ry="30" fill="none" stroke="#8B5CF6" stroke-width="11"/>
      <circle cx="42" cy="142" r="20" fill="#FFF"/><circle cx="60" cy="146" r="16" fill="#FFF"/>
      <circle cx="158" cy="142" r="20" fill="#FFF"/><circle cx="140" cy="146" r="16" fill="#FFF"/>
    `),
  },
  {
    id: 'star',
    label: 'Star',
    category: 'Nature & Sky',
    keywords: ['star', 'stars', 'twinkle', 'gold', 'night', 'moon', 'shiny'],
    imageUrl: makeSvg('#FEF9C3', `
      <polygon points="100,26 122,74 174,78 134,114 148,166 100,138 52,166 66,114 26,78 78,74" fill="#FBBF24" stroke="#F59E0B" stroke-width="4"/>
      <circle cx="86" cy="96" r="5" fill="#78350F"/><circle cx="114" cy="96" r="5" fill="#78350F"/>
      <path d="M88 112 Q100 124 112 112" stroke="#78350F" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    `),
  },
  {
    id: 'flower',
    label: 'Flower / Garden',
    category: 'Nature & Sky',
    keywords: ['flower', 'flowers', 'garden', 'park', 'rose', 'daisy', 'plant', 'spring'],
    imageUrl: makeSvg('#FCE7F3', `
      <rect x="95" y="100" width="10" height="72" rx="5" fill="#16A34A"/>
      <ellipse cx="122" cy="142" rx="18" ry="8" fill="#22C55E" transform="rotate(-24 122 142)"/>
      <circle cx="100" cy="52" r="20" fill="#F472B6"/>
      <circle cx="132" cy="76" r="20" fill="#FB7185"/>
      <circle cx="120" cy="112" r="20" fill="#F472B6"/>
      <circle cx="80" cy="112" r="20" fill="#FB7185"/>
      <circle cx="68" cy="76" r="20" fill="#F472B6"/>
      <circle cx="100" cy="84" r="20" fill="#FACC15"/>
      <circle cx="94" cy="82" r="3" fill="#78350F"/><circle cx="106" cy="82" r="3" fill="#78350F"/>
      <path d="M94 90 Q100 96 106 90" stroke="#78350F" stroke-width="2.5" fill="none"/>
    `),
  },
  {
    id: 'tree',
    label: 'Tree',
    category: 'Nature & Sky',
    keywords: ['tree', 'trees', 'woods', 'leaf', 'leaves', 'green'],
    imageUrl: makeSvg('#DCFCE7', `
      <rect x="86" y="114" width="28" height="58" rx="6" fill="#92400E"/>
      <circle cx="100" cy="74" r="42" fill="#16A34A"/>
      <circle cx="68" cy="96" r="32" fill="#22C55E"/>
      <circle cx="132" cy="96" r="32" fill="#22C55E"/>
      <circle cx="86" cy="72" r="7" fill="#EF4444"/>
      <circle cx="118" cy="86" r="7" fill="#EF4444"/>
    `),
  },
  {
    id: 'cloud',
    label: 'Cloud / Rain',
    category: 'Nature & Sky',
    keywords: ['cloud', 'clouds', 'rain', 'weather', 'wind', 'storm'],
    imageUrl: makeSvg('#E0F2FE', `
      <circle cx="72" cy="92" r="28" fill="#FFF"/>
      <circle cx="108" cy="80" r="34" fill="#FFF"/>
      <circle cx="136" cy="98" r="24" fill="#FFF"/>
      <rect x="64" y="92" width="78" height="30" rx="15" fill="#FFF"/>
      <ellipse cx="76" cy="144" rx="5" ry="9" fill="#0EA5E9"/>
      <ellipse cx="100" cy="152" rx="5" ry="9" fill="#0EA5E9"/>
      <ellipse cx="124" cy="144" rx="5" ry="9" fill="#0EA5E9"/>
    `),
  },

  // VEHICLES & SPACE
  {
    id: 'rocket',
    label: 'Rocket / Space',
    category: 'Vehicles & Space',
    keywords: ['rocket', 'rockets', 'space', 'planet', 'planets', 'astronaut', 'spaceship', 'moon'],
    imageUrl: makeSvg('#1E1B4B', `
      <circle cx="44" cy="48" r="3" fill="#FDE047"/><circle cx="160" cy="56" r="2.5" fill="#FDE047"/>
      <circle cx="38" cy="144" r="3" fill="#FDE047"/><circle cx="154" cy="148" r="3" fill="#FDE047"/>
      <polygon points="90,145 100,182 110,145" fill="#EF4444"/>
      <polygon points="80,120 50,150 80,145" fill="#3B82F6"/>
      <polygon points="120,120 150,150 120,145" fill="#3B82F6"/>
      <path d="M100 30 C76 70 76 125 80 145 L120 145 C124 125 124 70 100 30 Z" fill="#F8FAFC"/>
      <circle cx="100" cy="85" r="16" fill="#38BDF8" stroke="#0284C7" stroke-width="3"/>
      <path d="M100 30 C90 45 86 58 84 70 L116 70 C114 58 110 45 100 30 Z" fill="#EF4444"/>
    `),
  },
  {
    id: 'train',
    label: 'Train / Bus / Car',
    category: 'Vehicles & Space',
    keywords: ['train', 'trains', 'bus', 'car', 'cars', 'truck', 'drive', 'ride', 'wheel'],
    imageUrl: makeSvg('#FEF3C7', `
      <circle cx="62" cy="52" r="10" fill="#CBD5E1"/>
      <circle cx="48" cy="36" r="14" fill="#E2E8F0"/>
      <rect x="44" y="84" width="112" height="58" rx="14" fill="#EF4444"/>
      <rect x="108" y="56" width="44" height="44" rx="8" fill="#3B82F6"/>
      <rect x="116" y="64" width="28" height="22" rx="4" fill="#BAE6FD"/>
      <rect x="56" y="66" width="14" height="22" fill="#1E293B"/>
      <circle cx="68" cy="144" r="16" fill="#1E293B"/><circle cx="68" cy="144" r="7" fill="#FACC15"/>
      <circle cx="132" cy="144" r="16" fill="#1E293B"/><circle cx="132" cy="144" r="7" fill="#FACC15"/>
    `),
  },
  {
    id: 'airplane',
    label: 'Airplane',
    category: 'Vehicles & Space',
    keywords: ['airplane', 'plane', 'planes', 'jet', 'airport'],
    imageUrl: makeSvg('#DBEAFE', `
      <polygon points="100,44 122,94 172,110 172,124 118,116 112,148 130,160 130,170 100,162 70,170 70,160 88,148 82,116 28,124 28,110 78,94" fill="#0EA5E9"/>
      <ellipse cx="100" cy="82" rx="8" ry="14" fill="#BAE6FD"/>
    `),
  },

  // TOYS, SCHOOL & FUN
  {
    id: 'book',
    label: 'Book / School',
    category: 'School & Home',
    keywords: ['book', 'books', 'read', 'school', 'learn', 'story', 'study'],
    imageUrl: makeSvg('#EDE9FE', `
      <path d="M40 58 Q70 46 100 62 Q130 46 160 58 L160 144 Q130 132 100 148 Q70 132 40 144 Z" fill="#FFF" stroke="#7C3AED" stroke-width="5"/>
      <line x1="100" y1="62" x2="100" y2="148" stroke="#7C3AED" stroke-width="4"/>
      <line x1="54" y1="82" x2="86" y2="82" stroke="#C4B5FD" stroke-width="4" stroke-linecap="round"/>
      <line x1="54" y1="98" x2="86" y2="98" stroke="#C4B5FD" stroke-width="4" stroke-linecap="round"/>
      <line x1="114" y1="82" x2="146" y2="82" stroke="#C4B5FD" stroke-width="4" stroke-linecap="round"/>
      <line x1="114" y1="98" x2="146" y2="98" stroke="#C4B5FD" stroke-width="4" stroke-linecap="round"/>
    `),
  },
  {
    id: 'music',
    label: 'Guitar / Music',
    category: 'Toys & Music',
    keywords: ['music', 'guitar', 'song', 'sing', 'dance', 'piano', 'drum'],
    imageUrl: makeSvg('#FFF1F2', `
      <path d="M126 42 L126 124" stroke="#E11D48" stroke-width="10" stroke-linecap="round"/>
      <path d="M84 54 L130 40 L130 62 L84 76 Z" fill="#F43F5E"/>
      <ellipse cx="74" cy="134" rx="20" ry="15" fill="#E11D48" transform="rotate(-18 74 134)"/>
      <ellipse cx="116" cy="122" rx="20" ry="15" fill="#E11D48" transform="rotate(-18 116 122)"/>
      <path d="M84 60 L84 134" stroke="#E11D48" stroke-width="10" stroke-linecap="round"/>
    `),
  },
  {
    id: 'ball',
    label: 'Ball / Play',
    category: 'Toys & Music',
    keywords: ['ball', 'balls', 'play', 'toy', 'toys', 'game', 'chase', 'bounce', 'soccer'],
    imageUrl: makeSvg('#FFF7ED', `
      <circle cx="100" cy="100" r="56" fill="#F97316"/>
      <path d="M100 44 A56 56 0 0 1 100 156" fill="none" stroke="#FFF" stroke-width="5"/>
      <path d="M52 74 Q100 100 52 126" fill="none" stroke="#FFF" stroke-width="5"/>
      <path d="M148 74 Q100 100 148 126" fill="none" stroke="#FFF" stroke-width="5"/>
      <circle cx="100" cy="100" r="56" fill="none" stroke="#EA580C" stroke-width="4"/>
    `),
  },
  {
    id: 'treasure',
    label: 'Treasure / Crown',
    category: 'Adventure',
    keywords: ['treasure', 'crown', 'gold', 'magic', 'castle', 'princess', 'happy', 'smile'],
    imageUrl: makeSvg('#FEF3C7', `
      <polygon points="44,136 38,68 72,96 100,52 128,96 162,68 156,136" fill="#FACC15" stroke="#D97706" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="100" cy="108" r="10" fill="#EF4444"/>
      <circle cx="64" cy="112" r="7" fill="#3B82F6"/>
      <circle cx="136" cy="112" r="7" fill="#10B981"/>
    `),
  },
  {
    id: 'house',
    label: 'House / Home',
    category: 'School & Home',
    keywords: ['house', 'home', 'room', 'sleep', 'bed', 'family'],
    imageUrl: makeSvg('#E0F2FE', `
      <polygon points="100,40 36,96 164,96" fill="#EF4444"/>
      <rect x="50" y="96" width="100" height="64" rx="6" fill="#FEF3C7"/>
      <rect x="86" y="116" width="28" height="44" rx="4" fill="#92400E"/>
      <rect x="60" y="112" width="18" height="18" rx="3" fill="#38BDF8"/>
      <rect x="122" y="112" width="18" height="18" rx="3" fill="#38BDF8"/>
    `),
  },
];

export function createLetterIllustration(text: string): string {
  const clean = text.trim();
  const initial = (clean[0] || 'A').toUpperCase();
  const palette = ['#0EA5E9', '#F59E0B', '#EC4899', '#10B981', '#8B5CF6', '#F43F5E'];
  const color = palette[clean.length % palette.length];
  return makeSvg('#F8FAFC', `
    <circle cx="100" cy="100" r="64" fill="${color}"/>
    <circle cx="100" cy="100" r="54" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="8 8" opacity="0.6"/>
    <text x="100" y="122" text-anchor="middle" font-size="72" font-weight="900" font-family="Fredoka, sans-serif" fill="#FFFFFF">${initial}</text>
  `);
}

/**
 * Automatically extracts matching subject & illustration from any sentence or word.
 */
export function findMatchingIllustration(text: string): {
  preset: IllustrationPreset | null;
  imageUrl: string;
  category: string;
} {
  const lower = text.toLowerCase();
  const words = lower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

  // Score presets by keyword matches (exact word match prioritized over substring)
  let bestPreset: IllustrationPreset | null = null;
  let bestScore = 0;

  for (const preset of ILLUSTRATION_LIBRARY) {
    let score = 0;
    for (const kw of preset.keywords) {
      if (words.includes(kw)) {
        score += 10;
      } else if (lower.includes(kw) && kw.length >= 4) {
        score += 4;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestPreset = preset;
    }
  }

  if (bestPreset) {
    return {
      preset: bestPreset,
      imageUrl: bestPreset.imageUrl,
      category: bestPreset.category,
    };
  }

  return {
    preset: null,
    imageUrl: createLetterIllustration(text),
    category: autoCategorize(text),
  };
}

export function autoCategorize(text: string): string {
  const lower = text.toLowerCase();
  const match = (kws: string[]) => kws.some(k => lower.includes(k));

  if (match(['dog', 'puppy', 'cat', 'kitty', 'frog', 'fish', 'bird', 'lion', 'bear', 'elephant', 'monkey', 'turtle', 'rabbit', 'bunny', 'dino', 'butterfly'])) {
    return 'Animals';
  }
  if (match(['apple', 'banana', 'cake', 'watermelon', 'milk', 'eat', 'food', 'fruit', 'sweet', 'cookie', 'pizza'])) {
    return 'Food & Treats';
  }
  if (match(['sun', 'rain', 'rainbow', 'star', 'moon', 'sky', 'tree', 'flower', 'garden', 'cloud', 'nature'])) {
    return 'Nature & Sky';
  }
  if (match(['rocket', 'space', 'planet', 'car', 'bus', 'train', 'airplane', 'plane', 'fly'])) {
    return 'Vehicles & Space';
  }
  if (match(['music', 'guitar', 'song', 'ball', 'play', 'toy', 'game', 'dance'])) {
    return 'Toys & Music';
  }
  if (match(['book', 'read', 'school', 'house', 'home', 'learn'])) {
    return 'School & Home';
  }
  return 'Vocabulary Fun';
}

export function searchIllustrations(query: string): IllustrationPreset[] {
  const q = query.trim().toLowerCase();
  if (!q) return ILLUSTRATION_LIBRARY;
  return ILLUSTRATION_LIBRARY.filter(
    item =>
      item.label.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keywords.some(k => k.includes(q))
  );
}
