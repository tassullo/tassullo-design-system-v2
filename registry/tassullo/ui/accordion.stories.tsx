import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/registry/tassullo/ui/accordion'

/**
 * `accordion.tsx` è identico all'originale: nessuna stringa ri-stilata.
 *
 * **Un avvertimento che vale per il prossimo aggiornamento di shadcn**: il
 * gate lo marca `◌`, perché l'originale è un **template a segnaposto d'icona**
 * (`<IconPlaceholder>`) che la CLI risolve a `add` sulla libreria dichiarata
 * in `components.json` — qui Lucide. Il confronto di forma non dice nulla su
 * questo file, quindi quando esce una versione nuova **va riletto a mano**.
 * È lo stesso caso di `checkbox`, `select`, `dialog` e degli altri sette.
 *
 * Il chevron non è uno che ruota: sono **due icone**, `ChevronDown` e
 * `ChevronUp`, che si scambiano su `aria-expanded`. Non è un dettaglio
 * estetico — chi legge lo schermo da vicino distingue meglio due forme che
 * una forma ruotata a metà animazione.
 *
 * **La stessa trappola d'uso delle `tabs`, e qui è più vistosa** (misurata
 * insieme, su segnalazione di Francesco): in un contenitore che si stringe
 * sul contenuto, aprire una sezione allarga il gruppo, perché il testo del
 * pannello è più lungo dell'intestazione. Misurato su questa story prima
 * della correzione: la radice passava da **201 a 576px** al primo clic e
 * l'accordion slittava di **188px** — un salto che si vede benissimo.
 *
 * Non è un difetto del componente e **`w-full` non lo cura**: su un
 * contenitore a larghezza indefinita è circolare. Serve una larghezza
 * definita, qui `w-96`, che sta sulla scala di `--spacing` e segue la
 * densità. Con quella lo slittamento è **0px** su tutte le sezioni.
 *
 * Da tastiera: ogni intestazione è un bottone, `Tab` li attraversa tutti,
 * `Invio`/`Spazio` aprono. Base UI non aggiunge scorciatoie con le frecce, e
 * va bene così: sono sezioni indipendenti, non una lista da percorrere.
 */
const meta = {
  title: 'Primitive/Accordion',
  component: Accordion,
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

const sezioni = [
  {
    titolo: 'Campo di impiego',
    testo:
      'Impermeabilizzazione di coperture piane e inclinate, in sistema monostrato o bistrato, su supporto in calcestruzzo o lamiera grecata.',
  },
  {
    titolo: 'Modalità di posa',
    testo:
      'A fiamma, con sovrapposizione minima di 100 mm sui lati lunghi e 150 mm sulle testate. Temperatura del supporto non inferiore a 5 °C.',
  },
  {
    titolo: 'Norme di riferimento',
    testo:
      'UNI EN 13707 per le membrane bituminose armate; UNI 11333 per i sistemi di impermeabilizzazione continui.',
  },
]

export const Predefinito: Story = {
  render: () => (
    <Accordion className="w-96">
      {sezioni.map((s) => (
        <AccordionItem key={s.titolo} value={s.titolo}>
          <AccordionTrigger>{s.titolo}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{s.testo}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
}

/**
 * Con `multiple={false}`: aprire una sezione chiude l'altra. È la forma
 * classica «a fisarmonica», e il predefinito di Base UI è invece il contrario.
 */
export const UnaAllaVolta: Story = {
  render: () => (
    <Accordion multiple={false} className="w-96">
      {sezioni.map((s) => (
        <AccordionItem key={s.titolo} value={s.titolo}>
          <AccordionTrigger>{s.titolo}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{s.testo}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
}

/** Una sezione già aperta all'arrivo, con `defaultValue`. */
export const GiaAperta: Story = {
  render: () => (
    <Accordion defaultValue={['Modalità di posa']} className="w-96">
      {sezioni.map((s) => (
        <AccordionItem key={s.titolo} value={s.titolo}>
          <AccordionTrigger>{s.titolo}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{s.testo}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
}

/** Una sezione disattivata: il grilletto non risponde e non prende il fuoco. */
export const Disattivata: Story = {
  render: () => (
    <Accordion className="w-96">
      <AccordionItem value="a">
        <AccordionTrigger>Campo di impiego</AccordionTrigger>
        <AccordionContent className="text-muted-foreground">{sezioni[0].testo}</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b" disabled>
        <AccordionTrigger>Certificazioni (in aggiornamento)</AccordionTrigger>
        <AccordionContent className="text-muted-foreground">Non disponibile.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
