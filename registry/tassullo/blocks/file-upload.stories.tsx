import { useEffect, useState } from 'react'
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
 *   `massimo` è il tetto al numero di file, e `presenti` quanti l'app ne
 *   tiene già.
 * - `FileUploadList`: `file`, l'elenco che l'app tiene nel suo stato, e
 *   `onRimuovi`. Ogni file è in coda, in corso con il suo avanzamento,
 *   riuscito o fallito. Per le immagini ci sono quattro forme, e ogni voce
 *   porta la sua `anteprima`: il file appena scelto, così com'è, o
 *   l'indirizzo di un'immagine già caricata. `"miniature"` è la griglia di
 *   miniature grandi; `"miniature-compatte"` sono piccole, col nome sotto;
 *   `"solo-immagini"` senza il nome; `"righe-con-immagine"` mette
 *   l'immagine a sinistra e nome e peso a destra.
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
 * - Le immagini si mostrano a miniature: si riconoscono a colpo d'occhio,
 *   mentre due nomi come `image.png` non si distinguono. Le miniature grandi
 *   stanno su due colonne dove il posto è poco e su tre o quattro dove ce
 *   n'è. Dove lo spazio è poco, come in un dialogo, si usano le compatte:
 *   tre per riga sul telefono, cinque dove c'è posto. Le sole immagini sono
 *   per le immagini che si riconoscono da sé; le righe con immagine per
 *   quando conta leggere il nome.
 * - Con un tetto, il blocco conta i file che l'app tiene già. Se se ne
 *   scelgono più di quanti ne entrano, entrano i primi e gli altri tornano
 *   con il loro messaggio. Al tetto il bottone si spegne e la cornice dice
 *   perché; accanto al bottone compatto la frase la scrive l'app, al posto
 *   di quella che dice quanti file si possono aggiungere.
 *
 * **Tastiera e accessibilità.** Il trascinamento non è l'unica via: nella
 * cornice c'è un bottone, che si raggiunge col `Tab` e con `Invio` o `Spazio`
 * apre la scelta dei file. La cornice in sé non riceve il fuoco. Nella forma
 * compatta il bottone è tutto il blocco, e il file si trascina sopra di lui.
 * Ogni miniatura ha il suo bottone «Togli», accanto al nome o sopra
 * l'immagine secondo la forma, che si raggiunge col `Tab`; la miniatura in
 * invio non ne ha.
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

