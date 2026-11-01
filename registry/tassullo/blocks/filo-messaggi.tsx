/**
 * `tassullo-filo-messaggi` — un filo di messaggi, dal più vecchio al più
 * recente: chi ha scritto, quando, e il testo com'è stato scritto.
 *
 * Nasce dalla proposta #165 (Anagrafe, le risposte a una richiesta di
 * supporto), ma è generico: riceve i messaggi e non sa da dove vengono. Il
 * riferimento è `FiloRisposte.tsx` di Anagrafe al commit `589247a5`.
 *
 * Non è `tassullo-version-timeline`: lì gli stati sono fissi e l'elenco va dal
 * più recente; qui è una conversazione, e si legge dall'alto in basso.
 *
 * La data e l'ora seguono Anagrafe: `01/11/2026, 14:30`, sempre nel fuso di
 * Roma, qualunque sia il fuso del browser. Il registry non ha ancora un
 * modulo delle date: la formattatrice sta qui, a livello di modulo.
 */
import type { ComponentProps } from "react"
import { cn } from "cn"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/registry/tassullo/ui/item"

/** Un messaggio del filo. */
export type MessaggioFilo = {
  id: string | number
  /** Chi l'ha scritto, come si legge: nome e cognome. */
  autore: string
  /** Il testo, con i suoi a capo. */
  testo: string
  /**
   * Quando è stato scritto: una `Date`, oppure un istante ISO con il fuso
   * (`2026-11-01T13:30:00Z`). Un testo senza fuso il browser lo legge come
   * ora locale.
   */
  data: Date | string
}

export type FiloMessaggiProps = Omit<ComponentProps<"div">, "children"> & {
  /** I messaggi, in qualunque ordine: il filo li mette dal più vecchio. */
  messaggi: MessaggioFilo[]
  /** La frase quando non ce n'è nessuno. Di serie «Nessun messaggio». */
  vuoto?: string
}

const DATA_ORA = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Rome",
})

const comeData = (valore: Date | string) =>
  valore instanceof Date ? valore : new Date(valore)

/** I messaggi, uno sotto l'altro, dal più vecchio al più recente. */
export function FiloMessaggi({
  messaggi,
  vuoto = "Nessun messaggio",
  className,
  ...props
}: FiloMessaggiProps) {
  if (messaggi.length === 0) {
    return (
      <div data-slot="filo-messaggi" className={className} {...props}>
        <p className="text-sm text-muted-foreground">{vuoto}</p>
      </div>
    )
  }
  // `sort` è stabile: due messaggi dello stesso minuto restano nell'ordine
  // in cui arrivano.
  const ordinati = messaggi
    .map((m) => ({ ...m, quando: comeData(m.data) }))
    .sort((a, b) => a.quando.getTime() - b.quando.getTime())

  return (
    <ItemGroup className={cn("min-w-0", className)} {...props}>
      {ordinati.map((m) => {
        const valida = !Number.isNaN(m.quando.getTime())
        return (
          <Item key={m.id} variant="outline" role="listitem">
            <ItemContent className="min-w-0">
              <ItemHeader className="flex-wrap justify-start gap-x-3 gap-y-0">
                <ItemTitle>{m.autore}</ItemTitle>
                {valida ? (
                  <time
                    dateTime={m.quando.toISOString()}
                    className="text-sm text-muted-foreground tabular-nums"
                  >
                    {DATA_ORA.format(m.quando)}
                  </time>
                ) : null}
              </ItemHeader>
              {/* La descrizione di serie taglia a due righe: un messaggio si
                  legge per intero, e un indirizzo lungo va a capo dove serve. */}
              <ItemDescription className="line-clamp-none whitespace-pre-wrap text-foreground wrap-anywhere">
                {m.testo}
              </ItemDescription>
            </ItemContent>
          </Item>
        )
      })}
    </ItemGroup>
  )
}
