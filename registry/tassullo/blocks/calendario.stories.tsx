import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'

import { cn } from 'cn'

import { apriCol, apriIlBottone } from '@/prove/apri'
import { intero } from '@/registry/tassullo/lib/numeri'
import {
  Calendario,
  type CalendarioSorgente,
  type EventoCalendario,
  type PersonaEvento,
} from '@/registry/tassullo/blocks/calendario'

/**
 * Il calendario a eventi: fermi, interventi, turni, su un mese, una settimana
 * o un'agenda, con le barre che durano più giorni, i colori per tipo e chi è
 * assegnato. È costruito sul motore `@reui/event-calendar`.
 *
 * **Quando sì, quando no.** Si usa per guardare e riprogrammare eventi che
 * hanno un inizio e una fine. Per scegliere una data o un intervallo in un
 * modulo si usa la primitiva `calendar`, dentro un `popover`; per un elenco di
 * eventi da filtrare e ordinare, senza griglia, `tassullo-data-table`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-calendario
 * ```
 *
 * ```tsx
 * const [fermi, setFermi] = useState(fermiIniziali)
 *
 * <Calendario
 *   calendari={interventi}
 *   persone={squadra}
 *   eventi={fermi}
 *   onEventiChange={setFermi}
 *   modifica
 * />
 * ```
 *
 * **Cosa mostra.** Tre viste — mese, settimana, agenda — con la testata che
 * le commuta e lo stesso periodo sotto tutte e tre: cambia la faccia, non ciò
 * che si guarda. Una barra che dura più giorni si legge come un solo evento,
 * e le barre che si accavallano trovano ognuna la sua riga. Quando in un
 * giorno gli eventi non ci stanno, «+N altri» apre il resto in un popover. Il
 * **calendario** di un evento è il suo tipo — Guasto, Preventiva, Ispezione —
 * e dà il **colore**, spiegato dalla legenda; gli **assegnatari** sono le
 * persone, e compaiono come **avatar**. Sono due canali separati: la stessa
 * persona fa interventi di tipo diverso, e su un evento possono essere in due.
 *
 * **Le prop.**
 *
 * - `eventi` e `onEventiChange`: gli eventi sono controllati.
 * - `calendari` (`{ id, nome, colore }`) e `persone`
 *   (`{ id, nome, iniziali, immagine }`); ogni evento li richiama con
 *   `calendarioId` e `assegnatariId`. Un evento senza calendario prende `colore`, o
 *   `coloreDefault`. I colori sono i dieci del tema per nome: `arancio`,
 *   `verde`, `blu`, `grigio`, `ocra`, `prugna`, `indaco`, `oliva`, `malva`,
 *   `rosso`.
 * - `modifica` accende il dialogo per creare, modificare ed eliminare: si apre
 *   dal clic su un evento, dal clic su un giorno vuoto e dal bottone «Nuovo».
 * - `trascinamento` accende lo spostamento degli eventi e il bordo che ne
 *   cambia la durata.
 * - `vista` o `vistaIniziale` (`"mese"`, `"settimana"`, `"agenda"`), `data` o
 *   `dataIniziale`, con `onVistaChange` e `onDataChange`.
 * - `giorniAgenda`: `"mese"` tiene l'agenda sullo stesso mese, un numero la
 *   fa scorrere per N giorni.
 * - `weekend`, `numeroSettimana`, `tooltip`: sabato e domenica, la colonna
 *   del numero di settimana, il tooltip sull'evento. `opzioni` mette le tre
 *   leve in un menu della testata, e allora le prop sono solo il punto di
 *   partenza.
 * - `onEventoClick` e `onGiornoClick`; `e.preventDefault()` in
 *   `onEventoClick` apre un pannello proprio al posto del dialogo.
 * - `azioni` aggiunge controlli in testata; `testata={false}` e
 *   `legenda={false}` le tolgono; `statoVuoto` sostituisce il vuoto.
 *
 * **Regole d'uso.**
 *
 * - La settimana comincia di lunedì in tutte le viste, e sabato e domenica
 *   sono spenti di serie: è un calendario lavorativo. `weekend` li riaccende;
 *   l'agenda li elenca comunque, quindi un evento del sabato non si perde.
 * - Senza `modifica` il calendario è in sola lettura, e il clic su un giorno
 *   non crea niente. Il trascinamento è spento di serie: col dito, su una
 *   griglia di celle piccole, si sbaglia giorno, e sarebbe l'unica modifica
 *   senza conferma. La strada con la conferma è la data nel dialogo.
 * - Gli eventi non cambiano da soli: trascinamento e dialogo chiamano
 *   `onEventiChange` con l'elenco nuovo, e l'app lo rimette in `eventi` dopo
 *   averlo salvato. Senza `onEventiChange` il calendario sembra rispondere e
 *   non salva niente.
 * - Ogni evento ha `start` e `end`, e `end` è **esclusivo**: un evento del
 *   solo 9 finisce alle 00:00 del 10. Il backend che salva gli eventi deve
 *   usare la stessa convenzione, o ogni evento risulta lungo un giorno di
 *   più.
 * - Ogni evento ha un `id` stabile, quello del backend: modifica ed
 *   eliminazione lo riconoscono dall'`id`. Un evento creato dal dialogo
 *   arriva in `onEventiChange` con un `id` provvisorio, che l'app sostituisce
 *   con quello restituito dal backend.
 * - Il contenitore deve avere un'altezza: il blocco riempie un genitore
 *   `flex flex-col` di altezza nota.
 * - Nella vista mese la cella non scende sotto l'altezza di tre eventi: sotto
 *   quella misura il mese scorre, sopra la cella cresce e mostra più eventi.
 *   Su uno spazio basso o stretto la faccia giusta è l'agenda, e sceglierla
 *   spetta alla pagina.
 * - Il vuoto è quello di `tassullo-empty-state`; `statoVuoto` lo sostituisce
 *   quando serve un'azione per uscirne.
 *
 * **Tastiera e accessibilità.** Testata, bottoni e menu si usano da tastiera,
 * e il dialogo tiene il fuoco al suo interno e si chiude con `Esc`. La griglia
 * del mese non si naviga con le frecce: `Tab` passa per gli eventi, per i
 * «+N altri» e, con `modifica`, per il «+» che aggiunge un evento in ogni
 * giorno.
 */
