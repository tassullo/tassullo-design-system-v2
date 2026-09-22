/**
 * `tassullo-foglio-gruppi` — il foglio editabile **a gruppi** (M4ter.12).
 *
 * Componente nostro, gradino 4 della regola 4bis, **approvato da Francesco il
 * 2026-09-21**. Il verbale con le misure che lo motivano sta in
 * `docs/DECISIONI.md` §50 e nella sua revisione; `docs/ANALISI-COPERTURA-APP.md`
 * §8.3bis dice da quale pagina nasce. Sta in `blocks/` e non in `ui/`, quindi
 * non gli serve una riga in `registry/componenti-propri.json` — quel registro è
 * per ciò che prende il posto di una **primitiva** shadcn, e `check:registry`
 * chiede ai blocchi la sola regola 3.
 *
 * ── Cos'è, e perché non è nessuno dei due blocchi che già esistono ───────
 *
 * Un computo metrico — e ogni foglio fatto come lui — non è una tabella e non
 * è un albero: è una **sequenza di gruppi**, ognuno con una **testata**, un
 * **corpo omogeneo** di righe e un **piede** che le somma. La differenza che
 * conta non è la profondità, è che **le colonne si spartiscono per zona**
 * invece di volere la stessa cosa su ogni riga:
 *
 *   colonna        testata      corpo              piede
 *   ─────────────  ───────────  ─────────────────  ──────────────────
 *   designazione   descrizione  descrizione riga   etichetta + unità
 *   par.ug…h/peso  —            LE CELLE SCRIVIBILI  —  (una cella vuota)
 *   quantità       —            parziale (calcolo) totale   (calcolo)
 *   prezzo         —            —                  PREZZO   (scrivibile)
 *
 * `tassullo-data-table` dà l'albero (`getSottoRighe`) e il subtotale
 * (`meta.sottototale`), ma la sua tastiera è **di riga**, e il subtotale sta
 * **sulla riga-madre**, che si rende *sopra* i figli: il «SOMMANO» di un
 * computo sta **sotto**. `tassullo-data-grid` dà la tastiera **di cella**, ma
 * è una **matrice**: naviga per indice su un array piatto e le sue cinque
 * operazioni di selezione (`serializzaSelezione`, `incolla`, `riempi`,
 * `riempiInDirezione`, `cancellaSelezione`) sono rettangoli `(r,c)`, che
 * presuppongono colonne omogenee. Nessuno dei due si piega senza diventare
 * l'altro.
 *
 * ── L'indice segue il foglio, non l'array ───────────────────────────────
 *
 * È la correzione che `data-grid` non poteva fare restando sé stesso. La
 * navigazione non conta indici su un array di dati: costruisce una **matrice
 * di celle visive** — una riga per ogni riga resa, una colonna per ogni
 * colonna dichiarata — dove le caselle che non esistono sono `null`. Le
 * frecce si muovono **saltando i buchi**, e questo dà gratis le due cose che
 * mancavano al Computo vero, misurate il 2026-09-21:
 *
 *   - `ArrowDown` dall'ultima riga di un gruppo **entra nel gruppo dopo**,
 *     perché cerca la prossima casella non nulla nella stessa colonna;
 *   - il **piede si raggiunge** dalla colonna che le tre zone condividono
 *     (nel computo, la designazione), e da lì `ArrowRight` arriva al prezzo.
 *
 * Senza la matrice, il fondo di ogni gruppo è un vicolo cieco: è esattamente
 * ciò che succede oggi in Studio, dove il prezzo — la cella che determina
 * l'importo — si raggiunge solo attraversando col `Tab` tutto il resto.
 *
 * ── I comandi escono dall'ordine di `Tab` ───────────────────────────────
 *
 * Misurato sul Computo vero: fra una riga e l'altra, `Tab` si ferma sul
 * bottone **✕ «Rimuovi»**. Un gruppo da tre righe costa **24 fermate**, sei
 * delle quali comandi; a 144 voci sono ~4300 fermate e **576 passaggi sul
 * bottone che cancella**. Qui i comandi hanno `tabIndex={-1}` e si aprono con
 * **`Shift+F10`** o col tasto **Menu** — la scorciatoia di sistema per il menu
 * contestuale, non una convenzione inventata qui. `Tab` esce dal foglio in una
 * fermata sola, come da una griglia vera.
 *
 * ── Non controllato, come `data-grid` ───────────────────────────────────
 *
 * `useFoglioGruppi` tiene i gruppi in uno stato suo, seminato una volta da
 * `gruppiIniziali` e mai più risincronizzato: uno stato controllato
 * ricalcolerebbe il modello a ogni tasto. Si osserva `onModifica`.
 */

"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/registry/tassullo/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/tassullo/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/tassullo/ui/table"

/* ────────────────────────────────────────────────────────────────────────
 * Il modello
 * ──────────────────────────────────────────────────────────────────────── */

export type GruppoFoglio<TTestata, TRiga> = {
  id: string
  testata: TTestata
  righe: TRiga[]
}

