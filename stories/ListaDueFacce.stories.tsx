import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChevronDownIcon, PlusIcon, SearchIcon, WrenchIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from 'cn'
import {
  DataTable,
  IntestazioneColonna,
  creaColonne,
} from '@/registry/tassullo/blocks/data-table'
import { useSoglia } from '@/registry/tassullo/hooks/use-soglia'
import { intero } from '@/registry/tassullo/lib/numeri'
import { TONO } from '@/registry/tassullo/lib/toni'
import { Badge } from '@/registry/tassullo/ui/badge'
import { Button } from '@/registry/tassullo/ui/button'
import { Card } from '@/registry/tassullo/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/registry/tassullo/ui/collapsible'
import { EntityImage } from '@/registry/tassullo/ui/entity-image'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/registry/tassullo/ui/input-group'
import { Label } from '@/registry/tassullo/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/registry/tassullo/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/registry/tassullo/ui/toggle-group'

/**
 * # La lista a due facce
 *
 * Una ricetta, non un componente: una lista a nove colonne che sulla
 * scrivania è una tabella e sul telefono è un elenco di schede. Dal registry
 * servono due pezzi: `use-soglia`, il bivio, e `tassullo-data-table`, la
 * faccia larga. La faccia stretta la scrive la pagina.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/use-soglia
 * ```
 *
 * ```tsx
 * const largo = useSoglia('(min-width: 1024px)')
 * return largo ? <FacciaLarga … /> : <FacciaStretta … />
 * ```
 *
 * Una pagina elenco completa ha già il bivio dentro: `tassullo-pagina-lista`
 * lo offre con `facciaStretta` e `soglia`, e questa pagina è la ricetta a cui
 * rimanda.
 *
 * ## Il registry dà il bivio, la pagina scrive il resto
 *
 * `useSoglia` non sa cosa sia una lista: dice solo se una media query sulla
 * finestra è vera. La query la dichiara la pagina, perché quante colonne ha
 * la sua lista lo sa solo lei — nove colonne stanno strette dove tre stanno
 * larghe.
 *
 * E la faccia stretta non è la stessa lista impaginata due volte. Qui la
 * tendina dello stato diventa una fila di chip, la miniatura sparisce, il
 * bottone prende tutta la larghezza, il dettaglio si apre toccando la scheda
 * invece del chevron. Nessun blocco lo può ricavare dall'elenco delle
 * colonne.
 *
 * **Regole d'uso.**
 *
 * - Per scegliere fra due forme dello stesso contenuto si usa `useSoglia`,
 *   non `useIsMobile`. I 768px di `useIsMobile` sono quelli dell'arredamento
 *   — la colonna del guscio, il dialogo che diventa cassetto —, mentre la
 *   soglia di una lista dipende da quante colonne ha.
 * - La soglia la sceglie l'app, ed è la larghezza a cui l'interfaccia cambia
 *   modo di mostrare il contenuto. Non si ricava da quanto spazio vuole la
 *   tabella: una tabella che non ci sta scorre in orizzontale.
 * - Una colonna senza larghezza prende l'avanzo e non scende sotto 160px
 *   (240 in touch). Sotto la somma delle larghezze dichiarate più quel
 *   minimo, la tabella non si stringe: il suo riquadro scorre di lato. Per
 *   una lista pensata anche per il telefono, la risposta non è stringere le
 *   colonne ma la faccia a schede, che è questa pagina.
 * - Con `pannelloRiga` la prima colonna è quella del chevron, che la tabella
 *   aggiunge da sé: `bloccaPrimaColonna` bloccherebbe il chevron, non la
 *   colonna che identifica la riga. Qui non si usa.
 * - Se la pagina ha scene di documentazione o prove automatiche, conviene
 *   una prop che renda una faccia fissa — qui `faccia`, come in
 *   `tassullo-pagina-lista`. La larghezza della finestra non si comanda da
 *   una prova, e stringere un contenitore non sposta una media query sulla
 *   finestra.
 * - Da sapere: i filtri non passano da una faccia all'altra. Sulla faccia
 *   larga li tiene la tabella, su quella stretta la pagina.
 *
 * **Le foto** sono fotografie di macchinari da cantiere con licenza libera,
 * e mostrano `entity-image` con e senza sorgente: quattro righe su dodici
 * hanno il segnaposto. Sono fotografie con uno sfondo proprio, quindi nella
 * miniatura quadrata prendono `adatta="riempi"`. `alt=""` le dichiara
 * decorative, perché accanto c'è già il nome della riga.
 */
