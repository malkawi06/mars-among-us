"""Temporary: the EOX licence pages, word for word, and the yearly products they cover."""
import re, urllib.request, urllib.parse
lines = []
def say(*a): lines.append(' '.join(str(x) for x in a))
UA = {'User-Agent': 'mars-among-us licence check'}
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
        return r.geturl(), r.read().decode('utf-8', 'replace')
def text(html):
    t = re.sub(r'<script.*?</script>|<style.*?</style>|<nav.*?</nav>|<header.*?</header>|<footer.*?</footer>', ' ', html, flags=re.S)
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', t)).strip()
base, html = get('https://cloudless.eox.at/')
links = {urllib.parse.urljoin(base, h): re.sub(r'<[^>]+>', '', t).strip() for h, t in re.findall(r'href="([^"]+)"[^>]*>(.*?)</a>', html, re.S)}
for url, label in links.items():
    if re.search(r'(?i)licen|product|summary|faq|terms', url + label):
        say('LINK', label, url)
for url, label in list(links.items()):
    if re.search(r'(?i)licen|product-list|summary|faq', url + label):
        try:
            u, h = get(url)
            t = text(h)
            say(f'\n######## {label} {u} ({len(t)} chars)\n{t[:6000]}')
        except Exception as e:
            say('ERR', url, e)
open('challenge-snapshot/licence2.txt', 'w').write('\n'.join(lines))
