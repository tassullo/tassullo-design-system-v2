import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { BookOpenIcon, DownloadIcon, FileTextIcon, TrashIcon } from 'lucide-react'

import { AppShell, type SezioneNav } from '@/registry/tassullo/blocks/app-shell'
import { FormField } from '@/registry/tassullo/blocks/form-field'
import type { VersionTimelineEntry } from '@/registry/tassullo/blocks/version-timeline'
import { PaginaScheda } from '@/registry/tassullo/pages/pagina-scheda'
import { Button } from '@/registry/tassullo/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/registry/tassullo/ui/item'
import { FieldGroup } from '@/registry/tassullo/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/registry/tassullo/ui/select'
import { Input } from '@/registry/tassullo/ui/input'
import { Textarea } from '@/registry/tassullo/ui/textarea'

/**
 * **M4.3 — terza pagina modello.** `PaginaScheda` compone ciò che il
 * registry ha già — `page-header`, `tabs`, `card`, `version-timeline`,
 * `page-skeleton`, `error-state` — nella forma che si ripete quattro volte
 * in Anagrafe: Prodotto, Famiglia, Sistema, Norma. È il file CSS più grande
 * del progetto (`Prodotto.css`, 201 righe), qui senza una riga di CSS di
 * pagina.
 *
 * Il caso qui è **Norma**, la stessa entità di `Pagine/Lista` (M4.2): il
 * codice della colonna "Codice" è il varco a questa scheda, la stessa
 * story dimostra il ritorno.
 *
 * ## Le due sostanze di "intestazione"
 *
 * `PageHeader` (M3.2) porta il `percorso` nella fascia in alto — **senza**
 * titolo visibile, perché lì comparirebbe tre volte in 80px. Il titolo
 * dell'entità, il suo distintivo di stato e le azioni **si vedono**, ma
 * dentro il contenuto della pagina: sono due intestazioni diverse, non la
 * stessa spostata.
 *
 * ## Un solo form, disabilitato — non due viste
 *
 * Rilievo di Francesco sulla prima versione (che aveva `lettura` e
 * `modifica` come due alberi distinti): un campo che cambia forma da testo
 * a riquadro al clic su "Modifica" fa muovere l'intera scheda, ed è un
 * salto che un form vero non fa. Qui è **un solo `<form>`**, sempre montato
 * con gli stessi `tassullo-form-field`: gli `Input` restano `disabled`
 * finché la scheda non è in modifica. Confrontato anche con `Prodotto.tsx`
 * di Anagrafe: il contenuto sta dentro un riquadro bianco (`Card`), non a
 * contatto diretto con lo sfondo grigio della pagina.
 */
