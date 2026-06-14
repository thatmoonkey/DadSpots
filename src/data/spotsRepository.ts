import type { Review, Spot } from './types';
import { SEED_SPOTS } from './seed';
import { aggregateReviews } from './scoring';

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
  /** Create or replace a single author's review of a spot. */
  upsertReview(spotId: string, review: Review): void;
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

/**
 * A spot's stored `dad`/`kid`/`tags`/`note` are its author's *first* review.
 * Combine that with any other dads' reviews, then expose the spot with its
 * `dad`/`kid`/`tags` set to the community aggregate (what the map shows) and
 * `reviews` holding one entry per author (latest wins).
 */
// Tolerate reviews persisted by older builds (which had no per-criteria scores).
function normalizeReview(r: Review & { text?: string }): Review {
  return {
    id: r.id,
    author: r.author,
    dad: r.dad ?? {},
    kid: r.kid ?? {},
    tags: r.tags ?? [],
    note: r.note ?? r.text,
    createdAt: r.createdAt,
  };
}

function withAggregate(source: Spot, extra: Review[]): Spot {
  const creatorReview: Review = {
    id: `r_author_${source.id}`,
    author: source.author,
    dad: source.dad,
    kid: source.kid,
    tags: source.tags,
    note: source.note,
    createdAt: source.createdAt,
  };
  const byAuthor = new Map<string, Review>();
  for (const r of [creatorReview, ...source.reviews, ...extra]) {
    byAuthor.set(r.author.id, normalizeReview(r)); // later entries (newer) override
  }
  const reviews = [...byAuthor.values()];
  const agg = aggregateReviews(reviews);
  return { ...source, dad: agg.dad, kid: agg.kid, tags: agg.tags, reviews };
}

class LocalSpotsRepository implements SpotsRepository {
  list(): Spot[] {
    const userSpots = read<Spot[]>(SPOTS_KEY, []);
    const extraReviews = read<Record<string, Review[]>>(REVIEWS_KEY, {});
    const byId = new Map<string, Spot>();
    for (const s of SEED_SPOTS) byId.set(s.id, s);
    for (const s of userSpots) byId.set(s.id, s); // user copy overrides seed
    return [...byId.values()].map((s) => withAggregate(s, extraReviews[s.id] ?? []));
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

  upsertReview(spotId: string, review: Review): void {
    const extraReviews = read<Record<string, Review[]>>(REVIEWS_KEY, {});
    const rest = (extraReviews[spotId] ?? []).filter(
      (r) => r.author.id !== review.author.id,
    );
    extraReviews[spotId] = [...rest, review];
    write(REVIEWS_KEY, extraReviews);
  }
}

export const repo: SpotsRepository = new LocalSpotsRepository();
