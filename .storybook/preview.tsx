import { useEffect, type ReactNode } from 'react'

import type { Decorator, Preview } from '@storybook/react-vite'

// Tailwind + i token del tema, che `src/index.css` importa dal registry.
import '../src/index.css'
// Il canvas di Storybook dipinto coi token, non col bianco di Storybook.
import './preview.css'

/**
 * Densità: l'interruttore agisce su un attributo del documento e basta —
 * nessuna primitiva va patchata, perché in Tailwind v4 le utility di
 * dimensione derivano da `--spacing` e la scala tipografica da `--text-*`.
 * Le due leve, i loro valori e le loro motivazioni stanno nel tema (M1.4);
 * qui c'è solo l'interruttore.
 *
 * È lo stesso attributo che un'app scrive una volta nel suo `index.html`, e
 * la scelta è esplicita e non `@media (pointer: coarse)`: è l'app a sapere se
 * si usa in campo — un tablet in ufficio non deve prendere la densità da
 * guanti.
 *
 * La pagina `Tema/Densità` mostra le due densità affiancate e non risente di
 * questo interruttore: fissa la propria con l'attributo su ciascuna colonna.
 */
function ConDensita({
  density,
  children,
}: {
  density: string
  children: ReactNode
}) {
  useEffect(() => {
    const root = document.documentElement
    if (density === 'touch') root.setAttribute('data-density', 'touch')
    else root.removeAttribute('data-density')
  }, [density])

  return children
}

const withDensity: Decorator = (Story, context) => (
  <ConDensita density={context.globals.density as string}>
    <Story />
  </ConDensita>
)

/**
 * La modalità chiara/scura, come classe sull'elemento radice.
 *
 * ── Perché non `withThemeByClassName` di `@storybook/addon-themes` ───────
 *
 * Perché **commutava una volta sola**. Misurato: partendo dal chiaro il
 * primo clic applicava `dark` correttamente, il secondo cambiava l'etichetta
 * in barra e lasciava `dark` sulla radice. La pagina restava scura con
 * l'interruttore che diceva «chiaro», e nessun errore da nessuna parte —
 * il difetto che Francesco ha visto come «in Carattere/Cifre il tema scuro
 * non viene applicato». Letto il sorgente dell'addon, la sua logica è
 * corretta: è il suo `useEffect` che non si ri-esegue in questa
 * composizione di decorator.
 *
 * Non valeva la pena inseguirlo. Densità e superficie sono già due
 * interruttori scritti così, provati e funzionanti: questo è il terzo, e
 * avere le tre leve della style guide fatte allo stesso modo — un global in
 * barra, un `useEffect`, una classe o un attributo sulla radice — vale più
 * della dipendenza che si toglie (rettifica di `docs/DECISIONI.md` §8, che
 * teneva l'addon).
 *
 * `light` non è un nome inventato: il tema emette i token chiari su
 * `:root, .light` dalla M1.3, proprio perché la modalità chiara si deve
 * poter *dichiarare* e non solo sottintendere — è ciò che rende possibile
 * `Tema/Palette`, dove le due modalità stanno affiancate.
 */
function applicaModalita(modalita: string) {
  const root = document.documentElement
  const voluta = modalita === 'scuro' ? 'dark' : 'light'
  if (root.classList.contains(voluta) && root.classList.length === 1) return
  root.classList.remove('light', 'dark')
  root.classList.add(voluta)
}

function ConModalita({ modalita, children }: { modalita: string; children: ReactNode }) {
  applicaModalita(modalita)
  useEffect(() => applicaModalita(modalita))

  return children
}

const withModalita: Decorator = (Story, context) => (
  <ConModalita modalita={context.globals.modalita as string}>
    <Story />
  </ConModalita>
)

/**
 * La superficie si scrive come attributo sul `<body>` del canvas, e il
 * colore lo mette `preview.css` leggendo i token. È la stessa forma della
 * densità, e per la stessa ragione: l'attributo è un interruttore, il
 * valore sta nel tema. Così la superficie segue chiaro/scuro senza che
 * questo file sappia nulla dei colori.
 */
