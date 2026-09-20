# Tassullo Design System 2.0

Fonte unica dello stile visivo delle app Tassullo — **Anagrafe, Studio, Officina** — in forma di **registry [shadcn/ui](https://ui.shadcn.com)**.

Non è un pacchetto da installare: è un catalogo da cui la CLI **copia il codice sorgente** dentro l'app che lo consuma. I componenti restano leggibili e modificabili nell'app, ma **si correggono qui** — un componente sistemato in casa è un componente che diverge al primo aggiornamento.

Stack: Vite + React 19 + TypeScript, Tailwind v4, [Base UI](https://base-ui.com) per le primitive, Storybook come style guide.

---

## Guardare la style guide

**In rete:** <https://tassullo.github.io/tassullo-design-system-v2> — pubblicata a ogni push su `main`.

**In locale**, se serve provarla mentre si sviluppa:

```bash
npm ci
npm run storybook
```

Va **servita via HTTP**: il doppio clic sul file, come nel v1, non funziona più. È il prezzo del fatto che qui i componenti React sono montati davvero, invece di essere imitati in HTML — cioè esattamente il difetto che aveva fatto divergere le app fino alla v1.1.0.

La style guide ha tre interruttori in barra, e vanno usati: **Modalità** (chiaro/scuro), **Superficie** (Pagina/Card/Sidebar — un componente si guarda sul fondo su cui starà davvero) e **Densità** (normale/touch, per il cantiere).

## Installare un componente in un'app

```bash
npx shadcn@latest add tassullo/tassullo-design-system-v2/button
```

Con il pin di versione, che è la forma da preferire nelle app in produzione:

```bash
npx shadcn@latest add tassullo/tassullo-design-system-v2/button#v2.0.0
```

Il tema si porta con un comando solo — `tema` dichiara fra le sue dipendenze `tema-font` (Inter in data URI) e `tema-logo` (il marchio):

```bash
npx shadcn@latest add tassullo/tassullo-design-system-v2/tema
```

### Prerequisiti in un'app Vite appena creata

Rimisurato cronometrando il gate di fine FASE 4ter (M4ter.10, 2026-09-20; la prima stesura veniva da M4.6). Partendo da un `npm create vite@latest` puro servono **quattro** passi che nessun comando fa da solo — i primi due **prima** del primo `add`, il quarto **dopo** l'`add` del tema:

1. **Tailwind v4 e l'alias `@/*` devono già esistere.** `npm install tailwindcss @tailwindcss/vite`, il plugin in `vite.config.ts`, `@import "tailwindcss";` in testa al CSS globale. L'alias `@/*` → `./src/*` va dichiarato **nel `tsconfig.json` alla radice**, non solo in `tsconfig.app.json`: se sta solo lì, la CLI non lo trova e scrive i file dei componenti `ui/*` dentro una cartella letterale `./@/` invece che in `src/`. Basta `paths`: **non si aggiunge `baseUrl`**, che TypeScript 6 dichiara deprecato e fa uscire `tsc` con errore.
2. **`components.json` deve dichiarare il registry `@tassullo`**, o qualunque item con dipendenze interne (quasi tutti i blocchi e le pagine) fallisce con `Unknown registry "@tassullo"`:

   ```json
   "registries": {
     "@tassullo": "https://raw.githubusercontent.com/tassullo/tassullo-design-system-v2/main/public/r/{name}.json"
   }
   ```

   In locale, durante lo sviluppo di questo stesso repo, si punta invece a `http://localhost:5180/r/{name}.json` (il workbench, `npm run dev`).

3. **`shadcn init` vuole un preset, e non lo si può omettere.** Il comando è:

   ```bash
   npx shadcn@latest init --base base --preset nova --yes
   ```

   Senza `--preset`, `init` apre un menu a tendina e si pianta in qualunque contesto non interattivo — `--yes` non lo salta. Il nome del preset è **`nova`**, non `base-nova`: è `--base base` a farne `base-nova`, che è il valore di `style` da cui dipende che i componenti siano Base UI (regola 2 del `CLAUDE.md`). Passare `--preset base-nova` è un errore: *Invalid preset*.

4. **Dopo l'`add` del tema, la palette del preset va tolta da `src/index.css`.** È il difetto che costa di più, perché **non dà nessun errore**: `init` scrive in fondo al CSS globale i propri blocchi `@theme inline`, `:root` e `.dark` con la **palette neutra di shadcn**, e stanno *dopo* l'`@import "./tassullo-theme.css"` che la CLI aggiunge in testa. A parità di specificità vince l'ultimo, quindi **ogni token standard del tema Tassullo viene sovrascritto**. Misurato in M4ter.10 su un'app appena installata: `--primary` risolveva a `rgb(23, 23, 23)` — il grigio di shadcn — invece dell'arancio del brand, e il carattere era Geist e non Inter. Il risultato è peggio di un guasto, perché è **verosimile**: i token custom Tassullo (`--accent-ink`, `--warning`, `--success`) sopravvivono, perché il preset non li dichiara, quindi l'app sembra vestita a metà invece che spogliata.

   Si tolgono da `src/index.css` i tre blocchi `@theme inline { … }`, `:root { … }` e `.dark { … }` scritti da `init`, più l'`@import "@fontsource-variable/geist"`. Non manca niente: `tassullo-theme.css` porta i **propri** `@theme inline` e `@theme`, con colori, raggi e famiglie di carattere. Restano gli `@import` e il `@custom-variant dark`. Dopo la pulizia, misurato sulla stessa app: `--primary` = `rgb(244, 172, 61)`, carattere **Inter**.

Con questi quattro passi il gate — app Vite vuota, i dodici item della FASE 4ter più tema e guscio, `tsc -b` e build di produzione puliti, app navigabile e in stile — sta **molto** sotto i dieci minuti: i comandi e le scritture di file, cronometrati da uno script, sono **36 secondi**, di cui **5** i dodici `add`.

L'app non fa **nessuna richiesta di rete per la tipografia**: niente Google Fonts, il font viaggia dentro il CSS. Verificato in M4ter.10 sulla build di produzione servita in HTTP: **tre richieste in tutto** — il documento, il JS e il CSS — e nessuna per il carattere.

> **Stato:** la FASE 3 è in corso. Il registry è consultabile e installabile, ma il tag `v2.0.0` e la guida di migrazione per le app esistenti arrivano con la FASE 5 (`M5.3`–`M5.6`). Vedi `CHECKLIST.md`.

## Consultare il registry senza installarlo

Il server MCP di shadcn sa **elencare, cercare e leggere** gli item. È il meccanismo con cui le app smettono di divergere: prima di scrivere un componente, si chiede se esiste già.

```bash
npx shadcn@latest mcp init --client claude
```

---

## La regola che tiene insieme tutto

**Nessuna app tiene una copia dei token o dei componenti.** Se a un'app serve un token nuovo, una variante o un pattern non coperto, si propone e si aggiunge **qui** — mai localmente "per ora" nell'app. La deriva delle app comincia sempre da un'eccezione temporanea.

Le utility Tailwind si usano **solo sui token del tema**: niente valori arbitrari (`h-[37px]`, `bg-[#F4AC3D]`), niente hex, mai.

## I gate

`npm run check` esegue i sei controlli che girano anche in CI:

| Comando | Cosa verifica |
|---|---|
| `check:contrast` | il rapporto di contrasto delle **48 coppie di token** (24 per modalità), fallendo sotto 4.5:1 |
| `check:registry` | che i componenti divergano dall'originale shadcn **solo nelle stringhe di classi** — cioè che restino aggiornabili |
| `check:font` / `check:logo` | che i CSS generati siano allineati ai `.woff2` e agli `.svg` di partenza |
| `test:a11y` | axe-core su ogni story: **4 passate** (chiaro/scuro × popup chiuso/aperto), 1496 scansioni su 374 story |
| `check:registry-build` | che `public/r/` — l'artefatto che le app installano davvero — corrisponda ai sorgenti, rilanciando `shadcn build` in una cartella temporanea e confrontando byte per byte |

Oggi sono tutti verdi, **0 violazioni**. C'è anche `npm run misura:bersagli`, che misura quanto sono grandi i bersagli in densità touch — una cosa che axe non guarda e che col guanto si sente.

## Documenti

| File | Cosa c'è |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | le regole operative: come si scrive il codice, le trappole già pagate |
| [`PIANO.md`](PIANO.md) | analisi, sei fasi, 42 sessioni con criteri di accettazione |
| [`CHECKLIST.md`](CHECKLIST.md) | **stato di avanzamento**: da leggere per sapere a che punto siamo |
| [`WORKLOG.md`](WORKLOG.md) | il diario: cosa è stato fatto, cosa è andato storto e perché |
| [`docs/DECISIONI.md`](docs/DECISIONI.md) | le decisioni tecniche accertate sul campo, con la prova che le sostiene |

Rapporto col v1 (`tassullo-design-system`, `@tassullo/theme`): **resta in produzione e non si tocca.** Le tre app ci restano sopra finché ognuna non decide di passare. Del v1 il v2 eredita solo l'identità visiva — palette, font, raggi, densità — tradotta nella convenzione shadcn.

---

## Licenze

Codice e documentazione: **© Tassullo**, tutti i diritti riservati. Il repo è pubblico perché la CLI shadcn e GitHub Pages lo richiedono, non perché il contenuto sia rilasciato.

Fa eccezione il carattere **Inter**, distribuito con l'item `tema-font` sotto **SIL Open Font License 1.1** — il testo della licenza viaggia con l'item, in [`registry/tassullo/theme/tassullo-inter-OFL.txt`](registry/tassullo/theme/tassullo-inter-OFL.txt).

Il carattere **Replica LL** (Lineto), usato nelle stampe, **non è in questo repo** e non si distribuisce col registry.
