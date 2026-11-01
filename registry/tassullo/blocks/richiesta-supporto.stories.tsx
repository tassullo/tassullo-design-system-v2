import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { LifeBuoyIcon } from 'lucide-react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { apriCol } from '@/prove/apri'
import { fileSchermata, scegliFile } from '@/prove/schermate'
import { RichiestaSupporto, type RichiestaSupportoProps } from '@/registry/tassullo/blocks/richiesta-supporto'
import type { DatiRichiesta } from '@/registry/tassullo/lib/supporto'
import { Button } from '@/registry/tassullo/ui/button'

/**
 * Il dialogo «Apri una richiesta»: chi usa l'app segnala un errore, propone
 * qualcosa o fa una domanda, con un titolo, una descrizione e, se servono,
 * degli screenshot. Sul telefono è un cassetto che sale dal basso.
 *
 * **Quando sì, quando no.** È il dialogo del canale di supporto, uguale in
 * tutte le app: si monta una volta nel guscio e si apre dal menu utente o
 * dalla pagina «Supporto». Per un modulo qualunque in un dialogo c'è
 * `tassullo-responsive-dialog` con `tassullo-form-field`; per chiedere
 * conferma di un'azione, `tassullo-confirm-dialog`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-richiesta-supporto
 * ```
 *
 * ```tsx
 * const [aperto, setAperto] = useState(false)
 * const [avanzamento, setAvanzamento] = useState(0)
 *
 * <RichiestaSupporto
 *   aperto={aperto}
 *   onApertoChange={setAperto}
 *   avanzamento={avanzamento}
 *   onInvia={async (dati) => {
 *     const creata = await inviaRichiesta(dati, contesto, setAvanzamento)
 *     toast.success('Richiesta inviata. La trovi in «Supporto».')
 *     navigate(`/supporto/${creata.id}`)
 *   }}
 * />
 * ```
 *
 * **Le prop.**
 *
 * - `aperto` e `onApertoChange`: il dialogo è sempre controllato dall'app.
 * - `onInvia(dati)` riceve `tipo`, `titolo`, `descrizione` e `screenshot`
 *   (un elenco di `File`). Il blocco non chiama nessun server: l'invio,
 *   l'autenticazione e il contesto tecnico da allegare (la pagina, la
 *   versione, il browser, gli errori recenti) sono dell'app, e chi scrive
 *   non li vede. Se la promessa si risolve il dialogo si chiude e si
 *   svuota; se si rifiuta resta aperto, con il messaggio dell'errore.
 * - `avanzamento`, da 0 a 100: la barra su ogni miniatura durante l'invio.
 * - `massimo`: gli screenshot, al più; di serie 5. Ognuno PNG o JPEG fino a
 *   10 MB.
 * - `descrizione`: la frase sotto il titolo del dialogo.
 * - `tipoIniziale`: il tipo scelto all'apertura, di serie «Errore».
 * - `forma`, come in `tassullo-responsive-dialog`.
 *
 * I tipi, gli stati e i limiti stanno nell'item `supporto`
 * (`lib/supporto.ts`), che il blocco porta con sé.
 *
 * **Regole d'uso.**
 *
 * - Le tre scelte stanno in fila da 768px di finestra, una sotto l'altra sul
 *   telefono.
 * - Il titolo è al più di 140 caratteri; gli spazi ripetuti si riducono a
 *   uno. La descrizione cresce col testo fino a un'altezza, poi scorre
 *   dentro il campo.
 * - Gli screenshot si scelgono dal computer o si trascinano sul bottone; si
 *   tolgono con la crocetta sopra l'immagine. Al tetto il bottone si spegne e
 *   la frase sotto dice perché. Incollare un'immagine dagli appunti non
 *   aggiunge uno screenshot.
 * - Gli errori dei campi compaiono al primo invio e da lì seguono quello che
 *   si scrive. L'errore dell'invio sta dentro il dialogo, sopra i bottoni.
 * - Durante l'invio i campi sono spenti e il dialogo non si chiude: né con
 *   `Esc`, né col clic fuori, né trascinando il cassetto.
 * - Annullando, quello che si è scritto resta: riaprendo il dialogo lo si
 *   ritrova. Si svuota solo dopo un invio riuscito.
 *
 * **Tastiera e accessibilità.** All'apertura il fuoco va sul primo campo
 * del dialogo; le tre scelte sono un gruppo di pulsanti di opzione, che si
 * raggiunge col `Tab` e si scorre con le frecce. `Invio` nel titolo invia.
 * Un invio con un campo vuoto porta il fuoco sul campo da correggere, e
 * l'errore è collegato al campo. `Esc` chiude, tranne durante l'invio.
 */
