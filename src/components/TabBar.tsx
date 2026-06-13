import { NavLink } from 'react-router-dom';
import { PinIcon, PlusIcon, UserIcon } from './icons';

const tabs = [
  { to: '/', label: 'Explore', Icon: PinIcon, end: true },
  { to: '/add', label: 'Add Spot', Icon: PlusIcon, end: false },
  { to: '/profile', label: 'Profile', Icon: UserIcon, end: false },
];

export function TabBar() {
  return (
    <nav
      className="absolute inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink-900/95 backdrop-blur-xl"
      style={{ paddingBottom: 'var(--sab)' }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-2 pb-1.5">
        {tabs.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-dad' : 'text-muted'
              }`
            }
          >
            <Icon width={24} height={24} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
