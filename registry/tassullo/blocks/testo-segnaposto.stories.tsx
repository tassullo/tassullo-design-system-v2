import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { zodResolver } from '@hookform/resolvers/zod'
import { closeHistory } from '@tiptap/pm/history'
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
import { FORMA_SEGNAPOSTO, SPAZI_SEGNAPOSTO, nomeSegnaposto } from '@/registry/tassullo/lib/segnaposto'
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
 *   perché il valore manca. I dati si mostrano sempre tutti, nell'elenco che
 *   si apre scrivendo e in quello accanto ai testi.
 * - `prefisso`: la stringa che apre l'elenco mentre si scrive, di serie `{{`.
 * - `forma`: la forma di un segnaposto, di serie le doppie graffe. Quella
 *   di serie è `FORMA_SEGNAPOSTO`, in `lib/segnaposto`, un file senza React
 *   che arriva con il blocco: lì c'è anche `nomeSegnaposto`, che legge il
 *   nome scritto in un segnaposto.
 * - `readOnly`: il testo si legge e non si modifica; resta nel giro del `Tab`
 *   e si seleziona. `disabled` lo spegne.
 * - `placeholder`, `id`, `aria-invalid`, `aria-describedby`, `etichetta`.
 * - `ref` dà `focus()` e `inserisci(testo)`; `onFocus` riceve lo stesso
 *   oggetto, per sapere in quale campo inserire da fuori.
 * - `TestoSegnapostoElenco` è l'elenco dei dati da tenere accanto ai testi:
 *   `voci` e `onScegli`; `disabled` lo spegne, per esempio mentre la pagina
 *   salva. Filtro e ricerca li tiene l'elenco, e si perdono quando la pagina
 *   smette di renderlo. Per tenerli la pagina passa `gruppo` e `onGruppo`
 *   (`null` è «tutti»), `ricerca` e `onRicerca`.
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
 * - Un dato inserito prende da sé lo spazio che gli serve, lato per lato, in
 *   tutti e tre i modi e anche quando si sposta una pillola: la pillola ha
 *   un suo margine e a occhio sembra già staccata, ma nel documento
 *   uscirebbe attaccata alla parola. **Prima del dato** lo spazio c'è
 *   sempre, tranne all'inizio della riga, dopo uno spazio che c'è già, dopo
 *   un segno che apre, cioè `(` `[` `«` `“` `‘`, e dopo l'apostrofo:
 *   `l'{{famiglia.nome}}`. **Dopo il dato** c'è sempre, tranne alla fine
 *   della riga, prima di uno spazio che c'è già e prima di un segno che
 *   chiude o che segue: `.` `,` `;` `:` `!` `?` `…` `)` `]` `»` `”` `’`.
 *   Quindi dopo una virgola o un punto il dato è staccato, e prima no.
 * - Le virgolette dritte doppie non dicono da che parte guardano: si contano
 *   nella riga. La prima apre, la seconda chiude, e così via. L'apostrofo
 *   dritto tiene sempre il dato attaccato, prima e dopo.
 * - Chi vuole il dato attaccato cancella lo spazio. Il cursore resta subito
 *   dopo il dato, e un solo `Ctrl+Z` toglie il dato con i suoi spazi.
 * - Scrivendo una lettera o una cifra subito dopo una pillola, lo spazio si
 *   mette prima del carattere; subito prima di una pillola, si mette dopo.
 *   Con la punteggiatura no. Un solo `Ctrl+Z` toglie lo spazio e lascia il
 *   carattere, e da lì si continua a scrivere attaccati. Uno spazio
 *   cancellato a mano resta cancellato.
 * - Lo spazio messo per una lettera se ne va con lei: cancellata la lettera,
 *   o sostituita con una virgola, non resta uno spazio che nessuno ha
 *   scritto. Lo spazio scritto a mano non si tocca.
 * - Unendo due righe, una pillola che si ritrova accanto al testo dell'altra
 *   riga prende lo spazio di un dato inserito lì. Un solo `Ctrl+Z` toglie lo
 *   spazio e lascia le righe unite. Sulla stessa riga, chi cancella ciò che
 *   sta fra una pillola e una parola ha cancellato anche gli spazi: restano
 *   attaccate.
 * - Incollando vale lo stesso ai due capi di ciò che si incolla: una lettera
 *   o una cifra che tocca una pillola prende lo spazio, e un dato incollato,
 *   da solo o in testa o in coda a un testo, prende gli spazi di un dato
 *   inserito. Un solo `Ctrl+Z` toglie gli spazi e lascia ciò che si è
 *   incollato.
 * - Ciò che entra con una composizione, come un accento fatto con due tasti,
 *   la dettatura o una tastiera a schermo, prende lo spazio quando la
 *   composizione è finita: mentre si compone il testo attorno resta fermo.
 * - Un segnaposto scritto a mano per intero resta dove lo si scrive, anche
 *   attaccato a una parola.
 * - Trascinando un dato, dall'elenco o da un punto all'altro del testo, segue
 *   il puntatore una pillola piccola, e nel testo un segno arancio verticale
 *   dice dove cadrà. Nello spazio vuoto sotto il testo il dato va in coda
 *   all'ultima riga, sopra il testo all'inizio della prima, e il segno sta
 *   lì. Lasciato su una pillola, il dato le va accanto.
 * - Una pillola spostata si porta via il suo spazio: dove stava non restano
 *   due spazi di fila, né uno spazio davanti a una virgola, dopo una
 *   parentesi aperta o in fondo alla riga; dove arriva prende quelli che
 *   servono. Lasciata dov'era, il testo resta com'era, anche se era
 *   attaccata a una parola. Un solo `Ctrl+Z` la rimette al suo posto. Col tasto che
 *   copia, `Alt` su Mac e `Ctrl` altrove, la pillola si duplica.
 * - Qualunque testo con la forma di un segnaposto diventa una pillola, anche
 *   incollato o scritto a mano. Gli spazi dentro le graffe non contano:
 *   `{{ famiglia.nome }}` è lo stesso dato, e il valore resta com'è scritto.
 * - Chi controlla lo stesso testo altrove, per esempio su un server, deve
 *   togliere attorno al nome gli stessi spazi del campo, o la pillola dice
 *   una cosa e il salvataggio un'altra. Sono 24 caratteri: ogni spazio di
 *   JavaScript tranne l'a capo. L'elenco è in `lib/segnaposto`.
 * - Nell'elenco che si apre scrivendo ogni dato è su due righe, come
 *   nell'elenco dei dati: in piccolo il nome, sempre per intero, e sotto in
 *   evidenza il valore; se manca, al suo posto il motivo.
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
 * annulla. Il numero di voci trovate viene annunciato. Se i dati cambiano
 * mentre l'elenco è aperto, la voce evidenziata resta la stessa.
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

/**
 * Un campo che parte alto otto righe, con la maniglia sul bordo in basso per
 * alzarlo ancora. L'altezza scelta è un minimo: scrivendo oltre, il campo
 * cresce col testo e non scorre mai dentro. Da tastiera la maniglia si muove
 * con le frecce su e giù, una riga alla volta, e `Inizio` torna all'altezza
 * di partenza.
 */
export const Altezza: Story = {
  args: { voci: VOCI },
  render: (args) => (
    <Field className="max-w-2xl">
      <FieldLabel htmlFor="altezza">Descrizione</FieldLabel>
      <TestoSegnaposto {...args} id="altezza" righe={8} ridimensionabile defaultValue={DESCRIZIONE} />
    </Field>
  ),
}

const TESTI = [
  { chiave: 'descrizione', titolo: 'Descrizione', testo: 'La malta {{famiglia.nome}} è conforme alla {{qualifica.norma}}.' },
  { chiave: 'uso', titolo: "Destinazione d'uso", testo: 'Per il ripristino di strutture in calcestruzzo.' },
  { chiave: 'avvertenze', titolo: 'Avvertenze', testo: '' },
]

function UnoAllaVolta({ voci }: { voci: readonly VoceSegnaposto[] }) {
  const [testi, setTesti] = useState(() => Object.fromEntries(TESTI.map((t) => [t.chiave, t.testo])))
  const [scelto, setScelto] = useState(TESTI[0].chiave)
  const campo = useRef<TestoSegnapostoRef | null>(null)
  return (
    <FieldGroup className="max-w-2xl">
      <div role="group" aria-label="Testi" className="flex flex-wrap gap-2">
        {TESTI.map((t) => (
          <Button
            key={t.chiave}
            variant={t.chiave === scelto ? 'secondary' : 'outline'}
            size="sm"
            aria-pressed={t.chiave === scelto}
            onClick={() => {
              setScelto(t.chiave)
              campo.current?.focus()
            }}
          >
            {t.titolo}
          </Button>
        ))}
        <Button variant="outline" size="sm" onClick={() => campo.current?.inserisci('{{qualifica.classe}}')}>
          <BracesIcon />
          Inserisci la classe
        </Button>
      </div>
      <Field>
        <FieldLabel id="uno-alla-volta">Testo</FieldLabel>
        <TestoSegnaposto
          ref={campo}
          aria-labelledby="uno-alla-volta"
          voci={voci}
          righe={5}
          chiave={scelto}
          value={testi[scelto]}
          onChange={(testo) => setTesti((prima) => ({ ...prima, [scelto]: testo }))}
        />
      </Field>
    </FieldGroup>
  )
}

/**
 * Un campo solo per più testi, uno alla volta: scegliendo un testo il campo
 * resta lo stesso e cambia ciò che mostra. Con `chiave` ogni testo ritrova il
 * suo cursore e il suo `Ctrl+Z`: l'annulla di un testo non riporta mai quello
 * di un altro, e tornando su un testo si può ancora annullare ciò che ci si
 * era scritto. Su un testo in cui il cursore non è mai stato, il cursore
 * parte dal fondo e un dato inserito da fuori va in fondo.
 */
