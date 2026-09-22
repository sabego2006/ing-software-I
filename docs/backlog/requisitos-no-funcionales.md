# Requisitos no funcionales — RNF-01 a RNF-07

> Grillados el 2026-09-14 (Etapas 5-10 del plan maestro, cierre del backlog junto con RF-13 y
> RF-14 en `docs/backlog/historias-rf01-rf15.md`), con Santiago respondiendo solo.
>
> **Ratificados el 2026-09-15 por Angélica**, en la misma sesión conjunta que aprobó las 15 HU
> (ver `docs/backlog/historias-rf01-rf15.md`). Los 7 quedan aprobados por el equipo completo.
> RNF-01 recibió un sub-criterio nuevo ese día (tamaño del bundle GeoJSON) — ver su sección.
>
> No son historias de usuario (no tienen actor que las "quiera"), por eso viven en un documento
> aparte con el formato de la Tabla 3 de la Actividad 3: atributo ISO/IEC 25010 + criterio +
> instrumento. RNF-08 no aparece: se eliminó por redundante en el grill de métricas del
> 2026-08-24 (ver `docs/actividad3/build_v3.py`).
>
> El texto de cada RNF es el mismo que quedó escrito en
> `docs/actividad3/actividad 3 ing soft_APA v3.docx` tras la corrección aplicada en esta sesión
> (`docs/actividad3/fix_rnf_v3_1.py`, revisión v3.1). Tres de los siete (RNF-01, 02, 03) tenían
> un desfase real con lo que ya declaraba el `CLAUDE.md` del proyecto y se resolvieron con
> preguntas puntuales a Santiago. Los otros cuatro (RNF-04, 05, 06, 07) se le presentaron
> primero como hallazgo propio ("ya están bien, los dejo así") sin pedirle confirmación
> explícita — al notar la diferencia, se le volvieron a plantear como pregunta y Santiago los
> confirmó uno por uno el 2026-09-14. Los siete quedan, entonces, con aprobación explícita
> registrada.

---

## RNF-01 — Rendimiento (eficiencia de desempeño)

El sistema debe responder las consultas de ruta con un p95 menor a **8 segundos** medido
extremo a extremo (cliente → backend → Google Maps → render) en una red 4G típica, verificado
con Spring Boot Actuator + Micrometer. Se cachean los tiempos de viaje por par origen-destino
con un TTL de 5 minutos para no exceder ese límite. La aplicación ofrece un modo offline básico
que muestra la ruta sugerida y los barrios por los que pasa (calculada por distancia geométrica
sobre el trazado GeoJSON), sin incluir el cálculo de tiempo de llegada, el cual solo se obtiene
en línea vía Google Maps.

**Instrumento:** Spring Boot Actuator + Micrometer (percentil 95 por endpoint) + Lighthouse en
CI (LCP < 2.5 s, throttling "Slow 4G") + tamaño del bundle GeoJSON verificado en build.

**Sub-criterio añadido el 2026-09-15 (guardarraíl de tamaño):** el bundle GeoJSON de la red
completa de rutas debe pesar **≤ 1 MB gzip**. Análisis que lo respalda: una ruta urbana de ~10 km
con un vértice cada 20 m son ~500 vértices (~10 KB con coordenadas a 5-6 decimales, que ya dan
~1.1 m de precisión — más que suficiente para una buseta); con 25 rutas urbanas+intermunicipales,
la red completa pesa entre 250 KB y 1 MB en el peor caso realista. Los barrios (RF-05) se
almacenan como **lista de nombres**, no como polígonos — evita el GeoJSON más pesado que existe
(fronteras de barrio) sin perder nada, porque RF-05 solo necesita mostrar una secuencia de
nombres. Si el bundle real supera el límite, es señal de datos sin limpiar (coordenadas de GPS
crudo a 13-15 decimales), no de que el límite esté mal puesto.

**Qué cambió en este grilling:** el `.docx` de la Actividad 3 v3 seguía en "p95 < 5 s" pese a
que el `CLAUDE.md` del proyecto ya declaraba 8 s como "comprometido en la v3" desde el
2026-08-26 — la memoria del proyecto decía que el `.docx` se había corregido ese día, pero no
era cierto, seguía en 5 s en la tabla de RNF y en la tabla de métricas. Se corrigieron ambas a
8 s. Verificable: sí, con Actuator + Micrometer ya en el stack decidido.

---

## RNF-02 — Fiabilidad (disponibilidad)

El backend se despliega en **Render** (tier gratis) y el frontend en **Vercel**. El tier gratis
de Render suspende el servicio tras 15 minutos sin tráfico y tarda entre 30 y 60 segundos en
reactivarse ante la siguiente petición (cold start); esa reactivación no cuenta como caída para
efectos de esta métrica. Medido con UptimeRobot (latido cada 5 minutos) en horario hábil de
lunes a viernes entre 7:00 y 21:00 hora Colombia, el sistema debe responder correctamente
(incluyendo el tiempo de cold start) en al menos un **95%** de los latidos registrados.
**RPO < 24 horas** con backup diario automatizado de PostgreSQL (Supabase). No se compromete un
RTO de servidor siempre activo, porque el tier gratis no lo sostiene.

