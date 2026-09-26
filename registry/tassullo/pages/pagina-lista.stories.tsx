import { useState, type Dispatch, type SetStateAction } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  BookOpenIcon,
  ChevronDownIcon,
  CopyIcon,
  FileWarningIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from 'lucide-react'

import { AppShell, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'
import {
  creaColonne,
  IntestazioneColonnaMenu,
  RowMenuItem,
  RowMenuSeparator,
  useDataTableRow,
  type IstanzaTabella,
} from '@/registry/tassullo/blocks/data-table'
import { FiltroResetTutti } from '@/registry/tassullo/blocks/data-table-filtro-reset'
import { FiltroSfaccettato } from '@/registry/tassullo/blocks/data-table-filtro-sfaccettato'
import { PaginaLista } from '@/registry/tassullo/pages/pagina-lista'
import { apriCol } from '@/prove/apri'
import { TONO } from '@/registry/tassullo/lib/toni'
import { Badge } from '@/registry/tassullo/ui/badge'
import { Button } from '@/registry/tassullo/ui/button'
import { Card } from '@/registry/tassullo/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/registry/tassullo/ui/collapsible'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/registry/tassullo/ui/input-group'
import { Label } from '@/registry/tassullo/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/registry/tassullo/ui/toggle-group'

/**
 * La pagina elenco: l'intestazione con l'azione primaria, i filtri, la tabella
 * paginata e i tre stati — caricamento, errore, nessun record. È la pagina
 * che un applicativo ripete più spesso, già composta.
 *
 * **Quando sì, quando no.** Quando l'elenco è la pagina intera: si cerca, si
 * filtra, si apre una riga. Una tabella che è una sezione fra altre — dentro
 * una scheda, in un cruscotto — si monta direttamente con
 * `tassullo-data-table`; per correggere i dati cella per cella c'è
 * `tassullo-data-grid`.
 *
 * **È una pagina d'esempio**: mostra come si compongono i blocchi. Non si
 * installa e non si importa: se ne legge il codice con il comando che segue,
 * o chiedendolo all'MCP, e la si ricompone nell'app, nella cartella delle
 * pagine.
 *
 * ```bash
 * npx shadcn@latest view tassullo/tassullo-design-system-v2/tassullo-pagina-lista
 * ```
 *
 * **I blocchi che la compongono**, da installare nell'app per nome:
 * `tassullo-page-header` per il percorso e le azioni nella fascia,
 * `tassullo-data-table` per la tabella, `tassullo-empty-state`,
 * `tassullo-error-state` e `tassullo-page-skeleton` per i tre stati, e
 * `use-soglia` per la faccia stretta. La pagina non aggiunge CSS suo.
 *
 * ```tsx
 * <AppShell contenuto="riempie" …>
 *   <PaginaLista
 *     percorso={[{ titolo: 'Norme' }]}
 *     azioni={[{ titolo: 'Nuova norma', icona: PlusIcon, ruolo: 'primaria' }]}
 *     colonne={colonne}
 *     dati={norme}
 *     cerca="Cerca codice, titolo…"
 *     perPagina={25}
 *   />
 * </AppShell>
 * ```
 *
 * **Le prop.**
 *
 * - `percorso` e `azioni` passano a `tassullo-page-header`: il nome della
 *   pagina è l'ultimo livello del percorso, e fra le azioni una sola è
 *   `primaria`.
 * - `colonne`, `dati` e le opzioni della tabella — `cerca`, `vuoto`,
 *   `nomeRighe`, `perPagina`, `bloccaPrimaColonna`, `barra`, `idRiga`,
 *   `ridimensionabile`, `colonneBloccabili`, `colonneRiordinabili`,
 *   `menuRiga` — passano a `tassullo-data-table` così come sono. La tabella
 *   ha sempre `altezza="ferma"`: riempie lo spazio che il guscio le lascia e
 *   scorre al suo interno, con qualunque paginazione.
 * - `stato`: `"pronto"`, il predefinito, `"caricamento"` o `"errore"`, uno
 *   alla volta. Solo in `"pronto"` contano i `dati`; `messaggioErrore` e
 *   `onRiprovaErrore` servono all'errore.
 * - `vuotoIniziale` (`icona`, `titolo`, `descrizione`, `azione`): la pagina
 *   quando non esiste ancora nessun record. Prende il posto della tabella,
 *   con l'azione che crea il primo. È un'altra cosa dal `vuoto` della
 *   tabella, che è la ricerca o il filtro che non trovano niente e si
 *   risolve togliendo il filtro.
 * - `facciaStretta`, `soglia` e `faccia`: la seconda forma della pagina, per
 *   quando la tabella non ci sta. Qui sotto.
 *
 * ## La faccia stretta
 *
 * Sotto una certa larghezza della finestra una tabella a molte colonne non
 * si legge più, e la pagina diventa un elenco di schede.
 * **Il blocco sceglie quando, la pagina scrive cosa.**
 *
 * - `facciaStretta`: il nodo che la pagina rende al posto della tabella — le
 *   schede e i comandi che servono loro. Assente, la pagina ha una forma sola
 *   a ogni larghezza.
 * - `soglia`: la media query sulla finestra che decide,
 *   `"(min-width: 1024px)"` di default. Vera, la tabella; falsa,
 *   `facciaStretta`.
 * - `faccia`: `"auto"`, il predefinito, lascia decidere a `soglia`;
 *   `"tabella"` e `"schede"` rendono una faccia fissa a ogni larghezza. Si
 *   usano dove la forma non deve dipendere dalla finestra: una scena di
 *   documentazione, una prova automatica.
 *
 * Con la tabella se ne vanno anche la ricerca, la barra dei filtri e la
 * paginazione, che sono sue: i comandi della faccia stretta la pagina li
 * scrive dentro `facciaStretta`. Restano del blocco la fascia, i tre `stato`
 * e `vuotoIniziale`, che non cambiano con la larghezza.
 *
 * La faccia stretta la scrive la pagina perché le due facce non sono la
 * stessa lista impaginata due volte: quale colonna diventa un
 * raggruppamento, quale filtro resta, cosa entra nella scheda lo sa solo chi
 * conosce quella lista. La ricetta completa, con un esempio a nove colonne,
 * è `Pagine/Lista a due facce`.
 *
 * **Regole d'uso.**
 *
 * - La pagina riempie lo spazio del guscio: si monta dentro
 *   `<AppShell contenuto="riempie">`.
 * - La soglia la sceglie l'app, e non si ricava da quante colonne ha la
 *   tabella. Se la tabella non ci sta, scorre in orizzontale, con
 *   `bloccaPrimaColonna` a tenere ferma la colonna che identifica la riga:
 *   alzare la soglia manderebbe sul telefono una pagina che sulla scrivania
 *   funziona.
 * - Lo stato dei filtri delle schede lo tiene la pagina, fuori da
 *   `facciaStretta`: così passare la soglia avanti e indietro non lo perde.
 * - Da sapere: passando la soglia i filtri non vanno da una faccia
 *   all'altra. Sopra li tiene la tabella, sotto la pagina.
 *
 * **Tastiera e accessibilità.** Quelle dei blocchi che la compongono: il
 * titolo per chi non vede lo scrive `tassullo-page-header`, e la tabella si
 * usa da tastiera come descritto in `Blocchi/Data Table`. Nella faccia
 * stretta la tastiera è quella delle schede che scrive la pagina: in queste
 * scene ogni scheda è un bottone, e `Invio` o `Spazio` aprono il pannello.
 */
const meta = {
  title: 'Pagine/Lista',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SEZIONI: SezioneNav[] = [
  {
    voci: [
      {
        titolo: 'Riferimenti',
        icona: BookOpenIcon,
        attiva: true,
        figli: [
          { titolo: 'Norme', href: '#', attiva: true },
          { titolo: 'Caratteristiche', href: '#' },
          { titolo: 'Organismi notificati', href: '#' },
        ],
      },
    ],
  },
]

const UTENTE = {
  nome: 'Stefano',
  cognome: 'Bertolini',
  email: 'sbertolini@esempio.it',
  ruolo: 'Admin',
}

/* ────────────────────────────────────────────────────────────────────────
 * I dati finti — una norma tecnica: codice, titolo, ente, stato
 * ──────────────────────────────────────────────────────────────────────── */

type Norma = {
  id: number
  codice: string
  titolo: string
  ente: string
  categoria: string
  vigente: boolean
}

const ENTI = ['UNI', 'EN', 'ISO', 'UNI EN ISO']
const CATEGORIE = ['Malte', 'Intonaci', 'Rasanti', 'Massetti', 'Adesivi']

function seminato(seme: number) {
  let s = seme
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

function generaNorme(quante: number): Norma[] {
  const caso = seminato(20260916)
  const scegli = <T,>(v: T[]): T => v[Math.floor(caso() * v.length)]
  return Array.from({ length: quante }, (_, i) => {
    const ente = scegli(ENTI)
    return {
      id: i + 1,
      codice: `${ente} ${1000 + Math.floor(caso() * 9000)}`,
      titolo: `Requisiti per ${scegli(CATEGORIE).toLowerCase()} da costruzione`,
      ente,
      categoria: scegli(CATEGORIE),
      vigente: caso() > 0.15,
    }
  })
}

const NORME = generaNorme(48)

/**
 * Le quattro colonne di Norme — `size`/`minSize`, non `meta.larghezza`
 * (M3bis.3): con `ridimensionabile` la larghezza di partenza la dichiara
 * l'utente trascinando, `larghezza` verrebbe ignorata. Nessuna colonna
 * azioni scritta a mano: `menuRiga`, su `Norme` sotto, la aggiunge da sé
 * in coda.
 *
 * **Le testate sono `IntestazioneColonnaMenu`** (M4ter.14), non
 * `IntestazioneColonna`: un solo grilletto «⋮» che porta ordinamento e
 * blocco, la stessa forma di `Pagine/Prodotti`. `meta.azioniProprie: true`
 * su ognuna, o `colonneBloccabili` aggiungerebbe *anche* la sua puntina e
 * per ogni colonna ci sarebbero due grilletti di pin.
 */
const col = creaColonne<Norma>()

const COLONNE = col.columns([
  col.accessor('codice', {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Codice" />,
    meta: { titolo: 'Codice', azioniProprie: true },
    sortFn: 'alphanumeric',
    size: 140,
    minSize: 90,
    // Il codice è il varco alla scheda di norma — `variant="link"` e non un
    // colore a mano, stessa forma della colonna "Nome" di Prodotti: senza una
    // pagina scheda da aprire in Storybook resta un `#`, qui conta la forma.
    cell: ({ getValue }) => (
      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 text-sm"
        render={<a href="#" />}
      >
        {getValue<string>()}
      </Button>
    ),
  }),
  col.accessor('titolo', {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Titolo" />,
    meta: { titolo: 'Titolo', azioniProprie: true },
    sortFn: 'text',
    size: 320,
    minSize: 160,
  }),
  col.accessor('categoria', {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Categoria" />,
    meta: { titolo: 'Categoria', azioniProprie: true },
    sortFn: 'text',
    // Un valore per riga: `arrHas` tiene la riga il cui valore compare fra
    // quelli scelti nel filtro sfaccettato.
    filterFn: 'arrHas',
    size: 150,
    minSize: 100,
  }),
  col.accessor('vigente', {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Stato" />,
    meta: { titolo: 'Stato', azioniProprie: true },
    sortFn: 'basic',
    // `arrHas` confronta il valore grezzo con `===`, senza convertirlo: un
    // booleano contro le stringhe che il filtro sfaccettato porta
    // ("true"/"false") non troverebbe mai un pari. Stessa correzione di
    // `Pagine/Prodotti` sulla colonna `attivo`.
    filterFn: (riga, id, valori: string[]) => valori.includes(String(riga.getValue(id))),
    size: 130,
    minSize: 90,
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Badge className={TONO.success}>Vigente</Badge>
      ) : (
        <Badge className={TONO.warning}>Superata</Badge>
      ),
  }),
])

/**
 * Il menu di riga condiviso (M3bis.9): una sola definizione, letta da
 * `useDataTableRow<Norma>()`, montata da `menuRiga` sia nella tendina «⋯»
 * (aggiunta in coda da sé) sia sul tasto destro dell'intera riga.
 */
function MenuAzioniNorma() {
  const norma = useDataTableRow<Norma>()
  return (
    <>
      <RowMenuItem onClick={() => console.info(`Modifica ${norma.codice}`)}>
        <PencilIcon aria-hidden />
        Modifica
      </RowMenuItem>
      <RowMenuItem onClick={() => console.info(`Duplica ${norma.codice}`)}>
        <CopyIcon aria-hidden />
        Duplica
      </RowMenuItem>
      <RowMenuSeparator />
      {/* `variant="destructive"`, non una classe di colore — la trappola di
          `CLAUDE.md` sul testo di `--destructive`. */}
      <RowMenuItem variant="destructive" onClick={() => console.info(`Elimina ${norma.codice}`)}>
        <Trash2Icon aria-hidden />
        Elimina
      </RowMenuItem>
    </>
  )
}

/**
 * I filtri stanno **fuori dalla tabella** — `barra` li monta sopra il
 * riquadro, non dentro l'intestazione — e sono **sfaccettati** (M3bis.6),
 * la stessa forma di `Pagine/Prodotti`: ogni opzione porta il proprio
 * conteggio, ricalcolato sulle righe che passano *gli altri* filtri.
 *
 * Filtrano due colonne **visibili**, Categoria e Stato. Il `Select` «Tutti
 * gli enti» che stava qui prima è caduto: filtrava un campo che nella
 * tabella non c'è come colonna — un filtro sfaccettato ha bisogno di una
 * colonna vera da interrogare — e l'ente è comunque la testa del codice
 * («UNI EN ISO 5028»), quindi la casella di ricerca ci arriva già.
 */
function BarraFiltri({ tabella }: { tabella: IstanzaTabella<Norma> }) {
  return (
    <>
      <FiltroSfaccettato tabella={tabella} accessore="categoria" titolo="Categoria" />
      {/* `opzioni` statiche perché il valore grezzo è un booleano: l'etichetta
          la scrive la pagina, o si leggerebbe «true»/«false». */}
      <FiltroSfaccettato
        tabella={tabella}
        accessore="vigente"
        titolo="Stato"
        opzioni={[
          { value: 'true', label: 'Vigente' },
          { value: 'false', label: 'Superata' },
        ]}
      />
      {/* Sparisce da sé quando non c'è niente da cancellare. */}
      <FiltroResetTutti tabella={tabella} />
    </>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * La faccia stretta (M4ter.16)
 *
 * Stessa forma di `Pagine/Prodotti (Anagrafe)`, validata da Francesco il
 * 2026-09-22, applicata alla seconda pagina che la chiedeva. Il bivio però
 * non è scritto qui: sta nel **blocco** (`PaginaLista`, prop `facciaStretta`
 * + `soglia`), perché `tassullo-pagina-lista` è l'item che le app
 * installano, e le sei pagine-elenco di Anagrafe non devono riscriversi il
 * `useSoglia` ognuna per conto suo. Il blocco sceglie **quando**, questa
 * story scrive **cosa** — la divisione di `Pagine/Lista a due facce`.
 *
 * Le corrispondenze con Prodotti, una per una:
 *
 * | Prodotti | Norme |
 * |---|---|
 * | raggruppa per **Famiglia** | raggruppa per **Categoria** |
 * | Stato a chip (Attivi/Disattivi) | Stato a chip (Vigenti/Superate) |
 * | Tipo resta un badge | Ente resta nel pannello |
 * | nome + variante in testata | codice + titolo in testata |
 *
 * Una differenza vera, e non è cosmesi: **in testata il codice sta sopra il
 * titolo**. Su Prodotti l'identità è il nome; qui è il codice — «UNI EN ISO
 * 5028» è come una norma si cita e si cerca, e il titolo («Requisiti per
 * malte da costruzione») è la descrizione. Metterlo secondo sarebbe copiare
 * la forma di Prodotti invece della sua ragione.
 * ──────────────────────────────────────────────────────────────────────── */

type FiltriStretti = {
  cerca: string
  /** `"true"`/`"false"`: le stesse stringhe delle opzioni sopra soglia. */
  vigente: string[]
}

const FILTRI_VUOTI: FiltriStretti = { cerca: '', vigente: [] }

function passaFiltri(n: Norma, f: FiltriStretti): boolean {
  const ago = f.cerca.trim().toLowerCase()
  if (ago && !`${n.codice} ${n.titolo} ${n.ente} ${n.categoria}`.toLowerCase().includes(ago)) {
    return false
  }
  if (f.vigente.length > 0 && !f.vigente.includes(String(n.vigente))) return false
  return true
}

/**
 * Ricerca a tutta larghezza e lo stato a chip. **Un solo filtro, nessun
 * popover**: la Categoria è diventata il raggruppamento, e l'Ente è la testa
 * del codice, quindi la ricerca ci arriva già.
 */
function ComandiStretti({
  filtri,
  setFiltri,
}: {
  filtri: FiltriStretti
  setFiltri: Dispatch<SetStateAction<FiltriStretti>>
}) {
  const stato = filtri.vigente.length === 1 ? filtri.vigente[0]! : 'tutte'
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="nrm-cerca-stretto">Cerca</Label>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            id="nrm-cerca-stretto"
            placeholder="Codice, titolo, ente…"
            value={filtri.cerca}
            onChange={(e) => setFiltri((f) => ({ ...f, cerca: e.target.value }))}
          />
        </InputGroup>
      </div>
      <ToggleGroup
        variant="outline"
        aria-label="Stato"
        value={[stato]}
        /*
         * Base UI torna sempre un array, anche a scelta singola, e il
         * ripiego su `tutte` non è cosmesi: senza, ri-cliccare il chip
         * acceso lo spegnerebbe e la lista resterebbe filtrata su niente.
         */
        onValueChange={(valori) => {
          const scelto = (valori[0] as string | undefined) ?? 'tutte'
          setFiltri((f) => ({ ...f, vigente: scelto === 'tutte' ? [] : [scelto] }))
        }}
        className="flex-wrap"
      >
        <ToggleGroupItem value="tutte">Tutte</ToggleGroupItem>
        <ToggleGroupItem value="true">Vigenti</ToggleGroupItem>
        <ToggleGroupItem value="false">Superate</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

const PASSO_SCHEDE = 40

/**
 * Una scheda per norma, **raggruppate per categoria**.
 *
 * Il grilletto è la **scheda intera**, il bersaglio più grande col pollice;
 * il chevron resta come **segno**, non come bersaglio separato. Le tre
 * azioni stanno nel pannello e non in un menu «⋯»: un menu dentro il
 * grilletto sarebbe `nested-interactive` per axe.
 *
 * **L'intestazione del gruppo non è appiccicata**: un'intestazione che resta
 * in cima si legge come l'intestazione *della lista*, mentre questa è il
 * nome di un gruppo **dentro** la lista e deve uscire di scena col suo
 * gruppo (rilievo di Francesco su Prodotti, M4ter.15).
 */
function SchedeNorme({ dati }: { dati: Norma[] }) {
  /*
   * **Quaranta alla volta**, come su Prodotti: sopra soglia lo fa la
   * paginazione, qui una tabella non c'è. Il taglio è sull'elenco piatto
   * *prima* di raggruppare, così i gruppi compaiono man mano. Il ripristino
   * a 40 quando cambiano i filtri è **derivato durante il render** e non
   * fatto in un effetto: `setState` dentro `useEffect` costa un giro di
   * render in più, e oxlint lo segnala.
   */
  const [taglio, setTaglio] = useState({ conta: dati.length, quante: PASSO_SCHEDE })
  const mostrate = taglio.conta === dati.length ? taglio.quante : PASSO_SCHEDE

  if (dati.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Nessuna norma con questi filtri
      </p>
    )
  }

  const visibili = dati.slice(0, mostrate)
  const restanti = dati.length - visibili.length

  // `Map` e non un oggetto: conserva l'ordine d'inserimento, che qui è
  // l'ordine in cui le categorie compaiono nell'elenco già ordinato.
  const gruppi = new Map<string, Norma[]>()
  for (const n of visibili) {
    const riga = gruppi.get(n.categoria)
    if (riga) riga.push(n)
    else gruppi.set(n.categoria, [n])
  }

  // Il numero accanto al nome conta la **categoria intera** nel filtrato,
  // non le schede già caricate: un conteggio accanto a un nome si legge come
  // «quante ce n'è», mai come «quante se ne vedono adesso» (M4ter.15).
  const totali = new Map<string, number>()
  for (const n of dati) totali.set(n.categoria, (totali.get(n.categoria) ?? 0) + 1)

  return (
    /*
     * `p-px`: `Card` non disegna un `border` ma `ring-1`, che è un
     * `box-shadow` **fuori** dalla scatola, e `overflow-y-auto` ritaglia
     * **anche in orizzontale** — senza quel pixel il fianco destro delle
     * schede sparisce, e solo quello (M4ter.15, rilievo di Francesco).
     */
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-px">
      {Array.from(gruppi.entries()).map(([categoria, norme]) => (
        <section key={categoria} className="flex flex-col gap-2">
          <h2 className="flex items-baseline gap-2 text-sm font-semibold">
            {categoria}
            <span className="font-normal text-muted-foreground tabular-nums">
              {totali.get(categoria)}
            </span>
          </h2>
          {norme.map((n) => (
            <Collapsible key={n.id}>
              <Card className="gap-0 overflow-hidden py-0">
                <CollapsibleTrigger className="group/riga flex w-full items-center gap-3 p-3 text-left rounded-xl hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset focus-visible:outline-none data-[panel-open]:rounded-b-none">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    {/* Il **codice sopra il titolo**: è così che una norma si
                        cita e si cerca. Su Prodotti l'identità è il nome, qui
                        è il codice. */}
                    <span className="font-medium">{n.codice}</span>
                    <span className="text-sm text-muted-foreground">{n.titolo}</span>
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge className={n.vigente ? TONO.success : TONO.warning}>
                        {n.vigente ? 'Vigente' : 'Superata'}
                      </Badge>
                    </div>
                  </div>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]/riga:rotate-180"
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-3 border-t p-3">
                    {/* **Solo l'ente.** La categoria sta già nell'intestazione
                        del gruppo e ripeterla su ogni scheda è rumore — stessa
                        scelta di Prodotti, dove la famiglia sparisce dalla
                        scheda per la stessa ragione. L'ente, invece, sopra
                        soglia non è nemmeno una colonna: la faccia stretta
                        mostra qui **più** della larga, non meno. */}
                    <dl className="flex flex-col text-sm">
                      <dt className="text-sm text-muted-foreground">Ente</dt>
                      <dd>{n.ente}</dd>
                    </dl>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.info(`Modifica ${n.codice}`)}
                      >
                        <PencilIcon aria-hidden />
                        Modifica
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.info(`Duplica ${n.codice}`)}
                      >
                        <CopyIcon aria-hidden />
                        Duplica
                      </Button>
                      {/* `variant="destructive"`, non una classe di colore —
                          la trappola di `CLAUDE.md` sul testo di
                          `--destructive`. */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => console.info(`Elimina ${n.codice}`)}
                      >
                        <Trash2Icon aria-hidden />
                        Elimina
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </section>
      ))}
      {restanti > 0 ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setTaglio({ conta: dati.length, quante: mostrate + PASSO_SCHEDE })}
        >
          Mostra altre {Math.min(restanti, PASSO_SCHEDE)} · ne restano {restanti}
        </Button>
      ) : null}
    </div>
  )
}

function Norme({
  dati,
  stato,
  faccia,
}: {
  dati: Norma[]
  stato?: 'pronto' | 'caricamento' | 'errore'
  faccia?: 'auto' | 'tabella' | 'schede'
}) {
  // Lo stato dei filtri della faccia stretta vive **qui**, non dentro
  // `SchedeNorme`: attraversare la soglia avanti e indietro non lo perde.
  // Sopra soglia i filtri restano della tabella, ed è la cucitura da
  // conoscere — v. la nota di testa della story.
  const [filtriStretti, setFiltriStretti] = useState<FiltriStretti>(FILTRI_VUOTI)
  // Ordinate per categoria **prima** di raggruppare: l'elenco arriva
  // mescolato, e senza questo la stessa categoria comparirebbe come cinque
  // gruppi diversi lungo la pagina. A parità di categoria resta l'ordine
  // d'origine, che è quello della faccia larga.
  const strette = dati
    .filter((n) => passaFiltri(n, filtriStretti))
    .sort((a, b) => a.categoria.localeCompare(b.categoria, 'it') || a.id - b.id)

  return (
    <PaginaLista
      percorso={[{ titolo: 'Norme' }]}
      azioni={[{ titolo: 'Nuova norma', icona: PlusIcon, ruolo: 'primaria' }]}
      colonne={COLONNE}
      dati={dati}
      stato={stato}
      faccia={faccia}
      // La faccia stretta la scrive la pagina; il blocco sceglie solo
      // *quando* montarla (`soglia`, 1024px di default). Niente riga di
      // conteggio fra i filtri e la prima scheda — rilievo di Francesco su
      // Prodotti: è uno scalino che allontana la lista dal pollice per dire
      // un numero che i conteggi di gruppo già danno, categoria per
      // categoria.
      facciaStretta={
        <>
          <ComandiStretti filtri={filtriStretti} setFiltri={setFiltriStretti} />
          <SchedeNorme dati={strette} />
        </>
      }
      cerca="Cerca codice, titolo…"
      perPagina={25}
      nomeRighe={{ singolare: 'norma', plurale: 'norme' }}
      barra={(_scelti, tabella) => <BarraFiltri tabella={tabella} />}
      // Le capacità di FASE 3bis rilevanti per una pagina sola lista
      // (M3bis.11a): colonne che si ridimensionano, si bloccano, e il menu
      // di riga condiviso fra tendina e tasto destro (M3bis.9) — sulla
      // pagina "vera" (`Con Dati`, `Poche Righe`), non in una story isolata
      // a parte: altrimenti chi guarda il caso comune non le vede mai.
      //
      // **`colonneRiordinabili` è caduto in M4ter.14**, come su Prodotti: la
      // maniglia di trascinamento era un terzo controllo sempre acceso in
      // ogni testata, accanto alla freccia d'ordinamento e alla puntina —
      // con quattro colonne, dodici bersagli per non leggere niente. Il
      // menu «⋮» copre ordinamento e blocco; il riordino per trascinamento
      // resta dimostrato in `Blocchi/Data Table` → `Colonne Riordinabili`.
      idRiga={(n) => String(n.id)}
      ridimensionabile
      colonneBloccabili
      menuRiga={{ menu: <MenuAzioniNorma />, ariaLabel: (n) => `Azioni su ${n.codice}` }}
      vuotoIniziale={{
        icona: <FileWarningIcon />,
        titolo: 'Nessuna norma in anagrafica',
        descrizione: 'Le norme tecniche di riferimento compariranno qui.',
        azione: (
          <Button size="sm">
            <PlusIcon />
            Nuova norma
          </Button>
        ),
      }}
    />
  )
}

function Guscio({
  dati,
  stato,
  faccia,
}: {
  dati: Norma[]
  stato?: 'pronto' | 'caricamento' | 'errore'
  faccia?: 'auto' | 'tabella' | 'schede'
}) {
  return (
    // `contenuto="riempie"`: `pagina-lista` riempie sempre lo schermo, a
    // prescindere da come `perPagina` carica le righe — `DataTable` apre lo
    // scorrimento interno (`altezza="ferma"`) tanto qui, con una `perPagina`
    // numerica, quanto con `"infinito"` (story `Prodotti (Anagrafe)`).
    <AppShell
      applicazione="Anagrafe"
      collassa="icona"
      contenuto="riempie"
      utente={UTENTE}
      sezioni={SEZIONI}
    >
      <Norme dati={dati} stato={stato} faccia={faccia} />
    </AppShell>
  )
}

/**
 * Il caso comune: 48 norme, la ricerca, due filtri sfaccettati e la
 * paginazione a 25. Le colonne si ridimensionano e si bloccano dal menu «⋮»
 * delle intestazioni; il menu di riga si apre dalla tendina «⋯» o col tasto
 * destro. La scena passa `faccia="tabella"`.
 */
export const ConDati: Story = {
  // `faccia="tabella"`, non `'auto'`: la faccia larga a ogni larghezza della
  // finestra, anche in una prova automatica. La scena che dipende davvero
  // dalla finestra è `Soglia della pagina`, sotto.
  render: () => <Guscio dati={NORME} faccia="tabella" />,
  // Non il primo `dropdown-menu-trigger` della pagina: quello è il menu
  // utente della sidebar (`AppShell`), montato prima della tabella nel DOM.
  // Il grilletto di riga vive dentro il `<tbody>`.
  play: apriCol('tbody [data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

/**
 * La faccia stretta, fissata con `faccia="schede"`: una scheda per norma,
 * raggruppate per categoria col conteggio accanto al nome. In cima la
 * ricerca e lo stato a chip; toccando una scheda si apre il pannello con
 * l'ente e le tre azioni. È ciò che la scena passa a `facciaStretta`.
 */
export const FacciaStretta: Story = {
  name: 'Faccia stretta',
  globals: { viewport: { value: 'telefono', isRotated: false } },
  render: () => <Guscio dati={NORME} faccia="schede" />,
}

/**
 * `faccia="auto"`: decide `soglia`, col valore di default. È la sola scena
 * che cambia forma con la larghezza della finestra — la tabella sopra i
 * 1024px, le schede sotto. Si vede aprendo la scena da sola e stringendo la
 * finestra, o con l'interruttore Viewport.
 */
export const SogliaDellaPagina: Story = {
  name: 'Soglia della pagina',
  render: () => <Guscio dati={NORME} />,
}

/**
 * Sei norme: il riquadro resta alto quanto il contenuto, e il piè —
 * conteggio e paginazione — sta subito sotto l'ultima riga.
 */
export const PocheRighe: Story = {
  // `faccia="tabella"`: la tesi di questa scena è sul **riquadro** — che si
  // ferma sul contenuto e tiene il piè in vista — e sotto soglia un riquadro
  // non c'è. Lasciandola in `'auto'` cambierebbe soggetto restringendo la
  // finestra, senza dirlo.
  render: () => <Guscio dati={NORME.slice(0, 6)} faccia="tabella" />,
}

/** `stato="caricamento"`: `PageSkeleton` al posto della tabella. */
export const Caricamento: Story = {
  render: () => <Guscio dati={[]} stato="caricamento" />,
}

/** `stato="errore"`: la chiamata che carica l'elenco è fallita. */
export const Errore: Story = {
  render: () => <Guscio dati={[]} stato="errore" />,
}

/**
 * Non esiste ancora nessuna norma: al posto della tabella, `vuotoIniziale`
 * con l'azione che crea la prima. La ricerca che non trova niente è un'altra
 * cosa, e la rende la tabella.
 */
export const VuotoIniziale: Story = {
  render: () => <Guscio dati={[]} />,
}

