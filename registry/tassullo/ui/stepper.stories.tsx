import type { Meta, StoryObj } from "@storybook/react-vite"
import { CheckIcon } from "lucide-react"

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
} from "@/registry/tassullo/ui/stepper"

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
 * la radice passa a `role="group"`. Le classi di impaginazione sono quelle che
 * `StepperNav` metterebbe da sé — il nome di gruppo `group/stepper-nav` e
 * `data-orientation` servono, perché `StepperItem` e `StepperSeparator` ci
 * leggono dentro con `group-data-[orientation=…]/stepper-nav:`.
 *
 * Tre conseguenze, tutte trovate misurando e non ragionando, e tutte da
 * rifare a ogni uso:
 *
 * 1. Cambiando ruolo alla radice va **tolta anche `aria-orientation`**, che il
 *    componente scrive per il `tablist` e che su `group` non è ammessa
 *    (`aria-allowed-attr`). Si toglie passandola `undefined`, perché lo spread
 *    dei props viene dopo.
 * 2. Ogni scheda punta con `aria-controls` a `stepper-panel-N`, ma né
 *    `StepperPanel` né `StepperContent` scrivono quell'`id`: **lo deve mettere
 *    chi compone**, o l'attributo punta al nulla (`aria-valid-attr-value`).
 * 3. E i pannelli devono esserci **tutti**, non solo quello attivo:
 *    `StepperContent` rende `null` finché non tocca a lui, quindi l'`id` va sul
 *    contenitore attorno. Detto altrimenti, **una barra di passi senza pannelli
 *    non si può fare**: una scheda che non comanda niente non è una scheda — ed
 *    è la ragione per cui anche la barra a segmenti, qui sotto, un pannello ce
 *    l'ha.
 *
 * Nessuna delle tre si chiude ri-stilando: sono ruoli e attributi, non
 * stringhe di classi, e la regola 4bis non lascia toccarli. **In carico a
 * Francesco**: o la composizione resta questa e si ripete a ogni uso (M4ter.5
 * ne ha due), o si autorizza l'eccezione a 4bis e si sposta `role="tablist"`
 * dalla radice a `StepperNav` — una riga, che chiuderebbe il punto 1 e il 2.
 *
 * ## La trappola del nome, di nuovo
 *
 * Lo stepper è un `tablist` di `tab`: i passi **si navigano** e uno **è
 * selezionato**. Il misuratore di robustezza di una password gli somiglia —
 * N trattini, M accesi — ma non si naviga e non si seleziona, quindi non è
 * questo componente e resta codice della pagina. È `badge` scambiato per
 * `toggle-group`, un giro più in là.
 *
 * ## Niente da ri-stilare, ed è un dato
 *
 * Zero esadecimali, zero valori arbitrari, e i due corpi che usa — `text-xs`
 * e `text-sm` — sono gradini che il tema tara, quindi seguono la densità da
 * soli. I colori sono token standard (`primary`, `accent`, `muted`,
 * `muted-foreground`): il ri-stile sarebbe stato riscrivere ciò che già
 * combacia.
 *
 * ## Da tastiera
 *
 * Il componente implementa frecce, `Home` e `End` sul `tablist`
 * (`focusNext`/`focusPrev`/`focusFirst`/`focusLast`). **Non è stato provato in
 * questa sessione**: in automazione i tasti arrivano con `event.key` vuoto e
 * i bottoni non si attivano, quindi qui si può solo dire che il codice c'è —
 * non che funziona. Va provato a mano.
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

/** Quel che `StepperNav` metterebbe da sé, meno il `<nav>` che rompe l'ARIA. */
const CLASSI_NAV = 'group/stepper-nav inline-flex'

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
  {
    titolo: 'Tipo di utente',
    descrizione: 'Impresa, studio o libero professionista',
  },
  { titolo: 'Consensi', descrizione: 'Privacy e condizioni d’uso' },
]

/**
 * **Orizzontale**, il modo che serve alla registrazione di Studio: i passi
 * stanno in riga sopra il modulo, il corrente è pieno d'arancio, i fatti
 * portano la spunta e quelli da fare restano sul grigio d'ambiente.
 *
 * `completed` si dichiara sul singolo `StepperItem`: non è il componente a
 * dedurre che i passi prima del corrente siano fatti, perché in un modulo con
 * convalida non è detto — si può tornare indietro a correggere il primo
 * lasciando il secondo già buono.
 */
export const Orizzontale: Story = {
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
        data-orientation="horizontal"
        className={`${CLASSI_NAV} w-full flex-row`}
      >
        {PASSI.map((passo, i) => (
          <StepperItem
            key={passo.titolo}
            step={i + 1}
            completed={i + 1 < 2}
            className="flex-1"
          >
            <StepperTrigger className="flex-col gap-2">
              <StepperIndicator>
                {i + 1 < 2 ? <CheckIcon className="size-3" /> : i + 1}
              </StepperIndicator>
              <StepperTitle>{passo.titolo}</StepperTitle>
            </StepperTrigger>
            {i < PASSI.length - 1 && <StepperSeparator />}
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
 * Qui il primo e il secondo sono fatti e il terzo è il corrente: si legge dalla
 * spunta, dal pieno e dal trattino che resta grigio dopo il corrente.
 */
export const Verticale: Story = {
  render: () => (
    <Stepper
      role="group"
      aria-orientation={undefined}
      defaultValue={3}
      orientation="vertical"
      className="w-full max-w-md"
    >
      <div
        role="tablist"
        aria-label="Passi del calcolo strutturale"
        aria-orientation="vertical"
        data-orientation="vertical"
        className={`${CLASSI_NAV} flex-col`}
      >
        {PASSI.map((passo, i) => (
          <StepperItem
            key={passo.titolo}
            step={i + 1}
            completed={i + 1 < 3}
            className="w-full items-start"
          >
            <StepperTrigger className="w-full items-start gap-3 py-2">
              <StepperIndicator>
                {i + 1 < 3 ? <CheckIcon className="size-3" /> : i + 1}
              </StepperIndicator>
              <div className="space-y-0.5 text-start">
                <StepperTitle>{passo.titolo}</StepperTitle>
                <StepperDescription>{passo.descrizione}</StepperDescription>
              </div>
            </StepperTrigger>
            {i < PASSI.length - 1 && <StepperSeparator className="ms-3" />}
          </StepperItem>
        ))}
      </div>
      <Pannelli
        testi={PASSI.map((p) => `Compila: ${p.titolo.toLowerCase()}.`)}
      />
    </Stepper>
  ),
}

/**
 * **La barra a segmenti non è una variante**: è lo stesso componente con
 * l'indicatore tolto e il solo separatore a vista, che è la ragione per cui
 * non c'è stato bisogno di scriverla. Cinque trattini, due accesi — e sono
 * accesi perché `completed` lo dice, non perché un valore percentuale sia
 * stato tradotto in trattini.
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
    <Stepper
      role="group"
      aria-orientation={undefined}
      defaultValue={3}
      className="w-full max-w-sm space-y-3"
    >
      <div
        role="tablist"
        aria-label="Avanzamento del calcolo"
        data-orientation="horizontal"
        className={`${CLASSI_NAV} w-full flex-row gap-1`}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <StepperItem key={n} step={n} completed={n < 3} className="flex-1">
            <StepperTrigger className="w-full" aria-label={`Passo ${n} di 5`}>
              <StepperSeparator className="data-[state=active]:bg-primary data-[state=completed]:bg-primary h-1 w-full flex-1" />
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
