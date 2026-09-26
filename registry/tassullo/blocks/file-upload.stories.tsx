import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertCircleIcon, DownloadIcon, FileTextIcon, Trash2Icon } from 'lucide-react'
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test'

import { Alert, AlertDescription } from '@/registry/tassullo/ui/alert'
import { Button } from '@/registry/tassullo/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/registry/tassullo/ui/item'
import {
  FileUpload,
  FileUploadList,
  type FileUploadItem,
} from '@/registry/tassullo/blocks/file-upload'

/**
 * Il caricamento di file: una cornice dove trascinarli o da cui sceglierli,
 * che controlla tipo e dimensione, e l'elenco dei file con il loro stato. Se
 * il file c'è già e si sostituisce, la forma compatta è un bottone solo.
 *
 * **Quando sì, quando no.** Si usa per gli allegati di una scheda — documenti,
 * foto, certificati — e per ogni campo che accetta file. Per guardare un PDF
 * già caricato c'è `tassullo-pdf-preview`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-file-upload
 * ```
 *
 * ```tsx
 * <FileUpload
 *   onFile={(file) => avviaCaricamento(file)}
 *   onRifiutati={(rifiutati) => mostraErrori(rifiutati)}
 *   accetta={{ 'application/pdf': ['.pdf'], 'image/*': [] }}
 *   dimensioneMassima={5 * 1024 * 1024}
 * />
 * <FileUploadList file={file} onRimuovi={rimuovi} />
 * ```
 *
 * **Le prop.**
 *
 * - `FileUpload`: `onFile`, i file accettati; `onRifiutati`, quelli scartati,
 *   ognuno con il motivo già tradotto; `accetta`, nella forma dell'`accept`
 *   di un campo file; `dimensioneMassima` in byte; `multiplo`,
 *   `disabilitato`; `forma`, `"zona"` di serie o `"bottone"`; `etichetta`,
 *   `descrizione` ed `etichettaBottone`, i testi della cornice. Con
 *   `forma="bottone"` resta il solo `etichettaBottone`: `etichetta` e
 *   `descrizione` non si accettano.
 * - `FileUploadList`: `file`, l'elenco che l'app tiene nel suo stato, e
 *   `onRimuovi`. Ogni file è in coda, in corso con il suo avanzamento,
 *   riuscito o fallito.
 *
 * **Regole d'uso.**
 *
 * - Il blocco sceglie e controlla, non carica: l'invio al server, i
 *   tentativi e l'annullamento sono dell'app.
 * - La stessa lista mostra gli allegati già caricati: senza `onRimuovi` le
 *   righe non hanno il bottone per toglierli.
 * - Quando il file c'è già, «Sostituisci» è `forma="bottone"` fra le azioni
 *   della riga, non una seconda cornice sotto il file. Il blocco non mostra
 *   gli errori da sé: con la forma compatta un file rifiutato si dice con un
 *   `Alert` `destructive` sotto la riga, che resta accanto al file. Un
 *   avviso a comparsa sparisce da solo, e va bene per confermare una
 *   sostituzione riuscita.
 *
 * **Tastiera e accessibilità.** Il trascinamento non è l'unica via: nella
 * cornice c'è un bottone, che si raggiunge col `Tab` e con `Invio` o `Spazio`
 * apre la scelta dei file. La cornice in sé non riceve il fuoco. Nella forma
 * compatta il bottone è tutto il blocco, e il file si trascina sopra di lui.
 */
