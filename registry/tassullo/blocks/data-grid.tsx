/**
 * `tassullo-data-grid` — motore di editing per `tassullo-data-table`
 * (M3bis.5, tre sessioni: motore + composizione minima, celle tipizzate +
 * Zod, persistenza + prova end-to-end — tutte e tre chiuse).
 *
 * Porting da niko-table `data-grid`, adattato al bypass di `DataTableRoot`
 * già deciso in M3bis.0: lì la Data Grid si compone dentro
 * `<DataTableRoot>` e i figli si auto-rilevano; qui non c'è un
 * `DataTableRoot` — `<DataGrid>` innesta direttamente `<DataTable
 * perPagina="virtuale" altezza="ferma">`, la stessa tabella delle sessioni
 * precedenti, non una seconda tabella. `useDataGrid`, `<DataGrid>`,
 * `DataGridClipboard`, `DataGridFillHandle`, `DataGridUndo`, `DataGridRedo`
 * sono i nomi già fissati in `WORKLOG.md` (M3bis.0): non tradotti, come le
 * altre volte in cui questo registry resta fedele al nome di un'API esterna.
 *
 * ── Perché non controllata ("like `defaultValue`") ─────────────────────
 *
 * `useDataGrid` tiene le righe in uno stato **suo**, seminato una volta sola
 * da `righeIniziali` e mai più risincronizzato da lì: uno stato controllato
 * ricalcolerebbe il modello a ogni tasto e romperebbe l'annulla/ripeti — la
 * stessa ragione che niko-table stessa documenta. Chi vuole sapere cosa è
 * cambiato osserva `onModifica`, non impone `dati`.
 *
 * ── Perché niente ricerca/ordinamento/filtri qui ───────────────────────
 *
 * La tastiera della griglia naviga **per indice** (riga N, colonna M) sullo
 * stesso array che il motore tiene — non sul modello di righe che TanStack
 * restituisce dopo un ordinamento o un filtro. Se l'ordine visibile potesse
 * differire da quello del motore, una `ArrowDown` porterebbe alla riga
 * sbagliata. Per questo `<DataGrid>` passa sempre `cerca={false}` e le
 * colonne di una griglia non dichiarano `sortFn`: l'ordine dei dati è quello
 * del motore, punto — la stessa scelta con cui un foglio di calcolo vero non
 * si "riordina" cliccando un'intestazione mentre lo si sta modificando.
 *
 * ── Il fuoco: una cella vera, non un'intestazione riga ──────────────────
 *
 * M3bis.4 dà a ogni **riga** un `tabIndex` mobile (`DataTableVirtualizedBody`,
 * `indiceRovente`). Una griglia editabile ha bisogno del fuoco su una
 * **cella**, non su una riga: qui ogni cella (`CellaTestoGriglia`, sotto) ha
 * un `tabIndex` proprio, con lo stesso schema di "fuoco mobile" (una sola
 * cella tabbabile alla volta, `roving tabindex`) applicato un livello più a
 * fondo — nessun `role="gridcell"` esplicito: il `<td>` che la contiene lo è
 * già, implicitamente, perché la tabella dichiara `role="grid"`
 * (`attributiTabella`), e ripeterlo sul `<div>` annidato duplica il ruolo
 * (`aria-required-parent`, preso da axe). `DataTableVirtualizedBody` riceve
 * `senzaFocoRiga`
 * per spegnere il proprio giro riga-per-riga (M3bis.5, v. quel file) — i due
 * meccanismi userebbero altrimenti lo stesso tasto (`ArrowUp`/`ArrowDown`)
 * per due cose diverse nello stesso istante.
 *
 * Lo spostamento verticale oltre la finestra montata (`Home`/`End`, o
 * `ArrowDown` ripetuto rapido oltre l'`overscan`) usa lo stesso
 * `scrollToIndex` del virtualizzatore che le righe già usano —
 * `alVirtualizzatore`, la stessa wiring privata di `senzaFocoRiga` — non un
 * meccanismo a parte.
 *
 * ── Copia/incolla: l'API asincrona, non l'evento nativo ─────────────────
 *
 * Una cella non genera un evento `copy`/`paste` nativo al premere Ctrl/Cmd+C/V — quell'evento nasce solo da una selezione di testo
 * vera o da un campo modificabile, e una cella non in modifica non è
 * nessuno dei due. Si intercetta la combinazione da tastiera e si passa da
 * `navigator.clipboard` (che richiede un contesto sicuro — https o
 * localhost, sempre vero qui). È lo stesso limite che rende il segnaposto
 * "Incolla un foglio di calcolo (Ctrl/Cmd+V)…" (annotato nell'inventario di
 * M3bis.0) un'istruzione onesta e non un vezzo.
 *
 * ── Cosa NON c'è, di proposito — e resta così ────────────────────────────
 *
 * **Righe annidate (`getSottoRighe`, l'albero di M3bis.1) non compongono
 * con la Data Grid.** Non un rinvio a una sessione futura: uno scarto
 * accertato e circoscritto qui. La tastiera della griglia naviga **per
 * indice sull'array piatto del motore** (`motore.righe`) — lo stesso motivo
 * per cui non c'è ricerca/ordinamento (sopra). Con `getSottoRighe`, TanStack
 * flatten-izza in un ordine ad albero che **non è** `motore.righe`: righe
 * annidate e figlie compaiono nel modello reso, non nell'array su cui la
 * tastiera conta gli indici — la stessa classe di scostamento di un
 * ordinamento, ma strutturale, non evitabile con un `cerca={false}`. Un
 * computo con voci-madre e voci-figlie editabili resta quindi fuori da
 * questo blocco: la prova end-to-end di sessione 3, sotto, usa un computo
 * **piatto** (una riga per voce di misurazione, senza subtotali annidati) —
 * la forma che la maggior parte dei computi ha comunque, e quella su cui
 * l'edificio di navigazione per indice regge senza sotterfugi.
 *
 * **M4ter.12 ha misurato quanto di quello scarto sia l'indice, e la risposta
 * è: poco.** L'indice è la metà riparabile. La metà che non si ripara è il
 * **rettangolo**: `serializzaSelezione`, `incolla`, `riempi`,
 * `riempiInDirezione` e `cancellaSelezione` sono cinque rettangoli `(r,c)`,
 * e un rettangolo presuppone che la colonna *c* voglia dire la stessa cosa
 * su ogni riga che attraversa. Su un albero a livelli eterogenei quella
 * premessa è falsa — misurato su `Blocchi/Data Table → Albero`, espanso:
 * **zero colonne su quattro** vogliono dire la stessa cosa sulla riga-madre
 * e sulla figlia (due sono subtotali *derivati* sopra e valori *scritti*
 * sotto, una è vuota sulla madre, una porta due testi di natura diversa).
 * Dare a questo motore un indice ad albero darebbe le frecce fra i livelli e
 * lascerebbe incolla e riempimento **senza significato** sulle stesse celle.
 * La ragione per cui l'albero non compone non è quindi «l'indice è piatto» —
 * che invita a riprovare — ma «il rettangolo non attraversa i livelli», che
 * non invita. Misure, numeri del Computo vero e verdetto proposto:
 * `docs/DECISIONI.md` §50 e `docs/ANALISI-COPERTURA-APP.md` §8.3bis.
 *
 * ── Sessione 2: celle tipizzate + validazione Zod ───────────────────────
 *
 * `colonnaTestoGriglia`/`colonnaNumeroGriglia`/`colonnaValutaGriglia`/
 * `colonnaCheckboxGriglia`/`colonnaDataGriglia`/`colonnaSelectGriglia` —
 * porting da "Cell Types" di niko-table. Il confine fra motore e cella resta
 * quello di sessione 1: `useDataGrid` non sa cos'è un numero o una data,
 * conosce solo `leggiCella`/`scriviCella` come confine di **stringhe** — è
 * la cella tipizzata a formattare per la vista (`Intl.NumberFormat('it-IT')`
 * per numero/valuta, `toLocaleDateString('it-IT')` per la data) e a
 * interpretare ciò che l'utente scrive. Il checkbox e il select non passano
 * da `apriModifica`/`commitModifica` — un gesto solo (spuntare, scegliere)
 * si scrive subito con `impostaValore`, senza un testo intermedio da
 * confermare.
 *
 * **La data usa `<input type="date">`**, non il `Calendar` del registry: la
 * tastiera di un calendario a griglia dentro una griglia è un problema a
 * sé — la stessa `D15` di `CLAUDE.md` (zero violazioni axe su una griglia
 * del tutto non navigabile) è il motivo per cui non si presume che regga
 * senza misurarlo apposta, e questa sessione non è quella misura. Il
 * controllo nativo tiene comunque la stringa grezza in `AAAA-MM-GG`, la
 * stessa forma con cui la colonna la conserva.
 *
 * **Validazione — `validaConZod`, coerente con `tassullo-form-field`
 * (M3.4)**: come `FormField` collega `aria-invalid`/`data-invalid`/
 * `aria-describedby` senza che la pagina debba ricordarsene, qui
 * `validaConZod(schema)` fa la stessa cosa per una cella — la differenza è
 * che una cella non ha un'etichetta accanto a cui mettere l'errore in
 * chiaro: il colore (anello rosso) è il segnale per chi vede, un
 * `aria-describedby` verso un testo `sr-only` è il segnale per chi non
 * vede. `z.coerce.number()`/`z.coerce.date()` accettano direttamente la
 * stringa grezza della cella — non serve un adattatore che la converta
 * prima: è la stessa ragione per cui i validatori si passano allo schema, non
 * al valore già interpretato.
 *
 * ── Sessione 3: persistenza e prova end-to-end ───────────────────────────
 *
 * `useGridChanges(righeCorrenti, righeSalvate, idRiga)` — un confronto
 * **puro** fra `motore.righe` e l'ultimo salvataggio, non un registro
 * accumulato per-commit: v. il commento sull'implementazione per il perché
 * (un registro incrementale dovrebbe disfare la propria contabilità a ogni
 * `annulla`, la stessa classe di bug delle dipendenze derivate che
 * `CLAUDE.md` mette in guardia altrove). Restituisce `creati`/`aggiornati`/
 * `cancellati` — righe vere, non solo id, tranne per i cancellati (di quelli
 * non resta altro).
 *
 * `aggiungiRiga`/`rimuoviRighe` sul motore: creazione e cancellazione come
 * commit annullabili/ripetibili, la stessa cronologia delle modifiche di
 * cella. `rimuoviRighe` prende id, non indici — coerente con tutto il resto
 * del motore (`idRiga`, non la posizione, è l'identità di una riga).
 *
 * La prova sul criterio di accettazione di `PIANO.md` (~500 righe, editing,
 * incolla, annulla/ripeti, celle di un computo finto) è la story `Computo`,
 * non un test a parte: qui non c'è altro codice, solo il motore che quella
 * story esercita.
 */
import * as React from "react"
import type { CellContext, RowData } from "@tanstack/react-table"
import { Redo2Icon, Undo2Icon } from "lucide-react"
import type { ZodType } from "zod"