const meta = {
  title: 'Blocchi/Calendario',
  component: Calendario,
  tags: ['autodocs'],

  /**
   * **Una regola axe spenta, e solo qui: `aria-required-children`.**
   *
   * Il difetto è vero ed è del motore adottato. Una barra che attraversa più
   * giorni non può stare *dentro* una cella — starebbe dentro la prima —
   * quindi ReUI la disegna in un piano sovrapposto (`data-slot=
   * "event-calendar-month-bar-overlay"`) che è **figlio diretto della riga**.
   * La riga è `role="row"`, e un `row` ammette per figli solo `gridcell`:
   * axe trova dei `button[aria-label]` e chiama `aria-required-children`.
   *
   * **Non si chiude ri-stilando**: un `role` non è una stringa di classi, e
   * la posizione del piano nell'albero è struttura — fuori dal gradino 2
   * della regola 4bis. E non si chiude nemmeno dal blocco: il piano lo
   * disegna la vista, non chi la monta.
   *
   * **Perché si spegne la regola e non si escludono i nodi**, che è il
   * rovescio di quello che ha fatto D14 sul combobox. Lì i nodi erano due
   * crocette e la regola (`button-name`) valeva su tutto il resto della
   * story; qui è l'opposto: i nodi sono **le barre degli eventi**, cioè
   * l'elemento più interessante da misurare — contrasto, nome accessibile,
   * fuoco — e la regola, in queste scene, non ha altro soggetto che la
   * griglia. Escludere il piano perderebbe ogni misura sulle barre;
   * spegnere la regola perde una misura sola, su un difetto già accertato.
   * Il costo residuo, scritto perché si sappia: in queste scene un *altro*
   * `aria-required-children` — un `tablist` senza `tab`, un `grid` senza
   * `row` — non verrebbe più visto.
   *
   * Misura e ragionamento per esteso in `docs/DECISIONI.md` §44.
   */
  parameters: {
    layout: 'padded',
    a11y: { config: { rules: [{ id: 'aria-required-children', enabled: false }] } },
  },
} satisfies Meta<typeof Calendario>

