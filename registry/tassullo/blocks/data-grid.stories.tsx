import type { Meta, StoryObj } from '@storybook/react-vite'
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
  useDataGrid,
  validaConZod,
} from '@/registry/tassullo/blocks/data-grid'
import { creaColonne } from '@/registry/tassullo/blocks/data-table'

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
    <DataGrid
      motore={motore}
      colonne={COLONNE_GRIGLIA}
      nomeRighe={{ singolare: 'voce', plurale: 'voci' }}
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
  )
}

const meta: Meta = {
  title: 'Blocchi/Data Grid',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

/**
 * Il motore su un elenco piatto di 60 voci — sessione 1 di 3 (M3bis.5): solo
 * `CellaTestoGriglia`, niente celle tipizzate/Zod (sessione 2) né
 * `useGridChanges` (sessione 3). Prova da tastiera: frecce spostano la cella
 * attiva, Invio/F2 apre la modifica (o un carattere qualunque, che la apre
 * scrivendolo), Escape annulla, Tab conferma e passa alla cella accanto.
 * Ctrl/Cmd+C copia la selezione come TSV, Ctrl/Cmd+V la incolla, Ctrl/Cmd+Z
 * e Ctrl/Cmd+Shift+Z annullano/ripetono, Ctrl/Cmd+Invio riempie la
 * selezione col valore della cella in alto a sinistra.
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
    <DataGrid
      motore={motore}
      colonne={COLONNE_TIPIZZATE}
      nomeRighe={{ singolare: 'voce', plurale: 'voci' }}
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
  )
}

/**
 * Sessione 2 di 3: le sei celle tipizzate. `Quantità` e `Prezzo unitario`
 * validano con `validaConZod` (`z.coerce.number()`, negativo/zero
 * rifiutati) — scrivere un valore non valido e premere Invio o Tab non
 * chiude la modifica: l'anello rosso resta finché non si corregge, Escape
 * annulla comunque. `Disp.` si spunta con un clic o Spazio/Invio da
 * tastiera, senza un passo di modifica intermedio. `U.M.` apre il `Select`
 * del registry, non un elenco a parte. `Scadenza` usa `<input type="date">`
 * nativo — non il `Calendar` del registry, v. il commento in testa a
 * `data-grid.tsx` sul perché.
 */
export const CelleTipizzate: Story = {
  render: () => <ComputoTipizzato />,
}
