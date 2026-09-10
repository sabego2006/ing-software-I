# Ingeniería de Software I — Universidad de Cundinamarca

Carpeta de la asignatura **Ingeniería de Software I** (Ingeniería de Sistemas y Computación, 5.º semestre, sede Fusagasugá).

- **Docente:** Ing. Luiferney Ortiz Parra
- **Semestre:** 2026-2 (agosto de 2026)
- **Equipo:** Santiago Bermúdez Gómez · Angélica María Aranguren Rozo

## Cómo funciona el curso

El curso se dicta bajo el modelo de una **empresa de desarrollo de software simulada**. No basta con que el código funcione: hay que **sustentar las decisiones técnicas** y defender el diseño.

**Comité de Desarrollo y Arquitectura** — es el mecanismo central de evaluación. Funciona como espacio de revisión, toma de decisiones, aprobación de avances y análisis de riesgos, con el docente cumpliendo un rol de comité. Cada avance del proyecto se aprueba ahí antes de seguir.

> **Nota sobre el comité.** El primer comité se llevó a cabo el **martes 25 de agosto de 2026**. Las decisiones tomadas en ese espacio son **preliminares, no definitivas**: lo que aquí figura como "vigente" puede moverse en la siguiente sustentación.
>
> **Las fechas de comité son irregulares.** Aunque el docente habla de cadencia quincenal, en la práctica no se cumple un patrón fijo y no se pueden predecir. **Hay que preguntarle al docente cuándo es el siguiente**, y nunca planear una entrega sobre una fecha supuesta.

- **Cadencia:** sustentación quincenal (por sprint corto).
- **Toda decisión técnica debe poder justificarse ante el comité**, incluidas las que cambien respecto a entregas previas. Cambiar de opinión con argumentos suma; cambiar sin registrar el porqué resta.

**Documento de aprobación ante el comité** — estructura que el docente pide (ver `docs/clases/Clase 3 IS.pptx`):

1. Descripción del problema
2. Alcance
3. Requisitos funcionales
4. Requisitos no funcionales
5. Atributos de calidad
6. Métricas definidas

## Exigencias del docente que atraviesan todo el proyecto

Estas tres no son opcionales y aplican a cualquier código o documento que se produzca:

1. **Arquitectura hexagonal** (puertos y adaptadores) en el backend.
2. **Calidad medible, alineada a ISO/IEC 25000 (SQuaRE) / 25010.** El principio del curso es *"la calidad se diseña, no aparece sola"* y *"calidad = métricas"*. Ningún atributo de calidad se enuncia sin un número que lo verifique.
3. **La aplicación debe tener alcance real y no quedar obsoleta** — se diseña para crecer, no para pasar el semestre.

Métricas de referencia (comprometidas en la v3 de la Actividad 3, 2026-08-24). Cada una con instrumento ejecutable:

| Atributo (ISO/IEC 25010) | Métrica v3 | Instrumento |
|---|---|---|
| Rendimiento (eficiencia de desempeño) | p95 < 8 s end-to-end en `/api/routes/search` sobre 4G (cliente → backend → Google Maps → render) + LCP < 2.5 s en Lighthouse mobile Slow 4G. Caché de 5 min por par origen-destino. | Spring Boot Actuator + Micrometer (percentil 95) + Lighthouse en CI |
| Disponibilidad (fiabilidad) | ≥ 95 % uptime mensual del backend (lun–vie 7:00–21:00), RTO < 1 h, RPO < 24 h | UptimeRobot + backup diario de PostgreSQL |
| Mantenibilidad | 0 violaciones hexagonales en CI + ≥ 70 % cobertura en `domain/` | ArchUnit en CI + reporte JaCoCo con umbral bloqueante |
| Usabilidad | ≤ 4 acciones + tasa de éxito ≥ 80 % al primer intento | Prueba con ≥ 5 usuarios externos al equipo |
| Seguridad | 0 vulns altas o críticas reportadas por herramientas en la entrega | OWASP Dependency-Check + análisis estático en CI |

