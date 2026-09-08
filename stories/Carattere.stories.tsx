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
  { px: 11, tok: 'text-xs', testo: 'MICRO-ETICHETTA' },
  { px: 12, tok: 'text-sm', testo: 'Meta, badge, voci di sidebar' },
  { px: 13, tok: 'text-md', testo: 'Chip, breadcrumb, testi densi' },
  { px: 14, tok: 'text-base', testo: 'Corpo standard: rasatura armata su intonaco di sottofondo' },
  { px: 15, tok: 'text-lg', testo: 'Titolo di card' },
  { px: 18, tok: 'text-xl', testo: 'Titolo di sezione' },
  { px: 26, tok: 'text-title', testo: 'Computo metrico estimativo' },
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

function Scala() {
  return (
    <div className="flex flex-col">
      {SCALA.map((g) => (
        <div
          key={g.tok}
          className="grid grid-cols-[9rem_1fr] items-baseline gap-4 border-b border-border py-2 last:border-b-0"
        >
          <span className="font-mono text-xs text-muted-foreground">
            {g.tok} · {g.px}px
          </span>
          <span
            style={{ fontSize: `${g.px}px`, fontWeight: g.px >= 18 ? 600 : 400 }}
            className={g.px === 11 ? 'tracking-wide' : undefined}
          >
            {g.testo}
          </span>
        </div>
      ))}
    </div>
  )
}

/** Dice se Inter è davvero caricato: senza, la pagina mente in silenzio. */
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
          <strong>Inter non è caricato</strong> — stai vedendo il fallback di sistema, e le misure
          qui sotto descrivono quello. Il <code>&lt;link&gt;</code> sta in{' '}
          <code>.storybook/preview-head.html</code>.
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
          <h1 className="text-title font-semibold">Il carattere</h1>
          <p className="max-w-[62ch] text-base text-muted-foreground">
            <strong className="text-foreground">Inter sullo schermo, Replica nelle stampe.</strong>{' '}
            Deciso l’8 settembre 2026 dopo il confronto misurato di cinque candidati. Il
            ragionamento completo è in <code>docs/DECISIONI.md</code> §14.
          </p>
          <Stato />
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">I pesi, misurati</h2>
          <p className="max-w-[68ch] text-base text-muted-foreground">
            Il design system scrive quattro pesi: <code>400</code> per il corpo, <code>500</code>{' '}
            per le etichette, <code>600</code> per i titoli, <code>700</code> per i totali. Un
            carattere che non li ha tutti non protesta — il browser sostituisce il più vicino, e
            due gradini diversi rendono identici. È qui che Replica non passava: 500 e 600 non
            esistono nella famiglia, e quattro gradini scritti ne rendevano due.
          </p>
          <Pesi />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">La scala tipografica</h2>
          <p className="max-w-[68ch] text-base text-muted-foreground">
            I sette gradini del tema, ai corpi reali in cui vengono usati. In densità touch salgono
            tutti di un gradino — <code>Tema/Densità</code> lo mostra affiancato.
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
                Tutto ciò che si legge: prosa, titoli, etichette, e i numeri, che con{' '}
                <code>tabular-nums</code> si incolonnano senza cambiare carattere (
                <code>Tema/Cifre</code>).
              </p>
              <p className="mt-2 text-base">
                Rasatura armata su intonaco — 20.497,60 € — <em>nota in corsivo</em>
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <div className="text-sm font-semibold">
                <code>font-mono</code> — monospaziato di sistema
              </div>
              <p className="mt-1 text-base text-muted-foreground">
                Solo i codici di sistema, cioè le stringhe che si <em>trascrivono</em> invece di
                leggersi: identificativi, DoP, lotti, percorsi, hash.
              </p>
              <p className="mt-2 font-mono text-sm">TAS-04182-B · TAS-0342-CPR-2024</p>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-md border border-border bg-card p-4">
          <h2 className="text-xl font-semibold">Replica non sparisce</h2>
          <p className="max-w-[72ch] text-base">
            Resta il carattere del marchio e <strong>resta nelle stampe PDF</strong>, generate
            server-side con reportlab. Non è più nello stack dello schermo, e non ci deve tornare
            «per un titolo»: tenerlo lì lo farebbe apparire sulle macchine che ce l’hanno
            installato e non sulle altre — cioè renderebbe l’interfaccia diversa da persona a
            persona.
          </p>
          <p className="max-w-[72ch] text-base text-muted-foreground">
            Conseguenza da sapere, e da non scoprire per caso: <strong>lo stesso computo è in Inter
            a schermo e in Replica sul PDF.</strong> È una scelta — lo schermo prende il carattere
            che lavora meglio, la carta quello del marchio.
          </p>
        </section>
      </div>
    </div>
  )
}

const meta = {
  title: 'Tema/Carattere',
  component: Pagina,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Pagina>

export default meta
type Story = StoryObj<typeof meta>

export const InterEReplica: Story = { name: 'Inter sullo schermo, Replica nelle stampe' }