import { cn } from "cn"
import {
  DataTable,
  creaColonne,
  type ColonnaTabella,
  type DataTableProps,
} from "@/registry/tassullo/blocks/data-table"
import { Button } from "@/registry/tassullo/ui/button"
import { Checkbox } from "@/registry/tassullo/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/tassullo/ui/select"

/* ────────────────────────────────────────────────────────────────────────
 * Il motore — `useDataGrid`
 * ──────────────────────────────────────────────────────────────────────── */

/** L'indirizzo di una cella: quale riga (per id, non per indice — l'indice
 * cambia se una sessione futura aggiunge/toglie righe), quale colonna. */
export type CellaGrigliaId = { rigaId: string; colonnaId: string }

/** Cosa è successo per ultimo, per un'eventuale barra di stato. */
export type CommitGriglia = {
  tipo:
    | "modifica"
    | "incolla"
    | "riempimento"
    | "annulla"
    | "ripeti"
    | "creazione"
    | "cancellazione"
  sequenza: number
}

export type OpzioniDataGrid<TDato> = {
  /** Seminano lo stato interno una volta sola — v. il commento in testa al file. */
  righeIniziali: TDato[]
  /** Le colonne editabili, **nell'ordine** in cui Tab/Invio/incolla le percorrono. */
  colonneId: readonly string[]
  /** L'identità stabile di una riga — non l'indice, che si sposta con annulla/ripeti. */
  idRiga: (riga: TDato) => string
  /** Legge il valore di una cella come stringa — ciò che si copia, ciò che si mostra. */
  leggiCella: (riga: TDato, colonnaId: string) => string
  /** Scrive un nuovo valore, restituendo una riga **nuova** (mai mutata in place). */
  scriviCella: (riga: TDato, colonnaId: string, valore: string) => TDato
  /** Chiamato dopo ogni commit (modifica, incolla, riempimento, annulla, ripeti). */
  onModifica?: (righe: TDato[]) => void
}

const CRONOLOGIA_MAX = 100

export type DataGridEngine<TDato> = OpzioniDataGrid<TDato> & {
  righe: TDato[]
  cellaAttiva: CellaGrigliaId | null
  cellaInModifica: CellaGrigliaId | null
  draftModifica: string
  puoAnnullare: boolean
  puoRipetere: boolean
  ultimoCommit: CommitGriglia | null
  eAttiva: (id: CellaGrigliaId) => boolean
  eInModifica: (id: CellaGrigliaId) => boolean
  eSelezionata: (id: CellaGrigliaId) => boolean
  eInAnteprimaRiempimento: (id: CellaGrigliaId) => boolean
  /** Aggiunge una riga in fondo — v. il commento sull'implementazione. */
  aggiungiRiga: (rigaVuota: TDato) => void
  /** Toglie le righe con questi id — v. il commento sull'implementazione. */
  rimuoviRighe: (ids: readonly string[]) => void
  vaiA: (id: CellaGrigliaId, opzioni?: { estendi?: boolean }) => void
  apriModifica: (id?: CellaGrigliaId, valoreIniziale?: string) => void
  aggiornaDraft: (valore: string) => void
  /** `false` quando la validazione della colonna rifiuta `draftModifica`: la
   * modifica **resta aperta**, non si scarta da sola (v. `registraValidatore`). */
  commitModifica: () => boolean
  annullaModifica: () => void
  onKeyDownCella: (evento: React.KeyboardEvent, id: CellaGrigliaId) => void
  annulla: () => void
  ripeti: () => void
  /** Anteprima del trascinamento della maniglia (`DataGridFillHandle`). */
  evidenziaRiempimento: (id: CellaGrigliaId) => void
  confermaRiempimento: () => void
  /**
   * Scrive una cella **subito**, senza passare da `apriModifica`/
   * `commitModifica`: le celle che si "modificano" con un solo gesto —
   * spuntare un checkbox, scegliere una voce di un `select` — non hanno un
   * testo intermedio da confermare. Se `cellaInModifica` punta già a `id`
   * (il `select` era aperto), lo richiude anche lui.
   */
  impostaValore: (id: CellaGrigliaId, valore: string) => boolean
  /** Incolla — `DataGridClipboard` la chiama col testo letto dall'evento
   * nativo `paste`, non da `navigator.clipboard` (v. quel componente). */
  incolla: (testo: string) => void
  /** La selezione corrente come TSV — `DataGridClipboard` la scrive lui
   * nell'evento nativo `copy`, non con `navigator.clipboard.writeText`. */
  serializzaSelezione: () => string
  /**
   * Registra il validatore di una colonna (`colonnaNumeroGriglia` e affini
   * lo fanno da sé in un effetto, non è per uso diretto dalle pagine). Una
   * sola funzione per colonna, non per cella: ogni riga montata della
   * stessa colonna registra la stessa funzione, la registrazione successiva
   * è un no-op.
   */
  registraValidatore: (colonnaId: string, f: ((valore: string) => string | undefined) | null) => void
  /** Wiring privata per `<DataGrid>`: v. il commento in testa al file. */
  registraSpostamentoVerticale: (f: ((indiceRiga: number) => void) | null) => void
}

