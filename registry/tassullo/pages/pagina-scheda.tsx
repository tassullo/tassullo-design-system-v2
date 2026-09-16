/**
 * `tassullo-pagina-scheda` — il dettaglio di un'entità (FASE 4, M4.3).
 *
 * In Anagrafe è Prodotto, Famiglia, Sistema, Norma — quattro volte la stessa
 * pagina, ed è il file CSS più grande del progetto (`Prodotto.css`, 201
 * righe). Compone ciò che il registry ha già — `tassullo-page-header`,
 * `tabs`, `field`, `tassullo-version-timeline`, `tassullo-page-skeleton`,
 * `tassullo-error-state` — zero primitive nuove, zero CSS di pagina.
 *
 * ── Perché il titolo qui **si vede**, a differenza di `PageHeader` ───────
 *
 * `tassullo-page-header` (M3.2) toglie deliberatamente il titolo visibile
 * dalla fascia in alto — comparirebbe tre volte in 80px insieme a percorso e
 * voce di colonna. Ma quella è la fascia del **guscio**; questa è
 * l'intestazione della **pagina**, e su una scheda il nome dell'entità è
 * l'unica cosa scritta grande da qualche parte: senza, la pagina non direbbe
 * mai «Norma UNI 1090» a chi ci è arrivato scorrendo un elenco. Le due
 * intestazioni non sono la stessa cosa e non si escludono: `PageHeader` porta
 * solo il `percorso` nella fascia (il nome dell'entità è già l'ultimo
 * livello), questo blocco rende `titolo` + `distintivo` + `azioni` **dentro
 * il contenuto**, dove c'è spazio per restare leggibili a ogni larghezza
 * senza doversi comprimere in un menu.
 *
 * ── `distintivo` è un nodo, non un `variant` chiuso ───────────────────────
 *
 * Un prodotto è «attivo» o «superato», una norma è «vigente» o «abrogata», un
 * sistema è «in produzione» o «in sviluppo» — quattro entità, quattro
 * vocabolari di stato che non hanno un denominatore comune. Fissare qui un
 * insieme di valori vorrebbe dire indovinarne uno e sbagliare per le altre
 * tre; il blocco chiede un `<Badge>` già composto, con la stessa libertà che
 * `barra` lascia a `tassullo-data-table` per i filtri.
 *
 * ── `anagrafica`: lettura e modifica sono due alberi, non uno stato di un form ─
 *
 * Il criterio di M4.3 chiede «form in sola lettura che passa in modifica».
 * Il blocco possiede il **passaggio** — un interruttore `modifica` con un
 * bottone "Modifica" che diventa "Annulla" — ma non il form: `lettura` e
 * `modifica` sono due `ReactNode` distinti, non un'unica struttura di campi
 * con un `readOnly` sparso addosso. Motivo: la vista di sola lettura vuole
 * un'informazione densa e senza controlli (`CampoLettura` qui sotto, o una
 * `dl` scritta a mano), quella di modifica vuole `tassullo-form-field` con
 * `react-hook-form` — sono due composizioni diverse, e forzarle in un solo
 * albero con rami condizionali dentro ogni campo è la strada che il blocco
 * eviterebbe di dover generalizzare per ogni tipo di controllo (stessa
 * ragione per cui `FormField`, M3.4, prende il controllo come funzione e non
 * come un prop `tipo`). Il bottone "Salva" resta dentro `modifica`: è al
 * `<form onSubmit>` dell'app che appartiene, non al blocco che non sa cosa
 * la modifica invia.
 *
 * `modifica`/`onModificaChange` sono **controllabili**, non solo uno stato
 * interno: senza, il blocco non avrebbe modo di tornare alla lettura dopo un
 * salvataggio riuscito, perché quel successo lo sa solo il `<form>` dell'app
 * — che sta *dentro* `modifica`, un `ReactNode` opaco al blocco. Non
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
import { useState, type ReactNode } from "react"
import { PencilIcon, XIcon } from "lucide-react"

import { cn } from "cn"
import { ErrorState } from "@/registry/tassullo/blocks/error-state"
import { PageHeader, type AzionePagina, type LivelloPercorso } from "@/registry/tassullo/blocks/page-header"
import { PageSkeleton } from "@/registry/tassullo/blocks/page-skeleton"
import {
  VersionTimeline,
  type VersionTimelineEntry,
} from "@/registry/tassullo/blocks/version-timeline"
import { Button } from "@/registry/tassullo/ui/button"
import { Field, FieldContent, FieldTitle } from "@/registry/tassullo/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/tassullo/ui/tabs"

/**
 * Una riga di sola lettura — l'equivalente statico di `tassullo-form-field`,
 * per la vista che precede la modifica. Non collegata a nessun form: è testo.
 */
