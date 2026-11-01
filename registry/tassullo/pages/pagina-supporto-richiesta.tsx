/**
 * `tassullo-pagina-supporto-richiesta` — la scheda di una richiesta di
 * supporto (proposta #165, passo #165c).
 *
 * Ricavata da `frontend/src/pages/SupportoRichiesta.tsx` di Anagrafe al
 * commit `589247a5`: a tutta larghezza la richiesta, gli screenshot e le
 * risposte; per l'amministratore, quando l'area è larga abbastanza, una
 * colonna a destra coi dettagli tecnici che l'app ha allegato. Chi ha scritto
 * la richiesta non li vede, e il server non glieli manda.
 *
 * Qui non legge i dati: riceve la scheda, lo stato e la funzione che carica
 * gli screenshot (autenticati) per `tassullo-galleria-immagini`. Segnare
 * lette le risposte nuove resta all'app.
 */
import { Fragment, type ReactNode } from "react"
import { ChevronRightIcon, RefreshCwIcon, SearchXIcon } from "lucide-react"

import { cn } from "cn"
import { EmptyState } from "@/registry/tassullo/blocks/empty-state"
import { ErrorState } from "@/registry/tassullo/blocks/error-state"
import { FiloMessaggi } from "@/registry/tassullo/blocks/filo-messaggi"
import {
  GalleriaImmagini,
  type CaricaImmagine,
  type ImmagineGalleria,
} from "@/registry/tassullo/blocks/galleria-immagini"
import { PageHeader, type AzionePagina, type LivelloPercorso } from "@/registry/tassullo/blocks/page-header"
import { PageSkeleton } from "@/registry/tassullo/blocks/page-skeleton"
import { intero } from "@/registry/tassullo/lib/numeri"
import {
  formattaDataOra,
  STATO_RICHIESTA,
  TIPO_RICHIESTA,
  type DettagliTecnici,
  type RichiestaScheda,
} from "@/registry/tassullo/lib/supporto"
import { TONO } from "@/registry/tassullo/lib/toni"
import { Badge } from "@/registry/tassullo/ui/badge"
import { Button } from "@/registry/tassullo/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/tassullo/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/registry/tassullo/ui/collapsible"

export type PaginaSupportoRichiestaProps = {
  /** La scheda. Conta solo con `stato` a `pronto`. */
  richiesta?: RichiestaScheda
  /**
   * `pronto` di serie. `non-trovata` è la richiesta che non esiste o che non
   * è di chi la guarda: la pagina non dice quale dei due.
   */
  stato?: "pronto" | "caricamento" | "errore" | "non-trovata"
  /** Il messaggio d'errore, già tradotto. */
  messaggioErrore?: ReactNode
  onRiprovaErrore?: () => void
  /** Il primo livello del percorso, verso l'elenco: di solito col `Link` del router in `render`. */
  percorsoLista?: LivelloPercorso
  /** Rilegge la scheda. Assente, la fascia non ha «Aggiorna». */
  onAggiorna?: () => void
  /** Mentre la scheda si rilegge, «Aggiorna» è spento. */
  aggiornamentoInCorso?: boolean
  /** Carica uno screenshot: un URL o un `Blob`. Vedi `tassullo-galleria-immagini`. */
  caricaScreenshot: CaricaImmagine<ImmagineGalleria>
  /** Mostra la colonna dei dettagli tecnici. Solo per l'amministratore. */
  amministratore?: boolean
  className?: string
}

