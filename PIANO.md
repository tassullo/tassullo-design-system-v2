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

**M1.4 — Densità touch (1 sessione)**

Premessa, verificata sulla documentazione (2026-09-07): shadcn è responsive nel **layout** — `sidebar` passa a `Sheet` sotto la soglia mobile (`useIsMobile`, `SIDEBAR_WIDTH_MOBILE`), e `drawer` documenta il pattern *Dialog su desktop, Drawer su mobile*. Sui **bersagli** non dice nulla: la pagina del `Button` elenca le taglie (`xs`, `sm`, default, `lg`, `icon-*`) senza mai citare touch target o altezze minime, e il default resta `h-9` (36px) identico su iPhone e su desktop, contro i 44–48px chiesti da Apple e Material. Il responsive di shadcn si eredita gratis, ma **non** copre il caso che ha fatto nascere `data-density` nel v1: Officina in cantiere, dove il problema non è lo spazio sullo schermo ma il dito guantato.

- Prompt: "In Tailwind v4 le utility numeriche di dimensione sono derivate da una variabile: `h-9` è `calc(var(--spacing) * 9)`, con `--spacing: 0.25rem` di default; vale per `h-*`, `p-*`, `gap-*`, `size-*`. Quindi la densità si ottiene con **una riga**, senza patchare nessuna primitiva: `[data-density=\"touch\"] { --spacing: 0.3125rem; }` porta `h-9` a 45px e scala insieme padding, gap e icone. Aggiungi lo scatto di tipografia, che **non** deriva da `--spacing` e va ritoccato a parte. Officina continua a scrivere una riga sola nell'`index.html`: l'interfaccia verso le app resta identica al v1."
- File: `registry/tassullo/theme/tassullo-theme.css`, `.storybook/preview.ts`
- Accettazione: l'interruttore densità del workbench cambia l'altezza dei controlli senza ricaricare; bottoni e campi ≥44px in touch; **verificato che lo scaling non deformi ciò che non deve** (larghezze massime, icone dentro i bottoni, sidebar) — ogni eccezione si fissa con un valore assoluto e si annota in WORKLOG.
- Nota: la scelta è l'attributo esplicito, non `@media (pointer: coarse)`. È l'app a sapere se si usa in campo; un tablet in ufficio non deve prendere la densità da guanti. Stessa scelta del v1, e reversibile.

**M1.5 — Il tema come item di registry (1 sessione)**
- Prompt: "Dichiara il tema come item `registry:theme` in `registry.json` (bozza), con `cssVars` per `theme`/`light`/`dark` e il file CSS con `target` sul CSS globale dell'app. Pagina Palette del workbench completata: tutte le coppie con nome del token, valore oklch e click-to-copy (eredita l'idea dalla palette click-to-copy di `styleguide.html` v1). Il tema si distribuisce **solo** come `registry:theme`."
- Fuori strada da non imboccare, annotato in `docs/DECISIONI.md`: `shadcn/create` (`ui.shadcn.com/create`) e i **preset** con codice breve (`apply a2r6bw`) sono un configuratore visuale per chi deve *inventarsi* una palette partendo da zero. La palette Tassullo è già vincolata al sito istituzionale: qui si traducono token esistenti, non se ne generano di nuovi. Il canale `registry:theme` è quello giusto e basta.
- File: `registry.json`, `stories/Palette.stories.tsx`
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
- Accettazione: `button` con tutte le varianti/dimensioni/stati (hover, focus da tastiera, disabled, loading) nelle 4 combinazioni; `typography` riproduce la scala del v1 (`--text-xs` … `--text-title`); `spinner` è il caricamento inline previsto dallo standard unico di INTERFACCE.md §1.

  **Da chiudere qui: quattro rilievi su `button`, aperti e misurati in M1.2** (dettaglio e misure in §2bis, "Tre rilievi nuovi"). Il file è `registry/tassullo/ui/button.tsx`, com'è uscito dal preset `base-nova` in M0.2. Non sono ipotesi: sono stati letti dal browser sul workbench con il tema applicato.

  | dove | cosa fa oggi | misura | cosa deve diventare |
  |---|---|---|---|
  | `variant: link` | `text-primary` | **1.79:1** | `text-accent-ink` → 4.77:1 |
  | `variant: destructive` | `bg-destructive/10 text-destructive` | **3.94:1** | `bg-destructive text-destructive-foreground` → 4.83:1, ed è anche il rosso pieno del v1 |
  | base | `rounded-lg` | bottoni a **10px** invece dei 6px del v1 | `rounded-md` |
  | taglie `xs`/`sm` | `rounded-[min(var(--radius-md),12px)]`, `text-[0.8rem]` | — | via i valori arbitrari (regola 3 del `CLAUDE.md`) |

  La variante `link` è la trappola che il `CLAUDE.md` mette per iscritto — `--primary` usato come colore di testo — commessa dal preset ufficiale. Da verificare **su ogni primitiva di questo task, non solo sul bottone**: se ci è cascato il preset, il preset ci sarà cascato più di una volta.

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

