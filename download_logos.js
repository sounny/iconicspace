const fs = require('fs');
const https = require('https');
const path = require('path');

// Read data.js content
const dataJsPath = path.join(__dirname, 'data.js');
let dataJsContent = fs.readFileSync(dataJsPath, 'utf-8');

// We need to parse the COMPANIES array out of data.js. 
// A simple way since it's just a variable assignment is to eval it or extract it.
// To eval it safely, we can wrap it.
let COMPANIES = [];
try {
  // Strip out `const COMPANIES = ` or `var COMPANIES = `
  const arrayStart = dataJsContent.indexOf('[');
  const arrayEnd = dataJsContent.lastIndexOf(']');
  if (arrayStart !== -1 && arrayEnd !== -1) {
    const arrayString = dataJsContent.substring(arrayStart, arrayEnd + 1);
    COMPANIES = eval(arrayString);
  }
} catch (e) {
  console.error("Error parsing data.js", e);
  process.exit(1);
}

const logosDir = path.join(__dirname, 'logos');
if (!fs.existsSync(logosDir)){
    fs.mkdirSync(logosDir);
}

function getDomain(url) {
  if (!url) return '';
  let domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  return domain;
}

function getInitials(name) {
  return name.split(/[\s\-]+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function download(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  const request = https.get(url, function(response) {
    if (response.statusCode !== 200) {
      file.close();
      fs.unlink(dest, () => {}); // Delete the file async.
      cb(new Error(`Failed to download ${url}: status ${response.statusCode}`));
      return;
    }
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest, () => {}); // Delete the file async.
    cb(err);
  });
}

async function downloadAll() {
  console.log(`Found ${COMPANIES.length} companies to process.`);
  
  for (let i = 0; i < COMPANIES.length; i++) {
    const c = COMPANIES[i];
    const domain = getDomain(c.website);
    if (!domain) {
      console.log(`Skipping ${c.name} - no website`);
      continue;
    }
    
    // Clearbit logo url
    const url = `https://logo.clearbit.com/${domain}?size=256`;
    // We will save it as domain name. Or initials if no domain? 
    // Let's use a safe filename based on the company name to be safe and clean.
    const safeName = c.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const dest = path.join(logosDir, `${safeName}.png`);
    
    // If it already exists, skip
    if (fs.existsSync(dest)) {
      console.log(`[${i+1}/${COMPANIES.length}] Exists: ${dest}`);
      continue;
    }

    try {
      await new Promise((resolve, reject) => {
        download(url, dest, (err) => {
          if (err) resolve(false); // ignore errors and continue
          else resolve(true);
        });
      });
      console.log(`[${i+1}/${COMPANIES.length}] Downloaded: ${c.name}`);
    } catch (e) {
      console.log(`[${i+1}/${COMPANIES.length}] Failed: ${c.name}`);
    }
    
    // Rate limit delay to be nice to clearbit
    await new Promise(r => setTimeout(r, 200)); 
  }
  
  console.log('Finished downloading logos.');
}

downloadAll();
