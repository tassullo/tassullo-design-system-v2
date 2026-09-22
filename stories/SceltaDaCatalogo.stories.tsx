import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { apriCol } from '@/prove/apri'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from '@/registry/tassullo/blocks/responsive-dialog'
import { intero } from '@/registry/tassullo/lib/numeri'
import { Badge } from '@/registry/tassullo/ui/badge'
import { Button } from '@/registry/tassullo/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/registry/tassullo/ui/command'
import { ToggleGroup, ToggleGroupItem } from '@/registry/tassullo/ui/toggle-group'

/* ────────────────────────────────────────────────────────────────────────
 * I dati — la tassonomia vera del catalogo Tassullo
 *
 * Le **sei categorie** sono quelle misurate su `data/prodotti_kb.json` di
 * Studio (M4ter.13): 146 nodi in RINFORZI STRUTTURALI, 109 in FINITURE DI
 * PREGIO, 70 EDILIZIA CIVILE, 68 RESTAURO, 59 SOTTOFONDI E POSA PAVIMENTI,
 * 38 RISANAMENTO E IMPERMEABILIZZAZIONI. I **sistemi** invece arrivano da
 * Business Central a runtime e non stanno nel repo: l'ordine di grandezza
 * stimabile è ~124 codici categorizzati, cioè **una mole che `command` regge
 * senza virtualizzare** — la sua story `Cinquecento Voci` ne fa 500.
 * ──────────────────────────────────────────────────────────────────────── */

type Sistema = {
  codice: string
  famiglia: string
  variante: string
  casoUso: string
  categoria: string
  prodotti: number
  voceStandard?: boolean
  /** I sinonimi dell'ufficio tecnico: si cercano, non si mostrano mai. */
  sinonimi?: string[]
  strati: string[][]
}

const CATEGORIE = [
  'EDILIZIA CIVILE',
  'FINITURE DI PREGIO',
  'RESTAURO',
  'RINFORZI STRUTTURALI',
  'RISANAMENTO E IMPERMEABILIZZAZIONI',
  'SOTTOFONDI E POSA PAVIMENTI',
]

const SISTEMI: Sistema[] = [
  {
    codice: 'ST100', famiglia: 'MURO', variante: 'Blocchi tradizionali',
    casoUso: 'Stai costruendo un edificio in muratura tradizionale?',
    categoria: 'EDILIZIA CIVILE', prodotti: 3, voceStandard: true,
    strati: [['Malta da muratura M5'], ['Intonaco di fondo', 'Rinzaffo di aggrappo'], ['Finitura civile']],
  },
  {
    codice: 'ST101', famiglia: 'MURO', variante: 'Bioedilizia',
    casoUso: 'Stai operando nell’ambito del restauro o della bioedilizia?',
    categoria: 'RESTAURO', prodotti: 2,
    strati: [['Malta di calce naturale NHL'], ['Intonaco deumidificante']],
  },
  {
    codice: 'ST102', famiglia: 'MURO', variante: 'Laterizio porizzato',
    casoUso: 'Stai utilizzando laterizi porizzati o termoisolanti?',
    categoria: 'EDILIZIA CIVILE', prodotti: 2,
    strati: [['Malta termica'], ['Intonaco di fondo alleggerito']],
  },
  {
    codice: 'ST103', famiglia: 'MURO', variante: 'Blocchi in calcestruzzo',
    casoUso: 'Vuoi applicare blocchi in calcestruzzo a vista?',
    categoria: 'EDILIZIA CIVILE', prodotti: 2,
    strati: [['Malta da muratura M10'], ['Rasante cementizio']],
  },
  {
    codice: 'ST200', famiglia: 'FACCIA VISTA', variante: '100% calce idraulica naturale',
    casoUso: 'Stai operando nell’ambito del restauro o della bioedilizia?',
    categoria: 'RESTAURO', prodotti: 3, voceStandard: true,
    strati: [['Malta di allettamento NHL 3.5'], ['Stilatura dei giunti']],
  },
  {
    codice: 'ST201', famiglia: 'FACCIA VISTA', variante: '4 colori',
    casoUso: 'Hai bisogno di una malta colorata?',
    categoria: 'FINITURE DI PREGIO', prodotti: 3,
    strati: [['Malta colorata in pasta'], ['Idrorepellente silossanico']],
  },
  {
    codice: 'ST300', famiglia: 'CAPPOTTO', variante: 'Sistema a pannelli EPS',
    casoUso: 'Devi isolare dall’esterno un edificio esistente?',
    categoria: 'RISANAMENTO E IMPERMEABILIZZAZIONI', prodotti: 5, voceStandard: true,
    // Il caso che la ricerca per sinonimi deve prendere: in cantiere si dice
    // «ETICS», e la parola non compare da nessuna parte nella scheda.
    sinonimi: ['ETICS', 'isolamento a cappotto'],
    strati: [['Collante cementizio'], ['Pannello EPS'], ['Rasatura armata', 'Rete in fibra di vetro'], ['Finitura ai silicati']],
  },
  {
    codice: 'ST400', famiglia: 'RASATURA ARMATA', variante: 'Tradizionale',
    casoUso: 'Devi consolidare un intonaco esistente prima della finitura?',
    categoria: 'RESTAURO', prodotti: 2,
    strati: [['Rasante fibrorinforzato'], ['Rete in fibra di vetro']],
  },
  {
    codice: 'ST500', famiglia: 'RINFORZO STRUTTURALE', variante: 'FRCM su muratura',
    casoUso: 'Devi rinforzare una muratura portante?',
    categoria: 'RINFORZI STRUTTURALI', prodotti: 4, voceStandard: true,
    sinonimi: ['FRCM', 'fibra di basalto'],
    strati: [['Malta strutturale'], ['Rete in basalto'], ['Malta di finitura']],
  },
  {
    codice: 'ST600', famiglia: 'SOTTOFONDO', variante: 'Massetto alleggerito',
    casoUso: 'Devi realizzare un massetto su solaio esistente?',
    categoria: 'SOTTOFONDI E POSA PAVIMENTI', prodotti: 3,
    strati: [['Massetto alleggerito'], ['Autolivellante']],
  },
]

