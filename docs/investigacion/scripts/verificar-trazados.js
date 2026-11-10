#!/usr/bin/env node
// P2 · Controles automaticos de los trazados regenerados con OSRM. Falla RUIDOSAMENTE (exit 1) si alguno no pasa.
//
//   node verificar-trazados.js [--refrescar-overpass] [signFile ...]
//
// Por trazado:
//   1. Sin retroceso: ningun tramo recorrido en sentido opuesto a otro (segmentos a < 15 m con rumbo opuesto > 150 grados,
//      no contiguos) y ningun giro en U (cambio de rumbo > 150 grados entre segmentos consecutivos).
//   2. Solape consigo mismo <= 8 % (misma metrica que resumen.json: vertices repetidos / vertices).
//   3. Sin saltos > 300 m entre vertices consecutivos del GeoJSON completo.
//   4. Extremos a <= 100 m del primer y ultimo punto de paso (primer y ultimo lugar con coordenada).
//   5. Urbanas: ningun paso de OSRM se llama Variante, Cucharal ni Novillero. #20 y #11b: algun paso por Calle 22.
//   6. Contravia: cruza cada segmento contra las vias de Overpass con oneway (a <= 10 m, mismo eje) y verifica el sentido.
//      Solo se descargan las vias con oneway o rotonda (la consulta de todas las vias de la zona agota el tiempo del
//      servidor publico). Lo que no cae sobre una de ellas se reporta como "sin etiqueta oneway": OSM asume doble sentido ahi,
//      y eso NO es una verificacion de sentido.
//
// Escribe trazados/verificacion-p2.json (lo consume la pagina de revision) y trazados/osrm/<SIGN>.overpass.json (cache).
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const TRAZ = path.join(RAIZ, 'docs', 'investigacion', 'trazados');
const OSRM_DIR = path.join(TRAZ, 'osrm');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'trazados-osrm-config.json'), 'utf8'));
const args = process.argv.slice(2);
const refrescar = args.includes('--refrescar-overpass');
const filtro = args.filter(a => !a.startsWith('--'));

