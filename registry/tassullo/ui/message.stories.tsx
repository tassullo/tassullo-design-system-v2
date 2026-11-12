import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { CopyIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/registry/tassullo/ui/avatar'
import { Bubble, BubbleContent } from '@/registry/tassullo/ui/bubble'
import { Button } from '@/registry/tassullo/ui/button'
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from '@/registry/tassullo/ui/message'

/**
 * La riga di un messaggio in una conversazione: chi scrive, da che parte, e
 * cosa c'è sopra e sotto il testo. Il testo vero sta in un `bubble`.
 *
 * **Quando sì, quando no.** Si usa per una conversazione fra una persona e
 * un assistente, o fra persone, letta dall'alto in basso. Uno storico di
 * risposte a una pratica, con autore e data e senza distinzione di parte, è
 * `tassullo-filo-messaggi`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/message
 * ```
 *
 * **Le parti.** `Message` è la riga, con `align`: `start` (di serie, a
 * sinistra) per chi risponde, `end` per chi legge. Dentro: `MessageAvatar`,
 * `MessageContent` con il `bubble`, e attorno al fumetto `MessageHeader` (chi,
 * quando) e `MessageFooter` (le azioni). `MessageGroup` tiene vicine più righe.
 *
 * **Regole d'uso.**
 *
 * - Le azioni del piede sono bottoni-icona `ghost` con un nome: «Copia la
 *   risposta», «Segna la risposta come utile», «Segna la risposta come non
 *   utile». Con più risposte nella pagina il nome dice quale: «Copia la
 *   risposta 2», o i bottoni di risposte diverse hanno tutti lo stesso nome.
 * - L'ora nell'intestazione si scrive `hh:mm`, nell'ora italiana; con la data
 *   davanti se il messaggio non è di oggi.
 *
 * **Tastiera e accessibilità.** Le azioni del piede si raggiungono col `Tab`
 * nell'ordine in cui si leggono. La riga non è interattiva da sé.
 */
const meta = {
  title: 'Primitive/Message',
  component: Message,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Message>

export default meta
type Story = StoryObj<typeof meta>

/** Una domanda a destra e la risposta a sinistra. */
export const Predefinito: Story = {
  render: () => (
    <MessageGroup className="max-w-xl">
      <Message align="end">
        <MessageContent>
          <Bubble variant="default">
            <BubbleContent>
              Che primer serve sotto una membrana su calcestruzzo nuovo?
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageContent>
          <Bubble variant="ghost">
            <BubbleContent>
              Un primer bituminoso a solvente, steso quando il getto ha almeno
              28 giorni e la superficie è asciutta al tatto.
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
}

/**
 * Con avatar, intestazione e piede: chi scrive e quando, sopra; le azioni
 * sulla risposta, sotto.
 */
export const ConAvatarEAzioni: Story = {
  render: () => (
    <MessageGroup className="max-w-xl">
      <Message align="end">
        <MessageAvatar>
          <Avatar size="sm">
            <AvatarFallback>SB</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Stefano Bertolini · 14:30</MessageHeader>
          <Bubble variant="default">
            <BubbleContent>
              Quanto deve sormontare il telo sul risvolto verticale?
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar className="bg-transparent">
          <span className="marchio-t size-6 text-accent-ink" aria-hidden />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Assistente · 14:30</MessageHeader>
          <Bubble variant="ghost">
            <BubbleContent>
              Almeno 20 cm sopra il piano finito della copertura, fissato in
              testa con un profilo e sigillato.
            </BubbleContent>
          </Bubble>
          <MessageFooter className="gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Copia la risposta">
              <CopyIcon />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Segna la risposta come utile">
              <ThumbsUpIcon />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Segna la risposta come non utile">
              <ThumbsDownIcon />
            </Button>
          </MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
}

function Risposta({ n, testo }: { n: number; testo: string }) {
  return (
    <Message>
      <MessageContent>
        <Bubble variant="ghost">
          <BubbleContent>{testo}</BubbleContent>
        </Bubble>
        <MessageFooter className="gap-1">
          <Button variant="ghost" size="icon-sm" aria-label={`Copia la risposta ${n}`}>
            <CopyIcon />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label={`Segna la risposta ${n} come utile`}>
            <ThumbsUpIcon />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label={`Segna la risposta ${n} come non utile`}>
            <ThumbsDownIcon />
          </Button>
        </MessageFooter>
      </MessageContent>
    </Message>
  )
}

/**
 * Più risposte con le loro azioni: il nome di ogni bottone dice a quale
 * risposta appartiene, così nessuno è uguale a un altro.
 */
export const PiuRisposteConAzioni: Story = {
  render: () => (
    <MessageGroup className="max-w-xl">
      <Risposta
        n={1}
        testo="Un primer bituminoso a solvente, steso quando il getto ha almeno 28 giorni."
      />
      <Risposta
        n={2}
        testo="Almeno 20 cm sopra il piano finito della copertura, fissato in testa con un profilo."
      />
    </MessageGroup>
  ),
  play: async ({ canvasElement }) => {
    const nomi = [...canvasElement.querySelectorAll('button')].map((b) => b.getAttribute('aria-label'))
    await expect(nomi).toHaveLength(6)
    await expect(new Set(nomi).size, `nomi uguali: ${nomi.join(' | ')}`).toBe(nomi.length)
  },
}
