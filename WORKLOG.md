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

---

## 2026-09-08 — Replicall installato: la previsione sui pesi diventa una misura

Francesco ha fornito gli **otto `.otf`** della famiglia (licenza Lineto). Installati in `public/fonts/`, dove il `.gitignore` li tiene fuori dal repo.

### Ispezionati prima di installarli, e due correzioni

`fontTools` sui file, non fiducia nei nomi:

- contorni **CFF** tutti e otto — che conferma il vincolo già misurato: reportlab non li prende, quindi il canale PDF resta scoperto finché non arriva un `.ttf` o non si può convertire;
- `usWeightClass` **300 / 400 / 700 / 900**. **Heavy è 900, non 800**: la stima fatta prima di avere i file era sbagliata, e ora i pesi dichiarati nel CSS sono quelli che i file dichiarano di sé;
- `fsType` **4 — Preview & Print** su tutti: è il permesso di incorporamento *dichiarato dal file* — visualizzare e stampare sì, editing no — che per un PDF è, in principio, il caso giusto. Non è la licenza: la tabella `name` rimanda alla EULA Lineto, e le due domande aperte restano **conversione dei file** e **generazione da server**.

Otto facce dichiarate invece di sei: ci sono anche `LightItalic` e `HeavyItalic`, e non c'è ragione di lasciarli fuori. `.otf` e non `.woff2`: convertirli modificherebbe il file, che è una domanda per Lineto e non una scelta tecnica. Sono ~1,2 MB che carica solo il workbench, in locale.

### La previsione sui pesi era giusta, e ora è misurata

Larghezza della stessa stringa a 40px, col font caricato:

| `font-weight` | larghezza | rende |
|---|---|---|
| 300 | 475.20 px | Light |
| 400 | 496.41 px | Regular |
| **500** (`font-medium`) | **496.41 px** | **Regular — identico a 400** |
| **600** (`font-semibold`) | **529.20 px** | **Bold — identico a 700** |
| 700 | 529.20 px | Bold |
| 900 (`font-black`) | 536.41 px | Heavy |

Le larghezze coincidono alla **seconda cifra decimale**: non è un'approssimazione, è lo stesso file usato due volte. **Quattro gradini scritti nel design system, due resi.** Resta in carico a **M2.1**, dove ora la decisione si prende guardandola invece che deducendola — che era esattamente lo scopo di caricare il font prima di scrivere le primitive.

### Col font vero i gate restano verdi

- `Tema/Palette` e `Tema/Densità`: axe **0 violazioni, 0 incomplete** a 1440×900, in entrambe le densità.
- Le altezze della story `Tema/Densità` sono **identiche a quelle di M1.4** — 32px il bottone di default in normale, 48 in touch, 54 il `lg`. È la conferma sul campo che vengono da `--spacing` e non dal carattere: cambia il disegno delle lettere, non una misura. Se una di quelle cifre si fosse mossa, avrebbe voluto dire che M1.4 misurava un effetto del font.
- `npm run check`, `tsc -b`, `build`, `build-storybook`: verdi.

### Cosa resta aperto

1. **La gerarchia dei pesi** — M2.1. Con `Heavy 900` disponibile, il quarto gradino potrebbe tornare da lì.
2. **Il canale PDF** — servono `.ttf`, o il permesso di convertire. Ricade su Anagrafe, che genera i PDF con reportlab.
3. **Word** — nessun formato lo risolve: `python-docx` non incorpora font. La scelta **Arial** del v1 resta, e non va riaperta pensando che i file la cambino.
4. **D3** — invariata. Il tema distribuito continua a dichiarare solo lo stack e a non portare binari; i file stanno nel workbench e non nel registry.

---

## 2026-09-08 — La conversione OTF → TTF, e la trappola che non dava errore

Francesco ha autorizzato la conversione. **La nota di licenza resta**: convertire *modifica il file del font*, quindi va confermata con Lineto insieme all'altra domanda aperta, la generazione da server. È una decisione sua, presa dopo che il punto era stato sollevato; qui si registra come tale.

### Fatto

`scripts/otf2ttf.py` — tenuto nel repo, perché una conversione il cui script si butta non è ripetibile. Le cubiche di Bézier del CFF diventano quadratiche con `cu2qu`; nient'altro cambia. Otto `.ttf` in `public/fonts/ttf/`, anch'essi esclusi dal repo, da copiare a mano dove gira la generazione dei PDF (oggi: il backend di Anagrafe).

### La trappola che conta

Due intoppi, e solo il secondo è interessante.

Il primo — `maxp.compile()` che esplode se i bordi dei glifi non sono ricalcolati — è **rumoroso**, quindi innocuo: lo si vede e lo si aggiusta.

Il secondo no. La `post` di un OTF è **v3.0, che i nomi dei glifi non li memorizza**: stanno nel charset del CFF, cioè nella tabella che la conversione butta. Senza passare a `post` v2.0 prima di salvare, metà famiglia si riapre come `glyph00638` e le alternative stilistiche (`a.ss02`, `Euro.tf`) perdono il nome. **Nessun errore.** I file della prima conversione erano "riusciti", reportlab li registrava tutti e otto, e il difetto è saltato fuori solo perché il confronto delle metriche riportava `DIVERSE` — non per un vero scostamento, ma perché le due tabelle `hmtx` avevano chiavi diverse. Se avessi verificato solo «reportlab li accetta?», sarebbero passati.

È la stessa forma dei due difetti muti già incontrati in questo progetto: `@theme inline` che cuoce i valori (M1.4) e il campo `css` che ingoia `@theme` (M1.5). Tre volte su tre, la cosa che rompe non protesta.

### Verificato, perché una conversione di font non si dichiara

| controllo | esito |
|---|---|
| contorni | `glyf` su tutte e otto |
| avanzate e side bearing | **0 differenze** su 846 glifi × 8 facce — il testo non si rimpagina |
| nomi dei glifi, `cmap`, kerning GPOS | preservati |
| `OS/2` — `usWeightClass`, `fsType` | preservati |
| scarto max dei contorni | **0,16/1000 em** nel caso peggiore = 0,7 micron a 12pt (il limite garantito da cu2qu è 1/1000 em, 4 micron) |
| reportlab | registra tutte e otto le facce |
| PDF di prova | **8 `/FontFile2`** — le otto facce incorporate come sottoinsiemi TrueType |

Il PDF di prova (`public/fonts/ttf/specimen-replicall.pdf`) è stato anche **guardato**, non solo analizzato: accentate italiane, euro e cifre corretti, Bold e Heavy distinguibili, corsivi veri. Renderizzato in PNG con `sips` per poterlo ispezionare.

### Conseguenza

**Il canale PDF è aperto.** Ad Anagrafe non resta che copiare i `.ttf` e registrarli con `pdfmetrics.registerFont(TTFont(...))`. Restano aperte solo due cose: la gerarchia dei pesi (M2.1) e Word, che nessun formato risolve — `python-docx` non incorpora font, e **Arial resta**.

---

## 2026-09-08 — I numeri nelle tabelle: `tabular-nums`, e due righelli sbagliati

Domanda di Francesco: le colonne di numeri si allineano con Replicall, o tocca passare al monospace per quelle colonne, «che si noterebbe»? Timore fondato — le cifre di Replicall sono **proporzionali di default**, l'`1` è 380/1000 di em e il `4` è 580 — e risposta netta: **si allineano con una utility, senza cambiare carattere.**

Il font dichiara **`tnum`**, e le sue cifre tabellari misurano **580/1000 di em su tutte e otto le facce**, corsivi compresi. Cioè il totale in grassetto si incolonna col corpo in tondo, che è la cosa che serve in un computo metrico. In Tailwind è la utility `tabular-nums`: nessun token nuovo, nessun componente nuovo.

### Fatto

Story **`Tema/Cifre`** (`stories/Cifre.stories.tsx`), che misura invece di affermare, come `Tema/Palette` e `Tema/Densità`. Stesso computo reso nei due modi, con lo scarto letto dal DOM:

| | scarto del bordo dei decimali fra le 5 righe |
|---|---|
| default (proporzionali) | **2.38px** |
| con `tabular-nums` | **0px** |

Zero secco, riga «Sommano» in grassetto compresa. E le dieci cifre isolate: 6 larghezze da 6.84 a 10.45px senza, **una sola — 10.45px** con. A `text-xl` (18px), 580/1000 × 18 = 10.44: la stessa misura letta dai file del font, arrivata per un'altra strada.

La pagina ha in testa un riquadro che dice se Replicall è caricato, perché **senza il font la dimostrazione sembra riuscire e non dimostra niente**: il fallback di sistema ha le cifre già tabellari di suo.

### La regola, che cambia il v1

La style guide del v1 dice «monospace per codici sistema **e dati tabellari**». La seconda metà **cade**: i dati tabellari si scrivono nel carattere del testo con `tabular-nums`, e il `font-mono` resta ai **codici di sistema**, dove si *vuole* che stonino. Scritta in `CLAUDE.md` fra le trappole; in carico a **M2.1** (`typography`) e **M2.4** (`table`), con la misura nelle rispettive righe di `CHECKLIST.md`.

### Due righelli sbagliati, e li ho presi tutti e due

Entrambi portano a concludere che `tabular-nums` non funzioni, quando funziona. Vale la pena averli scritti perché la prossima verifica non ci ricaschi.

1. **La larghezza dell'intera stringa.** `tnum` non tocca la punteggiatura: virgola e punto restano proporzionali e **cambiano larghezza col peso** (11,2px a 400, 12,8px a 600, misurati a 40px). Quindi `1.114,00` misura 72.73px in tondo e 74.16px in grassetto anche con le cifre perfettamente allineate. La prima versione della story dichiarava «stessa larghezza in tondo e in grassetto» **sotto due numeri che misuravano diverso**: la pagina si contraddiceva da sola. Riscritta la sezione perché confronti le sole cifre — 73.09px contro 73.09px — e perché il caso con i separatori sia mostrato *e spiegato* invece che nascosto.
2. **La virgola.** Oltre a non essere tabellare è **crenata** col carattere che la precede, quindi balla di riga in riga: misurando lì, la tabella tabellare risultava fuori di 0.56px e sembrava un difetto vero. Il righello giusto è il bordo sinistro del gruppo dei decimali.

### Una trappola d'ambiente, che sembrava di codice

`.tabular-nums` non esisteva nel CSS compilato, e anche `md:grid-cols-2` non applicava: il dev server di Storybook era in piedi da prima che il file esistesse, e Tailwind non aveva ripreso il sorgente nuovo. Non è un difetto del codice — si riavvia il server. Annotato in `DECISIONI.md` §13 perché la prossima story nuova non faccia perdere la stessa mezz'ora.

### Verifiche

- axe-core su `Tema/Cifre`: **0 violazioni, 0 incomplete** in chiaro, in scuro e in densità touch, a 1440×900.
- Le misure in pagina sono lette dal DOM dopo `document.fonts.ready` — non al primo layout, o riporterebbero il fallback.
- `tsc -b`, `oxlint`, `npm run check`, `build`, `build-storybook`: verdi.

### Prossimi passi

Invariati: **M2.1**, che ora eredita due decisioni tipografiche invece di una — la gerarchia dei pesi (500 e 600 non esistono) e la regola delle cifre.

---

## 2026-09-08 — `Tema/Cifre`: dalla dimostrazione al modello da copiare

Indirizzo di Francesco: la pagina mostrava due tabelle affiancate e sembravano due proposte fra cui scegliere. Non lo erano — sono un prima/dopo — ma se la pagina si presta all'equivoco l'equivoco è suo. Aggiornata perché dica quale forma si adotta, e aggiunto ciò che mancava sui codici di sistema.

### Cosa è cambiato

- **Le due tabelle si chiamano per quello che sono**: «✗ Difetto — cifre di default» e «✓ Adottato — con tabular-nums», con scritto nella nota che la prima non è un'alternativa ma ciò che succede se non si fa niente.
- **Sezione 3 nuova, «Il modello da copiare»**: una riga di computo vera con le due regole insieme — codice di sistema in `font-mono`, designazione in prosa, numeri in `tabular-nums` — più il sorgente JSX da copiare. È la sezione che serviva: la dimostrazione spiegava *perché*, non *cosa scrivere*.
- **Sezione 4 riscritta**, dai due esempi che c'erano a una guida vera sui codici: il criterio in una domanda — *la stringa si legge, o si trascrive?* — e due elenchi affiancati di casi Tassullo reali (codice articolo, DoP, lotto, partita IVA, path, hash da una parte; importi, quantità, date, percentuali, progressivi, prosa dall'altra).
- **Lo zero barrato**, che sui codici è il difetto che fa sbagliare le trascrizioni: il mono di sistema distingue `0` da `O` di suo, e se un giorno servisse un codice nel carattere del testo Replicall porta `zero` (`slashed-zero` in Tailwind).
- Il codice nella tabella porta anche `text-sm text-muted-foreground`, ed è scritto perché: **il monospace di sistema ha un'altezza-x più alta di Replicall** e a parità di corpo sembra più grande — un identificativo non deve pesare quanto la voce che identifica.

### Una verifica che non valeva niente, e come si è vista

Per dimostrare che `slashed-zero` funziona ho prima disegnato le due varianti su `<canvas>` contando i pixel d'inchiostro: **511 contro 511**, cioè «non funziona». Falso: **`fontVariantNumeric` non è una proprietà di `CanvasRenderingContext2D`**, quindi impostarla non fa nulla e le due varianti erano semplicemente lo stesso disegno. Verificato allora a video, a 140px: lo zero barrato è un glifo diverso, non un'inclinazione sintetica. Annotato in `DECISIONI.md` §13 perché la trappola è credibile — un test che gira e restituisce un numero sembra una misura.

### Verifiche

- axe-core su `Tema/Cifre` aggiornata: **0 violazioni, 0 incomplete**, 13 controlli passati, in chiaro, in scuro e in densità touch a 1440×900.
- Le misure in pagina reggono dopo la riscrittura: scarto dei decimali **2.38px** senza e **0px** con; cifre sole nei due pesi «Larghezze identiche», stringa intera coi separatori «Larghezze diverse», com'è giusto che sia.
- `tsc -b`, `oxlint`, `npm run check`, `build`, `build-storybook`: verdi.

### Prossimi passi

Invariati. **M2.1** eredita la gerarchia dei pesi e la regola delle cifre; **M2.4** eredita `tabular-nums` sulle colonne numeriche di `table`, così le app non lo riscrivano a mano.

---

## 2026-09-08 — Una demo per Roberto: cinque caratteri sui banchi di prova

Richiesta di Francesco: un artifact che estenda la demo del workbench con l'esempio dei codici di sistema e dei dati tabellari, e un selettore fra **Replica, Inter, Geist, Outfit e Albert Sans**, per scegliere il carattere dei siti insieme a Roberto.

**Artifact**: <https://claude.ai/code/artifact/edbec1ee-f73d-4313-94b3-bfd8014d5474> — «Carattere Tassullo». Il sorgente era conservato in `docs/carattere-demo.html` **col segnaposto al posto dei font**, con due script per rigenerarlo: `scripts/otf2woff2.py` e `scripts/inlina-font.py`. **Non c'è più né il file né `inlina-font.py`**: scelto Inter, la demo aveva esaurito il suo scopo, ed è stata rimossa dal working tree *e dalla storia* il 2026-09-09 (voce in coda a questo diario). L'artifact resta all'indirizzo qui sopra.

### Come è fatta

Cinque banchi, e i verdetti sono **misurati nella pagina** mentre la si legge, non scritti a mano — la stessa scelta di `Tema/Densità` e `Tema/Cifre`, per la stessa ragione.

1. **Gerarchia dei pesi** — i sei pesi 300/400/500/600/700/900 con la larghezza resa di ciascuno; le righe che collassano su un'altra si evidenziano da sole.
2. **Scala tipografica** — i sette gradini Tassullo ai corpi reali.
3. **Computo metrico** — la tabella vera, codici in monospaziato e numeri in `tabular-nums`, con l'interruttore per spegnerli e vedere il difetto. Sotto, lo scarto del bordo dei decimali.
4. **Codici di sistema** — i due elenchi («si trascrive» / «si legge») e i tre zeri a confronto.
5. **In contesto** — un frammento d'interfaccia Studio con la colonna antracite e l'arancio, perché un carattere non si sceglie su una parola sola.

Più una **scheda di sintesi** che misura tutti e cinque, non solo quello selezionato: è quella la pagina da guardare con Roberto.

### Cosa dice la misura

| carattere | gradini usabili | cifre tabellari | corsivo disegnato |
|---|---|---|---|
| **Replica LL** | **2 su 4** | sì | sì |
| Inter | 4 su 4 | sì | sì |
| Geist | 4 su 4 | sì | sì |
| Outfit | 4 su 4 | sì | **no** |
| Albert Sans | 4 su 4 | **no** | sì |

*(Tabella corretta: la prima versione dava Geist e Albert Sans senza corsivo. Vedi «I due difetti sul corsivo» qui sotto.)*

Il dato che pesa: **Replica dà due gradini di peso su quattro**, perché 500 e 600 non esistono e collassano su 400 e 700. Tutti e quattro gli alternativi li hanno. In compenso Replica ha le cifre tabellari, quindi sul computo metrico non ha problemi — e **Albert Sans no**, che per Tassullo è squalificante: senza `tnum` le colonne di importi non si incolonnano se non cambiando font.

### I due difetti sul corsivo, e come sono venuti fuori

Francesco, guardando la scheda: «non capisco, mi sembra che tutte le supportino». Aveva ragione, e i difetti erano **due**, sovrapposti — il primo trovato guardando, il secondo solo andando a leggere i file dei font.

1. **Le facce si scaricano quando servono.** Alla prima resa la scheda dava Albert Sans senza corsivo perché lo misuravo prima che il file arrivasse: misuravo il fallback di sistema, dove il corsivo è finto. Corretto con `document.fonts.load()` su tutte le facce prima di rimisurare.
2. **Il metodo era sbagliato in partenza, e la correzione (1) non bastava.** Confrontavo la larghezza del corsivo con quella del tondo: un corsivo *disegnato* può avere le stesse avanzate, e allora il confronto lo dichiara finto. **Il corsivo non si misura: si guarda se la faccia esiste**, enumerando `document.fonts`. Con Replica il metodo sbagliato funzionava per caso, ed è per questo che era sopravvissuto.
3. **E c'era anche un terzo, banale:** il `<link>` a Google Fonts chiedeva i corsivi solo per Inter e Albert Sans. Geist il corsivo ce l'ha, ma la pagina non l'aveva mai chiesto — quindi «no» era vero della pagina, non del carattere.

**Verificato alla fonte**, non solo a video: scaricati i `.woff2` che Google serve davvero e ispezionati con `fontTools`. Le feature numeriche dichiarate, che sono anche il modo di rileggere la colonna «cifre tabellari»:

| carattere | `tnum` | cifre di default | altre feature numeriche |
|---|---|---|---|
| Replica LL | sì | 6 larghezze | `zero onum lnum pnum frac sups subs numr dnom` |
| Inter | sì | 9 larghezze | `pnum frac numr dnom` |
| Geist | sì | 9 larghezze | `pnum frac numr dnom` |
| Outfit | sì | 8 larghezze | `pnum frac` |
| **Albert Sans** | **no** | 8 larghezze | `frac` |

Albert Sans è l'unico senza `tnum`, e le sue cifre di default hanno otto larghezze diverse: **non c'è modo di incolonnare un importo senza cambiare carattere**. Per Tassullo è squalificante, ed è il dato che la scheda serve a far vedere.

Corretta anche l'etichetta del collasso dei pesi, da «rende come 400» a «identico a 400»: quale dei due sia il sostituto non è determinabile né interessante — sono lo stesso file.

**La lezione, che è la terza volta in questa sessione:** una misura che gira e restituisce un numero sembra una verifica. Lo è solo se il righello misura la cosa giusta — vale per la virgola in `Tema/Cifre`, per il canvas sullo zero barrato, e qui per la larghezza del corsivo.

### Nota di licenza

**Errore commesso e corretto nella stessa sessione:** il primo commit archiviava in `docs/` la pagina **coi font inlinati**, cioè i binari Lineto dentro il repo — esattamente ciò che il `.gitignore` di `public/fonts/` esiste per impedire. Il sorgente archiviato ora tiene il segnaposto `/*REPLICA_FONTFACE*/`, e la pagina pubblicabile si ricostruisce con `scripts/otf2woff2.py` più `scripts/inlina-font.py`. La regola vale per estensione: **un file di font non entra nel repo da nessuna porta**, nemmeno inlinato dentro un HTML, dove nessun `.gitignore` lo può vedere.

Replica è **inlinata come data URI** nell'artifact: il CSP ammette file di font solo da `fonts.gstatic.com`, quindi non c'è altro modo di mostrarla. Sono gli stessi tagli che `tassullo.it` già serve pubblicamente dal CDN Webflow, convertiti in woff2 (206 KB in tutto). L'artifact è **privato** finché non lo si condivide. Resta la domanda aperta con Lineto sulla distribuzione come webfont, e condividere il link con Roberto è una forma di distribuzione: da tenere presente, e da chiudere insieme alle altre due domande.

---

## 2026-09-08 — Lo scarto che si contraddiceva, e un criterio che mancava

Francesco, sulla demo: «verifica che lo scarto 0.01px funzioni, chiarisci il bottone e dimmi per ogni font se conviene abilitarlo». Le tre cose hanno scoperto un difetto e un criterio.

### Il verdetto diceva due cose opposte

Il chip si accendeva di rosso se lo scarto non era **esattamente** zero, ma il testo accanto continuava a dire «le cinque righe cadono sulla stessa ascissa». Su Inter (0.05px) e Outfit (0.01px) la pagina si smentiva da sola nella stessa riga.

### Ma dietro c'era una cosa vera, e vale come criterio

Misurate le righe una per una su Geist, che dava 0.84px: **le quattro voci del corpo sono allineate al centesimo (637.66px tutte e quattro); è la riga SOMMANO, in grassetto, a sfasare.** La causa non è un arrotondamento — è che **la cifra tabellare di Geist cambia larghezza col peso**.

Misurato a 100px sulle cinque famiglie, larghezza della cifra tabellare da 400 a 700:

| carattere | @400 | @700 | deriva |
|---|---|---|---|
| Replica LL | 58,0 | 58,0 | **0%** |
| Outfit | 59,0 | 59,0 | **0%** |
| Inter | 64,84 | 64,64 | −0,3% |
| Geist | 60,0 | 63,60 | **+6%** |
| Albert Sans | 62,9 | 64,5 | (e non ha `tnum`) |

In un computo metrico la riga dei totali **è** in grassetto: è il caso che conta, non un caso limite. Replica e Outfit incolonnano esattamente; Inter deriva di una frazione di pixel che non si vede; **Geist scarta 0,84px a 14px — 1,6px a corpo di titolo, e lì si vede.**

È una proprietà che Replica ha e che non avevo pensato di cercare altrove: in M1.5 era stata annotata come un pregio di Replica («580/1000 em su tutte e otto le facce») senza chiedersi se fosse scontata. Non lo è.

### Cosa è cambiato nella demo

- **Due numeri invece di uno**: `corpo` (scarto fra le quattro voci) e `totale` (di quanto scarta la riga SOMMANO). Dicono *dove* è il problema invece che dire che c'è.
- **Soglia dichiarata**: sotto un quarto di pixel è arrotondamento del motore di resa, non disallineamento — e il numero esatto si mostra lo stesso, così la soglia non nasconde niente.
- **Colonna nuova nella scheda**: «stabili fra i pesi», con la percentuale di deriva.
- **L'interruttore spiegato**: cosa fa esattamente (`font-variant-numeric: tabular-nums`, cioè chiedere al carattere la serie di cifre a larghezza fissa), cosa non fa (non cambia carattere, non cambia il disegno delle lettere), e cosa succede se il carattere quella serie non ce l'ha.
- **Un consiglio per carattere**, derivato dalle stesse misure e non da un'opinione: acceso sempre dove `tnum` c'è, con l'avvertenza sulla deriva dove c'è; inutile su Albert Sans, dove l'unica via sarebbe un secondo carattere per le colonne numeriche.

---

## 2026-09-08 — La scheda diventa una classifica

Richiesta di Francesco: ordinare i cinque caratteri dal migliore al peggiore, numerati.

L'ordine è **calcolato dalle misure**, non deciso a mano: sarebbe un'opinione travestita da tabella, ed è il difetto che questa pagina esiste per evitare. I pesi dei criteri sono dichiarati in pagina, così chiunque può contestarli sapendo cosa cambia.

| criterio | punti | perché tanto |
|---|---|---|
| cifre tabellari | **3** | senza, un computo non si incolonna e l'unica via è un secondo carattere per i numeri |
| gradini di peso usabili | **0–3** | uno per gradino oltre il primo, fra i quattro che il design system usa |
| corsivo disegnato | **2** | manca in *ogni* nota di misurazione del computo |
| stabili fra i pesi | **1** | tocca una riga per tabella, quella dei totali |

A parità passa avanti chi ha più gradini di peso: è il criterio da cui dipende la gerarchia di tutta l'interfaccia, non una riga sola.

| # | carattere | punti | dove perde |
|---|---|---|---|
| 1 | **Inter** | 9/9 | niente |
| 2 | Geist | 8/9 | deriva +6% fra i pesi: i totali in grassetto sfasano di 0,84px |
| 3 | Outfit | 7/9 | nessun corsivo disegnato |
| 4 | **Replica LL** | 7/9 | 2 gradini di peso su 4 |
| 5 | Albert Sans | 5/9 | nessuna cifra tabellare |

**Un limite scritto in pagina, perché la classifica non venga letta per più di quello che è:** il punteggio misura quanto un carattere regge il *lavoro dell'interfaccia* — colonne di numeri, gerarchia dei pesi, note in corsivo. **Non misura quanto somigli a Tassullo**, che non è misurabile e resta la decisione di Roberto. Il costo è nell'ultima colonna e non fa punti.

---

## 2026-09-08 — Inter sullo schermo, Replica nelle stampe

Decisione di Francesco dopo la demo: **Inter per le interfacce, Replica per le stampe PDF**. Chiude la questione che `DECISIONI.md` §12 aveva aperto e lasciata in carico a M2.1, e la chiude meglio di come M2.1 avrebbe potuto: invece di adattare la gerarchia a un carattere che non ha i pesi, si prende un carattere che li ha.

### Cosa è cambiato nel codice

- **`scripts/hex-to-oklch.ts`**: `--font-sans` passa a `'Inter', -apple-system, …`. **Replicall esce dallo stack.** Non è pignoleria: tenerlo lì lo farebbe apparire sulle macchine che ce l'hanno installato e non sulle altre, cioè renderebbe l'interfaccia diversa da persona a persona. Tema rigenerato.
- **`src/index.css`**: tolte le otto `@font-face` di Replica. Inter arriva da un `<link>` nella testa dei due punti d'ingresso — `index.html` e il nuovo **`.storybook/preview-head.html`**, che prima non esisteva: Storybook non usa `index.html`, e senza quel file la style guide sarebbe tornata a rendere nel font di sistema. È lo stesso difetto scoperto il giorno prima, e questa volta è stato previsto invece che subito.
- **Story nuova `Tema/Carattere`**: la scelta, i pesi misurati, la scala, le due famiglie e a cosa servono, e il fatto che Replica resta nelle stampe. Con Inter: **5 pesi distinti su 5**, letti dal DOM.
- **`Tema/Cifre` riscritta per Inter.** Tutti i numeri che erano scritti a mano erano diventati falsi — è successo davvero ciò che quella pagina predicava, e la parte misurata dal DOM si è aggiornata da sola mentre la parte scritta è rimasta indietro.

### Tre bugie trovate nella riscrittura, e una resa impossibile

1. «Le cifre di Replicall sono proporzionali, l'1 è 380 millesimi» — vero di Replica, falso di Inter (nove larghezze diverse, altri valori).
2. «580/1000 di em su tutte e otto le facce» — proprietà di Replica, non di Inter. Sostituita col criterio, non col numero: *la cifra tabellare deve restare larga uguale a tutti i pesi*, che è ciò che conta e vale per qualunque carattere.
3. Il verdetto dava «di tanto ballano i decimali» per **0.04px**. Stesso difetto già corretto nell'artifact e non qui: soglia di un quarto di pixel, col numero esatto sempre in vista.

E una che non si poteva correggere scrivendo un altro numero: la frase «la virgola cambia larghezza col peso» accanto alla misura «10.7px contro 10.7px». **In Inter i separatori sono stabili, in Replica no.** Riscritta come componente che *sceglie la frase in base alla misura* — è l'unico modo perché non ridiventi falsa al prossimo cambio di carattere.

### Verifiche

- **`Tema/Carattere`**: 5 pesi distinti su 5, larghezze crescenti 355,82 → 393,14px. axe **0 violazioni, 0 incomplete** in chiaro e in scuro.
- **`Tema/Cifre` con Inter**: cifre di default **9 larghezze da 7,15 a 11,52px**; con `tabular-nums` **una sola, 11,66px**. Scarto dei decimali **2,69px senza, 0,04px con**. axe **0 e 0** in chiaro, scuro e densità touch.
- `npm run check`, `tsc -b`, `oxlint`, `build`, `build-storybook`: verdi.
- Il tema rigenerato non tocca nessun colore: `check:contrast` resta 48/48.

### D3 cambia domanda

Non è più «si può distribuire Replica?» — Replica non è più il carattere dello schermo. Ora è **«Inter da Google Fonts o auto-ospitato?»**, e per la prima volta la licenza (SIL Open Font) **permette** di metterlo nel registry. Da decidere guardando anche la privacy: i server di Google vedono l'indirizzo IP di ogni visitatore, che in UE è un tema. Riga di `CHECKLIST.md` riformulata.

### Cosa resta di Replica

Il carattere del marchio, e le **stampe PDF** — con i `.ttf` convertiti e verificati (§12). Lì il limite dei pesi resta: un PDF che volesse un semibold userà il Bold. `public/fonts/` continua a tenerla fuori dal repo, ma ora **nessuna pagina la carica**.

Conseguenza da non scoprire per caso, scritta in `Tema/Carattere`: **lo stesso computo è in Inter a schermo e in Replica sul PDF.**

---

## 2026-09-08 — Il carattere entra nel registry, e **D3 si chiude**

Indirizzo di Francesco: «sicuramente salvato nel registry in modo da usarlo per ogni App». Chiude D3, che era aperta dal piano e che poche ore prima aveva cambiato domanda — da «si può distribuire Replica?» a «Inter da Google o auto-ospitato?». La licenza SIL Open Font è ciò che ha reso la domanda rispondibile: con Replica non lo era.

### L'accertamento che ha deciso la forma

Prima di progettare qualunque cosa: **il registry sa portare un binario?** No.

Un `.woff2` da **73.016 byte** dichiarato come file di un item diventa **69.186 caratteri** nel JSON di `shadcn build`, e ri-codificandoli non si torna all'originale: la CLI legge ogni file come **testo**. E non fallisce — dice «Created 1 file» e consegna un font corrotto. Sarebbe stato l'ennesimo difetto muto, scoperto a video settimane dopo.

Da lì la forma: **i font viaggiano dentro il CSS, in data URI**, che è testo e passa sul canale `registry:theme` già dimostrato in M1.5.

### Fatto

- **`registry/tassullo/theme/fonts/`** — i due `.woff2` di Inter, sottoinsieme `latin`, tondo e corsivo. Variabili: un file per stile copre i pesi da 300 a 900.
- **`scripts/build-font-css.ts`** → `theme/inter.css`, 201 KB, generato dai `.woff2`. Stessa disciplina del tema: `npm run font:build` rigenera, **`npm run check:font` fallisce se diverge**, ed è entrato in `npm run check`. Un base64 ritoccato a mano non è ispezionabile a occhio: senza il gate, la divergenza sarebbe invisibile per sempre.
- **Item `tema-font`** con il CSS e la **licenza OFL**, che l'OFL richiede resti col font — il campo `docs` dice che non si cancella. **`tema` lo dichiara fra le `registryDependencies`**: un solo comando porta tutti e tre i file.
- **Via il `<link>` a Google**, da `index.html` e da `.storybook/preview-head.html`, che era stato creato poche ore prima ed è stato rimosso. `src/index.css` importa **lo stesso `inter.css` che ricevono le app**: altrimenti si svilupperebbe contro la copia di Google e si spedirebbe la nostra.

### Perché due item e non uno

Il tema è anche documentazione — ha più commenti che dichiarazioni. Affogarlo sotto 200 KB di base64 lo renderebbe illeggibile, e quel file è la cosa che chi installa legge per capire i token. Separati, il tema resta leggibile e il font si mette in cache per conto suo.

### Verifiche

- **Prova d'installazione end-to-end**, app Vite vuota: `add @tassullo/tema` crea **tre file** con un comando — tema, font, licenza — e mette i due `@import` al posto giusto. `vite build` compila **211 KB** di CSS con **2 facce inlinate** e **zero riferimenti a `gstatic`/`googleapis`**; `--font-sans: "Inter", …`; `.text-title{font-size:var(--text-title)}`, cioè la densità continua a scattare.
- **I byte sopravvivono al viaggio**: 73.016 in casa e 73.016 nell'app, **stesso `sha256`**, identici anche al `.woff2` di partenza. È esattamente la verifica che il canale binario non superava, ed è la ragione per cui il base64 è la strada giusta e non un ripiego.
- **Nel workbench: nessuna richiesta di rete per il font.** `performance.getEntriesByType('resource')` non ne riporta nessuna verso `gstatic` o `googleapis`. Due facce caricate, **5 pesi distinti su 5**, axe **0 violazioni e 0 incomplete** in chiaro e in scuro su `Tema/Carattere`.
- `npm run check` (contrasto 48/48, registry 0 errori, font allineato), `tsc -b`, `build`, `build-storybook`: verdi. `registry validate`: 3 item.

### Cosa resta aperto

Il **sottoinsieme**: oggi solo `latin`, che copre italiano e tedesco. `latin-ext` costerebbe il doppio (130 KB contro 71) e serve solo per l'Europa centrale — si aggiunge in una riga se un giorno un nome lo richiede.

E il **canale PDF**, che non è toccato: resta Replica, coi `.ttf` convertiti, fuori dal repo in `public/fonts/`. Nessuna pagina la carica più.

---

## 2026-09-08 — Il canvas di Storybook prende i token del tema

Rilievo di Francesco su uno screenshot: in `Tema/Carattere` il fondo non diventava scuro, e nel bottone «non è quello corretto». Due sintomi, una causa: **il canvas non conosceva il tema.**

Le story `layout: 'fullscreen'` — le pagine del tema — il fondo se lo dipingono da sé e sembravano a posto. Quelle `layout: 'centered'`, cioè **quasi tutte le primitive**, venivano disegnate sul bianco di Storybook anche in scuro. Accanto, l'addon *backgrounds* offriva un `light` e un `dark` suoi (`#F8F8F8`, `#333333`) *insieme* all'interruttore chiaro/scuro: due controlli che sembrano fare la stessa cosa.

### La strada elegante che non funziona

Configurare l'addon con `value: 'var(--background)'`, così da far seguire la modalità al fondale. **L'addon cuoce il valore** al momento in cui lo applica: misurato, commutando su scuro il testo diventava chiaro e il fondo restava quello chiaro. Testo chiaro su fondo chiaro, senza errore.

### Fatto

- Addon **spento**, e al suo posto l'interruttore **«Superficie»**, fatto come la densità: un global scrive un attributo sul `<body>`, il colore lo mette `.storybook/preview.css` leggendo i token. `var()` resta vivo e la superficie segue chiaro/scuro da sé.
- **Tre superfici**: Pagina, Card, Sidebar — quelle per cui il tema dichiara *anche* il colore del testo, cioè le coppie che `check:contrast` verifica. `--muted` è fuori di proposito: è un riempimento per chip e scheletri, non una superficie di pagina, e un fondale senza il suo testo verificato è un modo di rompere il contrasto senza accorgersene.
- `body.sb-show-main` prende fondo, testo e `font-family` dai token; le story centrate hanno `padding` attorno, o il fondo si vedrebbe per pochi pixel.
- `Tema/Palette` non prende né tema né superficie: è la pagina che le superfici le *mostra*.

### Verifiche

Le nove combinazioni superficie × modalità risolvono tutte alla coppia giusta, lette dal DOM — Pagina `0.9726`/`0.1913` in chiaro e `0.1913`/`0.9455` in scuro, Card `0.994`→`0.2264`, Sidebar `0.1913`→`0.2264` con testo `0.7316` in entrambe.

**Nessuna violazione nuova**: `Primitive/Button` in chiaro riporta esattamente le due note, `destructive` 3.82:1 e `link` 1.79:1, con le cifre già a verbale.

### La misura sbagliata, di nuovo

Alla prima verifica axe dava **4** violazioni. Le due in più erano `#ededeb` — il testo della modalità *scura* — su `#f6f6f4` e su `#babab9`, un grigio intermedio: **artefatti della transizione**, perché avevo tolto `.dark` via JS e misurato dopo 700 ms mentre i bottoni erano a metà di `transition-colors`. Da pagina appena caricata: 2, cifre esatte.

È la quarta volta in questa sessione, dopo il righello sulla virgola, il canvas per lo zero barrato e la larghezza per il corsivo. Aggiunta la regola in `CLAUDE.md`: **le misure di accessibilità si prendono a pagina ferma.**

---

## 2026-09-08 — «Il tema scuro non viene applicato»: cinque story, due rotte, e la causa altrove

Rilievo di Francesco su `Tema/Carattere` e `Tema/Cifre`. Aveva ragione, ed erano **esattamente quelle due**: `Button`, `Palette` e `Densità` commutavano bene. Il primo cambio chiaro→scuro funzionava sempre; il ritorno, su quelle due, mai. Nessun errore in console.

### Due piste sbagliate

1. **La stringa vuota** passata a `withThemeByClassName` (`themes: { chiaro: '' }`). Credibile, ma leggendo il sorgente dell'addon il caso è gestito. Dare alla modalità chiara la classe `light` resta comunque giusto ed è stato tenuto — il tema emette i token chiari su `:root, .light` dalla M1.3 proprio perché la modalità chiara si deve poter *dichiarare*.
2. **L'addon.** Sostituito con un decorator nostro, della stessa forma di densità e superficie: **il difetto è rimasto identico**, ed è la prova che l'addon non c'entrava.

### La causa, trovata con un contatore

Un contatore di render nel decorator: su `Tema/Cifre` il render si ferma a **2** e non riparte più; su `Button` va 1, 2, 3, 4.

Le due story rotte avevano in comune un `useEffect` con **un array appena creato fra le dipendenze**:

```ts
useLarghezze(campioni.map((c) => c.testo + c.classi), '')   // Cifre
useLarghezze(PESI.map((p) => p.v))                          // Carattere
```

Un array è nuovo a ogni render: l'effetto riparte, chiama `setLarghezze` con un array nuovo, il render riparte, si avvita. **React non interrompe il ciclo e non stampa niente**, e il sintomo non somiglia alla causa — la story smette di rispondere agli interruttori della barra perché il render non arriva mai in fondo.

Corretto con una **chiave primitiva**: `testi.join('|')`.

### Fatto, in questa sessione

- **Il canvas prende i token** (`.storybook/preview.css`): le story `layout: 'centered'` — quasi tutte le primitive — finivano sul bianco di Storybook anche in scuro.
- **Interruttore «Superficie»** al posto dell'addon *backgrounds*, che offriva `#F8F8F8` e `#333333` accanto a quello del tema. Tre superfici, quelle per cui il tema dichiara anche il testo: Pagina, Card, Sidebar.
- **Interruttore «Modalità»** scritto in casa; `@storybook/addon-themes` fuori dagli `addons` (rettifica di `DECISIONI.md` §8).
- **La cornice di Storybook è Tassullo**: `.storybook/manager.ts` legge `manager-palette.json`, **generato da `scripts/hex-to-oklch.ts`** insieme al CSS del tema — la palette resta una sola. La barra laterale usa i token `--sidebar`, che è la stessa colonna antracite delle app: la style guide **mostra** la sidebar mentre la si sfoglia.
- **Inter anche nella cornice**, servita da `staticDirs` che pubblica la cartella del tema **dov'è** — una copia di un file generato diverge al primo ritocco, e per un attimo l'avevo fatta.

### Verifiche

- Le **cinque** story commutano in entrambe le direzioni, quattro cicli di fila; la densità funziona sulle stesse.
- Le nove combinazioni superficie × modalità risolvono alla coppia di token giusta, lette dal DOM.
- axe-core su `Tema/Carattere` e `Tema/Cifre`: **0 violazioni, 0 incomplete** in chiaro e in scuro. Su `Primitive/Button`, le due note e nessuna nuova.
- `npm run check` (tre gate), `tsc -b`, `oxlint`, `build`, `build-storybook`: verdi.

### La regola che ne resta

In `CLAUDE.md`: **una dipendenza di `useEffect` dev'essere un valore primitivo o un riferimento stabile.** E, di metodo: il sintomo non indica la causa. «Il tema non si applica» sembrava un problema di tema e non lo era in nessuna delle sue parti.

---

## 2026-09-08 — M2.1: le fondamenta, e le due violazioni aperte tornano a zero

Nove primitive nel registry — `button` (ri-stilato), `badge`, `separator`, `skeleton`, `spinner`, `avatar`, `kbd`, `button-group`, più `lib/utils.ts` che era un file e non era un item. E la tipografia, che **non è un componente**: vedi sotto.

### I quattro rilievi su `button`, chiusi e misurati

Erano aperti dalla M1.2 e misurati con axe in M1.3. Le misure di adesso sono lette dal DOM col colore risolto dal motore di resa, non stimate:

| dove | prima | ora | previsto dal piano |
|---|---|---|---|
| `link`, chiaro | **1.79:1** | **4.77:1** | 4.77 ✓ |
| `link`, scuro | 9.49:1 (già passava) | **9.49:1** | invariato ✓ |
| `destructive`, chiaro | **3.82:1** | **4.83:1** | 4.83 ✓ |
| `destructive`, scuro | **3.57:1** | **4.83:1** | 4.83 ✓ |
| raggio | 10px (`rounded-lg`) | **6px** | i 6px del v1 ✓ |
| `sm`, corpo | 12,8px fisso (`text-[0.8rem]`) | **12px → 13px in touch** | segue la densità ✓ |

E l'***incomplete*** su `ghost` in scuro, che M1.4 aveva lasciato aperta: **chiusa senza toccare il componente**. Era «1:1 con lo sfondo», cioè un fondo trasparente che axe non sapeva risolvere; da quando il canvas di Storybook dipinge la superficie coi token (sessione precedente), axe risale al fondo vero. Misurata: **17.03:1 in chiaro, 15.72:1 in scuro**.

**Il gradino tipografico del bottone**, che il piano lasciava da decidere misurando: `text-md`, cioè 13px, e non i 12 di `text-sm`. È il valore che il v1 dà a `.btn`, e in touch scatta a 14 — di nuovo il passo del v1. Le quattro taglie ora fanno 11/12/13/14 in normale e 12/13/14/15 in touch; prima `sm` era l'unica ferma.

Altezze rimisurate nelle due densità: **24/28/32/36 → 36/42/48/54**. I 48px di M1.4 tengono.

### Il preset ci era cascato due volte, non una

Il piano avvertiva: «da verificare su ogni primitiva, non solo sul bottone — se ci è cascato il preset, il preset ci sarà cascato più di una volta». **Ci era cascato.** `badge` aveva le stesse due trappole identiche: `link: "text-primary"` — l'arancio del brand come colore di testo — e un `destructive` tenue `bg-destructive/10 text-destructive`, sotto soglia per la stessa ragione del bottone.

Per il badge il rimedio è diverso e migliore: la famiglia **tenue** del tema (`destructive-subtle` + il suo testo + il suo bordo), che è la terna che il tema dichiara insieme e che `check:contrast` verifica. Un badge è un'etichetta che si legge, non un bottone: il rosso pieno sarebbe stato un allarme dove serve uno stato.

Ri-stilati anche il raggio (`rounded-4xl`, cioè pillola, → i 4px del v1) e il corpo (11 → 12px, il gradino che il v1 dà ai badge). E `focus-visible:ring-[3px]` → `ring-3`: stesso numero, dentro la scala.

### La tipografia non si scrive

`typography` **non esiste come item shadcn** — 471 item interrogati con l'MCP, nessuno con quel nome né sotto altro nome. Salita la scala della regola 4bis fino al gradino 3 — adattare il v1 — e lì si è fermata: la scala del v1 è già tutta nel tema. `registry/componenti-propri.json` **resta vuoto**, che è la condizione da difendere. Al suo posto una pagina, `Primitive/Tipografia`, con le sei parti di testo e le misure lette dal DOM nelle due densità. Ragionamento in `DECISIONI.md` §20.

### La decisione che il piano chiedeva di prendere qui

Il primo **token custom dentro un componente**. Scelto `text-destructive-foreground` (4.83:1) e non `text-white`, che dà lo stesso numero a costo zero: la regola 3 del `CLAUDE.md` esclude un colore che nessun token dichiara e nessun gate verifica. Il contatore passa da 0 a **5**, tutti dello stesso tipo — coppie di cui il tema dichiara anche il testo. Criterio e cifre in `DECISIONI.md` §18.

### Il gate dava falsi positivi, ed è la cosa più grave della sessione

Su componenti **appena scaricati e non ancora toccati**, `check:registry` segnalava 2 errori e 6 avvisi su 7. Nessuno vero:

- `"use client"`: `shadcn view` la restituisce, la CLI la **toglie** scrivendo in un progetto `rsc: false`. `separator.tsx` risultava «divergente fuori dalle stringhe di classi» senza che nessuno l'avesse aperto.
- `<IconPlaceholder>`: l'originale di `spinner` è un **template**, non un componente — la CLI lo risolve a `add` sulla libreria d'icone. Non è confrontabile per costruzione: ora è uno stato a sé (`◌`) con l'avviso che dice cosa fare alla prossima versione, cioè **rileggerlo a mano**.
- la regex dei valori arbitrari prendeva per valori il nome di gruppo (`group-data-[size=sm]/avatar:`) e le parentesi annidate (`has-[>[data-slot=button-group]]:`).

Corretti tutti e tre. Da 8 avvisi (7 falsi) a **2, entrambi veri**. Un gate che grida al lupo è un gate che si smette di leggere — ed è lo stesso motivo per cui M2.9 non potrà accendere `a11y.test = 'error'` con violazioni aperte.

L'unico avviso vero che resta è `bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]` sull'hover di `secondary`, e si **tiene**: è sintassi arbitraria ma non un colore arbitrario — costruito su due token, nessun hex, segue le modalità da sé. Inventare un `--secondary-hover` allontanerebbe il file dall'originale per guadagnare nulla.

### Cosa ho sbagliato misurando, e come me ne sono accorto

Due volte, e vale la pena scriverle perché sono errori di **strumento**, non di componente:

1. Il primo calcolo del contrasto dava **1.02:1** su `kbd`, cioè testo invisibile — e non lo era. Il browser restituisce i colori risolti in **`oklch`**, e la mia conversione li leggeva come tre numeri RGB. Rifatto facendo risolvere il colore al motore di resa (dipingo su un canvas 1×1 e leggo il pixel): così `oklch`, `color-mix` e le trasparenze arrivano già in sRGB, e non si converte niente a mano.
2. La scansione si bloccava sempre alla stessa story: `requestAnimationFrame` **non scatta col pannello del browser nascosto**, e lo usavo per aspettare che la pagina fosse ferma. Tolto — ricaricando l'iframe la modalità è già applicata al load, quindi non c'è nessuna `transition-colors` in corso da attendere, che era il difetto che quella riga esisteva per evitare.

### Verifiche

- **axe-core su tutte le 41 story × 2 modalità = 82 scansioni: 0 violazioni.** Il conto delle violazioni aperte in tutto il progetto torna a **zero**, che è la condizione d'ingresso di M2.9.
- Restano **6 *incomplete*, tutte su `Primitive/Kbd`** e tutte lo stesso caso: «Element content contains only non-text characters» sui tasti simbolo (⌘ ⇧ ↑ ↓ ↵). axe non sa valutare il contrasto di un glifo che non classifica come testo. **Chiuse misurando**: la coppia è la stessa dei tasti alfabetici, che axe valuta e promuove — **4.55:1 in chiaro, 6.36:1 in scuro**, identico per simboli e lettere. Non è un difetto del componente ed è annotata qui, non lasciata accesa.
- `npm run check` (contrasto 48/48, registry 0 errori, font allineato), `tsc -b`, `oxlint`, `build`, `build-storybook`: verdi. `registry validate`: **11 item**.

### Due cose sistemate di passaggio

- **`storySort` non c'era mai stato scritto.** Il `CLAUDE.md` lo dà per fissato dalla M0.3 — «l'ordine dell'indice è fissato in `.storybook/preview.tsx`» — ma la riga non esisteva: l'indice era alfabetico, e ci somigliava abbastanza da non farsi notare (Blocchi, Pagine, Primitive, Tema è quasi l'ordine giusto). Con nove primitive non somigliava più. Scritto: Introduzione, Tema, Primitive, Blocchi, Pagine.
- **`lib/utils.ts` era un file e non un item**: un'app che avesse installato una primitiva non avrebbe ricevuto l'alias `utils` dichiarato in `components.json`. Ora è `registry:lib`.

### Prossimi passi

**M2.2 — Form**: `field`, `input`, `input-group`, `label`, `textarea`, `select`, `checkbox`, `switch`, `radio-group`, `slider`. Accettazione: form di prova navigabile **interamente da tastiera**, ogni campo con etichetta associata. Da aspettarsi le stesse due trappole del preset — `text-primary` come testo e i tenui sotto soglia — e da verificare su ogni singolo componente, che in M2.1 è stato il rilievo più utile del piano.

---

## 2026-09-08 — Si chiama `typeset`, non `typography`: rettifica a M2.1 e apertura di D11

Rilievo di Francesco subito dopo la chiusura di M2.1: <https://ui.shadcn.com/docs/typeset>, «la stiamo rispettando?».

### La risposta breve

**Sì, perché non ci siamo mai entrati dentro — ma la premessa con cui l'avevo escluso era sbagliata.**

Avevo cercato `typography` all'MCP, non trovato niente, e concluso che «shadcn non ha una risposta sul testo». La conclusione operativa di M2.1 regge — non c'era nulla da installare — ma quella frase è falsa: la risposta esiste, si chiama `typeset`, e non l'avevo cercata perché non ne conoscevo il nome. È un errore di metodo, non di giudizio: la scala della regola 4bis dice «si chiede all'MCP, non si presume», e chiedere con il nome sbagliato è un modo di presumere.

### Cosa ho verificato, e non dato per buono

**Non è un item del registry**, in tre modi indipendenti:

- `npx shadcn@latest view @shadcn/typeset` → `The item at .../base-nova/typeset.json was not found`;
- `npx shadcn@latest search @shadcn -q typeset` → `No items found`;
- la pagina rimanda a un generatore (`/typeset`) che emette un `typeset.css` «one CSS file you own».

Quindi **nessun `add` mancato**, e `registry/componenti-propri.json` resta vuoto a ragione — non per una svista.

Il `typeset.css` vero l'ho letto (12.158 byte, 491 righe) invece di fidarmi del riassunto della pagina: tre variabili di ritmo (`--typeset-size`, `--typeset-leading`, `--typeset-flow`), tre di carattere, i rapporti dei sei livelli di titolo, e la via d'uscita `not-typeset` / `data-not-typeset` per i componenti annidati nella prosa.

### Perché M2.1 non ne è toccata

Sono due mestieri diversi, e il nome lo dice — è la stessa regola del CLAUDE.md sui nomi, applicata a noi:

- **`typeset`** è il contenitore del **contenuto lungo reso da markdown**, l'equivalente shadcn di `prose`: stila i discendenti e ricava tutto dal ritmo.
- **`Primitive/Tipografia`** è la **cornice dell'interfaccia** — titolo di pagina, di card, meta, micro-etichetta — applicata per elemento, su gradini **enumerati** e non derivati.

Nessuno dei due sostituisce l'altro, e l'accettazione di M2.1 chiedeva il secondo.

### Ma è una lacuna vera, e ha una data

Il testo lungo nelle app Tassullo esiste: le descrizioni delle schede tecniche, l'editor di **M3.8**, il diff di **M3.9**, e le pagine MDX di questa stessa style guide. Oggi non ha una risposta. Aperta **D11**, con verdetto a M3.8.

### Le tre misure, prese ora perché a M3.8 servano già fatte

1. **I rapporti quasi coincidono.** Con `--typeset-size: var(--text-base)`, cinque livelli su sei cadono **sotto il pixel** rispetto alla scala Tassullo (`h2` −0,50, `h3` +0,75, `h4` 0,00, `h5` +0,25, `h6` +0,38). Solo `h1` diverge di 1,50px. I rapporti di shadcn e la scala scelta a mano dal v1 descrivono quasi la stessa gerarchia — che è l'argomento più forte a favore.
2. **Legge già i nostri token**: `--color-foreground`, `--color-muted-foreground`, `--color-border`, `--font-heading`, `--font-mono`. Entrerebbe senza inventare un colore.
3. **L'attrito vero, e non si vedeva a occhio**: `typeset` porta una **sua** leva responsiva — `calc(var(--typeset-size) * 1.125)` sotto i 768px — che si **somma** alla densità touch. 14px → 15 in touch → **16,88px sul telefono in touch**, cioè **1,205×** il corpo di partenza su una colonna che non si è allargata di un pixel. È esattamente la cella `375px × touch` di **D10**. Le due decisioni vanno guardate insieme, o in M4.2 salterebbe fuori un ingrandimento che nessuna delle due leve dichiara da sola.

### Modifiche

- `stories/Tipografia.stories.tsx` — corretta la frase sbagliata, e detto in pagina cosa fa `typeset`, cosa fa questa pagina, e che il contenuto lungo è D11.
- `docs/DECISIONI.md` §20 — rettifica in coda, con le tre misure e la tabella dei sei livelli.
- `CHECKLIST.md` — **D11** aperta accanto a D10, e precisata la riga di fase 2.

### Cosa NON è stato fatto, di proposito

**`typeset` non è stato adottato.** Sarebbe stato un file di tema nuovo, una leva responsiva in più e un intreccio con D10: non è una cosa da infilare in coda a un task chiuso, ed è una decisione di Francesco. Qui c'è la misura, non la scelta.

### Prossimo passo

M2.2 (Form) come da piano. D11 non blocca niente fino a M3.8.

---

## 2026-09-09 — M2.2 Form: dieci primitive, tre difetti del preset, e un pannello che mente

Le dieci primitive del modulo — `field`, `input`, `input-group`, `label`, `textarea`, `select`, `checkbox`, `switch`, `radio-group`, `slider` — installate, ri-stilate, dichiarate nel registry (**21 item**, `registry validate` verde) e provate da tastiera.

### Il gate corretto per primo, e ha subito ripagato

Due modifiche a `scripts/check-registry.ts`, fatte **prima** di ri-stilare:

1. **I componenti a segnaposto d'icona uscivano con `continue` e si portavano via anche il controllo dei valori arbitrari.** `spinner`, `checkbox` e `select` erano gli unici file del registry dove un valore arbitrario *nostro* non sarebbe stato visto da nessuno — e con M2.2 diventavano tre su venti. Ora il segnaposto salta solo il confronto di **forma**; le stringhe di classi si controllano lo stesso. Ha scoperto nello stesso minuto `checkbox rounded-[4px]` e `select rounded-[min(var(--radius-md),10px)]`, invisibili fino a ieri.
2. **Un elenco di proprietà non è un valore.** `transition-[color,box-shadow]` è una parentesi quadra che non contiene né una lunghezza né un colore: non è ciò che la regola 3 vieta, e non c'è niente da «ripulire ri-stilando». Aggiunto `ELENCO_PROPRIETA_RE`.

Avvisi del gate: **da 18 a 5**, e i cinque restanti sono tutti sostanziali.

### I ri-stili, e i tre difetti veri

Sette componenti toccati; `input`, `textarea`, `label` e `radio-group` passano **senza un ritocco**.

**`field` — le due trappole scritte nel CLAUDE.md, tutte e due presenti nel preset.**

| | prima | rapporto | ora | rapporto |
|---|---|---|---|---|
| testo d'errore, chiaro | `text-destructive` | **4.46** pagina / 4.75 card | `text-destructive-subtle-foreground` | **7.68** / 8.17 |
| testo d'errore, scuro | `text-destructive` | **3.81** pagina / **3.53** card | idem | **11.29** / 10.45 |
| link in hover | `text-primary` | **1.79** | `text-accent-ink` | **4.77** / 5.07 |

`--destructive` è un colore da **fondo** — è il rosso pieno del bottone distruttivo — e come testo non arriva a 4.5:1 in **nessuna** delle quattro combinazioni. Il testo rosso ha già il suo token dal v1 (`--color-danger-text`). Stessa correzione fatta al `badge` in M2.1, stesso errore del preset.

**`slider` — tre cose, e la terza è la più grave.**

- `bg-white` sul pomello: un colore **fuori dal tema**. In chiaro non si notava, in scuro era l'unico bianco pieno dell'interfaccia. `bg-background` da solo però crollava a **1.22** sul binario scuro: la risposta giusta è `bg-background dark:bg-foreground` — **12.91 in scuro** — che è l'idioma che il nostro `switch` usa già per il suo pomello.
- pomello `size-3` → `size-4`: bersaglio del dito da **42 a 48px** in touch, sopra i 44 che M2.9 chiederà invece che sotto per due pixel.
- **La maniglia non mostrava il fuoco.** `focus-visible:ring-3` stava sulla maniglia, ma Base UI mette il fuoco su un `<input type="range">` **nascosto dentro** di essa: la maniglia matcha `:focus-within`, mai `:focus-visible`, e l'anello non compariva mai. È WCAG 2.4.7, ed è un difetto del preset. Corretto in `has-[:focus-visible]:ring-3` — l'idioma che checkbox e radio del preset stesso già usano.

**`switch` — l'unico componente del set con misure in pixel crudi, quindi l'unico che la densità non scalava.**

| | prima | ora | normale | touch |
|---|---|---|---|---|
| `default` | `h-[18.4px] w-[32px]` | `h-4.5 w-8` | 18 × 32 | **27 × 48** |
| `sm` | `h-[14px] w-[24px]` | `h-3.5 w-6` | 14 × 24 | 21 × 36 |

Stessa forma dell'eccezione della sidebar accertata in M1.4. I 18px al posto di 18.4 sono **esatti**: il pomello è `size-4` più i due bordi da 1px — il quarto di pixel mancante era il refuso, non la correzione.

**`checkbox`, `select`, `input-group`** — raggi e rientri in unità crude riportati sui gradini del tema. I quattro rientri negativi di `input-group` (`ml-[-0.3rem]` → `-ml-1`, `ml-[-0.15rem]` → `-ml-0.5`) non sono decorazione: tolgono il doppio margine fra bordo e bottone incorporato, e in rem non seguivano la densità.

### Due requisiti d'uso che nessuno documenta, e che ogni app sbaglierebbe

1. **Lo `slider` si etichetta con `aria-labelledby`, non con `htmlFor`.** L'`id` scritto sullo `<Slider>` finisce sul `div` esterno; il fuoco sta sugli `<input type="range">` nascosti, che restano **senza nome**. Trovato interrogando il DOM — axe non lo vede, perché gli input sono nascosti. Con `aria-labelledby` la radice inoltra il nome a tutte le maniglie: «Range di conformità, 5, inizio intervallo».
2. **Il `select` vuole `items`, o il grilletto mostra il valore grezzo**: «deumidificanti» invece di «Intonaci deumidificanti». Base UI risolve l'etichetta da quella mappa (`resolveSelectedLabel`); senza, ricade sull'`value`. Si vede a occhio nudo appena si sceglie una voce.

Entrambi corretti in tutte le story e scritti in pagina, perché li sbagli zero volte invece di una.

### Verifiche

- **axe-core: 158 scansioni (79 story × 2 modalità) — 0 violazioni, 0 errori.** Regola `region` disattivata: su una story isolata «tutto dentro un landmark» non ha senso. Due violazioni trovate e chiuse, entrambe **mie nelle story**: campi senza etichetta in `Input/CifreInColonna`, ed etichetta al 50% di opacità in `Slider/Disabilitato` (che ha portato a una scelta migliore — il cursore si spegne, l'etichetta no: è la sola cosa che dice *che cosa* è disabilitato).
- **16 *incomplete*, tutte `color-contrast` sui tasti simbolo di `Kbd`** — la famiglia già chiusa a misura in M2.1, ora estesa a `InputGroup/Ricerca`. Rimisurata invece che data per buona: ⌘ e K danno **4.55 in chiaro e 6.36 in scuro**, identici fra simbolo e lettera. Il conto delle violazioni aperte resta **zero**.
- **Percorso da tastiera del form di prova: 14 fermi**, in ordine di DOM, ognuno con nome accessibile, `:focus-visible` e anello visibile (per i controlli dentro `InputGroup` l'anello sta sul contenitore, per costruzione). Gruppo radio: un solo fermo, frecce che cambiano scelta e ciclano.
- **Densità, misurata a transizioni spente su Storybook costruito** (vedi sotto perché):

| | normale | touch | | normale | touch |
|---|---|---|---|---|---|
| input, select, input-group, bottone | 32 | **48** | checkbox / radio (disegno) | 16 | 24 |
| switch (disegno) | 18 | **27** | checkbox / radio (bersaglio) | 32 | **48** |
| switch (bersaglio) | — | **51×84** | slider (bersaglio) | 32 | **48** |

- `npm run check` (contrasto 48/48, registry 0 errori, font allineato), `tsc -b`, `oxlint`, `build`, `build-storybook`: verdi.

### Quello che NON è stato verificato, e va detto

**Il `select` *aperto* non è verificabile in questo pannello.** `requestAnimationFrame` non ci scatta, e Base UI ci schedula dentro lo spostamento del fuoco nel popup: il fuoco resta sul grilletto, e frecce e `Invio` non rispondono. Col mouse la scelta funziona. Non è una prova che il componente sia rotto, e non è una prova che sia sano: **è una misura che non si può prendere qui**. In carico a **M2.3**, dove il comportamento da tastiera dei popup è il criterio di accettazione, in un browser vero.

### Un rilievo più grosso del task, che non è mio da chiudere

**Il contorno dei controlli sta sotto la soglia 3:1 di WCAG 1.4.11 — su tutto il set, in entrambe le modalità.**

| | chiaro | scuro |
|---|---|---|
| `border-input` su pagina | **1.27** | **1.36** |
| `border-input` su card | 1.36 | 1.25 |

Non viene dal ri-stile: è il valore di `--input`/`--border`, ereditato dal `--color-border` del v1. E **`check:contrast` non lo può vedere**, perché verifica 24 coppie di **testo** e nessuna coppia non testuale. Cambiarlo significa toccare la palette nella fonte unica, cioè una decisione di Francesco, non una correzione di componente. Annotato in `CHECKLIST.md` e in carico a **M2.9**.

### Cinque errori di strumento, e vale la pena scriverli tutti

Più della metà del tempo di questa sessione è finita qui. Sono errori di **misura**, non di componente, e quattro su cinque hanno fatto sembrare rotto qualcosa che funzionava.

1. **`html` largo 0 col pannello senza viewport stabilito.** Base UI nasconde le maniglie del cursore quando il controllo misura 0 e non le rimette: lo `slider` dentro il form appariva senza maniglie e non raggiungibile da tastiera. Con un viewport vero (1200×900): largo 672px, maniglie visibili, fuoco che ci arriva. **La conclusione «è rotto» era mia, non sua.**
2. **`requestAnimationFrame` non scatta** — già a verbale in M2.1, qui con una conseguenza nuova e peggiore: non stalla una misura, **fa sembrare rotto un componente intero** (il `select`).
3. **Le transizioni non avanzano.** `transition-all` fa *animare* l'altezza quando cambia `--spacing`: bottone e switch restavano congelati a 32 e 18 in touch mentre l'`input` accanto — che ha `transition-colors` — era già a 48. Correlazione perfetta fra i due gruppi, e con `transition: none` tutti i valori tornano quelli attesi. **Ogni misura di densità va presa a transizioni spente.**
4. **`axe.run` su un elemento di un *altro* documento fallisce come «arguments are invalid»**: 158 scansioni tornate «0 violazioni» che non valevano niente. Me ne sono accorto solo perché contavo anche gli errori. axe va iniettato **dentro** l'iframe ed eseguito da lì.
5. **«Popup ancora nel DOM» ≠ «popup aperto»** (Base UI lo tiene per l'animazione d'uscita, con `data-closed`), e **`Down` non è un nome di tasto valido** mentre `ArrowDown` sì — per cui il gruppo radio sembrava non rispondere alle frecce.

La lezione operativa, che il CLAUDE.md già dice a metà: **prima di scrivere che un componente è rotto, si verifica che lo strumento non lo sia.** Le tre volte in cui ho concluso troppo presto, la prova successiva mi ha smentito.

### Prossimi passi

**M2.3 — Overlay**: `dialog`, `alert-dialog`, `drawer`, `sheet`, `dropdown-menu`, `context-menu`, `popover`, `hover-card`, `tooltip`, `sonner`, `command`. Accettazione: focus trap e chiusura con Esc verificati. **Ci arriva in eredità il `select` aperto**, che è la stessa macchina di popup e positioner, e va provato in un browser vero — non nel pannello.

---

## 2026-09-09 — M2.3 Overlay: undici primitive, un componente che si schianta, e il pannello che mentiva

Le undici primitive del modulo — `dialog`, `alert-dialog`, `drawer`, `sheet`, `dropdown-menu`, `context-menu`, `popover`, `hover-card`, `tooltip`, `sonner`, `command` — installate, ri-stilate, dichiarate nel registry (**32 item**, `registry validate` verde) e provate **in un browser vero**, che è la novità di questa sessione.

### Il rilievo lasciato aperto da M2.2 si chiude, e la causa non era il `select`

M2.2 aveva scritto: «il `select` aperto non è verificabile nel pannello del browser». La causa è stata isolata qui ed è una riga sola:

```
document.visibilityState === 'hidden'   →   requestAnimationFrame NON scatta
```

Il pannello tiene la pagina **nascosta** anche mentre la si guida; Base UI schedula in `rAF` lo spostamento del fuoco dentro il popup; con `rAF` fermo il fuoco resta sul grilletto. Non è lentezza: non scatta mai, misurato con un timeout di 800ms. Ci si somma un secondo strumento rotto — **i tasti non arrivano alla pagina finché non ci si è cliccato dentro davvero**: prima di un clic reale, zero eventi `keydown` registrati. Due guasti di strumento che insieme dicono «il popup non risponde alla tastiera».

Misura rifatta con Chromium di Playwright, dalla cartella temporanea, contro lo Storybook **costruito** servito in HTTP: `rAF` scatta in 0ms. **Playwright non è stato aggiunto al repo di proposito** — l'imbracatura dei test in CI è una scelta di M2.9, e anticiparla qui l'avrebbe decisa di fatto.

Col browser vero, il **`select` aperto funziona in tutto il percorso**: `Invio` apre e porta il fuoco sulla voce, le frecce scorrono, la lettera salta («p» → Pubblicato), `Invio` sceglie e chiude col grilletto che mostra l'etichetta giusta, `Esc` chiude senza cambiare, e il fuoco torna sempre sul grilletto. Il rilievo di M2.2 è **chiuso**.

### Il criterio di accettazione, misurato

**Fuoco intrappolato ed `Esc`** su tutti e cinque i modali. Per ognuno: `Invio` apre, il fuoco entra, otto `Tab` girano **senza mai uscire**, `Esc` chiude, il fuoco **torna sul grilletto**.

| | `Invio` apre | fuoco all'apertura | 8 `Tab` restano dentro | `Esc` chiude | fuoco dopo `Esc` |
|---|---|---|---|---|---|
| `Dialog` | sì | campo | sì | sì | grilletto |
| `AlertDialog` | sì | «Annulla» | sì | sì | grilletto |
| `Sheet` | sì | campo | sì | sì | grilletto |
| `Drawer` | sì | pannello | sì | sì | grilletto |
| `Popover` | sì | campo | **no, ed è giusto** | sì | grilletto |

Il popover è l'eccezione **voluta**: non è modale, `Tab` ne esce e lo chiude. Somigliare a un dialog non lo rende un dialog, ed è la distinzione scritta in pagina.

**Menu**: `↓` apre, frecce che scorrono e ciclano, salto per lettera (che **accumula** più lettere: «d» poi «e» cerca «de», non «e»), `→` entra nel sottomenu e `←` ne esce, `Esc` chiude e riporta il fuoco. Il tasto destro apre il menu contestuale e le frecce ci arrivano dentro. **`Command`**: 500 voci filtrate a 3 in **340ms**, fuoco che resta nel campo e selezione che si muove con `aria-activedescendant` — il modo giusto, e l'unico che lascia continuare a scrivere mentre si scorre.

### Il difetto grosso: un componente che non degrada, si schianta

**`DropdownMenuLabel` deve stare dentro un `DropdownMenuGroup`**, o Base UI **lancia**: «MenuGroupContext is missing», errore **#31**. Il menu non si apre affatto e la story sparisce.

Gli esempi di shadcn mettono l'intestazione in cima al contenuto, fuori da ogni gruppo, cioè **nella forma che fallisce**. Quattro story su cinque di questa sessione erano scritte così — copiando la forma canonica — e sono crollate. Vale identico per `ContextMenuLabel`. Corrette tutte, e scritto in pagina: è lo stesso genere di rilievo del `select` che vuole `items`, ma peggiore, perché lì restava il valore grezzo e qui non resta niente.

È anche la dimostrazione del perché §22 conta: **il difetto esiste solo a menu aperto**, e fino a M2.3 il menu non si riusciva ad aprire in fase di misura.

### I ri-stili, e i tre difetti veri

Sette file su undici passano **senza un ritocco**: `dialog`, `alert-dialog`, `drawer`, `popover`, `hover-card`, `command` e — quanto a classi — `sheet` era l'unico con misure crude.

**1. `text-destructive` come colore di testo, per la terza e quarta volta.** `dropdown-menu` e `context-menu` scrivevano le voci distruttive nel rosso pieno, che è un colore da **fondo**. Corretto in `text-destructive-subtle-foreground` (il `--color-danger-text` del v1) nelle tre occorrenze di ciascuno: testo a riposo, testo col fuoco, icona. Stessa correzione di `badge` (M2.1) e `field` (M2.2): il preset la ripete a ogni componente che ha una variante distruttiva, e conviene aspettarsela in M2.4 su `alert`.

**2. Il toast era illeggibile in modalità scura, e la causa è `next-themes`.**

| | prima | ora |
|---|---|---|
| descrizione del toast, chiaro | 10.35:1 | 5.37:1 |
| descrizione del toast, **scuro** | **1.62:1** | **7.17:1** |

`sonner.tsx` importa `useTheme` da **`next-themes`**, la libreria di temi di Next.js, che noi non usiamo: la nostra modalità è una classe sulla radice. Senza il suo provider `useTheme()` ricade su `"system"`, cioè sul tema del **sistema operativo**, e `data-sonner-theme` non viene scritto affatto. Il fondo e il titolo del toast restano giusti — arrivano dai `var()` che il preset mappa sui nostri token — ma la **descrizione** ha il colore `#3f3f3f` **cablato dentro il CSS di `sonner`**, sollevato solo da `[data-sonner-theme='dark']`. Su fondo scuro: 1.62:1.

Chiuso con una stringa di classi, che è il gradino 2: `**:data-[description]:text-muted-foreground!`. L'importante serve perché il CSS di `sonner` non è in un layer e batterebbe l'utility a prescindere dalla specificità.

**Resta aperta la domanda strutturale**, e non è mia: `next-themes` va tolto? Sarebbe una chiamata e una prop in meno, cioè fuori dal gradino 2. Finché resta, va dichiarato fra le dipendenze dell'item o l'app consumer non compila — ed è un pacchetto che ogni app installerebbe **per non usarlo**. Decisione di Francesco; la misura è qui.

**3. Le misure fuori dal tema.** `sheet`: le quattro distanze d'ingresso in `rem` crudi (`translate-y-[2.5rem]` e speculari) → `translate-y-10` e `-translate-x-10`, stesso pixel al gradino normale ma ora dal tema. `dropdown-menu`: `min-w-[96px]` → `min-w-24`. `tooltip`: `rounded-[2px]` sulla punta della freccia → `rounded-xs` (Tailwind lascia `--radius-xs` a 2px e il tema non lo ridichiara: identico, ma è un gradino).

**Lasciati ereditati, ed è una scelta**: i valori del `drawer` (`cubic-bezier`, `--drawer-swipe-progress`, `--drawer-swipe-strength`) sono **fisica**, non tema — descrivono come il pannello segue il dito, non hanno un gradino e «ripulirli» cambierebbe il comportamento. Idem `grid-rows-[auto_1fr]` (elenco di tracce) e i `calc()` geometrici, per il precedente dello `switch` in M2.2.

### Il gate corretto per primo, di nuovo, e di nuovo ha ripagato

Tre correzioni a `scripts/check-registry.ts`, **prima** di ri-stilare, tutte della famiglia di `DECISIONI.md` §19 (dettaglio in §23):

1. **`cn-font-heading`** — la CLI lo toglie dai titoli di dialog/alert-dialog/sheet/drawer; il gate lo contava come nostro ri-stile su file mai aperti.
2. **L'alias del registry** — `@/registry/base-nova/…` → `@/registry/tassullo/…` è un **percorso**, non una classe, e finiva nel conto. Conseguenza: **i conti di M2.1 e M2.2 erano gonfiati** — `field` 5 → 3, `input-group` 8 → 5, `button-group` 5 → 4.
3. **Una riga per componente** — il ramo del segnaposto stampava `◌ la forma non è confrontabile` e poi **cadeva** in fondo aggiungendo `○ forma identica all'originale`: la contraddizione esatta, su sette componenti.

### axe-core: 246 scansioni (123 story × 2 modalità), 0 errori di strumento

**8 violazioni, tutte della stessa famiglia**, e non chiudibili a questo livello: `aria-hidden-focus` × 6 sulle quattro story di `dropdown-menu` aperto, in entrambe le modalità. I sei nodi sono i **guardiani del fuoco di Base UI** — `<span aria-hidden="true" tabindex="0" data-base-ui-focus-guard>` — cioè il meccanismo stesso che fa girare il `Tab` dentro al menu. Generati dalla libreria, assenti da ogni stringa di classi: la regola 4bis non lascia modo di toccarli. Il `dialog` monta gli stessi guardiani e lì axe li marca *incomplete* invece che violazione, perché portano anche `data-base-ui-inert`. **In carico a M2.9**, che dovrà decidere se esentare la regola quando axe passa in CI.

**Tre violazioni trovate e chiuse, tutte mie nelle story** — e tutte e tre sono requisiti d'uso che valeva la pena scoprire adesso:

- `aria-dialog-name` su due popover senza `PopoverTitle`: **un popup con `role="dialog"` vuole un nome**, anche quando contiene una frase sola (`DECISIONI.md` §21.2);
- `scrollable-region-focusable` sull'elenco lungo dello `sheet`: una regione che scorre e non contiene controlli va resa raggiungibile dal fuoco, o da tastiera non la si scorre;
- `aria-required-children` su `command`: **`CommandSeparator` non può stare dentro `CommandList`**, che è un `role="listbox"` — «children which are not allowed: [role=separator]». La forma che lo produce è quella degli esempi di shadcn. Tolto dalle story: l'intestazione di gruppo separa già, e lo fa in un modo che chi usa uno screen reader sente.

**Le 290 *incomplete* misurate e chiuse a mano**, perché un'*incomplete* è una misura che nessuno ha fatto:

| famiglia | quante | verdetto |
|---|---|---|
| `color-contrast` | 112 | campionate su tutte le famiglie: **il minimo vero è 5.37:1** (`muted-foreground` su `popover`, chiaro). Nessuna sotto soglia |
| `aria-hidden-focus` | 162 | gli stessi guardiani di Base UI, più `#storybook-root` marcato `aria-hidden` dai modali |
| `aria-valid-attr-value` | 16 | `aria-controls` del grilletto: verificato a mano che **l'elemento puntato esiste** ed è il popup |

Una delle 112 sembrava 1.55:1 — era il mio strumento, non il componente (vedi sotto).

### Densità, misurata a transizioni spente

| | normale | touch | | normale | touch |
|---|---|---|---|---|---|
| voce di menu | 25,14 | **36** | riquadro del menu | 117,56 | 169 |
| voce di `command` | 29,14 | **42** | campo di ricerca | 32 | **48** |
| chiusura del dialog | 32 | **48** | fumetto del tooltip | 26,66 | 34 |

**Un rilievo per M2.9**: la **voce di menu è il bersaglio più piccolo del set in touch** — 36px, contro i 48 di bottone, campo e select; la voce di `command` sta a 42. Passano WCAG 2.5.8 (24px minimi) ma stanno sotto i 44 che M2.9 chiederà. Il rimedio è una stringa di classi sola, `py-1` → **`py-2`**, misurata: **48px esatti in touch**, 33 in normale contro gli attuali 25. Non fatto qui perché alza tutti i menu di tutte le app **anche alla densità da scrivania**: è una scelta di sistema come le costanti della sidebar, non una correzione di passaggio.

### Verifiche

- `npm run check` (contrasto 48/48, registry 0 errori, font allineato), `registry validate` (32 item), `tsc -b`, `oxlint`, `build`, `build-storybook`: **verdi**.
- Il gate di aggiornabilità legge ora **8 componenti ri-stilati sopra una forma shadcn intatta**, 22 avvisi tutti ereditati, **0 componenti nostri** — `registry/componenti-propri.json` resta vuoto, che è la condizione da difendere.
- 5 token custom usati dentro i componenti, invariati rispetto a M2.2: `accent-ink`, `destructive-border`, `destructive-foreground`, `destructive-subtle`, `destructive-subtle-foreground`.

### Gli errori di strumento, che restano più della metà del lavoro

Quattro, e tre hanno fatto sembrare rotto qualcosa che funzionava. Vanno a sommarsi ai cinque di M2.2.

1. **`rAF` fermo col pannello nascosto** — già noto da M2.1, qui **isolato come causa** del rilievo di M2.2 e non più solo sospettato: `document.visibilityState === 'hidden'`, timeout di 800ms senza un frame.
2. **I tasti non arrivano senza un clic reale prima**: `keydown` registrava **zero eventi**, nemmeno non fidati. Con un clic vero prima, tutto normale.
3. **`document.querySelector('button')` prendeva un bottone della *struttura di Storybook***, non della story: nel preview costruito resta nel DOM uno scheletro nascosto con tre bottoni «Set string». `.focus()` su un elemento nascosto non fa nulla — e la conclusione era «il grilletto non prende il fuoco». Lo stesso scheletro gonfiava le *incomplete* di axe finché non è stato escluso dalla scansione.
4. **Il compositore di colori scritto in fretta** componeva **sempre su bianco** i fondi semitrasparenti: **1.55:1** su un bottone `outline` nel drawer scuro. Rifatto impilando la catena dei fondi nell'ordine giusto: **13.74:1**. Terza sessione di fila in cui lo strumento accusa il componente.

E una svista mia, non di strumento: `npx prettier` lanciato su due story le ha riscritte con virgolette doppie e punti e virgola, che non sono lo stile della casa. Riscritte a mano. **Nel repo non c'è un prettier configurato**, e non va invocato al volo.

### Prossimi passi

**M2.4 — Contenuto**: `card`, `tabs`, `table`, `alert`, `empty`, `accordion`, `collapsible`, `scroll-area`, `resizable`, `progress`, `aspect-ratio`, `carousel`. Due cose arrivano da qui: **`alert` avrà quasi certamente lo stesso `text-destructive` come testo** — è la quinta volta che il preset lo ripete — e **`scroll-area` è la risposta pronta** al `scrollable-region-focusable` misurato oggi sullo `sheet`.

Aperta e non mia: **`next-themes` va tolto da `sonner`?** In carico a Francesco.

### Coda della stessa giornata — D12 chiusa, e un'ipotesi provata e scartata

**Il `modal` dei menu non c'entra con le 8 violazioni.** `Menu.Root` di Base UI ha una prop `modal` (default `true`), ed era l'unica leva plausibile per far sparire `aria-hidden-focus` senza toccare il file. Provata su una story usa-e-getta: **6 violazioni con `modal: true`, 6 con `modal: false`**, e i guardiani del fuoco non prendono `data-base-ui-inert` in nessuno dei due casi. Il rilievo resta in carico a M2.9 — che però ora sa di non dover ritentare questa strada.

**D12 chiusa: `next-themes` si lascia.** Chiusa con due misure, non con un'opinione.

1. **Dopo la correzione del contrasto, il suo contributo è zero.** Confrontato il toast reso **con e senza** tema forzato, in chiaro e in scuro, su `backgroundColor`, `color`, `borderColor`, `borderRadius`, `boxShadow` del toast, colore di titolo, descrizione e icona, e sugli stessi valori del bottone d'azione e di quello di chiusura: **0 differenze**, in entrambe le modalità. Il preset mappa già `--normal-bg/text/border` e `--border-radius` sui nostri token, la descrizione ora è fissata dalla nostra classe, e shadcn **non accende `richColors`** — quindi la palette semantica interna di `sonner` non viene mai usata.
2. **Il costo è 3,4 KB nel bundle** (il modulo non minificato) e 44 KB in `node_modules`, su un bundle che oggi è 232 KB. **Nulla sul server**: è una dipendenza di *compilazione*, finisce nel JavaScript costruito. Sulle app ospitate su Azure non cambia niente — nessun pacchetto da installare là, nessuna configurazione.

Si lascia perché il guadagno sarebbe 3 KB e il prezzo la **prima divergenza strutturale del progetto**, su un file che `check:registry` per giunta **non confronta** (segnaposto d'icona, `◌`): il gate non ci proteggerebbe dal dimenticarcene al prossimo aggiornamento di shadcn.

**E c'è già una via d'uscita per chi ne avesse bisogno**, senza toccare niente: in `sonner.tsx` lo `{...props}` è l'**ultima** prop, quindi un `<Toaster theme="dark" />` passato dall'app vince su `next-themes`. Verificato: `data-sonner-theme` passa da `light` a `dark`.

### Coda — le classi `cn-*`, da un'osservazione su `select`

Francesco: «l'apertura del menù del nostro `select` è diversa da quella di shadcn, forse c'è un'opzione non attiva». Verificato: **nessuna opzione spenta per sbaglio**, ma l'osservazione ha portato fuori una trappola vera.

Le classi `cn-*` (`cn-menu-target`, `cn-menu-translucent`, `cn-font-heading`, `cn-rtl-flip`) **non sono CSS**: sono marcatori che la CLI risolve a `add` leggendo `components.json`. Ne sparivano **16 su 7 file**, ed era invisibile al gate perché `select`, `dropdown-menu` e `context-menu` sono componenti a segnaposto d'icona (`◌`), di cui la forma non si confronta.

Verificato in tre modi che non perdiamo niente — codice della CLI, zero regole CSS per quelle classi **anche sul sito di shadcn**, e confronto a parità di contenuto del `select` aperto: stesse classi del popup, stesso padding, stessi figli, stesse classi delle voci. Divergono solo i **nostri token**: raggio della voce **6px** contro 8, e i colori. Dettaglio in `DECISIONI.md` §24.

**Due cose che restano.**

1. **`menuColor` e `menuAccent` sono opzioni mai esercitate**, non errori: siamo sui default di shadcn, messi da `init`. `menuColor` ammette anche `inverted`, `default-translucent`, `inverted-translucent`. Cambiarli è legittimo e si vedrebbe su tutti i menu, ma la CLI li applica **a `add`**: andrebbero riscaricati e ri-stilati a mano i file toccati.

2. **La trappola: `--font-heading` dietro un `@import` la CLI non lo vede.** Tiene `cn-font-heading` solo se trova la stringa `--font-heading:` dentro il file indicato da `tailwind.css` (`src/index.css`), con una ricerca testuale su **un solo file**, senza seguire gli `@import`. Il nostro token esiste ma sta in `tassullo-theme.css`, importato: quindi la classe viene tolta dai titoli di dialog, alert-dialog, sheet e drawer. **Oggi innocuo per fortuna** — `--font-heading` è `var(--font-sans)`, cioè Inter come il corpo (§14) — **ma il giorno in cui i titoli avessero una faccia diversa non si applicherebbe, in silenzio.** Rimedio noto e non applicato: dichiararlo anche in `src/index.css` sarebbe una seconda copia di un token, cioè la deriva che la regola permanente vieta, per un problema che oggi non esiste.

Rettificata `DECISIONI.md` §23, dove `cn-font-heading` era archiviato come semplice trasformazione della CLI senza dire **da cosa dipende**.

### Rettifica in coda: le violazioni axe aperte sono **12**, non 8

Trovata verificando l'osservazione di Francesco sul `select`. **L'imbracatura di misura apriva i menu ma non il `select`**: la mappa dei grilletti da cliccare, in `axe.mjs`, non aveva la voce `select` (né il dialog della palette comandi). Aggiunte e rifatto il giro completo.

| | prima | ora |
|---|---|---|
| `dropdown-menu` aperto, 4 story × 2 modalità | 8 (6 nodi ciascuna) | 8 |
| **`select` aperto, 2 story × 2 modalità** | **0, perché non veniva aperto** | **4** (4 nodi ciascuna) |
| **totale** | **8** | **12** |

Stessa famiglia, stessa causa, stesso verdetto: sono i guardiani del fuoco di Base UI, non toccabili ri-stilando, in carico a M2.9. Cambia il numero, non la sostanza — ma il numero era scritto in tre posti e andava corretto.

**La lezione operativa vale più del numero, ed è per M2.9**: avevo scritto che «il registro cambia quando la misura sa aprire i popup». È successo di nuovo, **dentro la stessa sessione**, per una riga mancante nella mia mappa. Chi accende axe in CI deve verificare *quali* popup la scansione apre davvero: **un popup non aperto non è un popup senza violazioni**, è un popup non misurato.

### Coda — `alignItemWithTrigger`: c'era, mancava la story

Domanda di Francesco: «`alignItemWithTrigger` non la vedo attivabile, c'è nel componente importato?» **Sì, e identica all'originale** — tipizzata su `SelectContent` fra le prop del `Positioner`, default `true`, riflessa anche in `data-align-trigger` (che è ciò che spegne l'animazione quando è attiva). Si usa `<SelectContent alignItemWithTrigger={false}>`.

Quello che mancava era il modo di **provarla**: le nostre story usano `render` senza `args`, quindi Storybook dice «This story has no controls». Aggiunta la story `Select/AllineatoAlGrilletto`, che mostra le due rese affiancate con la terza voce su cinque già scelta — la stessa forma con cui `Tema/Densità` mostra le due densità.

Misurato, grilletto alto 32px col bordo superiore a y=344:

| | bordo alto del popup | voce scelta |
|---|---|---|
| `true` (predefinito) | **51px sopra** il grilletto | y=347, cioè **sul grilletto** (scarto 3px) |
| `false` | 36px **sotto** — i 4px di `sideOffset` dal bordo basso | y=434, 90px più giù |

Con `true` il popup si apre *attorno* al valore corrente e può debordare sopra il campo — è il `<select>` nativo di macOS, e spiega perché il preset spegne l'animazione in quel caso. Con `false` si aggancia al bordo e scende, come una tendina qualsiasi, con l'animazione.

**Quando servirà `false`**: campi in fondo alla pagina o dentro contenitori che scorrono, dove con `true` il popup insegue la voce scelta e può coprire il campo e ciò che gli sta sopra. Nelle schede di Anagrafe i `select` stanno in form lunghi, quindi è la variante da valutare — ma la decisione vera arriva con **M2.6**, dove il `combobox` sostituisce queste liste quando si allungano.

axe sulla story nuova: **0 violazioni** nelle due modalità e in entrambe le varianti. Giro completo rifatto: **248 scansioni (124 story × 2 modalità), 12 violazioni**, invariate.

---

## 2026-09-09 — M2.4 Contenuto: dodici primitive, un criterio che si chiude al gradino 1, e un server che mentiva

**Task**: M2.4 — `card`, `tabs`, `table`, `alert`, `empty`, `accordion`, `collapsible`, `scroll-area`, `resizable`, `progress`, `aspect-ratio`, `carousel`. Dodici primitive, 44 item nel registry.

### Il criterio dell'`alert`, e perché la risposta non era quella che sembrava

Il piano chiedeva «`alert` nelle quattro varianti info/success/warning/destructive sui token semantici», e `PIANO.md` §492 aveva creato la famiglia `X-subtle`/`X-subtle-foreground`/`X-border` **proprio per questi alert**. Ma shadcn ne ha due, `default` e `destructive`, e aggiungere tre **nomi di variante** al `cva` esce dal gradino 2 della regola 4bis.

L'ho provato prima di discuterne, ed è la misura che conta: `check:registry` va **rosso** — «diverge dall'originale FUORI dalle stringhe di classi: struttura, props, nomi di varianti o export». Il gate ha fatto esattamente il suo mestiere.

Portata la scelta a Francesco come proposta di gradino 4. **La sua risposta ha cambiato la domanda**: nella pagina del componente shadcn documenta l'opzione *Custom colors* — «You can customize the alert colors by adding custom classes such as `bg-amber-50 dark:bg-amber-950` to the `Alert` component». Cioè **shadcn ce l'ha già**, e la sua risposta ai livelli semantici è `className`, non le varianti.

Quindi la scala si ferma al **gradino 1**, `alert.tsx` resta intatto nella forma, e il gate resta verde. Quello che il design system mette di suo non è una variante: è la **terna di token**, che `check:contrast` verifica e che fa **pesare uguale** i quattro alert (gradini fissi per tutte le famiglie, `PIANO.md` §525). La ricetta sta scritta una volta nella story `Alert/QuattroLivelli`, e i blocchi di FASE 3 la incorporeranno.

**La lezione operativa, e vale oltre questo task**: prima di proporre una divergenza, si guarda la **documentazione** del componente, non solo il suo sorgente. Il sorgente dice cosa c'è; la documentazione dice cosa gli autori considerano l'uso previsto — e qui le due cose non coincidevano.

### I ri-stili: tre, e due sono la stessa trappola di sempre

1. **`alert`, `destructive`**: `bg-card text-destructive` → la famiglia tenue. È la **quinta** volta che il preset usa il rosso pieno come **testo** (le altre in M2.2 ×2 e M2.3 ×2). Misurato in M2.2: **4.46:1 in chiaro, 3.53:1 su card in scuro**, sotto soglia in entrambe.
2. **`empty`, `EmptyDescription`**: i link avevano `hover:text-primary`, l'arancio del brand come testo — **1.79:1 in chiaro**. Ora `text-accent-ink`, corretto in entrambe le modalità. **Sesta ripetizione**: conviene cercarla per prima cosa in ogni componente nuovo.
3. **`table`**: `tabular-nums` sull'elemento `<table>`. Una classe sola sulla radice, perché le cifre tabellari si ereditano: copre intestazioni, corpo e piede senza che chi scrive una tabella se ne debba ricordare colonna per colonna — che è il modo in cui la regola si perde.

E una quarta modifica che non è un ri-stile ma **la lingua**: le due frecce del `carousel` portavano `sr-only` in inglese e `aria-roledescription="carousel"/"slide"`. Sono le sole stringhe del componente che arrivano a un utente, e le sente **solo chi usa uno screen reader** — cioè esattamente chi non può accorgersi da sé che sono nella lingua sbagliata. Tradotte. Il gate non se ne accorge ed è giusto: confronta la forma **azzerando il contenuto delle stringhe**, quindi tradurre resta dentro il gradino 2.

**`card` non è stato toccato**, ed è il secondo criterio del task: il preset non ha `hover:`, non ha `cursor-pointer`, non ha `transition` sulla card. La regola non sta nel codice, sta nel non aggiungercelo — quindi sta nella story, `Card/Cliccabile`, che mette la forma sbagliata (la regressione del v1, commit `94b0f5a`) accanto a quella giusta, dove il bersaglio è un link vero che prende il fuoco.

### Quinta normalizzazione del gate, e non è colpa della CLI

`scroll-area.tsx` esce da `shadcn add` con `import * as React from "react"` e **non usa React**. Sotto il nostro `noUnusedLocals: true` quel file **non compila**: `tsc -b` esce con TS6133. Non c'è una scelta — o si toglie la riga, o il componente non entra — ma il confronto di forma la leggeva come divergenza strutturale. Aggiunta la normalizzazione (`DECISIONI.md` §25).

**Verificata prima di considerarla chiusa**: aggiungendo un `import { useMemo } from "react"` allo stesso file il gate torna **rosso**. Una normalizzazione che acceca il gate sarebbe peggio del falso positivo che chiude.

### axe-core: 338 scansioni (169 story × 2 modalità), 0 errori di strumento

**Primo giro: 15 violazioni.** Dodici sono le note di M2.3 — i guardiani del fuoco di Base UI su `dropdown-menu` (6 nodi × 4 story) e `select` (4 nodi × 2 story), in entrambe le modalità, in carico a M2.9. **Tre erano mie, e tutte e due le famiglie valevano la pena di trovarle adesso.**

1. **`alert` success, descrizione a 4.07:1 in chiaro.** Avevo scritto `text-success-subtle-foreground/90`, copiando l'opacità dal `destructive` del preset. **È esattamente il caso che `check:contrast` non può vedere**: verifica le *coppie di token*, e nessun token dichiara l'opacità con cui un componente lo usa. Il token pieno passa, il token al 90% no. Tolto il `/90` da tutti e quattro i livelli e da `empty`: la terna che il tema dichiara è quella che il gate garantisce, e non va annacquata.

2. **`resizable`, `scrollable-region-focusable` × 2 su `Verticale`.** I pannelli di `react-resizable-panels` portano `overflow: auto`, quindi appena il contenuto sborda diventano una regione che scorre senza fermi di tabulazione dentro — da tastiera irraggiungibile. **La risposta è la `scroll-area` di questo stesso task**, messa dentro il pannello: è la stessa medicina del rilievo di M2.3 sullo `sheet`, e ora è documentata nella story perché lo `split-view` di M3.9 la componga così fin da subito.

**Secondo giro dopo le correzioni: 12 violazioni, cioè esattamente le dodici note.** Il conto delle violazioni nostre torna a **zero**, che è la condizione d'ingresso di M2.9.

Le *incomplete* (192 `aria-hidden-focus`, 114 `color-contrast`, 26 `aria-valid-attr-value`) sono le stesse famiglie già misurate a mano in M2.3, cresciute in proporzione alle story.

### Contrasto, misurato a pagina ferma

| coppia | chiaro | scuro |
|---|---|---|
| alert **info**, titolo e descrizione | **6.87** | 9.24 |
| alert **success** | **4.84** | 9.42 |
| alert **warning** | **6.76** | 9.26 |
| alert **destructive** | **7.60** | 9.09 |
| `empty` — link | 5.05 | 7.75 |
| tabella — cella | 17.03 | 15.72 |
| card — descrizione | 5.37 | 7.17 |
| tabs — scheda inattiva | **4.51** | 6.36 |

I quattro alert stanno fra 4.84 e 7.60 in chiaro: **pesano uguale** come chiede `PIANO.md` §525. Il `destructive` viene da 4.46/3.53 del preset.

### Tastiera, in un browser vero

| | prova | esito |
|---|---|---|
| `tabs` | `Tab` entra sulla lista | **un solo** fermo, sulla scheda attiva |
| | frecce | spostano fra le schede; `Tab` scende nel pannello |
| `accordion` | `Invio` | apre; `Tab` passa all'intestazione dopo |
| `scroll-area` | `Tab` | **si ferma sul riquadro** (`tabindex="0"`), frecce: `scrollTop` 0 → 120 |
| `resizable` | frecce sulla maniglia | 1º pannello 335 → 502; `Home` 0, `Fine` 450 |
| `carousel` | frecce col fuoco su un bottone | la diapositiva scorre (bordo 464 → 131) |
| | frecce col fuoco **fuori** | **non** ruba i tasti: il cursore si muove nel campo |
| `collapsible` | `Invio` | `aria-expanded` → `true` |

### Densità

| | normale | touch | | normale | touch |
|---|---|---|---|---|---|
| lista di tabs | 32 | **48** | intestazione tabella | 40 | **60** |
| scheda di tabs | 25 | 41 | cella di tabella | 34,14 | 43,56 |
| intestazione accordion | 39,14 | 56 | traccia di progress | 4 | 6 |
| freccia carosello | 28 | 42 | spaziatura card | 16px | **24px** |

**Tre bersagli sotto i 44px in touch, tutti da portare a M2.9** — stessa famiglia della voce di menu a 36px trovata in M2.3, e nessuno dei tre si chiude con una scelta di questo task:

- **scheda di `tabs`: 41px.** Non è che non scali: 48 meno i `p-[3px]` della lista e l'`h-[calc(100%-1px)]` del grilletto fa esattamente 41. Sono **due valori arbitrari di shadcn**, e cambiarli è ridisegnare l'allineamento del filo della variante `line`.
- **freccia del `carosello`: 42px.** È la taglia `icon-sm` che shadcn passa di suo. Un `size="icon"` la porterebbe a 48, ma cambia il carosello di tutte le app.
- **cella di tabella: 43,56px** — sotto di mezzo pixel, e la riga è un bersaglio quando il `data-table` di M3.3 la renderà cliccabile.

**La maniglia di `resizable` resta 1px in entrambe le densità, e non è un'eccezione**: `w-px` è un filo, e i fili seguono la regola dei bordi, che M1.4 esclude esplicitamente dallo scaling. La **zona sensibile** invece scala (4 → 6px), ed è quella che conta per afferrarla.

### Verifiche

- `npm run check` (contrasto 48/48, registry 0 errori, font allineato), `registry validate` (**44 item**), `tsc -b`, `oxlint`, `build`, `build-storybook`: **verdi**.
- Il gate legge **11 componenti ri-stilati sopra una forma shadcn intatta**, 32 avvisi tutti ereditati, **0 componenti nostri** — `registry/componenti-propri.json` resta vuoto.
- Due dipendenze nuove, entrambe scelte di shadcn a monte e non eccezioni a D9: `react-resizable-panels` (resizable) ed `embla-carousel-react` (carousel).
- Un avviso di `oxlint` su `carousel.tsx` (`set-state-in-effect`): **è di shadcn**, e lo si vede perché compare identico su `registry/.upstream/carousel.tsx`.

### Gli errori di strumento, che restano la metà del lavoro

Tre, e i primi due hanno bruciato mezza sessione.

1. **`npx serve` rompe lo Storybook costruito.** Il preview restava su `sb-show-nopreview` — nessuna story risolta, in nessuna modalità — e axe girava **22 minuti senza produrre una riga**, perché ogni scansione andava in timeout a 15s. Nessun errore in console, nessuna richiesta fallita: le sue riscritture di URL bastano a far perdere al preview l'indice delle story. Con `python3 -m http.server` sulla stessa cartella funziona tutto. **Il dev server non serve da controprova**: lì rendeva benissimo, ed è ciò che ha fatto sospettare le story invece del server. Chi automatizza axe in M2.9 usi un server statico stupido.
2. **`document.querySelector('tbody td')` pescava lo scheletro nascosto di Storybook** (`.sb-argstableBlock` dentro `.sb-preparing-docs`), non la story: la cella di tabella misurava **1.17:1 in scuro** su un componente che ne fa 15.72. È **la stessa trappola di M2.3**, che aveva già colpito con `querySelector('button')`, e ci sono ricascato in una forma diversa. Rimedio: ogni selettore di misura va scopato a `#storybook-root`.
3. **Il compositore di colori, di nuovo.** Dipingevo il nero sul canvas prima del colore, quindi ogni fondo trasparente tornava opaco e la catena si componeva sul nero: quattordici numeri tutti sbagliati, e tutti *plausibili* — `text-muted-foreground` a 3.85 invece di 5.05. Se ne è accorto solo il confronto con axe, che sulle stesse story non segnalava nulla. **Quarta sessione di fila in cui lo strumento accusa il componente**, e la regola operativa è quella: quando la mia misura e axe non concordano, il sospettato è la mia misura.

### Prossimi passi

**M2.5 — Navigazione**: `sidebar`, `breadcrumb`, `pagination`. Da chiudere lì l'unica vera eccezione allo scaling di M1.4 — le tre larghezze della sidebar sono costanti JS — e il rimedio è già noto: si sovrascrivono via `style` sul `SidebarProvider`, senza patchare il componente.

Per **M2.9**, tre cose che questo task aggiunge al fascicolo: i tre bersagli sotto 44px qui sopra; il fatto che `check:contrast` **non vede l'opacità** applicata a un testo, quindi il gate dei token non sostituisce axe; e il server statico da usare per la scansione.

### Coda della stessa giornata — «cambiando scheda si sposta l'interfaccia»

Segnalazione di Francesco su `Primitive/Tabs`. Riprodotta e misurata subito: passando **Dati → Allegati → Revisioni** la radice della story faceva **452 → 421 → 341px** e la lista di schede slittava di **55px** a ogni clic.

**Non è il componente, ed è una trappola d'uso che vale per le app.** Il canvas di Storybook è `body.sb-main-centered` con `align-items: center`, quindi `#storybook-root` è un flex item **a larghezza indefinita**: si stringe sul contenuto. Il pannello attivo è l'unico figlio che porta testo, perciò è **la lunghezza del testo del pannello** a decidere la larghezza del gruppo — e cambiando scheda cambia il testo.

**La parte che conta, e che non era ovvia: `w-full` non lo cura.** Le mie story avevano `w-full max-w-lg`, che sembra una larghezza e non lo è: su un contenitore indefinito `w-full` è **circolare** e non fa nulla. Misurato: risolveva a 277px, cioè alla larghezza del testo. Serve una larghezza **definita** — `w-96`, che sta sulla scala di `--spacing` e quindi segue la densità.

**Cercata la stessa causa altrove, e c'era.** `accordion` ce l'aveva **peggiore**: aprire la prima sezione portava la radice da **201 a 576px**, cioè **188px** di slittamento, perché il testo del pannello è molto più lungo dell'intestazione. `collapsible` e `carousel` erano già a posto (`w-96` e `w-80`, definite).

**Dopo la correzione, misurato su tutte le videate**: cinque story di `tabs` e quattro di `accordion`, commutando ogni scheda e aprendo ogni sezione — **slittamento 0px, variazione di larghezza 0px** ovunque. `npm run check` verde, axe di nuovo **338 scansioni / 12 violazioni**, cioè le sole note di M2.3.

Documentata in testa a entrambe le story, perché è un requisito d'uso e non un dettaglio delle story: in un'app il caso non si presenta finché le schede stanno in una colonna di pagina che una larghezza ce l'ha, e si presenta il giorno in cui qualcuno le mette in un flex item o in una cella di griglia `auto`.

**Un errore di strumento di contorno, utile a chi misurerà in M2.9**: le classi Tailwind iniettate da JavaScript per una prova **non esistono** se non compaiono nel sorgente — il JIT genera solo quelle che trova. `w-120` e `w-128` risolvevano a `0px`, e non perché la scala non le preveda.

### Coda della stessa giornata — «il drawer con agganci non mostra tutti i campi»

Due segnalazioni di Francesco su `Primitive/Drawer`, e solo la seconda era un difetto del componente.

**La prima, di padding, era mia e delle story.** Il bottone «Applica» risultava attaccato al campo. `DrawerHeader` è `p-4 pb-0` e `DrawerFooter` è `p-4 pt-0`: tolgono di proposito il padding sul lato interno e **contano sul corpo in mezzo per portarsi il proprio**. Le quattro story davano al corpo solo `px-4`, e una sola (`ConAgganci`) aggiungeva `pb-4` — quindi erano anche incoerenti fra loro. Corretto a `p-4` su tutte e quattro. I due bottoni a piena larghezza impilati **non** sono un difetto: è `flex-col gap-2` del `DrawerFooter` di shadcn, invariato, ed è la forma giusta per il mattone mobile del `responsive-dialog` di M3.4.

**La seconda era del componente, e si è chiusa senza divergere.** Con `snapPoints` il popup è alto quanto l'aggancio **massimo** e viene **traslato giù** di `--drawer-snap-point-offset`: la parte sotto la piega finisce fuori dallo schermo, e `overflow-y-auto` sul contenuto non ha niente da scorrere perché **non c'è overflow** — il contenitore ci sta comodo dentro l'altezza piena del popup. Unica via per leggere il resto: trascinare. Misurato in Storybook, viewport 720: popup da 432 a 1056, `--drawer-snap-point-offset` 336px, `padding-bottom` **0px**, sul contenuto `scrollHeight === clientHeight` (264 = 264), ultima voce a **765px**, cioè 45px sotto il bordo.

La doc di Base UI compensa nel proprio esempio con un `padding-bottom` pari all'offset sul popup; **shadcn `base-nova` non lo fa**, e il nostro `DrawerContent` era identico all'upstream.

**Provata la toppa nel componente, poi ritirata — decisione di Francesco, 2026-09-09.** Avevo aggiunto al popup `data-[swipe-axis=y]:data-snap-points:[padding-bottom:max(0px,calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))]`, e funzionava: `padding-bottom` 336px, `scrollHeight 264 > clientHeight 219`, contenuto scorrevole dentro l'aggancio. **Ritirata lo stesso**, e la ragione vale più del rimedio: formalmente era gradino 2 — una stringa di classi, forma intatta, gate verde — ma il gradino 2 esiste per l'**aspetto**, e quella classe cambiava un **comportamento**. Un ri-stile che passa il gate non è per ciò stesso dentro la regola: il gate misura la forma, non l'intenzione. E l'avevo applicata **decidendo io**, informando dopo, che è esattamente ciò che 4bis vieta.

`registry/tassullo/ui/drawer.tsx` è quindi **identico all'upstream** (verificato col diff su `DrawerContent`). Il limite sta scritto in testa alla story `ConAgganci`, con le misure: **gli agganci vogliono contenuto corto**. La story è stata rifatta di conseguenza — due revisioni invece di quattro. Verificato che ci stia in **entrambe** le densità: aggancio d'apertura 288px, ultima voce a **195px** in normale e **246px** in touch. Per un elenco lungo si usa il drawer **senza** agganci, che si apre all'altezza del contenuto e scorre.

**Se un giorno servisse davvero**, la strada non è patchare il componente di nascosto: è il gradino 4 — proposta esplicita, riga in `registry/componenti-propri.json`, approvazione. Oppure aspettare che shadcn copra il caso.

**Errore d'ambiente, il solito**: nel pannello del browser `document.visibilityState` è `hidden` e `requestAnimationFrame` **non scatta** — verificato di nuovo esplicitamente — quindi l'animazione d'ingresso del drawer si ferma a metà e la geometria del popup letta lì non vale. Le misure sopra sono di **stile calcolato** (`padding-bottom`, `scrollHeight`/`clientHeight`), che non dipendono dall'animazione. Una controprova visiva vuole un browser vero, come in M2.3.

---

## M2.5 — Navigazione: `sidebar`, `breadcrumb`, `pagination`

**2026-09-09.** Tre primitive, un hook (`use-mobile`), **48 item**, `registry validate` verde. Tutte e tre esistono in shadcn e la scala 4bis si ferma al **gradino 1** sulla forma: nessuna divergenza strutturale, un solo ri-stile di stringa, e la lingua.

### La sidebar antracite era già lì, e non era scontato

Il preset dipinge la sidebar con la famiglia `--sidebar-*`, che il tema Tassullo definisce antracite **in entrambe le modalità** (`#141414` chiaro, `#1C1C1C` scuro). Non c'è stato niente da ri-colorare: la sidebar del v1 non è una superficie che segue il tema, è *l'unica superficie scura* delle app, e il tema lo dichiarava già dalla M1.1.

**Anche lo stato attivo coincide alla lettera.** In `components.css` del v1 la regola è `.sidebar-item:hover, .sidebar-item.is-active { background: var(--color-sidebar-hover); color: var(--color-sidebar-text-hi) }`, cioè esattamente `data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground` del preset, sugli stessi due colori. shadcn ci aggiunge `data-active:font-medium`, che il v1 non aveva perché dava peso 500 a *tutte* le voci: è un guadagno, perché nel v1 attivo e hover erano indistinguibili. Il criterio «resa identica alla sidebar antracite delle app esistenti» si chiude senza toccare niente.

### Il ri-stile: uno solo, ed è ancora l'opacità

`SidebarGroupLabel` usa `text-sidebar-foreground/70`. Il token pieno sul fondo della sidebar fa **7.75:1**; al 70% fa **4.41 in chiaro e 4.21 in scuro**, sotto soglia in entrambe. È la **seconda volta** — la prima erano gli alert di M2.4 — che l'opacità su un testo apre un difetto che `check:contrast` non può vedere per costruzione: il gate verifica le *coppie di token*, e nessun token dichiara con quanta opacità un componente lo usa. Tolto il `/70`: la gerarchia fra etichetta e voce la fanno già `text-xs` contro `text-sm` e il peso, che non costano contrasto.

Vale la pena scriverlo come regola, perché due volte su due sessioni non è coincidenza: **un'opacità su un testo va misurata, sempre**, e non basta che la coppia di token sia verde.

### La lingua

Undici stringhe, e quasi tutte le sente **solo chi usa uno screen reader**: «Toggle Sidebar» ×3, il titolo e la descrizione del pannello mobile, `aria-label="breadcrumb"`, «More», `aria-label="pagination"`, «Go to previous/next page», «More pages». Le sole visibili sono i due testi di `PaginationPrevious`/`Next` — ora «Precedente» e «Successiva», e restano `prop` con quel default. Il gate non se ne accorge, ed è giusto: confronta la forma azzerando il contenuto delle stringhe, quindi tradurre resta dentro il gradino 2 (stessa cosa fatta al `carousel` in M2.4).

### La densità: chiusa l'unica eccezione di M1.4

M1.4 aveva accertato che la sidebar è la sola cosa che la densità touch non scala, perché `SIDEBAR_WIDTH` (`16rem`), `SIDEBAR_WIDTH_ICON` (`3rem`) e `SIDEBAR_WIDTH_MOBILE` (`18rem`) sono costanti JavaScript passate come `style` inline.

**Misurato il difetto prima di rimediarlo**, togliendo l'override dal wrapper a pagina viva:

| in touch | senza rimedio | col rimedio |
|---|---|---|
| colonna aperta | **256px** | 384px |
| voce di menu | 48px in 231 di colonna | 48 in 359 |
| rail collassato | **48px** | 72px |
| voce nel rail | **48px** — riempie il rail a filo | 48 in 72 |

Cioè esattamente quello che M1.4 aveva previsto: il rail da 48 riempito da un bottone da 48, **zero margine attorno all'icona**.

Il rimedio non patcha il componente: `SidebarProvider` accetta uno `style` che sovrascrive le due variabili, e lì si esprimono in unità di `--spacing` conservando i valori di densità normale — `calc(var(--spacing) * 64)` fa 256 e 384, `calc(var(--spacing) * 12)` fa 48 e 72. Resta dentro il gradino 2.

**La terza costante non è sovrascrivibile, e va saputo.** `SIDEBAR_WIDTH_MOBILE` è scritta *dentro* `Sidebar`, sullo `style` dello `SheetContent`, dove non arrivano né `style` né `className` del chiamante: `{...props}` va sullo `Sheet`, e `className` in quel ramo non è usato affatto. Da fuori non c'è modo. Non è un problema — misurati **281px** su un telefono da 375, già più larghi dei 256 della scrivania — ma è una libertà che il componente non concede, e il criterio del piano «`--sidebar-width-mobile` tarato sui token» va letto così: **non è tarabile**, e il valore ereditato è adeguato. Chi scrive M3.1 non deve perderci una mezz'ora.

### Il passaggio a `Sheet`, in un browser vero

| prova (375×812) | esito |
|---|---|
| la colonna fissa | **fuori dal DOM**, non nascosta |
| clic sul grilletto | `Sheet` da 281px |
| 8 `Tab` | 8 su 8 **dentro** il pannello |
| `Esc` | chiude |
| il fuoco | torna al grilletto |

### Tre requisiti d'uso, tutti risolti in composizione e tutti da portare a M3.1

Sono la parte che vale più del codice, perché nessuno dei tre dà errore.

1. **Senza `TooltipProvider` la sidebar chiusa è muta.** A rail le voci sono sole icone e l'etichetta torna come tooltip; senza un provider che avvolge l'albero il tooltip **non compare né col fuoco né col mouse**, e non c'è nessun errore. Misurato: zero tooltip su tre `Tab` e su un hover da nove decimi. Col provider: «Anagrafe» sulla testata, «Cruscotto» sulla voce. Stessa famiglia del `select` che vuole `items` (M2.2) e del `DropdownMenuLabel` che vuole un `Group` (M2.3). Il provider sta **una volta sola**, alla radice dell'app.

2. **Nascondere l'etichetta per il rail toglie anche il nome accessibile.** Il testo della testata non sparisce da sé: il bottone collassato è 32px con `overflow-hidden`, ma il testo comincia dopo l'icona da 16 e il divario da 8, quindi gli restano **8px dentro il riquadro** — nel rail si vedeva una «A» accanto alla T, e non lo curano né `truncate` né `flex-1`. Serve `group-data-[collapsible=icon]:hidden`. Fatto questo, però, **axe ha segnalato `button-name`** in entrambe le modalità: il bottone resta con dentro un solo SVG. Il tooltip **non è un nome accessibile**. Aggiunto `aria-label` a testata e piede — il piede non era stato segnalato solo perché l'avatar porta le iniziali, e «FS» come nome di un bottone è peggio di niente.

3. **Sul telefono il primo `Esc` non chiude niente.** Misurato: aperto lo `Sheet`, il fuoco va su un `SidebarMenuButton` e il primo `Esc` non fa nulla, il secondo chiude; togliendo il fuoco, un `Esc` solo basta. La causa è il `tooltip` del bottone: sotto la soglia mobile il preset non lo *mostra* (`hidden={state !== "collapsed" || isMobile}`) ma **la radice Base UI resta montata**, si apre col fuoco e si prende il primo `Esc`, invisibile. Su un telefono è il tasto che sembra rotto. È comportamento, non stringhe: non si ri-stila. Ma il rimedio sta nella composizione e usa l'API pubblica del componente — `useSidebar().isMobile`, e il `tooltip` non si passa affatto quando non servirebbe. Verificato: `Esc 1: chiuso`. **Da portare in `tassullo-app-shell`: `sidebar-07` di shadcn passa il tooltip sempre**, quindi chi copia il blocco a occhi chiusi si porta dietro il difetto.

### La composizione, su indicazione di Francesco

Impianto del blocco **`sidebar-07`** di shadcn — «a sidebar that collapses to icons» — coi menu annidati del suo `nav-main` (un `Collapsible` che *rende* il `SidebarMenuItem`, un `CollapsibleTrigger` che rende il `SidebarMenuButton`), più i due estremi della sidebar che Anagrafe ha già in produzione: **marchio e nome dell'applicativo in cima**, con la sola T nel rail, e **utente in fondo** con avatar, indirizzo, ruolo e menu delle opzioni (profilo, impostazioni, uscita), con il solo avatar nel rail.

**Il marchio nelle story è un segnaposto in `currentColor`, e va deciso.** Il logo Tassullo è un file del brand, non una classe: il wordmark ufficiale del sito è un `<path>` unico con `fill="#141414"` — che, per inciso, è **esattamente** il nostro token `--sidebar`, conferma indipendente che la palette è giusta — e la T da sola non se ne estrae senza tagliare a mano i dati vettoriali. Distribuirlo è una **voce nuova del registry** (`tema-logo`, accanto a `tema` e `tema-font`) e non si improvvisa dentro una story: **proposta a Francesco, in attesa**. La geometria del segnaposto è quella del marchio in uso, e il file vero lo sostituisce senza toccare la composizione.

### Contrasto, a pagina ferma

| coppia | chiaro | scuro |
|---|---|---|
| sidebar — voce a riposo | 7.75 | 7.17 |
| sidebar — voce attiva | 12.91 | 11.58 |
| sidebar — etichetta di gruppo | **7.75** (era 4.41) | **7.17** (era 4.21) |
| sidebar — nome dell'applicativo | 15.72 | 14.54 |
| sidebar — iniziali sull'avatar | 9.49 | 9.49 |
| sidebar — sottolivello attivo | 12.91 | 11.58 |
| breadcrumb — livello link | 5.05 | 7.75 |
| breadcrumb — pagina corrente | 17.03 | 15.72 |
| pagination — numero | 17.03 | 15.72 |
| pagination — pagina corrente | 17.03 | 14.56 |

### Bersagli in touch

Tutti i bersagli nuovi stanno sopra i 44px: voce di menu **48**, testata e utente **72**, numero di pagina **48**, «Precedente»/«Successiva» **48**, ellissi di paginazione **48**. Due note:

- **l'ellissi del breadcrumb è 20px, cioè 30 in touch, e non è un bersaglio.** Non è un difetto del componente: `BreadcrumbEllipsis` è `aria-hidden` e da sola è muta, quindi va comunque dentro un grilletto vero — nella story un `dropdown-menu` — e il grilletto ha una taglia propria, `size-8`, che fa 32 e 48. La regola è che l'ellissi **non si usa nuda**.
- il sottolivello resta **42px** in touch (`h-7` del preset). Sotto di due pixel, stessa famiglia dei tre bersagli aperti da M2.4 — **in carico a M2.9**.

### axe: 358 scansioni, 0 violazioni — ma leggere l'avvertenza

**179 story × 2 modalità, 0 errori di strumento, 0 violazioni.** Il primo giro ne aveva una — il `button-name` del punto 2 qui sopra, in entrambe le modalità.

**Il numero non è confrontabile con le 12 di M2.4, e va detto forte**: questa scansione **non apre i popup**, quindi i dodici guardiani del fuoco di Base UI su `dropdown-menu` e `select` non compaiono. Controprova fatta apposta: aprendo a mano i quattro menu di `dropdown-menu`, `aria-hidden-focus × 6` per story è ancora lì, immutato. **Le 12 restano aperte e in carico a M2.9.** È la stessa avvertenza che M2.3 aveva già scritto, e questa sessione la conferma dal lato opposto: un popup non aperto non è un popup senza violazioni.

Aperti invece i popup *nuovi* — il menu utente della sidebar (aperta e collassata) e l'ellissi del breadcrumb, sei scansioni — **nessuna `aria-hidden-focus`**, e le sole segnalazioni sono `region` / `landmark-one-main` / `page-has-heading-one`, che compaiono perché quella scansione guarda il **documento intero** invece che `#storybook-root`: la controprova sulle story di `dropdown-menu` mostra le stesse tre righe accanto alle violazioni vere. Sono regole di *pagina*, non di componente. Una però va raccolta da M3.1: nell'app shell il contenuto della sidebar dovrebbe stare in un landmark `<nav>` — `Sidebar` rende un `div`.

### Verifiche

- `npm run check` (contrasto 48/48, registry 0 errori, font allineato), `registry validate` (**48 item**), `tsc -b`, `oxlint`, `build`, `build-storybook`: **verdi**.
- `oxlint`: 3 avvisi, tutti `set-state-in-effect` — due sul `carousel` (già noti, presenti identici in `.upstream/`) e uno su `use-mobile.ts`, che è codice shadcn non toccato.
- Il gate legge **11 componenti ri-stilati**, e il conto **non sale a 12 nonostante il ri-stile della sidebar**: `sidebar.tsx` esce dall'originale col segnaposto d'icona (`◌`), e per quel ramo lo script dichiara già a verbale che «il conto del ri-stile non è affidabile» (`check-registry.ts`, riga 339). Non è una regressione, ma è il terzo file in quello stato: quando saranno molti, il numero di prima pagina dirà sempre meno.

### Errori di strumento, di nuovo la metà del lavoro

Tutti e tre già noti, e ci sono ricascato lo stesso.

1. **I tasti non arrivano alla pagina finché non ci si clicca dentro davvero** (M2.3). Il primo giro sullo `Sheet` dava «`Esc` NON chiude» e «`Tab` esce dal pannello»: era l'imbracatura senza clic. Con un `mouse.click` prima, 8 `Tab` su 8 restano dentro e l'`Esc` chiude. **Ho accusato il componente prima dello strumento**, che è la quarta volta di fila.
2. **Il selettore che pesca l'elemento sbagliato** (M2.3, M2.4). Dopo aver rifatto la composizione, `[data-slot="sidebar-menu-button"]` non era più la voce di menu ma la **testata**, che è `size="lg"`: la voce risultava alta 48px in densità normale invece di 32. E `[data-active]` non trovava più niente, perché la voce attiva è ora un `CollapsibleTrigger` che si prende lo `slot`. Regola: dopo aver cambiato la composizione, **i selettori di misura si rileggono**, non si riusano.
3. **`w-full` e i selettori a parte, le story cambiate spezzano gli script**: `primitive-sidebar--sotto-livelli` non esiste più e due script sono morti in timeout su `#storybook-root`. Banale, ma è un minuto perso ogni volta.

### Prossimi passi

**M2.6 — Filtri e selezione**: `toggle`, `toggle-group`, `combobox`, `multi-select`/`tag-input`.

Nel fascicolo di **M3.1** (`tassullo-app-shell`): l'override delle due larghezze, il `TooltipProvider` alla radice, gli `aria-label` su testata e piede, il `tooltip` da non passare su mobile, il landmark `<nav>`, e il fatto che `SIDEBAR_WIDTH_MOBILE` non si tocca.

Per **M2.9**: il sottolivello a 42px in touch; la conferma che la scansione a popup chiusi vale zero sui popup; e la seconda prova che `check:contrast` non vede l'opacità.

**In attesa di decisione di Francesco**: l'item `tema-logo` per il marchio Tassullo.

### Coda della stessa giornata — quattro rilievi di Francesco sulle story della sidebar

Tutti e quattro guardando la style guide, e tutti e quattro veri. Nessuno tocca i componenti: stanno nella composizione, che è esattamente il posto dove M3.1 li erediterà.

1. **«Cosa è questa barra grigia rimasta?»** — il filo verticale nella testata di pagina. Misurato: **1×16px a y=0** in una testata da 48, cioè incollato al bordo superiore invece che centrato. La causa è che `Separator` porta `data-vertical:self-stretch`, che **vince sull'`items-center` del contenitore**: dandogli `h-4` si accorcia il filo ma non si sposta l'allineamento, e resta una barretta appoggiata in alto. Si rimette con `data-vertical:h-4 data-vertical:self-auto` — che è **la forma che shadcn stesso usa** nel blocco `sidebar-07`, e ora si capisce perché. Ora è a y=16, centrato. Documentato in `Primitive/Separator`, perché la trappola è del separatore e non della sidebar: nella story `Verticale` non si vedeva, perché lì la riga è `h-6` e il filo la riempie tutta — **il difetto compare solo quando la riga è più alta del filo**.

2. **«Il logo è piccolo e non centrato con le icone sottostanti a sidebar chiusa.»** Misurato nel rail da 48: tutti i bottoni centrati a 24, ma il marchio dentro centrato a **18**, cioè **6px fuori asse**. La causa è che i bottoni `size="lg"` — testata e utente — portano `group-data-[collapsible=icon]:p-0!`, che annulla il `p-2!` della base: il contenuto resta appoggiato a sinistra. Aggiunto `group-data-[collapsible=icon]:justify-center` su entrambi, e il marchio da `size-5` a `size-6`. Ora centro **24.0**, come le icone delle voci. Vale per qualunque `size="lg"` nella sidebar, quindi va nel fascicolo di M3.1.

3. **Raggruppamento per sezione** (indicazione di Francesco su `sidebar-07`, dove le sezioni sono *Platform* e *Projects*). La navigazione è ora scritta come **elenco di sezioni**, ciascuna con la sua `SidebarGroup` e `SidebarGroupLabel`, ciascuna con le sue voci: `Anagrafe` (Cruscotto, Prodotti, Documenti) e `Gestione` (Cantieri, Utenti). Due libertà che restano **all'app** e non al design system: se raggruppare (una sezione sola e il raggruppamento sparisce da sé) e quali voci hanno un sottomenu (basta passare `figli`, o non passarli — `Prodotti` e `Documenti` sì, `Cruscotto` no).

   Verificato cosa succede nel rail, perché la prima stesura della nota era **troppo severa**: spariscono i *nomi* delle sezioni, non le sezioni. Il preset spegne le etichette (`-mt-8` e `opacity-0`) ma il `p-2` di ogni gruppo resta, quindi lo stacco fra i due gruppi si vede ancora. Corretto a verbale.

4. **«Il breadcrumb sopra non dovrebbe essere Prodotti > Famiglie?»** — sì, e nella testata c'era uno `<span>` semplice invece del componente. Sostituito col `Breadcrumb` vero, `Prodotti › Famiglie`, che ora rispecchia la voce attiva nel menu. Occasione buona: le due primitive di questo task si vedono finalmente lavorare insieme. **Il percorso resta un dato**, calcolato dalla rotta nell'app; il design system dà la forma, e la testata come elemento a sé — titolo, breadcrumb, slot azioni — è `page-header` (M3.2).

Rifatte tutte le verifiche dopo le quattro modifiche: `npm run check`, `tsc -b`, `oxlint` (3 avvisi, gli stessi ereditati), `build`, `build-storybook` verdi; **axe 358 scansioni, 0 violazioni**; `Esc` sul telefono chiude ancora al primo colpo.

### Aperta **D13** — il marchio Tassullo come item del registry

Deciso il **2026-09-09**, in coda a M2.5. La sidebar vuole il marchio in testata, e nel rail la sola **T**: l'ho composta, ma quello che c'è nelle story è un **segnaposto disegnato in `currentColor`**, non l'asset.

Non è pigrizia, è la regola permanente applicata a una classe di artefatti nuova. Il logo è un file del brand, non una stringa di classi: se ogni app se lo porta dietro per conto suo, la deriva comincia esattamente lì. Distribuirlo vuol dire farne una **voce del registry** — `tema-logo`, accanto a `tema` e `tema-font` — e quella si decide, non si improvvisa dentro una story.

Perché il segnaposto e non il file vero: il wordmark del sito è un `<path>` unico con `fill="#141414"` — che è **esattamente** il nostro token `--sidebar`, conferma indipendente che la palette è tarata bene — e la **T da sola non se ne estrae**, perché i sottotracciati sono relativi e ritagliarli vorrebbe dire riscrivere a mano i dati vettoriali.

**Francesco fa mandare a Roberto la T bianca su fondo trasparente.** Scadenza: **entro la fine della FASE 2**, cioè non oltre M2.9. Da chiudere insieme all'asset: in che formato viaggia nel registry (l'esperienza di `tema-font` dice che `shadcn build` legge i file come testo, quindi un binario va in data URI o non ci va), e se serve anche il marchio esteso accanto alla sola T.

Fino ad allora il segnaposto resta, ed è marcato come tale nella story: rispetta la regola 3 (niente hex nei `fill`, tutto `currentColor`) e **va sostituito, non dimenticato**.

**Nota su D13, aggiunta in giornata.** Francesco, confrontando il segnaposto con la sidebar di Anagrafe: «la T è schiacciata, la gamba è più corta». Vero, e le proporzioni erano state messe a occhio. Ricavate quelle giuste **misurando il logo ufficiale** invece di stimarle: il wordmark rasterizzato a 254px d'altezza, contando i pixel anneriti riga per riga (il primo glifo di «TASSULLO» è la T, quindi basta ritagliare il `viewBox` sui primi 15,7 dei 136,418 di larghezza — e il frammento della «A» che entra nel ritaglio si esclude prendendo, alla riga di misura, la sola corsa contigua che contiene il centro).

| parte | quota dell'altezza |
|---|---|
| barra superiore | 12,6% |
| stacco | 10,2% |
| traversa | 13,0% |
| **gamba** | **63,0%**, larga il 23,6% della larghezza |
| larghezza / altezza | **0,618** |

Il segnaposto era 16×18, cioè rapporto **0,89**, con la gamba al 55%: sbagliava soprattutto la proporzione d'insieme — il marchio vero è **più alto che largo**. Rifatto su `viewBox="0 0 16 26"`, non quadrato apposta, così con `size-*` si allinea all'altezza e resta stretto.

Resta un segnaposto e D13 resta aperta: serve l'asset di Roberto. Ma un segnaposto con le proporzioni giuste non insegna una forma sbagliata a chi guarda la style guide nel frattempo.

**D13, seconda nota della stessa giornata: l'asset c'era già.** Segnalazione di Roberto via Francesco — Anagrafe ha il marchio in produzione da tempo, `frontend/public/tassullo-t.svg`. Un `path` solo con due sottotracciati (asta più traversa, e la barra sopra), `viewBox` 24×38, `fill-rule="evenodd"`, `fill="#FFF"`. Nella stessa cartella c'è anche `favicon.svg`, che dichiara nel proprio commento di ricopiare quel tracciato dentro un quadrato antracite.

**Il rapporto del file ufficiale è 24/38 = 0,632**, contro lo **0,618** che avevo ricavato rasterizzando il wordmark del sito: la misura era buona all'1,4%, e conferma che la diagnosi di Francesco («schiacciata») era esatta e che il segnaposto rifatto andava nella direzione giusta. Ora però il segnaposto non serve più: le story usano il **tracciato vero**.

L'unica modifica al file è il colore, `#FFF` → `currentColor`, perché la regola 3 non ammette hex nemmeno dentro un SVG. Non è formalismo: un bianco cotto nel tracciato sparirebbe su fondo chiaro, mentre `currentColor` fa seguire al marchio il testo che lo circonda.

**D13 resta aperta, ed è giusto così.** Il tracciato oggi è incollato dentro `sidebar.stories.tsx`: va bene per la style guide, sarebbe la deriva se ogni app se lo ricopiasse — cioè esattamente ciò che la regola permanente esiste per impedire. Manca la parte che conta, la voce del registry, e ha un nodo che non decido da solo: la forma comoda è un componente (`<MarchioT className="size-6" />`), ma un componente **nostro**, senza originale shadcn, è gradino 4 e vuole una riga in `registry/componenti-propri.json` — file oggi vuoto, e `CLAUDE.md` chiama quella condizione «da difendere». Un marchio di brand non è una primitiva UI e non lo sarà mai in shadcn, quindi il caso è probabilmente legittimo; ma è precisamente il tipo di eccezione che la regola vuole che si chieda invece di prendersi.

## 2026-09-09 — M2.6 Filtri e selezione: `toggle`, `toggle-group`, `combobox`

Tre primitive, **51 item**, `registry validate` verde. Il piano ne prevedeva quattro; ne sono bastate tre, e la ragione è la parte migliore della sessione.

### Il piano chiedeva quattro componenti, shadcn ne ha già tre

`PIANO.md` elenca `toggle`, `toggle-group`, `combobox` e `multi-select`/`tag-input`, e per il combobox dice «shadcn lo compone da `command` + `popover`». **Non è più vero**, ed era la prima cosa da chiedere all'MCP invece di presumerla: `combobox` oggi è un item suo (`registry:ui`), costruito su `Combobox` di Base UI, con `Chips`, `Chip`, `ChipRemove` e `ChipsInput` nella stessa scatola. Cioè: **il multi-select e il tag-input sono lo stesso componente con `multiple`**, e la quarta voce del piano si chiude senza scrivere niente.

Scala 4bis: **gradino 1 sul combobox** — il default shadcn così com'è, zero stringhe toccate — e **gradino 2 su toggle e toggle-group**. `registry/componenti-propri.json` resta vuoto, che è la condizione da difendere.

### I due ri-stili, ed è la terza volta della stessa famiglia

`toggle`, taglia `sm`: `rounded-[min(var(--radius-md),12px)] text-[0.8rem]` → `rounded-md text-sm`. `toggle-group`: `data-[size=sm]:rounded-[min(var(--radius-md),10px)]` → `rounded-md`. Identica alla correzione fatta al `button` in M2.1 e al `select` in M2.2, e per la stessa ragione: **un valore arbitrario non segue la densità**. Misurato dopo: i tre corpi del `toggle` fanno **12px in normale e 13px in touch** su tutte e tre le taglie, mentre prima `sm` restava inchiodato a 12.8px. Le altezze: **28 / 32 / 36 → 42 / 48 / 54**.

Il gate passa da 11 a **13 componenti ri-stilati sopra una forma shadcn intatta**, e gli avvisi da 51 a **48**: i tre valori arbitrari tolti sono esattamente quelli.

### Il criterio di accettazione, verificato in un browser vero

Storybook costruito, servito in HTTP, Chromium di Playwright dalla cartella temporanea — **senza aggiungere Playwright al repo**, come in M2.3 e M2.5. Il pannello del browser resta inutilizzabile per i popup: `document.visibilityState` è ancora `hidden`, quindi `requestAnimationFrame` non scatta e Base UI non sposta il fuoco. Verificato di nuovo, non dato per buono.

- **Combobox, 500 voci.** `Tab` porta sul campo; scritto `412`, restano **2 voci su 500**; con `autoHighlight` la prima è già evidenziata, `Invio` la sceglie (`EN 412-9 — Requisito 216` finisce nel campo) e il riquadro si chiude. `↓` riapre, `Esc` chiude senza cambiare e **il fuoco resta sul campo**. Scritto `zzzz`, compare il messaggio di elenco vuoto.
- **Più scelte, `Backspace`.** Due pillole di partenza: `Backspace` a campo vuoto → **1**, ancora → **0**. Riaggiunta da tastiera scrivendo `deum` + `Invio` → **1**, etichetta `Intonaci deumidificanti`. Nessuna riga di codice nostro: è Base UI.
- **`toggle-group` da tastiera.** `Tab` entra **una volta sola** e si ferma su `Pubblicati`; `→` porta su `Bozze`, `Spazio` lo accende (accesi: `Pubblicati`, `Bozze`), `Tab` **esce dal gruppo**. A scelta singola, commutando il secondo resta acceso solo quello.

Il terzo criterio — «i filtri si distinguono a colpo d'occhio dai badge» — ha una story sua, `Filtri contro badge`, con gli stessi tre contenuti nelle due forme. Si distinguono: i filtri hanno bordo, raggio dei controlli e uno è acceso; i badge sono pieni, senza contorno, e stanno appoggiati al contenuto.

### Densità

| | normale | touch |
|---|---|---|
| voce di `toggle-group` | 32 | **48** |
| `toggle` sm / default / lg | 28 / 32 / 36 | 42 / 48 / **54** |
| campo del combobox | 32 | **48** |
| contenitore delle pillole | 32 | **48** |
| pillola | 21 | 32 |
| **voce del riquadro combobox** | — | **31** |

L'ultima riga è un rilievo nuovo, e va a M2.9: **31px è il bersaglio più piccolo di tutto il set in densità touch**, sotto i 36 della voce di menu già segnalata da M2.3 e ben sotto i 44 del criterio di M2.9. Stessa famiglia e stesso rimedio (`py-1` → `py-2`), stessa natura di scelta di sistema: alza tutti i menu anche da scrivania.

### Il difetto del preset che si vede solo a popup chiuso

`ComboboxInput` monta da sé, in coda al campo, il bottone a chevron che apre l'elenco. Quel bottone porta **solo l'icona e nessun `aria-label`**: axe lo segna `button-name`, gravità **critical**. Non è nostro — la pagina d'esempio di shadcn ha lo stesso difetto. Stessa cosa per la crocetta di ogni pillola (`ComboboxChipRemove`).

Nel corso della sessione l'avevo chiuso in composizione, con un componente `Grilletto` nelle story: `showTrigger={false}` e il grilletto rimesso come figlio, dove l'`aria-label` arriva davvero sul bottone. **Disfatto a fine giornata su decisione di Francesco** — vedi la coda. Misurato prima di toglierlo, e vale la pena averlo a verbale: il bottone composto è **identico al pixel** a quello di serie (24×24, fondo trasparente, stessa icona), e l'unica differenza è l'attributo invisibile. Non era un cambio d'aspetto.

**E qui la lezione di strumento, che resta anche senza il rimedio.** Alla prima scansione la violazione compariva su **una story sola**, quella disabilitata. Non perché le altre fossero sane: l'imbracatura, per misurare i popup, *apriva il combobox* — e a popup aperto Base UI rende il grilletto inerte, quindi axe lo salta. È il **rovescio esatto** dell'avvertenza di M2.3: lì un popup non aperto nascondeva le violazioni del popup, qui un popup aperto nasconde quelle del campo. La scansione di questa sessione misura perciò **tutti e due gli stati**, ed è così che dev'essere scritta in M2.9, o metà del set non viene guardato.

### axe: 420 scansioni, 24 violazioni, 32 incomplete

420 = 210 stati (197 story, 13 delle quali misurate anche a popup aperto) × 2 modalità. A pagina ferma, 250 ms dopo il cambio di modalità.

- **16 `button-name`, gravità critical**: il chevron del campo e le crocette delle pillole, come sopra. **Accettate**, vedi coda e **D14**.
- **8 `aria-hidden-focus`** su combobox aperto (`Predefinito`, `Cinquecento voci`, `Con gruppi`, `In un campo`, in entrambe le modalità): sono i **guardiani del fuoco di Base UI**, la stessa famiglia delle 12 di M2.3, generati dalla libreria e assenti da ogni stringa di classi. **Il conto in carico a M2.9 sale da 12 a 20** — e le 24 di questa scansione non sono il totale del progetto (**36 note**): l'imbracatura di M2.6 apre i popup del `combobox` ma non quelli di `dropdown-menu` e `select`, quindi le 12 di M2.3 sono *presunte ancora aperte* e non rimisurate qui. Il rilievo 5 della CHECKLIST vale anche per chi l'ha scritto.
- **32 incomplete, tutte misurate a mano e tutte false.** 20 `color-contrast` col messaggio «overlapped by another element»: è il riquadro aperto che copre il testo di pagina dietro, e le voci del riquadro misurate a mano fanno **18.11:1**. 12 `aria-valid-attr-value`: axe dice di non poter verificare `aria-controls` in presenza di `aria-haspopup`; l'elemento riferito **esiste**, verificato con `getElementById`.

Nessuna violazione sulle 179 story preesistenti: il conto di M2.5 tiene.

### Il rilievo che non ho chiuso di iniziativa: **premuto e sorvolato sono lo stesso grigio**

Il preset scrive `hover:bg-muted` e `aria-pressed:bg-muted` — la stessa classe per due stati diversi. Misurato al byte, sui colori risolti dal motore di resa (canvas 1×1, come impone la nota di M2.1 sugli `oklch`):

| | fondo | bordo | testo |
|---|---|---|---|
| spento, sorvolato | 236,234,232 | 221,219,219 | 20,20,20 |
| **acceso** | **236,234,232** | **221,219,219** | **20,20,20** |

Identici. In scuro idem (38,38,38 in tutti e due). Lo stato acceso sta a **1.11:1 dalla pagina in chiaro e 1.22:1 in scuro**: passando il puntatore su una fila di filtri non si sa più quali erano accesi.

Non l'ho corretto perché è una **scelta di sistema**, come le costanti della sidebar: tocca `toggle`, `toggle-group` e chiunque li componga. Il rimedio è nella story `Spento, sorvolato, acceso`, scritto solo con token del tema — `primary-subtle` / `primary-border` / `accent-ink`, che è il chip arancione del v1 — e misurato: testo **4.57:1 in chiaro, 7.56:1 in scuro** sul proprio fondo. Si distingue per **tinta**, non per luminanza (il fondo sta a 1.04:1 dalla pagina), ed è esattamente perché funziona. **Non adottato**: vedi la coda.

### Aperta **D14** — la crocetta della pillola è un bottone senza nome

Le 4 violazioni `button-name` di sopra. La riga che le chiude è una: `aria-label` su `ComboboxPrimitive.ChipRemove` dentro `combobox.tsx`. Ma è **fuori dai gradini 1–3** della regola 4bis — non è una stringa di classi, è la forma del file — quindi `check:registry` andrebbe in rosso e la divergenza va decisa, non presa.

Le tre strade, e il costo di ciascuna:
1. **Diverge di una riga.** Chiude un difetto *critical* per tutte le app. Prezzo: la prima divergenza strutturale del progetto, su un file che al prossimo aggiornamento di shadcn va riletto a mano.
2. **Esporta `ComboboxChipRemove`** dal nostro file e lascia che ogni app componga la propria pillola. Sempre una divergenza di forma, e in più sposta dodici righe di boilerplate su ogni app: peggio.
3. **Non fa niente** e la porta a M2.9 insieme ai guardiani del fuoco, esentando la regola in CI. Prezzo: ogni multi-select spedito ha un bottone senza nome.

Non è la stessa cosa dei guardiani del fuoco, e la differenza conta: **quelli non si possono chiudere, questo sì**. Portata a Francesco, che ha scelto la strada 3. **D14 chiusa in giornata**, vedi la coda.

### Verifiche

`npm run check` verde (contrasto 0 sopra soglia, registry 0 errori / 48 avvisi / 13 ri-stilati, font allineato); `npx shadcn registry validate` verde su **51 item**; `tsc -b`, `npm run build`, `npm run build-storybook` verdi; `oxlint` 3 avvisi, gli stessi ereditati. `npm run registry:build` rilanciato, `public/r/` aggiornato con i tre item nuovi.

### Prossimi passi

**M2.7 — Date**: `calendar`, `date-picker`. È il punto in cui l'eccezione a Base UI (D9) è prevista, se il calendario risultasse debole su locale italiano e intervalli.

Per **M2.9**, il fascicolo cresce: i guardiani del fuoco salgono a **20**; la voce del riquadro combobox a **31px in touch** è il bersaglio più piccolo del set; la scansione deve misurare **popup aperto e chiuso**, perché ciascuno dei due nasconde le violazioni dell'altro; e il grigio unico di sorvolato/acceso sui filtri.

**In attesa di decisione di Francesco**: **D13** (l'item `tema-logo`). D14 è stata chiusa in giornata.

### Coda della stessa giornata — tre decisioni di Francesco, e un indirizzo che vale oltre M2.6

Tutte e tre vanno nella stessa direzione, e la direzione è più importante delle tre decisioni: **si usano i componenti shadcn standard, senza personalizzazioni.** Le personalizzazioni le chiederanno le app, e vanno **discusse e autorizzate prima**, perché deviano dal tema base e rischiano di corrompere gli aggiornamenti futuri. È la regola 4bis detta dalla parte di chi paga il conto.

**1. Chiusa D14 — la crocetta della pillola resta senza nome.** Strada 3 delle tre a verbale: non si diverge, si accetta. La motivazione è secca e va scritta perché regge anche le prossime volte: **le app Tassullo sono strumenti interni e i lettori di schermo non sono un requisito.** Se un domani una di queste app diventasse rivolta al pubblico, si riapre — gli obblighi (Legge Stanca, European Accessibility Act) colpiscono i servizi al pubblico e le grandi aziende, non gli strumenti interni.

Misurata prima di chiudere, perché la gravità nominale di axe non è la gravità vera: la crocetta ha **`tabindex="-1"`**, quindi il fuoco da tastiera **non ci passa mai** (percorso misurato: campo → fuori) e le pillole si tolgono con `Backspace`. Chi usa mouse o tastiera non incontra il difetto. Lo incontra solo chi esplora con un lettore di schermo.

**2. Disfatto il `Grilletto`.** Era la composizione che dava il nome al chevron del combobox: coerente, ma **dodici righe che ogni app avrebbe copiato per un attributo invisibile**. Tolta, le story tornano alla forma shadcn nuda, che è anche la più corta. Prima di toglierla ho costruito una story temporanea di confronto (poi rimossa) e misurato: bottone di serie e bottone composto **identici — 24×24, fondo trasparente, stessa icona** — con la sola differenza dell'`aria-label`. Serviva a chiarire che «togliere il Grilletto» **non** vuol dire togliere la freccia: quello sarebbe `showTrigger={false}`, e non è mai stato in discussione. Il malinteso era mio, per aver usato un nome (il nome shadcn del componente) senza mai mostrare la cosa.

Conseguenza sul conto axe: le violazioni salgono da 12 a **24** (16 `button-name` + 8 guardiani del fuoco). Sono accettate e scritte, non nascoste.

**3. Lo stato «acceso» dei filtri resta il grigio del preset.** L'arancio del brand si tiene **ai bottoni d'azione e alle cose importanti**: se tinge anche ogni filtro acceso, su una pagina di lista diventa il colore di sfondo e smette di segnalare. Si riprende in **FASE 4**, sulle pagine modello, dove si vedrà quanti filtri accesi stanno davvero su una barra vera.

Il confronto che ha portato alla decisione **resta a verbale** come story — `Primitive/ToggleGroup` → `Acceso: la scelta del grigio` — con tre barre da sette filtri: il preset, l'arancio pieno (`.chip.is-active` del v1) e l'arancio tenue (quello che il token `--color-accent-light` del v1 dichiara nel commento pur non essendo il colore spedito). Non è una proposta in attesa: è il verbale, perché fra sei mesi il difetto si «riscopre» e qualcuno lo richiude di testa sua senza sapere che era stato guardato.

**Trovata un'incoerenza dentro il v1**, e va segnata: `components.css` fa `.chip.is-active { background: var(--color-accent) }` — arancio pieno — mentre `theme.css` commenta `--color-accent-light: #FCF0DB` con «chip attivi». Il v1 ha spedito il pieno e documentato il tenue. Quando in FASE 4 si riprende in mano la questione, si parte da lì.

**Della barra 2 resta una cosa buona indipendente dal colore**: nel v1 il sorvolo muoveva **solo il bordo** e l'acceso riempiva il fondo — due stati su due proprietà diverse. È il motivo per cui nel v1 l'ambiguità non esisteva, ed è la parte riutilizzabile qualunque tinta si scelga.

### Errore di strumento, di nuovo, e di nuovo nel pannello

Guardando la story del confronto **nel pannello del browser dell'app** le pillole sembravano accendersi da sole: leggendo `aria-pressed` due volte di fila ottenevo insiemi diversi, coi fondi a metà transizione (`oklab(… / 0.82)`, `/ 0.18`). Riportato nello strumento pulito — Storybook costruito, Chromium headless — lo stato è **identico a 1,5 secondi di distanza, in entrambe le modalità**.

Era il pannello, non il componente. È la terza volta che quel pannello mente su un componente sano (M2.2 e M2.3 sui popup, `DECISIONI.md` §22), e la regola operativa resta: **il pannello va bene per guardare, non per misurare.** Le immagini mandate a Francesco vengono tutte dallo strumento pulito.

### I due soli ri-stili di M2.6, e perché restano

L'indirizzo «solo componenti standard» arriva a fine giornata, quando `toggle.tsx` e `toggle-group.tsx` avevano già i due ri-stili di cui sopra (`text-[0.8rem]` → `text-sm`, `rounded-[min(…)]` → `rounded-md`). Li ho tenuti, e il motivo va scritto perché non sembri una svista:

- non sono personalizzazioni di gusto ma la **terza ripetizione di una correzione già presa** in M2.1 sul `button` e in M2.2 sul `select`: un valore arbitrario **non segue la densità**, quindi in touch il componente cresce e il testo resta fermo. Toglierli rimetterebbe un difetto del tema, non una libertà a shadcn;
- stanno al **gradino 2** della regola 4bis, l'unico che `CLAUDE.md` dichiara si faccia «senza chiedere niente a nessuno», e `check:registry` resta verde perché confronta la forma, non il contenuto delle stringhe;
- il raggio è **identico al pixel** (il nostro `--radius-md` è 6px, sotto il tetto del `min()`): cambia solo che ora deriva dal tema.

Se l'indirizzo dovesse valere anche su questi, si tolgono in dieci minuti — ma allora va tolto anche il `sm` del bottone di M2.1, o il set resta incoerente.

---

## 2026-09-09 — Pulizia della storia: la demo dei caratteri esce dal repo, e con lei Replicall

Fuori sessione di piano. Richiesta di Francesco: valutare la fattibilità di caricare il v2 su GitHub e, come esito, ripulire la storia dalla demo dei caratteri — «abbiamo scelto Inter, non penso serva più averla».

### La valutazione, prima

Verificato che l'org `tassullo` esiste ed è raggiungibile (`gh`, account `fsartoricovi`, scope `repo`), che `tassullo-design-system-v2` **non esiste ancora**, che qui non c'è nessun `git remote` (D4), che il repo è piccolo e che **non ci sono segreti**: nessun `.env` nel working tree né in tutta la storia, nessuna chiave. I `.woff2` di Inter tracciati sono OFL con la licenza accanto, quindi ridistribuibili; i binari di Replicall in `public/fonts/` non sono **mai** stati committati, come voleva il `.gitignore`.

Un solo ostacolo reale, ed era quello già annotato in `CHECKLIST.md`: `docs/carattere-demo.html` portava **cinque font in base64**, Replicall compreso, nei commit dal `0c4f5e4` al `54361cb`. Il file era stato svuotato nel working tree in `72520d8`, ma la storia se lo teneva. Replicall è sotto licenza Webflow del sito istituzionale: pubblicarlo sarebbe una ridistribuzione non consentita.

**D4 resta aperta e nessun caricamento è stato fatto.** Francesco ha scelto di restare sul piano: il repo è ancora locale, senza remote. Questa pulizia è l'unico pezzo di M5.6 che non dipende da D4, ed è la ragione per cui si è fatta ora: oggi costa un comando su un repo che nessuno ha clonato, in M5.6 costerebbe lo stesso comando su un repo con dei cloni in giro.

### Come è stata fatta

`git-filter-repo` 2.47.0 (installato con brew; non è una dipendenza del progetto), `--invert-paths --path docs/carattere-demo.html`. Prima un **backup mirror completo** nella cartella di lavoro temporanea, con la demo ancora dentro: se un giorno servisse rivedere quei numeri, sono lì.

Esito, misurato e non dichiarato:

- **49 commit conservati**, nessuno perso; i messaggi e le date restano quelli.
- Il file non compare più in **nessun** commit (`git log --all -- docs/carattere-demo.html` → 0).
- Cercati i blob residui che contengono `data:font` in tutta la storia: ne restano **quattro**, e sono tutti legittimi — `registry/tassullo/theme/inter.css` e `public/r/tema-font.json` (Inter in data URI, OFL, che è l'item `tema-font` e ci deve stare) più `scripts/build-font-css.ts` e `scripts/inlina-font.py`, dove `data:font` è codice, non binario.
- Cercata la stringa «replica» in ogni blob sopra i 60 KB: solo `WORKLOG.md`, `PIANO.md` e `docs/DECISIONI.md`. Sono **menzioni testuali** — la cronaca di come si è scelto il carattere — e si pubblicano senza problemi. Il ragionamento di D3 resta leggibile per intero: si è tolta la prova, non il verbale.
- `.git` **da 8.6 MB a 2.5 MB**; `git fsck` muto; `npm run check` verde su tutti e tre i gate (48 avvisi, tutti valori arbitrari ereditati da shadcn e preesistenti).
- Gli hash **sono cambiati da `0c4f5e4` in poi**. Non ha conseguenze: nessun remote, nessun clone, nessun riferimento incrociato ai vecchi hash fuori dai documenti aggiornati qui sotto.

### Una cosa da sapere, ed è la sola che abbia fatto rischiare

A metà lavoro è arrivato in questo repo un commit da **un'altra sessione** (`2a562d9`, M2.6): il primo backup era già vecchio di un commit, e il confronto fra la storia riscritta e `HEAD` l'ha rivelato mostrando differenze che la sola rimozione della demo non spiegava. Il segnale che ha salvato la situazione è stato proprio quello: **un `diff --stat` più largo dell'atteso**. Backup rifatto sulla storia a 49 commit e riscrittura ripetuta in casa, ad albero pulito.

La regola che ne esce, per chiunque riscriva la storia di questo repo in futuro: **si riscrive solo ad albero pulito e senza altre sessioni aperte**, e prima di applicare si confronta l'albero vecchio col nuovo, che deve differire *solo* per ciò che si intendeva togliere. Un backup mirror preso dieci minuti prima non è un backup.

### Modifiche ai documenti

- `CHECKLIST.md` — riga M5.6: la precondizione «ripulire la storia» è barrata e chiusa con la misura. M5.6 **resta BLOCKED su D4**, che è l'unica cosa che ancora lo blocca.
- `WORKLOG.md` — la voce del 2026-09-08 che indicava `docs/carattere-demo.html` come sorgente archiviato ora dice che il file non c'è più e perché. L'indirizzo dell'artifact resta.

### La coda: lo script che restava senza input

`scripts/inlina-font.py` esisteva **solo** per sostituire il segnaposto `/*REPLICA_FONTFACE*/` dentro quella demo. Tolta la demo, non aveva più né input né scopo. Indirizzo di Francesco nella stessa sessione: toglierlo. **Fatto** — verificato prima che non fosse richiamato da nessuno script di `package.json` e che il suo unico argomento fosse il file appena rimosso.

Restano `scripts/otf2woff2.py` e `scripts/otf2ttf.py`, che **non** sono orfani: convertono Replicall per il **canale di stampa**, che è vivo — il carattere è Inter sullo schermo e Replica nelle stampe (D14). Nessuno dei due porta binari nel repo: leggono da `public/fonts/`, che il `.gitignore` tiene fuori.

Nota per chi rileggesse il conteggio dei blob qui sopra: `inlina-font.py` compare ancora fra i quattro con `data:font`, e va bene — quel conteggio parla della **storia**, dove il file resta, e lì `data:font` era codice, non un binario. Non c'è niente da ripulire una seconda volta.

### Prossimi passi

Nessuno vincolato. D4 aperta, repo locale, si torna al piano: **M2.7 Date** (`calendar`, `date-picker`).

---

## 2026-09-09 — M2.7 Date: l'eccezione prevista non si pone, e la tastiera è rotta a monte

Una primitiva sola, `calendar`. **52 item**, `registry validate` verde.

### L'eccezione a Base UI (D9) non si decide: non c'è niente da decidere

Il piano metteva qui l'unico punto in cui era prevista un'eccezione a Base UI — «se il calendario Base UI risultasse debole su locale e intervalli, si valuta la variante React Aria». Chiesto all'MCP prima di scrivere qualsiasi cosa, e la premessa è falsa: **Base UI non ha un calendario**, e shadcn ne spedisce **uno solo**, costruito su `react-day-picker` + `date-fns`. Non ci sono due candidati da confrontare, quindi non c'è nessuna eccezione da motivare. D9 resta chiusa com'era.

E il componente unico copre da sé tutt'e tre i criteri, senza che si scriva una riga.

### `date-picker` non esiste come item, e resta una composizione

Il piano elencava due voci. **`date-picker` ha una sua pagina fra i componenti shadcn** (`/docs/components/base/date-picker`) — segnalata da Francesco, e la mia prima formulazione la dava per inesistente, il che era sbagliato. Ma **non è un item installabile**: `view` e `add @shadcn/date-picker` danno **404** su `base-nova`, e `shadcn docs date-picker` risponde «not found in the shadcn registry». Nell'indice MCP esistono tre `registry:example` (`date-picker-demo`, `-with-range`, `-with-presets`) che pure **404 su `base-nova`**: sono gli esempi dell'era Radix.

Lo dice la pagina stessa, e la riga chiude la questione: **«A date picker is built from Popover and Calendar (there is no DatePicker root component)»**. È una composizione documentata, non un componente.

**Errore di strumento da annotare, perché mi ha fatto scrivere una cosa falsa.** La prima verifica l'avevo fatta con `npx shadcn list @shadcn | grep -i date`, e ne avevo concluso «esistono solo `calendar` e `calendar-example`». **`list` è troncato**: restituisce 105 righe su un registro di **471 item**. Non è una fonte su cui basare un «non esiste». La coppia giusta è `view`/`add` sul nome esatto (che dice se l'item è installabile *in questo stile*) più la pagina di documentazione (che dice qual è la risposta di shadcn). Regola: **`list` serve a sfogliare, non a dimostrare un'assenza.**

Non l'ho impacchettato in un componente nostro, ed è la stessa scelta del «Grilletto» di M2.6, presa per l'indirizzo che ne è uscito: **componenti shadcn standard, senza personalizzazioni**. Un `DatePicker` nostro sarebbe stato il primo componente in `componenti-propri.json` — un file da mantenere per sempre — in cambio di dodici righe che ogni app scrive comunque una volta sola. Le composizioni stanno nelle story, che sono il modello da copiare. `componenti-propri.json` **resta vuoto**, ed è la condizione da difendere.

Quindi: il piano ne chiedeva due, ne è uscita **una**. Come M2.6, che ne chiedeva quattro e ne ha date tre.

### I criteri, misurati in un browser vero

- **Italiano e lunedì**, col solo `locale={it}`: intestazioni `lun mar mer gio ven sab dom`, prima colonna lunedì (31/08/2026, che è un lunedì), didascalia `settembre 2026`. **`weekStartsOn` non si scrive**: `it.options.weekStartsOn` vale già `1`, misurato. Il locale porta anche le etichette ARIA — «Vai al mese precedente», «Oggi, mercoledì 9 settembre 2026».
- La story `Il locale, a confronto` tiene i due calendari affiancati: `Su Mo Tu We Th Fr Sa` a sinistra, `lun mar mer gio ven sab dom` a destra. È il verbale del perché non serve `weekStartsOn`.
- **Intervalli**: `mode="range"`, due mesi, estremi in arancio e mezzo in grigio; ricomposti al clic (start 1 / middle 8 / end 1 dopo due clic nuovi).
- **Densità**: cella **28 → 42px**, nome del giorno **12 → 13px**, numero **13 → 14px**. Il preset la densità la segue già da sé perché la cella è `--cell-size: --spacing(7)` invece che in pixel.

### Un ri-stile solo, ed è la quarta volta dello stesso difetto

`text-[0.8rem]` → `text-sm`, due volte (nomi dei giorni, numeri di settimana). Un valore arbitrario **non segue la densità**: prima della correzione il testo restava a 12.8px mentre la cella cresceva a 42. Quarta ripetizione dopo `button` (M2.1), `select` (M2.2) e `toggle`/`toggle-group` (M2.6). Gradino 2, solo stringhe di classi.

### Aperta e chiusa **D15** — la tastiera del calendario non naviga, e la causa è in shadcn

È il rilievo della sessione, e l'ha trovato **solo** la prova manuale della tastiera: axe dà zero violazioni su queste story con la navigazione completamente rotta.

Misurato in Chromium sullo Storybook costruito, sul componente nudo senza composizioni:

| | |
|---|---|
| giorni resi | **35** |
| giorni raggiungibili col `Tab` | **1** |
| tasti di navigazione che muovono il fuoco | **0 su 7** |

Il percorso di tabulazione è `mese precedente → mese successivo → il giorno a fuoco → fuori`. Le frecce, `Home`, `End` non spostano niente; `PageDown` non viene nemmeno intercettato e scorre la pagina. **Da tastiera si può scegliere una data sola**, quella già selezionata.

**La causa è una riga mancante nel sorgente shadcn**, identica nel nostro file e nell'originale in `registry/.upstream/calendar.tsx`: `CalendarDayButton` dichiara un `ref` e lo usa in un effetto — `React.useEffect(() => { if (modifiers.focused) ref.current?.focus() }, [modifiers.focused])` — ma **non lo attacca mai al `Button`**. `ref.current` resta `null` per sempre: `react-day-picker` sposta correttamente il proprio giorno «a fuoco» (il `tabindex` mobile si muove, verificato) e il fuoco del DOM non lo segue.

Correzione provata e misurata: **un solo attributo, `ref={ref}`**, e tutti e sette i tasti tornano a muovere (`→` giovedì 10, `↓` mercoledì 16, `Home` lunedì 7, `End` domenica 13, `PageDown` 13 ottobre).

**Portata a Francesco invece di applicarla**, perché la somiglianza con D14 è solo nella forma della decisione: D14 riguardava i lettori di schermo, che per strumenti interni non sono un requisito, mentre questa colpisce **chi usa la tastiera**, che lo è. Le quattro strade a verbale erano: divergere di un attributo, accettare come D14, segnalare a monte e aspettare, o rimediare in composizione con un `components={{ DayButton }}` per ogni app.

**D15 chiusa in giornata: si accetta, non si diverge.** Stessa motivazione di D14 e stesso indirizzo — si spediscono i componenti shadcn standard, e le personalizzazioni le chiederanno le app, discusse e autorizzate prima. Il file spedito è il preset intatto. **In carico a M2.9**, con l'avvertenza che conta: **axe non vede questo difetto** — zero violazioni sulle story del calendario mentre la navigazione è completamente rotta — quindi è il residuo manuale del gate a doverlo tenere a registro, non la CI. Ed è l'ennesima volta che la prova manuale della tastiera trova ciò che lo strumento automatico non trova: in M2.5 era il primo `Esc` mangiato dal tooltip invisibile, in M2.2 la maniglia dello `slider` senza anello di fuoco.

### Il rilievo che vale oltre il calendario: sui file `◌` il gate è cieco

Provato: **col `ref={ref}` applicato, `npm run check:registry` resta verde.** Non è un guasto del gate, è la sua regola nota — l'originale shadcn del calendario è un template a segnaposto d'icona (`◌`), e su quei file il confronto di forma è **saltato per costruzione**. Conseguenza da conoscere, e che non era ancora scritta: **sui file `◌` una divergenza strutturale passa in silenzio**, e l'unico controllo resta la rilettura a mano alla prossima versione di shadcn. Oggi i file `◌` sono otto (`calendar`, `dropdown-menu`, `pagination`, `select`, `sheet`, `sidebar`, `sonner`, `spinner`).

### Un difetto mio, trovato e chiuso: il picker a intervallo si chiudeva al primo clic

La prima stesura chiudeva il riquadro dell'intervallo quando `onSelect` dava `from` **e** `to`. Sembra ovvio, ed è sbagliato: misurato che al **primo** clic `react-day-picker` chiama `onSelect` con `{ from: X, to: X }`, non con `to` vuoto. Il campo diceva `6 set 2026 — 6 set 2026` e il riquadro era già chiuso.

Rimedio, che è di nuovo il non-fare: **il picker a intervallo non si chiude da sé**, come nell'esempio di shadcn. Si chiude con `Esc` o cliccando fuori, che è il comportamento del popover e non va insegnato. Confrontare i due estremi per decidere sarebbe stato scrivere una regola nostra sopra un componente standard, per giunta sbagliata al primo caso limite — un intervallo di un giorno solo è legittimo.

### Un requisito d'uso nuovo: `aria-label` sul `PopoverContent`

axe ha dato **4 violazioni `aria-dialog-name`, gravità *serious***, sui due date-picker a popup aperto (2 story × 2 modalità). Il riquadro è un `role="dialog"` e un dialogo senza nome è una violazione. Non è un difetto del `popover` — un popover che contiene un titolo il nome ce l'ha; questo no perché contiene solo la griglia. **Chiuse in composizione**, con l'attributo, senza toccare nessun componente.

### Quello che è venuto fuori dalla segnalazione: **la data si scrive**

La pagina che Francesco ha linkato porta sette varianti, e una non ce l'avevamo: **`Input`**, il date-picker con un campo in cui la data si **batte**, e il calendario relegato a seconda strada dietro un bottone-icona (`↓` nel campo lo apre).

Aggiunta come story — composizione, gradino 1, nessun componente nuovo — perché per Anagrafe è probabilmente **la forma da usare di default**: chi carica schede a giornata la data la scrive, e aprire un riquadro per cliccare un numero è più lento di sei cifre. Ed è anche il **rimedio pratico a D15** senza divergere da niente: se la data si scrive, il calendario che non si naviga da tastiera smette di essere sulla strada.

**Una differenza dall'esempio shadcn, ed è obbligata.** Loro fanno `new Date(e.target.value)` sulla stringa scritta. In italiano non si può: `new Date('03/09/2026')` la legge **all'americana**, mese prima del giorno, quindi il 3 settembre diventerebbe il 9 marzo — un errore che **non dà errore**, e che su una data di revisione non si scopre mai. Si usa `parse(valore, 'dd/MM/yyyy', ..., { locale: it })`, e il segnaposto dice `gg/mm/aaaa` così il formato atteso è scritto.

Verificato in un browser vero: scritto `03/09/2026`, `↓` apre e il calendario mostra **giovedì 3 settembre 2026, selezionato** (non il 9 marzo); scritto `99/99/9999` il calendario non si muove; scelto col mouse, il campo si riempie `20/09/2026` e il riquadro si chiude.

### Una domanda di Francesco a fine sessione: perché il riquadro si apre a destra

Guardando la story del date-picker nel suo Storybook, il calendario si apriva **a destra del campo** invece che sotto. Misurato, ed è l'anti-collisione del `popover`, non un difetto:

| viewport | lato | spazio sotto il campo |
|---|---|---|
| 1400×1000 | `bottom` | 485px |
| 1440×640 | `bottom` | 305px |
| **1440×560** | **`right`** | **265px** |

Il riquadro è alto **257px**: sotto i ~270px di spazio libero Base UI non trova posto né sotto né sopra (nel caso misurato lo spazio sopra e sotto sono quasi identici) e ripiega sull'asse perpendicolare. Nel suo Storybook il pannello degli addon era aperto, quindi il canvas era basso. In una pagina vera, con un campo in cima a un form, si apre sotto.

Non vincolato: è il comportamento di ogni popup del set. Volendo tenerlo sull'asse verticale c'è `collisionAvoidance` di Base UI, che sta in composizione e non nel componente — ma il prezzo è che quando davvero non ci sta il riquadro esce dallo schermo. Messo a verbale nella story, perché è il tipo di cosa che fra sei mesi si riapre come un bug.

### Contrasto: 14 *incomplete*, tutte false, e un'eccezione da dire

Misurate a mano sui colori risolti dal motore di resa (canvas 1×1, come impone la nota di M2.1 sugli `oklch`):

| | chiaro | scuro |
|---|---|---|
| nome del giorno, giorno normale, fuori mese | 5.05 | 7.75 |
| mese e anno | 17.03 | 15.72 |
| giorno scelto, estremo dell'intervallo | 9.49 | 9.49 |
| dentro l'intervallo | 15.35 | 12.91 |
| scadenza marcata (`accent-ink`) | **4.77** | 9.49 |

Minimo vero **4.77:1**.

**L'eccezione: il giorno disabilitato.** Il preset lo fa con `opacity-50`, e l'opacità cambia il colore in composizione senza che nessun token la dichiari — **terza volta** che sfugge a `check:contrast` (M2.2 sul testo d'errore, M2.5 sull'etichetta della sidebar). Composto: **2.00:1 in chiaro, 2.84:1 in scuro**. Resta com'è, e non è una svista: la WCAG 1.4.3 esenta i controlli inattivi, e un giorno disabilitato che si legge come uno attivo sarebbe il difetto opposto. Scritto perché la prossima misura non lo riscopra come nuovo.

### Un incidente di procedura, da non ripetere

`npx shadcn add @shadcn/calendar --yes --overwrite` ha riscritto **anche `button.tsx`**, che è una `registryDependency` del calendario: cancellati i ri-stili di M2.1 — `destructive` tornato a 3.82:1, `link` tornato a `text-primary` (1.79:1), `sm` tornato a `text-[0.8rem]`. Accorto dal `git diff` subito dopo, ripristinato con `git checkout`.

La regola che ne esce: **`--overwrite` non si usa su un `add` le cui `registryDependencies` includono componenti già ri-stilati.** La CLI riscrive le dipendenze senza chiedere e senza dirlo se non in una riga di riepilogo. L'unica difesa è guardare il `git diff` di *ogni* file toccato, non solo di quello che si voleva installare.

### Verifiche

`npm run check` verde su tutti e tre i gate (contrasto 0 sopra soglia; registry **0 errori / 50 avvisi / 13 ri-stilati**; font allineato); `npx shadcn registry validate` verde su **52 item**; `tsc -b`, `npm run build`, `npm run build-storybook` verdi; `oxlint` 3 avvisi, gli stessi ereditati. `npm run registry:build` rilanciato, `public/r/` aggiornato.

**axe: 452 scansioni (207 story × 2 modalità, popup aperto *e* chiuso), 24 violazioni — le stesse 24 accettate di M2.6**, nessuna nuova. Il conto noto di progetto resta **36** (le 12 di M2.3 su `dropdown-menu` e `select` non sono rimisurate qui, per la stessa ragione scritta allora: l'imbracatura non apre quei due popup).

### Prossimi passi

**M2.8 — Dati**: `chart` con la palette categorica sui token Tassullo. Non è bloccato da D15.

**In attesa di decisione di Francesco**: **D13** (l'item `tema-logo`). D15 è stata chiusa in giornata, e M2.7 è **DONE**.

## 2026-09-09 — Nota: un componente di avanzamento per fasi, autorizzato in linea di principio

Domanda di Francesco fuori sessione: esiste un componente che mostri lo stato di un flusso come **progressione** — bozza → in attesa di approvazione → in revisione → approvato → superato — con una linea orizzontale e dei pallini, uno dei quali segna la fase attuale.

**Chiesto all'MCP prima di rispondere** (regola 4bis, gradino 1). **Non esiste**: 471 item nel registry `@shadcn`, nessuna corrispondenza per `stepper`, `steps`, `timeline`, `progress steps`. Quello che si avvicina non serve, e per ragioni di funzione, non di aspetto: `progress` è una barra continua senza tappe nominate; `breadcrumb` è un **percorso di navigazione che si clicca**, non uno stato che si legge (è la trappola del nome già a verbale nel CLAUDE.md); `tabs` cambia vista; `badge` dice bene la fase attuale ma non mostra quelle prima e dopo.

Il gradino 3 — adattare il design system — è stato valutato e proposto: `badge` della fase attuale più un «3 di 5». Costa zero di manutenzione ma perde proprio ciò che è stato chiesto, cioè vedere la sequenza intera e la propria posizione dentro di essa. Su un flusso di approvazione quella è mezza informazione.

**Decisione di Francesco: sarà un componente nostro, che si progetta se e quando serve.** È un'autorizzazione **in linea di principio**, non un ordine di scriverlo ora — nessun file toccato, `registry/componenti-propri.json` resta vuoto. La riga formale nel registro si scrive quando il componente si fa, non adesso: la tracciatura è la condizione perché esista, e un componente che non esiste non si traccia.

Collocazione naturale quando toccherà: **M3.7**, accanto a `version-timeline`. La timeline verticale delle revisioni di un documento e la barra orizzontale dello stato sono lo stesso dominio — il flusso di approvazione di Anagrafe, quello attorno a cui ruota anche `diff-view` (M3.9) — e vanno progettate coerenti in una sessione sola. Il consumatore previsto è l'intestazione «stato e azioni» di `pagina-scheda` (M4.3).

Forma abbozzata, da confermare quando si farà: sola lettura e **non cliccabile** (se si clicca è un'altra cosa e va chiamata in un altro modo), tre stati per pallino — fatta / attuale / futura — con l'arancio `--primary` **solo** sull'attuale, e degrado a incolonnato sotto i 375px.

## 2026-09-10 — M2.8 Dati: la scala delle serie, e un selettore che Recharts ha reso stale

### Attività

`chart` installato da shadcn (`@shadcn/chart`, Recharts 3.8), snapshot dell'originale preso **prima** di toccarlo. `--chart-1..5` ridefiniti in `scripts/hex-to-oklch.ts`, che li **deriva** invece di elencarli. Le story dei tipi di grafico, con il criterio di accettazione verificabile dentro ognuna (vedi i due giri di rilievi più sotto). Item aggiunto a `registry.json` (**53**), `registry:build` rilanciato.

### La scala, e perché il passo non l'ho scelto

Il piano chiedeva una palette categorica «arancio, verde `#1CAC7C`, neutri caldi» con cinque serie distinguibili in scala di grigi. Distinguerle in grigio vuol dire **luminanze diverse e regolarmente spaziate**: la tinta viene dopo, e questo cambia l'ordine del ragionamento.

Il passo è quello che i due colori Tassullo hanno **già** fra loro: `--primary` `#F4AC3D` e `--success` `#1CAC7C` stanno a **1.4935:1**. Misurato, non deciso — e da lì la scala prosegue geometrica. I primi due pioli sono i due colori veri (`serieAlPiolo` restituisce la sorgente se sta già sul piolo, così `--chart-1` è esattamente `#F4AC3D`), gli altri tre prendono tinta e croma da `--info` scuro e da `--muted-foreground`, e solo la chiarezza dal piolo.

| | chiaro | scuro |
|---|---|---|
| chart-1 | **#F4AC3D** | #FFDDB0 |
| chart-2 | **#1CAC7C** | #4FD09D |
| chart-3 | #0180BF | #39A0E2 |
| chart-4 | #615E5A | #7C7975 |
| chart-5 | #474541 | #615E5A |

Sullo scuro la scala **sale di un piolo esatto** — dello stesso passo, non di un fattore inventato — e i due limiti tolgono la scelta invece di lasciarla: all'altezza chiara `chart-5` starebbe a **1.78:1** dalla card scura (una barra che non si vede), e a un piolo e mezzo `chart-1` supererebbe in contrasto il **testo** di pagina, 16.13 contro 15.71. Un dato più marcato del testo non è più un dato.

Detto anche ciò che la scala **non** dà: la serie più chiara sta a **1.91:1** dalla card in chiaro, la più scura a **2.64:1** in scuro, sotto i 3:1 della WCAG 1.4.11 *quando il colore è l'unico mezzo*. Non lo è mai — legenda, etichette diritte sui dati, cinque tratteggi diversi per le linee — e non è una rinuncia: cinque pioli da 3:1 fanno 81:1 contro i **21:1** che sRGB permette.

### Il gate è cresciuto di quattro controlli

`npm run check:contrast` ha ora una sezione «scala delle serie» per modalità: passo in grigio fra pioli adiacenti (soglia 1.45, misurato **1.483–1.506**), ogni serie contro la card (≥ 1.5), nessuna serie oltre il testo di pagina, e ΔE2000 ≥ 5 fra ogni coppia sotto **deuteranopia, protanopia, tritanopia**.

Sull'ultimo vale la pena essere espliciti, perché la soglia sembra bassa: **non è quello il garante della distinzione**. Il garante è il passo in grigio, che copre tutti e tre i deficit insieme perché nessuno di essi tocca la luminanza. Il ΔE serve a un caso solo — accorgersi se una coppia **collassa** — e il minimo misurato è **8.5** (`chart-1`/`chart-2` in scuro, protanopia), cioè nessuna coppia è vicina a collassare. Una soglia scelta appena sotto la misura sarebbe stata una tautologia; questa dice una cosa diversa da quello che dice il passo.

Il passo, invece, **non** è tautologico pur essendo costruito dallo script: se qualcuno cambia l'arancio o il verde, il passo cambia davvero e il gate lo dice.

### Il rilievo della sessione: un selettore shadcn stale contro Recharts 3

`chart.tsx` esce da shadcn con `[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground`. **In Recharts 3 quel gruppo si chiama diversamente** — `recharts-cartesian-axis-tick-label` dentro `recharts-cartesian-axis-tick-labels` — quindi il selettore non aggancia niente e il testo degli assi resta al `fill="#666"` che Recharts cuce nel proprio SVG.

Misurato coi colori risolti dal motore di resa: **5.64:1 in chiaro, 2.97:1 in scuro**. Testo sotto soglia in modalità scura, su tutti i grafici, in ogni app che installasse il componente così com'è.

**axe non lo vede**: lo classifica `color-contrast` *incomplete* perché è testo SVG. È l'ennesima volta che la misura a mano trova ciò che lo strumento automatico non trova — dopo il primo `Esc` mangiato dal tooltip (M2.5), la maniglia dello `slider` senza anello (M2.2) e la tastiera del calendario (M2.7) — e questa volta con un aggravante utile a M2.9: qui l'automatismo **c'era e ha detto «non so»**, non «tutto bene». Le *incomplete* non sono rumore da archiviare in blocco.

Corretto ri-stilando la sola stringa (gradino 2), agganciando la classe del **testo** invece di quella del gruppo: dopo, **5.37:1 e 7.17:1**, cioè `--muted-foreground` in entrambe le modalità. Gli altri quattro selettori a colore cotto del preset — griglia, cursore del tooltip, settori della torta, punti — sono stati verificati uno per uno e **agganciano ancora**. Da rifare a ogni aggiornamento maggiore di Recharts: sono selettori su classi di una libreria terza, la parte più fragile del componente.

### Sesta normalizzazione del gate, e la regola dei falsi positivi

`check:registry` segnalava come «colore esadecimale nel sorgente» gli `#ccc` e `#fff` di quei selettori. Falso positivo: lì l'hex non è un colore che scriviamo, è un colore che **intercettiamo**, e toglierlo spegnerebbe l'override lasciando il grigio di Recharts. La normalizzazione ora ignora gli hex dentro un selettore d'attributo (`[stroke='#ccc']`) e continua a rifiutare tutto il resto — `bg-[#F4AC3D]` resta un errore.

### Un secondo ri-stile, e uno non fatto

`ChartTooltipContent`: `bg-background` → `bg-popover`. Il tooltip fluttua sopra il grafico e il grafico sta quasi sempre dentro una card: col colore di pagina sarebbe **più scuro** della card su cui galleggia. Misurato dopo: il riquadro è ora esattamente il colore della card (1.00:1) e si stacca con bordo e ombra, come ogni altro popup del set — con `bg-background` erano 1.06:1, cioè lo stesso nulla ma dalla parte sbagliata.

**Non** ri-stilati `rounded-[2px]` e `border-[1.5px]`, i due valori arbitrari ereditati: nessun token li sostituisce al pixel (il gradino `sm` è 4px) e non rompono niente — non seguono la densità, ma sono una pastiglia di legenda e un bordo tratteggiato, non un bersaglio. Restano segnalati come avvisi dal gate, che è il posto giusto.

### Legenda e tooltip: Recharts ordina in ordine alfabetico

`Legend` ha `itemSorter: "value"`, `Tooltip` ha `itemSorter: "name"`. Nel grafico a linee le curve stanno in ordine di grandezza e la legenda diceva «Additivi, Calcestruzzi, Inerti, Malte, Prefabbricati» — un ordine che nel disegno non esiste. Spento **in composizione**: `null` per la legenda, e per il tooltip un comparatore costante, perché l'ordinamento di Recharts è stabile. Da sapere prima di comporre un grafico: la legenda giusta va chiesta.

### Verifiche

`npm run check` verde su tutti e tre i gate (contrasto 0 sopra soglia, **scala delle serie 36 controlli verdi**; registry **0 errori / 52 avvisi / 14 ri-stilati**; font allineato); `npx shadcn registry validate` verde su **53 item**; `tsc -b`, `npm run build`, `npm run build-storybook`, `oxlint` (3 avvisi ereditati) verdi.

**axe: 10 scansioni (5 story × 2 modalità), 0 violazioni.** 112 *incomplete* `color-contrast`, tutte testo SVG, misurate a mano: etichette d'asse **5.37 / 7.17**, etichette sui dati e sulle fette **18.11 / 14.54**, voci del tooltip **5.37 / 7.17** e valori **18.11 / 14.54**. Minimo vero **5.37:1**. Il conto noto di progetto resta **36**, invariato.

**Tastiera provata a mano**, che è la lezione di M2.7: con `accessibilityLayer` il grafico prende il fuoco col `Tab` e le frecce spostano il tooltip di mese in mese (verificato in Chromium sullo Storybook costruito, in entrambe le modalità). Nessun difetto tipo D15 qui.

**Una nota di banco**: il pannello del browser dell'app resta inservibile per questi componenti, e questa volta il sintomo è nuovo — `requestAnimationFrame` non scatta a pannello nascosto, e Recharts ci schedula dentro l'animazione d'ingresso, per cui **assi e legenda si vedono e le barre no**. Un grafico vuoto che sembra un difetto di dati. Misurato in Chromium di Playwright dalla cartella temporanea, come in M2.3 e M2.7, sempre senza aggiungere Playwright al repo.

### Tre rilievi di Francesco a fine sessione, tutti e tre chiusi

**1. Le etichette della torta erano incollate alle fette.** La prima stesura usava `LabelList` con `position="outside"`, che appoggia il testo sul bordo. L'esempio shadcn `chart-pie-label` fa un'altra cosa: usa il `label` di Recharts, che disegna una **lineetta di richiamo** e tiene il testo staccato. Passato a quello — gradino 1, la strada che shadcn indica — con la funzione che traduce la chiave leggendo il `config`, perché il `label` scrive `nameKey` così com'è. Il colore del testo viene dal ri-stile che shadcn stesso documenta, `[&_.recharts-pie-label-text]:fill-foreground`: le etichette della torta sono l'unico testo del set che Recharts non lascia ereditare.

**2. La ciambella non è un altro grafico: è `innerRadius`.** Chiesto all'MCP prima di rispondere (regola 4bis, gradino 1): nel registry shadcn `chart-pie-donut` e `chart-pie-donut-text` sono **esempi**, non componenti — la torta e la ciambella sono lo stesso `Pie` e la differenza è una prop. Aggiunta la story `Ciambella`, e il buco serve a qualcosa: ci sta il **totale**, che su una ripartizione è il numero che manca sempre, in cifre tabellari.

Un difetto mio trovato misurando: il `<text>` centrale non dichiarava il proprio `fill` e prendeva il nero del motore di resa — invisibile perché entrambi i `tspan` figli il colore ce l'hanno, ma **1.23:1 in scuro** se un giorno qualcuno ci scrivesse dentro senza `tspan`. Chiuso con `fill-foreground` sull'elemento padre.

**3. Un banco con i controlli**, su indicazione di Francesco. La story `Banco` monta gli stessi dati su tutti e quattro i tipi con gli interruttori nel pannello `Controls` — tipo, quante serie (1–5), legenda, griglia, etichette sui dati, pallini, tratteggi. Non è una vetrina: serve a **provare** la regola del colore invece di leggerla, spegnendo la legenda su cinque linee e guardando cosa resta. Le quattro story narrative hanno `controls: { disable: true }`, perché mostrano un caso ciascuna ed è il punto.

Conseguenza sul meta: **tolto `component: ChartContainer`**. La tabella delle props generata era l'elenco degli attributi di un `div` (280 righe), e gli argomenti che contano ora sono quelli del banco.

### E la domanda che sta sotto tutte e tre: cosa è già dentro il componente

Vale la pena scriverlo perché tornerà a ogni grafico nuovo. **La legenda c'è già** — `ChartLegend` e `ChartLegendContent` sono esportati da `chart.tsx` — ma **va messa**: Recharts non la disegna da sé. Stessa cosa per il tooltip, la griglia (`CartesianGrid`) e le etichette sui dati (`LabelList`). Il componente shadcn dà il **vestito** (token, etichette in italiano dal `config`, cifre tabellari), Recharts dà i **pezzi**: quello che non si scrive non compare. La sola cosa che il vestito non copre è l'ordine, che è alfabetico finché non glielo si toglie.

### I «warning» che si vedono nel pannello Accessibility

Segnalati da Francesco. Non sono violazioni: sono le **`color-contrast` *incomplete***, e axe dice esattamente perché — «Element's background color could not be determined because element contains an image node», cioè c'è un SVG dietro il testo e lo strumento non sa che colore ci sia sotto. Su un grafico è la norma, non l'eccezione.

Misurate tutte a mano, coi colori risolti dal motore di resa (canvas 1×1), su **5 story × 2 modalità**:

| | chiaro | scuro |
|---|---|---|
| etichette d'asse (`muted-foreground`) | 5.37 | 7.17 |
| etichette sui dati e sulle fette (`foreground`) | 18.11 | 14.54 |
| totale al centro della ciambella | 18.11 | 14.54 |
| «schede», sotto il totale (`muted-foreground`) | 5.37 | 7.17 |
| voci del tooltip / valori | 5.37 / 18.11 | 7.17 / 14.54 |

Minimo vero **5.37:1**, cioè sopra soglia ovunque e in entrambe le modalità. **Ed è proprio una di queste «incomplete» ad aver nascosto il difetto vero della sessione** — il `#666` degli assi, 2.97:1 in scuro: fino alla correzione la riga nel pannello era identica a queste, *serious* e senza numero. È il rilievo da portare in M2.9: le *incomplete* non si archiviano in blocco, si misurano.

### Secondo giro sui rilievi di Francesco: aree, controlli, rampa arancio

**Il grafico ad area, e la regola che ne è uscita.** Aggiunta la story `Aree`. Gli esempi shadcn riempiono a `fillOpacity={0.4}` perché le aree sovrapposte devono lasciarsi attraversare; da noi quel valore **rompe il requisito di M2.8**. Misurato sui colori composti dal motore di resa, con cinque aree:

| | passi in grigio |
|---|---|
| piene | 1.493 · 1.496 · 1.486 · 1.483 |
| traslucide 0.4, chiaro | **1.166 · 1.146 · 1.061 · 1.118** |
| traslucide 0.4, scuro | **1.285 · 1.238 · 1.199 · 1.171** |

A 1.06 due serie adiacenti sono lo stesso grigio. Regola Tassullo: **le aree si riempiono piene e si impilano** — impilate non si sovrappongono, non c'è niente da attraversare, la scala resta intera. Servono serie sovrapposte? Allora il grafico giusto è quello a **linee**. L'interruttore `impilato` lascia comunque vedere il caso sbagliato, che è il modo più rapido di capire perché è sbagliato. Quarta volta dell'opacità che cambia un colore in composizione senza che nessun token la dichiari (`DECISIONI.md` §26.6).

**`--chart-mono-1..5`, la rampa monocroma del brand.** Richiesta di Francesco, sul modello degli esempi shadcn che usano sfumature del colore d'accento. Non è una seconda palette: sono **gli stessi cinque pioli**, tutti alla tinta dell'arancio (`deriveMono` chiama `serieAlPiolo(primary, …)` sulle altezze di `deriveSerie`), quindi eredita per costruzione il passo in grigio e passa gli stessi quattro controlli — misurato: passo 1.490–1.501, ΔE minimo 9.0. Chiaro `#F4AC3D → #603D00`, scuro `#FFDDB0 → #815500`.

Quando si usa è una scelta di significato: le cinque tinte categoriche dicono «cinque cose diverse», la rampa dice «la stessa cosa, di più». Su categorie **ordinate** la categorica è sbagliata, e su una serie sola prendere un arancio, un verde e un blu non ha senso.

**I controlli sono passati dentro le story.** La prima stesura aveva un `Banco` unico con tutti gli interruttori; su indicazione di Francesco ogni grafico porta i propri e nasconde quelli che non lo riguardano. Un controllo che non fa niente è peggio di un controllo che manca. Nove argomenti, ognuno una scelta vera: `serie`, `colori` (categorici / arancio / grigio), `legenda`, `griglia`, `etichette`, `pallini`, `tratteggi`, `impilato`, `orizzontali`, `curva`. Il `grigio` non è una terza palette — è il filtro CSS sulla categorica, cioè la prova di leggibilità fatta **sul grafico che si sta guardando** invece che su una story a parte.

Due cose imparate scrivendoli, che valgono oltre `chart`: `layout="vertical"` in Recharts vuol dire **barre orizzontali**, cioè il nome al contrario; e `type="linear"` contro `type="natural"` non è estetica — una spezzata dice «ho misurato qui, qui e qui», una curva morbida suggerisce un andamento che nessuno ha misurato, quindi su dati mensili radi il default resta la spezzata.

**Le etichette sui dati erano troppo vicine alla linea**, rilievo di Francesco a confronto con shadcn. Causa: `LabelList` ha `offset` 5 di default, e gli esempi shadcn passano `offset={12}`. Corretto ovunque, verificato a occhio in un browser vero.

**Tolta la story `In scala di grigi`**, su indicazione di Francesco, ed è la conseguenza giusta del controllo `colori`: finché il grigio stava in una story a parte, il criterio si vedeva su **un** caso costruito apposta; ora si prova su qualsiasi grafico, con qualunque numero di serie e qualunque tipo. Il criterio di accettazione di M2.8 non si è indebolito — ha cambiato posto, e la prova col numero resta `check:contrast`, che misura la luminanza vera invece dei pesi che il filtro CSS applica ai valori sRGB non linearizzati.

### Terzo giro: quattro difetti dallo Storybook, e il tetto della scala

**Il totale della ciambella non era centrato con la legenda accesa.** Misurato: accendendo la legenda Recharts riduce l'`outerRadius` che passa al `Label` (124 → 113.3) ma **lascia `cy` a 160**, mentre l'anello sale di 13.3px; lo stesso `viewBox` riporta `innerRadius: 0` su una ciambella, cioè non è quello della torta. Provato anche coi raggi in pixel invece che in percentuale: identico. Rimedio senza indovinare niente — la legenda ha un'altezza che **dichiariamo noi**, l'area si accorcia di quella, il centro sale di metà. Più una seconda correzione indipendente: il blocco è di due righe e il suo baricentro cade **5.1px** sotto la prima, non a metà stacco, perché la riga grande è alta il doppio. Scarto finale **0.1px**, uguale con e senza legenda.

**Le barre impilate avevano gli angoli tondi anche in mezzo alla pila** — un intaglio fra una serie e l'altra. Corretto sulla forma di `chart-bar-stacked`, generalizzata a n serie e alle due orientazioni.

**Assi X e Y su interruttori separati** (`asseX`, `asseY`) per barre, linee e aree, con `hide` sull'asse: togliendo il componente si perderebbe anche la scala, non solo le etichette.

**`sfumatura` sulle aree**, l'esempio `chart-area-gradient`. Ha lo stesso difetto della traslucidità e più radicale: dentro una sola area il colore cambia dall'alto in basso, quindi il piolo non esiste più come valore unico. Si usa su **una o due serie**, e il controllo serve a vederlo.

**Quante serie regge la scala, misurato**: **sei pioli**, non cinque. Applicando lo stesso passo finché i due vincoli del gate tengono, il sesto passa in entrambe le modalità (chiaro `#2C2A26`, 14.08:1 dalla card; scuro `#474541`, 1.78:1) e il settimo esce da tutte e due — in chiaro finirebbe oltre il testo di pagina (19.41 contro 17.03), in scuro sparirebbe nella card (1.19:1). Se ne spediscono cinque perché `--chart-1..5` è la convenzione shadcn e ogni esempio del registry si aspetta quei nomi; sopra le cinque categorie un grafico non si legge comunque, e la risposta è raggruppare la coda in «Altro». Il margine di **un** piolo è scritto a verbale perché il giorno che servisse si sappia quanto è.

### Il totale della pila

Ultima richiesta di Francesco. Chiesto all'MCP prima di scrivere: shadcn ha `chart-bar-stacked` e `chart-bar-label`, ma **nessun esempio col totale della pila**. Non serve però niente di nuovo — un secondo `LabelList` appeso all'**ultima** serie, quella in cima, con un `valueAccessor` che somma la riga invece di leggerne un campo. Composizione, come `etichettaFetta`: `componenti-propri.json` resta vuoto.

Ha senso averlo perché impilando si guadagna il totale e si perde il confronto fra le serie: se il totale è la ragione per cui si impila, tanto vale scriverlo invece di stimarlo a occhio sull'asse.

**Un difetto trovato subito dopo, guardando**: in orizzontale il numero si scrive fuori dall'area di disegno e la cifra più lunga veniva tagliata dal bordo della card — «118» reso «11». Il margine destro ora dipende dall'orientazione e da se c'è qualcosa da scrivere. Secondo taglio di etichetta della sessione dopo il «214» della prima stesura: Recharts non allarga il margine da sé, e axe non se ne accorge.

### Quarto giro: la legenda che «non si accendeva», e le barre col segno

**«La legenda non si accende», segnalato tre volte — su linee, aree e barre — ed era sempre lo stesso.** Misurato: la legenda **c'era**, disegnata, coi nomi e le pastiglie giuste, a 26px dal fondo della card. Il punto è che la card finiva a **674px** in un viewport da 900, e il canvas di Storybook ne mostra meno: `layout: 'centered'` (globale) centra una card alta e ne spinge la metà inferiore fuori dall'area visibile.

Due correzioni, entrambe nel meta di `chart`: `layout: 'padded'`, che allinea in alto, e i contenitori cartesiani a **`h-72`** invece dell'`aspect-video` del preset — che su una card larga 672px dà un grafico alto 378. Dopo: la card va da 16 a 392px, ci sta in qualunque pannello.

Vale la pena tenerlo a mente oltre `chart`: **una story che non ci sta nel canvas sembra una story rotta**, e il difetto che si va a cercare non è quello che c'è.

**Barre con valori negativi** (`Scostamenti`, sull'esempio `chart-bar-negative`), con il segno detto dalla **posizione** e non dal colore — c'è la linea dello zero, e `coloreUnico` toglie il secondo colore quando non serve. I due colori **non** sono verde e rosso: un calo non è un errore, e gli stati semantici si tengono per ciò che è davvero un esito.

Tre trappole di Recharts, tutte sullo stesso rettangolo, tutte trovate guardando e misurando (`DECISIONI.md` §26.10): su una barra negativa `y` è il **fondo** e `height` è **negativa**, quindi l'etichetta finiva sopra la barra con qualunque `position`, gli angoli si arrotondavano sulla linea dello zero, e la legenda mostrava il nome con un quadratino vuoto. Rimedi: il testo si disegna dentro la `shape` con `min`/`max`, i raggi sono `[4,4,0,0]` per entrambi i segni, e un `fill` sul `Bar` che nessuna barra usa ma la legenda sì.

### Prossimi passi

**M2.9 — Gate di fase: audit del set.** Da portarci dentro, oltre a quanto già a registro: che l'imbracatura axe dichiari **quali popup apre davvero**; che le *incomplete* non si archivino in blocco (M2.8 ne ha trovata una vera dentro); e i due residui manuali che axe non vede, **D15** (tastiera del calendario) e la verifica dei selettori Recharts a ogni aggiornamento.

**In attesa di decisione di Francesco**: **D13** (l'item `tema-logo`).

---

## Correzione su M2.5 — il filo del `SidebarRail` prendeva il colore sbagliato

Segnalato da Francesco guardando la story `Primitive/Sidebar → Aperta`: passando col mouse sul bordo destro compare un cursore di ridimensionamento `<->` e il bordo verticale «si muove di qualche pixel per tornare in posizione». E, giustamente, il rilievo che sulla demo `blocks` di shadcn non succede — quindi il sospetto che il difetto fosse nostro.

**Misurato in Chromium su tutti e due, alla stessa larghezza.** Il `SidebarRail` è una striscia trasparente di 16px a cavallo del bordo (x 247→263, bordo a 256) che fa da bottone per chiudere e riaprire la colonna; in hover accende un `::after` di 2px a 255→257, cioè un pixel sul bordo e un pixel sulla pagina.

- **Il cursore è identico al loro**: `w-resize`, e le stringhe di classi del rail di `ui.shadcn.com/view/new-york-v4/sidebar-07` coincidono con le nostre parola per parola. Non è una nostra deriva. Che il cursore prometta un ridimensionamento che non esiste è una scelta di upstream, e resta.
- **Il bordo che si sposta è invece un difetto nostro, ed è una questione di token.** Il filo era `hover:after:bg-sidebar-border`, ma il bordo su cui poggia è un `border-r` nudo, cioè `--border`. Da shadcn i due valori **coincidono** — entrambi `rgb(229,229,229)` — quindi il filo si posa sul bordo e non si vede nascere nulla. Da noi no: la colonna è antracite in entrambe le modalità, quindi `--sidebar-border` vale `rgb(38,38,38)` (giusto, per i divisori *dentro* la colonna) mentre `--border` vale `rgb(221,219,219)`. Il filo scuro finiva **sulla pagina chiara**, e la colonna sembrava ingrassare di 2px e tornare indietro.

**Correzione, gradino 2 della scala 4bis — una stringa di classi**: `hover:after:bg-sidebar-border` → `hover:after:bg-border`. Il filo ora dichiara lo stesso token del bordo su cui si posa, quindi i due non possono più divergere in nessuna modalità: verificato con hover reale, filo e bordo entrambi `rgb(221,219,219)`. `npm run check` verde (0 errori), `registry:build` rilanciato.

**La lezione oltre il caso**: `--sidebar-border` è il bordo *interno* alla colonna, non il suo perimetro. Il perimetro confina con la pagina e va vestito coi token della pagina. È la stessa famiglia di errore delle due trappole in testa a `CLAUDE.md` — un token preso per il suo nome invece che per il suo posto — e qui era invisibile da leggere, perché da shadcn i due valori sono uguali e lo sbaglio non si manifesta.

**Resta aperto, deciso da Francesco**: se continuare a montare `<SidebarRail />` nel guscio. È ridondante — il grilletto in testata resta visibile anche a colonna chiusa, `Ctrl`/`Cmd`+`B` funziona, e il rail ha `tabIndex={-1}` quindi da tastiera non ci si arriva mai — ed è l'unico dei tre modi che mente sul cursore. Toglierlo è una scelta di composizione, non una modifica al componente: nessuna divergenza da riportare al prossimo aggiornamento di shadcn. Ricade su **M3.1** (`tassullo-app-shell`), che eredita questo guscio.

---

## M2.9 — Gate di fase: l'audit smette di essere una cosa da ricordarsi

**Il compito**: `parameters.a11y.test = 'error'`, axe-core in CI, e poi il residuo che axe non vede — tastiera, bersagli ≥44px in touch, resa in scuro. Criterio: `build-storybook` più i test a11y verdi, audit scritto, zero scostamenti non motivati.

**L'esito, in una riga**: **852 scansioni, 0 violazioni**, quattro gate in `npm run check`, CI scritta e dormiente. E tre trappole di misura trovate strada facendo, che valgono più del numero verde.

### Cosa è stato costruito

- **`@storybook/addon-vitest` + Vitest 4 + Playwright/Chromium**, con `vitest.config.ts` e `.storybook/vitest.setup.ts`. Browser vero, non jsdom: metà di ciò che axe misura — il contrasto su token `oklch()`, i popup che spostano il fuoco dentro `requestAnimationFrame` — in jsdom non esiste. L'imbracatura che M2.3 teneva in una cartella temporanea entra nel repo, ed è la differenza fra una misura ripetibile e una che si rifà a mano ogni volta.
- **`scripts/gate-a11y.ts`** (`npm run test:a11y`): quattro passate, `{chiaro, scuro} × {popup chiuso, aperto}`, 213 story ciascuna. Stampa la matrice e **dichiara quali popup apre davvero**, segnalando i componenti con popup che non lo dichiarano.
- **`.storybook/prove/apri.ts`** e le `play` sulle 11 primitive con popup, con l'alias `@/prove` in entrambi i config Vite. Fuori dal registry: nessun item spedisce le story, quindi l'imbracatura non arriva mai in un'app consumer.
- **`scripts/misura-bersagli.ts`** (`npm run misura:bersagli`): l'altezza dei bersagli in densità touch, che axe non guarda.
- **`.github/workflows/gate.yml`**: `npm ci`, Chromium, `npm run check`, `build-storybook`.

### Le tre trappole, perché ognuna dava un verde falso

**1. Il gate che tace.** Scritto nel modo ovvio — `setProjectAnnotations([preview, …])` importando il nostro `preview.tsx` — il gate **passava senza misurare niente**: il `combobox`, che M2.6 aveva misurato con 16 `button-name` *critical*, dava zero. Causa: axe non lo monta il preview, lo monta `addon-a11y` con annotazioni proprie; importando il nostro file si perdono quelle degli addon. Si prende invece la composizione intera dal modulo virtuale del builder. È il difetto peggiore che possa capitare a un gate — non rompe, tace — e l'ha smascherato solo il fatto di **sapere in anticipo un numero che doveva uscire**. Da cui una regola: un gate nuovo si prova su un difetto **noto**, mai solo su codice pulito.

**2. Il popup che non era aperto.** Senza `play`, tutte e 213 le story si misuravano a riposo: la passata era verde e i popup non li aveva guardati nessuno. È la lezione già pagata in M2.3 (8 → 12 violazioni appena l'imbracatura aprì anche il `select`), ripresentata identica al primo giro. Ora ogni componente con popup **dichiara** come si apre, e il gate gira in **tutti e due** gli stati — perché servono entrambi: le `aria-hidden-focus` si vedono solo aperto, il `button-name` di D14 solo chiuso, dato che a elenco aperto Base UI rende inerte il grilletto e axe lo salta.

**3. Lo strumento che chiudeva ciò che diceva di aprire.** `misura-bersagli` cliccava il grilletto prima di misurare. Ma **Storybook esegue le `play` anche nel canvas**: le story arrivavano già aperte, e il clic le **richiudeva**. Misurato: `aria-expanded` valeva `true` *prima* del clic e `false` dopo. Il rapporto perdeva le voci di menu proprio dei componenti che credeva d'aver aperto, mentre sui modali il clic finiva sull'overlay e per caso non faceva danno — cioè si contraddiceva da solo, dichiarando «Dialog 0/6 aperti» mentre misurava il bottone di chiusura *dentro* il dialogo aperto. Lo script ora **non tocca niente e aspetta**; le uniche due eccezioni sono `tooltip` e `hover-card`, che vogliono un puntatore vero perché il puntatore sintetico della `play` non li tiene aperti. Copertura finale: **47 popup su 48**, e il mancante è il `combobox` disabilitato, che un popup non ce l'ha per costruzione.

Il filo comune: **ognuna delle tre produceva un rapporto pulito**. Nessuna sarebbe stata trovata guardando se il gate «passa».

### Le due esenzioni, e perché sono strette

**`aria-hidden-focus`, spenta solo nella passata `aperto`.** Aprendo un popup modale Base UI rende inerte lo sfondo marcandolo `aria-hidden`; quello sfondo è la story, e contiene roba focalizzabile. axe chiama la violazione, e ha torto: quel ramo è nascosto apposta, dalla stessa libreria che gestisce il fuoco. A popup **chiuso** nessuno sfondo è inerte, quindi lì la regola resta armata — un `aria-hidden-focus` a riposo sarebbe nostro. Spegnerla in entrambe le passate l'avrebbe resa cieca per sempre.

**Rettifica a `CLAUDE.md`**: quella famiglia era data sui *guardiani del fuoco* (`data-base-ui-focus-guard`). Ricontato: le guardie ci sono ancora — **6 sul menu aperto** — ma ora portano `data-base-ui-inert` e **axe non le segnala più**. I nodi che restano sono quelli dello sfondo. Stessa natura, posto diverso: il registro cambia sotto i piedi, ed è la ragione per cui va rimisurato invece che ricopiato.

**`button-name` sul `combobox`, D14.** Si **escludono i due nodi** (`input-group-button`, `combobox-chip-remove`), non si spegne la regola: spegnerla avrebbe reso il gate cieco su qualsiasi bottone senza nome finito in quelle story, compreso uno nostro e nuovo. Costo residuo, scritto perché si sappia: dentro quei due slot un difetto *diverso* non verrebbe più visto.

### Il limite del gate, da conoscere

**L'addon fa fallire il test sulle sole `violations`.** Le `incomplete` le registra e non le asserisce **mai**, e non c'è parametro che lo cambi (letto nel sorgente). Restano quindi una lettura **a mano** — e non è un dettaglio: in M2.8 il difetto vero della sessione, il `#666` degli assi a 2.97:1 in scuro, stava dentro una *incomplete*. Il gate non copre quel caso. **Resta aperto e in carico alla prima sessione che tocchi il tema o i grafici.**

### I bersagli in touch — misurati, non dichiarati

1947 bersagli su 213 story, 47 popup aperti. Con un **controllo dello strumento** che è servito: il bottone di default in touch deve fare **48px**, e finché non si aspettava `document.fonts.ready` misurava 47.88 in una esecuzione e 47.48 in quella dopo — misure che cambiano da sole. Ora fa 48 tondo.

**Il criterio dei 44px (WCAG 2.5.5, AAA) non è rispettato da 31 tipi di bersaglio — ma nessuno è piccolo in entrambe le direzioni, e il set passa 2.5.8 (AA).** I più bassi, con la larghezza accanto perché il criterio è un'area:

| bersaglio | in touch | nota |
|---|---|---|
| `breadcrumb-link` | 18.56 × **48** | basso ma largo |
| `command-input`, `combobox-chip-input` | 18.56 × **416 / 239** | campi di testo, larghi |
| `switch` | 21 × 36 | è la variante `size="sm"`; il default è **27 × 48** |
| `checkbox`, `radio-group-item` | 24 × 24 | esattamente su AA |
| `tabs-trigger` | 26.42 × 234 | |
| voci di menu, `select-item`, `combobox-item` | **30.56** × 180÷469 | la famiglia più numerosa |
| `command-item` | 42 × 454 | |

> **Rettificata da M1.6 (2026-09-10).** La scala tipografica è cambiata e con essa le **interlinee**, che sono ciò da cui dipendono le altezze qui sopra — non `--spacing`, che M1.6 non tocca. I nuovi valori: `breadcrumb-link`, `command-input` e `combobox-chip-input` **20px** (erano 18.56); `tabs-trigger` **27.89** (26.42); le voci di menu, `select-item` e `combobox-item` **32** (30.56); `toggle` 41.56 × **81** (× 77). Il verdetto non cambia — **0 bersagli piccoli in entrambe le direzioni**, su 1988 misurati e 1541 sotto i 44px — e i più bassi si sono alzati, non abbassati.

**Rettifica di due numeri a registro**: la voce di menu era data a **36px** e la voce del combobox a **31px**. Misurate oggi con lo strumento controllato, sono **entrambe 30.56px** — sono lo stesso bersaglio, non due.

**Non si corregge niente, e la ragione non è la prudenza ma la misura.** Il rimedio noto per le voci — `py-1` → `py-2` — le porta a 48px in touch ma le alza **anche in densità normale** (25 → 33px): cambierebbe l'aspetto della scrivania per un criterio nato per il cantiere. E sono 30.56 × 324, cioè lunghe quanto tutto il menu.

### La rettifica in giornata: due dei cinque allarmi erano dello strumento, non del set

La prima stesura di questo blocco diceva **cinque bersagli sotto i 24px di AA**, e l'ho scritto a verbale prima di verificarlo. Andando a guardare *cosa fossero davvero*, due non esistevano:

- **`input` 22×22** è il campo `type="range"` che Base UI tiene **dietro** al pomello dello slider, perché funzioni da tastiera. Il bersaglio vero è il pomello: **24×24**.
- **`switch` 21×36** è la variante **`size="sm"`**, presente solo nella story «Taglie» perché serve a mostrare le taglie. Il default è **27×48**.

Il filtro scartava i campi nativi trasparenti o alti un pixel, ma non questo, che è visibile e sta sotto il pomello. Il segno che li distingue tutti: **i campi che genera la libreria non hanno classi**, quelli che vestiamo noi sì. Corretto, e il rapporto ora separa due segni — `!!` piccolo in **entrambe** le direzioni, `!` solo basso.

Restano tre campi di testo e un collegamento, bassi ma larghi 48÷416, coperti dall'eccezione di spaziatura. **Zero bersagli piccoli in entrambe le direzioni, nessuna modifica al set, nessuna decisione pendente.**

**La morale, che vale oltre il caso**: uno strumento nuovo produce anche **falsi positivi**, non solo falsi negativi, e i due si scoprono in modi opposti. Il falso negativo lo prende un difetto di cui si conosce il numero (è così che si è scoperto il gate che taceva); il falso positivo lo prende **solo andando a guardare** cosa sia ogni cosa segnalata. Un numero non verificato, messo a verbale, diventa una decisione da prendere che non esisteva.

### Verifiche eseguite

`npm run test:a11y` **852 scansioni / 4 passate / 0 violazioni** · `check:contrast` verde · `check:registry` **0 errori**, 52 avvisi (valori arbitrari *ereditati da shadcn*, preesistenti), 0 componenti nostri, 14 ri-stilati su forma intatta · `check:font` verde · `npm run build` verde · `npm run build-storybook` verde · `npm run lint` 3 avvisi preesistenti (`set-state-in-effect` su `use-mobile` e `carousel`, uno dei quali nell'originale upstream).

### Deciso in coda alla sessione, da Francesco

**D13 — il marchio nel registry: la (c), `mask-image` nel CSS del tema.** Il tracciato in data URI, sulla scia di `tema-font`. Due ragioni: `registry/componenti-propri.json` **resta vuoto** — la (a), il componente `<MarchioT />`, l'avrebbe rotto al primo componente nostro senza originale shadcn — e il colore **segue il testo** senza doppioni, mentre la (b) avrebbe voluto un file per fondo chiaro e uno per scuro, cioè due copie da tenere allineate. **La decisione è chiusa, l'item `tema-logo` è ancora da costruire.**

**Il menù utente che esce dallo schermo sul telefono** (segnalato da Francesco guardando `Primitive/Sidebar → Aperta` a 375px in touch): **non si sistemava da sé** con una larghezza massima. `DropdownMenuContent` aveva `side="right"` fisso, e su una colonna da 256px dentro uno schermo da 375 il pannello finisce tagliato. Corretto in `side={isMobile ? 'bottom' : 'right'}`, che è il pattern del blocco `sidebar-07` di shadcn; `isMobile` lo espone già `useSidebar()` e la `Testata` lo usa due righe più su per i tooltip. **È composizione, non componente**: nessuna divergenza da riportare, semmai un allineamento.

### Resta aperto

1. **D15** (tastiera del calendario) resta chiusa «si accetta», e il gate **non la vede**: zero violazioni su una griglia non navigabile. È il residuo manuale, ed è ora scritto in `CLAUDE.md`.
2. **Le `incomplete`**, che il gate non asserisce: se valga la pena costruire una seconda misura o se restino lettura a mano.
3. **L'item `tema-logo`**, ora che D13 è decisa.

### Prossimi passi

FASE 3, **M3.1 `tassullo-app-shell`**, che eredita anche la coda di M2.5 (se montare `<SidebarRail />`) e prende la prima misura di **D10**. Prima, o dentro, va costruito l'item **`tema-logo`** deciso qui sopra.

---

## M3.1 — Il guscio, e il marchio che smette di essere incollato in una story

**Il compito**: `tassullo-app-shell`, il sostituto di `Sidebar.tsx` + `Sidebar.css` di Anagrafe. Criterio: shell resa a 1440px e a 375px **in tutte e due le densità** — la matrice è viewport × densità, non viewport soltanto — e la **prima misura di D10**. In carico anche **D13**, l'item `tema-logo`, deciso da Francesco in coda a M2.9 e mai costruito.

**L'esito, in una riga**: guscio in piedi, quattro celle misurate, cinque gate verdi (868 scansioni / 0 violazioni), e una misura di D10 che **ribalta l'assunzione del piano**.

---

### D13 — il marchio è una classe del tema, non un componente

`registry/tassullo/theme/tassullo-logo.css`, item `tema-logo`, dichiarato fra le `registryDependencies` di `tema`: un solo `add @tassullo/tema` porta token, carattere **e** marchio.

```html
<span class="marchio-t size-6" aria-hidden></span>
```

Il tracciato fa da **maschera** (`mask-image` in data URI) e il colore lo dà `background-color: currentColor` — quindi il marchio segue il testo che lo circonda, e la stessa classe è giusta sulla sidebar antracite, su una pagina chiara e su una scura. Verificato in Chromium: `background-color` risolto a `oklch(0.9455 0.0027 106.45)`, cioè il token scritto sul `<span>`, in entrambe le modalità.

Il ragionamento completo — le due strade scartate, perché una maschera e non un `background-image`, perché percent-encoding e non base64 — è in `docs/DECISIONI.md` §28. Le tre cose da sapere qui:

- **La sorgente non viaggia**: `theme/marchio/tassullo-t.svg` è il file da cui si genera, come i `.woff2` in `theme/fonts/`. Due differenze dall'originale di Anagrafe, e nessuna è cosmetica: **niente `fill`** (di una maschera conta l'alfa, non il colore — e sparisce l'esadecimale, che la regola 3 vieta anche dentro un SVG) e **`viewBox` al posto di `width`/`height`** (senza, la maschera non saprebbe scalare).
- **`@layer components`, non regole senza layer**, così le utility Tailwind vincono: `size-*` sovrascrive l'altezza predefinita di `1em` e `text-*` cambia il colore. Senza layer sarebbe il contrario, cioè il contrario di ciò che serve.
- **Il file è generato e sotto gate.** `npm run logo:build` lo rigenera, `npm run check:logo` fallisce se diverge, ed è il **quinto** gate di `npm run check`. Provato su un difetto vero — un carattere aggiunto in coda — esce con codice 1. La ragione è la stessa del carattere: **un data URI non è ispezionabile a occhio**, quindi una divergenza resterebbe invisibile per sempre.

**E il tracciato è uscito da `sidebar.stories.tsx`.** Era esattamente ciò che D13 chiamava «accettabile per la style guide, la deriva se ogni app se lo ricopiasse»: ora anche la story usa la classe.

**Il marchio esteso: non esiste, e non se ne inventa uno.** D13 chiedeva di chiudere anche quello. Il file non c'è — né in Anagrafe né nel v1 — perché in produzione il marchio esteso è **composto**: la T più il nome dell'applicativo in Inter semibold, che è la forma che il guscio monta in testata. Se un logotipo vero arriverà, è **una riga in più** nell'elenco `MARCHI` dello script: la classe comune e il gate ci sono già. Resta l'eccezione già dichiarata nel v1 — favicon e icona PWA, che un browser serve **prima** del CSS e che quindi non possono leggere né classi né variabili del tema.

---

### Il guscio

`registry/tassullo/blocks/app-shell.tsx`, item `tassullo-app-shell`. Una chiamata sola attorno a tutta l'app; le voci di navigazione sono un **dato**, non JSX, e i collegamenti si passano con `render` — un `<NavLink>`, un `<Link>`, o niente e la voce resta un bottone. Il guscio non sa quali rotte esistano: `attiva` la calcola l'app.

Porta con sé le **sei correzioni misurate in M2.5**, che chi copiasse `sidebar-07` a mano si porterebbe dietro come difetti — e sono tutte e sei **mute**: nessun errore, solo un'interfaccia che si comporta male. Il `TooltipProvider` alla radice; il tooltip **non passato affatto** sotto la soglia mobile (la radice resta montata, si apre col fuoco e si prende il primo `Esc`); `justify-center` sui bottoni `size="lg"` nel rail; il testo spento con `group-data-[collapsible=icon]:hidden`; l'`aria-label` su testata e piede; il menù utente che si apre in basso sul telefono. Più le **larghezze della colonna riscritte sulla scala della densità**, che è l'unica eccezione accertata di M1.4 e che così **nessuna app deve ricopiarsi**.

Due libertà in più rispetto alla story di M2.5, e vengono dal codice vero di Anagrafe: **voci disabilitate** («Famiglie EPD», che lì è un `<span>` con `title="In arrivo"`) e **voci senza icona** — Anagrafe non ne ha nessuna. Senza icone il rail sarebbe una fila di quadrati vuoti, quindi c'è `collassa="fuori"`: la colonna sparisce invece di ridursi. `disabilitata` si esprime con `aria-disabled` e non con `disabled`, perché la voce può essere un `<a>` e su un ancoraggio `disabled` non vuol dire niente.

**Il `SidebarRail` non è montato**, ed è la coda di M2.5 che questo task ereditava. Tre misure, tutte da lì: è **ridondante** (il grilletto in barra resta visibile a colonna chiusa e `Ctrl`/`Cmd`+`B` funziona sempre), è **irraggiungibile da tastiera** (`tabIndex={-1}`), e **mente sul cursore** — mostra `w-resize`, cioè promette un ridimensionamento che non esiste. È il solo dei tre modi di aprire la colonna che abbia tutti e tre i difetti. È composizione, non componente: `SidebarRail` resta esportato da `sidebar.tsx`, rimetterlo è una riga. **Se Francesco lo rivuole, si dica.**

---

### La prima misura di D10, e cosa ribalta

Quattro celle, in Chromium sullo Storybook costruito. I caratteri per riga si **misurano** — una stringa di 100 caratteri a `text-base` dentro l'area di contenuto vera — non si stimano.

| cella | colonna | fascia | padding | larghezza utile | caratteri/riga |
|---|---|---|---|---|---|
| 1440 × normale | 256 | 48 | 16 | **1148** | 165 |
| 1440 × touch | 384 | 72 | 24 | **1008** | 136 |
| 375 × normale | — | 48 | 16 | **343** | 49 |
| 375 × touch | — | 72 | 24 | **327** | 44 |

**`PIANO.md` §M3.1 dà per scontato che a mangiare la larghezza sia il padding di pagina** — «sono quelle utility, non le altezze dei controlli». A 375px **non è così**: sotto i 768px la colonna esce dal DOM, quindi il padding è l'unica cosa che toglie larghezza, e ne toglie **16px in tutto**. A perdere il 10,2% di testo per riga non è la larghezza (−4,7%) ma il **corpo**, che passa da 14 a 15px: le due leve di M1.4 tirano nello stesso verso e si sommano. Il rimedio che il piano prevedeva — un `--space-page` che non derivi da `--spacing` — varrebbe **meno della metà** di ciò che si perde.

**E sulla scrivania il colpevole è un terzo ancora.** A 1440 la larghezza utile cala di 140px, e **128 di quei 140 sono la colonna** (256 → 384). Il contenuto scende sotto `--container-page`: 1056 contro 1180, cioè **in touch, a 1440px, la larghezza massima di pagina non è più il vincolo** — lo è la colonna. Chi progetterà una tabella larga in touch (M3.3) deve saperlo.

Il verdetto resta di **M4.2**, su una pagina vera. Questa è la misura, non la decisione.

**Un quinto rilievo, trovato guardando invece che misurando.** A 375px in **touch** il percorso della fascia andava **a capo dentro la barra**; in densità normale, alla stessa larghezza, ci stava. È la stessa cella di D10 vista nella fascia invece che nel contenuto. Il rimedio sta nell'app — i livelli intermedi spariscono sotto i 768px, come nel `sidebar-07` di shadcn — e il guscio fa la sua parte con `min-w-0` sullo slot della fascia: senza, la larghezza minima di un elemento flex è quella del suo contenuto, e il percorso spingerebbe le azioni fuori dallo schermo. Con `min-w-0` a cedere è il percorso, che è la parte che l'app sa come far cedere.

---

### Due gate che guardavano una cartella sola

**`check:registry` non vedeva i blocchi.** Guardava solo `registry/tassullo/ui/`: un valore arbitrario o un esadecimale dentro un blocco non lo avrebbe visto nessuno, e i blocchi saranno **undici**. Ora scandisce anche `blocks/`, con la **sola regola 3** — niente hex, niente arbitrari. Non chiede loro un originale shadcn né una riga in `componenti-propri.json`: un blocco è per costruzione ciò che shadcn non copre, ed è la ragione per cui la FASE 3 esiste. Provato su un difetto vero (`h-[37px]`, `bg-[#F4AC3D]` infilati nel guscio): **3 errori**, poi ripristinato.

**`gate-a11y` cercava le dichiarazioni di popup solo in `ui/`.** Il guscio un popup ce l'ha — il menù utente — e sarebbe passato per «senza popup», che è esattamente il difetto contro cui M2.9 ha costruito quell'elenco. Ora legge `ui/` e `blocks/`, e `app-shell` è in `CON_POPUP`.

---

### Le tre cose che il gate ha preso, e una che ha preso il gate

**1. Un `<main>` dentro un `<main>`.** `SidebarInset` **è** un `<main>`: il mio contenitore di contenuto era un secondo `main` annidato, e dava tre violazioni per story — `landmark-unique`, `landmark-no-duplicate-main`, `landmark-main-is-top-level`, 4 in tutto alla prima passata. Corretto in `div`. La fascia in alto resta **dentro** il `main`, che è la forma di `sidebar-07`: è la loro, non una nostra deriva.

**2. Lo `data-slot` del grilletto, che si guarda e non si deduce.** Avevo scritto il selettore della `play` per analogia col `combobox`, dove `ComboboxTrigger` rende attraverso `InputGroupButton` e nel DOM vince `input-group-button`. Qui la composizione è la stessa — `DropdownMenuTrigger` che rende attraverso `SidebarMenuButton` — e **finisce all'opposto**: vince `dropdown-menu-trigger`. Il gate l'ha preso al primo colpo e per come deve, perché `grilletto()` **lancia** quando il selettore non trova niente invece di lasciar passare la story per «senza popup». Due composizioni che si somigliano e finiscono in modo diverso: è la ragione per cui `apri.ts` vuole un selettore e non un nome di slot.

**3. Il percorso che andava a capo**, di cui sopra — e quello non l'ha preso nessun gate: axe non lo vede, `misura:bersagli` nemmeno. L'ha preso uno **screenshot guardato**.

---

### Verifiche eseguite

`npm run check` verde su **cinque** gate: `check:contrast` ✔ · `check:registry` 0 errori, 52 avvisi (arbitrari *ereditati da shadcn*, preesistenti), 1 blocco Tassullo, 0 componenti nostri · `check:font` ✔ · `check:logo` ✔ · `test:a11y` **868 scansioni / 4 passate / 0 violazioni**.
`npm run build` ✔ · `npm run build-storybook` ✔ · `npm run lint` 3 avvisi preesistenti · `shadcn registry validate` ✔ (55 item) · `registry:build` rilanciato.
`npm run misura:bersagli`: **1985 bersagli su 217 story, 47 popup aperti, 31 tipi sotto i 44px, 0 piccoli in entrambe le direzioni** — invariato rispetto a M2.9, il guscio non introduce bersagli nuovi (il suo `sidebar-trigger` a 40.88 × 41px era già a registro).

Misure a mano, in Chromium sullo Storybook costruito: guscio in **quattro celle** viewport × densità, più rail collassato in tutte e due le densità, modalità scura, e la navigazione vera di Anagrafe senza icone. Nel rail il marchio è **centrato con le icone delle voci** — 24 contro 24 in normale, 36 contro 36 in touch: la correzione dei 6px fuori asse di M2.5 tiene anche alla densità che allora non era stata provata.

---

### Resta aperto

1. **Il `SidebarRail`**: non è montato, per tre misure. Se Francesco lo rivuole, è una riga.
2. **Le `incomplete`** che il gate non asserisce (limite noto da M2.9): il guscio non aggiunge coppie di colori nuove — riusa primitive già misurate e il marchio è decorativo — ma la lettura a mano resta dovuta alla prima sessione che tocchi il tema.
3. **D10**, verdetto in M4.2, ora con quattro numeri sotto invece che con un'assunzione.

### Prossimi passi

**M3.2 — `page-header`**: titolo, breadcrumb, slot azioni. Da portarci dentro: il percorso che a 375px in touch va a capo — qui il rimedio l'ha messo la story, e `page-header` è il posto dove diventa la forma unica per tutte le app.

---

## Coda di M3.1 — il giro di revisione con Francesco (2026-09-10)

Cinque rilievi guardando la story, tutti accolti. Tre cambiano il blocco, due aprono decisioni.

**1. L'azione primaria di pagina ha una grammatica, non un colore scelto a occhio.** Non si sceglie la variante pagina per pagina: si sceglie il **ruolo**. Una sola azione primaria per pagina, variante `default` (l'arancio del brand), **sempre con icona**; le altre `outline`; le distruttive `destructive` e mai come primaria. La parte che conta è «una sola»: due bottoni arancioni nella stessa intestazione non sono due azioni importanti, sono zero. Anagrafe lo rispetta già (`Prodotti.tsx`: «Sistema da BC» secondario, «Nuovo prodotto» primario). La novità rispetto al v1 è l'icona.

**Taglia normale, non `sm` come nel v1**, e la ragione è misurata: `sm` in touch fa **42px**, sotto i 44 di WCAG e sotto i 48 che il v1 dà a `.btn` in cantiere. La normale fa **32px in normale e 48 in touch** — 32, non 36 come avevo scritto prima di misurare. Contrasto del primario **9.49:1** in entrambe le modalità.

**2. Via il titolo di pagina.** «Prodotti» compariva **tre volte in 80px**: voce attiva in sidebar, ultimo livello del breadcrumb, `<h1>`. È anche la forma di `dashboard-01` di shadcn, che un titolo di pagina non ce l'ha. Tolto: la fascia diventa l'unica riga di intestazione — breadcrumb a sinistra, azioni a destra — e ogni pagina guadagna ~50px di altezza utile.

**Conseguenza per M3.2, e non è piccola.** Se le azioni stanno nella fascia, la fascia la disegna il guscio ma il contenuto è **della pagina**. Con `<AppShell>` montato una volta sola attorno all'`<Outlet />` la pagina non può passargli delle prop: `page-header` dovrà offrire un **contesto** (o un portale) con cui una pagina dichiara percorso e azioni. shadcn non ha il problema perché i suoi blocchi rendono il guscio dentro ogni pagina; noi no.

**Effetto collaterale da tenere d'occhio**: `--text-title` non ha più **nessun consumatore** nel codice spedito. Vive solo nelle story della style guide.

**3. L'utente: nome e cognome sul bottone, email nel menù.** È la forma di `sidebar-07` ed è la mappatura dell'account Microsoft (`givenName`, `surname`, `mail`). `cognome` è un campo a sé, e non per pignoleria: **è il cognome a cadere** quando lo spazio manca, non una parte di parola — `truncate` sull'intera stringa darebbe «Massimiliano Bert…», che non è un nome. Risolto in CSS, senza misurare niente: due elementi, `truncate` solo sul secondo.

Misurato su tre nomi × due scale × due densità: il nome di battesimo non si accorcia **mai**; il cognome si accorcia con «Massimiliano Bertagnolli» alla scala shadcn e con «Pierfrancesco Dallabrida Zambotti» a tutte e due. Dichiarato a Francesco lo scarto dalla sua regola letterale («se non ci stanno entrambi, solo nome»): qui il cognome si accorcia invece di sparire, e la sparizione netta costerebbe una misura in JavaScript dentro il blocco.

**4. I caratteri sono piccoli, ed è sistematico** — vedi `docs/DECISIONI.md` §30 e la decisione **D16**.

**5. Il banco tipografico.** Per decidere serviva provare, non guardare screenshot. Costruita una pagina con **i componenti veri**: DOM catturato dalle story, CSS compilato di Storybook e Inter inlinati, nove campioni, tre scale commutabili dal vivo più i sette gradini modificabili, densità e modalità. I caratteri per riga li **misura** con una stringa di 100 caratteri dentro la larghezza utile vera di uno schermo da 375px.

Un difetto trovato e corretto lì dentro, e la causa vale oltre il caso: la colonna della sidebar è `position: fixed`, e dentro un iframe alto quanto tutto il contenuto «fisso» vuol dire **rispetto all'intero documento** — la colonna si allungava su tutte e nove le sezioni e ci si sedeva sopra. Si contiene dando al riquadro un `transform`, che lo rende il blocco di riferimento dei figli fissi. Non era un difetto del guscio: era della vetrina.

---

## M1.6 — Riallineamento della scala tipografica (2026-09-10)

**Attuata D16.** La scala in vigore è `xs 12 / sm 13 / base 15 / lg 16 / xl 19 / 2xl 27 / 3xl 31`, e in touch `13 / 14 / 16 / 17 / 21 / 29 / 33`. **Zero gradini nostri**: `--text-md` è fuso in `sm`, `--text-title` è diventato `2xl`, e `3xl` è tarato accanto perché la FASE 4 non vada a pescare un gradino che la densità non muove. Ogni nome che un componente possa scrivere è ora un nome di Tailwind, e ogni nome di Tailwind che il tema tara scala con la densità.

Fuori dall'ordine delle fasi di proposito: è una modifica al **tema**, cioè l'oggetto della FASE 1.

### Le tre modifiche

**1. La costante, e una fonte in meno.** In `scripts/hex-to-oklch.ts` la tupla era `[nome, normale, touch, nota]`, coi valori touch **scritti a mano** mentre il commento due righe sopra dichiarava che erano `×1.08` arrotondato. Coincidevano tutti e sette, ma erano due fonti per un dato solo — e due fonti divergono al primo ritocco. Ora la tupla è `[nome, normale, nota]` e i valori touch li **deriva** `inTouch()`. Era l'unico dato del tema in quello stato.

**2. `text-md` → `text-sm`, `text-title` → `text-2xl`.** Ventuno occorrenze nel codice vivo, trovate col `grep` e non con gli occhi, perché **nessuna delle due è un errore di compilazione**: sono utility che Tailwind non conosce, non emettono niente, e il testo eredita la misura del genitore. Due nei componenti spediti (`button.tsx`, `button-group.tsx`), il resto fra story e workbench.

**3. Le pagine che documentano la scala.** `Tipografia`, `Carattere` e `Densità` elencano i gradini uno per uno: senza riscriverle mentirebbero. Tolta anche la nota «chip, breadcrumb, testi densi» di `md`, che era **già falsa** prima di questa sessione — il breadcrumb usa `text-sm`, i chip del combobox pure.

### Il gate nuovo, e la prova che sa fallire

`check:registry` controlla ora anche i **corpi**, su `ui/` e su `blocks/`: ogni `text-*` o è un gradino che il tema tara, o è un colore, o è una delle utility `text-` che corpo non sono (allineamento, a capo, troncamento). Tutto il resto è errore. Distingue i due difetti perché hanno rimedi opposti: `text-4xl` **esiste** e rende, ma non scala con la densità (i blocchi `[data-density]` ridichiarano i soli gradini nostri); `text-md` non esiste affatto.

Provato su difetti veri, mai su codice pulito (§27.1): piantato `text-4xl` in `badge.tsx` → uscita **1**; cambiato in `text-md` → uscita **1**; ripristinato → **0**. E la prova migliore è arrivata da sé: girando sui `button.tsx` e `button-group.tsx` **pre-M1.6**, il gate ha segnalato **esattamente i due `text-md` veri**, cioè il difetto che questo task esisteva per chiudere.

Zero falsi positivi su tutto il registry al primo colpo — che era la condizione, perché un gate che grida al lupo si smette di leggere.

### Le misure

**Screenshot prima/dopo**, 217 story × 2 densità, con lo Storybook costruito e i caratteri aspettati (`document.fonts.ready`): **207 story cambiate su 217** in normale, 209 in touch. I confronti affiancati di guscio, tabella, form e bottoni sono in `docs/img/M1.6/`.

**Il bottone non si è mosso di un pixel**, ed era il controllo più veloce che la modifica fosse andata come previsto: `text-md` valeva 13, `text-sm` vale 13. Guardato negli scatti affiancati, le larghezze delle sei varianti coincidono.

**D10 rimisurata — e il righello tarato prima di fidarsene.** Rimisurare la scala *vecchia* con lo strumento nuovo dà 166 / 137 / 50 / 44 contro i 165 / 136 / 49 / 44 di M3.1: la stessa misura a meno di un carattere, che è la differenza fra due stringhe campione. Senza questa taratura non si saprebbe se lo scarto è la scala o il metro.

| cella | larghezza utile | caratteri per riga |
|---|---|---|
| 1440 × normale | 1148 *(invariata)* | **156** *(erano 165)* |
| 1440 × touch | 1008 *(invariata)* | **129** *(136)* |
| 375 × normale | 343 *(invariata)* | **47** *(49)* |
| 375 × touch | 327 *(invariata)* | **42** *(44)* |

Le larghezze **non si muovono**, e non è una sorpresa: vengono da `--spacing`, che M1.6 non tocca. Nella cella stretta la scala nuova costa **2 caratteri per riga**, ed è il prezzo che D16 aveva messo in conto scegliendo il «+1» invece dell'allineamento pieno a shadcn, che ne sarebbe costati 5 (44 → ~39). La stima su cui è stata presa la decisione regge alla misura.

**Bersagli**: 1988 su 217 story, 1541 sotto i 44px, 31 tipi, **0 piccoli in entrambe le direzioni** — invariato. I più bassi si sono **alzati**, perché a muoversi è l'interlinea e non `--spacing`: campi di testo e collegamento del breadcrumb da 18.56 a **20px**, `tabs-trigger` da 26.42 a **27.89**, le voci di menu da 30.56 a **32**.

**I cinque gate verdi**, `test:a11y` a **868 scansioni / 0 violazioni**, invariato.

### La fascia a 375px, guardata perché è lì che il testo grande fa danno

A 375px in **touch** la fascia sborda di **38px**: il percorso si taglia e le azioni escono dallo schermo. È brutto, e non è nuovo — **misurato 38px anche sull'albero pre-M1.6**, ricostruito apposta per confrontare. M1.6 non l'ha peggiorata di un pixel.

La ragione è la proprietà stessa di questa sessione: la larghezza minima della fascia la dettano i **due bottoni**, e i bottoni non si sono mossi (13px prima come dopo). A crescere è il **percorso**, che però è l'elemento flessibile — il guscio gli dà `min-w-0` apposta perché a cedere sia lui e non le azioni — quindi assorbe la crescita troncandosi, e il totale non cambia. Lo sbordo viene da `--spacing`, non dal corpo.

È il quinto rilievo di §29 visto un mese dopo e con un numero attaccato. Il rimedio resta dove stava: **nell'app**, coi livelli intermedi del breadcrumb che spariscono sotto i 768px, come nel `sidebar-07` di shadcn. In densità **normale** lo sbordo è **0**.

### Le `incomplete`, che il gate non asserisce mai

L'avvertimento del piano meritava di essere preso sul serio: axe usa una soglia più bassa per il **testo grande** (3:1 sopra 18.66px in grassetto, 24px in tondo), quindi ingrandendo il testo una coppia al limite può smettere di essere segnalata **senza essere stata aggiustata**.

Sulle *violations* l'argomento si chiude da sé: erano **0** prima, e una soglia più larga può solo nascondere ciò che falliva. Non falliva niente.

Sulle *incomplete* il gate non dice nulla — le registra e non le asserisce mai — quindi sono state **contate a mano**, e con lo stesso strumento su entrambi gli alberi (ricostruendo lo Storybook pre-M1.6 apposta: il conto di CLAUDE.md, «6 su Kbd», viene da un'imbracatura diversa e non era confrontabile). Esito: **411 nodi prima, 412 dopo**. Nessuna sparita — una **comparsa**, che è la direzione innocua.

Quella comparsa è `color-contrast` su `Primitive/Popover → Quattro lati`, e non è una coppia di colori: axe la marca `elmPartiallyObscuring`, «non riesco a determinare il fondo perché l'elemento ne sovrappone altri». Nella story ci sono quattro popover aperti insieme; il testo a 13px invece di 12 li fa crescere quel tanto che basta perché due si tocchino. È geometria della vetrina, non un difetto del componente — e la coppia `text-muted-foreground` su `popover` `check:contrast` la verifica per conto suo.

### Uno scostamento dal piano

Il piano si aspettava che il conto di `check:registry` **scendesse**, perché `button` e `button-group` tornano a scrivere `text-sm` come l'originale. **Non è sceso**: 8 e 4 stringhe ri-stilate prima, 8 e 4 dopo, 14 componenti prima e dopo. Il gate conta le **stringhe** di classi divergenti, non le classi, e quelle due stringhe divergono ancora sul **raggio** — `rounded-md` (6px) contro `rounded-lg` (10px) — che è identità di marchio e resta.

La sostanza di D16 regge, e anzi diventa vera alla lettera: su quelle due stringhe **l'unica differenza superstite è il raggio**. Ciò che non regge è la previsione numerica, annotata perché un numero atteso e non arrivato, lasciato correre, la sessione dopo si legge come un guasto.

### Un rilievo di numerazione, per Francesco

In `CHECKLIST.md` ci sono **due decisioni chiamate D16**: la scala tipografica (questa) e la scelta del set d'icone, entrambe chiuse il 2026-09-10. Non ho rinumerato — battezzare una decisione è una scelta, non una pulizia — ma «D16» da oggi è ambiguo in ogni riferimento futuro.

### I numeri corretti altrove

- `docs/DECISIONI.md` **§29** — tabella di D10 coi valori nuovi accanto ai vecchi, più la taratura del righello.
- `docs/DECISIONI.md` **§30** — riscritta **al presente**: descrive il tema com'è, non una proposta.
- `docs/DECISIONI.md` **§6** — la leva della densità, coi passi della scala nuova e la derivazione.
- `docs/DECISIONI.md` **§27.6** e `WORKLOG.md` **M2.9** — la tabella dei bersagli, rettificata in nota invece che riscritta: il diario resta ciò che fu misurato allora.
- `CLAUDE.md` **§Regole 5**, `§Comandi` (`check:registry`, `misura:bersagli`) e `CHECKLIST.md` righe **M1.6**, **D16**, **D10**.

### Prossimi passi

Il verdetto di **D10** resta di **M4.2**, su una pagina vera, e parte da una cella un po' più stretta di prima: 42 caratteri per riga a 375px in touch. La riserva `3xl` è tarata e **non la usa ancora nessuno**: i numeroni del cruscotto sono M4.4.

### Coda di M1.6 — due difetti segnalati da Francesco, e nessuno dei due nasce qui (2026-09-10)

Guardando la style guide dopo il riallineamento, Francesco ha segnalato **`Primitive/Chart → Barre`** col totale «120» tagliato in cima e **`Primitive/Resizable → Verticale`** ridotta a una riga. Prima domanda, e va fatta sempre: li ha causati M1.6? **No, nessuno dei due** — misurato ricostruendo lo Storybook pre-M1.6 apposta invece di dedurlo.

**1. L'etichetta del grafico era già tagliata, M1.6 l'ha peggiorata di 1px.** Il totale della pila si scrive **fuori** dall'area di disegno, a `offset: 12` sopra la barra, ma il margine in cima era `top: 20` — e la barra più alta arriva al tetto dell'asse. Serve `offset` **più il corpo del testo**, ed è la parte che sfugge: il corpo cresce con la densità. Misurato sulla distanza dell'etichetta dal bordo dell'SVG, negativa quando esce:

| | pre-M1.6 (`text-xs` 11px) | dopo M1.6 (12px) | corretto |
|---|---|---|---|
| «120» | **−3px** | **−4px** | **+12px** |
| «118» | +0.5px | −0.5px | +12px |

Il margine in cima diventa **36** quando le etichette vanno davvero in cima — cioè `!orizzontali && ((etichette && !impilato) || (impilato && totale))` — e resta 20 altrimenti. È lo stesso rimedio, con la stessa forma condizionale, che il file già applicava al margine **destro** per le barre orizzontali: lì il difetto era stato visto («118» reso «11»), in cima no. Verificato a **+11px o più** in tutte e tre le combinazioni che portano etichette in alto, in **entrambe** le densità (in touch `text-xs` fa 13px, ed è il caso stretto).

**2. `Resizable` era rotta da prima, e in un modo che nascondeva sé stesso.** `react-resizable-panels` scrive `height: 100%` **inline** sulla radice del gruppo, e uno stile inline batte qualunque classe: `h-72` sul `ResizablePanelGroup` non faceva niente. Senza un'altezza vera sopra, quel `100%` si risolve su un genitore alto `auto` e il gruppo prende l'altezza del **contenuto**.

Da cui due sintomi diversi per una causa sola, ed è la parte istruttiva. `Predefinito` e `TrePannelli` contengono paragrafi, cioè hanno un'altezza intrinseca: rendevano **94px invece di 256** e sembravano soltanto «un po' strette» — nessuno le avrebbe chiamate rotte. `Verticale` contiene una `ScrollArea` in `h-full`, cioè una **percentuale di un genitore senza altezza**: collassava a **3px**, ed è la sola che si vedesse. Il difetto grosso era nelle due che sembravano sane.

Rimedio: **l'altezza al contenitore, il gruppo in `h-full` dentro** — che è quello che shadcn fa nei propri esempi senza spiegarlo. Nessun componente toccato: `resizable.tsx` resta identico all'originale, era la *composizione* a essere sbagliata, e il rilievo sta ora nel commento della story perché lo `split-view` di **M3.9** si comporrà così. Misurato dopo: 256 / 288 / 256 in normale, 384 / 432 / 384 in touch — le altezze derivano da `--spacing`, quindi scalano, ed è corretto.

**Un avvertimento che vale oltre il caso**: finché la story era collassata a 3px, **axe la scansionava e non trovava niente**, perché non c'era niente da scansionare. Le 868 scansioni restano 0 violazioni ora che i pannelli si vedono davvero — ma il rischio era reale, ed è lo stesso di M2.3 col popup che non si apriva: *una story che non rende non è una story senza difetti*. Il gate non sa distinguere i due casi; `misura:bersagli` nemmeno (1988 bersagli, invariati). Se ne accorge solo chi guarda.

Cinque gate verdi, `lint` pulito. Scatti in `docs/img/M1.6/coda-*.png`.

### Coda di M1.6 (2) — il guscio non ci stava sui tablet in touch (2026-09-10)

Segnalato da Francesco («serve lavorare anche Blocchi > App shell»), trovato misurando larghezza per larghezza invece che a occhio. **In densità touch il guscio sbordava in orizzontale per tutta la fascia dei tablet, da 768 a 966px** — 199px al peggio, con le azioni di pagina fuori schermo e il testo tagliato. In densità normale non succedeva a nessuna larghezza.

**Il meccanismo, e sono due soglie che non si parlano.** In touch la colonna vale 384px (l'override deliberato di M2.5) e le azioni con l'etichetta per esteso ne valgono 310 che **non si stringono mai** — un bottone è `whitespace-nowrap`. Il pavimento del guscio era così **967px**. Ma la soglia che toglie la colonna dal DOM è **768**, e non sa niente della densità: sotto i 768 la colonna sparisce e tutto va bene, sopra i 967 c'è posto, e in mezzo restava una banda di 200px in cui il guscio non ci stava e basta.

Due controprove che hanno indicato il colpevole prima di toccare qualsiasi cosa: `Collassato` (rail da 72px) non sbordava, e `SenzaIcone` nemmeno — perché **non ha azioni in fascia**. Sbordavano solo le forme che le hanno, cioè quelle che useranno le app vere.

**Non è una regressione di M1.6**: pre-M1.6 sbordava di **191px**, dopo 199. La scala nuova ci ha messo 8px, non il problema.

**Rimedio, scelto da Francesco fra tre**: in touch, sotto i 1024, le etichette delle azioni passano a `sr-only` — non `hidden`, così il **nome accessibile del bottone resta** e cambia solo che non si vede. Il guscio non possiede i bottoni («espone slot vuoti»), quindi non può riscriverli: espone il *meccanismo* e chiede all'app un patto, `data-etichetta` sull'etichetta. Da cui una regola nuova nella grammatica delle azioni: **ogni azione in fascia porta un'icona**. Non è un vezzo — un bottone che perde l'etichetta e non ha un'icona è un rettangolo vuoto. La story si adegua: «Sistema da BC», che era senza, prende `RefreshCwIcon`.

**Il residuo, e la coincidenza di soglie che lo produceva.** Ridotte le azioni, restavano **13px** a 768 esatti. Non era il contenuto (min-content della card: 116px): era il **percorso**, che non scende sotto 146. La story faceva già l'idioma di `sidebar-07` — `hidden md:block` sui livelli intermedi — ma **`md` è 768, cioè esattamente la larghezza alla quale la colonna torna nel DOM**: a 768 i livelli intermedi ricomparivano (+146) nello stesso istante in cui ricompariva la colonna (+384 in touch), e i due effetti si sommavano sulla larghezza peggiore. In touch i livelli intermedi restano ora nascosti fino a `lg`, che è **la stessa soglia** delle etichette: sotto i 1024 in touch la fascia è tutta in forma compatta, sopra è tutta per esteso. Una soglia sola, non due.

**Esito: sbordo 0 a ogni larghezza provata** — 375, 600, 767, 768, 800, 900, 1000, 1024, 1180, 1440 — in **entrambe** le densità. Cinque gate verdi, 868 scansioni / 0 violazioni, bersagli invariati (1988, 0 piccoli in entrambe le direzioni), `lint` pulito.

**Una trappola di Tailwind pagata per intero, e vale oltre il caso.** La prima stesura usava `in-data-[density=touch]:`, che è la forma leggibile. **Non funzionava**, e in modo muto: Tailwind genera `in-*` con `:where([data-density=touch]) &`, e **`:where()` ha specificità zero** — la regola pesava quanto `.md\:block`, e a parità vince l'ordine, cioè `block`. Il livello intermedio restava `display: block` a 768 e lo sbordo non si chiudeva; la classe *c'era* nel DOM, quindi guardando il markup sembrava a posto. Si scrive `[[data-density=touch]_&]:`, che genera un selettore d'attributo vero (0,2,0) e vince davvero. Trovato solo perché la misura diceva ancora 13px quando il markup diceva di sì: **è la misura a chiudere un rimedio, non la lettura del markup**.

Scatti: `docs/img/M1.6/coda2-guscio-768-touch.png` e `coda2-guscio-1440-touch.png`.

### Coda di M1.6 (3) — il contenuto si adatta alla larghezza della pagina (2026-09-10)

Segnalato da Francesco: collassando la colonna, l'area di contenuto non si allargava. Misurato, e confermava alla lettera:

| | colonna | card |
|---|---|---|
| 1440, colonna aperta | 256 | x 274 · **w 1148** |
| 1440, colonna collassata | 48 | x 170 · **w 1148** |
| 1920, aperta | 256 | x 514 · **w 1148** |
| 1920, collassata | 48 | x 410 · **w 1148** |

**Collassare la colonna non dava un pixel di contenuto in più**: la card restava 1148 e scivolava a sinistra di 104px. I 208px liberati andavano tutti ai margini. Non era un guasto ma `larghezza="pagina"` che faceva quel che la sua doc prometteva — `mx-auto w-full max-w-page`, tetto a `--container-page` (1180, misura del v1) e centratura.

**Decisione di Francesco: `piena` diventa il predefinito.** Il contenuto si adatta alla larghezza della pagina, come già faceva `SenzaIcone` — che era, si scopre, l'unica story a comportarsi come il guscio si comporta adesso ovunque. `pagina` resta disponibile e **si chiede**: è ancora la scelta giusta dove una riga lunga si legge male, cioè un form o un testo (e sarà da riprendere con **D11**, il testo lungo).

Dopo: a 1440 la card passa da **1152 a 1360** collassando la colonna — esattamente i 208px liberati — e a 1920 da 1632 a 1840. Cinque gate verdi, `lint` pulito, `registry:build` rifatto perché il blocco è un item.

Nota di metodo: la prima volta ho posto la domanda in astratto («togliere il salto o il tetto?») e Francesco ha giustamente risposto «non capisco quel che dici». La domanda utile era la sua: *si comporti come quella story lì*. Un riferimento a qualcosa che si vede batte tre opzioni descritte a parole.

### Coda di M1.6 (5) — le azioni si dichiarano, e sul telefono stanno nei tre puntini (2026-09-10)

Proposta di Francesco: **scrivania bottoni interi, telefono tutto dentro un menu «⋯»**, in entrambe le densità. Attuata.

**Perché serviva, in numeri.** A 375px due bottoni con l'etichetta per esteso prendono 283px dei 375 e al nome della pagina ne restano **7**: sparisce. Con una sola azione ne restano 149, che bastano per «Famiglie» ma non per un titolo vero. E la riduzione a icone della coda (2) era una risposta parziale che non scala: cinque icone in touch fanno 328px di 375. Il numero delle azioni non era il problema, come Francesco aveva intuito prima che lo misurassi.

**Il cambio d'API, e perché era inevitabile.** `azioni` smette di essere `ReactNode` — bottoni già disegnati — e diventa `AzionePagina[]`: `{ titolo, icona, ruolo }`. Per rendere la stessa azione in due forme il guscio deve sapere *cosa* è, non riceverla già fatta. Con del JSX opaco l'unica strada sarebbe disegnarlo due volte, cioè bottoni dentro le righe di un menu — markup sbagliato, e ogni azione annunciata due volte da un lettore di schermo. Si dichiara il **ruolo** (`primaria` / `secondaria` / `distruttiva`), non il colore: la grammatica delle azioni resta quella, e ora il codice la impone invece di raccomandarla. `icona` è **obbligatoria**, perché sul telefono l'azione è una riga di menu e una riga senza icona in un elenco che ne ha resta disallineata.

Nessuna app consuma ancora il guscio: il momento per cambiare una prop pubblica era adesso. La parte difficile di M3.2 — come una pagina dichiari le proprie azioni a un guscio montato attorno all'`Outlet` — **non** è anticipata: il guscio continua a ricevere prop.

**Una soglia sola, 1024, per entrambe le densità.** Non 768, che è quella della colonna: in touch la colonna vale 384px e a 768 non resterebbe niente. Una regola che si ramifica per densità l'avevamo già scritta nella coda (2) e ci è costata una trappola di specificità; qui non si ramifica.

Le due forme stanno entrambe nel DOM, una spenta con `hidden` — che è `display: none`, quindi la forma spenta esce anche dall'albero di accessibilità e nessuna azione è annunciata due volte.

**E qui è saltato fuori il difetto vero, che stava sotto tutti gli sbordi di questa coda.** Col titolo lungo iniettato, a 1024 in touch il guscio sbordava ancora di 149px. La catena del DOM diceva che il percorso **si tronca correttamente** — 228px dentro un contenitore da 319 — quindi il colpevole era più in alto: la fascia riceveva 789px dove ce n'erano 640. Causa: **`SidebarInset` ha `min-width: auto`**, come ogni elemento flex, quindi non scende sotto il proprio contenuto minimo e quel minimo diventa il pavimento del documento. Il guscio si allargava oltre lo schermo invece di stringere ciò che aveva dentro.

`min-w-0` sull'inset, una riga, e il guscio **non sborda più**, qualunque cosa ci si metta dentro: a cedere è il contenuto, che sa come farlo. È la stessa lezione della coda (2) — l'avevamo applicata allo slot del percorso e non al contenitore che lo contiene.

**Verifica**: sbordo **0** a 375 / 768 / 900 / 1024 / 1440, in **entrambe** le densità, **col titolo lungo** «Malta strutturale R4 fibrorinforzata». A 1024 in touch il percorso riceve ora esattamente i 170px che gli spettano invece di 319. Menu provato col dito: si apre, contiene le due azioni con la loro icona, `Esc` chiude e riporta il fuoco al grilletto. Cinque gate verdi, **868 scansioni / 0 violazioni**, bersagli invariati, `lint` pulito.

Scatti: `docs/img/M1.6/coda5-telefono-menu.png`, `coda5-scrivania.png`.

**Cosa resta a M3.2**: il contratto con cui una pagina *dichiara* percorso e azioni a un guscio montato una volta sola. Il tipo `AzionePagina` è la forma che quel contratto trasporterà.

### Coda di M1.6 (6) — la checklist torna leggibile (2026-09-10)

Rilievo di Francesco: «una nota CHECKLIST sta diventando illeggibile, troppo testo. Non basta tenere il dettaglio in WORKLOG?». Sì, e la regola c'era già scritta: `CLAUDE.md` dice che `CHECKLIST.md` porta «stato, dipendenze, **criterio sintetico**», e la colonna si chiama letteralmente «Criterio di accettazione **(sintesi)**». La regola era stata ignorata a lungo, e da questa sessione per prima.

**Il numero: da 47.762 a 20.144 byte**, −58%. La riga peggiore (M2.8) da **3260 a 265** caratteri; 19 righe accorciate col taglio al confine di frase più un rimando, 4 riscritte a mano dove il taglio automatico avrebbe spezzato male. Le 69 righe di tabella sono tutte al loro posto, prima e dopo.

**Come, senza perdere niente.** Prima di tagliare ho verificato che il dettaglio esistesse davvero altrove: ogni task da M2.1 a M3.1 ha la sua voce in `WORKLOG.md`, ogni decisione la sua sezione in `docs/DECISIONI.md` (30). Il metodo è stato **troncare al confine di frase e rimandare**, non riscrivere a memoria — le righe aprivano tutte col verdetto, quindi la sintesi era già in testa e la riscrittura avrebbe solo aggiunto il rischio di introdurre errori.

**La prosa fra il titolo di FASE 2 e la sua tabella era il caso peggiore: 7183 caratteri contro i ~200 delle altre fasi** (segnalato da Francesco a parte). Era il registro dei rilievi di fase, tre dei cinque ormai *evasi* da M2.9. Ridotta a **1137**, e la scelta di cosa tenere non è stata di lunghezza: **i due rilievi ancora aperti restano in checklist per intero** — il contorno dei controlli sotto 3:1 (decisione di palette) e i filtri col grigio identico (accettato, si riprende in FASE 4). Un impegno aperto che vive solo in una voce di diario si perde; la storia di ciò che è chiuso no, quella il diario la tiene bene. Stessa cura su FASE 1, da 909 a 380.

**La regola ha ora un tetto misurabile**, in testa a `CHECKLIST.md` e in `CLAUDE.md` §Conduzione: due o tre righe di tabella — verdetto, i numeri che contano, un rimando — e tutto il resto nel diario. Con la ragione scritta accanto, perché una regola senza la sua ragione si riapre da sola: **una riga che non si legge smette di essere una fonte di verità**, ed è esattamente quello che era successo.

---

## D4 — Il repo esce di casa, e lo fa pubblico (2026-09-10)

**Perché adesso e non in M5.6.** Francesco ha bisogno di condividere il design con Roberto. D4 bloccava solo M5.6, che è in fondo alla FASE 5, e aspettarlo avrebbe significato tenere la style guide su un `localhost` per settimane. La decisione è stata anticipata; **M5.6 non è stato eseguito** e resta aperto per la parte che conta davvero — il tag `v2.0.0` e la prova d'installazione da fuori.

### La verifica preliminare: cosa ci bloccava davvero

Fatta prima di toccare qualsiasi cosa, perché pubblicare è irreversibile nel senso che conta: quello che finisce su GitHub è stato visto.

- `npm run check` — **verde**, tutti e cinque i gate: contrasto 48/48, registry, font, logo, e **868 scansioni axe su 4 passate, 0 violazioni**.
- `npx shadcn@latest registry validate` — verde, **55 item**; `npm run registry:build` rilanciato, `public/r/` allineato, zero diff.
- Storia git: 283 file tracciati, blob più grosso **0,6 MB** (`docs/img/M1.3-palette-chiaro-scuro.png`), `.git` a 7,1 MB. La ripulitura del 2026-09-09 con `git-filter-repo` regge: nessun font in base64 rimasto nei commit.
- Segreti: grep su tutti i file tracciati per chiavi, token, `BEGIN PRIVATE KEY`, host interni, indirizzi Azure — **niente**. Nessun `.env` tracciato.
- Font Replica LL: **non tracciati**, `.gitignore` li teneva già fuori. Inter c'è, con la sua OFL accanto.

Insomma: **niente ci bloccava tecnicamente.** Ciò che mancava era una decisione, più tre file.

### Pubblico o privato — e perché la scelta era meno libera di quanto sembri

L'org `tassullo` è su **piano free** (verificato via API: `plan.name: "free"`, 3 membri). Da lì discendono due vincoli che nessun accorgimento aggira:

1. **GitHub Pages, su piano free, esiste solo sui repo pubblici.** Niente URL della style guide su un repo privato — e nemmeno l'ipotesi intermedia «Pages protetto», che richiede Enterprise Cloud.
2. **La scorciatoia `owner/repo/item` della CLI shadcn è documentata solo per i repo pubblici.** Su privato serve la forma con namespace: URL raw completo e `Authorization: Bearer ${TOKEN}` dentro il `components.json` di **ogni** app. Il download passa da `raw.githubusercontent.com`, che del login `gh` e della chiave SSH non sa niente.

Il secondo è il costo vero, ed è ricorrente: quel token andrebbe messo sulla macchina di chi sviluppa, nei secret della CI di Anagrafe **e** di Studio **e** di Officina, e nell'ambiente dell'editor — perché senza, `shadcn mcp` non riesce a sfogliare il registry, cioè si perde proprio il meccanismo per cui «prima di scrivere un componente, chiedilo all'MCP». Quando il token scade si rompono tutte e tre insieme, con un `404` che non nomina il token.

Contro: pubblicando, diario, piano e decisioni diventano leggibili da chiunque. Francesco ha scelto di **lasciarli** — è anche il modo in cui si capisce perché le cose stanno così. Pesa a favore che **il v1 `tassullo/tassullo-design-system` è già pubblico**, palette compresa: l'argomento «il design è riservato» era in larga parte già speso.

**Tolto invece un file**: `public/fonts/LEGGIMI.md`. Non per pudore — metteva per iscritto la conversione degli `.otf` **Lineto** in `.ttf` con, testualmente, la licenza *da confermare con Lineto*. Su un repo locale è una nota di lavoro; su un repo pubblico è una dichiarazione. `.gitignore` adesso esclude `public/fonts/` per intero e il file resta sul Mac, dove serve. (Era anche **stale**: diceva che il tema dichiara ancora lo stack `'Replicall'`, mentre da §14 il tema è Inter.)

### Un accertamento che corregge un'impressione di §9

`docs/DECISIONI.md` §9 lascia intendere che la CLI legga *sempre* i JSON compilati in `public/r/`. Vero per la forma **namespace**. Ma la **scorciatoia GitHub** legge il **`registry.json` alla radice**, e il pin di versione si scrive con `#`: `…/button#v2.0.0`, che accetta tag, ramo o SHA. Entrambe le strade funzionano; nei documenti per le app va messa la scorciatoia, che non chiede configurazione.

**Ricaduta su M5.5**: il passo 0 su Anagrafe non è più da ripensare. L'indirizzo `tassullo/tassullo-design-system-v2` esiste, e il problema del percorso locale — che §9 aveva accertato non risolvibile — sparisce da sé.

### Cosa è stato aggiunto

- **`README.md`** — non c'era. È la prima cosa che apre chi arriva: cos'è, come si guarda la style guide, come si installa un item, i gate, e i rimandi ai documenti di conduzione. Con la sezione licenze, che era la cosa da mettere in chiaro pubblicando: codice **tutti i diritti riservati** (il repo è pubblico per meccanica, non per rilascio), Inter sotto OFL, Replica LL fuori dal repo.
- **`.github/workflows/pages.yml`** — `build-storybook` e pubblicazione su Pages a ogni push su `main`. `storybook-static/` **resta in `.gitignore`**: il sito si costruisce in CI, non si committa, o diverge dal sorgente al primo che dimentica di rigenerarlo.
- **`sync.sh` + `.claude/settings.json`** — l'aggiornamento di `main` a inizio sessione, copiato da Anagrafe su richiesta di Francesco. Hook `SessionStart`: `fetch`, poi `pull --ff-only` se sei su `main` e pulito, altrimenti aggiorna il **solo ref** di `main` senza toccare i file del worktree corrente, e stampa il diff dei documenti di conduzione. L'unica differenza dall'originale è l'elenco: qui sono `CLAUDE.md PIANO.md CHECKLIST.md WORKLOG.md docs/DECISIONI.md` — non c'è `ROADMAP.md`, non c'è `docs/INTERFACCE.md`, e c'è `PIANO.md`, che è il documento unico. A metà sessione va rilanciato a mano.
- **`gate.yml` si sveglia.** Era scritto e dormiente per mancanza di remote; ora gira su ogni push a `main` e su ogni PR. Era stato scritto apposta perché chi chiudeva D4 non dovesse anche ricordarsi della CI, ed è servito.

### Prossimi passi

- **M5.6** per quello che resta: tag `v2.0.0` e prova d'installazione in un'app fuori dal repo.
- **M3.2** riprende il piano dove l'aveva lasciato.
- Da tenere presente da qui in avanti: **il repo è pubblico**. Non è una regola nuova — segreti nel repo non ce ne dovevano essere comunque — ma la disattenzione ora costa di più.

---

## M3.2 — L'intestazione di pagina, e il guscio che smette di sapere cosa c'è dentro la fascia (2026-09-10)

**Il compito**: `page-header`, «una sola forma di intestazione per tutte le pagine di tutte le app». Criterio del piano: titolo + breadcrumb + slot azioni.

**L'esito, in una riga**: blocco in piedi, 56 item, cinque gate verdi (888 scansioni / 0 violazioni), e **due scostamenti dal piano dichiarati** — il titolo non si vede più, e le soglie non guardano più lo schermo.

---

### Il problema vero, che il criterio del piano non nominava

`<AppShell>` si monta **una volta sola**, attorno all'`<Outlet />`. Rimontarlo a ogni rotta vorrebbe dire perdere lo stato della colonna a ogni clic. Ma la fascia in alto sta dentro il guscio, e ciò che ci va — percorso e azioni — è della **pagina**, che sta molte righe più in basso e a cui il guscio non può passare prop. shadcn il problema non ce l'ha perché i suoi blocchi rendono il guscio intero dentro ogni pagina; noi no. Era il rilievo scritto in coda a M3.1, ed è la ragione per cui questo blocco esiste in questa forma.

**La pagina dichiara, un portale rende.**

```tsx
<PageHeader
  percorso={[{ titolo: 'Prodotti', href: '/prodotti' }, { titolo: 'Famiglie' }]}
  azioni={[{ titolo: 'Nuovo prodotto', icona: PlusIcon, ruolo: 'primaria', onClick: apri }]}
/>
```

`IntestazioneProvider` (montato dal guscio) tiene il nodo della fascia in uno **stato**, e il *setter* di `useState` fa da `ref` di callback: è una funzione di identità stabile, quindi niente `useCallback` e niente cicli. `FasciaIntestazione` è la barra. `PageHeader` rende lì dentro con `createPortal`.

**La strada dello stato condiviso è stata scartata, e la ragione è una trappola già a verbale.** Un contesto con dentro `{percorso, azioni}` che la pagina aggiorna in un `useEffect` avrebbe come dipendenze proprio `percorso` e `azioni`, cioè **array scritti inline dalla pagina**, nuovi a ogni render: l'effetto riparte, chiama `setState`, il render riparte, e **React non interrompe il ciclo e non stampa niente** (`CLAUDE.md` §Le due trappole, `docs/DECISIONI.md` §17). C'è un secondo difetto, meno noto e peggiore: lo stato conserverebbe gli `onClick` **catturati al momento dell'effetto**, quindi un gestore che legge una variabile di stato della pagina leggerebbe il valore di un render fa. Col portale non c'è né effetto né copia: il contenuto è renderizzato dall'albero della pagina — vede il router, le traduzioni, tutto — e finisce nel DOM della fascia, che è dove serve stia per l'**ordine di tabulazione** (verificato: grilletto → percorso → azioni).

---

### Primo scostamento: il titolo non si vede, ma c'è

`PIANO.md` §M3.2 chiedeva «titolo + breadcrumb + slot azioni». Il titolo visibile era già stato tolto in coda a M3.1 — «Prodotti» compariva **tre volte in 80px** (voce attiva in colonna, ultimo livello del percorso, `<h1>`), ed è la forma di `dashboard-01` di shadcn, che un titolo di pagina non ce l'ha.

Qui il titolo **rientra, in `sr-only`**: un `h1` di 1×1px, ricavato dall'ultimo livello del percorso se non lo si passa. Zero pixel, e la pagina non resta senza intestazione nell'albero dei documenti — che con `landmark`/`heading` è l'unica cosa che il titolo dava e che togliendolo si perdeva davvero. Misurato: `h1` = «Famiglie», 1×1px.

---

### Secondo scostamento, e vale più del primo: le soglie guardano la fascia, non lo schermo

M3.1 aveva ramificato le regole responsive per **densità**, e con dentro una trappola di specificità (`in-data-[density=touch]:` genera `:where()`, che pesa **zero**). La ragione di quella ramificazione era una discontinuità vera: **sotto i 768px la colonna esce dal DOM**, quindi passando da 767 a 768 lo schermo si allarga di 1px e la fascia si **restringe di 255** — di 383 in touch. Una regola sulla viewport quella discontinuità deve inseguirla.

Su `@container/fascia` non esiste: la fascia si misura da sé. **Due soglie, nessuna ramificazione**, e la stessa regola vale dentro il guscio, fuori dal guscio e a qualunque densità.

- **`@md` (448px)** — sotto, i livelli intermedi del percorso diventano `…`;
- **`@2xl` (672px)** — sotto, le azioni entrano tutte in un solo bottone «⋯».

**Attenzione a quale larghezza si misura**, e costa una misura sbagliata scoprirlo: una container query `inline-size` guarda il **riquadro di contenuto**, cioè al netto del `px-4` — che segue la densità, 32px in tutto in normale e 48 in touch. La prima lettura, fatta sul riquadro di bordo, dava una fascia da 480px che «avrebbe dovuto» mostrare gli intermedi e non li mostrava: erano 432 utili contro una soglia di 448.

Otto celle, misurate in Chromium sullo Storybook costruito. Larghezza **utile** della fascia:

| viewport | densità | colonna | fascia (utile) | percorso | azioni |
|---|---|---|---|---|---|
| 1440 | normale | 256 | **1152** | intero | bottoni interi |
| 1440 | touch | 384 | **1008** | intero | bottoni interi |
| 1024 | normale | 256 | **736** | intero | bottoni interi |
| 1024 | touch | 384 | **592** | intero | «⋯» |
| 768 | normale | 256 | **480** | intero | «⋯» |
| 768 | touch | 384 | **336** | `…` | «⋯» |
| 375 | normale | — | **343** | `…` | «⋯» |
| 375 | touch | — | **327** | `…` | «⋯» |

**343 e 327 sono, alla cifra, le due larghezze di D10 misurate in M3.1 sul contenuto**: è la stessa larghezza vista nella fascia invece che nell'area di pagina. In tutte e otto le celle la fascia resta **una riga sola** (altezza 48 in normale, 72 in touch) e la pagina **non sborda**. È il difetto che M3.1 aveva trovato guardando e non misurando — il percorso che a 375×touch andava a capo dentro una barra ad altezza fissa — e adesso è strutturalmente impedito invece che rimediato nella story.

**Un confine si sposta, e va detto**: a **1024×touch** le azioni ora entrano nel menu, dove la regola `lg:` di M3.1 le teneva intere. Lì la fascia ha 592px utili. I 1024 di M3.1 erano un compromesso **imposto** dalla ramificazione per densità («a 768 in touch non resterebbe niente»), e una soglia sulla fascia quel compromesso non deve farlo. Nelle altre sette celle le due regole danno lo stesso esito.

---

### Cosa esce dal guscio, e perché non restano due strade

`app-shell.tsx` perde `barra`, `azioni`, `AzionePagina` e `AzioniDiPagina`: sono migrati in `page-header.tsx`. Tenerli come «forma alternativa» sarebbe stata la deriva contro cui il criterio del piano è scritto — *una sola* forma di intestazione. Il guscio ora rende `<FasciaIntestazione grilletto={<SidebarTrigger />} />` e non sa più cosa ci sia dentro: garantisce l'altezza e la riga sola, il contenuto è della pagina.

`tassullo-app-shell` dichiara `@tassullo/tassullo-page-header` fra le `registryDependencies` (e non più `@tassullo/separator`, che arriva da lì): **un solo `add` porta tutti e due**. 56 item, `registry validate` verde.

---

### Tre cose prese in corsa, e chi le ha prese

**1. Il gate ha trovato una violazione vera, e nostra.** `scuro/aperto`, `color-contrast`: l'azione distruttiva nel menu «⋯» usava `className="text-destructive"` — ereditato tale e quale dal guscio di M3.1 — e su fondo scuro dà **3.52:1** (`#DC2626` su `#1C1C1C`). È la stessa trappola di `--primary`/`--accent-ink` scritta in `CLAUDE.md`, su un'altra coppia: **`--destructive` è il colore dei fondi, non del testo**. Il rimedio era già in casa e al gradino 1 della scala 4bis — `DropdownMenuItem` ha `variant="destructive"`, che usa `destructive-subtle-foreground`, cioè il rosso *leggibile*. Da notare **perché non era emersa in M3.1**: la story del guscio non aveva un'azione distruttiva. Un colore sbagliato che nessuna story mette in scena è un colore che il gate non può vedere.

**2. Il pannello del browser dell'app non misura le larghezze**, e non solo i popup. Le transizioni CSS sono guidate dal clock dei fotogrammi: con `document.visibilityState` a `hidden` non avanzano, quindi la colonna commutata di densità resta **larga come prima** e ogni lettura è sfasata di una misura. Ci sono voluti due tentativi con esiti incrociati (normale che riportava 1056, touch 1184) per riconoscerlo. È l'estensione naturale di `docs/DECISIONI.md` §22: là erano i popup, qui è qualunque cosa animata. Il banco resta **Chromium di Playwright, headless**.

**3. Tre avvisi di lint, tutti sensati, tutti chiusi cambiando disegno.** Un `useRef` letto in render, la mutazione di un valore di contesto e un componente dichiarato dentro un altro. Il terzo è ovvio; i primi due venivano dal contatore che avverte quando due `<PageHeader>` sono montati insieme (difetto muto: nessun errore, solo un percorso doppio). Il contatore ora **non esiste**: l'effetto conta i nodi `[data-slot="page-header-content"]` già nella fascia. Il DOM il conto ce l'aveva già, e un contesto che si muta non è un contesto — è una variabile globale travestita, che React non sa essere cambiata. Il repo resta ai suoi **3 avvisi preesistenti**, e senza la prima soppressione di lint della sua storia.

**Nota di conduzione**: `prettier` **non è il formattatore di questo repo** — non c'è nessuna configurazione, e passarlo su `app-shell.tsx` gli ha aggiunto 70 punti e virgola che il file non aveva. Ripristinato da git e riapplicate le modifiche a mano.

---

### Verifiche eseguite

`npm run check` verde su **cinque** gate: `check:contrast` ✔ 48 coppie · `check:registry` 0 errori, 52 avvisi (arbitrari *ereditati da shadcn*, preesistenti), 2 blocchi Tassullo, 0 componenti nostri · `check:font` ✔ · `check:logo` ✔ · `test:a11y` **888 scansioni / 4 passate / 0 violazioni** (222 story, +5).
`npm run build` ✔ · `npm run build-storybook` ✔ · `npm run lint` 3 avvisi preesistenti · `shadcn registry validate` ✔ (56 item) · `registry:build` rilanciato.
`npm run misura:bersagli`: **2009 bersagli su 222 story, 47 popup aperti, 31 tipi sotto i 44px, 0 piccoli in entrambe le direzioni** — nessun bersaglio nuovo sotto soglia.
Misure a mano in Chromium sullo Storybook costruito: le **otto celle** viewport × densità della tabella qui sopra, più il percorso a quattro livelli sopra e sotto `@md`, l'ordine di tabulazione della fascia, e l'`h1` in `sr-only`.

---

### Resta aperto

1. **Il `SidebarRail`** (da M3.1): non montato, per tre misure. Se Francesco lo rivuole, è una riga.
2. **`--destructive` come testo**: qui si è chiuso usando la variante del componente, ma il token resta uno di quelli che `check:contrast` non vede — verifica le coppie `X`/`X-foreground`, non un colore usato come inchiostro su un fondo qualunque. È parente del rilievo 1 della FASE 2 (il contorno dei controlli sotto 3:1), ed è materia di palette.
3. **D10**, verdetto in M4.2, ora con otto numeri sotto invece che con quattro.

### Prossimi passi

**M3.3 — `data-table` (2 sessioni)**: TanStack Table, ~500 righe finte, ordinabile e filtrabile da tastiera, degrado a 375px. Da portarci dentro la misura di M3.1: **in touch, a 1440px, il vincolo alla larghezza non è `--container-page` ma la colonna** (1008px utili contro i 1180 del tetto). Chi progetta una tabella larga in touch deve saperlo.

---

## Coda di M3.2 — la story che si leggeva come un errore (2026-09-10)

**Il rilievo di Francesco**, guardando `Fascia Stretta` con la viewport su Scrivania 1440: «non capisco a cosa serva questa pagina, è attiva la modalità desktop e sembra l'interfaccia del telefono». Accolto: la story mostrava una barra da 320px in mezzo a uno schermo da 1440 **senza dire perché**, e una dimostrazione che non si dichiara si legge come un guasto. La spiegazione c'era, ma nella prosa della pagina Docs — cioè non dove la si guarda.

Due modifiche.

**1. Il banco dichiara la propria larghezza, sopra la barra.** «Fascia da 320px — la stessa che si ha su uno schermo da 375px, dove la colonna non c'è. Il riquadro è stretto di proposito: le soglie guardano la fascia, non lo schermo.» E la barra sta dentro un riquadro con un bordo, invece di galleggiare sul fondo della pagina. Anche le altre quattro story hanno la loro didascalia, così la stretta non è l'unica con un'etichetta e la differenza si legge nel confronto.

**2. Il filo verticale passa dalla pagina al guscio.** Era in `PageHeader`, prima del percorso, ed è la forma di `sidebar-07` — ma lì è il divisorio **fra il grilletto della colonna e il contenuto**, cioè fra ciò che è del guscio e ciò che è della pagina. Fuori dal guscio, dove un grilletto non c'è, finiva come un trattino appoggiato al bordo sinistro: si vede nello screenshot del rilievo. Ora sta in `FasciaIntestazione` e compare **solo se c'è un grilletto**. Il guscio non cambia di un pixel; il banco perde un segno che non voleva dire niente.

**Sulla violazione nel pannello.** Lo screenshot del rilievo mostrava `Accessibility 2 / Violations 1 — aria-command-name` e 28 `Passes`. **Sul codice committato quella story è a zero**: pannello riletto sul dev server, `Violations 0 · Passes 25 · Inconclusive 0`, e axe eseguito a mano in Chromium sullo Storybook costruito — chiaro e scuro, popup aperto a quattro tempi di assestamento diversi (0, 60, 150, 400ms) e popup chiuso dopo `Esc` — dà **zero violazioni** in tutti e dieci i casi. I conti diversi (28 passi contro 25) dicono che quel pannello stava misurando un DOM diverso dal committato: un dev server rimasto acceso su uno stato intermedio della sessione. Nessuna modifica fatta per questo; **se ricompare a pagina ricaricata, serve il nodo** — il pannello lo mostra espandendo la riga della violazione — perché senza non è riproducibile.

**Verifiche**: `npm run check` di nuovo verde sui cinque gate, **888 scansioni / 0 violazioni**; `build`, `build-storybook`, `registry:build` ✔; `lint` ai 3 avvisi preesistenti. Guardate a video le cinque story del blocco e il guscio, in chiaro e scuro.

---

## Coda di M3.2 (2) — il «…» del percorso era un vicolo cieco (2026-09-10)

**Il rilievo di Francesco**, con lo screenshot della pagina `Breadcrumb` di shadcn accanto: quando il percorso si accorcia e compaiono i `…`, **quel segno si deve poter cliccare** per arrivare alle sezioni intermedie. Accolto, ed era un difetto vero e non un'omissione estetica.

**Cosa faceva la nostra**: i livelli intermedi erano `display: none`, e `BreadcrumbEllipsis` è `role="presentation" aria-hidden` — cioè un **disegno**. A schermo stretto il percorso non *collassava*: **perdeva** dei livelli, e perdeva proprio quelli che servono per risalire, che su un telefono sono gli unici salti disponibili (la colonna lì non c'è). Un menu che non si apre è peggio di un menu che non c'è: promette una strada e non la dà.

**Cosa fa adesso**: il `…` è il grilletto di un `DropdownMenu` che contiene i livelli nascosti, ognuno col proprio `href` o `render` — quindi navigano davvero, col `<Link>` del router se l'app lo passa. È la composizione che shadcn documenta come «Breadcrumb with Dropdown», presa alla lettera: `DropdownMenuTrigger` che rende attraverso un `Button` fantasma, `BreadcrumbEllipsis` dentro, e l'`sr-only` accanto — che serve perché l'ellissi è `aria-hidden` e il nome accessibile del bottone non può venire da lì. **Scala 4bis ferma al gradino 1.**

Uno scostamento dall'esempio di shadcn, e misurato: **`size="icon"` invece di `icon-sm`**. `icon-sm` fa 28px in normale e **42 in touch** — sotto i 44 di WCAG e sotto i 48 che il v1 dà in cantiere. `icon` fa **32 e 48**, cioè lo stesso bersaglio del menu delle azioni che gli sta accanto nella stessa barra, e la fascia in touch è alta 72: lo spazio c'è.

---

### E allora il glifo delle azioni non poteva restare `⋯`

**La domanda di Francesco** — «sul telefono i `…` sono sicuro l'icona giusta per indicare l'azione?» — arriva mentre il percorso ne acquistava uno suo, e la risposta cambia proprio per questo. `⋯` come *overflow* è la convenzione giusta e da solo non era sbagliato; il problema nasce adesso, che i menu in barra diventano **due**: uno **naviga** (il percorso) e uno **agisce** (le azioni). Con lo stesso glifo si distinguerebbero solo per posizione, cioè per niente.

**Divisi**: l'ellissi **orizzontale** resta al percorso — è quella che shadcn mette in `BreadcrumbEllipsis`, e in un percorso significa «altri livelli qui in mezzo» —; alle azioni va il **kebab verticale** `⋮`, che è il segno con cui una barra raccoglie ciò che non ci sta. È la stessa distinzione che fa Material fra l'ellissi e l'overflow della barra degli strumenti.

**Bersagli misurati**, entrambi i grilletti: **32×32 in normale, 48×48 in touch**, identici fra loro.

---

### Verifiche

`npm run check` verde sui cinque gate: **892 scansioni / 4 passate / 0 violazioni** (223 story, +1). Il blocco ora ha **due** popup e le story li aprono **tutti e due, uno per story** — `Fascia Stretta` apre le azioni (`[aria-label="Altre azioni"]`), `Percorso Collassato` apre il percorso (`button:has([data-slot="breadcrumb-ellipsis"])`). Era il punto su cui M2.3 e M2.6 hanno sbagliato due volte: un popup non aperto non è un popup senza violazioni, e qui i selettori dovevano diventare due perché `[data-slot="dropdown-menu-trigger"]` adesso ne trova due e avrebbe sempre e solo aperto il primo.
`npm run build` ✔ · `build-storybook` ✔ · `lint` 3 avvisi preesistenti · `registry:build` rilanciato.
`npm run misura:bersagli`: **2015 bersagli su 223 story, 0 piccoli in entrambe le direzioni** — i due grilletti nuovi non abbassano il set.

---

### Coda della coda — due story che erano la stessa scena

**Rilievo di Francesco**: «Fascia Stretta e Percorso Collassato sono la stessa story o sbaglio?» Non sbagliava. Erano lo stesso banco da 320px con lo stesso percorso; le differenze erano un'azione distruttiva in più su una e — la sola che contasse — **quale dei due menu la `play` apriva**. Nel catalogo comparivano come due componenti diversi, e non lo erano.

**Ora sono dichiaratamente due stati di una scena sola**: `STRETTA` è un `args` unico condiviso, `bancoStretto()` un `render` unico, e i nomi dicono cosa è aperto — `Stretta Menu Del Percorso` e `Stretta Menu Delle Azioni`. La didascalia sopra la barra lo ripete, e la prosa spiega **perché non sono una sola**: `apri.ts` apre **un** popup per story, e un popup che il gate non apre è un popup di cui non sa niente. Da quando i menu in barra sono due, servono due story per misurarli entrambi aperti — che è la stessa lezione di M2.3 e M2.6, riapplicata dentro un blocco invece che fra primitive.

La duplicazione è quindi **strumentale e dichiarata**, non accidentale: è la differenza fra due story che si somigliano per caso e due che si somigliano per costruzione.

Gate invariato: **892 scansioni / 0 violazioni**.

---

## M3.3 (1 di 2) — La tabella di dati: il contorno è nostro, le colonne restano di TanStack (2026-09-10)

M3.3 è l'unico task doppio del piano. Questa è la **prima** sessione: la libreria, il blocco, i dati di prova, le story, l'item nel registry, i cinque gate. La **seconda** ha il degrado a 375px e il conto dei bersagli in touch — vedi «Prossimi passi».

### Prima domanda, sempre: ce l'ha già shadcn?

Chiesto all'MCP, non presunto. **`data-table` nel registry non c'è.** Ci sono `table` — le sei etichette HTML vestite, che abbiamo dal M2.4 — e `data-table-demo`, che è un `registry:example` e per lo stile `base-nova` **non è nemmeno pubblicato**: `npx shadcn view @shadcn/data-table-demo` risponde *not found*. La pagina «Data Table» del sito è dichiaratamente una **guida**, e shadcn ne dà la ragione: «ogni tabella che ho scritto era diversa; metterle tutte in un componente vuol dire perdere la flessibilità che l'headless dà».

Conseguenze operative, e sono quelle che decidono il costo dei futuri aggiornamenti: **nessun originale da cui divergere**, quindi nessuno snapshot in `registry/.upstream/` e nessuna riga in `componenti-propri.json` — che è il registro di ciò che sta *al posto* di una primitiva, e una tabella di dati non sostituisce niente. Il blocco sta in `blocks/`, dove `check:registry` verifica la sola regola 3. **`componenti-propri.json` resta vuoto.**

### Perché però la guida da sola non basta

La flessibilità che shadcn non vuole perdere, **noi non la vogliamo pagare quattro volte**. La guida lascia intero a chi la segue tutto il contorno — caratteristiche, stato, ricerca, ordinamento, paginazione, selezione, colonne nascoste, stato vuoto — da riassemblare a mano in ogni pagina. È il meccanismo esatto con cui le app del v1 sono divergite: nessuna ha scritto la tabella *male*, l'hanno scritta ognuna *un po' diversa*. Prodotti, Famiglie, Norme e Pubblicazioni di Anagrafe sono quattro volte la stessa tabella.

**La riga passa quindi qui: le colonne restano di TanStack, il contorno è nostro.** `creaColonne()` è il loro `createColumnHelper` con la sola generica delle caratteristiche già messa — chi scrive una colonna scrive TanStack vero (`accessor`, `display`, `columns`, `sortFn`), e la documentazione che gli serve è la loro, non una nostra parafrasi in italiano che invecchia al primo aggiornamento.

### TanStack Table v9, e cosa non è più vero

Installata `@tanstack/react-table` **9.2.4** (la stabile; la v9 è quella che i doc di shadcn usano oggi). È **a caratteristiche**: `tableFeatures()` dichiara ciò che serve e il resto sparisce dal bundle. Cadono i `get*RowModel` fra le opzioni — i modelli di riga si creano con `create*RowModel()` e si registrano lì dentro — e cadono anche le funzioni di filtro e ordinamento incorporate, da registrare una per una. `useReactTable`, `getCoreRowModel()` e `flexRender(...)` sono **v8**; qui sono `useTable` e `<table.FlexRender />`.

Le funzioni di ordinamento registrate sono **quattro**, e non per abbondanza: `text`, `alphanumeric` (o `IN-9` finirebbe dopo `IN-10`), `datetime`, `basic`. Sono le quattro nature delle colonne di Anagrafe.

### Tre scostamenti dalla guida, tutti voluti

1. **Si cerca in tutta la tabella, non in una colonna.** La guida filtra `email`, cioè una colonna scelta a mano; le pagine di Anagrafe hanno una casella sola che guarda tutto. Qui è `globalFilteringFeature`, e le colonne che non devono entrarci dicono `enableGlobalFilter: false` — nella story `Rev.` e `Aggiornato`, dove cercare «12» avrebbe pescato mezza tabella.
2. **L'intestazione ordina con un clic, non con un menu.** `DataTableColumnHeader` di shadcn apre un menu con Asc/Desc/Nascondi: da tastiera sono **quattro gesti** per la cosa che si fa più spesso. Qui l'intestazione *è* il bottone e cicla a **tre tempi** — crescente, decrescente, nessun ordine. Il criterio del piano («ordinabile e filtrabile **da tastiera**») è quello a decidere fra le due forme. Nascondere una colonna resta possibile, dal menu «Colonne», che è dove si va quando si vuole quello.
3. **Il `<th>` dichiara `aria-sort`.** La guida non lo fa e axe non lo pretende, ma è l'unico modo in cui un lettore di schermo sa che la tabella è ordinata e come. Costa un attributo.

### Due stati vuoti, non uno

La guida ne ha uno, `No results.`, e su una tabella **appena creata** dice la cosa sbagliata. «Nessun risultato» dopo una ricerca ha un rimedio — e il blocco offre il bottone che lo esegue — mentre «non c'è ancora niente» no, e il suo rimedio lo conosce solo la pagina, che passa l'azione. Il blocco sa distinguerli perché conosce sia le righe filtrate sia quelle totali.

Nota per **M3.5** (`empty-state`): oggi i due stati usano la primitiva `empty` così com'è; quando M3.5 stabilirà lo standard unico il punto in cui intervenire è `TabellaVuota`, **uno solo**.

### `onSelezione` non esiste, e la mancanza è la cosa più importante del file

La selezione esce dalla tabella attraverso `barra` nella **forma a funzione**, che riceve le righe scelte. La prima stesura aveva una `onSelezione` notificata da un `useEffect` con `[scelte]` fra le dipendenze — e **`oxlint` l'ha segnalata**, perché la regola `react-hooks(exhaustive-deps)` in questo repo c'è (il commento che avevo scritto diceva il contrario: corretto). Le dipendenze oneste sarebbero state un array nuovo a ogni render e una funzione che la pagina scrive quasi sempre inline: l'effetto riparte, chiama `setState`, il render riparte, e React non interrompe il ciclo e non stampa niente — la trappola di `CLAUDE.md`, quella dell'8 settembre.

Invece di sopprimere l'avviso, **l'effetto è sparito**: `barra` come funzione è una chiamata in fase di render, pura, e le azioni di massa stanno dove servono davvero. Il repo resta ai suoi **3 avvisi preesistenti** e senza la prima soppressione di lint della sua storia.

### Il difetto che il pannello del browser ha nascosto, per la terza volta

`DropdownMenuLabel` **vuole un `DropdownMenuGroup` attorno**: in Base UI è `Menu.GroupLabel`, che senza `Menu.Group` **lancia**. Era già scritto in `dropdown-menu.stories.tsx` da M2.x, e l'ho rifatto lo stesso — la nota è mia.

Ciò che vale il verbale è **come si è manifestato**. Nel pannello del browser dell'app la story sembrava sana — la tabella c'era, il grilletto pure — e il menu «non si apriva»: `aria-expanded="true"` e nessun contenuto. Sembrava l'ennesimo caso di §22 (Base UI schedula il montaggio in `requestAnimationFrame`, che lì non scatta), e in un certo senso lo era: l'errore scatta **quando il pannello monta**, quindi il pannello lo stava nascondendo. In Chromium vero la stessa story **non renderizzava affatto** — `rows: 3, buttons: 3`, cioè la tabella di Storybook e il riquadro d'errore al posto della nostra.

**Il gate l'ha preso e il pannello no**: 4 violazioni in categoria `imbracatura` (le due passate `aperto`, su `Menu Di Riga` e `Menu Delle Colonne`), perché la `play` andava in timeout aspettando `dropdown-menu-content`. È la terza volta che la stessa causa produce un sintomo che non le somiglia.

### Un rilievo che non chiudo, e che è materia di palette

**`Badge` non ha varianti semantiche.** Le sue varianti sono quelle di shadcn — `default`, `secondary`, `destructive`, `outline`, `ghost`, `link` — mentre il tema ha da M1.1 le terne `success-*`, `warning-*`, `info-*`. Una colonna «Stato» è il caso d'uso naturale di quei token, e oggi non può usarli: nella story `pubblicato` finisce sull'arancio del brand (che è corretto come uso di `--primary` e passa il contrasto, ma è il colore *dell'identità*, non quello di uno *stato*) e tutto il resto è grigio. Aggiungere una variante è **gradino 4** della scala 4bis, quindi si propone e non si fa: se serve, è una decisione da prendere, non da scrivere di iniziativa. Segnalato qui, non chiuso.

### Verifiche eseguite

`npm run check` verde sui **cinque** gate: `check:contrast` ✔ 48 coppie · `check:registry` **0 errori**, 52 avvisi (arbitrari *ereditati da shadcn*, preesistenti), **3 blocchi Tassullo**, **0 componenti nostri** · `check:font` ✔ · `check:logo` ✔ · `test:a11y` **916 scansioni / 4 passate / 0 violazioni** (229 story, +6).
`npm run build` ✔ · `build-storybook` ✔ · `lint` **3 avvisi preesistenti** · `shadcn registry validate` ✔ (**57 item**) · `registry:build` rilanciato.
`npm run misura:bersagli`: **2170 bersagli su 229 story, 47 popup aperti, 1650 sotto i 44px, 32 tipi distinti, 0 piccoli in entrambe le direzioni** — nessun bersaglio nuovo sotto soglia.

**Tastiera**, in Chromium di Playwright sullo Storybook servito, 1440×900 — è il criterio di accettazione del piano, quindi provato e non dichiarato:

| gesto | esito |
|---|---|
| 1 Tab dall'inizio | il fuoco è nella casella di ricerca |
| digitare «Marmorino» | 500 → **59 righe**; 9 Backspace → 500 |
| 4 Tab | il fuoco è su «Ordina per Codice: crescente» |
| Invio ×1 | `aria-sort="ascending"`, `AD-104, AD-108, AD-127` |
| Invio ×2 | `aria-sort="descending"`, `RA-996/R, RA-995, RA-967` |
| Invio ×3 | `aria-sort="none"`, **e l'ordine di partenza è tornato** |
| Invio su «Pagina successiva» | Pagina 1 di 20 → **2 di 20** |

Il fuoco non si perde in nessuno dei passaggi. Le prime tre righe crescenti confermano anche che `alphanumeric` lavora.

**Larghezze e altezze**, quattro celle in Chromium:

| cella | riquadro | tabella | riga | la pagina sborda? |
|---|---|---|---|---|
| 1440 normale | 1406 | 1406 | 41 | no |
| 1440 touch | 1406 | 1406 | **61** | no |
| 375 normale | 341 | **746** | 41 | no — scorre **dentro** il riquadro |
| 375 touch | 341 | **918** | **61** | no — scorre **dentro** il riquadro |

La densità arriva alla tabella senza che il blocco faccia niente: la riga passa da 41 a 61px perché `p-2` di `TableCell` deriva da `--spacing`. **Avvertenza di strumento, costata una misura**: il global della densità nell'URL di Storybook si chiama `density`, non `densita` (modalità e superficie sono in italiano, questo no) — con il nome sbagliato la pagina risponde, non dà errore, e riporta la densità normale sotto un'altra etichetta: 41px in tutte e quattro le celle.

Guardate a video le sei story, in chiaro e in scuro, a 1440 e a 375, nelle due densità.

### Resta aperto

1. **Il degrado a 375px non è progettato.** La pagina non sborda — merito dell'`overflow-x-auto` che la primitiva `table` ha già — ma la tabella *scorre* in orizzontale e più della metà delle colonne è fuori dallo schermo **senza un segno che lo dica**. Funziona, non rompe niente, e non è un degrado. È il cuore della seconda sessione.
2. **I bersagli in touch della barra.** Il grilletto «Colonne» è un `Button size="sm"`, cioè **41.56px** in touch: sotto i 44 di WCAG, e sopravvive al gate solo perché è largo 114. I bottoni della paginazione sono `size="icon"` (32 normale, **48** touch) proprio per non cascarci. Da rimettere in riga nella seconda sessione, insieme al punto 1.
3. **`Badge` senza varianti semantiche** — vedi sopra: proposta, non decisione.

### Prossimi passi

**M3.3 (2 di 2)**: il degrado a 375px, e cioè la sola domanda di disegno vera di questo blocco — a 327px utili (la cifra di D10, misurata in M3.1) le colonne che si possono mostrare sono due, forse tre. Le strade da pesare sono tre e vanno pesate *guardandole*: (a) lo scorrimento orizzontale con la prima colonna fissa e un segno che dica che c'è dell'altro; (b) le colonne che si spengono per soglia, con `@container` sul riquadro della tabella — la lezione di M3.2, dove la soglia sulla fascia ha tolto la ramificazione per densità; (c) la riga che smette di essere una riga e diventa una scheda, che è ciò che fa `dashboard-01` di shadcn sotto una certa larghezza. Da portarci dentro la misura di M3.1: **in touch, a 1440px, il vincolo alla larghezza non è `--container-page` ma la colonna** (1008px utili contro i 1180 del tetto).

---

## Coda di M3.3 (1) — l'intestazione prende terra, e le colonne smettono di saltare (2026-09-11)

Due rilievi di Francesco guardando la tabella su scrivania, più uno che resta aperto.

### 1. L'intestazione era dello stesso colore delle righe

**Il rilievo**: «Tassullo V1 prevedeva un header di colore differente. Qua rimane dello stesso colore delle righe della tabella e non si distingue.» Vero, e il v1 lo dice alla lettera — `components.css` §345: `.table th { background: var(--color-surface-3) }`.

`--color-surface-3` del v1 è `#F4F3F1`, che nella mappa di `PIANO.md` §2bis è **`--accent`**. Qui però la scelta fra `--accent` e `--muted` non si decide sulla mappa, e la ragione è di **composizione**: il bottone dell'intestazione ordinabile è un `Button variant="ghost"`, il cui hover è `hover:bg-muted`. Su un'intestazione `bg-muted` **l'hover sparirebbe** — stesso colore sotto e sopra. Con `bg-accent` (`#F4F3F1`, più chiaro) l'hover `muted` (`#ECEAE8`) si legge come una macchia più scura. Il valore del v1 è quindi anche quello giusto, ma per una ragione che il v1 non aveva modo di conoscere.

Sta in **`TableHeader` della primitiva**, non nel blocco: una tabella con l'intestazione che non si distingue è sbagliata dovunque, non solo dentro `data-table`. È **gradino 2** della scala 4bis — sola stringa di classi — e il gate lo conferma: *«table.tsx — forma identica all'originale, 2 stringhe di classi ri-stilate»*.

Misurato reso: intestazione `oklch(0.9644 0.0029 84.56)` = `#F4F3F1` in chiaro, `#2E2E2E` in scuro, contro righe trasparenti su `--card` (`#FDFDFD` / `#1C1C1C`). Si distingue in entrambe.

### 2. Le colonne saltavano a ogni ordinamento — ed era un difetto vero

**Il rilievo**: «Per la story Prodotti se vario l'ordinamento delle righe cliccando sull'header cambia la larghezza delle colonne.» Confermato dai due screenshot affiancati: `Famiglia` a x≈1085 prima e x≈1130 dopo.

**La causa non è la demo, è il blocco**: un `<table>` è a **larghezza automatica**, quindi il browser dimensiona ogni colonna sul contenuto *della pagina corrente*. Cambia l'ordinamento, cambiano le dieci righe visibili, cambia la stringa più lunga, e **tutte le colonne si spostano**. Lo stesso salto lo dà il voltare pagina e il filtrare — cioè i tre gesti che una tabella paginata fa in continuazione. Su 500 righe in 20 pagine è un salto a ogni clic.

**Il rimedio è `table-fixed`**, dove comandano le larghezze dichiarate nella prima riga di intestazioni e il contenuto non ha più voce in capitolo. Le larghezze si dichiarano nel `meta` della colonna, come **utility Tailwind** e non come pixel:

```tsx
col.accessor('codice', { meta: { titolo: 'Codice', larghezza: 'w-32' }, … })
```

È la regola 3 del `CLAUDE.md`, che vale anche negli `style` inline — e in più le misure derivano da `--spacing`, quindi **seguono la densità da sé**. Il tipo `MetaColonna` è esportato, così le due chiavi sono una dichiarazione e non una convenzione da ricordare.

Il blocco si dà da sé la larghezza della colonna delle caselle (`w-10`); `truncate` sulle celle è il prezzo di `table-fixed`, perché un testo più lungo della sua colonna sborderebbe in quella accanto invece di allargarla.

**Una cosa presa misurando, e che va scritta perché è silenziosa**: se **tutte** le colonne dichiarano una larghezza e la somma non torna con la tabella, il browser non protesta — **le comprime tutte in proporzione**. Con sette larghezze su otto per 1452px in una tabella da 1406, `w-48` (288px dichiarati) rendeva **279**. Non è un guasto: è un modo di non ottenere ciò che si è chiesto senza che nessuno lo dica. Quindi **una colonna va lasciata senza `larghezza`**, ed è quella che assorbe l'avanzo — nella story è `Famiglia`, la più elastica.

**Misura del rimedio**, Chromium 1440×900, larghezze dei sette `<th>` a ogni passaggio:

| gesto | larghezze |
|---|---|
| partenza | `40, 128, —, 224, 128, 80, 128, 48` |
| ordina crescente | identiche |
| ordina decrescente | identiche |
| pagina 2 | identiche |
| filtro «Marmorino» | identiche |

Prima della modifica le stesse cinque letture erano tutte diverse.

### 3. Resta aperto: il badge e le quattro famiglie semantiche

Francesco: «Per i badge possiamo aggiungere i 4 colori utilizzati anche per gli alert (4 varianti semantiche)». La capacità serve e non è in discussione; **il meccanismo sì**, perché c'è un precedente misurato che va nella direzione opposta.

`alert.stories.tsx`, scritto in M2.4: *«Provata anche la strada opposta, e misurata: aggiungere `info`, `success` e `warning` come nomi di variante nel `cva` manda `check:registry` in rosso — "diverge dall'originale FUORI dalle stringhe di classi: nomi di varianti". Il gate ha fatto esattamente il suo mestiere.»* Gli alert hanno quindi le quattro famiglie **via `className`**, con le terne di token del tema, e `alert.tsx` resta identico a shadcn.

Ma fra alert e badge c'è una differenza che conta: un alert si scrive **una volta per pagina**, a mano; un badge di stato si scrive **dentro la definizione di colonna di ogni tabella di ogni app**. Ripetere lì la terna di classi è esattamente la deriva che il progetto esiste per impedire.

La domanda è quindi posta a Francesco, non decisa: si aggiunge un item **nostro** che esporta le quattro terne come costanti (nessuna primitiva tocca, gate verde), oppure si aggiungono le varianti a `badge.tsx` e si insegna al gate a distinguere una divergenza **dichiarata** da una sopravvenuta. Non implementato.

### Verifiche

`npm run check` verde sui cinque gate: **916 scansioni / 0 violazioni** (229 story, invariate). `check:registry` **0 errori**, `table.tsx` a forma identica con 2 stringhe ri-stilate.
`build` ✔ · `build-storybook` ✔ · `lint` **3 avvisi preesistenti** · `registry:build` rilanciato.
`misura:bersagli`: **2170 bersagli, 0 piccoli in entrambe le direzioni** — invariato.

### Nota sulla sessione 2

Francesco ha ridefinito l'ordine: il degrado a 375px si guarda **dopo** che la tabella è a posto su scrivania. La sessione 2 di M3.3 comincia quindi dal collaudo desktop — questi due rilievi ne sono già parte — e il degrado viene in coda.

---

## Coda di M3.3 (2) — i toni semantici, e una story che non diceva cosa mostrava (2026-09-11)

### Il badge: la risposta ce l'aveva shadcn, e l'ha trovata Francesco

La domanda posta nella coda precedente — item nostro, varianti vere, o `className` a mano — **si è chiusa prima di essere decisa**, perché Francesco ha indicato la pagina giusta: `ui.shadcn.com/docs/components/base/badge`, sezione **Custom Colors**. Lì shadcn scrive, con le stesse parole della pagina di `alert`: *«You can customize the colors of a badge by adding custom classes such as `bg-green-50 dark:bg-green-800`»*. E l'API Reference elenca sei varianti — `default`, `secondary`, `destructive`, `outline`, `ghost`, `link` — e **nessuna semantica**.

Quindi non era una scelta fra tre strade con tre costi: era **gradino 1** della scala 4bis, e non me n'ero accorto. La lezione è quella scritta in `CLAUDE.md` e che vale la pena riconoscere quando la si sbaglia: *prima domanda sempre, quello che serve shadcn ce l'ha già? Si chiede, non si presume* — e io avevo chiesto all'MCP, che elenca gli **item**, non alla documentazione, che spiega gli **usi**. Le due cose non si sostituiscono.

Conferma di contorno: la stessa strada era già stata **provata e misurata** in M2.4 sugli alert — aggiungere `info`, `success` e `warning` ai nomi di variante manda `check:registry` in rosso, «diverge dall'originale FUORI dalle stringhe di classi: nomi di varianti». Le due evidenze puntano nello stesso posto.

### Ma shadcn si ferma un passo prima di dove serve a noi

Il suo esempio scrive `bg-green-50` **a mano, nel punto d'uso**. Due cose non vanno: la regola 3 (i colori escono dai token del tema, non dalla tavolozza di Tailwind), e — che pesa di più — un badge di stato si scrive **dentro la definizione di colonna di ogni tabella di ogni app**. Una terna di classi ripetuta lì è il punto esatto da cui le app del v1 hanno cominciato a divergere.

Quindi: **la forma di shadcn, coi nostri token in un posto solo.** Nuovo item `toni` (`registry/tassullo/lib/toni.ts`), che esporta `TONO` — le quattro terne `X-border` / `X-subtle` / `X-subtle-foreground` più il **neutro** — e `TONO_ALERT`, la stessa terna con in più la classe che colora la descrizione dell'alert, che altrimenti resterebbe grigia dentro un riquadro colorato.

```tsx
<Badge className={TONO.success}>Attivo</Badge>
```

**Nessuna primitiva è stata toccata**: `badge.tsx` e `alert.tsx` restano identici all'originale nella forma, `componenti-propri.json` resta vuoto, il gate resta verde. È un **helper**, non un componente: non sta al posto di niente.

Il **neutro** merita una riga: non è una famiglia semantica e non ha token propri (sotto ci sono i neutri di shadcn, gli stessi di `secondary`). Sta nella mappa perché è lo stato che *non dice niente* — «archiviato», «non applicabile» — e una tabella di stati che lo lascia fuori costringe a uscire dal file per un caso solo.

Ricaduta sulla story `Prodotti`: la colonna Stato non è più `variant`, è `TONO_STATO`, e ci si guadagna anche **sul significato** — prima `pubblicato` prendeva `variant="default"`, cioè l'arancio del brand, e un colore d'identità usato come esito è un colore che dice la cosa sbagliata. Ora bozza è ambra, in revisione azzurro, pubblicato verde, archiviato grigio, e l'arancio torna a essere solo il marchio.

### Il gate cresce di una cartella

`lib/toni.ts` è un file fatto **di sole stringhe di classi**, cioè esattamente ciò che la regola 3 governa — e `lib/` era l'unica cartella del registry che il gate non guardava. `check:registry` ora copre **`ui/`, `blocks/` e `lib/`**; le ultime due con la sola regola 3, e la stampa distingue «blocco Tassullo» da «helper Tassullo». Un esadecimale lì dentro sarebbe passato liscio per sempre.

### La story «Minima» non diceva cosa mostrava

**Il rilievo di Francesco**: «La Story minima cosa vuole mostrarmi?» Nessuna risposta possibile guardandola — era la stessa tabella con meno roba sopra, senza una riga che dicesse perché. È il rilievo identico a quello di `Fascia Stretta` in M3.2, e la stessa lezione: **una dimostrazione che non si dichiara si legge come un caso qualsiasi, o come un guasto.**

Rinominata **`Elenco Corto`** e dotata di uno scopo scritto: prova che tutto il contorno è **facoltativo** — `cerca={false}`, `colonneNascondibili={false}`, restano tabella e paginazione — cioè che il blocco non impone la propria barra a chi lo installa. La prosa dice anche con cosa va confrontata (`Prodotti`, la stessa tabella col contorno acceso): la differenza fra le due *è* il contenuto della story.

### Verifiche

`npm run check` verde sui cinque gate: **920 scansioni / 4 passate / 0 violazioni** (230 story, +1 — la nuova `Primitive/Badge → Toni Semantici`, che è anche la prova di contrasto dei quattro toni nelle due modalità).
`check:registry` **0 errori**, 52 avvisi preesistenti, ora su tre cartelle. `shadcn registry validate` ✔ **58 item**. `build` ✔ · `build-storybook` ✔ · `lint` **3 avvisi preesistenti** · `registry:build` rilanciato.

---

## M3.3 (2 di 2) — Il degrado a schermo stretto: shadcn scorre, e noi scorriamo meglio (2026-09-11)

Seconda e ultima sessione del task doppio. Il collaudo su scrivania è chiuso — i suoi due rilievi sono nelle code (1) e (2) — e resta la domanda che era stata messa da parte: cosa fa questa tabella a 375px.

### Prima: cosa fa shadcn, chiesto e non presunto

`dashboard-01` è l'unico blocco shadcn con una tabella dentro, ed è la sua risposta al problema. Letto il sorgente con `shadcn view`: **non nasconde nessuna colonna sotto nessuna soglia.** Le uniche classi responsive intorno alla tabella sono sulla **chrome di paginazione** — `hidden flex-1 … lg:flex` sul conto delle righe, `hidden size-8 lg:flex` sui salti a prima e ultima pagina — cioè esattamente ciò che questo blocco già faceva da M3.3 (1) con `hidden sm:inline-flex`. La tabella **scorre**, punto.

Quindi il comportamento che avevo annotato come «non è un degrado progettato» era già, alla lettera, la risposta documentata. Il rilievo resta valido come giudizio di qualità, ma la base di partenza non era un'omissione: era una scelta, e loro l'hanno fatta.

### Poi: un buco del gate che sospettavo, e che non c'era

L'ipotesi era che `test:a11y` misurasse solo alla viewport predefinita e quindi non vedesse mai il caso stretto — in particolare la regola `scrollable-region-focusable`, che chiede che un riquadro scorrevole sia raggiungibile da tastiera. Verificato con axe-core in Chromium a **375 e 1440 px, per entrambe le densità**: la regola **non scatta**, e correttamente — axe non la applica a un riquadro che contiene già controlli a fuoco, e qui dentro ci sono caselle e bottoni, quindi tabulando il contenuto si porta in vista da sé.

Le tre violazioni che una scansione grezza riporta (`landmark-one-main`, `page-has-heading-one`, `region`) sono artefatti dell'imbracatura di Storybook, che la configurazione del gate disattiva. **Nessuna correzione fatta**: si annota che l'ipotesi è stata verificata e smentita, perché un sospetto non verbalizzato torna.

### Cosa si è fatto: scorrere, ma senza perdere il segno

Il difetto vero di «scorre e basta» si vede solo provandolo a 320px: con due terzi di tabella fuori dal riquadro si finisce a **leggere una data senza sapere di che prodotto sia**. Non è un problema di quantità di colonne, è di **riferimento**.

`bloccaPrimaColonna` tiene ferme a sinistra la casella di selezione e la colonna che identifica la riga. Tre cose che una cella bloccata deve fare, e nessuna la fa da sé:

1. **un fondo opaco proprio.** Le righe sono trasparenti sul `bg-card` del riquadro: una cella `sticky` senza fondo lascia scorrere il testo delle altre colonne **sotto** il proprio. Non sembra un difetto di impaginazione, sembra un guasto di resa;
2. **seguire lo stato della riga.** Quel fondo opaco vince su `hover:bg-muted/50` e su `data-[state=selected]:bg-muted` della riga, quindi la colonna ferma resterebbe bianca mentre il resto si tinge. Si riprendono dal gruppo della riga (`group/riga`), e lo stack di colori resta lo stesso — un velo di `muted` sopra `card`;
3. **dire che è bloccata.** Il bordo destro è il segno, e non serve altro: il contenuto passa **sotto** quel filo, e una cosa che si vede scorrere non ha bisogno della scritta «scorri».

`left-0` e `left-10` non sono numeri scelti a occhio: `10` è la larghezza della colonna di selezione (`w-10`), quindi la seconda bloccata si appoggia esattamente al bordo della prima — ed entrambe derivano da `--spacing`, quindi **il blocco regge anche in densità touch**, dove le stesse utility valgono il 50% in più.

**Misurato** in Chromium, riquadro da 320px: `scrollWidth` 760 su `clientWidth` 300; portando `scrollLeft` a 260, casella e `Codice` restano a x=26 e x=66 con `position: sticky`, mentre `Nome` è scivolato a **x=−66**, cioè sotto di loro. Il bordo è 1px del token `--border` sulla seconda colonna bloccata, verificato sul calcolato e non a occhio (nello screenshot a quella scala è quasi invisibile, ed è il motivo per cui si misura).

### Una scelta che lascio sindacabile

`bloccaPrimaColonna` è acceso anche su `Prodotti`, cioè a schermo intero, dove **niente scorre**. Guardato a 1440: il filo verticale dopo `Codice` non legge come rumore, legge come il separatore fra la colonna che *identifica* e quelle che *descrivono*. Ma è una scelta di disegno, non una necessità: a schermo intero un bordo «di blocco» promette uno scorrimento che non sta avvenendo. Se Francesco lo preferisce via a piena larghezza è un flag, e la strada tecnica per accenderlo solo quando serve davvero (cioè quando il riquadro scorre) richiede JavaScript, perché «la tabella sborda» non è una soglia di larghezza e nessuna container query lo sa.

### La nuova story, e perché è stretta di proposito

`Stretta` mette la tabella in un riquadro da **320px a qualunque viewport**, come la `Fascia Stretta` di `page-header` e per la stessa ragione tecnica: l'imbracatura del gate non ha un modo affidabile di cambiare viewport, quindi un caso che esiste solo sotto una media query è un caso che il gate non misura mai. La didascalia sopra il riquadro dichiara la larghezza e il perché — è la lezione della coda di M3.2, dove una dimostrazione non dichiarata si leggeva come un guasto.

### Il confine che questa sessione NON attraversa

**Se 375×touch sia un bersaglio è D10, e il verdetto è di M4.2**, su una pagina lista vera. Qui si è fatta la parte che è della tabella: che scorrere sia onesto. Se M4.2 deciderà che a quella larghezza una tabella non ci va, la risposta non sarà una soglia dentro questo blocco — sarà una **pagina** diversa, e il posto dove scriverla è lì.

### Verifiche

`npm run check` verde sui cinque gate: **924 scansioni / 4 passate / 0 violazioni** (231 story, +1).
`build` ✔ · `build-storybook` ✔ · `lint` **3 avvisi preesistenti** · `registry:build` rilanciato.
`misura:bersagli`: **2203 bersagli su 231 story, 0 piccoli in entrambe le direzioni**.
axe-core a mano in Chromium, **quattro celle** 375/1440 × normale/touch: nessuna violazione oltre agli artefatti dell'imbracatura.
Misure di scorrimento e di blocco: vedi sopra, tutte prese in Chromium headless e non nel pannello.

---

## D17 chiusa — il resize delle colonne non entra, ma il grilletto è scritto (2026-09-11)

Aperta e chiusa nella stessa giornata, e va bene così: il giro serviva a sapere cosa costava.

**La decisione di Francesco: no per ora.**

**Il ragionamento.** Il resize risolve **un** problema — una colonna troppo stretta per il suo contenuto — e da M3.3 quel problema si risolve già dichiarando `meta.larghezza`, a costo zero. Contro, la maniglia da trascinare non esiste in shadcn (verificato su `table.tsx` e sul suo originale: zero occorrenze) e sarebbe il **primo componente nostro in assoluto**, in un `registry/componenti-propri.json` che oggi è vuoto ed è la condizione che il progetto difende. Scrivere il primo pezzo proprio per un problema già risolto è il peggior momento possibile per cominciare.

**Ciò che la distingue da un rinvio: è scritto cosa la riapre.** Una tabella i cui dati non hanno una lunghezza prevedibile, dove quindi nessuna larghezza dichiarata è quella giusta per tutte le righe. Se capita, si rilegge `docs/DECISIONI.md` §34 — i quattro costi sono già misurati, non da riscoprire — e si decide di nuovo, non da capo.

**Nota di conduzione, su di me.** La prima volta che ho messo questa decisione a Francesco l'ho fatto con una domanda che lui ha respinto così: «Si fa fatica a capire cosa scrivi». Era vero — quattro costi tecnici impacchettati in un paragrafo, con dentro `columnSizingFeature`, «gradino 4», «regola 3 anche negli style inline». Rifatta in cinque righe di italiano, la decisione è arrivata al primo colpo. **Una decisione che l'interlocutore non riesce a leggere non è una decisione che gli è stata posta**, ed è un difetto mio di scrittura, non suo di lettura. Vale anche per questi documenti.

---

## M3.3 chiusa — riepilogo del task doppio

| | |
|---|---|
| **Sessioni** | 2, più 2 code di collaudo |
| **Item nuovi** | `tassullo-data-table` (blocco), `toni` (helper) — **58 item** |
| **Dipendenza nuova** | `@tanstack/react-table` 9.2.4 |
| **Primitive toccate** | `table.tsx`, una stringa di classi (l'intestazione prende terra). Forma identica all'originale |
| **Componenti nostri** | **zero** — `componenti-propri.json` resta vuoto |
| **Gate** | 924 scansioni / 4 passate / **0 violazioni**, 231 story |
| **Decisioni** | **D17 chiusa** (no al resize, col grilletto scritto) |
| **Aperto e passato oltre** | **D10**, se 375×touch sia un bersaglio: verdetto in **M4.2**, su una pagina lista vera |

I criteri del piano — «tabella di prova su ~500 righe finte, ordinabile e filtrabile da tastiera; degrado a 375px verificato» — sono stati **provati e non dichiarati**: 500 righe generate con seme fisso, tastiera cronometrata in Chromium (1 Tab alla ricerca, 4 all'intestazione, Invio ×3 e l'ordine di partenza torna), degrado misurato a 320px di riquadro.

### Prossimi passi

**M3.4** — `form-field`, `confirm-dialog`, `responsive-dialog`. Il criterio è il più netto della fase: *la stessa chiamata rende come dialog a 1440px e come drawer a 375px, **senza `if` nella pagina***. Da portarci dentro due cose imparate qui: che le soglie si scrivono sull'**elemento** e non sulla viewport (§31), e che un componente con un popup va misurato **in tutti e due gli stati**, o il gate non sa niente di metà del suo comportamento.

---

## M3.4 — i moduli e i dialoghi: tre blocchi, e una soglia che non è nostra (2026-09-11)

Tre item nuovi — `tassullo-form-field`, `tassullo-confirm-dialog`, `tassullo-responsive-dialog` — e il registry passa a **61**. Nessuna primitiva toccata, `registry/componenti-propri.json` resta vuoto.

### Prima cosa: cosa ha detto l'MCP

La scala di `CLAUDE.md` §4bis comincia sempre dalla stessa domanda, e la risposta qui è stata parziale, che è il caso più interessante.

- **`form-field`** — `field` di shadcn c'è ed è installato. `@shadcn/form` esiste ancora come *nome* nel registry, ma nello stile `base-nova` è un **guscio vuoto**: `curl` sul suo JSON restituisce un item senza `files` e senza dipendenze. Non è una svista loro, è la scelta: in 4.x il `form.tsx` è stato ritirato e la strada documentata è `Controller` + `Field`, scritti a mano campo per campo (`docs/forms/react-hook-form`).
- **`responsive-dialog`** — esiste `@shadcn/drawer-dialog`, ed è un **esempio**, non un componente installabile. Il suo sorgente (letto dagli stili `default` e `new-york`, perché in `base-nova` l'esempio non è pubblicato) è la coppia `useMediaQuery` + `if`.
- **`confirm-dialog`** — cercando `confirm`: **nessun risultato**. `alert-dialog` è la primitiva, e sopra non c'è niente.

Quindi: gradino 1 dà le primitive, che erano già in casa; gradino 2 non ha niente da ri-stilare; e ciò che manca non è un componente ma **il contorno**, esattamente come per `data-table` in M3.3. Sono blocchi, non componenti nostri — la riga in `componenti-propri.json` non serve, e il gate infatti non la chiede.

### `form-field` — cinque collegamenti, e la quinta shadcn non la fa

L'esempio ufficiale di shadcn è **quindici righe per campo**, di cui dodici identiche al campo precedente. Dentro quelle dodici stanno quattro cose che, dimenticate, **non danno errore**: `data-invalid` sul `Field`, `aria-invalid` sul controllo, `htmlFor`/`id` appaiati, e `<FieldError>` reso solo quando serve.

E ce n'è una **quinta, che l'esempio di shadcn non fa affatto**: `aria-describedby`. Una `<FieldDescription>` non collegata è testo che sta lì accanto e che un lettore di schermo non legge quando il fuoco entra nel campo, cioè nel momento in cui serviva. Qui descrizione ed errore hanno un `id` derivato da quello del campo, e il controllo li dichiara entrambi.

**L'`id` non è il `name`.** Due moduli nella stessa pagina — la scheda e il dialogo che la modifica, che è proprio lo scenario di questa sessione — avrebbero due `id="nome"`, e il secondo `htmlFor` punterebbe al primo campo: nel DOM è legale, nel browser il clic sull'etichetta mette il fuoco nel campo sbagliato, e non lo segnala nessuno. `useId()` per istanza.

**I figli sono una funzione, non del JSX**, e non è estetica. Un prop `tipo="testo" | "select" | …` dovrebbe crescere di un ramo a ogni controllo nuovo, e ogni ramo sarebbe una prop in più da inoltrare: è la strada per cui un blocco finisce per reimplementare, peggio, le prop dei componenti che avvolge. La funzione tiene anche onesto un dettaglio che si sarebbe scoperto tardi: `Checkbox` e `Switch` di Base UI parlano `checked`/`onCheckedChange`, e `{...campo}` sputato dentro non funziona. Nella story `Scelte` si vede la rimappatura, in due righe.

### `confirm-dialog` — l'attesa è la ragione, non l'impacchettamento

L'impacchettamento da solo non avrebbe giustificato un blocco. La ragione è la **macchina a stati dell'attesa**, che serve una volta per tutte le app invece che una per pagina: `onConferma` può restituire una promessa, e finché non si risolve il dialogo resta aperto, la conferma mostra l'indicatore e si disabilita, l'annullo si disabilita, `Esc` e il clic fuori non chiudono. Se la promessa è **rifiutata** il dialogo resta aperto e riprovabile.

Senza, il comportamento diffuso è: si chiude subito, la richiesta fallisce in silenzio, l'utente crede di aver cancellato.

**Misurato** in Chromium sulla story `In Corso`, quattro letture dello stesso dialogo:

| stato | indicatore | conferma | annullo | aperto |
|---|---|---|---|---|
| a riposo | no | attiva | attivo | sì |
| durante l'attesa (400ms) | **sì** | **disabilitata** | **disabilitato** | sì |
| `Esc` durante l'attesa | sì | disabilitata | disabilitato | **sì** |
| a cose fatte | — | — | — | **no** |
| dopo un **rifiuto** | no | attiva | attivo | **sì** |

L'ordine dei bottoni è verificato sul calcolato e non a occhio: annulla a x=752, conferma a x=825, cioè annulla a sinistra. Il colore della conferma distruttiva è `oklch(0.5771 0.2152 27.33)` — il **fondo** `--destructive`, applicato dalla variante del componente, non `text-destructive`, che su fondo scuro dà 3.52:1 (M3.2).

**La forma controllata non è un di più.** Il caso vero delle app Tassullo è la voce di un menu di riga della tabella, e lì il grilletto non può stare dentro: cliccando la voce il menu si chiude e si smonta, e con lui si smonterebbe il dialogo che stava per aprire. È il `dropdown-menu-dialog` di shadcn, ed è la story `Da Un Menu Di Riga`.

### `responsive-dialog` — il criterio del piano, misurato

Il criterio era il più netto della fase: *«la stessa chiamata rende come dialog a 1440px e come drawer a 375px, senza `if` nella pagina»*. **Misurato in Chromium**, sei celle, sulla story `Automatico` — che è una chiamata sola, senza rami:

| cella | forma | larghezza | posizione | respiro del corpo | intestazione |
|---|---|---|---|---|---|
| 1440 × normale | **dialog** | 384px | centrato (266 sopra, 266 sotto) | 0 (è il `p-4` del pannello) | `start` |
| 1440 × touch | **dialog** | 384px | centrato (197/197) | 0 | `start` |
| 768 × normale | **dialog** | 384px | centrato | 0 | `start` |
| **767** × normale | **drawer** | 767px | appoggiato in fondo (fondo = **0**) | **16px** | `left` |
| 375 × normale | **drawer** | 375px | fondo = 0 | 16px | `left` |
| 375 × touch | **drawer** | 375px | fondo = 0 | **24px** | `left` |

Il salto è **esattamente** fra 768 e 767. Il respiro del corpo segue la densità (16 → 24px), che è `px-4` con `--spacing` a 0.375rem.

**La soglia non è nostra, ed è la cosa migliore di questo blocco.** È `useIsMobile()`, l'hook che shadcn installa insieme a `sidebar` e che il registry ha già. Il vantaggio non è risparmiare dieci righe: è che **il dialogo cambia forma allo stesso pixel in cui il guscio toglie la colonna**. Due soglie scritte in due posti sarebbero rimaste uguali per un po' e poi si sarebbero staccate, e un'interfaccia che cambia grammatica a 40px di distanza si legge come un guasto. Per la stessa ragione **non c'è una prop `soglia`**: una soglia che ogni app può spostare è una soglia che in tre app vale tre numeri.

Ero partito scrivendo un lettore di `matchMedia` con `useSyncExternalStore` — tecnicamente migliore dell'hook di shadcn, che legge in un `useEffect` e quindi torna sempre «scrivania» al primo render. L'ho buttato: il primo fotogramma qui è quello del pannello **chiuso**, non c'è niente da vedere, e il difetto morde in un caso solo — un dialogo già aperto al montaggio. Se capita, il rimedio non è una copia locale: è correggere `use-mobile.ts`, dove `sidebar` ne beneficia insieme a noi. È la regola permanente di `CLAUDE.md` applicata a un hook invece che a un token.

### Perché qui la media query è giusta, e §31 non è smentita

`docs/DECISIONI.md` §31 dice il contrario per il guscio, la fascia e la tabella: le soglie guardano l'**elemento**, perché sotto i 768px la colonna esce dal DOM e lo schermo che si allarga di 1px restringe l'area utile di 255. Quel ragionamento vale per ciò che sta **dentro** il guscio.

Un dialogo non ci sta dentro: è reso in un portale appeso alla radice, `position: fixed` — misurato, `position` vale `fixed` in tutte e sei le celle. La colonna non gli toglie niente e il suo contenitore *è* la viewport, quindi la discontinuità che rendeva sbagliata la media query negli altri tre casi qui **non esiste**. Una container query, per di più, non avrebbe su cosa appoggiarsi: il contenitore da interrogare non è ancora montato nel momento in cui si decide.

Si è valutato di leggere il **puntatore** (`(pointer: coarse)`), che è più vicino alla domanda vera — «che forma ha il dispositivo» invece di «quanto spazio ho» — ma sbaglia i due casi che contano per noi: il portatile col touch screen in cantiere, che riceverebbe un cassetto su quindici pollici, e il telefono collegato a una tastiera.

### Due difetti presi misurando, e non guardando

**Il primo è nostro, ed è chiuso.** `<DrawerHeader className="text-left">` — che è letteralmente ciò che scrive l'esempio di shadcn — **non funziona** con la nostra primitiva: `DrawerHeader` centra con `group-data-[swipe-axis=y]/drawer-popup:text-center`, e tailwind-merge non riconosce come coppia due classi di cui una porta una variante, quindi le tiene entrambe e vince la più specifica. Misurato: `textAlign` restava `center` in tutte e tre le celle a cassetto, mentre la documentazione del blocco diceva «a sinistra». Si sovrascrive con **la stessa variante**. È lo stesso genere di trappola di specificità di M3.1 (`in-data-[density=touch]:` che genera `:where()` e pesa zero), in un'altra forma: **una classe nuda non batte una classe con variante, e nessuno lo segnala.**

**Il secondo non è nostro, ed è dichiarato.** Il fuoco, nella forma a **dialogo**, esce dal pannello per due stop prima di rientrare dalla guardia: `… → Close → ·guardia· → ‹FUORI› → ‹FUORI: grilletto› → ·guardia· → primo campo`. Prima di attribuirselo si è confrontato con le story della **primitiva**: `Primitive/Dialog → Fuoco Intrappolato` e `→ Con Form` danno **lo stesso identico giro**, stop per stop. È comportamento di Base UI, non di questo blocco, e va letto insieme al registro delle `aria-hidden-focus` di `CLAUDE.md`. La forma a **cassetto** invece intrappola davvero: otto `Tab` e il fuoco non esce mai. `Esc` chiude in tutte e due le forme.

Vale la pena notare *perché* la misura è stata possibile: axe su questo non dice niente — è la stessa famiglia di D15, la tastiera del calendario, dove zero violazioni convivevano con una griglia non navigabile.

### Un inciampo di strumento, per chi rifarà queste misure

Il primo giro di misure dava il cassetto con `top: 902` in una viewport da 900, cioè fuori schermo. Non era un difetto: era la transizione di entrata, letta a metà. La `waitFor` che confrontava due fotogrammi consecutivi passava troppo presto, perché su una curva in uscita il movimento per fotogramma diventa piccolo molto prima che finisca. Con 1200ms di attesa il fondo del cassetto è **0** in tutte e tre le celle. È §32 un'altra volta: **qualunque misura su qualcosa che transisce si prende a pagina ferma**, e «ferma» non è «quasi ferma».

Secondo inciampo, più banale: Storybook esegue le `play` anche nel canvas, quindi le story dei dialoghi arrivano **già aperte** e un `click` sul grilletto va a sbattere contro lo sfondo inerte. Lo script non clicca, aspetta — è la stessa lezione che `misura:bersagli` porta scritta in testa.

### Verifiche

`npm run check` verde sui cinque gate: **972 scansioni / 4 passate / 0 violazioni** (243 story, +12).
`check:contrast` 48 coppie ✔ · `check:registry` 0 errori, 0 componenti nostri ✔ · `check:font` ✔ · `check:logo` ✔.
`tsc -b` ✔ · `build` ✔ · `build-storybook` ✔ · `lint` **3 avvisi preesistenti** · `registry validate` **61 item** ✔ · `registry:build` rilanciato.
`misura:bersagli`: **2241 bersagli su 243 story, 47 popup aperti, 0 piccoli in entrambe le direzioni**.
Le misure di forma, attesa e tastiera: vedi sopra, tutte in Chromium headless contro lo Storybook costruito, **senza aggiungere Playwright al repo** (è già una devDependency dal gate).

### Una nota sui tipi, perché è l'unica scorciatoia del blocco

`Dialog` e `Drawer` di Base UI hanno la stessa *forma* ma due tipi **nominalmente** distinti: il `handle` del cassetto porta un marchio `__drawerBrand`, il suo `onOpenChange` riceve un `reason` con un caso in più, lo stato del popup ha campi diversi. TypeScript ha ragione a rifiutare l'unione. Ciò che il blocco espone è però il **sottoinsieme comune** — apertura, grilletto, chiusura, titolo, descrizione, classi — e lì le due API coincidono davvero. I quattro `as` stanno tutti in cima al file, uno per famiglia, con il prezzo scritto accanto: passare un `handle` o un `payload` a `<ResponsiveDialog>` non viene fermato dal compilatore e non funzionerebbe nella forma a cassetto. Non è una prop che il blocco documenta.

### Dipendenze nuove

`react-hook-form` ^7.87 come **dipendenza** (il blocco importa `Controller`), e `zod` ^4.6 più `@hookform/resolvers` ^5.9 come **devDependencies**: lo schema e il resolver restano dell'app, e le story servono a dimostrare che il blocco ci lavora insieme senza saperne niente.

### Prossimi passi

**M3.5** — gli stati: `empty-state`, `page-skeleton`, `error-state`, lo standard unico per caricamento/errore/vuoto/successo che `docs/INTERFACCE.md` §1 di Anagrafe impone e che oggi ogni pagina reimplementa. Da portarci dentro: che `empty` è una primitiva già installata e già usata da `data-table` per i suoi **due** stati vuoti distinti — quindi la prima domanda non è «come si disegna», è «cosa aggiunge un blocco a `empty`», e la risposta dev'essere misurabile come lo è stata qui.

---

## Coda di M3.4 — la vetrina stretta, e le descrizioni di troppo (2026-09-11)

Due rilievi di Francesco sulla story `Blocchi/Campo di modulo → Predefinito`, entrambi giusti, e il primo istruttivo perché **non era del blocco**.

### «Perché tutto in una colonna strettissima in modalità desktop?»

Il modulo, a 1440px, rendeva largo **129px**. Non è un difetto di `form-field`: è la vetrina. Misurato risalendo la catena dei genitori:

| nodo | larghezza | display |
|---|---|---|
| `body.sb-main-centered` | 1440px | **flex** |
| `#storybook-root` | **193px** | block, ma è un *flex item* (`flex: 0 1 auto`) |
| `form.w-full.max-w-md` | **129px** | block |

`layout: 'centered'` rende `#storybook-root` un flex item la cui larghezza la decide il **contenuto**. Lì dentro `w-full` è circolare — la percentuale si risolve su un genitore che a sua volta aspetta il contenuto — e `max-w-md` fa da **tetto**, non da larghezza, quindi non partecipa: il modulo collassa sulla larghezza intrinseca dei campi.

Correzione: `layout: 'padded'` sul meta e `max-w-md` **senza** `w-full`. Rimisurato: root 1408, modulo **448px**, campi 448. La combinazione `w-full` dentro un contenitore che si stringe è stata tolta anche dalla story `Adattiva`, dove c'era lo stesso innesco.

Perché non si era visto prima: i tre gate che girano su queste story — axe, contrasto, bersagli — misurano **colori e altezze**, non larghezze; e `misura:bersagli` guarda i bersagli, che in un modulo stretto restano alti uguale. Una story può essere verde su tutti e cinque i gate e **sembrare rotta**, ed è il limite che vale la pena ricordare: i gate dicono che non c'è un difetto noto, non che la vetrina sia guardabile.

Vale anche il rovescio: i tre blocchi a dialogo non mostravano il problema perché rendono in un **portale**, cioè fuori da quella catena di genitori.

### «Non metterei una descrizione fra un campo e l'altro»

Accolto, e la regola è scritta nel blocco invece che nella sola story. Una riga d'aiuto sotto ogni campo raddoppia l'altezza del modulo e lo fa leggere come documentazione invece che come una cosa da compilare: chi lo usa tutti i giorni la salta dopo la seconda volta, e allora tanto vale che non ci sia. **Un campo che ha bisogno di essere spiegato ha quasi sempre l'etichetta sbagliata**, e l'etichetta costa zero pixel.

`descrizione` resta — non è la stessa cosa di un'etichetta — ma per il **vincolo che il campo non mostra da sé**: un limite di caratteri, un formato obbligato, una conseguenza non reversibile. Nella vetrina ne è rimasta **una** su cinque campi, sulle note tecniche, dove il limite di 2048 caratteri è una regola di BC e non una spiegazione.

La riga sta in tre posti, perché sono tre lettori diversi: il JSDoc della prop (chi scrive il codice), la pagina della story (chi guarda la style guide) e il campo `docs` dell'item (chi installa il blocco in un'app).

### Verifiche

`npm run check` verde: **972 scansioni / 0 violazioni**, 243 story. `tsc -b` ✔ · `lint` 3 avvisi preesistenti · `registry:build` rilanciato.
Larghezze rimisurate in Chromium a 1440px: `Predefinito` 448px, `Adattiva` 512/288, `Scelte` 448.

---

## D18 aperta — conferma o annullo: si decide ora, si costruisce in M3.5 (2026-09-11)

Aperta da Francesco a `confirm-dialog` appena scritto: «mettiamo un alert o sonner con es. la possibilità per l'elimina di annullarlo? Vale la pena definirlo ora».

**Sì vale la pena ora; no, non dentro `confirm-dialog` e non in M3.4.** Le quattro ragioni, ciascuna verificabile, stanno in `docs/DECISIONI.md` §35. In breve:

1. **Non sono complementari, sono alternative.** Rispondono alla stessa domanda — «e se non volevo?» — e insieme fanno due interruzioni per un'azione sola. Peggio: se tanto si può annullare, il dialogo si clicca via senza leggerlo, cioè smette di proteggere proprio nel momento per cui esiste.
2. **Quale dei due lo decide il dato, e Anagrafe la regola ce l'ha già scritta**: `PIANO.md` di Anagrafe dice «soft delete solo dove indicato, tutto ciò che è dichiarato verso l'esterno non si cancella mai, **si supera**». Quindi la gran parte delle azioni che *sembrano* distruzioni sono passaggi di stato reversibili — il caso da **annullo**, dove un dialogo è attrito che non compra niente — e restano poche cancellazioni vere, dove il dialogo serve.
3. **Un vincolo tecnico che il disegno non aggira**: un «Annulla» nel toast è una bugia se l'API ha già cancellato e non sa ricreare. O l'azione è **differita** (il toast è la finestra) o l'API espone un **ripristino**. È la domanda che resta a Francesco, ed è l'ingresso di M3.5.
4. **Il posto esiste già**: M3.5 è lo standard unico per caricamento, errore, vuoto e **successo**, e l'annullo è una forma del successo. `INTERFACCE.md` §1.1 di Anagrafe ha già scritto la regola d'ingaggio — «Toast: si adotta UN solo pattern in questo file prima di usarlo, non uno diverso per pagina» — e un toast infilato dentro `confirm-dialog` sarebbe esattamente quello, per di più diffuso in tre applicazioni in un colpo solo.

**Metà della regola era già scritta e non me ne ero ricordato**: la story `Primitive/Sonner → Con Azione`, dalla FASE 2, dice «l'azione dentro un toast è **sempre ridondante**: il toast sparisce, e chi non fa in tempo dev'essere in grado di fare la stessa cosa dalla pagina». È un vincolo che vale a prescindere dall'esito di D18 — un annullo che è l'**unica** via di rientro non è accettabile, perché sette secondi non sono una garanzia.

`confirm-dialog` resta come consegnato in M3.4: nessun toast dentro, e l'errore che l'app racconta dove sa cosa dire.

---

## Coda di M3.4 (2) — il respiro fra i campi scende di un gradino (2026-09-11)

Rilievo di Francesco, sollevato due volte: «c'è tanto spazio fra titolo campo e campo digitabile e fra un campo e il successivo, è normale?».

**Misurato prima di rispondere**, e la prima risposta è stata: sì, è normale nel senso stretto che era **il default di shadcn intatto** — `field.tsx` non aveva ricevuto nessun ri-stile.

| | prima | shadcn di serie |
|---|---|---|
| etichetta → campo (`Field`, `gap-2`) | 8px | 8px |
| campo → campo (`FieldGroup`, `gap-5`) | 20px | 20px |

**Una mia spiegazione sbagliata, e vale la pena scriverla.** Avevo attribuito la percezione allo zoom dello screenshot; Francesco ha risposto che il browser era già al 100%, e aveva ragione. Lo screenshot arriva a 2× perché lo schermo è Retina, non perché la pagina sia ingrandita — sono due cose diverse e le avevo confuse. La lezione di conduzione è la stessa di M3.3: **una misura mia non vince su un'osservazione sua**, perché le due non parlavano della stessa cosa. Il numero era giusto (8 e 20px, fissi) e la domanda era di disegno, non di misura.

### Cosa è cambiato, e perché quel gradino e non un altro

`FieldGroup`: `gap-5` → **`gap-4`** (20 → 16px), e i gruppi annidati `gap-4` → `gap-3` per non perdere la distinzione fra livello esterno e interno. `Field` resta `gap-2`: 8px dentro il campo erano già stretti.

Il numero da guardare non è 16, è il **rapporto**: 8 dentro il campo e 16 fra i campi tengono il 2:1 che fa leggere il modulo come **gruppi** invece che come un elenco uniforme di righe. Provato anche 6/12, ed è troppo: a quei valori l'etichetta del campo successivo comincia a sembrare la didascalia del campo precedente. Il rapporto sopravvive, la densità informativa sale.

Misurato dopo, nelle due densità:

| | normale | touch |
|---|---|---|
| etichetta → campo | 8px | 12px |
| campo → campo | **16px** | **24px** |
| altezza del gruppo (4 campi) | 351 → **339px** | 488 → **470px** |

Dodici pixel su quattro campi non sono niente; su una scheda prodotto di Anagrafe da quindici campi sono **una sessantina**, cioè una schermata che si scorre in meno.

### È un ri-stile, ed è il gradino 2

Solo stringhe di classi, forma identica all'originale: `check:registry` lo conta come **«field.tsx — forma identica all'originale, 4 stringhe di classi ri-stilate»**, che è esattamente lo stato in cui un componente resta aggiornabile. Non serviva chiedere niente a nessuno secondo §4bis, ma **cambia ogni modulo di tutte e tre le app**, quindi è annotato qui invece che passato in silenzio: chi aprirà una scheda e la troverà più fitta di `ui.shadcn.com` deve poter sapere che è voluto e quanto vale.

### Verifiche

`npm run check` verde: **972 scansioni / 0 violazioni**, 243 story. `tsc -b` ✔ · `build-storybook` ✔.
Spaziature rimisurate in Chromium, densità normale e touch: vedi tabella sopra.

---

## M3.5 — Stati: `empty-state`, `error-state`, `page-skeleton`, `toast-con-annullo` (2026-09-15)

Lo standard vincolante unico che `INTERFACCE.md` §1.1 di Anagrafe impone per caricamento, errore, vuoto e successo — oggi reimplementato da ogni pagina (`prd-vuoto`, `pdt-vuoto`, …). Quattro item, non tre: il quarto è il verdetto di **D18**, rimasta aperta da M3.4, che andava chiuso qui perché l'annullo è una forma del successo (`docs/DECISIONI.md` §35).

### D18 chiusa prima di scrivere codice

Aperta a Francesco la domanda del punto 3 di §35 — soft-delete ripristinabile lato API, o azione differita lato client? — la risposta è stata **«non so, spiegami cosa comporta ogni scelta»**. Spiegati i due costi (nessun contratto backend nella strada differita, contro un endpoint che oggi non esiste per Anagrafe nella strada del ripristino), la scelta è **differita lato client**, **esplicitamente provvisoria**: da rivedere con Roberto a design system finito. Verdetto e motivazione a verbale in `docs/DECISIONI.md` §35.

### I quattro item

- **`tassullo-empty-state`** (`registry/tassullo/blocks/empty-state.tsx`) — compone la primitiva `empty` (M3.5 l'aveva già anticipata come mattone, `Primitive/Empty`), fissando l'unico default che quella lascia aperto: il bordo tratteggiato acceso, forma che ogni punto d'uso finora sceglieva a mano.
- **`tassullo-error-state`** (`error-state.tsx`) — **la stessa primitiva del vuoto**, non `alert`: lo diceva già la story `Errore` di `Primitive/Empty`, scritta apposta in una sessione precedente come traccia per questo blocco. Un errore che sostituisce un'intera sezione è uno stato della pagina, non una riga di testo accanto al contenuto. La traduzione del messaggio (mai uno stack trace, mai un codice HTTP nudo, un 403 sempre "Non hai i permessi per questa azione") resta dell'app, che sa cosa il server ha davvero risposto — il blocco dà solo la forma.
- **`tassullo-page-skeleton`** (`page-skeleton.tsx`) — tre `variante`: `tabella` (default), `scheda`, `elenco`. Compone `skeleton`: le larghezze di colonna sono deliberatamente disuguali fra loro, perché è quel disallineamento leggero a leggersi come "sta arrivando" e non come una griglia già disegnata.
- **`tassullo-toast-con-annullo`** (`toast-con-annullo.tsx`) — il verdetto di D18. `toastConAnnullo(azione, opzioni)`: `azione` non parte finché il toast non si chiude da sé o viene scartato senza cliccare «Annulla». Verificato nella sorgente di `sonner` (`node_modules/sonner/dist/index.mjs`) che il clic sul bottone d'azione **non** passa da `onDismiss` — solo lo swipe e la X ci passano — quindi il flag `annullato` è la guardia giusta e basta, senza doppio conteggio.

Nessuno dei quattro è nostro nel senso della regola 4bis: sono blocchi (composizione sopra primitive shadcn esistenti — `empty`, `skeleton`, `sonner`, `alert-dialog` per riferimento), non sostituti di una primitiva. `registry/componenti-propri.json` resta vuoto.

### Verifiche

Ambiente ricostruito da zero in questa sessione (Mac riformattato): installato Homebrew Node (v26.8.2) e i `chromium`/`chromium-headless-shell` di Playwright, mancanti dopo il reset — senza quelli `test:a11y` restituiva silenziosamente **0 scansioni** invece di fallire, ed è un falso "verde" da non fidarsi mai: il numero di scansioni va sempre letto, non solo il conto delle violazioni.

`npm run check` verde: **1016 scansioni / 0 violazioni** (da 868 a 1016: le quattro nuove story hanno margine, nessuna dichiara popup e nessuna doveva). `check:registry`: 0 errori, i quattro blocchi passano la regola 3 (niente hex, niente valori arbitrari) — `componenti-propri.json` non tocco. `check:contrast`, `check:font`, `check:logo` verdi. `tsc -b` ✔ · `lint`: solo i 3 avvisi preesistenti su `use-mobile.ts`/`carousel.tsx`, nessuno sui file nuovi. `misura:bersagli`: 2245 bersagli su 254 story, **0 piccoli in entrambe le direzioni** — i quattro blocchi non introducono bersagli tattili nuovi (nessun controllo di taglia inedita).

### Prossimi passi

M3.6 `file-upload`. `componenti-propri.json` resta la condizione da difendere.

---

## M3.6 — `file-upload`: dropzone e elenco (2026-09-15)

Il caricamento allegati che `INTERFACCE.md` di Anagrafe non ha ancora: `allegati` ×10 e `caricamento` ×16 nella sua roadmap — documenti, foto TDS, asset REN/RES/IM1-9.

### D8, la prima delle quattro: `react-dropzone`

Chiesto all'MCP prima di scrivere codice (regola 4bis, gradino 1): shadcn non ha né `file-upload` né `dropzone`. Riusate due primitive già installate — `empty` per la cornice tratteggiata dello stato inattivo, `progress` per la barra — e scelto `react-dropzone` (v20.1.2) per il trascinamento vero e proprio: è un **hook puro**, `useDropzone` restituisce solo `getRootProps`/`getInputProps`/`open`, senza markup proprio da disfare, quindi la forma resta interamente nostra — la condizione che D8 chiede per essere sostituibile senza toccare l'API del blocco. `getErrorMessage` traduce i codici di rifiuto (tipo, dimensione, troppi file) una volta sola, qui: l'app non vede mai `"file-too-large"`.

D8 resta **TODO** in `CHECKLIST.md`: si chiude solo dopo M3.9, quando le altre tre scelte (PDF, editor, diff) sono fatte.

### Un errore preso dal gate, non a occhio

Prima versione: la cornice aveva `role="button"` e `tabIndex` (la forma di default che `getRootProps` darebbe da sé), con l'`<input type="file">` nascosto **dentro**. `test:a11y` l'ha presa subito: **`nested-interactive` ×2**, su tutte e quattro le passate — un `input` è interattivo di suo, e annidarlo in un contenitore reso interattivo da `role`/`tabIndex` è la violazione, non risolvibile ri-stilando (non è un colore, è la struttura, quindi 4bis non c'entra).

Corretto togliendo alla cornice ogni comportamento interattivo — `noClick`/`noKeyboard` a `useDropzone`, la cornice resta bersaglio di solo trascinamento — e mettendo un **bottone vero** (`<Button onClick={open}>`, `open` è la funzione che la libreria espone apposta) per l'apertura del selettore. `Tab` porta il fuoco dritto sul bottone, verificato in Chromium leggendo `document.activeElement` — non sulla cornice, che ora non è più focalizzabile. Tornato a **0 violazioni**, 1028 scansioni.

### I due componenti

- **`FileUpload`** (`registry/tassullo/blocks/file-upload.tsx`) — valida e seleziona (`accetta`, `dimensioneMassima`, `multiplo`), non carica niente da sé: l'upload vero (endpoint, retry, annullamento a metà) resta dell'app, che lo sa fare per il proprio backend — stesso confine di `error-state` sulla traduzione dei messaggi server.
- **`FileUploadList`** — renderizza un elenco di `FileUploadItem` (`in-coda | in-corso | riuscito | fallito`, `progresso` 0-100) che l'app tiene in stato. La stessa forma serve per l'elenco degli allegati già caricati in precedenza — passati come `riuscito`, senza `onRimuovi`.

Nessuno dei due è nostro nel senso della regola 4bis: compongono primitive shadcn esistenti (`empty`, `progress`, `button`), non sostituiscono una primitiva. `registry/componenti-propri.json` resta vuoto.

### L'accettazione, verificata e non dichiarata

Story `ConAvanzamentoEUnErrore`: bottone "Simula 5 caricamenti (uno fallisce)" che avvia cinque righe con una barra ciascuna. Provato in Chromium contro lo Storybook costruito: le cinque righe compaiono subito (`in-corso`, 0%), quattro arrivano a `riuscito`, `planimetria.pdf` si ferma al 60% e passa a `fallito` con **"Caricamento interrotto: il server non risponde. Riprova."** — schermo alla mano, non solo letto nel codice. Tastiera senza trascinamento: verificato sopra.

### Verifiche

`npm run check` verde: **1028 scansioni / 0 violazioni** (66 item, +1 dai 65 di M3.5). `check:registry`: 0 errori — `file-upload.tsx` passa la regola 3, `componenti-propri.json` non tocco. `check:contrast`, `check:font`, `check:logo` verdi. `tsc -b` ✔ · `build-storybook` ✔ · `lint`: solo i 3 avvisi preesistenti, nessuno sui file nuovi. `registry validate`: **66 item** ✔. `misura:bersagli`: 2250 bersagli su 257 story, **0 piccoli in entrambe le direzioni**.

Dipendenza nuova: `react-dropzone` ^20.1.2.

### Prossimi passi

M3.7 `pdf-preview` e `version-timeline` — la seconda scelta di D8, una libreria PDF.

---

## Coda di M3.6 — la X che non toglieva niente (2026-09-15)

Rilievo di Francesco: «il bottone "Simula 5 caricamenti" non fa nulla, e nemmeno la X per cancellare un allegato in "Allegati già caricati"».

**La X era davvero rotta, ed era della story, non del blocco.** `AllegatiGiaCaricati` passava `onRimuovi={() => {}}` — un elenco statico, senza stato: cliccare la X non poteva togliere niente perché non c'era una lista React da aggiornare. Corretto rendendola stateful come `ConAvanzamentoEUnErrore`: `onRimuovi` ora filtra l'array e il rimosso sparisce davvero.

**Il bottone "Simula" invece funzionava**, e il falso allarme è istruttivo. Riprovato in Chromium contro `npm run storybook` (dev server, non `storybook-static/` a doppio clic): le cinque righe compaiono nel DOM nell'istante del click — verificato leggendo `document.getElementById('storybook-preview-iframe').contentDocument`, cinque `[data-slot="file-upload-item"]`, `planimetria.pdf` già con l'errore. Il primo screenshot preso a ridosso del click ne mostrava però **una sola**: non un bug del componente, un artefatto di misura — lo stesso genere di trappola di §32 in `CLAUDE.md` (misurare qualcosa che sta ancora transendo/montando prima che si sia fermato). Aspettando qualche secondo, tutte e cinque comparivano correttamente. Resta però un'ipotesi più concreta per Francesco da verificare sul suo schermo: se sta aprendo `storybook-static/index.html` con un doppio clic invece di servirlo via HTTP, il bundle non parte affatto e **tutti e due** i bottoni sembrerebbero morti — è l'avvertimento già scritto in `CLAUDE.md` su `npm run storybook`/`build-storybook`.

### Verifiche

`tsc -b` ✔ · `build-storybook` ✔ · `test:a11y`: **1028 scansioni / 0 violazioni**, invariato. Riprovato a mano in Chromium: click sulla X di `scheda-tecnica-t30.pdf` in `AllegatiGiaCaricati` — la riga sparisce, resta solo `certificato-ce.pdf`.

**Il rilievo è tornato**: «Simula» restava morto anche a schermo suo, quindi il verdetto sopra era incompleto. La causa vera, confermata da Francesco: stava servendo Storybook da un host **diverso da `localhost`**. `avvia()` genera l'id di ogni riga con `crypto.randomUUID()`, ed è la **prima** istruzione della funzione — su un'origine che il browser non tratta come *secure context* (`localhost`/`127.0.0.1` lo sono, un altro host in rete no) `crypto.randomUUID` non esiste sull'oggetto `crypto`, la chiamata lancia, e tutto ciò che segue — il primo `setFile` compreso — non parte mai. Nessun log visibile senza aprire la console: da fuori è indistinguibile da un bottone che non fa niente, il sintomo esatto riportato due volte.

Tolta la dipendenza da `crypto.randomUUID()` nella story: un contatore locale (`nuovoIdDemo`) genera l'id, senza bisogno di un contesto sicuro. Non è **il** bug di `file-upload.tsx` — è nella story di dimostrazione, non nel blocco — ma vale la correzione perché lo stesso pattern (id generato con `crypto.randomUUID()` al primo passo di un handler) sarebbe tornato a rompersi silenziosamente ovunque uno storybook o un workbench giri fuori da `localhost`. Riverificato: `tsc -b` ✔, `build-storybook` ✔, `test:a11y` **1028/0** invariato.

---

## M3.7 — `pdf-preview` e `version-timeline` (2026-09-15)

Il cuore documentale di Anagrafe: `pdf` ×59 e `anteprima` ×9 nella sua roadmap per il primo, `storico` ×9 per il secondo.

### D8, la seconda delle quattro: `react-pdf`

Chiesto all'MCP prima di scrivere (regola 4bis, gradino 1): shadcn non ha un `pdf-viewer` o `document-preview`, né `timeline`/`stepper` (quest'ultimo già accertato il 2026-09-09, nota a parte più sotto). Scelto `react-pdf` (v11.0.0, `pdfjs-dist` 6.3.289): è un wrapper sottile su `pdfjs-dist` — `<Document>` carica, `<Page>` disegna su un `<canvas>`, senza una propria barra strumenti — quindi cornice, paginazione e zoom restano interamente nostri, la condizione che D8 chiede per essere sostituibile senza toccare l'API del blocco. D8 resta **TODO**: si chiude dopo M3.9 (editor, diff).

**Il worker non viene da una CDN.** La via più comune per `react-pdf` è puntare `pdfjs.GlobalWorkerOptions.workerSrc` a `unpkg.com` — scartata: farebbe dipendere ogni apertura di anteprima da una richiesta di rete, lo stesso principio per cui `tema-font` porta Inter in data URI invece di Google Fonts. Lo stack è uniformemente Vite, quindi il worker si importa con la sintassi `?url` (`pdfjs-dist/build/pdf.worker.min.mjs?url`); `pdfjs-dist` è dipendenza diretta di `react-pdf` ma è stata installata anche come dipendenza diretta del progetto (regola 7 del CLAUDE.md: un import diretto da un pacchetto va dichiarato, non lasciato alla risoluzione transitiva).

Livello di testo e annotazioni spenti apposta (`renderTextLayer`/`renderAnnotationLayer` a `false`): richiederebbero un CSS di pacchetto (`AnnotationLayer.css`) che il registry non sa distribuire, e questo blocco è un'anteprima, non un lettore con testo selezionabile.

### Un errore preso in Chromium, non a occhio

Prima versione: solo `error` su `<Document>` per il caricamento fallito. Provato con un URL a 404 nella story `Errore`: la story **crashava**, non mostrava `ErrorState`. Console: `react-pdf` *lancia* durante il render quando il `fetch` del file fallisce — la promessa interna rifiuta prima che il componente riesca a intercettarla con `onLoadError`. `error` copre solo i PDF che si scaricano ma non si parsano.

Corretto con un piccolo confine d'errore React (`ConfineDocumento`, classe con `getDerivedStateFromError`) attorno a `<Document>`, che renderizza lo stesso `ErrorState` degli altri standard di M3.5. Riverificato in Chromium: la story `Errore` mostra ora "Qualcosa non ha funzionato" con "Riprova", nessun crash.

### L'asset: un PDF vero, non un segnaposto

L'accettazione chiede "PDF reale dei riferimenti FileMaker di Anagrafe aperto e sfogliato". Chiesta conferma a Francesco prima di committare un documento reale in un repo pubblico su GitHub (CLAUDE.md §Confini: "quello che si scrive qui si legge da fuori") — confermato di procedere. Copiata `TASSULLO-FORTE CALCE-TDS-01-IT.pdf` (scheda tecnica, 4 pagine, 294 KB) da `Anagrafe/docs/riferimenti/filemaker/Esempio PRODOTTO/` a `public/esempi/scheda-tecnica-esempio.pdf` — a differenza di `public/fonts/` (escluso per intero, binari di fonderia) qui il contenuto è documentazione di prodotto Tassullo già pensata per la distribuzione a terzi.

### `version-timeline`

Compone primitive esistenti — `badge`, `avatar`, `checkbox`, `button` — nessuna dipendenza pesante, quindi resta un blocco e non entra in `componenti-propri.json` (quel registro serve solo a `registry/tassullo/ui/`, non ai blocchi di FASE 3 — stesso trattamento di `file-upload`). Cinque stati (`bozza | in-revisione | approvato | rifiutato | superato`), ciascuno con la propria tripletta di token semantici già nel tema (`success`/`warning`/`destructive` + `-subtle`/`-border`).

**Il confronto è una selezione, non una diff**: due checkbox per riga, la terza si disabilita finché non se ne scarta una, `onConfronta(a, b)` riceve le due voci scelte. Renderizzare la differenza vera resta compito di `diff-view` (M3.9) — lo stesso confine già scritto per `FileUpload`, che non carica niente da sé. Provato in Chromium (via DOM, non solo letto nel codice): selezionate due checkbox, la terza risulta `disabled`, il bottone passa a "Confronta Rev. 4 → Rev. 5" e diventa cliccabile; al click il testo "Confronto richiesto: Rev. 4 → Rev. 5" compare nella story.

**Nota su uno scostamento evitato.** La nota del 2026-09-09 collocava lo *stepper* orizzontale del flusso di approvazione "accanto a `version-timeline`" in M3.7. Non costruito qui: quello stepper è un componente proprio autorizzato solo **in linea di principio**, non un ordine di scriverlo, e l'accettazione di M3.7 in `PIANO.md`/`CHECKLIST.md` chiede solo `pdf-preview` e `version-timeline`. Resta da riprendere quando un consumatore vero lo chiede (M4.3, l'intestazione «stato e azioni» di `pagina-scheda`) — annotato qui perché non sia letto come una dimenticanza.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **contrasto** 0 violazioni; **registry** 0 errori (`pdf-preview.tsx` aveva un `aspect-[…]` — anche solo nel commento del file, che il controllo legge come testo, non solo come classi — tolto: regola 3); **font**, **logo** allineati; **a11y** **1044 scansioni (4 passate) / 0 violazioni**, 68 item (+2 dai 66 di M3.6). `tsc -b` ✔ · `build-storybook` ✔ · `lint`: solo i 3 avvisi preesistenti. `registry validate`: **68 item** ✔. `misura:bersagli`: 2265 bersagli su 261 story (47 popup aperti), 32 tipi distinti, **0 piccoli in entrambe le direzioni**.

Dipendenze nuove: `react-pdf` ^11.0.0, `pdfjs-dist` ^6.3.289.

### Prossimi passi

M3.8 `rich-text-editor` — la terza scelta di D8 (editor).

---

## Coda di M3.7 — la pagina tagliata a 100% (2026-09-15)

Rilievo di Francesco su Storybook: a zoom 100% la pagina usciva tagliata a destra e in basso, senza modo di allargare la cornice col mouse.

**Causa**: `<Page scale={zoom}>` con `zoom` iniziale a `1` disegnava la pagina alla sua **dimensione reale** — un A4 a 96dpi è più largo della cornice (`max-w-lg`, 512px) — non "adattata". 100% non voleva dire "combacia", voleva dire "grandezza vera", ed era quasi sempre più grande del riquadro.

Corretto misurando la cornice con un `ResizeObserver` e passando a `<Page width={larghezzaContenitore * zoom}>` invece di `scale`: a `zoom = 1` la pagina ora **combacia** esattamente con lo spazio disponibile, lo zoom è relativo a quella misura. Riprovato in Chromium: 100% non trabocca più, 125% scrolla dentro la cornice come atteso.

### Verifiche

`tsc -b` ✔ · `check:registry` 0 errori · `test:a11y` **1044/0**, invariato.

---

## Coda di M3.7 (2) — la linea della timeline non toccava il pallino allo stesso pixel (2026-09-15)

Rilievo di Francesco su `version-timeline`: la linea grigia fra un pallino e l'altro non raggiungeva sempre il bordo — a volte un gap, a volte la passava — visibile confrontando Rev. 3 e Rev. 1 nelle due story.

**Causa**: il pallino disegnava l'anello colorato con `ring-2` — un `box-shadow`, che non occupa spazio nel layout — sopra un `border-2 border-background` che faceva da "alone". La linea sotto era invece un elemento di flusso normale, adiacente al pallino: l'anello (box-shadow) sporge 2px fuori dalla scatola reale del pallino e si sovrapponeva alla linea in un punto che dipende dall'arrotondamento dei subpixel — diverso riga per riga a seconda dell'altezza del contenuto sopra.

Corretto sostituendo l'anello con un **bordo vero** (`border-2 border-{colore}` su `bg-background`, `size-3`): partecipa al box model, quindi la linea comincia esattamente dove il pallino finisce, per costruzione — niente più dipendenza dall'ordine di dipintura fra box-shadow e fratello successivo.

**Sulla domanda di fondo**: l'altezza cresce linearmente col numero di revisioni, com'è normale per una timeline verticale — non è un artefatto, è la lista che si allunga (la pagina che la contiene scorre). Nessun segno di degrado con più righe nelle prove fatte finora.

### Verifiche

`tsc -b` ✔ · `check:registry` 0 errori · `test:a11y` **1044/0**, invariato. Riprovato in Chromium: la linea tocca il bordo del pallino uniformemente su tutte le righe di `CinqueRevisioni`.

---

## Coda di M3.7 (3) — la linea non raggiungeva il pallino sotto, di più in touch (2026-09-15)

Il fix precedente (bordo vero invece di `ring`) risolveva l'arrotondamento dei subpixel ma non il difetto vero: screenshot di Francesco a confronto, normale e touch, mostravano la linea che partiva bene dal pallino sopra ma si fermava **prima** del pallino sotto — e lo scarto era più largo in touch, segno che dipendeva da un token di spaziatura, non da un valore fisso. Giusta la lettura: la linea deve restare continua qualunque sia l'altezza del contenuto (0, 1 o 4 righe di descrizione) o la densità.

**Causa**: il pallino aveva `mt-1` per centrarlo otticamente sulla prima riga di testo (più alta di lui). Ogni `<li>` è un elemento di flusso indipendente, adiacente al successivo senza spazio fra loro — quindi il fondo della linea di un item tocca esattamente la cima della colonna-pallino dell'item dopo. Ma quella cima non era il pallino: era `mt-1` di spazio vuoto **prima** del pallino, che a densità touch (`--spacing` più largo) cresce — lo scarto che si vedeva aumentare nello screenshot è esattamente quel token.

Tolto `mt-1`: il pallino torna a combaciare con la cima della propria colonna, cioè col fondo della linea dell'item precedente, per costruzione — non dipende più da nessuna misura, quindi resta corretto qualunque numero di righe di descrizione o densità. La perdita di centratura ottica sulla prima riga di testo è minima e preferibile a una linea spezzata.

### Verifiche

`tsc -b` ✔ · `check:registry` 0 errori · `test:a11y` **1044/0**, invariato. Riprovato in Chromium in densità Normale **e** Touch: la linea tocca ogni pallino in entrambe.

---

## Coda di M3.7 (4) — riportata la centratura ottica senza rompere la linea (2026-09-15)

Rilievo di Francesco sulla coda (3): tolto `mt-1`, il pallino torna a combaciare con la linea ma non è più centrato sulla riga di testo — "Rev. X" — resta più in alto. Giusto: `mt-1` faceva due cose insieme, l'offset ottico **e** (per errore) la disconnessione dalla linea; andava tolta solo la seconda.

**Fix**: l'offset non è più un margine sul pallino ma un segmento di linea vero, della stessa altezza (`h-1`, lo stesso gradino di `mt-1`), messo **prima** del pallino nella colonna. Per gli item dopo il primo è colorato (`bg-border`): continua la linea dell'item precedente dentro il nuovo pallino, senza soluzione di continuità. Per il primo item è trasparente (stessa `h-1`, niente `bg-border`): sposta il pallino in basso della stessa misura per centrarlo, senza un moncone di linea appeso sopra il nulla. La colonna-pallino di ogni item occupa sempre l'intera altezza della sua `<li>` — la proprietà che garantisce la continuità — cambia solo *dove dentro quell'altezza* sta il pallino.

### Verifiche

`tsc -b` ✔ · `check:registry` 0 errori · `test:a11y` **1044/0**, invariato. Riprovato in Chromium in Normale e Touch: pallini allineati alla riga di testo, linea continua su tutte le righe, nessun segmento sospeso sopra il primo pallino.

---

## Coda di M3.7 (5) — h-1 non bastava, e il bottone "Confronta" sdoppiato in transizione (2026-09-15)

Due rilievi di Francesco nella stessa tornata.

**Il pallino era allineato all'estremo superiore del testo, non al centro.** Misurato in Chromium (non a occhio): il centro del pallino stava 2px sopra il centro verticale della prima riga di testo, su tutte le righe — uno scarto costante, quindi un token sbagliato, non un problema di struttura. `h-1` in questo tema vale 4px; serviva **6px**. Cambiato in `h-1.5`: riverificato via `getBoundingClientRect`, scarto **0px** su tutte le righe.

**Il bottone "Confronta" sembrava sdoppiarsi sul bordo destro** al passaggio fra `"Confronta le due versioni"` e `"Confronta Rev. X → Rev. Y"` (selezione, poi deselezione). Causa, confermata leggendo lo stile computato: il bottone eredita `transition-all` da `button.tsx`, e la sua larghezza — un numero di pixel concreto, non `auto`, per un elemento `inline-flex` — **rientra** in quella transizione. Quando il testo cambia lunghezza, React lo aggiorna subito ma il box anima la nuova larghezza in 150ms: per la durata dell'animazione il contorno del bottone e il testo non sono allineati, ed è quello a leggersi come un doppione sul lato che si sta restringendo o allargando. Corretto restringendo la transizione ai soli colori (`transition-colors` dopo `self-start` nel `className`, che tailwind-merge — dietro il pacchetto `cn` — sostituisce a `transition-all` invece di sommarlo): verificato lo stile computato dopo la modifica, `transitionProperty` non contiene più `width`.

### Verifiche

`tsc -b` ✔ · `check:registry` 0 errori · `test:a11y` **1044/0**, invariato.


---

## M3.8 — `rich-text-editor` (2026-09-15)

L'editor per i testi che Anagrafe oggi affida a un `<textarea>`: testi di famiglia, voce di capitolato, note tecniche (`editor` ×20 nella sua roadmap).

### D8, la terza delle quattro: `@tiptap/react`

Chiesto all'MCP prima di scrivere (regola 4bis, gradino 1): shadcn non ha un `editor` o `rich-text` — solo `toggle`/`toggle-group`, riusati per la barra, e `popover`, riusato per l'inserimento del link. `@tiptap/react` (v3) è headless per lo stesso motivo di `react-dropzone` e `react-pdf`: `useEditor` restituisce un'istanza su cui si legge lo stato e si comandano i cambi, nessuna barra di libreria da disfare.

**La barra ridotta è lo schema del documento, non solo la scelta dei bottoni.** `StarterKit` porta di suo titoli, citazioni, codice, riga orizzontale e sottolineato — tutti spenti nella configurazione (`heading`, `blockquote`, `codeBlock`, `horizontalRule`, `underline`, `code`: `false`). Non è solo che la barra non li offre: lo schema del documento non li accetta, quindi un testo incollato da Word che porta uno di questi non lo trascina dentro "declassato" — ProseMirror lo scarta per costruzione all'analisi dell'HTML incollato, senza una riga di pulizia scritta a mano. `link` (`openOnClick: false`, si legge non si segue da dentro l'editor) e `superscript` (`@tiptap/extension-superscript`, non in `StarterKit`) restano gli unici due marcatori oltre a grassetto e corsivo. `StarterKit` include già `link` — installato e poi disinstallato `@tiptap/extension-link` come pacchetto a parte, appena verificato ridondante.

### La serializzazione stabile

Il valore che entra ed esce dal componente è **JSON** (`JSON.stringify(editor.getJSON())`), non HTML: l'albero di ProseMirror ha un ordine di chiavi fisso per costruzione, quindi lo stesso contenuto produce sempre la stessa stringa — la condizione che `diff-view` (M3.9) chiederà per confrontare due revisioni.

### Il limite di BC

`@tiptap/extension-character-count`, `mode: 'textSize'`: conta il testo, non i marcatori — lo stesso significato di `z.string().max(2048)` su `form-field` (M3.4). Il contatore cambia colore prima del limite, non al limite: `text-warning-subtle-foreground` da 50 caratteri residui, `text-destructive-subtle-foreground` a zero (mai `text-destructive`, la trappola del CLAUDE.md). Oltre il limite l'estensione impedisce la digitazione.

### Un bug preso testando davvero, non dichiarato dal codice

Prima versione: un `useEffect` risincronizzava `value` (il pattern controllato) confrontandolo con la serializzazione **corrente** dell'editor. Provato in Chromium — non dichiarato, verificato: digitare nella storia `VicinoAlLimite` (pattern controllato) **non inseriva mai un carattere**, ogni tasto spariva. Causa: `shouldRerenderOnTransaction: true` (necessario perché la barra e il contatore leggano lo stato aggiornato a ogni transazione, altrimenti `useEditor` non ri-renderizza da sé) fa ri-renderizzare il componente **nello stesso istante** della transazione, un giro prima che `onChange` risalga a `value` attraverso lo stato del chiamante. In quella finestra l'effetto vede `editor` già aggiornato ma `value` ancora vecchio, li trova diversi e richiama `setContent(value-vecchio)` — cancellando il carattere appena scritto, a ogni tasto, per sempre. Corretto confrontando con un ref di "l'ultimo valore emesso da noi" (`ultimoEmesso`, aggiornato in modo sincrono dentro `onUpdate`) invece che con lo stato live dell'editor: un giro di rendering non lo sposta. Riprovato in Chromium: la digitazione arriva, il contatore sale un carattere alla volta e si ferma esatto a **2048/2048**, colore `destructive`.

Un secondo scostamento minore, preso nello stesso giro: la prima versione usava `content-[attr(data-placeholder)]` (il trucco CSS standard di Tiptap per il placeholder) — `check:registry` lo respinge come valore arbitrario, regola 3, e a ragione: è un blocco nostro, non uno ereditato da shadcn. Sostituito con un overlay React vero (`editor.isEmpty` più uno `<span>` posizionato), che è anche più semplice da leggere.

### D11, di passaggio: chiusa, non si adotta `typeset`

La domanda aperta in M2.1 (`docs/DECISIONI.md` §20) trovava qui il suo consumatore reale. Verdetto: **no**. Tre ragioni a verbale in `docs/DECISIONI.md` §36 — il builder di shadcn non è uno script (rompe il pattern `check:font`/`check:logo`: nessun modo di verificare che il file sia ancora quello), lo schema ridotto di questo editor non ha bisogno della stilizzazione che `typeset` offre (niente titoli, citazioni, tabelle, codice), e la leva responsiva di `typeset` si compone con la densità touch in un modo che D10 (M4.2) non ha ancora giudicato — adottarlo ora comprerebbe un problema noto prima che serva la soluzione. Resta aperto per un consumatore di testo lungo vero (le pagine MDX di questa style guide, ad esempio), da riprendere con un caso reale in mano.

### L'accettazione, verificata in Chromium

Incolla reale (evento `paste`, `clipboardData` con `text/html` che porta colore, `<font>`, sottolineato e un `<h1>`) in `IncollaDaWord`: il risultato tiene solo `<strong>` — nessuno stile inline, nessun `<u>`, nessun `<h1>`, nessun `<font>`. Link su selezione vera (`ConCollegamento`, provato a mano oltre alla `play`): `<a href="…">` sul testo selezionato, non un marcatore fantasma. Limite: verificato sopra.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **contrasto** 0 violazioni; **registry** 0 errori (69 item, +1 da 68); **font**, **logo** allineati; **a11y** **1060 scansioni (4 passate) / 0 violazioni**. `tsc -b` ✔ · `build-storybook` ✔ · `lint`: solo i 3 avvisi preesistenti. `registry validate`: **69 item** ✔. `misura:bersagli`: 2289 bersagli su 265 story (47 popup aperti), 32 tipi distinti, **0 piccoli in entrambe le direzioni**.

Dipendenze nuove: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-character-count`, `@tiptap/extension-superscript` (tutte ^3).

### Prossimi passi

M3.9 `diff-view` e `split-view` — la quarta e ultima scelta di D8 (diff), che chiude anche D8 stessa.


---

## Coda di M3.8 — pedice e "rimuovi formattazione" (2026-09-15)

Rilievo di Francesco, in revisione: la barra aveva l'apice ma non il pedice, e nessuna via d'uscita per un testo che finisce con marcatori in più del previsto.

Aggiunti `@tiptap/extension-subscript` (pedice, `Ctrl` di fabbrica non incluso — nessuno dei due in `StarterKit`, stesso trattamento di `superscript`) e un bottone "Rimuovi formattazione" (`unsetAllMarks().clearNodes()`, icona `Eraser`). **Le due estensioni non si escludono a vicenda di fabbrica**: senza un mark proprio con `excludes` scritto a mano — costo che il caso d'uso (apice/pedice di formule o unità di misura, non testo matematico vero) non giustifica — un testo può finire con apice e pedice applicati insieme, il che non ha un significato tipografico. È esattamente il motivo per cui il bottone "Rimuovi formattazione" serve, non solo un vezzo in più: è la via d'uscita quando capita. Annotato nel commento di testa del componente.

Provato in Chromium (via DOM, non solo letto nel codice): selezionata una lettera dentro "CO2", cliccato "Pedice" — risultato `C<sub>O</sub>2`; selezionato tutto il paragrafo, cliccato "Rimuovi formattazione" — torna piatto, `<p>CO2 test</p>`.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1060 scansioni (4 passate) / 0 violazioni**, invariato; **registry** 0 errori, ancora 69 item (nessun item nuovo, solo il file del blocco cresciuto). `tsc -b` ✔ · `build-storybook` ✔ · `lint`: solo i 3 avvisi preesistenti. `registry validate`: 69 item ✔. `misura:bersagli`: 2297 bersagli su 265 story (+8 dai 2289 di M3.8, i due bottoni nuovi), **0 piccoli in entrambe le direzioni**.

Dipendenza nuova: `@tiptap/extension-subscript` (^3).


---

## L'anello di focus più sottile su tutta l'interfaccia (2026-09-15)

Rilievo di Francesco su una story di `rich-text-editor`: l'anello arancio di focus (`--ring`, lo stesso arancio del brand) è pesante — 3px di spessore al 50% di opacità, il default che shadcn stesso applica in ogni primitiva. Non è un artefatto del sistema operativo: è `focus-visible:ring-3 focus-visible:ring-ring/50` (o `focus-within:` dove il focus è sul contenitore, non sul controllo), ripetuto identico in ogni primitiva focus-abile.

Prova isolata su `rich-text-editor` prima (`ring-1`/30%, non un token condiviso — solo classi Tailwind locali), confermata in Chromium via `getComputedStyle`, poi estesa — su richiesta esplicita — a tutto il resto: **16 file**, `accordion`, `badge`, `button`, `checkbox`, `combobox`, `field`, `input-group`, `input`, `radio-group`, `select`, `slider`, `switch`, `textarea`, più due story (`card.stories.tsx`, `sheet.stories.tsx`) che ridefinivano lo stesso stile su un elemento proprio. `slider` è diverso dagli altri: l'anello ci sta sempre (al posto giusto un doppio anello attorno alla manopola), lo spessore lo aggiungono `hover:`/`has-[:focus-visible]:`/`active:` — le tre condizioni sono passate da `ring-3` a `ring-1` insieme, e l'opacità di base da `ring-ring/50` a `ring-ring/30`, per restare coerenti fra i tre stati.

**Non toccato**: l'anello di errore (`aria-invalid:ring-3 aria-invalid:ring-destructive/20`) — è un segnale diverso (stato non valido, non focus), a un colore diverso, e il rilievo era sul solo arancio.

Regola 4bis, gradino 2 (ri-stile delle sole stringhe di classi): non serve una conferma per farlo, cambia solo il valore delle utility — nessuna struttura, nessun prop, nessun export toccato. `check:registry` lo conferma classificando tutti e 14→17 i file come "ri-stilati sopra una forma shadcn intatta", non come divergenza di struttura.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1060 scansioni (4 passate) / 0 violazioni**, invariato — la regola axe sul focus visibile guarda che *esista* un indicatore, non il suo spessore; **registry** 0 errori (17 ri-stilati, +3 da 14); **contrasto**, **font**, **logo** allineati. `tsc -b` ✔ · `build-storybook` ✔ · `lint`: solo i 3 avvisi preesistenti. `registry validate`: 69 item ✔. Verificato in Chromium con `getComputedStyle` su `Primitive/Button`: `box-shadow` passa da un anello a piena intensità a `0 0 0 1px` al 30% dell'arancio — la prova che non è un residuo dell'outline nativo del browser (quello resta soppresso da `outline-none`, invariato).


---

## M3.9 — `diff-view` e `split-view` (2026-09-15)

Ultimo task della FASE 3: confronto prima/dopo parola per parola e vista a due colonne — `diff` ×15 nella roadmap di Anagrafe, il change set **è** il meccanismo del flusso di approvazione, e `version-timeline` (M3.7) manda già qui le due revisioni scelte da confrontare. Chiude anche **D8**, la scelta di libreria di terze parti per i blocchi: l'ultima delle quattro.

### D8, la quarta e ultima: `diff` (jsdiff)

Chiesto all'MCP prima di scrivere (regola 4bis, gradino 1): shadcn non ha un confronto testi. `diff` — zero dipendenze proprie (`npm view diff dependencies` non stampa niente) — espone solo `diffWords(prima, dopo)`, una funzione pura: nessun widget da disfare, il rendering resta interamente nostro, come `react-dropzone` e `react-pdf` prima di lei. **Parola, non riga**: il piano lo chiede esplicito perché una scheda tecnica è prosa, non codice — un diff a riga intera su "sovrapposizione minima ai bordi 80 mm" → "100 mm" mostrerebbe l'intera frase come cambiata, nascondendo la sola parola che conta. `diffWords` isola "80" da "100" senza spezzare "sovrapposizione" in lettere.

`DiffView` ha due modalità, non due componenti: `inline` (l'accettazione di M3.9) fonde il confronto in un paragrafo con `<del>` barrato e `<ins>` colorato — i tag semantici HTML5 di una modifica, non `<span>` a caso; `affiancato` compone `SplitView` (v. sotto), tolto a sinistra e aggiunto a destra. Il colore non basta da solo: il tolto resta barrato oltre che rosso, la stessa cautela già presa su `version-timeline` con badge e icona insieme.

### `split-view`: la soglia guarda il contenitore, non lo schermo

`resizable` (M2.4) era già dichiarata "la base dello split-view di M3.9" nel proprio commento di testa. `SplitView` la compone: due `ResizablePanel` affiancati sopra `SOGLIA_AFFIANCATO` (448px, la stessa soglia `@md` della fascia di `page-header`), colonne impilate sotto — misurato con un `ResizeObserver` sul **contenitore**, non una media query sulla viewport, per lo stesso motivo di D…/§31: il blocco vive dentro un layout (una colonna del guscio, una scheda), e la larghezza dello schermo non è quella del contenitore. Provato in Chromium: a 375px di contenitore le due colonne sono già impilate (story `Contenitore Stretto`), l'accettazione del piano.

**Bug preso da `test:a11y`, non dichiarato.** Prima versione: `tabIndex`/`role="region"`/`onScroll`/`elementRef` passati direttamente a `ResizablePanel`. `npm run check` è uscito con **4 violazioni** (`scrollable-region-focusable`, una per passata) mai viste nelle sessioni precedenti. Causa, letta nel sorgente di `react-resizable-panels`: `Panel` rende **due** `<div>` — uno esterno, a cui vanno tutte le prop passate (`overflow: visible`, non scorre mai), uno interno generato dalla libreria con `overflow: auto` (quello che scorre davvero), irraggiungibile dall'esterno. Le mie prop finivano sul div sbagliato: axe vedeva giustamente una regione scorribile senza un modo di arrivarci da tastiera. Corretto con lo stesso principio già scritto in `resizable.stories.tsx` per `ScrollArea` — non fidarsi dello scorrimento automatico del pannello, mettere **dentro** un elemento scorribile e a fuoco nostro (`h-full overflow-auto`, `tabIndex={0}`, `role="region"`). Riprovato: `test:a11y` torna a **0 violazioni**, e in Chromium (`querySelector` sull'iframe di Storybook + `dispatchEvent` di `KeyboardEvent('keydown', {key:'ArrowLeft'})` sulla maniglia) la maniglia risponde ancora alle frecce come da `resizable.stories.tsx` — 15 pressioni portano il pannello sinistro da 382.5px a 0.

**La sincronia è per rapporto, non per pixel** (`sincronizzato`): due colonne di lunghezza diversa non hanno lo stesso `scrollHeight`, quindi si sincronizza `scrollTop / (scrollHeight - clientHeight)` — la frazione percorsa — non il valore assoluto. Provato in Chromium: portata la colonna sinistra al fondo (`scrollTop = scrollHeight - clientHeight`, evento `scroll` sintetico), la destra arriva anch'essa al proprio fondo nello stesso passaggio, pur avendo un `scrollHeight` diverso (524 contro un'altezza propria diversa). Un flag (`sincroniaInCorso`) evita il ping-pong fra i due handler `onScroll`.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1084 scansioni (4 passate) / 0 violazioni** (+24 da 1060, le due story nuove); **registry** 0 errori (71 item, +2 da 69); **contrasto**, **font**, **logo** allineati. `tsc -b` ✔ · `build-storybook` ✔ · `lint`: solo i 3 avvisi preesistenti, nessuno nuovo. `registry validate`: 71 item ✔. `misura:bersagli`: 2297 bersagli su 271 story (invariato da M3.8 — nessun bersaglio piccolo nuovo, la maniglia di `resizable` era già misurata). Verificato in Chromium: diff inline e affiancato renderizzati sulla coppia di schede tecniche reali dell'accettazione (Rev. 3/Rev. 4, "80 mm" → "100 mm", "coperture piane e inclinate" → "coperture piane, inclinate e giardini pensili"); split-view a 375px impilato; tastiera e sincronia dello scorrimento provate come sopra.

Dipendenza nuova: `diff` (^9, zero dipendenze proprie).

### Prossimi passi

M3.10 — Gate di FASE 3: ricostruire in Storybook la pagina Prodotti di Anagrafe con soli blocchi, zero CSS di pagina, screenshot a confronto.

---

## Coda di M3.9 — la story `Confrontabile` di `version-timeline` non dimostrava l'aggancio (2026-09-15)

Rilievo di Francesco: la story `Confrontabile` di `version-timeline` (M3.7), dopo aver premuto "Confronta", mostrava ancora la frase segnaposto scritta **prima** che `diff-view` esistesse — «la diff vera è `diff-view` (M3.9), non questo blocco» — invece di aprire un confronto vero. Il testo era corretto quando fu scritto (M3.9 non esisteva ancora), ma la sessione che chiude M3.9 è esattamente il momento in cui quel segnaposto va sostituito: altrimenti resta a mentire per sempre sul primo consumatore reale del blocco appena scritto.

**Il blocco resta disaccoppiato apposta** — `VersionTimeline` non guadagna una `registryDependency` su `diff-view`: un'app che vuole solo lo storico non si porta dietro `diff`. Cambiata solo la *story*, `registry/tassullo/blocks/version-timeline.stories.tsx`: `DemoConfronto` ora tiene le due voci scelte (non più una stringa) e monta un `DiffView` vero (`modo="affiancato"`) sul testo delle due revisioni — un `Record<string, string>` locale alla story, perché `VersionTimelineEntry` porta solo la `descrizione` breve, non il testo intero del documento.

Provato in Chromium, non solo letto nel codice: selezionate Rev. 4 e Rev. 5, cliccato "Confronta Rev. 4 → Rev. 5" — sotto la timeline compare `DiffView` affiancato vero, con «verificata sui campioni di agosto 2026» evidenziato in verde nella colonna destra, non più la frase fissa.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1084 scansioni (4 passate) / 0 violazioni**, invariato (nessuna story nuova, solo il render della `Confrontabile` esistente); **registry** 0 errori, ancora 71 item. `tsc -b` ✔ · `build-storybook` ✔.

---

## M3.10 — Gate di FASE 3 (2026-09-15)

Prompt del piano: ricostruire in Storybook la pagina Prodotti di Anagrafe usando **solo** `app-shell` + `page-header` + `data-table` + `empty-state`, zero CSS di pagina, e confrontarla con l'originale.

### Letto in sola lettura: `frontend/src/pages/Prodotti.tsx` + `Prodotti.css` di Anagrafe

190 righe di componente, ~120 di CSS di pagina (`prd-*`). Struttura: `<h1>` + due bottoni («Sistema da BC», «Nuovo prodotto») in testa; una riga di filtri — ricerca, tre `<select className="input">` scritti a mano (famiglia/tipo/stato) e un contatore; una `<table className="table">` con sette colonne (Nome linkato, Variante, Tipo in badge, Famiglia, Codice interno monospazio, BC monospazio, Stato in badge success/warn); due modali CSS-a-mano per creare un prodotto o agganciare un sistema da Business Central.

### La ricostruzione: `stories/PaginaProdotti.stories.tsx`, due story in `Pagine/`

Non un item di registry: è una pagina di verifica, quindi vive in `stories/` come le pagine trasversali della style guide (regola 6 di `CLAUDE.md`), non in `registry/tassullo/blocks/`. `ConDati` (37 prodotti finti, LCG a seme fisso) e `SenzaProdotti` (array vuoto).

**Cosa cambia, e perché resta equivalente** (motivato per esteso nel commento di testa della story, non ripetuto qui):
- il titolo `<h1>` sparisce dallo schermo — è la forma di `page-header` (M3.2), resta in `sr-only`;
- i tre `<select>` a mano diventano tre `Select` del tema, passati nella `barra` di `DataTable` come stato locale della pagina che pre-filtra l'array prima di passarlo al blocco — la ricerca libera resta a `DataTable`;
- il contatore (`prd-conta`) è la riga «N righe» che `DataTable` scrive già da sé;
- **due stati vuoti, non uno**, dove l'originale ne aveva uno (`prd-vuoto`, un `<p>`): «nessun risultato per questo filtro» lo rende `DataTable` da sé (bottone che pulisce i filtri), «non esiste ancora nessun prodotto» è `EmptyState` (`tassullo-empty-state`, M3.5) al posto dell'intera tabella — `INTERFACCE.md` §1.1 vieta esplicitamente «una tabella con la sola intestazione», e i due stati del v1 erano lo stesso paragrafo;
- le due modali CSS-a-mano restano **fuori dal gate**: sono `responsive-dialog` + `form-field` (M3.4), già nel registry — comporle avrebbe raddoppiato la story senza rispondere alla domanda del gate, cioè se i quattro blocchi bastano per l'**elenco**. I due bottoni di testata restano come dati di vetrina.

Colonne: le stesse sette, coi due badge (`variant="secondary"` per il Tipo — l'originale non gli dà un tono; `TONO.success`/`TONO.warning` per lo Stato, dalla mappa di `lib/toni`, come già in `data-table.stories.tsx`).

### Verifiche

**Zero classi `prd-*` nel codice, zero valori arbitrari**: `grep -n 'prd-\|className="[^"]*\['` trova solo le sei citazioni nel commento di testa della story, che *nomina* le classi dell'originale per spiegare la corrispondenza — nessuna nel JSX. `npm run check` verde su tutti e cinque i gate: **a11y 1092 scansioni (4 passate) / 0 violazioni** (+8 da 1084, le due story nuove); `check:registry` non tocca `stories/` (non è né `ui/` né `blocks/`) e resta a 71 item, 0 errori; `check:contrast` 0 violazioni sopra soglia. `tsc -b` ✔ · `lint`: solo i 3 avvisi preesistenti · `build-storybook` ✔. `misura:bersagli`: **2343 bersagli su 273 story, 0 piccoli in entrambe le direzioni**.

Provato in Chromium (via preview del workbench, non solo build): `ConDati` e `SenzaProdotti` a 1440px in chiaro **e** scuro — resa corretta in entrambe; degrado a 375px verificato — colonna del guscio sostituita dallo `Sheet`, azioni di testata nel kebab `⋮`, tabella che scorre in orizzontale. Il pannello Accessibility manuale segnalava un *incomplete* `color-contrast` su «Pubblicazioni» in una passata: verificato con `getBoundingClientRect` che l'elemento sta interamente dentro il viewport — l'*incomplete* è un artefatto del pannello degli addon dockato sopra il canvas al momento della scansione manuale, non del prodotto; il gate reale (`test:a11y`, Chromium headless a tutta pagina) lo conferma a **0 violazioni** e **0 incomplete**.

### Verdetto

**Gate superato.** I quattro blocchi bastano per ricostruire l'elenco di Prodotti senza una riga di CSS di pagina; gli unici scostamenti dall'originale sono miglioramenti già decisi altrove (titolo in `sr-only` da M3.2, i due stati vuoti distinti da M3.5) e non perdite di funzione. Chiude la **FASE 3** — undici sessioni, dodici blocchi (`app-shell`, `page-header`, `data-table`, `form-field`, `confirm-dialog`, `responsive-dialog`, `empty-state`, `page-skeleton`, `error-state`, `toast-con-annullo`, `file-upload`, `pdf-preview`, `version-timeline`, `rich-text-editor`, `diff-view`, `split-view` — 71 item di registry in tutto, contando anche le primitive della FASE 2).

### Prossimi passi

FASE 4 — Pagine modello (6 sessioni): pagine intere installabili sul modello di `ui.shadcn.com/blocks`, sopra i blocchi appena chiusi.

---

## Coda di M3.10 — `perPagina="auto"` e il nome delle righe (2026-09-15)

Due rilievi di Francesco in revisione sulla pagina Prodotti.

### `perPagina="auto"` in `data-table`

**Decisione presa con Francesco**: le pagine **sola lista** — Prodotti, Norme, Certificazioni, tutte quelle sul modello sidebar → lista → scheda (clic sul nome, si apre la scheda) — avranno di default righe-per-pagina **automatiche**, non un numero fisso. Un numero fisso (10, 25…) lascia un vuoto sotto il piede su uno schermo alto e costringe a scorrere su uno basso: lo spazio della finestra c'è, la tabella deve usarlo.

**Misurato, non calcolato**: il blocco non indovina un'altezza di riga in pixel — la riga segue la densità (`h-10`/`p-2` derivano da `--spacing`, D di M1.4) — ma la misura col `ResizeObserver`, su due elementi: il contenitore (cambia con la finestra) **e** la testata (cambia con la densità, senza che il contenitore stesso cambi altezza — quella gliel'ha già data il genitore via `flex-1`). Senza il secondo osservatore, passare a `touch` avrebbe lasciato il conto delle righe di `normale`, ed è stato preso proprio così alla prima stesura, corretto osservando anche `testataRef`.

**Vuole un contenitore ad altezza ferma**, e qui è dove la modifica esce da `data-table` e tocca `app-shell`: senza un'altezza vera a cui arrivare, `flex-1` non ha un numero a cui appoggiarsi. Aggiunta `contenuto?: "scorre" | "riempie"` all'`AppShell` (predefinito `scorre`, **nessuna pagina esistente cambia comportamento**): `riempie` porta il guscio da `min-h-svh` a `h-svh` — la pagina non scorre più, il contenuto sotto la fascia diventa una colonna `flex min-h-0 overflow-hidden` che dà spazio vero al `flex-1` di chi ci sta dentro. La pagina che lo chiede deve fare lo stesso, rendendo una colonna `flex h-full min-h-0` con la tabella come solo figlio `flex-1 min-h-0` — documentato nel commento di testa di entrambe le prop.

Il menu «Righe» sparisce in modalità auto: non ha senso scegliere un numero che il blocco ricalcola da sé un istante dopo.

Provato in Chromium, tre condizioni: **1440×900** → 18 righe, «Pagina 1 di 3»; **1440×1400** → 31 righe, «Pagina 1 di 2», tabella ancora a filo del bordo inferiore, zero scorrimento; **1440×700** → 11 righe, «Pagina 1 di 4». Poi la densità **da sola**, senza toccare la finestra (1440×700 fermo): passando a `touch` le righe scendono da 11 a 5, «Pagina 1 di 8» — la prova che il secondo `ResizeObserver` (sulla testata) serve davvero, non è prudenza in eccesso.

Applicato in `stories/PaginaProdotti.stories.tsx`: `<AppShell contenuto="riempie">`, `<DataTable perPagina="auto" className="min-h-0 flex-1">`.

### Il nome della riga: «37 prodotti», non «37 righe»

Rilievo diretto sullo screenshot della pagina: il conto in fondo diceva «37 righe», un nome tecnico che non dice *cosa* sono quelle 37 cose. Aggiunta `nomeRighe?: { singolare: string; plurale: string }` a `DataTableProps` (predefinito `riga`/`righe`, invariato per ogni punto d'uso esistente), che sostituisce sia il conto («37 prodotti») sia la riga di selezione multipla («N di M prodotti selezionati»). `PaginaProdotti` passa `{ singolare: 'prodotto', plurale: 'prodotti' }`.

### Il varco sidebar → lista → scheda

Terza nota di Francesco, applicata sulla stessa story: cliccare sul nome apre la scheda del prodotto. La colonna Nome diventa `<Button variant="link" render={<a href="#" />}>` — `variant="link"` e non un colore scritto a mano, la stessa ragione di `text-accent-ink` nel resto del tema (`--primary` non è mai testo). Nessuna pagina scheda esiste ancora in Storybook: è la FASE 4 a costruirla, qui conta la forma del varco, non la destinazione.

### Il menù della sidebar allineato a quello vero di Anagrafe

Quarta nota: le pagine dimostrative devono usare le sezioni/voci **di produzione**, non un'approssimazione. Letto `frontend/src/components/Sidebar.tsx` di Anagrafe (sola lettura): mancava «Traduzioni» nella sezione Distribuzione — aggiunta. Le sezioni di `stories/PaginaProdotti.stories.tsx` ora coincidono esattamente con `NAV_SEZIONI` del sorgente vero.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1092 scansioni (4 passate) / 0 violazioni**, invariato (nessuna story nuova, solo la stessa `ConDati`/`SenzaProdotti` con più righe rese); **registry** 0 errori, 71 item (nessun item nuovo — `data-table` e `app-shell` sono gli stessi due blocchi, ampliati). `tsc -b` ✔ · `lint`: solo i 3 avvisi preesistenti · `build-storybook` ✔. `misura:bersagli`: 2344 bersagli su 273 story, **0 piccoli in entrambe le direzioni** — invariato, il bottone-link di Nome eredita l'altezza di `size="sm"` già misurata altrove.

### Prossimi passi

Nessuno scostamento aperto. Resta com'era: FASE 4 — Pagine modello.

---

## Coda della coda di M3.10 — il vuoto sull'ultima pagina (2026-09-15)

Rilievo di Francesco su uno screenshot: pagina 3 di 3, cinque righe vere, e sotto un vuoto **dentro** il riquadro bordato — visibile perché il bordo si interrompe a metà, che sembra un guasto più di quanto sembrasse il vuoto **sotto** il blocco che `perPagina="auto"` doveva togliere.

**Causa**: `righeAuto` è quante righe entrano in una pagina *piena* — l'ultima pagina, o un filtro che lascia poche righe, ne rende sempre meno, e il riquadro (altezza ferma, `flex-1`) non si restringe di conseguenza.

**Rimedio**: righe di riempimento — vuote, decorative, `aria-hidden`, senza `hover:` — fino a `righeAuto`, della stessa altezza di una riga vera (stessa `TableCell` con `p-2`, un `&nbsp;` al posto del contenuto). Non toccano il conto («37 prodotti» resta 37, non 40): sono solo la parte del riquadro che nessuna riga vera occupa più, resa visibile invece che lasciata bianca a metà bordo.

Provato in Chromium su `ConDati` a 1440×900: pagina 3 di 3 (5 righe vere su ~18 possibili) — il riquadro arriva a filo del bordo inferiore, in chiaro e in scuro.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1092 scansioni (4 passate) / 0 violazioni**, invariato — le righe di riempimento sono `aria-hidden`, axe non le vede. `tsc -b` ✔.

---

## Coda: `perPagina="auto"` ripensato come `perPagina="infinito"` (D19, 2026-09-15)

Rilievo di Francesco, deciso: le righe di riempimento **non vanno bene** — si discostano troppo dalla forma di shadcn, che quella soluzione non la offre da nessuna parte. E non serviva inventare niente: `anagrafe.tassullo.it/caratteristiche` ha già lo scorrimento infinito in produzione (di Roberto), collaudato sulla stessa mole di dati. L'unico difetto — la testata scorre via con la pagina, perdendo il nome delle colonne — è quello da correggere, non il meccanismo da sostituire. Ragionamento per esteso in `docs/DECISIONI.md` §37 (**D19**, aperta e chiusa nella stessa sessione).

**`perPagina="auto"` esce dal blocco, `perPagina="infinito"` prende il suo posto** — stesso requisito d'ingresso (`className="flex-1 min-h-0"` più `<AppShell contenuto="riempie">`, invariato dalla coda precedente), meccanismo diverso: niente più `ResizeObserver` che misura righe ed intestazione, niente righe di riempimento. Un `IntersectionObserver` su una sentinella vuota in fondo al corpo, che carica altre `PASSO_INFINITO` (40) righe quando entra in vista; il menu «Righe» **e** i quattro salti di pagina spariscono interamente (non solo il primo), perché non c'è più una pagina da saltare — resta solo il conto (`nomeRighe`), sempre il totale filtrato vero.

**Una sottigliezza CSS ha reso la testata ferma più semplice del previsto, e vale la pena saperla per il resto del registry.** `ui/table.tsx` (primitiva, non toccata) avvolge da sempre la propria `<table>` in `<div data-slot="table-container" className="overflow-x-auto">`. Per una regola del CSS Overflow Module — un asse impostato esplicitamente e l'altro lasciato `visible` fa *calcolare* l'altro come `auto` — quel div ha sempre avuto, gratis, un `overflow-y: auto` che nessuna classe dichiara mai; è rimasto innocuo finché nessuno gli dava un'altezza ferma da eccedere. Dentro il riquadro `flex-1 min-h-0` di `perPagina="infinito"`, è **quel div interno** — non il riquadro bordato attorno — a restringersi e a prendersi lo scorrimento verticale vero. `sticky top-0` sulla testata si aggancia lì da solo, senza bisogno di dichiarare niente in più; l'`IntersectionObserver` prende lo stesso div per il suo `data-slot`, come `page-header.tsx` fa con la propria ancora. Preso **misurando**, non leggendo il codice: un primo giro con `root` il riquadro bordato dava `scrollHeight === clientHeight` — zero overflow secondo il riquadro — mentre `document.querySelector('table').getBoundingClientRect()` mostrava un contenuto alto 4500px; la caccia ha portato dritti alla regola CSS, non a un bug del componente.

**Due avvisi lint presi e corretti prima di chiudere**, entrambi genuini e non preesistenti: un `setState` dentro un `useEffect` per azzerare `caricate` a ogni ricerca/filtro — sostituito con l'aggiustamento **in fase di render** che React stessa documenta per questo caso (confronto con l'ultima chiave di filtro vista, `setState` durante il render se è cambiata, prima del commit) — e una lettura di `ref.current` durante il render per decidere se mostrare la sentinella — sostituita con la variabile calcolata nello stesso render (`totaleFiltrate`), la stessa cosa senza il giro per la `ref`. `npm run lint` torna ai tre avvisi preesistenti, zero nuovi.

Dataset della story portato da 37 a **220** prodotti finti: con 37 (sotto il passo di caricamento, 40) lo scorrimento non avrebbe dimostrato niente — tutto sarebbe entrato al primo giro.

Provato in Chromium: scorrimento reale del mouse (non solo script) sul contenitore — la testata resta ferma, le righe caricate salgono a passi di 40 superando PF139 dopo pochi giri di rotella; una ricerca («Bio», 29 risultati su 220) azzera il caricamento e lo riempie di nuovo da sé, restando sotto il passo; zero violazioni axe in chiaro e scuro.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1092 scansioni (4 passate) / 0 violazioni**, invariato. `tsc -b` ✔ · `lint`: tre avvisi preesistenti, **zero nuovi** (due presi e corretti, sopra). `build-storybook` ✔. `misura:bersagli`: 2340 bersagli su 273 story (−4 da 2344: sparite le quattro voci del menu «Righe» e dei salti di pagina, ora assenti nella story `infinito`), **0 piccoli in entrambe le direzioni**.

### Prossimi passi

D19 chiusa. Nessuno scostamento aperto. Resta com'era: FASE 4 — Pagine modello.

---

## Coda di D19 — il riquadro che non si restringe, la riga tagliata (2026-09-15)

Due rilievi di Francesco sulla stessa story, entrambi da screenshot reali.

**1. Il riquadro non si restringeva sotto poche righe.** Un filtro che lascia 4-5 righe su 220 lasciava comunque il riquadro alto quanto tutto lo spazio disponibile — lo stesso vuoto che `perPagina="infinito"` doveva togliere, spostato da "sotto la tabella" a "dentro il riquadro". Causa: `flex-1` sul riquadro bordato lo forzava a **crescere sempre** fino allo spazio disponibile, indipendentemente da quante righe ci fossero davvero. Tolto `flex-1` (restano `flex` e `min-h-0`): un elemento flex ha `flex-shrink: 1` di suo, senza bisogno di dichiararlo — il riquadro ora prende solo l'altezza che il contenuto chiede, e si restringe fino allo spazio disponibile solo quando le righe lo superano davvero.

**2. Una riga tagliata a metà sembrava una barra fuori posto.** Rilievo iniziale letto come "la barra di scorrimento non si allinea alle righe" — corretto da Francesco con uno screenshot dopo aver scorso di poco: non era una barra nativa, era una **riga vera tagliata dal bordo del riquadro**, perché lo scorrimento libero può fermarsi a qualunque pixel, non solo sui confini di riga. Corretto con `scroll-snap`: `snap-y snap-proximity` su `table-container` (raggiunto con un selettore discendente, `[&_[data-slot=table-container]]:`, perché quel `<div>` di `ui/table.tsx` non espone un `className` proprio) e `snap-start` su ogni `TableRow` quando `perPagina="infinito"`. `proximity` e non `mandatory`: si assesta sul confine più vicino solo se lo scorrimento **finisce** lì accanto, senza risucchiare un piccolo gesto di scorrimento verso la riga più vicina.

Provato in Chromium: un filtro a 4 righe (`Bio Adesivi`) — il riquadro alto esattamente 4 righe, il conto («4 prodotti») subito sotto, zero vuoto. Uno scorrimento reale del mouse sull'elenco intero (220 righe) fermato a metà — la vista si assesta su un confine di riga, prima riga in cima intera, non più tagliata.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1092 scansioni (4 passate) / 0 violazioni**, invariato. `tsc -b` ✔ · `lint`: tre avvisi preesistenti, zero nuovi · `build-storybook` ✔. `misura:bersagli`: 2340 bersagli su 273 story, invariato, **0 piccoli in entrambe le direzioni**.

---

## Coda: il vuoto residuo dopo l'ultima riga intera (2026-09-15)

Rilievo di Francesco, con screenshot: `flex-shrink` (coda precedente) dà al riquadro l'altezza **grezza** disponibile in pixel, non un multiplo dell'altezza di riga — l'ultima striscia mostrava quindi la barra grigia dell'ultima riga intera, poi un accenno bianco della riga successiva **tagliata**, poi il bordo del riquadro. La stessa riga a metà di prima (in cima, corretta con `scroll-snap`), ora al fondo.

**Aggiunto un `max-height` misurato, arrotondato per difetto a un multiplo esatto di riga**: `testata + ⌊(disponibile − testata) / riga⌋ × riga`, con la stessa coppia di `ResizeObserver` (riquadro + testata) già scritta per l'esperimento `perPagina="auto"` di prima — riletta e riadattata, non semplicemente incollata: qui **non** calcola un numero di righe da caricare, si limita a un **tetto di CSS**. `max-height` e non `height`: un elenco più corto del tetto resta a restringersi come già faceva `flex-shrink`, invariato — il tetto conta solo quando il riquadro vorrebbe essere più alto di un multiplo esatto.

Provato in Chromium: `scrollTop` portato a metà elenco (220 righe) e lasciato assestare — l'ultima riga visibile («Calce Rasanti») finisce esatta a filo del bordo, zero accenno della riga dopo; il caso già corretto (`Bio Adesivi`, 4 righe) resta identico, nessuna regressione.

**Limite noto, non del prodotto ma dell'imbracatura**: un **primo montaggio** con la densità già `touch` via URL (`?globals=density:touch`, ricaricando la pagina) misura ancora coi numeri di `normale`, perché il decorator di densità di Storybook scrive l'attributo in un proprio `useEffect` — un giro di rendering dopo il mio, che nella stessa scarica gira prima (gli effetti dei discendenti prima di quelli degli antenati). Un **cambio dal vivo** — toolbar, mentre la story è già montata — ricalcola giusto, provato: 60/55/170px, resto zero. In produzione l'attributo di densità lo scrive l'app una volta sola in `index.html`, non un effetto React: la corsa non esiste fuori da questo banco di prova, e non è quindi un difetto da rincorrere qui.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1092 scansioni (4 passate) / 0 violazioni**, invariato. `tsc -b` ✔ · `lint`: tre avvisi preesistenti, zero nuovi.

---

## Coda: il tetto a cricchetto — bug preso da Francesco (2026-09-15)

**Due bug**, uno dei quali serio, trovati da Francesco con due screenshot: rimpicciolire la finestra e riallargarla, o applicare un filtro e poi toglierlo, **non facevano più tornare il riquadro alla sua altezza piena** — restava incollato all'ultimo tetto piccolo.

Causa: `ricalcola()` misurava `contenitore.getBoundingClientRect().height` con lo `style.maxHeight` della volta prima **ancora scritto addosso all'elemento**. Un tetto piccolo (4 righe filtrate, o una finestra bassa) tagliava la misura successiva **alla radice** — non importa quanto spazio tornasse disponibile, la misura vedeva sempre al più il vecchio tetto, mai lo spazio vero. Un difetto a **cricchetto**: scende, non risale mai. Preso su una story reale, non su un caso sintetico — esattamente il genere di bug che una singola misura "prova e basta" non avrebbe mai trovato.

**Corretto togliendo il tetto prima di misurare**: `contenitore.style.maxHeight = "none"`, si legge lo spazio vero che il genitore concede, si rimette il tetto precedente, si ricalcola il nuovo — tutto sincrono, prima che il browser dipinga, scrivendo lo `style` direttamente sul nodo invece che aspettare un giro di React (che avrebbe lasciato il tetto vecchio a schermo per un fotogramma).

**Terzo rilievo, più piccolo, nello stesso giro**: 1px di riquadro scoperto sotto il bordo dell'ultima riga — `getBoundingClientRect` torna sottopixel (716.266…) e un tetto troncato a quella cifra lascia una fessura. `Math.ceil` sul risultato finale (non sugli addendi) la chiude: un pixel in più non svela mai una riga in più, perché è sempre meno di un'intera altezza di riga.

Provato in Chromium, i due casi esatti degli screenshot: finestra ristretta a 400px e riallargata a 900 — il riquadro torna a ~18 righe, non resta a 3; un filtro (`Tassullo Intonaci`, 4 righe) tolto con la crocetta — il riquadro torna a riempire tutta l'altezza («220 prodotti»), non resta a 4 righe.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1092 scansioni (4 passate) / 0 violazioni**, invariato. `tsc -b` ✔ · `lint`: tre avvisi preesistenti, zero nuovi.

---

## Coda: il cricchetto non era chiuso del tutto (2026-09-15)

Rilievo di Francesco: la coda precedente aveva corretto il caso semplice, ma **«col resize della finestra non sempre torno a vedere tutte le righe»** — un ridimensionamento *continuo* (il trascinamento del bordo di una finestra vera, non lo scatto singolo di un test) tornava a incollarsi a un'altezza piccola, a volte sì e a volte no.

**Causa vera, più a monte di quella corretta prima.** Il rimedio precedente toglieva il tetto, misurava, lo rimetteva — ma lo faceva scrivendo `style.maxHeight` **sullo stesso elemento che il `ResizeObserver` stava osservando**, dentro il suo stesso callback. In un ridimensionamento a scatto singolo il giro fa in tempo a chiudersi pulito; in una sequenza di notifiche ravvicinate (il trascinamento) la scrittura può restare intrappolata nel meccanismo di ri-consegna di `ResizeObserver` — a seconda di quando cade rispetto alle notifiche del browser, il tetto nuovo a volte non arriva.

**Corretto togliendo la misura dalla propria influenza, non riprovando la stessa strada meglio.** Il riquadro non si misura più da solo: si osserva la **radice** del blocco (`radiceRef`, alta quanto il genitore gliela dà — mai per colpa nostra) e si calcola lo spazio per il riquadro sottraendo quello che sta sopra e sotto di lui, con tre misure che **non dipendono mai** da `altezzaMax`: la posizione del riquadro (`getBoundingClientRect().top`, decisa da cosa viene prima, mai dalla sua stessa altezza), l'altezza vera del piede della paginazione (nuovo `piePaginaRef`, che avvolge `<PaginazioneTabella>`), e il bordo inferiore della radice. Nessuna scrittura di `style` dentro il `ResizeObserver`: la misura è **pura lettura**, quindi non c'è più un giro da cui restare intrappolati, a prescindere da quanto le notifiche arrivino fitte.

Provato in Chromium **simulando un trascinamento vero**: sei passi di altezza in sequenza, 900→850→780→650→720→800→900px — il riquadro torna sempre a ~18 righe alla fine, ripetuto due volte di seguito. Il caso già corretto (filtro a 4 righe, tolto con la crocetta) resta identico.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1092 scansioni (4 passate) / 0 violazioni**, invariato. `tsc -b` ✔ · `lint`: tre avvisi preesistenti, zero nuovi.

---

## Coda: nascondere il bordo era un rattoppo, non la correzione (2026-09-15)

Rilievo tagliente di Francesco, e giusto: la coda precedente aveva tolto il bordo inferiore del riquadro quando c'era altro sotto la piega, per non mostrare due righe grigie vicine. **Toglierlo non allineava niente — nascondeva solo il sintomo**, e uno screenshot successivo lo mostrava: senza bordo, il riquadro finiva nel vuoto, senza un fondo visibile.

**Causa vera del disallineamento**: il tetto si calcolava come `testata + N × altezza-di-riga` — una moltiplicazione. `getBoundingClientRect` torna valori sottopixel, e moltiplicarli per N **amplifica** l'errore invece di limitarlo a uno solo; il `Math.ceil` messo nella coda ancora precedente per un altro pixel scoperto spostava il bordo del riquadro di una frazione rispetto al bordo vero dell'ultima riga — da cui le due righe grigie a un pixel di distanza.

**Corretto misurando dove finisce davvero l'ultima riga, non ricostruendo la cifra a tavolino.** Si scorrono le righe vere già rese (non la sentinella) e si prende il `getBoundingClientRect().bottom` dell'ultima che entra nello spazio disponibile: lo stesso numero che il bordo di quella riga sta già disegnando. Il tetto del riquadro diventa quel numero, non un multiplo calcolato — il bordo del riquadro e il bordo della riga **coincidono**, non stanno a un pixel di distanza. Il bordo inferiore del riquadro torna **sempre presente**, nessuna condizione in più da ricordare.

Provato in Chromium: a 1440×900 il bordo del riquadro e il bordo dell'ultima riga visibile (`Idro Adesivi`) misurano la **stessa coordinata esatta** (`boxBottom - lastRowBottom = 0`, non più 1-2px). Il filtro a 4 righe e il ridimensionamento a più passi (il test della coda precedente) restano corretti.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1092 scansioni (4 passate) / 0 violazioni**, invariato. `tsc -b` ✔ · `lint`: tre avvisi preesistenti, zero nuovi.

---

## Il pannello mobile della sidebar più largo del previsto fra 640 e 768px (2026-09-15)

Rilievo di Francesco, non legato a M3.10: restringendo la finestra dell'app e riaprendo la colonna, il pannello risultava più largo dei consueti 18rem (288px). Non era una regressione di questa sessione — un difetto latente di `ui/sidebar.tsx`/`ui/sheet.tsx`, primitive non toccate, mai preso perché l'unica story che misura la soglia mobile (`Blocchi/App shell`, story `Telefono`) fissa il viewport a 375px, sotto la fascia dove il difetto si vede.

**Causa**: `SheetContent` (in `sheet.tsx`) dà al pannello `data-[side=left]:w-3/4` — un selettore con l'attributo `data-side`, più specifico del semplice `w-(--sidebar-width)` che `sidebar.tsx` aggiunge per fissare i suoi 18rem — quindi è `w-3/4` a vincere la proprietà `width`. Sotto i 640px la differenza non si vede quasi (75% di una finestra stretta è comunque vicino a 288px); sopra i 640px entra in gioco anche `sm:max-w-sm` (24rem = 384px), che diventa il tetto vero perché più piccolo di `3/4` a quelle larghezze — ed è la cifra misurata: **384px, non 288**.

**Corretto con `!` su entrambe le utility** (`w-(--sidebar-width)! sm:max-w-(--sidebar-width)!`): forza la nostra larghezza a vincere a prescindere dalla specificità. Resta un ri-stile di classi, non una modifica di struttura — regola 4bis, gradino 2; `componenti-propri.json` non ne parla, giustamente.

Provato in Chromium: 288px esatti sia a 700px di finestra (la fascia mai testata) sia a 375px (il caso già coperto) — nessuna regressione.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1092 scansioni (4 passate) / 0 violazioni**, invariato. `tsc -b` ✔ · `lint`: tre avvisi preesistenti, zero nuovi.

---

## Coda di M3.10: il riquadro scattava di un paio di pixel scorrendo (2026-09-15)

Rilievo di Francesco, con due screenshot a distanza: scorrendo l'elenco intero, la riga «220 prodotti» in fondo si spostava verticalmente — il riquadro cambiava altezza da solo, non solo a scroll fermo.

**Causa**: l'effetto che ricalcola il tetto dipende da `[infinito, righe.length]` (ora `conRighe`, sotto). `righe.length` cresce **a ogni passo dello scorrimento infinito** — ogni volta che `perPagina="infinito"` carica altre `PASSO_INFINITO` righe, l'effetto si smontava e rimontava da zero: l'osservatore vecchio si disconnetteva, quello nuovo richiamava `ricalcola()` subito, spesso un fotogramma prima che il layout del nuovo pezzo di righe fosse del tutto assestato — misurato in Chromium, uno scatto di ~2px catturato con un `MutationObserver` sullo `style` del riquadro, proprio durante uno scorrimento reale col mouse (non riprodotto scrivendo `scrollTop` a mano, che passa dallo stesso codice ma senza il rumore di un vero evento di scorrimento).

**Corretto su due fronti**: la dipendenza diventa `conRighe` (`righe.length > 0`), non `righe.length` — le posizioni delle righe già rese non cambiano quando se ne aggiungono altre dopo, quindi l'osservatore non ha bisogno di ripartire a ogni passo, solo quando si passa da «zero righe» (lo stato vuoto) a «almeno una» o viceversa. E il margine di rumore sul confronto finale sale da 0.5 a 4px — resta ben sotto un'altezza di riga vera (30px e oltre), quindi non nasconde mai una riga che è davvero entrata o uscita, ma assorbe il sottopixel del `sticky` che si aggancia.

Provato in Chromium: `MutationObserver` armato, scorrimento reale del mouse attraverso più passi di caricamento (fino a 164 righe rese) — **zero mutazioni** di `style.maxHeight` durante lo scorrimento, contro le due registrate prima della correzione.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1092 scansioni (4 passate) / 0 violazioni**, invariato. `tsc -b` ✔ · `lint`: tre avvisi preesistenti, zero nuovi (il nuovo avviso `exhaustive-deps` su un'espressione complessa nelle dipendenze, preso subito, è quello che ha portato a estrarre `conRighe`).

---

## Quanto costa ripetere `perPagina="infinito"` altrove (2026-09-15)

Francesco, a gate chiuso: valutare quanto sia replicabile la forma di Prodotti su altre pagine sola-lista (Norme, Certificazioni), e a che costo.

**Risposta: poco, in codice.** Tre righe bastano — `<AppShell contenuto="riempie">`, la pagina in `flex h-full min-h-0 flex-col` attorno a `PageHeader` + tabella, `<DataTable perPagina="infinito" className="min-h-0 flex-1">`. Le tre correzioni prese in coda oggi (cricchetto, bordo doppio, scatto in scorrimento) non si ripetono: vivono dentro `data-table.tsx`/`app-shell.tsx`, condivise gratis da chi installa il blocco.

**Confine annotato, non scoperto adesso ma reso esplicito ora perché non passasse per «zero sforzo» senza condizioni**: `perPagina="infinito"` rivela progressivamente un array **già tutto in `dati`** — non chiede altro al server durante lo scorrimento. Va bene finché la pagina riceve l'elenco intero in una chiamata sola, com'è oggi per Prodotti (e come `generaProdotti` lo simula nella story). Una pagina futura con un elenco **paginato lato server** chiederebbe un `onCaricaAltro`/`fetchNextPage` che il blocco oggi non ha — lavoro da preventivare, non da assumere incluso.

Annotato in due posti, non uno solo: il commento di testa di `DataTableProps.perPagina` (`data-table.tsx`) — il primo posto in cui chi replica la forma guarda — e `docs/DECISIONI.md` §37 (D19), a chiusura del ragionamento che aveva aperto la domanda.

### Verifiche

Nessuna modifica di comportamento — solo commenti e decisione. `tsc -b` ✔.

---

## Coda di M3.10: la sidebar della story Prodotti allineata a uno screenshot reale, e un difetto vero trovato nel blocco (2026-09-15)

Francesco, a gate chiuso: uno screenshot della sidebar reale di Anagrafe (Riferimenti, Qualifica, Classificazione, Distribuzione, poi Admin, poi l'utente) da riportare in `stories/PaginaProdotti.stories.tsx`.

**Le sezioni non bastavano.** `SEZIONI` aveva tre gruppi a titolo (Qualifica, Classificazione, Distribuzione) con `Norme` infilata dentro Distribuzione — lo screenshot mostra una quarta sezione, **Riferimenti** (Norme, Caratteristiche, Organismi notificati), e un **Admin** in coda prima del piede utente. Riscontro: il `Sidebar.tsx` **oggi in Anagrafe** (letto in sola lettura) non ha ancora Riferimenti — tre sole sezioni, Norme dentro Distribuzione — quindi lo screenshot è una versione più avanti di quella nel checkout locale. Annotato qui perché non passi per una svista di lettura: si è seguito lo screenshot, che è la fonte che Francesco ha dato, non il codice.

**Poi la richiesta è salita di un gradino**: "trasformare le sezioni in gruppi con la loro icona più appropriata", sul modello già dimostrato in `Primitive/Sidebar` (story con `figli` — `Prodotti` che si apre su `Famiglie`/`Sistemi`/`Norme`). Non serviva nessun componente nuovo: `VoceNav.figli` e `VoceNav.icona` del blocco `tassullo-app-shell` già bastavano — le quattro sezioni sono diventate quattro voci di primo livello con icona (`BookOpenIcon`, `BoxesIcon`, `FolderTreeIcon`, `SendIcon`) e sottomenu, `Admin` una quinta voce piatta con `ShieldIcon`. Puro dato di story, zero registro toccato in questo primo passo.

**Due rilievi di Francesco, in coda, hanno invece toccato il blocco:**

1. *"Admin allineato in basso sopra il nome utente"* — `SezioneNav` non aveva modo di dirlo: le sezioni finiscono dove finiscono nel flusso. Aggiunto un `className?: string` opzionale su `SezioneNav`, passato alla `SidebarGroup` — `SidebarContent` è già `flex flex-col`, quindi `mt-auto` sulla sezione di Admin basta. Non è stata una decisione da 4bis-gradino-4: `SidebarGroup` accetta già `className` di suo, qui si espone solo un canale già esistente nella primitiva — gradino 2.
2. *"manca la vista compatta della sidebar con le sole icone"* — la story passava ancora `collassa="fuori"`, ereditato da quando Anagrafe non aveva icone. Con le sezioni ora tutte iconate, passato a `collassa="icona"`: il rail da 48px torna a funzionare, provato in Chromium.

**Il difetto vero, trovato guardando il rail**: con tutte le sezioni ora un `Collapsible`, `defaultOpen={voce.attiva}` (in `app-shell.tsx`) apriva **solo** il gruppo marcato attivo — Qualifica aperta, le altre tre chiuse. Francesco l'ha preso subito: *"da decidere se apertura default con tutti i sottomenu aperti o chiusi, sicuramente non una via di mezzo"*. Aveva ragione a chiamarlo un difetto e non un gusto — quella via di mezzo è un comportamento di *stato*, non di stile, e non è nel gradino 2 di 4bis: non si può correggere ri-stilando una classe.

**Deciso: tutti aperti di default**, non tutti chiusi. `defaultOpen` è stato scollegato da `attiva` — ogni gruppo con `figli` si apre da sé, `attiva` resta a governare solo l'evidenziazione (chiaro nel commento lasciato in `app-shell.tsx`). Motivo della scelta e non del contrario: con quattro gruppi da 2-3 voci ciascuno l'albero intero sta su uno schermo senza scorrere, e vedere subito dove si è (`Prodotti` evidenziato dentro `Qualifica`, aperta insieme alle altre) costa meno click che aprire a mano ogni volta. È un comportamento del **blocco**, non della story: cambia per chiunque installi `tassullo-app-shell` con voci a `figli` — inclusa la story-dimostrazione `Blocchi/App shell` (il gruppo `Documenti`, prima chiuso perché non `attiva`, ora si apre anche lui). Nessuna regressione: provato in Chromium chiuso/aperto/rail, e `test:a11y --una` è tornato **0 violazioni** subito dopo la modifica.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1092 scansioni (4 passate) / 0 violazioni**, invariato. `tsc -b` ✔ · `lint`: tre avvisi preesistenti (`set-state-in-effect` su file non toccati), zero nuovi. `componenti-propri.json` resta vuoto: `className` su `SezioneNav` e lo scollegamento di `defaultOpen` sono comportamento del blocco esistente, non un componente nuovo.

---

## M4.1 — `pagina-login`, prima pagina modello della FASE 3.10 → FASE 4 (2026-09-15)

Chiusa la FASE 3 (M3.10, gate di fase), si apre la FASE 4 — pagine intere, non spezzoni. `Login.tsx` di Anagrafe (letto in sola lettura, `frontend/src/pages/Login.tsx`, 24 righe) è il riferimento: logo, titolo, un bottone «Accedi con Microsoft» che chiama `instance.loginRedirect(loginRequest)` di MSAL, e un avviso quando l'app registration Entra ID non è ancora configurata.

**Nuovo file `registry/tassullo/pages/pagina-login.tsx`** — `PaginaLogin`, componendo `Card`/`Alert`/`Button`/`Spinner` già nel registry, zero primitive nuove. Tre decisioni prese scrivendolo:

1. **`onAccedi` è la sola cucitura verso MSAL**, non un import di `@azure/msal-react`. Portare quella libreria nel blocco obbligherebbe ogni consumatore del registry a quella dipendenza specifica anche senza fare autenticazione, o facendola con un provider diverso — il blocco non deve sapere qual è.
2. **`stato` è un solo prop a tre valori** (`inattivo` | `in-corso` | `errore`), non tre booleani indipendenti che potrebbero contraddirsi (`inCorso && errore` insieme, per dire) — gli stessi tre che Anagrafe già distingue nel proprio flusso.
3. **`configurato` è ortogonale a `stato`**, esattamente come `isAuthConfigured` nell'originale: un'app senza app registration può trovarsi in `inattivo` o in `errore` indipendentemente, e a `configurato={false}` il bottone resta disabilitato con l'avviso sotto, a prescindere da `stato`.

Il messaggio d'errore arriva già tradotto — stessa regola di `tassullo-error-state` — e si mostra con `Alert variant="destructive"`, non un testo tinto `text-destructive`: la prima delle due trappole del `CLAUDE.md`.

**Rilievo di Francesco a caldo, guardando la story**: la T del logo usciva arancione (`text-primary` sullo `span.marchio-t`). Sbagliato — il marchio segue `currentColor`, e forzarlo a `--primary` lo tinge di brand ovunque, mentre l'identità visiva vuole la T **bianca o nera**, mai arancio come colore di testo (è la stessa famiglia della prima trappola: `--primary` non si usa mai per il testo). Tolta la classe: la T eredita il colore ambiente del `CardHeader` (`text-card-foreground`), nero in chiaro e bianco in scuro — provato in Chromium in entrambe le modalità dopo la correzione.

**`check:registry` esteso a `registry/tassullo/pages/`**, prima cartella di FASE 4: stessa funzione `fileBlocchi()` che già copriva `blocks/` e `lib/` (sola regola 3, nessun originale shadcn per costruzione, nessuna riga in `componenti-propri.json`) — senza l'estensione sarebbe stata la prima cartella del registry a restare invisibile al gate fin dal primo file.

Item aggiunto a `registry.json`: `tassullo-pagina-login` (`registry:block`, target `components/pages/pagina-login.tsx`), `registryDependencies` su `alert`/`button`/`card`/`spinner`/`tema`. `npm run registry:build` rilanciato.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1112 scansioni (4 passate, con la nuova pagina) / 0 violazioni**; `test:a11y -- --una` dopo la correzione del logo, **278 scansioni / 0 violazioni**. `tsc -b` ✔ · `build` ✔ · `lint`: gli stessi tre avvisi preesistenti, zero nuovi. Provato in Chromium: stati `Predefinito`/`InCorso`/`Errore`/`NonConfigurato`/`Interattiva`, logo nero in chiaro e bianco in scuro.

---

## M4.2 — `pagina-lista`, e la chiusura di D10 (2026-09-15)

Francesco, ad apertura sessione: verificare se la story `Pagine/Prodotti (Anagrafe)` (M3.10, gate di fase) rispecchiasse già il lavoro di M4.2.

**Risposta: no, non è la stessa cosa, e vale la pena dirlo esplicitamente perché la somiglianza è reale.** `PaginaProdotti` di M3.10 dimostra che `app-shell` + `page-header` + `data-table` + `empty-state` **si compongono** — ma la composizione vive **fuori dal registry**, in `stories/PaginaProdotti.stories.tsx`: JSX scritto a mano dentro un file di vetrina, non un componente installabile. `CLAUDE.md` §6 è netto su questo confine — `stories/` in root ospita solo le pagine trasversali della style guide, non gli item. M4.2 chiede una **pagina modello**, sullo stesso piano di `pagina-login` (M4.1): un `registry:block` in `registry/tassullo/pages/`, che un'app vuota installa con un `add` e riempie di dati veri. Inoltre M3.10 provava solo il vuoto-per-filtro e il vuoto-per-niente-creato: **`caricamento` ed `errore`**, che `PIANO.md` §M4.2 chiede esplicitamente, non c'erano.

**`registry/tassullo/pages/pagina-lista.tsx` — `PaginaLista<TDato>`**, generica sul tipo di riga (stesso `RowData` di `DataTable`). Compone quattro blocchi già nel registry, zero primitive nuove: `PageHeader` in testa, poi una fra `PageSkeleton` (`stato="caricamento"`), `ErrorState` (`stato="errore"`), `EmptyState` (`vuotoIniziale` presente e `dati` vuoto) o `DataTable` (il caso normale). Due decisioni prese scrivendola:

1. **`stato` è un prop a tre vie** (`pronto`/`caricamento`/`errore`), non booleani indipendenti — stessa forma di `PaginaLogin` (M4.1), stessa ragione: `caricamento && errore` insieme non ha un senso da rendere.
2. **`vuotoIniziale` è distinto da `vuoto`**, non un alias. `vuoto` (passato a `DataTable`) è il vuoto-per-filtro, che la tabella già gestisce da sé col bottone che pulisce la ricerca. `vuotoIniziale` è *non esiste ancora nessuna riga*: `EmptyState` **al posto** della tabella, con la CTA che crea il primo record — non "pulisci i filtri". `INTERFACCE.md` §1.1 li vuole distinti, ed è lo stesso confine che M3.10 aveva già preso a mano nella story Prodotti; qui diventa una prop, non una scelta ripetuta a ogni pagina.

**La story colocata (`registry/tassullo/pages/pagina-lista.stories.tsx`) usa Norme, non Prodotti** — deliberatamente un altro dominio (codice/titolo/ente/categoria/stato, 48 righe finte), a dimostrare che il blocco è generico e non "Prodotti con un altro nome". Quattro story: `ConDati`, `Caricamento`, `Errore`, `VuotoIniziale` — le due mancanti in M3.10.

**D10, la cella `375px × touch`.** `PIANO.md` §M4.2 la chiede sulla pagina più densa del registry — filtri, tabella, paginazione — e tre uscite erano possibili: *(a)* la densità touch regge così com'è, *(b)* si scorpora `--space-page` dallo scaling, *(c)* il fattore si riduce sotto una certa larghezza. Misurato in Chromium, `pagina-lista` a 375×812, densità touch: la colonna di contenuto resta **327px** — la stessa cifra esatta di M3.1 (`docs/DECISIONI.md` §29, 343 → 327, il padding di pagina che toglie 16px in tutto). La pagina più densa possibile non introduce un difetto nuovo: nessun bersaglio sotto soglia, nessuna rottura di layout, la tabella scorre in orizzontale com'è previsto (comportamento già gated in `data-table.stories.tsx`). **Verdetto: (a)**. Le uscite (b) e (c) restano scartate — la (c) in particolare, come `PIANO.md` osservava a monte, avrebbe reintrodotto una dipendenza dal viewport in un meccanismo che è deliberatamente una scelta dell'app.

Provate anche le altre tre celle per completezza (`375×normale`, `1440×touch`, `1440×normale`): tutte pulite, sidebar a rail in touch, tabella intera visibile in `1440×touch` senza scorrimento orizzontale.

Item aggiunto a `registry.json`: `tassullo-pagina-lista` (`registry:block`, target `components/pages/pagina-lista.tsx`), `registryDependencies` su `data-table`/`empty-state`/`error-state`/`page-header`/`page-skeleton`/`tema`. `npm run registry:build` rilanciato.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1128 scansioni (4 passate, +4 story) / 0 violazioni**. `tsc -b` ✔ · `lint`: gli stessi tre avvisi preesistenti, zero nuovi. Provato in Chromium: quattro stati (`ConDati`/`Caricamento`/`Errore`/`VuotoIniziale`) e le quattro celle viewport × densità per D10.

---

## Coda di M4.2: `PaginaLista` con paginazione a pagine non scorreva (2026-09-16)

Rilievo di Francesco, provando la story a mano: impostata una tabella con 50 righe pensata per stare "in una sola pagina" (cioè `perPagina` numerica, non `"infinito"`), la pagina non scorreva affatto — righe oltre il fondo dello schermo invisibili, nessuna scrollbar da nessuna parte.

**Causa**: `PaginaLista` avvolgeva il contenuto in `h-full min-h-0` **a prescindere** da come si usa `perPagina`. Quella forma è corretta solo per `perPagina="infinito"` dentro `<AppShell contenuto="riempie">`, che mette `overflow-hidden` sopra proprio apposta — lo scorrimento vero lo fa `table-container` all'interno (D19, `docs/DECISIONI.md` §37). Con una `perPagina` numerica non c'è niente da far scorrere lì dentro: è **la pagina** a dover scorrere, ed è esattamente quello che `contenuto="riempie"` toglie. La story `ConDati`, scritta nella sessione precedente, aveva proprio questa combinazione sbagliata (`contenuto="riempie"` + `perPagina={25}`) — il difetto era nell'esempio ufficiale, non in un uso scorretto del consumatore.

**Corretto su due fronti**: `PaginaLista` applica `h-full min-h-0` solo quando `perPagina === "infinito"` (stessa condizione decide anche `flex-1` su `PageSkeleton`/`ErrorState`/`DataTable`); la story `Guscio` non passa più `contenuto="riempie"`, resta al default `"scorre"`. Commento aggiunto in testa alla funzione perché la scelta non è ovvia guardando il solo JSX.

Provato in Chromium a finestra bassa (1280×650, meno della metà delle 25 righe visibili): la pagina scorre con scrollbar vera, arriva al piede «48 norme / Pagina 1 di 2». Confermato da Francesco sul proprio Storybook dopo un refresh (l'HMR non aveva ripreso la modifica al decorator del guscio).

**Nella stessa coda, tre correzioni di colonne sulla story** (rilievo di Francesco): «codice» diventa un collegamento (stessa forma della colonna «Nome» di Prodotti, `variant="link"` invece di un colore a mano), «titolo» perde la `larghezza` fissa — è la colonna che assorbe lo spazio libero, le altre sono identificatori o etichette corte — e «categoria» prende `w-28` come «stato», non più a larghezza automatica.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1128 scansioni (4 passate) / 0 violazioni**, invariato. `tsc -b` ✔.

---

## `tassullo-data-table`: il riquadro ad altezza ferma non copriva la paginazione numerica (2026-09-16)

Rilievo di Francesco, dopo la correzione precedente: con 10 righe la tabella restava molto più corta dello schermo, con 25 (il default) il riquadro superava lo schermo e senza scorrere **la pagina** il piè — conteggio, salti di pagina — restava fuori vista. Chiesto un confronto con le best practice di settore prima di procedere.

**Ricerca** (Pencil & Paper, LogRocket, Setproduct — fonti in fondo alla voce): una tabella dati densa vuole **un solo scroll**, non due; il piè con conteggio e paginazione **sempre visibile**, tipicamente `sticky` in fondo; l'intestazione ferma mentre il corpo scorre.

**Diagnosi**: `tassullo-data-table` aveva già esattamente questo pattern — riquadro ad altezza calcolata (`altezzaMax`), scorrimento interno su `table-container`, piè sempre fuori dall'area che scorre — ma **solo per `perPagina="infinito"`**. La paginazione numerica non aveva mai ricevuto lo stesso trattamento: il riquadro cresceva con le righe e basta, quindi con 25 finiva più alto dello schermo e serviva scorrere tutta la pagina per vedere il piè. Non era un uso scorretto del consumatore: era un buco nel blocco.

**Corretto scorporando due decisioni che stavano cucite insieme**: `perPagina` sceglie **come si caricano** le righe (`"infinito"` = a scorrimento, un numero = a pagine — invariato), un nuovo `altezza?: "naturale" | "ferma"` sceglie **quanto spazio prende il riquadro** — indipendente. `"ferma"` applica a qualunque `perPagina` la stessa meccanica che prima girava solo per `"infinito"`: `altezzaMax` calcolato, intestazione `sticky`, `snap-y` sul contenitore che scorre. `"naturale"` (default, invariato per compatibilità) resta il comportamento di prima — corretto quando la tabella è **una sezione fra altre** (una `pagina-scheda` con più contenuto intorno), sbagliato quando la tabella **è** la pagina.

Aggiunto anche `piePagina?: boolean` (default `true`): toglie del tutto conteggio e paginazione per le tabelle **imbarcate** — pensato per M4.3 (`pagina-scheda`), dove Francesco prevede più tabelle piccole nella stessa pagina senza bisogno del conteggio. L'effetto che calcola `altezzaMax` ora tollera un piè assente (la sua altezza vale zero nel calcolo, invece di bloccare tutto).

**`PaginaLista` aggiornata di conseguenza**: prima faceva dipendere il proprio contenitore (`h-full min-h-0`) da `perPagina === "infinito"` — la correzione della sessione precedente, che risolveva il sintomo ma non la causa. Ora passa sempre `altezza="ferma"` a `DataTable` e riempie sempre lo schermo: `pagina-lista` **è** sempre la pagina (a differenza di una tabella dentro una scheda), quindi il riquadro fermo è corretto a prescindere da come `perPagina` carica le righe. La story torna a dichiarare `contenuto="riempie"` senza eccezioni.

**Regressione presa e corretta nello stesso giro**: la story `Pagine/Prodotti (Anagrafe)` (M3.10) chiama `DataTable` direttamente con `perPagina="infinito"` ma — scritta prima che le due prop si separassero — non passava il nuovo `altezza="ferma"`. Risultato misurato in Chromium: il riquadro restava vincastrato a 565px (la stessa altezza di prima, per un effetto collaterale di `overflow-hidden` sul modello flessibile) ma **senza scorrimento interno** — `table-container` cresceva a 8305px di contenuto dentro un genitore che lo ritagliava senza offrire scrollbar: le righe oltre la prima schermata erano invisibili e irraggiungibili, la stessa famiglia di difetto del rilievo iniziale di Francesco, su un'altra story. Corretto aggiungendo `altezza="ferma"` alla chiamata.

Aggiunta anche una story `Pagine/Lista → PocheRighe` (6 norme) a riprova del caso opposto: il riquadro si restringe al contenuto, nessun vuoto sotto, il piè resta comunque subito sotto l'ultima riga senza scorrimento.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1132 scansioni (4 passate) / 0 violazioni**. `tsc -b` ✔ · `lint`: gli stessi tre avvisi preesistenti, zero nuovi. Provato in Chromium: `ConDati` (25 righe, scorrimento interno confermato misurando `clientHeight`/`scrollHeight` di `table-container` prima e dopo la correzione), `PocheRighe` (6 righe, nessuno spazio vuoto), `Prodotti (Anagrafe)` (`perPagina="infinito"`, intestazione `sticky` confermata sul nodo `data-slot="table-header"` — non sull'omonimo di un pannello di Storybook, trovato per errore alla prima misura).

Fonti consultate: [Data Table Design UX Patterns & Best Practices — Pencil & Paper](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables), [Data table design: Best practices for better UX — LogRocket](https://blog.logrocket.com/ux-design/data-table-design-best-practices/), [Data table UI design reference guide for 2026 — Setproduct](https://www.setproduct.com/blog/data-table-ui-design).

---

## M4.3 — `pagina-scheda`, terza pagina modello (2026-09-16)

Il dettaglio di un'entità — in Anagrafe Prodotto, Famiglia, Sistema, Norma, quattro volte la stessa pagina, e il file CSS più grande del progetto (`Prodotto.css`, 201 righe). `registry/tassullo/pages/pagina-scheda.tsx` compone ciò che il registry ha già — `page-header`, `tabs`, `field`, `version-timeline`, `page-skeleton`, `error-state` — zero primitive nuove.

**Due intestazioni, non una spostata.** `page-header` (M3.2) toglie deliberatamente il titolo dalla fascia in alto — comparirebbe tre volte in 80px insieme a percorso e voce di colonna. Ma quella è l'intestazione del **guscio**; su una scheda il nome dell'entità è l'unica cosa scritta grande da qualche parte, e senza non si saprebbe mai «UNI EN 1090» arrivandoci da un elenco. `PaginaScheda` quindi passa a `PageHeader` solo il `percorso` (va nella fascia) e rende **dentro il contenuto** un'intestazione propria — titolo, `distintivo`, azioni — che si vede sempre, senza doversi comprimere in un menu come fa la fascia stretta.

**`distintivo` è un nodo già composto, non un `variant` chiuso.** Un prodotto è «attivo»/«superato», una norma «vigente»/«abrogata», un sistema «in produzione»/«in sviluppo»: quattro vocabolari incompatibili. Fissarne uno nel blocco vorrebbe dire indovinare e sbagliare per le altre tre entità — stessa libertà che `barra` lascia a `tassullo-data-table` per i filtri.

**Lettura e modifica sono due alberi, non un form con `readOnly` sparso.** `anagrafica.lettura` e `anagrafica.modifica` sono due `ReactNode` distinti: la lettura vuole densità senza controlli (`CampoLettura`, esportato insieme al blocco — `Field`+`FieldTitle`+`FieldContent` della primitiva, statico), la modifica vuole `tassullo-form-field` con `react-hook-form`. Forzarle in un solo albero con rami condizionali dentro ogni campo avrebbe richiesto di generalizzare per ogni tipo di controllo — la stessa ragione per cui `FormField` (M3.4) prende il controllo come funzione e non come prop `tipo`. Il blocco possiede solo **il passaggio**: un bottone "Modifica" che diventa "Annulla".

**Rilievo preso scrivendo la story, non a caldo da Francesco**: con `modifica` come solo stato interno, il blocco non ha modo di tornare alla lettura dopo un salvataggio riuscito — quel successo lo sa solo il `<form>` dell'app, che è un `ReactNode` opaco dentro `anagrafica.modifica`. Corretto rendendo `modifica`/`onModificaChange` **controllabili**: non passate, restano uno stato interno (il caso comune, "Annulla" basta a sé stesso); passate, l'app decide quando uscire dalla modifica — nella story `ConDati`, nel gestore che intercetta "Salva" del form finto. Provato in Chromium via DOM (non a schermo, il canvas 1440 eccede la larghezza del pannello): editato il campo "Codice", cliccato "Salva", il titolo/breadcrumb si aggiornano a "UNI EN 1090-2" e il bottone torna a "Modifica" — il ciclo lettura→modifica→salvataggio→lettura chiuso.

**`storico` monta sempre `VersionTimeline` da sé** («in coda», come chiede `PIANO.md`): lo storico delle revisioni è la stessa forma per ogni entità. **`documenti` resta un `ReactNode` libero**: un allegato di Norma è un PDF, uno di Prodotto una foto o un disegno REN/RES — nessuna forma sola, stessa scelta di `barra` in `data-table`.

Story colocata su **Norme**, lo stesso dominio di `Pagine/Lista` (M4.2) — il codice della colonna "Codice" lì è il varco a questa scheda. Quattro story: `ConDati` (lettura, distintivo, storico su tre revisioni, documenti), `Caricamento` (`PageSkeleton variante="scheda"`), `Errore`, `StoricoConfrontabile` (due checkbox selezionate, "Confronta" abilitato con l'etichetta `Rev. 4 → Rev. 5` — stesso aggancio disaccoppiato di `version-timeline.stories.tsx`, nessuna `diff-view` fra le dipendenze).

Item aggiunto a `registry.json`: `tassullo-pagina-scheda` (`registry:block`, target `components/pages/pagina-scheda.tsx`), `registryDependencies` su `error-state`/`page-header`/`page-skeleton`/`version-timeline`/`button`/`field`/`tabs`/`tema`. `npm run registry:build` rilanciato — **75 item**.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1148 scansioni (4 passate, +4 story) / 0 violazioni**. `tsc -b` ✔ · `lint`: gli stessi tre avvisi preesistenti, zero nuovi. Provato in Chromium: `ConDati` (lettura, passaggio a modifica, editing e salvataggio via DOM, tab Documenti e Storico), `Caricamento`, `Errore`, `StoricoConfrontabile` (selezione e "Confronta"), chiaro e scuro.

---

## Coda di M4.3: due correzioni di Francesco sulla prima versione (2026-09-16)

Guardando la story, due rilievi sulla prima versione di `pagina-scheda`:

**1. I campi vivevano a diretto contatto con lo sfondo grigio della pagina.** Confronto con `Prodotto.tsx` di Anagrafe (screenshot reale): lì ogni scheda sta dentro un riquadro bianco, staccato dallo sfondo. Corretto avvolgendo il contenuto di ognuno dei tre tab (`anagrafica`, `documenti`, `storico`) in `Card`/`CardContent` — la primitiva già nel registry, nessun contenitore nuovo.

**2. `anagrafica.lettura`/`anagrafica.modifica` come due alberi era la scelta sbagliata.** Il criterio di M4.3 («form in sola lettura che passa in modifica») era stato letto come «due viste», ma un campo che cambia forma — da testo piatto a riquadro con bordo — al clic su "Modifica" fa muovere l'intera scheda, e un form vero non lo fa mai: gli stessi campi restano al loro posto, cambia solo se rispondono. **Corretto invertendo il modello**: `anagrafica` è ora `(modifica: boolean) => ReactNode`, non `{ lettura, modifica }`. Un solo `<form>` con `tassullo-form-field`, sempre montato; ogni `Input`/`Textarea` riceve `disabled={!modifica}` dal consumatore — il blocco non sa *come* si disabilita un controllo (un `Input` di shadcn si sbianca da sé), sa solo *quando*.

Ricaduta sulla story: `AnagraficaLettura`/`AnagraficaModifica` (due componenti) diventano `AnagraficaForm` (uno), con un `useEffect` che fa `form.reset(dati)` quando `modifica` torna vero — senza, "Annulla" uscirebbe dalla modifica ma lascerebbe il valore scartato nell'input, pronto a essere salvato per sbaglio al giro successivo. Provato via DOM in Chromium: editato "Codice", "Annulla", rientrato in modifica — il valore scartato non c'è, resta l'originale. `CampoLettura` (la riga statica della prima versione) è stato rimosso: con un solo albero non serve più.

`registry.json` aggiornato (`registryDependencies`: `card` al posto di `field`; `docs` riscritto sulla nuova firma). `npm run registry:build` rilanciato.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1148 scansioni (4 passate) / 0 violazioni**, invariato. `tsc -b` ✔ · `lint`: gli stessi tre avvisi preesistenti, zero nuovi. Provato in Chromium: campi disabilitati in lettura dentro la card bianca, campi attivi in modifica (stessa posizione, nessun salto), "Annulla" che scarta, "Salva" che aggiorna titolo/breadcrumb e torna alla lettura, chiaro e scuro.

---

## Valutazione niko-table e apertura FASE 3bis (2026-09-16)

Francesco ha segnalato [niko-table](https://niko-table.com), un registry shadcn su TanStack Table v9 compatibile Base UI, con esempi già pronti per pattern che `data-table` (M3.3) non copre — righe espandibili, selezionabili, resize colonne, ecc. Sessione di sola valutazione (nessun codice scritto), condotta in gran parte in modalità piano: letta la documentazione niko-table quasi per intero (Introduction, Installation, Components, Config, Core, Filters, Hooks, Library, Types, Skills) e tutti gli esempi Table/Grid tranne Simple/Basic/Search (sottoinsiemi di capacità già nostre) e l'"Overview" specifico della Data Grid.

**Riscontro con un caso reale**: screenshot del "Computo metrico estimativo" di Studio Tassullo (`/computo`, login richiesto — non acceduto, valutato solo dallo screenshot fornito da Francesco). Righe di voce con sotto-righe di misurazione annidate (dati veri, non raggruppamento — corretto un'ipotesi sbagliata in corso di valutazione leggendo "Tree Table", che distingue Tree/Grouping/Row Expansion come tre pattern separati da non mischiare), subtotale per voce, totale generale, editing inline.

**Verificato perché l'installazione diretta (`npx shadcn add @niko-table/...`) non regge**: import fissi non sul nostro alias (regola 1), valori Tailwind arbitrari nel core (regola 3), sovrascriverebbe il nostro `ui/table.tsx` già ri-stilato via `@niko-table/data-table-ui`. **Verdetto: si porta (si riscrive), non si installa** — dettaglio motivato in `docs/DECISIONI.md` §40.

**Verificato sul codice reale di `data-table.tsx`, non solo sulla documentazione niko-table**, cosa è già coperto e cosa no: Row Selection + barra di azioni di massa già completi (M3.3: `selezione` + `barra` come funzione); Column Pinning solo parziale (`bloccaPrimaColonna` è già un pin fisso, va generalizzato); filtri per colonna hanno già lo stato TanStack ma nessuna UI (gap reale).

**Aperta FASE 3bis — Tabelle avanzate (niko-table), 10 sessioni** in `PIANO.md` e `CHECKLIST.md` (M3bis.0-9, tutte TODO): inventario/mappa di adattamento, righe annidate con subtotale (Tree), espansione righe, resize+pin colonne generalizzato (tocca `ui/table.tsx`, **blocca sulla conferma esplicita di Francesco**, riapre D17), virtualizzazione/scroll infinito, Data Grid editabile con celle tipizzate e validazione Zod (2-3 sessioni), filtri sfaccettati, drag&drop righe, drag&drop colonne, aggiornamento di `pagina-lista`. Ambito ampliato in corso di discussione su richiesta di Francesco (inizialmente valutato solo Tree+Data Grid, poi aggiunti DnD righe/colonne, virtualizzazione autonoma e filtri sfaccettati dopo revisione più a fondo degli esempi niko-table). Deliberatamente fuori ambito: `data-table-aside`, export CSV (già coperto lato Studio da Excel/Primus/ZIP), colonne dinamiche a runtime, filtri query-builder AND/OR, grid server-side vero e proprio, e la skill `niko-table-best-practices` (scartata: insegnerebbe le convenzioni di import/API inglesi che questa fase decide di non adottare).

Nessun file di registry toccato in questa sessione. Prossimo passo: M3bis.0.

---

## M3bis.0 — Inventario e mappa di adattamento (2026-09-16)

Completata la lettura lasciata aperta dalla valutazione precedente: le sei pagine `niko-table/overview/{core,filters,hooks,lib,types,config}` (l'API reference completa lato Table — la sessione di valutazione aveva letto le pagine narrative "Core/Filters/Hooks/Library/Types", non questi dump di riferimento), l'Introduction della Data Grid (`/data-grid/introduction/`, non ancora aperta), e gli esempi Simple/Basic/Search Table più Row Context Menu Table. Nessun codice scritto: è la sessione di sola mappa, come da `PIANO.md`.

### Bypass di `DataTableRoot`/`detectFeaturesFromChildren`: confermato, e ora con la prova nel testo di niko-table stesso

`config/feature-detection.tsx` (letto in `niko-table/overview/config/`) fa esattamente quello che il nome dice: cammina l'albero React cercando nomi di componente noti (`DataTableFacetedFilter`, `DataTableSortMenu`, …) e ne deriva `enableFilters`/`enableSorting`/ecc. — con una cache che usa il **nome del componente** come chiave, quindi fragile a wrapping/rinomina, e comunque un costo (50-150ms al primo giro, per loro stessa documentazione). `tassullo-data-table.tsx` non lo fa: dichiara le feature esplicitamente su `tableFeatures()` (visto in `lib/data-table-features`, dove niko-table stessa lo raccomanda come "il modo giusto" per una tabella su misura — la loro auto-detection è lo zucchero per chi installa i pezzi a pioggia, non l'unico modo). **Confermato**: si continua a costruire `useTable({ features, data, columns })` a mano in ogni sessione della fase, mai `DataTableRoot`. Le sessioni M3bis.1-8 vanno lette con questo in testa — quando la documentazione niko-table dice "si abilita da sé mettendo il componente", da noi si abilita scrivendo la feature nel nostro `tableFeatures()`.

### Cosa serve tradurre — l'inventario per le sessioni 1-8

Nessuna icona Lucide da cambiare: niko-table usa `lucide-react`, già nostra dipendenza (M3.3). Da tradurre sono **solo le stringhe**, tutte lette nelle pagine di riferimento:

- **Etichette di ordinamento** (`config/data-table.tsx`, tabella "Sort Labels"): "Asc"/"Desc" (testo), "Low to High"/"High to Low" (numeri), "Oldest First"/"Newest First" (date), "False First"/"True First" (booleani) — quattro coppie, non una sola, perché il tipo di colonna cambia la frase intera, non solo il verso.
- **Etichette degli operatori di filtro** (menzionate ma non elencate per esteso in `lib/overview` — vanno lette dal sorgente al momento di portare `table-inline-filter`/`table-filter-menu`, M3bis.6): "Contains", "Equals", "Is empty", ecc.
- **Comandi della Data Grid**: "Add rows", "Add column", "Export CSV" (fuori ambito, §40), "Undo"/"Redo", "Clear all", il segnaposto "Paste a spreadsheet (Ctrl/Cmd+V) to fill rows", le colonne dello stato demo ("Focused Cell", "Editing Cell", "Selection Anchor", "Can Undo / Redo", "Last Commit").
- **Scorciatoie da tastiera pubblicate a schermo**: `DataGridShortcutsButton` apre un elenco ("Arrows, Tab, Enter, Escape navigate and edit…") che va riscritto, non solo tradotto — la nostra tastiera per `data-table` (M3.3) già diverge da quella di shadcn (ordina con un clic, non un menu), quindi l'elenco pubblicato deve descrivere *la nostra* tastiera, non quella di niko-table.
- **Il registro dei filtri** (`lib/constants`, tabella `FILTER_OPERATORS`): i valori (`ilike`, `eq`, `between`, …) sono nomi in stile PostgREST, restano tecnici e non si traducono; le **label** che li accompagnano nell'UI sì.

### Conferma sul confine di M3bis.5 e sul numero di sessioni

Letta `/data-grid/introduction/` per intero: la Data Grid **non è un blocco a sé che si aggiunge**, è `tassullo-data-table` più un motore separato (`useDataGrid`, non controllato — "like `defaultValue`", la ragione scritta è che uno stato controllato ricalcolerebbe il modello di tabella a ogni tasto e romperebbe l'undo) e componenti opt-in dentro un nuovo `<DataGrid>` che avvolge `<DataTable>`. Conferma quanto già scritto in `PIANO.md`: **non basta `getRowMemoKey`** (editing in-riga leggero) per il caso reale del "Computo" — quel pattern non ha clipboard, non ha fill, non ha undo/redo, e il computo li vuole tutti e tre (voci numeriche incollate da un foglio esterno, corretta a mano dal caso reale mostrato da Francesco).

**Fissato a 3 sessioni**, come da margine lasciato in `PIANO.md`:
1. **Motore + composizione minima**: `useDataGrid`, `<DataGrid>`, `DataGridClipboard`, `DataGridFillHandle`, `DataGridUndo`/`DataGridRedo`, innestato dentro `tassullo-data-table` (dipende da M3bis.3 per il resize/pin, da M3bis.4 per il corpo virtualizzato — la Data Grid nasce già virtualizzata, `DataTableVirtualizedBody` non `DataTableBody`).
2. **Celle tipizzate + validazione**: porting dei `GridTextCell`/numero/valuta (`it-IT`)/checkbox/data/select da "Cell Types", e la validazione per cella da "Validation" (Zod, coerente con `tassullo-form-field` M3.4).
3. **Persistenza**: `useGridChanges` (da "Persistence", crea/aggiorna/cancella come change-set) più la prova end-to-end su un dataset finto a forma di computo (voci con subtotale, dalla M3bis.1) — è qui che il criterio d'accettazione di `PIANO.md` ("~500 righe, incolla, annulla/ripeti, celle di un computo finto") si verifica per intero, non prima.

Le colonne dinamiche a runtime (Dynamic Columns) **restano fuori ambito** (già deciso in §40): la Data Grid le usa nella sua demo ma il caso reale di Studio ha colonne fisse.

### Una precisazione sul pattern Tree (M3bis.1), vista ora sul motore Data Grid

L'esempio "Tree" della Data Grid Introduction usa `getSubRows` esattamente come l'omonimo pattern lato Table puro (già letto nella valutazione precedente) — **stesso meccanismo**, la sola differenza è se le celle sono editabili. Conferma che M3bis.1 (Tree su `data-table`, sola lettura) e la parte "editabile" dello stesso pattern dentro la Data Grid (M3bis.5) condividono `getSubRows` e non vanno reinventati due volte: la sessione 1 di M3bis.5 riusa la struttura ad albero di M3bis.1, aggiungendovi sopra il motore di editing.

### Un pattern trovato, non richiesto, annotato e non aperto

`Row Context Menu Table` (letto per completezza, non nell'ambito delle 10 sessioni): un solo componente di menu-riga (`RowMenuItem`/`RowMenuSeparator` polimorfici) che si monta sia nel dropdown "…" sia nel menu del tasto destro, tramite `useDataTableRow<T>()` per leggere la riga da contesto. `tassullo-data-table` oggi non ha un pattern equivalente — chi vuole azioni di riga scrive la propria colonna con un `DropdownMenu` a mano, senza tasto destro. Non è fra le 10 sessioni aperte in §40 e non lo si aggiunge qui: annotato perché se un caso reale lo richiede (un elenco con azioni di riga frequenti, dove il tasto destro farebbe risparmiare un clic) la strada è già mappata.

### Coda: due sessioni aggiunte, e il worktree che le ospiterà

Rilette le note di questa sessione, Francesco ha chiesto di aprire due sessioni in più, entrambe dai pattern annotati "non richiesti" sopra — non più annotazioni, task veri:

- **M3bis.9 — Menu di riga condiviso, dropdown e tasto destro**: il pattern "Row Context Menu Table" annotato sopra. Aggiunto in `PIANO.md`/`CHECKLIST.md`.
- **M3bis.10 — Editing in-riga leggero (`getRowMemoKey`)**: dal pattern "Inline Edit Table" (niko-table), letto in coda a questa sessione. È lo stesso `getRowMemoKey` già scartato **per il caso Computo** in M3bis.5 (niente clipboard/undo, non basta a un foglio di calcolo) — ma resta la strada giusta per un caso diverso e reale: correggere un campo alla volta in un elenco (una `pagina-lista` di Anagrafe) senza aprire la scheda e senza pagare il costo della Data Grid intera. Punto chiave del pattern originale: lo stato di editing (`editingId`/`draft`/`errors`) sta **fuori dai dati**, mai un `isEditing` dentro la riga — quello farebbe ri-renderizzare l'intera tabella a ogni tasto — e `getRowMemoKey` (già nel nostro `data-table.tsx` core, M3.3) fa ri-renderizzare solo la riga in modifica.

La sessione di gate finale slitta da M3bis.9 a **M3bis.11**. Fase ora **12 sessioni** (era 10 in apertura, 11 dopo la sola M3bis.9). Aggiornato `PIANO.md` §FASE 3bis (righe M3bis.9-11) e `CHECKLIST.md` (righe e conteggio in testa).

**Chiesto anche se rinominare questo worktree** (`esecuzione-m3bis-0-9de1d4` → `implementazione-niko-table`) per riusarlo esplicitamente su tutta la fase. Verificato: l'harness non offre un comando di rename, solo `EnterWorktree` (ne crea uno nuovo) ed `ExitWorktree` (lo lascia) — un rename a mano (`git worktree move` + branch) rischiava di disallineare il tracciamento della sessione per il cleanup finale. **Deciso da Francesco: non rinominare.** Il nome resta `esecuzione-m3bis-0-9de1d4`/branch `claude/esecuzione-m3bis-0-9de1d4`, ma **è questo il worktree su cui vanno fatte tutte le sessioni M3bis.1..11**: chi apre la prossima sessione della fase continua qui, non ne crea uno nuovo.

### Verifiche

Nessun file di registro toccato. `npm run check` non rilanciato: nessuna modifica al registry in questa sessione. Prossimo passo: M3bis.1 (righe annidate con subtotale, Tree), in questo stesso worktree.

---

## M3bis.1 — Righe annidate con subtotale, "Tree" (2026-09-16)

Prima sessione di scrittura della FASE 3bis, nel worktree indicato da M3bis.0 (qui la sessione risulta avviata su un worktree diverso, `fase-m3bis-1-90120f`: nessun problema, il lavoro segue comunque il branch corretto).

**Esteso `registry/tassullo/blocks/data-table.tsx`**, non creato un blocco nuovo: righe annidate, subtotale, selezione a cascata sono capacità in più del blocco esistente, non un pattern a sé — la stessa ragione per cui M3bis.2/.5 lo estenderanno ancora.

**`rowExpandingFeature` e `createExpandedRowModel()` sono ora registrate sempre** in `caratteristiche`, non condizionate a un prop: a differenza delle funzioni di ordinamento (che una colonna deve nominare), restano inerti da sole finché nessuna riga ha `subRows` — `getCanExpand()` resta falso su ogni riga di una tabella piatta. Verificato leggendo la sorgente di TanStack v9 (`node_modules/@tanstack/table-core`, non solo i `.d.ts`): la catena dei modelli di riga è `core → filtering → grouping → sorting → expanding → pagination`, e `paginateExpandedRows` (default `true`) è ciò che fa sì che `getRowModel()` restituisca già le righe in ordine di visualizzazione, figli compresi quando espansi — nessuna ricorsione manuale nel rendering.

**`getSottoRighe`** (nuovo prop, traduzione di `getSubRows` — l'unica opzione di questa natura che il blocco espone, a differenza delle colonne dove i nomi restano quelli di TanStack) abilita il modo albero. Passato `undefined`, il comportamento di ogni pagina esistente è bit-per-bit invariato: nessuna riga acquisisce `subRows`, `rowExpandingFeature` non ha niente su cui lavorare.

**`CellaAlbero`** disegna rientro e `chevron` **dentro il `cell` della colonna che identifica la riga**, non in una colonna a sé — la stessa scelta di un esploratore di file, e la pagina decide quale colonna sia. Il rientro è una tabella di classi Tailwind (`pl-0`, `pl-5`, …, satura all'ultimo livello previsto), non uno `style` con un calcolo: niente valore arbitrario (regola 3). Il bottone è `size="icon"` (32px normale, 48 touch), non `icon-sm`: stessa ragione già scritta per `PaginazioneTabella` — sotto i 44px di WCAG in touch.

**Selezione a cascata**: `colonnaSelezione` ora legge anche `row.getIsAllSubRowsSelected()`/`row.getIsSomeSelected()` per lo stato della casella di una riga con figli — TanStack cascata già da sé la selezione dei figli quando si tocca il genitore (`mutateRowIsSelected`), quello che mancava era solo far *apparire* selezionato un genitore i cui figli sono stati scelti uno per uno.

**Subtotale**: `MetaColonna` prende un parametro generico e una terza chiave, `sottototale?: (righeFiglie, riga) => ReactNode`, chiamata al posto della cella normale sulle sole righe con `subRows.length > 0`. **Decisione a verbale** (`docs/DECISIONI.md` §41): una funzione, non `rowAggregationFeature`/`columnGroupingFeature` di TanStack — la struttura è dato vero e non raggruppamento (punto fermo della fase), e un subtotale di computo porta l'unità di misura col numero, formattazione che è dominio della pagina.

### La story `Albero`

Dataset finto ma realistico: 5 "voci" di un computo metrico (scavo, massetto, intonaco, rimozione pavimento, tinteggiatura), ciascuna con 2-4 "misurazioni" (ambiente + quantità + importo), generato con lo stesso LCG a seme fisso delle altre story. Colonne: `Voce / misurazione` (con `CellaAlbero`), `U.M.`, `Quantità` e `Importo` (entrambe con `sottototale` che somma le misurazioni e formatta con `Intl.NumberFormat('it-IT', …)`). La story non condivide il tipo `Story` delle altre (legato a `DataTable<Prodotto>`): dichiarata come `StoryObj<typeof DataTable<RigaComputo>>` a sé, perché il file ha un solo `meta` fissato su `Prodotto`.

### Un abbaglio dello strumento di verifica, non del codice

Verificando `Enter`/`Spazio` sul `chevron` nel pannello del browser di questa sessione, nessuna reazione — né con quello strumento né in un primo giro con Playwright headless. Prima di scrivere "bug" si è misurato meglio: con **Playwright** e un selettore scoperto per `aria-label`, il click del mouse funzionava (`8 → 11` righe, i tre figli comparivano); isolando poi la query su `tbody tr` **senza** scoprire prima che la pagina porta *due* `<table>` — quella vera e la tabella dei Controls di Storybook, nascosta ma presente nel DOM — il primo `tr` trovato non era mai una riga della tabella vera, ma una riga della tabella dei controlli (`<button>Set string</button>`), sempre non visibile e quindi sempre "senza reazione". Scoperto scopando la query su `[data-slot="table"] tbody tr`: **Enter e Spazio funzionano**, sia per espandi/collassa sia per la selezione a cascata (footer «1 di 5 voci selezionate» dopo `Spazio` sulla prima voce). Nessun codice cambiato per questo — il difetto era nel selettore del test, non nel componente. Vale la stessa lezione già a verbale su questo strumento (`CLAUDE.md`, «Il pannello del browser dell'app non è un banco di misura»): qui il problema non era `requestAnimationFrame` ma un DOM con più di una tabella, e la morale è la stessa — misurare nel posto giusto prima di concludere.

### Verifiche

`npm run check` verde su tutti e cinque i gate: **a11y 1152 scansioni (4 passate, +1 story) / 0 violazioni**. `tsc -b` ✔ · `lint`: gli stessi tre avvisi preesistenti, zero nuovi. `check:registry`: 0 errori, `data-table.tsx` resta sotto la sola regola 3 (blocco, nessun originale shadcn). Provato in Chromium reale (Playwright contro `build-storybook`, non committato): espandi/collassa da tastiera, selezione a cascata da tastiera, subtotali corretti a riga collassata ed espansa; nel pannello del browser di questa sessione, mouse (espandi, seleziona-tutto, seleziona voce), chiaro e scuro. Prossimo passo: M3bis.2 (espansione righe, pannello di dettaglio), stesso worktree.

### Coda: due rilievi di Francesco sulla story `Albero`, presi guardando lo storybook

Due difetti visivi, entrambi nello spaziatore di `CellaAlbero`, non nel meccanismo di espansione/selezione (che restava corretto):

1. **Le righe senza figli erano più alte di quelle con figli**, non uguali come sembrava a un primo sguardo — misurato: 49px contro 35,57px. Causa: il bottone del `chevron` ha `-my-2 -ml-2` per pareggiare la propria altezza (32px) col `p-2` della cella, ma lo spaziatore che lo sostituisce sulle righe senza figli era `size-8` — stessa larghezza **e stessa altezza** del bottone, senza però il margine negativo che la compensa. Risultato: lo spaziatore restava l'elemento più alto della cella e **alzava la riga**, mentre il bottone (compensato) no. Corretto: lo spaziatore diventa `w-8` — solo la larghezza, mai l'altezza — e la riga torna a essere alta quanto il testo, come le righe col bottone.
2. **Il bottone del chevron si confondeva nel fondo della riga aperta.** `TableRow` tinge di `bg-muted/50` ogni riga con un discendente `aria-expanded="true"` (già in `ui/table.tsx`, non toccato), e il bottone stesso prende `bg-muted` pieno quando è lui espanso: due tinte troppo vicine, il bottone spariva nel fondo. Corretto aggiungendo `aria-expanded:border-border` alla classe del bottone — un bordo non dipende dal colore di fondo, resta il segno che lì c'è un controllo.

Provato in Chromium (pannello di questa sessione): le quattro righe della voce "03.05" espansa sono ora alte quanto le righe voce collassate, e il bottone del chevron resta un riquadro visibile sul fondo tinto. `npm run check`: invariato, 0 violazioni.

**Terza correzione, sullo stesso bottone**: Francesco preferisce il bottone **senza sfondo** — solo il bordo, niente riquadro pieno. Aggiunta `aria-expanded:bg-transparent` alla classe (vince sull'`aria-expanded:bg-muted` che `Button` darebbe da sé), mantenuto `aria-expanded:border-border`. Verificato via `getComputedStyle`: `background-color: rgba(0,0,0,0)`, bordo ancora presente. `npm run check`: invariato, 0 violazioni.

**Quarta correzione, ancora sullo stesso bottone**: Francesco chiede di togliere anche il bordo — il bottone aperto deve essere **identico** a se stesso chiuso, senza nessun segno di stato proprio. Tolta `aria-expanded:border-border`, resta solo `aria-expanded:bg-transparent`. Il ragionamento a verbale: `aria-expanded:bg-muted` di `variant="ghost"` (`ui/button.tsx`) è corretto per un bottone che **è** il solo segno che un menu è aperto — qui il segno di stato è già la freccia ruotata, e un secondo segno sul bottone è ridondante. Non si tocca la primitiva `ui/button.tsx`: resta giusta per chi la usa davvero come grilletto. Verificato via `getComputedStyle`: bottone chiuso e aperto hanno **la stessa** `background-color` e `border-color` (entrambe `rgba(0,0,0,0)`). `npm run check`: invariato, 0 violazioni.

**Quinta correzione: il passaggio del mouse si era spento insieme allo stato.** Rilievo di Francesco: il bottone aperto non si tinge più passandoci sopra, mentre quello chiuso sì. Causa, trovata misurando le regole CSS vere e non leggendo il JSX: `.aria-expanded\:bg-transparent[aria-expanded="true"]` e `.hover\:bg-muted:hover` hanno **la stessa specificità** (una classe più un selettore ciascuna) — a parità vince quella scritta *dopo* nel foglio compilato, e non è detto sia la nostra, perché **l'ordine con cui Tailwind compila le varianti non è quello con cui le si scrive nel JSX**. Corretto aggiungendo `aria-expanded:hover:bg-muted` (più `dark:aria-expanded:hover:bg-muted/50` per la stessa attenuazione che `ghost` usa in scuro): un terzo selettore (`[aria-expanded="true"]:hover`) è **più specifico** dei primi due per costruzione — tre componenti contro due — e vince sempre, indipendentemente dall'ordine nel foglio di stile.

Misurato in **Playwright reale**, non nel pannello del browser: prima lettura fuorviante, un `getComputedStyle` preso 50ms dopo l'hover cadeva **a metà della transizione CSS** (`transition-all` di `Button`) e restituiva un colore intermedio che sembrava un difetto — allungata l'attesa a 400ms il quadro è tornato pulito nei quattro incroci chiaro/scuro × chiuso/aperto: stessa tinta in hover, stessa trasparenza a riposo, in tutti e quattro. `npm run check`: invariato, 0 violazioni.

### Coda: etichette di ordinamento per tipo di colonna (miglioramento, richiesto da Francesco)

Domanda di Francesco sul confronto con niko-table: l'ordinamento delle colonne usa componenti diversi da niko — verificato che **il meccanismo** (bottone a tre tempi, crescente→decrescente→nessun ordine) resta la scelta voluta di M3.3, a verbale in `docs/DECISIONI.md`, non in discussione. La sola differenza reale erano le **etichette**: niko dà a ogni tipo di colonna la propria frase — «Asc»/«Desc» per il testo, «Low to High»/«High to Low» per i numeri, «Oldest First»/«Newest First» per le date, «False First»/«True First» per i booleani (`config/data-table.tsx`, tabella "Sort Labels", già annotata come inventario in M3bis.0) — mentre `IntestazioneColonna` diceva sempre e solo «crescente»/«decrescente».

**Aggiunta `ETICHETTE_ORDINE`** in `data-table.tsx`: una mappa da `sortFn` (la chiave che la colonna già dichiara a TanStack per ordinare) alle due frasi del proprio verso — `basic` → «dal più piccolo al più grande»/«dal più grande al più piccolo», `datetime` → «dal meno recente al più recente»/«dal più recente al meno recente». Nessuna prop nuova su `IntestazioneColonna`: la chiave è `colonna.columnDef.sortFn`, già dichiarata dalla colonna una volta sola — dichiararla una seconda volta all'intestazione sarebbe la duplicazione che il resto del blocco evita apposta (`meta.titolo`, non due etichette). `alphanumeric`/`text` restano `crescente`/`decrescente`, la stessa frase generica di niko per il testo. Nessuna colonna booleana oggi (nessuna `sortFn` in `caratteristiche` la copre): la coppia False/True first di niko resta annotata nel commento, non scritta come codice morto.

Provato nel pannello del browser sulla story `Prodotti`: «Ordina per Codice: crescente» (alphanumeric, invariato), «Ordina per Rev.: dal più piccolo al più grande» (basic), «Ordina per Aggiornato: dal meno recente al più recente» (datetime). `npm run check`: invariato, 0 violazioni.