> **Nota:** la tabla de "métricas de referencia" original del docente (con < 2 s, 99 %, "0 críticas" sin proceso) fue adoptada como punto de partida pero se rediseñó tras el grill del 2026-08-24. Las razones están en `entregables/fusaroute-actividad3-resumen-cambios.html` y en la memoria `feedback_critica_metricas.md`. Los números nuevos son los que se defienden ante el comité.

## Proyecto Integrador: FusaRoute

Sistema de información de transporte público para Fusagasugá y la región del Sumapaz. Resuelve la desorientación de habitantes y turistas: hay **más de 20 rutas urbanas** de busetas sin información pública clara, y ni Google Maps las tiene registradas. Se puede llegar a un mismo destino por varias rutas, y sin información la gente pierde tiempo y dinero. Justificación respaldada por una encuesta propia del equipo (2025) y población regional estimada en ~285.000 habitantes (DANE).

**Repositorios** — son **tres**, separados, cada uno con su propio `CLAUDE.md`:

| Repo | Remoto | Ubicación local |
|---|---|---|
| Material del curso (esta carpeta) | `sabego2006/ing-software-I` | `.../5 SEMESTRE/INGENIERIA SOFTWARE I/` (dentro de OneDrive) |
| Backend | `sabego2006/FusaRoute-BACKEND` | `C:/Users/Santiago/dev/FusaRoute/FusaRoute-BACKEND/` |
| Frontend | `sabego2006/FusaRoute-FRONTEND` | `C:/Users/Santiago/dev/FusaRoute/FusaRoute-FRONTEND/` |

**Esta carpeta madre sí es un repositorio git** (`sabego2006/ing-software-I`). Solo aloja documentación: material de clase y entregables. Aquí **no** se desarrolla código de FusaRoute.

**Los repos de FusaRoute viven fuera de OneDrive**, en `C:/Users/Santiago/dev/FusaRoute/`. La razón es concreta: Angular genera decenas de miles de archivos en `node_modules` y OneDrive intenta sincronizarlos uno por uno, lo que provoca bloqueos de archivo y builds corruptos. No volver a clonarlos dentro de OneDrive.

### Alcance de este semestre

Comprometido con el docente en la Actividad 3 (`docs/actividad3/actividad 3 ing soft_APA.docx`):

- Registro e inicio de sesión de **Usuario Final** (nombre, correo, contraseña); ver y editar sus datos.
- Búsqueda de ruta: el usuario marca origen y destino, el sistema simula cada ruta posible en Google Maps y devuelve la de menor tiempo estimado.
- Visualización de **barrios/comunas por los que pasa la ruta** y **costo del pasaje**.
- **Historial de búsquedas** recientes del usuario.
- **Caja de comentarios**: el usuario deja sugerencias, el administrador las lee y responde.
- **Aviso de trancón / hora pico**: avisar si el trayecto suele estar congestionado a la hora de la consulta. El usuario puede marcar un **destino favorito** (RF-10, redefinido en v3) que se pre-carga al inicio de la búsqueda.
- **Modo offline por GeoJSON** (RNF-01.b, redefinido en v4): la app trae el trazado GeoJSON de las rutas (dato propio del backend). Sin internet, calcula la mejor ruta por **distancia geométrica** sobre esos GeoJSON. No calcula tiempo de llegada, ni trancones, ni ruta más rápida en tiempo real — esos requieren Google Maps en línea. Con internet, hace la simulación en Google Maps de siempre.
- **Administrador**: CRUD de rutas (altas, consultas, modificaciones, suspensiones temporales — frecuentes en días festivos o cívicos), notificación automática a los usuarios que tengan la ruta como favorita cuando se suspende (RF-12, v3) y métricas de uso de la app.

