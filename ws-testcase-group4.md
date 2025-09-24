# STAR Test-case: 2.18 Use optimized and appropriate web typography
Group 4: Sander Vinkler Bach, Jakub Olszewski
Date: 23.09.2025
## 1) WSG criterion (exact quote)
> Provide custom fonts in a highly optimized and correct format, but with a preference for pre-installed typefaces where possible.
## 2) Plain-language summary
Limit the amount of fonts used on the page, optimize/subset and use the most performant file format available. Use pre-installed fonts wherever possible
## 3) Why it matters
- Performance: Faster font loading and less render blocking.
- CO₂ / Energy: Smaller font files reduce data transfer and emissions.
- UX / Accessibility: Clear, consistent text improves readability.
## 4) Machine-testable? (partly)
**Automatable:**
Count how many custom fonts are requested.
Detect which formats are served (WOFF2, WOFF, vs obsolete formats like TTF/EOT/SVG).
Check for <link rel="preload"> for critical fonts.
Inspect @font-face rules for font-display.
**Manual:**
Judge whether the number of fonts is “appropriate” for the design.
Assess whether line-height, contrast, and fallbacks provide good readability.
## 5) Signals to check (explicit list)
- Number of distinct custom font files requested
- Missing preloaded fonts in the HTML head.
- Obsolete font formats (eg. EOT, TTF, SVG).
- Non-WOFF2 or WOFF font formats.
- Non-variable custom fonts exist (variable fonts are more data efficient).
- Missing font-display in @font-face.
## 6) Pass / Fail rules (explicit)
PASS if ≤ 5 custom fonts are used, all served in WOFF2 (with optional WOFF fallback), and critical fonts are preloaded with font-display set.
FAIL if > 5 custom fonts are used, or fonts are only in legacy formats, or no preload/font-display is set for above-the-fold fonts.
## 7) Exact test steps (reproducible)
1. Serve the broken and fixed demos locally
- cd demo
- npx http-server . -p 8000
- # Broken: http://localhost:8000/broken/
- # Fixed:  http://localhost:8000/fixed/
2. Inspect font requests with Lighthouse
- npx lighthouse "http://localhost:8000/broken/" \
- --output=json --output-path=evidence/lhr-broken.json --save-assets
- npx lighthouse "http://localhost:8000/fixed/" \
- --output=json --output-path=evidence/lhr-fixed.json --save-assets
3. Extract font resource rows
- node tools/font-report.js "http://localhost:8000/broken/" > evidence/fonts-broken.json
- node tools/font-report.js "http://localhost:8000/fixed/"  > evidence/fonts-fixed.json
4. Inspect CSS manually to check @font-face blocks for font-display and formats.
5. Take screenshots of broken and fixed pages:
- evidence/before.png
- evidence/after.png
## 8) Evidence required (list filenames)
- e.g. `evidence/lhr-broken.json`, `evidence/images-broken.csv`, `evidence/before.png`,
## 9) Automation hints (optional)
- small snippet / instructions (if you automated checks)
## 10) Assumptions & notes
- emission model used (if applicable), throttling assumptions, tool versions, number of
