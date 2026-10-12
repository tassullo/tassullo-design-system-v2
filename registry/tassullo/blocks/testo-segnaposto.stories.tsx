import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Editor } from '@tiptap/react'
import { BracesIcon, XIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import * as z from 'zod'

import { apriPassandoci, apriScrivendo } from '@/prove/apri'
import { FormField } from '@/registry/tassullo/blocks/form-field'
import {
  TestoSegnaposto,
  TestoSegnapostoElenco,
  type TestoSegnapostoRef,
  type VoceSegnaposto,
} from '@/registry/tassullo/blocks/testo-segnaposto'
import { Button } from '@/registry/tassullo/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/registry/tassullo/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/registry/tassullo/ui/field'

/**
 * Un testo su più righe in cui i dati citati si vedono come pillole col
 * valore di oggi: si legge il testo com'è, e si riconosce cosa viene
 * dall'archivio. Il valore salvato resta una stringa con i segnaposto
 * scritti per esteso, per esempio `{{famiglia.nome}}`.
 *
 * **Quando sì, quando no.** Si usa per i testi che citano dei dati invece di
 * ricopiarli: descrizioni, avvertenze, frasi di un documento. Per un testo
 * senza dati citati c'è `textarea`; per grassetti ed elenchi c'è
 * `tassullo-rich-text-editor`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-testo-segnaposto
 * ```
 *
 * ```tsx
 * <TestoSegnaposto
 *   value={testo}
 *   onChange={setTesto}
 *   voci={[
 *     { testo: '{{famiglia.nome}}', etichetta: 'Nome della famiglia', gruppo: 'Famiglia', valore: 'Malta R4' },
 *   ]}
 * />
 * ```
 *
 * **Le prop.**
 *
 * - `value`, `defaultValue`, `onChange`: il testo è una stringa, e `onChange`
 *   riceve la stringa.
 * - `voci`: i dati che si possono citare. Ognuno ha `testo`, il segnaposto
 *   com'è scritto nel valore; `etichetta`, il nome del dato; `gruppo`;
 *   `valore`, il valore di oggi, che è ciò che la pillola mostra; `nota`,
 *   perché il valore manca; `secondaria`, per un dato che esiste ma è raro
 *   citare: negli elenchi compare solo cercandolo, o chiedendo di vederli
 *   tutti.
 * - `prefisso`: la stringa che apre l'elenco mentre si scrive, di serie `{{`.
 * - `forma`: la forma di un segnaposto, di serie le doppie graffe.
 * - `readOnly`: il testo si legge e non si modifica; resta nel giro del `Tab`
 *   e si seleziona. `disabled` lo spegne.
 * - `placeholder`, `id`, `aria-invalid`, `aria-describedby`, `etichetta`.
 * - `ref` dà `focus()` e `inserisci(testo)`; `onFocus` riceve lo stesso
 *   oggetto, per sapere in quale campo inserire da fuori.
 * - `TestoSegnapostoElenco` è l'elenco dei dati da tenere accanto ai testi:
 *   `voci` e `onScegli`; `disabled` lo spegne, per esempio mentre la pagina
 *   salva.
 *
 * **Le pillole.**
 *
 * - Grigia: il dato ha un valore, e la pillola lo mostra. Il nome del dato,
 *   col suo gruppo, compare passandoci sopra.
 * - Tratteggiata, senza fondo: il dato esiste ma oggi non ha valore. Mostra
 *   il gruppo e il nome del dato; passandoci sopra si legge perché il valore
 *   manca. Non è un avviso: è un posto che si riempirà.
 * - Rossa: il segnaposto non è fra le voci. Mostra il testo com'è scritto.
 *
 * Ciò che si legge passandoci sopra compare anche selezionando la pillola,
 * con le frecce o col dito.
 *
 * **Regole d'uso.**
 *
 * - Un dato si inserisce in tre modi: scrivendo il prefisso e scegliendo
 *   dall'elenco, trascinandolo nel testo, o con `inserisci` da un bottone.
 * - Qualunque testo con la forma di un segnaposto diventa una pillola, anche
 *   incollato o scritto a mano. Gli spazi dentro le graffe non contano:
 *   `{{ famiglia.nome }}` è lo stesso dato, e il valore resta com'è scritto.
 * - Un segnaposto attaccato a un'altra graffa, `{{{famiglia.nome}}}`, resta
 *   testo: chi legge la stringa ci trova un segnaposto sbagliato, e una
 *   pillola lo nasconderebbe.
 * - `inserisci` sostituisce il prefisso appena scritto: chi digita `{{` e poi
 *   clicca un dato nell'elenco accanto non si ritrova quattro graffe.
 * - Il doppio clic su una pillola la riporta al suo testo, per correggerla o
 *   sceglierne un'altra. Quando il cursore ne esce torna pillola.
 * - Il trascinamento non ha un equivalente da tastiera: accanto c'è sempre
 *   l'elenco che si apre scrivendo.
 * - Dentro un modulo si usa con `tassullo-form-field`: l'etichetta del campo
 *   si collega da sé.
 *
 * **Tastiera e accessibilità.** Il fuoco resta nel testo. A elenco aperto le
 * frecce su e giù scorrono le voci, `Invio` o `Tab` inseriscono quella
 * evidenziata, `Esc` chiude l'elenco e lascia il testo com'è. Le frecce di
 * lato selezionano una pillola, e `Invio` la riporta al suo testo. `Ctrl+Z`
 * annulla. Il numero di voci trovate viene annunciato.
 */
const meta = {
  title: 'Blocchi/Testo con segnaposto',
  component: TestoSegnaposto,
  parameters: {
    layout: 'padded',
    // L'elenco scorre con le frecce dal testo, che tiene il fuoco: non ha, e
    // non deve avere, un suo posto nel giro del `Tab`. axe esenta da questa
    // regola l'elenco di un `combobox`, riconoscendolo dal ruolo; un testo su
    // più righe quel ruolo non può prenderlo. Si spegne la sola regola.
    a11y: { config: { rules: [{ id: 'scrollable-region-focusable', enabled: false }] } },
  },
  args: { voci: [] },
} satisfies Meta<typeof TestoSegnaposto>

export default meta
type Story = StoryObj<typeof meta>

const VOCI: VoceSegnaposto[] = [
  { gruppo: 'Famiglia', etichetta: 'Nome della famiglia', testo: '{{famiglia.nome}}', valore: 'Malta R4' },
  { gruppo: 'Famiglia', etichetta: 'Linea', testo: '{{famiglia.linea}}', valore: 'Ripristino del calcestruzzo' },
  { gruppo: 'Qualifica', etichetta: 'Norma', testo: '{{qualifica.norma}}', valore: 'EN 1504-3' },
  { gruppo: 'Qualifica', etichetta: 'Classe', testo: '{{qualifica.classe}}', valore: 'R4' },
  {
    gruppo: 'Prodotto',
    etichetta: 'Codice interno',
    testo: '{{prodotto.codice}}',
    nota: 'Il valore cambia da una variante all’altra.',
  },
  {
    gruppo: 'Prodotto',
    etichetta: 'Contenuto di sottoprodotto (%)',
    testo: '{{prodotto.sottoprodotto}}',
    nota: 'Il dato non è compilato.',
  },
  { gruppo: 'Prestazioni', etichetta: 'Resistenza a compressione', testo: '{{prestazione.compressione}}', valore: '≥ 45 N/mm²' },
  { gruppo: 'Prestazioni', etichetta: 'Adesione al supporto', testo: '{{prestazione.adesione}}', valore: '≥ 2,0 N/mm²' },
  { gruppo: 'Prestazioni', etichetta: 'Reazione al fuoco', testo: '{{prestazione.fuoco}}', valore: 'A1' },
  { gruppo: 'Confezione', etichetta: 'Peso del sacco', testo: '{{confezione.peso}}', valore: '25 kg' },
  { gruppo: 'Confezione', etichetta: 'Resa', testo: '{{confezione.resa}}', valore: '18 kg/m²' },
  { gruppo: 'Confezione', etichetta: 'Quantità per bancale', testo: '{{confezione.bancale}}', valore: '48 sacchi' },
  {
    gruppo: 'Frasi standard',
    etichetta: 'Uso professionale',
    testo: '{{frase.uso_professionale}}',
    valore: 'Il prodotto è inteso per un uso professionale.',
  },
]

const AREA = '[data-slot="testo-segnaposto-area"]'
const ELENCO = 'testo-segnaposto-elenco'

const DESCRIZIONE =
  '{{famiglia.nome}} è una malta conforme alla {{qualifica.norma}}, classe {{qualifica.classe}}, con reazione al fuoco {{prestazione.fuoco}}.\n{{frase.uso_professionale}}'

function ConValore({ voci, iniziale }: { voci: readonly VoceSegnaposto[]; iniziale: string }) {
  const [testo, setTesto] = useState(iniziale)
  return (
    <FieldGroup className="max-w-2xl">
      <Field>
        <FieldLabel htmlFor="descrizione">Descrizione</FieldLabel>
        <TestoSegnaposto id="descrizione" aria-describedby="descrizione-aiuto" voci={voci} value={testo} onChange={setTesto} />
        <FieldDescription id="descrizione-aiuto">Scrivi {'{{'} per citare un dato.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel id="descrizione-valore">Il valore salvato</FieldLabel>
        <pre
          aria-labelledby="descrizione-valore"
          className="rounded-lg border border-border bg-muted p-2.5 font-mono text-xs whitespace-pre-wrap"
        >
          {testo}
        </pre>
      </Field>
    </FieldGroup>
  )
}

/**
 * Le pillole mostrano il valore di oggi, e sotto si legge la stringa che
 * viene salvata. Digitando `{{` l'elenco si apre sotto il cursore e si
 * restringe con ciò che si scrive.
 */
export const Predefinito: Story = {
  args: { voci: VOCI },
  render: (args) => <ConValore voci={args.voci} iniziale={`${DESCRIZIONE}\nResistenza: `} />,
  play: apriScrivendo(AREA, '{{', ELENCO),
}

/**
 * I tre stati di una pillola: col valore, senza valore, e il segnaposto che
 * non esiste. Passando sopra la prima si legge il nome del dato; sopra la
 * seconda, perché il valore manca.
 */
export const Pillole: Story = {
  args: { voci: VOCI },
  play: apriPassandoci('[data-stato="senza-valore"]', 'testo-segnaposto-nota'),
  render: (args) => (
    <Field className="max-w-2xl">
      <FieldLabel htmlFor="pillole">Avvertenze</FieldLabel>
      <TestoSegnaposto
        {...args}
        id="pillole"
        defaultValue="Sacchi da {{confezione.peso}}, codice {{prodotto.codice}}. Resistenza a trazione {{prestazione.trazione}}."
      />
    </Field>
  ),
}

const CAMPI = [
  { id: 'dati-descrizione', etichetta: 'Descrizione', testo: DESCRIZIONE },
  { id: 'dati-destinazione', etichetta: "Destinazione d'uso", testo: 'Per il ripristino di strutture in calcestruzzo, con resistenza ' },
  { id: 'dati-avvertenze', etichetta: 'Avvertenze', testo: '' },
]

function PaginaConElenco({ voci }: { voci: readonly VoceSegnaposto[] }) {
  const [aperto, setAperto] = useState(true)
  const ultimo = useRef<TestoSegnapostoRef | null>(null)
  return (
    <div className="flex items-start gap-6">
      <FieldGroup className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-medium">Scheda tecnica</h2>
          <Button variant="outline" size="sm" aria-expanded={aperto} onClick={() => setAperto(!aperto)}>
            <BracesIcon />
            Inserisci un dato
          </Button>
        </div>
        {CAMPI.map((campo) => (
          <Field key={campo.id}>
            <FieldLabel htmlFor={campo.id}>{campo.etichetta}</FieldLabel>
            <TestoSegnaposto
              id={campo.id}
              voci={voci}
              defaultValue={campo.testo}
              onFocus={(questo) => {
                ultimo.current = questo
              }}
            />
          </Field>
        ))}
      </FieldGroup>
      {aperto ? (
        <aside
          aria-labelledby="dati-titolo"
          className="sticky top-0 flex max-h-svh w-80 shrink-0 flex-col gap-3 rounded-lg border bg-card p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <h2 id="dati-titolo" className="text-base font-medium">
                Dati da citare
              </h2>
              <p className="text-sm text-muted-foreground">Clicca un dato o trascinalo nel testo.</p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setAperto(false)}>
              <XIcon />
              <span className="sr-only">Chiudi</span>
            </Button>
          </div>
          <TestoSegnapostoElenco voci={voci} onScegli={(voce) => ultimo.current?.inserisci(voce.testo)} className="flex-1" />
        </aside>
      ) : null}
    </div>
  )
}

