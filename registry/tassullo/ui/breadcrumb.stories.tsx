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
 * `breadcrumb.tsx` è **identico all'originale nella forma e nelle stringhe di
 * classi**. L'unico intervento è la lingua, e sono due stringhe che nessun
 * vedente incontra mai: `aria-label="breadcrumb"` sul `<nav>` e l'`sr-only`
 * dell'ellissi. Chi usa uno screen reader sentiva «breadcrumb navigation» e
 * «more» in mezzo a un'interfaccia italiana.
 *
 * **Il breadcrumb dice dove sei, le tabs cambiano cosa vedi.** È la coppia
 * che nel v1 si confondeva: se un'etichetta porta a un altro indirizzo è
 * navigazione e sta qui; se cambia solo il pannello sotto è `tabs` (M2.4).
 * Il segno pratico è il tasto indietro del browser — deve funzionare su
 * questi, non su quelle.
 *
 * **L'ultimo elemento non è un link**, ed è `BreadcrumbPage`: la pagina in cui
 * già ti trovi non porta da nessuna parte. Il preset gli mette
 * `aria-current="page"` e `aria-disabled`, quindi resta annunciato ma non
 * cliccabile. Metterci un `BreadcrumbLink` che punta a sé stesso è l'errore
 * classico, e si vede solo da tastiera: un fermo di tabulazione in più che
 * non fa nulla.
 *
 * Il separatore è un `<li role="presentation" aria-hidden>`: non entra nella
 * lettura, quindi lo si può cambiare — la story `Separatore` usa una barra —
 * senza toccare quello che sente chi non lo vede.
 */
const meta = {
  title: 'Primitive/Breadcrumb',
  component: Breadcrumb,
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

/** Il percorso tipico di Anagrafe: sezione, famiglia, prodotto. */
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
 * Percorsi profondi: i livelli intermedi si raccolgono nell'ellissi. Da sola
 * `BreadcrumbEllipsis` è muta — è `aria-hidden` — quindi va messa dentro un
 * grilletto vero, qui un `dropdown-menu`, o i livelli nascosti diventano
 * irraggiungibili da tastiera.
 *
 * Nota d'uso ereditata da M2.3: le voci del menu vanno dentro un
 * `DropdownMenuGroup`, o Base UI lancia l'errore #31.
 *
 * Il grilletto ha una taglia propria — `size-8`, sulla scala di `--spacing` —
 * e non quella dell'ellissi: `BreadcrumbEllipsis` è `size-5`, cioè 20px in
 * normale e 30 in touch, e 30px non è un bersaglio. Con `size-8` fa 32 e 48.
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
 * Il separatore si sostituisce passando un figlio. Resta `aria-hidden`, quindi
 * la scelta è puramente visiva: chi ascolta sente la stessa cosa.
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
