import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  CopyIcon,
  DownloadIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  UserIcon,
} from 'lucide-react'

import { Button } from '@/registry/tassullo/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/registry/tassullo/ui/dropdown-menu'

/**
 * **Due ri-stili, e il primo è un difetto vero del preset.**
 *
 * 1. **`variant="destructive"` scriveva il testo in `text-destructive`**, cioè
 *    nel rosso pieno che è un colore da **fondo**. È la terza volta che lo
 *    stesso errore ricompare — `badge` in M2.1, `field` in M2.2, i due menu
 *    qui — ed è esattamente la trappola scritta nel `CLAUDE.md`. Corretto in
 *    `text-destructive-subtle-foreground`, il token che il v1 chiamava
 *    `--color-danger-text`, nelle tre occorrenze: testo a riposo, testo col
 *    fuoco, icona.
 * 2. **`min-w-[96px]`** sul sottomenu → `min-w-24`. Stesso pixel al gradino
 *    normale, ma ora è del tema e segue la densità come tutto il resto.
 *
 * ## Un requisito d'uso che shadcn non documenta, e che **schianta la pagina**
 *
 * **`DropdownMenuLabel` va messo dentro un `DropdownMenuGroup`** (o dentro un
 * `DropdownMenuRadioGroup`). Sotto c'è `Menu.GroupLabel` di Base UI, che
 * **lancia** se non trova il contesto del gruppo: «MenuGroupContext is
 * missing», errore #31. Il menu non si apre affatto e la story sparisce.
 *
 * Non è un difetto del ri-stile e non si vede leggendo il componente: si vede
 * solo aprendo il menu. Gli esempi di shadcn mettono `DropdownMenuLabel` in
 * cima al contenuto, fuori da qualsiasi gruppo — cioè nella forma che
 * fallisce. **Quattro story su cinque, in questa sessione, erano scritte così
 * e sono crollate all'apertura.** È lo stesso genere di rilievo del `select`
 * che vuole `items` (M2.2), ma peggiore: lì il campo mostrava il valore
 * grezzo, qui non c'è più niente da mostrare.
 *
 * ## Da tastiera, che è il criterio di accettazione
 *
 * `Invio` o `↓` sul grilletto apre e porta il fuoco sulla prima voce;
 * `↑`/`↓` scorrono e ciclano; le **lettere** saltano alla voce che comincia
 * così — e più lettere di fila si accumulano in una parola, quindi «d» poi
 * «e» cerca «de», non «e»; `→` entra nel sottomenu, `←` ne esce; `Esc` chiude
 * e **riporta il fuoco sul grilletto**.
 *
 * ## Due misure che questa pagina consegna a M2.9
 *
 * 1. **axe dà `aria-hidden-focus` × 6 su ogni menu aperto, in entrambe le
 *    modalità, e non è chiudibile qui.** I sei nodi sono i **guardiani del
 *    fuoco di Base UI** — `<span aria-hidden="true" tabindex="0"
 *    data-base-ui-focus-guard>` — cioè proprio il meccanismo che fa girare il
 *    `Tab` dentro al menu. Sono generati dalla libreria, non dal ri-stile, e
 *    non compaiono in nessuna stringa di classi: la regola 4bis non lascia
 *    modo di toccarli. Il `dialog` monta gli stessi guardiani ma lì axe li
 *    marca *incomplete* invece che violazione, perché portano anche
 *    `data-base-ui-inert`. È un falso positivo noto verso questa famiglia di
 *    librerie; **M2.9 dovrà decidere se esentare la regola** quando axe passa
 *    in CI, o la CI nasce rossa.
 *
 *    Da sapere: queste violazioni **non si vedevano prima di M2.3**, perché
 *    fino a qui i popup non si riuscivano ad aprire in fase di misura. Aprire
 *    i popup cambia il registro, e M2.9 parte da questo.
 *
 * 2. **La voce di menu è il bersaglio più piccolo del set in densità touch**:
 *    **36px**, contro i 48 di bottone, campo e select. Passa WCAG 2.5.8 (24px
 *    minimi) ma sta sotto i 44 che M2.9 chiederà. Il rimedio è una stringa di
 *    classi sola — `py-1` → **`py-2`**, misurata: **48px esatti in touch**,
 *    33 in normale contro gli attuali 25 — ma alza tutti i menu di tutte le
 *    app anche alla densità da scrivania, quindi è una scelta di sistema come
 *    le costanti della sidebar, non una correzione da fare di passaggio.
 *
 * **Le voci disabilitate prendono il fuoco, e va bene così.** Misurato: la
 * freccia si ferma sulla voce disabilitata, che porta `aria-disabled="true"`,
 * e `Invio` non la attiva — il menu resta aperto. È il comportamento
 * dell'ARIA Authoring Practices, ed è quello giusto: una voce che il fuoco
 * salta è una voce che chi non vede non sa che esista. Saltarla nasconderebbe
 * che l'azione c'è ma non è disponibile, che di solito è proprio ciò che si
 * vuole comunicare — «Pubblica» esiste, serve il ruolo Redattore.
 */
