import { StarIcon } from './icons';

export function Dots({ value, tone }: { value: number; tone: 'dad' | 'kid' }) {
  const color = tone === 'dad' ? 'bg-dad' : 'bg-kid';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i <= Math.round(value) ? color : 'bg-white/15'}`}
        />
      ))}
    </div>
  );
}

export function Stars({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`flex gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon
          key={i}
          width={13}
          height={13}
          className={i <= Math.round(value) ? 'text-dad' : 'text-white/20'}
        />
      ))}
    </div>
  );
}

export function ScoreBadge({
  icon,
  value,
  tone,
}: {
  icon: React.ReactNode;
  value: number;
  tone: 'dad' | 'kid';
}) {
  const cls =
    tone === 'dad'
      ? 'bg-dad-soft text-dad'
      : 'bg-kid-soft text-kid';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {icon}
      {value > 0 ? `${Math.round(value)}/5` : '–'}
    </span>
  );
}
