const AXES = ['Explore', 'Research', 'Compare', 'Purchase', 'Trade-in', 'Support'];

const PERSONAS = [
  {
    name: 'Shopper',
    description: '“Which RV is right for me?”',
    needs: 'Understand models and floorplans; compare features; see real inventory; understand pricing; find a trusted dealer.',
    content: 'Product imagery/video, floorplans, specs, comparisons, lifestyle content, buying guides.',
    context: 'Browsing behavior, models/floorplans viewed, location, inventory availability, dealer interactions.',
    activation: 'Turn anonymous interest into qualified purchase intent.',
    experience: 'Activate for discovery and consideration.',
    interests: [
      { label: 'Models & floorplans', value: 80 },
      { label: 'Features & comparisons', value: 70 },
      { label: 'Inventory & dealers', value: 60 },
    ],
    intent: {
      Explore: 0.85, Research: 0.8, Compare: 0.75, Purchase: 0.6, 'Trade-in': 0.15, Support: 0.2,
    },
    summary: 'Build confidence in a high-consideration purchase.',
    metrics: 'Leads, dealer visits, quote requests, sales.',
    trajectory: 'Inspiration → model discovery → comparison → floorplan → inventory → dealer/quote',
  },
  {
    name: 'Owner',
    description: '“Help me get the most from the RV I own.”',
    needs: 'Manuals and how-to content; warranty/service; maintenance; parts/accessories; troubleshooting; owner education.',
    content: 'Manuals, videos, maintenance guides, FAQs, service information, accessories.',
    context: 'Owned model, model year, configuration, warranty, service history, preferences.',
    activation: 'Turn ownership into engagement and loyalty.',
    experience: 'Activate for ownership and support.',
    interests: [
      { label: 'Manuals & how-to', value: 85 },
      { label: 'Maintenance & service', value: 80 },
      { label: 'Accessories & community', value: 60 },
    ],
    intent: {
      Explore: 0.4, Research: 0.6, Compare: 0.2, Purchase: 0.2, 'Trade-in': 0.1, Support: 0.95,
    },
    summary: 'Maximize enjoyment, reliability and ownership value.',
    metrics: 'Satisfaction, retention, service engagement, advocacy.',
    trajectory: 'Registration → onboarding → how-to → maintenance → service/support → community',
  },
  {
    name: 'Upgrader',
    description: '“What should I move into next?”',
    needs: 'Compare current RV with potential upgrade; understand new features/models; assess trade-in; locate inventory; reconnect with dealer.',
    content: '“What’s new,” model comparisons, upgrade guides, personalized recommendations, trade-in content.',
    context: 'Owned RV + previous behavior + emerging needs + dealer relationship.',
    activation: 'Turn an existing relationship into repeat purchase.',
    experience: 'Activate using the existing relationship to drive the next best experience.',
    interests: [
      { label: 'New models & comparisons', value: 85 },
      { label: 'Trade-in & upgrade guides', value: 80 },
      { label: 'Inventory & dealer next steps', value: 70 },
    ],
    intent: {
      Explore: 0.65, Research: 0.8, Compare: 0.9, Purchase: 0.75, 'Trade-in': 0.85, Support: 0.35,
    },
    summary: 'Find a better fit as needs and experience change.',
    metrics: 'Trade-ins, upgrades, cross-sell, lifetime value.',
    trajectory: 'New need → research → comparison → trade-in → dealer → purchase',
  },
];

function polarPoint(centerX, centerY, radius, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleRad),
    y: centerY + radius * Math.sin(angleRad),
  };
}

