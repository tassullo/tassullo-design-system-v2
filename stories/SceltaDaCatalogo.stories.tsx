import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { cn } from 'cn'

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
import { EntityImage } from '@/registry/tassullo/ui/entity-image'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/registry/tassullo/ui/item'
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
  /** L'immagine del sistema, da `public/esempi/`. */
  immagine?: string
  /**
   * Gli strati, in ordine di posa. Ogni posizione può avere **alternative**
   * («oppure»), e ogni prodotto porta la propria **resa** — che è il dato con
   * cui si calcola il fabbisogno, quindi va accanto al nome e non altrove.
   */
  strati: { nome: string; resa: string }[][]
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
    immagine: '/esempi/sistema-risanamento.png',
    strati: [
      [{ nome: 'Malta da muratura M5', resa: '18' }],
      [{ nome: 'Intonaco di fondo', resa: '14' }, { nome: 'Rinzaffo di aggrappo', resa: '5' }],
      [{ nome: 'Finitura civile', resa: '1,43' }],
    ],
  },
  {
    codice: 'ST101', famiglia: 'MURO', variante: 'Bioedilizia',
    casoUso: 'Stai operando nell’ambito del restauro o della bioedilizia?',
    categoria: 'RESTAURO', prodotti: 2,
    strati: [
      [{ nome: 'Malta di calce naturale NHL 3.5', resa: '18' }],
      [{ nome: 'Intonaco deumidificante', resa: '12' }],
    ],
  },
  {
    codice: 'ST102', famiglia: 'MURO', variante: 'Laterizio porizzato',
    casoUso: 'Stai utilizzando laterizi porizzati o termoisolanti?',
    categoria: 'EDILIZIA CIVILE', prodotti: 2,
    strati: [
      [{ nome: 'Malta termica', resa: '9' }],
      [{ nome: 'Intonaco di fondo alleggerito', resa: '8,5' }],
    ],
  },
  {
    codice: 'ST103', famiglia: 'MURO', variante: 'Blocchi in calcestruzzo',
    casoUso: 'Vuoi applicare blocchi in calcestruzzo a vista?',
    categoria: 'EDILIZIA CIVILE', prodotti: 2,
    strati: [
      [{ nome: 'Malta da muratura M10', resa: '20' }],
      [{ nome: 'Rasante cementizio', resa: '1,5' }],
    ],
  },
  {
    codice: 'ST200', famiglia: 'FACCIA VISTA', variante: '100% calce idraulica naturale',
    casoUso: 'Stai operando nell’ambito del restauro o della bioedilizia?',
    categoria: 'RESTAURO', prodotti: 3, voceStandard: true,
    immagine: '/esempi/sistema-ripristino-storico.png',
    strati: [
      [{ nome: 'Malta di allettamento NHL 3.5', resa: '18' }],
      [{ nome: 'Stilatura dei giunti a base di calce idraulica naturale', resa: '2' }],
    ],
  },
  {
    codice: 'ST201', famiglia: 'FACCIA VISTA', variante: '4 colori',
    casoUso: 'Hai bisogno di una malta colorata?',
    categoria: 'FINITURE DI PREGIO', prodotti: 3,
    immagine: '/esempi/sistema-effetto-seta.png',
    strati: [
      [{ nome: 'Malta colorata in pasta', resa: '1,8' }],
      [{ nome: 'Idrorepellente silossanico', resa: '0,17' }],
    ],
  },
  {
    codice: 'ST300', famiglia: 'CAPPOTTO', variante: 'Sistema a pannelli EPS',
    casoUso: 'Devi isolare dall’esterno un edificio esistente?',
    categoria: 'RISANAMENTO E IMPERMEABILIZZAZIONI', prodotti: 5, voceStandard: true,
    // Il caso che la ricerca per sinonimi deve prendere: in cantiere si dice
    // «ETICS», e la parola non compare da nessuna parte nella scheda.
    sinonimi: ['ETICS', 'isolamento a cappotto'],
    immagine: '/esempi/sistema-cappotto.png',
    strati: [
      [{ nome: 'Collante cementizio', resa: '4,5' }],
      [{ nome: 'Pannello EPS', resa: '0' }],
      [
        { nome: 'Rasatura armata', resa: '1,2' },
        { nome: 'Rete strutturale bidirezionale in fibra di vetro maglia 40×40 mm2', resa: '1,2' },
      ],
      [{ nome: 'Finitura ai silicati', resa: '0,25' }],
    ],
  },
  {
    codice: 'ST400', famiglia: 'RASATURA ARMATA', variante: 'Tradizionale',
    casoUso: 'Devi consolidare un intonaco esistente prima della finitura?',
    categoria: 'RESTAURO', prodotti: 2,
    strati: [
      [{ nome: 'Rasante fibrorinforzato', resa: '1,43' }],
      [{ nome: 'Rete in fibra di vetro alcalino resistente', resa: '1,2' }],
    ],
  },
  {
    codice: 'ST500', famiglia: 'RINFORZO STRUTTURALE', variante: 'FRCM su muratura',
    casoUso: 'Devi rinforzare una muratura portante?',
    categoria: 'RINFORZI STRUTTURALI', prodotti: 4, voceStandard: true,
    sinonimi: ['FRCM', 'fibra di basalto'],
    immagine: '/esempi/sistema-crm.png',
    strati: [
      [{ nome: 'Malta strutturale di calce idraulica naturale NHL 5 per rinforzi strutturali', resa: '18' }],
      [
        { nome: 'Angolare preformato in fibra di rete alcalino resistente', resa: '0' },
        { nome: 'Rete strutturale bidirezionale in fibra di vetro maglia 40×40 mm2', resa: '1,2' },
      ],
      [{ nome: 'Malta di finitura', resa: '2' }],
    ],
  },
  {
    codice: 'ST600', famiglia: 'SOTTOFONDO', variante: 'Massetto alleggerito',
    casoUso: 'Devi realizzare un massetto su solaio esistente?',
    categoria: 'SOTTOFONDI E POSA PAVIMENTI', prodotti: 3,
    immagine: '/esempi/sistema-radiante.png',
    strati: [
      [{ nome: 'Massetto alleggerito', resa: '6' }],
      [{ nome: 'Autolivellante', resa: '1,6' }],
    ],
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

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveDialog open={aperto} onOpenChange={setAperto}>
        <ResponsiveDialogTrigger
          render={<Button type="button" variant="outline">Scegli il sistema dall&apos;elenco prezzi Tassullo</Button>}
        />
        {/* **L'altezza è ferma, e non dipende da cosa c'è dentro.** Due
            rilievi di Francesco in fila, e il secondo corregge il primo:
            «si può calcolare l'altezza in funzione dello schermo? con monitor
            esterno si vedono più righe» — e poi «attenzione che **spostando il
            mouse cambia l'altezza della scheda**».

            Il secondo è il difetto peggiore: con un'altezza che si adatta al
            contenuto, aprire gli strati sulla voce attiva **allunga il
            dialogo**, tutto quello che sta sotto si sposta sotto il cursore, e
            la riga che finisce sotto il mouse diventa quella attiva — cioè il
            contenuto si muove da solo mentre lo si guarda.

**Le due cose non sono in conflitto**, e la prima stesura le aveva
            confuse: l'altezza deve essere ferma rispetto al **contenuto**, non
            rispetto allo **schermo**. Un numero fisso (`h-192`) toglieva il
            tremolio ma dava le stesse righe su un 27" e su un portatile, cioè
            buttava via la richiesta di partenza.

            La soluzione le tiene entrambe **e lascia respiro**: `top-8
            bottom-8` con `h-auto` — l'altezza la decidono i due inset, quindi
            **segue il viewport** (più schermo, più righe) ed è **indipendente
            da cosa c'è dentro** (aprire gli strati cambia solo ciò che scorre).
            `translate-y-0` annulla il centraggio verticale di `DialogContent`,
            che con gli inset non serve più e lo sposterebbe di mezza altezza.

            **Non `h-dvh`**, che era la stesura precedente: mandava il dialogo a
            filo dei bordi dello schermo — *«va lasciato un po' di spazio sopra
            e sotto la scheda»*. E non un `max-h-[90dvh]`, che sarebbe un valore
            arbitrario: `8` è un gradino della scala, quindi il margine **segue
            la densità** (32px in normale, 48 in touch) invece di essere una
            misura scritta a mano.

            `min-h-0` su ogni anello non è zelo: un figlio flex ha
            `min-height: auto` di default, cioè **si rifiuta di rimpicciolirsi
            sotto il proprio contenuto**, e basta un anello senza per far
            crescere il dialogo oltre lo schermo invece di far scorrere la
            lista. */}
        <ResponsiveDialogContent className="top-8 bottom-8 flex h-auto translate-y-0 flex-col overflow-hidden sm:max-w-3xl">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Scegli la lavorazione</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody className="flex min-h-0 flex-1 flex-col gap-3">
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
              className="min-h-0 flex-1 gap-4"
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

              <div className="flex min-h-0 flex-1">
                {/* Le righe stavano larghe: `command` dà a ogni `CommandItem`
                    il proprio padding e il gruppo aggiunge il suo, così fra una
                    riga e l'altra si sommavano due spazi. Qui il passo lo dà un
                    `gap` solo — e stretto: due rilievi di Francesco in fila,
                    «riduciamo gli spazi» e poi «sono troppo distanti». Le righe
                    hanno già un bordo che le separa, quindi lo spazio in mezzo
                    deve solo impedire che i bordi si tocchino, non ridire la
                    separazione una seconda volta. */}
                <CommandList className="max-h-none min-h-0 flex-1 [&_[data-slot=command-group]>div]:flex [&_[data-slot=command-group]>div]:flex-col [&_[data-slot=command-group]>div]:gap-0.5">
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
                          className="group/voce flex-col items-start p-0 data-[selected=true]:bg-transparent"
                        >
                          {/* **Una cornice sola per voce, e gli strati stanno
                              dentro.** Prima erano due riquadri accostati — la
                              riga col suo bordo e il pannello degli strati
                              sotto, staccato — e il risultato era che il
                              pannello sembrava appartenere alla voce **dopo**:
                              rilievo di Francesco, *«mostra il secondo record,
                              il mouse è sopra il primo»*. Non era il fuoco a
                              essere sfasato, era il pannello a non dire di chi
                              fosse. Dentro la cornice, la domanda non si pone.

                              **E la voce attiva si vede**: `Item` non cambia
                              aspetto da sé quando l'opzione è selezionata —
                              `data-selected` sta sul `CommandItem`, che è il
                              genitore — quindi il contorno lo prende da lì con
                              `group-data-[selected=true]`. Senza, l'unico segno
                              della voce attiva erano gli strati che
                              comparivano, cioè nessun segno sulla riga. */}
                          <Item
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-full flex-col items-stretch bg-card",
                              "group-data-[selected=true]/voce:border-primary",
                              "group-data-[selected=true]/voce:bg-primary-subtle"
                            )}
                          >
                            <div className="flex w-full items-start gap-2">
                              <ItemContent>
                                <ItemTitle>
                                  <span className="font-medium">{s.famiglia}</span> — {s.variante}
                                </ItemTitle>
                                <ItemDescription>{s.casoUso}</ItemDescription>
                              </ItemContent>
                              <ItemActions className="flex-wrap justify-end gap-1">
                                {s.voceStandard ? <Badge variant="secondary">Voce standard</Badge> : null}
                                <Badge variant="outline">{intero(s.prodotti)} prodotti</Badge>
                              </ItemActions>
                            </div>

                            {/* Gli strati si aprono sotto il titolo **dentro la
                                stessa cornice**, come nel picker di Studio, ma
                                **senza il «Vedi strati»**: nell'app quel comando
                                è un `<button>` dentro un `role="option"`, cioè
                                `nested-interactive`. Qui compaiono da sé sulla
                                voce attiva — niente da premere, niente da
                                annidare — e il «Usa questo sistema» non serve
                                perché la voce stessa è il bersaglio. */}
                            {s.codice === codiceAttivo ? (
                              <div className="flex w-full gap-3 border-t pt-2 text-sm">
                                <div className="flex-1">
                                  <p className="pb-1 font-medium">Strati</p>
                                  <div className="flex flex-col gap-1">
                                    {s.strati.map((alternative, i) => (
                                      <p key={i}>
                                        <span className="pe-1 tabular-nums text-muted-foreground">
                                          {intero(i + 1)}.
                                        </span>
                                        {alternative.map((prodotto, j) => (
                                          <React.Fragment key={prodotto.nome}>
                                            {j > 0 ? <em className="text-muted-foreground"> oppure </em> : null}
                                            <strong className="font-medium">{prodotto.nome}</strong>
                                            {/* La **resa** accanto al nome: è il
                                                numero con cui si calcola il
                                                fabbisogno, quindi sta dove si
                                                legge il prodotto. Attenuata,
                                                perché è un dato di servizio. */}
                                            <span className="text-muted-foreground"> · resa {prodotto.resa}</span>
                                          </React.Fragment>
                                        ))}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                                {s.immagine ? (
                                  <EntityImage
                                    src={s.immagine}
                                    alt={`Sistema ${s.famiglia} — ${s.variante}`}
                                    rapporto="1:1"
                                    className="w-24 shrink-0 self-start"
                                  />
                                ) : null}
                              </div>
                            ) : null}
                          </Item>
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