/**
 * Più testi e un solo elenco di dati, in una colonna a destra che stringe la
 * pagina invece di coprirla. In cima il filtro e la ricerca restano fermi, e
 * i dati scorrono, ognuno sotto il nome del suo gruppo. Ogni dato si clicca,
 * e va dove era il cursore nell'ultimo testo usato, oppure si trascina nel
 * punto voluto. Un dato senza valore dice perché al posto del valore.
 *
 * Dentro `tassullo-app-shell` la colonna si dichiara con `ColonnaLaterale`,
 * che la tiene ferma sotto la fascia: la scena è `Blocchi/App shell › Colonna
 * Laterale`.
 */
export const ConElencoDeiDati: Story = {
  args: { voci: VOCI },
  render: (args) => <PaginaConElenco voci={args.voci} />,
}

const schema = z.object({
  testo: z.string().min(1, 'Il testo è obbligatorio.').max(200, 'Al massimo 200 caratteri.'),
})

function Modulo() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { testo: '' },
  })
  return (
    <form className="max-w-2xl" onSubmit={form.handleSubmit(() => {})} noValidate>
      <FieldGroup>
        <FormField control={form.control} nome="testo" etichetta="Testo per l'etichetta">
          {(campo) => <TestoSegnaposto {...campo} voci={VOCI} placeholder="Scrivi {{ per citare un dato" />}
        </FormField>
        <Button type="submit" className="self-start">
          Salva
        </Button>
      </FieldGroup>
    </form>
  )
}

