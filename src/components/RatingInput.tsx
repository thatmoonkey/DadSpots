import type { Score } from '../data/types';

export function RatingInput({
  value,
  onChange,
  tone = 'dad',
}: {
  value?: Score;
  onChange: (v: Score) => void;
  tone?: 'dad' | 'kid';
}) {
  const on = tone === 'dad' ? 'bg-dad border-dad' : 'bg-kid border-kid';
  return (
    <div className="flex gap-1.5">
      {([1, 2, 3, 4, 5] as Score[]).map((i) => (
        <button
          key={i}
          type="button"
          aria-label={`${i} of 5`}
          onClick={() => onChange(i)}
          className={`h-7 w-7 rounded-full border-2 transition-colors ${
            value && i <= value ? on : 'border-white/25 bg-transparent'
          }`}
        />
      ))}
    </div>
  );
}
