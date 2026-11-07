import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { waitFor } from 'storybook/test'

import { scorriECambiaDensita } from '@/prove/scorri-densita'

import { Bubble, BubbleContent } from '@/registry/tassullo/ui/bubble'
import { Button } from '@/registry/tassullo/ui/button'
import { Message, MessageContent } from '@/registry/tassullo/ui/message'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/registry/tassullo/ui/message-scroller'
import { Spinner } from '@/registry/tassullo/ui/spinner'

/**
 * Il riquadro che scorre di una conversazione. Decide quando muoversi e
 * quando stare fermo: segue una risposta che cresce solo se chi legge è in
 * fondo, e lo lascia dov'è se è risalito a rileggere.
 *
 * **Quando sì, quando no.** Si usa per una conversazione in cui i messaggi
 * arrivano mentre la si legge, come le risposte di un assistente. Un elenco
 * che scorre e basta, senza niente che arriva, è un `overflow-auto`; un
 * riquadro senza controlli dentro è `scroll-area`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/message-scroller
 * ```
 *
 * ```tsx
 * <MessageScrollerProvider autoScroll defaultScrollPosition="last-anchor">
 *   <MessageScroller>
 *     <MessageScrollerViewport aria-label="Conversazione">
 *       <MessageScrollerContent>
 *         {messaggi.map((m) => (
 *           <MessageScrollerItem key={m.id} messageId={m.id} scrollAnchor={m.autore === 'persona'}>
 *             <Message … />
 *           </MessageScrollerItem>
 *         ))}
 *       </MessageScrollerContent>
 *     </MessageScrollerViewport>
 *     <MessageScrollerButton />
 *   </MessageScroller>
 * </MessageScrollerProvider>
 * ```
 *
 * **Le parti.** `MessageScrollerProvider` tiene lo stato: `autoScroll` per
 * seguire la risposta, `defaultScrollPosition` per dove si apre (`end`,
 * `start` o `last-anchor`, l'ultima domanda con la risposta sotto),
 * `scrollPreviousItemPeek` per quanto del turno prima resta in vista.
 * `MessageScroller` è la cornice e riempie il genitore, che deve avere
 * un'altezza. `MessageScrollerItem` avvolge ogni riga: con `scrollAnchor` la
 * riga apre un turno e, quando arriva, va in alto, così la risposta scorre
 * sotto. `MessageScrollerButton` riporta in fondo e riprende a seguire. Gli
 * hook `useMessageScroller` (`scrollToEnd`, `scrollToMessage`),
 * `useMessageScrollerScrollable` e `useMessageScrollerVisibility` servono a
 * comandarlo dall'app.
 *
 * **Regole d'uso.**
 *
 * - Il riquadro ha un nome: `aria-label="Conversazione"` sul viewport. Senza,
 *   il nome di serie è in inglese.
 * - Ogni figlio diretto del contenuto è un `MessageScrollerItem`: anche lo
 *   stato «in corso» o un separatore, o il riquadro non sa misurarli.
 * - Una conversazione salvata si riapre con `last-anchor`, non in fondo.
 *
 * **Tastiera e accessibilità.** Il riquadro si raggiunge col `Tab` e scorre
 * con le frecce e con `Pag↑`/`Pag↓`; ogni movimento di chi legge ferma il
 * riquadro, che riprende a seguire solo tornando in fondo o col bottone. Il
 * contenuto è un `log`: si annunciano le righe nuove, non ogni pezzo della
 * risposta che cresce.
 */
