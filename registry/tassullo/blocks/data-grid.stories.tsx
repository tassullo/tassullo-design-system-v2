import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import * as React from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'
import * as z from 'zod'

import {
  DataGrid,
  DataGridClipboard,
  DataGridFillHandle,
  DataGridRedo,
  DataGridUndo,
  colonnaAzioneGriglia,
  colonnaCheckboxGriglia,
  colonnaDataGriglia,
  colonnaNumeroGriglia,
  colonnaSelectGriglia,
  colonnaTestoGriglia,
  colonnaValutaGriglia,
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

// Prova: il fondo della selezione compare solo quando la griglia ha il fuoco.
// All'apertura la cella attiva c'è (è il punto d'ingresso del Tab) ma non ha
// ancora il segno; entrati con Tab la prima cella lo prende, Maiusc+Freccia
// allarga il rettangolo e un clic sceglie un'altra cella, come prima.
function celleConFondo(radice: HTMLElement) {
  return [...radice.querySelectorAll<HTMLElement>('[data-riga-id][data-colonna-id]')].filter(
    (cella) => getComputedStyle(cella).backgroundColor !== 'rgba(0, 0, 0, 0)'
  )
}

async function selezioneSoloColFuoco({ canvasElement }: { canvasElement: HTMLElement }) {
  const griglia = await waitFor(() => {
    const trovata = canvasElement.querySelector<HTMLElement>('[role="grid"]')
    expect(trovata?.querySelector('[data-attiva]')).toBeTruthy()
    return trovata!
  })
  expect(celleConFondo(griglia)).toHaveLength(0)

  for (let passi = 0; passi < 10 && !griglia.contains(document.activeElement); passi++) {
    await userEvent.tab()
  }
  const prima = griglia.querySelector<HTMLElement>('[data-attiva]')!
  expect(document.activeElement).toBe(prima)
  await waitFor(() => expect(celleConFondo(griglia)).toEqual([prima]))

  await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}')
  await waitFor(() => expect(celleConFondo(griglia)).toHaveLength(2))

  const altra = griglia.querySelector<HTMLElement>('[data-riga-id="voce-2"][data-colonna-id="descrizione"]')!
  await userEvent.click(altra)
  await waitFor(() => expect(celleConFondo(griglia)).toEqual([altra]))
}

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
 *   `colonneAzioneId`, `idRiga`, `leggiCella`, `scriviCella` e `onModifica`.
 *   `colonneId` elenca le colonne modificabili nell'ordine in cui le
 *   percorrono le frecce, `Tab` in modifica e l'incolla; `leggiCella` e
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
 * - Un comando di riga — il cestino — è una colonna `colonnaAzioneGriglia`,
 *   con `icona`, `etichetta` (il nome del bottone, riga per riga) e
 *   `onAzione`, che riceve la riga e il motore. Il suo `id` va anche in
 *   `colonneAzioneId` di `useDataGrid`. È una cella della griglia: si
 *   raggiunge con le frecce dalla riga su cui si lavora, e copia, incolla,
 *   riempimento e selezione la saltano.
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
 * - La cella attiva ha sempre il suo bordo, anche dopo un clic. Quando il
 *   fuoco lascia la griglia — per «Salva», un filtro, un bottone della barra —
 *   il bordo si attenua e la riga intera prende un fondo tenue: resta chiaro
 *   su quale riga si stava lavorando. Un comando fuori dalla griglia che
 *   agisce sulla riga attiva si legge così. Il `Tab` segue l'ordine della
 *   pagina: arriva alla griglia dopo i controlli che la precedono, come la
 *   barra, ed entra sulla cella attiva: la prima, o quella su cui si stava
 *   lavorando. Su una pagina appena aperta nessuna cella è segnata: bordo e
 *   fondo compaiono dal primo ingresso nella griglia, col `Tab` o col
 *   puntatore.
 * - La data si scrive `gg/mm/aaaa`, come si legge; in modifica `↓` o il
 *   bottone nel campo aprono il calendario, e un giorno scelto conferma
 *   subito. Se la cella scorre sotto la testata o oltre il fondo del
 *   riquadro, il calendario si chiude e il fuoco torna al campo: `↓` lo
 *   riapre.
 * - Le colonne numeriche e di valuta formattano da sé la vista con l'item
 *   `numeri`, quindi col separatore delle migliaia sempre scritto
 *   (`2.086,93 €`), allineate a destra e con le cifre tabellari. In modifica
 *   si scrive con la virgola, come si legge — `12,5` — senza migliaia, e il
 *   simbolo dell'euro resta accanto al campo; il punto vale come separatore
 *   delle migliaia se raggruppa tre cifre (`1.234`), altrimenti come
 *   decimale. Copia e incolla usano la virgola, quindi un foglio di calcolo
 *   in italiano li legge com'è. Il dato resta un numero col punto. In una
 *   cella scritta a mano, i numeri si formattano con le stesse funzioni,
 *   `intero()`, `decimale()`, `valuta()`.
 *
 * **Tastiera e accessibilità.** La tabella dichiara `role="grid"` ed è un
 * solo fermo di tabulazione: `Tab` entra sulla cella attiva — la prima,
 * all'inizio — e il `Tab` seguente esce dalla griglia. Le frecce spostano la
 * cella attiva, con `Maiusc` estendono la selezione; `Home` e `Fine` vanno al
 * principio e alla fine della riga. `Invio`, `F2` o un carattere qualsiasi
 * aprono la modifica; col puntatore, il primo clic sceglie la cella e il
 * secondo la apre, come il doppio clic. In modifica `Invio` conferma e scende, `Tab` conferma e passa accanto, `Esc`
 * annulla. `Canc` e `Backspace` svuotano la selezione. Con `Ctrl` o `⌘`: `C`,
 * `X` e `V` copiano, tagliano e incollano come testo separato da tabulazioni,
 * quindi anche da e verso un foglio di calcolo; `Z` annulla, `Maiusc`+`Z` o `Y`
 * ripete, `A` seleziona tutto, `Invio` riempie la selezione col valore della
 * cella in alto a sinistra. `Alt` con `←` o `→` restringe o allarga di 16px
 * la colonna della cella attiva: le maniglie sul bordo delle intestazioni si
 * trascinano col puntatore, ma non sono fermi di `Tab`. La casella si spunta
 * con `Spazio` o `Invio`.
 * Sulla cella di comando `Invio` o `Spazio` premono il bottone; dopo
 * un'eliminazione il fuoco passa alla stessa cella della riga seguente.
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

