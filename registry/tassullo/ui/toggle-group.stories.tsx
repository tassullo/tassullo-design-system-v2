import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  LayoutGridIcon,
  ListIcon,
  SearchIcon,
  TableIcon,
} from 'lucide-react'

import { Badge } from '@/registry/tassullo/ui/badge'
import { Button } from '@/registry/tassullo/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/registry/tassullo/ui/empty'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/registry/tassullo/ui/input-group'
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
 * - A scelta singola un clic sul bottone acceso lo spegne, e il gruppo
 *   resta senza scelta: va bene per un filtro. Quando una scelta deve
 *   esserci sempre, come il livello di un capitolo, il gruppo si tiene
 *   controllato e il valore vuoto non si applica: `onValueChange={(scelti) =>
 *   scelti[0] && setLivello(scelti[0])}`. Il bottone resta acceso.
 * - Il gruppo ha un `aria-label` che dice che cosa si filtra; un bottone di
 *   sola icona ha il suo.
 * - Un conteggio dentro un bottone è uno `<span>` con
 *   `tabular-nums text-muted-foreground`, senza parentesi: «Deumidificanti
 *   12». Il numero sta nel testo e non in un `aria-label`.
 * - Un'opzione a zero resta nella fila, spenta: toglierla farebbe saltare la
 *   fila mentre si filtra. Se era quella scelta resta accesa, e la lista
 *   sotto dice «Nessun risultato in questa categoria» con un bottone per
 *   tornare a tutte: il messaggio sta nella lista, non nel gruppo.
 * - Quando la fila non ci sta va a capo da sé, con la stessa spaziatura fra
 *   le righe e fra i bottoni. Il gruppo attaccato (`spacing={0}`) non va a
 *   capo: è una barra strumenti, e si tiene corta.
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

function Livello() {
  const [livello, setLivello] = useState('capitolo')
  return (
    <ToggleGroup
      variant="outline"
      spacing={0}
      value={[livello]}
      // Il valore vuoto non si applica: un livello c'è sempre.
      onValueChange={(scelti) => {
        if (scelti[0]) setLivello(String(scelti[0]))
      }}
      aria-label="Livello"
    >
      <ToggleGroupItem value="capitolo">Capitolo</ToggleGroupItem>
      <ToggleGroupItem value="sottocapitolo">Sottocapitolo</ToggleGroupItem>
      <ToggleGroupItem value="titoletto">Titoletto</ToggleGroupItem>
    </ToggleGroup>
  )
}

/**
 * Una scelta c'è sempre: cliccando il bottone acceso non succede niente, e
 * per cambiare si clicca un altro. Il gruppo è controllato e non applica il
 * valore vuoto. Nella scena qui sopra, invece, il bottone acceso si spegne.
 */
export const SceltaCheNonSiSvuota: Story = {
  render: () => <Livello />,
}

// Il bottone acceso, cliccato, resta acceso; un altro bottone prende il suo
// posto; da tastiera lo stesso.
export const SceltaCheNonSiSvuotaProva: Story = {
  name: 'Scelta Che Non Si Svuota, prova',
  tags: ['!dev', '!autodocs', 'webkit'],
  render: () => <Livello />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const accesi = () => tela.getAllByRole('button').filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.textContent)
    expect(accesi()).toEqual(['Capitolo'])
    await userEvent.click(tela.getByRole('button', { name: 'Capitolo' }))
    expect(accesi()).toEqual(['Capitolo'])
    await userEvent.click(tela.getByRole('button', { name: 'Titoletto' }))
    expect(accesi()).toEqual(['Titoletto'])
    await userEvent.click(tela.getByRole('button', { name: 'Titoletto' }))
    expect(accesi()).toEqual(['Titoletto'])
    tela.getByRole('button', { name: 'Titoletto' }).focus()
    await userEvent.keyboard('{Enter}')
    expect(accesi()).toEqual(['Titoletto'])
  },
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

const prodotti: [string, string][] = [
  ['Malta da restauro a calce', 'Restauro'],
  ['Intonaco di sacrificio', 'Restauro'],
  ['Consolidante per murature', 'Restauro'],
  ['Intonaco deumidificante', 'Deumidificanti'],
  ['Barriera chimica', 'Deumidificanti'],
  ['Intonaco di fondo', 'Intonaci'],
  ['Intonaco fibrorinforzato', 'Intonaci'],
  ['Malta bastarda', 'Malte'],
  ['Malta per allettamento', 'Malte'],
  ['Rasante minerale', 'Rasanti'],
  ['Rasante fibrato', 'Rasanti'],
  ['Pittura ai silicati', 'Pitture'],
  ['Finitura a calce', 'Finiture'],
  ['Pannello in fibra di legno', 'Isolanti'],
  ['Malta strutturale', 'Strutturali'],
]
const categorie = [...new Set(prodotti.map(([, categoria]) => categoria))]