export const UnTestoAllaVolta: Story = {
  args: { voci: VOCI },
  render: (args) => <UnoAllaVolta voci={args.voci} />,
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
    expect(elenco()).toHaveTextContent('Nessun dato')
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
    // l'elenco non esce dal fondo.
    const riquadro = dati.closest('aside')!
    const scorre = righe()[0].closest<HTMLElement>('.overflow-y-auto')!
    expect(`elenco dentro il riquadro: ${dati.getBoundingClientRect().bottom <= riquadro.getBoundingClientRect().bottom}`).toBe(
      'elenco dentro il riquadro: true'
    )
    expect(`scorre dentro: ${scorre.scrollHeight > scorre.clientHeight}`).toBe('scorre dentro: true')

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
    // Ciò che segue il puntatore è una pillola col valore, non la voce intera.
    const inVolo: string[] = []
    carico.setDragImage = (immagine) => {
      inVolo.push(`${immagine.getAttribute('data-slot')}:${immagine.textContent}`)
    }
    righe()[0].dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: carico }))
    expect(carico.getData('text/plain')).toBe('{{confezione.resa}}')
    expect(inVolo).toEqual(['testo-segnaposto-in-volo:18 kg/m²'])
    await waitFor(() => expect(document.querySelector('[data-slot="testo-segnaposto-in-volo"]')).not.toBeInTheDocument())
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

    // Un dato rilasciato non entra, e passandoci sopra non c'è il segno del
    // punto di rilascio.
    const carico = new DataTransfer()
    carico.setData('text/plain', '{{qualifica.norma}}')
    const dove = area.getBoundingClientRect()
    area.dispatchEvent(
      new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: carico, clientX: dove.left + 24, clientY: dove.top + 12 })
    )
    expect(canvasElement.querySelector('[data-slot="testo-segnaposto-rilascio"]')).not.toBeInTheDocument()
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

    // Le voci stanno nel giro del `Tab`, anche in Safari.
    within(dati).getByRole('searchbox').focus()
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

// Due dati in più, uno senza valore e uno d'archivio che è raro citare.
const VOCI_IN_PIU: VoceSegnaposto[] = [
  ...VOCI,
  { gruppo: 'Prodotto', etichetta: 'Lotto', testo: '{{prodotto.lotto}}', nota: 'Il dato non è compilato.' },
  { gruppo: 'Archivio', etichetta: 'Revisione', testo: '{{archivio.revisione}}', valore: '7' },
]

// I dati si mostrano sempre tutti, anche quelli senza valore: nell'elenco che
// si apre scrivendo, senza scrivere un filtro, e in quello dei dati, senza un
// bottone per vedere gli altri.
export const TuttiIDatiProva: Story = {
  name: 'Tutti i dati, prova',
  tags: ['!dev', '!autodocs'],
  args: { voci: VOCI_IN_PIU },
  render: (args) => (
    <div className="flex max-w-4xl items-start gap-6">
      <Field className="min-w-0 flex-1">
        <FieldLabel htmlFor="tutti">Descrizione</FieldLabel>
        <TestoSegnaposto
          {...args}
          id="tutti"
          defaultValue="Lotto {{prodotto.lotto}}, revisione {{archivio.revisione}}. "
        />
      </Field>
      <div className="flex h-96 w-80 shrink-0 flex-col">
        <TestoSegnapostoElenco voci={args.voci} className="flex-1" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const area = await areaDi(canvasElement)
    await waitFor(() => expect(pilloleDi(area)).toEqual(['senza-valore:Prodotto · Lotto', 'valore:7']))

    await scrivi('{{')
    const popup = await aperto()
    await waitFor(() => expect(opzioni()).toHaveLength(VOCI_IN_PIU.length))
    expect(opzioni().map((o) => o.textContent)).toContain('LottoIl dato non è compilato.')
    expect(opzioni().map((o) => o.textContent)).toContain('Revisione7')
    expect(popup.querySelector('[data-slot="testo-segnaposto-altri"]')).not.toBeInTheDocument()
    await userEvent.keyboard('[Escape]')
    await chiuso()

    const dati = canvasElement.querySelector<HTMLElement>('[data-slot="testo-segnaposto-dati"]')!
    expect(dati.querySelectorAll('button[draggable]')).toHaveLength(VOCI_IN_PIU.length)
    expect(dati).toHaveTextContent('Archivio')
    expect(within(dati).queryByRole('button', { name: /Mostra/ })).not.toBeInTheDocument()
  },
}

// Le voci cambiano mentre l'elenco è aperto: la scena le toglie quando riceve
// l'evento, senza togliere il fuoco al testo come farebbe un bottone.
const TOGLI_VOCE = 'prova:togli-voce'

function ConVociCheCambiano() {
  const [voci, setVoci] = useState(VOCI)
  useEffect(() => {
    const togli = (evento: Event) => {
      const testo = (evento as CustomEvent<string>).detail
      setVoci((prima) => prima.filter((voce) => voce.testo !== testo))
    }
    window.addEventListener(TOGLI_VOCE, togli)
    return () => window.removeEventListener(TOGLI_VOCE, togli)
  }, [])
  return <TestoSegnaposto etichetta="Testo" voci={voci} />
}

// Se le voci cambiano a elenco aperto, la voce evidenziata resta la stessa e
// `Invio` inserisce quella; se è lei a sparire, si torna alla prima.
export const VoceAttivaProva: Story = {
  name: 'Voce attiva, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  args: { voci: VOCI },
  render: () => <ConVociCheCambiano />,
  play: async ({ canvasElement }) => {
    const area = await areaDi(canvasElement)
    const attiva = () => document.getElementById(area.getAttribute('aria-activedescendant') ?? '')?.textContent
    const togli = (testo: string) => window.dispatchEvent(new CustomEvent(TOGLI_VOCE, { detail: testo }))

    await scrivi('{{')
    await aperto()
    await waitFor(() => expect(opzioni()).toHaveLength(VOCI.length))
    await userEvent.keyboard('[ArrowDown]')
    await waitFor(() => expect(attiva()).toBe('LineaRipristino del calcestruzzo'))

    // Sparisce una voce prima di quella evidenziata.
    togli('{{famiglia.nome}}')
    await waitFor(() => expect(opzioni()).toHaveLength(VOCI.length - 1))
    await waitFor(() => expect(attiva()).toBe('LineaRipristino del calcestruzzo'))
    await userEvent.keyboard('[Enter]')
    await chiuso()
    expect(valoreDi(area)).toBe('{{famiglia.linea}}')

    // Sparisce la voce evidenziata: si torna alla prima.
    await scrivi(' {{')
    await aperto()
    await userEvent.keyboard('[ArrowDown][ArrowDown]')
    await waitFor(() => expect(attiva()).toBe('ClasseR4'))
    togli('{{qualifica.classe}}')
    await waitFor(() => expect(opzioni()).toHaveLength(VOCI.length - 2))
    await waitFor(() => expect(attiva()).toBe('LineaRipristino del calcestruzzo'))
    await userEvent.keyboard('[Escape]')
    await chiuso()
  },
}

// Con una pillola selezionata, il puntatore su un'altra mostra la nota di
// quella sotto il puntatore; tolto il puntatore torna quella della selezionata.
export const NotaIndicataProva: Story = {
  ...Pillole,
  name: 'Nota della pillola indicata, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  play: async ({ canvasElement }) => {
    const area = await areaDi(canvasElement)
    const pillole = area.querySelectorAll<HTMLElement>('[data-slot="testo-segnaposto-pillola"]')
    const nota = () => document.querySelector<HTMLElement>('[data-slot="testo-segnaposto-nota"]')
    const posti: number[] = []
    area.editor.state.doc.descendants((nodo, posto) => {
      if (nodo.type.name === 'segnaposto') posti.push(posto)
    })

    // Selezionata la seconda, senza valore.
    area.editor.commands.setNodeSelection(posti[1])
    await waitFor(() => expect(nota()).toHaveTextContent('Il valore cambia da una variante all’altra.'))

    // Il puntatore sulla prima: la nota è la sua, e sta sopra di lei.
    await userEvent.hover(pillole[0])
    await waitFor(() => expect(nota()).toHaveTextContent('Confezione · Peso del sacco'))
    await waitFor(() => {
      const n = nota()!.getBoundingClientRect()
      const p = pillole[0].getBoundingClientRect()
      const centro = p.left + p.width / 2
      expect(`nota sopra la prima: ${n.left <= centro && centro <= n.right}`).toBe('nota sopra la prima: true')
    })

    await userEvent.unhover(pillole[0])
    await waitFor(() => expect(nota()).toHaveTextContent('Il valore cambia da una variante all’altra.'))

    // Sulla rossa, che non ha nota, il tooltip si chiude: mentre sfuma non
    // resta mai vuoto.
    await userEvent.hover(pillole[0])
    await waitFor(() => expect(nota()).toHaveTextContent('Confezione · Peso del sacco'))
    await userEvent.hover(pillole[2])
    const viste = new Set<string>()
    await waitFor(
      () => {
        const n = nota()
        if (n) viste.add(n.textContent ?? '')
        expect(n).not.toBeInTheDocument()
      },
      { timeout: 5000, interval: 10 }
    )
    expect([...viste].filter((testo) => testo === '')).toEqual([])
    await userEvent.unhover(pillole[2])
    await waitFor(() => expect(nota()).toHaveTextContent('Il valore cambia da una variante all’altra.'))
    area.editor.commands.focus('end')
    await waitFor(() => expect(nota()).not.toBeInTheDocument(), { timeout: 5000 })
  },
}

const VOCI_DAI_NOMI_LUNGHI: VoceSegnaposto[] = [
  { gruppo: 'Prestazioni', etichetta: 'Resistenza a compressione a 28 giorni (Vm)', testo: '{{prestazione.compressione.vm}}', valore: '≥ 45 N/mm²' },
  { gruppo: 'Prestazioni', etichetta: 'Resistenza a compressione a 28 giorni (Vc)', testo: '{{prestazione.compressione.vc}}', nota: 'Il valore cambia da una variante all’altra.' },
  { gruppo: 'Prestazioni', etichetta: 'Resistenza a compressione a 28 giorni (Condizione)', testo: '{{prestazione.compressione.condizione}}', valore: 'Provini stagionati in acqua a 20 °C, secondo il metodo di prova' },
  { gruppo: 'Prestazioni', etichetta: 'Resistenza a compressione a 28 giorni (Nota sul metodo)', testo: '{{prestazione.compressione.nota}}', nota: 'Il dato non è compilato in archivio.' },
]

/**
 * Voci che cominciano uguali e finiscono diverse. Nell'elenco che si apre
 * scrivendo ogni voce è su due righe, come nell'elenco dei dati: in piccolo
 * il nome, che si legge sempre per intero, e sotto in evidenza il valore di
 * oggi; se il valore manca, al suo posto c'è il perché.
 */
