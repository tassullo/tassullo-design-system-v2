import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '@/registry/tassullo/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/registry/tassullo/ui/drawer'
import { Field, FieldLabel } from '@/registry/tassullo/ui/field'
import { Input } from '@/registry/tassullo/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/registry/tassullo/ui/select'

/**
 * **Nessun ri-stile, e nessuna libreria in più.** Nel v1 di shadcn il drawer
 * era `vaul`; in `base-nova` è Base UI, `@base-ui/react/drawer`. Un pacchetto
 * di terze parti in meno da mantenere, e la stessa macchina di popup di
 * dialog, sheet e menu — quindi lo stesso comportamento del fuoco.
 *
 * **Perché c'è, dato che c'è già `Sheet`.** Perché il drawer si **trascina**:
 * ha l'inerzia, i punti d'aggancio (`snapPoints`) e la maniglia. È il gesto
 * del telefono, non la finestra del desktop. È il mattone mobile del
 * `responsive-dialog` di M3.4 — `Dialog` sopra la soglia, `Drawer` sotto,
 * **senza un `if` nella pagina** — ed è per questo che sta in FASE 2 e non
 * dove servirà.
 *
 * **I valori arbitrari qui sono fisica, non tema.** `ease-[cubic-bezier(...)]`,
 * `duration-[calc(var(--drawer-swipe-strength)*400ms)]`,
 * `opacity-[max(...)]`: descrivono come il pannello segue il dito. Non sono
 * lunghezze né colori, non hanno un gradino nel tema e ripulirli
 * ri-stilando significherebbe cambiare il comportamento, non la resa. Restano
 * ereditati, ed è una scelta, non una dimenticanza.
 *
 * **Da tastiera** vale quel che vale per il dialog: `Tab` gira dentro, `Esc`
 * chiude, il fuoco torna al grilletto. Il trascinamento è un'aggiunta per chi
 * ha un dito, non l'unica via.
 */
const meta = {
  title: 'Primitive/Drawer',
  component: Drawer,
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>
        Apri i filtri
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filtra i prodotti</DrawerTitle>
          <DrawerDescription>
            I filtri restano attivi finché non si azzerano.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 p-4">
          <Field>
            <FieldLabel htmlFor="dr-fam">Famiglia</FieldLabel>
            <Select
              items={{
                deumidificanti: 'Intonaci deumidificanti',
                termici: 'Intonaci termoisolanti',
                calce: 'Finiture a calce',
              }}
            >
              <SelectTrigger id="dr-fam" className="w-full">
                <SelectValue placeholder="Tutte le famiglie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deumidificanti">
                  Intonaci deumidificanti
                </SelectItem>
                <SelectItem value="termici">Intonaci termoisolanti</SelectItem>
                <SelectItem value="calce">Finiture a calce</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="dr-cod">Codice prodotto</FieldLabel>
            <Input id="dr-cod" placeholder="T30" className="tabular-nums" />
          </Field>
        </div>
        <DrawerFooter>
          <Button>Applica</Button>
          <DrawerClose render={<Button variant="outline" />}>
            Annulla
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

/**
 * Con la maniglia di trascinamento (`showSwipeHandle`). È l'affordance che
 * dice «questo si tira»: senza, il gesto funziona lo stesso ma nessuno lo
 * prova.
 */
export const ConManiglia: Story = {
  render: () => (
    <Drawer showSwipeHandle>
      <DrawerTrigger render={<Button />}>Dettagli del lotto</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Lotto 24-0417</DrawerTitle>
          <DrawerDescription>
            Confezionato il 17 aprile 2024 — sacco da 25 kg.
          </DrawerDescription>
        </DrawerHeader>
        <dl className="grid grid-cols-2 gap-y-2 p-4 text-sm">
          <dt className="text-muted-foreground">Resa</dt>
          <dd className="text-right tabular-nums">12,40 kg/m²</dd>
          <dt className="text-muted-foreground">Spessore minimo</dt>
          <dd className="text-right tabular-nums">20,00 mm</dd>
          <dt className="text-muted-foreground">Conformità</dt>
          <dd className="text-right tabular-nums">98,75 %</dd>
        </dl>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>Chiudi</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

/**
 * Con i punti d'aggancio: il pannello si ferma a metà o tutto aperto. Serve
 * quando sotto c'è qualcosa da guardare mentre si legge — una mappa, una
 * tabella — e non è il caso più comune.
 *
 * **Il contenuto deve stare dentro l'aggancio d'apertura.** Con `snapPoints`
 * il popup è alto quanto l'aggancio **massimo** e viene traslato giù di
 * `--drawer-snap-point-offset`: la parte sotto la piega esce dallo schermo, e
 * un `overflow-y-auto` là dentro non ha niente da scorrere, perché overflow
 * non ce n'è — il contenuto ci sta comodo nell'altezza piena del popup.
 * Misurato: con l'aggancio a `0.4` su una finestra di 720px il popup andava
 * da 432 a 1056, `padding-bottom` 0, `scrollHeight === clientHeight`, e
 * l'ultima voce finiva 45px **sotto** il bordo. L'unico modo di leggerla era
 * trascinare.
 *
 * La doc di Base UI compensa, nel proprio esempio, con un `padding-bottom`
 * pari all'offset sul popup; **shadcn `base-nova` non lo fa** e noi non
 * diverghiamo per aggiungerlo (deciso il 2026-09-09). Finché resta così, gli
 * agganci vogliono contenuto **corto**: qui due revisioni, non quattro. Per
 * un elenco lungo si usa il drawer senza agganci, che si apre all'altezza del
 * contenuto e scorre.
 */
export const ConAgganci: Story = {
  render: () => (
    <Drawer showSwipeHandle snapPoints={[0.4, 1]}>
      <DrawerTrigger render={<Button variant="outline" />}>
        Storico revisioni
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Storico delle revisioni</DrawerTitle>
          <DrawerDescription>
            Le due più recenti.
          </DrawerDescription>
        </DrawerHeader>
        <ol className="flex flex-col gap-3 p-4 text-sm">
          {[
            ['04', '2 settembre 2026', 'Aggiornati i valori di resa'],
            ['03', '14 marzo 2026', 'Recepita EN 998-1:2016'],
          ].map(([n, data, motivo]) => (
            <li key={n} className="flex flex-col gap-0.5 border-b pb-3 last:border-b-0">
              <span className="font-medium tabular-nums">Revisione {n}</span>
              <span className="text-muted-foreground">
                <span className="tabular-nums">{data}</span> — {motivo}
              </span>
            </li>
          ))}
        </ol>
      </DrawerContent>
    </Drawer>
  ),
}

/**
 * Dal lato: `swipeDirection="right"` lo ancora al bordo destro. È la forma in
 * cui somiglia di più a `Sheet` — e la domanda giusta resta quale gesto ci si
 * aspetta, non quale bordo.
 */
export const DaDestra: Story = {
  render: () => (
    <Drawer swipeDirection="right">
      <DrawerTrigger render={<Button variant="outline" />}>
        Apri dal lato
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Note di cantiere</DrawerTitle>
          <DrawerDescription>
            Appunti presi sul posto, non ancora protocollati.
          </DrawerDescription>
        </DrawerHeader>
        <p className="p-4 text-sm text-muted-foreground">
          Il supporto risulta ancora umido a 48 ore dalla posa del rinzaffo.
          Rimandata la finitura.
        </p>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>Chiudi</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}
