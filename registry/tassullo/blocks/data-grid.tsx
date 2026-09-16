/**
 * `tassullo-data-grid` — motore di editing per `tassullo-data-table`
 * (M3bis.5, sessione 1 di 3: motore + composizione minima).
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
 * ── Cosa NON c'è ancora, di proposito ────────────────────────────────────
 *
 * Celle tipizzate (numero/valuta/checkbox/data/select) e validazione Zod:
 * M3bis.5 sessione 2. Persistenza (`useGridChanges`, creazione/aggiornamento/
 * cancellazione come change-set) e la prova end-to-end sul computo finto:
 * sessione 3 — è lì che il criterio di accettazione di `PIANO.md` si
 * verifica per intero. Qui c'è solo `CellaTestoGriglia`, la cella minima che
 * basta a provare motore, clipboard, riempimento e cronologia.
 */
import * as React from "react"
import type { CellContext, RowData } from "@tanstack/react-table"
import { Redo2Icon, Undo2Icon } from "lucide-react"

import { cn } from "cn"
import { Button } from "@/registry/tassullo/ui/button"
import {
  DataTable,
  creaColonne,
  type ColonnaTabella,
  type DataTableProps,
} from "@/registry/tassullo/blocks/data-table"

/* ────────────────────────────────────────────────────────────────────────
 * Il motore — `useDataGrid`
 * ──────────────────────────────────────────────────────────────────────── */

/** L'indirizzo di una cella: quale riga (per id, non per indice — l'indice
 * cambia se una sessione futura aggiunge/toglie righe), quale colonna. */
export type CellaGrigliaId = { rigaId: string; colonnaId: string }

