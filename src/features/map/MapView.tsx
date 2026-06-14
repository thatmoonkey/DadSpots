import { forwardRef, useImperativeHandle, useRef } from 'react';
import Map, {
  Marker,
  AttributionControl,
  type MapRef,
  type MapLayerMouseEvent,
} from 'react-map-gl/maplibre';
import type { Spot } from '../../data/types';
import { satelliteStyle, CAPE_TOWN_VIEW } from './mapStyle';
import type { FilterKey, LatLng } from '../../store/useAppStore';

export interface MapHandle {
  flyTo: (loc: LatLng, zoom?: number) => void;
}

type Emphasis = 'selected' | 'normal' | 'faded';

interface MapViewProps {
  spots: Spot[];
  selectedId?: string | null;
  /** When set (and nothing selected), pins not matching the filter fade back. */
  filter?: FilterKey;
  userLocation?: LatLng | null;
  draft?: Spot | null;
  draggableDraft?: boolean;
  onSpotClick?: (id: string) => void;
  onMapClick?: (loc: LatLng) => void;
  onDraftMove?: (loc: LatLng) => void;
  onMoveEnd?: (center: LatLng) => void;
  className?: string;
}

export const MapView = forwardRef<MapHandle, MapViewProps>(function MapView(
  {
    spots,
    selectedId,
    filter = 'all',
    userLocation,
    draft,
    draggableDraft,
    onSpotClick,
    onMapClick,
    onDraftMove,
    onMoveEnd,
    className,
  },
  ref,
) {
  const mapRef = useRef<MapRef>(null);

  const emphasisOf = (s: Spot): Emphasis => {
    if (selectedId) return s.id === selectedId ? 'selected' : 'faded';
    if (filter !== 'all' && s.status !== filter) return 'faded';
    return 'normal';
  };

  useImperativeHandle(ref, () => ({
    flyTo: (loc, zoom = 14) =>
      mapRef.current?.flyTo({ center: [loc.lng, loc.lat], zoom, duration: 900 }),
  }));

  const handleClick = (e: MapLayerMouseEvent) => {
    onMapClick?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
  };

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
    <Map
      ref={mapRef}
      initialViewState={CAPE_TOWN_VIEW}
      mapStyle={satelliteStyle}
      attributionControl={false}
      onClick={onMapClick ? handleClick : undefined}
      onMoveEnd={
        onMoveEnd
          ? (e) => {
              const c = e.target.getCenter();
              onMoveEnd({ lat: c.lat, lng: c.lng });
            }
          : undefined
      }
      style={{ width: '100%', height: '100%' }}
    >
      <AttributionControl compact position="bottom-right" />

      {userLocation && (
        <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
          <div className="relative h-4 w-4">
            <span className="absolute inset-0 animate-ping rounded-full bg-kid/40" />
            <span className="absolute inset-0 rounded-full border-2 border-white bg-kid shadow-pin" />
          </div>
        </Marker>
      )}

      {spots.map((s) => {
        const emphasis = emphasisOf(s);
        return (
          <Marker
            key={s.id}
            longitude={s.lng}
            latitude={s.lat}
            anchor="bottom"
            style={{ zIndex: emphasis === 'selected' ? 10 : emphasis === 'faded' ? 1 : 2 }}
            onClick={(e) => {
              // Don't let the click fall through to the map (which deselects).
              e.originalEvent?.stopPropagation();
              onSpotClick?.(s.id);
            }}
          >
            <SpotPin spot={s} emphasis={emphasis} />
          </Marker>
        );
      })}

      {draft && (
        <Marker
          longitude={draft.lng}
          latitude={draft.lat}
          anchor="bottom"
          draggable={draggableDraft}
          onDragEnd={(e) => onDraftMove?.({ lat: e.lngLat.lat, lng: e.lngLat.lng })}
        >
          <DraftPin />
        </Marker>
      )}
    </Map>
    </div>
  );
});

function SpotPin({ spot, emphasis }: { spot: Spot; emphasis: Emphasis }) {
  const color = spot.status === 'reviewed' ? '#ff6a2b' : '#3b88f5';
  const scale = emphasis === 'selected' ? 1.3 : emphasis === 'faded' ? 0.78 : 1;
  const opacity = emphasis === 'faded' ? 0.4 : 1;
  return (
    <button
      aria-label={spot.name}
      className="grid place-items-center transition-all duration-300 ease-out"
      style={{ transform: `scale(${scale})`, opacity }}
    >
      <svg
        width="30"
        height="38"
        viewBox="0 0 30 38"
        className={
          emphasis === 'selected'
            ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]'
            : 'drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]'
        }
      >
        <path
          d="M15 1C7.8 1 2 6.8 2 14c0 8.4 11 22 13 22s13-13.6 13-22C28 6.8 22.2 1 15 1Z"
          fill={color}
          stroke="white"
          strokeWidth={emphasis === 'selected' ? 2.5 : 2}
        />
        <circle cx="15" cy="14" r="5" fill="white" />
      </svg>
    </button>
  );
}

function DraftPin() {
  return (
    <div className="animate-pin-drop grid place-items-center">
      <svg width="34" height="44" viewBox="0 0 30 38" className="drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]">
        <path
          d="M15 1C7.8 1 2 6.8 2 14c0 8.4 11 22 13 22s13-13.6 13-22C28 6.8 22.2 1 15 1Z"
          fill="#ff6a2b"
          stroke="white"
          strokeWidth="2.5"
        />
        <circle cx="15" cy="14" r="5.5" fill="white" />
      </svg>
    </div>
  );
}