export const NomiLunghi: Story = {
  args: { voci: VOCI_DAI_NOMI_LUNGHI, etichetta: 'Descrizione', defaultValue: 'Resistenza: ' },
  render: (args) => (
    <div className="max-w-2xl">
      <TestoSegnaposto {...args} />
    </div>
  ),
  play: apriScrivendo(AREA, '{{', ELENCO),
}

// Nell'elenco che si apre scrivendo nessun nome è tagliato, e quattro voci
// che cominciano uguali si leggono diverse.
export const NomiLunghiProva: Story = {
  ...NomiLunghi,
  name: 'Nomi lunghi, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  play: async ({ canvasElement }) => {
    await areaDi(canvasElement)
    await scrivi('{{')
    const popup = await aperto()
    await waitFor(() => expect(opzioni()).toHaveLength(4))
    const nomi = opzioni().map((voce) => voce.querySelector<HTMLElement>('[data-slot="testo-segnaposto-voce-nome"]')!)
    expect(nomi.map((nome) => nome.textContent)).toEqual(VOCI_DAI_NOMI_LUNGHI.map((voce) => voce.etichetta))
    const tagliati = nomi.filter((nome) => nome.scrollWidth > nome.clientWidth || nome.scrollHeight > nome.clientHeight)
    expect(`nomi tagliati: ${tagliati.length}`).toBe('nomi tagliati: 0')
    // Niente esce di lato dall'elenco.
    expect(`elenco largo ${popup.scrollWidth} su ${popup.clientWidth}`).toBe(`elenco largo ${popup.clientWidth} su ${popup.clientWidth}`)
    for (const voce of opzioni()) {
      expect(`voce dentro: ${voce.scrollWidth <= voce.clientWidth}`).toBe('voce dentro: true')
    }
    await userEvent.keyboard('[Escape]')
    await chiuso()
  },
}

// L'insieme degli spazi ammessi attorno al nome è quello scritto: si guarda
// ogni punto di codice di Unicode, con e senza il flag `u`. E il nome si
// legge togliendo quelli e solo quelli.
export const InsiemeDegliSpaziProva: Story = {
  name: 'Insieme degli spazi, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  args: { voci: VOCI, etichetta: 'Testo' },
  play: async ({ canvasElement }) => {
    const ammessi: string[] = []
    const ammessiConU: string[] = []
    for (let punto = 0; punto <= 0x10ffff; punto++) {
      // Le metà di una coppia surrogata non sono caratteri.
      if (punto >= 0xd800 && punto <= 0xdfff) continue
      const carattere = String.fromCodePoint(punto)
      if (/^[^\S\n]$/.test(carattere)) ammessi.push(carattere)
      if (/^[^\S\n]$/u.test(carattere)) ammessiConU.push(carattere)
    }
    expect(ammessi).toHaveLength(24)
    expect(ammessi.join('')).toBe(SPAZI_SEGNAPOSTO)
    expect(ammessiConU.join('')).toBe(SPAZI_SEGNAPOSTO)

    // Ognuno dei 24, attorno al nome, lascia lo stesso dato.
    for (const spazio of SPAZI_SEGNAPOSTO) {
      const scritto = `{{${spazio}famiglia.nome${spazio}}}`
      expect(new RegExp(`^(?:${FORMA_SEGNAPOSTO.source})$`, 'u').test(scritto)).toBe(true)
      expect(nomeSegnaposto(scritto)).toBe('famiglia.nome')
    }
    expect(nomeSegnaposto('{{famiglia.nome}}')).toBe('famiglia.nome')
    // L'a capo no, e nemmeno ciò che `strip()` di altri linguaggi toglie.
    for (const fuori of ['\n', '\u0085', '\u001c', '\u001f', '​']) {
      expect(nomeSegnaposto(`{{${fuori}famiglia.nome}}`)).not.toBe('famiglia.nome')
    }
    expect(nomeSegnaposto('{{famiglia nome}}')).toBeNull()
    expect(nomeSegnaposto('{{{famiglia.nome}}}')).toBeNull()
    expect(nomeSegnaposto('x {{famiglia.nome}}')).toBeNull()
    expect(nomeSegnaposto('{{}}')).toBeNull()

    // Nel campo: lo spazio di larghezza nulla attorno al nome dà la pillola
    // col valore, e il testo resta com'è scritto.
    const area = await areaDi(canvasElement)
    area.editor.commands.insertContent({ type: 'text', text: '{{﻿famiglia.nome }}' })
    await waitFor(() => expect(pilloleDi(area)).toEqual(['valore:Malta R4']))
    expect(valoreDi(area)).toBe('{{﻿famiglia.nome }}')
  },
}

function ElencoTenutoFuori() {
  const [montato, setMontato] = useState(true)
  const [gruppo, setGruppo] = useState<string | null>(null)
  const [ricerca, setRicerca] = useState('')
  return (
    <div className="flex max-w-4xl items-start gap-6">
      <div className="flex flex-col gap-3">
        <Button variant="outline" aria-expanded={montato} onClick={() => setMontato(!montato)}>
          Dati da citare
        </Button>
        <output data-prova="stato" className="text-sm text-muted-foreground">
          {`${gruppo ?? 'tutti'} | ${ricerca}`}
        </output>
      </div>
      {montato ? (
        <div data-prova="fuori" className="flex h-96 w-80 shrink-0 flex-col">
          <TestoSegnapostoElenco
            voci={VOCI_IN_PIU}
            gruppo={gruppo}
            onGruppo={setGruppo}
            ricerca={ricerca}
            onRicerca={setRicerca}
            className="flex-1"
          />
        </div>
      ) : null}
      {montato ? (
        <div data-prova="dentro" className="flex h-96 w-80 shrink-0 flex-col">
          <TestoSegnapostoElenco voci={VOCI_IN_PIU} className="flex-1" />
        </div>
      ) : null}
    </div>
  )
}

// Filtro e ricerca tenuti dalla pagina restano quando
// l'elenco viene tolto e rimesso; senza le prop li tiene l'elenco, come
// prima, e ripartono da capo.
export const ElencoTenutoFuoriProva: Story = {
  name: 'Elenco, stato tenuto fuori, prova',
  tags: ['!dev', '!autodocs'],
  args: { voci: VOCI_IN_PIU },
  render: () => <ElencoTenutoFuori />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const elencoDi = (quale: string) => canvasElement.querySelector<HTMLElement>(`[data-prova="${quale}"]`)!
    const righe = (quale: string) =>
      [...elencoDi(quale).querySelectorAll<HTMLElement>('button[draggable]')].map((r) => r.textContent)
    const stato = canvasElement.querySelector<HTMLElement>('[data-prova="stato"]')!

    for (const quale of ['fuori', 'dentro']) {
      const dati = within(elencoDi(quale))
      await userEvent.click(dati.getByRole('combobox'))
      await userEvent.click(await within(document.body).findByRole('option', { name: 'Prodotto' }))
      await waitFor(() => expect(righe(quale)).toHaveLength(3))
      await userEvent.type(dati.getByRole('searchbox'), 'lot')
      await waitFor(() => expect(righe(quale)).toEqual(['LottoIl dato non è compilato.']))
    }
    expect(stato).toHaveTextContent('Prodotto | lot')

    // Tolto e rimesso.
    const bottone = tela.getByRole('button', { name: 'Dati da citare' })
    await userEvent.click(bottone)
    await waitFor(() => expect(canvasElement.querySelector('[data-prova="fuori"]')).not.toBeInTheDocument())
    await userEvent.click(bottone)
    await waitFor(() => expect(elencoDi('fuori')).toBeInTheDocument())

    // Tenuto fuori: com'era.
    expect(within(elencoDi('fuori')).getByRole('combobox')).toHaveTextContent('Prodotto')
    expect(within(elencoDi('fuori')).getByRole('searchbox')).toHaveValue('lot')
    expect(righe('fuori')).toEqual(['LottoIl dato non è compilato.'])
    // Tenuto dentro: da capo, come prima.
    expect(within(elencoDi('dentro')).getByRole('combobox')).toHaveTextContent('Tutti i dati')
    expect(within(elencoDi('dentro')).getByRole('searchbox')).toHaveValue('')
    expect(righe('dentro')).toHaveLength(VOCI_IN_PIU.length)

    // «Tutti i dati» arriva alla pagina come `null`.
    await userEvent.clear(within(elencoDi('fuori')).getByRole('searchbox'))
    await userEvent.click(within(elencoDi('fuori')).getByRole('combobox'))
    await userEvent.click(await within(document.body).findByRole('option', { name: 'Tutti i dati' }))
    await waitFor(() => expect(stato).toHaveTextContent('tutti |'))
    expect(righe('fuori')).toHaveLength(VOCI_IN_PIU.length)
  },
}

// Lo stesso testo quando niente corrisponde, nell'elenco che si apre
// scrivendo e in quello dei dati.
export const VuotoProva: Story = {
  ...ConElencoDeiDati,
  name: 'Niente che corrisponda, prova',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const dati = canvasElement.querySelector<HTMLElement>('[data-slot="testo-segnaposto-dati"]')!
    await userEvent.type(within(dati).getByRole('searchbox'), 'zzz')
    await waitFor(() => expect(dati).toHaveTextContent('Nessun dato'))
    await userEvent.clear(within(dati).getByRole('searchbox'))
    await areaDi(canvasElement, '#dati-avvertenze')
    await scrivi('{{zzz')
    const popup = await aperto()
    expect(popup).toHaveTextContent('Nessun dato')
    expect(within(canvasElement).getAllByRole('status').some((s) => s.textContent === 'Nessun dato')).toBe(true)
    await userEvent.keyboard('[Escape]')
    await chiuso()
  },
}

const RILASCIO = '[data-slot="testo-segnaposto-rilascio"]'

// La posizione nel documento subito dopo un pezzo della prima riga.
function dopo(area: Area, pezzo: string) {
  const riga = area.editor.state.doc.firstChild!
  const testo = riga.textBetween(0, riga.content.size, undefined, '￼')
  return 1 + testo.indexOf(pezzo) + pezzo.length
}

// Il punto dello schermo di una posizione nel testo, un pixel dentro.
function puntoDi(area: Area, posizione: number) {
  const riga = area.editor.view.coordsAtPos(posizione)
  return { clientX: riga.left + 1, clientY: (riga.top + riga.bottom) / 2 }
}

