import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  VersionTimeline,
  type VersionTimelineEntry,
} from '@/registry/tassullo/blocks/version-timeline'
import { DiffView } from '@/registry/tassullo/blocks/diff-view'

/**
 * Lo storico delle revisioni di un documento: per ognuna la versione, lo
 * stato, l'autore e la data, dalla più recente alla più vecchia; a scelta,
 * due revisioni da confrontare.
 *
 * **Quando sì, quando no.** Si usa nella scheda di un documento che passa per
 * revisioni e approvazioni. Il confronto delle due revisioni scelte lo fa
 * `tassullo-diff-view`, che si installa a parte: il blocco consegna la
 * coppia e non mostra niente da sé. Per una sequenza di passi da compiere, non
 * di versioni già fatte, c'è `stepper`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-version-timeline
 * ```
 *
 * ```tsx
 * <VersionTimeline
 *   revisioni={revisioni}
 *   confrontabile
 *   onConfronta={(a, b) => apriConfronto(a, b)}
 * />
 * ```
 *
 * **Le prop.**
 *
 * - `revisioni`, dalla più recente alla più vecchia: ognuna ha `id`,
 *   `versione` («Rev. 4»), `stato`, `autore`, `data` e `descrizione`.
 * - `stato` è uno di `"bozza"`, `"in-revisione"`, `"approvato"`,
 *   `"rifiutato"`, `"superato"`, ciascuno con il suo colore.
 * - `confrontabile` accende una casella per revisione e il bottone
 *   «Confronta»; `onConfronta` riceve le due revisioni scelte.
 *
 * **Regole d'uso.** L'`id` di una revisione è stabile, non la sua posizione
 * nell'elenco. Si scelgono due revisioni al massimo: con due scelte le altre
 * caselle si spengono, e «Confronta» si accende solo con una coppia.
 *
 * **Tastiera e accessibilità.** Le caselle si raggiungono col `Tab` e si
 * spuntano con `Spazio`; ognuna ha il nome della sua revisione.
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

/**
 * Cinque revisioni in sola lettura, dalla più recente.
 */
export const CinqueRevisioni: Story = {
  args: { revisioni: cinqueRevisioni },
  render: (args) => (
    <div className="max-w-lg">
      <VersionTimeline {...args} />
    </div>
  ),
}

/** Il testo intero di ogni revisione — non è un campo di `VersionTimelineEntry` (che porta solo la `descrizione` breve), lo tiene la story per il confronto. */
const testoPerRevisione: Record<string, string> = {
  '1':
    'Membrana bituminosa armata in poliestere, spessore 3 mm, per impermeabilizzazione di coperture piane. Sovrapposizione minima ai bordi 60 mm. Posa a strato singolo, saldatura a fiamma.',
  '2':
    'Membrana bituminosa armata in poliestere, spessore 4 mm, per impermeabilizzazione di coperture piane e inclinate. Sovrapposizione minima ai bordi 60 mm. Posa a strato singolo, saldatura a fiamma. Resistenza a compressione secondo UNI EN 998-2.',
  '3':
    'Membrana armata in poliestere, spessore 4 mm, per impermeabilizzazione di coperture piane e inclinate. Sovrapposizione minima ai bordi 80 mm. Posa a doppio strato incrociato, saldatura a fiamma. Resistenza a compressione secondo UNI EN 998-2.',
  '4':
    'Membrana armata in poliestere, spessore 4 mm, per impermeabilizzazione di coperture piane, inclinate e giardini pensili. Sovrapposizione minima ai bordi 100 mm. Posa a doppio strato incrociato, saldatura a fiamma. Resistenza a compressione secondo UNI EN 998-2:2024.',
  '5':
    'Membrana armata in poliestere, spessore 4 mm, per impermeabilizzazione di coperture piane, inclinate e giardini pensili. Sovrapposizione minima ai bordi 100 mm. Posa a doppio strato incrociato, saldatura a fiamma. Resistenza a compressione secondo UNI EN 998-2:2024, verificata sui campioni di agosto 2026.',
}

/**
 * Con le caselle: scelte due revisioni, le altre si spengono e «Confronta»
 * apre il confronto delle due.
 */
export const Confrontabile: Story = {
  args: { revisioni: cinqueRevisioni, confrontabile: true },
  render: () => <DemoConfronto />,
}

function DemoConfronto() {
  const [confronto, setConfronto] = useState<[VersionTimelineEntry, VersionTimelineEntry] | null>(null)

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <VersionTimeline
        revisioni={cinqueRevisioni}
        confrontabile
        onConfronta={(a, b) => setConfronto([a, b])}
      />
      {confronto ? (
        <DiffView
          prima={testoPerRevisione[confronto[0].id]}
          dopo={testoPerRevisione[confronto[1].id]}
          etichettaPrima={confronto[0].versione}
          etichettaDopo={confronto[1].versione}
          modo="affiancato"
        />
      ) : null}
    </div>
  )
}
