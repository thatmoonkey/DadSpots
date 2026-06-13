import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapView, type MapHandle } from '../features/map/MapView';
import { SearchBar } from '../features/drawer/SearchBar';
import { FilterChips } from '../features/drawer/FilterChips';
import { SpotListRow } from '../features/drawer/SpotListRow';
import { BottomSheet } from '../components/BottomSheet';
import { TabBar } from '../components/TabBar';
import {
  useAppStore,
  selectVisibleSpots,
  type FilterKey,
} from '../store/useAppStore';

export function MapHome() {
  const navigate = useNavigate();
  const mapRef = useRef<MapHandle>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [locating, setLocating] = useState(false);
  const [topInset, setTopInset] = useState(150);

  const state = useAppStore();
  const {
    spots,
    filter,
    query,
    selectedSpotId,
    userLocation,
    setFilter,
    setQuery,
    selectSpot,
    setUserLocation,
    setMapCenter,
  } = state;

  const visible = useMemo(() => selectVisibleSpots(state), [state]);

  const counts = useMemo(() => {
    const pub = spots.filter((s) => s.published);
    return {
      all: pub.length,
      reviewed: pub.filter((s) => s.status === 'reviewed').length,
      to_visit: pub.filter((s) => s.status === 'to_visit').length,
    } as Record<FilterKey, number>;
  }, [spots]);

  // Keep a selected spot pinned to the top of the list for quick access.
  const ordered = useMemo(() => {
    if (!selectedSpotId) return visible;
    const sel = visible.find((s) => s.id === selectedSpotId);
    if (!sel) return visible;
    return [sel, ...visible.filter((s) => s.id !== selectedSpotId)];
  }, [visible, selectedSpotId]);

  // Tapping a pin opens the full spot detail.
  const handlePinClick = (id: string) => navigate(`/spot/${id}`);

  // Tapping a list row recenters the map on that spot and collapses the sheet
  // so the pin is visible (tap the pin to open its detail).
  const handleRowClick = (id: string) => {
    const s = spots.find((x) => x.id === id);
    if (s) mapRef.current?.flyTo({ lat: s.lat, lng: s.lng }, 14);
    selectSpot(id);
    setExpanded(false);
  };

  // Measure the search + chips bar so the expanded sheet stops just below it.
  useEffect(() => {
    const measure = () => {
      if (topRef.current) setTopInset(topRef.current.offsetHeight + 8);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // When arriving with a spot already selected (e.g. "Show on Map"), fly to it.
  useEffect(() => {
    if (!selectedSpotId) return;
    const s = spots.find((x) => x.id === selectedSpotId);
    if (s) {
      const t = setTimeout(() => mapRef.current?.flyTo({ lat: s.lat, lng: s.lng }, 14), 250);
      setExpanded(true);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocate = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        mapRef.current?.flyTo(loc, 13);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-ink-900">
      <MapView
        ref={mapRef}
        className="absolute inset-0"
        spots={spots.filter((s) => s.published)}
        selectedId={selectedSpotId}
        userLocation={userLocation}
        onSpotClick={handlePinClick}
        onMoveEnd={setMapCenter}
      />

      <div
        ref={topRef}
        className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto max-w-md space-y-3"
        style={{ paddingTop: 'calc(var(--sat) + 12px)' }}
      >
        <div className="pointer-events-auto">
          <SearchBar
            value={query}
            onChange={setQuery}
            onLocate={handleLocate}
            locating={locating}
          />
        </div>
        <div className="pointer-events-auto">
          <FilterChips value={filter} counts={counts} onChange={setFilter} />
        </div>
      </div>

      <BottomSheet
        expanded={expanded}
        onExpandedChange={setExpanded}
        topInset={topInset}
        header={
          <div className="flex items-end justify-between pb-3">
            <h2 className="text-lg font-bold text-white">Nearby Spots</h2>
            <span className="text-sm text-muted">{ordered.length} places</span>
          </div>
        }
      >
        <div className="space-y-2.5">
          {ordered.length === 0 && (
            <p className="px-1 py-8 text-center text-sm text-muted">
              No spots match. Try a different filter or search.
            </p>
          )}
          {ordered.map((s) => (
            <SpotListRow
              key={s.id}
              spot={s}
              distance={s.distance}
              selected={s.id === selectedSpotId}
              onClick={() => handleRowClick(s.id)}
            />
          ))}
        </div>
      </BottomSheet>

      <TabBar />
    </div>
  );
}
