---
name: stack-and-phases
description: DinePlay locked tech decisions and Phase 2 backend scope
metadata:
  type: project
---

DinePlay = a web-first, mobile-first PWA for two Cape Town dads to map kid-friendly
spots (good play area + good food/beer/views) and let a community add & rate pins.

**Phase 1 (built):** Vite + React + TS + Tailwind + MapLibre GL JS (`react-map-gl/maplibre`)
+ zustand + react-router + vite-plugin-pwa. Keyless Esri tiles (World Imagery satellite +
World_Transportation + World_Boundaries_and_Places overlays) in `src/features/map/mapStyle.ts`.
Mock data in `src/data/seed.ts`, accessed only through `src/data/spotsRepository.ts`
(localStorage impl) — this is the deliberate swap-point. Scoring = mockup set
(Dads: food/beer/vibe/speed/parking · Kids: size/fun/safety/menu); score objects kept
open so the original longer list (wine/ribs/pizza/views/variety/upkeep…) can be re-added
without migration. Current user is mocked as `Munki` (DADS.munki).

**Locked decisions:** web-first (Capacitor wraps the SAME codebase for iOS+Android stores
later); Esri keyless tiles (no API keys anywhere); sign-in method = **decide later** (pin
authorship is already modeled on every Spot).

**Phase 2 (not built yet):** swap `spotsRepository` for a Supabase impl (Postgres + PostGIS
for nearby queries, Storage for photos, Auth, RLS so pins keep their author), real
draft→publish + community ratings, then Capacitor for app-store builds. UI stays unchanged.
