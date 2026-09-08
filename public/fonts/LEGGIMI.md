# Replicall — i file del font vanno qui, e non entrano nel repo

Questa cartella è **vuota di proposito**. Serve al workbench e a Storybook per
mostrare la style guide nella tipografia vera del marchio; i file binari
**non si committano** e **non si distribuiscono col registry** (D3, licenza
Webflow del sito istituzionale — `.gitignore` li esclude già).

## Cosa mettere qui

Tre file, con questi nomi esatti:

| file | peso | note |
|---|---|---|
| `replicall-300.otf` | 300 — Light | oggi non usato dal design system |
| `replicall-400.otf` | 400 — Regular | corpo del testo, input, tabelle |
| `replicall-700.otf` | 700 — Bold | il peso marcato |

**Sono tutti quelli che esistono.** `tassullo.it` dichiara la famiglia in
questi tre pesi e basta — verificato leggendo le `@font-face` del sito, che
li serve dal CDN Webflow come `ReplicaLL-Light.otf`, `ReplicaLL-Regular.otf`,
`ReplicaLL-Bold.otf`. Sono gli stessi file che carica il sito.

Se hai solo alcuni pesi, mettili lo stesso: i mancanti degradano al font di
sistema per quel peso, e la pagina resta leggibile.

Se preferisci convertirli in `.woff2` (più leggeri), va benissimo: cambia le
tre righe `src:` in `src/index.css`, sostituendo `format('opentype')` con
`format('woff2')` e l'estensione.

## ⚠ 500 e 600 non esistono, e il design system li usa

Il v1 costruisce la gerarchia su **600** (×13) e **500** (×2), il v2 su
`font-semibold` (×14) e `font-medium` (×3). Nessuno dei due pesi è nella
famiglia. Quando il font si carica, la sostituzione prevista dal CSS manda:

- **600 → 700** — il semibold diventa bold;
- **500 → 400** — il medium sparisce dentro il corpo del testo.

Non è un guasto da riparare in questa cartella: è una scelta di gerarchia da
prendere **vedendola**, ed è esattamente il motivo per cui vale la pena
caricare il font nel workbench prima di scrivere le primitive. In carico a
**M2.1** (`typography`).

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
fa**, Studio compreso. D3 resta chiusa al default.
