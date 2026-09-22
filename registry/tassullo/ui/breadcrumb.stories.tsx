import type { Meta, StoryObj } from '@storybook/react-vite'
import { SlashIcon } from 'lucide-react'

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/registry/tassullo/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/registry/tassullo/ui/dropdown-menu'

/**
 * Il percorso che dice dove sei: la sezione, la famiglia, la pagina corrente,
 * e ogni gradino tranne l'ultimo porta indietro.
 *
 * **Quando sì, quando no.** Il breadcrumb dice dove sei, le `tabs` cambiano
 * cosa vedi. Se un'etichetta porta a un altro indirizzo è navigazione e sta
 * qui; se cambia solo il pannello sotto, è `tabs`. La prova pratica è il tasto
 * indietro del browser: deve funzionare fra i gradini del breadcrumb, non fra
 * le schede.
 *
 * ```bash
 * npx shadcn@latest add tassullo/tassullo-design-system-v2/breadcrumb
 * ```
 *
 * **Parti.** `BreadcrumbList` e `BreadcrumbItem` fanno l'elenco;
 * `BreadcrumbLink` è un gradino che porta da qualche parte; `BreadcrumbPage` è
 * la pagina corrente; `BreadcrumbSeparator` il segno fra i gradini, che si
 * cambia passandogli un figlio; `BreadcrumbEllipsis` raccoglie i livelli
 * intermedi dei percorsi profondi.
 *
 * **Regole d'uso.** L'ultimo gradino è sempre `BreadcrumbPage`, mai un link
 * che punta alla pagina stessa: sarebbe un fermo di tabulazione che non fa
 * nulla. L'ellissi da sola è muta: va messa dentro un grilletto vero — un
 * `dropdown-menu` con i livelli nascosti — o quei livelli diventano
 * irraggiungibili da tastiera. Il grilletto prende `size-8`, non la misura
 * dell'ellissi, che da sola è troppo piccola per essere un bersaglio.
 *
 * **Accessibilità.** Il percorso è un `<nav>` annunciato come «percorso di
 * navigazione», la pagina corrente porta `aria-current="page"` e resta
 * leggibile senza essere cliccabile, e i separatori sono esclusi dalla
 * lettura: cambiarli non cambia ciò che sente chi usa un lettore di schermo.
 */
const meta = {
  title: 'Primitive/Breadcrumb',
  component: Breadcrumb,
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Il percorso tipico: sezione, famiglia, prodotto.
 */
export const Base: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Prodotti</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Impermeabilizzanti</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Membrana armata 4 mm</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
}

/**
 * Un percorso profondo: i livelli intermedi stanno nell'ellissi, che apre un
 * menu da cui raggiungerli anche da tastiera.
 */
export const ConEllissi: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Anagrafe</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Mostra i livelli intermedi"
              className="flex size-8 items-center justify-center rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <BreadcrumbEllipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
                <DropdownMenuItem>Prodotti</DropdownMenuItem>
                <DropdownMenuItem>Impermeabilizzanti</DropdownMenuItem>
                <DropdownMenuItem>Membrane armate</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Revisioni</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Revisione 4</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
}

/**
 * Il separatore sostituito con una barra, passata come figlio. La scelta è
 * solo visiva: chi ascolta sente la stessa cosa.
 */
export const Separatore: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Cantieri</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <SlashIcon />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Trento</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <SlashIcon />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Lotto 12</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
}
