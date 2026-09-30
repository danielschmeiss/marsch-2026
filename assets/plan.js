// Prognose: Uhrzeit <-> Streckenkilometer. Ohne DOM, damit sie auch in Node testbar ist.
// Zeiten sind Minuten seit dem Start (6:40 Uhr), Positionen Streckenkilometer.
(function (root) {
  const START_UTC = Date.UTC(2026, 9, 3, 4, 40); // 3.10.2026, 6:40 MESZ
  const START_CLOCK = 6 * 60 + 40;
  const SPEED_KMH = 5;
  const VP_PAUSE = 15;
  const CORRIDOR = 0.1;

  function haversineKm(a, b) {
    const rad = Math.PI / 180;
    const dLat = (b[0] - a[0]) * rad;
    const dLon = (b[1] - a[1]) * rad;
    const h = Math.sin(dLat / 2) ** 2 +
      Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * 6371.0088 * Math.asin(Math.sqrt(h));
  }

  function createPlan(route, vps) {
    const cum = [0];
    for (let i = 1; i < route.length; i++) cum.push(cum[i - 1] + haversineKm(route[i - 1], route[i]));
    const total = cum[cum.length - 1];
    const stops = [...vps].sort((a, b) => a.km - b.km);
    const walk = (km) => (km / SPEED_KMH) * 60;

    // Ankunft am Streckenkilometer: Gehzeit plus alle VP-Pausen davor.
    function arrivalAt(km) {
      return walk(km) + VP_PAUSE * stops.filter((vp) => vp.km < km).length;
    }
    function departureAt(km) {
      return arrivalAt(km) + (stops.some((vp) => vp.km === km) ? VP_PAUSE : 0);
    }
    const finish = arrivalAt(total);

    // Position und Zustand zur Zeit t.
    function stateAt(t) {
      if (t <= 0) return { km: 0, mode: t < 0 ? 'before' : 'start', vp: null };
      let km = 0, t0 = 0;
      for (const vp of stops) {
        const arr = t0 + walk(vp.km - km);
        if (t < arr) return { km: km + ((t - t0) / 60) * SPEED_KMH, mode: 'walking', vp: null };
        if (t < arr + VP_PAUSE) return { km: vp.km, mode: 'pause', vp };
        km = vp.km;
        t0 = arr + VP_PAUSE;
      }
      const pos = km + ((t - t0) / 60) * SPEED_KMH;
      return pos >= total ? { km: total, mode: 'finished', vp: null } : { km: pos, mode: 'walking', vp: null };
    }
    const kmAt = (t) => stateAt(t).km;

    // Korridor: Streckenabschnitt für t ± 10 % der vergangenen Zeit.
    function corridorAt(t) {
      const e = Math.max(t, 0) * CORRIDOR;
      return [kmAt(t - e), kmAt(t + e)];
    }

    // Zeitfenster: Zeiten, zu denen der Punkt im Korridor liegt.
    function windowAt(km) {
      return [arrivalAt(km) / (1 + CORRIDOR), Math.min(departureAt(km) / (1 - CORRIDOR), finish / (1 - CORRIDOR))];
    }

    function indexAt(km) {
      let lo = 0, hi = cum.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] <= km) lo = mid; else hi = mid;
      }
      return lo;
    }
    function pointAt(km) {
      km = Math.min(Math.max(km, 0), total);
      const i = indexAt(km);
      const j = Math.min(i + 1, route.length - 1);
      const seg = cum[j] - cum[i];
      const u = seg > 0 ? (km - cum[i]) / seg : 0;
      return [route[i][0] + (route[j][0] - route[i][0]) * u, route[i][1] + (route[j][1] - route[i][1]) * u];
    }
    function sliceRoute(a, b) {
      a = Math.max(0, a); b = Math.min(total, b);
      if (b <= a) return [pointAt(a)];
      const out = [pointAt(a)];
      for (let i = indexAt(a) + 1; i < route.length && cum[i] < b; i++) out.push(route[i]);
      out.push(pointAt(b));
      return out;
    }
    // Nächster Streckenkilometer zu einem Kartenpunkt (lokal eben projiziert).
    function nearestKm(p) {
      const kx = Math.cos((p[0] * Math.PI) / 180);
      let best = { d: Infinity, km: 0 };
      for (let i = 0; i < route.length - 1; i++) {
        const ax = route[i][1] * kx, ay = route[i][0];
        const bx = route[i + 1][1] * kx, by = route[i + 1][0];
        const px = p[1] * kx, py = p[0];
        const dx = bx - ax, dy = by - ay;
        const len2 = dx * dx + dy * dy;
        const u = len2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2)) : 0;
        const d = (ax + u * dx - px) ** 2 + (ay + u * dy - py) ** 2;
        if (d < best.d) best = { d, km: cum[i] + u * (cum[i + 1] - cum[i]) };
      }
      return best.km;
    }

    return { total, finish, stops, arrivalAt, departureAt, stateAt, kmAt, corridorAt, windowAt, pointAt, sliceRoute, nearestKm };
  }

  function clock(t) {
    const m = Math.round(START_CLOCK + t);
    return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  }
  const elapsedNow = (now = Date.now()) => (now - START_UTC) / 60000;

  const api = { createPlan, clock, elapsedNow, START_UTC, SPEED_KMH, VP_PAUSE, CORRIDOR };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Plan = api;
})(this);
