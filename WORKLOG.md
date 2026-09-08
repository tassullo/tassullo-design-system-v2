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

## 2026-09-07 — I rilievi su `button` portati dove verranno letti

Controllo di conduzione, non lavoro nuovo. I tre rilievi aperti da M1.2 erano annotati in `CHECKLIST.md` (riga M2.1), in `PIANO.md` §2bis e nella voce di WORKLOG — ma **non nel blocco del task M2.1 di `PIANO.md`**, che è ciò che il `CLAUDE.md` prescrive di leggere a inizio sessione insieme a CHECKLIST e alle ultime voci di WORKLOG. Fra M1.2 e M2.1 ci sono tre sessioni: la voce di diario non sarà più fra le ultime, e i rilievi sarebbero rimasti appesi a un rimando da seguire.

Scritti quindi **dentro il blocco M2.1**, con le misure e il file da toccare, più due cose che dalla sola tabella non si deducevano: che il controllo va fatto **su tutte le primitive del task e non solo sul bottone** (se ci è cascato il preset ufficiale, non ci sarà cascato una volta sola), e che con la scala Tassullo `text-sm` vale 12px, quindi la taglia del testo del bottone è una decisione da prendere lì misurando. Il conteggio passa da tre a **quattro** righe, separando la base (`rounded-lg`) dalle taglie (valori arbitrari): sono due correzioni diverse.

Aggiunta per lo stesso motivo una nota nel blocco **M2.9**: che quel gate non è rimandabile è una conclusione tratta in M1.2 — tre difetti reali passati sotto a `check:contrast`, che verifica le coppie di token e non come i componenti le accostano — e stava scritta solo in §2bis.

Lezione di metodo per le prossime sessioni: un rilievo che riguarda un task futuro va scritto **nel blocco di quel task**, non solo nel diario e nella checklist. Il diario invecchia e la checklist ha una riga sola.

## 2026-09-07 — `check:registry`: il controllo di aggiornabilità (regola 4bis)

Lavoro fuori piano, chiesto in corso d'opera e a ragione: i componenti shadcn non sono una dipendenza, sono **codice copiato**, e una versione nuova non arriva da sola — va riportata a mano. Riuscirci dipende da una cosa sola, che le nostre divergenze dall'originale siano poche, dichiarate e **di un tipo solo**. Finora quella condizione era affidata alla buona volontà.

### La regola, scritta come regola 4bis del `CLAUDE.md`

> **Di un componente shadcn si cambiano SOLO le stringhe di classi.** Struttura, props, nomi delle varianti e delle taglie, export: quelli di shadcn, identici.

Non è purismo. Una variante o un prop in più, dentro un file che fra sei mesi va confrontato con la sua versione aggiornata, **non si distingue più da ciò che hanno cambiato loro**: il diff diventa illeggibile e la scelta pratica diventa "riscrivo tutto" oppure "resto indietro per sempre". Se serve davvero un'aggiunta strutturale, si fa un componente **nuovo che avvolge** quello shadcn.

### Come fa a saperlo

`registry/.upstream/` conserva il sorgente **originale** di ogni componente, scaricato con `shadcn view @shadcn/<nome>` — che restituisce il file per lo `style` configurato, quindi la variante Base UI giusta. Il confronto **azzera il contenuto di tutte le stringhe**, toglie i commenti e schiaccia lo spazio: quel che resta è la *forma* del componente. Se la forma è identica, abbiamo solo ri-stilato; se differisce, abbiamo toccato la struttura. È un criterio meccanico e senza zone grigie, e conta anche le stringhe: se il numero non torna, è struttura.

Alla prossima versione di shadcn il ciclo è: `-- --snapshot` → `git diff registry/.upstream/` dice **cosa hanno cambiato loro** → `check:registry` dice se il nostro ri-stile ci si posa ancora sopra. `PROVENIENZA.md` registra versione della CLI (4.21.0), `style` (base-nova) e data.

### I sei controlli, e cosa fa fallire

1. **Forma diversa dall'originale** → errore. 2. **Originale mancante** per un componente presente → errore: un componente copiato senza registrare da dove viene è già fuori controllo. 3. **Valore arbitrario introdotto da noi** → errore (regola 3); **ereditato da shadcn** → avviso, da ripulire ri-stilando. 4. **Colore esadecimale** nel sorgente → errore. 5. **Token standard sparito dal tema** → errore: un componente non ancora ri-stilato che lo usa renderebbe senza colore. 6. **Token custom Tassullo usati dentro i componenti** → non è un errore, è il **costo di aggiornamento misurato**, stampato a ogni esecuzione.

Il sesto è il punto della richiesta: i token custom nel **tema** sono legittimi — il tema è il posto dove shadcn stesso prevede la personalizzazione, e `registry:theme` accetta `cssVars` arbitrari. Sono i token custom **dentro un componente** a costare, perché ognuno è una riga in più da riportare a mano. Il numero va tenuto piccolo e va **conosciuto**, non stimato.

### Un difetto mio, preso alla prima esecuzione

La prima versione segnalava 24 avvisi su un file **intatto**, perché contava come "valori arbitrari" anche le **varianti** Tailwind (`has-data-[icon=inline-end]:pr-2`, `not-aria-[haspopup]:translate-y-px`, `in-data-[slot=button-group]:rounded-lg`). Sono legittime e inevitabili, e non sono ciò che la regola 3 vieta. La distinzione è netta e ora è nel codice: **una parentesi quadra seguita da `:` è una variante; senza, è un valore fuori dal tema**. Tolto anche il controllo sui "token ignoti", che segnalava `border-transparent` e `shadow-sm` come refusi: ora scattano solo i nomi che *hanno la forma* di un token del tema. Da 24 avvisi rumorosi a 4 veri.

### Verifiche: il controllo sa fallire, provato su quattro violazioni simulate

- **variante `tassullo` aggiunta** a `button.tsx` → errore di forma, uscita 1.
- **ri-stile legittimo + `text-[13px]`** → il ri-stile è riconosciuto come tale (`◐ forma identica, 1 stringa ri-stilata`) e il valore arbitrario è un errore, uscita 1. È il caso che conta: distingue ciò che è permesso da ciò che non lo è **nella stessa modifica**.
- **`--chart-5` tolto dalla palette** → `31/32 token standard`, errore, uscita 1.
- **componente senza originale registrato** → errore con il comando da eseguire, uscita 1.

Tutti ripristinati; `check:contrast` e `check:registry` verdi dopo.

### Stato di ciò che è stato prodotto finora — rispetta i criteri?

**Sì, e per la ragione meno meritoria: non ho ancora toccato nessun componente.**