---

### FASE 3 — Blocchi applicativi Tassullo — 11 sessioni

Obiettivo: i pattern che si ripetono nelle app dello studio e che shadcn non copre. Sono il vero valore aziendale del 2.0 — l'erede evoluto di `components.css`.
Gate: M3.10 — una pagina reale di Anagrafe ricostruita in Storybook **usando solo i blocchi**, senza una riga di CSS di pagina.
Dipendenze: FASE 2.

Ogni blocco dichiara i suoi `registryDependencies` sulle primitive che usa, così una sola `shadcn add` tira dentro tutto.

**M3.1 — `tassullo-app-shell` (1 sessione)** — sidebar scura + header + area contenuto con `--page-max-width`; è il sostituto di `Sidebar.tsx`/`Sidebar.css` (190 righe) di Anagrafe.
- Accettazione: shell resa a 1440px e degradata a 375px.

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

### FASE 4 — Pagine modello — 6 sessioni

Obiettivo: pagine intere pronte da installare, sul modello di `ui.shadcn.com/blocks` (dove `npx shadcn add dashboard-01` cala nel progetto un `page.tsx` completo, non uno spezzone). Sono il livello sopra i blocchi: una nuova app dello studio non parte più da una pagina bianca, ma da una pagina Tassullo funzionante da svuotare e riempire.
Gate: una nuova app Vite vuota installa `tassullo-app-shell` + `pagina-lista` + `pagina-login` e ha in dieci minuti una app navigabile e in stile, senza scrivere una riga di layout.
Dipendenze: FASE 3.

Ogni pagina modello è un item `registry:block` con dati finti tipizzati e commenti che dicono cosa sostituire. Il criterio di scelta: **le pagine che le tre app hanno già tutte e tre**, non pagine inventate.

**M4.1 — `pagina-login` (1 sessione)** — schermata di accesso con logo Tassullo, bottone di autenticazione (predisposto per MSAL/Entra ID, che è lo standard delle app dello studio), stato di errore e stato "accesso in corso".
- Motivo: Anagrafe ha `Login.tsx` + `Login.css`; ogni app dello studio ne ha una, tutte leggermente diverse.

**M4.2 — `pagina-lista` (1 sessione)** — la pagina più ripetuta in assoluto: intestazione con titolo e azione primaria, barra filtri (`combobox` + `toggle-group` + ricerca), `data-table` con paginazione, stati vuoto/caricamento/errore.
- Motivo: in Anagrafe è Prodotti, Famiglie, Norme, Sistemi, Pubblicazioni, ChangeSets — sei volte la stessa pagina, scritta sei volte.

**M4.3 — `pagina-scheda` (1 sessione)** — dettaglio di un'entità: breadcrumb, intestazione con stato e azioni, tab (anagrafica / documenti / storico), form in sola lettura che passa in modifica, `version-timeline` in coda.
- Motivo: Prodotto, Famiglia, Sistema, Norma — quattro volte in Anagrafe, ed è il file CSS più grande (`Prodotto.css`, 201 righe).

**M4.4 — `pagina-dashboard` (1 sessione)** — home applicativa: fila di indicatori, due grafici, tabella delle attività recenti, area avvisi.
- Motivo: nessuna delle app ce l'ha ancora fatta bene, e la roadmap di Anagrafe prevede una tab Metriche e un quadro sinottico.

**M4.5 — `pagina-admin` (1 sessione)** — pagina a tab per l'amministrazione: gestione utenti con ruoli multipli, tabella con azioni per riga, dialoghi di conferma, banner per l'utente senza permessi.
- Motivo: Anagrafe (`Admin.tsx`, 212 righe di CSS) e SuperTM hanno la stessa pagina con la stessa struttura a tab.