const meta = {
  title: 'Blocchi/Richiesta di supporto',
  component: RichiestaSupporto,
  parameters: { layout: 'centered' },
  args: { aperto: false, onApertoChange: () => {}, onInvia: async () => {} },
} satisfies Meta<typeof RichiestaSupporto>

export default meta
type Story = StoryObj<typeof meta>

const attendi = (ms: number) => new Promise((risolvi) => setTimeout(risolvi, ms))

type Esito = 'riesce' | 'fallisce' | 'resta'

// Un'app finta: il bottone apre il dialogo, l'invio fa avanzare la barra e
// poi riesce, fallisce o resta a metà, secondo la scena.
function Demo({
  esito = 'riesce',
  ...props
}: Partial<RichiestaSupportoProps> & { esito?: Esito }) {
  const [aperto, setAperto] = useState(false)
  const [avanzamento, setAvanzamento] = useState(0)
  const [ultima, setUltima] = useState<DatiRichiesta | null>(null)

  async function invia(dati: DatiRichiesta) {
    setAvanzamento(0)
    for (const passo of [20, 45, 70]) {
      await attendi(250)
      setAvanzamento(passo)
    }
    if (esito === 'resta') return new Promise<void>(() => {})
    await attendi(250)
    if (esito === 'fallisce') {
      throw new Error('La richiesta non è partita: il server non risponde. Riprova fra qualche minuto.')
    }
    setAvanzamento(100)
    setUltima(dati)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button data-prova="apri" onClick={() => setAperto(true)}>
        <LifeBuoyIcon data-icon="inline-start" />
        Apri una richiesta
      </Button>
      {ultima ? (
        <p className="text-sm text-muted-foreground" data-prova="inviata">
          Inviata: «{ultima.titolo}», {ultima.screenshot.length} screenshot.
        </p>
      ) : null}
      <RichiestaSupporto
        {...props}
        aperto={aperto}
        onApertoChange={setAperto}
        avanzamento={avanzamento}
        onInvia={invia}
      />
    </div>
  )
}

const corpo = () => within(document.body)
const campoFile = () => document.querySelector<HTMLInputElement>('[data-slot="responsive-dialog-content"] input[type="file"]')!

async function aggiungiSchermate(quante: number) {
  const titoli = ['Scheda del prodotto', 'Errore al salvataggio', 'Elenco dei listini', 'Filtri', 'Stampa']
  const file = await Promise.all(
    titoli.slice(0, quante).map((t, i) => fileSchermata(`screenshot-${i + 1}.png`, t)),
  )
  scegliFile(campoFile(), ...file)
  await waitFor(() =>
    expect(document.querySelectorAll('[data-slot="file-upload-miniatura"]')).toHaveLength(quante),
  )
}

async function compila() {
  await userEvent.type(corpo().getByLabelText('Titolo'), 'Il listino non si salva')
  await userEvent.type(
    corpo().getByLabelText('Descrizione'),
    'Nella scheda del listino 2027 premo «Salva» e compare un errore rosso. Ho provato due volte.',
  )
}

const apri = apriCol('[data-prova="apri"]', 'responsive-dialog-content')

/**
 * Il dialogo aperto, vuoto: il tipo, il titolo, la descrizione e il bottone
 * degli screenshot. «Invia la richiesta» fa avanzare la barra e poi chiude.
 */
export const DiSerie: Story = {
  name: 'Di serie',
  render: () => <Demo />,
  play: apriCol('[data-prova="apri"]', 'responsive-dialog-content'),
}

/**
 * Con tre screenshot: le miniature in griglia, ognuna con la crocetta per
 * toglierla, e il bottone che diventa «Aggiungi un'immagine».
 */
export const ConGliScreenshot: Story = {
  name: 'Con gli screenshot',
  render: () => <Demo />,
  play: async (contesto) => {
    await apri(contesto)
    if (!document.querySelector('[data-slot="responsive-dialog-content"]')) return
    await aggiungiSchermate(3)
  },
}

/**
 * Al tetto: cinque screenshot, il bottone spento e la frase che dice come
 * aggiungerne un altro.
 */
export const AlTetto: Story = {
  name: 'Al tetto',
  render: () => <Demo />,
  play: async (contesto) => {
    await apri(contesto)
    if (!document.querySelector('[data-slot="responsive-dialog-content"]')) return
    await aggiungiSchermate(5)
  },
}