const rad = g => g * Math.PI / 180;
const KX = 111320 * Math.cos(rad(4.33)), KY = 110540;
const haversineM = (a, b) => {
  const dLat = rad(b[1] - a[1]), dLon = rad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.sqrt(h));
};
const xy = p => [p[0] * KX, p[1] * KY];
const rumbo = (a, b) => Math.atan2((b[0] - a[0]) * KX, (b[1] - a[1]) * KY) * 180 / Math.PI; // 0 = norte
const difAngulo = (a, b) => { let d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
function distPuntoSegmento(p, a, b) {
  const [px, py] = xy(p), [ax, ay] = xy(a), [bx, by] = xy(b);
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  let t = l2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / l2; t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// --- Overpass --------------------------------------------------------------------------------------------------
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function vias(signFile, coords) {
  const cache = path.join(OSRM_DIR, signFile + '.overpass.json');
  const lons = coords.map(c => c[0]), lats = coords.map(c => c[1]);
  const m = 0.0015;
  if (!refrescar && fs.existsSync(cache)) {
    // El cache solo vale si el trazado actual cabe en la caja que se consulto (el trazado se regenera).
    const previo = JSON.parse(fs.readFileSync(cache, 'utf8'));
    const [s, w, n, e] = previo.bbox.split(',').map(Number);
    if (Math.min(...lats) >= s && Math.min(...lons) >= w && Math.max(...lats) <= n && Math.max(...lons) <= e) return previo;
  }
  const bbox = [Math.min(...lats) - m, Math.min(...lons) - m, Math.max(...lats) + m, Math.max(...lons) + m].map(v => v.toFixed(5)).join(',');
  const consulta = `[out:json][timeout:90];(way["highway"]["oneway"](${bbox});way["highway"]["junction"~"^(roundabout|circular)$"](${bbox}););out tags geom;`;
  let ultimo;
  const SERVIDORES = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter'];
  for (const servidor of [...SERVIDORES, ...SERVIDORES]) {
    try {
      const res = await fetch(servidor, { method: 'POST', headers: { 'User-Agent': 'FusaRoute-universidad', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(consulta) });
      if (!res.ok) { ultimo = `${servidor} ${res.status}`; await sleep(8000); continue; }
      const j = await res.json();
      const salida = {
        consultadoEl: new Date().toISOString().slice(0, 10), servidor, bbox,
        vias: j.elements.filter(e => e.type === 'way' && e.geometry).map(e => ({
          id: e.id, nombre: e.tags.name || '', highway: e.tags.highway, oneway: e.tags.oneway || '', junction: e.tags.junction || '',
          puntos: e.geometry.map(g => [g.lon, g.lat]),
        })),
      };
      fs.writeFileSync(cache, JSON.stringify(salida) + '\n');
      await sleep(2000);
      return salida;
    } catch (e) { ultimo = `${servidor} ${e.message}`; }
  }
  throw new Error('Overpass no respondio: ' + ultimo);
}

/** +1 si la via se recorre en el sentido en que esta digitalizada y es obligatoria, -1 si es obligatoria al reves, 0 si doble sentido/sin dato. */
function sentidoObligatorio(v) {
  if (/^(yes|true|1)$/.test(v.oneway) || v.junction === 'roundabout' || v.junction === 'circular') return 1;
  if (v.oneway === '-1') return -1;
  return 0;
}

// --- controles ---------------------------------------------------------------------------------------------------
function controles(cfg, coords, osrm, overpass) {
  const resultados = [];
  const ok = (id, nombre, pasa, detalle, extra) => resultados.push({ id, nombre, pasa, detalle, ...(extra || {}) });

  // 1. Retroceso
  const segs = [];
  for (let i = 0; i < coords.length - 1; i++) {
    const a = coords[i], b = coords[i + 1];
    const largo = haversineM(a, b);
    if (largo < 1) continue;
    segs.push({ i, a, b, rumbo: rumbo(a, b), largo, mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] });
  }
  const grilla = new Map(); const celda = 0.0004;
  const clave = (x, y) => Math.floor(x / celda) + ',' + Math.floor(y / celda);
  segs.forEach((s, k) => { const key = clave(s.mid[0], s.mid[1]); if (!grilla.has(key)) grilla.set(key, []); grilla.get(key).push(k); });
  const retrocesos = []; const vistos = new Set();
  segs.forEach((s, k) => {
    const cx = Math.floor(s.mid[0] / celda), cy = Math.floor(s.mid[1] / celda);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      for (const k2 of grilla.get((cx + dx) + ',' + (cy + dy)) || []) {
        if (k2 <= k) continue;
        const t = segs[k2];
        if (Math.abs(t.i - s.i) < 8) continue; // contiguos: no es un retroceso sino la propia curva
        if (difAngulo(s.rumbo, t.rumbo) > 150 && haversineM(s.mid, t.mid) < 15) {
          const kk = Math.floor(s.i / 10) + ':' + Math.floor(t.i / 10);
          if (!vistos.has(kk)) { vistos.add(kk); retrocesos.push({ lng: +s.mid[0].toFixed(5), lat: +s.mid[1].toFixed(5) }); }
        }
      }
    }
  });
  const giros = [];
  for (let k = 1; k < segs.length; k++) {
    if (segs[k].i === segs[k - 1].i + 1 && segs[k].largo > 3 && segs[k - 1].largo > 3 && difAngulo(segs[k].rumbo, segs[k - 1].rumbo) > 150) {
      giros.push({ lng: +segs[k].a[0].toFixed(5), lat: +segs[k].a[1].toFixed(5) });
    }
  }
  ok('retroceso', 'Sin retroceso ni giros en U', retrocesos.length === 0 && giros.length === 0,
    `${retrocesos.length} tramos en sentido opuesto a < 15 m, ${giros.length} giros en U`, { retrocesos: retrocesos.slice(0, 30), giros: giros.slice(0, 30) });

  // 2. Solape (misma metrica que resumen.json)
  const contados = new Map(); let repetidos = 0;
  for (const [lon, lat] of coords) {
    const k = lon.toFixed(5) + ',' + lat.toFixed(5); const n = (contados.get(k) || 0) + 1; contados.set(k, n); if (n === 2) repetidos++;
  }
  const solape = coords.length ? Math.round(repetidos / coords.length * 1000) / 10 : 0;
  ok('solape', 'Solape consigo mismo <= 8 %', solape <= 8, `${solape} % (${repetidos} de ${coords.length} vertices)`, { valor: solape });

  // 3. Saltos
  let saltoMax = 0;
  for (let i = 1; i < coords.length; i++) saltoMax = Math.max(saltoMax, haversineM(coords[i - 1], coords[i]));
  ok('saltos', 'Sin saltos > 300 m', saltoMax <= 300, `salto maximo ${Math.round(saltoMax)} m`, { valor: Math.round(saltoMax) });

  // 4. Extremos
  const pp = osrm.waypointsPedidos;
  const primero = [pp[0].lng, pp[0].lat], ultimo = [pp[pp.length - 1].lng, pp[pp.length - 1].lat];
  const dIni = Math.round(haversineM(coords[0], primero)), dFin = Math.round(haversineM(coords[coords.length - 1], ultimo));
  ok('extremos', 'Extremos a <= 100 m del primer y ultimo lugar', dIni <= 100 && dFin <= 100,
    `inicio a ${dIni} m de "${pp[0].nombre}", fin a ${dFin} m de "${pp[pp.length - 1].nombre}"`);

  // 5. Nombres de vias
  const nombres = [...new Set(osrm.pasos.map(p => p.nombre).filter(Boolean))];
  if (cfg.urbana) {
    const prohibidas = nombres.filter(n => /variante|cucharal|novillero/i.test(n));
    ok('vias-prohibidas', 'Urbana: sin Variante, Cucharal ni Novillero', prohibidas.length === 0,
      prohibidas.length ? `pasa por: ${prohibidas.join(', ')}` : 'ninguna', { vias: prohibidas });
  }
  if (cfg.exigeCalle22) {
    // En OSM la Av. Calle 22 ("La Principal") se llama "Avenida Antigua Panamericana": el punto del lugar canonico
    // "Avenida Calle 22" cae a 7 m de esa via segun OSRM /nearest. Se aceptan los dos nombres y se dice cual.
    const calle22 = nombres.filter(n => /calle 22|antigua panamericana/i.test(n));
    ok('calle-22', 'Pasa por la Av. Calle 22 (en OSM: Avenida Antigua Panamericana)', calle22.length > 0,
      calle22.length ? `pasos: ${calle22.join(', ')}` : 'ningun paso se llama Calle 22 ni Antigua Panamericana', { vias: calle22 });
  }
  // 5b. Lugares que no se usaron como punto de ruteo: el trazado debe pasar cerca (salvo el declarado por dato malo)
  for (const o of cfg.omitir || []) {
    if (o.maxM >= 100000) continue; // marcador mal ubicado, ver motivo en el config
    const fila = osrm.omitidosPedidos ? osrm.omitidosPedidos.find(x => x.nombre === o.nombre) : null;
    if (!fila) continue;
    let m = Infinity;
    for (let i = 0; i < coords.length - 1; i++) m = Math.min(m, distPuntoSegmento([fila.lng, fila.lat], coords[i], coords[i + 1]));
    ok('omitido-cerca', `Lugar no ruteado "${o.nombre}" a <= ${o.maxM} m del trazado`, m <= o.maxM, `a ${Math.round(m)} m`, { metros: Math.round(m) });
  }

  // 6. Contravia
  const tramos = overpass.vias.flatMap(v => v.puntos.slice(0, -1).map((p, j) => ({ v, a: p, b: v.puntos[j + 1], r: rumbo(p, v.puntos[j + 1]), ob: sentidoObligatorio(v) })));
  const g2 = new Map();
  tramos.forEach((t, k) => { const key = clave((t.a[0] + t.b[0]) / 2, (t.a[1] + t.b[1]) / 2); if (!g2.has(key)) g2.set(key, []); g2.get(key).push(k); });
  let mContra = 0, mOneway = 0, mSinEtiqueta = 0, mSinVia = 0; const contravias = []; const nomContra = new Set();
  for (const s of segs) {
    const cx = Math.floor(s.mid[0] / celda), cy = Math.floor(s.mid[1] / celda);
    const candidatas = [];
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      for (const k of g2.get((cx + dx) + ',' + (cy + dy)) || []) {
        const t = tramos[k];
        const d = distPuntoSegmento(s.mid, t.a, t.b);
        if (d > 10) continue;
        const dif = difAngulo(s.rumbo, t.r);
        if (dif > 30 && dif < 150) continue; // via que cruza, no la que se recorre
        candidatas.push({ d, t, dif });
      }
    }
    if (!candidatas.length) { mSinVia += s.largo; continue; }
    // Dos calzadas o dos vias superpuestas a pocos metros: el segmento es legal si ALGUNA de las vias alineadas
    // y a menos de dmin + 3 m lo permite. Solo se acusa contravia cuando todas lo prohiben.
    const dmin = Math.min(...candidatas.map(c => c.d));
    const cercanas = candidatas.filter(c => c.d <= dmin + 3);
    const permite = c => c.t.ob === 0 || ((c.t.ob === 1) === (c.dif <= 30));
    const mejor = cercanas.slice().sort((a, b) => a.d - b.d)[0];
    if (cercanas.some(c => c.t.ob === 0)) { mSinEtiqueta += s.largo; continue; }
    mOneway += s.largo;
    const contra = !cercanas.some(permite);
    if (contra) { mContra += s.largo; nomContra.add(mejor.t.v.nombre || ('way ' + mejor.t.v.id)); if (contravias.length < 30) contravias.push({ lng: +s.mid[0].toFixed(5), lat: +s.mid[1].toFixed(5), via: mejor.t.v.nombre || ('way ' + mejor.t.v.id) }); }
  }
  mSinEtiqueta += mSinVia; mSinVia = 0;
  const total = mContra + mOneway + mSinEtiqueta;
  const pct = v => (total ? Math.round(v / total * 1000) / 10 : 0);
  ok('contravia', 'Sin contravia (OSM oneway)', mContra === 0,
    mContra === 0
      ? `0 m en contravia; ${Math.round(mOneway)} m (${pct(mOneway)} %) sobre vias con oneway verificadas; ${Math.round(mSinEtiqueta)} m (${pct(mSinEtiqueta)} %) sobre vias sin etiqueta oneway (OSM asume doble sentido: sin dato de sentido en OSM, no verificado)`
      : `${Math.round(mContra)} m en contravia en: ${[...nomContra].join(', ')}`,
    { metros: { contravia: Math.round(mContra), onewayVerificado: Math.round(mOneway), sinEtiqueta: Math.round(mSinEtiqueta), sinViaOsm: Math.round(mSinVia) }, contravias });
  return resultados;
}

