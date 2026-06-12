/**
 * ICONICSPACE — Final Logo Hunt
 * 
 * Try multiple sources for each missing logo:
 * 1. Direct website favicon (various paths)
 * 2. Brandfetch CDN (public logos)
 * 3. Google favicon (with various domain variants)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const LOGOS_DIR = path.join(__dirname, 'logos');

// Each entry has multiple URL attempts in priority order
const TARGETS = [
  // Major Agencies - try multiple favicon paths
  { name: "ESA", urls: [
    "https://www.esa.int/favicon.ico",
    "https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2019/11/esa_logo_white/21288960-1-eng-GB/ESA_logo_white.png",
    "https://www.google.com/s2/favicons?domain=esa.int&sz=256"
  ]},
  { name: "JAXA", urls: [
    "https://www.jaxa.jp/favicon.ico",
    "https://www.google.com/s2/favicons?domain=jaxa.jp&sz=256",
    "https://global.jaxa.jp/images/common/ogp.jpg"
  ]},
  { name: "Roscosmos", urls: [
    "https://www.roscosmos.ru/favicon.ico",
    "https://www.google.com/s2/favicons?domain=roscosmos.ru&sz=256"
  ]},
  { name: "AEM", urls: [
    "https://www.google.com/s2/favicons?domain=aem.gob.mx&sz=256",
    "https://www.gob.mx/favicon.ico"
  ]},
  { name: "EgSA", urls: [
    "https://www.google.com/s2/favicons?domain=egsa.gov.eg&sz=256"
  ]},
  
  // US Major Companies
  { name: "Boeing", urls: [
    "https://www.boeing.com/favicon.ico",
    "https://www.google.com/s2/favicons?domain=boeing.com&sz=256"
  ]},
  { name: "Lockheed Martin", urls: [
    "https://www.lockheedmartin.com/favicon.ico",
    "https://www.google.com/s2/favicons?domain=lockheedmartin.com&sz=256"
  ]},
  { name: "Northrop Grumman", urls: [
    "https://www.northropgrumman.com/favicon.ico",
    "https://www.google.com/s2/favicons?domain=northropgrumman.com&sz=256"
  ]},
  { name: "BAE Systems", urls: [
    "https://www.baesystems.com/favicon.ico",
    "https://www.google.com/s2/favicons?domain=baesystems.com&sz=256"
  ]},
  
  // European Companies
  { name: "AVIO", urls: [
    "https://www.avio.com/favicon.ico",
    "https://www.google.com/s2/favicons?domain=avio.com&sz=256"
  ]},
  { name: "GMV", urls: [
    "https://www.gmv.com/favicon.ico",
    "https://www.google.com/s2/favicons?domain=gmv.com&sz=256"
  ]},
  { name: "AAC Clyde Space", urls: [
    "https://www.aac-clyde.space/favicon.ico",
    "https://www.google.com/s2/favicons?domain=aac-clyde.space&sz=256"
  ]},
  { name: "Iceye", urls: [
    "https://www.iceye.com/favicon.ico",
    "https://www.iceye.com/hubfs/iceye-favicon-32x32.png",
    "https://www.google.com/s2/favicons?domain=iceye.com&sz=256"
  ]},
  
  // US Startups
  { name: "Impulse Space", urls: [
    "https://www.impulsespace.com/favicon.ico",
    "https://www.google.com/s2/favicons?domain=impulsespace.com&sz=256"
  ]},
  { name: "ABL Space Systems", urls: [
    "https://ablspacesystems.com/favicon.ico",
    "https://www.google.com/s2/favicons?domain=ablspacesystems.com&sz=256"
  ]},
  { name: "Space Perspective", urls: [
    "https://www.spaceperspective.com/favicon.ico",
    "https://www.google.com/s2/favicons?domain=spaceperspective.com&sz=256"
  ]},
  { name: "York Space Systems", urls: [
    "https://www.yorkspacesystems.com/favicon.ico",
    "https://www.google.com/s2/favicons?domain=yorkspacesystems.com&sz=256"
  ]},
  { name: "SpinLaunch", urls: [
    "https://www.spinlaunch.com/favicon.ico",
    "https://www.google.com/s2/favicons?domain=spinlaunch.com&sz=256"
  ]},
  { name: "Phase Four", urls: [
    "https://phasefour.io/favicon.ico",
    "https://www.google.com/s2/favicons?domain=phasefour.io&sz=256"
  ]},
  { name: "Apex", urls: [
    "https://apex.space/favicon.ico",
    "https://www.google.com/s2/favicons?domain=apex.space&sz=256"
  ]},
  { name: "Hadrian", urls: [
    "https://www.hadrian.co/favicon.ico",
    "https://www.google.com/s2/favicons?domain=hadrian.co&sz=256"
  ]},
  
  // Asian Companies
  { name: "Space One", urls: [
    "https://www.space-one.co.jp/favicon.ico",
    "https://www.google.com/s2/favicons?domain=space-one.co.jp&sz=256"
  ]},
  { name: "Innospace", urls: [
    "https://www.innospace.co.kr/favicon.ico",
    "https://www.google.com/s2/favicons?domain=innospace.co.kr&sz=256"
  ]},
  { name: "Perigee Aerospace", urls: [
    "https://www.perigee.kr/favicon.ico",
    "https://www.google.com/s2/favicons?domain=perigee.kr&sz=256"
  ]},
  { name: "Satrec Initiative", urls: [
    "https://www.satreci.com/favicon.ico",
    "https://www.google.com/s2/favicons?domain=satreci.com&sz=256"
  ]},
  { name: "Bellatrix Aerospace", urls: [
    "https://www.bellatrix.in/favicon.ico",
    "https://www.google.com/s2/favicons?domain=bellatrix.in&sz=256"
  ]},
  
  // Chinese Companies
  { name: "iSpace China", urls: [
    "https://www.ispace.com.cn/favicon.ico",
    "https://www.google.com/s2/favicons?domain=ispace.com.cn&sz=256"
  ]},
  { name: "Deep Blue Aerospace", urls: [
    "https://www.deepbluespace.com/favicon.ico",
    "https://www.google.com/s2/favicons?domain=deepbluespace.com&sz=256"
  ]},
  { name: "Expace", urls: [
    "https://www.expace.com.cn/favicon.ico",
    "https://www.google.com/s2/favicons?domain=expace.com.cn&sz=256"
  ]},
  { name: "Origin Space", urls: [
    "https://www.origin.space/favicon.ico",
    "https://www.google.com/s2/favicons?domain=origin.space&sz=256"
  ]},
  { name: "Space Pioneer", urls: [
    "https://www.tbtechspace.com/favicon.ico",
    "https://www.google.com/s2/favicons?domain=tbtechspace.com&sz=256"
  ]},
  { name: "MinoSpace", urls: [
    "https://www.minospace.com/favicon.ico",
    "https://www.google.com/s2/favicons?domain=minospace.com&sz=256"
  ]},
  
  // Russian Companies
  { name: "RSC Energia", urls: [
    "https://www.energia.ru/favicon.ico",
    "https://www.google.com/s2/favicons?domain=energia.ru&sz=256"
  ]},
  { name: "ISS Reshetnev", urls: [
    "https://www.reshetnev.ru/favicon.ico",
    "https://www.google.com/s2/favicons?domain=reshetnev.ru&sz=256"
  ]},
  { name: "GK Launch Services", urls: [
    "https://www.gk-launch.ru/favicon.ico",
    "https://www.google.com/s2/favicons?domain=gk-launch.ru&sz=256"
  ]},
  { name: "Glavkosmos", urls: [
    "https://www.glavkosmos.com/favicon.ico",
    "https://www.google.com/s2/favicons?domain=glavkosmos.com&sz=256"
  ]},
  
  // African
  { name: "ESSTI", urls: [
    "https://www.google.com/s2/favicons?domain=essti.gov.et&sz=256"
  ]},
  { name: "CRTS", urls: [
    "https://www.crts.gov.ma/favicon.ico",
    "https://www.google.com/s2/favicons?domain=crts.gov.ma&sz=256"
  ]},
  
  // Other
  { name: "Gilmour Space", urls: [
    "https://www.gspace.com/favicon.ico",
    "https://www.google.com/s2/favicons?domain=gspace.com&sz=256"
  ]},
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
  const MIN_SIZE = 500; // Minimum file size to consider valid

  for (const t of TARGETS) {
    const fname = safeName(t.name) + '.png';
    const dest = path.join(LOGOS_DIR, fname);

    // Skip if already have a good file
    if (fs.existsSync(dest) && fs.statSync(dest).size >= MIN_SIZE) {
      console.log(`  [HAVE] ${t.name}`);
      ok++;
      continue;
    }

    let found = false;
    for (const url of t.urls) {
      try {
        const size = await downloadFile(url, dest);
        if (size >= MIN_SIZE) {
          console.log(`  [OK] ${t.name} — ${size}b from ${url.substring(0, 50)}`);
          ok++;
          found = true;
          break;
        } else {
          // Too small, try next
          try { fs.unlinkSync(dest); } catch(_) {}
        }
      } catch (e) {
        // Try next URL
      }
      await sleep(200);
    }

    if (!found) {
      console.log(`  [FAIL] ${t.name}`);
      stillMissing.push(t.name);
      fail++;
      try { fs.unlinkSync(dest); } catch(_) {}
    }
    await sleep(300);
  }

  console.log(`\nResults: ${ok} found, ${fail} missing`);
  if (stillMissing.length) {
    console.log(`\nStill missing:`);
    stillMissing.forEach(n => console.log(`  - ${n}`));
  }
  console.log(`\nTotal PNGs: ${fs.readdirSync(LOGOS_DIR).filter(f => !f.startsWith('.')).length}`);
}

main().catch(console.error);
