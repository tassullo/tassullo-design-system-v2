# WORKLOG — **Tassullo Design System 2.0**

> Diario sintetico in coda: attività svolte, modifiche, decisioni tecniche, problemi, test eseguiti, prossimi passi. Una voce per attività significativa. Su 42 sessioni resta consultabile per intero: **nessuna archiviazione prevista**, niente `docs/archive/` (differenza voluta rispetto ad Anagrafe, dove il volume la imponeva).
> Lo stato dei task sta in `CHECKLIST.md`; il piano in `PIANO.md`. Quando una decisione D si chiude, si scrive **qui** con la motivazione, e in `CHECKLIST.md` si aggiorna la riga.

## 2026-09-07 — Pianificazione: nasce il v2 su shadcn/ui

- Analizzato il design system attuale (`@tassullo/theme` v1.4.0, repo `tassullo-design-system`): CSS puro, `theme.css` (token) + `components.css` (ricette). Ha risolto il problema per cui era nato — la divergenza della palette tra Anagrafe, Studio e Officina — ma ha due limiti strutturali: **distribuisce classi, non componenti** (ogni app riscrive dialog, tabella ordinabile, select accessibile: Anagrafe ha 1.453 righe di CSS a mano in 10 file di pagina) e **non porta né accessibilità né comportamento** (focus trap, `aria-*`, tastiera, portali: assenti, e ogni app li reinventa male, mentre `docs/INTERFACCE.md` §1 di Anagrafe pone minimi verificabili che nessun componente condiviso garantisce oggi).
- Studiato shadcn/ui: non è una libreria da installare ma un **sistema di distribuzione di codice sorgente**, e supporta **"repo GitHub = registry"** — nessun server, nessun publish npm, nessun token nei CI, con in più il pin di versione via tag git. Combacia col vincolo storico dello studio, che già installa il tema da GitHub.
- **Decisioni di Francesco**: nuovo progetto **solo in locale per ora**; il repo v1 **non si tocca** e resta in produzione per le tre app; distribuzione target GitHub-as-registry; scope v2.0 = tema + primitive + blocchi + pagine modello + densità touch + dark mode; **nessuna app viene migrata adesso** (il v2 nasce per le app nuove; per le esistenti si scrive una guida, FASE 5, non si apre un cantiere).
- **Decisioni chiuse oggi**:
  - **D1 — nome**: `tassullo-design-system-v2`, per continuità esplicita col repo attuale.
  - **D9 — libreria di primitive**: **Base UI**. shadcn offre lo stesso componente in tre implementazioni parallele (Base UI, React Aria, Radix) e **`components.json` non ha un campo che le seleziona**: la scelta si fa componente per componente, quindi la coerenza è a carico nostro, e mischiarle significherebbe tre modelli di focus e tre insiemi di bug dentro la stessa libreria — la divergenza che il v2 nasce per chiudere. Base UI perché è la direzione di shadcn stesso (il `drawer` è già passato da Vaul a Base UI) e viene dagli autori di Radix, il cui team vi è confluito. React Aria resta superiore su accessibilità e i18n ma si paga in verbosità su **ogni** componente e con un ecosistema shadcn più piccolo. Unica eccezione prevista: il calendario (M2.7), da motivare qui se si presenta.
  - **Storybook come style guide 2.0**: gratuito, MIT, nessun tier a pagamento (Chromatic è un servizio separato e non serve). Motivo decisivo: `addon-a11y` esegue axe-core su ogni story e con `parameters.a11y.test = 'error'` **fa fallire la CI** — il minimo di accessibilità di INTERFACCE.md §1 diventa eseguibile, come `stylelint-config.cjs` aveva reso eseguibile la regola "solo variabili" nel v1. Prezzo da dire chiaramente: `storybook-static/` **va servito via HTTP**, il doppio clic su `styleguide.html` non torna; è il costo del fatto che la style guide monti i componenti React veri invece di imitazioni HTML — cioè esattamente il difetto che aveva fatto divergere le app fino alla v1.1.0.
