# Evidencia SOLID — FusaRoute Backend

**Comité de Desarrollo y Arquitectura #2 — 28 de septiembre de 2026**
**Equipo:** Santiago Bermúdez Gómez · Angélica María Aranguren Rozo

**Fuente de las referencias:** repo `sabego2006/FusaRoute-BACKEND`, rama `claude/gracious-clarke-2fqs2v`, commit `eba1429` (contiene `main` al commit `12979f0` más RF-03). Todos los `archivo:línea` de abajo se extrajeron de ese commit con `git grep -n` / `git show`, no de memoria. Si la rama cambia, las líneas pueden moverse: se citan contra ese commit.

Rutas relativas a `src/main/java/com/fusaroute/` (código) y `src/test/java/com/fusaroute/` (pruebas).

---

## Tabla de principios SOLID

| Principio | Cómo se aplica en FusaRoute | Evidencia (archivo:línea) |
|---|---|---|
| **S — Responsabilidad única** | Un caso de uso por clase, y las reglas de negocio viven en objetos de dominio aparte: `Email` valida formato, `PasswordPolicy` valida complejidad, `RegisterUserService` solo orquesta. El manejo de errores HTTP está separado en `GlobalExceptionHandler`, no dentro de los controllers. | `application/usecase/RegisterUserService.java:23` · `domain/model/Email.java:16` · `domain/model/PasswordPolicy.java:22` · `infrastructure/adapter/in/web/GlobalExceptionHandler.java:37` · 7 servicios, uno por caso de uso: `ChangePasswordService:21`, `GetProfileService:12`, `GetRouteDetailService:12`, `ListActiveRoutesService:18`, `LoginService:26`, `UpdateProfileService:22` |
| **O — Abierto/cerrado** | Los servicios dependen de puertos (interfaces), no de tecnologías. Cambiar BCrypt por otro algoritmo o JPA por otro almacenamiento es escribir un adaptador nuevo, sin editar el caso de uso. | `domain/port/out/PasswordHasherPort.java:7` · `domain/port/out/UserRepositoryPort.java:12` · `domain/port/out/TokenIssuerPort.java:12` · `domain/port/out/RouteRepositoryPort.java:13` |
| **L — Sustitución de Liskov** | Cada adaptador implementa su puerto y los servicios solo conocen el puerto. Las pruebas de los servicios sustituyen los puertos por dobles (`@Mock`) sin que el servicio note la diferencia. | `infrastructure/adapter/out/security/BCryptPasswordHasher.java:16` · `infrastructure/adapter/out/security/JwtTokenIssuer.java:23` · `infrastructure/adapter/out/persistence/UserPersistenceAdapter.java:16` · `infrastructure/adapter/out/persistence/RoutePersistenceAdapter.java:19` · dobles en `application/usecase/LoginServiceTest.java:36-42` |
| **I — Segregación de interfaces** | Un puerto de entrada por caso de uso, cada uno con un solo método de negocio; un controller depende solo de los casos de uso que expone. No existe un "UserService" gordo. | `domain/port/in/RegisterUserUseCase.java:9` · `LoginUseCase.java:7` · `GetProfileUseCase.java:6` · `UpdateProfileUseCase.java:6` · `ChangePasswordUseCase.java:4` · `ListActiveRoutesUseCase.java:8` · `GetRouteDetailUseCase.java:6` |
| **D — Inversión de dependencias** | El servicio (capa application) recibe puertos del dominio por constructor. La infraestructura implementa esos puertos, y el ensamblado se hace en un solo lugar, `UseCaseConfig`, con `@Bean`: los servicios no llevan anotaciones de Spring. | `application/usecase/RegisterUserService.java:25-28` (campos y constructor con `UserRepositoryPort` y `PasswordHasherPort`) · `infrastructure/config/UseCaseConfig.java:33` (clase) y `:56-58` (bean `registerUserUseCase`) |

---

## Verificación automatizada de la arquitectura

| Qué se verifica | Dónde | Detalle |
|---|---|---|
| Las capas apuntan hacia adentro (Domain ← Application ← Infrastructure) | `architecture/HexagonalArchitectureTest.java:14-33` | ArchUnit `layeredArchitecture()`: `domain` solo accesible desde application e infrastructure; `application` solo desde infrastructure; `infrastructure` desde nadie. |
| El dominio no conoce frameworks | `architecture/HexagonalArchitectureTest.java:35-45` | `domain..` no puede depender de `org.springframework..`, `jakarta.persistence..` ni `com.fasterxml.jackson..`. |
| El CI corre las pruebas y los gates | `.github/workflows/ci.yml:24` | `mvn -B verify`. |
| Umbral de cobertura | `pom.xml:145` | JaCoCo, mínimo `0.70` de instrucciones sobre los paquetes `com.fusaroute.domain.*` y `com.fusaroute.application.*` (el gate cubre `domain` y `application`, no solo `domain`). |
| Vulnerabilidades | `pom.xml:203` | OWASP Dependency-Check con `failBuildOnCVSS=7`; supresiones en `config/owasp/suppression.xml`. |

---

## Limitaciones declaradas (lo que esta evidencia NO demuestra)

- **Cobertura real no medida aquí.** El `0.70` es el umbral que bloquea el build, no un porcentaje medido por nosotros en este documento. El número real sale del reporte JaCoCo de `mvn verify`; no lo citamos porque no lo ejecutamos para redactar esto.
- **Pruebas:** el código tiene 101 anotaciones `@Test` en 19 archivos (conteo con `git grep`). Es un conteo de pruebas escritas, no de pruebas que pasan.
- **Liskov está poco ejercitada:** cada puerto tiene una sola implementación real, así que la sustitución se ejerce únicamente con dobles en pruebas. No hay pruebas de contrato que corran contra varias implementaciones del mismo puerto. Es coherente con el principio, pero no es una demostración fuerte.
- **La arquitectura hexagonal no cubre todo el proyecto aún:** solo están implementados registro, login, perfil (RF-03, en la rama, pendiente de PR a `main`) y catálogo de rutas. Búsqueda de ruta, historial, favoritos, comentarios y administración no existen todavía.