/**
 * Dentro `tassullo-form-field`: etichetta ed errore sono quelli del modulo, e
 * il modulo riceve la stringa con i segnaposto.
 */
export const NelModulo: Story = {
  render: () => <Modulo />,
}

/**
 * Vuoto con un invito a scrivere, di sola lettura, disabilitato e con errore.
 * Il testo di sola lettura si legge a contrasto pieno, si raggiunge col `Tab`
 * e si seleziona; quello disabilitato è spento e fuori dal giro del `Tab`.
 */
export const Stati: Story = {
  args: { voci: VOCI },
  render: (args) => (
    <FieldGroup className="max-w-2xl">
      <Field>
        <FieldLabel htmlFor="stati-vuoto">Vuoto</FieldLabel>
        <TestoSegnaposto {...args} id="stati-vuoto" placeholder="Scrivi {{ per citare un dato" />
      </Field>
      <Field>
        <FieldLabel htmlFor="stati-lettura">Sola lettura</FieldLabel>
        <TestoSegnaposto {...args} id="stati-lettura" readOnly defaultValue="La malta {{famiglia.nome}} è conforme alla {{qualifica.norma}}." />
      </Field>
      <Field data-disabled>
        <FieldLabel htmlFor="stati-disabilitato">Disabilitato</FieldLabel>
        <TestoSegnaposto {...args} id="stati-disabilitato" disabled defaultValue="La malta {{famiglia.nome}} è fuori produzione." />
      </Field>
      <Field data-invalid>
        <FieldLabel htmlFor="stati-errore">Con errore</FieldLabel>
        <TestoSegnaposto {...args} id="stati-errore" aria-invalid defaultValue="Resistenza: {{prestazione.trazione}}" />
      </Field>
    </FieldGroup>
  ),
}

/* ────────────────────────────────────────────────────────────────────────
 * Scene di misura: solo per il controllo automatico.
 * ──────────────────────────────────────────────────────────────────────── */

type Area = HTMLElement & { editor: Editor }

// Testo e basta: le graffe e le quadre, che per `userEvent.keyboard` sono
// caratteri speciali, si raddoppiano. I tasti si mandano con
// `userEvent.keyboard`.
const scrivi = (testo: string) => userEvent.keyboard(testo.replace(/[{[]/g, '$&$&'))

const elenco = () => document.querySelector<HTMLElement>(`[data-slot="${ELENCO}"]`)
const opzioni = () => [...document.querySelectorAll<HTMLElement>(`[data-slot="${ELENCO}"] [role="option"]`)]
const valoreDi = (area: Area) => area.editor.getText({ blockSeparator: '\n' })
const pilloleDi = (area: HTMLElement) =>
  [...area.querySelectorAll<HTMLElement>('[data-slot="testo-segnaposto-pillola"]')].map(
    (pillola) => `${pillola.dataset.stato}:${pillola.textContent}`
  )

async function aperto() {
  return waitFor(() => {
    const el = elenco()
    expect(el).toBeInTheDocument()
    return el as HTMLElement
  })
}

async function chiuso() {
  await waitFor(() => expect(elenco()).not.toBeInTheDocument(), { timeout: 5000 })
}

// L'area col fuoco e il cursore in fondo.
async function areaDi(radice: HTMLElement, selettore = AREA) {
  const area = await waitFor(() => {
    const el = radice.querySelector<Area>(selettore)
    expect(el?.editor).toBeTruthy()
    return el as Area
  })
  area.editor.commands.focus('end')
  await waitFor(() => expect(document.activeElement).toBe(area))
  return area
}

// Apertura, filtro, frecce, `Invio`, `Tab`, `Esc`, clic: il fuoco non lascia
// mai il testo, e il valore resta una stringa.
export const TastieraProva: Story = {
  name: 'Tastiera, prova',
  tags: ['!dev', '!autodocs'],
  args: { voci: VOCI, onChange: fn(), etichetta: 'Testo', defaultValue: 'Il prodotto ' },
  play: async ({ canvasElement, args }) => {
    const area = await areaDi(canvasElement)
    const stato = within(canvasElement).getByRole('status')

    // Il prefisso apre l'elenco con tutte le voci, la prima evidenziata.
    await scrivi('{{')
    await aperto()
    await waitFor(() => expect(opzioni()).toHaveLength(VOCI.length))
    expect(stato).toHaveTextContent(`${VOCI.length} voci`)
    expect(document.activeElement).toBe(area)
    await waitFor(() => expect(area.getAttribute('aria-activedescendant')).toBe(opzioni()[0].id))
    expect(document.getElementById(area.getAttribute('aria-controls') ?? '')).toHaveAttribute('role', 'listbox')

    // Le frecce scorrono e fanno il giro.
    await userEvent.keyboard('[ArrowDown]')
    await waitFor(() => expect(area.getAttribute('aria-activedescendant')).toBe(opzioni()[1].id))
    await userEvent.keyboard('[ArrowUp][ArrowUp]')
    await waitFor(() => expect(area.getAttribute('aria-activedescendant')).toBe(opzioni()[VOCI.length - 1].id))
    expect(valoreDi(area)).toBe('Il prodotto {{')

    // Si cerca per inizio di parola: «res» non trova «prestazione».
    await scrivi('res')
    await waitFor(() =>
      expect(opzioni().map((o) => o.textContent)).toEqual(['Resistenza a compressione≥ 45 N/mm²', 'Resa18 kg/m²'])
    )
    expect(stato).toHaveTextContent('2 voci')

    // `Invio` mette la pillola al posto di prefisso e filtro.
    await userEvent.keyboard('[Enter]')
    await chiuso()
    expect(valoreDi(area)).toBe('Il prodotto {{prestazione.compressione}}')
    expect(pilloleDi(area)).toEqual(['valore:≥ 45 N/mm²'])
    expect(args.onChange).toHaveBeenLastCalledWith('Il prodotto {{prestazione.compressione}}')
    expect(document.activeElement).toBe(area)
    expect(area).not.toHaveAttribute('aria-activedescendant')

    // Dopo la pillola si scrive e basta.
    await scrivi(' pesa')
    expect(elenco()).not.toBeInTheDocument()

    // Senza accenti e senza maiuscole; `Tab` inserisce come `Invio`.
    await scrivi(' {{quantita')
    await aperto()
    await waitFor(() => expect(opzioni()).toHaveLength(1))
    await userEvent.keyboard('[Tab]')
    await chiuso()
    expect(valoreDi(area)).toBe('Il prodotto {{prestazione.compressione}} pesa {{confezione.bancale}}')
    expect(document.activeElement).toBe(area)

    // Niente che corrisponda: l'elenco lo dice. `Esc` chiude e lascia il
    // testo; continuando a scrivere non si riapre.
    await scrivi(' {{zzz')
    await aperto()
    expect(opzioni()).toHaveLength(0)
    expect(elenco()).toHaveTextContent('Nessuna voce')
    await userEvent.keyboard('[Escape]')
    await chiuso()
    expect(valoreDi(area).endsWith(' {{zzz')).toBe(true)
    await scrivi('a')
    expect(elenco()).not.toBeInTheDocument()

    // Il clic su una voce inserisce e non toglie il fuoco al testo.
    await scrivi(' {{peso')
    await aperto()
    await waitFor(() => expect(opzioni()).toHaveLength(1))
    await userEvent.click(opzioni()[0])
    await chiuso()
    expect(valoreDi(area).endsWith(' {{confezione.peso}}')).toBe(true)
    expect(document.activeElement).toBe(area)

    // A elenco chiuso `Invio` va a capo.
    await userEvent.keyboard('[Enter]')
    await waitFor(() => expect(valoreDi(area).endsWith('}}\n')).toBe(true))
  },
}

const VOCI_DOPO = VOCI.map((voce) =>
  voce.testo === '{{famiglia.nome}}' ? { ...voce, valore: 'Malta R4 fibrorinforzata' } : voce
)

function ConComandi() {
  const [testo, setTesto] = useState('')
  const [voci, setVoci] = useState(VOCI)
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <TestoSegnaposto etichetta="Testo" voci={voci} value={testo} onChange={setTesto} />
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setVoci(VOCI_DOPO)}>
          Cambia i valori
        </Button>
        <Button variant="outline" onClick={() => setTesto('Da fuori: {{qualifica.norma}}')}>
          Scrivi da fuori
        </Button>
      </div>
      <output data-prova="valore">{testo}</output>
    </div>
  )
}

