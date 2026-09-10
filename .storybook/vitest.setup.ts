import { setProjectAnnotations } from 'storybook/internal/preview-api'
// @ts-expect-error — modulo virtuale del builder, senza tipi.
import { getProjectAnnotations } from 'virtual:/@storybook/builder-vite/project-annotations.js'

/**
 * L'imbracatura del gate. Fa una cosa sola che il preview non fa da sé:
 * sceglie la **modalità** in cui girare, leggendola dall'ambiente.
 *
 * Perché serve: la regola permanente del progetto è che *una misura fatta
 * in una sola modalità non è una misura* — `variant: link` del bottone dava
 * 1.79:1 in chiaro e in scuro non compariva affatto. Vitest monta ogni story
 * una volta sola, coi globali iniziali del preview; quindi il gate gira
 * **due volte**, `MODALITA=chiaro` e `MODALITA=scuro`, ed è `npm run
 * test:a11y` a incatenare le due passate.
 *
 * `VITE_` come prefisso non è decorativo: in modalità browser il codice gira
 * dentro la pagina, dove `process.env` non esiste e arriva solo ciò che Vite
 * si porta dietro in `import.meta.env`.
 *
 * ── Perché `getProjectAnnotations()` e non `import preview from './preview'` ──
 *
 * Costato un falso verde, e vale la pena saperlo. Scritto nel modo ovvio —
 * `setProjectAnnotations([preview, …])` — il gate **passa senza misurare
 * niente**: il `combobox`, che M2.6 ha misurato con 16 `button-name`
 * *critical*, risultava a zero violazioni. Il motivo è che axe non lo monta
 * il preview, lo monta `addon-a11y` con le proprie annotazioni; importando
 * `preview.tsx` a mano si prende il nostro file e si perdono quelle degli
 * addon, e con esse il gate. Il modulo virtuale del builder restituisce la
 * composizione **intera**, che è ciò che Storybook stesso monta nel canvas.
 *
 * È il difetto peggiore che potesse capitare a un gate: non rompe, tace.
 */
const modalita = import.meta.env.VITE_MODALITA === 'scuro' ? 'scuro' : 'chiaro'
const aperto = import.meta.env.VITE_POPUP !== 'chiuso'

/**
 * L'unica regola axe che il gate spegne, e **solo nella passata `aperto`**.
 *
 * ── Cosa succede davvero ────────────────────────────────────────────────
 *
 * Quando Base UI apre un popup modale rende **inerte lo sfondo**, e lo fa
 * marcando `aria-hidden="true"` su ciò che resta dietro. Quello sfondo è la
 * story stessa: il campo, il gruppo, l'etichetta — e contiene elementi
 * focalizzabili, perché fino a un attimo prima erano l'interfaccia. axe
 * vede `aria-hidden` sopra roba focalizzabile e chiama `aria-hidden-focus`,
 * che in un caso normale è un rilievo giusto e qui è un falso positivo:
 * quel ramo è nascosto **apposta**, per la durata dell'apertura, dalla
 * stessa libreria che gestisce il fuoco.
 *
 * ── Perché spegnere e non correggere ────────────────────────────────────
 *
 * Perché non c'è niente da correggere che sia nostro. L'inerzia dello
 * sfondo la mette la libreria, non compare in nessuna stringa di classi, e
 * la regola 4bis non lascia modo di toccarla senza divergere da shadcn nella
 * forma. È la stessa famiglia accettata a verbale in M2.3 e M2.6.
 *
 * ── Perché solo in `aperto`, e perché è questa la parte che conta ───────
 *
 * Perché a popup **chiuso** non c'è nessuno sfondo inerte, quindi un
 * `aria-hidden-focus` lì sarebbe un difetto vero — nostro — e il gate lo
 * deve prendere. Spegnere la regola in tutte e due le passate l'avrebbe
 * resa cieca per sempre; spegnerla in una sola la lascia armata dove sa
 * distinguere. Ed è anche il motivo per cui il pannello di Storybook **non**
 * la spegne: questo file è l'imbracatura, non il preview, e a mano la
 * violazione si vuole continuare a vedere.
 *
 * **Rettifica a verbale**: `CLAUDE.md` dà questa famiglia sui *guardiani del
 * fuoco* di Base UI (`data-base-ui-focus-guard`). Misurato oggi non è più
 * così — le guardie ci sono (6 sul menu aperto, contate) ma portano
 * `data-base-ui-inert` e axe non le segnala più. I nodi che restano sono
 * quelli **dello sfondo**. Stessa natura, posto diverso.
 */
const parametri = aperto
  ? { a11y: { config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] } } }
  : {}

setProjectAnnotations([
  getProjectAnnotations(),
  { initialGlobals: { modalita }, parameters: parametri },
])
