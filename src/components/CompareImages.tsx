export interface CompareSide {
  src: string
  label: string
  credit?: string
  /** Page the credit links to. */
  page?: string
}

/** A Mars image and an Earth image side by side, each labelled with its planet. */
export function CompareImages({
  mars,
  earth,
  className = '',
}: {
  mars: CompareSide
  earth: CompareSide
  className?: string
}) {
  return (
    <div className={`relative grid grid-cols-2 gap-3 ${className}`}>
      <Side side={mars} planet="Mars" tone="bg-accent text-accent-fg" />
      <Side side={earth} planet="Earth" tone="bg-earth text-bg" />
      <span
        aria-hidden="true"
        className="absolute top-[calc(50%-1.75rem)] left-1/2 grid size-9 -translate-x-1/2 place-items-center rounded-full border border-border bg-bg text-lg font-semibold shadow-lg"
      >
        ≈
      </span>
    </div>
  )
}

function Side({ side, planet, tone }: { side: CompareSide; planet: string; tone: string }) {
  return (
    <figure className="min-w-0">
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface-2">
        <img
          src={side.src}
          alt={`${planet}: ${side.label}`}
          className="aspect-square w-full object-cover"
        />
        <span
          className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide uppercase ${tone}`}
        >
          {planet}
        </span>
      </div>
      <figcaption className="mt-2 text-sm">
        <span className="block truncate font-medium">{side.label}</span>
        {side.credit && (
          <a
            href={side.page}
            target="_blank"
            rel="noreferrer"
            className="block truncate text-xs text-muted hover:underline"
          >
            {side.credit}
          </a>
        )}
      </figcaption>
    </figure>
  )
}