// Un testo con la forma di un segnaposto diventa pillola comunque arrivi:
// scritto a mano, incollato, deciso da fuori. I tre stati, e le pillole che
// si ridisegnano quando cambiano i valori senza che cambi il testo.
export const PilloleProva: Story = {
  name: 'Pillole, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  render: () => <ConComandi />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const area = await areaDi(canvasElement)
    const valore = canvasElement.querySelector<HTMLElement>('[data-prova="valore"]')!

    await scrivi('{{famiglia.nome}}')
    await waitFor(() => expect(pilloleDi(area)).toEqual(['valore:Malta R4']))

    // Le altre due entrano come testo dall'editor. Scritte con la tastiera
    // simulata di `userEvent` le pillole nascono lo stesso, ma l'elenco non
    // si chiude a pillola fatta; con una tastiera vera si chiude.
    await chiuso()
    area.editor.commands.insertContent({ type: 'text', text: ' {{prodotto.codice}}' })
    await waitFor(() => expect(pilloleDi(area)).toHaveLength(2))
    area.editor.commands.insertContent({ type: 'text', text: ' {{non.esiste}}' })
    await waitFor(() =>
      expect(pilloleDi(area)).toEqual([
        'valore:Malta R4',
        'senza-valore:Prodotto · Codice interno',
        'sconosciuto:{{non.esiste}}',
      ])
    )

    // La nota: col puntatore sopra la pillola, e sulla pillola selezionata da
    // tastiera. Il nome del dato sulla grigia, il motivo su quella senza
    // valore, niente sulla rossa.
    const pillole = area.querySelectorAll<HTMLElement>('[data-slot="testo-segnaposto-pillola"]')
    const nota = () => document.querySelector<HTMLElement>('[data-slot="testo-segnaposto-nota"]')
    const senzaNota = () => waitFor(() => expect(nota()).not.toBeInTheDocument(), { timeout: 5000 })
    await userEvent.hover(pillole[0])
    await waitFor(() => expect(nota()).toHaveTextContent('Famiglia · Nome della famiglia'))
    // Senza valore: tratteggiata e senza fondo, non un avviso.
    expect(getComputedStyle(pillole[1]).borderStyle).toBe('dashed')
    expect(getComputedStyle(pillole[1]).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    await userEvent.hover(pillole[1])
    await waitFor(() => expect(nota()).toHaveTextContent('Il valore cambia da una variante all’altra.'))
    await userEvent.hover(pillole[2])
    await senzaNota()
    await userEvent.unhover(pillole[2])
    area.editor.commands.focus('end')
    await senzaNota()
    area.editor.commands.setNodeSelection(3)
    await waitFor(() => expect(nota()).toHaveTextContent('Il valore cambia da una variante all’altra.'))
    area.editor.commands.focus('end')
    await senzaNota()

    // L'incolla come lo riceve l'editor: `userEvent.paste` scrive da sé nel
    // `contenteditable` e si porta via la pillola accanto al cursore.
    const appunti = new DataTransfer()
    appunti.setData('text/plain', ' Resa {{confezione.resa}}, sacchi da {{confezione.peso}}')
    area.dispatchEvent(new ClipboardEvent('paste', { clipboardData: appunti, bubbles: true, cancelable: true }))
    await waitFor(() => expect(pilloleDi(area).slice(3)).toEqual(['valore:18 kg/m²', 'valore:25 kg']))
    const scritto =
      '{{famiglia.nome}} {{prodotto.codice}} {{non.esiste}} Resa {{confezione.resa}}, sacchi da {{confezione.peso}}'
    expect(valoreDi(area)).toBe(scritto)
    await waitFor(() => expect(valore).toHaveTextContent(scritto))

    // I valori cambiano: la pillola si ridisegna, il testo no.
    await userEvent.click(tela.getByRole('button', { name: 'Cambia i valori' }))
    await waitFor(() => expect(pilloleDi(area)[0]).toBe('valore:Malta R4 fibrorinforzata'))
    expect(valore).toHaveTextContent(scritto)

    // Il valore deciso da fuori.
    await userEvent.click(tela.getByRole('button', { name: 'Scrivi da fuori' }))
    await waitFor(() => expect(pilloleDi(area)).toEqual(['valore:EN 1504-3']))
    expect(valoreDi(area)).toBe('Da fuori: {{qualifica.norma}}')
  },
}

