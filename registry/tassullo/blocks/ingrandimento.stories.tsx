import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { apriCol } from '@/prove/apri'
import { Ingrandimento } from '@/registry/tassullo/blocks/ingrandimento'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/tassullo/ui/card'

/**
 * Un disegno o un'immagine in pagina, in scala; con un clic o un tocco, lo
 * stesso disegno a tutta finestra, da ingrandire e spostare per leggere le
 * quote.
 *
 * **Quando sì, quando no.** Si usa per un disegno tecnico che l'app genera —
 * un `<svg>` con quote e testi piccoli — o per una foto di dettaglio da
 * guardare da vicino. Per più immagini da sfogliare c'è
 * `tassullo-galleria-immagini`; per la foto che rappresenta una scheda,
 * `entity-image`; per un PDF, `tassullo-pdf-preview`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-ingrandimento
 * ```
 *
 * ```tsx
 * <Ingrandimento titolo="Sezione A-A" descrizione="Solaio del primo piano" className="max-w-xl">
 *   <DisegnoSezione />
 * </Ingrandimento>
 *
 * <Ingrandimento titolo="Dettaglio del nodo" src={foto} />
 * ```
 *
 * **Le prop.**
 *
 * - `titolo`: sta in testa all'ingrandimento e dà il nome al bottone
 *   («Ingrandisci Sezione A-A»).
 * - Il contenuto: un nodo React fra i figli, di solito un `<svg>` con
 *   `viewBox`, oppure `src` per un'immagine, con `alt` se serve un testo
 *   diverso dal titolo.
 * - `descrizione`: una riga sotto il titolo.
 * - `rapporto`: larghezza diviso altezza. Di serie si legge dal `viewBox`
 *   dell'SVG o dalla misura dell'immagine; serve solo a un `<svg>` senza
 *   `viewBox`.
 * - `className`: le classi dell'anteprima in pagina, per esempio una
 *   larghezza massima.
 *
 * Per un ingrandimento già dentro un riquadro, senza anteprima e senza
 * dialogo, c'è `AreaIngrandimento`, con le stesse regole: riempie il suo
 * contenitore, che deve avere un'altezza.
 *
 * **Regole d'uso.**
 *
 * - L'anteprima è larga quanto il suo contenitore e alta quanto chiede il
 *   disegno: per un disegno molto alto si dà una larghezza massima.
 * - Il disegno resta vettoriale: si ridisegna alla grandezza a cui lo si
 *   guarda, quindi i testi piccoli restano nitidi a ogni ingrandimento.
 * - L'SVG si colora coi colori del tema (`fill-foreground`,
 *   `stroke-muted-foreground`), così segue la modalità scura.
 * - Il disegno compare due volte, in pagina e nell'ingrandimento. Se usa degli
 *   `id` — le frecce delle quote come `marker`, un tratteggio come `pattern` —
 *   conviene generarli con `useId` dentro il componente del disegno: ogni
 *   copia ha così i suoi.
 * - Si va da «Adatta», il disegno intero nella finestra, a otto volte tanto.
 *   Il disegno non esce mai dalla finestra.
 *
 * **I comandi.** Sul telefono: due dita per ingrandire, un dito per spostarsi,
 * doppio tocco per ingrandire sul punto toccato o per tornare ad «Adatta».
 * Sulla scrivania: la rotella e il pizzico del trackpad ingrandiscono intorno
 * al puntatore, il mouse trascina, e sotto il disegno ci sono «Riduci», la
 * percentuale, «Ingrandisci» e «Adatta». La pagina intera non si ingrandisce
 * mai.
 *
 * **Tastiera e accessibilità.** L'anteprima si raggiunge col `Tab` e si apre
 * con `Invio` o `Spazio`. Aperto l'ingrandimento, il fuoco va sul disegno:
 * `+` ingrandisce, `-` riduce, `0` adatta, le frecce spostano, `Esc` chiude e
 * il fuoco torna sull'anteprima. I tasti valgono anche col fuoco sui bottoni.
 * Il livello di zoom si annuncia a chi usa un lettore di schermo quando il
 * gesto si ferma.
 */
