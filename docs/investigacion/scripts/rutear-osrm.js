#!/usr/bin/env node
// P2 · Regenera con OpenStreetMap (OSRM, perfil driving) el trazado de 8 rutas urbanas y el de Pasca.
//
//   node rutear-osrm.js [--refrescar] [signFile ...]
//
// Entradas : lugares/lugares-canonicos.json y lugares/ruta-lugar.csv (P0), trazados-osrm-config.json (ajustes declarados)
// Salidas  : trazados/<SIGN>.geojson y .min.geojson (RDP 5 m, como kml-a-geojson.js),
//            trazados/osrm/<SIGN>.json (respuesta cruda de OSRM: reproducible sin red),
//            trazados/anteriores/2026-11-09/<SIGN>.min.geojson (copia del trazado viejo, para la pagina de revision).
//
// Reglas de Santiago: nunca en contravia, nunca se devuelve, las urbanas no toman variante/Cucharal/Novillero,
// un solo sentido. OSRM con perfil driving respeta los oneway de OSM y continue_straight=true prohibe dar la
// vuelta en los puntos de paso. Politica del servidor demo: <= 1 peticion por segundo.
//
// NUNCA se elimina un lugar del recorrido para que un control pase. Los lugares sin coordenada (P0) no pueden ser
// punto de paso y se reportan; los puntos movidos o agregados se declaran en el config y salen en el informe.
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const INV = path.join(RAIZ, 'docs', 'investigacion');
const TRAZ = path.join(INV, 'trazados');
const OSRM_DIR = path.join(TRAZ, 'osrm');
const VIEJOS = path.join(TRAZ, 'anteriores', '2026-11-09');
const BASE = 'https://router.project-osrm.org';
const UA = 'FusaRoute-universidad';
const TOLERANCIA_M = 5;

const args = process.argv.slice(2);
const refrescar = args.includes('--refrescar');
const filtro = args.filter(a => !a.startsWith('--'));

const lugares = new Map(JSON.parse(fs.readFileSync(path.join(INV, 'lugares', 'lugares-canonicos.json'), 'utf8')).map(l => [l.slug, l]));
const config = JSON.parse(fs.readFileSync(path.join(INV, 'scripts', 'trazados-osrm-config.json'), 'utf8'));

// --- ruta-lugar.csv -----------------------------------------------------------------------------------------
function parseCsv(texto) {
  const filas = []; let fila = [], campo = '', q = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (q) { if (c === '"') { if (texto[i + 1] === '"') { campo += '"'; i++; } else q = false; } else campo += c; }
    else if (c === '"') q = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = ''; }
    else if (c !== '\r') campo += c;
  }
  const [cab, ...datos] = filas;
  return datos.map(f => Object.fromEntries(cab.map((k, i) => [k, f[i]])));
}
const rl = parseCsv(fs.readFileSync(path.join(INV, 'lugares', 'ruta-lugar.csv'), 'utf8'));