// Il doppio clic, o `Invio` sulla pillola selezionata, la riporta al suo
// testo con l'elenco aperto; scegliendo un'altra voce la sostituisce tutta,
// chiusura compresa; uscendo col cursore torna pillola.
export const DoppioClicProva: Story = {
  name: 'Doppio clic, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  args: { voci: VOCI, etichetta: 'Testo', defaultValue: 'Resistenza {{prestazione.compressione}}.' },
  play: async ({ canvasElement }) => {
    const area = await areaDi(canvasElement)
    const pillola = () => area.querySelector<HTMLElement>('[data-slot="testo-segnaposto-pillola"]')

    // Il doppio clic, col puntatore sopra la pillola.
    const dove = pillola()!.getBoundingClientRect()
    const coords = { clientX: dove.left + dove.width / 2, clientY: dove.top + dove.height / 2 }
    await userEvent.pointer([
      { keys: '[MouseLeft]', target: pillola()!, coords },
      { keys: '[MouseLeft]', target: pillola()!, coords },
    ])
    await waitFor(() => expect(pillola()).toBeNull())
    expect(area).toHaveTextContent('Resistenza {{prestazione.compressione}}.')
    await aperto()
    await waitFor(() => expect(opzioni().map((o) => o.textContent)).toEqual(['Resistenza a compressione≥ 45 N/mm²']))

    // `Esc`, e via col cursore: torna pillola.
    await userEvent.keyboard('[Escape]')
    await chiuso()
    area.editor.commands.focus('end')
    await waitFor(() => expect(pilloleDi(area)).toEqual(['valore:≥ 45 N/mm²']))

    // Da tastiera: la pillola selezionata e `Invio`.
    area.editor.commands.setNodeSelection(12)
    await userEvent.keyboard('[Enter]')
    await waitFor(() => expect(pillola()).toBeNull())
    await aperto()
    await userEvent.keyboard('{Backspace>12/}')
    await scrivi('ades')
    await waitFor(() => expect(opzioni().map((o) => o.textContent)).toEqual(['Adesione al supporto≥ 2,0 N/mm²']))
    await userEvent.keyboard('[Enter]')
    await chiuso()
    expect(valoreDi(area)).toBe('Resistenza {{prestazione.adesione}}.')
    expect(pilloleDi(area)).toEqual(['valore:≥ 2,0 N/mm²'])
  },
}

// L'elenco sta sotto la riga del prefisso, allineato al suo inizio, e mentre
// si scrive il filtro non si sposta.
export const PosizioneProva: Story = {
  name: 'Posizione, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  args: { voci: VOCI, etichetta: 'Testo', defaultValue: 'Prima riga\nSeconda riga, e poi ' },
  render: (args) => (
    <div className="max-w-xl">
      <TestoSegnaposto {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const area = await areaDi(canvasElement)
    await scrivi('{{')
    const popup = await aperto()

    // Dove sono davvero le due graffe, chiesto al motore di resa.
    const passo = document.createTreeWalker(area, NodeFilter.SHOW_TEXT)
    let nodo = passo.nextNode()
    while (nodo && !nodo.textContent?.includes('{{')) nodo = passo.nextNode()
    const graffe = document.createRange()
    graffe.setStart(nodo!, nodo!.textContent!.indexOf('{{'))
    graffe.setEnd(nodo!, nodo!.textContent!.indexOf('{{') + 2)
    const attesa = graffe.getBoundingClientRect()

    const misura = async () => {
      // La posizione arriva un momento dopo il montaggio, e l'elenco entra
      // con un'animazione: si misura a elenco fermo.
      await waitFor(() => expect(popup.getBoundingClientRect().top).toBeGreaterThan(attesa.top))
      await Promise.all(popup.getAnimations().map((animazione) => animazione.finished))
      return popup.getBoundingClientRect()
    }
    const prima = await misura()
    expect(Math.abs(prima.left - attesa.left), `sinistra ${prima.left}, attesa ${attesa.left}`).toBeLessThan(3)
    expect(Math.abs(prima.top - (attesa.bottom + 4)), `alto ${prima.top}, atteso ${attesa.bottom + 4}`).toBeLessThan(4)

    await scrivi('re')
    await waitFor(() => expect(opzioni().length).toBeLessThan(VOCI.length))
    const dopo = await misura()
    expect(Math.abs(dopo.left - prima.left)).toBeLessThan(1)
    expect(Math.abs(dopo.top - prima.top)).toBeLessThan(1)
    expect(dopo.right).toBeLessThanOrEqual(window.innerWidth)
    await userEvent.keyboard('[Escape]')
    await chiuso()
  },
}

// Dentro un dialogo `Esc` chiude l'elenco e non il dialogo.
export const NelDialogoProva: Story = {
  name: 'Nel dialogo, prova',
  tags: ['!dev', '!autodocs'],
  args: { voci: VOCI },
  render: (args) => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica il testo</DialogTitle>
          <DialogDescription>Scrivi {'{{'} per citare un dato.</DialogDescription>
        </DialogHeader>
        <TestoSegnaposto {...args} etichetta="Testo" />
      </DialogContent>
    </Dialog>
  ),
  play: async () => {
    const dialogo = await waitFor(() => {
      const el = document.querySelector<HTMLElement>('[data-slot="dialog-content"]')
      expect(el).toBeInTheDocument()
      return el as HTMLElement
    })
    const area = await areaDi(dialogo)
    await scrivi('{{')
    await aperto()
    await userEvent.keyboard('[Escape]')
    await chiuso()
    expect(dialogo).toBeInTheDocument()
    expect(valoreDi(area)).toBe('{{')
    expect(document.activeElement).toBe(area)
  },
}

