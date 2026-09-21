import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

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
 * Il calendario a eventi coi default di casa Tassullo, montato sopra il
 * motore `@reui/event-calendar` adottato in M4ter.1.
 *
 * ```tsx
 * const [fermi, setFermi] = useState(fermiIniziali)
 *
 * <Calendario
 *   calendari={squadra}
 *   eventi={fermi}
 *   onEventiChange={setFermi}
 *   modifica
 *   trascinamento
 * />
 * ```
 *
 * **C'è una scena sola, ed è tutto qui dentro.** Le funzioni non hanno una
 * story per una: si accendono dalle prop nei Controls, o dai comandi della
 * testata.
 *
 * ## Cosa sa fare
 *
 * - **Tre viste**, mese, settimana e agenda, con la testata che le commuta e
 *   **lo stesso periodo** sotto tutte e tre: cambia la faccia, non ciò che
 *   si guarda. L'agenda è la faccia stretta — la vista che Officina si è
 *   scritta a mano.
 * - **Barre pluri-giorno con il calcolo delle corsie**: una barra che dura
 *   tre giorni si legge come *un* fermo, e più barre che si accavallano
 *   trovano ognuna la propria riga. È la parte cara, ed è la ragione per cui
 *   il motore si adotta invece di scriverlo.
 * - **«+N altri»** quando in una cella non ci stanno: apre un popover col
 *   resto del giorno.
 * - **Calendari e assegnatari sono due cose diverse**, come in Officina. Il
 *   **calendario** è il tipo di intervento — Guasto, Preventiva, Ispezione,
 *   Miglioria — ed è il **colore**, spiegato dalla legenda sotto la testata.
 *   Gli **assegnatari** sono le persone, e sono gli **avatar**: quando ci
 *   sono si vedono loro, in un `AvatarGroup`, e quando mancano resta il
 *   pallino col colore del calendario. **Possono essere più d'uno** — su un
 *   fermo capita di essere in due — e dal terzo in poi il gruppo dice
 *   *quanti* invece di *chi*. Due canali separati, perché lo stesso
 *   manutentore fa guasti e preventive.
 * - **Un dialogo per crea / modifica / elimina** (`modifica`), che si apre
 *   dal clic su un evento, dal clic su un giorno vuoto e dal bottone
 *   «Nuovo».
 * - **Trascinamento** (`trascinamento`) per riprogrammare, e il bordo per
 *   cambiare quanti giorni dura. La strada **con la conferma** è il
 *   date-picker dentro il dialogo, che è il pattern descritto dal commento
 *   di testa del `Calendario.tsx` di Officina.
 * - **Tre interruttori di vista**, dal menù «Opzioni» in testata (`opzioni`)
 *   o fissati dall'app: `weekend` toglie sabato e domenica,
 *   `numeroSettimana` aggiunge la colonna a sinistra, `tooltip` accende il
 *   tooltip sull'evento. Col menù acceso le tre prop sono il **valore di
 *   partenza** e poi comanda chi guarda.
 * - **Uno stato vuoto** che è quello di casa (`tassullo-empty-state`, M3.5),
 *   non quello di ReUI: si vede svuotando `eventi`, e `statoVuoto` lo
 *   sostituisce quando serve una CTA.
 * - **Densità touch**: le celle passano da 120 a 180px e i bersagli crescono
 *   con `--spacing`. Si prova dalla leva **Densità** in barra, che è globale
 *   alla style guide.
 *
 * ## I quattro default di casa
 *
 * Presi dal `Calendario.tsx` di Officina, e **restano default anche adesso
 * che l'interattività c'è**: `modifica` e `trascinamento` dicono quanto
 * aprirlo, non cambiano il punto di partenza.
 *
 * 1. **La settimana comincia di lunedì**, scritto esplicito e non dedotto dal
 *    locale: il motore legge `weekStartsOn ?? locale?.options?.weekStartsOn
 *    ?? 0`, quindi chi dimentica il locale avrebbe la domenica in prima
 *    colonna **senza nessun errore**.
 * 2. **Niente creazione dell'evento dal clic sulla griglia.**
 * 3. **Trascinamento spento.** «La riprogrammazione è un date-picker nel
 *    pannello, non un drag&drop: trascinare su una griglia da 42 celle è
 *    preciso col mouse e impossibile col pollice, e sarebbe l'unica azione
 *    dell'app senza una conferma.»
 * 4. **L'evento prende `start` e `end`**, non un istante. `end` è
 *    **esclusivo**: un fermo del solo 9 finisce alle 00:00 del 10.
 *
 * ## Tre cose da sapere prima di usarlo
 *
 * **Gli eventi sono controllati.** Trascinamento e dialogo non mutano niente
 * da sé: chiamano `onEventiChange` con l'elenco nuovo, e l'app lo rimette
 * dentro da `eventi`. Lo vuole il motore — in modo controllato emette il
 * callback e non tocca lo stato interno — ed è anche giusto, perché una
 * riprogrammazione passa dal backend. Accendere `modifica` o `trascinamento`
 * **senza** `onEventiChange` fa un calendario che sembra rispondere e non
 * salva niente.
 *
 * **Il contenitore deve avere un'altezza**, e il blocco è `min-h-0 flex-1`:
 * dentro un genitore `flex flex-col` con altezza nota riempie lo spazio.
 *
 * **Il pavimento della cella è tre eventi, e da lì in su il mese cresce**
 * (2026-09-21). Sotto quella misura la cella **non si comprime**: il
 * contenitore scorre. Sopra, l'adattamento del motore aggiunge corsie intere —
 * misurato, a 1400px di contenitore la cella è 214px e il «+N altri» sparisce
 * del tutto. Fino a M4ter.11 qui c'era scritto che il mese «scorre invece di
 * schiacciarle», e non era vero: schiacciava **e** scorreva, coi chip
 * disegnati sopra i numeri dei giorni della settimana precedente. Il perché
 * completo, con la via opposta provata e scartata — pavimento a una corsia,
 * che lasciava l'ultimo elemento **tagliato a metà** — sta su `monthRow` in
 * `calendario.tsx`.
 *
 * **Il bivio mese/agenda lo dichiara la pagina**, non il blocco: quale
 * mostrare dipende da quanto spazio ha *quella* pagina, e da M4ter.6 si
 * scriverà con `useSoglia`.
 *
 * ## Due cose che si vedono e non si possono cambiare
 *
 * **Il numero del giorno sta in basso a destra**: è una scelta del motore
 * adottato («Notion-style»), e spostarlo in alto sarebbe muovere un nodo del
 * DOM, fuori dal gradino 2 della regola 4bis.
 *
 * **Le frecce non spostano una selezione nella griglia.** Misurato in
 * Chromium vero: 42 celle, **nessuna** focalizzabile, e axe dà zero
 * violazioni — è D15. Non morde col default di casa, perché una cella non ha
 * azioni; con `modifica` acceso l'appiglio da tastiera è il «+» che compare
 * in ogni cella.
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
 * Officina usa un rosso per il guasto, che nella nostra tavolozza non c'è —
 * i cinque `--chart-*` sono arancio, verde, blu e due grigi. Il guasto prende
 * l'arancio, che è il più caldo dei cinque; se servisse un rosso vero si
 * aggiungerebbe alla palette in `scripts/hex-to-oklch.ts`, non qui.
 */
