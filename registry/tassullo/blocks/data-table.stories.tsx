import type { Meta, StoryObj } from '@storybook/react-vite'
import { CopyIcon, EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'

import { apriCol } from '@/prove/apri'
import {
  CellaAlbero,
  DataTable,
  IntestazioneColonna,
  creaColonne,
} from '@/registry/tassullo/blocks/data-table'
import { TONO } from '@/registry/tassullo/lib/toni'
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

/**
 * Dallo stato del dominio al tono semantico, dichiarato **una volta** accanto
 * alle colonne. I quattro toni sono `TONO` di `lib/toni`, cioè le terne di
 * token del tema in un posto solo: è la forma che shadcn documenta per il
 * badge (*Custom Colors*, «adding custom classes»), con i nostri token al
 * posto di `bg-green-50`.
 *
 * `archiviato` prende il **neutro** di proposito: è lo stato che non dice
 * niente, e dargli un colore semantico lo farebbe sembrare un esito.
 */
const TONO_STATO: Record<Prodotto['stato'], string> = {
  bozza: TONO.warning,
  'in revisione': TONO.info,
  pubblicato: TONO.success,
  archiviato: TONO.neutro,
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
      return <Badge className={TONO_STATO[stato]}>{stato}</Badge>
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

/**
 * Le colonne di `ridimensionabile`/`colonneBloccabili` (M3bis.3): `size`/
 * `minSize` al posto di `meta.larghezza` — la colonna dichiara la sua
 * larghezza di partenza a TanStack, non a Tailwind, perché qui sarà anche
 * acquisita dall'utente (v. il commento su `MetaColonna` nel blocco). Una
 * sola senza `size`, `famiglia`, che assorbe lo spazio che avanza — la stessa
 * elasticità di `COLONNE` sopra, un meccanismo diverso.
 */
const colRidimensionabile = creaColonne<Prodotto>()
const COLONNE_RIDIMENSIONABILI = colRidimensionabile.columns([
  colRidimensionabile.accessor('codice', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Codice" />,
    meta: { titolo: 'Codice' },
    sortFn: 'alphanumeric',
    size: 140,
    minSize: 90,
    cell: ({ getValue }) => <span className="font-mono text-sm">{getValue<string>()}</span>,
  }),
  colRidimensionabile.accessor('nome', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Nome" />,
    meta: { titolo: 'Nome' },
    sortFn: 'text',
    size: 220,
    minSize: 120,
    cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
  }),
  colRidimensionabile.accessor('famiglia', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Famiglia" />,
    meta: { titolo: 'Famiglia' },
    sortFn: 'text',
  }),
  colRidimensionabile.accessor('stato', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Stato" />,
    meta: { titolo: 'Stato' },
    sortFn: 'text',
    size: 130,
    minSize: 90,
    cell: ({ getValue }) => {
      const stato = getValue<Prodotto['stato']>()
      return <Badge className={TONO_STATO[stato]}>{stato}</Badge>
    },
  }),
  colRidimensionabile.accessor('aggiornato', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Aggiornato" allinea="fine" />
    ),
    meta: { titolo: 'Aggiornato' },
    sortFn: 'datetime',
    size: 140,
    minSize: 100,
    cell: ({ getValue }) => <div className="text-right">{DATA.format(getValue<Date>())}</div>,
    enableGlobalFilter: false,
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
    bloccaPrimaColonna: true,
    perPagina: 25,
    vuoto: { titolo: 'Nessun prodotto in archivio' },
  },
}