/**
 * Durante l'invio: i campi spenti, la barra su ogni miniatura, il bottone
 * che gira. Il dialogo non si chiude.
 */
export const DuranteLInvio: Story = {
  name: "Durante l'invio",
  render: () => <Demo esito="resta" />,
  play: async (contesto) => {
    await apri(contesto)
    if (!document.querySelector('[data-slot="responsive-dialog-content"]')) return
    await compila()
    await aggiungiSchermate(2)
    await userEvent.click(corpo().getByRole('button', { name: 'Invia la richiesta' }))
    await waitFor(() => expect(corpo().getByLabelText('Titolo')).toBeDisabled())
  },
}

/**
 * L'invio non è riuscito: il messaggio sta dentro il dialogo, sopra i
 * bottoni, e quello che si è scritto resta.
 */
export const ErroreDInvio: Story = {
  name: "Errore d'invio",
  render: () => <Demo esito="fallisce" />,
  play: async (contesto) => {
    await apri(contesto)
    if (!document.querySelector('[data-slot="responsive-dialog-content"]')) return
    await compila()
    await userEvent.click(corpo().getByRole('button', { name: 'Invia la richiesta' }))
    await waitFor(() => expect(corpo().getByText(/il server non risponde/)).toBeInTheDocument())
  },
}

/**
 * Sul telefono il dialogo è un cassetto: le tre scelte una sotto l'altra e i
 * bottoni impilati in fondo, l'invio in cima.
 */
export const SulTelefono: Story = {
  name: 'Sul telefono',
  globals: { viewport: { value: 'telefono' } },
  render: () => <Demo forma="drawer" />,
  play: async (contesto) => {
    await apri(contesto)
    if (!document.querySelector('[data-slot="responsive-dialog-content"]')) return
    await aggiungiSchermate(2)
  },
}

// Scena di misura: l'invio a vuoto dà i due errori e porta il fuoco sul
// titolo; scritto il titolo il fuoco va sulla descrizione; durante l'invio
// `Esc` non chiude; a invio riuscito il dialogo si chiude, e riaperto è
// vuoto. `!dev` la toglie dalla barra e da Docs; il gate la esegue.
export const Prova: Story = {
  name: 'Prova',
  tags: ['!dev', '!autodocs'],
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await userEvent.click(c.getByRole('button', { name: 'Apri una richiesta' }))
    const invio = await corpo().findByRole('button', { name: 'Invia la richiesta' })
    await userEvent.click(invio)
    await waitFor(() => expect(corpo().getByLabelText('Titolo')).toHaveFocus())
    await expect(corpo().getByText('Scrivi un titolo.')).toBeInTheDocument()
    await expect(corpo().getByText('Descrivi cosa è successo o cosa ti serve.')).toBeInTheDocument()
    await expect(corpo().getByLabelText('Titolo')).toHaveAttribute('aria-invalid', 'true')

    await userEvent.type(corpo().getByLabelText('Titolo'), '  Il   listino  non si salva ')
    await expect(corpo().queryByText('Scrivi un titolo.')).not.toBeInTheDocument()
    // `Invio` nel titolo invia anche lui, ma il tasto simulato non fa l'invio
    // implicito di un modulo il cui bottone sta fuori (`form=`): qui si clicca.
    await userEvent.click(invio)
    await waitFor(() => expect(corpo().getByLabelText('Descrizione')).toHaveFocus())

    await userEvent.type(corpo().getByLabelText('Descrizione'), 'Compare un errore rosso.')
    await userEvent.click(corpo().getByRole('radio', { name: /Proposta/ }))
    await userEvent.click(invio)
    await waitFor(() => expect(corpo().getByLabelText('Titolo')).toBeDisabled())
    await userEvent.keyboard('{Escape}')
    await expect(document.querySelector('[data-slot="responsive-dialog-content"]')).toBeInTheDocument()

    await waitFor(() => expect(canvasElement.querySelector('[data-prova="inviata"]')).toBeInTheDocument())
    await expect(canvasElement.querySelector('[data-prova="inviata"]')).toHaveTextContent(
      'Inviata: «Il listino non si salva», 0 screenshot.',
    )
    await waitFor(() =>
      expect(document.querySelector('[data-slot="responsive-dialog-content"]')).not.toBeInTheDocument(),
    )
    await userEvent.click(c.getByRole('button', { name: 'Apri una richiesta' }))
    await waitFor(() => expect(corpo().getByLabelText('Titolo')).toHaveValue(''))
    await expect(corpo().getByRole('radio', { name: /Errore/ })).toBeChecked()
  },
}

