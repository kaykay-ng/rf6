// Run with: node scripts/seed-camps.mjs
// PIN for all mock camps: 000000

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// SHA256("000000") — matches expo-crypto digestStringAsync output
const PIN_HASH = '91b4d142823f7d20c5f08df69122de43f35f057a988d9619f6d3138485c9a203';

const camps = [
  {
    name: 'The Golden Hour',
    address: 'C3-1',
    vibes: ['Late night', 'Dancing', 'Chaotic good', 'Newcomers welcome'],
    bio: 'We peak at 3am and we\'re not sorry about it. Come for the beats, stay for the sunrise scrambled eggs.',
  },
  {
    name: 'Camp Slowburn',
    address: 'C7-2',
    vibes: ['Chill & slow', 'Acoustic jams', 'Calm vibes'],
    bio: 'Hammocks, guitars, and no plans. If you\'re rushing somewhere, you\'ve already gone too far.',
  },
  {
    name: 'Breakfast Club',
    address: 'C12-1',
    vibes: ['Early risers', 'Cooking & food', 'Newcomers welcome', 'Family-friendly'],
    bio: 'Up at 7, pancakes by 8. We will judge you (kindly) if you skip breakfast. Everyone is welcome at our table.',
  },
  {
    name: 'Camp Queer Chaos',
    address: 'C5-3',
    vibes: ['High energy', 'Dancing', 'Queer-friendly', 'Chaotic good', 'Late night'],
    bio: 'Glitter mandatory, opinions optional. The disco ball never stops spinning at CQC.',
  },
  {
    name: 'The Forge',
    address: 'C14-2',
    vibes: ['Creative & crafts', 'High energy', 'Newcomers welcome', 'Cooking & food'],
    bio: 'We build stuff. Costumes, sculptures, elaborate meals. Show up with hands and curiosity.',
  },
  {
    name: 'Morning Dew',
    address: 'C2-4',
    vibes: ['Morning yoga', 'Early risers', 'Calm vibes', 'Chill & slow'],
    bio: 'Sunrise sessions, herbal tea, and actual conversations. We\'re the calm before everyone else\'s storm.',
  },
  {
    name: 'Camp Ruckus',
    address: 'C9-1',
    vibes: ['High energy', 'Late night', 'Chaotic good', 'Dancing'],
    bio: 'Noise complaints are a badge of honour. We have a soundsystem and absolutely zero curfew ambitions.',
  },
  {
    name: 'Commune Nord',
    address: 'C3-5',
    vibes: ['Cooking & food', 'Chill & slow', 'Queer-friendly', 'Family-friendly'],
    bio: 'Collective cooking, shared tables, long dinners. Our camp smells like garlic and ambition.',
  },
  {
    name: 'The Tinkerers',
    address: 'C16-3',
    vibes: ['Creative & crafts', 'Acoustic jams', 'Newcomers welcome', 'Calm vibes'],
    bio: 'Half the camp is building something weird at any given time. The other half is watching and laughing.',
  },
  {
    name: 'Solstice',
    address: 'C8-2',
    vibes: ['Morning yoga', 'Chill & slow', 'Calm vibes', 'Queer-friendly', 'Acoustic jams'],
    bio: 'Rituals, breathwork, and barefoot dancing. We take the festival seriously as a spiritual experience.',
  },
];

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const rows = camps.map(c => ({ ...c, vibe_tags: c.vibes, pin_hash: PIN_HASH }))
  .map(({ vibes, ...rest }) => rest);

const { data, error } = await supabase.from('camps').insert(rows).select('id, name, address');

if (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

console.log(`Inserted ${data.length} camps:`);
data.forEach(r => console.log(`  ${r.address}  ${r.name}`));
