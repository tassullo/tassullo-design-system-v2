# CHECKLIST — **Tassullo Design System 2.0**

> **Fonte di verità dell'avanzamento.** Stati: `TODO | IN_PROGRESS | BLOCKED | REVIEW | DONE`. Si aggiorna a ogni cambio di stato e al termine di ogni attività significativa. Il dettaglio dei task (Prompt, File, Accettazione completa) è in `PIANO.md`, che qui non si duplica; il diario è `WORKLOG.md`.
> Un task = una sessione Claude Code, salvo indicazione contraria. **41 righe = 42 sessioni**: `M3.3 data-table` vale 2 sessioni (unico task doppio del piano).
> **La colonna del criterio è una sintesi, e ha un tetto.** Il verdetto, i due o tre numeri che contano, un rimando: **due o tre righe di tabella, non di più**. Il ragionamento, le misure, le trappole e le rettifiche stanno in `WORKLOG.md` e in `docs/DECISIONI.md` — qui non si duplicano. Non è pignoleria: una riga che non si legge smette di essere una fonte di verità, ed è quello che era successo. Ripulita il 2026-09-10 su rilievo di Francesco — **da 48 a 26 KB**, la riga peggiore da 3260 a 426 caratteri — senza perdere niente, perché ogni task ha la sua voce nel diario e ogni decisione la sua sezione.
> Nessuna colonna Responsabile: il progetto è condotto da una sola persona (Francesco) con Claude Code. Se un giorno lavorassero in due, si aggiunge qui la colonna e si adotta la regola dei worktree di Anagrafe.

## FASE 0 — Scaffold e fondamenta (5 sessioni)

Gate: `npm run storybook` mostra una primitiva shadcn di prova con Tailwind v4 attivo e i tre interruttori (tema, densità, viewport); i quattro documenti di conduzione esistono; git locale inizializzato. **Gate superato il 2026-09-07** (commit `a435201`).

| Attività | Stato | Dipendenze | Criterio di accettazione (sintesi) |
|---|---|---|---|
| M0.1 Documenti di conduzione e struttura | DONE | | `CHECKLIST.md`, `WORKLOG.md`, `CLAUDE.md` coerenti con `PIANO.md`; tutti i task elencati; `CLAUDE.md` con tutte le regole del piano |
| M0.2 Scaffold Vite + Tailwind v4 + `shadcn init` | DONE | M0.1 | `npm run dev` con utility Tailwind attiva; `shadcn add button` compila **in variante Base UI**, meccanismo di selezione scritto in `docs/DECISIONI.md` |
| M0.3 Storybook: la style guide 2.0 | DONE | M0.2 | `npm run storybook` apre l'indice con una story di prova; i tre interruttori funzionano; `build-storybook` produce `storybook-static/` servibile |
| M0.4 MCP shadcn e prerequisiti d'ambiente | DONE | M0.2 | dall'MCP si elencano i componenti shadcn **e** gli item del registry Tassullo locale; versioni Node/npm annotate in `docs/DECISIONI.md` |
| M0.5 Git locale | DONE | M0.1..M0.4 | `git log` col commit iniziale, `git remote -v` vuoto (D4), `CLAUDE.md` rivisto su ciò che le 4 sessioni hanno prodotto davvero |

## FASE 1 — Tema Tassullo (5 sessioni)

Gate: la pagina Palette mostra tutte le coppie token nelle 4 combinazioni (light/dark × normale/touch); `check:contrast` passa su tutte le coppie `X`/`X-foreground`.
**Superata** con M1.3–M1.5: `check:contrast` verde su **48 coppie**, le story `Tema/Palette` (56 token, valore letto dal DOM) e `Tema/Densità`, e il tema che esce dal repo come item con **installazione provata end-to-end** su un'app vuota. Riaperta e richiusa da **M1.6**, che ha riallineato la scala tipografica → `WORKLOG.md`, voci M1.3–M1.6.
Dipendenze di fase: FASE 0.

