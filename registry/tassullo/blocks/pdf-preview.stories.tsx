import type { Meta, StoryObj } from '@storybook/react-vite'

import { PdfPreview } from '@/registry/tassullo/blocks/pdf-preview'

/**
 * Anteprima PDF incorporata — `pdf` ×59 e `anteprima` ×9 nella roadmap di
 * Anagrafe, il cuore documentale dell'app (DOP, TDS, FPC dei prodotti).
 *
 * ```tsx
 * <PdfPreview file={urlDelDocumento} onRiprova={() => ricarica()} />
 * ```
 *
 * `file` è lo stesso prop di `react-pdf`: un URL, un `File`/`Blob` o un
 * `ArrayBuffer`. Caricamento e navigazione pagine/zoom sono di questo
 * blocco; l'upload e la provenienza del documento restano dell'app.
 */
const meta = {
  title: 'Blocchi/Anteprima PDF',
  component: PdfPreview,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PdfPreview>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Un vero riferimento FileMaker di Anagrafe (scheda tecnica, 4 pagine):
 * l'accettazione di M3.7 chiede un PDF reale aperto e sfogliato, non un
 * segnaposto.
 */
export const SchedaTecnica: Story = {
  args: {
    file: '/esempi/scheda-tecnica-esempio.pdf',
  },
  render: (args) => (
    <div className="max-w-lg">
      <PdfPreview {...args} />
    </div>
  ),
}

/** Il documento non si apre: stesso `ErrorState` di ogni altro standard di M3.5, con "Riprova". */
export const Errore: Story = {
  args: {
    file: '/esempi/non-esiste.pdf',
    messaggioErrore: 'Il documento non è più disponibile sul server.',
    onRiprova: () => {},
  },
  render: (args) => (
    <div className="max-w-lg">
      <PdfPreview {...args} />
    </div>
  ),
}
