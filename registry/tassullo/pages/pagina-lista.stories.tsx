import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  BookOpenIcon,
  CopyIcon,
  FileWarningIcon,
  PencilIcon,
  PlusIcon,
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

function Norme({
  dati,
  stato,
}: {
  dati: Norma[]
  stato?: 'pronto' | 'caricamento' | 'errore'
}) {
  return (
    <PaginaLista
      percorso={[{ titolo: 'Norme' }]}
      azioni={[{ titolo: 'Nuova norma', icona: PlusIcon, ruolo: 'primaria' }]}
      colonne={COLONNE}
      dati={dati}
      stato={stato}
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

function Guscio({ dati, stato }: { dati: Norma[]; stato?: 'pronto' | 'caricamento' | 'errore' }) {
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
      <Norme dati={dati} stato={stato} />
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
  render: () => <Guscio dati={NORME} />,
  // Non il primo `dropdown-menu-trigger` della pagina: quello è il menu
  // utente della sidebar (`AppShell`), montato prima della tabella nel DOM.
  // Il grilletto di riga vive dentro il `<tbody>`.
  play: apriCol('tbody [data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

/**
 * **Poche righe, `altezza="ferma"`**: il riquadro non cresce forzato — resta
 * alto quanto il contenuto, senza vuoto sotto — ma il piè (conteggio,
 * paginazione) è comunque sempre visibile senza scorrere niente. È il
 * rovescio di `ConDati`: lì il riquadro si ferma e la tabella scorre al suo
 * interno, qui non c'è niente da far scorrere.
 */
export const PocheRighe: Story = {
  render: () => <Guscio dati={NORME.slice(0, 6)} />,
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