**Prioridad geográfica (actualizada, Actividad 3 v2):** el modelo de datos soporta varios municipios desde el diseño. Alcance geográfico comprometido este semestre: rutas urbanas de **Fusagasugá**, la ruta a **Chinauta** (corregimiento de Fusagasugá) y las rutas intermunicipales **Fusagasugá↔Pasca** y **Fusagasugá↔Arbeláez** — Pasca y Arbeláez no tienen rutas urbanas propias registrables, solo llegan a Fusagasugá por ruta intermunicipal. Regla de frontera: **toda ruta incluida debe tocar Fusagasugá**. **Silvania queda fuera** de este semestre (se había mencionado en el borrador de la Actividad 3 junto con Arbeláez; se corrigió por ser menos realista con la primera vez del equipo integrando mapas).

### Fuera de alcance (declarado)

- **GPS en tiempo real de las busetas** — descartado explícitamente por riesgo de alcance.
- **Rutas intermunicipales que no toquen Fusagasugá, y el resto del Sumapaz** (Silvania, Granada, Tibacuy, Venecia, etc.) — visión de fase avanzada (próximo semestre). Reemplaza la formulación anterior ("todo el Sumapaz"), ya ajustada a la frontera Fusagasugá-céntrica de arriba.
- Pagos en línea y notificaciones push.

### Suposiciones y riesgos registrados

- Se supone que el usuario tiene celular con internet.
- Se supone que las rutas no cambian drásticamente de un día para otro.
- **Riesgo de información:** puede ser difícil conseguir los mapas oficiales de las empresas de transporte; posiblemente haya que trazar las rutas a mano.
- **Riesgo técnico:** es la primera vez del equipo integrando mapas en una aplicación web.

## Modo de trabajo en documentos y métricas (realismo)

Cualquier número que aparezca en un entregable — métrica de calidad, porcentaje de cobertura, tiempo de respuesta, disponibilidad, RTO/RPO, tamaño de golden set, frecuencia de backup — **debe pasar por un filtro de realismo antes de escribirse**. El equipo se compromete a:

- **No prometer lo que no se puede medir.** Si no hay herramienta, comando o test de usuario que produzca el número, la métrica no se escribe (o se redacta de nuevo).
- **Acompañar toda métrica de su instrumento de medición.** Toda tabla de "atributo → métrica" tiene una tercera columna con el instrumento concreto (ej. *UptimeRobot, ArchUnit en CI, Lighthouse en CI, OWASP Dependency-Check, test de integración con X usuarios*).
- **Bajar la vara antes que prometer de más.** Si el plan de hosting o la dedicación real del equipo no sostiene un objetivo, se ajusta el número y se documenta el porqué. Subir el listón sin evidencia resta ante el comité.
- **Etiquetar explícitamente lo aspiracional.** Si una métrica queda como meta futura y no como compromiso del semestre, se marca como *"ASPIRACIONAL — no comprometida"* en la misma línea.
- **Una métrica por atributo ISO 25010 nombrado por el docente.** No se multiplican métricas redundantes. Si dos miden lo mismo, se fusiona o se elimina.
- **Toda decisión de cambio queda registrada.** Si un RF/RNF/métrica cambia entre versiones (v2 → v3), el cambio y su razón deben aparecer en el documento o en la memoria del proyecto.

**Referencia del grill interno del 2026-08-24:** el equipo revisó las 8 métricas de la v2 y concluyó que 7 estaban mal o medianamente definidas y 1 era redundante. La v3 del documento de la Actividad 3 quedó con **5 métricas**, una por atributo ISO 25010, cada una con instrumento ejecutable. El resumen visual está en `entregables/fusaroute-actividad3-resumen-cambios.html`.

## Decisiones de arquitectura vigentes

| Decisión | Estado |
|---|---|
| Backend: Java + Spring Boot, arquitectura hexagonal | Vigente |
| Frontend: Angular + TypeScript (Angular CLI) | Vigente — cambió en v4 (antes React + Vite) |
| Base de datos: PostgreSQL alojado en Supabase | Vigente |
| **Supabase se usa solo como PostgreSQL administrado** — no Auth, no Storage, no Realtime | Vigente |
| **Autenticación: Spring Security + JWT, propiedad del backend** | Vigente — cambió respecto al borrador inicial |
| **Cálculo de la ruta por simulación en Google Maps** (no banco estático) + caché de 5 min por par origen-destino | Vigente — cambió en v4 (antes: comparar catálogo estático) |
| **Modo offline por GeoJSON** (rutas pre-trazadas como polilíneas, cálculo por distancia geométrica) | Vigente — cambió en v4 (antes: rutas cacheadas de últimas consultas) |

