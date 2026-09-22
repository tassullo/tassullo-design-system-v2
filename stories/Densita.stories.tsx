import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '@/registry/tassullo/ui/button'

/**
 * Tema / Densità — M1.4.
 *
 * Le due densità si guardano **affiancate**, non alternandole con
 * l'interruttore in barra: fra un clic e l'altro non si vede più *quanto*
 * cambia, si vede solo *che* cambia. Funziona perché il tema emette anche un
 * blocco `[data-density="normale"]`, che rimette la densità normale dentro un
 * sottoalbero touch — stesso motivo per cui il chiaro si emette anche su
 * `.light` (M1.3).
 *
 * **Le misure in pagina sono lette, non dichiarate.** Ogni riquadro riporta
 * l'altezza reale del suo elemento, presa con `getBoundingClientRect` dopo il
 * layout. È una scelta contro un difetto specifico: una tabella di numeri
 * scritta a mano resta verde anche quando il CSS smette di funzionare, e
 * questa pagina è la prova che il CSS funziona. Se un giorno il meccanismo si
 * rompe, i numeri qui lo dicono da soli.
 *
 * L'interruttore Densità della barra continua a valere e agisce su `<html>`:
 * mettendolo su Touch, questa pagina non cambia — le due colonne fissano la
 * propria densità con l'attributo, e vincono su quella ereditata. È il
 * comportamento voluto, ed è anche la dimostrazione che la densità si può
 * annidare.
 */

/** Legge il font-size calcolato: per la tipografia è quella la misura. */
function useCorpo<T extends HTMLElement>() {
  const rif = useRef<T>(null)
  const [px, setPx] = useState<string | null>(null)

  useLayoutEffect(() => {
    // Nessuna dipendenza: le colonne fissano la propria densità con
    // l'attributo e non la cambiano più: una misura sola, al montaggio.
    if (rif.current) setPx(getComputedStyle(rif.current).fontSize)
  }, [])

  return [rif, px] as const
}

/** Legge l'altezza reale di un elemento dopo il layout. Vedi la nota sopra. */
function useAltezza<T extends HTMLElement>() {
  const rif = useRef<T>(null)
  const [px, setPx] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (!rif.current) return
    const misura = () => setPx(rif.current?.getBoundingClientRect().height ?? null)
    misura()
    const osservatore = new ResizeObserver(misura)
    osservatore.observe(rif.current)
    return () => osservatore.disconnect()
  }, [])

  return [rif, px] as const
}

function Misura({ px, soglia }: { px: number | null; soglia?: boolean }) {
  if (px === null) return null
  const sotto = soglia && px < 44
  return (
    <span
      className={`font-mono text-xs ${sotto ? 'text-muted-foreground' : 'text-foreground'}`}
    >
      {px}px
    </span>
  )
}

const TAGLIE = ['xs', 'sm', 'default', 'lg'] as const

function Bottone({ taglia }: { taglia: (typeof TAGLIE)[number] }) {
  const [rif, px] = useAltezza<HTMLButtonElement>()
  return (
    <div className="flex items-center justify-between gap-3">
      <Button ref={rif} size={taglia}>
        {taglia}
      </Button>
      <Misura px={px} soglia={taglia === 'default' || taglia === 'lg'} />
    </div>
  )
}

const GRADINI = [
  ['text-xs', 'Micro-etichetta'],
  ['text-sm', 'Voci di sidebar, breadcrumb, menu, bottoni'],
  ['text-base', 'Corpo standard, campi'],
  ['text-lg', 'Titolo di card'],
  ['text-xl', 'Titolo di sezione'],
  ['text-2xl', 'Titolo di pagina'],
  ['text-3xl', 'Numerone del cruscotto'],
] as const

function Gradino({ classe, testo }: { classe: string; testo: string }) {
  const [rif, px] = useCorpo<HTMLParagraphElement>()
  return (
    <div className="flex items-baseline justify-between gap-3">
      <p ref={rif} className={classe}>
        {testo}
      </p>
      <span className="shrink-0 font-mono text-xs text-muted-foreground">
        {classe} · {px}
      </span>
    </div>
  )
}

/**
 * Le cose che in touch devono restare identiche. Anche qui il valore è letto
 * dall'elemento, non scritto: una riga che dichiara «6px» resterebbe verde
 * pure il giorno in cui il raggio comincia a scalare.
 */
function Invariante({
  etichetta,
  proprieta,
  children,
}: {
  etichetta: string
  proprieta: string
  children: ReactNode
}) {
  const rif = useRef<HTMLDivElement>(null)
  const [valore, setValore] = useState<string | null>(null)

  useLayoutEffect(() => {
    const el = rif.current?.firstElementChild
    if (el) setValore(getComputedStyle(el).getPropertyValue(proprieta))
  }, [proprieta])

  return (
    <div className="flex items-center justify-between gap-3">
      <div ref={rif}>{children}</div>
      <span className="font-mono text-xs text-muted-foreground">
        {etichetta} · {valore}
      </span>
    </div>
  )
}

