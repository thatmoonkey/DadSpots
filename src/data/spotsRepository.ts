import type { Review, Spot } from './types';
import { SEED_SPOTS } from './seed';

/**
 * The single seam between the UI and where spots actually live.
 * Phase 1 = browser localStorage on top of the seed list.
 * Phase 2 = swap this implementation for a Supabase-backed one; the interface
 * (and therefore the whole UI) stays identical.
 */
export interface SpotsRepository {
  list(): Spot[];
  get(id: string): Spot | undefined;
  /** Create or update a user spot (draft or published). */
  upsert(spot: Spot): void;
  publish(id: string): void;
  remove(id: string): void;
  addReview(spotId: string, review: Review): void;
}

const SPOTS_KEY = 'dineplay:userSpots';
const REVIEWS_KEY = 'dineplay:extraReviews';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / private-mode errors in the prototype */
  }
}

class LocalSpotsRepository implements SpotsRepository {
  list(): Spot[] {
    const userSpots = read<Spot[]>(SPOTS_KEY, []);
    const extraReviews = read<Record<string, Review[]>>(REVIEWS_KEY, {});
    const byId = new Map<string, Spot>();
    for (const s of SEED_SPOTS) byId.set(s.id, s);
    for (const s of userSpots) byId.set(s.id, s); // user copy overrides seed
    return [...byId.values()].map((s) => {
      const extra = extraReviews[s.id];
      return extra ? { ...s, reviews: [...s.reviews, ...extra] } : s;
    });
  }

  get(id: string): Spot | undefined {
    return this.list().find((s) => s.id === id);
  }

  upsert(spot: Spot): void {
    const userSpots = read<Spot[]>(SPOTS_KEY, []);
    const i = userSpots.findIndex((s) => s.id === spot.id);
    if (i >= 0) userSpots[i] = spot;
    else userSpots.push(spot);
    write(SPOTS_KEY, userSpots);
  }

  publish(id: string): void {
    const userSpots = read<Spot[]>(SPOTS_KEY, []);
    const i = userSpots.findIndex((s) => s.id === id);
    if (i >= 0) {
      userSpots[i] = { ...userSpots[i], published: true };
      write(SPOTS_KEY, userSpots);
    }
  }

  remove(id: string): void {
    const userSpots = read<Spot[]>(SPOTS_KEY, []).filter((s) => s.id !== id);
    write(SPOTS_KEY, userSpots);
  }

  addReview(spotId: string, review: Review): void {
    const extraReviews = read<Record<string, Review[]>>(REVIEWS_KEY, {});
    extraReviews[spotId] = [...(extraReviews[spotId] ?? []), review];
    write(REVIEWS_KEY, extraReviews);
  }
}

export const repo: SpotsRepository = new LocalSpotsRepository();
