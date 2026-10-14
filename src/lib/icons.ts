import {
  CarFront,
  GitCompareArrows,
  House,
  Users,
  DropletOff,
  Earth,
  Footprints,
  Gem,
  Layers,
  ListChecks,
  Microscope,
  Mountain,
  Pickaxe,
  Radiation,
  Satellite,
  ScanSearch,
  Snowflake,
  Sun,
  Tent,
  Thermometer,
  ThermometerSun,
  TrendingUp,
  Upload,
  type LucideIcon,
} from 'lucide-react'
import type { FactorId } from './similarity'

/** One icon per page, keyed by route (phone tab bar). */
export const PAGE_ICONS: Record<string, LucideIcon> = {
  '/': House,
  '/analyze': ScanSearch,
  '/compare': GitCompareArrows,
  '/analogs': Earth,
  '/about': Users,
}

/** One icon per purpose, keyed by purpose id. */
export const PURPOSE_ICONS: Record<string, LucideIcon> = {
  rover: CarFront,
  base: Tent,
  isru: Pickaxe,
  life: Microscope,
  training: Footprints,
}

export const FACTOR_ICONS: Record<FactorId, LucideIcon> = {
  slope: TrendingUp,
  rock: Gem,
  landform: Mountain,
  meanTemp: Thermometer,
  aridity: DropletOff,
  ice: Snowflake,
  relief: Layers,
  dailyRange: ThermometerSun,
  sunlight: Sun,
  radiation: Radiation,
}

/** Icons for the three "how it works" steps on Analyze, in order. */
export const ANALYZE_STEP_ICONS = [Upload, ScanSearch, Earth]
export { ListChecks, Satellite }
