/**
 * Runs the Mars landform classifier (ml/train_mars_landforms.ipynb) in the browser with onnxruntime-web.
 * The int8 model lives at public/models/mars_landforms.int8.onnx (~15 MB) and is downloaded once.
 */

import type { InferenceSession } from 'onnxruntime-web/wasm'
import { LANDFORM_NAMES, type LandformCode } from '../data/analogs'

const MODEL_URL = '/models/mars_landforms.int8.onnx'
const SIZE = 224
const MEAN = [0.485, 0.456, 0.406]
const STD = [0.229, 0.224, 0.225]
/** Training used torchvision ImageFolder, which sorts class folders alphabetically. */
const CLASSES = (Object.keys(LANDFORM_NAMES) as LandformCode[]).sort()

export interface LandformPrediction {
  code: LandformCode
  name: string
  probability: number
}

let session: Promise<InferenceSession> | undefined

/** Downloads and initialises the model once; later calls reuse it. */
export function loadLandformModel(): Promise<InferenceSession> {
  session ??= createSession()
  session.catch(() => (session = undefined)) // allow a retry after a failure
  return session
}

async function createSession(): Promise<InferenceSession> {
  const response = await fetch(MODEL_URL)
  // The SPA fallback answers missing files with index.html, so check the type as well as the status.
  if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
    throw new Error(
      `The model file is missing. Add mars_landforms.int8.onnx from Kaggle to public/models/ and redeploy.`,
    )
  }
  const ort = await import('onnxruntime-web/wasm')
  ort.env.wasm.numThreads = 1 // multi-threading needs cross-origin isolation headers we don't set
  return ort.InferenceSession.create(await response.arrayBuffer(), { executionProviders: ['wasm'] })
}

/** Classifies an image; returns every landform, most likely first. */
export async function classifyLandform(image: HTMLImageElement): Promise<LandformPrediction[]> {
  const model = await loadLandformModel()
  const { Tensor } = await import('onnxruntime-web/wasm')
  const input = new Tensor('float32', toInputTensor(image), [1, 3, SIZE, SIZE])
  const output = await model.run({ [model.inputNames[0]]: input })
  const logits = Array.from(output[model.outputNames[0]].data as Float32Array)
  if (logits.length !== CLASSES.length) {
    throw new Error(`Model returned ${logits.length} classes, expected ${CLASSES.length}.`)
  }
  return softmax(logits)
    .map((probability, i) => ({ code: CLASSES[i], name: LANDFORM_NAMES[CLASSES[i]], probability }))
    .sort((a, b) => b.probability - a.probability)
}

/**
 * Same preprocessing as training: centre square crop, resize to 224, grayscale copied to 3 channels
 * (PIL's luma weights), ImageNet mean/std normalisation, CHW layout.
 */
function toInputTensor(image: HTMLImageElement): Float32Array {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Canvas is not available in this browser.')
  const side = Math.min(image.naturalWidth, image.naturalHeight)
  context.drawImage(
    image,
    (image.naturalWidth - side) / 2,
    (image.naturalHeight - side) / 2,
    side,
    side,
    0,
    0,
    SIZE,
    SIZE,
  )
  const { data } = context.getImageData(0, 0, SIZE, SIZE)
  const pixels = SIZE * SIZE
  const tensor = new Float32Array(3 * pixels)
  for (let i = 0; i < pixels; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    const gray = ((r * 19595 + g * 38470 + b * 7471 + 0x8000) >> 16) / 255
    for (let c = 0; c < 3; c++) tensor[c * pixels + i] = (gray - MEAN[c]) / STD[c]
  }
  return tensor
}

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits)
  const exps = logits.map((x) => Math.exp(x - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map((x) => x / sum)
}
