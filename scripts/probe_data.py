"""Temporary: fetch Table A1 of Wueller et al. (JGR Planets, doi 10.1029/2025JE009434) to count landing sites per region."""
import json, re, urllib.request
OUT = 'challenge-snapshot/jgr.txt'
lines = []
def say(*a): lines.append(' '.join(str(x) for x in a))
UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36', 'Accept': 'text/html,application/pdf,*/*'}
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
        return r.status, r.headers.get('Content-Type'), r.read()
# Open-access copies and links from Crossref.
try:
    st, ct, b = get('https://api.crossref.org/works/10.1029/2025JE009434')
    m = json.loads(b)['message']
    say('title', m.get('title'), 'license', [l.get('URL') for l in m.get('license', [])])
    for l in m.get('link', []): say('link', l.get('URL'), l.get('content-type'))
except Exception as e: say('crossref', e)
for url in ['https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2025JE009434',
            'https://agupubs.onlinelibrary.wiley.com/doi/pdfdirect/10.1029/2025JE009434',
            'https://onlinelibrary.wiley.com/doi/pdf/10.1029/2025JE009434',
            'https://www.ncbi.nlm.nih.gov/pmc/?term=10.1029%2F2025JE009434']:
    try:
        st, ct, b = get(url)
        say('##', url, st, ct, len(b))
        if 'pdf' in (ct or ''):
            open('challenge-snapshot/jgr.pdf', 'wb').write(b)
        else:
            t = b.decode('utf-8', 'replace')
            i = t.find('Table A1')
            say('Table A1 at', i)
            if i > 0:
                open('challenge-snapshot/jgr.html', 'w').write(t)
    except Exception as e:
        say('##', url, 'ERROR', e)
open(OUT, 'w').write('\n'.join(lines))
