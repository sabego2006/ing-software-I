# Guía de Jira para FusaRoute

Guía de trabajo del equipo para el tablero de Jira del Proyecto Integrador.
Está escrita para poder releerse sin depender de ningún chat: explica **para qué**
sirve cada pieza, no solo dónde hay que hacer clic.

- **Equipo:** Santiago Bermúdez Gómez · Angélica María Aranguren Rozo
- **Sitio Jira:** https://fusaroute.atlassian.net
- **Proyecto:** `SCRUM` — nombre visible «FusaRoute»
- **Última revisión:** 2026-09-07

---

## 1. Por qué usamos Jira y no una lista de tareas

El curso simula una empresa de desarrollo. Ante el **Comité de Desarrollo y
Arquitectura** no basta con mostrar que la aplicación funciona: hay que mostrar
**cómo se organizó el trabajo**, qué se comprometió, qué se cumplió y qué no.

Jira nos da tres cosas que una lista de tareas no da:

1. **Trazabilidad.** Cada línea de código queda ligada a un requisito de la
   Actividad 3, que a su vez está ligado a algo que le prometimos al docente.
2. **Evidencia con fecha.** El informe de sprint muestra qué se planeó y qué se
   entregó. Eso es material de sustentación, no una promesa de palabra.
3. **Reparto visible.** El docente exige que ambos participemos en todo. El
   tablero prueba quién hizo qué, y sirve para detectar a tiempo si uno se está
   quedando solo con el backend o solo con el frontend.

> **Regla de oro:** si un trabajo no está en Jira, para efectos del comité no
> existe. No se empieza a programar algo que no tenga su issue.

---

## 2. Cómo está montado nuestro tablero

Datos reales, verificados el 2026-09-07:

| Cosa | Valor |
|---|---|
| Proyecto | uno solo: `SCRUM` («FusaRoute») |
| Tipo de proyecto | **team-managed** (Atlassian lo llama «gestionado por el equipo») |
| Tipos de issue disponibles | Epic, Story, Task, Feature, Bug, Subtask |
| Estados del flujo | To Do → In Progress → In Review → Done |
| Separación de capas | por **componentes**: `backend` y `frontend` |

**Por qué un solo proyecto y no dos.** Podríamos haber creado un proyecto para
backend y otro para frontend. No lo hicimos, y la razón importa: somos dos
personas y una historia de usuario casi siempre **atraviesa las dos capas**
(«el usuario inicia sesión» necesita endpoint *y* pantalla). Con dos proyectos
tendríamos que partir cada historia en dos y perderíamos de vista si la
funcionalidad completa quedó lista. Con un proyecto y componentes, la historia
es una sola y se etiqueta con la capa o las capas que toca.

**Qué significa «team-managed».** Es el tipo de proyecto que Jira crea por
defecto. Lo configuramos nosotros desde el propio proyecto, sin pedirle permisos
a un administrador global. La contrapartida es que algunas opciones se llaman o
se ubican distinto que en los tutoriales de internet, que suelen estar hechos
sobre proyectos *company-managed*. Si un menú no aparece donde dice un tutorial,
casi siempre es por esto.

---

## 3. Los niveles de trabajo: épica, historia, subtarea

Esta es la jerarquía. Se lee de arriba hacia abajo, de lo grande a lo pequeño.

```
Épica  ──►  Historia (o Tarea / Bug)  ──►  Subtarea
```

### Épica

Un **bloque grande de funcionalidad** que se entrega a lo largo de varios
sprints. No se «termina» en una semana y nadie trabaja «en una épica»: se
trabaja en las historias que cuelgan de ella.

Sirve para agrupar y para responder en el comité la pregunta «¿en qué van?» sin
leer 40 tarjetas. Nuestras épicas previstas:

| Épica | Qué agrupa |
|---|---|
| Autenticación | registro, inicio de sesión, ver y editar datos del usuario |
| Búsqueda de ruta | origen–destino, simulación en Google Maps, barrios y costo |
| Historial | búsquedas recientes, destino favorito |
| Comentarios | caja de sugerencias y respuesta del administrador |
| Administración | CRUD de rutas, suspensiones, notificaciones, métricas de uso |
| Modo offline | cálculo por distancia geométrica sobre los GeoJSON |

### Historia (Story)