export function useDataGrid<TDato>(opzioni: OpzioniDataGrid<TDato>): DataGridEngine<TDato> {
  const { righeIniziali, colonneId, idRiga, leggiCella, scriviCella, onModifica } = opzioni

  const [righe, setRighe] = React.useState(righeIniziali)
  const [passato, setPassato] = React.useState<TDato[][]>([])
  const [futuro, setFuturo] = React.useState<TDato[][]>([])
  const sequenzaRef = React.useRef(0)
  const [ultimoCommit, setUltimoCommit] = React.useState<CommitGriglia | null>(null)

  // Lazy initializer, non `useMemo`: deve calcolarsi **una sola volta**, al
  // montaggio — le righe iniziali sono seminate una volta sola (v. il
  // commento in testa al file), e la cella di partenza segue la stessa
  // regola. Un `useMemo` con dipendenze vuote farebbe la stessa cosa ma
  // sembra un errore (una `[]` che ignora `righeIniziali`/`colonneId`/
  // `idRiga` di proposito); l'inizializzatore pigro di `useState` dice da
  // solo, nella forma, che gira solo al primo render.
  const [cellaAttiva, setCellaAttiva] = React.useState<CellaGrigliaId | null>(() =>
    righeIniziali.length > 0 && colonneId.length > 0
      ? { rigaId: idRiga(righeIniziali[0]!), colonnaId: colonneId[0]! }
      : null
  )
  const [ancora, setAncora] = React.useState<CellaGrigliaId | null>(() =>
    righeIniziali.length > 0 && colonneId.length > 0
      ? { rigaId: idRiga(righeIniziali[0]!), colonnaId: colonneId[0]! }
      : null
  )
  const [cellaInModifica, setCellaInModifica] = React.useState<CellaGrigliaId | null>(null)
  const [draftModifica, setDraftModifica] = React.useState("")
  const [obiettivoRiempimento, setObiettivoRiempimento] = React.useState<CellaGrigliaId | null>(
    null
  )

  const indiceRiga = React.useMemo(() => {
    const mappa = new Map<string, number>()
    righe.forEach((r, i) => mappa.set(idRiga(r), i))
    return mappa
  }, [righe, idRiga])
  const indiceColonna = React.useMemo(() => {
    const mappa = new Map<string, number>()
    colonneId.forEach((c, i) => mappa.set(c, i))
    return mappa
  }, [colonneId])

  const rettangolo = (a: CellaGrigliaId | null, b: CellaGrigliaId | null) => {
    if (!a || !b) return null
    const r1 = indiceRiga.get(a.rigaId)
    const r2 = indiceRiga.get(b.rigaId)
    const c1 = indiceColonna.get(a.colonnaId)
    const c2 = indiceColonna.get(b.colonnaId)
    if (r1 == null || r2 == null || c1 == null || c2 == null) return null
    return {
      rigaMin: Math.min(r1, r2),
      rigaMax: Math.max(r1, r2),
      colMin: Math.min(c1, c2),
      colMax: Math.max(c1, c2),
    }
  }
  const dentroRettangolo = (
    id: CellaGrigliaId,
    rett: ReturnType<typeof rettangolo>
  ): boolean => {
    if (!rett) return false
    const ri = indiceRiga.get(id.rigaId)
    const ci = indiceColonna.get(id.colonnaId)
    if (ri == null || ci == null) return false
    return ri >= rett.rigaMin && ri <= rett.rigaMax && ci >= rett.colMin && ci <= rett.colMax
  }

  const rettangoloSelezione = rettangolo(ancora, cellaAttiva)
  const rettangoloAnteprima = rettangolo(cellaAttiva, obiettivoRiempimento)

  /**
   * I validatori sono **per colonna**, non per cella: una `Map` in una
   * `ref` (non `useState`) perché registrarla non deve far ripartire un
   * render — la registrazione avviene già dentro un `useEffect` di ogni
   * cella tipizzata montata. Serve **solo** a `commitModificaInterno`/
   * `impostaValore`, dentro un gestore d'evento: letta lì, non in fase di
   * render, dove una `ref` che cambia dentro l'effetto di *un'altra* cella
   * non farebbe ripartire questo render da sola. L'errore mostrato a
   * schermo non passa da qui — ogni cella tipizzata lo calcola da sé,
   * chiamando la propria `validazione` (v. `useStatoCellaGriglia`).
   */
  const validatoriRef = React.useRef(new Map<string, (valore: string) => string | undefined>())
  const registraValidatore = React.useCallback(
    (colonnaId: string, f: ((valore: string) => string | undefined) | null) => {
      if (f) validatoriRef.current.set(colonnaId, f)
      else validatoriRef.current.delete(colonnaId)
    },
    []
  )

  const eAttiva = (id: CellaGrigliaId) =>
    cellaAttiva?.rigaId === id.rigaId && cellaAttiva?.colonnaId === id.colonnaId
  const eInModifica = (id: CellaGrigliaId) =>
    cellaInModifica?.rigaId === id.rigaId && cellaInModifica?.colonnaId === id.colonnaId
  const eSelezionata = (id: CellaGrigliaId) => dentroRettangolo(id, rettangoloSelezione)
  const eInAnteprimaRiempimento = (id: CellaGrigliaId) =>
    obiettivoRiempimento != null && dentroRettangolo(id, rettangoloAnteprima)

  const registraCommit = (nuoveRighe: TDato[], tipo: CommitGriglia["tipo"]) => {
    setPassato((p) => [...p, righe].slice(-CRONOLOGIA_MAX))
    setFuturo([])
    setRighe(nuoveRighe)
    sequenzaRef.current += 1
    setUltimoCommit({ tipo, sequenza: sequenzaRef.current })
    onModifica?.(nuoveRighe)
  }

  /**
   * `false` se la colonna ha un validatore e lo rifiuta: **non scrive
   * niente e non chiude la modifica** — il chiamante decide cosa fare (v.
   * `onKeyDownCella` per Invio/Tab, che restano aperti; `onBlur` nelle
   * celle tipizzate, che invece scartano con `annullaModifica`).
   */
  const commitModificaInterno = (): boolean => {
    if (!cellaInModifica) return false
    if (validatoriRef.current.get(cellaInModifica.colonnaId)?.(draftModifica)) return false
    const idx = indiceRiga.get(cellaInModifica.rigaId)
    if (idx == null) {
      setCellaInModifica(null)
      return true
    }
    const nuoveRighe = righe.slice()
    nuoveRighe[idx] = scriviCella(nuoveRighe[idx]!, cellaInModifica.colonnaId, draftModifica)
    registraCommit(nuoveRighe, "modifica")
    setCellaInModifica(null)
    return true
  }

  const impostaValore = (id: CellaGrigliaId, valore: string): boolean => {
    if (validatoriRef.current.get(id.colonnaId)?.(valore)) return false
    const idx = indiceRiga.get(id.rigaId)
    if (idx == null) return false
    const nuoveRighe = righe.slice()
    nuoveRighe[idx] = scriviCella(nuoveRighe[idx]!, id.colonnaId, valore)
    registraCommit(nuoveRighe, "modifica")
    if (eInModifica(id)) setCellaInModifica(null)
    return true
  }

  /**
   * Aggiunge una riga in fondo — pensata per un bottone "Aggiungi riga"
   * nella barra, non per l'incolla: quello resta clampato ai confini
   * esistenti (v. `incolla`, sotto), di proposito. La riga la crea chi
   * chiama (`creaRigaVuota`, nella pagina): il motore non sa cosa sia un
   * campo obbligatorio o un valore di partenza sensato per `TDato`.
   */
  const aggiungiRiga = (rigaVuota: TDato) => {
    registraCommit([...righe, rigaVuota], "creazione")
    if (colonneId.length > 0) {
      const id = { rigaId: idRiga(rigaVuota), colonnaId: colonneId[0]! }
      setCellaAttiva(id)
      setAncora(id)
    }
  }

  /**
   * Toglie le righe con questi id — un bottone «elimina» per riga, non un
   * tasto: `Delete`/`Backspace` da tastiera già significano "svuota le
   * celle selezionate" (v. `cancellaSelezione`), e sovrapporci "elimina la
   * riga" sullo stesso tasto sarebbe ambiguo, non un'estensione naturale.
   * Se la cella attiva era su una riga tolta, si sposta sulla prima riga
   * rimasta — o a `null` se non ne resta nessuna, lo stesso stato di una
   * griglia appena creata senza dati.
   */
  const rimuoviRighe = (ids: readonly string[]) => {
    const daTogliere = new Set(ids)
    const nuoveRighe = righe.filter((r) => !daTogliere.has(idRiga(r)))
    registraCommit(nuoveRighe, "cancellazione")
    if (cellaAttiva && daTogliere.has(cellaAttiva.rigaId)) {
      const id =
        nuoveRighe.length > 0 && colonneId.length > 0
          ? { rigaId: idRiga(nuoveRighe[0]!), colonnaId: colonneId[0]! }
          : null
      setCellaAttiva(id)
      setAncora(id)
    }
  }

  const vaiA = (id: CellaGrigliaId, opzioni?: { estendi?: boolean }) => {
    // Spostarsi via da una modifica in corso la commit — come in un foglio
    // di calcolo vero: cliccare un'altra cella non butta via ciò che si è
    // appena scritto. Se non valido, si scarta (v. `commitModificaInterno`):
    // un clic altrove è la stessa via d'uscita del blur, non c'è modo di
    // "restare" sulla cella che si sta per lasciare.
    if (cellaInModifica && !eAttiva(id) && !commitModificaInterno()) annullaModifica()
    setCellaAttiva(id)
    if (!opzioni?.estendi) setAncora(id)
  }

  const apriModifica = (id: CellaGrigliaId = cellaAttiva!, valoreIniziale?: string) => {
    if (!id) return
    const riga = righe[indiceRiga.get(id.rigaId) ?? -1]
    if (!riga) return
    setCellaAttiva(id)
    setAncora(id)
    setCellaInModifica(id)
    setDraftModifica(valoreIniziale ?? leggiCella(riga, id.colonnaId))
  }

  const annullaModifica = () => setCellaInModifica(null)

  const annulla = () => {
    if (passato.length === 0) return
    const precedente = passato[passato.length - 1]!
    setFuturo((f) => [...f, righe])
    setPassato((p) => p.slice(0, -1))
    setRighe(precedente)
    sequenzaRef.current += 1
    setUltimoCommit({ tipo: "annulla", sequenza: sequenzaRef.current })
    onModifica?.(precedente)
  }
  const ripeti = () => {
    if (futuro.length === 0) return
    const successivo = futuro[futuro.length - 1]!
    setPassato((p) => [...p, righe])
    setFuturo((f) => f.slice(0, -1))
    setRighe(successivo)
    sequenzaRef.current += 1
    setUltimoCommit({ tipo: "ripeti", sequenza: sequenzaRef.current })
    onModifica?.(successivo)
  }

  const cancellaSelezione = () => {
    if (!rettangoloSelezione) return
    const { rigaMin, rigaMax, colMin, colMax } = rettangoloSelezione
    const nuoveRighe = righe.slice()
    for (let r = rigaMin; r <= rigaMax; r++) {
      for (let c = colMin; c <= colMax; c++) {
        nuoveRighe[r] = scriviCella(nuoveRighe[r]!, colonneId[c]!, "")
      }
    }
    registraCommit(nuoveRighe, "modifica")
  }

  const serializzaSelezione = (): string => {
    if (!rettangoloSelezione) return ""
    const { rigaMin, rigaMax, colMin, colMax } = rettangoloSelezione
    const righeTsv: string[] = []
    for (let r = rigaMin; r <= rigaMax; r++) {
      const valori: string[] = []
      for (let c = colMin; c <= colMax; c++) {
        valori.push(leggiCella(righe[r]!, colonneId[c]!))
      }
      righeTsv.push(valori.join("\t"))
    }
    return righeTsv.join("\n")
  }

  /**
   * Righe/colonne oltre i confini esistenti sono **scartate**, non creano
   * righe nuove: `useDataGrid` non sa creare una riga vuota (quello è
   * `createEmptyRow`/`addRows`, fuori da questa sessione — v. il commento in
   * testa al file). Incollare un foglio più grande della griglia riempie
   * quello che c'è e si ferma lì, senza errore: un limite scritto, non
   * scoperto incollando 600 righe su una griglia da 500.
   */
  const incolla = (testo: string) => {
    if (!cellaAttiva) return
    const rigaBase = indiceRiga.get(cellaAttiva.rigaId)
    const colBase = indiceColonna.get(cellaAttiva.colonnaId)
    if (rigaBase == null || colBase == null) return
    const righeIncollate = testo
      .replace(/\r/g, "")
      .split("\n")
      .filter((riga, i, arr) => !(i === arr.length - 1 && riga === ""))
    if (righeIncollate.length === 0) return
    const nuoveRighe = righe.slice()
    righeIncollate.forEach((riga, dr) => {
      const indiceR = rigaBase + dr
      if (indiceR >= nuoveRighe.length) return
      riga.split("\t").forEach((valore, dc) => {
        const indiceC = colBase + dc
        if (indiceC >= colonneId.length) return
        nuoveRighe[indiceR] = scriviCella(nuoveRighe[indiceR]!, colonneId[indiceC]!, valore)
      })
    })
    registraCommit(nuoveRighe, "incolla")
  }

  /** Riempie la selezione col valore della cella in cima a sinistra — Ctrl/Cmd+Invio. */
  const riempi = () => {
    if (!rettangoloSelezione) return
    const { rigaMin, rigaMax, colMin, colMax } = rettangoloSelezione
    const sorgente = leggiCella(righe[rigaMin]!, colonneId[colMin]!)
    const nuoveRighe = righe.slice()
    for (let r = rigaMin; r <= rigaMax; r++) {
      for (let c = colMin; c <= colMax; c++) {
        if (r === rigaMin && c === colMin) continue
        nuoveRighe[r] = scriviCella(nuoveRighe[r]!, colonneId[c]!, sorgente)
      }
    }
    registraCommit(nuoveRighe, "riempimento")
  }

  /** La maniglia (`DataGridFillHandle`): riempie da `cellaAttiva` fino al punto rilasciato. */
  const riempiInDirezione = (finoA: CellaGrigliaId) => {
    if (!cellaAttiva) return
    const rett = rettangolo(cellaAttiva, finoA)
    if (!rett) return
    const rSorgente = indiceRiga.get(cellaAttiva.rigaId)!
    const cSorgente = indiceColonna.get(cellaAttiva.colonnaId)!
    const sorgente = leggiCella(righe[rSorgente]!, colonneId[cSorgente]!)
    const nuoveRighe = righe.slice()
    for (let r = rett.rigaMin; r <= rett.rigaMax; r++) {
      for (let c = rett.colMin; c <= rett.colMax; c++) {
        if (r === rSorgente && c === cSorgente) continue
        nuoveRighe[r] = scriviCella(nuoveRighe[r]!, colonneId[c]!, sorgente)
      }
    }
    registraCommit(nuoveRighe, "riempimento")
    setAncora(cellaAttiva)
    setCellaAttiva(finoA)
  }
  const evidenziaRiempimento = (id: CellaGrigliaId) => setObiettivoRiempimento(id)
  const confermaRiempimento = () => {
    if (obiettivoRiempimento) riempiInDirezione(obiettivoRiempimento)
    setObiettivoRiempimento(null)
  }

  const spostamentoVerticaleRef = React.useRef<((indice: number) => void) | null>(null)
  const registraSpostamentoVerticale = React.useCallback(
    (f: ((indice: number) => void) | null) => {
      spostamentoVerticaleRef.current = f
    },
    []
  )

  const spostaA = (ri: number, ci: number, estendi: boolean) => {
    if (righe.length === 0 || colonneId.length === 0) return
    const riChiuso = Math.max(0, Math.min(righe.length - 1, ri))
    const ciChiuso = Math.max(0, Math.min(colonneId.length - 1, ci))
    vaiA({ rigaId: idRiga(righe[riChiuso]!), colonnaId: colonneId[ciChiuso]! }, { estendi })
    spostamentoVerticaleRef.current?.(riChiuso)
  }
  const posizioneAttiva = () => ({
    ri: cellaAttiva ? (indiceRiga.get(cellaAttiva.rigaId) ?? 0) : 0,
    ci: cellaAttiva ? (indiceColonna.get(cellaAttiva.colonnaId) ?? 0) : 0,
  })
  const spostaVerticale = (delta: number) => {
    const { ri, ci } = posizioneAttiva()
    spostaA(ri + delta, ci, false)
  }
  const spostaOrizzontale = (delta: number) => {
    const { ri, ci } = posizioneAttiva()
    let nr = ri
    let nc = ci + delta
    if (nc >= colonneId.length) {
      nc = 0
      nr += 1
    } else if (nc < 0) {
      nc = colonneId.length - 1
      nr -= 1
    }
    spostaA(nr, nc, false)
  }
  const selezionaTutto = () => {
    if (righe.length === 0 || colonneId.length === 0) return
    setAncora({ rigaId: idRiga(righe[0]!), colonnaId: colonneId[0]! })
    setCellaAttiva({
      rigaId: idRiga(righe[righe.length - 1]!),
      colonnaId: colonneId[colonneId.length - 1]!,
    })
  }

  const onKeyDownCella = (evento: React.KeyboardEvent, id: CellaGrigliaId) => {
    const mod = evento.metaKey || evento.ctrlKey
    if (cellaInModifica) {
      // Invio/Tab non si spostano se la modifica è invalida — l'errore
      // resta a schermo (ogni cella tipizzata lo calcola da sé, v.
      // `useStatoCellaGriglia`) e la modifica resta aperta, così si può
      // correggere senza aver perso dov'era il fuoco. `Escape` invece
      // annulla sempre, valido o no: è la via d'uscita che non deve mai
      // bloccarsi.
      if (evento.key === "Enter") {
        evento.preventDefault()
        if (commitModificaInterno()) spostaVerticale(1)
      } else if (evento.key === "Escape") {
        evento.preventDefault()
        annullaModifica()
      } else if (evento.key === "Tab") {
        evento.preventDefault()
        if (commitModificaInterno()) spostaOrizzontale(evento.shiftKey ? -1 : 1)
      }
      return
    }
    const ri = indiceRiga.get(id.rigaId)
    const ci = indiceColonna.get(id.colonnaId)
    if (ri == null || ci == null) return

    // Le combinazioni con Ctrl/Cmd si controllano **prima** dello switch qui
    // sotto: `evento.key` per Ctrl+Invio è comunque `"Enter"`, e uno switch
    // che decide solo sul tasto — non sul modificatore — intercetterebbe
    // Ctrl+Invio come un Invio semplice (apre la modifica) senza mai
    // arrivare al riempimento. Preso in un browser vero: Ctrl+Invio su una
    // selezione apriva la cella invece di riempirla.
    //
    // **Copia/incolla/taglia non sono qui**: `DataGridClipboard` li
    // intercetta prima ancora che questo gestore veda l'evento (un
    // `addEventListener` in cattura sul contenitore, montato solo se quel
    // componente è presente), e li dirotta su una `<textarea>` nascosta —
    // `navigator.clipboard.readText()` **non esiste in Safari** (WebKit non
    // la implementa), e il tentativo precedente falliva lì in silenzio
    // (l'errore veniva inghiottito da un `.catch(() => {})`). Rilievo di
    // Francesco: "ho provato a incollare e non succede nulla", provato solo
    // in Safari. V. `DataGridClipboard`, sotto.
    if (mod) {
      const tasto = evento.key.toLowerCase()
      if (evento.key === "Enter") {
        evento.preventDefault()
        riempi()
        return
      }
      if (tasto === "z") {
        evento.preventDefault()
        if (evento.shiftKey) ripeti()
        else annulla()
        return
      }
      if (tasto === "y") {
        evento.preventDefault()
        ripeti()
        return
      }
      if (tasto === "a") {
        evento.preventDefault()
        selezionaTutto()
        return
      }
    }

    switch (evento.key) {
      case "ArrowUp":
        evento.preventDefault()
        evento.stopPropagation()
        spostaA(ri - 1, ci, evento.shiftKey)
        return
      case "ArrowDown":
        evento.preventDefault()
        evento.stopPropagation()
        spostaA(ri + 1, ci, evento.shiftKey)
        return
      case "ArrowLeft":
        evento.preventDefault()
        spostaA(ri, ci - 1, evento.shiftKey)
        return
      case "ArrowRight":
        evento.preventDefault()
        spostaA(ri, ci + 1, evento.shiftKey)
        return
      case "Home":
        evento.preventDefault()
        evento.stopPropagation()
        spostaA(ri, 0, evento.shiftKey)
        return
      case "End":
        evento.preventDefault()
        evento.stopPropagation()
        spostaA(ri, colonneId.length - 1, evento.shiftKey)
        return
      case "Tab":
        evento.preventDefault()
        spostaOrizzontale(evento.shiftKey ? -1 : 1)
        return
      case "Enter":
      case "F2":
        evento.preventDefault()
        apriModifica(id)
        return
      case "Delete":
      case "Backspace":
        evento.preventDefault()
        cancellaSelezione()
        return
    }
    // Un carattere stampabile avvia la modifica scrivendolo — come in un
    // foglio di calcolo, non serve prima premere Invio per "entrare" nella
    // cella.
    if (!mod && evento.key.length === 1) {
      evento.preventDefault()
      apriModifica(id, evento.key)
    }
  }

  return {
    righeIniziali,
    colonneId,
    idRiga,
    leggiCella,
    scriviCella,
    onModifica,
    righe,
    cellaAttiva,
    cellaInModifica,
    draftModifica,
    puoAnnullare: passato.length > 0,
    puoRipetere: futuro.length > 0,
    ultimoCommit,
    eAttiva,
    eInModifica,
    eSelezionata,
    eInAnteprimaRiempimento,
    aggiungiRiga,
    rimuoviRighe,
    vaiA,
    apriModifica,
    aggiornaDraft: setDraftModifica,
    commitModifica: commitModificaInterno,
    annullaModifica,
    onKeyDownCella,
    annulla,
    ripeti,
    evidenziaRiempimento,
    confermaRiempimento,
    impostaValore,
    incolla,
    serializzaSelezione,
    registraValidatore,
    registraSpostamentoVerticale,
  }
}

