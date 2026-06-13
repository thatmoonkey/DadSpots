import type { Spot } from './types';

/** Average of the present (defined) sub-scores, rounded to 1 decimal. */
export function average(scores: Record<string, number | undefined>): number {
  const vals = Object.values(scores).filter((v): v is number => typeof v === 'number');
  if (vals.length === 0) return 0;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

export const dadScore = (s: Pick<Spot, 'dad'>): number =>
  average(s.dad as Record<string, number | undefined>);
export const kidScore = (s: Pick<Spot, 'kid'>): number =>
  average(s.kid as Record<string, number | undefined>);

/** Haversine distance in km between two coordinates. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
