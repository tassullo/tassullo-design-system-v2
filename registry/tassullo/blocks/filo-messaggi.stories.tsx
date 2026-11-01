import type { Meta, StoryObj } from '@storybook/react-vite'

import { FiloMessaggi, type MessaggioFilo } from '@/registry/tassullo/blocks/filo-messaggi'
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/tassullo/ui/card'

/**
 * Un filo di messaggi, dal più vecchio al più recente: per ognuno chi l'ha
 * scritto, quando, e il testo com'è stato scritto, a capo compresi.
 *
 * **Quando sì, quando no.** Si usa per le risposte a una richiesta, le note
 * scambiate su una pratica, i commenti a un documento. Lo storico delle
 * revisioni di un documento, con i loro stati, è
 * `tassullo-version-timeline`; le attività recenti di una pagina, che vanno
 * dalla più nuova, sono un elenco della dashboard.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-filo-messaggi
 * ```
 *
 * ```tsx
 * <FiloMessaggi messaggi={risposte} vuoto="Nessuna risposta ancora" />
 * ```
 *
 * **Le prop.**
 *
 * - `messaggi`: ognuno ha `id`, `autore`, `testo` e `data`, una `Date` o un
 *   istante ISO con il fuso. Possono arrivare in qualunque ordine: il filo li
 *   mette dal più vecchio.
 * - `vuoto`, di serie «Nessun messaggio»: la frase quando non ce n'è nessuno.
 *
 * **Regole d'uso.**
 *
 * - La data e l'ora si scrivono come nel resto del design system,
 *   `gg/mm/aaaa, hh:mm`, sempre nell'ora italiana.
 * - Il testo si mostra intero: non si tronca, e un indirizzo o un
 *   identificativo lungo va a capo dove serve invece di uscire dal riquadro.
 * - Il testo è testo semplice: gli a capo restano, la formattazione no.
 *
 * **Tastiera e accessibilità.** Il filo è un elenco, e ogni messaggio una sua
 * voce; la data è un elemento `time` con l'istante esatto.
 */
const meta = {
  title: 'Blocchi/Filo di messaggi',
  component: FiloMessaggi,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FiloMessaggi>

export default meta
type Story = StoryObj<typeof meta>

const MESSAGGI: MessaggioFilo[] = [
  {
    id: 3,
    autore: 'Stefano Bertolini',
    testo:
      'Corretto. Il listino si apre di nuovo anche con i filtri attivi; la correzione arriva con il prossimo aggiornamento.\nGrazie della segnalazione.',
    data: '2026-10-29T16:05:00Z',
  },
  {
    id: 1,
    autore: 'Giorgio Pedrotti',
    testo:
      'Aprendo il listino dalla ricerca con un filtro attivo la pagina resta bianca. Senza filtri si apre.',
    data: '2026-10-28T08:42:00Z',
  },
  {
    id: 2,
    autore: 'Stefano Bertolini',
    testo:
      'Riesco a riprodurlo. Mi confermi che è questo l\'indirizzo? https://app.esempio.it/listini/2026/primavera/edilizia-civile?filtro=categoria%3Dmalte-fibrorinforzate&ordina=codice&pagina=3',
    data: '2026-10-28T10:15:00Z',
  },
]

/** Tre messaggi, uno con un indirizzo lungo che va a capo. */
export const Predefinita: Story = {
  args: { messaggi: MESSAGGI },
}

/** Nessun messaggio: una frase, che l'app può cambiare. */
export const Vuoto: Story = {
  args: { messaggi: [], vuoto: 'Nessuna risposta ancora' },
}

/**
 * Dentro una card, sul telefono: l'indirizzo lungo va a capo dentro il
 * riquadro.
 */
export const Telefono: Story = {
  globals: { viewport: { value: 'telefono', isRotated: false } },
  args: { messaggi: MESSAGGI },
  render: (args) => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Risposte</CardTitle>
      </CardHeader>
      <CardContent>
        <FiloMessaggi {...args} />
      </CardContent>
    </Card>
  ),
}
