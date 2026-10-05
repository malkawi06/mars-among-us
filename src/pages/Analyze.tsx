import { useEffect, useState, type DragEvent } from 'react'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { site as siteConfig } from '../config/site'
import { usePageTitle } from '../hooks/usePageTitle'

type Body = 'Mars' | 'Moon'

/**
 * Upload page for a Moon or Mars orbital image. The landform model is being retrained on the
 * challenge data, so for now the page shows the image and says so; it does not analyze it.
 */
export default function Analyze() {
  const { analyze: page } = siteConfig
  usePageTitle(page.title)

  const [imageUrl, setImageUrl] = useState<string>()
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState<string>()
  // Which world the image shows, as decided by the landform model. Stays undefined ("Auto") until
  // the model is added and has analyzed an image.
  const [detected] = useState<Body>()

  // Release the uploaded image's object URL when it is replaced or the page closes.
  useEffect(
    () => () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    },
    [imageUrl],
  )

  // A file dropped outside the drop zone would make the browser open it and leave the page.
  useEffect(() => {
    const stop = (event: globalThis.DragEvent) => event.preventDefault()
    window.addEventListener('dragover', stop)
    window.addEventListener('drop', stop)
    return () => {
      window.removeEventListener('dragover', stop)
      window.removeEventListener('drop', stop)
    }
  }, [])

  const pickFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setFileError(`"${file.name}" is not an image. Choose a PNG or JPG file.`)
      return
    }
    setFileError(undefined)
    setImageUrl(URL.createObjectURL(file))
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
          {fileError && (
            <p
              role="alert"
              className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-fg-2"
            >
              {fileError}
            </p>
          )}
          <BodyStatus detected={detected} />
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

/** Where the image is from: "Auto" until the model has looked at it, then Mars or Moon. */
function BodyStatus({ detected }: { detected?: Body }) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm" aria-live="polite">
      <span className="text-fg-2">Image from:</span>
      <span
        className={`rounded-full px-3 py-1 font-medium ${
          detected ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-fg-2'
        }`}
      >
        {detected ?? 'Auto'}
      </span>
      {!detected && <span className="text-xs text-muted">The model decides: Mars or Moon</span>}
    </p>
  )
}
