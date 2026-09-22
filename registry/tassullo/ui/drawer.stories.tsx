import type { Meta, StoryObj } from '@storybook/react-vite'

import { apriCol } from '@/prove/apri'
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
 * Un pannello che sale dal bordo dello schermo e si trascina col dito: la
 * forma del dialogo su telefono.
 *
 * **Quando sì, quando no.** Sotto la soglia del telefono, per gli stessi
 * contenuti che su schermo largo andrebbero in un `dialog` — il blocco
 * `Dialogo adattivo` sceglie fra i due da sé. La differenza con `sheet` non è
 * il bordo da cui entra ma il gesto: il drawer si tira, ha l'inerzia e i punti
 * d'aggancio; lo `sheet` è un pannello di lavoro fisso a lato. Per una
 * conferma irreversibile c'è `alert-dialog`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/drawer
 * ```
 *
 * **Opzioni.** `swipeDirection` (`down` di base, poi `up`, `left`, `right`)
 * dice da che bordo entra e in che verso si chiude. `showSwipeHandle` mostra
 * la maniglia. `snapPoints` ferma il pannello a metà o tutto aperto.
 *
 * **Regole d'uso.** La maniglia si mette: senza, il gesto funziona ma nessuno
 * lo prova. Con `snapPoints` il contenuto deve stare dentro l'aggancio di
 * apertura: ciò che resta sotto la piega esce dallo schermo e non scorre, si
 * raggiunge solo trascinando. Per un elenco lungo si usa il drawer senza
 * agganci, che si apre all'altezza del contenuto e scorre.
 *
 * **Tastiera e accessibilità.** Come il `dialog`: il fuoco entra nel pannello
 * e `Tab` gira al suo interno, `Esc` chiude, il fuoco torna sul bottone che lo
 * aveva aperto. Il trascinamento è un'aggiunta per chi usa il dito, non
 * l'unica via per chiudere.
 */
const meta = {
  title: 'Primitive/Drawer',
  component: Drawer,
  // Si misura **aperto**: chiuso il popup non esiste e axe non ha niente
  // da guardare. L'imbracatura dichiara qui quale popup apre (`@/prove/apri`).
  play: apriCol('[data-slot="drawer-trigger"]', 'drawer-content'),
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
 * Con la maniglia di trascinamento (`showSwipeHandle`), il segno che dice
 * «questo si tira».
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
 * quando sotto c'è qualcosa da guardare mentre si legge. Il contenuto è corto
 * di proposito: con gli agganci deve stare dentro l'altezza di apertura.
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
 * Dal lato, con `swipeDirection="right"`. È la forma che somiglia di più a
 * `sheet`: la scelta fra i due la decide il gesto che ci si aspetta, non il
 * bordo.
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
