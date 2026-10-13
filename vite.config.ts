import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { site } from './src/config/site.ts'
import { ANALOG_SITES, LANDFORM_NAMES } from './src/data/analogs.ts'
import { EARTH_SITES, TARGETS } from './src/data/compare.ts'
import { PURPOSES, rank } from './src/lib/similarity.ts'

// The home page's worked example: the best Earth match for a Moon region, computed from the real data.
const exampleTarget = TARGETS.find((t) => t.id === 'moon-2')!
const examplePurpose = PURPOSES.find((p) => p.id === 'training')!
const exampleMatch = rank(exampleTarget, examplePurpose, EARTH_SITES)[0]

// Fills %SITE_NAME%, %SITE_DESCRIPTION% and %SITE_URL% in index.html from src/config/site.ts,
// so the browser tab and link previews stay in sync with the rest of the app.
function siteMeta(): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml: (html) =>
      html
        .replaceAll('%SITE_NAME%', site.name)
        .replaceAll('%SITE_DESCRIPTION%', site.pitch)
        // Link previews need an absolute URL for the image.
        .replaceAll('%SITE_URL%', site.links.demo),
  }
}

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /<repo>/; the deploy workflow sets BASE_PATH. Everywhere else: '/'.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss(), siteMeta()],
  // The home page shows only these counts and names; passing them in at build time keeps the full
  // site data out of the first page load (it loads with the Compare and Earth Analogs pages).
  define: {
    __HOME_STATS__: JSON.stringify({
      targets: TARGETS.length,
      earthSites: EARTH_SITES.length,
      purposes: PURPOSES.length,
      analogSites: ANALOG_SITES.length,
      landforms: Object.entries(LANDFORM_NAMES),
      example: {
        targetId: exampleTarget.id,
        targetName: exampleTarget.name,
        purposeId: examplePurpose.id,
        purposeLabel: examplePurpose.label,
        siteId: exampleMatch.site.id,
        siteName: exampleMatch.site.name,
        siteCountry: exampleMatch.site.country,
        percent: exampleMatch.percent,
        factors: exampleMatch.factors
          .filter((f) => f.score !== null)
          .map((f) => ({ label: f.label, score: f.score, reason: f.reason })),
        notScored: exampleMatch.factors.filter((f) => f.score === null).map((f) => f.label),
      },
    }),
  },
})
