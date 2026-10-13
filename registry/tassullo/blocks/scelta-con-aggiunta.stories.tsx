import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { apriScrivendo } from '@/prove/apri'
import { SceltaConAggiunta } from '@/registry/tassullo/blocks/scelta-con-aggiunta'
import { Field, FieldLabel } from '@/registry/tassullo/ui/field'

/**
 * Una tendina in cui si sceglie una voce dell'elenco, oppure si aggiunge
 * quella che si è scritta.
 *
 * **Quando sì, quando no.** Si usa quando l'elenco è aperto: i titoli di una
 * scheda, le etichette, i reparti, dove chi compila può aver bisogno di una
 * voce che ancora non c'è. Se l'elenco è chiuso e si sceglie soltanto, c'è
 * `combobox`; se le voci sono poche e si vedono tutte, `select`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-scelta-con-aggiunta
 * ```
 *
 * ```tsx
 * <SceltaConAggiunta
 *   voci={titoli}
 *   valore={titolo}
 *   onValore={setTitolo}
 *   etichettaDi={(t) => t.nome}
 *   chiaveDi={(t) => t.id}
 *   onAggiungi={async (nome) => setTitolo(await crea(nome))}
 * />
 * ```
 *
 * **Le prop.** `voci`, `valore` e `onValore`: la scelta la tiene l'app.
 * `etichettaDi` dà il testo di una voce, `chiaveDi` ciò che la distingue.
 * `onAggiungi` riceve il testo scritto quando nessuna voce lo porta già.
 * `vuoto` è il testo dell'elenco quando non c'è niente da mostrare.
 *
 * **Regole d'uso.**
 *
 * - «Aggiungi «…»» compare in fondo all'elenco solo se nessuna voce ha quel
 *   testo. Il confronto non conta maiuscole, accenti e spazi in più:
 *   scrivendo «avvertenze» con «Avvertenze» in elenco non si propone un
 *   doppione.
 * - Il testo arriva a `onAggiungi` ripulito: senza spazi in testa e in coda,
 *   e con uno spazio solo fra le parole.
 * - Se `onAggiungi` restituisce una promessa, il campo resta fermo col testo
 *   scritto finché non si chiude. La voce nuova la mette l'app, in `voci` e
 *   in `valore`.
 * - Senza `onAggiungi` è una tendina che sceglie e basta.
 * - Dentro un modulo si usa con `tassullo-form-field`.
 *
 * **Tastiera e accessibilità.** Come `combobox`: scrivendo l'elenco si apre e
 * si restringe, le frecce scorrono le voci, `Invio` sceglie quella
 * evidenziata, `Esc` chiude. La prima voce è già evidenziata, quindi chi
 * scrive un testo nuovo e preme `Invio` lo aggiunge.
 */
const meta = {
  title: 'Blocchi/Scelta con aggiunta',
  component: SceltaConAggiunta,
  parameters: {
    layout: 'padded',
    // I due bottoni di sola icona del campo sono quelli di `combobox`.
    a11y: { context: { exclude: ['[data-slot="input-group-button"]'] } },
  },
} satisfies Meta

export default meta
type Story = StoryObj

type Titolo = { id: number; nome: string }
const TITOLI: Titolo[] = [
  { id: 1, nome: 'Descrizione' },
  { id: 2, nome: "Destinazione d'uso" },
  { id: 3, nome: 'Campo di applicazione' },
  { id: 4, nome: 'Avvertenze' },
  { id: 5, nome: 'Qualità e certificazioni' },
]

