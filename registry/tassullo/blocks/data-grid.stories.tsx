import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  DataGrid,
  DataGridClipboard,
  DataGridFillHandle,
  DataGridRedo,
  DataGridUndo,
  colonnaTestoGriglia,
  useDataGrid,
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
