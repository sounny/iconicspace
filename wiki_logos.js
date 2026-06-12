/**
 * Download logos from Wikimedia Commons URLs found by research subagent
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const LOGOS_DIR = path.join(__dirname, 'logos');

const WIKI_LOGOS = [
  { name: "ESA", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/ESA_logo.svg/1200px-ESA_logo.svg.png" },
  { name: "Roscosmos", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/2022-roscosmos-logo-main-eng.png/800px-2022-roscosmos-logo-main-eng.png" },
  { name: "AEM", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Logo_centrado_de_la_Agencia_Espacial_Mexicana.svg/1200px-Logo_centrado_de_la_Agencia_Espacial_Mexicana.svg.png" },
  { name: "EgSA", url: "https://upload.wikimedia.org/wikipedia/commons/5/55/Egyptian_Space_Agency_Official_Logo.png" },
  { name: "Impulse Space", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Impulse_Space_logo.png/800px-Impulse_Space_logo.png" },
  { name: "ABL Space Systems", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/ABL_Space_Systems_logo.png/800px-ABL_Space_Systems_logo.png" },
  { name: "Space Perspective", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Space_Perspective_Full_Logo.png/800px-Space_Perspective_Full_Logo.png" },
  { name: "Boeing", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Boeing_full_logo.svg/1200px-Boeing_full_logo.svg.png" },
  { name: "Lockheed Martin", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Lockheed_Martin_logo.svg/1200px-Lockheed_Martin_logo.svg.png" },
  { name: "Northrop Grumman", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Northrop_Grumman_logo_blue-on-clear_2020.svg/1200px-Northrop_Grumman_logo_blue-on-clear_2020.svg.png" },
  { name: "BAE Systems", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/BAE_Systems_logo.svg/1200px-BAE_Systems_logo.svg.png" },
  { name: "AVIO", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Avio_logo.svg/1200px-Avio_logo.svg.png" },
  { name: "Space One", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Space_One_Logo.png/800px-Space_One_Logo.png" },
  { name: "Perigee Aerospace", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Perigee_Aerospace_logo.svg/1200px-Perigee_Aerospace_logo.svg.png" },
  { name: "Satrec Initiative", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Satrec_Initiative_logo.svg/1200px-Satrec_Initiative_logo.svg.png" },
  // Also try JAXA from Wikimedia (higher quality than favicon)
  { name: "JAXA", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Jaxa_logo.svg/1200px-Jaxa_logo.svg.png" },
];

function safeName(name) {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000
    }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        res.resume();
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (buf.length < 500) return reject(new Error(`Too small: ${buf.length}`));
        fs.writeFileSync(dest, buf);
        resolve(buf.length);
      });
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  let ok = 0, fail = 0;
  for (const t of WIKI_LOGOS) {
    const fname = safeName(t.name) + '.png';
    const dest = path.join(LOGOS_DIR, fname);
    try {
      const size = await downloadFile(t.url, dest);
      console.log(`  [OK] ${t.name} — ${size} bytes`);
      ok++;
    } catch (e) {
      console.log(`  [FAIL] ${t.name} — ${e.message}`);
      fail++;
      try { fs.unlinkSync(dest); } catch(_) {}
    }
    await sleep(500);
  }
  console.log(`\nDone: ${ok} downloaded, ${fail} failed`);
  console.log(`Total PNGs: ${fs.readdirSync(LOGOS_DIR).filter(f => !f.startsWith('.')).length}`);
}

main().catch(console.error);
