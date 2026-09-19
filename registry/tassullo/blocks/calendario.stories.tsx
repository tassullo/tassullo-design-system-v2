import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { apriCol, apriIlBottone } from '@/prove/apri'
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
 * dentro un genitore `flex flex-col` con altezza nota riempie lo spazio. Le
 * celle del mese hanno un'altezza minima che tiene **tre** eventi, e quando
 * le sei righe non ci stanno il mese **scorre** invece di schiacciarle.
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

/** **Gli assegnatari sono le persone**, e sono l'avatar — non il colore. */
const SQUADRA: PersonaEvento[] = [
  { id: 'fs', nome: 'Francesco Sartori' },
  { id: 'mr', nome: 'Marta Rossi' },
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
  return <div className="flex h-200 flex-col">{children}</div>
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
