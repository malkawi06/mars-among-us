import 'leaflet/dist/leaflet.css'
import type { LatLngExpression } from 'leaflet'
import type { ReactNode } from 'react'
import { LayersControl, MapContainer, ScaleControl, TileLayer } from 'react-leaflet'

interface MapViewProps {
  /** Initial center and zoom. Leaflet reads them once on mount. */
  center?: LatLngExpression
  zoom?: number
  /** Initial base layer: OpenStreetMap streets, or Sentinel-2 cloud-free satellite imagery (10 m). */
  basemap?: 'streets' | 'satellite'
  /** Give the map a height here (e.g. "h-96"); Leaflet needs one. */
  className?: string
  /** Extra react-leaflet layers: Marker, CircleMarker, GeoJSON, ... */
  children?: ReactNode
}

/**
 * Leaflet map with an OpenStreetMap and a Sentinel-2 satellite basemap, switchable from the layers
 * control in the top-right corner.
 */
export function MapView({
  center = [20, 0],
  zoom = 2,
  basemap = 'streets',
  className = 'h-96',
  children,
}: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={1}
      worldCopyJump
      className={`isolate w-full overflow-hidden rounded-xl border border-border ${className}`}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked={basemap === 'streets'} name="OpenStreetMap">
          <TileLayer
            className="basemap-osm"
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked={basemap === 'satellite'} name="Sentinel-2 satellite">
          <TileLayer
            url="https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg"
            attribution='<a href="https://s2maps.eu">Sentinel-2 cloudless</a> by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2024)'
            maxNativeZoom={14}
            maxZoom={19}
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      <ScaleControl position="bottomleft" />
      {children}
    </MapContainer>
  )
}
