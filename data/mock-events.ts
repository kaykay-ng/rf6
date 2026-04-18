import { type CampEvent } from '@/components/event-card';

// ── Time helpers ──────────────────────────────────────────────────────────────

// Relative to now — always shows events as "today" during development.
// Replace with festivalTime() once we approach festival dates.
function fromNow(offsetMinutes: number): { date: string; time: string } {
  const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
  const date = d.toISOString().split('T')[0];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return { date, time: `${hh}:${mm}` };
}

// Festival 2026 dates (June 27 – July 4) — swap in when live:
// function festivalTime(dayOffset: number, hour: number, minute = 0): { date: string; time: string } {
//   const base = new Date('2026-06-27T00:00:00');
//   base.setDate(base.getDate() + dayOffset);
//   const date = base.toISOString().split('T')[0];
//   const hh = String(hour).padStart(2, '0');
//   const mm = String(minute).padStart(2, '0');
//   return { date, time: `${hh}:${mm}` };
// }

// ── Mock events ───────────────────────────────────────────────────────────────
// host_camp_id matches addresses from scripts/seed-camps.mjs
// Colors cycle through EVENT_COLORS (see live-events-sidebar.tsx)

export const MOCK_EVENTS: CampEvent[] = [
  {
    id: 'mock-1',
    name: 'BBQ & Cold Ones',
    ...fromNow(20),         // live in 20 min
    location_type: 'our_camp',
    host_camp_id: 'C3-1',   // The Golden Hour
    description: 'Burgers, sausages, mystery skewers. Bring something to share.',
    max_capacity: 40,
  },
  {
    id: 'mock-2',
    name: 'Afternoon Jam Session',
    ...fromNow(-10),        // started 10 min ago (still live)
    location_type: 'our_camp',
    host_camp_id: 'C7-2',   // Camp Slowburn
    description: 'Acoustic only. Guitars, cajon, kazos — whatever you\'ve got.',
    max_capacity: undefined,
  },
  {
    id: 'mock-3',
    name: 'Camp Trivia Night',
    ...fromNow(90),         // in 1.5 hours
    location_type: 'our_camp',
    host_camp_id: 'C5-3',   // Camp Queer Chaos
    description: 'Music rounds, festival history, and rounds you will lose.',
    max_capacity: 30,
  },
  {
    id: 'mock-4',
    name: 'Morning Yoga',
    ...fromNow(180),        // in 3 hours
    location_type: 'our_camp',
    host_camp_id: 'C2-4',   // Morning Dew
    description: 'Gentle flow, all levels. Bring your own mat or find grass.',
    max_capacity: 20,
  },
  {
    id: 'mock-5',
    name: 'Pancake Breakfast',
    ...fromNow(240),        // in 4 hours
    location_type: 'our_camp',
    host_camp_id: 'C12-1',  // Breakfast Club
    description: 'Classic pancakes. Nutella if we remembered to buy it.',
    max_capacity: 25,
  },
  {
    id: 'mock-6',
    name: 'Late Night Dance Floor',
    ...fromNow(300),        // in 5 hours
    location_type: 'our_camp',
    host_camp_id: 'C9-1',   // Camp Ruckus
    description: 'We have a speaker. We have no rules. Starts when it starts.',
    max_capacity: undefined,
  },
  {
    id: 'mock-7',
    name: 'Craft Beer Swap',
    ...fromNow(360),        // in 6 hours
    location_type: 'nearby',
    host_camp_id: 'C16-3',  // The Tinkerers
    description: 'Bring a can you love, leave with one you\'ve never tried.',
    max_capacity: 50,
  },
  {
    id: 'mock-8',
    name: 'Sunrise Meditation',
    ...fromNow(420),        // in 7 hours
    location_type: 'our_camp',
    host_camp_id: 'C8-2',   // Solstice
    description: 'Completely silent for 20 minutes. You\'ll thank us after.',
    max_capacity: 15,
  },
];

// ── Active event helper ───────────────────────────────────────────────────────

export function hasActiveEvent(events: CampEvent[]): boolean {
  const now = Date.now();
  return events.some((e) => {
    const start = new Date(`${e.date}T${e.time}:00`).getTime();
    const diffMin = (start - now) / 60_000;
    return diffMin >= -30 && diffMin <= 60;
  });
}
