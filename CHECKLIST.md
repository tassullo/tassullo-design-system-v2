# CHECKLIST — **Tassullo Design System 2.0**

> **Fonte di verità dell'avanzamento.** Stati: `TODO | IN_PROGRESS | BLOCKED | REVIEW | DONE`. Si aggiorna a ogni cambio di stato e al termine di ogni attività significativa. Il dettaglio dei task (Prompt, File, Accettazione completa) è in `PIANO.md`, che qui non si duplica; il diario è `WORKLOG.md`.
> Un task = una sessione Claude Code, salvo indicazione contraria. **41 righe = 42 sessioni**: `M3.3 data-table` vale 2 sessioni (unico task doppio del piano).
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
Superato con M1.3 e M1.4. L'asse **modalità**: `check:contrast` verde su **48 coppie**, 24 per modalità, e la story `Tema/Palette` le mostra affiancate. L'asse **densità**: la story `Tema/Densità` mostra normale e touch affiancate, con le altezze lette dal DOM. I due assi restano in due pagine e non in una griglia di quattro: la densità non cambia un colore e la modalità non cambia una misura, e una pagina che le incrociasse mostrerebbe due volte la stessa cosa. Con M1.5 la fase è **chiusa**: il tema esce dal repo come item `registry:theme` e l'installazione è stata provata end-to-end su un'app vuota, non solo validata. La pagina Palette porta ora tutti i 56 token col valore letto dal DOM e il click-to-copy.
Dipendenze di fase: FASE 0.

| Attività | Stato | Dipendenze | Criterio di accettazione (sintesi) |
|---|---|---|---|
| M1.1 Mappa dei token e script di conversione | DONE | M0.2 | `PIANO.md` §2bis scritto; `npm run check:contrast` gira e **fallisce** se si forza `--primary-foreground` a bianco |
| M1.2 `tassullo-theme.css`, modalità chiara | DONE | M1.1 | contrasto verde (24/24); `bg-primary text-primary-foreground` rende arancione con testo nero, verificato a video |
| M1.3 Modalità scura (chiude D2) | DONE | M1.2, M0.3 | contrasto verde 48/48 (24 per modalità); story `Tema/Palette` con le due palette affiancate e `docs/img/M1.3-palette-chiaro-scuro.png`; **D2 chiusa** |
| M1.4 Densità touch | DONE | M1.2, M0.3 | interruttore verificato senza ricaricare; default **48px** (xs 36, sm 42, lg 54, icona 24), misure lette dal DOM nella story `Tema/Densità`; due eccezioni annotate (sidebar → M2.5, `text-[0.8rem]` di `sm` → M2.1) |
| M1.5 Il tema come item di registry | DONE | M1.3, M1.4 | `registry validate` verde su 2 item; **prova d'installazione end-to-end** su app Vite vuota, con `vite build` che compila `text-*` come `var()` e i due blocchi densità; pagina Palette coi 56 token, valore letto dal DOM e click-to-copy; `cssVars`/`css` scartati con la prova (`DECISIONI.md` §11) |

## FASE 2 — Primitive (9 sessioni)

Gate: M2.9 verde su tutto il set (contrasto, tastiera, densità, dark), con axe-core in CI.
Dipendenze di fase: FASE 1. Ogni primitiva si aggiunge in `registry/tassullo/ui/` **in variante Base UI** (D9).

