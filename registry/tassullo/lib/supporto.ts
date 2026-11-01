/**
 * `supporto` — i tipi del canale di supporto e il modo di dirne tipo e stato,
 * uguali in tutte le app (proposta #165, passo #165c).
 *
 * Ricavato da `frontend/src/lib/supporto.ts` di Anagrafe al commit
 * `589247a5`. I valori (`errore`, `richiesta`, `domanda`; `ricevuta`,
 * `aperta`, `in_lavorazione`, `chiusa`) e i nomi dei campi sono quelli del
 * contratto del server descritto in `docs/SUPPORTO.md` di Anagrafe, a cui le
 * altre app rimandano: si tengono così, perché un'app li riceve dal suo
 * server e non li deve tradurre. Il tipo «Proposta» ha per valore
 * `richiesta`, come lì.
 *
 * Nel tipo `Richiesta` stanno i soli campi che le pagine modello leggono.
 * Un'app che ne riceve altri estende il tipo nel suo codice:
 * `interface RichiestaApp extends Richiesta`.
 *
 * Proposta #171, passo #171b: `RichiestaAmministratore` e
 * `StatoCollegamento` per la pagina d'esempio dell'amministratore, dai tipi
 * propri di Anagrafe (`frontend/src/lib/supportoAnagrafe.ts` al commit
 * `5222bec8`) e dal contratto di `GET /api/supporto/stato`.
 */
import {
  BugIcon,
  CircleQuestionMarkIcon,
  LightbulbIcon,
  type LucideIcon,
} from "lucide-react"

import type { Tono } from "@/registry/tassullo/lib/toni"

/** Di cosa si tratta: un errore, una proposta (`richiesta`) o una domanda. */
export type TipoRichiesta = "errore" | "richiesta" | "domanda"

/** Lo stato di una richiesta. Lo decide il server; l'interfaccia lo mostra. */
export type StatoRichiesta = "ricevuta" | "aperta" | "in_lavorazione" | "chiusa"

/** I caratteri del titolo, al più. */
export const TITOLO_MASSIMO = 140
/** I caratteri della descrizione, al più. */
export const DESCRIZIONE_MASSIMA = 10000
/** Gli screenshot di una richiesta, al più. */
export const SCREENSHOT_MASSIMI = 5
/** La dimensione di uno screenshot, al più: 10 MB. */
export const SCREENSHOT_DIMENSIONE_MASSIMA = 10 * 1024 * 1024
/** I formati di uno screenshot, nella forma di `accetta` di `file-upload`. */
export const SCREENSHOT_FORMATI = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
}

/**
 * Il nome e il tono di ogni stato. `ricevuta` è neutro: la richiesta è
 * registrata ma non è ancora arrivata a chi la gestisce. `destructive` non è
 * di nessuno stato.
 *
 * ```tsx
 * const s = STATO_RICHIESTA[richiesta.stato]
 * <Badge className={TONO[s.tono]}>{s.testo}</Badge>
 * ```
 */
export const STATO_RICHIESTA: Record<StatoRichiesta, { testo: string; tono: Tono }> = {
  ricevuta: { testo: "Ricevuta", tono: "neutro" },
  aperta: { testo: "Aperta", tono: "info" },
  in_lavorazione: { testo: "In lavorazione", tono: "warning" },
  chiusa: { testo: "Chiusa", tono: "success" },
}

/** Il nome, la frase che lo spiega e l'icona di ogni tipo. */
export const TIPO_RICHIESTA: Record<
  TipoRichiesta,
  { testo: string; descrizione: string; icona: LucideIcon }
> = {
  errore: { testo: "Errore", descrizione: "Qualcosa non funziona", icona: BugIcon },
  richiesta: { testo: "Proposta", descrizione: "Vorrei che…", icona: LightbulbIcon },
  domanda: { testo: "Domanda", descrizione: "Ho una domanda", icona: CircleQuestionMarkIcon },
}

/** L'ordine in cui i tipi si scelgono nel dialogo. */
export const TIPI_RICHIESTA: TipoRichiesta[] = ["errore", "richiesta", "domanda"]

/** Ciò che il dialogo «Apri una richiesta» consegna all'app. */
export type DatiRichiesta = {
  tipo: TipoRichiesta
  /** Già pulito: senza spazi in testa e in coda, gli spazi ripetuti ridotti a uno. */
  titolo: string
  /** Senza spazi in testa e in coda; gli a capo restano. */
  descrizione: string
  screenshot: File[]
}

/** Una risposta a una richiesta. */
export interface Risposta {
  id: number | string
  /** Chi ha risposto. */
  autore: string
  testo: string
  /** Data e ora ISO, col fuso. */
  creato_il: string
  aggiornato_il?: string | null
}