/** Il contesto tecnico allegato, in chiaro; gli errori delle chiamate in un riquadro che si apre. */
function DettagliInviati({ dati }: { dati: DettagliTecnici }) {
  const b = dati.browser
  const schermo = b?.viewport
    ? [
        `${b.viewport.replace("x", " × ")} px`,
        b.scuro == null ? null : b.scuro ? "tema scuro" : "tema chiaro",
        b.densita ? `densità ${b.densita}` : null,
      ]
        .filter(Boolean)
        .join(", ")
    : null
  const righe: [string, string | null | undefined][] = [
    ["Pagina", dati.pagina],
    ["Versione dell'app", dati.versione_frontend],
    ["Versione del server", dati.versione_backend],
    ["Browser", b?.userAgent],
    ["Schermo", schermo],
    ["Lingua", b?.lingua],
  ]
  const presenti = righe.filter(([, valore]) => valore)
  const errori = dati.errori_api ?? []
  const n = errori.length

  return (
    <Card data-slot="pagina-supporto-dettagli">
      <CardHeader>
        <CardTitle>Dettagli inviati</CardTitle>
        <CardDescription>Ciò che l'app ha allegato alla richiesta insieme al testo.</CardDescription>
      </CardHeader>
      <CardContent className="@container flex flex-col gap-3">
        {presenti.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessun dettaglio allegato.</p>
        ) : (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm @sm:grid-cols-termine">
            {presenti.map(([termine, valore]) => (
              <Fragment key={termine}>
                <dt className="text-muted-foreground">{termine}</dt>
                <dd className="min-w-0 wrap-anywhere">{valore}</dd>
              </Fragment>
            ))}
          </dl>
        )}
        {n === 0 ? (
          <p className="text-sm text-muted-foreground">Nessuna chiamata non riuscita negli ultimi minuti.</p>
        ) : (
          <Collapsible className="flex flex-col gap-2">
            <CollapsibleTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="group/errori -ml-2 h-auto justify-start gap-2 py-1 aria-expanded:bg-transparent"
                />
              }
            >
              <ChevronRightIcon
                data-icon="inline-start"
                className="transition-transform group-aria-expanded/errori:rotate-90"
              />
              {intero(n)} {n === 1 ? "chiamata non riuscita" : "chiamate non riuscite"}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="flex flex-col gap-2">
                {errori.map((e, i) => (
                  <li key={i} className="rounded-lg border p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-medium wrap-anywhere">
                        {e.metodo} {e.percorso}
                      </span>
                      {e.stato != null ? (
                        <Badge className={TONO.destructive}>{e.stato === 0 ? "Senza risposta" : e.stato}</Badge>
                      ) : null}
                    </div>
                    <div className="text-muted-foreground tabular-nums">{formattaDataOra(e.quando)}</div>
                    {e.dettaglio ? <p className="wrap-anywhere">{e.dettaglio}</p> : null}
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  )
}

export function PaginaSupportoRichiesta({
  richiesta,
  stato = "pronto",
  messaggioErrore = "La richiesta non si carica.",
  onRiprovaErrore,
  percorsoLista = { titolo: "Supporto" },
  onAggiorna,
  aggiornamentoInCorso = false,
  caricaScreenshot,
  amministratore = false,
  className,
}: PaginaSupportoRichiestaProps) {
  const azioni: AzionePagina[] = onAggiorna
    ? [
        {
          titolo: "Aggiorna",
          icona: RefreshCwIcon,
          ruolo: "secondaria",
          onClick: onAggiorna,
          disabilitata: aggiornamentoInCorso,
        },
      ]
    : []

  if (stato !== "pronto" || !richiesta) {
    return (
      <div data-slot="pagina-supporto-richiesta" className={cn("flex flex-col gap-4", className)}>
        <PageHeader percorso={[percorsoLista, { titolo: "Richiesta" }]} />
        {stato === "caricamento" ? (
          <PageSkeleton variante="scheda" />
        ) : stato === "non-trovata" ? (
          <EmptyState
            icona={<SearchXIcon />}
            titolo="Richiesta non trovata"
            descrizione="Forse l'indirizzo non è giusto. Le tue richieste sono tutte nell'elenco del supporto."
            className="mx-auto max-w-md"
          />
        ) : (
          <ErrorState messaggio={messaggioErrore} onRiprova={onRiprovaErrore} />
        )}
      </div>
    )
  }

  const s = STATO_RICHIESTA[richiesta.stato]
  const t = TIPO_RICHIESTA[richiesta.tipo]
  const screenshot = richiesta.screenshot.map((x) => ({ id: x.id, nome: x.nome ?? undefined }))
  const tolti = richiesta.screenshot_tolti ?? 0

  return (
    <div data-slot="pagina-supporto-richiesta" className={cn("flex flex-col gap-4", className)}>
      <PageHeader percorso={[percorsoLista, { titolo: richiesta.titolo }]} azioni={azioni} />
      {/* A tutta larghezza; per l'amministratore i dettagli a destra quando l'area è larga abbastanza. */}
      <div className="@container">
        <div className={cn("grid grid-cols-1 items-start gap-4", amministratore && "@4xl:grid-cols-3")}>
          <div className={cn("flex min-w-0 flex-col gap-4", amministratore && "@4xl:col-span-2")}>
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={TONO[s.tono]}>{s.testo}</Badge>
                  <Badge variant="secondary">
                    <t.icona />
                    {t.testo}
                  </Badge>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {formattaDataOra(richiesta.creato_il)}
                  </span>
                </div>
                <CardTitle>{richiesta.titolo}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm whitespace-pre-wrap wrap-anywhere">{richiesta.descrizione}</p>
                {richiesta.stato === "ricevuta" ? (
                  <p className="text-sm text-muted-foreground">
                    La richiesta è registrata e sta per arrivare a chi la gestisce. Non devi rifarla.
                  </p>
                ) : null}
              </CardContent>
            </Card>

            {screenshot.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {screenshot.length === 1 ? "Screenshot" : `Screenshot (${intero(screenshot.length)})`}
                  </CardTitle>
                  <CardDescription>Fai clic su un'immagine per ingrandirla.</CardDescription>
                </CardHeader>
                <CardContent>
                  <GalleriaImmagini immagini={screenshot} carica={caricaScreenshot} etichetta="Screenshot" />
                </CardContent>
              </Card>
            ) : tolti > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Screenshot</CardTitle>
                  <CardDescription>
                    {tolti === 1
                      ? "Lo screenshot è stato tolto qualche mese dopo la chiusura della richiesta."
                      : `I ${intero(tolti)} screenshot sono stati tolti qualche mese dopo la chiusura della richiesta.`}
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>Risposte</CardTitle>
              </CardHeader>
              <CardContent>
                <FiloMessaggi
                  messaggi={richiesta.risposte.map((r) => ({
                    id: r.id,
                    autore: r.autore,
                    testo: r.testo,
                    data: r.creato_il,
                  }))}
                  vuoto="Nessuna risposta ancora. Quando ti rispondiamo, la risposta compare qui."
                />
              </CardContent>
            </Card>
          </div>

          {amministratore ? <DettagliInviati dati={richiesta} /> : null}
        </div>
      </div>
    </div>
  )
}