/**
 * Le zone di un gruppo. `azioni` è la riga dei comandi frequenti — nel computo
 * il «+ misurazione» — ed è una **riga vera del foglio**, non una voce di menu:
 * rilievo di Francesco il 2026-09-21, «molto più veloce posizionato fuori dal
 * menù ⋯». Ci si arriva con le frecce come a qualunque altra riga e si attiva
 * con `Invio`, quindi resta veloce anche da tastiera **senza** entrare
 * nell'ordine di `Tab` — che è il difetto misurato sul Computo vero, dove per
 * cambiare riga si tabulava sul bottone che cancella.
 */
export type ZonaFoglio = "testata" | "corpo" | "azioni" | "piede"

export type CellaScrivibile<TDato> = {
  tipo: "scrivibile"
  /** Il valore grezzo, come stringa: il foglio non sa cosa sia un numero. */
  leggi: (dato: TDato) => string
  scrivi: (dato: TDato, valore: string) => TDato
  /** Formattazione per la sola vista; assente = si mostra il valore grezzo. */
  mostra?: (valore: string, dato: TDato) => React.ReactNode
  segnaposto?: string
  /** Messaggio d'errore, o `undefined` se il valore va bene. */
  valida?: (valore: string) => string | undefined
}

export type CellaCalcolata<TDato, TAltro = never> = {
  tipo: "calcolata"
  rendi: (dato: TDato, altro: TAltro) => React.ReactNode
}

export type CellaFissa = {
  tipo: "fissa"
  rendi: () => React.ReactNode
}

export type ColonnaFoglio<TTestata, TRiga> = {
  id: string
  titolo: string
  /** Classe di larghezza sul `<col>`; senza, la colonna assorbe lo spazio. */
  larghezza?: string
  allineamento?: "sinistra" | "destra"
  testata?: CellaScrivibile<TTestata> | CellaCalcolata<TTestata> | CellaFissa
  corpo?: CellaScrivibile<TRiga> | CellaCalcolata<TRiga> | CellaFissa
  piede?:
    | CellaScrivibile<TTestata>
    | CellaCalcolata<TTestata, TRiga[]>
    | CellaFissa
}

export type ComandoFoglio = {
  etichetta: string
  onSelect: () => void
  distruttivo?: boolean
  disabilitato?: boolean
}

/* ────────────────────────────────────────────────────────────────────────
 * Il motore
 * ──────────────────────────────────────────────────────────────────────── */

/** Dove sta il fuoco: gruppo, zona, riga dentro il corpo, colonna. */
export type PosizioneFoglio = {
  gruppo: number
  zona: ZonaFoglio
  riga: number
  colonna: number
}

const stessaPosizione = (a: PosizioneFoglio | null, b: PosizioneFoglio | null) =>
  a != null &&
  b != null &&
  a.gruppo === b.gruppo &&
  a.zona === b.zona &&
  a.riga === b.riga &&
  a.colonna === b.colonna

export type OpzioniFoglioGruppi<TTestata, TRiga> = {
  gruppiIniziali: GruppoFoglio<TTestata, TRiga>[]
  colonne: ColonnaFoglio<TTestata, TRiga>[]
  onModifica?: (gruppi: GruppoFoglio<TTestata, TRiga>[]) => void
  /** Il foglio rende la riga delle azioni fra corpo e piede (v. `ZonaFoglio`). */
  conRigaAzioni?: boolean
}

export type MotoreFoglioGruppi<TTestata, TRiga> = {
  gruppi: GruppoFoglio<TTestata, TRiga>[]
  colonne: ColonnaFoglio<TTestata, TRiga>[]
  posizione: PosizioneFoglio | null
  /**
   * La prima cella scrivibile del foglio. Serve al fuoco mobile: finché
   * `posizione` è `null` — cioè prima che si sia cliccato o tabulato — è
   * **questa** a portare `tabIndex={0}`, o `Tab` non avrebbe dove entrare e
   * il foglio sarebbe irraggiungibile da tastiera pura. Preso misurando in
   * Chromium vero: `[tabindex="0"]` valeva **0** e `Tab` scavalcava la
   * tabella intera, con le frecce perfettamente funzionanti dietro. È D15
   * in casa: axe non vede niente, perché non c'è niente di sbagliato da
   * vedere — c'è una porta che non si apre.
   */
  primaPosizione: PosizioneFoglio | null
  inModifica: PosizioneFoglio | null
  bozza: string
  errore: string | undefined
  aFuoco: (p: PosizioneFoglio) => boolean
  vaiA: (p: PosizioneFoglio) => void
  muovi: (dy: number, dx: number) => PosizioneFoglio | null
  apriModifica: (p?: PosizioneFoglio, valoreIniziale?: string) => void
  aggiornaBozza: (v: string) => void
  confermaModifica: () => boolean
  annullaModifica: () => void
  onKeyDownCella: (evento: React.KeyboardEvent, p: PosizioneFoglio) => void
  scriviGruppi: (g: GruppoFoglio<TTestata, TRiga>[]) => void
}

