import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  CalculatorIcon,
  ExternalLinkIcon,
  FileTextIcon,
  HardHatIcon,
  LayoutDashboardIcon,
  PackageIcon,
  PlusIcon,
} from 'lucide-react'

import { apriCol } from '@/prove/apri'
import { AppShell } from '@/registry/tassullo/blocks/app-shell'
import { BarraContesto, SelettoreContesto, type VoceContesto } from '@/registry/tassullo/blocks/barra-contesto'
import { PageHeader } from '@/registry/tassullo/blocks/page-header'
import { Button } from '@/registry/tassullo/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/tassullo/ui/card'

/**
 * **La fascia che dice su cosa stai lavorando**, e lascia cambiarlo da un
 * menu.
 *
 * ## Perché è entrata (M4ter.9)
 *
 * Cinque pagine di Studio la montano oggi a mano — Computo,
 * TaskCalcoloStrutturale, AnalisiCapitolato, AnalisiProdotto, TaskSearch —
 * per **12 selettori** in tutto (`docs/ANALISI-COPERTURA-APP.md` §1, riga
 * 12). Quello che ci guadagnano passando al registry **non è l'aspetto**: è
 * `Esc`, il fuoco da tastiera e il clic fuori, che una `div` con un menu
 * scritto a mano non ha. È la stessa cosa che la migrazione delle modali
 * chiude in Anagrafe, dove nessuna delle cinque scritte a mano gestisce
 * `Escape`.
 *
 * ## La pagina se lo monta
 *
 * Lo slot in `app-shell` per una fascia persistente fra la testata e
 * `<Outlet/>` **resta sospeso**, con l'innesco scritto in `CHECKLIST.md`:
 * «quando una seconda app ha un contesto attivo che attraversa le pagine».
 * Oggi Anagrafe e Officina un contesto del genere non ce l'hanno, e con un
 * consumatore solo quello che manca allo slot è la sola garanzia di non
 * dimenticarsi una pagina — che non vale un'API in più nel guscio.
 *
 * ## L'emoji non entra
 *
 * La barra di Studio comincia con 📍. La disegna il **sistema operativo**:
 * stessa stringa su due macchine, due disegni diversi — che è l'opposto di un
 * design system, ed è l'obiezione con cui si è chiusa la decisione sul
 * `<select>` nativo (`docs/DECISIONI.md` §42). Il default è `MapPinIcon`,
 * cioè la stessa cosa disegnata da noi, e `icona` prende qualunque Lucide.
 *
 * ## Composizione pura, gradino 2
 *
 * `item` (`ItemMedia variant="icon"` + `ItemContent` + `ItemActions`) più
 * `dropdown-menu`. **Nessuna variante e nessuna taglia nuova** su nessuna
 * delle due primitive: tutto si ottiene dal punto di chiamata.
 *
 * Tre cose che valgono più della composizione, e che si vedono solo
 * misurando:
 *
 * 1. **Il grilletto sta in `ItemActions`, non è la riga intera.** Una fascia
 *    che è un bottone gigante ruba la scena alla pagina — ed è il difetto che
 *    questo blocco esiste per non avere. Dentro un bottone, poi, non ci va
 *    `azioni`.
 * 2. **Il grilletto è `size` di default e non `sm`.** `sm` è `h-7`, cioè
 *    **42px in densità touch**, sotto i 44 che `misura:bersagli` chiede.
 *    `default` è `h-8` → **48 in touch**.
 * 3. **Il pannello dichiara la propria larghezza.** `DropdownMenuContent`
 *    porta `w-(--anchor-width)`: senza `w-64` il menu prende la larghezza del
 *    bottone, e nessun nome di commessa ci sta. Stessa riga del menù utente
 *    del guscio, che si difende con `w-56`.
 *
 * ## Le voci sono dati, non figli
 *
 * `app-shell` prende le voci del menù utente come `ReactNode`. Qui no, perché
 * **questo menu ha uno stato**: una voce è quella attiva e va spuntata. Coi
 * dati il blocco monta un `DropdownMenuRadioGroup`, che porta
 * `role="menuitemradio"`, `aria-checked` e il segno di spunta — cioè proprio
 * la parte che nessuno riscriverebbe uguale cinque volte.
 */