/* ────────────────────────────────────────────────────────────────────────
 * Persistenza — `useGridChanges` (sessione 3)
 * ──────────────────────────────────────────────────────────────────────── */

export type ChangeSetGriglia<TDato> = {
  /** Righe presenti ora ma non nell'ultimo salvataggio — nuove per intero. */
  creati: TDato[]
  /** Righe che c'erano già, ma diverse da come le teneva l'ultimo salvataggio. */
  aggiornati: TDato[]
  /** Id delle righe che c'erano nell'ultimo salvataggio e non ci sono più. */
  cancellati: string[]
  /** Comodo per un bottone "Salva" — `false` quando non c'è niente da mandare. */
  cePendente: boolean
}

/** Uguaglianza per campi di primo livello — quanto basta per `TDato`, che
 * qui è sempre un oggetto piatto (`scriviCella` lo ricostruisce con
 * `{...riga, [colonna]: valore}`, mai annidato). */
function righeUguali<TDato>(a: TDato, b: TDato): boolean {
  if (a === b) return true
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false
  const chiaviA = Object.keys(a)
  const chiaviB = Object.keys(b as object)
  if (chiaviA.length !== chiaviB.length) return false
  return chiaviA.every(
    (chiave) =>
      (a as Record<string, unknown>)[chiave] === (b as Record<string, unknown>)[chiave]
  )
}

/**
 * Il change-set fra le righe **correnti** del motore e le righe
 * dell'**ultimo salvataggio** — un confronto puro, ricalcolato a ogni
 * chiamata (`useMemo`), non un registro tenuto incrementalmente. La
 * differenza conta: un registro accumulato per-commit dovrebbe sapere
 * disfare la propria contabilità a ogni `annulla`/`ripeti` (un "creata"
 * seguito da un "annulla" dev'essere di nuovo "non c'era"), e sbagliarla è
 * facile quanto il caso che la trappola dell'`useEffect` di `CLAUDE.md`
 * descrive per un motivo diverso — uno stato derivato che si scosta
 * silenziosamente dalla verità che dovrebbe rispecchiare. Un confronto puro
 * non ha questo problema: qualunque stato la griglia raggiunga — dopo dieci
 * modifiche, o dopo altrettanti annulla — il change-set è sempre "cosa
 * differisce adesso", mai "cosa è successo strada facendo".
 *
 * `righeSalvate` non la tiene questo hook: la pagina la aggiorna a
 * `motore.righe` dopo un salvataggio riuscito (un `useState`/`useRef` suo),
 * e finché non lo fa il change-set resta quello che è — utile per un
 * bottone "Salva" disabilitato da `!cePendente`, o per riprovare un
 * salvataggio fallito senza perdere il conto di cosa mandare.
 */
export function useGridChanges<TDato>(
  righeCorrenti: TDato[],
  righeSalvate: TDato[],
  idRiga: (riga: TDato) => string
): ChangeSetGriglia<TDato> {
  return React.useMemo(() => {
    const mappaSalvate = new Map(righeSalvate.map((r) => [idRiga(r), r]))
    const mappaCorrenti = new Map(righeCorrenti.map((r) => [idRiga(r), r]))
    const creati: TDato[] = []
    const aggiornati: TDato[] = []
    mappaCorrenti.forEach((riga, id) => {
      const precedente = mappaSalvate.get(id)
      if (!precedente) creati.push(riga)
      else if (!righeUguali(precedente, riga)) aggiornati.push(riga)
    })
    const cancellati: string[] = []
    mappaSalvate.forEach((_riga, id) => {
      if (!mappaCorrenti.has(id)) cancellati.push(id)
    })
    return {
      creati,
      aggiornati,
      cancellati,
      cePendente: creati.length > 0 || aggiornati.length > 0 || cancellati.length > 0,
    }
  }, [righeCorrenti, righeSalvate, idRiga])
}

/* ────────────────────────────────────────────────────────────────────────
 * Il contesto — motore + riferimenti condivisi con le celle e i comandi
 * ──────────────────────────────────────────────────────────────────────── */

type ContestoDataGridValore = {
  motore: DataGridEngine<unknown>
  contenitoreRef: React.RefObject<HTMLDivElement | null>
  /** `false` finché la griglia non ha ricevuto una prima interazione vera —
   * v. il commento sul fuoco in `CellaTestoGriglia`: senza, la griglia si
   * ruberebbe il fuoco dalla pagina appena montata. */
  interagitoRef: React.RefObject<boolean>
}

const ContestoDataGrid = React.createContext<ContestoDataGridValore | null>(null)

/**
 * La via d'uscita per una colonna che le sei celle di questo file non
 * coprono — una colonna di azioni con un bottone «elimina», per dire (v. la
 * story `Computo`). Qualunque `cell` renderizzato dentro `<DataGrid>` può
 * chiamarlo per arrivare al motore, esattamente come fanno `CellaTestoGriglia`
 * e le altre: non è un'API interna travestita, è la stessa che usano loro.
 */
export function useContestoDataGrid<TDato>() {
  const contesto = React.useContext(ContestoDataGrid)
  if (!contesto) throw new Error("Questo componente va usato dentro <DataGrid>.")
  return contesto as unknown as {
    motore: DataGridEngine<TDato>
    contenitoreRef: React.RefObject<HTMLDivElement | null>
    interagitoRef: React.RefObject<boolean>
  }
}

