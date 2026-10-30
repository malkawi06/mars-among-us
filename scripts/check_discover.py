"""Temporary: compare the grid with the 25 Earth sites measured before, and draw quick maps."""
import json, subprocess
import numpy as np
from PIL import Image

d = json.load(open('public/discover/cells.json'))
rows, cols = np.array(d['row']), np.array(d['col'])
sites = json.loads(subprocess.check_output(['node', '--experimental-strip-types', '--no-warnings', '-e',
    "import('./src/data/compare.ts').then(m => console.log(JSON.stringify(m.EARTH_SITES)))"]))
lines = ['site | grid cell vs measured: mean temp, day-night, rain mm/yr, elevation, slope | rock']
for s in sites:
    r, c = int(round((89.75 - s['lat']) / 0.5)), int(round((s['lon'] + 179.75) / 0.5))
    k = np.nonzero((rows == r) & (cols == c))[0]
    if not len(k):
        lines.append(f"{s['name']}: no land cell"); continue
    k = k[0]
    g = lambda key, sc=1: None if d[key][k] is None else d[key][k] / sc
    lines.append(f"{s['name'][:38]:38} T {g('meanTempC10',10)} vs {s['meanTempC']} | R {g('dailyRangeC10',10)} vs {s['dailyRangeC']} | "
                 f"P {g('precipMmYr')} vs {s['precipMmYr']} | E {g('elevationM')} vs {s['elevationM']} | S {g('slopeDeg10',10)} vs {s['slopeDeg']} | {d['rock'][k]} {s['materials']}")
open('public/discover/check.txt', 'w').write('\n'.join(lines))

def draw(key, scale, lo, hi, name):
    img = np.zeros((360, 720, 3), np.uint8) + 20
    v = np.array([np.nan if x is None else x / scale for x in d[key]], float)
    t = np.clip((v - lo) / (hi - lo), 0, 1)
    rgb = np.stack([255 * t, 120 * (1 - abs(t - .5) * 2), 255 * (1 - t)], 1)
    rgb[np.isnan(v)] = [90, 90, 90]
    img[rows, cols] = rgb.astype(np.uint8)
    Image.fromarray(img).resize((1440, 720), Image.NEAREST).save(f'public/discover/map-{name}.png')
draw('meanTempC10', 10, -30, 30, 'temp')
draw('dailyRangeC10', 10, 0, 20, 'range')
draw('precipMmYr', 1, 0, 1000, 'rain')
draw('slopeDeg10', 10, 0, 10, 'slope')
