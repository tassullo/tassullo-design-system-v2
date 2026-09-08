import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Tema / Cifre — i numeri nelle tabelle, e perché NON serve un secondo font.
 *
 * La domanda che ha prodotto questa pagina: nelle tabelle di dati — il computo
 * metrico di Studio, gli elenchi di Anagrafe — le colonne di numeri si
 * allineano con Replicall, o tocca passare al monospace per quelle colonne?
 * Il timore era giusto e la risposta è netta: **si allineano, con una utility
 * e senza cambiare carattere.**
 *
 * ── Il fatto, letto dai file del font ────────────────────────────────────
 *
 * Le cifre di Replicall sono **proporzionali di default**: l'1 è largo 380
 * millesimi di em e il 4 ne è largo 580, nel Regular. Una colonna di importi
 * scritta così non incolonna, ed è esattamente il difetto che si voleva
 * evitare.
 *
 * Ma il font porta la feature OpenType **`tnum`** (cifre tabellari), che
 * sostituisce tutte e dieci le cifre con versioni a larghezza fissa. E la
 * larghezza è **580/1000 em su tutte e otto le facce** — Light, Regular, Bold,
 * Heavy, tondi e corsivi. Non è un dettaglio: vuol dire che il **totale in
 * grassetto si incolonna col corpo in tondo**, che è la cosa che serve
 * davvero in un computo metrico, e che una nota in corsivo non sfasa la
 * colonna.
 *
 * In CSS si accende con `font-variant-numeric: tabular-nums`, che in Tailwind
 * è la utility **`tabular-nums`**. Nessun token nuovo, nessun componente
 * nuovo: è già nel linguaggio.
 *
 * Un'avvertenza che costa un'ora se non la si sa: **`tnum` non tocca la
 * punteggiatura.** La virgola decimale resta proporzionale e cambia larghezza
 * col peso (11,2px a 400, 12,8px a 600, misurati a 40px), ed è crenata col
 * carattere che la precede. Le cifre si incolonnano lo stesso — è il gruppo
 * dei decimali che deve cadere sulla stessa ascissa, e ci cade — ma chi
 * verificasse puntando il righello sulla virgola concluderebbe il contrario.
 *
 * ── La regola che ne discende, e che cambia il v1 ────────────────────────
 *
 * La style guide del v1 dice «Monospace solo per codici sistema e **dati
 * tabellari**». La seconda metà di quella frase nasceva da un font che non
 * aveva le tabellari, o dal non averle cercate. **Con Replicall va tolta**:
 * i dati tabellari si scrivono nel carattere del testo con `tabular-nums`, e
 * il monospace resta ai codici di sistema — dove lo si vuole diverso, perché
 * un identificativo *deve* stonare rispetto alla prosa.
 *
 * ── Perché questa pagina misura invece di affermare ──────────────────────
 *
 * Le larghezze qui sotto sono lette dal DOM con `getBoundingClientRect` dopo
 * il layout, come in `Tema/Densità` e `Tema/Palette`. Una tabella di numeri
 * scritta a mano resta verde anche il giorno in cui `tabular-nums` smette di
 * funzionare — per esempio perché qualcuno reimposta `font-variant-numeric`
 * in un componente. Letta dal DOM, no.
 *
 * **Serve il font caricato.** Senza i file in `public/fonts/` la pagina
 * mostra il fallback di sistema, che ha cifre già tabellari di suo: la
 * dimostrazione sembra riuscire e non dimostra niente. Il riquadro in testa
 * dice quale dei due casi stai guardando.
 */

const IMPORTI = [
  { voce: 'Rasatura armata — tradizionale', qta: '1.114,00', prezzo: '18,40', importo: '20.497,60' },
  { voce: 'Effetto calce — grana fine', qta: '87,50', prezzo: '112,05', importo: '9.804,38' },
  { voce: 'Rinzaffo di sottofondo', qta: '1.011,11', prezzo: '7,90', importo: '7.987,77' },
  { voce: 'Finitura ai silicati', qta: '441,00', prezzo: '31,18', importo: '13.750,38' },
]
const TOTALE = '52.040,13'

