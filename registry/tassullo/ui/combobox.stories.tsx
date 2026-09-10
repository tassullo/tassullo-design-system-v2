import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchIcon } from 'lucide-react'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/registry/tassullo/ui/field'
import { apriCol } from '@/prove/apri'
import { InputGroupAddon } from '@/registry/tassullo/ui/input-group'
import { Label } from '@/registry/tassullo/ui/label'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from '@/registry/tassullo/ui/combobox'

/**
 * **Il combobox è la risposta al `<select>` nudo con centinaia di voci.** In
 * Anagrafe le famiglie e le norme si scelgono oggi così, e non reggono: si
 * scorre a occhio una lista che non si può filtrare. Qui si **scrive**, e la
 * lista si stringe mentre si scrive.
 *
 * La regola di scelta, in una riga: **fino a poche decine di voci `select`,
 * sopra `combobox`.** Il confine non è netto e non serve che lo sia; il
 * sintomo sì: se per trovare una voce bisogna scorrere, era un combobox.
 *
 * ## Nessun ri-stile: `combobox.tsx` è il preset intatto
 *
 * E vale la pena dire **cosa non è stato fatto**. Fino a poco fa shadcn non
 * aveva un `combobox`: lo si componeva a mano da `command` + `popover`, ed è
 * quello che dice ancora `PIANO.md`. Oggi è un item suo (`registry:ui`), fatto
 * su `Combobox` di Base UI — quindi la scala 4bis si ferma al **gradino 1**:
 * il default shadcn, così com'è. Nessun componente nostro, `componenti-propri.json`
 * resta vuoto.
 *
 * Lo stesso vale per il **multi-select** e il **tag-input** che il piano
 * elencava come voci a sé: sono lo stesso componente con `multiple`, e le
 * pillole sono `ComboboxChips` / `ComboboxChip`, che il preset porta già.
 * Due componenti in meno da mantenere.
 *
 * ## Il filtro non si scrive: lo fa Base UI
 *
 * Si passa l'elenco a `items` sulla radice e si dà a `ComboboxList` una
 * **funzione** invece di figli: quella funzione riceve una voce alla volta,
 * **già filtrata**. Il confronto è insensibile alle maiuscole e agli accenti,
 * che in italiano non è un dettaglio.
 *
 * ## Da tastiera
 *
 * `Tab` porta sul campo, si scrive per filtrare, `↓`/`↑` scorrono le voci
 * rimaste, `Invio` sceglie, `Esc` chiude senza cambiare. Con `autoHighlight`
 * la prima voce è già evidenziata, quindi scrivere tre lettere e battere
 * `Invio` è tutto il percorso: è la ragione per cui una lista di 500 voci
 * resta usabile.
 *
 * A più scelte, in più: `Backspace` **a campo vuoto toglie l'ultima pillola**,
 * e le frecce `←`/`→` si spostano fra le pillole per toglierne una in mezzo.
 * Non c'è nulla da aggiungere perché funzioni.
 *
 * ## Due requisiti d'uso, che si sbagliano una volta sola se qui c'è scritto
 *
 * 1. **A più scelte serve l'`anchor`.** `ComboboxChips` è il contenitore delle
 *    pillole e cresce di riga in riga: se il riquadro non viene ancorato a
 *    quello — `const anchor = useComboboxAnchor()`, `ref` sulle pillole,
 *    `anchor` sul contenuto — il riquadro resta ancorato al campo interno e
 *    scivola sotto la pillola su cui si stava scrivendo.
 * 2. **Le voci raggruppate vogliono `ComboboxCollection` dentro il gruppo**, e
 *    `ComboboxGroup` vuole a sua volta i propri `items`. È la stessa forma del
 *    `SelectGroup` di M2.2 e della trappola di `DropdownMenuLabel` in M2.3:
 *    l'etichetta di gruppo sta **dentro** il gruppo, mai accanto.
 *
 * ## Due difetti del preset, noti e **lasciati com'erano** (decisione del 2026-09-09)
 *
 * Due bottoni di questo componente portano **solo l'icona e nessun nome
 * accessibile**: la freccia che apre l'elenco (`ComboboxTrigger`, montata da
 * `ComboboxInput`) e la crocetta di ogni pillola (`ComboboxChipRemove`). axe
 * li segna `button-name`, gravità *critical*; un lettore di schermo annuncia
 * «pulsante» e basta. Non sono difetti nostri — la pagina d'esempio di shadcn
 * ha gli stessi.
 *
 * **Non si chiudono, per decisione di Francesco**: le app Tassullo sono
 * strumenti interni e i lettori di schermo non sono un requisito. La freccia
 * si sarebbe potuta chiudere in composizione (`showTrigger={false}` più un
 * `ComboboxTrigger` rimesso a mano con l'`aria-label`), ed era stato fatto:
 * **disfatto**, perché erano dodici righe di boilerplate che ogni app avrebbe
 * copiato per un beneficio che non ci serve. Qui si sta al **default shadcn
 * nudo**, che è anche la forma più corta. La crocetta non sarebbe stata
 * chiudibile comunque: `ComboboxChipRemove` non è fra gli export del file.
 * Vedi **D14**, chiusa.
 *
 * Da tastiera e col mouse non cambia niente: la crocetta ha `tabindex="-1"`,
 * quindi il fuoco non ci passa nemmeno, e le pillole si tolgono con
 * `Backspace`.
 *
 * ## La trappola di misura, che invece **resta e vale per M2.9**
 *
 * Alla prima scansione la violazione sulla freccia compariva su **una story
 * sola**, quella disabilitata. Non perché le altre fossero sane: l'imbracatura,
 * per misurare i popup, *apriva il combobox* — e a popup aperto Base UI rende
 * il grilletto inerte, quindi axe lo salta. È il **rovescio esatto**
 * dell'avvertenza di M2.3: lì un popup non aperto nascondeva le violazioni del
 * popup, qui un popup aperto nasconde quelle del campo. Chi accende axe in CI
 * deve misurare **tutt'e due gli stati**, o metà del set non viene guardato.
 */
