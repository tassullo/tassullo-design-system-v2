import type { Meta, StoryObj } from '@storybook/react-vite'
import { CopyIcon, EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'

import { apriCol } from '@/prove/apri'
import {
  DataTable,
  IntestazioneColonna,
  creaColonne,
} from '@/registry/tassullo/blocks/data-table'
import { Badge } from '@/registry/tassullo/ui/badge'
import { Button } from '@/registry/tassullo/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/tassullo/ui/dropdown-menu'

/* ────────────────────────────────────────────────────────────────────────
 * I dati finti
 *
 * **Generati, e sempre gli stessi.** 500 righe scritte a mano non si scrivono;
 * 500 righe con `Math.random()` cambierebbero a ogni ricarica, e con loro
 * cambierebbero l'ordinamento, il conto dei risultati e ogni misura che si
 * prende sopra. Il generatore è quindi deterministico — un LCG con seme fisso
 * — e la tabella che si vede oggi è quella che si vedrà fra un mese.
 * ──────────────────────────────────────────────────────────────────────── */

type Prodotto = {
  id: string
  codice: string
  nome: string
  famiglia: string
  stato: 'bozza' | 'in revisione' | 'pubblicato' | 'archiviato'
  revisione: number
  aggiornato: Date
}

const FAMIGLIE = [
  'Intonaci deumidificanti',
  'Malte da muratura',
  'Massetti',
  'Rasanti',
  'Finiture ai silicati',
  'Adesivi cementizi',
  'Consolidanti',
  'Pitture minerali',
]

const RADICI = [
  'Calce',
  'Tassullo',
  'Dolomia',
  'Rinzaffo',
  'Termo',
  'Idro',
  'Bio',
  'Cocciopesto',
  'Grassello',
  'Marmorino',
]

const CODE = ['Base', 'Plus', 'Fine', 'Extra', 'Rapido', 'Bianco', 'Naturale', 'Pro']

const STATI: Prodotto['stato'][] = ['bozza', 'in revisione', 'pubblicato', 'archiviato']

/** Un generatore congruenziale lineare: stessi numeri a ogni esecuzione. */
function seminato(seme: number) {
  let s = seme
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

function generaProdotti(quanti: number): Prodotto[] {
  const caso = seminato(20260910)
  const scegli = <T,>(v: T[]): T => v[Math.floor(caso() * v.length)]

  return Array.from({ length: quanti }, (_, i) => {
    const famiglia = scegli(FAMIGLIE)
    const sigla = famiglia
      .split(' ')[0]
      .slice(0, 2)
      .toUpperCase()
    return {
      id: String(i + 1),
      // Il numero non è progressivo: serve che `A9` e `A10` finiscano nello
      // stesso mazzo, o l'ordinamento alfanumerico non si vedrebbe lavorare.
      codice: `${sigla}-${Math.floor(caso() * 900) + 100}${scegli(['', '', '', '/R'])}`,
      nome: `${scegli(RADICI)} ${scegli(CODE)}`,
      famiglia,
      stato: scegli(STATI),
      revisione: Math.floor(caso() * 12) + 1,
      aggiornato: new Date(
        2024 + Math.floor(caso() * 3),
        Math.floor(caso() * 12),
        Math.floor(caso() * 28) + 1
      ),
    }
  })
}

const PRODOTTI = generaProdotti(500)

const DATA = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const TONO: Record<Prodotto['stato'], 'default' | 'secondary' | 'outline'> = {
  bozza: 'outline',
  'in revisione': 'secondary',
  pubblicato: 'default',
  archiviato: 'outline',
}

/* ────────────────────────────────────────────────────────────────────────
 * Le colonne
 * ──────────────────────────────────────────────────────────────────────── */

const col = creaColonne<Prodotto>()

const COLONNE = col.columns([
  col.accessor('codice', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Codice" />,
    meta: { titolo: 'Codice', larghezza: 'w-32' },
    // `alphanumeric` e non `text`: con `text` il codice `IN-9` verrebbe dopo
    // `IN-10`, perché confronterebbe i caratteri e non i numeri.
    sortFn: 'alphanumeric',
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{getValue<string>()}</span>
    ),
  }),
  col.accessor('nome', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Nome" />,
    meta: { titolo: 'Nome', larghezza: 'w-52' },
    sortFn: 'text',
    cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
  }),
  col.accessor('famiglia', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Famiglia" />,
    meta: { titolo: 'Famiglia' },
    sortFn: 'text',
  }),
  col.accessor('stato', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Stato" />,
    meta: { titolo: 'Stato', larghezza: 'w-32' },
    sortFn: 'text',
    cell: ({ getValue }) => {
      const stato = getValue<Prodotto['stato']>()
      return <Badge variant={TONO[stato]}>{stato}</Badge>
    },
  }),
  col.accessor('revisione', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Rev." allinea="fine" />
    ),
    meta: { titolo: 'Revisione', larghezza: 'w-20' },
    sortFn: 'basic',
    // I numeri in colonna si allineano a destra e si incolonnano coi decimali:
    // `tabular-nums` ce l'ha già `Table`, per tutta la tabella.
    cell: ({ getValue }) => (
      <div className="text-right">{getValue<number>()}</div>
    ),
    enableGlobalFilter: false,
  }),
  col.accessor('aggiornato', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Aggiornato" allinea="fine" />
    ),
    meta: { titolo: 'Aggiornato', larghezza: 'w-32' },
    sortFn: 'datetime',
    cell: ({ getValue }) => (
      <div className="text-right">{DATA.format(getValue<Date>())}</div>
    ),
    enableGlobalFilter: false,
  }),
  col.display({
    id: 'azioni',
    meta: { larghezza: 'w-12' },
    header: () => <span className="sr-only">Azioni</span>,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" className="-my-1 ml-auto flex" />}
          aria-label={`Azioni su ${row.original.nome}`}
        >
          <EllipsisVerticalIcon aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Il gruppo non è decorazione: `DropdownMenuLabel` è `Menu.GroupLabel`
              di Base UI e senza `Menu.Group` lancia — a menu aperto, cioè dove
              nessuno guarda. Vedi `dropdown-menu.stories.tsx`. */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>{row.original.codice}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <PencilIcon aria-hidden />
              Modifica
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CopyIcon aria-hidden />
              Duplica
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* `variant="destructive"`, non `className="text-destructive"`: sul
                fondo scuro il rosso pieno come inchiostro dà 3.52:1, ed è la
                violazione che il gate ha preso in M3.2. */}
            <DropdownMenuItem variant="destructive">
              <Trash2Icon aria-hidden />
              Elimina
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableHiding: false,
  }),
])

