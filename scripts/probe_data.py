"""Temporary: download the repository copy of Wueller et al. 2025 and save its text (Table A1)."""
import re, subprocess, urllib.request
lines = []
def say(*a): lines.append(' '.join(str(x) for x in a))
UA = {'User-Agent': 'mars-among-us research'}
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
        return r.geturl(), r.headers.get('Content-Type'), r.read()
pdf = None
for landing in ['http://hdl.handle.net/20.500.11850/797022', 'https://www.zora.uzh.ch/handle/20.500.14742/246335']:
    try:
        url, ct, b = get(landing)
        t = b.decode('utf-8', 'replace')
        links = sorted(set(re.findall(r'href="([^"]+?\.pdf[^"]*)"', t)) | set(re.findall(r'href="([^"]*bitstream[^"]*)"', t)))
        say('##', landing, '->', url, ct, 'pdf links', links[:8])
        for l in links:
            full = l if l.startswith('http') else re.match(r'https?://[^/]+', url).group(0) + l
            try:
                u2, ct2, b2 = get(full)
                say('  try', full, ct2, len(b2))
                if b2[:4] == b'%PDF':
                    pdf = b2; break
            except Exception as e: say('  fail', full, e)
        if pdf: break
    except Exception as e: say('##', landing, 'ERROR', e)
if pdf:
    open('challenge-snapshot/jgr.pdf', 'wb').write(pdf)
    subprocess.run(['pdftotext', '-layout', 'challenge-snapshot/jgr.pdf', 'challenge-snapshot/jgr-text.txt'])
    say('saved pdf', len(pdf))
open('challenge-snapshot/jgr3.txt', 'w').write('\n'.join(lines))
