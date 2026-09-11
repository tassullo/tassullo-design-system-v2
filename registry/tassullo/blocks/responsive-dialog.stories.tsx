import type { Meta, StoryObj } from '@storybook/react-vite'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { apriCol } from '@/prove/apri'
import { FormField } from '@/registry/tassullo/blocks/form-field'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from '@/registry/tassullo/blocks/responsive-dialog'
import { Button } from '@/registry/tassullo/ui/button'
import { FieldGroup } from '@/registry/tassullo/ui/field'
import { Input } from '@/registry/tassullo/ui/input'
import { Textarea } from '@/registry/tassullo/ui/textarea'

/**
 * **Una chiamata sola**: sulla scrivania è un dialogo, sul telefono è un
 * cassetto che sale dal basso. Nessuna `if` nella pagina, e il contenuto scritto
 * in un posto solo.
 *
 * ```tsx
 * <ResponsiveDialog>
 *   <ResponsiveDialogTrigger render={<Button>Modifica</Button>} />
 *   <ResponsiveDialogContent>
 *     <ResponsiveDialogHeader>
 *       <ResponsiveDialogTitle>Modifica prodotto</ResponsiveDialogTitle>
 *       <ResponsiveDialogDescription>…</ResponsiveDialogDescription>
 *     </ResponsiveDialogHeader>
 *     <ResponsiveDialogBody><ModuloProdotto /></ResponsiveDialogBody>
 *     <ResponsiveDialogFooter>
 *       <ResponsiveDialogClose render={<Button variant="outline">Annulla</Button>} />
 *       <Button type="submit">Salva</Button>
 *     </ResponsiveDialogFooter>
 *   </ResponsiveDialogContent>
 * </ResponsiveDialog>
 * ```
 *
 * ## Il pattern è di shadcn; qui è impacchettato
 *
 * shadcn lo documenta nell&apos;esempio `drawer-dialog`, e la sua forma è
 * `const isDesktop = useMediaQuery('(min-width: 768px)')`, poi `if (isDesktop)
 * return <Dialog>…</Dialog>`, poi `return <Drawer>…</Drawer>`. È corretto, e non
 * è riusabile: **duplica il contenuto** — titolo, descrizione, corpo, piedini,
 * due volte — quindi ogni modifica va fatta in due posti e la seconda si
 * dimentica; e vive nella pagina, quindi ogni pagina di ogni app si riscrive la
 * stessa `if`. Con undici pagine e tre applicazioni la soglia finisce scritta in
 * trenta punti, e il giorno in cui va spostata si sposta in ventinove.
 *
 * Qui la scelta la fa un **contesto**: la radice monta `Dialog` o `Drawer` e lo
 * dice ai figli, che scelgono la propria controparte. I figli si scrivono una
 * volta sola.
 *
 * ## Perché qui la soglia è sulla viewport — e non è una smentita
 *
 * `docs/DECISIONI.md` §31 dice il contrario per il guscio, per la fascia e per
 * la tabella: le soglie guardano l&apos;**elemento**, perché sotto i 768px la
 * colonna esce dal DOM e lo schermo che si allarga di 1px restringe l&apos;area
 * utile di 255. Quel ragionamento vale per ciò che sta **dentro** il guscio.
 *
 * Un dialogo non ci sta dentro: è reso in un **portale** appeso alla radice del
 * documento, `position: fixed`, fuori dal flusso. La colonna non gli toglie
 * niente, e il suo contenitore *è* la viewport — la discontinuità che rendeva
 * sbagliata la media query negli altri tre casi qui non esiste. Una container
 * query, per di più, non avrebbe su cosa appoggiarsi: il contenitore da
 * interrogare non è ancora montato nel momento in cui si decide.
 *
 * E c&apos;è una ragione di sostanza sopra quella tecnica: la scelta fra dialogo
 * e cassetto non è «quanto spazio ho», è «che forma ha il dispositivo». Si è
 * valutato di leggere il **puntatore** (`(pointer: coarse)`), che è più vicino
 * alla domanda vera, ma sbaglia i due casi che contano per noi: il portatile col
 * touch screen in cantiere, che riceverebbe un cassetto su quindici pollici, e
 * il telefono collegato a una tastiera. La larghezza è un&apos;approssimazione,
 * ed è quella che shadcn documenta.
 *
 * ## La soglia non è scritta nel blocco
 *
 * È `useIsMobile()`, l&apos;hook che shadcn installa insieme a `sidebar` e che il
 * registry ha già, a **768px**. Non se ne scrive un secondo: è la prima domanda
 * della scala di `CLAUDE.md` §4bis — quello che serve, shadcn ce l&apos;ha già?
 *
 * Il vantaggio non è risparmiare dieci righe. È che **il dialogo cambia forma
 * allo stesso pixel in cui la cambia il guscio**: sotto i 768 la colonna esce dal
 * DOM e diventa un pannello che scorre da un lato, e nello stesso momento il
 * dialogo diventa un cassetto. Due soglie in due posti sarebbero rimaste uguali
 * per un po&apos; e poi si sarebbero staccate, e un&apos;interfaccia che cambia
 * grammatica a 40px di distanza si legge come un guasto. Per la stessa ragione
 * **non c&apos;è una prop `soglia`**: una soglia che ogni app può spostare è una
 * soglia che in tre app vale tre numeri.
 *
 * L&apos;hook di shadcn ha un difetto noto — legge `matchMedia` in un `useEffect`
 * che chiama `setState`, quindi il primo render torna sempre «scrivania» e il
 * valore vero arriva un fotogramma dopo. Qui non morde, perché il primo
 * fotogramma è quello del pannello **chiuso**: non c&apos;è niente da vedere.
 * Morde in un caso solo, un dialogo già aperto al montaggio, e lì il rimedio non
 * è una copia locale dell&apos;hook — è correggerlo in `use-mobile.ts`, dove
 * `sidebar` ne beneficia insieme a noi.
 *
 * ## Il prezzo, dichiarato
 *
 * Attraversare la soglia con il dialogo **aperto** smonta un albero e ne monta
 * un altro — `Dialog` e `Drawer` sono due componenti diversi — e ciò che è stato
 * scritto in un campo non controllato si perde. Non è aggirabile senza tenere lo
 * stato del modulo fuori dal dialogo, che è comunque la forma giusta: con
 * react-hook-form lo stato sta in `useForm()` e non nel DOM. Succede solo
 * trascinando il bordo della finestra attraverso i 768px mentre si compila.
 */