// Lo spazio vuoto dentro il campo, sotto l'ultima riga e sopra la prima.
function sotto(area: Area) {
  const campo = area.getBoundingClientRect()
  return { clientX: campo.left + campo.width / 2, clientY: campo.bottom - 3 }
}
function sopra(area: Area) {
  const campo = area.getBoundingClientRect()
  return { clientX: campo.left + campo.width / 2, clientY: campo.top + 3 }
}

type Punto = { clientX: number; clientY: number }

// Un trascinamento come lo riceve l'editor: gli eventi, senza il puntatore.
// `daFuori` è un dato che arriva dall'elenco, col suo testo; `prendi` è una
// pillola presa da dentro il testo. L'immagine che segue il puntatore non
// entra in una schermata: si legge ciò che il blocco consegna al browser.
function daFuori(testo: string) {
  const carico = new DataTransfer()
  carico.setData('text/plain', testo)
  return carico
}
function prendi(pillola: HTMLElement) {
  const carico = new DataTransfer()
  const inVolo: string[] = []
  carico.setDragImage = (immagine, x, y) => {
    inVolo.push(`${immagine.getAttribute('data-slot')}:${immagine.textContent} a ${x},${y}`)
  }
  const dove = pillola.getBoundingClientRect()
  pillola.dispatchEvent(
    new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
      dataTransfer: carico,
      clientX: dove.left + 2,
      clientY: dove.top + dove.height / 2,
    })
  )
  return { carico, inVolo }
}
const evento = (tipo: string, carico: DataTransfer, punto: Punto) =>
  new DragEvent(tipo, { bubbles: true, cancelable: true, dataTransfer: carico, ...punto })
const passa = (area: Area, carico: DataTransfer, punto: Punto) => area.dispatchEvent(evento('dragover', carico, punto))
const rilascia = (area: Area, carico: DataTransfer, punto: Punto) => area.dispatchEvent(evento('drop', carico, punto))

const segnoDi = (area: Area) => area.closest('[data-slot="testo-segnaposto"]')!.querySelector<HTMLElement>(RILASCIO)

// Il segno è verticale e sta su una posizione del testo, alto quanto la riga.
function segnoSu(area: Area, posizione: number) {
  const segno = segnoDi(area)
  expect(segno).toBeInTheDocument()
  const dove = segno!.getBoundingClientRect()
  const riga = area.editor.view.coordsAtPos(posizione)
  expect(`verticale: ${dove.height > dove.width * 4}`).toBe('verticale: true')
  expect(Math.abs(dove.left + dove.width / 2 - riga.left)).toBeLessThan(1)
  expect(Math.abs(dove.top - riga.top)).toBeLessThan(1)
  expect(Math.abs(dove.height - (riga.bottom - riga.top))).toBeLessThan(1)
}

// Il cursore è subito dopo la pillola di un dato.
function cursoreDopo(area: Area, testo: string) {
  const { selection } = area.editor.state
  expect(selection.empty).toBe(true)
  expect(selection.$from.nodeBefore?.attrs.testo).toBe(testo)
}

const DA_SPOSTARE = 'Qui un dato {{famiglia.nome}} e altro testo.\nSeconda riga.'
const CON_LA_VIRGOLA = 'Malta conforme alla {{qualifica.norma}}, classe R4'
const riga = (testo: string) => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: testo }] }],
})

// Una pillola già nel testo, presa senza selezionarla: la segue la pillola
// piccola, sotto e a destra del puntatore; nello spazio vuoto il segno è
// verticale e sta dove la pillola cadrà; rilasciata, si sposta e non si
// duplica. Dove stava non restano due spazi, dove arriva prende quelli che
// servono, e un solo Annulla rimette tutto com'era.
export const SpostareUnaPillolaProva: Story = {
  name: 'Spostare una pillola, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  args: { voci: VOCI, etichetta: 'Testo', defaultValue: DA_SPOSTARE },
  play: async ({ canvasElement }) => {
    const area = await areaDi(canvasElement)
    const pillola = () => area.querySelector<HTMLElement>('[data-slot="testo-segnaposto-pillola"]')!
    const fine = () => area.editor.state.doc.content.size - 1
    await waitFor(() => expect(pilloleDi(area)).toEqual(['valore:Malta R4']))

    // Il cursore è in fondo: la pillola non è la selezione.
    expect(area.editor.state.selection.empty).toBe(true)
    let preso = prendi(pillola())
    expect(preso.inVolo).toEqual(['testo-segnaposto-in-volo:Malta R4 a 0,0'])
    await waitFor(() => expect(document.querySelector('[data-slot="testo-segnaposto-in-volo"]')).not.toBeInTheDocument())

    // Nello spazio vuoto sotto il testo: in coda all'ultima riga.
    passa(area, preso.carico, sotto(area))
    segnoSu(area, fine())
    rilascia(area, preso.carico, sotto(area))
    expect(pilloleDi(area)).toEqual(['valore:Malta R4'])
    expect(valoreDi(area)).toBe('Qui un dato e altro testo.\nSeconda riga. {{famiglia.nome}}')
    expect(segnoDi(area)).not.toBeInTheDocument()
    cursoreDopo(area, '{{famiglia.nome}}')
    expect(document.activeElement).toBe(area)

    // Un solo Annulla.
    area.editor.commands.undo()
    expect(valoreDi(area)).toBe(DA_SPOSTARE)
    expect(pilloleDi(area)).toEqual(['valore:Malta R4'])

    // Dentro il testo, fra una parola e lo spazio che la segue.
    preso = prendi(pillola())
    passa(area, preso.carico, puntoDi(area, dopo(area, 'altro')))
    segnoSu(area, dopo(area, 'altro'))
    rilascia(area, preso.carico, puntoDi(area, dopo(area, 'altro')))
    expect(valoreDi(area)).toBe('Qui un dato e altro {{famiglia.nome}} testo.\nSeconda riga.')
    expect(pilloleDi(area)).toEqual(['valore:Malta R4'])
    area.editor.commands.undo()
    expect(valoreDi(area)).toBe(DA_SPOSTARE)

    // Lasciata dov'era, resta com'era.
    preso = prendi(pillola())
    rilascia(area, preso.carico, puntoDi(area, dopo(area, 'dato ')))
    expect(valoreDi(area)).toBe(DA_SPOSTARE)
    expect(pilloleDi(area)).toEqual(['valore:Malta R4'])

    // Selezionata prima, e poi presa: lo stesso.
    area.editor.commands.setNodeSelection(dopo(area, 'dato '))
    preso = prendi(pillola())
    expect(preso.inVolo).toEqual(['testo-segnaposto-in-volo:Malta R4 a 0,0'])
    rilascia(area, preso.carico, sotto(area))
    expect(pilloleDi(area)).toEqual(['valore:Malta R4'])
    expect(valoreDi(area)).toBe('Qui un dato e altro testo.\nSeconda riga. {{famiglia.nome}}')

    // Dalla fine della riga a un altro punto: non resta uno spazio in coda.
    area.editor.commands.setContent(riga('Malta conforme alla {{qualifica.norma}}'))
    await waitFor(() => expect(pilloleDi(area)).toEqual(['valore:EN 1504-3']))
    preso = prendi(pillola())
    rilascia(area, preso.carico, puntoDi(area, dopo(area, 'Malta')))
    expect(valoreDi(area)).toBe('Malta {{qualifica.norma}} conforme alla')

    // Da davanti a una virgola: non resta uno spazio davanti alla virgola.
    area.editor.commands.setContent(riga(CON_LA_VIRGOLA))
    await waitFor(() => expect(pilloleDi(area)).toEqual(['valore:EN 1504-3']))
    preso = prendi(pillola())
    rilascia(area, preso.carico, sotto(area))
    expect(valoreDi(area)).toBe('Malta conforme alla, classe R4 {{qualifica.norma}}')
    area.editor.commands.undo()
    expect(valoreDi(area)).toBe(CON_LA_VIRGOLA)
    // E lasciata dov'era, prima o dopo di sé, resta com'era.
    preso = prendi(pillola())
    rilascia(area, preso.carico, puntoDi(area, dopo(area, 'alla ')))
    expect(valoreDi(area)).toBe(CON_LA_VIRGOLA)
    preso = prendi(pillola())
    const dopoLaPillola = pillola().getBoundingClientRect()
    rilascia(area, preso.carico, { clientX: dopoLaPillola.right - 2, clientY: dopoLaPillola.top + dopoLaPillola.height / 2 })
    expect(valoreDi(area)).toBe(CON_LA_VIRGOLA)

    // In coda a una riga che finisce col punto: lo spazio dopo il punto. E
    // dove stava, a inizio riga, non resta uno spazio.
    area.editor.commands.setContent(riga('{{qualifica.norma}} sul testo.'))
    await waitFor(() => expect(pilloleDi(area)).toEqual(['valore:EN 1504-3']))
    preso = prendi(pillola())
    rilascia(area, preso.carico, sotto(area))
    expect(valoreDi(area)).toBe('sul testo. {{qualifica.norma}}')
    cursoreDopo(area, '{{qualifica.norma}}')
    area.editor.commands.undo()
    expect(valoreDi(area)).toBe('{{qualifica.norma}} sul testo.')

    // Dopo una virgola, dentro la riga.
    area.editor.commands.setContent(riga('Malta, conforme alla {{qualifica.norma}}'))
    await waitFor(() => expect(pilloleDi(area)).toEqual(['valore:EN 1504-3']))
    preso = prendi(pillola())
    rilascia(area, preso.carico, puntoDi(area, dopo(area, 'Malta,')))
    expect(valoreDi(area)).toBe('Malta, {{qualifica.norma}} conforme alla')

    // Da dentro una parentesi: non resta uno spazio dopo la parentesi aperta.
    area.editor.commands.setContent(riga('Malta ({{qualifica.norma}} e altre) conforme'))
    await waitFor(() => expect(pilloleDi(area)).toEqual(['valore:EN 1504-3']))
    preso = prendi(pillola())
    rilascia(area, preso.carico, sotto(area))
    expect(valoreDi(area)).toBe('Malta (e altre) conforme {{qualifica.norma}}')

    // Attaccata a mano e lasciata dov'era, prima o dopo di sé: resta
    // attaccata.
    area.editor.commands.setContent(riga('Malta,{{qualifica.norma}}conforme'))
    await waitFor(() => expect(pilloleDi(area)).toEqual(['valore:EN 1504-3']))
    preso = prendi(pillola())
    rilascia(area, preso.carico, puntoDi(area, dopo(area, 'Malta,')))
    expect(valoreDi(area)).toBe('Malta,{{qualifica.norma}}conforme')
    cursoreDopo(area, '{{qualifica.norma}}')
    preso = prendi(pillola())
    rilascia(area, preso.carico, puntoDi(area, dopo(area, '￼')))
    expect(valoreDi(area)).toBe('Malta,{{qualifica.norma}}conforme')

    area.editor.commands.setContent(riga(CON_LA_VIRGOLA))
    await waitFor(() => expect(pilloleDi(area)).toEqual(['valore:EN 1504-3']))

    // Col tasto che copia (`Alt` su Mac, `Ctrl` altrove) la pillola resta
    // dov'era, e ce n'è una seconda.
    preso = prendi(pillola())
    area.dispatchEvent(
      new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: preso.carico,
        altKey: true,
        ctrlKey: true,
        ...sotto(area),
      })
    )
    expect(valoreDi(area)).toBe(`${CON_LA_VIRGOLA} {{qualifica.norma}}`)
  },
}