/**
 * **La stessa tabella dentro 320px** — la larghezza che resta su uno schermo da
 * 375px, dove la colonna del guscio non c&apos;è. Il riquadro è stretto di
 * proposito e a qualunque viewport, come la `Fascia Stretta` di `page-header`:
 * serve che il caso stretto si possa **misurare**, e l&apos;imbracatura del
 * gate non ha un modo affidabile di cambiare viewport.
 *
 * ## Qui la tabella scorre, ed è la risposta di shadcn
 *
 * `dashboard-01` non nasconde nessuna colonna sotto una soglia: lascia scorrere
 * la tabella e mette `hidden lg:flex` solo sulla **chrome di paginazione** — il
 * conto delle righe e i salti a prima e ultima pagina. Chiesto guardando il suo
 * sorgente, non presunto, e qui è lo stesso: sotto `sm` restano avanti,
 * indietro e la scelta delle righe.
 *
 * ## Quello che shadcn non fa, e che serve
 *
 * Scorrere e basta ha un difetto che si vede solo provandolo: a due terzi di
 * tabella fuori dallo schermo si legge **una data senza sapere di che prodotto
 * sia**. `bloccaPrimaColonna` tiene ferme a sinistra la casella e il codice, e
 * il contenuto passa **sotto** il loro bordo destro — che è anche il solo segno
 * necessario: non c&apos;è bisogno di scrivere «scorri» se si vede qualcosa
 * scorrere.
 *
 * Il fondo delle celle bloccate non è decorazione: senza, il testo delle altre
 * colonne passerebbe **sotto** il loro e si leggerebbe come un guasto di resa.
 * E segue lo stato della riga — sorvolo e selezione — o la colonna ferma
 * resterebbe bianca mentre il resto si tinge.
 *
 * ## Cosa resta a M4.2
 *
 * **Se 375×touch sia un bersaglio è D10, e il verdetto è di M4.2**, su una
 * pagina lista vera. Qui si è fatta la parte della tabella: che scorrere sia
 * onesto. Se M4.2 deciderà che a quella larghezza la tabella non ci va, la
 * risposta non sarà una soglia dentro questo blocco ma una **pagina** diversa.
 */
