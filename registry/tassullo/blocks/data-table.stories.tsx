import type { Meta, StoryObj } from '@storybook/react-vite'
import type { RowData } from '@tanstack/react-table'
import {
  CheckIcon,
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
  CopyIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react'
import * as React from 'react'

import { apriCol, apriColDestro } from '@/prove/apri'
import {
  CellaAlbero,
  DataTable,
  IntestazioneColonna,
  IntestazioneColonnaMenu,
  RowMenuItem,
  RowMenuSeparator,
  creaColonne,
  useDataTableRow,
  type IstanzaTabella,
  type MetaColonna,
} from '@/registry/tassullo/blocks/data-table'
import { FiltroData } from '@/registry/tassullo/blocks/data-table-filtro-data'
import { FiltroIntervallo } from '@/registry/tassullo/blocks/data-table-filtro-intervallo'
import { FiltroResetTutti } from '@/registry/tassullo/blocks/data-table-filtro-reset'
import { FiltroSfaccettato } from '@/registry/tassullo/blocks/data-table-filtro-sfaccettato'
import { decimale, valuta } from '@/registry/tassullo/lib/numeri'
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
import { Input } from '@/registry/tassullo/ui/input'

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
      <span className="text-sm">{getValue<string>()}</span>
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
    cell: ({ getValue }) => <span className="text-sm">{getValue<string>()}</span>,
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
 * Il blocco per un elenco di record da leggere, cercare e scegliere: ricerca,
 * ordinamento, paginazione, selezione, colonne nascondibili e i due stati
 * vuoti, in una dichiarazione sola.
 *
 * **Quando sì, quando no.** È la forma di ogni elenco dell'applicativo: una
 * pagina lista, un elenco di appoggio dentro una scheda. Per poche righe fisse
 * da leggere e basta, serve la primitiva `table`. Per modificare i valori
 * cella per cella, come in un foglio di calcolo, si usa `tassullo-data-grid`,
 * che è costruito su questo blocco. Per un foglio a gruppi — una voce con le
 * sue misure e il totale sotto, come un computo — si usa
 * `tassullo-foglio-gruppi`: qui l'albero mette il subtotale sulla riga madre,
 * sopra i figli, e la tastiera si muove per righe. Una pagina lista intera,
 * con testata e stati di caricamento, è `tassullo-pagina-lista`, che monta già
 * questo blocco.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-data-table
 * ```
 *
 * I filtri per colonna sono quattro item a parte, da installare quando
 * servono, con lo stesso comando e il loro nome:
 *
 * - `tassullo-data-table-filtro-sfaccettato`, la scelta fra i valori di una
 *   colonna, con il numero di righe accanto a ogni valore;
 * - `tassullo-data-table-filtro-intervallo`, un intervallo numerico;
 * - `tassullo-data-table-filtro-data`, un intervallo di date;
 * - `tassullo-data-table-filtro-reset`, il bottone che li azzera tutti e
 *   sparisce quando non c'è niente da azzerare. Non tocca la ricerca né
 *   l'ordinamento.
 *
 * **Le colonne.** Si scrivono con TanStack Table v9, e la documentazione che
 * serve è la sua: `creaColonne<T>()` è il suo `createColumnHelper`, già
 * tipizzato sulle caratteristiche del blocco. Il blocco legge in più, dal
 * campo `meta` di ogni colonna: `titolo`, il nome usato dal menu «Colonne»;
 * `larghezza`, una utility Tailwind come `w-28`; `sottototale`, `piede` e
 * `azioniProprie`, descritti sotto. Una colonna va lasciata senza larghezza:
 * è quella che prende lo spazio che avanza. L'intestazione ordinabile è
 * `IntestazioneColonna`, con `allinea="fine"` sulle colonne di numeri.
 * `sortFn` dice come si ordina: `alphanumeric` per i codici, perché `IN-9`
 * venga prima di `IN-10`; `text`; `basic` per i numeri; `datetime` per le
 * date. Una colonna che la ricerca non deve guardare dichiara
 * `enableGlobalFilter: false`.
 *
 * ```tsx
 * const col = creaColonne<Prodotto>()
 * const COLONNE = col.columns([
 *   col.accessor('codice', {
 *     header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Codice" />,
 *     meta: { titolo: 'Codice', larghezza: 'w-32' },
 *     sortFn: 'alphanumeric',
 *   }),
 * ])
 *
 * <DataTable colonne={COLONNE} dati={prodotti} cerca="Cerca un prodotto…" selezione />
 * ```
 *
 * **Le prop.**
 *
 * - Il contorno: `cerca`, il segnaposto della ricerca, o `false` per
 *   toglierla; `colonneNascondibili`, il menu «Colonne», acceso di serie;
 *   `selezione`, la colonna delle caselle; `barra`, una riga sotto la ricerca
 *   per filtri e azioni di massa; `nomeRighe`, il nome delle righe nel
 *   conteggio in fondo (`{ singolare: 'prodotto', plurale: 'prodotti' }`).
 * - Gli stati vuoti sono due. `vuoto` — titolo, descrizione, azione — è ciò
 *   che si vede quando `dati` è vuoto. Quando invece la ricerca o un filtro
 *   non trovano niente, il blocco dice «Nessun risultato» e offre da sé il
 *   bottone «Togli i filtri».
 * - La paginazione: `perPagina` vale 10, 25 (il predefinito), 50, 100,
 *   `"infinito"` o `"virtuale"`. `piePagina={false}` toglie la fascia di
 *   paginazione, per le tabelle di appoggio dentro un'altra pagina.
 * - Il riquadro: `altezza`, `"naturale"` o `"ferma"`, sotto.
 * - Le colonne: `bloccaPrimaColonna`, `ridimensionabile`, `colonneBloccabili`,
 *   `colonneRiordinabili`, `bordiColonna`.
 * - Le righe: `idRiga`, `getSottoRighe`, `pannelloRiga`, `menuRiga`,
 *   `riordinabile`, `chiaveMemoRiga`, `piede`.
 * - `onTabellaPronta` consegna l'istanza di TanStack, per un comando che il
 *   blocco non traduce in una prop: `toggleAllRowsExpanded()`, per esempio.
 *
 * ## `altezza="ferma"`: il riquadro che si ferma su un confine di riga
 *
 * Con `altezza="naturale"`, il predefinito, il riquadro è alto quanto le sue
 * righe e a scorrere è la pagina: è la forma giusta per una tabella che sta in
 * una scheda, fra altre sezioni. Con `altezza="ferma"` il riquadro prende lo
 * spazio che il genitore gli concede, si ferma sul bordo dell'ultima riga che
 * ci sta intera, e le righe scorrono al suo interno sotto un'intestazione
 * ferma. Il piè — il conteggio e la paginazione — resta sempre in vista. Con
 * poche righe il riquadro si restringe fino al contenuto.
 *
 * È la forma di ogni pagina che **è** la lista, qualunque sia la paginazione:
 *
 * - con `perPagina="infinito"` non ci sono pagine, e si carica altro
 *   scorrendo: senza un riquadro fermo non ci sarebbe niente da far scorrere;
 * - con una `perPagina` numerica, senza il riquadro fermo il piè esce dalla
 *   vista appena le righe superano l'altezza dello schermo;
 * - con `perPagina="virtuale"`, senza un tetto non c'è una finestra di righe
 *   da calcolare.
 *
 * Il genitore deve avere un'altezza vera: il blocco riceve
 * `className="min-h-0 flex-1"` dentro un contenitore `flex flex-col` alto
 * quanto la pagina, cioè dentro `<AppShell contenuto="riempie">`. Il blocco
 * `tassullo-pagina-lista` è già composto così.
 *
 * **Il tetto si misura fra le righe, mai contro il contenitore.** Il blocco
 * prende la cima della prima riga resa come zero e somma le distanze fra le
 * righe, fino all'ultima che entra. Chi scrive una misura simile per un altro
 * riquadro fa lo stesso. `getBoundingClientRect` restituisce coordinate della
 * finestra, e quindi porta dentro lo scorrimento: a contenitore scorso le
 * righe in cima hanno un fondo negativo, l'ultima cade proprio sull'altezza
 * del momento, e il tetto si riscrive uguale a sé stesso. La misura fra le
 * righe vale anche in virtualizzazione, dove lo scorrimento arriva a centinaia
 * di migliaia di pixel e le righe rese sono solo quelle in vista.
 *
 * **Come si riconosce il difetto.** Quando la misura è presa contro il
 * contenitore, il riquadro sa rimpicciolirsi e non sa più ricrescere: è un
 * cricchetto, e una schermata sola non lo mostra. Lo si riproduce con una
 * sequenza: si filtra fino a una **manciata** di righe, poi si toglie il
 * filtro. Il riquadro resta basso come per quelle poche righe, mentre il
 * conteggio in fondo dice che le righe sono tornate tutte. Filtrare fino a
 * una riga sola non basta: con una riga il contenitore non può scorrere, e il
 * difetto non si vede. Riguarda tutte e tre le paginazioni, ovunque un filtro
 * o la ricerca possano far scendere le righe sotto l'altezza del riquadro.
 *
 * ## La testata a menu, come alternativa
 *
 * La testata normale è `IntestazioneColonna`: il titolo è il bottone che
 * ordina, un clic e basta. Quando le colonne sono bloccabili, però, ogni
 * testata porta la freccia dell'ordinamento **e** la puntina del blocco: due
 * bersagli per colonna. `IntestazioneColonnaMenu` li raccoglie in un solo
 * grilletto «⋮», con un menu che ha «Ordina» sopra e «Blocca» sotto. È
 * un'alternativa da scegliere colonna per colonna, non il predefinito.
 *
 * La colonna che la usa dichiara anche `meta.azioniProprie: true`. Senza,
 * `colonneBloccabili` aggiunge comunque la propria puntina, e i grilletti per
 * bloccare la colonna tornano due.
 *
 * ```tsx
 * col.accessor('nome', {
 *   header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Nome" />,
 *   meta: { titolo: 'Nome', azioniProprie: true },
 * })
 * ```
 *
 * Il grilletto si vede al passaggio del puntatore e quando riceve il fuoco, e
 * resta in vista quando la colonna è ordinata o bloccata: se uno stato c'è, il
 * modo di toglierlo non si deve cercare.
 *
 * ## Regole d'uso
 *
 * - I numeri si allineano a destra — `allinea="fine"` sull'intestazione,
 *   `text-right` sulla cella — e si formattano con le funzioni dell'item
 *   `numeri`, `intero()`, `decimale()` e `valuta()`, che scrivono sempre il
 *   separatore delle migliaia. Le cifre tabellari, `tabular-nums`, le dà già
 *   la tabella. Un codice o un anno non si formattano.
 * - I codici si scrivono nel carattere e nel colore del testo, come il resto
 *   della riga; uno stato è un `badge` coi toni dell'item `toni`.
 * - Se la riga apre una pagina, il collegamento sta su una colonna sola — il
 *   codice o il nome, lo sceglie la pagina — scritto come `Button`
 *   `variant="link"` col `render` del collegamento (`<a>` o il `Link` del
 *   router).
 * - La selezione esce dalla tabella solo attraverso `barra` nella forma a
 *   funzione, `(scelti, tabella) => …`, che riceve le righe scelte e l'istanza
 *   della tabella. Non c'è una `onSelezione`, e non si ricostruisce con un
 *   effetto.
 * - I filtri stanno in `barra`, nella forma a funzione, e leggono `tabella`
 *   dal secondo argomento, non da `onTabellaPronta`. Ogni colonna filtrata
 *   dichiara il suo `filterFn`: `arrHas` per il filtro sfaccettato,
 *   `inNumberRange` per l'intervallo, `inDateRange` per le date.
 * - `perPagina="infinito"` mostra a passi un elenco che è già tutto in
 *   `dati`, e non chiede altro al server mentre si scorre. Per un elenco che
 *   il server consegna a pagine serve un'altra forma.
 * - `riordinabile` spegne ordinamento, ricerca e filtri e mette tutte le
 *   righe su una pagina, perché il trascinamento conta le posizioni visibili;
 *   vuole `idRiga`. `colonneRiordinabili` invece non spegne niente.
 * - `colonneBloccabili` blocca qualunque colonna, a sinistra o a destra, e
 *   prende il posto di `bloccaPrimaColonna` se si passano insieme. Con
 *   `ridimensionabile` o `colonneBloccabili` la larghezza di partenza sta in
 *   `size`, `minSize` e `maxSize` sulla colonna, non in `meta.larghezza`. Le
 *   larghezze scelte da chi usa la tabella sono in pixel: non seguono la
 *   densità e non restano da un caricamento all'altro.
 * - `getSottoRighe` apre l'albero: la colonna che identifica la riga usa
 *   `CellaAlbero` per il rientro e la freccia, e `meta.sottototale` scrive il
 *   conto sulla riga madre. `pannelloRiga` apre invece, sotto la riga, un
 *   dettaglio con contenuto libero; per una riga senza dettaglio restituisce
 *   `null`.
 * - `piede` accende una riga di totali dentro la tabella. Ogni colonna scrive
 *   la sua cella in `meta.piede`, che riceve le righe che filtri e ricerca
 *   lasciano passare, non quelle della pagina: il totale cambia col filtro e
 *   con la ricerca, non con l'ordinamento né con la pagina, e l'etichetta lo
 *   deve dire. `piede` non è `piePagina`, che è la fascia di paginazione.
 * - `menuRiga` scrive le voci una volta sola — `RowMenuItem`,
 *   `RowMenuSeparator`, `RowMenuSub`, con la riga letta da
 *   `useDataTableRow()` — e le monta sia nel menu «⋯» in coda alla riga sia
 *   sul tasto destro. `enabledFor` esclude una riga da tutti e due.
 * - L'editing in riga lo scrive la pagina: le colonne rendono un campo sulla
 *   riga in modifica, e `chiaveMemoRiga` dice al blocco quale riga
 *   ricalcolare mentre si scrive.
 * - Con `perPagina="virtuale"` non si compongono `pannelloRiga` e
 *   `chiaveMemoRiga`, e il menu di riga resta solo nel «⋯», senza tasto
 *   destro.
 * - `bordiColonna` accende le linee verticali fra le colonne, per una tabella
 *   che si legge per colonne: un computo, un listino.
 *
 * ## Tastiera e accessibilità
 *
 * L'intestazione ordinabile è un bottone: `Tab` la raggiunge, e `Invio` passa
 * da crescente a decrescente a nessun ordine. Il `<th>` dichiara `aria-sort`.
 * Caselle, menu e filtri si raggiungono col `Tab`, e i menu si chiudono con
 * `Esc`. Le maniglie di ridimensionamento non sono fermi di `Tab`: si
 * trascinano col puntatore, e da tastiera `Alt` con `←` o `→` sul bottone
 * dell'intestazione restringe o allarga la colonna di 16px. Sulle maniglie
 * di riordino, di righe e di colonne, `Spazio`
 * afferra, le frecce spostano, `Spazio` rilascia ed `Esc` annulla. In
 * virtualizzazione le righe ricevono il fuoco: frecce su e giù, `Home` e
 * `Fine` al principio e alla fine dell'elenco intero, `Pagina su` e
 * `Pagina giù` di una finestra; la riga a fuoco si monta da sé se non è in
 * vista. Il tasto destro non è mai l'unica via: le stesse voci stanno nel
 * menu «⋯».
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
 * La forma completa: 500 prodotti, ricerca, selezione, prima colonna bloccata,
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
 * La stessa tabella in un riquadro da 320px, la larghezza utile di un
 * telefono. La tabella scorre in orizzontale, e la casella e il codice restano
 * fermi a sinistra (`bloccaPrimaColonna`): si legge sempre di quale prodotto è
 * una riga.
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
 * Il menu di una riga, aperto: una colonna `display` scritta dalla pagina con
 * un `dropdown-menu`. L'azione distruttiva usa `variant="destructive"`.
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
 * Il menu «Colonne», aperto: mostra e nasconde le colonne col nome che
 * dichiarano in `meta.titolo`.
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
 * Colonne ridimensionabili: il filo sul bordo destro di ogni intestazione si
 * trascina, o si comanda con `Alt`+`←`/`→` dall'intestazione. «Famiglia»
 * non dichiara `size` e prende lo spazio che resta.
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
 * Colonne riordinabili insieme al ridimensionamento: la maniglia ⠿ a sinistra
 * del titolo sposta la colonna, il filo sul bordo la allarga. Ordinamento e
 * ricerca restano attivi.
 */
export const RiordinoColonne: StoryObj<typeof DataTable<Prodotto>> = {
  name: 'Riordino Colonne',
  args: {
    colonne: COLONNE_RIDIMENSIONABILI,
    dati: PRODOTTI.slice(0, 15),
    cerca: false,
    colonneNascondibili: false,
    perPagina: 10,
    ridimensionabile: true,
    colonneRiordinabili: true,
  },
}

/**
 * Il menu del blocco, aperto: ogni intestazione ha una puntina che blocca la
 * colonna a sinistra o a destra.
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

/* ────────────────────────────────────────────────────────────────────────
 * Un solo menu per ordinamento e pin (niko-table, "Column Pinning Table")
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * **Confermata da Francesco (2026-09-17)** dopo il confronto a occhio con
 * `Ridimensionabile`/`ColonneBloccabili`: due bottoni sempre visibili accanto
 * al nome colonna (il titolo che ordina, l'icona che blocca) erano rumore.
 * Il riferimento è
 * [niko-table, "Column Pinning Table"](https://niko-table.com/examples/column-pinning-table/):
 * lì il titolo torna testo semplice e un solo grilletto «⋮» — visibile
 * al passaggio del mouse o quando la colonna è già ordinata/bloccata,
 * altrimenti spento — apre un menu con **entrambe** le famiglie di azioni,
 * "Ordina" sopra e "Blocca" sotto.
 *
 * **Da M4ter.14 la forma sta nel blocco**, esportata come
 * `IntestazioneColonnaMenu`: era ricostruita a mano qui, in `Pagine/Prodotti`
 * e in `Pagine/Lista` — tre copie della stessa forma da tenere allineate. Non
 * è però diventata il **default** di `IntestazioneColonna`, che resta la
 * testata normale: questa si sceglie colonna per colonna, insieme a
 * `meta.azioniProprie`.
 */

const colMenuAzioni = creaColonne<Prodotto>()
const COLONNE_MENU_AZIONI = colMenuAzioni.columns([
  colMenuAzioni.accessor('codice', {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Codice" />,
    // `azioniProprie`: l'header sopra porta già il pin nel proprio menu —
    // senza, `colonneBloccabili` (sotto) aggiungerebbe anche il suo, due
    // grilletti di pin per la stessa colonna (rilievo di Francesco).
    meta: { titolo: 'Codice', azioniProprie: true },
    sortFn: 'alphanumeric',
    size: 140,
    minSize: 90,
    cell: ({ getValue }) => <span className="text-sm">{getValue<string>()}</span>,
  }),
  colMenuAzioni.accessor('nome', {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Nome" />,
    meta: { titolo: 'Nome', azioniProprie: true },
    sortFn: 'text',
    size: 220,
    minSize: 120,
    cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
  }),
  colMenuAzioni.accessor('famiglia', {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Famiglia" />,
    meta: { titolo: 'Famiglia', azioniProprie: true },
    sortFn: 'text',
  }),
  colMenuAzioni.accessor('stato', {
    header: ({ column }) => <IntestazioneColonnaMenu colonna={column} titolo="Stato" />,
    meta: { titolo: 'Stato', azioniProprie: true },
    sortFn: 'text',
    size: 130,
    minSize: 90,
    cell: ({ getValue }) => {
      const stato = getValue<Prodotto['stato']>()
      return <Badge className={TONO_STATO[stato]}>{stato}</Badge>
    },
  }),
])

/**
 * La testata a menu: un grilletto «⋮» per colonna, con «Ordina» e «Blocca»
 * nello stesso menu, al posto della freccia e della puntina di
 * `Colonne Bloccabili`.
 */
export const MenuColonna: Story = {
  name: 'Menu Colonna',
  args: {
    colonne: COLONNE_MENU_AZIONI,
    dati: PRODOTTI.slice(0, 15),
    cerca: false,
    colonneNascondibili: false,
    perPagina: 10,
    colonneBloccabili: true,
  },
  play: apriCol('[data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

/**
 * La tabella senza dati: `vuoto` dà il titolo, la descrizione e il bottone
 * che crea il primo record.
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
 * Sei righe, senza ricerca e senza menu «Colonne»: la forma di un elenco corto
 * dentro una scheda. Il contorno si toglie una prop alla volta.
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
 * Le azioni di massa in `barra`: il bottone compare quando si sceglie almeno
 * una riga, e riceve le righe scelte.
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

/*
 * I numeri di queste story passano da **`lib/numeri`** (`decimale`, `valuta`)
 * e non da una `Intl.NumberFormat` dichiarata qui. Il motivo sta per esteso
 * in quel file: `Intl.NumberFormat('it-IT')` da solo rende `2086,93` e non
 * `2.086,93`, perché il CLDR italiano raggruppa solo da cinque cifre in su —
 * un separatore *intermittente*, che in colonna è il caso peggiore.
 * `docs/DECISIONI.md` §47.
 */

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
          {decimale(figli.reduce((tot, f) => tot + (f.quantita ?? 0), 0))}
        </div>
      ),
    },
    sortFn: 'basic',
    cell: ({ getValue }) => {
      const v = getValue<number | undefined>()
      return <div className="text-right">{v === undefined ? null : decimale(v)}</div>
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
          {valuta(figli.reduce((tot, f) => tot + (f.importo ?? 0), 0))}
        </div>
      ),
    },
    sortFn: 'basic',
    cell: ({ getValue }) => {
      const v = getValue<number | undefined>()
      return <div className="text-right">{v === undefined ? null : valuta(v)}</div>
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
/**
 * **Espandi tutto/Comprimi tutto**, sopra la tabella — porting da "Grouping
 * Table" di niko-table. Comanda `table.toggleAllRowsExpanded()`, un metodo
 * che l'istanza TanStack ha già da sé: non serve un prop nuovo su
 * `DataTable` per uno stato che il blocco continua a tenere per conto
 * suo, solo `onTabellaPronta` per arrivarci da fuori (v. il commento su
 * quel prop in `data-table.tsx`). Nessuno stato locale a questo
 * componente: i bottoni comandano l'istanza direttamente, `DataTable` si
 * ri-rende da sé quando lo stato di espansione cambia, come già fa per
 * ogni `chevron` cliccato a mano.
 */
function BottoniEspansione<TDato extends RowData>({
  tabellaRef,
}: {
  tabellaRef: React.RefObject<IstanzaTabella<TDato> | null>
}) {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => tabellaRef.current?.toggleAllRowsExpanded(true)}
      >
        <ChevronsUpDownIcon aria-hidden />
        Espandi tutto
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => tabellaRef.current?.toggleAllRowsExpanded(false)}
      >
        <ChevronsDownUpIcon aria-hidden />
        Comprimi tutto
      </Button>
    </div>
  )
}

function AlberoConControlli() {
  const tabellaRef = React.useRef<IstanzaTabella<RigaComputo> | null>(null)
  return (
    <div className="flex flex-col gap-3">
      <BottoniEspansione tabellaRef={tabellaRef} />
      <DataTable
        colonne={COLONNE_ALBERO}
        dati={COMPUTO}
        cerca={false}
        selezione
        colonneNascondibili={false}
        getSottoRighe={(riga) => ('figli' in riga ? riga.figli : undefined)}
        nomeRighe={{ singolare: 'voce', plurale: 'voci' }}
        vuoto={{ titolo: 'Nessuna voce nel computo' }}
        onTabellaPronta={(t) => {
          tabellaRef.current = t
        }}
      />
    </div>
  )
}

/**
 * Righe annidate con subtotale: un computo in cui ogni voce porta le sue
 * misurazioni. La casella di una voce sceglie anche le misurazioni sotto;
 * «Espandi tutto» e «Comprimi tutto» comandano la tabella attraverso
 * `onTabellaPronta`.
 */
export const Albero: StoryObj<typeof DataTable<RigaComputo>> = {
  render: () => <AlberoConControlli />,
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
function EspansioneConControlli() {
  const tabellaRef = React.useRef<IstanzaTabella<Prodotto> | null>(null)
  return (
    <div className="flex flex-col gap-3">
      <BottoniEspansione tabellaRef={tabellaRef} />
      <DataTable
        colonne={COLONNE.filter((c) => c.id !== 'azioni')}
        dati={PRODOTTI.slice(0, 10)}
        cerca={false}
        colonneNascondibili={false}
        perPagina={10}
        pannelloRiga={(prodotto: Prodotto) =>
          prodotto.stato === 'archiviato' ? null : (
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 py-1 text-sm">
              <dt className="text-muted-foreground">Famiglia</dt>
              <dd>{prodotto.famiglia}</dd>
              <dt className="text-muted-foreground">Stato</dt>
              <dd>{prodotto.stato}</dd>
              <dt className="text-muted-foreground">Ultimo aggiornamento</dt>
              <dd>{DATA.format(prodotto.aggiornato)}</dd>
            </dl>
          )
        }
        onTabellaPronta={(t) => {
          tabellaRef.current = t
        }}
      />
    </div>
  )
}

/**
 * Il dettaglio sotto la riga, aperto dalla freccia. I prodotti archiviati non
 * hanno dettaglio, e la loro riga resta senza freccia.
 */
export const Espansione: StoryObj<typeof DataTable<Prodotto>> = {
  render: () => <EspansioneConControlli />,
}

/* ────────────────────────────────────────────────────────────────────────
 * La virtualizzazione (M3bis.4) — `perPagina="virtuale"`
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * **10.000 prodotti finti, e mai più di una trentina di `<tr>` nel DOM.**
 * Non è la stessa mole di `Prodotti` (500) caricata in un colpo: è la prova
 * che serve, perché a 500 righe una tabella non virtualizzata già scorre
 * senza intoppi — il vantaggio si vede solo dove smette di reggere, ed è lì
 * che questa story si mette apposta.
 *
 * Riquadro a `h-140` (altezza fissa, la stessa forma di `altezza="ferma"`
 * ovunque nel registry): senza un tetto non c&apos;è una finestra da
 * calcolare, ed è la stessa ragione per cui `perPagina="infinito"` lo vuole.
 * Più alto di un `h-96`: con la sola barra di ricerca e il conto sopra e
 * sotto, un riquadro troppo basso lascerebbe vedere talmente poche righe da
 * non dimostrare niente — lo scorrimento va visto scorrere.
 *
 * **Da tastiera**: `Tab` porta il fuoco sulla prima riga, poi frecce
 * su/giù muovono di una riga, `Home`/`End` saltano a inizio/fine
 * dell&apos;elenco — 10.000 righe di distanza, non solo quelle già montate —
 * e `Pagina Su`/`Pagina Giù` di una finestra intera. La riga a fuoco si
 * **monta da sé** se non lo è già: è il difetto noto di ogni tabella
 * virtualizzata (il fuoco resta su un nodo smontato) e la ragione per cui
 * questa story esiste, non decorazione.
 */
const PRODOTTI_VIRTUALIZZAZIONE = generaProdotti(10000)

/**
 * Diecimila prodotti in un riquadro fermo, con nel DOM solo le righe in vista.
 * Col fuoco su una riga, `Fine` porta all'ultima dell'elenco.
 */
export const Virtualizzata: StoryObj<typeof DataTable<Prodotto>> = {
  args: {
    colonne: COLONNE.filter((c) => c.id !== 'azioni'),
    dati: PRODOTTI_VIRTUALIZZAZIONE,
    cerca: 'Cerca per codice, nome o famiglia…',
    selezione: true,
    perPagina: 'virtuale',
    altezza: 'ferma',
    nomeRighe: { singolare: 'prodotto', plurale: 'prodotti' },
  },
  render: (args) => (
    <div className="flex h-140 flex-col">
      <DataTable {...args} className="min-h-0 flex-1" />
    </div>
  ),
}

/* ────────────────────────────────────────────────────────────────────────
 * I filtri (M3bis.6) — sfaccettato, intervallo numerico, intervallo di
 * date, reset di tutti insieme.
 *
 * Colonne a parte (`colFiltri`/`COLONNE_FILTRI`), come già `COLONNE_
 * RIDIMENSIONABILI`/`COLONNE_ALBERO` sopra: aggiungere `filterFn` a
 * `COLONNE` metterebbe i controlli di filtro in **ogni** story di questo
 * file, comprese quelle che non li devono avere. Nessun campo nuovo sui
 * prodotti finti: `revisione` (già numerico) e `aggiornato` (già data)
 * bastano a dimostrare `FiltroIntervallo`/`FiltroData` senza aggiungere un
 * `prezzo` che le altre 20 story di questo file non userebbero mai.
 * ──────────────────────────────────────────────────────────────────────── */

const colFiltri = creaColonne<Prodotto>()
const COLONNE_FILTRI = colFiltri.columns([
  colFiltri.accessor('nome', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Nome" />,
    meta: { titolo: 'Nome' },
    sortFn: 'text',
  }),
  colFiltri.accessor('famiglia', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Famiglia" />,
    meta: { titolo: 'Famiglia' },
    sortFn: 'text',
    // Un valore per riga: `arrHas` tiene la riga il cui valore compare fra
    // quelli scelti. Vedi la nota su `caratteristiche` in `data-table.tsx`.
    filterFn: 'arrHas',
  }),
  colFiltri.accessor('stato', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Stato" />,
    meta: { titolo: 'Stato', larghezza: 'w-32' },
    sortFn: 'text',
    filterFn: 'arrHas',
    cell: ({ getValue }) => {
      const stato = getValue<Prodotto['stato']>()
      return <Badge className={TONO_STATO[stato]}>{stato}</Badge>
    },
  }),
  colFiltri.accessor('revisione', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Rev." allinea="fine" />
    ),
    meta: { titolo: 'Revisione', larghezza: 'w-20' },
    sortFn: 'basic',
    filterFn: 'inNumberRange',
    cell: ({ getValue }) => <div className="text-right">{getValue<number>()}</div>,
    enableGlobalFilter: false,
  }),
  colFiltri.accessor('aggiornato', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Aggiornato" allinea="fine" />
    ),
    meta: { titolo: 'Aggiornato', larghezza: 'w-32' },
    sortFn: 'datetime',
    filterFn: 'inDateRange',
    cell: ({ getValue }) => <div className="text-right">{DATA.format(getValue<Date>())}</div>,
    enableGlobalFilter: false,
  }),
])

/**
 * `barra` nella forma a funzione riceve **anche l'istanza TanStack** come
 * secondo argomento: è la stessa della passata di render in corso, non una
 * di un render indietro come consegnerebbe `tabellaRef`/`onTabellaPronta`
 * (misurato scrivendo questa story: `<FiltroResetTutti>` composto con
 * quella coppia restava invisibile finché non arrivava un'interazione
 * qualunque successiva). `tabellaRef` resta solo per l'unico uso legittimo
 * rimasto — impostare il filtro iniziale una volta sola, in un effetto a
 * parte — non per il render dei filtri stessi. V. il commento su `barra`
 * in `data-table.tsx`.
 */
function TabellaConFiltri({
  statoIniziale,
  dateIniziali,
}: {
  statoIniziale?: string[]
  dateIniziali?: [number, number]
}) {
  const tabellaRef = React.useRef<IstanzaTabella<Prodotto> | null>(null)

  React.useEffect(() => {
    if (statoIniziale) tabellaRef.current?.getColumn('stato')?.setFilterValue(statoIniziale)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statoIniziale?.join('|')])

  React.useEffect(() => {
    if (dateIniziali) tabellaRef.current?.getColumn('aggiornato')?.setFilterValue(dateIniziali)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateIniziali?.join('|')])

  return (
    <DataTable
      colonne={COLONNE_FILTRI}
      dati={PRODOTTI}
      cerca="Cerca per nome o famiglia…"
      colonneNascondibili={false}
      nomeRighe={{ singolare: 'prodotto', plurale: 'prodotti' }}
      barra={(_scelti, tabella) => {
        tabellaRef.current = tabella
        return (
          <>
            <FiltroSfaccettato tabella={tabella} accessore="stato" titolo="Stato" />
            <FiltroSfaccettato tabella={tabella} accessore="famiglia" titolo="Famiglia" />
            <FiltroIntervallo tabella={tabella} accessore="revisione" titolo="Revisione" />
            <FiltroData tabella={tabella} accessore="aggiornato" titolo="Aggiornato" />
            <FiltroResetTutti tabella={tabella} />
          </>
        )
      }}
    />
  )
}

/**
 * I quattro filtri sulla stessa barra — Stato e Famiglia a scelta, Revisione a
 * intervallo, Aggiornato per date — più il bottone che li azzera. Il primo
 * filtro è aperto.
 */
export const Filtri: StoryObj<typeof DataTable<Prodotto>> = {
  play: apriCol('[data-slot="popover-trigger"]', 'popover-content'),
  render: () => <TabellaConFiltri />,
}

/**
 * Con «Bozza» già scelto: il grilletto mostra il valore scelto, le opzioni di
 * Famiglia restano tutte, e il bottone che azzera i filtri è in vista.
 */
export const FiltriConFiltroAttivo: StoryObj<typeof DataTable<Prodotto>> = {
  name: 'Filtri Con Filtro Attivo',
  play: apriCol('[data-slot="popover-trigger"]', 'popover-content'),
  render: () => <TabellaConFiltri statoIniziale={['bozza']} />,
}

// Il quarto grilletto della barra è quello del filtro per date: la scena
// apre il suo riquadro, col filtro già impostato, perché il gate misuri anche
// «Cancella» attivo e non solo il primo filtro.
/**
 * Il filtro per date già impostato, col riquadro aperto: il calendario
 * dell'intervallo e, in fondo, «Cancella», la via da tastiera per togliere il
 * filtro. La X sul grilletto fa lo stesso col mouse.
 */
export const FiltroDataAttivo: StoryObj<typeof DataTable<Prodotto>> = {
  name: 'Filtro Data Attivo',
  play: apriCol(':nth-child(4 of [data-slot="popover-trigger"])', 'popover-content'),
  render: () => (
    <TabellaConFiltri dateIniziali={[new Date(2025, 0, 1).getTime(), new Date(2026, 11, 31).getTime()]} />
  ),
}

/* ────────────────────────────────────────────────────────────────────────
 * Il riordino manuale (M3bis.7) — `riordinabile`, porting di "Row DnD Table"
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Colonne a parte, come già `COLONNE_RIDIMENSIONABILI`/`COLONNE_ALBERO`
 * sopra: una colonna **Ordine** in più, che non serve alle altre story.
 * Non è un dato di `Prodotto` — è la posizione, `row.index + 1` nel modello
 * di riga già in vista — perché è esattamente quello che la pagina reale
 * mostra: `Caratteristiche` di Anagrafe (`anagrafe.tassullo.it/caratteristiche`)
 * tiene un campo **Ordine** per riga, oggi scritto a mano in un modulo di
 * modifica riga per riga; il riordino a trascinamento lo sostituisce, e
 * questa colonna prova che il numero segue davvero la riga mentre si sposta,
 * non solo che le righe cambiano posto. `row.index` e non un contatore a
 * parte: con `riordinabile` la paginazione è già tutta su una pagina sola
 * (v. il prop), quindi l'indice del modello di riga **è** la posizione vera.
 */
const COLONNE_RIORDINO = col.columns([
  col.display({
    id: 'ordine',
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Ordine" allinea="fine" />,
    meta: { titolo: 'Ordine', larghezza: 'w-16' },
    cell: ({ row }) => (
      <div className="text-right tabular-nums text-muted-foreground">{row.index + 1}</div>
    ),
  }),
  ...COLONNE.filter((c) => c.id !== 'azioni'),
])

/**
 * `dati` resta della story, come ovunque: `riordinabile.onRiordina` consegna
 * il nuovo ordine intero, `<DataTable>` non lo tiene per sé. Otto righe, non
 * cinquecento: il riordino si prova a occhio, e cinquecento renderebbero la
 * riga trascinata invisibile fuori dallo schermo prima di poterla vedere
 * muoversi.
 */
function RiordinoConControlli() {
  const [prodotti, setProdotti] = React.useState(() => PRODOTTI.slice(0, 8))
  return (
    <DataTable
      colonne={COLONNE_RIORDINO}
      dati={prodotti}
      idRiga={(p) => p.id}
      riordinabile={{ onRiordina: setProdotti }}
      piePagina={false}
    />
  )
}

/**
 * Righe riordinabili: la maniglia ⠿ sposta la riga, e la colonna «Ordine» si
 * rinumera. Ricerca e ordinamento sono spenti.
 */
export const Riordino: StoryObj<typeof DataTable<Prodotto>> = {
  render: () => <RiordinoConControlli />,
}

/* ────────────────────────────────────────────────────────────────────────
 * Il menu di riga condiviso (M3bis.9) — `menuRiga`, porting
 * "Row Context Menu Table"
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Le stesse colonne di `COLONNE`, meno la colonna `azioni` scritta a mano
 * con un `DropdownMenu` diretto (v. `MenuDiRiga` sopra): `menuRiga` (sotto)
 * aggiunge la propria tendina «⋯» da sé, in coda.
 */
const COLONNE_MENU_RIGA = COLONNE.filter((c) => c.id !== 'azioni')

/**
 * Il componente di azioni-riga — **una sola definizione**, montata sia
 * nella tendina «⋯» sia nel tasto destro sull'intera riga: legge la riga
 * corrente con `useDataTableRow<Prodotto>()`, non da una prop che il
 * chiamante dovrebbe passare due volte. Le tre voci sono identiche a quelle
 * che la colonna `azioni` di `COLONNE` scrive a mano sopra — stesso elenco,
 * stavolta scritto una volta sola.
 */
function MenuAzioniProdotto() {
  const prodotto = useDataTableRow<Prodotto>()
  return (
    <>
      <RowMenuItem onClick={() => console.info(`Modifica ${prodotto.codice}`)}>
        <PencilIcon aria-hidden />
        Modifica
      </RowMenuItem>
      <RowMenuItem onClick={() => console.info(`Duplica ${prodotto.codice}`)}>
        <CopyIcon aria-hidden />
        Duplica
      </RowMenuItem>
      <RowMenuSeparator />
      {/* `variant="destructive"`, non una classe di colore: stessa regola
          della colonna `azioni` sopra (v. `CLAUDE.md`, le due trappole). */}
      <RowMenuItem
        variant="destructive"
        onClick={() => console.info(`Elimina ${prodotto.codice}`)}
      >
        <Trash2Icon aria-hidden />
        Elimina
      </RowMenuItem>
    </>
  )
}

/**
 * Una riga **archiviata** (`enabledFor`) prova l'esclusione: né la tendina
 * né il tasto destro compaiono su di lei, le altre restano intatte. Otto
 * righe come `Riordino`: bastano a provare a occhio due righe abilitate più
 * quella esclusa, senza il rumore di cinquecento.
 */
function MenuRigaCondivisoConControlli() {
  const [prodotti] = React.useState(() =>
    PRODOTTI.slice(0, 8).map((p, indice) =>
      indice === 2 ? { ...p, stato: 'archiviato' as const } : p
    )
  )
  return (
    <DataTable
      colonne={COLONNE_MENU_RIGA}
      dati={prodotti}
      idRiga={(p) => p.id}
      menuRiga={{
        menu: <MenuAzioniProdotto />,
        enabledFor: (p) => p.stato !== 'archiviato',
        ariaLabel: (p) => `Azioni su ${p.nome}`,
      }}
      piePagina={false}
    />
  )
}

/**
 * Il menu di riga, aperto col tasto destro: sono le stesse voci del menu «⋯».
 * La terza riga, archiviata, non ha né l'uno né l'altro.
 */
export const MenuRigaCondiviso: StoryObj<typeof DataTable<Prodotto>> = {
  name: 'Menu Riga Condiviso',
  // Il tasto destro, non la tendina: quest'ultima è già misurata aperta
  // dalle story sopra (`Ridimensionabile`/`ColonneBloccate`/`Albero`), qui
  // manca ancora una misura del popup nuovo.
  play: apriColDestro('[data-slot="context-menu-trigger"]', 'context-menu-content'),
  render: () => <MenuRigaCondivisoConControlli />,
}

/* ────────────────────────────────────────────────────────────────────────
 * Editing in-riga leggero (M3bis.10) — `chiaveMemoRiga`, porting
 * "Inline Edit Table"
 * ──────────────────────────────────────────────────────────────────────── */

type BozzaProdotto = { nome: string; revisione: string }
type ErroriProdotto = { nome?: string; revisione?: string }

/**
 * Tutto lo stato di editing **fuori da `dati`** (v. il prop `chiaveMemoRiga`
 * di `<DataTable>`, in `data-table.tsx`): `editingId`/`bozza`/`errori` sono
 * `useState` separati, mai un `isEditing` scritto dentro la riga — quello
 * sostituirebbe l'array `prodotti` a ogni tasto, e ricalcolerebbe ogni riga
 * memoizzata. `prodotti` si aggiorna una sola volta, dentro `salva()`.
 */
function useEditingInRiga(setProdotti: React.Dispatch<React.SetStateAction<Prodotto[]>>) {
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [bozza, setBozza] = React.useState<BozzaProdotto>({ nome: '', revisione: '' })
  const [errori, setErrori] = React.useState<ErroriProdotto>({})

  const iniziaModifica = React.useCallback((prodotto: Prodotto) => {
    setEditingId(prodotto.id)
    setBozza({ nome: prodotto.nome, revisione: String(prodotto.revisione) })
    setErrori({})
  }, [])

  const annulla = React.useCallback(() => {
    setEditingId(null)
    setBozza({ nome: '', revisione: '' })
    setErrori({})
  }, [])

  const impostaCampo = React.useCallback((campo: keyof BozzaProdotto, valore: string) => {
    setBozza((precedente) => ({ ...precedente, [campo]: valore }))
    setErrori((precedente) => ({ ...precedente, [campo]: undefined }))
  }, [])

  const salva = React.useCallback(() => {
    const prossimi: ErroriProdotto = {}
    if (!bozza.nome.trim()) prossimi.nome = 'Il nome è obbligatorio'
    const revisione = Number.parseInt(bozza.revisione, 10)
    if (!Number.isFinite(revisione) || revisione <= 0) prossimi.revisione = 'Numero positivo'
    if (Object.keys(prossimi).length > 0) {
      setErrori(prossimi)
      return
    }
    setProdotti((precedenti) =>
      precedenti.map((p) =>
        p.id === editingId ? { ...p, nome: bozza.nome.trim(), revisione } : p
      )
    )
    annulla()
  }, [bozza, editingId, annulla, setProdotti])

  /**
   * `""` per ogni riga che non è quella in modifica — nessun cambio, nessun
   * render — e per la riga in modifica una stringa che porta bozza ed
   * errori insieme. Ogni tasto cambia `bozza.nome` → nuova stringa →
   * `RigaTabellaCorpo` (in `data-table.tsx`) ricalcola **solo questa riga**,
   * mai le altre.
   */
  const chiaveMemoRiga = React.useCallback(
    (prodotto: Prodotto): string => {
      if (prodotto.id !== editingId) return ''
      return `${bozza.nome}|${bozza.revisione}|${errori.nome ?? ''}|${errori.revisione ?? ''}`
    },
    [editingId, bozza, errori]
  )

  return { editingId, bozza, errori, iniziaModifica, annulla, impostaCampo, salva, chiaveMemoRiga }
}

type StatoEditingInRiga = ReturnType<typeof useEditingInRiga>

/**
 * Il campo `nome`: un `Input` sulla riga in modifica, il testo altrimenti.
 * `Invio` salva, `Esc` annulla — le due scorciatoie dell'esempio originale.
 */
function CampoNomeProdotto({
  prodotto,
  editing,
}: {
  prodotto: Prodotto
  editing: StatoEditingInRiga
}) {
  if (prodotto.id !== editing.editingId) {
    return <span className="font-medium">{prodotto.nome}</span>
  }
  const idErrore = `errore-nome-${prodotto.id}`
  return (
    <div className="flex flex-col gap-1">
      <Input
        aria-label={`Nome di ${prodotto.nome}`}
        // `-my-1`, come i bottoni-icona di `RowMenuItem`/`colonnaAzioniRiga`
        // nelle altre celle di questo blocco (v. `-my-1 ml-auto flex` sulla
        // colonna `azioni` più sotto): senza, l'`Input` di default (`h-8`,
        // 32px in densità normale) è più alto della riga a riposo — righe
        // che cambiano altezza quando una si mette in modifica, mentre la
        // riga deve restare della stessa altezza in entrambi gli stati.
        className="-my-1"
        value={editing.bozza.nome}
        onChange={(evento) => editing.impostaCampo('nome', evento.target.value)}
        aria-invalid={!!editing.errori.nome}
        aria-describedby={editing.errori.nome ? idErrore : undefined}
        autoFocus
        onKeyDown={(evento) => {
          if (evento.key === 'Enter') editing.salva()
          if (evento.key === 'Escape') editing.annulla()
        }}
      />
      {editing.errori.nome ? (
        <p id={idErrore} className="text-xs text-destructive-subtle-foreground">
          {editing.errori.nome}
        </p>
      ) : null}
    </div>
  )
}

/** Lo stesso principio per `revisione`, l'unico campo numerico dell'esempio. */
function CampoRevisioneProdotto({
  prodotto,
  editing,
}: {
  prodotto: Prodotto
  editing: StatoEditingInRiga
}) {
  if (prodotto.id !== editing.editingId) {
    return <div className="text-right">{prodotto.revisione}</div>
  }
  const idErrore = `errore-revisione-${prodotto.id}`
  return (
    <div className="flex flex-col gap-1">
      <Input
        aria-label={`Revisione di ${prodotto.nome}`}
        type="number"
        min={1}
        value={editing.bozza.revisione}
        onChange={(evento) => editing.impostaCampo('revisione', evento.target.value)}
        aria-invalid={!!editing.errori.revisione}
        aria-describedby={editing.errori.revisione ? idErrore : undefined}
        // `-my-1`: stessa ragione del campo `Nome`, sopra.
        className="-my-1 text-right"
        onKeyDown={(evento) => {
          if (evento.key === 'Enter') editing.salva()
          if (evento.key === 'Escape') editing.annulla()
        }}
      />
      {editing.errori.revisione ? (
        <p id={idErrore} className="text-xs text-destructive-subtle-foreground">
          {editing.errori.revisione}
        </p>
      ) : null}
    </div>
  )
}

/**
 * La colonna «Render»: non è un dato del prodotto, è lo strumento della
 * story — un contatore per riga, incrementato **solo quando la cella si
 * ricalcola davvero**, che rende visibile a occhio ciò che `chiaveMemoRiga`
 * promette a parole (lo stesso principio del contatore di render che
 * "Inline Edit Table" usa nella propria dimostrazione). `contatori` vive in
 * un `useRef`, mai in uno stato — uno stato in più romperebbe da sé la
 * memoizzazione che si sta misurando.
 */
function useContatoreRenderRighe() {
  const contatori = React.useRef(new Map<string, number>())
  return React.useCallback((id: string) => {
    const prossimo = (contatori.current.get(id) ?? 0) + 1
    contatori.current.set(id, prossimo)
    return prossimo
  }, [])
}

const colEditing = creaColonne<Prodotto>()

/**
 * Le colonne si ricostruiscono a ogni cambio dello stato di editing — le
 * chiusure di `cell` devono vedere la bozza e gli errori aggiornati, non
 * quelli del render in cui la colonna fu creata (lo stesso motivo per cui
 * l'esempio originale ricostruisce le proprie `columns` in un `useMemo` che
 * dipende da `editingId`/`draft`/`errors`).
 */
function costruisciColonneEditing(
  editing: StatoEditingInRiga,
  contaRender: (id: string) => number
) {
  return colEditing.columns([
    colEditing.accessor('codice', {
      header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Codice" />,
      meta: { titolo: 'Codice', larghezza: 'w-28' },
      sortFn: 'alphanumeric',
      cell: ({ getValue }) => <span className="text-sm">{getValue<string>()}</span>,
    }),
    colEditing.accessor('nome', {
      header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Nome" />,
      meta: { titolo: 'Nome', larghezza: 'w-52' },
      sortFn: 'text',
      cell: ({ row }) => <CampoNomeProdotto prodotto={row.original} editing={editing} />,
    }),
    colEditing.accessor('famiglia', {
      header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Famiglia" />,
      meta: { titolo: 'Famiglia' },
      sortFn: 'text',
    }),
    colEditing.accessor('revisione', {
      header: ({ column }) => (
        <IntestazioneColonna colonna={column} titolo="Rev." allinea="fine" />
      ),
      meta: { titolo: 'Revisione', larghezza: 'w-24' },
      sortFn: 'basic',
      cell: ({ row }) => <CampoRevisioneProdotto prodotto={row.original} editing={editing} />,
      enableGlobalFilter: false,
    }),
    colEditing.display({
      id: 'render',
      meta: { titolo: 'Render', larghezza: 'w-20' },
      header: () => <span className="text-xs text-muted-foreground">Render</span>,
      cell: ({ row }) => (
        <Badge variant="outline" className="tabular-nums">
          {contaRender(row.original.id)}
        </Badge>
      ),
      enableHiding: false,
      enableGlobalFilter: false,
    }),
    colEditing.display({
      id: 'azioni',
      // `w-24`, non `w-16` come la colonna `azioni` di `COLONNE`: lì c'è un
      // solo bottone, qui in modifica ce ne sono **due** affiancati (Salva
      // e Annulla) — con `w-16` la croce usciva dalla cella e `truncate`
      // (regola del blocco, v. `DataTableBody`) la tagliava a metà.
      meta: { larghezza: 'w-24' },
      header: () => <span className="sr-only">Azioni</span>,
      cell: ({ row }) => {
        const prodotto = row.original
        if (prodotto.id === editing.editingId) {
          return (
            <div className="-my-1 ml-auto flex w-fit gap-1">
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Salva ${prodotto.nome}`}
                onClick={editing.salva}
              >
                <CheckIcon aria-hidden className="text-success-subtle-foreground" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Annulla la modifica"
                onClick={editing.annulla}
              >
                <XIcon aria-hidden className="text-destructive-subtle-foreground" />
              </Button>
            </div>
          )
        }
        return (
          // `-my-1 ml-auto flex`, non un `<Button>` nudo: senza, il bottone
          // resta allineato a sinistra nella cella e scivola a sinistra
          // rispetto alla coppia Salva/Annulla non appena la colonna è più
          // larga del bottone stesso — stesso principio della colonna
          // `azioni` di `COLONNE`, sopra.
          <Button
            size="icon"
            variant="ghost"
            className="-my-1 ml-auto flex"
            aria-label={`Modifica ${prodotto.nome}`}
            onClick={() => editing.iniziaModifica(prodotto)}
          >
            <PencilIcon aria-hidden />
          </Button>
        )
      },
      enableHiding: false,
    }),
  ])
}