const meta = {
  title: 'Pagine/Lista a due facce',
  parameters: {
    // `fullscreen` e non il `centered` del preview: il canvas centrato stringe
    // il contenuto al suo contenuto, e una pagina che esiste per far vedere un
    // comportamento sulla larghezza misurerebbe sé stessa (M4ter.3, §45 h).
    layout: 'fullscreen',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/* ────────────────────────────────────────────────────────────────────────
 * I dati — il parco macchine, che è la lista vera di Officina
 * ──────────────────────────────────────────────────────────────────────── */

type Stato = 'in servizio' | 'in manutenzione' | 'guasto' | 'dismessa'

type Macchina = {
  id: string
  foto?: string
  matricola: string
  nome: string
  tipo: string
  stato: Stato
  reparto: string
  ore: number
  ultimoIntervento: Date
  prossimaRevisione: Date
}

// Fotografie di macchinari da cantiere da Wikimedia Commons, con licenza
// libera: autori e licenze in `public/esempi/LEGGIMI.md`.
const FOTO = {
  intonacatrice: 'esempi/macchina-intonacatrice.jpg',
  miscelatore: 'esempi/macchina-miscelatore.jpg',
  pompa: 'esempi/macchina-pompa.jpg',
  silo: 'esempi/macchina-silo.jpg',
  ponteggio: 'esempi/macchina-ponteggio.jpg',
  generatore: 'esempi/macchina-generatore.jpg',
  betoniera: 'esempi/macchina-betoniera.jpg',
  termocamera: 'esempi/macchina-termocamera.jpg',
}

const MACCHINE: Macchina[] = [
  {
    id: '1',
    foto: FOTO.intonacatrice,
    matricola: 'MX-1042',
    nome: 'Intonacatrice PFT G4',
    tipo: 'Intonacatrice',
    stato: 'in servizio',
    reparto: 'Cantiere Nord',
    ore: 4128,
    ultimoIntervento: new Date(2026, 5, 14),
    prossimaRevisione: new Date(2026, 11, 14),
  },
  {
    id: '2',
    foto: FOTO.miscelatore,
    matricola: 'MX-1043',
    nome: 'Miscelatore M-Tec D30',
    tipo: 'Miscelatore',
    stato: 'in manutenzione',
    reparto: 'Officina',
    ore: 2210,
    ultimoIntervento: new Date(2026, 8, 2),
    prossimaRevisione: new Date(2027, 2, 2),
  },
  {
    id: '3',
    foto: FOTO.pompa,
    matricola: 'MX-1088',
    nome: 'Pompa Putzmeister S5',
    tipo: 'Pompa',
    stato: 'guasto',
    reparto: 'Cantiere Sud',
    ore: 9874,
    ultimoIntervento: new Date(2026, 7, 29),
    prossimaRevisione: new Date(2026, 9, 29),
  },
  {
    id: '4',
    matricola: 'MX-1101',
    nome: 'Compressore Atlas XAS 68',
    tipo: 'Compressore',
    stato: 'in servizio',
    reparto: 'Cantiere Nord',
    ore: 1560,
    ultimoIntervento: new Date(2026, 4, 6),
    prossimaRevisione: new Date(2027, 4, 6),
  },
  {
    id: '5',
    foto: FOTO.silo,
    matricola: 'MX-1120',
    nome: 'Silo pressurizzato 22 t',
    tipo: 'Silo',
    stato: 'in servizio',
    reparto: 'Deposito',
    ore: 312,
    ultimoIntervento: new Date(2026, 2, 18),
    prossimaRevisione: new Date(2027, 2, 18),
  },
  {
    id: '6',
    foto: FOTO.ponteggio,
    matricola: 'MX-1174',
    nome: 'Ponteggio autosollevante',
    tipo: 'Sollevamento',
    stato: 'in manutenzione',
    reparto: 'Cantiere Ovest',
    ore: 730,
    ultimoIntervento: new Date(2026, 8, 11),
    prossimaRevisione: new Date(2026, 10, 11),
  },
  {
    id: '7',
    matricola: 'MX-1190',
    nome: 'Sabbiatrice a ciclo chiuso',
    tipo: 'Sabbiatrice',
    stato: 'dismessa',
    reparto: 'Deposito',
    ore: 15402,
    ultimoIntervento: new Date(2025, 10, 3),
    prossimaRevisione: new Date(2026, 10, 3),
  },
  {
    id: '8',
    foto: FOTO.generatore,
    matricola: 'MX-1204',
    nome: 'Generatore Kohler 60 kVA',
    tipo: 'Generatore',
    stato: 'in servizio',
    reparto: 'Cantiere Sud',
    ore: 6045,
    ultimoIntervento: new Date(2026, 6, 21),
    prossimaRevisione: new Date(2027, 0, 21),
  },
  {
    id: '9',
    matricola: 'MX-1233',
    nome: 'Idropulitrice Kärcher HDS',
    tipo: 'Idropulitrice',
    stato: 'guasto',
    reparto: 'Officina',
    ore: 880,
    ultimoIntervento: new Date(2026, 8, 16),
    prossimaRevisione: new Date(2026, 9, 16),
  },
  {
    id: '10',
    foto: FOTO.betoniera,
    matricola: 'MX-1250',
    nome: 'Betoniera a bicchiere 500 l',
    tipo: 'Betoniera',
    stato: 'in servizio',
    reparto: 'Cantiere Ovest',
    ore: 3390,
    ultimoIntervento: new Date(2026, 3, 30),
    prossimaRevisione: new Date(2027, 3, 30),
  },
  {
    id: '11',
    matricola: 'MX-1266',
    nome: 'Carrello elevatore Linde H25',
    tipo: 'Sollevamento',
    stato: 'in servizio',
    reparto: 'Deposito',
    ore: 5127,
    ultimoIntervento: new Date(2026, 1, 9),
    prossimaRevisione: new Date(2027, 1, 9),
  },
  {
    id: '12',
    foto: FOTO.termocamera,
    matricola: 'MX-1281',
    nome: 'Termocamera FLIR E76',
    tipo: 'Strumento',
    stato: 'in manutenzione',
    reparto: 'Officina',
    ore: 96,
    ultimoIntervento: new Date(2026, 8, 5),
    prossimaRevisione: new Date(2027, 8, 5),
  },
]

/**
 * Dallo stato del dominio al tono semantico, dichiarato **una volta** per
 * tutte e due le facce: se lo scrivessero separate, il giorno che una tinta
 * cambia ne cambierebbe una sola.
 *
 * `dismessa` prende il **neutro** di proposito — è lo stato che non dice
 * niente, e dargli un colore semantico lo farebbe sembrare un esito.
 */
const TONO_STATO: Record<Stato, string> = {
  'in servizio': TONO.success,
  'in manutenzione': TONO.warning,
  guasto: TONO.destructive,
  dismessa: TONO.neutro,
}

const STATI: Stato[] = [
  'in servizio',
  'in manutenzione',
  'guasto',
  'dismessa',
]

const DATA = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

// Le ore passano da `intero` di `lib/numeri`: senza la convenzione Tassullo
// il CLDR italiano lascerebbe `4128` accanto a `15.402` — quattro celle
// della stessa colonna senza punto e una con. `docs/DECISIONI.md` §47.
const ORE = { format: intero }

/* ────────────────────────────────────────────────────────────────────────
 * Le nove colonne — la faccia larga
 * ──────────────────────────────────────────────────────────────────────── */

const col = creaColonne<Macchina>()

/**
 * Nove colonne, e nel DOM saranno **dieci**: `pannelloRiga` antepone da sé la
 * colonna del chevron, che la pagina non scrive.
 *
 * La miniatura è `entity-image`, ed è larga **`w-12`** dentro una colonna
 * `w-16`, tirata a sinistra di `-ml-2`. Due cose diverse, che si spiegano
 * insieme perché nascono dallo stesso `p-2` delle celle.
 *
 * **`-ml-2` annulla il riempimento sinistro della cella**, e serve perché fra
 * il chevron e la miniatura c'erano **32px** di vuoto: 8 di riempimento del
 * bottone, 8 della cella del chevron, 8 di questa, più 8 di scarto. Il
 * chevron non è una colonna che la pagina scrive — la antepone `pannelloRiga`
 * — quindi l'unica leva dal punto di chiamata è questa, e porta il vuoto da
 * 32 a **16px**, misurato dal glifo al bordo della miniatura. Oltre non si va
 * senza uscire dalla cella, che ritaglia: verificato che **0 miniature su 12**
 * escono dalla propria cella.
 *
 * **`w-12` e non `w-16`**: la cella porta `p-2`, quindi di 64px dichiarati ne
 * restano **48** —
 * e una miniatura da 64 veniva **tagliata a destra** dall'`overflow: hidden`
 * del `td`, con tre angoli tondi e un bordo dritto. La miniatura si dimensiona
 * sullo spazio **utile**, non sulla larghezza dichiarata della colonna.
 *
 * I 256px misurati in
 * M4ter.3 sono la larghezza di una **cella di griglia di card**, non di una
 * cella di tabella: la differenza non è una contraddizione, è esattamente la
 * ragione per cui quel componente esiste invece di `ItemMedia variant="image"`
 * — lì il riquadro è fisso a 40/32/24px, qui la larghezza la dà chi compone.
 */
const COLONNE = col.columns([
  col.display({
    id: 'foto',
    meta: { titolo: 'Foto', larghezza: 'w-16' },
    header: () => <span className="sr-only">Foto</span>,
    cell: ({ row }) => (
      <div className="-ml-2 w-12">
        <EntityImage
          src={row.original.foto}
          alt=""
          ratio="1:1"
          adatta="riempi"
          icon={<WrenchIcon className="size-4" aria-hidden="true" />}
        />
      </div>
    ),
    enableHiding: false,
  }),
  col.accessor('matricola', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Matricola" />
    ),
    meta: { titolo: 'Matricola', larghezza: 'w-28' },
    // `alphanumeric` e non `text`: con `text` `MX-9` verrebbe dopo `MX-10`.
    sortFn: 'alphanumeric',
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue<string>()}</span>
    ),
  }),
  col.accessor('nome', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Macchina" />
    ),
    meta: { titolo: 'Macchina', larghezza: 'w-52' },
    sortFn: 'text',
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string>()}</span>
    ),
  }),
  col.accessor('tipo', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Tipo" />,
    meta: { titolo: 'Tipo', larghezza: 'w-28' },
    sortFn: 'text',
  }),
  col.accessor('stato', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Stato" />,
    meta: { titolo: 'Stato', larghezza: 'w-36' },
    sortFn: 'text',
    cell: ({ getValue }) => {
      const stato = getValue<Stato>()
      return <Badge className={TONO_STATO[stato]}>{stato}</Badge>
    },
  }),
  col.accessor('reparto', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Reparto" />
    ),
    meta: { titolo: 'Reparto', larghezza: 'w-28' },
    sortFn: 'text',
  }),
  col.accessor('ore', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Ore" allinea="fine" />
    ),
    meta: { titolo: 'Ore', larghezza: 'w-20' },
    sortFn: 'basic',
    // I numeri in colonna si incolonnano coi decimali: `tabular-nums` ce l'ha
    // già `Table`, per tutta la tabella.
    cell: ({ getValue }) => (
      <div className="text-right">{ORE.format(getValue<number>())}</div>
    ),
    enableGlobalFilter: false,
  }),
  col.accessor('ultimoIntervento', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Ultimo interv." allinea="fine" />
    ),
    meta: { titolo: 'Ultimo intervento', larghezza: 'w-36' },
    sortFn: 'datetime',
    cell: ({ getValue }) => (
      <div className="text-right">{DATA.format(getValue<Date>())}</div>
    ),
    enableGlobalFilter: false,
  }),
  col.accessor('prossimaRevisione', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Prossima rev." allinea="fine" />
    ),
    meta: { titolo: 'Prossima revisione', larghezza: 'w-36' },
    sortFn: 'datetime',
    cell: ({ getValue }) => (
      <div className="text-right">{DATA.format(getValue<Date>())}</div>
    ),
    enableGlobalFilter: false,
  }),
])