function ConSuperficie({ superficie, children }: { superficie: string; children: ReactNode }) {
  useEffect(() => {
    const body = document.body
    if (superficie && superficie !== 'pagina') body.setAttribute('data-superficie', superficie)
    else body.removeAttribute('data-superficie')
  }, [superficie])

  return children
}

const withSuperficie: Decorator = (Story, context) => (
  <ConSuperficie superficie={context.globals.superficie as string}>
    <Story />
  </ConSuperficie>
)

const preview: Preview = {
  decorators: [withModalita, withSuperficie, withDensity],

  /**
   * Una pagina Docs per ogni componente. È lì che compare il JSDoc di `const
   * meta` — cos'è, quando si usa, come si installa, le regole — e senza questa
   * riga compariva su tre componenti soli. Una story che non deve finire nella
   * pagina Docs si toglie con `tags: ['!autodocs']`.
   */
  tags: ['autodocs'],


  globalTypes: {
    /** Chiaro o scuro: le due palette del tema, e nient'altro. */
    modalita: {
      description: 'Modalità chiara o scura',
      toolbar: {
        title: 'Modalità',
        icon: 'contrast',
        items: [
          { value: 'chiaro', title: 'Chiaro' },
          { value: 'scuro', title: 'Scuro' },
        ],
        dynamicTitle: true,
      },
    },

    /**
     * Su quale superficie del tema si guarda il componente. Tre, e non di
     * più: sono quelle per cui il tema dichiara **anche il colore del
     * testo**, cioè le coppie che `npm run check:contrast` verifica. Un
     * fondale senza il suo testo verificato non è un banco di prova
     * realistico — è un modo di rompere il contrasto senza accorgersene.
     */
    superficie: {
      description: 'Superficie del tema su cui poggia la story',
      toolbar: {
        title: 'Superficie',
        icon: 'paintbrush',
        items: [
          { value: 'pagina', title: 'Pagina' },
          { value: 'card', title: 'Card' },
          { value: 'sidebar', title: 'Sidebar' },
        ],
        dynamicTitle: true,
      },
    },

    density: {
      description: 'Densità dei controlli — in touch il bottone è 48px',
      toolbar: {
        title: 'Densità',
        icon: 'ruler',
        items: [
          { value: 'normale', title: 'Normale' },
          { value: 'touch', title: 'Touch' },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: {
    modalita: 'chiaro',
    density: 'normale',
    viewport: { value: 'scrivania', isRotated: false },
    // Si parte dalla pagina: è la superficie su cui sta la maggior parte
    // dei componenti, e commutando chiaro/scuro segue da sé.
    superficie: 'pagina',
  },

  parameters: {
    layout: 'centered',

    /**
     * L'ordine dell'indice. Il `CLAUDE.md` lo dà per fissato dalla M0.3 — «il
     * `title` della story apre con la sezione perché l'ordine è fissato in
     * `.storybook/preview.tsx` con `storySort`» — ma la riga non c'era mai
     * stata scritta: l'indice era in ordine alfabetico, e ci somigliava
     * abbastanza da non farsi notare (Blocchi, Pagine, Primitive, Tema è
     * quasi l'ordine giusto). Scritta in M2.1, quando le primitive sono
     * diventate nove e l'alfabetico ha smesso di bastare.
     *
     * L'ordine è quello del piano, cioè quello in cui le cose si costruiscono:
     * prima il tema, poi le primitive, poi i blocchi, poi le pagine.
     *
     * **Dentro ogni sezione l'ordine è alfabetico** (richiesta di Francesco,
     * 2026-09-22). Con la sola `order` non lo era: Storybook mette in quel
     * posto le voci nominate e lascia le altre **nell'ordine in cui i file
     * sono stati raccolti**, quindi `Pagine` si leggeva in due blocchi
     * alfabetici uno dietro l'altro — prima i sei file di
     * `registry/tassullo/pages/`, poi i quattro di `stories/`. Due elenchi
     * ordinati non fanno un elenco ordinato, e chi cerca «Prodotti» non ha
     * modo di sapere in quale dei due guardare.
     *
     * **Funzione e non `method: 'alphabetical'`**, che è l'aggiunta di una
     * parola e sarebbe sbagliata: quella ordina *ogni* livello, comprese le
     * story dentro un componente — `Primitive/Button` passerebbe da
     * «Predefinito, Varianti, Taglie…» a «Disabilitato, Icona, Predefinito…»,
     * cioè l'ordine con cui si spiega un componente sostituito da quello del
     * dizionario. Qui si ordina **solo il livello dei componenti**: a parità
     * di `title` la funzione torna 0, e `Array.sort` essendo stabile lascia
     * le story nell'ordine in cui il file le esporta.
     */
    options: {
      storySort: (a, b) => {
        // **Tutto dentro la funzione, e in JavaScript puro.** Storybook non
        // importa questo modulo per leggere `storySort`: ne **estrae il
        // sorgente** e lo passa a `eval`. Due conseguenze, entrambe pagate
        // qui: una funzione dichiarata fuori fa fallire la build del preview
        // («should be defined inline»), e un'annotazione di tipo la fa
        // fallire lo stesso, con un `SyntaxError: Unexpected token ':'` che
        // non nomina il file. I parametri restano quindi senza tipo — è
        // l'unico punto del repo dove serve, ed è il motivo per cui è
        // scritto.
        const sezioni = ['Introduzione', 'Tema', 'Primitive', 'Blocchi', 'Pagine']
        // Una sezione non prevista va **in fondo** e non in testa: `indexOf`
        // torna -1, che ordinato come numero verrebbe prima di tutto.
        const posto = (titolo) => {
          const i = sezioni.indexOf(titolo.split('/')[0])
          return i === -1 ? sezioni.length : i
        }
        // Stesso componente: le sue story restano nell'ordine in cui il file
        // le esporta — `Array.sort` è stabile, quindi lo 0 le lascia dov'erano.
        if (a.title === b.title) return 0
        const sa = posto(a.title)
        const sb = posto(b.title)
        if (sa !== sb) return sa - sb
        // `localeCompare` con la locale italiana, non `<`: le accentate si
        // ordinerebbero altrimenti per punto di codice, dopo la «z».
        return a.title.localeCompare(b.title, 'it')
      },
    },

    /**
     * L'addon «backgrounds» di Storybook è **spento**, e al suo posto c'è
     * l'interruttore «Superficie» qui sotto. Due ragioni.
     *
     * I suoi fondali predefiniti sono `#F8F8F8` e `#333333`: colori che in
     * Tassullo non esistono, offerti *accanto* all'interruttore
     * chiaro/scuro — due controlli che sembrano fare la stessa cosa.
     *
     * E, provandolo, **l'addon cuoce il valore**: configurato con
     * `var(--background)` il fondale resta quello della modalità in cui è
     * stato applicato. Misurato: commutando su scuro il testo diventava
     * chiaro e il fondo restava quello chiaro. Illeggibile, senza errore.
     * La superficie la mette quindi il CSS (`preview.css`), dove `var()`
     * resta vivo e segue la modalità da sé.
     */
    backgrounds: { disable: true },

    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },

    // I due formati che contano per le app dello studio: la scrivania di
    // Anagrafe/Studio e il telefono di Officina in cantiere.
    viewport: {
      options: {
        scrivania: { name: 'Scrivania 1440', styles: { width: '1440px', height: '900px' } },
        telefono: { name: 'Telefono 375', styles: { width: '375px', height: '812px' } },
      },
    },

    /**
     * axe-core su ogni story, e da M2.9 **fa fallire la CI**: `'error'` è
     * l'interruttore che trasforma il pannello da cosa-da-ricordarsi in
     * gate. Il pannello resta dov'era — questo non aggiunge lo strumento,
     * aggiunge l'obbligo.
     */
    a11y: { test: 'error' },
  },
}

export default preview
