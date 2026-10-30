import { useEffect, useMemo } from 'react'
import { CircleMarker, ImageOverlay, Tooltip, useMap } from 'react-leaflet'
import { cellLat, cellLon, type Cells } from '../lib/discover'
import { MapView } from './MapView'

/** Web Mercator stops here; the overlay covers the same band as the map. */
const MAX_LAT = 85.0511
const SIZE = 1024
/** Below this similarity a patch is left clear, so the map shows only the promising ones. */
export const SHOW_FROM = 60

/**
 * Paints every grid cell's similarity (0–100) onto a Web Mercator image, so Leaflet can lay it over
 * the satellite map without distortion. Clear below SHOW_FROM, then dark red to bright yellow.
 */
function paint(cells: Cells, scores: Float32Array): string {
  const grid = new Float32Array(360 * 720).fill(-1)
  for (let i = 0; i < scores.length; i++) grid[cells.row[i] * 720 + cells.col[i]] = scores[i]
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  const image = ctx.createImageData(SIZE, SIZE)
  const yMax = Math.log(Math.tan(Math.PI / 4 + (MAX_LAT * Math.PI) / 360))
  for (let y = 0; y < SIZE; y++) {
    const lat = (Math.atan(Math.sinh(yMax * (1 - (2 * (y + 0.5)) / SIZE))) * 180) / Math.PI
    const row = Math.min(359, Math.max(0, Math.floor((90 - lat) / 0.5)))
    for (let x = 0; x < SIZE; x++) {
      const col = Math.min(719, Math.floor(((x + 0.5) / SIZE) * 720))
      const s = grid[row * 720 + col]
      if (s < SHOW_FROM) continue
      const t = (s - SHOW_FROM) / (100 - SHOW_FROM)
      const o = (y * SIZE + x) * 4
      image.data[o] = 255
      image.data[o + 1] = Math.round(40 + 215 * t)
      image.data[o + 2] = Math.round(30 * t)
      image.data[o + 3] = Math.round(110 + 120 * t)
    }
  }
  ctx.putImageData(image, 0, 0)
  return canvas.toDataURL()
}

export function DiscoverMap({
  cells,
  scores,
  seed,
  picks,
  selected,
  known,
  onSelect,
  className,
}: {
  cells: Cells
  scores: Float32Array
  seed: number
  picks: number[]
  selected?: number
  known: Set<number>
  onSelect: (cell: number) => void
  className?: string
}) {
  const url = useMemo(() => paint(cells, scores), [cells, scores])
  return (
    <MapView basemap="satellite" center={[20, 0]} zoom={2} className={className}>
      <ImageOverlay
        url={url}
        bounds={[
          [-MAX_LAT, -180],
          [MAX_LAT, 180],
        ]}
        opacity={0.85}
      />
      <CircleMarker
        center={[cellLat(cells, seed), cellLon(cells, seed)]}
        radius={9}
        pathOptions={{ color: '#000', weight: 2, fillColor: '#ffffff', fillOpacity: 1 }}
      >
        <Tooltip permanent direction="top" offset={[0, -8]}>
          Known site
        </Tooltip>
      </CircleMarker>
      {picks.map((i, n) => (
        <CircleMarker
          key={i}
          center={[cellLat(cells, i), cellLon(cells, i)]}
          radius={i === selected ? 11 : 8}
          pathOptions={{
            color: '#fff',
            weight: 2,
            fillColor: known.has(i) ? '#8e8e95' : '#ff8a4c',
            fillOpacity: 1,
          }}
          eventHandlers={{ click: () => onSelect(i) }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            #{n + 1} · {Math.round(scores[i])}%
          </Tooltip>
        </CircleMarker>
      ))}
      <FlyTo cells={cells} cell={selected} />
    </MapView>
  )
}

function FlyTo({ cells, cell }: { cells: Cells; cell?: number }) {
  const map = useMap()
  useEffect(() => {
    if (cell !== undefined) map.flyTo([cellLat(cells, cell), cellLon(cells, cell)], 8)
  }, [map, cells, cell])
  return null
}
