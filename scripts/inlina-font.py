"""
inlina-font.py — sostituisce il segnaposto /*REPLICA_FONTFACE*/ del sorgente
archiviato della demo con i @font-face di Replica in data URI.

Uso:
    .venv/bin/python scripts/inlina-font.py docs/carattere-demo.html demo.html

Perché serve: il CSP degli artifact ammette file di font solo da
fonts.gstatic.com, quindi Replica non si può servire da nessun'altra parte
e va inlinata. Il file prodotto contiene i binari del font e **non si
committa** — è la ragione per cui il sorgente in docs/ tiene il segnaposto
invece del risultato.
"""
import base64, io, os, sys

FACCE = [("300", "normal"), ("400", "normal"), ("400-italic", "italic"),
         ("700", "normal"), ("900", "normal")]

def main(sorgente, destinazione, fonts="public/fonts/woff2"):
    blocchi = ["""/* Replica LL — inlinata perche' il CSP degli artifact ammette file di font
   solo da fonts.gstatic.com. Sono gli stessi tagli che tassullo.it serve. */"""]
    for nome, stile in FACCE:
        peso = nome.split("-")[0]
        percorso = os.path.join(fonts, f"replicall-{nome}.woff2")
        b = base64.b64encode(open(percorso, "rb").read()).decode()
        blocchi.append(
            "@font-face {\n"
            "  font-family: 'Replicall';\n"
            f"  src: url(data:font/woff2;base64,{b}) format('woff2');\n"
            f"  font-weight: {peso};\n"
            f"  font-style: {stile};\n"
            "  font-display: swap;\n"
            "}"
        )
    h = io.open(sorgente, encoding="utf8").read()
    if "/*REPLICA_FONTFACE*/" not in h:
        raise SystemExit("segnaposto /*REPLICA_FONTFACE*/ non trovato")
    io.open(destinazione, "w", encoding="utf8").write(
        h.replace("/*REPLICA_FONTFACE*/", "\n".join(blocchi), 1)
    )
    print(f"scritto {destinazione}: {os.path.getsize(destinazione)//1024} KB")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
