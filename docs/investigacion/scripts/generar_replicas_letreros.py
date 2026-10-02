# -*- coding: utf-8 -*-
"""Regenera la sección de campo de letreros-replicas.html y las miniaturas de las fotos.

Entradas:  docs/investigacion/letreros-estilos.json     (clave "campo")
           docs/investigacion/letreros-procesados.json  (bitácora foto → estado)
Salidas:   docs/investigacion/letreros-recortes/<foto>.jpg  (miniaturas, lado mayor 600 px)
           docs/investigacion/letreros-replicas.html        (solo lo que está entre CAMPO:INICIO y CAMPO:FIN)

Uso, desde la raíz de la carpeta del curso:  python docs/investigacion/scripts/generar_replicas_letreros.py
Es idempotente: correrlo dos veces deja los mismos archivos. El resto del HTML no se toca.
"""
import json, os, re, sys
from html import escape
from PIL import Image, ImageOps

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
INV = os.path.join(RAIZ, "docs", "investigacion")
FOTOS = os.path.join(RAIZ, "docs", "fotos-letreros")
RECORTES = os.path.join(INV, "letreros-recortes")
HTML = os.path.join(INV, "letreros-replicas.html")
INI, FIN = "<!-- CAMPO:INICIO -->", "<!-- CAMPO:FIN -->"

ETIQUETA = {"modelado": "Modelado", "revisar": "Por revisar", "duplicado": "Duplicado", "ilegible": "Ilegible"}

CSS = """<style>
  .resumen { display:flex; flex-wrap:wrap; gap:8px; margin:8px 0 16px; }
  .chip { font-size:13px; padding:2px 10px; border-radius:99px; border:1px solid var(--line); background:var(--card); }
  .chip b { font-weight:700; }
  .badge { display:inline-block; font-size:12px; padding:0 8px; border-radius:99px; margin-left:6px; vertical-align:1px; }
  .b-modelado { background:#dff0e3; color:#1d5a2d; } .b-revisar { background:#fbecc9; color:#7a5a08; }
  .b-duplicado { background:#e6e6e6; color:#444; }  .b-ilegible { background:#f6d9d6; color:#8a1f16; }
  .par { display:flex; flex-wrap:wrap; gap:12px; align-items:flex-start; }
  .par img { width:100%; max-width:240px; height:auto; border-radius:8px; border:1px solid var(--line); background:#ddd; }
  .par .glass { flex:1 1 240px; min-width:0; }
  .placa-rect.bandas { padding:0; overflow:hidden; } .placa-rect.bandas div { padding:2px 10px; white-space:nowrap; }
  .placa-arco.campo { padding:12px 8px 6px; }
  .placa-arco.campo div { white-space:nowrap; }
  .tabla.campo { width:180px; }
  .tabla.arco { border-radius:46px 46px 0 0; overflow:hidden; }
  .tabla.campo div { white-space:nowrap; line-height:1.3; }
  .cod { font-family:'Archivo Black','Arial Black',sans-serif; font-size:12px; line-height:1.3; }
  .lista-rev { width:100%; border-collapse:collapse; font-size:14px; }
  .lista-rev td { padding:8px; border-bottom:1px solid var(--line); vertical-align:top; }
  .lista-rev img { width:120px; height:auto; border-radius:6px; border:1px solid var(--line); display:block; }
  .lista-rev code { word-break:break-all; }
</style>"""


def cargar(nombre):
    with open(os.path.join(INV, nombre), encoding="utf-8") as fh:
        return json.load(fh)


def miniatura(foto, caja):
    """Recorta la caja (px de la foto orientada) y guarda una miniatura. Devuelve la ruta relativa o None."""
    if not caja:
        return None
    dest = os.path.join(RECORTES, foto)
    os.makedirs(RECORTES, exist_ok=True)
    if not os.path.exists(dest):
        im = ImageOps.exif_transpose(Image.open(os.path.join(FOTOS, foto))).convert("RGB").crop(tuple(caja))
        im.thumbnail((600, 600), Image.LANCZOS)
        im.save(dest, quality=80, optimize=True)
    return "letreros-recortes/" + foto


def tam(texto, ancho, ch, tope, rel=1.0):
    return max(8, min(tope, ancho / (ch * max(len(texto), 1))) * rel)


def linea(l, ancho, ch, tope, fuente):
    est = []
    if l.get("bg"): est.append(f"background:{l['bg']}")
    if l.get("fg"): est.append(f"color:{l['fg']}")
    if l.get("transform"): est.append(f"text-transform:{l['transform']}")
    est.append(f"font-size:{tam(l['text'], ancho, ch, tope, l.get('relSize', 1.0)):.1f}px")
    return f'<div class="{fuente}" style="{";".join(est)}">{escape(l["text"])}</div>'