function pointsToAttr(points) {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

function renderRadar(svg, intent) {
  const size = 260;
  const center = size / 2;
  const maxRadius = 95;
  const step = 360 / AXES.length;

  svg.innerHTML = '';
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  // grid rings
  [0.25, 0.5, 0.75, 1].forEach((ratio) => {
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const points = AXES.map((_, i) => polarPoint(center, center, maxRadius * ratio, i * step));
    ring.setAttribute('points', pointsToAttr(points));
    ring.setAttribute('class', 'persona-radar-grid');
    svg.append(ring);
  });

  // axis lines + labels
  AXES.forEach((axis, i) => {
    const outer = polarPoint(center, center, maxRadius, i * step);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', center);
    line.setAttribute('y1', center);
    line.setAttribute('x2', outer.x);
    line.setAttribute('y2', outer.y);
    line.setAttribute('class', 'persona-radar-axis');
    svg.append(line);

    const labelPoint = polarPoint(center, center, maxRadius + 16, i * step);
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', labelPoint.x);
    label.setAttribute('y', labelPoint.y);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('class', 'persona-radar-label');
    label.textContent = axis;
    svg.append(label);
  });

  // filled shape
  const shapePoints = AXES.map((axis, i) => polarPoint(
    center,
    center,
    maxRadius * (intent[axis] ?? 0),
    i * step,
  ));
  const shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  shape.setAttribute('points', pointsToAttr(shapePoints));
  shape.setAttribute('class', 'persona-radar-shape');
  svg.append(shape);
}

function renderPersona(persona) {
  document.getElementById('persona-name').textContent = persona.name;
  document.getElementById('persona-description').textContent = persona.description;
  document.getElementById('persona-summary').textContent = persona.summary;
  document.getElementById('persona-metrics').textContent = persona.metrics;
  document.getElementById('persona-trajectory').textContent = persona.trajectory;
  ['needs', 'content', 'context', 'activation', 'experience'].forEach((field) => {
    document.getElementById(`persona-${field}`).textContent = persona[field];
  });

  const interests = document.getElementById('persona-interests');
  interests.innerHTML = '';
  persona.interests.forEach((interest) => {
    const row = document.createElement('div');
    row.className = 'persona-interest';
    row.innerHTML = `
      <span class="persona-interest-label">${interest.label}</span>
      <span class="persona-interest-track">
        <span class="persona-interest-fill" style="width: ${interest.value}%"></span>
      </span>
      <span class="persona-interest-value">${interest.value}%</span>
    `;
    interests.append(row);
  });

  renderRadar(document.getElementById('persona-radar'), persona.intent);
}

const REGIONS = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL',
  'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
  'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY', 'DC'];

// The palette runs in an iframe served from the preview host, i.e. cross-origin
// with the content page — so window.top.location is unreadable. The Sidekick
// passes the real content URL (incl. its query string) as a ?referrer= param
// when the plugin config sets "passReferrer": true; that is the authoritative
// source. Fall back to a same-origin ancestor, then document.referrer.
// Navigation of window.top IS allowed cross-origin even when reading is not.
function pageContext() {
  let navWin = window;
  try { navWin = window.top || window.parent || window; } catch (e) { navWin = window.parent || window; }

  try {
    const ref = new URLSearchParams(window.location.search).get('referrer');
    if (ref) return { win: navWin, url: new URL(ref) };
  } catch (e) { /* noop */ }

  const ancestors = [];
  try { if (window.top && window.top !== window) ancestors.push(window.top); } catch (e) { /* noop */ }
  try { if (window.parent && window.parent !== window) ancestors.push(window.parent); } catch (e) { /* noop */ }
  for (let i = 0; i < ancestors.length; i += 1) {
    try { return { win: ancestors[i], url: new URL(ancestors[i].location.href) }; } catch (e) { /* cross-origin */ }
  }

  try { if (document.referrer) return { win: navWin, url: new URL(document.referrer) }; } catch (e) { /* noop */ }
  return { win: window, url: new URL(window.location.href) };
}

// Navigate the actual content page so the edge re-personalizes it server-side.
// The Sidekick palette closes when it loses focus, so we do this ONCE on an
// explicit Apply — never on every control change — letting the user set the
// persona, the logged-in toggle, and the region while the palette stays open.
function navigateTo(url) {
  const { win } = pageContext();
  try { win.location.href = url.toString(); } catch (e) { window.open(url.toString(), '_top'); }
}

