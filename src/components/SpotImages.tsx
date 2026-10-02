import { CLEAR, percent, strength, type Spot } from '../lib/earthScan'

export interface PanelImage {
  src: string
  caption: string
  /** Pixel size of the (square) source image; needed when spots are drawn. */
  size?: number
  spots?: Spot[]
  /** Border colour token: earth blue for the image being matched, none for the rest. */
  highlight?: boolean
}

/**
 * Two orbital images side by side with numbered boxes on the matching areas, then each boxed area
 * enlarged next to the left image so the likeness can be checked by eye.
 */
export function SpotImages({
  left,
  right,
  landformName,
  note,
}: {
  left: PanelImage
  right: PanelImage
  landformName: string
  note?: string
}) {
  const crops = right.spots && right.size ? right.spots : []
  const leftCrop = left.spots?.[0] && left.size ? left.spots[0] : undefined
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Panel image={left} />
        <Panel image={right} />
      </div>
      {crops.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold">Side by side, enlarged</h3>
          <ul className="mt-2 grid grid-cols-4 gap-2">
            <li>
              {leftCrop ? (
                <div
                  role="img"
                  aria-label="Strongest area of the left image, enlarged"
                  className="aspect-square w-full rounded-lg border-2 border-earth"
                  style={cropStyle(left.src, leftCrop, left.size!)}
                />
              ) : (
                <img
                  src={left.src}
                  alt=""
                  className="aspect-square w-full rounded-lg border-2 border-earth object-cover"
                />
              )}
              <p className="mt-1 text-xs text-fg-2">{left.caption.split(':')[0]}</p>
            </li>
            {crops.map((spot, i) => (
              <li key={`${spot.x}-${spot.y}`}>
                <div
                  role="img"
                  aria-label={`Area ${i + 1}, enlarged`}
                  className={`aspect-square w-full rounded-lg border-2 ${spot.probability >= CLEAR ? 'border-accent' : 'border-dashed border-muted'}`}
                  style={cropStyle(right.src, spot, right.size!)}
                />
                <p className="mt-1 text-xs text-fg-2">
                  Area {i + 1}: {percent(spot.probability)} {landformName} (
                  {strength(spot.probability)})
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {note && <p className="text-xs text-muted">{note}</p>}
    </div>
  )
}

function Panel({ image }: { image: PanelImage }) {
  return (
    <figure className="min-w-0">
      <div
        className={`relative overflow-hidden rounded-xl border-2 ${image.highlight ? 'border-earth' : 'border-border'}`}
      >
        <img src={image.src} alt={image.caption} className="aspect-square w-full object-cover" />
        {image.size &&
          image.spots?.map((spot, i) => (
            <SpotBox
              key={`${spot.x}-${spot.y}`}
              spot={spot}
              number={i + 1}
              imageSize={image.size!}
            />
          ))}
      </div>
      <figcaption className="mt-2 text-sm font-medium">{image.caption}</figcaption>
    </figure>
  )
}

function SpotBox({ spot, number, imageSize }: { spot: Spot; number: number; imageSize: number }) {
  const clear = spot.probability >= CLEAR
  return (
    <span
      className={`absolute border-2 shadow-[0_0_0_1px_rgba(0,0,0,0.6)] ${clear ? 'border-accent' : 'border-dashed border-white/70'}`}
      style={{
        left: `${(spot.x / imageSize) * 100}%`,
        top: `${(spot.y / imageSize) * 100}%`,
        width: `${(spot.size / imageSize) * 100}%`,
        height: `${(spot.size / imageSize) * 100}%`,
      }}
    >
      <span
        className={`absolute -top-px -left-px px-1.5 text-xs font-semibold ${clear ? 'bg-accent text-accent-fg' : 'bg-black/70 text-white'}`}
      >
        {number} · {percent(spot.probability)}
      </span>
    </span>
  )
}

/** Shows one square of an image, scaled to fill the element. */
function cropStyle(url: string, spot: Spot, imageSize: number) {
  const range = imageSize - spot.size
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: `${(imageSize / spot.size) * 100}%`,
    backgroundPosition: `${range ? (spot.x / range) * 100 : 0}% ${range ? (spot.y / range) * 100 : 0}%`,
  }
}