> **Cambio a sustentar ante el comité:** el borrador inicial de la Actividad 3 justificaba Supabase en parte por su módulo de login listo para usar. Se decidió programar autenticación y registro en el backend con Spring Security + JWT. Razones: el docente exige que ambos integrantes aprendan todo el stack; mantiene el dominio desacoplado de un proveedor externo (coherente con hexagonal); y da material real que defender en calidad y seguridad. El documento ya refleja esta decisión.

## Enfoque metodológico y roles

Decidido en el grilling del 2026-09-09 y sustentado en `docs/metodologia/enfoque-metodologico.md`, que es el entregable calificable de `ACTIVIDAD.pdf`.

**Enfoque: iterativo–incremental, con Scrum como marco de trabajo.** No son dos cosas en competencia: el enfoque dice *cómo crece el producto* (por incrementos demostrables, cada uno usable de punta a punta), y Scrum dice *cómo se organiza el equipo para producirlos*. La base tradicional es de linaje RUP —arquitectura definida temprano, que es justamente la hexagonal ya comprometida— y la evolución hacia ágil se justifica por incertidumbre real: es la primera vez del equipo con mapas, con Spring Boot y con Angular, y el modo offline y las tarifas ya se redefinieron dos veces.

### Roles: dos capas, con RACI

El docente exige tres cosas a la vez —roles Scrum, cinco responsables técnicos (slide 9 de `docs/clases/Clase5 IS.pptx`), y participación equitativa de ambos—, así que se declaran dos capas explícitas:

| Persona | Capa de proceso (Scrum) | Capa técnica (docente) |
|---|---|---|
| **Angélica** | Product Owner | Responsable de Frontend · Responsable de Documentación |
| **Santiago** | Scrum Master | Líder Técnico · Responsable de Backend |
| **Ambos** | Development Team | Responsable de Pruebas (compartido) |

**"Responsable" significa quien responde ante el comité y revisa los PR de esa área, no quien la programa solo.** Ambos programan frontend y backend en todos los sprints, que es lo que el docente exige. La capa técnica **rota cada 2 sprints** y la rotación queda registrada en el informe de sprint — sin eso, el organigrama es de mentira y el comité lo nota.

### Eventos de Scrum adoptados

| Cuándo | Evento | De dónde sale el espacio |
|---|---|---|
| **Martes 18:00** | Sprint Planning | al salir de la clase de 16–18 |
| **Jueves 13:00** | Sesión de pareja (1 h) | al salir de la clase de 11–13 |
| **Lunes en la noche** | Sprint Review + Retrospectiva → informe a Jira | cierre de sprint |
| Diario | Check-in **escrito** (ayer / hoy / bloqueos) | sustituye a la Daily |

La Daily formal **se descarta por escrito y con la razón dicha en voz alta**: dos personas que comparten tres clases semanales no sostienen una reunión diaria. Un evento declarado y no cumplido resta más ante el comité que uno nunca prometido.

### Calendario

- **09 → 14 de septiembre de 2026:** semana de preparación. No es un sprint y por tanto no genera informe.
- **Sprint 1:** martes 15-sep → lunes 21-sep. Arranque técnico (ambiente DEV, CI, ArchUnit/JaCoCo, READMEs), sin puntos de historia: es infraestructura.
- **Sprint 2:** martes 22-sep → lunes 28-sep. Primeras historias de funcionalidad y los ambientes PRE/PROD.
- Sprints semanales de martes a lunes, de modo que a cada sustentación quincenal lleguen dos sprints cerrados.
- **La fecha del próximo comité no se conoce y no se deduce: se le pregunta al docente.**

