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
 * L'insieme è chiuso apposta, **e resta chiuso a tre**.
 *
 * Le 33 griglie `repeat(auto-fill/fit)` di Studio e Officina usano oggi **16
 * soglie `minmax` distinte**, da 104 a 320px: nessuna sbagliata da sola, tutte
 * insieme un catalogo che non si incolonna mai. Un rapporto è il *valore di una
 * prop*, non un componente — quindi la regola del secondo consumatore non si
 * applica, ed è l'insieme chiuso a impedire che la diciassettesima soglia nasca.
 *
 * `1:1` è entrato su rilievo di Francesco il 2026-09-19, e con un consumatore
 * che c'è già: **i render dei sistemi Tassullo sono 1080×1080**. Su una
 * sorgente quadrata `object-cover` a `4:3` taglia il **25%** dell'altezza e a
 * `16:9` il **43,75%** — e sul render del cappotto è misurato che a `16:9` il
 * taglio arriva sul soggetto, non solo sul fondo bianco. Senza `1:1` quel
 * ritaglio lo rifarebbe ogni app a mano, che è la diciassettesima soglia in
 * un'altra forma.
 *
 * Ogni valore in più va giustificato così, con un consumatore e una misura:
 * un insieme che cresce a ogni richiesta non è un insieme chiuso.
 */
const RAPPORTI = {
  "4:3": 4 / 3,
  "16:9": 16 / 9,
  "1:1": 1,
} as const

type Rapporto = keyof typeof RAPPORTI

// La foto di un'entità — una macchina, un impianto, un articolo di catalogo —
// ritagliata a un rapporto dichiarato, col **segnaposto** quando la foto non
// c'è. Nelle app dello studio la foto manca quasi sempre: il segnaposto è la
// regola, non l'eccezione.
//
// **Il ramo condizionale non è nostro.** `AvatarImage`/`AvatarFallback` di
// Base UI *è già* «mostra l'immagine, altrimenti mostra l'altro», e gestisce
// anche il caso che conta davvero in produzione — la `src` che c'è ma non
// arriva. Qui quel meccanismo viene messo in un riquadro **non tondo** insieme
// ad `AspectRatio`, e le cinque classi tonde della primitiva si annullano **una
// volta sola, qui dentro**, invece che in ogni pagina che mostra una foto.
//
// **`alt` è obbligatorio, e il tipo è l'unico controllo che lo vede.**
// Verificato il 2026-09-19, non assunto: Base UI scrive `alt=""` su **ogni**
// `<img>` che renda senza alt (`internals/useRenderElement.js:183`), quindi una
// foto senza alternativa testuale non è un errore — diventa in silenzio una
// foto *decorativa*, axe la promuove e `test:a11y` resta a zero violazioni.
// Chi scrivesse `alt` opzionale qui dentro non avrebbe nessun gate a coprirlo.
// Per una foto davvero decorativa si passa `alt=""`: una scelta scritta, non
// una dimenticanza.
/**
 * La foto di un'entità — una macchina, un impianto, un articolo di catalogo —
 * in un riquadro a rapporto dichiarato, col segnaposto quando la foto non c'è
 * o non arriva. Nelle app la foto manca spesso: il segnaposto è il caso
 * normale.
 *
 * `alt` è obbligatorio. Per una foto davvero decorativa si passa `alt=""`,
 * come scelta scritta.
 */
function EntityImage({
  src,
  alt,
  ratio = "4:3",
  adatta = "intera",
  icon,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  src?: string
  alt: string
  ratio?: Rapporto
  // Il default è `intera` perché la libreria di immagini di Tassullo è fatta
  // di soggetti scontornati e quadrati — sacchi, render di sistema — e un
  // ritaglio toglie prodotto, non fondo (rilievo di Francesco in M5.0e,
  // guardando `Primitive/EntityImage → Rapporti`: a 16:9 il sacco perdeva il
  // nome). `riempi` resta per le fotografie con uno sfondo proprio.
  /**
   * Come l'immagine sta nel riquadro. `"intera"`, il predefinito, la scala
   * finché ci sta tutta, senza deformarla: per i soggetti scontornati, come
   * i sacchi e i render dei sistemi. `"riempi"` la scala finché copre tutto il
   * riquadro e taglia ciò che avanza: per le fotografie con uno sfondo
   * proprio, dove una banda vuota si vedrebbe.
   */
  adatta?: "intera" | "riempi"
  icon?: React.ReactNode
}) {
  return (
    <AspectRatio
      data-slot="entity-image"
      data-ratio={ratio}
      data-adatta={adatta}
      ratio={RAPPORTI[ratio]}
      className={cn(
        "w-full overflow-hidden rounded-lg ring-1 ring-foreground/10",
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
       *
       * E la radice **non ha un fondo**. Ce l'aveva (`bg-muted`), e con sorgenti
       * su bianco non si vedeva mai; con le immagini **scontornate** di Tassullo
       * si vedrebbe dietro l'oggetto, e sarebbe un grigio diverso da quello
       * della superficie su cui la card sta. Un componente non dipinge un fondo
       * che non gli è stato chiesto: il grigio resta dov'è informazione, cioè
       * sul solo segnaposto.
       */}
      {/*
       * `absolute inset-0` e non `size-full`: il riquadro prende l'altezza da
       * `aspect-ratio`, e WebKit dentro una cella di tabella non risolve su
       * quell'altezza l'`height: 100%` dei figli — la foto restava alta
       * quanto il file (640px in un riquadro da 48) e se ne vedeva la striscia
       * in cima (M5.0e, coda). Un figlio assoluto ha l'altezza del riquadro in
       * ogni motore.
       */}
      <Avatar className="absolute inset-0 size-auto rounded-none after:hidden">
        {src ? (
          <AvatarImage
            src={src}
            alt={alt}
            className={cn(
              "aspect-auto rounded-none",
              adatta === "intera" && "object-contain"
            )}
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
