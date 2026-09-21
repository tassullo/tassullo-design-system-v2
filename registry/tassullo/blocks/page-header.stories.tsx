import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlusIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react'
import type { ReactNode } from 'react'

import { apriCol } from '@/prove/apri'
import {
  FasciaIntestazione,
  IntestazioneProvider,
  PageHeader,
  type AzionePagina,
  type LivelloPercorso,
  type PageHeaderProps,
} from '@/registry/tassullo/blocks/page-header'
import { Badge } from '@/registry/tassullo/ui/badge'

/**
 * L&apos;**intestazione di pagina**: percorso a sinistra, azioni a destra, una
 * forma sola per tutte le pagine di tutte le app.
 *
 * Non è una barra che si mette *dentro* la pagina: è **la fascia in alto del
 * guscio**, che il guscio disegna e la pagina riempie.
 *
 * ```tsx
 * export function Famiglie() {
 *   return (
 *     <>
 *       <PageHeader
 *         percorso={[{ titolo: 'Prodotti', href: '/prodotti' }, { titolo: 'Famiglie' }]}
 *         azioni={[{ titolo: 'Nuovo prodotto', icona: PlusIcon, ruolo: 'primaria', onClick: apri }]}
 *       />
 *       <TabellaFamiglie />
 *     </>
 *   )
 * }
 * ```
 *
 * ## Il problema che questo blocco risolve
 *
 * `<AppShell>` si monta **una volta sola**, attorno all&apos;`<Outlet />` — o si
 * perderebbe lo stato della colonna a ogni cambio di rotta. La fascia sta
 * dentro il guscio, ma ciò che ci va è della **pagina**, che sta molte righe più
 * in basso e a cui il guscio non può passare prop. shadcn il problema non ce
 * l&apos;ha, perché i suoi blocchi rendono il guscio intero dentro ogni pagina.
 *
 * La pagina quindi **dichiara**, e `PageHeader` rende nella fascia attraverso un
 * **portale**. La strada alternativa — un contesto con uno stato che la pagina
 * aggiorna in un `useEffect` — ha due difetti: le dipendenze sarebbero array
 * scritti inline, cioè nuovi a ogni render (è la trappola di `CLAUDE.md`, quella
 * in cui React non interrompe il ciclo e non stampa niente), e gli `onClick`
 * resterebbero quelli catturati al momento dell&apos;effetto.
 *
 * ## Non c&apos;è un titolo che si vede
 *
 * «Famiglie» comparirebbe **tre volte in 80px**: voce attiva in colonna, ultimo
 * livello del percorso, titolo. È anche la forma di `dashboard-01` di shadcn,
 * che un titolo di pagina non ce l&apos;ha. Tolto, ogni pagina guadagna ~50px di
 * altezza utile. Il titolo resta per **chi non vede lo schermo**: un `h1` in
 * `sr-only`, ricavato dall&apos;ultimo livello del percorso — zero pixel, e la
 * pagina non resta senza intestazione nell&apos;albero dei documenti.
 *
 * ## Le soglie guardano la fascia, non lo schermo
 *
 * Ciò che decide se le azioni ci stanno non è la larghezza dello schermo ma
 * **la larghezza della fascia**, e le due non vanno d&apos;accordo: sotto i
 * 768px la colonna esce dal DOM, quindi passando da 767 a 768 lo schermo si
 * allarga di 1px e la fascia si **restringe** di 255 — di 383 in densità touch.
 * Una regola sulla viewport deve inseguire quella discontinuità, e in M3.1 lo
 * faceva ramificandosi per densità, con dentro una trappola di specificità
 * (`in-data-[density=touch]:` genera `:where()`, che pesa **zero**).
 *
 * Con `@container/fascia` la discontinuità non esiste: **due soglie, nessuna
 * ramificazione**, e la regola vale identica dentro il guscio, fuori dal guscio
 * e a qualunque densità.
 *
 * - **`@md` (448px)** — sotto, i livelli intermedi del percorso entrano dentro
 *   un `…` che **si apre**: non spariscono, si raccolgono in un menu (è la
 *   forma «Breadcrumb with Dropdown» di shadcn). Un percorso che perde dei
 *   livelli su un telefono perde proprio quelli che servono per risalire;
 * - **`@2xl` (672px)** — sotto, le azioni entrano tutte in un solo bottone «⋯».
 *
 * Le soglie misurano il **riquadro di contenuto** della fascia, cioè al netto
 * del `px-4` — che segue la densità: 32px in tutto in normale, 48 in touch.
 * Misurato in Chromium, larghezza utile della fascia nelle otto celle: 1152 e
 * 1008 a 1440px, 736 e 592 a 1024, 480 e 336 a 768, **343 e 327** a 375 — le
 * stesse due cifre che D10 aveva misurato in M3.1 sul contenuto. In tutte e
 * otto la fascia resta **una riga sola** e la pagina non sborda.
 *
 * Un confine si sposta rispetto a M3.1, e va detto: a **1024×touch** le azioni
 * ora entrano nel menu, dove la regola `lg:` le teneva intere. Lì la fascia ha
 * 592px utili; i 1024 di M3.1 erano un compromesso imposto dalla ramificazione
 * per densità, e una soglia sulla fascia non deve farlo. Nelle altre sette
 * celle le due regole danno lo stesso esito.
 *
 * ## La grammatica delle azioni
 *
 * Le azioni si **dichiarano**, non si disegnano: `{ titolo, icona, ruolo }`.
 * L&apos;intestazione deve poterle rendere in due forme, e per farlo deve sapere
 * *cosa* sono. Si dichiara il **ruolo**, non il colore — **una sola `primaria`
 * per pagina**: due bottoni arancioni nella stessa intestazione non sono due
 * azioni importanti, sono zero. Le distruttive sono `destructive`, e mai
 * primarie. `icona` è obbligatoria: quando la fascia è stretta l&apos;azione
 * diventa una riga di menu, e una riga senza icona in un elenco che ne ha resta
 * disallineata.
 *
 * **Taglia normale, non `sm` come nel v1**: `sm` in densità touch fa 42px, cioè
 * sotto i 44 di WCAG e sotto i 48 che il v1 dà a `.btn` in cantiere.
 *
 * **Il glifo del menu è `⋮`, non `⋯`.** Quando la fascia è stretta i menu in
 * barra diventano due — il `…` del percorso, che *naviga*, e quello delle
 * azioni, che *agisce* — e con lo stesso glifo si distinguono solo per
 * posizione. L&apos;ellissi orizzontale resta al percorso (è quella che shadcn
 * mette in `BreadcrumbEllipsis`, e in un percorso significa «altri livelli
 * qui in mezzo»); alle azioni va il **kebab verticale**, che è il segno con cui
 * una barra raccoglie ciò che non ci sta. Stessa distinzione che fa Material
 * fra ellissi e overflow della barra.
 */
