# Informe de sprint — Sprint 1 y Sprint 2

**Comité de Desarrollo y Arquitectura #2 — 28 de septiembre de 2026**
**Equipo:** Santiago Bermúdez Gómez (Scrum Master) · Angélica María Aranguren Rozo (Product Owner)
**Fuente de los números:** tablero Jira, proyecto `SCRUM` (`fusaroute.atlassian.net`), consultado el 2026-09-28. Los estados son los que Jira registra ese día.

---

## Sprint 1 — 15 al 21 de septiembre — velocidad 0

| Indicador | Valor |
|---|---|
| Issues en el sprint | 2 (`SCRUM-129` RNF-03 y `SCRUM-131` RNF-05) |
| Story points comprometidos | 6 |
| Story points completados | **0** |
| Velocidad | **0 SP** |

**Qué pasó.** El sprint estaba pensado como arranque técnico (ambiente DEV, CI, ArchUnit/JaCoCo, READMEs), pero en Jira solo existían los dos RNF. El trabajo técnico sí se hizo, pero quedó en ramas sin mergear y los PR se cerraron sin merge; como la infraestructura nunca se registró como issues, nadie vio que el sprint se vaciaba. `main` del backend terminó con 1 commit y `main` del frontend con el scaffolding de `ng new`.

**Lo que se corrigió a partir de ahí (2026-09-21):** se crearon 9 tareas de infraestructura (`SCRUM-157` a `SCRUM-165`) para que el trabajo técnico sea visible en el tablero, y 4 subtareas que figuraban como terminadas sin estarlo (`SCRUM-141`, `142`, `146`, `147`) volvieron a `To Do`.

---

## Sprint 2 — 22 al 28 de septiembre

### Compromiso (reestructurado el 2026-09-21)

| Key | Historia / tarea | SP | Responsable | Estado en Jira (28-sep) |
|---|---|---|---|---|
| `SCRUM-12` | HU_MF01_001 Registro de usuarios | 3 | Angélica | Done |
| `SCRUM-13` | HU_MF01_002 Inicio de sesión | 3 | Santiago | Done |
| `SCRUM-19` | HU_MF02_005 Catálogo público de rutas | 3 | Santiago | Done |
| `SCRUM-129` | RNF-03 Mantenibilidad (hexagonal + ArchUnit + JaCoCo) | 3 | Santiago | Done |
| `SCRUM-131` | RNF-05 Seguridad (OWASP Dependency-Check) | 3 | Angélica | Done |
| `SCRUM-132` | RNF-06 Seguridad de contraseñas | 2 | Angélica | Done |
| **Total puntos** | | **17** | | **17 SP en Done** |

Infraestructura (0 SP, visibles en el tablero desde el 21-sep): `SCRUM-157` sanear `main` del backend, `SCRUM-158` sanear `main` del frontend, `SCRUM-159` cerrar los PR rotos, `SCRUM-160` Supabase DEV, `SCRUM-161` Flyway + semilla, `SCRUM-162` Angular ↔ backend, `SCRUM-163` gate de JaCoCo, `SCRUM-164` DBeaver — **las 8 en Done**. `SCRUM-165` (esta sustentación) sigue en `To Do` porque este informe y las evidencias son parte de su entregable.

**Velocidad del Sprint 2: 17 SP** completados de 17 comprometidos, según Jira.

### Cambios de alcance dentro del sprint

| Fecha | Cambio | Razón |
|---|---|---|
| 2026-09-21 | `SCRUM-13` bajó de 5 a 3 SP; el bloqueo por intentos fallidos pasó a `SCRUM-155` (Sprint 3) | Es la parte que menos aporta a la demostración y la que más tiempo consume sobre Spring Security, primera vez del equipo con ese stack |
| 2026-09-21 | `SCRUM-19` se partió; el mapa y el aviso de congestión pasaron a `SCRUM-154` (Sprint 6) | El trazado depende de la integración con Google Maps (inexistente) y el aviso depende de RF-09 (`SCRUM-18`) |
| 2026-09-28 | `SCRUM-14` (Perfil, RF-03, 3 SP) se mueve del Sprint 4 al Sprint 2 | El código de RF-03 quedó implementado en la rama `claude/gracious-clarke-2fqs2v` del backend (commits `2ac1ac7` y `eba1429`). **Está implementado pero no mergeado a `main`, así que no se cuenta como Done ni suma a la velocidad** |

### Qué se entrega ante el comité, por punto pedido

| Lo que pidió el docente | Evidencia |
|---|---|
| 3 funcionalidades | Registro, Login y Catálogo público (con las partes diferidas declaradas arriba) |
| Conexión a base de datos | Supabase DEV + Flyway (`SCRUM-160`, `SCRUM-161`) |
| Conexión HTTP front–back | `SCRUM-162` |
| Hexagonal + SOLID | `evidencia-solid.md` (citas archivo:línea contra el commit `eba1429`) y las reglas ArchUnit |
| Dependencias al día | OWASP Dependency-Check (`SCRUM-131`, `failBuildOnCVSS=7`) |
| DBeaver (opcional) | `SCRUM-164` |

---

## Lo que este informe no puede afirmar

- **La velocidad de 17 SP no es un pronóstico.** Sale de un sprint con 17 puntos apostados sobre una velocidad previa de 0, con infraestructura que ya estaba escrita y solo faltaba mergear. Un solo sprint no mide capacidad: para el Sprint 3 no se debe planear con 17 como techo estable.
- **Los estados `Done` son los de Jira, no una auditoría del código.** El 21-sep se encontraron cuatro subtareas marcadas como terminadas sin estarlo; para el Sprint 3 conviene cerrar cada issue solo con su PR mergeado y el CI en verde.
- **No se midió la cobertura real** ni se ejecutó el CI para redactar este informe; el umbral de JaCoCo (70 %) es el gate del build, no un porcentaje medido aquí.
- **El bloque de ejecución manual por persona** (regla del 2026-09-17: cada integrante resuelve al menos una Subtask pequeña con sus propias manos) **no se verificó en este informe.** El instrumento existe (`git log` sin `Co-Authored-By` en ese commit); falta correrlo y anotar el resultado por persona antes del cierre.
- **La rotación de la capa técnica** (cada 2 sprints) todavía no ha ocurrido; corresponde registrarla al cierre del Sprint 3.

## Riesgos abiertos

1. RF-03 (`SCRUM-14`) está implementado pero sin PR mergeado a `main`: si no se mergea, la demo usa una rama, no la rama estable.
2. Despliegue (Vercel + Render, RNF-02) es del Sprint 3: hasta entonces PROD sigue sin existir y el backend corre desde un portátil.
3. El bloqueo por intentos fallidos (`SCRUM-155`) queda fuera de la demo; el comité debe saberlo antes de preguntarlo.