| Attività | Stato | Dipendenze | Criterio di accettazione (sintesi) |
|---|---|---|---|
| M2.1 Fondamenta (`button`, `badge`, `separator`, `skeleton`, `spinner`, `avatar`, `kbd`, `typography`, `lib/utils.ts`) | TODO | M1.5 | `button` in tutte le varianti/stati nelle 4 combinazioni; `typography` riproduce la scala v1 in **Inter** (la gerarchia dei pesi non è più in discussione: `DECISIONI.md` §14) **e fissa la regola delle cifre** (`tabular-nums` sui dati, `font-mono` ai soli codici di sistema, `Tema/Cifre`); **chiude i 4 rilievi su `button`** aperti da M1.2 e misurati con axe in M1.3, più l'*incomplete* su `ghost` in scuro e il `text-[0.8rem]` di `sm`, che M1.4 ha mostrato non seguire la densità (tabella in `PIANO.md`, M2.1) |
| M2.2 Form (`field`, `input`, `input-group`, `label`, `textarea`, `select`, `checkbox`, `switch`, `radio-group`, `slider`) | TODO | M2.1 | form di prova navigabile **interamente da tastiera**, ogni campo con etichetta associata |
| M2.3 Overlay (`dialog`, `alert-dialog`, `drawer`, `sheet`, menu, `popover`, `tooltip`, `sonner`, `command`) | TODO | M2.1 | focus trap e chiusura con Esc verificati; `drawer` presente (mattone del responsive di M3.4) |
| M2.4 Contenuto (`card`, `tabs`, `table`, `alert`, `empty`, `accordion`, `collapsible`, `scroll-area`, `resizable`, `progress`, `aspect-ratio`, `carousel`) | TODO | M2.1 | `alert` nelle 4 varianti semantiche; `card` **non** finge di essere cliccabile; **`table` porta `tabular-nums` sulle celle numeriche** — misurato in `Tema/Cifre`: scarto dei decimali 2.38px senza, **0px** con (`DECISIONI.md` §13) |
| M2.5 Navigazione (`sidebar`, `breadcrumb`, `pagination`) | TODO | M2.1 | sidebar antracite collassabile con stato attivo corretto; passaggio automatico a `Sheet` sotto la soglia mobile funzionante; **chiude l'unica eccezione allo scaling di M1.4** — le tre larghezze della sidebar sono costanti JS e non seguono la densità — verificata nelle due densità |
| M2.6 Filtri e selezione (`toggle`, `toggle-group`, `combobox`, `multi-select`/`tag-input`) | TODO | M2.2, M2.3 | combobox con 500 voci filtrabile **da tastiera**; `multi-select` con rimozione da Backspace; filtri distinguibili a colpo d'occhio dai badge |
| M2.7 Date (`calendar`, `date-picker`) | TODO | M2.3 | date-picker in italiano, settimana da lunedì, selezione di intervalli; eventuale eccezione a Base UI motivata in WORKLOG |
| M2.8 Dati (`chart`, palette categorica) | TODO | M2.4 | barre, linee e torta in light e dark; **5 serie distinguibili in scala di grigi** |
| M2.9 Gate di fase: audit del set | TODO | M2.1..M2.8 | `build-storybook` + test a11y verdi in CI (`a11y.test = 'error'`); audit manuale in WORKLOG, zero scostamenti non motivati |

## FASE 3 — Blocchi applicativi Tassullo (11 sessioni)

Gate: M3.10 — una pagina reale di Anagrafe ricostruita in Storybook **usando solo i blocchi**, senza CSS di pagina.
Dipendenze di fase: FASE 2. Ogni blocco dichiara i propri `registryDependencies`.

| Attività | Stato | Dipendenze | Criterio di accettazione (sintesi) |
|---|---|---|---|
| M3.1 `tassullo-app-shell` | TODO | M2.5 | shell resa a 1440px e a 375px **in entrambe le densità** (viewport × densità, non viewport soltanto); **prima misura di D10**: larghezza utile della colonna a 375px in touch |
| M3.2 `page-header` | TODO | M3.1, M2.5 | una sola forma di intestazione (titolo + breadcrumb + slot azioni) per tutte le pagine di tutte le app |
| M3.3 `data-table` (**2 sessioni**) | TODO | M2.4, M2.6 | tabella di prova su ~500 righe finte, ordinabile e filtrabile da tastiera; degrado a 375px verificato |
| M3.4 `form-field`, `confirm-dialog`, `responsive-dialog` | TODO | M2.2, M2.3 | la stessa chiamata rende come dialog a 1440px e come drawer a 375px, **senza `if` nella pagina** |
| M3.5 Stati (`empty-state`, `page-skeleton`, `error-state`) | TODO | M2.4, M2.1 | standard unico per caricamento/errore/vuoto/successo, conforme a INTERFACCE.md §1 di Anagrafe |
| M3.6 `file-upload` | TODO | M2.2, M2.4; D8 | 5 file simulati con uno che fallisce; utilizzabile **da tastiera senza trascinamento** |
| M3.7 `pdf-preview` e `version-timeline` | TODO | M2.4; D8 | PDF reale dei riferimenti FileMaker aperto e sfogliato; timeline su 5 revisioni finte |
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
| M5.6 Pubblicazione su GitHub + Pages | BLOCKED | M5.5; **D4** | install da GitHub riuscita fuori dal repo con tag `v2.0.0`; Storybook raggiungibile su Pages; **prima di pubblicare, ripulire la storia**: il commit `0c4f5e4` (2026-09-08) contiene i binari di Replica inlinati in un HTML, tolti dal working tree in `72520d8` ma non dalla storia. Finché il repo è locale non è esposto niente; pubblicandolo lo sarebbe |

