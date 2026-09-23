import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  LayoutGridIcon,
  ListIcon,
  TableIcon,
} from 'lucide-react'

import { Badge } from '@/registry/tassullo/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/registry/tassullo/ui/toggle-group'

/**
 * Un filtro che si clicca: una fila di bottoni che restano premuti, per
 * scegliere cosa si vede — una vista, un periodo, le famiglie da mostrare.
 *
 * **Quando sì, quando no.** Il nome dice la funzione, non l'aspetto. Se
 * l'elemento si può accendere e spegnere, è un `toggle-group`; se dice
 * soltanto com'è fatta la cosa che descrive, è un `badge`, che si legge e
 * non si clicca. Un badge con un gestore di clic sopra è il componente
 * sbagliato: non prende il fuoco e non dice se è premuto. Un bottone solo che
 * resta premuto è `toggle`; una scelta dentro un modulo che si invia è
 * `radio-group` o `checkbox`; un'impostazione che ha effetto subito è
 * `switch`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/toggle-group
 * ```
 *
 * **Varianti e opzioni.** `variant`: `default` o `outline` (col bordo, per le
 * fila di filtri). `size`: `sm`, `default`, `lg`. `spacing`: `2` di base, i
 * bottoni staccati; `0` li attacca, con i raggi solo agli estremi. `orientation`:
 * `horizontal` o `vertical`. Il gruppo è a scelta singola; con `multiple`
 * restano accesi in più d'uno. `value` o `defaultValue` sono sempre un array.
 *
 * **Regole d'uso.**
 *
 * - A scelta singola il gruppo dice «guarda questa cosa»: la vista, il
 *   periodo, l'ordinamento. Con `multiple` i bottoni sono filtri che si
 *   sommano: «togli dalla lista tutto il resto».
 * - Il gruppo ha un `aria-label` che dice che cosa si filtra; un bottone di
 *   sola icona ha il suo.
 * - Un conteggio dentro un bottone è uno `<span>` con
 *   `tabular-nums text-muted-foreground`, senza parentesi: «Deumidificanti
 *   12». Il numero sta nel testo e non in un `aria-label`.
 * - Un'opzione a zero resta nella fila, spenta: toglierla farebbe saltare la
 *   fila mentre si filtra.
 * - Lo stato acceso ha lo stesso grigio del sorvolo, come nel `toggle`. Non
 *   si tinge a mano nell'app: una tinta diversa per l'acceso si propone nel
 *   design system, dove vale per tutti.
 *
 * **Tastiera e accessibilità.** Il gruppo è un solo fermo di tabulazione:
 * `Tab` entra sul primo elemento, o sull'ultimo che aveva il fuoco; le frecce
 * spostano il fuoco fra gli elementi, `Home` e `Fine` al primo e all'ultimo;
 * `Spazio` o `Invio` accendono e spengono. Ogni elemento è un bottone che si
 * annuncia premuto o non premuto.
 */
const meta = {
  title: 'Primitive/ToggleGroup',
  component: ToggleGroup,
} satisfies Meta<typeof ToggleGroup>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Filtri che si sommano sopra una lista: col bordo, uno già acceso.
 */
export const Filtri: Story = {
  render: () => (
    <ToggleGroup
      multiple
      variant="outline"
      defaultValue={['pubblicati']}
      aria-label="Filtra i prodotti"
    >
      <ToggleGroupItem value="pubblicati">Pubblicati</ToggleGroupItem>
      <ToggleGroupItem value="bozze">Bozze</ToggleGroupItem>
      <ToggleGroupItem value="archiviati">Archiviati</ToggleGroupItem>
      <ToggleGroupItem value="senza-scheda">Senza scheda tecnica</ToggleGroupItem>
    </ToggleGroup>
  ),
}

/**
 * A scelta singola, attaccato: la vista della lista, una alla volta. Cambia
 * subito ciò che si vede, senza niente da inviare.
 */
