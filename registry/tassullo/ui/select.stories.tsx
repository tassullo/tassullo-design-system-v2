import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from '@/registry/tassullo/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/registry/tassullo/ui/select'

/**
 * **Un ri-stile solo**: `rounded-[min(var(--radius-md),10px)]` → `rounded-md`
 * sulla taglia `sm`. Il `min()` serviva a mettere un tetto a un `--radius-md`
 * grande; il nostro è 6px, quindi il risultato è identico al pixel — ma ora è
 * il gradino del tema, e segue il tema se cambia. Come per il checkbox, era
 * **invisibile al gate** fino a M2.2 (segnaposto d'icona): corretto lì.
 *
 * **`Select` vuole `items`, o il grilletto mostra il valore grezzo.** È il
 * secondo rilievo di questa fase, e si vede a occhio nudo appena si sceglie
 * una voce: senza `items`, `SelectValue` non sa risalire dall'`value` alla
 * scritta, e il campo «Famiglia» dice `deumidificanti` invece di «Intonaci
 * deumidificanti». Non è un difetto del ri-stile — è come Base UI risolve
 * l'etichetta (`resolveSelectedLabel` legge la mappa `items` sulla radice) —
 * ma è un passo che shadcn non documenta e che **ogni consumatore sbaglierà
 * una volta**. Qui si scrive perché lo sbagli zero volte.
 *
 * ## Le voci vanno dentro un `SelectGroup`, anche quando il gruppo è uno solo
 *
 * **È il rientro del riquadro, e senza gruppo non c'è.** Il `p-1` che stacca
 * le voci dal bordo del popup sta su `SelectGroup` (`scroll-my-1 p-1`), non su
 * `SelectContent`, che ha padding **0**. Mettere gli `SelectItem` direttamente
 * dentro `SelectContent` — la forma più naturale da scrivere, e quella in cui
 * erano tre delle quattro story di questa pagina — fa arrivare la riga
 * evidenziata **a filo del bordo**, con gli angoli arrotondati che spariscono
 * contro il bordo del riquadro.
 *
 * Misurato contro la pagina di shadcn, che avvolge sempre le voci in un
 * gruppo: rientro della voce **4px per lato da loro, 0px da noi**. È la
 * differenza che si vede a occhio fra i due menu aperti, e l'unica: per il
 * resto le classi del popup, il padding e le classi delle voci coincidono
 * (`DECISIONI.md` §24).
 *
 * Non è un difetto del componente né un'opzione di `components.json`: è come
 * shadcn ha distribuito il padding fra le parti. Il gruppo si usa **anche
 * senza `SelectLabel`**, che resta facoltativa.
 *
 * **Il `select` regge le liste corte.** Sopra le poche decine di voci non
 * regge più, e la risposta è il `combobox` di M2.6 — che si scrive filtrando,
 * mentre qui si può solo scorrere. Le famiglie e le norme di Anagrafe, che
 * oggi stanno in `<select>` nudi con centinaia di voci, vanno lì, non qui.
 *
 * **Da tastiera**: `Tab` porta sul grilletto, `Spazio`/`Invio`/`↓` apre,
 * le frecce scorrono, le **lettere** saltano alla voce che comincia così,
 * `Invio` sceglie, `Esc` chiude senza cambiare.
 */
const meta = {
  title: 'Primitive/Select',
  component: Select,
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="se-uno">Stato della scheda</Label>
      <Select
        items={{
          bozza: 'Bozza',
          revisione: 'In revisione',
          pubblicato: 'Pubblicato',
          archiviato: 'Archiviato',
        }}
      >
        <SelectTrigger id="se-uno" className="w-full">
          <SelectValue placeholder="Scegli uno stato" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="bozza">Bozza</SelectItem>
            <SelectItem value="revisione">In revisione</SelectItem>
            <SelectItem value="pubblicato">Pubblicato</SelectItem>
            <SelectItem value="archiviato">Archiviato</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
}