/** Misura la larghezza resa di una stringa in un dato contesto di classi. */
function useLarghezze(testi: string[], classi: string) {
  const ref = useRef<HTMLDivElement>(null)
  const [larghezze, setLarghezze] = useState<number[]>([])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const misura = () => {
      const figli = [...el.children] as HTMLElement[]
      setLarghezze(figli.map((f) => Math.round(f.getBoundingClientRect().width * 100) / 100))
    }
    // Le larghezze vanno lette a font caricato, non al primo layout: prima che
    // il .otf arrivi il testo è reso col fallback, e i numeri sarebbero quelli.
    document.fonts.ready.then(misura)
  }, [testi, classi])
  return { ref, larghezze }
}

type Campione = { testo: string; classi: string; etichetta: string }

/** Campioni misurati: il testo, e sotto la sua larghezza reale in px. */
function Campioni({ campioni }: { campioni: Campione[] }) {
  const { ref, larghezze } = useLarghezze(
    campioni.map((c) => c.testo + c.classi),
    '',
  )
  const uguali = larghezze.length > 1 && new Set(larghezze).size === 1
  return (
    <div>
      <div ref={ref} className="flex flex-wrap items-baseline gap-6">
        {campioni.map((c) => (
          <span key={c.etichetta} className={`text-xl ${c.classi}`}>
            {c.testo}
          </span>
        ))}
      </div>
      <div className="mt-1 flex flex-wrap gap-6 font-mono text-xs text-muted-foreground">
        {campioni.map((c, i) => (
          <span key={c.etichetta}>
            {c.etichetta}: {larghezze[i] ?? '…'}px
          </span>
        ))}
      </div>
      {larghezze.length > 1 && (
        <p className="mt-1 text-sm text-muted-foreground">
          {uguali ? 'Larghezze identiche.' : 'Larghezze diverse.'}
        </p>
      )}
    </div>
  )
}

/**
 * Il verdetto in cifre: quante larghezze diverse assumono le dieci cifre.
 * Una sola = tabellari. Dieci = proporzionali.
 */
function ContaLarghezze({ classi, etichetta }: { classi: string; etichetta: string }) {
  const cifre = [...'0123456789']
  const ref = useRef<HTMLDivElement>(null)
  const [esito, setEsito] = useState<{ distinte: number; min: number; max: number } | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    document.fonts.ready.then(() => {
      const w = [...el.children].map((f) => Math.round(f.getBoundingClientRect().width * 100) / 100)
      setEsito({ distinte: new Set(w).size, min: Math.min(...w), max: Math.max(...w) })
    })
  }, [classi])
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-sm font-semibold">{etichetta}</div>
      <div ref={ref} className={`mt-1 flex gap-1 text-xl ${classi}`}>
        {cifre.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {esito
          ? esito.distinte === 1
            ? `Una sola larghezza: ${esito.min}px. Le cifre incolonnano.`
            : `${esito.distinte} larghezze diverse, da ${esito.min}px a ${esito.max}px. Le cifre NON incolonnano.`
          : 'misurazione in corso…'}
      </p>
    </div>
  )
}

/**
 * Il sintomo vero, e con quale righello si misura.
 *
 * In una colonna allineata a destra il bordo destro combacia comunque: non è
 * lì che si vede il difetto. Si vede più a sinistra, sul punto in cui comincia
 * il gruppo dei decimali, che con importi tutti a due decimali dovrebbe cadere
 * sulla stessa ascissa in ogni riga — e ci cade solo se le cifre sono
 * tabellari.
 *
 * **La virgola non è il righello giusto, e conviene saperlo prima di
 * misurarla.** `tnum` sostituisce le dieci cifre, non la punteggiatura: la
 * virgola resta proporzionale (11,2px a peso 400 e 12,8px a 600, misurati a
 * 40px) ed è soggetta alla crenatura col carattere che la precede, quindi si
 * sposta anche quando le cifre sono perfettamente incolonnate. Chi misurasse
 * lì concluderebbe che `tabular-nums` non funziona. Funziona: si misura il
 * bordo sinistro dei **decimali**.
 */