**Una funcionalidad que le sirve a alguien**, escrita desde el punto de vista de
quien la usa. Es la unidad con la que planeamos y estimamos.

Formato:

```
Como <rol>, quiero <acción> para <beneficio>.
```

Ejemplo real de nuestro alcance:

> **SCRUM-XX — Registro de usuario final**
> Como visitante, quiero registrarme con nombre, correo y contraseña para poder
> guardar mi historial de búsquedas.

Una historia debe caber **dentro de un sprint**. Si no cabe, no es una historia:
es una épica mal disfrazada y hay que partirla.

### Subtarea

Un **paso técnico** dentro de una historia. Existe para repartir trabajo y para
ver avance parcial, no para planear. Las subtareas no se estiman en puntos: los
puntos van en la historia.

De la historia de arriba saldrían, por ejemplo: modelo `User` en el dominio,
caso de uso `RegisterUserUseCase`, endpoint `POST /api/auth/register`,
formulario de registro en Angular, pruebas del caso de uso.

### Tarea (Task) y Bug

- **Task** — trabajo necesario que no es una funcionalidad para el usuario final:
  configurar el CI, montar la base de datos, escribir un documento.
- **Bug** — algo que ya existía y quedó mal. No se usa para «falta hacer X»; eso
  es una historia o una tarea.

### Criterios de aceptación: lo que separa una historia buena de una inútil

Toda historia lleva, en su descripción, la lista de condiciones que deben
cumplirse para poder decir que está terminada. Sin eso, «terminado» es una
opinión.

```
Criterios de aceptación
- Dado un correo no registrado, cuando envío nombre, correo y contraseña
  válidos, entonces la cuenta se crea y recibo un token.
- Dado un correo ya registrado, cuando intento registrarme, entonces recibo
  un error 409 y el mensaje "el correo ya está en uso".
- La contraseña nunca se guarda en texto plano.
```

Esto es exactamente lo que el docente pide cuando dice que la calidad se diseña
y se mide: un criterio de aceptación es una métrica en miniatura.

---

## 4. Backlog y sprint: por qué son dos cosas distintas

- **Backlog** — la lista completa de todo lo que falta, ordenada por prioridad.
  Es un depósito. Puede tener 60 tarjetas y no pasa nada.
- **Sprint** — el subconjunto que nos comprometemos a terminar en esta semana.
  Es una promesa. Si tiene 20 tarjetas, es una promesa falsa.

Están separados a propósito. El backlog absorbe todas las ideas sin
desordenar el trabajo en curso; el sprint queda protegido. Si a mitad de semana
aparece algo nuevo, **va al backlog**, no al sprint. Esa disciplina es la que
después permite mirar el informe de sprint y que signifique algo.

### Nuestra cadencia

Sprints **semanales**. El comité es quincenal, así que a cada sustentación
llegamos con **dos sprints cerrados** y sus dos informes.

**Advertencia realista:** una semana es un sprint corto, y somos dos estudiantes
con otras materias. El riesgo concreto es arrastrar tarjetas sin terminar de un
sprint al siguiente, y un sprint que arrastra la mitad de su contenido no
informa nada. La forma de evitarlo es cargar poco: es preferible cerrar un
sprint de tres historias completas que uno de ocho a medias. Si dos sprints
seguidos arrastran trabajo, la conclusión no es «esforzarse más», es que
estamos metiendo demasiado por sprint y hay que bajar la carga.

---

## 5. Componentes: `backend` y `frontend`

Un **componente** es una etiqueta estructural de la parte del sistema que toca un
issue. Reemplazan a tener dos proyectos separados.

Para qué los usamos:

- Filtrar el tablero por capa cuando queremos ver solo una.
- Comprobar de un vistazo el reparto 50/50: si todas las tarjetas de `backend`
  son de una sola persona, el reparto está mal y hay que corregirlo antes de
  que lo note el docente.

Reglas de uso:

- Toda historia lleva al menos un componente.
- Una historia que atraviesa las dos capas lleva **los dos**. No se parte la
  historia solo para separar capas; se parte cuando es demasiado grande.

