#!/usr/bin/env node
// P2 (2a vuelta) · Genera V26__trazados_osm_rutas_verificadas.sql: UPDATE de path_geojson SOLO de las rutas urbanas cuyo trazado
// OSRM pasa todos los controles de verificar-trazados.js. No toca Pasca (ya dada de alta en V23) ni las rutas que no pasan
// (conservan el trazado vigente hasta tener datos de campo).
//
//   node gen-migracion-v26.js <dirMigracionesDelBackend>
'use strict';
const fs = require('fs');
const path = require('path');
const TRAZ = path.resolve(__dirname, '..', 'trazados');
const [dir] = process.argv.slice(2);
if (!dir) { console.error('uso: node gen-migracion-v26.js <dirMigraciones>'); process.exit(2); }
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'trazados-osrm-config.json'), 'utf8'));
const verif = JSON.parse(fs.readFileSync(path.join(TRAZ, 'verificacion-p2.json'), 'utf8')).rutas;
const q = s => "'" + String(s).replace(/'/g, "''") + "'";
const aprobada = c => ((verif[c.signFile] || {}).controles || []).length > 0 && verif[c.signFile].controles.every(x => x.pasa);
const incl = config.rutas.filter(c => c.signFile !== 'PASCA' && aprobada(c));
const excl = config.rutas.filter(c => c.signFile !== 'PASCA' && !aprobada(c));
if (!incl.length) { console.error('Ninguna ruta pasa los controles: no hay migracion.'); process.exit(1); }
const sql = [`-- SCRUM-189 / P2 (segunda vuelta): trazados OSM (OSRM) de las rutas que pasaron TODOS los controles de verificar-trazados.js.
--
-- Incluidas: ${incl.map(c => `${c.triage} ${c.signFile}`).join('; ')}.
-- Conservan el trazado vigente (no pasaron los controles; faltan datos de campo): ${excl.map(c => c.triage).join(', ')}.
-- Generada por docs/investigacion/scripts/gen-migracion-v26.js (carpeta del curso) el ${new Date().toISOString().slice(0, 10)}; no editar a mano.
--
-- Trazado: OSRM (driving, respeta oneway de OSM, continue_straight=true) sobre coordenadas canonicas de P0, con los puntos movidos
-- u omitidos declarados en trazados-osrm-config.json, simplificado con Ramer-Douglas-Peucker a 5 m. NO es el itinerario verificado
-- en campo de la buseta. Llave: sign_file, nunca name (ver V16).
`];
for (const c of incl) sql.push(`UPDATE routes
   SET path_geojson = ${q(fs.readFileSync(path.join(TRAZ, c.signFile + '.min.geojson'), 'utf8').trim())}::jsonb,
       updated_at = now()
 WHERE sign_file = ${q(c.signFile)};
`);
const out = path.join(dir, 'V26__trazados_osm_rutas_verificadas.sql');
fs.writeFileSync(out, sql.join('\n'));
console.log('escrito', out, '| incluidas:', incl.map(c => c.triage).join(', '), '| excluidas:', excl.map(c => c.triage).join(', '));