const DUE_RIGHE = 'Prima riga del testo\nSeconda riga'

// Il segno del punto di rilascio è sempre verticale, e sta dove il dato
// cadrà: nel testo sotto il puntatore, nello spazio vuoto sotto il testo in
// coda all'ultima riga, sopra il testo all'inizio della prima. Non c'è più
// un segno orizzontale largo quanto il campo.
export const SegnoDiRilascioProva: Story = {
  name: 'Segno di rilascio, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  args: { voci: VOCI, etichetta: 'Testo', defaultValue: DUE_RIGHE },
  play: async ({ canvasElement }) => {
    const area = await areaDi(canvasElement)
    const carico = daFuori('{{qualifica.norma}}')
    const fine = () => area.editor.state.doc.content.size - 1
    const orizzontale = () => document.querySelector('.prosemirror-dropcursor-block')

    // Sotto il testo.
    passa(area, carico, sotto(area))
    segnoSu(area, fine())
    expect(orizzontale()).not.toBeInTheDocument()
    rilascia(area, carico, sotto(area))
    await waitFor(() => expect(pilloleDi(area)).toEqual(['valore:EN 1504-3']))
    expect(valoreDi(area)).toBe(`${DUE_RIGHE} {{qualifica.norma}}`)
    expect(segnoDi(area)).not.toBeInTheDocument()
    area.editor.commands.undo()
    expect(valoreDi(area)).toBe(DUE_RIGHE)

    // Sopra il testo.
    passa(area, carico, sopra(area))
    segnoSu(area, 1)
    expect(orizzontale()).not.toBeInTheDocument()
    rilascia(area, carico, sopra(area))
    expect(valoreDi(area)).toBe(`{{qualifica.norma}} ${DUE_RIGHE}`)
    area.editor.commands.undo()
    expect(valoreDi(area)).toBe(DUE_RIGHE)

    // Nel testo.
    passa(area, carico, puntoDi(area, dopo(area, 'Prima')))
    segnoSu(area, dopo(area, 'Prima'))
    // Uscendo dal campo il segno si toglie.
    area.dispatchEvent(new DragEvent('dragleave', { bubbles: true, dataTransfer: carico }))
    expect(segnoDi(area)).not.toBeInTheDocument()
    passa(area, carico, puntoDi(area, dopo(area, 'Prima')))
    rilascia(area, carico, puntoDi(area, dopo(area, 'Prima')))
    expect(valoreDi(area)).toBe('Prima {{qualifica.norma}} riga del testo\nSeconda riga')
    expect(segnoDi(area)).not.toBeInTheDocument()
    area.editor.commands.undo()

    // Dopo una virgola e dopo un punto il dato prende lo spazio.
    area.editor.commands.setContent(riga('parola,'))
    rilascia(area, carico, sotto(area))
    expect(valoreDi(area)).toBe('parola, {{qualifica.norma}}')
    area.editor.commands.setContent(riga('Fine del testo. Poi altro'))
    rilascia(area, carico, puntoDi(area, dopo(area, 'testo.')))
    expect(valoreDi(area)).toBe('Fine del testo. {{qualifica.norma}} Poi altro')
    area.editor.commands.setContent(riga(DUE_RIGHE.replace('\n', ' ')))

    // Un testo che non è un dato, nello spazio vuoto: in coda alla riga,
    // com'è scritto.
    const parole = daFuori(', e basta')
    passa(area, parole, sotto(area))
    segnoSu(area, fine())
    rilascia(area, parole, sotto(area))
    expect(valoreDi(area)).toBe(`${DUE_RIGHE.replace('\n', ' ')}, e basta`)
  },
}

const N = '{{qualifica.norma}}'
const SPAZI: [scritto: string, atteso: string][] = [
  // Accanto a una lettera o a una cifra: lo spazio, dalla parte che serve.
  ['malta|', `malta ${N}`],
  ['|malta', `${N} malta`],
  ['mal|ta', `mal ${N} ta`],
  ['classe R4|', `classe R4 ${N}`],
  ['qualità|', `qualità ${N}`],
  // Accanto a un'altra pillola, prima e dopo.
  ['{{famiglia.nome}}|', `{{famiglia.nome}} ${N}`],
  ['|{{famiglia.nome}}', `${N} {{famiglia.nome}}`],
  // Uno spazio c'è già; l'inizio e la fine della riga.
  ['malta |', `malta ${N}`],
  ['malta | conforme', `malta ${N} conforme`],
  ['|', N],
  // Prima del dato: dopo un punto, una virgola e ogni altro segno, lo spazio.
  ['malta,|', `malta, ${N}`],
  ['testo.|', `testo. ${N}`],
  ['norma:|', `norma: ${N}`],
  ['fine;|', `fine; ${N}`],
  ['«a»|', `«a» ${N}`],
  ['(a)|', `(a) ${N}`],
  ['kg/|', `kg/ ${N}`],
  // Tranne dopo un segno che apre, e dopo l'apostrofo.
  ['(|', `(${N}`],
  ['[|', `[${N}`],
  ['«|', `«${N}`],
  ['“|', `“${N}`],
  ['‘|', `‘${N}`],
  ["l'|", `l'${N}`],
  ['l’|', `l’${N}`],
  // Dopo il dato: sempre, tranne prima di un segno che chiude o che segue.
  ['|(a)', `${N} (a)`],
  ['|«a»', `${N} «a»`],
  ['|%', `${N} %`],
  ['|, e poi', `${N}, e poi`],
  ['|.', `${N}.`],
  ['|; poi', `${N}; poi`],
  ['|: poi', `${N}: poi`],
  ['|!', `${N}!`],
  ['|?', `${N}?`],
  ['|…', `${N}…`],
  ['(|)', `(${N})`],
  ['[|]', `[${N}]`],
  ['«|»', `«${N}»`],
  ['“|”', `“${N}”`],
  ['‘|’', `‘${N}’`],
  ['norma: |.', `norma: ${N}.`],
  // Le virgolette dritte doppie si contano nella riga: la prima apre, la
  // seconda chiude.
  ['dice "|"', `dice "${N}"`],
  ['dice "ciao|"', `dice "ciao ${N}"`],
  ['dice "ciao"|', `dice "ciao" ${N}`],
  ['|"ciao"', `${N} "ciao"`],
  ['"a" e "|', `"a" e "${N}`],
  // L'apostrofo dritto tiene il dato attaccato da tutti e due i lati.
  ["'|'", `'${N}'`],
]

// Un testo di una riga, col cursore dov'è la barra.
async function conCursore(area: Area, scritto: string) {
  const [prima, poi] = scritto.split('|')
  area.editor.commands.setContent({
    type: 'doc',
    content: [{ type: 'paragraph', content: prima ? [{ type: 'text', text: prima }] : [] }],
  })
  area.editor.commands.focus('end')
  const cursore = area.editor.state.selection.from
  if (poi) area.editor.commands.insertContentAt(cursore, { type: 'text', text: poi })
  area.editor.commands.setTextSelection(cursore)
  // Ciò che segue è un passo di Annulla a sé, non il seguito di questo.
  area.editor.view.dispatch(closeHistory(area.editor.state.tr))
  await waitFor(() => expect(document.activeElement).toBe(area))
}

// Lo spazio accanto a un dato inserito si decide lato per lato, comunque il
// dato arrivi: dal bottone o dall'elenco accanto, dall'elenco che si apre
// scrivendo. Prima c'è sempre, tranne a inizio riga, dopo uno spazio, dopo un
// segno che apre e dopo l'apostrofo; dopo c'è sempre, tranne a fine riga,
// prima di uno spazio e prima di un segno che chiude o che segue. Il cursore
// resta subito dopo il dato, e un solo Annulla toglie il dato con i suoi
// spazi.
export const SpazioAccantoAlDatoProva: Story = {
  name: 'Spazio accanto al dato, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  args: { voci: VOCI, etichetta: 'Testo', onFocus: fn() },
  play: async ({ canvasElement, args }) => {
    const area = await areaDi(canvasElement)
    const campo = (args.onFocus as ReturnType<typeof fn>).mock.calls[0][0] as TestoSegnapostoRef

    // Dal bottone, o col clic nell'elenco accanto.
    for (const [scritto, atteso] of SPAZI) {
      await conCursore(area, scritto)
      campo.inserisci('{{qualifica.norma}}')
      expect(`${scritto} → ${valoreDi(area)}`).toBe(`${scritto} → ${atteso}`)
      cursoreDopo(area, '{{qualifica.norma}}')
      area.editor.commands.undo()
      expect(`${scritto} ← ${valoreDi(area)}`).toBe(`${scritto} ← ${scritto.replace('|', '')}`)
    }

    // Un testo che non è un dato entra com'è.
    await conCursore(area, 'mal|ta')
    campo.inserisci('(nota)')
    expect(valoreDi(area)).toBe('mal(nota)ta')

    // Dall'elenco che si apre scrivendo: il dato prende il posto del prefisso
    // e del filtro, e lo spazio va attorno.
    await conCursore(area, 'mal|ta')
    await scrivi('{{norm')
    await aperto()
    await waitFor(() => expect(opzioni()).toHaveLength(1))
    await userEvent.keyboard('[Enter]')
    await chiuso()
    expect(valoreDi(area)).toBe('mal {{qualifica.norma}} ta')
    cursoreDopo(area, '{{qualifica.norma}}')
    // Si continua a scrivere attaccati al dato: lo spazio sta dopo.
    await scrivi(',')
    expect(valoreDi(area)).toBe('mal {{qualifica.norma}}, ta')

    // Chi vuole il dato attaccato cancella lo spazio, e resta cancellato.
    await conCursore(area, 'malta|')
    campo.inserisci('{{qualifica.norma}}')
    area.editor.commands.deleteRange({ from: dopo(area, 'malta'), to: dopo(area, 'malta') + 1 })
    area.editor.commands.focus('end')
    await scrivi(' ok')
    expect(valoreDi(area)).toBe('malta{{qualifica.norma}} ok')
  },
}

