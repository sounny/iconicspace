/**
 * ICONICSPACE — Logo Audit & Download Script
 * 
 * 1. Reads data.js and extracts every company name + website
 * 2. Checks which logos already exist in /logos/
 * 3. Downloads missing logos via Clearbit Logo API (primary) and Google favicon (fallback)
 * 4. Reports results
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const LOGOS_DIR = path.join(__dirname, 'logos');
const DATA_FILE = path.join(__dirname, 'data.js');

// --- Read data.js and extract company entries ---
function extractCompanies() {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  const entries = [];
  // Match each object in the COMPANIES array
  const regex = /\{\s*name:\s*"([^"]+)"[^}]*?website:\s*"([^"]*)"[^}]*?\}/g;
  let m;
  while ((m = regex.exec(raw)) !== null) {
    entries.push({ name: m[1], website: m[2] });
  }
  return entries;
}

function safeName(name) {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function extractDomain(url) {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        const loc = res.headers.location;
        if (loc) {
          return downloadFile(loc, dest).then(resolve).catch(reject);
        }
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      // Check content-type is image
      const ct = res.headers['content-type'] || '';
      if (!ct.includes('image')) {
        res.resume();
        return reject(new Error(`Not an image: ${ct}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', (e) => { fs.unlink(dest, () => {}); reject(e); });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  if (!fs.existsSync(LOGOS_DIR)) fs.mkdirSync(LOGOS_DIR);
  
  const companies = extractCompanies();
  console.log(`Total companies in data.js: ${companies.length}`);
  
  const existing = new Set(fs.readdirSync(LOGOS_DIR).map(f => f.toLowerCase()));
  console.log(`Existing logo files: ${existing.size}`);
  
  const missing = [];
  const present = [];
  const noWebsite = [];
  
  for (const c of companies) {
    const fname = safeName(c.name) + '.png';
    if (existing.has(fname)) {
      // Check file isn't empty or too small (< 500 bytes = likely broken)
      const fpath = path.join(LOGOS_DIR, fname);
      const stat = fs.statSync(fpath);
      if (stat.size < 500) {
        missing.push(c);
        console.log(`  [TOO SMALL] ${fname} (${stat.size} bytes) — will re-download`);
      } else {
        present.push(c);
      }
    } else {
      missing.push(c);
    }
  }
  
  console.log(`\nAlready have: ${present.length}`);
  console.log(`Missing/broken: ${missing.length}`);
  
  if (missing.length === 0) {
    console.log('\nAll logos present! Nothing to download.');
    return;
  }
  
  console.log('\n--- Downloading missing logos ---\n');
  
  let downloaded = 0;
  let failed = 0;
  const failures = [];
  
  for (const c of missing) {
    const fname = safeName(c.name) + '.png';
    const dest = path.join(LOGOS_DIR, fname);
    const domain = extractDomain(c.website);
    
    if (!domain) {
      console.log(`  [NO DOMAIN] ${c.name} — skipping`);
      noWebsite.push(c.name);
      failed++;
      continue;
    }
    
    // Try Clearbit first
    const clearbitUrl = `https://logo.clearbit.com/${domain}?size=400&format=png`;
    
    try {
      await downloadFile(clearbitUrl, dest);
      const stat = fs.statSync(dest);
      if (stat.size < 500) throw new Error('File too small');
      console.log(`  [OK] ${c.name} — Clearbit (${stat.size} bytes)`);
      downloaded++;
    } catch (e1) {
      // Try Google Favicon as fallback
      const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
      try {
        await downloadFile(googleUrl, dest);
        const stat = fs.statSync(dest);
        if (stat.size < 200) throw new Error('File too small');
        console.log(`  [OK] ${c.name} — Google Favicon (${stat.size} bytes)`);
        downloaded++;
      } catch (e2) {
        console.log(`  [FAIL] ${c.name} — ${e1.message} / ${e2.message}`);
        failures.push(c.name);
        failed++;
        // Clean up partial file
        try { fs.unlinkSync(dest); } catch(_) {}
      }
    }
    
    // Rate limit
    await sleep(300);
  }
  
  console.log(`\n--- Summary ---`);
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Failed: ${failed}`);
  if (failures.length) {
    console.log(`\nFailed companies:`);
    failures.forEach(f => console.log(`  - ${f}`));
  }
  if (noWebsite.length) {
    console.log(`\nNo website domain:`);
    noWebsite.forEach(f => console.log(`  - ${f}`));
  }
  
  // Final audit
  const finalExisting = fs.readdirSync(LOGOS_DIR).length;
  console.log(`\nFinal logo count: ${finalExisting} / ${companies.length} companies`);
}

main().catch(console.error);