- `button.tsx` è **intatto**, forma identica all'originale, zero stringhe ri-stilate.
- Il tema definisce **57 token, 25 custom**, e **tutti e 32 gli standard** del preset sono presenti.
- **Zero token custom usati dentro i componenti.** Il costo di aggiornamento oggi è nullo.
- I 4 avvisi residui sono valori arbitrari **ereditati da shadcn** (`text-[0.8rem]`, due `rounded-[min(…)]`, un `bg-[color-mix(…)]`), già in carico a M2.1.

**Un rilievo su me stesso, però, e va detto.** Il rimedio che avevo scritto in `PIANO.md` per `variant: destructive` — `text-destructive-foreground` — introdurrebbe la **prima dipendenza di un componente da un token custom**: `--destructive-foreground` **non è** fra i 32 che il preset spedisce (verificato sul commit di scaffold `a435201`, non a memoria). Non è grave, ma non è gratis, ed è la prima di una serie di decisioni identiche. Misurate le alternative su `#DC2626` e messe in tabella nel blocco M2.1: `text-destructive-foreground` e `text-white` danno entrambe 4.83:1, `text-background` 4.46:1 (non passa), `text-card` 4.75:1 ma semanticamente sbagliato. La decisione si prende in M2.1, consapevolmente.

### Ricadute

- `npm run check` esegue i due gate insieme.
- **M2.9** deve far passare anche `check:registry` e mettere a verbale il conto dei token custom nei componenti: annotato nel blocco del task, perché a 40 componenti quel numero va conosciuto prima e non scoperto dopo.
- `registry/.upstream/` **si committa** ed è la seconda cartella con questa proprietà dopo `public/r/`. Non è un generato da ignorare: senza, il confronto non esiste.
- Da fare a ogni `shadcn add` della FASE 2, e da scrivere nella guida: **prima `--snapshot`, poi si ri-stila.** Uno snapshot preso dopo aver modificato il file registrerebbe come "originale" il nostro, e il controllo diventerebbe una tautologia.

## 2026-09-07 — La scala prima della personalizzazione (regole 4bis e 4ter), e un errore ripetuto

Due cose, e la prima è un errore mio.

### `--snapshot`: il comando era documentato, la regola no

Domanda diretta di Francesco: dove sta la regola. Verificato invece di rispondere a memoria — il **comando** `-- --snapshot` era in `CLAUDE.md` §Comandi, ma l'**ordine operativo** («prima si registra l'originale, poi si ri-stila») stava **solo in `WORKLOG.md`**. Cioè nel diario, che invecchia: è **esattamente** il difetto che avevo appena finito di correggere per i rilievi su `button`, ripetuto due voci più sotto. La lezione era già scritta e non è bastato averla scritta.

Ora è la **regola 4ter** del `CLAUDE.md`, con i due comandi in sequenza e il motivo: uno snapshot preso *dopo* aver modificato il file registrerebbe come "originale" il nostro, e il controllo diventerebbe una tautologia che passa sempre. Ripetuta anche nel blocco M2.1 di `PIANO.md`, che è il primo task che ci passa sopra.

### La scala: shadcn prima, personalizzazione ultima, e mai di iniziativa

Indirizzo di Francesco, che cambia una cosa che avevo scritto male. Nella regola 4bis avevo messo *«se serve una variante nuova, si fa un componente nostro che avvolge quello shadcn»* — come se fosse una via sempre aperta, a discrezione di chi scrive. Non lo è. La regola riscritta è una **scala di quattro gradini che non si saltano**:

1. **il default shadcn così com'è** — e la domanda si fa all'MCP, non si presume;
2. **ri-stile delle sole stringhe di classi** — l'unica personalizzazione che si fa senza chiedere;
3. **se il v1 non ci sta dentro, si adatta il v1, non shadcn** — il gradino che si salta più facilmente, ed è il più importante: il v1 non è la specifica, è il punto di partenza, nato prima che ci fosse una libreria di primitive a cui appoggiarsi. Accogliere il modo di shadcn costa una decisione una volta; mantenere il nostro costa a ogni aggiornamento, per sempre;
4. **solo qui, si PROPONE un componente nostro e si aspetta la conferma di Francesco** — mai deciso di iniziativa, mai "intanto lo scrivo". La proposta deve dire cosa è stato provato ai gradini 1–3 e perché non è bastato: non «shadcn non ce l'ha», ma quale componente shadcn è stato guardato, come lo risolve, e cosa si perderebbe accogliendolo.

Un precedente utile in casa, che è il gradino 3 applicato bene: in M1.2 il terzo livello di testo del v1 (`--color-text-hint`) non è stato salvato con un token o un componente apposta — è stato **eliminato**, perché non reggeva il contrasto.

### La tracciatura è una condizione, non una nota a posteriori

Perché "sempre tracciata" non dipenda dalla diligenza di chi scrive, il registro è **letto dal controllo**: `registry/componenti-propri.json` dichiara ogni componente nostro con file, cosa fa, quale strada shadcn è stata provata, chi ha approvato e quando; `docs/DECISIONI.md` §10 ne tiene il ragionamento esteso. `npm run check:registry` **rifiuta** un file in `registry/tassullo/ui/` che non abbia né un originale shadcn né una riga completa nel registro. Un componente non dichiarato non è un componente mal documentato: è un componente che non passa.

Provato su quattro scenari, tutti rilevati con uscita 1 tranne il terzo:
- componente nostro **non dichiarato** → errore, con stampata la scala da risalire e il comando giusto nei due casi (viene da shadcn / è nostro);
- **dichiarato senza** motivazione o approvazione → errore che nomina i campi vuoti;
- **dichiarato per intero** → ammesso, e stampato come `▣ componente NOSTRO — … (approvato da Francesco, data)`;
- **voce rimasta nel registro** dopo la cancellazione del file → errore: il registro non accumula fantasmi.

Oggi il registro è **vuoto**, ed è la condizione da difendere: tutto ciò che c'è nel registry viene da shadcn, con forma intatta.

### Prossimi passi

Invariati: **M1.3**, modalità scura e chiusura di D2. Da tenere presente che da qui in poi la FASE 2 ha un ordine operativo obbligatorio a ogni `add` (regola 4ter) e una scala da risalire prima di scrivere qualsiasi cosa che shadcn non abbia (regola 4bis).

## 2026-09-07 — M1.3: la modalità scura, e D2 chiusa

Il v1 non ha una palette scura. Questa è **progettata**, e la differenza rispetto a M1.2 è tutta qui: là si traduceva un file esistente e il lavoro era non sbagliare la conversione, qui si sceglie. Perché "scegliere" non diventi "inventare a occhio", la palette scura è costruita con **tre regole scritte accanto ai valori**, nello script.

### Le tre regole

