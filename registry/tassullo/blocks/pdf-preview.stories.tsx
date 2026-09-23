import type { Meta, StoryObj } from '@storybook/react-vite'

import { PdfPreview } from '@/registry/tassullo/blocks/pdf-preview'

/**
 * L'anteprima di un PDF dentro la pagina, con le pagine da sfogliare e lo
 * zoom.
 *
 * **Quando sì, quando no.** Si usa per guardare un documento senza lasciare
 * l'applicativo: una scheda tecnica, una dichiarazione di prestazione, un
 * certificato. Per caricare un documento c'è `tassullo-file-upload`; per
 * confrontare due versioni di un testo, `tassullo-diff-view`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-pdf-preview
 * ```
 *
 * ```tsx
 * <PdfPreview file={urlDelDocumento} onRiprova={() => ricarica()} />
 * ```
 *
 * **Le prop.** `file`, lo stesso di `react-pdf`: un indirizzo, un `File` o un
 * `Blob`, un `ArrayBuffer`; `messaggioErrore`, il messaggio già tradotto se
 * il documento non si apre; `onRiprova`, il bottone per riprovare.
 *
 * **Regole d'uso.**
 *
 * - Il blocco mostra, non carica: da dove venga il documento è dell'app.
 * - La pagina si adatta alla larghezza della cornice, e lo zoom parte da lì.
 * - È un'anteprima: il testo non si seleziona e i collegamenti del PDF non si
 *   cliccano.
 * - Il worker che legge il PDF arriva dal pacchetto installato, senza
 *   richieste a servizi esterni; l'app è costruita con Vite.
 * - Mentre carica si vede la sagoma della pagina; se il documento non si
 *   apre, lo stato di errore di `tassullo-error-state`, con «Riprova».
 *
 * **Tastiera e accessibilità.** Pagina precedente e successiva, riduci e
 * ingrandisci sono bottoni con un nome, raggiungibili col `Tab`.
 */
const meta = {
  title: 'Blocchi/Anteprima PDF',
  component: PdfPreview,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PdfPreview>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Una scheda tecnica di quattro pagine, da sfogliare e ingrandire.
 */
export const SchedaTecnica: Story = {
  args: {
    file: 'esempi/scheda-tecnica-esempio.pdf',
  },
  render: (args) => (
    <div className="max-w-lg">
      <PdfPreview {...args} />
    </div>
  ),
}

/**
 * Il documento non si apre: lo stato di errore, con «Riprova».
 */
export const Errore: Story = {
  args: {
    file: 'esempi/non-esiste.pdf',
    messaggioErrore: 'Il documento non è più disponibile sul server.',
    onRiprova: () => {},
  },
  render: (args) => (
    <div className="max-w-lg">
      <PdfPreview {...args} />
    </div>
  ),
}