const INTERVENTI: CalendarioSorgente[] = [
  { id: 'guasto', nome: 'Guasto', colore: 'arancio' },
  { id: 'preventiva', nome: 'Preventiva', colore: 'blu' },
  { id: 'ispezione', nome: 'Ispezione', colore: 'verde' },
  { id: 'miglioria', nome: 'Miglioria', colore: 'ardesia' },
]

/**
 * **Gli assegnatari sono le persone**, e sono l'avatar — non il colore.
 *
 * Due hanno la fotografia e uno no, apposta: è la differenza che si vuole
 * vedere. Senza `immagine` restano le **iniziali** — «Francesco Sartori» →
 * `FS` — e senza nemmeno l'assegnatario resta il pallino col colore del
 * calendario.
 *
 * Gli indirizzi delle due foto sono remoti, come nelle demo di ReUI, e
 * valgono **solo per la story**: il registry non spedisce immagini. Se la
 * rete non c'è — succede in CI — l'avatar ripiega sulle iniziali, che è poi
 * il comportamento che si vuole comunque garantito.
 */
const SQUADRA: PersonaEvento[] = [
  { id: 'fs', nome: 'Francesco Sartori', immagine: 'https://i.pravatar.cc/80?img=13' },
  { id: 'mr', nome: 'Marta Rossi', immagine: 'https://i.pravatar.cc/80?img=45' },
  { id: 'lb', nome: 'Luca Boni' },
]

/**
 * Un mese di fermi che esercita tutto insieme: tre barre pluri-giorno che si
 * accavallano nella stessa settimana (le corsie), una giornata affollata che
 * fa comparire il «+N altri», e un evento senza calendario che tiene il
 * colore per sé.
 */
