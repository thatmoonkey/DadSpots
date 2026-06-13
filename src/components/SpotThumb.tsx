import type { Spot } from '../data/types';

const GRADIENTS = [
  'from-amber-500/80 to-orange-700/80',
  'from-sky-500/80 to-indigo-700/80',
  'from-emerald-500/80 to-teal-700/80',
  'from-rose-500/80 to-pink-700/80',
  'from-violet-500/80 to-fuchsia-700/80',
  'from-lime-500/80 to-green-700/80',
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic photo placeholder for the prototype (no external image deps). */
export function SpotThumb({
  spot,
  className = '',
}: {
  spot: Spot;
  className?: string;
}) {
  if (spot.photoUrl) {
    return (
      <img
        src={spot.photoUrl}
        alt={spot.name}
        className={`object-cover ${className}`}
      />
    );
  }
  const g = GRADIENTS[hash(spot.id) % GRADIENTS.length];
  return (
    <div
      className={`grid place-items-center bg-gradient-to-br ${g} ${className}`}
      aria-hidden
    >
      <span className="text-2xl font-bold text-white/90 drop-shadow">
        {spot.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
