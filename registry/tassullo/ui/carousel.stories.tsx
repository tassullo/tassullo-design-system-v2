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
 * Una fila di immagini che si sfoglia una alla volta: le foto di un prodotto,
 * le viste di un dettaglio.
 *
 * **Quando sì, quando no.** Per contenuti in cui il primo basta e gli altri
 * sono un di più, come le foto. Mai per contenuto che deve essere letto tutto:
 * ciò che sta oltre la prima diapositiva, in pratica, non lo vede quasi
 * nessuno. I dati di una scheda vanno in pagina, non in un carosello. Le celle
 * vanno in `aspect-ratio`, che le tiene ferme mentre le immagini arrivano.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/carousel
 * ```
 *
 * **Opzioni e parti.** `orientation`: `horizontal` (di base) o `vertical`, che
 * sposta anche le frecce sopra e sotto. `opts` passa le opzioni della libreria
 * di scorrimento (per esempio `loop`, `align`). Quante diapositive stanno in
 * vista lo decide la classe `basis-*` su `CarouselItem`. `CarouselPrevious` e
 * `CarouselNext` sono le due frecce.
 *
 * **Regole d'uso.** Le frecce stanno fuori dal riquadro: attorno al carosello
 * serve il margine per ospitarle.
 *
 * **Tastiera e accessibilità.** Con il fuoco dentro il carosello, le frecce ←
 * → della tastiera scorrono; i due bottoni sono fermi di tabulazione con un
 * nome in italiano e si disattivano agli estremi. Il carosello si annuncia
 * come tale, e ogni elemento come diapositiva.
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

/**
 * Una foto alla volta, con le frecce fuori dal riquadro.
 */
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

/**
 * Tre alla volta: la classe `basis-1/3` su ogni elemento decide quante ne
 * stanno in vista.
 */
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

/**
 * Dentro una card, la forma che prende in una scheda prodotto.
 */
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

/**
 * In verticale, con `orientation="vertical"`: le frecce vanno sopra e sotto.
 */
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