1. **I neutri si invertono partendo da ciò che il v1 ha già collaudato.** La sidebar antracite è l'unica superficie scura del v1 in produzione da due anni: i suoi valori diventano i neutri di pagina — `#141414`, `#1C1C1C`, `#262626`, `#2E2E2E`, `#EDEDEB`, `#A8A8A8`. Non è un ossequio al v1: è che quei sei valori sono già stati guardati per due anni da chi usa le app.
2. **Il brand non cambia.** `--primary` resta l'arancio con testo nero in entrambe le modalità. Cambia solo la **direzione dell'hover**: sul chiaro il v1 scurisce di ΔL 0.051, e sul fondo scuro la stessa mossa è schiarire (`#FFBE5A`).
3. **I tenui si specchiano a gradini fissi**, uguali per tutte le famiglie: alla tinta del pieno chiaro, `subtle` a `l 0.28 c 0.05`, bordo `l 0.42 c 0.10`, testo `l 0.85 c 0.08`. Un gradino solo per tutte è ciò che fa **pesare uguale** i quattro alert, che è il requisito di M2.4 — se una famiglia salta all'occhio più delle altre, il suo alert sembra più grave di quello che è.

I pieni semantici restano quelli del chiaro: un colore per stato in tutte le app è il punto stesso degli stati semantici. `--destructive` `#DC2626` regge anche sul fondo scuro (3.81:1, sopra la soglia 3:1 dei componenti non testuali).

### I tre scostamenti, e il secondo è quello che ho imparato qualcosa

- **`--info` `#1A5276` → `#4BAFF2`.** L'unico pieno ricalcolato, e non per gusto: il blu scuro del v1 dà **2.20:1** sul fondo scuro, cioè un badge che non si vede. Ripreso alla propria tinta sulla banda media dei pieni chiari (`l 0.725 c 0.134`) — la **stessa costruzione** già usata per `deriveInfoBorder`, non un valore scelto a occhio. Ora 7.64:1, testo nero come su tutti i fondi saturi chiari.

- **`--warning` resta `#FBE8C4`, e la correzione ovvia è stata provata e scartata.** È a `l 0.937` contro `l 0.58–0.79` di tutti gli altri pieni: sul fondo scuro è la cosa più luminosa della pagina, e la prima reazione guardandolo è "riportalo nella banda, come hai fatto con `info`". L'ho calcolato: a `l 0.725` il giallo diventa `#CE9E2F`, che sta a **ΔL 0.07 e Δh 9.6** da `--primary` `#F4AC3D`. Cioè un badge di avviso indistinguibile dal brand — un difetto peggiore di un badge troppo luminoso. **La lightness alta è ciò che tiene `--warning` separato dall'arancio**, e nella modalità chiara la collisione non si vede solo perché lì il crema è chiaro. Il valore resta com'era, ma non per inerzia: ora si sa perché, e chi lo vorrà cambiare troverà scritto cosa succede.

- **`--sidebar` `#141414` → `#1C1C1C`.** Sul chiaro la sidebar antracite stacca dalla pagina; sullo scuro la pagina **è** antracite e una sidebar dello stesso valore sparisce. Sale al livello della card.

Cambiato anche `--overlay`, da 45% a 70% dello stesso nero Tassullo: un velo al 45% dello stesso colore della pagina non separa più niente. E le serie dei grafici (provvisorie, M2.8) sono ribaltate: la rampa chiara scende a `#3C3C3C`, che sul fondo scuro non si vedrebbe.

### Due cose costruite per rendere la palette scura *verificabile*, non solo scritta

**Il gate controlla ora anche la parità dei token.** Verifica 48 coppie (24 per modalità) e, in più, che le due palette dichiarino **gli stessi nomi nello stesso ordine**. Serve perché il blocco `@theme inline` espone le utility a partire dalle sole chiavi del chiaro: un token dichiarato solo lì resterebbe al valore chiaro in modalità scura — cioè un colore **sbagliato** e non **mancante**, che è peggio, perché non si nota. Provata nei due modi in cui può rompersi: togliendo `--border-strong` dallo scuro → «token presenti solo nel chiaro: border-strong», uscita **1**; scambiando `input` e `ring` nello scuro → «le due palette hanno gli stessi token ma in ordine diverso», uscita **1**. L'ordine conta perché è ciò che rende leggibile il diff fra le due palette affiancate nello script.

**Il chiaro si emette su `:root` *e* su `.light`.** Non è un doppione. Una palette scura si giudica **affiancata** a quella chiara, non alternandola con l'interruttore: fra un clic e l'altro la memoria dell'occhio non regge, e si finisce per approvare qualunque cosa. Ma per mettere una colonna chiara dentro una pagina che ha `.dark` sulla radice serve un modo di tornare chiari su un sottoalbero, e nel tema non esisteva. Verificato col browser: forzando `.dark` su `<html>`, la colonna chiara continua a riportare `--background: oklch(0.9726 …)`.

### Verifiche eseguite

- `npm run check:contrast` → **0 violazioni su 48 coppie**, 24 per modalità, e file del tema allineato allo script.
- `npm run check:registry` → 0 errori, 32/32 token standard ancora presenti, 0 token custom dentro i componenti. I 4 avvisi residui sono i valori arbitrari ereditati da shadcn, già in carico a M2.1.
- **Criterio di accettazione, verificato e non dichiarato**: story `Tema/Palette` aperta nel browser con le due palette affiancate; screenshot in `docs/img/M1.3-palette-chiaro-scuro.png`. La parità di peso delle quattro famiglie tenui si vede.
- **L'interruttore tema ora fa qualcosa** — in M1.2 non faceva nulla ed era atteso, perché `.dark` era vuoto. Verificato sul workbench forzando `.dark`: `body` passa a `oklch(0.1913 0 0)` con testo `oklch(0.9455 …)`, e le primitive vere seguono.
- `npx tsc -b --force`, `npx oxlint`, `npm run build` verdi.
- Nessuna modifica al repo v1 né alle app.

### Ricadute annotate dove verranno lette

