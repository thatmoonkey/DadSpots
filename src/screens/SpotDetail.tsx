import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  DAD_FIELDS,
  KID_FIELDS,
  TAG_LABELS,
  type DadScores,
  type KidScores,
  type Review,
  type Score,
  type Spot,
  type Tag,
} from '../data/types';
import { dadScore, kidScore } from '../data/scoring';
import { SpotThumb } from '../components/SpotThumb';
import { Stars } from '../components/Score';
import { RatingInput } from '../components/RatingInput';
import { TagPicker } from '../features/add/TagPicker';
import { BackIcon, CheckIcon, DadIcon, KidIcon, PinIcon } from '../components/icons';

type Group = 'dad' | 'kid';
type Mode = 'everyone' | 'you';

const fmt = (v: number) => (Number.isInteger(v) ? `${v}` : v.toFixed(1));

export function SpotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const spots = useAppStore((s) => s.spots);
  const currentUser = useAppStore((s) => s.currentUser);
  const selectSpot = useAppStore((s) => s.selectSpot);
  const spot = spots.find((s) => s.id === id);

  const myReview = spot?.reviews.find((r) => r.author.id === currentUser.id);
  const [tab, setTab] = useState<Group>('dad');
  const [mode, setMode] = useState<Mode>(myReview ? 'you' : 'everyone');

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

      <div className="space-y-5 px-4 pt-5">
        {/* Score totals double as tabs */}
        <div className="grid grid-cols-2 gap-3">
          <ScoreTab
            tone="dad"
            label="Dad Score"
            value={dad}
            Icon={DadIcon}
            active={tab === 'dad'}
            onClick={() => setTab('dad')}
          />
          <ScoreTab
            tone="kid"
            label="Kid Score"
            value={kid}
            Icon={KidIcon}
            active={tab === 'kid'}
            onClick={() => setTab('kid')}
          />
        </div>

        {/* Everyone (aggregate) vs You (your own review) */}
        <Segmented
          mode={mode}
          onMode={setMode}
          reviewCount={spot.reviews.length}
          hasMine={!!myReview}
        />

        {mode === 'everyone' ? (
          <EveryoneView spot={spot} tab={tab} />
        ) : (
          <MyReviewEditor spotId={spot.id} initial={myReview} tab={tab} />
        )}

        {/* All reviews */}
        <AllReviews spot={spot} currentUserId={currentUser.id} />

        <p className="pt-1 text-center text-xs text-muted">
          First added by{' '}
          <span className="font-semibold text-white/80">{spot.author.name}</span>
        </p>
      </div>
    </div>
  );
}

function ScoreTab({
  tone,
  label,
  value,
  Icon,
  active,
  onClick,
}: {
  tone: Group;
  label: string;
  value: number;
  Icon: typeof DadIcon;
  active: boolean;
  onClick: () => void;
}) {
  const isDad = tone === 'dad';
  const base = isDad ? 'border-dad/40 bg-dad-soft' : 'border-kid/40 bg-kid-soft';
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all ${
        active ? `${base} ring-2 ${isDad ? 'ring-dad/50' : 'ring-kid/50'}` : 'border-white/10 bg-ink-700/40 opacity-70'
      }`}
    >
      <div
        className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${
          isDad ? 'text-dad' : 'text-kid'
        }`}
      >
        <Icon width={15} height={15} /> {label}
      </div>
      <div className="mt-1 text-3xl font-bold text-white">{value.toFixed(1)}</div>
      <Stars value={value} className="mt-1" />
    </button>
  );
}

