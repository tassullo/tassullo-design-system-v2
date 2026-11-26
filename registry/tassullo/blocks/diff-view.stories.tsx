import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

import { DiffView } from '@/registry/tassullo/blocks/diff-view'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/registry/tassullo/ui/table'

/**
 * Il confronto fra due versioni di un testo, parola per parola: cosa è stato
 * tolto e cosa aggiunto.
 *
 * **Quando sì, quando no.** Si usa per mostrare cosa cambia fra due revisioni
 * di un documento: la scheda tecnica di oggi contro quella di ieri, un testo
 * prima e dopo la modifica. Per scegliere le due revisioni c'è
 * `tassullo-version-timeline`; per mettere due contenuti qualsiasi uno
 * accanto all'altro, senza segnare le differenze, `tassullo-split-view`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-diff-view
 * ```
 *
 * ```tsx
 * <DiffView prima={revisione3.testo} dopo={revisione4.testo} />
 * <DiffView prima={revisione3.testo} dopo={revisione4.testo} modo="affiancato" />
 * <DiffView prima="2,0" dopo="9,1" modo="valori" legenda={false} />
 * ```
 *
 * **Le prop.** `prima` e `dopo`, i due testi; `etichettaPrima` ed
 * `etichettaDopo`, «Prima» e «Dopo» se non si passano; `modo`: `"inline"`,
 * il predefinito, fonde il confronto in un paragrafo solo, con il tolto
 * barrato e l'aggiunto colorato; `"affiancato"` mette le due versioni in due
 * colonne che scorrono insieme, e che in un contenitore stretto si
 * impilano; `"valori"`, per un valore breve come una misura o un numero,
 * mostra il valore di prima intero e barrato, una freccia e quello di dopo
 * intero, senza confrontarli parola per parola; `legenda`, di serie sì, mostra sopra il confronto la legenda
 * «Tolto / Aggiunto».
 *
 * **Regole d'uso.** Il confronto è fra testi: un documento salvato in un
 * formato strutturato si converte prima in testo. Due testi uguali danno un
 * paragrafo senza segni. La legenda si tiene quando il confronto è uno solo,
 * o nella vista affiancata; si toglie con `legenda={false}` nella vista
 * combinata quando i confronti sono molti — uno per campo, in un dettaglio —
 * e la si dice una volta sola sopra tutti.
 * Un valore breve, su una riga — una misura, una quantità, un codice — va in
 * `"valori"`: confrontato per parole, «2,0» → «9,1» diventerebbe una fila di
 * cifre barrate e aggiunte che non è né l'uno né l'altro. Un testo, anche
 * corto, resta in `"inline"`, dove la parola cambiata si vede dentro la frase.
 *
 * **Tastiera e accessibilità.** Il testo tolto e quello aggiunto sono
 * `<del>` e `<ins>`, non soltanto colori; la legenda sopra dice quale è
 * quale, e dove la si toglie la stessa frase va detta una volta per tutti i
 * confronti.
 */
const meta = {
  title: 'Blocchi/Confronto testi',
  component: DiffView,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DiffView>

export default meta
type Story = StoryObj<typeof meta>

const schedaRev3 =
  'Membrana armata in poliestere, spessore 4 mm, per impermeabilizzazione di coperture piane e inclinate. Sovrapposizione minima ai bordi 80 mm. Posa a doppio strato incrociato, saldatura a fiamma. Resistenza a compressione secondo UNI EN 998-2.'

const schedaRev4 =
  'Membrana armata in poliestere, spessore 4 mm, per impermeabilizzazione di coperture piane, inclinate e giardini pensili. Sovrapposizione minima ai bordi 100 mm. Posa a doppio strato incrociato, saldatura a fiamma. Resistenza a compressione secondo UNI EN 998-2:2024.'

/**
 * Due revisioni di una scheda tecnica, confrontate nel paragrafo.
 */
export const SchedaTecnica: Story = {
  args: {
    prima: schedaRev3,
    dopo: schedaRev4,
    etichettaPrima: 'Rev. 3 — 18 giu 2026',
    etichettaDopo: 'Rev. 4 — 2 lug 2026',
  },
  render: (args) => (
    <div className="max-w-2xl">
      <DiffView {...args} />
    </div>
  ),
}

// Scena di misura di «Scheda Tecnica»: la stessa resa, con la prova. `!dev` la
// toglie dalla barra e da Docs, così la scena qui sopra si apre a riposo;
// il controllo automatico la esegue lo stesso.
export const SchedaTecnicaProva: Story = {
  ...SchedaTecnica,
  name: 'Scheda Tecnica, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).getAllByText('Tolto')).toHaveLength(1)
  },
}

/**
 * La stessa coppia in due colonne: il tolto a sinistra, l'aggiunto a destra,
 * lo scorrimento insieme.
 */
export const Affiancato: Story = {
  args: {
    prima: schedaRev3,
    dopo: schedaRev4,
    etichettaPrima: 'Rev. 3 — 18 giu 2026',
    etichettaDopo: 'Rev. 4 — 2 lug 2026',
    modo: 'affiancato',
  },
  render: (args) => (
    <div className="max-w-3xl">
      <DiffView {...args} />
    </div>
  ),
}

// Scena di misura di «Affiancato»: la stessa resa, con la prova. `!dev` la
// toglie dalla barra e da Docs, così la scena qui sopra si apre a riposo;
// il controllo automatico la esegue lo stesso.
export const AffiancatoProva: Story = {
  ...Affiancato,
  name: 'Affiancato, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).getAllByText('Tolto')).toHaveLength(1)
  },
}

