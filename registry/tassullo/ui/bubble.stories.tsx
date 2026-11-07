import type { Meta, StoryObj } from '@storybook/react-vite'

import { Bubble, BubbleContent, BubbleGroup } from '@/registry/tassullo/ui/bubble'
import { Message, MessageContent } from '@/registry/tassullo/ui/message'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/registry/tassullo/ui/table'

/**
 * La superficie di un messaggio: il fumetto che contiene il testo di chi
 * scrive. Da sola non sa chi parla: lo dice `message`, che la mette a sinistra
 * o a destra.
 *
 * **Quando sì, quando no.** Si usa dentro `message`, in una conversazione. Un
 * avviso nella pagina è `alert`; un riquadro di contenuto è `card`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/bubble
 * ```
 *
 * **Varianti.** `variant`: `default` (arancio pieno), `secondary`, `muted`,
 * `tinted` (arancio tenue), `outline`, `ghost` (senza fondo, a tutta riga) e
 * `destructive` (un messaggio non arrivato). `align` la porta a destra anche
 * fuori da un `message`. `BubbleGroup` impila più fumetti dello stesso autore;
 * `BubbleContent` accetta `render` per diventare un bottone o un collegamento.
 *
 * **Regole d'uso.**
 *
 * - In una conversazione con un assistente la domanda di chi scrive è
 *   `default`, a destra, e la risposta è `ghost`, senza fumetto e a tutta
 *   riga. `secondary` è per le conversazioni fra persone.
 * - Un fumetto colorato è largo al massimo quattro quinti della riga. Una
 *   risposta lunga, con titoli, elenchi o tabelle, usa `ghost`, che prende
 *   tutta la riga: una tabella larga scorre di lato dentro il messaggio, e la
 *   pagina resta ferma. Il riquadro che scorre si raggiunge col `Tab`: la
 *   tabella sta dentro un elemento con `role="region"`, un nome e
 *   `tabIndex={0}`, come nella scena qui sotto.
 * - Il contenuto è un nodo qualunque: un testo, oppure il markdown già reso
 *   dall'app.
 * - Un messaggio non arrivato usa `destructive`, che ha il colore del testo
 *   d'errore leggibile in entrambe le modalità.
 */
const meta = {
  title: 'Primitive/Bubble',
  component: Bubble,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Bubble>

export default meta
type Story = StoryObj<typeof meta>

const VARIANTI = [
  'default',
  'secondary',
  'muted',
  'tinted',
  'outline',
  'ghost',
  'destructive',
] as const

/** Le sette varianti, una per riga, con lo stesso testo. */
export const Varianti: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-4">
      {VARIANTI.map((variant) => (
        <div key={variant} className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{variant}</span>
          <Bubble variant={variant}>
            <BubbleContent>
              Qual è la sovrapposizione minima dei teli sulla copertura piana?
            </BubbleContent>
          </Bubble>
        </div>
      ))}
    </div>
  ),
}

/**
 * Più fumetti dello stesso autore, uno sotto l'altro, con `BubbleGroup`: il
 * gruppo li tiene vicini e a destra.
 */
export const Gruppo: Story = {
  render: () => (
    <Message align="end" className="max-w-xl">
      <MessageContent>
        <BubbleGroup>
          <Bubble variant="default">
            <BubbleContent>Ho allegato la scheda della membrana.</BubbleContent>
          </Bubble>
          <Bubble variant="default">
            <BubbleContent>Va bene anche sotto i 5 °C, se la posa è a fiamma?</BubbleContent>
          </Bubble>
        </BubbleGroup>
      </MessageContent>
    </Message>
  ),
}

/**
 * Una risposta lunga in `ghost`: prende tutta la riga, e la tabella più larga
 * del messaggio scorre di lato dentro di lui. Col `Tab` si arriva sulla
 * tabella e le frecce la scorrono.
 */
export const RispostaLunga: Story = {
  render: () => (
    <Message className="max-w-xl">
      <MessageContent>
        <Bubble variant="ghost">
          <BubbleContent className="flex flex-col gap-3">
            <p>
              Per una copertura piana con due strati di membrana armata, le sovrapposizioni minime
              sono queste:
            </p>
            <div
              role="region"
              aria-label="Sovrapposizioni minime"
              tabIndex={0}
              className="overflow-x-auto rounded-md border border-transparent outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30 *:data-[slot=table-container]:overflow-visible"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Strato</TableHead>
                    <TableHead>Longitudinale</TableHead>
                    <TableHead>Di testa</TableHead>
                    <TableHead>Posa</TableHead>
                    <TableHead>Temperatura minima</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Primo strato</TableCell>
                    <TableCell className="tabular-nums">80 mm</TableCell>
                    <TableCell className="tabular-nums">150 mm</TableCell>
                    <TableCell>A fiamma</TableCell>
                    <TableCell className="tabular-nums">5 °C</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Secondo strato</TableCell>
                    <TableCell className="tabular-nums">100 mm</TableCell>
                    <TableCell className="tabular-nums">150 mm</TableCell>
                    <TableCell>A fiamma, sfalsato di mezzo telo</TableCell>
                    <TableCell className="tabular-nums">5 °C</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <p>Sotto i 5 °C la scheda tecnica chiede di rimandare la posa.</p>
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  ),
}

// Per gli occhi: nel canvas aperto per URL la finestra resta larga quanto
// quella vera, quindi qui il gate non misura la forma a 375px.
/** Lo stesso messaggio a 375px: il testo va a capo, la tabella scorre. */
export const RispostaLungaTelefono: Story = {
  ...RispostaLunga,
  globals: { viewport: { value: 'telefono', isRotated: false } },
}
