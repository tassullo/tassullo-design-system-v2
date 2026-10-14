import type { Meta, StoryObj } from '@storybook/react-vite'
import { CopyIcon, FileSearchIcon, FolderOpenIcon, ListTreeIcon, PlusIcon } from 'lucide-react'
import { expect, waitFor } from 'storybook/test'

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

const TRE_AZIONI = (
  <>
    <Button>
      <ListTreeIcon data-icon="inline-start" />
      Parti dallo schema comune
    </Button>
    <Button variant="outline">
      <CopyIcon data-icon="inline-start" />
      Copia da un’altra famiglia
    </Button>
    <Button variant="outline">
      <PlusIcon data-icon="inline-start" />
      Aggiungi capitolo
    </Button>
  </>
)

/**
 * Tre strade per uscire dal vuoto: la principale per prima, e le altre due
 * accanto, sulla stessa riga. Se non ci stanno tutte si impilano tutte,
 * larghe uguali: mai due su una riga e la terza sotto.
 */
export const PiuAzioni: Story = {
  args: {
    icona: <ListTreeIcon />,
    titolo: 'La scheda tecnica non ha ancora testi',
    descrizione: 'Parti dai capitoli più comuni, copia la struttura di un’altra famiglia, oppure aggiungi i capitoli uno per uno.',
    azione: TRE_AZIONI,
  },
}

// Tre azioni: su una riga quando c'è posto, tutte impilate quando non ci stanno
// tutte, anche dove due ci starebbero; e si riprende allargando.
export const PiuAzioniProva: Story = {
  ...PiuAzioni,
  name: 'Più Azioni, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div data-prova="largo" className="w-3xl">
        <EmptyState {...args} />
      </div>
      <div data-prova="medio" className="w-lg">
        <EmptyState {...args} />
      </div>
      <div data-prova="stretto" className="w-xs">
        <EmptyState {...args} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const righe = (quale: string) =>
      new Set([...canvasElement.querySelectorAll(`[data-prova="${quale}"] button`)].map((b) => Math.round(b.getBoundingClientRect().top))).size
    // La misura arriva col primo disegno della pagina.
    await waitFor(() => expect(`stretto: ${righe('stretto')} righe`).toBe('stretto: 3 righe'))
    expect(`largo: ${righe('largo')} riga`).toBe('largo: 1 riga')
    // Impilati sono larghi uguali; su una riga ognuno è largo quanto il suo testo.
    const larghezze = (quale: string) =>
      new Set([...canvasElement.querySelectorAll(`[data-prova="${quale}"] button`)].map((b) => Math.round(b.getBoundingClientRect().width))).size
    expect(`stretto: ${larghezze('stretto')} larghezza`).toBe('stretto: 1 larghezza')
    expect(`largo: ${larghezze('largo')} larghezze`).toBe('largo: 3 larghezze')
    // Due ci starebbero, tre no: tutte e tre impilate, larghe uguali.
    expect(`medio: ${righe('medio')} righe, ${larghezze('medio')} larghezza`).toBe('medio: 3 righe, 1 larghezza')
    // Allargato, tornano su una riga; ristretto, di nuovo impilate.
    const medio = canvasElement.querySelector<HTMLElement>('[data-prova="medio"]')!
    medio.className = 'w-3xl'
    await waitFor(() => expect(`medio largo: ${righe('medio')} riga`).toBe('medio largo: 1 riga'))
    medio.className = 'w-lg'
    await waitFor(() => expect(`medio: ${righe('medio')} righe`).toBe('medio: 3 righe'))
  },
}