- **`PIANO.md` §2bis** ha ora una sezione *La modalità scura* con le tre regole, i tre scostamenti e le due conseguenze; il blocco **M1.3** riporta l'esito.
- **Blocco M2.1 di `PIANO.md`**, due rilievi rimisurati in scuro e uno cambia il quadro: `variant: link` in dark dà **9.49:1** e **passa** — il difetto esiste solo in chiaro, quindi guardando la primitiva con l'interruttore sullo scuro sembra a posto. È il primo caso concreto di un difetto che una sola delle quattro combinazioni rivela. Il rimedio previsto regge comunque in entrambe, e non per fortuna: `--accent-ink` è definito per modalità, quindi `text-accent-ink` è **una sola classe** corretta sia in chiaro (4.77:1) sia in scuro (9.49:1). `variant: destructive` in dark **peggiora** a 3.25:1. Da lì una regola per tutta la FASE 2: **una misura fatta in una sola modalità non è una misura.**
- **`CLAUDE.md`** — corretta una deriva: diceva «26 coppie», sono **24 per modalità, 48 in tutto**. Aggiunte la parità dei token e il selettore `.light` fra i comandi; precisato che la regola `text-accent-ink` e mai `text-primary` vale in entrambe le modalità, e **proprio perché** sul fondo scuro `--accent-ink` coincide con `--primary`: è ciò che rende `text-primary` un difetto invisibile in dark.

### D2 — chiusa il 2026-09-07

**Motivazione.** La decisione chiedeva di fissare i valori della palette scura «guardandola, non al buio», ed è stata chiusa così: le due palette affiancate nella story `Tema/Palette`, non alternate. I valori non sono inventati — i neutri vengono dalla sidebar v1 già in produzione, i tenui da una costruzione uniforme, il brand non si tocca — e i **tre** punti in cui si scostano dalla proposta del piano sono ciascuno una misura: 2.20:1 per `--info`, la collisione con `--primary` per `--warning`, la sparizione della sidebar sulla pagina antracite. Ciò che resta aperto non è la decisione ma il gusto: se un valore andrà ritoccato, si cambia la costante nello script e `npm run theme:build` più `check:contrast` rifanno tutto il resto.

### Prossimi passi

**M1.4** — densità touch. Sono già noti i due pezzi che mancano: lo **scatto di tipografia**, che non deriva da `--spacing` e quindi non arriva da solo, e la verifica che lo scaling non deformi larghezze massime, icone e sidebar. Il valore provvisorio in `src/index.css` è `0.34375rem` e va chiuso lì (`docs/DECISIONI.md` §6). Con M1.3 fatto, la densità va ora provata su **quattro** combinazioni e non due.

## 2026-09-07 — Il pannello Accessibility guardato davvero: 9 violazioni, tutte mie

Rilievo di Francesco su M1.3, e aveva ragione due volte: sulla pagina Palette (troppo testo di commento) e sul pannello **Accessibility** di Storybook, che segnava **Violations 1** — *serious*, `color-contrast`, 9 nodi. Avevo dichiarato il task finito senza aprirlo. È il difetto più imbarazzante possibile su un task il cui criterio è il contrasto.

### Cosa dice axe, e cosa dicevo io

Prima di guardare ho provato a stimare a mano con uno script nel browser: **sbagliava tutto**, perché i colori calcolati sono `oklch(…)` e il mio parser leggeva i numeri come se fossero RGB — 216 falsi positivi con rapporto 1.00 su testo perfettamente leggibile. Scartato e caricato axe-core vero (`node_modules/axe-core`, servito via `/@fs/` dal dev server di Storybook). Lezione secca: **quando esiste lo strumento, si usa lo strumento**; una misura fatta al volo che non si sa validare è peggio di nessuna misura, perché sembra un dato.

Le 9 violazioni erano **tutte la stessa cosa, e tutte mie**: `opacity-80` sulla terza riga di ogni tessera, messa per attenuarla. Una coppia che passa a 4.55:1 sbiadita all'80% scende a **3.17:1**. La pagina che dimostra il contrasto lo stava rompendo.

**Il punto generale, che vale oltre questa pagina.** `opacity-*` su un testo **non è una scelta tipografica**: è un cambio di colore che nessun token dichiara e che avviene *in composizione*, nel browser. `check:contrast` non può vederlo — verifica coppie di token, e i due token qui sono giusti. Se una riga deve pesare meno si usa un token più tenue, che è già stato misurato, o un gradino tipografico più piccolo. Scritto nel commento in testa alla story, dove chi la modifica lo trova.

Tolta l'opacità e tolti i due paragrafi di commento dall'intestazione: **axe su tutte le regole, 0 violazioni e 0 incomplete**, 9 controlli passati.

### E intanto axe ha confermato i rilievi su `button`, correggendo le mie stime

Passato lo stesso controllo su `Primitive/Button`, in **entrambe** le modalità:

| variante | chiaro | scuro |
|---|---|---|
| `destructive` | **3.82:1** | **3.57:1** |
| `link` | **1.79:1** | *nessuna violazione* |

Due cose. La prima: axe **conferma sperimentalmente** ciò che avevo dedotto poche ore fa dai token — il difetto di `link` **esiste solo in chiaro** e in scuro non compare affatto. La seconda: le mie stime a mano per `destructive` (3.94 chiaro / 3.25 scuro) erano **sbagliate di poco ma sbagliate**, perché calcolavo la composizione io invece di leggere il pixel. Le misure di axe sostituiscono le mie nel blocco M2.1, e da qui in poi **fa fede axe**.

### La regola, perché non dipenda dal fatto che me lo ricordi

In `CLAUDE.md` §Conduzione: **prima di dichiarare finito un task, il pannello Accessibility di ogni story toccata deve essere a zero violazioni, guardato in entrambe le modalità.** Una violazione o si chiude, o si annota nel blocco del task che la chiuderà, con la misura.

Con una precisazione che mancava in tutto il piano e che chiarisce M2.9: **axe-core c'è già**, è nel pannello di ogni story dal primo giorno. Quello che M2.9 aggiunge non è lo strumento ma l'**automazione** (`a11y.test = 'error'` in CI). Annotata anche la sua **condizione d'ingresso**: il conto delle violazioni aperte deve essere zero prima di girare l'interruttore, e oggi non lo è (2 su `button`, in carico a M2.1). Una CI rossa il primo giorno è una CI che qualcuno disattiva la settimana dopo.

### Verifiche eseguite

- axe-core su `Tema/Palette`, tutte le regole: **0 violazioni, 0 incomplete, 9 passate**.
- axe-core su `Primitive/Button` in chiaro e in scuro: 2 violazioni note, entrambe già in carico a M2.1 e ora misurate.
- `npm run check` (contrasto + registry), `npx tsc -b --force`, `npx oxlint`, `npm run build`, `npm run build-storybook`: verdi.
- Screenshot `docs/img/M1.3-palette-chiaro-scuro.png` rifatto sulla pagina corretta.

### Rimasto fuori, di proposito

Le note **sotto ogni gruppo** ("L'arancio è identico nelle due modalità…", "Le quattro famiglie devono pesare uguale…") sono rimaste: sono didascalie del gruppo, non preambolo, e servono a dire cosa guardare in quelle tessere. Se anche quelle sono di troppo, si tolgono.

