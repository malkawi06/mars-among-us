/**
 * Scores how well an Earth site matches a Moon or Mars target for one analog purpose.
 *
 * Method (after Stern et al. 2025, JGR Planets, doi 10.1029/2024JE008803):
 * - the factors compared depend on the purpose;
 * - each factor scores 1 (weak), 2 (partial / unknown) or 3 (strong), all factors weigh the same;
 * - a factor with no data for the target is left out and shown as "no data";
 * - overall match = (mean score − 1) / 2, so all 3s = 100% and all 1s = 0%.
 */

export type Body = 'Moon' | 'Mars'

export interface EarthSite {
  id: string
  name: string
  country: string
  lat: number
  lon: number
  analogFor: Body
  meanTempC: number
  dailyRangeC: number
  precipMmYr: number
  elevationM: number
  /** null = not measured: the coordinates fall on a lake or the sea. */
  slopeDeg: number | null
  reliefM: number | null
  materials: string[]
  landforms: string[]
  source: string
  note?: string
}

export interface Target {
  id: string
  name: string
  body: Body
  lat: number
  lon: number
  materials: string[]
  landforms: string[]
  slopeMaxDeg?: number
  meanTempC?: number
  /** Near-surface air temperature, daily high minus low, °C. */
  dailyRangeC?: number
  precipMmYr?: number
  iceAccess: boolean
  note: string
  sources: string[]
}

export type FactorId =
  | 'slope'
  | 'rock'
  | 'landform'
  | 'meanTemp'
  | 'aridity'
  | 'ice'
  | 'relief'
  | 'dailyRange'
  | 'sunlight'
  | 'radiation'

export type Score = 1 | 2 | 3

export interface FactorResult {
  factor: FactorId
  label: string
  /** null = no data for the target, so the factor is left out of the match. */
  score: Score | null
  target: string
  earth: string
  reason: string
}

export interface Purpose {
  id: string
  label: string
  bodies: Body[]
  factors: FactorId[]
  /**
   * Landing-slope rule for Moon targets: Earth sites this steep or steeper fail. The Artemis Human
   * Landing System requires landing slopes of 0–8° (NASA 2019, quoted in JGR Planets 2025,
   * doi 10.1029/2025JE009434). There is no equivalent sourced rule for Mars, so it is not applied there.
   */
  maxSlopeDeg?: number
}

export const PURPOSES: Purpose[] = [
  {
    id: 'rover',
    label: 'Rover testing',
    bodies: ['Moon', 'Mars'],
    factors: ['slope', 'rock', 'relief', 'dailyRange'],
  },
  {
    id: 'base',
    label: 'Base / habitat',
    bodies: ['Moon', 'Mars'],
    factors: ['dailyRange', 'meanTemp', 'slope', 'rock', 'sunlight'],
    maxSlopeDeg: 8,
  },
  {
    id: 'isru',
    label: 'Using local resources',
    bodies: ['Moon', 'Mars'],
    factors: ['rock', 'ice', 'meanTemp'],
  },
  {
    id: 'life',
    label: 'Search for life',
    bodies: ['Mars'],
    factors: ['aridity', 'rock', 'meanTemp', 'radiation'],
  },
  {
    id: 'training',
    label: 'Astronaut training',
    bodies: ['Moon', 'Mars'],
    factors: ['rock', 'landform', 'relief'],
  },
]

const LABELS: Record<FactorId, string> = {
  slope: 'Slope',
  rock: 'Rock / surface type',
  landform: 'Landform',
  meanTemp: 'Mean temperature',
  aridity: 'Dryness',
  ice: 'Water ice',
  relief: 'Local relief',
  dailyRange: 'Day–night temperature swing',
  sunlight: 'Sunlight',
  radiation: 'Radiation / UV',
}

/** Materials in the same group are a partial match (e.g. clay vs sandstone). */
const MATERIAL_GROUP: Record<string, string> = {
  sand: 'sedimentary',
  sulfate: 'sedimentary',
  salt: 'sedimentary',
  clay: 'sedimentary',
  carbonate: 'sedimentary',
  sandstone: 'sedimentary',
  basalt: 'igneous',
  anorthosite: 'igneous',
  ice: 'ice',
}

const list = (items: string[]) => items.join(', ') || 'none recorded'
const result = (
  factor: FactorId,
  score: Score | null,
  target: string,
  earth: string,
  reason: string,
) => ({
  factor,
  label: LABELS[factor],
  score,
  target,
  earth,
  reason,
})
/** The target value shown for a factor left out because the target has no sourced value. */
export const NO_DATA = 'no data'
const noData = (factor: FactorId, earth = '—') =>
  result(factor, null, NO_DATA, earth, 'Left out: no sourced value for the target yet.')