export function useFoglioGruppi<TTestata, TRiga>({
  gruppiIniziali,
  colonne,
  onModifica,
  conRigaAzioni = false,
}: OpzioniFoglioGruppi<TTestata, TRiga>): MotoreFoglioGruppi<TTestata, TRiga> {
  const [gruppi, setGruppi] = React.useState(gruppiIniziali)
  const [posizione, setPosizione] = React.useState<PosizioneFoglio | null>(null)
  const [inModifica, setInModifica] = React.useState<PosizioneFoglio | null>(null)
  const [bozza, setBozza] = React.useState("")

  const scriviGruppi = (nuovi: GruppoFoglio<TTestata, TRiga>[]) => {
    setGruppi(nuovi)
    onModifica?.(nuovi)
  }

  /**
   * **La matrice di celle visive.** È il cuore del blocco: una riga per ogni
   * riga resa, nell'ordine in cui si vede, e per ogni colonna o una posizione
   * o `null`. Le frecce si muovono qui dentro saltando i `null`, ed è ciò che
   * fa attraversare le zone e i gruppi senza che nessuno debba dichiararlo.
   */
  const matrice = React.useMemo(() => {
    const righe: (PosizioneFoglio | null)[][] = []
    gruppi.forEach((gruppo, gi) => {
      const fila = (zona: ZonaFoglio, riga: number) =>
        colonne.map((col, ci) => {
          const cella =
            zona === "testata" ? col.testata : zona === "corpo" ? col.corpo : col.piede
          // Solo le celle scrivibili prendono il fuoco: una cella calcolata o
          // fissa non ha niente da fare quando ci arrivi, e fermarcisi sopra
          // allunga il cammino senza dare niente in cambio.
          return cella?.tipo === "scrivibile"
            ? { gruppo: gi, zona, riga, colonna: ci }
            : null
        })
      righe.push(fila("testata", 0))
      gruppo.righe.forEach((_, ri) => righe.push(fila("corpo", ri)))
      if (conRigaAzioni) {
        // Una sola casella, nella prima colonna che nel corpo ha una cella:
        // è lì che l'occhio già scorre, ed è dove sta il «+ misurazione».
        const dove = colonne.findIndex((c) => c.corpo?.tipo === "scrivibile")
        righe.push(
          colonne.map((_, ci) =>
            ci === dove ? { gruppo: gi, zona: "azioni" as ZonaFoglio, riga: 0, colonna: ci } : null
          )
        )
      }
      righe.push(fila("piede", 0))
    })
    return righe
  }, [gruppi, colonne, conRigaAzioni])

  /** L'indice di riga visiva di una posizione — il contrario della matrice. */
  const indiceVisivo = React.useCallback(
    (p: PosizioneFoglio) => {
      let y = 0
      for (let gi = 0; gi < gruppi.length; gi++) {
        const corpo = gruppi[gi]!.righe.length
        if (gi === p.gruppo) {
          if (p.zona === "testata") return y
          if (p.zona === "corpo") return y + 1 + p.riga
          if (p.zona === "azioni") return y + 1 + corpo
          return y + 1 + corpo + (conRigaAzioni ? 1 : 0)
        }
        y += corpo + 2 + (conRigaAzioni ? 1 : 0)
      }
      return -1
    },
    [gruppi, conRigaAzioni]
  )

  const cellaScrivibile = (p: PosizioneFoglio) => {
    const col = colonne[p.colonna]
    if (!col) return undefined
    if (p.zona === "azioni") return undefined
    const cella = p.zona === "testata" ? col.testata : p.zona === "corpo" ? col.corpo : col.piede
    return cella?.tipo === "scrivibile" ? cella : undefined
  }

  const datoDi = (p: PosizioneFoglio) => {
    const gruppo = gruppi[p.gruppo]
    if (!gruppo) return undefined
    return p.zona === "corpo" ? gruppo.righe[p.riga] : gruppo.testata
  }

  const valoreDi = (p: PosizioneFoglio): string => {
    const cella = cellaScrivibile(p)
    const dato = datoDi(p)
    if (!cella || dato === undefined) return ""
    // `leggi` è tipizzata sul dato della propria zona; qui la posizione è già
    // stata verificata scrivibile, quindi il dato è quello giusto per costruzione.
    return (cella.leggi as (d: unknown) => string)(dato)
  }

  const primaPosizione = React.useMemo(() => {
    for (const fila of matrice) for (const cella of fila) if (cella) return cella
    return null
  }, [matrice])

  const errore = inModifica ? cellaScrivibile(inModifica)?.valida?.(bozza) : undefined

  const vaiA = (p: PosizioneFoglio) => {
    if (inModifica && !stessaPosizione(inModifica, p)) {
      // Spostarsi via da una modifica la conferma, come in un foglio vero.
      // Se non è valida si scarta: un clic altrove non deve poter restare
      // bloccato sulla cella che si sta lasciando.
      if (!confermaModifica()) annullaModifica()
    }
    setPosizione(p)
  }

  /**
   * Il movimento vero: cerca la prossima casella **non nulla** nella direzione
   * data. Verticale = stessa colonna, riga visiva successiva, attraverso zone e
   * gruppi. Orizzontale = stessa riga visiva, colonna successiva.
   */
  const muovi = (dy: number, dx: number): PosizioneFoglio | null => {
    if (!posizione) return null
    const y0 = indiceVisivo(posizione)
    if (y0 < 0) return null
    if (dy !== 0) {
      for (let y = y0 + dy; y >= 0 && y < matrice.length; y += dy) {
        const trovata = matrice[y]![posizione.colonna]
        if (trovata) {
          vaiA(trovata)
          return trovata
        }
      }
      return null
    }
    for (let x = posizione.colonna + dx; x >= 0 && x < colonne.length; x += dx) {
      const trovata = matrice[y0]![x]
      if (trovata) {
        vaiA(trovata)
        return trovata
      }
    }
    return null
  }

  const apriModifica = (p: PosizioneFoglio | undefined = posizione ?? undefined, valoreIniziale?: string) => {
    if (!p || !cellaScrivibile(p)) return
    setPosizione(p)
    setInModifica(p)
    setBozza(valoreIniziale ?? valoreDi(p))
  }

  const annullaModifica = () => setInModifica(null)

  const confermaModifica = (): boolean => {
    if (!inModifica) return true
    const cella = cellaScrivibile(inModifica)
    if (!cella) return true
    if (cella.valida?.(bozza)) return false
    const p = inModifica
    const nuovi = gruppi.map((gruppo, gi) => {
      if (gi !== p.gruppo) return gruppo
      if (p.zona === "corpo") {
        return {
          ...gruppo,
          righe: gruppo.righe.map((riga, ri) =>
            ri === p.riga ? (cella.scrivi as (d: unknown, v: string) => TRiga)(riga, bozza) : riga
          ),
        }
      }
      return {
        ...gruppo,
        testata: (cella.scrivi as (d: unknown, v: string) => TTestata)(gruppo.testata, bozza),
      }
    })
    scriviGruppi(nuovi)
    setInModifica(null)
    return true
  }

  const onKeyDownCella = (evento: React.KeyboardEvent, p: PosizioneFoglio) => {
    if (inModifica && stessaPosizione(inModifica, p)) {
      // `Escape` esce sempre, valido o no: è la via d'uscita che non deve mai
      // bloccarsi. `Invio`/`Tab` invece non si spostano su un valore invalido —
      // l'errore resta a schermo e si corregge senza aver perso il posto.
      if (evento.key === "Escape") {
        evento.preventDefault()
        annullaModifica()
        return
      }
      /**
       * **Chi si sposta mentre scrive arriva pronto a scrivere.** Uscire da
       * una modifica per doverne aprire un'altra a mano raddoppierebbe i gesti
       * proprio nel caso che conta — compilare una colonna di misure dall'alto
       * in basso — e il Computo di Studio non lo chiede: lì le celle sono
       * campi sempre attivi, quindi scendere **è** trovarsi nel campo sotto.
       * Si riapre solo se ci si stava già scrivendo: chi naviga a celle chiuse
       * resta a celle chiuse.
       */
      const spostaERiapri = (dy: number, dx: number) => {
        if (!confermaModifica()) return
        const arrivo = muovi(dy, dx)
        if (arrivo) apriModifica(arrivo)
      }
      if (evento.key === "Enter") {
        evento.preventDefault()
        spostaERiapri(1, 0)
        return
      }
      if (evento.key === "Tab") {
        evento.preventDefault()
        spostaERiapri(0, evento.shiftKey ? -1 : 1)
        return
      }
      /**
       * **Le frecce navigano anche mentre si scrive**, ed è obbligatorio: da
       * quando un clic solo apre la modifica, su una cella **si è quasi sempre
       * dentro un campo di testo** — e lì una freccia muoverebbe il cursore
       * invece del fuoco.
       *
       * Verticali sempre: in un campo a riga sola `↑`/`↓` non hanno niente da
       * fare.
       *
       * **Orizzontali quando il cursore è già al bordo.** La prima stesura le
       * riservava al testo e mandava a `Tab` chi voleva spostarsi di lato:
       * *«riesco a spostarmi solo con le frecce su/giù e non destra/sinistra»*,
       * e aveva ragione — in un computo i valori sono numeri corti, si
       * riscrivono invece di correggerli a metà, quindi la freccia che «serve
       * al testo» serve al testo quasi mai. Con la condizione sul bordo non si
       * perde niente: dentro una parola `←`/`→` muovono il cursore, arrivati
       * in fondo passano alla cella accanto. È come si comporta un campo in
       * una griglia, e non richiede di sapere una scorciatoia in più.
       */
      if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
        evento.preventDefault()
        spostaERiapri(evento.key === "ArrowDown" ? 1 : -1, 0)
        return
      }
      if (evento.key === "ArrowLeft" || evento.key === "ArrowRight") {
        const campo = evento.currentTarget as HTMLInputElement
        const inizio = campo.selectionStart ?? 0
        const fine = campo.selectionEnd ?? 0
        const tuttoSelezionato = inizio === 0 && fine === campo.value.length
        const alBordo =
          evento.key === "ArrowLeft"
            ? inizio === 0 && fine === 0
            : inizio === campo.value.length && fine === campo.value.length
        // Un campo appena aperto ha il testo tutto selezionato: lì la freccia
        // deve spostarsi, non collassare la selezione su un capo — o il primo
        // `→` dopo un clic non farebbe niente di visibile.
        if (alBordo || tuttoSelezionato) {
          evento.preventDefault()
          spostaERiapri(0, evento.key === "ArrowRight" ? 1 : -1)
        }
        return
      }
      return
    }

    switch (evento.key) {
      case "ArrowDown":
        evento.preventDefault()
        muovi(1, 0)
        return
      case "ArrowUp":
        evento.preventDefault()
        muovi(-1, 0)
        return
      case "ArrowRight":
        evento.preventDefault()
        muovi(0, 1)
        return
      case "ArrowLeft":
        evento.preventDefault()
        muovi(0, -1)
        return
      case "Enter":
      case "F2":
        evento.preventDefault()
        apriModifica(p)
        return
      case "Escape":
        return
    }
    // Un carattere stampabile apre la modifica scrivendolo, come in un foglio
    // di calcolo: non serve prima "entrare" nella cella con Invio.
    if (!evento.metaKey && !evento.ctrlKey && !evento.altKey && evento.key.length === 1) {
      evento.preventDefault()
      apriModifica(p, evento.key)
    }
  }

  return {
    gruppi,
    colonne,
    posizione,
    primaPosizione,
    inModifica,
    bozza,
    errore,
    aFuoco: (p) => stessaPosizione(posizione, p),
    vaiA,
    muovi,
    apriModifica,
    aggiornaBozza: setBozza,
    confermaModifica,
    annullaModifica,
    onKeyDownCella,
    scriviGruppi,
  }
}