| Attività | Stato | Dipendenze | Criterio di accettazione (sintesi) |
|---|---|---|---|
| M1.1 Mappa dei token e script di conversione | DONE | M0.2 | `PIANO.md` §2bis scritto; `npm run check:contrast` gira e **fallisce** se si forza `--primary-foreground` a bianco |
| M1.2 `tassullo-theme.css`, modalità chiara | DONE | M1.1 | contrasto verde (24/24); `bg-primary text-primary-foreground` rende arancione con testo nero, verificato a video |
| M1.3 Modalità scura (chiude D2) | DONE | M1.2, M0.3 | contrasto verde 48/48 (24 per modalità); story `Tema/Palette` con le due palette affiancate e `docs/img/M1.3-palette-chiaro-scuro.png`; **D2 chiusa** |
| M1.4 Densità touch | DONE | M1.2, M0.3 | interruttore verificato senza ricaricare; default **48px** (xs 36, sm 42, lg 54, icona 24), misure lette dal DOM nella story `Tema/Densità`; due eccezioni annotate (sidebar → M2.5, `text-[0.8rem]` di `sm` → M2.1) |
| M1.5 Il tema come item di registry | DONE | M1.3, M1.4 | `registry validate` verde su 2 item; **prova d'installazione end-to-end** su app Vite vuota, con `vite build` che compila `text-*` come `var()` e i due blocchi densità; pagina Palette coi 56 token, valore letto dal DOM e click-to-copy; `cssVars`/`css` scartati con la prova (`DECISIONI.md` §11) |
| M1.6 Riallineamento della scala tipografica | **DONE** 2026-09-10 | D16 chiusa | ✔ attuata **D16**: scala in vigore `xs 12 / sm 13 / base 15 / lg 16 / xl 19 / 2xl 27 / 3xl 31`, **zero gradini nostri** — `--text-md` fuso in `sm`, `--text-title` diventato `2xl`, `3xl` tarato accanto. → dettaglio in `WORKLOG.md`, voce **M1.6** |

## FASE 2 — Primitive (9 sessioni)

Gate: M2.9 verde su tutto il set (contrasto, tastiera, densità, dark), con axe-core in CI. **Superato il 2026-09-10**: `npm run test:a11y`, **852 scansioni, 0 violazioni**, dentro `npm run check` e in `.github/workflows/gate.yml`. Dipendenze di fase: FASE 1; ogni primitiva in variante **Base UI** (D9).

**Due rilievi restano aperti.** Gli altri tre sono evasi da M2.9, e la loro storia — coi conti che cambiavano quando la misura imparava ad aprire i popup, e le due rettifiche di falsi positivi — sta in `WORKLOG.md` (M2.6, M2.9) e in `docs/DECISIONI.md` §27.

1. **Il contorno dei controlli sta sotto 3:1** (WCAG 1.4.11), su tutto il set e in entrambe le modalità: `border-input` misurato **1.27 in chiaro, 1.36 in scuro**. Non viene dal ri-stile, è il valore ereditato dal v1, e `check:contrast` non lo vede perché verifica **solo coppie di testo**. È una decisione di **palette**, in `hex-to-oklch.ts`.
2. **Filtri: sorvolato e acceso sono lo stesso grigio** — noto e **accettato** (Francesco, 2026-09-09): tingere ogni filtro acceso col brand gli toglierebbe il potere di segnalare. **Si riprende in FASE 4**, su una barra filtri vera.