## 2026-09-07 — M1.4: la densità touch, e la leva che mancava

Il piano dava la densità per risolta in una riga: `[data-density="touch"] { --spacing: … }`. La riga funziona davvero — nessuna primitiva è stata toccata, ed è il punto in cui il v2 guadagna sul v1, che per la stessa cosa doveva scrivere nove regole per-componente a mano. Ma le leve sono **due**, non una, e la seconda ha un trabocchetto che l'avrebbe resa muta.

### La prima leva: 48px, non 44

`--spacing: 0.375rem` (6px, ×1.5). Il default del bottone in questo preset è `h-8` — 32px, non `h-9` come stimava il piano — e a ×1.5 arriva a **48px**. Misurato a video nelle due densità:

| taglia | normale | touch |
|---|---|---|
| xs | 24px | 36px |
| sm | 28px | 42px |
| default | **32px** | **48px** |
| lg | 36px | 54px |
| icona nel bottone | 16px | 24px |

La strada alternativa era `0.34375rem` (×1.375), il minimo per arrivare ai 44px di Apple, ed era il valore provvisorio scritto in M0.3. Scartata per due misure: **48px è l'altezza che il v1 dà a `.btn` in touch**, in cantiere da due anni — l'unico dato di campo che abbiamo, e anche il minimo di Material — e il fattore 1,375 lascia mezzi pixel su ogni gradino dispari (`h-7` a 38,5px, `h-9` a 49,5px), mentre a 6px tondi tutta la scala cade su interi.

`xs` (36px) e `sm` (42px) restano sotto i 44 anche in touch, ed è **voluto**: è la stessa scelta del v1, che teneva `.btn-sm` a 34px in touch con la ragione scritta accanto — «è la taglia da riga di tabella, dove il bersaglio è un mouse». Le nostre sono più generose delle sue.

La terza strada del rilievo di M0.3 — adottare `lg` come default in touch — è stata scartata senza misurarla: cambierebbe il default di un componente, cioè il gradino 2 della regola 4bis, e obbligherebbe ogni app a scrivere `size` diversi per densità. L'interfaccia verso le app deve restare una riga nell'`index.html`.

### La seconda leva, e il difetto che sarebbe stato muto

La tipografia non deriva da `--spacing`: il piano lo diceva, senza dire come farla scattare. Il come si scontra con una cosa che nel tema c'era già: **`@theme inline` cuoce i valori**. Letto nel CSS compilato, prima di scrivere una riga:

```
.text-sm { font-size: 12px }          /* con @theme inline */
.text-sm { font-size: var(--text-sm) } /* con @theme semplice */
```

Con `inline`, ridichiarare `--text-sm` sotto `[data-density]` non fa **niente** — e non fallisce: nessun errore, il testo semplicemente non scatta, e la cosa si scopre guardando. La scala tipografica è stata quindi spostata in un `@theme` semplice. I colori restano `inline`, perché lì l'indirezione serve al contrario (`--color-primary: var(--primary)`) e la densità non li tocca.

**Il fattore è ×1.08, arrotondato al pixel**, e non è scelto a occhio: è quello che riproduce il passo del v1, che in touch alzava il testo del bottone di **un gradino** della scala (`--text-md` 13px → `--text-base` 14px). Applicato all'intera scala dà 11→12, 12→13, 13→14, 14→15 — cioè esattamente «il gradino successivo» dove i gradini distano 1px — e prosegue con la stessa proporzione sui titoli, 15→16, 18→19, 26→28, dove i gradini sono più larghi e uno scatto secco farebbe collidere il corpo col titolo di card. Non ×1.5 come i bersagli: un bersaglio deve crescere del 50% per stare sotto un dito guantato, un testo a 13px è già leggibile e portarlo a 20px non lo migliora — rompe le colonne.

### Tre decisioni di collocazione, tutte con la stessa ragione

- **La densità sta nel tema, non in `src/index.css`.** Ci stava in via provvisoria da M0.3, quando il tema non esisteva ancora. La densità è un token: lasciata nel workbench, sarebbe la prima riga del registry che un'app non riceve installando `registry:theme`.
- **I blocchi emessi sono due, `touch` e `normale`.** Il secondo non è un doppione dei valori di `@theme`: senza, la densità saprebbe solo crescere, e non ci sarebbe modo di rimettere la densità normale *dentro* un sottoalbero touch — che è la sola forma in cui le due si guardano affiancate. È lo stesso ragionamento che in M1.3 ha prodotto `.light`, e la seconda volta che si presenta: **una pagina che dimostra una scelta deve poter mostrare anche ciò che la scelta non è.**
- **I due blocchi escono da una costante sola** nello script (`SPACING` e `TIPOGRAFIA`), con `emitScala()` e `emitDensita()`. Due elenchi di sette valori scritti a mano divergono al primo ritocco.

### La prova: una pagina che misura invece di dichiarare

`stories/Densita.stories.tsx` — `Tema/Densità`, le due densità affiancate. Ogni riga riporta l'altezza reale del suo elemento, letta con `getBoundingClientRect` dopo il layout, e il font-size calcolato; la sezione «Ciò che non scala» legge `border-radius`, `border-width` e `max-width` dal DOM invece di affermarli. È una scelta contro un difetto preciso: **una tabella di numeri scritta a mano resta verde anche il giorno in cui il CSS smette di funzionare**, e questa pagina serve a dire che funziona. Un primo abbozzo aveva una barra `max-w-page` che avrebbe dovuto mostrare l'invarianza della larghezza: ma la barra è ritagliata dalla colonna, quindi era piena in entrambe e non dimostrava nulla. Sostituita col valore letto — 1180px in tutte e due.

### Cosa non scala, e le due eccezioni

Restano identici nelle due densità, verificato a video: raggi (`rounded-md` 6px), larghezze dei bordi (1px), `max-w-page` (1180px), la scala `--container-*` di Tailwind. Cresce il respiro dentro il contenitore, non il contenitore.

Due eccezioni accertate, **entrambe fuori da M1.4 e annotate nel blocco che le chiuderà**:

- **La sidebar non si allarga.** `SIDEBAR_WIDTH` (`16rem`), `SIDEBAR_WIDTH_ICON` (`3rem`), `SIDEBAR_WIDTH_MOBILE` (`18rem`) sono costanti JavaScript in `sidebar.tsx`, passate come `style` inline sul provider: non derivano da `--spacing`. In touch le voci di menu passano da 32 a 48px dentro una colonna che resta 256px, e il rail collassato — 48px — viene riempito esattamente da un `SidebarMenuButton` da 48px, senza margine attorno all'icona. Il rimedio **non richiede di patchare il componente**: `SidebarProvider` accetta uno `style` che sovrascrive le tre variabili. In carico a **M2.5**, con l'aggiunta all'accettazione di provarlo nelle due densità.
- **La taglia `sm` del bottone non segue lo scatto tipografico**: usa `text-[0.8rem]`, valore arbitrario ereditato da shadcn, e resta a 12,8px in entrambe le densità. Era già uno dei quattro rilievi in carico a **M2.1** — ora si sa che costa anche questo, e la riga della tabella lo riporta.