// Scena di misura di «Editabile»: la stessa resa, con la prova. `!dev` la
// toglie dalla barra e da Docs, così la scena qui sopra si apre a riposo;
// il controllo automatico la esegue lo stesso.
export const EditabileProva: Story = {
  ...Editabile,
  name: 'Editabile, prova',
  tags: ['!dev', '!autodocs'],
  play: selezioneSoloColFuoco,
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

// Prova: il riquadro della cella scelta resta intero dove la tabella lo
// taglierebbe. La cella con la casella di spunta non sborda a destra (la
// tabella toglie il margine destro alle celle con una casella, e il
// riquadro, che brucia quel margine, usciva di 8px sotto la colonna accanto).
// Scendendo con le frecce la cella resta staccata dal fondo, dove l'angolo
// arrotondato ne tagliava il bordo; risalendo non finisce sotto
// l'intestazione ferma.
async function riquadroIntero({ canvasElement }: { canvasElement: HTMLElement }) {
  const griglia = await waitFor(() => {
    const trovata = canvasElement.querySelector<HTMLElement>('[role="grid"]')
    expect(trovata?.querySelector('[data-attiva]')).toBeTruthy()
    return trovata!
  })
  const contenitore = canvasElement.querySelector<HTMLElement>('[data-slot="table-container"]')!
  const testata = contenitore.querySelector('thead')!

  const spunta = griglia.querySelector<HTMLElement>('[data-riga-id][data-colonna-id="disponibile"]')!
  const bordo = spunta.getBoundingClientRect().right - spunta.closest('td')!.getBoundingClientRect().right
  expect(bordo).toBeLessThanOrEqual(0.5)

  await userEvent.click(griglia.querySelector<HTMLElement>('[data-riga-id][data-colonna-id="descrizione"]')!)
  const attiva = () => document.activeElement!.getBoundingClientRect()
  for (let passo = 0; passo < 20; passo++) {
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() =>
      expect(contenitore.getBoundingClientRect().bottom - attiva().bottom).toBeGreaterThanOrEqual(4)
    )
  }
  for (let passo = 0; passo < 20; passo++) {
    await userEvent.keyboard('{ArrowUp}')
    await waitFor(() =>
      expect(attiva().top - testata.getBoundingClientRect().bottom).toBeGreaterThanOrEqual(-1)
    )
  }
}