| Attività | Stato | Dipendenze | Criterio di accettazione (sintesi) |
|---|---|---|---|
| M2.1 Fondamenta (`button`, `badge`, `separator`, `skeleton`, `spinner`, `avatar`, `kbd`, `button-group`, `typography`, `lib/utils.ts`) | DONE | M1.5 | `button` in tutte le varianti/stati nelle 4 combinazioni; `typeset` riproduce la scala v1 in **Inter** e fissa la regola delle cifre; **chiusi i 4 rilievi su `button`** più l'*incomplete* su `ghost` e il `text-[0.8rem]` di `sm` → dettaglio in `WORKLOG.md`, voce **M2.1** |
| M2.2 Form (`field`, `input`, `input-group`, `label`, `textarea`, `select`, `checkbox`, `switch`, `radio-group`, `slider`) | DONE | M2.1 | form di prova con **14 fermi di tabulazione**, tutti in ordine di DOM, tutti con nome accessibile e anello di fuoco visibile; **axe 158 scansioni (79 story × 2 modalità), 0 violazioni**. → dettaglio in `WORKLOG.md`, voce **M2.2** |
| M2.3 Overlay (`dialog`, `alert-dialog`, `drawer`, `sheet`, menu, `popover`, `tooltip`, `sonner`, `command`) | DONE | M2.1 | **11 primitive, 32 item, `registry validate` verde.** Fuoco intrappolato ed `Esc` verificati **in un browser vero** su tutti e 5 i modali: `Invio` apre, 8 `Tab` non escono, `Esc` chiude, il fuoco torna al grilletto (il `popover` non intrappola, ed è voluto: non è modale). → dettaglio in `WORKLOG.md`, voce **M2.3** |
| M2.4 Contenuto (`card`, `tabs`, `table`, `alert`, `empty`, `accordion`, `collapsible`, `scroll-area`, `resizable`, `progress`, `aspect-ratio`, `carousel`) | DONE | M2.1 | **12 primitive, 44 item, `registry validate` verde.** Le quattro varianti semantiche di `alert` si fanno con `className`, non con quattro nomi di variante: scala 4bis ferma al gradino 1, e la strada opposta è stata provata e misurata → dettaglio in `WORKLOG.md`, voce **M2.4**, e `docs/DECISIONI.md` §25 |
| M2.5 Navigazione (`sidebar`, `breadcrumb`, `pagination`) | DONE | M2.1 | **3 primitive + 1 hook, 48 item, `registry validate` verde.** Sidebar antracite già dai token `--sidebar-*`, e lo stato attivo del preset **coincide alla lettera** con la regola del v1 (`bg-sidebar-accent` + `sidebar-accent-foreground`): scala 4bis ferma al gradino 1 su tutte e tre. → dettaglio in `WORKLOG.md`, voce **M2.5** |
| M2.6 Filtri e selezione (`toggle`, `toggle-group`, `combobox`, `multi-select`/`tag-input`) | DONE | M2.2, M2.3 | **3 primitive, 51 item, `registry validate` verde.** Il piano ne chiedeva quattro: `combobox` **non si compone più** da `command` + `popover`, è un item shadcn suo su Base UI, e con `multiple` porta **anche** il multi-select e il tag-input — pillole comprese. → dettaglio in `WORKLOG.md`, voce **M2.6** |
| M2.7 Date (`calendar`, `date-picker`) | DONE | M2.3 | **1 primitiva, 52 item, `registry validate` verde.** **L'eccezione a Base UI di D9 non si pone**: Base UI non ha un calendario e shadcn ne spedisce uno solo, su `react-day-picker` + `date-fns` — nessun secondo candidato da valutare, quindi niente da motivare. → dettaglio in `WORKLOG.md`, voce **M2.7** |
| M2.8 Dati (`chart`, palette categorica) | DONE | M2.4 | **1 primitiva, 53 item, `registry validate` verde.** `--chart-1..5` non sono cinque colori scelti ma **cinque pioli di una scala di chiarezza**, e il passo non è deciso: è **1.4935:1**, quello che `--primary` e `--success` hanno già fra loro (misurato). → dettaglio in `WORKLOG.md`, voce **M2.8** |
| M2.9 Gate di fase: audit del set | DONE | M2.1..M2.8 | **852 scansioni, 0 violazioni.** `a11y.test = 'error'`; `addon-vitest` + Playwright/Chromium; `npm run test:a11y` fa **quattro passate** — {chiaro, scuro} × {popup chiuso, aperto} — e **dichiara quali popup apre** (47/48). → dettaglio in `WORKLOG.md`, voce **M2.9** |

## FASE 3 — Blocchi applicativi Tassullo (11 sessioni)

Gate: M3.10 — una pagina reale di Anagrafe ricostruita in Storybook **usando solo i blocchi**, senza CSS di pagina.
Dipendenze di fase: FASE 2. Ogni blocco dichiara i propri `registryDependencies`.

