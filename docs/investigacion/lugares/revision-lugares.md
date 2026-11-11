# Revisión de lugares canónicos (P0)

**Estado:** Santiago delegó la revisión en el desarrollador líder (2026-11-08, "continúa sin mi revisión"). Se aplicó la lectura del script: las fusiones de la sección (a0) y la unión de Av. Las Palmas, que están marcadas como aplicadas; los pares de (a1) quedan separados. Cada coordenada tiene un enlace a Google Maps por si quieres auditar. Para cambiar algo: editar las constantes del script y regenerar.

**Supuestos que valen la pena mirar:** "Pompas La Paz" (Pasca) = Funeraria La Paz; "Paradero Ebenezer" = Ebenezer; "Éxito" (ruta 5) = U. Hospital Éxito; "Galería" = Plaza de Mercado.

Las rutas sin letrero (5, 6 y 8) se identifican como `ruta-<id>` en la columna `rutas`.

Datos: 350 marcadores `#n` de 31 KML · 407 filas de `route_neighborhoods` (403 de la BD PROD al 2026-11-08 − 9 del Pasca viejo + 13 del recorrido nuevo).

| | |
|---|---|
| Lugares canónicos | **165** |
| Con coordenada | 135 (133 de KML, 2 de Nominatim) |
| Sin coordenada | 30 |
| Fusiones aplicadas (a0) | 9 grupos de alias nuevos + 1 homónimo unido |
| Pares cercanos que quedan separados (a1) | 18 |
| Homónimos separados (b) | 4 nombres → 9 lugares |

## (a) Fusiones dudosas

Reglas: mismo nombre o alias de tu lista **y** ≤ 150 m se fusiona solo. Distinto nombre a < 60 m **no** se fusiona solo por cercanía: aparece aquí. Las cuatro fusiones falsas que anotaste (Calle 22 + Maíz Amarillo; Luxemburgo + Colegio Acción Comunal + Paradero San Antonio + Carrera 1 Santander; Plaza de Mercado + Galería + Carrera 11; Fusagasugá + Calle 4 + Funeraria Jardines del Renacer) se confirman y ninguna se aplicó. La columna "Mi lectura" sale de los nombres y la distancia, no de haber ido al lugar; la decisión es tuya.

### (a0) Alias de tu lista, confirmados con los datos

Todos se fusionaron. Mira la dispersión: si es grande, quizá no son el mismo punto.

