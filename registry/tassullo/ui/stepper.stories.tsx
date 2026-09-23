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
 * La barra dei passi di una procedura: dice a che passo si è, quali sono fatti
 * e quali mancano, e porta da un passo all'altro.
 *
 * **Quando sì, quando no.** Si usa per una procedura divisa in passi che si
 * compiono in ordine: una registrazione, un calcolo in più fasi. I passi sono
 * schede che si navigano e di cui una è selezionata; se l'elemento non si
 * naviga e non si seleziona — un misuratore di robustezza della password, un
 * conto di pagine — non è uno stepper, anche se gli somiglia. Sezioni
 * indipendenti di una scheda, senza un ordine, sono `tabs`. L'avanzamento di
 * un'operazione automatica è `progress`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/stepper
 * ```
 *
 * Il componente viene dal registry reui, con licenza MIT: l'avviso di
 * copyright in testa a `stepper.tsx` resta nel file, e l'item installa
 * accanto il testo della licenza.
 *
 * **Opzioni e parti.** `Stepper` con `value` o `defaultValue` (il passo
 * corrente, da 1), `orientation` (`horizontal` o `vertical`) e `indicators`,
 * che dà l'icona di ogni stato — `completed`, `loading`. `StepperItem` con
 * `step`; `StepperTrigger` il bottone del passo; `StepperIndicator` il
 * pallino; `StepperTitle`, `StepperDescription`; `StepperSeparator` il
 * tratto verso il passo seguente; `StepperPanel` e `StepperContent` con
 * `value` per il contenuto di ogni passo.
 *
 * **Regole d'uso.**
 *
 * - Lo stato di ogni passo lo calcola il componente: prima del corrente è
 *   fatto, dopo è da fare. `completed` su un passo si passa solo quando non si
 *   può calcolare — un passo già valido che resta tale tornando indietro. La
 *   spunta del passo fatto si dà con `indicators` sulla radice.
 * - **La composizione accessibile è questa**, e non quella con `StepperNav`,
 *   che mette le schede dentro un `<nav>` e ne spezza la lista: la radice ha
 *   `role="group"` e `aria-orientation={undefined}`; le schede stanno in un
 *   elemento con `role="tablist"` e un `aria-label`; sotto ci sono **tutti** i
 *   pannelli, anche quelli non attivi, ciascuno in un contenitore con
 *   `id="stepper-panel-N"`, `role="tabpanel"` e
 *   `aria-labelledby="stepper-tab-N"`. Senza i pannelli le schede puntano al
 *   nulla: una barra dei passi senza pannelli non si fa.
 * - In orizzontale con i titoli, pallino e tratto stanno su una riga e il
 *   titolo sotto, fuori dal bottone; le colonne le fa uguali una griglia
 *   (`grid grid-flow-col auto-cols-fr`), non il contenuto; il tratto parte
 *   dal centro del pallino e arriva al centro del seguente
 *   (`absolute top-1/2 left-1/2 -right-1/2 -translate-y-1/2`). Il titolo fuori
 *   dal bottone non gli dà il nome: il bottone ha un `aria-label` con titolo e
 *   descrizione, e il titolo è `aria-hidden`.
 * - Il tratto si accende con `data-[state=completed]:bg-primary`, mai sul
 *   passo corrente: la strada dopo il corrente è ancora da fare.
 * - Un bottone senza testo visibile ha comunque un nome, in un `aria-label` o
 *   in uno `<span className="sr-only">`.
 *
 * **Tastiera e accessibilità.** La barra è un solo fermo di tabulazione: `Tab`
 * entra sul passo corrente e il `Tab` seguente esce. Dentro, le frecce
 * spostano il fuoco fra i passi, `Home` e `Fine` al primo e all'ultimo; il
 * passo cambia solo con `Invio`, `Spazio` o un clic, perché il contenuto di un
 * passo può essere un modulo intero.
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
 * Tre passi in riga sopra il contenuto, al secondo: il fatto ha la spunta, il
 * corrente è pieno, il da fare è grigio. Si clicca, e cambiano insieme il
 * contenuto e i tratti.
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
 * In colonna, quando ogni passo ha una riga di descrizione: il tratto scende
 * sotto il centro del pallino.
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
 * Il titolo accanto al pallino, dentro il bottone: occupa poca altezza e
 * regge finché i titoli sono corti.
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
 * Un tratto pieno per passo, col titolo sotto, che sbiadisce sui passi da
 * fare. Dice a che punto si è in meno spazio dei pallini numerati.
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
 * Cinque segmenti senza titolo, quando i passi sono tanti: sono accesi fino al
 * corrente, e il conto è scritto sotto. Ogni segmento ha il nome in un testo
 * `sr-only`.
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
