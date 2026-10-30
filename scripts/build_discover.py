"""
Builds the Discover grid: every 0.5° land cell on Earth with the same values the Compare page
scores, so the browser can rank the whole planet against a Moon or Mars target.

Sources (all open, no login):
- NASA POWER, MERRA-2 climatology (annual): T2M mean temperature, T2M_RANGE day-night swing,
  PRECTOTCORR precipitation, WS10M wind. https://power.larc.nasa.gov (AWS: s3://nasa-power)
- Terrain Tiles on AWS (terrarium, zoom 7, about 1.2 km pixels at the equator): elevation,
  slope (Horn's method) and relief. https://registry.opendata.aws/terrain-tiles/
- GLiM, Global Lithological Map, 0.5° grid (Hartmann & Moosdorf 2012), CC BY 3.0:
  dominant rock class per cell. https://doi.pangaea.de/10.1594/PANGAEA.788537

Output: public/discover/cells.json, one entry per land cell, in columns.
"""
import io
import json
import math
import os
import urllib.request
import zipfile
from concurrent.futures import ThreadPoolExecutor

import numpy as np
import xarray as xr
from PIL import Image

OUT = 'public/discover'
UA = {'User-Agent': 'mars-among-us discover grid'}
ZOOM = 7


def get(url, timeout=180):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
        return r.read()


# --- GLiM: the 0.5° grid defines which cells are land ---------------------------------------------
z = zipfile.ZipFile(io.BytesIO(get('https://hdl.handle.net/10013/epic.39939.d001')))
asc = z.read('glim_wgs84_0point5deg.txt.asc').decode('latin-1').split('\n')
glim = np.array([[int(v) for v in row.split()] for row in asc[6:] if row.strip()], dtype=np.int16)
assert glim.shape == (360, 720), glim.shape  # row 0 = 89.75°N, column 0 = 179.75°W
# Class codes 1..16 as listed in Classnames.txt; 11 = water bodies, 15 = no data.
CODES = {1: 'su', 2: 'vb', 3: 'ss', 4: 'pb', 5: 'sm', 6: 'sc', 7: 'va', 8: 'mt', 9: 'pa',
         10: 'vi', 11: 'wb', 12: 'py', 13: 'pi', 14: 'ev', 15: 'nd', 16: 'ig'}
land = (glim > 0) & (glim != 11) & (glim != 15)
rows, cols = np.nonzero(land)
lat = 89.75 - rows * 0.5
lon = -179.75 + cols * 0.5
print('land cells', len(rows))

# --- NASA POWER climatology, annual values (time index 13) ----------------------------------------
ds = xr.open_zarr('https://nasa-power.s3.amazonaws.com/merra2/spatial/power_merra2_climatology_spatial_utc.zarr',
                  consolidated=True)
annual = ds[['T2M', 'T2M_RANGE', 'PRECTOTCORR', 'WS10M']].sel(time=13).load()
pick = dict(lat=xr.DataArray(lat, dims='cell'), lon=xr.DataArray(lon, dims='cell'))
clim = annual.sel(**pick, method='nearest')
mean_temp = clim['T2M'].values
daily_range = clim['T2M_RANGE'].values
precip = clim['PRECTOTCORR'].values * 365.25  # mm/day to mm/year
wind = clim['WS10M'].values

# --- Elevation, slope and relief from terrain tiles -----------------------------------------------
n = 2 ** ZOOM


def tile_of(lat_deg, lon_deg):
    x = int((lon_deg + 180) / 360 * n)
    y = int((1 - math.asinh(math.tan(math.radians(lat_deg))) / math.pi) / 2 * n)
    return min(max(x, 0), n - 1), min(max(y, 0), n - 1)


# Web Mercator tiles stop at 85.05°; cells beyond keep no terrain values.
tiles = set()
for la, lo in zip(lat, lon):
    if abs(la) > 85:
        continue
    for dla in (-0.25, 0.25):
        for dlo in (-0.25, 0.25):
            tiles.add(tile_of(la + dla, lo + dlo))
print('tiles', len(tiles))

cell_index = -np.ones((360, 720), dtype=np.int64)
cell_index[rows, cols] = np.arange(len(rows))
SLOPE_BINS = np.arange(0, 91, 0.5)
slope_hist = np.zeros((len(rows), len(SLOPE_BINS) - 1), dtype=np.int32)
elev_sum = np.zeros(len(rows))
elev_n = np.zeros(len(rows))
elev_min = np.full(len(rows), np.inf)
elev_max = np.full(len(rows), -np.inf)


