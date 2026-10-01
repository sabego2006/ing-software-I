"""Recorta una zona de una foto de letrero a resolución completa.
Uso: python recortar.py <foto> <x0> <y0> <x1> <y1> <salida.jpg> [ancho_max]
Las coordenadas son fracciones (0-1) de la foto ya orientada. Imprime la caja en px originales."""
import sys
from PIL import Image, ImageOps
f, x0, y0, x1, y1, out = sys.argv[1], *map(float, sys.argv[2:6]), sys.argv[6]
wmax = int(sys.argv[7]) if len(sys.argv) > 7 else 900
im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
W, H = im.size
caja = (int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H))
c = im.crop(caja)
if c.width > wmax:
    c = c.resize((wmax, int(c.height * wmax / c.width)), Image.LANCZOS)
c.save(out, quality=90)
print(caja)
