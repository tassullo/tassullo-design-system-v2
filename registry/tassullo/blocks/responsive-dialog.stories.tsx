import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { expect, userEvent, waitFor, within } from 'storybook/test'
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
  type ResponsiveDialogProps,
} from '@/registry/tassullo/blocks/responsive-dialog'
import { Button } from '@/registry/tassullo/ui/button'
import { Spinner } from '@/registry/tassullo/ui/spinner'
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
 * **Modifiche non salvate.** `sporco` dice che nel dialogo c'è qualcosa
 * di scritto e non ancora salvato; con react-hook-form è
 * `formState.isDirty`. Finché è vero, ogni chiusura chiesta da chi usa
 * l'app — `Esc`, un clic fuori, «Annulla», la crocetta, il gesto che
 * abbassa il cassetto, il tasto «indietro» del telefono — si ferma, e il
 * dialogo chiede «Chiudere senza salvare?». «Continua a modificare» è la
 * scelta di partenza e lascia tutto com'era; «Chiudi senza salvare» chiude,
 * e l'app lo sa da `onOpenChange` come per ogni altra chiusura. Senza
 * modifiche il dialogo si chiude come sempre. `inCorso`, durante un invio,
 * tiene il dialogo aperto senza chiedere niente.
 *
 * ```tsx
 * <ResponsiveDialog
 *   open={aperto}
 *   onOpenChange={(a) => { setAperto(a); if (!a) form.reset() }}
 *   sporco={form.formState.isDirty}
 *   inCorso={salvando}
 * >
 * ```
 *
 * - Dopo il salvataggio il dialogo lo chiude l'app, con `open={false}`:
 *   quella chiusura non chiede niente. Un «Salva» scritto come
 *   `ResponsiveDialogClose` verrebbe invece fermato, se `sporco` è ancora
 *   vero.
 * - I testi della domanda sono quelli consigliati, e vanno bene quasi
 *   sempre. Dove un dialogo deve dire altro, `testiChiusura` ne cambia uno o
 *   più — `titolo`, `descrizione`, `annulla`, `conferma` — e gli altri
 *   restano i consigliati. Il bottone che chiude dice sempre cosa si perde:
 *   «Chiudi senza salvare», «Scarta la bozza», non «OK».
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
  globals: { viewport: { value: 'telefono', isRotated: false } },
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

function ContenutoModulo({
  form,
  didascalia,
  salvando = false,
  onSalva,
}: {
  form: ReturnType<typeof useForm<z.infer<typeof schema>>>
  didascalia: string
  salvando?: boolean
  onSalva?: () => void
}) {
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
              {(campo) => <Input {...campo} autoComplete="off" disabled={salvando} />}
            </FormField>
            <FormField
              control={form.control}
              nome="note"
              etichetta="Note tecniche"
              descrizione="Massimo 2048 caratteri."
            >
              {(campo) => (
                <Textarea {...campo} rows={3} className="resize-none" disabled={salvando} />
              )}
            </FormField>
          </FieldGroup>
        </form>
      </ResponsiveDialogBody>
      <ResponsiveDialogFooter>
        <ResponsiveDialogClose
          render={<Button variant="outline" disabled={salvando}>Annulla</Button>}
        />
        <Button type="button" disabled={salvando} onClick={onSalva}>
          {salvando ? <Spinner data-icon="inline-start" /> : null}
          Salva
        </Button>
      </ResponsiveDialogFooter>
    </ResponsiveDialogContent>
  )
}

const NOME_SALVATO = 'Malta R4 fibrorinforzata'

/*
 * La scena delle modifiche non salvate: il modulo sta fuori dal dialogo,
 * come in un'app, e chiudendo si rimette com'era. «Salva» finge un invio di
 * un secondo e mezzo; `inCorsoFisso` tiene l'invio acceso per sempre, ed è
 * solo per la prova.
 */
function ScenaModifiche({
  forma,
  didascalia,
  inCorsoFisso = false,
  testiChiusura,
}: {
  forma: 'auto' | 'dialog' | 'drawer'
  didascalia: string
  inCorsoFisso?: boolean
  testiChiusura?: ResponsiveDialogProps['testiChiusura']
}) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { nome: NOME_SALVATO, note: '' },
  })
  const [aperto, setAperto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const inCorso = salvando || inCorsoFisso
  return (
    <ResponsiveDialog
      forma={forma}
      open={aperto}
      onOpenChange={(a) => {
        setAperto(a)
        if (!a) form.reset()
      }}
      sporco={form.formState.isDirty}
      inCorso={inCorso}
      testiChiusura={testiChiusura}
    >
      <ResponsiveDialogTrigger render={<Button>Modifica prodotto</Button>} />
      <ContenutoModulo
        form={form}
        didascalia={didascalia}
        salvando={inCorso}
        onSalva={() => {
          setSalvando(true)
          window.setTimeout(() => {
            form.reset(form.getValues())
            setSalvando(false)
            setAperto(false)
          }, 1500)
        }}
      />
    </ResponsiveDialog>
  )
}