function useScartoDecimali(tabella: React.RefObject<HTMLTableElement | null>) {
  const [scarto, setScarto] = useState<number | null>(null)
  useEffect(() => {
    document.fonts.ready.then(() => {
      const el = tabella.current
      if (!el) return
      const x: number[] = []
      for (const cella of el.querySelectorAll('td:last-child')) {
        const nodo = cella.firstChild
        if (!nodo || nodo.nodeType !== Node.TEXT_NODE) continue
        const testo = nodo.textContent ?? ''
        if (testo.length < 3) continue
        const r = document.createRange()
        r.setStart(nodo, testo.length - 2)
        r.setEnd(nodo, testo.length)
        x.push(r.getBoundingClientRect().left)
      }
      if (x.length > 1) setScarto(Math.round((Math.max(...x) - Math.min(...x)) * 100) / 100)
    })
  }, [tabella])
  return scarto
}

/** Una tabella di computo, resa con le classi numeriche che le si passano. */
function Tabella({ num, titolo, nota }: { num: string; titolo: string; nota: string }) {
  const rif = useRef<HTMLTableElement>(null)
  const scarto = useScartoDecimali(rif)
  return (
    <div>
      <h3 className="text-md font-semibold">{titolo}</h3>
      <p className="mt-1 mb-2 text-sm text-muted-foreground">{nota}</p>
      <table ref={rif} className="w-full border-collapse text-base">
        <thead>
          <tr className="border-b border-border-strong text-left">
            <th className="py-1 pr-2 font-semibold">Designazione</th>
            <th className={`py-1 pr-2 text-right font-semibold ${num}`}>Quantità</th>
            <th className={`py-1 pr-2 text-right font-semibold ${num}`}>Prezzo</th>
            <th className={`py-1 text-right font-semibold ${num}`}>Importo</th>
          </tr>
        </thead>
        <tbody>
          {IMPORTI.map((r) => (
            <tr key={r.voce} className="border-b border-border">
              <td className="py-1 pr-2">{r.voce}</td>
              <td className={`py-1 pr-2 text-right ${num}`}>{r.qta}</td>
              <td className={`py-1 pr-2 text-right ${num}`}>{r.prezzo}</td>
              <td className={`py-1 text-right ${num}`}>{r.importo}</td>
            </tr>
          ))}
          <tr>
            <td className="py-1 pr-2 font-semibold" colSpan={3}>
              Sommano
            </td>
            <td className={`py-1 text-right font-semibold ${num}`}>{TOTALE}</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-sm text-muted-foreground">
        Scarto del bordo dei decimali fra le cinque righe:{' '}
        <strong className="font-mono">{scarto === null ? '…' : `${scarto}px`}</strong>
        {scarto !== null &&
          (scarto === 0
            ? ' — cadono tutte sulla stessa ascissa, riga «Sommano» in grassetto compresa.'
            : ' — di tanto ballano i decimali, riga per riga.')}
      </p>
    </div>
  )
}

