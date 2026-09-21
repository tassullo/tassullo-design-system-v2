import type { Meta, StoryObj } from '@storybook/react-vite'

import { apriCol } from '@/prove/apri'

import {
  FoglioGruppi,
  useFoglioGruppi,
  type ColonnaFoglio,
  type GruppoFoglio,
} from '@/registry/tassullo/blocks/foglio-gruppi'
import { decimale, valuta } from '@/registry/tassullo/lib/numeri'
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

const numero = (v: string) => {
  const n = parseFloat(v.trim().replace(',', '.'))
  return Number.isNaN(n) ? null : n
}

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
    testata: { designazione: 'RASATURA ARMATA — Tradizionale', unita: 'm²', prezzo: '28,82' },
    righe: [
      { descrizione: 'Piano terra — ambiente 1', parti: '1', lunghezza: '10', larghezza: '1', altezza: '0,5' },
      { descrizione: 'Piano terra — ambiente 2', parti: '1', lunghezza: '5', larghezza: '3,5', altezza: '' },
      { descrizione: 'detrazione porta', parti: '-1', lunghezza: '0,9', larghezza: '2,1', altezza: '' },
    ],
  },
  {
    id: 'v2',
    testata: { designazione: 'EFFETTO CALCE — Grana fine grandi metrature', unita: 'm²', prezzo: '35,03' },
    righe: [
      { descrizione: 'Piano primo — corridoio', parti: '1', lunghezza: '12', larghezza: '2,7', altezza: '' },
    ],
  },
  {
    id: 'v3',
    testata: { designazione: 'MURO — Bioedilizia', unita: 'm³', prezzo: '14,48' },
    righe: [
      { descrizione: 'Piano secondo — ambiente 1', parti: '2', lunghezza: '4', larghezza: '0,3', altezza: '2,7' },
      { descrizione: 'Piano secondo — ambiente 2', parti: '1', lunghezza: '6,5', larghezza: '0,3', altezza: '2,7' },
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
    corpo: { tipo: 'scrivibile', leggi: (m) => m.parti, scrivi: (m, v) => ({ ...m, parti: v }), valida: soloNumero } },
  { id: 'lunghezza', titolo: 'Lung.', larghezza: 'w-20', allineamento: 'destra',
    corpo: { tipo: 'scrivibile', leggi: (m) => m.lunghezza, scrivi: (m, v) => ({ ...m, lunghezza: v }), valida: soloNumero } },
  { id: 'larghezza', titolo: 'Larg.', larghezza: 'w-20', allineamento: 'destra',
    corpo: { tipo: 'scrivibile', leggi: (m) => m.larghezza, scrivi: (m, v) => ({ ...m, larghezza: v }), valida: soloNumero } },
  { id: 'altezza', titolo: 'H/Peso', larghezza: 'w-20', allineamento: 'destra',
    corpo: { tipo: 'scrivibile', leggi: (m) => m.altezza, scrivi: (m, v) => ({ ...m, altezza: v }), valida: soloNumero } },
  {
    id: 'quantita',
    titolo: 'Quantità',
    larghezza: 'w-28',
    allineamento: 'destra',
    ancorata: true,
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
    ancorata: true,
    piede: {
      tipo: 'scrivibile',
      leggi: (v) => v.prezzo,
      scrivi: (v, valore) => ({ ...v, prezzo: valore }),
      segnaposto: 'da prezzare',
      valida: soloNumero,
      mostra: (valore) => (valore ? valuta(numero(valore) ?? 0) : 'da prezzare'),
    },
  },
  {
    id: 'importo',
    titolo: 'Importo',
    larghezza: 'w-32',
    allineamento: 'destra',
    ancorata: true,
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
 * **`tassullo-foglio-gruppi`** — il foglio editabile a gruppi, nella forma del
 * computo metrico da cui nasce: una **voce** è la testata, le sue
 * **misurazioni** sono il corpo, il **SOMMANO** è il piede.
 *
 * **Perché non `data-table` e non `data-grid`** (misure in `docs/DECISIONI.md`
 * §50): il primo ha l'albero ma la tastiera di riga, e mette il subtotale
 * *sopra* i figli mentre il SOMMANO sta sotto; il secondo ha la tastiera di
 * cella ma è una **matrice**, e qui le colonne si spartiscono per zona invece
 * di volere la stessa cosa su ogni riga.
 *
 * **Da tastiera** — è il motivo per cui il blocco esiste, e va provato:
 *
 * - `ArrowDown` dall'ultima misurazione di una voce **entra nella voce dopo**
 *   invece di fermarsi. Nel Computo di Studio, oggi, lì non succede niente.
 * - Dalla colonna **Designazione** le frecce raggiungono il **SOMMANO**, e da
 *   lì `ArrowRight` arriva al **prezzo** — la cella che determina l'importo,
 *   che oggi sta in fondo a un vicolo cieco raggiungibile solo col `Tab`.
 * - `Tab` **esce dal foglio in una fermata**: le celle hanno un fuoco mobile.
 *   Nel Computo vero un gruppo da tre misure costa **24 fermate**, sei delle
 *   quali comandi, e fra una riga e l'altra si passa su «Rimuovi».
 * - I comandi della voce sono su **`Shift+F10`** (o tasto Menu), la
 *   scorciatoia di sistema per il menu contestuale.
 */
const meta: Meta<typeof FoglioGruppi<Voce, Misurazione>> = {
  title: 'Blocchi/Foglio a gruppi',
  component: FoglioGruppi,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof meta>

export const Computo: Story = {
  render: () => <ComputoFoglio />,
}

/**
 * **Un gruppo senza righe** mostra comunque il suo piede: è la voce appena
 * aggiunta, che ha un prezzo e non ha ancora una misura. Le frecce verticali
 * la attraversano — testata, poi direttamente il SOMMANO — senza inciampare
 * nel corpo vuoto, perché la matrice salta le caselle che non esistono e un
 * corpo vuoto non ne produce nessuna.
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
 * **La validazione per cella**, con la stessa disciplina di
 * `tassullo-form-field`: anello rosso per chi vede, `aria-describedby` verso un
 * testo `sr-only` per chi non vede. `Invio` e `Tab` **non** chiudono una
 * modifica invalida — l'errore resta a schermo e si corregge senza aver perso
 * il posto; `Esc` annulla sempre, valido o no, perché è la via d'uscita che non
 * deve mai bloccarsi. Da provare: scrivere `abc` in una cella di misura.
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
 * **I comandi della voce**, aperti. Stanno su **`Shift+F10`** (o tasto Menu) e
 * il loro grilletto ha `tabIndex={-1}`: `Tab` non ci si ferma mai. È la
 * correzione di un difetto misurato sul Computo di Studio, dove per passare da
 * una misurazione alla successiva si tabulava **sul bottone che la cancella** —
 * 576 volte, su un computo da 144 voci.
 *
 * La story ha la `play` che **dichiara il popup al gate** (`scripts/gate-a11y.ts`
 * tiene l'elenco dei componenti che ne hanno uno, e senza la dichiarazione
 * questo sarebbe passato per «senza popup»: un popup non aperto non è un popup
 * senza violazioni). Sta qui e non sulla story `Computo` perché Storybook
 * esegue le `play` **anche nel canvas**: quella arriverebbe a video col menu
 * aperto sopra la tabella, cioè illeggibile proprio quando la si guarda.
 *
 * Il `data-slot` del grilletto è stato **guardato nel DOM**, non dedotto:
 * malgrado il `render={<Button/>}` resta `dropdown-menu-trigger`, come il menù
 * utente del guscio — mentre il combobox, composto in modo somigliante, se lo
 * fa riprendere da `InputGroupButton`.
 */
export const Comandi: Story = {
  render: () => <ComputoFoglio />,
  play: apriCol('[data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}
