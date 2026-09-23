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
 * Una riga di testo che compare accanto a un controllo, al passaggio del
 * puntatore o al fuoco, e dice che cosa fa o che cosa significa.
 *
 * **Quando sì, quando no.** `tooltip`, `hover-card` e `popover` si
 * distinguono per come si aprono e per cosa ci si fa dentro. Il tooltip si
 * apre col passaggio e col fuoco, e contiene una riga di testo, mai controlli:
 * sparisce appena il fuoco se ne va, e ciò che ci fosse dentro da cliccare
 * non si raggiungerebbe. Un'anteprima più ricca da leggere è `hover-card`; un
 * riquadro con dentro qualcosa da fare, che si apre al clic, è `popover`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tooltip
 * ```
 *
 * **Parti e opzioni.** `TooltipProvider` alla radice dell'app, una volta
 * sola: regge il ritardo condiviso, e aperto il primo tooltip i vicini si
 * aprono subito. `Tooltip`, `TooltipTrigger` (di solito con
 * `render={<Button … />}`), `TooltipContent` con `side` (`top` di base,
 * `right`, `bottom`, `left`).
 *
 * **Regole d'uso.**
 *
 * - Il tooltip non è il nome del controllo. Un bottone di sola icona ha il suo
 *   nome scritto in uno `<span className="sr-only">`, e il tooltip lo ripete
 *   per chi vede.
 * - Il testo sta in una riga o due: il riquadro va a capo oltre una larghezza
 *   massima, e se serve di più non è un tooltip.
 * - Il colore è invertito rispetto alla pagina, in entrambe le modalità. Un
 *   `Kbd` dentro il tooltip si adatta da solo al fondo scuro.
 *
 * **Tastiera e accessibilità.** Il tooltip si apre quando il controllo prende
 * il fuoco da tastiera, non solo al passaggio del puntatore, e si chiude con
 * `Esc` o quando il fuoco se ne va. Se manca spazio sul lato scelto, si
 * ribalta sul lato opposto.
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

/**
 * Un tooltip su un bottone, al passaggio del puntatore.
 */
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
 * Bottoni di sola icona: ognuno ha il nome in un testo `sr-only`, e il
 * tooltip lo ripete. Si apre anche arrivandoci con `Tab`.
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
 * Con la scorciatoia da tastiera scritta in `Kbd` dentro il tooltip.
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

/**
 * I quattro lati d'ancoraggio, con `side`.
 */
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
 * Un testo di due righe: il tooltip va a capo alla sua larghezza massima.
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
