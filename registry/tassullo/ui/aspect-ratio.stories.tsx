import type { Meta, StoryObj } from '@storybook/react-vite'
import { ImageIcon } from 'lucide-react'

import { AspectRatio } from '@/registry/tassullo/ui/aspect-ratio'

/**
 * `aspect-ratio.tsx` è identico all'originale, ed è il file più piccolo del
 * registry: un `div` che mette il rapporto in una variabile CSS e la usa con
 * `aspect-(--ratio)`. Nessuna classe da ri-stilare.
 *
 * **A cosa serve davvero**: a tenere ferma la pagina mentre le immagini
 * arrivano. Senza rapporto fisso, ogni foto che finisce di caricarsi sposta
 * quello che sta sotto — e chi stava per cliccare clicca un'altra cosa. Con le
 * foto di prodotto e gli asset REN/RES/IM1-9 previsti dalla roadmap di
 * Anagrafe, che arrivano in numero e a dimensioni diverse, è la differenza fra
 * una griglia che si assesta e una che salta per due secondi.
 *
 * Va in coppia con `carousel` (M2.4) e con `pdf-preview` (M3.7).
 *
 * Nelle story qui sotto non ci sono immagini vere: un riquadro su `bg-muted`
 * fa vedere il rapporto senza portarsi dietro un file da distribuire col
 * registry.
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

/** I rapporti che servono: 16:9 per le foto di posa, 4:3 per i dettagli, 1:1 per le miniature. */
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
 * In griglia: è il caso vero. Le celle restano allineate qualunque sia la
 * dimensione della foto che ci arriverà dentro, e la pagina non salta.
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
