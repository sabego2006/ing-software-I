# Investigación: rutas de busetas en Fusagasugá y sus letreros

> Consulta hecha el **27 de septiembre de 2026**. Es insumo para RF-05 (barrios), RF-06 (tarifa) y
> RF-15 (catálogo público), y para el diseño del componente de letrero en el frontend.
> Cada dato lleva su fuente y su fecha: varios vienen de 2014, 2020 o 2022 y pueden haber cambiado.

## 1. Lo que encontramos, en corto

- **No existe una lista pública de rutas urbanas** ni en la Alcaldía, ni en la Secretaría de Movilidad,
  ni en la Terminal, ni en Moovit o Google Maps. Los recorridos los completamos nosotros con lo
  recolectado y nuestra experiencia de usuarios, como ya estaba previsto en el riesgo de información.
- **La tarifa urbana 2026 es una sola: $2.600**, sin recargo nocturno (Decreto 16 de 2026).
- **Chinauta no paga tarifa urbana**: tiene tarifa por tramo, entre $3.150 y $9.550, salvo dentro de
  Chinauta ($2.600). Por eso la tarifa se modela **por tramo**, no como un valor único por ruta.
- **La Alcaldía publica en GeoJSON los 144 barrios y 56 veredas oficiales** (POT 2023). Con eso el
  backend puede calcular por qué barrios pasa cada ruta sin inventar nombres.
- **Los letreros son placas sueltas en la parte baja del parabrisas**, con 3 a 5 puntos de referencia en
  mayúsculas y un color de fondo por línea. Hay una tabla para cada sentido ("subiendo" y "bajando").
  Las réplicas están en [`letreros-replicas.html`](letreros-replicas.html) y los estilos en
  [`letreros-estilos.json`](letreros-estilos.json).

Código de ruta y empresa operadora **no son datos que necesitemos** (decisión del 2026-09-27): quedan
como campos opcionales y no se investigan más.

## 2. Fichas de ruta

Formato: nombre · tipo · puntos en orden de recorrido · tarifa 2026 · de dónde sale cada dato.
"Orden inferido" significa que lo dedujimos del letrero o de un mapa y hay que confirmarlo en campo.

| Nombre | Tipo | Puntos en orden de recorrido | Tarifa 2026 | Fuentes |
|---|---|---|---|---|
| Llano Largo – La Clarita | Urbana | Llano Verde → Llano Largo → *(tramo sin datos)* → Centro → Cra. 1 Santander → Pantano de Vargas → La Clarita | $2.600 | Extremos: [Inventum 2014][inv]. Tramo Centro → La Clarita: letrero en foto de [Tizumba, dic-2022][tiz22]. Tarifa: [Decreto 16/2026][dec] |
| Maíz Amarillo | Urbana | Ebenezer · Maíz Amarillo · Gran Colombia (costado de la Panamericana); "rodea el centro". **Sin orden** | $2.600 | [Inventum 2014][inv] |
| Pablo Bello – Cedritos | Urbana | Pablo Bello · Centro · Cedritos; cubre norte, centro y occidente. **Sin orden** | $2.600 | [Inventum 2014][inv] |
| Camino Real – La Pampa | Urbana | Camino Real → Prados de Alta Gracia → Calle 22 → Éxito → Hospital → Batallón → La Pampa → Llano Grande *(orden inferido)* | $2.600 | [Tizumba Online, FB, 27-oct-2020][pampa] (tablas y mapa) |
| Villa Leny – SENA Quebrajacho | Urbana → veredal | Villa Leny → Éxito → Puente El Águila → Centro (Cra. 6, Alcaldía) → Villa Natalia → Vía Quebrajacho → SENA *(leído de mapa)* | $2.700 hasta el SENA | [Blog SENA, ene-2020][sena]; tarifa: [Decreto 16/2026][dec] |
| Fusagasugá – Chinauta | Veredal (corregimiento) | Fusagasugá → Jaibaná → Colegio Chinauta → Chinauta (retorno antes del peaje) → Pirámides → Alto Canecas → Inspección El Triunfo | Por tramo (ver §3) | [Decreto 16/2026][dec]; el orden sigue la tabla del decreto sobre la vía a Melgar |
| Fusagasugá – Arbeláez | Intermunicipal | Vía Arbeláez: El Cuja → Escuela Kennedy → El Placer / Espinalito → Batallón Sumapaz → Los Ríos → Arbeláez | **Pasaje intermunicipal no encontrado.** Tramos veredales: Colegio Kennedy $3.450 · Guayabal Batallón $4.550 · Los Ríos $5.650 | Orden: tabla de taxis del [Decreto 16/2026][dec] |
| Fusagasugá – Pasca | Intermunicipal | Vía Pasca: Escuela de Sauces → Alaska → Buenas Tardes → Pasca | **Pasaje intermunicipal no encontrado.** Alaska $3.550 (veredal) | Orden: tabla de taxis del [Decreto 16/2026][dec] |

