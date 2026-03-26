export type Location = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'campsite' | 'path' | 'info';
};

// Center: 55°37'05.0"N 12°04'51.5"E
export const COMMON_GROUND_CENTER = {
  latitude: 55.618056,
  longitude: 12.080972,
};

export const LOCATIONS: Location[] = [
  {
    id: 'common-ground-nw',
    name: 'Common Ground NW',
    latitude: 55.6186,
    longitude: 12.0804,
    type: 'campsite',
  },
  {
    id: 'common-ground-se',
    name: 'Common Ground SE',
    latitude: 55.6175,
    longitude: 12.0816,
    type: 'campsite',
  },
];
