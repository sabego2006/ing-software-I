# Estado de los bloques — Comité 2 · 28-sep-2026

Actualizado el 2026-09-28 tras cerrar los bloques 4 y 5.

## Resumen rápido

| Bloque | Estado | Rama |
|---|---|---|
| 1 — Backend | Completo | `claude/gracious-clarke-2fqs2v` en `FusaRoute-BACKEND` (sin PR abierto ni mergeado) |
| 2 — Frontend | Completo | `claude/gracious-clarke-2fqs2v` en `FusaRoute-FRONTEND` (sin PR abierto ni mergeado) |
| 3 — Presentación | Completo | `claude/gracious-clarke-2fqs2v` en `ing-software-I` |
| 4 — Documentación | Completo | `claude/gracious-clarke-2fqs2v` en los 3 repos |
| 5 — Jira | Completo salvo una transición (SCRUM-45) | N/A |

## Bloque 1 — Backend

RF-03 completo (GET/PUT perfil, PUT password), errores robustos (GlobalExceptionHandler, AuthenticationEntryPoint, BearerTokenResolver), README con Mermaid, colección Postman, `.http` de respaldo, OWASP re-verificado. Commits `2ac1ac7` y `eba1429`.

## Bloque 2 — Frontend

Commits `a6f0ef4` y `2dbc102`: dependencias (`.npmrc`), signals, interceptor, header y logout, perfil, toast, rutas con `authGuard`, tests (40), CI y README con Mermaid.

## Bloque 3 — Presentación

En `entregables/comite-2/`: presentación de 15 slides con cronómetro, guion de demo, estudio (~50 preguntas) y los dos planes individuales.

## Bloque 4 — Documentación

| Entregable | Dónde |
|---|---|
| 4 historias de usuario (docx + pdf, plantilla del docente) | `docs/comite-2/HU/` |
| 4 casos de uso con diagrama de caso de uso y de flujo (docx + pdf) | `docs/comite-2/CU/` |
| Diagrama de arquitectura y diagrama ER (PNG) | `docs/comite-2/evidencias/` |
| Documento V2 (docx + pdf) | `docs/comite-2/Documento_V2_FusaRoute.*` |
| Tabla SOLID con archivo:línea del commit `eba1429` | `evidencias/evidencia-solid.md` |
| Dependencias (`mvn versions`, `npm outdated`, `npm audit`) | `evidencias/evidencia-dependencias.md` |
| Informe de los sprints 1 y 2 | `evidencias/informe-sprint-2.md` |
| Sincronización de los `CLAUDE.md` (raíz, backend, frontend) y README del backend | commits `e4b277f` (raíz), `32ea329` (backend), `60952f6` (frontend) |

Notas de lo que difiere del plan original:

- El diagrama de arquitectura es editable en draw.io (`evidencias/diagrama-arquitectura.drawio.html` y `.drawio`), hecho sobre la plantilla del curso; además hay un PNG de apoyo.
- El Documento V1 (16-sep) está en `entregables/FusaRoute_Entregable_V1.docx`; el V2 lo corrige y su registro de cambios lista las 13 diferencias V1 → V2.
- `docs/historial-sprints.md` ya existe en `main` (lo agregó el equipo); `informe-sprint-2.md` lo complementa con el detalle del Sprint 1 y 2.
- El diagrama de flujo de los CU y los PDF se generaron con LibreOffice; un salto de página parte alguna tabla.

## Bloque 5 — Jira

- `SCRUM-14` movida del Sprint 4 al Sprint 2, con comentario de cambio de alcance; en In Progress porque no está mergeada.
- `SCRUM-41` a `SCRUM-46` (las 6 subtareas del perfil) en In Progress.
- `SCRUM-165` en In Progress, con comentario y enlaces a los entregables.
- Ninguna se marcó Done: la regla es cerrar solo con PR mergeado y CI en verde.

## Pendiente (decisiones del equipo)

- Abrir y mergear los PR de RF-03 en backend y frontend (nadie los ha abierto; no se mergea sin revisión del otro integrante).
- Confirmar la prioridad Alta de RF-15 (la asignó el V2).
- Nombre del puerto de tiempos de viaje: la HU dice `TravelTimeProvider` y el `CLAUDE.md` del backend dice `TravelTimePort`. No se decidió.
- Cita exacta de la fuente DANE (población ~285.000).
- Conciliar 14 hallazgos (texto de RNF-05) contra 15 CVE en `suppression.xml`.
- Aplicar parches pendientes (ArchUnit 1.5.1, JaCoCo 0.8.15) y decidir los saltos mayores con tarjeta propia.
