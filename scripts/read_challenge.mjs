// Temporary: save the participant FAQ and rules pages as text.
import { chromium } from 'playwright'
import fs from 'node:fs'
const OUT = 'challenge-snapshot'
fs.mkdirSync(OUT, { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
p.setDefaultTimeout(60000)
for (const [name, url] of [
  ['faq', 'https://www.spaceappschallenge.org/resources/participant-faqs/'],
  ['legal', 'https://www.spaceappschallenge.org/legal/'],
  ['resources-hub', 'https://www.spaceappschallenge.org/resources/'],
]) {
  try {
    await p.goto(url, { waitUntil: 'networkidle' })
    await p.waitForTimeout(4000)
    // Open every collapsed answer.
    for (const el of await p.$$('button[aria-expanded="false"], summary')) { try { await el.click({ timeout: 2000 }) } catch {} }
    await p.waitForTimeout(1500)
    const text = await p.evaluate(() => document.body.innerText)
    const links = await p.$$eval('a[href]', (as) => as.map((a) => `${a.innerText.trim().replace(/\s+/g, ' ')} | ${a.href}`))
    fs.writeFileSync(`${OUT}/${name}.txt`, `URL: ${p.url()}\n\n${text}`)
    fs.writeFileSync(`${OUT}/${name}-links.txt`, [...new Set(links)].join('\n'))
  } catch (e) { fs.appendFileSync(`${OUT}/log.txt`, `${name}: ${e.message}\n`) }
}
await b.close()