/**
 * Le sei celle tipizzate. «Quantità» e «Prezzo unitario» rifiutano un valore
 * non valido e restano in modifica; «Disp.» si spunta con un clic o con
 * `Spazio`; «U.M.» apre un `select`; «Scadenza» si scrive `gg/mm/aaaa`, e in
 * modifica `↓` o il bottone nel campo aprono il calendario.
 */
export const CelleTipizzate: Story = {
  render: () => <ComputoTipizzato />,
}

// Scena di misura di «Celle Tipizzate»: la stessa resa, con la prova. `!dev` la
// toglie dalla barra e da Docs, così la scena qui sopra si apre a riposo;
// il controllo automatico la esegue lo stesso.
export const CelleTipizzateProva: Story = {
  ...CelleTipizzate,
  name: 'Celle Tipizzate, prova',
  tags: ['!dev', '!autodocs'],
  play: riquadroIntero,
}

// Prova: la data si scrive come le altre celle, e il calendario è la seconda
// strada. `Invio` apre il campo; `25/12/2026` più `Invio` scrive; `↓` apre il
// calendario col fuoco su un giorno, `Esc` torna al campo; un testo che non è
// una data resta in modifica con l'errore. La scena finisce lì, col testo in
// errore a schermo, perché il controllo di accessibilità, che misura dopo la
// prova, ne misuri il contrasto.
async function dataScrittaECalendario({ canvasElement }: { canvasElement: HTMLElement }) {
  const cella = (riga: string) =>
    canvasElement.querySelector<HTMLElement>(`[data-riga-id="${riga}"][data-colonna-id="scadenza"]`)
  const campo = () => canvasElement.querySelector<HTMLInputElement>('input[aria-label="scadenza"]')
  await waitFor(() => expect(cella('voce-t-0')).toBeTruthy())

  await userEvent.click(cella('voce-t-0')!)
  await userEvent.keyboard('{Enter}')
  await waitFor(() => expect(document.activeElement).toBe(campo()))
  await userEvent.clear(campo()!)
  await userEvent.type(campo()!, '25/12/2026')
  await userEvent.keyboard('{Enter}')
  await waitFor(() => expect(cella('voce-t-0')?.textContent).toBe('25/12/2026'))

  await waitFor(() => expect(document.activeElement).toBe(cella('voce-t-1')))
  await userEvent.keyboard('{Enter}')
  await waitFor(() => expect(document.activeElement).toBe(campo()))
  await userEvent.keyboard('{ArrowDown}')
  await waitFor(() => {
    expect(document.querySelector('[data-slot="popover-content"][aria-label="Scegli la data"]')).toBeTruthy()
    expect(document.activeElement?.hasAttribute('data-day')).toBe(true)
  })
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(document.activeElement).toBe(campo()))

  await userEvent.clear(campo()!)
  await userEvent.type(campo()!, '31/02/2026')
  await userEvent.keyboard('{Enter}')
  await waitFor(() => {
    expect(campo()?.getAttribute('aria-invalid')).toBe('true')
    expect(canvasElement.querySelector('[role="alert"]')?.textContent).toBe(
      'Data non valida: si scrive gg/mm/aaaa'
    )
  })
}