const FERMI: EventoCalendario[] = [
  // La settimana del 7: tre barre sovrapposte, tre corsie.
  { id: 'e1', title: 'Fermo pressa 3 — guarnizioni', start: g(7, 6), end: g(10, 22), calendarioId: 'guasto', assegnatariId: ['fs', 'lb'] },
  { id: 'e2', title: 'Fermo forno A — refrattario', start: g(8, 6), end: g(12, 22), calendarioId: 'guasto' },
  { id: 'e3', title: 'Revisione semestrale', start: g(9, 0), end: g(10, 0), allDay: true, calendarioId: 'preventiva', assegnatariId: ['mr'] },
  // La settimana del 14: una giornata affollata, per il «+N altri».
  { id: 'e4', title: 'Cambio stampo', start: g(15, 6), end: g(15, 8), calendarioId: 'preventiva', assegnatariId: ['fs'] },
  { id: 'e5', title: 'Taratura bilance', start: g(15, 8, 30), end: g(15, 10), calendarioId: 'ispezione', assegnatariId: ['mr'] },
  { id: 'e6', title: 'Collaudo linea B', start: g(15, 10, 30), end: g(15, 13), calendarioId: 'ispezione', assegnatariId: ['lb'] },
  { id: 'e7', title: 'Revisione muletto', start: g(15, 14), end: g(15, 16), calendarioId: 'preventiva' },
  { id: 'e8', title: 'Aspirazione trucioli', start: g(15, 16, 30), end: g(15, 18), calendarioId: 'miglioria', assegnatariId: ['lb'] },
  // Sparsi, perché il mese non sia tutto in due settimane.
  { id: 'e9', title: 'Fermo compressore', start: g(21, 6), end: g(23, 18), calendarioId: 'guasto', assegnatariId: ['lb', 'mr', 'fs'] },
  { id: 'e10', title: 'Manutenzione forno', start: g(25, 8), end: g(25, 12), calendarioId: 'preventiva', assegnatariId: ['mr'] },
]

function Guscio({ children }: { children: React.ReactNode }) {
  return <div className="flex h-224 flex-col">{children}</div>
}

/**
 * **La scena unica: tutto acceso.** Calendari e persone, barre pluri-giorno
 * con le corsie, «+N altri», mese e agenda, dialogo e trascinamento.
 *
 * Cosa provare, in ordine di quanto è facile sbagliarlo:
 *
 * - **trascina** un fermo su un altro giorno, e **tira il bordo** di una
 *   barra per cambiarne la durata;
 * - **clicca un evento**: si apre in modifica, col suo calendario già scelto;
 * - **clicca un giorno vuoto**, o «Nuovo»: si apre in creazione;
 * - cambia il **calendario** nel dialogo e guarda cambiare colore e iniziali;
 * - apri il **«+N altri»** del 15;
 * - passa a **settimana** e ad **agenda**, e torna al **mese**: il periodo
 *   non cambia, cambia la faccia;
 * - **passa sopra** un evento: il tooltip dice titolo, orario e di chi è —
 *   è lì che il nome per esteso si legge, perché nel cerchio dell'avatar ci
 *   sta una lettera sola;
 * - la colonna a sinistra col **numero della settimana** si spegne con
 *   `numeroSettimana`, e `weekend` toglie sabato e domenica.
 *
 * Gli eventi stanno in uno `useState` di questa story: è il modo in cui
 * un'app li tiene, perché il calendario **non muta niente da sé**.
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
 * **Il dialogo, aperto.** È la scena di sopra con una `play` che preme
 * «Nuovo»: serve al gate, perché **un popup non aperto non è un popup senza
 * violazioni**.
 *
 * Sta a parte e non sulla scena principale per una ragione pratica:
 * Storybook esegue le `play` anche nel canvas, quindi la story che dichiara
 * un popup **arriva col popup davanti** — e sulla scena completa il dialogo
 * coprirebbe proprio ciò che si vuole provare, cioè il trascinamento.
 */
