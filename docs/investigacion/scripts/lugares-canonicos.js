#!/usr/bin/env node
// P0 · Lugares canónicos con coordenadas.
//
//   node lugares-canonicos.js                       regenera los 4 archivos de salida
//   node lugares-canonicos.js --refrescar-nominatim vuelve a consultar Nominatim (solo lugares de Pasca)
//
// Lee (todo bajo la carpeta del curso):
//   Rutas KML/*.kml                                      marcadores de lugar (<Placemark> con <description>#n</description>)
//   docs/investigacion/lugares/bd-route-neighborhoods.json  instantánea SOLO LECTURA de la BD PROD (34 rutas, 403 filas)
//   docs/investigacion/lugares/nominatim-cache.json         respuestas de Nominatim ya guardadas (Pasca)
// Escribe en docs/investigacion/lugares/:
//   lugares-canonicos.csv / .json, ruta-lugar.csv, revision-lugares.md
//
// Reproducible: sin fechas, sin red (salvo --refrescar-nominatim) y con todo ordenado, así que
// correrlo dos veces da archivos idénticos. Las decisiones de criterio (alias, sufijos de
// homónimos, nombres canónicos) viven en las constantes de abajo, no escondidas en el código.
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RAIZ = path.resolve(__dirname, '..', '..', '..'); // carpeta del curso
const DIR_KML = path.join(RAIZ, 'Rutas KML');
const DIR_OUT = path.join(RAIZ, 'docs', 'investigacion', 'lugares');
const F_BD = path.join(DIR_OUT, 'bd-route-neighborhoods.json');
const F_CACHE = path.join(DIR_OUT, 'nominatim-cache.json');

// ---------------------------------------------------------------------------------------------
// Reglas y decisiones
// ---------------------------------------------------------------------------------------------
const UMBRAL_MISMO_NOMBRE_M = 150; // mismo nombre (o alias) a <= 150 m => mismo lugar
const UMBRAL_PROPUESTA_M = 60;     // distinto nombre a < 60 m => NO se fusiona, va a la sección (a)
const CAJA = { latMin: 4.15, latMax: 4.45, lonMin: -74.55, lonMax: -74.25 }; // la misma de kml-a-geojson.js

/** Alias de la lista de Santiago (prompt P0). La primera forma de cada fila es la clave del grupo. */
const ALIAS = [
  ['terminal', 'terminal de transporte', 'terminal de transportes'],
  ['av las palmas', 'avenida las palmas', 'avda palmas', 'palmas', 'av palmas'],
  ['centro', 'centro (parque principal)'],
  ['indio', 'monumento el indio'],
  ['u hospital exito', 'hospital san rafael'],
  ['querencia', 'la querencia'],
  ['gran colombia', 'la gran colombia'],
  ['antiguo colsubsidio', 'ara (antiguo colsubsidio)', 'tiendas ara (antiguo colsubsidio)'],
  ['puente aguila', 'puente del aguila', 'puente el aguila'],
  ['cc avenida', 'centro comercial avenida'],
  ['manila', 'centro comercial manila'],
  ['panaderia filipo', 'paradero filipo'],
];

/**
 * Fusiones de la sección (a) que Santiago apruebe. Cada fila es un grupo de nombres normalizados
 * que pasan a ser alias entre sí. VACÍO hasta que él responda.
 */
const FUSIONES_APROBADAS = [
  // 2026-11-08: Santiago delegó la revisión ("eres el jefe desarrollador"); se aplicó la lectura del script.
  ['santander', 'barrio santander', 'd1 barrio santander'],  // mismo punto exacto, tres nombres
  ['chinauta', 'chinauta (retorno antes del peaje)'],        // mismo punto exacto
  ['fiscalia', 'fiscalia general de fusagasuga'],            // mismo punto exacto
  ['galeria', 'plaza de mercado'],                           // mismo punto exacto; galería = plaza de mercado
  ['gran surtidor', 'supermercado el gran surtidor'],        // mismo punto exacto
  ['u hospital exito', 'exito'],                             // ruta 5 (sin KML) hereda la coordenada
  ['cuja', 'el cuja'],                                       // mismo lugar con y sin artículo
  ['funeraria la paz', 'pompas la paz'],                     // SUPUESTO: Pompas La Paz de Pasca = Funeraria La Paz
  ['ebenezer', 'paradero ebenezer'],                         // SUPUESTO: el paradero está en Ebenezer
];

/** Claves de homónimos que se unen aunque estén a > 150 m. */
const UNIR_HOMONIMOS = new Set([
  'av las palmas', // el marcador de Chinauta-Fusa-Centro cayó 503 m al este; es la misma avenida
]);

/** Nombre canónico por grupo cuando hay alias (el más completo y legible). */
const NOMBRE_CANONICO = {
  'terminal': 'Terminal de Transporte',
  'av las palmas': 'Av. Las Palmas',
  'centro': 'Centro (Parque Principal)',
  'indio': 'Monumento El Indio',
  'u hospital exito': 'U. Hospital Éxito',
  'querencia': 'La Querencia',
  'gran colombia': 'La Gran Colombia',
  'antiguo colsubsidio': 'Tiendas Ara (Antiguo Colsubsidio)',
  'puente aguila': 'Puente del Águila',
  'cc avenida': 'Centro Comercial Avenida',
  'manila': 'Centro Comercial Manila',
  'panaderia filipo': 'Panadería Filipo',
  'gasolinera': 'Gasolinera',
  'santander': 'Barrio Santander',
  'fiscalia': 'Fiscalía General de Fusagasugá',
  'galeria': 'Galería (Plaza de Mercado)',
  'gran surtidor': 'Supermercado El Gran Surtidor',
  'cuja': 'El Cuja',
  'funeraria la paz': 'Funeraria La Paz',
  'chinauta': 'Chinauta',
  'ebenezer': 'Ebenezer',
};

