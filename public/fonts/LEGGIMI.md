# Replicall — i file del font vanno qui, e non entrano nel repo

Questa cartella è **vuota di proposito**. Serve al workbench e a Storybook per
mostrare la style guide nella tipografia vera del marchio; i file binari
**non si committano** e **non si distribuiscono col registry** (D3, licenza
Webflow del sito istituzionale — `.gitignore` li esclude già).

Il carattere è **Replica LL**, di [Lineto](https://lineto.com/typefaces/replica).

## Formato

**`.woff2` è la scelta migliore** — è il formato dei font per il web, pesa un
terzo o meno dell'`.otf` a parità di disegno, ed è supportato da ogni browser
in uso. Se arriva un `.otf` va bene lo stesso: ogni `@font-face` in
`src/index.css` dichiara **entrambe** le fonti, `.woff2` per prima, e il
browser usa quella che trova. Non c'è niente da modificare nel codice in
nessuno dei due casi.

Se Roberto ha solo `.otf` o `.ttf`, si convertono in `.woff2` in un minuto —
ma solo se la licenza copre la conversione, che è una domanda da fare a lui.

## Nomi dei file

| file | peso CSS | file originale Lineto |
|---|---|---|
| `replicall-300.woff2` | 300 | `ReplicaLL-Light` |
| `replicall-400.woff2` | 400 | `ReplicaLL-Regular` |
| `replicall-400-italic.woff2` | 400 corsivo | `ReplicaLL-Italic` |
| `replicall-700.woff2` | 700 | `ReplicaLL-Bold` |
| `replicall-700-italic.woff2` | 700 corsivo | `ReplicaLL-BoldItalic` |
| `replicall-800.woff2` | 800 | `ReplicaLL-Heavy` |

Stessi nomi con estensione `.otf` se il formato è quello. Mancano di proposito
`LightItalic` e `HeavyItalic`: nessuna app li usa: se servissero, si aggiungono
due `@font-face` in `src/index.css`.

Se hai solo alcuni file, mettili lo stesso: i pesi mancanti degradano al font
di sistema **per quel peso soltanto**, e la pagina resta leggibile.

## ⚠ 500 e 600 non esistono — e il design system li usa

La famiglia ha **quattro pesi: 300 Light, 400 Regular, 700 Bold, 800 Heavy**
(più i corsivi). **Medium e Semibold non esistono**, e non è che manchino i
file: non esistono nel carattere. Verificato sui nomi degli asset pubblicati
da Lineto e sulle `@font-face` di `tassullo.it`, che ne serve tre — Light,
Regular, Bold.

Ma il v1 costruisce la gerarchia su **600** (×13) e **500** (×2), e il v2 su
`font-semibold` (×14) e `font-medium` (×3). Quando il font si carica, la
sostituzione prevista dal CSS dà:

| scritto | reso con Replicall |
|---|---|
| `font-medium` (500) | **400 Regular** — indistinguibile dal corpo del testo |
| `font-semibold` (600) | **700 Bold** |

Quattro gradini scritti, **due resi**. Oggi il difetto non si vede, perché
nessuna app carica il font e San Francisco quei pesi ce li ha: salterebbe
fuori il giorno in cui un'app carica finalmente Replicall.

Non si ripara in questa cartella: è una scelta di gerarchia da prendere
**guardandola**, ed è in carico a **M2.1** (`typography`). **Heavy 800** è
dichiarato apposta — è il gradino in più che il carattere offre e che il v1
non ha mai usato, e potrebbe essere lì che la gerarchia ritrova il quarto
livello.

## Come si accende

Da sé. Le `@font-face` sono già in `src/index.css`, che il workbench e
Storybook importano entrambi, e `public/` è servito da tutti e due i server
(verificato). Basta ricaricare.

**Finché la cartella è vuota**, la console mostra un 404 per ciascun file
mancante e tutto degrada al font di sistema: è il comportamento voluto, non un
guasto. È anche il modo di vedere a colpo d'occhio se i file ci sono.

## Cosa NON succede

Il tema distribuito alle app (`registry/tassullo/theme/tassullo-theme.css`)
**non cambia**: continua a dichiarare solo lo stack, `'Replicall'` con i suoi
fallback di sistema, e a non portare nessun file. Un'app che vuole il font lo
carica per conto suo, esattamente come nel v1 — cosa che oggi **nessuna app
fa**, Studio compresa. D3 resta chiusa al default.
