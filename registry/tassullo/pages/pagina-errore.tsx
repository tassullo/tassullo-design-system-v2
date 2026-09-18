/**
 * `tassullo-pagina-errore` — gli stati di sistema, ultima pagina modello
 * della FASE 4 (M4.6): **404**, **accesso negato**, **errore del server**,
 * **manutenzione**.
 *
 * ── Gradino 1: la primitiva basta ──────────────────────────────────────────
 *
 * Le quattro varianti sono la stessa composizione di `tassullo-empty-state` e
 * `tassullo-error-state` — `Empty`/`EmptyHeader`/`EmptyMedia`/`EmptyTitle`/
 * `EmptyDescription`/`EmptyContent` — non uno di quei due blocchi: nessuno dei
 * due porta un tono **per variante** (`error-state` è sempre `destructive`,
 * `empty-state` è sempre neutro), e qui ogni stato ha il suo — `warning` per
 * l'accesso negato, `destructive` per l'errore del server, `info` per la
 * manutenzione, nessun tono per il 404, che non è un fatto grave, è solo un
 * indirizzo sbagliato. Il tono viene da `lib/toni` (`TONO`), non da un hex.
 *
 * ── Dentro o fuori dal guscio: la risposta è nella variante, non fissa ─────
 *
 * Un 404 su una rotta dell'app ha la navigazione attorno — l'utente ha
 * sbagliato un link interno, non l'app intera. Un errore del server o una
 * manutenzione, invece, capitano spesso **prima** che il guscio abbia dati
 * per popolarsi (la sessione, il menu utente, i permessi): mostrarli dentro
 * `AppShell` vorrebbe dire mostrare una barra vuota o rotta. Da qui la coppia
 * di default in `SCHERMO_INTERO_DI_DEFAULT`:
 *
 *   - **404** e **accesso-negato**: `schermoIntero=false` di default — si
 *     montano dentro il contenuto esistente (lo stesso posto in cui
 *     `tassullo-pagina-lista` monta `ErrorState`), la navigazione resta.
 *   - **errore-server** e **manutenzione**: `schermoIntero=true` di default —
 *     stessa composizione di `tassullo-pagina-login` (marchio in testa,
 *     sfondo pieno, nessun guscio), perché non c'è nulla attorno da mostrare.
 *
 * `schermoIntero` resta una prop esplicita, non dedotta in silenzio: un caso
 * limite (una manutenzione annunciata *dentro* l'app già aperta, un 404
 * mostrato prima del login) la sovrascrive senza dover reimplementare la
 * pagina.
 *
 * ── «Accesso negato» dice la verità su Anagrafe, non la nasconde ──────────
 *
 * In Anagrafe l'utente senza ruoli **non è bloccato**: è in sola lettura,
 * esattamente come `tassullo-pagina-admin` già rende con `soloLettura` — la
 * tabella resta montata, perde solo `menuRiga`. Questa variante non è quel
 * caso (lì non c'è nessun "vicolo cieco", quindi non serve una pagina
 * d'errore): serve per una rotta che **non ha proprio nulla da mostrare**
 * senza un ruolo preciso (un report riservato, non l'amministrazione intera).
 * Il messaggio di default lo dice esplicitamente — non "non hai i permessi"
 * e basta, ma la stessa informazione onesta del banner di `PaginaAdmin`: le
 * sezioni che non richiedono un ruolo restano visibili altrove.
 *
 * ── L'azione di ritorno è un nodo, non una callback ────────────────────────
 *
 * Stessa scelta di `EmptyState.azione` (non `ErrorState.onRiprova`, che vale
 * solo per il "riprova" testuale): qui l'azione cambia natura da variante a
 * variante — un link di navigazione («Torna alla home»), un bottone che
 * ritenta una richiesta, un `mailto:` verso l'assistenza — e il blocco non sa
 * quale sia, né se serva un router. `azione` resta `undefined` di default: un
 * blocco che ne forzasse una fissa («Home») la sbaglierebbe per metà dei
 * consumatori che non hanno quella rotta. Nessuna variante nasconde però la
 * prop: usarla è la raccomandazione del `PIANO.md`, non un obbligo imposto qui.
 */
import type { ComponentType, ReactNode } from "react"
import {
  ConstructionIcon,
  OctagonXIcon,
  SearchXIcon,
  ShieldAlertIcon,
} from "lucide-react"

import { cn } from "cn"
import { TONO, type Tono } from "@/registry/tassullo/lib/toni"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/tassullo/ui/empty"

export type VarianteErrore = "404" | "accesso-negato" | "errore-server" | "manutenzione"

type Icona = ComponentType<{ className?: string }>

type DatiVariante = {
  icona: Icona
  titolo: string
  messaggio: string
  /** `undefined`: nessun tono, il 404 non è un fatto grave. */
  tono?: Tono
}

