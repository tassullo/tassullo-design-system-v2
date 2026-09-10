import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Primitive / Tipografia — **e perché non è un componente.**
 *
 * L'accettazione di M2.1 chiede che «`typography` riproduca la scala del v1».
 * Prima domanda della scala del CLAUDE.md: shadcn ce l'ha già? **Non come
 * item**: `shadcn view @shadcn/typeset` dà 404, `search` non trova nulla, e
 * la pagina rimanda a un generatore. Non c'è niente da installare, quindi il
 * gradino 1 non si applica e `componenti-propri.json` resta legittimamente
 * vuoto.
 *
 * **Ma shadcn una risposta sul testo ce l'ha, e si chiama `typeset`** — non
 * `typography`, che è il nome con cui è stata cercata la prima volta e per
 * cui non si trovava niente (rettifica scritta in `docs/DECISIONI.md` §20).
 * Risolve però un problema **diverso** da questa pagina, e i due non si
 * sostituiscono:
 *
 * · `typeset` è un contenitore per il **contenuto lungo reso da markdown** —
 *   l'equivalente di `prose` di Tailwind. Stila i discendenti (`p`, `h1..h6`,
 *   liste, tabelle, codice) e ricava tutto da tre variabili di ritmo:
 *   `--typeset-size`, `--typeset-leading`, `--typeset-flow`.
 * · questa pagina è la **cornice dell'interfaccia**: titolo di pagina,
 *   intestazione di card, meta, micro-etichetta. Si applica per elemento, con
 *   le utility, e i gradini sono **enumerati** — sette valori scelti — non
 *   derivati da un rapporto.
 *
 * Nelle app Tassullo il testo lungo esiste (le descrizioni delle schede
 * tecniche, l'editor di M3.8, il diff di M3.9) e oggi **non ha una risposta**:
 * è la decisione **D11**, aperta in `CHECKLIST.md` e non risolta qui.
 *
 * Secondo gradino, ri-stilare qualcosa di esistente: non c'è niente da
 * ri-stilare. Terzo gradino, **adattare il v1 perché entri nella forma
 * shadcn**: ed è qui che finisce, perché la scala del v1 è già interamente
 * nel tema — sette gradini `--text-*`, che Tailwind espone come `text-xs`…
 * `text-3xl`. Un componente `<Titolo>` non aggiungerebbe niente e
 * toglierebbe due cose: la possibilità di scegliere il tag giusto per la
 * struttura del documento, e la certezza che nella pagina ci sia scritto
 * quale gradino si sta usando.
 *
 * Quarto gradino — proporre un componente nostro — **non si è raggiunto**, e
 * `registry/componenti-propri.json` resta vuoto. È la condizione da difendere.
 *
 * ── Le sei parti di testo, e come si scrivono ────────────────────────────
 *
 * Non sono varianti di un componente: sono combinazioni di utility, e stanno
 * scritte qui perché siano una sola in tutte le app invece di sei diverse.
 *
 * ── Due cose che NON si fanno ────────────────────────────────────────────
 *
 * · **Oltre `text-3xl` non si sale.** I gradini Tailwind che restano —
 *   `text-4xl` in su — non sono tarati su Tassullo: sono i default della
 *   libreria, non scalano con la densità, e usarli rimette in circolo una
 *   seconda scala. Da M1.6 non è più solo una raccomandazione:
 *   `check:registry` segnala ogni `text-*` che il tema non tara.
 * · **I numeri da confrontare in colonna vogliono `tabular-nums`**, non un
 *   altro carattere. Il `font-mono` è dei codici di sistema, dove si *vuole*
 *   che stonino. La misura è in `Tema/Cifre`: scarto dei decimali 2,69px
 *   senza e 0,04px con.
 *
 * La scala scatta con la densità — è la seconda leva di M1.4, ×1.08
 * arrotondato al pixel — e le misure qui sotto sono lette dal DOM, non
 * scritte a mano: commutando l'interruttore **Densità** cambiano da sole.
 */

const PARTI = [
  {
    ruolo: 'Titolo di pagina',
    classi: 'text-2xl font-bold tracking-tight',
    tag: 'h1',
    dove: 'uno per pagina, nel page-header (M3.2)',
    testo: 'Schede tecniche',
  },
  {
    ruolo: 'Titolo di sezione',
    classi: 'text-xl font-semibold',
    tag: 'h2',
    dove: 'apre un blocco dentro la pagina',
    testo: 'Prestazioni dichiarate',
  },
  {
    ruolo: 'Titolo di card',
    classi: 'text-lg font-semibold',
    tag: 'h3',
    dove: 'intestazione di una card o di un pannello',
    testo: 'Malta strutturale R4',
  },
  {
    ruolo: 'Corpo',
    classi: 'text-base',
    tag: 'p',
    dove: 'il testo normale, e il testo dentro gli input',
    testo: 'Rasatura armata su intonaco di sottofondo, applicata a spatola in due mani.',
  },
  {
    ruolo: 'Meta',
    classi: 'text-sm text-muted-foreground',
    tag: 'p',
    dove: 'date, autori, contatori, breadcrumb',
    testo: 'Revisione 4 — 8 settembre 2026, Francesco Sartori',
  },
  {
    ruolo: 'Micro-etichetta',
    classi: 'text-xs font-medium tracking-wide text-muted-foreground uppercase',
    tag: 'p',
    dove: 'intestazioni di colonna, titoletti di gruppo in sidebar',
    testo: 'Documenti allegati',
  },
] as const

/**
 * Legge dal DOM la dimensione e il peso resi davvero.
 *
 * La dipendenza è la **chiave primitiva** `chiave`, non l'array dei nodi: un
 * array creato a ogni render fa ripartire l'effetto, che chiama `setState`,
 * che fa ripartire il render — e React non interrompe il ciclo né stampa
 * niente. È successo l'8 settembre 2026 su `Tema/Carattere` e `Tema/Cifre`, e
 * si era manifestato come «l'interruttore del tema commuta una volta sola»
 * (`docs/DECISIONI.md` §17). La regola sta nel CLAUDE.md.
 */
function useRese(chiave: string) {
  const rif = useRef<(HTMLElement | null)[]>([])
  const [rese, setRese] = useState<{ px: string; peso: string }[]>([])

  useEffect(() => {
    const letti = rif.current.map((el) => {
      if (!el) return { px: '—', peso: '—' }
      const s = getComputedStyle(el)
      return { px: `${Number.parseFloat(s.fontSize).toFixed(0)}px`, peso: s.fontWeight }
    })
    setRese(letti)
    // `chiave` è una stringa: cambia solo quando cambia davvero qualcosa.
  }, [chiave])

  return { rif, rese }
}

function Scala({ densita }: { densita?: 'normale' | 'touch' }) {
  const { rif, rese } = useRese(`${PARTI.length}|${densita ?? 'barra'}`)

  return (
    <div data-density={densita} className="flex flex-col gap-6">
      {PARTI.map((p, i) => {
        const Tag = p.tag
        return (
          <div key={p.ruolo} className="flex flex-col gap-1 border-b border-border pb-5 last:border-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {p.ruolo}
              </span>
              <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                &lt;{p.tag}&gt; {p.classi}
              </code>
              <span className="text-xs tabular-nums text-muted-foreground">
                {rese[i]?.px ?? '…'} / {rese[i]?.peso ?? '…'}
              </span>
            </div>
            <Tag
              ref={(el: HTMLElement | null) => {
                rif.current[i] = el
              }}
              className={p.classi}
            >
              {p.testo}
            </Tag>
            <p className="text-xs text-muted-foreground">{p.dove}</p>
          </div>
        )
      })}
    </div>
  )
}

const meta = {
  title: 'Primitive/Tipografia',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Le sei parti, nella densità scelta in barra. Le misure sono lette dal DOM. */
export const Parti: Story = {
  render: () => (
    <div className="max-w-page">
      <Scala />
    </div>
  ),
}

/**
 * Le due densità affiancate, ciascuna con la propria fissata sulla colonna —
 * quindi questa pagina non risponde all'interruttore in barra, di proposito:
 * serve a **confrontarle**, e per confrontarle devono stare ferme.
 *
 * Il passo è ×1.08 arrotondato al pixel, che è quello che il v1 faceva a mano
 * alzando il testo di **un gradino** della scala. Non ×1.5 come i bersagli: un
 * bottone deve crescere del 50% per stare sotto un dito guantato, un testo a
 * 13px è già leggibile e portarlo a 20 rompe le colonne.
 */
export const DueDensita: Story = {
  render: () => (
    <div className="grid gap-10 md:grid-cols-2">
      <section>
        <h2 className="mb-5 text-lg font-semibold">Normale</h2>
        <Scala densita="normale" />
      </section>
      <section>
        <h2 className="mb-5 text-lg font-semibold">Touch — cantiere</h2>
        <Scala densita="touch" />
      </section>
    </div>
  ),
}