const meta = {
  title: 'Blocchi/Dialogo adattivo',
  component: ResponsiveDialog,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ResponsiveDialog>

export default meta
type Story = StoryObj<typeof meta>

const schema = z.object({
  nome: z.string().min(1, 'Il nome è obbligatorio.'),
  note: z.string().max(2048).optional(),
})

function Contenuto({ didascalia }: { didascalia: string }) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { nome: 'Malta R4 fibrorinforzata', note: '' },
  })
  return (
    <ResponsiveDialogContent>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>Modifica prodotto</ResponsiveDialogTitle>
        <ResponsiveDialogDescription>{didascalia}</ResponsiveDialogDescription>
      </ResponsiveDialogHeader>
      <ResponsiveDialogBody>
        <form noValidate>
          <FieldGroup>
            <FormField control={form.control} nome="nome" etichetta="Denominazione">
              {(campo) => <Input {...campo} autoComplete="off" />}
            </FormField>
            <FormField
              control={form.control}
              nome="note"
              etichetta="Note tecniche"
              descrizione="Massimo 2048 caratteri."
            >
              {(campo) => <Textarea {...campo} rows={3} className="resize-none" />}
            </FormField>
          </FieldGroup>
        </form>
      </ResponsiveDialogBody>
      <ResponsiveDialogFooter>
        <ResponsiveDialogClose render={<Button variant="outline">Annulla</Button>} />
        <Button type="submit">Salva</Button>
      </ResponsiveDialogFooter>
    </ResponsiveDialogContent>
  )
}