/**
 * Otto righe, non cinquecento: la colonna «Render» si legge a occhio solo
 * su un elenco corto, e il caso reale (`pagina-lista`) non è mai la stessa
 * tabella da 500 righe di `Prodotti` sopra.
 */
function EditingInRigaConControlli() {
  const [prodotti, setProdotti] = React.useState(() => PRODOTTI.slice(0, 8))
  const editing = useEditingInRiga(setProdotti)
  const contaRender = useContatoreRenderRighe()
  const colonne = React.useMemo(
    () => costruisciColonneEditing(editing, contaRender),
    // `contaRender` è stabile (`useCallback` senza dipendenze, v. sopra):
    // non serve nell'elenco, e includerlo forzerebbe una ricostruzione delle
    // colonne a ogni render invece che a ogni cambio di editing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editing.editingId, editing.bozza, editing.errori]
  )
  return (
    <DataTable
      colonne={colonne}
      dati={prodotti}
      idRiga={(p) => p.id}
      chiaveMemoRiga={editing.chiaveMemoRiga}
      piePagina={false}
    />
  )
}

/**
 * L'editing in riga: la matita apre i campi, `Invio` salva, `Esc` annulla, e
 * un valore non valido mostra l'errore senza chiudere il campo. La colonna
 * «Render» conta i ricalcoli di ogni riga: scrivendo, sale solo su quella in
 * modifica.
 */
