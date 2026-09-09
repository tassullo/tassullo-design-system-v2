import type { Meta, StoryObj } from '@storybook/react-vite'
import { ImageIcon } from 'lucide-react'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/registry/tassullo/ui/carousel'
import { AspectRatio } from '@/registry/tassullo/ui/aspect-ratio'
import { Card, CardContent } from '@/registry/tassullo/ui/card'

/**
 * Serve alle foto di prodotto e agli asset REN/RES/IM1-9 della roadmap di
 * Anagrafe, in coppia con `aspect-ratio` — che tiene ferme le celle mentre le
 * immagini arrivano.
 *
 * **L'unico ri-stile è la lingua.** Le due frecce portavano un `sr-only` in
 * inglese («Previous slide», «Next slide») e i due `aria-roledescription`
 * dicevano «carousel» e «slide»: sono le **sole stringhe del componente che
 * arrivano a un utente**, e le sente solo chi usa uno screen reader — cioè
 * esattamente chi non può accorgersi da sé che sono nella lingua sbagliata.
 * Tradotte. Il gate non se ne accorge, ed è giusto così: confronta la forma
 * **azzerando il contenuto delle stringhe**, quindi tradurre resta dentro il
 * gradino 2 della regola 4bis.
 *
 * Sotto c'è `embla-carousel-react`, non Base UI: come per `resizable`, è la
 * scelta di shadcn a monte, non un'eccezione nostra a D9.
 *
 * **Da tastiera**: le frecce ← → scorrono quando il fuoco è dentro la regione,
 * e i due bottoni sono fermi di tabulazione veri, con nome accessibile e stato
 * `disabled` agli estremi. Un carosello che si sfoglia solo con lo swipe è
 * inutilizzabile da scrivania, ed è il difetto più comune del componente.
 *
 * **Quando non usarlo**: mai per contenuto che deve essere letto tutto. Quello
 * che sta oltre la prima diapositiva, in pratica, non lo vede quasi nessuno.
 * Va bene per le foto — dove la prima basta e le altre sono un di più — non
 * per i dati di una scheda.
 */
const meta = {
  title: 'Primitive/Carousel',
  component: Carousel,
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

const foto = ['REN-01', 'RES-02', 'IM1-03', 'IM2-04', 'IM3-05']

function Segnaposto({ etichetta }: { etichetta: string }) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-1 rounded-md bg-muted text-muted-foreground">
      <ImageIcon className="size-6" />
      <span className="text-xs tabular-nums">{etichetta}</span>
    </div>
  )
}

/** Una foto alla volta. I bottoni stanno fuori dal riquadro: serve il margine. */
export const Predefinito: Story = {
  render: () => (
    <div className="px-14">
      <Carousel className="w-80">
        <CarouselContent>
          {foto.map((f) => (
            <CarouselItem key={f}>
              <AspectRatio ratio={4 / 3}>
                <Segnaposto etichetta={f} />
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
}

/** Tre alla volta: `basis` sull'elemento decide quante ne stanno in vista. */
export const TreAllaVolta: Story = {
  render: () => (
    <div className="px-14">
      <Carousel className="w-full max-w-lg">
        <CarouselContent>
          {foto.map((f) => (
            <CarouselItem key={f} className="basis-1/3">
              <AspectRatio ratio={1}>
                <Segnaposto etichetta={f} />
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
}

/** Dentro una card, che è la forma con cui comparirà nella scheda prodotto. */
export const DentroUnaCard: Story = {
  render: () => (
    <div className="px-14">
      <Carousel className="w-80">
        <CarouselContent>
          {foto.map((f) => (
            <CarouselItem key={f}>
              <Card className="py-0">
                <CardContent className="px-0">
                  <AspectRatio ratio={4 / 3}>
                    <Segnaposto etichetta={f} />
                  </AspectRatio>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
}

/** In verticale: `orientation` sposta anche le frecce sopra e sotto. */
export const Verticale: Story = {
  render: () => (
    <div className="py-14">
      <Carousel orientation="vertical" className="w-64">
        <CarouselContent className="h-64">
          {foto.map((f) => (
            <CarouselItem key={f} className="basis-1/2">
              <Segnaposto etichetta={f} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
}