/**
 * **`forma="auto"`** — il comportamento vero. Stringendo la finestra sotto la
 * soglia il dialogo diventa cassetto, e sopra torna dialogo, senza che qui cambi
 * una riga.
 *
 * È anche la story che **non** si può misurare in tutte e due le forme: il
 * runner del gate la viewport non la cambia. Per quello ci sono le due che
 * seguono.
 */
export const Automatico: Story = {
  args: {},
  render: (args) => (
    <ResponsiveDialog {...args}>
      <ResponsiveDialogTrigger render={<Button>Modifica prodotto</Button>} />
      <Contenuto didascalia="Restringi la finestra sotto i 768px: la stessa chiamata diventa un cassetto." />
    </ResponsiveDialog>
  ),
}

/**
 * **La forma a dialogo, forzata.** `forma="dialog"` non serve solo alla
 * dimostrazione: serve al **gate**. L&apos;imbracatura di misura non sa cambiare
 * viewport, quindi una forma che esistesse solo sotto una media query sarebbe
 * una forma che nessuno misura mai — è la stessa ragione per cui `page-header` e
 * `data-table` hanno una story con il contenitore stretto.
 *
 * E serve anche alle pagine che una forma la vogliono sempre: un dialogo di
 * conferma tecnico, che su un telefono come cassetto a tutta larghezza
 * sembrerebbe più importante di quello che è.
 */
export const Dialogo: Story = {
  args: { forma: 'dialog' },
  render: (args) => (
    <ResponsiveDialog {...args}>
      <ResponsiveDialogTrigger render={<Button>Modifica prodotto</Button>} />
      <Contenuto didascalia="Forma a dialogo, forzata: è quella che si vede sopra i 768px." />
    </ResponsiveDialog>
  ),
  play: apriCol(
    '[data-slot="responsive-dialog-trigger"]',
    'responsive-dialog-content',
  ),
}

/**
 * **La forma a cassetto, forzata.** Gli stessi identici figli della story
 * precedente: cambia solo la radice, e con lei intestazione, corpo e piedini
 * scelgono la propria controparte.
 *
 * Tre differenze che non sono uniformate ma **scelte**, e vale la pena
 * guardarle affiancate:
 *
 * - l&apos;intestazione torna **a sinistra** — nel cassetto la primitiva la
 *   centra, ma un dialogo e un cassetto che dicono la stessa cosa devono
 *   leggersi nello stesso modo, ed è la stessa correzione che fa
 *   l&apos;esempio `drawer-dialog` di shadcn;
 * - il **corpo** ha il respiro orizzontale, che nel dialogo arriva dal `p-4`
 *   del pannello e nel cassetto non c&apos;è. È l&apos;unica ragione per cui
 *   `ResponsiveDialogBody` esiste: senza, il corpo starebbe incollato ai bordi
 *   nella sola forma a cassetto, che è il difetto che shadcn corregge a mano
 *   scrivendo `className="px-4"` sul modulo;
 * - i **piedini** sono bottoni impilati a tutta larghezza invece di una fascia
 *   con il fondo, e la conferma sta in cima alla pila — cioè più vicina al
 *   pollice.
 */
export const Cassetto: Story = {
  args: { forma: 'drawer' },
  render: (args) => (
    <ResponsiveDialog {...args}>
      <ResponsiveDialogTrigger render={<Button>Modifica prodotto</Button>} />
      <Contenuto didascalia="Forma a cassetto, forzata: è quella che si vede sotto i 768px." />
    </ResponsiveDialog>
  ),
  play: apriCol(
    '[data-slot="responsive-dialog-trigger"]',
    'responsive-dialog-content',
  ),
}
