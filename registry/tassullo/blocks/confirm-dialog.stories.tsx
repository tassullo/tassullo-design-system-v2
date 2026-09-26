import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  ArchiveIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react'

import { apriCol } from '@/prove/apri'
import { ConfirmDialog } from '@/registry/tassullo/blocks/confirm-dialog'
import { Button } from '@/registry/tassullo/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/registry/tassullo/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/tassullo/ui/dropdown-menu'
import { Field, FieldLabel } from '@/registry/tassullo/ui/field'
import { Input } from '@/registry/tassullo/ui/input'
import { Textarea } from '@/registry/tassullo/ui/textarea'

/**
 * La domanda «sei sicuro?» prima di un'azione: titolo, spiegazione, due
 * bottoni, e se serve un campo da compilare per confermare.
 *
 * **Quando sì, quando no.** Si usa prima di un'azione che non si disfa:
 * eliminare, cancellare, sostituire. Per un'azione che si può annullare —
 * archiviare, ritirare una pubblicazione — non si chiede conferma: si esegue
 * e si offre l'annullo con `tassullo-toast-con-annullo`. Mai tutti e due
 * insieme. Un modulo da compilare è un dialogo (`dialog`, o
 * `tassullo-responsive-dialog` se deve diventare un cassetto sul telefono);
 * la primitiva `alert-dialog`, su cui questo blocco è costruito, resta per
 * le domande che non stanno in questa forma.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-confirm-dialog
 * ```
 *
 * ```tsx
 * <ConfirmDialog
 *   titolo="Eliminare il prodotto?"
 *   descrizione="La scheda e i suoi allegati non si possono recuperare."
 *   conferma="Elimina"
 *   tono="distruttivo"
 *   onConferma={() => api.elimina(id)}
 * >
 *   <Button variant="destructive"><Trash2Icon />Elimina</Button>
 * </ConfirmDialog>
 * ```
 *
 * **Le prop.**
 *
 * - `titolo`, scritto come una domanda; `descrizione`, cosa succede e cosa
 *   non si potrà disfare.
 * - `conferma`, il verbo dell'azione — «Elimina», mai «OK»; `annulla`,
 *   l'altro bottone.
 * - `tono`: `"normale"`, il predefinito, o `"distruttivo"`, che colora la
 *   conferma col rosso delle azioni che non si disfano.
 * - `onConferma` riceve il testo del campo, se c'è. Se restituisce una
 *   promessa, il dialogo aspetta che si risolva.
 * - Il grilletto è il figlio, nella forma comoda. Nella forma controllata si
 *   passano `aperto` e `onApertoChange`, senza figli.
 * - `corpo`, un contenuto fra la spiegazione e i bottoni: un riepilogo, un
 *   elenco di ciò che si cancella.
 * - `campo`, la conferma scritta: `etichetta`, `aiuto`, `segnaposto`,
 *   `iniziale`, `multiriga`, e `parolaAttesa` (la conferma si accende solo
 *   quando il campo la contiene esatta) oppure `obbligatorio` (si accende
 *   appena c'è scritto qualcosa).
 *
 * **Regole d'uso.**
 *
 * - Il rosso lo dà `tono="distruttivo"`, che usa la variante `destructive`
 *   del bottone: mai una classe di colore sul testo.
 * - L'ordine dei bottoni è fisso: annulla a sinistra, conferma a destra; su
 *   schermo stretto, in colonna, la conferma sta sopra.
 * - Mentre la promessa di `onConferma` è in corso, la conferma mostra
 *   l'attesa ed è spenta, l'annullo è spento, e né `Esc` né il clic fuori
 *   chiudono. Se la promessa fallisce il dialogo resta aperto e si può
 *   riprovare: l'errore lo racconta l'app.
 * - Da una voce di un menu si usa la forma controllata, con il dialogo reso
 *   fuori dal menu: cliccata la voce il menu si chiude, e un grilletto dentro
 *   il menu si porterebbe via anche il dialogo.
 * - Da un dialogo, per esempio il bottone «Elimina» nel piè di un dialogo di
 *   modifica, la conferma si rende **dentro** il contenuto del dialogo, col
 *   grilletto al suo posto. Il dialogo sotto resta aperto e coperto dal velo;
 *   `Esc` chiude solo la conferma. Resa accanto al dialogo, invece che
 *   dentro, `Esc` chiuderebbe il dialogo sotto.
 * - Un campo non va in `descrizione`, che il lettore di schermo legge tutta
 *   di fila all'apertura: sta in `campo` o in `corpo`.
 * - Il campo torna al valore iniziale a ogni apertura.
 *
 * **Tastiera e accessibilità.** Il fuoco entra nel dialogo e ci resta;
 * `Esc` chiude come «Annulla», tranne durante l'attesa; alla chiusura il
 * fuoco torna al bottone che l'ha aperta, anche dentro un altro dialogo. Titolo e
 * descrizione sono il nome e la descrizione del dialogo. L'aiuto del campo è
 * collegato con `aria-describedby`, e con `parolaAttesa` dice quale parola
 * scrivere prima che la si debba scrivere.
 */