function FiltroCategorie() {
  const [cerca, setCerca] = useState('')
  const [categoria, setCategoria] = useState('tutte')
  const trovati = prodotti.filter(([nome]) =>
    nome.toLowerCase().includes(cerca.trim().toLowerCase()),
  )
  const quante = (c: string) =>
    c === 'tutte' ? trovati.length : trovati.filter(([, x]) => x === c).length
  const righe = trovati.filter(([, x]) => categoria === 'tutte' || x === categoria)
  return (
    <div className="flex w-96 flex-col gap-4">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Cerca un prodotto"
          placeholder="Cerca un prodotto"
          value={cerca}
          onChange={(e) => setCerca(e.target.value)}
        />
      </InputGroup>
      <ToggleGroup
        variant="outline"
        aria-label="Categoria"
        value={[categoria]}
        onValueChange={(scelti) => {
          if (scelti[0]) setCategoria(String(scelti[0]))
        }}
      >
        {['tutte', ...categorie].map((c) => (
          <ToggleGroupItem
            key={c}
            value={c}
            disabled={c !== categoria && quante(c) === 0}
          >
            {c === 'tutte' ? 'Tutte' : c}
            <span className="tabular-nums text-muted-foreground">{quante(c)}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {righe.length > 0 ? (
        <ul className="flex flex-col divide-y rounded-md border text-sm">
          {righe.map(([nome, c]) => (
            <li key={nome} className="flex justify-between gap-3 px-3 py-2">
              <span>{nome}</span>
              <span className="text-muted-foreground">{c}</span>
            </li>
          ))}
        </ul>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Nessun risultato in questa categoria</EmptyTitle>
            <EmptyDescription>
              {quante('tutte') > 0
                ? `La ricerca trova ${quante('tutte')} prodotti in altre categorie.`
                : 'La ricerca non trova niente in nessuna categoria.'}
            </EmptyDescription>
          </EmptyHeader>
          {quante('tutte') > 0 && (
            <EmptyContent>
              <Button variant="outline" onClick={() => setCategoria('tutte')}>
                Mostra tutte le categorie
              </Button>
            </EmptyContent>
          )}
        </Empty>
      )}
    </div>
  )
}

/**
 * Il filtro per categoria sopra una lista con la ricerca: dieci voci col
 * conteggio in una colonna stretta, che vanno a capo da sé. Una categoria
 * che la ricerca svuota resta nella fila, spenta. Se era quella scelta resta
 * accesa, e la lista dice che lì non c'è niente e offre di tornare a tutte.
 * Si prova scegliendo «Restauro» e cercando «rasante».
 */
export const FiltroPerCategoria: Story = {
  name: 'Filtro per categoria',
  render: () => <FiltroCategorie />,
}

// La fila va a capo senza uscire dal contenitore; la categoria scelta e
// svuotata dalla ricerca resta accesa, la lista lo dice, e il bottone torna a
// «Tutte».
export const FiltroPerCategoriaProva: Story = {
  name: 'Filtro per categoria, prova',
  tags: ['!dev', '!autodocs'],
  render: () => <FiltroCategorie />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const gruppo = tela.getByRole('group', { name: 'Categoria' })
    const contenitore = gruppo.parentElement as HTMLElement
    expect(gruppo.scrollWidth).toBeLessThanOrEqual(contenitore.clientWidth)
    const bottoni = within(gruppo).getAllByRole('button')
    const righe = new Set(bottoni.map((b) => b.offsetTop))
    expect(righe.size).toBeGreaterThan(1)

    await userEvent.click(within(gruppo).getByRole('button', { name: /^Restauro/ }))
    await userEvent.type(tela.getByRole('textbox', { name: 'Cerca un prodotto' }), 'rasante')
    const restauro = within(gruppo).getByRole('button', { name: /^Restauro/ })
    expect(restauro).toHaveAttribute('aria-pressed', 'true')
    expect(within(gruppo).getByRole('button', { name: /^Malte/ })).toBeDisabled()
    expect(tela.getByText('Nessun risultato in questa categoria')).toBeInTheDocument()

    await userEvent.click(tela.getByRole('button', { name: 'Mostra tutte le categorie' }))
    expect(within(gruppo).getByRole('button', { name: /^Tutte/ })).toHaveAttribute('aria-pressed', 'true')
    expect(tela.getByText('Rasante minerale')).toBeInTheDocument()
    expect(within(gruppo).getByRole('button', { name: /^Restauro/ })).toBeDisabled()
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