def fetch(xy):
    x, y = xy
    try:
        png = get(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{ZOOM}/{x}/{y}.png', timeout=60)
        rgb = np.asarray(Image.open(io.BytesIO(png)).convert('RGB'), dtype=np.float64)
        return x, y, rgb[..., 0] * 256 + rgb[..., 1] + rgb[..., 2] / 256 - 32768
    except Exception as e:  # a missing tile only leaves those cells without terrain values
        print('tile failed', xy, e)
        return x, y, None


with ThreadPoolExecutor(32) as pool:
    for done, (x, y, elev) in enumerate(pool.map(fetch, sorted(tiles))):
        if done % 500 == 0:
            print('tiles done', done)
        if elev is None:
            continue
        size = elev.shape[0]
        # Pixel centres in latitude/longitude.
        px = (x + (np.arange(size) + 0.5) / size) / n * 360 - 180
        py = np.degrees(np.arctan(np.sinh(np.pi * (1 - 2 * (y + (np.arange(size) + 0.5) / size) / n))))
        # Ground size of a pixel (m): Web Mercator pixels shrink with the cosine of latitude.
        ground = 40075016.686 / (n * size) * np.cos(np.radians(py))[:, None] * np.ones((1, size))
        e = np.pad(elev, 1, mode='edge')
        dzdx = ((e[:-2, 2:] + 2 * e[1:-1, 2:] + e[2:, 2:]) - (e[:-2, :-2] + 2 * e[1:-1, :-2] + e[2:, :-2])) / (8 * ground)
        dzdy = ((e[2:, :-2] + 2 * e[2:, 1:-1] + e[2:, 2:]) - (e[:-2, :-2] + 2 * e[:-2, 1:-1] + e[:-2, 2:])) / (8 * ground)
        slope = np.degrees(np.arctan(np.hypot(dzdx, dzdy)))
        r = np.clip(((89.75 - py) / 0.5).round().astype(int), 0, 359)
        c = np.clip(((px + 179.75) / 0.5).round().astype(int), 0, 719)
        idx = cell_index[r[:, None], c[None, :]]
        ok = (idx >= 0) & (elev > -500)  # skip sea floor that a coastal cell's tile reaches into
        if not ok.any():
            continue
        i = idx[ok]
        ev = elev[ok]
        sb = np.clip(np.digitize(slope[ok], SLOPE_BINS) - 1, 0, len(SLOPE_BINS) - 2)
        np.add.at(slope_hist, (i, sb), 1)
        np.add.at(elev_sum, i, ev)
        np.add.at(elev_n, i, 1)
        np.minimum.at(elev_min, i, ev)
        np.maximum.at(elev_max, i, ev)

# Median slope per cell from its histogram.
cum = slope_hist.cumsum(axis=1)
total = cum[:, -1]
median_bin = (cum >= (total[:, None] / 2)).argmax(axis=1)
slope_median = np.where(total > 0, SLOPE_BINS[median_bin] + 0.25, np.nan)
elevation = np.where(elev_n > 0, elev_sum / np.maximum(elev_n, 1), np.nan)
relief = np.where(elev_n > 0, elev_max - elev_min, np.nan)


def col(a, scale=1):
    return [None if not np.isfinite(v) else int(round(float(v) * scale)) for v in a]


os.makedirs(OUT, exist_ok=True)
json.dump({
    'about': 'Every 0.5° land cell. Temperatures and slope are stored x10. See scripts/build_discover.py.',
    'cellDeg': 0.5,
    'row': rows.tolist(),
    'col': cols.tolist(),
    'meanTempC10': col(mean_temp, 10),
    'dailyRangeC10': col(daily_range, 10),
    'precipMmYr': col(precip),
    'windMs10': col(wind, 10),
    'elevationM': col(elevation),
    'slopeDeg10': col(slope_median, 10),
    'reliefM': col(relief),
    'rock': [CODES[int(v)] for v in glim[rows, cols]],
}, open(f'{OUT}/cells.json', 'w'), separators=(',', ':'))
print('wrote', os.path.getsize(f'{OUT}/cells.json'), 'bytes')