/** Una riga dell'elenco delle richieste. */
export interface Richiesta {
  id: number | string
  tipo: TipoRichiesta
  titolo: string
  descrizione: string
  stato: StatoRichiesta
  /** Data e ora ISO, col fuso. */
  creato_il: string
  /** Chi l'ha scritta: lo mostra l'elenco dell'amministratore. */
  utente_email?: string
  utente_nome?: string | null
  n_risposte: number
  /** Le risposte che chi ha scritto la richiesta non ha ancora letto. */
  non_lette: number
  n_screenshot?: number
}

/**
 * Una riga dell'elenco dell'amministratore: la richiesta, la sua issue su
 * GitHub e i tentativi d'invio.
 */
export interface RichiestaAmministratore extends Richiesta {
  /** Il numero della issue su GitHub; assente finché la richiesta non è partita. */
  github_numero?: number | null
  github_url?: string | null
  github_assegnatario?: string | null
  /** Quante volte l'app ha provato a mandarla a GitHub. */
  invio_tentativi?: number
  invio_ultimo_il?: string | null
  /** L'errore dell'ultimo tentativo non riuscito, così come lo dà il server. */
  invio_ultimo_errore?: string | null
}

/** Una richiesta ancora «ricevuta» con un errore d'invio scritto: non è partita. */
export function invioFallito(richiesta: RichiestaAmministratore) {
  return richiesta.stato === "ricevuta" && Boolean(richiesta.invio_ultimo_errore)
}

/** Il collegamento con GitHub, visto dall'amministratore. */
export interface StatoCollegamento {
  /** Se il token è impostato in questo ambiente. */
  configurato: boolean
  /** Il repository dove arrivano le richieste, `proprietario/nome`. */
  repo: string
  token: {
    stato: "valida" | "in_scadenza" | "scaduta" | "non_dichiarata"
    /** La data di scadenza, `AAAA-MM-GG`. */
    scadenza: string | null
    /** I giorni che mancano alla scadenza. */
    giorni: number | null
    nota?: string
  }
  /** Da quanti giorni prima della scadenza il token è «in scadenza». */
  preavviso_giorni?: number
  /** Le richieste salvate e non ancora arrivate a GitHub. */
  non_inviate: number
  ultima_sincronizzazione: string | null
}

/** Le variabili d'ambiente del collegamento con GitHub, come le nominano gli avvisi. */
export const VARIABILI_COLLEGAMENTO = {
  token: "GITHUB_SUPPORTO_TOKEN",
  scadenza: "GITHUB_SUPPORTO_TOKEN_SCADENZA",
}

/** Una chiamata all'API non riuscita poco prima dell'invio. */
export interface ErroreRegistrato {
  quando: string | null
  metodo: string | null
  percorso: string | null
  /** Il codice HTTP; 0 vuol dire che il server non ha risposto. */
  stato: number | null
  dettaglio: string | null
}

/**
 * Il contesto tecnico che l'app allega alla richiesta: lo legge solo
 * l'amministratore, chi scrive la richiesta non lo vede.
 */
export interface DettagliTecnici {
  pagina?: string | null
  versione_frontend?: string | null
  versione_backend?: string | null
  browser?: {
    userAgent: string | null
    viewport: string | null
    densita: string | null
    scuro: boolean | null
    lingua: string | null
  } | null
  errori_api?: ErroreRegistrato[]
}

/** La scheda di una richiesta: la riga, le risposte, gli screenshot e, per l'amministratore, i dettagli tecnici. */
export interface RichiestaScheda extends Richiesta, DettagliTecnici {
  risposte: Risposta[]
  /** Gli screenshot nell'ordine in cui sono stati allegati. */
  screenshot: { id: number | string; nome?: string | null }[]
  /** Gli screenshot tolti dopo la chiusura: la scheda dice che c'erano. */
  screenshot_tolti?: number
}

const DATA_ORA = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Rome",
})

/**
 * Data e ora di una richiesta o di una risposta, `gg/mm/aaaa, hh:mm` nell'ora
 * italiana: la stessa forma del filo dei messaggi. Un valore che non è una
 * data dà la stringa vuota.
 */
export function formattaDataOra(valore: string | Date | null | undefined) {
  if (!valore) return ""
  const data = valore instanceof Date ? valore : new Date(valore)
  return Number.isNaN(data.getTime()) ? "" : DATA_ORA.format(data)
}

const DATA = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Rome",
})

/**
 * La sola data, `gg/mm/aaaa`: la scadenza del token. Una data senza ora,
 * `AAAA-MM-GG`, si legge come quel giorno, non come la mezzanotte UTC. Un
 * valore che non è una data dà la stringa vuota.
 */
export function formattaData(valore: string | Date | null | undefined) {
  if (!valore) return ""
  const data =
    valore instanceof Date
      ? valore
      : new Date(/^\d{4}-\d{2}-\d{2}$/.test(valore) ? `${valore}T12:00:00` : valore)
  return Number.isNaN(data.getTime()) ? "" : DATA.format(data)
}
