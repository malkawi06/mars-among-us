import type { Photo } from '../config/site'

const PHOTOS = `${import.meta.env.BASE_URL}photos/`

/** A NASA photo filling its (relative) parent, in two widths so phones get the smaller file. */
export function PhotoFill({
  photo,
  priority = false,
  className = '',
}: {
  photo: Photo
  /** The first photo on the page: load it straight away. */
  priority?: boolean
  className?: string
}) {
  return (
    <img
      src={`${PHOTOS}${photo.file}-2560.jpg`}
      srcSet={`${PHOTOS}${photo.file}-1280.jpg 1280w, ${PHOTOS}${photo.file}-2560.jpg 2560w`}
      sizes="100vw"
      alt={photo.alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={`absolute inset-0 size-full object-cover ${className}`}
    />
  )
}

/** Title and credit of a photo, linked to its NASA page, in the bottom-right corner of its section. */
export function PhotoCredit({ photo }: { photo: Photo }) {
  return (
    <p className="absolute right-5 bottom-3 z-10 max-w-[70vw] truncate text-right text-[11px] text-white/45 sm:right-8">
      Photo:{' '}
      <a href={photo.page} target="_blank" rel="noreferrer" className="hover:text-white">
        {photo.title}
      </a>{' '}
      · {photo.credit}
    </p>
  )
}
