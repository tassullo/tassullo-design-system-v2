# Immagini d'esempio della style guide

Servono a **una** story — `Primitive/EntityImage` — e a rispondere a una domanda
che senza una figura vera non si risponde: *a quella larghezza la foto si
riconosce?*

**Provenienza**: sono immagini di Tassullo, prese dalla sezione **Sistemi** di
<https://www.tassullo.it/sistemi> su indicazione di Francesco (2026-09-19).
`sistema-*.jpg` sono i render di stratigrafia delle sei categorie di sistema
(sorgente **1080×1080**); `prodotto-*.jpg` sono le foto pacco della linea Wall,
da <https://www.tassullo.it/prodotti> (sorgente **1800×1800**); `cantiere.jpg` è
la fotografia di testata della sezione Sistemi (1920×931). Ridimensionate per il
repo (640px le quadrate, 900px la fotografia) e nient'altro: non ritoccate, non
ritagliate.

**Tutte e due le librerie di Tassullo sono quadrate**, ed è il fatto che ha
fatto entrare il rapporto `1:1` in `entity-image` (v. `docs/DECISIONI.md` §45).

Sono **contenuto d'esempio**, non parte del design system:

- **Nessun item del registry le spedisce.** `registry.json` elenca i file uno
  per uno, e nessuno di questi ci compare; le story non vengono spedite affatto.
  Un'app che installa `entity-image` non si porta dietro niente di qui.
- **Sono locali di proposito.** Con indirizzi remoti, in una CI senza rete
  l'immagine non arriva, `AvatarFallback` ripiega sul segnaposto e le scene «con
  foto» misurerebbero il **segnaposto** — cioè lo stesso difetto di «un popup
  non aperto non è un popup senza violazioni».
- Storybook `public/` non la serve da sé: la riga è in `.storybook/main.ts`,
  fra gli `staticDirs`.
