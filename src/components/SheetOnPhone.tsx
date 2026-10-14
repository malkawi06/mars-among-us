import { useEffect, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { DESKTOP, useMediaQuery } from '../hooks/useMediaQuery'

/** How far the sheet must be dragged down (px) to close. */
const CLOSE_DRAG = 110

/**
 * On phones and tablets, its children slide up from the bottom of the screen as a sheet over the
 * page, closed by the X, a tap outside, Escape or a drag down. From the `lg` breakpoint it is a
 * plain column in the page: `className` sets its desktop layout, including its `lg:` position.
 */
export function SheetOnPhone({
  open,
  onClose,
  label,
  className = 'lg:static',
  children,
}: {
  open: boolean
  onClose: () => void
  /** Accessible name of the sheet. */
  label: string
  className?: string
  children: ReactNode
}) {
  const desktop = useMediaQuery(DESKTOP)
  const showing = open && !desktop
  const [drag, setDrag] = useState<number | null>(null)
  const start = useRef(0)
  const panel = useRef<HTMLDivElement>(null)

  // While the sheet is up: Escape closes it, the page behind does not scroll, focus moves in.
  useEffect(() => {
    if (!showing) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus({ preventScroll: true })
    panel.current?.scrollTo({ top: 0 })
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [showing, onClose])

  const endDrag = () => {
    if (drag !== null && drag > CLOSE_DRAG) onClose()
    setDrag(null)
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[55] bg-black/60 transition-opacity duration-300 lg:hidden ${
          showing ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panel}
        tabIndex={-1}
        role={desktop ? undefined : 'dialog'}
        aria-modal={showing || undefined}
        aria-label={desktop ? undefined : label}
        inert={!desktop && !open}
        style={drag ? { transform: `translateY(${drag}px)`, transition: 'none' } : undefined}
        className={`fixed inset-x-0 bottom-0 z-[60] max-h-[88svh] overflow-y-auto overscroll-contain rounded-t-[1.25rem] bg-bg pb-[env(safe-area-inset-bottom)] shadow-2xl outline-none transition-transform duration-300 ease-out lg:z-auto lg:max-h-none lg:translate-y-0 lg:overflow-visible lg:rounded-none lg:bg-transparent lg:pb-0 lg:shadow-none ${
          open ? 'translate-y-0' : 'translate-y-full'
        } ${className}`}
      >
        <div
          className="sticky top-0 z-10 flex touch-none items-center justify-between bg-bg/95 px-4 pt-2 pb-1 backdrop-blur lg:hidden"
          onPointerDown={(e) => {
            start.current = e.clientY
            setDrag(0)
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) => drag !== null && setDrag(Math.max(0, e.clientY - start.current))}
          onPointerUp={endDrag}
          onPointerCancel={() => setDrag(null)}
        >
          <span className="w-9" />
          <span className="h-1.5 w-12 rounded-full bg-fg/25" aria-hidden />
          <button
            type="button"
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            className="grid size-9 place-items-center rounded-full text-fg-2 hover:bg-surface-2"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </>
  )
}