> **Nota de implementación:** en proyectos *team-managed* la administración de
> componentes está en **Configuración del proyecto → Componentes** (o, según la
> versión, en la sección de campos del proyecto). Si en nuestro proyecto la
> opción no apareciera, la alternativa equivalente y siempre disponible es usar
> **etiquetas** (`labels`) con los mismos dos valores, `backend` y `frontend`.
> Funciona igual para filtrar; lo único que se pierde son los informes por
> componente, que no usamos. Hay que verificarlo al configurarlo — no está
> confirmado todavía en nuestro tablero.

---

## 6. El flujo de estados

Nuestro workflow tiene cuatro estados, y se puede saltar entre cualquiera de
ellos (Jira no nos obliga a un orden). Verificado en el tablero real:

| Estado | Qué significa de verdad |
|---|---|
| **To Do** | está en el sprint, nadie lo ha empezado |
| **In Progress** | alguien está trabajando en esto **ahora** |
| **In Review** | hay un Pull Request abierto esperando revisión del compañero |
| **Done** | el PR se mergeó a `main` y los criterios de aceptación se cumplen |

Dos reglas que evitan que el tablero se vuelva decorativo:

1. **Se mueve la tarjeta cuando se empieza, no cuando se termina.** Un tablero
   donde todo salta de To Do a Done el día antes del comité no sirve para
   detectar problemas.
2. **In Review no es Done.** Nuestra norma es que nadie mergea su propio PR sin
   revisión del otro. Mientras el compañero no revise, la tarjeta se queda en
   In Review aunque el código «ya funcione».

**Límite práctico:** no más de dos tarjetas en In Progress por persona. Si hay
más, en realidad no se está avanzando en ninguna.

---

## 7. Estimación en story points

Los **story points** miden **esfuerzo relativo**: tamaño, complejidad e
incertidumbre. No son horas.

Usamos la escala 1, 2, 3, 5, 8, 13.

| Puntos | Cómo se siente |
|---|---|
| 1 | trivial, lo entendemos completo, sin sorpresas |
| 2 | pequeño, camino claro |
| 3 | mediano, algún detalle por resolver |
| 5 | grande, hay que investigar algo |
| 8 | muy grande — sospechoso, mirar si se puede partir |
| 13 | **no es una historia.** Partirla antes de meterla a un sprint |

### Por qué no estimamos en horas

Tres razones, y las tres nos aplican directamente:

1. **No sabemos cuántas horas tenemos.** Somos estudiantes con otras materias;
   una semana buena y una mala no se parecen. Estimar en horas obliga a mentir.
2. **Es la primera vez del equipo con Spring Boot y con Angular.** Cualquier
   estimación en horas de algo que nunca hemos hecho es inventada. El esfuerzo
   relativo, en cambio, sí lo podemos juzgar: sabemos que un CRUD de rutas es
   más grande que un endpoint de salud, aunque no sepamos cuántas horas es
   ninguno de los dos.
3. **Las horas se vuelven un compromiso personal; los puntos, una medida del
   trabajo.** «Dije 4 horas y llevo 9» genera culpa y hace que la gente esconda
   el retraso. «Esta historia era de 5 puntos y resultó de 8» genera un dato
   útil para la siguiente estimación.

### Cómo estimamos entre dos

Cada uno dice su número **al mismo tiempo**, sin ver el del otro. Si coinciden,
listo. Si uno dice 2 y el otro 8, no se promedia: se conversa, porque esa
diferencia significa que uno de los dos entendió algo que el otro no. Ahí está
todo el valor del ejercicio, y es también donde ambos aprendemos la parte del
stack que no nos tocó.

### Velocidad

Al cerrar cada sprint anotamos cuántos puntos se completaron. Después de tres o
cuatro sprints eso da nuestra **velocidad**, y con ella podemos planear con
evidencia en vez de con optimismo. Antes del tercer sprint cualquier
«velocidad» es ruido: no la usemos para prometerle nada al comité todavía.

---

## 8. El informe de sprint y el comité

Al cerrar cada sprint, Jira genera automáticamente el **informe de sprint** y el
**burndown** (en la sección de Informes del proyecto). Muestran qué se planeó,
qué se completó, qué se arrastró y qué se agregó a mitad de camino.

Para el comité, ese informe responde solo tres preguntas que el docente va a
hacer igual:

- **¿Qué se comprometieron?** — el contenido del sprint al iniciarlo.
- **¿Qué entregaron?** — las tarjetas en Done con su PR vinculado.
- **¿Por qué falta lo que falta?** — las arrastradas, con su explicación.

