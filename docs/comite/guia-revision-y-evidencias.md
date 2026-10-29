# Guía de revisión manual y mapa de evidencias — FusaRoute

**Para:** Santiago Bermúdez · Angélica Aranguren
**Objetivo:** que cada integrante pueda leer su propio código sin IA, archivo por archivo, y responder ante el comité *"¿dónde están los 12 factores, los logs y SOLID?"* señalando archivos reales.
**Glosario visual de apoyo:** [`glosario-fusaroute.html`](glosario-fusaroute.html) (ábrelo con doble clic).

## Contra qué código están hechas las citas

Todas las rutas y líneas de este documento se leyeron en **`origin/main`** el **2026-10-28**, con `git show origin/main:<ruta>`:

| Repo | Commit | Nota |
|---|---|---|
| `FusaRoute-BACKEND` | `240a294` (PR #53, SonarCloud) | La copia local de Santiago estaba en `feature/SCRUM-181-sonarqube`, 24 commits atrás y con cambios sin commitear. |
| `FusaRoute-FRONTEND` | `bab4380` (PR #17, map-view) | La copia local estaba en `feature/SCRUM-154-aviso-congestion-detalle`, 1 commit adelante. |

Si miras tu carpeta local sin actualizar, **los números de línea no van a coincidir**. Si `main` avanza, las líneas pueden moverse: re-verifica con el comando de la sección A.1.

Este documento no repite `docs/comite-2/evidencias/evidencia-solid.md`; esa evidencia se citó contra el commit `eba1429` y varias líneas ya se movieron. Aquí se re-citó contra `240a294`.

---

# PARTE A — Guía de revisión manual (sin IA)

## A.1 Preparación (5 min, cada quien en su máquina)

```bash
cd FusaRoute-BACKEND  && git fetch origin && git checkout main && git pull && git log -1 --oneline
cd ../FusaRoute-FRONTEND && git fetch origin && git checkout main && git pull && git log -1 --oneline
```

El `git log -1` debe mostrar `240a294` (backend) y `bab4380` (frontend) o uno posterior. Si tienes cambios sin guardar, haz `git stash` antes del checkout.

**Método de lectura (aplica a todos los archivos):**
1. Lee primero el nombre del archivo y su paquete: ¿en qué capa vive?
2. Lee los `import`: dicen de quién depende. Un `import org.springframework` en el dominio sería una alarma.
3. Lee la firma pública (clase, constructor, métodos), no el cuerpo.
4. Hazte las preguntas de la tabla correspondiente. Si no puedes responder una, anótala: es lo que te van a preguntar.
5. Cierra el archivo y explícalo en voz alta en 30 segundos. Si no puedes, vuelve a leerlo.

## A.2 Backend — orden de lectura (de adentro hacia afuera)

Ruta base: `src/main/java/com/fusaroute/`. La arquitectura es hexagonal: las flechas de dependencia apuntan **hacia el dominio**.

| # | Qué abrir | Qué preguntarse |
|---|---|---|
| 1 | `domain/model/` — `Route`, `Coordinate`, `Email`, `PasswordPolicy` | ¿Hay algún `import` de Spring, JPA o Jackson? (No debería: lo vigila ArchUnit.) ¿Dónde se valida un correo o una coordenada? ¿Qué lanza si es inválido? |
| 2 | `domain/port/in/` — `ListActiveRoutesUseCase`, `LoginUseCase`… | ¿Cuántos métodos tiene cada puerto? ¿Qué recibe y qué devuelve (records `Command`/`Result`)? |
| 3 | `domain/port/out/` — `RouteRepositoryPort`, `PasswordHasherPort`, `TravelTimePort`… | ¿Qué necesita el negocio del mundo exterior? ¿Dónde está documentado el contrato? (ver `PasswordHasherPort.java:11-18`) |
| 4 | `application/usecase/` — `ListActiveRoutesService`, `LoginService`, `SearchRouteService` | ¿De qué puertos depende por constructor? ¿Tiene alguna anotación de Spring? (No: se cablea en `UseCaseConfig`.) ¿Qué decisión de negocio toma? |
| 5 | `infrastructure/adapter/in/web/` — `RouteController`, `AuthController`, `GlobalExceptionHandler` | ¿Qué verbo y ruta HTTP expone? ¿Llama a un caso de uso o hace lógica? ¿Dónde se traduce una excepción a código HTTP? |
| 6 | `infrastructure/adapter/out/persistence/` — adapter, mapper, entidad JPA, `SpringData*Repository` | ¿Qué puerto implementa? ¿Dónde se transforma entidad JPA a objeto de dominio? |
| 7 | `infrastructure/adapter/out/security/` y `.../maps/` | ¿Qué algoritmo/servicio concreto esconden detrás del puerto? |
| 8 | `infrastructure/config/` — `UseCaseConfig`, `SecurityConfig`, `JwtConfig` | ¿Quién crea cada caso de uso? ¿Qué rutas son públicas? ¿Qué pasa si falta `JWT_SECRET`? |
| 9 | `src/main/resources/application.properties` y `application-{dev,pre,prod}.properties` | ¿Qué valores salen de variables de entorno (`${...}`)? ¿Qué cambia entre perfiles? |
| 10 | `src/main/resources/db/migration/V1…V9` | ¿Qué tabla crea cada migración? ¿Cuál es la última versión? ¿Por qué no se edita una migración ya aplicada? |
| 11 | `src/test/java/com/fusaroute/architecture/` | ¿Qué reglas arquitectónicas se verifican automáticamente? |
| 12 | `pom.xml`, `Dockerfile`, `render.yaml`, `.github/workflows/` | ¿Cómo se compila, se prueba y se despliega? ¿Qué puede romper el build? |

## A.3 Frontend — orden de lectura

Ruta base: `src/app/`.

| # | Qué abrir | Qué preguntarse |
|---|---|---|
| 1 | `app.config.ts` | ¿Qué proveedores globales se registran (HTTP, interceptor, router, service worker)? |
| 2 | `app.routes.ts` | ¿Qué rutas son públicas y cuál lleva `authGuard`? ¿Por qué `loadComponent` (carga perezosa)? |
| 3 | `../environments/environment.ts` y `environment.prod.ts` | ¿De dónde sale la URL del backend? ¿Cuándo se reemplaza un archivo por otro? (`angular.json`, `fileReplacements`) |
| 4 | `models/` | ¿Qué interfaces espejan los DTO del backend? |
| 5 | `services/` | ¿Quién es el único autorizado a usar `HttpClient`? ¿Qué endpoint llama cada método? |
| 6 | `core/` — `interceptors/auth.interceptor.ts`, `guards/auth.guard.ts`, `connectivity.service.ts` | ¿Cuándo se adjunta el Bearer? ¿Qué pasa ante un 401? |
| 7 | `pages/` — `routes/routes-list`, `routes-detail`, `route-search`, `auth/login` | ¿Qué signals guardan el estado (`loading`, `errorMessage`, datos)? ¿Qué muestra cada estado en el HTML? |
| 8 | `components/` — `map-view`, `toast`, `totp-enroll` | ¿Qué `input()`/`output()` expone cada uno? |
| 9 | `lib/` | ¿Son funciones puras? ¿Tienen prueba? |
| 10 | `*.spec.ts` | ¿Qué se simula (mock) y qué se verifica? |
| 11 | `angular.json`, `vercel.json`, `.github/workflows/` | ¿Cómo se construye y dónde se despliega? ¿Corre lint en CI? (No: ver B.7.) |

## A.4 Traza de punta a punta — backend: `GET /api/routes`

El catálogo público de rutas. Abre los archivos **en este orden** (rutas relativas a `src/main/java/com/fusaroute/` salvo la última).

| Paso | Archivo:línea | Qué mirar |
|---|---|---|
| 0 | `infrastructure/config/SecurityConfig.java:79-82` | `GET /api/routes` está en `permitAll()`: no pide token. |
| 1 | `infrastructure/adapter/in/web/RouteController.java:22` y `:45-48` | `@RequestMapping("/api/routes")`; `list()` llama al caso de uso y mapea con `RouteResponse::from`. El controller solo conoce **interfaces** de casos de uso (constructor, `:31-41`). |
| 2 | `domain/port/in/ListActiveRoutesUseCase.java:8-11` | Puerto de entrada: un solo método, `listActive()`. |
| 3 | `application/usecase/ListActiveRoutesService.java:18-38` | Constructor con `RouteRepositoryPort` y `Clock` (`:23-26`). `listActive()` filtra activas, aplica tarifa vigente de hoy y ordena con `Collator` (`:29-38`). **Aquí vive la regla de negocio.** |
| 4 | `domain/port/out/RouteRepositoryPort.java:13-18` | Puerto de salida: `findAll()` y `findById()`. El servicio no sabe qué base de datos hay detrás. |
| 5 | `infrastructure/adapter/out/persistence/RoutePersistenceAdapter.java:19` y `:27-31` | Implementa el puerto; `findAll()` es `@Transactional(readOnly = true)` y mapea con `RoutePersistenceMapper::toDomain`. |
| 6 | `infrastructure/adapter/out/persistence/RoutePersistenceMapper.java:25-42` y `:53-68` | Entidad JPA → `Route` de dominio. `parsePath` convierte el GeoJSON `[lng,lat]` en `Coordinate(lat,lng)`: la inversión es **a propósito** (`:50-51`). |
| 7 | `infrastructure/adapter/out/persistence/SpringDataRouteRepository.java:6` | Extiende `JpaRepository<RouteJpaEntity, Long>`: Spring genera el SQL. |
| 8 | `infrastructure/adapter/out/persistence/RouteJpaEntity.java:40-79` | `@Entity @Table(name="routes")`; colección de barrios, tarifas y la columna `path_geojson`. |
| 9 | `src/main/resources/db/migration/V1__crear_usuarios_y_rutas.sql:52-142` | La tabla `routes` (`:52`), `path_geojson JSONB` (`:67`), índice `ix_routes_status` (`:78`), `route_neighborhoods` (`:91`), `fares` (`:118`). |
| ★ | `infrastructure/config/UseCaseConfig.java:65-68` | Dónde se une todo: `new ListActiveRoutesService(routeRepository, clock)`. El `Clock` se fija a `America/Bogota` (`:60-63`). |

**Ejercicio:** cierra este documento y recorre el camino de memoria. Cada vez que cruces de capa, di en voz alta qué interfaz estás cruzando.

## A.5 Traza de punta a punta — frontend: pantalla `/rutas`

| Paso | Archivo:línea | Qué mirar |
|---|---|---|
| 1 | `app.routes.ts:8-10` | La ruta `rutas` carga `RoutesListComponent` de forma perezosa. Sin `canActivate`: es pública (`:4`). |
| 2 | `pages/routes/routes-list/routes-list.component.ts:14-17` | Tres signals: `routes`, `loading`, `errorMessage`. |
| 3 | `routes-list.component.ts:23-42` | `ngOnInit` → `loadRoutes()`; `:31` llama `routeService.getAllPublicRoutes().subscribe(...)`. Si falla, **no inventa datos** (`:37`). |
| 4 | `routes-list.component.html:22-47` | `@if` para los estados y `@for ... track route.id` para la lista. |
| 5 | `services/route.service.ts:12-18` | `apiUrl = ${environment.apiUrl}/api/routes`; `getAllPublicRoutes()` es un `http.get<Route[]>`. |
| 6 | `environments/environment.ts:15` | `apiUrl: 'http://localhost:8080'`. En producción lo reemplaza `environment.prod.ts:15` (`angular.json:46-51`). |
| 7 | `core/interceptors/auth.interceptor.ts:23-50` | Se ejecuta en **cada** petición HTTP: adjunta el Bearer si hay token (`:31-37`) y ante 401 fuera de `/api/auth/` hace logout y manda a `/login` (`:43-46`). Se registra en `app.config.ts:12-14`. |
| 8 | Backend: `RouteController.java:45-48` | El request llega al paso 1 de la traza A.4. |

**Segunda traza — detalle con mapa (GeoJSON):** `routes-detail.component.ts:62-69` (`loadRoute` → `getRouteById`) → `route.service.ts:21-23` (`GET /api/routes/{id}`) → `routes-detail.component.ts:32-42` (`computed mapData`, convierte `[lng,lat]` a `{lat,lng}` en `:36`) → `components/map-view/map-view.component.ts:48-50` (`input.required`) y `:68-77` (`map.data.addGeoJson(...)`).

## A.6 Ejercicio por persona (hacerlo solo, sin IA)

Cada quien traza **`POST /api/auth/login`** y llena la tabla. Santiago parte del backend y Angélica del frontend; luego intercambian y se corrigen.

| Paso | Archivo:línea (llénalo tú) | ¿Qué hace? | ¿Qué capa es? |
|---|---|---|---|
| Pantalla de login | `pages/auth/login/...` | | |
| Servicio | `services/auth.service.ts` (pista: `:43-47`) | | |
| Interceptor | `core/interceptors/auth.interceptor.ts:28` | ¿Por qué no adjunta token aquí? | |
| Controller | `AuthController.java` (pista: `:48-50`) | | |
| Caso de uso | `LoginService.java` (pista: `:84-148`) | ¿Qué excepciones lanza? ¿Por qué el segundo factor? | |
| Puertos que usa | `LoginService.java:62-67` | | |
| Adaptadores reales | `BCryptPasswordHasher`, `JwtTokenIssuer`, `SamstevensTotpAdapter` | | |
| Cableado | `UseCaseConfig.java:100` | | |
| Vuelta al frontend | `auth.service.ts:58-68` (`applySession`) | ¿Dónde se guarda el token? | |

## A.7 Preguntas probables del comité y respuesta corta

| Pregunta | Respuesta | Dónde |
|---|---|---|
| ¿Por qué los servicios no tienen `@Service`? | Para que la capa `application` no dependa de Spring y se pruebe sin levantar contexto. Los cablea una sola clase de configuración. | `UseCaseConfig.java:46-52`, `:65-68` |
| ¿Cómo garantizan que el dominio no dependa de frameworks? | Con una prueba ArchUnit que falla el build si `domain..` importa Spring, JPA o Jackson. | `HexagonalArchitectureTest.java:35-45` |
| ¿Cómo controlan los cambios de esquema? | Flyway: cada cambio es un `.sql` versionado y revisable en el PR; Hibernate solo valida (`ddl-auto=validate`). | `application.properties:15-27`, `db/migration/` |
| ¿Dónde están los secretos? | En variables de entorno, nunca en el repo. `.env` está ignorado. Si falta o es débil `JWT_SECRET`, la app no arranca. | `JwtConfig.java:32-45`, `.gitignore:47-49` |
| ¿Por qué CORS no usa `*`? | Se enumeran los orígenes permitidos por perfil. | `SecurityConfig.java:119-131` |
| ¿Cómo prueban el rendimiento? | Micrometer registra p50/p95/p99 y se exponen en `/actuator/prometheus`. | `application.properties:33-44` |
| ¿Qué pasa si Google Maps falla? | Responde 503 (falla del proveedor) y el frontend reintenta en modo offline. | `GlobalExceptionHandler.java:142-147`, `route-search.component.ts:58-83` |
| ¿Dónde se guarda el token en el frontend? | En `localStorage` (`auth.service.ts:58-63`). Es un riesgo conocido (XSS); el token de enrolamiento sí vive solo en memoria (`:29-32`). Decláralo, no lo ocultes. | `auth.service.ts` |

---

# PARTE B — Mapa de evidencias para el comité

**Leyenda de veredicto:** ✔ Implementado · ◐ Parcial · ✖ No implementado. Cada ◐ y ✖ trae *cómo decirlo con honestidad* y una propuesta de arreglo (**solo propuesta; no se tocó código**).

## B.1 Los 12 factores — backend

Rutas relativas a la raíz del repo `FusaRoute-BACKEND`.

| # | Factor | Evidencia (archivo:línea) | Veredicto | Qué decir |
|---|---|---|---|---|
| 1 | Código base | Un repo para el backend y otro para el frontend (`README.md`). `render.yaml:21` despliega solo commits con CI verde. | ✔ | "Una base de código por servicio, rastreada en Git, con varios despliegues (dev/prod) a partir de ella." |
| 2 | Dependencias | Declaradas en `pom.xml` (`:49-162`, desde `<dependencies>`); plugins con versión fija (JaCoCo `:172`). Capa de dependencias cacheada en `Dockerfile:11-12`. | ✔ (con matiz) | "Todo está declarado en el `pom.xml`." **Matiz:** no hay `mvnw`; Maven queda fijado solo por la imagen Docker (`Dockerfile:6`). |
| 3 | Configuración | `application.properties:6` (`spring.config.import=optional:file:./.env`), `:9` (`SPRING_PROFILE`), `:10` (`PORT`). Perfiles con `${DB_URL}`, `${JWT_SECRET}`, etc. (`application-dev.properties:5-7,12,18,25`). `.env` ignorado (`.gitignore:48`). `JwtConfig.java:32-45` aborta el arranque si el secreto falta o es débil. | ✔ | "El código no cambia entre ambientes; cambian las variables de entorno y el perfil." **Matiz:** `docker-compose.yml:12,37` fija `dev_password`, solo para la base local. |
| 4 | Servicios de apoyo | Postgres por `DB_URL` (`application-*.properties:5-8`); Google Maps con URL intercambiable (`application.properties:54`). | ✔ | "La base y Maps son recursos adjuntos por URL/credencial; cambiarlos no requiere cambiar código." |
| 5 | Build, release, run | Build: `Dockerfile:6-19`. Run: `Dockerfile:22-37`. CI: `.github/workflows/ci.yml:44` (`mvn -B verify`). Release: Render solo si pasan los checks (`render.yaml:19-21`). | ◐ | "Etapas separadas: compila el CI/Docker, ejecuta Render." **Brecha:** no hay versiones etiquetadas; el `pom.xml:13` sigue en `0.0.1-SNAPSHOT`. *Propuesta:* tags `v0.x` en cada release. |
| 6 | Procesos | `SecurityConfig.java:73` (`STATELESS`) + JWT; intentos fallidos en la base (`V1:28`). | ◐ | "La API es sin estado: la sesión viaja en el JWT." **Brecha:** hay un caché Caffeine en memoria (`application.properties:48-50`) que es estado local; es válido solo con una instancia. |
| 7 | Vinculación de puertos | `application.properties:10` (`server.port=${PORT:8080}`), `Dockerfile:35-36`; Tomcat embebido (`pom.xml:52`, `spring-boot-starter-web`). | ✔ | "La app se autocontiene y exporta HTTP por el puerto que el entorno le asigna." |
| 8 | Concurrencia | `render.yaml:14` (plan free, una instancia); `application-prod.properties:14` (pool Hikari de 5). | ✖ | "Hoy corre una sola instancia; no escalamos horizontalmente." **Honesto:** el caché local asume un solo nodo. *Propuesta:* documentar la decisión como límite del plan gratuito. |
| 9 | Desechabilidad | `Dockerfile:33` (`ExitOnOutOfMemoryError`, `SerialGC`), `render.yaml:18` (`healthCheckPath: /health`). | ◐ | "Arranque rápido y reinicio automático ante falta de memoria." **Brecha:** **no** existe `server.shutdown=graceful`. *Propuesta:* una línea en `application.properties`. |
| 10 | Paridad dev/prod | Mismas migraciones Flyway y `ddl-auto=validate` en los tres perfiles (`application-*.properties`). | ◐ | "Mismo motor (Postgres) y mismo esquema versionado." **Brecha:** versiones distintas — compose usa Postgres 16 (`docker-compose.yml:7`), las pruebas 15 (`UserPersistenceAdapterIT`), Supabase 17 (`database-backup.yml:21`). El perfil `pre` está diferido (`application-pre.properties:1-5`). |
| 11 | Logs | Salida estándar por defecto de Spring Boot. Único logger propio: `GlobalExceptionHandler.java:46`. | ◐ | Ver B.3. |
| 12 | Procesos administrativos | `.github/workflows/database-backup.yml:5` (cron diario, `pg_dump`, retención 7 días `:46`). Flyway corre dentro del arranque. | ◐ | "Los respaldos y las migraciones son procesos aparte del servicio." **Brecha:** no hay un *runner* de tareas administrativas únicas; `diagnostico.yml` es solo un stub. |

**Resumen honesto para el comité:** cumplimos con claridad 1, 2, 3, 4 y 7; cumplimos parcialmente 5, 6, 9, 10, 11 y 12; el 8 no aplica hoy por el plan gratuito. No digas "cumplimos los 12" sin matices.

## B.2 Los 12 factores — frontend (columna corta)

| Factor | Evidencia | Veredicto | Qué decir |
|---|---|---|---|
| 1 Código base | Repo propio, Vercel despliega desde Git. | ✔ | |
| 2 Dependencias | `package.json`, `package-lock.json`, `.nvmrc`, `engines.node 22.x` (`package.json:14-16`). | ✔ | |
| 3 Configuración | `environment.ts:15` y `environment.prod.ts:15`; cambio de archivo en build (`angular.json:46-51`). | ✖ | **La configuración es de compilación, no de ejecución:** la URL queda dentro del bundle; un build por ambiente. Díselo así al comité. `googleMapsApiKey` es `''` en `main` (`environment.prod.ts:16`), así que el mapa no carga en producción hasta que aterrice SCRUM-168. |
| 5 Build/release/run | CI: `ci.yml` (`npm ci`, `ng build`, `test:ci`, Sonar condicional); `vercel.json` SPA. | ◐ | No hay Docker ni Nginx. |
| 11 Logs | Ver B.3. | ✖ | |
| Resto | Frontend estático: 6, 7, 8, 9 no aplican en el mismo sentido. | n/a | Di "aplican al backend". |

## B.3 Logs

| Capa | Dónde | Qué se registra |
|---|---|---|
| Backend — logger | `GlobalExceptionHandler.java:46` (SLF4J `LoggerFactory`) | `:145` `log.warn("Tiempo de viaje no disponible…")`; `:168` `log.error("Error no controlado", e)` con la traza solo en el servidor. |
| Backend — configuración | **No hay** `logback-spring.xml`, ni `logging.*` en `application*.properties`, ni MDC/correlation-id, ni JSON. | Lo único que cambia por perfil es `spring.jpa.show-sql` (dev `true`, `application-dev.properties:10`; pre/prod `false`). |
| Backend — métricas (observabilidad) | `application.properties:33-44`; `SearchRouteService.java:23,38,63,93` (timer `fusaroute.search.route.latency` con etiqueta `mode`); `GoogleMapsClient.java:54-66` (timers ok/error y contadores de caché hit/miss). | Latencia p50/p95/p99, aciertos de caché, errores de Maps. Endpoints en `/actuator/prometheus`; `/actuator/**` exige token completo (`SecurityConfig.java:75,90`). |
| Frontend | `main.ts:6` (`console.error`), `app.config.ts:11` (`provideBrowserGlobalErrorListeners`), `toast.service.ts`. | Solo errores al usuario; no hay logger propio. |

**Qué decir (honesto):** *"Cumplimos el factor 11 en lo esencial: la app escribe a la salida estándar y la plataforma (Render) la recoge; no gestionamos archivos de log. Lo que registramos explícitamente son los errores no controlados y la indisponibilidad de Maps. La observabilidad la cubrimos con métricas Micrometer/Actuator (RNF-01). Lo que no tenemos aún es logging de negocio en los casos de uso, niveles por perfil ni correlation-id."*

**Propuesta (no implementada):** un `logging.level.com.fusaroute=DEBUG` en dev / `INFO` en prod en los `application-*.properties`, y `log.info` en los puntos de decisión de `LoginService` (sin datos sensibles).

## B.4 SOLID — backend

| Principio | Mejor ejemplo (archivo:línea) | Por qué cuenta | Honestidad |
|---|---|---|---|
| **S** Responsabilidad única | `infrastructure/adapter/out/persistence/RoutePersistenceMapper.java:18-69` | Su única razón de cambio es el formato de persistencia: traduce entidad JPA a `Route` (y el GeoJSON). Otros: `Email.java` valida el formato; `PasswordPolicy.java` la complejidad. | **Contraejemplo:** `GlobalExceptionHandler.java:43-209` concentra el manejo de *todas* las excepciones y cambia con cada excepción nueva. |
| **O** Abierto/cerrado | `application/usecase/SearchRouteService.java:26,29` depende de `TravelTimePort`; un nuevo proveedor es un adaptador nuevo junto a `GoogleMapsClient`, sin editar el servicio. Los datos nuevos llegan por migraciones (V6, V7). | Se extiende sin modificar. | **Parcial:** solo hay una implementación real del puerto, y `SearchRouteService.java:36-95` repite la lógica online/offline en vez de usar una estrategia. |
| **L** Sustitución de Liskov | `BCryptPasswordHasher.java:33-39` cumple el contrato escrito en `PasswordHasherPort.java:11-18` (hash nulo ⇒ `false`, haciendo el mismo trabajo). | Cualquier implementación del puerto puede sustituirse sin que el servicio lo note. | **El más débil:** cada puerto tiene una sola implementación real; la sustitución solo se ejerce con dobles de prueba (Mockito, `SecretCipherPort` anónimo en `UserPersistenceAdapterIT`). No hay pruebas de contrato. Dilo. |
| **I** Segregación de interfaces | `domain/port/in/ListActiveRoutesUseCase.java:8-11` (un método); `domain/port/out/TrafficSectorRepositoryPort.java:10-18` (un método). | Un puerto de entrada por caso de uso; ningún `UserService` gordo. | `TotpPort` y `UserRepositoryPort` tienen 4 métodos: más anchos, pero cohesivos. |
| **D** Inversión de dependencias | `application/usecase/ListActiveRoutesService.java:20-26` recibe `RouteRepositoryPort` y `Clock` por constructor; `RoutePersistenceAdapter.java:19` lo implementa; `UseCaseConfig.java:65-68` lo cablea. Lo hace cumplir `HexagonalArchitectureTest.java:24-32`. | La capa alta depende de abstracciones del dominio. | **Excepción declarada:** `InternalMapsProbeController.java:33-37` inyecta `GoogleMapsClient` concreto; su propio Javadoc lo presenta como excepción deliberada. |

## B.5 SOLID — frontend

| Principio | Ejemplo | Veredicto |
|---|---|---|
| **S** | `lib/route-steps.ts:8` (función pura); `toast.service.ts:14-24` (solo mensajes); `connectivity.service.ts:15-35` (solo estado de red); `route.service.ts:11` (solo HTTP de rutas). | ✔ claro |
| **O** | `app.config.ts:12-14` (`withInterceptors([...])` permite agregar comportamiento sin editar los existentes); `map-view.component.ts:48-52` (se reutiliza con `input()`). | ◐ débil: no hay polimorfismo ni estrategia. |
| **L** | Solo `interface RouteDetail extends Route` (`route.model.ts:39`) y `TotpConfirmResponse extends LoginResponse` (`totp.model.ts:22`): subtipado estructural, sin jerarquía de clases. | ✖ **No hay ejemplo honesto.** Di: "En el frontend casi no hay herencia, así que Liskov apenas aplica". |
| **I** | `connectivity.service.ts:20` expone `online.asReadonly()`; servicios separados por tema (`Auth`, `User`, `Totp`, `Route`, `Health`); modelos separados en `auth.model.ts`, `route.model.ts`, `totp.model.ts`. | ◐ moderado |
| **D** | Inyección con `inject()` (`auth.interceptor.ts:24-25`, `route-search.component.ts:26-28`); en pruebas se sustituye con `{ provide: RouteService, useValue: ... }` (`routes-list.component.spec.ts:12`). | ◐ parcial: se depende de clases concretas, sin `InjectionToken` ni interfaz. Además el código mezcla `inject()` y constructor (`route.service.ts:14`) y `eslint.config.js:19-20` desactiva `prefer-inject`. |

## B.6 Seguridad y calidad (evidencia de apoyo)

| Tema | Dónde | Detalle |
|---|---|---|
| JWT | `SecurityConfig.java:91-95,107-117`; `JwtConfig.java:25-55`; `JwtTokenIssuer.java` | No hay filtro propio: se usa el *resource server* de Spring. Algoritmo HS256 (`JwtConfig.java:54`). Dos tipos de token: completo (`SCOPE_full`) y de enrolamiento TOTP (`SCOPE_totp_enroll`). |
| CORS | `SecurityConfig.java:119-131` | Orígenes enumerados, nunca `*`; vienen de `CORS_ALLOWED_ORIGINS`. |
| CSRF | `SecurityConfig.java:72` | Deshabilitado, coherente con API sin sesión y token Bearer. |
| ArchUnit | `src/test/.../architecture/HexagonalArchitectureTest.java:14-45`, `TestArchitectureTest.java:19-29` | Capas hacia adentro y dominio sin frameworks. |
| JaCoCo | `pom.xml:169-212` (mínimo `0.70` de instrucciones, `:199-200`) | **Solo** sobre `com.fusaroute.domain.*` y `application.*`; infraestructura sin umbral. **No citamos el porcentaje real**: lo da el reporte de `mvn verify`. |
| Checkstyle | `pom.xml:213-241`, `config/checkstyle/checkstyle.xml` | Corre en `validate` y rompe el build. No hay Spotless. |
| OWASP Dependency-Check | `pom.xml:262-304` (`failBuildOnCVSS=7`), `.github/workflows/security.yml` | Perfil `security`, **no** va en el `mvn verify` por defecto. |
| SonarCloud | `ci.yml:53-58`, `pom.xml:43-47` | Se salta si no hay `SONAR_TOKEN`; el *quality gate* es informativo. |
| Testcontainers | `UserPersistenceAdapterIT.java` | Única prueba que lo usa; se omite sin Docker. |
| Pruebas frontend | `angular.json:74-84`; `route.service.spec.ts:20-37` | Vitest con `HttpTestingController`; 20 archivos `.spec.ts`. |

## B.7 Inconsistencias a corregir antes del comité

Detectadas al auditar `origin/main`. Si el docente las encuentra primero, pierden credibilidad; mejor llegar con ellas anotadas.

**Backend**
1. `render.yaml:22-45` **no declara `TOTP_ENCRYPTION_KEY`**, pero `application-prod.properties:27` la exige sin valor por defecto. Si nadie la puso a mano en Render, producción no arranca.
2. `docker-compose.yml:33-40` no pasa `JWT_SECRET` ni `TOTP_ENCRYPTION_KEY`, que `application-dev.properties:18,25` exigen (no lo ejecuté; puede que se carguen por otro medio).
3. El README dice que `/api/routes/search` aún no existe, pero `RouteController.java:55` ya lo implementa.
4. El comentario de `Dockerfile:16-18` afirma que el CI corre OWASP en `mvn verify`; OWASP corre aparte, en `security.yml`.

**Frontend**
5. `README.md:34` manda a hacer `cp .env.example .env`, pero nada del código lee `.env` ni `NG_API_KEY`.
6. El README habla de `saveSession()`; el código usa `applySession()` (`auth.service.ts:58`).
7. El lint (`angular.json:85-90`) no corre en el CI.
8. Comentario corrupto en `environment.prod.ts:9` ("…en este archivo.dor es inspeccionable").
9. `googleMapsApiKey` vacío en `main`: el mapa no funciona en producción hasta SCRUM-168.

## B.8 Limitaciones de este documento

- No ejecuté el build, las pruebas ni los contenedores: todo se leyó del código. No afirmo cobertura real ni que las pruebas pasen.
- No pude leer `.env.example` de ninguno de los repos (un *hook* lo bloqueó); los nombres de variables salen de los `application-*.properties` y de `render.yaml`.
- Los números de línea corresponden a los commits indicados arriba y se mueven con cada merge.
- Qué exige exactamente el docente ("pleno conocimiento", rúbricas) **no está escrito en ningún archivo de la carpeta del curso**; lo que sí está es lo de 12 factores en `docs/clases/Clase 4 IF.pptx` y `Clase5 IS.pptx`, y SOLID en `docs/backlog/historias-rf01-rf15.md`. Confirma con el docente qué espera exactamente.