function Titoli({ attesa = 0, onAggiunto }: { attesa?: number; onAggiunto?: (nome: string) => void }) {
  const [titoli, setTitoli] = useState(TITOLI)
  const [titolo, setTitolo] = useState<Titolo | null>(TITOLI[0])
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="titolo">Titolo</FieldLabel>
      <SceltaConAggiunta
        id="titolo"
        voci={titoli}
        // Un oggetto nuovo a ogni resa, come quando l'app lo calcola.
        valore={titolo ? { ...titolo } : null}
        onValore={setTitolo}
        etichettaDi={(t) => t.nome}
        chiaveDi={(t) => t.id}
        placeholder="Scegli un titolo"
        vuoto="Nessun titolo."
        onAggiungi={async (nome) => {
          onAggiunto?.(nome)
          await new Promise((fatto) => setTimeout(fatto, attesa))
          const nuovo = { id: Date.now(), nome }
          setTitoli((prima) => [...prima, nuovo])
          setTitolo(nuovo)
        }}
      />
    </Field>
  )
}

/**
 * I titoli di una scheda. Scrivendo un titolo che non c'è, in fondo
 * all'elenco compare «Aggiungi «…»».
 */
export const Predefinito: Story = {
  render: () => <Titoli />,
}

/**
 * L'elenco aperto su un testo che nessuna voce porta: resta la sola voce che
 * lo aggiunge.
 */
export const VoceNuova: Story = {
  render: () => <Titoli />,
  play: apriScrivendo('#titolo', 'Stoccaggio', 'combobox-content'),
}

const voci = () => [...document.querySelectorAll<HTMLElement>('[data-slot="combobox-item"]')].map((v) => v.textContent)

// Filtro senza accenti né maiuscole, niente doppioni, il testo ripulito, il
// campo fermo mentre si aggiunge, e la voce nuova scelta alla fine.
export const AggiungereProva: Story = {
  name: 'Aggiungere, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  args: { onAggiunto: fn() },
  render: (args) => <Titoli attesa={400} onAggiunto={(args as { onAggiunto: (nome: string) => void }).onAggiunto} />,
  play: async ({ canvasElement, args }) => {
    const campo = within(canvasElement).getByLabelText('Titolo') as HTMLInputElement
    const scrivi = async (testo: string) => {
      await userEvent.clear(campo)
      await userEvent.type(campo, testo)
    }
    expect(campo).toHaveValue('Descrizione')

    // Si scrive sopra la voce scelta, senza svuotare prima il campo: il testo
    // resta quello scritto, e non torna la voce di prima.
    await userEvent.click(campo)
    campo.select()
    await userEvent.keyboard('Stoc')
    await waitFor(() => expect(voci()).toEqual(['Aggiungi «Stoc»']))
    expect(campo).toHaveValue('Stoc')

    // Senza accenti e in minuscolo trova la voce, e non propone un doppione.
    await scrivi('qualita e certificazioni')
    await waitFor(() => expect(voci()).toEqual(['Qualità e certificazioni']))
    await scrivi('  AVVERTENZE ')
    await waitFor(() => expect(voci()).toEqual(['Avvertenze']))

    // Un pezzo di una voce: la voce, e in fondo «Aggiungi».
    await scrivi('Campo')
    await waitFor(() => expect(voci()).toEqual(['Campo di applicazione', 'Aggiungi «Campo»']))

    // Un testo nuovo, con spazi in più: si aggiunge ripulito, e intanto il
    // campo è fermo.
    await scrivi('  Voce   di capitolato ')
    await waitFor(() => expect(voci()).toEqual(['Aggiungi «Voce di capitolato»']))
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect((args as { onAggiunto: ReturnType<typeof fn> }).onAggiunto).toHaveBeenCalledWith('Voce di capitolato'))
    expect(campo).toBeDisabled()
    expect(campo).toHaveValue('Voce di capitolato')
    await waitFor(() => expect(campo).toBeEnabled())
    expect(campo).toHaveValue('Voce di capitolato')

    // Ora la voce c'è: riscrivendola non si propone più di aggiungerla.
    await scrivi('voce di capitolato')
    await waitFor(() => expect(voci()).toEqual(['Voce di capitolato']))
    // L'elenco chiuso sfuma per un momento: si aspetta che non ci sia più.
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(document.querySelector('[data-slot="combobox-content"]')).toBeNull())
  },
}
