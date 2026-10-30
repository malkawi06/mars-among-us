// Temporary: find our challenge on the 2026 challenge list and save every tab as text and links.
import { chromium } from 'playwright'
import fs from 'node:fs'
const OUT = 'challenge-snapshot'
fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })
const log = (m) => fs.appendFileSync(`${OUT}/log.txt`, m + '\n')
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
p.setDefaultTimeout(60000)
const dump = async (name) => {
  const text = await p.evaluate(() => document.body.innerText)
  const links = await p.$$eval('a[href]', (as) => as.map((a) => `${a.innerText.trim().replace(/\s+/g, ' ')} | ${a.href}`))
  fs.writeFileSync(`${OUT}/${name}.txt`, `URL: ${p.url()}\n\n${text}`)
  fs.writeFileSync(`${OUT}/${name}-links.txt`, [...new Set(links)].join('\n'))
}
// 1. The list of 2026 challenges.
let challenge
for (const list of ['https://www.spaceappschallenge.org/2026/challenges/', 'https://www.spaceappschallenge.org/challenges/']) {
  try {
    await p.goto(list, { waitUntil: 'networkidle' })
    await p.waitForTimeout(4000)
    for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 4000); await p.waitForTimeout(700) }
    await dump(`list-${list.includes('2026') ? '2026' : 'current'}`)
    const links = await p.$$eval('a[href]', (as) => as.map((a) => ({ t: a.innerText.trim(), h: a.href })))
    const hit = links.find((l) => /analog/i.test(l.t + l.h) && /moon|mars|base/i.test(l.t + l.h))
    log(`${list}: ${links.length} links, match: ${hit ? hit.h : 'none'}`)
    if (hit && !challenge) challenge = hit.h
  } catch (e) { log(`${list}: ${e.message}`) }
}
// 2. The challenge page and its tabs.
if (challenge) {
  await p.goto(challenge, { waitUntil: 'networkidle' })
  await p.waitForTimeout(4000)
  await dump('challenge')
  const tabs = await p.$$eval('button, [role=tab], a', (els) => els.map((e) => e.innerText.trim()).filter((t) => /^(resources|challenge|summary|background|objectives|potential considerations|considerations|faq|details|teams)$/i.test(t)))
  log(`tabs: ${JSON.stringify([...new Set(tabs)])}`)
  for (const t of [...new Set(tabs)]) {
    try { await p.getByText(t, { exact: true }).first().click(); await p.waitForTimeout(3000); await dump(`tab-${t.toLowerCase().replace(/\W+/g, '-')}`) } catch (e) { log(`${t}: ${e.message}`) }
  }
}
await b.close()