const meta = {
  title: 'Blocchi/Ingrandimento',
  component: Ingrandimento,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Ingrandimento>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Un disegno come quelli che genera un'app: la sezione di un solaio, con le
 * quote e le note in testi piccoli. Gli `id` dei `marker` sono fissi apposta,
 * il caso peggiore: le due copie del disegno li hanno uguali.
 */
function SezioneSolaio() {
  const quota = 'fill-none stroke-muted-foreground'
  const testo = 'fill-foreground'
  return (
    <svg viewBox="0 0 800 360" role="img" aria-label="Sezione A-A del solaio">
      <defs>
        <marker
          id="quota-freccia"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-muted-foreground" />
        </marker>
        <pattern id="quota-tratteggio" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0,8 L8,0" className="stroke-muted-foreground" strokeWidth="0.6" />
        </pattern>
      </defs>

      {/* La soletta e i travetti */}
      <rect x="80" y="110" width="640" height="40" className="fill-muted stroke-foreground" strokeWidth="1.5" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect
            x={100 + i * 140}
            y="150"
            width="40"
            height="90"
            fill="url(#quota-tratteggio)"
            className="stroke-foreground"
            strokeWidth="1.5"
          />
          <circle cx={112 + i * 140} cy="228" r="3" className="fill-foreground" />
          <circle cx={128 + i * 140} cy="228" r="3" className="fill-foreground" />
          {i < 4 ? (
            <rect
              x={140 + i * 140}
              y="170"
              width="100"
              height="70"
              className="fill-none stroke-muted-foreground"
              strokeDasharray="4 3"
            />
          ) : null}
        </g>
      ))}

      {/* Quote orizzontali */}
      <line x1="80" y1="70" x2="720" y2="70" className={quota} markerStart="url(#quota-freccia)" markerEnd="url(#quota-freccia)" />
      <text x="400" y="64" textAnchor="middle" fontSize="9" className={testo}>
        L = 6,40 m
      </text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line
            x1={120 + i * 140}
            y1="290"
            x2={260 + i * 140}
            y2="290"
            className={quota}
            markerStart="url(#quota-freccia)"
            markerEnd="url(#quota-freccia)"
          />
          <text x={190 + i * 140} y="285" textAnchor="middle" fontSize="6" className={testo}>
            i = 50 cm
          </text>
        </g>
      ))}

      {/* Quote verticali */}
      <line x1="750" y1="110" x2="750" y2="240" className={quota} markerStart="url(#quota-freccia)" markerEnd="url(#quota-freccia)" />
      <text x="756" y="178" fontSize="6" className={testo}>
        h = 24 cm
      </text>
      <line x1="40" y1="110" x2="40" y2="150" className={quota} markerStart="url(#quota-freccia)" markerEnd="url(#quota-freccia)" />
      <text x="10" y="133" fontSize="5" className={testo}>
        4 cm
      </text>

      {/* Note in testo piccolo */}
      <text x="80" y="325" fontSize="5" className={testo}>
        Travetti tralicciati 12×20 cm, armatura inferiore 2 Ø 12, calcestruzzo C25/30, copriferro 2,5 cm.
      </text>
      <text x="80" y="335" fontSize="5" className={testo}>
        Pignatte in laterizio 38×50×20 cm. Rete elettrosaldata Ø 6 maglia 20×20 cm nella soletta.
      </text>
      <text x="80" y="345" fontSize="4" className="fill-muted-foreground">
        Disegno d'esempio: misure inventate.
      </text>
      <text x="400" y="30" textAnchor="middle" fontSize="12" fontWeight="600" className={testo}>
        SEZIONE A-A
      </text>
    </svg>
  )
}

// L'immagine d'esempio è disegnata su un canvas coi colori del tema, letti a
// runtime: niente rete, niente file binari.
function token(nome: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(nome).trim()
}

function fotoDettaglio(): string {
  const tela = document.createElement('canvas')
  tela.width = 1600
  tela.height = 1200
  const c = tela.getContext('2d')
  if (!c) return ''
  c.fillStyle = token('--muted')
  c.fillRect(0, 0, 1600, 1200)
  c.fillStyle = token('--border')
  for (let r = 0; r < 12; r++) c.fillRect(0, r * 100, 1600, 2)
  c.fillStyle = token('--primary')
  c.fillRect(500, 350, 600, 500)
  c.fillStyle = token('--background')
  c.fillRect(560, 410, 480, 380)
  c.fillStyle = token('--foreground')
  c.font = '500 18px Inter, sans-serif'
  c.fillText('Targhetta: lotto 24-118, scadenza 03/2027', 590, 460)
  c.font = '400 11px Inter, sans-serif'
  c.fillText('Conservare in luogo asciutto, al riparo dal gelo.', 590, 490)
  return tela.toDataURL('image/png')
}

