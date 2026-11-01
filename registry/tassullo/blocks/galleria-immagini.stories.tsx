import type { Meta, StoryObj } from '@storybook/react-vite'

import { apriCol } from '@/prove/apri'
import {
  GalleriaImmagini,
  type CaricaImmagine,
  type ImmagineGalleria,
} from '@/registry/tassullo/blocks/galleria-immagini'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/tassullo/ui/card'

/**
 * Miniature in una griglia e, con un clic, l'immagine grande in un dialogo
 * quasi a tutta finestra, con «Precedente», «Successivo» e «Chiudi».
 *
 * **Quando sì, quando no.** Si usa per guardare immagini già caricate: gli
 * screenshot allegati a una richiesta, le foto di un prodotto. Per scegliere
 * e caricare file nuovi c'è `tassullo-file-upload`; per un'immagine sola che
 * rappresenta una scheda, con la sua sostituzione, `entity-image`; per un
 * PDF, `tassullo-pdf-preview`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-galleria-immagini
 * ```
 *
 * ```tsx
 * <GalleriaImmagini
 *   immagini={richiesta.screenshot}
 *   etichetta="Screenshot"
 *   carica={(s, segnale) => scarica(`/api/screenshot/${s.id}`, { signal: segnale })}
 * />
 * ```
 *
 * **Le prop.**
 *
 * - `immagini`: ognuna ha un `id` stabile e, se c'è, un `nome`.
 * - `carica(immagine, segnale)` dà l'immagine: un URL oppure un `Blob`. È il
 *   punto in cui l'app mette l'autenticazione; il blocco trasforma il `Blob`
 *   in un indirizzo e lo libera quando non serve più. Se l'immagine non c'è,
 *   la promessa si rifiuta.
 * - `etichetta`, di serie «Immagine»: il nome di un'immagine senza nome
 *   («Screenshot 2») e il conto nel dialogo («Screenshot 2 di 5»).
 * - `forma`, come in `tassullo-responsive-dialog`: di serie un dialogo sulla
 *   scrivania e un cassetto sul telefono.
 *
 * **Regole d'uso.**
 *
 * - Due colonne, tre quando la galleria è larga almeno 512px: conta la
 *   larghezza del suo contenitore, non della finestra.
 * - Ogni immagine si scarica una volta sola: l'ingrandimento usa quella della
 *   miniatura.
 * - Mentre carica, la miniatura è un riquadro grigio che pulsa; se non si
 *   carica, un'icona. L'immagine grande dice che non si carica e offre
 *   «Riprova».
 * - Sul telefono «Precedente» e «Successivo» stanno affiancati sotto
 *   l'immagine e «Chiudi» in fondo; sulla scrivania sono in fila a destra,
 *   nello stesso ordine.
 * - La miniatura mostra la parte alta dell'immagine, perché in uno screenshot
 *   è lì che si capisce di che pagina si tratta.
 *
 * **Tastiera e accessibilità.** Le miniature si raggiungono col `Tab` e si
 * aprono con `Invio` o `Spazio`; ognuna ha il nome «Ingrandisci» più il nome
 * dell'immagine. Nel dialogo `←` e `→` passano all'immagine prima e dopo,
 * `Esc` chiude e il fuoco torna sulla miniatura da cui si è partiti. Alla
 * prima e all'ultima immagine il bottone che non porta più da nessuna parte
 * si spegne ma resta raggiungibile, così il fuoco non si perde. Un'immagine
 * più alta del riquadro scorre dentro: il riquadro si raggiunge col `Tab` e
 * scorre con le frecce su e giù.
 */
type Schermata = ImmagineGalleria & { titolo: string; guasta?: boolean; larga?: boolean }

