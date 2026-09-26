import { Fragment, useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  differenceCiede2000,
  filterDeficiencyDeuter,
  filterDeficiencyProt,
  filterDeficiencyTrit,
  formatHex,
  oklch,
  wcagContrast,
  wcagLuminance,
} from 'culori'

import { cn } from 'cn'
import { decimale } from '@/registry/tassullo/lib/numeri'

/**
 * Dieci tinte per distinguere **categorie** — le serie di un grafico, i tipi di
 * intervento di un calendario, le famiglie di un elenco: da `--chart-1` a
 * `--chart-10`, in chiaro e in scuro.
 *
 * Si usano per ciò che non ha un ordine né una gravità. Gli stati hanno i
 * propri token (`--success`, `--warning`, `--info`, `--destructive`), e
 * `--chart-10`, pur essendo un rosso, non è il colore dell'errore.
 *
 * Si installano col tema: `npx shadcn@latest add tassullo/tassullo-design-system-v2/tema`.
 *
 * Regole d'uso: il colore non è mai l'unico mezzo per distinguere — ci vogliono
 * una legenda, le etichette sui dati o tratteggi diversi; in scala di grigi le
 * tinte si confondono, quindi una stampa in bianco e nero distingue con altro;
 * `--chart-1` e `--chart-2` sono l'arancio e il verde del brand e sul fondo
 * chiaro stanno sotto il contrasto 3:1 chiesto agli elementi grafici, ed è una
 * ragione in più per non affidare la distinzione al solo colore.
 */
