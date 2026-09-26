/**
 * `tassullo-pagina-scheda` — il dettaglio di un'entità (FASE 4, M4.3).
 *
 * In Anagrafe è Prodotto, Famiglia, Sistema, Norma — quattro volte la stessa
 * pagina, ed è il file CSS più grande del progetto (`Prodotto.css`, 201
 * righe). Compone ciò che il registry ha già — `tassullo-page-header`,
 * `tabs`, `card`, `tassullo-version-timeline`, `tassullo-page-skeleton`,
 * `tassullo-error-state` — zero primitive nuove, zero CSS di pagina.
 *
 * ── Niente intestazione di pagina: il nome sta nel percorso ─────────────
 *
 * Fino al 2026-09-21 questo blocco rendeva, sopra le tab, un'intestazione
 * propria: `titolo` grande, `distintivo` (il badge di stato) accanto,
 * `descrizione` sotto e le azioni a destra. **Tolta su indirizzo di
 * Francesco**, guardandola a video in M4ter.11, e le tre ragioni sono
 * separate perché rispondono a tre domande diverse:
 *
 *  1. **Il nome dell'entità è già scritto**, ed è l'ultimo livello del
 *     `percorso`: «Norme › UNI EN 1090». Scriverlo una seconda volta 40px più
 *     sotto, in grande, è ripetizione — e la descrizione estesa, terza riga,
 *     era la **quarta** volta che la stessa norma si nominava nella stessa
 *     schermata, perché il suo titolo per esteso sta già nel campo «Titolo»
 *     della scheda Anagrafica.
 *  2. **Lo stato è un dato dell'entità, non un ornamento del titolo.**
 *     «Vigente» si legge come gli altri campi, dentro la scheda, dove sta
 *     tutto il resto di ciò che quella norma è. Come badge appeso al titolo
 *     era l'unico dato della pagina a non avere un'etichetta che dicesse di
 *     che cosa fosse il valore.
 *  3. **Le azioni della pagina vanno nella fascia della pagina.** «Elimina» e
 *     «Modifica» sono azioni *di questa pagina*, ed è esattamente ciò che
 *     `PageHeader.azioni` porta — con in più il ripiegamento a menu quando la
 *     fascia si stringe, che il blocco qui non aveva. Averle in due posti
 *     diversi a seconda del tipo di pagina era la cosa da togliere.
 *
 * Ne segue che `titolo`, `descrizione` e `distintivo` **non esistono più**
 * come prop: il nome si passa come ultimo livello di `percorso`, lo stato è un
 * campo di `anagrafica`, e `azioni` sale in `PageHeader`. La prop
 * `descrizione`, aggiunta in M4ter.7, ha avuto vita breve ed è la scelta di
 * forma #2 di M4ter.11, chiusa per **rimozione**.
 *
 * (Resta vero ciò che `tassullo-page-header` dice di sé: la fascia non porta
 * un titolo visibile, perché il percorso lo contiene già. Qui non si aggiunge
 * un titolo alla fascia — si smette di aggiungerne uno sotto.)
 *
 * ── Ogni tab rende dentro una `Card`, non a diretto contatto con lo sfondo ─
 *
 * Confrontato da Francesco con `Prodotto.tsx` di Anagrafe: lì il contenuto
 * di ogni scheda sta in un riquadro bianco, staccato dallo sfondo grigio
 * della pagina — non testo e controlli appoggiati direttamente sopra. I tre
 * pannelli qui rendono dentro `Card`/`CardContent`, stessa primitiva del
 * resto del registry: non un contenitore nuovo, solo il posto giusto in cui
 * mettere ciò che ogni tab riceve.
 *
 * ── `anagrafica`: un solo albero, disabilitato — non due viste diverse ───
 *
 * Prima versione di questo blocco (M4.3, prima correzione): `lettura` e
 * `modifica` erano due `ReactNode` distinti, uno statico e uno con
 * `tassullo-form-field`. **Corretto su indicazione di Francesco**: un campo
 * che cambia forma fra lettura e modifica — da testo a riquadro con bordo —
 * fa muovere l'intera scheda al clic su "Modifica", ed è un salto che
 * un form vero non fa. La forma giusta è **un solo form, sempre montato**:
 * gli stessi `Input`/`Select`/`Textarea` di `tassullo-form-field`, disabili
 * quando la scheda non è in modifica — lo stesso principio dei campi di
 * un modulo bancario, mai un componente diverso a seconda dello stato.
 *
 * Per questo `anagrafica` è una **funzione di `modifica`**, non un nodo: il
 * form dell'app riceve il booleano e decide da sé come disabilitare ogni
 * campo — tipicamente `<Input {...campo} disabled={!modifica} />`. Il
 * blocco non impone *come* si disabilita (un `Input` di shadcn si sbianca da
 * sé in `disabled`): sa solo *quando*.
 *
 * `modifica`/`onModificaChange` restano **controllabili**, non solo uno
 * stato interno: senza, il blocco non avrebbe modo di tornare alla lettura
 * dopo un salvataggio riuscito, perché quel successo lo sa solo il `<form>`
 * dell'app — che sta *dentro* `anagrafica`, opaco al blocco. Non
 * controllate, restano uno stato interno (il caso comune, un "Annulla" che
 * basta a sé stesso); controllate, l'app decide quando uscire dalla modifica
 * — tipicamente nel gestore di successo della propria `mutation`.
 *
 * ── `storico` rende sempre `VersionTimeline`, `documenti` non rende niente da sé ─
 *
 * Lo storico delle revisioni è la stessa forma per ogni entità — stato,
 * autore, data, confronto — quindi qui il blocco lo possiede: passata
 * `storico`, la scheda monta `VersionTimeline` da sé, «in coda» come chiede
 * `PIANO.md`. I documenti no: un allegato di Norma è un PDF (`pdf-preview`,
 * M3.7), uno di Prodotto può essere una foto o un disegno REN/RES — non
 * esiste una forma sola, quindi `documenti` resta un `ReactNode` libero,
 * stessa scelta di `barra` in `tassullo-data-table`.
 */
