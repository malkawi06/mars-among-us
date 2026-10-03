import { useEffect, useState, type DragEvent } from 'react'
import { Link } from 'react-router'
import { AnalogMap } from '../components/AnalogMap'
import { AnalogSiteDetails } from '../components/AnalogSiteDetails'
import { Card } from '../components/Card'
import { ConfidenceBadge } from '../components/ConfidenceBadge'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { PageHeader } from '../components/PageHeader'
import { SimilarSpots } from '../components/SimilarSpots'
import { site as siteConfig } from '../config/site'
import {
  analogsFor,
  bodyOf,
  LANDFORM_NAMES,
  landformInText,
  type Body,
  type LandformCode,
} from '../data/analogs'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { loadEarthScan, visualMatch } from '../lib/earthScan'
import {
  classifyLandform,
  loadLandformModel,
  moonProbability,
  onlyBody,
  type LandformPrediction,
} from '../lib/landformModel'

const LOW_CONFIDENCE = 0.5
/** Above this, the model's own Moon-or-Mars call is shown as a hint when the user picked the other. */
const SURE_OF_BODY = 0.9

type BodyChoice = 'auto' | Body
const SAMPLES_URL = `${import.meta.env.BASE_URL}samples/`

/** One entry of public/samples/index.json (written by the last cell of the Kaggle notebook). */
interface Sample {
  file: string
  landform: LandformCode
}