| Attività | Stato | Dipendenze | Criterio di accettazione (sintesi) |
|---|---|---|---|
| M3.1 `tassullo-app-shell` | **DONE** 2026-09-10 | M2.5 | ✔ quattro celle viewport × densità misurate in Chromium: larghezza utile **1148 / 1008 / 343 / 327px**, caratteri per riga **165 / 136 / 49 / 44**; prima misura di D10 a verbale (`docs/DECISIONI.md` §29). → dettaglio in `WORKLOG.md`, voce **M3.1** |
| M3.2 `page-header` | **DONE** 2026-09-10 | M3.1, M2.5 | ✔ **2 blocchi, 56 item, `registry validate` verde.** La pagina *dichiara* percorso e azioni, un **portale** le rende nella fascia: il guscio si monta una volta sola e non può ricevere prop. Due scostamenti a verbale — il titolo resta solo in `sr-only`, e le soglie sono `@container` sulla fascia (otto celle misurate, 1152→327px utili, **una riga sola ovunque**). → dettaglio in `WORKLOG.md`, voci **M3.2** e **Coda di M3.2** (le story dichiarano la larghezza del banco; il filo verticale passa al guscio) |
| M3.3 `data-table` (**2 sessioni**) | TODO | M2.4, M2.6 | tabella di prova su ~500 righe finte, ordinabile e filtrabile da tastiera; degrado a 375px verificato |
| M3.4 `form-field`, `confirm-dialog`, `responsive-dialog` | TODO | M2.2, M2.3 | la stessa chiamata rende come dialog a 1440px e come drawer a 375px, **senza `if` nella pagina** |
| M3.5 Stati (`empty-state`, `page-skeleton`, `error-state`) | TODO | M2.4, M2.1 | standard unico per caricamento/errore/vuoto/successo, conforme a INTERFACCE.md §1 di Anagrafe |
| M3.6 `file-upload` | TODO | M2.2, M2.4; D8 | 5 file simulati con uno che fallisce; utilizzabile **da tastiera senza trascinamento** |
| M3.7 `pdf-preview` e `version-timeline` | TODO | M2.4; D8 | PDF reale dei riferimenti FileMaker aperto e sfogliato; timeline su 5 revisioni finte. → dettaglio in `WORKLOG.md`, voce **M3.7** |
| M3.8 `rich-text-editor` | TODO | M2.2; D8 | incolla da Word **senza stili**; limite 2048 caratteri visibile prima di sbatterci contro |
| M3.9 `diff-view` e `split-view` | TODO | M2.4; D8 | diff parola-per-parola su due testi reali di scheda tecnica; split-view impilato a 375px |
| M3.10 Gate di fase | TODO | M3.1..M3.9 | pagina Prodotti di Anagrafe ricostruita con soli blocchi, **zero CSS di pagina**; screenshot a confronto in WORKLOG |

## FASE 4 — Pagine modello (6 sessioni)

Gate: una app Vite vuota installa `tassullo-app-shell` + `pagina-lista` + `pagina-login` e in dieci minuti è navigabile e in stile, senza scrivere layout.
Dipendenze di fase: FASE 3. Ogni pagina è un `registry:block` con dati finti tipizzati.

| Attività | Stato | Dipendenze | Criterio di accettazione (sintesi) |
|---|---|---|---|
| M4.1 `pagina-login` | TODO | M3.4, M3.5 | schermata di accesso predisposta per MSAL/Entra ID, con errore e "accesso in corso" |
| M4.2 `pagina-lista` | TODO | M3.3, M3.5, M2.6 | intestazione + barra filtri + `data-table` paginata + stati vuoto/caricamento/errore, provata nelle **quattro celle viewport × densità**; **chiude D10** sulla cella `375px × touch` |
| M4.3 `pagina-scheda` | TODO | M3.2, M3.4, M3.7 | breadcrumb, stato e azioni, tab anagrafica/documenti/storico, form lettura↔modifica, timeline in coda |
| M4.4 `pagina-dashboard` | TODO | M2.8, M3.3 | indicatori, due grafici, tabella attività recenti, area avvisi |
| M4.5 `pagina-admin` | TODO | M3.3, M3.4 | tab, tabella con azioni per riga, dialoghi di conferma, banner utente senza permessi |
| M4.6 Stati di sistema e gate di fase | TODO | M4.1..M4.5 | `pagina-errore` (404, accesso negato, errore server, manutenzione); i **dieci minuti cronometrati davvero** e annotati in WORKLOG |

## FASE 5 — Registry, distribuzione e guida di adozione (6 sessioni)

