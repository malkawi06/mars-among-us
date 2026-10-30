"""Temporary: second look at POWER on S3, NEO download links and the GLiM files."""
import json, re, urllib.request

OUT = 'challenge-snapshot/probe2.txt'
lines = []
def say(*a): lines.append(' '.join(str(x) for x in a))
def get(url, n=None):
    req = urllib.request.Request(url, headers={'User-Agent': 'mars-among-us data check'})
    with urllib.request.urlopen(req, timeout=90) as r:
        return r.status, r.headers.get('Content-Type'), (r.read(n) if n else r.read())

# POWER on S3: folder tree two levels down.
def s3list(prefix):
    st, ct, body = get(f'https://nasa-power.s3.amazonaws.com/?list-type=2&max-keys=200&delimiter=/&prefix={prefix}')
    t = body.decode()
    return re.findall(r'<Prefix>([^<]+)</Prefix>', t)[1:], re.findall(r'<Key>([^<]+)</Key>', t)
try:
    top, keys = s3list('')
    say('POWER top:', top, keys)
    for p in top:
        sub, k = s3list(p)
        say(' ', p, '->', sub[:30], k[:10])
        for q in sub[:6]:
            sub2, k2 = s3list(q)
            say('    ', q, '->', sub2[:20], k2[:10])
except Exception as e:
    say('POWER S3 error', e)

# NEO: the dataset page, around any download or CSV mention.
try:
    st, ct, body = get('https://neo.gsfc.nasa.gov/view.php?datasetId=MOD_LSTD_M')
    t = body.decode('utf-8', 'replace')
    say('NEO page length', len(t))
    for m in re.finditer(r'(?i)(csv|download|RenderData|si=|archive\.php|\.tif|floating)', t):
        say('  ', t[max(0, m.start() - 160): m.start() + 160].replace('\n', ' '))
        if len(lines) > 80: break
except Exception as e:
    say('NEO error', e)

# GLiM: files listed in the JSON-LD.
try:
    st, ct, body = get('https://doi.pangaea.de/10.1594/PANGAEA.788537?format=metadata_jsonld')
    d = json.loads(body)
    say('GLiM name:', d.get('name'))
    say('GLiM license:', d.get('license'))
    dist = d.get('distribution') or []
    dist = dist if isinstance(dist, list) else [dist]
    for x in dist: say('  file:', x.get('contentUrl') or x.get('url'), x.get('encodingFormat'), x.get('contentSize'))
    say('GLiM raw keys:', list(d.keys()))
except Exception as e:
    say('GLiM error', e)
open(OUT, 'w').write('\n'.join(lines))
