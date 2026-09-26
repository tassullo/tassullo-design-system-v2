# Guida di migrazione: da `@tassullo/theme` (v1) al Design System Tassullo 2.0

> Per le app dello studio già in produzione sul v1. Un'app nuova non passa di qui:
> parte da `docs/INTEGRAZIONE.md`. Questa guida la richiama spesso, e dice solo ciò
> che cambia quando l'app esiste già.

## In breve

- **Passo 0, subito e da solo**: due file che fanno vedere il v2 a Claude Code dentro
  l'app. Non toccano il codice né gli stili, non richiedono Tailwind, si tolgono
  cancellandoli.
- **La migrazione vera si fa in un colpo solo**: tutta l'app su un ramo, il v1 si toglie
  nello stesso lavoro, e in produzione arriva l'app finita. Non pagina per pagina.
- **Cambia la natura del lavoro.** Il v1 dava variabili CSS e ricette di classi da
  ricopiare; il v2 dà componenti che la riga di comando copia nell'app, e utility Tailwind
  che leggono i token del tema. Una pagina migrata non ha più un suo file `.css`.

### Perché in un colpo solo

Il piano del design system dava per scontato che v1 e v2 potessero convivere nella stessa
app, pagina migrata dopo pagina migrata. È stato misurato su Anagrafe (`docs/DECISIONI.md`
§64) e non regge senza lavoro in più:

- **l'azzeramento di Tailwind cambia tutte le pagine v1** appena lo si installa: interlinea
  più alta, titoli senza grassetto, paragrafi senza margini. Su 1.454 elementi misurati se
  ne spostano 976;
- **venti nomi di variabile li usano tutti e due** (`--color-accent`, `--text-sm`,
  `--radius-md`…), perché il v1 ha gli stessi prefissi del tema di Tailwind. Vince il v1, e
  i componenti v2 escono col carattere sbagliato, un pixel più piccoli, e con i link senza
  colore.

Si può rimediare (la ricetta è in §64, e costa una ventina di righe di CSS con `@scope` e
livelli), ma le pagine v1 cambiano comunque carattere e corpo. Per Anagrafe si è scelto di
non farlo: un ramo solo, e nessuna fase intermedia in produzione. È la scelta predefinita
di questa guida; un'altra app può rifarla, e se decide di far convivere i due temi segue
§64.

## Passo 0 — consultare il v2 dall'app, senza installare niente

Chi lavora sull'app può da subito **cercare e leggere** i componenti del v2 con l'MCP di
shadcn, invece di riscriverli. Installarli richiede la migrazione; consultarli no.

**Due file nuovi, nessun file esistente modificato.**

1. `components.json`, nella cartella del frontend (quella del suo `package.json`; in
   Anagrafe `frontend/`). Ha lo stesso contenuto che la migrazione rimetterà dopo `init`,
   con il registry Tassullo già dichiarato:

   ```json
   {
     "$schema": "https://ui.shadcn.com/schema.json",
     "style": "base-nova",
     "rsc": false,
     "tsx": true,
     "tailwind": {
       "config": "",
       "css": "src/index.css",
       "baseColor": "neutral",
       "cssVariables": true,
       "prefix": ""
     },
     "iconLibrary": "lucide",
     "aliases": {
       "components": "@/components",
       "utils": "@/lib/utils",
       "ui": "@/components/ui",
       "lib": "@/lib",
       "hooks": "@/hooks"
     },
     "registries": {
       "@tassullo": "https://raw.githubusercontent.com/tassullo/tassullo-design-system-v2/v2.0.5/public/r/{name}.json"
     }
   }
   ```

2. `.mcp.json`, nella radice del repository (la cartella da cui parte Claude Code),
   **scritto a mano**. Se il frontend sta nella radice:

   ```json
   {
     "mcpServers": {
       "shadcn": { "command": "npx", "args": ["shadcn@latest", "mcp"] }
     }
   }
   ```

   Se sta in una sottocartella, il server va fatto partire da lì, perché legge
   `components.json` dalla cartella in cui parte:

   ```json
   {
     "mcpServers": {
       "shadcn": {
         "command": "node",
         "args": [
           "-e",
           "process.chdir('frontend'); require('node:child_process').spawn('npx', ['shadcn@latest', 'mcp'], { stdio: 'inherit', shell: true }).on('exit', (c) => process.exit(c ?? 0))"
         ]
       }
     }
   }
   ```

Due cose da sapere, entrambe misurate con la CLI 4.21.0:

- **`npx shadcn@latest mcp init` non scrive solo `.mcp.json`**: aggiunge `shadcn` alle
  dipendenze di sviluppo, e se nella cartella non c'è un `package.json` ne crea uno, con il
  suo `package-lock.json` e 73 MB di `node_modules`. Nella radice di un'app che ha il
  backend lì, è un file che non c'entra. Per questo il file si scrive a mano.
- **`shadcn mcp --cwd frontend` non funziona**: l'opzione esiste, ma gli strumenti del
  server leggono la cartella da cui il processo è partito. Da qui il lanciatore con
  `process.chdir`, che usa solo Node e quindi va anche su Windows.

**Verifica.** Si chiude e si riapre Claude Code nella radice dell'app, si approva il server
`shadcn` quando lo chiede, e gli si chiede: «cerca nel registry Tassullo un dialogo di
conferma». Deve trovare `tassullo-confirm-dialog` e saperne leggere la descrizione. `git
status` deve mostrare solo i due file nuovi.

**Nei documenti dell'app**, una riga nel `CLAUDE.md`, vicino alle regole di stile: «Il
Design System Tassullo 2.0 si consulta con l'MCP di shadcn (registry `@tassullo`): prima di
scrivere un componente, chiedere se esiste. Finché l'app non è migrata, non si installa
niente: le regole di stile restano quelle del v1.»

## Prima del ramo: l'inventario

La migrazione si pianifica leggendo le pagine una per una: per ognuna, che cosa è (lista,
scheda, dialogo, cruscotto) e quale pagina d'esempio o quale blocco del v2 la sostituisce.
L'MCP del passo 0 serve proprio a questo. L'esempio fatto è Anagrafe:
`docs/ANALISI-COPERTURA-APP.md` §9, 19 pagine.

Poi si cerca nel codice tutto ciò che la migrazione deve sostituire. Nella cartella del
frontend:

```bash
grep -rnE "[\"'\` ](btn|btn-[a-z]+|input|field-label|badge|badge-[a-z]+|alert|alert-[a-z]+|table|table-scroll|skel|card|card-[a-z]+|chip|chip-sm|link|sidebar|sidebar-item)[\"'\` ]" src --include='*.tsx'
grep -rnoE "var\(--[a-z0-9-]+" src | sort | uniq -c | sort -rn
grep -rnE "window\.(confirm|prompt|alert)|\b(confirm|prompt)\(" src
grep -rnE "<select|<datalist" src
grep -rnE "role=\"dialog\"|modale" src
grep -rnE "<table" src
grep -rnE "Intl\.NumberFormat|toLocaleString|toFixed|font-mono|monospace" src
```

Il primo trova le classi del v1 anche dentro `className={'btn …'}` e nelle stringhe
composte. Le classi proprie dell'app, con un prefisso di pagina, si trovano col secondo e
leggendo i file `.css`.

E ciò che a `grep` non si trova, e va cercato leggendo: le **azioni che cancellano senza
chiedere conferma**, gli **errori scritti dietro una finestra aperta**, le barre di tab
scritte a mano. In Anagrafe erano 7, 6 e 5.

Il controllo del design system (`tassullo-controllo`, vedi il passo 8 più sotto) aiuta già
qui: con `components.json` del passo 0, `node scripts/tassullo-controllo.mjs --solo-stile`
elenca le regole violate dal codice di oggi, cioè buona parte del lavoro da fare.

Le variabili che il codice usa ma la versione del v1 installata non definisce (scritte con
un ripiego, `var(--nome, #fff)`) vanno guardate a parte: se il v2 definisce quel nome, il
ripiego smette di valere appena arriva il tema. In Anagrafe è successo con
`--color-overlay`, che il v1 ha aggiunto solo dalla 1.2.0.

**Quale v1 ha l'app.** Fino alla 1.1 il pacchetto portava solo `theme.css`, e le app
ricopiavano le classi nel proprio CSS; dalla 1.2.0 porta anche `components.css`, e l'app lo
importa. Nel `package-lock.json` si legge il commit installato. Non cambia la migrazione,
cambia cosa si toglie alla fine: le classi ricopiate, o il secondo `@import`.

## Il ramo, nell'ordine

Il ramo segue le regole dell'app (nome, PR, chi approva). Dentro il ramo si può fare un
commit per pagina, che rende la revisione più facile; quello che conta è che in produzione
arrivi l'app finita. Se le regole dell'app vogliono rami brevi (una o due sessioni), il ramo
della migrazione è un'eccezione: va scritta nelle regole dell'app prima di cominciare, con la
ragione, e il ramo va riallineato spesso al principale.