export default meta
type Story = StoryObj<typeof meta>

/** Settembre 2026, così le scene non cambiano col passare dei mesi. */
const ANCORA = new Date(2026, 8, 1)
const g = (giorno: number, ora = 8, minuto = 0) =>
  new Date(2026, 8, giorno, ora, minuto)

/**
 * **I calendari sono i tipi di intervento**, e sono quelli che Officina ha
 * nella sua legenda: Guasto, Preventiva, Ispezione, Miglioria. È il colore a
 * dirlo.
 *
 * **Il guasto è rosso**, e dal 2026-09-21 lo è davvero: la tavolozza è passata
 * da cinque a dieci tinte e `--chart-10` è un rosso caldo. In M4ter.2 il rosso
 * non c'era e il guasto aveva preso l'arancio — «il più caldo dei cinque» —
 * che era un ripiego e si leggeva come tale.
 *
 * Il rosso della tavolozza **non è `--destructive`**: quello è il colore
 * dell'allarme, e una categoria «Guasto» non è un'azione distruttiva. Sono due
 * rossi vicini di tinta (29 contro 27) e lontani di ruolo.
 */
const INTERVENTI: CalendarioSorgente[] = [
  { id: 'guasto', nome: 'Guasto', colore: 'rosso' },
  { id: 'preventiva', nome: 'Preventiva', colore: 'blu' },
  { id: 'ispezione', nome: 'Ispezione', colore: 'verde' },
  { id: 'miglioria', nome: 'Miglioria', colore: 'grigio' },
]

/**
 * **Gli assegnatari sono le persone**, e sono l'avatar — non il colore.
 *
 * Due hanno la fotografia e uno no, apposta: è la differenza che si vuole
 * vedere. Senza `immagine` restano le **iniziali** — «Stefano Bertolini» →
 * `SB` — e senza nemmeno l'assegnatario resta il pallino col colore del
 * calendario.
 *
 * Gli indirizzi delle due foto sono remoti, come nelle demo di ReUI, e
 * valgono **solo per la story**: il registry non spedisce immagini. Se la
 * rete non c'è — succede in CI — l'avatar ripiega sulle iniziali, che è poi
 * il comportamento che si vuole comunque garantito.
 */
const SQUADRA: PersonaEvento[] = [
  { id: 'sb', nome: 'Stefano Bertolini', immagine: 'https://i.pravatar.cc/80?img=13' },
  { id: 'am', nome: 'Anna Moretti', immagine: 'https://i.pravatar.cc/80?img=45' },
  { id: 'nf', nome: 'Nicola Ferrari' },
]

/**
 * Un mese di fermi che esercita tutto insieme: tre barre pluri-giorno che si
 * accavallano nella stessa settimana (le corsie), una giornata affollata che
 * fa comparire il «+N altri», e un evento senza calendario che tiene il
 * colore per sé.
 */