/* ────────────────────────────────────────────────────────────────────────
 * Ciò che ogni cella condivide — stato, fuoco, validazione, l'accessor
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * L'indirizzo e lo stato di una cella, letti dal motore una volta sola —
 * ogni cella tipizzata parte da qui invece di ripetere le cinque righe.
 *
 * `errore` **non** viene dal motore: si calcola qui, chiamando `validazione`
 * (la funzione della colonna, già nella chiusura della cella) sul draft
 * corrente. Il motore tiene comunque il proprio registro dei validatori
 * (`registraValidatore`/`validatoriRef`) per rifiutare un commit non valido
 * da `commitModificaInterno` — ma quella lettura avviene in un gestore
 * d'evento, non in fase di render. Farla anche qui, per mostrare l'errore a
 * schermo, avrebbe voluto leggere una `ref` mentre si rende — un valore che
 * cambia dentro l'effetto di registrazione di *un'altra* cella, senza che
 * nulla dica a questa di ri-renderizzare quando succede. Calcolarlo dalla
 * stessa `validazione` che la cella già ha in chiusura evita la `ref` del
 * tutto: l'unica cosa reattiva di cui ha bisogno, `draftModifica`, è già
 * stato del motore.
 */
function useStatoCellaGriglia<TDato>(
  riga: TDato,
  colonnaId: string,
  validazione?: (valore: string) => string | undefined
) {
  const { motore, interagitoRef } = useContestoDataGrid<TDato>()
  const rigaId = motore.idRiga(riga)
  const id: CellaGrigliaId = { rigaId, colonnaId }
  const inModifica = motore.eInModifica(id)
  return {
    motore,
    interagitoRef,
    rigaId,
    id,
    attiva: motore.eAttiva(id),
    inModifica,
    selezionata: motore.eSelezionata(id),
    inAnteprima: motore.eInAnteprimaRiempimento(id),
    errore: inModifica ? validazione?.(motore.draftModifica) : undefined,
  }
}

/**
 * Riporta il fuoco reale del browser sulla cella attiva. Non basta guardare
 * se il vecchio nodo è sparito (`document.activeElement === document.body`):
 * cambiare `tabIndex` da 0 a -1 su un elemento **che ha già il fuoco non lo
 * sposta da solo** — il nodo resta a fuoco, il suo `tabIndex` conta solo per
 * il prossimo `Tab`. Preso su uno spostamento `ArrowRight` in un browser
 * vero: la cella nuova diventava attiva nello stato, ma il fuoco reale
 * restava sulla vecchia finché non si cliccava di nuovo. Il bersaglio giusto
 * è quindi "il fuoco è da qualche parte dentro la griglia" — la cella di
 * prima (`data-riga-id`) o `document.body` (l'uscita da una modifica con
 * `Escape`/`Invio`, o il rimontaggio dopo uno scorrimento fuori dalla
 * finestra virtualizzata, dove il vecchio nodo è stato smontato) — non solo
 * il caso "sparito".
 *
 * `interagitoRef` evita di farlo al primissimo render, prima che l'utente
 * abbia mai toccato la griglia (altrimenti la griglia si ruberebbe il fuoco
 * dalla pagina appena montata) — lo stesso pattern già usato in
 * `DataTableVirtualizedBody`.
 */
function useFuocoCellaGriglia(
  divRef: React.RefObject<HTMLElement | null>,
  attiva: boolean,
  inModifica: boolean,
  interagitoRef: React.RefObject<boolean>
) {
  React.useEffect(() => {
    if (!interagitoRef.current || !attiva || inModifica) return
    const fuocoNellaGriglia =
      document.activeElement === document.body ||
      (document.activeElement instanceof HTMLElement &&
        document.activeElement.hasAttribute("data-riga-id"))
    if (fuocoNellaGriglia && document.activeElement !== divRef.current) {
      divRef.current?.focus()
    }
  })
}

/**
 * Registra il validatore della colonna presso il motore mentre la cella è
 * montata — un effetto per riga montata, ma la `Map` del motore assorbe la
 * ripetizione (v. `registraValidatore`). La dipendenza `validazione` è la
 * funzione passata da `colonnaXGriglia`: se la pagina la ridefinisce a ogni
 * render (un errore comune, non specifico di questo componente) l'effetto
 * si ripete più spesso del necessario ma resta corretto, mai stantio.
 */
function useValidatoreCellaGriglia<TDato>(
  motore: DataGridEngine<TDato>,
  colonnaId: string,
  validazione: ((valore: string) => string | undefined) | undefined
) {
  React.useEffect(() => {
    if (!validazione) return
    motore.registraValidatore(colonnaId, validazione)
  }, [motore, colonnaId, validazione])
}

/** Un id univoco per il render corrente, per `aria-describedby` verso il
 * messaggio d'errore — `sr-only`, letto solo da chi non vede l'anello rosso. */
function nodoErroreCella(erroreId: string, errore: string | undefined) {
  if (!errore) return null
  return (
    <span id={erroreId} role="alert" className="sr-only">
      {errore}
    </span>
  )
}

/**
 * Adatta uno schema Zod a validatore di cella: `validaConZod(z.coerce.
 * number().min(0))` legge direttamente la stringa grezza della cella —
 * `z.coerce` la converte lui, non serve un passaggio in mezzo. Il messaggio
 * mostrato è il primo problema che Zod segnala, o una frase generica se lo
 * schema non ne scrive uno.
 */
export function validaConZod(schema: ZodType): (valore: string) => string | undefined {
  return (valore) => {
    const risultato = schema.safeParse(valore)
    if (risultato.success) return undefined
    return risultato.error.issues[0]?.message ?? "Valore non valido"
  }
}

function accessorGriglia<TDato extends RowData>(col: ReturnType<typeof creaColonne<TDato>>) {
  return col.accessor as (
    id: string,
    def: {
      header: string
      meta: { titolo: string }
      size?: number
      enableSorting: boolean
      enableColumnFilter: boolean
      enableGlobalFilter: boolean
      cell: (info: CellContext<any, TDato, unknown>) => React.ReactNode
    }
  ) => ColonnaTabella<TDato>
}

