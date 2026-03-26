// SVG viewBox: 0 0 680 560
// 100 pre-computed zones (C1–C100), each containing 10 camp slots (5 wide × 2 tall)
// Camp address format: "C5-3" = zone C5, slot 3 of 10

// ── Zone geometry constants ───────────────────────────────────────────────────
export const ZONE_W       = 25;  // zone group width  (5 slots × 5 step)
export const ZONE_H       = 17;  // zone group height (2 slots × 5 step + 7 label)
export const CAMP_BS      = 4;   // individual camp block size
export const CAMP_CS      = 5;   // camp step (block + 1px gap)
export const CAMP_COLS    = 5;   // slots across per zone
export const CAMP_ROWS    = 2;   // slots tall per zone
export const CAMPS_PER_ZONE = CAMP_COLS * CAMP_ROWS; // 10

export type ZoneType = 'NW' | 'SE';

export type CampZone = {
  id: string;       // 'C1' … 'C100'
  zoneType: ZoneType;
  x: number;        // top-left SVG x
  y: number;        // top-left SVG y
};

// ── Pre-computed zone positions (from HTML prototype) ─────────────────────────
// [x, y, id]  — 100 entries, placed inside the green camping polygon
const RAW_ZONES: [number, number, string][] = [
  [254,24,'C1'],[285,24,'C2'],[316,24,'C3'],[347,24,'C4'],
  [378,24,'C5'],[409,24,'C6'],
  [254,43,'C7'],[285,43,'C8'],[316,43,'C9'],[347,43,'C10'],
  [378,43,'C11'],[409,43,'C12'],[440,43,'C13'],[471,43,'C14'],
  [254,62,'C15'],[285,62,'C16'],[316,62,'C17'],[347,62,'C18'],
  [378,62,'C19'],[409,62,'C20'],[440,62,'C21'],[471,62,'C22'],
  [254,81,'C23'],[285,81,'C24'],[316,81,'C25'],[347,81,'C26'],
  [378,81,'C27'],[409,81,'C28'],[440,81,'C29'],[471,81,'C30'],[502,81,'C31'],
  [254,100,'C32'],[285,100,'C33'],[316,100,'C34'],[347,100,'C35'],
  [378,100,'C36'],[409,100,'C37'],[440,100,'C38'],[533,100,'C39'],
  [223,119,'C40'],[254,119,'C41'],[285,119,'C42'],[316,119,'C43'],
  [347,119,'C44'],[378,119,'C45'],[409,119,'C46'],
  [223,138,'C47'],[254,138,'C48'],[285,138,'C49'],[316,138,'C50'],
  [347,138,'C51'],[440,138,'C52'],[471,138,'C53'],[502,138,'C54'],[533,138,'C55'],
  [223,157,'C56'],[254,157,'C57'],[285,157,'C58'],[316,157,'C59'],
  [409,157,'C60'],[440,157,'C61'],[471,157,'C62'],[502,157,'C63'],[533,157,'C64'],
  [223,176,'C65'],[254,176,'C66'],[285,176,'C67'],[347,176,'C68'],
  [378,176,'C69'],[409,176,'C70'],[440,176,'C71'],[471,176,'C72'],
  [502,176,'C73'],[533,176,'C74'],
  [223,195,'C75'],[254,195,'C76'],[316,195,'C77'],[347,195,'C78'],
  [378,195,'C79'],[409,195,'C80'],[440,195,'C81'],
  [285,214,'C82'],[316,214,'C83'],[347,214,'C84'],[378,214,'C85'],[409,214,'C86'],
  [254,233,'C87'],[285,233,'C88'],[316,233,'C89'],[347,233,'C90'],[378,233,'C91'],
  [285,252,'C92'],[316,252,'C93'],[347,252,'C94'],[378,252,'C95'],
  [316,271,'C96'],[347,271,'C97'],[378,271,'C98'],
  [347,290,'C99'],[378,290,'C100'],
];

// ── S-curve: separates NW (above) from SE (below) ────────────────────────────
const S_CURVE: [number, number][] = [
  [20,251],[126,269],[177,262],[332,308],[411,392],[543,438],
];

function belowScurve(x: number, y: number): boolean {
  for (let i = 0; i < S_CURVE.length - 1; i++) {
    const [x1, y1] = S_CURVE[i], [x2, y2] = S_CURVE[i + 1];
    if (x >= x1 && x <= x2)
      return y > y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
  }
  return x < S_CURVE[0][0] ? y > S_CURVE[0][1] : y > S_CURVE[S_CURVE.length - 1][1];
}

// ── Public API ────────────────────────────────────────────────────────────────
export const ZONES: CampZone[] = RAW_ZONES.map(([x, y, id]) => ({
  id,
  zoneType: belowScurve(x + ZONE_W / 2, y + ZONE_H / 2) ? 'SE' : 'NW',
  x,
  y,
}));

/** Parse a camp address into zone + slot.  'C5-3' → { zoneId: 'C5', slot: 3 } */
export function parseAddress(address: string): { zoneId: string; slot: number } | null {
  const m = address.match(/^(C\d+)-(\d+)$/);
  if (!m) return null;
  const slot = parseInt(m[2], 10);
  if (slot < 1 || slot > CAMPS_PER_ZONE) return null;
  return { zoneId: m[1], slot };
}

/** SVG top-left coords of a numbered slot (1-indexed) within a zone */
export function slotPosition(zone: CampZone, slotNum: number): { x: number; y: number } {
  const idx = slotNum - 1;
  return {
    x: zone.x + (idx % CAMP_COLS) * CAMP_CS + 0.5,
    y: zone.y + Math.floor(idx / CAMP_COLS) * CAMP_CS + 0.5,
  };
}
