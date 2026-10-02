"""Genera hojas de contacto (6 fotos por hoja, con nombre) para ubicar las placas.
Uso: python hoja_contacto.py <carpeta_fotos> <carpeta_salida>
Las fotos traen la orientación en EXIF, por eso se aplica exif_transpose."""
import sys, glob, os
from PIL import Image, ImageDraw, ImageOps

fotos, salida = sys.argv[1], sys.argv[2]
os.makedirs(salida, exist_ok=True)
archivos = sorted(glob.glob(os.path.join(fotos, "*.jpg")))
W, H = 500, 667  # 3:4 por foto
for n in range(0, len(archivos), 6):
    hoja = Image.new("RGB", (W * 3, H * 2), "white")
    d = ImageDraw.Draw(hoja)
    for i, f in enumerate(archivos[n:n + 6]):
        im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
        im.thumbnail((W, H))
        x, y = (i % 3) * W, (i // 3) * H
        hoja.paste(im, (x, y))
        d.rectangle([x, y, x + 150, y + 16], fill="black")
        d.text((x + 3, y + 2), os.path.basename(f)[9:15], fill="yellow")
    hoja.save(os.path.join(salida, f"hoja_{n // 6 + 1:02d}.jpg"), quality=85)
print(len(archivos), "fotos")