import { useRef, useState, type ReactNode } from "react"
import { PencilIcon, XIcon } from "lucide-react"

import { cn } from "cn"
import { ErrorState } from "@/registry/tassullo/blocks/error-state"
import { PageHeader, type AzionePagina, type LivelloPercorso } from "@/registry/tassullo/blocks/page-header"
import { PageSkeleton } from "@/registry/tassullo/blocks/page-skeleton"
import {
  VersionTimeline,
  type VersionTimelineEntry,
} from "@/registry/tassullo/blocks/version-timeline"
import { Card, CardContent } from "@/registry/tassullo/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/tassullo/ui/tabs"

export type SezioneStorico = {
  /** Dalla più recente alla più vecchia — stesso ordine di `VersionTimeline`. */
  revisioni: VersionTimelineEntry[]
  confrontabile?: boolean
  onConfronta?: (a: VersionTimelineEntry, b: VersionTimelineEntry) => void
}

export type PaginaSchedaProps = {
  /** Il percorso dell'intestazione — passa a `PageHeader`, che lo porta nella fascia. */
  /**
   * Il percorso della fascia. **L'ultimo livello è il nome dell'entità** — è
   * lì che «UNI EN 1090» si legge, e per questo il blocco non ha un `titolo`:
   * v. il blocco in testa al file.
   */
  percorso: LivelloPercorso[]
  /**
   * Le azioni della pagina. **Rendono nella fascia**, insieme al percorso, e
   * non sopra le tab: `PageHeader` le ripiega da sé in un menu quando la
   * fascia si stringe. Il blocco aggiunge in coda il «Modifica»/«Annulla»
   * della modifica in riga, che è sua e non dell'app.
   */
  azioni?: AzionePagina[]
  /** Controllata: l'app decide quando uscire dalla modifica (tipicamente al successo del salvataggio). Assente, resta uno stato interno. */
  modifica?: boolean
  onModificaChange?: (modifica: boolean) => void
  /**
   * Il form, sempre lo stesso albero — riceve `modifica` e decide da sé come
   * disabilitare i campi (`<Input {...campo} disabled={!modifica} />`).
   * Non due viste: la stessa, con o senza controlli attivi.
   */
  anagrafica: (modifica: boolean) => ReactNode
  /** Libero: un allegato di Norma è un PDF, uno di Prodotto una foto — nessuna forma sola. */
  documenti?: ReactNode
  storico?: SezioneStorico
  /** Le etichette dei tre tab — cambiano da entità a entità, l'ordine e i tre slot no. */
  etichetteTab?: { anagrafica?: string; documenti?: string; storico?: string }
  /** Uno dei tre stati. `pronto` di default: solo lì il resto delle prop conta. */
  stato?: "pronto" | "caricamento" | "errore"
  /** Il messaggio d'errore, già tradotto — mai un codice, mai uno stack. */
  messaggioErrore?: ReactNode
  onRiprovaErrore?: () => void
  className?: string
}

