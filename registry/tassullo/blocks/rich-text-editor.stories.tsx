import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { apriCol } from '@/prove/apri'
import { RichTextEditor } from '@/registry/tassullo/blocks/rich-text-editor'

/**
 * L'editor per i testi che Anagrafe oggi affida a un `<textarea>`: testi di
 * famiglia, voce di capitolato, note tecniche (`editor` ×20 nella sua
 * roadmap). Barra ridotta all'essenziale — grassetto, corsivo, apice,
 * elenchi, collegamento — perché lo schema del documento non accetta altro:
 * un incolla da Word non porta dentro titoli, colori o sottolineato, non
 * perché vengano tolti, ma perché non c'è una casella dove entrare.
 *
 * ```tsx
 * <RichTextEditor
 *   defaultValue={testoEsistente}
 *   onChange={(json) => salva(json)}
 *   limite={2048}
 * />
 * ```
 *
 * Il valore è **JSON** (`editor.getJSON()` serializzato), non HTML: la
 * stessa struttura produce sempre la stessa stringa, la condizione che
 * `diff-view` (M3.9) chiederà per confrontare due revisioni.
 */
const meta = {
  title: 'Blocchi/Editor di testo',
  component: RichTextEditor,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RichTextEditor>

export default meta
type Story = StoryObj<typeof meta>

/** A riposo, con il placeholder. */
export const Base: Story = {
  args: {
    placeholder: 'Descrizione del prodotto…',
    etichetta: 'Descrizione',
  },
  render: (args) => (
    <div className="max-w-xl">
      <RichTextEditor {...args} />
    </div>
  ),
}

/**
 * Il collegamento passa da un popover, non da un `window.prompt` — coerente
 * col resto del registry (nessun dialogo nativo del browser) e verificabile
 * da axe, che un `prompt()` non lo è. Il bottone non chiede una selezione
 * preventiva: senza, `setLink` si applica come marcatore per il testo che
 * si scriverà dopo — lo stesso comportamento del grassetto sulla riga vuota.
 * L'imbracatura dichiara l'apertura (`@/prove/apri`) perché il gate la
 * misuri in tutti e due gli stati.
 */
export const ConCollegamento: Story = {
  args: {
    defaultValue: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Vedi la scheda tecnica FORTE CALCE.' }],
        },
      ],
    }),
    etichetta: 'Note',
  },
  render: (args) => (
    <div className="max-w-xl">
      <RichTextEditor {...args} />
    </div>
  ),
  play: apriCol('[aria-label="Collegamento"]', 'popover-content'),
}

/**
 * BC impone 2048 caratteri per campo (`form-field`, M3.4, stessa regola).
 * Contenuto già a 15 caratteri dal limite: il contatore è già in
 * `warning` — "si vede prima di sbatterci contro", non dopo.
 */
export const VicinoAlLimite: Story = {
  render: () => <DemoLimite />,
}

function testoLungo(caratteri: number) {
  return 'Malta a base di calce idraulica naturale NHL 3.5, applicabile a mano o a macchina su supporti murari nuovi o esistenti, interni ed esterni. '.repeat(
    Math.ceil(caratteri / 140)
  ).slice(0, caratteri)
}

function DemoLimite() {
  const [valore, setValore] = useState(() =>
    JSON.stringify({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: testoLungo(2033) }] },
      ],
    })
  )
  return (
    <div className="max-w-xl">
      <RichTextEditor value={valore} onChange={setValore} etichetta="Descrizione" />
    </div>
  )
}

/**
 * L'accettazione di M3.8: incollare da Word non porta dentro colore,
 * sottolineato né il titolo — restano solo grassetto e corsivo, gli unici
 * marcatori che lo schema di questo editor conosce oltre ad apice e link.
 * Provato incollando davvero (`paste`, non `setContent`): è l'unico modo di
 * passare dal parser HTML di ProseMirror, lo stesso percorso di un incolla
 * reale dalla clipboard.
 */
export const IncollaDaWord: Story = {
  args: { etichetta: 'Note tecniche' },
  render: (args) => <RichTextEditor {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const area = canvas.getByRole('textbox', { name: 'Note tecniche' })
    await userEvent.click(area)

    const html =
      '<p style="color:#C0392B;font-family:Calibri"><b>Prova</b> di ' +
      '<span style="text-decoration:underline">incolla</span> da ' +
      '<font color="blue">Word</font></p>' +
      '<h1>Un titolo che Word ha inserito</h1>'
    const dati = new DataTransfer()
    dati.setData('text/html', html)
    dati.setData('text/plain', 'Prova di incolla da Word\nUn titolo che Word ha inserito')
    area.dispatchEvent(
      new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dati })
    )

    await waitFor(() => {
      expect(canvas.getByText('Prova', { exact: false })).toBeInTheDocument()
    })

    // Il grassetto sopravvive (è nello schema); niente stile inline, niente
    // sottolineato, niente titolo — non ci sono nodi/marcatori che li rendano.
    expect(area.querySelector('strong')).toBeInTheDocument()
    expect(area.querySelector('[style]')).not.toBeInTheDocument()
    expect(area.querySelector('u')).not.toBeInTheDocument()
    expect(area.querySelector('h1')).not.toBeInTheDocument()
    expect(area.querySelector('font')).not.toBeInTheDocument()
  },
}
