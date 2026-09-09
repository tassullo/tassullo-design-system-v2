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
 * `pagination.tsx` è **identico all'originale nella forma e nelle stringhe di
 * classi**. Anche qui l'unico intervento è la lingua, e stavolta metà è
 * visibile: «Previous»/«Next» sono i testi dei due bottoni — ora
 * «Precedente»/«Successiva», e restano `prop` con quel valore di default, così
 * un caso particolare li può ancora cambiare senza toccare il componente.
 * L'altra metà — `aria-label="pagination"`, «Go to previous page», «More
 * pages» — la sente solo chi usa uno screen reader.
 *
 * **La pagina corrente è un `aria-current="page"`, non solo un bordo.** Lo fa
 * `isActive`, che accende insieme la variante `outline` del bottone e
 * l'attributo: se si segnasse la pagina corrente col solo `className` sarebbe
 * corretta a vedersi e muta ad ascoltarsi.
 *
 * **Le voci sono `<a>`, non `<button>`.** Il preset le rende con
 * `nativeButton={false}` su un `<a>` proprio perché una pagina di risultati è
 * un indirizzo: deve funzionare col tasto centrale, col «apri in una nuova
 * scheda» e col tasto indietro. Se la lista si aggiorna senza cambiare
 * indirizzo, allora non è paginazione — è un filtro, e va in M2.6.
 *
 * I due bottoni con testo nascondono l'etichetta sotto la soglia `sm`
 * (`hidden sm:block`) e restano le sole frecce: il nome accessibile però non
 * sparisce, perché sta nell'`aria-label` e non nel testo.
 */
const meta = {
  title: 'Primitive/Pagination',
  component: Pagination,
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

/** Poche pagine: si mostrano tutte. */
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
 * Molte pagine: le finestre lontane si raccolgono nell'ellissi, che qui è
 * `aria-hidden` e va bene — a differenza di quella del `breadcrumb` non
 * nasconde una destinazione, perché il numero di pagina si raggiunge lo stesso
 * con «Precedente» e «Successiva».
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
 * Primo e ultimo estremo. Il bottone che non porta da nessuna parte non si
 * nasconde e non resta cliccabile: prende `aria-disabled` e perde l'`href`,
 * così è ancora leggibile ma non promette un salto che non c'è.
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