/**
 * Sufijo de cada grupo de homónimos (mismo nombre, > 150 m). Se identifica por la ruta cuyo KML
 * trae el marcador. '' = el grupo principal conserva el nombre sin sufijo.
 */
const SUFIJOS_HOMONIMOS = {
  'la trinidad': {
    'Palacios - Trinidad - Guavio': 'Palacios',
    'Horizonte - Palacios - Trinidad - Barcelona': 'Barcelona',
  },
  'calle 3': {
    'Centro - Colsubsidio - Calle 3 - Olaya': 'Olaya',
    'La Palma - Colsubsidio - San Antonio - Santander': 'La Palma',
    'U. Hospital - Cra. 9 Cll. 3 - Colsubsidio - Cementerio': 'Cra. 9',
  },
  'cra 7': {
    'Centro Cra. 6 - Galería - Mandalay - Villa Natalia': 'Calle 11',
    'Centro - Colsubsidio - Calle 3 - Olaya': 'Colsubsidio',
  },
  'carrera 1': {
    'Centro - Colsubsidio - Calle 4 - Cedritos - San Antonio': 'Barrio Santander',
    'La Palma - Colsubsidio - San Antonio - Santander': 'Gran Surtidor',
  },
  'av las palmas': {
    'Chinauta - Fusa - Centro': 'Carrera 9',
  },
};

/** Recorrido NUEVO de la ruta de Pasca (decisión de Santiago; la BD tiene 9 filas distintas). */
const PASCA_ID = 8;
const PASCA_RECORRIDO = [
  'Potosí', 'Bomberos', 'Colegio La Presentación', 'Pompas La Paz', 'Panadería Filipo (Pekín)',
  'Corregimiento', 'Hogar Francisco y Clara', 'Escuela de los Sauces', 'Alaska', 'Buenas Tardes',
  'Crucero La Angostura', 'La Capilla', 'Pasca',
];

/**
 * Lugares de Pasca que no tienen KML. Se buscan en Nominatim (OSM); `aceptar` se prueba contra el
 * primer segmento del display_name para no aceptar un homónimo lejano o de otra clase. Lo que no
 * pasa `aceptar` queda SIN coordenada: no se inventa.
 */
const PASCA_NOMINATIM = [
  { nombre: 'Colegio La Presentación', consultas: ['Colegio La Presentación, Fusagasugá', 'La Presentación'], aceptar: /Presentaci/i },
  { nombre: 'Pompas La Paz', consultas: ['Pompas La Paz, Fusagasugá', 'Pompas'], aceptar: /Pompas/i },
  { nombre: 'Panadería Filipo (Pekín)', consultas: ['Panadería Filipo, Fusagasugá', 'Filipo'], aceptar: /Filipo/i },
  { nombre: 'Corregimiento', consultas: ['Corregimiento, Pasca', 'Corregimiento'], aceptar: /^Corregimiento$/i },
  { nombre: 'Hogar Francisco y Clara', consultas: ['Hogar Francisco y Clara'], aceptar: /^Hogar Francisco y Clara$/i },
  { nombre: 'Escuela de los Sauces', consultas: ['Escuela Los Sauces', 'Sauces'], aceptar: /^Escuela.*Sauces/i },
  { nombre: 'Alaska', consultas: ['Alaska, Pasca', 'Alaska'], aceptar: /^Alaska/i },
  { nombre: 'Buenas Tardes', consultas: ['Buenas Tardes, Pasca', 'Buenas Tardes'], aceptar: /^Buenas Tardes/i },
  { nombre: 'Crucero La Angostura', consultas: ['Crucero La Angostura', 'La Angostura, Pasca', 'Angostura'], aceptar: /Angostura/i },
  { nombre: 'La Capilla', consultas: ['La Capilla, Pasca', 'La Capilla'], aceptar: /^La Capilla$/i },
  { nombre: 'Pasca', consultas: ['Pasca, Cundinamarca'], aceptar: /^Pasca$/i },
];
const NOMINATIM_VIEWBOX = '-74.45,4.40,-74.20,4.20'; // Fusagasugá–Pasca
const NOMINATIM_UA = 'FusaRoute-universidad';

const PASCA_NOTAS = {
  'potosi': 'Ya tiene marcador en otras rutas: se reutiliza.',
  'bomberos': 'Ya tiene marcador (ruta Nariño Pekín): se reutiliza.',
  'panaderia filipo (pekin)': 'Lugar DISTINTO de "Panadería Filipo" de las rutas urbanas (decisión de Santiago).',
  'funeraria la paz': 'SUPUESTO: "Pompas La Paz" del recorrido de Pasca se tomó como la Funeraria La Paz que ya tiene marcador.',
  'hogar francisco y clara': 'Ubicado en Nominatim (Altos de Pekín, Fusagasugá).',
};

/**
 * Mi lectura de los pares de la sección (a1) que quedan SEPARADOS: [slugA, slugB, texto].
 * Un par nuevo que no esté aquí aparece como "Decidir".
 */
