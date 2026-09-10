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
 * **Nessun ri-stile.** Il popover del preset è già tutto sui token
 * (`bg-popover`, `text-popover-foreground`, `ring-foreground/10`) e le sue
 * misure derivano da `--spacing`.
 *
 * **Popover, tooltip o hover-card?** Si distinguono per **chi li apre e cosa
 * ci si può fare dentro**, non per come sono fatti.
 *
 * | | si apre con | contiene |
 * |---|---|---|
 * | `Tooltip` | passaggio **o fuoco** | una riga di testo, mai controlli |
 * | `HoverCard` | solo il passaggio | anteprima da leggere, mai controlli |
 * | `Popover` | **clic** | quello che serve, controlli compresi |
 *
 * La riga che conta è la terza: **se dentro c'è qualcosa da cliccare, è un
 * popover**. Un riquadro che si apre al passaggio e contiene un bottone è un
 * bersaglio che scappa quando ci si va col mouse, e che chi naviga da
 * tastiera non raggiunge mai.
 *
 * **Da tastiera**: `Invio` o `Spazio` apre e porta il fuoco dentro, `Esc`
 * chiude e **riporta il fuoco sul grilletto**. `Tab`, invece, **esce** dal
 * riquadro e lo chiude: il popover non intrappola il fuoco, ed è giusto così
 * — non è modale, la pagina sotto resta viva. Il fuoco intrappolato è del
 * `dialog`, e il fatto che i due si somiglino non li rende la stessa cosa.
 *
 * **Un popup con `role="dialog"` vuole un nome accessibile**: `PopoverTitle`,
 * anche quando il riquadro contiene solo una frase. Senza, axe dà
 * `aria-dialog-name` — **misurato in M2.3 su due story di questa pagina**,
 * scritte all'inizio senza titolo perché «è solo testo». Il titolo si può
 * nascondere con `sr-only`, ma non si può omettere.
 *
 * È la base del `combobox` di M2.6, composto da `command` dentro un `popover`.
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
 * Con uno `slider`, che è il controllo che in M2.2 si è scoperto **non
 * etichettabile con `htmlFor`**: il fuoco sta su un `input` nascosto dentro
 * la maniglia, e il nome arriva solo con `aria-labelledby`. Dentro un popover
 * vale identico, e vale la pena rivederlo qui.
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
 * Solo testo, aperto da un'icona. Il grilletto a sola icona vuole il nome
 * accessibile scritto a mano — è la stessa avvertenza del menu di riga.
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

/** I quattro lati d'ancoraggio. Se non c'è spazio, Base UI ribalta da sé. */
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
