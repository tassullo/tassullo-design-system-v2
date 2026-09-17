import { useMemo, useState } from 'react'
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
  IntestazioneColonna,
  RowMenuItem,
  RowMenuSeparator,
  useDataTableRow,
} from '@/registry/tassullo/blocks/data-table'
import { PaginaLista } from '@/registry/tassullo/pages/pagina-lista'
import { apriCol } from '@/prove/apri'
import { TONO } from '@/registry/tassullo/lib/toni'
import { Badge } from '@/registry/tassullo/ui/badge'
import { Button } from '@/registry/tassullo/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/registry/tassullo/ui/select'

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

const col = creaColonne<Norma>()

const COLONNE = col.columns([
  col.accessor('codice', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Codice" />,
    meta: { titolo: 'Codice', larghezza: 'w-36' },
    sortFn: 'alphanumeric',
    // Il codice è il varco alla scheda di norma — `variant="link"` e non un
    // colore a mano, stessa forma della colonna "Nome" di Prodotti: senza una
    // pagina scheda da aprire in Storybook resta un `#`, qui conta la forma.
    cell: ({ getValue }) => (
      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 font-mono text-sm"
        render={<a href="#" />}
      >
        {getValue<string>()}
      </Button>
    ),
  }),
  col.accessor('titolo', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Titolo" />,
    // Nessuna `larghezza`: è la colonna che assorbe lo spazio libero — le
    // altre sono tutte a larghezza fissa (identificatori o etichette corte).
    meta: { titolo: 'Titolo' },
    sortFn: 'text',
  }),
  col.accessor('categoria', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Categoria" />,
    meta: { titolo: 'Categoria', larghezza: 'w-28' },
    sortFn: 'text',
  }),
  col.accessor('vigente', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Stato" />,
    meta: { titolo: 'Stato', larghezza: 'w-28' },
    sortFn: 'basic',
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Badge className={TONO.success}>Vigente</Badge>
      ) : (
        <Badge className={TONO.warning}>Superata</Badge>
      ),
  }),
])

/**
 * Le stesse quattro colonne di `COLONNE`, ma con `size`/`minSize` al posto
 * di `meta.larghezza` (M3bis.3, stesso motivo di `COLONNE_RIDIMENSIONABILI`
 * in `data-table.stories.tsx`: qui la larghezza di partenza la dichiara
 * l'utente, trascinando, non più solo Tailwind). Nessuna colonna azioni: la
 * story `MenuRiga`, sotto, l'aggiunge da sé via `menuRiga`.
 */
