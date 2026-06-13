import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapView } from '../features/map/MapView';
import { TagPicker } from '../features/add/TagPicker';
import { RatingInput } from '../components/RatingInput';
import { useAppStore, type LatLng } from '../store/useAppStore';
import { DAD_FIELDS, KID_FIELDS, type Score, type Tag } from '../data/types';
import { dadScore, kidScore } from '../data/scoring';
import { BackIcon, CheckIcon, CloseIcon, NavIcon } from '../components/icons';

type Step = 1 | 2 | 3;

export function AddSpotFlow() {
  const navigate = useNavigate();
  const {
    spots,
    draftId,
    currentUser,
    startDraft,
    moveDraft,
    updateDraft,
    setDraftScore,
    publishDraft,
    discardDraft,
  } = useAppStore();

  const draft = spots.find((s) => s.id === draftId) ?? null;
  const [step, setStep] = useState<Step>(draft ? 2 : 1);

  const cancel = () => {
    discardDraft();
    navigate('/');
  };

  const onMapTap = (loc: LatLng) => {
    if (draftId) moveDraft(loc);
    else startDraft(loc);
  };

  const locateForDraft = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (draftId) moveDraft(loc);
      else startDraft(loc);
    });
  };

  // ——— Step 1: drop the pin ———
  if (step === 1) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-ink-900">
        <MapView
          className="absolute inset-0"
          spots={spots.filter((s) => s.published)}
          draft={draft}
          draggableDraft
          onMapClick={onMapTap}
          onDraftMove={(loc) => moveDraft(loc)}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto max-w-md px-4"
          style={{ paddingTop: 'calc(var(--sat) + 12px)' }}
        >
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-ink-800/95 p-3.5 backdrop-blur-xl">
            <button onClick={cancel} className="text-muted">
              <CloseIcon width={22} height={22} />
            </button>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Drop a pin</p>
              <p className="text-xs text-muted">Tap the map where the spot is</p>
            </div>
            <button
              onClick={locateForDraft}
              className="flex items-center gap-1.5 rounded-xl bg-ink-700 px-3 py-2 text-xs font-semibold text-dad"
            >
              <NavIcon width={14} height={14} /> My location
            </button>
          </div>
        </div>

        <BottomBar
          onBack={cancel}
          backLabel="Cancel"
          onNext={() => setStep(2)}
          nextLabel="Next"
          nextDisabled={!draft}
        />
      </div>
    );
  }

  // ——— Step 2: edit details ———
  if (step === 2 && draft) {
    return (
      <div className="relative flex h-full flex-col bg-ink-900">
        <Header title="Edit spot" step={2} onClose={cancel} />
        <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-4 pb-28 pt-2">
          <Field label="Name">
            <input
              value={draft.name}
              onChange={(e) => updateDraft({ name: e.target.value })}
              placeholder="e.g. Imhoff Farm"
              className="w-full rounded-xl bg-ink-700/70 p-3 text-[15px] text-white placeholder:text-muted focus:outline-none"
            />
          </Field>
          <Field label="Area / suburb">
            <input
              value={draft.area}
              onChange={(e) => updateDraft({ area: e.target.value })}
              placeholder="e.g. Kommetjie"
              className="w-full rounded-xl bg-ink-700/70 p-3 text-[15px] text-white placeholder:text-muted focus:outline-none"
            />
          </Field>

          <div>
            <h3 className="mb-3 text-base font-bold text-dad">For Dads</h3>
            <div className="space-y-3">
              {DAD_FIELDS.map((f) => (
                <RatingRow
                  key={f.key}
                  label={f.label}
                  icon={f.icon}
                  value={(draft.dad as Record<string, Score>)[f.key]}
                  tone="dad"
                  onChange={(v) => setDraftScore('dad', f.key, v)}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-base font-bold text-kid">For Kids</h3>
            <div className="space-y-3">
              {KID_FIELDS.map((f) => (
                <RatingRow
                  key={f.key}
                  label={f.label}
                  icon={f.icon}
                  value={(draft.kid as Record<string, Score>)[f.key]}
                  tone="kid"
                  onChange={(v) => setDraftScore('kid', f.key, v)}
                />
              ))}
            </div>
          </div>

          <Field label="Amenities">
            <TagPicker
              value={draft.tags}
              onChange={(tags: Tag[]) => updateDraft({ tags })}
            />
          </Field>

          <Field label="Note">
            <textarea
              value={draft.note}
              onChange={(e) => updateDraft({ note: e.target.value })}
              rows={3}
              placeholder="One-line take for the other dads…"
              className="w-full resize-none rounded-xl bg-ink-700/70 p-3 text-[15px] text-white placeholder:text-muted focus:outline-none"
            />
          </Field>
        </div>

        <BottomBar
          onBack={() => setStep(1)}
          backLabel="Back"
          onNext={() => setStep(3)}
          nextLabel="Review"
          nextDisabled={!draft.name.trim()}
        />
      </div>
    );
  }

  // ——— Step 3: publish ———
  if (step === 3 && draft) {
    return (
      <div className="relative flex h-full flex-col bg-ink-900">
        <Header title="Publish" step={3} onClose={cancel} />
        <div className="flex-1 space-y-5 overflow-y-auto px-4 pt-4">
          <div className="rounded-2xl border border-white/10 bg-ink-700/50 p-5 text-center">
            <p className="text-xs uppercase tracking-wide text-muted">Ready to share</p>
            <h2 className="mt-1 text-2xl font-bold text-white">{draft.name || 'Unnamed spot'}</h2>
            <p className="text-sm text-muted">{draft.area || '—'}</p>
            <div className="mt-4 flex justify-center gap-6">
              <div>
                <div className="text-xs font-semibold uppercase text-dad">Dad</div>
                <div className="text-xl font-bold text-white">{dadScore(draft).toFixed(1)}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase text-kid">Kid</div>
                <div className="text-xl font-bold text-white">{kidScore(draft).toFixed(1)}</div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-ink-700/40 p-4">
            <CheckIcon width={20} height={20} className="mt-0.5 shrink-0 text-reviewed" />
            <p className="text-sm text-white/75">
              This pin will be visible to the whole DinePlay community, credited to{' '}
              <span className="font-semibold text-white">{currentUser.name}</span>. You can keep
              editing it any time.
            </p>
          </div>
        </div>

        <BottomBar
          onBack={() => setStep(2)}
          backLabel="Back"
          onNext={() => {
            const id = draft.id;
            publishDraft(id);
            navigate(`/spot/${id}`);
          }}
          nextLabel="Publish to community"
          nextPrimary
        />
      </div>
    );
  }

  // Fallback (e.g. landed on step 2/3 with no draft)
  return (
    <div className="grid h-full place-items-center bg-ink-900">
      <button onClick={() => setStep(1)} className="text-dad">
        Start a new spot
      </button>
    </div>
  );
}

function Header({ title, step, onClose }: { title: string; step: Step; onClose: () => void }) {
  return (
    <div
      className="flex items-center gap-3 border-b border-white/10 px-4 pb-3"
      style={{ paddingTop: 'calc(var(--sat) + 12px)' }}
    >
      <button onClick={onClose} className="text-muted">
        <CloseIcon width={22} height={22} />
      </button>
      <h1 className="flex-1 text-lg font-bold text-white">{title}</h1>
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 w-6 rounded-full ${i <= step ? 'bg-dad' : 'bg-white/15'}`}
          />
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}

function RatingRow({
  label,
  icon,
  value,
  tone,
  onChange,
}: {
  label: string;
  icon: string;
  value?: Score;
  tone: 'dad' | 'kid';
  onChange: (v: Score) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-ink-700/50 px-3.5 py-2.5">
      <span className="flex items-center gap-2 text-sm font-medium text-white/85">
        <span>{icon}</span> {label}
      </span>
      <RatingInput value={value} onChange={onChange} tone={tone} />
    </div>
  );
}

function BottomBar({
  onBack,
  backLabel,
  onNext,
  nextLabel,
  nextDisabled,
  nextPrimary,
}: {
  onBack: () => void;
  backLabel: string;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  nextPrimary?: boolean;
}) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-30 flex gap-3 border-t border-white/10 bg-ink-900/95 px-4 pt-3 backdrop-blur-xl"
      style={{ paddingBottom: 'calc(var(--sab) + 12px)' }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1 rounded-2xl bg-ink-700 px-5 py-3.5 text-sm font-semibold text-white/80"
      >
        <BackIcon width={16} height={16} /> {backLabel}
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={`flex-1 rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-40 ${
          nextPrimary ? 'bg-reviewed' : 'bg-dad'
        }`}
      >
        {nextLabel}
      </button>
    </div>
  );
}
