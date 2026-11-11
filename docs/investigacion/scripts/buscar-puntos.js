#!/usr/bin/env node
// P2 · Busca, para cada ruta, en que punto de la via poner cada lugar para que el trazado de OSRM no retroceda.
//
//   node buscar-puntos.js [--hibrido] [--aplicar] [--k N] [--max-m M] [signFile ...]
//   (sin --hibrido: todos los lugares son punto de ruteo; con --hibrido: ademas prueba a no exigir lugares intermedios)
//
// Por que: el marcador de un lugar cae a veces del lado equivocado de una calle de sentido unico (o en otra calle), y OSRM,
// para llegar exactamente ahi, da la vuelta a la manzana o recorre dos veces el mismo tramo. El lugar NO se elimina ni se
// mueve a otra parte del barrio: se prueban hasta K puntos candidatos sobre las vias de OSM a <= M metros del marcador
// (servicio /nearest de OSRM), se rutea cada par de candidatos consecutivos (cache en trazados/osrm/busqueda-cache.json,
// <= 1 peticion por segundo) y se busca la combinacion con el menor puntaje global: primero retroceso y giros en U
// (misma logica que verificar-trazados.js), luego solape, luego distancia movida y largo.
//
// Salida: scripts/trazados-osrm-busqueda.json (propuesta: que candidato por lugar y cuanto se movio). NO toca el config;
// `node buscar-puntos.js --aplicar` copia la propuesta a `mover` en trazados-osrm-config.json, que es lo que lee
// rutear-osrm.js y lo que aparece declarado en el informe.
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const INV = path.join(RAIZ, 'docs', 'investigacion');
const CACHE = path.join(INV, 'trazados', 'osrm', 'busqueda-cache.json');
const SALIDA = path.join(__dirname, 'trazados-osrm-busqueda.json');
const CONFIG = path.join(__dirname, 'trazados-osrm-config.json');
const config = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
const lugares = new Map(JSON.parse(fs.readFileSync(path.join(INV, 'lugares', 'lugares-canonicos.json'), 'utf8')).map(l => [l.slug, l]));

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? Number(args[i + 1]) : d; };
const K = opt('--k', 5), MAX_M = opt('--max-m', 50);
const hibrido = args.includes('--hibrido');
const soloAplicar = args.includes('--solo-aplicar'); // aplica el resultado ya guardado, sin volver a buscar
const aplicar = args.includes('--aplicar');
const valores = new Set(['--k', '--max-m']);
const filtro = args.filter((a, i) => !a.startsWith('--') && !valores.has(args[i - 1]));
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

// --- geometria y metricas (misma logica que verificar-trazados.js) ----------------------------------------------
const rad = g => g * Math.PI / 180;
const KX = 111320 * Math.cos(rad(4.33)), KY = 110540;
const hav = (a, b) => { const dl = rad(b[1] - a[1]), dg = rad(b[0] - a[0]); const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dg / 2) ** 2; return 2 * 6371008.8 * Math.asin(Math.sqrt(h)); };
const rumbo = (a, b) => Math.atan2((b[0] - a[0]) * KX, (b[1] - a[1]) * KY) * 180 / Math.PI;
const dif = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
function metricas(coords) {
  const segs = [];
  for (let i = 0; i < coords.length - 1; i++) { const l = hav(coords[i], coords[i + 1]); if (l < 1) continue; segs.push({ i, r: rumbo(coords[i], coords[i + 1]), l, mid: [(coords[i][0] + coords[i + 1][0]) / 2, (coords[i][1] + coords[i + 1][1]) / 2] }); }
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
  const largo = coords.slice(1).reduce((s, c, i) => s + hav(coords[i], c), 0);
  return { retro, giros, solape: coords.length ? rep / coords.length * 100 : 0, largo };
}

// --- OSRM (<= 1 peticion por segundo) ------------------------------------------------------------------------------
const BASE = 'https://router.project-osrm.org';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ultima = 0, nuevas = 0;
async function pedir(url) {
  const espera = 1150 - (Date.now() - ultima); if (espera > 0) await sleep(espera);
  for (let intento = 0; intento < 4; intento++) {
    ultima = Date.now();
    let res;
    try { res = await fetch(url, { headers: { 'User-Agent': 'FusaRoute-universidad' } }); } catch (e) { await sleep(5000 * (intento + 1)); continue; }
    if (res.status === 429 || res.status >= 500) { await sleep(5000 * (intento + 1)); continue; }
    const j = await res.json();
    return j;
  }
  throw new Error('OSRM no respondio: ' + url);
}
const guardar = () => fs.writeFileSync(CACHE, JSON.stringify(cache));
const f6 = n => Number(n).toFixed(6);
async function candidatos(lugar) {
  const k = `n:${f6(lugar.lng)},${f6(lugar.lat)}:${K}`;
  if (!cache[k]) {
    const j = await pedir(`${BASE}/nearest/v1/driving/${f6(lugar.lng)},${f6(lugar.lat)}?number=${K * 2}`);
    if (j.code !== 'Ok') throw new Error('nearest ' + j.code);
    cache[k] = j.waypoints.map(w => ({ lng: w.location[0], lat: w.location[1], m: w.distance, via: w.name }));
    nuevas++; guardar();
  }
  const sal = [];
  for (const c of cache[k]) {
    if (c.m > MAX_M) continue;
    if (sal.some(s => hav([s.lng, s.lat], [c.lng, c.lat]) < 12)) continue; // casi el mismo punto
    sal.push(c);
    if (sal.length >= K) break;
  }
  return sal;
}
async function tramo(a, b) {
  const k = `r:${f6(a.lng)},${f6(a.lat)};${f6(b.lng)},${f6(b.lat)}`;
  if (!cache[k]) {
    const j = await pedir(`${BASE}/route/v1/driving/${f6(a.lng)},${f6(a.lat)};${f6(b.lng)},${f6(b.lat)}?overview=full&geometries=geojson&continue_straight=true`);
    cache[k] = j.code === 'Ok' ? j.routes[0].geometry.coordinates : null;
    nuevas++; if (nuevas % 20 === 0) guardar();
  }
  return cache[k];
}

