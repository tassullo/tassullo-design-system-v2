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
 * **`toggle-group` è il chip del v1**, e questa è la riga da ricordare di
 * tutta la sessione: *il nome dice la funzione, non l'aspetto*. Un `badge` è
 * un'etichetta che **si legge**; un chip di filtro è un comando che **si
 * clicca**. Nel v1 confonderli è costato riscritture ripetute — Anagrafe li ha
 * fatti a mano due volte, `pdt-prod-chip` e `adm-ruolo-chip`, e nessuna delle
 * due è un filtro: sono link travestiti da pillole.
 *
 * Da qui in avanti, sopra una lista, i filtri sono questo componente. Se
 * qualcosa somiglia a un chip ma non cambia ciò che si vede sotto, non è un
 * chip: è un `badge`.
 *
 * ## Un ri-stile, di rincalzo a quello del `toggle`
 *
 * `data-[size=sm]:rounded-[min(var(--radius-md),10px)]` → `rounded-md`, che è
 * lo stesso raggio al pixel ma preso dal tema. Tutto il resto — struttura,
 * props, `spacing`, `orientation` — è il preset intatto.
 *
 * ## Due modi, e vanno scelti a ragion veduta
 *
 * Il predefinito è la **scelta singola**: il gruppo si comporta come una fila
 * di radio — uno acceso, e commutandone un altro il primo si spegne. È la
 * scelta della vista, del periodo, dell'ordinamento.
 *
 * Con `multiple` restano accesi in più d'uno: quelli sono **filtri**, e si
 * sommano. Vale la pena sceglierlo a ragion veduta, perché è la differenza fra
 * «guarda questa cosa» e «togli dalla lista tutto il resto».
 *
 * Da tastiera Base UI porta il comportamento standard: `Tab` entra nel gruppo
 * **una volta sola** e si ferma sul primo elemento (o sull'unico acceso, a
 * scelta singola), le **frecce** spostano fra gli elementi, `Spazio` commuta.
 * È la differenza fra un gruppo di filtri e sei fermi di tabulazione da
 * attraversare a ogni giro.
 *
 * ## Il rilievo del `toggle` vale anche qui
 *
 * Sorvolato e acceso sono lo stesso `bg-muted`: passando il puntatore su una
 * fila di filtri non si distingue più quali erano accesi. Misurato e
 * documentato in `Primitive/Toggle`, in carico a **M2.9** perché il rimedio
 * (stato acceso su `primary-subtle`) è una scelta di sistema.
 */
const meta = {
  title: 'Primitive/ToggleGroup',
  component: ToggleGroup,
} satisfies Meta<typeof ToggleGroup>

export default meta
type Story = StoryObj<typeof meta>

/** I filtri di una lista prodotti: si sommano, e si vede subito quali sono accesi. */
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
 * A scelta singola: la vista della lista. Uno acceso alla volta, come una fila
 * di radio — ma senza modulo attorno, perché non si invia niente: cambia
 * subito ciò che si vede.
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
 * `spacing={0}` fa il gruppo **attaccato**: i raggi restano solo agli estremi
 * e i bordi interni si sovrappongono. È la forma della barra strumenti; con lo
 * spazio (predefinito, `spacing={2}`) è la forma della fila di filtri.
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

