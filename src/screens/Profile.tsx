import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { TabBar } from '../components/TabBar';
import { SpotListRow } from '../features/drawer/SpotListRow';
import { PlusIcon } from '../components/icons';

export function Profile() {
  const navigate = useNavigate();
  const { spots, currentUser } = useAppStore();

  const mine = useMemo(
    () => spots.filter((s) => s.author.id === currentUser.id),
    [spots, currentUser.id],
  );
  const published = mine.filter((s) => s.published);
  const drafts = mine.filter((s) => !s.published);
  const reviewCount = useMemo(
    () =>
      spots.reduce(
        (n, s) => n + s.reviews.filter((r) => r.author.id === currentUser.id).length,
        0,
      ),
    [spots, currentUser.id],
  );

  return (
    <div className="relative flex h-full flex-col bg-ink-900">
      <div
        className="no-scrollbar flex-1 overflow-y-auto px-4 pb-24"
        style={{ paddingTop: 'calc(var(--sat) + 20px)' }}
      >
        {/* Identity */}
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-dad to-orange-700 text-2xl font-bold text-white">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{currentUser.name}</h1>
            <p className="text-sm text-muted">DinePlay dad</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Pins" value={published.length} />
          <Stat label="Reviews" value={reviewCount} />
          <Stat label="Drafts" value={drafts.length} />
        </div>

        <button
          onClick={() => navigate('/add')}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-dad py-3.5 text-sm font-bold text-white active:opacity-90"
        >
          <PlusIcon width={18} height={18} /> Add a new spot
        </button>

        {drafts.length > 0 && (
          <Section title="Your drafts">
            {drafts.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate('/add')}
                className="flex w-full items-center justify-between rounded-2xl border border-dashed border-dad/40 bg-dad-soft p-3.5 text-left"
              >
                <div>
                  <div className="text-[15px] font-semibold text-white">
                    {s.name || 'Untitled spot'}
                  </div>
                  <div className="text-xs text-muted">{s.area || 'Tap to finish & publish'}</div>
                </div>
                <span className="text-xs font-bold uppercase text-dad">Edit</span>
              </button>
            ))}
          </Section>
        )}

        <Section title={`Your pins (${published.length})`}>
          {published.length === 0 ? (
            <p className="rounded-2xl bg-ink-700/40 py-8 text-center text-sm text-muted">
              You haven’t published any spots yet.
            </p>
          ) : (
            published.map((s) => (
              <SpotListRow key={s.id} spot={s} onClick={() => navigate(`/spot/${s.id}`)} />
            ))
          )}
        </Section>
      </div>

      <TabBar />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-ink-700/60 py-3 text-center">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="mb-3 text-base font-bold text-white">{title}</h2>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}