/** Il campo file nascosto della scena, e i file scelti fatti arrivare come dal selettore. */
function scegli(canvasElement: HTMLElement, ...file: File[]) {
  const campo = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!
  const trasferimento = new DataTransfer()
  file.forEach((f) => trasferimento.items.add(f))
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

const IMMAGINI = { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }
const DIECI_MB = 10 * 1024 * 1024
const TONI = ['--primary', '--info', '--success', '--warning', '--chart-2']

/** Un'immagine d'esempio disegnata coi colori del tema: nessun file nel repository. */
function disegna(nome: string, tono: string) {
  const stile = getComputedStyle(document.documentElement)
  const tela = document.createElement('canvas')
  tela.width = 400
  tela.height = 300
  const pennello = tela.getContext('2d')!
  pennello.fillStyle = stile.getPropertyValue('--muted')
  pennello.fillRect(0, 0, 400, 300)
  pennello.fillStyle = stile.getPropertyValue(tono)
  pennello.fillRect(0, 0, 400, 40)
  pennello.fillRect(290, 70, 90, 90)
  pennello.fillStyle = stile.getPropertyValue('--border')
  for (let riga = 0; riga < 5; riga++) pennello.fillRect(24, 64 + riga * 40, 240 - riga * 20, 18)
  return new Promise<File>((risolvi) =>
    tela.toBlob((blob) => risolvi(new File([blob!], nome, { type: 'image/png' }))),
  )
}

function useImmaginiDemo(nomi: string[]) {
  const [immagini, setImmagini] = useState<File[] | null>(null)
  const chiave = nomi.join('|')
  useEffect(() => {
    Promise.all(chiave.split('|').map((nome, i) => disegna(nome, TONI[i % TONI.length]))).then(
      setImmagini,
    )
  }, [chiave])
  return immagini
}

const NOMI_DEMO = [
  'screenshot-1.png',
  'errore-scheda-prodotto-tassullo-t30.png',
  'foto-cantiere-02.png',
  'planimetria-piano-terra.png',
]

/**
 * Le immagini a miniature, con un tetto di cinque. Si aggiungono con la
 * cornice, si tolgono con la crocetta accanto al nome; «Invia» mostra
 * l'avanzamento sulle miniature, che durante l'invio non si tolgono. Al
 * tetto la cornice si spegne e dice perché.
 *
 * ```tsx
 * <FileUpload
 *   massimo={5}
 *   presenti={immagini.length}
 *   accetta={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }}
 *   dimensioneMassima={10 * 1024 * 1024}
 *   onFile={aggiungi}
 *   onRifiutati={mostraErrori}
 * />
 * <FileUploadList forma="miniature" file={immagini} onRimuovi={togli} />
 * ```
 */
export const Miniature: Story = {
  args: { onFile: () => {} },
  render: () => <DemoMiniature quante={2} forma="zona" />,
}

/**
 * La forma compatta con le miniature, come nel modulo di una richiesta: il
 * bottone sotto la griglia, e accanto la frase che scrive l'app. Al tetto il
 * bottone si spegne e la frase dice perché.
 *
 * ```tsx
 * <FileUploadList forma="miniature" file={immagini} onRimuovi={togli} />
 * <FileUpload forma="bottone" etichettaBottone="Aggiungi un'immagine"
 *   massimo={5} presenti={immagini.length} accetta={IMMAGINI} onFile={aggiungi} />
 * <FieldDescription>
 *   {immagini.length < 5
 *     ? 'Fino a 5 immagini PNG o JPEG, ciascuna fino a 10 MB.'
 *     : "Hai raggiunto il massimo di 5 immagini. Togline una per aggiungerne un'altra."}
 * </FieldDescription>
 * ```
 */
export const MiniatureColBottone: Story = {
  name: 'Miniature col bottone',
  args: { onFile: () => {} },
  render: () => <DemoMiniature quante={4} forma="bottone" />,
}

/**
 * Miniature piccole, col nome sotto e la crocetta sopra l'immagine: tre per
 * riga sul telefono e cinque dove c'è posto, il peso non c'è. È la forma del
 * dialogo del supporto, dove cinque screenshot devono stare in poco spazio.
 *
 * ```tsx
 * <FileUploadList forma="miniature-compatte" file={immagini} onRimuovi={togli} />
 * ```
 */
export const MiniatureCompatte: Story = {
  name: 'Miniature compatte',
  args: { onFile: () => {} },
  render: () => <DemoMiniature quante={4} forma="bottone" elenco="miniature-compatte" />,
}

/**
 * Le sole immagini, con la crocetta sopra: la forma più bassa. Il nome si
 * legge passandoci sopra col puntatore, quindi va bene dove le immagini si
 * riconoscono da sé.
 *
 * ```tsx
 * <FileUploadList forma="solo-immagini" file={immagini} onRimuovi={togli} />
 * ```
 */
export const SoloImmagini: Story = {
  name: 'Solo immagini',
  args: { onFile: () => {} },
  render: () => <DemoMiniature quante={4} forma="bottone" elenco="solo-immagini" />,
}

/**
 * L'immagine a sinistra, nome e peso a destra, la crocetta in fondo: una
 * colonna sul telefono, due dove c'è posto. Il nome si legge meglio che
 * nelle griglie.
 *
 * ```tsx
 * <FileUploadList forma="righe-con-immagine" file={immagini} onRimuovi={togli} />
 * ```
 */
export const RigheConImmagine: Story = {
  name: 'Righe con immagine',
  args: { onFile: () => {} },
  render: () => <DemoMiniature quante={4} forma="bottone" elenco="righe-con-immagine" />,
}

type FormaImmagini = 'miniature' | 'miniature-compatte' | 'solo-immagini' | 'righe-con-immagine'

function DemoMiniature({
  quante,
  forma,
  elenco = 'miniature',
}: {
  quante: number
  forma: 'zona' | 'bottone'
  elenco?: FormaImmagini
}) {
  const immagini = useImmaginiDemo(NOMI_DEMO.slice(0, quante))
  return immagini ? <ScenaMiniature iniziali={immagini} forma={forma} elenco={elenco} /> : null
}

function ScenaMiniature({
  iniziali,
  forma,
  elenco,
}: {
  iniziali: File[]
  forma: 'zona' | 'bottone'
  elenco: FormaImmagini
}) {
  const voce = (file: File): FileUploadItem => ({
    id: nuovoIdDemo(),
    nome: file.name,
    dimensione: file.size,
    stato: 'in-coda',
    anteprima: file,
  })
  const [immagini, setImmagini] = useState<FileUploadItem[]>(() => iniziali.map(voce))
  const [errori, setErrori] = useState<string[]>([])
  const inInvio = immagini.some((i) => i.stato === 'in-corso')
  const pieno = immagini.length >= 5

  function invia() {
    setImmagini((prima) => prima.map((i) => ({ ...i, stato: 'in-corso', progresso: 0 })))
    const intervallo = setInterval(() => {
      setImmagini((prima) => {
        const progresso = (prima[0]?.progresso ?? 0) + 25
        if (progresso >= 100) clearInterval(intervallo)
        return prima.map((i) =>
          progresso >= 100
            ? { ...i, stato: 'riuscito', progresso: 100 }
            : { ...i, progresso },
        )
      })
    }, 300)
  }

  const comuni = {
    massimo: 5,
    presenti: immagini.length,
    accetta: IMMAGINI,
    dimensioneMassima: DIECI_MB,
    disabilitato: inInvio,
    onFile: (file: File[]) => {
      setErrori([])
      setImmagini((prima) => [...prima, ...file.map(voce)])
    },
    onRifiutati: (rifiutati: { file: File; errore: string }[]) =>
      setErrori(rifiutati.map((r) => `«${r.file.name}»: ${r.errore.toLowerCase()}.`)),
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      {forma === 'zona' ? (
        <>
          <FileUpload
            {...comuni}
            etichetta="Trascina le immagini qui"
            descrizione="Fino a 5 immagini PNG o JPEG, ciascuna fino a 10 MB"
          />
          <FileUploadList
            forma={elenco}
            file={immagini}
            onRimuovi={(id) => setImmagini((prima) => prima.filter((i) => i.id !== id))}
          />
        </>
      ) : (
        <>
          <FileUploadList
            forma={elenco}
            file={immagini}
            onRimuovi={(id) => setImmagini((prima) => prima.filter((i) => i.id !== id))}
          />
          <div className="flex flex-col items-start gap-2">
            <FileUpload
              {...comuni}
              forma="bottone"
              etichettaBottone={immagini.length ? "Aggiungi un'immagine" : 'Scegli le immagini'}
            />
            <p className="text-sm text-muted-foreground" data-prova="frase">
              {pieno
                ? "Hai raggiunto il massimo di 5 immagini. Togline una per aggiungerne un'altra."
                : 'Fino a 5 immagini PNG o JPEG, ciascuna fino a 10 MB.'}
            </p>
          </div>
        </>
      )}
      {errori.length ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>
            {errori.map((errore) => (
              <p key={errore}>{errore}</p>
            ))}
          </AlertDescription>
        </Alert>
      ) : null}
      <Button className="self-start" onClick={invia} disabled={inInvio || !immagini.length}>
        Invia
      </Button>
    </div>
  )
}

