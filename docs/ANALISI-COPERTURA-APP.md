# Mappa dei buchi del registry v2 — tre app, una misura sola (2026-09-19)

Ricognizione di **sola lettura** su Anagrafe (locale), Studio e Officina (via `gh api`, GET).
Tre sub-agenti Sonnet, un ambito ciascuno; i conteggi CSS di tutti e tre sono stati
**rifatti dall'orchestratore** con un metodo unico, perché due su tre contavano
`grep -c "{"`, che conta anche `@media`, `@keyframes` e i fotogrammi `0%`/`100%`.

> **Versione 3** — rivista lungo la sessione, a mano a mano che Francesco ha messo alla
> prova i rilievi. Le rettifiche sono in §6, ognuna con quello che l'ha smentita. **Tre
> delle quattro voci in cima alla prima stesura non reggono**, e la lezione è in §6.1:
> la prima stesura ordinava per conteggio senza chiedersi cosa il conteggio stesse
> contando.
>
> **Decisioni già prese** (2026-09-19): D-A approvata (§4); il doppio volto lo risolve il
> registry con un hook e una story (§2); `pagina-login` prende `modo` a tre vie e il
> guscio si apre — dettaglio in **`docs/SPEC-AUTH.md`**, che è il documento operativo per
> quella parte; il **calendario** esce dai differiti e si adotta da **`@reui`** (§6.11).
> La **barra di contesto** diventa un blocco (#12); resta differito il solo **slot in
> `app-shell`**. Resta aperto **come impacchettare i task** (§4bis).

## 0. Il metro

`scripts/conta-css.mjs` — toglie i commenti, attraversa il sorgente, conta un
**selettore** per ogni elemento di lista davanti a un blocco di dichiarazioni
(`.a, .b { }` = 2), e tiene le at-rule fuori dal conto.

| app | file .css | **selettori** | regole | at-rule |
|---|---:|---:|---:|---:|
| Anagrafe | 15 | **391** | 374 | 13 |
| Officina | 43 | **1 720** | 1 618 | 35 |
| Studio | 35 | **2 229** | 2 150 | 34 |
| **totale** | 93 | **4 340** | 4 142 | 82 |

**Anagrafe è il 9% del CSS che la migrazione dovrà assorbire.** È il numero che
decide la domanda su M5.5 (§5), ed è l'unico della prima stesura che nessuna
rettifica ha toccato.

## 1. Tabella dei pattern

Ordinata per **quanto lavoro vero resta da fare nel registry**, non per numero di
occorrenze: il conteggio grezzo aveva messo in cima due voci che si sono sciolte.

### Da fare

| # | pattern | stato | app e pagine | misura | azione | 4bis |
|---|---|---|---|---:|---|:--:|
| **1** | **Immagine d'entità con segnaposto** (una macchina, un ricambio — non una persona) | **MANCANTE**. `avatar` è tondo e per persone (`rounded-full`, max 40px); `aspect-ratio` è installata e **nessun componente la usa** | **2 app**: Officina 17 `<img>` / 16 `object-fit`, Studio 14 / 7. Anagrafe 2, ed è il marchio | 23 `object-fit`, 7 `aspect-ratio`; **`MacchinaIcon` ridefinita identica in 4 file** | **APPROVATO** 2026-09-19 — componente, `4:3`/`16:9` (§4 D-A) | 4 |
| **2** | **Lista a doppio volto**: tabella su schermo largo, schede su stretto | **Mattoni tutti presenti; manca la ricetta** — v. §2, la verifica elemento per elemento | **2 app, 6 pagine**: Officina Triage/Piani/Procedure/Ricambi/Admin (`useDesktop()`), Studio RadarOpere (`@media 900px`) | le 6 pagine pesano **467 selettori** in tutto (quota del solo doppio volto non scorporabile) | **un hook + una story**, non un blocco | 2 |
| **3** | **Fila di indicatori KPI** | DIVERSO — `RigaIndicatori` è una funzione **non esportata** dentro `pagina-dashboard.tsx:210`, e l'item spedisce un file solo | 3 file / 3 app (Anagrafe AdminBC, Studio Admin + RadarOpere) | ~8 sel. | scorporare in `tassullo-indicatori` | 2 |
| **4** | **Pagine auth oltre il login** (login ibrido, registrazione, password dimenticata, reimposta, verifica email) | **DECISO** — `pagina-login` prende `modo: "microsoft" \| "credenziali" \| "entrambi"` e il guscio si apre. Verificato sulle pagine vere: 13 elementi su 14 compongono già | **1 app, 5 pagine** (Studio) | 70 sel. (`auth.css`) | → **`docs/SPEC-AUTH.md`**, documento operativo | 2 |
| **5** | **Barra a segmenti** (N trattini, M accesi) | **MANCANTE**, ed è il solo pezzo nuovo dell'auth. Non è `progress`, che è una barra continua | **serve 3 volte in 2 pagine**: i passi di `/registrati`, il misuratore di robustezza della password nella stessa schermata, i passi di `TaskCalcoloStrutturale` | ~10 righe | scriverla | 2 |
| **6** | **Piè di tabella libero** (totali in coda a una tabella filtrabile) | MANCANTE — `data-table` non usa **mai** `TableFooter`, e `meta.sottototale` scatta solo dentro `riga.subRows.length` | 1 componente (Anagrafe VoceAnteprima) | 3 sel. | prop `piede` | 2 |
| **7** | **Conferma con campo di testo** | MANCANTE su due fronti: `ConfirmDialog` non ha corpo (`descrizione` finisce in `AlertDialogDescription`, cioè nell'elemento di `aria-describedby` — un controllo lì è sbagliato), e `onConferma: () => void \| Promise` non restituisce il valore digitato | 1 pagina (Anagrafe ChangeSets, oggi `window.prompt`) | 0 | prop nuove, o blocco gemello | 2 |
| **8** | **Chip-filtro con conteggio** | MANCANTE come forma. Il conteggio esiste (`useOpzioniSfaccettate`) ma vuole un'istanza TanStack: senza tabella non si usa | 1 app, 1 pagina (Studio Catalogo) | 4 sel. | una scena in più nella story di `toggle-group` | 2 |
| **9** | **Il contatore accanto all'intestazione** (`Segnalazioni da smistare` · `4`) | MANCANTE di poco — `LivelloPercorso.titolo` è una **`string`**, non un `ReactNode`: un badge nell'ultimo livello del percorso non ci sta | Officina Triage, Ricambi, Piani | — | o il numero va fra le `azioni`, o `titolo` diventa `ReactNode` | 2 |
| **10** | **Descrizione sotto il titolo di una scheda** | MANCANTE — `pagina-scheda` ha `titolo` ma non `descrizione` | 1 app, 9 pagine (Studio) | 17 sel. | prop facoltativa | 2 |
| **11** | **Calendario a eventi, mese + agenda** | **DECISO** — si adotta **`@reui/event-calendar`**, che è un registry **Base UI, preset `base-nova`, cioè il nostro identico `style`**. Fuori dai differiti | 1 app, 1 pagina (Officina Calendario) | 75 sel.; il sorgente adottato pesa ~233 KB su 326 (fuori `time-grid`, `resource-view`, `recurrence`) | installare (**MIT**, avviso di copyright da conservare), ri-stilare 3 classi, fasciare in un blocco, **estendere il gate** — v. §6.11 | 1/2 |
| **12** | **Barra di contesto** (l'entità attiva che attraversa le pagine) | **DECISO** — si fa il **blocco**; resta fuori il solo **slot in `app-shell`** | 1 app, **5 pagine** (Studio: Computo, TaskCalcoloStrutturale, AnalisiCapitolato, AnalisiProdotto, TaskSearch) | 12 sel. | `item` (`ItemMedia variant="icon"` + `ItemContent` + `ItemActions`) + `dropdown-menu` | 2 |

### Coperti — lavoro di sola migrazione, zero lavoro sul registry

| pattern | item | dove | misura | nota |
|---|---|---|---:|---|
| Modale scritta a mano (backdrop + `role="dialog"`) | `dialog` | **3/3 app, 9 file, 11 istanze** | ~35 sel. | in Anagrafe **nessuna delle 5 gestisce `Escape`** e nessuna ha focus trap: la migrazione chiude un difetto vero |
| Tab scritti a mano (`aria-current` invece di `role="tablist"`) | `tabs` | 3/3 app, 7 file | 19 sel. | stesso discorso: il pattern ARIA oggi è quello sbagliato |
| Riga espansa dentro la tabella | `data-table` prop **`pannelloRiga`** (M3bis.2) | Officina Triage, Studio Computo | — | il sub-agente Studio l'aveva dato mancante: v. §6.4 |
| Lista selezionabile master-detail | `item` con `variant={attiva ? "muted" : "default"}` | Anagrafe Norme | 3 sel. | v. §6.5 |
| Dropzone di caricamento | `file-upload` | Studio `FileUploadZone` | 6 sel. | forma quasi identica |
| Sezione pieghevole | `collapsible` | Anagrafe SistemaEditor (×3) | 4 sel. | corrispondenza diretta |
| Confronto prima/dopo | `diff-view` | Anagrafe Sistema | 5 sel. | **migliora**: oggi due `<pre>` affiancati senza evidenziamento a parola |
| `<select>` nativi | `select` Base UI | 81 in 3 app | — | già chiuso come **D19** |

### Differito — **uno solo, e non è un componente**

| pattern | dove | misura | innesco che lo riapre |
|---|---|---:|---|
| **Lo slot in `app-shell`** per una fascia persistente fra testata e `<Outlet/>` | Studio | — | **«quando una seconda app ha un contesto attivo che attraversa le pagine»** (un impianto, una famiglia). Oggi la pagina monta la barra da sé e funziona: manca solo la garanzia che non ci si dimentichi una pagina. Anagrafe e Officina un contesto del genere non ce l'hanno |

Usciti dai differiti, per ragioni opposte: il **wizard** perché il componente non esiste (§6.7), il **calendario** perché esiste già e si installa (§6.11).

### Smentiti

- **Kanban/corsie in Triage e Lavori** (Officina): letti per intero — tabella con righe espandibili e master-detail, nessuna colonna.
- **`CompetitorResultCard` come card-con-foto** (Studio): `grep '<img>'` → zero. È una card di report a colonne.
- **«Radar Opere Pubbliche» come grafico radar** (Studio): è monitoraggio bandi, nessun `recharts` nel file.
- **Chip-filtro con conteggio in Officina**: zero. Usano **badge cliccabili** col numero nel testo — forma diversa, da non confondere.
- **Griglia di card, foto, skeleton a griglia in Anagrafe**: assenti tutte e tre.
- **Mappa (Leaflet)**: buco reale ma **di dominio**. Integrarla legherebbe ogni consumatore a Leaflet anche senza mappe — stesso ragionamento di `pagina-login`/MSAL. Non si propone.
- **Scanner QR** (Officina): il contorno è già coperto; il riquadro video è `MediaDevices` + zxing, cioè dominio.

## 2. Il #2 elemento per elemento — perché non serve un blocco

Verificato sul `Triage` di Officina, markup e CSS veri (demo costruito in sessione con markup e CSS veri di Officina, non conservato).

**Faccia larga (sopra 1024px)** — `data-table` · `pannelloRiga` per la riga di dettaglio ·
`badge` · `select` ×3 · `button size="sm"` · `badge` per il contatore.
**Scoperto: la miniatura della macchina** → è il #1.

**Faccia stretta (sotto 1024px)** — `card` · **`toggle-group`** per i chip di Priorità e
Tipo (la scelta singola è il default di Base UI) · `select` · `button size="lg"` + `w-full` ·
`badge`. **Scoperto: niente.**

Tredici elementi su quattordici sono già nel registry. E anche il **bivio** c'è:
`hooks/use-mobile.ts` con `useIsMobile()`, che `responsive-dialog` usa già per scegliere
fra due alberi senza montarli entrambi.

Restano due attriti, ed entrambi si risolvono **senza toccare `use-mobile.ts`**, che è un
originale shadcn (modificarlo è una divergenza da riportare a mano a ogni loro versione):

1. **Le due soglie non sono la stessa soglia.** I 768px di `useIsMobile()` governano
   l'**arredamento** — sidebar e dialogo devono cambiare allo stesso pixel, e
   `responsive-dialog.tsx:105-122` spiega perché («un'interfaccia che cambia grammatica a
   40px di distanza si legge come un guasto»). I suoi soli consumatori sono `sidebar.tsx:69`
   e `responsive-dialog.tsx:196`. Il bivio tabella/schede è **contenuto**: dipende da quante
   colonne ha *quella* lista — nove nel Triage, e a 768 sarebbero illeggibili. Un numero solo
   sarebbe sbagliato in entrambe le direzioni. **La motivazione di `responsive-dialog` resta
   intatta: parla d'altro.**
2. **`useIsMobile` non andrebbe comunque bene per una lista.** Legge `matchMedia` in un
   `useEffect` che chiama `setState`: il primo render torna **sempre `false`, cioè
   scrivania**. Il file stesso lo documenta come difetto noto e aggiunge «qui non morde» —
   perché un dialogo al primo render è chiuso. Su una lista morde: sul telefono disegnerebbe
   la tabella a nove colonne e la sostituirebbe un fotogramma dopo. Officina l'ha già risolto
   — `useDesktop()` usa `useSyncExternalStore` e parte da **mobile**, apposta.

**Azione**: un hook nuovo da ~20 righe — `useSoglia('(min-width: 1024px)')`, su
`useSyncExternalStore` — dove **la query la dichiara la pagina**, che è l'unica a sapere
quante colonne ha. `useIsMobile()` resta intatto. Più **una story** che mostri la lista a
due facce composta con quello che c'è: oggi nessuno, aprendo Storybook, capirebbe che si fa così.

**Un'avvertenza per chi la scriverà**: le due facce non sono la stessa lista impaginata
due volte. La tendina diventa chip, la miniatura sparisce, il bottone cambia taglia.
Nessun blocco può indovinarlo dalle `colonne`: la faccia stretta la scrive la pagina, il
registry dà solo il bivio. E il dettaglio si apre da un posto diverso — in Officina si
clicca la foto, mentre `data-table` con `pannelloRiga` antepone da sé una colonna col
chevron (riga 3157) che non si sostituisce. Adattamento accettabile, ma da dire prima.

## 3. Il gradino 4bis di ogni azione

- **Gradino 1 (installare qualcosa che esiste già)**: **il calendario** (§6.11), e solo perché
  Francesco ha cercato **fuori da `@shadcn`** — l'MCP guarda i soli registry dichiarati in
  `components.json`, e lì ce n'era uno. **Lezione di metodo**: «l'ho chiesto all'MCP» non è
  gradino 1 esaurito, è gradino 1 esaurito *sui registry che abbiamo dichiarato*.
- **Gradino 1, dentro `@shadcn`**: *nessuno*. L'MCP dice che shadcn non ha
  `stepper`/`wizard`, `gallery`, `grid`, `kanban`, `timeline`, né un calendario a eventi
  (cercati uno per uno su `@shadcn`, 0 risultati; l'elenco `registry:ui` completo lo conferma).
  Le 11 primitive che ci mancano restano fuori per le ragioni già a verbale.
- **Gradino 2 (comporre con quello che c'è)**: le voci 2-10 della tabella.
- **Gradino 3 (adattare il design system)**: nessuna, dopo le rettifiche.
- **Gradino 4 (proporre, con approvazione)**: **il #1 soltanto**, ed è **approvato**.
  L'unico differito rimasto (la barra di contesto) è gradino 3-4 ma sospeso.

## 4. Le proposte

### D-A — Immagine d'entità con segnaposto (#1) — **APPROVATA da Francesco il 2026-09-19**

**Come approvata**: **componente**, non ricetta di classi. Rapporto **`4:3` di default**,
**`16:9`** disponibile e per ora senza consumatori — perché un rapporto è un *valore di una
prop*, non un componente, e la regola del secondo consumatore non si applica; e perché
l'insieme chiuso è ciò che impedisce il ripetersi delle **16 soglie `minmax`** in uso oggi.

Sarà la **prima riga di `registry/componenti-propri.json`**, oggi vuoto — ciò che il
`CLAUDE.md` chiama «la condizione da difendere». La riga deve riportare cosa fa, le strade
shadcn provate, chi ha approvato e quando.

**Perché un componente e non una ricetta** (deciso guardando le tre strade):
- **`Avatar` così com'è, sovrascritto dal punto di chiamata**: le classi da annullare sono
  cinque — `size-8` e `rounded-full` sulla radice più l'`after:rounded-full` del bordo
  (`avatar.tsx:18`), `aspect-square rounded-full` su `AvatarImage` (r. 32), `rounded-full`
  su `AvatarFallback` (r. 48). Funziona, ma va riscritto in ogni pagina: è la duplicazione
  che si vuole togliere, in forma di stringa invece che di SVG.
- **Una variante dentro `avatar.tsx`**: vietato dalla regola 4bis, e il motivo è misurabile
  — `check:registry` confronta i nostri file con `registry/.upstream/`, e una prop in più
  non si distingue da ciò che hanno cambiato loro al prossimo rilascio. È la divergenza cara.
- **Un file nuovo**: gradino 4 e riga nel registro, ma la divergenza sta dove **un originale
  shadcn non c'è**, quindi non c'è niente da riallineare per sempre.

**Il meccanismo esiste già e non va inventato**: `AvatarImage`/`AvatarFallback` di Base UI
*è* il ramo condizionale che serve. Il nuovo file lo mette in un riquadro non tondo insieme
ad `AspectRatio`.

**Resta aperto**: la larghezza della cella della griglia — la stessa domanda del rapporto
vista dall'altro lato. Va presa guardando una card vera a 4:3, nella sessione che scrive.

**La prova che manca una convenzione condivisa**: `function MacchinaIcon()` — stesso SVG,
parola per parola — è scritta in **quattro file** di Officina (`Triage`, `Lavori`,
`Macchina`, `Impianti`). Non è un'opinione sul design: è duplicazione già avvenuta.

### D-A, come era stata istruita

**Cosa manca**: un riquadro con rapporto d'aspetto dichiarato, ritaglio `object-cover`, e
un segnaposto quando la foto non c'è.

**Cosa è stato provato ai gradini 1-3**:
1. **shadcn**: nessun componente immagine. `aspect-ratio` c'è e dà solo il rapporto.
2. **Comporre**: `avatar` è la cosa più vicina e non regge — `rounded-full`, `size-10/8/6`,
   e `AvatarFallback` è testo o iniziali, non un'icona di dominio. `ItemMedia variant="image"`
   dà 40/32/24px, cioè la miniatura in riga, non la foto 4:3 di una scheda o di una card
   di catalogo. `aspect-ratio` + `object-cover` a mano è possibile, ma è esattamente la
   ricetta che oggi ogni app riscrive.
3. **Adattare il v1**: il v1 non ha niente su questo. È l'unico dei rilievi dove non c'è
   una scelta precedente da rispettare.

**La prova che manca una convenzione condivisa**: `function MacchinaIcon()` — stesso SVG,
parola per parola — è scritta in **quattro file** di Officina (`Triage`, `Lavori`,
`Macchina`, `Impianti`). Non è un'opinione sul design: è duplicazione già avvenuta.

*(La formulazione originale della proposta, prima dell'approvazione, è assorbita qui sopra.)*

## 4bis. Il lavoro da fare — **l'impacchettamento resta aperto**

Quattro blocchi di lavoro, in ordine di quanto resta da fare.

> **L'impacchettamento è deciso (2026-09-19, sera): FASE 4ter, dieci task.** I sei lavori
> qui sotto sono diventati `M4ter.1…M4ter.10` in `PIANO.md`, con divisioni motivate — L2,
> L4 e L5 valgono due sessioni ciascuno, L1, L3 e L6 una — più una sessione di gate. Il
> conto che ha deciso fase contro coda sta in `PIANO.md` §FASE 4ter. **Una rettifica di
> contenuto**: la «barra a segmenti» di L2 non è più un componente nostro, perché
> `@reui/stepper` esiste, è `registry:ui` in-house, **MIT**, Base UI, e senza valori
> arbitrari — si adotta, e `componenti-propri.json` resta a una riga sola, quella di D20.

| lavoro | cosa | perché prima di M5.5 | dipendenze |
|---|---|---|---|
| **L1 — l'immagine d'entità** | Il componente approvato in D-A: rapporto `4:3`/`16:9`, `object-cover`, segnaposto. Più la riga in `componenti-propri.json` e la scelta della larghezza di cella | È l'unico gradino 4, ed è l'unico elemento del Triage senza risposta. Due app, 31 `<img>`, un SVG duplicato 4 volte | D-A ✔ |
| **L2 — l'auth** | `modo` a tre vie su `pagina-login`, il guscio che si apre, la **barra a segmenti**, e le story delle cinque schermate | Studio non può migrare senza: oggi `pagina-login` copre 1 delle sue 6 schermate d'accesso | → **`docs/SPEC-AUTH.md`** |
| **L3 — il bivio delle due facce** | `useSoglia(query)` su `useSyncExternalStore` (~20 righe; `use-mobile.ts` **non si tocca**) più la story della lista a due facce, composta con `data-table` da una parte e `card`+`toggle-group` dall'altra | 6 pagine in 2 app lo fanno già a mano, in due modi diversi. Senza la story nessuno saprebbe che si fa così | L1 (la faccia larga vuole la miniatura) |
| **L4 — i sei scorpori** | `tassullo-indicatori` estratto da `pagina-dashboard`; prop `piede` in `data-table`; corpo **e valore di ritorno** in `confirm-dialog`; `LivelloPercorso.titolo` da `string` a `ReactNode`; `descrizione` in `pagina-scheda`; la scena chip-con-conteggio nella story di `toggle-group` | Sei cose da mezz'ora l'una che oggi costringono a riscrivere. **Nessuna richiede una decisione** | — |
| **L5 — il calendario** | Dichiarare `@reui` in `components.json`, installare **`event-calendar-month-view` e `-agenda-view`** (non l'ombrello), **snapshot prima di toccare**, correggere i 3 valori arbitrari, e fasciare in un blocco `tassullo-calendario` coi default di casa. Più l'estensione di `check:registry` a una seconda provenienza | Un fermo macchina può durare **giorni** (Francesco, 2026-09-19): servono le barre su più giorni, cioè il calcolo delle corsie — la parte cara di qualunque calendario, che reui ha già | dichiarazione di `@reui` |
| **L6 — la barra di contesto** | Blocco `tassullo-barra-contesto`: `item` + `dropdown-menu`, icona Lucide al posto dell'emoji. La pagina se lo monta, come oggi | Composizione pura, e ci guadagna `Esc`, fuoco da tastiera e clic-fuori, che la versione a mano non ha. L'emoji 📍 la disegna il sistema operativo — stessa obiezione di **D19** | — |

**Non a piano**: la sola **barra di contesto globale**. Va scritta in `CHECKLIST.md` come
**candidato sospeso con l'innesco** (v. la tabella dei differiti), perché un candidato non
scritto è un candidato che si riscopre da zero — è già successo con `native-select`,
analizzato due volte prima di diventare D19.

## 5. Il difetto di piano di M5.5 — **confermato**

Il criterio di M5.5 dice «verificata a secco sulle sue 10 pagine», e le pagine sono quelle
di Anagrafe. I numeri dicono che è il collaudo più debole possibile:

- Anagrafe è il **9%** del CSS delle tre app (391 su 4 340);
- ha **2 `<img>`** — ed è il marchio — contro 31; **1 griglia** `auto-fill` contro 33;
  **0 wizard**; **0 pagine a doppio volto**; **0 pagine auth** oltre il login;
- dei nove pattern «da fare», Anagrafe ne esercita **quattro**, e non il primo.

Una guida collaudata lì passerebbe senza toccare né le immagini, né il doppio volto, né
l'auth — cioè quasi tutto ciò che la ricognizione ha trovato scoperto.

**Proposta**: M5.5 si divide.
- **M5.5a — la guida e il passo 0**, collaudata a secco su Anagrafe come oggi. Resta il banco
  giusto per il *passo 0* dell'MCP: è in locale, si legge senza `gh`.
- **M5.5b — il collaudo a secco su Studio e Officina**, una pagina campione per famiglia:
  una lista a doppio volto (Officina Triage), un catalogo a griglia (Studio Catalogo), un
  wizard (Studio TaskCalcoloStrutturale), una scheda con foto (Officina Macchina).

Costo: **+1 sessione**. Alternativa scartata: tenere M5.5 com'è e scoprire i buchi durante
la migrazione vera, che è il modo in cui il v1 ha accumulato le sue eccezioni.

## 6. Rettifiche — cosa la prima stesura aveva sbagliato

### 6.1 Il titolo di pagina: rilievo **ritirato**

La prima stesura metteva in cima «titolo di pagina visibile dentro il contenuto», con
**56 file e 73 `<h1>` su tre app**. Rilievo di Francesco: «il titolo l'abbiamo sostituito
col breadcrumb, o parli di altro?». Verificato, e il rilievo non regge:

- **Nelle pagine di elenco l'argomento di M3.2 vale in pieno.** Officina non ha
  **nessun** breadcrumb — zero occorrenze in 26 file con `<h1>`. L'`<h1>` c'è perché non
  c'è altro che nomini la pagina; dopo la migrazione il breadcrumb ce l'hanno, e l'`<h1>`
  diventa il doppione che M3.2 descrive. Migrando **perdono una riga, non una funzione**.
- **Nelle pagine di dettaglio breadcrumb e titolo convivono e dicono cose diverse.**
  `Anagrafe/pages/Sistema.tsx:148-152`: il percorso dice `← Sistemi` (il **genitore**), il
  titolo dice `ST042 Risanamento muratura umida` (il **record**). Nessuna ripetizione.
  Stessa forma in `Studio/pages/CatalogoProdotto.tsx:105`.
- **E il v2 lo fa già**: `page-header` (elenchi) senza titolo, `pagina-scheda` (dettaglio)
  con `titolo` + `distintivo` + `azioni`. Non sono due scelte incoerenti: è la stessa
  regola applicata a due casi.

**La lezione, che vale più del rilievo**: il conteggio era vero ma misurava **lo stato del
v1, non una lacuna del v2**. Ordinare la tabella per occorrenze senza chiedersi cosa le
occorrenze stessero contando ha messo in cima una voce inesistente.

Sopravvivono due residui, ridotti alla loro misura: il **contatore** accanto
all'intestazione (#8) e la **descrizione** di `pagina-scheda` (#9).

### 6.2 Il doppio volto: da «manca un blocco» a «manca un hook e una story»

La prima stesura lo dava **MANCANTE**, gradino 3→4, «variante di `pagina-lista`». Rilievo
di Francesco: «si tratta di tutti elementi che abbiamo già mappato?». Sì — tredici su
quattordici. Dettaglio in §2. Resta gradino 2.

### 6.3 La soglia: non si forza

Prima ipotesi dell'orchestratore: spostare `useIsMobile()` da 768 a 1024 per tutti.
Indirizzo di Francesco: **la soglia si decide app per app, non si forza ora.** → **§6.9**,
che porta anche la ragione tecnica oltre a quella di metodo.

### 6.4 Studio §C.8 «expand-in-row» era sbagliato

`data-table.tsx:2917` ha `pannelloRiga?: (riga) => ReactNode` — «Row Expansion» di M3bis.2,
`colSpan` pieno, chevron aggiunto da sé (riga 3157). Il sub-agente lo dava mancante e
dichiarava di non aver interrogato l'MCP né letto il file.

### 6.5 Anagrafe: la lista master-detail è coperta

`item` non ha uno stato «selezionato», ma `variant="muted"` (`bg-muted/50`) è esattamente
l'aspetto di una riga attiva: `variant={attiva ? "muted" : "default"}` con `render={<button>}`.

### 6.6 Conteggi corretti ai sub-agenti

- **Officina: le pagine a doppio volto sono 5, non 4** — anche `Admin.tsx` rende `<table>`
  più un ramo `!desktop`.
- **I conteggi CSS di due rapporti su tre** erano `grep -c "{"`, rifatti con §0.
- **`grid-cols` nel registry sta in 4 file, non 1** — ma `alert`, `card` e `alert-dialog`
  lo usano come anatomia interna: una sola impaginazione vera (`pagina-dashboard`).
- **`AspectRatio` è usata**, in `carousel.stories.tsx:68`. Nessun *componente* la usa: vero.
  «Nessuno la usa»: falso.
- **Le 33 griglie `repeat(auto-fill/fit)`** di Studio e Officina usano **16 soglie `minmax`
  distinte**, da 104px a 320px — che è il genere di cosa che un design system esiste per
  fissare, e che vale la pena decidere quando si affronta il #1.

### 6.7 Il wizard non è un candidato da sospendere: il componente non esiste

La prima stesura lo metteva fra i tre differiti, con 20 selettori e due implementazioni.
**Cade guardando i tre passi della registrazione di Studio**, uno per uno — su richiesta
di Francesco («guardiamo una pagina per volta e mi proponi come implementarla»).

Su `/registrati`, passo 2: le tre card selezionabili sono `FieldLabel` che avvolge un
`radio-group` — `field.tsx:107` porta già `has-[>[data-slot=field]]:rounded-lg` e
`has-data-checked:border-primary/30 has-data-checked:bg-primary/5`, cioè **la scelta a
card è dentro la primitiva**; i campi affiancati sono `Field orientation="responsive"`
(`field.tsx:60`), che impila su stretto e affianca su largo da solo. Passo 3: i consensi
sono `Field orientation="horizontal"` + `Checkbox` + `FieldDescription`, e `field.tsx:58`
allinea già la casella in cima quando il testo va a capo. La schermata d'esito è `Empty`.

Quel che resta è la **barra a segmenti** (§1 #5) e il **gating**, che non è un componente:
dipende da quali campi ha quel passo, e nessun blocco può saperlo. Resta codice di pagina.

**I differiti scendono da tre a due.**

### 6.8 Il calendario resta differito, ma non per il conteggio

Il motivo scritto nella prima stesura era «un consumatore solo». Leggendo il sorgente ne
è emerso uno più forte, ed è nel commento di testa di `Calendario.tsx`:

> «La riprogrammazione è un **date-picker nel pannello, non un drag&drop**: trascinare su
> una griglia da 42 celle è preciso col mouse e impossibile col pollice, e sarebbe l'unica
> azione dell'app senza una conferma.»

Chi ha scritto quella pagina ha già preso una decisione di prodotto precisa su cosa la
griglia deve e non deve fare. Un blocco generico tagliato su questo caso la congelerebbe
per ogni app futura — e la prossima potrebbe volere proprio il trascinamento, o le fasce
orarie, o le risorse in colonna. **Sono tre calendari diversi, e ne conosciamo uno.**

Da sapere comunque, perché ridimensiona il buco: il **contorno** della pagina è tutto
coperto — `button-group` per `‹ Oggi ›`, `toggle-group` per mese/settimana, `select` per i
filtri, `badge` per la legenda, `split-view`/`sheet` per il pannello, `field`+`item` per i
campi del dettaglio, `item`+`ItemGroup` per «Da programmare», e **`calendar` per il
date-picker di riprogrammazione, che è esattamente il suo mestiere**. L'agenda mobile è
interamente `item`. Manca **solo la griglia del mese**, ed è di nuovo il doppio volto di #2.

### 6.9 Le due soglie non sono la stessa soglia — e `useIsMobile` non andrebbe bene comunque

Indirizzo di Francesco: «la soglia si decide app per app, non la forzerei in questo
momento». Corretto, e c'è anche una ragione tecnica oltre a quella di metodo.

I **768px** di `useIsMobile()` governano l'**arredamento**: sidebar e dialogo devono
cambiare allo stesso pixel, e `responsive-dialog.tsx:105-122` lo motiva
(«un'interfaccia che cambia grammatica a 40px di distanza si legge come un guasto»). I
suoi soli consumatori sono `sidebar.tsx:69` e `responsive-dialog.tsx:196`. Il bivio
tabella/schede è **contenuto**: dipende da quante colonne ha *quella* lista — nove nel
Triage. **La motivazione di `responsive-dialog` resta intatta: parla d'altro.**

E `useIsMobile` non sarebbe comunque adatto a una lista: legge `matchMedia` in un
`useEffect` che chiama `setState`, quindi il primo render torna **sempre `false`, cioè
scrivania**. Il file lo documenta come difetto noto e aggiunge «qui non morde» — perché un
dialogo al primo render è chiuso. Su una lista morde: sul telefono disegnerebbe la tabella
a nove colonne e la sostituirebbe un fotogramma dopo. Officina l'ha già risolto —
`useDesktop()` usa `useSyncExternalStore` e parte da **mobile**, apposta.

### 6.10 `gallery`/`grid` mancano in `@shadcn`, non nel mondo

Francesco ha trovato `shadcnui-blocks.com`, un raccoglitore di terze parti che distribuisce
blocchi propri con la CLI di shadcn, e il suo `Blog 01` **è** la griglia di card con foto.
Non è fra i registry di `components.json`, quindi l'MCP non lo vede: l'affermazione
«gradino 1 esaurito» resta esatta ma va letta come *esaurito nel registry ufficiale*.
Prendere codice da lì **non è gradino 1**: è codice di un terzo che diventa nostro.

Il loro riquadro immagine è `aspect-video w-full overflow-hidden rounded-lg` con
`object-cover` — **conferma che la forma è convenzionale** e che da noi si scrive con
`AspectRatio`. Ma in quel blocco la foto **c'è sempre**: nessun ramo per quando manca,
nessun segnaposto. Cioè non copre il nucleo di D-A. Verificato anche da Francesco su tutti
e sei i blocchi della categoria. (E usa `next/image` e `text-[1.4rem]`, un valore
arbitrario che la regola 3 vieta: non è copiabile così com'è in nessun caso.)

### 6.11 Il calendario esce dai differiti: si adotta `@reui/event-calendar`

**Due rilievi di Francesco lo hanno ribaltato in sequenza**, e il primo dei due smonta
proprio l'argomento con cui l'avevo differito.

**(a) La ricerca era stata fatta su un registry solo.** Avevo scritto «nessun calendario a
eventi in shadcn», e l'MCP diceva il vero — ma guarda **solo i registry dichiarati in
`components.json`**, e lì c'è `@shadcn` e basta. Francesco ne ha trovati tre fuori:
`shadcnuikit` (template commerciale, settimana che inizia di domenica, «New event» dalla
griglia — un calendario *diverso* dal nostro), `big-calendar` (**MIT**, 1057 stelle, ma
**Radix** + `react-aria` + `react-dnd`: contraddirebbe D9) e **`reui`**.

**`reui` è la scelta**, e per un fatto verificabile: l'URL dell'item è
`…/r/styles/**base-nova**/event-calendar.json`. `base-nova` è **letteralmente il valore del
campo `style` del nostro `components.json`** — stesso preset, stesse primitive Base UI.
Ha la vista **agenda**, che è la faccia mobile che Officina si è scritta a mano.
La licenza è **MIT** — ma il punto ha richiesto una verifica a parte, ed è il paragrafo qui sotto.

**(b) I fermi macchina possono durare giorni.** Avevo scartato le barre su più giorni
scrivendo che gli eventi di Officina «hanno un'ora e stanno in un giorno» — vero del dato
di oggi, falso del bisogno. Un fermo pluri-giorno vuole il **calcolo delle corsie** per le
barre che si sovrappongono, che è la parte cara di qualunque calendario e quella che
scriveremmo male la prima volta. reui ce l'ha («a multi-day all-day bar»).

**Perché non è il caso di niko-table.** `PIANO.md` §3bis dice «si porta il pattern, non si
installa il pacchetto» — ma quella decisione poggiava su un fatto che **qui non c'è**:
niko-table era un pacchetto npm, senza `shadcn view`, quindi non fotografabile. Verificato
sul campo che `npx shadcn@latest view https://reui.io/r/styles/base-nova/event-calendar.json`
**funziona e restituisce l'item** — cioè `check:registry -- --snapshot`, che usa proprio
`shadcn view`, sa riempire `.upstream/` anche da reui. **Il meccanismo di aggiornabilità
che abbiamo già funziona su reui senza modifiche di sostanza.**

E il porting «solo il mese e l'agenda» non era comunque praticabile:
`event-calendar-month-view.tsx` **importa `event-calendar-dnd`** (38 KB) e cita
`recurrence`; l'agenda importa provider, evento, lib e tipi. Non è codice a strati che si
sbuccia — è un motore con uno store sottoscrivibile e viste che leggono da lì.

**Si prende meno dell'ombrello, però**: i sotto-item sono installabili separatamente, e
`month-view` + `agenda-view` lasciano fuori `time-grid` (45 KB), `resource-view` (27 KB) e
`recurrence` (21 KB) — **93 KB su 326**. Il trascinamento entra lo stesso, ma è una prop
che si spegne, non un comportamento imposto.

**Il ri-stile Tassullo è piccolo, misurato sul sorgente**: **zero esadecimali** e **9 valori
arbitrari distinti**, di cui sei legittimi (`data-[slot=…]` è un selettore,
`transition-[background-color,box-shadow]` una lista di proprietà, gli
`h-[var(--ec-month-bar-h,1.75rem)]` una variabile propria con fallback). **Tre da
correggere**: `text-[0.6875rem]`, `max-[10rem]`, `max-[36rem]` — il primo è il difetto muto
di §30 del `CLAUDE.md`, un corpo fuori scala che non segue la densità.

**`componenti-propri.json` resta vuoto**: gli item reui hanno un originale e sono
fotografabili, quindi non sono «componenti nostri». Il pezzo nostro è un **blocco**,
`tassullo-calendario`, che fissa i default di casa — settimana che inizia **lunedì**
(`GIORNI_SETTIMANA` di Officina), interazioni spente, niente creazione dalla griglia — e i
blocchi non vogliono quella riga.

**La licenza: due regimi, e quello che ci riguarda è MIT.** Rilievo di Francesco — «i blocchi
sono una feature pro, non ho una licenza» — ed è vero, ma il taglio passa altrove.

`reui.io/legal/license` si apre dichiarando cosa vale «**after purchase**» e descrive i due
piani a pagamento. È la licenza dei **543 Pro Blocks**, e vieta alla lettera quello che
avremmo fatto: «Publish the Licensed Materials in a **public or open-source repository**» e
«Repackage the Licensed Materials into **another component library**… even after you have
modified it». Il nostro registry è pubblico su GitHub **ed è** una component library: se
`event-calendar` stesse lì sotto, la risposta sarebbe no e basta.

**Non ci sta.** `keenthemes/reui` — il repo pubblico, 3512 stelle — è **MIT**, e contiene
`registry-reui/bases/**base**/reui/event-calendar/event-calendar-month-view.tsx`, cioè
proprio la variante Base UI. Il loro README lo dice: «22 In-House component primitives not
in default shadcn/ui — Data Grid, **Event Calendar**, Gantt, Kanban… **MIT License — Free
and open-source forever**», mentre i Pro Blocks sono elencati a parte come «Full-page
sections… including Event Calendar, Gantt, and Kanban board **layouts**». Il **motore** è
MIT; i **layout già composti** sopra al motore si pagano — e noi il layout lo scriviamo
comunque, perché ci servono i default di Officina.

**Cosa comporta MIT per noi**: una condizione sola, «The above copyright notice and this
permission notice shall be included in all copies or **substantial portions**». Quindi
l'avviso di copyright di Keenthemes **va conservato nei file installati e dichiarato
nell'item del registry**, perché il nostro registry ridistribuisce quei file alle app. È il
primo caso del genere nel v2 — finora l'unica licenza di terzi che portiamo in giro è l'OFL
di Inter, che ha un suo file dentro `tema-font`, e lo stesso trattamento vale qui.

**Due cose ancora da verificare, prima di installare** (e sono condizioni di L5, non
dettagli): che i file serviti da `reui.io/r/…` siano **gli stessi** di quelli pubblicati
sotto MIT su GitHub — ho controllato che il nome del file ci sia, non ho confrontato i
contenuti, e vale quello che è pubblicato sotto MIT; e che **`@reui/icon-stack`**, fra le
dipendenze della vista agenda, non tiri dentro il set di icone, che nel loro listino sta nel
piano **Ultimate**. Probabilmente è solo il contenitore, ma è esattamente il genere di cosa
che va guardata e non presunta.

**Tre punti aperti, due tecnici e uno che è di Officina.**
1. **`check:registry` va insegnato a una seconda provenienza.** Oggi popola `.upstream/` da
   `@shadcn` e basta; senza l'estensione dichiarerebbe «componente nostro senza originale»
   su tutti i file reui. È lavoro reale, e va nello stesso task.
2. **Dove atterrano i file.** I loro import sono `@/components/reui/event-calendar/…`, i
   nostri `@/registry/tassullo/…`. La CLI riscrive gli alias all'installazione — c'è il
   precedente di `@/registry/base-nova/…` → `@/registry/tassullo/…` già normalizzato dal
   gate — ma va verificato sul campo, non dato per scontato.
3. **Il dato di Officina non basta.** `EventoCalendario` ha `programmato_il`, cioè **un
   istante**. Un fermo che dura giorni vuole inizio e fine: il blocco deve prendere
   `start`/`end` da subito, ma il dato lo produce il backend di Officina. **Va scritto nella
   guida di migrazione**, o si scopre il giorno in cui si prova a disegnare la barra.

## 7. Note per M5.5 — cose che il design system non può risolvere da sé

Aperta il 2026-09-19, quando la fase è stata pianificata. Qui va ciò che una migrazione
incontrerà e che **non si chiude nel registry**, perché dipende da un backend, da un dato o
da una scelta dell'app. Senza questa sezione si scopre il giorno in cui non si riesce a
disegnare qualcosa, ed è tardi.

- **Officina, il calendario: `EventoCalendario.programmato_il` è un istante.** Un fermo
  macchina può durare giorni, e la barra pluri-giorno vuole **inizio e fine**. Il blocco
  `tassullo-calendario` (M4ter.2) prende `start`/`end` da subito — ma il dato lo produce il
  backend di Officina, che oggi non ce l'ha. **Va nella guida di migrazione come
  prerequisito**, non come dettaglio implementativo.
- **La soglia del bivio tabella/schede la decide l'app.** `useSoglia(query)` (M4ter.6) non
  porta un numero: dipende da quante colonne ha *quella* lista — nove nel Triage di
  Officina, e a 768px sarebbero illeggibili. La guida deve dire **come si sceglie**, non
  quale numero usare.
- **Il logo Microsoft resta dell'app.** È un marchio di terzi a quattro colori fissi: come
  SVG nel registry violerebbe la regola 3. `pagina-login` lo prende come nodo (M4ter.4), e
  ogni app che usa l'SSO se lo porta.
- **Il campo nascosto di `/registrati`** (Studio) è un honeypot anti-bot: non è materia del
  design system e **non va assorbito** migrando la pagina.
- **Il misuratore di robustezza della password resta dell'app** (deciso da Francesco il
  2026-09-19): somiglia alla barra dei passi ma non lo è — lo stepper è un `tablist` di
  `tab` cliccabili, il misuratore non si naviga e non si seleziona. Occorrenza singola,
  codice di pagina.
