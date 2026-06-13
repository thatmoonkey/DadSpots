import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

interface BottomSheetProps {
  /** Always-visible header (handle + title live here). */
  header: ReactNode;
  children: ReactNode;
  /** Peek height in px when collapsed. */
  peek?: number;
  expanded: boolean;
  onExpandedChange: (v: boolean) => void;
  /** px reserved at the bottom for the tab bar. */
  bottomInset?: number;
}

export function BottomSheet({
  header,
  children,
  peek = 168,
  expanded,
  onExpandedChange,
  bottomInset = 64,
}: BottomSheetProps) {
  const [vh, setVh] = useState(() => window.innerHeight);
  const expandedH = Math.round(vh * 0.84);
  const maxOffset = Math.max(0, expandedH - peek);

  const [drag, setDrag] = useState<number | null>(null);
  const startY = useRef(0);
  const startOffset = useRef(0);
  const moved = useRef(false);

  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const baseOffset = expanded ? 0 : maxOffset;
  const offset = drag ?? baseOffset;

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      startY.current = e.clientY;
      startOffset.current = baseOffset;
      moved.current = false;
      setDrag(baseOffset);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [baseOffset],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (drag === null) return;
      if (Math.abs(e.clientY - startY.current) > 4) moved.current = true;
      const next = startOffset.current + (e.clientY - startY.current);
      setDrag(Math.min(maxOffset, Math.max(0, next)));
    },
    [drag, maxOffset],
  );

  const onPointerUp = useCallback(() => {
    if (drag === null) return;
    // A tap (no real movement) toggles; a drag snaps to the nearer end.
    if (!moved.current) onExpandedChange(!expanded);
    else onExpandedChange(drag < maxOffset / 2);
    setDrag(null);
  }, [drag, maxOffset, expanded, onExpandedChange]);

  return (
    <div
      className="absolute inset-x-0 z-20 mx-auto max-w-md touch-none"
      style={{ bottom: bottomInset, height: expandedH }}
    >
      <div
        className="flex h-full flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-ink-800/95 shadow-sheet backdrop-blur-xl"
        style={{
          transform: `translateY(${offset}px)`,
          transition: drag === null ? 'transform 0.32s cubic-bezier(0.22,1,0.36,1)' : 'none',
        }}
      >
        <div
          className="shrink-0 cursor-grab px-4 pt-2.5 active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/25" />
          {header}
        </div>
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
