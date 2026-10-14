import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { site, type Photo } from '../config/site'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { useReveal } from '../hooks/useReveal'
import { EARTH_URL, TARGETS_URL, loadOrbitalImages } from '../lib/orbitalImages'
import { PhotoCredit, PhotoFill } from '../components/Photo'

const stats = __HOME_STATS__
const example = stats.example
const exampleLink = `/compare?target=${example.targetId}&purpose=${example.purposeId}&site=${example.siteId}`

export default function Home() {
  usePageTitle()
  const { home, analyze, compare, analogs } = site

  return (
    <div className="bg-black text-white">
      <Hero />

      <Panel
        photo={site.photos.analyze}
        eyebrow="01 · Analyze"
        title={analyze.title}
        body={analyze.intro}
        cta={home.primaryCta}
      >
        <ol className="grid gap-3 sm:grid-cols-3">
          {analyze.steps.map((step, i) => (
            <li key={step.title} className="border-t border-white/30 pt-3">
              <span className="font-display text-sm font-semibold tracking-[0.18em] text-white/60">
                0{i + 1}
              </span>
              <p className="mt-1 font-medium">{step.title}</p>
            </li>
          ))}
        </ol>
        <p className="text-sm text-white/60">{analyze.notReady}</p>
      </Panel>

      <Panel
        photo={site.photos.compare}
        eyebrow="02 · Compare"
        title={compare.title}
        body={compare.intro}
        cta={home.secondaryCta}
        side="right"
      >
        <Stats
          items={[
            { value: stats.targets, label: 'Places on the Moon and Mars' },
            { value: stats.earthSites, label: 'Earth sites scored' },
            { value: stats.purposes, label: 'Purposes' },
          ]}
        />
      </Panel>

      <Example />

      <Panel
        photo={site.photos.analogs}
        eyebrow="03 · Earth Analogs"
        title={analogs.title}
        body={analogs.intro}
        cta={{ label: 'Explore Earth Analogs', to: '/analogs' }}
      >
        <Stats
          items={[
            { value: stats.analogSites, label: 'Analog sites, each with sources' },
            { value: stats.landforms.length, label: 'Landforms' },
          ]}
        />
        <ul className="flex flex-wrap gap-2">
          {stats.landforms.map(([code, name]) => (
            <li key={code}>
              <Link
                to={`/analogs?landform=${code}`}
                className="block border border-white/40 px-3 py-1.5 font-display text-xs font-semibold tracking-[0.14em] uppercase transition-colors hover:border-white hover:bg-white hover:text-black"
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        photo={site.photos.method}
        eyebrow="How it is scored"
        title={home.methodTitle}
        body={home.scoring}
        cta={{ label: 'Read the method', href: compare.methodSource }}
        side="right"
      >
        <p className="text-white/70">{home.noData}</p>
      </Panel>

      <Sources />
    </div>
  )
}

function Hero() {
  const { home, event, pitch, name } = site
  const [first, ...rest] = name.split(' ')
  const photo = site.photos.hero
  return (
    <section className="relative flex h-svh min-h-[40rem] items-end overflow-hidden">
      <PhotoFill photo={photo} priority className="kenburns" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />

      <div className="relative mx-auto w-full max-w-[90rem] px-5 pb-28 sm:px-8 sm:pb-32">
        <p className="fade-in font-display text-sm font-semibold tracking-[0.3em] text-white/80 uppercase">
          {event.name} · {event.dates}
        </p>
        <h1 className="mt-4 bg-none font-display text-white text-[clamp(4rem,13vw,11rem)] leading-[0.85] font-bold tracking-tight uppercase">
          <span className="rise">
            <span>{first}</span>
          </span>
          <span className="rise">
            <span>{rest.join(' ')}</span>
          </span>
        </h1>
        <p className="fade-in mt-6 max-w-xl text-lg text-white/85 sm:text-xl">{pitch}</p>
        <div className="fade-in mt-9 flex flex-wrap gap-4">
          <Link to={home.primaryCta.to} className="btn-line solid">
            {home.primaryCta.label}
          </Link>
          <Link to={home.secondaryCta.to} className="btn-line">
            {home.secondaryCta.label}
          </Link>
        </div>
      </div>

      <PhotoCredit photo={photo} />
      <ChevronDown
        className="absolute bottom-6 left-1/2 hidden size-7 -translate-x-1/2 animate-bounce lg:block text-white/70 motion-reduce:animate-none"
        aria-hidden
      />
    </section>
  )
}

type Cta = { label: string; to: string } | { label: string; href: string }

/** One full-screen section: a photo, a dark fade toward the text, and the text on one side. */
function Panel({
  photo,
  eyebrow,
  title,
  body,
  cta,
  side = 'left',
  children,
}: {
  photo: Photo
  eyebrow: string
  title: string
  body: string
  cta: Cta
  side?: 'left' | 'right'
  children?: ReactNode
}) {
  const ref = useReveal<HTMLElement>()
  const right = side === 'right'
  return (
    <section
      ref={ref}
      className="relative flex min-h-svh items-end overflow-hidden lg:items-center"
    >
      <PhotoFill photo={photo} className="settle" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10 lg:hidden" />
      <div
        className={`absolute inset-0 hidden lg:block ${
          right
            ? 'bg-gradient-to-l from-black/90 via-black/50 to-transparent'
            : 'bg-gradient-to-r from-black/90 via-black/50 to-transparent'
        }`}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />

      <div
        className={`relative mx-auto flex w-full max-w-[90rem] px-5 py-24 sm:px-8 ${right ? 'lg:justify-end' : ''}`}
      >
        <div className="reveal flex max-w-xl flex-col gap-6">
          <p className="font-display text-sm font-semibold tracking-[0.3em] text-white/70 uppercase">
            {eyebrow}
          </p>
          <h2 className="font-display text-5xl leading-[0.95] font-bold uppercase sm:text-6xl">
            {title}
          </h2>
          <p className="text-lg text-white/85">{body}</p>
          {children}
          <div>
            {'to' in cta ? (
              <Link to={cta.to} className="btn-line">
                {cta.label}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            ) : (
              <a href={cta.href} target="_blank" rel="noreferrer" className="btn-line">
                {cta.label}
                <ArrowRight className="size-4" aria-hidden />
              </a>
            )}
          </div>
        </div>
      </div>

      <PhotoCredit photo={photo} />
    </section>
  )
}

function Stats({ items }: { items: { value: number; label: string }[] }) {
  return (
    <dl className="flex flex-wrap gap-x-10 gap-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="sr-only">{item.label}</dt>
          <dd className="font-display text-6xl leading-none font-bold tabular-nums">
            {item.value}
          </dd>
          <dd className="mt-2 max-w-[11rem] font-display text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">
            {item.label}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** One real comparison, computed from the data at build time, with both orbital images when available. */
function Example() {
  const ref = useReveal<HTMLElement>()
  const { data: images } = useAsync('orbital-images', loadOrbitalImages)
  const targetImage = images?.targets[example.targetId]
  const siteImage = images?.earth[example.siteId]

  return (
    <section ref={ref} className="border-y border-white/10 bg-black">
      <div
        className={`mx-auto grid gap-12 px-5 py-24 sm:px-8 lg:items-center lg:py-32 ${
          targetImage && siteImage ? 'max-w-[90rem] lg:grid-cols-2' : 'max-w-4xl'
        }`}
      >
        <div className="reveal flex flex-col gap-6">
          <p className="font-display text-sm font-semibold tracking-[0.3em] text-white/70 uppercase">
            One real result · {example.purposeLabel}
          </p>
          <h2 className="font-display text-4xl leading-tight font-bold uppercase sm:text-5xl">
            {example.targetName}
            <span className="block text-white/50">
              on Earth: {example.siteName}, {example.siteCountry}
            </span>
          </h2>
          <p className="font-display text-[clamp(6rem,16vw,12rem)] leading-none font-bold tabular-nums">
            {example.percent === null ? '—' : `${example.percent}%`}
          </p>
          <ul className="divide-y divide-white/15 border-y border-white/15">
            {example.factors.map((factor) => (
              <li key={factor.label} className="flex items-center justify-between gap-6 py-3">
                <span className="min-w-0">
                  <span className="font-medium">{factor.label}</span>
                  <span className="block text-sm text-white/60">{factor.reason}</span>
                </span>
                <span className="flex shrink-0 gap-1" aria-label={`${factor.score} of 3`}>
                  {[1, 2, 3].map((n) => (
                    <span
                      key={n}
                      className={`h-1.5 w-6 ${n <= factor.score ? 'bg-white' : 'bg-white/20'}`}
                    />
                  ))}
                </span>
              </li>
            ))}
          </ul>
          {example.notScored.length > 0 && (
            <p className="text-sm text-white/60">
              No sourced data yet, so not scored: {example.notScored.join(', ').toLowerCase()}.
            </p>
          )}
          <div>
            <Link to={exampleLink} className="btn-line">
              Open this comparison
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>

        {targetImage && siteImage && (
          <figure className="reveal grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { src: TARGETS_URL + targetImage.file, label: 'Moon', name: example.targetName },
                { src: EARTH_URL + siteImage.file, label: 'Earth', name: example.siteName },
              ].map((image) => (
                <div key={image.label} className="relative overflow-hidden">
                  <img
                    src={image.src}
                    alt={`${image.name} from orbit`}
                    className="settle aspect-[3/4] w-full object-cover"
                  />
                  <span className="absolute top-3 left-3 font-display text-xs font-semibold tracking-[0.2em] uppercase">
                    {image.label}
                  </span>
                </div>
              ))}
            </div>
            <figcaption className="text-sm text-white/60">
              Both orbital images about 6 km across.
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  )
}

function Sources() {
  const ref = useReveal<HTMLElement>()
  return (
    <section ref={ref} className="bg-black">
      <div className="mx-auto max-w-[90rem] px-5 py-24 sm:px-8">
        <div className="reveal flex flex-col gap-4">
          <p className="font-display text-sm font-semibold tracking-[0.3em] text-white/70 uppercase">
            Data
          </p>
          <h2 className="font-display text-4xl font-bold uppercase sm:text-5xl">
            Where the data comes from
          </h2>
          <p className="max-w-2xl text-white/70">
            Every number on the site links back to one of these sources or to a published paper.
          </p>
        </div>
        <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {site.about.nasaData.map((source) => (
            <li key={source.name} className="border-t border-white/20 pt-4">
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="font-display text-lg font-semibold tracking-wide uppercase hover:underline"
              >
                {source.name}
              </a>
              <p className="mt-1 text-sm text-white/60">{source.howWeUseIt}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