export const EditingInRiga: StoryObj<typeof DataTable<Prodotto>> = {
  name: 'Editing In Riga',
  render: () => <EditingInRigaConControlli />,
}

/* ────────────────────────────────────────────────────────────────────────
 * Il piede (M4ter.8) — `piede` più `meta.piede` su ogni colonna
 *
 * Dati a parte, e per una ragione che non è simmetria con le altre sezioni:
 * un totale vuole numeri che abbiano un senso sommati. Sui prodotti finti
 * l'unico campo numerico è `revisione`, e «somma delle revisioni» è un
 * numero che non vuol dire niente — un piede che mostra un numero senza
 * senso non dimostra che il piede funziona, dimostra che si può scrivere.
 * Qui le righe sono le **misurazioni** del computo, cioè le foglie
 * dell'albero di `Albero` appiattite: quantità e importo si sommano davvero,
 * ed è il caso vero del Computo di Studio.
 * ──────────────────────────────────────────────────────────────────────── */

type MisurazioneComputo = {
  id: string
  voce: string
  ambiente: string
  udm: string
  quantita: number
  importo: number
}

/** Le foglie di `COMPUTO`, con la voce di capitolato riportata su ogni riga. */
const MISURAZIONI: MisurazioneComputo[] = COMPUTO.flatMap((voce) =>
  voce.figli.map((figlio) => ({
    id: figlio.id,
    voce: voce.voce.split(' — ')[0],
    ambiente: figlio.voce,
    udm: figlio.udm,
    quantita: figlio.quantita,
    importo: figlio.importo,
  }))
)

