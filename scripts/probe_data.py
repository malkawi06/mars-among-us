"""Temporary: check which global datasets are reachable without a login, and how they look."""
import json, re, urllib.request, urllib.parse

OUT = 'challenge-snapshot/probe.txt'
lines = []
def say(*a): lines.append(' '.join(str(x) for x in a))

def get(url, n=None, head=False):
    req = urllib.request.Request(url, method='HEAD' if head else 'GET', headers={'User-Agent': 'mars-among-us data check'})
    with urllib.request.urlopen(req, timeout=60) as r:
        body = b'' if head else (r.read(n) if n else r.read())
        return r.status, r.headers.get('Content-Type'), r.headers.get('Content-Length'), body

def probe(name, url, n=3000, show=600):
    try:
        st, ct, cl, body = get(url, n)
        say(f'## {name}\nURL {url}\nstatus {st} type {ct} length {cl}\n{body[:show].decode("utf-8", "replace")}\n')
        return body
    except Exception as e:
        say(f'## {name}\nURL {url}\nERROR {e}\n')

# 1. NASA Earth Observations (NEO): global monthly grids, CSV, no login.
for ds in ['MOD_NDVI_M', 'MOD_LSTD_M', 'MOD_LSTN_M', 'MODAL2_M_AER_OD', 'MOD10C1_M_SNOW', 'GPM_3IMERGM']:
    body = probe(f'NEO {ds} page', f'https://neo.gsfc.nasa.gov/view.php?datasetId={ds}', n=200000, show=0)
    if body:
        txt = body.decode('utf-8', 'replace')
        sis = sorted(set(re.findall(r'si=(\d+)', txt)))[:5]
        csv = sorted(set(re.findall(r'RenderData\?[^"\']+', txt)))[:3]
        say(f'   si ids {sis}  renderdata {csv}')
        if sis:
            probe(f'NEO {ds} CSV 1 degree', f'https://neo.gsfc.nasa.gov/servlet/RenderData?si={sis[-1]}&cs=rgb&format=CSV&width=360&height=180', n=4000, show=400)

# 2. NASA POWER climatology for a region (the API caps the area), and the open S3 store.
probe('POWER regional climatology', 'https://power.larc.nasa.gov/api/temporal/climatology/regional?parameters=T2M,T2M_RANGE,PRECTOTCORR&community=RE&longitude-min=30&longitude-max=40&latitude-min=20&latitude-max=30&format=JSON', n=3000)
probe('POWER S3 listing', 'https://nasa-power.s3.amazonaws.com/?list-type=2&max-keys=40&delimiter=/', n=6000, show=3000)

# 3. Terrain tiles (SRTM-based elevation) at low zoom for slope and relief.
try:
    st, ct, cl, _ = get('https://s3.amazonaws.com/elevation-tiles-prod/terrarium/6/36/25.png', head=True)
    say(f'## Terrain tiles z6\nstatus {st} type {ct} length {cl}\n')
except Exception as e:
    say(f'## Terrain tiles z6\nERROR {e}\n')

# 4. Global lithology (GLiM) on PANGAEA, for rock type.
probe('GLiM PANGAEA', 'https://doi.pangaea.de/10.1594/PANGAEA.788537', n=60000, show=0)
body = probe('GLiM PANGAEA metadata', 'https://doi.pangaea.de/10.1594/PANGAEA.788537?format=metadata_jsonld', n=20000, show=2500)

open(OUT, 'w').write('\n'.join(lines))