// L'etichetta del modulo nomina il testo e ci porta il fuoco; la pillola
// inserita arriva al modulo, e l'errore «obbligatorio» se ne va.
export const NelModuloProva: Story = {
  ...NelModulo,
  name: 'Nel modulo, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const area = await waitFor(() => {
      const el = canvasElement.querySelector<Area>(AREA)
      expect(el?.editor).toBeTruthy()
      return el as Area
    })
    const etichetta = tela.getByText("Testo per l'etichetta")
    expect(area.getAttribute('aria-labelledby')).toBe(etichetta.id)
    expect(tela.getByRole('textbox', { name: "Testo per l'etichetta" })).toBe(area)
    expect(canvasElement.querySelector('[data-slot="testo-segnaposto-placeholder"]')).toBeInTheDocument()

    await userEvent.click(tela.getByRole('button', { name: 'Salva' }))
    await waitFor(() => expect(tela.getByRole('alert')).toHaveTextContent('Il testo è obbligatorio.'))
    await waitFor(() => expect(area).toHaveAttribute('aria-invalid', 'true'))

    await userEvent.click(etichetta)
    await waitFor(() => expect(document.activeElement).toBe(area))
    await scrivi('{{cod')
    await aperto()
    await userEvent.keyboard('[Enter]')
    await chiuso()
    expect(valoreDi(area)).toBe('{{prodotto.codice}}')
    await waitFor(() => expect(tela.queryByRole('alert')).not.toBeInTheDocument())
    expect(canvasElement.querySelector('[data-slot="testo-segnaposto-placeholder"]')).not.toBeInTheDocument()
  },
}

// L'elenco dei dati: il filtro per gruppo e la ricerca, il clic che inserisce
// nell'ultimo testo usato, il dato trascinato che diventa pillola dove lo si
// rilascia, e la colonna che stringe la pagina.
export const ElencoProva: Story = {
  ...ConElencoDeiDati,
  name: 'Elenco dei dati, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const dati = await waitFor(() => {
      const el = canvasElement.querySelector<HTMLElement>('[data-slot="testo-segnaposto-dati"]')
      expect(el).toBeInTheDocument()
      return el as HTMLElement
    })
    const righe = () => [...dati.querySelectorAll<HTMLElement>('button[draggable="true"]')]
    expect(righe()).toHaveLength(VOCI.length)
    // Con tutti i dati in vista ogni gruppo ha la sua intestazione, e un dato
    // senza valore dice perché al posto del valore.
    const intestazioni = () =>
      [...dati.querySelectorAll<HTMLElement>('[data-slot="testo-segnaposto-dati-gruppo"]')].map((i) => i.textContent)
    expect(intestazioni()).toEqual(['Famiglia', 'Qualifica', 'Prodotto', 'Prestazioni', 'Confezione', 'Frasi standard'])
    const senza = righe().find((r) => r.textContent?.startsWith('Codice interno'))!
    expect(senza).toHaveTextContent('Codice internoIl valore cambia da una variante all’altra.')
    expect(senza).not.toHaveAttribute('title')
    expect(senza.closest('[role="group"]')).toHaveAttribute('aria-label', 'Prodotto')

    // Nel riquadro, che ha solo un'altezza massima, i dati scorrono dentro:
    // l'elenco non esce dal fondo e la barra è quella sottile.
    const riquadro = dati.closest('aside')!
    const scorre = dati.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')!
    expect(`elenco dentro il riquadro: ${dati.getBoundingClientRect().bottom <= riquadro.getBoundingClientRect().bottom}`).toBe(
      'elenco dentro il riquadro: true'
    )
    expect(`scorre dentro: ${scorre.scrollHeight > scorre.clientHeight}`).toBe('scorre dentro: true')
    expect(getComputedStyle(scorre).scrollbarWidth).toBe('none')

    // Il filtro per gruppo, poi la ricerca dentro il gruppo.
    await userEvent.click(within(dati).getByRole('combobox'))
    await userEvent.click(await within(document.body).findByRole('option', { name: 'Confezione' }))
    await waitFor(() => expect(righe()).toHaveLength(3))
    // Scelto un gruppo lo dice il filtro, e le intestazioni non servono.
    expect(intestazioni()).toEqual([])
    await userEvent.type(within(dati).getByRole('searchbox'), 'res')
    await waitFor(() => expect(righe().map((r) => r.textContent)).toEqual(['Resa18 kg/m²']))

    // Il clic inserisce nell'ultimo testo che ha avuto il fuoco.
    const destinazione = await areaDi(canvasElement, '#dati-destinazione')
    await userEvent.click(righe()[0])
    await waitFor(() => expect(pilloleDi(destinazione)).toEqual(['valore:18 kg/m²']))
    expect(valoreDi(destinazione).endsWith('con resistenza {{confezione.resa}}')).toBe(true)
    await waitFor(() => expect(document.activeElement).toBe(destinazione))

    // Il dato trascinato porta con sé il suo segnaposto, e rilasciato in un
    // testo diventa pillola.
    const carico = new DataTransfer()
    righe()[0].dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: carico }))
    expect(carico.getData('text/plain')).toBe('{{confezione.resa}}')
    const avvertenze = canvasElement.querySelector<Area>('#dati-avvertenze')!
    const dove = avvertenze.getBoundingClientRect()
    avvertenze.dispatchEvent(
      new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: carico,
        clientX: dove.left + 24,
        clientY: dove.top + dove.height / 2,
      })
    )
    await waitFor(() => expect(pilloleDi(avvertenze)).toEqual(['valore:18 kg/m²']))
    expect(valoreDi(avvertenze)).toBe('{{confezione.resa}}')

    // La colonna stringe la pagina: chiusa, i testi si allargano.
    const stretta = destinazione.getBoundingClientRect().width
    await userEvent.click(tela.getByRole('button', { name: 'Inserisci un dato' }))
    await waitFor(() => expect(dati).not.toBeInTheDocument())
    expect(destinazione.getBoundingClientRect().width).toBeGreaterThan(stretta + 200)
  },
}

