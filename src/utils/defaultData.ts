import { GameItem, GradeLevel, SemesterNumber, UnitNumber, VocabFolder } from '../types';
import { findMatchingIllustration } from './illustrations';

export const DEFAULT_FOLDER_ID = 'folder-starter-animals';

export const DEFAULT_FOLDERS: VocabFolder[] = [
  {
    id: 'folder-starter-animals',
    name: 'Animals & Pets',
    description: 'Puppies, cats, frogs, ocean creatures, and wild animals.',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
    isStarter: true,
  },
  {
    id: 'folder-starter-nature',
    name: 'Nature & Weather',
    description: 'Sunshine, clouds, rainbows, flowers, trees, and seasons.',
    createdAt: '2026-01-01T08:05:00.000Z',
    updatedAt: '2026-01-01T08:05:00.000Z',
    isStarter: true,
  },
  {
    id: 'folder-starter-food',
    name: 'Food & Treats',
    description: 'Fruits, bakery snacks, veggies, drinks, and yummy treats.',
    createdAt: '2026-01-01T08:10:00.000Z',
    updatedAt: '2026-01-01T08:10:00.000Z',
    isStarter: true,
  },
  {
    id: 'folder-starter-space',
    name: 'Space & Travel',
    description: 'Rockets, stars, planets, trains, airplanes, and journeys.',
    createdAt: '2026-01-01T08:15:00.000Z',
    updatedAt: '2026-01-01T08:15:00.000Z',
    isStarter: true,
  },
  {
    id: 'folder-starter-school',
    name: 'School, Arts & Fun',
    description: 'Books, music, toys, games, friends, and everyday stories.',
    createdAt: '2026-01-01T08:20:00.000Z',
    updatedAt: '2026-01-01T08:20:00.000Z',
    isStarter: true,
  },
];

export function categoryToStarterFolderId(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('animal')) return 'folder-starter-animals';
  if (c.includes('nature') || c.includes('sky')) return 'folder-starter-nature';
  if (c.includes('food') || c.includes('treat')) return 'folder-starter-food';
  if (c.includes('vehicle') || c.includes('space')) return 'folder-starter-space';
  return 'folder-starter-school';
}

const makeItem = (
  id: string,
  text: string,
  mode: 'sentence' | 'spelling',
  grade: GradeLevel,
  semester: SemesterNumber,
  unit: UnitNumber,
  hint: string,
  categoryOverride?: string
): GameItem => {
  const matched = findMatchingIllustration(text);
  const resolvedCategory = categoryOverride || matched.category;
  return {
    id,
    folderId: categoryToStarterFolderId(resolvedCategory),
    text,
    mode,
    grade,
    semester,
    unit,
    category: resolvedCategory,
    imageUrl: matched.imageUrl,
    hint,
  };
};

