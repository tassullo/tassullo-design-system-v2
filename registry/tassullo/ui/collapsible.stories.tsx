import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChevronsUpDownIcon } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/registry/tassullo/ui/collapsible'
import { Button } from '@/registry/tassullo/ui/button'

/**
 * **`collapsible.tsx` è il file più nudo del registry: tre righe di rendering
 * e nessuna classe.** È voluto in shadcn, e lo si lascia così: il componente
 * è solo la meccanica di apertura di Base UI (stato, `aria-expanded`,
 * `aria-controls`, animazione dell'altezza), e l'aspetto lo mette chi lo usa.
 *
 * **Non confonderlo con `accordion`.** L'accordion è un *insieme* di sezioni
 * che si coordinano fra loro — apri una, si chiude l'altra — e porta con sé
 * intestazioni, filo di separazione e chevron. Il collapsible è **una**
 * sezione sola che si apre e si chiude, senza nessuna delle due cose. È la
 * regola dei nomi del CLAUDE.md: si sceglie per cosa fa l'elemento, non per
 * come somiglia.
 *
 * Da tastiera funziona senza che si debba fare niente: il grilletto è un
 * bottone, `Invio` e `Spazio` commutano, e `aria-expanded` segue.
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

/** Già aperto, con `defaultOpen`: è lo stato che serve quando il contenuto conta. */
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
