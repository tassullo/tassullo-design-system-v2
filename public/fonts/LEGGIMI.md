# Replicall — i file del font vanno qui, e non entrano nel repo

I file servono al workbench e a Storybook per mostrare la style guide nella
tipografia vera del marchio. **Non si committano** e **non si distribuiscono
col registry** (D3, licenza Lineto — `.gitignore` li esclude già), quindi chi
clona il repo non li ha e vede il fallback di sistema: è normale, e questa
pagina dice come rimediare.

**Stato al 2026-09-08: gli otto file ci sono**, forniti da Francesco
(`~/Downloads/REPLICA/`, licenza Lineto).

Il carattere è **Replica LL**, di [Lineto](https://lineto.com/typefaces/replica).

## Formato — e perché un formato solo non basta

`woff2` serve **solo al browser**. Non lo legge nient'altro: né il generatore
di PDF, né Word, né macOS. Il font desktop non è quindi un ripiego: è il
**sopra-insieme**. Da un `.ttf` si ricava tutto, `woff2` compreso; dal `woff2`
si ricava solo la pagina web.

| canale | formato che serve |
|---|---|
| interfaccia (questa cartella) | `.woff2`, oppure `.otf` |
| **PDF** (reportlab, Anagrafe) | **`.ttf`**, e solo `.ttf` — convertiti, in `ttf/` |
| Word (`python-docx`) | nessuno: non incorpora font — resta **Arial**, come nel v1 |

Il vincolo del PDF è misurato, non supposto: reportlab accetta solo contorni
TrueType e sui `.otf` di fonderia fallisce con *«postscript outlines are not
supported»*. I file consegnati sono `.otf`, quindi per i PDF non vanno bene
così come sono — **per questo esistono i `.ttf` convertiti in `ttf/`**.

## Formato dei file presenti

Gli otto file sono **`.otf`** con contorni **CFF**, ~157 KB l'uno. Per il
browser vanno benissimo: `src/index.css` li dichiara con
`format('opentype')` e si caricano tutti e otto (verificato,
`document.fonts` li riporta `loaded`).

Un `.woff2` peserebbe circa un quarto (~40 KB), ma convertirli **modifica il
file**, e questa è una domanda per Lineto, non una scelta tecnica. Finché la
risposta non c'è, `.otf` e amen: sono ~1,2 MB che carica solo il workbench, in
locale, e nessuna app.

**Bit di licenza nei file** (`OS/2.fsType`, letto con `fontTools`): **4 —
Preview & Print** su tutti e otto. È il permesso di incorporamento
*dichiarato dal file*: consente di incorporare per visualizzare e stampare —
cioè, in linea di principio, dentro un PDF — ma non per l'editing. Non è la
licenza: la tabella `name` dei file dice esplicitamente che nessun uso è
consentito senza il consenso di Lineto e il rispetto della sua EULA
(<https://lineto.com/licensing>). Le due domande da fare restano quelle:
**conversione** dei file e **generazione da server**.

## I `.ttf` per i PDF — convertiti, in `ttf/`

`ttf/` contiene le stesse otto facce con **contorni TrueType**, ricavate dagli
`.otf` con `scripts/otf2ttf.py`. Servono al canale PDF: reportlab accetta solo
contorni TrueType e su un `.otf` di fonderia muore con *«postscript outlines
are not supported»*.

Sono anche loro **fuori dal repo**: vanno copiati a mano dove gira la
generazione dei PDF (oggi: il backend di Anagrafe). Per rigenerarli, se un
giorno arrivano font aggiornati:

```
python3 -m venv .venv && .venv/bin/pip install fonttools
.venv/bin/python scripts/otf2ttf.py public/fonts public/fonts/ttf
```

**Cosa è stato verificato**, perché una conversione di font non si dichiara:

- avanzate e side bearing **identici** — 0 differenze su 846 glifi × 8 facce,
  quindi il testo non si rimpagina;
- nomi dei glifi, kerning GPOS, `cmap`, `OS/2` (peso e `fsType`) preservati;
- scarto massimo dei contorni **0,16/1000 em** nel caso peggiore, cioè 0,7
  micron a 12pt — il limite garantito dalla tolleranza cu2qu è comunque
  1/1000 em (4 micron a 12pt);
- reportlab registra tutte e otto le facce, e il PDF di prova
  (`ttf/specimen-replicall.pdf`) contiene **8 `/FontFile2`**, cioè le otto
  facce incorporate come sottoinsiemi TrueType, accentate ed euro compresi.

⚠ **Licenza**: la conversione *modifica il file del font*. Autorizzata da
Francesco l'8 settembre 2026, **da confermare con Lineto** — insieme all'altra
domanda aperta, la generazione da server.

## ⚠ 500 e 600 non esistono — e il design system li usa

La famiglia ha **quattro pesi: 300 Light, 400 Regular, 700 Bold, 900 Heavy**
(più i corsivi). **Medium e Semibold non esistono**, e non è che manchino i
file: non esistono nel carattere.

Ma il v1 costruisce la gerarchia su **600** (×13) e **500** (×2), e il v2 su
`font-semibold` (×14) e `font-medium` (×3). Quando il font si carica, la
sostituzione prevista dal CSS dà:

**Misurato**, col font caricato, sulla larghezza della stessa stringa a 40px:

| `font-weight` | larghezza | rende |
|---|---|---|
| 300 | 475.20 px | Light |
| 400 | 496.41 px | Regular |
| **500** (`font-medium`) | **496.41 px** | **Regular — identico a 400** |
| **600** (`font-semibold`) | **529.20 px** | **Bold — identico a 700** |
| 700 | 529.20 px | Bold |
| 900 (`font-black`) | 536.41 px | Heavy |

Quattro gradini scritti, **due resi**, e le larghezze coincidono alla seconda
cifra decimale: non è un'approssimazione, è lo stesso file. Nelle app il
difetto non si vede ancora, perché nessuna carica il font e San Francisco
quei pesi ce li ha — salterebbe fuori il giorno in cui una lo caricasse.

Non si ripara in questa cartella: è una scelta di gerarchia da prendere
**guardandola**, ed è in carico a **M2.1** (`typography`). **Heavy 800** è
dichiarato apposta — è il gradino in più che il carattere offre e che il v1
non ha mai usato, e potrebbe essere lì che la gerarchia ritrova il quarto
livello.

## Come si accende

Da sé. Le `@font-face` sono già in `src/index.css`, che il workbench e
Storybook importano entrambi, e `public/` è servito da tutti e due i server
(verificato). Basta ricaricare.

Se un file manca, quel peso — e solo quello — degrada al font di sistema, con
un 404 in console. È il comportamento voluto.

## Cosa NON succede

Il tema distribuito alle app (`registry/tassullo/theme/tassullo-theme.css`)
**non cambia**: continua a dichiarare solo lo stack, `'Replicall'` con i suoi
fallback di sistema, e a non portare nessun file. Un'app che vuole il font lo
carica per conto suo, esattamente come nel v1 — cosa che oggi **nessuna app
fa**, Studio compresa. D3 resta chiusa al default.