export function PaginaScheda({
  percorso,
  azioni = [],
  modifica: modificaControllata,
  onModificaChange,
  anagrafica,
  documenti,
  storico,
  etichetteTab,
  stato = "pronto",
  messaggioErrore = "Non è stato possibile caricare la scheda. Riprova.",
  onRiprovaErrore,
  className,
}: PaginaSchedaProps) {
  const [modificaPropria, setModificaPropria] = useState(false)
  const [tab, setTab] = useState("anagrafica")
  const radiceTab = useRef<HTMLDivElement>(null)
  const fasciaTab = useRef<HTMLDivElement>(null)
  const modifica = modificaControllata ?? modificaPropria
  function impostaModifica(v: boolean) {
    setModificaPropria(v)
    onModificaChange?.(v)
  }

  // Cambiando tab con le tab già ferme sotto la fascia, la finestra torna
  // all'inizio del pannello: senza, il pannello nuovo si aprirebbe a metà, con
  // l'inizio nascosto sotto le fasce. Le tab sono ferme quando stanno più in
  // basso del punto in cui starebbero senza `sticky`, cioè della cima della
  // radice delle tab. Il salto è immediato, senza animazione.
  function cambiaTab(valore: string) {
    const radice = radiceTab.current?.getBoundingClientRect()
    const fascia = fasciaTab.current?.getBoundingClientRect()
    if (radice && fascia && radice.top < fascia.top) {
      window.scrollBy({ top: radice.top - fascia.top, behavior: "instant" })
    }
    setTab(valore)
  }

  if (stato === "caricamento") {
    return (
      <div data-slot="pagina-scheda" className={cn("flex flex-col gap-4", className)}>
        <PageHeader percorso={percorso} />
        <PageSkeleton variante="scheda" />
      </div>
    )
  }

  if (stato === "errore") {
    return (
      <div data-slot="pagina-scheda" className={cn("flex flex-col gap-4", className)}>
        <PageHeader percorso={percorso} />
        <ErrorState messaggio={messaggioErrore} onRiprova={onRiprovaErrore} />
      </div>
    )
  }

  const toggleModifica: AzionePagina = modifica
    ? { titolo: "Annulla", icona: XIcon, ruolo: "secondaria", onClick: () => impostaModifica(false) }
    : { titolo: "Modifica", icona: PencilIcon, ruolo: "secondaria", onClick: () => impostaModifica(true) }

  return (
    <div data-slot="pagina-scheda" className={cn("flex flex-col gap-4", className)}>
      {/*
        Le azioni salgono nella fascia, col percorso. Il
        «Modifica»/«Annulla» va **in coda**, dopo quelle dell'app: è l'azione
        che il blocco aggiunge di suo, e in un ripiegamento a menu si legge
        ultima, dove chi cerca un comando di pagina se l'aspetta.
      */}
      <PageHeader percorso={percorso} azioni={[...azioni, toggleModifica]} />

      <Tabs ref={radiceTab} value={tab} onValueChange={(v) => cambiaTab(String(v))}>
        {/*
          Le tab restano ferme sotto la fascia del guscio mentre la pagina
          scorre: `top-12` è l'altezza della fascia, e `-mx-4 px-4` allarga il
          fondo fino ai bordi dell'area del contenuto, perché ciò che scorre
          sotto non si veda ai lati. `scroll-pt-24` è la somma delle due fasce:
          un campo raggiunto con Maiusc+Tab si ferma sotto tutte e due.
        */}
        <div
          ref={fasciaTab}
          data-slot="pagina-scheda-tab"
          className="sticky top-12 z-10 -mx-4 bg-background px-4 py-2 [html:has(&)]:scroll-pt-24"
        >
          <TabsList>
            <TabsTrigger value="anagrafica">{etichetteTab?.anagrafica ?? "Anagrafica"}</TabsTrigger>
            <TabsTrigger value="documenti">{etichetteTab?.documenti ?? "Documenti"}</TabsTrigger>
            <TabsTrigger value="storico">{etichetteTab?.storico ?? "Storico"}</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="anagrafica">
          <Card>
            <CardContent>{anagrafica(modifica)}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documenti">
          <Card>
            <CardContent>{documenti}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="storico">
          <Card>
            <CardContent>
              {storico ? (
                <VersionTimeline
                  revisioni={storico.revisioni}
                  confrontabile={storico.confrontabile}
                  onConfronta={storico.onConfronta}
                />
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
