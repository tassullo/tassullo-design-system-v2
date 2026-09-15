/**
 * `tassullo-pagina-login` — la schermata d'accesso, la prima delle pagine
 * modello (FASE 4, M4.1).
 *
 * `Login.tsx` di Anagrafe (letto in sola lettura, `frontend/src/pages/`) è
 * 24 righe: logo, titolo, un bottone «Accedi con Microsoft» che chiama
 * `instance.loginRedirect()` di MSAL, e un avviso quando l'app registration
 * non è ancora configurata. Ogni app dello studio ne ha una, leggermente
 * diversa — questo blocco è quella forma, **predisposta** per MSAL/Entra ID
 * e non legata a esso: non importa `@azure/msal-react`, perché farlo
 * obbligherebbe ogni consumatore del registry a quella libreria anche se non
 * fa autenticazione, o ne facesse una diversa. `onAccedi` è la sola cucitura:
 * l'app ci passa `() => instance.loginRedirect(loginRequest)`, o qualunque
 * altro flusso — il blocco non lo sa e non deve saperlo.
 *
 * **I tre stati che Anagrafe già distingue**, resi come un solo prop invece
 * che tre booleani indipendenti che potrebbero contraddirsi: `inattivo` (il
 * bottone aspetta un clic), `in-corso` (il redirect è partito: bottone
 * disabilitato, indicatore al posto dell'icona — MSAL lascia la pagina, ma
 * l'app può tenerlo acceso nella finestra fra il clic e il redirect vero, o
 * per il ritorno da `loginRedirect` mentre valida il token), `errore` (il
 * provider ha rifiutato, o il redirect è tornato senza sessione).
 *
 * **`configurato` non è un quarto stato**: è ortogonale, com'è in Anagrafe —
 * un'app senza app registration può trovarsi in `inattivo` o in `errore`
 * indipendentemente. A `configurato={false}` il bottone resta disabilitato e
 * compare l'avviso, esattamente come `isAuthConfigured` nell'originale.
 *
 * Il messaggio d'errore è **già tradotto quando arriva qui** — stessa regola
 * di `tassullo-error-state`: mai un codice del provider, mai uno stack. Lo
 * stato lo mostra con `Alert variant="destructive"`, non un testo tinto
 * `text-destructive` — la prima delle due trappole del `CLAUDE.md`.
 */
import type { ReactNode } from "react"
import { LogInIcon } from "lucide-react"

import { cn } from "cn"
import { Alert, AlertDescription, AlertTitle } from "@/registry/tassullo/ui/alert"
import { Button } from "@/registry/tassullo/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/tassullo/ui/card"
import { Spinner } from "@/registry/tassullo/ui/spinner"

export type PaginaLoginProps = {
  /** Il nome dell'app, sotto il marchio: «Anagrafe», «Studio», «Officina». */
  applicazione: string
  /** Sottotitolo facoltativo — a cosa serve l'app, in una riga. */
  descrizione?: ReactNode
  /** Uno dei tre stati che Anagrafe già distingue. `inattivo` di default. */
  stato?: "inattivo" | "in-corso" | "errore"
  /** Il messaggio d'errore, già tradotto: mai un codice del provider. */
  messaggioErrore?: ReactNode
  /**
   * `false` quando l'app registration Entra ID non è ancora pronta — il
   * bottone resta disabilitato e compare l'avviso, indipendentemente da
   * `stato`. `true` di default.
   */
  configurato?: boolean
  /** Il clic sul bottone. Ci si aggancia MSAL, o qualunque altro provider. */
  onAccedi: () => void
  etichettaAccedi?: string
  className?: string
}

export function PaginaLogin({
  applicazione,
  descrizione,
  stato = "inattivo",
  messaggioErrore = "Accesso non riuscito. Riprova.",
  configurato = true,
  onAccedi,
  etichettaAccedi = "Accedi con Microsoft",
  className,
}: PaginaLoginProps) {
  const inCorso = stato === "in-corso"

  return (
    <div
      data-slot="pagina-login"
      className={cn(
        "flex min-h-svh w-full items-center justify-center bg-background p-4",
        className
      )}
    >
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center gap-2 text-center">
          <span aria-hidden className="marchio-t size-10" />
          <CardTitle className="text-2xl">{applicazione}</CardTitle>
          {descrizione ? <CardDescription>{descrizione}</CardDescription> : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {stato === "errore" ? (
            <Alert variant="destructive">
              <AlertTitle>Accesso non riuscito</AlertTitle>
              <AlertDescription>{messaggioErrore}</AlertDescription>
            </Alert>
          ) : null}
          <Button
            className="w-full"
            disabled={!configurato || inCorso}
            onClick={onAccedi}
          >
            {inCorso ? <Spinner /> : <LogInIcon />}
            {inCorso ? "Accesso in corso…" : etichettaAccedi}
          </Button>
          {!configurato ? (
            <p className="text-center text-sm text-muted-foreground">
              Login non ancora configurato (app registration Entra ID).
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
