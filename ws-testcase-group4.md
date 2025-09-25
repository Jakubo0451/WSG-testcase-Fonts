# STAR Test-case: 2.18 Use optimized and appropriate web typography
Group 4: Sander Vinkler Bach, Jakub Olszewski
Date: 23.09.2025
## 1) WSG criterion (exact quote)
> Provide custom fonts in a highly optimized and correct format, but with a preference for pre-installed typefaces where possible.
Source: https://w3c.github.io/sustainableweb-wsg/#use-optimized-and-appropriate-web-typography
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
Check for `<link rel="preload">` for critical fonts.
Inspect `@font-face` rules for `font-display`.

**Manual:**
Judge whether the number of fonts is “appropriate” for the design.
Assess whether line-height, contrast, and fallbacks provide good readability.
## 5) Signals to check (explicit list)
- Number of distinct custom font files requested
- Missing preloaded fonts in the HTML head.
- Obsolete font formats (eg. EOT, TTF, SVG).
- Non-WOFF2 or WOFF font formats.
- Non-variable custom fonts exist (variable fonts are more data efficient).
- Missing `font-display` in `@font-face`.
## 6) Pass / Fail rules (explicit)
PASS if ≤ 5 custom fonts are used, all served in WOFF2 (with optional WOFF fallback), and critical fonts are preloaded with `font-display` set.
FAIL if > 5 custom fonts are used, or fonts are only in legacy formats, or no preload/font-display is set in the previously mentioned formats.
## 7) Exact test steps (reproducible)
**0. Install python and node on your machine**
https://www.python.org/downloads/ (downaload latest version)
https://nodejs.org/en/download (download latest version)
**1. Serve the broken and fixed demos locally**
- Open terminal
- `cd demo`
- `npx http-server . -p 8000`
- Broken: http://127.0.0.1:8000/demo/broken/index.html
- Fixed:  http://127.0.0.1:8000/demo/fixed/index.html

**2. Run Lighthouse three times for the broken demo and three times for fixed demo with these commands**
- Broken:
  npx lighthouse "http://127.0.0.1:8000/demo/broken/index.html" \
    --output=json \
    --output-path="evidence/lhr-broken-1.json" \
    --save-assets \
    --chrome-flags="--headless"

- Fixed: 
    npx lighthouse "http://127.0.0.1:8000/demo/fixed/index.html" \
    --output=json \
    --output-path="evidence/lhr-fixed-1.json" \
    --save-assets \
    --chrome-flags="--headless"

**3. Extract font rows using helper script**
Run the script to generate CSV files from Lighthouse output:
node ./tools/extract-fonts.js evidence/lhr-broken-1.json > evidence/fonts-broken.csv
node ./tools/extract-fonts.js evidence/lhr-fixed-1.json > evidence/fonts-fixed.csv
**4. Inspect CSS manually**
- Check `@font-face` blocks for `font-display` and `format`.
**5. Take screenshots of broken and fixed pages:**
- evidence/before.png
- evidence/after.png
## 8) Evidence required (list filenames)
- lhr-broken-1.json
- lhr-fixed-1.json
- lhr-broken-1-0.trace.json
- lhr-fixed-1-0.trace.json
- lhr-broken-1-0.devtoolslog.json
- lhr-fixed-1-0.devtoolslog.json
- before.png
- after.png
- summary.md
## 9) Automation hints (optional)   
- Use Puppeteer/Node to grab all font resources
- Output transferSize, format, and whether preload headers are present
## 10) Assumptions & notes
- Emissions model: SWDM v4 defaults.
- Cold cache runs only (to avoid 0-byte transfer sizes).
- Viewport: 375×812 mobile to define “above the fold.”
- Thresholds: max 5 custom fonts on initial load.
- Tools: Lighthouse v10+, Node.js ≥ 16, Puppeteer ≥ 19.