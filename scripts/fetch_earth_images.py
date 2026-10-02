"""Downloads orbital images for the comparison features into public/earth/ and public/targets/.

- Earth analog sites (src/data/compare.ts EARTH_SITES): Sentinel-2 cloudless 2024 by EOX IT Services
  GmbH (contains modified Copernicus Sentinel data 2024), CC BY-NC-SA 4.0.
- Mars targets: Global CTX Mosaic of Mars V01, NASA/JPL/MSSS/The Murray Lab (free use for all purposes).
- Moon targets: LRO LROC NAC south-pole mosaic (LMMP/USGS, via NASA Moon Trek); covers 85.5°S–90°S only.

Each image is 768 x 768 px at roughly 8 m/px, close to the ~6 m/px of the model's training images.
The Analyze and Compare pages scan them with the landform model (scripts/scan_earth_images.py).
Serving them from the site avoids cross-origin limits and keeps the demo working offline.
Run before `npm run build` (the deploy workflow does): needs Pillow.
"""

import io
import json
import math
import re
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SIZE = 768  # output images are SIZE x SIZE pixels, centred on the site
TARGET_M_PER_PX = 8
TILE = 256

EOX_URL = 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg'
EARTH_M_PER_PX_Z0 = 156543.03392

CTX_URL = 'https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX1/MapServer/tile/{z}/{y}/{x}'
CTX_LEVEL = 12  # 0.3515625 / 2**12 degrees per pixel, about 5.1 m at the equator
CTX_DEG_PER_PX = 0.3515625 / 2**CTX_LEVEL
MARS_M_PER_DEG = 2 * math.pi * 3_396_190 / 360

NAC_URL = 'https://trek.nasa.gov/tiles/Moon/SP/LRO_NAC_AvgMosaic_SPole855_1mp/1.0.0/default/default028mm/{z}/{y}/{x}.png'
NAC_LEVEL = 10
NAC_M_PER_PX = 3.0578404017857101e7 * 0.00028 / 2**NAC_LEVEL  # from the WMTS scale denominator
NAC_ORIGIN = -1_095_930  # top-left corner of the tile matrix, metres
NAC_NORTH_LIMIT = -85.5
MOON_RADIUS = 1_737_400


def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'mars-among-us'})
    with urllib.request.urlopen(request, timeout=30) as response:
        return Image.open(io.BytesIO(response.read())).convert('RGB')


def mosaic(url, z, left, top, width, height):
    """Stitches the tiles covering a pixel window (left, top, width, height) of a tile grid."""
    canvas = Image.new('RGB', (width, height))
    for ty in range(top // TILE, (top + height - 1) // TILE + 1):
        for tx in range(left // TILE, (left + width - 1) // TILE + 1):
            canvas.paste(fetch(url.format(z=z, x=tx, y=ty)), (tx * TILE - left, ty * TILE - top))
    return canvas


def earth_image(lat, lon):
    cos_lat = math.cos(math.radians(lat))
    zoom = min(16, max(1, round(math.log2(EARTH_M_PER_PX_Z0 * cos_lat / TARGET_M_PER_PX))))
    world = TILE * 2**zoom
    px = (lon + 180) / 360 * world
    py = (1 - math.log(math.tan(math.radians(lat)) + 1 / cos_lat) / math.pi) / 2 * world
    image = mosaic(EOX_URL, zoom, int(px - SIZE / 2), int(py - SIZE / 2), SIZE, SIZE)
    return image, EARTH_M_PER_PX_Z0 * cos_lat / 2**zoom


def mars_image(lat, lon):
    # Equirectangular tiles: a ground square spans more degrees of longitude than of latitude.
    span_m = SIZE * TARGET_M_PER_PX
    height = round(span_m / MARS_M_PER_DEG / CTX_DEG_PER_PX)
    width = round(height / math.cos(math.radians(lat)))
    px, py = (lon + 180) / CTX_DEG_PER_PX, (90 - lat) / CTX_DEG_PER_PX
    image = mosaic(CTX_URL, CTX_LEVEL, int(px - width / 2), int(py - height / 2), width, height)
    return image.resize((SIZE, SIZE), Image.LANCZOS), span_m / SIZE


def moon_image(lat, lon):
    if lat > NAC_NORTH_LIMIT:
        raise ValueError(f'outside the south-pole mosaic (north of {NAC_NORTH_LIMIT}°)')
    # South polar stereographic, true scale at the pole (Snyder 1987): x = ρ sin λ, y = ρ cos λ.
    rho = 2 * MOON_RADIUS * math.tan(math.pi / 4 + math.radians(lat) / 2)
    x, y = rho * math.sin(math.radians(lon)), rho * math.cos(math.radians(lon))
    px, py = (x - NAC_ORIGIN) / NAC_M_PER_PX, (-NAC_ORIGIN - y) / NAC_M_PER_PX
    return mosaic(NAC_URL, NAC_LEVEL, int(px - SIZE / 2), int(py - SIZE / 2), SIZE, SIZE), NAC_M_PER_PX


def sites(array_name):
    """(id, body, lat, lon) of each entry of EARTH_SITES or TARGETS in src/data/compare.ts."""
    text = (ROOT / 'src' / 'data' / 'compare.ts').read_text()
    start = text.index(f'export const {array_name}')
    end = text.find('export const', start + 1)
    for block in re.split(r'\n  \{\n', text[start:end if end > 0 else None])[1:]:
        sid = re.search(r"id: '([^']+)'", block).group(1)
        body = re.search(r"body: '(\w+)'", block)
        lat = float(re.search(r'\blat: (-?[\d.]+)', block).group(1))
        lon = float(re.search(r'\blon: (-?[\d.]+)', block).group(1))
        yield sid, body.group(1) if body else 'Earth', lat, lon


def save_all(entries, render_for, folder):
    out = ROOT / 'public' / folder
    out.mkdir(parents=True, exist_ok=True)
    index = {}
    for sid, body, lat, lon in entries:
        try:
            image, m_per_px = render_for(body)(lat, lon)
        except Exception as error:  # one missing site must not stop the others
            print(f'skip {sid}: {error}')
            continue
        image.save(out / f'{sid}.jpg', quality=85)
        index[sid] = {'file': f'{sid}.jpg', 'size': SIZE, 'metersPerPixel': round(m_per_px, 2)}
        print(f'{sid}: {m_per_px:.1f} m/px, {SIZE * m_per_px / 1000:.1f} km across')
    (out / 'index.json').write_text(json.dumps(index, indent=2))
    print(f'{len(index)} images in {out}')


def main():
    save_all(sites('EARTH_SITES'), lambda body: earth_image, 'earth')
    save_all(sites('TARGETS'), lambda body: mars_image if body == 'Mars' else moon_image, 'targets')


if __name__ == '__main__':
    main()
