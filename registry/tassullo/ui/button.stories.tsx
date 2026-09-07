import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '@/registry/tassullo/ui/button'

const meta = {
  title: 'Primitive/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
    },
    disabled: { control: 'boolean' },
  },
  args: { children: 'Bottone' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/** Story di prova di M0.3: serve a verificare i tre interruttori della barra
 *  (tema, densità, viewport). Il set completo di varianti e stati arriva in M2.1. */
export const Predefinito: Story = {}

export const Varianti: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="default">Default</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="outline">Outline</Button>
      <Button {...args} variant="ghost">Ghost</Button>
      <Button {...args} variant="destructive">Destructive</Button>
      <Button {...args} variant="link">Link</Button>
    </div>
  ),
}

/** Le quattro taglie messe in fila: è qui che si legge a colpo d'occhio
 *  l'effetto dell'interruttore di densità (M1.4). */
export const Taglie: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="xs">xs</Button>
      <Button {...args} size="sm">sm</Button>
      <Button {...args} size="default">default</Button>
      <Button {...args} size="lg">lg</Button>
    </div>
  ),
}

export const Disabilitato: Story = { args: { disabled: true } }
