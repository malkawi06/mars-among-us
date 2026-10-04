import { useEffect, useState, type DragEvent } from 'react'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { site as siteConfig } from '../config/site'
import { usePageTitle } from '../hooks/usePageTitle'

type BodyChoice = 'auto' | 'Mars' | 'Moon'

/**
 * Upload page for a Moon or Mars orbital image. The landform model is being retrained on the
 * challenge data, so for now the page shows the image and says so; it does not analyze it.
 */
export default function Analyze() {
  const { analyze: page } = siteConfig
  usePageTitle(page.title)

  const [imageUrl, setImageUrl] = useState<string>()
  const [dragging, setDragging] = useState(false)
  const [bodyChoice, setBodyChoice] = useState<BodyChoice>('auto')

  // Release the uploaded image's object URL when it is replaced or the page closes.
  useEffect(
    () => () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    },
    [imageUrl],
  )

  const pickFile = (file: File | undefined) => {
    if (file?.type.startsWith('image/')) setImageUrl(URL.createObjectURL(file))
  }
  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    pickFile(event.dataTransfer.files[0])
  }

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
          {imageUrl && (
            <p className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-fg-2">
              {page.notReady}
            </p>
          )}
        </div>

        <div className="lg:col-span-3">
          <Card title="How it will work">
            <ol className="space-y-4">
              {page.steps.map((step, i) => (
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
