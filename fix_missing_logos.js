/**
 * ICONICSPACE — Final Logo Fix (Direct Favicon Fetch)
 * Clearbit is down, so we go directly to each company's website favicon.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const LOGOS_DIR = path.join(__dirname, 'logos');

// Direct favicon/logo URLs from company websites
const TARGETS = [
  // Major companies - Google S2 with full domain
  { name: "JAXA", url: "https://www.google.com/s2/favicons?domain=jaxa.jp&sz=256" },
  { name: "ISRO", url: "https://www.google.com/s2/favicons?domain=www.isro.gov.in&sz=256" },
  { name: "Roscosmos", url: "https://www.google.com/s2/favicons?domain=www.roscosmos.ru&sz=256" },
  { name: "CNSA", url: "https://www.google.com/s2/favicons?domain=www.cnsa.gov.cn&sz=256" },
  { name: "IN-SPACe", url: "https://www.google.com/s2/favicons?domain=www.inspace.gov.in&sz=256" },
  { name: "EgSA", url: "https://www.google.com/s2/favicons?domain=www.egsa.gov.eg&sz=256" },
  { name: "INPE", url: "https://www.google.com/s2/favicons?domain=www.gov.br&sz=256" },
  { name: "ESSTI", url: "https://www.google.com/s2/favicons?domain=www.essti.gov.et&sz=256" },
  { name: "CRTS", url: "https://www.google.com/s2/favicons?domain=www.crts.gov.ma&sz=256" },
  { name: "Alcantara Space Center", url: "https://www.google.com/s2/favicons?domain=www.fab.mil.br&sz=256" },

  // US Companies
  { name: "ABL Space Systems", url: "https://www.google.com/s2/favicons?domain=ablspacesystems.com&sz=256" },
  { name: "Space Perspective", url: "https://www.google.com/s2/favicons?domain=spaceperspective.com&sz=256" },
  { name: "Moon Express", url: "https://www.google.com/s2/favicons?domain=moonexpress.com&sz=256" },
  { name: "Lockheed Martin", url: "https://www.google.com/s2/favicons?domain=lockheedmartin.com&sz=256" },
  { name: "York Space Systems", url: "https://www.google.com/s2/favicons?domain=yorkspacesystems.com&sz=256" },
  { name: "SpinLaunch", url: "https://www.google.com/s2/favicons?domain=spinlaunch.com&sz=256" },
  { name: "Phase Four", url: "https://www.google.com/s2/favicons?domain=phasefour.io&sz=256" },
  { name: "Apex", url: "https://www.google.com/s2/favicons?domain=apexsatellites.com&sz=256" },
  { name: "Hadrian", url: "https://www.google.com/s2/favicons?domain=hadrian.co&sz=256" },
  { name: "Scout", url: "https://www.google.com/s2/favicons?domain=scoutaero.com&sz=256" },
  { name: "T-Space", url: "https://www.google.com/s2/favicons?domain=tspace.com&sz=256" },
  { name: "Tomorrow.io", url: "https://www.google.com/s2/favicons?domain=www.tomorrow.io&sz=256" },

  // European
  { name: "Telespazio", url: "https://www.google.com/s2/favicons?domain=www.telespazio.com&sz=256" },
  { name: "D-Orbit", url: "https://www.google.com/s2/favicons?domain=www.dorbit.space&sz=256" },
  { name: "Orbex", url: "https://www.google.com/s2/favicons?domain=orbex.space&sz=256" },
  { name: "AAC Clyde Space", url: "https://www.google.com/s2/favicons?domain=www.aac-clyde.space&sz=256" },
  { name: "Gilmour Space", url: "https://www.google.com/s2/favicons?domain=www.gilmourspace.com&sz=256" },
  { name: "Spacefleet", url: "https://www.google.com/s2/favicons?domain=spacefleet.com.au&sz=256" },

  // Japan / Korea
  { name: "Space One", url: "https://www.google.com/s2/favicons?domain=www.space-one.co.jp&sz=256" },
  { name: "Innospace", url: "https://www.google.com/s2/favicons?domain=www.innospace.co.kr&sz=256" },
  { name: "Perigee Aerospace", url: "https://www.google.com/s2/favicons?domain=www.perigee.kr&sz=256" },
  { name: "Satrec Initiative", url: "https://www.google.com/s2/favicons?domain=www.satreci.com&sz=256" },

  // India
  { name: "Bellatrix Aerospace", url: "https://www.google.com/s2/favicons?domain=www.bellatrix.in&sz=256" },

  // China
  { name: "iSpace China", url: "https://www.google.com/s2/favicons?domain=www.ispace.com.cn&sz=256" },
  { name: "Galactic Energy", url: "https://www.google.com/s2/favicons?domain=www.galactic-energy.cn&sz=256" },
  { name: "LandSpace", url: "https://www.google.com/s2/favicons?domain=www.landspace.com&sz=256" },
  { name: "Deep Blue Aerospace", url: "https://www.google.com/s2/favicons?domain=www.deepbluespace.com&sz=256" },
  { name: "Expace", url: "https://www.google.com/s2/favicons?domain=www.expace.com.cn&sz=256" },
  { name: "Origin Space", url: "https://www.google.com/s2/favicons?domain=origin.space&sz=256" },
  { name: "Space Pioneer", url: "https://www.google.com/s2/favicons?domain=www.tbtechspace.com&sz=256" },
  { name: "MinoSpace", url: "https://www.google.com/s2/favicons?domain=www.minospace.com&sz=256" },

  // Russia
  { name: "RSC Energia", url: "https://www.google.com/s2/favicons?domain=www.energia.ru&sz=256" },
  { name: "ISS Reshetnev", url: "https://www.google.com/s2/favicons?domain=www.reshetnev.ru&sz=256" },
  { name: "GK Launch Services", url: "https://www.google.com/s2/favicons?domain=www.gk-launch.ru&sz=256" },
];

function safeName(name) {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000 
    }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        res.resume();
        const loc = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
        return downloadFile(loc, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (buf.length < 100) return reject(new Error(`Too small: ${buf.length}b`));
        fs.writeFileSync(dest, buf);
        resolve(buf.length);
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  let ok = 0, fail = 0;
  const stillMissing = [];

  for (const t of TARGETS) {
    const fname = safeName(t.name) + '.png';
    const dest = path.join(LOGOS_DIR, fname);

    // Skip if already have a good file
    if (fs.existsSync(dest)) {
      try {
        const s = fs.statSync(dest).size;
        if (s > 500) { console.log(`  [HAVE] ${t.name} (${s}b)`); ok++; continue; }
      } catch(_) {}
    }

    try {
      const size = await downloadFile(t.url, dest);
      console.log(`  [OK] ${t.name} — ${size} bytes`);
      ok++;
    } catch (e) {
      console.log(`  [FAIL] ${t.name} — ${e.message}`);
      stillMissing.push(t.name);
      fail++;
      try { fs.unlinkSync(dest); } catch(_) {}
    }
    await sleep(500);
  }

  console.log(`\nDone: ${ok} ok, ${fail} failed`);
  if (stillMissing.length) {
    console.log(`Still missing (will use initials on site):`);
    stillMissing.forEach(n => console.log(`  - ${n}`));
  }
  console.log(`\nTotal PNGs: ${fs.readdirSync(LOGOS_DIR).filter(f => f.endsWith('.png')).length}`);
}

main().catch(console.error);
