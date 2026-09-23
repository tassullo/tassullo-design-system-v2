import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import * as React from 'react'
import * as z from 'zod'

import {
  DataGrid,
  DataGridClipboard,
  DataGridFillHandle,
  DataGridRedo,
  DataGridUndo,
  colonnaCheckboxGriglia,
  colonnaDataGriglia,
  colonnaNumeroGriglia,
  colonnaSelectGriglia,
  colonnaTestoGriglia,
  colonnaValutaGriglia,
  useContestoDataGrid,
  useDataGrid,
  useGridChanges,
  validaConZod,
} from '@/registry/tassullo/blocks/data-grid'
import { creaColonne } from '@/registry/tassullo/blocks/data-table'
import { Badge } from '@/registry/tassullo/ui/badge'
import { Button } from '@/registry/tassullo/ui/button'

/* ────────────────────────────────────────────────────────────────────────
 * I dati finti — un elenco di voci, la forma minima di un computo prima che
 * la sessione 3 aggiunga subtotali e struttura ad albero.
 * ──────────────────────────────────────────────────────────────────────── */

type Voce = {
  id: string
  codice: string
  descrizione: string
  unita: string
  quantita: string
}

function seminato(seme: number) {
  let s = seme
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const DESCRIZIONI = [
  'Intonaco deumidificante, applicazione a mano',
  'Rasante ai silicati, finitura civile',
  'Massetto alleggerito, spessore 6 cm',
  'Consolidante per murature in pietra',
  'Malta da muratura, giunti sottili',
  'Pittura minerale traspirante',
  'Adesivo cementizio C2TE',
  'Rinzaffo grezzo di aggrappo',
]
const UNITA = ['m²', 'm³', 'kg', 'pz', 'ml']

function generaVoci(quante: number): Voce[] {
  const caso = seminato(20260916)
  const scegli = <T,>(v: T[]): T => v[Math.floor(caso() * v.length)]
  return Array.from({ length: quante }, (_, i) => ({
    id: `voce-${i}`,
    codice: `V${String(i + 1).padStart(3, '0')}`,
    descrizione: scegli(DESCRIZIONI),
    unita: scegli(UNITA),
    quantita: (10 + Math.floor(caso() * 490)).toString(),
  }))
}

const VOCI = generaVoci(60)

const col = creaColonne<Voce>()
const COLONNE_GRIGLIA = col.columns([
  colonnaTestoGriglia(col, 'codice', 'Codice', { size: 100 }),
  colonnaTestoGriglia(col, 'descrizione', 'Descrizione', { size: 340 }),
  colonnaTestoGriglia(col, 'unita', 'U.M.', { size: 80 }),
  colonnaTestoGriglia(col, 'quantita', 'Quantità', { size: 100 }),
])

/* ────────────────────────────────────────────────────────────────────────
 * La story
 * ──────────────────────────────────────────────────────────────────────── */

function ComputoFinto() {
  const motore = useDataGrid<Voce>({
    righeIniziali: VOCI,
    colonneId: ['codice', 'descrizione', 'unita', 'quantita'],
    idRiga: (v) => v.id,
    leggiCella: (v, c) => String(v[c as keyof Voce] ?? ''),
    scriviCella: (v, c, valore) => ({ ...v, [c]: valore }),
  })

  return (
    // `<DataGrid>` è sempre `altezza="ferma"`/`perPagina="virtuale"`: vuole
    // un genitore ad altezza vera, non opzionale — v. il commento in testa
    // a `<DataGrid>` in `data-grid.tsx`.
    <div className="flex h-140 flex-col">
      <DataGrid
        motore={motore}
        colonne={COLONNE_GRIGLIA}
        nomeRighe={{ singolare: 'voce', plurale: 'voci' }}
        className="min-h-0 flex-1"
        barra={
          <div className="flex gap-2">
            <DataGridUndo />
            <DataGridRedo />
          </div>
        }
      >
        <DataGridClipboard />
        <DataGridFillHandle />
      </DataGrid>
    </div>
  )
}

/**
 * La tabella da modificare cella per cella, come un foglio di calcolo: la
 * cella attiva si sposta con le frecce, si scrive, si copia e si incolla un
 * blocco di celle, si annulla e si ripete.
 *
 * **Quando sì, quando no.** Si usa quando le righe sono tante e omogenee — ogni
 * colonna vuol dire la stessa cosa su ogni riga — e il lavoro è correggerle o
 * compilarle in fila: un listino, un computo piatto, un elenco di voci. Per
 * leggere, cercare, filtrare e ordinare un elenco si usa `tassullo-data-table`,
 * su cui questo blocco è costruito; per cambiare un campo alla volta basta
 * l'editing in riga di quel blocco. Quando le colonne cambiano significato da
 * una zona all'altra — una voce con le sue misure e il totale sotto — il
 * foglio giusto è `tassullo-foglio-gruppi`. La griglia non ha ricerca,
 * ordinamento, filtri né righe annidate: la tastiera conta le celle
 * nell'ordine dei dati, e un ordine visibile diverso la porterebbe sulla riga
 * sbagliata.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-data-grid
 * ```
 *
 * **Come si compone.**
 *
 * - `useDataGrid(opzioni)` è il motore, con `righeIniziali`, `colonneId`,
 *   `idRiga`, `leggiCella`, `scriviCella` e `onModifica`. `colonneId` elenca
 *   le colonne modificabili
 *   nell'ordine in cui le percorrono `Tab` e l'incolla; `leggiCella` e
 *   `scriviCella` convertono una riga da e verso stringhe, e `scriviCella`
 *   restituisce una riga nuova. Il motore non è controllato: tiene le righe
 *   in uno stato suo, seminato una volta da `righeIniziali`, e si ascolta con
 *   `onModifica`.
 * - `<DataGrid motore={…} colonne={…} />` monta la tabella, sempre con un
 *   riquadro fermo e le righe virtualizzate: il genitore deve avere
 *   un'altezza, e la griglia riceve `className="min-h-0 flex-1"`. Accetta le
 *   prop di `tassullo-data-table` per il contorno — `barra`, `nomeRighe`,
 *   `selezione` — ma non `cerca`, `perPagina` e `altezza`.
 * - Le colonne si dichiarano con `colonnaTestoGriglia`,
 *   `colonnaNumeroGriglia`, `colonnaValutaGriglia`, `colonnaCheckboxGriglia`,
 *   `colonnaDataGriglia` e `colonnaSelectGriglia`, che ricevono il costruttore
 *   di `creaColonne()`, l'`id`, il titolo e a scelta `size` e `validazione`.
 *   Una colonna qualsiasi di TanStack, fuori da `colonneId`, resta fuori dalla
 *   navigazione con le frecce: è il posto per un bottone di riga, che però è
 *   un fermo di `Tab` per ogni riga in vista.
 * - Dentro `<DataGrid>` si mettono, se servono, `<DataGridClipboard />` per
 *   copia e incolla e `<DataGridFillHandle />` per la maniglia di
 *   riempimento; `<DataGridUndo />` e `<DataGridRedo />` sono i bottoni di
 *   annulla e ripeti, da mettere in `barra`.
 * - `validaConZod(schema)` trasforma uno schema Zod in una `validazione`.
 * - `useGridChanges(motore.righe, righeSalvate, idRiga)` confronta le righe
 *   con l'ultimo salvataggio e dice `creati`, `aggiornati`, `cancellati` e
 *   `cePendente`, per un bottone «Salva». Il motore offre `aggiungiRiga` e
 *   `rimuoviRighe`, annullabili come ogni altra modifica.
 * - `useContestoDataGrid()` dà il motore a una cella scritta a mano.
 *
 * **Regole d'uso.**
 *
 * - `idRiga` dev'essere un identificativo stabile, non l'indice: annulla e
 *   ripeti spostano le righe.
 * - Una cella non valida resta in modifica, con l'errore sotto, finché non si
 *   corregge o non si annulla.
 * - La data è un campo nativo `<input type="date">`, non il calendario.
 * - Le colonne numeriche e di valuta formattano da sé la vista con l'item
 *   `numeri`, quindi col separatore delle migliaia sempre scritto
 *   (`2.086,93 €`), allineate a destra e con le cifre tabellari; in modifica
 *   tornano a un numero semplice: si scrive `12.5`, non `12,50 €`. In una
 *   cella scritta a mano, i numeri si formattano con le stesse funzioni,
 *   `intero()`, `decimale()`, `valuta()`.
 *
 * **Tastiera e accessibilità.** La tabella dichiara `role="grid"` ed è un
 * solo fermo di tabulazione: `Tab` entra sulla cella attiva — la prima,
 * all'inizio — e il `Tab` seguente esce dalla griglia. Le frecce spostano la
 * cella attiva, con
 * `Maiusc` estendono la selezione; `Home` e `Fine` vanno al principio e alla
 * fine della riga. `Invio`, `F2` o un carattere qualsiasi aprono la modifica;
 * in modifica `Invio` conferma e scende, `Tab` conferma e passa accanto, `Esc`
 * annulla. `Canc` e `Backspace` svuotano la selezione. Con `Ctrl` o `⌘`: `C`,
 * `X` e `V` copiano, tagliano e incollano come testo separato da tabulazioni,
 * quindi anche da e verso un foglio di calcolo; `Z` annulla, `Maiusc`+`Z` o `Y`
 * ripete, `A` seleziona tutto, `Invio` riempie la selezione col valore della
 * cella in alto a sinistra. La casella si spunta con `Spazio` o `Invio`.
 */
const meta: Meta = {
  title: 'Blocchi/Data Grid',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

/**
 * Sessanta voci con sole colonne di testo: la navigazione, la modifica, copia
 * e incolla, annulla e ripeti, la maniglia di riempimento.
 */
export const Editabile: Story = {
  render: () => <ComputoFinto />,
}

/* ────────────────────────────────────────────────────────────────────────
 * Celle tipizzate — sessione 2 di 3
 * ──────────────────────────────────────────────────────────────────────── */

type VoceTipizzata = {
  id: string
  codice: string
  descrizione: string
  unita: string
  quantita: string
  prezzo: string
  disponibile: string
  scadenza: string
}

const UNITA_OPZIONI = [
  { valore: 'm2', etichetta: 'm²' },
  { valore: 'm3', etichetta: 'm³' },
  { valore: 'kg', etichetta: 'kg' },
  { valore: 'pz', etichetta: 'pz' },
]

function generaVociTipizzate(quante: number): VoceTipizzata[] {
  const caso = seminato(20260917)
  const scegli = <T,>(v: T[]): T => v[Math.floor(caso() * v.length)]
  return Array.from({ length: quante }, (_, i) => ({
    id: `voce-t-${i}`,
    codice: `V${String(i + 1).padStart(3, '0')}`,
    descrizione: scegli(DESCRIZIONI),
    unita: scegli(UNITA_OPZIONI).valore,
    quantita: (10 + Math.floor(caso() * 490)).toString(),
    prezzo: (5 + caso() * 95).toFixed(2),
    disponibile: caso() > 0.3 ? 'true' : 'false',
    scadenza: `2026-${String(1 + Math.floor(caso() * 12)).padStart(2, '0')}-${String(1 + Math.floor(caso() * 27)).padStart(2, '0')}`,
  }))
}

const VOCI_TIPIZZATE = generaVociTipizzate(60)

const colT = creaColonne<VoceTipizzata>()
const COLONNE_TIPIZZATE = colT.columns([
  colonnaTestoGriglia(colT, 'codice', 'Codice', {
    size: 90,
    validazione: validaConZod(z.string().min(1, 'Il codice non può essere vuoto')),
  }),
  colonnaTestoGriglia(colT, 'descrizione', 'Descrizione', { size: 280 }),
  colonnaSelectGriglia(colT, 'unita', 'U.M.', UNITA_OPZIONI, { size: 90 }),
  colonnaNumeroGriglia(colT, 'quantita', 'Quantità', {
    size: 100,
    validazione: validaConZod(z.coerce.number('Dev\'essere un numero').min(0, 'Non può essere negativa')),
  }),
  colonnaValutaGriglia(colT, 'prezzo', 'Prezzo unitario', {
    size: 130,
    validazione: validaConZod(z.coerce.number('Dev\'essere un numero').positive('Dev\'essere maggiore di zero')),
  }),
  colonnaCheckboxGriglia(colT, 'disponibile', 'Disp.', { size: 70 }),
  colonnaDataGriglia(colT, 'scadenza', 'Scadenza', { size: 130 }),
])

function ComputoTipizzato() {
  const motore = useDataGrid<VoceTipizzata>({
    righeIniziali: VOCI_TIPIZZATE,
    colonneId: ['codice', 'descrizione', 'unita', 'quantita', 'prezzo', 'disponibile', 'scadenza'],
    idRiga: (v) => v.id,
    leggiCella: (v, c) => String(v[c as keyof VoceTipizzata] ?? ''),
    scriviCella: (v, c, valore) => ({ ...v, [c]: valore }),
  })

  return (
    <div className="flex h-140 flex-col">
      <DataGrid
        motore={motore}
        colonne={COLONNE_TIPIZZATE}
        nomeRighe={{ singolare: 'voce', plurale: 'voci' }}
        className="min-h-0 flex-1"
        barra={
          <div className="flex gap-2">
            <DataGridUndo />
            <DataGridRedo />
          </div>
        }
      >
        <DataGridClipboard />
        <DataGridFillHandle />
      </DataGrid>
    </div>
  )
}

/**
 * Le sei celle tipizzate. «Quantità» e «Prezzo unitario» rifiutano un valore
 * non valido e restano in modifica; «Disp.» si spunta con un clic o con
 * `Spazio`; «U.M.» apre un `select`; «Scadenza» è un campo data nativo.
 */
export const CelleTipizzate: Story = {
  render: () => <ComputoTipizzato />,
}

/* ────────────────────────────────────────────────────────────────────────
 * Computo — sessione 3 di 3: persistenza e prova end-to-end
 *
 * Il criterio di accettazione di `PIANO.md` per M3bis.5 si verifica qui per
 * intero: ~500 righe finte, editing, incolla, annulla/ripeti, celle
 * numeriche/valuta/select di un computo — più `useGridChanges` per la
 * persistenza, con "Aggiungi riga"/elimina riga a esercitare creazione e
 * cancellazione, non solo modifica.
 * ──────────────────────────────────────────────────────────────────────── */

type VoceComputo = {
  id: string
  codice: string
  descrizione: string
  unita: string
  quantita: string
  prezzoUnitario: string
}

const UNITA_COMPUTO = [
  { valore: 'm2', etichetta: 'm²' },
  { valore: 'm3', etichetta: 'm³' },
  { valore: 'kg', etichetta: 'kg' },
  { valore: 'pz', etichetta: 'pz' },
  { valore: 'ml', etichetta: 'ml' },
]

const VOCI_COMPUTO_DESCRIZIONI = [
  'Scavo a sezione obbligata',
  'Intonaco deumidificante, applicazione a mano',
  'Rasante ai silicati, finitura civile',
  'Massetto alleggerito, spessore 6 cm',
  'Consolidante per murature in pietra',
  'Malta da muratura, giunti sottili',
  'Pittura minerale traspirante',
  'Adesivo cementizio C2TE',
  'Rinzaffo grezzo di aggrappo',
  'Impermeabilizzazione cementizia bicomponente',
  'Fondo aggrappante silossanico',
  'Stuccatura giunti con malta premiscelata',
]

function generaVociComputo(quante: number): VoceComputo[] {
  const caso = seminato(20260918)
  const scegli = <T,>(v: T[]): T => v[Math.floor(caso() * v.length)]
  return Array.from({ length: quante }, (_, i) => ({
    id: `computo-${i}`,
    codice: `C${String(i + 1).padStart(4, '0')}`,
    descrizione: scegli(VOCI_COMPUTO_DESCRIZIONI),
    unita: scegli(UNITA_COMPUTO).valore,
    quantita: (1 + caso() * 200).toFixed(2),
    prezzoUnitario: (3 + caso() * 80).toFixed(2),
  }))
}

const VOCI_COMPUTO = generaVociComputo(500)

/**
 * La sola colonna che non passa da `colonnaXGriglia`: un bottone «elimina»
 * per riga, non editabile e fuori da `colonneId` — la freccia non ci si
 * ferma mai, `Tab` sì (è un bottone vero, nell'ordine naturale del
 * documento). Usa `useContestoDataGrid` per arrivare al motore: la stessa
 * via che usano `CellaTestoGriglia` e le altre, non un accesso privato.
 */
function CellaEliminaComputo({ riga }: { riga: VoceComputo }) {
  const { motore } = useContestoDataGrid<VoceComputo>()
  return (
    // `flex ml-auto`, non solo `-my-1`: il bottone è `inline-flex` di suo
    // (v. `ui/button.tsx`), e un `margin-left: auto` non allinea a destra
    // un elemento inline — deve diventare lui stesso un box di blocco
    // (`flex`) perché lo spazio in più della colonna vada a sinistra, non a
    // destra. Lo stesso pattern già usato per il menu «azioni» di
    // `data-table.stories.tsx`.
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="-my-1 ml-auto flex"
      aria-label={`Elimina ${riga.codice || 'la riga'}`}
      onClick={() => motore.rimuoviRighe([riga.id])}
    >
      <Trash2Icon aria-hidden />
    </Button>
  )
}

const colC = creaColonne<VoceComputo>()
const COLONNE_COMPUTO = colC.columns([
  colonnaTestoGriglia(colC, 'codice', 'Codice', {
    size: 96,
    validazione: validaConZod(z.string().min(1, 'Il codice non può essere vuoto')),
  }),
  colonnaTestoGriglia(colC, 'descrizione', 'Descrizione', { size: 420 }),
  colonnaSelectGriglia(colC, 'unita', 'U.M.', UNITA_COMPUTO, { size: 72 }),
  colonnaNumeroGriglia(colC, 'quantita', 'Quantità', {
    size: 96,
    validazione: validaConZod(z.coerce.number('Dev\'essere un numero').positive('Dev\'essere maggiore di zero')),
  }),
  colonnaValutaGriglia(colC, 'prezzoUnitario', 'Prezzo unitario', {
    size: 112,
    validazione: validaConZod(z.coerce.number('Dev\'essere un numero').positive('Dev\'essere maggiore di zero')),
  }),
  colC.display({
    id: 'azioni',
    size: 48,
    // Non ridimensionabile: 48px basta appena al bottone, una maniglia lì
    // non avrebbe niente da restringere prima di sparire.
    enableResizing: false,
    header: () => <span className="sr-only">Azioni</span>,
    cell: ({ row }) => <CellaEliminaComputo riga={row.original} />,
  }),
])

function ComputoEndToEnd() {
  const motore = useDataGrid<VoceComputo>({
    righeIniziali: VOCI_COMPUTO,
    colonneId: ['codice', 'descrizione', 'unita', 'quantita', 'prezzoUnitario'],
    idRiga: (v) => v.id,
    leggiCella: (v, c) => String(v[c as keyof VoceComputo] ?? ''),
    scriviCella: (v, c, valore) => ({ ...v, [c]: valore }),
  })

  // Simula "l'ultimo salvataggio" — ciò a cui `useGridChanges` confronta lo
  // stato corrente. Una pagina vera lo aggiornerebbe dopo una chiamata di
  // rete riuscita; qui il bottone "Salva" lo fa subito, per provare il
  // giro intero senza un server.
  const [righeSalvate, setRigheSalvate] = React.useState(VOCI_COMPUTO)
  const changeSet = useGridChanges(motore.righe, righeSalvate, (v) => v.id)

  const contatoreNuove = React.useRef(0)
  const aggiungiRiga = () => {
    contatoreNuove.current += 1
    motore.aggiungiRiga({
      id: `computo-nuova-${contatoreNuove.current}`,
      codice: '',
      descrizione: '',
      unita: UNITA_COMPUTO[0]!.valore,
      quantita: '0',
      prezzoUnitario: '0',
    })
  }

  return (
    <div className="flex h-140 flex-col">
      <DataGrid
        motore={motore}
        colonne={COLONNE_COMPUTO}
        nomeRighe={{ singolare: 'voce', plurale: 'voci' }}
        className="min-h-0 flex-1"
        // Fa leggere a TanStack le `size` già dichiarate su ogni colonna
        // (M3bis.3, già pronta): senza, `table-fixed` spartisce lo spazio
        // in parti uguali e ogni colonna prende la stessa larghezza,
        // qualunque contenuto abbia — rilievo di Francesco, il cestino
        // «elimina» galleggiava lontano dal bordo destro.
        ridimensionabile
        barra={
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <DataGridUndo />
            <DataGridRedo />
            <Button type="button" variant="outline" size="sm" onClick={aggiungiRiga}>
              <PlusIcon aria-hidden />
              Aggiungi riga
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant={changeSet.creati.length > 0 ? 'default' : 'secondary'}>
                {changeSet.creati.length} creat{changeSet.creati.length === 1 ? 'a' : 'e'}
              </Badge>
              <Badge variant={changeSet.aggiornati.length > 0 ? 'default' : 'secondary'}>
                {changeSet.aggiornati.length} modificat
                {changeSet.aggiornati.length === 1 ? 'a' : 'e'}
              </Badge>
              <Badge variant={changeSet.cancellati.length > 0 ? 'destructive' : 'secondary'}>
                {changeSet.cancellati.length} cancellat
                {changeSet.cancellati.length === 1 ? 'a' : 'e'}
              </Badge>
              <Button
                type="button"
                size="sm"
                disabled={!changeSet.cePendente}
                onClick={() => setRigheSalvate(motore.righe)}
              >
                Salva
              </Button>
            </div>
          </div>
        }
      >
        <DataGridClipboard />
        <DataGridFillHandle />
      </DataGrid>
    </div>
  )
}

/**
 * Cinquecento voci, con righe da aggiungere ed eliminare e i conteggi del
 * salvataggio in cima: quante righe nuove, modificate e cancellate rispetto
 * all'ultimo «Salva».
 */
export const Computo: Story = {
  render: () => <ComputoEndToEnd />,
}