1. **Tailwind e l'alias `@`**, prendendo dal passo 2 di `docs/INTEGRAZIONE.md` **solo**
   i pacchetti (`tailwindcss`, `@tailwindcss/vite`, `@types/node`) e l'alias `@/*` nei due
   `tsconfig`. Il resto del passo 2 è per un'app vuota e qui farebbe danni:
   - `vite.config.ts` **non si riscrive**: al file che c'è si aggiungono `tailwindcss()` fra
     i `plugins` e `resolve.alias` (`"@": path.resolve(import.meta.dirname, "./src")`); le
     opzioni che ha già (porta, proxy…) restano;
   - `src/App.tsx` e `src/App.css` **non si toccano**: sono l'app;
   - `src/index.css` **non si svuota**: in testa si aggiunge `@import "tailwindcss";`, e il
     resto resta finché la migrazione non è finita.
2. **`shadcn init`**: prima si **cancella il `components.json` del passo 0**. Se lo trova,
   `init` chiede se sovrascriverlo, anche con `--yes`: rispondendo «no» esce con errore;
   rispondendo «sì» fa una seconda domanda (se reinstallare i componenti), e se nessuno
   risponde esce **senza errore e senza aver fatto niente**. Cancellato il file, `init` va
   come nel passo 3 di `docs/INTEGRAZIONE.md`, e il registry si rimette come al passo 4.
3. **Il tema** e **via la palette di partenza**: passi 6 e 7 di `docs/INTEGRAZIONE.md`.
   Alla domanda della CLI («Existing CSS variables and components will be overwritten») si
   risponde `y`: in un `index.css` pieno di regole v1 aggiunge i due `@import` del tema e
   non tocca le regole che ci sono (provato su Anagrafe). Il carattere arriva in
   `public/tassullo-inter-4.1.css` e si collega da `index.html` con
   `<link rel="stylesheet" href="/tassullo-inter-4.1.css" />`, come dice il passo 6: non si
   importa da `index.css`. Da qui le pagine non ancora
   migrate cambiano aspetto (l'azzeramento, vedi sopra): è atteso, ed è il motivo per cui il
   ramo non va in produzione a metà.

   **E finché il v1 è caricato, anche le pagine migrate si vedono sbagliate**: il v1 vince
   sui nomi in comune, quindi i testi v2 escono un pixel più piccoli, senza Inter, e i link
   senza arancio. Non è un difetto da correggere nella pagina: sparisce al passo 7. Il
   controllo dell'aspetto, e la verifica del passo 8 di `docs/INTEGRAZIONE.md` (sfondo e
   Inter), si fanno **dopo** aver tolto il v1.
4. **Il guscio**: `tassullo-app-shell` al posto della colonna di navigazione scritta a mano
   e del suo layout. Le voci diventano dati (`sezioni`), la voce attiva la calcola l'app, i
   collegamenti passano con `render`. Accanto al guscio, una volta sola in cima all'app, si
   monta `<Toaster />` (primitiva `sonner`): senza, i `toast` non compaiono e non danno
   errore. Nel modo `contenuto="scorre"`, il predefinito, scorre la finestra e la fascia in
   alto resta ferma: un'area che scorre scritta a mano sotto la fascia, per tenerla ferma,
   non serve più e si toglie. Le tab di una scheda si tengono ferme sotto la fascia come
   nella pagina d'esempio `tassullo-pagina-scheda`.
5. **Le pagine**, ricomposte con i blocchi e le primitive, partendo dalla pagina d'esempio
   più vicina (`tassullo-pagina-lista`, `-scheda`, `-dashboard`, `-admin`, `-login`,
   `-errore`): la si guarda nella style guide e se ne legge il codice con
   `npx shadcn@latest view @tassullo/<pagina>`, poi la pagina si riscrive nella cartella
   delle pagine dell'app. Le pagine d'esempio non si installano e non si importano: si
   installano i blocchi che usano, con `npx shadcn@latest add @tassullo/<item>`, e si tiene
   l'elenco degli item installati per nome: finirà nel paragrafo «Design system» della
   checklist (punto 9). Due librerie non
   arrivano con nessun item e si installano da sé quando servono: `@tassullo/toni` (i toni
   di `Badge` e `Alert`) e `@tassullo/numeri`. Il file `.css` della pagina si cancella con
   la pagina.