export default function Analyze() {
  const { analyze: page } = siteConfig
  usePageTitle(page.title)

  const [imageUrl, setImageUrl] = useState<string>()
  /** The dataset's label when the image is one of the samples. */
  const [knownLandform, setKnownLandform] = useState<LandformCode>()
  const [selectedId, setSelectedId] = useState<string>()
  const [dragging, setDragging] = useState(false)
  const [bodyChoice, setBodyChoice] = useState<BodyChoice>('auto')
  const { data, error, loading, reload } = useAsync(imageUrl ?? null, () => classify(imageUrl!))
  const { data: samples } = useAsync('samples', loadSamples)
  const { data: earthScan } = useAsync('earth-scan', loadEarthScan)

  // Start downloading the model while the user picks an image. Errors surface on analysis.
  useEffect(() => {
    loadLandformModel().catch(() => {})
  }, [])

  const showImage = (url: string, landform?: LandformCode) => {
    if (imageUrl?.startsWith('blob:')) URL.revokeObjectURL(imageUrl)
    setImageUrl(url)
    setKnownLandform(landform)
    setSelectedId(undefined)
  }
  const pickFile = (file: File | undefined) => {
    if (file?.type.startsWith('image/')) showImage(URL.createObjectURL(file))
  }
  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    pickFile(event.dataTransfer.files[0])
  }

  // "Mars" or "Moon" keeps that world's landforms only; the model runs once either way.
  const predictions = data && (bodyChoice === 'auto' ? data : onlyBody(data, bodyChoice))
  const top = predictions?.[0]
  const analogs = top ? analogsFor(top.code) : []
  const selected = analogs.find(({ site }) => site.id === selectedId)?.site
  const lookAlike = (id: string) => (top && earthScan ? visualMatch(earthScan, id, top.code) : null)
  /** Shown next to the upload: the selected site, else the one whose satellite image looks most alike. */
  const bestLooking = [...analogs].sort(
    (a, b) => (lookAlike(b.site.id) ?? -1) - (lookAlike(a.site.id) ?? -1),
  )[0]?.site
  const focus = selected ?? bestLooking

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader title={page.title} intro={page.intro} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <label
            onDragOver={(event) => event.preventDefault()}
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors hover:border-accent ${
              dragging ? 'border-accent bg-accent/10' : 'border-border bg-surface'
            }`}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="Uploaded image" className="max-h-72 rounded-lg" />
            ) : (
              <span className="py-8 font-medium">
                Drop a Moon or Mars image here, or click to choose
              </span>
            )}
            <span className="text-sm text-accent">
              {imageUrl ? 'Choose another image' : 'PNG or JPG'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => pickFile(event.target.files?.[0])}
            />
          </label>
          <BodyPicker value={bodyChoice} onChange={setBodyChoice} />
          <p className="text-xs text-muted">{page.scaleNote}</p>

          {loading && <LoadingState label="Analyzing… (the first run downloads the 15 MB model)" />}
          {error && (
            <ErrorState title="Could not analyze the image" error={error} onRetry={reload} />
          )}
          {data && predictions && (
            <Predictions
              predictions={predictions}
              moon={moonProbability(data)}
              bodyChoice={bodyChoice}
              knownLandform={knownLandform}
              lowConfidenceNote={page.lowConfidence}
            />
          )}
          {samples && samples.length > 0 && (
            <Card title={page.samplesTitle} subtitle={page.samplesNote}>
              <ul className="grid grid-cols-5 gap-2">
                {samples.map((sample) => (
                  <li key={sample.file}>
                    <button
                      type="button"
                      onClick={() => showImage(SAMPLES_URL + sample.file, sample.landform)}
                      title={LANDFORM_NAMES[sample.landform]}
                      className={`block w-full overflow-hidden rounded-lg border-2 transition-colors hover:border-accent ${
                        imageUrl === SAMPLES_URL + sample.file
                          ? 'border-accent'
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={SAMPLES_URL + sample.file}
                        alt={`Sample: ${LANDFORM_NAMES[sample.landform]}`}
                        loading="lazy"
                        className="aspect-square w-full object-cover"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-4 lg:col-span-3">
          {top ? (
            <>
              <h2 className="text-xl font-semibold">
                {bodyOf(top.code) === 'Moon'
                  ? `Places on Earth that resemble the Moon (${landformInText(top.code)})`
                  : `Places on Earth with ${landformInText(top.code)} like this`}
              </h2>
              {imageUrl && focus && (
                <SimilarSpots
                  userImage={imageUrl}
                  site={focus}
                  landform={top}
                  scan={earthScan}
                  candidates={analogs.length}
                  autoPicked={!selected}
                />
              )}
              <AnalogMap
                sites={analogs.map(({ site }) => site)}
                selectedId={selectedId}
                onSelect={setSelectedId}
                className="h-80"
              />
              {selected ? (
                <AnalogSiteDetails site={selected} onBack={() => setSelectedId(undefined)} />
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {analogs.map(({ site, confidence }) => (
                    <li key={site.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(site.id)}
                        className="h-full w-full rounded-xl border border-border bg-surface p-3 text-left hover:border-accent"
                      >
                        <span className="block font-medium">{site.name}</span>
                        <span className="block text-sm text-muted">{site.country}</span>
                        <ConfidenceBadge confidence={confidence} className="mt-2" />
                        {lookAlike(site.id) !== null && (
                          <span className="mt-1 block text-xs text-muted">
                            Satellite image looks {Math.round(lookAlike(site.id)! * 100)}% alike
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                to={`/analogs?landform=${top.code}`}
                className="inline-block text-sm text-accent hover:underline"
              >
                Open in Earth Analogs →
              </Link>
            </>
          ) : (
            <Card title="How it works">
              <ol className="space-y-4">
                {siteConfig.home.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                      {i + 1}
                    </span>
                    <span>
                      <span className="block font-medium">{step.title}</span>
                      <span className="block text-sm text-fg-2">{step.body}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function BodyPicker({
  value,
  onChange,
}: {
  value: BodyChoice
  onChange: (value: BodyChoice) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-fg-2">Image from:</span>
      <div
        role="group"
        aria-label="Image from"
        className="flex gap-1 rounded-full bg-surface-2 p-1"
      >
        {(['auto', 'Mars', 'Moon'] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              value === option ? 'bg-accent text-accent-fg' : 'text-fg-2 hover:text-fg'
            }`}
          >
            {option === 'auto' ? 'Auto' : option}
          </button>
        ))}
      </div>
    </div>
  )
}

function Predictions({
  predictions,
  moon,
  bodyChoice,
  knownLandform,
  lowConfidenceNote,
}: {
  predictions: LandformPrediction[]
  /** The model's probability that the image shows the Moon, over all classes. */
  moon: number
  bodyChoice: BodyChoice
  knownLandform?: LandformCode
  lowConfidenceNote: string
}) {
  const [top] = predictions
  const looksLike: Body = moon >= 0.5 ? 'Moon' : 'Mars'
  const sureness = looksLike === 'Moon' ? moon : 1 - moon
  const scope = bodyChoice === 'auto' ? 'Moon and Mars' : bodyChoice
  return (
    <Card
      title="What the model sees"
      subtitle={`Top 3 of ${predictions.length} ${scope} landforms`}
    >
      {bodyChoice === 'auto' ? (
        <p className="mb-4 text-sm text-fg-2">
          Looks like{' '}
          <span className="font-medium text-fg">{looksLike === 'Moon' ? 'the Moon' : 'Mars'}</span>{' '}
          ({(sureness * 100).toFixed(1)}%)
        </p>
      ) : (
        looksLike !== bodyChoice &&
        sureness >= SURE_OF_BODY && (
          <p className="mb-4 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-fg-2">
            The model thinks this image looks like {looksLike === 'Moon' ? 'the Moon' : 'Mars'} (
            {(sureness * 100).toFixed(1)}%). Choose Auto to let it decide.
          </p>
        )
      )}
      <ul className="space-y-3">
        {predictions.slice(0, 3).map((p) => (
          <li key={p.code}>
            <div className="flex justify-between text-sm">
              <span className={p === top ? 'font-semibold' : 'text-fg-2'}>{p.name}</span>
              <span className="tabular-nums text-fg-2">{(p.probability * 100).toFixed(1)}%</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-surface-2">
              <div
                className="h-2 rounded-full bg-accent"
                style={{ width: `${p.probability * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      {knownLandform && (
        <p className="mt-4 text-sm text-fg-2">
          Scientists labelled this sample{' '}
          <span className="font-medium text-fg">{LANDFORM_NAMES[knownLandform]}</span>
          {knownLandform === top.code ? ': the model got it right.' : '.'}
        </p>
      )}
      {top.probability < LOW_CONFIDENCE && (
        <p className="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-fg-2">
          {lowConfidenceNote}
        </p>
      )}
    </Card>
  )
}

async function loadSamples(): Promise<Sample[]> {
  const response = await fetch(`${SAMPLES_URL}index.json`)
  // No samples uploaded yet: the host answers with index.html or a 404. Hide the gallery.
  if (!response.ok || !response.headers.get('content-type')?.includes('json')) return []
  return response.json()
}

async function classify(url: string): Promise<LandformPrediction[]> {
  const image = new Image()
  image.src = url
  await image.decode()
  return classifyLandform(image)
}
