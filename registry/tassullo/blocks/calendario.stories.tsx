import type { Meta, StoryObj } from '@storybook/react-vite'

import { apriCol } from '@/prove/apri'
import {
  Calendario,
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

const fermi: EventoCalendario[] = [
  { id: 'f1', title: 'Fermo pressa 3', start: g(7, 7), end: g(10, 18) },
  { id: 'f2', title: 'Manutenzione forno', start: g(9, 8), end: g(9, 12) },
  { id: 'f3', title: 'Collaudo linea B', start: g(15, 9), end: g(15, 17) },
  { id: 'f4', title: 'Revisione muletto', start: g(23, 14), end: g(23, 16) },
]

/**
 * La griglia del mese come la vede un'app: qualche fermo sparso, uno che
 * dura quattro giorni.
 */
export const Mese: Story = {
  args: { eventi: fermi, dataIniziale: ANCORA },
  render: (args) => (
    <div className="flex h-128 flex-col">
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
      { id: 'p1', title: 'Fermo pressa 3 — guarnizioni', start: g(7, 6), end: g(10, 22) },
      { id: 'p2', title: 'Fermo forno A — refrattario', start: g(8, 6), end: g(12, 22) },
      { id: 'p3', title: 'Ferie squadra manutenzione', start: g(9, 0), end: g(9, 23, 59), allDay: true },
      { id: 'p4', title: 'Collaudo linea B', start: g(14, 6), end: g(16, 18) },
      { id: 'p5', title: 'Fermo compressore', start: g(15, 6), end: g(18, 18) },
    ],
  },
  render: (args) => (
    <div className="flex h-192 flex-col">
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
    <div className="flex h-128 flex-col">
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
    <div className="flex h-128 flex-col">
      <Calendario {...args} />
    </div>
  ),
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
    <div data-density="touch" className="bg-background text-foreground flex h-128 flex-col">
      <Calendario {...args} />
    </div>
  ),
}