6. **Le sostituzioni** della sezione qui sotto.
7. **Via il v1**:
   - `npm uninstall @tassullo/theme`;
   - da `src/index.css`, l'`@import` del v1 e tutte le classi del v1 ricopiate lì
     (`.btn`, `.input`, `.badge`, `.alert`, `.table`, `.skel`…), comprese le regole su
     `html`, `body` e `a`;
   - i file `.css` di pagina e di componente rimasti, con i loro `import`;
   - se l'app li ha, `.stylelintrc.cjs` e lo script `lint:css`;
   - in `index.html`, il commento accanto a `<meta name="theme-color">` che nomina il token
     v1. Il valore resta un esadecimale (l'HTML non legge le variabili CSS): `#141414`, lo
     stesso fondo della colonna nel v2.
8. **Verifica**:
   - **il controllo del design system**: `npx shadcn@latest add @tassullo/tassullo-controllo`,
     poi `node scripts/tassullo-controllo.mjs` deve passare pulito, e va fra le verifiche
     automatiche dell'app (passo 11 di `docs/INTEGRAZIONE.md`). Trova da sé le classi e le
     librerie del v1 rimaste, i file del design system ritoccati durante il lavoro e le
     primitive scritte in casa;
   - nessun resto del v1. I `grep` dell'inventario, a questo punto, trovano anche il codice
     del design system (`bg-card` contiene `card`, e i blocchi hanno tabelle e dialoghi):
     si leggono **escludendo i file installati**, aggiungendo in coda
     `| grep -vE "^src/(components/(ui|blocks|pages)|hooks|lib/(utils|numeri|toni))"`, e
     allora non devono trovare più niente. Nemmeno `grep -rn "@tassullo/theme" src
     package.json`;
   - nessun valore arbitrario nel codice dell'app: `grep -rnE "\[#|-\[[0-9]" src
     --include='*.tsx'` (le virgolette servono: in zsh, senza, il comando non parte) deve
     trovare solo i file del design system;
   - `npx tsc -b`, `npm run build`;
   - un giro di tutte le pagine nel browser, in chiaro e, se l'app la usa, in modalità scura
     e in densità touch; le pagine che l'app dichiara consultabili dal telefono anche a
     375px.
9. **I documenti dell'app** (sezione più sotto).

## Le sostituzioni

### Classe v1 → componente v2

| v1 | v2 | note |
|---|---|---|
| `.btn .btn-primary` | `Button` | una sola azione primaria per schermata, come nel v1 |
| `.btn .btn-secondary` | `Button variant="outline"` o `"secondary"` | |
| `.btn-sm`, `.btn-xs` | `Button size="sm"`, `"xs"` | |
| `.btn-danger` | `Button variant="destructive"` | |
| `.btn-lg`, `.btn-icon` | `Button size="lg"`, `size="icon"` | |
| `.btn-block` | `Button` con `className="w-full"` | |
| `.link` | il `Link` del router (o un `<a>`) con `cn(buttonVariants({ variant: "link" }))`: un collegamento non è un `Button` | |
| `.input` su `<input>` | `Input` dentro `Field` | o dentro `tassullo-form-field`, che però vuole **react-hook-form**: se l'app non lo usa, adottarlo vuol dire riscrivere i moduli |
| `.input` su `<select>` | `select` (lista corta) o `combobox` (lista lunga) | mai il `<select>` nativo |
| `.input` su `<textarea>` | `Textarea` | |
| `.field-label` | `tassullo-form-field` (o `Field` + `FieldLabel`) | |
| `.badge .badge-*`, `.badge-accent` | `Badge` con `className={TONO.<tono>}` | `TONO` da `@/lib/toni`; un'etichetta che si legge |
| `.chip`, `.chip-sm` di filtro | `ToggleGroup` | un filtro che si clicca |
| `.card` e le sue parti (`-name`, `-meta`, `-sub`, `-code`) | `Card` (`CardTitle`, `CardDescription`…) | |
| `.card-clickable` | `Card` con dentro il collegamento o il bottone | la card non finge di essere cliccabile |
| `.alert .alert-danger` | `Alert variant="destructive"` | per una riga accanto al contenuto |
| `.alert-success`, `-warn`, `-info` | `Alert` con `className={TONO_ALERT.<tono>}` | `Alert` ha solo `default` e `destructive` |
| `.alert-danger` al posto di una sezione | `tassullo-error-state` | per un'intera sezione che non si è caricata |
| `.alert-success` «Salvato» | `sonner` (`toast`) | |
| `.table`, `.table-scroll` | `tassullo-data-table` | ricerca, ordinamento, stati vuoti; `Table` per una tabella piccola e statica |
| `.skel` | `tassullo-page-skeleton` o `Skeleton` | |
| stato vuoto a mano | `tassullo-empty-state` | |
| `.sidebar`, `.sidebar-item` e il layout dell'app | `tassullo-app-shell` | |
| breadcrumb «← Elenco» | `tassullo-page-header` (il `percorso`) | |
| barra di tab a mano | `Tabs` | come nella pagina d'esempio `tassullo-pagina-scheda`; con più tab di quante ne stiano in riga, la ricetta «Molte Tab» con la `Select` |
| finestra modale a mano | `tassullo-responsive-dialog` | Esc, fuoco, clic fuori, e il cassetto sul telefono |
| `window.confirm(…)` | `tassullo-confirm-dialog` | |
| `window.prompt(…)` | `tassullo-confirm-dialog` col campo obbligatorio | |
| caricamento file | `tassullo-file-upload` | |
| confronto prima/dopo | `tassullo-diff-view` | |
| tabella da modificare cella per cella | `tassullo-data-grid` | |
| righe raggruppate per categoria | `tassullo-data-table` con l'albero (`getSottoRighe`) | la categoria è la riga madre |

### Variabile v1 → classe v2

Nel codice migrato non si scrivono variabili CSS: si usano le utility sui token. Se una
regola CSS scritta a mano sopravvive, si traduce così.

| v1 | v2 |
|---|---|
| `--color-page-bg` | `bg-background` |
| `--color-surface` | `bg-card` (`bg-popover` nei popup) |
| `--color-surface-2` | `bg-muted` |
| `--color-surface-3` | `bg-accent`: è il grigio dell'hover, **non** l'arancio |
| `--color-text` | `text-foreground` |
| `--color-text-muted`, `--color-text-hint` | `text-muted-foreground` (il terzo livello di testo non c'è più) |
| `--color-accent` | `bg-primary`, **mai per il testo** |
| `--color-accent-hover` | `bg-primary-hover` |
| `--color-accent-text` | `text-primary-foreground` |
| `--color-accent-ink` (link) | `text-accent-ink` |
| `--color-accent-light` | `bg-primary-subtle` |
| `--color-accent-border` | `border-primary-border` |
| `--color-border` | `border-border` |
| `--color-border-strong` | `border-border-strong` |
| `--color-danger` | `bg-destructive` (fondo); il testo d'errore passa dalla variante `destructive` del componente |
| `--color-danger-bg`, `-text`, `-border` | `bg-destructive-subtle`, `text-destructive-subtle-foreground`, `border-destructive-border` |
| `--color-success…`, `--color-warn…`, `--color-info…` | `success`, `warning`, `info`, con le stesse terne `-subtle`, `-subtle-foreground`, `-border` |
| `--color-overlay` | lo mette il dialogo |
| `--color-on-dark`, `--color-on-danger` | il `-foreground` del fondo pieno (`text-destructive-foreground`, `text-info-foreground`…), che i componenti mettono da sé |
| `--color-danger-hover` | lo fa la variante `destructive` |
| `--color-badge-*` | i toni di `Badge` (`TONO`) |
| `--transition-fast` | le transizioni di Tailwind (`transition-colors`), che valgono già 0,15 s |
| `--page-max-width` | `larghezza="pagina"` del guscio (1180px) |
| `--color-sidebar-*` | li usa il guscio |
| `--radius-sm`, `-md`, `-lg`, `-full` | `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-full` |
| `--shadow-sm`, `-md`, `-lg`, `-modal` | `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-modal` |
| `--space-1…6`, `--space-page` | le spaziature di Tailwind (`p-2`, `gap-4`…); il respiro di pagina lo dà il guscio |
| `--font-family` | Inter, che arriva col tema; non si scrive |
| `--font-mono` | `font-mono`, solo per il codice sorgente mostrato in pagina |
| `--focus-ring` | lo disegnano i componenti |

**La scala dei testi cambia nomi e misure**: i gradini sono sette in tutti e due, ma non gli
stessi.

| v1 | px | v2 | px |
|---|---|---|---|
| `--text-xs` | 11 | `text-xs` | 12 |
| `--text-sm` | 12 | `text-sm` | 13 |
| `--text-md` | 13 | `text-sm` | 13 |
| `--text-base` | 14 | `text-base` | 15 |
| `--text-lg` | 15 | `text-lg` | 16 |
| `--text-xl` | 18 | `text-xl` | 19 |
| `--text-title` | 26 | `text-2xl` | 27 |

`text-md` e `text-title` nel v2 non esistono, e scriverli non dà errore: il testo prende la
misura del contenitore.

### Numeri e codici

Le regole sono nel blocco per il `CLAUDE.md` (`docs/INTEGRAZIONE.md`), ma si applicano
riscrivendo le pagine, quindi vanno sapute prima:

- `Intl.NumberFormat`, `toLocaleString()` e `toFixed()` su un numero da mostrare →
  `intero()`, `decimale()`, `valuta()` o `formattatore()` di `@/lib/numeri` (item
  `numeri`), che scrivono sempre il punto delle migliaia;
- i numeri in colonna → `tabular-nums` (le tabelle del design system lo hanno già);
- codici, lotti, partite IVA in `font-mono` → il carattere del testo: in tabella nel colore
  del testo, fuori dalle tabelle `text-sm text-muted-foreground`. `font-mono` resta solo per
  il codice sorgente mostrato in pagina;
- anni, codici e CAP non si formattano mai come numeri.

### Cose che il design system non risolve da sé

Vanno decise nell'app, durante la migrazione.

- **Le scelte con un valore libero** (`<datalist>`, o una tendina con «Altro» che apre un
  campo) non hanno un componente nel v2: la scelta si fa dalla lista, con `combobox` o
  `select`. Se l'app ha davvero bisogno di un valore fuori lista, si propone al design
  system (modulo «Proposta»), non si scrive in casa.
- **Gli errori dentro le finestre**: un errore del server durante un salvataggio si mostra
  dentro il dialogo aperto, non nell'avviso della pagina che sta dietro.
- **Le azioni che cancellano** passano da `tassullo-confirm-dialog`, o da
  `tassullo-toast-con-annullo` se l'azione si può annullare.
- **La soglia fra tabella e schede la decide l'app.** `useSoglia(query)` non porta un
  numero, perché dipende da quante colonne ha quella lista (item `use-soglia`, import da
  `@/hooks/use-soglia`). Come si sceglie: si apre la
  pagina, si restringe la finestra, e la soglia è la larghezza sotto cui una colonna che
  serve va a capo o si tronca. Si scrive come `(min-width: …)` nella pagina.
- **Il logo Microsoft** del bottone d'accesso resta dell'app: nella pagina d'esempio
  `tassullo-pagina-login` arriva come nodo, `logoMicrosoft`.
- **Il calendario a eventi** vuole dal backend, per ogni evento, un inizio e una fine
  (`end` esclusivo: un fermo del solo 9 settembre finisce alle 00:00 del 10), le mezzanotti
  del fuso di visualizzazione per gli eventi di un giorno intero, e un `id` stabile.
  `onGiornoClick` si accende sapendo che la griglia del mese non si naviga con le frecce:
  l'appiglio da tastiera è il bottone «+» che il blocco accende insieme.
- **Un campo nascosto anti-bot** in una pagina di registrazione e **il misuratore di
  robustezza della password** restano codice della pagina: non sono materia del design
  system.

## I documenti dell'app

Si aggiornano insieme alla migrazione, non prima: fino a lì il codice è v1, e i documenti
devono descrivere il codice che c'è. Nella stessa PR, oppure subito dopo l'unione se le regole
dell'app tengono i documenti di conduzione fuori dai rami.

- **`CLAUDE.md`**: la sezione di stile del v1 («solo variabili del tema», le ricette di
  `styleguide.html`, `npm update @tassullo/theme`) si **sostituisce** col blocco «Regole da
  inserire nel CLAUDE.md della nuova app» di `docs/INTEGRAZIONE.md`, tal quale. Si toglie la
  riga del passo 0 («finché l'app non è migrata…»), e si corregge ogni indirizzo vecchio del
  repository del v1.
- **La specifica delle interfacce**, se l'app ne ha una: i principi di stile che nominano
  classi o variabili del v1 si riscrivono coi nomi del v2 (`Button`, `bg-card`,
  `text-muted-foreground`…); lo standard degli stati — caricamento, errore, vuoto, successo
  — nomina i blocchi (`tassullo-page-skeleton`, `tassullo-error-state`,
  `tassullo-empty-state`, `toast`).
- **La roadmap** prende la voce di manutenzione ricorrente, **la checklist** il paragrafo
  «Design system» con gli item installati: entrambi in `docs/INTEGRAZIONE.md`, sezione «Nel
  piano dell'app».
