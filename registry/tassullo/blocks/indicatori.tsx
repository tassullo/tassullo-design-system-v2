/**
 * `tassullo-indicatori` — la fila di indicatori, installabile da sola
 * (FASE 4ter, M4ter.7).
 *
 * Nasce da uno **scorporo**: fino a M4ter.6 era `RigaIndicatori`, una funzione
 * non esportata dentro `pagina-dashboard.tsx`, e tre app la riscrivevano
 * identica (Anagrafe AdminBC, Studio Admin, RadarOpere) perché non c'era modo
 * di installarla senza portarsi dietro la dashboard intera. `pagina-dashboard`
 * adesso la **ricompone**: non ne esiste una seconda copia.
 *
 * ── La soglia è del blocco, non di chi lo ospita ─────────────────────────
 *
 * Questo è il punto su cui lo scorporo poteva fallire **in silenzio**. La riga
 * nasceva con `@4xl/dashboard:grid-cols-4`, e `@container/dashboard` lo
 * dichiara la pagina dashboard, a un livello che il blocco non si porta
 * dietro. Spedita così, installata in una pagina qualunque, la query non
 * avrebbe mai trovato il proprio contenitore: due colonne per sempre, nessun
 * errore, nessun avviso, `test:a11y` verde. **Misurato**, non dedotto: in
 * Chromium sullo Storybook costruito prima della correzione, la stessa fila
 * dà `276px 276px 276px 276px` dentro la dashboard e `628px 628px` appena la
 * si sposta fuori dal contenitore, su una riga larga **1272px** — dove di
 * colonne ce ne stavano quattro con larghezza da vendere.
 *
 * Il blocco dichiara quindi **il proprio** `@container/indicatori`, e la
 * soglia guarda quello. Dentro la dashboard il comportamento non cambia — la
 * fila è un figlio a piena larghezza della colonna della pagina, quindi
 * misura esattamente ciò che misurava il contenitore della dashboard: 4
 * colonne sopra 896px (`@4xl`), 2 sotto — verificato dopo lo scorporo, con le
 * colonne **contate nel DOM** e non guardate: `340px ×4` su una fila da 1408,
 * `255px ×4` su una da 1068, `386px ×2` su una da 788, e dentro la dashboard
 * gli stessi `276px ×4` di prima. La strada scartata era **passare il
 * nome del contenitore come prop**: è API aggiunta per aggirare un problema
 * di composizione, e sposterebbe sul chiamante una cosa che il blocco sa già.
 *
 * Il contenitore e la griglia sono **due nodi** e non uno: una container
 * query si applica ai *discendenti* del contenitore, mai all'elemento che lo
 * dichiara, quindi `@container/indicatori` e `@4xl/indicatori:grid-cols-4`
 * sullo stesso `div` non scatterebbero mai.
 *
 * ── `GrigliaIndicatori` è esportata, e serve allo scheletro ──────────────
 *
 * Il ramo `stato === "caricamento"` della dashboard disegna quattro scheletri
 * nella stessa disposizione del contenuto vero. Finché ripeteva le classi a
 * mano c'erano **due** sorgenti della stessa griglia: cambiare qui la soglia o
 * il numero di colonne faceva disegnare allo scheletro una griglia diversa da
 * quella che arriva un istante dopo — un salto visibile e nessun modo di
 * accorgersene da un gate. La griglia sola è quindi un export a sé, e la
 * dashboard ci monta dentro i `PageSkeleton`.
 *
 * ── Il numero non sta dentro una `Card size="sm"` ────────────────────────
 *
 * Difetto muto già pagato in M4.4: `CardTitle` porta
 * `group-data-[size=sm]/card:text-sm`, che vince su `text-2xl` e rende il
 * numero dell'indicatore **alla stessa misura della sua etichetta**. Misurato
 * in Chromium: 13px con `size="sm"`, 27px senza. La `Card` qui resta di
 * taglia normale, e dopo lo scorporo il numero è stato riletto dal DOM:
 * **27px** su una carta da 230px, **31px** sopra i 250
 * (`@[250px]/card:text-3xl`), con l'etichetta a 13px in tutti e due i casi. È
 * una cosa da verificare misurando, non guardando.
 *
 * ── La freccia di tendenza non si colora mai ─────────────────────────────
 *
 * Stessa regola misurata su `Primitive/Chart`, story `Scostamenti`: un aumento
 * non è un successo e un calo non è un errore — dipende dall'indicatore
 * («schede aperte» che sale è un problema, «pratiche chiuse» che sale è una
 * buona notizia), e questo blocco non lo sa. Colorare la freccia userebbe
 * `--success`/`--destructive` per un giudizio che non è il suo da dare: resta
 * sul neutro.
 */
