#!/usr/bin/env node
// P2 · Genera docs/investigacion/trazados/revision-trazados.html: pagina de un solo archivo para aprobar ruta por ruta.
//   node gen-revision-trazados.js
// Lee trazados/*.geojson (nuevo), trazados/anteriores/2026-11-09/*.min.geojson (viejo), trazados/osrm/*.json (puntos de
// paso y pasos) y trazados/verificacion-p2.json (resultado de cada control). Leaflet 1.9.4 desde cdnjs, teselas de OSM.
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const TRAZ = path.join(RAIZ, 'docs', 'investigacion', 'trazados');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'trazados-osrm-config.json'), 'utf8'));
const verif = fs.existsSync(path.join(TRAZ, 'verificacion-p2.json'))
  ? JSON.parse(fs.readFileSync(path.join(TRAZ, 'verificacion-p2.json'), 'utf8')).rutas : {};
const leer = f => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null);

const rutas = config.rutas.map(cfg => {
  const osrm = leer(path.join(TRAZ, 'osrm', cfg.signFile + '.json'));
  const nuevo = leer(path.join(TRAZ, cfg.signFile + '.geojson'));
  const viejo = leer(path.join(TRAZ, 'anteriores', '2026-11-09', cfg.signFile + '.min.geojson'));
  return {
    signFile: cfg.signFile, triage: cfg.triage, nombre: cfg.signFile.replace(/_/g, ' '),
    nuevo: nuevo ? nuevo.coordinates : [], viejo: viejo ? viejo.coordinates : [],
    puntos: osrm ? osrm.waypointsPedidos : [], longitudM: osrm ? Math.round(osrm.distanciaM) : 0,
    vias: osrm ? [...new Set(osrm.pasos.map(p => p.nombre).filter(Boolean))] : [],
    controles: (verif[cfg.signFile] || {}).controles || [],
  };
});

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Revisión de trazados (P2)</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css">
<style>
  :root { --bg:#fff; --fg:#1a1a1a; --card:#f4f4f6; --ok:#1a7f37; --mal:#c62828; --muted:#666; }
  @media (prefers-color-scheme: dark) { :root { --bg:#161618; --fg:#eee; --card:#232326; --muted:#aaa; } }
  body { margin:0; background:var(--bg); color:var(--fg); font:15px/1.4 system-ui,sans-serif; }
  header { padding:12px 16px; border-bottom:1px solid #8884; }
  main { display:grid; grid-template-columns:minmax(300px,380px) 1fr; height:calc(100vh - 62px); }
  nav { overflow:auto; padding:8px; background:var(--card); }
  nav button { display:block; width:100%; text-align:left; margin:4px 0; padding:8px 10px; border:1px solid #8884; border-radius:8px; background:var(--bg); color:var(--fg); cursor:pointer; }
  nav button[aria-current=true] { outline:2px solid #1565c0; }
  .estado-ok { color:var(--ok); } .estado-mal { color:var(--mal); }
  #detalle { padding:8px 4px; font-size:13px; }
  #detalle li { margin:3px 0; } .muted { color:var(--muted); }
  #mapa { height:100%; min-height:300px; }
  .flecha { font-size:14px; line-height:14px; text-align:center; }
  @media (max-width:760px) { main { grid-template-columns:1fr; height:auto; } #mapa { height:60vh; } }
</style>
</head>
<body>
<header><strong>Revisión de trazados (P2)</strong> · gris = trazado anterior · color = trazado nuevo (OSM/OSRM) con flechas de sentido · círculos numerados = lugares · cuadrados naranja = puntos de paso forzados.
<span class="muted">Un ✘ no se aprueba: es evidencia de que el trazado no pasa un control.</span></header>
<main>
  <nav id="lista"></nav>
  <section><div id="mapa"></div></section>
</main>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
<script>
const RUTAS = ${JSON.stringify(rutas)};
const mapa = L.map('mapa').setView([4.336, -74.364], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(mapa);
let capa = L.layerGroup().addTo(mapa);
const lista = document.getElementById('lista');
const bearing = (a, b) => Math.atan2((b[0]-a[0])*Math.cos(a[1]*Math.PI/180), b[1]-a[1]) * 180 / Math.PI;
function pasa(r) { return r.controles.length > 0 && r.controles.every(c => c.pasa); }
function mostrar(r, boton) {
  capa.clearLayers();
  document.querySelectorAll('nav button').forEach(b => b.removeAttribute('aria-current'));
  boton.setAttribute('aria-current', 'true');
  const ll = c => c.map(p => [p[1], p[0]]);
  if (r.viejo.length) L.polyline(ll(r.viejo), { color:'#888', weight:4, opacity:.8 }).addTo(capa);
  const linea = L.polyline(ll(r.nuevo), { color: pasa(r) ? '#1565c0' : '#c62828', weight:4 }).addTo(capa);
  let acum = 0;
  for (let i = 1; i < r.nuevo.length; i++) {
    const a = r.nuevo[i-1], b = r.nuevo[i];
    acum += Math.hypot((b[0]-a[0])*111320*0.9971, (b[1]-a[1])*110540);
    if (acum > 250) { acum = 0;
      L.marker([b[1], b[0]], { icon: L.divIcon({ className:'flecha', html:'<div style="transform:rotate('+bearing(a,b)+'deg)">▲</div>', iconSize:[14,14] }) }).addTo(capa);
    }
  }
  let n = 0;
  r.puntos.forEach(p => {
    if (p.tipo === 'forzado') {
      L.circleMarker([p.lat, p.lng], { radius:7, color:'#ef6c00', fillOpacity:.9 }).bindTooltip(p.nombre + ' — ' + (p.nota || '')).addTo(capa);
    } else {
      n++;
      L.marker([p.lat, p.lng], { icon: L.divIcon({ className:'', html:'<div style="background:#fff;color:#000;border:2px solid #1565c0;border-radius:50%;width:22px;height:22px;text-align:center;font:bold 12px/18px sans-serif">'+n+'</div>', iconSize:[22,22] }) }).bindTooltip(n + '. ' + p.nombre).addTo(capa);
    }
  });
  mapa.fitBounds(linea.getBounds(), { padding:[20,20] });
  const d = document.getElementById('detalle-' + r.signFile);
  document.querySelectorAll('.det').forEach(x => x.hidden = true); d.hidden = false;
}
RUTAS.forEach(r => {
  const b = document.createElement('button');
  const ok = pasa(r);
  b.innerHTML = '<span class="' + (ok ? 'estado-ok' : 'estado-mal') + '">' + (r.controles.length ? (ok ? '✔' : '✘') : '·') + '</span> <strong>' + r.triage + '</strong> ' + r.nombre
    + '<div class="muted">' + (r.longitudM/1000).toFixed(1) + ' km · ' + r.controles.filter(c => !c.pasa).length + ' control(es) fallan</div>';
  const det = document.createElement('div'); det.className = 'det'; det.id = 'detalle-' + r.signFile; det.hidden = true;
  det.innerHTML = '<ul>' + r.controles.map(c => '<li class="' + (c.pasa ? 'estado-ok' : 'estado-mal') + '">' + (c.pasa ? '✔ ' : '✘ ') + c.nombre + ': <span class="muted">' + c.detalle + '</span></li>').join('') + '</ul>'
    + '<div class="muted">Vías por las que pasa: ' + r.vias.join(', ') + '</div>'
    + '<div class="muted">Puntos de paso: ' + r.puntos.filter(p => p.tipo !== 'forzado').length + ' · forzados/movidos: ' + (r.puntos.filter(p => p.tipo !== 'lugar').map(p => p.nombre).join('; ') || 'ninguno') + '</div>';
  b.onclick = () => mostrar(r, b);
  lista.appendChild(b); lista.appendChild(det);
});
lista.firstChild.click();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(TRAZ, 'revision-trazados.html'), html);
console.log('revision-trazados.html:', rutas.length, 'rutas,', Math.round(html.length / 1024), 'KB');
