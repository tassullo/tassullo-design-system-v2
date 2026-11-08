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
 * già dalla parte giusta — il codice prodotto è una `string` con la sua
 * `sortFn: "alphanumeric"`, non un numero.
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
 * ora, ed è quella che il CLDR italiano non dà: il punto delle migliaia anche
 * sotto le cinque cifre (`2.086,93`, dove `it-IT` da solo scrive `2086,93`).
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
 * andrebbe formattato affatto: un anno, un codice o un CAP sono stringhe.
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

/**
 * La classe del testo di un **risultato negativo**: un rosso fatto per il
 * testo, leggibile in chiaro e in scuro. Non è `text-destructive`, che è il
 * rosso dei fondi e sul fondo scuro non si legge.
 */
export const ROSSO_NEGATIVO = "text-destructive-subtle-foreground"

/**
 * Il colore di un numero: rosso se è negativo, nessuno altrimenti. Si usa sui
 * **risultati** — la quantità di una riga, un SOMMANO, un totale, un saldo —
 * e non sui fattori scritti a mano: in un computo una parte negativa è il
 * modo di scrivere una detrazione, e a contare è dove porta il risultato.
 *
 * ```tsx
 * <span className={coloreNegativo(totale)}>{decimale(totale)}</span>
 * ```
 *
 * Zero, `-0`, `null` e `undefined` non sono negativi.
 */
export function coloreNegativo(valore: number | null | undefined): string | undefined {
  return valore != null && valore < 0 ? ROSSO_NEGATIVO : undefined
}

/* ────────────────────────────────────────────────────────────────────────
 * Scrivere un numero, non solo leggerlo
 *
 * Le tre funzioni qui sopra vanno **dal numero al testo** per la vista. Un
 * campo in cui si scrive un numero fa anche il viaggio opposto, e i due
 * blocchi che ne hanno — `tassullo-data-grid` e `tassullo-foglio-gruppi` —
 * lo fanno con la stessa regola, che sta qui per non averne due.
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Come si legge un punto senza la virgola.
 *
 * - `"tre-cifre"`, il default: se raggruppa esattamente tre cifre sono
 *   migliaia (`1.234` → `1234`), altrimenti è un decimale all'inglese
 *   (`20.78`). È la regola giusta per un **testo incollato** da un gestionale,
 *   che scrive le migliaia col punto e non mette mai la virgola sui numeri
 *   interi.
 * - `"decimale"`: un punto solo è **sempre** il decimale (`0.125` → `0.125`,
 *   `1.500` → `1.5`). È la regola per un **campo che si scrive a mano** —
 *   quantità, coefficienti, rese —, dove `0.125` è un decimale scritto col
 *   punto del tastierino, e leggerlo `125` cambierebbe il valore senza che
 *   nessuno se ne accorga.
 * - `"importo"`: la regola per un **importo in euro** scritto o incollato.
 *   Il punto è delle migliaia se raggruppa bene (`1.500` → `1500`), un punto
 *   seguito da una o due cifre è il decimale del tastierino (`15.00` →
 *   `15`), la virgola è il decimale con al massimo due cifre. Si puliscono
 *   ciò che un testo copiato da un documento si porta dietro: spazi di ogni
 *   tipo, `€`, `EUR`, `euro`, il segno meno tipografico. Tutto il resto non
 *   si indovina: `0.125`, `0,125`, `1,500.50` e `12.5,3` restano come sono.
 */
export type PuntoSenzaVirgola = "tre-cifre" | "decimale" | "importo"

/** Le opzioni di `leggiNumero`. */
export type OpzioniLettura = {
  /** Come si legge un punto senza la virgola. Di serie `"tre-cifre"`. */
  punto?: PuntoSenzaVirgola
}

const MIGLIAIA = /^-?\d{1,3}(\.\d{3})+$/

