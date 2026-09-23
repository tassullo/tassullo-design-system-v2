import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { apriCol } from '@/prove/apri'

import {
  FoglioGruppi,
  useFoglioGruppi,
  type ColonnaFoglio,
  type GruppoFoglio,
} from '@/registry/tassullo/blocks/foglio-gruppi'
import { useSoglia } from '@/registry/tassullo/hooks/use-soglia'
import {
  decimale,
  formattatore,
  leggiNumero,
  scriviNumero,
  valuta,
} from '@/registry/tassullo/lib/numeri'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/registry/tassullo/blocks/responsive-dialog'
import { Button } from '@/registry/tassullo/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/tassullo/ui/card'
import { Input } from '@/registry/tassullo/ui/input'
import { TableCell } from '@/registry/tassullo/ui/table'

/**
 * Il computo metrico estimativo, che è la pagina da cui il blocco nasce
 * (`docs/ANALISI-COPERTURA-APP.md` §8.3bis). Una **voce** è la testata del
 * gruppo, le sue **misurazioni** sono il corpo, il **SOMMANO** è il piede.
 */
type Voce = {
  designazione: string
  unita: string
  prezzo: string
}

type Misurazione = {
  descrizione: string
  parti: string
  lunghezza: string
  larghezza: string
  altezza: string
}

/**
 * I numeri del dato sono stringhe col punto (`'0.5'`), la forma che `Number()`
 * legge; si scrivono con la virgola (`0,5`), e `leggiNumero` accetta tutte e
 * due — serve anche al cassetto, dove il parziale si ricalcola su ciò che si
 * sta scrivendo.
 */
const numero = (v: string) => {
  if (v.trim() === '') return null
  const n = Number(leggiNumero(v))
  return Number.isNaN(n) ? null : n
}

/** Si scrive `20,78`, il dato resta `20.78`: v. `formato` in `CellaScrivibile`. */
const SCRITTURA_NUMERO = { perScrivere: scriviNumero, interpreta: leggiNumero }

/** Una misura nella vista: la virgola, i decimali che ha, il punto delle migliaia. */
const mostraMisura = (valore: string) =>
  valore === '' ? ' ' : formattatore().format(Number(valore))

/** Σ parti × Π(fattori non nulli) — la formula di Primus. */
const parziale = (m: Misurazione) => {
  const parti = numero(m.parti) ?? 1
  let prodotto = 1
  for (const v of [m.lunghezza, m.larghezza, m.altezza]) {
    const n = numero(v)
    if (n != null) prodotto *= n
  }
  return Math.round(parti * prodotto * 1000) / 1000
}

const sommano = (righe: Misurazione[]) =>
  Math.round(righe.reduce((tot, m) => tot + parziale(m), 0) * 1000) / 1000

const importo = (voce: Voce, righe: Misurazione[]) => {
  const p = numero(voce.prezzo)
  return p == null ? null : Math.round(p * sommano(righe) * 100) / 100
}

const soloNumero = (valore: string) =>
  valore.trim() === '' || numero(valore) != null ? undefined : 'Dev\'essere un numero'

const COMPUTO: GruppoFoglio<Voce, Misurazione>[] = [
  {
    id: 'v1',
    testata: { designazione: 'RASATURA ARMATA — Tradizionale', unita: 'm²', prezzo: '28.82' },
    righe: [
      { descrizione: 'Piano terra — ambiente 1', parti: '1', lunghezza: '10', larghezza: '1', altezza: '0.5' },
      { descrizione: 'Piano terra — ambiente 2', parti: '1', lunghezza: '5', larghezza: '3.5', altezza: '' },
      { descrizione: 'detrazione porta', parti: '-1', lunghezza: '0.9', larghezza: '2.1', altezza: '' },
    ],
  },
  {
    id: 'v2',
    testata: { designazione: 'EFFETTO CALCE — Grana fine grandi metrature', unita: 'm²', prezzo: '35.03' },
    righe: [
      { descrizione: 'Piano primo — corridoio', parti: '1', lunghezza: '12', larghezza: '2.7', altezza: '' },
    ],
  },
  {
    id: 'v3',
    testata: { designazione: 'MURO — Bioedilizia', unita: 'm³', prezzo: '14.48' },
    righe: [
      { descrizione: 'Piano secondo — ambiente 1', parti: '2', lunghezza: '4', larghezza: '0.3', altezza: '2.7' },
      { descrizione: 'Piano secondo — ambiente 2', parti: '1', lunghezza: '6.5', larghezza: '0.3', altezza: '2.7' },
    ],
  },
]