const colRidimensionabile = creaColonne<Norma>()
const COLONNE_RIDIMENSIONABILI = colRidimensionabile.columns([
  colRidimensionabile.accessor('codice', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Codice" />,
    meta: { titolo: 'Codice' },
    sortFn: 'alphanumeric',
    size: 140,
    minSize: 90,
    cell: ({ getValue }) => <span className="font-mono text-sm">{getValue<string>()}</span>,
  }),
  colRidimensionabile.accessor('titolo', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Titolo" />,
    meta: { titolo: 'Titolo' },
    sortFn: 'text',
    size: 320,
    minSize: 160,
  }),
  colRidimensionabile.accessor('categoria', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Categoria" />,
    meta: { titolo: 'Categoria' },
    sortFn: 'text',
    size: 150,
    minSize: 100,
  }),
  colRidimensionabile.accessor('vigente', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Stato" />,
    meta: { titolo: 'Stato' },
    sortFn: 'basic',
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

function BarraFiltri({ ente, setEnte }: { ente: string; setEnte: (v: string) => void }) {
  return (
    <Select
      value={ente}
      onValueChange={(v) => setEnte(v ?? 'tutti')}
      items={[{ value: 'tutti', label: 'Tutti gli enti' }, ...ENTI.map((e) => ({ value: e, label: e }))]}
    >
      <SelectTrigger size="sm" aria-label="Ente" className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="tutti">Tutti gli enti</SelectItem>
          {ENTI.map((e) => (
            <SelectItem key={e} value={e}>
              {e}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function Norme({
  dati,
  stato,
}: {
  dati: Norma[]
  stato?: 'pronto' | 'caricamento' | 'errore'
}) {
  const [ente, setEnte] = useState('tutti')
  const filtrate = useMemo(
    () => (ente === 'tutti' ? dati : dati.filter((n) => n.ente === ente)),
    [dati, ente]
  )

  return (
    <PaginaLista
      percorso={[{ titolo: 'Norme' }]}
      azioni={[{ titolo: 'Nuova norma', icona: PlusIcon, ruolo: 'primaria' }]}
      colonne={COLONNE}
      dati={filtrate}
      stato={stato}
      cerca="Cerca codice, titolo…"
      perPagina={25}
      nomeRighe={{ singolare: 'norma', plurale: 'norme' }}
      barra={<BarraFiltri ente={ente} setEnte={setEnte} />}
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

/** Il caso comune: 48 norme finte, ricerca, un filtro, paginazione a 25. */
export const ConDati: Story = {
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
 * `DataTable` gestisce da sé (story `ConDati`, filtro sull'ente). Qui la
 * tabella non compare affatto: `vuotoIniziale` la sostituisce con la CTA che
 * crea la prima norma.
 */
export const VuotoIniziale: Story = {
  render: () => <Guscio dati={[]} />,
}

/* ────────────────────────────────────────────────────────────────────────
 * FASE 3bis (M3bis.11a) — le capacità di `data-table` avanzato che una
 * pagina **sola lista** usa davvero: colonne che si ridimensionano, si
 * bloccano, si riordinano (M3bis.3, M3bis.8), e un menu di riga condiviso
 * fra tendina e tasto destro (M3bis.9). Tree/subtotale, espansione,
 * virtualizzazione e la Data Grid editabile (M3bis.1, 2, 4, 5) restano fuori
 * da questa pagina: sono il pattern del caso reale "Computo", non di una
 * "lista", e non si sono voluti forzare su Norme solo per completezza — la
 * story `Prodotti (Anagrafe)` (M3bis.11b) chiude il conto dove hanno un caso
 * reale.
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * **Colonne ridimensionabili, bloccabili e riordinabili insieme** (M3bis.3,
 * M3bis.8) — le tre coesistono sulla stessa intestazione, come già provato in
 * `data-table.stories.tsx` (`Riordino Colonne`): qui la prova è che
 * compongono anche **dentro** `PaginaLista`, non solo su `DataTable` nudo.
 * Ricerca e ordinamento restano attivi, a differenza del riordino di righe.
 */
function NormeColonne({ dati }: { dati: Norma[] }) {
  return (
    <PaginaLista
      percorso={[{ titolo: 'Norme' }]}
      colonne={COLONNE_RIDIMENSIONABILI}
      dati={dati}
      cerca="Cerca codice, titolo…"
      perPagina={10}
      nomeRighe={{ singolare: 'norma', plurale: 'norme' }}
      ridimensionabile
      colonneBloccabili
      colonneRiordinabili
    />
  )
}

export const Colonne: Story = {
  render: () => (
    <AppShell
      applicazione="Anagrafe"
      collassa="icona"
      contenuto="riempie"
      utente={UTENTE}
      sezioni={SEZIONI}
    >
      <NormeColonne dati={NORME.slice(0, 15)} />
    </AppShell>
  ),
}

/**
 * **Il menu di riga condiviso** (M3bis.9): la tendina «⋯» che `menuRiga`
 * aggiunge da sé in coda, e lo stesso menu sul tasto destro dell'intera riga
 * — un'unica `<MenuAzioniNorma />`, letta due volte. `idRiga` è richiesto (v.
 * `DataTableProps.idRiga` in `data-table.tsx`): senza, l'identità di riga
 * sarebbe l'indice nell'array.
 */
function NormeMenuRiga({ dati }: { dati: Norma[] }) {
  return (
    <PaginaLista
      percorso={[{ titolo: 'Norme' }]}
      colonne={COLONNE_RIDIMENSIONABILI}
      dati={dati}
      cerca={false}
      perPagina={10}
      nomeRighe={{ singolare: 'norma', plurale: 'norme' }}
      idRiga={(n) => String(n.id)}
      menuRiga={{ menu: <MenuAzioniNorma />, ariaLabel: (n) => `Azioni su ${n.codice}` }}
    />
  )
}

export const MenuRiga: Story = {
  name: 'Menu Riga',
  render: () => (
    <AppShell
      applicazione="Anagrafe"
      collassa="icona"
      contenuto="riempie"
      utente={UTENTE}
      sezioni={SEZIONI}
    >
      <NormeMenuRiga dati={NORME.slice(0, 12)} />
    </AppShell>
  ),
  // Non il primo `dropdown-menu-trigger` della pagina: quello è il menu
  // utente della sidebar (`AppShell`), montato prima della tabella nel DOM.
  // Il grilletto di riga vive dentro il `<tbody>`.
  play: apriCol('tbody [data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}