const meta = {
  title: 'Primitive/Dropdown Menu',
  component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        Azioni
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <PencilIcon />
          Modifica
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CopyIcon />
          Duplica
        </DropdownMenuItem>
        <DropdownMenuItem>
          <DownloadIcon />
          Esporta in PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2Icon />
          Elimina
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

/**
 * Il menu di riga di una tabella: grilletto a sola icona, quindi con un nome
 * accessibile scritto a mano (`sr-only`). Senza, si annuncia «pulsante» e
 * basta — ed è la forma in cui `data-table` (M3.3) lo userà, moltiplicata per
 * cinquecento righe.
 *
 * Qui si vede anche il gruppo attorno all'intestazione: senza, questa story
 * non si aprirebbe.
 */
export const MenuDiRiga: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <MoreHorizontalIcon />
        <span className="sr-only">Azioni sulla scheda T30</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Tassullo T30</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Apri la scheda
            <DropdownMenuShortcut>↵</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Modifica
            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            Pubblica (serve il ruolo Redattore)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            Elimina
            <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

/**
 * Sottomenu, spunte e gruppo radio, cioè tutto ciò che un menu sa fare oltre
 * a elencare azioni. Le spunte reggono lo stato: sono **filtri**, e a colpo
 * d'occhio si distinguono dal gruppo radio perché più d'una può essere accesa.
 *
 * L'intestazione «Ordinamento» sta **dentro** il `RadioGroup`, non prima:
 * anche il gruppo radio fornisce il contesto che la `GroupLabel` pretende.
 */
export const ConSottomenuESpunte: Story = {
  render: function ConSottomenuESpunteRender() {
    const [colonne, setColonne] = React.useState({
      codice: true,
      famiglia: true,
      resa: false,
    })
    const [ordine, setOrdine] = React.useState('nome')

    return (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          Vista
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Colonne visibili</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={colonne.codice}
              onCheckedChange={(v) => setColonne((c) => ({ ...c, codice: v }))}
            >
              Codice
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={colonne.famiglia}
              onCheckedChange={(v) => setColonne((c) => ({ ...c, famiglia: v }))}
            >
              Famiglia
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={colonne.resa}
              onCheckedChange={(v) => setColonne((c) => ({ ...c, resa: v }))}
            >
              Resa
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={ordine}
            onValueChange={(v) => setOrdine(v as string)}
          >
            <DropdownMenuLabel>Ordinamento</DropdownMenuLabel>
            <DropdownMenuRadioItem value="nome">Per nome</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="codice">
              Per codice
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="revisione">
              Per data di revisione
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Esporta</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>PDF</DropdownMenuItem>
              <DropdownMenuItem>Foglio di calcolo</DropdownMenuItem>
              <DropdownMenuItem>CSV</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
}

/** Il menu dell'utente in testata, con gruppi e scorciatoie. */
export const MenuUtente: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" />}>
        <UserIcon />
        Francesco Sartori
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Covi Costruzioni S.r.l.</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Profilo
            <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Impostazioni
            <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Esci</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