const COLONNE: ColonnaFoglio<Voce, Misurazione>[] = [
  { id: 'n', titolo: 'N°', larghezza: 'w-12' },
  {
    id: 'designazione',
    titolo: 'Designazione dei lavori',
    testata: {
      tipo: 'scrivibile',
      leggi: (v) => v.designazione,
      scrivi: (v, valore) => ({ ...v, designazione: valore }),
      segnaposto: 'Descrizione della lavorazione',
      mostra: (valore) => <span className="font-semibold">{valore}</span>,
    },
    corpo: {
      tipo: 'scrivibile',
      leggi: (m) => m.descrizione,
      scrivi: (m, valore) => ({ ...m, descrizione: valore }),
      segnaposto: 'descrizione misura (parti negative = detrazione)',
      mostra: (valore) => <span className="pl-4 italic">{valore}</span>,
    },
    // La colonna che le tre zone condividono: è da qui che le frecce
    // verticali raggiungono il piede, e da lì `ArrowRight` arriva al prezzo.
    piede: {
      tipo: 'scrivibile',
      leggi: (v) => v.unita,
      scrivi: (v, valore) => ({ ...v, unita: valore }),
      mostra: (valore) => (
        <span className="flex justify-end gap-2 pr-2">
          <span>SOMMANO</span>
          <span className="text-accent-ink">{valore}</span>
        </span>
      ),
    },
  },
  { id: 'parti', titolo: 'Par.ug.', larghezza: 'w-20', allineamento: 'destra',
    corpo: { tipo: 'scrivibile', leggi: (m) => m.parti, scrivi: (m, v) => ({ ...m, parti: v }), valida: soloNumero,
      formato: SCRITTURA_NUMERO, mostra: mostraMisura } },
  { id: 'lunghezza', titolo: 'Lung.', larghezza: 'w-20', allineamento: 'destra',
    corpo: { tipo: 'scrivibile', leggi: (m) => m.lunghezza, scrivi: (m, v) => ({ ...m, lunghezza: v }), valida: soloNumero,
      formato: SCRITTURA_NUMERO, mostra: mostraMisura } },
  { id: 'larghezza', titolo: 'Larg.', larghezza: 'w-20', allineamento: 'destra',
    corpo: { tipo: 'scrivibile', leggi: (m) => m.larghezza, scrivi: (m, v) => ({ ...m, larghezza: v }), valida: soloNumero,
      formato: SCRITTURA_NUMERO, mostra: mostraMisura } },
  { id: 'altezza', titolo: 'H/Peso', larghezza: 'w-20', allineamento: 'destra',
    corpo: { tipo: 'scrivibile', leggi: (m) => m.altezza, scrivi: (m, v) => ({ ...m, altezza: v }), valida: soloNumero,
      formato: SCRITTURA_NUMERO, mostra: mostraMisura } },
  {
    id: 'quantita',
    titolo: 'Quantità',
    larghezza: 'w-28',
    allineamento: 'destra',
    corpo: { tipo: 'calcolata', rendi: (m) => decimale(parziale(m)) },
    piede: {
      tipo: 'calcolata',
      rendi: (_voce, righe: Misurazione[]) => <span className="font-semibold">{decimale(sommano(righe))}</span>,
    },
  },
  {
    id: 'prezzo',
    titolo: 'Prezzo unit.',
    larghezza: 'w-28',
    allineamento: 'destra',
    piede: {
      tipo: 'scrivibile',
      leggi: (v) => v.prezzo,
      scrivi: (v, valore) => ({ ...v, prezzo: valore }),
      segnaposto: 'da prezzare',
      valida: soloNumero,
      formato: SCRITTURA_NUMERO,
      // La coda di ciò che `valuta()` scrive: in modifica il simbolo resta
      // accanto al campo, e le cifre non si spostano.
      suffisso: '\u00a0€',
      mostra: (valore) => (valore ? valuta(numero(valore) ?? 0) : 'da prezzare'),
    },
  },
  {
    id: 'importo',
    titolo: 'Importo',
    larghezza: 'w-32',
    allineamento: 'destra',
    piede: {
      tipo: 'calcolata',
      rendi: (voce: Voce, righe: Misurazione[]) => {
        const i = importo(voce, righe)
        return <span className="font-semibold">{i == null ? '—' : valuta(i)}</span>
      },
    },
  },
]

