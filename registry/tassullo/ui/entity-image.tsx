"use client"

import * as React from "react"
import { ImageOff } from "lucide-react"
import { cn } from "cn"

import { AspectRatio } from "@/registry/tassullo/ui/aspect-ratio"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/tassullo/ui/avatar"

/**
 * L'insieme è chiuso apposta.
 *
 * Le 33 griglie `repeat(auto-fill/fit)` di Studio e Officina usano oggi **16
 * soglie `minmax` distinte**, da 104 a 320px: nessuna sbagliata da sola, tutte
 * insieme un catalogo che non si incolonna mai. Un rapporto è il *valore di una
 * prop*, non un componente — quindi la regola del secondo consumatore non si
 * applica, e `16:9` sta qui prima di avere un consumatore proprio perché è
 * l'insieme chiuso a impedire che la diciassettesima soglia nasca.
 */
const RAPPORTI = {
  "4:3": 4 / 3,
  "16:9": 16 / 9,
} as const

type Rapporto = keyof typeof RAPPORTI

/**
 * La foto di un'entità — una macchina, un impianto, un articolo di catalogo —
 * ritagliata a un rapporto dichiarato, col **segnaposto** quando la foto non
 * c'è. Nelle app dello studio la foto manca quasi sempre: il segnaposto è la
 * regola, non l'eccezione.
 *
 * **Il ramo condizionale non è nostro.** `AvatarImage`/`AvatarFallback` di
 * Base UI *è già* «mostra l'immagine, altrimenti mostra l'altro», e gestisce
 * anche il caso che conta davvero in produzione — la `src` che c'è ma non
 * arriva. Qui quel meccanismo viene messo in un riquadro **non tondo** insieme
 * ad `AspectRatio`, e le cinque classi tonde della primitiva si annullano **una
 * volta sola, qui dentro**, invece che in ogni pagina che mostra una foto.
 *
 * **`alt` è obbligatorio, e il tipo è l'unico controllo che lo vede.**
 * Verificato il 2026-09-19, non assunto: Base UI scrive `alt=""` su **ogni**
 * `<img>` che renda senza alt (`internals/useRenderElement.js:183`), quindi una
 * foto senza alternativa testuale non è un errore — diventa in silenzio una
 * foto *decorativa*, axe la promuove e `test:a11y` resta a zero violazioni.
 * Chi scrivesse `alt` opzionale qui dentro non avrebbe nessun gate a coprirlo.
 * Per una foto davvero decorativa si passa `alt=""`: una scelta scritta, non
 * una dimenticanza.
 */
function EntityImage({
  src,
  alt,
  ratio = "4:3",
  icon,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  src?: string
  alt: string
  ratio?: Rapporto
  icon?: React.ReactNode
}) {
  return (
    <AspectRatio
      data-slot="entity-image"
      data-ratio={ratio}
      ratio={RAPPORTI[ratio]}
      className={cn(
        "w-full overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10",
        className
      )}
      {...props}
    >
      {/*
       * Il raggio sta **sulla radice**, e dentro è tutto `rounded-none`: così
       * chi compone ha una leva sola — `className` — e un `rounded-t-xl` per
       * incastrare la foto in testa a una `card` non lascia gli angoli scoperti.
       * L'anello della primitiva (`after:border`) si spegne per la stessa
       * ragione: un bordo quadrato dentro un contenitore che ritaglia tondo si
       * vede tagliato agli angoli. Al suo posto un `ring` sulla radice, come fa
       * `card`.
       */}
      <Avatar className="size-full rounded-none after:hidden">
        {src ? (
          <AvatarImage
            src={src}
            alt={alt}
            className="aspect-auto rounded-none"
          />
        ) : null}
        <AvatarFallback className="rounded-none">
          {icon ?? <ImageOff className="size-8" aria-hidden="true" />}
        </AvatarFallback>
      </Avatar>
    </AspectRatio>
  )
}

export { EntityImage }
