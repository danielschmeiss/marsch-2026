(function () {
  'use strict';

  // ---------- Daten ----------

  // km = Streckenkilometer auf dem GPX-Track; official = gerundete Angabe aus der Teilnehmerinfo.
  const VPS = [
    { id: 'VP1', name: 'Schöneiche', km: 7.61, official: 8, lat: 52.46931, lon: 13.67922,
      address: 'Friedrichshagener Str. 74, 15566 Schöneiche', open: '7:30–10:20',
      text: 'Erster Verpflegungspunkt am Waldrand, an der Grenze Berlin/Brandenburg. 4 Toiletten, belegte Brote, Tee.' },
    { id: 'VP2', name: 'Woltersdorfer Schleuse', km: 16.03, official: 17, lat: 52.44275, lon: 13.76553,
      address: 'Brunnenstr. 1, 15569 Woltersdorf', open: '8:45–12:00',
      text: 'Direkt an der Schleuse mit Klappbrücke. Wer Zeit hat: Auf dem Kranichsberg gleich nebenan steht ein Aussichtsturm.' },
    { id: 'VP3', name: 'Erkner, Löcknitz', km: 30.75, official: 30, lat: 52.42142, lon: 13.76303,
      address: 'Theodor-Fontane-Weg 1, 15537 Erkner', open: '9:50–15:00',
      text: 'An der Fangschleusenstraße, gleich neben dem Löcknitz-Idyll-Imbiss. Parkplatz gegenüber.' },
    { id: 'VP4', name: 'Müggelhort', km: 39.34, official: 40, lat: 52.4320, lon: 13.6730,
      address: 'Straße zum Müggelhort, Ecke Elsnerweg, 12559 Berlin', open: '10:20–17:40',
      text: 'Letzter Verpflegungspunkt, ungefähr an der Einmündung Elsnerweg. Danach nur noch ein Berg und ein See.' },
  ];

  const HIGHLIGHTS = [
    { name: 'Wilhelmshagen-Woltersdorfer Dünenzug', km: 13.66,
      text: 'Eine Binnendüne aus der Eiszeit, mitten im Wald. Ein Stück Sahara im Berliner Osten.' },
    { name: 'Grünheide (Mark)', km: 22.14,
      text: 'Östlichster Punkt der Strecke. Ab hier geht es Richtung Heimat, und kurz danach ist Halbzeit.' },
    { name: 'Löcknitztal', km: 28.0,
      text: 'Naturschutzgebiet an der Löcknitz: Wald, Wasser, Holzstege. Einer der schönsten Abschnitte.' },
    { name: 'Großer Müggelberg', km: 42.65,
      text: 'Gut 114 Meter hoch, der höchste natürliche Punkt Berlins. Und er kommt ausgerechnet bei km 42.' },
    { name: 'Großer Müggelsee', km: 47.5,
      text: 'Berlins größter See. Am Ufer entlang geht es die letzten Kilometer zurück nach Friedrichshagen.' },
  ];

  const START = { name: 'Start & Ziel', lat: 52.45303, lon: 13.61092,
    address: 'Sportplatz Hirschgartendreieck, Fürstenwalder Damm 366, 12587 Berlin' };

  // Statusmeldungen beim Gehen: gilt ab dem jeweiligen Streckenkilometer.
  const WALKING = [
    [0, 'Frisch gestartet. Die Beine wissen noch nicht, was heute auf sie zukommt.'],
    [2, 'Im Wald Richtung Schöneiche. Laune: bestens, Kaffee: wirkt.'],
    [6, 'Kurz vor VP1. Der Magen hat das erste Käsebrot schon vorbestellt.'],
    [VPS[0].km, 'Frisch gestärkt nach VP1, jetzt ostwärts.'],
    [11.5, 'Über den Dünenzug. Sand im Schuh gibt es gratis dazu.'],
    [15, 'Woltersdorf in Sicht, gleich wartet VP2 an der Schleuse.'],
    [VPS[1].km, 'Nach VP2 weiter nach Osten. Das längste Stück ohne Verpflegung beginnt.'],
    [20.5, 'Ganz im Osten bei Grünheide. Die Halbzeit ist zum Greifen nah!'],
    [25.05, 'Halbzeit geschafft! Ab jetzt zählt jeder Schritt rückwärts.'],
    [27, 'Durchs Löcknitztal. Wald, Wasser, Holzstege, sehr fotogen.'],
    [29.3, 'Endspurt zu VP3. Die Cola ist gedanklich schon kaltgestellt.'],
    [VPS[2].km, 'Hinter Erkner Richtung Müggelspree. 30 km sind im Sack.'],
    [35, 'Die Füße melden sich zu Wort. Noch ein paar Kilometer bis VP4.'],
    [VPS[3].km, 'Letzter VP geschafft. Jetzt nur noch ein Berg und ein See.'],
    [41.6, 'Kämpft sich den Großen Müggelberg hoch ⛰️'],
    [43.3, 'Bergab Richtung Müggelsee. Die Knie haben dazu eine Meinung.'],
    [46.5, 'Am Müggelsee entlang. Das Ziel kann man fast schon riechen.'],
    [49, 'Die letzten Meter! Die Medaille ist in Reichweite 🏅'],
  ];
  const PAUSING = {
    VP1: 'Sitzt an VP1 und testet die belegten Brote. Rein wissenschaftlich natürlich 🥪',
    VP2: 'Pause an der Woltersdorfer Schleuse: Blick aufs Wasser, Banane in der Hand 🍌',
    VP3: 'Cola-Pause an VP3 in Erkner. 30 km sind geschafft 🥤',
    VP4: 'Letzte Pause an VP4. Gummibärchen tanken für den Endspurt 🐻',
  };

  // ---------- Prognose ----------

  const plan = Plan.createPlan(window.ROUTE, VPS);
  const FINISH = plan.finish;
  const fmtKm = (km) => km.toFixed(1).replace('.', ',');
  const clock = Plan.clock;

  function statusText(s) {
    if (s.mode === 'before' || s.mode === 'start') return 'Steht an der Startlinie in Friedrichshagen. Startnummer 10 sitzt, Schuhe sind geschnürt.';
    if (s.mode === 'finished') return 'Angekommen! Medaille um den Hals, Füße hoch 🏅';
    if (s.mode === 'pause') return PAUSING[s.vp.id];
    let text = WALKING[0][1];
    for (const [km, t] of WALKING) if (s.km >= km) text = t;
    return text;
  }

  // ---------- Männchen ----------

  const WALKER_SVG = `
    <svg class="walker" viewBox="0 0 48 60" aria-hidden="true">
      <ellipse class="walker__shadow" cx="24" cy="56" rx="11" ry="2.6"/>
      <g class="walker__leg walker__leg--back"><path d="M22 36 L20 46 L19 54" /><path class="boot" d="M16.5 54.5 h6"/></g>
      <g class="walker__arm walker__arm--back"><path d="M20 23 L15 31" /></g>
      <rect class="walker__pack" x="11" y="19" width="8" height="14" rx="2.5"/>
      <rect class="walker__torso" x="16" y="18" width="13" height="19" rx="4"/>
      <rect class="walker__bib" x="18.5" y="23" width="8.5" height="7" rx="1"/>
      <text class="walker__num" x="22.75" y="28.8" text-anchor="middle">10</text>
      <g class="walker__leg walker__leg--front"><path d="M25 36 L27 46 L28 54" /><path class="boot" d="M26 54.5 h6"/></g>
      <circle class="walker__head" cx="23" cy="11.5" r="5.5"/>
      <path class="walker__hat" d="M15.5 9.8 h15 M18 9.8 q5 -8 10 0"/>
      <g class="walker__arm walker__arm--front">
        <path d="M26 23 L33 30" />
        <path class="walker__stick" d="M33 26 L36 55" />
      </g>
    </svg>`;

  function walkerIcon() {
    return L.divIcon({ className: 'walker-icon', html: `<div class="walker-wrap">${WALKER_SVG}</div>`, iconSize: [48, 60], iconAnchor: [24, 56] });
  }

  // ---------- Karte ----------

  const map = L.map('map', { zoomControl: true, attributionControl: false, zoomSnap: 0.25 })
    .fitBounds(L.latLngBounds(window.ROUTE), { padding: [20, 20] });
  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    subdomains: 'abc', maxZoom: 17, crossOrigin: true,
  }).addTo(map);
  L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);

  const Compass = L.Control.extend({
    options: { position: 'topright' },
    onAdd() {
      const el = L.DomUtil.create('div', 'compass');
      el.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="29" class="compass__ring"/>
        <circle cx="32" cy="32" r="23" class="compass__ring compass__ring--thin"/>
        <path d="M32 6 L37 32 L32 28 L27 32 Z" class="compass__n"/>
        <path d="M32 58 L27 32 L32 36 L37 32 Z" class="compass__s"/>
        <path d="M6 32 L32 27 L28 32 L32 37 Z" class="compass__s"/>
        <path d="M58 32 L32 37 L36 32 L32 27 Z" class="compass__s"/>
        <text x="32" y="5" text-anchor="middle">N</text></svg>`;
      return el;
    },
  });
  new Compass().addTo(map);

  const Legend = L.Control.extend({
    options: { position: 'bottomleft' },
    onAdd() {
      const el = L.DomUtil.create('div', 'legend');
      const open = window.matchMedia('(min-width: 600px)').matches ? ' open' : '';
      el.innerHTML = `<details${open}><summary>Legende</summary>
        <span><i class="lg lg--done"></i>schon gelaufen</span>
        <span><i class="lg lg--todo"></i>noch vor Daniel</span>
        <span><i class="lg lg--corridor"></i>Korridor</span>
        <span><i class="lg lg--vp">VP</i>Verpflegung</span>
        <span><i class="lg lg--hl">✦</i>Highlight</span></details>`;
      L.DomEvent.disableClickPropagation(el);
      return el;
    },
  });
  new Legend().addTo(map);

  const routeLatLngs = window.ROUTE;
  L.polyline(routeLatLngs, { className: 'route-halo', weight: 10, interactive: false }).addTo(map);
  const todoLine = L.polyline(routeLatLngs, { className: 'route-todo', weight: 3.5, dashArray: '8 7', interactive: false }).addTo(map);
  const corridorLine = L.polyline([], { className: 'route-corridor', weight: 16, lineCap: 'round', interactive: false }).addTo(map);
  const doneLine = L.polyline([], { className: 'route-done', weight: 4.5, interactive: false }).addTo(map);
  const hitLine = L.polyline(routeLatLngs, { className: 'route-hit', weight: 26, opacity: 0 }).addTo(map);

  const mapsLink = (lat, lon) => `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(5)},${lon.toFixed(5)}`;
  const setTimeBtn = (t) => `<button type="button" class="popup__btn" data-set-time="${Math.round(t)}">Karte auf ${clock(t)} Uhr stellen</button>`;

  function windowLine(km) {
    const [a, b] = plan.windowAt(km);
    return `<p class="popup__window">Zeitfenster: <b>${clock(a)}–${clock(b)} Uhr</b></p>`;
  }

  function routePopup(km) {
    const [lat, lon] = plan.pointAt(km);
    const t = plan.arrivalAt(km);
    return `<div class="popup">
      <p class="popup__kicker">Streckenkilometer ${fmtKm(km)}</p>
      <p class="popup__time">hier ca. <b>${clock(t)} Uhr</b></p>
      ${windowLine(km)}
      ${setTimeBtn(t)}
      <a class="popup__link" href="${mapsLink(lat, lon)}" target="_blank" rel="noopener">In Google Maps öffnen ↗</a>
    </div>`;
  }

  hitLine.on('click', (e) => {
    const km = plan.nearestKm([e.latlng.lat, e.latlng.lng]);
    L.popup({ className: 'paper-popup' }).setLatLng(plan.pointAt(km)).setContent(routePopup(km)).openOn(map);
  });

  // VP-Marker
  for (const vp of VPS) {
    const arr = plan.arrivalAt(vp.km);
    const icon = L.divIcon({ className: 'vp-icon', html: `<span>${vp.id}</span>`, iconSize: [40, 40], iconAnchor: [20, 20] });
    L.marker([vp.lat, vp.lon], { icon, riseOnHover: true, keyboard: true, title: `${vp.id} ${vp.name}` })
      .bindPopup(() => `<div class="popup">
        <p class="popup__kicker">${vp.id} · nach ca. ${vp.official} km</p>
        <h3>${vp.name}</h3>
        <p class="popup__time">Ankunft <b>${clock(arr)}</b> · weiter <b>${clock(arr + Plan.VP_PAUSE)} Uhr</b></p>
        ${windowLine(vp.km)}
        <p>${vp.text}</p>
        <p class="popup__meta">${vp.address}<br>geöffnet ${vp.open} Uhr</p>
        ${setTimeBtn(arr)}
        <a class="popup__link" href="${mapsLink(vp.lat, vp.lon)}" target="_blank" rel="noopener">In Google Maps öffnen ↗</a>
      </div>`, { className: 'paper-popup' })
      .addTo(map);
  }

  // Highlights
  for (const hl of HIGHLIGHTS) {
    const [lat, lon] = plan.pointAt(hl.km);
    const t = plan.arrivalAt(hl.km);
    const icon = L.divIcon({ className: 'hl-icon', html: '<span>✦</span>', iconSize: [28, 28], iconAnchor: [14, 14] });
    L.marker([lat, lon], { icon, title: hl.name })
      .bindPopup(`<div class="popup">
        <p class="popup__kicker">Highlight · km ${fmtKm(hl.km)}</p>
        <h3>${hl.name}</h3>
        <p>${hl.text}</p>
        <p class="popup__time">Daniel kommt ca. <b>${clock(t)} Uhr</b> vorbei</p>
        ${windowLine(hl.km)}
        ${setTimeBtn(t)}
        <a class="popup__link" href="${mapsLink(lat, lon)}" target="_blank" rel="noopener">In Google Maps öffnen ↗</a>
      </div>`, { className: 'paper-popup' })
      .addTo(map);
  }

  // Start/Ziel
  L.marker([START.lat, START.lon], {
    icon: L.divIcon({ className: 'flag-icon', html: '<span>⚑</span>', iconSize: [34, 34], iconAnchor: [8, 30] }),
    title: START.name,
  }).bindPopup(`<div class="popup">
      <p class="popup__kicker">Friedrichshagen</p>
      <h3>${START.name}</h3>
      <p class="popup__time">Start <b>6:40 Uhr</b> · Ziel ca. <b>${clock(FINISH)} Uhr</b></p>
      ${windowLine(plan.total)}
      <p class="popup__meta">${START.address}</p>
      ${setTimeBtn(FINISH)}
      <a class="popup__link" href="${mapsLink(START.lat, START.lon)}" target="_blank" rel="noopener">In Google Maps öffnen ↗</a>
    </div>`, { className: 'paper-popup' }).addTo(map);

  const walker = L.marker(plan.pointAt(0), { icon: walkerIcon(), interactive: false, zIndexOffset: 1000 }).addTo(map);

  // ---------- Wanderpass (Panel) ----------

  const $ = (id) => document.getElementById(id);
  const slider = $('time');
  slider.max = String(Math.ceil(FINISH));

  const STAMPS = [...VPS.map((vp) => ({ label: vp.id, sub: vp.name, km: vp.km })), { label: 'Ziel', sub: 'Friedrichshagen', km: plan.total }];

  $('ticks').innerHTML = STAMPS.map((s) =>
    `<span style="left:${(plan.arrivalAt(s.km) / FINISH) * 100}%">${s.label}</span>`).join('');

  $('stamps').innerHTML = STAMPS.map((s, i) => `
    <li class="stamp" data-i="${i}">
      <svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="35"/><circle cx="40" cy="40" r="29" class="thin"/></svg>
      <span class="stamp__label">${s.label}</span>
      <span class="stamp__time">${clock(plan.arrivalAt(s.km))}</span>
    </li>`).join('');
  const stampEls = [...document.querySelectorAll('.stamp')];

  $('timetable').innerHTML = [
    { label: 'Start', sub: 'Friedrichshagen', km: 0, t: 0, win: '6:40' },
    ...STAMPS.map((s) => {
      const [a, b] = plan.windowAt(s.km);
      return { ...s, t: plan.arrivalAt(s.km), win: `${clock(a)}–${clock(b)}` };
    }),
  ].map((r) => `<tr data-t="${Math.round(r.t)}" tabindex="0">
      <td><b>${r.label}</b><small>${r.sub} · km ${fmtKm(r.km)}</small></td>
      <td class="num">${clock(r.t)}</td><td class="num">${r.win}</td></tr>`).join('');

  let current = 0;
  let lastFacing = 1;

  function render(t) {
    current = t;
    const s = plan.stateAt(t);
    const [ca, cb] = plan.corridorAt(t);

    doneLine.setLatLngs(plan.sliceRoute(0, s.km));
    todoLine.setLatLngs(plan.sliceRoute(s.km, plan.total));
    corridorLine.setLatLngs(cb - ca > 0.01 ? plan.sliceRoute(ca, cb) : []);

    walker.setLatLng(plan.pointAt(s.km));
    const a = plan.pointAt(s.km - 0.08), b = plan.pointAt(s.km + 0.08);
    if (Math.abs(b[1] - a[1]) > 1e-5) lastFacing = b[1] >= a[1] ? 1 : -1;
    const wrap = walker.getElement() && walker.getElement().querySelector('.walker-wrap');
    if (wrap) {
      wrap.dataset.mode = s.mode;
      wrap.style.setProperty('--facing', lastFacing);
    }

    $('clock-time').textContent = clock(t);
    $('clock-km').textContent = s.mode === 'pause'
      ? `Pause an ${s.vp.id} · km ${fmtKm(s.km)}`
      : `km ${fmtKm(s.km)} von ${fmtKm(plan.total)}`;
    $('status').textContent = statusText(s);
    $('corridor').textContent = t > 0 && s.mode !== 'finished'
      ? `Wahrscheinlich irgendwo zwischen km ${fmtKm(ca)} und km ${fmtKm(cb)}.`
      : '';

    stampEls.forEach((el, i) => {
      const done = t >= plan.arrivalAt(STAMPS[i].km);
      if (done !== el.classList.contains('is-stamped')) el.classList.toggle('is-stamped', done);
    });
    if (Number(slider.value) !== Math.round(t)) slider.value = String(Math.round(t));
    slider.style.setProperty('--p', `${(t / FINISH) * 100}%`);
  }

  // ---------- Zeitsteuerung ----------

  let following = false;
  let playing = null;

  function stopPlay() {
    if (playing) cancelAnimationFrame(playing.raf);
    playing = null;
    $('btn-play').textContent = '▶ Tag abspielen';
  }

  function setTime(t, { follow = false } = {}) {
    stopPlay();
    following = follow;
    $('btn-now').classList.toggle('is-active', follow);
    render(Math.min(Math.max(t, 0), FINISH));
  }

  slider.addEventListener('input', () => setTime(Number(slider.value)));

  $('btn-play').addEventListener('click', () => {
    if (playing) return stopPlay();
    following = false;
    $('btn-now').classList.remove('is-active');
    const from = current >= FINISH - 1 ? 0 : current;
    const duration = 20000 * ((FINISH - from) / FINISH);
    const t0 = performance.now();
    playing = {};
    $('btn-play').textContent = '❚❚ Pause';
    const step = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      render(from + (FINISH - from) * p);
      if (p < 1) playing.raf = requestAnimationFrame(step);
      else stopPlay();
    };
    playing.raf = requestAnimationFrame(step);
  });

  $('btn-now').addEventListener('click', () => {
    const now = Plan.elapsedNow();
    setTime(now, { follow: now >= 0 && now <= FINISH });
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-set-time]');
    if (btn) { setTime(Number(btn.dataset.setTime)); map.closePopup(); }
  });
  $('timetable').addEventListener('click', (e) => {
    const row = e.target.closest('tr[data-t]');
    if (row) setTime(Number(row.dataset.t));
  });
  $('timetable').addEventListener('keydown', (e) => {
    const row = e.target.closest('tr[data-t]');
    if (row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setTime(Number(row.dataset.t)); }
  });

  // ---------- Renntag: Countdown, live, angekommen ----------

  const banner = $('banner');
  function updateBanner() {
    const now = Plan.elapsedNow();
    banner.hidden = false;
    if (now < 0) {
      const mins = Math.ceil(-now);
      const d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60), m = mins % 60;
      const parts = [d && `${d} ${d === 1 ? 'Tag' : 'Tage'}`, (d || h) && `${h} Std.`, `${m} Min.`].filter(Boolean);
      banner.dataset.phase = 'countdown';
      banner.innerHTML = `Start in <b>${parts.join(' ')}</b> · 3. Oktober, 6:40 Uhr`;
      $('btn-now').disabled = true;
    } else if (now <= FINISH) {
      banner.dataset.phase = 'live';
      banner.innerHTML = `<span class="dot"></span> Heute ist Marschtag! Die Karte zeigt, wo Daniel <b>laut Plan</b> gerade ist.`;
      $('btn-now').disabled = false;
      if (following) render(now);
    } else {
      banner.dataset.phase = 'done';
      banner.innerHTML = `🏅 Laut Plan ist Daniel um <b>${clock(FINISH)} Uhr</b> im Ziel angekommen.`;
      $('btn-now').disabled = true;
      if (following) setTime(FINISH);
    }
  }

  // #10:15 in der URL öffnet die Karte zu dieser Uhrzeit (zum Weiterschicken).
  const hash = location.hash.match(/^#(\d{1,2}):(\d{2})$/);
  const nowAtLoad = Plan.elapsedNow();
  if (hash) setTime(Number(hash[1]) * 60 + Number(hash[2]) - (6 * 60 + 40));
  else if (nowAtLoad >= 0 && nowAtLoad <= FINISH) setTime(nowAtLoad, { follow: true });
  else setTime(nowAtLoad > FINISH ? FINISH : 0);
  updateBanner();
  setInterval(updateBanner, 20000);
})();
