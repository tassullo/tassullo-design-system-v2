/**
 * `tassullo-page-skeleton` — il «caricamento» dello standard unico di M3.5.
 *
 * `INTERFACCE.md` §1.1 di Anagrafe chiede, per il caricamento: skeleton al
 * posto del contenuto, **mai** una pagina bianca e **mai** uno spinner isolato
 * senza contesto; l'altezza dello skeleton coerente col contenuto atteso —
 * «una riga di tabella, una card». Da cui le tre `variante`: la forma cambia
 * con ciò che sta arrivando, non è un rettangolo unico buono per tutto.
 *
 * Compone `skeleton`, non lo sostituisce: ogni riga qui sotto è un `<Skeleton
 * className="h-4 w-..." />`, e le larghezze sono le stesse in ogni riga di
 * `tabella` proprio perché una tabella vera non le avrebbe uguali — è quel
 * disallineamento leggero a leggersi come «sta arrivando», invece che come una
 * griglia già disegnata.
 */
import { cn } from "cn"
import { Skeleton } from "@/registry/tassullo/ui/skeleton"

export type PageSkeletonProps = {
  /** `tabella` (default), `scheda` o `elenco` — la forma del contenuto atteso. */
  variante?: "tabella" | "scheda" | "elenco"
  /** Quante righe/voci finte mostrare. */
  righe?: number
  className?: string
}

const LARGHEZZE_COLONNA = ["w-32", "w-24", "w-20"]

export function PageSkeleton({
  variante = "tabella",
  righe = 5,
  className,
}: PageSkeletonProps) {
  if (variante === "scheda") {
    return (
      <div
        data-slot="page-skeleton"
        data-variante={variante}
        className={cn("flex flex-col gap-4 rounded-xl border p-6", className)}
      >
        <Skeleton className="h-6 w-2/5" />
        <Skeleton className="h-4 w-3/5" />
        <div className="flex flex-col gap-2 pt-2">
          {Array.from({ length: righe }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (variante === "elenco") {
    return (
      <div
        data-slot="page-skeleton"
        data-variante={variante}
        className={cn("flex flex-col gap-3", className)}
      >
        {Array.from({ length: righe }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      data-slot="page-skeleton"
      data-variante={variante}
      className={cn("flex flex-col gap-2", className)}
    >
      <div className="flex gap-4 border-b pb-2">
        {LARGHEZZE_COLONNA.map((larghezza, i) => (
          <Skeleton
            key={i}
            className={cn("h-4", larghezza, i === LARGHEZZE_COLONNA.length - 1 && "ml-auto")}
          />
        ))}
      </div>
      {Array.from({ length: righe }).map((_, riga) => (
        <div key={riga} className="flex items-center gap-4 py-2">
          {LARGHEZZE_COLONNA.map((larghezza, i) => (
            <Skeleton
              key={i}
              className={cn("h-4", larghezza, i === LARGHEZZE_COLONNA.length - 1 && "ml-auto")}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