const meta = {
  title: 'Blocchi/Galleria di immagini',
  component: GalleriaImmagini<Schermata>,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof GalleriaImmagini<Schermata>>

export default meta
type Story = StoryObj<typeof meta>

// Le immagini d'esempio sono finte schermate disegnate su un canvas coi
// colori del tema, letti a runtime: niente rete, niente file binari.
function token(nome: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(nome).trim()
}

function disegna(titolo: string, larghezza: number, altezza: number): HTMLCanvasElement {
  const tela = document.createElement('canvas')
  tela.width = larghezza
  tela.height = altezza
  const c = tela.getContext('2d')
  if (!c) return tela
  const colonna = Math.round(larghezza * 0.18)
  const fascia = Math.round(altezza * 0.1)
  c.fillStyle = token('--background')
  c.fillRect(0, 0, larghezza, altezza)
  c.fillStyle = token('--sidebar')
  c.fillRect(0, 0, colonna, altezza)
  c.fillStyle = token('--border')
  c.fillRect(colonna, fascia, larghezza - colonna, 2)
  c.fillStyle = token('--primary')
  c.fillRect(larghezza - 200, fascia / 2 - 20, 160, 40)
  c.fillStyle = token('--muted-foreground')
  for (let r = 0; r < 6; r++) c.fillRect(24, fascia + 30 + r * 44, colonna - 48, 14)
  c.fillStyle = token('--card')
  c.fillRect(colonna + 32, fascia + 32, larghezza - colonna - 64, altezza - fascia - 64)
  c.fillStyle = token('--muted')
  for (let r = 0; r < 8; r++) {
    c.fillRect(colonna + 64, fascia + 140 + r * 56, (larghezza - colonna - 160) * (r % 3 === 0 ? 0.9 : 0.6), 20)
  }
  c.fillStyle = token('--foreground')
  c.font = `600 ${Math.round(altezza / 18)}px Inter, sans-serif`
  c.fillText(titolo, colonna + 64, fascia + 100)
  return tela
}

const comeBlob = (tela: HTMLCanvasElement) =>
  new Promise<Blob>((risolvi, rifiuta) =>
    tela.toBlob((b) => (b ? risolvi(b) : rifiuta(new Error('canvas vuoto'))), 'image/png'),
  )

const attendi = (ms: number, segnale: AbortSignal) =>
  new Promise<void>((risolvi, rifiuta) => {
    const t = setTimeout(risolvi, ms)
    segnale.addEventListener('abort', () => {
      clearTimeout(t)
      rifiuta(new DOMException('interrotto', 'AbortError'))
    })
  })

const SCREENSHOT: Schermata[] = [
  { id: 's1', titolo: 'Scheda del prodotto' },
  { id: 's2', titolo: 'Elenco dei listini' },
  { id: 's3', titolo: 'Errore al salvataggio' },
  { id: 's4', titolo: 'Filtri della ricerca' },
  { id: 's5', titolo: 'Anteprima della stampa', larga: true },
]

// Come un'app che scarica con l'autenticazione: un `Blob`, dopo un momento.
const caricaBlob: CaricaImmagine<Schermata> = async (s, segnale) => {
  await attendi(150, segnale)
  if (s.guasta) throw new Error('404')
  return comeBlob(disegna(s.titolo, s.larga ? 2400 : 1440, s.larga ? 900 : 900))
}

/**
 * Cinque screenshot. Il primo è aperto, a mostrare il dialogo con
 * «Precedente» spento e «Successivo».
 */
export const Predefinita: Story = {
  args: { immagini: SCREENSHOT, carica: caricaBlob, etichetta: 'Screenshot' },
  play: apriCol(
    '[data-slot="galleria-immagini-miniatura"]',
    'responsive-dialog-content',
  ),
}

/**
 * Dentro una card stretta la galleria resta a due colonne: le tre colonne le
 * decide la larghezza della galleria, non della finestra.
 */
export const InUnaCard: Story = {
  args: { immagini: SCREENSHOT.slice(0, 3), carica: caricaBlob, etichetta: 'Screenshot' },
  render: (args) => (
    <div className="flex flex-wrap items-start gap-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Screenshot (3)</CardTitle>
          <CardDescription>Fai clic su un'immagine per ingrandirla.</CardDescription>
        </CardHeader>
        <CardContent>
          <GalleriaImmagini {...args} />
        </CardContent>
      </Card>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Screenshot (3)</CardTitle>
          <CardDescription>Fai clic su un'immagine per ingrandirla.</CardDescription>
        </CardHeader>
        <CardContent>
          <GalleriaImmagini {...args} />
        </CardContent>
      </Card>
    </div>
  ),
}

/**
 * Un'immagine sola, data come indirizzo invece che come `Blob`: il dialogo
 * non ha «Precedente» né «Successivo».
 */
export const UnaSola: Story = {
  args: {
    immagini: [{ id: 'f1', nome: 'Foto del prodotto', titolo: 'Malta R4 fibrorinforzata' }],
    carica: async (s: Schermata) => disegna(s.titolo, 1200, 900).toDataURL('image/png'),
  },
  play: apriCol(
    '[data-slot="galleria-immagini-miniatura"]',
    'responsive-dialog-content',
  ),
}

/**
 * La prima immagine non si carica: la miniatura mostra un'icona, e l'immagine
 * grande lo dice e offre «Riprova».
 */
export const ConErrore: Story = {
  args: {
    immagini: [{ ...SCREENSHOT[0], guasta: true }, ...SCREENSHOT.slice(1, 3)],
    carica: caricaBlob,
    etichetta: 'Screenshot',
  },
  play: apriCol(
    '[data-slot="galleria-immagini-miniatura"]',
    'responsive-dialog-content',
  ),
}

/** Mentre le immagini arrivano: le miniature pulsano. */
export const InCaricamento: Story = {
  args: {
    immagini: SCREENSHOT.slice(0, 3),
    carica: () => new Promise<Blob>(() => {}),
    etichetta: 'Screenshot',
  },
}

/**
 * Sul telefono l'immagine grande sale in un cassetto: «Precedente» e
 * «Successivo» affiancati sotto l'immagine, «Chiudi» in fondo.
 */
export const Telefono: Story = {
  globals: { viewport: { value: 'telefono', isRotated: false } },
  args: { immagini: SCREENSHOT, carica: caricaBlob, etichetta: 'Screenshot', forma: 'drawer' },
  play: apriCol(
    '[data-slot="galleria-immagini-miniatura"]',
    'responsive-dialog-content',
  ),
}