### Épicas = incrementos demostrables

| # | Épica / Incremento | Requisitos |
|---|---|---|
| 1 | Cuenta de usuario | RF-01, RF-02, RF-03 |
| 2 | Búsqueda de ruta *(incluye offline, barrios, tarifas, congestión)* | RF-04, RF-05, RF-06, RF-09 |
| 3 | Historial y favoritos | RF-07, RF-10 |
| 4 | Comentarios | RF-08, RF-14 |
| 5 | Administración | RF-11, RF-12, RF-13 |

"Modo offline" **deja de ser épica propia**: no se puede demostrar sin búsqueda de ruta, y una épica no demostrable contradice el enfoque incremental que se acaba de declarar. **El orden de los incrementos lo prioriza Angélica como Product Owner.**

### La contradicción del docente, y cómo se responde

El `CLAUDE.md` madre exige **arquitectura hexagonal** y la guía de buenas prácticas web (§19, §20) prescribe **Controller → Service → Repository**. No se elige una: se muestra que hexagonal **contiene** a las tres, con otros nombres y con la dependencia invertida.

```
Guía del docente          FusaRoute (hexagonal)
──────────────────────────────────────────────────────────────
Controller           →    infrastructure/adapter/in/web/
Service              →    application/usecase/  +  domain/model/
Repository           →    infrastructure/adapter/out/persistence/
                          (su interfaz vive en domain/port/out/)
```

Lo que hexagonal agrega sobre el esquema en capas: **la interfaz del repositorio pertenece al dominio**, no a la infraestructura. Por eso se puede cambiar de base de datos sin tocar lógica de negocio, y por eso los casos de uso se prueban sin levantar Spring. Este mapeo es material directo de sustentación.

## Ambientes de ejecución

**Concepto, en una línea:** el código nunca cambia entre ambientes; lo que cambia es cuál archivo de configuración se activa.

| Ambiente | Qué es | Estado real hoy |
|---|---|---|
| **DEV** | PostgreSQL en el portátil de cada integrante. Cada quien rompe lo suyo. | **Se monta en la semana de preparación** |
| **PRE** | Proyecto Supabase con datos de prueba. El ensayo general. | Sprint 2 |
| **PROD** | Proyecto Supabase con las rutas reales. Lo que ve el comité. | Sprint 2 |

Los cuatro archivos de perfil del backend y los dos `environment.ts` del frontend **existen desde ya**, para cumplir en estructura con la §22 de la guía de buenas prácticas; PRE y PROD tienen sus claves declaradas y vacías hasta el Sprint 2.

**Se declara explícitamente, sin adornos: PROD no está desplegado en ningún servidor este semestre.** El backend corre desde un portátil el día de la demostración. Prometer un servidor productivo que no existe es exactamente lo que la sección de realismo de este archivo prohíbe.

**Credenciales:** nunca en el repositorio. Cada repo versiona su `.env.example` con las claves vacías, y ese archivo *es* la documentación: si una variable no está ahí, no existe. Corolario de la §12 de la guía: en Angular no va ninguna clave secreta, porque todo lo que llega al navegador es inspeccionable.

## Convenciones de trabajo

**Idioma** (decisión del 2026-09-07; antes se había fijado "todo el código y los commits en inglés"):

- En **inglés**: el código y los nombres de variables, clases, métodos, paquetes y archivos de código. Es el estándar de la industria y el de la documentación de Spring y Angular.
- En **español**: los comentarios dentro del código, los mensajes de commit, los issues de Jira, la documentación, el README y toda la comunicación con el docente.

El reparto tiene una razón: el código lo lee cualquiera del gremio y por eso va en inglés, pero todo lo que se sustenta ante el comité —commits, issues, README, informes de sprint— lo lee el docente, y va en español.

**Git** (igual en los tres repos):

- Trunk-based: `main` es la rama estable y protegida.
- **Pull Request obligatorio** antes de mergear a `main`, revisado por el otro integrante. Ninguno mergea su propio PR sin revisión.
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.