const pannello = () =>
  document.querySelector<HTMLElement>('[data-slot="responsive-dialog-content"]')
const domanda = () =>
  document.querySelector<HTMLElement>('[data-slot="confirm-dialog-content"]')

/*
 * La prova della chiusura protetta, nelle due forme. In ordine:
 *
 *   1. senza modifiche `Esc` chiude subito, senza domanda;
 *   2. con una modifica, `Esc`, «Annulla» e il clic sul velo fanno comparire
 *      la domanda e lasciano il dialogo aperto; il fuoco va su «Continua a
 *      modificare»; tornando al modulo, con `Esc` o col bottone, il testo
 *      scritto c'è ancora;
 *   3. «Chiudi senza salvare» chiude, e l'app lo sa: riaprendo, il modulo è
 *      tornato com'era (lo rimette `onOpenChange`);
 *   4. alla fine riscrive e riapre la domanda, perché la scansione di
 *      accessibilità guardi il dialogo e la domanda insieme.
 *
 * Nella passata «chiuso» `apriCol` non apre niente e la prova si ferma lì.
 */
function provaModifiche(velo: string) {
  return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const grilletto = '[data-slot="responsive-dialog-trigger"]'
    await apriCol(grilletto, 'responsive-dialog-content')({ canvasElement })
    if (!pannello()) return

    const apri = async () => {
      await userEvent.click(canvasElement.querySelector<HTMLElement>(grilletto)!)
      await waitFor(() => expect(pannello()).toBeInTheDocument())
      await waitFor(() => expect(pannello()!.contains(document.activeElement)).toBe(true))
    }
    const chiuso = async () => {
      await waitFor(() => expect(pannello()).not.toBeInTheDocument())
      expect(domanda()).toBeNull()
    }
    const chiede = async () => {
      await waitFor(() => expect(domanda()).toBeInTheDocument())
      expect(pannello()).toBeInTheDocument()
      await waitFor(() =>
        expect(document.activeElement).toHaveTextContent('Continua a modificare'),
      )
    }
    const tornato = async () => {
      await waitFor(() => expect(domanda()).not.toBeInTheDocument())
      expect(pannello()).toBeInTheDocument()
      expect(within(pannello()!).getByLabelText('Denominazione')).toHaveValue(
        `${NOME_SALVATO} bis`,
      )
    }

    // 1. Senza modifiche.
    await waitFor(() => expect(pannello()!.contains(document.activeElement)).toBe(true))
    await userEvent.keyboard('{Escape}')
    await chiuso()

    // 2. Con una modifica: tre modi di chiudere, tutti fermati.
    await apri()
    await userEvent.type(within(pannello()!).getByLabelText('Denominazione'), ' bis')

    await userEvent.keyboard('{Escape}')
    await chiede()
    await userEvent.keyboard('{Escape}')
    await tornato()

    await userEvent.click(within(pannello()!).getByRole('button', { name: 'Annulla' }))
    await chiede()
    await userEvent.click(
      within(domanda()!).getByRole('button', { name: 'Continua a modificare' }),
    )
    await tornato()

    await userEvent.click(document.querySelector<HTMLElement>(`[data-slot="${velo}"]`)!)
    await chiede()
    await userEvent.keyboard('{Escape}')
    await tornato()

    // 3. Chiudere davvero.
    await userEvent.keyboard('{Escape}')
    await chiede()
    await userEvent.click(
      within(domanda()!).getByRole('button', { name: 'Chiudi senza salvare' }),
    )
    await chiuso()
    await apri()
    expect(within(pannello()!).getByLabelText('Denominazione')).toHaveValue(NOME_SALVATO)

    // 4. La domanda aperta, per la scansione.
    await userEvent.type(within(pannello()!).getByLabelText('Denominazione'), ' bis')
    await userEvent.keyboard('{Escape}')
    await chiede()
  }
}

/*
 * La prova dell'invio in corso: `Esc`, «Annulla» spento e il clic sul velo
 * non chiudono e non chiedono niente. L'assenza si guarda dopo un'attesa
 * breve: se la prova sbaglia, sbaglia verso il verde, mai verso il rosso.
 */
function provaInCorso(velo: string) {
  return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await apriCol('[data-slot="responsive-dialog-trigger"]', 'responsive-dialog-content')({
      canvasElement,
    })
    if (!pannello()) return
    const fermo = async () => {
      await new Promise((r) => window.setTimeout(r, 300))
      expect(pannello()).toBeInTheDocument()
      expect(domanda()).toBeNull()
    }
    await waitFor(() => expect(pannello()!.contains(document.activeElement)).toBe(true))
    await userEvent.keyboard('{Escape}')
    await fermo()
    await userEvent.click(document.querySelector<HTMLElement>(`[data-slot="${velo}"]`)!)
    await fermo()
    expect(within(pannello()!).getByRole('button', { name: 'Annulla' })).toBeDisabled()
  }
}

