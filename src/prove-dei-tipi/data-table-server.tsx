/**
 * Prova dei tipi di `tassullo-data-table` con `server` (proposta #244).
 * Non si esegue: la compila `tsc -b`, cioè `npm run build`, che gira anche in
 * CI. Fallisce se l'esempio della documentazione di `server` smette di
 * compilarsi senza cast, o se `perPagina` torna ad accettare un numero che la
 * tendina delle righe per pagina non offre.
 */
import * as React from "react"

import {
  DataTable,
  type RichiestaPagina,
  type RighePerPagina,
} from "@/registry/tassullo/blocks/data-table"

type Utente = { id: string; nome: string }

/** L'esempio della documentazione di `server`, così com'è scritto lì. */
export function EsempioServer({
  risposta,
  inCorso,
}: {
  risposta?: { righe: Utente[]; totale: number }
  inCorso: boolean
}) {
  const [richiesta, setRichiesta] = React.useState<RichiestaPagina>()
  return (
    <DataTable
      colonne={[]}
      dati={risposta?.righe ?? []}
      perPagina={richiesta?.perPagina ?? 25}
      server={{
        totale: risposta?.totale ?? 0,
        pagina: richiesta?.pagina ?? 0,
        inCaricamento: inCorso,
        onRichiesta: setRichiesta,
      }}
    />
  )
}

/** Le righe per pagina sono quelle della tendina, e nient'altro. */
export const righeOfferte: RighePerPagina[] = [10, 25, 50, 100]

export function PerPaginaFuoriScala() {
  // @ts-expect-error 37 non è fra le righe per pagina che la tabella offre.
  return <DataTable<Utente> colonne={[]} dati={[]} perPagina={37} />
}