/**
 * Due testi uguali: il paragrafo esce senza segni.
 */
export const NessunaDifferenza: Story = {
  args: {
    prima: schedaRev4,
    dopo: schedaRev4,
  },
  render: (args) => (
    <div className="max-w-2xl">
      <DiffView {...args} />
    </div>
  ),
}

const campiRev3 = [
  { campo: 'Descrizione', testo: 'Membrana armata in poliestere per coperture piane e inclinate.' },
  { campo: 'Posa', testo: 'Doppio strato incrociato, sovrapposizione 80 mm.' },
  { campo: 'Norma', testo: 'UNI EN 13707.' },
]
const campiRev4 = [
  { campo: 'Descrizione', testo: 'Membrana armata in poliestere per coperture piane, inclinate e giardini pensili.' },
  { campo: 'Posa', testo: 'Doppio strato incrociato, sovrapposizione 100 mm.' },
  { campo: 'Norma', testo: 'UNI EN 13707:2024.' },
]

/**
 * Un dettaglio con un confronto per campo. La legenda sta una volta sola in
 * testa e ogni confronto la toglie con `legenda={false}`: nel paragrafo il
 * tolto è già barrato e l'aggiunto colorato, e ripeterla sopra ogni campo
 * sarebbe solo rumore.
 */
export const CampoPerCampo: Story = {
  args: {
    prima: '',
    dopo: '',
    legenda: false,
  },
  render: (args) => (
    <div className="flex max-w-2xl flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Il tolto è barrato, l'aggiunto è sul fondo verde.
      </p>
      {campiRev3.map((voce, indice) => (
        <section key={voce.campo} className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">{voce.campo}</h3>
          <DiffView {...args} prima={voce.testo} dopo={campiRev4[indice]!.testo} />
        </section>
      ))}
    </div>
  ),
}

// Scena di misura di «Campo Per Campo»: la stessa resa, con la prova. `!dev` la
// toglie dalla barra e da Docs, così la scena qui sopra si apre a riposo;
// il controllo automatico la esegue lo stesso.
export const CampoPerCampoProva: Story = {
  ...CampoPerCampo,
  name: 'Campo Per Campo, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvasElement.querySelectorAll('[data-slot="diff-view"]')).toHaveLength(3)
    expect(canvas.queryAllByText('Tolto')).toHaveLength(0)
    expect(canvas.queryAllByText('Aggiunto')).toHaveLength(0)
  },
}

const valoriRev3 = [
  { campo: 'Spessore (mm)', prima: '2,0', dopo: '9,1' },
  { campo: 'Resa (kg/m²)', prima: '1,50', dopo: '1,50' },
  { campo: 'Confezione', prima: 'Sacco 25 kg', dopo: 'Sacco 20 kg' },
  { campo: 'Peso pallet (kg)', prima: '1.200', dopo: '1.350' },
  { campo: 'Classe di reazione al fuoco', prima: '', dopo: 'A1' },
  { campo: 'Nota di posa', prima: 'Solo a mano', dopo: '' },
]

/**
 * Un valore per riga, in una tabella: ogni valore resta intero, il vecchio
 * barrato e il nuovo dopo la freccia. Uguali, il valore una volta sola; un
 * valore che compare o che sparisce, da solo. La legenda sta sopra la
 * tabella, una volta.
 */
export const Valori: Story = {
  args: {
    prima: '',
    dopo: '',
    modo: 'valori',
    legenda: false,
  },
  render: (args) => (
    <div className="flex max-w-2xl flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Il valore tolto è barrato, quello nuovo è sul fondo verde.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campo</TableHead>
            <TableHead>Modifica</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {valoriRev3.map((voce) => (
            <TableRow key={voce.campo}>
              <TableCell>{voce.campo}</TableCell>
              <TableCell>
                <DiffView {...args} prima={voce.prima} dopo={voce.dopo} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

// Scena di misura di «Valori»: la stessa resa, con la prova. `!dev` la toglie
// dalla barra e da Docs, così la scena qui sopra si apre a riposo; il
// controllo automatico la esegue lo stesso.
export const ValoriProva: Story = {
  ...Valori,
  name: 'Valori, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const righe = [...canvasElement.querySelectorAll('tbody tr')]
    const cella = (i: number) => righe[i]!.querySelector('[data-slot="diff-view"]')!
    const testo = (i: number, tag: string) =>
      [...cella(i).querySelectorAll(tag)].map((n) => n.textContent)
    // Ogni valore intero, non spezzato in cifre.
    expect(testo(0, 'del')).toEqual(['2,0'])
    expect(testo(0, 'ins')).toEqual(['9,1'])
    expect(cella(0).querySelector('svg')).not.toBeNull()
    // Uguali: una volta sola, senza segni.
    expect(cella(1).textContent).toBe('1,50')
    expect(testo(1, 'del')).toEqual([])
    expect(testo(1, 'ins')).toEqual([])
    expect(testo(2, 'del')).toEqual(['Sacco 25 kg'])
    expect(testo(2, 'ins')).toEqual(['Sacco 20 kg'])
    // Comparso e sparito: da soli, senza freccia.
    expect(testo(4, 'ins')).toEqual(['A1'])
    expect(cella(4).querySelector('svg')).toBeNull()
    expect(testo(5, 'del')).toEqual(['Solo a mano'])
    expect(cella(5).querySelector('svg')).toBeNull()
    expect(within(canvasElement).queryAllByText('Tolto')).toHaveLength(0)
  },
}
