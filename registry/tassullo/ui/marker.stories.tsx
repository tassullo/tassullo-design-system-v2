import type { Meta, StoryObj } from '@storybook/react-vite'
import { HistoryIcon } from 'lucide-react'

import { Bubble, BubbleContent } from '@/registry/tassullo/ui/bubble'
import { Marker, MarkerContent, MarkerIcon } from '@/registry/tassullo/ui/marker'
import { Message, MessageContent, MessageGroup } from '@/registry/tassullo/ui/message'

/**
 * Una riga di notizia dentro una conversazione, che non è un messaggio di
 * nessuno: la data che separa due giorni, «Conversazione ripresa», un
 * evento.
 *
 * **Quando sì, quando no.** Si usa fra i messaggi di una conversazione. Una
 * linea che separa due parti di una pagina è `separator`; ciò che
 * l'assistente sta facendo prima di rispondere è `trace`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/marker
 * ```
 *
 * **Varianti.** `variant`: `default` (testo con un'icona), `separator` (il
 * testo in mezzo, con una linea per parte, per la data) e `border` (una
 * linea sotto). `MarkerIcon` e `MarkerContent` sono l'icona e il testo;
 * `render` lo fa diventare un altro elemento, per esempio un `li`.
 *
 * **Regole d'uso.**
 *
 * - La data si scrive per esteso, «Oggi», «Ieri» o «Lunedì 3 novembre», non
 *   in cifre.
 * - Un collegamento dentro il testo è sottolineato da sé: si scrive un `a`
 *   e basta.
 *
 * **Tastiera e accessibilità.** Non è interattivo, salvo un collegamento nel
 * testo. L'icona è nascosta ai lettori di schermo: il senso sta nel testo.
 */
const meta = {
  title: 'Primitive/Marker',
  component: Marker,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Marker>

export default meta
type Story = StoryObj<typeof meta>

/** Le tre varianti, una sotto l'altra. */
export const Varianti: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-6">
      <Marker>
        <MarkerIcon>
          <HistoryIcon />
        </MarkerIcon>
        <MarkerContent>Conversazione ripresa</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Oggi</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerContent>
          Risposte basate sui documenti del <a href="#capitolato">capitolato</a>
        </MarkerContent>
      </Marker>
    </div>
  ),
}

/** Fra i messaggi: la data separa i due giorni della stessa conversazione. */
export const InUnaConversazione: Story = {
  render: () => (
    <MessageGroup className="max-w-xl">
      <Marker variant="separator">
        <MarkerContent>Ieri</MarkerContent>
      </Marker>
      <Message align="end">
        <MessageContent>
          <Bubble>
            <BubbleContent>Che primer serve sotto una membrana su calcestruzzo nuovo?</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageContent>
          <Bubble variant="ghost">
            <BubbleContent>
              Un primer bituminoso a solvente, steso quando il getto ha almeno 28 giorni.
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Marker variant="separator">
        <MarkerContent>Oggi</MarkerContent>
      </Marker>
      <Message align="end">
        <MessageContent>
          <Bubble>
            <BubbleContent>E se il getto ha solo dieci giorni?</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
}