const D = '{{famiglia.nome}}'

// Il cursore è subito dopo un pezzo di testo.
function cursoreDopoIlTesto(area: Area, pezzo: string) {
  const { selection } = area.editor.state
  expect(selection.empty).toBe(true)
  expect(selection.$from.parent.textBetween(0, selection.$from.parentOffset, undefined, '￼').endsWith(pezzo)).toBe(true)
}

// Una composizione come la vede l'editor: il testo entra mentre si compone, e
// alla fine il browser avvisa. Un carattere composto vero non si può mandare
// da qui.
function componi(area: Area, testo: string, numero: number) {
  area.editor.view.dispatch(area.editor.state.tr.insertText(testo).setMeta('composition', numero))
  const durante = valoreDi(area)
  area.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: testo }))
  return durante
}

// Più righe, col cursore all'inizio di una di loro.
async function conRighe(area: Area, righe: string[], riga = 1) {
  const magazzino = area.editor.storage.segnaposto
  area.editor.commands.setContent({
    type: 'doc',
    content: righe.map((testo) => {
      const pezzi: { type: string; text?: string; attrs?: { testo: string } }[] = []
      let da = 0
      for (const trovato of testo.matchAll(magazzino.riconosci)) {
        if (trovato.index > da) pezzi.push({ type: 'text', text: testo.slice(da, trovato.index) })
        pezzi.push({ type: 'segnaposto', attrs: { testo: trovato[0] } })
        da = trovato.index + trovato[0].length
      }
      if (da < testo.length) pezzi.push({ type: 'text', text: testo.slice(da) })
      return { type: 'paragraph', content: pezzi }
    }),
  })
  area.editor.commands.focus()
  let inizio = 1
  area.editor.state.doc.forEach((_nodo, scarto, indice) => {
    if (indice === riga) inizio = scarto + 1
  })
  area.editor.commands.setTextSelection(inizio)
  area.editor.view.dispatch(closeHistory(area.editor.state.tr))
  await waitFor(() => expect(document.activeElement).toBe(area))
}

// Unendo due righe, una pillola che si ritrova accanto al testo dell'altra
// prende lo spazio di un dato inserito lì. Un solo Annulla toglie lo spazio
// e lascia le righe unite. E un dato inserito su una selezione di più righe
// segue la regola come ogni altro.
export const UnireDueRigheProva: Story = {
  name: 'Unire due righe, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  args: { voci: VOCI, etichetta: 'Testo', onFocus: fn() },
  play: async ({ canvasElement, args }) => {
    const area = await areaDi(canvasElement)
    const campo = (args.onFocus as ReturnType<typeof fn>).mock.calls[0][0] as TestoSegnapostoRef
    const UNITE: [righe: string[], atteso: string][] = [
      // La seconda riga comincia con una pillola.
      [['parola', `${D} resto`], `parola ${D} resto`],
      [['norma:', D], `norma: ${D}`],
      [['testo.', D], `testo. ${D}`],
      [[N, D], `${N} ${D}`],
      [['(', D], `(${D}`],
      [["l'", D], `l'${D}`],
      [['parola ', D], `parola ${D}`],
      // La prima riga finisce con una pillola.
      [[D, 'parola'], `${D} parola`],
      [[D, '(nota)'], `${D} (nota)`],
      [[D, ', poi'], `${D}, poi`],
      [[D, '.'], `${D}.`],
      [[D, ' parola'], `${D} parola`],
      // Nessuna pillola dove le righe si uniscono: niente.
      [['parola', 'altra'], 'parolaaltra'],
      [[`${D} parola`, `altra ${N}`], `${D} parolaaltra ${N}`],
      [[D, ''], D],
      [['', D], D],
    ]
    for (const [righe, atteso] of UNITE) {
      // Con `Backspace` all'inizio della seconda riga.
      await conRighe(area, righe)
      await userEvent.keyboard('[Backspace]')
      expect(`${righe.join(' ⏎ ')} → ${valoreDi(area)}`).toBe(`${righe.join(' ⏎ ')} → ${atteso}`)
      // Il cursore resta dove le righe si sono unite, prima dello spazio.
      const { $from } = area.editor.state.selection
      expect($from.parentOffset).toBe(area.editor.state.doc.resolve(1).parent.content.size - righe[1].replace(D, '￼').replace(N, '￼').length - (atteso.length - righe.join('').length))
      if (atteso !== righe.join('')) {
        area.editor.commands.undo()
        expect(`${righe.join(' ⏎ ')} ← ${valoreDi(area)}`).toBe(`${righe.join(' ⏎ ')} ← ${righe.join('')}`)
        area.editor.commands.undo()
        expect(valoreDi(area)).toBe(righe.join('\n'))
      }
      // Con `Canc` alla fine della prima.
      await conRighe(area, righe)
      area.editor.commands.setTextSelection(area.editor.state.doc.firstChild!.content.size + 1)
      await userEvent.keyboard('[Delete]')
      expect(`${righe.join(' ⏎ ')} ⇒ ${valoreDi(area)}`).toBe(`${righe.join(' ⏎ ')} ⇒ ${atteso}`)
    }

    // Una selezione a cavallo di due righe, cancellata: lo stesso.
    await conRighe(area, [`uno ${D} e`, `poi due`])
    area.editor.commands.setTextSelection({ from: 6, to: 13 })
    await userEvent.keyboard('[Backspace]')
    expect(valoreDi(area)).toBe(`uno ${D} due`)
    await conRighe(area, [`uno ${D} e`, `poi, due`])
    area.editor.commands.setTextSelection({ from: 6, to: 13 })
    await userEvent.keyboard('[Backspace]')
    expect(valoreDi(area)).toBe(`uno ${D}, due`)

    // Sulla stessa riga, chi cancella ciò che sta fra pillola e parola ha
    // cancellato anche gli spazi: restano cancellati.
    await conRighe(area, [`${D} e parola`], 0)
    area.editor.commands.setTextSelection({ from: 2, to: 5 })
    await userEvent.keyboard('[Backspace]')
    expect(valoreDi(area)).toBe(`${D}parola`)

    // Un dato inserito su una selezione di più righe.
    await conRighe(area, ['prima', `${D} seconda`])
    area.editor.commands.setTextSelection({ from: 3, to: 9 })
    campo.inserisci(N)
    expect(valoreDi(area)).toBe(`pr ${N} seconda`)
    cursoreDopo(area, N)
    area.editor.commands.undo()
    expect(valoreDi(area)).toBe(`prima\n${D} seconda`)
    await conRighe(area, ['norma (', 'vecchia) vale'])
    area.editor.commands.setTextSelection({ from: 8, to: 17 })
    campo.inserisci(N)
    expect(valoreDi(area)).toBe(`norma (${N}) vale`)
  },
}

