import { useEffect, useState, type DragEvent } from 'react'
import { Link } from 'react-router'
import { AnalogMap } from '../components/AnalogMap'
import { AnalogSiteDetails } from '../components/AnalogSiteDetails'
import { Card } from '../components/Card'
import { ConfidenceBadge } from '../components/ConfidenceBadge'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { PageHeader } from '../components/PageHeader'
import { site as siteConfig } from '../config/site'
import { analogsFor } from '../data/analogs'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { classifyLandform, loadLandformModel, type LandformPrediction } from '../lib/landformModel'

const LOW_CONFIDENCE = 0.5

export default function Analyze() {
  const { analyze: page } = siteConfig
  usePageTitle(page.title)

  const [imageUrl, setImageUrl] = useState<string>()
  const [selectedId, setSelectedId] = useState<string>()
  const { data, error, loading, reload } = useAsync(imageUrl ?? null, () => classify(imageUrl!))

  // Start downloading the model while the user picks an image. Errors surface on analysis.
  useEffect(() => {
    loadLandformModel().catch(() => {})
  }, [])

  const pickFile = (file: File | undefined) => {
    if (!file?.type.startsWith('image/')) return
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(URL.createObjectURL(file))
    setSelectedId(undefined)
  }
  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    pickFile(event.dataTransfer.files[0])
  }

  const top = data?.[0]
  const analogs = top ? analogsFor(top.code) : []
  const selected = analogs.find(({ site }) => site.id === selectedId)?.site

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader title={page.title} intro={page.intro} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <label
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface p-6 text-center hover:border-accent"
          >
            {imageUrl ? (
              <img src={imageUrl} alt="Uploaded Mars image" className="max-h-72 rounded-lg" />
            ) : (
              <span className="py-8 font-medium">Drop a Mars image here, or click to choose</span>
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
          <p className="text-xs text-muted">{page.scaleNote}</p>

          {loading && <LoadingState label="Analyzing… (the first run downloads the 15 MB model)" />}
          {error && (
            <ErrorState title="Could not analyze the image" error={error} onRetry={reload} />
          )}
          {data && <Predictions predictions={data} lowConfidenceNote={page.lowConfidence} />}
        </div>

        <div className="space-y-4 lg:col-span-3">
          {top ? (
            <>
              <h2 className="text-xl font-semibold">
                Places on Earth with {top.name.toLowerCase()} like this
              </h2>
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
              <ol className="list-decimal space-y-1 pl-5 text-fg-2">
                <li>The image is analyzed in your browser. It is never uploaded.</li>
                <li>The model names the Mars landform (crater, dunes, channel, …).</li>
                <li>We show sourced places on Earth with the same landform.</li>
              </ol>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function Predictions({
  predictions,
  lowConfidenceNote,
}: {
  predictions: LandformPrediction[]
  lowConfidenceNote: string
}) {
  const [top] = predictions
  return (
    <Card title="What the model sees" subtitle="Top 3 of 15 Mars landforms">
      <ul className="space-y-3">
        {predictions.slice(0, 3).map((p) => (
          <li key={p.code}>
            <div className="flex justify-between text-sm">
              <span className={p === top ? 'font-semibold' : 'text-fg-2'}>{p.name}</span>
              <span className="tabular-nums text-fg-2">{(p.probability * 100).toFixed(1)}%</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-surface-2">
              <div
                className="h-2 rounded-full bg-[var(--series-1)]"
                style={{ width: `${p.probability * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      {top.probability < LOW_CONFIDENCE && (
        <p className="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-fg-2">
          {lowConfidenceNote}
        </p>
      )}
    </Card>
  )
}

async function classify(url: string): Promise<LandformPrediction[]> {
  const image = new Image()
  image.src = url
  await image.decode()
  return classifyLandform(image)
}
