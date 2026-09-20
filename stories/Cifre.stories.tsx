import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { decimale } from '@/registry/tassullo/lib/numeri'

/**
 * Tema / Cifre — i numeri nelle tabelle, e perché NON serve un secondo font.
 *
 * La domanda che ha prodotto questa pagina: nelle tabelle di dati — il computo
 * metrico di Studio, gli elenchi di Anagrafe — le colonne di numeri si
 * allineano, o tocca passare al monospace per quelle colonne? Il timore era
 * fondato e la risposta è netta: **si allineano, con una utility e senza
 * cambiare carattere.**
 *
 * ── Il fatto ─────────────────────────────────────────────────────────────
 *
 * Le cifre di **Inter** sono **proporzionali di default**: nove larghezze
 * diverse fra 0 e 9. Una colonna di importi scritta così non incolonna.
 *
 * Ma il font porta la feature OpenType **`tnum`** (cifre tabellari), che
 * sostituisce tutte e dieci le cifre con versioni a larghezza fissa. In CSS si
 * accende con `font-variant-numeric: tabular-nums`, in Tailwind con la utility
 * **`tabular-nums`**. Nessun token nuovo, nessun componente nuovo.
 *
 * Non era scontato. Delle cinque famiglie confrontate per la scelta del
 * carattere, **Albert Sans non ha `tnum`**: con quella un computo metrico non
 * si sarebbe potuto incolonnare se non cambiando font per le sole colonne
 * numeriche — cioè la cosa che si voleva evitare. È uno dei motivi per cui è
 * stata scartata (`docs/DECISIONI.md` §14).
 *
 * Un'avvertenza che costa un'ora se non la si sa: **`tnum` non tocca la
 * punteggiatura.** La virgola resta proporzionale, cambia larghezza col peso ed
 * è crenata col carattere che la precede. Le cifre si incolonnano lo stesso — è
 * il gruppo dei decimali che deve cadere sulla stessa ascissa, e ci cade — ma
 * chi verificasse puntando il righello sulla virgola concluderebbe il
 * contrario. Le misure qui sotto lo mostrano invece di affermarlo.
 *
 * ── Le due regole che ne discendono ──────────────────────────────────────
 *
 * 1. **I numeri da confrontare in colonna prendono `tabular-nums`.** Importi,
 *    quantità, prezzi, date, progressivi, percentuali. Il carattere resta
 *    quello del testo. La sezione 3 è il modello da copiare.
 * 2. **Il `font-mono` è per i codici di sistema, e per niente altro.** Il
 *    criterio è una domanda sola: *la stringa si legge, o si trascrive?* Sui
 *    codici il monospace non serve a incolonnare — a quello basterebbe
 *    `tabular-nums` — serve a far vedere che quella stringa non è prosa: è un
 *    segnale, non una misura.
 *
 * La style guide del v1 diceva «Monospace solo per codici sistema e **dati
 * tabellari**». La seconda metà cade: nasceva da un font senza le tabellari, o
 * dal non averle cercate. La prima resta.
 *
 * ── Perché questa pagina misura invece di affermare ──────────────────────
 *
 * Le larghezze sono lette dal DOM con `getBoundingClientRect` dopo il layout,
 * come in `Tema/Densità` e `Tema/Palette`. Una tabella di numeri scritta a mano
 * resta verde anche il giorno in cui `tabular-nums` smette di funzionare — o il
 * giorno in cui si **cambia carattere**, che è successo davvero l'8 settembre
 * 2026 e ha reso stantii tutti i numeri che in questo file erano scritti a
 * mano. Quelli letti dal DOM si sono aggiornati da soli.
 *
 * **Serve il font caricato.** Senza Inter la pagina mostra il fallback di
 * sistema, che ha cifre già tabellari di suo: la dimostrazione sembrerebbe
 * riuscire senza dimostrare niente. Il riquadro in testa dice quale dei due
 * casi stai guardando.
 */

const IMPORTI = [
  {
    codice: 'TAS-04182-B',
    voce: 'Rasatura armata — tradizionale',
    qta: '1.114,00',
    prezzo: '18,40',
    importo: '20.497,60',
  },
  {
    codice: 'TAS-00907-A',
    voce: 'Effetto calce — grana fine',
    qta: '87,50',
    prezzo: '112,05',
    importo: '9.804,38',
  },
  {
    codice: 'TAS-10550-C',
    voce: 'Rinzaffo di sottofondo',
    qta: '1.011,11',
    prezzo: '7,90',
    importo: '7.987,77',
  },
  {
    codice: 'TAS-03118-A',
    voce: 'Finitura ai silicati',
    qta: '441,00',
    prezzo: '31,18',
    importo: '13.750,38',
  },
]
const TOTALE = '52.040,13'