/* ────────────────────────────────────────────────────────────────────────
 * La resa
 * ──────────────────────────────────────────────────────────────────────── */

const classiAllineamento = (col: { allineamento?: "sinistra" | "destra" }) =>
  col.allineamento === "destra" ? "text-right tabular-nums" : "text-left"

/**
 * L'altezza di **una riga**, uguale per le celle e per il bottone della riga
 * azioni. Senza, il «+ misurazione» è più basso delle misure — il bottone è
 * `text-sm`, le celle no — e il passo del foglio si spezza proprio dove
 * l'occhio scende (rilievo di Francesco, 2026-09-22). Sta su `--spacing`,
 * quindi segue la densità: **32px** in normale, **48** in touch.
 */
const RIGA = "flex min-h-8 items-center"

/*
 * ── Perché non c'è un ancoraggio delle colonne ──────────────────────────
 *
 * C'era: `ancorata` metteva `sticky right-0 bg-background` sulle colonne del
 * risultato, perché nel Computo di Studio a 951px finivano fuori campo. È
 * stata **tolta**, per due misure che insieme non lasciano scampo.
 *
 * **Non era mai esercitata**: misurato da 1440 a 600px, questo foglio non
 * scorre **mai** — `table-fixed` comprime la colonna elastica invece di
 * spingere le altre fuori — quindi non c'è nessuno scorrimento da cui
 * ancorarsi.
 *
 * **E faceva un danno vero**: `bg-background` è il fondo della **pagina**, e
 * la superficie può essere `card` o `sidebar` (la style guide le commuta su
 * `body[data-superficie]`, e il tema le definisce come `--card`/`--sidebar`).
 * Su due superfici su tre le tre colonne del risultato restavano di un fondo
 * diverso da tutto il resto — rilievo di Francesco a video, in modalità Card.
 * Un fondo opaco **serve** a una colonna ancorata, o si legge il contenuto che
 * le scorre sotto: il difetto non era la classe sbagliata, era che
 * l'ancoraggio ha bisogno di sapere su che superficie poggia, e una classe
 * fissa non può saperlo.
 *
 * Se un giorno il foglio dovrà scorrere davvero, la via è `bg-inherit` sulla
 * cella — che prende il fondo della riga qualunque sia la superficie — e va
 * **misurata su tutte e tre**, non dedotta.
 */