const FERMI: EventoCalendario[] = [
  // La settimana del 7: tre barre sovrapposte, tre corsie.
  { id: 'e1', title: 'Fermo pressa 3 — guarnizioni', start: g(7, 6), end: g(10, 22), calendarioId: 'guasto', assegnatariId: ['sb', 'nf'] },
  { id: 'e2', title: 'Fermo forno A — refrattario', start: g(8, 6), end: g(12, 22), calendarioId: 'guasto' },
  { id: 'e3', title: 'Revisione semestrale', start: g(9, 0), end: g(10, 0), allDay: true, calendarioId: 'preventiva', assegnatariId: ['am'] },
  // La settimana del 14: una giornata affollata, per il «+N altri».
  { id: 'e4', title: 'Cambio stampo', start: g(15, 6), end: g(15, 8), calendarioId: 'preventiva', assegnatariId: ['sb'] },
  { id: 'e5', title: 'Taratura bilance', start: g(15, 8, 30), end: g(15, 10), calendarioId: 'ispezione', assegnatariId: ['am'] },
  { id: 'e6', title: 'Collaudo linea B', start: g(15, 10, 30), end: g(15, 13), calendarioId: 'ispezione', assegnatariId: ['nf'] },
  { id: 'e7', title: 'Revisione muletto', start: g(15, 14), end: g(15, 16), calendarioId: 'preventiva' },
  { id: 'e8', title: 'Aspirazione trucioli', start: g(15, 16, 30), end: g(15, 18), calendarioId: 'miglioria', assegnatariId: ['nf'] },
  // Sparsi, perché il mese non sia tutto in due settimane.
  { id: 'e9', title: 'Fermo compressore', start: g(21, 6), end: g(23, 18), calendarioId: 'guasto', assegnatariId: ['nf', 'am', 'sb'] },
  { id: 'e10', title: 'Manutenzione forno', start: g(25, 8), end: g(25, 12), calendarioId: 'preventiva', assegnatariId: ['am'] },
]

function Guscio({ children }: { children: React.ReactNode }) {
  return <div className="flex h-224 flex-col">{children}</div>
}

/**
 * Tutto acceso: tipi e persone, barre di più giorni, «+N altri», le tre viste,
 * dialogo e trascinamento. Il «+N altri» del 15 è aperto. Si prova a
 * trascinare un evento, a tirarne il bordo, a cliccarne uno e a cliccare un
 * giorno vuoto.
 */
export const Completo: Story = {
  args: {
    eventi: [],
    dataIniziale: ANCORA,
    calendari: INTERVENTI,
    persone: SQUADRA,
    modifica: true,
    trascinamento: true,
    tooltip: true,
    opzioni: true,
    // Officina in fabbrica non lavora il fine settimana, e il numero della
    // settimana è un dato che serve a pochi: si parte con tutti e due
    // spenti, e chi li vuole li accende dal menù «Opzioni».
    weekend: false,
    numeroSettimana: false,
  },
  // **Il popup dichiarato qui è il «+N altri»**, non il dialogo: Storybook
  // esegue le `play` anche nel canvas, quindi quello che si dichiara arriva
  // **aperto**. Un popover piccolo sopra una cella lascia vedere il
  // calendario; il dialogo lo coprirebbe tutto.
  play: apriCol('[data-slot="event-calendar-more"]', 'event-calendar-more-popover'),
  render: function Tutto(args) {
    const [eventi, setEventi] = useState<EventoCalendario[]>(FERMI)
    return (
      <Guscio>
        <Calendario {...args} eventi={eventi} onEventiChange={setEventi} />
      </Guscio>
    )
  },
}

/**
 * Il dialogo di creazione, aperto da «Nuovo».
 */
export const DialogoEvento: Story = {
  // Scena di misura: `!dev` la toglie dalla barra e da Docs, dove il
  // dialogo si vede da «Completo», ma axe continua a eseguirla, e senza
  // questa il dialogo non verrebbe scansionato da nessuna parte.
  tags: ['!dev', '!autodocs'],
  name: "Dialogo dell'evento",
  args: {
    eventi: [],
    dataIniziale: ANCORA,
    calendari: INTERVENTI,
    persone: SQUADRA,
    modifica: true,
  },
  play: apriIlBottone(/^Nuovo$/, 'dialog-content'),
  render: function ConDialogo(args) {
    const [eventi, setEventi] = useState<EventoCalendario[]>(FERMI)
    return (
      <Guscio>
        <Calendario {...args} eventi={eventi} onEventiChange={setEventi} />
      </Guscio>
    )
  },
}

/**
 * La vista settimana, sulla settimana con gli eventi che si accavallano.
 */