const meta = {
  title: 'Primitive/Combobox',
  component: Combobox,
  // Si misura **aperto**: chiuso il popup non esiste e axe non ha niente
  // da guardare. L'imbracatura dichiara qui quale popup apre (`@/prove/apri`).
  //
  // Il grilletto si cerca per `aria-haspopup`, non per `data-slot`:
  // `ComboboxTrigger` rende attraverso `InputGroupButton`, che si riprende
  // lo slot, e nel DOM `combobox-trigger` non esiste. È anche il bottone su
  // cui cade il `button-name` di D14 — che infatti si vede solo nella
  // passata `chiuso`, perché ad elenco aperto Base UI lo rende inerte.
  play: apriCol('[aria-haspopup="listbox"]', 'combobox-content'),

  /**
   * **D14, chiusa il 2026-09-09: i bottoni-icona del combobox restano senza
   * nome accessibile.** Sono il chevron che apre l'elenco e le crocette
   * delle pillole — 16 `button-name` di gravità *critical*, e a differenza
   * dei guardiani del fuoco **queste si chiuderebbero**: basterebbe un
   * `aria-label`. Non si chiudono per scelta, e la motivazione vale oltre il
   * caso: le app Tassullo sono strumenti interni e i lettori di schermo non
   * sono un requisito. Misurata la gravità vera: la crocetta ha
   * `tabindex="-1"`, il fuoco da tastiera non ci passa mai, e le pillole si
   * tolgono con `Backspace`. Se un domani un'app diventasse rivolta al
   * pubblico, si riapre.
   *
   * Si **escludono i nodi**, non si spegne la regola. La differenza conta:
   * spegnere `button-name` su questo file renderebbe cieco il gate su
   * *qualsiasi* bottone senza nome che finisse in una story del combobox,
   * anche uno nostro e nuovo. Escludendo i due `data-slot` si perde la
   * misura esattamente sugli elementi che D14 ha accettato, e su nient'altro.
   * Il costo residuo, scritto perché si sappia: dentro questi due slot un
   * difetto diverso non verrebbe più visto.
   */
  parameters: {
    a11y: {
      context: {
        exclude: ['[data-slot="input-group-button"]', '[data-slot="combobox-chip-remove"]'],
      },
    },
  },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

const famiglie = [
  'Intonaci deumidificanti',
  'Intonaci di risanamento',
  'Intonaci di fondo',
  'Malte strutturali',
  'Malte da allettamento',
  'Finiture a calce',
  'Finiture minerali',
  'Consolidanti',
  'Idrorepellenti',
  'Sigillanti',
]

/** Le norme tecniche: 500 voci finte, generate come `EN xxxx-x`. */
const norme = Array.from({ length: 500 }, (_, i) => {
  const numero = 197 + i
  return `EN ${numero}-${(i % 9) + 1} — Requisito ${i + 1}`
})

const zone = [
  {
    zona: 'Nord',
    cantieri: ['Trento centro', 'Rovereto sud', 'Bolzano fiera', 'Merano terme'],
  },
  {
    zona: 'Centro',
    cantieri: ['Verona porta nuova', 'Vicenza ovest', 'Padova zona industriale'],
  },
  {
    zona: 'Sud',
    cantieri: ['Bari lungomare', 'Lecce centro storico'],
  },
]

export const Predefinito: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="cb-fam">Famiglia</Label>
      <Combobox items={famiglie}>
        <ComboboxInput id="cb-fam" placeholder="Scrivi per filtrare" className="w-full" />
        <ComboboxContent>
          <ComboboxEmpty>Nessuna famiglia trovata.</ComboboxEmpty>
          <ComboboxList>
            {(voce: string) => (
              <ComboboxItem key={voce} value={voce}>
                {voce}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  ),
}

/**
 * **Il criterio di accettazione: 500 voci, filtrabili da tastiera.** È la
 * misura della sessione, non una dimostrazione: le norme tecniche di una
 * scheda prodotto sono di quest'ordine di grandezza, e in un `<select>` nudo
 * si perdono.
 *
 * Da provare davvero: `Tab` sul campo, scrivere `412`, e leggere quante voci
 * restano. Con `autoHighlight` la prima è già evidenziata: `Invio` la sceglie
 * senza toccare le frecce.
 *
 * Il riquadro non rende 500 righe insieme — `ComboboxList` ha
 * `overflow-y-auto` e un tetto d'altezza legato allo spazio disponibile — ma
 * il filtro le attraversa tutte a ogni tasto.
 */
export const CinquecentoVoci: Story = {
  name: 'Cinquecento voci',
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      <Label htmlFor="cb-norme">Norma tecnica</Label>
      <Combobox items={norme} autoHighlight>
        <ComboboxInput
          id="cb-norme"
          placeholder="Scrivi un numero, per esempio 412"
          className="w-full"
        />
        <ComboboxContent>
          <ComboboxEmpty>Nessuna norma trovata.</ComboboxEmpty>
          <ComboboxList>
            {(voce: string) => (
              <ComboboxItem key={voce} value={voce}>
                {voce}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <span className="text-xs text-muted-foreground tabular-nums">
        {norme.length} voci nell'elenco.
      </span>
    </div>
  ),
}

/**
 * **A più scelte, con le pillole — il `multi-select` del piano.** `Backspace` a
 * campo vuoto toglie l'ultima; la crocetta di ogni pillola toglie quella;
 * `←`/`→` si spostano fra le pillole.
 *
 * Le pillole **non sono badge**: stanno dentro un campo, si tolgono, e il
 * campo ha il proprio anello di fuoco. Sono il terzo membro della famiglia
 * `badge` / `toggle-group` / `chip`, e anche qui il nome dice la funzione.
 */
export const PiuScelteConPillole: Story = {
  name: 'Più scelte, con pillole',
  render: function Render() {
    const anchor = useComboboxAnchor()
    return (
      <div className="flex w-96 flex-col gap-2">
        <Label htmlFor="cb-multi">Famiglie di questa scheda</Label>
        <Combobox
          multiple
          autoHighlight
          items={famiglie}
          defaultValue={[famiglie[0], famiglie[3]]}
        >
          <ComboboxChips ref={anchor}>
            <ComboboxValue>
              {(valori: string[]) => (
                <React.Fragment>
                  {valori.map((valore) => (
                    <ComboboxChip key={valore}>{valore}</ComboboxChip>
                  ))}
                  <ComboboxChipsInput id="cb-multi" placeholder="Aggiungi…" />
                </React.Fragment>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>
            <ComboboxEmpty>Nessuna famiglia trovata.</ComboboxEmpty>
            <ComboboxList>
              {(voce: string) => (
                <ComboboxItem key={voce} value={voce}>
                  {voce}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <span className="text-xs text-muted-foreground">
          A campo vuoto, <kbd>Backspace</kbd> toglie l'ultima pillola.
        </span>
      </div>
    )
  },
}

/**
 * **Il `tag-input`**: le stesse pillole senza elenco chiuso alle spalle — le
 * parole chiave di una scheda. Il piano lo elencava come componente a sé; è
 * questo con `items` che fa da suggerimento e non da vincolo.
 */
export const Etichette: Story = {
  render: function Render() {
    const anchor = useComboboxAnchor()
    const suggeriti = ['antigelo', 'esterni', 'interni', 'facciata', 'restauro', 'certificato']
    return (
      <div className="flex w-96 flex-col gap-2">
        <Label htmlFor="cb-tag">Parole chiave</Label>
        <Combobox multiple autoHighlight items={suggeriti} defaultValue={['restauro']}>
          <ComboboxChips ref={anchor}>
            <ComboboxValue>
              {(valori: string[]) => (
                <React.Fragment>
                  {valori.map((valore) => (
                    <ComboboxChip key={valore}>{valore}</ComboboxChip>
                  ))}
                  <ComboboxChipsInput id="cb-tag" placeholder="Aggiungi una parola chiave…" />
                </React.Fragment>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>
            <ComboboxEmpty>Nessun suggerimento.</ComboboxEmpty>
            <ComboboxList>
              {(voce: string) => (
                <ComboboxItem key={voce} value={voce}>
                  {voce}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    )
  },
}

/**
 * Raggruppato per zona, con separatore. Nota la forma: `ComboboxGroup` porta i
 * **propri** `items`, l'etichetta sta dentro il gruppo e le voci dentro
 * `ComboboxCollection`. Scritta diversamente, l'etichetta finisce fra le voci
 * filtrate.
 */
export const ConGruppi: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="cb-cant">Cantiere</Label>
      <Combobox items={zone}>
        <ComboboxInput id="cb-cant" placeholder="Scrivi per filtrare" className="w-full" />
        <ComboboxContent>
          <ComboboxEmpty>Nessun cantiere trovato.</ComboboxEmpty>
          <ComboboxList>
            {(gruppo: (typeof zone)[number]) => (
              <ComboboxGroup key={gruppo.zona} items={gruppo.cantieri}>
                <ComboboxLabel>{gruppo.zona}</ComboboxLabel>
                <ComboboxCollection>
                  {(voce: string) => (
                    <ComboboxItem key={voce} value={voce}>
                      {voce}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
                <ComboboxSeparator />
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  ),
}

/**
 * Dentro un `Field`, con descrizione, errore e icona di ricerca: la forma in
 * cui il combobox comparirà davvero in un modulo. `showClear` mette la
 * crocetta che azzera la scelta, e prende il posto della freccia.
 */
export const InUnCampo: Story = {
  name: 'In un campo',
  render: () => (
    <div className="flex w-96 flex-col gap-8">
      <Field>
        <FieldLabel htmlFor="cb-campo">Famiglia</FieldLabel>
        <Combobox items={famiglie}>
          <ComboboxInput
            id="cb-campo"
            placeholder="Scrivi per filtrare"
            className="w-full"
            showClear
          >
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </ComboboxInput>
          <ComboboxContent>
            <ComboboxEmpty>Nessuna famiglia trovata.</ComboboxEmpty>
            <ComboboxList>
              {(voce: string) => (
                <ComboboxItem key={voce} value={voce}>
                  {voce}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldDescription>
          La famiglia decide quali campi tecnici compaiono più sotto.
        </FieldDescription>
      </Field>
      <Field data-invalid>
        <FieldLabel htmlFor="cb-errore">Norma di riferimento</FieldLabel>
        <Combobox items={norme}>
          <ComboboxInput
            id="cb-errore"
            placeholder="Scrivi per filtrare"
            className="w-full"
            aria-invalid
          />
          <ComboboxContent>
            <ComboboxEmpty>Nessuna norma trovata.</ComboboxEmpty>
            <ComboboxList>
              {(voce: string) => (
                <ComboboxItem key={voce} value={voce}>
                  {voce}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldError>Scegli una norma prima di pubblicare la scheda.</FieldError>
      </Field>
    </div>
  ),
}

export const Disabilitato: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="cb-off">Famiglia</Label>
      <Combobox items={famiglie} defaultValue={famiglie[0]}>
        <ComboboxInput id="cb-off" className="w-full" disabled />
        <ComboboxContent>
          <ComboboxEmpty>Nessuna famiglia trovata.</ComboboxEmpty>
          <ComboboxList>
            {(voce: string) => (
              <ComboboxItem key={voce} value={voce}>
                {voce}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  ),
}

