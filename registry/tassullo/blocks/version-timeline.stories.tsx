import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  VersionTimeline,
  type VersionTimelineEntry,
} from '@/registry/tassullo/blocks/version-timeline'

/**
 * Lo storico delle revisioni di un documento — `storico` ×9 nella roadmap
 * di Anagrafe. Stato, autore e data per ogni versione, dalla più recente
 * alla più vecchia; in `confrontabile` si scelgono due versioni da mandare
 * a `diff-view` (M3.9), che questo blocco non renderizza.
 *
 * ```tsx
 * <VersionTimeline
 *   revisioni={revisioni}
 *   confrontabile
 *   onConfronta={(a, b) => apriConfronto(a, b)}
 * />
 * ```
 */
const meta = {
  title: 'Blocchi/Timeline delle revisioni',
  component: VersionTimeline,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof VersionTimeline>

export default meta
type Story = StoryObj<typeof meta>

const cinqueRevisioni: VersionTimelineEntry[] = [
  {
    id: '5',
    versione: 'Rev. 5',
    stato: 'in-revisione',
    autore: 'Francesco Sartori',
    data: new Date('2026-09-14'),
    descrizione: 'Aggiornata la resistenza a compressione dopo le prove di laboratorio di agosto.',
  },
  {
    id: '4',
    versione: 'Rev. 4',
    stato: 'approvato',
    autore: 'Roberto Zanetti',
    data: new Date('2026-07-02'),
    descrizione: 'Aggiunta la tabella di posa a spessore variabile.',
  },
  {
    id: '3',
    versione: 'Rev. 3',
    stato: 'rifiutato',
    autore: 'Francesco Sartori',
    data: new Date('2026-06-18'),
    descrizione: 'Respinta: mancava il riferimento alla norma UNI EN 998-2 aggiornata.',
  },
  {
    id: '2',
    versione: 'Rev. 2',
    stato: 'superato',
    autore: 'Marta Conci',
    data: new Date('2026-03-11'),
  },
  {
    id: '1',
    versione: 'Rev. 1',
    stato: 'superato',
    autore: 'Marta Conci',
    data: new Date('2026-01-20'),
    descrizione: 'Prima stesura della scheda tecnica.',
  },
]

/** Le cinque revisioni finte dell'accettazione di M3.7, in sola lettura. */
export const CinqueRevisioni: Story = {
  args: { revisioni: cinqueRevisioni },
  render: (args) => (
    <div className="max-w-lg">
      <VersionTimeline {...args} />
    </div>
  ),
}

/** Due checkbox per riga; la terza si disabilita finché non se ne scarta una, e "Confronta" si accende solo a coppia fatta. */
export const Confrontabile: Story = {
  args: { revisioni: cinqueRevisioni, confrontabile: true },
  render: () => <DemoConfronto />,
}

function DemoConfronto() {
  const [confronto, setConfronto] = useState<string | null>(null)

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <VersionTimeline
        revisioni={cinqueRevisioni}
        confrontabile
        onConfronta={(a, b) => setConfronto(`${a.versione} → ${b.versione}`)}
      />
      {confronto ? (
        <p className="text-sm text-muted-foreground">
          Confronto richiesto: <span className="font-medium text-foreground">{confronto}</span> — la
          diff vera è `diff-view` (M3.9), non questo blocco.
        </p>
      ) : null}
    </div>
  )
}