/* ────────────────────────────────────────────────────────────────────────
 * Le story
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * La **tabella di dati**: ricerca, ordinamento, paginazione, selezione,
 * colonne nascondibili e due stati vuoti, in una dichiarazione sola.
 *
 * È il blocco che toglie più codice ad Anagrafe — Prodotti, Famiglie, Norme e
 * Pubblicazioni sono quattro volte la stessa tabella, riscritta quattro volte.
 *
 * ```tsx
 * const col = creaColonne<Prodotto>()
 * const COLONNE = col.columns([
 *   col.accessor('codice', {
 *     header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Codice" />,
 *     meta: { titolo: 'Codice' },
 *     sortFn: 'alphanumeric',
 *   }),
 * ])
 *
 * <DataTable colonne={COLONNE} dati={prodotti} cerca="Cerca un prodotto…" selezione />
 * ```
 *
 * ## shadcn un `data-table` non ce l&apos;ha, ed è una scelta sua
 *
 * La sua pagina è dichiaratamente una **guida**: «ogni tabella che ho scritto
 * era diversa; metterle tutte in un componente vuol dire perdere la
 * flessibilità che l&apos;headless dà». Chiesto all&apos;MCP prima di scrivere
 * (regola 4bis, gradino 1): nel registry c&apos;è `table` — le sei etichette
 * HTML vestite — e `data-table-demo`, che è un esempio e per lo stile
 * `base-nova` non esiste nemmeno.
 *
 * Quella flessibilità però **noi non la vogliamo pagare quattro volte**. La
 * guida lascia intero a chi la segue tutto il contorno: caratteristiche, stato,
 * ricerca, paginazione, da riassemblare a mano in ogni pagina. Ed è esattamente
 * il meccanismo con cui le app del v1 sono divergite — nessuna ha scritto la
 * tabella *male*, l&apos;hanno scritta ognuna *un po&apos; diversa*.
 *
 * Quindi la riga passa qui: **le colonne restano di TanStack, il contorno è
 * nostro**. `creaColonne()` è il loro `createColumnHelper` con la sola generica
 * delle caratteristiche già messa — chi scrive una colonna scrive TanStack
 * vero, e la documentazione che gli serve è la loro.
 *
 * ## TanStack Table v9, e cosa non è più vero
 *
 * La v9 è **a caratteristiche**: si dichiara con `tableFeatures()` ciò che
 * serve e il resto sparisce dal bundle. Cadono i `get*RowModel` fra le opzioni
 * — i modelli di riga si creano con `create*RowModel()` — e cadono anche le
 * funzioni di filtro e di ordinamento incorporate, da registrare una per una.
 * Chi ricorda `useReactTable`, `getCoreRowModel()` e `flexRender(...)` ricorda
 * la v8: qui sono `useTable` e `<table.FlexRender />`.
 *
 * ## Tre scostamenti dalla guida, tutti voluti
 *
 * **1. Si cerca in tutta la tabella, non in una colonna.** La guida filtra
 * `email`, cioè una colonna scelta a mano; le pagine di Anagrafe hanno una
 * casella sola che guarda tutto. Le colonne che non devono entrarci lo dicono
 * con `enableGlobalFilter: false` — qui `Rev.` e `Aggiornato`, dove cercare
 * «12» avrebbe pescato mezze tabella.
 *
 * **2. L&apos;intestazione ordina con un clic, non con un menu.** La guida
 * offre `DataTableColumnHeader`, che apre un menu con Asc/Desc/Nascondi: da
 * tastiera sono **quattro gesti** per la cosa che si fa più spesso. Qui
 * l&apos;intestazione *è* il bottone, e cicla crescente → decrescente →
 * nessun ordine — un Tab e un Invio. Il terzo tempo conta: senza, una colonna
 * ordinata per sbaglio non si può più disordinare. Nascondere una colonna resta
 * possibile, dal menu «Colonne», che è dove si va quando si vuole quello.
 *
 * **3. Il `<th>` dichiara `aria-sort`.** La guida non lo fa e axe non lo
 * pretende, ma è l&apos;unico modo in cui un lettore di schermo sa che la
 * tabella è ordinata e come.
 *
 * ## Due stati vuoti, non uno
 *
 * «Nessun risultato» dopo una ricerca e «non c&apos;è ancora niente» su una
 * tabella appena creata **non sono la stessa cosa**: il primo ha un rimedio —
 * togli il filtro, e il blocco offre il bottone che lo fa — il secondo no. La
 * guida ne ha uno solo, `No results.`, che su una tabella vuota dice la cosa
 * sbagliata.
 *
 * ## I dati di queste story
 *
 * **500 righe generate, e sempre le stesse.** Il generatore è un LCG con seme
 * fisso: con `Math.random()` cambierebbero a ogni ricarica, e con loro
 * l&apos;ordinamento, il conto dei risultati e ogni misura presa sopra.
 */
