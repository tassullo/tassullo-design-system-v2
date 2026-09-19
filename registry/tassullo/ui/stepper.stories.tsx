import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckIcon } from 'lucide-react'

import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/registry/tassullo/ui/stepper'

/**
 * **La barra dei passi — e non è un componente nostro.** Viene dal registry
 * `@reui` (ReUI, Keenthemes), che è la stessa variante Base UI dello stesso
 * preset `base-nova` che usiamo qui: stesse primitive, stesso `style`. È stato
 * adottato **senza modifiche**, ed è la prima volta che il registry Tassullo
 * ridistribuisce il codice di un terzo.
 *
 * Perché non l'abbiamo scritto: serve tre volte in due pagine di Studio, e la
 * scala della regola 4bis si esaurisce al gradino 1 — esiste già, e in casa
 * nostra. `componenti-propri.json` resta vuoto.
 *
 * ## La licenza viaggia col componente
 *
 * MIT. L'unica condizione che pone è che l'avviso di copyright resti nelle
 * copie: sta in testa a `stepper.tsx` e **non si toglie**, e l'item installa
 * accanto `src/tassullo-reui-MIT.txt` col testo integrale. Non è una
 * formalità da ricordare a memoria: `npm run check:registry` **fallisce** se
 * l'avviso sparisce dal file, perché senza di quello la ridistribuzione alle
 * app non è coperta.
 *
 * ## Lo stato lo deriva il componente: `completed` quasi mai si passa
 *
 * `StepperItem` calcola da sé `step < activeStep → fatto`,
 * `step === activeStep → corrente`, il resto **da fare**. La prop `completed`
 * è un **forzante**, per il caso in cui non sia derivabile — un modulo con
 * convalida dove si torna indietro a correggere il primo passo lasciando il
 * secondo già buono. Passarla fissa in una barra che si clicca è un difetto
 * che si vede subito: i passi forzati restano accesi **anche quando si torna
 * al primo**, e una barra a cinque segmenti su «passo 1 di 5» ne mostra due
 * accesi. Qui non si passa, e la spunta la dà `indicators` sulla radice, che
 * è l'API fatta apposta.
 *
 * ## Si compone così, e non come lo compongono loro
 *
 * **Queste story non usano `StepperNav`, e la ragione è un difetto ARIA del
 * componente, misurato qui il 2026-09-19.** Nella composizione documentata da
 * reui la radice `Stepper` porta `role="tablist"` e i `role="tab"` stanno
 * dentro un `<nav>`: il `nav` è un punto di riferimento, quindi spezza la
 * catena fra la lista e le sue schede. Il gate dà **due** regole violate,
 * `aria-required-children` sulla radice («ha un figlio `nav`, che lì non ci
 * può stare») e `aria-required-parent` su **ogni** scheda.
 *
 * Qui il gruppo lo fa un elemento nostro con `role="tablist"` scritto sopra, e
 * la radice passa a `role="group"`. Tre conseguenze, tutte trovate misurando:
 *
 * 1. Cambiando ruolo alla radice va **tolta anche `aria-orientation`**, che il
 *    componente scrive per il `tablist` e che su `group` non è ammessa
 *    (`aria-allowed-attr`). Si toglie passandola `undefined`, perché lo spread
 *    dei props viene dopo.
 * 2. Ogni scheda punta con `aria-controls` a `stepper-panel-N`, ma né
 *    `StepperPanel` né `StepperContent` scrivono quell'`id`: **lo deve mettere
 *    chi compone**, o l'attributo punta al nulla (`aria-valid-attr-value`).
 * 3. E i pannelli devono esserci **tutti**, non solo quello attivo. Detto
 *    altrimenti, **una barra di passi senza pannelli non si può fare**: una
 *    scheda che non comanda niente non è una scheda — ed è la ragione per cui
 *    anche la barra a segmenti, qui sotto, un pannello ce l'ha.
 *
 * Senza `StepperNav` cade anche il nome di gruppo `group/stepper-nav`, su cui
 * `StepperItem` e `StepperSeparator` appoggiano le proprie misure. **Non si
 * rimette**, e non è una perdita: quelle misure qui si scrivono in chiaro, ed
 * è l'unico modo di avere l'impaginazione giusta (v. sotto).
 *
 * Nessuna delle tre si chiude ri-stilando: sono ruoli e attributi, non
 * stringhe di classi, e la regola 4bis non lascia toccarli. **In carico a
 * Francesco**: o la composizione resta questa e si ripete a ogni uso (M4ter.5
 * ne ha due), o si autorizza l'eccezione a 4bis e si sposta `role="tablist"`
 * dalla radice a `StepperNav` — una riga, che chiuderebbe il punto 1 e il 2.
 *
 * ## L'impaginazione orizzontale va scritta, non ereditata
 *
 * Due difetti visti sullo schermo, non dedotti, e valgono per chiunque componga
 * una barra dei passi **con le etichette**:
 *
 * · **L'etichetta non può stare nella stessa riga del trattino.** Se ci sta, il
 *   trattino si centra sull'altezza di pallino *più* etichetta, quindi cade
 *   sotto il centro del pallino; e la sua lunghezza è quel che avanza dopo
 *   l'etichetta, quindi **cambia da passo a passo** («Dati dell'impresa» è più
 *   largo di «Tipo di utente», e si vede). Qui pallino e trattino stanno in una
 *   riga loro, e l'etichetta sotto.
 * · **Le colonne vanno rese uguali dalla griglia, non dal contenuto.**
 *   `grid-flow-col auto-cols-fr` dà a ogni passo la stessa frazione, e da lì i
 *   trattini escono tutti della stessa lunghezza. Con `flex-1` sui passi no: la
 *   larghezza la detta l'etichetta.
 * · **Il trattino si ancora al centro dei pallini, non allo spazio fra loro.**
 *   `absolute left-1/2 -right-1/2` dentro una riga larga quanto la colonna lo fa
 *   partire dal centro di questo pallino e arrivare al centro del prossimo —
 *   che è la geometria con cui reui fa il tratto verticale, portata in
 *   orizzontale. Così il pallino può stare **centrato** nella sua colonna, col
 *   titolo centrato sotto, invece di essere schiacciato a sinistra.
 *   `top-1/2 -translate-y-1/2` lo centra sul pallino a **qualunque densità**:
 *   nessun numero fisso da riaggiustare quando `--spacing` cambia.
 * · **L'etichetta sta fuori dal grilletto.** Il grilletto è `rounded-full` e
 *   porta l'anello di fuoco: se ci si mette dentro anche il titolo, premendo
 *   `Tab` si accende una pastiglia attorno a pallino *ed* etichetta invece del
 *   cerchio attorno al pallino. Il prezzo è che il nome della scheda va dato a
 *   mano con `aria-label` — senza, la scheda si chiamerebbe «2».
 *
 * ## La trappola del nome, di nuovo
 *
 * Lo stepper è un `tablist` di `tab`: i passi **si navigano** e uno **è
 * selezionato**. Il misuratore di robustezza di una password gli somiglia —
 * N trattini, M accesi — ma non si naviga e non si seleziona, quindi non è
 * questo componente e resta codice della pagina. È `badge` scambiato per
 * `toggle-group`, un giro più in là.
 *
 * ## Il ri-stile è una stringa sola
 *
 * Zero esadecimali, zero valori arbitrari, e i due corpi che usa — `text-xs`
 * e `text-sm` — sono gradini che il tema tara, quindi seguono la densità da
 * soli.
 *
 * L'unico cambio è il **pallino del passo da fare**, che reui fa `bg-accent`:
 * `--accent` in shadcn è il grigio di sorvolo dei menu, ed è talmente vicino al
 * fondo che il pallino non si vede: i passi ancora da fare sembrano numeri
 * appoggiati sul niente. Passa a `bg-muted text-muted-foreground`, cioè **lo
 * stesso colore del trattino che collega i pallini** — così il non-fatto è una
 * cosa sola, pallini e collegamenti, e il fatto e il corrente si staccano.
 * È una stringa di classi e basta (gradino 2 della regola 4bis): forma, props,
 * varianti ed export restano di reui, e `check:registry` lo conta fra i
 * ri-stilati sopra una forma intatta.
 *
 * ## Da tastiera — provato a mano da Francesco il 2026-09-19
 *
 * Frecce, `Home` e `End` funzionano. In automazione non si possono provare (i
 * tasti arrivano con `event.key` vuoto e i bottoni non si attivano), quindi
 * quella misura è sempre stata e resta **a mano**.
 *
 * **La barra è un solo fermo di tabulazione, non uno per pallino.** Il
 * `tabIndex` vale `0` sul passo selezionato e `-1` su tutti gli altri
 * (`stepper.tsx`), quindi `Tab` entra nella barra e si posa sul passo corrente,
 * e il `Tab` dopo **esce** invece di passare al pallino successivo. Da lì dentro
 * si naviga con le frecce. È la stessa scelta del `toggle-group`, e la ragione è
 * la stessa: altrimenti una barra da cinque passi sarebbero cinque fermi da
 * attraversare a ogni giro. Da cui una conseguenza che sembra un difetto e non
 * lo è: **prima di aver dato il fuoco a un pallino, `Home` non fa nulla** — non
 * c'è nessun elemento su cui agire.
 *
 * **E le frecce spostano il fuoco senza cambiare il passo.**
 * `focusNext`/`focusPrev`/`focusFirst`/`focusLast` chiamano `.focus()` e basta:
 * il passo corrente cambia solo con `Invio`, `Spazio` o un clic. È
 * l'*attivazione manuale*, quella raccomandata quando il pannello costa — e qui
 * costa, perché il passo di un modulo può avere dentro un form intero. Chi si
 * aspetta che la freccia cambi anche il contenuto sta pensando all'attivazione
 * automatica, che è un pattern diverso e non è questo.
 */
