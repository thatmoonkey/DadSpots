export type Score = 1 | 2 | 3 | 4 | 5;

export type SpotStatus = 'to_visit' | 'reviewed';

/** Amenity tags shown as pills on the detail screen. */
export const TAG_LABELS = {
  high_chairs: 'High Chairs',
  changing_station: 'Changing Station',
  fenced: 'Fenced / Enclosed',
  shade: 'Good Shade',
  parking: 'Easy Parking',
  bikes: 'Bike Friendly',
  indoor: 'Indoor Option',
  dog_friendly: 'Dog Friendly',
} as const;

export type Tag = keyof typeof TAG_LABELS;

/** Dad-facing sub-scores (mockup set). Objects stay open so more can be added later. */
export interface DadScores {
  food?: Score;
  beer?: Score;
  vibe?: Score;
  speed?: Score;
  parking?: Score;
}

/** Kid-facing sub-scores (mockup set). */
export interface KidScores {
  size?: Score;
  fun?: Score;
  safety?: Score;
  menu?: Score;
}

export interface Author {
  id: string;
  name: string;
  avatarUrl?: string;
}

/**
 * A review IS a dad's scoring of the criteria. The community aggregate (what the
 * map shows) is the per-criterion average across every spot's reviews.
 */
export interface Review {
  id: string;
  author: Author;
  dad: DadScores;
  kid: KidScores;
  tags: Tag[];
  note?: string;
  createdAt: string;
}

export interface Spot {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  status: SpotStatus;
  photoUrl?: string;
  dad: DadScores;
  kid: KidScores;
  tags: Tag[];
  note?: string;
  author: Author;
  reviews: Review[];
  createdAt: string;
  /** Draft pins are local-only until published to the community. */
  published: boolean;
}

export const DAD_FIELDS: { key: keyof DadScores; label: string; icon: string }[] = [
  { key: 'food', label: 'Food', icon: '🍴' },
  { key: 'beer', label: 'Beer', icon: '🍺' },
  { key: 'vibe', label: 'Vibe', icon: '✨' },
  { key: 'speed', label: 'Speed', icon: '⏱️' },
  { key: 'parking', label: 'Parking', icon: '🅿️' },
];

export const KID_FIELDS: { key: keyof KidScores; label: string; icon: string }[] = [
  { key: 'size', label: 'Size', icon: '📐' },
  { key: 'fun', label: 'Fun', icon: '🎮' },
  { key: 'safety', label: 'Safety', icon: '🛡️' },
  { key: 'menu', label: 'Menu', icon: '🍽️' },
];
