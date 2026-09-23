import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/registry/tassullo/ui/pagination'

/**
 * La navigazione fra le pagine di un elenco di risultati, quando ogni pagina
 * ha il suo indirizzo.
 *
 * **Quando sì, quando no.** Le voci sono collegamenti: una pagina di
 * risultati si apre in una nuova scheda, si salva, si torna indietro col
 * browser. Se l'elenco cambia senza cambiare indirizzo, non è paginazione ma
 * un filtro, e si usa `toggle-group` o un campo di ricerca. Le tabelle del
 * blocco `data-table` hanno la loro paginazione già dentro.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/pagination
 * ```
 *
 * **Parti.** `Pagination` è il `<nav>`; `PaginationContent` l'elenco;
 * `PaginationItem` una voce; `PaginationLink` il numero di pagina, con
 * `isActive` sulla pagina corrente; `PaginationPrevious` e `PaginationNext`,
 * con `text` per cambiare «Precedente» e «Successiva»; `PaginationEllipsis`
 * per le pagine lontane.
 *
 * **Regole d'uso.**
 *
 * - La pagina corrente si segna con `isActive`, mai con una classe: accende
 *   insieme il bordo e `aria-current="page"`, che è ciò che il lettore di
 *   schermo annuncia.
 * - Agli estremi il bottone che non porta da nessuna parte resta visibile ma
 *   spento: niente `href`, `aria-disabled` e
 *   `className="pointer-events-none opacity-50"`.
 * - Sotto la soglia `sm` «Precedente» e «Successiva» restano solo frecce; il
 *   nome per il lettore di schermo non cambia.
 *
 * **Tastiera e accessibilità.** Ogni voce è un `<a>`: `Tab` passa da una
 * all'altra, `Invio` segue il collegamento. Il `<nav>` si annuncia come
 * «paginazione», le frecce come «Vai alla pagina precedente» e «Vai alla
 * pagina successiva». L'ellissi è nascosta al lettore di schermo: le pagine
 * che raccoglie si raggiungono con le frecce.
 */
const meta = {
  title: 'Primitive/Pagination',
  component: Pagination,
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Poche pagine: si mostrano tutte, e la corrente ha il bordo.
 */
export const Base: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}

/**
 * Molte pagine: attorno alla corrente restano le vicine, le lontane si
 * raccolgono nell'ellissi.
 */
export const ConEllissi: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">11</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            12
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">13</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">64</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}

/**
 * Sulla prima pagina «Precedente» è spento: visibile, senza collegamento, non
 * cliccabile.
 */
export const AgliEstremi: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious aria-disabled className="pointer-events-none opacity-50" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}