/**
 * **Dal testo scritto al valore**, che resta la forma col punto che `Number()`
 * e Zod capiscono: si scrive con la virgola, come si legge, e il dato non
 * cambia forma.
 *
 * Il punto, in italiano, separa le migliaia: con la virgola, ogni punto è
 * migliaia. Senza virgola il punto è ambiguo, e si decide così: se raggruppa
 * esattamente tre cifre sono migliaia, altrimenti è il decimale di chi scrive o
 * incolla all'inglese. Spazi e `€` si ignorano. Un numero esce in forma
 * canonica; un testo che numero non è resta com'è, e lo rifiuta la validazione.
 *
 * ```ts
 * leggiNumero("20,78")     // "20.78"
 * leggiNumero("1.234,5")   // "1234.5"
 * leggiNumero("1.234")     // "1234"  — migliaia, non un decimale
 * leggiNumero("20.78")     // "20.78" — decimale all'inglese
 * leggiNumero("3,")        // "3"
 * leggiNumero("abc")       // "abc"
 * ```
 *
 * **In un campo che si scrive a mano** si passa `{ punto: "decimale" }`: un
 * punto solo è il decimale, e i punti delle migliaia devono essere scritti
 * giusti, a gruppi di tre. Un testo che si potrebbe leggere in due modi non
 * diventa un numero: resta com'è, e la validazione lo rifiuta.
 *
 * ```ts
 * leggiNumero("0.125", { punto: "decimale" })     // "0.125" — di serie "125"
 * leggiNumero("1.500", { punto: "decimale" })     // "1.5"
 * leggiNumero("1.234,5", { punto: "decimale" })   // "1234.5"
 * leggiNumero("1.234.567", { punto: "decimale" }) // "1234567" — più punti sono migliaia
 * leggiNumero("12.5,3", { punto: "decimale" })    // "12.5,3"  — migliaia scritte male
 * ```
 *
 * **In un campo per gli importi** si passa `{ punto: "importo" }`: il punto è
 * delle migliaia quando raggruppa bene, al massimo due decimali, e il testo
 * copiato da un documento si pulisce da spazi e simboli della moneta.
 *
 * ```ts
 * leggiNumero("1.500", { punto: "importo" })         // "1500"
 * leggiNumero("15.00", { punto: "importo" })         // "15"     — decimale del tastierino
 * leggiNumero("EUR 2.086,93", { punto: "importo" })  // "2086.93"
 * leggiNumero("0,125", { punto: "importo" })         // "0,125"  — più di due decimali
 * leggiNumero("1,500.50", { punto: "importo" })      // "1,500.50" — scritto all'inglese
 * ```
 */
export function leggiNumero(testo: string, opzioni: OpzioniLettura = {}): string {
  const t = opzioni.punto === "importo" ? pulisciImporto(testo) : testo.replace(/[\s€]/g, "")
  if (t === "") return ""
  const grezzo =
    opzioni.punto === "decimale"
      ? grezzoDecimale(t)
      : opzioni.punto === "importo"
        ? grezzoImporto(t)
        : grezzoTreCifre(t)
  if (grezzo === null) return testo.trim()
  const numero = Number(grezzo)
  return Number.isNaN(numero) ? grezzo : String(numero)
}

// La regola di serie: con la virgola ogni punto è migliaia; senza, tre cifre
// dopo il punto sono migliaia e il resto è decimale.
function grezzoTreCifre(t: string): string {
  return t.includes(",")
    ? t.replace(/\./g, "").replace(",", ".")
    : MIGLIAIA.test(t)
      ? t.replace(/\./g, "")
      : t
}

// La regola dei campi scritti a mano. `null` vuol dire «non è un numero
// leggibile senza indovinare»: il chiamante restituisce il testo com'era.
// Ammette solo cifre, un meno davanti e i separatori: `1e3` o `Infinity`, che
// `Number()` accetterebbe, in un campo di quantità sono un errore di battitura.
function grezzoDecimale(t: string): string | null {
  const grezzo = separaDecimale(t)
  return grezzo !== null && /^-?(\d+\.?\d*|\.\d+)$/.test(grezzo) ? grezzo : null
}

