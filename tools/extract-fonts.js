const fs = require('fs');
const path = require('path');

function usageAndExit(msg) {
  if (msg) console.error(msg);
  console.error('Usage: node tools/extract-fonts.js <lhr-json> <out-csv> [--css-dir=path]');
  process.exit(msg ? 1 : 0);
}

const argv = process.argv.slice(2);
if (argv.length < 2) usageAndExit();

const lhrPath = argv[0];
const outCsv = argv[1];
let cssDir = null;
argv.slice(2).forEach(a => {
  if (a.startsWith('--css-dir=')) cssDir = a.split('=')[1];
});

if (!fs.existsSync(lhrPath)) usageAndExit(`Lighthouse JSON not found: ${lhrPath}`);

const lhr = JSON.parse(fs.readFileSync(lhrPath, 'utf8'));

// extract network items
function getNetworkItems(lhrJson) {
  const net = (lhrJson.audits && lhrJson.audits['network-requests'] && lhrJson.audits['network-requests'].details && lhrJson.audits['network-requests'].details.items) || [];
  return net;
}

//detect font resource by resourceType or extension
function isFontResource(item) {
  if (!item || !item.url) return false;
  if (item.resourceType && item.resourceType.toLowerCase() === 'font') return true;
  const extMatch = item.url.match(/\.(woff2?|ttf|otf|eot|svg)(\?|$)/i);
  return !!extMatch;
}

// Parse @font-face blocks from CSS text
function parseFontFacesFromCss(cssText) {
  const blocks = [];
  const re = /@font-face\s*{([\s\S]*?)}/gi;
  let m;
  while ((m = re.exec(cssText)) !== null) {
    const body = m[1];
    const familyMatch = /font-family\s*:\s*([^;]+);/i.exec(body);
    const family = familyMatch ? familyMatch[1].trim().replace(/^["']|["']$/g, '') : null;
    const displayMatch = /font-display\s*:\s*([^;]+);/i.exec(body);
    const fontDisplay = displayMatch ? displayMatch[1].trim() : null;
    const srcMatch = /src\s*:\s*([^;]+);/i.exec(body);
    const src = srcMatch ? srcMatch[1].trim() : null;
    const sources = [];
    if (src) {
      const reUrl = /url\(\s*['"]?([^'")]+)['"]?\s*\)\s*(?:format\(\s*['"]?([^'")]+)['"]?\s*\))?/gi;
      let u;
      while ((u = reUrl.exec(src)) !== null) {
        sources.push({ url: u[1], format: u[2] ? u[2].toLowerCase() : null });
      }
    }
    blocks.push({ family, fontDisplay, srcRaw: src, sources });
  }
  return blocks;
}

// Attempt to read CSS files in cssDir
let declaredFontFaces = [];
let preloadHrefs = new Set();
if (cssDir) {
  try {
    const files = fs.readdirSync(cssDir);
    for (const f of files) {
      const full = path.join(cssDir, f);
      if (fs.statSync(full).isFile() && f.toLowerCase().endsWith('.css')) {
        const cssText = fs.readFileSync(full, 'utf8');
        declaredFontFaces = declaredFontFaces.concat(parseFontFacesFromCss(cssText));
      }
    }
    // also parse inline <style> if index.html exists
    const indexPath = path.join(cssDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      const html = fs.readFileSync(indexPath, 'utf8');
      // extract inline <style> blocks
      const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
      let sm;
      while ((sm = styleRe.exec(html)) !== null) {
        declaredFontFaces = declaredFontFaces.concat(parseFontFacesFromCss(sm[1]));
      }
      // find preload links
      const preloadRe = /<link[^>]+rel=['"]preload['"][^>]*href=['"]([^'"]+)['"][^>]*as=['"]font['"][^>]*>/gi;
      let pm;
      while ((pm = preloadRe.exec(html)) !== null) {
        let href = pm[1];
        // normalize relative href to local path
        preloadHrefs.add(href);
      }
    }
  } catch (e) {
    console.error('Warning: failed to read css-dir', cssDir, e.message);
  }
}

// Gather network font resources
const networkItems = getNetworkItems(lhr);
const fontItems = (networkItems || []).filter(isFontResource);

// Helper to get basename
function basename(url) {
  try {
    return url.split('?')[0].split('/').pop();
  } catch (e) {
    return url;
  }
}

// Try to match a resource url to a declared @font-face source
function findDeclaredForResource(resUrl) {
  const name = basename(resUrl).toLowerCase();
  for (const ff of declaredFontFaces) {
    for (const s of ff.sources || []) {
      if (!s || !s.url) continue;
      const sname = basename(s.url).toLowerCase();
      if (sname && (name === sname || resUrl.toLowerCase().includes(sname) || s.url.toLowerCase().includes(name))) {
        return { family: ff.family, fontDisplay: ff.fontDisplay, format: s.format || path.extname(s.url).replace('.', '').toLowerCase() };
      }
    }
  }
  // fallback: if any declared family name appears in the resource url
  for (const ff of declaredFontFaces) {
    if (ff.family && resUrl.toLowerCase().includes(ff.family.toLowerCase())) return { family: ff.family, fontDisplay: ff.fontDisplay, format: null };
  }
  return null;
}

// Build CSV rows
const rows = [];
for (const item of fontItems) {
  const match = findDeclaredForResource(item.url || '');
  // attempt to infer format from extension if not matched
  let fmt = null;
  if (match && match.format) fmt = match.format;
  else {
    const m = (item.url || '').match(/\.(woff2?|ttf|otf|eot|svg)(\?|$)/i);
    if (m) fmt = m[1].toLowerCase();
  }
  const declaredFamily = match ? (match.family || '') : '';
  const fontDisplay = match ? (match.fontDisplay || '') : '';
  // preloaded detection: check if any preload href matches basename or exact url
  let preloaded = false;
  for (const ph of preloadHrefs) {
    if (!ph) continue;
    const phName = basename(ph).toLowerCase();
    if (phName && basename(item.url).toLowerCase() === phName) preloaded = true;
    if (item.url.includes(ph)) preloaded = true;
  }

  const transferSize = item.transferSize || 0;
  const encodedBodySize = item.encodedBodySize || 0;
  const resourceType = item.resourceType || '';

  const notes = [];
  if (!fmt) notes.push('format-unknown');
  if (!declaredFamily) notes.push('no-declared-match');
  rows.push({
    url: item.url,
    declaredFamily,
    format: fmt || '',
    fontDisplay: fontDisplay || '',
    preloaded: preloaded ? 'true' : 'false',
    transferSize,
    encodedBodySize,
    resourceType,
    notes: notes.join(';')
  });
}

// Write CSV
function csvEscape(s) {
  if (s === null || s === undefined) return '';
  const str = String(s);
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const header = ['url','declaredFamily','format','fontDisplay','preloaded','transferSize','encodedBodySize','resourceType','notes'];
const outLines = [header.join(',')];
for (const r of rows) {
  outLines.push(header.map(h => csvEscape(r[h])).join(','));
}
fs.writeFileSync(outCsv, outLines.join('\n'), 'utf8');
console.log('Wrote CSV:', outCsv);
console.log('Rows:', rows.length);
console.log('Note: usedAboveFold detection is NOT automatic in this script. Mark usedAboveFold manually if required.');
