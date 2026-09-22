import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/registry/tassullo/ui/accordion'

/**
 * Sezioni che si aprono e si chiudono una per una: tiene in pagina un testo
 * lungo diviso in parti, e chi legge apre solo quelle che cerca.
 *
 * **Quando sì, quando no.** Per contenuti di consultazione — campo di impiego,
 * modalità di posa, norme — in cui si cerca una parte e si saltano le altre.
 * Se le parti sono viste alternative della stessa cosa e se ne guarda una alla
 * volta, si usano le `tabs`. Per un solo blocco che si apre e si chiude,
 * `collapsible`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/accordion
 * ```
 *
 * **Opzioni.** Di base più sezioni possono stare aperte insieme; con
 * `multiple={false}` aprirne una chiude l'altra. `defaultValue` dice quali
 * sezioni sono aperte all'arrivo; `disabled` su un `AccordionItem` lo spegne.
 *
 * **Regole d'uso.** L'accordion vuole una larghezza definita — `w-96`, oppure
 * `w-full` dentro un contenitore che ce l'ha. In un contenitore che si stringe
 * sul contenuto, aprire una sezione allarga il gruppo e fa slittare la pagina:
 * `w-full` su un contenitore a larghezza indefinita non basta.
 *
 * **Tastiera.** Ogni intestazione è un bottone: `Tab` le attraversa tutte,
 * `Invio` e `Spazio` aprono e chiudono. Le frecce non spostano il fuoco fra le
 * sezioni, che sono indipendenti e non una lista. L'indicatore non ruota:
 * cambia forma, freccia in giù da chiuso e in su da aperto.
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
 * Con `multiple={false}`: aprire una sezione chiude quella aperta, la forma
 * classica «a fisarmonica».
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

/**
 * Una sezione già aperta all'arrivo, con `defaultValue`.
 */
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

/**
 * Una sezione disattivata: l'intestazione non risponde e non prende il fuoco.
 */
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
