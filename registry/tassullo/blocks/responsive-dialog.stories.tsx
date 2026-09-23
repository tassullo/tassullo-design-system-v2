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
 * Un dialogo che sulla scrivania è una finestra al centro e sul telefono un
 * cassetto che sale dal basso, scritto una volta sola.
 *
 * **Quando sì, quando no.** Si usa per un modulo o un contenuto che si apre
 * sopra la pagina e deve stare bene su tutti e due gli schermi: una modifica,
 * un filtro avanzato. Sulla sola scrivania basta `dialog`; un pannello
 * laterale che resta accanto al contenuto è `sheet`; un cassetto per il solo
 * telefono è `drawer`. Una domanda di conferma prima di un'azione che non si
 * disfa è `tassullo-confirm-dialog`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-responsive-dialog
 * ```
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
 * **Parti e opzioni.** `ResponsiveDialog` è la radice, con le prop di
 * `dialog` (`open`, `onOpenChange`, `defaultOpen`) e `forma`: `"auto"`, il
 * predefinito, sceglie da sé; `"dialog"` e `"drawer"` fissano una forma. Poi
 * `ResponsiveDialogTrigger`, `ResponsiveDialogContent`,
 * `ResponsiveDialogHeader`, `ResponsiveDialogTitle`,
 * `ResponsiveDialogDescription`, `ResponsiveDialogBody`,
 * `ResponsiveDialogFooter`, `ResponsiveDialogClose`: ognuna prende la parte
 * giusta della forma in uso. `useFormaDialogo()` dice ai figli quale forma è
 * montata.
 *
 * **Regole d'uso.**
 *
 * - La soglia è quella del guscio, 768px di finestra: il dialogo diventa
 *   cassetto nello stesso punto in cui la colonna di navigazione diventa un
 *   pannello. Non si sposta per un singolo dialogo.
 * - Il contenuto va in `ResponsiveDialogBody`, che gli dà il margine laterale
 *   anche nel cassetto.
 * - Nel cassetto l'intestazione resta allineata a sinistra come nel dialogo,
 *   e i bottoni del piede si impilano a tutta larghezza con la conferma in
 *   cima, più vicina al pollice.
 * - Passando la soglia con il dialogo aperto, la forma cambia e il contenuto
 *   si rimonta: i campi del modulo tengano il loro stato fuori dal dialogo,
 *   per esempio con react-hook-form.
 * - `forma="dialog"` serve anche dove un cassetto a tutta larghezza farebbe
 *   sembrare il contenuto più importante di quello che è.
 *
 * **Tastiera e accessibilità.** In tutte e due le forme il fuoco entra nel
 * pannello e ci resta, `Esc` chiude e il fuoco torna al grilletto. Titolo e
 * descrizione sono il nome e la descrizione del pannello.
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
 * `forma="auto"`: stringendo la finestra sotto i 768px il dialogo diventa un
 * cassetto, e sopra torna dialogo.
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
 * La forma a dialogo, fissata con `forma="dialog"`.
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
 * La forma a cassetto, fissata con `forma="drawer"`, con gli stessi figli: a
 * cambiare sono intestazione, corpo e piede.
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
