# Mars Among Us

**Find the places on Earth that look like the Moon and Mars, and see why.** Built for the
[NASA Space Apps Challenge 2026](https://www.spaceappschallenge.org) (November 14–15, 2026).

Live: **https://malkawi06.github.io/mars-among-us/**

| Page                           | What it does                                                                                                                                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Analyze** (`/analyze`)       | Upload a Moon or Mars orbital image. An in-browser model tells the Moon from Mars, names the landform (19 classes), picks the Earth analog site whose satellite image looks most alike, boxes the matching areas and explains the match with sources. |
| **Compare** (`/compare`)       | Pick a place on the Moon (the nine Artemis III regions) or Mars and a purpose (rover testing, base, local resources, search for life, training). Every Earth site is scored factor by factor, with the target's orbital image next to the site.       |
| **Earth Analogs** (`/analogs`) | The analog sites on a satellite map, filtered by landform, each with the published research behind it.                                                                                                                                                |
| **About** (`/about`)           | The challenge, the solution, the data used and the team: the sections of the Space Apps submission form.                                                                                                                                              |

Images never leave the browser: the model runs locally with ONNX Runtime Web.

**Stack:** Vite · React 19 · TypeScript · Tailwind CSS v4 · React Router · Leaflet · ONNX Runtime Web ·
PyTorch (training) · Python (data scripts).

---

## How it works

### Landform model

A ConvNeXt-Nano classifier fine-tuned on 19,971 labelled NASA images: 16,150 Mars Context Camera tiles
(DoMars16k, 15 landforms) and 3,821 Lunar Reconnaissance Orbiter images (LROCNet and lunar rockfalls,
4 Moon classes). On 2,430 held-out test images: 89.4% overall (int8), 93.5% on Mars, 79.9% on the Moon,
and 99.96% at telling the Moon from Mars. It is quantised to int8 (~15 MB) and served from
`public/models/planet_landforms.int8.onnx`. Users can say whether an image is from the Moon or Mars;
the page then ranks only that world's landforms.

- Training notebook: `ml/train_moon_mars_landforms.ipynb` (Kaggle, free GPU).
- Earlier Mars-only model (15 classes, 93.8%): `ml/train_mars_landforms.ipynb`, kept in
  `public/models/mars_landforms.int8.onnx` as a fallback.

### Orbital images and scan (at deploy time)

The deploy workflow downloads the images and scans them with the model, so the pages load instantly:

- `scripts/fetch_earth_images.py` downloads ~6 km images of every site.
  - Earth: Sentinel-2 cloudless 2024 (EOX).
  - Mars: Global CTX Mosaic (Murray Lab).
  - Moon: LROC NAC south-pole mosaic (Moon Trek), which covers 85.5°S to the pole, so 4 of the 9 Artemis regions.
- `scripts/scan_earth_images.py` runs the model over ~1.5 km windows of each image and writes
  `public/earth/scan.json`.

These files are built on every deploy and are not committed.

### Compare scoring

Each purpose compares its own factors (slope, rock type, relief, temperature, aridity, ice). Every factor
scores 1, 2 or 3 with equal weights, after the NASA-led analog framework of Stern et al. 2025
(JGR Planets, doi 10.1029/2024JE008803). Factors with no sourced value are left out, and a score based on
fewer than two factors is flagged as low confidence. The data and its sources are in
[`analysis/`](analysis/README.md); regenerate `src/data/compare.ts` with
`python3 analysis/build_compare_data.py`.

---

## Run locally

Requires **Node.js 20.19+ or 22.12+**.

```bash
git clone https://github.com/malkawi06/mars-among-us.git
cd mars-among-us
npm install
npm run dev              # http://localhost:5173
```

The satellite images and scan are made at deploy time. To have them locally (needs Python 3 with
Pillow, NumPy and onnxruntime):

```bash
python scripts/fetch_earth_images.py
python scripts/scan_earth_images.py
```

| Script                 | What it does                               |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Dev server with hot reload                 |
| `npm run build`        | Type-check (`tsc -b`) and production build |
| `npm run preview`      | Serve the production build locally         |
| `npm run lint`         | ESLint                                     |
| `npm run format`       | Format everything with Prettier            |
| `npm run format:check` | Check formatting without writing           |

## Deploy

GitHub Pages is the main host: `.github/workflows/deploy-pages.yml` fetches and scans the images, builds
and publishes every push to `main`. `netlify.toml` and `vercel.json` keep the same app working on Netlify
and Vercel (SPA fallback), without the satellite images.

## Project layout

```
src/
├── config/site.ts       ← all page text: name, pitch, nav, About sections, team, links
├── data/
│   ├── analogs.ts       ← Earth analog sites per landform, with sources
│   └── compare.ts       ← generated by analysis/build_compare_data.py
├── lib/
│   ├── landformModel.ts ← loads the ONNX model and classifies an image
│   ├── earthScan.ts     ← reads the deploy-time images and scan, finds matching areas
│   ├── similarity.ts    ← Compare scoring
│   └── nasa.ts          ← NASA GIBS map layers
├── components/          ← shared UI (SpotImages, TargetImages, SimilarSpots, AnalogMap, …)
├── pages/               ← Home, Analyze, Analogs, Compare, About
└── index.css            ← Tailwind + light/dark color tokens
analysis/                ← sourced data and method for Compare
ml/                      ← training notebooks
scripts/                 ← deploy-time image download and scan
```

## Data and credits

- **DoMars16k:** Wilhelm et al. 2020, doi 10.5281/zenodo.4291940, CC-BY-4.0. MRO Context Camera images (NASA/JPL/MSSS).
- **Global CTX Mosaic of Mars:** NASA/JPL/MSSS/The Murray Lab.
- **LROC NAC south-pole mosaic:** NASA/GSFC/Arizona State University, via NASA Moon Trek.
- **Artemis III candidate regions:** NASA, October 28, 2024. Region centres from JGR Planets 2025, doi 10.1029/2025JE009434.
- **Climate:** NASA POWER, 2001–2020.
- **Elevation and slope:** ASTER GDEM (NASA/METI).
- **Earth satellite images:** Sentinel-2 cloudless 2024 by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2024).
- **Maps:** NASA GIBS and OpenStreetMap.

This project is not affiliated with or endorsed by NASA.
