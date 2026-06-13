import type { StyleSpecification } from 'maplibre-gl';

/**
 * Fully keyless satellite + labels style.
 *  - Esri World Imagery for the satellite base.
 *  - Esri reference overlays (transportation + boundaries/places) for streets & labels.
 * No API key required. Attribution is rendered via MapLibre's AttributionControl.
 */
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';

export const satelliteStyle: StyleSpecification = {
  version: 8,
  // Glyphs needed if we add vector text later; harmless for raster-only styles.
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'esri-imagery': {
      type: 'raster',
      tiles: [`${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`],
      tileSize: 256,
      maxzoom: 19,
      attribution:
        'Imagery © Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    },
    'esri-transport': {
      type: 'raster',
      tiles: [`${ESRI}/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}`],
      tileSize: 256,
      maxzoom: 19,
    },
    'esri-places': {
      type: 'raster',
      tiles: [`${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Labels © Esri',
    },
  },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': '#0b1a26' } },
    { id: 'imagery', type: 'raster', source: 'esri-imagery' },
    { id: 'transport', type: 'raster', source: 'esri-transport' },
    { id: 'places', type: 'raster', source: 'esri-places' },
  ],
};

export const CAPE_TOWN_VIEW = {
  longitude: 18.46,
  latitude: -33.95,
  zoom: 10.5,
};
