"""Builds src/data/compare.ts from the sourced data in analysis/data.

Run from the repo root:  python3 analysis/build_compare_data.py
Inputs (see analysis/README.md for how each was made):
  data/power.csv           NASA POWER climatology 2001-2020 per Earth site
  data/dem.csv             ASTER GDEM elevation, slope and relief per Earth site
  data/moon_centroids.json Artemis III region centres (mean of published landing sites)
"""

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'analysis' / 'data'

power = {r['id']: r for r in csv.DictReader(open(DATA / 'power.csv'))}
dem = {r['id']: r for r in csv.DictReader(open(DATA / 'dem.csv'))}
moon_centroids = json.load(open(DATA / 'moon_centroids.json'))

# Existing analog sites: name, country, coordinates and first source come from src/data/analogs.ts.
analogs_ts = (ROOT / 'src' / 'data' / 'analogs.ts').read_text()
existing = {}
for block in re.split(r"\n  \{\n    id: ", analogs_ts[analogs_ts.index('export const ANALOG_SITES'):])[1:]:
    sid = re.match(r"'([^']+)'", block).group(1)
    get = lambda key: re.search(key + r":\s*\n?\s*'((?:[^'\\]|\\.)*)'", block).group(1)
    num = lambda key: float(re.search(key + r':\s*(-?[\d.]+)', block).group(1))
    source = re.search(r"url: '(https?://[^']+)'", block[block.index('sources'):]).group(1)
    existing[sid] = dict(name=get('name'), country=get('country'), lat=num('lat'), lon=num('lon'), source=source)

# Material and landform tags, taken from each site's sourced description (analogs.ts `why`, or the source below).
EARTH = [
    # id, analogFor, materials, landforms, (name, country, lat, lon, source) for sites not in analogs.ts
    ('la-joya', 'Mars', ['sand'], ['dunes'], None),
    ('white-sands', 'Mars', ['sand', 'sulfate'], ['dunes'], None),
    ('namib', 'Mars', ['sand'], ['dunes'], None),
    ('mdrs-hanksville', 'Mars', ['clay', 'sandstone'], ['lake-sediment'], None),
    ('wadi-rum', 'Mars', ['sandstone', 'sand'], [], None),
    ('green-river', 'Mars', ['sandstone'], ['channel'], None),
    ('qaidam', 'Mars', ['salt'], [], None),
    ('channeled-scablands', 'Mars', [], ['channel'], None),
    ('tuktoyaktuk', 'Mars', ['ice'], [], None),
    ('garwood-valley', 'Mars', ['ice'], [], None),
    ('taylor-valley', 'Mars', ['ice'], [], None),
    ('blackhawk', 'Mars', [], ['landslide'], None),
    ('meteor-crater', 'Mars', [], ['impact'], None),
    ('haughton', 'Mars', [], ['impact'], None),
    ('lonar', 'Mars', ['basalt'], ['impact'], None),
    ('henbury', 'Mars', [], ['impact'], None),
    ('atacama-yungay', 'Mars', ['salt'], [], None),
    ('salar-de-uyuni', 'Mars', ['salt'], [], None),
    ('holuhraun', 'Mars', ['basalt'], [], None),
    ('beacon-valley', 'Mars', ['ice'], ['polygons'], None),
    ('mistastin', 'Moon', ['anorthosite'], ['impact'],
     ('Mistastin Lake impact structure', 'Canada (Labrador)', 55.88, -63.30,
      'https://www.researchgate.net/publication/241208537_Mistastin_Impact_Structure_Labrador_A_Geological_Analogue_for_Lunar_Highland_Craters')),
    ('ries', 'Moon', [], ['impact'],
     ('Nördlinger Ries crater', 'Germany', 48.88, 10.58, 'https://blogs.esa.int/caves/2017/09/18/the-astronauts-are-back/')),
    ('lofoten', 'Moon', ['anorthosite'], [],
     ('Lofoten anorthosite', 'Norway', 68.10, 13.50, 'https://blogs.esa.int/caves/2025/07/28/astronauts-learn-moon-geology-in-a-fjord/')),
    ('craters-of-the-moon', 'Moon', ['basalt'], [],
     ('Craters of the Moon lava field', 'USA (Idaho)', 43.46, -113.51,
      'https://www.nps.gov/crmo/learn/historyculture/space-exploration-research-and-astronaut-training.htm')),
    ('lanzarote-corona', 'Mars', ['basalt'], ['lava-tube'],
     ('La Corona lava tube, Lanzarote', 'Spain', 29.10, -13.50, 'https://pubmed.ncbi.nlm.nih.gov/41572783/')),
]

JGR = 'https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2025JE009434'
LPI_HIGHLANDS = 'https://www.hou.usra.edu/meetings/lpsc2020/pdf/2867.pdf'
# name, accessible cold trap (< 110 K) from a landing site (Wueller et al., JGR Planets 2025/2026).
# Nobile Rim 2: the paper only reports PSRs that "may maintain surface temperatures below 125 K".
MOON = [('Peak near Cabeus B', False), ('Haworth', True), ('Malapert Massif', False), ('Mons Mouton Plateau', True),
        ('Mons Mouton', True), ('Nobile Rim 1', False), ('Nobile Rim 2', False), ('de Gerlache Rim 2', False),
        ('Slater Plain', True)]