export const Stretta: Story = {
  args: {
    colonne: COLONNE,
    dati: PRODOTTI.slice(0, 12),
    cerca: 'Cerca…',
    selezione: true,
    bloccaPrimaColonna: true,
    colonneNascondibili: false,
    perPagina: 10,
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        Riquadro da 320px — la larghezza utile di uno schermo da 375px, dove la
        colonna del guscio non c&apos;è. Stretto di proposito: le soglie di una
        tabella guardano la tabella, non lo schermo.
      </p>
      <div className="w-80 rounded-lg border border-dashed p-2">
        <DataTable {...args} />
      </div>
    </div>
  ),
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
 * **Colonne ridimensionabili** (M3bis.3, D17 riaperta e generalizzata). Il
 * filo sul bordo destro di ogni intestazione si trascina col mouse — o si
 * comanda da tastiera: `Tab` fino alla maniglia, frecce sinistra/destra per
 * allargare o restringere di 16px alla volta, `Home` per tornare alla
 * larghezza di partenza. `Famiglia` non dichiara `size`: assorbe lo spazio
 * che avanza, come farebbe senza `meta.larghezza` nella forma non
 * ridimensionabile.
 *
 * Nessun `play`: la maniglia non apre un popup — è un `role="separator"`
 * misurato a riposo, in entrambi gli stati del gate come ogni altra story.
 */
export const Ridimensionabile: StoryObj<typeof DataTable<Prodotto>> = {
  args: {
    colonne: COLONNE_RIDIMENSIONABILI,
    dati: PRODOTTI.slice(0, 15),
    cerca: false,
    colonneNascondibili: false,
    perPagina: 10,
    ridimensionabile: true,
  },
}

/**
 * **Il pin generalizzato, aperto** — il menu che `PinIcon` apre in ogni
 * intestazione bloccabile: "Blocca a sinistra" / "Blocca a destra" / "Non
 * bloccare". A differenza di `bloccaPrimaColonna` (v. `Stretta`, sopra) qui
 * qualunque colonna può bloccarsi, su entrambi i lati — lo sticky si calcola
 * dalle larghezze acquisite (`ancoraggioColonna`), non da una classe fissa
 * per indice.
 *
 * Il primo grilletto `dropdown-menu-trigger` della pagina è quello di
 * `Codice`, la prima colonna: nessuna colonna di selezione o d'azioni qui,
 * per la stessa ragione di `MenuDelleColonne` sopra — un popup che il gate
 * non apre è un popup di cui non sa niente.
 */
export const ColonneBloccabili: Story = {
  name: 'Colonne Bloccabili',
  args: {
    colonne: COLONNE_RIDIMENSIONABILI,
    dati: PRODOTTI.slice(0, 10),
    cerca: false,
    colonneNascondibili: false,
    perPagina: 10,
    colonneBloccabili: true,
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
 * **Tutto il contorno è facoltativo, e questa story è il banco che lo prova.**
 *
 * Sei righe, `cerca={false}` e `colonneNascondibili={false}`: restano la sola
 * tabella e la riga di paginazione. È la forma da usare per un elenco corto
 * incastonato in una scheda — dove una casella di ricerca su sei righe costa
 * più che leggerle — e serve a dire che il blocco **non impone la propria
 * barra**: chi lo installa non si trova addosso della chrome che non ha
 * chiesto.
 *
 * Da guardare accanto a `Prodotti`, che è la stessa tabella col contorno
 * acceso: la differenza fra le due *è* il contenuto di questa story.
 */
export const ElencoCorto: Story = {
  name: 'Elenco Corto',
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

/* ────────────────────────────────────────────────────────────────────────
 * L'albero (M3bis.1) — righe annidate con subtotale
 *
 * Il caso reale che ha aperto la FASE 3bis: il "Computo metrico estimativo"
 * di Studio Tassullo, dove ogni **voce** (uno scavo, un intonaco, una
 * tinteggiatura) porta le proprie **misurazioni** — righe di dettaglio con
 * quantità e importo, dati veri e non un raggruppamento per colonna
 * (`WORKLOG.md`, valutazione niko-table).
 * ──────────────────────────────────────────────────────────────────────── */

type Misurazione = {
  id: string
  voce: string
  udm: string
  quantita: number
  importo: number
}

type Voce = {
  id: string
  voce: string
  udm: ''
  quantita: undefined
  importo: undefined
  figli: Misurazione[]
}

/** Una riga di computo è una voce (con figli) o una sua misurazione (senza). */
type RigaComputo = Voce | Misurazione

const VOCI_COMPUTO = [
  {
    voce: '01.01 — Scavo di sbancamento in terreno di qualsiasi natura, fino a 2 m',
    udm: 'm³',
    prezzo: 18.4,
  },
  {
    voce: '02.03 — Formazione di massetto in calcestruzzo alleggerito, spessore 8 cm',
    udm: 'm²',
    prezzo: 22.1,
  },
  {
    voce: '03.05 — Intonaco deumidificante a base di calce e pozzolana, tre mani',
    udm: 'm²',
    prezzo: 34.7,
  },
  {
    voce: '04.02 — Rimozione di pavimentazione esistente e trasporto a discarica',
    udm: 'm²',
    prezzo: 9.8,
  },
  {
    voce: '05.04 — Tinteggiatura con pittura ai silicati, due mani a coprire',
    udm: 'm²',
    prezzo: 11.6,
  },
]

const AMBIENTI = [
  'Piano terra — ambiente 1',
  'Piano terra — ambiente 2',
  'Piano terra — corridoio',
  'Piano primo — ambiente 1',
  'Piano primo — ambiente 2',
  'Piano primo — corridoio',
  'Piano secondo — ambiente 1',
]

/** Stesso generatore delle 500 righe di `Prodotti`: seme fisso, stesso conto ogni volta. */
function generaComputo(): Voce[] {
  const caso = seminato(20260916)
  return VOCI_COMPUTO.map((v, i) => {
    const quante = 2 + Math.floor(caso() * 3) // 2, 3 o 4 misurazioni per voce
    const figli: Misurazione[] = Array.from({ length: quante }, (_, k) => {
      const dimensione = 3 + caso() * 9
      const quantita = Math.round(dimensione * 100) / 100
      return {
        id: `${i + 1}.${k + 1}`,
        voce: AMBIENTI[(i + k) % AMBIENTI.length],
        udm: v.udm,
        quantita,
        importo: Math.round(quantita * v.prezzo * 100) / 100,
      }
    })
    return {
      id: String(i + 1),
      voce: v.voce,
      udm: '',
      quantita: undefined,
      importo: undefined,
      figli,
    }
  })
}

const COMPUTO = generaComputo()

const NUMERO = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const VALUTA = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })

const colAlbero = creaColonne<RigaComputo>()

const COLONNE_ALBERO = colAlbero.columns([
  colAlbero.accessor('voce', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Voce / misurazione" />,
    meta: { titolo: 'Voce' },
    sortFn: 'text',
    // Il rientro e lo `chevron` stanno **dentro** questa colonna, non in una
    // colonna a sé: è la colonna che identifica la riga, la stessa scelta di
    // un esploratore di file.
    cell: ({ row, getValue }) => <CellaAlbero riga={row}>{getValue<string>()}</CellaAlbero>,
  }),
  colAlbero.accessor('udm', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="U.M." />,
    meta: { titolo: 'U.M.', larghezza: 'w-16' },
    enableGlobalFilter: false,
  }),
  colAlbero.accessor('quantita', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Quantità" allinea="fine" />
    ),
    meta: {
      titolo: 'Quantità',
      larghezza: 'w-28',
      // Una funzione, non `"somma"`: l'unità di misura va scritta insieme al
      // numero, e quella è la stessa formattazione della cella normale sotto.
      sottototale: (figli: RigaComputo[]) => (
        <div className="text-right font-medium">
          {NUMERO.format(figli.reduce((tot, f) => tot + (f.quantita ?? 0), 0))}
        </div>
      ),
    },
    sortFn: 'basic',
    cell: ({ getValue }) => {
      const v = getValue<number | undefined>()
      return <div className="text-right">{v === undefined ? null : NUMERO.format(v)}</div>
    },
    enableGlobalFilter: false,
  }),
  colAlbero.accessor('importo', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Importo" allinea="fine" />
    ),
    meta: {
      titolo: 'Importo',
      larghezza: 'w-32',
      sottototale: (figli: RigaComputo[]) => (
        <div className="text-right font-semibold">
          {VALUTA.format(figli.reduce((tot, f) => tot + (f.importo ?? 0), 0))}
        </div>
      ),
    },
    sortFn: 'basic',
    cell: ({ getValue }) => {
      const v = getValue<number | undefined>()
      return <div className="text-right">{v === undefined ? null : VALUTA.format(v)}</div>
    },
    enableGlobalFilter: false,
  }),
])

