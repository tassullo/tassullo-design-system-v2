import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '@/registry/tassullo/ui/button'
import {
  FileUpload,
  FileUploadList,
  type FileUploadItem,
} from '@/registry/tassullo/blocks/file-upload'

/**
 * Il caricamento allegati che `INTERFACCE.md` di Anagrafe non ha ancora:
 * documenti, foto TDS, asset REN/RES/IM1-9 (`allegati` ×10, `caricamento`
 * ×16 nella sua roadmap).
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
 * `FileUpload` valida e seleziona — tipo e dimensione, con l'errore già
 * tradotto — e non carica niente da sé: l'upload vero è dell'app.
 * `FileUploadList` renderizza la coda che l'app tiene in stato, e la stessa
 * forma serve per l'elenco degli allegati già caricati in precedenza.
 *
 * **Da tastiera, senza trascinamento**: `Tab` porta il fuoco sulla cornice,
 * `Invio` o `Spazio` aprono il selettore nativo — è `react-dropzone`, non
 * codice di questo blocco, ma è la ragione per cui è stato scelto (D8).
 */
const meta = {
  title: 'Blocchi/Caricamento file',
  component: FileUpload,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FileUpload>

export default meta
type Story = StoryObj<typeof meta>

/** La cornice a riposo: trascinamento o clic, entrambi aprono lo stesso selettore. */
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
 * I cinque file dell'accettazione di M3.6, con uno che fallisce: scegliere
 * dal computer (tastiera compresa) o il bottone di prova avviano la stessa
 * simulazione — una barra per file, un errore di rete per `planimetria.pdf`.
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

/** L'elenco degli allegati già caricati: stessa lista, nessuna barra, nessuna coda. */
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