/* ────────────────────────────────────────────────────────────────────────
 * Il dettaglio — uno solo, montato da tutte e due le facce
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Scritto **una volta**: sulla faccia larga sta in `pannelloRiga`, su quella
 * stretta dentro il `Collapsible` della scheda. Due copie divergerebbero, e
 * la seconda a divergere sarebbe sempre quella che si guarda di meno.
 */
function DettaglioMacchina({ macchina }: { macchina: Macchina }) {
  const voci: [string, React.ReactNode][] = [
    ['Reparto', macchina.reparto],
    ['Ore di lavoro', `${ORE.format(macchina.ore)} h`],
    ['Ultimo intervento', DATA.format(macchina.ultimoIntervento)],
    ['Prossima revisione', DATA.format(macchina.prossimaRevisione)],
  ]
  return (
    <div className="@container/dettaglio flex flex-col gap-3">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm @md/dettaglio:grid-cols-4">
        {voci.map(([chiave, valore]) => (
          <div key={chiave} className="flex flex-col">
            <dt className="text-xs text-muted-foreground">{chiave}</dt>
            <dd className="font-medium">{valore}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          Apri la scheda
        </Button>
        <Button variant="outline" size="sm">
          Registra un intervento
        </Button>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * Le due facce
 * ──────────────────────────────────────────────────────────────────────── */

type Filtri = {
  cerca: string
  stato: Stato | 'tutti'
  setCerca: (v: string) => void
  setStato: (v: Stato | 'tutti') => void
}

/**
 * **I comandi stanno sulla pagina, non dentro la tabella**, e non è una
 * scelta di gusto: se il filtro vivesse nell'istanza TanStack, la faccia
 * stretta — che una tabella non ce l'ha — dovrebbe scriversene uno suo, e
 * due filtri scritti due volte si disallineano. Così lo stato è **uno**, la
 * funzione che filtra è **una**, e quello che cambia fra le due facce è
 * soltanto la **forma** del comando.
 *
 * `cerca={false}` sulla tabella per la stessa ragione: la sua casella di
 * ricerca è un secondo stato, e due caselle che filtrano la stessa lista
 * sono una promessa che prima o poi non si mantiene.
 */
function ComandiLarghi({ cerca, stato, setCerca, setStato }: Filtri) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="ldf-cerca-largo">Cerca</Label>
        <InputGroup className="w-64">
          <InputGroupAddon>
            <SearchIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            id="ldf-cerca-largo"
            placeholder="Matricola o macchina…"
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
          />
        </InputGroup>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="ldf-stato-largo">Stato</Label>
        {/*
          `items` non è facoltativo: senza, `SelectValue` non sa risalire
          dall'`value` alla scritta e il grilletto mostra il valore grezzo.
          È il rilievo scritto in testa a `Primitive/Select`.
        */}
        <Select
          items={{
            tutti: 'Tutti gli stati',
            'in servizio': 'In servizio',
            'in manutenzione': 'In manutenzione',
            guasto: 'Guasto',
            dismessa: 'Dismessa',
          }}
          value={stato}
          onValueChange={(v) => setStato(v as Stato | 'tutti')}
        >
          <SelectTrigger id="ldf-stato-largo" className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="tutti">Tutti gli stati</SelectItem>
              {STATI.map((s) => (
                <SelectItem key={s} value={s}>
                  {s[0]!.toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Button size="sm" className="ml-auto">
        <PlusIcon aria-hidden="true" />
        Nuova macchina
      </Button>
    </div>
  )
}

/**
 * Gli stessi due comandi, in una forma che col pollice si usa.
 *
 * La tendina diventa una fila di **chip**: `toggle-group` a **scelta
 * singola**, che è il default di Base UI (`toggleMultiple` è falso finché non
 * lo si accende). Non è un badge travestito — `badge` è un'etichetta che *si
 * legge*, `toggle-group` è un filtro che *si clicca*, ed è la trappola del
 * nome scritta nel `CLAUDE.md`. Qui si clicca.
 *
 * E il bottone cambia taglia: `size="sm"` sulla faccia larga sta in una barra
 * di comandi fitta; qui è l'azione principale della schermata e prende la
 * larghezza intera, cioè la taglia di default — che in densità touch fa 48px.
 */
function ComandiStretti({ cerca, stato, setCerca, setStato }: Filtri) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="ldf-cerca-stretto">Cerca</Label>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            id="ldf-cerca-stretto"
            placeholder="Matricola o macchina…"
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
          />
        </InputGroup>
      </div>
      <ToggleGroup
        variant="outline"
        aria-label="Stato"
        value={[stato]}
        /*
         * Base UI restituisce sempre un array, anche a scelta singola. Il
         * ripiego su `tutti` non è cosmesi: senza, ri-cliccare il chip acceso
         * lo spegnerebbe e la lista resterebbe filtrata su niente.
         */
        onValueChange={(valori) =>
          setStato((valori[0] as Stato | undefined) ?? 'tutti')
        }
        className="flex-wrap"
      >
        <ToggleGroupItem value="tutti">Tutti</ToggleGroupItem>
        {STATI.map((s) => (
          <ToggleGroupItem key={s} value={s}>
            {s[0]!.toUpperCase() + s.slice(1)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Button className="w-full">
        <PlusIcon aria-hidden="true" />
        Nuova macchina
      </Button>
    </div>
  )
}

/** La faccia larga: la tabella, col dettaglio nel pannello di riga. */
function FacciaLarga({ dati }: { dati: Macchina[] }) {
  return (
    <DataTable
      colonne={COLONNE}
      dati={dati}
      idRiga={(m) => m.id}
      cerca={false}
      perPagina={25}
      colonneNascondibili
      vuoto={{ titolo: 'Nessuna macchina con questi filtri' }}
      pannelloRiga={(m) => <DettaglioMacchina macchina={m} />}
    />
  )
}

/**
 * La faccia stretta: un elenco di schede.
 *
 * **La miniatura non c'è**, ed è una scelta e non una dimenticanza: a 320px
 * utili una foto da 64px si prende un quinto della riga per dire una cosa che
 * la matricola dice meglio. Quello che resta è ciò che si cerca guardando una
 * lista di macchine — la matricola, il nome, lo stato.
 *
 * Il grilletto è la **scheda intera**, non un chevron: sulla faccia larga il
 * dettaglio si apre dalla colonna che `pannelloRiga` antepone da sé, qui dal
 * bersaglio più grande che ci sia. Il chevron resta come **segno**, non come
 * bersaglio separato — due bersagli concentrici sono il modo di sbagliare
 * mira.
 */
function FacciaStretta({ dati }: { dati: Macchina[] }) {
  if (dati.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Nessuna macchina con questi filtri
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {dati.map((m) => (
        <Collapsible key={m.id}>
          <Card className="gap-0 overflow-hidden py-0">
            <CollapsibleTrigger className="group/riga flex w-full items-center gap-3 p-3 text-left rounded-xl hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset focus-visible:outline-none data-[panel-open]:rounded-b-none">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  {m.matricola}
                </span>
                <span className="font-medium">{m.nome}</span>
                <span className="truncate text-sm text-muted-foreground">
                  {m.tipo} · {m.reparto}
                </span>
              </div>
              <Badge className={cn('shrink-0', TONO_STATO[m.stato])}>
                {m.stato}
              </Badge>
              <ChevronDownIcon
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]/riga:rotate-180"
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t p-3">
                <DettaglioMacchina macchina={m} />
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * La pagina
 * ──────────────────────────────────────────────────────────────────────── */

function filtra(dati: Macchina[], { cerca, stato }: Pick<Filtri, 'cerca' | 'stato'>) {
  const ago = cerca.trim().toLowerCase()
  return dati.filter(
    (m) =>
      (stato === 'tutti' || m.stato === stato) &&
      (ago === '' ||
        m.matricola.toLowerCase().includes(ago) ||
        m.nome.toLowerCase().includes(ago) ||
        m.tipo.toLowerCase().includes(ago))
  )
}

/**
 * `faccia` è una prop **della pagina**, non dell'hook, e la ragione sta nella
 * testata: con `'auto'` la faccia la sceglie `useSoglia`, e le altre due la
 * rendono in modo deterministico perché il gate possa misurarle davvero. È il
 * costo della strada (a) di `docs/DECISIONI.md` §46 — una prop in più qui,
 * invece di un valore iniziale iniettabile nell'hook, che sarebbe rimasto in
 * API per sempre.
 */
function ListaMacchine({
  faccia = 'auto',
  soglia = '(min-width: 1024px)',
}: {
  faccia?: 'auto' | 'tabella' | 'schede'
  soglia?: string
}) {
  const [cerca, setCerca] = React.useState('')
  const [stato, setStato] = React.useState<Stato | 'tutti'>('tutti')

  const largoDavvero = useSoglia(soglia)
  const largo = faccia === 'auto' ? largoDavvero : faccia === 'tabella'

  const dati = filtra(MACCHINE, { cerca, stato })
  const filtri: Filtri = { cerca, stato, setCerca, setStato }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Parco macchine</h1>
        <p className="text-sm text-muted-foreground">
          {dati.length} di {MACCHINE.length} macchine
        </p>
      </div>
      {faccia === 'auto' ? (
        <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
          Soglia dichiarata dalla pagina:{' '}
          <code className="font-mono text-sm text-foreground">{soglia}</code> —
          adesso è <strong>{largoDavvero ? 'vera' : 'falsa'}</strong>, quindi si
          vede la faccia <strong>{largoDavvero ? 'larga' : 'stretta'}</strong>.
        </p>
      ) : null}
      {largo ? <ComandiLarghi {...filtri} /> : <ComandiStretti {...filtri} />}
      {largo ? <FacciaLarga dati={dati} /> : <FacciaStretta dati={dati} />}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * Le tre scene
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * La faccia larga, fissata con `faccia="tabella"`: nove colonne più quella
 * del chevron, la miniatura, la tendina dello stato, il bottone
 * `size="sm"`. Il dettaglio si apre dal chevron in testa alla riga.
 */
export const FacciaLargaScena: Story = {
  name: 'Faccia larga',
  render: () => <ListaMacchine faccia="tabella" />,
}

/**
 * La faccia stretta, fissata con `faccia="schede"`, alla larghezza di un
 * telefono. La tendina dello
 * stato è diventata una fila di chip, la miniatura non c'è, il bottone
 * prende tutta la larghezza, e il dettaglio si apre toccando la scheda.
 */
export const FacciaStrettaScena: Story = {
  name: 'Faccia stretta',
  globals: { viewport: { value: 'telefono', isRotated: false } },
  render: () => <ListaMacchine faccia="schede" />,
}

/**
 * La sola scena che passa davvero da `useSoglia`, con una soglia diversa
 * dal default: `(min-width: 900px)`. Due app possono scegliere due numeri
 * diversi, e ognuna lo dichiara nella sua pagina. Si vede aprendo la scena
 * da sola e stringendo la finestra, o con l'interruttore Viewport: sotto i
 * 900px la tabella lascia il posto alle schede.
 *
 * Con nove colonne alle larghezze dichiarate, la tabella è intera da 1160px
 * di riquadro in su; sotto scorre in orizzontale, e nessuna colonna sparisce.
 */
export const SogliaDellaPagina: Story = {
  name: 'Soglia della pagina',
  render: () => <ListaMacchine soglia="(min-width: 900px)" />,
}
