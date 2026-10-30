// Temporary: save the challenge's Resources tab as text and links.
import { chromium } from 'playwright'
import fs from 'node:fs'
const BASE = 'https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/'
const OUT = 'challenge-snapshot'
fs.mkdirSync(OUT, { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
p.setDefaultTimeout(60000)
await p.goto(BASE + '?tab=resources', { waitUntil: 'networkidle' })
await p.waitForTimeout(5000)
for (let i = 0; i < 10; i++) { await p.mouse.wheel(0, 3000); await p.waitForTimeout(500) }
const text = await p.evaluate(() => document.body.innerText)
// Links inside the page body only, with the text around each one.
const links = await p.$$eval('main a[href], [class*=content] a[href], article a[href]', (as) =>
  as.map((a) => `${a.innerText.trim().replace(/\s+/g, ' ')} | ${a.href} | ${(a.closest('li,p,div')?.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 300)}`))
fs.writeFileSync(`${OUT}/resources.txt`, `URL: ${p.url()}\n\n${text}`)
fs.writeFileSync(`${OUT}/resources-links.txt`, [...new Set(links)].join('\n'))
await b.close()