**M4.6 — Stati di sistema e gate (1 sessione)** — `pagina-errore` nelle sue varianti: 404, accesso negato (l'utente senza ruoli di Anagrafe è sola lettura e la UI glielo deve dire), errore del server, manutenzione. Poi il gate: app Vite vuota, tre `shadcn add`, e si verifica che in dieci minuti ci sia un'app navigabile e in stile.
- Accettazione: cronometrata davvero e annotata in WORKLOG — se ci vuole di più, il problema è nella documentazione o nei `registryDependencies`, e si corregge lì.

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
- Prompt: "Le app dello studio **non si migrano ora** (vedi §3): questa è la guida che permetterà di farlo quando ognuna deciderà, senza riaprire l'analisi da capo. Contiene, come **passo 0 separato dalla migrazione e da fare subito**, il collegamento dell'MCP: in ogni app esistente si aggiunge un `components.json` minimo che dichiara il registry Tassullo v2 e si esegue `npx shadcn@latest mcp init --client claude`. È additivo e reversibile — non tocca il codice, non tocca gli stili, non richiede Tailwind — e da quel momento chi lavora su Anagrafe può **cercare e leggere** i componenti del v2 mentre sviluppa, invece di riscriverli. Installarli richiederà Tailwind e quindi la migrazione vera; consultarli no. Documenta le due forme dell'indirizzo del registry: percorso di file locale finché il repo è sul Mac, e `tassullo/tassullo-design-system-v2` con il tag quando D4 sarà chiusa. Poi la guida vera e propria: la tabella token v1→v2 e la tabella classe v1→componente v2 (`.btn`→`button`, `.chip`→`toggle-group`, `.badge`→`badge`, `.card`→`card`, `.input`→`field`+`input`, `.alert`→`alert`, `.table`→`data-table`, `.sidebar`→`app-shell`, `.skel`→`skeleton`); la dimostrazione che **i due temi convivono** senza collisioni di nomi (il v1 usa `--color-*`, il v2 `--primary`/`--background`), che è ciò che rende la migrazione incrementale e interrompibile; l'ordine consigliato (Tailwind → tema affiancato → app-shell → una pagina lista e una di dettaglio come piloti → il resto → rimozione del v1, di `.stylelintrc.cjs` e dello step `lint:css`); la regola che ogni pagina migrata è **un commit isolato**, così ci si può fermare a metà con l'app funzionante; e l'avvertenza che se durante una migrazione emerge una lacuna del design system, si corregge **nel registry**, mai nell'app."
- Accettazione: **passo 0 eseguito davvero su Anagrafe** — `components.json` e `.mcp.json` aggiunti, e dall'MCP si cercano e si leggono gli item del registry Tassullo stando dentro il repo di Anagrafe, senza che una riga del suo codice o dei suoi stili sia cambiata. Poi la guida è verificata **a secco**: si percorre l'elenco delle sue 10 pagine e per ognuna si nomina il blocco che la sostituirà, senza scrivere codice; l'esito, comprese le lacune trovate, va in WORKLOG e alimenta il registry.

**M5.6 — Pubblicazione su GitHub (1 sessione, BLOCCATA da D4)**
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

**42 sessioni** (5 + 5 + 9 + 11 + 6 + 6). Percorso critico: FASE 1 (il tema regge tutto il resto) → FASE 2 → M3.3 `data-table` (il blocco più costoso e quello che ripaga di più) → M3.10 gate → FASE 5.

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

**Non colori** (1:1 dal v1, nessuna decisione): `--font-sans` (stack con `'Replicall'`, il `.woff` **non si distribuisce** — D3), `--font-mono`, la scala `--text-xs…--text-title` (7 gradini in px), i quattro `--radius-*`, le quattro `--shadow-*`, `--color-overlay`, `--space-page`, `--page-max-width`, `--transition-fast`. La scala di spaziatura `--space-1…6` **non si porta**: in Tailwind v4 le utility derivano da `--spacing`, che è anche il meccanismo della densità (M1.4).

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
- **D4** — quando pubblicare su GitHub. **Blocca solo M5.6**, l'ultimo task, e con esso l'URL della style guide su Pages. Tutto il resto — compresa la prova d'installazione end-to-end di M5.2 — funziona col registry locale via percorso di file: si può arrivare in fondo restando sul proprio Mac.
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
