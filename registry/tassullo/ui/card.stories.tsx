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
 * **La card NON finge di essere cliccabile**, ed è una regressione già pagata
 * nel v1 (commit `94b0f5a`): una scheda che si illumina al passaggio del
 * mouse promette un clic che non esiste, e chi la usa lo prova due o tre
 * volte prima di rinunciare. Peggio ancora da tastiera, dove non c'è nessun
 * fermo di tabulazione a cui arrivare.
 *
 * Il preset shadcn qui è già a posto — **nessun `hover:`, nessun
 * `cursor-pointer`, nessun `transition` sulla card** — quindi non c'è niente
 * da ri-stilare: `card.tsx` è identico all'originale. Vale la pena scriverlo
 * lo stesso, perché la regola non sta nel codice: sta nel non aggiungercelo.
 *
 * Se una scheda **deve** portare da qualche parte, il bersaglio è un
 * elemento vero dentro la card — un bottone o un link, che prende il fuoco,
 * ha un nome accessibile e si annuncia per quello che è. Le due forme sono
 * affiancate in `Cliccabile`.
 *
 * La card ha una taglia in meno del solito: `size="sm"` stringe la spaziatura
 * interna (`--card-spacing`) e rimpicciolisce il titolo. Non è una densità:
 * la densità è la leva del tema e agisce su entrambe.
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

/** Con l'azione in testata: `CardAction` si allinea a destra del titolo. */
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

/** Col piede: `CardFooter` si attacca al fondo e porta il proprio filo sopra. */
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
 * **Il punto della story.** A sinistra la card che *sembra* cliccabile — la
 * regressione del v1, riprodotta apposta: fondo che cambia al passaggio, mano
 * del cursore, e nessun fermo di tabulazione. A destra la forma giusta: il
 * titolo è un link vero, che si raggiunge col `Tab`, si legge allo screen
 * reader e mostra l'anello di fuoco.
 *
 * Provala da tastiera: sulla sinistra il `Tab` non trova niente.
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

/** Le due taglie affiancate: cambia `--card-spacing` e il corpo del titolo. */
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
