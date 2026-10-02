"""Downloads a Sentinel-2 cloudless satellite image of every Earth analog site into public/earth/.

The Analyze page scans these images with the landform model to mark areas that look like the
uploaded Mars image. Serving them from the site itself avoids cross-origin limits and keeps the
demo working offline. Run before `npm run build` (the deploy workflow does): needs Pillow.

Imagery: Sentinel-2 cloudless 2024 by EOX IT Services GmbH (contains modified Copernicus
Sentinel data 2024), CC BY-NC-SA 4.0.
"""

import io
import json
import math
import re
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'earth'
TILE_URL = 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg'
TILE = 256
SIZE = 768  # output image is SIZE x SIZE pixels, centred on the site
TARGET_M_PER_PX = 8  # close to the ~6 m/px of the training images
EQUATOR_M_PER_PX_Z0 = 156543.03392


def sites():
    """(id, lat, lon) of every site in src/data/analogs.ts."""
    text = (ROOT / 'src' / 'data' / 'analogs.ts').read_text()
    body = text[text.index('export const ANALOG_SITES'):]
    for block in re.split(r"\n  \{\n    id: ", body)[1:]:
        sid = re.match(r"'([^']+)'", block).group(1)
        lat = float(re.search(r'lat: (-?[\d.]+)', block).group(1))
        lon = float(re.search(r'lon: (-?[\d.]+)', block).group(1))
        yield sid, lat, lon


def fetch_tile(z, x, y):
    request = urllib.request.Request(TILE_URL.format(z=z, x=x, y=y), headers={'User-Agent': 'mars-among-us'})
    with urllib.request.urlopen(request, timeout=30) as response:
        return Image.open(io.BytesIO(response.read())).convert('RGB')


def render(lat, lon):
    cos_lat = math.cos(math.radians(lat))
    zoom = min(16, max(1, round(math.log2(EQUATOR_M_PER_PX_Z0 * cos_lat / TARGET_M_PER_PX))))
    world = TILE * 2 ** zoom
    # Web Mercator pixel position of the site.
    px = (lon + 180) / 360 * world
    py = (1 - math.log(math.tan(math.radians(lat)) + 1 / cos_lat) / math.pi) / 2 * world
    left, top = int(px - SIZE / 2), int(py - SIZE / 2)
    canvas = Image.new('RGB', (SIZE, SIZE))
    for ty in range(top // TILE, (top + SIZE - 1) // TILE + 1):
        for tx in range(left // TILE, (left + SIZE - 1) // TILE + 1):
            canvas.paste(fetch_tile(zoom, tx % 2 ** zoom, ty), (tx * TILE - left, ty * TILE - top))
    return canvas, zoom, EQUATOR_M_PER_PX_Z0 * cos_lat / 2 ** zoom


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    index = {}
    for sid, lat, lon in sites():
        try:
            image, zoom, m_per_px = render(lat, lon)
        except Exception as error:  # one missing site must not stop the others
            print(f'skip {sid}: {error}')
            continue
        image.save(OUT / f'{sid}.jpg', quality=85)
        index[sid] = {'file': f'{sid}.jpg', 'size': SIZE, 'zoom': zoom, 'metersPerPixel': round(m_per_px, 2)}
        print(f'{sid}: zoom {zoom}, {m_per_px:.1f} m/px, {SIZE * m_per_px / 1000:.1f} km across')
    (OUT / 'index.json').write_text(json.dumps(index, indent=2))
    print(f'{len(index)} images in {OUT}')


if __name__ == '__main__':
    main()
