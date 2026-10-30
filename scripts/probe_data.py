"""Temporary: variables and grid of the POWER climatology stores, and the GLiM 0.5 degree download."""
import json, urllib.request
OUT = 'challenge-snapshot/probe3.txt'
lines = []
def say(*a): lines.append(' '.join(str(x) for x in a))
def get(url, n=None):
    req = urllib.request.Request(url, headers={'User-Agent': 'mars-among-us data check'})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.status, r.headers, (r.read(n) if n else r.read())
for store in ['merra2/spatial/power_merra2_climatology_spatial_utc.zarr', 'imerg/spatial/power_imerg_climatology_spatial_utc.zarr']:
    try:
        st, h, body = get(f'https://nasa-power.s3.amazonaws.com/{store}/.zmetadata')
        meta = json.loads(body)['metadata']
        arrays = {k.split('/')[0]: v for k, v in meta.items() if k.endswith('/.zarray')}
        attrs = {k.split('/')[0]: v for k, v in meta.items() if k.endswith('/.zattrs')}
        say(f'## {store}: {len(arrays)} arrays')
        for name in sorted(arrays):
            a = arrays[name]
            if name in ('T2M', 'T2M_RANGE', 'T2M_MAX', 'T2M_MIN', 'PRECTOTCORR', 'PRECTOT', 'lat', 'lon', 'time', 'WS2M', 'WS10M', 'TS', 'ALLSKY_SFC_SW_DWN', 'RH2M') or len(arrays) < 15:
                say(f'  {name} shape {a["shape"]} chunks {a["chunks"]} dtype {a["dtype"]} units {attrs.get(name, {}).get("units")} long {attrs.get(name, {}).get("long_name")}')
        say('  first 60 names:', sorted(arrays)[:60])
    except Exception as e:
        say(f'## {store} error {e}')
try:
    st, h, body = get('https://hdl.handle.net/10013/epic.39939.d001', n=2000000)
    say('## GLiM download status', st, h.get('Content-Type'), h.get('Content-Length'), 'got bytes', len(body), 'starts', body[:4])
except Exception as e:
    say('## GLiM download error', e)
open(OUT, 'w').write('\n'.join(lines))