const meta = {
  title: 'Blocchi/Caricamento file',
  component: FileUpload,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FileUpload>

export default meta
type Story = StoryObj<typeof meta>

/**
 * La cornice a riposo: si trascinano i file, o il bottone apre la scelta.
 */
export const Dropzone: Story = {
  args: {
    onFile: () => {},
    accetta: { 'application/pdf': ['.pdf'], 'image/*': [] },
    dimensioneMassima: 5 * 1024 * 1024,
    descrizione: 'PDF o immagini, fino a 5 MB',
  },
  render: (args) => (
    <div className="max-w-lg">
      <FileUpload {...args} />
    </div>
  ),
}

type Simulazione = { nome: string; dimensione: number; fallisce?: boolean }

/**
 * Non `crypto.randomUUID()`: alcuni contesti in cui gira Storybook (un
 * embed dietro un proxy, un browser che non tratta l'origine come sicura)
 * non espongono quel metodo, e la chiamata lancia — silenziosamente, prima
 * che `avvia` arrivi al primo `setFile`. Un contatore locale non ha questo
 * problema ed è tutto ciò che serve per l'unicità dentro una demo.
 */
let contatoreDemo = 0
function nuovoIdDemo() {
  contatoreDemo += 1
  return `demo-${contatoreDemo}`
}

/**
 * Cinque file in caricamento, ognuno con la sua barra, e uno che fallisce per
 * un errore di rete.
 */
export const ConAvanzamentoEUnErrore: Story = {
  args: { onFile: () => {} },
  render: () => <DemoCaricamento />,
}

function DemoCaricamento() {
  const [file, setFile] = useState<FileUploadItem[]>([])

  function avvia(elementi: Simulazione[]) {
    const nuovi: FileUploadItem[] = elementi.map((elemento) => ({
      id: nuovoIdDemo(),
      nome: elemento.nome,
      dimensione: elemento.dimensione,
      stato: 'in-corso',
      progresso: 0,
    }))
    setFile((prima) => [...prima, ...nuovi])

    nuovi.forEach((riga, indice) => {
      const fallisce = elementi[indice].fallisce
      const intervallo = setInterval(() => {
        setFile((attuale) =>
          attuale.map((r) => {
            if (r.id !== riga.id || r.stato !== 'in-corso') return r
            const progresso = (r.progresso ?? 0) + 20
            if (fallisce && progresso >= 60) {
              clearInterval(intervallo)
              return {
                ...r,
                stato: 'fallito',
                errore: 'Caricamento interrotto: il server non risponde. Riprova.',
              }
            }
            if (progresso >= 100) {
              clearInterval(intervallo)
              return { ...r, stato: 'riuscito', progresso: 100 }
            }
            return { ...r, progresso }
          })
        )
      }, 350)
    })
  }

  function onRifiutati(rifiutati: { file: File; errore: string }[]) {
    setFile((prima) => [
      ...prima,
      ...rifiutati.map((rifiutato) => ({
        id: nuovoIdDemo(),
        nome: rifiutato.file.name,
        dimensione: rifiutato.file.size,
        stato: 'fallito' as const,
        errore: rifiutato.errore,
      })),
    ])
  }

  function onRimuovi(id: string) {
    setFile((prima) => prima.filter((r) => r.id !== id))
  }

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <FileUpload
        onFile={(selezionati) =>
          avvia(selezionati.map((f) => ({ nome: f.name, dimensione: f.size })))
        }
        onRifiutati={onRifiutati}
        accetta={{ 'application/pdf': ['.pdf'], 'image/*': [] }}
        dimensioneMassima={5 * 1024 * 1024}
        descrizione="PDF o immagini, fino a 5 MB"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          avvia([
            { nome: 'scheda-tecnica.pdf', dimensione: 812_000 },
            { nome: 'foto-cantiere-01.jpg', dimensione: 2_340_000 },
            { nome: 'foto-cantiere-02.jpg', dimensione: 1_980_000 },
            { nome: 'capitolato.docx', dimensione: 154_000 },
            { nome: 'planimetria.pdf', dimensione: 6_100_000, fallisce: true },
          ])
        }
      >
        Simula 5 caricamenti (uno fallisce)
      </Button>
      <FileUploadList file={file} onRimuovi={onRimuovi} />
    </div>
  )
}

/**
 * Gli allegati già caricati: la stessa lista, senza barre.
 */
export const AllegatiGiaCaricati: Story = {
  args: { onFile: () => {} },
  render: () => <DemoAllegati />,
}

function DemoAllegati() {
  const [file, setFile] = useState<FileUploadItem[]>([
    {
      id: '1',
      nome: 'scheda-tecnica-t30.pdf',
      dimensione: 940_000,
      stato: 'riuscito',
    },
    {
      id: '2',
      nome: 'certificato-ce.pdf',
      dimensione: 512_000,
      stato: 'riuscito',
    },
  ])

  return (
    <div className="max-w-lg">
      <FileUploadList
        file={file}
        onRimuovi={(id) => setFile((prima) => prima.filter((r) => r.id !== id))}
      />
    </div>
  )
}

// Scena di misura di «Dropzone»: il campo file nascosto non occupa posto
// nella colonna della cornice, quindi lo spazio sopra il titolo è uguale a
// quello sotto il bottone. Prima era 41 contro 25px (61 contro 37 in touch).
// `!dev` la toglie dalla barra e da Docs; il gate la esegue.
export const DropzoneProva: Story = {
  ...Dropzone,
  name: 'Dropzone, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const zona = canvasElement.querySelector<HTMLElement>('[data-slot="file-upload-dropzone"]')!
    const testa = zona.querySelector<HTMLElement>('[data-slot="empty-header"]')!
    const piede = zona.querySelector<HTMLElement>('[data-slot="empty-content"]')!
    const z = zona.getBoundingClientRect()
    const sopra = testa.getBoundingClientRect().top - z.top
    const sotto = z.bottom - piede.getBoundingClientRect().bottom
    await expect(Math.abs(sopra - sotto)).toBeLessThanOrEqual(1)
  },
}