La tercera es la importante. Un sprint con trabajo arrastrado **no es un
problema si sabemos decir por qué**. En este curso, cambiar de rumbo con
argumentos suma; cambiar sin registrar el porqué resta. Si una historia se cayó
porque conseguir el trazado oficial de una ruta resultó imposible, eso es un
riesgo del proyecto que ya estaba registrado y se sustenta. Si se cayó y no
sabemos por qué, ahí sí hay un problema.

**Rutina de cierre de sprint** (15 minutos, los dos):

1. Cerrar el sprint en Jira; lo que no esté en Done vuelve al backlog.
2. Anotar los puntos completados.
3. Escribir en dos frases qué se arrastró y por qué.
4. Iniciar el siguiente sprint.

---

## 9. La conexión GitHub ↔ Jira

Esta es la pieza que hace que el tablero se actualice con evidencia real en vez
de a mano.

### La convención: la key en la rama y en el commit

```
Rama:    feature/SCRUM-12-registro-usuario
Commit:  feat(SCRUM-12): agregar endpoint de registro de usuario
```

La key (`SCRUM-12`) va **en las dos partes**, no en una sola. Con eso, la app
*GitHub for Jira* detecta sola la rama, los commits y el PR, y los muestra en el
panel de desarrollo del issue. No hay que pegar ni un link.

Un commit sin key queda huérfano: no aparece en el issue ni en el informe de
sprint. Para el comité, ese trabajo es invisible.

### Instalar GitHub for Jira

Requiere permisos de administrador **en Atlassian y en GitHub** — lo hace
Santiago, que es dueño de los dos repos.

1. En Jira: **Aplicaciones → Explorar más aplicaciones**, buscar
   **GitHub for Jira** (es de Atlassian y es gratuita).
2. **Get it now / Instalar** en el sitio `fusaroute`.
3. **Configurar → Connect GitHub organization**, y autorizar la cuenta
   `sabego2006`.
4. Seleccionar los repositorios a vincular: `FusaRoute-BACKEND` y
   `FusaRoute-FRONTEND`.
5. Esperar el backfill (Jira importa el historial existente; tarda unos minutos).

> El repo `ing-software-I` **no** se vincula: solo aloja documentación del curso,
> no hay desarrollo ahí.

### Cómo comprobar que quedó bien

La prueba de fuego, hecha una sola vez:

```bash
git switch -c feature/SCRUM-5-prueba-vinculo
# ...un cambio cualquiera...
git commit -m "chore(SCRUM-5): probar el vinculo entre GitHub y Jira"
git push -u origin feature/SCRUM-5-prueba-vinculo
gh pr create --draft --fill
```

Luego abrir `https://fusaroute.atlassian.net/browse/SCRUM-5`. En el panel de
desarrollo del issue deben aparecer **la rama, el commit y el PR**, sin haber
pegado ningún enlace. Si no aparecen, revisar en este orden: que la key esté
bien escrita y en mayúsculas, que el repo esté seleccionado en la configuración
de la app, y que el backfill haya terminado.

---

## 10. Rutina de trabajo, de principio a fin

Así se ve una historia completa en la práctica:

1. **Tomarla del sprint.** Asignársela y moverla a **In Progress**.
2. **Crear la rama** desde `main` actualizado:
   `git switch -c feature/SCRUM-12-registro-usuario`
3. **Trabajar**, commiteando con la key: `feat(SCRUM-12): ...`
4. **Abrir el PR** cuando esté listo y mover la tarjeta a **In Review**.
5. **El otro revisa.** Nadie mergea su propio PR. La revisión no es un trámite:
   es donde cada uno aprende el código que no escribió, que es justo lo que el
   docente evalúa.
6. **Mergear y mover a Done**, verificando que los criterios de aceptación se
   cumplen de verdad.

---

## 11. Configuración pendiente

Checklist de lo que falta hacer sobre el Jira real. Marcar aquí a medida que se
completa.

- [ ] **Componentes `backend` y `frontend`** creados (ver la nota de la §5 sobre
      team-managed y la alternativa con etiquetas).
- [ ] **App GitHub for Jira** instalada y los dos repos de FusaRoute vinculados
      (§9). Requiere admin de Atlassian y de GitHub.