/**
 * Con `sporco`: scritto qualcosa nel modulo, `Esc`, un clic fuori o
 * «Annulla» chiedono prima di chiudere. «Salva» finge un invio di un
 * secondo e mezzo, durante il quale il dialogo non si chiude.
 */
export const ConModifiche: Story = {
  name: 'Con modifiche non salvate',
  args: {},
  render: () => (
    <ScenaModifiche
      forma="dialog"
      didascalia="Cambia la denominazione, poi prova a chiudere."
    />
  ),
  play: apriCol('[data-slot="responsive-dialog-trigger"]', 'responsive-dialog-content'),
}

/**
 * La stessa cosa nel cassetto: anche abbassarlo col dito chiede prima di
 * chiudere, e il cassetto torna su.
 */
export const ConModificheCassetto: Story = {
  name: 'Con modifiche non salvate, cassetto',
  globals: { viewport: { value: 'telefono', isRotated: false } },
  args: {},
  render: () => (
    <ScenaModifiche
      forma="drawer"
      didascalia="Cambia la denominazione, poi prova ad abbassare il cassetto."
    />
  ),
  play: apriCol('[data-slot="responsive-dialog-trigger"]', 'responsive-dialog-content'),
}

// Scene di misura della chiusura protetta: le stesse rese, con le prove.
// `!dev` le toglie dalla barra e da Docs; il controllo automatico le esegue.
export const ConModificheProva: Story = {
  ...ConModifiche,
  name: 'Con modifiche non salvate, prova',
  tags: ['!dev', '!autodocs'],
  play: provaModifiche('dialog-overlay'),
}

export const ConModificheCassettoProva: Story = {
  ...ConModificheCassetto,
  name: 'Con modifiche non salvate, cassetto, prova',
  tags: ['!dev', '!autodocs'],
  play: provaModifiche('drawer-overlay'),
}

export const InvioInCorsoProva: Story = {
  name: 'Invio in corso, prova',
  tags: ['!dev', '!autodocs'],
  args: {},
  render: () => <ScenaModifiche forma="dialog" didascalia="Invio in corso." inCorsoFisso />,
  play: provaInCorso('dialog-overlay'),
}

export const InvioInCorsoCassettoProva: Story = {
  name: 'Invio in corso, cassetto, prova',
  tags: ['!dev', '!autodocs'],
  globals: { viewport: { value: 'telefono', isRotated: false } },
  args: {},
  render: () => <ScenaModifiche forma="drawer" didascalia="Invio in corso." inCorsoFisso />,
  play: provaInCorso('drawer-overlay'),
}

/**
 * Con `testiChiusura`: i testi della domanda cambiati dall'app, qui per una
 * bozza. Quelli non passati restano i consigliati.
 */
export const ConTestiPropri: Story = {
  name: 'Con modifiche non salvate, testi propri',
  args: {},
  render: () => (
    <ScenaModifiche
      forma="dialog"
      didascalia="Cambia la denominazione, poi prova a chiudere."
      testiChiusura={{
        titolo: 'Scartare la bozza?',
        conferma: 'Scarta la bozza',
      }}
    />
  ),
  play: apriCol('[data-slot="responsive-dialog-trigger"]', 'responsive-dialog-content'),
}

/*
 * La prova dei testi propri: i due passati compaiono, i due non passati
 * restano i consigliati, e il bottone col testo proprio chiude davvero.
 */
async function provaTestiPropri({ canvasElement }: { canvasElement: HTMLElement }) {
  await apriCol('[data-slot="responsive-dialog-trigger"]', 'responsive-dialog-content')({
    canvasElement,
  })
  if (!pannello()) return
  await userEvent.type(within(pannello()!).getByLabelText('Denominazione'), ' bis')
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(domanda()).toBeInTheDocument())
  const d = within(domanda()!)
  expect(d.getByRole('heading')).toHaveTextContent('Scartare la bozza?')
  expect(domanda()).toHaveTextContent('Le modifiche che hai fatto andranno perse.')
  expect(d.getByRole('button', { name: 'Continua a modificare' })).toBeInTheDocument()
  await userEvent.click(d.getByRole('button', { name: 'Scarta la bozza' }))
  await waitFor(() => expect(pannello()).not.toBeInTheDocument())
}

export const ConTestiPropriProva: Story = {
  ...ConTestiPropri,
  name: 'Con modifiche non salvate, testi propri, prova',
  tags: ['!dev', '!autodocs'],
  play: provaTestiPropri,
}
