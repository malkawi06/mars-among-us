import 'leaflet/dist/leaflet.css'
import type { LatLngExpression } from 'leaflet'
import type { ReactNode } from 'react'
import { LayersControl, MapContainer, ScaleControl, TileLayer } from 'react-leaflet'
import { daysAgo } from '../lib/date'
import {
  GIBS_ATTRIBUTION,
  gibsTileUrl,
  resolveGibsLayer,
  type GibsLayer,
  type GibsLayerId,
} from '../lib/nasa'

interface MapViewProps {
  /** Initial center and zoom. Leaflet reads them once on mount. */
  center?: LatLngExpression
  zoom?: number
  /** NASA GIBS layer drawn over the basemap. Pass null for the basemap only. */
  gibsLayer?: GibsLayerId | GibsLayer | null
  /** Imagery date, YYYY-MM-DD. Defaults to yesterday (UTC), the latest full day. */
  gibsDate?: string
  /** 0 to 1. */
  gibsOpacity?: number
  /** Give the map a height here (e.g. "h-96"); Leaflet needs one. */
  className?: string
  /** Extra react-leaflet layers: Marker, CircleMarker, GeoJSON, ... */
  children?: ReactNode
}

/**
 * Leaflet map with an OpenStreetMap basemap and an optional NASA GIBS imagery overlay.
 * Both can be toggled from the layers control in the top-right corner.
 */
export function MapView({
  center = [20, 0],
  zoom = 2,
  gibsLayer = 'MODIS_Terra_CorrectedReflectance_TrueColor',
  gibsDate = daysAgo(1),
  gibsOpacity = 1,
  className = 'h-96',
  children,
}: MapViewProps) {
  const layer = gibsLayer === null ? null : resolveGibsLayer(gibsLayer)
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={1}
      worldCopyJump
      className={`isolate w-full overflow-hidden rounded-xl border border-border ${className}`}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            className="basemap-osm"
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
        </LayersControl.BaseLayer>
        {layer && (
          // Keyed by layer so the control's label updates when the layer changes.
          <LayersControl.Overlay key={layer.id} checked name={`NASA GIBS: ${layer.title}`}>
            <TileLayer
              url={gibsTileUrl(layer, gibsDate)}
              attribution={GIBS_ATTRIBUTION}
              maxNativeZoom={layer.maxNativeZoom}
              maxZoom={19}
              opacity={gibsOpacity}
            />
          </LayersControl.Overlay>
        )}
      </LayersControl>
      <ScaleControl position="bottomleft" />
      {children}
    </MapContainer>
  )
}