function ComputoFoglio({ gruppiIniziali = COMPUTO }: { gruppiIniziali?: GruppoFoglio<Voce, Misurazione>[] }) {
  const motore = useFoglioGruppi<Voce, Misurazione>({
    gruppiIniziali,
    colonne: COLONNE,
    conRigaAzioni: true,
  })

  const aggiungiMisura = (i: number) =>
    motore.scriviGruppi(
      motore.gruppi.map((g, gi) =>
        gi === i
          ? { ...g, righe: [...g.righe, { descrizione: '', parti: '1', lunghezza: '', larghezza: '', altezza: '' }] }
          : g
      )
    )

  return (
    <div className="flex flex-col gap-3">
      <FoglioGruppi
        motore={motore}
        didascalia="Computo metrico estimativo"
        // Il «+ misurazione» sta QUI e non nel menu: è l'azione che si ripete
        // per ogni riga, e nasconderla dietro due gesti la rende più lenta di
        // quella che sostituisce (rilievo di Francesco, 2026-09-21).
        azione={(_gruppo, i) => ({ etichetta: '+ misurazione', onSelect: () => aggiungiMisura(i) })}
        comandi={(_gruppo, i) => [
          {
            etichetta: 'Sposta su',
            disabilitato: i === 0,
            onSelect: () => {
              const nuovi = motore.gruppi.slice()
              ;[nuovi[i - 1], nuovi[i]] = [nuovi[i]!, nuovi[i - 1]!]
              motore.scriviGruppi(nuovi)
            },
          },
          {
            etichetta: 'Sposta giù',
            disabilitato: i === motore.gruppi.length - 1,
            onSelect: () => {
              const nuovi = motore.gruppi.slice()
              ;[nuovi[i], nuovi[i + 1]] = [nuovi[i + 1]!, nuovi[i]!]
              motore.scriviGruppi(nuovi)
            },
          },
          { etichetta: '-', onSelect: () => {} },
          {
            etichetta: 'Elimina voce',
            distruttivo: true,
            onSelect: () => motore.scriviGruppi(motore.gruppi.filter((_, gi) => gi !== i)),
          },
        ]}
        piede={(gruppi) => {
          const totale = gruppi.reduce((tot, g) => tot + (importo(g.testata, g.righe) ?? 0), 0)
          return (
            <>
              <TableCell colSpan={COLONNE.length - 1} className="text-right font-semibold">
                TOTALE COMPUTO €
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">{valuta(totale)}</TableCell>
            </>
          )
        }}
      />
      <p className="text-sm text-muted-foreground">
        Frecce per muoversi fra le celle, anche <strong>fra le zone e fra i gruppi</strong>. Un
        clic solo — o Invio, o un carattere qualsiasi — apre la modifica; Esc la annulla. Il{' '}
        <strong>+ misurazione</strong> è una riga vera: ci si arriva con le frecce e si attiva con
        Invio. I comandi rari della voce stanno su <strong>Shift+F10</strong>, fuori dall'ordine di
        Tab.
      </p>
    </div>
  )
}

