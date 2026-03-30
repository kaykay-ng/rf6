import { type CampEvent } from '@/components/camp-sheet';

// ── Time helpers ──────────────────────────────────────────────────────────────

function fromNow(offsetMinutes: number): { date: string; time: string } {
  const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
  const date = d.toISOString().split('T')[0];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return { date, time: `${hh}:${mm}` };
}

function festivalTime(dayOffset: number, hour: number, minute = 0): { date: string; time: string } {
  const base = new Date('2026-06-27T00:00:00');
  base.setDate(base.getDate() + dayOffset);
  const date = base.toISOString().split('T')[0];
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return { date, time: `${hh}:${mm}` };
}

// ── Mock events ───────────────────────────────────────────────────────────────
// These appear for all camps temporarily while testing the events UI.
// Two events use fromNow() so they always appear as "active" (starting soon)
// when the app is running — this exercises the red dot on the map.

export const MOCK_EVENTS: CampEvent[] = [
  {
    id: 'mock-1',
    name: 'BBQ & Cold Ones',
    ...fromNow(20),
    location_type: 'our_camp',
    description: 'Burgers, sausages, mystery skewers. Bring something to share.',
    max_capacity: 40,
  },
  {
    id: 'mock-2',
    name: 'Afternoon Jam Session',
    ...fromNow(50),
    location_type: 'our_camp',
    description: 'Acoustic only. Guitars, cajon, kazoos — whatever you\'ve got.',
    max_capacity: undefined,
  },
  {
    id: 'mock-3',
    name: 'Camp Trivia Night',
    ...fromNow(150),
    location_type: 'our_camp',
    description: 'Music rounds, festival history, and rounds you will lose.',
    max_capacity: 30,
  },
  {
    id: 'mock-4',
    name: 'Late Night Dance Floor',
    ...fromNow(280),
    location_type: 'our_camp',
    description: 'We have a speaker. We have no rules. Starts when it starts.',
    max_capacity: undefined,
  },
  {
    id: 'mock-5',
    name: 'Morning Yoga',
    ...festivalTime(1, 7, 30),
    location_type: 'our_camp',
    description: 'Gentle flow, all levels. Bring your own mat or find grass.',
    max_capacity: 20,
  },
  {
    id: 'mock-6',
    name: 'Pancake Breakfast',
    ...festivalTime(1, 9, 0),
    location_type: 'our_camp',
    description: 'Classic pancakes. Nutella if we remembered to buy it.',
    max_capacity: 25,
  },
  {
    id: 'mock-7',
    name: 'Craft Beer Swap',
    ...festivalTime(2, 17, 0),
    location_type: 'nearby',
    description: 'Bring a can you love, leave with one you\'ve never tried.',
    max_capacity: 50,
  },
  {
    id: 'mock-8',
    name: 'Sunrise Meditation',
    ...festivalTime(3, 5, 30),
    location_type: 'our_camp',
    description: 'Completely silent for 20 minutes. You\'ll thank us after.',
    max_capacity: 15,
  },
];

// ── Active event helper ───────────────────────────────────────────────────────
// An event is "active" if it starts within the next 60 min or started in
// the last 30 min. Used to light up camp dots on the map.

export function hasActiveEvent(events: CampEvent[]): boolean {
  const now = Date.now();
  return events.some((e) => {
    const start = new Date(`${e.date}T${e.time}:00`).getTime();
    const diffMin = (start - now) / 60_000;
    return diffMin >= -30 && diffMin <= 60;
  });
}
