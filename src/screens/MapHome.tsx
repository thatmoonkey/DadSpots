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
import { distanceKm } from '../data/scoring';

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
    mapCenter,
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

  // The currently focused spot (selected directly on the map or in the shelf).
  const selectedSpot = useMemo(
    () => (selectedSpotId ? spots.find((s) => s.id === selectedSpotId) : undefined),
    [spots, selectedSpotId],
  );

  // What the shelf shows: only the selected spot's card when one is focused,
  // otherwise the filtered/searched list.
  const shelfSpots = useMemo(() => {
    if (selectedSpot) {
      const center = userLocation ?? mapCenter;
      return [{ ...selectedSpot, distance: distanceKm(center, selectedSpot) }];
    }
    return visible;
  }, [selectedSpot, visible, userLocation, mapCenter]);

  // Focus a spot: recenter, highlight its pin (fading the rest) and reduce the
  // shelf to just its card.
  const focusSpot = (id: string) => {
    const s = spots.find((x) => x.id === id);
    if (s) mapRef.current?.flyTo({ lat: s.lat, lng: s.lng }, 14);
    selectSpot(id);
    setExpanded(false);
  };

  // Tapping a card: focus it; tapping the already-focused card opens its detail.
  const handleCardClick = (id: string) => {
    if (id === selectedSpotId) navigate(`/spot/${id}`);
    else focusSpot(id);
  };

  // Tapping the map background clears the focused pin.
  const handleBackgroundClick = () => {
    if (selectedSpotId) selectSpot(null);
  };

  // Changing the filter clears any single-pin focus.
  const handleFilterChange = (f: FilterKey) => {
    selectSpot(null);
    setFilter(f);
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
      setExpanded(false);
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
        filter={filter}
        userLocation={userLocation}
        onSpotClick={focusSpot}
        onMapClick={handleBackgroundClick}
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
          <FilterChips value={filter} counts={counts} onChange={handleFilterChange} />
        </div>
      </div>

      <BottomSheet
        expanded={expanded}
        onExpandedChange={setExpanded}
        topInset={topInset}
        header={
          selectedSpot ? (
            <div className="flex items-center justify-between pb-3">
              <h2 className="truncate pr-2 text-lg font-bold text-white">
                {selectedSpot.name}
              </h2>
              <button
                onClick={() => selectSpot(null)}
                className="shrink-0 text-sm font-semibold text-dad"
              >
                Show all
              </button>
            </div>
          ) : (
            <div className="flex items-end justify-between pb-3">
              <h2 className="text-lg font-bold text-white">Nearby Spots</h2>
              <span className="text-sm text-muted">{shelfSpots.length} places</span>
            </div>
          )
        }
      >
        <div className="space-y-2.5">
          {shelfSpots.length === 0 && (
            <p className="px-1 py-8 text-center text-sm text-muted">
              No spots match. Try a different filter or search.
            </p>
          )}
          {shelfSpots.map((s) => (
            <SpotListRow
              key={s.id}
              spot={s}
              distance={s.distance}
              selected={s.id === selectedSpotId}
              onClick={() => handleCardClick(s.id)}
            />
          ))}
          {selectedSpot && (
            <p className="px-1 pt-1 text-center text-xs text-muted">
              Tap the card for full details · tap the map to clear
            </p>
          )}
        </div>
      </BottomSheet>

      <TabBar />
    </div>
  );
}