### Verifiche eseguite

- **Criterio «senza ricaricare»**: interruttore Densità cliccato nella barra di Storybook, i bottoni crescono a video e la pagina non si ricarica (il decorator agisce in `useEffect` su un attributo).
- **Criterio «bersagli ≥44px»**: default 48px, lg 54px, misurati. `xs` e `sm` sotto soglia di proposito, come nel v1.
- **Criterio «lo scaling non deforma ciò che non deve»**: raggi, bordi, `max-w-page` e `--container-*` letti in entrambe le densità e identici; icona nel bottone 16→24px, che è il caso che si voleva far scalare.
- **`<body data-density="touch">`**, la forma letterale del v1, verificata identica all'attributo su `<html>`: i due token si ereditano. È la garanzia che Officina non debba cambiare niente.
- **axe-core in quattro combinazioni.** `Tema/Densità`: **0 violazioni, 0 incomplete**, 12 controlli passati, in chiaro e in scuro. `Primitive/Button` in densità touch: le stesse 2 violazioni note (`destructive` 3.82:1 chiaro / 3.57:1 scuro, `link` 1.79:1 solo chiaro) e nessuna nuova — la densità non ne introduce. `Tema/Palette` in touch: 0 e 0.
- **Un'*incomplete* nuova, annotata**: `Primitive/Button` in scuro riporta un `color-contrast` *incomplete* su `ghost` («1:1 con lo sfondo»: fondo trasparente, axe non risolve). Presente identica nelle due densità, quindi **non** è di M1.4 — è del bottone, e va con gli altri rilievi di M2.1.
- `npm run check` (contrasto 48/48 + registry 0 errori), `npx tsc -b --force`, `npx oxlint`, `npm run build`, `npm run build-storybook`: verdi.
- Nessuna modifica al repo v1 né alle app. Il v1 è stato **letto** (`components.css`, blocco densità in coda) come fonte per il passo tipografico e per le altezze collaudate.

### Scostamento minore

`.claude/launch.json`: la voce Storybook aveva la porta 6006 fissa negli argomenti e non poteva convivere con un'altra sessione già in ascolto. Tolto il flag e messo `autoPort`. La porta di Storybook non è vincolata da nessuna decisione — quella fissa è **5180**, del workbench, perché è anche il server del registry che l'MCP interroga.

### Prossimi passi

**M1.5** — il tema come item `registry:theme` in `registry.json`, e la pagina Palette completata col click-to-copy. Da tenere presente: l'item dovrà portare con sé il file CSS **intero**, blocchi di densità compresi, e non solo i `cssVars` — i due blocchi `[data-density]` non sono variabili di tema e non hanno posto nel campo `cssVars`. È il primo caso in cui si vede se il canale `registry:theme` basta a distribuire tutto il tema.

### Indirizzo di Francesco, subito dopo M1.4 — D10 aperta

La densità va provata su un **blocco**, cioè su una pagina demo completa, e la domanda è se su mobile serva una densità diversa da quella desktop. Il timore: che un'interfaccia progettata a densità desktop «non funzioni» su mobile quando la densità cambia.

Il timore è fondato, ma il pericolo non sta dove sembra. La densità non è un asse mobile/desktop — touch nasce per il **cantiere**, cioè proprio per il telefono, ed è l'app a dichiararla, non il dispositivo. Il guaio è che le due cose coincidono: **la densità che gonfia è esattamente quella che si usa dove il viewport è più stretto.** In touch la spaziatura cresce del 50%, il testo dell'8%, la larghezza dello schermo di 0 — e la differenza la paga tutta la colonna di contenuto. Aritmetica su un telefono da 375px: un `px-10` di pagina passa da 40 a 60px per lato, cioè da 295 a **255px** di colonna utile, mentre le stringhe da mandare a capo sono più lunghe dell'8%. In verticale, `space-y-6` passa da 24 a 36px: un form di dieci righe guadagna un terzo di schermata.

Non è una cosa che si decide a tavolino, ed è per questo che diventa **D10** invece di una riga di CSS scritta adesso. La prima misura si prende in **M3.1** (`tassullo-app-shell`), che è il primo punto in cui la domanda è rispondibile perché la shell possiede il padding di pagina — sono quelle utility, non le altezze dei controlli, a mangiare la larghezza. Il verdetto si prende in **M4.2** (`pagina-lista`), la pagina più densa che avremo. Le tre uscite possibili sono scritte lì, e la meno desiderabile è ridurre il fattore sotto una certa larghezza: rimetterebbe il viewport a decidere una cosa che è deliberatamente una scelta dell'app.

Ricaduta già annotata: l'accettazione di **M3.1** e **M4.2** passa da «resa a 1440 e a 375» a «viewport × densità», quattro celle, e quella che decide è `375px × touch`.

---

## 2026-09-08 — M1.5: il tema esce di casa, e il canale che tace

Chiude la FASE 1. Il tema è dichiarato come item `registry:theme` in `registry.json`, e la pagina `Tema/Palette` è completa: tutti i 56 token, il valore `oklch` **letto dal DOM**, click-to-copy.

L'accettazione del piano chiedeva `registry validate` verde. È verde, ma da sola non dimostrava niente di ciò che questa sessione doveva sapere — se il canale `registry:theme` **basta a portare tutto il tema**, che era la domanda lasciata aperta dai «prossimi passi» di M1.4. Quindi il tema è stato **installato per davvero** su un'app Vite+React+Tailwind v4 costruita apposta, e la risposta è arrivata da lì.

### Il prompt del piano era sbagliato in due punti, e nessuno dei due si vede a metà

Il piano diceva: `cssVars` per `theme`/`light`/`dark`, **più** il file CSS con `target` sul CSS globale dell'app. Provati entrambi (shadcn CLI **4.21.0**):

- **`cssVars.theme` finisce in `@theme inline`.** Che è precisamente il blocco in cui la scala tipografica non può stare: `inline` cuoce il valore dentro l'utility, e la densità smette di scattare — il difetto muto già accertato in M1.4. Non esiste un campo che scriva in un `@theme` **semplice**.
- **Il `target` sul CSS globale dell'app lo sostituisce.** Non ci si fonde: dopo l'installazione `src/index.css` era una riga sola, `@import "tailwindcss"` compreso. L'app era da rifare.

