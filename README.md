# Ingeniería de Software I — Material del curso

Repo de **material y entregables** de la asignatura Ingeniería de Software I (Universidad de Cundinamarca, sede Fusagasugá, 2026-2).

> **Este NO es el repo del proyecto FusaRoute.** Aquí vive el material de clase, los entregables `.docx`, los `.pptx` de las clases y los HTML/scripts de apoyo. El código del proyecto vive en sus propios repos:
>
> - Backend: <https://github.com/sabego2006/FusaRoute-BACKEND>
> - Frontend: <https://github.com/sabego2006/FusaRoute-FRONTEND>

## Equipo

- **Santiago Bermúdez Gómez** — `sabego2006@gmail.com`
- **Angélica María Aranguren Rozo**

## Cómo clonar (Angélica)

```bash
git clone https://github.com/sabego2006/ing-software-I.git
cd ing-software-I
```

Este repo **no** trae los repos de backend ni de frontend. Clónalos por aparte cuando los necesites:

```bash
# desde una carpeta hermana, no dentro de ing-software-I
git clone https://github.com/sabego2006/FusaRoute-BACKEND.git
git clone https://github.com/sabego2006/FusaRoute-FRONTEND.git
```

## Qué hay aquí

| Carpeta / archivo | Qué es |
|---|---|
| `actividad 3 ing soft_APA*.docx` | Entregable de la Actividad 3 (FusaRoute). Se conservan todas las versiones, incluido el `.ORIGINAL-BACKUP` y los `.BACKUP-PRE-V3` por política del proyecto. |
| `ACTIVIDAD CLASE *.pdf` | PDFs de las actividades publicadas por el docente en clase. |
| `Clase*.pptx`, `Clase * *.pptx` | Diapositivas que proyecta el docente. |
| `Guia Presentación Comite.pdf` | Guía del comité de desarrollo y arquitectura. |
| `fusaroute-actividad3*.html`, `presentacion_fusaroute.html` | Versiones HTML legibles de los entregables y de la presentación del comité. |
| `build_v3.py` | Script que reconstruye `actividad 3 ing soft_APA v3.docx`. |
| `CLAUDE.md` | Instrucciones para Claude Code sobre este proyecto. |
| `.claude/` | Configuración local de Claude Code (skills, hooks). |

## Qué NO hay aquí (y por qué)

- **Código del backend y frontend.** Viven en sus propios repos (ver arriba). Aquí solo se referencian.
- **Audios de clase** (formato `.m4a`). Pesan demasiado y no son referencia para Angélica.
- **Archivos temporales de Word/PowerPoint** (`~$*.docx`, `~$*.pptx`). Se regeneran al abrir los originales.
- **Carpetas `extracted_v2/` y `extracted_v3/`.** Son salida temporal del script `build_v3.py`.

## Convenciones de commits

Conventional Commits, en español para mensajes, en inglés para el `type`:

```
feat: agregar plantilla de presentación del comité
fix: corregir tabla de métricas en la v3 del entregable
docs: actualizar README con instrucciones de clonado
chore: ignorar archivos temporales de Word
```

## Política de respaldos

Toda versión vieja de un entregable se conserva con sufijo `.BACKUP-…` o `.ORIGINAL-BACKUP.docx`. **No borrar** estos archivos — son el historial del proyecto y pueden pedir al docente verlos.