// Scena di misura della data di «Celle Tipizzate»: nascosta come quella sopra.
export const CelleTipizzateDataProva: Story = {
  ...CelleTipizzate,
  name: 'Celle Tipizzate, data, prova',
  tags: ['!dev', '!autodocs'],
  play: dataScrittaECalendario,
}

// Prova: il calendario di una cella si chiude quando la cella scorre sotto la
// testata ferma, invece di restare sopra la testata o staccato dalla cella.
// Aperto con `Invio` e `↓` sulla quarta riga, uno scorrimento di 180px porta la
// cella sotto la testata: il calendario è chiuso, il fuoco è tornato al campo
// della data senza far scorrere il riquadro, e `↓` lo riapre.
async function calendarioSiChiudeScorrendo({ canvasElement }: { canvasElement: HTMLElement }) {
  const cella = () =>
    canvasElement.querySelector<HTMLElement>('[data-riga-id="voce-t-3"][data-colonna-id="scadenza"]')
  const campo = () => canvasElement.querySelector<HTMLInputElement>('input[aria-label="scadenza"]')
  const calendario = () =>
    document.querySelector('[data-slot="popover-content"][aria-label="Scegli la data"]')
  await waitFor(() => expect(cella()).toBeTruthy())
  const contenitore = canvasElement.querySelector<HTMLElement>('[data-slot="table-container"]')!

  await userEvent.click(cella()!)
  await userEvent.keyboard('{Enter}')
  await waitFor(() => expect(document.activeElement).toBe(campo()))
  await userEvent.keyboard('{ArrowDown}')
  await waitFor(() => {
    expect(calendario()).toBeTruthy()
    expect(document.activeElement?.hasAttribute('data-day')).toBe(true)
  })

  const partenza = contenitore.scrollTop
  contenitore.scrollTop = partenza + 180
  await waitFor(() => {
    expect(calendario()).toBeNull()
    expect(document.activeElement).toBe(campo())
  })
  expect(contenitore.scrollTop).toBe(partenza + 180)

  contenitore.scrollTop = partenza
  await userEvent.keyboard('{ArrowDown}')
  await waitFor(() => expect(calendario()).toBeTruthy())
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(document.activeElement).toBe(campo()))
}

// Scena di misura del calendario che scorre: nascosta come quelle sopra.
export const CelleTipizzateCalendarioProva: Story = {
  ...CelleTipizzate,
  name: 'Celle Tipizzate, calendario, prova',
  tags: ['!dev', '!autodocs'],
  play: calendarioSiChiudeScorrendo,
}

/* ────────────────────────────────────────────────────────────────────────
 * Colonne miste — alcune si leggono, altre si scrivono
 * ──────────────────────────────────────────────────────────────────────── */

type Materiale = {
  id: string
  codice: string
  descrizione: string
  gruppo: string
  finitura: string
  quantita: string
  prezzo: string
  unita: string
  disponibile: string
  prova: string
}

const MATERIALI: Materiale[] = [
  ['MAL-01', 'Malta bastarda M5', 'Malte', 'Rasato', '120', '14.5', 'kg', 'true', '2026-03-12'],
  ['INT-02', 'Intonaco di fondo', 'Intonaci', 'Lisciato', '48', '22.1', 'm2', 'false', '2026-04-02'],
  ['ADS-03', 'Adesivo cementizio C2', 'Adesivi', '', '', '9.8', 'kg', 'true', ''],
  ['RAS-04', 'Rasante fibrorinforzato', 'Rasanti', 'Frattazzato', '300', '31.4', 'pz', 'true', '2026-05-20'],
  ['MAL-05', 'Malta da muratura M10', 'Malte', 'Grezzo', '75', '12', 'kg', 'false', '2026-01-08'],
].map((r, i) => ({
  id: `materiale-${i}`,
  codice: r[0]!,
  descrizione: r[1]!,
  gruppo: r[2]!,
  finitura: r[3]!,
  quantita: r[4]!,
  prezzo: r[5]!,
  unita: r[6]!,
  disponibile: r[7]!,
  prova: r[8]!,
}))