El decreto municipal **solo fija tarifas urbanas y veredales**. El pasaje intermunicipal hasta Pasca o
Arbeláez no aparece ahí; hay que tomarlo en la taquilla o preguntarlo directamente.

## 3. Tarifas oficiales 2026

Fuente única: [Decreto 16 del 5 de febrero de 2026][dec], Alcaldía de Fusagasugá. Deroga las de 2025
(Decreto 014 de 2025, urbana $2.400). El artículo 2 obliga a cada vehículo a llevar la tarifa visible.

**Colectivo urbano:** $2.600.

**Colectivo veredal — Chinauta:**

| Tramo | Tarifa 2026 |
|---|---|
| Jaibaná | $3.150 |
| Colegio Chinauta | $5.000 |
| Retorno antes del peaje / Chinauta | $5.000 |
| Pirámides | $6.300 |
| Alto Canecas (última bomba) | $6.950 |
| Inspección El Triunfo | $9.550 |
| Dentro de Chinauta | $2.600 |

**Otras veredales que tocan nuestras rutas:** Centro Agrotecnológico Quebrajacho / SENA $2.700 ·
Cucharal $2.700 · Bosachoque $2.800 · Alaska $3.550 · Colegio Kennedy $3.450 · Espinalito Bajo $3.550 ·
Guayabal Batallón $4.550 · Los Ríos $5.650 · La Aguadita $4.450 · Tres Esquinas (Novillero) $2.800.

**Taxi (referencia, no es alcance de la app):** perímetro urbano $8.450; del Indio a la Shell $9.300.

## 4. Barrios oficiales (GeoJSON)

El Observatorio de la Alcaldía publica la división político-administrativa del POT (Acuerdo 10 de 2023)
en GeoJSON, KML y CSV: [geovisores][obs] → "División político-administrativa".

- Archivo: `mi_municipio_fusagasug_.geojson` — 7,9 MB, 379 polígonos, WGS84 (lon/lat).
- **6 comunas con 144 barrios:** Centro 6, Norte 37, Occidental 32, Oriental 22, Sur Occidental 15,
  Sur Oriental 32.
- **5 corregimientos con 56 veredas:** Norte 7, Occidental 15, Oriental 11, Sur Occidental 5,
  Sur Oriental 18.

Uso propuesto: el backend carga los polígonos una vez al arrancar y cruza cada trazado de ruta contra
ellos para listar los barrios en orden (coherente con la decisión de hacer la geometría en `domain/` sin
PostGIS). **El archivo no viaja al navegador:** 7,9 MB rompe la meta de bundle ≤ 1 MB gzip de RNF-01;
al cliente solo llegan los nombres.

## 5. Los letreros

### Cómo son (evidencia)

- Van **en la parte baja del parabrisas, como placas sueltas**. Las pantallas LED solo aparecen en los
  buses intermunicipales (por ejemplo, Gómez Villa "FUSA AE").
- Cada placa lista **3 a 5 puntos de referencia en mayúsculas**: barrios, vías o hitos (ÉXITO, HOSPITAL,
  GALERÍA, CENTRO). Cada línea puede tener un fondo de color distinto.
- Una buseta suele llevar **varias placas a la vez**. Ejemplo real (foto, dic-2022): una placa amarilla
  "U. HOSPITAL / exito", una placa en arco naranja con la ruta y una placa blanca "CENTRO / GALERIA".
- Hay **una tabla por sentido**: "TABLA SUBIENDO" y "TABLA BAJANDO" (gráfico oficial de la ruta Camino
  Real–La Pampa, oct-2020).

### Qué tan fieles son las réplicas

