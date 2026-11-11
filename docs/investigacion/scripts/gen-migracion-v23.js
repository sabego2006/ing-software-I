#!/usr/bin/env node
// P2 · Genera V23__trazados_osm_y_pasca.sql desde los trazados .min.geojson regenerados con OSRM.
//
//   node gen-migracion-v23.js <dirMigracionesDelBackend> [--solo-aprobados | --permitir-fallos]
//
// Se NIEGA a generar la migracion si algun trazado no paso todos los controles de verificar-trazados.js: un trazado que
// retrocede o va en contravia no debe llegar a la base. --permitir-fallos existe solo para inspeccionar el SQL; deja una
// marca NO APROBADO en la cabecera de la migracion.
//
// Contenido: UPDATE de path_geojson de las 8 rutas por sign_file; para Pasca (hoy 'Fusagasuga - Pasca', sin letrero ni
// trazado): nombre 'Pasca', sign_file 'PASCA', trazado y recorrido nuevo de route_neighborhoods. La tarifa de Alaska ya vale $3.550 desde V2 (2026-02-05): no se agrega fila.
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const TRAZ = path.join(RAIZ, 'docs', 'investigacion', 'trazados');
const [migraciones] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const permitir = process.argv.includes('--permitir-fallos');
const soloAprobados = process.argv.includes('--solo-aprobados');
if (!migraciones) { console.error('uso: node gen-migracion-v23.js <dirMigraciones> [--permitir-fallos]'); process.exit(2); }

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'trazados-osrm-config.json'), 'utf8'));
const verif = JSON.parse(fs.readFileSync(path.join(TRAZ, 'verificacion-p2.json'), 'utf8')).rutas;
const lugares = JSON.parse(fs.readFileSync(path.join(RAIZ, 'docs', 'investigacion', 'lugares', 'lugares-canonicos.json'), 'utf8'));

const q = s => "'" + String(s).replace(/'/g, "''") + "'";
const hoy = new Date().toISOString().slice(0, 10);

// --solo-aprobados: la migracion lleva SOLO los trazados que pasaron todos los controles (y Pasca, que es el alta de la ruta);
// el resto conserva el trazado de V16 hasta que se arregle con datos de campo. Es la forma de no mezclar trazados que
// retroceden con los que si estan bien.
const aprobada = c => ((verif[c.signFile] || {}).controles || []).length > 0 && verif[c.signFile].controles.every(x => x.pasa);
const incluidas = soloAprobados ? config.rutas.filter(aprobada) : config.rutas;
const excluidas = config.rutas.filter(c => !incluidas.includes(c));
if (soloAprobados && !incluidas.some(c => c.signFile === 'PASCA')) { console.error('Pasca no paso los controles: no hay nada que dar de alta.'); process.exit(1); }
const fallos = incluidas.flatMap(c => ((verif[c.signFile] || {}).controles || [{ pasa: false, nombre: 'sin verificacion' }])
  .filter(x => !x.pasa).map(x => `${c.signFile}: ${x.nombre}`));
if (fallos.length && !permitir) {
  console.error('No se genera V23: hay controles que no pasan.\n  - ' + fallos.join('\n  - '));
  process.exit(1);
}

const geo = signFile => fs.readFileSync(path.join(TRAZ, signFile + '.min.geojson'), 'utf8').trim();

const PASCA = ['Potosí', 'Bomberos', 'Colegio La Presentación', 'Pompas La Paz', 'Panadería Filipo (Pekín)', 'Corregimiento',
  'Hogar Francisco y Clara', 'Escuela de los Sauces', 'Alaska', 'Buenas Tardes', 'Crucero La Angostura', 'La Capilla', 'Pasca'];

const sql = [];
sql.push(`-- SCRUM-189 / P2: trazados regenerados con OpenStreetMap (OSRM) y alta de la ruta de Pasca.
--
-- ${fallos.length ? 'NO APROBADO: ' + fallos.length + ' control(es) no pasan (' + fallos.slice(0, 3).join('; ') + '...). No mergear.' : 'Los ' + incluidas.length + ' trazados incluidos pasaron todos los controles de verificar-trazados.js.'}
-- ${excluidas.length ? 'Conservan el trazado de V16 (no pasaron los controles; faltan datos de campo): ' + excluidas.map(c => c.signFile).join(', ') + '.' : 'No se excluyo ninguna ruta.'}
-- Generada por docs/investigacion/scripts/gen-migracion-v23.js (carpeta del curso) el ${hoy}; no editar a mano.
--
-- Trazado: OSRM (perfil driving, que respeta los oneway de OSM, continue_straight=true) sobre las coordenadas canonicas
-- de P0, simplificado con Ramer-Douglas-Peucker a 5 m. NO es el itinerario verificado en campo de la buseta.
-- Pasca: el trazado es el recorrido por defecto (OSRM, auto) de Potosi a la Iglesia de Pasca (Parroquia de Nuestra Senora de la
-- Encarnacion, OSM w205862356), como lo da Google Maps; solo 5 de sus 13 lugares tienen coordenada y no se ruteó por ellos.
--
-- Llave: sign_file, nunca name (ver V16). La ruta de Pasca se identifica por su nombre anterior (V3).
`);
for (const c of incluidas.filter(r => r.signFile !== 'PASCA')) {
  sql.push(`UPDATE routes
   SET path_geojson = ${q(geo(c.signFile))}::jsonb,
       updated_at = now()
 WHERE sign_file = ${q(c.signFile)};
`);
}
sql.push(`-- Pasca: nombre y letrero nuevos, trazado y recorrido.
UPDATE routes
   SET name = 'Pasca',
       sign_file = 'PASCA',
       path_geojson = ${q(geo('PASCA'))}::jsonb,
       updated_at = now()
 WHERE name = 'Fusagasugá - Pasca';

DELETE FROM route_neighborhoods
 WHERE route_id = (SELECT id FROM routes WHERE sign_file = 'PASCA');

INSERT INTO route_neighborhoods (route_id, order_index, neighborhood_name)
SELECT id, v.order_index, v.neighborhood_name
  FROM routes,
       (VALUES ${PASCA.map((n, i) => `(${i}, ${q(n)})`).join(',\n               ')}) AS v(order_index, neighborhood_name)
 WHERE sign_file = 'PASCA';

-- Tarifa de Alaska: NO se inserta fila. V2 ya la sembro en $3.550 con vigencia 2026-02-05 (Decreto 16/2026) y V3 solo agrego las
-- tarifas anteriores (2025-01-16, $3.300): la vigente, la de valid_from mas reciente, ya es $3.550. Una fila nueva de hoy
-- no cambiaria el precio y falsearia la fecha de ultima actualizacion que ve el usuario (RF-06).
`);
const salida = path.join(migraciones, 'V23__trazados_osm_y_pasca.sql');
fs.writeFileSync(salida, sql.join('\n'));
console.log('escrito', salida, fallos.length ? `(NO APROBADO, ${fallos.length} fallos)` : `(${incluidas.length} trazados, todos los controles pasan; excluidas: ${excluidas.length})`);
void lugares;
