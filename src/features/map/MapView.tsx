import { forwardRef, useImperativeHandle, useRef } from 'react';
import Map, {
  Marker,
  AttributionControl,
  type MapRef,
  type MapLayerMouseEvent,
} from 'react-map-gl/maplibre';
import type { Spot } from '../../data/types';
import { satelliteStyle, CAPE_TOWN_VIEW } from './mapStyle';
import type { LatLng } from '../../store/useAppStore';

export interface MapHandle {
  flyTo: (loc: LatLng, zoom?: number) => void;
}

interface MapViewProps {
  spots: Spot[];
  selectedId?: string | null;
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

      {spots.map((s) => (
        <Marker
          key={s.id}
          longitude={s.lng}
          latitude={s.lat}
          anchor="bottom"
          onClick={() => onSpotClick?.(s.id)}
        >
          <SpotPin spot={s} selected={s.id === selectedId} />
        </Marker>
      ))}

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

function SpotPin({ spot, selected }: { spot: Spot; selected: boolean }) {
  const color = spot.status === 'reviewed' ? '#ff6a2b' : '#3b88f5';
  const scale = selected ? 1.25 : 1;
  return (
    <button
      aria-label={spot.name}
      className="grid place-items-center transition-transform"
      style={{ transform: `scale(${scale})` }}
    >
      <svg width="30" height="38" viewBox="0 0 30 38" className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
        <path
          d="M15 1C7.8 1 2 6.8 2 14c0 8.4 11 22 13 22s13-13.6 13-22C28 6.8 22.2 1 15 1Z"
          fill={color}
          stroke="white"
          strokeWidth="2"
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