/**
 * Misura la larghezza resa di una stringa in un dato contesto di classi.
 *
 * **La dipendenza è una stringa, non l'array.** Un array passato come
 * dipendenza di `useEffect` è nuovo a ogni render: l'effetto riparte, chiama
 * `setLarghezze` con un array nuovo, il render riparte, e si avvita. Il ciclo
 * non dà nessun errore — React non lo interrompe — e il sintomo è
 * inaspettato: **la story smette di rispondere agli interruttori della
 * barra**, perché il render non arriva mai a completarsi. È successo davvero
 * l'8 settembre 2026, e si è visto come «in Carattere/Cifre il tema scuro non
 * viene applicato». La chiave `testi.join('|')` è un valore primitivo e
 * cambia solo quando cambia il contenuto.
 */
function useLarghezze(testi: string[], classi: string) {
  const ref = useRef<HTMLDivElement>(null)
  const [larghezze, setLarghezze] = useState<number[]>([])
  const chiave = testi.join('|')
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const misura = () => {
      const figli = [...el.children] as HTMLElement[]
      setLarghezze(figli.map((f) => Math.round(f.getBoundingClientRect().width * 100) / 100))
    }
    // Le larghezze vanno lette a font caricato, non al primo layout: prima che
    // il font arrivi il testo è reso col fallback, e i numeri sarebbero quelli.
    document.fonts.ready.then(misura)
  }, [chiave, classi])
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
      <h3 className="text-sm font-semibold">{titolo}</h3>
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
          (scarto < 0.25
            ? ' — cadono tutte sulla stessa ascissa, riga «Sommano» in grassetto compresa. Sotto un quarto di pixel è arrotondamento del motore di resa, non disallineamento.'
            : ' — di tanto ballano i decimali, riga per riga.')}
      </p>
    </div>
  )
}

/**
 * Un blocco di codice da copiare. `font-mono` qui è il suo mestiere: è codice
 * sorgente, cioè il caso in cui si VUOLE che stoni rispetto alla prosa.
 */
function Sorgente({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-border bg-muted p-3 font-mono text-sm text-foreground">
      <code>{children}</code>
    </pre>
  )
}

/** La tabella nella forma adottata: codici in mono, numeri in tabellare. */
function TabellaModello() {
  return (
    <table className="w-full border-collapse text-base">
      <thead>
        <tr className="border-b border-border-strong text-left">
          <th className="py-1 pr-3 font-semibold">Codice</th>
          <th className="py-1 pr-3 font-semibold">Designazione dei lavori</th>
          <th className="py-1 pr-3 text-right font-semibold tabular-nums">Quantità</th>
          <th className="py-1 pr-3 text-right font-semibold tabular-nums">Prezzo</th>
          <th className="py-1 text-right font-semibold tabular-nums">Importo</th>
        </tr>
      </thead>
      <tbody>
        {IMPORTI.map((r) => (
          <tr key={r.codice} className="border-b border-border">
            <td className="py-1 pr-3 font-mono text-sm text-muted-foreground">{r.codice}</td>
            <td className="py-1 pr-3">{r.voce}</td>
            <td className="py-1 pr-3 text-right tabular-nums">{r.qta}</td>
            <td className="py-1 pr-3 text-right tabular-nums">{r.prezzo}</td>
            <td className="py-1 text-right tabular-nums">{r.importo}</td>
          </tr>
        ))}
        <tr>
          <td className="py-1 pr-3 font-semibold" colSpan={4}>
            Sommano
          </td>
          <td className="py-1 text-right font-semibold tabular-nums">{TOTALE}</td>
        </tr>
      </tbody>
    </table>
  )
}

/**
 * I separatori nei due pesi, letti dal DOM. Erano scritti a mano — «11,2px
 * contro 12,8px» — e sono diventati falsi il giorno in cui il carattere è
 * cambiato, senza che niente protestasse. Ora si misurano, e **la frase si
 * adatta alla misura** invece di affermare un fatto che vale per un font
 * solo: in Replica i separatori cambiavano col peso, in Inter no.
 */
