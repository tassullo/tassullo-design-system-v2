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
 * **M4.2 — seconda pagina modello.** `PaginaLista` compone quattro blocchi
 * già nel registry — `page-header`, `data-table`, `empty-state`,
 * `error-state`, `page-skeleton` — nella forma che si ripete sei volte in
 * Anagrafe: Prodotti, Famiglie, Norme, Sistemi, Pubblicazioni, ChangeSets.
 *
 * Il caso qui non è Prodotti — quello è già in `Pagine/Prodotti (Anagrafe)`
 * (M3.10, gate di fase, blocchi assemblati a mano) — ma **Norme**, la stessa
 * forma con dati diversi: la prova che il blocco è generico e non "Prodotti
 * con un altro nome". A differenza di quella story, qui ci sono anche i due
 * stati che Prodotti non aveva ancora: `caricamento` ed `errore`.
 *
 * **Da M3bis.11a**, la pagina porta anche le capacità di FASE 3bis che una
 * pagina sola lista usa davvero: colonne ridimensionabili, bloccabili
 * (M3bis.3) e un menu di riga condiviso fra tendina e tasto destro
 * (M3bis.9) — sul caso comune (`Con Dati`, `Poche Righe`), non in una story
 * isolata a parte. Tree/subtotale, espansione, virtualizzazione e la Data
 * Grid editabile (M3bis.1, 2, 4, 5) restano fuori: sono il pattern del caso
 * reale "Computo" (già mostrato in `Blocchi/Data Table` e
 * `Blocchi/Data Grid`, story `Computo`), non di un elenco — non si sono
 * voluti forzare qui solo per completezza.
 *
 * ## M4ter.14 — la stessa testata e gli stessi filtri di Prodotti
 *
 * Rilievo di Francesco guardando questa pagina accanto a
 * `Pagine/Prodotti (Anagrafe)`: le due pagine modello dello stesso elenco
 * mostravano tre forme diverse della stessa cosa. Allineate qui, e la
 * pagina modello segue la pagina reale, non il contrario.
 *
 * - **La testata è `IntestazioneColonnaMenu`** — un solo grilletto «⋮» che
 *   si rivela al passaggio e porta Ordina + Blocca. Prima erano tre
 *   controlli sempre accesi per colonna: freccia d'ordinamento, puntina,
 *   maniglia di trascinamento.
 * - **`colonneRiordinabili` è caduto**, come su Prodotti (M3bis.11b lo
 *   aveva già escluso lì). Il riordino per trascinamento resta dimostrato
 *   in `Blocchi/Data Table` → `Colonne Riordinabili`.
 * - **I filtri sono sfaccettati** (M3bis.6) su Categoria e Stato, col
 *   conteggio per opzione, al posto del `Select` «Tutti gli enti» — v. la
 *   nota su `BarraFiltri`, sotto, per perché l'ente non poteva restare.
 *
 * ## D10 — la cella `375px × touch`
 *
 * `docs/DECISIONI.md` §29 e `PIANO.md` §M4.2 chiedono la misura su questa
 * pagina, la più densa del registry, nelle quattro combinazioni viewport ×
 * densità. Verdetto e misure in `WORKLOG.md`, voce **M4.2**.
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
  nome: 'Francesco',
  cognome: 'Sartori',
  email: 'fsartori@covicostruzioni.it',
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
          la scrive la pagina, o si leggerebbe «True»/«False». */}
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
                <CollapsibleTrigger className="group/riga flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none">
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
 * Il caso comune: 48 norme finte, ricerca, due filtri sfaccettati,
 * paginazione a 25 — più le capacità di FASE 3bis (M3bis.11a): colonne
 * ridimensionabili e bloccabili, il menu di testata «⋮» che porta
 * ordinamento e blocco, e il menu di riga condiviso (tendina «⋯» e tasto
 * destro) sulla stessa `<MenuAzioniNorma />`.
 */
export const ConDati: Story = {
  // `faccia="tabella"`, non `'auto'`: il gate deve vedere il markup largo
  // **vero**, non quello che capita alla larghezza con cui la finestra del
  // test è stata aperta (`docs/DECISIONI.md` §46). La scena che dipende
  // davvero dall'hook è `Soglia della pagina`, sotto.
  render: () => <Guscio dati={NORME} faccia="tabella" />,
  // Non il primo `dropdown-menu-trigger` della pagina: quello è il menu
  // utente della sidebar (`AppShell`), montato prima della tabella nel DOM.
  // Il grilletto di riga vive dentro il `<tbody>`.
  play: apriCol('tbody [data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

/**
 * **La faccia stretta** (M4ter.16), resa in modo deterministico: una scheda
 * per norma, raggruppate per categoria, il pannello con ente e le tre azioni.
 * Un solo filtro — lo Stato, a chip — e **nessun popover** da aprire col
 * pollice: la Categoria è diventata il raggruppamento, e l'Ente è la testa
 * del codice, quindi la ricerca ci arriva già.
 *
 * Da guardare **restringendo la finestra del browser**, non con
 * l'interruttore Viewport: quello ridimensiona l'iframe nella cornice del
 * manager e `window.innerWidth` non si muove (`docs/DECISIONI.md` §46).
 * Questa scena non ne ha bisogno, perché rende la faccia per la prop.
 */
export const FacciaStretta: Story = {
  name: 'Faccia stretta',
  render: () => <Guscio dati={NORME} faccia="schede" />,
}

/**
 * **La scena che dipende davvero dalla finestra.** `faccia="auto"`: la sceglie
 * `useSoglia` dentro `PaginaLista`, col default di **1024px** — quindi questa
 * story cambia forma restringendo la finestra del browser, ed è l'unica delle
 * tre che lo fa.
 *
 * Nel gate rende **la faccia larga**, perché la finestra dell'imbracatura è
 * 1440. È un numero da rimisurare ogni volta che la soglia cambia: portandola
 * sopra 1440 questa scena passerebbe alle schede e il gate continuerebbe a
 * dire «0 violazioni» senza segnalare niente — è §46 applicata alla story che
 * la cita.
 */
export const SogliaDellaPagina: Story = {
  name: 'Soglia della pagina',
  render: () => <Guscio dati={NORME} />,
}

/**
 * **Poche righe, `altezza="ferma"`**: il riquadro non cresce forzato — resta
 * alto quanto il contenuto, senza vuoto sotto — ma il piè (conteggio,
 * paginazione) è comunque sempre visibile senza scorrere niente. È il
 * rovescio di `ConDati`: lì il riquadro si ferma e la tabella scorre al suo
 * interno, qui non c'è niente da far scorrere.
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
 * **Nessuna norma esiste ancora** — non "la ricerca non trova niente", che
 * `DataTable` gestisce da sé (story `ConDati`, i filtri sfaccettati). Qui la
 * tabella non compare affatto: `vuotoIniziale` la sostituisce con la CTA che
 * crea la prima norma.
 */
export const VuotoIniziale: Story = {
  render: () => <Guscio dati={[]} />,
}

