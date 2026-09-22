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
 * Un campo in cui si scrive per trovare una voce in un elenco lungo, e la si
 * sceglie: l'elenco si stringe a ogni lettera.
 *
 * **Quando sì, quando no.** Il confine con `select` è la lunghezza
 * dell'elenco: fino a poche decine di voci si usa `select`, sopra si usa il
 * combobox. Il segno è uno solo: se per trovare una voce bisogna scorrere,
 * serviva un combobox. Con `multiple` sceglie più voci, che diventano pillole
 * nel campo. Una ricerca che non mette un valore in un modulo — una palette di
 * comandi, un salto a una pagina — è `command`. Le pillole non sono `badge`:
 * stanno dentro un campo e si tolgono.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/combobox
 * ```
 *
 * **Opzioni e parti.** `items` sulla radice è l'elenco; `ComboboxList` riceve
 * una funzione che rende una voce alla volta, già filtrata. `autoHighlight`
 * evidenzia la prima voce rimasta. `ComboboxInput` è il campo, con
 * `showTrigger` (la freccia, accesa di base) e `showClear` (la crocetta che
 * azzera). A più scelte: `multiple`, con `ComboboxChips`, `ComboboxChip` e
 * `ComboboxChipsInput`. Per i gruppi: `ComboboxGroup`, `ComboboxLabel`,
 * `ComboboxCollection`, `ComboboxSeparator`. `ComboboxEmpty` è ciò che si vede
 * quando il filtro non trova niente.
 *
 * **Regole d'uso.**
 *
 * - Il filtro non si scrive: lo fa il componente, senza badare a maiuscole e
 *   accenti.
 * - A più scelte il riquadro si ancora alle pillole, che crescono di riga in
 *   riga: `const anchor = useComboboxAnchor()`, `ref={anchor}` su
 *   `ComboboxChips`, `anchor={anchor}` su `ComboboxContent`. Senza, il
 *   riquadro scivola sotto la pillola su cui si sta scrivendo.
 * - Nei gruppi, ogni `ComboboxGroup` ha i suoi `items`, l'etichetta sta dentro
 *   il gruppo e le voci dentro `ComboboxCollection`. Scritta diversamente,
 *   l'etichetta finisce fra le voci filtrate.
 * - In un modulo il combobox sta dentro un `Field`, come ogni campo.
 *
 * **Tastiera e accessibilità.** `Tab` porta sul campo, si scrive per filtrare,
 * `↓` e `↑` scorrono le voci rimaste, `Invio` sceglie, `Esc` chiude senza
 * cambiare. Con `autoHighlight` bastano tre lettere e `Invio`. A più scelte,
 * `Backspace` a campo vuoto toglie l'ultima pillola, e `←` `→` si spostano fra
 * le pillole. La freccia del campo e la crocetta delle pillole sono bottoni di
 * sola icona, senza un nome per il lettore di schermo; la crocetta non è un
 * fermo di tabulazione, e da tastiera le pillole si tolgono con `Backspace`.
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
 * Cinquecento voci. Scrivendo `412` restano poche norme, la prima è già
 * evidenziata e `Invio` la sceglie. Il riquadro scorre, e il filtro le
 * attraversa tutte a ogni tasto.
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
 * A più scelte, con le pillole: `Backspace` a campo vuoto toglie l'ultima, la
 * crocetta toglie quella, `←` `→` si spostano fra le pillole.
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
 * Le parole chiave di una scheda: le stesse pillole, scelte da un elenco di
 * suggerimenti.
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
 * Voci raggruppate per zona, con separatore: ogni gruppo ha i suoi `items`, e
 * l'etichetta sta dentro il gruppo.
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
 * Dentro un `Field`, con descrizione, errore e icona di ricerca: la forma che
 * prende in un modulo. `showClear` aggiunge la crocetta che azzera la scelta.
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