const RECOMENDACIONES = [
  ['av-las-palmas', 'carrera-9', 'Separados: "Carrera 9" es un cruce sobre la avenida.'],
  ['jardin-de-dona-bertha', 'la-clarita', 'Mismo punto exacto pero sin relación en el nombre; dos paradas marcadas juntas. Se dejan separados.'],
  ['calle-11', 'cra-7-calle-11', 'Probable mismo cruce (5 m). Se dejan separados para que "Cra 7" de la ruta Mandalay siga encontrándose por su nombre.'],
  ['carrera-1-santander', 'luxemburgo', 'Separados: nombres sin relación (falsa fusión anotada).'],
  ['banco-agrario', 'banco-popular', 'Separados: dos bancos distintos, vecinos.'],
  ['barrio-progreso', 'puesto-de-salud-progreso', 'Separados: barrio y puesto de salud.'],
  ['calle-4', 'funeraria-jardines-del-renacer', 'Separados: calle y establecimiento (falsa fusión anotada).'],
  ['ciudad-ebenezer', 'salon-comunal-ebenezer', 'Separados: barrio y salón comunal.'],
  ['fiscalia-general-de-fusagasuga', 'puente-del-aguila', 'Separados: dos lugares distintos a 39 m.'],
  ['colegio-accion-comunal', 'paradero-san-antonio', 'Separados (falsa fusión anotada).'],
  ['calle-3-cra-9', 'escuela-julio-sabogal', 'Separados: calle y escuela.'],
  ['mirador-pampa', 'mirazul', 'Separados: paradas #1 y #2 consecutivas del recorrido.'],
  ['nueva-eps', 'universidad-de-cundinamarca', 'Separados: dos instituciones.'],
  ['carrera-1-santander', 'paradero-san-antonio', 'Separados (falsa fusión anotada).'],
  ['calle-22', 'maiz-amarillo', 'Separados (falsa fusión anotada).'],
  ['fusagasuga', 'funeraria-jardines-del-renacer', 'Separados (falsa fusión anotada).'],
  ['luxemburgo', 'paradero-san-antonio', 'Separados (falsa fusión anotada).'],
  ['carrera-11', 'galeria-plaza-de-mercado', 'Separados: "Carrera 11" es una calle, no la plaza (falsa fusión anotada).'],
];

/** Mi lectura de cada homónimo que sigue separado (sección b), por clave. */
const LECTURA_HOMONIMOS = {
  'calle 3': 'Tres cruces distintos de la Calle 3 (266 a 815 m entre sí). Separados es lo correcto salvo que algún marcador esté mal puesto.',
  'carrera 1': 'A 204 m, apenas sobre el umbral de 150 m. Pueden ser la misma Carrera 1 marcada desde dos rutas; por la regla quedan separados.',
  'cra 7': 'A 222 m, apenas sobre el umbral. El segundo está a 5 m del cruce con la Calle 11 (ver a1). Por la regla quedan separados.',
  'la trinidad': 'A 1413 m: claramente lugares distintos.',
};

/** Posibles alias solo por texto que NO se aplicaron (sección a2). */
const PROPUESTAS_TEXTO = [];


// ---------------------------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------------------------
/** Igual que PlaceName.normalize del dominio: NFD sin diacríticos, minúsculas, sin puntos, espacios colapsados. */
const normalizar = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/\./g, '').replace(/\s+/g, ' ').trim();

const slugificar = s => normalizar(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const MAPA_ALIAS = new Map();
for (const grupo of [...ALIAS, ...FUSIONES_APROBADAS]) for (const a of grupo) MAPA_ALIAS.set(a, grupo[0]);
const clave = nombre => { const n = normalizar(nombre); return MAPA_ALIAS.get(n) || n; };

const rad = g => (g * Math.PI) / 180;
function distM(a, b) {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}
const dispersion = ms => { let mx = 0; for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) mx = Math.max(mx, distM(ms[i], ms[j])); return mx; };
const centroide = ms => ({ lat: ms.reduce((s, m) => s + m.lat, 0) / ms.length, lng: ms.reduce((s, m) => s + m.lng, 0) / ms.length });
const f6 = n => n.toFixed(6);
const enlaceMapa = (lat, lng) => `https://www.google.com/maps?q=${f6(lat)},${f6(lng)}`;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const sha = txt => crypto.createHash('sha256').update(txt).digest('hex').slice(0, 12);

