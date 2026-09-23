import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { apriCol } from '@/prove/apri'
import { RichTextEditor } from '@/registry/tassullo/blocks/rich-text-editor'

/**
 * Il campo per un testo con una formattazione minima: grassetto, corsivo,
 * apice e pedice, elenchi, collegamenti.
 *
 * **Quando sì, quando no.** Si usa per i testi lunghi che hanno bisogno di un
 * grassetto o di un elenco: la descrizione di una famiglia di prodotti, una
 * voce di capitolato, le note tecniche. Per un testo semplice basta
 * `textarea`, dentro `tassullo-form-field`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-rich-text-editor
 * ```
 *
 * ```tsx
 * <RichTextEditor
 *   defaultValue={testoEsistente}
 *   onChange={(json) => salva(json)}
 *   limite={2048}
 * />
 * ```
 *
 * **Le prop.** `value` o `defaultValue`, il contenuto; `onChange`;
 * `limite`, i caratteri ammessi, 2048 se non si passa; `placeholder`;
 * `disabilitato`; `etichetta`, il nome dell'area di scrittura per i lettori
 * di schermo.
 *
 * **Regole d'uso.**
 *
 * - Il valore è JSON, non HTML: lo stesso contenuto dà sempre la stessa
 *   stringa, e due revisioni si possono confrontare.
 * - Il testo accetta solo ciò che la barra sa fare. Incollando da un
 *   programma di videoscrittura restano grassetto e corsivo, e si perdono
 *   titoli, colori e sottolineature.
 * - Il contatore mostra caratteri usati e limite, e cambia colore quando ne
 *   restano 50: il limite si vede prima di arrivarci. Oltre il limite non si
 *   scrive.
 * - Il collegamento si inserisce da un popover, mai da una finestra del
 *   browser.
 *
 * **Tastiera e accessibilità.** La barra è una `toolbar` con un nome, e ogni
 * bottone dice cosa fa e se è acceso. L'area di scrittura è un campo di testo
 * su più righe con il suo nome. `Ctrl` o `⌘` con `B` e `I` mettono grassetto
 * e corsivo.
 */
const meta = {
  title: 'Blocchi/Editor di testo',
  component: RichTextEditor,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RichTextEditor>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Il campo vuoto, con il testo segnaposto.
 */
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
 * Il popover del collegamento, aperto dalla barra.
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
 * Un testo a quindici caratteri dal limite: il contatore ha già cambiato
 * colore.
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
 * Un testo incollato da un programma di videoscrittura: restano grassetto e
 * corsivo, spariscono titolo, colore e sottolineato.
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