def placa(p):
    t = p["template"]
    if t == "PLACA_ARCO":
        cod = f'<div class="cod">{escape(p["codigo"])}</div>' if p.get("codigo") else ""
        filas = "".join(linea(l, 180, 0.5, 18, "f-narrow") if len(l["text"]) > 9 else linea(l, 180, 0.7, 22, "f-heavy")
                        for l in p["lines"])
        return f'<div class="placa-arco campo" style="background:{p["bg"]};color:{p["fg"]}">{cod}{filas}</div>'
    if t == "PLACA_RECT":
        borde = p.get("border", "#111")
        filas = "".join(linea(l, 150, 0.7, 15, "f-heavy") if len(l["text"]) <= 12 else linea(l, 150, 0.5, 15, "f-narrow")
                        for l in p["lines"])
        return f'<div class="placa-rect bandas" style="background:{p["bg"]};color:{p["fg"]};border-color:{borde}">{filas}</div>'
    if t == "TABLA_FRANJAS":
        d = p.get("direction", "UNICO")
        titulo = f'<div class="tabla-titulo">TABLA {escape(d)}</div>' if d in ("SUBIENDO", "BAJANDO") else ""
        cod = ""
        if p.get("codigo"):
            c0 = p["lines"][0].get("bg", "#fff")
            cod = f'<div class="cod" style="background:{c0};color:{p["lines"][0].get("fg", "#000")};text-align:center">{escape(p["codigo"])}</div>'
        borde = p.get("borde", "#000")
        filas = "".join(linea(l, 150, 0.5, 17, "f-narrow") for l in p["lines"])
        cls = "tabla campo arco" if p.get("contorno") == "arco" else "tabla campo"
        return f'<div class="tabla-wrap">{titulo}<div class="{cls}" style="border-color:{borde}">{cod}{filas}</div></div>'
    return ""


def titulo(l):
    if l.get("ruta"):
        return l["ruta"]
    p = max(l["placas"], key=lambda x: len(x["lines"]))
    return " · ".join(x["text"] for x in p["lines"][:3])


def tarjeta(l, bit, dups):
    foto = l["fotos"][0]
    est = bit[foto]["estado"]
    mini = miniatura(foto, bit[foto].get("recorte"))
    img = f'<img src="{mini}" alt="Foto {escape(foto)}" loading="lazy">' if mini else ""
    placas = "".join(placa(p) for p in l["placas"])
    notas = []
    if l.get("rutaNota"): notas.append(l["rutaNota"])
    if l.get("nota"): notas.append(l["nota"])
    if bit[foto].get("nota"): notas.append(bit[foto]["nota"])
    otras = dups.get(l["id"], [])
    if otras: notas.append("También aparece en: " + ", ".join(otras) + ".")
    nota = f'<p class="note">{escape(" ".join(notas))}</p>' if notas else ""
    return (f'<section class="card" id="{l["id"]}"><h3>{l["id"]} · {escape(titulo(l))}'
            f'<span class="badge b-{est}">{ETIQUETA[est]}</span></h3>'
            f'<p class="meta">Foto <code>{escape(foto)}</code>, 27-sep-2026</p>'
            f'<div class="par">{img}<div class="glass"><div class="row">{placas}</div></div></div>{nota}</section>')


def seccion(estilos, bit):
    campo = estilos["campo"]
    fotos = bit["fotos"]
    dups = {}
    for f, v in sorted(fotos.items()):
        if v["estado"] == "duplicado":
            dups.setdefault(v["duplicadoDe"], []).append(f)
    cuenta = {k: sum(1 for v in fotos.values() if v["estado"] == k) for k in ETIQUETA}
    chips = "".join(f'<span class="chip"><b>{cuenta[k]}</b> {ETIQUETA[k].lower()}</span>' for k in ETIQUETA)
    tarjetas = "".join(tarjeta(l, fotos, dups) for l in campo)
    filas = []
    for f, v in sorted(fotos.items()):
        if v["estado"] not in ("revisar", "ilegible"):
            continue
        mini = miniatura(f, v.get("recorte"))
        img = f'<img src="{mini}" alt="" loading="lazy">' if mini else "—"
        lc = f' → <a href="#{v["letrero"]}">{v["letrero"]}</a>' if v.get("letrero") else ""
        filas.append(f'<tr><td>{img}</td><td><code>{escape(f)}</code><span class="badge b-{v["estado"]}">'
                     f'{ETIQUETA[v["estado"]]}</span>{lc}<br>{escape(v.get("nota", ""))}</td></tr>')
    return "\n".join([
        INI, CSS,
        f'<h2>Réplicas de campo (fotos del 27-sep-2026)</h2>',
        f'<p class="lead">{sum(cuenta.values())} fotos propias, {len(campo)} letreros. Cada tarjeta pone el recorte de la foto junto a su réplica. '
        'Los colores están estimados a ojo, no muestreados. Las tablas de las fotos usan letra sin serifa; el gráfico oficial de 2020 usaba serif.</p>',
        f'<div class="resumen">{chips}</div>',
        f'<div class="grid">{tarjetas}</div>',
        '<h2>Fotos que necesitan ojo humano</h2>',
        '<p class="lead">Ilegibles o con lectura parcial. Sirve más una foto frontal, de cerca y sin reflejo que cualquier ajuste aquí.</p>',
        f'<div class="card"><table class="lista-rev">{"".join(filas)}</table></div>',
        FIN])


def main():
    estilos, bit = cargar("letreros-estilos.json"), cargar("letreros-procesados.json")
    sec = seccion(estilos, bit)
    with open(HTML, encoding="utf-8", newline="") as fh:
        html = fh.read()
    nl = "\r\n" if "\r\n" in html else "\n"
    sec = sec.replace("\n", nl)
    if INI in html:
        nuevo = re.sub(re.escape(INI) + r".*?" + re.escape(FIN), lambda m: sec, html, flags=re.S)
    else:
        ancla = "<h2>Réplicas con evidencia</h2>"
        assert ancla in html, "no encuentro dónde insertar la sección de campo"
        nuevo = html.replace(ancla, sec + nl + nl + "  " + ancla, 1)
    with open(HTML, "w", encoding="utf-8", newline="") as fh:
        fh.write(nuevo)
    print(f"ok: {len(estilos['campo'])} letreros, {len(bit['fotos'])} fotos")


if __name__ == "__main__":
    sys.exit(main())