// La sola lettura: contrasto pieno, nel giro del `Tab`, e niente che la
// modifichi: tasti, `inserisci`, un dato rilasciato, il doppio clic.
export const SolaLetturaProva: Story = {
  name: 'Sola lettura, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  args: { voci: VOCI, onChange: fn(), onFocus: fn() },
  render: (args) => (
    <div className="flex max-w-2xl flex-col gap-3">
      <input aria-label="Prima" />
      <TestoSegnaposto {...args} etichetta="Testo" readOnly defaultValue="La malta {{famiglia.nome}} è pronta." />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const area = await waitFor(() => {
      const el = canvasElement.querySelector<Area>(AREA)
      expect(el?.editor).toBeTruthy()
      return el as Area
    })
    const scritto = 'La malta {{famiglia.nome}} è pronta.'
    await waitFor(() => expect(area).toHaveAttribute('aria-readonly', 'true'))
    expect(area).toHaveAttribute('contenteditable', 'false')
    expect(area).not.toHaveAttribute('aria-disabled')
    expect(getComputedStyle(area).opacity).toBe('1')
    expect(pilloleDi(area)).toEqual(['valore:Malta R4'])

    // Il `Tab` ci arriva.
    within(canvasElement).getByRole('textbox', { name: 'Prima' }).focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(area)
    // La selezione segue il fuoco: in Safari ciò che si scrive va dov'è la
    // selezione, e resterebbe nel campo di prima.
    expect(area.contains(document.getSelection()?.anchorNode ?? null)).toBe(true)

    // Tasti, prefisso, `inserisci`: il testo resta com'è e l'elenco non c'è.
    await scrivi('abc {{')
    const campo = (args.onFocus as ReturnType<typeof fn>).mock.calls[0]?.[0] as TestoSegnapostoRef | undefined
    campo?.inserisci('{{qualifica.norma}}')
    expect(valoreDi(area)).toBe(scritto)
    expect(elenco()).not.toBeInTheDocument()

    // Un dato rilasciato non entra.
    const carico = new DataTransfer()
    carico.setData('text/plain', '{{qualifica.norma}}')
    const dove = area.getBoundingClientRect()
    area.dispatchEvent(
      new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: carico, clientX: dove.left + 24, clientY: dove.top + 12 })
    )

    // Il doppio clic non riapre la pillola.
    const pillola = area.querySelector<HTMLElement>('[data-slot="testo-segnaposto-pillola"]')!
    await userEvent.dblClick(pillola)
    expect(pilloleDi(area)).toEqual(['valore:Malta R4'])
    expect(valoreDi(area)).toBe(scritto)
    expect(args.onChange).not.toHaveBeenCalled()
  },
}

// Si scrive il prefisso e poi si clicca un dato nell'elenco accanto: il dato
// prende il posto del prefisso e del suo filtro, e non restano graffe.
export const InserisciSulPrefissoProva: Story = {
  ...ConElencoDeiDati,
  name: 'Inserisci sul prefisso, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const dati = await waitFor(() => {
      const el = canvasElement.querySelector<HTMLElement>('[data-slot="testo-segnaposto-dati"]')
      expect(el).toBeInTheDocument()
      return el as HTMLElement
    })
    const riga = (nome: string) =>
      [...dati.querySelectorAll<HTMLElement>('button[draggable="true"]')].find((r) => r.textContent?.startsWith(nome))!
    const inizio = 'Per il ripristino di strutture in calcestruzzo, con resistenza '

    const destinazione = await areaDi(canvasElement, '#dati-destinazione')
    await scrivi('{{')
    await aperto()
    await userEvent.click(riga('Norma'))
    await waitFor(() => expect(valoreDi(destinazione)).toBe(`${inizio}{{qualifica.norma}}`))
    await chiuso()

    // Col filtro già cominciato.
    await areaDi(canvasElement, '#dati-destinazione')
    await scrivi(' e {{cla')
    await userEvent.click(riga('Classe'))
    await waitFor(() => expect(valoreDi(destinazione)).toBe(`${inizio}{{qualifica.norma}} e {{qualifica.classe}}`))
    expect(pilloleDi(destinazione)).toEqual(['valore:EN 1504-3', 'valore:R4'])
    await chiuso()

    // Senza prefisso si inserisce e basta, dov'è il cursore.
    await areaDi(canvasElement, '#dati-destinazione')
    await scrivi(', ')
    await userEvent.click(riga('Resa'))
    await waitFor(() => expect(valoreDi(destinazione).endsWith('{{qualifica.classe}}, {{confezione.resa}}')).toBe(true))
    await chiuso()
  },
}

// Gli spazi dentro le graffe: il dato si riconosce, e il valore resta com'è
// scritto.
export const SpaziProva: Story = {
  name: 'Spazi nelle graffe, prova',
  tags: ['!dev', '!autodocs'],
  args: {
    voci: VOCI,
    etichetta: 'Testo',
    defaultValue: 'La malta {{ famiglia.nome }}, codice {{ prodotto.codice }}, {{ non.esiste }}. ',
  },
  play: async ({ canvasElement }) => {
    const area = await areaDi(canvasElement)
    await waitFor(() =>
      expect(pilloleDi(area)).toEqual([
        'valore:Malta R4',
        'senza-valore:Prodotto · Codice interno',
        'sconosciuto:{{ non.esiste }}',
      ])
    )
    await scrivi('{{ qualifica.norma }}')
    await waitFor(() => expect(pilloleDi(area)).toHaveLength(4))
    expect(pilloleDi(area)[3]).toBe('valore:EN 1504-3')
    expect(valoreDi(area)).toBe(
      'La malta {{ famiglia.nome }}, codice {{ prodotto.codice }}, {{ non.esiste }}. {{ qualifica.norma }}'
    )
    await userEvent.keyboard('[Escape]')
    await chiuso()
  },
}

const VOCI_IN_FONDO: VoceSegnaposto[] = Array.from({ length: 24 }, (_, i) => ({
  gruppo: 'Prodotto',
  etichetta: `Dato ${i + 1}`,
  testo: `{{prodotto.dato_${i + 1}}}`,
  nota: 'Il dato non è compilato.',
}))