function Sezione({ titolo, children }: { titolo: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-foreground">{titolo}</h3>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  )
}

function Colonna({
  densita,
  etichetta,
}: {
  densita: 'normale' | 'touch'
  etichetta: string
}) {
  return (
    <div data-density={densita} className="bg-background text-foreground">
      <div className="border-b border-border px-5 py-3">
        <h2 className="text-xl font-semibold">{etichetta}</h2>
        <p className="font-mono text-xs text-muted-foreground">
          {densita === 'touch' ? '[data-density="touch"]' : 'nessun attributo'}
        </p>
      </div>

      <div className="space-y-6 px-5 py-5">
        <Sezione titolo="Bersagli">
          {TAGLIE.map((t) => (
            <Bottone key={t} taglia={t} />
          ))}
        </Sezione>

        <Sezione titolo="Icona dentro il bottone">
          <IconaNelBottone />
        </Sezione>

        <Sezione titolo="Tipografia">
          {GRADINI.map(([classe, testo]) => (
            <Gradino key={classe} classe={classe} testo={testo} />
          ))}
        </Sezione>

        <Sezione titolo="Ciò che non scala">
          <Invariante etichetta="rounded-md" proprieta="border-radius">
            <div className="size-8 rounded-md border border-border bg-muted" />
          </Invariante>
          <Invariante etichetta="border" proprieta="border-top-width">
            <div className="h-8 w-24 border border-border bg-card" />
          </Invariante>
          <Invariante etichetta="max-w-page" proprieta="max-width">
            <div className="h-2 w-full max-w-page bg-primary" />
          </Invariante>
        </Sezione>
      </div>
    </div>
  )
}

/**
 * L'icona è il caso che ripaga il meccanismo: `size-4` deriva da `--spacing`
 * come le altezze, quindi cresce insieme al bottone senza una riga in più.
 */
function IconaNelBottone() {
  const [rif, px] = useAltezza<SVGSVGElement>()
  return (
    <div className="flex items-center justify-between gap-3">
      <Button>
        <svg ref={rif} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5v14" strokeLinecap="round" />
        </svg>
        Nuovo
      </Button>
      <Misura px={px} />
    </div>
  )
}

function Affiancate() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto max-w-page px-5 pt-6 pb-2">
        <h1 className="text-2xl font-semibold text-foreground">Densità</h1>
        <p className="mt-1 max-w-prose text-base text-muted-foreground">
          Le app Tassullo hanno due densità. La <strong className="text-foreground">normale</strong>{' '}
          è per la scrivania. La <strong className="text-foreground">touch</strong> è per chi
          lavora in cantiere o in magazzino, col dito o coi guanti: i bersagli crescono — il
          bottone passa a 48px — e il testo sale di un gradino.
        </p>
        <ul className="mt-3 max-w-prose list-disc space-y-1 pl-5 text-base text-muted-foreground">
          <li>
            La densità si sceglie per app, con un attributo sulla radice:{' '}
            <code>{'<html data-density="touch">'}</code>. La decide l&apos;app, perché è lei a
            sapere se si usa in campo — un tablet in ufficio non vuole i bersagli da guanti.
          </li>
          <li>
            Si può tornare alla normale dentro una parte della pagina con{' '}
            <code>data-density="normale"</code>: le due colonne qui sotto fanno proprio questo, e
            per questo non seguono l&apos;interruttore in barra.
          </li>
          <li>
            I componenti non hanno una taglia «touch»: altezze, spaziature, icone e corpi del
            testo seguono l&apos;attributo da soli. Raggi, bordi e larghezze massime restano
            uguali.
          </li>
        </ul>
      </header>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2">
        <Colonna densita="normale" etichetta="Normale" />
        <Colonna densita="touch" etichetta="Touch" />
      </div>
    </div>
  )
}

/**
 * Le due densità del tema — normale per la scrivania, touch per il cantiere —
 * affiancate, con le misure lette dalla pagina.
 *
 * Si installano col tema: `npx shadcn@latest add tassullo/tassullo-design-system-v2/tema`.
 * Si attiva la touch con `data-density="touch"` sulla radice dell'app, e si
 * torna alla normale in un sottoalbero con `data-density="normale"`.
 *
 * Regole d'uso: la densità la sceglie l'app, non il dispositivo; nessun
 * componente ha una variante touch — altezze, spaziature, icone e testo seguono
 * l'attributo, mentre raggi, bordi e larghezze massime restano fermi.
 */
const meta = {
  title: 'Tema/Densità',
  component: Affiancate,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Affiancate>

export default meta
type Story = StoryObj<typeof meta>

export const NormaleETouch: Story = { name: 'Normale e touch affiancate' }