// --- busqueda ----------------------------------------------------------------------------------------------------------
const concatenar = tramos => { const g = []; tramos.forEach((t, i) => g.push(...(i ? t.slice(1) : t))); return g; };
/** Menor es mejor: retroceso+giros dominan, luego solape, luego lo movido y el largo. */
const costo = (m, movidoM) => (m.retro + m.giros) * 10000 + m.solape * 100 + movidoM * 2 + m.largo / 50;
const kLeg = (a, b) => `r:${f6(a.lng)},${f6(a.lat)};${f6(b.lng)},${f6(b.lat)}`;
function distALinea(p, g) {
  let m = Infinity;
  for (let i = 0; i < g.length - 1; i++) {
    const px = p[0] * KX, py = p[1] * KY, ax = g[i][0] * KX, ay = g[i][1] * KY, bx = g[i + 1][0] * KX, by = g[i + 1][1] * KY;
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
    m = Math.min(m, Math.hypot(px - (ax + t * dx), py - (ay + t * dy)));
  }
  return m;
}
const MAX_OMITIDO_M = 60; // un lugar que no es punto de ruteo debe quedar a <= 60 m del trazado

/** Mejor combinacion de candidatos para los lugares activos (descenso por coordenadas desde varias semillas). */
async function resolver(activos, cands) {
  for (let n = 0; n < activos.length - 1; n++) for (const a of cands[activos[n]]) for (const b of cands[activos[n + 1]]) await tramo(a, b);
  guardar();
  const evalua = sel => {
    const tr = [];
    for (let n = 0; n < activos.length - 1; n++) { const g = cache[kLeg(cands[activos[n]][sel[n]], cands[activos[n + 1]][sel[n + 1]])]; if (!g) return { c: Infinity }; tr.push(g); }
    const geom = concatenar(tr), m = metricas(geom);
    const mov = sel.reduce((s, a, n) => s + (cands[activos[n]][a].m || 0), 0);
    return { m, c: costo(m, mov), geom };
  };
  let mejor = { c: Infinity }, selMejor = null;
  const semillas = [activos.map(() => 0)];
  let rnd = 12345; const azar = () => (rnd = (rnd * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let r = 0; r < 60; r++) semillas.push(activos.map(i => Math.floor(azar() * cands[i].length)));
  for (const semilla of semillas) {
    let sel = semilla.slice(), cur = evalua(sel), mejora = true;
    while (mejora) {
      mejora = false;
      for (let n = 0; n < activos.length; n++) for (let a = 0; a < cands[activos[n]].length; a++) {
        if (a === sel[n]) continue; const s2 = sel.slice(); s2[n] = a; const e = evalua(s2);
        if (e.c < cur.c - 1e-9) { sel = s2; cur = e; mejora = true; }
      }
      for (let n = 0; n < activos.length - 1; n++) for (let a = 0; a < cands[activos[n]].length; a++) for (let b = 0; b < cands[activos[n + 1]].length; b++) {
        if (a === sel[n] && b === sel[n + 1]) continue; const s2 = sel.slice(); s2[n] = a; s2[n + 1] = b; const e = evalua(s2);
        if (e.c < cur.c - 1e-9) { sel = s2; cur = e; mejora = true; }
      }
    }
    if (cur.c < mejor.c) { mejor = cur; selMejor = sel; }
  }
  return { sel: selMejor, ...mejor };
}

(async () => {
  const salida = fs.existsSync(SALIDA) ? JSON.parse(fs.readFileSync(SALIDA, 'utf8')) : {};
  const sufijo = hibrido ? '|hibrido' : '';
  for (const cfg of config.rutas) {
    if (soloAplicar || cfg.puntosFijos || (filtro.length && !filtro.includes(cfg.signFile))) continue;
    const filas = rl.filter(r => Number(r.ruta_id) === cfg.rutaId).sort((a, b) => a.order_index - b.order_index);
    const sitios = [], noRuteados = [];
    for (const f of filas) {
      const l = lugares.get(f.slug || f.slug_pendiente);
      if (!l || l.lat == null) { noRuteados.push(`${f.nombre_bd} (sin coordenada)`); continue; }
      if ((cfg.omitir || []).some(o => o.nombre === f.nombre_bd && o.maxM >= 100000)) { noRuteados.push(`${f.nombre_bd} (marcador mal ubicado)`); continue; }
      sitios.push({ nombre: f.nombre_bd, slug: f.slug || f.slug_pendiente, lat: l.lat, lng: l.lng });
    }
    const cands = [];
    for (const s of sitios) { const c = await candidatos(s); cands.push(c.length ? c : [{ lng: s.lng, lat: s.lat, m: 0, via: '(sin via cercana)' }]); }
    let activos = sitios.map((_, i) => i);
    let r = await resolver(activos, cands);
    const base = { retro: r.m.retro, giros: r.m.giros, solape: +r.m.solape.toFixed(1) };
    const omitidos = [];
    if (hibrido) {
      // Voraz: probar a no exigir un lugar intermedio como punto de ruteo (el primero y el ultimo siempre lo son); se acepta si
      // baja retroceso+giros (o, empatando, el solape) y el trazado igual pasa a <= 60 m del lugar.
      let mejora = true;
      while (mejora) {
        mejora = false;
        for (let n = 1; n < activos.length - 1; n++) {
          const prueba = activos.filter((_, k) => k !== n);
          const r2 = await resolver(prueba, cands);
          if (!r2.m) continue;
          const lugar = sitios[activos[n]], d = distALinea([lugar.lng, lugar.lat], r2.geom);
          const def = x => x.m.retro + x.m.giros;
          if (d <= MAX_OMITIDO_M && (def(r2) < def(r) || (def(r2) === def(r) && r2.m.solape < r.m.solape - 0.5))) {
            omitidos.push({ nombre: lugar.nombre, a: Math.round(d) });
            activos = prueba; r = r2; mejora = true; break;
          }
        }
      }
    }
    const mover = activos.map((i, n) => { const c = cands[i][r.sel[n]]; return { nombre: sitios[i].nombre, slug: sitios[i].slug, original: [sitios[i].lat, sitios[i].lng], lat: c.lat, lng: c.lng, movidoM: Math.round(hav([sitios[i].lng, sitios[i].lat], [c.lng, c.lat])), via: c.via }; });
    salida[cfg.signFile + sufijo] = {
      modo: hibrido ? 'hibrido' : 'completo', sitios: sitios.length, noRuteados, base,
      final: { retro: r.m.retro, giros: r.m.giros, solape: +r.m.solape.toFixed(1), largoM: Math.round(r.m.largo) },
      omitidos: omitidos.map(o => ({ ...o, maxM: MAX_OMITIDO_M })), mover,
    };
    console.log(`\n${cfg.signFile}${sufijo}: retro+giros ${base.retro + base.giros} -> ${r.m.retro + r.m.giros}, solape ${base.solape} -> ${r.m.solape.toFixed(1)} %, omitidos: ${omitidos.map(o => `${o.nombre} (a ${o.a} m)`).join(', ') || 'ninguno'}; movidos: ${mover.filter(m => m.movidoM > 1).map(m => `${m.nombre} ${m.movidoM} m`).join(', ') || 'ninguno'}`);
    fs.writeFileSync(SALIDA, JSON.stringify(salida, null, 1) + '\n');
  }
  guardar();

  if (aplicar) {
    // Copia la propuesta al config: `mover` (clave = slug, solo los movidos > 1 m) y `omitir` (con motivo y distancia medida).
    for (const cfg of config.rutas) {
      const p = salida[cfg.signFile + sufijo];
      if (!p || cfg.puntosFijos || (filtro.length && !filtro.includes(cfg.signFile))) continue;
      const grande = (cfg.omitir || []).filter(o => o.maxM >= 100000);
      cfg.mover = {};
      for (const m of p.mover) if (m.movidoM > 1) cfg.mover[m.slug] = { lat: m.lat, lng: m.lng, motivo: `Movido ${m.movidoM} m sobre la via "${m.via || 'sin nombre en OSM'}" (punto de OSM mas cercano que no provoca retroceso); marcador original ${m.original.join(', ')}.` };
      cfg.omitir = [...grande, ...p.omitidos.map(o => ({ nombre: o.nombre, maxM: o.maxM, motivo: `Exigirlo como punto de ruteo provocaba retroceso aun probando los puntos candidatos de OSM (buscar-puntos.js); el trazado pasa a ${o.a} m del lugar.` }))];
    }
    fs.writeFileSync(CONFIG, JSON.stringify(config, null, 2) + '\n');
    console.log('config actualizado');
  }
})().catch(e => { console.error(e); process.exit(1); });
