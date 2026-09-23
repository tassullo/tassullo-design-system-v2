import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileSearchIcon, FolderOpenIcon } from 'lucide-react'

import { EmptyState } from '@/registry/tassullo/blocks/empty-state'
import { Button } from '@/registry/tassullo/ui/button'

/**
 * Lo stato vuoto: quando una sezione non ha ancora niente da mostrare, dice
 * perché con una frase e, quando c'è, offre il gesto per uscirne.
 *
 * **Quando sì, quando no.** È uno dei tre stati di una sezione, con
 * `tassullo-page-skeleton` mentre i dati arrivano e `tassullo-error-state`
 * quando non arrivano. Si usa quando i dati sono arrivati e non c'è niente:
 * mai una tabella con la sola intestazione. Il «nessun risultato» dopo una
 * ricerca o un filtro non è questo stato: lo dà da sé `tassullo-data-table`,
 * con il bottone che toglie i filtri. Il blocco compone la primitiva `empty`
 * con il bordo tratteggiato acceso; per un vuoto diverso resta la primitiva.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-empty-state
 * ```
 *
 * ```tsx
 * <EmptyState
 *   icona={<FolderOpenIcon />}
 *   titolo="Nessuna scheda in questa cartella"
 *   descrizione="Le schede tecniche pubblicate compariranno qui."
 * />
 * ```
 *
 * **Le prop.** `icona`, nel cerchio in testa; `titolo`, una frase e non un
 * titolo tecnico; `descrizione`, cosa aspettarsi o dove cercare; `azione`, il
 * bottone per uscire dal vuoto.
 *
 * **Regole d'uso.** Il titolo dice la cosa com'è — «Nessuna scheda in questa
 * cartella» — non «Nessun dato». L'azione c'è solo quando ce n'è una
 * sensata, di solito creare il primo elemento.
 */
const meta = {
  title: 'Blocchi/Stato vuoto',
  component: EmptyState,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Icona, frase e descrizione.
 */
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

/**
 * Con l'azione: lo stato vuoto dice anche cosa fare adesso.
 */
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

/**
 * Senza descrizione, quando la frase basta.
 */
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