const meta = {
  title: 'Pagine/Scheda',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SEZIONI: SezioneNav[] = [
  {
    voci: [
      {
        titolo: 'Riferimenti',
        icona: BookOpenIcon,
        attiva: true,
        figli: [
          { titolo: 'Norme', href: '#', attiva: true },
          { titolo: 'Caratteristiche', href: '#' },
          { titolo: 'Organismi notificati', href: '#' },
        ],
      },
    ],
  },
]

const UTENTE = {
  nome: 'Francesco',
  cognome: 'Sartori',
  email: 'fsartori@covicostruzioni.it',
  ruolo: 'Admin',
}

/* ────────────────────────────────────────────────────────────────────────
 * I dati finti — la stessa norma UNI EN 1090 usata come esempio in
 * `Blocchi/Timeline delle revisioni`, per coerenza fra le vetrine.
 * ──────────────────────────────────────────────────────────────────────── */

const NORMA_SCHEMA = z.object({
  codice: z.string().min(1, 'Il codice è obbligatorio'),
  titolo: z.string().min(1, 'Il titolo è obbligatorio'),
  ente: z.string().min(1, "L'ente è obbligatorio"),
  stato: z.enum(['vigente', 'in-revisione', 'abrogata']),
  note: z.string().max(2048, 'Le note superano i 2048 caratteri consentiti').optional(),
})
type NormaModulo = z.infer<typeof NORMA_SCHEMA>

/**
 * Il vocabolario di stato **di questa entità**. Non sta nel blocco, ed è la
 * stessa ragione per cui non ci stava il `distintivo` che c'era prima: un
 * prodotto è «attivo» o «superato», una norma «vigente» o «abrogata», un
 * sistema «in produzione» o «in sviluppo» — quattro entità, quattro vocabolari
 * senza un denominatore comune. Il blocco riceve `anagrafica` come funzione:
 * cosa ci sia dentro, e quali valori abbia, lo sa solo l'app.
 */
const STATI: { valore: NormaModulo['stato']; etichetta: string }[] = [
  { valore: 'vigente', etichetta: 'Vigente' },
  { valore: 'in-revisione', etichetta: 'In revisione' },
  { valore: 'abrogata', etichetta: 'Abrogata' },
]

const NORMA: NormaModulo = {
  codice: 'UNI EN 1090',
  titolo: 'Esecuzione di strutture di acciaio e di alluminio',
  ente: 'UNI',
  stato: 'vigente',
  note: 'Recepisce EN 1090-2 e -3. Applicabile alle strutture portanti in acciaio strutturale.',
}

const REVISIONI: VersionTimelineEntry[] = [
  {
    id: '5',
    versione: 'Rev. 5',
    stato: 'in-revisione',
    autore: 'Francesco Sartori',
    data: new Date('2026-09-14'),
    descrizione: 'Aggiornato il riferimento alla marcatura CE dopo il regolamento prodotti da costruzione.',
  },
  {
    id: '4',
    versione: 'Rev. 4',
    stato: 'approvato',
    autore: 'Roberto Zanetti',
    data: new Date('2026-07-02'),
    descrizione: 'Aggiunta la classe di esecuzione EXC3 per le strutture sismiche.',
  },
  {
    id: '3',
    versione: 'Rev. 3',
    stato: 'superato',
    autore: 'Francesco Sartori',
    data: new Date('2026-02-18'),
  },
]

/**
 * Lo stesso albero in lettura e in modifica: `disabled={!modifica}` su ogni
 * campo, mai un componente diverso. `Annulla` scarta le modifiche non
 * salvate (`form.reset(dati)`), non solo esce dalla modalità — altrimenti
 * riaprendo "Modifica" si ritroverebbero i valori scartati.
 */
function AnagraficaForm({
  dati,
  modifica,
  onSalva,
  onAnnulla,
}: {
  dati: NormaModulo
  modifica: boolean
  onSalva: (dati: NormaModulo) => void
  onAnnulla: () => void
}) {
  const form = useForm<NormaModulo>({
    resolver: zodResolver(NORMA_SCHEMA),
    defaultValues: dati,
  })

  // Rientrando in modifica (o dopo un salvataggio, che la torna a `pronto`)
  // il form riparte dai dati correnti — non da un residuo di una modifica
  // scartata in un giro precedente.
  useEffect(() => {
    if (modifica) form.reset(dati)
  }, [modifica, dati, form])

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit((valori) => onSalva(valori))}
    >
      {/*
        Tre righe, non una griglia libera: **codice, ente e stato** stanno
        insieme perché sono le tre chiavi brevi con cui la norma si identifica;
        **titolo** e **note** prendono la riga intera perché sono testo, e un
        testo lungo in mezza colonna va a capo tre volte in più. La soglia è
        `@lg` del `FieldGroup`, cioè una **container query**: la stessa scheda
        dentro un pannello stretto torna a una colonna senza sapere quanto è
        larga la finestra.
      */}
      <FieldGroup className="grid grid-cols-1 gap-4 @lg/field-group:grid-cols-3">
        <FormField control={form.control} nome="codice" etichetta="Codice">
          {(campo) => <Input {...campo} autoComplete="off" disabled={!modifica} />}
        </FormField>
        <FormField control={form.control} nome="ente" etichetta="Ente">
          {(campo) => <Input {...campo} autoComplete="off" disabled={!modifica} />}
        </FormField>
        {/*
          **Lo stato è un campo, e si modifica** (2026-09-21, indirizzo di
          Francesco). Prima era un `<Badge>` appeso al titolo: l'unico dato
          della pagina senza un'etichetta che dicesse di che cosa fosse il
          valore, e per giunta in sola lettura in una pagina che ha un
          «Modifica». Qui è un `FormField` come gli altri, con lo stesso
          `disabled={!modifica}`: in lettura mostra il valore, in modifica si
          apre. È anche la ragione per cui non può stare nel blocco — v. il
          commento su `STATI`.
        */}
        <FormField control={form.control} nome="stato" etichetta="Stato">
          {({ onChange, value, ...campo }) => (
            <Select value={value} onValueChange={onChange} disabled={!modifica}>
              <SelectTrigger {...campo}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATI.map((s) => (
                  <SelectItem key={s.valore} value={s.valore}>
                    {s.etichetta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>
        <div className="@lg/field-group:col-span-3">
          <FormField control={form.control} nome="titolo" etichetta="Titolo">
            {(campo) => <Input {...campo} autoComplete="off" disabled={!modifica} />}
          </FormField>
        </div>
        <div className="@lg/field-group:col-span-3">
          {/*
            **Niente riga d'aiuto col limite** (2026-09-21, indirizzo di
            Francesco). Il limite c'è — `z.string().max(2048)` — e si fa vivo
            **quando serve**, come errore sotto il campo, con il testo che lo
            schema già scrive. Dirlo in anticipo sotto ogni campo è una riga
            che chi compila salta dopo la seconda volta e che intanto raddoppia
            l'altezza del modulo: è esattamente il «quasi sempre non si usa»
            che `form-field.tsx` scrive su `descrizione`.
          */}
          <FormField control={form.control} nome="note" etichetta="Note">
            {(campo) => (
              <Textarea
                {...campo}
                rows={3}
                disabled={!modifica}
                // **In lettura l'altezza tirata a mano si butta via.**
                // `textarea` ha la maniglia di ridimensionamento, e il browser
                // scrive l'altezza scelta in uno `style` **in linea** che
                // sopravvive all'uscita dalla modifica. Finché la si allarga
                // non fa danni; tirandola **sotto** il contenuto il testo
                // resta tagliato — misurato: maniglia a 43px, `min-h-16` la
                // riporta a 64, contenuto 72, **10px fuori** — e in lettura il
                // campo è `disabled`, quindi la maniglia non c'è più e da
                // tastiera non ci si scorre dentro. `h-auto!` scavalca lo
                // stile in linea (una classe `!important` vince su uno stile
                // in linea non importante) e lascia lavorare
                // `field-sizing-content`, che la primitiva ha già: in lettura
                // il campo è sempre alto quanto il suo testo.
                className={modifica ? undefined : 'h-auto!'}
              />
            )}
          </FormField>
        </div>
      </FieldGroup>
      {modifica ? (
        <div className="flex gap-2">
          <Button type="submit">Salva</Button>
          <Button type="button" variant="outline" onClick={onAnnulla}>
            Annulla
          </Button>
        </div>
      ) : null}
    </form>
  )
}

const ALLEGATI = [
  { nome: 'UNI_EN_1090-2_2018.pdf', dimensione: '2,4 MB' },
  { nome: 'Rapporto_prova_2026-04.pdf', dimensione: '860 KB' },
]

/**
 * **M4.7**: era una `<ul>` con `rounded-lg border p-3` scritti a mano — cioè
 * esattamente il pattern che la primitiva `item` copre, e che nelle tre app
 * ricorre in ~160 selettori CSS. Ora è composizione: `ItemGroup` porta da sé
 * `role="list"`, `ItemMedia`/`ItemContent`/`ItemActions` mettono icona, testo
 * e bottone al loro posto, e non resta nessuna classe di struttura nostra.
 */
function Documenti() {
  return (
    <ItemGroup>
      {ALLEGATI.map((file) => (
        <Item key={file.nome} role="listitem" variant="outline">
          <ItemMedia variant="icon">
            <FileTextIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{file.nome}</ItemTitle>
            <ItemDescription>{file.dimensione}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="ghost" size="icon" aria-label={`Scarica ${file.nome}`}>
              <DownloadIcon />
            </Button>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  )
}

function Scheda({ stato }: { stato?: 'pronto' | 'caricamento' | 'errore' }) {
  const [dati, setDati] = useState(NORMA)
  const [inModifica, setInModifica] = useState(false)

  return (
    <PaginaScheda
      percorso={[{ titolo: 'Norme', href: '#' }, { titolo: dati.codice }]}
      azioni={[{ titolo: 'Elimina', icona: TrashIcon, ruolo: 'distruttiva' }]}
      stato={stato}
      // `modifica` è controllata qui: è la story (che sa quando il
      // "salvataggio" finto è riuscito) a decidere di tornare alla
      // lettura, esattamente come farebbe l'app vera al successo della
      // propria mutation.
      modifica={inModifica}
      onModificaChange={setInModifica}
      anagrafica={(modifica) => (
        <AnagraficaForm
          dati={dati}
          modifica={modifica}
          onSalva={(nuovi) => {
            setDati(nuovi)
            setInModifica(false)
          }}
          onAnnulla={() => setInModifica(false)}
        />
      )}
      documenti={<Documenti />}
      storico={{ revisioni: REVISIONI }}
    />
  )
}

function Guscio({ stato }: { stato?: 'pronto' | 'caricamento' | 'errore' }) {
  return (
    <AppShell applicazione="Anagrafe" collassa="icona" utente={UTENTE} sezioni={SEZIONI}>
      <Scheda stato={stato} />
    </AppShell>
  )
}

/**
 * Il caso comune: campi disabilitati e storico su tre revisioni.
 *
 * **La pagina non ha un'intestazione propria** (2026-09-21): il nome della
 * norma si legge nel percorso della fascia, «Elimina» e «Modifica» stanno
 * accanto a lui, e lo stato è un campo della scheda Anagrafica come gli altri.
 * Il perché delle tre cose sta in testa a `pagina-scheda.tsx`.
 */
export const ConDati: Story = {
  render: () => <Guscio />,
}

/** `stato="caricamento"`: `PageSkeleton` (`variante="scheda"`) al posto del contenuto. */
export const Caricamento: Story = {
  render: () => <Guscio stato="caricamento" />,
}

/** `stato="errore"`: la chiamata che carica la scheda è fallita. */
export const Errore: Story = {
  render: () => <Guscio stato="errore" />,
}

/**
 * Storico confrontabile: due revisioni si selezionano e "Confronta" si
 * abilita — la diff vera è compito di `diff-view` (M3.9), qui il blocco si
 * ferma alla scelta, come documenta `version-timeline.stories.tsx`.
 */
export const StoricoConfrontabile: Story = {
  render: () => (
    <AppShell applicazione="Anagrafe" collassa="icona" utente={UTENTE} sezioni={SEZIONI}>
      <PaginaScheda
        percorso={[{ titolo: 'Norme', href: '#' }, { titolo: NORMA.codice }]}
        anagrafica={(modifica) => (
          <AnagraficaForm dati={NORMA} modifica={modifica} onSalva={() => {}} onAnnulla={() => {}} />
        )}
        storico={{ revisioni: REVISIONI, confrontabile: true }}
      />
    </AppShell>
  ),
}