export function scoreFactor(factor: FactorId, target: Target, site: EarthSite): FactorResult {
  switch (factor) {
    case 'slope': {
      const earth = site.slopeDeg === null ? 'not measured' : `${site.slopeDeg.toFixed(1)}°`
      if (target.slopeMaxDeg === undefined) return noData(factor, earth)
      if (site.slopeDeg === null)
        return result(
          factor,
          2,
          `under ${target.slopeMaxDeg}°`,
          earth,
          'Not measured: the coordinates fall on water. Neutral.',
        )
      const score: Score = site.slopeDeg <= target.slopeMaxDeg ? 3 : site.slopeDeg < 8 ? 2 : 1
      const reason =
        score === 3
          ? `As flat as the target (under ${target.slopeMaxDeg}°).`
          : score === 2
            ? 'Steeper than the target, but still under the 8° landing limit.'
            : 'Steeper than the 8° landing limit.'
      return result(factor, score, `under ${target.slopeMaxDeg}°`, earth, reason)
    }
    case 'rock': {
      const earth = list(site.materials)
      if (!target.materials.length) return noData(factor, earth)
      if (!site.materials.length)
        return result(
          factor,
          2,
          list(target.materials),
          earth,
          'Rock type not recorded for this site: neutral.',
        )
      const shared = site.materials.filter((m) => target.materials.includes(m))
      if (shared.length)
        return result(factor, 3, list(target.materials), earth, `Same material: ${list(shared)}.`)
      const groups = new Set(target.materials.map((m) => MATERIAL_GROUP[m]))
      const related = site.materials.some((m) => groups.has(MATERIAL_GROUP[m]))
      return related
        ? result(
            factor,
            2,
            list(target.materials),
            earth,
            'Different material of the same kind (e.g. both sedimentary).',
          )
        : result(factor, 1, list(target.materials), earth, 'Different kind of material.')
    }
    case 'landform': {
      const earth = list(site.landforms)
      if (!target.landforms.length) return noData(factor, earth)
      const shared = site.landforms.filter((l) => target.landforms.includes(l))
      return shared.length
        ? result(factor, 3, list(target.landforms), earth, `Same landform: ${list(shared)}.`)
        : result(factor, 1, list(target.landforms), earth, 'No matching landform.')
    }
    case 'meanTemp': {
      const earth = `${site.meanTempC.toFixed(1)} °C`
      if (target.meanTempC === undefined) return noData(factor, earth)
      const diff = Math.abs(site.meanTempC - target.meanTempC)
      const score: Score = diff <= 20 ? 3 : diff <= 45 ? 2 : 1
      return result(factor, score, `${target.meanTempC} °C`, earth, `${Math.round(diff)} °C apart.`)
    }
    case 'aridity': {
      const earth = `${site.precipMmYr} mm/yr`
      if (target.precipMmYr === undefined) return noData(factor, earth)
      const score: Score = site.precipMmYr <= 25 ? 3 : site.precipMmYr <= 250 ? 2 : 1
      const reason =
        score === 3
          ? 'Hyper-arid (25 mm/yr or less).'
          : score === 2
            ? 'Desert (250 mm/yr or less).'
            : 'Wetter than a desert.'
      return result(factor, score, 'no rain', earth, reason)
    }
    case 'ice': {
      const has = site.materials.includes('ice')
      if (!target.iceAccess)
        return result(
          factor,
          null,
          'no ice reachable',
          has ? 'ice' : 'no ice',
          'The target has no reachable ice, so this is left out.',
        )
      return has
        ? result(factor, 3, 'ice reachable', 'ice', 'Both have ground ice.')
        : result(factor, 1, 'ice reachable', 'no ice', 'No ground ice at this site.')
    }
    case 'relief':
      return noData(factor, site.reliefM === null ? 'not measured' : `${site.reliefM} m`)
    case 'dailyRange': {
      const earth = `${site.dailyRangeC.toFixed(1)} °C`
      if (target.dailyRangeC === undefined) return noData(factor, earth)
      const diff = Math.abs(site.dailyRangeC - target.dailyRangeC)
      const score: Score = diff <= 10 ? 3 : diff <= 30 ? 2 : 1
      return result(
        factor,
        score,
        `${target.dailyRangeC} °C`,
        earth,
        `${Math.round(diff)} °C apart.`,
      )
    }
    case 'sunlight':
    case 'radiation':
      return noData(factor)
  }
}

export interface Match {
  site: EarthSite
  factors: FactorResult[]
  /** 0–100, or null when no factor could be scored. */
  percent: number | null
  scored: number
  /** Fails the purpose's landing-slope rule. */
  fails: boolean
}

export function compare(target: Target, purpose: Purpose, site: EarthSite): Match {
  const factors = purpose.factors
    .filter((f) => f !== 'sunlight' || target.body === 'Moon')
    .map((f) => scoreFactor(f, target, site))
  const scores = factors.flatMap((f) => (f.score === null ? [] : [f.score]))
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  return {
    site,
    factors,
    percent: scores.length ? Math.round(((mean - 1) / 2) * 100) : null,
    scored: scores.length,
    fails:
      purpose.maxSlopeDeg !== undefined &&
      target.body === 'Moon' &&
      site.slopeDeg !== null &&
      site.slopeDeg >= purpose.maxSlopeDeg,
  }
}

/** Best matches first; sites failing the slope rule go last. */
export function rank(target: Target, purpose: Purpose, sites: EarthSite[]): Match[] {
  return sites
    .map((site) => compare(target, purpose, site))
    .sort((a, b) => Number(a.fails) - Number(b.fails) || (b.percent ?? -1) - (a.percent ?? -1))
}
