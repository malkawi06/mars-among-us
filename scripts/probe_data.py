"""Temporary: what is inside the GLiM 0.5 degree zip, and the POWER climatology time axis."""
import io, json, zipfile, urllib.request
import numpy as np
OUT = 'challenge-snapshot/probe4.txt'
lines = []
def say(*a): lines.append(' '.join(str(x) for x in a))
def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'mars-among-us data check'})
    with urllib.request.urlopen(req, timeout=180) as r:
        return r.read()
z = zipfile.ZipFile(io.BytesIO(get('https://hdl.handle.net/10013/epic.39939.d001')))
for info in z.infolist():
    say('GLiM file', info.filename, info.file_size)
for info in z.infolist():
    data = z.read(info.filename)
    head = data[:1500].decode('latin-1', 'replace')
    say(f'--- {info.filename} head ---\n{head}\n')
# POWER: time axis and one value at a known place (Amman, 31.95N 35.93E).
import xarray as xr
ds = xr.open_zarr('https://nasa-power.s3.amazonaws.com/merra2/spatial/power_merra2_climatology_spatial_utc.zarr', consolidated=True)
say('POWER time', ds['time'].values.tolist())
say('POWER lat', float(ds.lat.min()), float(ds.lat.max()), 'lon', float(ds.lon.min()), float(ds.lon.max()))
p = ds[['T2M', 'T2M_RANGE', 'PRECTOTCORR', 'WS10M']].sel(lat=31.95, lon=35.93, method='nearest').load()
for v in p: say('Amman', v, p[v].values.round(2).tolist())
say('attrs', {k: str(v)[:200] for k, v in ds.attrs.items()})
open(OUT, 'w').write('\n'.join(lines))