const colM = creaColonne<Materiale>()
const COLONNE_MISTE = colM.columns([
  colM.accessor('codice', { header: 'Codice', meta: { titolo: 'Codice' }, size: 90 }),
  colM.accessor('descrizione', { header: 'Descrizione', meta: { titolo: 'Descrizione' }, size: 200 }),
  colonnaTestoGriglia(colM, 'finitura', 'Finitura', { size: 110 }),
  colM.accessor('gruppo', { header: 'Gruppo', meta: { titolo: 'Gruppo' }, size: 90 }),
  colonnaNumeroGriglia(colM, 'quantita', 'Quantità', { size: 90 }),
  colonnaValutaGriglia(colM, 'prezzo', 'Prezzo', { size: 100 }),
  colonnaSelectGriglia(colM, 'unita', 'U.M.', UNITA_OPZIONI, { size: 80 }),
  colonnaCheckboxGriglia(colM, 'disponibile', 'Disp.', { size: 64 }),
  colonnaDataGriglia(colM, 'prova', 'Prova del', { size: 130 }),
])

function GrigliaColonneMiste() {
  const motore = useDataGrid<Materiale>({
    righeIniziali: MATERIALI,
    colonneId: ['finitura', 'quantita', 'prezzo', 'unita', 'disponibile', 'prova'],
    idRiga: (m) => m.id,
    leggiCella: (m, c) => String(m[c as keyof Materiale] ?? ''),
    scriviCella: (m, c, valore) => ({ ...m, [c]: valore }),
  })
  return (
    <div className="flex h-100 flex-col">
      <DataGrid
        motore={motore}
        colonne={COLONNE_MISTE}
        nomeRighe={{ singolare: 'materiale', plurale: 'materiali' }}
        className="min-h-0 flex-1"
        ridimensionabile
      >
        <DataGridClipboard />
      </DataGrid>
    </div>
  )
}

// Prova, in densità touch dove lo scarto era più grande: il testo delle celle
// che si scrivono sta sulla stessa riga di quello delle celle che si leggono
// (prima era 5px più in alto), e aprendo la modifica non si sposta né cambia
// l'altezza della riga.
function fondoDelTesto(nodo: Element): DOMRect | null {
  const giro = document.createTreeWalker(nodo, NodeFilter.SHOW_TEXT)
  for (let t = giro.nextNode(); t; t = giro.nextNode()) {
    if (!t.textContent?.trim()) continue
    const intervallo = document.createRange()
    intervallo.selectNodeContents(t)
    return intervallo.getBoundingClientRect()
  }
  return null
}

