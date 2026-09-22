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
            {/* **Le tre zone hanno bisogno di respiro fra loro.** `Command` è
                già `flex flex-col` ma impila i figli **senza gap**: ricerca,
                filtri e risultati si toccavano, e tre cose attaccate si leggono
                come una sola (rilievo di Francesco, 2026-09-22). Il `gap` si dà
                qui, dal punto di chiamata — la primitiva non si tocca, perché
                un `command` dentro un `popover` (il `combobox` di M2.6) quel
                respiro **non** lo vuole: lì i figli sono due e il gap
                aprirebbe una fessura nel popup. */}
            <Command
              shouldFilter={false}
              value={codiceAttivo}
              onValueChange={setAttivo}
              className="gap-4"
            >
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

              <div className="flex min-h-0">
                <CommandList className="max-h-96 flex-1">
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
                          <span className="flex w-full flex-wrap items-baseline justify-between gap-2">
                            <span>
                              <span className="font-medium">{s.famiglia}</span> — {s.variante}
                            </span>
                            <span className="flex flex-wrap gap-1">
                              {s.voceStandard ? <Badge variant="secondary">Voce standard</Badge> : null}
                              <Badge variant="outline">{intero(s.prodotti)} prodotti</Badge>
                            </span>
                          </span>
                          <span className="text-sm text-muted-foreground">{s.casoUso}</span>

                          {/* **Gli strati si aprono sotto la riga**, come nel
                              picker di Studio — ma **senza il «Vedi strati»**,
                              e la differenza è ciò che rende la forma
                              ricomponibile. Nell'app quel comando è un
                              `<button>` dentro un `role="option"`, cioè
                              `nested-interactive`; qui gli strati compaiono da
                              sé sulla voce **attiva**, quindi non c'è niente da
                              premere per vederli e niente da annidare.
                              Scorrendo con le frecce si aprono e si chiudono da
                              soli, che è **meno** lavoro di aprirli riga per
                              riga col mouse. E il «Usa questo sistema» non
                              serve: la voce stessa è il bersaglio, `Invio` la
                              sceglie. */}
                          {s.codice === codiceAttivo ? (
                            <span className="mt-1 block w-full border-t pt-2 text-sm">
                              <span className="block pb-1 font-medium">Strati</span>
                              <span className="flex flex-col gap-0.5 text-muted-foreground">
                                {s.strati.map((alternative, i) => (
                                  <span key={i} className="block">
                                    <span className="pe-1 tabular-nums">{intero(i + 1)}.</span>
                                    {alternative.map((f, j) => (
                                      <span key={f}>
                                        {j > 0 ? <em> oppure </em> : null}
                                        {f}
                                      </span>
                                    ))}
                                  </span>
                                ))}
                              </span>
                            </span>
                          ) : null}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>

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
 * **Gli strati si aprono sotto la riga, come nell'app — ma senza il «Vedi
 * strati».** La forma è quella di Studio: il pannello compare in linea sotto la
 * voce, non in una colonna accanto (prima stesura, corretta su rilievo di
 * Francesco: *«si aprono sotto la riga e non a lato»*). Quello che **non** si
 * copia è il comando: nell'app «Vedi strati» è un `<button>` dentro un
 * `<div role="option">`, cioè **`nested-interactive`** — la stessa violazione
 * che il gate ha preso in M4ter.12 — e un `role="option"` con un comando dentro
 * non è riparabile restando quella forma.
 *
 * La via d'uscita non è spostare il bottone: è **toglierlo**. Gli strati si
 * aprono da sé sulla voce **attiva**, quindi non c'è niente da premere per
 * vederli e niente da annidare — e scorrendo con le frecce si aprono e si
 * chiudono da soli, che è **meno** lavoro che aprirli riga per riga col mouse.
 * Per lo stesso motivo sparisce anche il «Usa questo sistema»: la voce stessa è
 * il bersaglio, e `Invio` la sceglie.
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