const somma = (righe: MisurazioneComputo[], campo: 'quantita' | 'importo') =>
  righe.reduce((totale, riga) => totale + riga[campo], 0)

const colPiede = creaColonne<MisurazioneComputo>()

const COLONNE_PIEDE = colPiede.columns([
  colPiede.accessor('voce', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Voce" />,
    meta: {
      titolo: 'Voce',
      larghezza: 'w-24',
      // La cella che dice **cos'è** il piede. Senza, la riga in fondo è una
      // fila di numeri e chi la guarda deve indovinare di cosa siano il
      // totale: `piede` somma le righe che il filtro lascia passare, e
      // l'unico posto dove dirlo è qui.
      piede: (righe) => `Totale — ${righe.length} misurazioni filtrate`,
    } satisfies MetaColonna<MisurazioneComputo>,
    sortFn: 'alphanumeric',
    cell: ({ getValue }) => <span className="text-sm">{getValue<string>()}</span>,
  }),
  colPiede.accessor('ambiente', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Ambiente" />,
    meta: { titolo: 'Ambiente' },
    sortFn: 'text',
  }),
  colPiede.accessor('udm', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="U.M." />,
    meta: { titolo: 'U.M.', larghezza: 'w-16' },
    enableGlobalFilter: false,
  }),
  colPiede.accessor('quantita', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Quantità" allinea="fine" />
    ),
    meta: {
      titolo: 'Quantità',
      larghezza: 'w-28',
      // `text-right` come la cella normale: una colonna di numeri allineata
      // a destra con il totale allineato a sinistra è il modo più semplice
      // di rendere illeggibile un incolonnamento che il tema dà già fatto
      // (`tabular-nums` su `<table>`, v. `ui/table.tsx`).
      piede: (righe) => (
        <div className="text-right font-semibold" data-prova="piede-quantita">
          {decimale(somma(righe, 'quantita'))}
        </div>
      ),
    } satisfies MetaColonna<MisurazioneComputo>,
    sortFn: 'basic',
    cell: ({ getValue }) => (
      <div className="text-right">{decimale(getValue<number>())}</div>
    ),
    enableGlobalFilter: false,
  }),
  colPiede.accessor('importo', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Importo" allinea="fine" />
    ),
    meta: {
      titolo: 'Importo',
      larghezza: 'w-32',
      piede: (righe) => (
        <div className="text-right font-semibold" data-prova="piede-importo">
          {valuta(somma(righe, 'importo'))}
        </div>
      ),
    } satisfies MetaColonna<MisurazioneComputo>,
    sortFn: 'basic',
    cell: ({ getValue }) => (
      <div className="text-right">{valuta(getValue<number>())}</div>
    ),
    enableGlobalFilter: false,
  }),
])

