/* ============================================================
   ICONICSPACE — App Logic (Tailwind / Brutalist Migration)
   ============================================================ */

(function () {
  'use strict';

  // === Config ===
  const FAMILIES = [
    { key: 'Modernist Heritage', pct: '~15%', img: 'concepts/modernist_heritage.png', color: 'var(--family-modernist)',
      desc: 'Bold geometric wordmarks referencing NASA\'s 1975 "Worm" logotype. Clean geometry, restrained palettes, mid-century modernist design DNA.',
      examples: 'Vast Space, Umbra, Astra Space, Blue Origin' },
    { key: 'Tech Disruptor', pct: '~30%', img: 'concepts/tech_disruptor.png', color: 'var(--family-disruptor)',
      desc: 'Silicon Valley minimalism. Ultra-thin sans-serif, monochrome, digital-first. SpaceX is the prototype. The dominant mode of NewSpace.',
      examples: 'SpaceX, Relativity Space, Stoke Space, Impulse Space, K2 Space' },
    { key: 'Defense Professional', pct: '~15%', img: 'concepts/defense_professional.png', color: 'var(--family-defense)',
      desc: 'Military-adjacent institutional branding. Bold uppercase, shields and chevrons, navy-silver-gold. Authoritative, trustworthy, discreet.',
      examples: 'Northrop Grumman, L3Harris, True Anomaly, BlackSky' },
    { key: 'Sustainability Signaler', pct: '~8%', img: 'concepts/sustainability_signaler.png', color: 'var(--family-sustain)',
      desc: 'Green/teal palettes signaling environmental responsibility. Leaf-orbit hybrids. The newest and most dynamic family.',
      examples: 'ClearSpace, Astroscale, GHGSat, Space Forge, Orbex' },
    { key: 'Luxury Experiential', pct: '~5%', img: 'concepts/luxury_experiential.png', color: 'var(--family-luxury)',
      desc: 'Premium hospitality and fashion codes. Gold on midnight blue, aspirational lifestyle branding for space tourism.',
      examples: 'Virgin Galactic, Axiom Space, Space Perspective' },
    { key: 'National Emblem', pct: '~10%', img: 'concepts/national_emblem.png', color: 'var(--family-national)',
      desc: 'Government agency insignia. Circular seals, globes, orbital rings, national colors. Complex, heraldic, sovereignty-asserting.',
      examples: 'NASA, ISRO, CNSA, AEB, AfSA, SANSA' },
  ];

  const TRADITIONS = [
    { key: 'Soviet Constructivist', region: 'Russia', img: 'concepts/soviet_constructivist.png', color: 'var(--trad-russia)',
      desc: 'Bold Cyrillic, red stars, dynamic diagonals. Three layers: Constructivist DNA (1920s), socialist-realist futurism (1960s), personality cult aesthetics (Gagarin/Korolev). The 2022 Red Star episode: explicit rejection of Western visual convergence.',
      examples: 'Roscosmos, RSC Energia, Glavkosmos' },
    { key: 'Chinese Cultural', region: 'China (Mission)', img: 'concepts/chinese_cultural.png', color: 'var(--trad-china)',
      desc: 'Calligraphy-dominant mission logos with auspicious clouds (祥云), celestial creatures, "gold-inlaid jade" palettes. The 人 (ren) character as CNSA\'s core symbol encoding "humans at the center."',
      examples: 'CNSA, CMSA mission patches, Shenzhou/Tianzhou' },
    { key: 'Chinese Corporate', region: 'China (Commercial)', img: 'concepts/chinese_corporate.png', color: 'var(--trad-china)',
      desc: 'Bilingual (Chinese + Latin), blue-and-white institutional. Nearly identical to Western startups except for Chinese characters. Evidence of partial isomorphism.',
      examples: 'CAS Space, Galaxy Space, Orienspace, Spacety' },
    { key: 'Indian Bilingual', region: 'India', img: 'concepts/indian_bilingual.png', color: 'var(--trad-india)',
      desc: 'Devanagari + Latin bilingual. Custom "Prakrta" typeface echoing Devanagari. Saffron/orange (national flag). Postcolonial assertion of indigenous technological capability.',
      examples: 'ISRO, IN-SPACe' },
    { key: 'African Postcolonial', region: 'Africa', img: 'concepts/african_postcolonial.png', color: 'var(--trad-africa)',
      desc: 'Pan-African colors (green, gold, red). AfSA logo crowdsourced from continental competition. Identity built from within. Development-framed rather than disruption-framed.',
      examples: 'AfSA, SANSA, EgSA, NASRDA, Kenya Space Agency' },
    { key: 'Japanese Monochrome', region: 'Japan', img: 'concepts/japanese_monochrome.png', color: 'var(--trad-japan)',
      desc: 'Strict black-and-white, more austere than Western minimalism. Rooted in Japanese design traditions (Muji, Kenya Hara), Buddhist aesthetics of negative space (ma, 間).',
      examples: 'ispace, Synspective, Axelspace, iQPS' },
    { key: 'Latin American National', region: 'Latin America', img: 'concepts/latin_american.png', color: 'var(--trad-latam)',
      desc: 'Strongest national flag color integration of any region. Brazilian green/gold/blue, Argentine blue/white. Overwhelmingly governmental, reflecting state-led development.',
      examples: 'AEB, INPE, CONAE, INVAP, AEM' },
  ];

  // === DOM refs ===
  const grid = document.getElementById('logos-grid');
  const searchEl = document.getElementById('search-input');
  const famSelect = document.getElementById('filter-family');
  const regSelect = document.getElementById('filter-region');
  const secSelect = document.getElementById('filter-sector');
  const countEl = document.getElementById('results-count');
  const activeFilterText = document.getElementById('active-filter-text');
  const dialog = document.getElementById('detail-dialog');

  // Navigation
  const viewArchive = document.getElementById('view-archive');
  const viewTraditions = document.getElementById('view-traditions');
  const viewTypology = document.getElementById('view-typology');
  
  document.getElementById('nav-archive').addEventListener('click', () => switchView('archive'));
  document.getElementById('nav-traditions').addEventListener('click', () => switchView('traditions'));
  document.getElementById('nav-typology').addEventListener('click', () => switchView('typology'));

  function switchView(view) {
    viewArchive.classList.add('hidden');
    viewTraditions.classList.add('hidden');
    viewTypology.classList.add('hidden');
    
    if (view === 'archive') viewArchive.classList.remove('hidden');
    if (view === 'traditions') viewTraditions.classList.remove('hidden');
    if (view === 'typology') viewTypology.classList.remove('hidden');
  }

  // === Build filter options from data ===
  function buildOptions() {
    const families = [...new Set(COMPANIES.map(c => c.family))].sort();
    const regions = [...new Set(COMPANIES.map(c => c.region))].sort();
    const sectors = [...new Set(COMPANIES.map(c => c.sector))].sort();
    families.forEach(f => { const o = document.createElement('option'); o.value = f; o.textContent = f; famSelect.appendChild(o); });
    regions.forEach(r => { const o = document.createElement('option'); o.value = r; o.textContent = r; regSelect.appendChild(o); });
    sectors.forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = s; secSelect.appendChild(o); });
  }

  // === Extract domain ===
  function domain(url) {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }

  // === Initials ===
  function initials(name) {
    return name.split(/[\s\-]+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  // === Render company cards ===
  function render(data) {
    grid.innerHTML = '';
    countEl.textContent = `RESULTS: ${data.length} SPECIMENS`;
    if (!data.length) { grid.innerHTML = '<div class="col-span-full p-16 text-center font-label-mono-md text-secondary">No specimens match the current criteria.</div>'; return; }

    const frag = document.createDocumentFragment();
    data.forEach((c, i) => {
      const el = document.createElement('article');
      el.className = 'brutal-border-r brutal-border-b bg-surface-container-lowest flex flex-col h-full group hover:bg-surface-variant transition-colors cursor-pointer outline-none focus:ring-2 ring-primary';
      el.setAttribute('role', 'listitem');
      el.setAttribute('tabindex', '0');

      const ini = initials(c.name);
      const safeName = c.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const dom = domain(c.website);
      
      const logoHtml = dom
        ? `<img src="logos/${safeName}.png" alt="${c.name}" class="max-w-[120px] max-h-[80px] object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply grayscale hover:grayscale-0" loading="lazy" onerror="if(!this.dataset.tried){this.dataset.tried='1';this.src='https://www.google.com/s2/favicons?domain=${dom}&sz=128';}else{this.replaceWith(Object.assign(document.createElement('div'),{className:'w-16 h-16 brutal-border flex items-center justify-center bg-transparent',innerHTML:'<span class=\\'font-headline-lg text-headline-lg\\'>${ini}</span>'}));}">`
        : `<div class="w-16 h-16 brutal-border flex items-center justify-center bg-transparent group-hover:bg-primary group-hover:text-white transition-colors duration-300"><span class="font-headline-lg text-headline-lg">${ini}</span></div>`;

      el.innerHTML = `
        <div class="w-full aspect-[4/3] brutal-border-b relative overflow-hidden bg-white p-6 flex items-center justify-center">
          <div class="absolute top-2 right-2 font-metadata text-metadata text-secondary z-10">REF-${String(i+1).padStart(3, '0')}</div>
          ${logoHtml}
        </div>
        <div class="p-3 flex flex-col gap-2 flex-grow">
          <div class="flex justify-between items-end border-b border-primary border-dashed pb-1">
            <span class="font-metadata text-metadata text-secondary w-16">ORG:</span>
            <span class="font-label-mono-md text-label-mono-md font-bold text-right truncate">${c.name}</span>
          </div>
          <div class="flex justify-between items-end border-b border-primary border-dashed pb-1">
            <span class="font-metadata text-metadata text-secondary w-16">FAM:</span>
            <span class="font-label-mono-md text-label-mono-md text-right truncate">${c.family}</span>
          </div>
          <div class="flex justify-between items-end border-b border-primary border-dashed pb-1">
            <span class="font-metadata text-metadata text-secondary w-16">LOC:</span>
            <span class="font-label-mono-md text-label-mono-md text-right truncate">${c.country || 'N/A'}</span>
          </div>
        </div>`;

      el.addEventListener('click', () => openDetail(c));
      el.addEventListener('keydown', e => { if (e.key === 'Enter') openDetail(c); });
      frag.appendChild(el);
    });
    grid.appendChild(frag);
  }

  // === Filter ===
  function applyFilters() {
    const q = searchEl.value.toLowerCase().trim();
    const fam = famSelect.value;
    const reg = regSelect.value;
    const sec = secSelect.value;
    
    const filtersActive = [fam, reg, sec].filter(v => v !== '').length + (q ? 1 : 0);
    activeFilterText.textContent = filtersActive > 0 ? `ACTIVE FILTERS: ${filtersActive}` : `ACTIVE FILTER: NONE`;

    const filtered = COMPANIES.filter(c => {
      if (q && !c.name.toLowerCase().includes(q) && !(c.country || '').toLowerCase().includes(q)) return false;
      if (fam && fam !== '' && c.family !== fam) return false;
      if (reg && reg !== '' && c.region !== reg) return false;
      if (sec && sec !== '' && c.sector !== sec) return false;
      return true;
    });
    render(filtered);
  }

  searchEl.addEventListener('input', applyFilters);
  famSelect.addEventListener('change', applyFilters);
  regSelect.addEventListener('change', applyFilters);
  secSelect.addEventListener('change', applyFilters);

  // === Detail dialog ===
  function openDetail(c) {
    const dom = domain(c.website);
    const safeName = c.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const ini = initials(c.name);
    const logoImg = dom ? `<img src="logos/${safeName}.png" alt="${c.name}" class="max-w-[200px] max-h-[120px] object-contain mix-blend-multiply" onerror="if(!this.dataset.tried){this.dataset.tried='1';this.src='https://www.google.com/s2/favicons?domain=${dom}&sz=128';}else{this.replaceWith(Object.assign(document.createElement('div'),{className:'font-headline-lg text-[4rem]',textContent:'${ini}'}));}">` : `<div class="font-headline-lg text-[4rem]">${ini}</div>`;
    
    document.getElementById('dialog-content').innerHTML = `
      <div class="w-full bg-white border-b border-primary p-8 flex items-center justify-center min-h-[200px]">
        ${logoImg}
      </div>
      <div class="p-6 md:p-8">
        <h2 class="font-headline-lg text-[2.5rem] leading-none mb-6">${c.name}</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 font-label-mono-md">
          <div class="flex flex-col border-b border-primary border-dashed pb-2">
            <span class="font-metadata text-secondary mb-1">Sector</span>
            <span>${c.sector}</span>
          </div>
          <div class="flex flex-col border-b border-primary border-dashed pb-2">
            <span class="font-metadata text-secondary mb-1">Year Founded</span>
            <span>${c.year || '—'}</span>
          </div>
          <div class="flex flex-col border-b border-primary border-dashed pb-2">
            <span class="font-metadata text-secondary mb-1">Country / HQ</span>
            <span>${c.country || '—'}</span>
          </div>
          <div class="flex flex-col border-b border-primary border-dashed pb-2">
            <span class="font-metadata text-secondary mb-1">Region</span>
            <span>${c.region || '—'}</span>
          </div>
          <div class="flex flex-col border-b border-primary border-dashed pb-2">
            <span class="font-metadata text-secondary mb-1">Typological Family</span>
            <span>${c.family || '—'}</span>
          </div>
        </div>
        
        <div>
          <h3 class="font-label-mono-sm uppercase underline decoration-primary underline-offset-4 mb-4">Visual Analysis</h3>
          <p class="font-body-md text-[1.1rem] leading-relaxed">${c.description || 'Visual analysis forthcoming.'}</p>
        </div>
        
        ${c.website ? `
        <div class="mt-8">
          <a href="${c.website}" target="_blank" class="inline-block brutal-border px-4 py-2 font-label-mono-sm uppercase hover:bg-primary hover:text-white transition-colors">Visit Official Site</a>
        </div>
        ` : ''}
      </div>
    `;

    dialog.showModal();
  }

  // Close on backdrop click and X button
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  document.getElementById('dialog-close').addEventListener('click', () => dialog.close());

  // === Build Typology Cards ===
  function buildFamilies() {
    const container = document.getElementById('typology-grid');
    FAMILIES.forEach(f => {
      const card = document.createElement('article');
      card.className = 'brutal-border-r brutal-border-b bg-surface-container-lowest flex flex-col h-full hover:bg-surface-variant transition-colors';
      card.innerHTML = `
        <div class="w-full aspect-[4/3] brutal-border-b bg-white p-6 flex items-center justify-center">
          <img src="${f.img}" alt="${f.key} archetype" loading="lazy" class="max-w-[200px] object-contain mix-blend-multiply grayscale">
        </div>
        <div class="p-6 flex flex-col flex-grow">
          <div class="flex justify-between items-baseline mb-4 border-b border-primary border-dashed pb-2">
            <span class="font-label-mono-md font-bold uppercase">${f.key}</span>
            <span class="font-metadata">${f.pct}</span>
          </div>
          <p class="font-body-md mb-6">${f.desc}</p>
          <p class="font-metadata uppercase mt-auto">EX: ${f.examples}</p>
        </div>`;
      container.appendChild(card);
    });
  }

  // === Build Traditions Cards ===
  function buildTraditions() {
    const container = document.getElementById('traditions-grid');
    TRADITIONS.forEach(t => {
      const card = document.createElement('article');
      card.className = 'brutal-border-r brutal-border-b bg-surface-container-lowest flex flex-col h-full hover:bg-surface-variant transition-colors';
      card.innerHTML = `
        <div class="w-full aspect-[4/3] brutal-border-b bg-white p-6 flex items-center justify-center">
          <img src="${t.img}" alt="${t.key}" loading="lazy" class="max-w-[200px] object-contain mix-blend-multiply grayscale">
        </div>
        <div class="p-6 flex flex-col flex-grow">
          <div class="flex justify-between items-baseline mb-4 border-b border-primary border-dashed pb-2">
            <span class="font-label-mono-md font-bold uppercase">${t.key}</span>
            <span class="font-metadata text-secondary">${t.region}</span>
          </div>
          <p class="font-body-md mb-6">${t.desc}</p>
          <p class="font-metadata uppercase mt-auto">EX: ${t.examples}</p>
        </div>`;
      container.appendChild(card);
    });
  }

  // === Init ===
  buildOptions();
  buildFamilies();
  buildTraditions();
  render(COMPANIES);
})();
