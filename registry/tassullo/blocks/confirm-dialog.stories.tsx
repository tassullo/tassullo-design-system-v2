import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'

import { apriCol } from '@/prove/apri'
import { ConfirmDialog } from '@/registry/tassullo/blocks/confirm-dialog'
import { Button } from '@/registry/tassullo/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/tassullo/ui/dropdown-menu'

/**
 * «Sei sicuro?», in una forma sola.
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
 * ## Cosa c&apos;era già, e cosa manca
 *
 * `alert-dialog` di shadcn è la primitiva giusta e qui sotto non se ne tocca una
 * riga. Ciò che manca è che **una conferma non è una composizione, è una
 * domanda**: titolo, spiegazione, due bottoni. Scritta a mano sono quattordici
 * righe di JSX in cui l&apos;unica cosa che cambia da un punto d&apos;uso
 * all&apos;altro sono due stringhe — e con quattordici righe di ripetizione
 * arrivano tre difetti che si vedono solo a cose fatte.
 *
 * **Il colore del testo.** La tentazione, sull&apos;azione distruttiva, è
 * `className="text-destructive"`. `--destructive` è il colore dei **fondi**:
 * come testo su un fondo scuro dà **3.52:1**, misurato dal gate in M3.2. Qui
 * l&apos;azione distruttiva è `variant="destructive"`, che è la variante del
 * componente — l&apos;unica forma che il tema garantisce leggibile in tutte e
 * due le modalità.
 *
 * **L&apos;ordine dei bottoni.** Annulla a sinistra, conferma a destra; in
 * colonna, su schermo stretto, conferma **sopra**. Se ogni punto d&apos;uso lo
 * riscrive, prima o poi da qualche parte è invertito, e chi clicca in automatico
 * cancella una cosa che voleva tenere.
 *
 * **L&apos;attesa** — ed è la ragione vera per cui questo blocco esiste.
 *
 * ## L&apos;attesa
 *
 * `onConferma` può restituire una **promessa**. Finché non si risolve il dialogo
 * resta aperto: la conferma mostra l&apos;indicatore e si disabilita,
 * l&apos;annullo si disabilita, `Esc` e il clic fuori non chiudono. Se la
 * promessa viene rifiutata il dialogo **resta aperto e riprovabile** —
 * l&apos;errore lo racconta l&apos;app, che sa cosa dire, ma non su un dialogo
 * già sparito.
 *
 * Senza, il comportamento diffuso è: si chiude subito, la richiesta fallisce in
 * silenzio, l&apos;utente crede di aver cancellato. È una piccola macchina a
 * stati, e ce ne vuole **una** per tutte le app — non una per pagina.
 *
 * ## Controllato, perché il grilletto spesso non c&apos;è
 *
 * Il caso più frequente nelle app Tassullo è la voce di un menu di riga della
 * tabella, e lì il grilletto **non può stare dentro**: cliccando la voce il menu
 * si chiude e si smonta, e con lui si smonterebbe il dialogo che stava per
 * aprire. È il caso che shadcn documenta come `dropdown-menu-dialog`, e la
 * risposta è la forma controllata — `aperto` e `onApertoChange`, senza figli.
 * Vedi la story **Da un menu di riga**.
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
 * La forma comoda, col grilletto dentro. Il dialogo si apre da sé in fase di
 * misura: è la dichiarazione che il gate legge per sapere **quale** popup
 * aprire — un popup non aperto non è un popup senza violazioni.
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
 * Non tutte le conferme sono distruzioni. `tono="normale"` è il default: la
 * conferma resta il bottone primario, e il rosso resta riservato a ciò che non
 * si disfa. Un&apos;interfaccia in cui ogni conferma è rossa è
 * un&apos;interfaccia in cui il rosso non vuol più dire niente.
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
 * **L&apos;attesa, da provare col dito.** `onConferma` qui impiega un secondo e
 * mezzo. Premendo «Elimina»: l&apos;indicatore compare, i due bottoni si
 * disabilitano, `Esc` non chiude, e il dialogo se ne va solo a cose fatte.
 *
 * La seconda volta la promessa viene **rifiutata**: il dialogo resta aperto e
 * riprovabile. È il caso che, scritto a mano, quasi nessuno gestisce.
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
 * **Da un menu di riga**, che è il caso vero della tabella.
 *
 * Il grilletto non può stare dentro il dialogo: la voce del menu, cliccata,
 * chiude il menu e si smonta con lui. Lo stato dell&apos;apertura lo tiene
 * quindi la pagina, e `<ConfirmDialog>` si rende **fuori** dal menu, senza
 * figli.
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