function Separatori() {
  const [v, setV] = useState<{
    virgola: [number, number]
    punto: [number, number]
    stabili: boolean
  } | null>(null)

  useEffect(() => {
    document.fonts.ready.then(() => {
      const misura = (ch: string, peso: number) => {
        const e = document.createElement('span')
        e.textContent = ch.repeat(10)
        e.style.cssText = `position:absolute;left:-9999px;top:0;font-size:40px;font-weight:${peso};font-variant-numeric:tabular-nums`
        document.body.append(e)
        const w = e.getBoundingClientRect().width / 10
        e.remove()
        return Math.round(w * 10) / 10
      }
      const virgola: [number, number] = [misura(',', 400), misura(',', 600)]
      const punto: [number, number] = [misura('.', 400), misura('.', 600)]
      setV({
        virgola,
        punto,
        stabili: virgola[0] === virgola[1] && punto[0] === punto[1],
      })
    })
  }, [])

  if (!v) return <span>misura in corso…</span>
  if (v.stabili) {
    return (
      <span>
        in questo carattere sono stabili, la virgola misura {v.virgola[0]}px a entrambi i pesi, e
        lo scarto residuo viene dalla crenatura e non dalla larghezza
      </span>
    )
  }
  return (
    <span>
      qui la virgola passa da {v.virgola[0]}px a {v.virgola[1]}px fra peso 400 e 600, misurati a
      40px
    </span>
  )
}

