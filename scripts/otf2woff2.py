"""
otf2woff2.py — converte i .otf di public/fonts/ in .woff2.

Uso:
    .venv/bin/pip install fonttools brotli
    .venv/bin/python scripts/otf2woff2.py public/fonts public/fonts/woff2

Non tocca i contorni: è solo un altro contenitore per lo stesso font (CFF
resta CFF), compresso con brotli. Serve dove il peso conta — una pagina
web — mentre il .otf va bene per il workbench e il .ttf serve ai PDF
(vedi scripts/otf2ttf.py e docs/DECISIONI.md §12).

Nota di licenza: anche questa è una modifica del file. Vale la stessa
domanda aperta con Lineto della conversione in .ttf.
"""
import os, sys
from fontTools.ttLib import TTFont

def main(src, dst):
    os.makedirs(dst, exist_ok=True)
    for n in sorted(os.listdir(src)):
        if not n.endswith(".otf"):
            continue
        f = TTFont(os.path.join(src, n))
        f.flavor = "woff2"
        out = os.path.join(dst, n[:-4] + ".woff2")
        f.save(out)
        f.close()
        print(f"  {n:28} -> {os.path.basename(out):28} {os.path.getsize(out)//1024:>3} KB")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
