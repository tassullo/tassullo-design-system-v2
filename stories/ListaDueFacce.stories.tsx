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
 * Una lista a **nove colonne** che su schermo largo è una tabella e su schermo
 * stretto è un elenco di schede. È il bivio che oggi **sei pagine in due app**
 * fanno in due modi diversi, e di cui mancavano due pezzi: il **bivio**, che
 * adesso è `useSoglia`, e la **ricetta**, che è questa pagina.
 *
 * ```tsx
 * const largo = useSoglia('(min-width: 1024px)')
 * return largo ? <FacciaLarga … /> : <FacciaStretta … />
 * ```
 *
 * ## La query la dichiara la pagina, e il registry dà solo il bivio
 *
 * `useSoglia` **non sa cosa sia una lista**: sa solo se una media query è
 * vera. Quante colonne ha *questa* lista lo sa soltanto la pagina che la
 * scrive, e nove colonne stanno strette dove tre stanno larghe — una soglia
 * cotta dentro l'hook sarebbe giusta per una lista e sbagliata per le altre
 * cinque.
 *
 * E la **faccia stretta la scrive la pagina**, non un blocco. Le due facce
 * non sono la stessa lista impaginata due volte: la tendina dello stato
 * diventa una fila di chip, la miniatura sparisce, il bottone cambia taglia.
 * Nessun blocco può indovinarlo dall'elenco delle `colonne` — quello che può
 * fare il registry è dare il bivio e un esemplare da copiare.
 *
 * ## Perché non `useIsMobile`, che pure esiste
 *
 * Due ragioni, entrambe misurate. I 768px di `useIsMobile` governano
 * l'**arredamento** — sidebar e dialogo cambiano allo stesso pixel, ed è una
 * cosa sola; questo bivio è **contenuto**. E `useIsMobile` legge `matchMedia`
 * dentro un `useEffect` che chiama `setState`, quindi **il primo render torna
 * sempre scrivania**: su un dialogo non morde, su una lista sì — sul telefono
 * disegnerebbe la tabella a nove colonne e la sostituirebbe un fotogramma
 * dopo.
 *
 * ## Quello che il gate di questa pagina misura davvero
 *
 * `useSoglia` è una media query **sulla finestra**, e la larghezza della
 * finestra **non si commuta dal canvas**: il global `viewport` di Storybook
 * ridimensiona l'iframe nella cornice del manager, e nel canvas aperto per
 * URL — che è come lo aprono `test:a11y` e `misura:bersagli` —
 * `window.innerWidth` resta quello della finestra vera, senza errore
 * (`docs/DECISIONI.md` §46).
 *
 * Da cui la scelta, presa prima di scrivere una riga e scritta qui perché si
 * possa contestare: **le due facce si rendono in modo deterministico**, con
 * una prop `faccia` della pagina, e **non** passando dall'hook. Il gate vede
 * markup largo vero *e* markup stretto vero, e «0 violazioni» vuol dire
 * quello che dice.
 *
 * **Quale faccia rende ogni scena nel gate, misurato dentro l'imbracatura
 * vitest** (finestra **1440**, letta e non presunta):
 *
 * | scena | `table.table-fixed` | schede | faccia |
 * |---|---|---|---|
 * | Faccia larga | **1** | 0 | larga, per la prop |
 * | Faccia stretta | 0 | **12** | stretta, per la prop |
 * | Soglia della pagina | 1 | 0 | **larga, per l'hook** — 1440 ≥ 900 |
 *
 * La terza riga è l'unica che dipende dalla finestra, e **va rimisurata ogni
 * volta che la soglia cambia**. Provato in questa stessa sessione: portando
 * la soglia a 1536 quella scena è passata alla faccia stretta, e il gate ha
 * continuato a dire «1416 scansioni, 0 violazioni» senza segnalare niente.
 * È §46 applicata alla story che la cita.
 *
 * L'alternativa era dare a `useSoglia` un valore iniziale iniettabile e
 * forzarlo dalla story. È stata scartata: sarebbe API pubblica aggiunta per
 * comodità di prova, cioè il genere di cosa che poi resta — e una prop in
 * più in una story costa meno di una prop in più in un hook che ogni app
 * copia.
 *
 * **E non si ottiene stringendo il riquadro.** `data-table.stories.tsx` fa
 * così per la sua scena a 320px, e lì è giusto, perché quel caso stretto è
 * una conseguenza del CSS. Una media query sulla finestra non si sposta
 * stringendo un contenitore: sono due meccanismi con la stessa faccia.
 *
 * ## Due cose da sapere guardandola
 *
 * **La soglia la sceglie l'app, e non si deriva da quante colonne ha la
 * tabella.** Qui il default è **1024**, che è la soglia di Officina
 * (`useDesktop()`); Studio RadarOpere usa **900**. Se la tabella non ci sta
 * nello spazio che ha, la risposta non è alzare la soglia — è **scorrere**,
 * con `bloccaPrimaColonna` che tiene ferme le colonne d'identità. Il
 * ragionamento per esteso, e l'errore in cui si cade derivando la soglia
 * dalla tabella, stanno sulla scena `Soglia della pagina`.
 *
 * **Le foto sono la libreria d'esempio del repo**, cioè i render dei sistemi
 * Tassullo: non sono foto di macchine. Servono a far vedere `entity-image`
 * con e senza sorgente — due righe su dodici portano il segnaposto — e
 * `alt=""` dice che nella tabella sono decorative, perché la riga il suo nome
 * ce l'ha già scritto accanto.
 *
 * ## Un attrito, detto prima e non scoperto dopo
 *
 * **Il dettaglio si apre da un posto diverso sulle due facce.** In Officina si
 * clicca la foto della macchina; `data-table` con `pannelloRiga` antepone da
 * sé una colonna col chevron (`data-table.tsx:3157`) e non si sostituisce.
 * Sulla faccia stretta la miniatura non c'è affatto, e il grilletto è la
 * **scheda intera** — che è anche il bersaglio più grande possibile, cioè la
 * cosa giusta col pollice. Adattamento accettabile: la stessa azione, due
 * gesti che stanno ognuno a casa propria.
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

