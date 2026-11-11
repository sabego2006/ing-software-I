# Guion de demo — "Buscar ruta" para el comité (sustentación del 19-nov)

> Comprobado en PROD (https://fusaroute.vercel.app, backend en Render) el **2026-11-10 entre las 22:30 y las 23:50, hora de Bogotá**, con llamadas reales a `GET /api/routes/search` y el flujo completo en el navegador (Playwright, Chromium y WebKit). Todos los tiempos salieron con `etaSource: TRAFFIC`, es decir, cronometrados por Google con el tráfico de ese momento.
>
> **Repetir la noche anterior a la sustentación.** Dos cosas cambian solas: los minutos (Google mide el tráfico del momento) y, a veces, la ruta ganadora entre dos casi empatadas, porque cada búsqueda con Google guarda la velocidad observada y la búsqueda la usa para rankear desde la 5.ª muestra. Ya pasó: Indio → Universidad de Cundinamarca dio la ruta 13 en una corrida y la 14 en la siguiente.

## Antes de empezar

- Abrir el backend 2 minutos antes: Render gratis se duerme y el primer request tarda hasta ~60 s. Basta con abrir https://fusaroute.vercel.app/rutas.
- Para el par con aviso del Indio, la demo tiene que caer entre **11:30 y 14:00** o entre **16:30 y 19:00** (el aviso aparece desde 30 min antes de las franjas 12–14 y 17–19). Fuera de esas horas el mismo par sale sin aviso, y eso también es correcto.

## 10 pares que funcionan

Caminata = distancia en línea recta × 1,3, siempre "aprox.". Minutos = los de la corrida del 10-nov (cambian con el tráfico).

| # | Cómo se elige | Origen → Destino | Ruta que sale | Tiempo | Caminata (subir / bajar) | Aviso |
|---|---|---|---|---|---|---|
| 1 | Escribir "indio" y "termi" | Monumento El Indio → Terminal de Transporte | 14 · Centro - Galería - Terminal | 11–12 min | 31 m / 15 m | **Trancón del Indio** si se busca entre 11:30–14:00 o 16:30–19:00 (el tramo arranca dentro del círculo de 450 m) |
| 2 | Escribir | U. Hospital Éxito → Galería (Plaza de Mercado) | 14 · Centro - Galería - Terminal | 13–14 min | 7 m / 30 m | — |
| 3 | Escribir | Galería (Plaza de Mercado) → San Antonio | 20 · Centro - Carrera 9 - Galería | 9 min | 30 m / 141 m | — |
| 4 | Escribir | U. Hospital Éxito → Cedritos | 15 · Nariño Pekín - Sta. María de los Ángeles - Altos de Pekín | 11–12 min | 7 m / 233 m | — |
| 5 | Escribir | Santa Anita → Terminal de Transporte | 14 · Centro - Galería - Terminal | 7 min | 454 m / 15 m | — |
| 6 | **📍 Mi ubicación** (en la prueba: punto 4.3330, -74.3790, unos 300 m al occidente del Indio) | "Cerca de Monumento El Indio" → Terminal de Transporte | 14 · Centro - Galería - Terminal | 23 min | 287 m / 15 m | Mismo aviso del Indio en las franjas |
| 7 | **🗺️ Elegir en el mapa** (punto 4.3420, -74.3640, cerca de la Carrera 9) | "Cerca de Carrera 9" → U. Hospital Éxito | 4 · Hospital - Batallón - La Pampa - Llano Grande | 8 min | 24 m / 7 m | — |
| 8 | Escribir — **intermunicipal** | Potosí → Pasca | 8 · Pasca (letrero nuevo, blanco con letras vino tinto) | 27–28 min | 10 m / 98 m | — · Tabla de tarifas por punto: Alaska $3.550, Pasca $4.300 |
| 9 | Escribir — **intermunicipal** | Centro (Parque Principal) → Arbeláez | 7 · Arbeláez | 49–50 min | 152 m / 5 m | — · Tarifas $3.450 / $4.550 / $5.650 |
| 10 | Escribir — **"camina más"** | Academia Militar Pantano de Vargas → Monumento El Indio | 7 · Arbeláez, con **"Le toca caminar más de lo normal"** (`longWalk`) | 7 min | 1.554 m / 44 m | — |

Cierre sugerido para el par 1: tocar **"¡Ya me subí!"** (pasa a "✓ ¡Buen viaje!"), volver a Buscar y mostrar el atajo **"Volver a: Terminal de Transporte"** y **"Tus últimos viajes (1)"** con el letrero. Sin sesión se guarda en el navegador; con sesión, en la cuenta, y además queda la fila `BOARDED` en `search_events` (cuando el PR #89 del backend esté desplegado).

Para mostrar que los logs se guardan solos: en Supabase, `fusaroute.app_logs` (fila INFO de cada arranque) y `fusaroute.search_events` (una fila por búsqueda). Consultas listas en `docs/monitoring.md` del backend.

## 3 pares que NO funcionan (por si el profe los elige)

| Origen → Destino | Qué responde | Por qué, sin rodeos |
|---|---|---|
| Arbeláez → Centro (Parque Principal) | "No hay rutas disponibles…" y la ruta más cercana a cada punta (la de Arbeláez a 5 m del origen) | Cada ruta está cargada **en un solo sentido**, el de su letrero: de Fusagasugá hacia Arbeláez. La vuelta existe en la vida real, pero no está en la base, y la app nunca ofrece un recorrido al revés porque sería inventarlo. Lo mismo pasa con casi todos los viajes **hacia** el Centro desde una vereda o un municipio (p. ej. Bochica → Centro). |
| Bochica → Centro (Parque Principal) | 404 con la ruta más cercana (Palacios - Trinidad - Guavio, a 4 m del origen) | Mismo motivo: la ruta de Guavio está cargada saliendo de Fusagasugá, no entrando. Bochica, Alto Canecas, Boquerón y Arbeláez están entre los orígenes con más pares fallidos en `docs/calidad/cobertura-busqueda.md` del backend. |
| Centro (Parque Principal) → La Gran Colombia | **Sí responde**, pero con la buseta de **Arbeláez** ($3.450), no con una urbana ($2.600) | No es un error del cálculo sino del criterio: gana la de menor tiempo puerta a puerta y las intermunicipales se estiman a 30 km/h contra 15 km/h de las urbanas, así que en un trayecto corto dentro del casco urbano la intermunicipal "gana" aunque cueste más. Pasa también con Terminal → Indio (Arbeláez, 2 min) y Centro → Cedritos (Pasca). Explicarlo así; si el comité pregunta, la mejora sería preferir la urbana cuando las dos puntas están dentro del casco urbano. |

## Cobertura medida

`SearchCoverageIT` sobre `main` (135 lugares, 32 rutas con trazado): **77,6 %** de los 18.090 pares ordenados tiene ruta directa con caminata ≤ 800 m; **92,1 %** entre lugares urbanos (a ≤ 4,5 km del centro). La meta era ≥ 75 %.
