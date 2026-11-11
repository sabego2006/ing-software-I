#!/usr/bin/env node
// P2 · Refinamiento en lazo cerrado: usa los MISMOS controles de verificar-trazados.js (incluida la contravia contra
// Overpass y la distancia de los lugares no ruteados medida sobre la llamada completa a OSRM) como funcion objetivo.
//
//   node refinar-trazados.js [--max-pruebas N] [signFile ...]
//
// Para cada ruta que no pasa: toma los lugares cercanos a donde fallan los controles y prueba, uno por uno, (a) otro punto
// candidato de la via de OSM (<= 60 m del marcador), (b) no exigirlo como punto de ruteo (solo si el verificador confirma que
// el trazado pasa a <= 60 m) o (c) volver a exigir un lugar antes omitido. Se acepta un cambio solo si baja el puntaje de
// fallos. Nunca se relaja un control ni se quita un lugar de la ruta. Deja el mejor estado en trazados-osrm-config.json.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SCR = __dirname, INV = path.resolve(SCR, '..'), TRAZ = path.join(INV, 'trazados');
const CONFIG = path.join(SCR, 'trazados-osrm-config.json');
const args = process.argv.slice(2);
const mp = args.indexOf('--max-pruebas');
const MAX_PRUEBAS = mp >= 0 ? Number(args[mp + 1]) : 120;
const filtro = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--max-pruebas');