// --- geometria -------------------------------------------------------------------------------------------------
const rad = g => g * Math.PI / 180;
const haversineM = (a, b) => {
  const dLat = rad(b[1] - a[1]), dLon = rad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.sqrt(h));
};
const KX = 111320 * Math.cos(rad(4.33)), KY = 110540;
function distSegM(p, a, b) {
  const ax = a[0] * KX, ay = a[1] * KY, bx = b[0] * KX, by = b[1] * KY, px = p[0] * KX, py = p[1] * KY;
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  let t = l2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / l2; t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function simplificar(pts, tol) {
  if (pts.length < 3) return pts.slice();
  let im = 0, dm = 0;
  for (let i = 1; i < pts.length - 1; i++) { const d = distSegM(pts[i], pts[0], pts[pts.length - 1]); if (d > dm) { dm = d; im = i; } }
  if (dm <= tol) return [pts[0], pts[pts.length - 1]];
  return simplificar(pts.slice(0, im + 1), tol).slice(0, -1).concat(simplificar(pts.slice(im), tol));
}

// --- puntos de paso ------------------------------------------------------------------------------------------
function puntosDe(cfg) {
  // Ruta con puntos fijos (Pasca): el trazado es el recorrido por defecto entre dos puntos, sin lugares intermedios.
  if (cfg.puntosFijos) {
    const puntos = cfg.puntosFijos.map(p => {
      const l = p.slug ? lugares.get(p.slug) : null;
      return { nombre: p.nombre || l.nombre, slug: p.slug || null, lat: p.lat ?? l.lat, lng: p.lng ?? l.lng, tipo: 'lugar', nota: p.nota };
    });
    return { puntos, sinCoord: [], movidos: [], omitidos: [], lugares: puntos.length };
  }
  const filas = rl.filter(r => Number(r.ruta_id) === cfg.rutaId).sort((a, b) => a.order_index - b.order_index);
  const puntos = []; const sinCoord = []; const movidos = []; const omitidos = [];
  filas.forEach(f => {
    const slug = f.slug || f.slug_pendiente;
    const lugar = lugares.get(slug);
    const mover = (cfg.mover || {})[slug];
    const omitir = (cfg.omitir || []).find(o => o.nombre === f.nombre_bd);
    if (omitir) {
      // No es punto de ruteo: se declara y el verificador comprueba a que distancia pasa el trazado.
      omitidos.push({ nombre: f.nombre_bd, motivo: omitir.motivo, maxM: omitir.maxM || 60, lat: lugar ? lugar.lat : null, lng: lugar ? lugar.lng : null });
    } else if (mover) {
      puntos.push({ nombre: f.nombre_bd, slug, lat: mover.lat, lng: mover.lng, tipo: 'movido', nota: mover.motivo });
      movidos.push(`${f.nombre_bd}: ${mover.motivo}`);
    } else if (lugar && lugar.lat != null) {
      puntos.push({ nombre: f.nombre_bd, slug, lat: lugar.lat, lng: lugar.lng, tipo: 'lugar' });
    } else {
      sinCoord.push(f.nombre_bd);
    }
    for (const forz of (cfg.forzar || []).filter(x => x.despuesDe === f.nombre_bd)) {
      puntos.push({ nombre: `(paso forzado) ${forz.etiqueta}`, slug: null, lat: forz.lat, lng: forz.lng, tipo: 'forzado', nota: forz.motivo });
    }
  });
  return { puntos, sinCoord, movidos, omitidos, lugares: filas.length };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function osrm(puntos) {
  const coords = puntos.map(p => `${p.lng},${p.lat}`).join(';');
  const url = `${BASE}/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true&continue_straight=true`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`OSRM ${res.status} para ${url.slice(0, 120)}`);
  const j = await res.json();
  if (j.code !== 'Ok') throw new Error(`OSRM code=${j.code} ${j.message || ''}`);
  return j;
}

(async () => {
  fs.mkdirSync(OSRM_DIR, { recursive: true });
  fs.mkdirSync(VIEJOS, { recursive: true });
  for (const cfg of config.rutas) {
    if (filtro.length && !filtro.includes(cfg.signFile)) continue;
    const { puntos, sinCoord, movidos, omitidos, lugares: total } = puntosDe(cfg);
    const cache = path.join(OSRM_DIR, cfg.signFile + '.json');
    const viejo = path.join(TRAZ, cfg.signFile + '.min.geojson');
    const copiaViejo = path.join(VIEJOS, cfg.signFile + '.min.geojson');
    if (fs.existsSync(viejo) && !fs.existsSync(copiaViejo)) fs.copyFileSync(viejo, copiaViejo);

    let crudo;
    if (!refrescar && fs.existsSync(cache)) {
      crudo = JSON.parse(fs.readFileSync(cache, 'utf8'));
      if (JSON.stringify(crudo.waypointsPedidos) !== JSON.stringify(puntos)) {
        console.log(`${cfg.signFile}: el cache ya no coincide con los puntos de paso; usar --refrescar`);
        process.exitCode = 1; continue;
      }
    } else {
      const j = await osrm(puntos);
      const r = j.routes[0];
      crudo = {
        consultadoEl: new Date().toISOString().slice(0, 10), servidor: BASE, perfil: 'driving',
        waypointsPedidos: puntos,
        omitidosPedidos: omitidos,
        waypointsOsrm: j.waypoints.map(w => ({ nombre: w.name, ubicacion: w.location, distanciaAlCaminoM: Math.round(w.distance * 10) / 10 })),
        distanciaM: r.distance, duracionS: r.duration,
        geometria: r.geometry.coordinates,
        pasos: r.legs.flatMap((leg, li) => leg.steps.map(s => ({ tramo: li, nombre: s.name, ref: s.ref || '', distanciaM: Math.round(s.distance), maniobra: s.maneuver.type + (s.maneuver.modifier ? ':' + s.maneuver.modifier : '') }))),
      };
      fs.writeFileSync(cache, JSON.stringify(crudo) + '\n');
      await sleep(1100);
    }
    const coords = crudo.geometria.map(([lng, lat]) => [Number(lng.toFixed(6)), Number(lat.toFixed(6))]);
    fs.writeFileSync(path.join(TRAZ, cfg.signFile + '.geojson'), JSON.stringify({ type: 'LineString', coordinates: coords }) + '\n');
    fs.writeFileSync(path.join(TRAZ, cfg.signFile + '.min.geojson'),
      JSON.stringify({ type: 'LineString', coordinates: simplificar(coords, TOLERANCIA_M) }) + '\n');
    const desvios = crudo.waypointsOsrm.map((w, i) => ({ nombre: puntos[i].nombre, m: w.distanciaAlCaminoM })).filter(x => x.m > 40);
    console.log(`${cfg.signFile}: ${puntos.length}/${total} puntos de paso, ${Math.round(crudo.distanciaM)} m, ${coords.length} vertices`
      + (sinCoord.length ? ` | SIN COORDENADA: ${sinCoord.join(', ')}` : '')
      + (omitidos.length ? ` | OMITIDOS (no son punto de ruteo): ${omitidos.map(o => o.nombre).join(', ')}` : '')
      + (movidos.length ? ` | MOVIDOS: ${movidos.join('; ')}` : '')
      + (desvios.length ? ` | puntos a >40 m de la via: ${desvios.map(d => `${d.nombre} (${d.m} m)`).join(', ')}` : ''));
  }
})().catch(e => { console.error(e); process.exit(1); });
