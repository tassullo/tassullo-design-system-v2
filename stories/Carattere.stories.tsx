import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Tema / Carattere — la scelta, e cosa ne discende.
 *
 * **Inter sullo schermo, Replica nelle stampe.** Deciso l'8 settembre 2026,
 * dopo il confronto misurato di cinque candidati; il ragionamento completo è
 * in `docs/DECISIONI.md` §14, qui c'è ciò che serve a chi scrive interfacce.
 *
 * ── Perché non Replica, che è il carattere del marchio ───────────────────
 *
 * Perché non ha i pesi che servono. **Replica LL ha 300 Light, 400 Regular,
 * 700 Bold e 900 Heavy: 500 e 600 non esistono**, e non è che manchino i
 * file — non esistono nel carattere. Ma il design system costruisce la
 * gerarchia proprio su quelli: `font-medium` per le etichette e
 * `font-semibold` per i titoli. Col font vero la sostituzione di CSS manda
 * 500 → 400 e 600 → 700, e quattro gradini scritti ne rendono **due**.
 *
 * Non è un difetto che si vede subito, ed è questo il punto: finché nessuna
 * app caricava Replica — e nessuna lo faceva, Studio compresa — tutto
 * rendeva in San Francisco, che 500 e 600 ce li ha. Sarebbe saltato fuori il
 * giorno in cui un'app avesse finalmente caricato il carattere del marchio.
 *
 * ── Perché Inter ─────────────────────────────────────────────────────────
 *
 * Fra i cinque provati è l'unico che passa tutti e quattro i criteri: quattro
 * gradini di peso distinti, cifre tabellari, cifre tabellari **stabili fra i
 * pesi** — cioè i totali in grassetto si incolonnano col corpo in tondo — e
 * corsivi disegnati. Geist perdeva sui totali, Outfit sui corsivi, Albert
 * Sans non ha nemmeno le cifre tabellari. Ed è SIL Open Font: gratuito, e
 * ridistribuibile, che con Replica non era.
 *
 * ── Replica non sparisce ─────────────────────────────────────────────────
 *
 * Resta il carattere del marchio e **resta nelle stampe PDF**, generate
 * server-side con reportlab. Non è più nello stack dello schermo, e non ci
 * deve tornare «per un titolo»: tenerlo lì lo farebbe apparire sulle
 * macchine che ce l'hanno installato e non sulle altre, cioè renderebbe
 * l'interfaccia diversa da persona a persona.
 *
 * Conseguenza da sapere, e da non scoprire per caso: **lo stesso computo è
 * in Inter a schermo e in Replica sul PDF.** È una scelta, non una svista —
 * lo schermo prende il carattere che lavora meglio, la carta quello del
 * marchio.
 */

const PESI = [
  { v: 300, nome: 'Light', uso: 'non usato dal design system' },
  { v: 400, nome: 'Regular', uso: 'corpo del testo, input, tabelle' },
  { v: 500, nome: 'Medium', uso: 'etichette — font-medium' },
  { v: 600, nome: 'Semibold', uso: 'titoli — font-semibold' },
  { v: 700, nome: 'Bold', uso: 'totali, enfasi — font-bold' },
]

const SCALA = [
  { tok: 'text-xs', testo: 'MICRO-ETICHETTA' },
  { tok: 'text-sm', testo: 'Voci di sidebar, breadcrumb, menu, bottoni' },
  { tok: 'text-base', testo: 'Corpo standard: rasatura armata su intonaco di sottofondo' },
  { tok: 'text-lg', testo: 'Titolo di card' },
  { tok: 'text-xl', testo: 'Titolo di sezione' },
  { tok: 'text-2xl', testo: 'Computo metrico estimativo' },
  { tok: 'text-3xl', testo: '1.284,50' },
]

/**
 * Misura la larghezza resa di una stringa a un dato peso. È l'unico modo di
 * sapere se due pesi sono davvero due pesi o lo stesso file usato due volte —
 * e la ragione per cui questa pagina misura invece di dichiarare: il giorno
 * in cui il carattere cambia, una tabella scritta a mano resta verde e falsa.
 */
function useLarghezze(pesi: number[]) {
  const rif = useRef<HTMLDivElement>(null)
  const [larghezze, setLarghezze] = useState<number[]>([])
  // La dipendenza è una stringa, non l'array: un array è nuovo a ogni render,
  // quindi l'effetto ripartirebbe, rifarebbe `setLarghezze`, e si avviterebbe.
  // Il ciclo non dà errore e il sintomo è che la story smette di rispondere
  // agli interruttori della barra — vedi il commento in `Tema/Cifre`.
  const chiave = pesi.join('|')
  useEffect(() => {
    document.fonts.ready.then(() => {
      const el = rif.current
      if (!el) return
      setLarghezze(
        [...el.children].map((f) => Math.round(f.getBoundingClientRect().width * 100) / 100),
      )
    })
  }, [chiave])
  return { rif, larghezze }
}

