import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { site } from './src/config/site.ts'

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
})
