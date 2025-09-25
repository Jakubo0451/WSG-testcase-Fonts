# Summary: WSG 2.18 – Font Optimization

## Broken Demo (evidence/lhr-broken-*.json + fonts-broken.csv)
- **Number of custom fonts**: 7 distinct font files requested
- **Formats**: All fonts served as `.ttf` (obsolete, inefficient)
- **Preload**: None of the fonts were preloaded (`false`)
- **font-display**: Missing (blank in CSS definitions)
- **Transfer size**:  
  - Largest font: ~195 KB  
  - Total transfer size: **789 KB**

### Issues
- High number of font requests increases latency and energy use
- Inefficient font format (TTF) → larger transfer size, no compression
- No font-display → text invisible until fonts load (“flash of invisible text”)
- No preload hints → browser delays fetching fonts

---

## Fixed Demo (evidence/lhr-fixed-*.json + fonts-fixed.csv)
- **Number of custom fonts**: 2 font files requested
- **Formats**: All fonts served as `.woff2` (modern, compressed)
- **Preload**: Both fonts preloaded (`true`)
- **font-display**: Present (`swap`)
- **Transfer size**:  
  - Largest font: ~28 KB  
  - Total transfer size: **48 KB**

### Improvements
- 75–90% smaller transfer sizes compared to broken demo
- Faster rendering, no invisible text
- Lower CPU and memory overhead
- Preload ensures fonts are available quickly

---

## Impact
- **Transfer savings**: 789 KB → 48 KB (~94% reduction)  
- **CO₂/energy**: Smaller data transfer directly reduces processing cost and emissions  
- **User Experience**: Improved readability, faster first render, more consistent layout

---

## Recommendation
- Always use modern formats (`woff2` or variable fonts where possible)  
- Limit the number of distinct font families  
- Add `font-display: swap` to @font-face  
- Preload critical fonts in `<head>`  
- Consider variable fonts for further optimization

---

## Evidence
- `evidence/lhr-broken-*.json` (Lighthouse reports, broken demo)  
- `evidence/fonts-broken.csv` (broken font details)  
- `evidence/lhr-fixed-*.json` (Lighthouse reports, fixed demo)  
- `evidence/fonts-fixed.csv` (fixed font details)  
- Screenshots: `before.png` (broken), `after.png` (fixed)  
