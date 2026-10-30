// Temporary: save the challenge page (every tab) as text and links, for review.
import { chromium } from 'playwright'
import fs from 'node:fs'
const URL = 'https://www.spaceappschallenge.org/2026/challenges/identify-earth-locations-that-analog-the-permanent-moon-base-locations-and-mars/'
const OUT = 'challenge-snapshot'
fs.mkdirSync(OUT, { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
p.setDefaultTimeout(60000)
await p.goto(URL, { waitUntil: 'networkidle' })
await p.waitForTimeout(4000)
const dump = async (name) => {
  const text = await p.evaluate(() => document.body.innerText)
  const links = await p.$$eval('a[href]', (as) => as.map((a) => `${a.innerText.trim().replace(/\s+/g, ' ')} | ${a.href}`))
  fs.writeFileSync(`${OUT}/${name}.txt`, text)
  fs.writeFileSync(`${OUT}/${name}-links.txt`, [...new Set(links)].join('\n'))
  await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })
}
await dump('main')
// Every tab-like control on the page (Challenge, Resources, ...).
const tabs = await p.$$eval('button, [role=tab], a', (els) => els.map((e) => e.innerText.trim()).filter((t) => /^(resources|challenge|summary|background|objectives|considerations|faq|details)$/i.test(t)))
for (const t of [...new Set(tabs)]) {
  try {
    await p.getByText(t, { exact: true }).first().click()
    await p.waitForTimeout(2500)
    await dump(`tab-${t.toLowerCase()}`)
  } catch (e) { fs.appendFileSync(`${OUT}/errors.txt`, `${t}: ${e.message}\n`) }
}
// Also try a direct resources URL.
for (const suffix of ['resources/', '#resources']) {
  try { await p.goto(URL + suffix, { waitUntil: 'networkidle' }); await p.waitForTimeout(3000); await dump(`url-${suffix.replace(/\W/g, '')}`) } catch (e) { fs.appendFileSync(`${OUT}/errors.txt`, `${suffix}: ${e.message}\n`) }
}
await b.close()