| Lugar canónico | Se fusionaron | Marcadores | Dispersión | Mapa |
|---|---|---|---|---|
| Terminal de Transporte | Terminal · Terminal de transportes | 10 | 0 m | [4.345887, -74.377859](https://www.google.com/maps?q=4.345887,-74.377859) |
| Av. Las Palmas | Av. Palmas · Avda. Palmas · Avenida Las Palmas · Palmas | 17 | 526 m | [4.342015, -74.368188](https://www.google.com/maps?q=4.342015,-74.368188) |
| Centro (Parque Principal) | Centro | 11 | 0 m | [4.343838, -74.362005](https://www.google.com/maps?q=4.343838,-74.362005) |
| Monumento El Indio | Indio | 20 | 0 m | [4.331682, -74.377517](https://www.google.com/maps?q=4.331682,-74.377517) |
| U. Hospital Éxito | Hospital San Rafael · Éxito | 22 | 0 m | [4.333353, -74.370943](https://www.google.com/maps?q=4.333353,-74.370943) |
| La Querencia | Querencia | 12 | 0 m | [4.328923, -74.387546](https://www.google.com/maps?q=4.328923,-74.387546) |
| La Gran Colombia | Gran Colombia | 2 | 0 m | [4.329240, -74.392655](https://www.google.com/maps?q=4.329240,-74.392655) |
| Tiendas Ara (Antiguo Colsubsidio) | Antiguo Colsubsidio · Ara (Antiguo Colsubsidio) | 9 | 0 m | [4.341256, -74.361504](https://www.google.com/maps?q=4.341256,-74.361504) |
| Puente del Águila | Puente El Águila · Puente del Aguila · Puente Águila | 8 | 0 m | [4.339146, -74.363748](https://www.google.com/maps?q=4.339146,-74.363748) |
| Centro Comercial Avenida | CC Avenida · Centro comercial avenida | 4 | 0 m | [4.343802, -74.373782](https://www.google.com/maps?q=4.343802,-74.373782) |
| Centro Comercial Manila | Centro comercial Manila · Manila | 3 | 0 m | [4.332934, -74.370028](https://www.google.com/maps?q=4.332934,-74.370028) |
| Panadería Filipo | Paradero Filipo | 5 | 0 m | [4.341763, -74.363046](https://www.google.com/maps?q=4.341763,-74.363046) |
| Barrio Santander | D1 Barrio Santander · Santander | 3 | 0 m | [4.346926, -74.359414](https://www.google.com/maps?q=4.346926,-74.359414) |
| Chinauta | Chinauta (retorno antes del peaje) | 2 | 0 m | [4.295601, -74.452283](https://www.google.com/maps?q=4.295601,-74.452283) |
| Fiscalía General de Fusagasugá | Fiscalía | 6 | 0 m | [4.338820, -74.363869](https://www.google.com/maps?q=4.338820,-74.363869) |
| Galería (Plaza de Mercado) | Galería · Plaza de Mercado | 10 | 0 m | [4.341817, -74.365001](https://www.google.com/maps?q=4.341817,-74.365001) |
| Supermercado El Gran Surtidor | Gran Surtidor | 4 | 0 m | [4.349620, -74.356613](https://www.google.com/maps?q=4.349620,-74.356613) |
| El Cuja | Cuja | 0 | — | — |
| Funeraria La Paz | Pompas La Paz | 2 | 0 m | [4.344887, -74.360778](https://www.google.com/maps?q=4.344887,-74.360778) |
| Ebenezer | Paradero Ebenezer | 2 | 0 m | [4.329020, -74.364291](https://www.google.com/maps?q=4.329020,-74.364291) |

### (a1) Propuestas: nombre distinto, menos de 60 m

| # | Lugar A | Lugar B | Distancia | Rutas A / B | Mapa A | Mapa B | Mi lectura |
|---|---|---|---|---|---|---|---|
| a1 | Av. Las Palmas | Carrera 9 | 0 m | 17 / 2 | [4.342015, -74.368188](https://www.google.com/maps?q=4.342015,-74.368188) | [4.341963, -74.363917](https://www.google.com/maps?q=4.341963,-74.363917) | Separados: "Carrera 9" es un cruce sobre la avenida. |
| a2 | Jardín de Doña Bertha | La Clarita | 0 m | 1 / 1 | [4.353556, -74.354624](https://www.google.com/maps?q=4.353556,-74.354624) | [4.353556, -74.354624](https://www.google.com/maps?q=4.353556,-74.354624) | Mismo punto exacto pero sin relación en el nombre; dos paradas marcadas juntas. Se dejan separados. |
| a3 | Calle 11 | Cra 7 (Calle 11) | 5 m | 3 / 1 | [4.339916, -74.362760](https://www.google.com/maps?q=4.339916,-74.362760) | [4.339878, -74.362733](https://www.google.com/maps?q=4.339878,-74.362733) | Probable mismo cruce (5 m). Se dejan separados para que "Cra 7" de la ruta Mandalay siga encontrándose por su nombre. |
| a4 | Carrera 1 Santander | Luxemburgo | 6 m | 1 / 1 | [4.353204, -74.358172](https://www.google.com/maps?q=4.353204,-74.358172) | [4.353204, -74.358114](https://www.google.com/maps?q=4.353204,-74.358114) | Separados: nombres sin relación (falsa fusión anotada). |
| a5 | Banco Agrario | Banco Popular | 20 m | 1 / 1 | [4.342428, -74.360051](https://www.google.com/maps?q=4.342428,-74.360051) | [4.342603, -74.360015](https://www.google.com/maps?q=4.342603,-74.360015) | Separados: dos bancos distintos, vecinos. |
| a6 | Barrio Progreso | Puesto de salud Progreso | 28 m | 1 / 1 | [4.351532, -74.362266](https://www.google.com/maps?q=4.351532,-74.362266) | [4.351279, -74.362257](https://www.google.com/maps?q=4.351279,-74.362257) | Separados: barrio y puesto de salud. |
| a7 | Calle 4 | Funeraria Jardines del Renacer | 28 m | 3 / 1 | [4.345621, -74.361834](https://www.google.com/maps?q=4.345621,-74.361834) | [4.345364, -74.362291](https://www.google.com/maps?q=4.345364,-74.362291) | Separados: calle y establecimiento (falsa fusión anotada). |
| a8 | Ciudad Ebenezer | Salón Comunal Ebenezer | 38 m | 1 / 2 | [4.332597, -74.394680](https://www.google.com/maps?q=4.332597,-74.394680) | [4.332774, -74.394971](https://www.google.com/maps?q=4.332774,-74.394971) | Separados: barrio y salón comunal. |
| a9 | Fiscalía General de Fusagasugá | Puente del Águila | 39 m | 6 / 9 | [4.338820, -74.363869](https://www.google.com/maps?q=4.338820,-74.363869) | [4.339146, -74.363748](https://www.google.com/maps?q=4.339146,-74.363748) | Separados: dos lugares distintos a 39 m. |
| a10 | Colegio Accion Comunal | Paradero San Antonio | 48 m | 1 / 1 | [4.354025, -74.358219](https://www.google.com/maps?q=4.354025,-74.358219) | [4.353645, -74.358417](https://www.google.com/maps?q=4.353645,-74.358417) | Separados (falsa fusión anotada). |
| a11 | Carrera 11 | Galería (Plaza de Mercado) | 48 m | 2 / 10 | [4.341420, -74.365171](https://www.google.com/maps?q=4.341420,-74.365171) | [4.341817, -74.365001](https://www.google.com/maps?q=4.341817,-74.365001) | Separados: "Carrera 11" es una calle, no la plaza (falsa fusión anotada). |
| a12 | Calle 3 (Cra. 9) | Escuela Julio Sabogal | 49 m | 1 / 1 | [4.346218, -74.363960](https://www.google.com/maps?q=4.346218,-74.363960) | [4.346622, -74.363777](https://www.google.com/maps?q=4.346622,-74.363777) | Separados: calle y escuela. |
| a13 | Mirador Pampa | Mirazul | 51 m | 5 / 6 | [4.324631, -74.416001](https://www.google.com/maps?q=4.324631,-74.416001) | [4.324890, -74.415621](https://www.google.com/maps?q=4.324890,-74.415621) | Separados: paradas #1 y #2 consecutivas del recorrido. |
| a14 | Nueva EPS | Universidad de Cundinamarca | 53 m | 1 / 2 | [4.334024, -74.368992](https://www.google.com/maps?q=4.334024,-74.368992) | [4.334028, -74.369473](https://www.google.com/maps?q=4.334028,-74.369473) | Separados: dos instituciones. |
| a15 | Carrera 1 Santander | Paradero San Antonio | 56 m | 1 / 1 | [4.353204, -74.358172](https://www.google.com/maps?q=4.353204,-74.358172) | [4.353645, -74.358417](https://www.google.com/maps?q=4.353645,-74.358417) | Separados (falsa fusión anotada). |
| a16 | Calle 22 | Maíz Amarillo | 57 m | 6 / 1 | [4.326675, -74.400372](https://www.google.com/maps?q=4.326675,-74.400372) | [4.327180, -74.400457](https://www.google.com/maps?q=4.327180,-74.400457) | Separados (falsa fusión anotada). |
| a17 | Funeraria Jardines del Renacer | Fusagasugá | 57 m | 1 / 2 | [4.345364, -74.362291](https://www.google.com/maps?q=4.345364,-74.362291) | [4.345152, -74.361823](https://www.google.com/maps?q=4.345152,-74.361823) | Separados (falsa fusión anotada). |
| a18 | Luxemburgo | Paradero San Antonio | 59 m | 1 / 1 | [4.353204, -74.358114](https://www.google.com/maps?q=4.353204,-74.358114) | [4.353645, -74.358417](https://www.google.com/maps?q=4.353645,-74.358417) | Separados (falsa fusión anotada). |


## (b) Homónimos separados

Mismo nombre a más de 150 m: quedan como lugares distintos, con el sufijo entre paréntesis (el sufijo es mío; cámbialo si prefieres otro).

| # | Nombre | Lugar | Slug | Coordenada | Marcadores (rutas) | Distancia al otro |
|---|---|---|---|---|---|---|
| b1 | calle 3 | Calle 3 (Olaya) | calle-3-olaya | [4.346405, -74.361567](https://www.google.com/maps?q=4.346405,-74.361567) | 1 (1 ruta) | 602 m a calle-3-la-palma; 266 m a calle-3-cra-9 |
| b1 | calle 3 | Calle 3 (La Palma) | calle-3-la-palma | [4.350452, -74.357955](https://www.google.com/maps?q=4.350452,-74.357955) | 1 (1 ruta) | 602 m a calle-3-olaya; 815 m a calle-3-cra-9 |
| b1 | calle 3 | Calle 3 (Cra. 9) | calle-3-cra-9 | [4.346218, -74.363960](https://www.google.com/maps?q=4.346218,-74.363960) | 1 (1 ruta) | 266 m a calle-3-olaya; 815 m a calle-3-la-palma |
| b2 | carrera 1 | Carrera 1 (Gran Surtidor) | carrera-1-gran-surtidor | [4.349019, -74.357773](https://www.google.com/maps?q=4.349019,-74.357773) | 1 (1 ruta) | 204 m a carrera-1-barrio-santander |
| b2 | carrera 1 | Carrera 1 (Barrio Santander) | carrera-1-barrio-santander | [4.347184, -74.357712](https://www.google.com/maps?q=4.347184,-74.357712) | 1 (1 ruta) | 204 m a carrera-1-gran-surtidor |
| b3 | cra 7 | Cra 7 (Colsubsidio) | cra-7-colsubsidio | [4.341816, -74.362260](https://www.google.com/maps?q=4.341816,-74.362260) | 2 (2 rutas) | 222 m a cra-7-calle-11 |
| b3 | cra 7 | Cra 7 (Calle 11) | cra-7-calle-11 | [4.339878, -74.362733](https://www.google.com/maps?q=4.339878,-74.362733) | 1 (1 ruta) | 222 m a cra-7-colsubsidio |
| b4 | la trinidad | La Trinidad (Palacios) | la-trinidad-palacios | [4.291150, -74.388171](https://www.google.com/maps?q=4.291150,-74.388171) | 1 (1 ruta) | 1413 m a la-trinidad-barcelona |
| b4 | la trinidad | La Trinidad (Barcelona) | la-trinidad-barcelona | [4.300519, -74.396774](https://www.google.com/maps?q=4.300519,-74.396774) | 1 (1 ruta) | 1413 m a la-trinidad-palacios |

Mi lectura:

- **b1** (calle 3): Tres cruces distintos de la Calle 3 (266 a 815 m entre sí). Separados es lo correcto salvo que algún marcador esté mal puesto.
- **b2** (carrera 1): A 204 m, apenas sobre el umbral de 150 m. Pueden ser la misma Carrera 1 marcada desde dos rutas; por la regla quedan separados.
- **b3** (cra 7): A 222 m, apenas sobre el umbral. El segundo está a 5 m del cruce con la Calle 11 (ver a1). Por la regla quedan separados.
- **b4** (la trinidad): A 1413 m: claramente lugares distintos.

## (c) Lugares sin coordenada

Existen en la BD pero ningún KML trae su marcador. En `ruta-lugar.csv` aparecen con `slug` vacío y el slug en `slug_pendiente`. Si me pasas la coordenada, los completo.

| # | Lugar | Slug | Rutas donde aparece | Nota |
|---|---|---|---|---|
| c1 | Alaska | alaska | 8 | Lugar de Pasca sin KML; Nominatim no lo encontró con confianza. |
| c2 | Ara Ebenezer | ara-ebenezer | 13 | Sin marcador en ningún KML. |
| c3 | Barcelona | barcelona | 33 | Sin marcador en ningún KML. |
| c4 | Buenas Tardes | buenas-tardes | 8 | Lugar de Pasca sin KML; Nominatim no lo encontró con confianza. |
| c5 | Calle Caliente | calle-caliente | 10 | Sin marcador en ningún KML. |
| c6 | Caney | caney | 16 | Sin marcador en ningún KML. |
| c7 | Chinauta Escuela | chinauta-escuela | 22 | Sin marcador en ningún KML. |
| c8 | Colegio La Presentación | colegio-la-presentacion | 8 | Lugar de Pasca sin KML; Nominatim no lo encontró con confianza. |
| c9 | Corregimiento | corregimiento | 8 | Lugar de Pasca sin KML; Nominatim no lo encontró con confianza. |
| c10 | Crucero La Angostura | crucero-la-angostura | 8 | Lugar de Pasca sin KML; Nominatim no lo encontró con confianza. |
| c11 | El Cuja | el-cuja | 7, 27, 28 | Sin marcador en ningún KML. |
| c12 | Entrada Pampa | entrada-pampa | 18, 22 | Sin marcador en ningún KML. |
| c13 | Escuela de los Sauces | escuela-de-los-sauces | 8 | Lugar de Pasca sin KML; Nominatim no lo encontró con confianza. |
| c14 | Escuela Kennedy | escuela-kennedy | 7, 28 | Sin marcador en ningún KML. |
| c15 | Gasolinera | gasolinera | 11 | Sin marcador en ningún KML. |
| c16 | Inspección El Triunfo | inspeccion-el-triunfo | 6, 21 | Sin marcador en ningún KML. |
| c17 | Jardin Los Periquillos | jardin-los-periquillos | 10 | Sin marcador en ningún KML. |
| c18 | La Capilla | la-capilla | 8 | Lugar de Pasca sin KML; Nominatim no lo encontró con confianza. |
| c19 | La Shell | la-shell | 23, 28 | Sin marcador en ningún KML. |
| c20 | Los Ríos | los-rios | 7 | Sin marcador en ningún KML. |
| c21 | Mesitas | mesitas | 27 | Sin marcador en ningún KML. |
| c22 | Panadería Filipo (Pekín) | panaderia-filipo-pekin | 8 | Lugar de Pasca sin KML; Nominatim no lo encontró con confianza. Lugar DISTINTO de "Panadería Filipo" de las rutas urbanas (decisión de Santiago). |
| c23 | Pantano de Vargas | pantano-de-vargas | 1 | Sin marcador en ningún KML. |
| c24 | Papa Picha | papa-picha | 21, 22 | Sin marcador en ningún KML. |
| c25 | Rotonda Calle 24B | rotonda-calle-24b | 24, 25 | Sin marcador en ningún KML. |
| c26 | Rotonda San Fernando | rotonda-san-fernando | 19 | Sin marcador en ningún KML. |
| c27 | SENA | sena | 5 | Sin marcador en ningún KML. |
| c28 | Vía Quebrajacho | via-quebrajacho | 5 | Sin marcador en ningún KML. |
| c29 | Villa Leny | villa-leny | 5 | Sin marcador en ningún KML. |
| c30 | Zona Rosa | zona-rosa | 2, 4, 9, 26 | Sin marcador en ningún KML. |

## (d) Lugares de Pasca

La BD tiene hoy 9 filas para esta ruta (Fusagasugá, Corregimiento, Hogar Francisco y Clara, Escuela de los Sauces, Alaska, Buenas Tardes, Crucero La Angostura, La Capilla, Pasca); el recorrido nuevo las reemplaza y "Fusagasugá" sale de la lista.

Recorrido nuevo, en orden. Los que no tenían KML se buscaron en Nominatim (OpenStreetMap, acotado a Fusagasugá–Pasca); si no hay un resultado que coincida con el nombre, queda sin coordenada y no se inventa.

| Orden | Lugar | Slug | Coordenada | Fuente | Nota |
|---|---|---|---|---|---|
| 1 | Potosí | potosi | [4.339825, -74.364038](https://www.google.com/maps?q=4.339825,-74.364038) | kml | Ya tiene marcador en otras rutas: se reutiliza. |
| 2 | Bomberos | bomberos | [4.341778, -74.360785](https://www.google.com/maps?q=4.341778,-74.360785) | kml | Ya tiene marcador (ruta Nariño Pekín): se reutiliza. |
| 3 | Colegio La Presentación | colegio-la-presentacion | — | sin-coordenada | Lugar de Pasca sin KML; Nominatim no lo encontró con confianza. |
| 4 | Pompas La Paz | funeraria-la-paz | [4.344887, -74.360778](https://www.google.com/maps?q=4.344887,-74.360778) | kml | SUPUESTO: "Pompas La Paz" del recorrido de Pasca se tomó como la Funeraria La Paz que ya tiene marcador. |
| 5 | Panadería Filipo (Pekín) | panaderia-filipo-pekin | — | sin-coordenada | Lugar de Pasca sin KML; Nominatim no lo encontró con confianza. Lugar DISTINTO de "Panadería Filipo" de las rutas urbanas (decisión de Santiago). |
| 6 | Corregimiento | corregimiento | — | sin-coordenada | Lugar de Pasca sin KML; Nominatim no lo encontró con confianza. |
| 7 | Hogar Francisco y Clara | hogar-francisco-y-clara | [4.335814, -74.353721](https://www.google.com/maps?q=4.335814,-74.353721) | nominatim | OSM w1196568893 (amenity/social_facility): Hogar Francisco y Clara, Carrera 4 Este, Altos de Pekín. Ubicado en Nominatim (Altos de Pekín, Fusagasugá). |
| 8 | Escuela de los Sauces | escuela-de-los-sauces | — | sin-coordenada | Lugar de Pasca sin KML; Nominatim no lo encontró con confianza. |
| 9 | Alaska | alaska | — | sin-coordenada | Lugar de Pasca sin KML; Nominatim no lo encontró con confianza. |
| 10 | Buenas Tardes | buenas-tardes | — | sin-coordenada | Lugar de Pasca sin KML; Nominatim no lo encontró con confianza. |
| 11 | Crucero La Angostura | crucero-la-angostura | — | sin-coordenada | Lugar de Pasca sin KML; Nominatim no lo encontró con confianza. |
| 12 | La Capilla | la-capilla | — | sin-coordenada | Lugar de Pasca sin KML; Nominatim no lo encontró con confianza. |
| 13 | Pasca | pasca | [4.307830, -74.300179](https://www.google.com/maps?q=4.307830,-74.300179) | nominatim | OSM r1413207 (boundary/administrative): Pasca, Pasca pueblo, Sumapaz. |

## Anexo: todos los lugares con coordenada

| Slug | Nombre | Fuente | Marcadores | Dispersión | Rutas | Mapa |
|---|---|---|---|---|---|---|
| academia-militar-pantano-de-vargas | Academia Militar Pantano de Vargas | kml | 1 | 0 m | 1 | [4.353979, -74.356042](https://www.google.com/maps?q=4.353979,-74.356042) |
| alto-canecas | Alto Canecas | kml | 1 | 0 m | 2 | [4.261751, -74.527715](https://www.google.com/maps?q=4.261751,-74.527715) |
| altos-de-pekin | Altos de Pekín | kml | 1 | 0 m | 1 | [4.345123, -74.356241](https://www.google.com/maps?q=4.345123,-74.356241) |
| arbelaez | Arbeláez | kml | 1 | 0 m | 1 | [4.272793, -74.416014](https://www.google.com/maps?q=4.272793,-74.416014) |
| av-las-palmas | Av. Las Palmas | kml-centroide | 17 | 526 m | 17 | [4.342015, -74.368188](https://www.google.com/maps?q=4.342015,-74.368188) |
| av-manuel-humberto | Av. Manuel Humberto | kml | 3 | 0 m | 3 | [4.328895, -74.367478](https://www.google.com/maps?q=4.328895,-74.367478) |
| avenida-calle-22 | Avenida Calle 22 | kml | 8 | 0 m | 8 | [4.328880, -74.386076](https://www.google.com/maps?q=4.328880,-74.386076) |
| avisos-j-neon | Avisos J-Neon | kml | 1 | 0 m | 1 | [4.350608, -74.360823](https://www.google.com/maps?q=4.350608,-74.360823) |
| banco-agrario | Banco Agrario | kml | 1 | 0 m | 1 | [4.342428, -74.360051](https://www.google.com/maps?q=4.342428,-74.360051) |
| banco-caja-social | Banco Caja Social | kml | 4 | 0 m | 4 | [4.342291, -74.363295](https://www.google.com/maps?q=4.342291,-74.363295) |
| banco-popular | Banco Popular | kml | 1 | 0 m | 1 | [4.342603, -74.360015](https://www.google.com/maps?q=4.342603,-74.360015) |
| barrio-el-eden | Barrio El Edén | kml | 1 | 0 m | 1 | [4.352064, -74.365226](https://www.google.com/maps?q=4.352064,-74.365226) |
| barrio-la-florida | Barrio La Florida | kml | 1 | 0 m | 1 | [4.347641, -74.360825](https://www.google.com/maps?q=4.347641,-74.360825) |
| barrio-progreso | Barrio Progreso | kml | 1 | 0 m | 1 | [4.351532, -74.362266](https://www.google.com/maps?q=4.351532,-74.362266) |
| barrio-santander | Barrio Santander | kml | 3 | 0 m | 3 | [4.346926, -74.359414](https://www.google.com/maps?q=4.346926,-74.359414) |
| batallon | Batallón | kml | 5 | 0 m | 5 | [4.326571, -74.399738](https://www.google.com/maps?q=4.326571,-74.399738) |
| batallon-sumapaz | Batallón Sumapaz | kml | 2 | 0 m | 2 | [4.301681, -74.403776](https://www.google.com/maps?q=4.301681,-74.403776) |
| bochica | Bochica | kml | 1 | 0 m | 1 | [4.292133, -74.390715](https://www.google.com/maps?q=4.292133,-74.390715) |
| bomberos | Bomberos | kml | 1 | 0 m | 2 | [4.341778, -74.360785](https://www.google.com/maps?q=4.341778,-74.360785) |
| boqueron | Boquerón | kml | 1 | 0 m | 1 | [4.283658, -74.474533](https://www.google.com/maps?q=4.283658,-74.474533) |
| bosques-de-oriente | Bosques de Oriente | kml | 1 | 0 m | 1 | [4.324255, -74.361829](https://www.google.com/maps?q=4.324255,-74.361829) |
| calle-1-norte | Calle 1 Norte | kml | 1 | 0 m | 1 | [4.347891, -74.365058](https://www.google.com/maps?q=4.347891,-74.365058) |
| calle-11 | Calle 11 | kml | 3 | 0 m | 3 | [4.339916, -74.362760](https://www.google.com/maps?q=4.339916,-74.362760) |
| calle-2 | Calle 2 | kml | 2 | 0 m | 2 | [4.347228, -74.360173](https://www.google.com/maps?q=4.347228,-74.360173) |
| calle-21 | Calle 21 | kml | 1 | 0 m | 1 | [4.328275, -74.364739](https://www.google.com/maps?q=4.328275,-74.364739) |
| calle-22 | Calle 22 | kml | 6 | 0 m | 6 | [4.326675, -74.400372](https://www.google.com/maps?q=4.326675,-74.400372) |
| calle-3-cra-9 | Calle 3 (Cra. 9) | kml | 1 | 0 m | 1 | [4.346218, -74.363960](https://www.google.com/maps?q=4.346218,-74.363960) |
| calle-3-la-palma | Calle 3 (La Palma) | kml | 1 | 0 m | 1 | [4.350452, -74.357955](https://www.google.com/maps?q=4.350452,-74.357955) |
| calle-3-olaya | Calle 3 (Olaya) | kml | 1 | 0 m | 1 | [4.346405, -74.361567](https://www.google.com/maps?q=4.346405,-74.361567) |
| calle-4 | Calle 4 | kml-centroide | 3 | 90 m | 3 | [4.345621, -74.361834](https://www.google.com/maps?q=4.345621,-74.361834) |
| calle-7 | Calle 7 | kml | 1 | 0 m | 1 | [4.343453, -74.360869](https://www.google.com/maps?q=4.343453,-74.360869) |
| cambulos-3 | Cambulos 3 | kml | 2 | 0 m | 2 | [4.335344, -74.397886](https://www.google.com/maps?q=4.335344,-74.397886) |
| camino-real | Camino Real | kml | 1 | 0 m | 1 | [4.325554, -74.356101](https://www.google.com/maps?q=4.325554,-74.356101) |
| carrera-1-barrio-santander | Carrera 1 (Barrio Santander) | kml | 1 | 0 m | 1 | [4.347184, -74.357712](https://www.google.com/maps?q=4.347184,-74.357712) |
| carrera-1-gran-surtidor | Carrera 1 (Gran Surtidor) | kml | 1 | 0 m | 1 | [4.349019, -74.357773](https://www.google.com/maps?q=4.349019,-74.357773) |
| carrera-1-santander | Carrera 1 Santander | kml | 1 | 0 m | 1 | [4.353204, -74.358172](https://www.google.com/maps?q=4.353204,-74.358172) |
| carrera-11 | Carrera 11 | kml | 2 | 0 m | 2 | [4.341420, -74.365171](https://www.google.com/maps?q=4.341420,-74.365171) |
| carrera-17 | Carrera 17 | kml | 1 | 0 m | 1 | [4.340367, -74.370046](https://www.google.com/maps?q=4.340367,-74.370046) |
| carrera-4 | Carrera 4 | kml | 1 | 0 m | 1 | [4.345675, -74.360120](https://www.google.com/maps?q=4.345675,-74.360120) |
| carrera-41 | Carrera 41 | kml | 2 | 0 m | 2 | [4.327908, -74.385978](https://www.google.com/maps?q=4.327908,-74.385978) |
| carrera-6 | Carrera 6 | kml | 4 | 0 m | 4 | [4.337822, -74.361642](https://www.google.com/maps?q=4.337822,-74.361642) |
| carrera-8 | Carrera 8 | kml | 1 | 0 m | 1 | [4.334549, -74.364353](https://www.google.com/maps?q=4.334549,-74.364353) |
| carrera-9 | Carrera 9 | kml | 2 | 0 m | 2 | [4.341963, -74.363917](https://www.google.com/maps?q=4.341963,-74.363917) |
| cedritos | Cedritos | kml | 2 | 0 m | 2 | [4.346054, -74.354753](https://www.google.com/maps?q=4.346054,-74.354753) |
| cementerio | Cementerio | kml | 2 | 0 m | 2 | [4.349053, -74.365516](https://www.google.com/maps?q=4.349053,-74.365516) |
| centro-comercial-avenida | Centro Comercial Avenida | kml | 4 | 0 m | 4 | [4.343802, -74.373782](https://www.google.com/maps?q=4.343802,-74.373782) |
| centro-comercial-jardin | Centro Comercial Jardin | kml | 1 | 0 m | 1 | [4.332210, -74.374955](https://www.google.com/maps?q=4.332210,-74.374955) |
| centro-comercial-manila | Centro Comercial Manila | kml | 3 | 0 m | 3 | [4.332934, -74.370028](https://www.google.com/maps?q=4.332934,-74.370028) |
| centro-de-integracion-infantil | Centro de integración Infantil | kml | 1 | 0 m | 1 | [4.345614, -74.363084](https://www.google.com/maps?q=4.345614,-74.363084) |
| centro-parque-principal | Centro (Parque Principal) | kml | 11 | 0 m | 12 | [4.343838, -74.362005](https://www.google.com/maps?q=4.343838,-74.362005) |
| chinauta | Chinauta | kml | 2 | 0 m | 3 | [4.295601, -74.452283](https://www.google.com/maps?q=4.295601,-74.452283) |
| ciudad-ebenezer | Ciudad Ebenezer | kml | 1 | 0 m | 1 | [4.332597, -74.394680](https://www.google.com/maps?q=4.332597,-74.394680) |
| clinica-belen | Clínica Belén | kml | 6 | 0 m | 6 | [4.336164, -74.366491](https://www.google.com/maps?q=4.336164,-74.366491) |
| colegio-accion-comunal | Colegio Accion Comunal | kml | 1 | 0 m | 1 | [4.354025, -74.358219](https://www.google.com/maps?q=4.354025,-74.358219) |
| colegio-chinauta | Colegio Chinauta | kml | 1 | 0 m | 2 | [4.296892, -74.445757](https://www.google.com/maps?q=4.296892,-74.445757) |
| comfenalco | Comfenalco | kml | 1 | 0 m | 1 | [4.330162, -74.396356](https://www.google.com/maps?q=4.330162,-74.396356) |
| comuneros | Comuneros | kml | 1 | 0 m | 1 | [4.325439, -74.360839](https://www.google.com/maps?q=4.325439,-74.360839) |
| cooviprof | Cooviprof | kml | 2 | 0 m | 2 | [4.327071, -74.385425](https://www.google.com/maps?q=4.327071,-74.385425) |
| cra-7-calle-11 | Cra 7 (Calle 11) | kml | 1 | 0 m | 1 | [4.339878, -74.362733](https://www.google.com/maps?q=4.339878,-74.362733) |
| cra-7-colsubsidio | Cra 7 (Colsubsidio) | kml | 2 | 0 m | 2 | [4.341816, -74.362260](https://www.google.com/maps?q=4.341816,-74.362260) |
| cutucumay | Cutucumay | kml | 2 | 0 m | 2 | [4.311639, -74.438697](https://www.google.com/maps?q=4.311639,-74.438697) |
| d1-balmoral | D1 Balmoral | kml | 1 | 0 m | 1 | [4.330544, -74.368074](https://www.google.com/maps?q=4.330544,-74.368074) |
| d1-de-la-22 | D1 de la 22 | kml | 1 | 0 m | 1 | [4.332795, -74.372413](https://www.google.com/maps?q=4.332795,-74.372413) |
| diagonal-1 | Diagonal 1 | kml | 1 | 0 m | 1 | [4.349163, -74.362025](https://www.google.com/maps?q=4.349163,-74.362025) |
| ebenezer | Ebenezer | kml | 2 | 0 m | 3 | [4.329020, -74.364291](https://www.google.com/maps?q=4.329020,-74.364291) |
| el-placer-espinalito | El Placer / Espinalito | kml | 1 | 0 m | 1 | [4.311099, -74.402815](https://www.google.com/maps?q=4.311099,-74.402815) |
| escuela-julio-sabogal | Escuela Julio Sabogal | kml | 1 | 0 m | 1 | [4.346622, -74.363777](https://www.google.com/maps?q=4.346622,-74.363777) |
| escuela-policia | Escuela Policía | kml | 2 | 0 m | 2 | [4.332648, -74.392737](https://www.google.com/maps?q=4.332648,-74.392737) |
| espinalito-alto | Espinalito Alto | kml | 2 | 0 m | 2 | [4.312220, -74.403280](https://www.google.com/maps?q=4.312220,-74.403280) |
| fiscalia-general-de-fusagasuga | Fiscalía General de Fusagasugá | kml | 6 | 0 m | 6 | [4.338820, -74.363869](https://www.google.com/maps?q=4.338820,-74.363869) |
| funeraria-jardines-del-renacer | Funeraria Jardines del Renacer | kml | 1 | 0 m | 1 | [4.345364, -74.362291](https://www.google.com/maps?q=4.345364,-74.362291) |
| funeraria-la-paz | Funeraria La Paz | kml | 2 | 0 m | 3 | [4.344887, -74.360778](https://www.google.com/maps?q=4.344887,-74.360778) |
| fusacatan | Fusacatán | kml | 1 | 0 m | 1 | [4.328102, -74.364192](https://www.google.com/maps?q=4.328102,-74.364192) |
| fusagasuga | Fusagasugá | kml | 1 | 0 m | 2 | [4.345152, -74.361823](https://www.google.com/maps?q=4.345152,-74.361823) |
| galeria-plaza-de-mercado | Galería (Plaza de Mercado) | kml | 10 | 0 m | 10 | [4.341817, -74.365001](https://www.google.com/maps?q=4.341817,-74.365001) |
| guavio | Guavio | kml | 1 | 0 m | 1 | [4.273237, -74.376032](https://www.google.com/maps?q=4.273237,-74.376032) |
| guayabol | Guayabol | kml | 2 | 0 m | 2 | [4.294450, -74.394180](https://www.google.com/maps?q=4.294450,-74.394180) |
| hogar-francisco-y-clara | Hogar Francisco y Clara | nominatim | 1 | 0 m | 1 | [4.335814, -74.353721](https://www.google.com/maps?q=4.335814,-74.353721) |
| horizonte-colegio-nuevo-horizonte | Horizonte (Colegio Nuevo Horizonte) | kml-centroide | 3 | 62 m | 3 | [4.311917, -74.401966](https://www.google.com/maps?q=4.311917,-74.401966) |
| hotel-madaura | Hotel Madaura | kml | 1 | 0 m | 1 | [4.304767, -74.448509](https://www.google.com/maps?q=4.304767,-74.448509) |
| iglesia-gran-colombia | Iglesia Gran Colombia | kml | 2 | 0 m | 2 | [4.328952, -74.391611](https://www.google.com/maps?q=4.328952,-74.391611) |
| jaibana | Jaibáná | kml | 2 | 0 m | 3 | [4.324571, -74.417938](https://www.google.com/maps?q=4.324571,-74.417938) |
| jardin-de-dona-bertha | Jardín de Doña Bertha | kml | 1 | 0 m | 1 | [4.353556, -74.354624](https://www.google.com/maps?q=4.353556,-74.354624) |
| la-clarita | La Clarita | kml | 1 | 0 m | 1 | [4.353556, -74.354624](https://www.google.com/maps?q=4.353556,-74.354624) |
| la-gran-colombia | La Gran Colombia | kml | 2 | 0 m | 2 | [4.329240, -74.392655](https://www.google.com/maps?q=4.329240,-74.392655) |
| la-palma | La Palma | kml | 1 | 0 m | 1 | [4.350635, -74.352722](https://www.google.com/maps?q=4.350635,-74.352722) |
| la-querencia | La Querencia | kml | 12 | 0 m | 12 | [4.328923, -74.387546](https://www.google.com/maps?q=4.328923,-74.387546) |
| la-trinidad-barcelona | La Trinidad (Barcelona) | kml | 1 | 0 m | 1 | [4.300519, -74.396774](https://www.google.com/maps?q=4.300519,-74.396774) |
| la-trinidad-palacios | La Trinidad (Palacios) | kml | 1 | 0 m | 1 | [4.291150, -74.388171](https://www.google.com/maps?q=4.291150,-74.388171) |
| llano-grande | Llano Grande | kml | 1 | 0 m | 1 | [4.326001, -74.414747](https://www.google.com/maps?q=4.326001,-74.414747) |
| llano-largo | Llano Largo | kml | 1 | 0 m | 1 | [4.328369, -74.402552](https://www.google.com/maps?q=4.328369,-74.402552) |
| los-robles | Los Robles | kml | 1 | 0 m | 1 | [4.335400, -74.360406](https://www.google.com/maps?q=4.335400,-74.360406) |
| lusitania | Lusitania | kml | 1 | 0 m | 1 | [4.328584, -74.365328](https://www.google.com/maps?q=4.328584,-74.365328) |
| luxemburgo | Luxemburgo | kml | 1 | 0 m | 1 | [4.353204, -74.358114](https://www.google.com/maps?q=4.353204,-74.358114) |
| maiz-amarillo | Maíz Amarillo | kml | 1 | 0 m | 1 | [4.327180, -74.400457](https://www.google.com/maps?q=4.327180,-74.400457) |
| mandalay | Mandalay | kml | 1 | 0 m | 1 | [4.345194, -74.373066](https://www.google.com/maps?q=4.345194,-74.373066) |
| mirador-pampa | Mirador Pampa | kml | 5 | 0 m | 5 | [4.324631, -74.416001](https://www.google.com/maps?q=4.324631,-74.416001) |
| mirazul | Mirazul | kml | 6 | 0 m | 6 | [4.324890, -74.415621](https://www.google.com/maps?q=4.324890,-74.415621) |
| monumento-el-indio | Monumento El Indio | kml | 20 | 0 m | 20 | [4.331682, -74.377517](https://www.google.com/maps?q=4.331682,-74.377517) |
| mr-beef | Mr Beef | kml | 1 | 0 m | 1 | [4.332962, -74.369112](https://www.google.com/maps?q=4.332962,-74.369112) |
| nueva-eps | Nueva EPS | kml | 1 | 0 m | 1 | [4.334024, -74.368992](https://www.google.com/maps?q=4.334024,-74.368992) |
| olaya | Olaya | kml | 2 | 0 m | 2 | [4.344632, -74.365239](https://www.google.com/maps?q=4.344632,-74.365239) |
| palacios | Palacios | kml | 2 | 0 m | 2 | [4.306687, -74.395016](https://www.google.com/maps?q=4.306687,-74.395016) |
| panaderia-filipo | Panadería Filipo | kml | 5 | 0 m | 5 | [4.341763, -74.363046](https://www.google.com/maps?q=4.341763,-74.363046) |
| paradero-comuneros | Paradero Comuneros | kml | 1 | 0 m | 1 | [4.326455, -74.360096](https://www.google.com/maps?q=4.326455,-74.360096) |
| paradero-gaitan | Paradero Gaitan | kml | 1 | 0 m | 1 | [4.346577, -74.365967](https://www.google.com/maps?q=4.346577,-74.365967) |
| paradero-san-antonio | Paradero San Antonio | kml | 1 | 0 m | 1 | [4.353645, -74.358417](https://www.google.com/maps?q=4.353645,-74.358417) |
| paris-night-club | Paris Night Club | kml | 2 | 0 m | 2 | [4.352410, -74.359435](https://www.google.com/maps?q=4.352410,-74.359435) |
| pasca | Pasca | nominatim | 1 | 0 m | 1 | [4.307830, -74.300179](https://www.google.com/maps?q=4.307830,-74.300179) |
| pekin | Pekín | kml | 1 | 0 m | 1 | [4.343783, -74.356815](https://www.google.com/maps?q=4.343783,-74.356815) |
| piramides | Pirámides | kml | 1 | 0 m | 2 | [4.263395, -74.505570](https://www.google.com/maps?q=4.263395,-74.505570) |
| potosi | Potosí | kml | 3 | 0 m | 4 | [4.339825, -74.364038](https://www.google.com/maps?q=4.339825,-74.364038) |
| prados-de-altagracia | Prados de Altagracia | kml | 1 | 0 m | 1 | [4.327316, -74.362612](https://www.google.com/maps?q=4.327316,-74.362612) |
| puente-del-aguila | Puente del Águila | kml | 8 | 0 m | 9 | [4.339146, -74.363748](https://www.google.com/maps?q=4.339146,-74.363748) |
| puesto-de-salud-progreso | Puesto de salud Progreso | kml | 1 | 0 m | 1 | [4.351279, -74.362257](https://www.google.com/maps?q=4.351279,-74.362257) |
| resguardos | Resguardos | kml | 1 | 0 m | 1 | [4.355159, -74.373688](https://www.google.com/maps?q=4.355159,-74.373688) |
| restaurante-universitario | Restaurante Universitario | kml | 1 | 0 m | 1 | [4.332853, -74.368222](https://www.google.com/maps?q=4.332853,-74.368222) |
| rio-cuja | Río Cuja | kml | 3 | 0 m | 3 | [4.320376, -74.388709](https://www.google.com/maps?q=4.320376,-74.388709) |
| salon-comunal-ebenezer | Salón Comunal Ebenezer | kml | 2 | 0 m | 2 | [4.332774, -74.394971](https://www.google.com/maps?q=4.332774,-74.394971) |
| san-antonio | San Antonio | kml | 2 | 0 m | 2 | [4.353147, -74.357168](https://www.google.com/maps?q=4.353147,-74.357168) |
| san-fernando | San Fernando | kml | 1 | 0 m | 1 | [4.324010, -74.364336](https://www.google.com/maps?q=4.324010,-74.364336) |
| san-fernando-centro-comercial | San Fernando Centro Comercial | kml | 1 | 0 m | 1 | [4.324546, -74.363371](https://www.google.com/maps?q=4.324546,-74.363371) |
| san-francisco | San Francisco | kml | 8 | 0 m | 8 | [4.327660, -74.412563](https://www.google.com/maps?q=4.327660,-74.412563) |
| santa-anita | Santa Anita | kml | 1 | 0 m | 1 | [4.338790, -74.369122](https://www.google.com/maps?q=4.338790,-74.369122) |
| santa-anita-calle-17 | Santa Anita (Calle 17) | kml | 1 | 0 m | 1 | [4.339404, -74.369754](https://www.google.com/maps?q=4.339404,-74.369754) |
| sta-maria-de-los-angeles | Sta. María de los Ángeles | kml | 1 | 0 m | 1 | [4.345235, -74.352925](https://www.google.com/maps?q=4.345235,-74.352925) |
| supermercado-el-gran-surtidor | Supermercado El Gran Surtidor | kml | 4 | 0 m | 4 | [4.349620, -74.356613](https://www.google.com/maps?q=4.349620,-74.356613) |
| terminal-de-transporte | Terminal de Transporte | kml | 10 | 0 m | 10 | [4.345887, -74.377859](https://www.google.com/maps?q=4.345887,-74.377859) |
| tiendas-ara-antiguo-colsubsidio | Tiendas Ara (Antiguo Colsubsidio) | kml | 9 | 0 m | 9 | [4.341256, -74.361504](https://www.google.com/maps?q=4.341256,-74.361504) |
| u-hospital-exito | U. Hospital Éxito | kml | 22 | 0 m | 23 | [4.333353, -74.370943](https://www.google.com/maps?q=4.333353,-74.370943) |
| universidad-de-cundinamarca | Universidad de Cundinamarca | kml | 2 | 0 m | 2 | [4.334028, -74.369473](https://www.google.com/maps?q=4.334028,-74.369473) |
| via-arbelaez | Vía Arbeláez | kml | 4 | 0 m | 4 | [4.326239, -74.396043](https://www.google.com/maps?q=4.326239,-74.396043) |
| villa-celeste | Villa Celeste | kml | 4 | 0 m | 4 | [4.327354, -74.410143](https://www.google.com/maps?q=4.327354,-74.410143) |
| villa-natalia | Villa Natalia | kml | 1 | 0 m | 2 | [4.350858, -74.370426](https://www.google.com/maps?q=4.350858,-74.370426) |
| villa-patricia | Villa Patricia | kml | 2 | 0 m | 2 | [4.328222, -74.384813](https://www.google.com/maps?q=4.328222,-74.384813) |