/** In colonna, quando i filtri stanno in una barra laterale invece che sopra la lista. */
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
 * **Il criterio di accettazione di questo task, messo a confronto.** Sopra i
 * filtri, sotto i badge, sugli stessi contenuti.
 *
 * Le differenze si vedono senza leggere: i filtri hanno il **bordo** e il
 * raggio dei controlli, si allineano su una riga d'azione, e uno è **acceso**;
 * i badge sono pieni, senza contorno, più piccoli, e stanno appoggiati al
 * contenuto che descrivono. Il gruppo dei filtri porta un `aria-label` e i
 * suoi elementi sono bottoni con `aria-pressed`; i badge sono `<span>` e il
 * lettore di schermo non li annuncia come comandi.
 *
 * Se in una pagina questa differenza non si vede a colpo d'occhio, il primo
 * sospetto è che si sia usato il componente sbagliato.
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
 * **Come si scrive un numero dentro un chip.** `Filtri contro badge`, qui
 * sopra, dice *quale componente*; questa dice *come ci si mette dentro il
 * conteggio* — e sono due cose diverse, perché il conteggio è il punto in cui
 * un chip di filtro si confonde con un badge cliccabile.
 *
 * Non serve un componente. Il conteggio è uno `<span>` dentro
 * `ToggleGroupItem`, e le tre cose che lo rendono leggibile sono tre classi:
 *
 * - **`text-muted-foreground`** — il numero è subordinato all&apos;etichetta.
 *   Allo stesso peso si legge «Deumidificanti 12» come se 12 facesse parte del
 *   nome, che è esattamente il difetto misurato in M4ter.7 sul contatore del
 *   percorso.
 * - **`tabular-nums`** — il tema porta `tnum` su Inter (v. `Tema/Cifre`), e
 *   senza, `9` e `8` non sono larghi uguali: un conteggio che si aggiorna
 *   senza cambiare numero di cifre sposta lo stesso il chip, e con lui tutti
 *   quelli alla sua destra. Una fila di filtri che si muove mentre si filtra
 *   fa perdere il chip che si stava per cliccare. Le cifre in più un po&apos; di
 *   spazio lo prendono comunque — quello non si può togliere, e non è il
 *   difetto: il difetto è muoversi **senza** che il numero sia cambiato di
 *   lunghezza.
 * - **niente parentesi** — «Deumidificanti (12)» aggiunge due caratteri che
 *   non dicono niente in più. Il colore separa già il numero dal nome.
 *
 * Il numero **non va in un `aria-label`**: il testo del bottone è già
 * «Deumidificanti 12», e un `aria-label` lo sostituirebbe con una versione
 * scritta a mano che il giorno dopo non corrisponde più.
 *
 * ## Il conteggio a zero
 *
 * Un&apos;opzione a zero **resta in elenco, spenta**: toglierla farebbe
 * saltare la fila mentre si filtra, e se fosse già scelta non ci sarebbe più
 * modo di deselezionarla. È la stessa regola di `useOpzioniSfaccettate`
 * (`data-table-filtro-sfaccettato.tsx`), che il conteggio lo calcola davvero
 * — ma vuole un&apos;istanza TanStack, quindi sopra una lista che non è una
 * tabella il numero lo conta la pagina e lo scrive qui.
 *
 * ## E il badge cliccabile di Officina non è questo
 *
 * Officina scrive oggi queste fila come **badge con il numero nel testo, e un
 * `onClick` sopra** (Triage, Ricambi, Piani). La differenza si vede senza
 * leggere e si sente da tastiera: il chip è un `<button>` con `aria-pressed`,
 * ha il bordo e la taglia dei controlli, e `Tab` entra nel gruppo una volta
 * sola lasciando le frecce a spostarsi dentro; il badge è uno `<span>` — non
 * prende il fuoco, non dichiara di essere premuto, e un lettore di schermo non
 * lo annuncia come comando. La terza fila qui sotto è quella forma, messa
 * accanto perché la differenza si guardi invece di raccontarla.
 *
 * ## Scelto il 2026-09-21: il filtro è il chip, e la ragione è lo **stato**
 *
 * **Decisione di Francesco** (M4ter.11), guardando le tre fila: il filtro a
 * conteggio del Catalogo di Studio si compone come la **prima** fila, cioè
 * `toggle-group`. La ragione non è che il badge sia brutto — è che **un filtro
 * ha uno stato acceso e uno spento**, e deve dirlo: `aria-pressed`, il fondo
 * che cambia, il fuoco che ci arriva. Un badge quello stato non ce l'ha, e non
 * può averlo senza smettere di essere un badge.
 *
 * Da cui la regola, che è quella del `CLAUDE.md` vista da un'altra faccia:
 * **se l'elemento può essere acceso o spento, è un `toggle-group`**; se dice
 * soltanto com'è fatta la cosa che sta descrivendo, è un `badge`. Il conteggio
 * non sposta la scelta né da una parte né dall'altra: un numero si può
 * scrivere dentro tutti e due.
 *
 * La terza fila **resta in scena**, e adesso con un ruolo dichiarato: non è
 * un'alternativa fra cui scegliere, è il **contro-esempio** — la forma che
 * somiglia a un filtro e non lo è. Costa zero tenerla, ed è l'unico posto in
 * cui le due si vedono accanto.
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
            Quello che Officina scrive oggi — badge col numero fra parentesi e
            un gestore di clic sopra: non prende il fuoco e non dice di essere
            premuto
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
 * **Verbale di una decisione presa: lo stato «acceso» resta quello di shadcn**
 * (2026-09-09, Francesco). Questa pagina non propone niente — registra un
 * confronto già fatto, perché fra sei mesi il difetto qui sotto si «riscopre»
 * e qualcuno lo richiude di testa sua senza sapere che era stato guardato.
 *
 * **La decisione, e il perché.** L'arancio del brand resta ai **bottoni
 * d'azione e alle cose importanti**: se tinge anche ogni filtro acceso, su una
 * pagina di lista diventa il colore di sfondo e smette di segnalare. Si
 * riprende in mano in **FASE 4**, quando si studiano le pagine modello e si
 * vede quanti filtri accesi ci stanno davvero su una barra vera. Fino ad
 * allora: nessun ri-stile, `toggle.tsx` resta il preset intatto.
 *
 * **Cosa si accetta accettandola**: acceso e sorvolato sono lo stesso grigio,
 * misurato al byte (236,234,232 tutti e due in chiaro; 38,38,38 in scuro).
 * Passando il mouse su una barra di filtri non si distingue più quali erano
 * accesi. È il difetto della barra 1.
 *
 * Tre barre con gli stessi sette filtri e gli stessi tre accesi.
 * L'ultima pillola di ogni barra è **spenta col puntatore sopra**, simulata con
 * le classi che il sorvolo applica: serve a vedere se lo stato acceso si
 * distingue dal sorvolo, che è il difetto misurato del preset.
 *
 * 1. **Il preset shadcn, com'è oggi.** Acceso e sorvolato sono lo stesso
 *    `bg-muted`, al byte: 236,234,232 tutti e due. Le due pillole a destra
 *    sono indistinguibili.
 * 2. **Arancio pieno**, cioè `.chip.is-active` del v1 alla lettera:
 *    `bg-primary`, testo nero, bordo arancio. In più il sorvolo torna a
 *    muovere **solo il bordo**, come faceva `.chip:hover` nel v1 — due stati
 *    su due proprietà diverse, ed è la ragione per cui nel v1 la confusione
 *    non esisteva.
 * 3. **Arancio tenue**, cioè quello che il token `--color-accent-light` del v1
 *    dichiara nel commento («chip attivi») pur non essendo il colore che il
 *    v1 ha poi spedito: `primary-subtle`, bordo `primary-border`, testo
 *    `accent-ink`.
 *
 * Le barre 2 e 3 sono **scartate, non in attesa**: le classi vivono solo qui,
 * come campione. Se in FASE 4 si decidesse di adottarne una, va **nel `cva` di
 * `toggle.tsx`** — stringhe di classi, gradino 2, un posto solo per tutte le
 * app, `check:registry` verde — e mai passata a mano dalle app, che è la
 * deriva che il design system esiste per impedire.
 *
 * Della barra 2 vale la pena tenere a mente **una cosa indipendente dal
 * colore**: nel v1 il sorvolo muoveva **solo il bordo** e l'acceso riempiva il
 * fondo — due stati su due proprietà diverse. È il motivo per cui nel v1
 * l'ambiguità non esisteva, ed è la parte riutilizzabile qualunque tinta si
 * scelga.
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
          '1. Preset shadcn, oggi',
          'Acceso e sorvolato sono lo stesso grigio: le due pillole a destra sono identiche.',
          '',
          'bg-muted text-foreground',
        )}
        {barra(
          '2. Arancio pieno — il v1 spedito',
          'Acceso riempie il fondo, il sorvolo muove solo il bordo. Due proprietà diverse.',
          'aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground',
          'border-primary bg-transparent',
        )}
        {barra(
          '3. Arancio tenue — il token del v1',
          'Acceso tinge appena il fondo e scrive in arancio scuro; il sorvolo muove il bordo.',
          'aria-pressed:border-primary-border aria-pressed:bg-primary-subtle aria-pressed:text-accent-ink',
          'border-primary bg-transparent',
        )}
      </div>
    )
  },
}