const meta = {
  title: 'Blocchi/Barra di contesto',
  component: BarraContesto,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BarraContesto>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Il **nome** della commessa, senza il codice: è quello che sta in colonna.
 * Nelle app vere codice e nome sono già due campi — qui si separano a mano
 * perché la story parte da una stringa sola.
 */
const nomeDi = (titolo: string) => titolo.split(' — ')[1] ?? titolo

const COMMESSE: VoceContesto[] = [
  {
    id: '2026-114',
    titolo: '2026-114 — Palazzo Roccabruna',
    descrizione: 'Trento, via Santa Trinità · consegna 12/2026',
  },
  {
    id: '2026-092',
    titolo: '2026-092 — Scuola media Bolghera',
    descrizione: 'Trento, via Volta · consegna 06/2027',
  },
  {
    id: '2025-233',
    titolo: '2025-233 — Capannone Pergine lotto B',
    descrizione: 'Pergine Valsugana · in collaudo',
  },
]

/** Il contesto è di chi lo mostra: la story lo tiene per far vedere che cambia. */
function ConStato(props: Partial<React.ComponentProps<typeof BarraContesto>>) {
  const [attiva, setAttiva] = useState(COMMESSE[0].id)
  const voce = COMMESSE.find((c) => c.id === attiva) ?? COMMESSE[0]
  return (
    <BarraContesto
      etichetta="Commessa"
      titolo={voce.titolo}
      descrizione={voce.descrizione}
      icona={HardHatIcon}
      voci={COMMESSE}
      attiva={attiva}
      onCambia={setAttiva}
      etichettaMenu="Commesse aperte"
      {...props}
    />
  )
}

/**
 * **Il caso di Studio**: la commessa attiva in cima al Computo, e il menu per
 * cambiarla.
 *
 * È la scena che dichiara il popup al gate. Il grilletto si passa come
 * **selettore** e lo slot **si guarda nel DOM**: qui `DropdownMenuTrigger`
 * rende *attraverso* `Button`, e nel DOM vince `dropdown-menu-trigger` — come
 * nel menù utente del guscio, e all'opposto del `combobox`, dove
 * `InputGroupButton` si riprende lo slot. Le due composizioni si somigliano e
 * finiscono in modo diverso: è la ragione per cui `apri.ts` vuole un
 * selettore.
 *
 * Quello che il gate **non** misura, e che è stato misurato a mano in
 * Chromium vero (v. `WORKLOG.md`, M4ter.9): `Esc` chiude e **riporta il fuoco
 * al grilletto**, il clic fuori chiude, e il menu si apre da tastiera con
 * `Invio` portando il fuoco sulla prima voce. Nel pannello del browser
 * dell'app queste tre cose sembrerebbero rotte mentre sono sane —
 * `document.visibilityState` è `hidden`, `requestAnimationFrame` non scatta
 * mai, e Base UI ci schedula dentro lo spostamento del fuoco.
 */
export const Predefinita: Story = {
  args: { titolo: '' },
  render: () => <ConStato />,
  play: apriCol('[data-slot="dropdown-menu-trigger"]', 'dropdown-menu-content'),
}

/**
 * **Sola lettura**: una voce sola — o nessuna — e il grilletto non si monta
 * affatto.
 *
 * Non è un caso limite da gestire, è il caso di quattro delle cinque pagine
 * di Studio in un dato momento: l'entità c'è, ma non c'è niente fra cui
 * scegliere. Montare lì un bottone «Cambia» che apre un menu con dentro
 * quello che c'è già scritto sopra è peggio che non montarlo — promette una
 * scelta che non esiste.
 *
 * Senza `descrizione` la fascia si riduce a una riga, ed è la forma più
 * discreta: è così che si guarda la domanda «ruba la scena alla pagina?».
 */
export const SolaLettura: Story = {
  args: {
    etichetta: 'Prodotto',
    titolo: 'Termo Adesivi TA-200',
    icona: PackageIcon,
  },
}

/**
 * **Con un'azione di pagina** accanto al selettore. È il caso di
 * `AnalisiCapitolato`, dove il contesto è il capitolato e l'azione porta al
 * documento d'origine.
 *
 * `azioni` sta **fuori** dal grilletto per una ragione di markup prima che di
 * gusto: con la riga intera come `DropdownMenuTrigger` — la forma che dà il
 * bersaglio più grosso — un bottone qui dentro sarebbe annidato in un altro
 * bottone.
 */
export const ConAzioni: Story = {
  args: { titolo: '' },
  render: () => (
    <ConStato
      azioni={
        <Button variant="ghost">
          <ExternalLinkIcon />
          Apri la scheda
        </Button>
      }
    />
  ),
}

/**
 * **Il nome lungo**, che è il caso in cui una barra scritta a mano si rompe.
 *
 * Due cose cadono nell'ordine giusto, e nessuna delle due è automatica:
 * l'**etichetta del tipo** («Commessa») è `shrink-0` e resta intera, mentre il
 * **nome** ha `truncate` e si accorcia. Al contrario — `truncate` sull'intera
 * stringa — si leggerebbe «Commessa 2026-114 — Ristrutt…», cioè si
 * perderebbe per primo il soggetto. È lo stesso accorgimento che nel piede
 * del guscio fa cadere il cognome e non il nome.
 *
 * **Due classi che sembrano ridondanti e non lo sono**, e questa scena è ciò
 * che le ha trovate — guardandola, non da un gate.
 *
 * `min-w-0` su `ItemContent`: la larghezza minima automatica di un elemento
 * flex è la sua larghezza a contenuto minimo, quindi senza, un nome lungo
 * allarga la riga invece di lasciarsi troncare.
 *
 * `w-full` su `ItemTitle`, che nasce `w-fit`. `width: fit-content` *dovrebbe*
 * fermarsi alla larghezza disponibile; dentro `ItemContent`, che è una colonna
 * flex, risolve invece alla larghezza a **contenuto massimo**. Misurato nel
 * contenitore da 448px qui sotto: `ItemContent` 298.8px e il titolo **668.6**
 * — il nome usciva dalla fascia, passava sotto il bottone «Cambia», e
 * `truncate` non scattava mai perché dal suo punto di vista lo spazio non
 * mancava. Con `w-full` il titolo sta a 298.8, l'etichetta resta intera a
 * 68.7 e il nome si accorcia da 591.9 a **222.2**.
 *
 * Si verifica leggendo `textContent` e i rettangoli di riga
 * (`Range.getClientRects()`) contro la larghezza utile. `scrollWidth >
 * clientWidth` non serve: su una cella con `truncate` i due **coincidono**, e
 * su un testo che va a capo non vede niente — sbagliato due volte, in
 * M4ter.7 e in M4ter.8.
 *
 * La `descrizione` invece non si tronca: `ItemDescription` porta
 * `line-clamp-2`, quindi va a capo una volta e poi si ferma. È il
 * comportamento di shadcn e va bene così — l'altezza resta limitata — ma
 * vuol dire che la fascia stretta è alta tre righe invece di due.
 */
export const NomeLungo: Story = {
  args: {
    etichetta: 'Commessa',
    titolo:
      '2026-114 — Ristrutturazione e adeguamento sismico di Palazzo Roccabruna, corpo A e corpo B',
    descrizione:
      'Trento, via Santa Trinità 24 · committente Provincia autonoma di Trento · consegna prevista 12/2026',
    icona: HardHatIcon,
    voci: COMMESSE,
    attiva: '2026-114',
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        La fascia dentro un contenitore da 448px (<code>max-w-md</code>): l'etichetta resta,
        il nome si accorcia.
      </p>
      <div className="max-w-md">
        <BarraContesto {...args} />
      </div>
      <p className="text-xs text-muted-foreground">
        La stessa a piena larghezza, dove ci sta quasi tutto.
      </p>
      <BarraContesto {...args} />
    </div>
  ),
}

/**
 * **Nel guscio, nella forma scelta il 2026-09-21: due posti, due ruoli.**
 *
 * È la sola condizione in cui si può rispondere alla domanda per cui questo
 * blocco esiste — *dice su cosa stai lavorando senza rubare la scena alla
 * pagina?* — e la risposta, guardata a video con Francesco, non era «sì» né
 * «no»: era che **le cose da dire sono due e vanno divise**.
 *
 * - **Nella colonna, `SelettoreContesto`**: dice *quale*, e lo cambia. È
 *   persistente, si vede da ogni pagina, e collassando la colonna si riduce
 *   alla sua icona. È il `TeamSwitcher` di `@shadcn/sidebar-07`, ricomposto.
 * - **In pagina, `BarraContesto` senza `voci`**: dice *cosa comporta* —
 *   indirizzo, consegna, stato — e **non porta il «Cambia»**. Senza `voci` è
 *   già di sola lettura da sé: nessuna prop nuova.
 *
 * Il difetto che questa divisione toglie si vedeva nell'app vera di Studio,
 * portata da Francesco: «PROGETTO ATTIVO / Prova» nella colonna e «Progetto
 * attivo: Prova» in pagina, a 60px di distanza, **con due grilletti che fanno
 * la stessa cosa**. Fino a quel momento il registry ne conosceva una sola, e
 * lo slot del guscio era differito con l'innesco sbagliato.
 *
 * **Lo slot è una variante, non il nuovo normale**: `AppShell.contesto` è
 * facoltativo, e le app che non hanno un'entità attiva che attraversa le
 * pagine non passano niente. Oggi ce l'ha **solo Studio**.
 *
 * **Due passaggi a video sulla fascia, e in due direzioni opposte** (M4ter.9,
 * restano validi). La prima stesura era `variant="muted"` (`bg-muted/50`,
 * `border-transparent`) e non si vedeva: misurato col colore risolto su
 * canvas, in chiaro il fondo translucido sta a **1.053:1** dalla pagina, il
 * fondo pieno a **1.109**, il bordo a **1.274** — è il **bordo** a portare il
 * salto. Lo conferma il CSS vero di Studio (`CantiereContextBar.css`): fondo
 * `--color-surface-3`, quasi indistinguibile dalla pagina, **più** un bordo.
 * Poi, col fondo pieno, a spiccare troppo era il grilletto — e qui non c'è
 * più, il che è il modo più semplice di chiudere quel rilievo.
 */
export const NelGuscio: Story = {
  args: { titolo: '' },
  parameters: { layout: 'fullscreen' },
  render: function Render() {
    const [attiva, setAttiva] = useState(COMMESSE[0]!.id)
    const voce = COMMESSE.find((c) => c.id === attiva) ?? COMMESSE[0]!
    return (
      <AppShell
        applicazione="Studio"
        collassa="icona"
        contesto={
          <SelettoreContesto
            etichetta="Commessa attiva"
            // **Solo il nome**, senza il codice (scelta di Francesco il
            // 2026-09-21): sta su una riga sola e resta quello che si
            // riconosce a colpo d'occhio. Il codice non sparisce — è nella
            // fascia della pagina, quaranta pixel più a destra, e nel menu.
            titolo={nomeDi(voce.titolo)}
            icona={HardHatIcon}
            voci={COMMESSE}
            attiva={attiva}
            onCambia={setAttiva}
            etichettaMenu="Commesse aperte"
          />
        }
        sezioni={[
          {
            titolo: 'Lavoro',
            voci: [
              { titolo: 'Cruscotto', icona: LayoutDashboardIcon, href: '#' },
              { titolo: 'Computo', icona: CalculatorIcon, href: '#', attiva: true },
              { titolo: 'Capitolati', icona: FileTextIcon, href: '#' },
            ],
          },
        ]}
        utente={{ nome: 'Francesco', cognome: 'Sartori', ruolo: 'Progettista' }}
      >
        <div className="flex flex-col gap-4">
          <PageHeader
            percorso={[{ titolo: 'Commesse', href: '#' }, { titolo: 'Computo' }]}
            azioni={[{ titolo: 'Nuova voce', icona: PlusIcon, ruolo: 'primaria' }]}
          />
          {/*
            Niente `voci`: in pagina la fascia **non** si cambia. Il nome resta
            perché la riga dei dettagli da sola non direbbe di chi sono.
          */}
          <BarraContesto
            etichetta="Commessa"
            titolo={voce.titolo}
            descrizione={voce.descrizione}
            icona={HardHatIcon}
          />
          <Card>
            <CardHeader>
              <CardTitle>Computo metrico estimativo</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              212 voci su 14 sistemi. È questo che deve tenere lo sguardo: la colonna dice
              <em> quale</em> commessa, la fascia <em>cosa comporta</em>, e poi si fanno
              tutte e due da parte.
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  },
}

/**
 * **Un contesto che non è un cantiere**: `icona` prende qualunque Lucide, e
 * `etichetta` qualunque parola. È la stessa fascia di `TaskCalcoloStrutturale`,
 * dove l'entità attiva è un calcolo e non una commessa.
 */
export const AltroContesto: Story = {
  args: {
    etichetta: 'Calcolo',
    titolo: 'CS-2026-41 — Solaio piano primo',
    descrizione: 'Ultima revisione il 18/09/2026 · verificato',
    icona: CalculatorIcon,
    voci: [
      { id: 'CS-2026-41', titolo: 'CS-2026-41 — Solaio piano primo', descrizione: 'verificato' },
      { id: 'CS-2026-38', titolo: 'CS-2026-38 — Travi di copertura', descrizione: 'in revisione' },
    ],
    attiva: 'CS-2026-41',
    etichettaMenu: 'Calcoli della commessa',
  },
}
