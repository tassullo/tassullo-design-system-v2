# PIANO — **Tassullo Design System 2.0** (shadcn/ui)

> Versione 1.0, 2026-09-07. Adotta l'impianto di conduzione di Anagrafe, in forma compatta: **questo è il documento unico** — analisi (§0, §0bis), fasi con gate e criteri di completamento, e punti aperti. In Anagrafe analisi e fasi stanno in due file (`docs/PIANO.md` e `ROADMAP.md`), separazione che lì serve perché l'analisi è enorme; qui sta in tre schermate e due file sarebbero solo due file da tenere allineati.
> **Lo stato operativo vive in `CHECKLIST.md`** (fonte di verità dell'avanzamento); il diario è `WORKLOG.md`. Un task = una sessione Claude Code, salvo diversa indicazione.

---

## §0. Contesto e obiettivo

Il design system attuale (`@tassullo/theme` v1.4.0, repo `tassullo-design-system`) è CSS puro: `theme.css` (token come variabili CSS) + `components.css` (ricette `.btn`, `.card`, `.sidebar`…), installato dalle app con `npm install github:tassullo/tassullo-design-system`. Funziona e ha risolto il problema che era nato per risolvere — la divergenza della palette tra le app — ma ha due limiti strutturali:

1. **Distribuisce classi, non componenti.** Ogni app riscrive da zero la logica di un dialog, di una tabella ordinabile, di un select accessibile. Anagrafe ha 1.453 righe di CSS scritte a mano in 10 file di pagina e nessun componente riusabile oltre le classi.
2. **Nessuna accessibilità né comportamento.** Focus trap, `aria-*`, navigazione da tastiera, portali: assenti, e ogni app li reinventa (male). `docs/INTERFACCE.md` §1 di Anagrafe pone minimi di accessibilità verificabili che oggi nessun componente condiviso garantisce.

shadcn/ui non è una libreria da installare: è un **sistema di distribuzione di codice sorgente**. La CLI copia i file dei componenti dentro il repo dell'app, dove restano leggibili e modificabili. Sopra ci si costruisce la propria libreria aziendale. Il punto che combacia col vincolo storico dello studio: shadcn supporta **"repo GitHub = registry"** — nessun server, nessun build, nessun publish npm, nessun token nei CI. Lo stesso modello che già usate, con in più il pin di versione via tag git.

**Obiettivo.** Una libreria di componenti React accessibili in stile Tassullo, installabile con `npx shadcn@latest add tassullo/tassullo-design-system-v2/<item>`, che sostituisca sia i token sia le ricette CSS del v1. Del v1 sopravvive solo l'**identità visiva** — palette, font, raggi, densità — tradotta nella convenzione shadcn.

**Decisioni già prese (2026-09-07, Francesco):**
- Nuovo progetto, **solo in locale per ora**: nessun repo GitHub finché non è maturo. Il repo `tassullo-design-system` attuale **non si tocca** — resta in produzione per Anagrafe, Studio e Officina finché non migrano.
- Distribuzione target: **GitHub-as-registry**.
- Scope della v2.0: tema + primitive + blocchi applicativi + pagine modello + densità touch + dark mode.
- **Nessuna app viene migrata adesso.** Il v2 nasce per le app **nuove**; per quelle esistenti si scrive una **guida** (FASE 5), non si apre un cantiere. Anagrafe serve come *fonte di analisi* — il suo codice e la sua roadmap dicono quali componenti servono davvero — e come banco di prova a secco della guida, senza che una riga del suo codice venga toccata.

**Percorso:** `/Users/fras/Documents/Claude Code/tassullo-design-system-v2/` — cartella sorella di quella attuale, **già creata** il 2026-09-07; questo documento vi risiede come `PIANO.md`.

---

## §0bis. Cosa sapere su shadcn prima di leggere il resto

- **`components.json`** — configurazione per app: stile, alias dei path (`@/components/ui`), CSS globale, e il campo `registries` che dichiara i registry esterni.
- **Registry** — un `registry.json` che elenca *item*. Ogni item ha `files` (con `target`), `dependencies` (npm), `registryDependencies` (altri item), `cssVars` e `css`. Tipi che useremo: `registry:theme`, `registry:ui`, `registry:block`, `registry:lib`.
- **Blocchi e pagine** — su `ui.shadcn.com/blocks` shadcn distribuisce anche pagine intere: `npx shadcn add dashboard-01` cala nel progetto un `page.tsx` completo di sidebar, grafici e tabella, da svuotare e riempire. È il modello della FASE 4: sopra le primitive stanno i blocchi, e sopra i blocchi le pagine pronte da cui una nuova app parte.
- **CLI** — **non si installa globalmente**: si usa per progetto con `npx shadcn@latest <comando>`, così si ha sempre l'ultima versione senza gestirla. Non c'è quindi nessun "installare shadcn sul Mac": l'unico prerequisito d'ambiente è Node aggiornato. Comandi che useremo: `init`, `add` (anche `--dry-run`), `build`, `registry validate`, `list`, `view`, `search`, `docs` (recupera la documentazione di un componente), `info`, e `migrate` (migrazioni automatiche: `cn`, `icons`, `base-color`, `rtl`, `radix` — quest'ultima utile se un giorno si volesse rivedere D9).
- **MCP server** — shadcn ne fornisce uno: `npx shadcn@latest mcp init --client claude` scrive un `.mcp.json` nel progetto, poi si riavvia Claude Code. Espone **tre** capacità — elencare, cercare, installare in linguaggio naturale — e **legge i registry dichiarati in `components.json`**, quindi vede il registry Tassullo, anche con la sintassi a namespace (`@tassullo/…`). Da sapere prima di farci conto: è **solo lato consumo**. Non aiuta a *costruire* né a pubblicare un registry, non genera temi e non scrive componenti: quel lavoro resta nostro, e l'MCP serve a installare e a interrogare ciò che esiste. In una app nuova, Claude Code può trovare i componenti dello studio per nome invece di doverli ricordare, che è il modo esatto in cui le app finiscono per riscrivere ciò che esiste già. Per questo va installato **sia** nel repo del design system (M0.4), **sia** in ogni app nuova come requisito di setup (M5.3), **sia** nelle app già esistenti — Anagrafe, Studio, Officina — dove si può collegare **anche prima e a prescindere da qualsiasi migrazione** (M5.5, passo 0): basta un `components.json` che dichiari il registry Tassullo, e chi sviluppa quell'app può da subito cercare e leggere i componenti del v2. Installarli richiederà Tailwind, consultarli no.
- **Theming Tailwind v4** — token semantici a coppie `X` / `X-foreground` in `oklch`, esposti a Tailwind con `@theme inline`, ridefiniti sotto `.dark`.
- **Libreria di primitive: Base UI** (deciso il 2026-09-07, D9). shadcn offre lo stesso componente in **tre** implementazioni parallele — Base UI, React Aria, Radix UI — tutte correnti, nessuna deprecata, e **`components.json` non ha un campo che le seleziona**: la scelta si fa componente per componente, quindi la coerenza è a carico nostro. Mischiarle significherebbe tre modelli di focus, tre stili di composizione e tre insiemi di bug dentro la stessa libreria: esattamente la divergenza che il v2 nasce per chiudere. Si sceglie **Base UI** perché è la direzione di shadcn stesso (il `drawer` è già passato da Vaul a Base UI) e perché viene dagli autori di Radix, il cui team vi è confluito — Radix è quindi la strada che si accorcia. React Aria resta oggettivamente superiore su accessibilità e internazionalizzazione, ma si paga in verbosità su **ogni** componente e in un ecosistema shadcn più piccolo. **Regola operativa:** ogni `shadcn add` usa la variante Base UI; un'eccezione va motivata a verbale nel WORKLOG (l'unica candidata prevista è il calendario, se in M2.7 quello Base UI si rivelasse debole sul locale italiano e sugli intervalli).
- **Responsive vs densità** — sono due cose diverse e shadcn ne copre una sola. Il **layout** responsive è nativo e si eredita (`sidebar` → `Sheet`, `Dialog` → `Drawer`, hook `useIsMobile`). I **bersagli** no: il `Button` di default resta `h-9` (36px) su qualunque schermo, contro i 44–48px chiesti dalle linee guida touch. La densità resta quindi una scelta nostra (M1.4).

---

### FASE 0 — Scaffold e fondamenta — 5 sessioni

Obiettivo: cartella di progetto funzionante in locale, con i documenti di conduzione, lo stack compilante e la style guide 2.0.
Gate: `npm run storybook` mostra una primitiva shadcn di prova con Tailwind v4 attivo e i tre interruttori (tema, densità, viewport); i documenti di conduzione (`PIANO.md`, `CHECKLIST.md`, `WORKLOG.md`, `CLAUDE.md`) esistono; git locale inizializzato.

**M0.1 — Documenti di conduzione e struttura (1 sessione)**
- Prompt: "In `/Users/fras/Documents/Claude Code/tassullo-design-system-v2/` (cartella già creata, con dentro `PIANO.md` = questo documento) affianca il resto dell'impianto di conduzione. Niente `docs/PIANO.md` e niente `docs/archive/`: il piano è unico e il worklog di 42 sessioni resta consultabile per intero. **Non scaffoldare codice**: questo task crea solo documenti.
  1. `CHECKLIST.md` — fonte di verità dell'avanzamento, sul modello di `/Users/fras/Documents/Claude Code/Anagrafe/CHECKLIST.md`: una tabella per fase con colonne Attività / Stato / Dipendenze / Criterio di accettazione sintetico. Stati `TODO | IN_PROGRESS | BLOCKED | REVIEW | DONE`. Tutti e 42 i task in TODO.
  2. `WORKLOG.md` — diario in coda, sul modello di quello di Anagrafe. Prima voce: la pianificazione del 2026-09-07, con le decisioni chiuse (D1 nome, D9 Base UI, Storybook come style guide), le assunzioni A1–A4 e i punti aperti D2–D8.
  3. `CLAUDE.md` — **il contenuto è dettagliato qui sotto**."
- File: `CHECKLIST.md`, `WORKLOG.md`, `CLAUDE.md`
- Accettazione: i tre file esistono e sono coerenti con `PIANO.md`; `CHECKLIST.md` elenca tutti i 42 task in TODO con dipendenze e criterio sintetico; il `CLAUDE.md` contiene tutte le regole elencate sotto.

**Contenuto del `CLAUDE.md` del repo v2.** Va scritto **qui, in M0.1**, e non più avanti: dalla sessione M0.2 in poi ogni sessione lo carica in contesto, quindi se arriva in fondo alla fase le prime quattro lavorano senza regole. È l'erede del `CLAUDE.md` del v1, riscritto per un design system che distribuisce componenti invece che classi.

- **§Cos'è il repo** — fonte unica dello stile visivo delle app Tassullo, in forma di registry shadcn. Rapporto col v1 (`tassullo-design-system`, `@tassullo/theme`): resta in produzione, non si tocca, e le app ci restano sopra finché non decidono di passare.
- **§Regola permanente** — nessuna app tiene una copia dei token o dei componenti. Se a un'app serve un token nuovo o un pattern non coperto, si propone e si aggiunge **qui**, mai localmente "per ora" nell'app.
- **§Regole di scrittura del codice**
  - Gli import interni al registry usano **sempre** `@/registry/...`, mai `src/components`.
  - Ogni `shadcn add` usa la variante **Base UI** (D9). Eccezioni motivate a verbale nel WORKLOG.
  - Le utility Tailwind si usano **solo sui token del tema**: niente valori arbitrari (`h-[37px]`, `bg-[#F4AC3D]`), niente hex.
  - I componenti si modificano **nel registry**, mai nell'app consumer.
- **§Le due trappole che costano riscritture**
  - `--primary` è l'arancio del brand; `--accent` in shadcn è **il grigio di hover dei menu**. Nel v1 `--color-accent` era il brand: confonderli tinge di arancione metà degli hover.
  - Il nome dice la **funzione**, non l'aspetto: `badge` è un'etichetta che si legge, `toggle-group` è un filtro che si clicca. Nel v1 confonderli è costato riscritture ripetute.
- **§Prima di scrivere un componente, chiedilo all'MCP** — se esiste nel registry si installa, non si riscrive. È il meccanismo con cui le app smettono di divergere.
- **§Conduzione** — lettura di inizio sessione limitata a `PIANO.md` + `CHECKLIST.md` + voci recenti del `WORKLOG.md`; a fine task si aggiorna la CHECKLIST e si aggiunge la voce al WORKLOG.
- **§Confini** — non si toccano il repo v1 né le app Anagrafe, Studio e Officina: Anagrafe si **legge** come fonte di analisi. Nessun `git remote` finché D4 è aperta.
- **§Comandi** — `npm run storybook`, `npm run build-storybook`, `npm run check:contrast`, `npx shadcn@latest <comando>` (la CLI non si installa).

**M0.2 — Scaffold Vite + Tailwind v4 + shadcn init (1 sessione)**
- Prompt: "Scaffold `npm create vite@latest . -- --template react-ts` (React 19 + TS, lo stesso stack di Anagrafe/Studio/Officina, così il workbench mostra esattamente ciò che gireà nelle app). Installa `tailwindcss` e `@tailwindcss/vite`, plugin nel `vite.config.ts`, `@import \"tailwindcss\"` in `src/index.css`. Alias `@` → `./src` e `@/registry` → `./registry` in `vite.config.ts` e `tsconfig.json`. Poi `npx shadcn@latest init` per generare `components.json`. Elimina i CSS demo del template Vite, che inquinano lo stile (stessa insidia della regola 4 di INTEGRAZIONE.md v1). Infine **verifica il meccanismo esatto con cui la CLI seleziona la variante Base UI** (namespace del registry, o comando dedicato: `components.json` non ha un campo per questo) e scrivilo in `docs/DECISIONI.md`, perché va poi ripetuto identico su ogni componente."
- File: `package.json`, `vite.config.ts`, `tsconfig.json`, `components.json`, `src/index.css`
- Accettazione: `npm run dev` serve una pagina con una utility Tailwind visibilmente attiva; `npx shadcn@latest add button` compila **nella variante Base UI**, verificato guardando le dipendenze importate.

**M0.3 — Storybook: la style guide 2.0 (1 sessione)**

shadcn **non fornisce nessuna pagina demo**: `ui.shadcn.com` è un'app Next scritta a mano, la CLI copia file e basta. La style guide ce la costruiamo noi, e la scelta è Storybook (gratuito, licenza MIT, nessun tier a pagamento; Chromatic è un servizio separato e non serve). Motivo decisivo: `addon-a11y` esegue **axe-core su ogni story automaticamente** e con `parameters.a11y.test = 'error'` fa **fallire la CI**. Il minimo di accessibilità di INTERFACCE.md §1 diventa così eseguibile, come `stylelint-config.cjs` aveva reso eseguibile la regola "solo variabili" nel v1. In più i controlli generati dai tipi TS permettono di provare le varianti senza scrivere codice.

- Prompt: "Installa Storybook per React su Vite (`@storybook/react-vite`: riusa `vite.config.ts`, alias e Tailwind già configurati, non aggiunge un secondo builder). Addon: `a11y` (axe-core), `themes` (interruttore light↔dark), `viewport` (1440px↔375px). In `.storybook/preview.ts` importa il tema del registry e aggiungi il **toggle di densità** (`data-density`) come globalType, così ogni story si guarda in 4 combinazioni. Sezioni: Tema / Primitive / Blocchi. Gli import puntano sempre a `@/registry/...`, mai a `src/components`."
- File: `.storybook/main.ts`, `.storybook/preview.ts`, `package.json`
- Accettazione: `npm run storybook` apre l'indice con una story di prova; i tre interruttori (tema, densità, viewport) funzionano; `npm run build-storybook` produce `storybook-static/` servibile.
- Nota, da dire chiaramente: `storybook-static/` è un sito statico ma **va servito via HTTP** — il doppio clic del v1 su `styleguide.html` non torna. Vale identico per le alternative (workbench Vite, sito Next): è il prezzo del fatto che la style guide monti i componenti React **veri** invece di imitazioni HTML, cioè esattamente il difetto che aveva fatto divergere le app fino alla v1.1.0. Finché il repo è locale si guarda con `npm run storybook`; a D4 chiusa diventa un URL su GitHub Pages, che chi valuta il design apre senza installare nulla.

**M0.4 — MCP shadcn e prerequisiti d'ambiente (1 sessione)**
- Prompt: "Prima verifica i prerequisiti d'ambiente e annotali in `docs/DECISIONI.md` con le versioni effettive: Node (versione richiesta da Vite 8 e da Tailwind v4), npm, e il fatto che **la CLI shadcn non si installa** — si usa con `npx shadcn@latest`, per progetto. Poi installa il server MCP: `npx shadcn@latest mcp init --client claude`, che scrive `.mcp.json`; riavvia Claude Code e verifica che i comandi rispondano. Configura in `components.json` il registry locale Tassullo, così l'MCP lo vede già durante lo sviluppo del design system stesso — è il primo collaudo del fatto che le app lo troveranno."
- File: `.mcp.json`, `components.json`, `docs/DECISIONI.md`
- Accettazione: dall'MCP si elencano i componenti shadcn **e** gli item del registry Tassullo locale; una richiesta in linguaggio naturale ("aggiungi il componente badge") installa il file giusto.
- **A cosa serve davvero qui**, dato che l'MCP è solo lato consumo e non costruisce registry: (a) installare le primitive dentro `registry/tassullo/ui/` parlando, invece di ricordare i nomi esatti di 63 componenti e la sintassi della variante Base UI — le FASI 2–4 sono fatte quasi solo di questo; (b) **collaudare il registry dall'interno**: se l'MCP non trova gli item Tassullo stando nel repo dove sono stati scritti, non li troverà nemmeno da un'app, e il problema emerge alla prima sessione invece che in FASE 5. Non aspettarsi che generi il tema o i componenti: quello resta lavoro nostro.

**M0.5 — Git locale (1 sessione)**
- Prompt: "`git init` (branch `main`), `.gitignore` (`node_modules`, `dist`, `storybook-static`, `.env*`), primo commit di tutto lo scaffold e dei documenti di conduzione. **Nessun `git remote`**: il repo resta locale finché D4 non è chiusa — è una decisione, non una dimenticanza, e va annotata nel messaggio di commit. Poi rileggi il `CLAUDE.md` scritto in M0.1 e verifica che rispecchi ciò che le quattro sessioni precedenti hanno effettivamente prodotto (in particolare il meccanismo di selezione di Base UI accertato in M0.2 e il funzionamento dell'MCP di M0.4): se qualcosa è cambiato, correggilo qui."
- File: `.gitignore`, git repo, `CLAUDE.md` (revisione)
- Accettazione: `git log` mostra il commit iniziale; `git remote -v` è vuoto; il `CLAUDE.md` descrive il repo com'è davvero, non com'era stato immaginato.

---

### FASE 1 — Tema Tassullo — 5 sessioni

Obiettivo: l'identità visiva del v1 tradotta nella convenzione shadcn, in light, dark e due densità, distribuibile come `registry:theme`.
Gate: la pagina Palette del workbench mostra tutte le coppie token nelle 4 combinazioni (light/dark × normale/touch); lo script di contrasto passa su tutte le coppie `X`/`X-foreground`.
Dipendenze: FASE 0.

**M1.1 — Mappa dei token e script di conversione (1 sessione)**
- Prompt: "Scrivi in `PIANO.md`, come nuovo §2bis, la mappa completa `theme.css` v1 → token shadcn (tabella sotto), e `scripts/hex-to-oklch.ts` (devDependency `culori`) che converte gli hex del v1 in `oklch` **e** calcola il rapporto di contrasto di ogni coppia `X`/`X-foreground`, **uscendo con codice 1 sotto 4.5:1**. La conversione va fatta dallo script, non a mano: quando la palette cambia deve essere riproducibile. Lo script è l'erede di `stylelint-config.cjs` del v1 — stessa filosofia: senza un controllo automatico la regola si perde in poche settimane."
- File: `PIANO.md` §2bis, `scripts/hex-to-oklch.ts`, `package.json` (script `check:contrast`)
- Accettazione: `npm run check:contrast` gira e fallisce se si forza `--primary-foreground` a bianco (verifica del gate stesso).

**Mappa principale (light)**

| shadcn | valore v1 | note |
|---|---|---|
| `--background` | `#F6F6F4` | ex `--color-page-bg` |
| `--foreground` | `#141414` | ex `--color-text` |
| `--card` / `--popover` | `#FDFDFD` | ex `--color-surface` |
| `--primary` | `#F4AC3D` | ex `--color-accent` |
| `--primary-foreground` | `#141414` | **nero, non bianco** — il bianco su `#F4AC3D` non regge il contrasto: è la violazione più frequente dalla v1.1.0 |
| `--secondary` / `--muted` | `#ECEAE8` | ex `--color-surface-2` |
| `--muted-foreground` | `#6E6B67` | ex `--color-text-muted` |
| `--accent` | `#F4F3F1` | ex `--color-surface-3` — hover dei menu, **non** il brand |
| `--destructive` | `#DC2626` | ex `--color-danger` |
| `--border` / `--input` | `#DDDBDB` | ex `--color-border` |
| `--ring` | `#F4AC3D` | ex `--focus-ring` |
| `--radius` | `0.375rem` (6px) | base; shadcn deriva sm/md/lg/xl |
| `--sidebar*` (8 token) | blocco sidebar v1 | shadcn li ha già: mappatura 1:1 |

**Trappola da scrivere in `PIANO.md` §2bis e in `CLAUDE.md`:** nel v1 `--color-accent` **è l'arancio del brand**; in shadcn `--accent` **è il grigio di hover dei menu**, e il brand sta in `--primary`. Confonderli produce interfacce in cui metà degli hover diventa arancione. È l'equivalente v2 della confusione `badge`/`chip` che nel v1 è costata 23 riscritture.

**Token che shadcn non ha** → custom, esposti con `@theme inline` per ottenere `bg-success`, `text-warning-foreground`…: `success`, `warning`, `info` (+ `-foreground`, `-border`) dagli stati semantici v1, e `--accent-ink` (`#B45309`, l'arancio leggibile **come testo** su fondo chiaro — `--primary` non è mai usabile per il testo).

**M1.2 — `tassullo-theme.css`, modalità chiara (1 sessione)**
- Prompt: "Scrivi `registry/tassullo/theme/tassullo-theme.css`: blocco `:root` con tutti i token della mappa in `oklch` (output dello script M1.1), blocco `@theme inline` che li espone a Tailwind, token custom success/warning/info/accent-ink. Font: lo stack dichiara `'Replicall'` con degrado a font di sistema, **ma il `.woff` non si distribuisce** — licenza Webflow del sito, vincolo invariato dal v1 (D3)."
- File: `registry/tassullo/theme/tassullo-theme.css`
- Accettazione: `npm run check:contrast` verde; una utility `bg-primary text-primary-foreground` nel workbench rende arancione con testo nero.

**M1.3 — Modalità scura (1 sessione)**
- Prompt: "Il v1 **non ha una palette scura**: va progettata. Punto di partenza naturale, già collaudato sul campo, è la sidebar scura del v1. Proposta da validare a occhio nel workbench: `--background #141414`, `--card #1C1C1C`, `--muted #262626`, `--foreground #EDEDEB`, `--muted-foreground #A8A8A8`, `--border #2E2E2E`; `--primary` resta l'arancio con foreground nero. Scrivi il blocco `.dark`, poi la pagina Palette del workbench affiancata light/dark per l'approvazione visiva di Francesco (chiude D2)."
- File: `registry/tassullo/theme/tassullo-theme.css`, `stories/Palette.stories.tsx`
- Accettazione: contrasto verde anche in dark; screenshot delle due palette affiancate; D2 chiusa in WORKLOG.

**Chiuso il 2026-09-07. D2 chiusa.** La proposta del prompt è stata adottata quasi per intero — `--background #141414`, `--card #1C1C1C`, `--muted #262626`, `--foreground #EDEDEB`, `--muted-foreground #A8A8A8`, `--border #2E2E2E`, brand invariato — con **tre scostamenti**, tutti misurati e motivati in §2bis *La modalità scura*: `--sidebar` sale a `#1C1C1C` invece di restare `#141414` (sul fondo scuro non si staccherebbe più dalla pagina), `--info` è l'unico pieno ricalcolato (`#1A5276` dava **2.20:1** sul fondo scuro, cioè un badge invisibile), e `--warning` resta il crema del v1 nonostante sia la cosa più luminosa della pagina, perché la correzione ovvia lo fa collidere col brand. Il gate è verde su **48 coppie** (24 per modalità) e verifica anche la parità dei token fra le due palette. La prova visiva è la story `Tema/Palette`, che le mostra affiancate; lo screenshot è `docs/img/M1.3-palette-chiaro-scuro.png`.

**M1.4 — Densità touch (1 sessione)**

Premessa, verificata sulla documentazione (2026-09-07): shadcn è responsive nel **layout** — `sidebar` passa a `Sheet` sotto la soglia mobile (`useIsMobile`, `SIDEBAR_WIDTH_MOBILE`), e `drawer` documenta il pattern *Dialog su desktop, Drawer su mobile*. Sui **bersagli** non dice nulla: la pagina del `Button` elenca le taglie (`xs`, `sm`, default, `lg`, `icon-*`) senza mai citare touch target o altezze minime, e il default resta `h-9` (36px) identico su iPhone e su desktop, contro i 44–48px chiesti da Apple e Material. Il responsive di shadcn si eredita gratis, ma **non** copre il caso che ha fatto nascere `data-density` nel v1: Officina in cantiere, dove il problema non è lo spazio sullo schermo ma il dito guantato.

- Prompt: "In Tailwind v4 le utility numeriche di dimensione sono derivate da una variabile: `h-9` è `calc(var(--spacing) * 9)`, con `--spacing: 0.25rem` di default; vale per `h-*`, `p-*`, `gap-*`, `size-*`. Quindi la densità si ottiene con **una riga**, senza patchare nessuna primitiva: `[data-density=\"touch\"] { --spacing: 0.3125rem; }` porta `h-9` a 45px e scala insieme padding, gap e icone. Aggiungi lo scatto di tipografia, che **non** deriva da `--spacing` e va ritoccato a parte. Officina continua a scrivere una riga sola nell'`index.html`: l'interfaccia verso le app resta identica al v1."
- File: `registry/tassullo/theme/tassullo-theme.css`, `.storybook/preview.ts`
- Accettazione: l'interruttore densità del workbench cambia l'altezza dei controlli senza ricaricare; bottoni e campi ≥44px in touch; **verificato che lo scaling non deformi ciò che non deve** (larghezze massime, icone dentro i bottoni, sidebar) — ogni eccezione si fissa con un valore assoluto e si annota in WORKLOG.
- Nota: la scelta è l'attributo esplicito, non `@media (pointer: coarse)`. È l'app a sapere se si usa in campo; un tablet in ufficio non deve prendere la densità da guanti. Stessa scelta del v1, e reversibile.

**Chiuso il 2026-09-07.** Il meccanismo del prompt regge: la densità non tocca nessuna primitiva. Cambiano due cose. Il **valore** è `--spacing: 0.375rem` (6px, ×1.5) e non `0.3125rem`: il bottone di default di questo preset è `h-8` (32px) e non `h-9`, e a ×1.5 arriva a **48px** — la stessa altezza che il v1 dà a `.btn` in touch, collaudata in cantiere — con ogni gradino della scala su un intero (xs 36, sm 42, default 48, lg 54, icona 24). Il fattore 1,375 bastava per i 44px di Apple ma lasciava mezzi pixel sui gradini dispari. Le **leve sono due**: `--spacing` per i bersagli e `--text-*` per la tipografia, che sale di ×1.08 arrotondato al pixel (11→12 … 26→28) — il fattore che riproduce il passo del v1, che alzava il testo del bottone di un gradino. Perché la seconda leva funzioni la scala tipografica è stata spostata da `@theme inline` a un `@theme` semplice: con `inline` Tailwind cuoce il valore nell'utility (`font-size: 12px`) e l'override a runtime non farebbe nulla, senza errore. Il tutto sta nel **tema generato** e non più in `src/index.css`: la densità è un token, e un'app che installa `registry:theme` deve riceverla. Motivazioni e misure in `docs/DECISIONI.md` §6; prova affiancata nella story `Tema/Densità`, che legge le altezze dal DOM invece di dichiararle.

**Due eccezioni allo scaling, accertate e assegnate**: la **sidebar** non si allarga (`SIDEBAR_WIDTH` e compagne sono costanti JS in `style` inline) → M2.5; la taglia **`sm` del bottone** non segue lo scatto tipografico perché usa `text-[0.8rem]` → M2.1.

**M1.5 — Il tema come item di registry (1 sessione)**
- Prompt: "Dichiara il tema come item `registry:theme` in `registry.json` (bozza), con `cssVars` per `theme`/`light`/`dark` e il file CSS con `target` sul CSS globale dell'app. Pagina Palette del workbench completata: tutte le coppie con nome del token, valore oklch e click-to-copy (eredita l'idea dalla palette click-to-copy di `styleguide.html` v1). Il tema si distribuisce **solo** come `registry:theme`."
- Fuori strada da non imboccare, annotato in `docs/DECISIONI.md`: `shadcn/create` (`ui.shadcn.com/create`) e i **preset** con codice breve (`apply a2r6bw`) sono un configuratore visuale per chi deve *inventarsi* una palette partendo da zero. La palette Tassullo è già vincolata al sito istituzionale: qui si traducono token esistenti, non se ne generano di nuovi. Il canale `registry:theme` è quello giusto e basta.
- File: `registry.json`, `stories/Palette.stories.tsx`
- **Rettifica (M1.5, accertata sul campo — `docs/DECISIONI.md` §11).** Il prompt qui sopra è sbagliato in due punti, e nessuno dei due si vede provandolo a metà. (a) `cssVars.theme` finisce in **`@theme inline`**, che cuoce i valori: la scala tipografica ci morirebbe dentro e la densità smetterebbe di scattare. (b) Il `target` sul CSS globale dell'app **sostituisce quel file**, `@import "tailwindcss"` compreso. Il tema si distribuisce quindi **come file intero** con `target` su `src/tassullo-theme.css`, e l'`@import` lo aggiunge la CLI da sé attraverso il campo `css`. Resta vero — ed è il punto — che il canale è `registry:theme` e basta.
- Accettazione: `npx shadcn@latest registry validate ./registry.json` verde sull'item tema.

---

### FASE 2 — Primitive — 9 sessioni

Obiettivo: il set di primitive shadcn ri-stilate Tassullo, coerenti in light/dark e nelle due densità, ognuna con la sua story.
Gate: M2.9 verde su tutto il set (contrasto, tastiera, densità, dark), con axe-core in CI.
Dipendenze: FASE 1.

Le primitive si aggiungono con `npx shadcn@latest add <nome>` **dentro `registry/tassullo/ui/`**, poi si adattano: raggio 6px, focus ring arancio, varianti `destructive`/`success` sui token semantici.

**Come è stato scelto il set.** Analisi del codice di Anagrafe (unica app in locale; `components.css` v1 copre anche i bisogni di Studio e Officina) più della sua ROADMAP a 86 sessioni, che dice cosa servirà. Due risultati:

*Cosa oggi ogni pagina reimplementa a mano* — modale ×2 (`prd-modale`, `pdt-modale`), breadcrumb ×3, tab ×2, stato vuoto ×2, chip ×2, tabella ×4, accordion, `<select>` nudo ×3, checkbox ×3, progress, paginazione ×2. Conferma che il set base non è arbitrario: è già stato scritto tre volte.

*Cosa la roadmap chiede e non esiste ancora*, per occorrenze in `ROADMAP.md` di Anagrafe — `pdf` ×59, `tag` ×29, `editor` ×20, `caricamento` ×16, `diff` ×15, `allegati` ×10, `storico` ×9, `anteprima` ×9, `affiancato` ×3. Non sono contorni: il change set **è** una diff, la pubblicazione **è** un'anteprima PDF, i documenti **sono** upload. Da qui i gruppi M2.6–M2.7 e i blocchi M3.6–M3.9.

**Confronto con l'inventario completo.** shadcn documenta **63 componenti**. Sotto, il set scelto copre quelli che servono; l'elenco di ciò che si lascia fuori, e perché, è in coda alla fase — serve a non ridiscuterlo ogni volta.

**M2.1 — Fondamenta (1 sessione)** — `lib/utils.ts` (`cn()`), `button`, `button-group`, `badge`, `separator`, `skeleton`, `spinner`, `avatar`, `kbd`, `typography`.
- Accettazione: `button` con tutte le varianti/dimensioni/stati (hover, focus da tastiera, disabled, loading) nelle 4 combinazioni; `typography` riproduce la scala del v1 (`--text-xs` … `--text-title`) *(la scala è poi cambiata con M1.6: vedi `docs/DECISIONI.md` §30)*; `spinner` è il caricamento inline previsto dallo standard unico di INTERFACCE.md §1.

  **Da chiudere qui: quattro rilievi su `button`, aperti e misurati in M1.2** (dettaglio e misure in §2bis, "Tre rilievi nuovi"). Il file è `registry/tassullo/ui/button.tsx`, com'è uscito dal preset `base-nova` in M0.2. Non sono ipotesi: sono stati letti dal browser sul workbench con il tema applicato.

  | dove | cosa fa oggi | misura | cosa deve diventare |
  |---|---|---|---|
  | `variant: link` | `text-primary` | **1.79:1** | `text-accent-ink` → 4.77:1 |
  | `variant: destructive` | `bg-destructive/10 text-destructive` | **3.94:1** | `bg-destructive text-destructive-foreground` → 4.83:1, ed è anche il rosso pieno del v1 |
  | base | `rounded-lg` | bottoni a **10px** invece dei 6px del v1 | `rounded-md` |
  | taglie `xs`/`sm` | `rounded-[min(var(--radius-md),12px)]`, `text-[0.8rem]` | `sm` resta a **12,8px in entrambe le densità** | via i valori arbitrari (regola 3 del `CLAUDE.md`) |

  La variante `link` è la trappola che il `CLAUDE.md` mette per iscritto — `--primary` usato come colore di testo — commessa dal preset ufficiale. Da verificare **su ogni primitiva di questo task, non solo sul bottone**: se ci è cascato il preset, il preset ci sarà cascato più di una volta.

  **Rimisurati in modalità scura (M1.3, 2026-09-07), e cambiano il quadro su due punti:**

  - `variant: link` in dark dà **9.49:1** e passa. Il difetto **esiste solo in chiaro**, quindi guardando la primitiva con l'interruttore sullo scuro sembra a posto: è il primo caso concreto di un rilievo che una sola delle quattro combinazioni rivela, ed è la ragione per cui l'accettazione ne chiede quattro. Il rimedio previsto regge in entrambe perché `--accent-ink` è definito per modalità: `text-accent-ink` dà 4.77:1 in chiaro e 9.49:1 in scuro, **una sola classe**.
  - `variant: destructive` resta sotto soglia in entrambe. La correzione prevista non cambia.

  **Misure rifatte con axe-core sulla story `Primitive/Button` (2026-09-07), e sono queste a fare fede** — non le stime a mano di §2bis, che le precedono e che axe corregge leggendo il pixel composito invece del token:

  | variante | chiaro | scuro |
  |---|---|---|
  | `destructive` | **3.82:1** | **3.57:1** |
  | `link` | **1.79:1** | *nessuna violazione* |

  Sono le **2 violazioni axe oggi aperte** in tutto il progetto, entrambe in carico a questo task. Chiuderle qui riporta il conto a zero, che è la condizione da cui M2.9 deve partire per poter mettere `a11y.test = 'error'` senza trovarsi la CI rossa il primo giorno.

  **Più un'*incomplete*, trovata in M1.4 e che va con le altre**: in modalità scura axe segnala `color-contrast` *incomplete* su `variant: ghost` — «1:1 con lo sfondo», cioè fondo trasparente che axe non sa risolvere. Non è una violazione e non conta nel conteggio, ma un'*incomplete* è una misura che nessuno ha fatto: va chiusa qui, guardando il contrasto reale del testo `ghost` sulle superfici su cui il bottone sta davvero. Verificata identica nelle due densità, quindi non è un effetto della densità.

  **E un rilievo che arriva da M1.4**: `text-[0.8rem]` sulla taglia `sm` non è solo un valore arbitrario da ripulire per la regola 3 — essendo fuori dai token **non segue lo scatto tipografico della densità**, e resta 12,8px anche in touch. Ripulirlo lo risolve da sé, ma la scelta del gradino va fatta sapendo questo.

  Da qui una regola operativa per tutta la FASE 2: **una misura fatta in una sola modalità non è una misura.** Le coppie di token le copre `check:contrast` su entrambe; come i componenti le accostano no. **axe-core c'è già** — è nel pannello Accessibility di ogni story, dal primo giorno: quello che M2.9 aggiunge non è lo strumento ma l'**automazione** (`a11y.test = 'error'` in CI). Fino ad allora il pannello si guarda a mano, in entrambe le modalità, prima di dichiarare finito un task (regola in `CLAUDE.md` §Conduzione).

  **Nota sulla scala tipografica**: con la scala Tassullo `text-sm` vale 12px invece dei 14px di default di Tailwind, quindi i bottoni del preset — che usano `text-sm` — sono più piccoli di prima. Da decidere qui quale gradino è quello giusto per il bottone, misurando.

  **Vincolo su come si correggono** (regole 4bis e 4ter del `CLAUDE.md`, fatte rispettare da `npm run check:registry`): si cambiano **solo le stringhe di classi**. Nessuna variante nuova, nessun prop nuovo, nessun export nuovo — quelle modifiche non si riescono più a riportare quando shadcn aggiorna il componente. E **prima di toccare qualunque file**, `npm run check:registry -- --snapshot <nome>`: uno snapshot preso dopo registrerebbe come originale il nostro.

  Se in questo task sembrasse servire una variante Tassullo che shadcn non ha, **non si scrive**: si risale la scala. Shadcn ce l'ha già sotto un altro nome? Si può ottenere ri-stilando una variante esistente? Si può **adattare il v1** perché entri nella forma shadcn — che è il gradino che si salta più spesso? Solo se nulla di tutto questo regge si **propone** a Francesco un componente nostro e si aspetta la conferma, dicendo cosa è stato provato e perché non è bastato.

  **Una decisione da prendere qui, con le misure già fatte.** Il rimedio proposto per `variant: destructive` — `text-destructive-foreground` — introdurrebbe la **prima dipendenza di un componente da un token custom Tassullo**: `--destructive-foreground` non è fra i 32 token che il preset `base-nova` spedisce (verificato sul commit di scaffold). Oggi quel contatore è a zero e `check:registry` lo riporta a ogni esecuzione. Le alternative, misurate su `--destructive` `#DC2626`:

  | opzione | contrasto | costo di aggiornamento |
  |---|---|---|
  | `text-destructive-foreground` (custom) | **4.83:1** | 1 token custom dentro un componente |
  | `text-white` (builtin Tailwind, ed è ciò che usa lo style di default di shadcn) | **4.83:1** | nessuno, ma è un colore fuori dal tema |
  | `text-background` (standard) | 4.46:1 | — **non passa** |
  | `text-card` (standard) | 4.75:1 | nessuno, ma semanticamente sbagliato |

  Non è una decisione grave, ed è la prima di una serie: va presa consapevolmente e annotata, perché la stessa domanda tornerà a ogni primitiva.

**M2.2 — Form (1 sessione)** — `field`, `input`, `input-group`, `label`, `textarea`, `select`, `checkbox`, `switch`, `radio-group`, `slider`.
- Nota: `field` è la primitiva ufficiale shadcn per la riga etichetta+campo+errore — si usa quella invece di reinventarla, e il blocco `form-field` di M3.4 ci si appoggia sopra. `input-group` è il campo con icona o bottone incorporato: Anagrafe lo ha già fatto a mano in `.prd-cerca`. `slider` serve ai range di conformità dell'FPC (`range_ottimale`, `range_conformita`).
- Accettazione: form di prova navigabile **interamente da tastiera**, ogni campo con etichetta associata (INTERFACCE.md §1).

**M2.3 — Overlay (1 sessione)** — `dialog`, `alert-dialog`, `drawer`, `sheet`, `dropdown-menu`, `context-menu`, `popover`, `hover-card`, `tooltip`, `sonner` (toast), `command`.
- Nota: `alert-dialog` è distinto da `dialog` e serve alle conferme distruttive (eliminazioni, revoca ruoli), dove la fuga accidentale non deve essere possibile. `context-menu` dà le azioni col tasto destro sulle righe di tabella; `hover-card` l'anteprima di un prodotto o di una norma al passaggio.
- Accettazione: focus trap e chiusura con Esc verificati; `drawer` presente perché è il mattone del pattern responsive documentato da shadcn (Dialog su desktop, Drawer su mobile), assemblato in M3.4.

**M2.4 — Contenuto (1 sessione)** — `card`, `tabs`, `table`, `alert`, `empty`, `accordion`, `collapsible`, `scroll-area`, `resizable`, `progress`, `aspect-ratio`, `carousel`.
- Nota: `empty` è la primitiva shadcn dello stato vuoto — il blocco `empty-state` di M3.5 ci si appoggia. `resizable` è la base del `split-view` di M3.9. `carousel` + `aspect-ratio` servono alle foto di prodotto e agli asset REN/RES/IM1-9 previsti dalla roadmap di Anagrafe.
- Accettazione: `alert` nelle quattro varianti info/success/warning/destructive sui token semantici; `card` **non** finge di essere cliccabile (regressione già corretta nel v1, commit `94b0f5a`).

**M2.5 — Navigazione (1 sessione)** — `sidebar` ri-stilato sul blocco sidebar scuro Tassullo, `breadcrumb`, `pagination`.
- Accettazione: sidebar collassabile, stato attivo corretto, resa identica alla sidebar antracite delle app esistenti; **il passaggio automatico a `Sheet` sotto la soglia mobile funziona** (responsive nativo di shadcn: si eredita, non si riscrive) e `--sidebar-width-mobile` è tarato sui token Tassullo.

  **Da chiudere qui: la sidebar è l'unica cosa che la densità touch non scala** (accertato in M1.4). `SIDEBAR_WIDTH` (`16rem`), `SIDEBAR_WIDTH_ICON` (`3rem`) e `SIDEBAR_WIDTH_MOBILE` (`18rem`) sono costanti JavaScript dentro `sidebar.tsx`, passate come `style` inline sul provider: non derivano da `--spacing` e restano identiche in touch, mentre il loro contenuto cresce. Le voci del menu passano da 32 a 48px in una colonna che resta 256px, e il rail collassato — 48px — viene riempito esattamente da un `SidebarMenuButton` da 48px, senza margine attorno all'icona. **Il rimedio non richiede di patchare il componente**: `SidebarProvider` accetta uno `style` che sovrascrive le tre variabili, quindi si può esprimerle in unità di `--spacing` senza uscire dal gradino 2 della regola 4bis. Da verificare nelle due densità, non solo nelle due modalità.

**M2.6 — Filtri e selezione (1 sessione)** — `toggle`, `toggle-group`, `combobox`, `multi-select` / `tag-input`.
- Prompt: "`toggle-group` è l'incarnazione corretta del **chip** del v1 — 'il nome dice la funzione': `badge` è un'etichetta che si legge, il chip è un filtro che si clicca, e confonderli nel v1 è costato riscritture ripetute. Anagrafe li ha già fatti a mano (`pdt-prod-chip`, `adm-ruolo-chip`). `combobox` (shadcn lo compone da `command` + `popover`) sostituisce i `<select>` nudi con cui oggi si scelgono famiglie e norme: con centinaia di voci non reggono."
- Accettazione: combobox con 500 voci finte, filtrabile e navigabile **da tastiera**; `multi-select` con rimozione col tasto Backspace; il gruppo di filtri si distingue a colpo d'occhio da una fila di badge.

**M2.7 — Date (1 sessione)** — `calendar`, `date-picker`.
- Accettazione: date-picker in italiano, settimana che inizia di lunedì, selezione di intervalli per le scadenze ETA e le date di revisione.
- Unico punto in cui l'eccezione a Base UI (D9) è prevista: se il calendario Base UI risultasse debole su locale e intervalli, si valuta qui la variante React Aria (`@internationalized/date`), motivandola nel WORKLOG. Vale solo per questo componente.

**M2.8 — Dati (1 sessione)** — `chart` (Recharts, il wrapper ufficiale shadcn), con la palette categorica sui token Tassullo.
- Prompt: "La ROADMAP di Anagrafe prevede una tab Metriche e un quadro sinottico di prodotto. Definisci `--chart-1..5` a partire dalla palette Tassullo — arancio, verde `#1CAC7C`, neutri caldi — verificando che le serie restino distinguibili anche in dark e per chi ha deficit di percezione del colore (non affidare mai la distinzione al solo colore)."
- Accettazione: barre, linee e torta rese in light e dark; le 5 serie restano distinguibili in scala di grigi.

**Cosa si lascia fuori, e perché** — `input-otp` (l'autenticazione è MSAL, il codice non passa dall'app), `direction` (nessuna lingua RTL: italiano, inglese, croato), `native-select` (`select` lo copre), `menubar` e `navigation-menu` (la navigazione è la sidebar; un secondo sistema di menu confonde), `carousel` in versione galleria complessa, `item` e `marker` (primitive di composizione che non servono finché non emerge il caso), e la famiglia conversazionale `bubble` / `message` / `message-scroller` / `questionnaire` / `attachment`. Su quest'ultima una nota: la roadmap di Anagrafe prevede funzioni AI (`ANTHROPIC_API_KEY`, `MODEL_SONNET`, `MODEL_HAIKU` fra le variabili d'ambiente, il traduttore assistito), quindi **potrebbe servire**; ma finché non c'è una schermata conversazionale decisa, costruirla sarebbe indovinare. Si aggiunge quando la prima app la chiede davvero.

**M2.9 — Gate di fase: audit del set (1 sessione)**
- Prompt: "Attiva `parameters.a11y.test = 'error'` su tutte le story e fai passare axe-core in CI: da qui in poi l'audit è automatico e continuo, non una sessione che si ripete. Poi il residuo manuale che axe non vede: navigazione da tastiera reale su ogni componente, bersagli ≥44px in touch, resa in dark, `npm run check:contrast`. Ogni scostamento o si corregge o si annota in WORKLOG con la motivazione."
- Accettazione: `build-storybook` + test a11y verdi in CI; audit scritto in WORKLOG, zero scostamenti non motivati.

  **Da fare passare anche `npm run check:registry`** (regola 4bis): a fine FASE 2 ogni primitiva deve avere il suo originale in `registry/.upstream/`, forma identica a shadcn, zero valori arbitrari nostri, e il conto dei token custom usati dentro i componenti scritto a verbale — è il costo che si pagherà a ogni aggiornamento di shadcn, e va conosciuto prima di arrivare a 40 componenti.

  **Perché questo gate non è rimandabile.** `check:contrast` (M1.1) verifica le **coppie di token**, non come i componenti le accostano. In M1.2 tre difetti reali della `button` del preset — fra cui un `text-primary` a 1.79:1 — sono passati sotto al gate e sono stati trovati a occhio sul workbench. axe-core sulle story è il controllo che li avrebbe presi: finché non c'è, ogni primitiva della FASE 2 va guardata a mano.

  **Precisazione da M1.3 (2026-09-07): axe-core c'è già** — è nel pannello Accessibility di ogni story dal primo giorno, e in M1.3 ha trovato **9 violazioni vere** su una pagina appena scritta. Quello che manca, e che questo task aggiunge, non è lo strumento ma **l'automazione**: oggi il pannello va aperto a mano e nulla obbliga a farlo. Fino ad allora la regola sta in `CLAUDE.md` §Conduzione — pannello a zero, in entrambe le modalità, prima di dichiarare finito un task.

  **Condizione d'ingresso di questo task**, e va verificata prima di girare l'interruttore: il conto delle violazioni aperte deve essere **zero**. Non lo è: `Primitive/Button` ne ha 2, in carico a M2.1. Mettere `a11y.test = 'error'` con violazioni note aperte significa una CI rossa il primo giorno, e una CI rossa il primo giorno è una CI che qualcuno disattiva la settimana dopo.

---

### FASE 3 — Blocchi applicativi Tassullo — 11 sessioni

Obiettivo: i pattern che si ripetono nelle app dello studio e che shadcn non copre. Sono il vero valore aziendale del 2.0 — l'erede evoluto di `components.css`.
Gate: M3.10 — una pagina reale di Anagrafe ricostruita in Storybook **usando solo i blocchi**, senza una riga di CSS di pagina.
Dipendenze: FASE 2.

Ogni blocco dichiara i suoi `registryDependencies` sulle primitive che usa, così una sola `shadcn add` tira dentro tutto.

**M3.1 — `tassullo-app-shell` (1 sessione)** — sidebar scura + header + area contenuto con `--page-max-width`; è il sostituto di `Sidebar.tsx`/`Sidebar.css` (190 righe) di Anagrafe.
- Accettazione: shell resa a 1440px e degradata a 375px, **in tutte e due le densità** — la matrice qui è viewport × densità, non viewport soltanto.

  **Qui si prende la prima misura di D10 (densità su schermo stretto).** È il primo punto del piano in cui la domanda è rispondibile, perché la shell è ciò che possiede il padding di pagina: sono quelle utility, non le altezze dei controlli, a mangiare la larghezza. Il numero da guardare è la **larghezza utile della colonna di contenuto a 375px** nelle due densità. Se il padding di pagina va sottratto allo scaling, il rimedio è un token di spaziatura di pagina che **non** derivi da `--spacing` — cioè rimettere il `--space-page` del v1, che M1.2 aveva scartato di proposito (§2bis, "Non portati dal v1"). Non si decide qui a tavolino: si misura, e il verdetto è di M4.2.

**M3.2 — `page-header` (1 sessione)** — titolo, breadcrumb, slot azioni a destra; una sola forma per tutte le pagine di tutte le app.

**M3.3 — `data-table` (2 sessioni)** — TanStack Table: colonne tipizzate, ordinamento, filtri, paginazione, selezione, stato vuoto. È il blocco che elimina più codice da Anagrafe (Prodotti, Famiglie, Norme, Pubblicazioni).
- Accettazione: tabella di prova su ~500 righe finte, ordinabile e filtrabile da tastiera; degrado a 375px verificato.

**M3.4 — `form-field`, `confirm-dialog`, `responsive-dialog` (1 sessione)** — riga etichetta + campo + errore coerente con react-hook-form + zod; dialog di conferma per le operazioni distruttive; e `responsive-dialog`, il pattern documentato da shadcn (`Dialog` su desktop, `Drawer` su mobile) impacchettato una volta sola qui, invece di essere riassemblato a mano in ogni app.
- Accettazione: la stessa chiamata rende come dialog a 1440px e come drawer a 375px, senza `if` nel codice della pagina.

**M3.5 — Stati (1 sessione)** — `empty-state`, `page-skeleton`, `error-state`: sono lo **standard vincolante unico** per caricamento, errore, vuoto e successo che `docs/INTERFACCE.md` §1 di Anagrafe impone e che oggi ogni pagina reimplementa (`prd-vuoto`, `pdt-vuoto`, …).

**M3.6 — `file-upload` (1 sessione)** — dropzone con trascinamento, selezione multipla, validazione di tipo e dimensione, barra di avanzamento per file, errori per riga, elenco degli allegati già caricati.
- Motivo: `allegati` ×10 e `caricamento` ×16 nella roadmap di Anagrafe — documenti, foto TDS, asset REN/RES/IM1-9. Oggi non esiste niente.
- Accettazione: caricamento simulato di 5 file con uno che fallisce; il componente resta utilizzabile da tastiera **senza** trascinamento (il drag&drop non può essere l'unico modo).

**M3.7 — `pdf-preview` e `version-timeline` (1 sessione)** — anteprima PDF incorporata con navigazione pagine e zoom; timeline verticale delle revisioni di un documento con stato, autore, data e confronto tra due versioni.
- Motivo: `pdf` ×59 e `anteprima` ×9; `storico` ×9. È il cuore documentale dell'app.
- Accettazione: PDF reale dei riferimenti FileMaker di Anagrafe aperto e sfogliato; timeline su 5 revisioni finte.

**M3.8 — `rich-text-editor` (1 sessione)** — editor con barra strumenti ridotta all'essenziale (grassetto, corsivo, elenchi, link, apici), contenuto serializzato in modo stabile, contatore caratteri con limite (BC impone 2048 caratteri per campo).
- Motivo: `editor` ×20 — testi di famiglia, voce di capitolato, note tecniche.
- Accettazione: incolla da Word **senza** portarsi dietro stili; il limite a 2048 si vede prima di sbatterci contro.

**M3.9 — `diff-view` e `split-view` (1 sessione)** — confronto prima/dopo con evidenziazione delle differenze (parola per parola, non solo riga per riga) e vista affiancata a due colonne sincronizzate.
- Motivo: `diff` ×15 — il change set di Anagrafe **è** una diff, ed è il meccanismo attorno a cui ruota tutto il flusso di approvazione. `affiancato` ×3 — le traduzioni IT/EN.
- Accettazione: diff su due testi reali di scheda tecnica; split-view che degrada a colonne impilate a 375px.

**M3.10 — Gate di fase (1 sessione)**
- Prompt: "Ricostruisci in Storybook la pagina Prodotti di Anagrafe usando **solo** app-shell + page-header + data-table + empty-state, zero CSS di pagina, e confrontala con uno screenshot dell'attuale."
- Accettazione: la pagina ricostruita è funzionalmente equivalente e non contiene CSS di pagina; screenshot a confronto in WORKLOG.

---

### FASE 3bis — Tabelle avanzate (niko-table) — 12 sessioni

Obiettivo: colmare i pattern di tabella che `data-table` (M3.3) non copre e che un caso reale di Studio (`/computo`, "Computo metrico estimativo") richiede — righe annidate con subtotale, espansione, resize/pin colonne, scroll infinito, editing tipo foglio elettronico, filtri sfaccettati, riordino righe/colonne. Segnalato da Francesco: [niko-table](https://niko-table.com) (MIT, Semir N., github.com/Semkoo/niko-table-registry), un registry shadcn su TanStack Table v9 compatibile Base UI che copre già questi pattern. **Si porta (si riscrive), non si installa**: l'installazione diretta (`npx shadcn add @niko-table/...`) importa file con `@/components/ui/table` e `@/lib/utils` fissi (non il nostro alias, regola 1), valori Tailwind arbitrari nel core (regola 3), e sovrascriverebbe il nostro `ui/table.tsx` già ri-stilato. Ogni sessione parte dal JSON pubblico dell'item (`https://niko-table.com/r/<nome>.json`), lo riscrive con import/token/API nostri in un solo passaggio, mantiene la nota di attribuzione MIT.
Gate: `pagina-lista` mostra almeno un esempio di ciascuna nuova capacità, senza CSS di pagina; `npm run check` verde sui cinque gate.
Dipendenze: FASE 3 (M3.3 `data-table`), M4.2 (`pagina-lista`, da riaprire in coda).
Valutazione completa, incluso cosa resta fuori ambito e perché, in `docs/DECISIONI.md` §40.

**M3bis.0 — Inventario e mappa di adattamento (1 sessione) — DONE** — completa la lettura di `niko-table/overview/{core,filters,hooks,lib,types,config}` e degli esempi non ancora aperti; produce in `WORKLOG.md` la mappa di adattamento (icone/etichette da tradurre, conferma che si bypassa `DataTableRoot`/`detectFeaturesFromChildren` — il nostro blocco registra già le feature TanStack in modo esplicito) che le sessioni successive useranno come riferimento.

**M3bis.1 — Righe annidate con subtotale, "Tree" (1 sessione)** — estende `data-table.tsx` con dati annidati (`getSubRows`, non raggruppamento: la struttura è nel modello dati, come il caso reale di "Computo") — indentazione + chevron per livello, selezione a cascata, subtotale sulla riga genitore. Porting dal pattern "Tree Table".
- Accettazione: righe annidate su almeno due livelli, subtotale corretto, espandi/collassa e selezione a cascata da tastiera, `test:a11y` zero violazioni.

**M3bis.2 — Espansione righe (1 sessione)** — `getExpandedRowModel`, porting da "Row Expansion Table"; pannello di dettaglio per riga a contenuto libero.
- Accettazione: apertura/chiusura da tastiera (Invio/Spazio), `test:a11y` zero violazioni.

**M3bis.3 — Resize e pin colonne generalizzato (1 sessione, tocca la primitiva `ui/table.tsx`)** — larghezze/colgroup, classi sticky, `tabIndex={0}` sul contenitore di scroll (oggi assente). Riapre **D17** ("no per ora") con nuova evidenza: niko-table lo fa senza Radix nativo. Il pin non parte da zero — `bloccaPrimaColonna` (M3.3) è già un pin fisso; qui si generalizza (qualunque colonna, entrambi i lati, dal menu intestazione). **Blocca in attesa della conferma esplicita di Francesco prima di scrivere codice** (4bis.4 — tocca una primitiva, la forma diverge dall'originale shadcn); riga nuova in `componenti-propri.json`.
- Accettazione: colonna ridimensionabile da mouse e tastiera (o eccezione motivata come D14); pin verificato a 375px come già fatto per `bloccaPrimaColonna` in M3.3.

**M3bis.4 — Virtualizzazione / scroll infinito (1 sessione)** — corpo virtualizzato per `data-table` (nuova dipendenza `@tanstack/react-virtual`), capacità autonoma (non solo prerequisito della Data Grid) — terza opzione accanto a `perPagina`/`altezza="ferma"`.
- Accettazione: scroll fluido su 10.000 righe finte; tastiera (frecce, Home/End, Page Up/Down) verificata esplicitamente — la virtualizzazione è nota per romperla se il fuoco non segue le righe montate/smontate.

**M3bis.5 — Data Grid editabile (3 sessioni, fissato in M3bis.0)** — nuovo blocco fratello `data-grid.tsx`, porting da `data-table-grid` + `data-table-grid-changes`: navigazione da tastiera, focus/selezione, clipboard, fill, annulla/ripeti, tracciamento modifiche creazione/aggiornamento/cancellazione. Dipende da M3bis.3 e M3bis.4. Include celle tipizzate (testo/numero/valuta `it-IT`/checkbox/data/select, porting da "Cell Types") e validazione per cella con Zod (porting da "Validation", coerente con `form-field` M3.4). **M3bis.0 ha scartato `getRowMemoKey`** (editing in-riga leggero, senza clipboard/undo-redo): il caso reale del "Computo" vuole tutti e tre. Le tre sessioni: (1) motore `useDataGrid`/`<DataGrid>` + clipboard/fill/undo-redo, innestato su `data-table` virtualizzato e resizabile; (2) celle tipizzate + validazione Zod; (3) `useGridChanges` (persistenza) più la prova end-to-end sul dataset finto a forma di computo, che è dove si verifica per intero il criterio d'accettazione sotto.
- Accettazione: prova su ~500 righe finte con editing, incolla da appunti, annulla/ripeti; celle numeriche/valuta/select su dati di un computo finto; verifica a11y **a mano** oltre ad axe (niko-table non certifica WCAG su virtualizzazione/pinning).

**M3bis.6 — Filtri sfaccettati (1 sessione)** — `data-table` ha già lo stato dei filtri per colonna (`columnFilteringFeature`) ma nessuna UI pronta. Porting di `data-table-faceted-filter` + `useGeneratedOptions` (conteggio per opzione, es. "Categoria: Elettronica 12", ricalcolato sulle righe filtrate) — solo primitive già esistenti (Popover/Command/Checkbox), nessun tocco a `ui/`.
- Accettazione: filtro multi-valore con conteggio corretto e ricalcolato; apertura/selezione da tastiera; `test:a11y` zero violazioni.

**M3bis.7 — Drag&drop righe (1 sessione)** — riordino manuale via trascinamento, porting da "Row DnD Table" (`@dnd-kit/*`, nuova dipendenza). Non va combinato con ordinamento/filtri attivi — disabilitati esplicitamente quando il riordino è attivo.
- Accettazione: riordino completo da tastiera (non solo mouse); `test:a11y` zero violazioni.

**M3bis.8 — Drag&drop colonne (1 sessione)** — riordino intestazioni, porting da "Column DnD Table"; sicuro da combinare con ordinamento/filtri/virtualizzazione.
- Accettazione: riordino da tastiera; compatibilità verificata con resize colonne (M3bis.3) nella stessa story.

**M3bis.9 — Menu di riga condiviso, dropdown e tasto destro (1 sessione)** — aggiunta il 2026-09-16 su richiesta di Francesco, a partire dal pattern annotato in M3bis.0 ("Row Context Menu Table"): un solo componente di azioni-riga (`RowMenuItem`/`RowMenuSeparator`/`RowMenuSub` polimorfici, che leggono la riga da `useDataTableRow<T>()`) si monta sia nel dropdown "…" sia nel menu del tasto destro, senza duplicare l'elenco delle azioni. Porting da `data-table-row-context-menu` — non tocca `ui/table.tsx`, si compone su `tassullo-data-table` come le altre sessioni della fase. Include l'`enabledFor` per escludere il menu da righe singole (bloccate, di sola lettura).
- Accettazione: azioni identiche da dropdown e da tasto destro su almeno due righe della story; `enabledFor` verificato su una riga esclusa; tastiera (il dropdown resta raggiungibile e operabile senza mouse anche quando il tasto destro non lo è); `test:a11y` zero violazioni.

**M3bis.10 — Editing in-riga leggero, `getRowMemoKey` (1 sessione)** — aggiunta il 2026-09-16 su richiesta di Francesco, dal pattern "Inline Edit Table" già scartato in M3bis.0 **per il caso Computo** (niente clipboard/undo, non basta lì) ma non fuori ambito in assoluto: per un elenco dove si corregge un campo alla volta senza aprire la scheda (una `pagina-lista` di Anagrafe, non il computo), è la strada più leggera — non dipende da resize/virtualizzazione/Data Grid, quindi non aspetta M3bis.3/M3bis.4. Porta lo stato di editing (`editingId`/`draft`/`errors`) **fuori dai dati** — mai un `isEditing` dentro la riga, che farebbe ri-renderizzare l'intera tabella a ogni tasto — e usa `getRowMemoKey` (già in `DataTableBody`/`DataTableVirtualizedBody` di M3.3/M3bis.4) per far ri-renderizzare solo la riga in modifica. Validazione inline sugli stessi campi, non Zod (quella resta il confine della Data Grid, M3bis.5): due-tre regole semplici come nell'esempio niko-table bastano al caso d'uso.
- Accettazione: modifica di un campo senza che le altre righe ri-renderizzino (verificabile con un contatore di render per riga in story, come fa niko-table); Invio salva, Esc annulla; errore di validazione mostrato senza chiudere l'editing; `test:a11y` zero violazioni.

**M3bis.11 — Aggiornamento di `pagina-lista` e gate di fase (1 sessione)** — `pagina-lista` (M4.2) oggi non mostra nessuna capacità di questa fase: si aggiunge almeno un esempio rappresentativo. `pagina-scheda` non necessita modifiche (le menzioni di `data-table` lì sono solo commenti).
- Accettazione: `npm run check` verde sui cinque gate; screenshot prima/dopo in `WORKLOG.md`; pagina senza CSS di pagina.

---

### FASE 4 — Pagine modello — 6 sessioni

Obiettivo: pagine intere pronte da installare, sul modello di `ui.shadcn.com/blocks` (dove `npx shadcn add dashboard-01` cala nel progetto un `page.tsx` completo, non uno spezzone). Sono il livello sopra i blocchi: una nuova app dello studio non parte più da una pagina bianca, ma da una pagina Tassullo funzionante da svuotare e riempire.
Gate: una nuova app Vite vuota installa `tassullo-app-shell` + `pagina-lista` + `pagina-login` e ha in dieci minuti una app navigabile e in stile, senza scrivere una riga di layout.
Dipendenze: FASE 3.

Ogni pagina modello è un item `registry:block` con dati finti tipizzati e commenti che dicono cosa sostituire. Il criterio di scelta: **le pagine che le tre app hanno già tutte e tre**, non pagine inventate.

**M4.1 — `pagina-login` (1 sessione)** — schermata di accesso con logo Tassullo, bottone di autenticazione (predisposto per MSAL/Entra ID, che è lo standard delle app dello studio), stato di errore e stato "accesso in corso".
- Motivo: Anagrafe ha `Login.tsx` + `Login.css`; ogni app dello studio ne ha una, tutte leggermente diverse.

**M4.2 — `pagina-lista` (1 sessione)** — la pagina più ripetuta in assoluto: intestazione con titolo e azione primaria, barra filtri (`combobox` + `toggle-group` + ricerca), `data-table` con paginazione, stati vuoto/caricamento/errore.
- Motivo: in Anagrafe è Prodotti, Famiglie, Norme, Sistemi, Pubblicazioni, ChangeSets — sei volte la stessa pagina, scritta sei volte.
- Accettazione: **la pagina si prova nelle quattro combinazioni viewport × densità**, e la cella `375px × touch` è quella che decide. È la pagina più densa che abbiamo — filtri, tabella, paginazione — quindi è il banco di prova onesto di D10.

  **Qui si chiude D10.** Le tre uscite possibili, da scegliere sulla pagina vera e non prima: *(a)* la densità touch regge a 375px così com'è e non si fa niente; *(b)* regge scorporando la spaziatura di pagina dallo scaling — i bersagli crescono, il respiro di pagina no; *(c)* non regge, e il fattore va ridotto sotto una certa larghezza. La (c) è l'ultima da prendere, perché reintrodurrebbe una dipendenza dal viewport in un meccanismo che è deliberatamente **una scelta dell'app** e non del dispositivo.

**M4.3 — `pagina-scheda` (1 sessione)** — dettaglio di un'entità: breadcrumb, intestazione con stato e azioni, tab (anagrafica / documenti / storico), form in sola lettura che passa in modifica, `version-timeline` in coda.
- Motivo: Prodotto, Famiglia, Sistema, Norma — quattro volte in Anagrafe, ed è il file CSS più grande (`Prodotto.css`, 201 righe).

**M4.4 — `pagina-dashboard` (1 sessione)** — home applicativa: fila di indicatori, due grafici, tabella delle attività recenti, area avvisi.
- Motivo: nessuna delle app ce l'ha ancora fatta bene, e la roadmap di Anagrafe prevede una tab Metriche e un quadro sinottico.

**M4.5 — `pagina-admin` (1 sessione)** — pagina a tab per l'amministrazione: gestione utenti con ruoli multipli, tabella con azioni per riga, dialoghi di conferma, banner per l'utente senza permessi.
- Motivo: Anagrafe (`Admin.tsx`, 212 righe di CSS) e SuperTM hanno la stessa pagina con la stessa struttura a tab.

**M4.6 — Stati di sistema e gate (1 sessione)** — `pagina-errore` nelle sue varianti: 404, accesso negato (l'utente senza ruoli di Anagrafe è sola lettura e la UI glielo deve dire), errore del server, manutenzione. Poi il gate: app Vite vuota, tre `shadcn add`, e si verifica che in dieci minuti ci sia un'app navigabile e in stile.
- Accettazione: cronometrata davvero e annotata in WORKLOG — se ci vuole di più, il problema è nella documentazione o nei `registryDependencies`, e si corregge lì.

**M4.7 — `item`, la lista non tabellare (1 sessione)** — aggiunto in coda alla fase il 2026-09-18, su indicazione di Francesco, dopo la revisione a video della dashboard. Si installa la primitiva `item` di shadcn (originale, gradino 1 della regola 4bis: `add`, poi **snapshot prima di toccarla**), si scrive la story `Primitive/Item`, e la si compone in un caso reale — il tab **documenti** di `tassullo-pagina-scheda`, che oggi è un `ReactNode` libero.
- Motivo, misurato sui tre siti: i selettori CSS di riga/voce sono **~120 in Officina, ~22 in Studio, ~19 in Anagrafe**. È il secondo pattern più ripetuto dopo la tabella, e copre il buco fra `data-table` (la lista che si cerca e si ordina) e `card` (un contenitore, non una riga): la lista **non tabellare** — allegati, impostazioni, elenchi selezionabili. Quattro casi di Anagrafe si mappano uno a uno sulla sua anatomia: `sed-riga` (`SistemaEditor`), `nrm-elenco-voce` (`Norme`), `adm-accordion-voce` (`Admin`), `abc-modifica-riga` (`AdminBC`).
- Accettazione: `npm run check` verde sui cinque gate; `check:registry` deve vedere l'originale in `registry/.upstream/item.tsx` e **nessuna riga** in `componenti-propri.json`, che resta vuoto; il tab documenti di `Pagine/Scheda` rende una lista di allegati veri; pannello Accessibility a zero in chiaro e scuro.

---

### FASE 4ter — Copertura delle tre app — 10 sessioni

Obiettivo: chiudere i **dodici pattern «da fare»** di `docs/ANALISI-COPERTURA-APP.md` §1, cioè portare il registry al punto in cui una pagina qualsiasi di Anagrafe, Studio o Officina si può ricomporre **senza scrivere CSS nuovo**. La fase nasce dalla gap analysis del 2026-09-19, che ha chiuso D20–D23 e ha lasciato aperto il solo impacchettamento: i sei lavori **L1–L6** di §4bis diventano qui dieci task.
Gate: **M4ter.10** — installazione cronometrata degli item nuovi in un'app Vite vuota (sono **dodici**, non otto: il conto qui sotto era vecchio), e la tabella §1 ripercorsa riga per riga. **Superato il 2026-09-20.** In coda alla fase, aggiunta il 2026-09-21, **M4ter.11**: la revisione a video dell'arretrato, che non poteva andare in FASE 5 perché quella è documentazione e chiusura.
Dipendenze: FASE 4.

**Perché una fase e non una coda alla FASE 4** (deciso con Francesco il 2026-09-19). Il conto: in coda sarebbero **nove** sessioni (M4.8…M4.16) senza gate; come fase sono **dieci**. La sessione in più la paga il precedente di **M4.6**, dove il gate identico trovò **26 `registryDependencies` rotte su 12 item** — il registry pubblico era *ininstallabile* per ogni blocco con dipendenze interne — più due prerequisiti mai documentati e quattro blocchi che rompevano `tsc` in un'app Vite pura. `registry validate` era verde su tutti e quattro: solo un'installazione vera li ha visti. Qui entrano **otto item nuovi**, e per la prima volta item che **ridistribuiscono file di un registry terzo**. E la domanda del gate è diversa da quella della FASE 4 («dieci minuti a un'app navigabile»): qui è «**una pagina vera di Studio o di Officina si ricompone senza scrivere CSS nuovo?**». Un gate che ripete la domanda della fase precedente non varrebbe la sessione.

**L'ordine: il rischio per primo, le dipendenze poi.** M4ter.1 apre la fase perché è l'unico task che può fallire *in modo da cambiare il piano* — se una delle tre verifiche bloccanti non regge, **D22 si riapre** e il calendario torna da scrivere, che sono sessioni, non ore. Scoprirlo al settimo task è peggio che al primo. M4ter.2 gli sta attaccato perché la conoscenza del sorgente reui è cara da ricostruire. M4ter.6 dipende da M4ter.3, perché la faccia larga della lista vuole la miniatura.

**I numeri di partenza, misurati il 2026-09-19 e non ricordati**: `npm run test:a11y` **1296 scansioni** (324 story × 4 passate), **0 violazioni**; `check:registry` **0 errori / 53 avvisi / 0 componenti nostri / 18 ri-stilati**; **83 item**. La regola con cui si leggono le previsioni di ogni task: **una scena di story vale 4 scansioni**. Se il conto non torna, o la story non è stata scritta o il gate non l'ha vista — che è il difetto che M2.6 ha pagato.

**I sub-agenti: la regola della fase, poi il verdetto task per task.** Il 2026-09-19 tre sub-agenti Sonnet hanno letto tre app in parallelo, e **due rapporti su tre avevano numeri falsi** (selettori CSS contati con `grep -c "{"`, che conta anche `@media` e i fotogrammi) mentre uno dichiarava «verificato» un criterio mai osservato. La divisione che ha funzionato è: **il sub-agente raccoglie, l'orchestratore verifica e decide**, e ogni numero che finisce in un documento è ricalcolato da chi lo scrive. Da qui la regola: **sub-agenti solo dove il lavoro è ricognizione in sola lettura fuori da questo repo**. Mai per scrivere codice del registry — che deve passare cinque gate e stare dentro la regola 4bis, e che comunque tocca `registry.json` e `public/r/`, dove due sub-agenti in parallelo si pestano i piedi.

---

**M4ter.1 — `@reui`: le tre verifiche bloccanti, i tre file, il gate a due provenienze (1 sessione)**

- **Obiettivo**: i tre file reui — `event-calendar-month-view`, `event-calendar-agenda-view`, `stepper` — stanno nel registry con l'avviso di copyright MIT di Keenthemes conservato nel file, il loro originale in `registry/.upstream/`, e `npm run check:registry` li riconosce come **ri-stilati sopra un originale reui** invece di dichiararli «componenti nostri senza originale».
- **Prompt**: "**Prima di installare qualunque cosa, tre verifiche. Se una non regge, il task si ferma e si riapre D22** — non si prosegue 'intanto'. *(a) La provenienza.* Che i file serviti da `reui.io/r/styles/base-nova/<nome>.json` siano gli stessi pubblicati sotto MIT in `keenthemes/reui`, sotto `registry-reui/bases/base/reui/`. **Non sono identici e non devono esserlo**: accertato il 2026-09-19 sullo `stepper` che il sorgente MIT porta le classi di *tutti* gli stili (`style-vega:rounded-sm style-nova:rounded-sm style-maia:rounded-full …`) e che il server **risolve il prefisso** per lo stile richiesto — 474 righe contro 473, due hunk in tutto, il secondo è il newline finale. Le sole differenze ammesse sono quelle due; qualunque altra è un fatto da guardare, non da normalizzare. *(b) `@reui/icon-stack`*, dipendenza della vista agenda: che sia il solo contenitore e non tiri dentro il set d'icone, che nel listino reui sta nel piano **Ultimate**. Si legge l'item con `shadcn view` e si guardano `dependencies` e `registryDependencies` **stampate per intero**, non riassunte. *(c) Dove atterrano i file.* Il `target` dello stepper è `components/reui/stepper.tsx`: col nostro alias `components` atterrerebbero in `registry/tassullo/reui/`, che `check:registry` **non guarda** (scandisce `ui/`, `blocks/`, `pages/`, `lib/`). È lo stesso punto cieco di `hooks/`. Si prova con `--dry-run` e si guarda il path vero; poi o il gate impara quella cartella, o i file si spostano — la scelta va a verbale. Poi `add`, e **lo snapshot prima di toccare un carattere** (regola 4ter). Ma `check:registry -- --snapshot` scarica da `@shadcn` hardcodato (`scripts/check-registry.ts:341`) e `registry/.upstream/PROVENIENZA.md` dichiara **una** provenienza per l'intera cartella: vanno estesi a una **provenienza per file**, scritta in modo che un terzo registry domani si aggiunga con una riga e non con una diramazione. Solo dopo, il ri-stile: sul calendario i tre valori arbitrari `text-[0.6875rem]`, `max-[10rem]`, `max-[36rem]` — il primo è il difetto muto di §30, un corpo fuori scala che non segue la densità. Sullo stepper, verificato, **non c'è niente da ri-stilare**: zero esadecimali, zero valori arbitrari, e i due corpi che usa (`text-xs`, `text-sm`) sono gradini che il tema tara. **Ridistribuiamo**, quindi l'avviso di copyright MIT resta nei file e si dichiara nell'item, con lo stesso trattamento dell'OFL di Inter in `tema-font`. La story `Primitive/Stepper` (tre scene: orizzontale, verticale, barra a segmenti) sta qui e non in M4ter.5, perché è il modo più economico di provare il gate esteso su più di un file; se la sessione sfora, **è la story il pezzo che si sposta**, non le verifiche."
- **File**: *creati* — i tre file reui (cartella da decidere con la verifica (c)), i loro originali in `registry/.upstream/`, l'avviso MIT come file dell'item, `registry/tassullo/ui/stepper.stories.tsx` (o dove atterra lo stepper). *Modificati* — `scripts/check-registry.ts`, `registry/.upstream/PROVENIENZA.md`, `registry.json`, `public/r/*`.
- **Verifiche mie**: `diff` fra il file servito e il file MIT di GitHub, per tutti e tre: **le sole differenze sono i prefissi `style-*` risolti e il newline finale**, elencate hunk per hunk nel WORKLOG. · `shadcn view @reui/icon-stack`: `dependencies` e `registryDependencies` stampate per intero. · `npm run check:registry`: **0 errori**, i tre file fra i ri-stilati (**18 → 21**), `componenti-propri.json` ancora a **0 componenti**, avvisi 53 → **≤56**. · `check:registry -- --snapshot <nome-reui>` riscarica da reui e `git diff registry/.upstream/` esce **vuoto** subito dopo. · **Autotest del gate**: si falsifica a mano una riga della mappa provenienze e lo script deve **uscire con codice 1**, sul modello di `check:contrast -- --self-test`. Un gate che non sa fallire non è un gate. · `npm run check` verde sui cinque; `test:a11y` **1296 → 1308** (3 scene nuove), 0 violazioni. · `registry.json` **83 → 86 item**, `registry validate` verde.
- **Verifiche di Francesco**: l'avviso MIT, **come finisce nel file che un'app si installerà**, è il testo che vuoi che le app si portino dietro, sì o no? · Guardando il solo `git diff` di `scripts/check-registry.ts`: un terzo registry domani si aggiunge con una riga sola, sì o no? · Le tre scene di `Primitive/Stepper` sullo schermo: i pallini numerati e i trattini si distinguono a colpo d'occhio fra fatto, corrente e da fare, sì o no? · Le frecce e `Home`/`End` spostano il fuoco fra i passi? — **questa la dichiari tu**: in automazione i tasti arrivano con `event.key` vuoto e io posso solo dire che non l'ho provata.
- **Sub-agenti**: **sì, tre Sonnet in parallelo**, uno per verifica — sono tre letture indipendenti su fonti esterne e nessuna scrive nel registry. Ma il verdetto lo scrive l'orchestratore **dopo aver rifatto** il `diff` di (a) e riletto l'item di (b) coi propri comandi: un sì/no su una licenza è peggio di un conteggio sbagliato.

**M4ter.2 — `tassullo-calendario`: il blocco sopra il motore reui (1 sessione)**

- **Obiettivo**: `tassullo-calendario` rende un mese con **barre che attraversano più giorni** e un'agenda, prende `start`/`end` per ogni evento, comincia la settimana di **lunedì** e non crea eventi dal clic sulla griglia.
- **Prompt**: "Il blocco che fissa i default di casa sopra le due viste installate in M4ter.1 — è il pezzo nostro, e per questo è un **blocco** e non un componente: `componenti-propri.json` non lo riguarda. I default, presi dal `Calendario.tsx` di Officina letto in sola lettura: settimana che comincia **lunedì** (`GIORNI_SETTIMANA`), **niente creazione dal clic sulla griglia**, trascinamento **spento** — è una prop che si spegne, non un comportamento imposto, e la ragione la scrive il commento di testa di quella pagina: «la riprogrammazione è un date-picker nel pannello, non un drag&drop; trascinare su una griglia da 42 celle è preciso col mouse e impossibile col pollice, e sarebbe l'unica azione dell'app senza una conferma». L'API dell'evento prende **`start` e `end` da subito**, non un istante solo: un fermo macchina può durare giorni, e le barre pluri-giorno — cioè il calcolo delle corsie — sono la parte cara che reui ci dà già fatta. Da cui un fatto che non è nostro e va scritto dove qualcuno lo leggerà: `EventoCalendario` di Officina ha `programmato_il`, **un istante**, quindi il suo backend dovrà produrre inizio e fine prima di poter migrare. La nota è **già scritta** in coda a `docs/ANALISI-COPERTURA-APP.md`, sezione **§7 «Note per M5.5»** (aperta il 2026-09-19 con questa dentro): il task **verifica che l'API scritta le corrisponda** e la completa con quello che il lavoro vero fa emergere. La faccia stretta è l'**agenda**, che è la vista che Officina si è scritta a mano: il bivio fra le due lo dichiara la pagina, non il blocco — e da M4ter.6 in poi si scriverà con `useSoglia`."
- **File**: *creati* — `registry/tassullo/blocks/calendario.tsx`, `calendario.stories.tsx`. *Modificati* — `registry.json`, `public/r/*`, `docs/ANALISI-COPERTURA-APP.md` (sezione «Note per M5.5»), `CHECKLIST.md` (la riga M5.5 ci punta).
- **Verifiche mie**: `test:a11y` **1308 → 1332** (6 scene: mese, mese con barre pluri-giorno, mese con «+N altri», agenda, vuoto, densità touch), **0 violazioni**, e la story **dichiara il proprio popup** se ne apre uno. · `npm run misura:bersagli` in densità touch, col **controllo dello strumento**: se il bottone di default non fa 48px la densità non è stata applicata e il rapporto non vale; il numero dei bersagli piccoli del calendario va a verbale, perché le celle del mese sono il candidato naturale a starci sotto. · La navigazione da tastiera della griglia **misurata in Chromium vero**, headless dalla cartella temporanea: axe qui non basta — **D15** insegna che una griglia completamente non navigabile dà **zero violazioni**. · Qualunque misura su qualcosa che transisce o si apre si prende **a pagina ferma e in un browser vero** (§32): il pannello del browser dell'app ha `visibilityState` `hidden` e `requestAnimationFrame` non scatta. · `npm run check` verde; `registry.json` **86 → 87 item**.
- **Verifiche di Francesco**: una barra che dura tre giorni si legge come **un** fermo e non come tre, sì o no? · Il mese comincia di lunedì in tutte le scene, compresa l'agenda, sì o no? · Sullo schermo del capannone, con la densità touch, le celle del mese si toccano col guanto senza sbagliare giorno, sì o no? · I tasti freccia spostano la selezione nella griglia? — **la dichiari tu**, per la stessa ragione di M4ter.1.
- **Sub-agenti**: **no**. È codice del registry che deve passare cinque gate e stare dentro 4bis.

**M4ter.3 — `entity-image`: il primo componente nostro (1 sessione)**

- **Obiettivo**: esiste un componente che rende una foto ritagliata a `4:3` o un **segnaposto** quando la foto non c'è, con `16:9` disponibile come valore di prop; ed è la **prima riga** di `registry/componenti-propri.json`, finora vuoto.
- **Prompt**: "È **D20**, approvata il 2026-09-19: si scrive, non si ridiscute. Il meccanismo non va inventato — `AvatarImage`/`AvatarFallback` di Base UI *è già* il ramo condizionale che serve, e il file nuovo lo mette dentro un riquadro non tondo insieme ad `AspectRatio`. Rapporto **`4:3` di default**, **`16:9`** disponibile e per ora senza consumatori: un rapporto è il *valore di una prop*, non un componente, quindi la regola del secondo consumatore non si applica, e l'insieme chiuso è ciò che impedisce il ripetersi delle **16 soglie `minmax` distinte** (da 104 a 320px) che le tre app usano oggi. La riga in `componenti-propri.json` non è documentazione a posteriori, è la **condizione perché il componente esista**: file, cosa fa, quali strade shadcn sono state provate — `avatar` sovrascritto dal punto di chiamata (cinque classi da annullare in ogni pagina: `size-8` e `rounded-full` sulla radice, l'`after:rounded-full` del bordo, `aspect-square rounded-full` su `AvatarImage`, `rounded-full` su `AvatarFallback`), una variante dentro `avatar.tsx` (vietata da 4bis, ed è la divergenza cara), `ItemMedia variant=\"image\"` (40/32/24px, cioè la miniatura in riga, non la foto di una scheda) — chi ha approvato e quando. **E qui si decide la larghezza della cella della griglia**, che è la stessa domanda del rapporto vista dall'altro lato: si decide **misurando una card vera a 4:3** in Chromium, a 375 e a 1440, non scegliendo un numero. Il valore scelto è quello che sostituirà le 16 soglie di oggi, e va scritto con la misura che l'ha deciso. Il segnaposto è un'icona Lucide, non un SVG di dominio: `MacchinaIcon` è scritta **identica in quattro file** di Officina, ed è la prova della lacuna, non il modello da copiare."
- **File**: *creati* — `registry/tassullo/ui/entity-image.tsx`, `entity-image.stories.tsx`. *Modificati* — `registry/componenti-propri.json` (prima riga), `registry.json`, `public/r/*`.
- **Verifiche mie**: `check:registry` **0 errori** e **1 componente nostro dichiarato** (da 0 a 1) — e l'autotest del caso opposto: tolta la riga, il gate deve **fallire**. · `test:a11y` **1332 → 1356** (6 scene: 4:3 con foto, 4:3 senza foto, 16:9, in griglia di card, miniatura in riga, densità touch), 0 violazioni; l'immagine senza `alt` deve far fallire il gate, quindi l'`alt` è obbligatorio nell'API. · La larghezza di cella: **misurata in Chromium vero**, a 375 e 1440, il numero a verbale accanto alla card su cui è stato preso. · `npm run misura:bersagli` se l'immagine diventa cliccabile in qualche scena. · `npm run check` verde; `registry.json` **87 → 88 item**.
- **Verifiche di Francesco**: a quella larghezza la foto della macchina **si riconosce** sullo schermo su cui la si guarderà davvero, sì o no? · Il segnaposto dice «foto mancante» e non «errore», sì o no? · `4:3` è il rapporto giusto per la card di catalogo di Studio **e** per la scheda macchina di Officina, o uno dei due vuole `16:9`?
- **Sub-agenti**: **sì per una sola ricognizione**, in sola lettura e fuori da questo repo: ricontare le 16 soglie `minmax` nelle due app e dire **quante volte ciascuna ricorre**, che è il dato che manca per scegliere. L'orchestratore **rifà il grep** prima di scrivere il numero. **No** per il componente.

**M4ter.4 — `pagina-login` prende `modo`: le tre vie (1 sessione)**

- **Obiettivo**: `pagina-login` rende l'accesso con credenziali, con account Microsoft o con entrambi, con **disponibilità ed errore distinti per via**, e a parametri invariati rende esattamente la pagina di oggi.
- **Prompt**: "È **D23**, chiusa il 2026-09-19: `modo?: \"microsoft\" | \"credenziali\" | \"entrambi\"`, **`microsoft` di default**, che è ciò che tiene Anagrafe e Officina immutate. L'insieme chiuso e non una sezione facoltativa perché su `/login` di Studio l'ordine è credenziali → separatore «oppure» → bottone Microsoft in fondo: **l'SSO è il caso secondario**, e con una prop facoltativa questo non sarebbe dicibile. `\"credenziali\"` non ha consumatori oggi e si fa lo stesso, per la stessa ragione del 16:9. Il guscio **non cambia**: schermo centrato, `Card max-w-sm`, marchio, titolo, descrizione — verificato identico, elemento per elemento, su tutte e cinque le schermate di Studio. Cambia cosa ci sta dentro, e tutto compone: `Field`+`Input`, `InputGroup`+`InputGroupButton` per il «Mostra» dentro il campo, **`FieldSeparator`** per il filo con «oppure» al centro (esiste apposta, `field.tsx:144`), `Button variant=\"link\"` per «Password dimenticata?» e «Registrati», `FieldLegend`/`FieldDescription` per «TEAM TASSULLO». **Qui atterrano i quattro punti aperti di `docs/SPEC-AUTH.md` §3**, e vanno risolti prima di scrivere l'API, non dopo: *(1)* la disponibilità è **per via e non per pagina** — oggi `configurato` è un booleano solo e vuol dire «l'app registration Entra ID c'è», ma Studio ne ha due (quella, e `accessoLocale = stato?.abilitata !== false`, `Login.tsx:44`, che è spento finché il backend non ha il segreto): servono **due interruttori distinti**, e `configurato` **mantiene il significato di oggi** o Anagrafe e Officina cambiano; *(2)* l'errore deve **sapere da quale via viene** — oggi `stato: \"errore\"` è uno solo, e in Studio l'errore del ritorno da Microsoft sta in cima mentre quello di credenziali sbagliate sta sul form: indistinti, un accesso dipendente fallito colorerebbe di rosso il campo password, cioè la cosa sbagliata da dire a chi ha sbagliato tutt'altro; *(3)* il **logo Microsoft** è un marchio di terzi a quattro colori fissi e come SVG nel registry violerebbe la regola 3 — entra come **nodo passato dall'app**, non come file nostro, e il bottone nero di Studio e il bottone primario di oggi vanno pareggiati in un trattamento solo; *(4)* il **campo nascosto** di `/registrati` è un honeypot anti-bot, **resta alla pagina** e non si assorbe per distrazione. L'errore si mostra con `Alert variant=\"destructive\"`, mai con un testo tinto `text-destructive`: è la seconda trappola del `CLAUDE.md`, e in M3.2 il gate l'ha presa a 3.52:1."
- **File**: *modificati* — `registry/tassullo/pages/pagina-login.tsx`, `pagina-login.stories.tsx`, `registry.json`, `public/r/tassullo-pagina-login.json`, `docs/SPEC-AUTH.md` (i quattro punti passano da «aperti» a «risolti così»).
- **Verifiche mie**: **la non-regressione, ed è la verifica che conta**: a parametri invariati le scene esistenti di `Pagine/Login` rendono lo stesso albero di oggi — confronto del DOM serializzato, **0 differenze**. · `test:a11y` **1356 → 1376** (5 scene: credenziali, entrambi, errore di credenziali, errore di ritorno da Microsoft, via locale spenta), **0 violazioni**, in chiaro **e** in scuro: `variant: link` è il precedente che insegna che un difetto può esistere in una modalità sola. · `npm run check:contrast` verde 48/48: l'errore sul form non deve introdurre una coppia nuova. · `npm run check` verde; item invariati (**88**).
- **Verifiche di Francesco**: nella via «entrambi», l'ordine sulla pagina dice che le credenziali sono la via principale e l'SSO quella secondaria, sì o no? · Le parole dei due errori sono distinguibili da chi le legge — uno dice «email o password non corretti», l'altro «il rientro da Microsoft non è andato a buon fine» — sì o no? · Il bottone Microsoft col logo passato dall'app si vede come lo stesso comando del bottone di oggi, sì o no? · `Invio` dal campo password invia il form? — **la dichiari tu**.
- **Sub-agenti**: **no**. Quattro punti d'API che cambiano la firma di una pagina già installata: è esattamente il lavoro che non si delega.

**M4ter.5 — Le cinque schermate d'accesso di Studio, composte (1 sessione)**

- **Obiettivo**: una story mostra **le cinque schermate d'accesso** oltre al login — registrazione in tre passi, esito, password dimenticata, reimposta, verifica email — composte con quello che c'è, e i passi usano lo `stepper` adottato in M4ter.1.
- **Prompt**: "Qui non si scrive nessun componente: si **dimostra** che le cinque schermate compongono, perché oggi nessuno, aprendo Storybook, saprebbe che si fa così — ed è la stessa ragione per cui esiste la story della lista a due facce. Verificato elemento per elemento sulle pagine vere il 2026-09-19: **il guscio di `pagina-login` è identico su tutte e cinque**, e dentro ci va `Field`+`Input`+`Button`, con `Empty` per gli esiti e `Alert` per gli avvisi. Passo 2 della registrazione: le tre card selezionabili (impresa / studio di progettazione / libero professionista) sono **`FieldLabel` che avvolge un `radio-group`** — `field.tsx:107` porta già `has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border` e `has-data-checked:border-primary/30 has-data-checked:bg-primary/5`, cioè **la scelta a card è dentro la primitiva e si accende da sé**; Nome+Cognome affiancati e Città/Provincia/CAP in riga sono **`Field orientation=\"responsive\"`** (`field.tsx:60`), che impila su stretto e affianca su largo da solo. Passo 3: `Field orientation=\"horizontal\"` + `Checkbox` + `FieldDescription`, e `field.tsx:58` allinea già la casella in cima quando il testo va a capo. **Il gating non è un componente** — «non passare al passo 2 finché non valida» dipende da quali campi ha quel passo, e nessun blocco può saperlo: resta codice della pagina, e la story lo scrive come tale, dichiarandolo. La barra dei passi è **`@reui/stepper`**, composto, non riscritto. **E non è lo stepper il misuratore di robustezza della password**: quello somiglia alla barra dei passi ma non lo è — lo stepper è un `tablist` di `tab` cliccabili, il misuratore non si naviga e non si seleziona. È la trappola del `CLAUDE.md` («il nome dice la funzione, non l'aspetto»), ed è **deciso da Francesco il 2026-09-19: il misuratore resta dell'app**, occorrenza singola, codice di pagina."
- **File**: *creati* — `registry/tassullo/pages/pagina-login.stories.tsx` si estende, oppure una story trasversale in `stories/` se le scene sono troppe per un file solo (la scelta va a verbale). *Modificati* — `docs/SPEC-AUTH.md` (§2 passa da «va implementato» a «fatto, e qui sono le scene»).
- **Verifiche mie**: `test:a11y` **1376 → 1404** (7 scene: registrati 1, 2, 3, esito, password dimenticata, reimposta, verifica email), **0 violazioni** in tutte e quattro le passate. · **Zero componenti nuovi**: `check:registry` deve restare a **1 componente nostro** e **88 item** — se il conto sale, qualcosa è stato scritto che si poteva comporre. · Le tre card selezionabili del passo 2: lo stato «scelta» **letto dal DOM** (`data-checked`) e non dedotto dall'aspetto. · `npm run check` verde.
- **Verifiche di Francesco**: le parole delle cinque schermate sono quelle che vuoi che leggano i professionisti che si registrano — non quelle di Studio ricopiate, se non ti convincono — sì o no? · Al passo 2, guardando la schermata, si capisce **quale** delle tre card è scelta senza doverci passare sopra, sì o no? · La barra dei passi dice «sono al secondo di tre» a colpo d'occhio, sì o no? · Dal campo email si arriva al bottone «Avanti» con `Tab` in un numero ragionevole di colpi? — **la dichiari tu**.
- **Sub-agenti**: **no**.

**M4ter.6 — `useSoglia` e la lista a due facce (1 sessione)**

- **Obiettivo**: esiste un hook che dice se la finestra supera una soglia **dichiarata dalla pagina**, partendo da mobile e non da scrivania; e una story mostra una lista a nove colonne che su schermo largo è una tabella e su schermo stretto è un elenco di schede.
- **Prompt**: "Il bivio tabella/schede lo fanno oggi **sei pagine in due app**, in due modi diversi. Tredici elementi su quattordici sono già nel registry (verificato sul Triage di Officina): manca il **bivio** e manca la **ricetta**. `useSoglia('(min-width: 1024px)')` su `useSyncExternalStore`, una ventina di righe, **e la query la dichiara la pagina**, che è l'unica a sapere quante colonne ha quella lista. **`use-mobile.ts` non si tocca**, e le ragioni sono due, entrambe misurate: i suoi 768px governano l'**arredamento** — sidebar e dialogo devono cambiare allo stesso pixel, e `responsive-dialog.tsx:105-122` motiva perché («un'interfaccia che cambia grammatica a 40px di distanza si legge come un guasto») — mentre il bivio tabella/schede è **contenuto**; e `useIsMobile` legge `matchMedia` in un `useEffect` che chiama `setState`, quindi **il primo render torna sempre `false`, cioè scrivania**: su un dialogo non morde (al primo render è chiuso), su una lista sì — sul telefono disegnerebbe la tabella a nove colonne e la sostituirebbe un fotogramma dopo. Officina l'ha già risolto così, `useDesktop()` parte da mobile apposta. Inoltre: **`check:registry` non guarda `hooks/`** — scandisce `ui/`, `blocks/`, `pages/`, `lib/` — e il primo hook nostro ci entrerebbe cieco: il task estende il gate anche lì, con la stessa regola dei blocchi (regola 3 sola, nessuna riga in `componenti-propri.json` perché un hook non sta al posto di una primitiva). La story è la metà che vale di più: **le due facce non sono la stessa lista impaginata due volte** — la tendina diventa chip (`toggle-group` a scelta singola, che è il default di Base UI), la miniatura sparisce, il bottone cambia taglia. Nessun blocco può indovinarlo dalle `colonne`: **la faccia stretta la scrive la pagina**, e il registry dà solo il bivio. Un attrito da dire prima e non scoprire dopo: il dettaglio si apre da un posto diverso — in Officina si clicca la foto, mentre `data-table` con `pannelloRiga` antepone da sé una colonna col chevron (`data-table.tsx:3157`) che non si sostituisce. Adattamento accettabile, da scrivere nella story."
- **File**: *creati* — `registry/tassullo/hooks/use-soglia.ts`, e la story della lista a due facce (in `stories/`, perché è trasversale e non appartiene a un componente). *Modificati* — `scripts/check-registry.ts` (impara `hooks/`), `registry.json`, `public/r/*`.
- **Verifiche mie**: **il primo render parte da mobile** — provato montando la story a 375px e leggendo il DOM **al primo fotogramma**: ci deve essere l'elenco di schede, mai la tabella. È la verifica che distingue `useSoglia` da `useIsMobile`, e se non si prova non si sa. · Il passaggio fra le due facce **misurato in Chromium vero e a pagina ferma**: la colonna transisce, e in M3.2 una lettura presa durante la transizione usciva **sfasata di una misura** (§32). · `test:a11y` **1404 → 1416** (3 scene: faccia larga, faccia stretta, soglia dichiarata diversa), 0 violazioni. · `check:registry` vede `hooks/` — e l'autotest: un valore arbitrario messo a mano in un hook deve far **fallire** il gate. · `npm run check` verde; `registry.json` **88 → 89 item**.
- **Verifiche di Francesco**: a 1024px il salto fra le due facce si legge come una scelta e non come un guasto, sì o no? · Sulla faccia stretta si fanno le stesse cose che sulla larga — filtrare, aprire il dettaglio — senza girarci intorno, sì o no? · Nove colonne a 1024px sono ancora leggibili, o la soglia di quella lista va più in alto?
- **Sub-agenti**: **no**.

**M4ter.7 — `tassullo-indicatori`, e le due prop di sola forma (1 sessione)**

- **Obiettivo**: la fila di indicatori è un item installabile da sola; `pagina-scheda` accetta una `descrizione` sotto il titolo; e l'ultimo livello del percorso accetta un contatore accanto al nome.
- **Prompt**: "Tre cose che oggi costringono a riscrivere, e nessuna delle tre richiede una decisione. **(1)** `RigaIndicatori` è una funzione **non esportata** dentro `pagina-dashboard.tsx:210`, e l'item spedisce un file solo: tre file in tre app fanno la stessa cosa (Anagrafe AdminBC, Studio Admin e RadarOpere) e nessuna può installarla. Si scorpora in `tassullo-indicatori`, e `pagina-dashboard` la **ricompone** invece di tenerne una copia — se restano due sorgenti la fatica è sprecata. Attenzione a un difetto muto già pagato in M4.4: `Card size=\"sm\"` porta `group-data-[size=sm]/card:text-sm`, che vince su `text-2xl` e fa rendere il numero a **13px invece di 27**; si misura, non si guarda. **(2)** `pagina-scheda` ha `titolo` e non `descrizione`: nove pagine di Studio la vogliono. Prop facoltativa, `ReactNode`, sotto il titolo. **(3)** `LivelloPercorso.titolo` è una **`string`** (`page-header.tsx:117`), quindi il contatore accanto all'intestazione — `Segnalazioni da smistare · 4`, che Officina fa in Triage, Ricambi e Piani — non ci sta. Diventa `ReactNode`. Le due strade erano «il numero va fra le azioni» o «`titolo` diventa `ReactNode`»: la seconda, perché il numero appartiene al nome della pagina e non ai comandi, e perché `ReactNode` non toglie niente a chi passa una stringa."
- **File**: *creati* — `registry/tassullo/blocks/indicatori.tsx`, `indicatori.stories.tsx`. *Modificati* — `registry/tassullo/pages/pagina-dashboard.tsx` (ricompone, non duplica), `pagina-scheda.tsx` e la sua story, `page-header.tsx` e la sua story, `registry.json`, `public/r/*`.
- **Verifiche mie**: **nessuna copia rimasta**: il corpo di `RigaIndicatori` non esiste più in `pagina-dashboard.tsx` — verificato a grep, non a vista. · Il numero dell'indicatore **misurato dal DOM a 27px** dentro `Card size=\"sm\"`, che è il difetto muto di M4.4. · `test:a11y` **1416 → 1440** (6 scene: 4 su `Blocchi/Indicatori`, 1 su `Pagine/Scheda` con descrizione, 1 su `Blocchi/PageHeader` col contatore), 0 violazioni. · **Non-regressione**: le scene esistenti di `Pagine/Dashboard` rendono lo stesso albero di prima dello scorporo, **0 differenze**. · `npm run check` verde; `registry.json` **89 → 90 item**, e `registryDependencies` di `tassullo-pagina-dashboard` aggiornate — è la classe di difetto che M4.6 ha trovato 26 volte.
- **Verifiche di Francesco**: la fila di indicatori, installata da sola in una pagina che non è la dashboard, sta in piedi da sé, sì o no? · La descrizione sotto il titolo della scheda aggiunge o rumoreggia — guardandola su una scheda vera con `distintivo` e azioni? · Il contatore accanto al nome della pagina si legge come «quanti ce ne sono» e non come una parte del nome, sì o no?
- **Sub-agenti**: **no**.

**M4ter.8 — Il piede della tabella, la conferma digitata, il chip col conteggio (1 sessione)**

- **Obiettivo**: `data-table` rende una riga di totali in coda che **segue il filtro**; `ConfirmDialog` restituisce a chi lo chiama il testo che si è digitato; e la story di `toggle-group` mostra il chip-filtro col conteggio.
- **Prompt**: "Le tre che hanno logica dentro, e per questo stanno insieme e non con le prop di forma di M4ter.7. **(1) Il piede.** `data-table` non usa **mai** `TableFooter`, e `meta.sottototale` scatta solo dentro `riga.subRows.length`, cioè sui gruppi: un totale in coda a una tabella filtrabile oggi non si scrive. Prop `piede`, e **va messa in due rami di render** — la tabella normale (`data-table.tsx:2137`) e quella virtualizzata (`:2560`) — o funziona in una e non nell'altra, che è il modo peggiore di rompersi. E **deve seguire il filtro**: il totale di una tabella filtrata è il totale delle righe che si vedono, o il numero mente. **(2) La conferma digitata.** `ConfirmDialog` manca su due fronti: non ha un **corpo** (oggi `descrizione` finisce in `AlertDialogDescription`, cioè nell'elemento di `aria-describedby` — un campo di testo lì dentro è sbagliato, e non per formalismo: è il testo che il lettore di schermo annuncia come *descrizione* del dialogo), e `onConferma: () => void | Promise<unknown>` **non restituisce il valore digitato**. Servono un corpo distinto dalla descrizione e una firma che porti fuori ciò che si è scritto. Il caso vero è ChangeSets di Anagrafe, che oggi usa `window.prompt`. **(3) Il chip col conteggio.** La forma manca, il conteggio no: `useOpzioniSfaccettate` esiste ma vuole un'istanza TanStack, quindi senza tabella non si usa. Non serve un componente: serve **una scena in più** nella story di `toggle-group` che mostri come si scrive il numero dentro il chip. Attenzione a non confondere il pattern: Officina usa **badge cliccabili** col numero nel testo, che è una forma diversa e non è questa."
- **File**: *modificati* — `registry/tassullo/blocks/data-table.tsx` e la sua story, `confirm-dialog.tsx` e la sua story, `registry/tassullo/ui/toggle-group.stories.tsx`, `registry.json`, `public/r/*`.
- **Verifiche mie**: **il piede segue il filtro**: si filtra da codice nella story e si legge il totale dal DOM prima e dopo — due numeri diversi, ed entrambi giusti rispetto ai dati. · Il piede c'è **in tutti e due i rami**: provato con la virtualizzazione accesa e spenta. · `ConfirmDialog`: il campo di testo **non** sta dentro l'elemento di `aria-describedby` — letto dal DOM; e il valore digitato arriva a chi ha chiamato, provato con uno spia. · `test:a11y` **1440 → 1456** (4 scene), **0 violazioni**, e le due scene del dialogo vanno misurate **a popup aperto e chiuso**: in M2.6 un `button-name` *critical* esisteva solo in uno dei due stati. · `npm run check` verde; item invariati (**90**).
- **Verifiche di Francesco**: il totale in coda si legge come un totale e non come un'altra riga di dati, sì o no? · Nella conferma digitata, la parola da scrivere è chiara prima di scriverla, sì o no? · Il chip col conteggio si distingue da un badge — cioè si capisce che si clicca — sì o no?
- **Sub-agenti**: **no**.

**M4ter.9 — `tassullo-barra-contesto` (1 sessione)**

- **Obiettivo**: esiste un blocco che mostra l'entità attiva che attraversa le pagine e lascia cambiarla da un menu, e a differenza della versione scritta a mano si chiude con `Esc`, prende il fuoco da tastiera e si chiude cliccando fuori.
- **Prompt**: "Composizione pura, gradino 2: `item` (`ItemMedia variant=\"icon\"` + `ItemContent` + `ItemActions`) più `dropdown-menu`. Cinque pagine di Studio montano oggi una barra a mano — Computo, TaskCalcoloStrutturale, AnalisiCapitolato, AnalisiProdotto, TaskSearch — e quello che ci guadagnano passando al registry è esattamente ciò che una `div` con un menu a mano non ha: `Esc`, il fuoco da tastiera, il clic fuori. **L'emoji 📍 non entra**: la disegna il sistema operativo, ed è la stessa obiezione con cui si è chiusa D19 sul `<select>` nativo — un elemento che appare diverso a seconda della macchina è l'opposto di un design system. Icona Lucide. **La pagina se lo monta**, come oggi: lo slot in `app-shell` è il candidato sospeso, e resta sospeso — l'innesco scritto in `CHECKLIST.md` è «quando una seconda app ha un contesto attivo che attraversa le pagine», e oggi Anagrafe e Officina un contesto del genere non ce l'hanno."
- **File**: *creati* — `registry/tassullo/blocks/barra-contesto.tsx`, `barra-contesto.stories.tsx`. *Modificati* — `registry.json`, `public/r/*`.
- **Verifiche mie**: `test:a11y` **1456 → 1472** (4 scene), **0 violazioni**, e la story **dichiara il proprio popup** con una `play` da `@/prove/apri` — il grilletto si passa come **selettore** e lo slot **si guarda nel DOM**: `combobox` e il menù utente del guscio si compongono allo stesso modo e finiscono con slot opposti. · `Esc`, clic-fuori e ritorno del fuoco al grilletto **misurati in Chromium vero**: nel pannello del browser dell'app `requestAnimationFrame` non scatta e Base UI ci schedula dentro lo spostamento del fuoco, quindi un popup sano sembrerebbe morto. · `npm run misura:bersagli`: la barra è una riga cliccabile, e in touch deve stare sopra soglia. · `npm run check` verde; `registry.json` **90 → 91 item**.
- **Verifiche di Francesco**: la barra dice **su cosa stai lavorando** senza rubare la scena alla pagina, sì o no? · L'icona Lucide al posto dell'emoji dice la stessa cosa, sì o no? · Il menu si apre da tastiera e `Esc` lo chiude riportando il fuoco dov'era? — **la dichiari tu**.
- **Sub-agenti**: **no**.

**M4ter.10 — Gate di fase: l'installazione cronometrata e la mappa richiusa (1 sessione)**

- **Obiettivo**: un'app Vite vuota installa gli otto item nuovi e compila; e la tabella §1 di `docs/ANALISI-COPERTURA-APP.md` è ripercorsa riga per riga, ognuna col nome dell'item che la copre.
- **Prompt**: "Due mezze giornate in una. **La prima è l'installazione vera**, e si fa come M4.6: app Vite usa-e-getta, `shadcn init`, `add` degli item nuovi, **cronometro acceso**. Non è zelo: quel gate trovò **26 `registryDependencies` rotte su 12 item** — il registry pubblico era ininstallabile per ogni blocco con dipendenze interne — due prerequisiti mai documentati e quattro blocchi che rompevano `tsc` con `process.env.NODE_ENV`. `registry validate` era verde su tutti. Qui c'è in più una classe che in M4.6 non esisteva: gli item che **ridistribuiscono file di reui**, che vanno provati da un'app che `@reui` **non** ha dichiarato — è il caso di ogni app dello studio. Se ci vuole più di dieci minuti, il problema è nella documentazione o nei `registryDependencies`, e si corregge lì. **La seconda è la mappa**: si riprende la tabella §1 dell'analisi, dodici righe «da fare», e per ognuna si scrive l'item che la copre; le righe «coperte» si ricontrollano a campione. Quello che non si chiude si annota con chi lo prende in carico — una lacuna senza un nome accanto è una lacuna che si riscopre da zero, ed è già successo con `native-select`, analizzato due volte prima di diventare D19."
- **File**: *modificati* — `docs/ANALISI-COPERTURA-APP.md` (§1 con la colonna «chiuso da»), `CHECKLIST.md`, `WORKLOG.md`, e qualunque item la prova d'installazione dimostri rotto.
- **Verifiche mie**: **cronometro**, numero a verbale, confronto con i **6m30s** di M4.6. · L'app di prova **compila** (`tsc -b` e build di produzione) e si vede in stile. · Gli item reui installati in un'app che **non dichiara `@reui`**: o funzionano, o il difetto si corregge qui. · `registry validate` verde su **91 item**; `list` li elenca tutti. · `npm run check` verde sui cinque; `test:a11y` **1472 scansioni, 0 violazioni**. · `npm run misura:bersagli` sull'intero set, col controllo dello strumento (bottone a 48px in touch), e il conto dei bersagli piccoli confrontato con quello di M1.6 (1988 bersagli, 217 story, **0 piccoli in entrambe le direzioni**): il numero nuovo va a verbale, perché è la sola misura che dice se la fase ha introdotto qualcosa che col guanto si manca.
- **Verifiche di Francesco**: dieci minuti sono stati abbastanza, sì o no? · Delle dodici righe «da fare», quante consideri davvero chiuse guardando l'item che le copre? · C'è una pagina delle tue tre app che, dopo questa fase, **ancora** non sapresti ricomporre?
- **Sub-agenti**: **no**. Il cronometro non si delega: una misura presa da due mani non è la misura.

**M4ter.11 — Revisione a video: tutto quello che resta da guardare (1 sessione)** — aggiunto in coda alla fase il 2026-09-21, su indicazione di Francesco, dopo la revisione a video del gate M4ter.10. Ragione dichiarata: **la FASE 5 è documentazione e chiusura**, e le modifiche alle story non ci stanno dentro — portarcele significherebbe scrivere la guida di migrazione mentre i blocchi che nomina cambiano ancora forma.

- **Obiettivo**: chiudere l'arretrato di revisione accumulato da M4ter.7 a M4ter.10 — cinque difetti misurati, sette scelte di forma che vuole vedere Francesco, una decisione di sistema e una riga di documentazione — e finire con la **domanda che il gate non ha potuto chiudere**: quali pagine delle tre app restano non ricomponibili.
- **Prompt**: "Non si aggiungono componenti. Si correggono difetti già misurati e si chiudono scelte di forma che aspettano un occhio. **I difetti**, in ordine di quanto mordono: (1) il mese del calendario si **schiaccia sotto gli ~880px** di contenitore — celle da 127px contro un passo di riga che si accorcia, chip dell'evento sopra i numeri del giorno per **20×12px**, identico nel montaggio giusto e in quello sbagliato; la story promette che il mese *scorre* e invece fa tutt'e due, con 51px di scorrimento su ~270 necessari. Le due vie sono: o scorre davvero (il contenitore deve offrire `6 × 127 + testata`, non l'altezza compressa), o sotto soglia si passa all'**agenda**, che è il bivio che la pagina già dichiara. **Un avviso in sviluppo non è una via**: scatterebbe anche sulla forma corretta. (2) I **4px** fra i due tipi di chip del mese — la barra di tutto il giorno è agganciata a `--ec-month-bar-h` (32−2=30, alzata in M4ter.2 per gli avatar), il chip con orario non ha altezza e si dimensiona sul contenuto (26). La leva per allinearli c'è già. (3) `ui/chart.tsx` fa `toLocaleString()` **senza locale**: in en-US un valore di quattro cifre esce `2,086.93`. È una firma di chiamata, cioè forma, e `check:registry` rifiuta di correggerla lì: la via è `formatter` sul `chartConfig`, che la pagina passa da sé. (4) `altezzaMax` su `Blocchi/Data Table → Virtualizzata` è **non-deterministico** — `max-height: 448px` compare 2 volte su 4 sulla stessa build: si isola o si dichiara. (5) Il **taglio dei valori lunghi negli indicatori**, fascia 384–448px di contenitore: `€ 12.847.503,40` sborda dalla `Card`; il rimedio è `valore` formattato dal chiamante con `valuta` di `lib/numeri`. **Le scelte di forma**, tutte da guardare a video e tutte con l'alternativa già costruibile: il **contatore del percorso** (testo attenuato o `Badge`); la prop **`descrizione`** di `pagina-scheda` (aggiunge o rumoreggia); il **totale in coda alla tabella**; la **conferma digitata** su un caso vero come ChangeSets; il **chip col conteggio** accanto a «Filtri» contro un `badge`; se la **barra di contesto rubi la scena** alla pagina (`Blocchi/Barra di contesto → Nel guscio`); e se l'**icona Lucide** dica quello che diceva l'emoji. **La decisione di sistema**: la **tavolozza estesa** (10–15 colori per grafici, calendario e categorie), che il piano dava «da decidere in coda alla FASE 4ter» ed è già innescata due volte — Officina usa il **rosso** per «Guasto» e nei cinque `--chart-*` il rosso non c'è; e il misuratore di robustezza della password non ha un fondo per la banda intermedia. La domanda vera è di sistema e va risposta prima di scegliere le tinte: **le tinte di categoria hanno bisogno di 4.5:1 come i token di testo, o bastano a fondo e si misura il testo sopra?** Ogni tinta nuova va in chiaro **e** in scuro e passa da `check:contrast`, che oggi sono 48 coppie. **La riga di documentazione**: `cn`/tailwind-merge risolve `m-0` contro `mx-2` tenendo **l'ultimo scritto**, quindi `mx-2 m-0` fa sparire `mx-2` dal DOM **senza errore** — trappola muta della famiglia di `text-md`, misurata in M4ter.10, da mettere fra le trappole del `CLAUDE.md`."
- **File**: *modificati* — `registry/tassullo/blocks/calendario.tsx`, `registry/tassullo/blocks/indicatori.tsx`, `registry/tassullo/blocks/data-table.tsx` e le story toccate; `CLAUDE.md` (§trappole); `scripts/hex-to-oklch.ts` **solo se** la tavolozza si apre; `CHECKLIST.md`, `WORKLOG.md`.
- **Verifiche mie**: ogni difetto **rimisurato dopo la correzione**, con lo stesso strumento che l'ha trovato — il calendario in un browser vero e a pagina ferma (§32), gli indicatori sulla fascia 384–448 di **contenitore** e non di finestra (§46). · Il calendario: **0px di sovrapposizione chip/numero** a tutte le altezze provate, o l'agenda al posto del mese sotto soglia, dichiarato per iscritto quale delle due. · `npm run check` verde sui **sette**; `test:a11y` **1496** scansioni e **0 violazioni** se non si aggiungono scene, e il conto nuovo dichiarato se se ne aggiungono. · `misura:bersagli` col controllo dello strumento, base **3246 su 374 story, 0 piccoli**. · `registry.json` **94 item invariati** e `componenti-propri.json` **fermo a 1**: è una sessione che non aggiunge componenti. · Se la tavolozza si apre, `check:contrast` verde sul numero **nuovo** di coppie, dichiarato.
- **Verifiche di Francesco**: le sette scelte di forma, una per una, a video. · La tavolozza: si apre o resta sospesa? · **E la domanda che M4ter.10 non ha potuto chiudere, che è il vero motivo di questa sessione: c'è una pagina delle tre app che ancora non sapresti ricomporre?** Se sì, quale e cosa le manca — perché una lacuna senza un nome accanto è una lacuna che si riscopre da zero, ed è già successo con `native-select`.
- **Sub-agenti**: **no**.

**M4ter.12 — Il Computo di Studio: il fuoco di cella su un modello ad albero (1 sessione)** — aggiunto il 2026-09-21, in coda a M4ter.11, con l'innesco già scattato. Ragione dichiarata: è **l'unica pagina delle tre app che non si sa ricomporre**, accertata percorrendola elemento per elemento (`docs/ANALISI-COPERTURA-APP.md` §8.3), e non è lavoro da coda di fase — è un terzo modo di navigare una tabella, con un gate da tastiera suo.

- **Obiettivo**: decidere — e se la decisione lo chiede, costruire — il modo in cui una griglia **a due livelli** si scrive da tastiera. Il Computo di Studio è voce-madre, righe di misurazione figlie, un «Sommano» per voce e un totale generale, con **tutte** le celle dei due livelli editabili.
- **Prompt**: "Il difetto è accertato e scritto, non si ridiagnostica: `data-table` dà l'albero (`getSottoRighe`, M3bis.1) e il sotto-totale (`meta.sottototale`), ma la sua tastiera è **di riga**; `data-grid` dà la tastiera **di cella** e ha `getSottoRighe` **`Omit`**-tato dalle proprie props, perché naviga **per indice sull'array piatto del motore** mentre TanStack appiattisce l'albero in un ordine che quell'array non ha. Il file lo dice a verbale, e nomina persino il caso: «un computo con voci-madre e voci-figlie editabili resta quindi fuori da questo blocco». **La prima mezza giornata non si scrive codice**: si legge il Computo vero da un clone usa-e-getta via SSH (`git clone --depth 1 git@github.com:tassullo/studio.git`, fuori dal repo, sola lettura, cancellato a fine sessione — la strada decisa in M4ter.9, perché `gh api` non arriva più ai `contents`), e si misura **quanto** albero serve davvero: quante voci ha un computo tipico, quante misurazioni per voce, se le righe figlie si riordinano, se si incolla da un foglio di calcolo dentro un gruppo. Poi si sceglie fra le **tre strade già elencate in §8.3**, che qui si pesano coi numeri invece che a memoria: (1) **appiattire il dato** — una riga per misurazione, la voce in una colonna di gruppo, il «Sommano» come riga vera del motore: costa **zero** al registry e cambia la forma del computo, quindi si chiede a chi lo usa e non si decide qui; (2) **dare a `data-grid` un indice che segua l'albero** invece dell'array del motore: è la correzione giusta ed è la più cara — tocca tastiera, `scrollToIndex`, incolla e riempimento, tutti scritti su «riga N = `motore.righe[N]`»; (3) **un blocco terzo**, che è il gradino 4 della regola 4bis: si **propone**, non si scrive. Qualunque strada si prenda, il criterio è uno: **la tastiera si misura in Chromium vero**, perché è D15 di nuovo — una griglia completamente non navigabile dà zero violazioni ad axe."
- **File**: *era da decidere in sessione*. **Esito 2026-09-22: nessuna delle tre come erano scritte — si è fatta la (3).** *Nuovi*: `registry/tassullo/blocks/foglio-gruppi.tsx` e `foglio-gruppi.stories.tsx`. *Modificati*: `registry/tassullo/blocks/data-table.tsx` (prop `bordiColonna`) e la sua story, `scripts/gate-a11y.ts` (il blocco ha un popup e va in `CON_POPUP`), `registry.json`, `public/r/`, `CHECKLIST.md`, `WORKLOG.md`, `docs/DECISIONI.md` §50, `docs/ANALISI-COPERTURA-APP.md` §8.3bis. **Non toccato**, e a verbale: `registry/tassullo/ui/input.tsx` — la correzione anti-zoom è **proposta**, non presa.
- **Il punto di partenza, misurato il 2026-09-21 e non ricordato**: `registry.json` **94 item** · `componenti-propri.json` **1** · `npm run check` uscita **0** sui sette · `test:a11y` **1496 scansioni su 374 story, 0 violazioni** · `misura:bersagli` **3244 bersagli su 374 story, 0 piccoli in entrambe le direzioni**, strumento a 48px · `build` e `lint` verdi con **26 avvisi**, tutti preesistenti. Il tema porta `--chart-1..10` e **zero** `chart-mono`.
- **Cosa NON è di questo task, e sta scritto perché non ci finisca dentro**: i `window.confirm`/`window.prompt` ancora vivi in Anagrafe sono lavoro di **migrazione** e stanno nel prompt di **M5.5**, non qui; e lo **slot della fascia** in `app-shell` (quello fra testata e `<Outlet/>`, da non confondere con `AppShell.contesto`, che è nella testata della **colonna** ed è stato aggiunto in M4ter.11) resta differito con l'innesco non scattato. `WORKLOG.md` li elenca accanto al Computo perché sono tutti e tre aperti, non perché siano la stessa sessione: questo task ha **una domanda sola**, e infilarci tre liste la annacqua.
- **Verifiche mie**: la tastiera provata **in Chromium vero** su un albero a due livelli — `Tab` entra una volta sola, le frecce si muovono per cella e **saltano correttamente fra i livelli**, `Invio` apre la modifica, `Esc` la annulla riportando il fuoco alla cella. · **Incolla e riempimento** su una selezione che attraversa due livelli: o funzionano, o è scritto a verbale che non compongono. · `npm run check` verde sui sette; `test:a11y` e `misura:bersagli` col conto nuovo dichiarato se si aggiungono scene. · Se si propone un blocco terzo, `registry/componenti-propri.json` **non si tocca** finché Francesco non ha detto di sì.
- **Verifiche di Francesco**: quale delle tre strade, e perché. · Se è la (1): il computo piatto è accettabile per chi lo usa davvero, o si perde qualcosa? · Se è la (2): la spesa vale la pena adesso, o il Computo resta sul v1 e si riapre quando Studio decide di migrare?
- **Sub-agenti**: **no**, salvo la ricognizione in sola lettura sul clone di Studio.

---
### FASE 5 — Registry, distribuzione e guida di adozione — 6 sessioni

Obiettivo: il registry validato e installabile, **e la documentazione che ne permette l'adozione senza assistenza** — la parte che nel v1 ha funzionato meglio di tutte, e che qui pesa di più perché il v2 non si adotta con due `@import` ma con una CLI, una convenzione di token diversa e delle regole nuove.
Gate: l'installazione in un'app vergine produce un'app in stile Tassullo che compila — **verificata in locale, prima di qualunque pubblicazione** — seguendo solo i documenti scritti qui.
Dipendenze: FASE 4.

**M5.1 — `registry.json` completo (1 sessione)**
- Prompt: "Completa `registry.json`: un item per tema, primitiva, blocco e pagina modello, con `target` espliciti perché i file atterrino nei path giusti dell'app consumer, `dependencies` npm corrette e `registryDependencies` coerenti. Verifica con `npx shadcn@latest registry validate ./registry.json` e `npx shadcn@latest list ./registry.json`."
- Accettazione: validate verde, `list` elenca tutti gli item attesi.

**M5.2 — Prova d'installazione end-to-end (1 sessione)**
- Prompt: "App Vite usa-e-getta in una cartella temporanea: `npx shadcn@latest init`, poi `add` del tema e di un blocco dal registry locale, prima con `--dry-run` poi reale. Verifica che i file atterrino dove devono, che i `cssVars` entrino nel CSS globale, che l'app compili e si veda in stile Tassullo. Ogni attrito d'uso va in WORKLOG: è il primo collaudo dell'esperienza di adozione."
- Accettazione: app di prova compilata e in stile; lista attriti nel worklog.

**M5.3 — `INTEGRAZIONE.md` v2: agganciare una app nuova (1 sessione)**
- Prompt: "Erede diretto dell'`INTEGRAZIONE.md` v1, con lo stesso spirito e lo stesso taglio: **autosufficiente**, leggibile da chi non conosce la storia del progetto, e pensato per essere incollato nel piano di sviluppo della nuova app. Contiene: §Contesto (cos'è il design system, dove vive, perché non c'è un registry npm); §Task di setup della fase iniziale, numerati e cronometrati come nel v1 (scaffold Vite+React+TS → Tailwind v4 → `shadcn init` → **registry Tassullo dichiarato in `components.json`** → **MCP shadcn installato** con `npx shadcn@latest mcp init --client claude` e Claude Code riavviato → `add` del tema **prima di scrivere la prima pagina** → eliminare i CSS demo del template → `data-density=\"touch\"` se l'app si usa in campo → verifica che la pagina vuota abbia lo sfondo giusto). Il passo MCP non è un accessorio: senza, chi sviluppa deve ricordare a memoria cosa contiene il design system, ed è così che si finisce a riscrivere un componente che esisteva già. Con l'MCP configurato sul registry Tassullo, i componenti dello studio si cercano per nome e si installano parlando; §Da dove partire (le pagine modello della FASE 4, con il comando esatto); §Densità e dark mode; §Se l'app avrà un'identità visiva diversa (si ridefiniscono solo i token brand, mai il pacchetto)."
- Accettazione: seguendo **solo** questo documento, senza altre spiegazioni, si porta un'app Vite vuota a una pagina in stile Tassullo; il tempo effettivo è annotato in WORKLOG.

**M5.4 — Le regole da mettere nel `CLAUDE.md` e nei piani delle app (1 sessione)**
- Prompt: "La parte del v1 che ha funzionato meglio: il blocco di regole da copiare **tal quale** nel `CLAUDE.md` dell'app, perché serve a mantenere l'aggancio nel tempo, non solo al setup. Riscrivilo per il v2 — la regola cambia natura: non più 'usa solo `var(--…)`, mai hex' ma 'usa i componenti del registry; le utility Tailwind solo sui token del tema; **niente valori arbitrari** tipo `h-[37px]` o `bg-[#F4AC3D]`; i componenti si aggiornano dal registry, non si modificano in casa — e se una variante manca, si propone **qui**, mai localmente per ora'. Aggiungi: la trappola `primary` ≠ `accent` (§0bis); `badge` è un'etichetta che si legge, `toggle-group` è un filtro che si clicca; come si aggiorna (`shadcn add` del singolo item, con il tag); e la regola **'prima di scrivere un componente, chiedilo all'MCP'** — se esiste nel registry Tassullo si installa, non si riscrive. Poi la **voce di manutenzione ricorrente** da mettere nella ROADMAP dell'app, e il paragrafo per la CHECKLIST, sul modello di quelli di Anagrafe."
- File: `docs/INTEGRAZIONE.md` (§Regole), `docs/DECISIONI.md`
- Accettazione: il blocco è copiabile senza adattamenti in un `CLAUDE.md`; `DECISIONI.md` spiega perché non npm, perché Base UI, perché `primary` ≠ `accent`, perché oklch, perché il font non si distribuisce.

**M5.5 — `GUIDA-MIGRAZIONE.md`: portare una app esistente sul v2 (1 sessione)**
- Prompt: "Le app dello studio **non si migrano ora** (vedi §3): questa è la guida che permetterà di farlo quando ognuna deciderà, senza riaprire l'analisi da capo. Contiene, come **passo 0 separato dalla migrazione e da fare subito**, il collegamento dell'MCP: in ogni app esistente si aggiunge un `components.json` minimo che dichiara il registry Tassullo v2 e si esegue `npx shadcn@latest mcp init --client claude`. È additivo e reversibile — non tocca il codice, non tocca gli stili, non richiede Tailwind — e da quel momento chi lavora su Anagrafe può **cercare e leggere** i componenti del v2 mentre sviluppa, invece di riscriverli. Installarli richiederà Tailwind e quindi la migrazione vera; consultarli no. Documenta le due forme dell'indirizzo del registry: percorso di file locale finché il repo è sul Mac, e `tassullo/tassullo-design-system-v2` con il tag quando D4 sarà chiusa. Poi la guida vera e propria: la tabella token v1→v2 e la tabella classe v1→componente v2 (`.btn`→`button`, `.chip`→`toggle-group`, `.badge`→`badge`, `.card`→`card`, `.input`→`field`+`input`, `.alert`→`alert`, `.table`→`data-table`, `.sidebar`→`app-shell`, `.skel`→`skeleton`); la dimostrazione che **i due temi convivono** senza collisioni di nomi (il v1 usa `--color-*`, il v2 `--primary`/`--background`), che è ciò che rende la migrazione incrementale e interrompibile; l'ordine consigliato (Tailwind → tema affiancato → app-shell → una pagina lista e una di dettaglio come piloti → il resto → rimozione del v1, di `.stylelintrc.cjs` e dello step `lint:css`); la regola che ogni pagina migrata è **un commit isolato**, così ci si può fermare a metà con l'app funzionante; e l'avvertenza che se durante una migrazione emerge una lacuna del design system, si corregge **nel registry**, mai nell'app. **E tre voci che M4ter.11 ha trovato leggendo le app vere** (`docs/ANALISI-COPERTURA-APP.md` §8): **(a)** `window.confirm` e `window.prompt` sono ancora vivi in Anagrafe — `ChangeSets.tsx`, «Scrivere queste modifiche su Business Central?» e «Motivo della respinta:» — e `tassullo-confirm-dialog` li copre tutti e due, col campo obbligatorio e con la parola da ricopiare: è **l'unico pattern che si trova a `grep` e si chiude senza ragionare**, quindi va scritto come voce di ricerca-e-sostituzione; **(b)** il **Computo di Studio non si migra al primo giro** e va nominato fra le pagine che restano sul v1 — è in carico a `M4ter.12`, e la migrazione incrementale esiste apposta per poterlo lasciare indietro; **(c)** la soglia del bivio tabella/schede la decide l'app: `useSoglia(query)` non porta un numero, e la guida deve dire **come si sceglie**, non quale usare."
- Accettazione: **passo 0 eseguito davvero su Anagrafe** — `components.json` e `.mcp.json` aggiunti, e dall'MCP si cercano e si leggono gli item del registry Tassullo stando dentro il repo di Anagrafe, senza che una riga del suo codice o dei suoi stili sia cambiata. Poi la guida è verificata **a secco**: si percorre l'elenco delle sue 10 pagine e per ognuna si nomina il blocco che la sostituirà, senza scrivere codice; l'esito, comprese le lacune trovate, va in WORKLOG e alimenta il registry.

**M5.6 — Pubblicazione su GitHub (1 sessione)** — *non più bloccata: D4 è chiusa e il repo è online dal 2026-09-10, pubblico, con Pages attivo. Quello che resta al task è il **tag `v2.0.0`** e la **prova d'installazione dall'esterno**.*
- Prompt: "Solo su via libera di Francesco: repo pubblico `tassullo/tassullo-design-system-v2`, push di `main`, tag `v2.0.0`. Pubblico apposta, come il v1: i CI installano senza token. Il tag fa da lockfile — nessuna app si aggiorna da sola a un push. Verifica dall'esterno con `npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-theme#v2.0.0` in un'app di prova."
Nella stessa sessione: workflow GitHub Actions che a ogni push fa `build-storybook` e pubblica su **GitHub Pages**. Da qui la style guide diventa un URL da mandare a chiunque debba valutare il design, senza che installi nulla.
- Accettazione: install da GitHub riuscita in un'app fuori dal repo; Storybook raggiungibile all'URL di Pages e aggiornato dall'ultimo push.

---

## §1. Mappa del repo (a regime)

```
tassullo-design-system-v2/
  ROADMAP.md  CHECKLIST.md  WORKLOG.md  CLAUDE.md  components.json  registry.json
  registry/tassullo/
    theme/tassullo-theme.css
    ui/            button button-group badge field input input-group select
                   combobox multi-select toggle toggle-group calendar date-picker
                   dialog alert-dialog drawer sheet context-menu hover-card
                   table tabs card empty carousel resizable slider spinner kbd
                   sidebar breadcrumb pagination chart avatar typography …
    blocks/        app-shell/ page-header/ data-table/ form-field/ empty-state/
                   file-upload/ pdf-preview/ version-timeline/ rich-text-editor/
                   diff-view/ split-view/ responsive-dialog/ …
    pages/         pagina-login/ pagina-lista/ pagina-scheda/ pagina-dashboard/
                   pagina-admin/ pagina-errore/          ← pagine modello (FASE 4)
    lib/utils.ts
  .storybook/      main.ts  preview.ts          ← style guide 2.0
  stories/         Palette.stories.tsx  …        (le story dei componenti stanno accanto al file)
  scripts/hex-to-oklch.ts
  docs/            PIANO.md  INTEGRAZIONE.md  GUIDA-MIGRAZIONE.md  DECISIONI.md  archive/
```

Regola shadcn da rispettare ovunque: gli import interni al registry usano **sempre** `@/registry/...`.

## §2. Totali, priorità e percorso critico

**42 sessioni** (5 + 5 + 9 + 11 + 6 + 6) nel piano originale. Percorso critico: FASE 1 (il tema regge tutto il resto) → FASE 2 → M3.3 `data-table` (il blocco più costoso e quello che ripaga di più) → M3.10 gate → FASE 5.

**Aggiornato al 2026-09-21: 69 sessioni** (**M4ter.11** e **M4ter.12** aggiunte in coda alla FASE 4ter il 2026-09-21; la 12 nasce dall'unica pagina che M4ter.11 ha trovato non ricomponibile). Prima, al 2026-09-19: 67. Alle 42 si sono aggiunte la **FASE 3bis** (12 righe = 14 sessioni, `M3bis.5` ne vale 3), **M4.7** in coda alla FASE 4, e la **FASE 4ter** (10). Le due fasi nuove non erano imprevidenza del piano originale: nascono da due cose che si potevano sapere solo guardando — niko-table per la 3bis, la gap analysis delle tre app per la 4ter. Il percorso critico non cambia: la FASE 4ter è **additiva** e non blocca la FASE 5, salvo che M5.5 va scritta **dopo**, o la guida di migrazione nominerebbe blocchi che non esistono ancora.

Al termine il design system è completo, documentato e adottabile, **senza che una riga di Anagrafe, Studio o Officina sia stata toccata**. Le app esistenti continuano a girare sul v1; la prima nuova app parte direttamente sul v2; e quando una delle tre vorrà passare, la guida M5.5 è già scritta.

Due tagli possibili, se si vuole arrivare prima a qualcosa di usabile:
- I sette task **M2.7–M2.8 e M3.6–M3.9** sono i componenti dedotti dalla roadmap *futura* di Anagrafe, non da codice esistente. Rinviabili senza bloccare nulla, al prezzo che la prima app che ne ha bisogno se li costruisca in casa — cioè esattamente il meccanismo con cui le app sono divergite nel v1.
- La **FASE 4** (pagine modello, 6 sessioni) è comodità: senza, una nuova app parte dai blocchi anziché da pagine intere. Rinviabile alla prima app che ne ha bisogno — con il vantaggio di scriverle su un caso reale invece che immaginato.

La taratura è per analogia con la ROADMAP di Anagrafe (assunzione A3).

## §2bis. Mappa dei token: `theme.css` v1 → shadcn

> Scritta in **M1.1** (2026-09-07) leggendo `tassullo-design-system/theme.css` **v1.2.2** (125 righe, 63 token). È la mappa che **M1.2** trasforma in `registry/tassullo/theme/tassullo-theme.css` e **M1.3** replica in modalità scura.
> La conversione degli hex in `oklch` **non si fa a mano**: la fa `scripts/hex-to-oklch.ts`, che è anche il gate di contrasto (`npm run check:contrast`). La palette vive **dentro quello script**, in una sola costante: è la fonte unica, e il CSS è il suo output (`-- --css`). Quando la palette cambia, l'aggiornamento è riproducibile e il contrasto è ricontrollato nello stesso gesto.

### Le due trappole, prima della tabella

1. **`--color-accent` del v1 NON è `--accent` di shadcn.** Nel v1 `--color-accent` **è l'arancio del brand**; in shadcn `--accent` è il **grigio di hover dei menu**, e il brand sta in `--primary`. Tradurre il nome invece della funzione tinge di arancione metà degli hover dell'interfaccia. È l'equivalente v2 della confusione `badge`/`chip` che nel v1 è costata 23 riscritture.
2. **Sull'arancio il testo è nero.** `--primary-foreground` è `#141414`, non bianco: il bianco su `#F4AC3D` dà **1.94:1** ed è la violazione più frequente dalla v1.1.0. Il gate la rileva ed esce con codice 1 (verificato in M1.1, vedi in fondo). Per l'arancio **leggibile come testo** su fondo chiaro esiste un token diverso, `--accent-ink`: `--primary` non è mai usabile per il testo.

### Mappa principale (light) — token che shadcn ha già

| shadcn | hex | token v1 | note |
|---|---|---|---|
| `--background` | `#F6F6F4` | `--color-page-bg` | |
| `--foreground` | `#141414` | `--color-text` | |
| `--card`, `--popover` | `#FDFDFD` | `--color-surface` | |
| `--card-foreground`, `--popover-foreground` | `#141414` | `--color-text` | |
| `--primary` | `#F4AC3D` | `--color-accent` | il brand |
| `--primary-foreground` | `#141414` | `--color-accent-text` | **nero, non bianco** |
| `--secondary`, `--muted` | `#ECEAE8` | `--color-surface-2` | |
| `--secondary-foreground` | `#141414` | `--color-text` | |
| `--muted-foreground` | `#6C6965` | `--color-text-muted` | v1 `#6E6B67`, ΔL 0.006 in M1.2 → 4.55:1 |
| `--accent` | `#F4F3F1` | `--color-surface-3` | hover dei menu, **non** il brand |
| `--accent-foreground` | `#141414` | `--color-text` | |
| `--destructive` | `#DC2626` | `--color-danger` | |
| `--destructive-foreground` | `#FFFFFF` | `--color-on-dark` | 4.83:1, passa |
| `--border`, `--input` | `#DDDBDB` | `--color-border` | |
| `--ring` | `#F4AC3D` | `--focus-ring` | vedi rilievo 4: nel v1 è un'**ombra**, qui è un colore |
| `--radius` | `0.625rem` | `--radius-lg` | **rettificato in M1.2**: in shadcn `--radius` è il gradino `lg`, non `md`. `sm` e `md` si sovrascrivono con i 4px e 6px del v1 |

### Sidebar — mappatura 1:1 (8 token)

| shadcn | hex | token v1 |
|---|---|---|
| `--sidebar` | `#141414` | `--color-sidebar-bg` |
| `--sidebar-foreground` | `#A8A8A8` | `--color-sidebar-text` |
| `--sidebar-primary` | `#F4AC3D` | `--color-accent` |
| `--sidebar-primary-foreground` | `#141414` | `--color-accent-text` |
| `--sidebar-accent` | `#262626` | `--color-sidebar-hover` |
| `--sidebar-accent-foreground` | `#EDEDEB` | `--color-sidebar-text-hi` |
| `--sidebar-border` | `#262626` | `--color-sidebar-border` |
| `--sidebar-ring` | `#F4AC3D` | `--focus-ring` |

### Token che shadcn non ha → custom, esposti con `@theme inline`

Servono per ottenere `bg-success`, `text-warning-subtle-foreground`, `border-info-border`… senza valori arbitrari.

**Brand, oltre `--primary`**

| token | hex | token v1 | perché serve |
|---|---|---|---|
| `--primary-hover` | `#E8990C` | `--color-accent-hover` | shadcn usa `hover:bg-primary/90`, che su fondo chiaro **schiarisce**; il v1 scurisce. Un token esplicito o l'hover del brand è sbagliato |
| `--primary-subtle` | `#FCF0DB` | `--color-accent-light` | chip attivi, fondo tenue del focus |
| `--primary-border` | `#F5D9A8` | `--color-accent-border` | bordo tenue del brand |
| `--accent-ink` | `#B25105` | `--color-accent-ink` | l'arancio **leggibile come testo** (link). v1 `#B45309`, ΔL 0.006 in M1.2 → 4.57:1 |

**Neutri, oltre quelli di shadcn**

| token | hex | token v1 | perché serve |
|---|---|---|---|
| `--border-strong` | `#C4C4C4` | `--color-border-strong` | il v1 ha due livelli di bordo, shadcn uno |
| `--overlay` | `#14141473` | `--color-overlay` | velo delle modali, `rgba(20,20,20,.45)` |

Il v1 aveva un terzo livello di testo, `--color-text-hint` `#A8A5A1`: **non è stato portato**, vedi rilievo 2.

**Stati semantici.** Il v1 li descrive su **due livelli** — un colore pieno e una terna tenue fondo/testo/bordo — e servono entrambi: il pieno per indicatori e badge, il tenue per gli alert di M2.4, che devono somigliarsi fra loro. Si tiene quindi la forma shadcn `X`/`X-foreground` per il livello pieno e si aggiunge `X-subtle`/`X-subtle-foreground`/`X-border` per il tenue. **Estende `PIANO.md` M1.1**, che per ogni stato prevedeva tre token soli: con tre, o si perde il badge pieno o si perde l'alert, e la prima app che ne ha bisogno se lo inventa in casa — cioè la deriva che il progetto esiste per impedire.

| token | hex | token v1 | note |
|---|---|---|---|
| `--success` | `#1CAC7C` | `--color-success` | il verde istituzionale |
| `--success-foreground` | `#141414` | — | **divergenza dal v1**, rilievo 5: il bianco che il v1 prescrive dà 2.6:1 |
| `--success-subtle` | `#EAF7F2` | `--color-success-bg` | |
| `--success-subtle-foreground` | `#0E7A57` | `--color-success-text` | |
| `--success-border` | `#9FDFC8` | `--color-success-border` | |
| `--warning` | `#FBE8C4` | `--color-badge-warn-bg` | il v1 **non ha un giallo pieno**: si adotta la coppia del badge, non si inventa un hex |
| `--warning-foreground` | `#886300` | `--color-badge-warn-text` | v1 `#8A6500`, ΔL 0.006 in M1.2 → 4.55:1 |
| `--warning-subtle` | `#FFF9EC` | `--color-warn-bg` | |
| `--warning-subtle-foreground` | `#92400E` | `--color-warn-text` | |
| `--warning-border` | `#F5D9A8` | `--color-warn-border` | stesso hex di `--primary-border`: nel v1 sono già lo stesso valore |
| `--info` | `#1A5276` | `--color-info-text` | il v1 non ha un blu pieno: si usa il suo blu scuro come fondo |
| `--info-foreground` | `#FFFFFF` | `--color-on-dark` | 8.36:1 |
| `--info-subtle` | `#D6ECFB` | `--color-info-bg` | |
| `--info-subtle-foreground` | `#1A5276` | `--color-info-text` | |
| `--info-border` | `#9BD7FE` | — | **derivato**, unico valore assente dal v1: vedi sotto |
| `--destructive-subtle` | `#FEF2F2` | `--color-danger-bg` | |
| `--destructive-subtle-foreground` | `#991B1B` | `--color-danger-text` | |
| `--destructive-border` | `#FCA5A5` | `--color-danger-border` | |

**`--info-border`, derivato invece che inventato.** È il solo colore che il v1 non ha. Convertiti in `oklch`, i tre bordi tenui esistenti stanno in una banda stretta — success `l .854 c .073`, warning `l .897 c .071`, danger `l .808 c .103` — ciascuno alla tinta della propria famiglia. `--info-border` è la **media di quella banda alla tinta di `--info-subtle`**: `oklch(0.852 0.082 237.49)` = `#9BD7FE`. Lo calcola `deriveInfoBorder()` a ogni esecuzione: se un giorno la palette cambia, il valore si riallinea da solo.

**Non colori** (1:1 dal v1, nessuna decisione): `--font-sans` (stack con `'Replicall'`, il `.woff` **non si distribuisce** — D3), `--font-mono`, la scala `--text-xs…--text-title` (7 gradini in px) — **superata da M1.6**: `md` è fuso in `sm`, `title` è diventato `2xl` e `3xl` è tarato accanto, quindi i gradini restano sette ma non sono gli stessi e **nessuno è più un nome nostro** (`docs/DECISIONI.md` §30, che qui vince), i quattro `--radius-*`, le quattro `--shadow-*`, `--color-overlay`, `--space-page`, `--page-max-width`, `--transition-fast`. La scala di spaziatura `--space-1…6` **non si porta**: in Tailwind v4 le utility derivano da `--spacing`, che è anche il meccanismo della densità (M1.4).

### La modalità scura (scritta in M1.3, 2026-09-07 — chiude D2)

Il v1 non ha una palette scura: questa è **progettata**, non tradotta. Perché resti modificabile senza inventare, è costruita con tre regole, e le tre regole stanno nello script accanto alla palette.

1. **I neutri si invertono partendo da ciò che il v1 ha già collaudato.** La sidebar antracite del v1 è l'unica superficie scura in produzione da due anni: i suoi valori diventano i neutri di pagina — `#141414` fondo, `#1C1C1C` superficie sollevata, `#262626` e `#2E2E2E` i due gradini sopra, `#EDEDEB` testo, `#A8A8A8` testo attenuato.
2. **Il brand non cambia.** `--primary` resta `#F4AC3D` con testo nero in entrambe le modalità. Cambia solo la **direzione dell'hover**: sul chiaro il v1 scurisce di ΔL 0.051, sul fondo scuro la stessa mossa è schiarire → `#FFBE5A`.
3. **I tenui si specchiano a gradini fissi**, uguali per tutte le famiglie: alla tinta del pieno chiaro, `subtle` a `l 0.28 c 0.05`, il bordo a `l 0.42 c 0.10`, il testo a `l 0.85 c 0.08`. Un solo gradino per tutte significa che i quattro alert **pesano uguale**, che è il requisito di M2.4: se una famiglia salta all'occhio più delle altre, l'alert corrispondente sembra più grave di quello che è.

I **pieni semantici restano quelli del chiaro** — un colore per stato in tutte le app, che è il punto degli stati semantici. `--destructive` `#DC2626` resta anche sul fondo scuro: 3.81:1, sopra la soglia 3:1 dei componenti non testuali, e con testo bianco conserva i 4.83:1 del chiaro.

**Tre scostamenti, e ciascuno con la sua misura.**

| token | cosa si è fatto | perché |
|---|---|---|
| `--info` | `#1A5276` → **`#4BAFF2`**, testo nero | l'unico pieno **ricalcolato**: il blu scuro del v1 dà **2.20:1** sul fondo scuro, cioè un badge che non si vede. Ripreso alla propria tinta sulla banda media dei pieni chiari (`l 0.725 c 0.134`) — la stessa costruzione di `deriveInfoBorder`, non un valore scelto a occhio. Ora 7.64:1 |
| `--warning` | **invariato** `#FBE8C4` | è a `l 0.937` contro `l 0.58–0.79` di tutti gli altri pieni: sul fondo scuro è la cosa più luminosa della pagina. La correzione ovvia — riportarlo nella banda, come `--info` — è stata **provata e scartata misurandola**: a `l 0.725` diventa `#CE9E2F`, a ΔL 0.07 e Δh 9.6 da `--primary` `#F4AC3D`. Un badge di avviso indistinguibile dal brand è un difetto peggiore di uno troppo luminoso, e nella modalità chiara la stessa collisione non si vede solo perché lì il crema è chiaro. **La lightness alta è ciò che tiene `--warning` separato dall'arancio** |
| `--sidebar` | `#141414` → **`#1C1C1C`** | sul chiaro la sidebar antracite stacca dalla pagina; sullo scuro la pagina **è** antracite, e una sidebar dello stesso valore sparisce. Sale al livello della card |

Due conseguenze da conoscere, perché ricadono su altri task:

- **`--accent-ink` sul fondo scuro coincide con `--primary`**: lì l'arancio pieno si legge (9.49:1). La regola per chi scrive non cambia, anzi è la ragione per cui esiste il token — `text-accent-ink` è corretta in **entrambe** le modalità, `text-primary` dà 1.79:1 sul chiaro e 9.49:1 sullo scuro, cioè è un difetto che in dark **non si vede**.
- **`--overlay`** passa da 45% a 70% dello stesso nero Tassullo: un velo al 45% dello stesso colore della pagina non separerebbe più niente.

**Il gate è cresciuto con la palette.** Verifica ora **48 coppie** (24 per modalità) e, in più, la **parità dei token** fra chiaro e scuro: stessi nomi, stesso ordine. Serve perché il blocco `@theme inline` espone le utility a partire dalle sole chiavi del chiaro — un token dichiarato solo lì resterebbe al valore chiaro in modalità scura, cioè un colore **sbagliato** e non **mancante**, che è peggio perché non si nota.

**Il chiaro si emette su `:root` *e* su `.light`.** Non è un doppione: senza `.light` non esisterebbe modo di rimettere la modalità chiara *dentro* una pagina scura, e le due palette non si potrebbero guardare affiancate — che è la forma in cui una palette scura si giudica, perché alternandole con l'interruttore la memoria dell'occhio non regge.

### Cinque rilievi, tutti misurati dal gate — da chiudere in M1.2

Il gate ha trovato al primo colpo cose che il v1 non poteva vedere, perché `stylelint-config.cjs` verificava che si usassero le variabili, non che i colori si leggessero.

1. **Tre coppie sotto soglia per un soffio**, tutte fra 4.42 e 4.45:1. La correzione minima è una riduzione di lightness di **0.006 in oklch**, cioè invisibile a occhio:

   | coppia | oggi | proposta M1.2 | dopo |
   |---|---|---|---|
   | `muted`/`muted-foreground` | 4.42:1 | `--muted-foreground` `#6E6B67` → `#6C6965` | 4.55:1 |
   | `primary-subtle`/`accent-ink` | 4.45:1 | `--accent-ink` `#B45309` → `#B25105` | 4.57:1 (e 4.77:1 su `--background`) |
   | `warning`/`warning-foreground` | 4.42:1 | `--warning-foreground` `#8A6500` → `#886300` | 4.55:1 |

   **Chiuso in M1.2**: le tre correzioni sono state applicate come proposte. Il gate è verde, 24 coppie su 24.

2. **`--foreground-hint` è ben sotto soglia** (2.27:1 su `--background`, 2.41:1 su `--card`). **Chiuso in M1.2: il token è stato eliminato.** Entrambi i suoi usi nel v1 (`components.css`: `.input::placeholder` e `.card-meta`) sono **testo**, quindi nessuno dei due è esente da WCAG; e misurando, per arrivare a 4.5:1 dovrebbe scendere a `l 0.547` contro `l 0.522` di `--muted-foreground` — ΔL 0.025, indistinguibile — mentre su fondo `--muted` collassa esattamente sullo stesso hex. Il terzo livello di testo non sopravvive al requisito: placeholder e meta usano `--muted-foreground`. Nota per la guida di migrazione (M5.5): v1 `--color-text-hint` → v2 `--muted-foreground`. Lo script resta **senza alcuna esenzione**, e va tenuto così.

3. **I raggi non si ottengono derivandoli.** shadcn calcola `--radius-sm/md/lg/xl` da `--radius` con i fattori `0.6/0.8/1/1.4`. Con `--radius: 0.375rem` (6px) escono **3.6 / 4.8 / 6 / 8.4px**, mentre il v1 vuole **4 / 6 / 10 / 999px** — e le primitive shadcn usano `rounded-md`, quindi i bottoni verrebbero a 4.8px invece di 6. In M1.2 i quattro `--radius-*` si **sovrascrivono con valori espliciti** nel blocco `@theme inline`, invece di affidarsi alla derivazione.

4. **`--ring` cambia natura.** Nel v1 `--focus-ring` è un'**ombra** completa (`0 0 0 3px var(--color-accent-light)`, cioè l'arancio *tenue*); in shadcn `--ring` è un **colore** a cui le primitive applicano spessore e offset. Il piano mappa `--ring` su `#F4AC3D`, che è l'arancio *pieno*: più marcato del v1. Si tiene — un focus visibile è un requisito di accessibilità, non un gusto — ma va saputo che l'anello di focus del v2 **non sarà identico** a quello del v1, e l'arancio tenue resta disponibile come `--primary-subtle`.

5. **Il verde pieno non regge il bianco.**  Il v1 prescrive `--color-on-dark` (bianco) anche "sul verde success": bianco su `#1CAC7C` dà **2.6:1**. Stessa identica trappola dell'arancio, mai notata perché nessuno la misurava. `--success-foreground` è quindi `#141414` (6.35:1), coerente con la regola già valida per il brand: **sui fondi saturi chiari il testo è nero**.

### Tre rilievi nuovi, emersi in M1.2 — il tema è giusto, le primitive no

Applicato il tema, il workbench ha mostrato che i colori corretti **non bastano**: la primitiva `button` che il preset `base-nova` ha generato in M0.2 usa i token nel modo sbagliato. Nessuno dei tre si risolve nel tema; tutti e tre sono **da chiudere in M2.1**, e sono il primo caso concreto di ciò che il preset porta con sé e va ri-stilato.

| dove | cosa fa il preset | misura | cosa deve diventare |
|---|---|---|---|
| `variant: link` | `text-primary` | **1.79:1** | `text-accent-ink` → 4.77:1 |
| `variant: destructive` | `bg-destructive/10 text-destructive` (rosso tenue) | **3.94:1** | `bg-destructive text-destructive-foreground` → 4.83:1, ed è anche il rosso pieno del v1 |
| base + taglie | `rounded-lg` (10px), e `rounded-[min(var(--radius-md),12px)]`, `text-[0.8rem]` sulle taglie | bottoni a **10px** invece dei 6px del v1 | `rounded-md`, e via i valori arbitrari (regola 3 del `CLAUDE.md`) |

La variante `link` merita d'essere notata: il preset commette **esattamente** la trappola che il `CLAUDE.md` mette per iscritto — `--primary` usato come colore di testo. Se succede al preset ufficiale, succederà a noi.

**Limite del gate, da tenere presente e da colmare in M2.9.** `check:contrast` verifica le **coppie di token**, non come i componenti le accostano: nessuno dei tre rilievi qui sopra è stato trovato dallo script, ma guardando il workbench e misurando col browser. Il controllo che li avrebbe presi è axe-core sulle story, cioè il gate di M2.9.

**Effetto collaterale della scala tipografica**, da valutare in M2.1: con la scala Tassullo `text-sm` vale **12px** invece dei 14px di default di Tailwind, quindi i bottoni del preset (che usano `text-sm`) sono ora più piccoli di prima. Non è un guasto: è il preset tarato su una scala diversa.

### Il gate: come si usa e come si verifica che funzioni

```bash
npm run check:contrast                 # tabella di tutte le coppie, esce 1 sotto 4.5:1
npm run check:contrast -- --css        # i blocchi CSS in oklch, per M1.2 / M1.3
npm run check:contrast -- --self-test  # dimostra che il gate sa fallire
```

Le coppie verificate sono **26**, e non sono solo quelle `X`/`X-foreground` letterali: ci sono anche gli accostamenti che le pagine fanno davvero e che nessun token dichiara — testo attenuato *su pagina* e *su card*, link su entrambe, voce di sidebar attiva sul fondo della sidebar. Sono quelli il posto dove il contrasto si rompe senza che nessuno se ne accorga.

Il `--self-test` esiste perché il criterio di accettazione di M1.1 — *"fallisce se si forza `--primary-foreground` a bianco"* — resti verificabile in un comando invece che a colpi di modifica temporanea. **Verificato in entrambi i modi** in M1.1: il flag riporta `1.94:1 → RILEVATO`, e la modifica reale della palette a `#FFFFFF` fa uscire `npm run check:contrast` con **codice 1**.

## §3. Cosa NON viene toccato

- **Anagrafe, Studio e Officina.** Nessuna migrazione in questo piano. Restano su `@tassullo/theme` v1, che continua a funzionare esattamente come oggi. L'**unica** cosa che si aggiunge, e solo su Anagrafe in M5.5, è il collegamento dell'MCP al registry v2: due file di configurazione, nessuna modifica a codice o stili, reversibile cancellandoli. Serve a poter *consultare* il design system mentre si sviluppa, non ad adottarlo. Anagrafe compare in queste pagine solo come **fonte di analisi** — il suo codice dice quali componenti sono già stati riscritti a mano, la sua roadmap quali serviranno — e come banco di prova **a secco** della guida di migrazione in M5.5, dove si nomina il blocco che sostituirà ogni pagina senza scrivere codice. È anche la scelta più prudente: si migra avendo in mano un design system finito e documentato, non uno in costruzione.
- Il repo `tassullo-design-system` attuale: resta com'è, in produzione per tutte e tre.
- La cartella `docx/`: il canale Word è indipendente dal web e non c'entra con shadcn. Resta nel v1 e continua a propagarsi per copia (D7).

## §4. Punti aperti

Nessuna di queste va decisa ora: sono promemoria scritti perché non riemergano come sorprese fra tre mesi — la stessa funzione delle D nella roadmap di Anagrafe, dove D3 è rimasta aperta per fasi intere senza fermare niente. La colonna che conta è **quando**.

**Decisioni**
- **D1** — nome del repo/registry. ~~Aperta~~ **Chiusa il 2026-09-07: `tassullo-design-system-v2`** (continuità esplicita col repo attuale).
- **D2** — valori della palette scura, che nel v1 non esistono. Chiude in **M1.3** (task 8) guardandola, non al buio.
- **D3** — licenza Replicall: si può distribuire il `.woff` nel registry o resta a carico dell'app? **Non serve deciderla**: il default è quello del v1 (la carica l'app). Si riapre solo se si vuole cambiare.
- **D4** — quando pubblicare su GitHub. **CHIUSA il 2026-09-10: subito, e pubblico.** Anticipata rispetto a M5.6 perché serviva condividere il design con Roberto, e la scelta si è rivelata forzata più che opinabile: l'org `tassullo` è su piano **free**, dove GitHub Pages esiste solo sui repo pubblici, e la scorciatoia `owner/repo/item` della CLI shadcn è documentata solo per i repo pubblici — su privato ogni app avrebbe dovuto portarsi un token GitHub nell'ambiente, nei secret della CI e nell'editor perché l'MCP potesse sfogliare. Costo accettato: il diario e il piano sono leggibili da chiunque. Unica cosa tolta dal repo, `public/fonts/` per intero, `LEGGIMI.md` compreso — documentava una conversione di font Lineto con la licenza da confermare. Motivazione distesa in `WORKLOG.md`, voce **D4**. **M5.6 resta aperto**: la pubblicazione c'è, il tag `v2.0.0` e la prova d'installazione dall'esterno no.
- **D5** — destino di `components.css` e `stylelint-config.cjs` del v1: si dismettono quando l'ultima app sarà migrata. Fuori dal perimetro di questo piano.
- **D6** — quando migrano le app esistenti (Anagrafe, Studio, Officina). Ognuna decide per sé, seguendo la guida di M5.5; nessuna scadenza.
- **D7** — se `docx/` resti nel repo v1 o si sposti. Nessuna urgenza, mai.
- **D8** — librerie di terze parti per i blocchi M3.6–M3.9: PDF (pdf.js / react-pdf), editor (TipTap), diff, dropzone. Sono le uniche dipendenze pesanti del progetto e finiscono nel `bundle` di ogni app che installa quei blocchi. Vanno scelte una per una nel task che le incontra, privilegiando quelle che si possono caricare in `lazy` e sostituire senza toccare l'API del blocco.
- **D9** — libreria di primitive. ~~Aperta~~ **Chiusa il 2026-09-07: Base UI**, con l'unica eccezione possibile sul calendario, da motivare in M2.7 (vedi §0bis).

**Assunzioni**
- **A1** — le app consumer restano su Vite + React + TypeScript.
- **A2** — Tailwind v4 è accettabile in tutte le app (introduce una build-dependency che il v1 non aveva).
- **A3** — taratura delle sessioni per analogia con Anagrafe.
- **A4** — che esista, prima o poi, una **app nuova** su cui il v2 debutta. Se passasse molto tempo senza, il design system resterebbe non collaudato su un caso reale: in quel caso conviene anticipare la migrazione di una pagina di Anagrafe come collaudo, riaprendo D6.

## §5. Stato

Lo stato operativo dei task, con responsabile, dipendenze e criteri, vivrà in **`CHECKLIST.md`** (fonte di verità), creato in M0.1. Il diario è **`WORKLOG.md`**, che su 42 sessioni resta consultabile per intero: nessuna archiviazione prevista.