/**
 * **La ricerca è la parte che non si compone da sé, ed è giusto così.**
 * `command` filtra sul `value` di ogni voce, cioè su **una stringa**; il
 * catalogo Tassullo si cerca invece su sei campi — descrizione, variante, caso
 * d'uso, categoria, codice e i **sinonimi dell'ufficio tecnico**, che non si
 * mostrano mai (chi cerca «ETICS» deve trovare il cappotto). Perciò il filtro
 * si spegne con `shouldFilter={false}` e lo fa la pagina, che è l'unica a
 * sapere cosa sono i suoi campi.
 *
 * **A parola intera, non per prefisso né per sottostringa**: è un rilievo
 * dell'ufficio tecnico di Studio, già a verbale nel loro codice — «calce» non
 * deve trovare «calcestruzzo». Su un catalogo di materiali edili una ricerca
 * più larga produce esattamente questo tipo di falso, e sono parole che si
 * assomigliano per costruzione.
 *
 * **Il costo, perché non è gratis e va saputo**: la ricerca si chiude solo a
 * parola **finita** — digitando «cal» non compare ancora niente. È la regola
 * che l'ufficio tecnico ha chiesto e questa ricetta la eredita; un consumatore
 * che preferisse il prefisso cambia questa funzione, che sta nella **pagina**
 * proprio perché è lì che una regola così si decide. Prima stesura di questa
 * story: `startsWith`, che rimetteva «calcestruzzo» fra i risultati di
 * «calce» — preso misurando, non rileggendo.
 */
function cerca(s: Sistema, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const campi = [s.famiglia, s.variante, s.casoUso, s.categoria, s.codice, ...(s.sinonimi ?? [])]
  return q
    .split(/\s+/)
    .every((parola) =>
      campi.some((campo) =>
        (campo ?? '')
          .toLowerCase()
          .split(/[^\p{L}\p{N}]+/u)
          .some((p) => p === parola)
      )
    )
}

