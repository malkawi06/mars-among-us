import {
  BookOpenCheck,
  CarFront,
  Database,
  DropletOff,
  Earth,
  Footprints,
  Gem,
  GitCompareArrows,
  House,
  Layers,
  ListChecks,
  Microscope,
  Mountain,
  Pickaxe,
  Radiation,
  Satellite,
  Scale,
  ScanSearch,
  Snowflake,
  Sun,
  Target,
  Tent,
  Thermometer,
  ThermometerSun,
  TrendingUp,
  Upload,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { FactorId } from './similarity'

/** One icon per page, keyed by route. */
export const PAGE_ICONS: Record<string, LucideIcon> = {
  '/': House,
  '/compare': GitCompareArrows,
  '/analogs': Earth,
  '/analyze': ScanSearch,
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

/** Icons for the three "how it works" steps on Home and on Analyze, in order. */
export const HOME_STEP_ICONS = [Target, ListChecks, Earth]
export const ANALYZE_STEP_ICONS = [Upload, ScanSearch, Earth]
export const PROMISE_ICONS = [BookOpenCheck, Satellite, Scale]
export { Database, ListChecks, Satellite }