/** Le classi condivise dalla vista non-in-modifica di ogni cella. */
function classiVistaCella(selezionata: boolean, inAnteprima: boolean, extra?: string) {
  return cn(
    // `min-h-5`, non `h-full`: un'altezza in percentuale non si risolve
    // contro il `<td>` che contiene questo `<div>` — misurato, non
    // presunto: `getComputedStyle(...).height` tornava `0px` su una cella
    // svuotata (nessun testo a dare un'altezza di riga), mentre una cella
    // piena stava in piedi solo perché il proprio testo le dava un'altezza
    // (content-driven, mai davvero "piena quanto la riga"). Una cella da
    // 0px non si vede e non si clicca: preso perché una cella `select`
    // svuotata con `Delete` non si riusciva più a riaprire — non c'era
    // più niente lì su cui cliccare o su cui il fuoco potesse restare.
    //
    // `-m-2 … p-2`, non lo zero di prima: il `<div>` "brucia" il `p-2` del
    // `<td>` (`TableCell`, `ui/table.tsx` via `data-table.tsx`) invece di
    // starci dentro — un margine negativo che vale esattamente il padding
    // che cancella (stesso schema di `-my-2 -mr-2` già usato altrove nel
    // registro per un bottone in una cella), e lo riscrive come proprio
    // `p-2` interno, così il testo resta dove stava. La differenza è dove
    // arriva il **bordo** del `<div>`: prima si fermava al bordo interno
    // del padding del `<td>`, con uno scarto visibile fra l'anello di
    // fuoco e il vero confine della cella — "risicato", rilievo di
    // Francesco confrontato col comportamento di niko-table (il riquadro
    // lì arriva fino al bordo). Ora il `<div>` (e quindi l'anello) copre
    // l'intera cella. `min-h-9` — non più `min-h-5` — perché il minimo
    // ora deve coprire anche il `p-2` che si è preso in carico lui: cinque
    // unità di contenuto più due e due di padding, la stessa altezza di
    // riga di prima, non una in più.
    "-m-2 block min-h-9 w-full truncate p-2 outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
    selezionata && "bg-accent/40",
    inAnteprima && "outline-primary outline-1 outline-dashed",
    extra
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * Testo
 * ──────────────────────────────────────────────────────────────────────── */

function CellaTestoGriglia<TDato extends RowData>({
  info,
  colonnaId,
  validazione,
}: {
  info: CellContext<any, TDato, unknown>
  colonnaId: string
  validazione?: (valore: string) => string | undefined
}) {
  const riga = info.row.original
  const { motore, interagitoRef, rigaId, id, attiva, inModifica, selezionata, inAnteprima, errore } =
    useStatoCellaGriglia(riga, colonnaId, validazione)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const divRef = React.useRef<HTMLDivElement>(null)
  const erroreId = React.useId()

  useValidatoreCellaGriglia(motore, colonnaId, validazione)
  useFuocoCellaGriglia(divRef, attiva, inModifica, interagitoRef)
  React.useEffect(() => {
    if (inModifica) inputRef.current?.focus()
  }, [inModifica])

  if (inModifica) {
    return (
      <>
        <input
          ref={inputRef}
          value={motore.draftModifica}
          onChange={(evento) => motore.aggiornaDraft(evento.target.value)}
          onKeyDown={(evento) => motore.onKeyDownCella(evento, id)}
          onBlur={() => {
            if (!motore.commitModifica()) motore.annullaModifica()
          }}
          aria-invalid={!!errore}
          aria-describedby={errore ? erroreId : undefined}
          className={cn(
            "block h-full w-full truncate bg-transparent outline-none",
            errore && "text-destructive"
          )}
          aria-label={colonnaId}
        />
        {nodoErroreCella(erroreId, errore)}
      </>
    )
  }

  return (
    <div
      ref={divRef}
      // Niente `role="gridcell"` qui: il `<td>` che lo contiene (`TableCell`
      // di `data-table.tsx`) è già, per la mappatura HTML-ARIA, un
      // `gridcell` implicito — è un `<td>` con un antenato che dichiara
      // `role="grid"` (`attributiTabella`, sotto). Dichiararlo di nuovo su
      // questo `<div>` annidato dentro **duplica** il ruolo, e
      // `aria-required-parent` lo boccia: il genitore immediato di un
      // `gridcell` esplicito deve avere `role="row"`, e qui in mezzo c'è il
      // `<td>` — preso da axe, `critical`, prima di questa correzione.
      data-riga-id={rigaId}
      data-colonna-id={colonnaId}
      tabIndex={attiva ? 0 : -1}
      onMouseDown={() => motore.vaiA(id)}
      onDoubleClick={() => motore.apriModifica(id)}
      // Niente `onFocus`: il fuoco mobile fa sì che la cella tabbabile sia
      // **sempre** quella già attiva nello stato — sincronizzarla di nuovo
      // al fuoco sarebbe ridondante quando il click l'ha già fatto
      // (`onMouseDown`), e **dannoso** quando è l'effetto di `useFuocoCella
      // Griglia` a spostare il fuoco reale dopo una freccia: quel fuoco
      // programmato farebbe scattare `onFocus`, che richiamerebbe `vaiA`
      // senza sapere che lo spostamento era un'estensione di selezione
      // (`Shift+Freccia`) e ne cancellerebbe l'ancora. Preso in un browser
      // vero: `Shift+ArrowDown` spostava la cella attiva ma non estendeva
      // mai la selezione, perché il fuoco riassegnato dall'effetto azzerava
      // l'ancora un istante dopo che la tastiera l'aveva impostata.
      onKeyDown={(evento) => motore.onKeyDownCella(evento, id)}
      className={classiVistaCella(selezionata, inAnteprima)}
    >
      {motore.leggiCella(riga, colonnaId)}
    </div>
  )
}

/** Costruisce una colonna testuale editabile per `<DataGrid>`. `col` è lo
 * stesso `creaColonne<TDato>()` già usato altrove nel registry. */
export function colonnaTestoGriglia<TDato extends RowData>(
  col: ReturnType<typeof creaColonne<TDato>>,
  id: Extract<keyof TDato, string>,
  titolo: string,
  opzioni?: { size?: number; validazione?: (valore: string) => string | undefined }
): ColonnaTabella<TDato> {
  return accessorGriglia(col)(id, {
    header: titolo,
    meta: { titolo },
    size: opzioni?.size,
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    cell: (info) => (
      <CellaTestoGriglia info={info} colonnaId={id} validazione={opzioni?.validazione} />
    ),
  })
}

/* ────────────────────────────────────────────────────────────────────────
 * Numero e valuta — stessa cella, una differenza di formattazione
 * ──────────────────────────────────────────────────────────────────────── */

function CellaNumericaGriglia<TDato extends RowData>({
  info,
  colonnaId,
  validazione,
  valuta,
}: {
  info: CellContext<any, TDato, unknown>
  colonnaId: string
  validazione?: (valore: string) => string | undefined
  valuta?: boolean
}) {
  const riga = info.row.original
  const { motore, interagitoRef, rigaId, id, attiva, inModifica, selezionata, inAnteprima, errore } =
    useStatoCellaGriglia(riga, colonnaId, validazione)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const divRef = React.useRef<HTMLDivElement>(null)
  const erroreId = React.useId()
  const formattatore = React.useMemo(
    () =>
      new Intl.NumberFormat("it-IT", valuta ? { style: "currency", currency: "EUR" } : undefined),
    [valuta]
  )

  useValidatoreCellaGriglia(motore, colonnaId, validazione)
  useFuocoCellaGriglia(divRef, attiva, inModifica, interagitoRef)
  React.useEffect(() => {
    if (inModifica) inputRef.current?.focus()
  }, [inModifica])

  if (inModifica) {
    return (
      <>
        <input
          ref={inputRef}
          value={motore.draftModifica}
          onChange={(evento) => motore.aggiornaDraft(evento.target.value)}
          onKeyDown={(evento) => motore.onKeyDownCella(evento, id)}
          onBlur={() => {
            if (!motore.commitModifica()) motore.annullaModifica()
          }}
          aria-invalid={!!errore}
          aria-describedby={errore ? erroreId : undefined}
          inputMode="decimal"
          className={cn(
            "block h-full w-full truncate bg-transparent text-right tabular-nums outline-none",
            errore && "text-destructive"
          )}
          aria-label={colonnaId}
        />
        {nodoErroreCella(erroreId, errore)}
      </>
    )
  }

  const raw = motore.leggiCella(riga, colonnaId)
  const numero = raw === "" ? null : Number(raw)
  return (
    <div
      ref={divRef}
      data-riga-id={rigaId}
      data-colonna-id={colonnaId}
      tabIndex={attiva ? 0 : -1}
      onMouseDown={() => motore.vaiA(id)}
      onDoubleClick={() => motore.apriModifica(id)}
      onKeyDown={(evento) => motore.onKeyDownCella(evento, id)}
      className={classiVistaCella(selezionata, inAnteprima, "text-right tabular-nums")}
    >
      {numero === null || Number.isNaN(numero) ? raw : formattatore.format(numero)}
    </div>
  )
}

export function colonnaNumeroGriglia<TDato extends RowData>(
  col: ReturnType<typeof creaColonne<TDato>>,
  id: Extract<keyof TDato, string>,
  titolo: string,
  opzioni?: { size?: number; validazione?: (valore: string) => string | undefined }
): ColonnaTabella<TDato> {
  return accessorGriglia(col)(id, {
    header: titolo,
    meta: { titolo },
    size: opzioni?.size,
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    cell: (info) => (
      <CellaNumericaGriglia info={info} colonnaId={id} validazione={opzioni?.validazione} />
    ),
  })
}

/** Come `colonnaNumeroGriglia`, ma la vista formatta in euro (`Intl.
 * NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })`) — la
 * cella in modifica resta un numero semplice: si scrive "12.5", non "€
 * 12,50". */
export function colonnaValutaGriglia<TDato extends RowData>(
  col: ReturnType<typeof creaColonne<TDato>>,
  id: Extract<keyof TDato, string>,
  titolo: string,
  opzioni?: { size?: number; validazione?: (valore: string) => string | undefined }
): ColonnaTabella<TDato> {
  return accessorGriglia(col)(id, {
    header: titolo,
    meta: { titolo },
    size: opzioni?.size,
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    cell: (info) => (
      <CellaNumericaGriglia info={info} colonnaId={id} validazione={opzioni?.validazione} valuta />
    ),
  })
}

/* ────────────────────────────────────────────────────────────────────────
 * Checkbox — un gesto solo, niente modifica intermedia
 * ──────────────────────────────────────────────────────────────────────── */

/** I soli tasti che questa cella lascia al motore: la spunta li intercetta
 * prima (Spazio/Invio), e un carattere qualunque non deve aprire una
 * modifica di testo che questa cella non sa mostrare. */
const TASTI_NAVIGAZIONE_GRIGLIA = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "Tab",
  "Delete",
  "Backspace",
])

function CellaCheckboxGriglia<TDato extends RowData>({
  info,
  colonnaId,
}: {
  info: CellContext<any, TDato, unknown>
  colonnaId: string
}) {
  const riga = info.row.original
  const { motore, interagitoRef, rigaId, id, attiva, selezionata, inAnteprima } =
    useStatoCellaGriglia(riga, colonnaId)
  const divRef = React.useRef<HTMLDivElement>(null)
  useFuocoCellaGriglia(divRef, attiva, false, interagitoRef)

  const spuntato = motore.leggiCella(riga, colonnaId) === "true"
  const commuta = () => motore.impostaValore(id, spuntato ? "false" : "true")

  return (
    <div
      ref={divRef}
      data-riga-id={rigaId}
      data-colonna-id={colonnaId}
      tabIndex={attiva ? 0 : -1}
      onMouseDown={() => motore.vaiA(id)}
      onClick={commuta}
      onKeyDown={(evento) => {
        if (evento.key === " " || evento.key === "Enter") {
          evento.preventDefault()
          commuta()
          return
        }
        // Un tasto qualunque non finisce in `onKeyDownCella`: lì un
        // carattere stampabile apre una modifica di testo (la convenzione
        // "scrivere per modificare" delle celle testuali), e questa cella
        // non ha un'edizione di testo da mostrare — resterebbe una modifica
        // aperta senza schermo, e il primo Invio ci scriverebbe dentro il
        // carattere digitato come valore grezzo. Si delega solo la
        // navigazione vera.
        if (TASTI_NAVIGAZIONE_GRIGLIA.has(evento.key) || evento.metaKey || evento.ctrlKey) {
          motore.onKeyDownCella(evento, id)
        }
      }}
      className={classiVistaCella(selezionata, inAnteprima, "flex items-center justify-center")}
    >
      <Checkbox checked={spuntato} onCheckedChange={commuta} tabIndex={-1} aria-hidden />
    </div>
  )
}

export function colonnaCheckboxGriglia<TDato extends RowData>(
  col: ReturnType<typeof creaColonne<TDato>>,
  id: Extract<keyof TDato, string>,
  titolo: string,
  opzioni?: { size?: number }
): ColonnaTabella<TDato> {
  return accessorGriglia(col)(id, {
    header: titolo,
    meta: { titolo },
    size: opzioni?.size,
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    cell: (info) => <CellaCheckboxGriglia info={info} colonnaId={id} />,
  })
}

/* ────────────────────────────────────────────────────────────────────────
 * Data — `<input type="date">`, v. il commento in testa al file
 * ──────────────────────────────────────────────────────────────────────── */

function CellaDataGriglia<TDato extends RowData>({
  info,
  colonnaId,
  validazione,
}: {
  info: CellContext<any, TDato, unknown>
  colonnaId: string
  validazione?: (valore: string) => string | undefined
}) {
  const riga = info.row.original
  const { motore, interagitoRef, rigaId, id, attiva, inModifica, selezionata, inAnteprima, errore } =
    useStatoCellaGriglia(riga, colonnaId, validazione)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const divRef = React.useRef<HTMLDivElement>(null)
  const erroreId = React.useId()

  useValidatoreCellaGriglia(motore, colonnaId, validazione)
  useFuocoCellaGriglia(divRef, attiva, inModifica, interagitoRef)
  React.useEffect(() => {
    if (inModifica) inputRef.current?.focus()
  }, [inModifica])

  if (inModifica) {
    return (
      <>
        <input
          ref={inputRef}
          type="date"
          value={motore.draftModifica}
          onChange={(evento) => motore.aggiornaDraft(evento.target.value)}
          onKeyDown={(evento) => motore.onKeyDownCella(evento, id)}
          onBlur={() => {
            if (!motore.commitModifica()) motore.annullaModifica()
          }}
          aria-invalid={!!errore}
          aria-describedby={errore ? erroreId : undefined}
          className={cn(
            "block h-full w-full bg-transparent outline-none",
            errore && "text-destructive"
          )}
          aria-label={colonnaId}
        />
        {nodoErroreCella(erroreId, errore)}
      </>
    )
  }

  const raw = motore.leggiCella(riga, colonnaId)
  // Mezzogiorno e non mezzanotte: `new Date("AAAA-MM-GG")` la legge in UTC,
  // e un fuso indietro rispetto a UTC la farebbe cadere sul giorno prima
  // una volta formattata in locale — mezzogiorno resta lo stesso giorno in
  // ogni fuso plausibile per le app Tassullo.
  const testo = raw ? new Date(`${raw}T12:00:00`).toLocaleDateString("it-IT") : ""
  return (
    <div
      ref={divRef}
      data-riga-id={rigaId}
      data-colonna-id={colonnaId}
      tabIndex={attiva ? 0 : -1}
      onMouseDown={() => motore.vaiA(id)}
      onDoubleClick={() => motore.apriModifica(id)}
      onKeyDown={(evento) => motore.onKeyDownCella(evento, id)}
      className={classiVistaCella(selezionata, inAnteprima)}
    >
      {testo}
    </div>
  )
}