// Build the personalized URL from the current selections (no navigation).
function buildUrl() {
  const { url } = pageContext();
  const p = Number(document.getElementById('persona-select').value) + 1;
  url.searchParams.set('p', String(p));
  url.searchParams.set('li', document.getElementById('persona-loggedin').checked ? 'true' : 'false');
  const region = document.getElementById('persona-region').value;
  if (region) url.searchParams.set('region', region); else url.searchParams.delete('region');
  return url;
}

function applyToUrl() {
  navigateTo(buildUrl());
}

function resetUrl(select, loggedin, region) {
  select.value = '0';
  loggedin.checked = false;
  region.value = '';
  renderPersona(PERSONAS[0]);
  const { url } = pageContext();
  ['p', 'persona', 'li', 'loggedin', 'region', 'r'].forEach((k) => url.searchParams.delete(k));
  url.searchParams.set('demo-profile-reset', '1');
  navigateTo(url);
}

// Resolve the current selections. head.html persists them durably as a
// `demoProfile` object (localStorage + cookie) on the content page, which
// survives navigation and URL cleanup. Read accessible storage, then let explicit
// content-page query params override it, as head.html does.
function getCurrentProfile() {
  let prof = {};
  const wins = [];
  try { if (window.top && window.top !== window) wins.push(window.top); } catch (e) { /* noop */ }
  try { if (window.parent && window.parent !== window) wins.push(window.parent); } catch (e) { /* noop */ }
  wins.push(window);
  for (let i = 0; i < wins.length; i += 1) {
    try {
      const raw = wins[i].localStorage.getItem('demoProfile');
      if (raw) { prof = JSON.parse(raw); break; }
    } catch (e) { /* cross-origin / unavailable */ }
    try {
      const m = wins[i].document.cookie.match(/(?:^|;\s*)demoProfile=([^;]+)/);
      if (m) { prof = JSON.parse(decodeURIComponent(m[1])); break; }
    } catch (e) { /* cross-origin / unavailable */ }
  }
  try {
    const q = pageContext().url.searchParams;
    const p = q.get('p') ?? q.get('persona'); if (p) prof.persona = Number(p);
    const li = q.get('li') ?? q.get('loggedin'); if (li !== null) prof.loggedIn = (li === '1' || li === 'true');
    const r = q.get('region') ?? q.get('r'); if (r) prof.region = r.toUpperCase();
    return prof;
  } catch (e) { return prof; }
}

function readParamsIntoControls(select, loggedin, region) {
  try {
    const prof = getCurrentProfile();
    if (Number.isInteger(prof.persona) && prof.persona >= 1 && prof.persona <= PERSONAS.length) {
      select.value = String(prof.persona - 1);
    } else if (prof.persona !== undefined) {
      document.getElementById('persona-status').textContent = 'Unsupported legacy persona. Choose Shopper, Owner or Upgrader and Apply.';
    }
    if (typeof prof.loggedIn === 'boolean') loggedin.checked = prof.loggedIn;
    if (prof.region) region.value = String(prof.region).toUpperCase();
  } catch (e) { /* leave defaults */ }
}

function init() {
  const select = document.getElementById('persona-select');
  const loggedin = document.getElementById('persona-loggedin');
  const region = document.getElementById('persona-region');

  select.innerHTML = PERSONAS.map((p, i) => `<option value="${i}">${p.name}</option>`).join('');
  region.innerHTML = `<option value="">Region (state)</option>${
    REGIONS.map((c) => `<option value="${c}">${c}</option>`).join('')}`;

  readParamsIntoControls(select, loggedin, region);

  // Control changes only update the palette's own preview card — they do NOT
  // navigate, so the palette stays open while all three are set. Navigation
  // happens once, on Apply.
  select.addEventListener('change', () => renderPersona(PERSONAS[Number(select.value)]));
  document.getElementById('persona-apply').addEventListener('click', applyToUrl);
  document.getElementById('persona-reset').addEventListener('click', () => resetUrl(select, loggedin, region));

  renderPersona(PERSONAS[Number(select.value)]);
}

init();