E il ripiego naturale — mettere il `@theme` nel campo `css`, che regge at-rule e selettori arbitrari — fa due cose, tutte e due cattive: **da solo sparisce senza un errore**; **insieme a qualunque altra chiave la CLI muore e non installa niente** (`update-css: <css input>:1:7: Unknown word 13px`, perché costruisce `.temp{13px}`). Un canale che a seconda del contorno o tace o esplode non è un canale.

Rettifica scritta in `PIANO.md` §M1.5, con la misura e il perché in `docs/DECISIONI.md` §11.

### La forma adottata, e perché il file intero e non l'elenco di variabili

```jsonc
{ "name": "tema", "type": "registry:theme",
  "files": [{ "path": "registry/tassullo/theme/tassullo-theme.css",
              "type": "registry:theme", "target": "src/tassullo-theme.css" }],
  "css": { "@import \"./tassullo-theme.css\"": {} },
  "docs": "…" }
```

La scoperta che rende la cosa automatica invece che manuale: **`css` accetta un `@import` come chiave**, e la CLI lo colloca al posto giusto — subito dopo `@import "tailwindcss"`, prima di `:root`. Senza, il file arriverebbe nell'app e nessuno lo importerebbe.

Tre ragioni per il file intero, in ordine di peso: **il `@theme` semplice esiste solo così**; con `cssVars` la palette starebbe **due volte** nel repo — nella costante dello script e nel JSON dell'item — e due elenchi divergono al primo ritocco; **i commenti arrivano**, cioè le due trappole viaggiano col tema invece di restare qui.

### Il commento che non arriva, e la disposizione che lo rimedia

`shadcn build` **scarta il primo commento** di un file del registry: 379 righe in casa, 357 nell'app, e la differenza è tutto e solo il blocco di testa — cioè, prima di questa sessione, proprio le due trappole. Il rimedio non è un accorgimento ma la disposizione: `buildTheme()` emette ora **due** commenti. Il primo — sacrificabile — dice ciò che vale solo dentro il repo («generato da, non modificare a mano») e sa di essere quello che verrà buttato. Il secondo, che viaggia, è il tema visto da chi lo installa: com'è fatto, come si aggiorna, la riga della densità, il passo a mano, le due trappole.

### Il passo a mano che resta, messo dove non si può non vederlo

Il file è importato **prima** del `:root` che l'app si porta da `shadcn init`, e in CSS a parità di specificità vince l'ultimo: **la palette di partenza di shadcn copre quella Tassullo**. Dal lato del registry non è evitabile senza duplicare la palette nell'item, che è ciò che si è appena deciso di non fare. Si toglie a mano, è un blocco solo, e l'istruzione sta nel campo **`docs` dell'item — che la CLI stampa a fine installazione** (verificato) — oltre che nel commento di testa del file. Ricaduta su **M5.5**: è il primo passo della guida di migrazione, già misurato.

### La pagina Palette: cosa è cambiato

- **I 56 token, tutti.** Ne mancavano tre (`sidebar-border`, `sidebar-ring`, `overlay`), ora in un gruppo loro. Il conto in intestazione non è scritto a mano: è `new Set(...).size` sulle due tabelle, perché un numero scritto a mano è vero il giorno in cui lo si scrive.
- **Il valore `oklch` è letto dal DOM**, con `getComputedStyle`, dall'elemento che quel colore lo sta mostrando. Stessa scelta di `Tema/Densità` e stessa ragione: un elenco copiato a mano resta verde anche il giorno in cui il tema smette di funzionare. In più le proprietà custom si ereditano, quindi la colonna chiara e quella scura riportano ciascuna il proprio valore **senza che la story sappia nulla della palette** — che resta nello script, dove è la fonte unica.
- **Click-to-copy**: copia il **nome del token**, non il valore. Il nome è ciò che si scrive nel codice; incollare il valore sarebbe il valore arbitrario che la regola 3 vieta. `navigator.clipboard.writeText` **è negato dentro l'iframe di Storybook** — misurato, `NotAllowedError: Write permission denied` — quindi il ripiego `execCommand` non è difensivismo: è la strada che viene percorsa davvero, e la verifica l'ha vista percorrere con `--overlay` selezionato nella textarea.
- **`--overlay` si guarda sopra qualcosa, non accanto.** La tessera lo mette su un fondo a bande. Le bande sono bande e non una scritta di proposito: axe misura il contrasto di qualunque testo visibile, e un testo sotto un velo è per definizione «sovrapposto da un altro elemento» — un *incomplete* acceso per sempre che non dimostra nulla (misurato: 2 nodi, uno per colonna, prima di sostituirlo).

### Verifiche eseguite

- **Installazione end-to-end**, app Vite vuota, registry servito dal workbench su `http://localhost:5180/r/`: file creato in `src/tassullo-theme.css`, `@import` al posto giusto, `docs` stampato. Tolto a mano il blocco di `init`, `vite build` compila **`.text-title{font-size:var(--text-title)}`** e `.text-md{font-size:var(--text-md)}` — la tipografia resta una variabile, cioè la densità scatta anche nell'app — più `.max-w-page{max-width:1180px}`, i due blocchi `[data-density]`, `.dark`, e `bg-primary`/`text-accent-ink`/`bg-sidebar` risolti. Ri-lanciando il comando l'`@import` **non** si duplica.
- **axe-core su `Tema/Palette`: 0 violazioni, 0 incomplete**, 14 controlli passati, a **1440×900** e nelle due densità (`touch` e `normale`). La story mostra le due palette affiancate, quindi la modalità è coperta dalla pagina stessa. Ricontrollato anche a 375, 768, 1023 e 1024: 0 e 0 dappertutto.
- **Un falso positivo di axe, da riconoscere se ricapita.** Su una finestra non emulata la pagina si impilava fino a **38 314 px** e in quello stato axe restituiva **326 `incomplete`** («Unable to determine contrast ratio», cioè quasi ogni testo) e **2 violazioni** — fra cui `--muted-foreground` sul fondo scuro dato a **2.19:1**, quando quella coppia è nel gate e misura **7.75:1**. axe risolve il fondo di un testo col punto, non con l'albero, e su una pagina così alta prendeva il fondo *chiaro* della cornice per un testo della colonna *scura*. Non è un difetto della pagina: è una lettura da buttare. **Quando quasi ogni nodo è «unable to determine», il verdetto non vale**; si rimisura a viewport dichiarata.
- `npm run check` (contrasto 48/48, registry 0 errori), `npx shadcn@latest registry validate ./registry.json` (2 item), `npx tsc -b --force`, `npx oxlint`, `npm run build`, `npm run build-storybook`: verdi.
- Nessuna modifica al repo v1 né alle app. L'app di prova sta fuori dal repo, nella cartella temporanea di sessione.

