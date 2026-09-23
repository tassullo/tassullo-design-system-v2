/**
 * `tassullo-pagina-admin` — l'amministrazione a tab (FASE 4, M4.5).
 *
 * Anagrafe (`Admin.tsx`, 212 righe di CSS) e SuperTM condividono la stessa
 * pagina con la stessa struttura: una fascia di tab per le sezioni
 * dell'amministrazione, e in testa la gestione utenti. Il blocco compone ciò
 * che il registry ha già — `tassullo-page-header`, `tabs`, `alert`,
 * `tassullo-data-table`, `tassullo-confirm-dialog`, `tassullo-responsive-
 * dialog`, `toggle-group`, `badge`, `tassullo-page-skeleton`,
 * `tassullo-error-state` — zero primitive nuove, zero CSS di pagina.
 *
 * ── Cosa possiede il blocco, cosa possiede il chiamante (corretto in M4.5,
 *    seconda passata, su indicazione di Francesco) ────────────────────────
 *
 * Prima versione di questo blocco: la tabella utenti stava nella story, come
 * un tab qualunque passato in `sezioni`. **Corretto**: `PIANO.md` §M4.5 chiede
 * «gestione utenti con ruoli multipli» come capacità **della pagina modello**,
 * col motivo dichiarato che Anagrafe e SuperTM hanno *la stessa pagina* — e un
 * utente (nome, email, ruoli multipli, attivo/disattivo) è la stessa forma in
 * ogni app dello studio, esattamente come lo storico delle revisioni di
 * `tassullo-pagina-scheda`. Quel blocco infatti non lascia `storico` come
 * `ReactNode` libero: monta `VersionTimeline` da sé, perché uno storico di
 * revisioni non ha bisogno di sapere di quale entità sta parlando. `documenti`,
 * invece, resta libero — un allegato di Norma è un PDF, uno di Prodotto una
 * foto — perché lì una forma sola non esiste. La stessa distinzione vale qui:
 *
 *   - **la tabella utenti** sta dalla parte di `storico`: forma fissa (nome,
 *     email, ruoli, stato), quindi il blocco la possiede — `utenti`, sotto,
 *     la monta come **primo tab**, con `data-table` + `menuRiga` + i due
 *     dialoghi (`ResponsiveDialog`/`ToggleGroup multiple` per i ruoli,
 *     `ConfirmDialog` per la rimozione) già dentro.
 *   - **le altre sezioni** (Ruoli, o una terza che un domani si aggiunga)
 *     stanno dalla parte di `documenti`: una tabella ruoli non ha le stesse
 *     colonne di una tabella utenti, e imporne una forma qui vorrebbe dire
 *     indovinarla e sbagliare. `sezioni[].contenuto` resta un `ReactNode`.
 *   - **il banner per l'utente senza permessi** resta del blocco, come prima:
 *     è l'unica capacità indipendente dal dominio.
 *
 * ── `Utente` è fisso, `ruoli` no ───────────────────────────────────────────
 *
 * Il vocabolario dei ruoli è dell'app — Anagrafe e SuperTM non hanno gli
 * stessi — quindi `UtenteAdmin.ruoli` resta `string[]`, mai un'unione chiusa.
 * Ma un ruolo grezzo in UI («materia_prima») è esattamente il difetto già
 * preso in M3bis.11b sui filtri sfaccettati: senza un'etichetta esplicita, la
 * tabella renderebbe la chiave invece della parola italiana. `utenti.ruoli`
 * (sotto, `RuoloAssegnabile[]`) porta quindi `valore`+`etichetta`, con un
 * `tono` **facoltativo** — il vocabolario di `lib/toni` (`Tono`), non un hex:
 * l'app che non vuole pensarci ottiene il neutro, quella che vuole
 * distinguere «Amministratore» da «Lettore» lo dichiara senza dover importare
 * `lib/toni` per costruirsi la classe a mano.
 *
 * ── `onRimuovi`/`onCambiaRuoli` sono callback, non stato interno ──────────
 *
 * Stessa ragione di `onChiudiAvviso` in `tassullo-pagina-dashboard` e di
 * `modifica` in `tassullo-pagina-scheda`: il blocco non sa se una rimozione
 * vada scritta sul server, né se debba passare da una richiesta di conferma
 * a un'altra pagina. Tiene solo lo stato **di interazione** (quale dialogo è
 * aperto, la bozza di ruoli prima del salvataggio) — mai i dati veri, che
 * restano dell'app.
 *
 * ── `soloLettura` degrada anche il tab utenti che ora è del blocco ────────
 *
 * Senza il ruolo di amministrazione: niente `menuRiga` (né tendina «⋯» né
 * tasto destro) sulla tabella utenti, che però resta montata e leggibile —
 * la colonna azioni in meno è il solo segnale della degradazione, non un
 * `if` che sostituisce l'intera sezione con un'altra vista.
 */