// L'elenco in un riquadro basso, in una pagina senza antenati posizionati: i
// dati scorrono dentro il riquadro e la pagina resta alta quanto la finestra.
// Poi spento: niente clic, niente trascinamento, filtro e ricerca fermi.
export const ElencoNelRiquadroProva: Story = {
  name: 'Elenco nel riquadro, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  args: { voci: VOCI_IN_FONDO },
  render: function Riquadro(args) {
    const [spento, setSpento] = useState(false)
    const [scelte, setScelte] = useState(0)
    return (
      <div className="flex w-80 flex-col gap-3">
        <Button variant="outline" onClick={() => setSpento(!spento)}>
          Spegni
        </Button>
        <output data-prova="scelte">{scelte}</output>
        <div className="flex h-80 flex-col">
          <TestoSegnapostoElenco voci={args.voci} disabled={spento} onScegli={() => setScelte(scelte + 1)} className="flex-1" />
        </div>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const dati = await waitFor(() => {
      const el = canvasElement.querySelector<HTMLElement>('[data-slot="testo-segnaposto-dati"]')
      expect(el).toBeInTheDocument()
      return el as HTMLElement
    })
    const righe = () => [...dati.querySelectorAll<HTMLButtonElement>('button[draggable]')]
    const scelte = canvasElement.querySelector<HTMLElement>('[data-prova="scelte"]')!
    expect(righe()).toHaveLength(VOCI_IN_FONDO.length)

    // La pagina non si allunga.
    const pagina = document.scrollingElement ?? document.documentElement
    expect(`pagina ${pagina.scrollHeight} su ${pagina.clientHeight}`).toBe(
      `pagina ${pagina.clientHeight} su ${pagina.clientHeight}`
    )

    // Le voci stanno nel giro del `Tab`, anche in Safari. Prima di loro c'è
    // ciò che scorre, che da lì si scorre con le frecce.
    within(dati).getByRole('searchbox').focus()
    await userEvent.tab()
    expect(document.activeElement).toHaveAttribute('data-slot', 'scroll-area-viewport')
    await userEvent.tab()
    expect(document.activeElement).toBe(righe()[0])
    expect(righe()[0].tabIndex).toBe(0)
    expect(righe()[0].getAttribute('tabindex')).toBe('0')

    await userEvent.click(righe()[0])
    await waitFor(() => expect(scelte).toHaveTextContent('1'))

    // Spento.
    await userEvent.click(tela.getByRole('button', { name: 'Spegni' }))
    await waitFor(() => expect(righe()[0]).toBeDisabled())
    expect(righe().every((r) => r.disabled && r.getAttribute('draggable') === 'false')).toBe(true)
    expect(within(dati).getByRole('searchbox')).toBeDisabled()
    await userEvent.click(righe()[0], { pointerEventsCheck: 0 })
    expect(scelte).toHaveTextContent('1')
  },
}

// Tre graffe: nella stringa non è un segnaposto, e resta testo. Anche quando
// la graffa in più arriva dopo, davanti a una pillola già fatta.
export const TreGraffeProva: Story = {
  name: 'Tre graffe, prova',
  tags: ['!dev', '!autodocs'],
  args: {
    voci: VOCI,
    etichetta: 'Testo',
    defaultValue: 'Uno {{{famiglia.nome}}} due {{qualifica.norma}}{{qualifica.classe}}',
  },
  play: async ({ canvasElement }) => {
    const area = await areaDi(canvasElement)
    await waitFor(() => expect(pilloleDi(area)).toEqual(['valore:EN 1504-3', 'valore:R4']))
    expect(area).toHaveTextContent('Uno {{{famiglia.nome}}} due')

    // Scritto a mano, un carattere alla volta.
    await scrivi(' {{{confezione.peso}}}')
    await userEvent.keyboard('[Escape]')
    await chiuso()
    expect(pilloleDi(area)).toEqual(['valore:EN 1504-3', 'valore:R4'])

    // Una graffa davanti alla prima pillola: torna testo, e il valore lo dice.
    const prima = area.editor.state.doc.textBetween(0, area.editor.state.doc.content.size, '\n', '￼').indexOf('￼') + 1
    area.editor.commands.insertContentAt(prima, { type: 'text', text: '{' })
    await waitFor(() => expect(pilloleDi(area)).toEqual(['valore:R4']))
    expect(valoreDi(area)).toBe('Uno {{{famiglia.nome}}} due {{{qualifica.norma}}{{qualifica.classe}} {{{confezione.peso}}}')
  },
}

const VOCI_CON_SECONDARIE: VoceSegnaposto[] = [
  ...VOCI,
  { gruppo: 'Prodotto', etichetta: 'Lotto', testo: '{{prodotto.lotto}}', nota: 'Il dato non è compilato.', secondaria: true },
  { gruppo: 'Archivio', etichetta: 'Revisione', testo: '{{archivio.revisione}}', valore: '7', secondaria: true },
]

/**
 * Le voci secondarie: dati che esistono e si possono citare, ma che è raro
 * usare, come quelli che oggi non hanno un valore. Non si propongono per
 * prime, così gli elenchi restano corti; si trovano cercandole, e l'elenco
 * dei dati ha in fondo un bottone che le mostra tutte. Qui sono «Lotto» e
 * «Revisione»: scrivi `{{lot` nel testo, oppure cercale a destra.
 */
export const VociSecondarie: Story = {
  args: { voci: VOCI_CON_SECONDARIE },
  render: (args) => (
    <div className="flex max-w-4xl items-start gap-6">
      <Field className="min-w-0 flex-1">
        <FieldLabel htmlFor="secondarie">Descrizione</FieldLabel>
        <TestoSegnaposto {...args} id="secondarie" defaultValue="Lotto {{prodotto.lotto}}, revisione {{archivio.revisione}}. " />
      </Field>
      <div className="flex h-96 w-80 shrink-0 flex-col">
        <TestoSegnapostoElenco voci={args.voci} className="flex-1" />
      </div>
    </div>
  ),
}

// Una voce secondaria è valida e si può citare, ma non si propone per prima:
// compare cercandola, nell'elenco che si apre scrivendo e in quello dei dati,
// dove un bottone le mostra tutte. E nell'elenco che si apre scrivendo un
// dato senza valore dice perché.
export const VociSecondarieProva: Story = {
  ...VociSecondarie,
  name: 'Voci secondarie, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const area = await areaDi(canvasElement)
    await waitFor(() =>
      expect(pilloleDi(area)).toEqual(['senza-valore:Prodotto · Lotto', 'valore:7'])
    )

    // Senza niente di scritto solo le principali, e la riga che dice delle altre.
    await scrivi('{{')
    const popup = await aperto()
    await waitFor(() => expect(opzioni()).toHaveLength(VOCI.length))
    expect(popup.querySelector('[data-slot="testo-segnaposto-altri"]')).toHaveTextContent('Altri 2 dati: scrivi per cercare')
    // Cercandola, la voce secondaria c'è e si inserisce.
    await scrivi('lot')
    await waitFor(() => expect(opzioni().map((o) => o.textContent)).toEqual(['LottoIl dato non è compilato.']))
    expect(popup.querySelector('[data-slot="testo-segnaposto-altri"]')).not.toBeInTheDocument()
    await userEvent.keyboard('[Enter]')
    await chiuso()
    expect(valoreDi(area).endsWith('. {{prodotto.lotto}}')).toBe(true)

    // L'elenco dei dati: le principali, il bottone, la ricerca.
    const dati = canvasElement.querySelector<HTMLElement>('[data-slot="testo-segnaposto-dati"]')!
    const righe = () => dati.querySelectorAll('button[draggable]')
    expect(righe()).toHaveLength(VOCI.length)
    expect(dati).not.toHaveTextContent('Revisione')
    await userEvent.click(within(dati).getByRole('button', { name: 'Mostra altri 2 dati' }))
    await waitFor(() => expect(righe()).toHaveLength(VOCI.length + 2))
    expect(dati).toHaveTextContent('Archivio')
    await userEvent.click(within(dati).getByRole('button', { name: 'Mostra meno' }))
    await waitFor(() => expect(righe()).toHaveLength(VOCI.length))
    await userEvent.type(within(dati).getByRole('searchbox'), 'revis')
    await waitFor(() => expect([...righe()].map((r) => r.textContent)).toEqual(['Revisione7']))
    await userEvent.clear(within(dati).getByRole('searchbox'))
  },
}
