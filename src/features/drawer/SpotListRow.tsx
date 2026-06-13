import type { Spot } from '../../data/types';
import { dadScore, kidScore, formatDistance } from '../../data/scoring';
import { SpotThumb } from '../../components/SpotThumb';
import { Stars, ScoreBadge } from '../../components/Score';
import { DadIcon, KidIcon, StarIcon } from '../../components/icons';

export function SpotListRow({
  spot,
  distance,
  onClick,
}: {
  spot: Spot & { distance?: number };
  distance?: number;
  onClick: () => void;
}) {
  const dad = dadScore(spot);
  const kid = kidScore(spot);
  const reviewed = spot.status === 'reviewed';
  const dist = distance ?? spot.distance;

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-ink-700/70 p-2.5 text-left active:bg-ink-600"
    >
      <SpotThumb spot={spot} className="h-16 w-16 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <span
          className={`text-[10px] font-bold uppercase tracking-wide ${
            reviewed ? 'text-reviewed' : 'text-tovisit'
          }`}
        >
          {reviewed ? 'Reviewed' : 'To Visit'}
        </span>
        <div className="truncate text-[15px] font-semibold text-white">{spot.name}</div>
        <div className="flex items-center gap-1 text-xs text-muted">
          <span className="truncate">{spot.area}</span>
          {dist != null && <span>· {formatDistance(dist)}</span>}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          {reviewed && (
            <span className="flex items-center gap-1 text-[13px] font-bold text-dad">
              <StarIcon width={12} height={12} />
              {((dad + kid) / 2).toFixed(1)}
            </span>
          )}
          <ScoreBadge icon={<DadIcon width={12} height={12} />} value={dad} tone="dad" />
          <ScoreBadge icon={<KidIcon width={12} height={12} />} value={kid} tone="kid" />
        </div>
      </div>
      {reviewed && <Stars value={(dad + kid) / 2} className="self-start" />}
    </button>
  );
}
