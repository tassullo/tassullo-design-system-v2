import type { Meta, StoryObj } from '@storybook/react-vite'
import { ImageIcon } from 'lucide-react'

import { AspectRatio } from '@/registry/tassullo/ui/aspect-ratio'

/**
 * Un riquadro con un rapporto fra i lati fisso: tiene il posto di un'immagine
 * prima che arrivi, così la pagina non salta mentre si carica.
 *
 * **Quando sì, quando no.** Per foto, anteprime e video che arrivano dalla
 * rete a dimensioni diverse, soprattutto in griglia. Per l'immagine di un
 * prodotto o di una scheda, con il ripiego già pronto quando la foto manca,
 * c'è `entity-image`, che lo usa. Per una persona, `avatar`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/aspect-ratio
 * ```
 *
 * **Opzioni.** `ratio`, un numero: `16 / 9`, `4 / 3`, `1`. Il contenuto
 * riempie il riquadro; per le immagini si aggiunge `object-cover` o
 * `object-contain`.
 *
 * **Regole d'uso.** 16:9 per le foto di posa, 4:3 per i dettagli, 1:1 per le
 * miniature. In una griglia tutte le celle prendono lo stesso rapporto,
 * qualunque sia la foto che ci arriverà.
 */
const meta = {
  title: 'Primitive/AspectRatio',
  component: AspectRatio,
  args: { ratio: 16 / 9 },
} satisfies Meta<typeof AspectRatio>

export default meta
type Story = StoryObj<typeof meta>

function Segnaposto({ etichetta }: { etichetta: string }) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-1 rounded-md bg-muted text-muted-foreground">
      <ImageIcon className="size-6" />
      <span className="text-xs tabular-nums">{etichetta}</span>
    </div>
  )
}

export const Predefinito: Story = {
  render: () => (
    <div className="w-80">
      <AspectRatio ratio={16 / 9}>
        <Segnaposto etichetta="16 : 9" />
      </AspectRatio>
    </div>
  ),
}

/**
 * I tre rapporti d'uso: 16:9, 4:3 e 1:1.
 */
export const Rapporti: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      {([['16 : 9', 16 / 9], ['4 : 3', 4 / 3], ['1 : 1', 1], ['3 : 4', 3 / 4]] as const).map(
        ([nome, r]) => (
          <div key={nome} className="w-52">
            <AspectRatio ratio={r}>
              <Segnaposto etichetta={nome} />
            </AspectRatio>
          </div>
        )
      )}
    </div>
  ),
}

/**
 * In griglia: le celle restano allineate qualunque sia la dimensione della
 * foto che ci arriverà dentro.
 */
export const Griglia: Story = {
  render: () => (
    <div className="grid w-full max-w-2xl grid-cols-3 gap-3">
      {['REN-01', 'RES-02', 'IM1-03', 'IM2-04', 'IM3-05', 'IM4-06'].map((a) => (
        <AspectRatio key={a} ratio={4 / 3}>
          <Segnaposto etichetta={a} />
        </AspectRatio>
      ))}
    </div>
  ),
}