function ConFoto(props: { titolo: string; className?: string }) {
  const [src] = useState(fotoDettaglio)
  return <Ingrandimento {...props} src={src} alt="La targhetta di un sacco, con lotto e scadenza" />
}

/**
 * Il disegno di una sezione, aperto: a tutta finestra, adattato, coi comandi
 * sotto.
 */
export const Predefinita: Story = {
  args: {
    titolo: 'Sezione A-A',
    descrizione: 'Solaio del primo piano',
    className: 'max-w-xl',
    children: <SezioneSolaio />,
  },
  play: apriCol('[data-slot="ingrandimento-anteprima"]', 'dialog-content'),
}

/** In pagina, dentro una card: l'anteprima in scala, con la lente in basso a destra. */
export const InPagina: Story = {
  args: { titolo: 'Sezione A-A', children: <SezioneSolaio /> },
  render: (args) => (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Solaio del primo piano</CardTitle>
        <CardDescription>Fai clic sul disegno per ingrandirlo e leggere le quote.</CardDescription>
      </CardHeader>
      <CardContent>
        <Ingrandimento {...args} />
      </CardContent>
    </Card>
  ),
}

/** Una foto di dettaglio data come `src`, al posto di un disegno. */
export const Immagine: Story = {
  // `src` si genera nella scena, dopo che il tema è caricato.
  args: { titolo: 'Dettaglio della targhetta', className: 'max-w-md', src: '' },
  render: (args) => <ConFoto titolo={args.titolo} className={args.className} />,
  play: apriCol('[data-slot="ingrandimento-anteprima"]', 'dialog-content'),
}

/**
 * Sul telefono: a tutta finestra anche lì, non un cassetto. Il dito che
 * trascina sposta il disegno; in un cassetto lo chiuderebbe.
 */
export const Telefono: Story = {
  globals: { viewport: { value: 'telefono', isRotated: false } },
  args: { titolo: 'Sezione A-A', descrizione: 'Solaio del primo piano', children: <SezioneSolaio /> },
  play: apriCol('[data-slot="ingrandimento-anteprima"]', 'dialog-content'),
}

// ── Scena di misura ────────────────────────────────────────────────────
// I gesti con eventi di puntatore, la rotella, la tastiera e i bottoni, in
// Chromium e in WebKit (etichetta `webkit`). Gli eventi sono costruiti a mano:
// le due dita di un pizzico Playwright non le sa dare in WebKit. La prova con
// i tocchi veri di Chromium sta nel diario.

function larghezza(el: Element) {
  return el.getBoundingClientRect().width
}

function puntatore(
  el: Element,
  tipo: 'pointerdown' | 'pointermove' | 'pointerup',
  id: number,
  x: number,
  y: number,
) {
  el.dispatchEvent(
    new PointerEvent(tipo, {
      pointerId: id,
      pointerType: 'touch',
      isPrimary: id === 1,
      clientX: x,
      clientY: y,
      button: 0,
      bubbles: true,
      cancelable: true,
    }),
  )
}