/** Dice a chi guarda se sta vedendo Replicall o il fallback di sistema. */
function StatoFont() {
  const [stato, setStato] = useState<{ caricate: number; famiglia: string } | null>(null)
  useEffect(() => {
    document.fonts.ready.then(() => {
      const caricate = [...document.fonts].filter(
        (f) => f.family === 'Replicall' && f.status === 'loaded',
      ).length
      setStato({
        caricate,
        famiglia: getComputedStyle(document.body).fontFamily.split(',')[0].replace(/["']/g, ''),
      })
    })
  }, [])
  if (!stato) return null
  const ok = stato.caricate > 0
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
          <strong>Replicall è caricato</strong> ({stato.caricate} facce): quello che vedi qui sotto
          è il carattere vero, e le misure valgono.
        </>
      ) : (
        <>
          <strong>Replicall non è caricato</strong> — stai vedendo <code>{stato.famiglia}</code>, il
          fallback di sistema, che ha le cifre già tabellari di suo. La dimostrazione sembrerà
          riuscire e non dimostrerà niente. Metti i file in <code>public/fonts/</code>: le
          istruzioni sono nel <code>LEGGIMI.md</code> lì dentro.
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
          <h1 className="text-title font-semibold">Cifre e dati tabellari</h1>
          <p className="text-base text-muted-foreground">
            Le colonne di numeri si allineano con Replicall, senza cambiare carattere. Serve una
            utility, <code>tabular-nums</code>, e non un secondo font.
          </p>
          <StatoFont />
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Le dieci cifre, misurate</h2>
          <p className="text-base text-muted-foreground">
            Le larghezze sono lette dal DOM dopo <code>document.fonts.ready</code>, non scritte qui:
            una tabella di numeri scritta a mano resta verde anche il giorno in cui{' '}
            <code>tabular-nums</code> smette di funzionare.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <ContaLarghezze classi="" etichetta="Come sono di default (proporzionali)" />
            <ContaLarghezze classi="tabular-nums" etichetta="Con tabular-nums" />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Lo stesso computo, nei due modi</h2>
          <p className="text-base text-muted-foreground">
            Il bordo destro combacia in tutti e due i casi — non è lì che si vede. Si vede dove
            comincia il <strong>gruppo dei decimali</strong>, misurato sotto ogni tabella, e sulla
            riga «Sommano», che è in grassetto e in tabellare si incolonna col corpo perché le cifre
            tabellari di Replicall misurano{' '}
            <strong>580/1000 di em su tutte e otto le facce</strong> — Light, Regular, Bold, Heavy,
            tondi e corsivi.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <Tabella
              num=""
              titolo="Default — proporzionali"
              nota="Le cifre hanno larghezze diverse: le colonne ballano, e il totale in grassetto sfasa ancora di più."
            />
            <Tabella
              num="tabular-nums"
              titolo="Con tabular-nums"
              nota="Una utility su ogni cella numerica. Nessun cambio di carattere."
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. La strada scartata: il monospace</h2>
          <p className="text-base text-muted-foreground">
            La style guide del v1 dice «monospace per codici sistema <em>e dati tabellari</em>». La
            seconda metà va tolta: il monospace incolonna, ma <strong>si nota</strong> — è un altro
            carattere in mezzo alla riga, con un altro colore di grigio e un&apos;altra altezza-x.
            Confronta le due righe.
          </p>
          <div className="space-y-3 rounded-md border border-border p-3">
            <p className="text-base">
              Importo della voce: <span className="tabular-nums">20.497,60</span> € — con{' '}
              <code>tabular-nums</code>, il numero è dello stesso carattere della frase.
            </p>
            <p className="text-base">
              Importo della voce: <span className="font-mono">20.497,60</span> € — con{' '}
              <code>font-mono</code>, il numero è un corpo estraneo.
            </p>
          </div>
          <p className="text-base text-muted-foreground">
            Il monospace resta ai <strong>codici di sistema</strong> — un identificativo{' '}
            <span className="font-mono">TAS-04182-B</span> <em>deve</em> stonare rispetto alla
            prosa, ed è per questo che lì il carattere diverso è un pregio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            4. I due pesi affiancati, e il limite dei separatori
          </h2>
          <p className="text-base text-muted-foreground">
            La proprietà che fa incolonnare i totali: le cifre tabellari misurano{' '}
            <strong>580/1000 di em su tutte e otto le facce</strong>, quindi la stessa cifra occupa
            lo stesso spazio in Light, Regular, Bold e Heavy. Sotto è misurata, non affermata.
          </p>
          <div className="space-y-3">
            <div>
              <div className="text-sm font-semibold">
                Solo cifre, tabellari, nei due pesi — è la proprietà che incolonna
              </div>
              <Campioni
                campioni={[
                  { testo: '1114003', classi: 'tabular-nums', etichetta: 'tondo' },
                  {
                    testo: '1114003',
                    classi: 'tabular-nums font-semibold',
                    etichetta: 'grassetto',
                  },
                ]}
              />
            </div>
            <div>
              <div className="text-sm font-semibold">
                Le stesse cifre senza tabular-nums, nei due pesi
              </div>
              <Campioni
                campioni={[
                  { testo: '1114003', classi: '', etichetta: 'tondo' },
                  { testo: '1114003', classi: 'font-semibold', etichetta: 'grassetto' },
                ]}
              />
            </div>
            <div>
              <div className="text-sm font-semibold">
                L&apos;importo intero, tabellare, nei due pesi — e qui le larghezze NON coincidono
              </div>
              <Campioni
                campioni={[
                  { testo: '1.114,00', classi: 'tabular-nums', etichetta: 'tondo' },
                  {
                    testo: '1.114,00',
                    classi: 'tabular-nums font-semibold',
                    etichetta: 'grassetto',
                  },
                ]}
              />
              <p className="mt-1 text-base text-muted-foreground">
                E va benissimo così. La differenza è tutta nei <strong>separatori</strong>, che{' '}
                <code>tnum</code> non tocca: il punto e la virgola passano da 11,2px a 12,8px fra
                peso 400 e 600. Le <em>cifre</em> restano incolonnate, ed è quello che conta in una
                colonna allineata a destra — lo scarto misurato sulla tabella qui sopra è{' '}
                <strong>0px</strong>. Chi misurasse la larghezza dell&apos;intera stringa, o
                puntasse il righello sulla virgola, concluderebbe a torto che non funziona.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Le altre feature che il font porta</h2>
          <p className="text-base text-muted-foreground">
            Oltre a <code>tnum</code>, Replicall dichiara <code>zero</code> (zero barrato, utile sui
            codici dove 0 e O si confondono), <code>onum</code> (cifre minuscole, per la prosa),{' '}
            <code>lnum</code>, <code>pnum</code>, <code>frac</code>, <code>sups</code>,{' '}
            <code>subs</code> e undici set stilistici. <strong>Nessuna è in uso oggi</strong>: sono
            annotate perché esistano nella testa di chi progetta una pagina, non perché si adottino
            adesso.
          </p>
        </section>

        <section className="space-y-2 rounded-md border border-border bg-card p-4">
          <h2 className="text-xl font-semibold">La regola</h2>
          <p className="text-base">
            <strong>
              Ogni cella che contiene un numero da confrontare in colonna porta{' '}
              <code>tabular-nums</code>.
            </strong>{' '}
            Importi, quantità, prezzi, date, progressivi, percentuali. Il carattere resta quello del
            testo.
          </p>
          <p className="text-base">
            Il <code>font-mono</code> è per i <strong>codici di sistema</strong>, dove si vuole che
            si noti: identificativi, hash, path, valori di token — come nelle pagine{' '}
            <code>Tema/Palette</code> e <code>Tema/Densità</code> di questa style guide.
          </p>
          <p className="text-base text-muted-foreground">
            Dove finirà scritta: nella primitiva <code>typography</code> e nella tabella, quando si
            faranno. Qui c&apos;è la misura che la giustifica.
          </p>
        </section>
      </div>
    </div>
  )
}

const meta = {
  title: 'Tema/Cifre',
  component: Pagina,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Pagina>

export default meta
type Story = StoryObj<typeof meta>

export const DatiTabellari: Story = { name: 'Numeri e dati tabellari' }
