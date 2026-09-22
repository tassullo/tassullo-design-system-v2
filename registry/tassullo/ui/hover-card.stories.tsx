import { apriPassandoci } from '@/prove/apri'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Avatar, AvatarFallback } from '@/registry/tassullo/ui/avatar'
import { Badge } from '@/registry/tassullo/ui/badge'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/registry/tassullo/ui/hover-card'
import { Separator } from '@/registry/tassullo/ui/separator'

/**
 * Un'anteprima che compare passando il puntatore su un riferimento: risponde a
 * «cos'è questo?» senza cambiare pagina — un prodotto citato in un testo, una
 * norma richiamata in nota, chi ha firmato una revisione.
 *
 * **Quando sì, quando no.** Solo per contenuto ridondante: si apre col
 * passaggio del puntatore, e chi usa la tastiera o il tocco non la vede. Tutto
 * ciò che c'è dentro deve trovarsi anche altrove. Dentro non ci va niente da
 * cliccare: se il contenuto si clicca, è un `popover`; se è una parola di
 * spiegazione su un controllo, è un `tooltip`.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/hover-card
 * ```
 *
 * **Regole d'uso.** Il grilletto è quasi sempre un link alla pagina del
 * riferimento, così chi non vede l'anteprima ci arriva lo stesso con un clic.
 */
const meta = {
  title: 'Primitive/Hover Card',
  component: HoverCard,
  // Si misura **aperto**: chiuso il popup non esiste e axe non ha niente
  // da guardare. L'imbracatura dichiara qui quale popup apre (`@/prove/apri`).
  play: apriPassandoci('[data-slot="hover-card-trigger"]', 'hover-card-content'),
} satisfies Meta<typeof HoverCard>

export default meta
type Story = StoryObj<typeof meta>

export const Predefinito: Story = {
  render: () => (
    <p className="max-w-md text-sm">
      Il rinzaffo va eseguito con{' '}
      <HoverCard>
        <HoverCardTrigger
          render={
            <a
              href="#t30"
              className="font-medium text-accent-ink underline underline-offset-3"
            />
          }
        >
          Tassullo T30
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">Tassullo T30</span>
              <Badge variant="secondary">Rev. 04</Badge>
            </div>
            <p className="text-muted-foreground">
              Intonaco macroporoso deumidificante a base di calce idraulica
              naturale.
            </p>
            <Separator />
            <dl className="grid grid-cols-2 gap-y-1 text-xs">
              <dt className="text-muted-foreground">Resa</dt>
              <dd className="text-right tabular-nums">12,40 kg/m²</dd>
              <dt className="text-muted-foreground">Spessore minimo</dt>
              <dd className="text-right tabular-nums">20,00 mm</dd>
            </dl>
          </div>
        </HoverCardContent>
      </HoverCard>{' '}
      steso a cazzuola, e lasciato maturare per almeno quarantotto ore.
    </p>
  ),
}

/**
 * L'anteprima di una norma richiamata in nota: dice solo ciò che sta già nella
 * pagina della norma.
 */
export const AnteprimaNorma: Story = {
  render: () => (
    <p className="max-w-md text-sm">
      Prova eseguita secondo{' '}
      <HoverCard>
        <HoverCardTrigger
          render={
            <a
              href="#en998"
              className="font-medium text-accent-ink underline underline-offset-3"
            />
          }
        >
          EN 998-1
        </HoverCardTrigger>
        <HoverCardContent className="w-72">
          <div className="flex flex-col gap-1.5">
            <span className="font-medium">EN 998-1:2016</span>
            <p className="text-muted-foreground">
              Specifiche per malte per opere murarie — Parte 1: malte per
              intonaci interni ed esterni. Recepita in Italia come UNI EN
              998-1.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
      , con provini stagionati ventotto giorni.
    </p>
  ),
}

/**
 * Chi ha firmato la revisione: il nome resta leggibile anche senza aprire
 * l'anteprima.
 */
export const AnteprimaPersona: Story = {
  render: () => (
    <p className="max-w-md text-sm">
      Revisione 04 firmata da{' '}
      <HoverCard>
        <HoverCardTrigger
          render={
            <a
              href="#fs"
              className="font-medium text-accent-ink underline underline-offset-3"
            />
          }
        >
          Francesco Sartori
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex gap-3">
            <Avatar>
              <AvatarFallback>FS</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">Francesco Sartori</span>
              <span className="text-xs text-muted-foreground">
                Ufficio tecnico — Covi Costruzioni S.r.l.
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                14 revisioni firmate
              </span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>{' '}
      il 2 settembre 2026.
    </p>
  ),
}