export const DialogoEvento: Story = {
  // Scena di misura: `!dev` la toglie dalla barra e da Docs — Francesco
  // la vuole integrata in «Completo» — ma il gate axe continua a eseguirla,
  // e senza il dialogo non verrebbe scansionato da nessuna parte.
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
 * **La griglia oraria.** Esiste come story sua per una ragione di misura, non
 * di catalogo: axe guarda le story **come si presentano**, e una vista che
 * nessuna story monta è una vista che il gate non ha mai visto. La scena
 * completa apre sul mese, quindi la settimana andrebbe misurata da nessuna
 * parte.
 *
 * È lo stesso calendario e lo stesso mese: qui l'ancora cade sulla settimana
 * dell'8, che è quella coi fermi sovrapposti.
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
 * **Il vuoto è quello nostro, non quello di ReUI.** Il motore monterebbe una
 * sua illustrazione; qui il vuoto passa da `tassullo-empty-state`, che è lo
 * standard unico di M3.5 — icona, frase, e una CTA quando c'è un'azione
 * sensata. Un calendario che si inventasse un vuoto proprio sarebbe
 * esattamente la deriva che il design system esiste per non avere.
 *
 * `statoVuoto` lo sostituisce, ed è la strada per aggiungerci il bottone che
 * porta fuori dal vuoto.
 *
 * La scena mostra l'**agenda**, perché è lì che il vuoto si vede: nel mese la
 * griglia c'è comunque — trentun caselle numerate non sono uno stato vuoto,
 * sono un mese senza niente dentro.
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
 * **Il banco per provare l'adattamento in altezza.** Il riquadro si
 * **trascina dal bordo in basso a destra** (`resize-y`), e la riga sotto
 * legge dal DOM cosa succede mentre lo si muove: altezza del contenitore,
 * altezza della cella, quanti eventi restano visibili, quanti finiscono nel
 * «+N altri», e se la griglia sta scorrendo.
 *
 * È il modo di verificare a mano quello che `monthRow` documenta misurato:
 * **il mese ci sta sempre tutto e non si scorre mai**, e più il riquadro è
 * basso più eventi la cella arrotola. Il pavimento è una corsia più il numero
 * del giorno — 64px in densità normale, 96 in touch — e sotto quello nemmeno
 * un evento ci starebbe: lì la faccia giusta è l'agenda.
 *
 * Da provare, in quest'ordine:
 *
 * - **tira in su fino in fondo**: le celle scendono al pavimento e quasi ogni
 *   giornata diventa un «+N altri». Le sei settimane ci sono ancora tutte;
 * - **clicca un «+N altri»**: il popover mostra la giornata intera — niente si
 *   è perso, si è solo arrotolato;
 * - **tira in giù**: le corsie tornano una per volta, e il «+N» si consuma;
 * - **commuta la densità** in barra: in touch il pavimento è più alto, quindi
 *   lo stesso riquadro arrotola prima.
 *
 * Il righello da guardare è **«sovrapposizione»**: deve restare a `0px` a
 * ogni altezza. È il difetto che questa scena esiste per sorvegliare — prima
 * di M4ter.11 a 576px valeva 51px fra le righe, coi chip disegnati sopra i
 * numeri dei giorni della settimana precedente.
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
     * riferimento stabile — la regola delle dipendenze non primitive del
     * `CLAUDE.md`: un `.map()` inline qui manderebbe l'effetto in giostra.
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
        const scarto = parseFloat(getComputedStyle(padre).rowGap) || 0
        const h = Math.max(192, Math.round(padre.clientHeight - altre - scarto * 2))
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
       * un «+N», e il righello scriveva ancora 3 e 5. È la famiglia di §32:
       * si misura a pagina ferma, e qui «ferma» vuol dire dopo il secondo
       * tempo. Un `MutationObserver` sul corpo lo coglie senza dipendere dai
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
          l&apos;altezza.
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
        <dl className="flex shrink-0 flex-wrap gap-x-6 gap-y-1 text-xs">
          {letture ? (
            <>
              <Lettura voce="contenitore" valore={`${intero(letture.contenitore)}px`} />
              <Lettura voce="cella" valore={`${intero(letture.cella)}px`} />
              <Lettura voce="passo di riga" valore={`${intero(letture.passo)}px`} />
              <Lettura
                voce="sovrapposizione"
                valore={`${intero(letture.sovrapposizione)}px`}
                allarme={letture.sovrapposizione > 0}
              />
              <Lettura voce="eventi visibili" valore={intero(letture.eventi)} />
              <Lettura voce="«+N altri»" valore={intero(letture.piuAltri)} />
              <Lettura voce="scorre" valore={letture.scorre ? 'sì' : 'no'} />
            </>
          ) : (
            <span className="text-muted-foreground">Passa alla vista mese per misurare.</span>
          )}
        </dl>
      </div>
    )
  },
}

function Lettura({
  voce,
  valore,
  allarme,
}: {
  voce: string
  valore: string
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
        {valore}
      </dd>
    </div>
  )
}