const DATI_VARIANTE: Record<VarianteErrore, DatiVariante> = {
  "404": {
    icona: SearchXIcon,
    titolo: "Pagina non trovata",
    messaggio: "L'indirizzo digitato non corrisponde a nessuna pagina esistente.",
  },
  "accesso-negato": {
    icona: ShieldAlertIcon,
    titolo: "Accesso negato",
    messaggio:
      "Non hai il ruolo per aprire questa pagina. Le sezioni che non richiedono un ruolo specifico restano visibili in sola lettura.",
    tono: "warning",
  },
  "errore-server": {
    icona: OctagonXIcon,
    titolo: "Errore del server",
    messaggio:
      "Il server non ha risposto correttamente. Se il problema continua, contatta l'assistenza.",
    tono: "destructive",
  },
  manutenzione: {
    icona: ConstructionIcon,
    titolo: "Manutenzione in corso",
    messaggio: "Il servizio è in aggiornamento e torna operativo a breve. Riprova fra qualche minuto.",
    tono: "info",
  },
}

/** V. il commento di testa: dentro il guscio per 404/accesso-negato, fuori per gli altri due. */
const SCHERMO_INTERO_DI_DEFAULT: Record<VarianteErrore, boolean> = {
  "404": false,
  "accesso-negato": false,
  "errore-server": true,
  manutenzione: true,
}

/**
 * Il fondo dell'icona e il colore della descrizione, un token per tono — mai
 * una classe costruita a runtime (`text-${tono}-...`): Tailwind scansiona
 * stringhe letterali, una concatenata a runtime sparirebbe dalla build senza
 * errore (lo stesso avvertimento che vale per gli hex, regola 3).
 */
const ICONA_DI_TONO: Record<Tono, string> = {
  success: "bg-success-subtle-foreground/10",
  warning: "bg-warning-subtle-foreground/10",
  info: "bg-info-subtle-foreground/10",
  destructive: "bg-destructive-subtle-foreground/10",
  neutro: "bg-muted-foreground/10",
}

const DESCRIZIONE_DI_TONO: Record<Tono, string> = {
  success: "text-success-subtle-foreground",
  warning: "text-warning-subtle-foreground",
  info: "text-info-subtle-foreground",
  destructive: "text-destructive-subtle-foreground",
  neutro: "text-muted-foreground",
}

export type PaginaErroreProps = {
  variante: VarianteErrore
  /** Sovrascrive il titolo di default della variante. */
  titolo?: ReactNode
  /** Sovrascrive il messaggio di default — già tradotto, mai un codice HTTP o uno stack (stessa regola di `tassullo-error-state`). */
  messaggio?: ReactNode
  /** Sovrascrive l'icona di default della variante. */
  icona?: ReactNode
  /** La via d'uscita: un link alla home, un bottone che ritenta, un `mailto:`. Assente, nessuna CTA — ma v. il commento di testa: usarla è la raccomandazione. */
  azione?: ReactNode
  /**
   * Fuori dal guscio (marchio in testa, sfondo pieno, come `tassullo-pagina-login`)
   * o dentro il contenuto esistente. Il default dipende dalla variante — v.
   * il commento di testa — e si sovrascrive solo per un caso che lo richiede
   * davvero.
   */
  schermoIntero?: boolean
  className?: string
}

export function PaginaErrore({
  variante,
  titolo,
  messaggio,
  icona,
  azione,
  schermoIntero,
  className,
}: PaginaErroreProps) {
  const dati = DATI_VARIANTE[variante]
  const IconaVariante = dati.icona
  const intero = schermoIntero ?? SCHERMO_INTERO_DI_DEFAULT[variante]

  const contenuto = (
    <Empty
      data-slot="pagina-errore"
      className={cn(dati.tono ? TONO[dati.tono] : undefined, !intero && className)}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon" className={dati.tono ? ICONA_DI_TONO[dati.tono] : undefined}>
          {icona ?? <IconaVariante />}
        </EmptyMedia>
        <EmptyTitle className="text-lg">{titolo ?? dati.titolo}</EmptyTitle>
        <EmptyDescription className={dati.tono ? DESCRIZIONE_DI_TONO[dati.tono] : undefined}>
          {messaggio ?? dati.messaggio}
        </EmptyDescription>
      </EmptyHeader>
      {azione ? <EmptyContent>{azione}</EmptyContent> : null}
    </Empty>
  )

  if (!intero) return contenuto

  return (
    <div
      data-slot="pagina-errore-schermo-intero"
      className={cn("flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-background p-4", className)}
    >
      <span aria-hidden className="marchio-t size-10" />
      <div className="w-full max-w-sm">{contenuto}</div>
    </div>
  )
}