Gate: l'installazione in un'app vergine produce un'app in stile Tassullo che compila — **verificata in locale, prima di qualunque pubblicazione** — seguendo solo i documenti scritti qui.
Dipendenze di fase: FASE 4.

| Attività | Stato | Dipendenze | Criterio di accettazione (sintesi) |
|---|---|---|---|
| M5.1 `registry.json` completo | TODO | FASE 4 | `registry validate` verde e `list` elenca tutti gli item attesi, con `target` e `registryDependencies` corretti |
| M5.2 Prova d'installazione end-to-end | TODO | M5.1 | app Vite usa-e-getta compilata e in stile dal registry **locale**; lista degli attriti d'uso in WORKLOG |
| M5.3 `INTEGRAZIONE.md` v2 (app nuova) | TODO | M5.2 | seguendo **solo** il documento si porta un'app Vite vuota a una pagina in stile; tempo effettivo in WORKLOG |
| M5.4 Regole per `CLAUDE.md` e piani delle app | TODO | M5.3 | blocco di regole copiabile senza adattamenti; `DECISIONI.md` motiva no-npm, Base UI, `primary`≠`accent`, oklch, font non distribuito |
| M5.5 `GUIDA-MIGRAZIONE.md` (app esistente) | TODO | M5.4 | **passo 0 eseguito davvero su Anagrafe** (solo `components.json` + `.mcp.json`, zero modifiche a codice e stili); guida verificata a secco sulle sue 10 pagine |
| M5.6 Pubblicazione su GitHub + Pages | IN_PROGRESS | M5.5 | **Repo online e Pages attivo dal 2026-09-10** (D4 chiusa e anticipata). Restano: tag `v2.0.0` e install da GitHub riuscita fuori dal repo. La storia è **già stata ripulita** il 2026-09-09 (i font in base64 tolti da tutti i commit con `git-filter-repo`) → dettaglio in `WORKLOG.md` |

## Decisioni

| Decisione | Stato | Blocca | Nota |
|---|---|---|---|
| D2 valori della palette scura | **CHIUSA** 2026-09-07 | — | chiusa guardandola affiancata al chiaro, non al buio. Neutri dalla sidebar v1, brand invariato, tenui specchiati a gradini fissi; tre scostamenti misurati (`--sidebar`, `--info`, `--warning`). Motivazione in `WORKLOG.md` e `PIANO.md` §2bis |
| D3 come si servono i font alle app | **DONE** (2026-09-08) | nessuno | **Chiusa**: Inter va nel registry, item `tema-font`, coi file in **data URI** dentro il CSS — perché `shadcn build` legge i file come testo e un `.woff2` arriverebbe corrotto senza errore (73.016 byte → 69.186 caratteri, misurato). → dettaglio in `docs/DECISIONI.md` e in `WORKLOG.md` |
| D4 quando pubblicare su GitHub | **CHIUSA** 2026-09-10 — **subito, pubblico** | — | Forzata più che scelta: org su piano **free**, dove Pages vive solo sui repo pubblici, e la scorciatoia `owner/repo/item` della CLI shadcn è documentata solo per il pubblico. Privato avrebbe messo un token GitHub in ogni app, CI ed editor. Tolto dal repo `public/fonts/` per intero (nota Lineto). → `WORKLOG.md`, voce **D4** |
| D5 destino di `components.css` e `stylelint-config.cjs` v1 | TODO | nessuno | fuori dal perimetro: si dismettono a ultima app migrata |
| D6 quando migrano Anagrafe / Studio / Officina | TODO | nessuno | ognuna decide per sé con la guida M5.5; nessuna scadenza |
| D7 se `docx/` resti nel repo v1 | TODO | nessuno | nessuna urgenza, mai |
| D8 librerie di terze parti per i blocchi | TODO | M3.6..M3.9 | PDF, editor, diff, dropzone: una per una **nel task che la incontra**, privilegiando il lazy e la sostituibilità |
| D12 `next-themes` va tolto da `sonner`? | **CHIUSA** 2026-09-09 — **no, si lascia** | nessuno | Aperta e chiusa in giornata, in M2.3. `sonner.tsx` importa `useTheme` da `next-themes`, che non usiamo: la modalità la mettiamo come classe sulla radice. → dettaglio in `docs/DECISIONI.md` e in `WORKLOG.md` |

