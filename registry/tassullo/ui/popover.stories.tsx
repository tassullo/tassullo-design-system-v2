import type { Meta, StoryObj } from '@storybook/react-vite'
import { InfoIcon, SettingsIcon } from 'lucide-react'

import { apriCol } from '@/prove/apri'
import { Button } from '@/registry/tassullo/ui/button'
import { Field, FieldLabel } from '@/registry/tassullo/ui/field'
import { Input } from '@/registry/tassullo/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/registry/tassullo/ui/popover'
import { Slider } from '@/registry/tassullo/ui/slider'

/**
 * Un riquadro che si apre al clic accanto al bottone che lo apre, e contiene
 * quello che serve: una spiegazione, qualche campo, un controllo.
 *
 * **Quando sì, quando no.** `popover`, `tooltip` e `hover-card` si
 * distinguono per come si aprono e per cosa ci si fa dentro, non per come
 * sono fatti.
 *
 * | | si apre con | contiene |
 * |---|---|---|
 * | `tooltip` | passaggio del mouse o fuoco | una riga di testo, mai controlli |
 * | `hover-card` | passaggio del mouse | un'anteprima da leggere, mai controlli |
 * | `popover` | clic | ciò che serve, controlli compresi |
 *
 * Se dentro c'è qualcosa da cliccare, è un popover: un riquadro che si apre
 * al passaggio sfugge al mouse e da tastiera non si raggiunge. Se il compito
 * chiede attenzione esclusiva e un «Salva», è un `dialog`. Una lista di
 * azioni è `dropdown-menu`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/popover
 * ```
 *
 * **Parti e opzioni.** `Popover` la radice; `PopoverTrigger` il bottone che
 * apre, di solito con `render={<Button … />}`; `PopoverContent` il riquadro,
 * con `side` (`top`, `right`, `bottom` di base, `left`), `align` e
 * `sideOffset`; `PopoverHeader`, `PopoverTitle`, `PopoverDescription` per
 * l'intestazione.
 *
 * **Regole d'uso.**
 *
 * - `PopoverTitle` c'è sempre, anche quando il riquadro contiene una frase
 *   sola: il riquadro si annuncia come finestra, e il titolo è il suo nome. Se
 *   non deve vedersi, si nasconde con `sr-only`.
 * - Un grilletto di sola icona ha il nome scritto per il lettore di schermo,
 *   in uno `<span className="sr-only">`.
 * - Uno `slider` dentro il riquadro prende il nome con `aria-labelledby`, non
 *   con `htmlFor`.
 *
 * **Tastiera e accessibilità.** `Invio` o `Spazio` sul grilletto apre e porta
 * il fuoco dentro il riquadro; `Esc` chiude e riporta il fuoco sul grilletto.
 * Il riquadro non è modale: `Tab` ne esce verso la pagina e lo chiude, e la
 * pagina sotto resta usabile. Se manca spazio sul lato scelto, il riquadro si
 * ribalta sul lato opposto.
 */
const meta = {
  title: 'Primitive/Popover',
  component: Popover,
  // Si misura **aperto**: chiuso il popup non esiste e axe non ha niente
  // da guardare. L'imbracatura dichiara qui quale popup apre (`@/prove/apri`).
  play: apriCol('[data-slot="popover-trigger"]', 'popover-content'),
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        <SettingsIcon />
        Parametri di resa
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Parametri di resa</PopoverTitle>
          <PopoverDescription>
            Valgono per il calcolo del fabbisogno in preventivo.
          </PopoverDescription>
        </PopoverHeader>
        <Field>
          <FieldLabel htmlFor="po-spess">Spessore medio (mm)</FieldLabel>
          <Input id="po-spess" defaultValue="20" className="tabular-nums" />
        </Field>
        <Field>
          <FieldLabel htmlFor="po-sfrido">Sfrido stimato (%)</FieldLabel>
          <Input id="po-sfrido" defaultValue="8" className="tabular-nums" />
        </Field>
      </PopoverContent>
    </Popover>
  ),
}

/**
 * Un intervallo da regolare dentro il riquadro: lo `slider` prende il nome dal
 * titolo con `aria-labelledby`.
 */
export const ConControlli: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        Range di conformità
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <PopoverHeader>
          <PopoverTitle id="po-range-lab">Range di conformità</PopoverTitle>
          <PopoverDescription>
            Fuori da questo intervallo il lotto è segnalato come non conforme.
          </PopoverDescription>
        </PopoverHeader>
        <Slider
          aria-labelledby="po-range-lab"
          defaultValue={[35, 65]}
          min={0}
          max={100}
        />
        <div className="flex justify-between text-xs tabular-nums text-muted-foreground">
          <span>0</span>
          <span>100</span>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

/**
 * Una spiegazione aperta da un'icona accanto al dato. Il bottone ha il nome
 * scritto per il lettore di schermo.
 */
export const SoloTesto: Story = {
  render: () => (
    <div className="flex items-center gap-2 text-sm">
      Resa dichiarata
      <Popover>
        <PopoverTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <InfoIcon />
          <span className="sr-only">Che cos'è la resa dichiarata</span>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Resa dichiarata</PopoverTitle>
            <PopoverDescription>
              Quantità di prodotto necessaria per un metro quadro allo
              spessore di riferimento, misurata secondo EN 998-1. Non tiene
              conto dello sfrido di cantiere.
            </PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    </div>
  ),
}

/**
 * I quattro lati d'ancoraggio, con `side`. Vicino al bordo dello schermo il
 * riquadro si ribalta da sé.
 */
export const QuattroLati: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-2">
      {(['top', 'right', 'bottom', 'left'] as const).map((lato) => (
        <Popover key={lato}>
          <PopoverTrigger render={<Button variant="outline" />}>
            {lato}
          </PopoverTrigger>
          <PopoverContent side={lato} className="w-56">
            <PopoverHeader>
              <PopoverTitle>Lato {lato}</PopoverTitle>
              <PopoverDescription>
                Ancorato al lato <span className="font-medium">{lato}</span>.
                Se non ci sta, si ribalta.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
}
