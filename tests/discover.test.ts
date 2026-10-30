import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  cellAt,
  distanceKm,
  similarity,
  topRegions,
  traitScores,
  type Cells,
} from '../src/lib/discover.ts'

// Three cells: two hot dry deserts on sandstone and one cold wet place on ice.
const cells: Cells = {
  cellDeg: 0.5,
  row: [100, 100, 20],
  col: [400, 500, 100],
  meanTempC10: [200, 210, -150],
  dailyRangeC10: [150, 140, 50],
  precipMmYr: [40, 50, 900],
  windMs10: [40, 40, 70],
  elevationM: [900, 800, 300],
  slopeDeg10: [20, 20, 10],
  reliefM: [600, 500, 100],
  rock: ['ss', 'ss', 'ig'],
}

test('a cell is 100% like itself', () => {
  assert.equal(similarity(cells, 0, 0), 100)
})

test('a similar desert scores far above a cold wet place', () => {
  assert.ok(similarity(cells, 0, 1) > 85)
  assert.ok(similarity(cells, 0, 2) < 20)
})

test('rock: same class 1, same kind 0.5, different kind 0', () => {
  const c = { ...cells, rock: ['ss', 'sc', 'vb'] }
  assert.equal(traitScores(c, 0, 0).rock, 1)
  assert.equal(traitScores(c, 0, 1).rock, 0.5)
  assert.equal(traitScores(c, 0, 2).rock, 0)
})

test('missing values are left out, not counted as 0', () => {
  const c = { ...cells, elevationM: [900, null, 300] }
  assert.equal(traitScores(c, 0, 1).elevation, null)
  assert.ok(similarity(c, 0, 1) > 85)
})

test('top regions skip the seed and stay apart', () => {
  const scores = new Float32Array([100, 90, 10])
  const picks = topRegions(cells, scores, 0, 5, 400)
  assert.ok(!picks.includes(0))
  assert.deepEqual(picks, [1, 2])
})

test('cellAt finds the cell containing a point', () => {
  assert.equal(cellAt(cells, 39.75, 20.25), 0)
  assert.equal(cellAt(cells, 0, 0), -1)
  assert.ok(Math.abs(distanceKm(0, 0, 0, 1) - 111.2) < 0.5)
})