import { useMemo, useState, type ComponentType, type ReactNode } from "react"
import { TriangleAlertIcon, Trash2Icon, UserCogIcon, UsersIcon } from "lucide-react"

import { cn } from "cn"
import { ConfirmDialog } from "@/registry/tassullo/blocks/confirm-dialog"
import {
  DataTable,
  IntestazioneColonna,
  RowMenuItem,
  RowMenuSeparator,
  creaColonne,
  useDataTableRow,
} from "@/registry/tassullo/blocks/data-table"
import { ErrorState } from "@/registry/tassullo/blocks/error-state"
import { PageHeader, type AzionePagina, type LivelloPercorso } from "@/registry/tassullo/blocks/page-header"
import { PageSkeleton } from "@/registry/tassullo/blocks/page-skeleton"
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/registry/tassullo/blocks/responsive-dialog"
import { TONO, TONO_ALERT, type Tono } from "@/registry/tassullo/lib/toni"
import { Alert, AlertDescription, AlertTitle } from "@/registry/tassullo/ui/alert"
import { Badge } from "@/registry/tassullo/ui/badge"
import { Button } from "@/registry/tassullo/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/tassullo/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/registry/tassullo/ui/toggle-group"

/** Un'icona Lucide, o qualunque componente che accetti una `className`. */
type Icona = ComponentType<{ className?: string }>

export type SezioneAdmin = {
  /** L'identificatore del tab — stabile, non l'indice: sceglie `TabsTrigger`/`TabsContent`. */
  value: string
  titolo: string
  icona?: Icona
  /**
   * Un solo albero, sempre montato — non due viste diverse fra lettura e
   * amministrazione (stessa correzione di `anagrafica` in
   * `tassullo-pagina-scheda`). Riceve `true` quando chi guarda non ha il
   * ruolo di amministrazione: decide da sé come degradare — perché solo chi
   * scrive la sezione conosce il proprio dominio (una tabella ruoli non ha
   * la stessa forma di una tabella utenti, che invece il blocco possiede
   * già da sé, v. `utenti` sotto).
   */
  contenuto: (soloLettura: boolean) => ReactNode
}

export type UtenteAdmin = {
  /** Stabile, non l'indice: sceglie la riga per `idRiga`/`menuRiga`. */
  id: string
  nome: string
  email: string
  /** Più di uno, non un ruolo solo — il caso che questo blocco esiste per rendere. */
  ruoli: string[]
  attivo: boolean
}

// Su `etichetta`:
//
// La parola italiana. Senza, la tabella renderebbe `valore` grezzo — lo stesso difetto preso in M3bis.11b sui filtri sfaccettati.
export type RuoloAssegnabile = {
  /** La chiave — quella che compare in `UtenteAdmin.ruoli`. */
  valore: string
  /** La parola italiana. Senza, la tabella mostrerebbe `valore` grezzo. */
  etichetta: string
  /** Il vocabolario di `lib/toni`. Assente, il neutro — l'app che non vuole distinguere i ruoli a colpo d'occhio non deve importare `lib/toni` per dirlo. */
  tono?: Tono
}

