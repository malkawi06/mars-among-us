"""Scans the Earth and Moon/Mars target images (public/earth/, public/targets/) with the landform model.

Writes public/earth/scan.json: for each image, square windows (~1.5 km) with the model's probability
for every landform class. The Analyze page uses it to pick the Earth site that looks most like the
uploaded image, the Compare page to match a Moon or Mars target with an Earth site, and both to box
the matching areas, instantly and offline.
Run after fetch_earth_images.py (the deploy workflow does). Needs Pillow, numpy and onnxruntime.
"""

import json
import math
import re
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'
MODEL = ROOT / 'public' / 'models' / 'mars_landforms.int8.onnx'
WINDOW_M = 1500  # close to the ~1.2 km tiles the model was trained on
SIZE = 224
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def class_codes():
    """Model class order: landform codes sorted alphabetically, as in src/lib/landformModel.ts."""
    text = (ROOT / 'src' / 'data' / 'analogs.ts').read_text()
    block = text[text.index('export const LANDFORM_NAMES'):]
    block = block[:block.index('}')]
    return sorted(re.findall(r'^\s*(\w+):', block, flags=re.M))


def positions(length, window):
    """Same as the browser code: evenly spaced, neighbours overlapping by at least 20%."""
    span = max(0, length - window)
    count = math.ceil(span / (window * 0.8)) + 1
    return [0] if count == 1 else [round(span * i / (count - 1)) for i in range(count)]


def to_input(crop):
    # PIL's luma conversion, like the browser and training; grayscale copied to 3 channels.
    gray = np.asarray(crop.convert('L').resize((SIZE, SIZE), Image.BILINEAR), dtype=np.float32) / 255
    channels = [(gray - MEAN[c]) / STD[c] for c in range(3)]
    return np.stack(channels)[None].astype(np.float32)


def softmax(logits):
    e = np.exp(logits - logits.max())
    return e / e.sum()


def scan_folder(folder, session, codes):
    index_path = PUBLIC / folder / 'index.json'
    if not index_path.exists():
        return {}
    name = session.get_inputs()[0].name
    scans = {}
    for site_id, entry in json.loads(index_path.read_text()).items():
        image = Image.open(PUBLIC / folder / entry['file']).convert('RGB')
        window = round(WINDOW_M / entry['metersPerPixel'])
        windows = []
        for y in positions(image.height, window):
            for x in positions(image.width, window):
                probs = softmax(session.run(None, {name: to_input(image.crop((x, y, x + window, y + window)))})[0][0])
                assert len(probs) == len(codes), f'model has {len(probs)} classes, site expects {len(codes)}'
                windows.append({'x': x, 'y': y, 'size': window, 'p': [round(float(v), 3) for v in probs]})
        scans[site_id] = windows
        best = max(windows, key=lambda w: max(w['p']))
        print(f"{folder}/{site_id}: {len(windows)} windows, strongest {codes[int(np.argmax(best['p']))]} {max(best['p']):.0%}")
    return scans


def main():
    codes = class_codes()
    session = ort.InferenceSession(str(MODEL), providers=['CPUExecutionProvider'])
    out = {
        'classes': codes,
        'windowMeters': WINDOW_M,
        'sites': scan_folder('earth', session, codes),
        'targets': scan_folder('targets', session, codes),
    }
    (PUBLIC / 'earth' / 'scan.json').write_text(json.dumps(out, separators=(',', ':')))
    print(f"scan.json: {len(out['sites'])} Earth sites, {len(out['targets'])} targets")


if __name__ == '__main__':
    main()