| Letrero | Evidencia | Colores | Tipografía |
|---|---|---|---|
| Placa en arco "Centro · Cra. 1 Santander · Pantano de Vargas · La Clarita" + placas acompañantes | Foto real, dic-2022 | Muestreados de la foto | Original no identificable (palo seca negra de rotulista); se usa **Archivo Black / Archivo Narrow 700** como la más parecida |
| Tablas subiendo/bajando Camino Real – La Pampa | Gráfico oficial de la ruta, no foto del letrero físico | Copiados del gráfico (colores puros) | Serif negrita tipo Times New Roman; se usa **Tinos 700**, que tiene sus mismas métricas |

Con fotos públicas no se llega a una copia idéntica: la resolución no alcanza para identificar la fuente
exacta, y de Tierra Grata y Fusacatán no hay placas legibles. Las réplicas son **lo más parecido posible
con la evidencia que hay**. Para acercarlas más, basta con una foto frontal propia de cada letrero y
tomar los colores con un gotero; el modelo de datos ya los recibe.

### Tres plantillas para cargar cualquier ruta

Salen de las réplicas y están definidas en [`letreros-estilos.json`](letreros-estilos.json):

- **`PLACA_ARCO`**: arco naranja `#F7A93B`, texto café `#4A1D06`, línea destacada con fondo rosa
  `#FBE3DC` y texto rojo `#7A1414`, base negra.
- **`PLACA_RECT`**: rectángulo amarillo `#F3E31B` o blanco, borde negro de 3 px, texto negro pesado.
- **`TABLA_FRANJAS`**: una franja por línea (`#FFFF00`, `#C0C0C0`, `#008000`, `#FF0000` o blanco),
  serif negrita, borde negro. Se usa una para "subiendo" y otra para "bajando".

### Evidencia de campo (27-sep-2026, SCRUM-175)

Santiago fotografió letreros en un recorrido de ~35 min. Son **41 fotos** (los issues decían 45), guardadas
en `docs/fotos-letreros/`. Se leyeron una por una a resolución completa y quedó así: **22 modeladas, 9 por
revisar, 5 duplicadas y 5 ilegibles**, que dan **29 letreros distintos**. La bitácora está en
[`letreros-procesados.json`](letreros-procesados.json), los letreros en `letreros-estilos.json` → `campo`, y
cada uno se ve junto a su foto en [`letreros-replicas.html`](letreros-replicas.html). El flujo se repite con
`docs/investigacion/scripts/generar_replicas_letreros.py`.

Lo que cambia respecto a lo que decía este documento:

- **Sí hay placas legibles de Tierra Grata y de Fusacatán**, y también de Cootransfusa y Cootranspeover. La
  frase anterior ("de Tierra Grata y Fusacatán no hay placas legibles") ya no vale.
- **Casi todos los letreros son placas "de arco"** con el código de ruta arriba (`P-10`, `P-12`, `P-15`,
  `P-20`, `03`, `18`, `74`, `100`, `116`). Los colores varían mucho por empresa y por placa: verde oscuro,
  blanco, amarillo, rojo. El naranja de `PLACA_ARCO` solo se parece a la placa de la ruta con código 100;
  `PLACA_ARCO` sirve como forma, y el color hay que guardarlo por placa (ya lo hace `campo`).
- **Camino Real – La Pampa queda confirmada con foto**: las franjas y su orden coinciden con las tablas
  SUBIENDO y BAJANDO del gráfico de 2020, pero con contorno en arco y letra **sin serifa**, no serif. Las
  tablas no son un rectángulo: hay que permitir el contorno en arco.
- **Maíz Amarillo** (P-15: U.Hospital · Maíz Amarillo · Comfenalco · Ciudad Ebenezer) y **Llano Largo – La
  Clarita** (código 100) están confirmadas con foto. La segunda sigue idéntica a la foto de 2022.
- **Placas nuevas en el catálogo**: `P-10` (U.Hospital · Batallón · Llano Largo), `P-12` (Cra. 6 – Cll. 22 ·
  Hospital · Cooviprof · Villa Patricia), `P-20` (Centro · Colsubsidio · Calle 4 · Cedritos · San Antonio),
  Palacios · Trinidad · Guavio, Chinauta · Boquerón (`74`), Chinauta · Escuela (`03`) y Arbeláez. No las
  cruzamos contra las rutas ya sembradas, y las fotos **no muestran el orden de recorrido ni los sentidos**.
- **Una placa trae pintada una tarifa vieja** ("$2. 00"); la oficial de 2026 es $2.600. No hay que fiarse de
  lo que dice el letrero para la tarifa.
