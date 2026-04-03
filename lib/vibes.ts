export const VIBE_CATEGORIES = [
  { label: 'ENERGY',       tags: ['Late night', 'Early risers', 'High energy', 'Chill & slow', 'Socially powered'] },
  { label: 'MUSIC',       tags: ['Electronic & techno', 'Hip-hop & R&B', 'Folk & acoustic', 'Soul jazz & funk', 'A little bit of everything'] },
  { label: 'SOCIAL',      tags: ['Super social', 'Introvert-friendly', 'Meet new people', 'Stick with our crew', 'Deep talk at 3am'] },
  { label: 'ACTIVITIES',  tags: ['Morning yoga', 'Cooking & food', 'Live music around the fire', 'Creative & hands-on', 'Cards & board games'] },
  { label: 'VALUES',      tags: ['Queer-friendly', 'Sober-friendly', 'Family with kids', 'Dog-friendly', 'First timers welcome'] },
  { label: 'WANT TO MEET', tags: ['Just good neighbours', 'Festival friends', 'Adventure companions', '3am deep talkers', 'Creative collabs'] },
  { label: 'GOALS',        tags: ['Making new friends', 'Party non-stop', 'Disconnect & reset', 'Create memories', 'Content creators'] },
] as const;

export const MIN_VIBES = 3;
export const MAX_VIBES = 10;
