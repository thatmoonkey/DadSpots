import { TAG_LABELS, type Tag } from '../../data/types';

const ALL_TAGS = Object.keys(TAG_LABELS) as Tag[];

export function TagPicker({
  value,
  onChange,
}: {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
}) {
  const toggle = (t: Tag) =>
    onChange(value.includes(t) ? value.filter((x) => x !== t) : [...value, t]);

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_TAGS.map((t) => {
        const on = value.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => toggle(t)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              on ? 'bg-dad text-white' : 'bg-ink-700 text-white/70'
            }`}
          >
            {TAG_LABELS[t]}
          </button>
        );
      })}
    </div>
  );
}