**Instrumento:** UptimeRobot (latido cada 5 minutos) contra el backend en Render + backup
diario automatizado de PostgreSQL (Supabase) y restore probado al cierre de cada sprint.

**Qué cambió en este grilling:** la versión anterior asumía un backend corriendo 24/7 en un
servidor clásico (RTO < 1 h, RPO < 24 h), pero el `CLAUDE.md` declaraba explícitamente que
"PROD no está desplegado en ningún servidor este semestre" — la métrica no tenía nada que medir.
Esta sesión decidió el despliegue real: **frontend en Vercel** (encaja bien, es su caso de uso
estándar) y **backend en Render, tier gratis**. Se investigó si el backend también podía ir en
Vercel (que desde julio de 2026 permite desplegar cualquier Dockerfile, Spring Boot incluido) —
se descartó porque ese modelo es serverless y escala a cero a los 5 minutos, sin almacenamiento
durable, explícitamente no pensado para un proceso persistente como una JVM con conexión abierta
a PostgreSQL. Render sí sostiene ese tipo de proceso, a cambio de cold starts que quedaron
reflejados en el número (no se prometió un 99% ni un servidor siempre activo que el tier gratis
no puede dar). **Riesgo a vigilar:** si el cold start de 30-60 s empuja el p95 de RNF-01 por
encima de 8 s en la primera consulta tras una suspensión, hay que decidir si se acepta como caso
aparte o si se paga un plan de pago (Render Starter, US$7/mes) antes de la sustentación — no se
resolvió en esta sesión.

---

## RNF-03 — Mantenibilidad

El backend debe mantener una separación estricta entre las capas del hexágono (dominio,
aplicación, adaptadores), sin que la lógica de negocio dependa directamente de frameworks
externos: **0 violaciones** de la arquitectura hexagonal detectadas por ArchUnit en CI, y al
menos **70% de cobertura** de tests unitarios en el paquete `domain/`, medida con JaCoCo.

**Instrumento:** ArchUnit ejecutándose en CI sobre los módulos del backend + reporte de
cobertura JaCoCo con umbral mínimo bloqueante.

**Qué cambió en este grilling:** el `.docx` original solo describía la separación de capas en
palabras, sin número ni instrumento — violaba la propia regla del curso de no enunciar un
atributo de calidad sin el número que lo verifica. El `CLAUDE.md` ya tenía ese número en su
tabla de métricas de referencia; se alineó RNF-03 con ese mismo valor en vez de inventar uno
nuevo, para no tener dos definiciones de "mantenibilidad" flotando en documentos distintos.

---

## RNF-04 — Usabilidad

El flujo principal de búsqueda de ruta (una vez iniciada la sesión) debe tomar máximo 4 pasos:
(1) abrir la app, (2) marcar origen, (3) marcar destino, (4) ver el resultado. El inicio de
sesión se solicita como máximo una vez por semana, lo que equivale a un clic extra 1 de cada 7
días. La métrica se mide con al menos 5 usuarios externos al equipo y se exige una tasa de éxito
≥ 80% en el primer intento.

**Instrumento:** prueba con al menos 5 usuarios externos al equipo antes de cada sustentación,
registrando pasos y resultado de cada intento.

**Qué se revisó en este grilling:** ya estaba bien definida — tiene número, umbral y método de
medición, y coincide palabra por palabra con la tabla de métricas del `CLAUDE.md`. Aprobada tal
cual por Santiago el 2026-09-14, sin cambios.

---

## RNF-05 — Seguridad

El sistema no debe tener vulnerabilidades altas o críticas reportadas por las herramientas
automatizadas de análisis en el momento de cada entrega. Las herramientas son OWASP
Dependency-Check y un analizador estático ejecutados en CI en cada Pull Request, y la métrica se
reporta como "0 vulnerabilidades altas o críticas detectadas en la fecha X".

**Instrumento:** OWASP Dependency-Check + analizador estático en CI, en cada Pull Request.

**Qué se revisó en este grilling:** bien definida, con instrumento ejecutable y coincide con el
`CLAUDE.md`. Aprobada tal cual por Santiago el 2026-09-14, sin cambios.

---

## RNF-06 — Seguridad (contraseñas)

Las contraseñas de los usuarios deben almacenarse con hash bcrypt (factor de costo ≥ 10), nunca
en texto plano. El cumplimiento se valida con un test de integración que verifica que el hash
guardado no es igual a la contraseña en plano y que el login funciona con la contraseña
original.

**Instrumento:** test de integración en el backend (verifica hash ≠ texto plano y login
funcional).

**Qué se revisó en este grilling:** bien definida y ya referenciada explícitamente en el
criterio de aceptación de RF-01 (`docs/backlog/historias-rf01-rf15.md`). Aprobada tal cual por
Santiago el 2026-09-14, sin cambios.

---

## RNF-07 — Compatibilidad

