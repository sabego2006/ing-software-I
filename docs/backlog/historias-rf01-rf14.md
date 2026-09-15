# Historias de usuario — RF-01 a RF-14

> RF-01..09 grilladas y cerradas el 2026-09-09 (Etapa 3 del plan, tres lotes de 3: RF-01..03 en
> sesión de chat previa recuperada de historial, RF-04..09 en esa misma fecha con Angélica y
> Santiago respondiendo por turnos). RF-10..12 grilladas el 2026-09-09 (Etapa 5), mismo método
> de turnos. RF-13..14 grilladas el 2026-09-14 (Etapas 5-10, cierre del backlog), con Santiago
> respondiendo solo — pendiente de que Angélica revise el resumen en
> `entregables/fusaroute-grilling-rf13-14-rnf-resumen.html` antes de darlas por definitivas.
> Formato: historia + criterios de aceptación. **Todavía no cargadas a Jira** — falta ese paso.
> Los requisitos no funcionales (RNF-01 a RNF-07) viven en un documento aparte, por no ser
> historias de usuario: `docs/backlog/requisitos-no-funcionales.md`.

---

## RF-01 — Registro de usuarios
**Épica:** Autenticación y Perfil · **Componente:** Frontend + Backend

Como Usuario Final, quiero crear una cuenta en la plataforma, para poder acceder a las
funciones personalizadas del sistema.

**Criterios de aceptación:**
- El sistema solicita nombre, correo electrónico y contraseña.
- El correo se valida por formato y unicidad en la base de datos.
- La contraseña exige mínimo 8 caracteres, con al menos 1 mayúscula y 1 número.
- La cuenta se activa inmediatamente después del registro (sin verificación por correo).
- El backend almacena la contraseña con hash BCrypt, factor de costo ≥ 10 (RNF-06).

---

## RF-02 — Inicio de sesión
**Épica:** Autenticación y Perfil · **Componente:** Frontend + Backend

Como Usuario Final, quiero iniciar sesión con mis credenciales, para acceder a mi cuenta y
guardar mis búsquedas.

**Criterios de aceptación:**
- El acceso es por correo electrónico y contraseña.
- El sistema emite un JWT con validez de **una semana**; al expirar, el usuario debe volver a
  loguearse (RNF-04: el login se pide como máximo 1 vez por semana).
- Hasta 4 intentos fallidos muestran un mensaje genérico de "credenciales incorrectas".
- Al quinto intento fallido, el sistema aplica un bloqueo temporal y notifica al usuario sobre
  el bloqueo (no un mensaje genérico como los anteriores).
- Recuperación de contraseña queda **fuera de alcance** este semestre, para priorizar la
  búsqueda de rutas — declarado explícitamente.

---

## RF-03 — Ver y editar datos personales
**Épica:** Autenticación y Perfil · **Componente:** Frontend + Backend

Como Usuario Final, quiero ver y editar mi información personal, para mantener mis datos
actualizados.

**Criterios de aceptación:**
- El usuario visualiza nombre, correo electrónico y número de teléfono.
- El usuario puede editar nombre, correo, número de teléfono y contraseña.
- Un cambio de correo se valida de nuevo por formato y unicidad.
- Cambiar la contraseña exige ingresar la contraseña actual como confirmación.

---

## RF-04 — Sugerencia de la mejor ruta por tiempo
**Épica:** Búsqueda de ruta · **Componente:** backend

Como Usuario Final, quiero que el sistema me sugiera la ruta de buseta más rápida entre mi
origen y mi destino, para no perder tiempo adivinando cuál tomar.

**Criterios de aceptación:**
- Dado un origen y un destino válidos dentro del alcance geográfico, cuando el usuario busca,
  entonces el sistema devuelve la ruta candidata con menor tiempo estimado, calculado
  combinando las rutas registradas en la base de datos con los tiempos de viaje obtenidos de
  la API de Google Directions (usada solo para cronometrar, no para determinar el trazado).
- Dado que no existe ninguna ruta registrada que conecte el origen con el destino, cuando el
  usuario busca, entonces el sistema muestra un mensaje explícito de "no hay ruta disponible",
  no una lista vacía.