function csv(columnas, filas) {
  const esc = v => { const s = v == null ? '' : String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [columnas.join(','), ...filas.map(f => columnas.map(c => esc(f[c])).join(','))].join('\n') + '\n';
}

const limpiar = s => String(s).replace(/<!\[CDATA\[|\]\]>/g, '').replace(/\s+/g, ' ').trim();

// ---------------------------------------------------------------------------------------------
// Lectura
// ---------------------------------------------------------------------------------------------
function leerKml(archivo) {
  const xml = fs.readFileSync(archivo, 'utf8');
  const out = [];
  for (const bloque of xml.split('<Placemark>').slice(1)) {
    if (!/<Point>/.test(bloque)) continue;
    const desc = limpiar((bloque.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || '');
    const orden = desc.match(/^#(\d+)/);
    if (!orden) continue; // waypoint de la capa Directions: se ignora
    const nombre = limpiar((bloque.match(/<name>([\s\S]*?)<\/name>/) || [])[1] || '');
    const c = ((bloque.match(/<coordinates>([\s\S]*?)<\/coordinates>/) || [])[1] || '').trim().split(',').map(Number);
    if (c.length < 2 || !Number.isFinite(c[0]) || !Number.isFinite(c[1])) throw new Error(`Coordenada ilegible en ${archivo} #${orden[1]}`);
    out.push({ n: Number(orden[1]), nombre, lng: c[0], lat: c[1] });
  }
  return out.sort((a, b) => a.n - b.n);
}

async function refrescarNominatim() {
  const cache = { nota: 'Respuestas crudas de Nominatim (OSM) para los lugares de Pasca. Las escribe lugares-canonicos.js --refrescar-nominatim. Uso: 1 petición por segundo, User-Agent FusaRoute-universidad, sin email.', viewbox: NOMINATIM_VIEWBOX, consultas: {} };
  const unicas = [...new Set(PASCA_NOMINATIM.flatMap(p => p.consultas))].sort(cmp);
  for (const q of unicas) {
    const u = new URL('https://nominatim.openstreetmap.org/search');
    u.search = new URLSearchParams({ q, format: 'jsonv2', limit: '5', countrycodes: 'co', viewbox: NOMINATIM_VIEWBOX, bounded: '1', 'accept-language': 'es' }).toString();
    const res = await fetch(u, { headers: { 'User-Agent': NOMINATIM_UA } });
    if (!res.ok) throw new Error(`Nominatim ${res.status} para "${q}"`);
    const j = await res.json();
    cache.consultas[q] = j.map(r => ({ osm: r.osm_type[0] + r.osm_id, lat: Number(r.lat), lon: Number(r.lon), categoria: r.category, tipo: r.type, nombre: r.display_name }));
    console.log(`nominatim: "${q}" -> ${j.length} resultado(s)`);
    await new Promise(r => setTimeout(r, 1300));
  }
  fs.writeFileSync(F_CACHE, JSON.stringify(cache, null, 1) + '\n');
}

function elegirNominatim(cache) {
  const elegidos = new Map(); // clave -> {lat,lng,osm,tipo,nombre} | null
  for (const spec of PASCA_NOMINATIM) {
    let hallado = null;
    for (const q of spec.consultas) {
      const res = cache.consultas[q];
      if (!res) throw new Error(`Falta en nominatim-cache.json la consulta "${q}". Corre con --refrescar-nominatim.`);
      hallado = res.find(r => spec.aceptar.test(r.nombre.split(',')[0].trim()));
      if (hallado) break;
    }
    elegidos.set(clave(spec.nombre), hallado ? { lat: hallado.lat, lng: hallado.lon, osm: hallado.osm, tipo: `${hallado.categoria}/${hallado.tipo}`, nombre: hallado.nombre } : null);
  }
  return elegidos;
}

// ---------------------------------------------------------------------------------------------
// Programa
// ---------------------------------------------------------------------------------------------
async function main() {
  if (process.argv.includes('--refrescar-nominatim')) await refrescarNominatim();
  const errores = [];

  // 1. BD (instantánea) y rutas -------------------------------------------------------------
  const bd = JSON.parse(fs.readFileSync(F_BD, 'utf8'));
  const filasBd = bd.rutas.reduce((s, r) => s + r.places.length, 0);
  if (filasBd !== bd.filasEsperadas) errores.push(`La instantánea tiene ${filasBd} filas y se esperaban ${bd.filasEsperadas}.`);
  const md5 = s => crypto.createHash('md5').update(s, 'utf8').digest('hex');
  const hFilas = md5(bd.rutas.flatMap(r => r.places.map((p, i) => `${r.id}|${i}|${p}`)).join('\n'));
  const hRutas = md5(bd.rutas.map(r => `${r.id}|${r.name}|${r.signFile || ''}|${r.type}`).join('\n'));
  if (hFilas !== bd.md5Filas || hRutas !== bd.md5Rutas) errores.push('La instantánea de la BD ya no coincide con sus huellas md5: alguien la editó o hay que volver a tomarla.');
  const rutas = bd.rutas.map(r => {
    const nueva = r.id === PASCA_ID;
    return { id: r.id, name: r.name, signFile: r.signFile, etiqueta: r.signFile || `ruta-${r.id}`, places: nueva ? PASCA_RECORRIDO.slice() : r.places.slice(), recorridoNuevo: nueva, filasBd: r.places.length };
  });
  const rutaPorNombre = new Map(rutas.map(r => [r.name, r]));

  // 2. Marcadores #n de los KML ---------------------------------------------------------------
  const archivos = fs.readdirSync(DIR_KML).filter(f => f.toLowerCase().endsWith('.kml')).sort(cmp);
  const marcadores = [];
  for (const f of archivos) {
    const nombreRuta = f.replace(/\.kml$/i, '');
    const ruta = rutaPorNombre.get(nombreRuta);
    if (!ruta) { errores.push(`El KML "${f}" no corresponde a ninguna ruta de la BD.`); continue; }
    ruta.tieneKml = true;
    for (const m of leerKml(path.join(DIR_KML, f))) {
      const mk = { id: `${ruta.id}#${m.n}`, rutaId: ruta.id, n: m.n, nombre: m.nombre, lat: m.lat, lng: m.lng, clave: clave(m.nombre) };
      if (mk.lat < CAJA.latMin || mk.lat > CAJA.latMax || mk.lng < CAJA.lonMin || mk.lng > CAJA.lonMax) errores.push(`Marcador fuera de la región: ${ruta.name} #${m.n} ${m.nombre}`);
      marcadores.push(mk);
    }
  }
  for (const r of rutas) if (r.signFile && !r.tieneKml) errores.push(`La ruta ${r.id} tiene signFile pero no tiene KML.`);
  marcadores.sort((a, b) => a.rutaId - b.rutaId || a.n - b.n);

  // Marcadores propios de cada ruta, por clave (para saber a qué grupo apunta cada fila de la BD).
  const propios = new Map(); // `${rutaId}|${clave}` -> marcador
  for (const m of marcadores) {
    const k = `${m.rutaId}|${m.clave}`;
    if (propios.has(k)) errores.push(`La ruta ${m.rutaId} repite el marcador "${m.nombre}" (#${propios.get(k).n} y #${m.n}).`);
    propios.set(k, m);
  }
  // Marcadores de un KML cuyo nombre no está en la lista de la BD de esa ruta.
  const fueraDeLista = [];
  for (const m of marcadores) {
    const r = rutas.find(x => x.id === m.rutaId);
    if (!r.places.some(p => clave(p) === m.clave)) fueraDeLista.push(`${r.name} #${m.n} "${m.nombre}"`);
  }

  // 3. Grupos: misma clave (nombre o alias) y <= 150 m ----------------------------------------
  const porClave = new Map();
  for (const m of marcadores) { if (!porClave.has(m.clave)) porClave.set(m.clave, []); porClave.get(m.clave).push(m); }
  const todasLasClaves = new Set(porClave.keys());
  for (const r of rutas) for (const p of r.places) todasLasClaves.add(clave(p));

  function clusters(ms, umbral) {
    const padre = ms.map((_, i) => i);
    const raiz = i => (padre[i] === i ? i : (padre[i] = raiz(padre[i])));
    for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) if (distM(ms[i], ms[j]) <= umbral) padre[raiz(i)] = raiz(j);
    const g = new Map();
    ms.forEach((m, i) => { const r = raiz(i); if (!g.has(r)) g.set(r, []); g.get(r).push(m); });
    return [...g.values()].sort((a, b) => a[0].rutaId - b[0].rutaId || a[0].n - b[0].n);
  }

  const grupos = []; // {clave, sufijo, homonimo, markers[], filas[], ortografias Map}
  const gruposPorClave = new Map();
  for (const k of [...todasLasClaves].sort(cmp)) {
    const ms = porClave.get(k) || [];
    const cs = ms.length ? clusters(ms, UNIR_HOMONIMOS.has(k) ? Infinity : UMBRAL_MISMO_NOMBRE_M) : [[]];
    const lista = cs.map(markers => ({ clave: k, markers, homonimo: cs.length > 1, sufijo: '', filas: [], ortografias: new Map(), notas: [] }));
    if (lista.length > 1) {
      const tabla = SUFIJOS_HOMONIMOS[k] || {};
      const sinSufijo = [];
      for (const g of lista) {
        const hit = g.markers.map(m => tabla[rutas.find(r => r.id === m.rutaId).name]).find(s => s !== undefined);
        if (hit !== undefined) g.sufijo = hit; else sinSufijo.push(g);
      }
      if (sinSufijo.length === 1) sinSufijo[0].sufijo = '';
      else sinSufijo.forEach((g, i) => { g.sufijo = String(i + 1); errores.push(`Homónimo "${k}" sin sufijo en SUFIJOS_HOMONIMOS (se usó ${g.sufijo}).`); });
    }
    gruposPorClave.set(k, lista);
    grupos.push(...lista);
  }

  // 4. Cada fila de la BD (y del recorrido nuevo de Pasca) apunta a un grupo -------------------
  const asignaciones = []; // {ruta, idx, nombreBd, grupo, motivo}
  for (const r of rutas) {
    r.places.forEach((nombreBd, idx) => {
      const k = clave(nombreBd);
      const candidatos = gruposPorClave.get(k);
      const propio = propios.get(`${r.id}|${k}`);
      let grupo = null, motivo = '';
      if (propio) grupo = candidatos.find(g => g.markers.includes(propio));
      else if (candidatos.length === 1) {
        grupo = candidatos[0];
        if (grupo.markers.length && r.tieneKml) motivo = 'Sin marcador en el KML de esta ruta; coordenada tomada de otras rutas.';
      } else errores.push(`Fila ambigua (varios homónimos y sin marcador propio): ruta ${r.id} #${idx} "${nombreBd}".`);
      if (!grupo) return;
      grupo.filas.push({ rutaId: r.id, idx });
      grupo.ortografias.set(nombreBd, (grupo.ortografias.get(nombreBd) || 0) + 1);
      asignaciones.push({ ruta: r, idx, nombreBd, grupo, motivo });
    });
  }
  for (const g of grupos) for (const m of g.markers) g.ortografias.set(m.nombre, (g.ortografias.get(m.nombre) || 0) + 1);

  // 5. Nominatim para los lugares de Pasca sin marcador -----------------------------------------
  const cache = JSON.parse(fs.readFileSync(F_CACHE, 'utf8'));
  const nominatim = elegirNominatim(cache);

  // 6. Nombre, slug, coordenada y fuente de cada grupo --------------------------------------------
  const score = (s, n) => [(s.match(/[^\u0000-\u007f]/g) || []).length, n, s.length];
  function nombreBase(g) {
    if (NOMBRE_CANONICO[g.clave]) return NOMBRE_CANONICO[g.clave];
    const cand = [...g.ortografias.entries()].sort((a, b) => {
      const sa = score(a[0], a[1]), sb = score(b[0], b[1]);
      for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) return sb[i] - sa[i];
      return cmp(a[0], b[0]);
    });
    const n = cand[0][0];
    return n.charAt(0).toUpperCase() + n.slice(1);
  }
  const slugsUsados = new Map();
  for (const g of grupos) {
    const base = nombreBase(g);
    g.nombre = g.sufijo ? `${base} (${g.sufijo})` : base;
    g.slug = g.sufijo ? `${slugificar(base)}-${slugificar(g.sufijo)}` : slugificar(base);
    if (slugsUsados.has(g.slug)) errores.push(`Slug repetido: ${g.slug} (${slugsUsados.get(g.slug)} y ${g.nombre}).`);
    slugsUsados.set(g.slug, g.nombre);

    if (g.markers.length) {
      const c = centroide(g.markers);
      g.lat = c.lat; g.lng = c.lng; g.disp = dispersion(g.markers);
      g.fuente = g.markers.length === 1 || g.disp < 0.5 ? 'kml' : 'kml-centroide';
    } else if (nominatim.get(g.clave)) {
      const nm = nominatim.get(g.clave);
      g.lat = nm.lat; g.lng = nm.lng; g.disp = 0; g.fuente = 'nominatim';
      g.notas.push(`OSM ${nm.osm} (${nm.tipo}): ${nm.nombre.split(',').slice(0, 3).join(',').trim()}.`);
    } else {
      g.lat = null; g.lng = null; g.disp = null; g.fuente = 'sin-coordenada';
    }
    g.rutasIds = [...new Set(g.filas.map(f => f.rutaId))].sort((a, b) => a - b);
    g.rutasEtiquetas = g.rutasIds.map(id => rutas.find(r => r.id === id).etiqueta);
    g.alias = [...g.ortografias.keys()].filter(o => o !== g.nombre).sort(cmp);
  }
  grupos.sort((a, b) => cmp(a.slug, b.slug));

  // 7. Notas automáticas -------------------------------------------------------------------------
  const nombresRuta = id => rutas.find(r => r.id === id).name;
  for (const g of grupos) {
    if (g.homonimo) {
      const otros = gruposPorClave.get(g.clave).filter(o => o !== g);
      const dists = otros.map(o => `${o.slug} a ${Math.round(distM(g, o))} m`);
      g.notas.push(`Homónimo separado (> ${UMBRAL_MISMO_NOMBRE_M} m): ${dists.join('; ')}.`);
    }
    if (g.markers.length > 1 && g.disp >= 30) g.notas.push(`Dispersión de ${Math.round(g.disp)} m entre ${g.markers.length} marcadores.`);
    if (!g.markers.length && g.fuente === 'sin-coordenada') g.notas.push(g.filas.some(f => f.rutaId === PASCA_ID) ? 'Lugar de Pasca sin KML; Nominatim no lo encontró con confianza.' : 'Sin marcador en ningún KML.');
    if (PASCA_NOTAS[g.clave]) g.notas.push(PASCA_NOTAS[g.clave]);
    g.nota = g.notas.join(' ');
  }

  // 8. Candidatos a fusión (a): distinto nombre y < 60 m ---------------------------------------------
  const conMarcadores = grupos.filter(g => g.markers.length);
  const pares = [];
  for (let i = 0; i < conMarcadores.length; i++) for (let j = i + 1; j < conMarcadores.length; j++) {
    const A = conMarcadores[i], B = conMarcadores[j];
    if (A.clave === B.clave) continue;
    let mn = Infinity;
    for (const a of A.markers) for (const b of B.markers) mn = Math.min(mn, distM(a, b));
    if (mn < UMBRAL_PROPUESTA_M) pares.push({ A, B, d: mn });
  }
  pares.sort((x, y) => x.d - y.d || cmp(x.A.slug + x.B.slug, y.A.slug + y.B.slug));
  const parKey = (a, b) => [a, b].sort(cmp).join('|');
  const recMap = new Map(RECOMENDACIONES.map(([a, b, t]) => [parKey(a, b), t]));
  const clavesPares = new Set(pares.map(p => parKey(p.A.slug, p.B.slug)));
  for (const k of recMap.keys()) if (!clavesPares.has(k)) errores.push(`RECOMENDACIONES tiene un par que ya no aparece en (a1): ${k}`);
  const porSlug = new Map(grupos.map(g => [g.slug, g]));
  const propTexto = PROPUESTAS_TEXTO.map(([a, b, razon]) => {
    if (!porSlug.has(a) || !porSlug.has(b)) { errores.push(`PROPUESTAS_TEXTO usa un slug que no existe: ${a} / ${b}`); return null; }
    const A = porSlug.get(a), B = porSlug.get(b);
    return { A, B, razon, d: A.lat != null && B.lat != null ? distM(A, B) : null };
  }).filter(Boolean);

  // 9. Verificaciones (criterios 2 y 3) -----------------------------------------------------------------
  const asignados = new Map();
  for (const g of grupos) for (const m of g.markers) asignados.set(m.id, (asignados.get(m.id) || 0) + 1);
  const marcadoresUnicos = marcadores.filter(m => asignados.get(m.id) === 1).length;
  if (marcadoresUnicos !== marcadores.length) errores.push(`Hay marcadores en 0 o en más de 1 lugar canónico (${marcadores.length - marcadoresUnicos}).`);
  const filasEsperadas = rutas.reduce((s, r) => s + r.places.length, 0);
  if (asignaciones.length !== filasEsperadas) errores.push(`ruta-lugar tiene ${asignaciones.length} filas y se esperaban ${filasEsperadas}.`);

  // 10. Salidas ----------------------------------------------------------------------------------------------
  const lugares = grupos.map(g => ({
    slug: g.slug, nombre: g.nombre,
    lat: g.lat == null ? '' : f6(g.lat), lng: g.lng == null ? '' : f6(g.lng),
    alias: g.alias.join('|'), rutas: g.rutasEtiquetas.join('|'), n_rutas: g.rutasIds.length,
    fuente: g.fuente, dispersion_m: g.disp == null ? '' : Math.round(g.disp), nota: g.nota,
  }));
  const csvLugares = csv(['slug', 'nombre', 'lat', 'lng', 'alias', 'rutas', 'n_rutas', 'fuente', 'dispersion_m', 'nota'], lugares);
  const jsonLugares = JSON.stringify(lugares.map((l, i) => ({
    slug: l.slug, nombre: l.nombre,
    lat: l.lat === '' ? null : Number(l.lat), lng: l.lng === '' ? null : Number(l.lng),
    alias: grupos[i].alias, rutas: grupos[i].rutasEtiquetas, n_rutas: l.n_rutas,
    fuente: l.fuente, dispersion_m: l.dispersion_m === '' ? null : l.dispersion_m, nota: l.nota,
  })), null, 2) + '\n';

  asignaciones.sort((a, b) => a.ruta.id - b.ruta.id || a.idx - b.idx);
  const filasRL = asignaciones.map(a => {
    const tiene = a.grupo.lat != null;
    const notas = [];
    if (a.ruta.recorridoNuevo) notas.push('Recorrido nuevo de Pasca (la BD tiene otro de 9 filas).');
    if (a.motivo) notas.push(a.motivo);
    if (!tiene) notas.push(a.grupo.filas.some(f => f.rutaId === PASCA_ID) && a.ruta.id === PASCA_ID ? 'Sin coordenada: Nominatim no lo ubicó con confianza.' : 'Sin coordenada: no hay marcador en ningún KML.');
    return { ruta_id: a.ruta.id, sign_file: a.ruta.signFile || '', order_index: a.idx, nombre_bd: a.nombreBd, slug: tiene ? a.grupo.slug : '', slug_pendiente: tiene ? '' : a.grupo.slug, nota: notas.join(' ') };
  });
  const csvRL = csv(['ruta_id', 'sign_file', 'order_index', 'nombre_bd', 'slug', 'slug_pendiente', 'nota'], filasRL);

  // --- revision-lugares.md
  const md = [];
  const L = (...x) => md.push(x.join(''));
  const link = (lat, lng) => (lat == null ? '—' : `[${f6(lat)}, ${f6(lng)}](${enlaceMapa(lat, lng)})`);
  const conCoord = grupos.filter(g => g.lat != null);
  const sinCoord = grupos.filter(g => g.lat == null);
  const homonimos = [...gruposPorClave.values()].filter(l => l.length > 1);
  const clavesAlias = [...new Set([...ALIAS, ...FUSIONES_APROBADAS].map(f => f[0]))];
  const aliasAplicados = clavesAlias.map(k => ({ g: gruposPorClave.get(k) })).filter(x => x.g);
  const pasca = rutas.find(r => r.id === PASCA_ID);

  L('# Revisión de lugares canónicos (P0)');
  L('');
  L('**Estado:** Santiago delegó la revisión en el desarrollador líder (2026-11-08, "continúa sin mi revisión"). Se aplicó la lectura del script: las fusiones de la sección (a0) y la unión de Av. Las Palmas, que están marcadas como aplicadas; los pares de (a1) quedan separados. Cada coordenada tiene un enlace a Google Maps por si quieres auditar. Para cambiar algo: editar las constantes del script y regenerar.');
  L('');
  L('**Supuestos que valen la pena mirar:** "Pompas La Paz" (Pasca) = Funeraria La Paz; "Paradero Ebenezer" = Ebenezer; "Éxito" (ruta 5) = U. Hospital Éxito; "Galería" = Plaza de Mercado.');
  L('');
  L('Las rutas sin letrero (5, 6 y 8) se identifican como `ruta-<id>` en la columna `rutas`.');
  L('');
  L(`Datos: ${marcadores.length} marcadores \`#n\` de ${archivos.length} KML · ${filasEsperadas} filas de \`route_neighborhoods\` (${filasBd} de la BD PROD al ${bd.tomadaEl} − ${rutas.find(r => r.id === PASCA_ID).filasBd} del Pasca viejo + ${PASCA_RECORRIDO.length} del recorrido nuevo).`);
  L('');
  L('| | |');
  L('|---|---|');
  L(`| Lugares canónicos | **${grupos.length}** |`);
  L(`| Con coordenada | ${conCoord.length} (${conCoord.filter(g => g.fuente.startsWith('kml')).length} de KML, ${conCoord.filter(g => g.fuente === 'nominatim').length} de Nominatim) |`);
  L(`| Sin coordenada | ${sinCoord.length} |`);
  L(`| Fusiones aplicadas (a0) | ${FUSIONES_APROBADAS.length} grupos de alias nuevos + ${UNIR_HOMONIMOS.size} homónimo unido |`);
  L(`| Pares cercanos que quedan separados (a1) | ${pares.length} |`);
  L(`| Homónimos separados (b) | ${homonimos.length} nombres → ${homonimos.reduce((s, l) => s + l.length, 0)} lugares |`);
  L('');

  // (a)
  L('## (a) Fusiones dudosas');
  L('');
  L(`Reglas: mismo nombre o alias de tu lista **y** ≤ ${UMBRAL_MISMO_NOMBRE_M} m se fusiona solo. Distinto nombre a < ${UMBRAL_PROPUESTA_M} m **no** se fusiona solo por cercanía: aparece aquí. Las cuatro fusiones falsas que anotaste (Calle 22 + Maíz Amarillo; Luxemburgo + Colegio Acción Comunal + Paradero San Antonio + Carrera 1 Santander; Plaza de Mercado + Galería + Carrera 11; Fusagasugá + Calle 4 + Funeraria Jardines del Renacer) se confirman y ninguna se aplicó. La columna "Mi lectura" sale de los nombres y la distancia, no de haber ido al lugar; la decisión es tuya.`);
  L('');
  L('### (a0) Alias de tu lista, confirmados con los datos');
  L('');
  L('Todos se fusionaron. Mira la dispersión: si es grande, quizá no son el mismo punto.');
  L('');
  L('| Lugar canónico | Se fusionaron | Marcadores | Dispersión | Mapa |');
  L('|---|---|---|---|---|');
  for (const { g } of aliasAplicados) for (const gr of g) {
    L(`| ${gr.nombre} | ${gr.alias.length ? gr.alias.join(' · ') : '—'} | ${gr.markers.length} | ${gr.disp == null ? '—' : Math.round(gr.disp) + ' m'} | ${link(gr.lat, gr.lng)} |`);
  }
  L('');
  L('### (a1) Propuestas: nombre distinto, menos de 60 m');
  L('');
  L('| # | Lugar A | Lugar B | Distancia | Rutas A / B | Mapa A | Mapa B | Mi lectura |');
  L('|---|---|---|---|---|---|---|---|');
  pares.forEach((p, i) => {
    const kpar = parKey(p.A.slug, p.B.slug);
    L(`| a${i + 1} | ${p.A.nombre} | ${p.B.nombre} | ${Math.round(p.d)} m | ${p.A.rutasIds.length} / ${p.B.rutasIds.length} | ${link(p.A.lat, p.A.lng)} | ${link(p.B.lat, p.B.lng)} | ${recMap.get(kpar) || 'Decidir'} |`);
  });
  L('');
  if (propTexto.length) L('### (a2) Posibles alias que solo se ven por el texto (no se aplicaron)');
  if (propTexto.length) L('');
  if (propTexto.length) L('| # | Lugar A | Lugar B | Distancia | Por qué |');
  if (propTexto.length) L('|---|---|---|---|---|');
  propTexto.forEach((p, i) => L(`| a${pares.length + i + 1} | ${p.A.nombre} | ${p.B.nombre} | ${p.d == null ? 'alguno sin coordenada' : Math.round(p.d) + ' m'} | ${p.razon} |`));
  L('');

  // (b)
  L('## (b) Homónimos separados');
  L('');
  L(`Mismo nombre a más de ${UMBRAL_MISMO_NOMBRE_M} m: quedan como lugares distintos, con el sufijo entre paréntesis (el sufijo es mío; cámbialo si prefieres otro).`);
  L('');
  L('| # | Nombre | Lugar | Slug | Coordenada | Marcadores (rutas) | Distancia al otro |');
  L('|---|---|---|---|---|---|---|');
  homonimos.forEach((lista, i) => {
    lista.forEach(g => {
      const otros = lista.filter(o => o !== g).map(o => `${Math.round(distM(g, o))} m a ${o.slug}`).join('; ');
      L(`| b${i + 1} | ${g.clave} | ${g.nombre} | ${g.slug} | ${link(g.lat, g.lng)} | ${g.markers.length} (${g.rutasIds.length} ${g.rutasIds.length === 1 ? 'ruta' : 'rutas'}) | ${otros} |`);
    });
  });
  L('');

  L('Mi lectura:');
  L('');
  homonimos.forEach((lista, i) => L(`- **b${i + 1}** (${lista[0].clave}): ${LECTURA_HOMONIMOS[lista[0].clave] || 'Decidir.'}`));
  L('');

  // (c)
  L('## (c) Lugares sin coordenada');
  L('');
  L('Existen en la BD pero ningún KML trae su marcador. En `ruta-lugar.csv` aparecen con `slug` vacío y el slug en `slug_pendiente`. Si me pasas la coordenada, los completo.');
  L('');
  L('| # | Lugar | Slug | Rutas donde aparece | Nota |');
  L('|---|---|---|---|---|');
  sinCoord.forEach((g, i) => L(`| c${i + 1} | ${g.nombre} | ${g.slug} | ${g.rutasIds.map(id => `${id}`).join(', ')} | ${g.nota} |`));
  L('');

  // (d)
  L('## (d) Lugares de Pasca');
  L('');
  L(`La BD tiene hoy ${pasca.filasBd} filas para esta ruta (${bd.rutas.find(r => r.id === PASCA_ID).places.join(', ')}); el recorrido nuevo las reemplaza y "Fusagasugá" sale de la lista.`);
  L('');
  L('Recorrido nuevo, en orden. Los que no tenían KML se buscaron en Nominatim (OpenStreetMap, acotado a Fusagasugá–Pasca); si no hay un resultado que coincida con el nombre, queda sin coordenada y no se inventa.');
  L('');
  L('| Orden | Lugar | Slug | Coordenada | Fuente | Nota |');
  L('|---|---|---|---|---|---|');
  pasca.places.forEach((nombreBd, idx) => {
    const a = asignaciones.find(x => x.ruta.id === PASCA_ID && x.idx === idx);
    const g = a.grupo;
    L(`| ${idx + 1} | ${nombreBd} | ${g.slug} | ${link(g.lat, g.lng)} | ${g.fuente} | ${g.nota.replace(/\|/g, '/')} |`);
  });
  const ubicadosPasca = pasca.places.filter((_, idx) => asignaciones.find(x => x.ruta.id === PASCA_ID && x.idx === idx).grupo.lat != null).length;
  L('');

  L('## Anexo: todos los lugares con coordenada');
  L('');
  L('| Slug | Nombre | Fuente | Marcadores | Dispersión | Rutas | Mapa |');
  L('|---|---|---|---|---|---|---|');
  for (const g of conCoord) L(`| ${g.slug} | ${g.nombre} | ${g.fuente} | ${g.markers.length || 1} | ${Math.round(g.disp)} m | ${g.rutasIds.length} | ${link(g.lat, g.lng)} |`);
  L('');
  const mdTexto = md.join('\n');

  const salidas = {
    'lugares-canonicos.csv': csvLugares,
    'lugares-canonicos.json': jsonLugares,
    'ruta-lugar.csv': csvRL,
    'revision-lugares.md': mdTexto,
  };
  for (const [f, txt] of Object.entries(salidas)) fs.writeFileSync(path.join(DIR_OUT, f), txt);

  // 11. Informe --------------------------------------------------------------------------------------------------
  console.log('--- verificación');
  console.log(`marcadores #n leídos: ${marcadores.length} en ${archivos.length} KML; cada uno en exactamente 1 lugar canónico: ${marcadoresUnicos}/${marcadores.length}`);
  console.log(`filas de ruta-lugar.csv: ${filasRL.length} (esperadas ${filasEsperadas}; ${rutas.length} rutas)`);
  console.log(`marcadores cuyo nombre no está en la lista de su ruta: ${fueraDeLista.length}${fueraDeLista.length ? ' -> ' + fueraDeLista.join('; ') : ''}`);
  console.log('--- resumen');
  console.log(`lugares canónicos: ${grupos.length} | con coordenada: ${conCoord.length} | sin coordenada: ${sinCoord.length}`);
  console.log(`fusiones aplicadas: ${FUSIONES_APROBADAS.length} grupos + ${UNIR_HOMONIMOS.size} homónimo unido | pares cercanos que quedan separados: ${pares.length} | homónimos separados: ${homonimos.length} nombres -> ${homonimos.reduce((s, l) => s + l.length, 0)} lugares`);
  console.log(`Pasca: ${ubicadosPasca} ubicados / ${pasca.places.length - ubicadosPasca} sin ubicar (de ${pasca.places.length})`);
  console.log('--- huellas (sha256, 12 primeros)');
  for (const [f, txt] of Object.entries(salidas)) console.log(`${sha(txt)}  ${f}`);
  if (errores.length) { console.error('--- ERRORES'); errores.forEach(e => console.error(' - ' + e)); process.exit(1); }
}

main().catch(e => { console.error(e); process.exit(1); });