function SceltaDaCatalogo() {
  const [aperto, setAperto] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [categoria, setCategoria] = React.useState('')
  const [attivo, setAttivo] = React.useState<string>(SISTEMI[0]!.codice)
  const [scelto, setScelto] = React.useState<Sistema | null>(null)

  const filtrati = React.useMemo(
    () => SISTEMI.filter((s) => (!categoria || s.categoria === categoria) && cerca(s, query)),
    [query, categoria]
  )

  const gruppi = React.useMemo(() => {
    const m = new Map<string, Sistema[]>()
    for (const s of filtrati) {
      if (!m.has(s.famiglia)) m.set(s.famiglia, [])
      m.get(s.famiglia)!.push(s)
    }
    return [...m.entries()]
  }, [filtrati])

  // L'elemento attivo deve restare fra quelli visibili: filtrando, il primo
  // risultato diventa l'attivo. Deriva dalla lista, non da un effetto.
  const attivoValido = filtrati.some((s) => s.codice === attivo)
  const codiceAttivo = attivoValido ? attivo : (filtrati[0]?.codice ?? '')
  const sistemaAttivo = filtrati.find((s) => s.codice === codiceAttivo)

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveDialog open={aperto} onOpenChange={setAperto}>
        <ResponsiveDialogTrigger
          render={<Button type="button" variant="outline">Scegli il sistema dall&apos;elenco prezzi Tassullo</Button>}
        />
        <ResponsiveDialogContent className="sm:max-w-3xl">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Scegli la lavorazione</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody className="flex flex-col gap-3">
            <Command shouldFilter={false} value={codiceAttivo} onValueChange={setAttivo}>
              <CommandInput
                placeholder="Cerca: nome, prodotto, variante o caso d'uso…"
                value={query}
                onValueChange={setQuery}
              />

              {/* I chip sono un **filtro che si clicca**, quindi `toggle-group`
                  e non `badge` — è la coppia su cui `CLAUDE.md` avverte, e nel
                  v1 confonderla è costato riscritture ripetute. Scelta singola
                  e deselezionabile: ri-premere la categoria attiva torna a
                  «tutte», che è ciò che fa il picker di Studio. */}
              <ToggleGroup
                type="single"
                value={categoria}
                onValueChange={setCategoria}
                variant="outline"
                size="sm"
                className="flex-wrap justify-start"
              >
                {CATEGORIE.map((c) => (
                  <ToggleGroupItem key={c} value={c} aria-label={`Filtra per ${c}`}>
                    {c}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>

              <div className="flex min-h-0 gap-4">
                <CommandList className="max-h-80 flex-1">
                  <CommandEmpty>
                    <div className="flex flex-col items-center gap-2 py-4">
                      <p>Nessun sistema corrisponde alla ricerca.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQuery('')
                          setCategoria('')
                        }}
                      >
                        Mostra tutti i sistemi
                      </Button>
                    </div>
                  </CommandEmpty>
                  {gruppi.map(([famiglia, varianti]) => (
                    <CommandGroup key={famiglia} heading={famiglia}>
                      {varianti.map((s) => (
                        <CommandItem
                          key={s.codice}
                          value={s.codice}
                          onSelect={() => {
                            setScelto(s)
                            setAperto(false)
                          }}
                          className="flex-col items-start gap-1"
                        >
                          {/* **La variante non è colorata**, e non è una scelta
                              di gusto: `text-accent-ink` qui dà **4,29:1** sul
                              fondo di una voce selezionata (`--accent`,
                              #ECEAE8) — misurato dal gate appena l'imbracatura
                              ha imparato ad aprire il dialogo. `--accent-ink` è
                              verificato contro `--background` e `--card`, non
                              contro `--accent`: è una coppia che
                              `check:contrast` **non copre**, e su un elenco
                              dove la voce attiva ha sempre quel fondo salta
                              fuori subito. La famiglia e la variante si
                              distinguono col **peso**, che non ha un contrasto
                              da rispettare. */}
                          <span>
                            <span className="font-medium">{s.famiglia}</span> — {s.variante}
                          </span>
                          <span className="text-sm text-muted-foreground">{s.casoUso}</span>
                          {/* Etichette che **si leggono**: `badge`, non
                              `toggle-group`. E niente bottoni qui dentro —
                              v. il commento della story. */}
                          <span className="flex flex-wrap gap-1 pt-1">
                            {s.voceStandard ? <Badge variant="secondary">Voce standard</Badge> : null}
                            <Badge variant="outline">{intero(s.prodotti)} prodotti</Badge>
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>

                {/* Gli strati dell'elemento **attivo**, non di ogni riga.
                    V. il commento della story: è la correzione di un difetto
                    dell'app, non una semplificazione. */}
                <aside
                  aria-live="polite"
                  className="hidden w-64 shrink-0 overflow-y-auto border-s ps-4 sm:block"
                >
                  {sistemaAttivo ? (
                    <>
                      <p className="text-sm font-medium">{sistemaAttivo.famiglia}</p>
                      <p className="pb-2 text-sm text-muted-foreground">{sistemaAttivo.variante}</p>
                      <p className="pb-1 text-sm font-medium">Strati</p>
                      <ol className="flex flex-col gap-1 text-sm text-muted-foreground">
                        {sistemaAttivo.strati.map((alternative, i) => (
                          <li key={i}>
                            {alternative.map((f, j) => (
                              <span key={f}>
                                {j > 0 ? <em> oppure </em> : null}
                                {f}
                              </span>
                            ))}
                          </li>
                        ))}
                      </ol>
                    </>
                  ) : null}
                </aside>
              </div>
            </Command>
          </ResponsiveDialogBody>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      <p className="text-sm text-muted-foreground">
        {scelto ? (
          <>
            Scelto: <strong>{scelto.famiglia} — {scelto.variante}</strong> ({scelto.codice})
          </>
        ) : (
          'Nessun sistema scelto.'
        )}
      </p>
    </div>
  )
}

/**
 * **La scelta di una lavorazione dal catalogo** — il `SistemaPickerModal` di
 * Studio, ricomposto con quattro item che il registry ha già. **Non è un blocco
 * nuovo**: è una ricetta, ed è l'esito di M4ter.13.
 *
 * | pezzo | item |
 * |---|---|
 * | il contenitore | `tassullo-responsive-dialog` — dialogo sulla scrivania, **cassetto** sul telefono |
 * | ricerca, gruppi, frecce, `Invio` | `command` |
 * | i chip di categoria | `toggle-group`, scelta singola deselezionabile |
 * | «Voce standard», «N prodotti» | `badge` |
 *
 * **Perché `toggle-group` e non `badge` per i chip**: un chip che si clicca è
 * un filtro, un chip che si legge è un'etichetta — e nella stessa schermata ci
 * sono tutti e due. `CLAUDE.md` avverte proprio su questa coppia, perché nel v1
 * confonderla è costato riscritture ripetute.
 *
 * ## Le due cose che **non** si copiano dall'app
 *
 * **«Vedi strati» non è un bottone dentro la voce.** Nel picker di Studio ogni
 * riga è un `<div role="option">` che contiene un `<button>`: è
 * **`nested-interactive`**, la stessa violazione che il gate ha preso in
 * M4ter.12 su una riga di azioni, e un `role="option"` con un comando dentro
 * non è riparabile restando quella forma. Qui gli strati stanno in un pannello
 * accanto che segue l'**elemento attivo** — uno solo, non uno per riga — e il
 * guadagno è più grande della correzione: **scorrendo con le frecce gli strati
 * si vedono senza premere niente**, mentre nell'app vanno aperti riga per riga
 * col mouse. Sotto `sm` il pannello si nasconde: su un telefono la lista ha
 * bisogno di tutta la larghezza, e gli strati si guardano dopo aver scelto.
 *
 * **Il filtro di `command` si spegne.** `shouldFilter={false}`: `command`
 * cerca su una stringa, questo catalogo su sei campi più i **sinonimi
 * dell'ufficio tecnico**, che non si mostrano mai — chi scrive «ETICS» deve
 * trovare il cappotto, e quella parola non compare in nessun campo visibile.
 * La ricerca è **a parola intera**: «calce» non deve trovare «calcestruzzo»,
 * rilievo dell'ufficio tecnico già a verbale nel codice di Studio.
 *
 * ## Da tastiera
 *
 * Si scrive per filtrare, `↑`/`↓` scorrono **saltando le intestazioni di
 * gruppo**, `Invio` sceglie, `Esc` chiude. Il fuoco resta **sempre nel campo di
 * ricerca** e la selezione si muove con `aria-activedescendant`: è il solo modo
 * di continuare a scrivere mentre si scorre, e `command` lo fa da sé.
 */
const meta: Meta<typeof SceltaDaCatalogo> = {
  title: 'Pagine/Scelta da catalogo',
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => <SceltaDaCatalogo />,
  // Il dialogo è un popup: la passata `aperto` del gate lo apre da qui, o
  // l'intera schermata resterebbe non misurata (un popup non aperto non è un
  // popup senza violazioni).
  //
  // Lo slot del contenuto è **`responsive-dialog-content`**, non
  // `dialog-content`: il blocco ne tiene uno proprio apposta, perché sulla
  // scrivania monta `Dialog` e sul telefono `Drawer`, e chi cerca il contenuto
  // dovrebbe altrimenti sapere in che forma si sta rendendo. L'avevo **dedotto**
  // invece di guardarlo, e il gate l'ha preso — `imbracatura×1` in entrambe le
  // passate `aperto`, cioè una story che falliva senza nessuna violazione axe.
  // È la regola del `CLAUDE.md`: **lo slot si guarda nel DOM**.
  play: apriCol('[data-slot="responsive-dialog-trigger"]', 'responsive-dialog-content'),
}