/**
 * Il foglio editabile a gruppi: una sequenza di gruppi, ognuno con una
 * testata, un corpo di righe omogenee e un piede che le somma. È la forma del
 * computo metrico — la voce, le sue misurazioni, il SOMMANO — e di ogni foglio
 * fatto come lui.
 *
 * **Quando sì, quando no.** Si usa quando le colonne cambiano significato da
 * una zona all'altra del gruppo: la designazione è la descrizione della voce
 * in testata, quella della misura nel corpo, l'etichetta del totale nel piede;
 * le celle scrivibili stanno nel corpo, il prezzo nel piede. Un elenco da
 * leggere, anche ad albero con i subtotali, è `tassullo-data-table`, dove la
 * tastiera si muove per righe e il subtotale sta sopra i figli. Una tabella da
 * modificare cella per cella, con colonne che vogliono dire la stessa cosa su
 * ogni riga, copia, incolla e riempimento, è `tassullo-data-grid`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-foglio-gruppi
 * ```
 *
 * **Come si compone.** Il motore è `useFoglioGruppi`, e il foglio è
 * `<FoglioGruppi motore={…} didascalia="…" />`.
 *
 * - `useFoglioGruppi({ gruppiIniziali, colonne, onModifica, conRigaAzioni })`:
 *   i gruppi sono `{ id, testata, righe }`. Il motore non è controllato: tiene
 *   i gruppi in uno stato suo, seminato una volta da `gruppiIniziali`, e chi
 *   vuole sapere cosa è cambiato ascolta `onModifica`.
 * - Ogni colonna dichiara `id`, `titolo`, `larghezza`, `allineamento` e una
 *   cella per zona: `testata`, `corpo`, `piede`. Una cella è `scrivibile` —
 *   `leggi`, `scrivi`, e a scelta `mostra`, `valida`, `segnaposto`,
 *   `formato`, `suffisso` — oppure
 *   `calcolata`, con `rendi`, oppure `fissa`. Una zona senza cella resta
 *   vuota.
 * - `azione` è il comando frequente del gruppo, su una riga propria fra corpo
 *   e piede — nel computo, «+ misurazione». È una sola, e il motore va
 *   costruito con `conRigaAzioni: true`, o la riga si vede e le frecce non la
 *   trovano.
 * - `comandi` sono i comandi rari del gruppo, in un menu: spostare la voce
 *   su o giù, eliminarla. Un comando con `distruttivo` si colora come
 *   un'azione che non si disfa.
 * - `piede` è la riga in coda al foglio, il totale generale.
 * - `didascalia` descrive la tabella a chi non vede lo schermo, ed è
 *   obbligatoria come un `alt`.
 *
 * **Regole d'uso.**
 *
 * - Il foglio conosce solo stringhe: `leggi` e `scrivi` convertono, e `mostra`
 *   formatta per la vista con le funzioni dell'item `numeri` — `decimale()`,
 *   `valuta()`, `formattatore()` — che scrivono sempre il separatore delle
 *   migliaia. Le colonne con `allineamento: 'destra'` hanno già le cifre
 *   tabellari.
 * - Un numero si scrive con la virgola, come si legge: la cella riceve
 *   `formato: { perScrivere: scriviNumero, interpreta: leggiNumero }`, con le
 *   due funzioni dell'item `numeri`. Il campo si apre con `20,78`, e ciò che
 *   si scrive arriva a `valida` e a `scrivi` già col punto, `20.78`. Il punto
 *   vale come separatore delle migliaia se raggruppa tre cifre (`1.234`),
 *   altrimenti come decimale.
 * - `suffisso` resta accanto al campo in modifica, fuori da ciò che si scrive:
 *   per un prezzo, `'\u00a0€'`, la coda di ciò che `valuta()` mostra. Senza,
 *   le cifre allineate a destra si spostano aprendo la modifica.
 * - `valida` restituisce il messaggio d'errore, o `undefined` se il valore va
 *   bene.
 * - Un gruppo senza righe mostra comunque testata e piede: è la voce appena
 *   aggiunta, che ha un prezzo e non ha ancora misure.
 * - Quando il fuoco lascia il foglio — un clic su «Salva», su un filtro,
 *   altrove nella pagina — la cella su cui si lavorava tiene un bordo sottile
 *   e la sua riga un fondo tenue: resta chiaro dove si era. Un campo aperto si
 *   conferma, come per ogni uscita. Il `Tab` segue l'ordine della pagina, e
 *   quando arriva al foglio entra proprio sulla cella segnata.
 * - Su uno schermo stretto il foglio non si comprime: la pagina sceglie una
 *   seconda faccia, una lista in sola lettura che apre la modifica in un
 *   cassetto (`tassullo-responsive-dialog`). La scena «Due Facce» è la
 *   ricetta.
 *
 * **Tastiera e accessibilità.** Il foglio è un solo fermo di tabulazione:
 * `Tab` entra sulla cella attiva — la prima scrivibile, all'inizio — e il
 * `Tab` seguente esce. Dentro, le frecce si muovono fra le celle saltando
 * quelle che non esistono: dall'ultima misura di un gruppo `↓` entra nel
 * gruppo dopo, e dalla colonna della designazione si arriva al piede e, a
 * destra, al prezzo. `Invio`, `F2` o un carattere qualsiasi aprono la
 * modifica, e anche un clic solo. Mentre si scrive, `Invio` conferma e scende,
 * `Tab` conferma e passa accanto, le frecce verticali cambiano cella e quelle
 * orizzontali lo fanno arrivate al bordo del testo; la cella d'arrivo si apre
 * già in modifica. Un valore non valido non si conferma: l'errore resta sulla
 * cella, con l'anello rosso e un testo collegato con `aria-describedby`, ed
 * `Esc` annulla sempre. La riga «+ misurazione» si raggiunge con le frecce e
 * si attiva con `Invio`. I comandi del gruppo si aprono con `Maiusc`+`F10` o
 * col tasto Menu, e il loro grilletto resta fuori dall'ordine di tabulazione.
 */