export const SceltaSingola: Story = {
  render: () => (
    <ToggleGroup
      variant="outline"
      spacing={0}
      defaultValue={['tabella']}
      aria-label="Vista della lista"
    >
      <ToggleGroupItem value="tabella" aria-label="Tabella">
        <TableIcon />
        Tabella
      </ToggleGroupItem>
      <ToggleGroupItem value="griglia" aria-label="Griglia">
        <LayoutGridIcon />
        Griglia
      </ToggleGroupItem>
      <ToggleGroupItem value="elenco" aria-label="Elenco">
        <ListIcon />
        Elenco
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

/**
 * Lo stesso gruppo con `spacing={0}` e con la spaziatura di base: attaccato è
 * la forma della barra strumenti, staccato quella della fila di filtri.
 */
export const Attaccato: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <ToggleGroup variant="outline" spacing={0} aria-label="Allineamento, attaccato">
        <ToggleGroupItem value="sinistra" aria-label="A sinistra">
          <AlignLeftIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="centro" aria-label="Al centro">
          <AlignCenterIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="destra" aria-label="A destra">
          <AlignRightIcon />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup variant="outline" aria-label="Allineamento, staccato">
        <ToggleGroupItem value="sinistra" aria-label="A sinistra">
          <AlignLeftIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="centro" aria-label="Al centro">
          <AlignCenterIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="destra" aria-label="A destra">
          <AlignRightIcon />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
}

/**
 * In colonna, per i filtri in un pannello laterale.
 */
export const Verticale: Story = {
  render: () => (
    <ToggleGroup
      multiple
      orientation="vertical"
      variant="outline"
      defaultValue={['intonaci']}
      aria-label="Famiglia"
    >
      <ToggleGroupItem value="intonaci">Intonaci</ToggleGroupItem>
      <ToggleGroupItem value="malte">Malte</ToggleGroupItem>
      <ToggleGroupItem value="finiture">Finiture</ToggleGroupItem>
    </ToggleGroup>
  ),
}

/**
 * Gli stessi contenuti come filtri e come badge. I filtri hanno il bordo dei
 * controlli e uno è acceso; i badge sono pieni, più piccoli, e non si
 * cliccano.
 */
export const FiltriControBadge: Story = {
  name: 'Filtri contro badge',
  render: () => (
    <div className="flex w-128 flex-col gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">
          Filtri — si cliccano, cambiano la lista sotto
        </span>
        <ToggleGroup
          multiple
          variant="outline"
          defaultValue={['deumidificanti']}
          aria-label="Filtra per famiglia"
        >
          <ToggleGroupItem value="deumidificanti">Deumidificanti</ToggleGroupItem>
          <ToggleGroupItem value="risanamento">Risanamento</ToggleGroupItem>
          <ToggleGroupItem value="strutturali">Strutturali</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">
          Badge — si leggono, dicono com'è fatta questa scheda
        </span>
        <div className="flex flex-wrap items-center gap-1">
          <Badge>Deumidificanti</Badge>
          <Badge variant="secondary">Risanamento</Badge>
          <Badge variant="outline">Strutturali</Badge>
        </div>
      </div>
    </div>
  ),
}

/**
 * Il conteggio dentro il filtro, a una, tre e quattro cifre: il bottone
 * cresce solo se cambia il numero di cifre, e l'opzione a zero resta spenta.
 * L'ultima fila è il contro-esempio: badge col numero e un clic sopra.
 */
export const ChipColConteggio: Story = {
  name: 'Chip col conteggio',
  render: () => {
    const conteggi: [string, number][] = [
      ['Deumidificanti', 12],
      ['Risanamento', 9],
      ['Strutturali', 147],
      ['Finiture', 0],
    ]
    return (
      <div className="flex w-128 flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">
            Il chip col conteggio — si clicca, e il numero dice quante righe
            restano
          </span>
          <ToggleGroup
            multiple
            variant="outline"
            defaultValue={['Deumidificanti']}
            aria-label="Filtra per famiglia"
          >
            {conteggi.map(([voce, quante]) => (
              <ToggleGroupItem key={voce} value={voce} disabled={quante === 0}>
                {voce}
                <span className="tabular-nums text-muted-foreground">{quante}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">
            A una, tre e quattro cifre: il chip cresce solo di quello che le
            cifre occupano — e finché il numero di cifre non cambia (da 9 a 8,
            da 128 a 147) non si muove niente
          </span>
          <ToggleGroup
            multiple
            variant="outline"
            defaultValue={['Strutturali']}
            aria-label="Filtra per famiglia, conteggi diversi"
          >
            {conteggi.slice(0, 3).map(([voce], i) => (
              <ToggleGroupItem key={voce} value={voce}>
                {voce}
                <span className="tabular-nums text-muted-foreground">
                  {[3, 128, 1204][i]}
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">
            Il contro-esempio — badge col numero fra parentesi e un gestore di
            clic sopra: non prende il fuoco e non dice di essere premuto
          </span>
          <div className="flex flex-wrap items-center gap-1">
            {conteggi.slice(0, 3).map(([voce, quante]) => (
              <Badge key={voce} variant="secondary">
                {voce} ({quante})
              </Badge>
            ))}
          </div>
        </div>
      </div>
    )
  },
}

/**
 * Lo stato acceso a confronto, con l'ultimo bottone di ogni fila sorvolato:
 * il grigio in uso, dove acceso e sorvolato coincidono, e due tinte arancio
 * non adottate, dove il sorvolo muove solo il bordo.
 */
export const AccesoPienoOTenue: Story = {
  name: 'Acceso: la scelta del grigio',
  render: () => {
    const voci = [
      'Pubblicati',
      'Bozze',
      'Archiviati',
      'Deumidificanti',
      'Risanamento',
      'Strutturali',
      'Senza scheda',
    ]
    const accesi = ['Pubblicati', 'Deumidificanti', 'Strutturali']
    const sorvolata = 'Senza scheda'

    const barra = (titolo: string, nota: string, acceso: string, hover: string) => (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{titolo}</span>
          <span className="text-xs text-muted-foreground">{nota}</span>
        </div>
        <ToggleGroup
          multiple
          variant="outline"
          defaultValue={accesi}
          aria-label={titolo}
          className="flex-wrap"
        >
          {voci.map((voce) => (
            <ToggleGroupItem
              key={voce}
              value={voce}
              className={`${acceso} ${voce === sorvolata ? hover : ''}`}
            >
              {voce}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    )

    return (
      <div className="flex w-160 flex-col gap-8">
        {barra(
          '1. Grigio, in uso',
          'Acceso e sorvolato sono lo stesso grigio: le due pillole a destra sono identiche.',
          '',
          'bg-muted text-foreground',
        )}
        {barra(
          '2. Arancio pieno, non adottato',
          'Acceso riempie il fondo, il sorvolo muove solo il bordo. Due proprietà diverse.',
          'aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground',
          'border-primary bg-transparent',
        )}
        {barra(
          '3. Arancio tenue, non adottato',
          'Acceso tinge appena il fondo e scrive in arancio scuro; il sorvolo muove il bordo.',
          'aria-pressed:border-primary-border aria-pressed:bg-primary-subtle aria-pressed:text-accent-ink',
          'border-primary bg-transparent',
        )}
      </div>
    )
  },
}