export const Settimana: Story = {
  // Scena di misura, come sopra: axe guarda le story **come si presentano**,
  // e «Completo» apre sul mese. Senza questa, la griglia oraria non sarebbe
  // misurata mai.
  tags: ['!dev', '!autodocs'],
  args: {
    eventi: FERMI,
    dataIniziale: g(8),
    calendari: INTERVENTI,
    persone: SQUADRA,
    vistaIniziale: 'settimana',
    tooltip: true,
  },
  render: (args) => (
    <Guscio>
      <Calendario {...args} />
    </Guscio>
  ),
}

/**
 * Un'agenda senza eventi: il vuoto è quello di `tassullo-empty-state`.
 */
export const Vuoto: Story = {
  // Scena di misura, come sopra: lo stato vuoto non si raggiunge da
  // «Completo», che ha sempre eventi.
  tags: ['!dev', '!autodocs'],
  args: {
    eventi: [],
    dataIniziale: ANCORA,
    calendari: INTERVENTI,
    persone: SQUADRA,
    vistaIniziale: 'agenda',
  },
  render: (args) => (
    <div className="flex h-128 flex-col">
      <Calendario {...args} />
    </div>
  ),
}

/**
 * Il calendario in un riquadro che si ridimensiona dal bordo in basso a
 * destra. La riga sotto legge l'altezza della cella, gli eventi visibili,
 * quanti finiscono in «+N altri» e se il mese scorre: tirando in su la cella
 * si ferma all'altezza di tre eventi e il mese comincia a scorrere, tirando
 * in giù tornano visibili più eventi. La sovrapposizione resta a zero.
 */
