# Evidencia — dependencias al día

**Comité de Desarrollo y Arquitectura #2 — 28 de septiembre de 2026**

Lo que pidió el docente es "dependencias al día". Esta evidencia muestra el estado real, medido hoy, y **qué actualizaciones NO se aplican y por qué**. Regla del proyecto (`CLAUDE.md`): se arranca en la versión vigente; los parches y menores se aplican sin ceremonia; **un salto de versión mayor es una decisión propia, con su tarjeta**.

| Repo | Commit medido | Comandos |
|---|---|---|
| `FusaRoute-BACKEND` | `eba1429` (rama `claude/gracious-clarke-2fqs2v`) | `mvn versions:display-dependency-updates versions:display-plugin-updates` |
| `FusaRoute-FRONTEND` | `2dbc102` (rama `claude/gracious-clarke-2fqs2v`) | `npm ci` → `npm outdated` y `npm audit` |

Ambos comandos se corrieron sobre una copia limpia del commit (`git archive`), sin modificar los repos.

---

## Backend — Java 25 · Spring Boot 3.5.16

### Dependencias directas con versión más nueva

| Dependencia | Actual | Disponible | Tipo de salto | Decisión |
|---|---|---|---|---|
| `spring-boot-starter-*` (web, security, data-jpa, oauth2-resource-server, test, testcontainers) y `spring-boot-maven-plugin` | 3.5.16 | 4.2.0-M2 | Mayor, **y es un milestone (pre-release)** | **No se aplica.** Excepción declarada en el `CLAUDE.md`: Spring Boot se queda en la última 3.5 porque es la primera vez del equipo con Spring y el material para resolver errores es de 3.x. El salto a 4 será decisión propia con su tarjeta |
| `spring-security-test` | 6.5.11 | 7.2.0-M2 | Mayor, milestone; ligado a Boot 4 | No se aplica, misma razón |
| `flyway-core` y `flyway-database-postgresql` | 11.7.2 | 13.8.0 | Mayor (dos versiones) | No se aplica este sprint: un mayor de la herramienta que crea el esquema no se mete la semana del comité. Queda para una tarjeta propia |
| `archunit-junit5` | 1.5.0 | 1.5.1 | Parche | Aplicable sin ceremonia; **pendiente de aplicar** |
| Checkstyle (dependencia del plugin) | 10.26.1 | 14.3.0 | Mayor | No se aplica: cambia reglas de estilo y puede romper el CI |

### Plugins de Maven con versión más nueva

| Plugin | Actual | Disponible | Decisión |
|---|---|---|---|
| `jacoco-maven-plugin` | 0.8.14 | 0.8.15 | Parche, **pendiente de aplicar** |
| `dependency-check-maven` (OWASP) | 12.1.3 | 12.2.2 (menor) y 13.0.0 (mayor) | La menor es aplicable; la mayor no se aplica sin tarjeta |

El reporte de Maven también lista cientos de artefactos de Jackson 2.21.4 → 2.22.3 bajo *Dependency Management*: son el BOM de Spring Boot, no dependencias que el proyecto declare. El `pom.xml` gestiona Jackson y otras versiones puntuales por vulnerabilidades (ver comentario del propio `pom.xml`, líneas 17-19), y la seguridad se controla con OWASP (`failBuildOnCVSS=7`), no comparando números de versión.

**Lectura honesta:** el backend NO está "al día" en sentido literal: hay 2 parches y 1 menor sin aplicar. Está al día **dentro de la línea elegida** (Java 25, Spring Boot 3.5.16, el último parche de esa línea), y lo que falta son saltos mayores diferidos a propósito.

---

## Frontend — Angular 21 · TypeScript 5.9 · Node 22

### `npm outdated`

| Paquete | Actual | Wanted (rango del `package.json`) | Latest | Tipo | Decisión |
|---|---|---|---|---|---|
| `typescript` | 5.9.3 | 5.9.3 | 7.0.2 | Mayor (dos) | **No se puede aplicar:** `@angular/compiler-cli` 21.2.24 declara `typescript >=5.9 <6.1` como peer (verificado en `node_modules`). Con Angular 21, TypeScript 5.9 es el techo práctico |
| `vitest` | 4.1.11 | 4.1.11 | 5.0.2 | Mayor | No se aplica: mayor, sin tarjeta |
| `jsdom` | 28.1.0 | 28.1.0 | 30.1.1 | Mayor (dos) | No se aplica: mayor, solo entorno de pruebas |

Todo lo demás (los paquetes `@angular/*` en 21.2.24, `rxjs`, `tslib`) figura **al día**: no aparece en `npm outdated`.

### `npm audit` (con dependencias de desarrollo incluidas)

```
found 0 vulnerabilities
```

---

## Limitaciones

- **`npm audit` y OWASP no son lo mismo:** `npm audit` consulta la base de avisos de npm; el frontend **no tiene análisis OWASP propio**. Lo que sí cubre OWASP Dependency-Check es el backend (`pom.xml:203`).
- **Estas cifras son de hoy.** Una nueva CVE o versión mañana cambia el resultado; por eso la métrica de seguridad de RNF-05 la mide el CI en cada build y no este documento.
- **`.npmrc` con `legacy-peer-deps=true`** (workaround declarado en el propio archivo): `@angular/service-worker` exige `@angular/core` 21.2.24 y npm resuelve 21.2.22. Es deuda técnica conocida y documentada, a revisar en el próximo bump de Angular.
- **Ejecución:** `npm ci` falló la primera vez por la longitud de la ruta de trabajo (limitación de Windows); se repitió desde una ruta corta y terminó correctamente (470 paquetes).