function Pesi() {
  const { rif, larghezze } = useLarghezze(PESI.map((p) => p.v))
  const visti = new Map<number, number>()
  const distinti = new Set(larghezze).size

  return (
    <div>
      {/* Il campione misurato sta fuori dallo schermo: in pagina i pesi si
          guardano a corpo di lettura, non a 40px. */}
      <div
        ref={rif}
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', top: 0 }}
      >
        {PESI.map((p) => (
          <span
            key={p.v}
            className="whitespace-nowrap"
            style={{ fontSize: '40px', fontWeight: p.v }}
          >
            Rasatura armata 1.114
          </span>
        ))}
      </div>

      {larghezze.length > 0 && (
        <p className="mb-3 text-base">
          <strong>{distinti} pesi distinti su {PESI.length}.</strong>{' '}
          {distinti === PESI.length
            ? 'Ogni gradino rende diverso dagli altri: la gerarchia scritta è la gerarchia resa.'
            : 'Alcuni gradini collassano: sono lo stesso file usato due volte.'}
        </p>
      )}

      <div className="flex flex-col">
        {PESI.map((p, i) => {
          const w = larghezze[i]
          const primo = w !== undefined && visti.has(w) ? visti.get(w) : undefined
          if (w !== undefined && !visti.has(w)) visti.set(w, p.v)
          return (
            <div
              key={p.v}
              className="grid grid-cols-[9rem_1fr_auto] items-baseline gap-4 border-b border-border py-2 last:border-b-0"
            >
              <span className="text-xs text-muted-foreground">
                {p.v} {p.nome}
                <br />
                {p.uso}
              </span>
              <span className="text-xl" style={{ fontWeight: p.v }}>
                Rasatura armata 1.114
              </span>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {w === undefined ? '…' : `${w}px`}
                {primo !== undefined && ` · identico a ${primo}`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Un gradino della scala, reso con la sua utility e non con un corpo in pixel:
 * così segue la densità come nelle app. Il corpo accanto è letto dal DOM, e un
 * `ResizeObserver` lo rilegge quando l'interruttore Densità lo cambia.
 */
function Gradino({ tok, testo }: { tok: string; testo: string }) {
  const rif = useRef<HTMLSpanElement>(null)
  const [px, setPx] = useState<string | null>(null)
  useEffect(() => {
    const el = rif.current
    if (!el) return
    const leggi = () => setPx(`${Number.parseFloat(getComputedStyle(el).fontSize).toFixed(0)}px`)
    leggi()
    const osservatore = new ResizeObserver(leggi)
    osservatore.observe(el)
    return () => osservatore.disconnect()
  }, [])
  const titolo = ['text-xl', 'text-2xl', 'text-3xl'].includes(tok)
  return (
    <div className="grid grid-cols-[9rem_1fr] items-baseline gap-4 border-b border-border py-2 last:border-b-0">
      <span className="font-mono text-xs text-muted-foreground">
        {tok} · {px ?? '…'}
      </span>
      <span ref={rif} className={`${tok} ${titolo ? 'font-semibold' : ''}`}>
        {testo}
      </span>
    </div>
  )
}

function Scala() {
  return (
    <div className="flex flex-col">
      {SCALA.map((g) => (
        <Gradino key={g.tok} tok={g.tok} testo={g.testo} />
      ))}
    </div>
  )
}

/** Dice se Inter è davvero caricato: senza, le misure della pagina descrivono un altro carattere. */
function Stato() {
  const [n, setN] = useState<number | null>(null)
  useEffect(() => {
    document.fonts.ready.then(() =>
      setN([...document.fonts].filter((f) => f.family === 'Inter' && f.status === 'loaded').length),
    )
  }, [])
  if (n === null) return null
  const ok = n > 0
  return (
    <div
      className="rounded-md border p-3 text-sm"
      style={{
        background: ok ? 'var(--success-subtle)' : 'var(--warning-subtle)',
        borderColor: ok ? 'var(--success-border)' : 'var(--warning-border)',
        color: ok ? 'var(--success-subtle-foreground)' : 'var(--warning-subtle-foreground)',
      }}
    >
      {ok ? (
        <>
          <strong>Inter è caricato</strong> ({n} facce). Quello che vedi è il carattere delle
          interfacce Tassullo.
        </>
      ) : (
        <>
          <strong>Inter non è caricato</strong> — stai vedendo il carattere di sistema, e le misure
          qui sotto descrivono quello. Inter viaggia col tema: l&apos;item <code>tema</code> porta
          con sé <code>tema-font</code>.
        </>
      )}
    </div>
  )
}

function Pagina() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-page space-y-8 px-5 py-6">
        <header className="space-y-3">
          <h1 className="text-2xl font-semibold">Il carattere</h1>
          <p className="max-w-prose text-base text-muted-foreground">
            <strong className="text-foreground">Le interfacce Tassullo sono in Inter</strong>, in
            quattro pesi. Il carattere arriva col tema, dentro il suo CSS: l&apos;app non lo scarica
            da nessun servizio esterno. Il carattere del marchio, Replica, resta alle stampe PDF.
          </p>
          <Stato />
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">I quattro pesi</h2>
          <p className="max-w-prose text-base text-muted-foreground">
            <code>font-normal</code> (400) per il corpo, <code>font-medium</code> (500) per le
            etichette, <code>font-semibold</code> (600) per i titoli, <code>font-bold</code> (700)
            per i totali e l&apos;enfasi. Altri pesi non si usano. La pagina misura la larghezza di
            ogni peso: se due gradini rendessero uguali — cosa che succede, senza errori, con un
            carattere che non li possiede tutti — il conto qui sotto lo direbbe.
          </p>
          <Pesi />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">La scala tipografica</h2>
          <p className="max-w-prose text-base text-muted-foreground">
            Sette gradini, da <code>text-xs</code> a <code>text-3xl</code>, con l&apos;uso tipico
            di ciascuno. Oltre <code>text-3xl</code> non si sale: i gradini più grandi di Tailwind
            non sono tarati sul tema e non seguono la densità. In densità touch ogni gradino
            cresce di circa l&apos;8% — prova l&apos;interruttore in barra, o guarda{' '}
            <code>Tema/Densità</code>, che mostra le due densità affiancate.
          </p>
          <Scala />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Le due famiglie, e a cosa servono</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-border p-4">
              <div className="text-sm font-semibold">
                <code>font-sans</code> — Inter
              </div>
              <p className="mt-1 text-base text-muted-foreground">
                Tutto ciò che compare in un&apos;app: prosa, titoli, etichette, numeri, e anche
                codici, lotti, partite IVA. I numeri da confrontare in colonna prendono{' '}
                <code>tabular-nums</code> e si incolonnano senza cambiare carattere (
                <code>Tema/Cifre</code>).
              </p>
              <p className="mt-2 text-base">
                Rasatura armata su intonaco — 20.497,60 € — <em>nota in corsivo</em>
              </p>
              <p className="mt-2 text-base">
                Codice articolo{' '}
                <span className="text-sm text-muted-foreground">TAS-04182-B</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Un codice si scrive nel carattere del testo, con{' '}
                <code>text-sm text-muted-foreground</code>: un identificativo non deve pesare
                quanto la voce che identifica.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <div className="text-sm font-semibold">
                <code>font-mono</code> — monospaziato di sistema
              </div>
              <p className="mt-1 text-base text-muted-foreground">
                Solo per il <strong>codice sorgente</strong>: un blocco di codice, una classe
                citata, un valore CSS. Non per i codici gestionali e non per i numeri.
              </p>
              <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-muted p-2 font-mono text-sm">
                <code>{'<td className="text-right tabular-nums">'}</code>
              </pre>
              <p className="mt-2 text-sm text-muted-foreground">
                Un&apos;avvertenza sulle stringhe tecniche a cassa mista — hash, token, percorsi: in
                Inter la <code>I</code> maiuscola e la <code>l</code> minuscola quasi coincidono.
                Sui codici Tassullo, fatti di maiuscole e cifre, il caso non si presenta.{' '}
                <code>Tema/Cifre</code> mostra le coppie a confronto.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-md border border-border bg-card p-4">
          <h2 className="text-xl font-semibold">Replica, nelle stampe</h2>
          <p className="max-w-prose text-base">
            Replica è il carattere del marchio e <strong>si usa nei documenti PDF</strong>. Sullo
            schermo no, nemmeno per un titolo: un carattere che non viaggia col tema comparirebbe
            solo sui computer che lo hanno installato, e l&apos;interfaccia sarebbe diversa da
            persona a persona.
          </p>
          <p className="max-w-prose text-base text-muted-foreground">
            Ne segue che lo stesso documento è in Inter a schermo e in Replica sulla carta. È
            voluto: lo schermo usa il carattere che lavora meglio, la carta quello del marchio.
          </p>
        </section>
      </div>
    </div>
  )
}

/**
 * Il carattere delle interfacce Tassullo: Inter sullo schermo, Replica nelle
 * stampe PDF.
 *
 * Si installa col tema — `npx shadcn@latest add tassullo/tassullo-design-system-v2/tema`
 * porta anche l'item `tema-font`, cioè Inter dentro il CSS, senza richieste a
 * servizi esterni.
 *
 * Regole d'uso: quattro pesi (`font-normal`, `font-medium`, `font-semibold`,
 * `font-bold`); sette gradini di corpo, da `text-xs` a `text-3xl`, e non oltre;
 * `font-mono` solo per il codice sorgente; codici e identificativi nel
 * carattere del testo, con `text-sm text-muted-foreground`.
 */
const meta = {
  title: 'Tema/Carattere',
  component: Pagina,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Pagina>

export default meta
type Story = StoryObj<typeof meta>

export const InterEReplica: Story = { name: 'Inter sullo schermo, Replica nelle stampe' }