export const AltezzaVariabile: Story = {
  name: 'Altezza variabile',
  // `fullscreen`: il banco parte **alto quanto il canvas** e il riquadro
  // riempie ciò che resta. Con `padded` (il default della sezione) partiva da
  // un'altezza fissa in mezzo a una pagina vuota, cioè si provava
  // l'adattamento su un caso solo.
  parameters: { layout: 'fullscreen' },
  args: {
    eventi: [],
    dataIniziale: ANCORA,
    calendari: INTERVENTI,
    persone: SQUADRA,
    tooltip: true,
    opzioni: true,
    weekend: false,
  },
  render: function Banco(args) {
    const [eventi, setEventi] = useState<EventoCalendario[]>(FERMI)
    const riquadro = useRef<HTMLDivElement>(null)
    const [letture, setLetture] = useState<null | {
      contenitore: number
      cella: number
      passo: number
      sovrapposizione: number
      eventi: number
      piuAltri: number
      scorre: boolean
    }>(null)

    /*
     * Si misura a ogni ridimensionamento del riquadro, non a intervalli: un
     * `ResizeObserver` sul contenitore è la sola cosa che scatta **quando**
     * la geometria cambia davvero. La dipendenza è una `ref`, cioè un
     * riferimento stabile: un `.map()` inline fra le dipendenze manderebbe
     * l'effetto in giostra.
     */
    /*
     * **Il riquadro segue la finestra finché non lo si trascina.**
     *
     * Le due cose insieme non vengono da sé, e il motivo è quello scritto sul
     * `div` più sotto: un elemento flex che cresce o si stringe ignora il
     * proprio `height`, quindi per far comandare la maniglia il riquadro deve
     * essere `flex-none` con un'altezza **scritta**. Ma un'altezza scritta una
     * volta sola smette di seguire la finestra — ed è il difetto che si vede
     * come «si aggiorna solo se ricarico».
     *
     * Quindi: si riscrive a ogni ridimensionamento della finestra, **finché
     * l'utente non ha trascinato**. Che abbia trascinato lo si scopre senza
     * ascoltare la maniglia (non emette un evento suo): l'osservatore vede
     * un'altezza diversa da quella che abbiamo scritto noi, e da quel momento
     * comanda lui.
     */
    const nostraAltezza = useRef<number | null>(null)
    const trascinato = useRef(false)

    useEffect(() => {
      const nodo = riquadro.current
      if (!nodo) return

      const riempi = () => {
        const padre = nodo.parentElement
        if (!padre || trascinato.current) return
        const altre = [...padre.children]
          .filter((c) => c !== nodo)
          .reduce((somma, c) => somma + c.getBoundingClientRect().height, 0)
        const stile = getComputedStyle(padre)
        const scarto = parseFloat(stile.rowGap) || 0
        // `clientHeight` comprende il margine interno del banco: si toglie,
        // o il riquadro sarebbe più alto dello spazio che resta.
        const interno =
          padre.clientHeight - parseFloat(stile.paddingTop) - parseFloat(stile.paddingBottom)
        const h = Math.max(192, Math.round(interno - altre - scarto * 2))
        nostraAltezza.current = h
        nodo.style.height = `${h}px`
      }

      const leggi = () => {
        const alta = Math.round(nodo.getBoundingClientRect().height)
        // Un'altezza che non abbiamo scritto noi = la maniglia. Due pixel di
        // tolleranza perché `getBoundingClientRect` torna float e il browser
        // arrotonda lo `style` a modo suo.
        if (nostraAltezza.current !== null && Math.abs(alta - nostraAltezza.current) > 2) {
          trascinato.current = true
        }
        const righe = [...nodo.querySelectorAll('[data-slot="event-calendar-month-row"]')]
        if (righe.length < 2) return setLetture(null)
        const r = righe.map((x) => x.getBoundingClientRect())
        const cont = nodo.querySelector('[data-slot="calendario-contenuto"]')
        setLetture({
          contenitore: alta,
          cella: Math.round(r[0]!.height),
          passo: Math.round(r[1]!.top - r[0]!.top),
          sovrapposizione: Math.max(0, Math.round(r[0]!.height - (r[1]!.top - r[0]!.top))),
          eventi: nodo.querySelectorAll('[data-slot="event-calendar-event"]').length,
          piuAltri: nodo.querySelectorAll('[data-slot="event-calendar-more"]').length,
          scorre: cont ? cont.scrollHeight > cont.clientHeight + 1 : false,
        })
      }

      riempi()
      leggi()

      /*
       * **Due osservati, non uno.** Il riquadro dice quando cambia l'altezza —
       * trascinata o riscritta da `riempi` — e la **griglia** dice quando
       * cambia il contenuto senza che il riquadro si muova: commutando la
       * densità le corsie diventano più alte e il conto degli eventi cambia,
       * ma il riquadro resta quello. Con il solo riquadro osservato il
       * righello mentirebbe fino al ridimensionamento successivo.
       */
      const oss = new ResizeObserver(leggi)
      oss.observe(nodo)
      const corpo = nodo.querySelector('[data-slot="event-calendar-month-body"]')
      if (corpo) oss.observe(corpo)

      /*
       * **E un osservatore delle mutazioni, o il righello resta indietro di un
       * giro.** L'adattamento è a due tempi: la griglia cambia altezza (e
       * `ResizeObserver` scatta), *poi* il motore ri-rende i chip decidendo
       * quanti ce ne stanno. Leggendo solo sul primo tempo il numero di eventi
       * è quello di **prima** — misurato: riquadro a 944px, nel DOM 7 chip e
       * un «+N», e il righello scriveva ancora 3 e 5. Si misura a pagina
       * ferma, e qui «ferma» vuol dire dopo il secondo tempo. Un `MutationObserver` sul corpo lo coglie senza dipendere dai
       * fotogrammi — che col pannello nascosto non scattano.
       */
      const mut = corpo
        ? new MutationObserver(() => {
            leggi()
          })
        : null
      if (corpo && mut) mut.observe(corpo, { childList: true, subtree: true })

      const suFinestra = () => {
        riempi()
        leggi()
      }
      window.addEventListener('resize', suFinestra)
      return () => {
        oss.disconnect()
        mut?.disconnect()
        window.removeEventListener('resize', suFinestra)
      }
    }, [])

    return (
      // `h-svh` e non `h-full`: il canvas non dichiara un'altezza, quindi un
      // `h-full` risolverebbe a `auto` e il riquadro tornerebbe a dimensionarsi
      // sul contenuto — cioè il contrario di ciò che questa scena misura.
      <div className="flex h-svh flex-col gap-3 p-4">
        <p className="text-muted-foreground max-w-prose shrink-0 text-xs">
          Trascina il bordo in basso a destra del riquadro per cambiarne
          l&apos;altezza. Le letture sotto il calendario valgono nella vista
          mese.
        </p>
        {/*
          `resize-y` vuole un `overflow` diverso da `visible` per mostrare la
          maniglia: `overflow-hidden` basta, e il calendario dentro ha già il
          proprio scorrimento dove serve.
        */}
        {/*
          **`flex-none`, e l'altezza iniziale la scrive l'effetto qui sopra.**
          Sembra più complicato di un `flex-1`, e invece è l'unica forma che
          funziona: un elemento flex che **cresce o si stringe** ha l'altezza
          decisa dalla distribuzione dello spazio, non dal proprio `height` —
          quindi il `height` **in linea** che il browser scrive quando si
          trascina la maniglia viene riassorbito al giro dopo. Misurato su
          tutte e due le varianti provate: con `flex-1` (base 0) e con
          `flex-auto` (base `auto`, ma `grow`/`shrink` a 1) il riquadro
          tornava a **591px** qualunque altezza gli si desse — che è il difetto
          che si vede come «il calendario non sfrutta tutta la schermata» e,
          insieme, come «la maniglia non fa niente».
        */}
        <div
          ref={riquadro}
          className="flex min-h-24 flex-none resize-y flex-col overflow-hidden rounded-lg"
        >
          <Calendario {...args} eventi={eventi} onEventiChange={setEventi} />
        </div>
        {/*
          Misure del banco, non una scheda: stanno su una riga, così il
          calendario tiene l'altezza. Le sette voci ci sono sempre, con «—»
          fuori dalla vista mese: una riga che cambiasse passando da una vista
          all'altra sposterebbe il fondo della pagina.
        */}
        <div className="shrink-0 text-xs">
          <dl className="flex flex-wrap gap-x-6 gap-y-1">
            <Lettura voce="contenitore" valore={letture && `${intero(letture.contenitore)}px`} />
            <Lettura voce="cella" valore={letture && `${intero(letture.cella)}px`} />
            <Lettura voce="passo di riga" valore={letture && `${intero(letture.passo)}px`} />
            <Lettura
              voce="sovrapposizione"
              valore={letture && `${intero(letture.sovrapposizione)}px`}
              allarme={!!letture && letture.sovrapposizione > 0}
            />
            <Lettura voce="eventi visibili" valore={letture && intero(letture.eventi)} />
            <Lettura voce="«+N altri»" valore={letture && intero(letture.piuAltri)} />
            <Lettura voce="scorre" valore={letture && (letture.scorre ? 'sì' : 'no')} />
          </dl>
        </div>
      </div>
    )
  },
}