# id, name, lat, lon, materials, landforms, reachable ice, note, sources, sourced measurements.
# Slopes only when measured over hundreds of metres, like the Earth slopes (landing limits over
# 2–5 m are not comparable); day–night swing is near-surface air temperature, like NASA POWER's.
MARS = [
    ('jezero', 'Jezero Crater', 18.44, 77.45, ['clay', 'carbonate'], ['lake-sediment'], False,
     'Perseverance landing site (Octavia E. Butler Landing). Day–night swing: one sample day (sols 43–44), '
     'high −22 °C, low −83 °C, measured by MEDA.',
     ['https://www.esa.int/ESA_Multimedia/Images/2022/08/Water-rich_minerals_at_Jezero_Crater',
      'https://en.wikipedia.org/wiki/Octavia_E._Butler_Landing',
      'https://www.jpl.nasa.gov/news/nasas-first-weather-report-from-jezero-crater-on-mars/'],
     {'dailyRangeC': 61}),
    ('gale', 'Gale Crater', -4.5895, 137.4417, ['clay'], ['lake-sediment'], False,
     'Curiosity landing site (Bradbury Landing). Day–night swing: daily highs about 0 °C and lows about '
     '−70 °C, measured by REMS.',
     ['https://www.jpl.nasa.gov/news/nasas-curiosity-rover-finds-patches-of-rock-record-erased-revealing-clues/',
      'https://en.wikipedia.org/wiki/Bradbury_Landing',
      'https://www.jpl.nasa.gov/images/pia16913-steady-temperatures-at-mars-gale-crater/'],
     {'dailyRangeC': 70}),
    ('oxia-planum', 'Oxia Planum', 18.20, -24.55, ['clay'], ['lake-sediment'], False,
     'Centre of the ExoMars Rosalind Franklin landing area (18.20°N, 335.45°E). The landing ellipse avoids '
     'slopes above 8° at the MOLA sub-kilometre scale.',
     ['https://pmc.ncbi.nlm.nih.gov/articles/PMC7987365/',
      'https://www.tandfonline.com/doi/full/10.1080/17445647.2024.2302361'],
     {'slopeMaxDeg': 8}),
    ('victoria', 'Victoria Crater (Meridiani Planum)', -2.05, -5.50, ['sulfate', 'sandstone'], ['impact'], False,
     'Crater explored by the Opportunity rover.',
     ['https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2022JE007374',
      'https://en.wikipedia.org/wiki/Victoria_(crater)'],
     {}),
    ('arcadia', 'Arcadia Planitia', 39.8, -157.9, ['ice'], [], True,
     'Candidate human landing site AP-1 (39.8°N, 202.1°E), with evidence of near-surface ice.',
     ['https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2024JE008724'],
     {}),
]


def ts(value):
    return json.dumps(value, ensure_ascii=False)


ON_WATER = {'tuktoyaktuk', 'lonar', 'mistastin'}
earth_rows = []
for sid, analog_for, materials, landforms, extra in EARTH:
    name, country, lat, lon, source = extra or tuple(existing[sid][k] for k in ('name', 'country', 'lat', 'lon', 'source'))
    p, d = power[sid], dem[sid]
    row = {
        'id': sid, 'name': name, 'country': country, 'lat': lat, 'lon': lon, 'analogFor': analog_for,
        'meanTempC': float(p['t2m_ann_c']), 'dailyRangeC': float(p['t2m_range_ann_c']),
        'precipMmYr': round(float(p['prec_mm_per_day_ann']) * 365),
        'elevationM': int(d['site_elev_m']),
        # Coordinates on a lake or the sea: the elevation model measures the water, not the terrain.
        'slopeDeg': None if sid in ON_WATER else float(d['slope_deg']),
        'reliefM': None if sid in ON_WATER else int(d['relief_m']),
        'materials': materials, 'landforms': landforms, 'source': source,
    }
    if d['flag']:
        row['note'] = d['flag']
    earth_rows.append(row)

targets = []
for i, (name, cold_trap) in enumerate(MOON, 1):
    lat, lon, n = moon_centroids[name]
    targets.append({
        'id': f'moon-{i}', 'name': name, 'body': 'Moon', 'lat': lat, 'lon': lon,
        'materials': ['anorthosite'], 'landforms': ['impact'], 'slopeMaxDeg': 5, 'precipMmYr': 0, 'iceAccess': cold_trap,
        'note': f'Artemis III candidate region. Centre = mean of {n} published landing sites; most landing sites have slopes under 5°.',
        'sources': [JGR, LPI_HIGHLANDS],
    })
for sid, name, lat, lon, materials, landforms, ice, note, sources, measured in MARS:
    # No rain falls on Mars today. Site temperatures are left out until a sourced local value is added:
    # the planet-wide average is not a site value.
    targets.append({
        'id': f'mars-{sid}', 'name': name, 'body': 'Mars', 'lat': lat, 'lon': lon,
        'materials': materials, 'landforms': landforms, 'precipMmYr': 0, 'iceAccess': ice,
        **measured, 'note': note, 'sources': sources,
    })

out = f'''// Generated by analysis/build_compare_data.py from analysis/data. Do not edit by hand.
import type {{ EarthSite, Target }} from '../lib/similarity'

export const EARTH_SITES: EarthSite[] = {ts(earth_rows)}

export const TARGETS: Target[] = {ts(targets)}
'''
(ROOT / 'src' / 'data' / 'compare.ts').write_text(out)
print(f'{len(earth_rows)} Earth sites, {len(targets)} targets')