/** Raggruppato, con etichette di gruppo e separatore: le famiglie di prodotto. */
export const ConGruppi: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="se-fam">Famiglia</Label>
      <Select
        defaultValue="deumidificanti"
        items={{
          deumidificanti: 'Deumidificanti',
          risanamento: 'Risanamento',
          fondo: 'Fondo',
          strutturali: 'Strutturali',
          allettamento: 'Da allettamento',
        }}
      >
        <SelectTrigger id="se-fam" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Intonaci</SelectLabel>
            <SelectItem value="deumidificanti">Deumidificanti</SelectItem>
            <SelectItem value="risanamento">Risanamento</SelectItem>
            <SelectItem value="fondo">Fondo</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Malte</SelectLabel>
            <SelectItem value="strutturali">Strutturali</SelectItem>
            <SelectItem value="allettamento">Da allettamento</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Taglie: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="se-def">Default</Label>
        <Select defaultValue="a" items={{ a: 'Altezza del bottone', b: 'Seconda voce' }}>
          <SelectTrigger id="se-def" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="a">Altezza del bottone</SelectItem>
              <SelectItem value="b">Seconda voce</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="se-sm">Small</Label>
        <Select defaultValue="a" items={{ a: 'Un gradino più basso', b: 'Seconda voce' }}>
          <SelectTrigger id="se-sm" size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="a">Un gradino più basso</SelectItem>
              <SelectItem value="b">Seconda voce</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
}

export const Stati: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="se-vuoto">Vuoto (segnaposto)</Label>
        <Select items={{ a: 'Prima voce' }}>
          <SelectTrigger id="se-vuoto" className="w-full">
            <SelectValue placeholder="Nessuna scelta" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="a">Prima voce</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="se-inv">Non valido</Label>
        <Select items={{ a: 'Prima voce' }}>
          <SelectTrigger id="se-inv" aria-invalid className="w-full">
            <SelectValue placeholder="Campo obbligatorio" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="a">Prima voce</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="group flex flex-col gap-2" data-disabled="true">
        <Label htmlFor="se-dis">Disabilitato</Label>
        <Select defaultValue="a" items={{ a: 'Non modificabile' }}>
          <SelectTrigger id="se-dis" disabled className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="a">Non modificabile</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
}

/**
 * **`alignItemWithTrigger`**, l'unica prop di posizionamento che cambia il
 * *carattere* del controllo. Sta su `SelectContent`, vale `true` per
 * impostazione predefinita, e le due rese sono queste — qui affiancate,
 * entrambe con la terza voce già scelta perché la differenza si veda.
 *
 * - **`true` (predefinito)** — il popup si posiziona in modo che **la voce
 *   scelta cada sopra il grilletto**: il menu si apre *attorno* al valore
 *   corrente, che può quindi debordare sopra il campo. È il comportamento del
 *   `<select>` nativo di macOS, e il motivo per cui il preset spegne
 *   l'animazione in questo caso (`data-[align-trigger=true]:animate-none`):
 *   una tendina che si apre già a cavallo del campo, se anche scivolasse,
 *   sembrerebbe saltare.
 * - **`false`** — il popup si aggancia al **bordo** del grilletto e scende
 *   sotto, come un menu a tendina qualsiasi. Qui l'animazione c'è.
 *
 * **Misurato** su questa story, grilletto alto 32px con bordo superiore a
 * y=344 e la terza voce su cinque già scelta:
 *
 * | | bordo alto del popup | voce scelta |
 * |---|---|---|
 * | `true` | **51px sopra** il grilletto | y=347, cioè **sul grilletto** (scarto 3px) |
 * | `false` | 36px **sotto** — i 4px di `sideOffset` dal bordo basso | y=434, 90px più giù |
 *
 * **Quando mettere `false`.** Quando il campo sta in fondo alla pagina o
 * dentro un contenitore che scorre: con `true` il popup si sposta in su per
 * inseguire la voce scelta, e in una lista lunga può coprire il campo e
 * quello che gli sta sopra. Con `false` la posizione è prevedibile. Nelle
 * schede di Anagrafe, dove i `select` stanno dentro form lunghi, è la
 * variante da valutare — la decisione vera arriva col `combobox` di M2.6,
 * che è ciò che sostituirà queste liste quando si allungano.
 */
export const AllineatoAlGrilletto: Story = {
  render: () => {
    const voci = {
      a: 'Prima voce',
      b: 'Seconda voce',
      c: 'Terza voce',
      d: 'Quarta voce',
      e: 'Quinta voce',
    }
    return (
      <div className="flex gap-8">
        <div className="flex w-64 flex-col gap-2">
          <Label htmlFor="se-align-si">true — sopra il grilletto</Label>
          <Select defaultValue="c" items={voci}>
            <SelectTrigger id="se-align-si" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.entries(voci).map(([v, t]) => (
                  <SelectItem key={v} value={v}>
                    {t}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-64 flex-col gap-2">
          <Label htmlFor="se-align-no">false — sotto il bordo</Label>
          <Select defaultValue="c" items={voci}>
            <SelectTrigger id="se-align-no" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {Object.entries(voci).map(([v, t]) => (
                  <SelectItem key={v} value={v}>
                    {t}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  },
}