/** Cosa è successo per ultimo, per un'eventuale barra di stato (sessione 3). */
export type CommitGriglia = {
  tipo: "modifica" | "incolla" | "riempimento" | "annulla" | "ripeti"
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
  vaiA: (id: CellaGrigliaId, opzioni?: { estendi?: boolean }) => void
  apriModifica: (id?: CellaGrigliaId, valoreIniziale?: string) => void
  aggiornaDraft: (valore: string) => void
  commitModifica: () => void
  annullaModifica: () => void
  onKeyDownCella: (evento: React.KeyboardEvent, id: CellaGrigliaId) => void
  annulla: () => void
  ripeti: () => void
  /** Anteprima del trascinamento della maniglia (`DataGridFillHandle`). */
  evidenziaRiempimento: (id: CellaGrigliaId) => void
  confermaRiempimento: () => void
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

  const commitModificaInterno = () => {
    if (!cellaInModifica) return
    const idx = indiceRiga.get(cellaInModifica.rigaId)
    if (idx == null) {
      setCellaInModifica(null)
      return
    }
    const nuoveRighe = righe.slice()
    nuoveRighe[idx] = scriviCella(nuoveRighe[idx]!, cellaInModifica.colonnaId, draftModifica)
    registraCommit(nuoveRighe, "modifica")
    setCellaInModifica(null)
  }

  const vaiA = (id: CellaGrigliaId, opzioni?: { estendi?: boolean }) => {
    // Spostarsi via da una modifica in corso la commit — come in un foglio
    // di calcolo vero: cliccare un'altra cella non butta via ciò che si è
    // appena scritto.
    if (cellaInModifica && !eAttiva(id)) commitModificaInterno()
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

  const copia = () => {
    const testo = serializzaSelezione()
    if (testo) navigator.clipboard?.writeText(testo).catch(() => {})
  }

  const onKeyDownCella = (evento: React.KeyboardEvent, id: CellaGrigliaId) => {
    const mod = evento.metaKey || evento.ctrlKey
    if (cellaInModifica) {
      if (evento.key === "Enter") {
        evento.preventDefault()
        commitModificaInterno()
        spostaVerticale(1)
      } else if (evento.key === "Escape") {
        evento.preventDefault()
        annullaModifica()
      } else if (evento.key === "Tab") {
        evento.preventDefault()
        commitModificaInterno()
        spostaOrizzontale(evento.shiftKey ? -1 : 1)
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
    if (mod) {
      const tasto = evento.key.toLowerCase()
      if (evento.key === "Enter") {
        evento.preventDefault()
        riempi()
        return
      }
      if (tasto === "c") {
        evento.preventDefault()
        copia()
        return
      }
      if (tasto === "v") {
        evento.preventDefault()
        navigator.clipboard
          ?.readText()
          .then((testo) => {
            if (testo) incolla(testo)
          })
          .catch(() => {})
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
    registraSpostamentoVerticale,
  }
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

function useContestoDataGrid<TDato>() {
  const contesto = React.useContext(ContestoDataGrid)
  if (!contesto) throw new Error("Questo componente va usato dentro <DataGrid>.")
  return contesto as unknown as {
    motore: DataGridEngine<TDato>
    contenitoreRef: React.RefObject<HTMLDivElement | null>
    interagitoRef: React.RefObject<boolean>
  }
}

/* ────────────────────────────────────────────────────────────────────────
 * La cella minima — testo semplice, sessione 1
 * ──────────────────────────────────────────────────────────────────────── */

function CellaTestoGriglia<TDato extends RowData>({
  info,
  colonnaId,
}: {
  info: CellContext<any, TDato, unknown>
  colonnaId: string
}) {
  const { motore, interagitoRef } = useContestoDataGrid<TDato>()
  const riga = info.row.original
  const rigaId = motore.idRiga(riga)
  const id: CellaGrigliaId = { rigaId, colonnaId }
  const attiva = motore.eAttiva(id)
  const inModifica = motore.eInModifica(id)
  const selezionata = motore.eSelezionata(id)
  const inAnteprima = motore.eInAnteprimaRiempimento(id)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const divRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (inModifica) inputRef.current?.focus()
  }, [inModifica])

  /**
   * Riporta il fuoco reale del browser sulla cella attiva. Non basta
   * guardare se il vecchio nodo è sparito (`document.activeElement ===
   * document.body`): cambiare `tabIndex` da 0 a -1 su un elemento **che ha
   * già il fuoco non lo sposta da solo** — il nodo resta a fuoco, il suo
   * `tabIndex` conta solo per il prossimo `Tab`. Preso su uno spostamento
   * `ArrowRight` in un browser vero: la cella nuova diventava attiva nello
   * stato, ma il fuoco reale restava sulla vecchia finché non si cliccava di
   * nuovo. Il bersaglio giusto è quindi "il fuoco è da qualche parte dentro
   * la griglia" — la cella di prima (`data-riga-id`) o `document.body`
   * (l'uscita da una modifica con `Escape`/`Invio`, o il rimontaggio dopo
   * uno scorrimento fuori dalla finestra virtualizzata, dove il vecchio nodo
   * è stato smontato) — non solo il caso "sparito".
   *
   * `interagitoRef` evita di farlo al primissimo render, prima che l'utente
   * abbia mai toccato la griglia (altrimenti la griglia si ruberebbe il
   * fuoco dalla pagina appena montata) — lo stesso pattern già usato in
   * `DataTableVirtualizedBody`.
   */
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

  if (inModifica) {
    return (
      <input
        ref={inputRef}
        value={motore.draftModifica}
        onChange={(evento) => motore.aggiornaDraft(evento.target.value)}
        onKeyDown={(evento) => motore.onKeyDownCella(evento, id)}
        onBlur={() => motore.commitModifica()}
        className="block h-full w-full truncate bg-transparent outline-none"
        aria-label={colonnaId}
      />
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
      // (`onMouseDown`), e **dannoso** quando è l'effetto qui sopra a
      // spostare il fuoco reale dopo una freccia: quel fuoco programmato
      // farebbe scattare `onFocus`, che richiamerebbe `vaiA` senza sapere
      // che lo spostamento era un'estensione di selezione (`Shift+Freccia`)
      // e ne cancellerebbe l'ancora. Preso in un browser vero: `Shift+
      // ArrowDown` spostava la cella attiva ma non estendeva mai la
      // selezione, perché il fuoco riassegnato dall'effetto azzerava
      // l'ancora un istante dopo che la tastiera l'aveva impostata.
      onKeyDown={(evento) => motore.onKeyDownCella(evento, id)}
      className={cn(
        "block h-full w-full truncate outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        selezionata && "bg-accent/40",
        inAnteprima && "outline-primary outline-1 outline-dashed"
      )}
    >
      {motore.leggiCella(riga, colonnaId)}
    </div>
  )
}

/**
 * Costruisce una colonna testuale editabile per `<DataGrid>` — la sola cella
 * tipizzata che questa sessione porta (numero/valuta/checkbox/data/select
 * arrivano in M3bis.5 sessione 2). `col` è lo stesso `creaColonne<TDato>()`
 * già usato altrove nel registry.
 */
export function colonnaTestoGriglia<TDato extends RowData>(
  col: ReturnType<typeof creaColonne<TDato>>,
  id: Extract<keyof TDato, string>,
  titolo: string,
  opzioni?: { size?: number }
): ColonnaTabella<TDato> {
  const accessor = col.accessor as (
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
  return accessor(id, {
    header: titolo,
    meta: { titolo },
    size: opzioni?.size,
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    cell: (info) => <CellaTestoGriglia info={info} colonnaId={id} />,
  })
}

/* ────────────────────────────────────────────────────────────────────────
 * `<DataGrid>`
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
        className="relative flex min-h-0 flex-col gap-4"
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
 * Nessuna UI: dichiara solo il segnaposto della griglia vuota o della barra
 * — pensato per essere messo in `barra` o accanto, non dentro `<DataGrid>`.
 * Il copia/incolla vero è già acceso sempre (`onKeyDownCella`, v. sopra): il
 * componente esiste perché niko-table lo tratta come un pezzo a sé, e perché
 * una sessione futura potrebbe volerci appendere un indicatore di stato
 * ("copiate 12 celle") senza toccare il motore.
 */
export function DataGridClipboard({ className }: { className?: string }) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)}>
      Copia con Ctrl/Cmd+C, incolla con Ctrl/Cmd+V — un foglio di calcolo
      intero, non solo una cella.
    </p>
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
      const nodo = contenitore.querySelector<HTMLElement>(
        `[data-riga-id="${CSS.escape(motore.cellaAttiva.rigaId)}"][data-colonna-id="${CSS.escape(motore.cellaAttiva.colonnaId)}"]`
      )
      if (!nodo) {
        setPosizione(null)
        return
      }
      const box = nodo.getBoundingClientRect()
      const cont = contenitore.getBoundingClientRect()
      setPosizione({ top: box.bottom - cont.top, left: box.right - cont.left })
    }
    aggiorna()
    if (!contenitore) return
    // Lo scorrimento verticale della griglia (`table-container`, dentro
    // `contenitore`) sposta la cella senza che `cellaChiave` cambi: la
    // maniglia deve seguirla comunque, non solo quando si sposta la cella
    // attiva.
    const ro = new ResizeObserver(aggiorna)
    ro.observe(contenitore)
    contenitore.addEventListener("scroll", aggiorna, true)
    return () => {
      ro.disconnect()
      contenitore.removeEventListener("scroll", aggiorna, true)
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