function CellaFoglio<TTestata, TRiga>({
  motore,
  posizione,
  colonna,
  dato,
  extra,
  etichettaColonna,
}: {
  motore: MotoreFoglioGruppi<TTestata, TRiga>
  posizione: PosizioneFoglio
  colonna: ColonnaFoglio<TTestata, TRiga>
  dato: TTestata | TRiga
  extra?: TRiga[]
  etichettaColonna: string
}) {
  const zona = posizione.zona
  const cella = zona === "testata" ? colonna.testata : zona === "corpo" ? colonna.corpo : colonna.piede
  const riferimento = React.useRef<HTMLDivElement>(null)
  const aFuoco = motore.aFuoco(posizione)
  const inModifica = stessaPosizione(motore.inModifica, posizione)
  // La porta d'ingresso: prima che il fuoco sia da qualche parte, è la prima
  // cella a essere tabbabile. Dopo, il fuoco mobile fa il resto.
  const tabbabile =
    aFuoco || (motore.posizione === null && stessaPosizione(motore.primaPosizione, posizione))

  React.useEffect(() => {
    // Solo quando il fuoco è **già** su questa cella per volontà di qualcuno:
    // non al montaggio sulla prima, o il foglio se lo prenderebbe da sé
    // appena la pagina apre.
    if (aFuoco && !inModifica) riferimento.current?.focus()
  }, [aFuoco, inModifica])

  if (!cella) return <TableCell />

  if (cella.tipo === "fissa") {
    return (
      <TableCell className={cn("truncate", classiAllineamento(colonna))}>
        {cella.rendi()}
      </TableCell>
    )
  }

  if (cella.tipo === "calcolata") {
    return (
      <TableCell className={cn("truncate", classiAllineamento(colonna))}>
        {(cella.rendi as (d: unknown, a: unknown) => React.ReactNode)(dato, extra)}
      </TableCell>
    )
  }

  const valore = (cella.leggi as (d: unknown) => string)(dato)

  if (inModifica) {
    const errore = motore.errore
    return (
      <TableCell className="p-0">
        <input
          autoFocus
          className={cn(
            "w-full bg-transparent px-2 py-1 outline-none ring-2 ring-ring ring-inset",
            colonna.allineamento === "destra" && "text-right tabular-nums",
            errore && "ring-destructive"
          )}
          value={motore.bozza}
          aria-label={etichettaColonna}
          aria-invalid={errore ? true : undefined}
          aria-describedby={errore ? `errore-${colonna.id}` : undefined}
          onChange={(e) => motore.aggiornaBozza(e.target.value)}
          onKeyDown={(e) => motore.onKeyDownCella(e, posizione)}
          onBlur={() => {
            if (!motore.confermaModifica()) motore.annullaModifica()
          }}
        />
        {errore ? (
          <span id={`errore-${colonna.id}`} className="sr-only">
            {errore}
          </span>
        ) : null}
      </TableCell>
    )
  }

  return (
    <TableCell className="p-0">
      <div
        ref={riferimento}
        // Fuoco mobile (roving tabindex): una sola cella tabbabile per volta,
        // così `Tab` esce dal foglio in una fermata invece di attraversarlo.
        tabIndex={tabbabile ? 0 : -1}
        role="button"
        aria-label={`${etichettaColonna}: ${valore || "vuoto"}`}
        className={cn(
          // `truncate` è il prezzo di `table-fixed`, la stessa scelta già presa
          // in `data-table`: con le larghezze decise dalle colonne, un testo
          // più lungo **sborda nella colonna accanto** invece di allargarla.
          // Misurato qui: a 880px sbordano 8 celle, a 700px dodici — e ciò che
          // sborda è la designazione, cioè la colonna elastica. Meglio i
          // puntini: il testo intero resta leggibile aprendo la modifica.
          "cursor-text truncate px-2 py-1 outline-none",
          RIGA,
          colonna.allineamento === "destra" && "justify-end",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          classiAllineamento(colonna),
          !valore && "text-muted-foreground"
        )}
        onFocus={() => motore.vaiA(posizione)}
        // **Un clic solo apre**, non due: rilievo di Francesco il 2026-09-21,
        // «in studio basta cliccare sulla cella per entrare nella modalità
        // modifica, qua serve doppio click, troppo lento». Nel Computo vero le
        // celle *sono* campi di testo sempre attivi, quindi cliccare **è**
        // modificare: un foglio che chiede due gesti per la stessa cosa è più
        // lento di quello che sostituisce, e non c'è niente da guadagnarci —
        // le frecce restano la via per attraversare senza toccare i valori.
        onClick={() => motore.apriModifica(posizione)}
        onKeyDown={(e) => motore.onKeyDownCella(e, posizione)}
      >
        {cella.mostra
          ? (cella.mostra as (v: string, d: unknown) => React.ReactNode)(valore, dato)
          : valore || cella.segnaposto || " "}
      </div>
    </TableCell>
  )
}

