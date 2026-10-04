/**
 * Tests for the Compare scoring (src/lib/similarity.ts) and checks on the sourced data files.
 * Run with `npm test` (Node's built-in test runner; no extra dependencies).
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ANALOG_SITES, LANDFORM_NAMES, analogsFor } from '../src/data/analogs.ts'
import { EARTH_SITES, TARGETS } from '../src/data/compare.ts'
import {
  NO_DATA,
  PURPOSES,
  compare,
  rank,
  scoreFactor,
  type EarthSite,
  type Purpose,
  type Target,
} from '../src/lib/similarity.ts'

const site = (overrides: Partial<EarthSite> = {}): EarthSite => ({
  id: 'test-site',
  name: 'Test site',
  country: 'Nowhere',
  lat: 0,
  lon: 0,
  analogFor: 'Mars',
  meanTempC: 10,
  dailyRangeC: 15,
  precipMmYr: 100,
  elevationM: 0,
  slopeDeg: 2,
  reliefM: 20,
  materials: ['basalt'],
  landforms: ['impact'],
  source: 'https://example.org',
  ...overrides,
})

const target = (overrides: Partial<Target> = {}): Target => ({
  id: 'test-target',
  name: 'Test target',
  body: 'Moon',
  lat: -86,
  lon: 0,
  materials: ['anorthosite'],
  landforms: ['impact'],
  iceAccess: false,
  note: '',
  sources: ['https://example.org'],
  ...overrides,
})

const purpose = (id: string): Purpose => PURPOSES.find((p) => p.id === id)!

describe('scoreFactor', () => {
  it('scores slope against the target limit and the 8° landing limit', () => {
    const t = target({ slopeMaxDeg: 5 })
    assert.equal(scoreFactor('slope', t, site({ slopeDeg: 5 })).score, 3)
    assert.equal(scoreFactor('slope', t, site({ slopeDeg: 7.9 })).score, 2)
    assert.equal(scoreFactor('slope', t, site({ slopeDeg: 8 })).score, 1)
  })

  it('treats an unmeasured Earth slope as neutral, and a missing target slope as no data', () => {
    assert.equal(
      scoreFactor('slope', target({ slopeMaxDeg: 5 }), site({ slopeDeg: null })).score,
      2,
    )
    const missing = scoreFactor('slope', target(), site())
    assert.equal(missing.score, null)
    assert.equal(missing.target, NO_DATA)
  })

  it('scores rock: same material, same kind, different kind, unknown', () => {
    const t = target({ materials: ['clay'] })
    assert.equal(scoreFactor('rock', t, site({ materials: ['clay', 'sand'] })).score, 3)
    assert.equal(scoreFactor('rock', t, site({ materials: ['sandstone'] })).score, 2)
    assert.equal(scoreFactor('rock', t, site({ materials: ['basalt'] })).score, 1)
    assert.equal(scoreFactor('rock', t, site({ materials: [] })).score, 2)
  })

  it('scores the day–night swing by its difference', () => {
    const t = target({ dailyRangeC: 70 })
    assert.equal(scoreFactor('dailyRange', t, site({ dailyRangeC: 60 })).score, 3)
    assert.equal(scoreFactor('dailyRange', t, site({ dailyRangeC: 40 })).score, 2)
    assert.equal(scoreFactor('dailyRange', t, site({ dailyRangeC: 39 })).score, 1)
    assert.equal(scoreFactor('dailyRange', target(), site()).target, NO_DATA)
  })

  it('leaves ice out with its own reason when the target has no reachable ice', () => {
    const result = scoreFactor('ice', target({ iceAccess: false }), site({ materials: ['ice'] }))
    assert.equal(result.score, null)
    assert.notEqual(result.target, NO_DATA)
    assert.equal(
      scoreFactor('ice', target({ iceAccess: true }), site({ materials: ['ice'] })).score,
      3,
    )
    assert.equal(scoreFactor('ice', target({ iceAccess: true }), site()).score, 1)
  })

  it('scores dryness by Earth rainfall', () => {
    const t = target({ body: 'Mars', precipMmYr: 0 })
    assert.equal(scoreFactor('aridity', t, site({ precipMmYr: 25 })).score, 3)
    assert.equal(scoreFactor('aridity', t, site({ precipMmYr: 250 })).score, 2)
    assert.equal(scoreFactor('aridity', t, site({ precipMmYr: 251 })).score, 1)
  })
})

describe('compare', () => {
  it('maps the mean score to 0–100% and ignores factors without data', () => {
    const t = target({ slopeMaxDeg: 5 })
    const best = compare(t, purpose('rover'), site({ slopeDeg: 1, materials: ['anorthosite'] }))
    assert.equal(best.scored, 2)
    assert.equal(best.percent, 100)
    const worst = compare(t, purpose('rover'), site({ slopeDeg: 20, materials: ['ice'] }))
    assert.equal(worst.percent, 0)
  })

  it('gives no percentage when nothing can be scored', () => {
    const t = target({ materials: [], landforms: [] })
    assert.equal(compare(t, purpose('training'), site()).percent, null)
  })

  it('applies the 8° landing rule to Moon targets only', () => {
    const steep = site({ slopeDeg: 12 })
    assert.equal(compare(target({ body: 'Moon' }), purpose('base'), steep).fails, true)
    assert.equal(compare(target({ body: 'Mars' }), purpose('base'), steep).fails, false)
    assert.equal(compare(target({ body: 'Moon' }), purpose('rover'), steep).fails, false)
    assert.equal(compare(target(), purpose('base'), site({ slopeDeg: null })).fails, false)
  })
})

describe('rank', () => {
  it('sorts by percentage and puts sites failing the landing rule last', () => {
    const t = target({ slopeMaxDeg: 5 })
    const ranked = rank(t, purpose('base'), [
      site({ id: 'steep-match', slopeDeg: 9, materials: ['anorthosite'] }),
      site({ id: 'flat-other', slopeDeg: 1, materials: ['ice'] }),
      site({ id: 'flat-match', slopeDeg: 1, materials: ['anorthosite'] }),
    ])
    assert.deepEqual(
      ranked.map((m) => m.site.id),
      ['flat-match', 'flat-other', 'steep-match'],
    )
  })
})

describe('data files', () => {
  const unique = (ids: string[]) => new Set(ids).size === ids.length
  const isUrl = (url: string) => /^https:\/\/\S+$/.test(url)
  const validLatLon = (lat: number, lon: number) =>
    lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180

  it('Compare: unique ids, valid coordinates and a source for every site and target', () => {
    assert.ok(unique(EARTH_SITES.map((s) => s.id)))
    assert.ok(unique(TARGETS.map((t) => t.id)))
    for (const s of EARTH_SITES) {
      assert.ok(validLatLon(s.lat, s.lon), s.id)
      assert.ok(isUrl(s.source), s.id)
    }
    for (const t of TARGETS) {
      assert.ok(validLatLon(t.lat, t.lon), t.id)
      assert.ok(t.sources.length > 0 && t.sources.every(isUrl), t.id)
    }
  })

  it('Compare: every purpose has a target body that offers it', () => {
    for (const p of PURPOSES)
      assert.ok(
        TARGETS.some((t) => p.bodies.includes(t.body)),
        p.id,
      )
  })

  it('Earth Analogs: unique ids, valid coordinates, known landforms and sources', () => {
    assert.ok(unique(ANALOG_SITES.map((s) => s.id)))
    for (const s of ANALOG_SITES) {
      assert.ok(validLatLon(s.lat, s.lon), s.id)
      assert.ok(s.sources.length > 0 && s.sources.every((src) => isUrl(src.url)), s.id)
      for (const code of Object.keys(s.landforms))
        assert.ok(Object.hasOwn(LANDFORM_NAMES, code), code)
    }
  })

  it('Earth Analogs: every landform has at least one site', () => {
    for (const code of Object.keys(LANDFORM_NAMES) as (keyof typeof LANDFORM_NAMES)[])
      assert.ok(analogsFor(code).length > 0, code)
  })
})
