#!/usr/bin/env node
// P2 · Propone que lugares NO hace falta usar como punto de ruteo en OSRM porque forzarlos provoca retrocesos.
//
//   node optimizar-puntos.js [signFile ...]      escribe scripts/trazados-osrm-optimizacion.json (propuesta, no toca el config)
//
// Por que: las coordenadas de los marcadores caen a veces del lado equivocado de una calle de sentido unico, y OSRM, para
// llegar exactamente ahi, da la vuelta a la manzana. El lugar no se elimina del recorrido: se prueba a NO exigirlo como
// punto de paso y solo se acepta si (1) el trazado mejora (menos retroceso, giros en U y solape) y (2) el trazado igual
// pasa a <= 60 m del lugar. El primer y el ultimo lugar siempre son puntos de paso. Voraz: una pasada por punto, repetida
// hasta que nada mejora. Las respuestas de OSRM se guardan en trazados/osrm/prueba-cache.json (<= 1 peticion por segundo).
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const INV = path.join(RAIZ, 'docs', 'investigacion');
const CACHE = path.join(INV, 'trazados', 'osrm', 'prueba-cache.json');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'trazados-osrm-config.json'), 'utf8'));
const lugares = new Map(JSON.parse(fs.readFileSync(path.join(INV, 'lugares', 'lugares-canonicos.json'), 'utf8')).map(l => [l.slug, l]));
const filtro = process.argv.slice(2);
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};

function parseCsv(t) {
  const filas = []; let f = [], c = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
    else if (ch === '"') q = true; else if (ch === ',') { f.push(c); c = ''; }
    else if (ch === '\n') { f.push(c); filas.push(f); f = []; c = ''; } else if (ch !== '\r') c += ch;
  }
  const [cab, ...d] = filas; return d.map(r => Object.fromEntries(cab.map((k, i) => [k, r[i]])));
}
const rl = parseCsv(fs.readFileSync(path.join(INV, 'lugares', 'ruta-lugar.csv'), 'utf8'));