const meta: Meta<typeof DataTable<Prodotto>> = {
  title: 'Blocchi/Data Table',
  component: DataTable,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * La forma completa: 500 prodotti, ricerca, selezione, colonne nascondibili,
 * 25 righe per pagina.
 */
export const Prodotti: Story = {
  args: {
    colonne: COLONNE,
    dati: PRODOTTI,
    cerca: 'Cerca per codice, nome o famiglia…',
    selezione: true,
    perPagina: 25,
    vuoto: { titolo: 'Nessun prodotto in archivio' },
  },
}

/**
 * **Il menu di riga, aperto.** È la story che il gate misura col popup aperto:
 * `apri.ts` ne apre **uno per story**, e il primo grilletto della pagina è
 * quello della prima riga.
 *
 * Dieci righe e niente ricerca, perché con la barra sopra il grilletto che
 * `apriCol` trova per primo sarebbe un altro.
 */
export const MenuDiRiga: Story = {
  name: 'Menu Di Riga',
  args: {
    colonne: COLONNE,
    dati: PRODOTTI.slice(0, 10),
    cerca: false,
    colonneNascondibili: false,
    perPagina: 10,
  },
  play: apriCol('[data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

/**
 * **Il menu «Colonne», aperto.** Serve una story a parte, e non è duplicazione
 * accidentale: `apri.ts` apre un popup per story, e questa tabella ne ha due
 * generi — il menu di riga e quello delle colonne. È la stessa lezione di M2.3
 * e M2.6, riapplicata dentro un blocco: un popup che il gate non apre è un
 * popup di cui non sa niente.
 *
 * Qui la colonna delle azioni non c&apos;è, così il primo grilletto della
 * pagina è quello giusto.
 */
export const MenuDelleColonne: Story = {
  name: 'Menu Delle Colonne',
  args: {
    colonne: COLONNE.filter((c) => c.id !== 'azioni'),
    dati: PRODOTTI.slice(0, 10),
    cerca: false,
    perPagina: 10,
  },
  play: apriCol('[data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

/**
 * **Non c&apos;è ancora niente.** Lo stato di una tabella appena creata: un
 * rimedio c&apos;è, ed è creare il primo record — quindi il bottone lo dichiara
 * la pagina, che è l&apos;unica a sapere dove porta.
 */
export const SenzaDati: Story = {
  name: 'Senza Dati',
  args: {
    colonne: COLONNE,
    dati: [],
    cerca: 'Cerca un prodotto…',
    vuoto: {
      titolo: 'Nessun prodotto in archivio',
      descrizione: 'I prodotti pubblicati compariranno qui.',
      azione: <Button size="sm">Nuovo prodotto</Button>,
    },
  },
}

/**
 * **La tabella minima**: niente ricerca, niente selezione, niente menu delle
 * colonne. Per gli elenchi corti, dove cercare costa più che leggere.
 */
export const Minima: Story = {
  args: {
    colonne: COLONNE.filter((c) => c.id !== 'azioni'),
    dati: PRODOTTI.slice(0, 6),
    cerca: false,
    colonneNascondibili: false,
    perPagina: 10,
  },
}

/**
 * **La selezione non esce dalla tabella: è la barra che entra.** `barra` nella
 * forma a funzione riceve le righe scelte — i dati veri, non gli indici — e le
 * azioni di massa compaiono solo quando qualcosa è scelto.
 *
 * Una `onSelezione` non c&apos;è, e la mancanza è voluta: notificarla vorrebbe
 * dire un `useEffect` le cui dipendenze oneste sono un array nuovo a ogni
 * render e una funzione scritta inline dalla pagina — l&apos;effetto riparte,
 * chiama `setState`, il render riparte, e React **non interrompe il ciclo e non
 * stampa niente** (`CLAUDE.md`, le trappole; costò una sessione l&apos;8
 * settembre). Qui è una chiamata in fase di render, e non c&apos;è nessun
 * effetto da sbagliare.
 */
export const ConAzioniDiMassa: Story = {
  name: 'Con Azioni Di Massa',
  args: {
    colonne: COLONNE.filter((c) => c.id !== 'azioni'),
    dati: PRODOTTI.slice(0, 40),
    cerca: 'Cerca un prodotto…',
    selezione: true,
    perPagina: 10,
    barra: (scelti: Prodotto[]) =>
      scelti.length > 0 ? (
        <Button variant="outline" size="sm">
          <Trash2Icon aria-hidden />
          Archivia {scelti.length}
        </Button>
      ) : null,
  },
}
