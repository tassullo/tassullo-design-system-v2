import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

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
 * ingrandisci sono bottoni con un nome, raggiungibili col `Tab`. Anche la
 * pagina si raggiunge col `Tab`: ingrandita, scorre con le frecce.
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

// Dentro una griglia, come il corpo di un dialogo, il riquadro della pagina
// non si allarga con lo zoom: la pagina ingrandita scorre dentro il riquadro,
// e il suo bordo sinistro si raggiunge scorrendo. Prima il riquadro si
// allargava insieme alla pagina, la misura successiva lo allargava ancora, e
// la pagina cresceva senza limite (in Chromium e in WebKit).
// Gira nel solo progetto WebKit (`!test`): nel giro completo di Chromium il
// worker di pdfjs parte con 5–9 secondi di ritardo e la pagina non arriva in
// tempo; il blocco è comunque scansionato da axe nella scena «Scheda Tecnica».
export const ZoomInUnaGrigliaProva: Story = {
  name: 'Zoom in una griglia, prova',
  tags: ['!dev', '!autodocs', '!test', 'webkit'],
  args: { file: 'esempi/scheda-tecnica-esempio.pdf' },
  render: (args) => (
    <div className="grid w-full max-w-3xl gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-3">
        <PdfPreview {...args} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const anteprima = () => canvasElement.querySelector<HTMLElement>('[data-slot="pdf-preview"]')!
    const riquadro = () => anteprima().children[1] as HTMLElement
    const pagina = () => anteprima().querySelector('canvas')
    const larghezzaPagina = () => Math.round(pagina()?.getBoundingClientRect().width ?? 0)
    await waitFor(() => expect(larghezzaPagina()).toBeGreaterThan(0))
    const larghezzaRiquadro = riquadro().getBoundingClientRect().width
    const spazio = riquadro().clientWidth - 2 * parseFloat(getComputedStyle(riquadro()).paddingLeft)

    await userEvent.click(tela.getByRole('button', { name: 'Pagina successiva' }))
    await userEvent.click(tela.getByRole('button', { name: 'Pagina successiva' }))
    for (const zoom of [1.25, 1.5, 1.75, 2]) {
      await userEvent.click(tela.getByRole('button', { name: 'Ingrandisci' }))
      await waitFor(() => expect(Math.abs(larghezzaPagina() - spazio * zoom)).toBeLessThanOrEqual(1))
      expect(riquadro().getBoundingClientRect().width).toBe(larghezzaRiquadro)
    }
    riquadro().scrollLeft = 0
    expect(pagina()!.getBoundingClientRect().left).toBeGreaterThanOrEqual(riquadro().getBoundingClientRect().left)

    await userEvent.click(tela.getByRole('button', { name: 'Riduci' }))
    await waitFor(() => expect(Math.abs(larghezzaPagina() - spazio * 1.75)).toBeLessThanOrEqual(1))
    expect(riquadro().getBoundingClientRect().width).toBe(larghezzaRiquadro)
  },
}