### Scostamenti

- **`public/r/tema.json` committato**, come già `button.json`: è l'artefatto che GitHub servirà a D4 chiusa.
- Il `@theme` semplice della tipografia **non è stato spostato** in `@theme inline` con un'indirezione (`--text-md: var(--type-md)`), che pure renderebbe il tema esprimibile tutto in `cssVars`. Sarebbe riaprire una decisione chiusa da M1.4 per guadagnare il canale peggiore dei due; annotato qui perché la strada esiste e non è stata dimenticata.

### Prossimi passi

**FASE 2, M2.1 — Fondamenta.** Arriva con quattro rilievi già misurati e in carico: `destructive` a 3.82:1 in chiaro e 3.57:1 in scuro, `link` a 1.79:1 in chiaro, l'*incomplete* su `ghost` in scuro, e il `text-[0.8rem]` della taglia `sm` che M1.4 ha mostrato non seguire la densità.

---

## 2026-09-08 — Il font: niente da scegliere, e due pesi che non esistono

Rilievo di Francesco: «manca da decidere il font, da DECISIONI risulta impostato Geist». Il presupposto era sbagliato, ma la domanda ha scoperto due cose che valevano la sessione.

**Geist non è impostato.** La riga letta è nella tabella §2 di `DECISIONI.md`, «cosa il preset `nova` porta con sé», e la sua colonna *Destino* dice «caduto in M1.2». Riverificato: nessuna dipendenza `geist`, nessuna occorrenza in `src/`, `registry/`, `stories/`, `.storybook/`, `index.html`.

**Lo stack è già quello del v1, carattere per carattere** — `'Replicall', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`, e lo stesso mono. Cambia solo il nome del token (`--font-family` → `--font-sans`, lo spazio dei nomi di Tailwind/shadcn), più `--font-heading` che è un alias di `--font-sans`. Non c'era nessun font da scegliere.

### Primo buco: nessuna app carica Replicall, Studio compresa

Domanda di Francesco a metà sessione: cosa usa Studio? Interrogata **l'app in produzione** invece del repo, che dice cosa spedisce davvero: `--font-family` è lo stack v1 identico, ma **`document.fonts` è vuoto** e i fogli di stile caricati contengono **zero `CSSFontFaceRule`**. Studio rende in `-apple-system` — San Francisco sul Mac di Francesco, Segoe UI su Windows, qualcos'altro su un telefono. Non in Replicall.

Sommato ad Anagrafe (nessun `@font-face`) e ai due repo del design system (nessun file di font): **il carattere istituzionale non ha mai reso in nessuna app Tassullo, v1 compreso**. Lo screenshot che Francesco ha allegato è, sul suo Mac, San Francisco.

`gh` non è installato, quindi il repo GitHub di Studio non è stato letto; non è servito, perché la build in produzione è una prova più forte del sorgente — dice cosa arriva all'utente.

### Secondo buco, quello che pesa: 500 e 600 non esistono

Lette le `@font-face` di **tassullo.it**: la famiglia è servita dal CDN Webflow in **tre pesi soli** — `ReplicaLL-Light.otf` (300), `ReplicaLL-Regular.otf` (400), `ReplicaLL-Bold.otf` (700). **Niente 500, niente 600.**

Ma la gerarchia del v1 è costruita su 600 (×13) e 500 (×2), e quella del v2 su `font-semibold` (×14) e `font-medium` (×3). Con la sostituzione prevista dal CSS:

| scritto | reso con Replicall |
|---|---|
| `font-medium` (500) | **400 Regular** — indistinguibile dal corpo del testo |
| `font-semibold` (600) | **700 Bold** |

Quattro gradini scritti, **due resi**. Non è un guasto da riparare adesso: è una scelta di gerarchia che va presa **guardandola**, ed è la ragione più forte per caricare il font nel workbench *prima* di scrivere le primitive invece che dopo. Messa in carico a **M2.1** (`typography`), nella riga di `CHECKLIST.md`.

Vale la pena dirlo chiaramente: finché nessuna app carica il font, questo difetto **non si vede** — le app rendono in San Francisco, che i pesi 500 e 600 ce li ha. Si manifesterebbe il giorno in cui un'app carica Replicall, cioè nel momento peggiore.

### Fatto

- Tre `@font-face` in **`src/index.css`** — nel workbench, non nel tema: ciò che sta in `src/` non viaggia col registry. Pesi **300/400/700**, cioè quelli che la famiglia ha davvero; nessun corsivo, che né il sito né il v1 usano.
- `public/fonts/` con un `LEGGIMI.md` che dice quali file mettere, con che nomi, **dove sono** (i tre file del sito) e perché non si committano — più l'avvertenza sui pesi 500/600.
- `.gitignore`: `public/fonts/*` con eccezione del `LEGGIMI.md`.
- **Il tema distribuito non cambia**: continua a dichiarare solo lo stack e a non portare binari. D3 resta chiusa al default del v1, e la riga in `CHECKLIST.md` lo dice esplicitamente perché non si riapra per equivoco.

### Verifiche

- `public/fonts/` è servito **sia** dal workbench (5180) **sia** da Storybook (6006) — `curl` 200 su entrambi, quindi nessun `staticDirs` da aggiungere a `.storybook/main.ts`.
- Messo un file di comodo al posto di un peso: `document.fonts` riporta quel peso `loaded` e gli altri `error`. Cioè i pesi presenti si attivano e i mancanti degradano **per quel peso soltanto**. Lo stack risolto sulla radice parte da `Replicall`. File di comodo rimosso.
- `.gitignore` provato col binario in cartella: `git add -A` indicizza **solo** `LEGGIMI.md`, e `git check-ignore` conferma la regola. È la garanzia che la licenza Webflow non venga violata per distrazione.
- `npm run check`, `tsc -b`, `oxlint`, `build`, `build-storybook`: verdi.
- Nessuna modifica ad Anagrafe, Studio o al repo v1: sono stati **letti**, e Studio solo attraverso la sua build pubblica.

### Cosa resta a Francesco

Mettere i tre file in `public/fonts/` coi nomi del `LEGGIMI.md` — sono gli stessi che carica tassullo.it. Si accende da sé, basta ricaricare. Finché la cartella è vuota, la console mostra un 404 per peso e tutto degrada al font di sistema: **voluto, non un guasto**.

Quando arriveranno, due cose da riguardare con l'occhio: la scala di `Tema/Densità` (le altezze no, vengono da `--spacing`; le colonne di testo sì) e soprattutto la gerarchia dei pesi, che è la decisione vera e ora ha un posto dove essere presa.