/**
 * **Il totale in coda, e segue il filtro.** `piede` accende un `<tfoot>`
 * dentro la tabella; ogni colonna dichiara la sua cella in `meta.piede`, come
 * dichiara il suo titolo in `meta.titolo`. Le colonne che non la dichiarano
 * restano vuote.
 *
 * Da provare col dito: si scriva `03.05` nella ricerca — le righe si
 * riducono, e **i due totali in fondo scendono con loro**. Un totale che
 * restasse fermo mentre la tabella si accorcia sarebbe il numero di
 * qualcos&apos;altro.
 *
 * ## Somma le righe filtrate, non la pagina
 *
 * E la differenza va scelta sapendo perché. Un totale che cambia voltando
 * pagina non è un totale che qualcuno possa usare: si leggerebbe un numero in
 * fondo alla pagina 1 e un altro in fondo alla 2, e nessuno dei due sarebbe
 * quello che si cercava. Con `perPagina="virtuale"` o `"infinito"`, poi, una
 * pagina non esiste proprio. Quindi: **tutte le righe filtrate**, che è anche
 * l&apos;unica lettura che risponde alla domanda vera — quanto fa quello che
 * sto guardando. Cambia col filtro e con la ricerca, non con
 * l&apos;ordinamento né con la pagina.
 *
 * ## L&apos;etichetta si stende, e non è un vezzo
 *
 * «Totale — 15 misurazioni filtrate» sta nella colonna **Voce**, che è larga
 * 96px: con `table-fixed` e `truncate` si leggerebbe «Totale — 1…», e nessun
 * gate lo vedrebbe — il conto delle celle torna, axe tace, la stringa nel DOM
 * è intera. Preso guardando la pagina. Perciò **una cella del piede si prende
 * lo spazio delle colonne che seguono e che una cella non ce l&apos;hanno**,
 * fino alla prossima che ce l&apos;ha: qui l&apos;etichetta copre Voce,
 * Ambiente e U.M. (520px), e i due numeri restano sotto la loro colonna. Se
 * ogni colonna dichiara la sua, non si fonde niente.
 *
 * L&apos;eccezione è una colonna **bloccata**, che non assorbe le vicine — lo
 * scarto dal bordo di una cella sticky è calcolato sulla sua larghezza, e
 * fusa descriverebbe una cella che non esiste più. Con `bloccaPrimaColonna`
 * l&apos;etichetta va quindi messa su una colonna che bloccata non è.
 *
 * ## `piede` non è `piePagina`
 *
 * I due nomi si somigliano e non hanno altro in comune. `piePagina` è la
 * **fascia di paginazione** sotto il riquadro — conteggio, avanti/indietro,
 * righe per pagina — e non si allinea a niente. `piede` è una **riga della
 * tabella**: dentro `<table>`, sulle stesse colonne, con le stesse larghezze
 * e lo stesso ordine, compreso quello che `colonneBloccabili` rimescola.
 *
 * ## Perché un `<tfoot>` e non una fascia sotto il riquadro
 *
 * Perché fuori dalla `<table>` le colonne non ci sono più, e un totale che
 * non sta sotto la colonna che somma è testo libero. Il `<tfoot>` sta però
 * **dentro** ciò che scorre (`table-container`), quindi porta `sticky
 * bottom-0`: su `altezza="ferma"` o `perPagina="virtuale"` il totale resta in
 * vista mentre le righe gli passano sotto — lo stesso che la testata fa in
 * cima, dal verso opposto. Su `altezza="naturale"` lo sticky è inerte per
 * definizione, perché non c&apos;è scarto da compensare.
 */