// Una lettera o una cifra digitata subito dopo una pillola prende lo spazio
// prima di sé, e subito prima di una pillola lo prende dopo. La
// punteggiatura no. Un solo Annulla toglie lo spazio e lascia il carattere;
// lo spazio cancellato a mano resta cancellato. Lo stesso per ciò che si
// incolla, e per un carattere composto quando la composizione è finita.
export const ScrivereAccantoAUnaPillolaProva: Story = {
  name: 'Scrivere accanto a una pillola, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  args: { voci: VOCI, etichetta: 'Testo', onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const area = await areaDi(canvasElement)
    const annulla = () => area.editor.commands.undo()
    // Il carattere prima del cursore, come con `Backspace`.
    const cancella = () => {
      const { head } = area.editor.state.selection
      area.editor.commands.deleteRange({ from: head - 1, to: head })
    }

    // Dopo una pillola: una lettera, una cifra, una lettera accentata.
    for (const carattere of ['p', 'P', '4', 'è']) {
      await conCursore(area, `${D}|`)
      await scrivi(carattere)
      expect(`${carattere} → ${valoreDi(area)}`).toBe(`${carattere} → ${D} ${carattere}`)
      cursoreDopoIlTesto(area, carattere)
      // L'app riceve il testo una volta sola, già con lo spazio.
      expect(args.onChange).toHaveBeenLastCalledWith(`${D} ${carattere}`)
      expect(args.onChange).not.toHaveBeenCalledWith(`${D}${carattere}`)
      // Un solo Annulla: via lo spazio, resta il carattere.
      annulla()
      expect(`${carattere} ← ${valoreDi(area)}`).toBe(`${carattere} ← ${D}${carattere}`)
      cursoreDopoIlTesto(area, carattere)
      // Chi continua a scrivere resta attaccato: lo ha scelto.
      await scrivi('x')
      expect(valoreDi(area)).toBe(`${D}${carattere}x`)
    }

    // Si continua a scrivere: lo spazio è uno, e sta prima della parola.
    await conCursore(area, `${D}|`)
    await scrivi('prosegue il testo')
    expect(valoreDi(area)).toBe(`${D} prosegue il testo`)
    // Il primo Annulla toglie ciò che si è scritto dopo, non lo spazio. Una
    // lettera sola dopo lo spazio: più lettere stanno in un passo solo se fra
    // l'una e l'altra passa meno di mezzo secondo, e su una macchina lenta
    // non è detto.
    await conCursore(area, `${D}|`)
    await scrivi('pr')
    expect(valoreDi(area)).toBe(`${D} pr`)
    annulla()
    expect(valoreDi(area)).toBe(`${D} p`)
    annulla()
    expect(valoreDi(area)).toBe(`${D}p`)

    // La punteggiatura si attacca al dato, e così ciò che non è lettera né
    // cifra.
    for (const segno of [',', '.', ';', ':', '!', '?', ')', ']', '»', '”', '’', '%', '-', ' ']) {
      await conCursore(area, `${D}|`)
      await scrivi(segno)
      expect(`«${segno}» → ${valoreDi(area)}`).toBe(`«${segno}» → ${D}${segno}`)
    }

    // Lo spazio lo mette chi scrive: non se ne aggiunge un altro.
    await conCursore(area, `${D}|`)
    await scrivi(' segue')
    expect(valoreDi(area)).toBe(`${D} segue`)

    // Prima di una pillola: lo spazio va dopo, e il cursore resta dopo la
    // lettera. La parola continua attaccata a sé stessa.
    await conCursore(area, `|${D}`)
    await scrivi('T')
    expect(valoreDi(area)).toBe(`T ${D}`)
    cursoreDopoIlTesto(area, 'T')
    await scrivi('ipo')
    expect(valoreDi(area)).toBe(`Tipo ${D}`)
    await conCursore(area, `|${D}`)
    await scrivi('7')
    annulla()
    expect(valoreDi(area)).toBe(`7${D}`)
    for (const segno of ['(', '[', '«', '“', "'", ' ']) {
      await conCursore(area, `|${D}`)
      await scrivi(segno)
      expect(`«${segno}» → ${valoreDi(area)}`).toBe(`«${segno}» → ${segno}${D}`)
    }

    // Fra due pillole attaccate: lo spazio da tutti e due i lati, e un solo
    // Annulla li toglie insieme.
    await conCursore(area, `${D}|${N}`)
    await scrivi('e')
    expect(valoreDi(area)).toBe(`${D} e ${N}`)
    cursoreDopoIlTesto(area, 'e')
    annulla()
    expect(valoreDi(area)).toBe(`${D}e${N}`)

    // Lontano da una pillola non succede niente.
    await conCursore(area, `${D} e|`)
    await scrivi('poi')
    expect(valoreDi(area)).toBe(`${D} epoi`)

    // Lo spazio cancellato a mano resta cancellato, anche continuando a
    // scrivere e uscendo dal campo.
    await conCursore(area, `${D}|`)
    await scrivi('p')
    area.editor.commands.deleteRange({ from: 2, to: 3 })
    expect(valoreDi(area)).toBe(`${D}p`)
    area.editor.commands.focus('end')
    await scrivi('oi')
    expect(valoreDi(area)).toBe(`${D}poi`)
    area.blur()
    await waitFor(() => expect(document.activeElement).not.toBe(area))
    expect(valoreDi(area)).toBe(`${D}poi`)
    area.editor.commands.focus('end')

    // Lo spazio messo per una lettera se ne va con lei: cancellata la
    // lettera, non resta uno spazio che nessuno ha scritto.
    await conCursore(area, `${D}|`)
    await scrivi('p')
    cancella()
    expect(valoreDi(area)).toBe(D)
    await scrivi(',')
    expect(valoreDi(area)).toBe(`${D},`)
    // L'Annulla rimette la lettera col suo spazio.
    await conCursore(area, `${D}|`)
    await scrivi('p')
    cancella()
    annulla()
    expect(valoreDi(area)).toBe(`${D} p`)
    await conCursore(area, `${D}|`)
    await scrivi('per')
    cancella()
    cancella()
    cancella()
    expect(valoreDi(area)).toBe(D)
    await conCursore(area, `|${D}`)
    await scrivi('T')
    cancella()
    expect(valoreDi(area)).toBe(D)
    await conCursore(area, `${D}| resto`)
    await scrivi('p')
    cancella()
    expect(valoreDi(area)).toBe(`${D} resto`)
    await conCursore(area, `${D}|${N}`)
    await scrivi('e')
    cancella()
    expect(valoreDi(area)).toBe(`${D}${N}`)
    // Sostituita con un segno: lo stesso.
    await conCursore(area, `${D}|`)
    await scrivi('p')
    area.editor.commands.setTextSelection({ from: 3, to: 4 })
    await scrivi(',')
    expect(valoreDi(area)).toBe(`${D},`)
    // Sostituita con un'altra lettera, o tolta la prima lettera di una
    // parola: lo spazio serve ancora, e resta.
    await conCursore(area, `${D}|`)
    await scrivi('p')
    area.editor.commands.setTextSelection({ from: 3, to: 4 })
    await scrivi('q')
    expect(valoreDi(area)).toBe(`${D} q`)
    await conCursore(area, `${D}|`)
    await scrivi('prosegue')
    area.editor.commands.deleteRange({ from: 3, to: 4 })
    expect(valoreDi(area)).toBe(`${D} rosegue`)
    // Lo spazio scritto a mano non si tocca.
    await conCursore(area, `${D}|`)
    await scrivi(' p')
    cancella()
    expect(valoreDi(area)).toBe(`${D} `)
    // Lo stesso per ciò che si è incollato.
    await conCursore(area, `${D}|`)
    await userEvent.paste('ab')
    area.editor.commands.deleteRange({ from: 3, to: 5 })
    expect(valoreDi(area)).toBe(D)

    // Con una pillola selezionata, la lettera la sostituisce e basta.
    // La pillola si seleziona e il carattere entra nello stesso istante, per
    // la strada del testo digitato: la selezione di un nodo, riletta dal
    // browser un attimo dopo, in una prova può tornare un cursore.
    await conCursore(area, `malta ${D}|`)
    area.editor.commands.setNodeSelection(7)
    const { from, to } = area.editor.state.selection
    const vista = area.editor.view
    vista.someProp('handleTextInput', (gestore) => gestore(vista, from, to, 'x', () => vista.state.tr.insertText('x')))
    expect(valoreDi(area)).toBe('malta x')

    // Incollare: ai due capi di ciò che si incolla vale la stessa regola, e
    // un solo Annulla toglie gli spazi e lascia il testo incollato.
    await conCursore(area, `${D}|`)
    await userEvent.paste('conforme alla norma')
    expect(valoreDi(area)).toBe(`${D} conforme alla norma`)
    cursoreDopoIlTesto(area, 'norma')
    annulla()
    expect(valoreDi(area)).toBe(`${D}conforme alla norma`)
    annulla()
    expect(valoreDi(area)).toBe(D)
    await conCursore(area, `|${D}`)
    await userEvent.paste('Tipo')
    expect(valoreDi(area)).toBe(`Tipo ${D}`)
    await conCursore(area, `${D}|${N}`)
    await userEvent.paste('e la')
    expect(valoreDi(area)).toBe(`${D} e la ${N}`)
    await conCursore(area, `${D}|`)
    await userEvent.paste(', poi altro')
    expect(valoreDi(area)).toBe(`${D}, poi altro`)
    // Un dato incollato, da solo o in testa o in coda a un testo, prende gli
    // spazi di un dato inserito.
    await conCursore(area, 'malta,|conforme')
    await userEvent.paste(N)
    await waitFor(() => expect(pilloleDi(area)).toEqual(['valore:EN 1504-3']))
    expect(valoreDi(area)).toBe(`malta, ${N} conforme`)
    await conCursore(area, 'malta|.')
    await userEvent.paste(`conforme alla ${N}`)
    expect(valoreDi(area)).toBe(`maltaconforme alla ${N}.`)
    await conCursore(area, '(|)')
    await userEvent.paste(N)
    expect(valoreDi(area)).toBe(`(${N})`)

    // Un segnaposto scritto a mano per intero resta dove lo si scrive.
    await conCursore(area, 'malta|')
    await scrivi(N)
    await waitFor(() => expect(pilloleDi(area)).toEqual(['valore:EN 1504-3']))
    expect(valoreDi(area)).toBe(`malta${N}`)
    // Le graffe hanno aperto l'elenco: si aspetta che si sia chiuso.
    await chiuso()

    // Un carattere composto: mentre si compone il testo attorno resta fermo,
    // e lo spazio arriva a composizione finita. Un solo Annulla lo toglie.
    await conCursore(area, `${D}|`)
    expect(componi(area, 'é', 71)).toBe(`${D}é`)
    await waitFor(() => expect(valoreDi(area)).toBe(`${D} é`))
    cursoreDopoIlTesto(area, 'é')
    annulla()
    expect(valoreDi(area)).toBe(`${D}é`)
    await conCursore(area, `|${D}`)
    componi(area, 'Ü', 72)
    await waitFor(() => expect(valoreDi(area)).toBe(`Ü ${D}`))
    // Una parola composta per intero, come fa una tastiera a schermo.
    await conCursore(area, `${D}|`)
    area.editor.view.dispatch(area.editor.state.tr.insertText('pro').setMeta('composition', 73))
    expect(componi(area, 'segue', 73)).toBe(`${D}prosegue`)
    await waitFor(() => expect(valoreDi(area)).toBe(`${D} prosegue`))
    // Un segno composto non prende lo spazio.
    await conCursore(area, `${D}|`)
    componi(area, '…', 74)
    await new Promise((fatto) => setTimeout(fatto, 50))
    expect(valoreDi(area)).toBe(`${D}…`)
  },
}

const MANIGLIA = '[data-slot="testo-segnaposto-maniglia"]'

// Le righe che l'area mostra: l'altezza interna, tolti i margini, in righe.
function righeDi(area: HTMLElement) {
  const stile = getComputedStyle(area)
  const interni = parseFloat(stile.paddingTop) + parseFloat(stile.paddingBottom)
  return (area.clientHeight - interni) / parseFloat(stile.lineHeight)
}

