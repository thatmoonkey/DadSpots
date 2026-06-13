import { CheckIcon, PinIcon } from '../../components/icons';
import type { FilterKey } from '../../store/useAppStore';

export function FilterChips({
  value,
  counts,
  onChange,
}: {
  value: FilterKey;
  counts: Record<FilterKey, number>;
  onChange: (f: FilterKey) => void;
}) {
  const chips: { key: FilterKey; label: string; Icon?: typeof PinIcon }[] = [
    { key: 'all', label: 'All', Icon: PinIcon },
    { key: 'reviewed', label: 'Reviewed', Icon: CheckIcon },
    { key: 'to_visit', label: 'To Visit', Icon: PinIcon },
  ];
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
      {chips.map(({ key, label, Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
              active
                ? key === 'all'
                  ? 'bg-dad text-white'
                  : 'bg-white/90 text-ink-900'
                : 'bg-ink-700 text-white/80'
            }`}
          >
            {Icon && <Icon width={15} height={15} />}
            {label}
            <span className={active ? 'opacity-80' : 'opacity-50'}>({counts[key]})</span>
          </button>
        );
      })}
    </div>
  );
}