/**
 * `bordiColonna`: le linee verticali fra le colonne, per una tabella che si
 * legge per colonne.
 */
export const BordiColonna: StoryObj<typeof DataTable<MisurazioneComputo>> = {
  name: 'Bordi Colonna',
  render: () => (
    <DataTable
      colonne={COLONNE_PIEDE}
      dati={MISURAZIONI}
      cerca={false}
      piede
      bordiColonna
      colonneNascondibili={false}
      nomeRighe={{ singolare: 'misurazione', plurale: 'misurazioni' }}
    />
  ),
}

/**
 * Il totale in coda: scrivendo `03.05` nella ricerca le righe si riducono, e i
 * due totali scendono con loro.
 */
export const ConPiede: StoryObj<typeof DataTable<MisurazioneComputo>> = {
  name: 'Con Piede',
  render: () => (
    <DataTable
      colonne={COLONNE_PIEDE}
      dati={MISURAZIONI}
      cerca="Cerca per voce o ambiente…"
      piede
      colonneNascondibili={false}
      nomeRighe={{ singolare: 'misurazione', plurale: 'misurazioni' }}
    />
  ),
}

/**
 * **Lo stesso piede sull&apos;altro corpo.** `perPagina="virtuale"` scambia
 * `DataTableBody` con `DataTableVirtualizedBody`, ma il `<Table>` è **uno
 * solo** e il `<tfoot>` è scritto dopo il corpo, una volta: vale per tutti e
 * due senza sapere quale dei due si è montato.
 *
 * Qui si vede anche a cosa serve lo `sticky`: il riquadro è fermo, le righe
 * scorrono dentro, e il totale resta in fondo alla vista invece di andarsene
 * sotto la millesima riga. Il fondo è **opaco** (`bg-accent`, lo stesso della
 * testata) e non il `bg-muted/50` translucido della primitiva: appoggiato
 * sopra righe che gli scorrono sotto, un fondo semitrasparente lascerebbe
 * leggere il totale sovrapposto a un numero qualsiasi.
 *
 * Le misurazioni sono ripetute fino a 4.000 righe: a poche decine non ci
 * sarebbe niente da scorrere, e lo sticky non si vedrebbe lavorare.
 */
const MISURAZIONI_TANTE: MisurazioneComputo[] = Array.from(
  { length: 4000 },
  (_, i) => {
    const base = MISURAZIONI[i % MISURAZIONI.length]
    return { ...base, id: `${base.id}-${i}`, ambiente: `${base.ambiente} (${i + 1})` }
  }
)

/**
 * Lo stesso piede su 4.000 righe virtualizzate in un riquadro fermo: il totale
 * resta in fondo alla vista mentre le righe gli scorrono sotto.
 */
export const PiedeVirtualizzato: StoryObj<typeof DataTable<MisurazioneComputo>> = {
  name: 'Piede Virtualizzato',
  render: () => (
    <div className="flex h-140 flex-col">
      <DataTable
        colonne={COLONNE_PIEDE}
        dati={MISURAZIONI_TANTE}
        cerca="Cerca per voce o ambiente…"
        piede
        perPagina="virtuale"
        altezza="ferma"
        colonneNascondibili={false}
        nomeRighe={{ singolare: 'misurazione', plurale: 'misurazioni' }}
        className="min-h-0 flex-1"
      />
    </div>
  ),
}
