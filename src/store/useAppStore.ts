import { create } from 'zustand';
import type {
  Author,
  DadScores,
  KidScores,
  Review,
  Score,
  Spot,
  SpotStatus,
  Tag,
} from '../data/types';
import { repo } from '../data/spotsRepository';
import { DADS } from '../data/seed';
import { distanceKm } from '../data/scoring';

export type FilterKey = 'all' | 'reviewed' | 'to_visit';

export interface LatLng {
  lat: number;
  lng: number;
}

interface AppState {
  currentUser: Author;
  spots: Spot[];
  filter: FilterKey;
  query: string;
  selectedSpotId: string | null;
  userLocation: LatLng | null;
  /** Centre used to compute "nearby" distances; falls back to map centre. */
  mapCenter: LatLng;
  draftId: string | null;

  refresh: () => void;
  setFilter: (f: FilterKey) => void;
  setQuery: (q: string) => void;
  selectSpot: (id: string | null) => void;
  setUserLocation: (loc: LatLng) => void;
  setMapCenter: (loc: LatLng) => void;

  startDraft: (loc: LatLng) => string;
  moveDraft: (loc: LatLng) => void;
  updateDraft: (patch: Partial<Spot>) => void;
  setDraftScore: (group: 'dad' | 'kid', key: string, value: Score) => void;
  publishDraft: (id: string) => void;
  discardDraft: () => void;

  /** Create or update the current user's own review (their criteria scores). */
  setMyReview: (
    spotId: string,
    data: { dad: DadScores; kid: KidScores; tags: Tag[]; note?: string },
  ) => void;
}

const CAPE_TOWN: LatLng = { lat: -33.95, lng: 18.46 };

function newDraft(author: Author, loc: LatLng): Spot {
  return {
    id: `draft_${crypto.randomUUID().slice(0, 8)}`,
    name: '',
    area: '',
    lat: loc.lat,
    lng: loc.lng,
    status: 'to_visit' as SpotStatus,
    dad: {},
    kid: {},
    tags: [],
    note: '',
    author,
    reviews: [],
    createdAt: new Date().toISOString(),
    published: false,
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: DADS.munki,
  spots: repo.list(),
  filter: 'all',
  query: '',
  selectedSpotId: null,
  userLocation: null,
  mapCenter: CAPE_TOWN,
  draftId: null,

  refresh: () => set({ spots: repo.list() }),
  setFilter: (filter) => set({ filter }),
  setQuery: (query) => set({ query }),
  selectSpot: (selectedSpotId) => set({ selectedSpotId }),
  setUserLocation: (userLocation) => set({ userLocation, mapCenter: userLocation }),
  setMapCenter: (mapCenter) => set({ mapCenter }),

  startDraft: (loc) => {
    const draft = newDraft(get().currentUser, loc);
    repo.upsert(draft);
    set({ draftId: draft.id, spots: repo.list() });
    return draft.id;
  },

  moveDraft: (loc) => {
    const id = get().draftId;
    if (!id) return;
    const draft = repo.get(id);
    if (!draft) return;
    repo.upsert({ ...draft, lat: loc.lat, lng: loc.lng, reviews: [] });
    set({ spots: repo.list() });
  },

  updateDraft: (patch) => {
    const id = get().draftId;
    if (!id) return;
    const draft = repo.get(id);
    if (!draft) return;
    repo.upsert({ ...draft, ...patch, reviews: [] });
    set({ spots: repo.list() });
  },

  setDraftScore: (group, key, value) => {
    const id = get().draftId;
    if (!id) return;
    const draft = repo.get(id);
    if (!draft) return;
    const updated = { ...draft, [group]: { ...draft[group], [key]: value }, reviews: [] };
    repo.upsert(updated as Spot);
    set({ spots: repo.list() });
  },

  publishDraft: (id) => {
    const draft = repo.get(id);
    if (draft) {
      // A spot with any review counts as "reviewed", otherwise it's a to-visit tip.
      const status: SpotStatus =
        Object.keys(draft.dad).length || Object.keys(draft.kid).length
          ? 'reviewed'
          : 'to_visit';
      repo.upsert({ ...draft, status, reviews: [] });
    }
    repo.publish(id);
    set({ draftId: null, spots: repo.list(), selectedSpotId: id });
  },

  discardDraft: () => {
    const id = get().draftId;
    if (id) repo.remove(id);
    set({ draftId: null, spots: repo.list() });
  },

  setMyReview: (spotId, data) => {
    const review: Review = {
      id: `r_${crypto.randomUUID().slice(0, 8)}`,
      author: get().currentUser,
      dad: data.dad,
      kid: data.kid,
      tags: data.tags,
      note: data.note,
      createdAt: new Date().toISOString(),
    };
    repo.upsertReview(spotId, review);
    set({ spots: repo.list() });
  },
}));

/** Spots that pass the current filter + search query, sorted by distance. */
export function selectVisibleSpots(state: AppState): (Spot & { distance: number })[] {
  const q = state.query.trim().toLowerCase();
  const center = state.userLocation ?? state.mapCenter;
  return state.spots
    .filter((s) => s.published)
    .filter((s) => (state.filter === 'all' ? true : s.status === state.filter))
    .filter((s) => {
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.area.toLowerCase().includes(q) ||
        s.tags.some((t) => t.includes(q))
      );
    })
    .map((s) => ({ ...s, distance: distanceKm(center, s) }))
    .sort((a, b) => a.distance - b.distance);
}
