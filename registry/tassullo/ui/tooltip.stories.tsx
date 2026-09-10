import { apriPassandoci } from '@/prove/apri'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CopyIcon, PencilIcon, Trash2Icon } from 'lucide-react'

import { Button } from '@/registry/tassullo/ui/button'
import { ButtonGroup } from '@/registry/tassullo/ui/button-group'
import { Kbd } from '@/registry/tassullo/ui/kbd'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/registry/tassullo/ui/tooltip'

/**
 * **Un ri-stile**: `rounded-[2px]` sulla punta della freccia → `rounded-xs`.
 * Stesso pixel — Tailwind lascia `--radius-xs` a 0.125rem e il tema non lo
 * ridichiara — ma ora è un gradino del tema invece di un numero. Il
 * `translate-y-[calc(-50%-2px)]` accanto resta: è la geometria della freccia
 * ruotata di 45°, non un valore di tema.
 *
 * **Il colore è invertito, ed è voluto**: `bg-foreground text-background`. Il
 * tooltip non poggia sulla superficie, ci sta sopra, e l'inversione è ciò che
 * lo stacca senza aggiungere un'ombra. È una coppia che `check:contrast`
 * verifica in entrambe le modalità.
 *
 * **Il tooltip non è un nome accessibile.** Un bottone a sola icona col
 * tooltip resta un bottone senza nome per chi usa uno screen reader: il
 * tooltip è testo aggiuntivo, non l'etichetta. Il nome si scrive comunque
 * (`sr-only`), e il tooltip lo ripete per chi vede. Le due cose convivono,
 * non si sostituiscono — è l'errore più comune, e in queste story il nome
 * c'è sempre.
 *
 * **E non contiene mai controlli.** Si apre al passaggio e al **fuoco**, e
 * sparisce appena il fuoco se ne va: qualsiasi cosa ci si metta dentro da
 * cliccare è irraggiungibile. Se serve un riquadro con dentro qualcosa da
 * fare, è un `popover`.
 *
 * `TooltipProvider` regge il ritardo condiviso: aperto il primo, i vicini si
 * aprono subito. Va una volta sola, in cima all'app.
 */
const meta = {
  title: 'Primitive/Tooltip',
  component: Tooltip,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  // Si misura **aperto**: chiuso il popup non esiste e axe non ha niente
  // da guardare. L'imbracatura dichiara qui quale popup apre (`@/prove/apri`).
  play: apriPassandoci('[data-slot="tooltip-trigger"]', 'tooltip-content'),
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" />}>
        Passaci sopra
      </TooltipTrigger>
      <TooltipContent>Ultima revisione: 2 settembre 2026</TooltipContent>
    </Tooltip>
  ),
}

/**
 * Bottoni a sola icona: **ognuno ha il suo `sr-only`**, e il tooltip dice la
 * stessa cosa a chi vede. Provare col `Tab`: il tooltip si apre anche col
 * fuoco, non solo col mouse.
 */
export const SuIconeSole: Story = {
  render: () => (
    <ButtonGroup>
      {[
        [<PencilIcon key="p" />, 'Modifica la scheda'],
        [<CopyIcon key="c" />, 'Duplica la scheda'],
        [<Trash2Icon key="t" />, 'Elimina la scheda'],
      ].map(([icona, testo], i) => (
        <Tooltip key={i}>
          <TooltipTrigger render={<Button variant="outline" size="icon" />}>
            {icona}
            <span className="sr-only">{testo as string}</span>
          </TooltipTrigger>
          <TooltipContent>{testo}</TooltipContent>
        </Tooltip>
      ))}
    </ButtonGroup>
  ),
}

/**
 * Con la scorciatoia da tastiera. `Kbd` dentro il tooltip ha il suo fondo
 * dedicato — le classi `**:data-[slot=kbd]:` del preset — e le misure dei
 * tasti simbolo sono quelle già chiuse a mano in M2.1: 4,55:1 in chiaro e
 * 6,36:1 in scuro.
 */
export const ConScorciatoia: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button />}>Salva</TooltipTrigger>
      <TooltipContent>
        Salva la scheda
        <Kbd>⌘</Kbd>
        <Kbd>S</Kbd>
      </TooltipContent>
    </Tooltip>
  ),
}

/** I quattro lati. Se non c'è spazio, si ribalta da sé. */
export const QuattroLati: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-2">
      {(['top', 'right', 'bottom', 'left'] as const).map((lato) => (
        <Tooltip key={lato}>
          <TooltipTrigger render={<Button variant="outline" />}>
            {lato}
          </TooltipTrigger>
          <TooltipContent side={lato}>Ancorato a {lato}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
}

/**
 * Testo lungo: il tooltip si ferma a `max-w-xs` e va a capo. Se serve più di
 * così, non è un tooltip — è un `hover-card` o un `popover`.
 */
export const TestoLungo: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" />}>
        Conformità 98,75 %
      </TooltipTrigger>
      <TooltipContent>
        Percentuale di provini conformi sugli ultimi dodici mesi di controllo
        di produzione in fabbrica.
      </TooltipContent>
    </Tooltip>
  ),
}