const lugares = new Map(JSON.parse(fs.readFileSync(path.join(INV, 'lugares', 'lugares-canonicos.json'), 'utf8')).map(l => [l.slug, l]));
function parseCsv(t) {
  const filas = []; let f = [], c = '', q = false;
  for (let i = 0; i < t.length; i++) { const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
    else if (ch === '"') q = true; else if (ch === ',') { f.push(c); c = ''; }
    else if (ch === '\n') { f.push(c); filas.push(f); f = []; c = ''; } else if (ch !== '\r') c += ch; }
  const [cab, ...d] = filas; return d.map(r => Object.fromEntries(cab.map((k, i) => [k, r[i]])));
}
const rl = parseCsv(fs.readFileSync(path.join(INV, 'lugares', 'ruta-lugar.csv'), 'utf8'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const KX = 111320 * Math.cos(4.33 * Math.PI / 180), KY = 110540;
const dist = (a, b) => Math.hypot((a[0] - b[0]) * KX, (a[1] - b[1]) * KY);

let ultima = 0;
async function nearest(lng, lat) {
  const cacheF = path.join(TRAZ, 'osrm', 'refinar-nearest.json');
  const cache = fs.existsSync(cacheF) ? JSON.parse(fs.readFileSync(cacheF, 'utf8')) : {};
  const k = `${lng},${lat}`;
  if (cache[k]) return cache[k];
  const espera = 1200 - (Date.now() - ultima); if (espera > 0) await sleep(espera);
  ultima = Date.now();
  let j;
  for (let i = 0; i < 5; i++) { try { const r = await fetch(`https://router.project-osrm.org/nearest/v1/driving/${lng},${lat}?number=10`, { headers: { 'User-Agent': 'FusaRoute-universidad' } }); j = await r.json(); break; } catch (e) { await sleep(4000 * (i + 1)); } }
  if (!j) throw new Error('OSRM nearest no respondio');
  const out = (j.waypoints || []).map(w => ({ lng: w.location[0], lat: w.location[1], via: w.name || '', m: dist([lng, lat], w.location) }));
  cache[k] = out; fs.writeFileSync(cacheF, JSON.stringify(cache)); return out;
}

function evaluar(cfgIdx, config, sign) {
  fs.writeFileSync(CONFIG, JSON.stringify(config, null, 2) + '\n');
  const a = spawnSync('node', [path.join(SCR, 'rutear-osrm.js'), sign, '--refrescar'], { encoding: 'utf8' });
  if (a.status !== 0) return null;
  spawnSync('node', [path.join(SCR, 'verificar-trazados.js'), sign], { encoding: 'utf8' });
  const v = JSON.parse(fs.readFileSync(path.join(TRAZ, 'verificacion-p2.json'), 'utf8')).rutas[sign];
  let puntaje = 0; const fallos = [];
  for (const c of v.controles) {
    if (c.pasa) continue;
    puntaje += 1000;
    let m;
    if (c.id === 'retroceso' && (m = c.detalle.match(/^(\d+) tramos.*?(\d+) giros/))) puntaje += Number(m[1]) * 10 + Number(m[2]) * 10;
    else if (c.id === 'contravia' && (m = c.detalle.match(/^(\d+) m/))) puntaje += Number(m[1]);
    else if (/solape/i.test(c.id) && (m = c.detalle.match(/([\d.]+) %/))) puntaje += Number(m[1]);
    else if (/^Lugar no ruteado/.test(c.nombre) && (m = c.detalle.match(/a (\d+) m/))) puntaje += Number(m[1]) / 10;
    fallos.push(c);
  }
  return { puntaje, v, fallos };
}

(async () => {
  const config = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  for (let ci = 0; ci < config.rutas.length; ci++) {
    const cfg = config.rutas[ci];
    if (cfg.puntosFijos || (filtro.length && !filtro.includes(cfg.signFile))) continue;
    const sign = cfg.signFile;
    const filas = rl.filter(r => Number(r.ruta_id) === cfg.rutaId).sort((a, b) => a.order_index - b.order_index)
      .map(f => ({ nombre: f.nombre_bd, slug: f.slug || f.slug_pendiente })).map(f => ({ ...f, l: lugares.get(f.slug) })).filter(f => f.l && f.l.lat != null);
    const grande = (cfg.omitir || []).filter(o => o.maxM >= 100000).map(o => o.nombre);
    const mod = filas.filter(f => !grande.includes(f.nombre));
    let actual = evaluar(ci, config, sign), pruebas = 0;
    console.log(`\n${sign}: puntaje inicial ${actual && actual.puntaje}`);
    if (!actual) continue;
    let mejora = true;
    while (mejora && actual.puntaje > 0 && pruebas < MAX_PRUEBAS) {
      mejora = false;
      // Puntos de fallo: retrocesos, contravias y lugares no ruteados lejanos.
      const pf = [];
      for (const c of actual.v.controles) {
        if (c.pasa) continue;
        (c.retrocesos || []).forEach(p => pf.push([p.lng, p.lat]));
        (c.contravias || []).forEach(p => pf.push([p.lng, p.lat]));
        const m = c.nombre.match(/^Lugar no ruteado "(.+)" a/);
        if (m) { const f = filas.find(x => x.nombre === m[1]); if (f) pf.push([f.l.lng, f.l.lat]); }
      }
      const rel = mod.map(f => ({ f, d: Math.min(...pf.map(p => dist(p, [f.l.lng, f.l.lat]))) })).filter(x => x.d <= 200).sort((a, b) => a.d - b.d).slice(0, 10).map(x => x.f);
      for (const f of rel) {
        const omitido = (cfg.omitir || []).some(o => o.nombre === f.nombre);
        const opciones = [];
        const base = cfg.mover && cfg.mover[f.slug] ? { lat: cfg.mover[f.slug].lat, lng: cfg.mover[f.slug].lng } : { lat: f.l.lat, lng: f.l.lng };
        const cands = (await nearest(f.l.lng, f.l.lat)).filter(c => c.m <= 60);
        if (omitido) opciones.push({ tipo: 'exigir', mover: null });
        for (const c of cands) if (!(Math.abs(c.lat - base.lat) < 2e-6 && Math.abs(c.lng - base.lng) < 2e-6) || omitido) opciones.push({ tipo: 'mover', mover: c });
        if (!omitido && f !== filas[0] && f !== filas[filas.length - 1]) opciones.push({ tipo: 'omitir' });
        for (const o of opciones) {
          if (pruebas >= MAX_PRUEBAS) break;
          const snap = JSON.stringify([cfg.mover, cfg.omitir]);
          cfg.mover = { ...(cfg.mover || {}) }; cfg.omitir = [...(cfg.omitir || [])];
          if (o.tipo === 'omitir') cfg.omitir.push({ nombre: f.nombre, maxM: 60, motivo: 'Exigirlo como punto de ruteo hacia que fallara un control aun probando los puntos candidatos de OSM (refinar-trazados.js); el verificador comprueba que el trazado pasa a <= 60 m del lugar.' });
          else {
            if (omitido) cfg.omitir = cfg.omitir.filter(x => x.nombre !== f.nombre);
            if (o.tipo === 'mover') cfg.mover[f.slug] = { lat: o.mover.lat, lng: o.mover.lng, motivo: `Movido ${Math.round(o.mover.m)} m sobre la via "${o.mover.via || 'sin nombre en OSM'}" (punto de OSM mas cercano que cumple los controles, probado con el verificador completo); marcador original ${f.l.lat}, ${f.l.lng}.` };
            else delete cfg.mover[f.slug];
          }
          pruebas++;
          const r = evaluar(ci, config, sign);
          if (r && r.puntaje < actual.puntaje - 1e-9) { actual = r; mejora = true; console.log(`  + ${f.nombre}: ${o.tipo} -> puntaje ${r.puntaje.toFixed(1)}`); break; }
          [cfg.mover, cfg.omitir] = JSON.parse(snap);
        }
        if (mejora) break;
      }
    }
    // Deja en disco el mejor estado (la ultima evaluacion pudo ser un intento descartado).
    evaluar(ci, config, sign);
    console.log(`${sign}: final puntaje ${actual.puntaje.toFixed(1)} tras ${pruebas} pruebas; fallos: ${actual.fallos.map(c => c.nombre).join(' | ') || 'ninguno'}`);
  }
})().catch(e => { console.error(e); process.exit(1); });
