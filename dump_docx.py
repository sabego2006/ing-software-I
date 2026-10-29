import sys, docx
from docx.table import Table
from docx.text.paragraph import Paragraph
from docx.oxml.ns import qn

def iter_block(parent):
    body = parent.element.body
    for child in body.iterchildren():
        if child.tag == qn('w:p'):
            yield Paragraph(child, parent)
        elif child.tag == qn('w:tbl'):
            yield Table(child, parent)

try:
    d = docx.Document(sys.argv[1])
    out = []
    ti = 0
    for b in iter_block(d):
        if isinstance(b, Paragraph):
            t = b.text.strip()
            has_img = 'graphicData' in b._p.xml or 'w:drawing' in b._p.xml
            if has_img:
                out.append('[[IMAGEN EMBEBIDA]]')
            if not t:
                continue
            st = b.style.name
            if st.startswith('Heading') or st.startswith('Titulo') or st.startswith('Título'):
                out.append('\n### [%s] %s' % (st, t))
            else:
                out.append(t)
        else:
            ti += 1
            out.append('\n--- TABLA %d (%d filas x %d cols) ---' % (ti, len(b.rows), len(b.columns)))
            for r in b.rows:
                cells = []
                seen = set()
                for c in r.cells:
                    if id(c._tc) in seen: continue
                    seen.add(id(c._tc))
                    cells.append(' '.join(c.text.split()))
                out.append(' | '.join(cells))
            out.append('--- FIN TABLA %d ---' % ti)
    print('\n'.join(out))
except Exception as e:
    print(f"Error: {e}")
