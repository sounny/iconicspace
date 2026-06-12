/**
 * Remove companies without logos from data.js
 * 
 * Categories:
 * - DEFUNCT: Company ceased operations
 * - NOT_FOUND: Logo genuinely unfindable (Chinese/Russian companies behind firewalls, etc.)
 * - NON_EXISTENT: Company doesn't exist as described
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.js');
const LOGOS_DIR = path.join(__dirname, 'logos');

// Companies to remove (no logo obtainable)
const TO_REMOVE = [
  // Defunct / Dormant
  "Orbex",           // Ceased operations Feb 2026
  "T-Space",         // Dormant since ~2008
  "Moon Express",    // Faded from operations, no active missions
  
  // Non-existent as described
  "Scout",           // scoutaero.com is not a real launch company
  "Spacefleet",      // No company by this name exists
  
  // Logo unfindable (Chinese companies behind Great Firewall)
  "iSpace China",
  "Deep Blue Aerospace",
  "Expace",
  "Origin Space",
  "Space Pioneer",
  "MinoSpace",
  
  // Logo unfindable (Russian companies)
  "RSC Energia",
  "ISS Reshetnev",
  "GK Launch Services",
  "Glavkosmos",
  
  // Logo unfindable (African agencies)
  "EgSA",
  "ESSTI",
  "CRTS",
  
  // Logo unfindable (other)
  "Innospace",
  "Bellatrix Aerospace",
  "Phase Four",
  "Apex",
  "Hadrian",
  "AAC Clyde Space",
];

// Read data.js
let content = fs.readFileSync(DATA_FILE, 'utf8');

// Remove each company's line
let removed = 0;
for (const name of TO_REMOVE) {
  // Escape special regex characters in the name
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^\\s*\\{\\s*name:\\s*"${escaped}"[^}]*\\},?\\s*\\n`, 'gm');
  const before = content.length;
  content = content.replace(regex, '');
  if (content.length < before) {
    console.log(`  [REMOVED] ${name}`);
    removed++;
  } else {
    console.log(`  [NOT FOUND IN DATA] ${name}`);
  }
}

// Update the header comment with new count
const logoCount = fs.readdirSync(LOGOS_DIR).filter(f => f.endsWith('.png') && fs.statSync(path.join(LOGOS_DIR, f)).size > 500).length;
content = content.replace(/200 Organizations Dataset/, `${logoCount} Organizations Dataset`);

// Clean up any double blank lines
content = content.replace(/\n{3,}/g, '\n\n');

// Write back
fs.writeFileSync(DATA_FILE, content, 'utf8');

console.log(`\nRemoved ${removed} companies from data.js`);

// Verify
const remaining = (content.match(/name:\s*"/g) || []).length;
console.log(`Remaining companies in data.js: ${remaining}`);
console.log(`Logo files (>500b): ${logoCount}`);