- Dado que el dispositivo está sin conexión (modo offline), cuando el usuario busca, entonces
  el sistema ordena las rutas candidatas por distancia del trazado (GeoJSON) sin mostrar
  tiempo estimado.
- La lógica de selección de la mejor ruta vive en el paquete `domain/` y no depende
  directamente de la API externa (RNF-03); la API externa se consume a través de un puerto de
  salida `TravelTimeProvider`.
- El tiempo de respuesta extremo a extremo (p95) no debe superar 8 segundos (RNF-01, ajustado
  por el equipo el 2026-09-09); los tiempos de viaje se cachean por par de puntos con TTL
  corto para no exceder ese límite.

---

## RF-05 — Barrios de la ruta sugerida
**Épica:** Búsqueda de ruta · **Componente:** backend + frontend

Como Usuario Final, quiero ver los barrios por los que pasa la ruta sugerida como una
secuencia de pasos, para entender el recorrido de un vistazo.

**Criterios de aceptación:**
- Dado que la ruta sugerida atraviesa 7 barrios o menos, cuando se muestra el resultado,
  entonces se listan todos en orden de recorrido.
- Dado que la ruta sugerida atraviesa más de 7 barrios, cuando se muestra el resultado,
  entonces se listan 7, distribuidos uniformemente a lo largo del trayecto, incluyendo siempre
  el primero y el último.
- El listado se presenta como una secuencia de pasos (no texto plano).
- Los barrios de cada ruta son datos cargados manualmente en la base de datos y se validan por
  inspección visual contra el trazado (GeoJSON) al momento de cargarlos — no hay validación
  geoespacial automática.
- Una ruta con recorrido de ida y de vuelta se modela como dos registros de ruta
  independientes.

---

## RF-06 — Costo del pasaje
**Épica:** Búsqueda de ruta · **Componente:** backend

Como Usuario Final, quiero ver cuánto cuesta el pasaje de la ruta sugerida, para saber cuánto
dinero llevar.

**Criterios de aceptación:**
- Dado que la ruta sugerida es urbana (dentro de Fusagasugá), cuando se muestra el resultado,
  entonces se presenta un único precio fijo, sin importar dónde se suba o baje el usuario.
- Dado que la ruta sugerida es intermunicipal (Chinauta, Pasca, Arbeláez), cuando se muestra
  el resultado, entonces se presenta una tabla de precios por punto de referencia de bajada
  (ej. "hasta el primer retorno: $3.500 / hasta el Hotel Chinauta Real: $5.000"), ordenada de
  menor a mayor según el punto de bajada.
- Cada ruta tiene una fecha de vigencia (`vigente_desde`) y la pantalla muestra la fecha de
  última actualización del precio.
- Tarifas diferenciales (estudiante, adulto mayor) quedan fuera de alcance este semestre — se
  declara explícitamente en la tabla de alcance del documento.

---

## RF-07 — Historial de búsquedas
**Épica:** Historial · **Componente:** backend

Como Usuario Final, quiero ver mis últimas búsquedas al iniciar sesión en cualquier
dispositivo, para no repetir la misma consulta.

**Criterios de aceptación:**
- El sistema guarda las últimas 6 búsquedas (origen + destino) por usuario, asociadas a su
  cuenta (no al dispositivo).
- Dado que el usuario inicia sesión en un dispositivo distinto, cuando abre su historial,
  entonces ve las mismas últimas 6 búsquedas que en cualquier otro dispositivo.
- Al registrar una búsqueda nueva que exceda las 6, se elimina automáticamente la más antigua.
- Persistencia: tabla `search_history(user_id, origin, destination, created_at)` con índice en
  `(user_id, created_at DESC)`.

---

## RF-08 — Caja de comentarios
**Épica:** Comentarios · **Componente:** backend + frontend

Como Usuario Final, quiero dejar un comentario visible con mi nombre de usuario y poder
editarlo o borrarlo mientras no haya sido respondido, para dar sugerencias de forma directa.

**Criterios de aceptación:**
- Cada comentario muestra el nombre de usuario de quien lo escribió (vinculado al perfil, no
  anónimo).