const FOTO = {
  cappotto: '/esempi/sistema-cappotto.png',
  radiante: '/esempi/sistema-radiante.png',
  risanamento: '/esempi/sistema-risanamento.png',
  crm: '/esempi/sistema-crm.png',
  ripristino: '/esempi/sistema-ripristino-storico.png',
  seta: '/esempi/sistema-effetto-seta.png',
}

const MACCHINE: Macchina[] = [
  {
    id: '1',
    foto: FOTO.cappotto,
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
    foto: FOTO.radiante,
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
    foto: FOTO.risanamento,
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
    foto: FOTO.crm,
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
    foto: FOTO.ripristino,
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
    foto: FOTO.seta,
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
    foto: FOTO.cappotto,
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
    foto: FOTO.radiante,
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

const ORE = new Intl.NumberFormat('it-IT')

/* ────────────────────────────────────────────────────────────────────────
 * Le nove colonne — la faccia larga
 * ──────────────────────────────────────────────────────────────────────── */

const col = creaColonne<Macchina>()

/**
 * Nove colonne, e nel DOM saranno **dieci**: `pannelloRiga` antepone da sé la
 * colonna del chevron, che la pagina non scrive.
 *
 * La miniatura è `entity-image`, ed è larga **`w-16`**. I 256px misurati in
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
      <div className="w-16">
        <EntityImage
          src={row.original.foto}
          alt=""
          ratio="1:1"
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
      <span className="font-mono text-sm">{getValue<string>()}</span>
    ),
  }),
  col.accessor('nome', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Macchina" />
    ),
    meta: { titolo: 'Macchina' },
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
      bloccaPrimaColonna
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
            <CollapsibleTrigger className="group/riga flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-mono text-xs text-muted-foreground">
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
 * **La faccia larga**, resa in modo deterministico: nove colonne più quella
 * del chevron, la miniatura, la tendina dello stato, il bottone `size="sm"`.
 *
 * Il dettaglio si apre dal chevron in testa alla riga — la colonna che
 * `pannelloRiga` antepone da sé.
 */
export const FacciaLargaScena: Story = {
  name: 'Faccia larga',
  render: () => <ListaMacchine faccia="tabella" />,
}

/**
 * **La faccia stretta**, resa in modo deterministico dentro un riquadro da
 * 360px — la larghezza utile di uno schermo da 375px meno il padding di
 * pagina.
 *
 * Il riquadro serve a **guardarla**; a renderla è la prop `faccia`, non la
 * sua larghezza. È la distinzione di §46: una media query sulla finestra non
 * si sposta stringendo un contenitore, e una scena che ci contasse
 * renderebbe la faccia larga mentre il gate conta «0 violazioni».
 *
 * Quello che cambia rispetto alla larga, e che nessun blocco poteva
 * indovinare dalle `colonne`: la tendina è diventata una fila di chip, la
 * miniatura non c'è, il bottone ha preso la larghezza intera e la taglia di
 * default, e il dettaglio si apre toccando la scheda.
 */
export const FacciaStrettaScena: Story = {
  name: 'Faccia stretta',
  render: () => (
    <div className="flex flex-col gap-2 p-4">
      <p className="text-sm text-muted-foreground">
        Riquadro da 360px. La faccia la decide la prop, non la larghezza del
        riquadro: <code className="font-mono text-sm">useSoglia</code> guarda la{' '}
        <strong>finestra</strong>.
      </p>
      <div className="w-90 rounded-lg border border-dashed">
        <ListaMacchine faccia="schede" />
      </div>
    </div>
  ),
}

/**
 * **La soglia la dichiara la pagina**, ed è l'unica delle tre scene che passa
 * davvero da `useSoglia`.
 *
 * Qui la soglia è **`(min-width: 900px)`**, e la scena esiste per far vedere
 * che è **un numero diverso** da quello che usano le due scene di sopra: il
 * default della pagina è 1024, questa lo cambia.
 *
 * ## Da dove vengono i numeri: dalle app, non dalla tabella
 *
 * **1024 è la soglia di Officina** (`useDesktop()`, cinque pagine — Triage,
 * Piani, Procedure, Ricambi, Admin); **900 è quella di Studio RadarOpere**
 * (`@media 900px`). Sono i due numeri che esistono già in produzione, e
 * `useSoglia` serve a smettere di riscriverli a mano, non a sostituirli.
 *
 * **La soglia non si deriva dal fabbisogno della tabella.** Misurando quanto
 * spazio vogliono nove colonne si arriva a 1280; contando anche i 256px della
 * colonna del guscio si arriva a 1536, cioè **più della risoluzione di un
 * portatile da 13"** — una tabella che su quelle macchine non comparirebbe
 * mai. Il ragionamento è sbagliato alla radice: la soglia dice **quando
 * l'interfaccia cambia grammatica**, ed è una scelta ergonomica dell'app.
 * `docs/ANALISI-COPERTURA-APP.md` §6.3 la chiude così — «la soglia si decide
 * app per app, non si forza» — e §11 aggiunge che la guida deve dire **come
 * si sceglie**, non quale numero usare.
 *
 * ## E la tabella che non ci sta? Scorre
 *
 * È la risposta che c'era già, e non costa nessuna soglia. `data-table` sta
 * dentro un `overflow-x-auto`, e **`bloccaPrimaColonna`** tiene ferme a
 * sinistra le colonne che dicono *di che cosa* è la riga — così a due terzi
 * di tabella fuori dallo schermo non si legge una data senza sapere di quale
 * macchina sia. È quello che fa `dashboard-01` di shadcn, ed è già la scena
 * `Blocchi/Data Table → Stretta`.
 *
 * Le misure della tabella restano utili, ma come **fatto sulla tabella**, non
 * come soglia — lette dal DOM a pagina ferma, con ogni colonna stretta alla
 * misura che il contenuto chiede:
 *
 * | riquadro per la lista | cosa succede |
 * |---|---|
 * | **≥ 1146px** | tutte e nove intere, niente troncato |
 * | 966–1145px | la colonna elastica (`Macchina`) **tronca con l'ellissi** |
 * | **< 966px** | la tabella **scorre**, con le prime colonne ferme |
 *
 * Tradotto in finestra, col guscio aperto (256px di colonna + 34 di padding e
 * bordi): **1436px** per averla intera, **1256px** prima che scorra. Cioè su
 * un portatile da **1440 la tabella è intera**. Col guscio collassato
 * bastano 1228 e 1048 — ed è la leva che ha in mano chi guarda: su un 1366 la
 * colonna `Macchina` tronca, e collassando la sidebar torna intera.
 *
 * **Una sonda sbagliata, corretta**: il primo conto dei troncamenti confrontava
 * `scrollWidth` con `clientWidth`, e su una cella con `text-overflow: ellipsis`
 * quei due valori **coincidono** — dava 0 troncamenti su una tabella in cui si
 * leggeva «Intonacat…» a occhio nudo. Il conto giusto misura il **testo**, con
 * un `Range` sul contenuto della cella.
 *
 * **Cosa rende questa scena nel gate**, misurato: la finestra è a 1440 e la
 * soglia è 900, quindi la media query è vera e si vede la **faccia larga** —
 * 1 tabella, 0 schede. Dichiarato, non nascosto: `test:a11y` e
 * `misura:bersagli` aprono il canvas per URL, dove il global `viewport` non
 * cambia `window.innerWidth` (§46). La faccia stretta la misura la scena qui
 * sopra, che non dipende dalla finestra.
 */
export const SogliaDellaPagina: Story = {
  name: 'Soglia della pagina',
  render: () => <ListaMacchine soglia="(min-width: 900px)" />,
}