export function colonnaDataGriglia<TDato extends RowData>(
  col: ReturnType<typeof creaColonne<TDato>>,
  id: Extract<keyof TDato, string>,
  titolo: string,
  opzioni?: { size?: number; validazione?: (valore: string) => string | undefined }
): ColonnaTabella<TDato> {
  return accessorGriglia(col)(id, {
    header: titolo,
    meta: { titolo },
    size: opzioni?.size,
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    cell: (info) => (
      <CellaDataGriglia info={info} colonnaId={id} validazione={opzioni?.validazione} />
    ),
  })
}

/* ────────────────────────────────────────────────────────────────────────
 * Select — un gesto solo, come il checkbox
 * ──────────────────────────────────────────────────────────────────────── */

export type OpzioneSelectGriglia = { valore: string; etichetta: string }

function CellaSelectGriglia<TDato extends RowData>({
  info,
  colonnaId,
  opzioni,
}: {
  info: CellContext<any, TDato, unknown>
  colonnaId: string
  opzioni: OpzioneSelectGriglia[]
}) {
  const riga = info.row.original
  const { motore, interagitoRef, rigaId, id, attiva, inModifica, selezionata, inAnteprima } =
    useStatoCellaGriglia(riga, colonnaId)
  const divRef = React.useRef<HTMLDivElement>(null)
  useFuocoCellaGriglia(divRef, attiva, inModifica, interagitoRef)

  const raw = motore.leggiCella(riga, colonnaId)
  const etichetta = opzioni.find((o) => o.valore === raw)?.etichetta ?? raw

  if (inModifica) {
    return (
      <Select
        value={raw}
        open
        // `onOpenChange(false)` scatta sia scegliendo una voce sia con
        // `Escape` — nel primo caso `onValueChange` ha già chiuso la
        // modifica lui (`impostaValore`), quindi `annullaModifica` qui
        // trova `cellaInModifica` già `null` e non fa niente: nessun
        // bisogno di distinguere i due casi, il secondo è un no-op sul
        // primo.
        onOpenChange={(aperto) => {
          if (!aperto) motore.annullaModifica()
        }}
        onValueChange={(valore) => {
          if (valore != null) motore.impostaValore(id, valore)
        }}
      >
        <SelectTrigger
          // `SelectTrigger` porta la propria misura da modulo isolato —
          // `data-[size=default]:h-8`, `py-2`, `border` — pensata per stare
          // da sola in un modulo, non per riempire una cella già alta
          // quanto la riga. `h-full` da solo non basta a batterla: è un
          // altro gruppo di conflitto per `cn` (tailwind-merge), che
          // confronta `data-[size=default]:h-8` solo con un altro
          // `data-[size=default]:h-*`, non con `h-full` scritto senza
          // quel prefisso — le due classi restavano **entrambe** nel CSS
          // finale, e a vincere in cascata era `h-8`. Preso misurando la
          // riga: 41.56px chiusa, 49px con la select aperta — quella cella
          // sola, non l'intera griglia, perché solo lì cresceva il
          // contenuto oltre l'altezza delle altre.
          className="h-full w-full min-w-0 rounded-none border-0 px-2 py-0 data-[size=default]:h-full"
          aria-label={colonnaId}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {opzioni.map((o) => (
            <SelectItem key={o.valore} value={o.valore}>
              {o.etichetta}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <div
      ref={divRef}
      data-riga-id={rigaId}
      data-colonna-id={colonnaId}
      tabIndex={attiva ? 0 : -1}
      onMouseDown={() => motore.vaiA(id)}
      onDoubleClick={() => motore.apriModifica(id)}
      onKeyDown={(evento) => motore.onKeyDownCella(evento, id)}
      className={classiVistaCella(selezionata, inAnteprima)}
    >
      {etichetta}
    </div>
  )
}

export function colonnaSelectGriglia<TDato extends RowData>(
  col: ReturnType<typeof creaColonne<TDato>>,
  id: Extract<keyof TDato, string>,
  titolo: string,
  opzioni: OpzioneSelectGriglia[],
  extra?: { size?: number }
): ColonnaTabella<TDato> {
  return accessorGriglia(col)(id, {
    header: titolo,
    meta: { titolo },
    size: extra?.size,
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    cell: (info) => <CellaSelectGriglia info={info} colonnaId={id} opzioni={opzioni} />,
  })
}

/* ────────────────────────────────────────────────────────────────────────
 * `<DataGrid>`
 *
 * **Vuole un genitore ad altezza vera**, sempre — non un'opzione come in
 * `<DataTable altezza="ferma">`, perché `<DataGrid>` quella combinazione la
 * sceglie lei, incondizionata (v. sotto). Lo stesso pattern della story
 * `Virtualizzata` di `data-table.stories.tsx`:
 *
 *   <div className="flex h-140 flex-col">
 *     <DataGrid motore={motore} colonne={COLONNE} className="min-h-0 flex-1">
 *       …
 *     </DataGrid>
 *   </div>
 *
 * Senza — provato a 500 righe nella story `Computo`, non a occhio — il
 * vincolo di altezza non arriva mai al `<DataTable>` innestato, che cresce
 * con tutte le righe: la virtualizzazione promessa non regge, in silenzio
 * (poche righe non lo rivelano).
 * ──────────────────────────────────────────────────────────────────────── */

export type DataGridProps<TDato extends RowData> = Omit<
  DataTableProps<TDato>,
  | "dati"
  | "perPagina"
  | "altezza"
  | "cerca"
  | "internoGriglia"
  | "attributiTabella"
  | "getSottoRighe"
  | "pannelloRiga"
> & {
  motore: DataGridEngine<TDato>
  /** `DataGridClipboard`/`DataGridFillHandle` — componenti opt-in, v. il file. */
  children?: React.ReactNode
}

export function DataGrid<TDato extends RowData>({
  motore,
  colonne,
  barra,
  children,
  ...resto
}: DataGridProps<TDato>) {
  const contenitoreRef = React.useRef<HTMLDivElement>(null)
  const interagitoRef = React.useRef(false)
  const vaiAVirtualeRef = React.useRef<((indice: number) => void) | null>(null)

  React.useEffect(() => {
    motore.registraSpostamentoVerticale((indice) => {
      vaiAVirtualeRef.current?.(indice)
    })
    return () => motore.registraSpostamentoVerticale(null)
  }, [motore])

  const alVirtualizzatore = React.useCallback((v: (indice: number) => void) => {
    vaiAVirtualeRef.current = v
  }, [])

  return (
    <ContestoDataGrid.Provider
      value={{ motore: motore as DataGridEngine<unknown>, contenitoreRef, interagitoRef }}
    >
      <div
        ref={contenitoreRef}
        // `flex-1`: `<DataGrid>` nasce sempre `altezza="ferma"`/`perPagina=
        // "virtuale"` (v. sotto), che vogliono un genitore ad altezza vera —
        // lo stesso prerequisito che `DataTable` documenta per quella
        // combinazione, non diverso qui. Senza `flex-1` questo `<div>` non
        // parteciperebbe al layout flex del contenitore che lo ospita anche
        // quando quello **ha** un'altezza ferma: il vincolo non
        // arriverebbe mai fino al `<DataTable>` innestato sotto, che
        // continuerebbe a crescere con tutte le righe — nessuna
        // virtualizzazione vera, un difetto silenzioso perché a poche
        // righe non si vede (preso solo a 500, misurando: 469 righe
        // montate invece di una finestra).
        className="relative flex min-h-0 flex-1 flex-col gap-4"
        onFocusCapture={() => {
          interagitoRef.current = true
        }}
        onMouseDownCapture={() => {
          interagitoRef.current = true
        }}
      >
        {children}
        <DataTable
          colonne={colonne}
          dati={motore.righe}
          cerca={false}
          perPagina="virtuale"
          altezza="ferma"
          barra={barra}
          internoGriglia={{ senzaFocoRiga: true, alVirtualizzatore }}
          attributiTabella={{
            role: "grid",
            "aria-rowcount": motore.righe.length,
            "aria-colcount": motore.colonneId.length,
          }}
          {...resto}
        />
      </div>
    </ContestoDataGrid.Provider>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * I componenti opt-in
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Il copia/incolla vero: un componente opt-in — montato solo se una pagina
 * lo mette dentro `<DataGrid>` — che aggiunge **una** `<textarea>` nascosta
 * e un solo `addEventListener` in cattura sul contenitore. Non montarlo
 * lascia la griglia senza clipboard, zero costo, come da architettura (v.
 * il commento in testa al file).
 *
 * ── Perché non `navigator.clipboard` ─────────────────────────────────────
 *
 * La prima stesura usava `navigator.clipboard.writeText`/`readText` da
 * dentro `onKeyDownCella`. **Safari non implementa `readText()`** — non è
 * un bug di questa sessione, è WebKit che non la espone affatto — e il
 * tentativo falliva in silenzio dietro un `.catch(() => {})`: da Safari,
 * incollare un foglio copiato da un'altra app non faceva **niente**,
 * rilievo di Francesco su questa storia. `writeText()` invece esiste in
 * Safari, ma solo `readText()` era il problema — asimmetria che avrebbe
 * reso il difetto ancora più difficile da sospettare guardando solo la
 * copia, che funzionava.
 *
 * La tecnica che funziona ovunque è la stessa di prima dei permessi
 * asincroni: una `<textarea>` vera, **reindirizzata a fuoco** appena si
 * preme Ctrl/Cmd+C/X/V — non con `preventDefault()` sul tasto (che
 * sopprimerebbe il comando di sistema prima che la textarea possa
 * riceverlo), ma spostando il fuoco *prima* che il browser esegua l'azione
 * predefinita del tasto. Il comando copia/incolla del sistema operativo
 * scatta quindi **sulla textarea**, che è un campo di testo vero — gli
 * eventi nativi `copy`/`cut`/`paste` funzionano lì in ogni browser, senza
 * nessun permesso da chiedere.
 */
export function DataGridClipboard({ className }: { className?: string }) {
  const { motore, contenitoreRef } = useContestoDataGrid()
  const testoRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    const contenitore = contenitoreRef.current
    if (!contenitore) return

    const alTastoGiu = (evento: KeyboardEvent) => {
      const mod = evento.metaKey || evento.ctrlKey
      if (!mod || motore.cellaInModifica) return
      const tasto = evento.key.toLowerCase()
      if (tasto !== "c" && tasto !== "x" && tasto !== "v") return
      // Solo da una cella della griglia — non da un bottone della barra
      // (Annulla/Ripeti, «Colonne»), che sta anche lui dentro `contenitore`
      // e ha il proprio Ctrl+C/V di sistema, se mai ne avesse bisogno.
      if (
        !(evento.target instanceof HTMLElement) ||
        !evento.target.hasAttribute("data-riga-id")
      ) {
        return
      }
      const nodo = testoRef.current
      if (!nodo) return
      // Il taglia si comporta come copia: cancellare la selezione dopo un
      // taglio riuscito è lavoro in più (e un secondo giro di cronologia)
      // fuori da questa sessione — annotato, non promesso.
      nodo.value = tasto === "v" ? "" : motore.serializzaSelezione()
      nodo.focus()
      nodo.select()
      // Niente `preventDefault()`: è il comando di sistema, ora diretto
      // alla textarea, a dover ancora scattare.
    }

    contenitore.addEventListener("keydown", alTastoGiu, true)
    return () => contenitore.removeEventListener("keydown", alTastoGiu, true)
  }, [motore, contenitoreRef])

  return (
    <>
      <p className={cn("text-muted-foreground text-sm", className)}>
        Copia con Ctrl/Cmd+C, incolla con Ctrl/Cmd+V — un foglio di calcolo
        intero, non solo una cella.
      </p>
      {/* Non controllata, di proposito: il suo valore lo scrive
          `alTastoGiu` in modo imperativo, appena prima del fuoco — un
          `value` React lo riscriverebbe al prossimo render, e qui non c'è
          nessuno stato di cui questo campo sia il riflesso. */}
      <textarea
        ref={testoRef}
        aria-hidden
        tabIndex={-1}
        className="sr-only"
        onCopy={(evento) => {
          evento.preventDefault()
          evento.clipboardData.setData("text/plain", motore.serializzaSelezione())
          evento.currentTarget.blur()
        }}
        onCut={(evento) => {
          evento.preventDefault()
          evento.clipboardData.setData("text/plain", motore.serializzaSelezione())
          evento.currentTarget.blur()
        }}
        onPaste={(evento) => {
          evento.preventDefault()
          const testo = evento.clipboardData.getData("text/plain")
          if (testo) motore.incolla(testo)
          evento.currentTarget.blur()
        }}
        // Il fuoco torna alla cella attiva da solo: `blur()` porta
        // `document.activeElement` a `document.body`, e l'effetto di fuoco
        // di ogni cella (`useFuocoCellaGriglia`) lo riconosce già come "il
        // fuoco è sfuggito dalla griglia, riportalo sulla cella attiva" —
        // lo stesso meccanismo che già gestisce l'uscita da una modifica e
        // il rimontaggio dopo uno scorrimento, non un caso nuovo da capire.
      />
    </>
  )
}

/**
 * La maniglia di riempimento: un quadratino sull'angolo in basso a destra
 * della cella attiva, trascinabile per riempire le celle sotto/accanto col
 * valore della cella di partenza. **Non l'unica via**: Ctrl/Cmd+Invio fa la
 * stessa cosa sulla selezione corrente, da tastiera, senza puntatore — la
 * via primaria per chi non usa il mouse (lo stesso principio già scritto per
 * la maniglia di ridimensionamento in M3bis.3).
 */
export function DataGridFillHandle() {
  const { motore, contenitoreRef } = useContestoDataGrid()
  const [posizione, setPosizione] = React.useState<{ top: number; left: number } | null>(null)
  // Chiave primitiva della cella attiva — non l'oggetto, che è nuovo ogni
  // render (la stessa trappola delle dipendenze non primitive di
  // `CLAUDE.md`): l'effetto deve ripartire solo quando la cella **cambia
  // davvero**, non a ogni render di `<DataGrid>`.
  const cellaChiave = motore.cellaAttiva
    ? `${motore.cellaAttiva.rigaId} ${motore.cellaAttiva.colonnaId}`
    : null

  React.useEffect(() => {
    const contenitore = contenitoreRef.current
    const aggiorna = () => {
      if (!contenitore || !motore.cellaAttiva) {
        setPosizione(null)
        return
      }
      // Niente maniglia quando il fuoco è uscito dalla griglia — un clic
      // su «Salva», sul menu «Colonne», o fuori dalla pagina — anche se
      // `cellaAttiva` resta quella di prima: il motore non la scorda mai
      // (è così che «Invio» sa dove tornare), ma la maniglia è un
      // comando sulla cella **a fuoco**, e senza fuoco lì non c'è niente
      // da trascinare. Rilievo di Francesco: restava a mezz'aria sopra la
      // riga anche con la barra degli strumenti a fuoco. Non basta
      // `contenitore.contains(...)`: la barra è anche lei dentro
      // `contenitore` (è dentro `<DataTable>`, che `<DataGrid>` avvolge).
      // Il bersaglio giusto è "il fuoco è su una cella vera" —
      // `data-riga-id` lo distingue da un bottone della barra o dalla
      // cella in modifica (un `<input>`/`<select>`, dove la maniglia non
      // ha senso comunque).
      if (
        !(document.activeElement instanceof HTMLElement) ||
        !document.activeElement.hasAttribute("data-riga-id")
      ) {
        setPosizione(null)
        return
      }
      const nodo = contenitore.querySelector<HTMLElement>(
        `[data-riga-id="${CSS.escape(motore.cellaAttiva.rigaId)}"][data-colonna-id="${CSS.escape(motore.cellaAttiva.colonnaId)}"]`
      )
      if (!nodo) {
        setPosizione(null)
        return
      }
      const box = nodo.getBoundingClientRect()
      /**
       * "Montata" non vuol dire "visibile". Il virtualizzatore tiene
       * montate anche le righe dell'`overscan` appena fuori dalla finestra
       * — la cella attiva può quindi avere ancora un nodo DOM vero anche
       * mentre è scorsa sopra la testata o sotto il fondo del riquadro, e
       * `nodo` qui sopra non torna mai `null` per quel caso. Preso da
       * Francesco: la maniglia "usciva dal bordo della tabella e saliva
       * sullo schermo" — perché la sua posizione si calcola rispetto a
       * `contenitore` (tutto `<DataGrid>`, barra compresa), non rispetto
       * al riquadro della tabella: una cella scorsa sopra la testata dà un
       * `top` piccolo o negativo **dentro la tabella**, ma resta un `top`
       * positivo dentro `contenitore` — abbastanza per disegnare la
       * maniglia sopra la barra, mai per nasconderla. Il confine giusto è
       * quindi il riquadro scorrevole vero (`table-container`), non la
       * sola presenza nel DOM: se la cella è sopra la testata o sotto il
       * fondo, la maniglia sparisce, come sparirebbe se il nodo non
       * esistesse affatto.
       */
      const scorrevole = contenitore.querySelector<HTMLElement>('[data-slot="table-container"]')
      const testata = contenitore.querySelector<HTMLElement>('[data-slot="table-header"]')
      if (scorrevole) {
        const areaVisibile = scorrevole.getBoundingClientRect()
        const cimaVisibile = areaVisibile.top + (testata?.getBoundingClientRect().height ?? 0)
        if (box.bottom <= cimaVisibile || box.top >= areaVisibile.bottom) {
          setPosizione(null)
          return
        }
      }
      const cont = contenitore.getBoundingClientRect()
      setPosizione({ top: box.bottom - cont.top, left: box.right - cont.left })
    }
    aggiorna()
    if (!contenitore) return
    /**
     * Lo scorrimento verticale della griglia (`table-container`, dentro
     * `contenitore`) sposta la cella senza che `cellaChiave` cambi: la
     * maniglia deve seguirla comunque, non solo quando si sposta la cella
     * attiva.
     *
     * **In cattura su `contenitore`, non sull'elemento che scorre**: il
     * virtualizzatore ascolta `scroll` direttamente su `table-container`, e
     * un ascolto in cattura su un antenato arriva **prima** — nella fase di
     * cattura, non in quella di bolla, che `scroll` peraltro non garantisce
     * di percorrere in ogni motore. Chiamare `aggiorna()` subito, in quel
     * punto, legge quindi lo stato delle righe montate di **prima** dello
     * spostamento: preso tornando in cima dopo uno scorrimento enorme, la
     * maniglia restava sparita finché non arrivava un secondo scorrimento
     * qualunque a ridare l'occasione di ricalcolare. `requestAnimationFrame`
     * rimanda la lettura a dopo che React ha avuto il suo turno — lo stesso
     * evento nativo ha già fatto scattare l'aggiornamento del
     * virtualizzatore, che monta/smonta righe in una `setState` sincrona
     * nello stesso giro; il fotogramma successivo la vede già a posto.
     */
    const aggiornaRitardato = () => requestAnimationFrame(aggiorna)
    const ro = new ResizeObserver(aggiornaRitardato)
    ro.observe(contenitore)
    contenitore.addEventListener("scroll", aggiornaRitardato, true)
    // `focusin`/`focusout` (non `focus`/`blur`: quelli non risalgono) —
    // il fuoco che entra o esce da una cella non passa né da uno
    // scorrimento né da un ridimensionamento, e senza questi due la
    // maniglia rimaneva a mezz'aria finché non arrivava un evento
    // qualunque a ricalcolarla.
    document.addEventListener("focusin", aggiorna)
    document.addEventListener("focusout", aggiorna)
    return () => {
      ro.disconnect()
      contenitore.removeEventListener("scroll", aggiornaRitardato, true)
      document.removeEventListener("focusin", aggiorna)
      document.removeEventListener("focusout", aggiorna)
    }
  }, [cellaChiave, contenitoreRef, motore])

  if (!posizione) return null

  const alMouseDown = (evento: React.MouseEvent) => {
    evento.preventDefault()
    const alMouseMove = (e: MouseEvent) => {
      const elemento = document.elementFromPoint(e.clientX, e.clientY)
      const cella = elemento?.closest<HTMLElement>("[data-riga-id][data-colonna-id]")
      if (!cella) return
      motore.evidenziaRiempimento({
        rigaId: cella.dataset.rigaId!,
        colonnaId: cella.dataset.colonnaId!,
      })
    }
    const alMouseUp = () => {
      motore.confermaRiempimento()
      document.removeEventListener("mousemove", alMouseMove)
      document.removeEventListener("mouseup", alMouseUp)
    }
    document.addEventListener("mousemove", alMouseMove)
    document.addEventListener("mouseup", alMouseUp)
  }

  return (
    <div
      role="presentation"
      aria-hidden
      onMouseDown={alMouseDown}
      className="bg-primary absolute z-20 size-2 -translate-x-1/2 -translate-y-1/2 cursor-crosshair rounded-full"
      style={{ top: posizione.top, left: posizione.left }}
    />
  )
}

export function DataGridUndo({ className }: { className?: string }) {
  const { motore } = useContestoDataGrid()
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      disabled={!motore.puoAnnullare}
      onClick={motore.annulla}
      className={className}
      aria-label="Annulla"
    >
      <Undo2Icon />
    </Button>
  )
}

export function DataGridRedo({ className }: { className?: string }) {
  const { motore } = useContestoDataGrid()
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      disabled={!motore.puoRipetere}
      onClick={motore.ripeti}
      className={className}
      aria-label="Ripeti"
    >
      <Redo2Icon />
    </Button>
  )
}
