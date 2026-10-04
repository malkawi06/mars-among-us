import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { site } from './src/config/site.ts'
import { ANALOG_SITES, LANDFORM_NAMES } from './src/data/analogs.ts'
import { EARTH_SITES, TARGETS } from './src/data/compare.ts'
import { PURPOSES } from './src/lib/similarity.ts'

// Fills %SITE_NAME% and %SITE_DESCRIPTION% in index.html from src/config/site.ts,
// so the browser tab and link previews stay in sync with the rest of the app.
function siteMeta(): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml: (html) =>
      html.replaceAll('%SITE_NAME%', site.name).replaceAll('%SITE_DESCRIPTION%', site.pitch),
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
    }),
  },
})