const meta = {
  title: 'Primitive/Message Scroller',
  component: MessageScroller,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MessageScroller>

export default meta
type Story = StoryObj<typeof meta>

type Riga = { id: string; autore: 'persona' | 'assistente'; testo: string }

const SALVATA: Riga[] = [
  {
    id: 'd1',
    autore: 'persona',
    testo: 'Che primer serve sotto una membrana su calcestruzzo nuovo?',
  },
  {
    id: 'r1',
    autore: 'assistente',
    testo:
      'Un primer bituminoso a solvente, steso quando il getto ha almeno 28 giorni e la superficie è asciutta al tatto. Sul calcestruzzo fresco l’umidità che risale stacca la membrana nei mesi caldi.',
  },
  {
    id: 'd2',
    autore: 'persona',
    testo: 'E se il getto ha solo dieci giorni?',
  },
  {
    id: 'r2',
    autore: 'assistente',
    testo:
      'Si aspetta, oppure si usa un primer all’acqua dichiarato per supporti umidi, e si misura l’umidità prima della posa: sopra il 4% la scheda tecnica non garantisce l’adesione. In quel caso conviene una barriera al vapore sotto il primo strato.',
  },
  {
    id: 'd3',
    autore: 'persona',
    testo: 'Quanto deve sormontare il telo sul risvolto verticale?',
  },
  {
    id: 'r3',
    autore: 'assistente',
    testo:
      'Almeno 20 cm sopra il piano finito della copertura, fissato in testa con un profilo e sigillato. Negli angoli si mette prima una pezza di rinforzo, poi il telo.',
  },
]

const RISPOSTA =
  'Per una copertura piana con due strati di membrana armata le sovrapposizioni minime sono di 80 mm in longitudinale e 150 mm di testa sul primo strato, 100 e 150 mm sul secondo. Il secondo strato si posa sfalsato di mezzo telo rispetto al primo, così le giunzioni non cadono una sopra l’altra. La posa a fiamma va fatta con il bruciatore a gas, scaldando insieme il telo e il supporto finché la mescola fa il cordolo lungo il bordo: se il cordolo non esce, la saldatura non è completa. Sotto i 5 °C la scheda tecnica chiede di rimandare la posa, perché la mescola si raffredda prima di saldarsi. Sulle sovrapposizioni di testa si taglia l’angolo del telo sottostante a 45 gradi, per non lasciare un canale in cui l’acqua possa infilarsi. A fine posa si controllano tutte le giunzioni con una cazzuola a punta tonda, passandola lungo il bordo: dove entra, si riapre e si salda di nuovo. Sui risvolti verticali il telo sale almeno 20 cm sopra il piano finito, con una pezza di rinforzo negli angoli posata prima del telo e risvoltata per 10 cm su ogni lato. In testa il risvolto si ferma con un profilo metallico fissato ogni 20 cm e sigillato con un mastice compatibile con la mescola. Attorno ai bocchettoni di scarico si posa un collare prefabbricato, saldato sul primo strato e coperto dal secondo, senza tagliare il telo a raso del foro. Prima della posa del secondo strato conviene una prova di tenuta con acqua sulle zone più basse della copertura, lasciata per almeno ventiquattro ore.'

function Riga({ riga }: { riga: Riga }) {
  const persona = riga.autore === 'persona'
  return (
    <Message align={persona ? 'end' : 'start'}>
      <MessageContent>
        <Bubble variant={persona ? 'default' : 'ghost'}>
          <BubbleContent>{riga.testo}</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}

function Conversazione({ righe, inCorso }: { righe: Riga[]; inCorso?: boolean }) {
  return (
    <MessageScroller>
      <MessageScrollerViewport aria-label="Conversazione">
        <MessageScrollerContent className="p-4">
          {righe.map((riga) => (
            <MessageScrollerItem
              key={riga.id}
              messageId={riga.id}
              scrollAnchor={riga.autore === 'persona'}
            >
              <Riga riga={riga} />
            </MessageScrollerItem>
          ))}
          {inCorso && (
            <MessageScrollerItem>
              <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner />
                Sto rispondendo…
              </div>
            </MessageScrollerItem>
          )}
        </MessageScrollerContent>
      </MessageScrollerViewport>
      <MessageScrollerButton />
    </MessageScroller>
  )
}

/**
 * Una conversazione salvata, riaperta con `last-anchor`: si vede l'ultima
 * domanda con la risposta sotto, non il fondo nudo. Risalendo compare il
 * bottone che riporta in fondo.
 */
export const ConversazioneSalvata: Story = {
  render: () => (
    <div className="h-96 max-w-xl rounded-lg border">
      <MessageScrollerProvider defaultScrollPosition="last-anchor">
        <Conversazione righe={SALVATA} />
      </MessageScrollerProvider>
    </div>
  ),
}

function RispostaInArrivoScena() {
  const [righe, setRighe] = useState<Riga[]>(SALVATA)
  const [parole, setParole] = useState<number | null>(null)
  const tutte = RISPOSTA.split(' ')

  useEffect(() => {
    if (parole === null || parole >= tutte.length) return
    const t = window.setTimeout(() => setParole(parole + 2), 80)
    return () => window.clearTimeout(t)
  }, [parole, tutte.length])

  const finita = parole !== null && parole >= tutte.length
  const visibili =
    parole === null
      ? righe
      : [...righe, { id: 'r4', autore: 'assistente' as const, testo: tutte.slice(0, parole).join(' ') }]

  function chiedi() {
    setRighe([
      ...SALVATA,
      { id: 'd4', autore: 'persona', testo: 'Quali sono le sovrapposizioni minime sui due strati?' },
    ])
    setParole(0)
  }

  function ferma() {
    setRighe(visibili)
    setParole(null)
  }

  return (
    <div className="flex h-96 max-w-xl flex-col gap-2">
      <div className="min-h-0 flex-1 rounded-lg border">
        <MessageScrollerProvider autoScroll defaultScrollPosition="last-anchor">
          <Conversazione righe={visibili} inCorso={parole !== null && !finita} />
        </MessageScrollerProvider>
      </div>
      <div className="flex gap-2">
        <Button onClick={chiedi} disabled={parole !== null && !finita}>
          Fai la domanda
        </Button>
        <Button variant="outline" onClick={ferma} disabled={parole === null || finita}>
          Ferma
        </Button>
      </div>
    </div>
  )
}

/**
 * Una risposta che arriva a pezzi, con `autoScroll`. «Fai la domanda» la
 * porta in alto e la risposta cresce sotto; risalendo mentre arriva, il
 * riquadro resta fermo e il bottone in basso riporta in fondo, dove riprende
 * a seguire.
 */
export const RispostaInArrivo: Story = {
  render: () => <RispostaInArrivoScena />,
}

// Per gli occhi: nel canvas aperto per URL la finestra resta larga quanto
// quella vera, quindi qui il gate non misura la forma a 375px.
/** La stessa scena a 375px: la domanda e la risposta vanno a capo, il bottone resta in mezzo. */
export const RispostaInArrivoTelefono: Story = {
  ...RispostaInArrivo,
  globals: { viewport: { value: 'telefono', isRotated: false } },
}

// Scena di misura della passata WebKit: il riquadro reagisce ai
// `ResizeObserver` e ai fotogrammi come le righe virtualizzate, e il loro ciclo
// di aggiornamenti esisteva solo in WebKit, scorrendo e cambiando densità. La
// prova fa la domanda, poi scorre e cambia densità mentre la risposta arriva.
// Fuori dalla barra e da Docs; le passate di axe la eseguono come ogni scena.
export const RispostaInArrivoProva: Story = {
  ...RispostaInArrivo,
  name: 'Risposta in arrivo, scorre e cambia densità',
  tags: ['!dev', '!autodocs', 'webkit'],
  play: async (contesto) => {
    const bottone = await waitFor(() => {
      const b = [...contesto.canvasElement.querySelectorAll('button')].find(
        (el) => el.textContent === 'Fai la domanda',
      )
      if (!b) throw new Error('manca «Fai la domanda»')
      return b
    })
    bottone.click()
    await scorriECambiaDensita(contesto)
  },
}