function separaDecimale(t: string): string | null {
  const virgole = t.split(",").length - 1
  if (virgole > 1) return null
  if (virgole === 1) {
    const [interi, decimali] = t.split(",")
    if (interi.includes(".") && !MIGLIAIA.test(interi)) return null
    if (decimali.includes(".")) return null
    return `${interi.replace(/\./g, "")}.${decimali}`
  }
  const punti = t.split(".").length - 1
  if (punti <= 1) return t
  return MIGLIAIA.test(t) ? t.replace(/\./g, "") : null
}

// Ciò che un importo copiato da un documento o da una pagina si porta
// dietro: spazi di ogni tipo (anche quelli che non vanno a capo, che `Intl`
// mette fra il numero e `€`, e quelli larghi zero), il simbolo o il nome
// della moneta, il segno meno tipografico o il trattino lungo di un testo
// impaginato, un `+` davanti. Un'altra moneta (`$`, `£`, `USD`) resta, e il
// testo non si legge: non è un importo in euro.
function pulisciImporto(testo: string): string {
  return testo
    .replace(/[\s\u200b\u2060\ufeff]/g, "")
    .replace(/€|euro|eur/gi, "")
    .replace(/^[\u2212\u2013]/, "-")
    .replace(/^\+/, "")
}

// La regola degli importi. Con la virgola: le migliaia raggruppate bene, o
// nessun punto, e al massimo due decimali. Senza virgola: cifre nude,
// migliaia raggruppate bene, o un punto solo seguito da una o due cifre, che
// non possono essere migliaia. Il primo gruppo delle migliaia non comincia
// con lo zero: `0.125` non è centoventicinque, e non si indovina cosa sia.
const IMPORTO_CON_VIRGOLA = /^-?([1-9]\d{0,2}(\.\d{3})+|\d*),\d{0,2}$/
const IMPORTO_SENZA_VIRGOLA = /^-?(\d+|[1-9]\d{0,2}(\.\d{3})+|\d*\.\d{1,2})$/

function grezzoImporto(t: string): string | null {
  if (!/\d/.test(t)) return null
  if (IMPORTO_CON_VIRGOLA.test(t)) return t.replace(/\./g, "").replace(",", ".")
  if (IMPORTO_SENZA_VIRGOLA.test(t)) return MIGLIAIA.test(t) ? t.replace(/\./g, "") : t
  return null
}

/**
 * **Dal valore a ciò che si scrive** nel campo in modifica, o si copia: il
 * punto decimale diventa la virgola, senza separatore delle migliaia — in un
 * campo le cifre si correggono, e un punto in mezzo sarebbe d'intralcio.
 *
 * ```ts
 * scriviNumero("20.78") // "20,78"
 * scriviNumero("1234.5") // "1234,5"
 * ```
 */
export function scriviNumero(valore: string): string {
  return valore === "" || Number.isNaN(Number(valore)) ? valore : valore.replace(".", ",")
}

/**
 * Come `scriviNumero`, **col punto delle migliaia**: per un campo che si
 * guarda e non si sta scrivendo. Mentre ci si scrive si torna a
 * `scriviNumero`: un punto lasciato fra le cifre si rileggerebbe come un
 * decimale. Le cifre decimali restano tutte, senza arrotondare: a differenza
 * di `decimale()`, qui non si sceglie quante.
 *
 * ```ts
 * scriviNumeroConMigliaia("1234.5")   // "1.234,5"
 * scriviNumeroConMigliaia("-1234567") // "-1.234.567"
 * scriviNumeroConMigliaia("0.125")    // "0,125"
 * ```
 */
export function scriviNumeroConMigliaia(valore: string): string {
  const scritto = scriviNumero(valore)
  // Le cifre si raggruppano sul testo e non con `Intl`: `Intl` scrive il
  // valore esatto del numero in virgola mobile, e `0.1` uscirebbe con venti
  // cifre. La notazione esponenziale e un testo che non è un numero restano
  // com'erano.
  const [interi, decimali] = scritto.split(",")
  if (!/^-?\d+$/.test(interi)) return scritto
  const raggruppati = interi.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return decimali === undefined ? raggruppati : `${raggruppati},${decimali}`
}