export const DEFAULT_SENTENCE_ITEMS: GameItem[] = [
  // ================= GRADE 1 · 1st SEMESTER =================
  makeItem('s-g1-s1-u1-1', 'Big red cat', 'sentence', 1, 1, 1, 'A soft furry pet saying meow!'),
  makeItem('s-g1-s1-u1-2', 'Happy little puppy', 'sentence', 1, 1, 1, 'A cute dog wagging its tail!'),
  makeItem('s-g1-s1-u1-3', 'Green frog jumps', 'sentence', 1, 1, 1, 'Ribbit! Hopping near a pond!'),

  makeItem('s-g1-s1-u2-1', 'Bright yellow sun', 'sentence', 1, 1, 2, 'Shining warmly in the sky!'),
  makeItem('s-g1-s1-u2-2', 'Pretty pink flower', 'sentence', 1, 1, 2, 'Blooming in the sunny garden!'),
  makeItem('s-g1-s1-u2-3', 'Little blue bird', 'sentence', 1, 1, 2, 'Chirping sweetly on a branch!'),

  makeItem('s-g1-s1-u3-1', 'Sweet red apple', 'sentence', 1, 1, 3, 'A crunchy fruit to eat!'),
  makeItem('s-g1-s1-u3-2', 'Yummy birthday cake', 'sentence', 1, 1, 3, 'A sweet party treat with frosting!'),
  makeItem('s-g1-s1-u3-3', 'Long yellow banana', 'sentence', 1, 1, 3, 'A healthy snack monkeys love!'),

  makeItem('s-g1-s1-u4-1', 'Cozy red house', 'sentence', 1, 1, 4, 'A warm home where families live!'),
  makeItem('s-g1-s1-u4-2', 'Fast toy train', 'sentence', 1, 1, 4, 'Choo-choo along the tracks!'),
  makeItem('s-g1-s1-u4-3', 'Shiny gold star', 'sentence', 1, 1, 4, 'Twinkling brightly at night!'),

  // ================= GRADE 1 · 2nd SEMESTER =================
  makeItem('s-g1-s2-u1-1', 'Little orange fish', 'sentence', 1, 2, 1, 'Swimming happily in clear water!'),
  makeItem('s-g1-s2-u1-2', 'Fluffy white sheep', 'sentence', 1, 2, 1, 'Grazing softly on green grass!'),
  makeItem('s-g1-s2-u1-3', 'Busy yellow bee', 'sentence', 1, 2, 1, 'Buzzing near sweet garden blooms!'),

  makeItem('s-g1-s2-u2-1', 'Soft white cloud', 'sentence', 1, 2, 2, 'Floating slowly across blue sky!'),
  makeItem('s-g1-s2-u2-2', 'Bright silver moon', 'sentence', 1, 2, 2, 'Glowing gently at bedtime!'),
  makeItem('s-g1-s2-u2-3', 'Tall green tree', 'sentence', 1, 2, 2, 'Giving cool shade in sunshine!'),

  makeItem('s-g1-s2-u3-1', 'Fresh cold milk', 'sentence', 1, 2, 3, 'A healthy drink in a tall glass!'),
  makeItem('s-g1-s2-u3-2', 'Warm soft bread', 'sentence', 1, 2, 3, 'Freshly baked for breakfast!'),
  makeItem('s-g1-s2-u3-3', 'Juicy green pear', 'sentence', 1, 2, 3, 'A sweet fruit shaped like a bell!'),

  makeItem('s-g1-s2-u4-1', 'Round red ball', 'sentence', 1, 2, 4, 'Bouncing high in the yard!'),
  makeItem('s-g1-s2-u4-2', 'Fun picture book', 'sentence', 1, 2, 4, 'Full of colorful bedtime tales!'),
  makeItem('s-g1-s2-u4-3', 'Fast blue car', 'sentence', 1, 2, 4, 'Rolling smoothly down the road!'),

  // ================= GRADE 2 · 1st SEMESTER =================
  makeItem('s-g2-s1-u1-1', 'The puppy plays ball', 'sentence', 2, 1, 1, 'A playful little dog outside!'),
  makeItem('s-g2-s1-u1-2', 'Cute cat drinks milk', 'sentence', 2, 1, 1, 'Purring happily by its bowl!'),
  makeItem('s-g2-s1-u1-3', 'Little fish swims fast', 'sentence', 2, 1, 1, 'Gliding smoothly through cool water!'),

  makeItem('s-g2-s1-u2-1', 'Gold stars shine bright', 'sentence', 2, 1, 2, 'Twinkling high above the clouds!'),
  makeItem('s-g2-s1-u2-2', 'White clouds float slowly', 'sentence', 2, 1, 2, 'Soft shapes drifting in blue sky!'),
  makeItem('s-g2-s1-u2-3', 'Green trees grow tall', 'sentence', 2, 1, 2, 'Giving cool shade in the park!'),

  makeItem('s-g2-s1-u3-1', 'Happy kids sing songs', 'sentence', 2, 1, 3, 'Making joyful music together!'),
  makeItem('s-g2-s1-u3-2', 'Red train rolls fast', 'sentence', 2, 1, 3, 'Zooming along iron rails!'),
  makeItem('s-g2-s1-u3-3', 'Brown bear likes honey', 'sentence', 2, 1, 3, 'A sweet forest snack!'),

  makeItem('s-g2-s1-u4-1', 'Sweet red apples fall', 'sentence', 2, 1, 4, 'Dropping gently from the tree!'),
  makeItem('s-g2-s1-u4-2', 'Fresh green melon cools', 'sentence', 2, 1, 4, 'A juicy summer fruit slice!'),
  makeItem('s-g2-s1-u4-3', 'Warm honey cake smells', 'sentence', 2, 1, 4, 'Baked fresh in the kitchen!'),

  // ================= GRADE 2 · 2nd SEMESTER =================
  makeItem('s-g2-s2-u1-1', 'Squirrels gather brown acorns', 'sentence', 2, 2, 1, 'Climbing nimble branches in autumn!'),
  makeItem('s-g2-s2-u1-2', 'Wise owls hoot softly', 'sentence', 2, 2, 1, 'Resting quietly on forest trees!'),
  makeItem('s-g2-s2-u1-3', 'Little rabbits hop home', 'sentence', 2, 2, 1, 'Twitching floppy ears in the meadow!'),

  makeItem('s-g2-s2-u2-1', 'Gentle rain waters gardens', 'sentence', 2, 2, 2, 'Helping green sprouts grow tall!'),
  makeItem('s-g2-s2-u2-2', 'Bright rainbows follow rain', 'sentence', 2, 2, 2, 'Colorful arcs across sunny clouds!'),
  makeItem('s-g2-s2-u2-3', 'Warm sunshine wakes flowers', 'sentence', 2, 2, 2, 'Opening pretty petals every morning!'),

  makeItem('s-g2-s2-u3-1', 'Yellow buses carry kids', 'sentence', 2, 2, 3, 'Driving safely to school each day!'),
  makeItem('s-g2-s2-u3-2', 'Shiny bikes roll smoothly', 'sentence', 2, 2, 3, 'Pedaling along sunny park paths!'),
  makeItem('s-g2-s2-u3-3', 'White planes fly high', 'sentence', 2, 2, 3, 'Soaring cleanly over soft clouds!'),

  makeItem('s-g2-s2-u4-1', 'Sweet purple grapes grow', 'sentence', 2, 2, 4, 'Hanging in juicy bunches on vines!'),
  makeItem('s-g2-s2-u4-2', 'Soft muffins bake golden', 'sentence', 2, 2, 4, 'Smelling delicious inside the oven!'),
  makeItem('s-g2-s2-u4-3', 'Bright oranges taste tangy', 'sentence', 2, 2, 4, 'Packed with sunny vitamin juice!'),

  // ================= GRADE 3 · 1st SEMESTER =================
  makeItem('s-g3-s1-u1-1', 'A brown bear climbs trees', 'sentence', 3, 1, 1, 'Strong paws reaching high branches!'),
  makeItem('s-g3-s1-u1-2', 'The playful monkey eats bananas', 'sentence', 3, 1, 1, 'Swinging happily in the jungle!'),
  makeItem('s-g3-s1-u1-3', 'Green turtles swim in ponds', 'sentence', 3, 1, 1, 'Carrying sturdy shells on their backs!'),

  makeItem('s-g3-s1-u2-1', 'A colorful rainbow fills sky', 'sentence', 3, 1, 2, 'Seven bright colors after gentle rain!'),
  makeItem('s-g3-s1-u2-2', 'The shiny rocket blasts off', 'sentence', 3, 1, 2, 'Zooming upward toward the moon!'),
  makeItem('s-g3-s1-u2-3', 'Bright stars glow at night', 'sentence', 3, 1, 2, 'Sparkling across the dark sky!'),

  makeItem('s-g3-s1-u3-1', 'Young students read story books', 'sentence', 3, 1, 3, 'Discovering fun adventures in class!'),
  makeItem('s-g3-s1-u3-2', 'Happy friends draw bright pictures', 'sentence', 3, 1, 3, 'Using crayons and paper together!'),
  makeItem('s-g3-s1-u3-3', 'Kind children play joyful music', 'sentence', 3, 1, 3, 'Sharing instruments in harmony!'),

  makeItem('s-g3-s1-u4-1', 'Pretty butterflies dance over flowers', 'sentence', 3, 1, 4, 'Fluttering softly from petal to petal!'),
  makeItem('s-g3-s1-u4-2', 'Friendly bees buzz near blossoms', 'sentence', 3, 1, 4, 'Collecting sweet nectar in sunshine!'),
  makeItem('s-g3-s1-u4-3', 'Fresh raindrops water green gardens', 'sentence', 3, 1, 4, 'Helping colorful plants grow strong!'),

  // ================= GRADE 3 · 2nd SEMESTER =================
  makeItem('s-g3-s2-u1-1', 'Playful dolphins leap over waves', 'sentence', 3, 2, 1, 'Splashing cheerfully in blue ocean water!'),
  makeItem('s-g3-s2-u1-2', 'Little crabs walk on sand', 'sentence', 3, 2, 1, 'Scuttling sideways near the tide!'),
  makeItem('s-g3-s2-u1-3', 'Bright whales dive deep below', 'sentence', 3, 2, 1, 'Gliding gently across ocean currents!'),

  makeItem('s-g3-s2-u2-1', 'Silver planets circle our sun', 'sentence', 3, 2, 2, 'Spinning peacefully through outer space!'),
  makeItem('s-g3-s2-u2-2', 'Curved moons shine through clouds', 'sentence', 3, 2, 2, 'Lighting up quiet starry evenings!'),
  makeItem('s-g3-s2-u2-3', 'Fast comets streak past stars', 'sentence', 3, 2, 2, 'Leaving bright icy trails behind!'),

  makeItem('s-g3-s2-u3-1', 'Creative kids paint sunny landscapes', 'sentence', 3, 2, 3, 'Mixing blue and yellow on palettes!'),
  makeItem('s-g3-s2-u3-2', 'Quiet readers explore library shelves', 'sentence', 3, 2, 3, 'Finding exciting animal tales today!'),
  makeItem('s-g3-s2-u3-3', 'Helpful classmates share colored pencils', 'sentence', 3, 2, 3, 'Working kindly together at desks!'),

  makeItem('s-g3-s2-u4-1', 'Farmers gather crisp red apples', 'sentence', 3, 2, 4, 'Filling wooden baskets every autumn!'),
  makeItem('s-g3-s2-u4-2', 'Ripe orange pumpkins grow big', 'sentence', 3, 2, 4, 'Resting on sunny garden vines!'),
  makeItem('s-g3-s2-u4-3', 'Sweet golden pears fill crates', 'sentence', 3, 2, 4, 'Ready for the busy market!'),

  // ================= GRADE 4 · 1st SEMESTER =================
  makeItem('s-g4-s1-u1-1', 'The gentle giant elephant sprays water', 'sentence', 4, 1, 1, 'Cooling off with its long trunk!'),
  makeItem('s-g4-s1-u1-2', 'Clever dolphins leap above blue waves', 'sentence', 4, 1, 1, 'Playful ocean swimmers jumping high!'),
  makeItem('s-g4-s1-u1-3', 'Hungry puppies chase bouncing yellow balls', 'sentence', 4, 1, 1, 'Running joyfully across the green lawn!'),

  makeItem('s-g4-s1-u2-1', 'Our silver airplane soars through clouds', 'sentence', 4, 1, 2, 'Flying smoothly high above the earth!'),
  makeItem('s-g4-s1-u2-2', 'Brave astronauts travel to distant stars', 'sentence', 4, 1, 2, 'Exploring outer space in shiny rockets!'),
  makeItem('s-g4-s1-u2-3', 'Fast trains carry travelers across cities', 'sentence', 4, 1, 2, 'Gliding along smooth steel tracks!'),

  makeItem('s-g4-s1-u3-1', 'Sparkling rainbows appear after warm rain', 'sentence', 4, 1, 3, 'Sunlight shining through tiny water drops!'),
  makeItem('s-g4-s1-u3-2', 'The bright warm sun shines high', 'sentence', 4, 1, 3, 'Bringing golden light to every hill!'),
  makeItem('s-g4-s1-u3-3', 'Soft white clouds drift over mountains', 'sentence', 4, 1, 3, 'Floating peacefully across the valley!'),

  makeItem('s-g4-s1-u4-1', 'Sweet golden bananas ripen in sunshine', 'sentence', 4, 1, 4, 'Turning bright yellow on tropical trees!'),
  makeItem('s-g4-s1-u4-2', 'Crunchy red apples fill wooden baskets', 'sentence', 4, 1, 4, 'Picked fresh from the orchard!'),
  makeItem('s-g4-s1-u4-3', 'Juicy summer melons grow on vines', 'sentence', 4, 1, 4, 'Sweet green fruit in warm gardens!'),

  // ================= GRADE 4 · 2nd SEMESTER =================
  makeItem('s-g4-s2-u1-1', 'Tall spotted giraffes nibble green leaves', 'sentence', 4, 2, 1, 'Reaching high treetops on the savanna!'),
  makeItem('s-g4-s2-u1-2', 'Tuxedo penguins slide across icy snow', 'sentence', 4, 2, 1, 'Diving swiftly into cold ocean water!'),
  makeItem('s-g4-s2-u1-3', 'Swift cheetahs sprint across wide grasslands', 'sentence', 4, 2, 1, 'Running faster than any wild cat!'),

  makeItem('s-g4-s2-u2-1', 'Shining brass compasses guide careful hikers', 'sentence', 4, 2, 2, 'Pointing toward north on forest trails!'),
  makeItem('s-g4-s2-u2-2', 'Wooden sailboats cross sparkling blue bays', 'sentence', 4, 2, 2, 'Catching steady breezes in white sails!'),
  makeItem('s-g4-s2-u2-3', 'Curious explorers sketch mountains in journals', 'sentence', 4, 2, 2, 'Drawing maps of new valleys!'),

  makeItem('s-g4-s2-u3-1', 'Cool autumn breezes scatter golden leaves', 'sentence', 4, 2, 3, 'Swirling gently across quiet neighborhood paths!'),
  makeItem('s-g4-s2-u3-2', 'Morning dew sparkles on fresh clover', 'sentence', 4, 2, 3, 'Glistening like tiny jewels at sunrise!'),
  makeItem('s-g4-s2-u3-3', 'Evening sunsets paint clouds warm orange', 'sentence', 4, 2, 3, 'Glowing softly over distant western hills!'),

  makeItem('s-g4-s2-u4-1', 'Busy bakers knead warm bread dough', 'sentence', 4, 2, 4, 'Preparing crusty loaves before sunrise!'),
  makeItem('s-g4-s2-u4-2', 'Fresh berry pies cool near windows', 'sentence', 4, 2, 4, 'Filling cozy kitchens with sweet aroma!'),
  makeItem('s-g4-s2-u4-3', 'Crisp orchard pears ripen every September', 'sentence', 4, 2, 4, 'Ready to pick in sunny baskets!'),

  // ================= GRADE 5 · 1st SEMESTER =================
  makeItem('s-g5-s1-u1-1', 'Ancient dinosaurs roamed across lush green valleys', 'sentence', 5, 1, 1, 'Giant prehistoric creatures from long ago!'),
  makeItem('s-g5-s1-u1-2', 'Graceful butterflies flutter gently over sunny meadows', 'sentence', 5, 1, 1, 'Painted wings dancing in the breeze!'),
  makeItem('s-g5-s1-u1-3', 'Playful jungle monkeys swing between tall trees', 'sentence', 5, 1, 1, 'Leaping swiftly in the rainforest canopy!'),

  makeItem('s-g5-s1-u2-1', 'Our bright silver rocket zooms past twinkling stars', 'sentence', 5, 1, 2, 'Speeding through space on a mission!'),
  makeItem('s-g5-s1-u2-2', 'Golden morning sunlight warms every green garden plant', 'sentence', 5, 1, 2, 'Helping flowers and leaves grow tall!'),
  makeItem('s-g5-s1-u2-3', 'Curious young scientists study planets through telescopes', 'sentence', 5, 1, 2, 'Looking closely at the night sky!'),

  makeItem('s-g5-s1-u3-1', 'Talented young musicians play cheerful melodies together daily', 'sentence', 5, 1, 3, 'Practicing rhythms and songs as a band!'),
  makeItem('s-g5-s1-u3-2', 'Creative students paint colorful rainbows on big paper', 'sentence', 5, 1, 3, 'Mixing bright shades during art class!'),
  makeItem('s-g5-s1-u3-3', 'Eager readers discover magical worlds in story books', 'sentence', 5, 1, 3, 'Exploring exciting chapters every afternoon!'),

  makeItem('s-g5-s1-u4-1', 'Juicy red watermelon cools everyone on sunny days', 'sentence', 5, 1, 4, 'A refreshing summer fruit slice!'),
  makeItem('s-g5-s1-u4-2', 'Crisp orchard apples give children healthy natural energy', 'sentence', 5, 1, 4, 'Great for lunchboxes and snacks!'),
  makeItem('s-g5-s1-u4-3', 'Fresh berries and sweet bananas make tasty treats', 'sentence', 5, 1, 4, 'Blended into delicious fruit smoothies!'),

  // ================= GRADE 5 · 2nd SEMESTER =================
  makeItem('s-g5-s2-u1-1', 'Careful researchers uncover ancient fossils in rocky canyons', 'sentence', 5, 2, 1, 'Studying footprints preserved inside stone layers!'),
  makeItem('s-g5-s2-u1-2', 'Healthy coral reefs shelter thousands of colorful fish', 'sentence', 5, 2, 1, 'Vibrant underwater habitats full of life!'),
  makeItem('s-g5-s2-u1-3', 'Clever squirrels hide winter acorns beneath mossy oak trees', 'sentence', 5, 2, 1, 'Preparing food stores before frosty snow arrives!'),

  makeItem('s-g5-s2-u2-1', 'Solar eclipses happen when moons block bright sunlight', 'sentence', 5, 2, 2, 'Casting a dramatic shadow across daylight!'),
  makeItem('s-g5-s2-u2-2', 'Spinning galaxies hold billions of glowing distant stars', 'sentence', 5, 2, 2, 'Shining softly through the deep dark universe!'),
  makeItem('s-g5-s2-u2-3', 'Clean glass prisms split white sunlight into rainbows', 'sentence', 5, 2, 2, 'Revealing red, orange, yellow, green, and blue!'),

  makeItem('s-g5-s2-u3-1', 'Confident actors rehearse lively plays on wooden stages', 'sentence', 5, 2, 3, 'Practicing expressive voices before opening night!'),
  makeItem('s-g5-s2-u3-2', 'Wooden violins produce rich melodies in quiet concert halls', 'sentence', 5, 2, 3, 'Blending strings with soft piano notes!'),
  makeItem('s-g5-s2-u3-3', 'Young illustrators sketch expressive characters inside thick notebooks', 'sentence', 5, 2, 3, 'Bringing imaginative stories to life!'),

  makeItem('s-g5-s2-u4-1', 'Green avocado toast provides healthy energy before morning school', 'sentence', 5, 2, 4, 'Packed with helpful natural vitamins!'),
  makeItem('s-g5-s2-u4-2', 'Colorful garden salads combine crisp lettuce and sweet carrots', 'sentence', 5, 2, 4, 'Crunchy fresh vegetables grown locally!'),
  makeItem('s-g5-s2-u4-3', 'Drinking cool pure water keeps active athletes feeling strong', 'sentence', 5, 2, 4, 'Refreshing the body after sunny games!'),

  // ================= GRADE 6 · 1st SEMESTER =================
  makeItem('s-g6-s1-u1-1', 'Colorful butterflies migrate thousands of miles every autumn', 'sentence', 6, 1, 1, 'Amazing travelers guided by warm breezes!'),
  makeItem('s-g6-s1-u1-2', 'The friendly giant elephant loves eating sweet red apples', 'sentence', 6, 1, 1, 'Using its flexible trunk to reach fruit!'),
  makeItem('s-g6-s1-u1-3', 'Clever sea turtles navigate across wide sparkling blue oceans', 'sentence', 6, 1, 1, 'Swimming gracefully through coral reefs!'),

  makeItem('s-g6-s1-u2-1', 'Curious young inventors design clever machines to solve problems', 'sentence', 6, 1, 2, 'Building helpful ideas step by step!'),
  makeItem('s-g6-s1-u2-2', 'Powerful silver rockets carry glowing satellites into high orbit', 'sentence', 6, 1, 2, 'Launching skyward with roaring engines!'),
  makeItem('s-g6-s1-u2-3', 'Modern airplanes connect friendly travelers across distant green continents', 'sentence', 6, 1, 2, 'Soaring swiftly above fluffy white clouds!'),

  makeItem('s-g6-s1-u3-1', 'Happy children read inspiring story books together at school', 'sentence', 6, 1, 3, 'Learning new vocabulary and sharing ideas!'),
  makeItem('s-g6-s1-u3-2', 'Joyful community musicians perform lively concerts under twinkling stars', 'sentence', 6, 1, 3, 'Filling warm evenings with bright melodies!'),
  makeItem('s-g6-s1-u3-3', 'Thoughtful young writers craft exciting tales about hidden treasure', 'sentence', 6, 1, 3, 'Using imagination to build vivid scenes!'),

  makeItem('s-g6-s1-u4-1', 'Refreshing sweet watermelon tastes wonderful after sunny outdoor adventures', 'sentence', 6, 1, 4, 'Sharing cool fruit slices with friends!'),
  makeItem('s-g6-s1-u4-2', 'Kind neighborhood volunteers plant young trees along sunny parks', 'sentence', 6, 1, 4, 'Caring for nature and clean air!'),
  makeItem('s-g6-s1-u4-3', 'Brilliant morning sunshine sparkles brightly across peaceful green hills', 'sentence', 6, 1, 4, 'Welcoming a brand new day outside!'),

  // ================= GRADE 6 · 2nd SEMESTER =================
  makeItem('s-g6-s2-u1-1', 'Clever green chameleons shift skin colors inside leafy jungles', 'sentence', 6, 2, 1, 'Blending quietly among sunny tropical branches!'),
  makeItem('s-g6-s2-u1-2', 'Protecting deep ocean habitats helps whales and dolphins thrive', 'sentence', 6, 2, 1, 'Keeping coastal waters clean and vibrant!'),
  makeItem('s-g6-s2-u1-3', 'Migrating songbirds follow bright stars across peaceful night skies', 'sentence', 6, 2, 1, 'Flying northward when warm spring arrives!'),

  makeItem('s-g6-s2-u2-1', 'Clean solar panels capture bright sunshine to power classrooms', 'sentence', 6, 2, 2, 'Turning natural daylight into helpful electricity!'),
  makeItem('s-g6-s2-u2-2', 'Student engineers program tiny robots to navigate tricky mazes', 'sentence', 6, 2, 2, 'Testing sensors and code with teamwork!'),
  makeItem('s-g6-s2-u2-3', 'Deep space telescopes capture sharp photos of distant nebulae', 'sentence', 6, 2, 2, 'Revealing newborn stars far beyond Earth!'),

  makeItem('s-g6-s2-u3-1', 'Colorful paper lanterns glow warmly during joyful town festivals', 'sentence', 6, 2, 3, 'Celebrating heritage with family music and food!'),
  makeItem('s-g6-s2-u3-2', 'Museum curators preserve ancient pottery and woven heritage textiles', 'sentence', 6, 2, 3, 'Sharing history with curious young visitors!'),
  makeItem('s-g6-s2-u3-3', 'Friendly pen pals exchange handwritten letters across distant oceans', 'sentence', 6, 2, 3, 'Learning traditions from around the world!'),

  makeItem('s-g6-s2-u4-1', 'Snowy mountain peaks feed sparkling fresh rivers down valleys', 'sentence', 6, 2, 4, 'Nourishing forests, farms, and quiet towns!'),
  makeItem('s-g6-s2-u4-2', 'Helpful community gardens supply fresh vegetables to local neighbors', 'sentence', 6, 2, 4, 'Growing tomatoes and herbs together outdoors!'),
  makeItem('s-g6-s2-u4-3', 'Every small act of kindness builds stronger happier neighborhoods', 'sentence', 6, 2, 4, 'Making schools and parks welcoming places!'),
];

