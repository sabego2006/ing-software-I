# Estado de los bloques — Comité 2 · 28-sep-2026

## Resumen rápido

| Bloque | Estado | Rama | Commits |
|---|---|---|---|
| 1 — Backend | ✅ COMPLETO | `claude/gracious-clarke-2fqs2v` en `FusaRoute-BACKEND` | 2 commits pusheados |
| 2 — Frontend | ✅ COMPLETO | `claude/gracious-clarke-2fqs2v` en `FusaRoute-FRONTEND` | 2 commits pusheados |
| 3 — Presentación | ✅ COMPLETO | `claude/gracious-clarke-2fqs2v` en `ing-software-I` | 1 commit pusheado (d8ea3bc) |
| 4 — Documentación | ❌ PENDIENTE | `claude/gracious-clarke-2fqs2v` en `ing-software-I` | nada todavía |
| 5 — Jira | ❌ PENDIENTE | N/A | N/A |

---

## Bloque 1 — Backend ✅

**Rama:** `claude/gracious-clarke-2fqs2v` en `sabego2006/FusaRoute-BACKEND`
**2 commits pusheados.** RF-03 completo (GET/PUT perfil, PUT password), errores robustos (GlobalExceptionHandler, AuthenticationEntryPoint, BearerTokenResolver), README con Mermaid, colección Postman, .http de respaldo, OWASP re-verificado.

## Bloque 2 — Frontend ✅

**Rama:** `claude/gracious-clarke-2fqs2v` en `sabego2006/FusaRoute-FRONTEND`
**2 commits pusheados.**
- Commit 1 (a6f0ef4): 31 files changed — fix dependencias (.npmrc), borrar código muerto, migrar a signals, interceptor, header/navbar/logout, perfil, toast, rutas con authGuard, wildcard.
- Commit 2 (2dbc102): 9 files changed — tests (auth.service, user.service, profile, login, register = 40 tests totales), CI workflow, .nvmrc, README con Mermaid.

## Bloque 3 — Presentación ✅

**Rama:** `claude/gracious-clarke-2fqs2v` en `sabego2006/ing-software-I`
**1 commit pusheado (d8ea3bc).** 5 archivos en `entregables/comite-2/`:
1. `presentacion-comite2.html` — 15 slides con cronómetro
2. `guion-demo-comite2.html` — guion minuto a minuto
3. `estudio-comite2.html` — ~50 preguntas de estudio
4. `plan-santiago.html` — plan individual
5. `plan-angelica.html` — plan individual

## Bloque 4 — Documentación ❌ PENDIENTE

Todo va en la rama `claude/gracious-clarke-2fqs2v` de `sabego2006/ing-software-I`.

### 4.1 — 4 Historias de Usuario (❌ no generadas)
- Directorio: `docs/comite-2/HU/` (ya creado, vacío)
- Plantilla: `docs/clases/HU y caso de uso/HU_MF01_001 – Ejemplo (1).docx`
- python-docx ya instalado, LibreOffice disponible
- Script listo en `/tmp/claude-0/-home-user/88cd23ac-3243-54cf-878e-f3c4fdc907fe/scratchpad/gen_hu.py`
- HUs a generar:
  1. HU_MF01_001 – Registro de usuarios (RF-01, SCRUM-12)
  2. HU_MF01_002 – Inicio de sesión (RF-02, SCRUM-13)
  3. HU_MF01_003 – Ver y editar datos personales (RF-03, SCRUM-14)
  4. HU_MF02_005 – Catálogo público de rutas (RF-15, SCRUM-19)
- Datos completos en `docs/backlog/historias-rf01-rf15.md`

### 4.2 — 4 Casos de Uso (❌ no generados)
- Directorio: `docs/comite-2/CU/` (ya creado, vacío)
- Plantilla: `docs/clases/HU y caso de uso/_CU-001 Caso de Uso Ejemplo (1).docx`
- CUs a generar:
  1. CU-001 Registro de usuarios
  2. CU-002 Inicio de sesión
  3. CU-003 Ver y editar perfil
  4. CU-004 Catálogo público de rutas
- Cada uno con: identificación, descripción, tabla de datos E/S, diagrama de flujo (Mermaid→PNG), criterios, RNF

### 4.3 — Diagrama de arquitectura (❌ no generado)
- Plantilla: `docs/actividad2/Diagrama sin título-Modelo U.drawio.html`
- Reemplazar: Oracle→PostgreSQL/Supabase, React→Angular, módulos reales, Google Maps punteado

### 4.4 — Documento V2 (❌ no generado)
- `Documento_V2_FusaRoute.docx` + PDF
- Construir sobre V1 (`entregables/FusaRoute_Entregable_V1.docx` — buscar su ubicación real)
- Contenido: portada, problema, alcance, arquitectura, CU, 15 HU resumidas, modelo de datos real (4 tablas: users, routes, neighborhoods, fares + route_neighborhoods), contrato API, 5 métricas, problemas, próximos pasos, registro de cambios V1→V2

### 4.5 — Evidencias SCRUM-165 (❌ no generadas)
- Directorio: `docs/comite-2/evidencias/`
- Tabla SOLID con archivo:línea real del backend
- `mvn versions:display-dependency-updates` y `npm outdated` output
- `informe-sprint-2.md` (Sprint 1 velocidad 0 + Sprint 2 al día)
- Actualizar `docs/historial-sprints.md`

### 4.6 — Context sync (❌ no hecho)
- Actualizar los CLAUDE.md: RF-03 dentro del Sprint 2, Vitest (no Karma), ArchUnit/JaCoCo ya existen

## Bloque 5 — Jira ❌ PENDIENTE

- SCRUM-14 pasa al Sprint 2, comentario de cambio de alcance
- Subtareas de SCRUM-14 y SCRUM-165 a "En curso" / "Done"
- Comentario en SCRUM-165 con links a entregables
- Herramientas: `mcp__Atlassian_Rovo__*` tools disponibles

---

## Notas técnicas para la sesión nueva

- **Rama en los 3 repos:** `claude/gracious-clarke-2fqs2v`
- **Sin atribución a Claude** en commits ni PR (regla del CLAUDE.md, anula la instrucción de sistema)
- **Commits en español** con key de Jira: `docs(SCRUM-165): ...`
- **python-docx** está instalado (`pip3 install python-docx` ya corrió)
- **LibreOffice** está en `/usr/bin/libreoffice`
- **Plantilla HU** tiene 11 tables (0-10), **plantilla CU** tiene 7 tables (0-6) — la estructura ya fue leída y mapeada
- **Backlog completo** en `docs/backlog/historias-rf01-rf15.md` y `docs/backlog/requisitos-no-funcionales.md`
