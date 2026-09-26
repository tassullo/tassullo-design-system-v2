import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

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
 * legge: il dato salvato si legge con `Number()`. `leggiNumero` è per il testo
 * scritto, con la virgola (`0,5`), e su un dato salvato sbaglierebbe: il punto
 * di `'2.375'` per lui separa le migliaia, e il prezzo diventerebbe
 * duemilatrecentosettantacinque.
 */
const numero = (v: string) => {
  if (v.trim() === '') return null
  const n = Number(v)
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
      classiTesto: 'font-semibold',
    },
    corpo: {
      tipo: 'scrivibile',
      leggi: (m) => m.descrizione,
      scrivi: (m, valore) => ({ ...m, descrizione: valore }),
      segnaposto: 'descrizione misura (parti negative = detrazione)',
      classiTesto: 'pl-4 italic',
    },
    // La colonna che le tre zone condividono: è da qui che le frecce
    // verticali raggiungono il piede, e da lì `ArrowRight` arriva al prezzo.
    piede: {
      tipo: 'scrivibile',
      leggi: (v) => v.unita,
      scrivi: (v, valore) => ({ ...v, unita: valore }),
      // Stile, prefisso e allineamento dichiarati e non disegnati in `mostra`:
      // così il campo aperto li conosce, e «m²» non si sposta aprendolo.
      prefisso: 'SOMMANO',
      allineamento: 'destra',
      classiTesto: 'pr-2 text-accent-ink',
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
 *   `formato`, `prefisso`, `suffisso`, `classiTesto`, `allineamento`,
 *   `abilitata` — oppure `calcolata`, con `rendi`, oppure `fissa`. Una zona
 *   senza cella resta vuota.
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
 * - Dove la pagina rilegge il dato per un calcolo — una quantità, un importo —
 *   lo legge con `Number()`: il dato ha già il punto decimale. `leggiNumero` è
 *   solo per il testo scritto, e su un dato salvato sbaglia: prende `2.375`
 *   per duemilatrecentosettantacinque.
 * - **Una cella aperta si legge come una chiusa**: stesso posto, stesso
 *   aspetto. Lo stile del valore — corsivo, grassetto, rientro, colore — va
 *   in `classiTesto`, che vale per la cella chiusa e per il campo aperto;
 *   `prefisso` è il testo fisso davanti al valore («SOMMANO»), `allineamento`
 *   quello della singola cella. `mostra` serve solo a formattare il valore:
 *   uno stile scritto lì il campo aperto non lo vedrebbe, e il testo si
 *   sposterebbe aprendo la modifica.
 * - `suffisso` resta accanto al campo in modifica, fuori da ciò che si scrive:
 *   per un prezzo, `'\u00a0€'`, la coda di ciò che `valuta()` mostra. Senza,
 *   le cifre allineate a destra si spostano aprendo la modifica.
 * - `valida` restituisce il messaggio d'errore, o `undefined` se il valore va
 *   bene.
 * - Quando nello stesso gruppo convivono righe di tipo diverso e una colonna
 *   si scrive solo su alcune — lo sfrido sui materiali, non sulla manodopera —
 *   la cella scrivibile riceve `abilitata: (riga) => boolean`. Sulle righe
 *   dove è falsa la cella mostra il valore come testo, non prende il fuoco e
 *   un clic non la apre: senza, il campo accetterebbe un valore che `scrivi`
 *   poi ignora, e chi scrive crederebbe di aver cambiato qualcosa. La scena
 *   «Righe di tipo diverso» è la ricetta.
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
 * quelle che non si scrivono — calcolate, fisse, o non abilitate su quella
 * riga: dall'ultima misura di un gruppo `↓` entra nel
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

// Scena di misura di «Computo»: la stessa resa, con la prova. `!dev` la toglie
// dalla barra e da Docs, così la scena qui sopra si apre a riposo; il
// controllo automatico la esegue lo stesso.
export const ComputoProva: Story = {
  ...Computo,
  name: 'Computo, prova',
  tags: ['!dev', '!autodocs'],
  play: prezzoConTreDecimali,
}

// Prova: un prezzo scritto con tre decimali resta quello. «2,375» si salva come
// «2.375»; rileggerlo come testo scritto lo faceva diventare
// duemilatrecentosettantacinque, e la voce mostrava «2.375,00 €» con un importo
// mille volte più grande.
async function prezzoConTreDecimali({ canvasElement }: { canvasElement: HTMLElement }) {
  const piede = await waitFor(() => {
    const trovato = [...canvasElement.querySelectorAll<HTMLElement>('tbody tr')].find((tr) =>
      within(tr).queryByRole('button', { name: /^Prezzo unit\.:/ })
    )
    expect(trovato).toBeTruthy()
    return trovato!
  })
  await scriviPrezzo(piede, '2,375')
  // SOMMANO della prima voce: 10 × 1 × 0,5 + 5 × 3,5 − 0,9 × 2,1 = 20,61.
  await waitFor(() => expect(piede.textContent).toContain('48,95\u00a0€'))
  expect(piede.textContent).toContain('2,38\u00a0€')
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
          testata: { designazione: 'RASATURA ARMATA — Tradizionale', unita: 'm²', prezzo: '28.82' },
          righe: [{ descrizione: 'Piano terra', parti: '1', lunghezza: '10', larghezza: '1', altezza: '0.5' }],
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
 * Righe di tipo diverso nello stesso gruppo
 * ──────────────────────────────────────────────────────────────────────── */

type VoceAnalisi = { designazione: string; unita: string }

type Componente = {
  tipo: 'materiale' | 'manodopera' | 'prezzo'
  descrizione: string
  quantita: string
  prezzo: string
  sfrido: string
}

const TIPI_COMPONENTE: Record<Componente['tipo'], string> = {
  materiale: 'Materiale',
  manodopera: 'Manodopera',
  prezzo: 'Prezzo',
}

// Lo sfrido vale solo per i materiali: sulle altre righe il fattore è 1.
const importoComponente = (c: Componente) => {
  const q = numero(c.quantita) ?? 0
  const p = numero(c.prezzo) ?? 0
  const f = c.tipo === 'materiale' ? (numero(c.sfrido) ?? 1) : 1
  return Math.round(q * p * f * 100) / 100
}

const ANALISI: GruppoFoglio<VoceAnalisi, Componente>[] = [
  {
    id: 'a1',
    testata: { designazione: 'INTONACO DEUMIDIFICANTE — analisi al m²', unita: 'm²' },
    righe: [
      { tipo: 'materiale', descrizione: 'Premiscelato deumidificante', quantita: '18', prezzo: '0.62', sfrido: '1.05' },
      { tipo: 'manodopera', descrizione: 'Operaio specializzato', quantita: '0.35', prezzo: '38.5', sfrido: '' },
      { tipo: 'materiale', descrizione: 'Rete in fibra di vetro', quantita: '1.1', prezzo: '1.8', sfrido: '1.1' },
      { tipo: 'prezzo', descrizione: 'Ponteggio, dal prezzario', quantita: '1', prezzo: '4.2', sfrido: '' },
    ],
  },
]

const COLONNE_ANALISI: ColonnaFoglio<VoceAnalisi, Componente>[] = [
  {
    id: 'tipo',
    titolo: 'Tipo',
    larghezza: 'w-32',
    corpo: { tipo: 'calcolata', rendi: (c) => TIPI_COMPONENTE[c.tipo] },
  },
  {
    id: 'designazione',
    titolo: 'Designazione',
    testata: {
      tipo: 'scrivibile',
      leggi: (v) => v.designazione,
      scrivi: (v, valore) => ({ ...v, designazione: valore }),
      classiTesto: 'font-semibold',
    },
    corpo: {
      tipo: 'scrivibile',
      leggi: (c) => c.descrizione,
      scrivi: (c, valore) => ({ ...c, descrizione: valore }),
      classiTesto: 'pl-4',
    },
    piede: { tipo: 'fissa', rendi: () => 'Prezzo di analisi' },
  },
  { id: 'quantita', titolo: 'Quantità', larghezza: 'w-24', allineamento: 'destra',
    corpo: { tipo: 'scrivibile', leggi: (c) => c.quantita, scrivi: (c, v) => ({ ...c, quantita: v }), valida: soloNumero,
      formato: SCRITTURA_NUMERO, mostra: mostraMisura } },
  // Il prezzo in euro, come l'importo accanto: due decimali, le virgole in
  // colonna. In modifica il simbolo resta accanto al campo.
  { id: 'prezzo', titolo: 'Prezzo unit.', larghezza: 'w-28', allineamento: 'destra',
    corpo: { tipo: 'scrivibile', leggi: (c) => c.prezzo, scrivi: (c, v) => ({ ...c, prezzo: v }), valida: soloNumero,
      formato: SCRITTURA_NUMERO, suffisso: '\u00a0€',
      mostra: (valore) => (valore === '' ? ' ' : valuta(numero(valore) ?? 0)) } },
  {
    id: 'sfrido',
    titolo: 'Sfrido',
    larghezza: 'w-24',
    allineamento: 'destra',
    corpo: {
      tipo: 'scrivibile',
      leggi: (c) => c.sfrido,
      scrivi: (c, v) => ({ ...c, sfrido: v }),
      valida: soloNumero,
      formato: SCRITTURA_NUMERO,
      mostra: mostraMisura,
      abilitata: (c) => c.tipo === 'materiale',
    },
  },
  {
    id: 'importo',
    titolo: 'Importo',
    larghezza: 'w-28',
    allineamento: 'destra',
    corpo: { tipo: 'calcolata', rendi: (c) => valuta(importoComponente(c)) },
    piede: {
      tipo: 'calcolata',
      rendi: (_v, righe: Componente[]) => (
        <span className="font-semibold">
          {valuta(righe.reduce((tot, c) => tot + importoComponente(c), 0))}
        </span>
      ),
    },
  },
]

function AnalisiPrezzo() {
  const motore = useFoglioGruppi<VoceAnalisi, Componente>({
    gruppiIniziali: ANALISI,
    colonne: COLONNE_ANALISI,
  })
  return <FoglioGruppi motore={motore} didascalia="Analisi del prezzo" />
}

// Prova: la cella dello sfrido esiste su ogni riga, ma si scrive e prende il
// fuoco solo sui materiali. Sulle altre è testo: niente ruolo di bottone,
// niente tabindex, un clic non apre il campo, e le frecce la scavalcano come
// una cella calcolata.
async function sfridoSoloSuiMateriali({ canvasElement }: { canvasElement: HTMLElement }) {
  const canvas = within(canvasElement)
  const scrivibili = canvas.getAllByRole('button', { name: /^Sfrido:/ })
  expect(scrivibili).toHaveLength(2)

  const righe = canvasElement.querySelectorAll('tbody tr')
  const manodopera = [...righe].find((r) => r.textContent?.includes('Operaio specializzato'))!
  const cellaSpenta = manodopera.children[4] as HTMLElement
  expect(cellaSpenta.querySelector('[tabindex], [role="button"]')).toBeNull()
  await userEvent.click(cellaSpenta)
  expect(cellaSpenta.querySelector('input')).toBeNull()

  scrivibili[0]!.focus()
  await userEvent.keyboard('{ArrowDown}')
  await waitFor(() =>
    expect(document.activeElement?.closest('tr')?.textContent).toContain('Rete in fibra di vetro')
  )
  expect(document.activeElement?.getAttribute('aria-label')).toMatch(/^Sfrido:/)

  const prezzoManodopera = within(manodopera as HTMLElement).getByRole('button', { name: /^Prezzo unit\.:/ })
  prezzoManodopera.focus()
  await userEvent.keyboard('{ArrowRight}')
  expect(document.activeElement).toBe(prezzoManodopera)
}

/**
 * Righe di tipo diverso nello stesso gruppo: un'analisi del prezzo con
 * materiali, manodopera e un prezzo dal prezzario. Lo sfrido si scrive solo
 * sui materiali: sulle altre righe la cella è testo, non prende il fuoco e le
 * frecce la scavalcano.
 */
export const RigheDiTipoDiverso: Story = {
  name: 'Righe di tipo diverso',
  render: () => <AnalisiPrezzo />,
}

// Scena di misura di «Righe di tipo diverso»: la stessa resa, con la prova. `!dev` la
// toglie dalla barra e da Docs, così la scena qui sopra si apre a riposo;
// il controllo automatico la esegue lo stesso.
export const RigheDiTipoDiversoProva: Story = {
  ...RigheDiTipoDiverso,
  name: 'Righe di tipo diverso, prova',
  tags: ['!dev', '!autodocs'],
  play: sfridoSoloSuiMateriali,
}

// Scrive un prezzo nella prima cella «Prezzo unit.» di una riga, dalla
// tastiera: `Invio` apre il campo, si sostituisce il testo, `Invio` conferma.
async function scriviPrezzo(riga: HTMLElement, testo: string) {
  within(riga).getByRole('button', { name: /^Prezzo unit\.:/ }).focus()
  await userEvent.keyboard('{Enter}')
  const campo = await waitFor(() => {
    const trovato = riga.querySelector('input')
    expect(trovato).toBeTruthy()
    return trovato!
  })
  await userEvent.clear(campo)
  await userEvent.type(campo, testo)
  await userEvent.keyboard('{Enter}')
}

/** Il bordo sinistro della virgola nel testo di un nodo. */
function virgola(nodo: Element): number {
  const giro = document.createTreeWalker(nodo, NodeFilter.SHOW_TEXT)
  for (let t = giro.nextNode(); t; t = giro.nextNode()) {
    const i = t.textContent?.indexOf(',') ?? -1
    if (i < 0) continue
    const intervallo = document.createRange()
    intervallo.setStart(t, i)
    intervallo.setEnd(t, i + 1)
    return intervallo.getBoundingClientRect().left
  }
  throw new Error(`Nessuna virgola in «${nodo.textContent}»`)
}

// Prova: il prezzo unitario si legge in euro, con le virgole in colonna, e un
// prezzo scritto con tre decimali resta quello. «2,375» si salva come «2.375»,
// e rileggerlo come testo scritto lo faceva diventare duemilatrecentosettantacinque:
// l'importo del Premiscelato (18 × 2,375 × 1,05) era 44.887,50 € invece di 44,89 €.
async function prezziInEuro({ canvasElement }: { canvasElement: HTMLElement }) {
  const tabella = canvasElement.querySelector('table')!
  const titoli = [...tabella.querySelectorAll('thead th')].map((th) => th.textContent?.trim())
  const colonna = (titolo: string) => titoli.indexOf(titolo)
  const righe = () =>
    [...tabella.querySelectorAll<HTMLElement>('tbody tr')].filter((tr) =>
      Object.values(TIPI_COMPONENTE).includes(tr.children[colonna('Tipo')]?.textContent ?? '')
    )
  await waitFor(() => expect(righe()).toHaveLength(4))
  expect(righe().map((tr) => tr.children[colonna('Prezzo unit.')]!.textContent)).toEqual([
    '0,62\u00a0€',
    '38,50\u00a0€',
    '1,80\u00a0€',
    '4,20\u00a0€',
  ])
  const virgole = righe().map((tr) => virgola(tr.children[colonna('Prezzo unit.')]!))
  expect(Math.max(...virgole) - Math.min(...virgole)).toBeLessThan(0.5)

  const premiscelato = righe().find((tr) => tr.textContent?.includes('Premiscelato'))!
  await scriviPrezzo(premiscelato, '2,375')
  await waitFor(() =>
    expect(premiscelato.children[colonna('Importo')]!.textContent).toBe('44,89\u00a0€')
  )
  expect(premiscelato.children[colonna('Prezzo unit.')]!.textContent).toBe('2,38\u00a0€')
}

// Scena di misura dei prezzi di «Righe di tipo diverso»: nascosta come quella sopra.
export const RigheDiTipoDiversoPrezzoProva: Story = {
  ...RigheDiTipoDiverso,
  name: 'Righe di tipo diverso, prezzo, prova',
  tags: ['!dev', '!autodocs'],
  play: prezziInEuro,
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

  // Nel cassetto i fattori sono testo scritto, con la virgola: si leggono con
  // `leggiNumero`, sia per il parziale che si aggiorna mentre si scrive sia
  // alla conferma, e diventano il dato col punto.
  const misuraScritta = (m: Misurazione): Misurazione => ({
    ...m,
    parti: leggiNumero(m.parti),
    lunghezza: leggiNumero(m.lunghezza),
    larghezza: leggiNumero(m.larghezza),
    altezza: leggiNumero(m.altezza),
  })

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

            {/* Il riepilogo è una lista di coppie termine–valore, scritta sul
                token di griglia del tema (`grid-cols-termine`: il termine largo
                quanto serve, il valore accanto). Qui le coppie restano sempre
                affiancate, senza andare in colonna sotto una soglia: i valori
                sono cifre corte allineate a destra, e il riepilogo di una voce
                si legge come uno scontrino. **Ogni coppia è una riga**
                (`grid-cols-subgrid` su due colonne), così il filo sopra
                l'importo attraversa termine, valore e lo spazio in mezzo: su
                `dt` e `dd` separati si spezzerebbe nel vuoto fra i due. */}
            <dl className="mt-1 grid grid-cols-termine gap-x-6 text-sm">
              <div className="col-span-2 grid grid-cols-subgrid">
                <dt className="text-muted-foreground">Sommano</dt>
                <dd className="text-right tabular-nums">
                  {decimale(sommano(gruppo.righe))} {gruppo.testata.unita}
                </dd>
              </div>
              <div className="col-span-2 grid grid-cols-subgrid">
                <dt className="text-muted-foreground">Prezzo unit.</dt>
                <dd className="text-right tabular-nums">
                  {gruppo.testata.prezzo ? valuta(numero(gruppo.testata.prezzo) ?? 0) : 'da prezzare'}
                </dd>
              </div>
              <div className="col-span-2 mt-1 grid grid-cols-subgrid border-t pt-1 font-semibold">
                <dt>Importo</dt>
                <dd className="text-right tabular-nums">
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
          onConferma={(m) => aggiornaMisura(misuraAperta!.g, misuraAperta!.m, misuraScritta(m))}
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
                Parziale <strong className="tabular-nums">{decimale(parziale(misuraScritta(bozza)))}</strong>
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
 * modificarla. La soglia guarda la finestra: la scena è alla larghezza di un
 * telefono, e la faccia larga è quella della scena «Computo».
 */
export const DueFacce: Story = {
  name: 'Due facce',
  globals: { viewport: { value: 'telefono', isRotated: false } },
  render: () => <ComputoADueFacce />,
}