const meta = {
  title: 'Tema/Tavolozza categorica',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * Le dieci, per nome. **I valori non stanno qui**: si leggono dal tema a
 * runtime, perché una copia in una story è una copia che diverge. La palette
 * vive in `scripts/hex-to-oklch.ts` e il CSS del tema è il suo output.
 */
const NOMI = [
  'arancio del brand',
  'verde istituzionale',
  'blu',
  'grigio caldo',
  'ocra',
  'prugna',
  'indaco',
  'oliva scura',
  'malva',
  'rosso caldo',
] as const

const dE = differenceCiede2000()

const VISIONI = [
  { id: 'piena', nome: 'Visione piena', f: (h: string) => h },
  {
    id: 'deuter',
    nome: 'Deuteranopia',
    f: (h: string) => formatHex(filterDeficiencyDeuter(1)(oklch(h)!))!,
  },
  {
    id: 'protan',
    nome: 'Protanopia',
    f: (h: string) => formatHex(filterDeficiencyProt(1)(oklch(h)!))!,
  },
  {
    id: 'tritan',
    nome: 'Tritanopia',
    f: (h: string) => formatHex(filterDeficiencyTrit(1)(oklch(h)!))!,
  },
  {
    id: 'grigio',
    nome: 'Scala di grigi',
    f: (h: string) => {
      // La rampa di grigio alla stessa luminanza relativa: è ciò che una
      // stampa in bianco e nero mostra, e il solo modo di **vedere** quanto
      // due tinte si somigliano quando il colore non c'è.
      const y = wcagLuminance(h)
      const g = Math.round((y <= 0.0031308 ? y * 12.92 : 1.055 * y ** (1 / 2.4) - 0.055) * 255)
      const q = g.toString(16).padStart(2, '0')
      return `#${q}${q}${q}`
    },
  },
] as const

/** La coppia più vicina di un insieme, sotto una data visione. */
function coppiaPiuVicina(tinte: string[], f: (h: string) => string) {
  let min = Infinity
  let coppia: [number, number] = [0, 0]
  for (let i = 0; i < tinte.length; i++) {
    for (let j = i + 1; j < tinte.length; j++) {
      const d = dE(f(tinte[i]!), f(tinte[j]!))
      if (d < min) {
        min = d
        coppia = [i + 1, j + 1]
      }
    }
  }
  return { dE: min, coppia }
}

/**
 * Il colore risolto dal **motore di resa**: si dipinge su un canvas 1×1 e si
 * legge il pixel. Il browser restituisce `oklch`, e leggerlo come tre numeri
 * RGB dà misure senza senso — 1.02:1 su una coppia che ne fa 4.55. È la regola
 * di `CLAUDE.md`, e vale anche qui dove i numeri sono il contenuto.
 */
function risolvi(valori: string[]): string[] {
  const tela = document.createElement('canvas')
  tela.width = tela.height = 1
  const ctx = tela.getContext('2d')!
  return valori.map((v) => {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = v
    ctx.fillRect(0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    return `#${[d[0], d[1], d[2]].map((x) => x!.toString(16).padStart(2, '0')).join('')}`
  })
}

function Tavola({ modalita }: { modalita: 'chiaro' | 'scuro' }) {
  const radice = useRef<HTMLDivElement>(null)
  const [lette, setLette] = useState<{ tinte: string[]; fondo: string } | null>(null)

  /*
   * Si legge **dopo** il montaggio, e non durante il render: i token del tema
   * sono variabili CSS, quindi esistono solo quando il nodo è nel documento.
   * La dipendenza è una sola `ref`, cioè un riferimento stabile — la regola
   * delle dipendenze non primitive del `CLAUDE.md`.
   */
  useEffect(() => {
    const nodo = radice.current
    if (!nodo) return
    const stile = getComputedStyle(nodo)
    const grezze = Array.from({ length: 10 }, (_, i) =>
      stile.getPropertyValue(`--chart-${i + 1}`).trim(),
    )
    const [fondo, ...tinte] = risolvi([stile.backgroundColor, ...grezze])
    setLette({ tinte, fondo: fondo! })
  }, [])

  const contrasti = lette ? lette.tinte.map((t) => wcagContrast(t, lette.fondo)) : []

  return (
    <div
      ref={radice}
      /*
       * `text-card-foreground` **non è ridondante**, ed è un difetto preso dal
       * gate: `.dark` ridefinisce i token, ma il colore del testo si eredita
       * *calcolato* dal genitore — cioè resta quello della modalità chiara.
       * Misurato da axe: `#141414` su `#1c1c1c`, **1.08:1**. Un pannello che
       * commuta modalità deve ridichiarare il proprio colore, o eredita quello
       * di fuori.
       */
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-3 rounded-lg border p-4',
        modalita === 'chiaro' ? 'light' : 'dark',
      )}
    >
      <p className="text-foreground text-sm font-semibold">
        {modalita === 'chiaro' ? 'Modalità chiara' : 'Modalità scura'}
      </p>

      {VISIONI.map((v) => (
        <div key={v.id} className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs">{v.nome}</p>
          <div className="flex items-stretch gap-1">
            {NOMI.map((nome, i) => (
              <div
                key={nome}
                className="h-10 flex-1 rounded-sm"
                style={{
                  backgroundColor:
                    lette && v.id !== 'piena' ? v.f(lette.tinte[i]!) : `var(--chart-${i + 1})`,
                }}
                title={`${i + 1} · ${nome}${lette ? ` · ${lette.tinte[i]}` : ''}`}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="@container text-xs">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-1 @sm:grid-cols-termine">
          {lette
            ? VISIONI.map((v) => {
                const { dE: d, coppia } = coppiaPiuVicina(lette.tinte, v.f)
                const sottoSoglia = d < 5
                return (
                  <Fragment key={v.id}>
                    <dt className="text-muted-foreground">{v.nome}</dt>
                    <dd className="tabular-nums">
                      {coppia[0]} e {coppia[1]} ·{' '}
                      <span
                        className={cn(
                          'font-medium',
                          sottoSoglia && 'text-destructive-subtle-foreground',
                        )}
                      >
                        ΔE {decimale(d, 1)}
                      </span>
                    </dd>
                  </Fragment>
                )
              })
            : null}
          {lette ? (
            <>
              <dt className="border-border/60 text-muted-foreground border-t pt-1">
                contrasto dal fondo
              </dt>
              <dd className="border-border/60 tabular-nums @sm:border-t @sm:pt-1">
                da {decimale(Math.min(...contrasti), 2)} a {decimale(Math.max(...contrasti), 2)} ·{' '}
                <span className="font-medium">
                  {contrasti.filter((r) => r >= 3).length} su 10 sopra 3:1
                </span>
              </dd>
            </>
          ) : null}
        </dl>
      </div>
    </div>
  )
}

/**
 * Le dieci tinte sotto cinque visioni — piena, tre deficit di percezione del
 * colore, scala di grigi — con accanto la coppia più vicina e il contrasto dal
 * fondo. Le prime quattro righe devono restare dieci riquadri distinti;
 * l'ultima, in grigio, no.
 */
export const LeDieciTinte: Story = {
  name: 'Le dieci tinte',
  render: () => (
    <div className="flex flex-col gap-4">
      <header className="flex max-w-prose flex-col gap-2 text-foreground">
        <h1 className="text-2xl font-semibold">Tavolozza categorica</h1>
        <p className="text-base text-muted-foreground">
          Dieci tinte per distinguere categorie: le serie di un grafico, i tipi di intervento di un
          calendario, le famiglie di un elenco. Si scrivono per nome, da{' '}
          <code>--chart-1</code> a <code>--chart-10</code>.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-base text-muted-foreground">
          <li>
            <strong className="text-foreground">Sono per le categorie, non per gli stati.</strong>{' '}
            Successo, avviso, informazione ed errore hanno i propri token. <code>--chart-10</code>{' '}
            è un rosso, ma non è <code>--destructive</code>: una categoria «Guasto» non è
            un&apos;azione distruttiva.
          </li>
          <li>
            <strong className="text-foreground">Il colore non è mai l&apos;unico mezzo.</strong>{' '}
            Una legenda, le etichette sui dati, tratteggi diversi per linea: chi non distingue i
            colori deve poter leggere lo stesso grafico.
          </li>
          <li>
            <strong className="text-foreground">In bianco e nero non reggono.</strong> In scala di
            grigi le tinte si confondono (ultima riga): una stampa monocromatica distingue con
            tratteggi, trame o etichette.
          </li>
          <li>
            <strong className="text-foreground">Il contrasto chiesto è 3:1</strong>, quello della
            WCAG per gli elementi grafici. <code>--chart-1</code> e <code>--chart-2</code> — arancio
            e verde del brand — sul fondo chiaro stanno sotto: è una ragione in più per la regola
            precedente.
          </li>
        </ul>
      </header>
      <div className="grid grid-cols-1 gap-4 @3xl:grid-cols-2">
        <Tavola modalita="chiaro" />
        <Tavola modalita="scuro" />
      </div>
      <ol className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {NOMI.map((n, i) => (
          <li key={n} className="tabular-nums">
            <span className="text-foreground font-medium">{i + 1}</span> {n}
          </li>
        ))}
      </ol>
    </div>
  ),
}
