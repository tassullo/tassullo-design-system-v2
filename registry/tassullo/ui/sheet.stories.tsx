import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '@/registry/tassullo/ui/button'
import { Field, FieldLabel } from '@/registry/tassullo/ui/field'
import { Input } from '@/registry/tassullo/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/registry/tassullo/ui/sheet'
import { Switch } from '@/registry/tassullo/ui/switch'

/**
 * **Quattro ri-stili, tutti della stessa natura**: la distanza da cui il
 * pannello entra era scritta in `rem` crudi — `translate-y-[2.5rem]`,
 * `translate-x-[-2.5rem]` e i loro due speculari — ed è diventata
 * `translate-y-10` e `-translate-x-10`. Al gradino normale è lo stesso pixel
 * (2.5rem = 40px); la differenza è che ora deriva da `--spacing`, cioè è del
 * tema. Un'animazione d'ingresso non è un bersaglio da dito, quindi la
 * densità la può scalare senza conseguenze.
 *
 * **`Sheet` o `Drawer`?** Non è una domanda di bordo: entrambi entrano dai
 * lati. `Sheet` è una finestra ancorata a un bordo — si apre e si chiude,
 * punto. `Drawer` si **trascina**, con inerzia e punti d'aggancio. Sul
 * telefono ci si aspetta il secondo; per un pannello di impostazioni sul
 * desktop, il primo. La sidebar di M2.5 usa `Sheet` sotto la soglia mobile,
 * e lo eredita dal preset senza riscriverlo.
 *
 * **Il titolo serve anche qui**: `SheetTitle` dà il nome accessibile al
 * pannello. Se non deve vedersi, si mette con `sr-only`.
 */
const meta = {
  title: 'Primitive/Sheet',
  component: Sheet,
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>
        Impostazioni della scheda
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Impostazioni della scheda</SheetTitle>
          <SheetDescription>
            Valgono per questa scheda soltanto, non per la famiglia.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          <Field>
            <FieldLabel htmlFor="sh-cod">Codice interno</FieldLabel>
            <Input id="sh-cod" defaultValue="T30" className="tabular-nums" />
          </Field>
          <div className="flex items-center justify-between gap-4">
            <FieldLabel htmlFor="sh-pub">Visibile nel catalogo pubblico</FieldLabel>
            <Switch id="sh-pub" defaultChecked />
          </div>
          <div className="flex items-center justify-between gap-4">
            <FieldLabel htmlFor="sh-ce">Marcatura CE</FieldLabel>
            <Switch id="sh-ce" defaultChecked />
          </div>
        </div>
        <SheetFooter>
          <Button>Salva</Button>
          <SheetClose render={<Button variant="outline" />}>Annulla</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

/** I quattro bordi, uno per bottone. È l'unica prop che cambia. */
export const QuattroLati: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-2">
      {(['top', 'right', 'bottom', 'left'] as const).map((lato) => (
        <Sheet key={lato}>
          <SheetTrigger render={<Button variant="outline" />}>
            Dal bordo {lato}
          </SheetTrigger>
          <SheetContent side={lato}>
            <SheetHeader>
              <SheetTitle>Bordo {lato}</SheetTitle>
              <SheetDescription>
                Sui lati il pannello è largo tre quarti dello schermo, fino a
                un massimo; sopra e sotto è alto quanto il contenuto.
              </SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <SheetClose render={<Button variant="outline" />}>
                Chiudi
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
}

/**
 * Contenuto lungo: il pannello non cresce oltre lo schermo e la sua area
 * centrale scorre. Il piè di pagina resta in fondo (`mt-auto` del preset).
 *
 * **Una regione che scorre e non contiene controlli va resa raggiungibile dal
 * fuoco**, o chi naviga da tastiera non la può scorrere: `tabIndex={0}`, un
 * nome accessibile e un anello di fuoco. Qui l'elenco è di sola lettura,
 * quindi senza quel `tabIndex` non ci arriverebbe niente — axe lo dice con
 * `scrollable-region-focusable`, ed è stato misurato in M2.3 su questa
 * story. Dalla M2.4 la risposta pronta è la primitiva `scroll-area`.
 */
export const ContenutoLungo: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button />}>Voci di capitolato</SheetTrigger>
      <SheetContent className="gap-0">
        <SheetHeader>
          <SheetTitle>Voci di capitolato</SheetTitle>
          <SheetDescription>
            Dodici voci associate alla famiglia «Intonaci deumidificanti».
          </SheetDescription>
        </SheetHeader>
        <ul
          tabIndex={0}
          aria-label="Elenco delle voci di capitolato"
          className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-2 text-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <li key={i} className="flex flex-col gap-0.5">
              <span className="font-medium tabular-nums">
                Voce {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-muted-foreground">
                Fornitura e posa in opera di intonaco macroporoso premiscelato
                a base di calce idraulica naturale, spessore minimo 20 mm.
              </span>
            </li>
          ))}
        </ul>
        <SheetFooter>
          <SheetClose render={<Button variant="outline" />}>Chiudi</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}