function Segmented({
  mode,
  onMode,
  reviewCount,
  hasMine,
}: {
  mode: Mode;
  onMode: (m: Mode) => void;
  reviewCount: number;
  hasMine: boolean;
}) {
  const opt = (m: Mode, label: string) => (
    <button
      onClick={() => onMode(m)}
      className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition-colors ${
        mode === m ? 'bg-ink-600 text-white' : 'text-muted'
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className="flex gap-1 rounded-xl bg-ink-800 p-1">
      {opt('everyone', `Everyone (${reviewCount})`)}
      {opt('you', hasMine ? 'Your review' : 'Add yours')}
    </div>
  );
}

function EveryoneView({ spot, tab }: { spot: Spot; tab: Group }) {
  const fields = tab === 'dad' ? DAD_FIELDS : KID_FIELDS;
  const scores = spot[tab] as Record<string, number | undefined>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        {fields.map((f) => {
          const v = scores[f.key];
          return (
            <div
              key={f.key}
              className="flex items-center justify-between rounded-xl bg-ink-700/60 px-3.5 py-3"
            >
              <div className="flex items-center gap-2">
                <span className={tab === 'dad' ? 'text-dad' : 'text-kid'}>{f.icon}</span>
                <span className="text-xs font-medium uppercase tracking-wide text-muted">
                  {f.label}
                </span>
              </div>
              <span className="text-sm font-bold text-white">
                {typeof v === 'number' ? `${fmt(v)}/5` : '–'}
              </span>
            </div>
          );
        })}
      </div>

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

      {spot.note && (
        <p className="rounded-2xl bg-ink-700/60 p-4 text-sm italic text-white/75">
          “{spot.note}”
        </p>
      )}

      <p className="text-center text-xs text-muted">
        Community average across {spot.reviews.length}{' '}
        {spot.reviews.length === 1 ? 'review' : 'reviews'}
      </p>
    </div>
  );
}

function MyReviewEditor({
  spotId,
  initial,
  tab,
}: {
  spotId: string;
  initial?: Review;
  tab: Group;
}) {
  const setMyReview = useAppStore((s) => s.setMyReview);
  const [dad, setDad] = useState<DadScores>(initial?.dad ?? {});
  const [kid, setKid] = useState<KidScores>(initial?.kid ?? {});
  const [tags, setTags] = useState<Tag[]>(initial?.tags ?? []);
  const [note, setNote] = useState(initial?.note ?? '');
  const [saved, setSaved] = useState(false);

  const fields = tab === 'dad' ? DAD_FIELDS : KID_FIELDS;
  const scores = (tab === 'dad' ? dad : kid) as Record<string, Score | undefined>;
  const setScore = (key: string, v: Score) =>
    tab === 'dad'
      ? setDad((d) => ({ ...d, [key]: v }) as DadScores)
      : setKid((k) => ({ ...k, [key]: v }) as KidScores);

  const save = () => {
    setMyReview(spotId, { dad, kid, tags, note: note.trim() || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        {fields.map((f) => (
          <div
            key={f.key}
            className="flex items-center justify-between rounded-xl bg-ink-700/50 px-3.5 py-2.5"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-white/85">
              <span>{f.icon}</span> {f.label}
            </span>
            <RatingInput value={scores[f.key]} onChange={(v) => setScore(f.key, v)} tone={tab} />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Amenities
        </span>
        <TagPicker value={tags} onChange={setTags} />
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="Your one-line take for the other dads…"
        className="w-full resize-none rounded-xl bg-ink-700/50 p-3 text-[15px] text-white placeholder:text-muted focus:outline-none"
      />

      <button
        onClick={save}
        className="w-full rounded-xl bg-dad py-3 text-sm font-bold text-white active:opacity-90"
      >
        {saved ? 'Saved ✓' : initial ? 'Update your review' : 'Save your review'}
      </button>
      <p className="text-center text-xs text-muted">
        Your scores blend into the community average everyone sees on the map.
      </p>
    </div>
  );
}

function AllReviews({ spot, currentUserId }: { spot: Spot; currentUserId: string }) {
  const sorted = useMemo(
    () => [...spot.reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [spot.reviews],
  );
  return (
    <div>
      <h3 className="mb-3 text-lg font-bold text-white">Reviews ({sorted.length})</h3>
      <div className="space-y-2.5">
        {sorted.map((r) => (
          <div key={r.id} className="rounded-2xl bg-ink-700/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">
                {r.author.id === currentUserId ? 'You' : r.author.name}
              </span>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="text-dad">Dad {dadScore(r).toFixed(1)}</span>
                <span className="text-kid">Kid {kidScore(r).toFixed(1)}</span>
              </div>
            </div>
            {r.note && <p className="mt-1.5 text-sm text-white/75">{r.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
