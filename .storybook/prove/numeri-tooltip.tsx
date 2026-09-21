/**
 * `numeri-tooltip` — il valore del tooltip dei grafici, scritto all'italiana.
 *
 * ── Perché esiste ────────────────────────────────────────────────────────
 *
 * `ui/chart.tsx` scrive il valore con **`item.value.toLocaleString()`**, senza
 * locale: la misura la decide il browser di chi guarda, e nessuna delle due
 * risposte è la convenzione Tassullo (`docs/DECISIONI.md` §47). In `en-US` un
 * importo di quattro cifre esce `2,086.93`; in `it-IT` esce `2086,93`, perché
 * il CLDR italiano non raggruppa le quattro cifre. È lo stesso difetto che
 * M4ter.8 ha chiuso ovunque tranne qui.
 *
 * **Non si corregge nel componente.** `toLocaleString()` è una firma di
 * chiamata di shadcn, cioè **forma**: aggiungere un argomento è una
 * divergenza che `check:registry` rifiuta, ed è giusto che la rifiuti — al
 * prossimo aggiornamento di shadcn non si distinguerebbe più dal loro codice.
 * Il gancio che shadcn lascia aperto è la prop **`formatter`** di
 * `ChartTooltipContent`, che il punto d'uso passa da sé, ed è questo file.
 *
 * ── Perché sta qui e non nel registry ────────────────────────────────────
 *
 * Perché è **codice di story**: `@/prove` non lo spedisce nessun item (v.
 * `vite.config.ts`). Un'app consumer non riceve questo file — riceve la
 * regola, che sta nel campo `docs` dell'item `chart` e che la CLI stampa
 * quando lo si installa.
 *
 * ── Quello che il `formatter` deve rifare ────────────────────────────────
 *
 * `formatter` **sostituisce l'intera riga** del tooltip, non il solo valore:
 * la pastiglia del colore, l'etichetta e il numero. Le classi qui sotto sono
 * quelle di `ChartTooltipContent`, copiate perché la riga resti identica a
 * quella di default in tutto fuorché nel numero.
 */
import type * as React from 'react'

import type { ChartConfig } from '@/registry/tassullo/ui/chart'
import { decimale, intero } from '@/registry/tassullo/lib/numeri'

/**
 * La riga che Recharts passa al `formatter`. Volutamente **più larga** del
 * necessario: il `Payload` di Recharts dichiara `dataKey` anche come funzione,
 * e un tipo più stretto qui non sarebbe assegnabile alla sua `Formatter`.
 */
type Riga = {
  color?: string
  name?: string | number
  dataKey?: unknown
  payload?: Record<string, unknown>
}

type Opzioni = {
  /** La chiave del `config` da cui leggere l'etichetta, se non è `name`. */
  chiaveNome?: string
  /** Senza pastiglia del colore, come `hideIndicator` sul componente. */
  senzaPastiglia?: boolean
  /** Quante cifre dopo la virgola: assente = intero. */
  cifre?: number
}

/**
 * La stessa risoluzione che `chart.tsx` fa con `getPayloadConfigFromPayload`,
 * che non è esportata: con `nameKey` la chiave del `config` non è il nome
 * della serie ma il **valore** che il dato porta sotto quella chiave — è il
 * caso della torta, dove `nameKey="famiglia"` e il `config` è indicizzato per
 * famiglia. Rifarla qui è duplicazione, ma è duplicazione di **codice di
 * story**: l'alternativa sarebbe esportare una funzione interna di shadcn,
 * cioè una divergenza di forma sul componente.
 */
function voceDelConfig(config: ChartConfig, riga: Riga, chiave: string) {
  const dentro = riga?.payload
  const daRiga = (riga as Record<string, unknown>)?.[chiave]
  const daDato = dentro?.[chiave]
  const chiaveVera =
    typeof daRiga === 'string'
      ? daRiga
      : typeof daDato === 'string'
        ? daDato
        : chiave
  return config[chiaveVera as keyof typeof config] ?? config[chiave as keyof typeof config]
}

/**
 * Costruisce il `formatter` da passare a `ChartTooltipContent`.
 *
 *     <ChartTooltip content={<ChartTooltipContent formatter={valoreIt(config)} />} />
 */
export function valoreIt(config: ChartConfig, opzioni: Opzioni = {}) {
  const { chiaveNome, senzaPastiglia, cifre } = opzioni
  return function formattaRiga(
    valore: unknown,
    nome: unknown,
    riga: Riga
  ): React.ReactNode {
    const daDataKey =
      typeof riga?.dataKey === 'string' || typeof riga?.dataKey === 'number'
        ? riga.dataKey
        : undefined
    const chiave = `${chiaveNome ?? nome ?? daDataKey ?? 'value'}`
    const voce = voceDelConfig(config, riga, chiave)
    const riempimento = riga?.payload?.fill
    const colore =
      riga?.color ?? (typeof riempimento === 'string' ? riempimento : undefined)
    const testo =
      typeof valore === 'number'
        ? cifre === undefined
          ? intero(valore)
          : decimale(valore, cifre)
        : String(valore ?? '')
    return (
      <>
        {senzaPastiglia ? null : (
          <div
            className="border-(--color-border) bg-(--color-bg) h-2.5 w-2.5 shrink-0 rounded-xs"
            style={
              {
                '--color-bg': colore,
                '--color-border': colore,
              } as React.CSSProperties
            }
          />
        )}
        <div className="flex flex-1 items-center justify-between leading-none">
          <div className="grid gap-1.5">
            <span className="text-muted-foreground">
              {voce?.label ?? String(nome ?? '')}
            </span>
          </div>
          <span className="text-foreground font-medium tabular-nums">
            {testo}
          </span>
        </div>
      </>
    )
  }
}
