# Ingeniería de Software I — Universidad de Cundinamarca

Carpeta de la asignatura **Ingeniería de Software I** (Ingeniería de Sistemas y Computación, 5.º semestre, sede Fusagasugá).

- **Docente:** Ing. Luiferney Ortiz Parra
- **Semestre:** 2026-2 (agosto de 2026)
- **Equipo:** Santiago Bermúdez Gómez · Angélica María Aranguren Rozo

## Cómo funciona el curso

El curso se dicta bajo el modelo de una **empresa de desarrollo de software simulada**. No basta con que el código funcione: hay que **sustentar las decisiones técnicas** y defender el diseño.

**Comité de Desarrollo y Arquitectura** — es el mecanismo central de evaluación. Funciona como espacio de revisión, toma de decisiones, aprobación de avances y análisis de riesgos, con el docente cumpliendo un rol de comité. Cada avance del proyecto se aprueba ahí antes de seguir.

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

**Repositorios** (separados, cada uno con su propio `CLAUDE.md`):

- Backend: [`FusaRoute-BACKEND/`](FusaRoute-BACKEND/) → https://github.com/sabego2006/FusaRoute-BACKEND
- Frontend: [`FusaRoute-FRONTEND/`](FusaRoute-FRONTEND/) → https://github.com/sabego2006/FusaRoute-FRONTEND

Esta carpeta madre **no** es un repositorio git; solo contiene material de clase y los dos repos clonados como subcarpetas.

**Regla de commits en este repo madre:** `FusaRoute-BACKEND/` y `FusaRoute-FRONTEND/` están excluidos vía `.gitignore` — son repos propios con su historial y remoto independientes, y nunca deben aparecer en un commit de este repo madre. Cualquier cambio en ellos se commitea y pushea desde su propio repo.

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

## Convenciones de trabajo

**Idioma:** documentación del curso y comunicación con el docente en **español**. Código, comentarios, nombres de variables y mensajes de commit en **inglés** (estándar de industria y de la documentación de Spring/Angular).

**Git** (igual en ambos repos):

- Trunk-based: `main` es la rama estable y protegida.
- Ramas `feature/<descripcion-corta>` o `fix/<descripcion-corta>`.
- **Pull Request obligatorio** antes de mergear a `main`, revisado por el otro integrante. Ninguno mergea su propio PR sin revisión.
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.

**Backlog:** GitHub Projects / Issues. Cada sustentación quincenal ante el comité corresponde a un hito de Issues cerrados más demo funcional.

**Diagramas de arquitectura:** Mermaid versionado dentro de cada repo (`README.md` o `/docs`), nunca en una herramienta externa que se desactualice respecto al código.

**Reparto de trabajo:** el docente exige que **ambos integrantes participen equitativamente en todo** (frontend, backend y base de datos). No hay especialización por persona: al explicar o implementar algo, asumir que ambos necesitan entenderlo. Es la primera vez del equipo con Spring Boot y con Angular.

## Notas para trabajar en esta carpeta

- El material de clase (`docs/clases/Clase*.pptx`, `docs/clases/ACTIVIDAD*.pdf`, `docs/actividad3/actividad 3 ing soft_APA.docx`) es fuente de verdad sobre lo que pide el docente. Consultarlo antes de asumir requisitos.
- Los `.pptx` y `.docx` no se leen directamente: son ZIP de XML. Extraer texto con `unzip -p <archivo> 'ppt/slides/slide*.xml'` o `word/document.xml` y limpiar las etiquetas.
- Antes de modificar un entregable ya redactado, hacer copia de respaldo (existen `docs/actividad3/actividad 3 ing soft_APA.ORIGINAL-BACKUP.docx` y `docs/actividad3/actividad 3 ing soft_APA v2.BACKUP-PRE-V3.docx`). La v3 actual es `docs/actividad3/actividad 3 ing soft_APA v3.docx`.
- Los entregables se escriben con la voz del equipo: primera persona plural, tono claro y directo, con glosas en lenguaje sencillo cuando aparece un término técnico. No academizar ni inflar la redacción.