const meta = {
  title: 'Blocchi/Dialogo di conferma',
  component: ConfirmDialog,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

const attendi = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * La forma comoda, col grilletto dentro, in tono distruttivo. Il dialogo è
 * aperto.
 */
export const Distruttivo: Story = {
  args: {
    titolo: 'Eliminare il prodotto?',
    descrizione:
      'La scheda «Malta R4 fibrorinforzata» e i suoi allegati non si possono recuperare.',
    conferma: 'Elimina',
    tono: 'distruttivo',
    onConferma: () => {},
  },
  render: (args) => (
    <ConfirmDialog {...args}>
      <Button variant="destructive">
        <Trash2Icon />
        Elimina
      </Button>
    </ConfirmDialog>
  ),
  play: apriCol(
    '[data-slot="confirm-dialog-trigger"]',
    'confirm-dialog-content',
  ),
}

/**
 * Una conferma che non distrugge niente: il bottone resta quello primario, e
 * il rosso resta per ciò che non si disfa.
 */
export const Normale: Story = {
  args: {
    titolo: 'Pubblicare la scheda?',
    descrizione:
      'Diventa visibile nel catalogo pubblico. Si può ritirare in ogni momento.',
    conferma: 'Pubblica',
    onConferma: () => {},
  },
  render: (args) => (
    <ConfirmDialog {...args}>
      <Button>Pubblica</Button>
    </ConfirmDialog>
  ),
}

/**
 * L'attesa: `onConferma` impiega un secondo e mezzo. Premendo «Elimina» i
 * bottoni si spengono e `Esc` non chiude; la seconda volta la promessa
 * fallisce, e il dialogo resta aperto.
 */
export const InCorso: Story = {
  args: {
    titolo: 'Eliminare il prodotto?',
    descrizione: 'Il primo tentativo riesce dopo un secondo e mezzo; il secondo fallisce.',
    conferma: 'Elimina',
    tono: 'distruttivo',
    onConferma: () => {},
  },
  render: function Render(args) {
    const [tentativi, setTentativi] = useState(0)
    return (
      <ConfirmDialog
        {...args}
        onConferma={async () => {
          await attendi(1500)
          setTentativi((n) => n + 1)
          if (tentativi % 2 === 1) throw new Error('La rete non risponde')
        }}
      >
        <Button variant="destructive">
          <Trash2Icon />
          Elimina
        </Button>
      </ConfirmDialog>
    )
  },
}

/**
 * Dal menu di una riga: la pagina tiene lo stato di apertura, e il dialogo è
 * reso fuori dal menu, senza figli.
 */
export const DaUnMenuDiRiga: Story = {
  args: {
    titolo: 'Eliminare la riga?',
    conferma: 'Elimina',
    tono: 'distruttivo',
    onConferma: () => {},
  },
  render: function Render(args) {
    const [aperto, setAperto] = useState(false)
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Azioni sulla riga">
                <EllipsisVerticalIcon />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <PencilIcon />
              Modifica
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setAperto(true)}
            >
              <Trash2Icon />
              Elimina
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ConfirmDialog
          {...args}
          descrizione="La riga «MS-R4-01» e i suoi allegati non si possono recuperare."
          aperto={aperto}
          onApertoChange={setAperto}
          onConferma={async () => {
            await attendi(600)
          }}
        />
      </>
    )
  },
}

