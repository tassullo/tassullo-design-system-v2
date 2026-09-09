import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileTextIcon, ImageIcon, ListChecksIcon } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/tassullo/ui/tabs'

/**
 * `tabs.tsx` è identico all'originale: nessuna stringa ri-stilata. Il preset
 * è già sui token del tema e le due varianti — `default` (a pillole, su
 * `bg-muted`) e `line` (a filo sotto la scheda attiva) — coprono i due modi in
 * cui il v1 usa le schede.
 *
 * **Le schede non sono navigazione.** Cambiano il pannello sotto, non la
 * pagina: se un'etichetta deve portare a un altro indirizzo, è un link, e
 * l'indice di pagina è `breadcrumb` (M2.5). Confonderli rompe il tasto
 * indietro del browser.
 *
 * Da tastiera è il comportamento standard ARIA, che Base UI porta da sé:
 * `Tab` entra nella lista e si ferma **sulla scheda attiva sola**, le frecce
 * spostano fra le schede, `Tab` di nuovo scende nel pannello. Vale la pena
 * provarlo, perché è la differenza fra una lista di schede e cinque fermi di
 * tabulazione da attraversare ogni volta.
 *
 * Quattro valori arbitrari ereditati (`p-[3px]`, `h-[calc(100%-1px)]`,
 * `ring-[3px]`, `bottom-[-5px]`): sono di shadcn, non nostri, e il gate li
 * segnala come avvisi. Toccarli qui vorrebbe dire ridisegnare il fuoco e
 * l'allineamento del filo per un guadagno nullo.
 */
const meta = {
  title: 'Primitive/Tabs',
  component: Tabs,
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

function Pannelli() {
  return (
    <>
      <TabsContent value="dati" className="pt-2 text-sm text-muted-foreground">
        Membrana impermeabilizzante armata in poliestere, spessore 4 mm.
      </TabsContent>
      <TabsContent value="allegati" className="pt-2 text-sm text-muted-foreground">
        Disegno tecnico, certificato di conformità, scheda di sicurezza.
      </TabsContent>
      <TabsContent value="revisioni" className="pt-2 text-sm text-muted-foreground">
        Quattro revisioni, l'ultima pubblicata il 14 maggio.
      </TabsContent>
    </>
  )
}

export const Predefinito: Story = {
  render: () => (
    <Tabs defaultValue="dati" className="w-full max-w-lg">
      <TabsList>
        <TabsTrigger value="dati">Dati</TabsTrigger>
        <TabsTrigger value="allegati">Allegati</TabsTrigger>
        <TabsTrigger value="revisioni">Revisioni</TabsTrigger>
      </TabsList>
      <Pannelli />
    </Tabs>
  ),
}

/** La variante `line`: un filo sotto la scheda attiva, senza pillola. */
export const Filo: Story = {
  render: () => (
    <Tabs defaultValue="dati" className="w-full max-w-lg">
      <TabsList variant="line">
        <TabsTrigger value="dati">Dati</TabsTrigger>
        <TabsTrigger value="allegati">Allegati</TabsTrigger>
        <TabsTrigger value="revisioni">Revisioni</TabsTrigger>
      </TabsList>
      <Pannelli />
    </Tabs>
  ),
}

/** Con le icone: decorative, il testo resta il nome accessibile. */
export const ConIcone: Story = {
  render: () => (
    <Tabs defaultValue="dati" className="w-full max-w-lg">
      <TabsList>
        <TabsTrigger value="dati"><FileTextIcon />Dati</TabsTrigger>
        <TabsTrigger value="allegati"><ImageIcon />Allegati</TabsTrigger>
        <TabsTrigger value="revisioni"><ListChecksIcon />Revisioni</TabsTrigger>
      </TabsList>
      <Pannelli />
    </Tabs>
  ),
}

/** In verticale: la lista si impila a sinistra e il pannello sta a destra. */
export const Verticale: Story = {
  render: () => (
    <Tabs orientation="vertical" defaultValue="dati" className="w-full max-w-lg">
      <TabsList className="w-40">
        <TabsTrigger value="dati">Dati</TabsTrigger>
        <TabsTrigger value="allegati">Allegati</TabsTrigger>
        <TabsTrigger value="revisioni">Revisioni</TabsTrigger>
      </TabsList>
      <Pannelli />
    </Tabs>
  ),
}

/** Una scheda disattivata: non prende il fuoco e le frecce la saltano. */
export const Disattivata: Story = {
  render: () => (
    <Tabs defaultValue="dati" className="w-full max-w-lg">
      <TabsList>
        <TabsTrigger value="dati">Dati</TabsTrigger>
        <TabsTrigger value="allegati" disabled>
          Allegati
        </TabsTrigger>
        <TabsTrigger value="revisioni">Revisioni</TabsTrigger>
      </TabsList>
      <Pannelli />
    </Tabs>
  ),
}
