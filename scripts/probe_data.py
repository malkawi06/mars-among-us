"""Temporary: licence of the EOX Sentinel-2 cloudless mosaics, and whether NASA GIBS tiles work as a replacement."""
import re, urllib.request
lines = []
def say(*a): lines.append(' '.join(str(x) for x in a))
UA = {'User-Agent': 'mars-among-us licence check'}
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
        return r.status, r.headers.get('Content-Type'), r.read()
def text(html):
    t = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', html, flags=re.S)
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', t))
for url in ['https://s2maps.eu/', 'https://cloudless.eox.at/', 'https://s2maps.eu/terms', 'https://eox.at/2024/03/sentinel-2-cloudless-2023/']:
    try:
        st, ct, b = get(url)
        t = text(b.decode('utf-8', 'replace'))
        say(f'## {url} {st} {len(t)} chars')
        for m in re.finditer(r'(?i)(licen[cs]e|CC BY|Creative Commons|non-?commercial|attribution)', t):
            say('   ...', t[max(0, m.start() - 220): m.end() + 220])
            if sum(1 for l in lines if l.startswith('   ...')) > 40: break
    except Exception as e:
        say(f'## {url} ERROR {e}')
# NASA GIBS: a true-colour tile (MODIS Terra corrected reflectance) and a Landsat/HLS layer list.
for url in ['https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2024-07-01/GoogleMapsCompatible_Level9/4/6/9.jpg',
            'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/2004-08-01/GoogleMapsCompatible_Level8/3/3/4.jpeg',
            'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml']:
    try:
        st, ct, b = get(url)
        say(f'## GIBS {url.split("/best/")[1][:80]} {st} {ct} {len(b)}')
        if url.endswith('.xml'):
            t = b.decode('utf-8', 'replace')
            ids = sorted(set(re.findall(r'<ows:Identifier>([^<]*(?:Landsat|HLS|Sentinel|TrueColor|Mosaic)[^<]*)</ows:Identifier>', t)))
            say('   layers:', ids[:60])
            for lid in [i for i in ids if 'HLS' in i or 'Landsat' in i][:6]:
                i = t.find(f'<ows:Identifier>{lid}</ows:Identifier>')
                block = t[i:i + 2500]
                say('   ', lid, re.findall(r'TileMatrixSet>([^<]+)<', block)[:2], re.findall(r'<Value>([^<]+)</Value>', block)[:3])
    except Exception as e:
        say(f'## GIBS ERROR {url} {e}')
open('challenge-snapshot/licence.txt', 'w').write('\n'.join(lines))
