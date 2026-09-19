import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { apriCol, apriIlBottone } from '@/prove/apri'
import {
  Calendario,
  type CalendarioSorgente,
  type EventoCalendario,
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
 * ## Cosa sa fare
 *
 * - **Due viste**, mese e agenda, con la testata che le commuta. L'agenda è
 *   la faccia stretta — la vista che Officina si è scritta a mano.
 * - **Barre pluri-giorno con il calcolo delle corsie**: una barra che dura
 *   tre giorni si legge come *un* fermo, e più barre che si accavallano
 *   trovano ognuna la propria riga. È la parte cara, ed è la ragione per cui
 *   il motore si adotta invece di scriverlo.
 * - **«+N altri»** quando in una cella non ci stanno: apre un popover col
 *   resto del giorno.
 * - **Calendari**: un evento appartiene a un calendario, e da lì vengono il
 *   suo **colore** e l'**avatar**. In Officina un calendario è la persona a
 *   cui il fermo è affidato; ma può essere una linea, un reparto, una
 *   commessa.
 * - **Un dialogo per crea / modifica / elimina** (`modifica`), che si apre
 *   dal clic su un evento, dal clic su un giorno vuoto e dal bottone
 *   «Nuovo».
 * - **Trascinamento** (`trascinamento`) per riprogrammare, e il bordo per
 *   cambiare quanti giorni dura.
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
 * **I calendari sono le persone**, che è il caso di Officina: un calendario
 * per manutentore, e il colore dell'evento dice a chi il fermo è affidato.
 * Il concetto regge anche quando la persona non c'entra — un calendario per
 * linea, per reparto, per commessa — e per questo la prop si chiama
 * `calendari`.
 */
const SQUADRA: CalendarioSorgente[] = [
  { id: 'fs', nome: 'Francesco Sartori', colore: 'arancio' },
  { id: 'mr', nome: 'Marta Rossi', colore: 'blu' },
  { id: 'lb', nome: 'Luca Boni', colore: 'verde', iniziali: 'LB' },
  { id: 'ext', nome: 'Ditta esterna', colore: 'grigio' },
]

/**
 * Un mese di fermi che esercita tutto insieme: tre barre pluri-giorno che si
 * accavallano nella stessa settimana (le corsie), una giornata affollata che
 * fa comparire il «+N altri», e un evento senza calendario che tiene il
 * colore per sé.
 */
const FERMI: EventoCalendario[] = [
  // La settimana del 7: tre barre sovrapposte, tre corsie.
  { id: 'e1', title: 'Fermo pressa 3 — guarnizioni', start: g(7, 6), end: g(10, 22), calendarioId: 'fs' },
  { id: 'e2', title: 'Fermo forno A — refrattario', start: g(8, 6), end: g(12, 22), calendarioId: 'ext' },
  { id: 'e3', title: 'Ferie squadra manutenzione', start: g(9, 0), end: g(10, 0), allDay: true, calendarioId: 'mr' },
  // La settimana del 14: una giornata affollata, per il «+N altri».
  { id: 'e4', title: 'Cambio stampo', start: g(15, 6), end: g(15, 8), calendarioId: 'fs' },
  { id: 'e5', title: 'Taratura bilance', start: g(15, 8, 30), end: g(15, 10), calendarioId: 'mr' },
  { id: 'e6', title: 'Collaudo linea B', start: g(15, 10, 30), end: g(15, 13), calendarioId: 'lb' },
  { id: 'e7', title: 'Revisione muletto', start: g(15, 14), end: g(15, 16), calendarioId: 'ext' },
  { id: 'e8', title: 'Verifica antincendio', start: g(15, 16, 30), end: g(15, 18), colore: 'ardesia' },
  // Sparsi, perché il mese non sia tutto in due settimane.
  { id: 'e9', title: 'Fermo compressore', start: g(21, 6), end: g(23, 18), calendarioId: 'lb' },
  { id: 'e10', title: 'Manutenzione forno', start: g(25, 8), end: g(25, 12), calendarioId: 'mr' },
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
 * - passa all'**agenda** e torna al **mese**.
 *
 * Gli eventi stanno in uno `useState` di questa story: è il modo in cui
 * un'app li tiene, perché il calendario **non muta niente da sé**.
 */
export const Completo: Story = {
  args: {
    eventi: [],
    dataIniziale: ANCORA,
    calendari: SQUADRA,
    modifica: true,
    trascinamento: true,
  },
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
  name: "Dialogo dell'evento",
  args: {
    eventi: [],
    dataIniziale: ANCORA,
    calendari: SQUADRA,
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
 * **Lo schermo del capannone.** In densità touch i bersagli crescono con
 * `--spacing` — le celle passano da 120 a 180px — e la domanda vera è se una
 * cella si tocca col guanto senza sbagliare giorno. Il conto dei bersagli
 * piccoli sta a verbale in `WORKLOG.md`, misurato con
 * `npm run misura:bersagli`.
 *
 * Qui è dichiarato anche l'altro popup del blocco, il **«+N altri»** del 15.
 */
export const DensitaTouch: Story = {
  name: 'Densità touch',
  args: {
    eventi: FERMI,
    dataIniziale: ANCORA,
    calendari: SQUADRA,
    maxEventiPerCella: 2,
  },
  play: apriCol('[data-slot="event-calendar-more"]', 'event-calendar-more-popover'),
  render: (args) => (
    <div data-density="touch" className="bg-background text-foreground flex h-200 flex-col">
      <Calendario {...args} />
    </div>
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
  args: {
    eventi: [],
    dataIniziale: ANCORA,
    calendari: SQUADRA,
    vistaIniziale: 'agenda',
  },
  render: (args) => (
    <div className="flex h-128 flex-col">
      <Calendario {...args} />
    </div>
  ),
}