/** Dice a chi guarda se sta vedendo Inter o il fallback di sistema. */
function StatoFont() {
  const [stato, setStato] = useState<{ caricate: number; famiglia: string } | null>(null)
  useEffect(() => {
    document.fonts.ready.then(() => {
      const caricate = [...document.fonts].filter(
        (f) => f.family === 'Inter' && f.status === 'loaded',
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
          <strong>Inter è caricato</strong> ({stato.caricate} facce): quello che vedi qui sotto è il
          carattere delle interfacce Tassullo, e le misure valgono.
        </>
      ) : (
        <>
          <strong>Inter non è caricato</strong> — stai vedendo <code>{stato.famiglia}</code>, il
          fallback di sistema, che ha le cifre già tabellari di suo. La dimostrazione sembrerà
          riuscire e non dimostrerà niente. Inter arriva dal <code>&lt;link&gt;</code> in{' '}
          <code>.storybook/preview-head.html</code>: se manca, manca lì.
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
          <h1 className="text-2xl font-semibold">Cifre e dati tabellari</h1>
          <p className="text-base text-muted-foreground">
            Le colonne di numeri si allineano con Inter, senza cambiare carattere. Serve una
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
          <h2 className="text-xl font-semibold">
            2. Lo stesso computo: il difetto, e la forma adottata
          </h2>
          <p className="text-base text-muted-foreground">
            Il bordo destro combacia in tutti e due i casi — non è lì che si vede. Si vede dove
            comincia il <strong>gruppo dei decimali</strong>, misurato sotto ogni tabella, e sulla
            riga «Sommano», che è in grassetto: se si incolonna col corpo in tondo è perché la
            cifra tabellare del carattere resta larga uguale cambiando peso. Non è scontato — fra i
            candidati, Geist derivava del 6% e i totali in grassetto sfasavano.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <Tabella
              num=""
              titolo="✗ Difetto — cifre di default"
              nota="Le cifre hanno larghezze diverse: le colonne ballano, e il totale in grassetto sfasa ancora di più. Non è un'alternativa: è ciò che succede se non si fa niente."
            />
            <Tabella
              num="tabular-nums"
              titolo="✓ Adottato — con tabular-nums"
              nota="Una utility su ogni cella numerica. Nessun cambio di carattere. È questa la forma che le app devono scrivere."
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Il modello da copiare</h2>
          <p className="text-base text-muted-foreground">
            Le due regole insieme, su una riga di computo vera: il{' '}
            <strong>codice di sistema</strong> in <code>font-mono</code>, perché deve staccare dalla
            prosa e si legge carattere per carattere; i <strong>numeri</strong> in{' '}
            <code>tabular-nums</code>, perché si confrontano in colonna. La designazione resta prosa
            e non prende niente.
          </p>
          <div className="rounded-md border border-border p-4">
            <TabellaModello />
          </div>
          <Sorgente>{`<td className="font-mono text-sm text-muted-foreground">TAS-04182-B</td>
<td>Rasatura armata — tradizionale</td>
<td className="text-right tabular-nums">1.114,00</td>
<td className="text-right tabular-nums">18,40</td>
<td className="text-right tabular-nums">20.497,60</td>`}</Sorgente>
          <p className="text-base text-muted-foreground">
            Il codice porta anche <code>text-sm</code> e <code>text-muted-foreground</code>: il
            monospace di sistema ha un&apos;altezza-x più alta di Inter e a parità di corpo
            sembra più grande, e un identificativo non deve pesare quanto la voce che identifica. Da{' '}
            <strong>M2.4</strong> sarà la primitiva <code>table</code> a portarsi dietro queste
            classi sulle colonne che le dichiarano numeriche: nelle app non si riscrivono a mano.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. I codici di sistema, e quando il mono serve</h2>
          <p className="text-base text-muted-foreground">
            La style guide del v1 dice «monospace per codici sistema <em>e dati tabellari</em>». La
            seconda metà è caduta con la sezione 2. La <strong>prima resta</strong>, e vale la pena
            dire perché: sui codici il monospace non serve a incolonnare — a quello basterebbe{' '}
            <code>tabular-nums</code> — serve a <strong>far vedere che quella stringa non è
            prosa</strong>. È un segnale, non una misura.
          </p>

          <div className="space-y-3 rounded-md border border-border p-4">
            <div className="text-sm font-semibold">Il criterio, in una domanda</div>
            <p className="text-base">
              <em>La stringa si legge, o si trascrive?</em> Se qualcuno dovrà ricopiarla, dettarla
              al telefono o confrontarla carattere per carattere, è un codice e va in{' '}
              <code>font-mono</code>. Se si legge come una quantità o una frase, no.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-border p-4">
              <div className="text-sm font-semibold">✓ Mono — si trascrive</div>
              <ul className="mt-2 space-y-2 text-base">
                <li>
                  Codice articolo <span className="font-mono text-sm">TAS-04182-B</span>
                </li>
                <li>
                  Numero DoP <span className="font-mono text-sm">TAS-0342-CPR-2024</span>
                </li>
                <li>
                  Lotto di produzione <span className="font-mono text-sm">L240718-03</span>
                </li>
                <li>
                  Partita IVA <span className="font-mono text-sm">IT01234567890</span>
                </li>
                <li>
                  Percorso <span className="font-mono text-sm">/allegati/dop/2024/</span>
                </li>
                <li>
                  Token, hash, id tecnici <span className="font-mono text-sm">a3f9c1e0</span>
                </li>
              </ul>
            </div>
            <div className="rounded-md border border-border p-4">
              <div className="text-sm font-semibold">✗ Non mono — si legge</div>
              <ul className="mt-2 space-y-2 text-base">
                <li>
                  Importi e prezzi <span className="tabular-nums">20.497,60 €</span>
                </li>
                <li>
                  Quantità e misure <span className="tabular-nums">1.114,00 m²</span>
                </li>
                <li>
                  Date <span className="tabular-nums">18/07/2024</span>
                </li>
                <li>
                  Percentuali <span className="tabular-nums">12,5 %</span>
                </li>
                <li>
                  Progressivi di riga <span className="tabular-nums">1, 2, 3</span>
                </li>
                <li>Titoli, descrizioni, note — prosa, e basta</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 rounded-md border border-border p-4">
            <div className="text-sm font-semibold">
              Perché un numero NON va in mono: guarda la riga, non il numero
            </div>
            <p className="text-base">
              Importo della voce: <span className="tabular-nums">20.497,60</span> € — con{' '}
              <code>tabular-nums</code> il numero è dello stesso carattere della frase.
            </p>
            <p className="text-base">
              Importo della voce: <span className="font-mono">20.497,60</span> € — con{' '}
              <code>font-mono</code> il numero è un corpo estraneo: altra altezza-x, altro peso
              apparente, e l&apos;occhio ci inciampa.
            </p>
          </div>

          <div className="space-y-2 rounded-md border border-border p-4">
            <div className="text-sm font-semibold">
              Lo zero: il mono di sistema lo distingue già
            </div>
            <p className="text-base">
              Su un codice, <strong>0</strong> e <strong>O</strong> si confondono, ed è il difetto
              che fa sbagliare una trascrizione. Il monospace di sistema li distingue di suo:{' '}
              <span className="font-mono text-xl">O0 IlL1</span>
            </p>
            <p className="text-base">
              Se un giorno servisse un codice nel carattere del testo, <code>slashed-zero</code> in
              Tailwind chiede al font lo zero barrato — dove il font ce l&apos;ha:{' '}
              <span className="text-xl">O0</span> normale contro{' '}
              <span className="text-xl slashed-zero">O0</span>. Inter non porta quella feature, e
              infatti i due sono identici; Replica sì, ma Replica non è più il carattere dello
              schermo. Per i codici la scelta resta il mono.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            5. I due pesi affiancati, e il limite dei separatori
          </h2>
          <p className="text-base text-muted-foreground">
            La proprietà che fa incolonnare i totali: la cifra tabellare deve occupare lo stesso
            spazio a tutti i pesi. Sotto è misurata, non affermata — ed è il criterio su cui, nel
            confronto fra i candidati, Geist ha perso.
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
                <code>tnum</code> non tocca: restano proporzionali e possono cambiare larghezza
                col peso — <Separatori /> — mentre le <em>cifre</em> restano incolonnate, ed è
                quello che conta in una colonna allineata a destra. Chi misurasse la larghezza dell&apos;intera
                stringa, o puntasse il righello sulla virgola, concluderebbe a torto che non
                funziona.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Le altre feature che il font porta</h2>
          <p className="text-base text-muted-foreground">
            Oltre a <code>tnum</code>, Inter dichiara <code>pnum</code> (cifre proporzionali),{' '}
            <code>frac</code>, <code>numr</code> e <code>dnom</code>. <strong>Nessuna è in uso
            oggi</strong>: sono annotate perché esistano nella testa di chi progetta una pagina, non
            perché si adottino adesso. Non porta invece <code>zero</code> né <code>onum</code>, che
            Replica aveva — nessuna delle due era in uso, quindi non si perde niente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            7. Il separatore delle migliaia, che <code>tabular-nums</code> non può dare
          </h2>
          <p className="text-base text-muted-foreground">
            Le cifre allineate non bastano se il <strong>punto delle migliaia</strong> compare a
            intermittenza — ed è quello che fa{' '}
            <code>Intl.NumberFormat(&apos;it-IT&apos;)</code> lasciato a sé: il CLDR italiano
            dichiara <code>minimumGroupingDigits: 2</code>, cioè raggruppa solo da{' '}
            <strong>cinque</strong> cifre in su. Un importo di quattro cifre esce senza punto e uno
            di cinque col punto, nella stessa colonna.
          </p>
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-base tabular-nums">
              <thead className="bg-accent">
                <tr>
                  <th className="p-2 text-left font-medium">valore</th>
                  <th className="p-2 text-right font-medium">
                    <code>it-IT</code> così com&apos;è
                  </th>
                  <th className="p-2 text-right font-medium">
                    con <code>useGrouping</code>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[812.4, 4128, 9874.5, 15402, 556835].map((v) => (
                  <tr key={v} className="border-t border-border">
                    <td className="p-2 font-mono text-sm text-muted-foreground">{v}</td>
                    <td className="p-2 text-right">
                      {v.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 text-right font-medium">{decimale(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-base text-muted-foreground">
            Nella colonna di mezzo <strong>due valori su cinque</strong> perdono il punto, ed è
            esattamente la fascia fra mille e diecimila — in un computo o in un listino, la maggior
            parte delle righe. <code>812,40</code> non lo perde perché di cifre ne ha tre e non
            c&apos;è niente da raggruppare. Due numeri incolonnati, uno col punto e uno senza, si leggono di ordini di
            grandezza diversi: <code>tabular-nums</code> allinea le cifre, ma non può inventare un
            separatore che non c&apos;è.
          </p>
          <p className="text-base text-muted-foreground">
            La convenzione Tassullo è <strong>sempre il punto delle migliaia</strong>, e non si
            riscrive a mano: sta nell&apos;item <code>numeri</code> —{' '}
            <code>intero()</code>, <code>decimale()</code>, <code>valuta()</code> — che le app
            installano insieme al tema. Una formattatrice scritta nel punto d&apos;uso è la riga in
            cui <code>useGrouping</code> si dimentica, e dimenticarla non dà nessun errore.{' '}
            <code>docs/DECISIONI.md</code> §47.
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
            <strong>
              Il <code>font-mono</code> è per i codici di sistema, e per niente altro.
            </strong>{' '}
            Il criterio è una domanda sola: <em>la stringa si legge, o si trascrive?</em> Chi la
            deve ricopiare, dettare o confrontare carattere per carattere ha bisogno che stoni —
            identificativi, DoP, lotti, partite IVA, path, hash. Chi la legge come una quantità no.
          </p>
          <p className="text-base">
            <strong>La designazione, i titoli e le note non prendono niente.</strong> Sono prosa: il
            carattere del testo, senza utility numeriche addosso.
          </p>
          <p className="text-base text-muted-foreground">
            Dove finirà scritta: nella primitiva <code>typography</code> (<strong>M2.1</strong>) e
            in <code>table</code> (<strong>M2.4</strong>), che porterà{' '}
            <code>tabular-nums</code> sulle colonne dichiarate numeriche — nelle app non si
            riscriverà a mano. Qui c&apos;è la misura che la giustifica.
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
