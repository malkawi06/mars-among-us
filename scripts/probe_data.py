"""Temporary: ask OpenAlex where open copies of Wueller et al. 2025 are hosted."""
import json, urllib.request
lines = []
def say(*a): lines.append(' '.join(str(x) for x in a))
req = urllib.request.Request('https://api.openalex.org/works/doi:10.1029/2025JE009434', headers={'User-Agent': 'mars-among-us research'})
w = json.loads(urllib.request.urlopen(req, timeout=90).read())
say('oa', w.get('open_access'))
for loc in w.get('locations') or []:
    say('loc', loc.get('pdf_url'), loc.get('landing_page_url'), (loc.get('source') or {}).get('display_name'), loc.get('version'))
open('challenge-snapshot/jgr2.txt', 'w').write('\n'.join(lines))