La aplicación debe funcionar correctamente en los navegadores Chrome (Android), Safari (iOS) y
al menos un navegador de escritorio (Chrome o Firefox), probados en dispositivos físicos y en
emulador según disponibilidad. La verificación se repite **antes de cada sustentación ante el
comité**, no solo una vez al final del semestre.

**Instrumento:** prueba manual en dispositivos físicos y emulador (sin herramienta de CI —
compatibilidad de navegador no se presta a un chequeo automatizado con lo que tiene el equipo
este semestre).

**Qué cambió en este grilling:** el texto original no decía con qué frecuencia se repetía la
prueba de compatibilidad, dejando ambigüedad sobre si era un chequeo único. Se propuso la
cadencia "antes de cada sustentación" (igual que RNF-04) y Santiago la confirmó explícitamente
el 2026-09-14.

---

## Nota sobre por qué RNF-07 no está en la tabla de "métricas de referencia" del CLAUDE.md

Esa tabla tiene, a propósito, una fila por atributo ISO/IEC 25010 nombrado por el docente
(rendimiento, disponibilidad, mantenibilidad, usabilidad, seguridad) — "una métrica por
atributo", sin duplicar. Compatibilidad no es uno de esos cinco atributos con nombre propio en
esa tabla, así que RNF-07 sigue existiendo como requisito comprometido (en el `.docx` de la
Actividad 3) sin tener fila espejo en esa tabla resumen. No es una omisión, es la misma regla de
"no multiplicar métricas redundantes" aplicada de forma consistente.

---

## Reprogramación del 2026-09-21 (preparación del comité del 28-sep)

Ningún **criterio** de los siete RNF cambió. Lo que cambió es **cuándo** se trabaja cada uno, al
rearmar el Sprint 2 para responder a lo que pidió el docente para el comité del lunes 28 de
septiembre. El detalle completo está en `historias-rf01-rf15.md` y en
`~/.claude/plans/pregunta-si-tienes-alguna-fuzzy-hopcroft.md`.

| RNF | Key | Estaba en | Pasó a | Razón |
|---|---|---|---|---|
| RNF-01 Rendimiento | `SCRUM-127` | Sprint 2 | **Sprint 4** | Su métrica es el p95 de `/api/routes/search`, y ese endpoint no existe hasta el Sprint 3/4. Lighthouse necesita un frontend con páginas reales que medir. **Hoy no hay nada que medir** — dejarlo en el Sprint 2 sería comprometer una medición imposible, justo lo que prohíbe la sección de realismo del `CLAUDE.md`. |
| RNF-03 Mantenibilidad | `SCRUM-129` | Sprint 10 | **Sprint 2** | Jira la empujó al Sprint 10 al cerrar el Sprint 1 sin completarla. Vuelve porque *es* lo que el docente pidió: arquitectura hexagonal verificada (ArchUnit) y cobertura medida (JaCoCo). |
| RNF-05 Seguridad | `SCRUM-131` | Sprint 10 | **Sprint 2** | Mismo empujón automático. Vuelve porque es el punto "dependencias al día": OWASP Dependency-Check + analizador estático. |
| RNF-02 Fiabilidad | `SCRUM-128` | Sprint 3 | Sprint 3 *(sin cambio)* | **Es el despliegue.** Queda confirmado en el Sprint 3 (29-sep → 5-oct). La línea del `CLAUDE.md` que decía "PRE/PROD en el Sprint 2" quedó desactualizada frente al Sprint Planning del 17-sep y se corrigió. |

**Riesgo abierto en RNF-03.** El umbral de JaCoCo (≥70 % en `domain/` y `application/`) **hoy hace
fallar el propio build**: los únicos habitantes de esos paquetes son dos clases `Empty.java` sin
tests, así que la cobertura es 0 % y el CI lleva 6 de 6 ejecuciones en rojo. **El umbral no se
baja** — es un número ya comprometido ante el comité, y bajarlo para que pase el CI es exactamente
lo que la sección de realismo prohíbe. Se arregla borrando las clases `Empty` y escribiendo los
tests reales (`SCRUM-163`).

**Riesgo abierto en RNF-05.** OWASP Dependency-Check falla al descargar la base de datos de la NVD
(`the NVD returned a 403 or 404 error`) por falta de `NVD_API_KEY`. La clave es gratuita pero el
correo de validación puede tardar horas: hay que solicitarla el martes 22, no el fin de semana.

**Cambio de infraestructura que toca a RNF-02.** Se decidió el 2026-09-21 que los **tres ambientes
corren sobre Supabase** (antes DEV era PostgreSQL local por portátil), y que el esquema se versiona
con **Flyway** en vez de `ddl-auto`. Sin migraciones habría que crear el esquema a mano tres veces y
mantenerlo sincronizado; con Flyway queda en un `.sql` revisable en el PR. Esto no altera el
criterio de RNF-02 (≥95 % de latidos, RPO < 24 h), pero sí simplifica el backup y el restore que ese
RNF exige probar al cierre de cada sprint.
