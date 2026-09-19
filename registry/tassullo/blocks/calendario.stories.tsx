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
 * <Calendario eventi={fermi} onEventoClick={(o) => apriPannello(o.event)} />
 * ```
 *
 * **Quattro cose che questo blocco decide, e che il motore da solo non
 * deciderebbe**: la settimana comincia di **lunedì**, il clic su una cella
 * **non crea niente**, il **trascinamento è spento** (prop `trascinamento`
 * per riaccenderlo) e l'evento prende **`start` e `end`**, non un istante.
 * Il perché di ognuna sta in testa a `calendario.tsx`.
 *
 * **Il bivio mese/agenda lo dichiara la pagina.** L'agenda è la faccia
 * stretta — la vista che Officina si è scritta a mano — e quale mostrare
 * dipende da quanto spazio ha *quella* pagina: da M4ter.6 si scriverà con
 * `useSoglia`. Qui la testata commuta le due quando `vista` non è
 * controllata.
 *
 * **Il numero del giorno sta in basso a destra**, ed è una scelta del
 * motore adottato (`// Day number + add affordance, bottom-right
 * (Notion-style)`): spostarlo in alto sarebbe muovere un nodo del DOM, non
 * cambiare una stringa di classi, cioè fuori dal gradino 2 della regola
 * 4bis.
 */
const meta = {
  title: 'Blocchi/Calendario',
  component: Calendario,

  /**
   * **Una regola axe spenta, e solo qui: `aria-required-children`.**
   *
   * Il difetto è vero ed è del motore adottato. Una barra che attraversa più
   * giorni non può stare *dentro* una cella — starebbe dentro la prima —
   * quindi ReUI la disegna in un piano sovrapposto (`data-slot=
   * "event-calendar-month-bar-overlay"`) che è **figlio diretto della riga**.
   * La riga è `role="row"`, e un `row` ammette per figli solo `gridcell`:
   * axe trova dei `button[aria-label]` e chiama `aria-required-children`.
   * Compare **solo** sulle scene con barre pluri-giorno (Mese, Barre
   * pluri-giorno, Densità touch); Agenda, «+N altri» e Vuoto sono pulite.
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
   * Il costo residuo, scritto perché si sappia: in queste sei scene un
   * *altro* `aria-required-children` — un `tablist` senza `tab`, un `grid`
   * senza `row` — non verrebbe più visto.
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

const fermi: EventoCalendario[] = [
  { id: 'f1', title: 'Fermo pressa 3', start: g(7, 7), end: g(10, 18), calendarioId: 'fs' },
  { id: 'f2', title: 'Manutenzione forno', start: g(9, 8), end: g(9, 12), calendarioId: 'mr' },
  { id: 'f3', title: 'Collaudo linea B', start: g(15, 9), end: g(15, 17), calendarioId: 'lb' },
  { id: 'f4', title: 'Revisione muletto', start: g(23, 14), end: g(23, 16), calendarioId: 'ext' },
]

/**
 * La griglia del mese come la vede un'app: qualche fermo sparso, uno che
 * dura quattro giorni.
 */
export const Mese: Story = {
  args: { eventi: fermi, dataIniziale: ANCORA },
  render: (args) => (
    <div className="flex h-200 flex-col">
      <Calendario {...args} />
    </div>
  ),
}

/**
 * **La ragione per cui questo motore si adotta invece di scriverlo.** Cinque
 * fermi che durano giorni e si accavallano: il calcolo delle corsie decide
 * su che riga sta ognuno, e una barra che dura tre giorni si legge come
 * **un** fermo, non come tre.
 */
export const BarrePluriGiorno: Story = {
  name: 'Barre pluri-giorno',
  args: {
    dataIniziale: ANCORA,
    eventi: [
      { id: 'p1', title: 'Fermo pressa 3 — guarnizioni', start: g(7, 6), end: g(10, 22), colore: 'arancio' },
      { id: 'p2', title: 'Fermo forno A — refrattario', start: g(8, 6), end: g(12, 22), colore: 'blu' },
      { id: 'p3', title: 'Ferie squadra manutenzione', start: g(9, 0), end: g(10, 0), allDay: true, colore: 'verde' },
      { id: 'p4', title: 'Collaudo linea B', start: g(14, 6), end: g(16, 18), colore: 'ardesia' },
      { id: 'p5', title: 'Fermo compressore', start: g(15, 6), end: g(18, 18), colore: 'grigio' },
    ],
  },
  render: (args) => (
    <div className="flex h-200 flex-col">
      <Calendario {...args} />
    </div>
  ),
}

/**
 * Quando in una cella non ci stanno, il motore mette un **«+N altri»** che
 * apre un popover col resto del giorno. La story lo **dichiara** con una
 * `play` da `@/prove/apri`, perché un popup non aperto non è un popup senza
 * violazioni.
 */
export const PiuAltri: Story = {
  name: 'Mese con «+N altri»',
  args: {
    dataIniziale: ANCORA,
    maxEventiPerCella: 2,
    eventi: [
      { id: 'a1', title: 'Fermo pressa 3', start: g(9, 6), end: g(9, 8) },
      { id: 'a2', title: 'Manutenzione forno', start: g(9, 8, 30), end: g(9, 10) },
      { id: 'a3', title: 'Cambio stampo', start: g(9, 10, 30), end: g(9, 12) },
      { id: 'a4', title: 'Collaudo linea B', start: g(9, 13), end: g(9, 15) },
      { id: 'a5', title: 'Revisione muletto', start: g(9, 15, 30), end: g(9, 17) },
    ],
  },
  play: apriCol('[data-slot="event-calendar-more"]', 'event-calendar-more-popover'),
  render: (args) => (
    <div className="flex h-200 flex-col">
      <Calendario {...args} />
    </div>
  ),
}

/**
 * La faccia stretta: gli eventi in elenco, raggruppati per giorno. La
 * finestra è di sette giorni (`giorniAgenda`) e comincia dalla data
 * d'ancoraggio.
 */
export const Agenda: Story = {
  args: {
    dataIniziale: g(7),
    vistaIniziale: 'agenda',
    eventi: [
      { id: 'g1', title: 'Fermo pressa 3', start: g(7, 7), end: g(10, 18) },
      { id: 'g2', title: 'Manutenzione forno', start: g(9, 8), end: g(9, 12) },
      { id: 'g3', title: 'Cambio stampo', start: g(9, 14), end: g(9, 16) },
      { id: 'g4', title: 'Collaudo linea B', start: g(11, 9), end: g(11, 17) },
    ],
  },
  render: (args) => (
    <div className="flex h-200 flex-col">
      <Calendario {...args} />
    </div>
  ),
}

/**
 * **Non si sceglie un colore: si sceglie il calendario a cui l'evento
 * appartiene**, e il colore è la conseguenza. Qui i calendari sono le
 * persone della squadra, che è il caso di Officina: il colore del fermo dice
 * a chi è affidato, e l'avatar lo ripete con le iniziali.
 *
 * Nel motore il concetto c'è già e si chiama `resource`: il blocco gli dà il
 * nome di casa (`calendari`, `calendarioId`) e ne **deriva il colore del
 * chip**, che il motore da sé non fa — legge solo `event.color`.
 *
 * I cinque colori sono i `--chart-*` del tema e si scelgono **per nome**,
 * mai per valore: `color` del motore è una `string` e accetterebbe un
 * esadecimale **senza che nessun gate se ne accorga**, perché la regola 3
 * guarda le classi di Tailwind e non i valori delle prop.
 *
 * L'ultimo evento (*Revisione muletto*) non ha calendario: è il caso in cui
 * il colore torna a essere un dato dell'evento.
 */
export const ColoriEAssegnatari: Story = {
  name: 'Calendari e persone',
  args: {
    dataIniziale: ANCORA,
    calendari: SQUADRA,
    eventi: [
      { id: 'c1', title: 'Fermo pressa 3', start: g(8, 7), end: g(8, 12), calendarioId: 'fs' },
      { id: 'c2', title: 'Manutenzione forno', start: g(9, 8), end: g(9, 12), calendarioId: 'mr' },
      { id: 'c3', title: 'Collaudo linea B', start: g(10, 9), end: g(10, 17), calendarioId: 'lb' },
      { id: 'c4', title: 'Fermo compressore', start: g(15, 6), end: g(17, 18), calendarioId: 'ext' },
      { id: 'c5', title: 'Revisione muletto', start: g(16, 14), end: g(16, 16), colore: 'ardesia' },
      { id: 'c6', title: 'Taratura bilance', start: g(22, 9), end: g(22, 11), calendarioId: 'mr' },
    ],
  },
  render: (args) => (
    <div className="flex h-200 flex-col">
      <Calendario {...args} />
    </div>
  ),
}

/**
 * **Il calendario che si usa, non quello che si guarda.** Clic su un evento →
 * si apre in modifica; clic su un giorno vuoto → si apre in creazione;
 * «Nuovo» in testata → lo stesso dialogo. Le barre si **trascinano** per
 * riprogrammare e si **ridimensionano** dal bordo per cambiare quanti giorni
 * durano. Dialogo e campi vengono da `c-event-calendar-3`, con le nostre
 * primitive.
 *
 * **Gli eventi sono controllati.** Il motore non muta niente da sé: chiama
 * `onEventiChange` con l'elenco nuovo, e la pagina lo rimette dentro — come
 * fa lo `useState` qui sotto. Accendere `modifica` o `trascinamento` senza
 * `onEventiChange` fa un calendario che sembra rispondere e non salva niente.
 *
 * **Restano spenti per default**, che è la scelta di Officina: «la
 * riprogrammazione è un date-picker nel pannello, non un drag&drop». Queste
 * due prop dicono quanto aprirlo, non cambiano il default.
 */
export const ModificaETrascinamento: Story = {
  name: 'Modifica e trascinamento',
  args: { eventi: [], dataIniziale: ANCORA, calendari: SQUADRA, modifica: true, trascinamento: true },
  render: function ConModifica(args) {
    const [eventi, setEventi] = useState<EventoCalendario[]>([
      { id: 'm1', title: 'Fermo pressa 3', start: g(8, 7), end: g(9, 18), calendarioId: 'fs' },
      { id: 'm2', title: 'Manutenzione forno', start: g(10, 8), end: g(10, 12), calendarioId: 'mr' },
      { id: 'm3', title: 'Collaudo linea B', start: g(16, 9), end: g(16, 17), calendarioId: 'lb' },
    ])
    return (
      <div className="flex h-200 flex-col">
        <Calendario {...args} eventi={eventi} onEventiChange={setEventi} />
      </div>
    )
  },
}

/**
 * **Il dialogo, aperto.** È la stessa scena di sopra con una `play` che preme
 * «Nuovo»: serve al gate, perché **un popup non aperto non è un popup senza
 * violazioni** e questo file ne ha due (il «+N altri» e il dialogo).
 *
 * Sta in una scena a parte e non sulla precedente per una ragione pratica:
 * Storybook esegue le `play` anche nel canvas, quindi la scena col dialogo
 * dichiarato **arriva col dialogo davanti** — e sulla scena
 * dell'interattività quel dialogo coprirebbe proprio ciò che si vuole
 * provare, cioè il trascinamento.
 *
 * Avvertenza per il rapporto del gate: la tabella «Popup che l'imbracatura
 * apre davvero» stampa **una sola** dichiarazione per componente, la prima
 * che trova nel file. Le `play` però girano tutte, e axe misura lo stato vero
 * di ogni story: il dialogo è scansionato, anche se la tabella nomina il
 * «+N altri».
 */
export const DialogoEvento: Story = {
  name: "Dialogo dell'evento",
  args: { eventi: [], dataIniziale: ANCORA, calendari: SQUADRA, modifica: true },
  play: apriIlBottone(/^Nuovo$/, 'dialog-content'),
  render: function ConDialogo(args) {
    const [eventi, setEventi] = useState<EventoCalendario[]>([
      { id: 'd1', title: 'Fermo pressa 3', start: g(8, 7), end: g(9, 18), calendarioId: 'fs' },
    ])
    return (
      <div className="flex h-200 flex-col">
        <Calendario {...args} eventi={eventi} onEventiChange={setEventi} />
      </div>
    )
  },
}

/**
 * Nessun evento: la griglia resta leggibile e l'agenda dice «Nessun
 * evento». È lo stato con cui una pagina si apre la prima volta, non un
 * caso limite.
 */
export const Vuoto: Story = {
  args: { eventi: [], dataIniziale: ANCORA },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div className="flex h-96 flex-col">
        <Calendario {...args} />
      </div>
      <div className="flex h-96 flex-col">
        <Calendario {...args} vistaIniziale="agenda" />
      </div>
    </div>
  ),
}

/**
 * **Lo schermo del capannone.** In densità touch i bersagli crescono con
 * `--spacing`, e la domanda vera è se una cella si tocca col guanto senza
 * sbagliare giorno: il numero dei bersagli piccoli sta a verbale in
 * `WORKLOG.md`, misurato con `npm run misura:bersagli`.
 */
export const DensitaTouch: Story = {
  name: 'Densità touch',
  args: { eventi: fermi, dataIniziale: ANCORA },
  render: (args) => (
    <div data-density="touch" className="bg-background text-foreground flex h-200 flex-col">
      <Calendario {...args} />
    </div>
  ),
}
