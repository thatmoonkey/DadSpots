import { SearchIcon, NavIcon } from '../../components/icons';

export function SearchBar({
  value,
  onChange,
  onLocate,
  locating,
}: {
  value: string;
  onChange: (v: string) => void;
  onLocate: () => void;
  locating?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-4">
      <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-ink-800/90 px-3.5 py-3 backdrop-blur-xl">
        <SearchIcon width={18} height={18} className="text-muted" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search spots, areas, tags…"
          className="w-full bg-transparent text-[15px] text-white placeholder:text-muted focus:outline-none"
        />
      </div>
      <button
        onClick={onLocate}
        className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-ink-800/90 px-3 py-3 text-sm font-semibold text-dad backdrop-blur-xl active:bg-ink-700"
      >
        <NavIcon width={16} height={16} className={locating ? 'animate-pulse' : ''} />
        {locating ? '…' : 'Near me'}
      </button>
    </div>
  );
}
