import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckIcon, ClockIcon, TriangleAlertIcon } from 'lucide-react'

import { Badge } from '@/registry/tassullo/ui/badge'

/**
 * **Il badge è un'etichetta che SI LEGGE, non un filtro che si clicca.** La
 * confusione fra i due è costata riscritture ripetute nel v1, ed è la prima
 * regola del CLAUDE.md sui nomi: il filtro cliccabile è `toggle-group`, e
 * arriva in M2.6. Se un badge sembra premibile, è il componente sbagliato.
 *
 * Tre cose ri-stilate rispetto al preset, e sono le stesse trappole del
 * bottone — il preset ci era cascato due volte:
 *
 * · `destructive` era `bg-destructive/10 text-destructive`, cioè un rosso su
 *   un velo di rosso: sotto soglia. Ora usa la famiglia **tenue** del tema
 *   (`destructive-subtle` + il suo testo + il suo bordo), che è la terna per
 *   cui il tema dichiara i tre valori insieme e che `check:contrast` verifica.
 * · `link` usava `text-primary` — di nuovo l'arancio del brand come testo.
 * · la forma: `rounded-4xl` è una pillola, i badge Tassullo sono a 4px; e il
 *   corpo passa da 11 a 12px, che è il gradino che il v1 dà ai badge.
 */
const meta = {
  title: 'Primitive/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
    },
  },
  args: { children: 'Etichetta' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {}

export const Varianti: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge {...args} variant="default">Default</Badge>
      <Badge {...args} variant="secondary">Secondary</Badge>
      <Badge {...args} variant="destructive">Destructive</Badge>
      <Badge {...args} variant="outline">Outline</Badge>
      <Badge {...args} variant="ghost">Ghost</Badge>
      <Badge {...args} variant="link">Link</Badge>
    </div>
  ),
}

/** Con l'icona: resta un'etichetta, l'icona è decorativa e il testo la spiega. */
export const ConIcona: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="secondary"><CheckIcon />Approvato</Badge>
      <Badge variant="outline"><ClockIcon />In attesa</Badge>
      <Badge variant="destructive"><TriangleAlertIcon />Scaduto</Badge>
    </div>
  ),
}

/**
 * Gli stati di una scheda prodotto di Anagrafe, che è il caso d'uso vero:
 * una parola, un colore, nessuna azione.
 */
export const StatiDiScheda: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="secondary">Bozza</Badge>
      <Badge variant="default">Pubblicato</Badge>
      <Badge variant="outline">Archiviato</Badge>
      <Badge variant="destructive">Revocato</Badge>
    </div>
  ),
}
