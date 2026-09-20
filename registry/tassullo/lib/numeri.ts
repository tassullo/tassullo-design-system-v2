/**
 * `numeri` — i numeri italiani, formattati allo stesso modo in tutte le app.
 *
 * ── Perché esiste, e non è per comodità ─────────────────────────────────
 *
 * Perché **`Intl.NumberFormat('it-IT')` da solo dà il numero sbagliato**, e lo
 * dà in silenzio. In italiano il CLDR dichiara `minimumGroupingDigits: 2`,
 * cioè «raggruppa solo da cinque cifre in su»:
 *
 * | valore | `it-IT` così com'è | con questa convenzione |
 * |---|---|---|
 * | `2086.93` | `2086,93` | **`2.086,93`** |
 * | `12345.67` | `12.345,67` | `12.345,67` |
 *
 * Il separatore non è *assente*: è **intermittente**. Compare o sparisce a
 * seconda del valore, e proprio nella fascia fra mille e diecimila, che in un
 * computo o in un listino è la maggior parte delle righe. Due numeri
 * incolonnati, uno col punto e uno senza, si leggono di ordini di grandezza
 * diversi — e `tabular-nums` (v. `Tema/Cifre`) allinea le cifre ma non può
 * inventare un separatore che non c'è.
 *
 * La convenzione Tassullo è quindi **sempre il punto delle migliaia**, decisa
 * da Francesco il 2026-09-20 su un totale che rendeva `2086,93 €`
 * (`docs/DECISIONI.md` §47). La leva è `useGrouping: "always"`, e va messa su
 * *ogni* formattatrice: è esattamente il tipo di riga che si dimentica, perché
 * dimenticarla non dà nessun errore.
 *
 * Prima di questo file la convenzione viveva in **sei formattatrici scritte a
 * mano in sei file**. In casa si sarebbe persa in qualche settimana; in
 * un'app consumer si perdeva **subito**, perché una convenzione che non
 * viaggia col registry non è una convenzione, è un ricordo.
 *
 * ── La seconda ragione, misurabile ──────────────────────────────────────
 *
 * `new Intl.NumberFormat(...)` è **caro**: costruirlo dentro la cella di una
 * tabella vuol dire costruirlo una volta per riga, a ogni render. Qui le
 * istanze sono create una volta sola e tenute in una cache di modulo; le
 * funzioni qui sotto sono involucri sottili. È la stessa ragione per cui le
 * story del registry dichiarano le loro formattatrici a livello di modulo.
 *
 * ── Quello che NON va formattato ────────────────────────────────────────
 *
 * **Un anno, un codice, un identificativo, un CAP non sono numeri**: sono
 * stringhe che si scrivono con delle cifre. `2026` è un anno, e passato di
 * qui diventa `2.026`. La regola è più netta di quanto sembri: se sommarne
 * due non ha senso, non è un numero e non passa da qui. `data-table` lo fa
 * già dalla parte giusta — il codice prodotto è una `string` in `font-mono`,
 * non un numero.
 *
 * ── Uso ─────────────────────────────────────────────────────────────────
 *
 * ```tsx
 * import { decimale, intero, valuta } from "@/lib/numeri"
 *
 * intero(15402)          // "15.402"
 * decimale(106.376)      // "106,38"
 * decimale(3.14159, 3)   // "3,142"
 * valuta(2086.93)        // "2.086,93 €"
 * ```
 *
 * Per un caso che queste tre non coprono — una percentuale, una notazione
 * compatta, un'altra moneta — si parte da `formattatore`, che è la
 * convenzione più le opzioni che servono:
 *
 * ```tsx
 * const PERCENTO = formattatore({ style: "percent", maximumFractionDigits: 1 })
 * PERCENTO.format(0.042) // "4,2%"
 * ```
 *
 * Le tre funzioni sono tre perché hanno tre consumatori veri nel registry
 * (`data-table` e i suoi filtri, `pagina-dashboard`, `Pagine/Lista a due
 * facce`). Una quarta per la percentuale **non c'è**, perché oggi non la usa
 * nessuno e `formattatore` la rende una riga: è la stessa regola con cui è
 * entrato `1:1` in `entity-image` — ogni valore vuole un consumatore.
 */

/**
 * La lingua, cablata. Le app Tassullo sono italiane e il registry lo è già in
 * più posti — `data-table` ordina con `localeCompare(…, "it")` e le date si
 * scrivono `it-IT`. Il giorno in cui una non lo fosse, la cosa da cambiare
 * sarebbe questa costante e non trentasei punti d'uso: è metà del motivo per
 * cui il file esiste.
 */
const LINGUA = "it-IT"

/**
 * Le opzioni che **tutte** le formattatrici Tassullo portano. Una sola, per
 * ora, ed è quella che il CLDR italiano non dà: v. la tabella in testa.
 */
const CONVENZIONE: Intl.NumberFormatOptions = { useGrouping: "always" }

const cache = new Map<string, Intl.NumberFormat>()

/**
 * Una formattatrice italiana con la convenzione Tassullo già dentro, e le
 * opzioni che le si passano sopra. È la via per i casi che le tre funzioni
 * qui sotto non coprono — e la ragione per cui non ne servono altre.
 *
 * Le istanze sono **memorizzate**: chiamarla nel corpo di un `.map()` su
 * cinquemila righe costa una `Map.get` e non la costruzione di un
 * `Intl.NumberFormat`.
 *
 * `useGrouping` si può sovrascrivere, e c'è un caso in cui è giusto farlo:
 * un numero che non è una quantità ma un'etichetta. Ma quello, di norma, non
 * andrebbe formattato affatto (v. in testa).
 */
export function formattatore(
  opzioni?: Intl.NumberFormatOptions
): Intl.NumberFormat {
  const chiave = JSON.stringify(opzioni ?? {})
  let trovata = cache.get(chiave)
  if (!trovata) {
    trovata = new Intl.NumberFormat(LINGUA, { ...CONVENZIONE, ...opzioni })
    cache.set(chiave, trovata)
  }
  return trovata
}

/**
 * Un numero senza decimali: conteggi, ore, quantità intere.
 *
 * ```tsx
 * intero(15402) // "15.402"
 * intero(4128)  // "4.128"  — senza la convenzione sarebbe "4128"
 * ```
 */
export function intero(valore: number): string {
  return formattatore({ maximumFractionDigits: 0 }).format(valore)
}

/**
 * Un numero con i decimali **fissi**, due se non si dice altro: importi senza
 * simbolo, misure, quantità di computo.
 *
 * Fissi e non «fino a»: in colonna, `8,8` accanto a `10,06` non incolonna
 * nemmeno con `tabular-nums`, perché a mancare è una cifra, non lo spazio.
 *
 * ```tsx
 * decimale(106.376)    // "106,38"
 * decimale(8.8)        // "8,80"
 * decimale(3.14159, 3) // "3,142"
 * ```
 */
export function decimale(valore: number, cifre = 2): string {
  return formattatore({
    minimumFractionDigits: cifre,
    maximumFractionDigits: cifre,
  }).format(valore)
}

/**
 * Un importo, in euro se non si dice altro. Due decimali sempre, che è ciò
 * che `style: "currency"` fa già da sé per l'euro.
 *
 * ```tsx
 * valuta(2086.93) // "2.086,93 €"
 * valuta(1500, "CHF")
 * ```
 */
export function valuta(valore: number, moneta = "EUR"): string {
  return formattatore({ style: "currency", currency: moneta }).format(valore)
}
