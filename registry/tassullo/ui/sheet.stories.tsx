import type { Meta, StoryObj } from '@storybook/react-vite'

import { apriCol } from '@/prove/apri'
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
 * Un pannello che entra da un lato dello schermo e resta accanto alla pagina,
 * per un lavoro che chiede spazio ma non fa perdere il contesto: impostazioni,
 * un dettaglio, un elenco da consultare.
 *
 * **Quando sì, quando no.** È il pannello laterale su schermo largo. Per un
 * compito breve al centro dell'attenzione si usa `dialog`; per una conferma
 * irreversibile `alert-dialog`. Su telefono lo stesso contenuto va in un
 * `drawer`: la differenza non è il bordo da cui entra, ma il gesto — il
 * drawer si tira col dito e ha i punti d'aggancio, lo sheet si apre e si
 * chiude.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/sheet
 * ```
 *
 * **Opzioni e parti.** `side` su `SheetContent`: `right` (di base), `left`,
 * `top`, `bottom`. Sui lati il pannello è largo tre quarti dello schermo, fino
 * a un massimo; sopra e sotto è alto quanto il contenuto. `showCloseButton`
 * (acceso di base) mostra la crocetta. Le parti: `SheetTrigger`,
 * `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`,
 * `SheetClose`.
 *
 * **Regole d'uso.**
 *
 * - `SheetTitle` c'è sempre: è il nome con cui il pannello si annuncia. Se
 *   non deve vedersi, si nasconde con `sr-only`.
 * - Il piè di pagina resta in fondo al pannello, e il contenuto in mezzo
 *   scorre. Se il contenuto è di sola lettura, va in una `ScrollArea`, così
 *   la regione che scorre si raggiunge anche da tastiera.
 *
 * **Tastiera e accessibilità.** Come il `dialog`: all'apertura il fuoco entra
 * nel pannello e `Tab` gira al suo interno; `Esc` o il clic fuori chiudono;
 * alla chiusura il fuoco torna sul bottone che l'aveva aperto.
 */
const meta = {
  title: 'Primitive/Sheet',
  component: Sheet,
  // Si misura **aperto**: chiuso il popup non esiste e axe non ha niente
  // da guardare. L'imbracatura dichiara qui quale popup apre (`@/prove/apri`).
  play: apriCol('[data-slot="sheet-trigger"]', 'sheet-content'),
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Un pannello di impostazioni da destra, con i controlli e il piè di pagina.
 */
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

/**
 * I quattro lati da cui può entrare, con `side`.
 */
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
 * Un elenco lungo di sola lettura: il pannello non cresce oltre lo schermo,
 * scorre solo la parte centrale, e il piè di pagina resta in fondo.
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
          className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-2 text-sm focus-visible:ring-1 focus-visible:ring-ring/30 focus-visible:outline-none"
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