function png(nome: string) {
  return new File(['immagine'], nome, { type: 'image/png' })
}

// Scena di misura di «Miniature»: con quattro immagini e posto per una, una
// scelta di tre ne fa entrare una e ne rimanda due con il loro messaggio; al
// tetto la cornice si spegne e lo dice. Le crocette si usano da tastiera
// (`Invio` e `Spazio`), la griglia sta su tre colonne in un contenitore
// largo 672px, e durante l'invio le miniature hanno la barra e non si
// tolgono. `!dev` la toglie dalla barra e da Docs; il gate la esegue.
export const MiniatureProva: Story = {
  name: 'Miniature, prova',
  tags: ['!dev', '!autodocs'],
  args: { onFile: () => {} },
  render: () => <DemoMiniature quante={4} forma="zona" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    const miniature = () => canvasElement.querySelectorAll('[data-slot="file-upload-miniatura"]')
    await waitFor(() => expect(miniature()).toHaveLength(4))
    const griglia = canvasElement.querySelector<HTMLElement>('[data-slot="file-upload-miniature"]')!
    await expect(getComputedStyle(griglia).gridTemplateColumns.split(' ')).toHaveLength(3)
    const immagine = miniature()[0].querySelector('img')!
    await expect(immagine.src.startsWith('blob:')).toBe(true)

    scegli(canvasElement, png('uno.png'), png('due.png'), png('tre.png'))
    await waitFor(() => expect(miniature()).toHaveLength(5))
    const avviso = await waitFor(() => c.getByRole('alert'))
    await expect(avviso).toHaveTextContent('«due.png»: oltre il massimo di 5 file.')
    await expect(avviso).toHaveTextContent('«tre.png»: oltre il massimo di 5 file.')
    const zona = canvasElement.querySelector<HTMLElement>('[data-slot="file-upload-dropzone"]')!
    await expect(zona).toHaveTextContent('Hai raggiunto il massimo di 5 file')
    await expect(c.getByRole('button', { name: 'Scegli dal computer' })).toBeDisabled()

    c.getByRole('button', { name: 'Togli uno.png' }).focus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(miniature()).toHaveLength(4))
    await expect(c.getByRole('button', { name: 'Scegli dal computer' })).toBeEnabled()
    await expect(zona).toHaveTextContent('Fino a 5 immagini PNG o JPEG')
    c.getByRole('button', { name: 'Togli screenshot-1.png' }).focus()
    await userEvent.keyboard(' ')
    await waitFor(() => expect(miniature()).toHaveLength(3))

    await userEvent.click(c.getByRole('button', { name: 'Invia' }))
    await waitFor(() => expect(c.getAllByRole('progressbar')).toHaveLength(3))
    await expect(c.queryAllByRole('button', { name: /^Togli/ })).toHaveLength(0)
    await waitFor(() => expect(c.getAllByRole('button', { name: /^Togli/ })).toHaveLength(3))
  },
}