const rad = g => g * Math.PI / 180;
const KX = 111320 * Math.cos(rad(4.33)), KY = 110540;
const hav = (a, b) => { const dl = rad(b[1] - a[1]), dg = rad(b[0] - a[0]); const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dg / 2) ** 2; return 2 * 6371008.8 * Math.asin(Math.sqrt(h)); };
const rumbo = (a, b) => Math.atan2((b[0] - a[0]) * KX, (b[1] - a[1]) * KY) * 180 / Math.PI;
const dif = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
function distSeg(p, a, b) {
  const px = p[0] * KX, py = p[1] * KY, ax = a[0] * KX, ay = a[1] * KY, bx = b[0] * KX, by = b[1] * KY;
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
const distALinea = (p, coords) => { let m = Infinity; for (let i = 0; i < coords.length - 1; i++) m = Math.min(m, distSeg(p, coords[i], coords[i + 1])); return m; };

/** Misma logica que verificar-trazados.js (retroceso, giros en U, solape): puntaje menor = mejor. */
function metricas(coords) {
  const segs = [];
  for (let i = 0; i < coords.length - 1; i++) { const l = hav(coords[i], coords[i + 1]); if (l < 1) continue; segs.push({ i, a: coords[i], r: rumbo(coords[i], coords[i + 1]), l, mid: [(coords[i][0] + coords[i + 1][0]) / 2, (coords[i][1] + coords[i + 1][1]) / 2] }); }
  const celda = 0.0004, g = new Map(), key = (x, y) => Math.floor(x / celda) + ',' + Math.floor(y / celda);
  segs.forEach((s, k) => { const kk = key(s.mid[0], s.mid[1]); if (!g.has(kk)) g.set(kk, []); g.get(kk).push(k); });
  const vistos = new Set(); let retro = 0;
  segs.forEach((s, k) => {
    const cx = Math.floor(s.mid[0] / celda), cy = Math.floor(s.mid[1] / celda);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (const k2 of g.get((cx + dx) + ',' + (cy + dy)) || []) {
      if (k2 <= k) continue; const t = segs[k2];
      if (Math.abs(t.i - s.i) < 8) continue;
      if (dif(s.r, t.r) > 150 && hav(s.mid, t.mid) < 15) { const kk = Math.floor(s.i / 10) + ':' + Math.floor(t.i / 10); if (!vistos.has(kk)) { vistos.add(kk); retro++; } }
    }
  });
  let giros = 0;
  for (let k = 1; k < segs.length; k++) if (segs[k].i === segs[k - 1].i + 1 && segs[k].l > 3 && segs[k - 1].l > 3 && dif(segs[k].r, segs[k - 1].r) > 150) giros++;
  const cont = new Map(); let rep = 0;
  for (const [lo, la] of coords) { const k = lo.toFixed(5) + ',' + la.toFixed(5); const n = (cont.get(k) || 0) + 1; cont.set(k, n); if (n === 2) rep++; }
  const solape = coords.length ? rep / coords.length * 100 : 0;
  return { retro, giros, solape, puntaje: (retro + giros) * 5 + solape };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function rutear(pts) {
  const coords = pts.map(p => `${p.lng},${p.lat}`).join(';');
  if (cache[coords]) return cache[coords];
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&continue_straight=true`;
  const res = await fetch(url, { headers: { 'User-Agent': 'FusaRoute-universidad' } });
  const j = await res.json();
  if (j.code !== 'Ok') throw new Error('OSRM ' + j.code);
  cache[coords] = j.routes[0].geometry.coordinates;
  fs.writeFileSync(CACHE, JSON.stringify(cache));
  await sleep(1100);
  return cache[coords];
}

(async () => {
  const salida = {};
  for (const cfg of config.rutas) {
    if (cfg.puntosFijos || (filtro.length && !filtro.includes(cfg.signFile))) continue;
    const filas = rl.filter(r => Number(r.ruta_id) === cfg.rutaId).sort((a, b) => a.order_index - b.order_index);
    const forzosDespues = n => (cfg.forzar || []).filter(x => x.despuesDe === n);
    const omitirFijos = new Set((cfg.omitir || []).map(o => o.nombre));
    let puntos = [];
    filas.forEach(f => {
      const l = lugares.get(f.slug || f.slug_pendiente);
      if (!l || l.lat == null || omitirFijos.has(f.nombre_bd)) return;
      puntos.push({ nombre: f.nombre_bd, lat: l.lat, lng: l.lng, fijo: false });
      forzosDespues(f.nombre_bd).forEach(z => puntos.push({ nombre: z.etiqueta, lat: z.lat, lng: z.lng, fijo: true }));
    });
    puntos[0].fijo = true; puntos[puntos.length - 1].fijo = true;
    let geom = await rutear(puntos); let m = metricas(geom);
    const base = { ...m, puntos: puntos.length, metros: Math.round(geom.slice(1).reduce((s, c, i) => s + hav(geom[i], c), 0)) };
    const omitidos = [];
    let mejora = true;
    while (mejora) {
      mejora = false;
      for (let i = 1; i < puntos.length - 1; i++) {
        if (puntos[i].fijo) continue;
        const prueba = puntos.filter((_, k) => k !== i);
        const g2 = await rutear(prueba); const m2 = metricas(g2);
        const distancia = distALinea([puntos[i].lng, puntos[i].lat], g2);
        if (m2.puntaje < m.puntaje - 0.5 && distancia <= 60) {
          omitidos.push({ nombre: puntos[i].nombre, trazadoPasaA: Math.round(distancia), antes: Math.round(m.puntaje * 10) / 10, despues: Math.round(m2.puntaje * 10) / 10 });
          puntos = prueba; geom = g2; m = m2; mejora = true; break;
        }
      }
    }
    salida[cfg.signFile] = { base, final: { ...m, puntos: puntos.length }, omitir: omitidos };
    console.log(`${cfg.signFile}: puntaje ${base.puntaje.toFixed(1)} -> ${m.puntaje.toFixed(1)} (retro ${base.retro}->${m.retro}, giros ${base.giros}->${m.giros}, solape ${base.solape.toFixed(1)}->${m.solape.toFixed(1)} %), omitidos: ${omitidos.map(o => `${o.nombre} (a ${o.trazadoPasaA} m)`).join(', ') || 'ninguno'}`);
  }
  fs.writeFileSync(path.join(__dirname, 'trazados-osrm-optimizacion.json'), JSON.stringify(salida, null, 1) + '\n');
})().catch(e => { console.error(e); process.exit(1); });
