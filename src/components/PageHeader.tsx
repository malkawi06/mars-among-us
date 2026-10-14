import type { ReactNode } from 'react'
import type { Photo } from '../config/site'
import { PhotoCredit, PhotoFill } from './Photo'

interface PageHeaderProps {
  title: string
  /** Small label above the title, e.g. "02 · Compare". */
  eyebrow?: string
  intro?: ReactNode
  photo: Photo
  children?: ReactNode
}

/**
 * Top of every inner page: a NASA photo across the full width with the title over it.
 * It sits inside the page's centred column and stretches to the screen edges; the `dark` class
 * keeps its text light over the photo in both themes.
 */
export function PageHeader({ title, eyebrow, intro, photo, children }: PageHeaderProps) {
  return (
    <header className="dark relative -mt-8 mb-10 ml-[calc(50%-50vw)] flex min-h-[26rem] w-screen items-end overflow-hidden bg-black text-fg sm:min-h-[58svh]">
      <PhotoFill photo={photo} priority className="kenburns" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />

      <div className="fade-in relative mx-auto w-full max-w-7xl px-4 pt-28 pb-12 sm:pb-16">
        {eyebrow && (
          <p className="font-display text-sm font-semibold tracking-[0.3em] text-white/75 uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 max-w-4xl font-display text-5xl leading-[0.92] font-bold sm:text-7xl">
          {title}
        </h1>
        {intro && <p className="mt-5 max-w-2xl text-lg text-white/85">{intro}</p>}
        {children}
      </div>

      <PhotoCredit photo={photo} />
    </header>
  )
}