- [ ] **Sprints semanales** configurados. **Falta un dato para esto: el día y la
      fecha del próximo Comité.** Los sprints se alinean para que dos de ellos
      cierren antes de cada sustentación, así que sin esa fecha no se puede fijar
      el día de corte.
- [ ] **Acceso de Angélica verificado**: que entre al tablero, vea el backlog y
      pueda **mover una tarjeta de columna**. Ese es el criterio de verificación
      de esta etapa — no basta con que la cuenta exista.
- [ ] **Issues de onboarding SCRUM-1..5** resueltos (§12).
- [ ] **Épicas** creadas (las seis de la §3). Se crean en la Etapa 3, junto con
      las primeras historias.

---

## 12. Qué hacer con los issues SCRUM-1 a SCRUM-5

El proyecto vino con cinco issues de onboarding de Atlassian. Decidimos no
borrarlos y usarlos como tutorial. Estado real verificado el 2026-09-07:

| Issue | Qué pide | Estado | Qué hacemos |
|---|---|---|---|
| **SCRUM-1** | «Start here»: cargar el trabajo del equipo | To Do | Se cumple solo al cargar el backlog real en la Etapa 3. Cerrar entonces. |
| **SCRUM-2** | Instalar la app **Claude for Jira** | To Do | **Descartar.** Ver abajo. |
| **SCRUM-3** | Conectar **Rovo MCP** a las herramientas locales | To Do | **Ya está hecho de facto** — es la conexión que usamos. Cerrar. |
| **SCRUM-4** | Delegar un issue al agente de Jira | To Do | **Descartar**: depende de SCRUM-2. |
| **SCRUM-5** | Implementar un issue desde el IDE/terminal | **In Review** | Rehacer sobre el backend en la Etapa 2 y cerrar ahí. |

### Por qué descartamos SCRUM-2 y SCRUM-4

El plan original daba por hecho que los cinco eran ejercicios de aprendizaje
gratuitos. No lo son. SCRUM-2 pide instalar la app *Claude for Jira*, que exige
**una API key de Anthropic** (servicio de pago, facturado por consumo) y **un
token personal de GitHub** para una cuenta de servicio. SCRUM-4 no se puede
hacer sin esa app.

No aporta nada al curso: es una funcionalidad para delegar tickets a un agente
que escribe código dentro de Jira, y nosotros ya trabajamos con el agente desde
la terminal, que es lo que cubre SCRUM-3 y es gratis. Pagar por eso para cerrar
dos tarjetas de tutorial no tiene sentido.

**Lo honesto es cerrarlos dejando constancia**, no fingir que se hicieron. Al
moverlos a Done, dejar un comentario en cada uno:

> Revisado y descartado: requiere la app de pago *Claude for Jira* (API key de
> Anthropic). Trabajamos con el agente desde la terminal vía Rovo MCP (SCRUM-3),
> que cubre la misma necesidad sin costo.

### Nota sobre SCRUM-5

SCRUM-5 quedó **In Review** porque el ejercicio se hizo sobre el repo del
material del curso (`ing-software-I`), no sobre un repo de desarrollo. El PR #1
ya se mergeó allí. El ejercicio se **rehace sobre `FusaRoute-BACKEND`** en la
Etapa 2 y se cierra ahí, que es donde tiene sentido y donde sirve para verificar
que la vinculación GitHub ↔ Jira funciona sobre un repo real.

---

## 13. Glosario rápido

| Término | En una línea |
|---|---|
| **Backlog** | todo lo que falta, ordenado por prioridad |
| **Sprint** | lo que nos comprometemos a terminar esta semana |
| **Épica** | bloque grande de funcionalidad; agrupa historias |
| **Historia** | una funcionalidad útil para alguien, escrita desde su punto de vista |
| **Subtarea** | paso técnico dentro de una historia |
| **Criterio de aceptación** | condición verificable para poder decir «terminado» |
| **Story point** | medida de esfuerzo relativo; no son horas |
| **Velocidad** | puntos completados por sprint; sirve después de 3–4 sprints |
| **Componente** | la capa que toca el issue: `backend` o `frontend` |
| **Key** | el identificador del issue (`SCRUM-12`); va en la rama y en el commit |
| **Burndown** | gráfica de trabajo restante contra días del sprint |
