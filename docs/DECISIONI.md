# DECISIONI — **Tassullo Design System 2.0**

> Registro delle decisioni tecniche accertate **sul campo**, con la prova che le sostiene. Serve a non ridiscuterle e a non riscoprirle: quando una scelta qui dentro contraddice `PIANO.md`, vince questo file, e la contraddizione è annotata esplicitamente.
> Le decisioni **di progetto** (D1–D9) vivono in `PIANO.md` §4 e nella tabella di `CHECKLIST.md`; qui stanno gli accertamenti tecnici che le attuano.

---

## 1. Come si seleziona la variante Base UI (accertato in M0.2, 2026-09-07)

**Conclusione: il campo esiste, e sta in `components.json`.** È il campo **`style`**, che codifica insieme la libreria di primitive e il preset visivo, nella forma `<base>-<preset>`. Nel nostro caso:

```json
{ "style": "base-nova" }
```

Si imposta **una volta sola, a `init`**, e da quel momento vale per **ogni** `shadcn add` successivo — che infatti **non** ha un'opzione per cambiarla.

```bash
npx shadcn@latest init --base base --preset nova --yes
```

- `-b, --base <base>` — la libreria di primitive: **`base`** (Base UI), `radix`, `aria`. È il flag che attua D9.
- `-p, --preset <name>` — il preset visivo: `nova` (Lucide / Geist), `vega`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea`, oppure `custom`. Senza questo flag la CLI **apre un prompt interattivo** e il comando si blocca: in una sessione non interattiva va sempre passato.
- Attenzione al nome: il preset si passa come `nova`, **non** come `base-nova` (`base-nova` è il valore che finisce scritto in `components.json`, non l'argomento della CLI; passarlo dà `Invalid preset`).

**Rettifica a `PIANO.md` §0bis.** Il piano afferma che «`components.json` non ha un campo che le seleziona» e che «la scelta si fa componente per componente, quindi la coerenza è a carico nostro». Con la CLI **4.21.0** non è più così: la scelta è **di progetto**, dichiarata una volta e applicata automaticamente. La decisione D9 (Base UI) resta identica nella sostanza e nelle motivazioni; cambia in meglio il modo in cui si fa rispettare — non è più disciplina a ogni comando, è configurazione. La regola operativa del `CLAUDE.md` va letta di conseguenza: non "ricordarsi di scegliere Base UI a ogni `add`", ma **"non cambiare `style` in `components.json`"**.

**Come si verifica** che una primitiva sia davvero Base UI: si guarda l'import in cima al file generato.

```
registry/tassullo/ui/button.tsx →  import { Button as ButtonPrimitive } from "@base-ui/react/button"
```

e in `package.json` compare la dipendenza **`@base-ui/react`** (^1.8.0), non `radix-ui` né `react-aria-components`.

**Se un giorno servisse l'eccezione del calendario** (unica prevista da D9, M2.7): non esiste un `--base` su `add`, quindi la variante React Aria di quel solo componente andrà presa per indirizzo esplicito dal registry `aria`, oppure copiata a mano. Da verificare nel task, non prima.

---

## 2. Preset `nova`: cosa porta con sé, e cosa ne sopravvive

`nova` = icone **Lucide** + font **Geist**. La scelta del preset è quasi indifferente per noi, perché la FASE 1 riscrive comunque i token; è stato preso il preset che la CLI stessa accoppia a `--defaults`. Cosa resta e cosa cade:

| Cosa | Destino |
|---|---|
| icone **Lucide** (`lucide-react`, `iconLibrary: "lucide"`) | **resta** — è il default shadcn e non c'è motivo di divergere |
| font **Geist** (`@fontsource-variable/geist`, importato in `src/index.css`) | **cade in M1.2**: lo stack Tassullo dichiara `'Replicall'` con degrado a font di sistema, e il `.woff` non si distribuisce (D3) |
| palette `neutral` in `:root` / `.dark` di `src/index.css` | **cade in M1.2/M1.3**: sostituita dai token Tassullo |
| `--radius: 0.625rem` | **cade in M1.2**: il raggio Tassullo è `0.375rem` (6px) |
| blocco `@theme inline` con le coppie `--color-*` | **resta come struttura**, cambiano i valori: è la convenzione shadcn di esposizione a Tailwind |
| `@custom-variant dark (&:is(.dark *))` | **resta** |

---

## 3. Prerequisiti d'ambiente (rilevati in M0.2, 2026-09-07)

| Cosa | Versione in uso | Nota |
|---|---|---|
| Node | **v26.4.0** | richiesto da Vite 8 |
| npm | **11.17.0** | |
| CLI shadcn | **4.21.0** | **non si installa**: `npx shadcn@latest <comando>`, per progetto |
| Vite | 8.2 | dal template `react-ts` di `create-vite` 9.2.0 |
| React | 19.2 | + `@types/react` 19.2 |
| TypeScript | 6.0 | vedi §5, la deprecazione di `baseUrl` |
| Tailwind CSS | 4.3 | con `@tailwindcss/vite` |

Il quadro completo dei prerequisiti, comprese le verifiche dell'MCP, si chiude in **M0.4**.

---

## 4. Aliases: le primitive atterrano nel registry, non in `src/`

`init` propone gli alias di una **app consumer** (`@/components/ui`, `@/lib/utils`). Qui non siamo un'app: siamo il registry. Gli alias sono stati riscritti in `components.json` verso `registry/tassullo/`, coerentemente con la mappa del repo di `PIANO.md` §1 e con la regola del `CLAUDE.md` ("gli import interni al registry usano sempre `@/registry/...`"):

```json
"aliases": {
  "components": "@/registry/tassullo",
  "ui":         "@/registry/tassullo/ui",
  "lib":        "@/registry/tassullo/lib",
  "utils":      "@/registry/tassullo/lib/utils",
  "hooks":      "@/registry/tassullo/hooks"
}
```

Effetto verificato: `npx shadcn@latest add button` scrive `registry/tassullo/ui/button.tsx`, non `src/components/ui/button.tsx`. Senza questa correzione le nove sessioni della FASE 2 avrebbero prodotto file nel posto sbagliato, da spostare a mano uno per uno.

**Nota sulle icone.** Il registry **non distribuisce un set di icone**: l'icon set è Lucide (`lucide-react`, `"iconLibrary": "lucide"`), e le taglie `icon`, `icon-xs`, `icon-sm`, `icon-lg` sono già dentro la cva del `button` insieme al dimensionamento automatico degli `svg` figli. Conseguenza identica a quella di `cn` qui sotto, e da fissare nello stesso posto (**M5.1**): ogni item del registry che usa un'icona deve dichiarare **`lucide-react`** fra le proprie `dependencies` npm, altrimenti l'app consumer non compila. La copertura in story del bottone con icona è di **M2.1**; la verifica che la densità non deformi le icone dentro i bottoni è di **M1.4**.

**Nota su `cn`.** In shadcn 4.x `cn` è diventato un **pacchetto npm** (`cn`), e le primitive generate lo importano direttamente (`import { cn } from "cn"`), **non** dall'alias `utils`. Il nostro `registry/tassullo/lib/utils.ts` è oggi un semplice re-export (`export { cn } from "cn"`), tenuto perché è ciò che `PIANO.md` §1 prevede in mappa e perché resta il posto giusto per le utility nostre. Conseguenza da ricordare in FASE 5: ogni item del registry che usa `cn` deve dichiarare `cn` fra le `dependencies` npm, altrimenti l'app consumer non compila.

---

## 5. `baseUrl` è deprecato in TypeScript 6.0

Gli alias si dichiarano con i soli `paths`, **senza** `baseUrl`: TS 6.0 emette `TS5101` su `baseUrl` ("deprecated and will stop functioning in TypeScript 7.0"), e i `paths` relativi non ne hanno bisogno. I `paths` sono ripetuti in `tsconfig.json` (che è il file letto dalla CLI shadcn) e in `tsconfig.app.json` (che è quello che compila davvero).

L'ordine conta anche in `vite.config.ts`: `@/registry` è un sottopercorso di `@`, quindi va risolto **prima**. Per questo gli alias Vite sono scritti come array ordinato e non come oggetto.

---

## 6. Il bersaglio touch è più lontano di quanto il piano stimasse

**Rilievo da portare in M1.4.** `PIANO.md` calcola la densità partendo da un bottone di default `h-9` (36px). Nel preset corrente il default **è `h-8`, misurato a 32px** a video (`lg` è `h-9`, `sm` è `h-7`, `xs` è `h-6`). La formula del piano — `[data-density="touch"] { --spacing: 0.3125rem; }` — su `h-8` produce **40px**, sotto i 44px richiesti.

Per portare il default a 44px servirebbe `--spacing: 0.34375rem` (5.5px), cioè un fattore 1,375 invece di 1,25. Il meccanismo del piano resta valido e resta **una riga**; è il valore che va ricalcolato. La decisione — alzare il fattore, oppure adottare `lg` come taglia di default in densità touch — si prende in **M1.4**, misurando, non qui.

**Aggiornamento M0.3.** Per rendere l'interruttore di densità del workbench verificabile e non uno stub, la riga è stata scritta **in via provvisoria** in `src/index.css` col valore `0.34375rem`, misurato a video: xs 33px, sm 38,5px, **default 44px**, lg 49,5px. Resta provvisoria per due ragioni, entrambe da chiudere in M1.4: manca lo **scatto di tipografia** (che non deriva da `--spacing`) e manca la verifica che **lo scaling non deformi ciò che non deve** — larghezze massime, icone dentro i bottoni, sidebar. I mezzi pixel di `sm` e `lg` sono un effetto atteso del fattore non intero e vanno valutati lì.

---

## 7. Strade da non imboccare

- **`shadcn/create` e i preset con codice breve** (`ui.shadcn.com/create`, `apply a2r6bw`): sono un configuratore visuale per chi deve *inventarsi* una palette da zero. La palette Tassullo è già vincolata al sito istituzionale: qui si traducono token esistenti. Il canale giusto per il tema è `registry:theme` e basta (`PIANO.md`, M1.5).
- **Registry npm**: non se ne fa uno. Il modello è GitHub-as-registry — nessun server, nessun publish, nessun token nei CI — che è il vincolo storico dello studio e già il modo in cui il v1 si distribuisce.
- **Mischiare le librerie di primitive**: Base UI e basta (D9). Con `style` in `components.json` non è più nemmeno una tentazione: è una modifica esplicita a un file di configurazione.


---

## 8. Storybook: cosa è stato tenuto di ciò che `init` porta (M0.3, 2026-09-07)

`npx storybook@latest init` (Storybook **10.6**) installa più di quanto il piano chieda. Cosa resta e perché:

| Pacchetto | Destino | Motivo |
|---|---|---|
| `@storybook/addon-a11y` | **tenuto** | axe-core su ogni story: è la ragione per cui il piano sceglie Storybook |
| `@storybook/addon-docs` | **tenuto** | regge le pagine `.mdx` della style guide e gli autodocs |
| `@storybook/addon-themes` | **aggiunto a mano** | non è nel set di `init`; è l'interruttore chiaro↔scuro chiesto dal piano |
| `@chromatic-com/storybook` | **rimosso** | Chromatic è un servizio a parte e non serve (`PIANO.md`, M0.3) |
| `@storybook/addon-mcp` | **rimosso** | fuori piano; l'MCP del progetto è quello di shadcn (M0.4) |
| `@storybook/addon-vitest` + `vitest`, `playwright`, `@vitest/*` | **rimossi, da rimettere in M2.9** | è il meccanismo con cui `a11y.test = 'error'` fa fallire la CI, cioè esattamente il gate di M2.9. `init` lo lascia a metà (nessun `vitest.setup.ts`, e la configurazione che scrive in `vite.config.ts` va rimossa se i pacchetti non ci sono): mezzo configurato è peggio di non configurato |

**Attenzione in M2.9**: `init` **riscrive `vite.config.ts`** aggiungendo un blocco `test.projects` con `storybookTest` e il provider Playwright. Qui è stato ripristinato a mano il file di M0.2. Quando l'addon si rimetterà, il blocco va rimesso con lui.

**Il viewport non è un addon.** Da Storybook 9 è nel core: si configura con `parameters.viewport.options` e `initialGlobals.viewport`. Il piano lo elenca fra gli addon perché era così fino a Storybook 8.

**Story demo.** `init` scrive `src/stories/` con Button/Header/Page e i loro `.css` — la stessa insidia dei CSS demo del template Vite (regola 4 di INTEGRAZIONE.md v1). Cancellati per intero.

**Dove vivono le story**: `registry/**/*.stories.tsx` accanto al componente, e `stories/**` in root per le pagine trasversali della style guide (`PIANO.md` §1). L'ordine delle sezioni — Introduzione, Tema, Primitive, Blocchi, Pagine — è fissato con `parameters.options.storySort`.

---

## 9. L'indirizzo del registry locale: `file://` non basta (M0.4, 2026-09-07)

**Il punto più importante emerso in questo task**, perché contraddice un'assunzione che `PIANO.md` fa in due posti (M5.2 «funziona col registry locale via percorso di file» e M5.5 «percorso di file locale finché il repo è sul Mac»).

Il campo `registries` di `components.json` accetta un **URL con segnaposto `{name}`**. Provate tutte le forme di percorso locale, con la CLI 4.21.0:

| Forma | Esito |
|---|---|
| `./public/r/{name}.json` (relativa) | ❌ `Invalid URL` |
| `/Users/…/public/r/{name}.json` (assoluta) | ❌ `Invalid URL` |
| `file:///Users/…/public/r/{name}.json` | ❌ `Request to file://… failed, reason: not implemented... yet...` |
| `http://localhost:5180/r/{name}.json` | ✅ funziona |

Il `file://` è **riconosciuto ma non implementato** dal fetcher della CLI. Attenzione alla distinzione, perché non è la stessa cosa:

- **Installare** un item da un percorso locale **funziona**: `npx shadcn@latest add ./public/r/button.json`. Un percorso di file è un indirizzo valido per `add`.
- **Sfogliare** un registry (`list`, `search`, e quindi **tutto l'MCP**) **no**: quei comandi risolvono l'indice chiedendo `<base>/registry.json` via rete, e su `file://` si fermano.

**Soluzione adottata, senza aggiungere strumenti**: il registry compilato vive in `public/r/`, e **il dev server di Vite serve `public/` alla radice**. Il workbench è quindi già il server del registry:

```jsonc
// components.json
"registries": { "@tassullo": "http://localhost:5180/r/{name}.json" }
```

Conseguenza operativa da tenere a mente per tutte le FASI 2–4: **per sfogliare il registry Tassullo dall'MCP il workbench deve essere in esecuzione** (`npm run dev`, porta 5180 da `.claude/launch.json`). Se l'MCP risponde che il registry Tassullo è vuoto o irraggiungibile, la prima cosa da controllare è che il server sia su, e la seconda che `npm run registry:build` sia stato rilanciato dopo l'ultima modifica agli item.

**Ricaduta su M5.5 (passo 0 su Anagrafe).** La guida non potrà dire "metti il percorso della cartella": dovrà dire o *"tieni acceso il workbench del design system e punta a `http://localhost:5180/r/{name}.json`"* — scomodo, perché lega Anagrafe a un server acceso su un'altra cartella — oppure, più sensatamente, rimandare il passo 0 a **D4 chiusa**, quando l'indirizzo diventa `tassullo/tassullo-design-system-v2` con il tag e il problema sparisce. La scelta si fa in M5.5; qui basta sapere che l'ipotesi "percorso di file locale" del piano **non regge** per il caso d'uso che a M5.5 interessa (consultare, non installare).

### Il registry si compila prima di essere sfogliato

`registry.json` (le sorgenti) non è ciò che la CLI legge: legge i JSON compilati in `public/r/` prodotti da **`npm run registry:build`** (`shadcn build`), uno per item più un `registry.json` di indice. **`public/r/` va committato**: è l'artefatto che, a D4 chiusa, GitHub servirà come registry. Non è un file generato da ignorare.

In M0.4 `registry.json` è nato con **un solo item, `button`**, come collaudo: il piano lo prevede in bozza a M1.5 e completo a M5.1, ma senza almeno un item il criterio di accettazione di M0.4 ("dall'MCP si elencano gli item del registry Tassullo") non sarebbe verificabile.

### Il server MCP: cosa espone

`npx shadcn@latest mcp init --client claude` scrive un `.mcp.json` di tre righe che lancia `npx shadcn@latest mcp`. Il server (`shadcn 1.0.0`) espone **sette** strumenti, non tre come dice `PIANO.md` §0bis:

`get_project_registries`, `list_items_in_registries`, `search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`, `get_add_command_for_items`, `get_audit_checklist`.

Verificato interrogando il server direttamente via JSON-RPC su stdio, senza passare da un client: vede **entrambi** i registry — `@tassullo` (1 item, locale) e `@shadcn` (216 item). La sostanza di §0bis resta corretta (elencare, cercare, installare, e solo lato consumo); il conteggio no.

**Difetto cosmetico a monte**, da non scambiare per un guasto della nostra configurazione: nell'output degli strumenti di ricerca il campo *Add command* stampa `[object Promise]` (una promise non attesa nel codice della CLI). I risultati sono corretti; è solo l'etichetta del comando a essere illeggibile.