/**
 * La parola da ricopiare: la conferma resta spenta finché il campo non la
 * contiene esatta, e la riga sotto il campo dice quale parola scrivere.
 */
export const ParolaDaRicopiare: Story = {
  name: 'Parola da ricopiare',
  args: {
    titolo: 'Archiviare la norma?',
    descrizione:
      'Esce dal catalogo e dalle ricerche. I riferimenti già usati nelle schede restano, ma puntano a una norma archiviata.',
    conferma: 'Archivia',
    tono: 'distruttivo',
    campo: {
      etichetta: 'Codice della norma',
      // Nessun segnaposto: sarebbe la parola attesa scritta una seconda
      // volta, in grigio dentro il campo — cioè qualcosa che si può
      // scambiare per un valore già inserito. La parola si legge una volta
      // sola, nella riga sotto, in evidenza.
      parolaAttesa: 'UNI EN 998-1',
    },
    onConferma: () => {},
  },
  render: function Render(args) {
    const [esito, setEsito] = useState<string | null>(null)
    return (
      <div className="flex flex-col items-start gap-3">
        <ConfirmDialog
          {...args}
          onConferma={(valore) => {
            setEsito(valore)
          }}
        >
          <Button variant="destructive">
            <ArchiveIcon />
            Archivia
          </Button>
        </ConfirmDialog>
        {/* La spia: dimostra che il valore esce davvero dal dialogo. */}
        <p className="text-sm text-muted-foreground" data-prova="esito-parola">
          {esito === null ? 'Non ancora confermato.' : `Confermato con: ${esito}`}
        </p>
      </div>
    )
  },
  play: apriCol(
    '[data-slot="confirm-dialog-trigger"]',
    'confirm-dialog-content',
  ),
}

/**
 * Il motivo da scrivere: un campo su più righe, obbligatorio, il cui testo
 * arriva a `onConferma`.
 */
export const MotivoDaScrivere: Story = {
  name: 'Motivo da scrivere',
  args: {
    titolo: 'Rifiutare la proposta di modifica?',
    descrizione:
      'Le 14 modifiche della proposta «Aggiornamento famiglie 2026» non vengono applicate.',
    conferma: 'Rifiuta',
    tono: 'distruttivo',
    campo: {
      etichetta: 'Motivo del rifiuto',
      segnaposto: 'Es. le famiglie non corrispondono al listino di settembre',
      aiuto: 'Lo legge chi ha proposto le modifiche. Serve a sapere cosa correggere.',
      multiriga: true,
      obbligatorio: true,
    },
    onConferma: () => {},
  },
  render: function Render(args) {
    const [esito, setEsito] = useState<string | null>(null)
    return (
      <div className="flex w-96 flex-col items-start gap-3">
        <ConfirmDialog
          {...args}
          onConferma={async (valore) => {
            await attendi(400)
            setEsito(valore)
          }}
        >
          <Button variant="destructive">
            <XIcon />
            Rifiuta
          </Button>
        </ConfirmDialog>
        <p
          className="text-sm text-muted-foreground"
          data-prova="esito-motivo"
        >
          {esito === null ? 'Non ancora rifiutata.' : `Motivo ricevuto: ${esito}`}
        </p>
      </div>
    )
  },
}

