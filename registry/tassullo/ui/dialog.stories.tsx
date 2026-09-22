import type { Meta, StoryObj } from '@storybook/react-vite'

import { apriCol } from '@/prove/apri'
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
 * Una finestra sopra la pagina, per un compito breve che si chiude e si torna
 * dov'eri: un modulo, un dettaglio, un avviso da leggere.
 *
 * **Quando sì, quando no.** È l'overlay di base su schermo largo. Se l'azione
 * che si conferma non si può annullare, si usa `alert-dialog`, che non si
 * chiude col clic fuori. Su telefono lo stesso contenuto va in un `drawer`,
 * che si apre dal basso e si trascina: il blocco `Dialogo adattivo` sceglie
 * fra i due secondo la larghezza, senza nulla da scrivere nella pagina. Un
 * pannello di lavoro accostato a un lato, che lascia vedere la pagina accanto,
 * è `sheet`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/dialog
 * ```
 *
 * **Opzioni.** `showCloseButton` su `DialogContent` (acceso di base) mostra la
 * crocetta in alto a destra; lo stesso prop su `DialogFooter` (spento di base)
 * aggiunge un bottone «Chiudi» in fondo.
 *
 * **Regole d'uso.** `DialogTitle` c'è sempre: è il nome con cui la finestra si
 * annuncia. Se non deve vedersi, si mette lo stesso e si nasconde con
 * `sr-only`. Una via d'uscita che non richieda il mouse ci dev'essere sempre:
 * togliendo la crocetta, si mette la chiusura nel piè di pagina. I dialoghi
 * annidati si evitano.
 *
 * **Tastiera e accessibilità.** All'apertura il fuoco entra nella finestra e
 * `Tab` gira al suo interno senza uscire verso la pagina sotto; `Esc` chiude;
 * alla chiusura il fuoco torna sul bottone che l'aveva aperta, non all'inizio
 * della pagina.
 */
const meta = {
  title: 'Primitive/Dialog',
  component: Dialog,
  // Si misura **aperto**: chiuso il popup non esiste e axe non ha niente
  // da guardare. L'imbracatura dichiara qui quale popup apre (`@/prove/apri`).
  play: apriCol('[data-slot="dialog-trigger"]', 'dialog-content'),
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
 * Il percorso da tastiera: aperta la finestra, `Tab` passa fra i controlli e
 * ricomincia dal primo. `Esc` chiude, e il fuoco torna sul bottone che l'aveva
 * aperta.
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
 * Un modulo con più campi. Il piè di pagina ha un fondo tenue e sta a filo dei
 * bordi della finestra.
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
 * Senza la crocetta (`showCloseButton={false}` sul contenuto) e con la
 * chiusura nel piè di pagina (`showCloseButton` su `DialogFooter`). Restano
 * `Esc` e il clic fuori.
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
 * Titolo, descrizione e contenuto lunghi: la finestra non cresce oltre lo
 * schermo e il testo va a capo.
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
 * Due finestre una sopra l'altra: la seconda prende il fuoco e `Esc` chiude
 * solo quella in cima. È il caso in cui il fuoco si perde più facilmente, e si
 * evita quando si può.
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
            Il PDF usa il carattere Replica, non Inter: è il carattere delle
            stampe.
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
                  L'anteprima del PDF sarà pronta al termine dell'esportazione.
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
