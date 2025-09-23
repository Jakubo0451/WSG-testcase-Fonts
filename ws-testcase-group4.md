# STAR Test-case: [WSG ID] — Short title
Group: Student A, Student B
Date: YYYY-MM-DD
## 1) WSG criterion (exact quote)
> ...
## 2) Plain-language summary
1–2 sentences: what the guideline requires.
## 3) Why it matters
- Performance:
- CO₂ / Energy:
- UX / Accessibility:
## 4) Machine-testable? (yes / no / partly)
Specify which parts can be automated and which need manual judgement.
## 5) Signals to check (explicit list)
- e.g. `transferSize` > 300000 for hero images
- `Cache-Control` header missing / short TTL
- missing `width/height` on images
- long main-thread tasks > 200ms
## 6) Pass / Fail rules (explicit)
- PASS if: [boolean condition]
- FAIL if: [boolean condition]
## 7) Exact test steps (reproducible)
1. Command (e.g. `curl -I https://... > evidence/cache-headers.txt`)
2. Optional (if you use Lighthouse): `npx lighthouse 'URL' --output=json --output-path=
3. Script (if any): `node tools/check-foo.js URL > evidence/foo.csv`
4. Manual: take screenshots `evidence/before.png` and `evidence/after.png`
## 8) Evidence required (list filenames)
- e.g. `evidence/lhr-broken.json`, `evidence/images-broken.csv`, `evidence/before.png`,
## 9) Automation hints (optional)
- small snippet / instructions (if you automated checks)
## 10) Assumptions & notes
- emission model used (if applicable), throttling assumptions, tool versions, number of
