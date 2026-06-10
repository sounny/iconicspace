/* ============================================================
   ICONICSPACE — App Logic
   Uses native <dialog>, dynamic logo loading, filter/search
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
  const grid = document.getElementById('grid');
  const searchEl = document.getElementById('search');
  const famSelect = document.getElementById('filter-family');
  const regSelect = document.getElementById('filter-region');
  const secSelect = document.getElementById('filter-sector');
  const countEl = document.getElementById('count');
  const dialog = document.getElementById('detail-dialog');

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
    countEl.textContent = data.length + ' result' + (data.length !== 1 ? 's' : '');
    if (!data.length) { grid.innerHTML = '<div class="empty">No companies match your filters.</div>'; return; }

    const frag = document.createDocumentFragment();
    data.forEach(c => {
      const el = document.createElement('div');
      el.className = 'card';
      el.setAttribute('role', 'listitem');
      el.setAttribute('tabindex', '0');

      const ini = initials(c.name);
      const dom = domain(c.website);
      const logoHtml = dom
        ? `<div class="card-logo"><img src="https://logo.clearbit.com/${dom}" alt="" loading="lazy" onerror="this.parentElement.outerHTML='<div class=\\'card-fallback\\'>${ini}</div>'"></div>`
        : `<div class="card-fallback">${ini}</div>`;

      el.innerHTML = `
        <div class="card-top">
          ${logoHtml}
          <div><div class="card-name">${c.name}</div><div class="card-meta">${c.country} · ${c.year || ''}</div></div>
        </div>
        <div class="card-tags">
          <span class="tag tag-fam">${c.family}</span>
          <span class="tag">${c.sector}</span>
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
    const filtered = COMPANIES.filter(c => {
      if (q && !c.name.toLowerCase().includes(q) && !(c.country || '').toLowerCase().includes(q)) return false;
      if (fam !== 'all' && c.family !== fam) return false;
      if (reg !== 'all' && c.region !== reg) return false;
      if (sec !== 'all' && c.sector !== sec) return false;
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
    document.getElementById('d-name').textContent = c.name;
    document.getElementById('d-sector').textContent = c.sector;
    document.getElementById('d-year').textContent = c.year || '—';
    document.getElementById('d-country').textContent = c.country || '—';
    document.getElementById('d-family').textContent = c.family || '—';
    document.getElementById('d-region').textContent = c.region || '—';
    document.getElementById('d-desc').textContent = c.description || 'Visual analysis forthcoming.';

    const logo = document.getElementById('d-logo');
    if (dom) { logo.src = `https://logo.clearbit.com/${dom}`; logo.alt = c.name; logo.style.display = ''; logo.onerror = function(){ this.style.display='none'; }; }
    else { logo.style.display = 'none'; }

    const link = document.getElementById('d-link');
    if (c.website) { link.href = c.website; link.style.display = ''; }
    else { link.style.display = 'none'; }

    dialog.showModal();
  }

  // Close on backdrop click
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

  // === Build Typology Cards ===
  function buildFamilies() {
    const container = document.getElementById('family-grid');
    FAMILIES.forEach(f => {
      const card = document.createElement('article');
      card.className = 'family-card';
      card.innerHTML = `
        <div class="family-card-img"><img src="${f.img}" alt="${f.key} archetype" loading="lazy"></div>
        <div class="family-card-body">
          <span class="pill" style="background:color-mix(in oklch, ${f.color} 15%, transparent);color:${f.color}">${f.key}</span>
          <h3>${f.key}</h3>
          <p class="family-pct">${f.pct} of dataset</p>
          <p>${f.desc}</p>
          <p class="family-examples"><strong>Examples:</strong> ${f.examples}</p>
        </div>`;
      container.appendChild(card);
    });
  }

  // === Build Traditions Cards ===
  function buildTraditions() {
    const container = document.getElementById('traditions-grid');
    TRADITIONS.forEach(t => {
      const card = document.createElement('article');
      card.className = 'tradition-card';
      card.innerHTML = `
        <div class="tradition-card-img"><img src="${t.img}" alt="${t.key}" loading="lazy"></div>
        <div class="tradition-card-body">
          <span class="pill" style="background:color-mix(in oklch, ${t.color} 15%, transparent);color:${t.color}">${t.region}</span>
          <h3>${t.key}</h3>
          <p>${t.desc}</p>
          <p class="family-examples"><strong>Examples:</strong> ${t.examples}</p>
        </div>`;
      container.appendChild(card);
    });
  }

  // === Smooth scroll for nav ===
  document.querySelectorAll('.header-nav a').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id.startsWith('#')) {
        e.preventDefault();
        document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // === Init ===
  buildOptions();
  buildFamilies();
  buildTraditions();
  render(COMPANIES);
})();
