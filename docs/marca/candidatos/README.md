# Candidatos de isotipo — FusaRoute

Cuatro candidatos dibujados a mano en SVG sobre la grilla de 64 del sistema
(trazo negro de 3, sombra dura de 3, índigo `#4F46E5`, lima `#D9F99D`).
Ninguno es imagen generada por IA: un isotipo tiene que ser vectorial para
servir de favicon a 16 px, de ícono de app y de marca en impresión.

| Carpeta | Candidato | Idea |
|---|---|---|
| `A-greca-ruta/` | A · Greca-Ruta | Dos escalones chibchas = la ruta; las dos paradas son origen y destino. |
| `B-buseta/` | B · Buseta | La buseta de frente: letrero lima con greca, parabrisas y faros. **Recomendado.** |
| `C-caja-fr/` | C · Caja | Sin isotipo: el wordmark en caja; el favicon es el monograma `FR`. |
| `D-trazado/` | D · Trazado | La greca dentro de una placa lima, como una señal de parada. |

Cada carpeta trae las cuatro variantes que el sistema ya exige:

- `isotipo.svg` — principal, con sombra dura. Sobre `fondo`, `superficie` o `lima`.
- `isotipo-plano.svg` — sin sombra. Obligatorio por debajo de 32 px (favicon, chips, barras).
- `isotipo-una-tinta.svg` — negro, para impresión a una tinta y sellos.
- `isotipo-fondo-oscuro.svg` — contorno `#F4F4F5`, sombra lima.
- `icono-app.svg` — 72×72 sobre placa lima redondeada, para la PWA y redes.

`contacto-candidatos.png` es la hoja de contacto: cada candidato a 112 / 48 / 24 / 16 px,
en fondo oscuro, como ícono, a una tinta y en lockup con el wordmark.

Cuando se elija uno, lo que hay que tocar es:

1. `design-system.json` + `assets/Logos/` del sistema de marca (artifact FusaRoute).
2. `FusaRoute-FRONTEND/public/icons/` y `favicon.ico`.
3. El `<symbol id="fr-iso">` de `entregables/comite-2/presentacion-comite2.html`.