- El comentario debe tener entre 10 y 100 caracteres, no puede contener URLs y se valida
  contra un banco de palabras prohibidas.
- Dado que el comentario cumple la validación, cuando se envía, entonces aparece un mensaje de
  confirmación transitorio ("mensaje enviado") que desaparece solo, sin botón de interacción.
- El autor puede editar o borrar su comentario únicamente mientras esté pendiente de
  respuesta; una vez el administrador responde, el comentario queda bloqueado para
  edición/borrado.

---

## RF-09 — Aviso de congestión histórica
**Épica:** Búsqueda de ruta · **Componente:** backend

Como Usuario Final, quiero recibir un aviso de posible congestión en el tramo que voy a
tomar, para anticipar demoras.

**Criterios de aceptación:**
- La congestión se registra por tramo de una ruta (no por ruta completa), como una ventana
  horaria histórica (`hora_inicio`, `hora_fin`).
- Dado que la hora actual está dentro de los 30 minutos previos a `hora_inicio` o dentro de la
  ventana `[hora_inicio, hora_fin)`, cuando el usuario busca un trayecto que atraviesa ese
  tramo, entonces se muestra un aviso de posible congestión.
- Dado que el trayecto sugerido no atraviesa ningún tramo con ventana activa, cuando el
  usuario busca, entonces no se muestra ningún aviso.
- El aviso se presenta como posibilidad ("puede haber congestión"), nunca como una afirmación.
- El tramo con congestión se modela con `hora_inicio` y `hora_fin` (no un booleano); el aviso
  de 30 minutos antes y su desaparición al cierre se calculan en el dominio a partir de esas
  dos horas.
- Sin distinción por día de la semana este semestre (misma ventana todos los días) —
  limitación de alcance declarada explícitamente.

---

## RF-10 — Destino favorito
**Épica:** Búsqueda de ruta · **Componente:** backend + frontend

Como Usuario Final, quiero marcar un destino como favorito, para que la app lo pre-cargue al
abrir la búsqueda y me muestre de una vez el aviso de tranco habitual, sin escribirlo cada vez.

**Criterios de aceptación:**
- El usuario puede marcar un destino como favorito; solo tiene **uno activo a la vez** — marcar
  uno nuevo reemplaza al anterior (no es una lista de favoritos).
- Al **abrir la pantalla de búsqueda**, si el usuario tiene un destino favorito, el campo
  destino se pre-carga automáticamente con ese valor, antes de que el usuario pulse "buscar".
- Junto con la pre-carga, se muestra de inmediato el aviso de congestión habitual (RF-09) para
  esa ruta a la hora actual, sin necesidad de iniciar una búsqueda manualmente.
- El usuario puede sobrescribir el destino pre-cargado escribiendo uno distinto, sin que eso
  modifique su favorito guardado.
- El favorito se guarda en el backend asociado a la cuenta (persiste entre dispositivos, igual
  que RF-07).

---

## RF-11 — CRUD de rutas (Administrador)
**Épica:** Administración/CRUD · **Componente:** backend + frontend

Como Administrador, quiero crear, consultar, modificar y eliminar rutas, para mantener
actualizada la oferta de transporte que el sistema ofrece a los usuarios.

**Criterios de aceptación:**
- El administrador puede crear una ruta con: nombre, tipo (urbana/intermunicipal), trazado
  (GeoJSON), barrios/comunas asociados (RF-05) y tarifa(s) (RF-06).
- El administrador puede consultar el listado completo de rutas, incluidas las inactivas, con
  su estado visible.
- El administrador puede modificar cualquier campo de una ruta existente, incluidos trazado y
  tarifa (un cambio de tarifa actualiza `vigente_desde`, RF-06).
- "Eliminar" una ruta aplica **soft delete**: la ruta pasa a estado inactiva, no se borra el
  registro. Los usuarios dejan de verla en búsquedas nuevas (RF-04).
- El historial de búsquedas (RF-07) y los destinos favoritos (RF-10) que referencian una ruta
  inactiva se mantienen intactos, marcados como "ruta ya no disponible" — nada se rompe por
  llave foránea faltante.
- Solo un usuario con rol Administrador accede a estas operaciones (validado con Spring
  Security).

