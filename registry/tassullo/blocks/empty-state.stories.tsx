import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileSearchIcon, FolderOpenIcon } from 'lucide-react'

import { EmptyState } from '@/registry/tassullo/blocks/empty-state'
import { Button } from '@/registry/tassullo/ui/button'

/**
 * Il «vuoto» dello standard unico di M3.5: card guidata con una frase e,
 * quando c'è un'azione sensata, la CTA per uscirne — mai una tabella con la
 * sola intestazione (`INTERFACCE.md` §1.1 di Anagrafe).
 *
 * ```tsx
 * <EmptyState
 *   icona={<FolderOpenIcon />}
 *   titolo="Nessuna scheda in questa cartella"
 *   descrizione="Le schede tecniche pubblicate compariranno qui."
 * />
 * ```
 *
 * Compone la primitiva `empty`, non la sostituisce: fissa un solo default che
 * la primitiva lascia aperto, il bordo tratteggiato acceso — la forma che
 * ogni punto d'uso finora ha scelto a mano.
 */
const meta = {
  title: 'Blocchi/Stato vuoto',
  component: EmptyState,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  args: {
    icona: <FolderOpenIcon />,
    titolo: 'Nessuna scheda in questa cartella',
    descrizione: 'Le schede tecniche pubblicate compariranno qui.',
  },
  render: (args) => (
    <div className="max-w-md">
      <EmptyState {...args} />
    </div>
  ),
}

/** Con la CTA: lo stato vuoto dice anche **cosa fare adesso**. */
export const ConAzione: Story = {
  args: {
    icona: <FileSearchIcon />,
    titolo: 'Nessun risultato per «guaina 40»',
    descrizione: (
      <>
        Prova con un codice più corto, oppure{' '}
        <a href="#tutte">sfoglia tutte le schede</a>.
      </>
    ),
    azione: <Button size="sm">Azzera i filtri</Button>,
  },
  render: (args) => (
    <div className="max-w-md">
      <EmptyState {...args} />
    </div>
  ),
}

/** Senza descrizione: quando il titolo basta a dire tutto. */
export const SoloTitolo: Story = {
  args: {
    icona: <FolderOpenIcon />,
    titolo: 'Nessuna famiglia ancora creata',
  },
  render: (args) => (
    <div className="max-w-md">
      <EmptyState {...args} />
    </div>
  ),
}
