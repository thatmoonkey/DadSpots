import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  DAD_FIELDS,
  KID_FIELDS,
  TAG_LABELS,
  type Score,
  type Spot,
} from '../data/types';
import { dadScore, kidScore } from '../data/scoring';
import { SpotThumb } from '../components/SpotThumb';
import { Stars } from '../components/Score';
import { RatingInput } from '../components/RatingInput';
import { BackIcon, CheckIcon, DadIcon, KidIcon, PinIcon, StarIcon } from '../components/icons';

export function SpotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const spots = useAppStore((s) => s.spots);
  const selectSpot = useAppStore((s) => s.selectSpot);
  const spot = spots.find((s) => s.id === id);

  if (!spot) {
    return (
      <div className="grid h-full place-items-center bg-ink-900 text-muted">
        <div className="text-center">
          <p>Spot not found.</p>
          <button onClick={() => navigate('/')} className="mt-3 text-dad">
            Back to map
          </button>
        </div>
      </div>
    );
  }

  const dad = dadScore(spot);
  const kid = kidScore(spot);

  const showOnMap = () => {
    selectSpot(spot.id);
    navigate('/');
  };

  return (
    <div className="no-scrollbar h-full overflow-y-auto bg-ink-900 pb-10">
      {/* Header image */}
      <div className="relative h-60 w-full">
        <SpotThumb spot={spot} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-black/30" />
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 flex items-center gap-1 rounded-full bg-black/45 py-1.5 pl-2 pr-3 text-sm font-medium text-white backdrop-blur"
          style={{ top: 'calc(var(--sat) + 12px)' }}
        >
          <BackIcon width={18} height={18} /> Back
        </button>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{spot.name}</h1>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
              <PinIcon width={14} height={14} /> {spot.area}
            </div>
          </div>
          <button
            onClick={showOnMap}
            className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur active:bg-white/20"
          >
            Show on Map
          </button>
        </div>
      </div>

      <div className="space-y-6 px-4 pt-5">
        {/* Score cards */}
        <div className="grid grid-cols-2 gap-3">
          <ScoreCard tone="dad" label="Dad Score" value={dad} Icon={DadIcon} />
          <ScoreCard tone="kid" label="Kid Score" value={kid} Icon={KidIcon} />
        </div>

        {/* For Dads */}
        <Section title="For Dads">
          <SubScoreGrid spot={spot} fields={DAD_FIELDS} group="dad" tone="dad" />
        </Section>

        {spot.note && (
          <p className="rounded-2xl bg-ink-700/60 p-4 text-sm italic text-white/75">
            “{spot.note}”
          </p>
        )}

        {/* For Kids */}
        <Section title="For Kids">
          <SubScoreGrid spot={spot} fields={KID_FIELDS} group="kid" tone="kid" />
        </Section>

        {/* Tags */}
        {spot.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {spot.tags.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1.5 rounded-full bg-ink-700 px-3 py-1.5 text-sm font-medium text-white/85"
              >
                <CheckIcon width={14} height={14} className="text-reviewed" />
                {TAG_LABELS[t]}
              </span>
            ))}
          </div>
        )}

        {/* Reviews */}
        <Reviews spot={spot} />

        <p className="pt-2 text-center text-xs text-muted">
          Added by <span className="font-semibold text-white/80">{spot.author.name}</span>
        </p>
      </div>
    </div>
  );
}

function ScoreCard({
  tone,
  label,
  value,
  Icon,
}: {
  tone: 'dad' | 'kid';
  label: string;
  value: number;
  Icon: typeof DadIcon;
}) {
  const isDad = tone === 'dad';
  return (
    <div
      className={`rounded-2xl border p-4 ${
        isDad ? 'border-dad/30 bg-dad-soft' : 'border-kid/30 bg-kid-soft'
      }`}
    >
      <div className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${isDad ? 'text-dad' : 'text-kid'}`}>
        <Icon width={15} height={15} /> {label}
      </div>
      <div className="mt-1 text-3xl font-bold text-white">{value.toFixed(1)}</div>
      <Stars value={value} className="mt-1" />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-lg font-bold text-white">{title}</h3>
      {children}
    </div>
  );
}

function SubScoreGrid({
  spot,
  fields,
  group,
  tone,
}: {
  spot: Spot;
  fields: { key: string; label: string; icon: string }[];
  group: 'dad' | 'kid';
  tone: 'dad' | 'kid';
}) {
  const scores = spot[group] as Record<string, number | undefined>;
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {fields.map((f) => {
        const v = scores[f.key];
        return (
          <div
            key={f.key}
            className="flex items-center justify-between rounded-xl bg-ink-700/60 px-3.5 py-3"
          >
            <div className="flex items-center gap-2">
              <span className={`text-base ${tone === 'dad' ? 'text-dad' : 'text-kid'}`}>
                {f.icon}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-muted">
                {f.label}
              </span>
            </div>
            <span className="text-sm font-bold text-white">{v ? `${v}/5` : '–'}</span>
          </div>
        );
      })}
    </div>
  );
}

function Reviews({ spot }: { spot: Spot }) {
  const addReview = useAppStore((s) => s.addReview);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<Score>();
  const [text, setText] = useState('');

  const submit = () => {
    if (!rating || !text.trim()) return;
    addReview(spot.id, rating, text.trim());
    setText('');
    setRating(undefined);
    setOpen(false);
  };

  const sorted = useMemo(
    () => [...spot.reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [spot.reviews],
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Reviews ({sorted.length})</h3>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-full bg-dad px-4 py-2 text-sm font-semibold text-white active:opacity-90"
        >
          Add Review
        </button>
      </div>

      {open && (
        <div className="mb-3 space-y-3 rounded-2xl border border-white/10 bg-ink-700/60 p-4">
          <RatingInput value={rating} onChange={setRating} tone="dad" />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="How was it for the dads and the kids?"
            className="w-full resize-none rounded-xl bg-ink-800 p-3 text-sm text-white placeholder:text-muted focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={!rating || !text.trim()}
            className="w-full rounded-xl bg-dad py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            Post review
          </button>
        </div>
      )}

      {sorted.length === 0 && !open && (
        <div className="grid place-items-center rounded-2xl border border-white/10 bg-ink-700/40 py-10 text-center">
          <StarIcon width={26} height={26} className="text-white/20" />
          <p className="mt-2 text-sm font-medium text-white/70">No reviews yet</p>
          <p className="text-xs text-muted">Be the first to review!</p>
        </div>
      )}

      <div className="space-y-2.5">
        {sorted.map((r) => (
          <div key={r.id} className="rounded-2xl bg-ink-700/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{r.author.name}</span>
              <Stars value={r.rating} />
            </div>
            <p className="mt-1.5 text-sm text-white/75">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