export type SezioneUtentiAdmin = {
  dati: UtenteAdmin[]
  /** I ruoli assegnabili — anche quando un utente ne porta uno che non è più in lista (v. `RuoliUtente`, che ricade sul valore grezzo solo in quel caso limite). */
  ruoli: RuoloAssegnabile[]
  /** Chiamata dopo la conferma di `ConfirmDialog` — il blocco non sa se debba toccare il server. */
  onRimuovi: (id: string) => void
  /** Chiamata al «Salva» del dialogo Ruoli, con l'elenco intero (non la differenza). */
  onCambiaRuoli: (id: string, ruoli: string[]) => void
  /** L'etichetta del tab. Di default "Utenti". */
  titolo?: string
  /** Il placeholder della ricerca. */
  cerca?: string
}

export type PaginaAdminProps = {
  /** Il percorso dell'intestazione — passa a `PageHeader`, che lo porta nella fascia. */
  percorso: LivelloPercorso[]
  /**
   * Le azioni di pagina. Il blocco non le filtra da sé quando `soloLettura`
   * è vero — non sa se un'azione tocchi l'amministrazione o no — quindi è
   * il chiamante a non passarle (v. la story `SenzaPermessi`).
   */
  azioni?: AzionePagina[]
  /**
   * La gestione utenti, montata come **primo tab** quando presente — v. il
   * commento di testa per la ragione (stessa forma in ogni app, come lo
   * storico di `tassullo-pagina-scheda`). Assente, nessun tab utenti.
   */
  utenti?: SezioneUtentiAdmin
  /** Le altre sezioni della fascia a tab, dopo «Utenti» — l'ordine è quello di rendering. */
  sezioni?: SezioneAdmin[]
  /** Il tab aperto all'avvio. Assente, «Utenti» se presente, altrimenti il primo di `sezioni`. */
  sezioneIniziale?: string
  /**
   * `true` quando chi apre la pagina non ha il ruolo di amministrazione: la
   * pagina mostra il banner fisso, la tabella utenti perde `menuRiga`, e
   * ogni `sezioni[].contenuto` riceve `true` e decide da sé come degradare.
   * Assente, `false`.
   */
  soloLettura?: boolean
  /** Il testo del banner. Di default parla di "amministrazione", non del dominio di una sezione in particolare. */
  messaggioSoloLettura?: ReactNode
  /** Uno dei tre stati. `pronto` di default: solo lì il resto delle prop conta. */
  stato?: "pronto" | "caricamento" | "errore"
  /** Il messaggio d'errore, già tradotto — mai un codice, mai uno stack. */
  messaggioErrore?: ReactNode
  onRiprovaErrore?: () => void
  className?: string
}

/**
 * I ruoli di un utente, come fila di `Badge` — mai una stringa unita da
 * virgole, mai una sola pillola: sono di più, e devono leggersi come tali.
 * Un valore che non è più fra `ruoli` (un ruolo cancellato dopo l'assegnazione)
 * ricade sul valore grezzo, non sparisce: un utente non perde in silenzio
 * l'informazione di avere ancora quel ruolo.
 */
function RuoliUtente({ ruoli, mappa }: { ruoli: string[]; mappa: Map<string, RuoloAssegnabile> }) {
  if (ruoli.length === 0) return <span className="text-muted-foreground">Nessun ruolo</span>
  return (
    <div className="flex flex-wrap gap-1">
      {ruoli.map((r) => {
        const ruolo = mappa.get(r)
        return (
          <Badge key={r} className={TONO[ruolo?.tono ?? "neutro"]}>
            {ruolo?.etichetta ?? r}
          </Badge>
        )
      })}
    </div>
  )
}

/**
 * Il menu di riga — una sola definizione, montata sia nella tendina «⋯» sia
 * sul tasto destro (`tassullo-data-table`, M3bis.9). I due dialoghi vivono
 * fuori, nel componente che segue: cliccando la voce il menu si chiude e li
 * smonterebbe (`confirm-dialog.tsx`, la stessa nota di `PaginaProdotti`).
 */
