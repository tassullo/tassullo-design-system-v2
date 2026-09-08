"""
otf2ttf.py — OTF (contorni CFF, cubiche) → TTF (contorni glyf, quadratiche).

Uso:
    python3 -m venv .venv && .venv/bin/pip install fonttools
    .venv/bin/python scripts/otf2ttf.py public/fonts public/fonts/ttf

Perché esiste (2026-09-08, docs/DECISIONI.md §12).

I PDF di Anagrafe si generano con reportlab («Niente HTML-to-PDF», suo
docs/PIANO.md), e reportlab accetta SOLO contorni TrueType: su un .otf di
fonderia muore con "postscript outlines are not supported". Replica LL è
consegnata in .otf, quindi senza questa conversione il canale PDF non esiste.

La conversione NON è una ri-etichettatura: le cubiche di Bézier del CFF
vengono approssimate con quadratiche (cu2qu) entro una tolleranza. Tutto il
resto — nomi dei glifi, metriche orizzontali, kerning GPOS, cmap, OS/2 e i
suoi bit di licenza — viene preservato identico, ed è stato verificato che lo
sia (avanzate e side bearing: 0 differenze su 846 glifi × 8 facce).

Le due trappole, entrambe silenziose, entrambe prese sul campo:

  · `maxp.compile()` esplode se i bordi dei glifi non sono stati ricalcolati
    (`AttributeError: 'Glyph' object has no attribute 'xMin'`);
  · la `post` di un OTF è v3.0, che i nomi dei glifi NON li memorizza — stanno
    nel charset del CFF, che qui si butta. Senza passare a v2.0 prima di
    salvare, metà famiglia si riapre come `glyph00638` e le alternative
    stilistiche (`a.ss02`) perdono il nome. Non dà errore: si scopre solo
    confrontando i due file.

Nota di licenza: la conversione MODIFICA il file del font. Autorizzata da
Francesco l'8 settembre 2026; resta da confermare con Lineto (EULA).
"""
import sys, os
from fontTools.ttLib import TTFont, newTable
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.ttGlyphPen import TTGlyphPen

TOLLERANZA = 1.0  # unita' em; il valore usato dagli strumenti standard

def converti(src, dst):
    f = TTFont(src)
    if 'glyf' in f:
        raise SystemExit(f"{src}: e' gia' TrueType")
    upem = f['head'].unitsPerEm
    glyphset = f.getGlyphSet()
    glyf = newTable('glyf')
    glyf.glyphOrder = f.getGlyphOrder()
    glyf.glyphs = {}
    for nome in f.getGlyphOrder():
        pen = TTGlyphPen(glyphset)
        glyphset[nome].draw(Cu2QuPen(pen, TOLLERANZA * upem / 1000, reverse_direction=True))
        glyf[nome] = pen.glyph()
    f['glyf'] = glyf
    # I bordi vanno ricalcolati prima di maxp: senza, i glifi non hanno xMin
    # e maxp.recalc solleva AttributeError.
    for nome in glyf.glyphOrder:
        glyf[nome].recalcBounds(glyf)

    f['maxp'] = maxp = newTable('maxp')
    maxp.tableVersion = 0x00010000
    maxp.maxZones = 1
    for campo in ('maxTwilightPoints','maxStorage','maxFunctionDefs','maxInstructionDefs',
                  'maxStackElements','maxSizeOfInstructions','maxComponentElements','maxComponentDepth'):
        setattr(maxp, campo, 0)
    maxp.compile(f)

    f['loca'] = newTable('loca')
    f['head'].indexToLocFormat = 0
    f['head'].glyphDataFormat = 0

    if 'gasp' not in f:
        f['gasp'] = gasp = newTable('gasp')
        gasp.version = 0
        gasp.gaspRange = {0xFFFF: 0x0F}

    # I nomi dei glifi nell'OTF stanno nel charset del CFF, e la sua `post`
    # e' di norma v3.0 -- che i nomi NON li memorizza. Se non si passa a
    # v2.0 prima di salvare, alla riapertura del TTF meta' famiglia diventa
    # `glyph00638` e le alternative stilistiche (`a.ss02`) spariscono come
    # nomi. Verificato: succede, ed e' silenzioso.
    post = f['post']
    post.formatType = 2.0
    post.extraNames = []
    post.mapping = {}
    post.glyphOrder = f.getGlyphOrder()

    for t in ('CFF ', 'VORG'):
        if t in f: del f[t]

    f.sfntVersion = '\000\001\000\000'
    f.save(dst)
    f.close()

if __name__ == '__main__':
    src_dir, dst_dir = sys.argv[1], sys.argv[2]
    os.makedirs(dst_dir, exist_ok=True)
    for n in sorted(os.listdir(src_dir)):
        if not n.endswith('.otf'): continue
        d = os.path.join(dst_dir, n[:-4] + '.ttf')
        converti(os.path.join(src_dir, n), d)
        print(f"  {n:28} -> {os.path.basename(d):28} {os.path.getsize(d)//1024:>4} KB")