/**
 * Il menu dei comandi di un gruppo. `tabIndex={-1}` sul grilletto: non entra
 * nell'ordine di `Tab`, e si apre con `Shift+F10` o col tasto Menu dalla cella
 * a fuoco (v. `FoglioGruppi`). È la correzione del difetto misurato sul
 * Computo vero, dove `Tab` si fermava su «Rimuovi» fra una riga e l'altra.
 */
function ComandiGruppo({
  comandi,
  etichetta,
  apertoRef,
}: {
  comandi: ComandoFoglio[]
  etichetta: string
  apertoRef?: React.RefObject<(() => void) | null>
}) {
  const [aperto, setAperto] = React.useState(false)
  React.useEffect(() => {
    if (apertoRef) apertoRef.current = () => setAperto(true)
    return () => {
      if (apertoRef) apertoRef.current = null
    }
  }, [apertoRef])

  return (
    <DropdownMenu open={aperto} onOpenChange={setAperto}>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            tabIndex={-1}
            aria-label={etichetta}
            className="size-6"
          >
            <span aria-hidden>⋯</span>
          </Button>
        }
      />
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          {comandi.map((comando, i) =>
            comando.etichetta === "-" ? (
              <DropdownMenuSeparator key={`sep-${i}`} />
            ) : (
              <DropdownMenuItem
                key={comando.etichetta}
                disabled={comando.disabilitato}
                variant={comando.distruttivo ? "destructive" : undefined}
                onClick={comando.onSelect}
              >
                {comando.etichetta}
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export type FoglioGruppiProps<TTestata, TRiga> = {
  motore: MotoreFoglioGruppi<TTestata, TRiga>
  /** I comandi di un gruppo: menu con `tabIndex={-1}`, aperto da `Shift+F10`. */
  comandi?: (gruppo: GruppoFoglio<TTestata, TRiga>, indice: number) => ComandoFoglio[]
  /**
   * L'azione **frequente** del gruppo, su una riga propria fra corpo e piede —
   * nel computo il «+ misurazione». Non sta nel menu: un'azione che si ripete
   * per ogni riga non va nascosta dietro due gesti. Il motore va costruito con
   * `conRigaAzioni: true`, o la riga si rende e le frecce non la trovano.
   *
   * **Una sola, e il tipo lo impone.** La prima stesura ne accettava un
   * elenco, dentro un contenitore focalizzabile: `role="button"` su un `<div>`
   * che contiene dei `<button>` è **`nested-interactive`**, e il gate l'ha
   * preso — 4 violazioni per passata, 16 in tutto. La correzione non è stata
   * cambiare il ruolo ma il **numero**: il bottone stesso è la cella, così non
   * c'è niente da annidare. Ed è anche la forma giusta — una riga di azioni
   * con cinque collegamenti è un menu travestito, e il menu c'è già.
   */
  azione?: (gruppo: GruppoFoglio<TTestata, TRiga>, indice: number) => ComandoFoglio
  /** La riga in coda al foglio: il totale generale. */
  piede?: (gruppi: GruppoFoglio<TTestata, TRiga>[]) => React.ReactNode
  /** Descrizione della tabella per chi non vede — obbligatoria come un `alt`. */
  didascalia: string
  className?: string
}

export function FoglioGruppi<TTestata, TRiga>({
  motore,
  comandi,
  azione,
  piede,
  didascalia,
  className,
}: FoglioGruppiProps<TTestata, TRiga>) {
  const { gruppi, colonne, posizione } = motore
  const apreComandi = React.useRef<(() => void) | null>(null)

  // `Shift+F10` e il tasto Menu aprono i comandi del gruppo a fuoco: è la
  // scorciatoia di sistema per il menu contestuale, la stessa che il browser
  // usa da sé su un elemento qualsiasi. Sta qui e non sulla cella perché il
  // bersaglio è il **gruppo**, non la casella.
  const onKeyDown = (evento: React.KeyboardEvent) => {
    if (evento.key === "ContextMenu" || (evento.shiftKey && evento.key === "F10")) {
      if (!posizione) return
      evento.preventDefault()
      apreComandi.current?.()
    }
  }

  return (
    <div className={cn("overflow-x-auto", className)} onKeyDown={onKeyDown}>
      <Table
        // `role="grid"` è ciò che dice a un lettore di schermo che qui le
        // frecce navigano: senza, la tabella è un documento e la tastiera che
        // abbiamo costruito non viene annunciata.
        role="grid"
        aria-label={didascalia}
        aria-rowcount={gruppi.reduce((n, g) => n + g.righe.length + 2, 0)}
        aria-colcount={colonne.length}
        // Le linee verticali e il bordo esterno: un foglio di computo si legge
        // **per colonne** — la lunghezza sotto la lunghezza, l'importo sotto
        // l'importo — e senza i separatori l'occhio perde la colonna a metà
        // riga. Rilievo di Francesco il 2026-09-21, e la stessa ragione per cui
        // ogni foglio di calcolo li ha: qui non sono una prop, sono la forma
        // del blocco.
        // `min-w-240` è la soglia sotto la quale il foglio **scorre** invece di
        // comprimersi. Senza, `table-fixed` stringe la colonna elastica fino a
        // zero e oltre: a finestra stretta «Designazione dei lavori» e
        // «Par.ug.» finivano **scritte una sopra l'altra** e la designazione si
        // riduceva a «RAS…». Una tabella che si comprime senza limite non
        // degrada, si rompe; il contenitore ha `overflow-x-auto` apposta.
        //
        // **Sulla scala `--spacing`, non su quella dei contenitori**, ed è una
        // correzione: la prima stesura usava `min-w-4xl`, cioè **896px fissi**.
        // Ma le colonne sono dichiarate in unità di `--spacing` (`w-20`, `w-28`,
        // `w-32`), e in densità touch quella costante passa da 4px a 6: le
        // colonne numeriche crescono del 50% mentre il minimo resta fermo, e
        // la colonna elastica — l'unica che può cedere — viene schiacciata a
        // zero. Misurato in touch: i titoli delle voci ridotti a una lettera e
        // le descrizioni delle misure **sparite**. Il minimo di una tabella le
        // cui colonne scalano deve scalare con loro: 240 gradini sono 960px in
        // normale e 1440 in touch.
        className="table-fixed min-w-240 border border-border [&_td]:border-e [&_td]:border-border [&_th]:border-e [&_th]:border-border [&_td:last-child]:border-e-0 [&_th:last-child]:border-e-0"
      >
        <colgroup>
          {colonne.map((col) => (
            <col key={col.id} className={col.larghezza} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            {colonne.map((col) => (
              <TableHead key={col.id} className={cn("truncate", classiAllineamento(col))}>
                {col.titolo}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {gruppi.map((gruppo, gi) => {
          const comandiGruppo = comandi?.(gruppo, gi) ?? []
          const aFuocoQui = posizione?.gruppo === gi
          return (
            <TableBody key={gruppo.id} className="border-b-2">
              {/* Testata del gruppo */}
              <TableRow className="bg-muted/40">
                {colonne.map((col, ci) => {
                  const posizioneCella: PosizioneFoglio = {
                    gruppo: gi,
                    zona: "testata",
                    riga: 0,
                    colonna: ci,
                  }
                  if (ci === 0 && comandiGruppo.length > 0) {
                    return (
                      <TableCell key={col.id}>
                        <ComandiGruppo
                          comandi={comandiGruppo}
                          etichetta={`Azioni del gruppo ${gi + 1}`}
                          apertoRef={aFuocoQui ? apreComandi : undefined}
                        />
                      </TableCell>
                    )
                  }
                  return (
                    <CellaFoglio
                      key={col.id}
                      motore={motore}
                      posizione={posizioneCella}
                      colonna={col}
                      dato={gruppo.testata}
                      etichettaColonna={col.titolo}
                    />
                  )
                })}
              </TableRow>

              {/* Corpo: le righe omogenee */}
              {gruppo.righe.map((riga, ri) => (
                <TableRow key={`${gruppo.id}-${ri}`}>
                  {colonne.map((col, ci) => (
                    <CellaFoglio
                      key={col.id}
                      motore={motore}
                      posizione={{ gruppo: gi, zona: "corpo", riga: ri, colonna: ci }}
                      colonna={col}
                      dato={riga}
                      etichettaColonna={col.titolo}
                    />
                  ))}
                </TableRow>
              ))}

              {/* L'azione frequente: una riga vera, raggiunta dalle frecce.
                  Il bottone **è** la cella — niente contenitore con un ruolo
                  proprio, o sarebbe `nested-interactive`. */}
              {azione ? (
                <TableRow>
                  {colonne.map((col, ci) => {
                    const dove = colonne.findIndex((c) => c.corpo?.tipo === "scrivibile")
                    if (ci !== dove) return <TableCell key={col.id} />
                    const posizioneAzione: PosizioneFoglio = {
                      gruppo: gi,
                      zona: "azioni",
                      riga: 0,
                      colonna: ci,
                    }
                    const aFuocoAzione = motore.aFuoco(posizioneAzione)
                    const comando = azione(gruppo, gi)
                    return (
                      <TableCell key={col.id} className="p-0">
                        <button
                          type="button"
                          ref={(nodo) => {
                            if (aFuocoAzione) nodo?.focus()
                          }}
                          tabIndex={aFuocoAzione ? 0 : -1}
                          disabled={comando.disabilitato}
                          className={cn(
                            RIGA,
                            "px-2 py-1 text-sm text-accent-ink underline-offset-4 outline-none",
                            "hover:underline",
                            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                          )}
                          onFocus={() => motore.vaiA(posizioneAzione)}
                          onClick={comando.onSelect}
                          onKeyDown={(e) => {
                            // Invio e Spazio li gestisce il bottone da sé: qui
                            // passano solo le frecce, o si intercetterebbe
                            // l'attivazione nativa del controllo.
                            if (e.key === "Enter" || e.key === " ") return
                            motore.onKeyDownCella(e, posizioneAzione)
                          }}
                        >
                          {comando.etichetta}
                        </button>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ) : null}

              {/* Piede del gruppo */}
              <TableRow className="border-t font-medium">
                {colonne.map((col, ci) => (
                  <CellaFoglio
                    key={col.id}
                    motore={motore}
                    posizione={{ gruppo: gi, zona: "piede", riga: 0, colonna: ci }}
                    colonna={col}
                    dato={gruppo.testata}
                    extra={gruppo.righe}
                    etichettaColonna={col.titolo}
                  />
                ))}
              </TableRow>
            </TableBody>
          )
        })}

        {piede ? (
          <TableFooter>
            <TableRow>{piede(gruppi)}</TableRow>
          </TableFooter>
        ) : null}
      </Table>
    </div>
  )
}
