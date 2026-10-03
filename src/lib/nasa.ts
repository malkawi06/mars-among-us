/**
 * NASA GIBS (Global Imagery Browse Services) satellite imagery tiles for the maps. No key needed.
 */

// ---------------------------------------------------------------------------
// GIBS: Global Imagery Browse Services (map tiles, no API key)
// Find more layers in Worldview (https://worldview.earthdata.nasa.gov) or the GIBS docs:
// https://nasa-gibs.github.io/gibs-api-docs/available-visualizations/
// ---------------------------------------------------------------------------

export interface GibsLayer {
  /** GIBS layer identifier, e.g. "MODIS_Terra_CorrectedReflectance_TrueColor". */
  id: string
  title: string
  format: 'jpg' | 'png'
  /** N in the layer's GoogleMapsCompatible_LevelN tile matrix set. */
  maxNativeZoom: number
}

/** Layers checked against the GIBS EPSG:3857 endpoint. Add your own here. */
export const GIBS_LAYERS = {
  MODIS_Terra_CorrectedReflectance_TrueColor: {
    id: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    title: 'MODIS Terra true color',
    format: 'jpg',
    maxNativeZoom: 9,
  },
  VIIRS_SNPP_CorrectedReflectance_TrueColor: {
    id: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
    title: 'VIIRS SNPP true color',
    format: 'jpg',
    maxNativeZoom: 9,
  },
  MODIS_Terra_Land_Surface_Temp_Day: {
    id: 'MODIS_Terra_Land_Surface_Temp_Day',
    title: 'MODIS Terra land surface temperature (day)',
    format: 'png',
    maxNativeZoom: 7,
  },
  IMERG_Precipitation_Rate: {
    id: 'IMERG_Precipitation_Rate',
    title: 'IMERG precipitation rate',
    format: 'png',
    maxNativeZoom: 6,
  },
} as const satisfies Record<string, GibsLayer>

export type GibsLayerId = keyof typeof GIBS_LAYERS

export const DEFAULT_GIBS_LAYER: GibsLayerId = 'MODIS_Terra_CorrectedReflectance_TrueColor'

/** First day of MODIS Terra imagery. */
export const GIBS_MIN_DATE = '2000-02-24'

export const GIBS_ATTRIBUTION =
  'Imagery: <a href="https://earthdata.nasa.gov/gibs">NASA EOSDIS GIBS</a>'

export function resolveGibsLayer(layer: GibsLayerId | GibsLayer): GibsLayer {
  return typeof layer === 'string' ? GIBS_LAYERS[layer] : layer
}

/**
 * Leaflet tile URL template ({z}/{y}/{x}) for a GIBS layer on a date (YYYY-MM-DD),
 * using the Web Mercator (EPSG:3857) WMTS REST endpoint.
 */
export function gibsTileUrl(layer: GibsLayerId | GibsLayer, date: string): string {
  const { id, format, maxNativeZoom } = resolveGibsLayer(layer)
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${id}/default/${date}/GoogleMapsCompatible_Level${maxNativeZoom}/{z}/{y}/{x}.${format}`
}
