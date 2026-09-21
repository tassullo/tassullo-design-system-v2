import { useEffect, useRef, useState } from 'react'
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
 * # Tema / Tavolozza categorica — `--chart-1..10`
 *
 * Le dieci tinte con cui si distinguono **categorie**: le serie di un grafico,
 * i tipi di intervento di un calendario, le famiglie di un elenco. Sono nel
 * tema dal **2026-09-21** (M4ter.11); prima erano cinque.
 *
 * ## Cosa garantiscono, e cosa no
 *
 * **Garantiscono di essere distinguibili fra loro**, e non a occhio: misurate
 * a coppie sotto visione piena e sotto i tre deficit di percezione del colore.
 * La coppia più vicina sta a **ΔE 11,0** in chiaro e **8,5** in scuro, contro
 * una soglia di **5** — `npm run check:contrast` non lascia passare una
 * tavolozza che scenda sotto, e il conto lo rifà a ogni build.
 *
 * **Non garantiscono la leggibilità in bianco e nero**, ed è il prezzo pagato
 * consapevolmente per arrivare a dieci. Fino a M4ter.11 le cinque tinte erano
 * *pioli di una scala di chiarezza*, il cui passo — 1,4935, quello che
 * l'arancio del brand e il verde istituzionale hanno già fra loro — le teneva
 * distinguibili anche in grigio. Quella garanzia **non si estende a dieci**, e
 * non per una scelta: dieci pioli a quel passo vorrebbero `1,4935⁹ ≈ 37:1`
 * contro i **21:1** che l'intera gamma sRGB permette. Sopra gli otto non c'è
 * spazio fra il bianco e il nero.
 *
 * E **non c'è più una famiglia che ci riesca**: la rampa monocroma
 * `--chart-mono-1..5` è stata tolta insieme alla garanzia, perché era l'unica
 * cosa che la mostrava e un token che nessuno guarda si degrada in silenzio.
 * Chi avesse bisogno del bianco e nero distingue con altro — tratteggi,
 * etichette sui dati, riempimenti a trama.
 *
 * ## La soglia di contrasto è 3:1, non 4,5
 *
 * A un **oggetto grafico** necessario a capire il contenuto la WCAG chiede
 * **3:1** (1.4.11); 4,5 è la soglia del **testo** (1.4.3). Chiedere 4,5 alle
 * tinte le spingerebbe tutte in una banda scura dove smetterebbero di
 * distinguersi fra loro, cioè peggiorerebbe ciò che dice di proteggere.
 *
 * Otto tinte su dieci ci arrivano. Le due che non ci arrivano sono
 * **`--chart-1` e `--chart-2`**, cioè l'arancio e il verde del brand: 1,91:1 e
 * 2,85:1 sulla card chiara. Sono **esentate per decisione**, perché cambiarle
 * vorrebbe dire cambiare il marchio — e l'esenzione è scritta **per indice**
 * nel gate, non come soglia abbassata, così la regola resta armata su tutte le
 * altre e su qualunque tinta si aggiunga. La condizione che la rende
 * accettabile: **il colore non è mai l'unico mezzo** — legenda, etichette sui
 * dati, tratteggi diversi per linea.
 *
 * ## Il rosso non è `--destructive`
 *
 * `--chart-10` è un rosso caldo, ed esiste perché Officina distingue il
 * «Guasto» in rosso e nella scala vecchia il rosso non c'era (M4ter.2 dovette
 * dargli l'arancio). **Non** è `--destructive`: quello è il colore
 * dell'allarme, e una categoria «Guasto» non è un'azione distruttiva. Sono due
 * rossi vicini di tinta — 29 contro 27 — e lontani di ruolo.
 *
 * ## Come si è arrivati a queste dieci
 *
 * Cercandole, dopo aver provato e scartato le tavolozze qualitative
 * pubblicate: **Okabe-Ito** crolla a ΔE 0,1 sotto deuteranopia appena la si
 * forza a 3:1 su fondo chiaro — arancio e giallo, portati alla stessa banda di
 * chiarezza, diventano lo stesso colore — e **Tol *muted*** è ottima in chiaro
 * ma il suo gemello per fondo scuro scende a 2,9 sotto protanopia. Sono nate
 * per **linee e punti su fondo bianco**; qui servono **riempimenti, in due
 * modalità**, e il vincolo raddoppia. Il verbale è in `docs/DECISIONI.md` §49.
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

      <dl className="flex flex-col gap-1 text-xs">
        {lette
          ? VISIONI.map((v) => {
              const { dE: d, coppia } = coppiaPiuVicina(lette.tinte, v.f)
              const sottoSoglia = d < 5
              return (
                <div key={v.id} className="flex items-baseline justify-between gap-4">
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
                </div>
              )
            })
          : null}
        {lette ? (
          <div className="border-border/60 flex items-baseline justify-between gap-4 border-t pt-1">
            <dt className="text-muted-foreground">contrasto dal fondo</dt>
            <dd className="tabular-nums">
              da {decimale(Math.min(...contrasti), 2)} a {decimale(Math.max(...contrasti), 2)} ·{' '}
              <span className="font-medium">
                {contrasti.filter((r) => r >= 3).length} su 10 sopra 3:1
              </span>
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}

/**
 * **Le dieci tinte, sotto cinque visioni.** I valori si leggono dal tema a
 * runtime — dipingendo ogni token su un canvas 1×1 e leggendo il pixel —
 * quindi questa pagina non può divergere dalla palette: se il tema cambia,
 * cambia anche lei, misure comprese.
 *
 * **Cosa guardare.** Le prime quattro righe devono restare dieci riquadri
 * distinti: è la garanzia, e il numero accanto la misura. **L'ultima riga
 * no** — in scala di grigi la tavolozza si appiattisce, ed è il prezzo scritto
 * a verbale. Se serve il bianco e nero, la distinzione va portata da
 * altro: tratteggi, etichette scritte sui dati, riempimenti a trama.
 *
 * La riga del contrasto dice **quante** tinte stanno sopra i 3:1 di 1.4.11:
 * otto su dieci in chiaro, dieci su dieci in scuro. Le due che mancano sono
 * l'arancio e il verde del brand, esentate per decisione.
 */
export const LeDieciTinte: Story = {
  name: 'Le dieci tinte',
  render: () => (
    <div className="flex flex-col gap-4">
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