(async () => {
  const informe = {}; let fallos = 0;
  for (const cfg of config.rutas) {
    if (filtro.length && !filtro.includes(cfg.signFile)) continue;
    const coords = JSON.parse(fs.readFileSync(path.join(TRAZ, cfg.signFile + '.geojson'), 'utf8')).coordinates;
    const osrm = JSON.parse(fs.readFileSync(path.join(OSRM_DIR, cfg.signFile + '.json'), 'utf8'));
    const overpass = await vias(cfg.signFile, coords);
    const res = controles(cfg, coords, osrm, overpass);
    informe[cfg.signFile] = { triage: cfg.triage, longitudM: Math.round(osrm.distanciaM), vertices: coords.length, controles: res };
    const malos = res.filter(r => !r.pasa);
    fallos += malos.length;
    console.log(`${malos.length ? 'FALLA' : 'ok   '} ${cfg.signFile} (${cfg.triage})`);
    res.forEach(r => console.log(`    ${r.pasa ? '✔' : '✘'} ${r.nombre}: ${r.detalle}`));
  }
  fs.writeFileSync(path.join(TRAZ, 'verificacion-p2.json'), JSON.stringify({ generado: new Date().toISOString().slice(0, 10), rutas: informe }, null, 1) + '\n');
  if (fallos) { console.error(`\n${fallos} control(es) no pasan.`); process.exit(1); }
})().catch(e => { console.error(e); process.exit(1); });
