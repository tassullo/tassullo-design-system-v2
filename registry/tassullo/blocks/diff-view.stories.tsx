import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'

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
 * impilano, alte quanto il testo fino a un massimo oltre il quale
 * scorrono; `"valori"`, per un valore breve come una misura o un numero,
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
 * corto, resta in `"inline"`, dove la parola cambiata si vede dentro la frase:
 * lì un numero cambia intero, con la virgola dei decimali e il punto delle
 * migliaia.
 * Più confronti affiancati nella stessa pagina — uno per riga di una
 * tabella — danno a ogni colonna un'etichetta sua, per esempio
 * `` etichettaPrima={`${campo}, prima`} ``: le colonne sono regioni, e due
 * regioni con lo stesso nome non si distinguono.
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

const notaPrima =
  'Aderenza al supporto di 2,0 N/mm² dopo 28 giorni. Consumo di 1.250 g/m² per 10 mm di spessore.'
const notaDopo =
  'Aderenza al supporto di 9,1 N/mm² dopo 28 giorni. Consumo di 1.400 g/m² per 10 mm di spessore.'

/**
 * Una frase che cita dei valori: ogni numero cambia intero, con la virgola
 * dei decimali e il punto delle migliaia, e non si mescola cifra per cifra
 * col numero di prima.
 */
export const NumeriNelTesto: Story = {
  name: 'Numeri nel testo',
  args: {
    prima: notaPrima,
    dopo: notaDopo,
  },
  render: (args) => (
    <div className="max-w-2xl">
      <DiffView {...args} />
    </div>
  ),
}

// Scena di misura di «Numeri nel testo»: i numeri restano interi in tutti e due
// i modi che confrontano per parole.
export const NumeriNelTestoProva: Story = {
  name: 'Numeri nel testo, prova',
  tags: ['!dev', '!autodocs'],
  args: { prima: notaPrima, dopo: notaDopo },
  render: (args) => (
    <div className="flex max-w-3xl flex-col gap-6">
      <div data-prova="inline">
        <DiffView {...args} />
      </div>
      <div data-prova="affiancato">
        <DiffView {...args} modo="affiancato" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const modo of ['inline', 'affiancato']) {
      const vista = canvasElement.querySelector(`[data-prova="${modo}"]`)!
      const testi = (tag: string) => [...vista.querySelectorAll(tag)].map((n) => n.textContent)
      expect(testi('del')).toEqual(['2,0', '1.250'])
      expect(testi('ins')).toEqual(['9,1', '1.400'])
    }
  },
}

const breviPrima = [
  { campo: 'Descrizione', testo: 'Malta per rasature.\nGrana fine.\nColore grigio.' },
  { campo: 'Posa', testo: 'A spatola, in due mani.' },
]
const breviDopo = [
  { campo: 'Descrizione', testo: 'Malta per rasature e incollaggi.\nGrana fine.\nColore bianco.' },
  { campo: 'Posa', testo: 'A spatola o a macchina, in due mani.' },
]

/**
 * Le due colonne sono alte quanto il testo, fino a un massimo: un confronto
 * di poche righe non lascia spazio vuoto sotto, e uno lungo scorre nelle due
 * colonne insieme. Qui un confronto per riga di una tabella.
 */
export const AffiancatoInTabella: Story = {
  name: 'Affiancato in tabella',
  args: {
    prima: '',
    dopo: '',
    modo: 'affiancato',
    legenda: false,
  },
  render: (args) => (
    <div className="flex max-w-3xl flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Il tolto è barrato, l'aggiunto è sul fondo verde.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campo</TableHead>
            <TableHead>Modifica</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {breviPrima.map((voce, indice) => (
            <TableRow key={voce.campo}>
              <TableCell className="align-top">{voce.campo}</TableCell>
              <TableCell className="w-full whitespace-normal">
                <DiffView
                  {...args}
                  prima={voce.testo}
                  dopo={breviDopo[indice]!.testo}
                  etichettaPrima={`${voce.campo}, prima`}
                  etichettaDopo={`${voce.campo}, dopo`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

// Scena di misura di «Affiancato in tabella»: in una cella che non apre la
// riga il separatore delle colonne resta collegato ai due pannelli, e da
// tastiera li allarga e li stringe.
export const AffiancatoInTabellaProva: Story = {
  ...AffiancatoInTabella,
  name: 'Affiancato in tabella, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const separatori = [...canvasElement.querySelectorAll<HTMLElement>('[role="separator"]')]
    expect(separatori).toHaveLength(2)
    await waitFor(() => {
      for (const separatore of separatori) expect(separatore.getAttribute('aria-valuenow')).toBe('50')
    })
    separatori[1]!.focus()
    separatori[1]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    await waitFor(() => expect(separatori[1]!.getAttribute('aria-valuenow')).toBe('45'))
  },
}

// Scena di misura dell'altezza: un testo breve dà colonne alte quanto il testo,
// senza scorrimento; un testo lungo si ferma al massimo di 384px e le colonne
// scorrono, affiancate e impilate.
export const AffiancatoAltezzaProva: Story = {
  name: 'Affiancato, altezza, prova',
  tags: ['!dev', '!autodocs'],
  args: { prima: '', dopo: '', modo: 'affiancato' },
  render: (args) => (
    <div className="flex max-w-3xl flex-col gap-6">
      <div data-prova="breve">
        <DiffView
          {...args}
          prima={breviPrima[0]!.testo}
          dopo={breviDopo[0]!.testo}
          etichettaPrima="Breve, prima"
          etichettaDopo="Breve, dopo"
        />
      </div>
      <div data-prova="lungo">
        <DiffView
          {...args}
          prima={Array(12).fill(schedaRev3).join('\n\n')}
          dopo={Array(12).fill(schedaRev4).join('\n\n')}
          etichettaPrima="Lungo, prima"
          etichettaDopo="Lungo, dopo"
        />
      </div>
      <div data-prova="impilato" className="max-w-sm">
        <DiffView
          {...args}
          prima={Array(12).fill(schedaRev3).join('\n\n')}
          dopo={Array(12).fill(schedaRev4).join('\n\n')}
          etichettaPrima="Impilato, prima"
          etichettaDopo="Impilato, dopo"
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const vista = (nome: string) =>
      canvasElement.querySelector<HTMLElement>(`[data-prova="${nome}"] [data-slot="split-view"]`)!
    const colonne = (nome: string) => [...vista(nome).querySelectorAll<HTMLElement>('[role="region"]')]
    await waitFor(() => expect(colonne('breve')).toHaveLength(2))
    // Breve: nessuna colonna scorre, e la vista è molto sotto il massimo.
    for (const colonna of colonne('breve')) {
      expect(colonna.scrollHeight - colonna.clientHeight).toBeLessThanOrEqual(1)
    }
    expect(vista('breve').getBoundingClientRect().height).toBeLessThan(250)
    // Lungo, affiancato e impilato in un contenitore stretto: la vista si
    // ferma a 384px e le colonne scorrono dentro.
    await waitFor(() => expect(vista('impilato').querySelector('[role="separator"]')).toBeNull())
    expect(vista('lungo').querySelector('[role="separator"]')).not.toBeNull()
    for (const nome of ['lungo', 'impilato']) {
      expect(Math.abs(vista(nome).getBoundingClientRect().height - 384)).toBeLessThan(1)
      for (const colonna of colonne(nome)) {
        expect(colonna.scrollHeight).toBeGreaterThan(colonna.clientHeight)
        expect(colonna.getBoundingClientRect().bottom).toBeLessThanOrEqual(
          vista(nome).getBoundingClientRect().bottom + 1
        )
      }
    }
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