export function CampoLettura({
  etichetta,
  valore,
  className,
}: {
  etichetta: ReactNode
  valore: ReactNode
  className?: string
}) {
  return (
    <Field data-slot="campo-lettura" className={className}>
      <FieldTitle className="text-muted-foreground">{etichetta}</FieldTitle>
      <FieldContent className="text-sm">{valore ?? "—"}</FieldContent>
    </Field>
  )
}

export type SezioneAnagrafica = {
  /** La vista statica, densa, senza controlli — es. una griglia di `CampoLettura`. */
  lettura: ReactNode
  /**
   * La vista di modifica — il form vero, con `tassullo-form-field` e
   * `react-hook-form`. Il bottone "Salva" sta qui dentro: è il `<form
   * onSubmit>` dell'app, non il blocco, a sapere cosa inviare.
   */
  modifica: ReactNode
}

export type SezioneStorico = {
  /** Dalla più recente alla più vecchia — stesso ordine di `VersionTimeline`. */
  revisioni: VersionTimelineEntry[]
  confrontabile?: boolean
  onConfronta?: (a: VersionTimelineEntry, b: VersionTimelineEntry) => void
}

export type PaginaSchedaProps = {
  /** Il percorso dell'intestazione — passa a `PageHeader`, che lo porta nella fascia. */
  percorso: LivelloPercorso[]
  /** Il nome dell'entità. A differenza della fascia, qui **si vede**. */
  titolo: ReactNode
  /** Lo stato dell'entità, già composto — es. `<Badge>Vigente</Badge>`. Il vocabolario cambia per entità: il blocco non lo indovina. */
  distintivo?: ReactNode
  /** Le azioni della scheda (non distruttive dal solo bottone: usa `ruolo="distruttiva"` per quelle, che restano un `<Button variant="destructive">` sotto conferma dell'app). */
  azioni?: AzionePagina[]
  /** Controllata: l'app decide quando uscire dalla modifica (tipicamente al successo del salvataggio). Assente, resta uno stato interno. */
  modifica?: boolean
  onModificaChange?: (modifica: boolean) => void
  anagrafica: SezioneAnagrafica
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

const VARIANTE_AZIONE = {
  primaria: "default",
  secondaria: "outline",
  distruttiva: "destructive",
} as const

function AzioniScheda({ azioni }: { azioni: AzionePagina[] }) {
  if (azioni.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      {azioni.map((a) => (
        <Button
          key={a.titolo}
          variant={VARIANTE_AZIONE[a.ruolo ?? "secondaria"]}
          disabled={a.disabilitata}
          onClick={a.onClick}
          {...(a.href ? { render: <a href={a.href} /> } : {})}
        >
          <a.icona />
          {a.titolo}
        </Button>
      ))}
    </div>
  )
}

export function PaginaScheda({
  percorso,
  titolo,
  distintivo,
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
  const modifica = modificaControllata ?? modificaPropria
  function impostaModifica(v: boolean) {
    setModificaPropria(v)
    onModificaChange?.(v)
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
      <PageHeader percorso={percorso} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold text-balance">{titolo}</h1>
          {distintivo}
        </div>
        <AzioniScheda azioni={[...azioni, toggleModifica]} />
      </div>

      <Tabs defaultValue="anagrafica">
        <TabsList>
          <TabsTrigger value="anagrafica">{etichetteTab?.anagrafica ?? "Anagrafica"}</TabsTrigger>
          <TabsTrigger value="documenti">{etichetteTab?.documenti ?? "Documenti"}</TabsTrigger>
          <TabsTrigger value="storico">{etichetteTab?.storico ?? "Storico"}</TabsTrigger>
        </TabsList>
        <TabsContent value="anagrafica">
          {modifica ? anagrafica.modifica : anagrafica.lettura}
        </TabsContent>
        <TabsContent value="documenti">{documenti}</TabsContent>
        <TabsContent value="storico">
          {storico ? (
            <VersionTimeline
              revisioni={storico.revisioni}
              confrontabile={storico.confrontabile}
              onConfronta={storico.onConfronta}
            />
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  )
}
