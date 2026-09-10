# Marchio Tassullo — sorgente, non file distribuito

`tassullo-t.svg` è il **tracciato ufficiale della T**, quello che Anagrafe ha
in produzione da tempo (`frontend/public/tassullo-t.svg`), segnalato da Roberto.
Un solo `path` con due sottotracciati — la barra sopra, l'asta con la traversa —
`viewBox` 24×38, `fill-rule="evenodd"`.

Due differenze dall'originale di Anagrafe, entrambe necessarie:

- **niente `fill`.** L'originale è `fill="#FFF"`. Qui il tracciato non viene mai
  dipinto: fa da **maschera**, e di una maschera conta il canale alfa, non il
  colore. Senza `fill` il nero di default riempie, cioè alfa 1 ovunque il
  tracciato copre — ed è esattamente ciò che serve. Come effetto collaterale
  sparisce anche l'esadecimale, che la regola 3 non ammette nemmeno dentro
  un SVG.
- **`viewBox` al posto di `width`/`height`.** L'originale dichiara solo i pixel;
  senza `viewBox` la maschera non saprebbe scalare.

**Questo file NON viaggia nel registry.** È la sorgente da cui
`scripts/build-logo-css.ts` genera `theme/tassullo-logo.css`, ed è quel CSS —
col tracciato dentro, in data URI — che le app ricevono. Stessa forma dei
`.woff2` in `theme/fonts/`: la sorgente resta in casa, il CSS generato è
l'artefatto. Vedi D13, chiusa il 2026-09-10.