async function testoInLinea({ canvasElement }: { canvasElement: HTMLElement }) {
  const griglia = await waitFor(() => {
    const trovata = canvasElement.querySelector<HTMLElement>('[role="grid"]')
    expect(trovata?.querySelector('[data-colonna-id="finitura"]')).toBeTruthy()
    return trovata!
  })
  expect(getComputedStyle(document.documentElement).getPropertyValue('--spacing').trim()).toBe('0.375rem')
  const riga = griglia.querySelector<HTMLElement>('tbody tr:has([data-riga-id="materiale-1"])')!
  const letta = fondoDelTesto(riga.querySelector('td')!)!
  for (const colonna of ['finitura', 'quantita', 'prezzo', 'unita', 'prova']) {
    const scritta = fondoDelTesto(riga.querySelector(`[data-colonna-id="${colonna}"]`)!)!
    expect(Math.abs(scritta.bottom - letta.bottom), colonna).toBeLessThan(0.5)
  }

  const altezze = () => [...griglia.querySelectorAll('tbody tr')].map((tr) => tr.getBoundingClientRect().height)
  const prima = altezze()
  // Misurato dal bordo della riga: il clic può far scorrere la pagina.
  const centro = (r: DOMRect) => (r.top + r.bottom) / 2 - riga.getBoundingClientRect().top

  const finitura = riga.querySelector<HTMLElement>('[data-colonna-id="finitura"]')!
  // Il testo della vista sta a metà del suo riquadro; il campo deve stare a
  // metà dello stesso riquadro.
  const vistaFinitura = centro(finitura.getBoundingClientRect())
  await userEvent.click(finitura)
  await userEvent.keyboard('{Enter}')
  const campo = await waitFor(() => {
    const trovato = riga.querySelector<HTMLInputElement>('input[aria-label="finitura"]')
    expect(trovato, 'campo della finitura').toBeTruthy()
    return trovato!
  })
  expect(Math.abs(centro(campo.getBoundingClientRect()) - vistaFinitura)).toBeLessThan(0.5)
  expect(altezze()).toEqual(prima)
  await userEvent.keyboard('{Escape}')

  const unita = await waitFor(() => {
    const trovata = riga.querySelector<HTMLElement>('[data-colonna-id="unita"]')
    expect(trovata, 'cella dell’unità').toBeTruthy()
    return trovata!
  })
  const testoUnita = centro(fondoDelTesto(unita)!)
  await userEvent.click(unita)
  await userEvent.keyboard('{Enter}')
  const valore = await waitFor(() => {
    const trovato = riga.querySelector('[data-slot="select-value"]')
    expect(trovato, 'tendina dell’unità').toBeTruthy()
    return trovato!
  })
  expect(Math.abs(centro(fondoDelTesto(valore)!) - testoUnita)).toBeLessThan(0.5)
  expect(altezze()).toEqual(prima)
  await userEvent.keyboard('{Escape}')
}

/**
 * Una griglia in cui solo alcune colonne si scrivono: codice, descrizione e
 * gruppo si leggono, le altre si compilano. Le colonne che si leggono sono
 * colonne normali della tabella, scritte con `creaColonne()`: le frecce le
 * saltano, e copia, incolla e riempimento non le toccano. Il testo sta sulla
 * stessa riga in tutte le celle, che si scrivano o no.
 */
export const ColonneMiste: Story = {
  render: () => <GrigliaColonneMiste />,
}

// Scena di misura di «Colonne Miste», in densità touch.
export const ColonneMisteProva: Story = {
  ...ColonneMiste,
  name: 'Colonne Miste, prova',
  tags: ['!dev', '!autodocs'],
  globals: { density: 'touch' },
  play: testoInLinea,
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
  // Il cestino è una cella della griglia: le frecce ci arrivano dalla riga
  // su cui si lavora, `Invio` lo preme, `Tab` non ci si ferma. L'`id` va
  // anche in `colonneAzioneId`, sotto.
  colonnaAzioneGriglia(colC, 'azioni', 'Azioni', {
    icona: <Trash2Icon aria-hidden />,
    etichetta: (v) => `Elimina ${v.codice || 'la riga'}`,
    onAzione: (v, motore) => motore.rimuoviRighe([v.id]),
  }),
])

function ComputoEndToEnd() {
  const motore = useDataGrid<VoceComputo>({
    righeIniziali: VOCI_COMPUTO,
    colonneId: ['codice', 'descrizione', 'unita', 'quantita', 'prezzoUnitario'],
    colonneAzioneId: ['azioni'],
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
 * all'ultimo «Salva». Il cestino in fondo a ogni riga si raggiunge con `→`
 * dall'ultima colonna, e `Invio` elimina la riga.
 */
export const Computo: Story = {
  render: () => <ComputoEndToEnd />,
}