**Convención de rama y commit con key de Jira** — obligatoria en los repos de FusaRoute:

- Rama: `feature/SCRUM-12-nombre-corto` · `fix/SCRUM-30-nombre-corto`
- Commit: `feat(SCRUM-12): agregar endpoint de inicio de sesión`

La key de Jira (`SCRUM-12`) va **en la rama y en el commit**, no en uno solo. Es lo que hace que la app *GitHub for Jira* vincule automáticamente rama, commits y PR al issue correspondiente, sin pegar un solo link a mano. Un commit sin key queda huérfano: no aparece en el panel de desarrollo del issue ni en el informe de sprint que se presenta ante el comité.

**Backlog: Jira**, proyecto único `SCRUM`, con los componentes `backend` y `frontend` para separar las capas dentro del mismo tablero (decisión del 2026-09-07; el borrador anterior preveía GitHub Projects / Issues). Los sprints son **semanales**, de modo que a cada sustentación quincenal ante el comité llegan **dos sprints cerrados** con su informe. La guía de uso del tablero está en [`docs/guia-jira-fusaroute.md`](docs/guia-jira-fusaroute.md).

**Diagramas de arquitectura:** Mermaid versionado dentro de cada repo (`README.md` o `/docs`), nunca en una herramienta externa que se desactualice respecto al código.

**Reparto de trabajo:** el docente exige que **ambos integrantes participen equitativamente en todo** (frontend, backend y base de datos). No hay especialización por persona: al explicar o implementar algo, asumir que ambos necesitan entenderlo. Es la primera vez del equipo con Spring Boot y con Angular.

## Notas para trabajar en esta carpeta

**Planes vigentes — leer los dos al abrir una sesión nueva.** El segundo complementa al primero, no lo reemplaza:

1. **Plan maestro de arranque** (Jira + GitHub + scaffolding + grilling del backlog):
   `C:/Users/Santiago/.claude/plans/eager-coalescing-creek.md`
2. **Plan de Metodología y Preparación** (vigente desde 2026-09-09; metodología, roles, ambientes y la semana del 09 al 14 de septiembre):
   `C:/Users/Santiago/.claude/plans/lee-el-estado-del-wondrous-hoare.md`

```bash
cd "C:/Users/Santiago/dev/FusaRoute"
claude --permission-mode acceptEdits "Lee el Plan de Metodología y Preparación en C:/Users/Santiago/.claude/plans/lee-el-estado-del-wondrous-hoare.md y ejecútalo desde la sección 6."
```

Las sesiones de código se abren dentro del repo correspondiente (`dev/FusaRoute/FusaRoute-BACKEND` o `-FRONTEND`); las transversales, en `dev/FusaRoute/`, que tiene su propio `CLAUDE.md` de enrutamiento.

- El backlog grillado de historias de usuario (RF-01 a RF-12, con criterios de aceptación) está en `docs/backlog/historias-rf01-rf12.md`.

- El material de clase (`docs/clases/Clase*.pptx`, `docs/clases/ACTIVIDAD*.pdf`, `docs/actividad3/actividad 3 ing soft_APA.docx`) es fuente de verdad sobre lo que pide el docente. Consultarlo antes de asumir requisitos.
- Los `.pptx` y `.docx` no se leen directamente: son ZIP de XML. Extraer texto con `unzip -p <archivo> 'ppt/slides/slide*.xml'` o `word/document.xml` y limpiar las etiquetas.
- Antes de modificar un entregable ya redactado, hacer copia de respaldo (existen `docs/actividad3/actividad 3 ing soft_APA.ORIGINAL-BACKUP.docx` y `docs/actividad3/actividad 3 ing soft_APA v2.BACKUP-PRE-V3.docx`). La v3 actual es `docs/actividad3/actividad 3 ing soft_APA v3.docx`.
- Los entregables se escriben con la voz del equipo: primera persona plural, tono claro y directo, con glosas en lenguaje sencillo cuando aparece un término técnico. No academizar ni inflar la redacción.