const meta = {
  title: 'Primitive/Stepper',
  component: Stepper,
  // `layout: 'padded'` invece del `centered` globale, ed è una correzione
  // misurata, non un gusto: col canvas centrato `body` è un flex e
  // `#storybook-root` si stringe sul contenuto, quindi il `w-full` della radice
  // vale la larghezza del contenuto — 254px invece di 576 — e i trattini, che
  // sono `flex-1`, si prendono quel che resta, cioè **zero**. Una barra dei
  // passi senza trattini non è il componente che si sta guardando.
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj<typeof meta>

/**
 * La spunta del passo fatto: è l'API della radice, non un `if` nel markup.
 *
 * Lo stesso oggetto accetta `loading`, che è **l'unico stato che non si deriva**
 * dal passo corrente: si dichiara con `loading` sul singolo `StepperItem` e vale
 * solo se quel passo è anche quello corrente (`loading && step === activeStep`).
 * Qui non è in scena perché nessuna delle quattro lo userebbe davvero — quando
 * servirà, a un passo che aspetta il server, si aggiunge qui e si mette in
 * scena: una configurazione che nessuna story esercita è una configurazione che
 * nessuno ha guardato.
 */
const INDICATORI = { completed: <CheckIcon className="size-3" /> }

/**
 * Il trattino di **collegamento** fra un passo e il successivo. `m-0` toglie il
 * margine che il componente si porta (lì serviva a staccarlo dentro il `<nav>`)
 * così il trattino arriva al bordo del pallino; il colore rende leggibile
 * l'avanzamento, visto che pallino fatto e pallino corrente condividono
 * `bg-primary`.
 *
 * **Solo `completed`, mai `active`**, ed è una distinzione che si vede a colpo
 * d'occhio quando è sbagliata: il tratto che segue il passo corrente è la
 * strada *non ancora percorsa*. Accendendolo, una barra ferma al secondo di tre
 * si legge come se fosse arrivata in fondo. Il segmento della barra a segmenti
 * è un'altra cosa — lì il tratto **è** il passo, non il collegamento, e il
 * corrente va acceso.
 */
const TRATTO =
  'absolute top-1/2 left-1/2 -right-1/2 mx-4 my-0 h-0.5 -translate-y-1/2 data-[state=completed]:bg-primary'

/**
 * La variante **in linea** dello stesso tratto: lì il pallino non è centrato in
 * una colonna, sta in fila col proprio titolo, e il tratto è semplicemente
 * quello che avanza fra un passo e il successivo. Niente posizionamento
 * assoluto, quindi, ma un `flex-1` in mezzo alla riga.
 */
const TRATTO_IN_LINEA = 'm-0 h-0.5 flex-1 data-[state=completed]:bg-primary'

/**
 * I pannelli. Il contenitore porta l'`id` a cui ogni scheda punta con
 * `aria-controls` — `StepperContent` non lo scrive — più `role="tabpanel"` e
 * il rimando alla propria scheda. Ci sono tutti e N, anche quelli non attivi:
 * un `aria-controls` che punta a un elemento inesistente è una violazione, e
 * `StepperContent` rende `null` finché il suo passo non è quello corrente.
 */
function Pannelli({ testi }: { testi: string[] }) {
  return (
    <StepperPanel>
      {testi.map((testo, i) => (
        <div
          key={testo}
          id={`stepper-panel-${i + 1}`}
          role="tabpanel"
          aria-labelledby={`stepper-tab-${i + 1}`}
        >
          <StepperContent value={i + 1}>
            <p className="text-muted-foreground text-sm">{testo}</p>
          </StepperContent>
        </div>
      ))}
    </StepperPanel>
  )
}

const PASSI = [
  { titolo: 'Dati dell’impresa', descrizione: 'Ragione sociale e partita IVA' },
  { titolo: 'Tipo di utente', descrizione: 'Impresa, studio o libero professionista' },
  { titolo: 'Consensi', descrizione: 'Privacy e condizioni d’uso' },
]

/**
 * **Orizzontale**, il modo che serve alla registrazione di Studio: i passi
 * stanno in riga sopra il modulo, il corrente è pieno d'arancio, i fatti
 * portano la spunta e quelli da fare restano sul grigio d'ambiente.
 *
 * Si clicca: i passi sono schede, e cambiando passo cambiano il pannello sotto
 * **e** i trattini alle spalle. È il modo giusto di guardare se lo stato è
 * derivato bene — una barra che si clicca e resta ferma sta dicendo il falso.
 */
export const Orizzontale: Story = {
  render: () => (
    <Stepper
      role="group"
      aria-orientation={undefined}
      defaultValue={2}
      indicators={INDICATORI}
      className="w-full max-w-xl space-y-8"
    >
      <div
        role="tablist"
        aria-label="Passi della registrazione"
        className="grid w-full grid-flow-col auto-cols-fr"
      >
        {PASSI.map((passo, i) => (
          <StepperItem
            key={passo.titolo}
            step={i + 1}
            className="flex-col items-center gap-2"
          >
            <span className="relative flex w-full justify-center">
              <StepperTrigger
                aria-label={`${passo.titolo}. ${passo.descrizione}`}
                className="relative z-10"
              >
                <StepperIndicator>{i + 1}</StepperIndicator>
              </StepperTrigger>
              {i < PASSI.length - 1 && <StepperSeparator className={TRATTO} />}
            </span>
            <span aria-hidden className="w-full text-center">
              <StepperTitle>{passo.titolo}</StepperTitle>
            </span>
          </StepperItem>
        ))}
      </div>
      <Pannelli testi={PASSI.map((p) => p.descrizione)} />
    </Stepper>
  ),
}

/**
 * **Verticale**, che è la forma giusta quando ogni passo ha una riga di
 * spiegazione sotto al titolo: in riga quelle righe non ci starebbero, e
 * l'`orientation` non è una scelta estetica ma una conseguenza di quanto testo
 * porta ogni passo.
 *
 * Il tratto verticale va incolonnato **sotto il centro del pallino**, e lo fa
 * un contenitore largo quanto il pallino (`w-6`, la stessa misura di `size-6`)
 * che lo centra: così resta allineato anche se la densità cambia, perché
 * entrambe le misure escono da `--spacing`.
 */
export const Verticale: Story = {
  render: () => (
    <Stepper
      role="group"
      aria-orientation={undefined}
      defaultValue={3}
      orientation="vertical"
      indicators={INDICATORI}
      className="w-full max-w-md"
    >
      <div
        role="tablist"
        aria-label="Passi del calcolo strutturale"
        aria-orientation="vertical"
        className="flex w-full flex-col"
      >
        {PASSI.map((passo, i) => (
          <StepperItem
            key={passo.titolo}
            step={i + 1}
            className="relative flex-col items-stretch not-last:flex-1 not-last:pb-10"
          >
            <div className="flex items-start gap-3">
              <StepperTrigger
                aria-label={`${passo.titolo}. ${passo.descrizione}`}
                className="relative z-10"
              >
                <StepperIndicator>{i + 1}</StepperIndicator>
              </StepperTrigger>
              <div className="space-y-0.5 text-start" aria-hidden>
                <StepperTitle>{passo.titolo}</StepperTitle>
                <StepperDescription>{passo.descrizione}</StepperDescription>
              </div>
            </div>
            {i < PASSI.length - 1 && (
              <StepperSeparator
                className="absolute top-7 bottom-1 left-3 m-0 w-0.5 -translate-x-1/2 data-[state=completed]:bg-primary"
              />
            )}
          </StepperItem>
        ))}
      </div>
      <Pannelli testi={PASSI.map((p) => `Compila: ${p.titolo.toLowerCase()}.`)} />
    </Stepper>
  ),
}

/**
 * **Titolo in linea** (`c-stepper-9`): il titolo sta **accanto** al pallino e
 * non sotto. È la forma che ci sta dove l'altezza è poca — sopra un modulo in
 * una card, dentro un pannello — e si paga in larghezza, quindi regge finché i
 * titoli sono corti.
 *
 * Qui il titolo torna **dentro** il grilletto, al contrario della scena
 * orizzontale, e non è un'incoerenza: in linea il pallino e la sua parola sono
 * un bersaglio solo, e l'anello di fuoco che li abbraccia entrambi dice il
 * vero. Sotto, invece, il titolo è una didascalia e l'anello attorno a tutta la
 * colonna sarebbe una pastiglia storta.
 */
export const TitoloInLinea: Story = {
  render: () => (
    <Stepper
      role="group"
      aria-orientation={undefined}
      defaultValue={2}
      indicators={INDICATORI}
      className="w-full max-w-xl space-y-8"
    >
      <div
        role="tablist"
        aria-label="Passi della registrazione"
        className="flex w-full items-center"
      >
        {PASSI.map((passo, i) => (
          <StepperItem key={passo.titolo} step={i + 1}>
            <StepperTrigger className="justify-start gap-1.5">
              <StepperIndicator>{i + 1}</StepperIndicator>
              <StepperTitle>{passo.titolo}</StepperTitle>
            </StepperTrigger>
            {i < PASSI.length - 1 && (
              <StepperSeparator className={`${TRATTO_IN_LINEA} mx-2`} />
            )}
          </StepperItem>
        ))}
      </div>
      <Pannelli testi={PASSI.map((p) => p.descrizione)} />
    </Stepper>
  ),
}

/**
 * **Barra con titoli** (`c-stepper-11` della galleria reui), ed è l'alternativa
 * da preferire alla barra a segmenti nuda quando i passi hanno un nome.
 *
 * Stessa idea della barra a segmenti — il pallino diventa un **tratto pieno**,
 * uno per passo — ma i segmenti sono staccati e sotto ognuno c'è la sua parola.
 * Rispetto ai pallini numerati guadagna in larghezza, perché un tratto può
 * essere corto quanto serve mentre un pallino no; rispetto alla barra nuda dice
 * **a che punto si è**, non solo quanti ne mancano.
 *
 * Qui il titolo torna **dentro** il grilletto, come nella scena in linea e al
 * contrario dell'orizzontale: il tratto è largo quanto la colonna, quindi il
 * bersaglio è già tutta la colonna e l'anello di fuoco che la circonda è quello
 * giusto. E il titolo che sbiadisce sui passi da fare
 * (`group-data-[state=inactive]/step:text-muted-foreground`) è ciò che sostituisce
 * il numero: senza pallino, è l'unica cosa che distingue il fatto dal da fare
 * oltre al colore del tratto.
 */
export const BarraConTitoli: Story = {
  render: () => (
    <Stepper
      role="group"
      aria-orientation={undefined}
      defaultValue={2}
      className="w-full max-w-xl space-y-8"
    >
      <div
        role="tablist"
        aria-label="Passi della registrazione"
        className="grid w-full grid-flow-col auto-cols-fr gap-5"
      >
        {PASSI.map((passo, i) => (
          <StepperItem key={passo.titolo} step={i + 1} className="flex-col items-stretch">
            <StepperTrigger className="w-full flex-col items-start gap-3">
              <StepperIndicator className="h-1 w-full rounded-full">
                <span className="sr-only">{`Passo ${i + 1}`}</span>
              </StepperIndicator>
              <StepperTitle className="group-data-[state=inactive]/step:text-muted-foreground text-start font-semibold">
                {passo.titolo}
              </StepperTitle>
            </StepperTrigger>
          </StepperItem>
        ))}
      </div>
      <Pannelli testi={PASSI.map((p) => p.descrizione)} />
    </Stepper>
  ),
}

/**
 * **La barra a segmenti non è una variante**: è lo stesso componente con
 * l'indicatore tolto e il solo separatore a vista, che è la ragione per cui
 * non c'è stato bisogno di scriverla. Cinque trattini, e quelli accesi sono
 * quelli fino al passo corrente — **derivati**, non dichiarati: cliccando il
 * primo resta acceso solo il primo.
 *
 * È il caso di `TaskCalcoloStrutturale` di Studio, dove i passi sono tanti e i
 * titoli non ci stanno: resta il conto, scritto a parole sotto.
 *
 * Senza titolo dentro, il bersaglio resta **senza nome**: `aria-label` sul
 * grilletto non è un dettaglio di rifinitura, è ciò che distingue un passo
 * navigabile da un bottone muto — e il gate lo prende (`button-name`,
 * gravità *critical*).
 */
export const BarraASegmenti: Story = {
  render: () => (
    <Stepper role="group" aria-orientation={undefined} defaultValue={3} className="w-full max-w-sm space-y-3">
      <div
        role="tablist"
        aria-label="Avanzamento del calcolo"
        className="grid w-full grid-flow-col auto-cols-fr"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <StepperItem
            key={n}
            step={n}
            className="flex-1 overflow-hidden first:rounded-s-full last:rounded-e-full"
          >
            <StepperTrigger className="w-full">
              <StepperIndicator className="h-2 w-full rounded-none!">
                <span className="sr-only">{`Passo ${n} di 5`}</span>
              </StepperIndicator>
            </StepperTrigger>
          </StepperItem>
        ))}
      </div>
      <Pannelli
        testi={[
          'Passo 1 di 5 — Dati di ingresso',
          'Passo 2 di 5 — Geometria',
          'Passo 3 di 5 — Analisi dei carichi',
          'Passo 4 di 5 — Verifiche',
          'Passo 5 di 5 — Relazione',
        ]}
      />
    </Stepper>
  ),
}