| D13 il marchio Tassullo come item del registry | **CHIUSA** 2026-09-10 — **(c) `mask-image` nel CSS del tema** | **entro la fine della FASE 2** (M2.9) | Aperta in M2.5. **L'asset non manca più**: Roberto ha segnalato che Anagrafe ha il marchio in produzione da tempo — `frontend/public/tassullo-t.svg`, un `path` solo con due sottotracciati, `viewBox` 24×38, `fill-rule="evenodd"`. → dettaglio in `docs/DECISIONI.md` e in `WORKLOG.md` |
| D16 la scala tipografica è due punti sotto shadcn | **CHIUSA E ATTUATA** 2026-09-10 — **«+1» su ogni gradino, `md` fuso in `sm`, `title` eliminato** | attuata in **M1.6** (`DONE`) | Aperta in M3.1 da Francesco, confrontando la style guide coi blocchi di `ui.shadcn.com`. → dettaglio in `docs/DECISIONI.md` e in `WORKLOG.md` |
| D14 i bottoni-icona del combobox senza nome accessibile | **CHIUSA** 2026-09-09 — **si accettano, non si diverge** | nessuno | Aperta e chiusa in giornata, in M2.6. Il chevron che apre l'elenco e la crocetta di ogni pillola portano solo l'icona: axe dà `button-name`, gravità *critical*, 16 violazioni. → dettaglio in `docs/DECISIONI.md` e in `WORKLOG.md` |
| D11 il testo lungo: si adotta `typeset` di shadcn? | TODO — **il come è deciso, il se no** | **M3.8** (verdetto), da guardare insieme a **D10** | **Deciso da Francesco il 2026-09-08, e vale a prescindere dall'esito**: se si adotta, **i preset stanno nel registry**; nessuna app li modifica, e per un caso specifico **chiede un'aggiunta qui**. → dettaglio in `docs/DECISIONI.md` e in `WORKLOG.md` |
| D10 la densità touch su schermo stretto | TODO — **prima misura fatta** (M3.1, 2026-09-10) | **M4.2** (verdetto) | **La misura ribalta l'assunzione del piano**: a 375px la colonna non c'è più, quindi il padding toglie **16px in tutto** (343 → 327, −4,7%); a perdere il **10,6%** di testo per riga (**47 → 42** caratteri) è il **corpo**. In touch a 1440 il vincolo non è più `--container-page` ma la colonna. Numeri rimisurati dopo M1.6, col righello tarato → tabella in `docs/DECISIONI.md` §29; tre uscite in `PIANO.md`, M4.2 |
| D15 la tastiera del calendario non naviga | **CHIUSA** 2026-09-09 — **si accetta, non si diverge** | nessuno | Aperta e chiusa in giornata, in M2.7. → dettaglio in `docs/DECISIONI.md` e in `WORKLOG.md` |
| D16 quale set d'icone | **CHIUSA** 2026-09-10 — **si tiene Lucide** | nessuno | Scelta di Francesco fra i cinque set che la CLI shadcn sa installare (Lucide, Tabler, Phosphor, Remix Icon, HugeIcons), confrontati sulle 39 icone che le app useranno davvero. → dettaglio in `docs/DECISIONI.md` e in `WORKLOG.md` |

Accertamenti tecnici già chiusi sul campo (con la prova): **`docs/DECISIONI.md`**, nato in M0.2. Dove contraddice `PIANO.md`, vince lui e la contraddizione è annotata.

Chiuse il 2026-09-07 (registro in `PIANO.md` §4): **D1** — nome `tassullo-design-system-v2`; **D9** — libreria di primitive **Base UI**, con unica eccezione possibile sul calendario (M2.7), da motivare in WORKLOG.

## Assunzioni sotto osservazione

| Assunzione | Nota |
|---|---|
| A1 le app consumer restano su Vite + React + TypeScript | se cambia, cambia il target dei `registry:block` |
| A2 Tailwind v4 accettabile in tutte le app | introduce una build-dependency che il v1 non aveva |
| A3 taratura delle sessioni per analogia con Anagrafe | si verifica sul consuntivo, fase per fase |
| A4 esisterà una **app nuova** su cui il v2 debutta | se tarda troppo, anticipare una pagina di Anagrafe come collaudo (riapre D6) |
