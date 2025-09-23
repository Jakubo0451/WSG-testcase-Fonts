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
## 4) Machine-testable? (yes)
**Automatable:**
Check that system fonts are replaced with accessible emojis.
Check that emojis are implemented with compatibility in mind. Check that the number of custom typefaces does not exceed five.
Check that fonts are preloaded within the head of the HTML document.
Check that no obsolete font formats are listed (such as EOT, TTF, SVG).
Check that fonts are only provided using WOFF2 or WOFF as a fallback.
Check that if a custom font is variable enabled (refer to font a preferred), remove other references (bold, italic, etc).
## 5) Signals to check (explicit list)
- Number of custom fonts > 5.
- Missing preloaded fonts in the HTML head.
- Obsolete font formats (eg. EOT, TTF, SVG).
- Non-WOFF2 or WOFF font formats.
- Non-variable custom fonts exist (variable fonts are more data efficient).
## 6) Pass / Fail rules (explicit)
- PASS if: number of fonts =< 5
- FAIL if: number of fonts > 5
  
- PASS if: font format is WOFF2 OR WOFF
- FAIL if: font is not WOFF2 OR WOFF
  
- PASS if: custom font is variable
- FAIL if: custom font is NOT variable
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
