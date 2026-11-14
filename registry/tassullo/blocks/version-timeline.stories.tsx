import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test'

import { apriCol } from '@/prove/apri'

import {
  VersionTimeline,
  type AzioneVersione,
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
 *   `versione` («Rev. 4»), `stato`, e a scelta `autore`, `data` e
 *   `descrizione`. Senza autore o senza data la voce mostra solo ciò che
 *   c'è, come nell'archivio delle revisioni di un PDF.
 * - `stato` è uno di `"bozza"`, `"in-revisione"`, `"approvato"`,
 *   `"rifiutato"`, `"superato"`, ciascuno con il suo colore.
 * - `confrontabile` accende una casella per revisione e il bottone
 *   «Confronta»; `onConfronta` riceve le due revisioni scelte.
 * - `azioni(revisione)` dà i comandi di ogni voce, in un menu «⋯» accanto
 *   alla data: `etichetta`, `onSelect`, `distruttiva` per il rosso,
 *   `motivoSpenta` per un comando spento, col motivo scritto sotto. Un
 *   elenco vuoto toglie il menu da quella voce.
 *
 * **Regole d'uso.** L'`id` di una revisione è stabile, non la sua posizione
 * nell'elenco. Si scelgono due revisioni al massimo: con due scelte le altre
 * caselle si spengono, e «Confronta» si accende solo con una coppia. Un
 * comando che oggi non si può dare resta nel menu, spento, col perché: un
 * comando che sparisce non dice a nessuno cosa manca.
 *
 * **Tastiera e accessibilità.** Le caselle si raggiungono col `Tab` e si
 * spuntano con `Spazio`; ognuna ha il nome della sua revisione. Il bottone
 * «⋯» si chiama «Azioni su» più la versione; `Invio` apre il menu, le frecce
 * scorrono le voci e `Esc` lo chiude.
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
    autore: 'Stefano Bertolini',
    data: new Date('2026-09-14'),
    descrizione: 'Aggiornata la resistenza a compressione dopo le prove di laboratorio di agosto.',
  },
  {
    id: '4',
    versione: 'Rev. 4',
    stato: 'approvato',
    autore: 'Giorgio Pedrotti',
    data: new Date('2026-07-02'),
    descrizione: 'Aggiunta la tabella di posa a spessore variabile.',
  },
  {
    id: '3',
    versione: 'Rev. 3',
    stato: 'rifiutato',
    autore: 'Stefano Bertolini',
    data: new Date('2026-06-18'),
    descrizione: 'Respinta: mancava il riferimento alla norma UNI EN 998-2 aggiornata.',
  },
  {
    id: '2',
    versione: 'Rev. 2',
    stato: 'superato',
    autore: 'Laura Zeni',
    data: new Date('2026-03-11'),
  },
  {
    id: '1',
    versione: 'Rev. 1',
    stato: 'superato',
    autore: 'Laura Zeni',
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

const comandiModello = (azione: (cosa: string, r: VersionTimelineEntry) => void) =>
  (r: VersionTimelineEntry): AzioneVersione[] => [
    { etichetta: 'Carica nell’editor', onSelect: () => azione('carica', r) },
    r.stato === 'bozza' || r.stato === 'in-revisione'
      ? { etichetta: 'Valida…', onSelect: () => azione('valida', r) }
      : { etichetta: 'Valida…', onSelect: () => azione('valida', r), motivoSpenta: 'Già validata' },
    ...(r.stato === 'superato'
      ? [{ etichetta: 'Ripristina', onSelect: () => azione('ripristina', r), distruttiva: true }]
      : []),
  ]

/**
 * Un comando per revisione, nel menu «⋯» accanto alla data: caricare una
 * versione nell'editor, validarla, ripristinarne una superata. «Valida…» su
 * una versione già validata resta spento, col motivo; «Ripristina» è in
 * rosso perché sostituisce la versione corrente.
 */
export const ConAzioni: Story = {
  name: 'Con azioni',
  args: { revisioni: cinqueRevisioni },
  render: (args) => (
    <div className="max-w-lg">
      <VersionTimeline {...args} azioni={comandiModello(() => {})} />
    </div>
  ),
  play: apriCol('[data-slot="dropdown-menu-trigger"][aria-label="Azioni su Rev. 2"]', 'dropdown-menu-content'),
}

const revisioniPdf: VersionTimelineEntry[] = [
  { id: '03', versione: 'Rev. 03 — italiano', stato: 'approvato', descrizione: 'Scheda tecnica, PDF, 4 pagine.' },
  { id: '02', versione: 'Rev. 02 — italiano', stato: 'superato' },
  { id: '01', versione: 'Rev. 01 — italiano', stato: 'superato' },
]

/**
 * L'archivio delle revisioni di un PDF, che non ha autore né data per
 * revisione: la voce mostra il numero, lo stato e, se c'è, la descrizione.
 */
export const SenzaAutoreNeData: Story = {
  name: 'Senza autore né data',
  args: { revisioni: revisioniPdf },
  render: (args) => (
    <div className="max-w-lg">
      <VersionTimeline {...args} />
    </div>
  ),
}

const sceltaProva = fn()

// Il menu ha le tre voci sulla revisione superata, «Valida…» spento col
// motivo, «Ripristina» in rosso; la scelta arriva all'app con la revisione
// giusta; senza autore e data non si rendono né avatar né data.
export const ConAzioniProva: Story = {
  name: 'Con azioni, prova',
  tags: ['!dev', '!autodocs'],
  args: { revisioni: cinqueRevisioni },
  render: (args) => (
    <div className="flex max-w-lg flex-col gap-8">
      <VersionTimeline {...args} azioni={comandiModello((cosa, r) => sceltaProva(cosa, r.id))} />
      <div data-prova="pdf">
        <VersionTimeline revisioni={revisioniPdf} azioni={() => []} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    sceltaProva.mockClear()
    await userEvent.click(tela.getByRole('button', { name: 'Azioni su Rev. 2' }))
    const menu = await screen.findByRole('menu')
    const voci = within(menu).getAllByRole('menuitem')
    expect(voci.map((v) => v.textContent)).toEqual(['Carica nell’editor', 'Valida…Già validata', 'Ripristina'])
    expect(voci[1]).toHaveAttribute('aria-disabled', 'true')
    expect(voci[2]).toHaveAttribute('data-variant', 'destructive')
    await userEvent.click(voci[2])
    expect(sceltaProva).toHaveBeenCalledWith('ripristina', '2')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())

    const pdf = canvasElement.querySelector<HTMLElement>('[data-prova="pdf"]')!
    expect(pdf.querySelector('[data-slot="avatar"]')).toBeNull()
    expect(pdf.querySelector('.tabular-nums')).toBeNull()
    expect(within(pdf).queryByRole('button', { name: /^Azioni su/ })).toBeNull()
    expect(within(pdf).getByText('Rev. 03 — italiano')).toBeInTheDocument()
  },
}