const meta = {
  title: 'Blocchi/Intestazione di pagina',
  component: PageHeader,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Il banco: la fascia da sola, senza il guscio attorno.
 *
 * **Perché un banco e non il guscio intero.** Le soglie di questo blocco
 * guardano la larghezza della **fascia**, non quella dello schermo, quindi la
 * forma compatta si può mettere in scena a qualunque viewport — basta stringere
 * il contenitore. È il vantaggio pratico di `@container` su `md:`/`lg:`, e vale
 * anche per il gate: il runner di `addon-vitest` non ha un modo affidabile di
 * cambiare viewport, e un popup che comparisse solo sotto una media query
 * sarebbe un popup che il gate non apre mai.
 *
 * La larghezza del riquadro è **dichiarata sopra la barra**, perché una fascia
 * stretta dentro uno schermo largo, senza didascalia, si legge come un errore
 * invece che come una dimostrazione.
 *
 * Nel guscio il grilletto è `<SidebarTrigger />`; qui non c'è, e con lui non
 * c'è il filo verticale che lo separa dal contenuto — è del guscio, non della
 * pagina.
 */
function Banco({
  larghezza = 'w-full',
  didascalia,
  children,
}: {
  larghezza?: string
  didascalia: string
  children: ReactNode
}) {
  return (
    <IntestazioneProvider>
      <div className="flex flex-col gap-2 p-4">
        <p className="text-xs text-muted-foreground">{didascalia}</p>
        <div className={`overflow-hidden rounded-lg border ${larghezza}`}>
          <FasciaIntestazione />
          {children}
        </div>
      </div>
    </IntestazioneProvider>
  )
}

const PERCORSO: LivelloPercorso[] = [
  { titolo: 'Prodotti', href: '#' },
  { titolo: 'Famiglie' },
]

const PERCORSO_LUNGO: LivelloPercorso[] = [
  { titolo: 'Prodotti', href: '#' },
  { titolo: 'Famiglie', href: '#' },
  { titolo: 'Malte strutturali', href: '#' },
  { titolo: 'Malta strutturale R4 fibrorinforzata' },
]

const AZIONI: AzionePagina[] = [
  { titolo: 'Sistema da BC', icona: RefreshCwIcon, ruolo: 'secondaria' },
  { titolo: 'Nuovo prodotto', icona: PlusIcon, ruolo: 'primaria' },
]

/**
 * La forma piena: percorso intero a sinistra, bottoni interi a destra. È ciò
 * che si vede quando la fascia supera i 672px — sulla scrivania, in tutte e due
 * le densità.
 */
export const Predefinito: Story = {
  args: { percorso: PERCORSO, azioni: AZIONI },
  render: (args) => (
    <Banco didascalia="Fascia larga — la forma piena.">
      <PageHeader {...args} />
    </Banco>
  ),
}

/**
 * Un percorso di quattro livelli. Sopra `@md` è intero; sotto, i livelli
 * intermedi diventano `…` — restano la sezione e la pagina, e l&apos;ultimo
 * livello si tronca con `truncate`, perché è il nome della pagina, cioè la
 * parte che si vuole leggere anche tagliata.
 */
export const PercorsoProfondo: Story = {
  args: { percorso: PERCORSO_LUNGO, azioni: AZIONI },
  render: (args) => (
    <Banco didascalia="Fascia larga — quattro livelli, tutti visibili.">
      <PageHeader {...args} />
    </Banco>
  ),
}

/**
 * **La fascia stretta** e i suoi due menu.
 *
 * 320px in densità normale (`w-80`), cioè sotto tutte e due le soglie: la
 * stessa forma che si ha su uno schermo da 375px, dove la colonna non c&apos;è.
 * Il percorso raccoglie gli intermedi nel `…` e le azioni entrano nel `⋮`.
 *
 * Non serve cambiare viewport per vederlo: le soglie guardano la fascia, e qui
 * la fascia è stretta perché sta in un contenitore stretto. È la ragione
 * pratica per cui `@container` batte `md:`/`lg:` — un blocco che si misura da
 * sé si può anche **provare** da sé.
 *
 * **Le due story che seguono sono la stessa scena**, con gli stessi identici
 * `args`: cambia solo **quale dei due menu è aperto**. Non è una duplicazione
 * per distrazione, ed è il motivo per cui non sono una sola: `apri.ts` apre
 * **un** popup per story, e un popup che il gate non apre è un popup di cui non
 * sa niente — «un popup non aperto non è un popup senza violazioni» è la
 * lezione che la FASE 2 ha pagato due volte (M2.3, M2.6). Da quando i menu in
 * barra sono due, servono due story per misurarli tutti e due aperti.
 */
const STRETTA = {
  percorso: PERCORSO_LUNGO,
  azioni: [...AZIONI, { titolo: 'Elimina', icona: Trash2Icon, ruolo: 'distruttiva' }],
} satisfies Partial<PageHeaderProps>

const bancoStretto = (didascalia: string) => (args: PageHeaderProps) => (
  <Banco larghezza="w-80" didascalia={`Fascia da 320px — ${didascalia}`}>
    <PageHeader {...args} />
  </Banco>
)

/**
 * **Il menu del percorso aperto.** Sotto `@md` i livelli intermedi non
 * spariscono: si raccolgono nel `…`, che è un grilletto. È il difetto che
 * questa story esiste per non far tornare — un percorso che a schermo stretto
 * *perde* dei livelli toglie proprio i salti che servono per risalire, e lì la
 * colonna non c&apos;è.
 *
 * Il glifo è l&apos;ellissi **orizzontale**, quella di `BreadcrumbEllipsis`.
 */
export const StrettaMenuDelPercorso: Story = {
  args: STRETTA,
  render: bancoStretto('aperto il menu del percorso, che contiene i livelli intermedi.'),
  play: apriCol('button:has([data-slot="breadcrumb-ellipsis"])', 'dropdown-menu-content'),
}

/**
 * **Il menu delle azioni aperto** — stessa scena, stessi `args`, l&apos;altro
 * menu. Dentro ci sono tutte le azioni della pagina, distruttiva compresa.
 *
 * Il glifo è il kebab **verticale**: due menu nella stessa barra vogliono due
 * segni diversi, perché uno naviga e l&apos;altro agisce, e con lo stesso segno
 * si distinguerebbero solo per posizione.
 */
export const StrettaMenuDelleAzioni: Story = {
  args: STRETTA,
  render: bancoStretto('aperto il menu delle azioni.'),
  play: apriCol('[aria-label="Altre azioni"]', 'dropdown-menu-content'),
}

/**
 * Senza azioni: resta il solo percorso. È la forma di una pagina che non ha
 * niente da fare — un cruscotto, una scheda in sola lettura.
 */
export const SenzaAzioni: Story = {
  args: { percorso: PERCORSO },
  render: (args) => (
    <Banco didascalia="Fascia larga — nessuna azione dichiarata.">
      <PageHeader {...args} />
    </Banco>
  ),
}

/**
 * Una pagina di primo livello: un livello solo, che è la pagina stessa. Niente
 * separatori, niente collegamenti.
 */
export const LivelloUnico: Story = {
  args: { percorso: [{ titolo: 'Cruscotto' }], azioni: [AZIONI[1]!] },
  render: (args) => (
    <Banco didascalia="Fascia larga — un livello solo, che è la pagina.">
      <PageHeader {...args} />
    </Banco>
  ),
}

/**
 * **Il contatore accanto al nome della pagina.** Officina lo scrive in Triage,
 * Ricambi e Piani — «Segnalazioni da smistare 4» — e fino a M4ter.7 non ci
 * stava: `LivelloPercorso.titolo` era una `string`. Adesso è un `ReactNode`, e
 * a chi passa una stringa non toglie niente.
 *
 * Le due strade erano «il numero va fra le azioni» e questa. Vince questa
 * perché il numero **appartiene al nome della pagina**: un'azione è qualcosa
 * che si clicca, e un conteggio non si clicca.
 *
 * ## Il numero va in un `Badge`, non in testo attenuato — scelto il 2026-09-21
 *
 * Le forme in ballo erano due, e fino a M4ter.11 stavano in due scene: il
 * numero come `<span className="text-muted-foreground">· 4</span>`, che è la
 * forma che Officina scrive oggi, e questa. **Francesco ha scelto il badge**,
 * e la ragione era già misurata: nel testo attenuato il `· 4` prende
 * `oklch(0.5222 0.0072 75.36)`, cioè **esattamente** il colore di «Officina» e
 * del separatore `›`. Si stacca dal nome della pagina — che è a
 * `oklch(0.1913 0 0)` — ma prende il tono dei **livelli che lo precedono**, e
 * si legge quindi come un altro livello del percorso invece che come «quanti
 * ce ne sono». Il badge esce da quella scala di grigi; il prezzo è che pesa un
 * po' di più su una fascia già densa, e si è accettato.
 *
 * La scena del testo attenuato **è stata tolta**, non tenuta accanto: due
 * `PageHeader` nella stessa pagina sono due `<nav>` di percorso con lo stesso
 * nome accessibile, cioè `landmark-unique` — misurato in M4ter.11, 4
 * violazioni su 1508 scansioni — ed è lo stesso motivo per cui le due forme
 * non si erano mai potute affiancare (in M4ter.7 la regola che scattava era
 * `landmark-no-duplicate-banner`). Una scelta chiusa non ha bisogno
 * dell'alternativa in scena: ha bisogno che sia scritto perché.
 *
 * `variant="secondary"`: il badge dice **quanti**, non **quanto è grave**. Un
 * badge pieno del colore del brand accanto al nome della pagina metterebbe sul
 * conteggio un accento che compete con l'azione primaria della fascia.
 *
 * `tabular-nums` perché il numero cambia sotto gli occhi mentre si smista, e
 * una cifra che si allarga fa ballare la riga.
 *
 * **Vale solo sull'ultimo livello.** Un contatore su un livello intermedio
 * finirebbe dentro un `<a>`, cioè dentro il nome accessibile del collegamento:
 * «Prodotti 4» come destinazione non vuol dire niente.
 */
export const Contatore: Story = {
  name: 'Contatore',
  args: {
    percorso: [
      { titolo: 'Officina', href: '#' },
      {
        titolo: (
          <>
            Segnalazioni da smistare{' '}
            <Badge variant="secondary" className="tabular-nums">
              4
            </Badge>
          </>
        ),
      },
    ],
    azioni: [AZIONI[1]!],
  },
  render: (args) => (
    <Banco didascalia="Il conteggio dentro un <Badge variant=&quot;secondary&quot;> — la forma scelta il 2026-09-21.">
      <PageHeader {...args} />
    </Banco>
  ),
}