- Las placas son **intercambiables y se combinan** (cada buseta lleva 2 a 4: la de ruta más "U.HOSPITAL /
  ÉXITO", "CENTRO / GALERÍA" o "CENTRO / AV. LAS PALMAS"). El modelo de datos (§6) debe permitir placas
  compartidas entre rutas, no una por ruta.

Límites que hay que tener presentes: los **colores están estimados a ojo**, no tomados con gotero; los
logos (Colsubsidio, Shell) se reproducen como texto; y en los 9 casos "por revisar" falta alguna línea.
Con 29 letreros no se llega a la meta de "más de 35 rutas" del issue SCRUM-173: varias fotos son de la
misma ruta, y muchos letreros comparten placas.

## 6. Modelo de datos propuesto (para Flyway)

Es una propuesta para discutir con Angélica; no está en el backlog todavía.

```sql
-- Letrero: una fila por placa visible en el parabrisas
route_sign (
  id, route_id,
  direction   -- SUBIENDO | BAJANDO | UNICO
  template    -- PLACA_ARCO | PLACA_RECT | TABLA_FRANJAS
  position    -- orden de la placa en el parabrisas
  source_url, verified_on
)

-- Cada línea de texto de la placa, con su color
route_sign_line (
  sign_id, position, text,
  bg_hex, fg_hex, font_key, rel_size
)

-- Puntos de referencia en orden de recorrido (lo que dice el letrero ≠ barrio oficial)
route_stop_ref (
  route_id, direction, position, label,
  barrio_id NULL,  -- se llena cruzando con el GeoJSON del POT
  lat, lon
)

-- Tarifa por tramo (Chinauta y veredas); la urbana es un solo tramo
fare (
  route_id, from_ref, to_ref, amount,
  decree, valid_from
)
```

`route.code` y `route.operator` quedan como columnas opcionales.

## 7. Horarios encontrados (con fecha; pueden estar desactualizados)

- Rurales, mayo de 2020 ([Informativo Colombia57][rural]): Fusa–Guavio–El Carmen 4:00–13:00;
  Fusa–Novillero unas 10 salidas entre 5:50 y 17:00; Fusa–Piamonte 8:00 / 11:00 / 14:00;
  Fusa–Viena 6:40 / 10:30 / 13:30.
- Camino Real – La Pampa, octubre de 2020: arrancó con 5 recorridos (6:05, 6:20, 6:30 y 17:10, 17:20).
- Según [Inventum 2014][inv], las rutas que van a la Terminal operan de 7 a. m. a 7 p. m.

## 8. Fuentes

[dec]: https://www.fusagasuga.gov.co/normatividad/decreto-no-16-de-2026
[inv]: https://revistas.uniminuto.edu/index.php/Inventum/article/view/877
[tiz22]: https://www.tizumbaonline.com/wp-content/uploads/2022/12/WhatsApp-Image-2022-12-30-at-6.44.59-AM.jpeg
[pampa]: https://www.facebook.com/TIZumbaONLine/posts/1453529904852025/
[sena]: https://blogcentrofusagasuga.blogspot.com/2020/01/rutas-de-transporte-publico-sector.html
[obs]: https://observatorio.alcaldiafusagasuga.gov.co/geovisores/
[rural]: https://www.facebook.com/elinformativocolombia57/posts/619891271940410/

- Alcaldía de Fusagasugá. *Decreto 16 del 5 de febrero de 2026* (tarifas de transporte 2026). [Enlace][dec]
- Buriticá, D.; Soto, R.; Perilla, O. (2014). *Programación de rutas para buses urbanos en el municipio
  de Fusagasugá a través de un algoritmo de aproximación*. Inventum 16, UNIMINUTO. [Enlace][inv]
- Tizumba Online (30-dic-2022). Foto de busetas urbanas con letreros. [Enlace][tiz22]
- Tizumba Online (27-oct-2020). *Nueva ruta de transporte unirá a La Pampa con Camino Real*. [Enlace][pampa]
- Blog Centro Agroecológico y Empresarial SENA Fusagasugá (ene-2020). *Rutas de transporte público
  sector Quebrajacho*. [Enlace][sena]
- Observatorio de la Alcaldía de Fusagasugá. *Geovisores — División político-administrativa*. [Enlace][obs]
- Informativo Colombia57 (17-may-2020). *Rutas habilitadas por Cootransfusa para el sector rural*. [Enlace][rural]