## Decisioni

| Decisione | Stato | Blocca | Nota |
|---|---|---|---|
| D2 valori della palette scura | **CHIUSA** 2026-09-07 | — | chiusa guardandola affiancata al chiaro, non al buio. Neutri dalla sidebar v1, brand invariato, tenui specchiati a gradini fissi; tre scostamenti misurati (`--sidebar`, `--info`, `--warning`). Motivazione in `WORKLOG.md` e `PIANO.md` §2bis |
| D3 come si servono i font alle app | **DONE** (2026-09-08) | nessuno | **Chiusa**: Inter va nel registry, item `tema-font`, coi file in **data URI** dentro il CSS — perché `shadcn build` legge i file come testo e un `.woff2` arriverebbe corrotto senza errore (73.016 byte → 69.186 caratteri, misurato). Un solo `add @tassullo/tema` porta tema, font e licenza OFL; l'app non fa **nessuna richiesta di rete** per la tipografia, che era il punto. Byte verificati identici dopo il viaggio nel JSON. `DECISIONI.md` §15 |
| D4 quando pubblicare su GitHub | TODO | **M5.6** (solo) | tutto il resto funziona col registry locale via percorso di file |
| D5 destino di `components.css` e `stylelint-config.cjs` v1 | TODO | nessuno | fuori dal perimetro: si dismettono a ultima app migrata |
| D6 quando migrano Anagrafe / Studio / Officina | TODO | nessuno | ognuna decide per sé con la guida M5.5; nessuna scadenza |
| D7 se `docx/` resti nel repo v1 | TODO | nessuno | nessuna urgenza, mai |
| D8 librerie di terze parti per i blocchi | TODO | M3.6..M3.9 | PDF, editor, diff, dropzone: una per una **nel task che la incontra**, privilegiando il lazy e la sostituibilità |
| D10 la densità touch su schermo stretto | TODO | **M4.2** (verdetto), prima misura in **M3.1** | non è «quale densità su mobile»: touch nasce per il cantiere, cioè per il telefono, e lì il viewport è il più stretto. In touch la spaziatura cresce del 50%, il testo dell'8%, la larghezza dello schermo di 0. Da provare su una pagina vera; tre uscite in `PIANO.md`, M4.2 |

Accertamenti tecnici già chiusi sul campo (con la prova): **`docs/DECISIONI.md`**, nato in M0.2. Dove contraddice `PIANO.md`, vince lui e la contraddizione è annotata.

Chiuse il 2026-09-07 (registro in `PIANO.md` §4): **D1** — nome `tassullo-design-system-v2`; **D9** — libreria di primitive **Base UI**, con unica eccezione possibile sul calendario (M2.7), da motivare in WORKLOG.

## Assunzioni sotto osservazione

| Assunzione | Nota |
|---|---|
| A1 le app consumer restano su Vite + React + TypeScript | se cambia, cambia il target dei `registry:block` |
| A2 Tailwind v4 accettabile in tutte le app | introduce una build-dependency che il v1 non aveva |
| A3 taratura delle sessioni per analogia con Anagrafe | si verifica sul consuntivo, fase per fase |
| A4 esisterà una **app nuova** su cui il v2 debutta | se tarda troppo, anticipare una pagina di Anagrafe come collaudo (riapre D6) |
