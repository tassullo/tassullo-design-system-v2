import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChevronsUpDownIcon } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/registry/tassullo/ui/collapsible'
import { Button } from '@/registry/tassullo/ui/button'

/**
 * Un contenuto che si apre e si chiude con un grilletto: la meccanica, senza
 * un aspetto proprio.
 *
 * **Quando sì, quando no.** Per una sezione sola da mostrare a richiesta —
 * dettagli, opzioni avanzate. Per più sezioni coordinate, con intestazioni e
 * indicatore già pronti, si usa `accordion`. Il collapsible non ha classi: il
 * grilletto e il contenuto li disegna chi lo usa.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/collapsible
 * ```
 *
 * **Opzioni.** `open` e `onOpenChange` per governarlo, `defaultOpen` per
 * partire aperto.
 *
 * **Tastiera.** Il grilletto è un bottone: `Invio` e `Spazio` aprono e
 * chiudono, e lo stato aperto o chiuso è annunciato.
 */
const meta = {
  title: 'Primitive/Collapsible',
  component: Collapsible,
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <Collapsible className="w-96">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium">Dati di posa</h4>
        <CollapsibleTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Mostra i dati di posa" />
          }
        >
          <ChevronsUpDownIcon />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
        <div className="rounded-md border px-3 py-2">Sovrapposizione minima 100 mm</div>
        <div className="rounded-md border px-3 py-2">Temperatura di posa ≥ 5 °C</div>
        <div className="rounded-md border px-3 py-2">Fiamma diretta, bruciatore a gas</div>
      </CollapsibleContent>
    </Collapsible>
  ),
}

/**
 * Già aperto all'arrivo, con `defaultOpen`: si usa quando il contenuto conta.
 */
export const GiaAperto: Story = {
  render: () => (
    <Collapsible defaultOpen className="w-96">
      <CollapsibleTrigger
        render={<Button variant="outline" size="sm" className="w-full justify-between" />}
      >
        Norme citate
        <ChevronsUpDownIcon />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
        <p>UNI EN 13707 — membrane bituminose armate</p>
        <p>UNI 11333 — sistemi di impermeabilizzazione</p>
      </CollapsibleContent>
    </Collapsible>
  ),
}