const SOLO_PDF = { 'application/pdf': ['.pdf'] }

function kb(byte: number) {
  return `${Math.round(byte / 1024)} KB`
}

/**
 * Il file c'è già e si sostituisce: `forma="bottone"` mette «Sostituisci»
 * fra le azioni della riga dell'allegato, al posto della cornice intera.
 * Stessa validazione e stessi messaggi della cornice, e un file si può
 * ancora trascinare sopra il bottone. Il blocco non mostra gli errori da
 * sé: qui un file rifiutato si dice con un `Alert` sotto la riga, che resta
 * accanto al file e non sparisce da solo — è l'uso consigliato. Si prova
 * scegliendo un file che non sia un PDF.
 *
 * ```tsx
 * <FileUpload
 *   forma="bottone"
 *   multiplo={false}
 *   etichettaBottone="Sostituisci"
 *   accetta={{ "application/pdf": [".pdf"] }}
 *   onFile={([file]) => sostituisci(file)}
 *   onRifiutati={([r]) => setErrore(r.errore)}
 * />
 * ```
 */
export const SostituisciAllegato: Story = {
  name: 'Sostituisci Allegato',
  args: { onFile: () => {} },
  render: () => <DemoSostituisci />,
}

function DemoSostituisci() {
  const [allegato, setAllegato] = useState({ nome: 'scheda-tecnica-t30.pdf', dimensione: 940_000 })
  const [errore, setErrore] = useState<string | null>(null)

  return (
    <div className="flex max-w-2xl flex-col gap-2" data-prova="allegato">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <FileTextIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{allegato.nome}</ItemTitle>
          <ItemDescription>{kb(allegato.dimensione)} · PDF</ItemDescription>
        </ItemContent>
        <ItemActions className="flex-wrap">
          <Button variant="outline" size="sm">
            <DownloadIcon data-icon="inline-start" />
            Scarica
          </Button>
          <FileUpload
            forma="bottone"
            multiplo={false}
            etichettaBottone="Sostituisci"
            accetta={SOLO_PDF}
            dimensioneMassima={5 * 1024 * 1024}
            onFile={([file]) => {
              if (!file) return
              setAllegato({ nome: file.name, dimensione: file.size })
              setErrore(null)
            }}
            onRifiutati={([rifiutato]) => {
              if (!rifiutato) return
              setErrore(
                `«${rifiutato.file.name}» non sostituisce l'allegato: ${rifiutato.errore.toLowerCase()}.`,
              )
            }}
          />
          <Button variant="destructive" size="sm">
            <Trash2Icon data-icon="inline-start" />
            Rimuovi
          </Button>
        </ItemActions>
      </Item>
      {errore ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{errore}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}

/** Il campo file nascosto della scena, e il file scelto fatto arrivare come dal selettore. */
function scegli(canvasElement: HTMLElement, file: File) {
  const campo = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!
  const trasferimento = new DataTransfer()
  trasferimento.items.add(file)
  campo.files = trasferimento.files
  campo.dispatchEvent(new Event('change', { bubbles: true }))
}

// Scena di misura di «Sostituisci Allegato»: la forma compatta è una riga
// sola (con la cornice intera sotto la riga il blocco era alto circa 300px),
// `Invio` e `Spazio` sul bottone aprono la scelta dei file, e un file che
// non è un PDF fa comparire l'avviso sotto la riga. `!dev` la toglie dalla
// barra e da Docs; il gate la esegue.
export const SostituisciAllegatoProva: Story = {
  ...SostituisciAllegato,
  name: 'Sostituisci Allegato, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    const blocco = canvasElement.querySelector<HTMLElement>('[data-prova="allegato"]')!
    const riga = blocco.querySelector<HTMLElement>('[data-slot="item"]')!
    await expect(canvasElement.querySelector('[data-slot="file-upload-dropzone"]')).toBeNull()
    await expect(blocco.getBoundingClientRect().height).toBeLessThanOrEqual(
      riga.getBoundingClientRect().height + 1,
    )

    const campo = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!
    const aperture = spyOn(campo, 'click').mockImplementation(() => {})
    const bottone = c.getByRole('button', { name: 'Sostituisci' })
    bottone.focus()
    await userEvent.keyboard('{Enter}')
    await expect(aperture).toHaveBeenCalledTimes(1)
    await userEvent.keyboard(' ')
    await expect(aperture).toHaveBeenCalledTimes(2)
    aperture.mockRestore()

    scegli(canvasElement, new File(['testo'], 'appunti.txt', { type: 'text/plain' }))
    const avviso = await waitFor(() => c.getByRole('alert'))
    await expect(avviso).toHaveTextContent('appunti.txt')
    await expect(avviso).toHaveTextContent('tipo di file non supportato')
  },
}
