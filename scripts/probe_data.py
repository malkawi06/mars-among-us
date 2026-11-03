"""Temporary: does the 2016 (CC BY 4.0) EOX layer serve tiles at the zooms we use?"""
import urllib.request
lines = []
for layer in ['s2cloudless_3857', 's2cloudless-2016_3857']:
    for z, x, y in [(2, 2, 1), (8, 152, 107), (12, 2436, 1717), (14, 9747, 6870)]:
        url = f'https://tiles.maps.eox.at/wmts/1.0.0/{layer}/default/g/{z}/{y}/{x}.jpg'
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'mars-among-us licence check'}), timeout=60) as r:
                b = r.read()
                lines.append(f'{layer} z{z}: {r.status} {r.headers.get("Content-Type")} {len(b)} bytes')
        except Exception as e:
            lines.append(f'{layer} z{z}: ERROR {e}')
open('challenge-snapshot/eox2016.txt', 'w').write('\n'.join(lines))