- **Assunzioni messe a verbale**: A1 (le app consumer restano su Vite+React+TS), A2 (Tailwind v4 accettabile ovunque: introduce una build-dependency che il v1 non aveva), A3 (taratura delle sessioni per analogia con la ROADMAP di Anagrafe), A4 (esisterà prima o poi una app nuova su cui il v2 debutta; se tardasse molto, conviene anticipare la migrazione di una pagina di Anagrafe come collaudo, riaprendo D6).
- **Punti aperti**: D2 (palette scura, chiude in M1.3 guardandola), D3 (licenza Replicall: default v1, la carica l'app), D4 (quando pubblicare su GitHub — **blocca solo M5.6**, tutto il resto funziona col registry locale), D5 (destino di `components.css` e `stylelint-config.cjs` v1), D6 (quando migrano le app esistenti), D7 (dove vive `docx/`), D8 (librerie di terze parti per i blocchi M3.6–M3.9: PDF, editor, diff, dropzone — le uniche dipendenze pesanti, si scelgono nel task che le incontra privilegiando lazy e sostituibilità).
- Scritto `PIANO.md` (versione 1.0): documento unico — analisi, sei fasi, **42 sessioni** (5+5+9+11+6+6), mappa del repo a regime, punti aperti. Scelta di conduzione: in Anagrafe analisi e fasi stanno in due file perché l'analisi è enorme; qui sta in tre schermate e due file sarebbero solo due file da tenere allineati.
- Percorso critico: FASE 1 (il tema regge tutto) → FASE 2 → M3.3 `data-table` → gate M3.10 → FASE 5. Due tagli possibili se si vuole arrivare prima a qualcosa di usabile: M2.7–M2.8 e M3.6–M3.9 (dedotti dalla roadmap *futura* di Anagrafe, non da codice esistente) e l'intera FASE 4 (pagine modello, comodità).
- Prossimi passi: M0.1 (documenti di conduzione), poi M0.2 (scaffold).

## 2026-09-07 — M0.1 Documenti di conduzione

- Creati i tre documenti che affiancano `PIANO.md`: **`CHECKLIST.md`** (fonte di verità dell'avanzamento), **`WORKLOG.md`** (questo file) e **`CLAUDE.md`** (regole di sessione). Nessun codice scaffoldato: il task produce solo documenti, come da vincolo del piano.
- Impianto di conduzione preso da Anagrafe **in forma compatta**, con tre differenze volute e annotate: (a) nessun `docs/PIANO.md` — il piano è unico e sta nel root; (b) nessuna `docs/archive/` — su 42 sessioni il worklog resta consultabile per intero; (c) nessuna colonna *Responsabile* nella checklist, perché qui lavora una persona sola (si aggiunge il giorno in cui fossero due, con la regola dei worktree di Anagrafe).
- `CHECKLIST.md`: una tabella per fase con **Attività / Stato / Dipendenze / Criterio di accettazione sintetico**, più le tabelle Decisioni e Assunzioni. Le dipendenze sono state rese **puntuali task-per-task** invece di ereditare solo la dipendenza di fase dichiarata nel piano (esempio: M2.6 dipende da M2.2 e M2.3 perché il `combobox` si compone da `command` + `popover`; M3.4 da M2.2 e M2.3; M4.3 da M3.2, M3.4 e M3.7). Le dipendenze di fase restano scritte in testa a ogni sezione, così i due livelli non si contraddicono.
- **Rilievo di conteggio**: il piano dice "42 task" nel prompt di M0.1 ma le fasi contano **41 righe** — M3.3 `data-table` vale 2 sessioni (5+5+9+**10**+6+6 = 41 task, 42 sessioni). La checklist elenca 41 righe e lo dichiara in testa, invece di inventare un task inesistente per far tornare il numero. `PIANO.md` non è stato modificato: il totale di 42 **sessioni** che riporta è corretto.
- `M5.6` è stato messo direttamente in **BLOCKED** (non TODO) perché D4 è aperta e lo blocca per definizione; è l'unico task non-TODO oltre a M0.1. Tutti gli altri 39 sono TODO.
- `CLAUDE.md`: scritto **ora e non più avanti**, come impone il piano — dalla sessione M0.2 in poi ogni sessione lo carica in contesto, e se arrivasse in fondo alla fase le prime quattro lavorerebbero senza regole. Contiene le sezioni previste: cos'è il repo e il rapporto col v1; la regola permanente (nessuna app tiene una copia di token o componenti); le regole di scrittura del codice (`@/registry/...` sempre, Base UI sempre, utility solo sui token, niente valori arbitrari, i componenti si modificano nel registry); **le due trappole che costano riscritture** (`primary` ≠ `accent`; il nome dice la funzione, non l'aspetto: `badge` si legge, `toggle-group` si clicca); "prima di scrivere un componente, chiedilo all'MCP"; la conduzione (lettura di inizio sessione, aggiornamento di fine task); i confini (v1 e le tre app non si toccano, Anagrafe si **legge**, nessun `git remote` finché D4 è aperta); i comandi.
- Nel `CLAUDE.md` è stata aggiunta una precisazione operativa che il piano dà per implicita: fino a M0.2 i comandi `npm run …` **non esistono ancora**, perché non c'è `package.json`. Meglio dirlo che lasciare che una sessione li provi e ne deduca che qualcosa è rotto.
- Verifiche: nessun test da eseguire (task documentale). Controllati a mano l'allineamento dei nomi dei task e dei file fra `PIANO.md` e `CHECKLIST.md`, e il fatto che ogni decisione D1–D9 compaia in entrambi con lo stesso stato. Confermato che la cartella contiene ora **solo** `PIANO.md`, `CHECKLIST.md`, `WORKLOG.md`, `CLAUDE.md`: nessun file di codice, nessuna `docs/`, nessun `git init` (arriva in M0.5).
- Non toccati, come da vincolo: il repo `tassullo-design-system` (v1) e le app Anagrafe, Studio, Officina. Di Anagrafe sono stati **letti** `CHECKLIST.md`, `WORKLOG.md` e `CLAUDE.md` come modello di conduzione, senza scrivere nulla.
- Prossimi passi: **M0.2** — scaffold Vite + React 19 + TS, Tailwind v4 con `@tailwindcss/vite`, alias `@` e `@/registry`, `npx shadcn@latest init`, eliminazione dei CSS demo del template, e soprattutto **l'accertamento del meccanismo esatto con cui la CLI seleziona la variante Base UI**, da scrivere in `docs/DECISIONI.md` perché va poi ripetuto identico su ogni componente delle FASI 2–4.

## 2026-09-07 — M0.2 Scaffold Vite + Tailwind v4 + shadcn init

- Scaffold `create-vite` 9.2.0, template `react-ts`: **Vite 8.2, React 19.2, TypeScript 6.0**, più `@types/node` e `oxlint` che il template ormai porta di suo. Generato in una cartella temporanea e poi copiato nel repo, per non far scegliere a `create-vite` cosa fare dei quattro documenti di conduzione già presenti (l'opzione "svuota la cartella e continua" era il rischio da non correre). `package.json` rinominato `tassullo-design-system-v2`.
- **CSS e asset demo del template eliminati** (regola 4 di INTEGRAZIONE.md v1, riportata dal piano): non copiati affatto `src/App.css` (184 righe), `src/index.css` originale (111 righe, con un `--accent: #aa3bff` che è esattamente il tipo di inquinamento da evitare), `src/assets/`, `public/`, `README.md`. `index.html` riscritto: `lang="it"`, titolo del progetto, via il favicon di Vite.
- Tailwind v4 con `@tailwindcss/vite` (4.3.3) nel `vite.config.ts`; `src/index.css` ridotto a `@import "tailwindcss"`.
- **Alias**: `@` → `./src`, `@/registry` → `./registry`, dichiarati in `vite.config.ts` e nei tsconfig. Due dettagli non ovvi, annotati in `docs/DECISIONI.md` §5: (a) in Vite gli alias sono scritti come **array ordinato**, perché `@/registry` è un sottopercorso di `@` e va risolto prima; (b) **niente `baseUrl`** — TS 6.0 lo deprecca con `TS5101` e i `paths` relativi non lo richiedono. I `paths` sono ripetuti in `tsconfig.json` (il file che legge la CLI shadcn) e in `tsconfig.app.json` (quello che compila).
- **`npx shadcn@latest init --base base --preset nova --yes`** (CLI 4.21.0). Senza `--preset` il comando apre un prompt interattivo e si blocca: in sessione non interattiva va sempre passato.

### Il meccanismo di selezione di Base UI: accertato, e diverso da come il piano lo dava

- **Il campo esiste.** È **`"style": "base-nova"`** in `components.json`, impostato **una volta sola a `init`** con `-b, --base <base>` (`base` | `radix` | `aria`), e da lì vale per ogni `add` successivo — che infatti **non** ha un flag per cambiarlo. `PIANO.md` §0bis afferma il contrario («`components.json` non ha un campo che le seleziona… la coerenza è a carico nostro, componente per componente»): con la CLI 4.21.0 non è più vero. **D9 non cambia** nella sostanza né nelle motivazioni; cambia in meglio il modo di farla rispettare — non più disciplina a ogni comando, ma configurazione. La regola diventa: *non si cambia `style`*.
- Trappola di sintassi: il preset si passa come `nova`, **non** `base-nova` (quello è il valore che finisce scritto nel file; passarlo alla CLI dà `Invalid preset`). Preset disponibili: `nova`, `vega`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea`, `custom`.
- **Prova**: `npx shadcn@latest add button` ha generato `registry/tassullo/ui/button.tsx` con `import { Button as ButtonPrimitive } from "@base-ui/react/button"`, e `package.json` ha ora `@base-ui/react` ^1.8.0 — non `radix-ui`, non `react-aria-components`.
- Il `CLAUDE.md` è stato corretto subito su questo punto (regola 2) invece di aspettare la revisione di M0.5: le sessioni M0.3 e M0.4 lo caricano in contesto prima di allora, e una regola sbagliata è peggio di nessuna regola.

### Alias riscritti verso il registry

- `init` propone gli alias di una **app consumer** (`@/components/ui`, `@/lib/utils`). Qui non siamo un'app, siamo il registry: gli alias sono stati riscritti verso `registry/tassullo/` (ui, lib, hooks, components, utils), coerentemente con la mappa di `PIANO.md` §1. Verificato: `add button` atterra in `registry/tassullo/ui/`. Senza questa correzione le nove sessioni della FASE 2 avrebbero scritto nel posto sbagliato, da spostare a mano una per una.
- `src/lib/utils.ts` creato da `init` spostato in `registry/tassullo/lib/utils.ts`. **In shadcn 4.x `cn` è un pacchetto npm** e le primitive lo importano direttamente (`import { cn } from "cn"`), non dall'alias `utils`: il nostro file è oggi un re-export. Conseguenza da ricordare in FASE 5: ogni item del registry che usa `cn` deve dichiarare `cn` fra le `dependencies` npm, o l'app consumer non compila.

### Rilievo per M1.4: il bersaglio touch è più lontano di quanto stimato

- Il piano calcola la densità partendo da un bottone di default `h-9` (36px). Nel preset corrente il default **è `h-8`, misurato a 32px** nel browser (`lg`=h-9, `sm`=h-7, `xs`=h-6). La formula del piano — `--spacing: 0.3125rem` — su `h-8` dà **40px**, sotto i 44 richiesti. Servirebbe `0.34375rem` (fattore 1,375 invece di 1,25), oppure adottare `lg` come taglia di default in touch. Il meccanismo resta valido e resta una riga: è il **valore** che va ricalcolato, misurando, in **M1.4**. Annotato in `docs/DECISIONI.md` §6.

### Verifiche eseguite

- `npx tsc -b` pulito; `npx oxlint` pulito. La regola `react/only-export-components` è stata disattivata sul solo `registry/**` in `.oxlintrc.json`: ogni componente shadcn esporta le sue `*Variants` accanto al componente, quindi avrebbe prodotto un warning per ognuna delle 60+ primitive delle FASI 2–4.
- `npm run dev` (via `.claude/launch.json`, porta 5180): pagina servita, **Tailwind attivo** e sei varianti del `Button` renderizzate, console del browser pulita, focus ring visibile navigando da tastiera. Screenshot a 1440px acquisito.
- `npm run build` verde (399ms, 228 kB js / 23 kB css).
- Misurato a video: `--spacing` 0.25rem, `--radius` 0.625rem, bottoni 32px — i tre numeri da cui parte la FASE 1.
- Confini rispettati: nessuna modifica al repo v1 né alle app Anagrafe, Studio, Officina. Nessun `git init` (arriva in M0.5).
- Nuovo file non previsto esplicitamente dal piano ma necessario ai due task successivi: `.claude/launch.json`, per avviare il workbench senza ricordarsi il comando e la porta.
- Cade in FASE 1, annotato perché non passi inosservato: il preset `nova` ha installato **il font Geist** (`@fontsource-variable/geist`, importato in `src/index.css`) e la palette `neutral`. Entrambi vanno via in M1.2 — lo stack Tassullo dichiara `'Replicall'` con degrado a font di sistema e il `.woff` non si distribuisce (D3).
- Prossimi passi: **M0.3** — Storybook su `@storybook/react-vite` (riusa `vite.config.ts`, alias e Tailwind già configurati), addon `a11y`/`themes`/`viewport`, toggle di densità come globalType in `.storybook/preview.ts`, sezioni Tema / Primitive / Blocchi.

## 2026-09-07 — M0.3 Storybook: la style guide 2.0

- `npx storybook@latest init` → **Storybook 10.6** su `@storybook/react-vite`, che riusa `vite.config.ts` e quindi eredita alias e Tailwind di M0.2 senza aggiungere un secondo builder. Script `storybook` e `build-storybook` in `package.json`.
- **Ripulito ciò che `init` porta di troppo** (tabella completa in `docs/DECISIONI.md` §8): via `src/stories/` per intero — Button/Header/Page con i loro `.css`, la stessa insidia dei CSS demo del template Vite già evitata in M0.2 — via `@chromatic-com/storybook` (Chromatic è un servizio a parte e il piano dice esplicitamente che non serve) e via `@storybook/addon-mcp` (fuori piano: l'MCP del progetto è quello di shadcn, M0.4). Aggiunto a mano `@storybook/addon-themes`, che `init` non installa.
- **`@storybook/addon-vitest` rimosso, da rimettere in M2.9.** È il meccanismo con cui `parameters.a11y.test = 'error'` fa fallire la CI — cioè esattamente il gate di M2.9 — ma `init` lo lascia a metà (nessun `vitest.setup.ts`) e si porta dietro vitest, Playwright e i suoi binari. Mezzo configurato è peggio di non configurato. **Trappola annotata per M2.9**: `init` **riscrive `vite.config.ts`** aggiungendo un blocco `test.projects` con `storybookTest` e il provider Playwright; qui è stato ripristinato a mano il file di M0.2, e quando l'addon tornerà quel blocco va rimesso con lui.
- **Il viewport non è un addon**: da Storybook 9 è nel core e si configura con `parameters.viewport.options` + `initialGlobals.viewport`. Il piano lo elenca fra gli addon perché era così fino a Storybook 8. Definiti i due formati che contano per le app dello studio: **Scrivania 1440** (Anagrafe, Studio) e **Telefono 375** (Officina in cantiere).
- `.storybook/preview.tsx`: importa `../src/index.css` (da M1.2 sarà il tema del registry); `withThemeByClassName` con `parentSelector: 'html'` e temi `chiaro`/`scuro` — la classe deve stare su un antenato perché shadcn definisce `@custom-variant dark (&:is(.dark *))`; **toggle di densità** come `globalType` con decorator che scrive `data-density="touch"` su `document.documentElement`; `storySort` che fissa l'ordine delle sezioni **Introduzione / Tema / Primitive / Blocchi / Pagine**.
- **Story**: `registry/tassullo/ui/button.stories.tsx` (titolo `Primitive/Button`, quattro story: Predefinito, Varianti, Taglie, Disabilitato) accanto al componente, e `stories/Introduzione.mdx` come pagina di apertura della style guide. `main.ts` cerca le story in `registry/**` e `stories/**`, mai in `src/`: gli import puntano a `@/registry/...` come impone il `CLAUDE.md`.
- **Riga di densità scritta in via provvisoria** in `src/index.css`. Senza, l'interruttore avrebbe cambiato l'attributo senza che si vedesse nulla — verificabile solo da console, cioè uno stub. Valore `--spacing: 0.34375rem`, misurato a video: xs 33px, sm 38,5px, **default 44px**, lg 49,5px. Resta provvisoria e **si chiude in M1.4**, dove mancano ancora lo scatto di tipografia (che non deriva da `--spacing`) e la verifica che lo scaling non deformi ciò che non deve — larghezze massime, icone dentro i bottoni, sidebar. I mezzi pixel di `sm` e `lg` sono l'effetto atteso di un fattore non intero e si valutano lì.

### Verifiche eseguite

- `npm run storybook` (porta 6006, in `.claude/launch.json` accanto al workbench): indice aperto con la pagina Introduzione e la sezione **PRIMITIVE › Button**.
- **I tre interruttori, provati insieme e non uno per volta**, sulla story Taglie: tema `scuro` → `class="dark"` su `<html>` e sfondo `oklch(0.145 0 0)`; densità `touch` → `data-density="touch"`, `--spacing` 0.34375rem e bottoni da 24/28/32/36px a 33/38,5/**44**/49,5px **senza ricaricare** (HMR); viewport `Telefono 375` → canvas 375×812. Poi il ritorno alla combinazione chiaro / normale / Scrivania 1440 verificato misurando di nuovo: nessuna classe, attributo rimosso, bottoni a 32px.
- **axe-core attivo**: pannello Accessibility della story → *"No accessibility violations found"*. `a11y.test` resta a `'todo'` (segnala e basta) fino a M2.9, dove passa a `'error'`.
- `npm run build-storybook` verde (582ms, 10 MB in `storybook-static/`), e il sito statico **servito davvero via HTTP** su una porta locale: `index.html` 200, `iframe.html` 200, `index.json` con tutte le entry; la story renderizzata dal build statico misurata identica a quella in dev. Confermata la nota del piano — è un sito, non si apre col doppio clic.
- `npx tsc -b` e `npx oxlint` puliti. `react/only-export-components` disattivata anche su `.storybook/**` (il decorator di densità è un componente esportato accanto alla config).
- `storybook-static/` aggiunto a `.gitignore`.
- Confini rispettati: nessuna modifica al repo v1 né alle app. Nessun `git init` (M0.5).
- Prossimi passi: **M0.4** — MCP shadcn (`npx shadcn@latest mcp init --client claude`, poi riavvio di Claude Code e verifica che i comandi rispondano), registry locale Tassullo dichiarato in `components.json` perché l'MCP lo veda già durante lo sviluppo, e prerequisiti d'ambiente annotati in `docs/DECISIONI.md` §3 (Node, npm e il fatto che la CLI non si installa) — quest'ultimo punto è già scritto da M0.2 e va solo confermato.

## 2026-09-07 — M0.4 MCP shadcn, registry locale e prerequisiti

- **`npx shadcn@latest mcp init --client claude`** → `.mcp.json` di tre righe che lancia `npx shadcn@latest mcp`. Prerequisiti d'ambiente già rilevati e scritti in `docs/DECISIONI.md` §3 in M0.2 (Node v26.4.0, npm 11.17.0, CLI shadcn 4.21.0 usata con `npx` e **mai installata**): confermati, nessuna sorpresa.
- Aggiunto lo script **`npm run registry:build`** (`shadcn build`).

### Il registry locale non si indirizza con un percorso di file

- **È il rilievo che conta di questo task, e contraddice `PIANO.md` in due punti** (M5.2 «funziona col registry locale via percorso di file», M5.5 «percorso di file locale finché il repo è sul Mac»). Provate tutte le forme in `components.json`: `./public/r/{name}.json` e il percorso assoluto danno `Invalid URL`; `file:///…` dà `not implemented... yet...`. Solo un indirizzo **HTTP** funziona.
- La distinzione da tenere ferma, perché non è la stessa cosa: **installare** da un percorso locale funziona (`add ./public/r/button.json` è un indirizzo valido); **sfogliare** un registry no — `list`, `search` e quindi **tutto l'MCP** risolvono l'indice chiedendo `<base>/registry.json` via rete, e su `file://` si fermano.
- **Soluzione adottata senza aggiungere strumenti**: il registry compilato vive in `public/r/`, e il dev server di Vite serve `public/` alla radice — il workbench *è* già il server del registry. `"registries": { "@tassullo": "http://localhost:5180/r/{name}.json" }`. Conseguenza operativa per tutte le FASI 2–4, scritta anche nel `CLAUDE.md`: **per sfogliare il registry dall'MCP il workbench deve essere acceso**, e `registry:build` va rilanciato dopo ogni modifica agli item.
- **Ricaduta su M5.5**, da affrontare lì e non ora: il passo 0 su Anagrafe non potrà dire "metti il percorso della cartella". O lega Anagrafe a un server acceso in un'altra cartella, o — più sensatamente — il passo 0 si rimanda a **D4 chiusa**, quando l'indirizzo diventa `tassullo/tassullo-design-system-v2` col tag. L'ipotesi del piano non regge proprio per il caso d'uso che a M5.5 interessa: **consultare**, non installare.

### Registry Tassullo di collaudo

- `registry.json` nato con **un solo item, `button`**. Il piano lo prevede in bozza a M1.5 e completo a M5.1, ma senza almeno un item il criterio di accettazione di M0.4 non sarebbe verificabile. Le sue `dependencies` dichiarano `@base-ui/react`, `class-variance-authority`, `cn` e `lucide-react` — la prova concreta delle due note di `docs/DECISIONI.md` §4 (in shadcn 4.x `cn` è un pacchetto npm, e le icone Lucide non sono distribuite dal registry ma dichiarate come dipendenza).
- `npm run registry:build` produce `public/r/button.json` e `public/r/registry.json`. **`public/r/` si committa**: è l'artefatto che GitHub servirà come registry a D4 chiusa, non un generato da ignorare.

### Verifiche eseguite

- CLI: `list @tassullo` → 1 item; `search @tassullo -q button` → trovato; `list @shadcn` → **216 item**; `view @tassullo/button` → JSON completo col contenuto del file.
- `add @shadcn/badge --dry-run` → risolve in `registry/tassullo/ui/badge.tsx` (alias di M0.2 corretti anche per il registry pubblico); `add @tassullo/button --dry-run` → nessun file nuovo (è già a posto) e le sue 4 dipendenze dichiarate. Dry-run e non installazione reale: `badge` è di M2.1, non si anticipa il lavoro di una fase per fare una prova.
- **Server MCP interrogato direttamente via JSON-RPC su stdio**, senza passare da un client, per non far dipendere la verifica dal riavvio: `initialize` → `shadcn 1.0.0`; `tools/list` → **sette** strumenti (`get_project_registries`, `list_items_in_registries`, `search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`, `get_add_command_for_items`, `get_audit_checklist`) — `PIANO.md` §0bis ne dichiara tre: la sostanza (elencare, cercare, installare; solo lato consumo) resta giusta, il conteggio no. `search_items_in_registries` su `@tassullo` → 1 item Tassullo; su `@shadcn` → 8 risultati per "badge". **Il server vede entrambi i registry**: è il criterio di accettazione, ed è verde.
- Difetto cosmetico a monte, annotato per non scambiarlo per un guasto nostro: negli strumenti di ricerca il campo *Add command* stampa `[object Promise]` (promise non attesa nel codice della CLI). I risultati sono corretti.
- Confini rispettati: nessuna modifica al repo v1 né alle app. Nessun `git init` (M0.5).

### Perché il task resta in REVIEW e non passa a DONE

Manca **una sola** verifica, e non è eseguibile da dentro questa sessione: la prova in **linguaggio naturale** dal client ("aggiungi il componente badge"), che richiede il **riavvio di Claude Code** perché `.mcp.json` venga caricato. Il server è stato provato direttamente e risponde correttamente, quindi il rischio è basso; ma il criterio del piano parla del client, non del server, e finché quella prova non è fatta il task non è chiuso. Da fare al primo riavvio, prima di M0.5.

## 2026-09-07 — M0.4 chiuso dopo il riavvio, e la porta del workbench resa non negoziabile

- **Attrito emerso subito**: `npm run dev` apriva la **5173**, non la 5180. Il `--port 5180` stava solo in `.claude/launch.json`, quindi valeva per il preview ma non per chi lancia lo script a mano — e l'indirizzo del registry in `components.json` **contiene la porta**, quindi una porta accidentale rende il registry irraggiungibile senza dirlo. Corretto alla radice: `server: { port: 5180, strictPort: true }` in `vite.config.ts`. `strictPort` fa **fallire** l'avvio invece di scivolare sulla porta successiva, che è il modo in cui questo problema si ripresenterebbe in silenzio. `.claude/launch.json` semplificato di conseguenza (la porta non si ripete in due posti).
- **Verifica dal client, quella che mancava per chiudere il task**: `.mcp.json` caricato dopo il riavvio, `get_project_registries` → **`@shadcn` e `@tassullo`**; `list_items_in_registries` su `@tassullo` → l'item `button` con la sua descrizione; `search_items_in_registries` su `@shadcn` → `badge`; `get_add_command_for_items` → `npx shadcn@latest add @shadcn/badge`, eseguito → **`registry/tassullo/ui/badge.tsx`**, nel posto giusto e in variante Base UI (`@base-ui/react/merge-props`, `@base-ui/react/use-render`). Criterio di accettazione soddisfatto per intero: **M0.4 passa da REVIEW a DONE**.
- Conferma che il difetto `[object Promise]` nel campo *Add command* si vede anche dal client: è a monte, nella CLI, e non impedisce nulla — `get_add_command_for_items` restituisce comunque il comando corretto.
- **`badge` è entrato in anticipo**, come effetto della prova prevista dal piano stesso, ed è stato **poi rimosso** (voce del 2026-09-07 in coda): la prova è servita a verificare l'aggancio dell'MCP, non ad anticipare la FASE 2. **M2.1 lo reinstalla** con le altre primitive di fondamenta.
- Prossimi passi: **M0.5** — `git init` su `main`, `.gitignore` completato (`node_modules`, `dist`, `storybook-static`, `.env*` già coperti tranne `.env*`), primo commit di scaffold e documenti **senza `git remote`** (D4, da annotare nel messaggio di commit), e revisione del `CLAUDE.md` contro ciò che le quattro sessioni hanno davvero prodotto — in particolare il meccanismo Base UI di M0.2 e il funzionamento dell'MCP di M0.4, entrambi già corretti in corsa.

## 2026-09-07 — Correzione: dipendenza `shadcn` non più dichiarata

- Emerso controllando cosa avesse toccato l'installazione di `badge`: il pacchetto **`shadcn` era sparito da `package.json`** (probabile effetto collaterale delle disinstallazioni degli addon Storybook in M0.3), pur restando in `node_modules`. Tutto continuava a compilare **solo per quello**: `src/index.css` fa `@import "shadcn/tailwind.css"`, quindi un `npm ci` su un'altra macchina — o dopo una pulizia di `node_modules` — sarebbe fallito. Guasto latente, non visibile da `tsc`, `oxlint` né `build` finché la cartella non si svuota.
- Ridichiarato come **devDependency**: è un import consumato in fase di build e questo repo non si pubblica su npm (`private: true`). Diverso il caso delle app consumer, dove la dipendenza va dichiarata negli item del registry: se ne tiene conto in **M5.1**, insieme a `cn` e `lucide-react` (`docs/DECISIONI.md` §4).
- Verificato dopo la correzione: `npm run build` e `npx tsc -b` verdi.
- Lezione da tenere per le prossime sessioni: dopo ogni `npm uninstall` va riletto `package.json`, perché npm può portarsi via più di quanto chiesto e la prova che tutto funziona resta ingannevolmente verde finché `node_modules` conserva l'orfano.

## 2026-09-07 — Rimosso `badge`, lasciato dalla prova dell'MCP

- `registry/tassullo/ui/badge.tsx` **cancellato**. Era il solo file prodotto dall'installazione reale con cui si è verificato il criterio di accettazione di M0.4 ("una richiesta in linguaggio naturale installa il file giusto"); `package.json` non era stato toccato, perché l'unica dipendenza dichiarata dall'item (`cn`) era già presente. Il registry torna a contenere solo `button` e le sue story.
- Motivo della rimozione: la prova serviva a verificare l'**aggancio dell'MCP**, non ad anticipare la FASE 2. `badge` è previsto in **M2.1** fra le primitive di fondamenta, e ci arriverà ri-stilato Tassullo invece che nella versione di default del registry pubblico. La voce di M0.4 è stata aggiornata di conseguenza.
- **Verifiche**: nessun import di `badge` in `registry/`, `src/`, `stories/`, `.storybook/` prima della cancellazione (il solo riferimento era interno al file stesso). `npm run registry:build` rilanciato e le impronte SHA di `public/r/button.json` e `public/r/registry.json` sono **identiche a prima** — conferma attesa, perché `badge` non è mai stato un item di `registry.json`: era un componente installato **dal** registry pubblico, non aggiunto al nostro. `npx tsc -b`, `npx oxlint` e `npm run build` verdi; l'indice del registry continua a rispondere su `http://localhost:5180/r/registry.json`.
- Nota di metodo, valida per le prossime prove d'installazione: `add --dry-run` sarebbe bastato per i punti 1–5 del collaudo; l'installazione reale è servita solo all'ultimo criterio del piano, che parla esplicitamente di installare. Da M1.5 in poi, per le prove di risoluzione conviene fermarsi al dry-run.

## 2026-09-07 — M0.5 Git locale, e revisione del CLAUDE.md sul campo

- `git init -b main`, primo commit **`a435201`**: 29 file, 10.455 righe. Verificato cosa entra e cosa no — dentro `public/r/` (il registry compilato, artefatto e non generato da ignorare), `.mcp.json`, `.claude/launch.json` e i cinque documenti; fuori `node_modules`, `dist`, `storybook-static`, `.DS_Store`.
- `.gitignore` completato: aggiunto il blocco **`.env` / `.env.*`** (con l'eccezione `!.env.example`) che il template Vite non prevedeva, deduplicata la doppia riga `storybook-static` lasciata da `storybook init` sopra quella scritta a mano in M0.3, e messa in coda una **nota esplicita che `public/r/` NON si ignora** — è il tipo di riga che qualcuno cancella "perché è roba generata" senza sapere che è l'artefatto che GitHub servirà.
- **`git remote -v` vuoto**, e la ragione è scritta nel messaggio di commit e non solo qui: D4 è aperta, il repo resta sul Mac, blocca solo M5.6. Una decisione che non lascia traccia dove si guarda si trasforma in una dimenticanza da correggere.
- Working tree pulito dopo il commit; `tsc -b`, `oxlint` e `build` verdi.

### Revisione del `CLAUDE.md`: quattro discrepanze, tutte corrette

Il task chiede di verificare che il `CLAUDE.md` scritto in M0.1 rispecchi ciò che le quattro sessioni hanno **davvero** prodotto. Non era così in quattro punti:

1. **Regola 5, densità.** Diceva `--spacing: 0.3125rem` su un default `h-9`. Il preset ha `h-8` (32px) e il valore provvisorio è `0.34375rem` (M0.2/M0.3). Riscritta indicando che è provvisoria e che si chiude in M1.4, con il rimando a `docs/DECISIONI.md` §6.
2. **§Confini, registry locale.** Diceva che tutto «funziona col registry locale via percorso di file», ereditandolo dal piano. È falso per il caso d'uso che conta: installare da un percorso funziona, **sfogliare** no. Riscritto con la distinzione e con la ricaduta su M5.5.
3. **§Comandi.** Mancava `npm run dev` — cioè il comando più importante del repo, perché non è una pagina di prova ma **il server del registry** che l'MCP interroga, sulla porta 5180 fissata con `strictPort`. Aggiunti anche `lint` e `build`.
4. **Mancavano due convenzioni** fissate sul campo e che una sessione futura violerebbe senza saperlo: la **regola 6** (le story stanno accanto al componente nel registry, `stories/` in root solo per le pagine trasversali, il `title` apre con la sezione, Storybook non guarda in `src/`) e la **regola 7** (le primitive importano `cn` dal pacchetto npm e non dall'alias `utils` — da non "correggere" — con la conseguenza per M5.1 che ogni item deve dichiarare `cn` e `lucide-react` fra le proprie dipendenze).

Le prime tre erano previsioni del piano smentite dai fatti; la quarta è materiale nuovo. Nessuna è stata lasciata da sistemare "più avanti": è il `CLAUDE.md` che ogni sessione carica in contesto, e una regola sbagliata lì costa più di una regola assente.

### FASE 0 chiusa

Gate superato: `npm run storybook` mostra una primitiva shadcn con Tailwind attivo e i tre interruttori funzionanti; i quattro documenti di conduzione esistono (più `docs/DECISIONI.md`, nato per necessità in M0.2); git locale inizializzato senza remote.

- Prossimi passi: **FASE 1, M1.1** — mappa dei token `theme.css` v1 → shadcn come nuovo §2bis di `PIANO.md`, e `scripts/hex-to-oklch.ts` (devDependency `culori`) che converte gli hex in `oklch` **e** calcola il contrasto di ogni coppia `X`/`X-foreground` uscendo con codice 1 sotto 4.5:1. Criterio di accettazione da prendere alla lettera: lo script deve **fallire** se si forza `--primary-foreground` a bianco, e la verifica va eseguita, non dichiarata.

## 2026-09-07 — M1.1 Mappa dei token e gate di contrasto

Primo task della FASE 1. Prodotti `PIANO.md` §2bis (la mappa completa `theme.css` v1.2.2 → shadcn, 63 token letti dal v1), `scripts/hex-to-oklch.ts` e lo script npm `check:contrast`. Il v1 **non è stato toccato**: letto e basta.

### La palette sta nello script, non nel CSS

Scelta di impianto, perché decide come si lavorerà in M1.2, M1.3 e ogni volta che la palette cambierà: la palette vive in **una sola costante dentro `scripts/hex-to-oklch.ts`**, e `tassullo-theme.css` sarà il suo **output** (`npm run check:contrast -- --css`), non una seconda copia scritta a mano. È l'unico modo per cui "la conversione va fatta dallo script" resti vero anche fra sei mesi: se il CSS si scrivesse a mano, alla prima modifica lo script diventerebbe un doppione da tenere allineato, e in poche settimane sarebbe disallineato e ignorato — esattamente la fine che ha fatto ogni controllo non automatico.

Conseguenza operativa scritta anche in `CLAUDE.md` §Comandi: **gli hex non si convertono a mano e il CSS del tema non si edita a mano**. Il blocco `dark` è già presente nello script, vuoto, e il controllo lo salta dichiarandolo: M1.3 lo riempie e basta.

Node 26 esegue TypeScript direttamente, quindi lo script gira senza `tsx` né build (`node scripts/hex-to-oklch.ts`). `scripts` è stato aggiunto all'`include` di `tsconfig.node.json` perché `tsc -b` lo controlli davvero; `erasableSyntaxOnly` era già attivo, che è anche il requisito del type-stripping di Node. Unica dipendenza nuova: `culori` (+ `@types/culori`, perché culori 4 non spedisce i propri tipi), devDependency.

### Le 26 coppie, e perché non sono solo quelle `X`/`X-foreground`

Il criterio del piano parla delle coppie `X`/`X-foreground`. Prese alla lettera sarebbero 18 e lascerebbero fuori il posto dove il contrasto si rompe davvero: gli accostamenti che le pagine fanno e che **nessun token dichiara**. Ne sono stati aggiunti otto — testo attenuato *su pagina* e *su card*, link (`--accent-ink`) su entrambe, voce di sidebar attiva sul fondo della sidebar, chip attivo, placeholder su pagina e su input. Due di quelli aggiunti sono fra i rilievi qui sotto: senza, non si sarebbero visti.

### Cinque rilievi, tutti misurati e tutti da chiudere in M1.2

Il dettaglio con i numeri è in `PIANO.md` §2bis; qui la sostanza e il perché non sono stati risolti adesso.

1. **Tre coppie sotto soglia per un soffio** (4.42–4.45:1): `muted`/`muted-foreground`, `primary-subtle`/`accent-ink`, `warning`/`warning-foreground`. La correzione minima calcolata è **ΔL 0.006 in oklch** su ciascuna — invisibile a occhio, e le tre proposte sono in tabella in §2bis. **Non applicate qui**: M1.1 è "mappa e strumento", cambiare gli hex della palette è la decisione di M1.2, e applicarla adesso avrebbe cancellato la prova che il v1 quelle tre coppie non le passa.
2. **`--foreground-hint` è a 2.27:1**, ben sotto. È la sola **esenzione** dichiarata nello script, con la ragione scritta accanto al codice: WCAG chiede 4.5:1 anche per i placeholder, quindi in M1.2 o si alza il colore o il token si riserva a meta-informazioni non testuali. Un'esenzione senza motivazione è un contrasto rotto travestito da decisione, e per questo `EXEMPT` è una mappa chiave→ragione, non una lista.
3. **I raggi non si ottengono dalla derivazione shadcn.** Con `--radius: 0.375rem` i fattori `0.6/0.8/1/1.4` danno 3.6/4.8/6/8.4px contro i 4/6/10/999 del v1 — e le primitive usano `rounded-md`, quindi i **bottoni verrebbero a 4.8px invece di 6**. In M1.2 i quattro `--radius-*` vanno sovrascritti con valori espliciti. È il tipo di scostamento che nessuno noterebbe a occhio e che rende il v2 "quasi" uguale al v1 senza saper dire dove.
4. **`--ring` cambia natura**: nel v1 `--focus-ring` è un'**ombra** con l'arancio *tenue*; in shadcn `--ring` è un **colore** pieno. Si tiene la mappatura del piano (`#F4AC3D`), ma l'anello di focus del v2 sarà più marcato di quello del v1: annotato perché non venga scambiato per un errore in FASE 2.
5. **Il verde pieno non regge il bianco.** Il v1 prescrive testo bianco anche sul verde `#1CAC7C`: **2.6:1**. Stessa trappola dell'arancio, mai vista perché nessuno la misurava. `--success-foreground` è quindi `#141414` (6.35:1). **Divergenza deliberata dal v1**, ed è il primo caso in cui il v2 corregge il v1 invece di ricopiarlo.

### Due scostamenti dal piano, entrambi in aggiunta

- **Stati semantici su due livelli invece di tre token.** Il piano prevedeva `success`/`warning`/`info` con `-foreground` e `-border`. Il v1 li descrive però su due registri — un colore pieno e una terna tenue fondo/testo/bordo — e servono entrambi: il pieno per badge e indicatori, il tenue per gli alert di M2.4, che devono somigliarsi fra loro. Con tre token soli, o si perde il badge pieno o si perde l'alert, e la prima app che ne ha bisogno se lo inventa in casa: la deriva che il progetto esiste per impedire. Adottato `X` / `X-foreground` / `X-subtle` / `X-subtle-foreground` / `X-border`, esteso anche a `destructive`.
- **`--info-border` derivato, non inventato.** È il solo colore che il v1 non ha. Anziché sceglierne uno a occhio: convertiti in oklch, i tre bordi tenui esistenti stanno in una banda stretta (`l` .81–.90, `c` .071–.103) ciascuno alla tinta della sua famiglia, quindi `--info-border` è la **media di quella banda alla tinta di `--info-subtle`** → `oklch(0.852 0.082 237.49)` = `#9BD7FE`. Lo ricalcola `deriveInfoBorder()` a ogni esecuzione. Provata prima una regola per interpolazione fra `-subtle` e il testo, **scartata**: non ricostruiva i tre bordi noti (Δ 0.03–0.08 in oklch, visibile).

Sono anche gli unici due punti in cui il v1 ha richiesto una scelta e non una traduzione. Tutti gli altri token sono 1:1, i loro hex sono quelli del v1 e la colonna "token v1" di §2bis lo dice riga per riga.

### Verifiche eseguite

- **Criterio di accettazione, verificato nei due modi** e non dichiarato: (a) `npm run check:contrast -- --self-test` → `primary/primary-foreground` a `#FFFFFF` dà `1.94:1 → RILEVATO`; (b) modifica **reale** della palette a `#FFFFFF`, `npm run check:contrast` → **codice di uscita 1**, poi palette ripristinata e ricontrollata. Il `--self-test` è stato aggiunto proprio perché la verifica resti un comando invece di una modifica temporanea da rifare a mano ogni volta.
- `npm run check:contrast` sulla palette vera: 26 coppie, **3 violazioni** (rilievo 1) + 2 esenti (rilievo 2), uscita **1**. È corretto che sia rosso: è la palette v1 a non passare, non lo script a essere rotto, e nasconderlo con un'esenzione sarebbe stato il modo più rapido per rendere il gate inutile al primo giorno di vita.
- `-- --css` emette i blocchi `:root` completi in `oklch` con l'hex di provenienza in commento su ogni riga, più la riga che dichiara `.dark` non ancora compilata.
- `npx tsc -b --force` e `npx oxlint` verdi. Nessun file del v1 né delle app modificato.

### Prossimi passi

**M1.2** — `registry/tassullo/theme/tassullo-theme.css` dall'output di `-- --css`, con quattro decisioni da prendere *misurando* e non stimando: le tre correzioni ΔL 0.006 (rilievo 1), la sorte di `--foreground-hint` (rilievo 2), i quattro `--radius-*` espliciti (rilievo 3), e lo stack font con `'Replicall'` **senza distribuire il `.woff`** (D3), che porta via anche l'import di Geist lasciato dal preset `nova`. Il criterio di M1.2 è `check:contrast` **verde**: oggi apre rosso, e le tre correzioni sono già calcolate.

## 2026-09-07 — M1.2 Il tema in modalità chiara

`registry/tassullo/theme/tassullo-theme.css` esiste, `src/index.css` non dichiara più alcun token, e il workbench rende in Tassullo. `npm run check:contrast` **verde: 24 coppie su 24, zero esenzioni**.

### Il file del tema è generato per intero, non solo il blocco colori

In M1.1 la palette era finita nello script per non tenere due copie degli hex. Scrivendo il CSS è venuto fuori che la stessa ragione vale per tutto il resto: se i colori sono generati e raggi, font, scala tipografica e ombre sono scritti a mano nello stesso file, quel file è metà generato e metà no — e alla prima esecuzione di `theme:build` le modifiche a mano spariscono in silenzio. Quindi `buildTheme()` emette il file **intero**, `npm run theme:build` lo scrive, e l'intestazione del CSS dice che è generato.

Non basta scriverlo: **`check:contrast` ora verifica anche che il file su disco corrisponda all'output dello script**, e fallisce se qualcuno l'ha toccato a mano. Provato: aggiunta una riga in coda al CSS → uscita 1 con il messaggio che indirizza alla palette; `theme:build` → di nuovo 0. È la differenza fra una convenzione e una garanzia.

Effetto collaterale utile: il blocco `@theme inline` dei colori è **generato dalle chiavi della palette**, quindi un token aggiunto allo script si espone da solo come utility (`bg-*`, `text-*`, `border-*`). M1.3 e M2.8 non dovranno ricordarsi di aggiornare due elenchi.

### Le quattro decisioni che M1.1 aveva istruito

1. **Le tre correzioni ΔL 0.006 applicate come proposte**: `--muted-foreground` `#6E6B67`→`#6C6965`, `--accent-ink` `#B45309`→`#B25105`, `--warning-foreground` `#8A6500`→`#886300`. Le tre coppie passano da 4.42–4.45 a 4.55–4.57:1.
2. **`--foreground-hint` eliminato, non esentato.** Verificato nel v1 dove il token è usato davvero (`components.css`): `.input::placeholder` e `.card-meta`, cioè **testo** in entrambi i casi, quindi nessuno dei due è esente da WCAG. E misurando: per arrivare a 4.5:1 dovrebbe scendere a `l 0.547` contro `l 0.522` di `--muted-foreground` — ΔL 0.025, indistinguibile — mentre su fondo `--muted` collassa esattamente sullo stesso hex. Il terzo livello di testo del v1 **non sopravvive al requisito di leggibilità**: placeholder e meta usano `--muted-foreground`. Nota già scritta per M5.5: `--color-text-hint` → `--muted-foreground`. Lo script resta ora **senza alcuna esenzione**, ed è la condizione da mantenere: la lista `EXEMPT` è vuota e commentata come tale.
3. **Raggi: rettifica alla mappa.** §2bis mappava `--radius` su `--radius-md` del v1 (6px). Sbagliato: in shadcn `--radius` **è** il gradino `lg`. Il valore giusto è `0.625rem`, cioè i 10px delle card del v1 — che per caso è anche il valore del preset, ma per la ragione giusta. `--radius-sm` e `--radius-md` sono sovrascritti a 4px e 6px; da `xl` in su la derivazione shadcn resta. Verificato a video: **4 / 6 / 10px**.
4. **Font: Geist fuori, Replicall dentro.** Import rimosso da `src/index.css` e `@fontsource-variable/geist` **disinstallato**; riletto `package.json` dopo la disinstallazione (lezione di M0.4) — non si è portato via nient'altro. Lo stack è quello del v1 alla lettera, e il `.woff` **non si distribuisce** (D3): l'app che ha la licenza lo carica con un proprio `@font-face`, altrimenti si degrada al font di sistema.

### Cosa c'è nel tema oltre ai colori

Scala tipografica del v1 (sette gradini, 11→26px, verificati tutti a video), ombre (con il nero Tassullo convertito dallo script invece che riscritto come `rgba(20,20,20,…)`), `--overlay`, e `--container-page: 1180px` esposto come container per poter scrivere `max-w-page` invece di un valore arbitrario. **Non portati, di proposito e con la ragione scritta nel file**: `--space-1…6` e `--space-page` (in Tailwind v4 le spaziature derivano da `--spacing`, che è anche il meccanismo della densità; il padding di pagina del v1 si scrive `py-8 px-10`) e `--transition-fast`, che è già il default di Tailwind. I `--chart-1…5` restano quelli grigi del preset, marcati provvisori: la palette categorica è di M2.8.

### Tre rilievi nuovi: il tema è giusto, le primitive no

Applicato il tema, il workbench ha mostrato che i colori corretti **non bastano**. La `button` generata dal preset `base-nova` in M0.2 usa i token nel modo sbagliato, in tre punti, tutti misurati col browser e tutti **da chiudere in M2.1** (tabella in §2bis):

- `variant: link` usa `text-primary` → **1.79:1**. Il preset commette **esattamente** la trappola che il `CLAUDE.md` mette per iscritto: l'arancio del brand come colore di testo. Va a `text-accent-ink` (4.77:1). Se succede al preset ufficiale, succederà a noi.
- `variant: destructive` usa `bg-destructive/10 text-destructive` → **3.94:1**, e per giunta è un rosso tenue dove il v1 ha un rosso pieno. Va a `bg-destructive text-destructive-foreground` (4.83:1), che il tema fornisce già.
- La base usa `rounded-lg`, quindi i bottoni escono a **10px** invece dei 6px del v1; e le taglie `xs`/`sm` usano valori arbitrari (`rounded-[min(var(--radius-md),12px)]`, `text-[0.8rem]`), che la regola 3 del `CLAUDE.md` vieta.

**Limite del gate, da colmare in M2.9**: nessuno dei tre è stato trovato da `check:contrast`, che verifica le **coppie di token** e non come i componenti le accostano. Li ha trovati l'occhio sul workbench più il browser. Il controllo che li avrebbe presi è axe-core sulle story, cioè il gate di M2.9 — e questo è l'argomento per non rimandarlo.

Annotato anche un effetto collaterale della scala tipografica, da valutare in M2.1: con la scala Tassullo `text-sm` vale 12px invece dei 14px di Tailwind, quindi i bottoni del preset — che usano `text-sm` — sono più piccoli di prima. Non è un guasto, è il preset tarato su un'altra scala.

### Verifiche eseguite

- **Criterio di accettazione**, verificato a video e non dichiarato: `bg-primary text-primary-foreground` rende `oklch(0.795 0.1473 73.78)` (= `#F4AC3D`) con testo `oklch(0.1913 0 0)` (= `#141414`) — arancione con testo nero. Letti dal browser, non dal CSS.
- `npm run check:contrast` → **0 violazioni, 24 coppie**, e il file del tema dichiarato allineato allo script.
- Misurati a video: raggi 4/6/10px, `max-w-page` 1180px, tutti e sette i gradini tipografici esatti, stack font con `Replicall` in testa e degrado corretto, fondo pagina e testo dai token giusti.
- Guardia anti-deriva provata nei due sensi (file alterato → uscita 1; `theme:build` → uscita 0).
- `npx tsc -b --force`, `npx oxlint`, `npm run build`, `npm run build-storybook` e `npm run registry:build` tutti verdi.
- **Un errore preso in corsa**: la prima versione della pagina di prova costruiva le classi con template string (`` bg-${t} ``). Tailwind v4 cerca **nomi di classe interi** nel sorgente, quindi quelle classi non sarebbero state generate affatto e la prova avrebbe reso senza stile — dando l'impressione di un tema rotto. Riscritte per esteso, con il motivo in commento accanto.
- Nessuna modifica al repo v1 né alle app: `theme.css` e `components.css` del v1 solo letti.

### Prossimi passi

**M1.3** — modalità scura, che chiude **D2**. Il blocco `dark` è già predisposto e vuoto nello script, e il controllo lo salta dichiarandolo: basta riempirlo e `check:contrast` lo verifica da sé con le stesse 24 coppie. Da tenere presente che finché è vuoto l'interruttore tema di Storybook non cambia nulla — è atteso, non un guasto. Il criterio chiede anche lo screenshot delle due palette affiancate.
