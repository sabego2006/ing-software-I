# Historial de sprints y del tablero de Jira

> Extraído del `CLAUDE.md` el 2026-09-22 para que ese archivo no crezca sin límite.
> Aquí va todo lo **ya cerrado**: sprints terminados, cargas a Jira y reestructuraciones del tablero.
> Lo vigente y lo que viene sigue en el `CLAUDE.md`, sección "Calendario".

## Calendario (versión completa, tal como estaba en CLAUDE.md)

- **09 → 14 de septiembre de 2026:** semana de preparación. No es un sprint y por tanto no genera informe.
- **Sprint 1:** martes 15-sep → lunes 21-sep. Arranque técnico (ambiente DEV, CI, ArchUnit/JaCoCo, READMEs), sin puntos de historia: es infraestructura.
  **Cerrado con velocidad 0.** Solo contenía dos issues en Jira (RNF-03 y RNF-05) y ninguno se completó. El trabajo técnico sí se hizo, pero quedó en ramas sin mergear —los PR se cerraron sin merge— y la infraestructura (ambiente DEV, CI, READMEs) nunca se registró como issues, así que nadie vio el sprint vaciarse. Va tal cual en el informe de sprint: registrarlo suma ante el comité, maquillarlo resta mucho más.
- **Sprint 2:** martes 22-sep → lunes 28-sep. **Es el sprint del comité** (lunes 28, 2:00 pm). Entrega las 3 funcionalidades pedidas por el docente —Registro (`SCRUM-12`), Login (`SCRUM-13`) y Catálogo público de rutas (`SCRUM-19`)— más la conexión a base de datos, la conexión HTTP front-back, y RNF-03/RNF-05/RNF-06. Incluye 9 tareas de infraestructura (`SCRUM-157`..`SCRUM-165`) que antes no existían en el tablero. **Los ambientes PRE/PROD se corrieron al Sprint 3.** Como el sprint cierra el mismo día del comité, el código se congela el domingo 27 en la noche.
- **Sprint 3:** martes 29-sep → lunes 5-oct. Despliegue real (RNF-02 / `SCRUM-128`): frontend en Vercel, backend en Render, y los proyectos Supabase de PRE y PROD.
- Sprints semanales de martes a lunes, de modo que a cada sustentación quincenal lleguen dos sprints cerrados.
- **La fecha del próximo comité no se conoce y no se deduce: se le pregunta al docente.**


## Notas de tablero

- El backlog de historias de usuario (RF-01 a RF-15, con criterios de aceptación) está en `docs/backlog/historias-rf01-rf15.md`. Los requisitos no funcionales (RNF-01 a RNF-07) están en `docs/backlog/requisitos-no-funcionales.md`. **Las 15 HU + 7 RNF quedaron aprobados por Santiago y Angélica el 2026-09-15** (backlog completo, incluye RF-15 nuevo y el criterio de última milla en RF-04). **Cargado a Jira el 2026-09-16**: 5 épicas, 15 historias con sus Subtasks de flujo y los 7 RNF como Task — keys `SCRUM-7` a `SCRUM-152`, detalle completo en `docs/backlog/historias-rf01-rf15.md` y `docs/guia-jira-fusaroute.md`. **Sprint Planning cerrado el 2026-09-17** directamente en Jira (Etapa 4 del plan maestro): 9 sprints semanales, Sprint + Story Points + responsable en las 16 historias/RNF, descripción + responsable en las ~110 subtasks; incluye la Story `SCRUM-153` (última milla/offline, partida de la HU_MF02_001 original por sobredimensionada). Detalle completo del reparto y del rebalance de carga en el adendo del 2026-09-17 de `~/.claude/plans/dreamy-exploring-unicorn.md`.
- **Reestructuración del 2026-09-21 (preparación del comité del 28-sep).** El Sprint 1 cerró con velocidad 0 y el Sprint 2 se rearmó para responder a lo que pidió el docente. Cambios en Jira: `SCRUM-19` (catálogo) subió del Sprint 6 al 2 y `SCRUM-129`/`SCRUM-131` volvieron del Sprint 10 al 2; `SCRUM-127` (RNF-01) bajó al Sprint 4 porque mide un endpoint que todavía no existe. Se partieron dos historias — `SCRUM-154` (mapa y congestión del catálogo, Sprint 6) y `SCRUM-155` (bloqueo por intentos fallidos, Sprint 3) — y `SCRUM-13` bajó de 5 a 3 puntos. Se crearon 9 tareas de infraestructura (`SCRUM-157`..`SCRUM-165`) que cubren el hueco que dejó vacío al Sprint 1. Se corrigieron 4 subtareas que figuraban como Done sin estarlo (`SCRUM-141`, `142`, `146`, `147`). Plan completo en `~/.claude/plans/pregunta-si-tienes-alguna-fuzzy-hopcroft.md`.