---

## RF-12 — Suspensión temporal y notificación
**Épica:** Administración/CRUD · **Componente:** backend + frontend

Como Administrador, quiero suspender temporalmente una ruta y avisar a quienes la usan seguido,
para que no se vean sorprendidos por una ruta fuera de servicio en días festivos o cívicos.

**Criterios de aceptación:**
- El administrador suspende una ruta indicando fecha/hora de inicio y de fin. Es distinto del
  soft delete de RF-11: la ruta sigue existiendo y vuelve a activarse sola al cerrar la ventana.
- Mientras una ruta está suspendida, el sistema no la ofrece como resultado de búsqueda (RF-04)
  y lo indica explícitamente si esa era la única opción para el trayecto pedido.
- Al suspender, se genera una **notificación in-app** (no push — coherente con la exclusión de
  notificaciones push en el alcance) para: (a) usuarios con esa ruta como favorita (RF-10), y
  (b) usuarios con esa ruta en **3 o más de sus últimas 6 búsquedas guardadas** (RF-07 — ese es
  el umbral operacional de "destino recurrente").
- La notificación in-app se muestra la próxima vez que el usuario abre la app o la pantalla de
  búsqueda, mientras la suspensión siga vigente.
- Reactivar una ruta suspendida antes de su fecha de fin es una acción manual del administrador.

---

## RF-13 — Panel de métricas de uso (Administrador)
**Épica:** Administración/CRUD · **Componente:** backend + frontend

Como Administrador, quiero ver un panel con las métricas de uso de la app, para saber si de
verdad está sirviendo y dónde enfocar el trabajo.

**Criterios de aceptación:**
- El panel muestra exactamente 5 métricas: (1) total de usuarios registrados, (2) número de
  búsquedas del día actual, (3) las 5 rutas más consultadas, (4) cantidad de comentarios
  pendientes de respuesta (mismo estado "pendiente" que usa RF-08/RF-14) y (5) suspensiones
  activas en este momento (RF-12).
- "Búsquedas del día" es el **día calendario actual en hora Colombia**, sin selector de rango:
  arrancar más simple y ampliar a un rango de fechas queda para una fase posterior si hace
  falta.
- El panel **no se actualiza en vivo**: muestra el estado del momento en que el administrador
  abre o recarga la pantalla, igual que cualquier otra vista del sistema. Sin polling ni
  WebSockets.
- Solo un usuario con rol Administrador accede a este panel (validado con Spring Security,
  igual que RF-11).
- Las 5 rutas más consultadas se calculan sobre el historial de búsquedas (RF-07) acumulado, no
  solo del día actual.

---

## RF-14 — Responder comentarios (Administrador)
**Épica:** Comentarios · **Componente:** backend + frontend

Como Administrador, quiero leer y responder los comentarios que dejan los usuarios, para
mantener un contacto directo con ellos y cerrar el ciclo que abre RF-08.

**Criterios de aceptación:**
- El administrador ve el listado de comentarios con su estado (pendiente / respondido), filtrable
  por pendientes primero — coherente con la métrica (4) de RF-13.
- Al responder, el comentario pasa a estado "respondido" y queda bloqueado para
  edición/borrado por parte del usuario (esto ya lo fija RF-08; aquí es la acción que dispara
  ese cambio de estado).
- Como las notificaciones push están fuera de alcance este semestre, el usuario **no recibe un
  aviso proactivo** cuando le responden. En su lugar, al iniciar sesión el sistema calcula si
  tiene respuestas nuevas desde su último ingreso y muestra un indicador visual (por ejemplo,
  un contador en el ícono de comentarios) — es un chequeo del propio backend al cargar la
  sesión, no una notificación push real.
- Una respuesta por comentario (no hilo de conversación); si el administrador necesita corregir
  su respuesta, la edita, no crea una segunda.
- Solo un usuario con rol Administrador puede responder (validado con Spring Security).

---

## Pendiente

Cargar RF-01 a RF-14 a Jira con su épica y componente — no se hizo en esta sesión ni en las
anteriores. Los requisitos no funcionales están grillados en
`docs/backlog/requisitos-no-funcionales.md`.
