import type { Meta, StoryObj } from '@storybook/react-vite'
import { EllipsisVerticalIcon } from 'lucide-react'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/registry/tassullo/ui/card'
import { Badge } from '@/registry/tassullo/ui/badge'
import { Button } from '@/registry/tassullo/ui/button'
import { Separator } from '@/registry/tassullo/ui/separator'

/**
 * Un riquadro che raccoglie un gruppo di informazioni su una cosa sola: un
 * prodotto, un indicatore, un riepilogo.
 *
 * **Quando sì, quando no.** Per dare un contorno a un contenuto che sta
 * insieme. Non è un bottone: la card non si illumina al passaggio del mouse e
 * non si clicca per intero. Se deve portare da qualche parte, dentro ci va un
 * elemento vero — un link o un `button` — che prende il fuoco e dice cosa fa.
 * Per righe di un elenco, `item`; per un indicatore numerico pronto, il blocco
 * `Indicatori`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/card
 * ```
 *
 * **Taglie e parti.** `size`: `default` o `sm`, che stringe la spaziatura
 * interna e il titolo. `CardHeader` con `CardTitle`, `CardDescription` e
 * `CardAction` (allineata a destra del titolo); `CardContent`; `CardFooter`,
 * che si attacca al fondo col suo filo sopra.
 *
 * **Regole d'uso.** Niente `hover:` e niente `cursor-pointer` sulla card: una
 * scheda che reagisce al mouse promette un clic che non c'è, e da tastiera non
 * ha nessun fermo di tabulazione. La taglia `sm` non è la densità: la densità
 * la decide il tema e agisce su entrambe.
 */
const meta = {
  title: 'Primitive/Card',
  component: Card,
  argTypes: { size: { control: 'inline-radio', options: ['default', 'sm'] } },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: (args) => (
    <Card {...args} className="w-96">
      <CardHeader>
        <CardTitle>Guaina bituminosa TS-40</CardTitle>
        <CardDescription>Codice 4021-A · revisione 4</CardDescription>
      </CardHeader>
      <CardContent>
        Membrana impermeabilizzante armata in poliestere, spessore 4 mm.
        Conforme alla UNI EN 13707.
      </CardContent>
    </Card>
  ),
}

/**
 * Con l'azione in testata: `CardAction` si allinea a destra del titolo.
 */
export const ConAzione: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Guaina bituminosa TS-40</CardTitle>
        <CardDescription>Codice 4021-A · revisione 4</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="Altre azioni">
            <EllipsisVerticalIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        Membrana impermeabilizzante armata in poliestere, spessore 4 mm.
      </CardContent>
    </Card>
  ),
}

/**
 * Col piede: `CardFooter` si attacca al fondo e porta il suo filo sopra.
 */
export const ConPiede: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Scheda in bozza</CardTitle>
        <CardDescription>Ultima modifica 3 giorni fa</CardDescription>
      </CardHeader>
      <CardContent>
        La scheda non è ancora visibile in officina.
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">Pubblica</Button>
        <Button size="sm" variant="outline">
          Elimina bozza
        </Button>
      </CardFooter>
    </Card>
  ),
}

/**
 * A sinistra la forma sbagliata: una card che reagisce al mouse ma non ha
 * nessun fermo di tabulazione. A destra quella giusta: il titolo è un link
 * vero, raggiungibile con `Tab` e con l'anello di fuoco visibile. Provala da
 * tastiera.
 */
export const Cliccabile: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-destructive-subtle-foreground">
          Sbagliata — promette un clic che non c'è
        </p>
        <Card className="w-80 cursor-pointer transition-colors hover:bg-muted">
          <CardHeader>
            <CardTitle>Guaina bituminosa TS-40</CardTitle>
            <CardDescription>Codice 4021-A</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Giusta — il bersaglio è il link</p>
        <Card className="w-80">
          <CardHeader>
            <CardTitle>
              <a
                href="#scheda-4021"
                className="rounded-sm underline-offset-3 outline-none hover:underline focus-visible:ring-1 focus-visible:ring-ring/30"
              >
                Guaina bituminosa TS-40
              </a>
            </CardTitle>
            <CardDescription>Codice 4021-A</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  ),
}

/**
 * Le due taglie affiancate: cambiano la spaziatura interna e il corpo del
 * titolo.
 */
export const Taglie: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      {(['default', 'sm'] as const).map((size) => (
        <Card key={size} size={size} className="w-72">
          <CardHeader>
            <CardTitle>Taglia {size}</CardTitle>
            <CardDescription>Codice 4021-A</CardDescription>
            <CardAction>
              <Badge variant="secondary">Bozza</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Separator className="mb-3" />
            Spessore 4 mm, armatura in poliestere.
          </CardContent>
        </Card>
      ))}
    </div>
  ),
}