const meta: Meta<typeof FoglioGruppi<Voce, Misurazione>> = {
  title: 'Blocchi/Foglio a gruppi',
  component: FoglioGruppi,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Un computo con le sue voci, le misure, i SOMMANO e il totale in fondo. Si
 * prova da tastiera: le frecce attraversano le zone e i gruppi.
 */
export const Computo: Story = {
  render: () => <ComputoFoglio />,
}

/**
 * Un gruppo senza misure: testata e piede ci sono comunque, e le frecce
 * verticali passano dalla testata direttamente al SOMMANO.
 */
export const GruppoVuoto: Story = {
  render: () => (
    <ComputoFoglio
      gruppiIniziali={[
        COMPUTO[0]!,
        { id: 'nuova', testata: { designazione: '', unita: 'm²', prezzo: '' }, righe: [] },
        COMPUTO[2]!,
      ]}
    />
  ),
}

/**
 * La validazione per cella: scrivendo `abc` in una misura, l'anello rosso e
 * il messaggio restano finché non si corregge o non si preme `Esc`.
 */
export const Validazione: Story = {
  render: () => (
    <ComputoFoglio
      gruppiIniziali={[
        {
          id: 'v1',
          testata: { designazione: 'RASATURA ARMATA — Tradizionale', unita: 'm²', prezzo: '28,82' },
          righe: [{ descrizione: 'Piano terra', parti: '1', lunghezza: '10', larghezza: '1', altezza: '0,5' }],
        },
      ]}
    />
  ),
}

/**
 * Il menu dei comandi di una voce, aperto: le azioni rare del gruppo, che da
 * tastiera si aprono con `Maiusc`+`F10`.
 */
export const Comandi: Story = {
  render: () => <ComputoFoglio />,
  play: apriCol('[data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

/* ────────────────────────────────────────────────────────────────────────
 * La faccia stretta
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * **La protezione anti-zoom non è più qui: sta in `ui/input.tsx`**, dov'è il suo
 * posto. iOS Safari ingrandisce la pagina quando il fuoco entra in un campo
 * sotto i **16px** e non la rimpicciolisce uscendo; shadcn lo previene con
 * `text-base md:text-sm`, dove `text-base` vale 16px **in Tailwind** — ma la
 * nostra scala (D16, M1.6) tara `--text-base` a **15px**, e la protezione era
 * disarmata da un pixel. Corretto alla radice il 2026-09-22 su richiesta di
 * Francesco: `text-lg md:text-sm` su `input` e `textarea`, che nella nostra
 * scala è esattamente 16px. Questa story non porta più nessuna classe propria
 * per lo zoom — una copia locale di una regola di sistema è la riga che
 * diverge al primo cambio.
 */

function CampoCassetto({
  etichetta,
  valore,
  onScrivi,
  numerico = false,
}: {
  etichetta: string
  valore: string
  onScrivi: (v: string) => void
  numerico?: boolean
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">{etichetta}</span>
      <Input
        value={valore}
        inputMode={numerico ? 'decimal' : undefined}
        className={numerico ? 'text-right tabular-nums' : undefined}
        onChange={(e) => onScrivi(e.target.value)}
      />
    </label>
  )
}

/** Il cassetto: bozza locale, si scrive solo confermando. */
function CassettoModifica<T>({
  aperto,
  onApertoCambia,
  titolo,
  valoreIniziale,
  onConferma,
  campi,
}: {
  aperto: boolean
  onApertoCambia: (v: boolean) => void
  titolo: string
  valoreIniziale: T
  onConferma: (v: T) => void
  campi: (bozza: T, scrivi: (patch: Partial<T>) => void) => React.ReactNode
}) {
  // Lo stato si semina **al montaggio** e basta: il chiamante rimonta il
  // cassetto con una `key` che cambia a ogni riga aperta. Un `useEffect` che
  // risincronizzasse la bozza sarebbe un `setState` dentro un effetto — la
  // famiglia di difetti che `CLAUDE.md` mette in guardia, e che oxlint segnala
  // come `react(set-state-in-effect)`: l'ha preso appena scritto.
  const [bozza, setBozza] = React.useState(valoreIniziale)

  return (
    <ResponsiveDialog open={aperto} onOpenChange={onApertoCambia}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{titolo}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="flex flex-col gap-3">
          {campi(bozza, (patch) => setBozza((b) => ({ ...b, ...patch })))}
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          <Button type="button" variant="outline" onClick={() => onApertoCambia(false)}>
            Annulla
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConferma(bozza)
              onApertoCambia(false)
            }}
          >
            Conferma
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}

/**
 * La faccia stretta, **forma D**: la lista resta in sola lettura e densissima —
 * non si muove mai — e la modifica accade in un **cassetto dal basso**. Scelta
 * da Francesco fra le quattro provate, perché la lettura è ciò che sul telefono
 * si fa di più.
 *
 * **Tutto è modificabile, anche la testata e il prezzo.** Nella prima stesura
 * solo le misure lo erano: *«occhio che così il titolo della voce e prezzo non
 * sono modificabili»* — e una faccia dove due campi su tre si possono solo
 * leggere non è la faccia stretta del computo. La testata apre il cassetto
 * della **voce** (designazione, unità, prezzo), ogni misura il cassetto della
 * **misura**.
 */
function SchedeComputo({
  gruppi,
  scrivi,
}: {
  gruppi: GruppoFoglio<Voce, Misurazione>[]
  scrivi: (g: GruppoFoglio<Voce, Misurazione>[]) => void
}) {
  const [voceAperta, setVoceAperta] = React.useState<number | null>(null)
  const [misuraAperta, setMisuraAperta] = React.useState<{ g: number; m: number } | null>(null)

  const aggiornaVoce = (gi: number, testata: Voce) =>
    scrivi(gruppi.map((g, i) => (i === gi ? { ...g, testata } : g)))
  const aggiornaMisura = (gi: number, mi: number, m: Misurazione) =>
    scrivi(
      gruppi.map((g, i) =>
        i === gi ? { ...g, righe: g.righe.map((r, j) => (j === mi ? m : r)) } : g
      )
    )
  const aggiungiMisuraA = (gi: number) => {
    scrivi(
      gruppi.map((g, i) =>
        i === gi
          ? { ...g, righe: [...g.righe, { descrizione: '', parti: '1', lunghezza: '', larghezza: '', altezza: '' }] }
          : g
      )
    )
    setMisuraAperta({ g: gi, m: gruppi[gi]!.righe.length })
  }

  const fattori = (m: Misurazione) =>
    [m.parti, m.lunghezza, m.larghezza, m.altezza].filter(Boolean).map(scriviNumero).join(' × ')

  const voceCorrente = voceAperta != null ? gruppi[voceAperta]?.testata : undefined
  const misuraCorrente =
    misuraAperta != null ? gruppi[misuraAperta.g]?.righe[misuraAperta.m] : undefined

  return (
    <div className="flex flex-col gap-4">
      {gruppi.map((gruppo, gi) => (
        <Card key={gruppo.id}>
          <CardHeader>
            {/* La testata è un bersaglio: apre il cassetto della voce. */}
            <button
              type="button"
              className="-mx-2 rounded-md px-2 py-1 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              onClick={() => setVoceAperta(gi)}
            >
              <CardTitle>{gruppo.testata.designazione || 'Voce senza descrizione'}</CardTitle>
            </button>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {gruppo.righe.map((m, mi) => (
              // Il separatore sta sul **contenitore**, non sul bottone: un
              // `border-b` sullo stesso elemento che porta `rounded-md` per
              // l'anello di fuoco **segue il raggio**, e la linea si incurva
              // agli estremi invece di correre dritta fra una misura e l'altra
              // (rilievo di Francesco, 2026-09-22 — si vede solo su una riga
              // stretta, dove il raggio è una frazione grande della larghezza).
              <div key={mi} className="-mx-2 border-b px-2">
              <button
                type="button"
                className="flex w-full items-baseline justify-between gap-3 rounded-md py-2 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                onClick={() => setMisuraAperta({ g: gi, m: mi })}
              >
                <span className="truncate text-sm text-muted-foreground">
                  {m.descrizione || 'misura senza descrizione'}
                </span>
                <span className="shrink-0 text-sm tabular-nums">
                  {fattori(m)} <strong className="ps-2">{decimale(parziale(m))}</strong>
                </span>
              </button>
              </div>
            ))}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start text-accent-ink"
              onClick={() => aggiungiMisuraA(gi)}
            >
              + misurazione
            </Button>

            {/* **Ogni riga è una riga**, non due celle di una griglia. Con
                `grid-cols-[1fr_auto] gap-x-4` il `border-t` cadeva su `dt` e
                `dd` separatamente e **il gap in mezzo non ne aveva**: la linea
                si spezzava nel vuoto e ripartiva sopra i numeri a destra
                (rilievo di Francesco, 2026-09-22). Un separatore che divide due
                cose deve attraversarle tutte e due, quindi sta sulla riga. */}
            <dl className="mt-1 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Sommano</dt>
                <dd className="tabular-nums">
                  {decimale(sommano(gruppo.righe))} {gruppo.testata.unita}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Prezzo unit.</dt>
                <dd className="tabular-nums">
                  {gruppo.testata.prezzo ? valuta(numero(gruppo.testata.prezzo) ?? 0) : 'da prezzare'}
                </dd>
              </div>
              <div className="mt-1 flex justify-between gap-4 border-t pt-1 font-semibold">
                <dt>Importo</dt>
                <dd className="tabular-nums">
                  {(() => {
                    const i = importo(gruppo.testata, gruppo.righe)
                    return i == null ? '—' : valuta(i)
                  })()}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ))}

      {voceCorrente ? (
        <CassettoModifica<Voce>
          key={`voce-${voceAperta}`}
          aperto={voceAperta != null}
          onApertoCambia={(v) => setVoceAperta(v ? voceAperta : null)}
          titolo="Voce di computo"
          // Nel cassetto si scrive come nel foglio: con la virgola all'apertura,
          // interpretato alla conferma.
          valoreIniziale={{ ...voceCorrente, prezzo: scriviNumero(voceCorrente.prezzo) }}
          onConferma={(v) => aggiornaVoce(voceAperta!, { ...v, prezzo: leggiNumero(v.prezzo) })}
          campi={(bozza, scriviBozza) => (
            <>
              <CampoCassetto
                etichetta="Designazione dei lavori"
                valore={bozza.designazione}
                onScrivi={(v) => scriviBozza({ designazione: v })}
              />
              <div className="flex gap-3">
                <CampoCassetto
                  etichetta="Unità"
                  valore={bozza.unita}
                  onScrivi={(v) => scriviBozza({ unita: v })}
                />
                <CampoCassetto
                  etichetta="Prezzo unitario"
                  numerico
                  valore={bozza.prezzo}
                  onScrivi={(v) => scriviBozza({ prezzo: v })}
                />
              </div>
            </>
          )}
        />
      ) : null}

      {misuraCorrente ? (
        <CassettoModifica<Misurazione>
          key={`misura-${misuraAperta?.g}-${misuraAperta?.m}`}
          aperto={misuraAperta != null}
          onApertoCambia={(v) => setMisuraAperta(v ? misuraAperta : null)}
          titolo="Misurazione"
          valoreIniziale={{
            ...misuraCorrente,
            parti: scriviNumero(misuraCorrente.parti),
            lunghezza: scriviNumero(misuraCorrente.lunghezza),
            larghezza: scriviNumero(misuraCorrente.larghezza),
            altezza: scriviNumero(misuraCorrente.altezza),
          }}
          onConferma={(m) =>
            aggiornaMisura(misuraAperta!.g, misuraAperta!.m, {
              ...m,
              parti: leggiNumero(m.parti),
              lunghezza: leggiNumero(m.lunghezza),
              larghezza: leggiNumero(m.larghezza),
              altezza: leggiNumero(m.altezza),
            })
          }
          campi={(bozza, scriviBozza) => (
            <>
              <CampoCassetto
                etichetta="Descrizione (parti negative = detrazione)"
                valore={bozza.descrizione}
                onScrivi={(v) => scriviBozza({ descrizione: v })}
              />
              {/* I quattro fattori su **una riga sola** appena il cassetto è
                  largo abbastanza: si digitano numeri di tre o quattro cifre,
                  quindi due file da due sprecano un'altezza che sul telefono
                  è la risorsa scarsa (rilievo di Francesco, 2026-09-22).
                  **Container query, non media query**: la soglia guarda il
                  cassetto, non la finestra — il `Drawer` ha una larghezza sua,
                  e `docs/DECISIONI.md` §46 ricorda che una media query qui si
                  misurerebbe anche male. `@xs` è 320px di contenitore. */}
              <div className="@container">
                <div className="grid grid-cols-2 gap-3 @xs:grid-cols-4">
                  <CampoCassetto etichetta="Par.ug." numerico valore={bozza.parti}
                    onScrivi={(v) => scriviBozza({ parti: v })} />
                  <CampoCassetto etichetta="Lung." numerico valore={bozza.lunghezza}
                    onScrivi={(v) => scriviBozza({ lunghezza: v })} />
                  <CampoCassetto etichetta="Larg." numerico valore={bozza.larghezza}
                    onScrivi={(v) => scriviBozza({ larghezza: v })} />
                  <CampoCassetto etichetta="H/Peso" numerico valore={bozza.altezza}
                    onScrivi={(v) => scriviBozza({ altezza: v })} />
                </div>
              </div>
              <p className="text-right text-sm text-muted-foreground">
                Parziale <strong className="tabular-nums">{decimale(parziale(bozza))}</strong>
              </p>
            </>
          )}
        />
      ) : null}
    </div>
  )
}

function ComputoADueFacce() {
  // **La soglia la dichiara la pagina, non il blocco** — è la regola di
  // `use-soglia` (M4ter.6): quante colonne ha quel foglio lo sa solo chi lo
  // scrive. Qui 896px, perché è la larghezza sotto la quale il foglio comincia
  // a scorrere (`min-w-4xl`): scorrere orizzontalmente su un telefono è
  // esattamente ciò che la faccia stretta esiste per evitare.
  const largo = useSoglia('(min-width: 896px)')
  const motore = useFoglioGruppi<Voce, Misurazione>({
    gruppiIniziali: COMPUTO,
    colonne: COLONNE,
    conRigaAzioni: true,
  })
  return largo ? (
    <ComputoFoglio />
  ) : (
    <SchedeComputo gruppi={motore.gruppi} scrivi={motore.scriviGruppi} />
  )
}

/**
 * La faccia stretta: sotto soglia il foglio lascia il posto a una lista in
 * sola lettura, e toccando la testata o una misura si apre il cassetto per
 * modificarla. La soglia guarda la finestra: la scena si prova aperta da
 * sola, scegliendo il telefono dall'interruttore Viewport o stringendo la
 * finestra del browser.
 */
export const DueFacce: Story = {
  name: 'Due facce',
  render: () => <ComputoADueFacce />,
}
