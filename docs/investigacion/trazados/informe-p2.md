# P2 · Informe de trazados OSM y Pasca (2026-11-10)

Fuente: `verificacion-p2.json` / `verificacion-p2.log` (generados por `scripts/verificar-trazados.js`). Ningún control se relajó.
Los puntos movidos y los lugares no exigidos como punto de ruteo están declarados, con su motivo y su distancia medida, en
`scripts/trazados-osrm-config.json` (claves `mover` y `omitir`) y se ven en `revision-trazados.html`.

## Resultado: 3 de 9 pasan todos los controles

| # | Ruta | Resultado | Control que falla |
|---|---|---|---|
| #26 | Centro-Colsubsidio-Calle 4-Cedritos-San Antonio | ✔ pasa | — |
| #11b | Hospital-Batallón-La Pampa-Llano Grande | ✔ pasa | — |
| Pasca | Pasca (ruta 8) | ✔ pasa | — |
| #16 | Centro-Colsubsidio-Cementerio-Gaitán-Galán | ✘ | 1 tramo en sentido opuesto (≈ 4.3402, -74.3615) |
| #27 | Centro-U. Hospital-Colsubsidio-Cedritos | ✘ | "U. Hospital Éxito" (lugar no ruteado) queda a 101 m del trazado (límite 60 m) |
| #30 | Santa Anita-Galería-Colsubsidio-Cementerio-Resguardos | ✘ | 1 tramo en sentido opuesto + 1 giro en U (≈ 4.3364, -74.3659) |
| #20 | U. Hospital-Batallón-Llano Largo | ✘ | 5 tramos en sentido opuesto en el corredor Av. Calle 22 (lng -74.4094 a -74.4028, lat ≈ 4.3266) |
| #29 | U. Hospital-Cra. 9 Cll. 3-Colsubsidio-Cementerio | ✘ | 5 tramos en sentido opuesto (lat 4.3417-4.3469, lng -74.3642 a -74.3612) + 7 m en contravía en Calle 11 |
| #1 | Centro-Colsubsidio-Calle 3-Olaya | ✘ | 13 tramos en sentido opuesto + 1 giro en U + 41 m en contravía (way OSM 1264565160) |

Las rutas que no pasan **conservan el trazado vigente (V16)**: la migración V26 solo actualiza #26 y #11b.

## Por qué no pasan y qué dato de campo lo resolvería

El orden de lugares de estas rutas obliga a recorrer un corredor y volver sobre él (entrar a un barrio por una calle y salir por la misma
porque la vía paralela es de sentido único), o el marcador de un lugar cae en una vía cuyo sentido real no coincide con OSM.
La búsqueda automática (`buscar-puntos.js` + `refinar-trazados.js`) probó, por lugar, hasta 10 puntos candidatos de OSM a ≤ 60 m,
no exigir el lugar como punto de ruteo (solo si el trazado igual pasa a ≤ 60 m) y volver a exigirlo, midiendo cada cambio con los
mismos controles. Estos casos no mejoraron con ningún cambio de un solo punto.

- **#16, #30, #27:** un único defecto cada una, localizado. Falta saber **por cuál calle real circula la buseta** en ese punto
  (¿sube por la Cra. 9 o por la Cra. 8? ¿gira en U en la glorieta o continúa?). Un waypoint forzado con esa calle lo resuelve.
  Para #27, además: ¿la buseta pasa por la puerta del Éxito (a ≈ 100 m del trazado) o por la avenida?
- **#20 (y #11b antes de su arreglo):** el corredor Av. Calle 22 / Av. Antigua Panamericana entre Villa Celeste y San Francisco
  (lng -74.4094 a -74.4028) se recorre en ambos sentidos; falta el **recorrido real de ida** y qué calles usa para volver del
  último lugar (San Francisco / Llano Largo).
- **#29 y #1:** el orden de lugares fuerza entre 5 y 13 retrocesos. Hace falta el **recorrido real de la buseta** (grabado con GPS
  o descrito calle por calle), el sentido real de la vía OSM 1264565160 y de Calle 11 (OSM puede estar desactualizado), y confirmar
  si el orden de lugares de P0 es el orden real de paso o el orden en que se listan en el letrero.

Sin ese dato no se puede mejorar más sin quitar lugares de la ruta o relajar un control, y ninguna de las dos cosas es aceptable.

## Pasca

Ruta 8 (`sign_file` PASCA) dada de alta en V23 (ya en `main` y PROD). Verificado en PROD (`GET /api/routes/8`: nombre "Pasca", `signFile`
"PASCA", trazado no nulo, tarifa de Alaska $3.550) y en `capturas/PASCA-rutas-8.png`.

## Herramientas nuevas

- `scripts/buscar-puntos.js`: búsqueda de puntos candidatos (OSRM `/nearest`) con descenso por coordenadas; `--hibrido`, `--aplicar`, `--solo-aplicar`.
- `scripts/refinar-trazados.js`: refinamiento en lazo cerrado usando los controles reales (incluida la contravía contra Overpass).
- `scripts/gen-migracion-v26.js`: genera V26 solo con las rutas que pasan.