// Prova: le letture del banco stanno su una riga sotto il calendario, e il
// riquadro tiene l'altezza che resta. Scritte una per riga, sette righe
// toglievano al calendario 168px a 1440 e l'ultima settimana non si vedeva.
async function lettureSuUnaRiga({ canvasElement }: { canvasElement: HTMLElement }) {
  const termini = await waitFor(() => {
    const el = [...canvasElement.querySelectorAll<HTMLElement>('dl dt')]
    expect(el).toHaveLength(7)
    return el
  })
  const cime = new Set(termini.map((dt) => Math.round(dt.getBoundingClientRect().top)))
  expect(cime.size, 'righe occupate dalle letture').toBe(1)
}

// Scena di misura di «Altezza variabile»: la stessa resa, con la prova.
export const AltezzaVariabileProva: Story = {
  ...AltezzaVariabile,
  name: 'Altezza variabile, prova',
  tags: ['!dev', '!autodocs'],
  play: lettureSuUnaRiga,
}

function Lettura({
  voce,
  valore,
  allarme,
}: {
  voce: string
  valore: string | null
  allarme?: boolean
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="text-muted-foreground">{voce}</dt>
      <dd
        className={cn(
          'font-medium tabular-nums',
          allarme && 'text-destructive-subtle-foreground',
        )}
      >
        {valore ?? '—'}
      </dd>
    </div>
  )
}