/**
 * **Righe annidate, subtotale, selezione a cascata** — il pattern "Tree" di
 * niko-table, portato: `getSottoRighe` legge `figli` dal dato vero (non un
 * raggruppamento), `CellaAlbero` disegna rientro e `chevron` nella colonna
 * "Voce", e `meta.sottototale` calcola quantità e importo di ogni voce dalle
 * sue misurazioni — sempre visibile, anche a riga collassata.
 *
 * **Da tastiera**: `Tab` porta al `chevron` di una voce, `Invio` o `Spazio`
 * la espande; la casella della voce, selezionata, seleziona a cascata tutte
 * le misurazioni sotto — prova con la prima voce, "Scavo di sbancamento".
 */
export const Albero: StoryObj<typeof DataTable<RigaComputo>> = {
  args: {
    colonne: COLONNE_ALBERO,
    dati: COMPUTO,
    cerca: false,
    selezione: true,
    colonneNascondibili: false,
    getSottoRighe: (riga) => ('figli' in riga ? riga.figli : undefined),
    nomeRighe: { singolare: 'voce', plurale: 'voci' },
    vuoto: { titolo: 'Nessuna voce nel computo' },
  },
}

/* ────────────────────────────────────────────────────────────────────────
 * L'espansione (M3bis.2) — pannello di dettaglio per riga
 *
 * Diverso dall'Albero qui sopra: lì `figli` sono righe vere del dato
 * (misurazioni di una voce), qui il pannello non è un dato — è markup libero,
 * sempre fratello della riga che lo apre, mai un figlio. Il caso qui è un
 * riepilogo tecnico del prodotto, quello che oggi in Anagrafe costerebbe
 * aprire la scheda solo per leggere due righe.
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * **Il pannello di dettaglio, aperto/chiuso da un chevron proprio** —
 * porting da "Row Expansion Table" di niko-table. La colonna del chevron la
 * aggiunge il blocco da sé (`pannelloRiga` come prop, come `colonnaSelezione`
 * per `selezione`): la pagina scrive solo cosa mostrare.
 *
 * **Non tutte le righe hanno un chevron**: `pannelloRiga` restituisce `null`
 * per i prodotti `archiviato` — niente da riepilogare su un prodotto ritirato
 * — e quella riga resta senza controllo, `getCanExpand()` risulta falso.
 *
 * **Da tastiera**: `Tab` porta al chevron della prima riga espandibile,
 * `Invio` o `Spazio` apre il pannello sotto — una riga in più nella tabella,
 * non un popup: nessun fuoco da intrappolare, nessuna guardia di Base UI.
 */
export const Espansione: StoryObj<typeof DataTable<Prodotto>> = {
  args: {
    colonne: COLONNE.filter((c) => c.id !== 'azioni'),
    dati: PRODOTTI.slice(0, 10),
    cerca: false,
    colonneNascondibili: false,
    perPagina: 10,
    pannelloRiga: (prodotto: Prodotto) =>
      prodotto.stato === 'archiviato' ? null : (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 py-1 text-sm">
          <dt className="text-muted-foreground">Famiglia</dt>
          <dd>{prodotto.famiglia}</dd>
          <dt className="text-muted-foreground">Stato</dt>
          <dd>{prodotto.stato}</dd>
          <dt className="text-muted-foreground">Ultimo aggiornamento</dt>
          <dd>{DATA.format(prodotto.aggiornato)}</dd>
        </dl>
      ),
  },
}
