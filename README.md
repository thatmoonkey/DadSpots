# DinePlay 🍴🛝

A mobile-first web app (installable PWA) for dads to map kid-friendly spots — places with
a good play area for the kids **and** good food, beer and views for the dads. Browse a
satellite map of spots, filter and search, and drop your own pins for the community to
see and rate, credited to you.

> Started life as a shared text list of Cape Town favourites; this is that list levelled up.

## Stack

- **Vite + React + TypeScript**
- **Tailwind CSS** (dark theme, orange "Dad" / blue "Kid" accents)
- **MapLibre GL JS** via `react-map-gl/maplibre` — keyless **Esri World Imagery** satellite
  with Esri street + label overlays (no API keys)
- **zustand** state, **react-router**, **vite-plugin-pwa**

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production PWA build
```

## How it's organised

```
src/
  data/        types, scoring, seed spots, spotsRepository (the backend swap-point)
  store/       zustand app store
  features/
    map/       MapView + keyless Esri map style
    drawer/    nearby list, search, filter chips
    add/       tag picker (add-spot flow)
  screens/     MapHome · SpotDetail · AddSpotFlow (3 steps) · Profile
  components/  TabBar, BottomSheet, RatingInput, Score, icons…
```

Data currently lives in `localStorage` on top of a seed list, accessed **only** through
`src/data/spotsRepository.ts`. That interface is the single seam: Phase 2 swaps it for a
Supabase backend (Postgres + PostGIS, Auth, Storage) without touching the UI, then
Capacitor wraps this same codebase into iOS + Android app-store builds.

## Roadmap

- [ ] Supabase backend — real accounts, publishing, community ratings (RLS keeps pin authorship)
- [ ] Photo uploads for spots
- [ ] Capacitor iOS + Android builds
- [ ] Pin clustering at high density