/** Gesti, rotella, tastiera e bottoni: ogni comando cambia la vista come deve. */
export const GestiProva: Story = {
  name: 'Gesti, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  args: { titolo: 'Sezione A-A', children: <SezioneSolaio /> },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      canvasElement.querySelector('[data-slot="ingrandimento-anteprima"]') as HTMLElement,
    )
    const corpo = within(document.body)
    const area = await corpo.findByRole('region', { name: 'Sezione A-A' })
    const foglio = area.querySelector('[data-slot="ingrandimento-foglio"]') as HTMLElement
    const percentuale = () =>
      document.querySelector('[data-slot="ingrandimento-comandi"] [data-slot="button-group-text"]')
        ?.textContent
    await waitFor(() => expect(document.activeElement).toBe(area))
    // Le misure si prendono a dialogo fermo: l'animazione d'apertura lo
    // rimpicciolisce per un momento, e con lui l'area. Senza fotogrammi
    // l'animazione non avanzerebbe, quindi la si porta alla fine.
    for (const a of document.querySelector('[data-slot="dialog-content"]')?.getAnimations() ?? []) a.finish()
    await waitFor(() => expect(larghezza(foglio)).toBeGreaterThan(100))
    const adatta = larghezza(foglio)
    const r = area.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2

    // Ad «Adatta» il trascinamento non sposta niente: il disegno sta intero.
    const primaX = foglio.getBoundingClientRect().left
    puntatore(area, 'pointerdown', 1, cx, cy)
    puntatore(area, 'pointermove', 1, cx + 80, cy)
    puntatore(area, 'pointerup', 1, cx + 80, cy)
    await expect(foglio.getBoundingClientRect().left).toBeCloseTo(primaX, 0)

    // Pizzico: le dita si allontanano del doppio, il disegno raddoppia.
    puntatore(area, 'pointerdown', 1, cx - 40, cy)
    puntatore(area, 'pointerdown', 2, cx + 40, cy)
    puntatore(area, 'pointermove', 1, cx - 80, cy)
    puntatore(area, 'pointermove', 2, cx + 80, cy)
    puntatore(area, 'pointerup', 1, cx - 80, cy)
    puntatore(area, 'pointerup', 2, cx + 80, cy)
    await waitFor(() => expect(larghezza(foglio) / adatta).toBeCloseTo(2, 1))
    await waitFor(() => expect(percentuale()).toBe('200%'))
    // Il disegno si ridisegna alla misura nuova: l'SVG è largo quanto il foglio.
    await expect(larghezza(foglio.querySelector('svg') as SVGElement)).toBeCloseTo(larghezza(foglio), 0)

    // Ingrandito, il trascinamento sposta.
    const ingranditoX = foglio.getBoundingClientRect().left
    puntatore(area, 'pointerdown', 1, cx, cy)
    puntatore(area, 'pointermove', 1, cx + 60, cy)
    puntatore(area, 'pointerup', 1, cx + 60, cy)
    await waitFor(() => expect(foglio.getBoundingClientRect().left).toBeCloseTo(ingranditoX + 60, 0))

    // Doppio tocco da ingrandito: torna ad «Adatta».
    for (let i = 0; i < 2; i++) {
      puntatore(area, 'pointerdown', 1, cx, cy)
      puntatore(area, 'pointerup', 1, cx, cy)
    }
    await waitFor(() => expect(larghezza(foglio)).toBeCloseTo(adatta, 0))
    // Doppio tocco da adattato: ingrandisce due volte.
    await new Promise((fine) => setTimeout(fine, 350))
    for (let i = 0; i < 2; i++) {
      puntatore(area, 'pointerdown', 1, cx, cy)
      puntatore(area, 'pointerup', 1, cx, cy)
    }
    await waitFor(() => expect(larghezza(foglio) / adatta).toBeCloseTo(2, 1))

    // La rotella verso l'alto ingrandisce, e la pagina non scorre.
    const primaRotella = larghezza(foglio)
    const rotella = new WheelEvent('wheel', {
      deltaY: -100,
      clientX: cx,
      clientY: cy,
      bubbles: true,
      cancelable: true,
    })
    area.dispatchEvent(rotella)
    await expect(rotella.defaultPrevented).toBe(true)
    await waitFor(() => expect(larghezza(foglio)).toBeGreaterThan(primaRotella))

    // Tastiera: 0 adatta, + ingrandisce di una volta e mezza, - riduce, le
    // frecce spostano.
    area.focus()
    await userEvent.keyboard('0')
    await waitFor(() => expect(larghezza(foglio)).toBeCloseTo(adatta, 0))
    await userEvent.keyboard('+')
    await waitFor(() => expect(percentuale()).toBe('150%'))
    const primaFreccia = foglio.getBoundingClientRect().left
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(foglio.getBoundingClientRect().left).toBeLessThan(primaFreccia))
    await userEvent.keyboard('-')
    await waitFor(() => expect(percentuale()).toBe('100%'))

    // I bottoni, e il livello annunciato.
    const ingrandisci = corpo.getByRole('button', { name: 'Ingrandisci' })
    await userEvent.click(ingrandisci)
    await userEvent.click(ingrandisci)
    await waitFor(() => expect(percentuale()).toBe('225%'))
    await waitFor(() => expect(corpo.getByRole('status')).toHaveTextContent('Ingrandimento 225%'))
    await userEvent.click(corpo.getByRole('button', { name: 'Adatta' }))
    await waitFor(() => expect(larghezza(foglio)).toBeCloseTo(adatta, 0))
    await expect(corpo.getByRole('button', { name: 'Adatta' })).toHaveAttribute('aria-disabled', 'true')

    // Esc chiude, e il fuoco torna sull'anteprima.
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(document.activeElement).toBe(
        canvasElement.querySelector('[data-slot="ingrandimento-anteprima"]'),
      ),
    )
  },
}