export const DEFAULT_SPELLING_ITEMS: GameItem[] = [
  // ================= GRADE 1 · 1st SEMESTER =================
  makeItem('sp-g1-s1-u1-1', 'CAT', 'spelling', 1, 1, 1, 'A furry pet that says meow!'),
  makeItem('sp-g1-s1-u1-2', 'DOG', 'spelling', 1, 1, 1, 'A loyal pet that likes to bark!'),
  makeItem('sp-g1-s1-u1-3', 'FROG', 'spelling', 1, 1, 1, 'A green animal that leaps and ribbits!'),

  makeItem('sp-g1-s1-u2-1', 'SUN', 'spelling', 1, 1, 2, 'Bright yellow light in the daytime sky!'),
  makeItem('sp-g1-s1-u2-2', 'STAR', 'spelling', 1, 1, 2, 'A shining twinkle in the night sky!'),
  makeItem('sp-g1-s1-u2-3', 'TREE', 'spelling', 1, 1, 2, 'Tall plant with green leaves and branches!'),

  makeItem('sp-g1-s1-u3-1', 'CAKE', 'spelling', 1, 1, 3, 'A sweet birthday treat with frosting!'),
  makeItem('sp-g1-s1-u3-2', 'MILK', 'spelling', 1, 1, 3, 'A healthy white drink in a glass!'),
  makeItem('sp-g1-s1-u3-3', 'PEAR', 'spelling', 1, 1, 3, 'A sweet green fruit shaped like a bell!'),

  makeItem('sp-g1-s1-u4-1', 'BOOK', 'spelling', 1, 1, 4, 'Pages filled with fun stories to read!'),
  makeItem('sp-g1-s1-u4-2', 'BALL', 'spelling', 1, 1, 4, 'Round toy that bounces and rolls!'),
  makeItem('sp-g1-s1-u4-3', 'HOME', 'spelling', 1, 1, 4, 'A cozy place where your family lives!'),

  // ================= GRADE 1 · 2nd SEMESTER =================
  makeItem('sp-g1-s2-u1-1', 'DUCK', 'spelling', 1, 2, 1, 'Swims on the pond and says quack!'),
  makeItem('sp-g1-s2-u1-2', 'BEE', 'spelling', 1, 2, 1, 'Small buzzing insect that makes honey!'),
  makeItem('sp-g1-s2-u1-3', 'FOX', 'spelling', 1, 2, 1, 'Red forest animal with a fluffy tail!'),

  makeItem('sp-g1-s2-u2-1', 'RAIN', 'spelling', 1, 2, 2, 'Water drops falling softly from clouds!'),
  makeItem('sp-g1-s2-u2-2', 'LEAF', 'spelling', 1, 2, 2, 'Green part growing on a tree branch!'),
  makeItem('sp-g1-s2-u2-3', 'BLUE', 'spelling', 1, 2, 2, 'Color of a clear sunny sky!'),

  makeItem('sp-g1-s2-u3-1', 'CORN', 'spelling', 1, 2, 3, 'Sweet yellow kernels on a cob!'),
  makeItem('sp-g1-s2-u3-2', 'PLUM', 'spelling', 1, 2, 3, 'Sweet juicy purple orchard fruit!'),
  makeItem('sp-g1-s2-u3-3', 'SOUP', 'spelling', 1, 2, 3, 'Warm yummy meal served in a bowl!'),

  makeItem('sp-g1-s2-u4-1', 'KITE', 'spelling', 1, 2, 4, 'Flies high in the wind on a string!'),
  makeItem('sp-g1-s2-u4-2', 'DOLL', 'spelling', 1, 2, 4, 'Friendly toy buddy for pretend play!'),
  makeItem('sp-g1-s2-u4-3', 'CAR', 'spelling', 1, 2, 4, 'Four-wheeled vehicle driving down roads!'),

  // ================= GRADE 2 · 1st SEMESTER =================
  makeItem('sp-g2-s1-u1-1', 'PUPPY', 'spelling', 2, 1, 1, 'A cute playful baby dog!'),
  makeItem('sp-g2-s1-u1-2', 'FISH', 'spelling', 2, 1, 1, 'Swims smoothly in water with fins!'),
  makeItem('sp-g2-s1-u1-3', 'BIRD', 'spelling', 2, 1, 1, 'Has colorful feathers and sings in trees!'),

  makeItem('sp-g2-s1-u2-1', 'CLOUD', 'spelling', 2, 1, 2, 'Fluffy white shapes floating in the sky!'),
  makeItem('sp-g2-s1-u2-2', 'PLANT', 'spelling', 2, 1, 2, 'Grows green leaves from seeds and water!'),
  makeItem('sp-g2-s1-u2-3', 'MOON', 'spelling', 2, 1, 2, 'Glows softly in the night sky!'),

  makeItem('sp-g2-s1-u3-1', 'MUSIC', 'spelling', 2, 1, 3, 'Happy sounds and songs we dance to!'),
  makeItem('sp-g2-s1-u3-2', 'TRAIN', 'spelling', 2, 1, 3, 'Choo-choo! Travels along iron tracks!'),
  makeItem('sp-g2-s1-u3-3', 'HOUSE', 'spelling', 2, 1, 3, 'A cozy home with windows and a roof!'),

  makeItem('sp-g2-s1-u4-1', 'APPLE', 'spelling', 2, 1, 4, 'A crunchy red fruit you can eat!'),
  makeItem('sp-g2-s1-u4-2', 'BREAD', 'spelling', 2, 1, 4, 'Warm baked loaf used for sandwiches!'),
  makeItem('sp-g2-s1-u4-3', 'GRAPE', 'spelling', 2, 1, 4, 'Small juicy purple fruit growing in bunches!'),

  // ================= GRADE 2 · 2nd SEMESTER =================
  makeItem('sp-g2-s2-u1-1', 'OWL', 'spelling', 2, 2, 1, 'Wise woodland bird with big bright eyes!'),
  makeItem('sp-g2-s2-u1-2', 'BEAR', 'spelling', 2, 2, 1, 'Furry forest animal who loves berries!'),
  makeItem('sp-g2-s2-u1-3', 'DEER', 'spelling', 2, 2, 1, 'Gentle woodland animal that leaps swiftly!'),

  makeItem('sp-g2-s2-u2-1', 'STORM', 'spelling', 2, 2, 2, 'Heavy rain clouds with booming wind!'),
  makeItem('sp-g2-s2-u2-2', 'SNOW', 'spelling', 2, 2, 2, 'Soft cold white flakes in winter!'),
  makeItem('sp-g2-s2-u2-3', 'GRASS', 'spelling', 2, 2, 2, 'Green blades covering sunny parks!'),

  makeItem('sp-g2-s2-u3-1', 'BIKE', 'spelling', 2, 2, 3, 'Two wheels you pedal with your feet!'),
  makeItem('sp-g2-s2-u3-2', 'TRUCK', 'spelling', 2, 2, 3, 'Sturdy vehicle carrying heavy loads!'),
  makeItem('sp-g2-s2-u3-3', 'BOAT', 'spelling', 2, 2, 3, 'Floats smoothly across lakes and rivers!'),

  makeItem('sp-g2-s2-u4-1', 'HONEY', 'spelling', 2, 2, 4, 'Sweet golden treat made by bees!'),
  makeItem('sp-g2-s2-u4-2', 'PEACH', 'spelling', 2, 2, 4, 'Fuzzy sweet summer fruit with a pit!'),
  makeItem('sp-g2-s2-u4-3', 'BERRY', 'spelling', 2, 2, 4, 'Tiny sweet red or blue garden fruit!'),

  // ================= GRADE 3 · 1st SEMESTER =================
  makeItem('sp-g3-s1-u1-1', 'MONKEY', 'spelling', 3, 1, 1, 'Playful jungle animal who loves bananas!'),
  makeItem('sp-g3-s1-u1-2', 'TURTLE', 'spelling', 3, 1, 1, 'Friendly reptile carrying a hard shell!'),
  makeItem('sp-g3-s1-u1-3', 'RABBIT', 'spelling', 3, 1, 1, 'Hopping furry animal with long ears!'),

  makeItem('sp-g3-s1-u2-1', 'ROCKET', 'spelling', 3, 1, 2, 'A spaceship flying up to the moon!'),
  makeItem('sp-g3-s1-u2-2', 'PLANET', 'spelling', 3, 1, 2, 'A large world orbiting around a star!'),
  makeItem('sp-g3-s1-u2-3', 'BRIGHT', 'spelling', 3, 1, 2, 'Full of cheerful shining light!'),

  makeItem('sp-g3-s1-u3-1', 'SCHOOL', 'spelling', 3, 1, 3, 'A place where kids learn and read together!'),
  makeItem('sp-g3-s1-u3-2', 'FRIEND', 'spelling', 3, 1, 3, 'Someone kind you love playing with!'),
  makeItem('sp-g3-s1-u3-3', 'PENCIL', 'spelling', 3, 1, 3, 'Tool used to write and draw pictures!'),

  makeItem('sp-g3-s1-u4-1', 'FLOWER', 'spelling', 3, 1, 4, 'Colorful petals blooming in the garden!'),
  makeItem('sp-g3-s1-u4-2', 'BANANA', 'spelling', 3, 1, 4, 'A long curved yellow fruit!'),
  makeItem('sp-g3-s1-u4-3', 'GARDEN', 'spelling', 3, 1, 4, 'Sunny yard filled with blooms and plants!'),

  // ================= GRADE 3 · 2nd SEMESTER =================
  makeItem('sp-g3-s2-u1-1', 'WHALE', 'spelling', 3, 2, 1, 'Giant gentle ocean mammal that sings!'),
  makeItem('sp-g3-s2-u1-2', 'CORAL', 'spelling', 3, 2, 1, 'Colorful reef home beneath warm waves!'),
  makeItem('sp-g3-s2-u1-3', 'SHELL', 'spelling', 3, 2, 1, 'Pretty spiral treasure found on sandy beaches!'),

  makeItem('sp-g3-s2-u2-1', 'COMET', 'spelling', 3, 2, 2, 'Icy space traveler with a glowing tail!'),
  makeItem('sp-g3-s2-u2-2', 'ORBIT', 'spelling', 3, 2, 2, 'Curved path around a sun or planet!'),
  makeItem('sp-g3-s2-u2-3', 'GALAXY', 'spelling', 3, 2, 2, 'Vast family of billions of stars!'),

  makeItem('sp-g3-s2-u3-1', 'CRAYON', 'spelling', 3, 2, 3, 'Colorful wax stick for drawing fun art!'),
  makeItem('sp-g3-s2-u3-2', 'STORY', 'spelling', 3, 2, 3, 'An exciting tale with heroes and adventures!'),
  makeItem('sp-g3-s2-u3-3', 'ARTIST', 'spelling', 3, 2, 3, 'Someone who paints, draws, or sculpts!'),

  makeItem('sp-g3-s2-u4-1', 'ORANGE', 'spelling', 3, 2, 4, 'Sweet juicy citrus fruit full of sunshine!'),
  makeItem('sp-g3-s2-u4-2', 'MARKET', 'spelling', 3, 2, 4, 'Lively stalls selling fresh fruit and bread!'),
  makeItem('sp-g3-s2-u4-3', 'CARROT', 'spelling', 3, 2, 4, 'Crunchy orange root veggie bunnies adore!'),

  // ================= GRADE 4 · 1st SEMESTER =================
  makeItem('sp-g4-s1-u1-1', 'DOLPHIN', 'spelling', 4, 1, 1, 'Smart ocean swimmer that leaps playfully!'),
  makeItem('sp-g4-s1-u1-2', 'PENGUIN', 'spelling', 4, 1, 1, 'Black-and-white bird that loves icy water!'),
  makeItem('sp-g4-s1-u1-3', 'GIRAFFE', 'spelling', 4, 1, 1, 'Tall spotted animal with a very long neck!'),

  makeItem('sp-g4-s1-u2-1', 'AIRPLANE', 'spelling', 4, 1, 2, 'Flies high through the clouds with wings!'),
  makeItem('sp-g4-s1-u2-2', 'JOURNEY', 'spelling', 4, 1, 2, 'An exciting trip from one place to another!'),
  makeItem('sp-g4-s1-u2-3', 'COMPASS', 'spelling', 4, 1, 2, 'Shows north, south, east, and west!'),

  makeItem('sp-g4-s1-u3-1', 'RAINBOW', 'spelling', 4, 1, 3, 'Colorful arch in the sky after rain!'),
  makeItem('sp-g4-s1-u3-2', 'WEATHER', 'spelling', 4, 1, 3, 'Sunny, rainy, windy, or snowy skies!'),
  makeItem('sp-g4-s1-u3-3', 'MORNING', 'spelling', 4, 1, 3, 'Early part of the day when sun rises!'),

  makeItem('sp-g4-s1-u4-1', 'PUMPKIN', 'spelling', 4, 1, 4, 'Round bright orange fruit of autumn!'),
  makeItem('sp-g4-s1-u4-2', 'HARVEST', 'spelling', 4, 1, 4, 'Gathering ripe crops and fresh fruit!'),
  makeItem('sp-g4-s1-u4-3', 'ORCHARD', 'spelling', 4, 1, 4, 'A grove of trees growing delicious fruit!'),

  // ================= GRADE 4 · 2nd SEMESTER =================
  makeItem('sp-g4-s2-u1-1', 'CHEETAH', 'spelling', 4, 2, 1, 'Fastest spotted runner on sunny grasslands!'),
  makeItem('sp-g4-s2-u1-2', 'WALRUS', 'spelling', 4, 2, 1, 'Arctic sea mammal with long ivory tusks!'),
  makeItem('sp-g4-s2-u1-3', 'MEERKAT', 'spelling', 4, 2, 1, 'Curious desert animal standing upright on lookout!'),

  makeItem('sp-g4-s2-u2-1', 'HORIZON', 'spelling', 4, 2, 2, 'Where the distant land or ocean meets sky!'),
  makeItem('sp-g4-s2-u2-2', 'VOYAGE', 'spelling', 4, 2, 2, 'A long exciting trip across blue seas!'),
  makeItem('sp-g4-s2-u2-3', 'ISLAND', 'spelling', 4, 2, 2, 'Piece of sunny land surrounded by water!'),

  makeItem('sp-g4-s2-u3-1', 'THUNDER', 'spelling', 4, 2, 3, 'Deep rumbling sound inside storm clouds!'),
  makeItem('sp-g4-s2-u3-2', 'BREEZE', 'spelling', 4, 2, 3, 'Gentle refreshing wind on a warm day!'),
  makeItem('sp-g4-s2-u3-3', 'SUNRISE', 'spelling', 4, 2, 3, 'Warm golden glow starting the morning!'),

  makeItem('sp-g4-s2-u4-1', 'KITCHEN', 'spelling', 4, 2, 4, 'Cozy room where tasty meals are cooked!'),
  makeItem('sp-g4-s2-u4-2', 'MUFFIN', 'spelling', 4, 2, 4, 'Soft little baked cake with sweet berries!'),
  makeItem('sp-g4-s2-u4-3', 'APRICOT', 'spelling', 4, 2, 4, 'Velvety golden-orange summer stone fruit!'),

  // ================= GRADE 5 · 1st SEMESTER =================
  makeItem('sp-g5-s1-u1-1', 'DINOSAUR', 'spelling', 5, 1, 1, 'Giant prehistoric creature like T-Rex!'),
  makeItem('sp-g5-s1-u1-2', 'ELEPHANT', 'spelling', 5, 1, 1, 'Huge gray animal with a long trunk!'),
  makeItem('sp-g5-s1-u1-3', 'SQUIRREL', 'spelling', 5, 1, 1, 'Fluffy-tailed climber gathering acorns!'),

  makeItem('sp-g5-s1-u2-1', 'UNIVERSE', 'spelling', 5, 1, 2, 'All of space, stars, and galaxies!'),
  makeItem('sp-g5-s1-u2-2', 'SUNLIGHT', 'spelling', 5, 1, 2, 'Warm golden rays shining down from the sun!'),
  makeItem('sp-g5-s1-u2-3', 'ECLIPSE', 'spelling', 5, 1, 2, 'When the moon passes in front of the sun!'),

  makeItem('sp-g5-s1-u3-1', 'TREASURE', 'spelling', 5, 1, 3, 'Shiny golden crown and sparkly jewels!'),
  makeItem('sp-g5-s1-u3-2', 'PAINTING', 'spelling', 5, 1, 3, 'Colorful artwork created with brushes!'),
  makeItem('sp-g5-s1-u3-3', 'MELODIES', 'spelling', 5, 1, 3, 'Sweet musical tunes played on instruments!'),

  makeItem('sp-g5-s1-u4-1', 'AVOCADO', 'spelling', 5, 1, 4, 'Creamy green fruit with a big round seed!'),
  makeItem('sp-g5-s1-u4-2', 'VITAMIN', 'spelling', 5, 1, 4, 'Healthy nutrients found in fruits and veggies!'),
  makeItem('sp-g5-s1-u4-3', 'SUNSHINE', 'spelling', 5, 1, 4, 'Warm bright rays filling a happy day!'),

  // ================= GRADE 5 · 2nd SEMESTER =================
  makeItem('sp-g5-s2-u1-1', 'FOSSILS', 'spelling', 5, 2, 1, 'Ancient prints of leaves and bones inside rock!'),
  makeItem('sp-g5-s2-u1-2', 'HABITAT', 'spelling', 5, 2, 1, 'Natural home where plants and animals live!'),
  makeItem('sp-g5-s2-u1-3', 'PREDATOR', 'spelling', 5, 2, 1, 'Wild animal that hunts in nature!'),

  makeItem('sp-g5-s2-u2-1', 'SPECTRUM', 'spelling', 5, 2, 2, 'Band of rainbow colors split by light!'),
  makeItem('sp-g5-s2-u2-2', 'GRAVITY', 'spelling', 5, 2, 2, 'Gentle force keeping planets in orbit!'),
  makeItem('sp-g5-s2-u2-3', 'METEORS', 'spelling', 5, 2, 2, 'Bright shooting stars streaking through night sky!'),

  makeItem('sp-g5-s2-u3-1', 'THEATER', 'spelling', 5, 2, 3, 'Stage where actors perform exciting plays!'),
  makeItem('sp-g5-s2-u3-2', 'CONCERT', 'spelling', 5, 2, 3, 'Live musical show performed for listeners!'),
  makeItem('sp-g5-s2-u3-3', 'SCULPTOR', 'spelling', 5, 2, 3, 'Artist shaping clay or stone into statues!'),

  makeItem('sp-g5-s2-u4-1', 'SPINACH', 'spelling', 5, 2, 4, 'Leafy green vegetable packed with iron!'),
  makeItem('sp-g5-s2-u4-2', 'SMOOTHIE', 'spelling', 5, 2, 4, 'Cool blended fruit drink full of energy!'),
  makeItem('sp-g5-s2-u4-3', 'PROTEIN', 'spelling', 5, 2, 4, 'Helpful nutrient that builds strong muscles!'),

  // ================= GRADE 6 · 1st SEMESTER =================
  makeItem('sp-g6-s1-u1-1', 'BUTTERFLY', 'spelling', 6, 1, 1, 'Insect with colorful fluttering wings!'),
  makeItem('sp-g6-s1-u1-2', 'ECOSYSTEM', 'spelling', 6, 1, 1, 'Living plants and animals sharing a habitat!'),
  makeItem('sp-g6-s1-u1-3', 'CHAMELEON', 'spelling', 6, 1, 1, 'Clever lizard able to change its colors!'),

  makeItem('sp-g6-s1-u2-1', 'INVENTION', 'spelling', 6, 1, 2, 'A brand-new helpful device or creation!'),
  makeItem('sp-g6-s1-u2-2', 'DISCOVERY', 'spelling', 6, 1, 2, 'Finding or learning something amazing for the first time!'),
  makeItem('sp-g6-s1-u2-3', 'TELESCOPE', 'spelling', 6, 1, 2, 'Instrument used to see distant stars and planets!'),

  makeItem('sp-g6-s1-u3-1', 'ADVENTURE', 'spelling', 6, 1, 3, 'An exciting journey full of surprises!'),
  makeItem('sp-g6-s1-u3-2', 'KNOWLEDGE', 'spelling', 6, 1, 3, 'Wisdom and understanding gained by learning!'),
  makeItem('sp-g6-s1-u3-3', 'CELEBRATE', 'spelling', 6, 1, 3, 'Having a joyful party for a special event!'),

  makeItem('sp-g6-s1-u4-1', 'WATERMELON', 'spelling', 6, 1, 4, 'Big green summer fruit, sweet red inside!'),
  makeItem('sp-g6-s1-u4-2', 'MOUNTAINS', 'spelling', 6, 1, 4, 'Tall rocky peaks reaching up into clouds!'),
  makeItem('sp-g6-s1-u4-3', 'COMMUNITY', 'spelling', 6, 1, 4, 'Neighbors and friends living and helping together!'),

  // ================= GRADE 6 · 2nd SEMESTER =================
  makeItem('sp-g6-s2-u1-1', 'MIGRATION', 'spelling', 6, 2, 1, 'Seasonal long journey of birds or butterflies!'),
  makeItem('sp-g6-s2-u1-2', 'RAINFOREST', 'spelling', 6, 2, 1, 'Lush tropical woods rich with wildlife!'),
  makeItem('sp-g6-s2-u1-3', 'SANCTUARY', 'spelling', 6, 2, 1, 'Safe protected haven for wild creatures!'),

  makeItem('sp-g6-s2-u2-1', 'SATELLITE', 'spelling', 6, 2, 2, 'Spacecraft orbiting Earth to send signals!'),
  makeItem('sp-g6-s2-u2-2', 'ROBOTICS', 'spelling', 6, 2, 2, 'Designing and coding helpful smart machines!'),
  makeItem('sp-g6-s2-u2-3', 'ALGORITHM', 'spelling', 6, 2, 2, 'Clear step-by-step recipe to solve a puzzle!'),

  makeItem('sp-g6-s2-u3-1', 'FESTIVALS', 'spelling', 6, 2, 3, 'Joyful cultural gatherings with music and lights!'),
  makeItem('sp-g6-s2-u3-2', 'HERITAGE', 'spelling', 6, 2, 3, 'Valued traditions passed down across generations!'),
  makeItem('sp-g6-s2-u3-3', 'TRADITION', 'spelling', 6, 2, 3, 'Special custom shared by families every year!'),

  makeItem('sp-g6-s2-u4-1', 'LANDSCAPE', 'spelling', 6, 2, 4, 'Wide scenic view of hills, rivers, and valleys!'),
  makeItem('sp-g6-s2-u4-2', 'VOLUNTEER', 'spelling', 6, 2, 4, 'Someone generously helping neighbors and nature!'),
  makeItem('sp-g6-s2-u4-3', 'HARMONIOUS', 'spelling', 6, 2, 4, 'Working and living peacefully together!'),
];
