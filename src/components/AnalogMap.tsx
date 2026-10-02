import { useEffect } from 'react'
import { CircleMarker, Tooltip, useMap } from 'react-leaflet'
import type { AnalogSite } from '../data/analogs'
import { MapView } from './MapView'

interface AnalogMapProps {
  sites: AnalogSite[]
  selectedId?: string
  onSelect: (id: string) => void
  className?: string
}

/** Satellite map of analog sites; selecting one flies the map to it. */
export function AnalogMap({ sites, selectedId, onSelect, className }: AnalogMapProps) {
  const selected = sites.find((s) => s.id === selectedId)
  return (
    <MapView basemap="satellite" gibsLayer={null} center={[20, 0]} zoom={2} className={className}>
      {sites.map((s) => (
        <CircleMarker
          key={s.id}
          center={[s.lat, s.lon]}
          radius={s.id === selectedId ? 10 : 7}
          pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#e8673a', fillOpacity: 0.9 }}
          eventHandlers={{ click: () => onSelect(s.id) }}
        >
          <Tooltip>{s.name}</Tooltip>
        </CircleMarker>
      ))}
      <FlyTo site={selected} />
    </MapView>
  )
}

/** Close in for exact sites, wider for area centres. */
function FlyTo({ site }: { site?: AnalogSite }) {
  const map = useMap()
  useEffect(() => {
    if (site) map.flyTo([site.lat, site.lon], site.precision === 'site' ? 14 : 10)
  }, [map, site])
  return null
}