function MenuAzioniUtente({
  onCambiaRuoli,
  onRimuovi,
}: {
  onCambiaRuoli: (utente: UtenteAdmin) => void
  onRimuovi: (utente: UtenteAdmin) => void
}) {
  const utente = useDataTableRow<UtenteAdmin>()
  return (
    <>
      <RowMenuItem onClick={() => onCambiaRuoli(utente)}>
        <UserCogIcon aria-hidden />
        Ruoli…
      </RowMenuItem>
      <RowMenuSeparator />
      {/* `variant="destructive"`, non una classe di colore — la trappola di
          `CLAUDE.md` sul testo di `--destructive`. */}
      <RowMenuItem variant="destructive" onClick={() => onRimuovi(utente)}>
        <Trash2Icon aria-hidden />
        Rimuovi
      </RowMenuItem>
    </>
  )
}

const colUtenti = creaColonne<UtenteAdmin>()

/** Il tab «Utenti» — v. il commento di testa per perché il blocco lo possiede. */
function TabUtenti({ sezione, soloLettura }: { sezione: SezioneUtentiAdmin; soloLettura: boolean }) {
  const [inModificaRuoli, setInModificaRuoli] = useState<UtenteAdmin | null>(null)
  const [ruoliBozza, setRuoliBozza] = useState<string[]>([])
  const [inRimozione, setInRimozione] = useState<UtenteAdmin | null>(null)

  const mappaRuoli = useMemo(
    () => new Map(sezione.ruoli.map((r) => [r.valore, r])),
    [sezione.ruoli],
  )

  /**
   * I `useMemo` qui non sono ottimizzazione, ed è la stessa nota che
   * `tassullo-data-table` porta su `colonneEffettive`: `colonne` e `menuRiga`
   * che cambiano identità a ogni render farebbero ricostruire la tabella, e
   * questo componente ri-renderizza a ogni apertura di dialogo. Ogni altra
   * tabella del registry tiene le colonne in una costante di modulo; qui non
   * si può, perché dipendono dai ruoli che arriva dal chiamante — la forma
   * equivalente è memorizzarle su quelli.
   */
  const colonne = useMemo(() => colUtenti.columns([
    colUtenti.accessor("nome", {
      header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Nome" />,
      meta: { titolo: "Nome" },
      sortFn: "text",
    }),
    colUtenti.accessor("email", {
      header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Email" />,
      meta: { titolo: "Email" },
      sortFn: "text",
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
    }),
    colUtenti.accessor("ruoli", {
      header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Ruoli" />,
      meta: { titolo: "Ruoli" },
      cell: ({ getValue }) => <RuoliUtente ruoli={getValue<string[]>()} mappa={mappaRuoli} />,
    }),
    colUtenti.accessor("attivo", {
      header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Stato" />,
      meta: { titolo: "Stato" },
      sortFn: "basic",
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Badge className={TONO.success}>Attivo</Badge>
        ) : (
          <Badge className={TONO.neutro}>Disattivo</Badge>
        ),
    }),
  ]), [mappaRuoli])

  const menuRiga = useMemo(
    () =>
      soloLettura
        ? undefined
        : {
            menu: <MenuAzioniUtente onCambiaRuoli={apriRuoli} onRimuovi={setInRimozione} />,
            ariaLabel: (u: UtenteAdmin) => `Azioni su ${u.nome}`,
          },
    [soloLettura],
  )

  function apriRuoli(utente: UtenteAdmin) {
    setInModificaRuoli(utente)
    setRuoliBozza(utente.ruoli)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {sezione.dati.length} {sezione.dati.length === 1 ? "utente" : "utenti"}
      </p>

      <DataTable
        colonne={colonne}
        dati={sezione.dati}
        idRiga={(u) => u.id}
        cerca={sezione.cerca ?? "Cerca nome o email…"}
        nomeRighe={{ singolare: "utente", plurale: "utenti" }}
        menuRiga={menuRiga}
      />

      {/* Il grilletto non può stare dentro la voce di menu: v. il commento
          di testa di `confirm-dialog`. Stato tenuto qui, dialoghi controllati. */}
      <ResponsiveDialog
        open={!!inModificaRuoli}
        onOpenChange={(aperto) => {
          if (!aperto) setInModificaRuoli(null)
        }}
      >
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Ruoli</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>{inModificaRuoli?.nome ?? ""}</ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody>
            {/* Un utente ha più ruoli: `multiple` li somma, non li sostituisce
                uno con l'altro come farebbe una scelta singola. */}
            <ToggleGroup
              multiple
              variant="outline"
              value={ruoliBozza}
              onValueChange={(v) => setRuoliBozza(v as string[])}
              aria-label="Ruoli dell'utente"
              className="flex-wrap"
            >
              {sezione.ruoli.map((r) => (
                <ToggleGroupItem key={r.valore} value={r.valore}>
                  {r.etichetta}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </ResponsiveDialogBody>
          <ResponsiveDialogFooter>
            <ResponsiveDialogClose render={<Button variant="outline">Annulla</Button>} />
            <Button
              onClick={() => {
                if (!inModificaRuoli) return
                sezione.onCambiaRuoli(inModificaRuoli.id, ruoliBozza)
                setInModificaRuoli(null)
              }}
            >
              Salva
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      <ConfirmDialog
        titolo="Rimuovere l'utente?"
        descrizione={inRimozione ? `${inRimozione.nome} perderà l'accesso subito.` : undefined}
        conferma="Rimuovi"
        tono="distruttivo"
        aperto={!!inRimozione}
        onApertoChange={(aperto) => {
          if (!aperto) setInRimozione(null)
        }}
        onConferma={() => {
          if (!inRimozione) return
          sezione.onRimuovi(inRimozione.id)
          setInRimozione(null)
        }}
      />
    </div>
  )
}

export function PaginaAdmin({
  percorso,
  azioni,
  utenti,
  sezioni = [],
  sezioneIniziale,
  soloLettura = false,
  messaggioSoloLettura = "Puoi consultare questa pagina ma non modificarla: non hai il ruolo di amministrazione.",
  stato = "pronto",
  messaggioErrore = "Non è stato possibile caricare l'amministrazione. Riprova.",
  onRiprovaErrore,
  className,
}: PaginaAdminProps) {
  if (stato === "caricamento") {
    return (
      <div data-slot="pagina-admin" className={cn("flex flex-col gap-4", className)}>
        <PageHeader percorso={percorso} />
        <PageSkeleton variante="tabella" />
      </div>
    )
  }

  if (stato === "errore") {
    return (
      <div data-slot="pagina-admin" className={cn("flex flex-col gap-4", className)}>
        <PageHeader percorso={percorso} />
        <ErrorState messaggio={messaggioErrore} onRiprova={onRiprovaErrore} />
      </div>
    )
  }

  // Il tab «Utenti» è del blocco (v. il commento di testa): quando `utenti`
  // è passato, si monta per primo, davanti a `sezioni`.
  const tuttiITab: SezioneAdmin[] = utenti
    ? [
        {
          value: "utenti",
          titolo: utenti.titolo ?? "Utenti",
          icona: UsersIcon,
          contenuto: (soloLetturaTab) => <TabUtenti sezione={utenti} soloLettura={soloLetturaTab} />,
        },
        ...sezioni,
      ]
    : sezioni

  return (
    <div data-slot="pagina-admin" className={cn("flex flex-col gap-4", className)}>
      <PageHeader percorso={percorso} azioni={azioni} />

      {soloLettura ? (
        <Alert className={TONO_ALERT.warning}>
          <TriangleAlertIcon />
          <AlertTitle>Accesso in sola lettura</AlertTitle>
          <AlertDescription>{messaggioSoloLettura}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue={sezioneIniziale ?? tuttiITab[0]?.value}>
        <TabsList>
          {tuttiITab.map((s) => (
            <TabsTrigger key={s.value} value={s.value}>
              {s.icona ? <s.icona /> : null}
              {s.titolo}
            </TabsTrigger>
          ))}
        </TabsList>
        {tuttiITab.map((s) => (
          <TabsContent key={s.value} value={s.value}>
            {s.contenuto(soloLettura)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