// L'altezza di partenza in righe, la maniglia col puntatore e da tastiera, e
// il campo che cresce col testo senza mai scorrere dentro.
export const AltezzaProva: Story = {
  name: 'Altezza, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  args: { voci: VOCI, etichetta: 'Testo', righe: 8, ridimensionabile: true, defaultValue: 'Una riga.' },
  play: async ({ canvasElement }) => {
    // Senza dare il fuoco al testo: l'editor lo prende un fotogramma dopo, e
    // lo toglierebbe alla maniglia.
    const area = await waitFor(() => {
      const el = canvasElement.querySelector<Area>(AREA)
      expect(el?.editor).toBeTruthy()
      return el as Area
    })
    const maniglia = canvasElement.querySelector<HTMLElement>(MANIGLIA)!

    // Otto righe di partenza, con una riga sola di testo.
    expect(righeDi(area)).toBeCloseTo(8, 1)
    expect(maniglia).toHaveAttribute('role', 'separator')
    expect(maniglia).toHaveAttribute('aria-valuenow', '8')
    expect(maniglia).toHaveAttribute('aria-valuemin', '8')

    // Da tastiera: una riga alla volta, mai sotto la partenza, e `Inizio`.
    maniglia.focus()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await waitFor(() => expect(righeDi(area)).toBeCloseTo(10, 1))
    expect(maniglia).toHaveAttribute('aria-valuenow', '10')
    await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}')
    await waitFor(() => expect(righeDi(area)).toBeCloseTo(8, 1))
    await userEvent.keyboard('{ArrowDown}{Home}')
    await waitFor(() => expect(righeDi(area)).toBeCloseTo(8, 1))

    // Col puntatore: tre righe più in basso, e poi su oltre la partenza.
    const riga = parseFloat(getComputedStyle(area).lineHeight)
    const y = maniglia.getBoundingClientRect().top + 2
    const puntatore = (tipo: string, dove: number) =>
      maniglia.dispatchEvent(new PointerEvent(tipo, { bubbles: true, cancelable: true, button: 0, pointerId: 1, clientY: dove }))
    puntatore('pointerdown', y)
    puntatore('pointermove', y + riga * 3)
    await waitFor(() => expect(righeDi(area)).toBeCloseTo(11, 1))
    puntatore('pointermove', y - riga * 20)
    await waitFor(() => expect(righeDi(area)).toBeCloseTo(8, 1))
    puntatore('pointermove', y + riga * 2)
    puntatore('pointerup', y + riga * 2)
    await waitFor(() => expect(righeDi(area)).toBeCloseTo(10, 1))
    // A tasto rilasciato il puntatore non muove più niente.
    puntatore('pointermove', y + riga * 6)
    await new Promise((fatto) => setTimeout(fatto, 50))
    expect(righeDi(area)).toBeCloseTo(10, 1)

    // L'altezza scelta è un minimo: quattordici righe di testo la superano,
    // e l'area non scorre dentro.
    area.editor.commands.setContent({
      type: 'doc',
      content: Array.from({ length: 14 }, (_, n) => ({ type: 'paragraph', content: [{ type: 'text', text: `Riga ${n + 1}` }] })),
    })
    await waitFor(() => expect(righeDi(area)).toBeCloseTo(14, 1))
    expect(area.scrollHeight).toBeLessThanOrEqual(area.clientHeight)
    expect(getComputedStyle(area).overflowY).toBe('visible')
    // Tolto il testo torna all'altezza scelta, non a quella di partenza.
    area.editor.commands.setContent('')
    await waitFor(() => expect(righeDi(area)).toBeCloseTo(10, 1))
  },
}

function DueCampi({ voci, onPronto }: { voci: readonly VoceSegnaposto[]; onPronto: (quale: string, campo: TestoSegnapostoRef) => void }) {
  const visti = useRef<string[]>([])
  const secondo = useRef<TestoSegnapostoRef | null>(null)
  return (
    <FieldGroup className="max-w-2xl">
      <TestoSegnaposto
        etichetta="Primo"
        voci={voci}
        defaultValue="Malta conforme"
        // Ciò che il `ref` riceve, e se in quel momento l'area c'è.
        ref={(campo) => {
          visti.current.push(`${campo ? 'campo' : 'null'}:${document.querySelector('[aria-label="Primo"]') ? 'area' : 'niente'}`)
        }}
        onPronto={(campo) => {
          onPronto('primo', campo)
          campo.focus('fine')
        }}
      />
      <TestoSegnaposto etichetta="Secondo" ref={secondo} voci={voci} defaultValue="Malta conforme alla" onPronto={(campo) => onPronto('secondo', campo)} />
      <Button variant="outline" className="self-start" onClick={() => secondo.current?.inserisci('{{qualifica.norma}}')}>
        Inserisci nel secondo
      </Button>
      <output data-testid="visti">{visti.current.join(' ')}</output>
    </FieldGroup>
  )
}

// `ref` nullo finché l'editor non c'è, `onPronto`, `focus('fine')`, e
// `inserisci` in un campo in cui il cursore non è mai stato.
export const FuocoEInserisciProva: Story = {
  name: 'Fuoco e inserisci, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  args: { voci: VOCI },
  render: (args) => {
    const pronto = fn()
    return (
      <div data-pronto ref={(el) => void (el && Object.assign(el, { pronto }))}>
        <DueCampi voci={args.voci} onPronto={pronto} />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const primo = await waitFor(() => {
      const el = canvasElement.querySelector<Area>('[aria-label="Primo"]')
      expect(el?.editor).toBeTruthy()
      return el as Area
    })
    const secondo = canvasElement.querySelector<Area>('[aria-label="Secondo"]')!
    const pronto = (canvasElement.querySelector('[data-pronto]') as HTMLElement & { pronto: ReturnType<typeof fn> }).pronto

    // `onPronto` è arrivato per tutti e due, con la maniglia vera.
    await waitFor(() => expect(pronto.mock.calls.map(([quale]) => quale)).toEqual(expect.arrayContaining(['primo', 'secondo'])))
    for (const [, campo] of pronto.mock.calls) expect(typeof (campo as TestoSegnapostoRef).inserisci).toBe('function')

    // `focus('fine')` chiamato dentro `onPronto` ha avuto effetto: il fuoco è
    // nel primo campo e il cursore in fondo al testo.
    await waitFor(() => expect(document.activeElement).toBe(primo))
    expect(primo.editor.state.selection.from).toBe(primo.editor.state.doc.content.size - 1)

    // Senza argomento il cursore resta dov'era; `'inizio'` lo porta in testa.
    const campoPrimo = pronto.mock.calls.findLast(([quale]) => quale === 'primo')![1] as TestoSegnapostoRef
    primo.editor.commands.setTextSelection(4)
    ;(document.activeElement as HTMLElement).blur()
    campoPrimo.focus()
    await waitFor(() => expect(document.activeElement).toBe(primo))
    expect(primo.editor.state.selection.from).toBe(4)
    campoPrimo.focus('inizio')
    await waitFor(() => expect(primo.editor.state.selection.from).toBe(1))
    campoPrimo.focus('fine')
    await waitFor(() => expect(primo.editor.state.selection.from).toBe(primo.editor.state.doc.content.size - 1))

    // Nel secondo campo il cursore non è mai stato: il dato va in fondo, con
    // lo spazio che gli serve, e non in testa.
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Inserisci nel secondo' }))
    await waitFor(() => expect(valoreDi(secondo)).toBe('Malta conforme alla {{qualifica.norma}}'))
    // Ora il cursore c'è stato: il dato successivo va dov'è il cursore.
    secondo.editor.commands.setTextSelection(1)
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Inserisci nel secondo' }))
    await waitFor(() => expect(valoreDi(secondo)).toBe('{{qualifica.norma}} Malta conforme alla {{qualifica.norma}}'))

    // Il `ref` non ha mai ricevuto una maniglia senza che l'area ci fosse.
    const visti = within(canvasElement).getByTestId('visti')
    await userEvent.click(visti)
    expect(visti.textContent).not.toContain('campo:niente')
  },
}

// Un campo solo, tre testi: il campo non si rimonta, e ogni testo tiene il
// suo cursore e il suo annulla.
export const UnTestoAllaVoltaProva: Story = {
  name: 'Un testo alla volta, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  args: { voci: VOCI },
  render: (args) => <UnoAllaVolta voci={args.voci} />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const area = await areaDi(canvasElement)
    const editor = area.editor
    const scegli = (nome: string) => userEvent.click(tela.getByRole('button', { name: nome }))
    const annulla = () => area.editor.commands.undo()
    const [descrizione, uso] = TESTI.map((t) => t.testo)

    // Si scrive nel primo testo, poi si passa al secondo.
    await scrivi(' Aggiunta.')
    expect(valoreDi(area)).toBe(`${descrizione} Aggiunta.`)
    await scegli("Destinazione d'uso")
    await waitFor(() => expect(valoreDi(area)).toBe(uso))
    // Il campo è lo stesso: stessa area, stesso editor, e ha ancora il fuoco.
    expect(canvasElement.querySelector(AREA)).toBe(area)
    expect(area.editor).toBe(editor)
    await waitFor(() => expect(document.activeElement).toBe(area))
    // Su un testo mai usato il cursore parte dal fondo.
    expect(editor.state.selection.from).toBe(editor.state.doc.content.size - 1)

    // L'annulla del secondo testo non tocca il primo: qui non c'è niente da
    // annullare, e il testo resta il suo.
    annulla()
    expect(valoreDi(area)).toBe(uso)
    await scrivi(' Prova.')
    expect(valoreDi(area)).toBe(`${uso} Prova.`)
    annulla()
    expect(valoreDi(area)).toBe(uso)
    annulla()
    expect(valoreDi(area)).toBe(uso)
    await scrivi(' Di nuovo.')

    // Tornando al primo, ciò che ci si era scritto si annulla ancora, e le
    // pillole ci sono.
    await scegli('Descrizione')
    await waitFor(() => expect(valoreDi(area)).toBe(`${descrizione} Aggiunta.`))
    expect(pilloleDi(area)).toEqual(['valore:Malta R4', 'valore:EN 1504-3'])
    annulla()
    expect(valoreDi(area)).toBe(descrizione)
    // E il secondo ha tenuto il suo.
    await scegli("Destinazione d'uso")
    await waitFor(() => expect(valoreDi(area)).toBe(`${uso} Di nuovo.`))
    annulla()
    expect(valoreDi(area)).toBe(uso)

    // Il terzo testo è vuoto e mai usato: un dato inserito da fuori ci entra.
    await scegli('Avvertenze')
    await waitFor(() => expect(valoreDi(area)).toBe(''))
    await userEvent.click(tela.getByRole('button', { name: 'Inserisci la classe' }))
    await waitFor(() => expect(valoreDi(area)).toBe('{{qualifica.classe}}'))
    // In un testo mai usato che ha già del testo, il dato va in fondo.
    await scegli('Descrizione')
    await waitFor(() => expect(valoreDi(area)).toBe(descrizione))
    ;(document.activeElement as HTMLElement).blur()
    await userEvent.click(tela.getByRole('button', { name: 'Inserisci la classe' }))
    await waitFor(() => expect(valoreDi(area)).toBe(`${descrizione.slice(0, -1)}. {{qualifica.classe}}`))
  },
}