import type { ComponentType, ReactNode } from "react"
import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { cn } from "cn"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/tassullo/ui/card"

/** Un'icona Lucide, o qualunque componente che accetti una `className`. */
type Icona = ComponentType<{ className?: string }>

export type Indicatore = {
  etichetta: string
  /** Già formattato dal chiamante — separatori delle migliaia, unità di misura, valuta: sa tutto questo solo chi conosce il dominio. */
  valore: ReactNode
  /** Sotto il valore, quando non basta la sola tendenza. */
  descrizione?: ReactNode
  /**
   * `direzione` sceglie solo la freccia, mai un colore: un aumento non è un
   * successo e un calo non è un errore, dipende dall'indicatore.
   */
  tendenza?: { direzione: "su" | "giù" | "stabile"; valore: string }
}

const ICONA_TENDENZA: Record<NonNullable<Indicatore["tendenza"]>["direzione"], Icona> = {
  su: TrendingUpIcon,
  giù: TrendingDownIcon,
  stabile: MinusIcon,
}

/**
 * La sola griglia, senza sapere cosa ci sta dentro — due colonne, quattro
 * sopra `@4xl` (896px) **del proprio contenitore**, che dichiara da sé.
 *
 * Esiste come export perché la dashboard la riusa per gli scheletri del
 * caricamento: con le classi ripetute a mano lì, la disposizione dello
 * scheletro e quella del contenuto vero potevano divergere in silenzio.
 */
export function GrigliaIndicatori({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div data-slot="indicatori" className={cn("@container/indicatori", className)}>
      <div className="grid grid-cols-2 gap-4 @4xl/indicatori:grid-cols-4">{children}</div>
    </div>
  )
}

export type IndicatoriProps = {
  /** Quanti se ne vogliono: la griglia è a 2 o 4 colonne, non a *n*. Quattro è il caso che la dashboard disegna. */
  indicatori: Indicatore[]
  className?: string
}

/**
 * La fila di indicatori — etichetta, valore, tendenza — nella forma che vale
 * in ogni app: un indicatore è la stessa cosa ovunque, e fissarla vuol dire
 * non riscriverla mai.
 *
 * ```tsx
 * <Indicatori
 *   indicatori={[
 *     { etichetta: "Prodotti attivi", valore: "1.284", tendenza: { direzione: "su", valore: "+4,2%" } },
 *     { etichetta: "Schede in revisione", valore: "37", descrizione: "da chiudere entro venerdì" },
 *   ]}
 * />
 * ```
 */
export function Indicatori({ indicatori, className }: IndicatoriProps) {
  return (
    <GrigliaIndicatori className={className}>
      {indicatori.map((ind) => {
        const IconaTendenza = ind.tendenza ? ICONA_TENDENZA[ind.tendenza.direzione] : null
        return (
          // `size="sm"` qui sarebbe un difetto muto: `CardTitle` porta
          // `group-data-[size=sm]/card:text-sm`, che vince su `text-2xl` e
          // rende il numero dell'indicatore a 13px — la stessa misura della
          // sua etichetta. Misurato in Chromium: 13px con `sm`, 27px senza.
          <Card key={ind.etichetta} className="@container/card">
            <CardHeader>
              <CardDescription>{ind.etichetta}</CardDescription>
              <CardTitle className="text-2xl tabular-nums @[250px]/card:text-3xl">
                {ind.valore}
              </CardTitle>
            </CardHeader>
            {ind.tendenza || ind.descrizione ? (
              <CardContent className="flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
                {IconaTendenza ? <IconaTendenza className="size-4 shrink-0" /> : null}
                {ind.tendenza ? <span className="tabular-nums">{ind.tendenza.valore}</span> : null}
                {ind.descrizione}
              </CardContent>
            ) : null}
          </Card>
        )
      })}
    </GrigliaIndicatori>
  )
}
