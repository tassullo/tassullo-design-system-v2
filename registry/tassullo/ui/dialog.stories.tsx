import type { Meta, StoryObj } from '@storybook/react-vite'

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
import { Field, FieldLabel } from '@/registry/tassullo/ui/field'
import { Input } from '@/registry/tassullo/ui/input'
import { Label } from '@/registry/tassullo/ui/label'
import { Textarea } from '@/registry/tassullo/ui/textarea'

/**
 * **Nessun ri-stile.** Il dialog del preset poggia già sui token del tema —
 * `bg-popover`, `text-popover-foreground`, `ring-foreground/10` — e le due
 * misure che lo compongono (`p-4`, `gap-4`) derivano da `--spacing`, quindi
 * seguono la densità da sé.
 *
 * **Cosa fa il dialog che nessun altro overlay fa: intrappola il fuoco.**
 * Aperto, `Tab` gira dentro e non esce; `Esc` chiude; alla chiusura il fuoco
 * **torna sul grilletto**, non all'inizio della pagina. Sono tre requisiti
 * WCAG (2.1.2, 2.4.3, 2.4.11) che Base UI soddisfa senza che noi si scriva
 * nulla — e che qui si verificano invece di darli per buoni.
 *
 * **`DialogTitle` non è decorativo**: è ciò che dà il nome accessibile alla
 * finestra. Un dialog senza titolo si annuncia «finestra di dialogo» e basta.
 * Se il titolo non deve vedersi — è il caso della palette comandi — si mette
 * lo stesso e si nasconde con `sr-only`, che è quel che fa `CommandDialog`.
 *
 * **Quando NON usarlo.** Per una conferma distruttiva c'è `AlertDialog`, che
 * non si chiude cliccando fuori. Sotto la soglia mobile c'è `Drawer`: il
 * blocco `responsive-dialog` di M3.4 sceglie fra i due senza che la pagina
 * scriva un `if`.
 *
 * `max-w-[calc(100%-2rem)]` resta il valore ereditato da shadcn: è un calcolo
 * geometrico, non un valore di tema — stessa famiglia del
 * `translate-x-[calc(100%-2px)]` dello `switch`, lasciato in M2.2.
 */
const meta = {
  title: 'Primitive/Dialog',
  component: Dialog,
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        Modifica scheda
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rinomina la scheda tecnica</DialogTitle>
          <DialogDescription>
            Il nome compare nell'elenco prodotti e nel PDF esportato.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="dg-nome">Nome della scheda</FieldLabel>
          <Input id="dg-nome" defaultValue="Tassullo T30 — intonaco deumidificante" />
        </Field>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Annulla</DialogClose>
          <Button>Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/**
 * Il percorso da tastiera, che è il criterio di accettazione di questo task.
 * Aperto il dialog, `Tab` passa fra i tre controlli e **ricomincia dal
 * primo**: non esce mai verso la pagina sotto. `Esc` chiude, e il fuoco
 * torna sul bottone che l'aveva aperto.
 */
export const FuocoIntrappolato: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <Dialog>
        <DialogTrigger render={<Button />}>Apri e prova il Tab</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tre fermi di tabulazione</DialogTitle>
            <DialogDescription>
              Campo, «Annulla», «Salva» — poi si ricomincia dal campo. La X in
              alto a destra è il quarto.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="dg-trap">Primo fermo</FieldLabel>
            <Input id="dg-trap" placeholder="Scrivi qui" />
          </Field>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Annulla</DialogClose>
            <Button>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        Sotto il dialog c'è questo testo e nient'altro: se il fuoco uscisse, si
        vedrebbe l'anello comparire nella barra del browser.
      </p>
    </div>
  ),
}

/**
 * Un form vero, con più campi: è la forma che il blocco `form-field` di M3.4
 * assemblerà. Il piè di pagina è `bg-muted/50` e sta a filo dei bordi — i
 * margini negativi del preset — quindi il contenuto non gli deve stare
 * accanto.
 */
export const ConForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button />}>Nuova revisione</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuova revisione</DialogTitle>
          <DialogDescription>
            La revisione precedente resta consultabile nello storico.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="dg-rev">Numero di revisione</FieldLabel>
            <Input id="dg-rev" defaultValue="04" className="tabular-nums" />
          </Field>
          <Field>
            <FieldLabel htmlFor="dg-motivo">Motivo della revisione</FieldLabel>
            <Textarea
              id="dg-motivo"
              rows={3}
              placeholder="Aggiornamento dei valori di resa secondo EN 998-1"
            />
          </Field>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Annulla</DialogClose>
          <Button>Crea revisione</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/**
 * Senza la X in alto a destra (`showCloseButton={false}`) e con la chiusura
 * nel piè di pagina (`showCloseButton` su `DialogFooter`). Restano `Esc` e il
 * clic fuori: **una via d'uscita che non richieda il mouse ci dev'essere
 * sempre**.
 */
export const SenzaCrocetta: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>
        Dettagli della norma
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>EN 998-1</DialogTitle>
          <DialogDescription>
            Specifiche per malte per opere murarie — malte per intonaci interni
            ed esterni. Ultima revisione recepita: 2016.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
}

/**
 * Titolo lungo, descrizione lunga e contenuto che deborda: il dialog non
 * cresce oltre lo schermo e il testo va a capo. Le classi che lo tengono
 * insieme (`max-w-sm`, `text-balance` sulla descrizione) sono del preset.
 */
export const TestoLungo: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        Avvertenze d'uso
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Avvertenze per l'applicazione su supporti non assorbenti
          </DialogTitle>
          <DialogDescription>
            Su calcestruzzo liscio, intonaci vecchi verniciati o superfici
            trattate con prodotti filmogeni è necessario predisporre un ponte
            di aggrappo. La posa diretta compromette l'adesione e non è coperta
            dalla garanzia di prodotto.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>
            Temperatura di applicazione compresa fra +5 °C e +35 °C. Non
            applicare su supporti gelati o in fase di disgelo.
          </p>
          <p>
            Proteggere dall'irraggiamento diretto e dal vento nelle prime
            ventiquattro ore.
          </p>
        </div>
        <DialogFooter>
          <DialogClose render={<Button />}>Ho capito</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/**
 * Due dialog uno sopra l'altro. Il secondo prende il fuoco, `Esc` chiude solo
 * quello in cima. Non è un pattern da incoraggiare — è qui perché succede, e
 * perché è il caso in cui il fuoco si perde più facilmente.
 */
export const Annidato: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        Esporta scheda
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Esporta la scheda tecnica</DialogTitle>
          <DialogDescription>
            Il PDF usa il carattere Replica, non Inter: la stampa è l'unico
            posto dove il carattere del v1 resta.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="dg-lingua">Lingua del documento</Label>
          <Input id="dg-lingua" defaultValue="Italiano" />
        </div>
        <DialogFooter>
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              Anteprima
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Anteprima non disponibile</DialogTitle>
                <DialogDescription>
                  L'anteprima PDF arriva col blocco `pdf-preview` di M3.7.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton />
            </DialogContent>
          </Dialog>
          <Button>Esporta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
