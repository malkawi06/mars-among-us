# Mars Among Us: NASA Space Apps 2026 starter

A ready-to-deploy starter web app for the [NASA Space Apps Challenge 2026](https://www.spaceappschallenge.org) (November 14–15, 2026).

It is a **generic template**, not a solution to any specific challenge. Setup, deployment, structure, theming and NASA API wiring are done, so hackathon time goes into features.

**What's included**

| Route      | What it shows                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`        | Hero with project name, one-line pitch, team, challenge and call-to-action                                                                 |
| `/explore` | Leaflet map (OpenStreetMap + NASA GIBS satellite imagery with date, layer and opacity controls) next to stat tiles and a time-series chart |
| `/data`    | Live calls to api.nasa.gov (APOD, plus click-to-load NeoWs asteroids) and NASA CCMC DONKI space weather, proving the API wiring            |
| `/about`   | The Challenge, Our Solution, NASA Data Used, Use of AI, Team: the same sections the Space Apps submission form asks for                    |

Shared layout: navbar, mobile menu, footer, dark theme by default with a light/dark toggle, responsive down to phone width.

**Stack:** Vite · React 19 · TypeScript · Tailwind CSS v4 · React Router · Recharts · Leaflet (react-leaflet) · ESLint + Prettier · npm.

---

## Run locally

Requires **Node.js 20.19+ or 22.12+** (Vite 8 requirement).

```bash
git clone https://github.com/malkawi06/mars-among-us.git
cd mars-among-us
npm install
cp .env.example .env     # then paste your key into VITE_NASA_API_KEY (optional)
npm run dev              # http://localhost:5173
```

Without a key the app uses NASA's `DEMO_KEY`, which allows only about 30 requests per hour per IP. Get a free key at [api.nasa.gov](https://api.nasa.gov); it takes under a minute.

| Script                 | What it does                                   |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Dev server with hot reload                     |
| `npm run build`        | Type-check (`tsc -b`) and production build     |
| `npm run preview`      | Serve the production build locally             |
| `npm run lint`         | ESLint                                         |
| `npm run format`       | Format everything with Prettier                |
| `npm run format:check` | Check formatting without writing (CI-friendly) |

> `VITE_*` variables are bundled into the browser JavaScript, so anyone can read the key in the deployed site. That is normal for api.nasa.gov keys, but never put a secret there.

---

## Deploy to Vercel

`vercel.json` is already set up: Vite build, `dist` output, a rewrite that sends every route to `index.html` (so refreshing `/explore` works), and the `/api/donki` proxy (see [Known API changes](#known-api-changes-october-2026)).

### Option A: Git import (recommended)

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub. The free Hobby plan is enough.
2. Import `malkawi06/mars-among-us`. Vercel detects Vite; keep the defaults.
3. Under **Environment Variables**, add `VITE_NASA_API_KEY` with your key (all environments).
4. Click **Deploy**. Copy the production URL into `links.demo` in `src/config/site.ts`.

After that, every push to `main` deploys to production, and every other branch or PR gets its own preview URL.

> Changed `VITE_NASA_API_KEY` later? Redeploy (Deployments → ⋯ → Redeploy). Vite reads env vars at build time.

### Option B: Vercel CLI

```bash
npx vercel          # first run: log in, link the project, get a preview URL
npx vercel env add VITE_NASA_API_KEY
npx vercel --prod   # production deploy
```

### Netlify (fallback host)

Some networks in Jordan can't reach `*.vercel.app` at all (DNS and IP both time out). The same app runs on Netlify: **https://marc-amoung-u.netlify.app**. `netlify.toml` mirrors `vercel.json` (build, SPA fallback, `/api/donki` proxy). In Netlify: Add new site → Import from GitHub → pick this repo → add `VITE_NASA_API_KEY` → Deploy. Every push to `main` then deploys to both hosts.

---

## Where to edit things

### Project info: `src/config/site.ts`

**Every piece of project-specific text lives in this one file**: project name, pitch, event, challenge name and link, team name, members, links (repo, demo, video, slides), nav items, home highlights, Explore labels, the About sections and the footer. Pages only read from it. The browser tab title and `<meta description>` in `index.html` are filled from it at build time too.

### Code layout

```
src/
├── config/site.ts       ← all placeholder text (edit first)
├── lib/
│   ├── nasa.ts          ← typed NASA helpers: apod, neoFeed, donkiNotifications, gibsTileUrl, GIBS_LAYERS
│   ├── sampleData.ts    ← synthetic time series (replace with real data)
│   ├── chartTheme.ts    ← chart colors (CSS variables; follow light/dark)
│   ├── date.ts          ← YYYY-MM-DD helpers (UTC)
│   ├── format.ts        ← number formatting
│   └── theme.ts         ← light/dark theme store
├── hooks/
│   ├── useAsync.ts      ← loading/error/data state for any promise
│   ├── usePageTitle.ts
│   └── useTheme.ts
├── components/          ← Card, StatTile, ChartCard, MapView, LoadingState, ErrorState,
│                          PageHeader, Layout, Navbar, Footer, ThemeToggle
├── pages/               ← Home, Explore, Data, About, NotFound, ErrorPage
├── App.tsx              ← routes
└── index.css            ← Tailwind + theme color tokens
```

Colors are CSS variables in `src/index.css` (`--accent`, `--surface`, `--series-1`, …) exposed as Tailwind classes (`bg-surface`, `text-muted`, `border-border`, `text-accent`). Change a color there and both themes follow.

### Add a new page

1. Create `src/pages/Impact.tsx`:

   ```tsx
   import { Card } from '../components/Card'
   import { PageHeader } from '../components/PageHeader'
   import { usePageTitle } from '../hooks/usePageTitle'

   export default function Impact() {
     usePageTitle('Impact')
     return (
       <div className="mx-auto max-w-7xl px-4 py-8">
         <PageHeader title="Impact" intro="Who this helps and how." />
         <Card title="Hello">Content goes here.</Card>
       </div>
     )
   }
   ```

2. Register the route in `src/App.tsx`:

   ```tsx
   const Impact = lazy(() => import('./pages/Impact'))
   // ...inside the children array:
   { path: 'impact', element: <Impact /> },
   ```

3. Add it to the navbar in `src/config/site.ts`:

   ```ts
   nav: [..., { to: '/impact', label: 'Impact' }],
   ```

### Fetch data

Helpers in `src/lib/nasa.ts` return typed promises, cache responses in memory, and throw readable `NasaApiError`s (rate limit, bad key, NASA server error). `useAsync` turns any promise into `{ data, error, loading, reload }`:

```tsx
const { data, error, loading, reload } = useAsync(`apod:${date}`, () => apod({ date }))

if (loading) return <LoadingState />
if (error) return <ErrorState error={error} onRetry={reload} />
return <h2>{data?.title}</h2>
```

The first argument is a key: include every input the request depends on. Pass `null` to wait (e.g. until a button is clicked).

For an api.nasa.gov endpoint without a helper, use `nasaGet('/path', params)` (adds the key). For any other JSON API, use `cachedJson(withParams(url, params))`. Example with NASA POWER (no key):

```ts
const power = await cachedJson(
  withParams('https://power.larc.nasa.gov/api/temporal/daily/point', {
    parameters: 'T2M',
    community: 'RE',
    latitude: 32.55,
    longitude: 35.85,
    start: '20250101',
    end: '20250131',
    format: 'JSON',
  }),
)
```

If an API blocks browser requests (CORS), proxy it the way `/api/donki` is proxied: one rewrite in `vercel.json` and one entry in `server.proxy` in `vite.config.ts`.

### Map layers

`MapView` takes `gibsLayer`, `gibsDate` (YYYY-MM-DD) and `gibsOpacity`, plus any react-leaflet children (markers, GeoJSON). To add a GIBS layer, find its identifier in [Worldview](https://worldview.earthdata.nasa.gov) or the [GIBS layer list](https://nasa-gibs.github.io/gibs-api-docs/available-visualizations/), then add it to `GIBS_LAYERS` in `src/lib/nasa.ts` with its image format (`jpg`/`png`) and `maxNativeZoom` (the N in its `GoogleMapsCompatible_LevelN` tile matrix set).

### Replace the sample chart data

`src/pages/Explore.tsx` calls `sampleTimeSeries(date, 30)`. Swap it for real data with the same `{ date, value }[]` shape; the stat tiles, chart and data table update on their own.

---

## Mars landform model

`/analyze` classifies an uploaded Mars orbital image into one of 15 landforms and lists matching Earth analog sites (`src/data/analogs.ts`). The model runs entirely in the browser with onnxruntime-web, so images are never uploaded.

1. Train it on Kaggle with `ml/train_mars_landforms.ipynb` (GPU, Internet on, **Save & Run All**). It prints the test accuracy of both the PyTorch model and the int8 file.
2. Download `mars_landforms.int8.onnx` (~15 MB) from the notebook's **Output** panel.
3. On GitHub, open `public/models/`, then **Add file → Upload files**, and commit. Netlify and Vercel redeploy on their own.

Until the file is there, the page explains that the model is missing.

## Useful NASA data sources

| Source                                                                                                                                                  | What it's good for                                                                                                                                       | Access                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [api.nasa.gov](https://api.nasa.gov)                                                                                                                    | APOD, NeoWs (asteroids), EPIC (Earth images), Mars rover photos, NASA Image and Video Library, and more                                                  | Free key (`VITE_NASA_API_KEY`)                         |
| [Earthdata](https://www.earthdata.nasa.gov) · [Earthdata Search](https://search.earthdata.nasa.gov) · [earthaccess](https://earthaccess.readthedocs.io) | The full archive of NASA Earth science data. `earthaccess` is a Python library to search and download it (great in a notebook for preprocessing)         | Free [Earthdata Login](https://urs.earthdata.nasa.gov) |
| [FIRMS](https://firms.modaps.eosdis.nasa.gov) · [API](https://firms.modaps.eosdis.nasa.gov/api/)                                                        | Active fires and thermal anomalies (MODIS, VIIRS), near real time, as CSV/JSON/KML                                                                       | Free MAP_KEY                                           |
| [NASA POWER](https://power.larc.nasa.gov) · [API docs](https://power.larc.nasa.gov/docs/services/api/)                                                  | Daily/monthly solar, temperature, precipitation, wind for any lat/lon since 1981. A good fit for the Explore chart: click a point, chart its time series | No key                                                 |
| [GIBS](https://nasa-gibs.github.io/gibs-api-docs/) · [Worldview](https://worldview.earthdata.nasa.gov)                                                  | 1,000+ daily satellite imagery layers as map tiles (WMTS). Browse in Worldview, then use the layer id in `GIBS_LAYERS`                                   | No key                                                 |
| [Mars Trek](https://trek.nasa.gov/mars/) · [Moon Trek](https://trek.nasa.gov/moon/)                                                                     | Planetary maps, elevation and mosaics, with WMTS tile services for Leaflet                                                                               | No key                                                 |
| [DONKI (CCMC)](https://ccmc.gsfc.nasa.gov/tools/DONKI/)                                                                                                 | Space weather: flares, CMEs, geomagnetic storms, notifications                                                                                           | No key                                                 |

Also check the **Resources** tab on your challenge's page on spaceappschallenge.org: it lists the datasets the challenge authors had in mind, including partner agency data.

---

## Known API changes (October 2026)

- **DONKI moved.** On 2026-09-30 NASA CCMC moved the DONKI API to `https://ccmc.gsfc.nasa.gov/DONKI-API/get/…` (same parameters and JSON). `https://api.nasa.gov/DONKI/...` now redirects to an HTML announcement page. `donkiNotifications()` calls the new API through the `/api/donki` proxy, which works in `npm run dev`, `npm run preview` and on Vercel.
- **APOD is flaky.** APOD moved to science.nasa.gov/apod. Since then the APOD API has returned HTTP 500 for today's picture, and some past dates return the wrong title and image. The Data page shows NASA's error with a **Try again** button, and you can pick another date. If you need dependable data for your demo, use another endpoint.

---

## Hackathon-day checklist

**Before the event**

- [ ] Get an api.nasa.gov key. Put it in `.env` locally and in Vercel → Settings → Environment Variables as `VITE_NASA_API_KEY`, then redeploy
- [ ] Import the repo on Vercel and open the live URL. Put it in `links.demo` in `src/config/site.ts`
- [ ] Add teammates as GitHub collaborators; everyone runs `npm install && npm run dev` once
- [ ] Register the team on spaceappschallenge.org and join a local or virtual event

**Day 1 (November 14)**

- [ ] Pick the challenge. Fill `src/config/site.ts`: `name`, `pitch`, `challenge.name` and `challenge.url`, `team`, `members`
- [ ] List the data you need (see the table above). Wire it up in `src/lib/nasa.ts` and confirm it loads on a page
- [ ] Replace `sampleTimeSeries` on Explore with real data, or replace the page
- [ ] Remove what you don't need (the NEO/DONKI cards, extra GIBS layers, nav items)
- [ ] Work on branches, push small commits often; Vercel posts a preview URL for every PR

**Day 2 (November 15), before the submission deadline**

- [ ] `npm run lint && npm run build` pass; merge to `main`; the production URL works
- [ ] Open the live site on a phone; refresh a deep link like `/explore`
- [ ] Fill the About page: The Challenge, Our Solution, NASA Data Used, Use of AI, Team
- [ ] Record the demo video and add `links.video` and `links.slides`
- [ ] Submit on spaceappschallenge.org with the live URL, the repo link, and the same text as the About page