// Scena di misura di «Miniature col bottone»: con quattro immagini, una
// scelta in più porta al tetto, il bottone si spegne e la frase dell'app
// cambia; togliendone una il bottone torna. `!dev` la toglie dalla barra e
// da Docs; il gate la esegue.
export const MiniatureColBottoneProva: Story = {
  name: 'Miniature col bottone, prova',
  tags: ['!dev', '!autodocs'],
  args: { onFile: () => {} },
  render: () => <DemoMiniature quante={4} forma="bottone" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    const miniature = () => canvasElement.querySelectorAll('[data-slot="file-upload-miniatura"]')
    await waitFor(() => expect(miniature()).toHaveLength(4))
    scegli(canvasElement, png('quinta.png'))
    await waitFor(() => expect(miniature()).toHaveLength(5))
    await expect(c.getByRole('button', { name: "Aggiungi un'immagine" })).toBeDisabled()
    await expect(canvasElement.querySelector('[data-prova="frase"]')).toHaveTextContent(
      'Hai raggiunto il massimo di 5 immagini',
    )
    await userEvent.click(c.getByRole('button', { name: 'Togli quinta.png' }))
    await waitFor(() => expect(miniature()).toHaveLength(4))
    await expect(c.getByRole('button', { name: "Aggiungi un'immagine" })).toBeEnabled()
  },
}

// Scene di misura delle tre forme compatte: quante colonne a 672px, il nome
// scritto o nel suggerimento, la crocetta da tastiera, e durante l'invio la
// barra al posto della crocetta. `!dev` le toglie dalla barra e da Docs; il
// gate le esegue.
function provaForma(elenco: FormaImmagini, colonne: number, nomeScritto: boolean): Story {
  return {
    tags: ['!dev', '!autodocs'],
    args: { onFile: () => {} },
    render: () => <DemoMiniature quante={4} forma="bottone" elenco={elenco} />,
    play: async ({ canvasElement }) => {
      const c = within(canvasElement)
      const miniature = () => canvasElement.querySelectorAll('[data-slot="file-upload-miniatura"]')
      await waitFor(() => expect(miniature()).toHaveLength(4))
      const griglia = canvasElement.querySelector<HTMLElement>('[data-slot="file-upload-miniature"]')!
      await expect(griglia.dataset.forma).toBe(elenco)
      await expect(getComputedStyle(griglia).gridTemplateColumns.split(' ')).toHaveLength(colonne)
      const lungo = 'errore-scheda-prodotto-tassullo-t30.png'
      if (nomeScritto) await expect(c.getByTitle(lungo)).toHaveTextContent(lungo)
      else await expect(miniature()[1]).toHaveAttribute('title', lungo)

      c.getByRole('button', { name: `Togli ${lungo}` }).focus()
      await userEvent.keyboard('{Enter}')
      await waitFor(() => expect(miniature()).toHaveLength(3))

      await userEvent.click(c.getByRole('button', { name: 'Invia' }))
      await waitFor(() => expect(c.getAllByRole('progressbar')).toHaveLength(3))
      await expect(c.queryAllByRole('button', { name: /^Togli/ })).toHaveLength(0)
      await waitFor(() => expect(c.getAllByRole('button', { name: /^Togli/ })).toHaveLength(3))
    },
  }
}

export const MiniatureCompatteProva: Story = {
  name: 'Miniature compatte, prova',
  ...provaForma('miniature-compatte', 5, true),
}

export const SoloImmaginiProva: Story = {
  name: 'Solo immagini, prova',
  ...provaForma('solo-immagini', 5, false),
}

export const RigheConImmagineProva: Story = {
  name: 'Righe con immagine, prova',
  ...provaForma('righe-con-immagine', 2, true),
}