/*
 * La prova della conferma annidata, eseguita a ogni giro del controllo di
 * accessibilità: apre il dialogo di modifica, poi la conferma dal suo bottone
 * «Elimina», e verifica tre cose.
 *
 *   1. Il velo: nell'angolo del dialogo sotto, fuori dalla conferma, il primo
 *      elemento sotto il puntatore è il velo della conferma, non il dialogo.
 *   2. `Esc` chiude la sola conferma: il dialogo sotto resta aperto.
 *   3. Il fuoco torna al bottone «Elimina» del dialogo.
 *
 * Alla fine riapre la conferma, perché la scansione di accessibilità guardi
 * i due dialoghi insieme. Nella passata «chiuso» `apriCol` non apre niente, e
 * la prova si ferma lì: il dialogo è la scena a riposo.
 */
async function provaDaUnDialogo({ canvasElement }: { canvasElement: HTMLElement }) {
  await apriCol('[data-slot="dialog-trigger"]', 'dialog-content')({ canvasElement })
  const dialogo = document.querySelector<HTMLElement>('[data-slot="dialog-content"]')
  if (!dialogo) return

  const elimina = within(dialogo).getByRole('button', { name: 'Elimina' })
  const conferma = () =>
    document.querySelector('[data-slot="confirm-dialog-content"]')

  await userEvent.click(elimina)
  await waitFor(() => expect(conferma()).toBeInTheDocument())

  await waitFor(() => {
    const r = dialogo.getBoundingClientRect()
    const sopra = document.elementFromPoint(r.left + 8, r.top + 8)
    expect(sopra?.getAttribute('data-slot')).toBe('alert-dialog-overlay')
  })

  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(conferma()).not.toBeInTheDocument())
  expect(dialogo.isConnected).toBe(true)
  await waitFor(() => expect(document.activeElement).toBe(elimina))

  await userEvent.click(elimina)
  await waitFor(() => expect(conferma()).toBeInTheDocument())
}

/**
 * La conferma aperta da un dialogo di modifica: resa dentro il dialogo, col
 * grilletto nel suo piè di pagina. Il velo copre il dialogo sotto, `Esc`
 * chiude solo la conferma e il fuoco torna su «Elimina».
 */
export const DaUnDialogo: Story = {
  name: 'Da un dialogo',
  args: {
    titolo: 'Eliminare il prodotto?',
    descrizione:
      'La scheda «Malta R4 fibrorinforzata» e i suoi allegati non si possono recuperare.',
    conferma: 'Elimina',
    tono: 'distruttivo',
    onConferma: () => {},
  },
  render: (args) => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        <PencilIcon />
        Modifica
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifica prodotto</DialogTitle>
          <DialogDescription>
            Le modifiche valgono dalla prossima revisione della scheda.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="cd-nome">Nome</FieldLabel>
            <Input id="cd-nome" defaultValue="Malta R4 fibrorinforzata" />
          </Field>
          <Field>
            <FieldLabel htmlFor="cd-codice">Codice</FieldLabel>
            <Input id="cd-codice" defaultValue="MS-R4-01" />
          </Field>
          <Field>
            <FieldLabel htmlFor="cd-note">Note</FieldLabel>
            <Textarea id="cd-note" rows={3} />
          </Field>
        </div>
        <DialogFooter>
          <ConfirmDialog {...args}>
            <Button variant="destructive" className="sm:mr-auto">
              <Trash2Icon />
              Elimina
            </Button>
          </ConfirmDialog>
          <DialogClose render={<Button variant="outline" />}>Annulla</DialogClose>
          <Button>Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

// Scena di misura di «Da un dialogo»: la stessa resa, con la prova. `!dev` la
// toglie dalla barra e da Docs, così la scena qui sopra si apre a riposo;
// il controllo automatico la esegue lo stesso.
export const DaUnDialogoProva: Story = {
  ...DaUnDialogo,
  name: 'Da un dialogo, prova',
  tags: ['!dev', '!autodocs'],
  play: provaDaUnDialogo,
}
