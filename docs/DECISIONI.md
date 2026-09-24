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
| font **Geist** (`@fontsource-variable/geist`, importato in `src/index.css`) | **caduto in M1.2**: import rimosso e pacchetto disinstallato; lo stack Tassullo dichiara `'Replicall'` con degrado a font di sistema, e il `.woff` non si distribuisce (D3) |
| palette `neutral` in `:root` / `.dark` di `src/index.css` | **caduta in M1.2**: `src/index.css` non dichiara più alcun token, importa `registry/tassullo/theme/tassullo-theme.css`. Il blocco `.dark` è di M1.3 |
| `--radius: 0.625rem` | **resta il valore, cambia il significato** (M1.2): in shadcn `--radius` è il gradino `lg`, che nel v1 vale proprio 10px. I 6px del v1 sono `--radius-md`, sovrascritto esplicitamente insieme a `--radius-sm` |
| blocco `@theme inline` con le coppie `--color-*` | **resta come struttura**, cambiano i valori (M1.2): ora è **generato** dalle chiavi della palette, così un token nuovo si espone da sé |
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

## 6. La densità touch: due leve, e i valori (chiuso in M1.4, 2026-09-07)

**Come nasce il rilievo.** `PIANO.md` calcolava la densità partendo da un bottone di default `h-9` (36px) e proponeva `--spacing: 0.3125rem`. Nel preset corrente il default **è `h-8`, misurato a 32px** (`lg` è `h-9`, `sm` `h-7`, `xs` `h-6`): quella formula avrebbe dato 40px, sotto i 44 richiesti. Il meccanismo del piano regge — la densità resta poche dichiarazioni e non tocca nessuna primitiva — ma il valore andava ricalcolato misurando. Fatto in M1.4.

**Il valore è `--spacing: 0.375rem` (6px), cioè ×1.5.** Porta il bottone di default a **48px**. La strada alternativa, `0.34375rem` (×1.375), bastava per i 44px di Apple ed era il minimo indispensabile; è stata scartata per due ragioni misurate:

- **48px è l'altezza che il v1 dà a `.btn` in touch**, in produzione in cantiere da due anni. Riprodurla non è ossequio al v1: è l'unico dato di campo che abbiamo, ed è anche il minimo di Material.
- **Il fattore 1,375 lascia mezzi pixel su ogni gradino dispari** — `h-7` a 38,5px, `h-9` a 49,5px. A 6px tondi ogni gradino cade su un intero: xs 36, sm 42, default 48, lg 54, icona 24. Misurati a video, non calcolati.

La terza strada del rilievo originale — *adottare `lg` come taglia di default in densità touch* — è stata scartata prima di misurare: cambierebbe il default di un componente, cioè il gradino 2 della regola 4bis, e obbligherebbe ogni app a scrivere `size` diversi a seconda della densità. La densità deve restare una riga nell'`index.html`.

**La seconda leva è la tipografia, e serviva perché `--spacing` non la tocca.** In touch la scala sale di **×1.08 arrotondato al pixel**: dopo M1.6 (§30) fa 12→13, 13→14, 15→16, 16→17, 19→21, 27→29, 31→33, e i valori touch sono **derivati** da quella formula invece che scritti a mano. Il fattore non è scelto a occhio — è quello che riproduce il passo del v1, che in touch alzava il testo del bottone di **un gradino** della scala (13px → 14px, che nella scala di M1.6 è `--text-sm` → `--text-base`). Applicato all'intera scala dà esattamente «il gradino successivo» dove i gradini distano 1px, e prosegue con la stessa proporzione sui titoli, dove i gradini sono più larghi e uno scatto secco romperebbe la gerarchia. Non ×1.5 come i bersagli: un bersaglio deve crescere del 50% per stare sotto un dito guantato, un testo a 13px è già leggibile e portarlo a 20px non lo migliora — rompe le colonne.

**Il trabocchetto che rende possibile la seconda leva: `@theme inline` cuoce i valori.** Con `inline` Tailwind emette `.text-sm { font-size: 12px }`, il valore risolto in compilazione: ridichiarare `--text-sm` a runtime non cambierebbe nulla, e il difetto sarebbe **muto** — nessun errore, il testo semplicemente non scatta. La scala tipografica è stata quindi spostata in un `@theme` **semplice**, che emette `font-size: var(--text-sm)`. I colori restano `inline`, perché lì l'indirezione serve al contrario (`--color-primary: var(--primary)`) e la densità non li tocca. Verificato leggendo il CSS compilato prima e dopo.

**Esistono due blocchi, `touch` e `normale`.** Il secondo non è un doppione dei valori di `@theme`: senza, la densità saprebbe solo crescere, e non si potrebbe rimettere la densità normale *dentro* un sottoalbero touch — che è la sola forma in cui le due si guardano affiancate (pagina `Tema/Densità` della style guide). Stesso motivo per cui il chiaro si emette anche su `.light` (§ modalità scura, M1.3). I due blocchi escono da **una sola costante** nello script: due elenchi scritti a mano divergerebbero al primo ritocco.

**Dove sta.** Nel tema generato, `registry/tassullo/theme/tassullo-theme.css`, e non più in `src/index.css` dov'era in via provvisoria da M0.3. La densità è un token: se sta nel workbench e non nel tema, le app che installano `registry:theme` non la ricevono. L'attributo vale su qualunque elemento — i due token si ereditano — e `<body data-density="touch">`, la forma letterale del v1, è stata verificata identica.

**Cosa non scala, verificato a video in entrambe le densità:** raggi (`rounded-md` resta 6px), larghezze dei bordi (1px), `max-w-page` (1180px), la scala `--container-*` di Tailwind da cui vengono `max-w-md` e simili. Cresce il respiro dentro il contenitore, non il contenitore.

**Le due eccezioni accertate, entrambe fuori da M1.4 e annotate dove verranno lette:**

- **La sidebar non si allarga.** `SIDEBAR_WIDTH` (`16rem`), `SIDEBAR_WIDTH_ICON` (`3rem`) e `SIDEBAR_WIDTH_MOBILE` (`18rem`) sono costanti JavaScript in `sidebar.tsx`, passate come `style` inline: non derivano da `--spacing` e restano identiche. In touch le voci del menu passano da 32 a 48px dentro una colonna che resta 256px, e il rail collassato — 48px — viene riempito esattamente da un `SidebarMenuButton` da 48px, senza margine. Si chiude in **M2.5**, dove la sidebar si installa; il rimedio non richiede di patchare il componente, perché `SidebarProvider` accetta uno `style` che sovrascrive le tre variabili.
- **La taglia `sm` del bottone non segue lo scatto tipografico**, perché usa `text-[0.8rem]` — un valore arbitrario ereditato da shadcn, quindi fuori dai token. Resta 12,8px in entrambe le densità. È già uno dei quattro rilievi in carico a **M2.1**, e ora si sa che costa anche questo.

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

---

## 10. Quando il v1 non entra nella forma shadcn (2026-09-07)

**La priorità è usare shadcn com'è.** Un componente proprio, o un componente nostro che ne avvolge uno di shadcn, è l'**ultima** risorsa e **non si adotta di iniziativa**: si propone a Francesco e si aspetta la sua conferma. La scala completa è la regola **4bis** del `CLAUDE.md`; qui si registra il **ragionamento** di ogni caso, mentre `registry/componenti-propri.json` ne tiene la riga formale ed è ciò che `npm run check:registry` legge per ammettere il file.

Il gradino che si salta più facilmente è il **terzo**, e va detto esplicitamente perché è il meno istintivo: **prima di aggiungere qualcosa a shadcn, si valuta di togliere qualcosa al v1.** Il v1 non è la specifica: è il punto di partenza, ed è nato prima che ci fosse una libreria di primitive a cui appoggiarsi. Se shadcn risolve un pattern in modo diverso ma equivalente, quasi sempre conviene accogliere il suo — costa una decisione una volta, mentre mantenere il nostro costa a ogni aggiornamento, per sempre. Il caso già visto in M1.2 è istruttivo nella direzione opposta: il terzo livello di testo del v1 (`--color-text-hint`) non è stato "portato con un componente apposta", è stato **eliminato**, perché non reggeva il contrasto. Quello è il gradino 3 applicato bene.

Perché la conferma sia utile, la proposta deve dire **cosa è stato provato** ai gradini 1–3 e perché non è bastato — non "shadcn non ce l'ha", ma quale componente shadcn è stato guardato, come lo risolve, e cosa esattamente si perderebbe accogliendolo.

### Registro

*Nessun componente proprio, al 2026-09-07.* Tutto ciò che c'è nel registry viene da shadcn, con forma intatta.

| file | cosa fa | strada shadcn provata, e perché non basta | approvato da | data |
|---|---|---|---|---|
| — | — | — | — | — |

---

## 11. Come si distribuisce il tema: cosa il canale `registry:theme` sa fare, e cosa **fa in silenzio** (M1.5, 2026-09-08)

Un item `registry:theme` ha due modi di consegnare CSS, e il piano (§M1.5) li chiedeva **entrambi**: `cssVars` per `theme`/`light`/`dark`, più il file CSS con `target` sul CSS globale dell'app. Provati tutti e due su un'app Vite+React+Tailwind v4 costruita apposta (shadcn CLI **4.21.0**), con questi esiti.

### `cssVars`: dove finisce ciò che ci si mette

| campo | dove la CLI lo scrive | uso per noi |
|---|---|---|
| `cssVars.light` | fonde nel `:root` **esistente** dell'app | ✔ funziona |
| `cssVars.dark` | fonde in `.dark` | ✔ funziona |
| `cssVars.theme` | fonde in **`@theme inline`** | ✘ **inservibile per la tipografia** |

L'ultima riga è la ragione per cui `cssVars` da solo non basta. `@theme inline` cuoce il valore dentro l'utility (`.text-sm{font-size:12px}`): la scala tipografica ci finirebbe dentro e la **densità smetterebbe di scattare**, che è esattamente il difetto muto già accertato in M1.4 (§6). Non esiste un campo che scriva in un `@theme` **semplice**.

### `css`: regge i selettori, e **butta via `@theme`**

Il campo `css` accetta at-rule e selettori arbitrari e li accoda al CSS globale. `.light { … }`, `[data-density="touch"] { … }`, `@utility …` passano. `@theme` **no**, in due modi diversi e tutti e due cattivi:

- `css: { "@theme": { "--text-md": "13px" } }` **da solo**: nessun errore, nessuna riga scritta. Sparisce.
- lo stesso, **insieme a qualunque altra chiave**: la CLI muore e **non installa niente** — `update-css: <css input>:1:7: Unknown word 13px`, perché costruisce `.temp{13px}` (sotto un'at-rule si aspetta selettori annidati, non dichiarazioni).

Un canale che a seconda del contorno o tace o esplode non è un canale.

### `files` con `target`: funziona, e il `target` sul CSS globale **distrugge l'app**

Un file `registry:theme` con `target` viene copiato dove dice il target (senza target atterra in `components/`). Ma il `target` che il piano indicava — il CSS globale dell'app — **sostituisce il file, non ci si fonde**: `src/index.css` è rimasto una riga, `@import "tailwindcss"` compreso. **`PIANO.md` §M1.5 è rettificato qui.**

Nessuna delle due vie aggiunge da sé l'`@import` del file copiato… tranne per una scoperta utile: **`css: { "@import \"./tassullo-theme.css\"": {} }` funziona**, e la CLI lo mette al posto giusto, subito dopo `@import "tailwindcss"` e prima di `:root`.

### La forma adottata

```jsonc
{
  "name": "tema", "type": "registry:theme",
  "files": [{ "path": "registry/tassullo/theme/tassullo-theme.css",
              "type": "registry:theme", "target": "src/tassullo-theme.css" }],
  "css": { "@import \"./tassullo-theme.css\"": {} },
  "docs": "…"
}
```

Il tema viaggia **come file intero**, non come elenco di variabili. Tre ragioni, in ordine di peso:

1. **Il `@theme` semplice della tipografia esiste solo così.** È il vincolo che decide.
2. **Una sola rappresentazione.** Con `cssVars` la palette starebbe due volte nel repo — nella costante di `scripts/hex-to-oklch.ts` e nel JSON dell'item — e due elenchi divergono al primo ritocco. Col file, la fonte resta una e l'item punta al suo output.
3. **I commenti arrivano.** Le due trappole (`--primary` vs `--accent`, mai `--primary` sul testo) viaggiano col tema invece di restare qui.

### Il commento che non arriva

> **Rettificato il 2026-09-23 (§58).** Non è `shadcn build` e non è il solo primo commento: è `shadcn add`, e toglie **tutti** i commenti di testa. Le istruzioni per chi installa stanno ora dentro la prima regola del file.

`shadcn build` **scarta il primo commento** del file: 379 righe in casa, 357 nell'app, e la differenza è tutto e solo il blocco di testa. Il rimedio è la disposizione, non un accorgimento: il **primo** commento contiene ciò che vale solo dentro il repo («generato da, non modificare a mano»), il **secondo** ciò che deve leggere chi installa. Chi tocca `buildTheme()` in `scripts/hex-to-oklch.ts` deve saperlo, ed è scritto lì dentro.

### Il passo a mano che resta, e perché non è nascosto

Il file è importato **prima** del `:root` che l'app si porta da `shadcn init`: in CSS, a parità di specificità, vince l'ultimo, quindi **la palette di partenza di shadcn copre quella Tassullo**. Non c'è modo di evitarlo dal lato del registry senza duplicare la palette nell'item (che è il punto 2 qui sopra). Si toglie a mano, ed è un blocco solo.

Perché non sia un difetto silenzioso, l'istruzione sta nel campo **`docs` dell'item, che la CLI stampa a fine installazione** — verificato — e nel commento di testa del file. Ricaduta su **M5.5**: è il primo passo della guida di migrazione, ed è già misurato.

### Prova d'installazione (M1.5, end-to-end, in locale)

`npx shadcn@latest add @tassullo/tema` da un'app Vite+React+Tailwind v4 vuota, registry servito dal workbench su `http://localhost:5180/r/`:

- file creato in `src/tassullo-theme.css`, `@import` aggiunto in `src/index.css` al posto giusto, `docs` stampato;
- tolto a mano il blocco di `init`, `vite build` compila: `.text-title{font-size:var(--text-title)}` e `.text-md{font-size:var(--text-md)}` — cioè la **tipografia resta una variabile e la densità scatta** — `.max-w-page{max-width:1180px}`, i blocchi `[data-density=touch]` e `[data-density=normale]` presenti, `.dark` presente, `bg-primary` / `text-accent-ink` / `bg-sidebar` risolti;
- ri-lanciando il comando l'`@import` **non** viene duplicato.

---

## 12. Il font: lo stack è quello del v1, e la style guide lo mostrava sbagliato (2026-09-08)

**Geist non è mai stato il font del v2.** Arrivava col preset `nova` ed è caduto in M1.2 — import rimosso, pacchetto disinstallato (§2, riga «font Geist»). Riverificato: nessuna dipendenza `geist` in `package.json`, nessuna occorrenza in `src/`, `registry/`, `stories/`, `.storybook/`, `index.html`.

**Lo stack è quello del v1, carattere per carattere.**

| | v1 (`theme.css`) | v2 (`tassullo-theme.css`) |
|---|---|---|
| sans | `'Replicall', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif` | identico |
| mono | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | identico |

Cambia solo il **nome del token** — `--font-family` → `--font-sans`, che è lo spazio dei nomi di Tailwind/shadcn — più `--font-heading`, alias di `--font-sans`, coerente con la regola del v1: la gerarchia si costruisce con corpo e peso, non cambiando famiglia. Non c'era quindi nessun font da scegliere.

### Il buco vero: nessuna app carica Replicall, Studio compresa

Non esiste un file del font in nessuno dei due repo, **nemmeno Anagrafe dichiara un `@font-face`**, e **Studio nemmeno**: interrogata l'app in produzione (`thankful-pond-01a649603.7.azurestaticapps.net`), `--font-family` è lo stack v1 identico, ma `document.fonts` è **vuoto** e i fogli di stile caricati contengono **zero `CSSFontFaceRule`**. Studio rende quindi in `-apple-system`, cioè San Francisco su un Mac e Segoe UI su Windows — non in Replicall. Il font istituzionale **non ha mai reso in nessuna app Tassullo**, e su una macchina qualsiasi (un cliente, un telefono) non renderà comunque, perché nessuno lo serve.

Il workbench non lo caricava, quindi Storybook — la pagina che deve dire *come le cose appaiono* — mostrava la tipografia nel font di sistema. Proprio dove la scala a sette gradini di M1.4 è stata tarata, e dove altezza-x e larghezze decidono se una colonna regge.

### I pesi disponibili sono tre, e il design system ne usa due che non ci sono

`tassullo.it` dichiara Replicall in **300 Light, 400 Regular, 700 Bold** — `.otf` dal CDN Webflow (`ReplicaLL-Light/Regular/Bold.otf`), letto dalle sue `@font-face`. E non è che il sito ne usi solo alcuni: **Medium e Semibold non esistono nel carattere.** Replica LL (Lineto) ha quattro pesi — `ReplicaLL-Light` 300, `-Regular` 400, `-Bold` 700, `-Heavy` **900** — più i corsivi `-LightItalic`, `-Italic`, `-BoldItalic`, `-HeavyItalic`, e un `ReplicaMonoLL-Regular` a parte. Verificato due volte e in due modi: sulla pagina della fonderia e sui nomi degli asset che quella pagina pubblica.

Il v1 costruisce però la gerarchia su **600** (×13 in `components.css`/`theme.css`/`styleguide.html`) e **500** (×2), e il v2 su `font-semibold` (×14) e `font-medium` (×3). Con la sostituzione prevista dal CSS — sopra 500 si sale, da 400 a 500 si scende — il risultato è:

| scritto | reso con Replicall |
|---|---|
| `font-medium` (500) | **400 Regular** — indistinguibile dal corpo del testo |
| `font-semibold` (600) | **700 Bold** |

Non è un guasto: è una gerarchia che, col font vero, ha **due gradini invece di quattro**. Va guardata prima di essere cotta dentro quaranta componenti — ed è la ragione più forte per caricare il font nel workbench adesso. **In carico a M2.1** (`typography`), che è il task che deve «riprodurre la scala v1».

Il gradino da cui ripartire c'è, ed è **Heavy 900**: un peso che il carattere offre e che né il sito né il v1 hanno mai usato. È dichiarato nel workbench apposta, perché la decisione di M2.1 si prenda vedendolo e non immaginandolo. (900 e non 800: è il valore che i file dichiarano nella propria `OS/2.usWeightClass`, letto con `fontTools`. La stima precedente era sbagliata.)

Nota di rilievo per le app: lo screenshot di Studio mostra testo **in corsivo** (le note di misurazione del computo). Senza il file corsivo il browser inclina il tondo per conto suo — un falso corsivo, che è cosa diversa dal `ReplicaLL-Italic` disegnato. Per questo i corsivi 400 e 700 sono fra i file richiesti.

**Questo è indipendente da D3.** D3 riguarda ciò che il **registry distribuisce**; qui si tratta di ciò che il **workbench renderizza**.

### Un formato solo non copre i tre canali (2026-09-08)

`woff2` è un formato **di consegna al browser** e non lo legge nient'altro: né reportlab, né Word, né macOS. Il font desktop non è quindi un ripiego rispetto al `woff2` — è il **sopra-insieme**: da un `.ttf`/`.otf` si ricava tutto, compreso il `woff2`; dal `woff2` si ricava solo il browser.

I tre canali Tassullo, e cosa vuole ciascuno:

| canale | come si genera | formato che serve |
|---|---|---|
| interfaccia (workbench, app) | `@font-face` | **`.woff2`** (o `.otf`, come fa oggi tassullo.it) |
| **PDF** | **reportlab server-side** — Anagrafe, `docs/PIANO.md`: «Niente HTML-to-PDF» | **`.ttf`**, e solo `.ttf` |
| Word | `python-docx` | **nessuno**: non incorpora font |

**Il vincolo del PDF è duro e misurato.** `reportlab.pdfbase.ttfonts.TTFont` accetta solo contorni TrueType. Provato (reportlab 5.0.1): `Arial.ttf` e `Georgia.ttf` si registrano; `STIXGeneralItalic.otf`, che ha contorni CFF come ogni `.otf` di fonderia, fallisce con

```
TTFError: postscript outlines are not supported
```

I file che tassullo.it serve sono `.otf` (`ReplicaLL-Regular.otf` ecc.), quindi **non sono utilizzabili per i PDF così come sono**. O si chiede a Roberto il `.ttf`, o si converte con `fontTools` (`cu2qu`, cubiche → quadratiche: è una vera riscrittura dei contorni, e va chiesto se la licenza la permette).

**Word non è una questione di formato.** `python-docx` non sa incorporare font: il `.docx` **nomina** il carattere, e chi lo apre lo vede solo se ce l'ha installato. È esattamente la ragione per cui il template del v1 usa **Arial** («Word non garantisce il rendering di font non di sistema senza incorporarli nel file», `docx/README.md`). **Quella scelta resta**, e non va riaperta pensando che un file di font la risolva: non la risolve.

**Installare il font sul Mac non aiuta il PDF.** I PDF di Anagrafe li genera il backend su Azure: il font deve essere un file che *quel* processo legge e incorpora. Un'installazione locale serve a Francesco e a Roberto per lavorare, a nessun altro.

Ricaduta di licenza, da chiarire con Roberto insieme ai file: incorporare in PDF e generare da un server sono usi che le licenze delle fonderie trattano separatamente dal desktop e dal web.

### La conversione OTF → TTF, fatta e verificata (2026-09-08)

Autorizzata da Francesco. **Nota di licenza, che resta aperta:** la conversione *modifica il file del font*, quindi va confermata con Lineto insieme all'altra domanda — la generazione da server.

Lo strumento è **`scripts/otf2ttf.py`**, tenuto nel repo perché una conversione il cui script si butta non è ripetibile: le cubiche di Bézier del CFF diventano quadratiche con `cu2qu`, e nient'altro cambia. Prodotti in `public/fonts/ttf/`, anch'essi fuori dal repo, da copiare a mano dove gira la generazione dei PDF.

**Due trappole silenziose, entrambe prese sul campo** — e sono la ragione per cui lo script vale più della cartella che produce:

- `maxp.compile()` esplode se i bordi dei glifi non sono stati ricalcolati: `AttributeError: 'Glyph' object has no attribute 'xMin'`. Rumoroso, quindi innocuo.
- La `post` di un OTF è **v3.0, che i nomi dei glifi non li memorizza** — stanno nel charset del CFF, che qui si butta. Senza passare a v2.0 prima di salvare, metà famiglia si riapre come `glyph00638` e le alternative stilistiche (`a.ss02`) perdono il nome. **Questa non dà nessun errore**: la prima conversione era già "riuscita" e i file già registrati da reportlab quando il confronto delle metriche ha rivelato che le chiavi non coincidevano. Si scopre solo confrontando i due file.

**Cosa è stato verificato**, perché una conversione di font non si dichiara:

| controllo | esito |
|---|---|
| contorni | `glyf` su tutte e otto |
| avanzate e side bearing | **0 differenze** su 846 glifi × 8 facce — il testo non si rimpagina |
| nomi dei glifi, `cmap`, kerning GPOS | preservati |
| `OS/2` — `usWeightClass`, `fsType` | preservati |
| scarto max dei contorni | **0,16/1000 em** nel caso peggiore = 0,7 micron a 12pt (il limite garantito da cu2qu è 1/1000 em, 4 micron) |
| reportlab | registra tutte e otto |
| PDF di prova | **8 `/FontFile2`**, cioè le otto facce incorporate come sottoinsiemi TrueType; accentate italiane, euro e cifre resi corretti, verificato a video |

Il PDF di prova è `public/fonts/ttf/specimen-replicall.pdf`. **Il canale PDF è quindi aperto**, e ad Anagrafe non resta che copiare i `.ttf` e registrarli.

### La forma adottata

Otto `@font-face` in **`src/index.css`** — cioè nel workbench, non nel tema: ciò che sta in `src/` non viaggia col registry. I file vanno in `public/fonts/`, che il dev server di Vite serve sia sul workbench (5180) sia su Storybook (6006) — verificato, nessun `staticDirs` da aggiungere. I binari sono **esclusi dal repo** (`.gitignore`: `public/fonts/*` con l'eccezione del `LEGGIMI.md`; verificato mettendone uno e vedendo che `git add -A` indicizza solo il `LEGGIMI.md`).

Le facce dichiarate sono **otto**: 300, 400, 700, 900, ciascuna col suo corsivo — cioè la famiglia intera. Sono `.otf` con contorni CFF, ~157 KB l'una, perché è ciò che la licenza ha consegnato; convertirle in `.woff2` (~40 KB) modificherebbe il file, che è una domanda per Lineto e non una scelta tecnica.

Finché i file mancano, la console mostra un 404 per peso e tutto degrada al font di sistema. È il comportamento voluto — ed è anche il modo di vedere a colpo d'occhio se i file ci sono.

**Il tema distribuito non cambia:** continua a dichiarare solo lo stack e a non portare nessun binario. **D3 resta chiusa al default del v1** (lo carica l'app), e questa decisione non la riapre.

### I file sono arrivati, e la previsione si è misurata (2026-09-08)

Otto `.otf` forniti da Francesco. Ispezionati con `fontTools` prima di installarli: contorni **CFF** tutti e otto, `usWeightClass` **300 / 400 / 700 / 900**, `fsType` **4 — Preview & Print** (permesso di incorporamento *dichiarato dal file*: visualizzare e stampare sì, editing no; la tabella `name` rimanda comunque alla EULA Lineto, che è la licenza vera).

Caricati nel workbench, `document.fonts` riporta tutte e otto le facce `loaded`. E la sostituzione dei pesi, finora dedotta dalla specifica, ora è **misurata** — larghezza della stessa stringa a 40px:

| `font-weight` | larghezza | rende |
|---|---|---|
| 300 | 475.20 px | Light |
| 400 | 496.41 px | Regular |
| **500** (`font-medium`) | **496.41 px** | **Regular — identico a 400** |
| **600** (`font-semibold`) | **529.20 px** | **Bold — identico a 700** |
| 700 | 529.20 px | Bold |
| 900 (`font-black`) | 536.41 px | Heavy |

Le larghezze coincidono alla seconda cifra decimale: non è un'approssimazione, è lo stesso file. **Quattro gradini scritti, due resi**, confermato.

**Col font vero, i due gate restano verdi.** `Tema/Palette` e `Tema/Densità`: axe **0 violazioni, 0 incomplete** a 1440×900, nelle due densità. E le altezze della story `Tema/Densità` sono **identiche a quelle di M1.4** — 32px il bottone di default in normale, 48 in touch, 54 il `lg` — che è la conferma che vengono da `--spacing` e non dal carattere. Cambia il disegno delle lettere, non una misura.

### Prova del meccanismo (prima che i file arrivassero)

Messo un file di comodo al posto di un peso, `document.fonts` riporta quel peso `loaded` e gli altri `error`: i pesi presenti si attivano e i mancanti degradano **per quel peso soltanto**. Lo stack risolto sull'elemento radice parte da `Replicall`. Il file di comodo è stato rimosso. `public/fonts/` è servito sia dal workbench (5180) sia da Storybook (6006), quindi non serve toccare `staticDirs`. Il `.gitignore` è stato provato con un binario in cartella: `git add -A` indicizza **solo** il `LEGGIMI.md`.

---

## 13. I numeri nelle tabelle: `tabular-nums`, non un secondo font (2026-09-08)

Domanda di Francesco: nelle tabelle di dati — il computo metrico di Studio, gli elenchi di Anagrafe — le colonne di numeri si allineano con Replicall, o tocca passare al monospace per quelle colonne, «che si noterebbe»?

Il timore era fondato e la risposta è netta: **si allineano, con una utility, senza cambiare carattere.**

### Il fatto, letto dai file del font

Le cifre di Replicall sono **proporzionali di default** — nel Regular l'`1` è largo 380/1000 di em e il `4` ne è largo 580. Una colonna di importi scritta così non incolonna, ed è esattamente il difetto che si voleva evitare.

Ma il font dichiara la feature OpenType **`tnum`**, che sostituisce tutte e dieci le cifre con versioni a larghezza fissa. E la larghezza è **580/1000 di em su tutte e otto le facce** — Light, Regular, Bold, Heavy, tondi e corsivi. Non è un dettaglio: vuol dire che il **totale in grassetto si incolonna col corpo in tondo**, che è la cosa che serve davvero in un computo metrico.

In CSS: `font-variant-numeric: tabular-nums`, in Tailwind la utility **`tabular-nums`**. Nessun token nuovo, nessun componente nuovo — è già nel linguaggio.

### La regola, che cambia il v1

La style guide del v1 dice «Monospace solo per codici sistema **e dati tabellari**». **La seconda metà cade**; la prima resta, e vale la pena dire perché sono cose diverse: sui codici il monospace non serve a *incolonnare* — a quello basterebbe `tabular-nums` — serve a **far vedere che quella stringa non è prosa**. È un segnale, non una misura.

Il criterio operativo è una domanda sola: **la stringa si legge, o si trascrive?**

| `font-mono` — si trascrive | niente mono — si legge |
|---|---|
| codice articolo `TAS-04182-B`, numero DoP, lotto di produzione | importi, prezzi, quantità, misure |
| partita IVA, codice fiscale | date, percentuali, progressivi di riga |
| percorsi, token, hash, id tecnici | titoli, designazioni, note — prosa, e basta |

Un dettaglio che la story mostra e che conviene copiare: il codice porta anche `text-sm` e `text-muted-foreground`. Il monospace di sistema ha un'altezza-x più alta di Replicall e a parità di corpo sembra più grande — e un identificativo non deve pesare quanto la voce che identifica.

Regola scritta in `CLAUDE.md`; ricade su **M2.1** (`typography`) e **M2.4** (`table`), che porterà `tabular-nums` sulle colonne dichiarate numeriche perché le app non lo riscrivano a mano.

### La misura

Story `Tema/Cifre`, che misura invece di affermare. Stesso computo, stesse quattro voci più il totale in grassetto, reso nei due modi:

| | scarto del bordo dei decimali fra le 5 righe |
|---|---|
| default (proporzionali) | **2.38px** |
| con `tabular-nums` | **0px** |

Zero secco, riga «Sommano» in grassetto compresa. E le dieci cifre isolate: 6 larghezze diverse da 6.84px a 10.45px senza, **una sola larghezza — 10.45px** con (a `text-xl`, cioè 18px: 580/1000 × 18 = 10.44, che è la stessa misura letta dai file del font, per un'altra strada).

### Due trappole nel verificarlo

Entrambe portano a concludere che `tabular-nums` non funziona, quando funziona.

1. **`tnum` non tocca la punteggiatura.** La virgola e il punto restano proporzionali e **cambiano larghezza col peso**: 11,2px a 400 e 12,8px a 600, misurati a 40px. Quindi la larghezza dell'**intera stringa** `1.114,00` non coincide fra tondo e grassetto (72.73px contro 74.16px) anche quando le cifre sono perfettamente allineate. Le sole cifre, invece, coincidono al centesimo: 73.09px contro 73.09px.
2. **La virgola è il righello sbagliato.** Oltre a non essere tabellare è **crenata** col carattere che la precede, quindi si sposta di riga in riga. Misurando lì, la tabella tabellare risultava disallineata di 0.56px e sembrava un difetto. Il righello giusto è il **bordo sinistro del gruppo dei decimali**, ed è quello che la story usa.

### Lo zero, sui codici

Su un codice `0` e `O` si confondono, ed è il difetto che fa sbagliare una trascrizione. Il monospace di sistema li distingue di suo, quindi la regola qui sopra risolve anche questo. Se un giorno servisse un codice **nel carattere del testo**, Replicall porta la feature `zero` — in Tailwind `slashed-zero` — e funziona: verificato a video, lo zero barrato è un glifo diverso, non un'inclinazione sintetica. Oggi non si usa.

*(Il controllo su canvas non serve a verificarlo: `fontVariantNumeric` non è una proprietà di `CanvasRenderingContext2D`, quindi impostarla non fa nulla e le due varianti risultano identiche. Si guarda a video, ingrandito.)*

### Le altre feature che il font porta, e che non si usano

`zero` (zero barrato — utile sui codici, dove 0 e O si confondono), `onum` (cifre minuscole per la prosa), `lnum`, `pnum`, `frac`, `sups`, `subs`, `numr`, `dnom`, e undici set stilistici. Nessuna in uso: annotate perché esistano nella testa di chi progetta una pagina.

### Verifiche

axe-core su `Tema/Cifre`: **0 violazioni, 0 incomplete** in chiaro, in scuro e in densità touch, a 1440×900. `tsc`, `oxlint`, `build`, `build-storybook` verdi.

**Trappola d'ambiente, non di codice:** le utility del file nuovo non venivano generate affatto — `.tabular-nums` non esisteva nel CSS e anche `md:grid-cols-2` non applicava — perché il dev server di Storybook era in piedi da prima che il file esistesse e Tailwind non l'aveva ripreso. Si vede come un difetto di codice e non lo è. Riavviare il server.

### La stessa misura con Inter (rifatta il 2026-09-08, portata qui in M5.0a)

Le misure qui sopra sono di **Replicall**, il carattere di quando la sezione è stata scritta. Con il passaggio a Inter (§14) la pagina `Tema/Cifre` le ha rifatte dal DOM, e i numeri stavano finora solo in `WORKLOG.md` (voce del 2026-09-08) e in `CLAUDE.md`. In M5.0a la pagina è stata riscritta per chi legge da fuori e non li cita più a parole — li misura e basta — quindi vengono scritti qui, dove si cercano.

| | Replicall (sopra) | **Inter** |
|---|---|---|
| dieci cifre di default, a `text-xl` | 6 larghezze, 6.84–10.45px | **9 larghezze, 7,15–11,52px** |
| dieci cifre con `tabular-nums` | una sola, 10.45px | **una sola, 11,66px** |
| scarto del bordo dei decimali, default | 2.38px | **2,69px** |
| scarto del bordo dei decimali, `tabular-nums` | 0px | **0,04px** |
| virgola e punto fra peso 400 e 600 | cambiano (11,2 → 12,8px a 40px) | **stabili** |
| feature numeriche dichiarate | `zero onum lnum pnum frac sups subs numr dnom` | **`pnum frac numr dnom`** — niente `zero`, niente `onum` |

**I valori assoluti dipendono dal motore di resa, la forma no.** Riaperta nel pannello del browser dell'app il 2026-09-22 la stessa pagina dà 9 larghezze da 7,5 a 12,13px, una sola larghezza tabellare di 12,3px e uno scarto di 2,88px contro 0,04px: numeri diversi, stesso verdetto. È la ragione per cui la pagina li misura e non li scrive.

Lo **0,04px** non è un disallineamento: è l'arrotondamento del motore di resa, e la pagina lo giudica con una soglia di un quarto di pixel, tenendo sempre il numero esatto in vista. La soglia è nata proprio qui, quando un verdetto scritto «a zero secco» dichiarava ballerini i decimali per quattro centesimi di pixel.

Due conseguenze. **La trappola 1 qui sopra in Inter non scatta** — i separatori non cambiano col peso — e la pagina sceglie la frase in base alla misura invece di affermarla, perché resti vera al prossimo cambio di carattere. E **lo zero barrato non è più disponibile**: `slashed-zero` chiede la feature `zero`, che Inter non porta (§48).

---

## 14. Il carattere: Inter sullo schermo, Replica nelle stampe (deciso il 2026-09-08)

**Decisione di Francesco**, dopo il confronto misurato di cinque candidati nella demo «Carattere Tassullo». Chiude una questione che §12 aveva aperto e lasciata a M2.1.

### Cosa cambia

`--font-sans` del tema passa da `'Replicall', …` a **`'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`**. `--font-mono` non cambia. **Replicall esce dallo stack dello schermo** e resta nelle stampe PDF.

### Perché non Replica, che è il carattere del marchio

Perché non ha i pesi che servono. Replica LL ha **300, 400, 700, 900: 500 e 600 non esistono**, e non è che manchino i file — non esistono nel carattere. Ma il design system costruisce la gerarchia proprio su quelli (`font-medium` per le etichette, `font-semibold` per i titoli): la sostituzione di CSS manda 500 → 400 e 600 → 700, e **quattro gradini scritti ne rendono due**. Misurato in §12.

Il difetto era invisibile perché **nessuna app caricava Replica** — Studio compresa, verificata in produzione — quindi tutto rendeva in San Francisco, che 500 e 600 ce li ha. Sarebbe saltato fuori il giorno in cui un'app avesse finalmente caricato il carattere del marchio: il momento peggiore.

### Perché Inter

Dei cinque provati è l'unico che passa tutti e quattro i criteri misurati:

| # | carattere | punti | dove perde |
|---|---|---|---|
| **1** | **Inter** | 9/9 | — |
| 2 | Geist | 8/9 | cifra tabellare +6% fra 400 e 700: i totali in grassetto sfasano di 0,84px |
| 3 | Outfit | 7/9 | nessun corsivo disegnato |
| 4 | Replica LL | 7/9 | 2 gradini di peso su 4 |
| 5 | Albert Sans | 5/9 | nessuna cifra tabellare |

Ed è **SIL Open Font**: gratuito e ridistribuibile, che con Replica non era.

### Cosa NON è stato deciso, e va deciso

- **Come si serve Inter alle app in produzione.** Il workbench e Storybook lo prendono da Google Fonts, che per un ambiente di sviluppo va bene. Per le app è **parte di D3**: servire i font dai server di Google significa mandare l'indirizzo IP di ogni visitatore a un terzo, il che in UE è un tema — e la licenza OFL, a differenza di quella di Replica, **permette di auto-ospitarlo e di distribuirlo col registry**. È la prima volta che D3 ha una risposta possibile diversa da «lo carica l'app».
- **Se il marchio vuole Replica nei titoli.** Non si è fatto, e non si deve fare di iniziativa: un carattere fuori dallo stack apparirebbe solo sulle macchine che ce l'hanno installato, cioè renderebbe l'interfaccia diversa da persona a persona.

### Conseguenze già registrate

- **M2.1 non deve più decidere la gerarchia dei pesi**: con Inter i quattro gradini rendono distinti, misurato — 5 su 5 provati nella story `Tema/Carattere`.
- **Il canale PDF resta com'è**: Replica, `.ttf` convertiti (§12), e lì il limite dei pesi rimane — un PDF che volesse un semibold userà il Bold.
- **Lo stesso computo è in Inter a schermo e in Replica sul PDF.** È una scelta e va detta: lo schermo prende il carattere che lavora meglio, la carta quello del marchio.
- `public/fonts/` continua a tenere Replica fuori dal repo, ma ora **solo per le stampe**: nessuna pagina la carica più.

---

## 15. Il carattere si distribuisce col registry — e **D3 si chiude** (2026-09-08)

**Decisione di Francesco**: Inter va nel registry, così ogni app lo riceve installando il tema. Chiude D3, aperta dal piano e riformulata poche ore prima quando la scelta del carattere è passata da Replica a Inter (§14). La licenza lo permette — SIL Open Font — dove quella di Replica non lo permetteva; è ciò che ha reso la domanda rispondibile.

### L'accertamento che ha deciso la forma: **il registry non sa portare binari**

Provato prima di progettare, non supposto. Un `.woff2` da **73.016 byte** dichiarato come file di un item: nel JSON prodotto da `shadcn build` ne arrivano **69.186 caratteri**, e ri-codificandoli in UTF-8 non si torna all'originale. La CLI legge ogni file come **testo**, quindi i byte non rappresentabili vengono sostituiti.

Il guaio è che **non fallisce**: la CLI copia una stringa e dice «Created 1 file». Il font arriverebbe corrotto e il difetto si vedrebbe solo a video, come un carattere che non si carica senza che niente lo spieghi.

### La forma adottata: due item, e i font dentro il CSS

| item | cosa porta | dove atterra |
|---|---|---|
| `tema-font` | `inter.css` coi font in **data URI**, più la licenza OFL | `src/tassullo-inter.css`, `src/tassullo-inter-OFL.txt` |
| `tema` | `tassullo-theme.css` — dichiara `tema-font` fra le `registryDependencies` | `src/tassullo-theme.css` |

`npx shadcn@latest add @tassullo/tema` porta **tutti e tre i file** con un comando, e la CLI aggiunge da sé i due `@import` al CSS globale.

**Perché in data URI.** È l'unico modo di far passare un font da un canale che trasporta solo testo. Costa un terzo di byte in più del binario, e in cambio **l'app non fa nessuna richiesta di rete per la tipografia** — che era il punto di D3.

**Perché due item e non uno.** Il tema è anche documentazione: ha più commenti che dichiarazioni, e affogarlo sotto 200 KB di base64 lo renderebbe illeggibile. Separati, il tema resta leggibile e il font si scarica e si mette in cache per conto suo.

**Perché solo il sottoinsieme `latin`.** Copre italiano e tedesco: accentate e umlaut stanno in U+0000–00FF. `latin-ext` aggiunge l'Europa centrale e costa il doppio (130 KB contro 71). Se servisse, si aggiunge a `SOTTOINSIEMI` in `scripts/build-font-css.ts`.

**La licenza viaggia col font**, come l'OFL richiede: `tassullo-inter-OFL.txt` è un file dell'item e il campo `docs` dice che non si cancella.

### Niente `<link>` a Google, nemmeno nel workbench

Il `<link>` in `index.html` e il file `.storybook/preview-head.html`, aggiunti poche ore prima, sono stati **tolti**. `src/index.css` importa lo stesso `inter.css` che ricevono le app: altrimenti si svilupperebbe contro la copia di Google e si spedirebbe la nostra, che è il modo classico di scoprire una differenza in produzione.

La ragione di fondo è quella che ha chiuso D3: servire i font da un terzo significa mandargli l'indirizzo IP di ogni visitatore.

### Il file generato, e il gate che lo tiene onesto

`registry/tassullo/theme/inter.css` è **generato** da `scripts/build-font-css.ts` dai `.woff2` in `theme/fonts/` — stessa disciplina del tema: `npm run font:build` lo rigenera, **`npm run check:font` fallisce se diverge**, ed è entrato in `npm run check`. Un base64 modificato a mano non è ispezionabile a occhio: senza il gate, una divergenza sarebbe invisibile per sempre.

### Prova d'installazione (end-to-end, in locale)

`npx shadcn@latest add @tassullo/tema` da un'app Vite vuota:

- **tre file creati** con un comando — tema, font, licenza — e i due `@import` al posto giusto;
- `vite build` compila **211 KB** di CSS con **2 facce inlinate** e **zero riferimenti a `gstatic`/`googleapis`**;
- `--font-sans: "Inter", …` e `.text-title{font-size:var(--text-title)}`, cioè la densità continua a scattare;
- **i byte del font sopravvivono al viaggio**: 73.016 in casa e 73.016 nell'app, stesso `sha256`, identici anche al `.woff2` di partenza. È la verifica che il canale binario non superava, e la ragione per cui il base64 è la strada giusta.
- Nel workbench: **nessuna richiesta di rete per il font** (`performance.getEntriesByType('resource')` non ne riporta), 2 facce caricate, 5 pesi distinti su 5, axe 0/0.

---

## 16. Il canvas di Storybook prende i token, e i fondali sono le superfici del tema (2026-09-08)

Rilievo di Francesco, guardando `Tema/Carattere` e `Primitive/Button`: in modalità scura il fondo non diventava scuro, e i fondali offerti non erano quelli di Tassullo. Due sintomi, una causa sola: **il canvas non conosceva il tema**.

### Il difetto

Le story `layout: 'fullscreen'` — le pagine del tema — il fondo se lo dipingono da sé, e sembravano a posto. Quelle `layout: 'centered'`, cioè **quasi tutte le primitive**, venivano disegnate sul bianco di Storybook anche in scuro: il bottone si giudicava su un fondo che nel design system non esiste. Il difetto è rimasto in piedi finché qualcuno non ha guardato una primitiva in modalità scura.

Accanto, l'addon **backgrounds** di Storybook offriva un `light` e un `dark` suoi — `#F8F8F8` e `#333333` — *insieme* all'interruttore chiaro/scuro. Due controlli che sembrano fare la stessa cosa e non la fanno.

### La strada che sembrava giusta e non lo era

Configurare l'addon con le superfici del tema, `value: 'var(--background)'`, in modo che seguisse la modalità da sé. Sembra elegante e **non funziona**: l'addon **cuoce il valore** al momento in cui lo applica. Misurato — commutando su scuro il testo diventava chiaro e il fondo restava `oklab(0.9726 …)`, cioè quello *chiaro*: testo chiaro su fondo chiaro, illeggibile e senza errore.

### La forma adottata

L'addon è **spento**, e al suo posto c'è un interruttore nostro, «Superficie», fatto come la densità: un global scrive un attributo sul `<body>` del canvas, e il colore lo mette il CSS leggendo i token (`.storybook/preview.css`). Così `var()` resta vivo e la superficie **segue chiaro/scuro** da sé.

**Tre superfici, e non di più** — sono quelle per cui il tema dichiara *anche* il colore del testo, cioè le coppie che `check:contrast` verifica:

| superficie | fondo | testo |
|---|---|---|
| Pagina *(default)* | `--background` | `--foreground` |
| Card | `--card` | `--card-foreground` |
| Sidebar | `--sidebar` | `--sidebar-foreground` |

`--muted` non c'è di proposito: è un riempimento per chip e scheletri, non una superficie di pagina. Un fondale senza il suo testo verificato non è un banco di prova realistico — è un modo di rompere il contrasto senza accorgersene.

`Tema/Palette` non prende superficie né tema: è la pagina che le superfici le *mostra*, e dipinge il proprio fondo su ciascuna colonna.

### Verifiche

Le nove combinazioni superficie × modalità risolvono tutte alla coppia giusta, lette dal DOM:

| | chiaro | scuro |
|---|---|---|
| Pagina | `0.9726` su `0.1913` | `0.1913` su `0.9455` |
| Card | `0.994` su `0.1913` | `0.2264` su `0.9455` |
| Sidebar | `0.1913` su `0.7316` | `0.2264` su `0.7316` |

**Nessuna violazione nuova**: `Primitive/Button` in chiaro riporta esattamente le due note — `destructive` 3.82:1 e `link` 1.79:1 — con le stesse cifre già a verbale, in carico a M2.1.

### Una misura sbagliata, di nuovo, e vale la pena scriverla

Alla prima verifica axe dava **4** violazioni invece di 2. Le due in più erano `#ededeb` (il testo della modalità *scura*) su `#f6f6f4` e su `#babab9` — un grigio intermedio. Erano **artefatti della transizione**: avevo tolto `.dark` via JS e misurato dopo 700 ms, mentre i bottoni hanno `transition-colors` ed erano a metà strada. Rimisurato da pagina appena caricata: 2, con le cifre esatte.

È la stessa forma degli altri sbagli di questa sessione — il righello sulla virgola, il canvas per lo zero barrato, la larghezza per il corsivo. **Una misura che gira e restituisce un numero non è una verifica: lo è solo se misura la cosa giusta, nello stato giusto.**

---

## 17. L'interruttore del tema che commutava una volta sola (2026-09-08)

Rilievo di Francesco: «in Carattere/Cifre il tema scuro non viene applicato». Esattamente due story su cinque, e la causa non era dove sembrava.

### Cosa succedeva

Misurato commutando la modalità dal canale, cinque story a confronto:

| story | chiaro → scuro → chiaro → scuro |
|---|---|
| `Primitive/Button` | light → dark → light → dark ✔ |
| `Tema/Palette` | light → dark → light → dark ✔ |
| `Tema/Densità` | light → dark → light → dark ✔ |
| **`Tema/Carattere`** | light → dark → **dark → dark** ✘ |
| **`Tema/Cifre`** | light → dark → **dark → dark** ✘ |

Il primo cambio funzionava, il ritorno no. Nessun errore, in nessuna console.

### Due piste sbagliate, prima di quella giusta

1. **`themes: { chiaro: '' }`**, la stringa vuota passata a `withThemeByClassName`. Sembrava una causa credibile — rimuovere una classe vuota non è un'operazione valida — ma leggendo il sorgente dell'addon il caso è gestito (`classes.length > 0 &&`). Dare alla modalità chiara la classe **`light`** resta comunque giusto, ed è stato tenuto: il tema emette i token chiari su `:root, .light` dalla M1.3 proprio perché la modalità chiara si deve poter *dichiarare*.
2. **L'addon.** Sostituito con un decorator nostro, della stessa forma di quelli di densità e superficie. **Il difetto è rimasto identico** — la prova che l'addon non c'entrava.

### La causa

Un contatore di render nel decorator l'ha inchiodata: su `Tema/Cifre` il render si ferma a **2** e non riparte più, qualunque cosa si faccia. Su `Button` va 1, 2, 3, 4.

Le due story che fallivano hanno in comune un `useEffect` con **un array appena creato fra le dipendenze**:

```ts
useLarghezze(campioni.map((c) => c.testo + c.classi), '')   // Cifre
useLarghezze(PESI.map((p) => p.v))                          // Carattere
```

Un array è nuovo a ogni render: l'effetto riparte, chiama `setLarghezze` con un array nuovo, il render riparte, e si avvita. **React non interrompe questo ciclo e non stampa niente**, e il sintomo non ha nulla a che vedere con la causa: la story smette di rispondere agli interruttori della barra, perché il render non arriva mai a completarsi.

Corretto passando una **chiave primitiva** — `testi.join('|')` — che cambia solo quando cambia il contenuto.

### Cosa resta, e cosa se ne impara

- L'interruttore **Modalità** è ora scritto in `preview.tsx`, come Densità e Superficie: tre leve, tre decorator della stessa forma, tutte in casa. `@storybook/addon-themes` è uscito dagli `addons` — **rettifica di §8**, che lo teneva. Il pacchetto resta in `package.json` per M2.9.
- La regola: **una dipendenza di `useEffect` deve essere un valore primitivo o un riferimento stabile.** Un `.map()` inline fra le dipendenze è un ciclo infinito che non protesta.
- E la regola di metodo, la quinta volta in questa sessione: il sintomo non indica la causa. «Il tema non si applica» sembrava un problema di tema, e non lo era in nessuna delle sue parti.

### Verifiche

Le cinque story commutano ora in **entrambe le direzioni**, quattro cicli di fila, e la densità funziona sulle stesse. axe-core su `Tema/Carattere` e `Tema/Cifre`: **0 violazioni, 0 incomplete** in chiaro e in scuro.

---

## 18. Il primo token custom dentro un componente, e quanto costa (M2.1, 2026-09-08)

`PIANO.md` lasciava a M2.1 una decisione da prendere «consapevolmente, perché la stessa domanda tornerà a ogni primitiva»: il rimedio a `variant: destructive` del bottone introduce la **prima dipendenza di un componente shadcn da un token che il preset non spedisce**. Le quattro opzioni erano già misurate su `--destructive` `#DC2626`:

| opzione | contrasto | costo |
|---|---|---|
| `text-destructive-foreground` (custom Tassullo) | **4.83:1** | 1 token custom dentro un componente |
| `text-white` (builtin Tailwind, è ciò che usa lo style di default di shadcn) | 4.83:1 | nessuno, ma è un colore **fuori dal tema** |
| `text-background` (standard) | 4.46:1 | — non passa |
| `text-card` (standard) | 4.75:1 | nessuno, ma semanticamente sbagliato |

**Scelto `text-destructive-foreground`**, e non è stata una scelta fra pari: la **regola 3 del `CLAUDE.md`** — «le utility Tailwind si usano solo sui token del tema» — esclude `text-white` prima che se ne discuta il costo. Un `text-white` è un colore che nessun token dichiara e che nessun gate verifica; il giorno in cui il rosso di `--destructive` cambiasse, `--destructive-foreground` lo seguirebbe e `text-white` no. Il costo di aggiornamento si paga una volta a ogni versione di shadcn; un colore fuori dal tema si paga per sempre, e in silenzio.

Il contatore, che era a zero, è ora a **5**: `accent-ink`, `destructive-foreground`, `destructive-subtle`, `destructive-subtle-foreground`, `destructive-border`. Sono tutti e cinque dello stesso tipo — coppie che il tema dichiara **insieme al loro testo** e che `check:contrast` verifica come coppie. È il criterio da tenere: un token custom entra in un componente se il tema ne dichiara anche il contrasto. `check:registry` lo stampa a ogni esecuzione, che è il modo per non scoprire fra sei mesi che sono diventati quaranta.

---

## 19. Due falsi positivi del gate di aggiornabilità, e perché contano (M2.1, 2026-09-08)

`npm run check:registry` ha segnalato, su componenti **appena scaricati e non ancora toccati**, 2 errori e 6 avvisi su 7. Nessuno era vero.

1. **`"use client"`.** `shadcn view` restituisce sempre la direttiva; la CLI la **rimuove** scrivendo il file in un progetto `rsc: false` — che è il nostro. Il confronto di forma la vedeva come una divergenza nostra. Corretto togliendola da entrambi i lati, in `forma()` e in `estraiStringhe()` — la seconda serviva o le stringhe risultavano sfalsate di una, e un componente intatto contava «5 ri-stili» inesistenti.

2. **`<IconPlaceholder>`.** L'originale di `spinner` non è un componente ma un **template**: la CLI lo risolve a `add` sulla libreria d'icone dichiarata in `components.json`. Il file scritto non somiglia al template nemmeno prima che lo tocchiamo noi, e la forma non è confrontabile per costruzione. Ora è uno stato a sé (`◌`) con un avviso che dice cosa fare alla prossima versione di shadcn: **rileggerlo a mano**, perché lì il gate non protegge.

3. **La regex dei valori arbitrari** prendeva per valori due forme che sono varianti: il **nome di gruppo** fra parentesi e due punti (`group-data-[size=sm]/avatar:size-2`) e le parentesi **annidate** (`has-[>[data-slot=button-group]]:gap-2`). Sei avvisi su sette erano questi.

Perché non è manutenzione minore: **un gate che grida al lupo è un gate che si smette di leggere**, e il giorno in cui la segnalazione fosse vera passerebbe fra le altre. È lo stesso motivo per cui M2.9 non può mettere `a11y.test = 'error'` con violazioni note aperte — una CI rossa il primo giorno è una CI che qualcuno disattiva la settimana dopo.

Resta **un solo avviso vero**: `bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]` sull'hover di `variant: secondary`. **Tenuto**, ed è una scelta: è sintassi arbitraria ma non un colore arbitrario — è costruito interamente su due token del tema, non contiene nessun hex, e segue le due modalità da sé. Inventargli un token `--secondary-hover` significherebbe aggiungere alla palette un valore che nessuna app ha chiesto, e allontanare il file dall'originale shadcn per guadagnare nulla.

---

## 20. `typography` non esiste, e non lo scriviamo (M2.1, 2026-09-08)

L'accettazione di M2.1 elenca `typography` fra le primitive. **Non è un item del registry shadcn**: nel loro sito è una pagina di documentazione (verificato con l'MCP — 471 item, nessuno con quel nome, e nessuno che ci somigli sotto altro nome).

Salita la scala della regola 4bis: gradino 1 (esiste già?) no; gradino 2 (ri-stilare qualcosa) non c'è niente da ri-stilare; **gradino 3 — adattare il v1 perché entri nella forma shadcn — e lì finisce**, perché la scala tipografica del v1 è già interamente nel tema, sette gradini `--text-*` che Tailwind espone come utility. Un componente `<Titolo>` non aggiungerebbe nulla e toglierebbe due cose: la scelta del tag giusto per la struttura del documento, e la leggibilità di quale gradino si sta usando.

**Gradino 4 non raggiunto**: nessun componente nostro proposto, `registry/componenti-propri.json` resta vuoto. La tipografia è una **pagina della style guide** (`Primitive/Tipografia`) che fissa le sei parti di testo — titolo di pagina, di sezione, di card, corpo, meta, micro-etichetta — ciascuna come combinazione di utility, con le misure lette dal DOM nelle due densità.

### Rettifica, stessa giornata: si chiama `typeset`, e non l'avevo cercato

Rilievo di Francesco: <https://ui.shadcn.com/docs/typeset>.

La conclusione qui sopra **regge**, la premessa **no**. Era stato cercato `typography` — e con quel nome davvero non esiste nulla. Il nome giusto è **`typeset`**, e shadcn una risposta sul testo ce l'ha eccome.

**Non è comunque un item**, verificato in tre modi: `npx shadcn@latest view @shadcn/typeset` risponde `404 — not found at the registry`, `search -q typeset` non trova nulla, e la pagina rimanda a un generatore (`/typeset`) che emette un `typeset.css` da tenersi in casa. Quindi nessun `add` mancato, e `componenti-propri.json` resta vuoto a ragione.

**Ma risolve un problema diverso, che noi non abbiamo risolto.** `typeset` è l'equivalente shadcn di `prose` di Tailwind: un contenitore per il **contenuto lungo reso da markdown**, che stila i discendenti (`p`, `h1..h6`, liste, tabelle, codice, citazioni) ricavando tutto da tre variabili di ritmo — `--typeset-size`, `--typeset-leading`, `--typeset-flow` — più tre di carattere e la via d'uscita `not-typeset` / `data-not-typeset`. `Primitive/Tipografia` è un'altra cosa: la **cornice dell'interfaccia**, applicata per elemento con le utility, su gradini **enumerati** e non derivati.

I due non si sostituiscono, e M2.1 non ne è toccata. Ma il testo lungo nelle app Tassullo esiste — le descrizioni delle schede tecniche, l'editor di M3.8, il diff di M3.9, e le pagine MDX di questa stessa style guide — e oggi non ha una risposta. Da qui **D11**.

### Le tre misure da avere in mano quando D11 si deciderà

**1. I rapporti di `typeset` e la scala del v1 quasi coincidono.** Ponendo `--typeset-size: var(--text-base)`:

| | typeset (normale) | Tassullo | scarto | typeset (touch) | Tassullo | scarto |
|---|---|---|---|---|---|---|
| `h1` 1.75em | 24,50px | 26px (`--text-title`) | −1,50 | 26,25px | 28px | −1,75 |
| `h2` 1.25em | 17,50px | 18px (`--text-xl`) | −0,50 | 18,75px | 19px | −0,25 |
| `h3` 1.125em | 15,75px | 15px (`--text-lg`) | +0,75 | 16,88px | 16px | +0,88 |
| `h4` 1em | 14,00px | 14px (`--text-base`) | 0,00 | 15,00px | 15px | 0,00 |
| `h5` 0.875em | 12,25px | 12px (`--text-sm`) | +0,25 | 13,13px | 13px | +0,13 |
| `h6` 0.8125em | 11,38px | 11px (`--text-xs`) | +0,38 | 12,19px | 12px | +0,19 |

Cinque gradini su sei stanno **sotto il pixel**. Solo `h1` diverge di un pixel e mezzo — e si chiude scrivendo una riga, non rinunciando al sistema. È un argomento forte a favore: i rapporti di shadcn e la scala scelta a mano dal v1 descrivono quasi la stessa gerarchia.

**2. `typeset` legge già i nostri token.** `--color-foreground`, `--color-muted-foreground`, `--color-border`, `--font-heading`, `--font-mono`: tutti definiti dal tema Tassullo, tutti con un ripiego se mancassero. Entrerebbe senza inventare un colore, che è la condizione della regola permanente.

**3. Il punto di attrito vero: `typeset` porta una SUA leva responsiva, e si somma alla densità.** Il file emette

```css
.typeset { font-size: calc(var(--typeset-size) * 1.125); }
@media (min-width: 48rem), print { .typeset { font-size: var(--typeset-size); } }
```

cioè **sotto i 768px il corpo cresce del 12,5%**. Tassullo ha già una leva sullo stesso asse — la densità touch, ×1.08 sul testo — e le due si **compongono**: 14px sulla scrivania in normale → 15px in touch → **16,88px sul telefono in touch**, cioè **1,205×** il corpo di partenza, su una colonna che non si è allargata di un pixel.

È esattamente la cella `375px × touch` di **D10**, il cui verdetto è M4.2. Le due decisioni vanno quindi guardate insieme: adottare `typeset` senza neutralizzare quel `1.125` significherebbe scoprire in M4.2 un ingrandimento che nessuna delle due leve dichiara da sola.

### Il vincolo di adozione, deciso il 2026-09-08

Indirizzo di Francesco, dopo aver visto le due prove di propagazione qui sotto:

> «Confermo che i preset stanno nel registry. Nessuna app può modificarli, chiede eventualmente un'aggiunta al registry per casi specifici.»

Vale **a prescindere** dall'esito di D11: è la regola permanente applicata a una classe di artefatti nuova, e va scritta proprio perché il modello di shadcn spinge nella direzione opposta. `typeset.css` non contiene **nessun** preset — l'unica classe `.typeset-*` al suo interno è `.typeset-scroll`, l'involucro delle tabelle — e `.typeset-docs` / `.typeset-chat` sono esempi che la loro documentazione fa scrivere al consumatore nel proprio `globals.css`. Senza questa regola, «ogni app si scrive il suo preset» non sarebbe un rischio: sarebbe **l'esito predefinito**.

### Le due prove di propagazione (misurate su un'app usa-e-getta)

**Che una modifica arrivi.** Cambiato `--radius` nella fonte unica (`scripts/hex-to-oklch.ts`), poi `theme:build` + `registry:build`. Nell'app, **un comando solo** — `npx shadcn@latest add @tassullo/tema --overwrite` — e il file passa da `0.625rem` a `0.9rem` **senza toccare nessun file dell'app**. Poi tutto ripristinato: repo pulito, `npm run check` verde.

**Che una personalizzazione locale non sopravviva.** Nell'app è stato scritto `--radius: 0rem; /* ci piacciono gli angoli vivi */`. Al primo aggiornamento: `Updated 1 file`, valore e commento **spariti, senza un avviso**. È brutale ed è il punto: un'app che si personalizza in casa o perde la modifica al primo aggiornamento, o smette di aggiornare — e il secondo è la deriva, solo più lenta.

### Due precisazioni oneste su come si fa rispettare

**1. «Nessuna app può modificarli» è disciplina, non meccanismo.** Il preset, una volta installato, è un file dentro l'app: niente le impedisce tecnicamente di aprirlo. Ciò che la regola ottiene è che modificarlo sia **inutile** — l'aggiornamento lo sovrascrive — non che sia impossibile. `check:registry` sorveglia i nostri componenti, ma **non può ispezionare un consumer**: da qui non si vede la deriva di un'app. Il posto dove questa regola diventa esigibile è quindi **M5.4** (il blocco di regole per il `CLAUDE.md` delle app) e **M5.5** (la guida di migrazione), non un gate di questo repo.

**2. Esiste una leva locale legittima, e non causa deriva.** `typeset` prevede `not-typeset` / `data-not-typeset` per escludere un sottoalbero dallo stile della prosa. È il modo corretto perché un'app risolva un caso particolare **senza toccare i preset** e senza chiedere niente al registry. La richiesta di aggiunta al registry serve per un preset *nuovo* — una densità di lettura che non abbiamo — non per un'eccezione puntuale.

### Come si divide il file, se si adotta

| parte | righe | canale di aggiornamento |
|---|---|---|
| **preset** (le sole variabili di ritmo) | ~6 per preset | nostri, nel registry, propagati con `add --overwrite` |
| **motore** (`typeset.css`, i selettori) | 491 | **nessuno a monte**: generato una volta dal loro builder, poi nostro per sempre |

Il motore è l'unico punto in cui `typeset` è **peggio** di un componente: non ha `shadcn view`, quindi non è diffabile come fa `check:registry`. Il rimedio è la stessa disciplina, applicata a mano: l'originale generato va in `registry/.upstream/`, e si rigenera dal builder per vedere cosa hanno cambiato loro.

---

## 21. Due requisiti d'uso di Base UI che shadcn non documenta (M2.3, 2026-09-09)

Sono due, li ha trovati questa sessione, e il primo **non degrada: lancia**.

### 21.1 `DropdownMenuLabel` va dentro un `DropdownMenuGroup`

`Menu.GroupLabel` di Base UI pretende il contesto del gruppo e, se non lo trova, **lancia**: *«MenuGroupContext is missing. Menu group parts must be used within `<Menu.Group>` or `<Menu.RadioGroup>`»* — Base UI error **#31**. Il menu non si apre affatto e la story sparisce dalla pagina.

Gli esempi di shadcn mettono `DropdownMenuLabel` in cima al contenuto, **fuori** da qualsiasi gruppo, cioè nella forma che fallisce. Quattro story su cinque, in questa sessione, sono state scritte così e sono crollate all'apertura; lo stesso vale per `ContextMenuLabel`. Vale anche il `RadioGroup` come contenitore, ed è la forma giusta per l'intestazione di un gruppo di scelte.

Perché non si vede prima: il componente si legge senza sospetti, il gate di aggiornabilità non ha niente da dire (è una forma **d'uso**, non del file), e il difetto compare **solo aprendo il menu** — cioè in una misura che fino a M2.3 non si riusciva a prendere (vedi §22).

### 21.2 Un popup con `role="dialog"` vuole un nome accessibile

Un `PopoverContent` senza `PopoverTitle` dà `aria-dialog-name`. Misurato su due story di questa sessione, scritte senza titolo perché «contengono solo una frase». Il titolo si può nascondere con `sr-only` — è quel che fa `CommandDialog` — ma non si può omettere. Stesso requisito già noto per `dialog` e `sheet`, che qui vale anche dove il riquadro non sembra una finestra.

**Il seguito operativo di entrambi**: sono requisiti che **ogni app consumer sbaglierebbe una volta**, come il `select` che vuole `items` (§ M2.2). Stanno scritti nelle story delle rispettive primitive, in pagina, perché li si sbagli zero volte.

---

## 22. Perché fino a M2.3 i popup non si potevano misurare, e come si è risolto (M2.3, 2026-09-09)

M2.2 ha consegnato un rilievo aperto: *«il `select` aperto non è verificabile nel pannello del browser»*. La causa è stata isolata qui, ed è una sola, misurata:

```
document.visibilityState === 'hidden'   →   requestAnimationFrame NON scatta
```

Il pannello del browser dell'app tiene la pagina **nascosta** anche mentre la si guida. Base UI schedula in `rAF` lo spostamento del fuoco dentro il popup: con `rAF` fermo il fuoco resta sul grilletto, le frecce non rispondono, e **il componente sembra rotto mentre è sano**. Non è una lentezza da aspettare: non scatta mai, misurato con un timeout di 800ms.

Un secondo effetto, più insidioso, si somma al primo: **i tasti non arrivano alla pagina finché non ci si è cliccato dentro davvero**. Prima di un clic reale, `keydown` non registra nessun evento — zero, nemmeno non fidati. Sono due strumenti rotti che si mascherano a vicenda, e insieme producono la conclusione sbagliata «il popup non risponde alla tastiera».

### La misura si è presa altrove

Chromium di Playwright, dalla cartella di lavoro temporanea, contro lo **Storybook costruito** servito in HTTP. Lì `rAF` scatta in 0ms e la tastiera arriva. Con quello:

- **il rilievo di M2.2 si chiude**: il `select` aperto funziona da tastiera in tutto il percorso — `Invio` apre e porta il fuoco sulla voce, le frecce scorrono, la **lettera** salta («p» → Pubblicato), `Invio` sceglie e chiude, `Esc` chiude senza cambiare, e il fuoco torna sul grilletto ogni volta;
- **sono comparse violazioni axe che prima non si vedevano**, non perché siano nuove ma perché **i popup ora si aprono** durante la scansione. È il rilievo che M2.9 deve conoscere prima di accendere la CI: il registro delle violazioni cambia quando la misura diventa capace di aprire ciò che misura.

**Playwright non è stato aggiunto al repo**, di proposito: l'imbracatura dei test in CI è una scelta di **M2.9**, e anticiparla qui l'avrebbe decisa di fatto. Qui serviva una misura, non un'infrastruttura.

### Un terzo strumento sbagliato, e vale la regola di sempre

Un helper scritto in fretta per il contrasto componeva **sempre su bianco** il fondo dei nodi semitrasparenti: in modalità scura ha dato **1.55:1** su un bottone `outline` dentro il drawer. Rifatta impilando la catena dei fondi nell'ordine giusto: **13.74:1** (17.03 in chiaro). Terza volta in tre sessioni che lo strumento accusa il componente — vedi la regola in coda a §17: **prima di scrivere che un componente è rotto, si verifica che lo strumento non lo sia.**

---

## 23. Terza e quarta normalizzazione del gate di aggiornabilità (M2.3, 2026-09-09)

Seguito diretto di §19, stessa ragione: **un gate che grida al lupo si smette di leggere**.

1. **`cn-font-heading`.** `shadcn view` lo restituisce sui titoli di `dialog`, `alert-dialog`, `sheet` e `drawer`; la CLI lo **toglie** scrivendo il file. Il gate lo contava come nostro ri-stile: due stringhe su `alert-dialog`, una su `drawer`, su file **appena installati e mai aperti**. Stessa natura di `"use client"`.

2. **L'alias del registry.** Gli import fra componenti arrivano da `view` come `@/registry/base-nova/ui/x` e la CLI li riscrive su `@/registry/tassullo/ui/x`. È una stringa, quindi finiva nel conto delle «stringhe di classi ri-stilate» — ma è un **percorso**, non una classe, e cambia da sé a ogni `add`. Conseguenza: ogni componente che ne importa un altro risultava ri-stilato di almeno una stringa appena uscito dall'installazione.

Effetto sui conti già a verbale, che erano gonfiati: `field` **5 → 3**, `input-group` **8 → 5**, `button-group` **5 → 4**, `alert-dialog` e `drawer` **→ 0**. I numeri di M2.1 e M2.2 vanno letti con questa correzione.

3. **Una riga per componente.** Il ramo del segnaposto d'icona introdotto in M2.2 stampava la sua riga `◌` e poi **cadeva** in fondo al ciclo, aggiungendone una seconda che diceva «forma identica all'originale» — cioè esattamente l'affermazione che la riga sopra aveva appena dichiarato impossibile. Con undici overlay in più erano sette componenti raccontati due volte e in contraddizione con sé stessi.

---

## 24. Le classi `cn-*`, e la trappola del `--font-heading` che nessuno vedrebbe (M2.3, 2026-09-09)

Nata da un'osservazione di Francesco: «l'apertura del menù del nostro `select` è diversa da quella di shadcn, forse c'è un'opzione non attiva».

### Cosa sono

`shadcn view` restituisce cinque marcatori che **non sono classi CSS**: `cn-menu-target`, `cn-menu-translucent`, `cn-font-heading`, `cn-rtl-flip`, `cn-logical-sides`. La CLI li **risolve a `add`** leggendo `components.json`, e nel nostro registry ne sparivano **16 occorrenze su 7 file**.

Verificato che non stiamo perdendo niente, in tre modi:

1. **Il codice della CLI.** Con `menuColor: "default"` — che è il nostro valore, il default dello schema **e** quello di tutti i preset (nova, vega, maia, lyra, mira) — `cn-menu-target` e `cn-menu-translucent` vengono semplicemente **cancellati**, senza sostituzione. Diventano utility vere solo con `inverted` (→ `dark`) o con le varianti `-translucent` (→ merge di utility di sfocatura). `cn-rtl-flip` sparisce perché abbiamo `rtl: false`, ed è corretto: italiano, inglese e croato.
2. **Il sito di shadcn.** Lì le classi restano nel sorgente pubblicato, ma hanno **zero regole** in tutti i fogli di stile della pagina: sono marcatori inerti anche a casa loro.
3. **Il confronto a parità di contenuto.** Il nostro `select` aperto contro quello della loro pagina: **stesse classi del popup** (tolte le due inerti), **stesso padding**, **stessi figli**, **stesse classi delle voci**. Divergono solo i **nostri token** — raggio della voce **6px** (il nostro `--radius-md`) contro 8, e i colori della palette Tassullo.

Quindi: nessuna opzione spenta per sbaglio. Ma due cose vanno sapute.

### 24.0 Rettifica: una differenza c'era, e non era nei token

La prima conclusione di questa sezione — «divergono solo i nostri token» — era **sbagliata**, e l'ha smentita Francesco guardando le due tendine aperte affiancate. Il confronto automatico che l'aveva prodotta misurava il popup e la voce, ma **non ciò che sta in mezzo**, e stampava «identico» senza i valori: così la differenza non si vedeva né a schermo né nel verbale.

Misurato daccapo, coi numeri in chiaro:

| | loro | nostro (prima) |
|---|---|---|
| catena nel DOM | `select-content` → div → **`select-group`** → voci | `select-content` → div → voci |
| rientro della voce | **4px** per lato | **0px** |

**Il `p-1` che stacca le voci dal bordo sta su `SelectGroup`** (`scroll-my-1 p-1`), non su `SelectContent`, che ha padding **0**. Mettere gli `SelectItem` direttamente dentro `SelectContent` — la forma più naturale da scrivere — fa arrivare la riga evidenziata a filo del bordo, con gli angoli arrotondati che spariscono contro il bordo del riquadro. Tre story su quattro erano scritte così.

Non è un difetto del componente (identico a shadcn) né un'opzione di `components.json`: è come shadcn ha distribuito il padding fra le parti. **Il gruppo si usa anche quando è uno solo, e anche senza `SelectLabel`.** Corretto nelle story e scritto in pagina.

**Il metodo che ha fallito, e vale più del caso**: un confronto che dice «identico» senza mostrare il valore non è una misura, è una rassicurazione. Se avessi stampato `rientroSinistro: 4` contro `0` l'avrei vista al primo giro. Vale per il prossimo confronto automatico che si scrive.

### 24.1 Un'opzione mai esercitata, non un errore

`menuColor` ammette quattro valori — `default`, `inverted`, `default-translucent`, `inverted-translucent` — e `menuAccent` due, `subtle` e `bold`. Siamo sui default di shadcn, che nessuno ha scelto: li ha messi `init`. Cambiarli è una decisione legittima e **visibile su tutti i menu**, ma non è gratis: la CLI li applica **al momento di `add`**, quindi andrebbero riscaricati e **ri-stilati a mano** i file interessati. Se un giorno si volessero i menu traslucidi o scuri, si fa lì e si scrive qui perché.

### 24.2 La trappola vera: `--font-heading` dietro un `@import` non si vede

`cn-font-heading` è l'unico dei cinque che **dipende da noi**. La CLI lo tiene — trasformandolo nell'utility `font-heading` — **solo se trova la stringa letterale `--font-heading:` dentro il file indicato da `tailwind.css`** in `components.json`, cioè `src/index.css`. È una ricerca testuale su **un solo file**: la CLI **non segue gli `@import`**.

Il nostro `--font-heading` **esiste** — `tassullo-theme.css` riga 268, `var(--font-sans)` — ma sta dietro un `@import`. La CLI non lo vede, e toglie la classe dai titoli di `dialog`, `alert-dialog`, `sheet` e `drawer`.

**Oggi è innocuo per fortuna, non per progetto**: `--font-heading` vale `var(--font-sans)`, cioè Inter, lo stesso corpo del testo (§14, D3). L'utility che viene tolta renderebbe identico. **Il giorno in cui i titoli avessero una faccia diversa, non si applicherebbe — e in silenzio.**

Il rimedio, se e quando servirà, è una riga: dichiarare `--font-heading` **anche** in `src/index.css`, o puntare `tailwind.css` al file del tema. Non si fa adesso perché sarebbe una seconda copia di un token, cioè la deriva che la regola permanente vieta, per un problema che oggi non esiste. Ma va saputo prima di cambiare il carattere dei titoli, non dopo.

**Rettifica a §23**: lì `cn-font-heading` era archiviato come «trasformazione della CLI, non una nostra divergenza». Vero, ma incompleto — non diceva **da cosa dipende**, e da cosa dipende è questa trappola.

---

## 25. Quinta normalizzazione del gate: l'import di React che shadcn spedisce inutilizzato (M2.4, 2026-09-09)

Terzo seguito di §19 e §23, e per una volta non è una trasformazione della CLI: è un **difetto del sorgente originale**.

`scroll-area.tsx` esce da `shadcn add` con `import * as React from "react"` in testa e **non usa React da nessuna parte**: tutti i tipi vengono da `ScrollAreaPrimitive.*.Props`. Sotto il nostro `tsconfig`, che ha `noUnusedLocals: true`, quel file **non compila** — `tsc -b` esce con `TS6133: 'React' is declared but its value is never read`.

Quindi non c'è una scelta da fare: o si toglie quella riga, o il componente non entra nel repo. Ma il confronto di forma la leggeva come **divergenza strutturale**, cioè come il tipo di modifica che al prossimo aggiornamento di shadcn non si riesce più a riportare — ed è falso: è una riga morta che il compilatore rifiuta. Aggiunta la normalizzazione, che azzera l'import da **entrambi** i lati.

**Cosa non fa, ed è la parte che conta.** La regexp è ancorata alla riga intera e al solo import *namespace* di React (`import * as React from "react"`). Un import diverso — o l'aggiunta di un import nostro — resta una divergenza. Verificato sul campo prima di considerarla chiusa: aggiungendo un `import { useMemo } from "react"` a `scroll-area.tsx` il gate torna **rosso**. Una normalizzazione che acceca il gate sarebbe peggio del falso positivo che chiude.

Vale la pena aspettarselo su altri file: è plausibile che altri componenti shadcn portino lo stesso import morto, e da qui in poi il gate non lo confonderà più con una nostra modifica.

---

## 26. La scala delle serie dei grafici, e un selettore shadcn che Recharts 3 ha reso stale (M2.8, 2026-09-10)

### 26.1 `--chart-1..5` non sono cinque colori, sono cinque pioli

Il v1 non ha una palette categorica. Il requisito che la determina è quello del piano e **non è estetico**: cinque serie che restino distinguibili **anche in scala di grigi**. Distinguerle in grigio vuol dire una cosa sola — luminanze diverse e regolarmente spaziate — quindi la scala si costruisce sulla chiarezza, e la tinta viene dopo.

**Il passo non è stato scelto.** `--primary` `#F4AC3D` e `--success` `#1CAC7C` stanno a **1.4935:1** di contrasto WCAG l'uno dall'altro: misurato, non deciso. Quel rapporto è il passo di tutta la scala, e i primi due pioli sono i due colori Tassullo **tali e quali** (`serieAlPiolo` restituisce la sorgente quando questa sta già sul piolo, così `--chart-1` è esattamente `#F4AC3D` e non un arrotondamento). Se un giorno cambia il brand, cambia il passo e la scala si riallinea da sola — è la stessa costruzione di `deriveInfoBorder` (§ della mappa in `PIANO.md` §2bis).

Le tinte sono cinque token esistenti: `primary`, `success`, `info` **nella versione scura** (`#4BAFF2`, l'unica che si vede — M1.3), e `muted-foreground` due volte. Le serie 4 e 5 sono lo stesso neutro caldo a due pioli diversi, ed è voluto: due grigi separati dalla sola chiarezza sono per costruzione la coppia più sicura in scala di grigi e per il daltonismo.

**Sullo scuro la scala sale di un piolo esatto**, dello stesso passo. Entrambi i limiti sono misurati, e sono loro a togliere la scelta:

| | |
|---|---|
| all'altezza chiara, `--chart-5` contro la card scura | **1.78:1** — una barra che non si vede |
| salita di un piolo | **2.64:1** |
| salita di un piolo e mezzo, `--chart-1` contro il fondo | **16.13:1**, cioè **più del testo di pagina** (15.71:1) |

Un dato più marcato del testo non è più un dato: un piolo è il massimo che ci sta. Il gate lo verifica con la regola «serie mai oltre il testo di pagina», che vale in entrambe le modalità senza saperne il verso.

**Quello che la scala non garantisce, e che va detto.** La serie più chiara sta a **1.91:1** dalla card in chiaro, la più scura a **2.64:1** in scuro: sotto i 3:1 che la WCAG 1.4.11 chiede a un oggetto grafico **quando il colore è l'unico mezzo**. Non lo è mai, e non deve diventarlo — legenda, etichette diritte sui dati, tratteggi diversi per le linee. E non è una rinuncia ma aritmetica: cinque pioli da 3:1 fanno 81:1, contro i **21:1** che l'intera gamma sRGB permette. La scala arriva fin dove può, il resto lo fa l'etichetta.

**Il gate è cresciuto di quattro controlli** (`npm run check:contrast`, sezione «scala delle serie», per modalità): il passo in grigio fra pioli adiacenti (≥ 1.45, misurato 1.483–1.506); ogni serie contro la card (≥ 1.5); nessuna serie oltre il testo; e le tre simulazioni di deficit di percezione del colore — deuteranopia, protanopia, tritanopia — con ΔE2000 ≥ 5 fra ogni coppia. Quest'ultimo **non è il garante della distinzione**: quello è il passo in grigio, che vale per tutti e tre i deficit insieme perché nessuno di essi tocca la luminanza. Serve a un caso solo, accorgersi se una coppia **collassa**. Minimo misurato **8.5** (`chart-1`/`chart-2` in scuro, protanopia), cioè nessuna coppia è vicina a collassare.

### 26.2 Il selettore delle etichette d'asse, stale contro Recharts 3

`chart.tsx` esce da shadcn con `[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground`. **In Recharts 3 quella classe non esiste più** sul gruppo che contiene le etichette: il `<g>` ora è `recharts-cartesian-axis-tick-label`, dentro `recharts-cartesian-axis-tick-labels`. Il selettore non aggancia niente, e il testo degli assi resta al `fill="#666"` che Recharts cuce nel proprio SVG.

Misurato sulle story di M2.8, col colore fatto risolvere al motore di resa: **5.64:1 in chiaro e 2.97:1 in scuro**, cioè testo sotto soglia in modalità scura. Non è un difetto nostro e **axe non lo trova** — lo dà come `color-contrast` *incomplete*, perché è testo SVG.

Corretto ri-stilando la sola stringa di classi (gradino 2), agganciando la classe del **testo** invece di quella del gruppo: `[&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground`. Dopo: **5.37:1 e 7.17:1**, cioè `--muted-foreground` in entrambe le modalità, come il preset intendeva.

Gli altri quattro selettori a colore cotto del preset sono stati verificati uno per uno e **agganciano ancora**: griglia (`border/50`), cursore del tooltip (`fill-muted`, misurato `#2E2E2E` in scuro), settori della torta (`stroke` trasparente), punti. Vale la pena rifare questa verifica a ogni aggiornamento maggiore di Recharts: sono selettori su classi di una libreria terza, cioè la parte più fragile del componente.

**Ricaduta sul gate.** `check:registry` segnalava come «colore esadecimale nel sorgente» gli `#ccc` e `#fff` di quei selettori. È un **falso positivo**: lì l'hex non è un colore che scriviamo, è un colore che *intercettiamo*, e toglierlo spegnerebbe l'override lasciando il grigio di Recharts. La normalizzazione ora ignora gli hex dentro un selettore d'attributo (`[stroke='#ccc']`) e continua a rifiutare tutto il resto — `bg-[#F4AC3D]` resta un errore.

### 26.3 Recharts ordina legenda e tooltip in ordine alfabetico

`Legend` ha `itemSorter: "value"` come predefinito e `Tooltip` ha `itemSorter: "name"`. Il risultato è una legenda che non segue le serie: nel grafico a linee le curve stanno in ordine di grandezza e la legenda diceva «Additivi, Calcestruzzi, Inerti, Malte, Prefabbricati», un ordine che nel disegno non esiste.

Si spegne **in composizione**, senza toccare il componente: `itemSorter={null}` sulla legenda e, per il tooltip — che non accetta `null` — un comparatore costante, che lascia l'ordine di dichiarazione perché l'ordinamento di Recharts è stabile. Da sapere prima di comporre un grafico: **la legenda giusta va chiesta**, non arriva da sé.

### 26.4 Cosa dà il componente e cosa dà Recharts (M2.8, dopo i rilievi di Francesco)

Domanda destinata a tornare a ogni grafico nuovo, quindi scritta qui. **La legenda è già nel componente** — `ChartLegend` e `ChartLegendContent` sono esportati da `chart.tsx` — ma **va messa in composizione**: Recharts non la disegna da sé. Vale identico per il tooltip (`ChartTooltip` + `ChartTooltipContent`), la griglia (`CartesianGrid`) e le etichette sui dati (`LabelList`). Il componente shadcn dà il **vestito** — token del tema, etichette in italiano dal `config`, cifre tabellari — e Recharts dà i **pezzi**: quello che non si scrive non compare.

**La ciambella non è un altro grafico e non è un altro componente**: è `innerRadius` sullo stesso `Pie`. Nel registry shadcn `chart-pie-donut` e `chart-pie-donut-text` sono **esempi**, non item installabili — cercare un `donut` è tempo perso.

**Le etichette della torta vogliono il `label` di Recharts, non `LabelList`.** `LabelList` con `position="outside"` appoggia il testo sul bordo della fetta; il `label` disegna una **lineetta di richiamo** e lo tiene staccato — è la strada dell'esempio `chart-pie-label`, cioè il gradino 1. Il `label` scrive però il valore di `nameKey` così com'è, cioè la **chiave**: l'etichetta in italiano va tradotta leggendo il `config`, che resta il posto unico dove i nomi stanno scritti. E il colore del testo va chiesto — `[&_.recharts-pie-label-text]:fill-foreground`, ri-stile che shadcn stesso documenta: le etichette della torta sono l'unico testo del set che Recharts non lascia ereditare.

### 26.5 I «warning» del pannello Accessibility su un grafico sono strutturali

Su ogni story di `chart` il pannello segnala `color-contrast` come ***incomplete*, gravità serious**, in numero (158 su 12 scansioni in M2.8). La motivazione che axe dà è esplicita: *«Element's background color could not be determined because element contains an image node»* — c'è un SVG dietro il testo e lo strumento non sa che colore ci sia sotto. **Su un grafico è la norma, non l'eccezione**, e nessuna di queste è una violazione.

Ma non vanno archiviate in blocco, e M2.8 ne è la prova: il difetto vero della sessione — il `#666` degli assi, **2.97:1 in scuro** (§26.2) — stava dentro questo mucchio, con la stessa riga *serious* e senza numero delle altre. La regola operativa che ne esce, in carico a **M2.9**: le *incomplete* si **misurano**, coi colori risolti dal motore di resa, non si contano. In M2.8 il minimo vero è **5.37:1**.

### 26.6 La rampa monocroma del brand, e perché le aree Tassullo si riempiono piene

**`--chart-mono-1..5`** (M2.8, secondo giro) — **tolta il 2026-09-21, M4ter.11.** Erano gli stessi cinque pioli della scala categorica, tutti alla tinta dell'arancio del brand, e per costruzione ereditavano il passo in grigio: erano l'unica famiglia del tema leggibile in bianco e nero. Con la tavolozza categorica passata a dieci tinte quella garanzia non c'è più (§49), le story che mostravano la rampa sono state tolte insieme al controllo `colori` — e un token che nessuno guarda si degrada in silenzio. Chi ha bisogno del bianco e nero porta la distinzione con altro: tratteggi, etichette scritte sui dati, riempimenti a trama.

| | chiaro | scuro |
|---|---|---|
| mono-1 | #F4AC3D | #FFDDB0 |
| mono-5 | #603D00 | #815500 |

Quando si usa, ed è una scelta di **significato**, non di gusto: le cinque tinte categoriche dicono «cinque cose diverse», la rampa dice «la stessa cosa, di più». Su categorie **ordinate** — poco, medio, molto — la categorica è sbagliata; e su una serie sola prendere un arancio, un verde e un blu non ha senso, il grafico deve restare del colore dell'app. È la stessa idea degli esempi shadcn che usano sfumature del colore d'accento, tradotta nella nostra costruzione invece che scelta a occhio.

**Le aree.** Gli esempi shadcn riempiono le aree a `fillOpacity={0.4}`, perché sovrapposte devono lasciarsi attraversare. Da noi quel valore **rompe il requisito di M2.8**: l'opacità mescola il colore della serie col colore della card, e la mescolanza schiaccia la scala verso il fondo. Misurato sui colori composti dal motore di resa, con cinque aree:

| | passi in grigio |
|---|---|
| piene (`fillOpacity 1`) | 1.493 · 1.496 · 1.486 · 1.483 |
| traslucide (`0.4`), chiaro | **1.166 · 1.146 · 1.061 · 1.118** |
| traslucide (`0.4`), scuro | **1.285 · 1.238 · 1.199 · 1.171** |

A 1.06 due serie adiacenti sono lo stesso grigio. Quindi la regola Tassullo: **le aree si riempiono piene e si impilano.** Impilate non si sovrappongono, non c'è niente da attraversare, l'opacità non serve e la scala resta intera. Se servono serie che si **sovrappongono**, il grafico giusto è quello a **linee** — non un'area trasparente.

È la **quarta volta** che l'opacità cambia un colore in composizione senza che nessun token la dichiari, dopo il testo d'errore (M2.2), l'etichetta della sidebar (M2.5) e il giorno disabilitato (M2.7). `check:contrast` verifica i token, non come i componenti li compongono: è il limite noto, e il rimedio resta la misura a mano — in carico a **M2.9**.

### 26.7 I controlli stanno dentro la story del grafico, non in un banco a parte

Prima stesura: una story `Banco` con tutti gli interruttori e le altre senza. **Cambiata su indicazione di Francesco**: ogni tipo di grafico porta i propri controlli, e nasconde quelli che non lo riguardano (`solo(...)` disabilita gli altri in `argTypes`). Il motivo è pratico e vale oltre `chart`: un controllo che non fa niente è peggio di un controllo che manca, e chi guarda la story delle barre vuole provare *quelle*, non scegliere il tipo di grafico da un elenco.

C'era anche una story `In scala di grigi` — lo stesso grafico due volte, il secondo passato per `grayscale` — ed è stata **tolta**: una volta che il controllo `colori` porta il grigio dentro ogni grafico, quella story mostrava il criterio su **un** caso invece che su tutti, e per giunta su un caso costruito apposta. Il criterio di accettazione di M2.8 non si è indebolito, ha cambiato posto: la prova a occhio si fa su qualsiasi grafico mettendo `colori` su `grigio`, e la prova col numero resta `npm run check:contrast`, che misura la luminanza vera invece dei pesi che il filtro CSS applica ai valori sRGB non linearizzati.

Gli argomenti dichiarati sono nove, e ognuno è una scelta vera, non un vezzo: `serie` (1–5), `colori` (categorici / arancio / grigio), `legenda`, `griglia`, `etichette`, `pallini`, `tratteggi`, `impilato` (barre e aree), `orizzontali` (barre — `layout="vertical"` in Recharts, che è il nome al contrario e va saputo; servono quando le categorie hanno nomi lunghi). `curva` passa da `linear` a `natural`, e anche lì c'è un significato: una spezzata dice «ho misurato qui, qui e qui», una curva morbida suggerisce un andamento che nessuno ha misurato — su dati mensili radi la spezzata è più onesta, ed è il default.

**Le etichette sui dati vogliono `offset={12}`**, non i 5 di default: è la misura degli esempi shadcn, ed è quella che tiene il numero staccato dalla linea invece che appoggiato sopra. Rilievo di Francesco, verificato a occhio in un browser vero.

### 26.8 Quattro difetti trovati guardando le story, e il tetto della scala

Rilievi di Francesco sullo Storybook, tutti misurati prima di correggerli.

**1. Il totale della ciambella non è centrato quando la legenda è accesa.** Misurato: accendendo la legenda Recharts riduce l'`outerRadius` che passa al `Label` (124 → 113.3) ma **lascia `cy` a 160**, mentre l'anello vero sale di **13.3px**. Che il `viewBox` non sia quello della torta lo dice lo stesso oggetto: riporta `innerRadius: 0` su una ciambella. Provato anche coi raggi in pixel invece che in percentuale — identico, quindi non è la forma del valore.

Il rimedio non indovina niente e non fruga negli interni di Recharts: la legenda ha un'altezza che **dichiariamo noi** (`height={ALTEZZA_LEGENDA}`), l'area di disegno si accorcia di quella, il centro sale di metà. Se un giorno la legenda cambia altezza, cambia una costante sola e le due cose restano d'accordo. Seconda correzione, indipendente: il blocco è di **due righe**, e il suo baricentro non cade a metà stacco ma a **5.1px** sotto la prima riga, perché la riga grande è alta il doppio della piccola — anche questo misurato sul rettangolo reso. Dopo le due correzioni lo scarto è **0.1px**, uguale con e senza legenda.

**2. Le barre impilate avevano gli angoli tondi anche in mezzo alla pila.** Un intaglio fra una serie e l'altra, e la pila smette di leggersi come una colonna sola. La forma giusta è quella dell'esempio shadcn `chart-bar-stacked` — `[0,0,4,4]` sulla prima, `[4,4,0,0]` sull'ultima — qui generalizzata a n serie **e alle due orientazioni** (in orizzontale gli angoli da arrotondare sono quelli di sinistra sulla prima e di destra sull'ultima). L'ordine degli angoli di Recharts è `[alto-sx, alto-dx, basso-dx, basso-sx]`.

**3. Etichette degli assi X e Y su interruttori separati** (`asseX`, `asseY`), per barre, linee e aree. Si fanno con `hide` sull'asse, non togliendo il componente: togliendolo si perde anche la scala, non solo le etichette.

**4. `sfumatura` sulle aree** (l'esempio `chart-area-gradient`): dal colore della serie all'80% in cima al 10% in fondo. **Ha lo stesso difetto della traslucidità di §26.6, in forma più radicale**: dentro una sola area il colore cambia dall'alto in basso, quindi il piolo della scala non esiste più come valore unico e fra due serie non c'è più un passo. Non è un'alternativa al riempimento pieno, è un'altra cosa — si usa su **una o due serie**, dove non c'è niente da distinguere. Il gradiente sta in composizione (`<linearGradient>` dentro `<defs>`), perché è una scelta del grafico e non del componente.

**Quante serie regge la scala.** Domanda di Francesco, e ha una risposta misurata: **sei pioli, non cinque**. Applicando lo stesso passo di 1.4935 finché i due vincoli del gate tengono — ogni serie ad almeno 1.5:1 dalla card, e nessuna oltre il contrasto del testo di pagina — il sesto piolo passa in entrambe le modalità (chiaro `#2C2A26`, 14.08:1 dalla card; scuro `#474541`, 1.78:1) e il **settimo esce da tutte e due**: in chiaro finirebbe oltre il testo (19.41:1 contro 17.03), in scuro sparirebbe nella card (1.19:1).

Se ne spediscono **cinque** lo stesso, e non è una limitazione della palette: `--chart-1..5` è la convenzione shadcn, e ogni esempio, blocco e dashboard del registry si aspetta esattamente quei cinque nomi. Aggiungerne un sesto vorrebbe dire divergere dalla convenzione per un caso che sul campo non si presenta — sopra le cinque categorie un grafico non si legge comunque, e la risposta giusta è raggruppare la coda in «Altro», non allungare la scala. Il margine c'è, ed è scritto qui perché il giorno che servisse si sappia che è **un** piolo e non tre.

### 26.9 Il totale della pila: shadcn non ce l'ha, ma non serve niente di nuovo

Richiesta di Francesco: sulle barre impilate, poter accendere l'etichetta del **totale**. Chiesto prima all'MCP (regola 4bis, gradino 1): shadcn ha `chart-bar-stacked` e `chart-bar-label`, ma **nessun esempio col totale della pila** — le sue barre impilate si fermano alle etichette di segmento.

Il gradino 4 non si tocca lo stesso, perché non serve un componente: si appende un **secondo `LabelList` all'ultima serie** — quella in cima alla pila, dove il totale va scritto — e gli si dà un `valueAccessor` che **somma la riga** invece di leggerne un campo. Composizione pura, dentro la story, come `etichettaFetta` per la torta. `componenti-propri.json` resta vuoto.

Perché ha senso averlo, e non è un vezzo: impilando si **guadagna il totale e si perde il confronto** fra le serie (§26.7). Se il totale è la ragione per cui si impila, tanto vale scriverlo invece di lasciarlo stimare a occhio sulla scala.

**Un difetto trovato subito dopo, e solo guardando**: in orizzontale il numero si scrive a destra della barra, cioè **fuori dall'area di disegno**, e senza margine la cifra più lunga viene tagliata dal bordo della card — «118» reso «11». Il margine destro ora dipende dall'orientazione e da se c'è qualcosa da scrivere. È il secondo taglio di etichetta della sessione dopo il «214» della prima stesura: quando un'etichetta esce dall'area di disegno, il margine va aumentato a mano — Recharts non lo fa da sé, e axe non se ne accorge.

### 26.10 Barre con valori negativi, e tre trappole di Recharts sullo stesso rettangolo

Story `Scostamenti`, sull'esempio shadcn `chart-bar-negative`. Sta in una story sua perché non è una variante delle barre categoriche: è **una serie sola**, e ciò che si legge non è «quale famiglia» ma «di quanto è cresciuto o calato».

**Il segno lo dice la posizione, non il colore** — per questo si disegna la linea dello zero (`ReferenceLine`, che prende il colore dai token perché `chart.tsx` intercetta il `#ccc` che Recharts le cuce addosso). Il colore diverso è un rinforzo, e `coloreUnico` lo toglie: se la posizione dice già tutto, un secondo colore è una distinzione che non serve.

**E i due colori non sono verde e rosso.** La tentazione è `--success` e `--destructive`, ed è sbagliata: un calo di schede aperte non è un errore e un aumento non è un successo. Gli stati semantici si tengono per ciò che è davvero un esito, o perdono senso proprio quando servono — stessa ragione per cui `progress` non diventa rosso (M2.4). Si usano i primi due pioli della scala, come shadcn, che fra loro hanno il passo in grigio.

**Le tre trappole, tutte sullo stesso rettangolo, tutte misurate.** Su una barra **negativa** Recharts passa `y` al **fondo** e `height` **negativa**, e da lì discende tutto:

| | cosa succede | rimedio |
|---|---|---|
| etichetta | `top`, `bottom` e `insideBottom` finiscono tutte e tre **sopra** la barra, sulla linea dello zero; e il `content` della `LabelList` non riceve il rettangolo giusto quando la barra ha una `shape` sua | si disegna il testo **dentro la `shape`**, prendendo `min(y, y+height)` e `max(y, y+height)` invece di fidarsi del segno |
| angoli | `[0,0,4,4]` arrotonda **la linea dello zero** invece dell'estremo libero, perché `Rectangle` normalizza il rettangolo prima di applicare i raggi | `[4,4,0,0]` per entrambi i segni |
| legenda | mostra il nome e **un quadratino vuoto**, perché il colore della pastiglia lo legge dal `fill` del `Bar` e lì non c'era (lo mette la `shape`, una barra per volta) | un `fill` sul `Bar`, che nessuna barra usa ma la legenda sì |

E una quarta che non è di Recharts ma nostra: la voce **`delta` va dichiarata nel `config`**, o la legenda resta senza testo. È la conferma della regola già scritta — il `config` è l'unico posto dove i nomi in italiano stanno scritti.

---

## 27. Il gate axe in CI, e tre modi diversi di ottenere un rapporto pulito sbagliato (M2.9, 2026-09-10)

### 27.1 Un gate nuovo si prova su un difetto noto, mai su codice pulito

Scritta nel modo ovvio, l'imbracatura Vitest **passava senza misurare niente**:

```ts
// SBAGLIATO — il gate tace
import preview from './preview'
setProjectAnnotations([preview, { initialGlobals: { modalita } }])
```

213 story, zero violazioni, e il `combobox` — che M2.6 aveva misurato con **16 `button-name` di gravità *critical*** — dava zero come tutti gli altri.

La causa: **axe non lo monta il preview, lo monta `addon-a11y`**, con annotazioni proprie. Importando `preview.tsx` a mano si prende il nostro file e si perdono quelle degli addon, e con esse il gate. La forma giusta prende la composizione **intera**, la stessa che Storybook monta nel canvas:

```ts
import { getProjectAnnotations } from 'virtual:/@storybook/builder-vite/project-annotations.js'
setProjectAnnotations([getProjectAnnotations(), { initialGlobals: { modalita }, parameters }])
```

Storybook stesso incoraggia l'errore: stampa un avviso che invita a **togliere** `setProjectAnnotations` dal file di setup, e chi lo toglie perde i globali personalizzati; chi lo tiene scritto a mano perde axe.

**La lezione, che vale oltre il caso**: un controllo automatico nuovo non si valida su codice pulito, perché un gate rotto e un progetto sano danno **la stessa identica uscita**. Si valida su un difetto **di cui si conosce già il numero**. Qui l'ha salvato solo il fatto che M2.6 avesse scritto «16 `button-name` sul combobox»: senza quella riga a verbale, il gate sarebbe nato cieco e nessuno se ne sarebbe accorto.

### 27.2 La matrice è due per due, e le due dimensioni trovano cose diverse

Il gate gira **quattro volte**: `{chiaro, scuro} × {popup chiuso, aperto}`, 852 scansioni.

- **Modalità**, perché `variant: link` dava 1.79:1 in chiaro e in scuro *non compariva affatto*.
- **Stato del popup**, e qui i due versi sono entrambi necessari: le `aria-hidden-focus` si vedono **solo aperto**; il `button-name` di D14 si vede **solo chiuso**, perché a elenco aperto Base UI rende inerte il grilletto e axe lo salta.

Le leve sono `VITE_MODALITA` e `VITE_POPUP`, lette in `.storybook/vitest.setup.ts`. Il prefisso `VITE_` non è decorativo: in modalità browser il codice gira dentro la pagina, dove `process.env` non esiste.

### 27.3 Storybook esegue le `play` anche nel canvas — e uno strumento che clicca richiude

`scripts/misura-bersagli.ts` apriva i popup cliccando il grilletto, prima di misurare. Ma le story arrivano **già aperte**, perché Storybook esegue le `play` anche fuori dai test: il clic le **richiudeva**.

Misurato, ed è la prova che chiude il caso: `aria-expanded` valeva **`true` prima** del clic e **`false` dopo**.

Il rapporto perdeva le voci di menu proprio dei componenti che credeva d'aver aperto, mentre sui modali il clic finiva sull'overlay e per caso non faceva danno — al punto di **contraddirsi da solo**, dichiarando «Dialog 0/6 aperti» mentre misurava il bottone di chiusura *dentro* il dialogo aperto.

Forma giusta: **non toccare niente e aspettare il pannello**. Due eccezioni, `tooltip` e `hover-card`, che vogliono un puntatore **vero** — il puntatore sintetico della `play` non li tiene aperti.

Corollario su Playwright: **il successo di un'apertura si giudica dal contenuto, non dal gesto**. Aprendo un modale l'overlay copre il grilletto, quindi Playwright ritenta il clic che ha già funzionato e alla fine dichiara un timeout. E `force: true` non è la soluzione: sui popup **non modali** salta i controlli di azionabilità e li apre e richiude nello stesso gesto — 0 su 11 con `force`, 11 su 11 senza.

### 27.4 Le due esenzioni: si escludono i nodi, non si spengono le regole

**`aria-hidden-focus`**, spenta **solo nella passata `aperto`**: lì Base UI rende inerte lo sfondo marcandolo `aria-hidden`, e quello sfondo contiene roba focalizzabile perché fino a un attimo prima era l'interfaccia. A popup **chiuso** nessuno sfondo è inerte, quindi lì la regola resta armata — un `aria-hidden-focus` a riposo sarebbe **nostro**.

**Rettifica al registro**: la famiglia era data sui *guardiani del fuoco* (`data-base-ui-focus-guard`). Ricontato: le guardie ci sono ancora — **6 sul menu aperto** — ma ora portano `data-base-ui-inert` e **axe non le segnala più**. I nodi che restano sono quelli **dello sfondo**. Stessa natura, posto diverso: il registro cambia sotto i piedi, e va **rimisurato** invece che ricopiato.

**`button-name` di D14**: si **escludono i due nodi** del combobox (`input-group-button`, `combobox-chip-remove`), non si spegne la regola. Spegnerla avrebbe reso il gate cieco su qualsiasi bottone senza nome finito in quelle story, **compreso uno nostro e nuovo**. Il costo residuo è dichiarato: dentro quei due slot un difetto *diverso* non verrebbe più visto.

### 27.5 Il gate asserisce le `violations`, mai le `incomplete`

Letto nel sorgente di `addon-a11y`: il test fallisce su `result.violations`; le `incomplete` finiscono nel rapporto e **non vengono mai asserite**, e **non c'è parametro** che lo cambi. Restano quindi una lettura **a mano**.

Non è un dettaglio: in M2.8 il difetto vero della sessione — il `#666` degli assi, 2.97:1 in scuro — stava **dentro una `incomplete`**, in una riga identica alle altre, *serious* e senza numero. Il gate non copre quel caso.

### 27.6 Un controllo di accessibilità non misura i bersagli, e le misure vanno controllate

axe non guarda **quanto è grande** un bersaglio: una voce alta 31px passa ogni regola. Da cui `npm run misura:bersagli`, con due accorgimenti che sono la differenza fra una misura e un numero:

- **Aspettare `document.fonts.ready`.** L'altezza di un controllo dipende dalla riga di testo che contiene, e Inter arriva in data URI dentro il CSS del tema. Senza l'attesa lo stesso bottone dava **47.88px** in una esecuzione e **47.48px** in quella dopo — misure che cambiano da sole. Con l'attesa: **48 tondi**.
- **Un controllo dello strumento.** Il bottone di default in touch *deve* fare 48px; se non li fa, la densità non è stata applicata e lo script **esce con errore** invece di stampare la densità normale con un'altra etichetta.

Esito: **31 tipi di bersaglio sotto i 44px** di WCAG 2.5.5 (AAA), e **nessuno piccolo in entrambe le direzioni**. Il set passa 2.5.8 (AA).

**E un terzo accorgimento, imparato sbagliando nella stessa giornata: distinguere «basso» da «piccolo».** La prima stesura segnalava *cinque* bersagli sotto i 24px di AA, e la segnalazione è finita a verbale prima di essere verificata. Controllati uno per uno, due erano **falsi positivi dello strumento**:

- l'«`input` 22×22» è il campo `type="range"` che Base UI tiene **dietro** al pomello dello slider perché funzioni da tastiera — il bersaglio vero è il pomello, **24×24**;
- lo «`switch` 21×36» è la variante **`size="sm"`**, che compare solo nella story «Taglie» e che esiste apposta per essere piccola; il default è 27×48.

Il segno che distingue i campi nativi della libreria da quelli che vestiamo noi è che **i primi non hanno classi**. Il filtro iniziale scartava i trasparenti e gli alti un pixel, ma non questo, che è visibile e sta sotto il pomello.

Gli altri tre — un collegamento e due campi di testo, 18.56px alti ma **larghi 48, 239 e 416** — sono formalmente sotto i 24×24 e in pratica coperti dall'eccezione di spaziatura. *(Dopo M1.6 quei tre misurano **20px**: a muoverli è l'interlinea della scala nuova, non `--spacing`. Le voci di menu passano da 30.56 a 32. Il verdetto non cambia — 0 piccoli in entrambe le direzioni — e i più bassi si sono alzati.)* Da cui la regola nel rapporto: `!!` per ciò che è piccolo in **entrambe** le direzioni, `!` per ciò che è solo basso. Confonderli è ciò che ha prodotto l'allarme.

**Morale, che vale oltre il caso**: uno strumento di misura nuovo produce anche **falsi positivi**, non solo falsi negativi, e i due si scoprono in modi opposti — il falso negativo lo prende un difetto noto (§27.1), il falso positivo lo prende solo andando a **guardare cosa sia davvero** ogni cosa segnalata. Un numero non verificato messo a verbale diventa una decisione da prendere che non esisteva.

**Rettifica di due numeri a registro**: la voce di menu era data a 36px e la voce del combobox a 31px. Sono **entrambe 30.56px** — lo stesso bersaglio, non due.

Le voci di menu restano come sono: il rimedio (`py-1` → `py-2`) le alza **anche in densità normale**, cioè cambierebbe l'aspetto della scrivania per un criterio nato per il cantiere. Sono 30.56 × 324 — 32 × 324 dopo M1.6: basse, ma lunghe quanto tutto il menu.

---

## 28. Il marchio nel registry: `mask-image` in data URI, e perché non un componente (D13, M3.1, 2026-09-10)

**Conclusione: il marchio è una *classe del tema*, `.marchio-t`, e viaggia dentro un CSS come maschera in data URI.** È la strada (c) di D13, scelta da Francesco il 2026-09-10. L'item è `tema-logo`, dichiarato fra le `registryDependencies` di `tema`: un solo `add @tassullo/tema` porta token, carattere **e** marchio.

```html
<span class="marchio-t size-6" aria-hidden></span>
```

### Le due strade scartate, con la ragione che le ha scartate

**(a) Un componente `<MarchioT />`.** È comodo e `currentColor` funziona da sé — ma è un componente **nostro senza originale shadcn**, cioè il gradino 4 della scala 4bis: vorrebbe una riga in `registry/componenti-propri.json`, che oggi è vuoto ed è la condizione che il progetto dichiara «da difendere». Il marchio non è un motivo abbastanza forte per romperla: non ha comportamento, non ha stato, non ha varianti. È un disegno, e un disegno sta nel tema.

**(b) L'`.svg` come `registry:file` con `target` su `public/`.** Zero componenti nostri — ma un `<img>` **non segue il colore del testo**: servirebbe un file per fondo chiaro e uno per fondo scuro, cioè due copie dello stesso tracciato da tenere allineate a mano. Un doppione è la deriva che il registry esiste per impedire.

### Perché una **maschera** e non un `background-image`

Un `background-image` dipingerebbe il marchio col colore scritto dentro il file, e si ricadrebbe nel problema di (b). Una maschera **ritaglia**: del data URI conta solo il canale alfa, e il colore arriva da `background-color: currentColor`. Per questo il tracciato in `theme/marchio/tassullo-t.svg` **non ha `fill`** — il nero di default riempie, cioè alfa 1 dove il tracciato copre, ed è esattamente ciò che serve. Effetto collaterale utile: sparisce anche l'esadecimale, che la regola 3 non ammette nemmeno dentro un SVG.

Verificato in Chromium sullo Storybook costruito: `background-color` risolto a `oklch(0.9455 0.0027 106.45)` — cioè `--sidebar-accent-foreground`, il token scritto sul `<span>` — e `mask-image` col data URI applicato, in chiaro e in scuro.

### Percent-encoding, non base64

Un SVG è testo, e un data URI percent-encoded resta **leggibile**: si apre il CSS e si vede il tracciato. Costa anche meno — base64 gonfia di un terzo, il percent-encoding di un SVG di poco più del 10%. Si codifica **il minimo che serve**: `%` per primo (o ri-codificherebbe le proprie uscite), `#` — che in un URL apre il frammento e **troncherebbe la maschera a metà, senza errore** — le virgolette doppie, `<` e `>`.

### La misura, e perché `size-*` è la classe giusta

Il `viewBox` è 24×38: la T è **più alta che larga**. La classe dichiara `aspect-ratio: 24 / 38`, letto dal `viewBox` dallo script e non scritto a mano. Con `h-*` la larghezza la calcola l'`aspect-ratio`; con `size-*` l'aspect-ratio è inerte (entrambe le dimensioni sono date) e a tenere le proporzioni è `mask-size: contain`, che allinea il marchio all'**altezza** e lo lascia stretto dentro il quadrato — che è come si allinea alle icone delle voci, tutte quadrate. Misurato nel rail: `size-6` dà 24×24 in densità normale e **36×36 in touch**, perché `size-*` deriva da `--spacing`.

### `@layer components`, e non un blocco senza layer

Le regole stanno in `@layer components`, così le utility Tailwind **vincono** su di esse: `size-*` sovrascrive l'altezza predefinita di `1em`, e `text-*` cambia il colore. Senza layer le nostre regole batterebbero le utility, che è il contrario di ciò che serve. Il layer resta CSS valido anche dove Tailwind non ci fosse.

### Il file è **generato**, e sotto gate

`registry/tassullo/theme/tassullo-logo.css` esce da `scripts/build-logo-css.ts` (`npm run logo:build`), e `npm run check:logo` fallisce se diverge — quinto gate di `npm run check`. Stessa disciplina del carattere e per la stessa ragione: **un data URI non è ispezionabile a occhio**, quindi una divergenza resterebbe invisibile per sempre. Il gate è stato provato su un difetto vero — un carattere aggiunto in coda al file — ed esce con codice 1.

La sorgente `theme/marchio/tassullo-t.svg` **non viaggia nel registry**: è il file da cui si genera, come i `.woff2` in `theme/fonts/`.

### Il marchio esteso: non esiste un asset, e non se ne inventa uno

D13 chiedeva di chiudere anche «se serve il marchio esteso accanto alla sola T». **Il file non esiste**: né Anagrafe né il v1 ne hanno uno — in produzione il marchio esteso è *composto*, la T più il nome dell'applicativo in Inter semibold, ed è la forma che `tassullo-app-shell` monta in testata. Se un giorno arriva un logotipo vero, è **una riga in più** nell'elenco `MARCHI` dello script, non un meccanismo nuovo: la classe comune e il gate ci sono già.

**Resta un'eccezione, e va conosciuta**: favicon e icona PWA. Un file servito al browser **prima** del CSS non può leggere né le classi né le variabili del tema, e infatti la favicon di Anagrafe ricopia l'antracite a mano. Quella eccezione era già dichiarata nel v1 e resta.

---

## 29. La prima misura di D10: a schermo stretto il padding non è il colpevole (M3.1, 2026-09-10)

**Conclusione: a 375px la densità touch costa 16px di larghezza utile (−4,7%), ma **10,6%** di testo per riga — e sulla scrivania costa molto di più, per un motivo diverso.** Misurato in Chromium sullo Storybook costruito, sulla story `Blocchi/App shell`, quattro celle viewport × densità.

**Numeri rimisurati dopo M1.6** (2026-09-10): la scala tipografica è cambiata, quindi i caratteri per riga sono cambiati con essa. Le larghezze **no** — vengono da `--spacing`, che M1.6 non tocca, e coincidono al pixel con la prima misura. Fra parentesi i valori della misura di M3.1, con la scala vecchia.

| cella | colonna | fascia | padding | larghezza utile | caratteri per riga |
|---|---|---|---|---|---|
| 1440 × normale | 256 | 48 | 16 | **1148** | 156 *(165)* |
| 1440 × touch | 384 | 72 | 24 | **1008** | 129 *(136)* |
| 375 × normale | — | 48 | 16 | **343** | 47 *(49)* |
| 375 × touch | — | 72 | 24 | **327** | 42 *(44)* |

**Il righello è stato tarato prima di fidarsene.** Rimisurando la scala *vecchia* con lo strumento nuovo escono 166 / 137 / 50 / 44: la stessa misura a meno di un carattere, che è la differenza fra due stringhe campione diverse. Senza questa taratura non si saprebbe se lo scarto è la scala o il metro — ed è la stessa cura di §27.1 applicata a una misura invece che a un gate.

I caratteri per riga si misurano, non si stimano: una stringa di 100 caratteri a `text-base` dentro l'area di contenuto vera, e la larghezza utile divisa per la sua.

**Il rilievo che ribalta l'assunzione del piano.** `PIANO.md` §M3.1 dà per scontato che a mangiare la larghezza sia il **padding di pagina** — «sono quelle utility, non le altezze dei controlli». A 375px non è così: sotto i 768px la colonna esce dal DOM, quindi il padding è l'**unica** cosa che toglie larghezza, e toglie 16px in tutto. A perdere il 10,6% del testo per riga non è la larghezza (−4,7%) ma il **corpo**, che dopo M1.6 passa da 15 a 16px: le due leve di M1.4 tirano nello stesso verso e si sommano.

**E sulla scrivania il colpevole è un terzo ancora.** A 1440 la larghezza utile cala di 140px (−12,2%) e **128 di quei 140 sono la colonna**, che passa da 256 a 384 — l'override di densità di M2.5, che è deliberato. Il contenuto scende sotto `--container-page` (1056 contro 1180): in touch, a 1440px, **la larghezza massima di pagina non è più il vincolo**, lo è la colonna. Chi progetta una tabella larga in touch deve saperlo.

**Il rimedio che il piano prevedeva — un `--space-page` che non derivi da `--spacing` — non serve al problema che si è misurato**: a 375px varrebbe 16px su 343, cioè meno della metà di ciò che si perde.

**E M1.6 ha alzato il prezzo, consapevolmente.** Nella cella stretta i caratteri per riga scendono da 44 a **42**: sono due caratteri pagati per la leggibilità, ed è esattamente il conto che D16 aveva fatto prima di scegliere. L'allineamento pieno a shadcn (`base` 16 in normale, quindi ~17 in touch) era stato scartato perché avrebbe portato la cella a ~39; la scala «+1» ne costa 2 invece di 5. La misura conferma la stima su cui la decisione è stata presa, e sposta il verdetto di D10 — che resta di M4.2 — su una base un po' più stretta di prima. Il verdetto resta di M4.2, su una pagina vera; questa è la misura, non la decisione.

**Un quinto rilievo, trovato guardando invece che misurando.** A 375px in **touch** il percorso della fascia andava **a capo dentro la barra** — in densità normale, alla stessa larghezza, ci stava. È la stessa cella di D10 vista nella fascia invece che nel contenuto, ed è la prova che la densità su schermo stretto non è un problema del solo corpo pagina. Il rimedio sta nell'app (i livelli intermedi del breadcrumb spariscono sotto i 768px, come nel `sidebar-07` di shadcn), e il guscio fa la sua parte con `min-w-0` sullo slot della fascia: garantisce che a cedere sia il percorso e non le azioni a destra.

---

## 30. La scala tipografica era due punti sotto shadcn (D16, aperta in M3.1, **attuata in M1.6**, 2026-09-10)

**In vigore dal 2026-09-10: `xs 12 / sm 13 / base 15 / lg 16 / xl 19 / 2xl 27 / 3xl 31`, zero gradini nostri.** La scala del v1 rendeva ogni componente shadcn 2px più piccolo di com'è disegnato; `--text-md` è fuso in `--text-sm` e `--text-title` è diventato `--text-2xl`, con `3xl` tarato accanto. Rilevato da Francesco confrontando la style guide con i blocchi di `ui.shadcn.com`; misurato invece che discusso, e **attuato in M1.6** — questo paragrafo descrive il tema com'è, non una proposta.

I valori in densità touch **non sono più scritti a mano**: escono da `arrotonda(px × 1.08)` applicato alla scala normale, cioè dalla stessa regola che il tema dichiarava già a parole. Erano l'unico dato del tema con due fonti, e due fonti per un dato solo divergono al primo ritocco.

| gradino | normale | touch |
|---|---|---|
| `xs` | 12 | 13 |
| `sm` | 13 | 14 |
| `base` | 15 | 16 |
| `lg` | 16 | 17 |
| `xl` | 19 | 21 |
| `2xl` | 27 | 29 |
| `3xl` | 31 | 33 |

**Le interlinee non sono state toccate**, ed era giusto così: in Tailwind v4 ogni gradino porta una `--text-*--line-height` espressa come **rapporto**, quindi segue la misura da sé. L'unico salto voluto è il titolo di pagina, che passando da `title` a `2xl` prende l'interlinea di Tailwind (1.333) dove prima ereditava 1.5.

### shadcn non tocca la scala, quindi il confronto è esatto

Verificato che il preset non dichiara nessun `--text-*`: shadcn usa la scala di default di Tailwind. Non serve misurare il loro sito.

| gradino | shadcn | Tassullo v2 (v1) | differenza |
|---|---|---|---|
| `text-xs` | 12 | 11 | −1 |
| **`text-sm`** | **14** | **12** | **−2 (−14%)** |
| `text-base` | 16 | 14 | −2 |
| `text-lg` | 18 | 15 | −3 |
| `text-xl` | 20 | 18 | −2 |

**I pesi coincidono** — 400 sulle voci, 500 sull'attiva e sulle etichette, 600 sul nome dell'applicativo: la differenza è tutta di dimensione. In M1.2 abbiamo portato dentro la scala del v1 tenendo i **nomi** di shadcn, ma le loro altezze e i loro padding sono tarati su un `sm` da 14px: chiedere allo stesso riquadro di contenere un testo da 12 dà testo piccolo con troppa aria intorno.

### Tre gradini reggono tutta l'interfaccia

Contati gli usi nei componenti spediti (le story non contano, non le spedisce nessun item):

| gradino | nostri componenti | originali shadcn |
|---|---|---|
| `text-sm` | 72 | 68 |
| `text-xs` | 22 | 21 |
| `text-base` | 9 | 8 |
| `text-md` | **2** | — |
| `lg`, `xl`, `title` | **0** | 0 |

`sm` da solo è il **69%** degli usi. `lg`, `xl` e `title` il tema li tara e **non li usa nessun componente**: vivono nella style guide — e `title` ha perso anche l'ultimo consumatore quando M3.1 ha tolto il titolo di pagina.

### `text-md` è un gradino nostro, ed è il gradino del bottone

Lo usano **due file**, `button.tsx` e `button-group.tsx`, dove l'originale shadcn scrive `text-sm`. Esiste solo per portare il bottone da 12 a 13px, che è la misura del `.btn` del v1. Il commento nel tema — «chip, breadcrumb, testi densi» — è **falso**: il breadcrumb usa `text-sm`, i chip del combobox pure. È un'intenzione del v1 mai realizzata.

Da cui la scelta di **fonderlo in `sm` a 13px**: il bottone resta esattamente i 13px di oggi, e `button`/`button-group` tornano a scrivere `text-sm` come l'originale. **Non aggiunge una divergenza da shadcn: ne toglie due**, e riduce il ri-stile del bottone al solo raggio (`rounded-md` 6px contro `rounded-lg` 10px, che è identità di marchio). Le altezze non erano mai divergenti: `h-8`/`h-6`/`h-7`/`h-9`, identiche all'originale.

### Perché `+1` e non l'allineamento pieno

La scala allineata (`sm` 14, `base` 16) è la più corretta in astratto, e c'è una regola nostra che la sostiene — 4bis punto 3, «se il v1 non ci sta dentro si adatta il v1, non shadcn». Ha però un costo che va **contro** il motivo per cui esiste la densità touch: a 375px in touch il corpo passerebbe da 15 a 17px e i caratteri per riga da 44 a circa 39. In cantiere significa più scorrimento. La scala scelta recupera il grosso della leggibilità senza pagare quel prezzo.

Scelta di Francesco il 2026-09-10, provata sul **banco tipografico** — una pagina coi componenti veri (DOM catturato dalle story, CSS compilato e Inter inlinati) e le tre scale commutabili dal vivo, con i caratteri per riga misurati e non stimati.

### Il buco che nessuno vedrebbe, e che il gate deve chiudere

**Un gradino che il tema non tara non scala con la densità.** I due blocchi `[data-density]` ridichiarano solo i gradini nostri: se un blocco scrivesse `text-2xl`, quello renderebbe 24px in densità normale **e 24px in touch**. Nessun errore, nessun avviso — il testo semplicemente non cresce quando cresce tutto il resto. Oggi il buco non è aperto (nessun componente usa `2xl`) ma è aperto per costruzione, e la FASE 3 ha ancora nove blocchi da scrivere.

Stessa famiglia, e più insidiosa: tolto `--text-md`, la classe `text-md` **non esiste in Tailwind**. Un `text-md` dimenticato in una story non è un errore di compilazione: è un'utility sconosciuta che non emette niente, e il testo eredita la misura del genitore. Muto, di nuovo.

Rimedio, **fatto in M1.6**: `check:registry` segnala ogni `text-*` usato nel registry che il tema non tara, e distingue i due difetti perché hanno rimedi opposti — un `text-4xl` **esiste** e rende, semplicemente non scala; un `text-md` non esiste affatto. Il gate è stato **visto fallire** su entrambi, piantandoli a turno in `badge.tsx` (§27.1: un gate nuovo si prova su un difetto noto, mai su codice pulito). E la prova migliore è arrivata da sola: girando sul codice pre-M1.6 il gate ha segnalato **esattamente i due `text-md` veri**, quelli di `button` e `button-group`.

### Rettifica in giornata: anche `--text-title` esce

Segnalato da Francesco subito dopo: tolto il titolo di pagina, `title` non ha più consumatori nel codice spedito, quindi **si toglie anche lui**. La scala superstite è allora `xs 12 / sm 13 / base 15 / lg 16 / xl 19`, cioè **«+1» esatto su ogni gradino del v1**, con `md` fuso in `sm`.

**A una condizione, però, e non è formale**: qualcosa deve coprire la tipografia di pagina, o la FASE 4 — il titolo del login, i numeroni del cruscotto — andrà a pescare `text-2xl`/`text-3xl` di Tailwind, che il tema **non tara**, e ricadrà esattamente nel buco descritto qui sopra: 24px in normale e 24px in touch. Togliere `title` va quindi accompagnato dal **tarare `2xl` e `3xl`**.

L'esito è più pulito della situazione di partenza: **zero gradini nostri**, tutti i nomi sono quelli di Tailwind, e ogni nome che un componente possa scrivere è tarato dal tema. Che è la definizione operativa di «resa uniforme».

### Uno scostamento: il conto dei ri-stilati non è sceso

Il piano di M1.6 si aspettava che `check:registry` calasse, perché `button` e `button-group` tornano a scrivere `text-sm` come l'originale. **Non è successo**, e la ragione è che il gate conta le **stringhe** di classi divergenti, non le classi: quelle due stringhe divergono ancora sul **raggio** — `rounded-md` (6px) contro `rounded-lg` (10px) — che è identità di marchio e resta. Il conto sta a 8 e 4 come prima, e i componenti ri-stilati restano 14.

La sostanza di D16 regge lo stesso, e anzi è ora vera alla lettera: su quelle due stringhe **l'unica differenza superstite è il raggio**. Ciò che non regge è la previsione numerica, ed è annotata qui perché un numero atteso e non arrivato, lasciato correre, la sessione dopo si legge come un guasto.

---

## 31. La fascia si misura da sé: `@container` al posto di `md:`/`lg:` (M3.2, 2026-09-10)

**La decisione**: le soglie responsive dell'intestazione di pagina sono **container query sulla fascia** (`@container/fascia`), non media query sulla viewport.

**Il fatto che la impone**: sotto i 768px la colonna del guscio **esce dal DOM**. Passando da 767 a 768 lo schermo si allarga di 1px e la fascia si **restringe di 255** — di 383 in densità touch. La larghezza dello schermo e la larghezza della fascia non sono monotone l'una nell'altra, quindi una regola scritta sulla prima deve inseguire una discontinuità che la seconda non ha. In M3.1 quell'inseguimento si era espresso come una ramificazione per densità, con dentro una trappola di specificità (`in-data-[density=touch]:` genera `:where()`, che pesa **zero** e perdeva contro `md:block`; ci volle la variante esplicita `[[data-density=touch]_&]:`). Sulla larghezza della fascia la ramificazione **non serve**: due soglie sole, e valgono identiche dentro il guscio, fuori dal guscio e a qualunque densità.

- **`@md` (448px)** — sotto, i livelli intermedi del percorso diventano `…`;
- **`@2xl` (672px)** — sotto, le azioni entrano tutte in un solo bottone «⋯».

**La cosa da sapere prima di misurare, e che costa una misura sbagliata**: una container query `inline-size` guarda il **riquadro di contenuto**, cioè al netto del padding — qui `px-4`, che segue la densità: 32px in tutto in normale, 48 in touch. Una fascia larga 480px di bordo ne ha 432 utili in touch, quindi **sta sotto** `@md` mentre a occhio sembrerebbe sopra.

**Le otto celle**, misurate in Chromium sullo Storybook costruito — larghezza utile della fascia:

| viewport | densità | colonna | fascia (utile) | percorso | azioni |
|---|---|---|---|---|---|
| 1440 | normale | 256 | 1152 | intero | bottoni interi |
| 1440 | touch | 384 | 1008 | intero | bottoni interi |
| 1024 | normale | 256 | 736 | intero | bottoni interi |
| 1024 | touch | 384 | 592 | intero | «⋯» |
| 768 | normale | 256 | 480 | intero | «⋯» |
| 768 | touch | 384 | 336 | `…` | «⋯» |
| 375 | normale | — | 343 | `…` | «⋯» |
| 375 | touch | — | 327 | `…` | «⋯» |

**343 e 327 sono, alla cifra, le due larghezze di §29**: è la stessa larghezza di D10, vista nella fascia invece che nell'area di contenuto. In tutte e otto le celle la fascia resta **una riga sola** e la pagina non sborda — il difetto che M3.1 aveva trovato guardando (il percorso a capo dentro una barra ad altezza fissa) ora è impedito dalla forma, non rimediato dalla story.

**Un confine si sposta rispetto a §29, ed è deliberato**: a **1024×touch** le azioni entrano nel menu, dove la regola `lg:` le teneva intere; lì la fascia ha 592px utili. I 1024 di M3.1 erano un compromesso *imposto* dalla ramificazione per densità («a 768 in touch non resterebbe niente»), e una soglia sulla fascia quel compromesso non deve farlo. Nelle altre sette celle le due regole coincidono.

**Ricaduta oltre l'intestazione**: un blocco che si misura da sé si può anche **provare** da sé. La story `Fascia stretta` mostra la forma compatta dentro un contenitore da 320px, a qualunque viewport — e questo conta per il gate, dove il runner di `addon-vitest` non ha un modo affidabile di cambiare viewport: un popup che compare solo sotto una media query sarebbe un popup che il gate non apre mai.

---

## 32. Il pannello del browser dell'app non misura nemmeno le larghezze (M3.2, 2026-09-10)

§22 dice che nel pannello del browser dell'app `document.visibilityState` è `hidden`, quindi `requestAnimationFrame` non scatta mai, e che per questo i popup di Base UI sembrano non rispondere alla tastiera. **La conseguenza è più larga di così, e non riguarda solo i popup: le transizioni CSS sono guidate dallo stesso clock di fotogrammi.**

Misurato commutando la densità sul guscio: la colonna ha `transition-[width]`, e con la pagina considerata nascosta la transizione **non avanza**. Il risultato non è un errore, è una lettura **sfasata di una misura** — densità `normale` che riporta una fascia da 1056px (cioè la colonna touch da 384) e densità `touch` che ne riporta 1184 (la colonna normale da 256), con `--spacing` che nel frattempo dichiara il valore giusto. Due tentativi con esiti incrociati prima di riconoscerlo; `getBoundingClientRect` forza il layout, non il tempo.

**La regola operativa**: qualunque misura su qualcosa che **transisce** — larghezze, posizioni, opacità — si prende in un **browser vero**, Chromium di Playwright headless contro lo Storybook costruito. Il pannello resta buono per guardare uno stato fermo e per gli screenshot; non è un banco.

---

## 33. La tabella: TanStack Table v9, e dove passa la riga fra loro e noi (M3.3, 2026-09-10)

**La decisione**: `tassullo-data-table` è un **blocco**, costruito su `@tanstack/react-table` **v9** (9.2.4, la stabile). Le **colonne restano di TanStack**; il **contorno è nostro**.

**Perché non è una primitiva ri-stilata.** Chiesto all'MCP prima di scrivere (regola 4bis, gradino 1): nel registry shadcn `data-table` **non esiste**. C'è `table` — le sei etichette HTML vestite, che abbiamo già — e `data-table-demo`, che è un `registry:example` e per lo stile `base-nova` **non è nemmeno pubblicato** (`shadcn view` risponde *not found*). La pagina «Data Table» è dichiaratamente una **guida**, e la ragione che shadcn dà è esplicita: «ogni tabella che ho scritto era diversa; metterle tutte in un componente vuol dire perdere la flessibilità che l'headless dà».

Quindi: **nessun originale da cui divergere, nessuno snapshot in `registry/.upstream/`, nessuna riga in `componenti-propri.json`** — che è il registro di ciò che sta *al posto* di una primitiva, e questo non sostituisce niente. Sta in `blocks/`, dove `check:registry` verifica la sola regola 3. `componenti-propri.json` **resta vuoto**, ed è la condizione da difendere.

**Perché la guida non basta.** La flessibilità che shadcn non vuole perdere, noi non la vogliamo pagare quattro volte: la guida lascia intero a chi la segue tutto il contorno — caratteristiche, stato, ricerca, paginazione, colonne nascoste, stato vuoto — da riassemblare a mano in ogni pagina. È il meccanismo esatto con cui le app del v1 sono divergite: nessuna ha scritto la tabella *male*, l'hanno scritta ognuna *un po' diversa*. Prodotti, Famiglie, Norme e Pubblicazioni di Anagrafe sono quattro volte la stessa tabella.

**Dove passa la riga**, ed è la parte che decide il costo dei futuri aggiornamenti: `creaColonne()` è `createColumnHelper` di TanStack con la sola generica delle caratteristiche già messa. Chi scrive una colonna scrive **TanStack vero** — `accessor`, `display`, `columns`, `sortFn` — e la documentazione che gli serve è la loro, non una nostra parafrasi in italiano che invecchia. Nostro è ciò che in quattro pagine si copia identico.

### La v9 non è la v8 che si ricorda

È **a caratteristiche**: `tableFeatures()` dichiara ciò che serve e il resto sparisce dal bundle. Cadono i `get*RowModel` fra le opzioni — i modelli di riga si creano con `create*RowModel()` e si registrano lì — e cadono anche le funzioni di filtro e ordinamento incorporate, da registrare una per una sotto `filterFns` / `sortFns`. `useReactTable`, `getCoreRowModel()` e `flexRender(...)` sono v8: qui sono `useTable` e `<table.FlexRender />`.

Le funzioni di ordinamento registrate sono **quattro**, e non per abbondanza: `text`, `alphanumeric` (o `IN-9` finirebbe dopo `IN-10`), `datetime`, `basic`.

### Tre scostamenti dalla guida, tutti misurati

1. **Si cerca in tutta la tabella, non in una colonna.** La guida filtra `email`, cioè una colonna scelta a mano. Qui è `globalFilteringFeature`; le colonne che non devono entrarci dicono `enableGlobalFilter: false` (nella story, `Rev.` e `Aggiornato` — cercare «12» avrebbe pescato mezza tabella).
2. **L'intestazione ordina con un clic, non con un menu.** `DataTableColumnHeader` di shadcn apre un menu con Asc/Desc/Nascondi: da tastiera sono quattro gesti per la cosa che si fa più spesso. Qui l'intestazione **è** il bottone e cicla a **tre tempi**. Il terzo conta, ed è verificato: dopo il terzo Invio la tabella torna esattamente all'ordine di partenza (`RA-191, MA-528, AD-961`) — senza, una colonna ordinata per sbaglio non si potrebbe più disordinare.
3. **Il `<th>` dichiara `aria-sort`.** La guida non lo fa e axe non lo pretende; è l'unico modo in cui un lettore di schermo sa che la tabella è ordinata e come.

### Gli stati vuoti sono due, e non è un dettaglio

La guida ne ha uno, `No results.`, che su una tabella **appena creata** dice la cosa sbagliata. «Nessun risultato» dopo una ricerca ha un rimedio — e il blocco offre il bottone che lo esegue — mentre «non c'è ancora niente» no, e il suo rimedio lo conosce solo la pagina (che passa l'azione). Quando **M3.5** stabilirà lo standard unico, il punto in cui intervenire è `TabellaVuota`, uno solo.

### `onSelezione` non esiste, ed è la trappola di `CLAUDE.md` evitata all'origine

La selezione esce dalla tabella attraverso `barra` nella **forma a funzione**, che riceve le righe scelte. Una `onSelezione` si notificherebbe per forza da un `useEffect` le cui dipendenze oneste sono **un array nuovo a ogni render** e una funzione che la pagina scrive quasi sempre inline: l'effetto riparte, chiama `setState`, il render riparte, e React non interrompe il ciclo e non stampa niente. Con la funzione è una chiamata in fase di render, pura, e le azioni di massa stanno dove servono davvero — nella barra. **Nota di strumento**: `oxlint` **ha** la regola `react-hooks(exhaustive-deps)` e l'aveva segnalata; il repo resta ai suoi 3 avvisi preesistenti e **senza la prima soppressione di lint della sua storia**.

### Il difetto che il pannello del browser nascondeva, di nuovo

`DropdownMenuLabel` **vuole un `DropdownMenuGroup` attorno**: in Base UI è `Menu.GroupLabel`, che senza `Menu.Group` **lancia**. Era già scritto in `dropdown-menu.stories.tsx` da M2.x, e qui è stato rifatto lo stesso. Ciò che vale la pena verbalizzare è **come si è manifestato**: nel pannello del browser dell'app la story sembrava sana e il menu «non si apriva», perché l'errore scatta quando il pannello **monta** — e il montaggio Base UI lo schedula in `requestAnimationFrame`, che lì non scatta mai (§22, §32). In Chromium vero la stessa story non renderizzava affatto: `rows: 3, buttons: 3` e il riquadro d'errore di Storybook al posto della tabella. **Il gate l'ha preso** (4 violazioni, categoria `imbracatura`, su `Menu Di Riga` e `Menu Delle Colonne`), e il pannello no. È la terza volta che la stessa causa produce un sintomo che non le somiglia.

### Quel che si misura, si misura in Chromium

Tastiera, sullo Storybook servito, viewport 1440×900:

| gesto | esito |
|---|---|
| 1 Tab dall'inizio | il fuoco è nella casella di ricerca |
| digitare «Marmorino» | 500 → **59 righe**; 9 Backspace → 500 |
| 4 Tab | il fuoco è su «Ordina per Codice: crescente» |
| Invio ×1 | `aria-sort="ascending"`, `AD-104, AD-108, AD-127` |
| Invio ×2 | `aria-sort="descending"`, `RA-996/R, RA-995, RA-967` |
| Invio ×3 | `aria-sort="none"`, e l'ordine di partenza è tornato |
| Invio su «Pagina successiva» | Pagina 1 di 20 → **2 di 20** |

Il fuoco **non si perde** in nessuno dei passaggi.

Larghezze e altezze, quattro celle:

| cella | riquadro | tabella | riga | la pagina sborda? |
|---|---|---|---|---|
| 1440 normale | 1406 | 1406 | 41 | no |
| 1440 touch | 1406 | 1406 | 61 | no |
| 375 normale | 341 | **746** | 41 | no — scorre **dentro** il riquadro |
| 375 touch | 341 | **918** | 61 | no — scorre **dentro** il riquadro |

**A 375px la pagina non sborda, ma la tabella nemmeno degrada**: scorre in orizzontale dentro il proprio riquadro, che è ciò che il `overflow-x-auto` della primitiva `table` fa da sé. Funziona e non rompe niente, ma «più della metà delle colonne è fuori dallo schermo senza un segno che lo dica» non è un degrado progettato. **È il lavoro della seconda sessione di M3.3**, insieme al conto dei bersagli in touch.

---

## 34. Il resize delle colonne: no per ora, e il grilletto è scritto (D17, aperta e **chiusa** in M3.3, 2026-09-11)

**La decisione**: **non si fa**, chiusa da Francesco il 2026-09-11 in coda a M3.3.

Non è un rinvio indefinito, ed è la differenza che conta: **è scritto cosa la riapre** — la prima tabella in cui dichiarare le larghezze non basta, cioè dati di lunghezza imprevedibile a priori. Fino ad allora la risposta del design system è `meta.larghezza` più `bloccaPrimaColonna`, tutte e due già in casa e a costo zero.

**Il ragionamento che l'ha chiusa**: il resize risolve **un** problema — una colonna troppo stretta per il suo contenuto — e da M3.3 quel problema si risolve già dichiarando la larghezza. Contro, la maniglia da trascinare non esiste in shadcn e sarebbe il **primo componente nostro in assoluto**, in un `componenti-propri.json` che oggi è vuoto ed è la condizione da difendere. Costruire il primo pezzo proprio per un problema già risolto è il peggior momento possibile per farlo.

Aperta, poche ore prima, da Francesco stesso: «non abbiamo idea di che tabelle svilupperemo in futuro, potrebbe diventare necessario il resize **limitatamente a desktop**». Il resto di questa sezione è l'analisi fatta allora, e resta scritta **apposta**: chi riaprirà D17 non ricomincia da zero.

### Chi ce l'ha

**TanStack Table v9: sì, nativamente**, con due caratteristiche distinte che vanno accese insieme — ed è utile sapere che sono due, perché i nomi si somigliano e fanno cose diverse:

- **`columnSizingFeature`** tiene le larghezze **acquisite**: `columnSizing: Record<string, number>`, più `size` / `minSize` / `maxSize` per colonna, `setColumnSizing`, `resetColumnSizing`;
- **`columnResizingFeature`** tiene il **trascinamento**, che è transitorio: `header.getResizeHandler()` (installa e ripulisce da sé i listener di drag), `columnResizeMode: 'onChange' | 'onEnd'`, `column.getCanResize()`, `getIsResizing()`, `enableResizing` per colonna.

**shadcn: no, e non parzialmente.** Verificato su `registry/tassullo/ui/table.tsx` e sull'originale in `registry/.upstream/table.tsx`: **zero occorrenze**. È sei etichette HTML vestite, e la guida `data-table` non tocca l'argomento. La **maniglia** — il nodo nell'angolo del `<th>`, il cursore, il filo verticale durante il trascinamento — non esiste da nessuna parte: è **gradino 4** della scala 4bis, un componente nostro, da proporre e da tracciare in `registry/componenti-propri.json`. Sarebbe **il primo**, e oggi quel file è vuoto: la condizione da difendere.

### La cosa che contava verificare subito: M3.3 non preclude niente

Il rischio vero di una porta lasciata aperta è costruirci davanti. Non è successo, e anzi:

- **`table-fixed` è un prerequisito del resize, non un ostacolo.** A larghezza automatica il contenuto ha voce in capitolo e una larghezza imposta dall'utente verrebbe contraddetta dalla riga più lunga; a larghezza fissa comandano le intestazioni, che è esattamente ciò su cui il resize scrive. La modifica fatta per fermare il salto delle colonne è la stessa che serve per poterle trascinare.
- **`meta.larghezza` convive**: la utility dichiarata resta il valore **di partenza**, e una larghezza acquisita la scavalca con uno stile inline. Il solo lavoro il giorno che si farà è seminare `columnSizing` dal valore reso, perché `larghezza` è una stringa di classi e `columnSizing` vuole un numero — o si aggiunge a `MetaColonna` un `size` numerico facoltativo accanto.

### I quattro costi, da avere in mano prima di riaprirla

1. **I pixel.** Il resize produce numeri, che finiscono in `style={{ width }}`. La **regola 3** del `CLAUDE.md` li vieta, e lo dice esplicitamente anche per gli `style` inline. Non è un cavillo: è la regola che tiene le misure agganciate a `--spacing`. Attraversare questa porta vuol dire scriverne un'eccezione motivata e circoscritta — «larghezze acquisite dall'utente», non «larghezze» in generale — e insegnarla al gate, o il gate smette di servire.
2. **Le larghezze acquisite non seguono la densità.** Sono pixel: commutando su touch una colonna trascinata a mano resta com'era mentre tutto il resto cresce del 50%. In un tema la cui densità è una delle **due sole leve**, è una crepa da progettare, non da scoprire.
3. **Se non si conserva è peggio di non averlo.** Un ridimensionamento che sparisce a ogni ricarica irrita più di una colonna stretta. Implica esporre `columnSizing` perché l'app lo salvi — cioè un'API in più sul blocco, e una decisione su dove (`localStorage`? profilo utente?).
4. **La tastiera non arriva gratis, e axe non lo direbbe.** È la lezione di **D15**: una griglia completamente non navigabile da tastiera dà **zero violazioni**. Una maniglia di trascinamento è un affordance da puntatore; renderla azionabile da tastiera è lavoro a parte, e non farlo è una scelta da mettere a verbale, non da omettere.

### «Limitatamente a desktop», e come si scrive

Se e quando si farà, la soglia **non** è una media query sulla viewport: è una **container query sulla tabella**, per la ragione già misurata in §31 — sotto i 768px la colonna del guscio esce dal DOM, quindi lo schermo si allarga di 1px e l'area utile si restringe di 255 (383 in touch). Ciò che decide se c'è spazio per trascinare è la larghezza della **tabella**, non quella dello schermo.

### Perché è scritta qui e non lasciata in chat

Perché è esattamente ciò per cui `PIANO.md` §4 tiene le decisioni: *«promemoria scritti perché non riemergano come sorprese fra tre mesi»*. Una decisione chiusa senza motivazione scritta si riapre da sola, e una decisione chiusa **senza il proprio grilletto** si riapre nel momento sbagliato — o non si riapre affatto quando servirebbe.

**Il grilletto, per esteso**: una tabella i cui dati non hanno una lunghezza prevedibile, dove quindi nessuna `meta.larghezza` è quella giusta per tutte le righe. Se e quando capita, si rilegge questa sezione — i quattro costi sono già misurati — e si decide di nuovo, non da capo.

---

## 35. Conferma o annullo: due risposte alla stessa domanda (D18, **chiusa** in M3.5, 2026-09-15)

**Aperta da Francesco**, a `confirm-dialog` appena scritto: «mettiamo un alert o sonner con es. la possibilità per l'elimina di annullarlo? Vale la pena definirlo ora».

**Sì, vale la pena definirlo ora. No, non va dentro `confirm-dialog`, e non si costruisce in M3.4.** Qui sta il perché, perché la decisione è di Francesco e va posta con i fatti già raccolti.

### 1. Non sono complementari: sono alternative

Confermare prima e poter annullare dopo rispondono alla **stessa** domanda — «e se non volevo?» — e messe insieme sono peggio di ciascuna delle due. Chi ha già confermato in un dialogo non legge il toast che compare un istante dopo; chi ha il toast non voleva il dialogo. Il risultato sono **due interruzioni per un'azione sola**, e soprattutto una conferma che si svuota: se tanto si può annullare, il dialogo si clicca via senza leggerlo, ed è esattamente il momento in cui smette di proteggere qualcuno.

La scelta quindi non è «aggiungiamo anche l'annullo», è **quale dei due, per quale tipo di azione**.

### 2. Quale dei due lo decide il dato — e in Anagrafe il dato ha già una regola

`docs/PIANO.md` di Anagrafe, §sullo schema: *«soft delete solo dove indicato, **tutto ciò che è dichiarato verso l'esterno non si cancella mai, si supera**»*.

È dirimente. La gran parte delle azioni che in interfaccia sembrano distruzioni — archiviare una scheda, superare una revisione, ritirare una pubblicazione — in Anagrafe **non sono cancellazioni**: sono passaggi di stato, reversibili. Sono il caso da **annullo**, e per quelle un dialogo di conferma è un attrito che non compra niente. Restano poche cancellazioni vere — una bozza mai pubblicata, un allegato caricato per sbaglio — ed è lì che il dialogo serve.

### 3. C'è un vincolo tecnico che il disegno non aggira

Un «Annulla» dentro un toast è **una bugia** se l'API ha già cancellato e non sa ricreare. Le strade sono due, e nessuna delle due è una scelta del design system:

- **differita**: l'azione non parte, il toast *è* la finestra, e si committa allo scadere. Costa un annullo che funziona sempre e un'attesa di qualche secondo prima che la cosa sia davvero fatta;
- **ripristino**: l'azione parte subito e l'API espone il rientro (soft delete, o passaggio di stato inverso). Costa un endpoint.

**È la domanda per Francesco**, e nessuno la può rispondere al posto suo: per le cose che in Anagrafe si «eliminano» davvero, l'API farà un soft delete ripristinabile, o l'annullo va costruito come azione differita lato client?

### 4. Il posto dove scriverlo esiste già, ed è M3.5

`PIANO.md` §M3.5: *«`empty-state`, `page-skeleton`, `error-state`: sono lo standard vincolante unico per caricamento, errore, vuoto e **successo** che `docs/INTERFACCE.md` §1 di Anagrafe impone»*. L'annullo è una forma del **successo**, non una forma della conferma.

E `INTERFACCE.md` §1.1 di Anagrafe ha già scritto la regola di ingaggio, prima ancora che il problema si ponesse: *«Toast: non ancora introdotti … Se una fase futura introduce un flusso che richiede un messaggio sopravvissuto alla navigazione, **si adotta UN solo pattern in questo file prima di usarlo**, non uno diverso per pagina.»*

Infilare un toast dentro `confirm-dialog` sarebbe letteralmente il «uno diverso per pagina» che quel paragrafo vieta — e lo sarebbe nel posto peggiore, perché un blocco lo diffonde in tre applicazioni in un colpo solo.

### Cosa c'è già, e non va rifatto

`sonner` è installato, e la sua story `ConAzione` porta scritta **metà della regola**, dalla FASE 2: *«L'azione dentro un toast è sempre ridondante: il toast sparisce, e chi non fa in tempo dev'essere in grado di fare la stessa cosa dalla pagina. Annulla qui è una comodità, non l'unica via.»* Quella riga vincola già il disegno: un annullo che è **l'unico** modo di rientrare non è accettabile, perché il toast dura sette secondi e chi si distrae ha perso il dato.

### Verdetto: M3.5

Con, in ingresso, la risposta alla domanda del punto 3. Se la risposta è «soft delete ripristinabile», l'item è sottile e sta in una funzione sopra `sonner`; se è «differita lato client», è una piccola macchina a stati con un timer e va guardata con la stessa cura dell'attesa di `confirm-dialog`.

**Ciò che questa sezione impegna a non fare**, qualunque sia la risposta: non si mettono **tutti e due** sulla stessa azione.

### Verdetto (2026-09-15): differita lato client — provvisorio

Francesco, interrogato sulla domanda del punto 3 in apertura di M3.5, non aveva una risposta pronta («non so, spiegami cosa comporta ogni scelta»); dopo il confronto sui due costi — nessun contratto backend richiesto per la strada differita, contro un endpoint di soft-delete/ripristino che oggi non esiste per Anagrafe nella strada del ripristino — ha scelto **differita lato client**, esplicitamente **provvisoria**: da rivedere con Roberto a design system finito, per la conversazione dov'è un backend a decidere se un soft-delete generalizzato ha senso per altre ragioni.

Costruito in M3.5: `tassullo-toast-con-annullo` (`registry/tassullo/blocks/toast-con-annullo.tsx`). `azione` non parte finché il toast non si chiude da sé (`onAutoClose`) o viene scartato senza cliccare «Annulla» (`onDismiss` — verificato nella sorgente di sonner che il clic sull'azione non passa da lì, solo lo swipe e la X: `node_modules/sonner/dist/index.mjs`, il bottone azione chiama solo `deleteToast`). Cliccare «Annulla» marca un flag e basta: `azione` non viene mai invocata.

---

## 36. D11, verdetto: non si adotta il generatore `typeset` di shadcn (M3.8, 2026-09-15)

**La domanda posta in §20**: il testo lungo — editor, diff, MDX — ha bisogno di un preset di leggibilità che oggi non esiste, e shadcn ne offre uno (`typeset`). Il vincolo di adozione (§20, "i preset stanno nel registry, nessuna app li modifica") era già deciso **a prescindere** dall'esito; restava solo il sì/no. Qui il sì/no.

### Verdetto: no, non in questa forma

Tre ragioni, in ordine di peso.

**1. Non è uno script, è un builder interattivo.** `tema.css`, `inter.css` e `tassullo-logo.css` — i tre precedenti di "file generato che il registry distribuisce" — nascono tutti da uno script in `scripts/`, rilanciabile, con una sola fonte a monte (la palette, i `.woff2`, gli `.svg`). `typeset.css` non ha un endpoint o un comando: si ottiene componendo scelte in una pagina web (`ui.shadcn.com/typeset`) e scaricando il risultato a mano. Il file che ne uscirebbe sarebbe l'unico, in tutto il registry, senza un modo di verificare che sia ancora quello — lo stesso problema che `check:font`/`check:logo`/`check:contrast` esistono per non lasciare aperto altrove.

**2. Il caso d'uso reale di M3.8 non ne ha bisogno.** `typeset` risponde al contenuto **reso da markdown** — titoli, citazioni, tabelle, codice. Lo schema di `rich-text-editor` (sopra, in questo stesso file) non ha nessuno di questi: due marcatori (grassetto, corsivo), un marcatore in più (apice), due liste, un link. È deliberatamente **fuori dalla forma** che `typeset` stila. Le regole di rendering che servono davvero — spaziatura fra paragrafi, indentazione delle liste, colore e sottolineato dei link — sono sei righe di utility scritte a mano nel blocco stesso (`rich-text-editor.tsx`), sui token del tema, senza bisogno di un secondo sistema di leggibilità che si sovrappone al primo.

**3. Il punto di attrito misurato in §20 resta aperto, e la sua stessa causa (D10) non è ancora chiusa.** `typeset` porta una leva responsiva propria (+12,5% sotto 768px) che si compone con la densità touch; il verdetto su come le due leve devono comportarsi insieme è di **M4.2**, non ancora raggiunto. Adottare ora un sistema la cui interazione con la densità è nota per essere sbagliata, per un caso d'uso che non lo richiede, sarebbe comprare un problema prima che serva la soluzione.

### Cosa resta aperto

`Primitive/Tipografia` (M2.1, §20) resta l'unica risposta del design system al testo dell'**interfaccia** — sei parti enumerate, per elemento. Il testo **lungo** reso da markdown vero (le pagine MDX di questa stessa style guide, un'eventuale nota tecnica multi-paragrafo in Anagrafe) resta senza standard: se un consumatore concreto lo chiede, si riapre la domanda con in mano un caso reale — e a quel punto, se la risposta resta "sì", il builder va rifatto come script proprio (stessa fonte, stesso confronto binario di `check:font`), non scaricato a mano. Annotato qui perché non sia letto come una dimenticanza.

### D8, di passaggio: la terza scelta

`@tiptap/react` (v3, `@tiptap/starter-kit`, `@tiptap/extension-character-count`, `@tiptap/extension-superscript`) per `rich-text-editor` — stessa ragione delle prime due (`react-dropzone`, `react-pdf`): è headless, la barra resta interamente nostra. `StarterKit` include già `link` e `underline`, quindi non serve `@tiptap/extension-link` come pacchetto separato — installato e poi disinstallato in questa sessione, appena verificato. `underline` è spento nello schema (non è nella barra ridotta di M3.8, e lasciarlo accettabile dallo schema senza un bottone per toglierlo sarebbe stata un'incoerenza). D8 resta **TODO** in `CHECKLIST.md`: chiude dopo M3.9 (`diff-view`, l'ultima libreria).

### Un bug preso testando davvero, non leggendo il codice

Prima versione di `rich-text-editor`: un `useEffect` risincronizzava `value` (controllato) dentro l'editor confrontandolo con `serializza(editor)` — la serializzazione **corrente**. Provato in Chromium (non dichiarato): digitare in `VicinoAlLimite`, la storia col pattern controllato, **non inseriva mai nessun carattere** — ogni tasto spariva. Causa: `shouldRerenderOnTransaction: true` (necessario perché la barra e il contatore leggano lo stato aggiornato) fa ri-renderizzare il componente **nello stesso istante** della transazione, un giro prima che `onChange` risalga a `value` attraverso lo stato del chiamante. In quella finestra l'effetto vede `editor` già aggiornato ma `value` ancora vecchio, li trova diversi e richiama `setContent(value-vecchio)` — cancellando il carattere appena scritto, a ogni tasto. Corretto confrontando con un ref di "l'ultimo valore emesso da noi" (aggiornato in modo sincrono dentro `onUpdate`, non dal giro di rendering) invece che con lo stato live dell'editor. Riprovato: la digitazione arriva, il contatore sale un carattere alla volta e si ferma esatto a 2048/2048 passando al colore `destructive`.

Il posto è quello previsto — M3.5, non `confirm-dialog` — e la regola del punto 1 resta rispettata: nessun punto d'uso mette conferma e annullo sulla stessa azione.

---

## 37. Righe delle pagine sola-lista: scorrimento infinito, non pagine calcolate (D19, aperta e chiusa in M3.10, coda, 2026-09-15)

> **La lettera D19 è usata due volte in questo file** — qui e in §42 (`native-select`) — ed è una svista di numerazione, non due facce della stessa decisione. Non si rinumera, perché i due numeri sono già citati altrove: **si cita per sezione**, non per lettera.

**La domanda**: come rendere righe-per-pagina alte quanto lo schermo, senza un numero fisso che lascia un vuoto su uno schermo alto o costringe a scorrere su uno basso — per le pagine **sola lista** (Prodotti, Norme, Certificazioni: sidebar → lista → scheda).

### Prima risposta, scartata: `perPagina="auto"`

Righe-per-pagina **calcolate** — misurate col `ResizeObserver`, non indovinate — per riempire il contenitore, restando comunque a **pagine**: menu «Righe» spento, ma «Pagina X di Y» e i quattro salti restavano. L'ultima pagina (o un filtro con pochi risultati) rendeva sempre meno righe della piena, lasciando un vuoto **dentro** il riquadro bordato — corretto con righe di riempimento vuote e `aria-hidden`, della stessa altezza di una riga vera.

**Verdetto di Francesco: no.** Le righe di riempimento si discostano troppo dalla forma di shadcn — nessun blocco della guida ne ha, ed è esattamente il genere di divergenza silenziosa che la regola 4bis vuole evitare. E soprattutto: non serviva reinventarlo. `anagrafe.tassullo.it/caratteristiche` ha già lo scorrimento infinito in produzione, di Roberto, sulla stessa mole di dati — un meccanismo noto, già collaudato, che gli utenti già conoscono.

### Verdetto: `perPagina="infinito"`, correggendo il solo difetto noto

Lo scorrimento infinito di produzione ha un difetto: la testata scorre via con la pagina, e si perde il nome delle colonne. È un problema di **dove** scorre la pagina — l'intero documento — non del meccanismo in sé. `tassullo-data-table` lo riproduce facendo scorrere **il contenitore della tabella**, non il documento, con la testata `sticky top-0` rispetto a quel contenitore: non se ne va mai.

Il caricamento a passi (`PASSO_INFINITO = 40`) usa un `IntersectionObserver` su una sentinella vuota in fondo al corpo, con `root` il contenitore che scorre — non la finestra. **Una sottigliezza CSS l'ha resa più semplice del previsto**: la primitiva `Table` (`ui/table.tsx`, non toccata) avvolge sempre la propria `<table>` in un `<div overflow-x-auto>`. Per una regola del CSS Overflow Module — un asse impostato esplicitamente e l'altro lasciato `visible` fa *calcolare* l'altro come `auto` — quel div ha già, gratis, un `overflow-y: auto` che nessuna classe dichiara mai. Dentro un riquadro ad altezza ferma (`flex-1 min-h-0`), è quel div interno — non il riquadro attorno — a restringersi e a prendersi lo scorrimento verticale vero. Il riquadro esterno resta `overflow-hidden`: serve solo a dare al div interno un'altezza da rispettare, non a scorrere lui stesso. L'osservatore prende quel div per il suo `data-slot="table-container"`, lo stesso modo in cui `page-header.tsx` trova la propria ancora.

**Vuole un contenitore ad altezza ferma per funzionare** — la stessa condizione di `"auto"`, ereditata: `<AppShell contenuto="riempie">` (D di M3.10, coda: `min-h-svh` → `h-svh` quando la pagina lo chiede, predefinito invariato) e la pagina rende una colonna `flex h-full min-h-0` con la tabella `flex-1 min-h-0`.

Il menu «Righe» e i quattro salti di pagina spariscono del tutto (non solo il primo, come nella risposta scartata): non c'è una pagina da saltare. Resta solo il conto («N prodotti», `nomeRighe`), sempre il totale filtrato vero, non quanto è già caricato.

### Cosa resta uguale a qualunque tabella `data-table`

Ricerca, ordinamento, colonne nascondibili, selezione multipla: tutto il resto del blocco non cambia. `perPagina="infinito"` è una terza forma accanto a un numero fisso, non un blocco diverso — la stessa API, `colonne`/`dati`/`cerca`/`barra`, la stessa storia di gate (1092 scansioni, 0 violazioni).

### Confine accertato: replicabile a basso costo, ma solo per dati già in memoria

Chiesto da Francesco, a gate chiuso: quanto costa ripetere la forma su un'altra pagina sola-lista? **Poco, in codice**: tre righe — `<AppShell contenuto="riempie">`, la pagina che rende `flex h-full min-h-0 flex-col` attorno a `PageHeader` + tabella, `<DataTable perPagina="infinito" className="min-h-0 flex-1">`. Nessuna delle tre correzioni prese in coda (il cricchetto, il bordo doppio, lo scatto in scorrimento) va ripetuta altrove: vivono dentro il blocco, non nella pagina che lo consuma.

**Ma il meccanismo rivela progressivamente un array già interamente in `dati`** — non chiede altro al server mentre si scorre. Regge finché l'API della pagina risponde con l'elenco intero in una chiamata sola, com'è oggi per Prodotti in Anagrafe (e come lo simula `generaProdotti` nella story). Una pagina sola-lista futura con un elenco **paginato lato server** — non tutto scaricato in un colpo — chiederebbe un `onCaricaAltro`/`fetchNextPage` che questo blocco oggi non ha: non è un'estensione gratuita, è lavoro in più da preventivare. Annotato nel commento di testa di `DataTableProps.perPagina`, perché è lì che chi replica la forma guarda per primo — non solo qui.

## 38. D10, verdetto: la densità touch regge a 375px così com'è (M4.2, 2026-09-15)

La prima misura (§29, M3.1) aveva già ribaltato l'assunzione del piano — a 375px il colpevole non è la larghezza massima di pagina ma la colonna — senza però un verdetto: mancava una pagina vera, densa quanto basta, su cui prenderlo. `pagina-lista` (M4.2) lo è: filtri, ricerca, tabella con sette colonne potenziali, paginazione.

**Misura**: `pagina-lista` (story `Pagine/Lista`, dati Norme) a 375×812, densità touch. La colonna di contenuto resta **327px** — la stessa identica cifra di §29 (343 → 327, il padding di pagina che toglie 16px in tutto). Nessun bersaglio sotto soglia, nessuna rottura di layout; la tabella scorre in orizzontale com'è il comportamento già gated di `data-table` a larghezze strette (`bloccaPrimaColonna` esiste apposta).

**Verdetto: (a) — non si tocca niente.** La densità touch a schermo stretto è già quella giusta sulla pagina più impegnativa che il registry abbia: il padding di pagina non va scorporato dallo scaling (uscita b, mai servita) e il fattore di densità non va ridotto sotto una soglia di larghezza (uscita c, scartata a monte — avrebbe reintrodotto una dipendenza dal viewport in un meccanismo pensato come scelta dell'app, non del dispositivo).

Provate per completezza anche le altre tre celle (375×normale, 1440×touch, 1440×normale): tutte pulite. `test:a11y` conferma zero violazioni sulle quattro nuove story in entrambe le modalità.

**Ricade su D11 (§36)**: la riserva lì lasciata aperta — l'interazione fra la leva responsiva di `typeset` e la densità touch, giudicabile solo dopo D10 — non si pone più nei termini previsti, perché D10 chiude senza toccare `--space-page` o il fattore di scala: non c'è una seconda leva con cui `typeset` dovrebbe comporsi. D11 resta comunque chiusa per le sue ragioni proprie.

## 39. `tassullo-data-table`: il riquadro ad altezza ferma diventa indipendente da `perPagina` (2026-09-16)

Rilievo di Francesco su `pagina-lista` in uso: con 10 righe il riquadro restava molto più corto dello schermo, con 25 (il default) superava lo schermo e senza scorrere **la pagina intera** il piè — conteggio, salti di pagina — restava fuori vista. Chiesto un riscontro con le best practice di settore prima di intervenire.

**Ricerca** (Pencil & Paper, LogRocket, Setproduct): una tabella dati densa vuole un solo scroll, non due; il piè con conteggio e paginazione sempre visibile, tipicamente `sticky` in fondo; l'intestazione ferma mentre il corpo scorre.

**Diagnosi**: il blocco aveva già questo pattern — riquadro ad altezza calcolata (`altezzaMax`), scorrimento interno su `table-container`, piè sempre fuori dall'area che scorre — ma **solo per `perPagina="infinito"`**. La paginazione numerica non l'aveva mai ricevuto: non un uso scorretto del consumatore, un buco nel blocco.

**Corretto scorporando due decisioni che stavano cucite insieme**: `perPagina` resta *come si caricano le righe* (`"infinito"` a scorrimento, un numero a pagine — invariato); un nuovo `altezza?: "naturale" | "ferma"` (default `"naturale"`, compatibile con l'uso esistente) sceglie *quanto spazio prende il riquadro*, indipendente da `perPagina`. `"ferma"` applica a qualunque paginazione la stessa meccanica che prima girava solo per `"infinito"`. Aggiunto anche `piePagina?: boolean` (default `true`) per togliere conteggio e paginazione dalle tabelle **imbarcate** — non ancora usato, ma previsto per M4.3 (`pagina-scheda`), dove più tabelle piccole condivideranno la stessa pagina senza bisogno del conteggio.

`PaginaLista` passa sempre `altezza="ferma"`: è sempre la pagina intera (a differenza di una tabella dentro una scheda), quindi il riquadro fermo è corretto a prescindere da come `perPagina` carica le righe — la dipendenza dalla sessione precedente (`h-full min-h-0` solo se `infinito`) risolveva il sintomo, non la causa, ed è stata tolta.

**Regressione presa nello stesso giro**: la story `Pagine/Prodotti (Anagrafe)` (M3.10) chiama `DataTable` direttamente con `perPagina="infinito"` ma, scritta prima che le due prop si separassero, non passava `altezza="ferma"`. Il riquadro restava alto quanto prima (per un effetto collaterale di `overflow-hidden` sul modello flessibile — l'altezza automatica di un elemento flex con overflow diverso da `visible` è 0, non quella del contenuto) ma **senza scorrimento interno**: `table-container` cresceva al proprio contenuto (8305px) dentro un genitore che lo ritagliava senza offrire una barra di scorrimento. Corretto aggiungendo il prop mancante.

Tre case reali riportati da Francesco, a guidare la forma finale: **(1)** più tabelle ad altezza fissa nella stessa `pagina-scheda`, senza bisogno del piè — `altezza="ferma"` + `piePagina={false}`, da cablare in M4.3; **(2)** una tabella dentro una `pagina-scheda` fra altro contenuto — `altezza="naturale"` (il default, la pagina scorre); **(3)** `pagina-lista`, la tabella è la pagina — `altezza="ferma"`, cablato ora.

Fonti: [Data Table Design UX Patterns & Best Practices — Pencil & Paper](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables), [Data table design: Best practices for better UX — LogRocket](https://blog.logrocket.com/ux-design/data-table-design-best-practices/), [Data table UI design reference guide for 2026 — Setproduct](https://www.setproduct.com/blog/data-table-ui-design).

## 40. Valutazione niko-table: si porta (si riscrive), non si installa — apre la FASE 3bis (2026-09-16)

Francesco ha segnalato [niko-table](https://niko-table.com) (MIT, Semir N., github.com/Semkoo/niko-table-registry, 66★): un registry shadcn su TanStack Table v9, compatibile sia con Radix ("new-york") sia con **Base UI ("base-nova")**, con pattern che `data-table` (M3.3) non copre — righe annidate con subtotale, espansione, resize/pin colonne, scroll infinito, editing a foglio elettronico, filtri sfaccettati, drag&drop righe/colonne. Riscontro su un caso reale: lo screenshot del "Computo metrico estimativo" di Studio Tassullo (`/computo`) mostra righe di voce con sotto-righe di misurazione annidate (dati veri del genitore, non un raggruppamento per colonna — verificato leggendo "Tree Table", che distingue esplicitamente i due pattern), subtotale per voce e totale generale: corrisponde al pattern **Tree** (`getSubRows`) e alla **Data Grid** di niko-table, non a `Grouping` come ipotizzato in una prima bozza di questa valutazione.

**Verificato che l'installazione diretta non è praticabile**, non solo "poco elegante": ogni file di niko-table importa `@/components/ui/table` e `@/lib/utils` fissi, non il nostro alias `@/registry/tassullo/...` (regola 1 di `CLAUDE.md`); il core usa valori Tailwind arbitrari (`h-[600px]`, `max-h-[400px]`, regola 3); e `@niko-table/data-table-ui` installerebbe un proprio `ui/table.tsx`, sovrascrivendo il nostro già ri-stilato (`bg-accent`, `tabular-nums`, M3.3). La sua architettura (Context `DataTableRoot`, feature-detection che scansiona l'albero React cercando nomi di componenti conosciuti, ~35 registry item, API in inglese) duplicherebbe `tassullo-data-table` (già DONE, già montato in `pagina-lista`) invece di estenderlo.

**Verdetto: si porta, non si installa.** Ogni sessione della nuova FASE 3bis parte dal JSON pubblico dell'item (`https://niko-table.com/r/<nome>.json`, raggiungibile senza registrare `@niko-table` in `components.json` — verificato), lo riscrive con i nostri import/token/API italiana in un solo passaggio (non esiste un "originale shadcn" da snapshottare prima come nel ciclo 4ter — qui non si applica), mantiene la nota di attribuzione MIT (Copyright Semir N., "Original work Copyright WebDevSimplified" — licenza permissiva, verificata su GitHub). L'unico pezzo che tocca una primitiva (`ui/table.tsx`, per resize/pin generalizzato, M3bis.3) richiede la conferma esplicita di Francesco **prima** di scrivere codice, per 4bis.4, e una riga in `componenti-propri.json` a lavoro fatto — i blocchi (`data-table.tsx`, nuovo `data-grid.tsx`) non la richiedono, perché non hanno un originale shadcn da cui divergere.

**Verificato sul codice, non solo sulla documentazione niko-table, cosa serve davvero e cosa no**: Row Selection e la barra di azioni di massa sono **già coperti per intero** da M3.3 (`selezione` + `barra` come funzione `(scelti) => ReactNode`, equivalente esatto di `DataTableSelectionBar`) — nessun gap. Column Pinning è **parzialmente coperto**: `bloccaPrimaColonna` (M3.3) è già un pin fisso di prima colonna/sinistra; M3bis.3 lo generalizza, non lo costruisce da zero. Filtri per colonna hanno già la macchina di stato TanStack (`columnFilteringFeature`) ma nessuna UI pronta — gap reale, coperto da M3bis.6 (filtri sfaccettati con conteggio per opzione, richiesto da Francesco: vedere a colpo d'occhio quanti risultati porta ogni valore).

**Ambito deliberatamente escluso da questa ondata** (nessun bisogno verificato oggi, si riapre solo su caso reale): `data-table-aside`, export CSV (Studio ha già Excel/Primus/ZIP lato server), colonne dinamiche a runtime, filtri "query-builder" con AND/OR fra regole (Advanced Filter Table), grid server-side vero e proprio (la pagina "Server-Side Grid" di niko-table resta un riferimento di composizione per chi cablerà `tassullo-data-grid` al backend di Studio, non genera codice di registry). **Skill niko-table** (`niko-table-best-practices`, installabile via `skills.sh`): valutata e **scartata** — insegnerebbe a scrivere codice con l'API e gli import diretti di niko-table, esattamente le convenzioni che questa fase decide di non adottare.

Dettaglio completo delle 10 sessioni (M3bis.0-9), con file toccati e criteri di accettazione, in `PIANO.md` §FASE 3bis e `CHECKLIST.md`.

## 41. M3bis.1, "Tree": il subtotale è una funzione per colonna, non `rowAggregationFeature` (2026-09-16)

`tassullo-data-table` porta ora righe annidate vere (`getSottoRighe`, tradotto da `getSubRows` di TanStack — registrato **sempre** in `caratteristiche` insieme a `rowExpandingFeature`/`createExpandedRowModel()`, perché resta inerte finché nessuna riga ha `subRows`, quindi non serve biforcare la costante per le sessioni che non ne hanno bisogno), il rientro e lo `chevron` di ogni livello (`CellaAlbero`, da comporre nel `cell` della colonna che identifica la riga — non una colonna a sé, come non c'è in un esploratore di file), la selezione a cascata (`colonnaSelezione` ora legge anche `row.getIsAllSubRowsSelected()`/`row.getIsSomeSelected()`, cascata che TanStack già fa da sé in `mutateRowIsSelected`) e il subtotale sulla riga genitore.

**Il subtotale è `meta.sottototale: (righeFiglie, riga) => ReactNode`**, non `columnGroupingFeature`/`rowAggregationFeature` di TanStack (che pure esistono e offrirebbero `aggregationFn: "sum"` dichiarativo). Due ragioni, non una sola:

1. **La struttura è dato vero, non raggruppamento** — è il punto fermo di tutta la FASE 3bis, verificato leggendo "Tree Table" durante la valutazione niko-table (§40): un `Grouping` deriva le righe genitore *dai dati delle foglie* (raggruppa per colonna), un `Tree` le riceve già distinte dal dominio (la voce e le sue misurazioni sono due entità diverse nel database di Studio). Registrare `rowAggregationFeature` accanto a `rowExpandingFeature` inviterebbe a usare l'aggregazione per fare groupby, esattamente il pattern scartato.
2. **Un subtotale di computo porta l'unità di misura col numero** («21,63 m³», non «21.63»), ed è formattazione — dominio della pagina, non del blocco. Una funzione la scrive nella forma che serve (quantità con `Intl.NumberFormat('it-IT')`, importo con `style: 'currency'`); un nome di operazione (`"sum"`) costringerebbe il blocco a indovinare come renderla, o a esporre un secondo prop di formattazione che duplicherebbe quanto la cella normale già fa nel proprio `cell`.

Verificato in Chromium reale (Playwright, non il pannello del browser di questa sessione — vedi il monito già a verbale su quello strumento): `Enter`/`Spazio` su `CellaAlbero` espandono e collassano, `Spazio` sulla casella della voce seleziona a cascata le misurazioni e il conto in fondo («1 di 5 voci selezionate») resta sulle voci, non sulle righe piatte. `npm run test:a11y`: 288 scansioni (passata unica)/0 violazioni sulla nuova story `Albero`; `npm run check` completo: 1152 scansioni (4 passate)/0 violazioni.

## 42. D19: `native-select` **non entra** nel registry — la parità fra sistemi vale più del peso del popup (2026-09-19)

> **Anche §37 porta la lettera D19** (scorrimento infinito): la collisione è una svista di numerazione, e le due decisioni non hanno niente in comune. Chi rimanda a «l'obiezione dell'emoji / del `<select>` nativo» intende **questa**, §42 — è il caso di M4ter.9, `tassullo-barra-contesto`. Si cita per sezione, non per lettera.

**La domanda.** L'analisi delle tre app (M4.6, coda) ha contato **81 `<select>` scritti a mano**: Officina 46, Studio 23, Anagrafe 12. È il numero più alto emerso dal confronto fra il catalogo shadcn e ciò che il registry copre, e la primitiva `native-select` di shadcn sembrava la risposta ovvia: un `<select>` vero con `appearance-none` e un chevron disegnato sopra, `cn` come unica dipendenza, nessun portale, nessun fuoco da riportare indietro, e sul telefono la ruota del sistema.

**Il verdetto è no, e lo dà Francesco con una ragione che il conto degli 81 non tocca.** La tendina di un `<select>` nativo **non la disegna il browser: la disegna il sistema operativo**, ed è l'unico pezzo di interfaccia che un design system non può vestire né uniformare. Le differenze non sono estetiche: su Windows, premendo una lettera, la tendina nativa **non salta alla voce corrispondente**, mentre su macOS sì. Adottare `native-select` significherebbe quindi spedire alle app un componente che **si comporta diversamente a seconda della macchina di chi lo usa** — e le app dello studio girano su entrambe.

È anche la ragione per cui il `select` di Base UI era stato scelto a suo tempo: non per gusto, ma per avere **parità di funzionalità** fra sistemi.

**Verificato, perché una motivazione che attribuisce una capacità va controllata e non data per buona.** Su `Primitive/Select` in Chromium, col popup aperto: premendo `p` si evidenzia **Pubblicato**, `a` evidenzia **Archiviato**, e la sequenza `i`+`n` evidenzia **In revisione** — quindi la ricerca a tastiera c'è, funziona anche su più caratteri, ed è **la stessa ovunque**, perché è la nostra, non quella del sistema operativo.

**Conseguenze operative.**

1. `native-select` **non si installa**, e non va riproposta senza un fatto nuovo. Il fatto nuovo che la riaprirebbe è uno solo: una misura che mostri che il popup di Base UI non regge un caso reale (un `<select>` dentro una tabella con centinaia di righe, per dire), non il semplice «è più leggero».
2. Gli **81 `<select>` scritti a mano non restano dove sono**: si sostituiscono con il `select` che il registry ha già. Non è materia di una primitiva nuova, è materia della **guida di migrazione (M5.5)**, ed è lì che va scritta — con il costo vero, che non è la sostituzione del tag ma il passaggio da `value`/`onChange` di un `<select>` alle props di Base UI.
3. Resta valido il rovescio già a verbale: il popup costa **4 `aria-hidden-focus`** a popup aperto, che il gate spegne nella sola passata `aperto` perché è Base UI a rendere inerte lo sfondo. Il costo è noto, misurato, e accettato — questa decisione lo conferma invece di rimetterlo in discussione.

## 43. Cosa si può prendere da `@reui`, e a quali condizioni (M4ter.1, 2026-09-19)

**Il criterio che distingue libero e a pagamento non è il campo `type`.** Questo
repo l'aveva scritto — «i `wizard-1…7` sono di tipo `registry:block`, cioè Pro
Blocks» — e la conclusione era giusta per caso. **Anche tutti i `c-stepper-1…15`
e i `c-event-calendar-1…5` sono `registry:block`**, e sono liberi.

**Il test che regge, ed è verificabile in un comando:**

> Il **sorgente** sta nel repo `keenthemes/reui`, che ha un `LICENSE.md` solo,
> MIT, senza deroghe?

```bash
curl -s "https://api.github.com/repos/keenthemes/reui/git/trees/main?recursive=1" \
  | python3 -c "import json,sys;print([x['path'] for x in json.load(sys.stdin)['tree'] if 'NOME' in x['path']])"
```

Misurato il 2026-09-19: dei `wizard-*` nel repo ci sono **soltanto gli
screenshot** (`public/screenshots/blocks/application/`), il codice no — quindi
sono davvero Pro, e la loro licenza (`reui.io/legal/license`, che si apre con
«after purchase») vieta alla lettera la pubblicazione in un repo pubblico e il
reimpacchettamento in un'altra component library. I `c-*.tsx` delle gallerie
libere invece **ci sono**, sotto `registry-reui/bases/base/components/<nome>/`.

**Le gallerie libere: dove sono e cosa contengono.** `reui.io/components/<nome>`
elenca le demo di quel componente; i loro titoli veri stanno in
`registry-reui/bases/base/components/<nome>/meta.json`. **Attenzione, i titoli
dei docs sono sfasati rispetto a quelli della galleria**, ed è costato una
ricerca a vuoto: nei docs `c-stepper-12` compare sotto «Vertical», in `meta.json`
si chiama «Stepper with segmented progress bar». Valgono quelli di `meta.json`.

**Ma «libero» non vuol dire «senza licenza», e qui la nota va letta con
attenzione perché il rischio è di buona fede.** Quelle demo sono **MIT**, non
prive di licenza, e la MIT pone una condizione sola: l'avviso di copyright va
conservato «in all copies or **substantial portions**». La conseguenza dipende da
cosa si fa, e sono due casi diversi:

- **Si copia il file nel registry** (è il caso di `stepper.tsx`): noi lo
  **ridistribuiamo** alle app, quindi l'avviso resta nel file e il testo
  integrale viaggia con l'item. `check:registry` lo fa rispettare —
  `avvisoDaConservare` in `REGISTRI_ORIGINE` — ed esce **1** se l'avviso sparisce.
- **Si guarda la demo e si compone la nostra scena** (è il caso di
  `c-stepper-3`, `9`, `12`): lì si prende una *geometria*, non un file, e non si
  ridistribuisce niente di loro. Nessun avviso da portare. È anche l'unica strada
  praticabile, perché le loro demo usano `StepperNav`, che da noi non passa il
  gate di accessibilità.

E **la tavolozza delle demo non si copia comunque**: `c-stepper-3` fa il passo
fatto con `bg-green-500` e `text-white`, cioè colori grezzi di Tailwind che la
**regola 3** del `CLAUDE.md` non ammette. Si prende il meccanismo, i colori
restano quelli del tema.

**Perché questo NON scioglie il nodo del calendario.** Le cinque demo di
`reui.io/components/event-calendar` sono composizioni, non il motore:
`c-event-calendar-1.tsx` è **812 righe** che importano
`@/…/reui/event-calendar/event-calendar`, `-content`, `-i18n`, `-nav`, `-types`.
Restano quindi tutti e due i fatti che hanno fermato M4ter.1, e vanno ricordati
insieme a questa nota, o la si legge come una soluzione che non è:

1. le due viste **non sono installabili separatamente da `add`** — dipendono
   dall'ombrello `@reui/event-calendar`, che come *item* spedisce tutti e 13 i
   file. **Ma la dipendenza del codice è più stretta**, e va misurata invece che
   dedotta dall'item: chiudendo gli `import` a partire da vista mese e agenda si
   arriva a **9 file** più `icon-stack`, cioè **10 — 234 KB, 7 012 righe**.
   Restano fuori davvero `time-grid`, `resource-view`, `nav` e `content`, che
   sono **95 KB**: il «93 KB su 326 lasciati fuori» di §6.11 era **giusto**, e
   questo verbale l'aveva dichiarato falso confondendo ciò che `add` risolve con
   ciò che il codice importa. `recurrence` invece serve, perché `lib` lo importa;
2. `shadcn add` di una vista **sovrascrive cinque primitive nostre già
   ri-stilate** (`button`, `dropdown-menu`, `tooltip`, `scroll-area`,
   `calendar`), perché le risolve da `@shadcn`. I file vanno portati dentro con
   `shadcn view`, come fa `--snapshot`, non con `add`.

**Quello che le demo libere aggiungono davvero**, ed è utile a M4ter.2: sono
**cinque composizioni di riferimento** — tutte le viste con impostazioni dal
vivo, la vista risorse, il dialogo di creazione, i chip d'evento su misura, il
trascinamento per prenotare — da cui leggere come si monta il motore senza
scriverlo a tentativi. Sono materiale di lettura; il blocco `tassullo-calendario`
resta nostro, coi default di casa (settimana da lunedì, niente creazione dal
clic, trascinamento spento).

---

## 44. Il calendario montato: la testata è nostra, la griglia non si naviga con le frecce (M4ter.2, 2026-09-19)

**Prima cosa da sapere, perché cambia come si legge tutto il resto: i dieci file
del motore, che M4ter.1 ha portato dentro senza mai renderizzarli, *rendono*.**
Un mese con le barre pluri-giorno e il calcolo delle corsie, un'agenda,
il «+N altri» col suo popover, la densità touch. Nessuna sorpresa strutturale.
Quello che è emerso montandolo sono quattro fatti, e tre sono scomodi.

### (a) La testata: la nostra, non `event-calendar-nav`

Guardata rendere prima di decidere, com'era prescritto: si è installata la loro
in via temporanea e la si è montata sopra il mese. **Rende**, ed è fatta bene.
Ma il conto è questo:

| | la loro (`event-calendar-nav`) | la nostra (in `calendario.tsx`) |
|---|---:|---:|
| righe | **648** | ~50 |
| peso | **19,6 KB** di codice di terzi | nessun file in più |
| viste offerte dal commutatore | **sei** (mese, settimana, giorno, N giorni, agenda, risorse) | le **due** che spediamo |
| composizione | `dropdown-menu` + `calendar` + `popover` + `tooltip` + scorciatoie da tastiera | `button-group` + `toggle-group` |
| lingua | inglese, da tradurre con `i18n` | italiana, scritta |

Le ragioni per scartarla, in ordine di peso. **Il loro commutatore offre le sei
viste del motore e noi ne spediamo due**: `time-grid` e `resource-view` non sono
nel registry, quindi metà di quel menù aprirebbe viste che non esistono — si
restringe con `views`, ma è codice che resta e che nessuno esercita. **La
testata di Officina è già composta così**: `docs/ANALISI-COPERTURA-APP.md` §6.8
la elenca pezzo per pezzo, `button-group` per «‹ Oggi ›» e `toggle-group` per le
viste, cioè esattamente ciò che si è scritto. E **una testata nostra la
governiamo**: la loro sarebbero 19,6 KB in più da rileggere a ogni aggiornamento
di ReUI, per una barra che è tre bottoni e un interruttore.

Restano fuori, come previsto, anche `time-grid`, `resource-view` e `content` —
e `content` merita una riga: è solo un commutatore di viste (`month` →
`EventCalendarMonthView`, `agenda` → `EventCalendarAgendaView`, …). Con due
viste, il commutatore è un ternario nel blocco.

### (b) La griglia del mese **non si naviga con le frecce**, ed è D15 di nuovo

Misurato in **Chromium vero**, headless, dalla cartella temporanea, con il
controllo dello strumento fatto prima della misura — i tasti arrivano con
`event.key` pieno (`ArrowRight`, `ArrowDown`, `Home`, `End`, tutti
`defaultPrevented: false`) e `document.visibilityState` è `visible`, quindi
«non è successo niente» vuol dire davvero *niente*, non «il tasto non è
arrivato».

| | misura |
|---|---|
| struttura ARIA | `role="grid"` × 1 → `role="row"` × 7 → `role="gridcell"` × **42** — corretta |
| celle con `tabindex` | **0** su 42 |
| frecce / `Home` / `End` sul chip a fuoco | **nessun movimento**, né del fuoco né della selezione |
| `Tab` | cammina i chip uno a uno, in ordine di documento |
| `Invio` su un chip | **seleziona** (`aria-pressed="true"`) |
| «+N altri» | a fuoco con `Tab`, apre con `Invio`, il fuoco entra nel pannello, `Esc` chiude e **il fuoco torna al grilletto** |

**E axe dà zero violazioni su tutto questo.** È esattamente la lezione di D15:
una griglia con la struttura ARIA giusta e nessuna navigazione da tastiera
passa ogni regola automatica.

**Perché non è (oggi) un difetto bloccante, e a quale condizione lo diventa.**
Col default di casa una cella **non ha azioni**: il clic sulla griglia non crea
niente. Un elemento senza azioni non deve prendere il fuoco, quindi la griglia
non navigabile è *coerente* con la scelta di prodotto, non in contraddizione con
essa. Diventa un difetto nel momento in cui un'app passa `onGiornoClick`, perché
allora la cella ha un'azione raggiungibile solo col mouse. Per questo il blocco
accende `showDayAddButton` **insieme** a `onGiornoClick` e non prima: quel
bottone è un `<button>` vero, invisibile finché non lo si sfiora o non lo si
mette a fuoco, ed è l'unico appiglio da tastiera che il motore offre per creare.

### (c) Una stringa ri-stilata dentro `event-calendar-agenda-view.tsx`, e il gate **non la vede**

L'intestazione di giorno dell'agenda formattava la data con `"MMMM d, yyyy"`,
**scritto a mano nel file**, non preso da `i18n.formats`: col `locale` italiano
usciva «settembre 7, 2026». Non si chiude dal blocco — il `locale` traduce le
parole, non ne cambia l'ordine — e la stessa variabile alimenta anche
l'`aria-label` del gruppo, quindi il difetto era doppio. Cambiata in
**`"d MMMM yyyy"`**: una stringa, gradino 2, e le altre tre intestazioni
(titolo del periodo, intervallo d'agenda, popover del «+N altri») si sono
invece chiuse **dal blocco**, riscrivendo `i18n.functions` e
`formats.moreDayHeader`, che è configurazione e non un ri-stile.

**Il fatto da conoscere è però un altro, e riguarda il gate.**
`event-calendar-agenda-view.tsx` cade nella categoria `◌` di `check:registry`
(«originale a segnaposto d'icona: la forma non è confrontabile»), e in quella
categoria il gate **non conta le stringhe ri-stilate**. Quindi questa
divergenza è **muta**: `check:registry` esce verde e non la nomina. È scritta
qui perché è qui che la cercherà chi, alla prossima versione di ReUI, dovrà
rileggere a mano i file `◌` — che è l'avviso che il gate stampa già oggi su
sette file. Non si è allargata la macchina del gate per un caso solo; se i casi
diventano due, si allarga.

### (d) `renderAgendaDayHeader` e `renderAgendaDaySummary` sono configurazione morta

`EventCalendarViewConfig` le dichiara, ma `event-calendar-agenda-view.tsx` non
le chiama mai (verificato a grep su tutti e dieci i file): descrivono un'agenda
ripiegabile che nella versione adottata non c'è. Non è un difetto nostro ed è
innocuo — ma chi provasse a passarle per aggirare (c) perderebbe un pomeriggio.

### (e) Seconda passata, su sei rilievi di Francesco (2026-09-19)

Il blocco della prima passata era **di sola lettura e senza bordi**: si
guardava, non si usava. I sei rilievi, e cosa ne è uscito.

**Il principio che li tiene insieme, ed è di Francesco: «le funzioni che ti ho
chiesto sono tutte presenti su ReUI, non serve inventare nulla».** Ogni pezzo
qui sotto viene da una loro demo, adattato ai nostri token — che è esattamente
ciò che §43 chiama «prendere la geometria, non il file»:

| pezzo | demo |
|---|---|
| dialogo unico crea/modifica/elimina, `apiRef` | `c-event-calendar-3` |
| `renderEvent` con pallino/icona e titolo | `c-event-calendar-4` |
| avatar dell'assegnatario dentro il chip | `c-event-calendar-5` |
| `interactions: { drag, resize }` | `c-event-calendar-3/4/5` |

**1. I bordi.** La griglia del mese ha i soli tratti *interni* (`border-e`
sulle celle, `border-b` sulle righe, `border-t` sulla vista): sui quattro lati
esterni non c'è niente, e su un fondo chiaro il calendario sembrava appoggiato
sul nulla. Chiuso sul nostro contenitore, non sul loro file:
`rounded-lg border bg-card`.

**2. Celle alte da tre eventi.** `min-h-30` sulla riga via
`classNames.monthRow`. Il conto: tre corsie da `--ec-month-bar-h` (28px) = 84,
più 6 di `pt-1.5` e 26 di numero del giorno = **116px**, cioè 30 unità di
spaziatura. Deriva da `--spacing`, quindi in touch diventa 180 da sé.

**E qui è nato un difetto, chiuso al secondo tentativo.** Sei righe da 120px
sono 720: `month-view` ha `overflow-hidden`, quindi l'ultima settimana
**spariva senza scrollbar**. Primo rimedio, `classNames.monthBody:
"overflow-y-auto"` — e il gate l'ha preso: `scrollable-region-focusable`,
*critical*, sulla scena **Vuoto**, perché una regione che scorre senza niente
di focalizzabile dentro non si raggiunge da tastiera (con eventi i chip
bastano, con zero eventi no). Rimedio giusto: lo scorrimento sta sul **nostro**
contenitore, che è un `div` nostro e può prendere `tabIndex={0}` e un anello di
fuoco; la vista passa a `overflow-visible` e l'intestazione dei giorni diventa
`sticky`. Vale come regola: **una classe `overflow-*` passata a un componente
di terzi via `classNames` crea una regione che non possiamo rendere
focalizzabile.**

**3. I colori — e poi il rilievo che ha cambiato il modello.** La prima
stesura metteva un `colore` sull'evento e cinque pastiglie nel dialogo.
Rilievo di Francesco: **«non è propriamente il colore, si cambia il calendario
a cui è assegnato l'evento; in questo caso il calendario corrisponde alla
persona a cui è affidato il task»**. Ha ragione, ed è un modello diverso, non
un'etichetta diversa: non si sceglie una tinta, si sceglie *a chi appartiene*
l'evento, e il colore è la conseguenza.

**Il concetto esiste già nel motore e non si inventa**: è `resource`
(`EventCalendarResource`: `id`, `title`, `color`) con `event.resourceId`. Il
blocco gli dà il nome di casa — `calendari`, `calendarioId` — e aggiunge la
sola cosa che manca: **derivare il colore del chip dalla risorsa**, che ReUI
da sé non fa (`event-calendar-event.tsx:483` legge solo `event.color`). Da lì
viene anche l'avatar, perché un calendario che è una persona ha un nome e
un'immagine.

Il concetto regge oltre il caso: un calendario può essere una linea, un
reparto, una commessa. Per questo la prop si chiama `calendari` e non
`persone`, e `colore` resta sull'evento **solo** per chi non ha calendari.

I cinque colori sono i `--chart-*` del tema e si scelgono **per nome**: `color`
del motore è una `string`, quindi accetterebbe `#F4AC3D` **senza che nessun
gate se ne accorga** — la regola 3 guarda le classi di Tailwind, non i valori
delle prop. Un insieme chiuso di nomi è il solo modo di farla rispettare per
costruzione. Delle demo di ReUI non si prende la tavolozza: loro usano
`var(--color-blue-500)` e `bg-violet-500`, che la regola 3 vieta.

Nel dialogo il campo è quindi **«Calendario»**, un `select` con pallino
colorato e nome; le cinque pastiglie restano solo quando `calendari` è vuoto.
Provato in Chromium: scegliendo «Luca Boni» l'evento nuovo esce con
`--chart-2` e le iniziali `LB`.

**4. L'avatar del calendario**, e il chip che diventa nostro. Qui il gate ha
trovato **due contrasti sotto soglia, entrambi ereditati dalla ricetta di
ReUI**, e vanno conosciuti perché nascono dallo stesso errore — *un colore su
sé stesso*:

| | ricetta ReUI | misura (scuro) | rimedio |
|---|---|---:|---|
| iniziali nell'avatar | `text-(--ec-event-color)` su `bg-(--ec-event-color)/25` | **2,35** (grigio) … 4,11 (arancio) | `text-foreground`, tinta a `/20` |
| ora dentro il chip | `text-muted-foreground` sul fondo tinto | **4,11** (grigio) | `text-foreground` con `opacity-70` |

La tinta è scesa da `/25` a `/20` per un motivo che vale la pena scrivere:
a `/25` l'arancio in scuro dava **4,49:1**, cioè un centesimo sotto. Un gate
che si fermasse a «quasi» non servirebbe a niente.

Conseguenza di forma: **il chip lo rendiamo noi in tutte le viste a griglia**,
non solo quando c'è un calendario. Titolo e ora si distinguono per **peso**,
non per colore, perché sul fondo tinto di cinque colori diversi l'unico colore
di testo che regge sempre è `foreground`.

**5. Il dialogo e l'interattività.** `modifica` accende il dialogo unico —
clic su un evento apre in modifica, clic su un giorno vuoto in creazione,
«Nuovo» in testata fa lo stesso — e `trascinamento` accende `drag` e `resize`.
**I default non cambiano**: entrambe partono spente, che è la scelta di
Officina; le due prop dicono quanto aprirlo.

Del dialogo di ReUI non si prende il bottone Elimina: loro lo fanno
`variant="ghost"` con `text-destructive`, che sul menu scuro dà 3,52:1 ed è la
trappola scritta in `CLAUDE.md`. Da noi è `variant="destructive"`.

**Gli eventi sono controllati, e non è una scelta nostra**: in modo controllato
`setField` emette `onEventsChange` e **non** tocca lo stato interno, quindi
trascinamento e dialogo non muovono niente finché l'app non rimette dentro
l'elenco. È anche il comportamento giusto: una riprogrammazione passa dal
backend.

**Misurato in Chromium vero** (il pannello dell'app non apriva il dialogo: è il
solito `requestAnimationFrame` di §32):

| prova | esito |
|---|---|
| clic su un evento | apre «Modifica evento» col titolo giusto |
| «Nuovo» | apre «Nuovo evento», 5 pastiglie di colore |
| creazione | 3 → **4** eventi |
| clic su giorno vuoto | apre in creazione su «domenica 20 settembre 2026» |
| eliminazione | 4 → **3** eventi |
| trascinamento di due colonne | giovedì 10 → **sabato 12** |

**Una trappola di misura pagata due volte, e vale oltre il caso.** Il primo
test del trascinamento diceva «non si muove»: leggeva l'`aria-label` del chip,
che per un evento di poche ore è *«Manutenzione forno, 08:00–12:00»* — **l'ora,
non il giorno**. Spostandolo di due giorni l'etichetta non cambia di una
lettera. La misura giusta è la **cella** che lo contiene (`data-ec-day`). E il
secondo test è fallito per il motivo opposto: Storybook esegue le `play` anche
nel canvas, quindi la story col dialogo dichiarato **arriva col dialogo
aperto**, e l'overlay intercettava il puntatore. Da lì la scena separata per il
dialogo (`Dialogo dell'evento`), così quella dell'interattività si prova
com'è.


### (f) Terza passata: due difetti visti a video, e la misura che li chiude

**Doppio bordo.** Il contenitore nostro porta `border`, e `month-view` ha un
suo `border-t`: due tratti a 1px di distanza, che a video si leggono come un
bordo sdoppiato — ed è la prima cosa che si nota. Chiuso con
`classNames.monthView: "border-t-0"`, perché il bordo di fuori è nostro e
quello di dentro è di troppo. **Misurato**: `borderTopWidth` del contenitore
1px, della vista 0px, distanza fra i due bordi superiori 1px (era 2).

**E poi lo stesso nell'agenda**, che ha il suo `border-t`
(`event-calendar-agenda-view.tsx:200`) — corretto la prima volta sul solo
mese e trovato da Francesco nell'altra vista. La lezione, che vale per il
prossimo che aggiunge una vista: **ogni vista del motore apre con un
`border-t` proprio**, perché ReUI la disegna per stare sotto la sua `nav`
senza un contenitore attorno. Chi la monta dentro un contenitore con bordo li
somma. Ora sono spenti tutti e due (`monthView`, `agendaView`) e la misura è
la stessa su mese, agenda e vuoto: contenitore 1px, vista 0px, distanza 1.

**Le iniziali uscivano dal pallino.** `Avatar size-4` (16px) con `text-xs`
(12px, il gradino più piccolo che il tema tara): due lettere non ci stanno.
ReUI lo risolve con `text-[9px]`, che è un **valore arbitrario** e per giunta
non scala con la densità. La strada nostra è l'opposta — si allarga il
cerchio, non si rimpicciolisce il testo fuori scala: `size-5` (20px in
normale, **30 in touch**, perché `size-*` deriva da `--spacing`) più
`tracking-tight` e `leading-none`. **Misurato** in entrambe le densità:
`scrollWidth === clientWidth`, cioè nessun trabocco.

Vale come regola generale: **quando un testo non sta in un contenitore, in
questo design system si allarga il contenitore.** Scendere sotto `text-xs`
richiede un valore arbitrario, che la regola 3 vieta e che in densità touch
resterebbe fermo mentre tutto il resto cresce.
### (g) La story si riorganizza: introduzione più **una** scena, e il vuoto torna nostro

Indirizzo di Francesco dopo la seconda passata: «una pagina di introduzione
con tutte le funzionalità, e **una story unica** in cui integriamo tutte le
funzionalità delle diverse story. Lavoriamo su una vista unificata.»

**Il difetto della forma precedente** era che otto scene mostravano lo stesso
calendario con una funzione accesa per volta: chi guardava non vedeva mai il
pezzo come sarà davvero, e chi doveva provare il trascinamento sull'evento
colorato doveva tenere a mente due scene. Otto scene non sono otto casi: sono
un caso spezzato in otto.

**La forma nuova**, che segue il precedente di `data-table` e `data-grid`:
`tags: ['autodocs']`, e il JSDoc del meta diventa la **pagina di
introduzione** — cosa sa fare, i quattro default, le tre cose da sapere prima
di usarlo, le due che si vedono e non si possono cambiare. Poi **quattro**
story, e solo la prima è una funzione:

| story | perché esiste |
|---|---|
| **Completo** | la scena unica: calendari, corsie, «+N altri», dialogo, trascinamento, mese e agenda |
| **Dialogo dell'evento** | la stessa, con la `play` che apre il dialogo — serve al gate |
| **Densità touch** | uno **stato**, non una funzione; qui è dichiarato l'altro popup |
| **Vuoto** | uno **stato** |

Le due che restano oltre alla principale sono **stati**, non funzioni, e le
due `play` stanno lì perché una story ne dichiara una sola e i popup del
blocco sono due. Sulla scena completa non ce n'è nessuna, apposta: Storybook
esegue le `play` anche nel canvas, e un popup aperto all'arrivo coprirebbe
proprio ciò che si vuole provare.

**E il vuoto torna nostro.** Rilievo esplicito: «quando non vi sono eventi
possiamo usare le schermate per *vuoto* previste nelle primitive, **non
aggiungiamo nulla di ReUI per quest'ultimo aspetto**». Giusto, ed è la regola
permanente del `CLAUDE.md` applicata a un caso che sembrava innocuo: il vuoto
ha uno standard unico, `tassullo-empty-state` (M3.5), e un calendario che se
ne inventasse un altro sarebbe la deriva da cui tutto il resto comincia. Il
blocco passa quindi `renderNoEvents` e monta il nostro `EmptyState`; la prop
`statoVuoto` lo sostituisce, ed è la strada per metterci una CTA.

Conseguenza da conoscere: **`icon-stack.tsx` resta nel registry ma non rende
più niente**. È dipendenza del *codice* di `event-calendar-agenda-view`, non
una nostra scelta, quindi non si toglie — ma chi un giorno cercherà di capire
perché c'è, lo trova scritto qui.

Conto: **1352 → 1332 scansioni** (333 story), 0 violazioni — otto scene
diventate quattro, per quattro passate, fanno sedici scansioni in meno più le
quattro della scena che il riordino ha unito.


### (h) L'agenda non mostrava lo stesso periodo del mese

Rilievo di Francesco sulla scena unificata: «l'agenda non riflette gli
appuntamenti visti nella vista mese, devono essere sincronizzati».

**La causa sta nel motore, ed è una riga di `getViewDateRange`**: il mese
ancora a `startOfMonth(date)` e prende il mese intero; l'agenda ancora a
`startOfDay(date)` e prende `agendaDayCount` giorni. Con la data al 1° e
sette giorni d'agenda si vedevano due periodi diversi — 1–30 contro 1–7 — e
i fermi dopo il 7 sparivano commutando vista. Non è un difetto di ReUI: è il
comportamento di un'agenda a finestra scorrevole. È però il comportamento
sbagliato per **questo** blocco, dove mese e agenda sono due facce della
stessa cosa e a cambiare deve essere la faccia, non il periodo.

Chiuso in due pezzi, entrambi nel blocco:

1. `giorniAgenda` passa da `number` a **`number | "mese"`**, e `"mese"` è il
   nuovo default: la finestra vale `getDaysInMonth(ancora)`. Un numero resta
   possibile per chi vuole davvero una finestra scorrevole.
2. **L'ancora si porta all'inizio del mese** quando la vista è l'agenda,
   perché con la finestra giusta ma l'ancora al 19 si vedrebbe comunque un
   pezzo diverso. Il blocco segue `onDateChange` in uno stato proprio e
   chiama `api.goTo(startOfMonth(...))` in un effetto che **converge in un
   giro**.

**La dipendenza di quell'effetto è il millisecondo, non l'oggetto `Date`.**
Un `Date` è un riferimento nuovo a ogni render: l'effetto ripartirebbe, e la
`§17` di questo file racconta come finisce — React non interrompe il ciclo e
non stampa niente.

**Misurato** in Chromium, prima e dopo aver premuto «Oggi»: mese «settembre
2026» e agenda «1 – 30 settembre 2026», stessi eventi. L'agenda ne elenca
dieci contro i sette del mese, ed è giusto: i tre in più sono quelli dietro
il «+3 altri» del 15, che nella griglia non stanno nel DOM finché non si apre
il popover.

**E una nota tipografica dallo stesso giro**: il titolo diceva «1–7 settembre
2026» e il trattino sembrava appiccicato all'1. Non era un'impressione —
l'«1» di Inter ha la spalla destra stretta — e gli altri due rami di
`formatTitle` gli spazi ce li avevano già. Ora sono tutti e tre ` – `.

### (i) La vista settimana entra, e il gate aveva un falso positivo che nessuno vedeva

Richiesta di Francesco: le tre opzioni di vista (weekend, numero di settimana,
fumetto sull'evento) e **la settimana fra le viste**.

**La settimana era uno dei quattro file che M4ter.1 aveva lasciato fuori.**
Misurata la chiusura degli import prima di prenderla, come vuole §43:
`event-calendar-time-grid.tsx` è **1372 righe / 45,9 KB** e importa **solo**
`event-calendar`, `-dnd`, `-event`, `-lib`, `-types` — che abbiamo già — più
`cn`, `date-fns`, Base UI e `scroll-area`. **Chiusura pulita, un file solo.**

**Il prezzo di D22 va aggiornato dove è scritto:**

| | file | KB | righe |
|---|---:|---:|---:|
| M4ter.1, mese + agenda | 10 | 234 | 7 012 |
| **con la settimana** | **11** | **280** | **8 384** |
| restano fuori (`resource-view`, `nav`, `content`) | 3 | 49 | 1 548 |

Nello stesso file arrivano gratis `EventCalendarDayView` e
`EventCalendarDaysView`: il blocco spedisce nel commutatore la sola
settimana, ma chi compone da sé le ha in casa.

Procedura identica a M4ter.1: artefatto da `keenthemes/reui`, import
normalizzati, avviso MIT in testa, riga in `provenienze.json`, snapshot in
`.upstream/`. E **la trappola prevista si è presentata**: il file importa
`EventCalendarSlotDraft` e non lo usa, quindi sotto `noUnusedLocals` non
compila — terza riga di `MORTE_A_MONTE`.

#### Il falso positivo: la normalizzazione degli import non ha mai morso

Portando dentro `time-grid`, il gate lo ha dichiarato **«6 stringhe di classi
ri-stilate»** su un file identico all'originale a meno dei suoi **6 import**.
Cercando il perché è saltata fuori una cosa più grossa: la
`IMPORT_INTERNO_RE` scritta in M4ter.1 — quella che doveva ridurre un percorso
al suo ultimo segmento, proprio per non contare gli import — **è ancorata a
`^@\/`**, mentre `scansiona` restituisce le stringhe **comprese le
virgolette**. Non ha mai trovato niente.

La prova che lo inchioda: `event-calendar-i18n.tsx` ha **un** import interno e
dichiarava **una** stringa ri-stilata; `time-grid` ne ha sei e ne dichiarava
sei. Corretta l'ancora, i sei file ReUI che nessuno ha toccato passano da
«ri-stilati» a **«forma identica all'originale, nessun ri-stile»**, e il conto
totale scende da **25 a 19**.

**Perché conta più di un numero**: i ri-stilati sono il *costo dichiarato* di
ogni aggiornamento di shadcn e di ReUI — quante stringhe andranno riportate a
mano. Gonfiarlo con percorsi che la CLI riscrive da sé rende quella cifra
inutilizzabile, ed è il caso in cui `CLAUDE.md` dice «se il gate segnala un
falso positivo, si corregge il gate».

#### Le tre opzioni, e un date-picker che era già nel mandato

`weekend`, `numeroSettimana` e `fumetto` sono `viewSettings.weekends`,
`viewSettings.weekNumbers` e `eventTooltip`: configurazione del motore.
Il contenuto del fumetto è però **nostro**, e serve a qualcosa di preciso —
ci sta il **nome per esteso** del calendario, che nel cerchio dell'avatar non
ci sta.

**E il dialogo ha preso un campo «Data».** Rilievo di Francesco: dal «+» di
una cella il giorno è deciso, ma dal bottone «Nuovo» no, e senza campo si
sarebbe costretti a creare sempre «oggi» e poi trascinare. Il campo c'è
**anche in modifica**, e lì chiude un cerchio: è letteralmente il pattern che
il commento di testa del `Calendario.tsx` di Officina descrive — «la
riprogrammazione è un **date-picker nel pannello**, non un drag&drop». Il
trascinamento resta la scorciatoia senza conferma; il dialogo è la strada con.

Composto con `popover` + `calendar`, cioè la stessa composizione della story
`Primitive/Calendar → Date picker`: nessun componente nuovo.

#### Due difetti visti a video, e la regola che ne esce

**Il doppio bordo era in tre posti, non in due.** Dopo mese e agenda, la
settimana. **Ogni vista del motore apre con un `border-t` proprio**, perché
ReUI la disegna per stare sotto la sua `nav` senza un contenitore attorno.
Sono spente tutte e tre (`monthView`, `agendaView`, `timeGrid`), e chi
aggiunge una quarta vista deve aggiungere la sua riga.

**Le iniziali uscivano ancora dal cerchio, e stavolta la misura lo dice.**
`size-5` non bastava: due lettere a `text-xs` in un cerchio da 20px danno
`FS` 14,3px, `DE` 15,3 e **`MR` 18,3** — cioè **0,9px di margine per lato**,
che in un cerchio si legge come lettere fuori, perché il bordo curva proprio
lì. Le due strade scartate: `text-[10px]` è un valore arbitrario e non
scalerebbe con la densità; `size-6` porta il margine a 2,85 e riempie un chip
alto 26. **Si è passati a una iniziale sola**: la lettera più larga (`M`)
misura 10,8px, margine **4,6**. Il nome per esteso non si perde — sta nel
fumetto, ed è la ragione per cui le due richieste si sono chiuse insieme.

La regola generale, che vale oltre il caso: **quando un testo non sta in un
contenitore, o si allarga il contenitore o si accorcia il testo — non si
scende sotto `text-xs`**, perché sotto ci sono solo valori arbitrari e in
densità touch resterebbero fermi mentre tutto il resto cresce.

### (l) Una story sola, il menù delle opzioni, e le scene di misura nascoste

Indirizzo di Francesco, in tre messaggi: «togliamo le story dialogo
dell'evento, settimana, densità touch — sono tutte integrate in completo»,
«Docs ne spiega l'utilizzo di ogni funzionalità», e poi anche il vuoto.

**Il conflitto è reale e va detto**: una story sola vuol dire che axe misura
una scena sola. Il dialogo, la griglia oraria e lo stato vuoto non si
raggiungono da «Completo», e una vista che nessuna story monta è una vista
che il gate non ha mai visto — è la lezione della FASE 2, ripetuta tre volte.

**Chiuso senza rinunciare a nessuna delle due cose**, col tag `!dev` di
Storybook: `tags: ['!dev', '!autodocs']` toglie una story dalla barra
laterale **e** dalla pagina Docs, ma **non** dai test. Nella style guide si
vede una voce sola, `Completo`; il gate continua a eseguirne quattro.
Verificato dal conto: 333 story scansionate, non 330.

**La densità touch invece è stata tolta davvero**, ed è l'unica che non
serviva: `misura:bersagli` forza `globals=density:touch` su **tutte** le
story, quindi quella scena non aggiungeva nessuna misura. Il resto della
style guide la prova dalla leva **Densità** in barra, che è globale.

**Il popup dichiarato su «Completo» è il «+N altri», non il dialogo.**
Storybook esegue le `play` anche nel canvas, quindi quello che si dichiara
arriva **aperto**: un popover piccolo sopra una cella lascia vedere il
calendario, il dialogo lo coprirebbe tutto. Il dialogo è misurato nella sua
scena nascosta.

#### Il menù «Opzioni», e la regola dell'interruttore che non fa niente

Le tre leve erano prop, e Francesco cercava il **menù** — la richiesta era
nata guardando il pannello «Settings» di `c-event-calendar-1`. Fatto: un
popover con un interruttore per riga, geometria loro, tre leve invece della
loro dozzina. Le altre non ci sono per scelta: lingua e fuso li decide
l'app, e accendere il trascinamento da un menù metterebbe una
riprogrammazione senza conferma a un clic di distanza — cioè l'opposto di
quello che il commento di Officina chiede.

**E qui è emersa una cosa che il motore non dice**: `weekNumbers` è letto
**solo** dalla vista mese, e `weekends` non è letto dall'agenda — verificato
a grep sui tre file delle viste. Un interruttore acceso dove non fa niente è
il difetto peggiore di un pannello di impostazioni, perché chi lo tocca
conclude che il calendario è rotto. Ogni riga dichiara quindi in quali viste
vale, e fuori **si disabilita**. È la stessa regola per cui il commutatore
delle viste sparisce quando commutare non cambierebbe niente.

Prima stesura con una nota sotto l'etichetta («Solo nella vista mese»), e
Francesco l'ha fatta togliere: l'interruttore spento dice già tutto, e tre
righe di spiegazione fanno di un menù da tre voci un pannello da leggere.

E «fumetto» è diventato **«tooltip»**, su sua indicazione: è il nome della
primitiva che c'è già nel registry, e un design system che chiama due volte
la stessa cosa in due modi diversi è un design system che si ricorda a
memoria.

#### La settimana ricadeva sempre sulla prima del mese

Rilievo: «vista settimana mancano gli eventi, devono essere sincronizzati».
La causa è la stessa dell'agenda, un giro più in là: il mese è ancorato al
suo **primo giorno**, quindi passando alla settimana si finiva sempre sulla
prima — che nella metà dei casi comincia nel mese prima, e che quasi sempre
è vuota.

La regola adottata è quella dei calendari che usiamo tutti: **se oggi sta nel
mese che si sta guardando, la settimana è quella di oggi**; altrimenti si
resta dov'era. Misurato: dal mese di settembre si atterra su «14 – 20
settembre», che ha i fermi.

#### E il campo Data era grigio

Il trigger del date-picker è un `Button variant="outline"`, che porta
`bg-background` — il grigio della **pagina**. Dentro un dialogo, che è
`bg-popover`, diventava l'unico campo grigio in mezzo a tre trasparenti
(misurato: `oklch(0.9726…)` contro `rgba(0,0,0,0)` di input e select).
Allineato agli altri campi: stesso fondo, stesso bordo, stesso raggio, e
niente hover — perché nemmeno i `select` accanto ce l'hanno.

Vale oltre il caso: **la story `Primitive/Calendar → Date picker` compone il
trigger così, e su una pagina è giusto**. Dentro una superficie più chiara
non lo è più, e chi copia quella composizione in un dialogo deve saperlo.

### (m) La distinzione che mancava: il calendario è il **tipo**, la persona è l'**assegnatario**

Rilievo di Francesco guardando Officina, e ribalta una cosa che questo stesso
verbale aveva scritto al punto (e). Nella barra dei filtri di Officina ci sono
**«Tutti i reparti»** e **«Tutti gli assegnatari»**, e accanto una legenda a
colori: **Guasto · Preventiva · Ispezione · Miglioria**.

Quindi:

| | cos'è | come si vede |
|---|---|---|
| **calendario** | il tipo di intervento | il **colore**, spiegato dalla legenda |
| **assegnatario** | la persona | l'**avatar** |

**Sono due canali, e tenerli separati non è pignoleria**: due persone possono
lavorare allo stesso guasto, e lo stesso manutentore fa guasti e preventive.
Il punto (e) di questo verbale aveva chiuso «il calendario è la persona»
perché così sembrava dal primo rilievo; era una lettura parziale, e questa la
corregge.

**Regola del chip**: gli avatar quando ci sono assegnatari, **altrimenti** il
pallino col colore del calendario. Il colore c'è sempre, la persona no.

**Più di un assegnatario**, e la primitiva c'era già: `AvatarGroup`
(`Primitive/Avatar → Gruppo`), con `AvatarGroupCount` dal terzo in poi —
oltre i due, tre cerchi in un chip alto 26px non si distinguono, quindi il
terzo posto dice **quanti** invece di **chi**.

Nel dialogo il campo è un **`combobox` a più scelte con le pillole**, cioè la
composizione di `Primitive/Combobox → Più scelte, con pillole`. Scartato il
`toggle-group`: una squadra di manutenzione può essere di quindici persone, e
un toggle-group «è un filtro che si clicca, non un campo che si cerca»
(CLAUDE.md, «il nome dice la funzione»). Il gate non ha trovato i
`button-name` di **D14** in questa scena, quindi **non** è servita nessuna
esclusione per nodo: se un giorno comparissero, la strada è quella di D14.

**La legenda** è geometria di `c-event-calendar-4` — pallino e nome per
calendario — e sta **in testata**, che è dove la mette Officina. Senza, il
colore di un chip è un'informazione che non si può decodificare.

**Un limite della tavolozza, a verbale**: Officina usa il **rosso** per il
guasto, e nei cinque `--chart-*` il rosso non c'è (arancio, verde, blu, due
grigi). Il guasto prende l'arancio, che è il più caldo. Se il rosso servisse
davvero, si aggiunge alla palette in `scripts/hex-to-oklch.ts` — che è la
fonte unica — e non si scrive nel blocco.

### (n) L'avatar nel chip: quattro misure per arrivarci

Quattro rilievi di Francesco sullo stesso elemento, e vale la pena averli
tutti scritti perché ognuno smonta un'assunzione.

**1. Gli artefatti erano la trasparenza.** Il fallback aveva
`bg-(--ec-event-color)/20`, cioè un fondo semi-trasparente: sovrapposti da
`AvatarGroup` si vedevano l'uno attraverso l'altro, e l'anello della
primitiva — un `after` con `mix-blend-darken` — ci si sommava sopra. La
primitiva si usa **così com'è**: il fondo torna `bg-muted`, opaco, e il
colore resta dov'è il suo posto, cioè il chip, che dice il calendario.

**2. La taglia: il chip non scala, l'avatar sì.** `--ec-month-bar-h` è in
`rem` e non deriva da `--spacing`, quindi il chip del mese resta **26px** in
tutte e due le densità; l'avatar `size="sm"` invece fa 24px in normale e
**36 in touch** — sforava. `size-4` fa 16 e 24: ci sta in entrambe.

**3. Una taglia `xs` nella primitiva è stata provata, e il gate l'ha
rifiutata.** Aggiungere un valore all'union di `size` è una divergenza di
**forma**, non una stringa di classi: `check:registry` esce 1 con «diverge
dall'originale FUORI dalle stringhe di classi». È lo stesso muro dello
`stepper` in M4ter.1 — per passare servirebbe un meccanismo di «divergenza
dichiarata» che il gate non ha, e con **un** punto d'uso la classe dal punto
di chiamata costa meno della macchina. **Se i punti d'uso diventassero tre,
la decisione si riapre** e allora si costruisce il meccanismo.

**E la classe si posa sulla taglia base, non su `sm`**, che è il dettaglio
che ha fatto sbagliare la prima volta: `data-[size=sm]:size-6` è una variante
con attributo e ha specificità più alta di `size-4`, quindi vinceva lei — la
misura diceva ancora 36px in touch. Sulla base è `tailwind-merge` a
sostituire `size-8`, e funziona.

**4. La sovrapposizione va scalata con la taglia.** Tolta e rimessa:
`AvatarGroup` stringe di `-space-x-2`, cioè 8px, che è **un quarto** di
`size-8` — la taglia per cui è disegnato. Su 16px quegli stessi 8px sono
mezzo cerchio, e la prima iniziale spariva sotto la seconda. `-space-x-1` è
lo stesso quarto alla metà della taglia. L'anello resta quello della
primitiva: è ciò che rende leggibile la sovrapposizione, e toglierlo —
provato — lasciava due cerchi grigi attaccati.

La regola che ne esce, e che vale per ogni primitiva rimpicciolita:
**quando si cambia la taglia di un componente, le sue distanze vanno
riscalate nella stessa proporzione** — non ereditate.

### (o) Le due iniziali, e il tetto che le limita: l'altezza dello schermo

Rilievo: «nell'avatar come nella primitiva vanno messe le iniziali per
Francesco Sartori, quindi **FS** e non solo F». Giusto — la primitiva le
scrive così — ma due lettere in un cerchio piccolo è un problema di
geometria, e la catena di vincoli merita di essere scritta perché è quella
che governerà ogni prossima modifica al chip.

**Il nodo: il chip del mese non scalava.** `--ec-month-bar-h` ha come default
**1.75rem**, in `rem`: il chip resta 26px anche in densità touch, mentre
avatar e testo crescono con `--spacing`. Da lì venivano due difetti diversi
che sembravano scollegati — l'avatar `sm` che a 36px sforava un chip da 26, e
le due iniziali che non ci stavano in un cerchio abbastanza piccolo da
starci.

**Chiuso legando la variabile al token**: `--ec-month-bar-h:
calc(var(--spacing) * 8)`, messo come `style` sul root del calendario. Non è
un valore arbitrario e non è un ri-stile: è una variabile che il motore
espone apposta, e il valore è un calcolo su `--spacing`. Il chip fa **32px in
normale e 48 in touch**, e cresce insieme a tutto il resto.

**E poi il tetto**, che è il pezzo che vale oltre il caso. A `--spacing × 9`
il chip faceva 36 e l'avatar `size-6` stava comodissimo — ma la riga del mese
saliva a 140px, **sei righe non ci stavano più** e il mese scorreva lasciando
fuori l'ultima settimana. Francesco l'ha visto subito.

La catena, tutta misurata:

| | vincolo |
|---|---|
| lo schermo del capannone | ~900px, meno il guscio ≈ **800** per il calendario |
| sei righe + testata + legenda | ⇒ **≤ 128px per riga** |
| tre corsie per cella (il requisito) | ⇒ chip ≤ **32px** (96 + 6 + 26 = 128) |
| chip 32 con `py-1` | ⇒ avatar ≤ **20px** (`size-5`), 5px di margine |
| due iniziali a `text-xs` in 20px | **14,6px**, margine 2,7 per lato — dentro |

Cioè: **è l'altezza dello schermo a decidere quanto è grande l'avatar**, per
una catena di quattro passaggi. Chi un domani vorrà l'avatar più grande deve
sapere che sta chiedendo o meno di tre eventi per cella, o un mese che
scorre.

**Un'ultima misura, per non tornarci**: le barre pluri-giorno **non
sbordano** fra un giorno e l'altro, e l'impressione che lo facciano viene dal
weekend nascosto — una barra che finisce di sabato si interrompe all'ultima
colonna visibile. Misurato: la barra del 7–10 va da 21 a 1138 dentro celle
che vanno da 17 a 1142, cioè 4px di inset per lato, esattamente come le
altre.

**E il bug vero di questo giro**: `apriModifica` leggeva `calendarioId`
dall'evento, ma l'evento che arriva dal motore è il **suo**, dove quel campo
si chiama `resourceId`. Risultato: `undefined`, e il dialogo ricadeva sul
**primo** calendario dell'elenco — un evento «Preventiva» si apriva come
«Guasto». È il rovescio del mapping: si traduce in entrambe le direzioni o si
sbaglia in una.

### (p) Il chip nel popover era più basso, e la causa è il portale

Rilievo: «gli eventi dentro al menù +3 altri sono più bassi di quelli nella
vista mensile, così l'avatar sborda; devono sempre essere alti uguale».

**Due cause che si sommano**, e va detto perché la prima da sola non basta a
spiegarlo:

1. il chip del popover ha `py-0.5` mentre quello del mese ha `py-1` — quattro
   pixel di differenza;
2. il popover sta in un **portale**, quindi la variabile
   `--ec-month-bar-h` che il blocco dichiara sul proprio root **non ci
   arriva**: `getComputedStyle` la legge **vuota**, e il chip non ha nemmeno
   l'altezza del mese da cui partire.

Misurato: **28px nel mese, 24 nel popover**, con un avatar da 20 che col
padding usciva.

**Il primo rimedio era sbagliato**, e vale la pena averlo scritto:
`min-h-5` sul nostro contenuto. Non ha funzionato, e non poteva — il chip del
mese ha un'altezza **fissa**, quindi ad allargare il contenuto sarebbe stato
il contenuto a uscire dal chip, non il chip a crescere. La misura giusta è
**il padding**, che è la differenza vera.

**E serve l'important.** `classNames.event: "py-1"` non bastava: nella `cn()`
del motore il `className` del **punto di chiamata** viene dopo `classNames`,
e nel popover è proprio lì che sta `py-0.5`. Con `py-1!` i due chip misurano
**28 e 28**.

**Nota sulla variabile nei portali**, che vale oltre questo caso: una
variabile CSS dichiarata sul root di un blocco non raggiunge i pannelli che
Base UI monta in un portale. Se un valore deve valere anche lì, o si passa da
una classe, o si accetta il default del componente.

#### E un pixel in fondo alla settimana

«Doppio bordo sull'ultima ora del giorno.» Le righe orarie della griglia sono
un `repeating-linear-gradient`, e l'ultima linea che disegna cade
**esattamente sul fondo della colonna**: lì il `border-t` della legenda ci si
somma. Il bordo della legenda ora c'è nel mese e nell'agenda — dove quella
linea non esiste e senza bordo la legenda sembrerebbe attaccata — e **non**
nella settimana.

### (q) Le due liste dei popup erano disallineate, e sotto c'era un difetto vero

`scripts/gate-a11y.ts` legge le dichiarazioni dei popup da `ui/` **e**
`blocks/`; `scripts/misura-bersagli.ts` leggeva il solo `ui/`. Allineate.

**Il difetto non era estetico.** Con i blocchi fuori dall'elenco, lo script
non *aspettava* i loro popup — App shell, Calendario, Data Table, Dialogo
adattivo, Dialogo di conferma, Intestazione di pagina, Editor di testo — ma
Storybook le `play` le esegue comunque: quei popup venivano misurati **o no a
seconda di quanto ci metteva la pagina**. Non un conto sbagliato: **un conto
diverso a ogni esecuzione**, che è peggio, perché non si nota.

Misurato: i popup aperti passano da **47 a 59**.

#### E il rapporto, appena allineato, ha trovato una cosa

`Blocchi/Editor di testo`: **0 story su 4 aperte**, mentre in un test isolato
il popover si apriva regolarmente. Tre ipotesi, misurate in quest'ordine:

1. *il timeout d'attesa del popup è corto* — alzato da 2s a 5, poi a 9:
   **nessun cambiamento**;
2. *il grilletto è disabilitato* — no, `disabled` è false e `aria-expanded`
   c'è;
3. **la `play` cerca il grilletto prima che esista.** Confermato leggendo la
   console della build statica: `Nessun grilletto [aria-label="Collegamento"]
   in questa story`. L'editor monta Tiptap **prima** di disegnare la propria
   barra, e la `play` parte nel mezzo.

Chiuso in `.storybook/prove/apri.ts`: `grilletto()` ora **aspetta** che
l'elemento sia nel DOM (`waitFor`) invece di pretenderlo subito. L'attesa non
indebolisce il controllo — se il grilletto non arriva affatto, `waitFor`
scade e l'errore resta, che è il caso in cui la dichiarazione nel meta non
corrisponde alla story. Dopo: **1/4**, e i popup aperti salgono a 59.

**Il timeout è tornato a 2s**, ed è la parte che vale più del difetto:
alzare un'attesa è il rimedio che si prova per primo e che quasi sempre
**nasconde** la causa invece di toglierla. Qui non funzionava nemmeno a nove
secondi, ed è stato quello a far cercare altrove.

**Perché il sintomo era invisibile sul dev server**: lì i tempi bastano e la
`play` trova il grilletto. Si vedeva **solo** sullo Storybook costruito, che
è quello che `misura:bersagli` usa — ed è la ragione per cui lo usa.

---

## 45. `entity-image`, il primo componente nostro: le misure che l'hanno deciso (D20, M4ter.3, 2026-09-19)

`registry/componenti-propri.json` **non è più vuoto**. Era, nelle parole del
`CLAUDE.md`, «la condizione da difendere»: vale la pena scrivere perché la si
è lasciata cadere qui e non altrove, e cosa il gate ha detto lungo la strada.

### (a) La scala 4bis, percorsa fino in fondo — e il gradino 3 non è un'opinione

D20 era già approvata (`docs/ANALISI-COPERTURA-APP.md` §4): questo task la
scrive, non la ridiscute. Ma la riga nel registro pretende che le strade
scartate ci siano scritte, quindi eccole con la misura che le chiude.

| gradino | strada | perché non basta |
|---|---|---|
| 1 | un componente immagine di `@shadcn` | non esiste |
| 1 | `aspect-ratio` | dà il rapporto, non il ritaglio né il segnaposto |
| 2 | `avatar` sovrascritto dal punto di chiamata | **cinque** classi da annullare *in ogni pagina* — `size-8` e `rounded-full` sulla radice, `after:rounded-full` del bordo, `aspect-square rounded-full` su `AvatarImage`, `rounded-full` su `AvatarFallback` |
| 2 | `ItemMedia variant="image"` | 40/32/24px **quadrati**: è la miniatura in riga, non la foto di una scheda |
| 3 | una variante dentro `avatar.tsx` | **il gate esce 1**, misurato in M4ter.2 su una taglia `xs`: «diverge dall'originale FUORI dalle stringhe di classi» |
| 3 | adattare il v1 | il v1 non ha niente su questo: non c'è una scelta precedente da rispettare |
| 4 | un file nuovo | la divergenza sta dove **un originale shadcn non c'è**: non resta niente da riallineare per sempre |

**Il meccanismo, però, non è nuovo, e questa è la parte che tiene il
componente dentro la disciplina.** `AvatarImage`/`AvatarFallback` di Base UI
*è già* «mostra l'immagine, altrimenti mostra l'altro», compreso il caso che in
produzione conta davvero — la `src` che c'è e non arriva. Il file nuovo lo mette
dentro un riquadro non tondo insieme ad `AspectRatio` e annulla quelle cinque
classi **una volta sola**. Un componente nostro che riusa un meccanismo altrui
costa un file; uno che se lo riscrive costa per sempre.

Il raggio sta **sulla radice** e dentro è tutto `rounded-none`, con un `ring-1
ring-foreground/10` al posto dell'`after:border` della primitiva. Non è gusto:
un bordo quadrato dentro un contenitore che ritaglia tondo si vede **tagliato
agli angoli**, e con una leva sola (`className`) un `rounded-b-none` per
incastrare la foto in testa a una `card` funziona senza scoprire niente.

### (b) L'autotest del gate, nelle due direzioni

Un gate che non sa fallire non è un gate, e qui si dimostra due volte:

| prova | esito |
|---|---|
| riga tolta da `componenti-propri.json` | **esce 1**: «non ha un originale in `registry/.upstream` e non è dichiarato in `registry/componenti-propri.json`» |
| riga presente ma senza `approvatoDa` | **esce 1**: «dichiarato … ma senza approvatoDa» |
| riga completa | `✔ 0 errori / 62 avvisi / **1 componente nostro** / 19 ri-stilati` |

### (c) **`alt` obbligatorio: l'assunzione era sbagliata, e il rimedio è un altro**

Il mandato diceva «l'immagine senza `alt` deve far fallire il gate, quindi
l'`alt` è obbligatorio nell'API — e questa è una cosa da provare, non da
assumere». Provata, e **non è vero**.

Tolto `alt` dal render e rifatta la passata: **339 story, 0 violazioni**. Il
DOM dice perché — `<img alt="" data-slot="avatar-image" …>`. **Base UI scrive
`alt=""` su ogni `<img>` che renda**, se non gliene arriva uno
(`@base-ui/react/internals/useRenderElement.js:183`, `renderTag`). Quindi una
foto senza alternativa testuale non è un errore che axe possa vedere: diventa
in silenzio una foto **decorativa**, che è una cosa diversa e sbagliata, e la
regola `image-alt` non ha più soggetto.

È la stessa famiglia dei difetti **muti** di §30 (`text-md` che non emette
niente): non rompe, non avverte, cambia il significato.

**Il solo controllo che lo vede è il tipo** — e fino a oggi in CI non girava
nessun `tsc`: `npm run check` sono i cinque gate, e `build-storybook` passa da
esbuild, che i tipi non li guarda. Aggiunto quindi un passo
`- run: npm run build` a `.github/workflows/gate.yml`. Non cambia il
vocabolario dei «cinque gate», ed è ciò che rende vero il criterio di
accettazione invece di dichiararlo.

Verificato nell'altra direzione: `<EntityImage src="…" />` senza `alt` dà
`TS2741: Property 'alt' is missing`.

### (d) La larghezza della cella: **256px**, misurata su cinque candidate

È il numero che sostituisce le **16 soglie `minmax` distinte** (104→320px)
delle 33 griglie `repeat(auto-fill/fit)` di Studio e Officina. **La
ricognizione di quante volte ciascuna ricorre non si è potuta fare**: i due
repo non sono su questa macchina (cercati sotto tutto `~/Documents`,
`~/Desktop`, `~/Developer`, `~/Projects`, `~/code`, `~/src`), e il mandato dice
di non simularla. Il numero è quindi deciso dalla sola misura, che è comunque
la prova che il piano chiedeva.

Prese in Chromium vero sulla scena `Primitive/EntityImage → In griglia di
card`, su larghezze d'area contenuto **misurate sul guscio** e non stimate
(`Blocchi/App shell`, colonna 256px: `main` 375 / 1024 / 1184px, meno il
respiro di pagina → **343 / 960 / 1120** utili):

| soglia | telefono 375 | portatile 1280 | scrivania 1440 |
|---|---|---|---|
| 208px | 1 col · 343×257 | 4 col · **228×171** | 5 col · **211×158** |
| 240px | 1 col · 343×257 | 3 col · 309×232 | 4 col · 268×201 |
| **256px** | **1 col · 343×257** | **3 col · 309×232** | **4 col · 268×201** |
| 288px | 1 col · 343×257 | 3 col · 309×232 | 3 col · 363×272 |
| 320px | 1 col · 343×257 | **2 col** · 472×354 | 3 col · 363×272 |

**208 cade**: 211px di foto è il fondo delle soglie di oggi, ed è la misura che
fa leggere un catalogo di macchine come una pagina di francobolli. **320 cade**
all'altro estremo, e sul portatile — lo schermo più diffuso, e quello del
capannone — scende a **due** colonne: spende in grandezza lo spazio che
servirebbe a vedere più macchine insieme. Fra **256 e 288 la differenza non
esiste dove conta**: a 1280 danno la stessa identica griglia, 3 colonne da
309px. Si separano solo sulla scrivania a 1440, dove 256 dà una macchina in
più per riga. Vince **256**, che è poi `--container-3xs` e **la stessa misura
della colonna del guscio**.

**E deve restare un token della scala contenitori, non di `--spacing`.**
Misurato: `--container-3xs` vale 16rem in entrambe le densità, mentre una
soglia scritta in `--spacing` farebbe 384px in touch — più larga dei 343 di un
telefono — e la griglia **sborderebbe** invece di ripiegare a una colonna.

**È una larghezza, quindi non si muove col rapporto.** Rimisurata identica dopo
il passaggio della scena a `1:1` (v. (g)): stesse colonne, stessi px di
larghezza, a cambiare è solo l'altezza della cella.

### (e) Un secondo difetto muto: Tailwind v4 emette solo i token che un'utility usa

Prima candidata provata, `--container-2xs` (18rem). Risultato: griglia a **una
colonna a tutta larghezza**, foto 1200×900 a 1440. La causa non è la soglia:
`--container-2xs` **non è nel foglio di stile**, perché in Tailwind v4 un token
del tema finisce in CSS solo se un'utility lo usa, e nessuna qui usa
`w-2xs`/`max-w-2xs`. `minmax(var(--container-2xs), 1fr)` con la variabile vuota
non è un errore: la dichiarazione cade e `repeat(auto-fill, …)` ricade su una
traccia sola.

Conseguenza operativa, che vale per ogni `var(--token)` scritto **fuori** da
un'utility (uno `style`, un `calc`): il token o è usato da un'utility da
qualche parte nel codice compilato, o non esiste. Nella story le altre scene
usano `w-3xs`, ed è quello a far emettere il token che la griglia legge.

### (f) `ItemGroup` ha ripreso la sua trappola, e il gate l'ha presa subito

La scena della miniatura in riga è uscita alla prima passata con **una
violazione su 339**: `aria-required-children` sul `role="list"` di `ItemGroup`.
È la trappola già scritta in testa a `Primitive/Item` in M4.7 — una lista ARIA
ammette **solo** `listitem`, e `Item` rende un `div` senza ruolo, quindi dentro
un `ItemGroup` il ruolo si passa (`<Item role="listitem">`). Vale la pena
averlo a verbale due volte: era documentata, è stata riletta, ed è ricapitata
lo stesso. Il gate l'ha chiusa in una passata da un minuto.

### Numeri

`npm run check` **verde sui cinque**. `check:contrast` 48/48.
`check:registry` **0 errori / 62 avvisi / 1 componente nostro / 19 ri-stilati**.
`test:a11y` **1332 → 1356 scansioni** (339 story × 4 passate), **0 violazioni**
su tutte e quattro — esattamente la previsione del piano, 6 scene × 4.
`registry.json` **89 → 90 item**, `registry validate` verde, `build` e `lint`
verdi (nessun warning oxlint dal componente). `misura:bersagli`, controllo
dello strumento ✔: **3013 bersagli su 339 story** (59 popup aperti), 2049 sotto
i 44px, **35 tipi distinti, 0 piccoli in entrambe le direzioni** — il conto dei
bersagli **non si muove** perché in nessuna scena l'immagine è cliccabile, e un
riquadro che non fa niente non è un bersaglio.

### (g) `1:1` entra, e la regola con cui è entrato

Rilievo di Francesco a lavoro finito, guardando le immagini vere: «sono
quadrate! Forse allora dobbiamo anche aggiungere il rapporto 1:1». Verificato
prima di scrivere, e la risposta alla domanda successiva — «e nella sezione
prodotti sempre quadrate?» — è **sì**:

| libreria | sorgente | misurato su |
|---|---|---|
| render di stratigrafia dei **sistemi** | **1080×1080** | 6 categorie, `tassullo.it/sistemi` |
| foto pacco dei **prodotti** | **1800×1800** | 22 immagini di `/linea-wall`, una sola a 1779×1800 |

Cioè **tutta** la libreria d'immagini di Tassullo è quadrata. Su una sorgente
quadrata `object-cover` toglie il **25%** dell'altezza a `4:3` e il **43,75%** a
`16:9`; e su un soggetto **verticale** dentro un quadrato — il sacco da 25 kg di
INTOCALX — non è fondo bianco che se ne va: a `4:3` si perde la base del pacco,
a `16:9` anche il nome. La scena `Primitive/EntityImage → Rapporti` mette i tre
in fila sulla stessa sorgente.

**Perché non è un'eccezione alla regola dell'insieme chiuso.** D20 chiudeva su
`4:3` + `16:9` con questo argomento: un rapporto è il *valore di una prop*, non
un componente, e l'insieme chiuso è ciò che impedisce alle 16 soglie di
ripetersi. L'argomento regge identico a tre, e si irrigidisce: **ogni valore
vuole un consumatore e una misura**. `16:9` era entrato senza consumatore
proprio, per simmetria; `1:1` entra con due librerie intere e con la misura del
ritaglio. Un insieme che cresce a ogni richiesta non è un insieme chiuso — ma
uno che rifiuta il caso dominante dei propri dati non è un design system, è un
dogma.

**Conseguenza sulla griglia di catalogo**: la scena passa a `ratio="1:1"`,
perché quello è il rapporto delle sorgenti vere. La larghezza di cella non si
muove (v. (d)).

### (h) Il canvas centrato misura sé stesso, non la pagina

La scena della griglia rendeva **2 colonne invece di 4** a 1440, cioè proprio il
numero che esiste per far vedere. Causa: `.storybook/preview.tsx` imposta
`layout: 'centered'` per tutte le story, e un canvas centrato **stringe il
contenuto al suo contenuto**. Una griglia `repeat(auto-fill, …)` dentro un
contenitore che si stringe misura sé stessa, non lo spazio disponibile, e
sceglie il numero di colonne sbagliato — senza errori, perché non c'è niente di
rotto.

Chiuso con `parameters: { layout: 'padded' }` sulla sola scena, come fanno già
`data-table`, `data-grid` e il calendario. **La regola**: qualunque story che
mostri un comportamento *responsivo* va tolta dal `centered`, o misura la
propria scatola. E le misure di (d) restano valide perché l'imbracatura
**imponeva** la larghezza del contenitore invece di ereditarla — che è anche la
ragione per cui il difetto non era emerso lì.

### (i) Le immagini d'esempio: reali, locali, e non spedite

Le prime tre erano **disegni SVG** fatti in sessione. Sostituite con immagini
vere di Tassullo su indicazione di Francesco — sei render di sistema, tre foto
pacco, una fotografia di cantiere, 660 KB in tutto dopo il ridimensionamento
(640px le quadrate, 900px la fotografia).

Tre confini, scritti in `public/esempi/LEGGIMI.md` perché il repo è pubblico e
qualcuno le troverà senza contesto: **nessun item del registry le spedisce**
(`registry.json` elenca i file uno per uno, e le story non si spediscono
affatto); **sono locali di proposito**, perché con indirizzi remoti in una CI
senza rete l'immagine non arriva, `AvatarFallback` ripiega, e le scene «con
foto» misurerebbero il **segnaposto** — lo stesso difetto di «un popup non
aperto non è un popup senza violazioni»; e Storybook `public/` non la serve da
sé, la riga è negli `staticDirs` di `.storybook/main.ts`.

**Quello che le immagini vere hanno cambiato davvero** non è l'estetica della
story: è che hanno fatto vedere il rapporto sbagliato. Con tre disegni inventati
a 4:3 la domanda del rapporto non si sarebbe mai posta.

### (j) Le immagini rifatte scontornate, e il fondo che il componente non deve dipingere

Il rilievo era mio, a fine sessione: le sorgenti erano su bianco, e una foto su
bianco dentro una card scura è un blocco chiaro. La risposta di Francesco è
stata rifarle — **PNG scontornati, senza fondo**, stessi nove soggetti (sei
render di sistema, tre foto pacco), 640×640.

**Verificata la qualità dello scontorno prima di committarlo**, perché un
ritaglio fatto male su bianco si vede solo su scuro — cioè esattamente nella
modalità che si stava cercando di aggiustare:

| | misura |
|---|---|
| alpha sul soggetto | **252–253**, non 255: il tool lascia ~1% di velo, invisibile in composizione |
| pixel di frangia bianca sul bordo | **0 su tutti e nove** (bordo = alpha fra 8 e 250, frangia = semitrasparente quasi bianco) |
| ombra portata e riflesso sul piano | **tolti** insieme al fondo |
| cornice dell'immagine | interamente trasparente su tutti e nove |
| peso | 52–83 KB l'uno, **1,0 MB** la cartella |

Niente WebP, quindi: i PNG con alpha pesano quanto i JPEG che sostituiscono,
perché il soggetto occupa il 33–48% della tela e il resto è trasparenza, che si
comprime a niente.

**La conseguenza sul componente**, che è la parte che resta. La radice aveva
`bg-muted`: con sorgenti su bianco quel grigio non si vedeva **mai**, coperto
dall'immagine. Con le immagini scontornate si vedrebbe *dietro* l'oggetto, e
sarebbe un grigio diverso da quello della superficie su cui la card sta — cioè
un riquadro dentro la card invece di una foto nella card. Tolto: **la radice non
ha più un fondo**, e `bg-muted` resta dov'è informazione, sul solo segnaposto.

La regola generale che ne esce, e che vale oltre `entity-image`: **un componente
non dipinge un fondo che non gli è stato chiesto.** Un fondo messo «tanto non si
vede» è un fondo che si vedrà il giorno in cui cambia il contenuto, e allora
nessuno si ricorderà perché c'è.

`cantiere.jpg` resta com'era, con il suo sfondo: una fotografia non si
scontorna, ed è giusto che nella style guide ci sia anche il caso di
un'immagine che il fondo ce l'ha.

## 46. Il global `viewport` non cambia la larghezza della finestra nel canvas (M4ter.5, coda, 2026-09-20)

**Il fatto, misurato in Chromium sullo Storybook costruito.** L'interruttore
**Viewport** di Storybook — e il `globals: { viewport: … }` che una story può
dichiarare — ridimensiona l'iframe **nella cornice del manager**, cioè quando
si guarda Storybook con gli occhi. Nel canvas aperto per URL, che è come lo
aprono `test:a11y` e `misura:bersagli`, **non fa niente, e non dà errore**:

| come si apre la story | `window.innerWidth` | `matchMedia('(min-width: 1024px)')` |
|---|---|---|
| `iframe.html?id=…` | 1440 | `true` |
| `iframe.html?id=…&globals=viewport:telefono` | **1440** | **`true`** |
| una story che dichiara `globals: { viewport: { value: 'telefono' } }` | **1440** | **`true`** |

I tre valori sono quelli della finestra del browser di prova: la larghezza del
canvas **è** la larghezza della finestra, e il global non la tocca.

**Perché è un difetto muto e non una scomodità.** Una story che dipende da una
media query sulla finestra rende, nel gate, **il ramo sbagliato** — e il conto
delle scansioni torna lo stesso. «1416 scansioni, 0 violazioni» su tre scene di
cui una doveva essere stretta non dice che la faccia stretta è pulita: dice che
non è mai stata renderizzata. È la stessa forma del rilievo di M2.6 («un popup
non aperto non è un popup senza violazioni», §22), trasposta dalla apertura di
un overlay alla larghezza della finestra.

**C'è già un caso in casa, ed è la prova che morde.** `Blocchi/App Shell →
Telefono` dichiara quel global, e il suo commento afferma «a 375px la colonna
non c'è più». Misurato sulla stessa story:

| finestra vera | `innerWidth` | colonna sidebar nel DOM |
|---|---|---|
| 1440 | 1440 | **c'è** — ramo scrivania |
| 375 | 375 | non c'è — ramo mobile |

Cioè: quella story mostra il ramo mobile **solo se la finestra del browser è
davvero stretta**. Nel gate rende il ramo scrivania, e il commento descrive una
cosa che lì non succede. Non è stato corretto in M4ter.5 — è fuori mandato — ma
va saputo prima di prenderlo a modello.

**La regola che ne esce.** *La larghezza della finestra non si commuta dal
canvas.* Una story il cui comportamento dipende da `matchMedia` sulla finestra:

1. **si misura in una finestra vera** — Chromium con `viewport: {width: …}` —
   e non col global, che è un comando per gli occhi, non per il DOM;
2. se il ramo stretto deve stare **nel gate**, la story lo rende in modo
   **deterministico**, senza passare dalla media query, oppure si accetta a
   verbale che il gate guardi solo il ramo largo. Le due cose sono diverse e
   vanno distinte per iscritto: «misurato e pulito» non è «mai guardato».

**Da non confondere con le container query**, che sono l'altra metà di questo
sbaglio e si sono presentate nella stessa sessione (§sulla larghezza di
`pagina-login`, M4ter.5): `@md/field-group` guarda il **contenitore**, quindi
un riquadro stretto la sposta davvero e si misura benissimo a qualunque
viewport — è la strada che usa `data-table.stories.tsx` per la scena a 320px,
col suo commento che dice apertamente che «l'imbracatura del gate non ha un
modo affidabile di cambiare viewport». Una media query sulla **finestra** non
si sposta stringendo un contenitore. Sono due meccanismi con la stessa faccia:
prima di misurare, guarda quale dei due è in gioco.

**Ricaduta su M4ter.6**, che è il task che ne dipende: `useSoglia` è una media
query sulla finestra, quindi la scena «faccia stretta» della lista a due facce
non può contare sul global. La scelta fra le due strade del punto 2 va presa
all'inizio e scritta, non improvvisata a metà.

## 47. Il separatore delle migliaia si scrive **sempre** (M4ter.8, coda, 2026-09-20)

**Decisa da Francesco**, guardando il piede della story `Blocchi/Data Table →
Con Piede`: il totale rendeva `2086,93 €`. La convenzione Tassullo è
`2.086,93 €` — **il punto delle migliaia c'è sempre**, qualunque sia la
grandezza del numero.

**Perché non c'era, e non era un difetto nostro.** In italiano il CLDR
dichiara `minimumGroupingDigits: 2`, cioè «raggruppa solo da cinque cifre in
su»: `Intl.NumberFormat('it-IT')` lascia quindi `2086,93` e scrive
`12.345,00`. Misurato nel Chromium del gate:

| chiamata | risultato |
|---|---|
| `(2086.93).toLocaleString('it-IT')` | `2086,93` |
| `(2086.93).toLocaleString('it-IT', { useGrouping: 'always' })` | **`2.086,93`** |
| `(12345.67).toLocaleString('it-IT')` | `12.345,67` |

**È il caso peggiore possibile in colonna**, ed è la ragione della
convenzione: il separatore non è *assente*, è **intermittente** — compare o
sparisce a seconda del valore, e proprio nella fascia fra mille e diecimila,
che in un computo o in un listino è la maggior parte delle righe. Due numeri
incolonnati con e senza punto si leggono di ordini di grandezza diversi. Il
`tabular-nums` del tema allinea le cifre ma non può inventare un separatore
che non c'è.

**La leva è `useGrouping: 'always'`**, opzione ES2023 (Chrome 106+, Node 18+),
da mettere su **ogni** `Intl.NumberFormat` e `toLocaleString` italiano.

### La convenzione sta in un item, non in una regola da ricordare

Applicata dapprima a mano ai sei punti d'uso del repo, e **subito dopo tolta
di lì**: sei formattatrici scritte a mano in sei file sono la forma che si
perde in qualche settimana, e in un'app consumer si perde **subito**, perché
una convenzione che non viaggia col registry non è una convenzione, è un
ricordo. Su indirizzo di Francesco (stessa sessione) è nato quindi l'item
**`numeri`** (`registry/tassullo/lib/numeri.ts`, item **93**), sul modello di
`lib/toni.ts`: la stessa forma — un file di libreria che mette in un posto
solo ciò che altrimenti si riscrive in ogni punto d'uso.

```tsx
import { decimale, intero, valuta } from "@/lib/numeri"
intero(15402)     // "15.402"
decimale(106.376) // "106,38"
valuta(2086.93)   // "2.086,93 €"
```

**Tre funzioni e non quattro.** `percentuale` non c'è, perché oggi non la usa
nessuno e `formattatore({ style: "percent" })` la rende una riga: è la stessa
regola con cui è entrato `1:1` in `entity-image` — ogni valore vuole un
consumatore. `formattatore(opzioni)` è l'uscita di sicurezza, ed è ciò che
evita che il caso non previsto riparta da `new Intl.NumberFormat('it-IT')`.

**Una seconda ragione, indipendente dalla convenzione**: `new
Intl.NumberFormat(...)` è caro, e costruirlo dentro la cella di una tabella
vuol dire costruirlo una volta per riga a ogni render. Le istanze sono
memorizzate in una cache di modulo.

**E una regola che il file scrive perché è il rovescio della convenzione**: un
anno, un codice, un identificativo, un CAP **non si formattano**. Sono
stringhe scritte con delle cifre, e `2026` passato di lì diventa `2.026`. Il
criterio è netto: se sommarne due non ha senso, non è un numero.

I punti d'uso ricablati sull'item sono: `data-table.stories.tsx` (`decimale`,
`valuta` — il piede e i subtotali dell'albero), `data-table-filtro-intervallo.tsx`
(`intero`, ed è **codice del registry** e non una story: i due estremi di un
intervallo si leggono affiancati — l'item è nelle sue `registryDependencies`,
verificato con `add --dry-run`, che tira dietro `src/lib/numeri.ts`),
`chart.stories.tsx` e `pagina-dashboard.stories.tsx` (il totale al centro
della ciambella), `stories/ListaDueFacce.stories.tsx` (`ORE`). La convenzione
è anche **in scena**, nella sezione 7 di `Tema/Cifre`, accanto a
`tabular-nums`: sono le due metà della stessa cosa, e l'una senza l'altra non
incolonna.

**Un posto resta scoperto, e non si può chiudere ri-stilando**:
`ui/chart.tsx:257`, il valore nel tooltip, fa `item.value.toLocaleString()`
**senza locale** — è il codice di shadcn, identico all'originale. Senza locale
prende quella del browser: nel Chromium del gate, `navigator.language` è
`en-US` e il numero esce **`2,086.93`**, cioè con la virgola alle migliaia e
il punto ai decimali. Non è un problema di raggruppamento, è la formattazione
di un'altra lingua. Aggiungere argomenti a quella chiamata è una divergenza di
**forma** e `check:registry` esce 1 (regola 4bis): la via è `formatter` sul
`chartConfig`, che shadcn già prevede e che la pagina passa da sé. **Non
chiuso in M4ter.8** — con i dati delle story attuali (valori a due cifre) non
morde, ma morde alla prima app che mette in un grafico un numero sopra il
migliaio.


## 48. Il `font-mono` sui codici è sospeso (M4ter.8, coda, 2026-09-20)

**Chiesto da Roberto, riferito da Francesco**, e con la parola «per ora»: la
scelta del monospaziato per codici, lotti e simili si toglie, e si tiene il
carattere del testo dappertutto. È quindi **reversibile per costruzione**, e
la sezione 4 di `Tema/Cifre` resta in piedi apposta — il ragionamento e le
misure che la sostenevano sono lì, così chi vorrà riaprirla non dovrà rifarle.

**Cosa cade.** La seconda metà della regola del v1 («monospace per codici
sistema *e dati tabellari*») era già caduta in M2.1, quando si è misurato che
Inter porta `tnum`. Ora cade anche la prima. Codici articolo, DoP, lotti,
partite IVA, identificativi: carattere del testo.

**Cosa resta.** Tre cose, e vanno distinte o la regola si legge più larga di
quello che è.

1. **La distinzione fra ciò che si trascrive e ciò che si legge.** Non è
   caduta: una stringa che si ricopia resta una cosa diversa da una quantità
   che si confronta, e prende ancora `text-sm text-muted-foreground`. Quello
   che è caduto è il **carattere** con cui la si segnalava — il *peso* resta.
2. **Il `font-mono` sul codice sorgente**: un blocco `<pre>`, una classe
   Tailwind citata, un valore CSS. Lì il mono fa il suo mestiere.
3. **Il `font-mono` nelle misure di laboratorio** delle pagine `Tema/`
   (`Palette`, `Densità`, `Carattere`, `Cifre`): sono strumenti, non
   interfaccia d'app.

**Il costo, misurato, e non è quello che ci si aspetta.** La ragione del mono
sui codici era la sicurezza della trascrizione, cioè le coppie di glifi che si
somigliano. Misurate a 32px nel Chromium del gate, e guardate a video:

| coppia | Inter | mono di sistema |
|---|---|---|
| `O` / `0` | 23,97px / 19,63px — **si distinguono** | 19,27 / 19,27 |
| `I` / `l` | 7,44px / 6,59px — **due barre nude, indistinguibili** | 19,27 / 19,27, con grazie e coda |

Cioè: la coppia pericolosa in Inter **non è `O`/`0`**, che è quella che tutti
citano, ma `I` maiuscola contro `l` minuscola. **E per questo la sospensione
costa poco dove ci interessa**: i codici Tassullo sono *maiuscoli e cifre* —
`TAS-04182-B`, `L240718-03`, `IT01234567890` — e in una stringa senza
minuscole la `l` non compare mai.

**Dove la caveat resta viva**: le stringhe tecniche a **cassa mista** — hash,
token, percorsi. Chi ne metterà una in pagina riapra §4 di `Tema/Cifre`.

**E `slashed-zero` non è una via d'uscita**: la utility di Tailwind chiede al
font lo zero barrato, e **Inter quella feature non ce l'ha** — misurate le
cinque coppie con e senza, i numeri sono identici al centesimo di pixel.
Replica sì, ma Replica non è più il carattere dello schermo (§14).

**Il token `--font-mono` resta nel tema**, e non è una svista: serve ai due
usi che restano, e toglierlo renderebbe la decisione non più reversibile con
una riga.

**Punti d'uso ripuliti**: la colonna «Codice» di `data-table.stories.tsx` (×5),
le celle di `table.stories.tsx` (×5), il codice-collegamento di
`pagina-lista.stories.tsx`, la matricola di `ListaDueFacce` (tabella ed
elenco), i due codici di `PaginaProdotti`, l'esempio di `Tema/Carattere`, la
riga di `Tema/Cifre`. Più uno che era **già** contro la regola vecchia: il
conteggio del filtro sfaccettato (`data-table-filtro-sfaccettato.tsx`) portava
`font-mono` su un **numero**, e il numero in mono la regola non lo prevedeva
già prima.

**E `ui/chart.tsx` sì, invece.** Il valore del tooltip aveva `font-mono`, ed
era anche lì un **numero** in mono. A differenza del `toLocaleString()` senza
locale della stessa riga (§47, non chiuso), togliere una classe è una
divergenza di **stringa di classi**, cioè il gradino 2 di 4bis: fatto, e
`check:registry` resta a **0 errori / 19 ri-stilati** — il file era già nel
conto. La distinzione fra le due cose nello stesso file è la regola 4bis in
miniatura: le classi si cambiano, la forma no.

## 49. La tavolozza categorica passa a dieci tinte, e perde il bianco e nero (D24, M4ter.11, 2026-09-21)

**Decisa da Francesco a video**, guardando `Tema/Tavolozza categorica` nella
style guide. `--chart-1..5` diventa **`--chart-1..10`**: una famiglia sola,
non due.

### Perché una famiglia sola e non `--categoria-*` accanto

Rilievo di Francesco, e coglie il difetto della mia prima proposta: **un nome
nuovo accanto al vecchio lascia i grafici dov'erano**. Chi scrive un grafico
usa `--chart-*` perché si chiama così, e resterebbe a cinque per sempre. I
posti 1–3 tengono i valori di oggi (arancio del brand, verde istituzionale,
blu), quindi chi ne usa tre non se ne accorge; chi ne ha otto va avanti.

### La domanda di sistema, risposta prima di scegliere le tinte

*Le tinte di categoria hanno bisogno di 4.5:1 come i token di testo?* **No, ed
è il metro sbagliato.** 4.5:1 è la soglia del **testo** (WCAG 1.4.3). A un
**oggetto grafico** necessario a capire il contenuto si applica **1.4.11, che
chiede 3:1**, e lo chiede *solo quando il colore è l'unico mezzo*. Il testo
scritto **sopra** una tinta è un'altra coppia, e quella sì vuole i suoi 4.5:1.

Applicare 4.5:1 alle tinte le spingerebbe tutte in una banda scura e satura
dove smetterebbero di distinguersi **fra loro**, che è l'unica cosa per cui
esistono: un requisito che peggiora ciò che dice di proteggere.

Otto tinte su dieci stanno sopra 3:1. Le due che non ci arrivano sono
`--chart-1` (1.91:1) e `--chart-2` (2.85:1), cioè **l'arancio e il verde del
brand**: esentate **per indice** nel gate, con la ragione scritta lì, perché
cambiarle vorrebbe dire cambiare il marchio. L'esenzione non abbassa la soglia
— la regola resta armata su tutte le altre e su qualunque tinta si aggiunga.

### Quello che si perde, ed è aritmetica

Le cinque di prima non erano cinque colori scelti: erano **pioli di una scala
di chiarezza**, a passo 1.4935 — il rapporto che l'arancio e il verde Tassullo
hanno già fra loro — e quel passo garantiva che restassero distinguibili **in
bianco e nero**.

| pioli | estensione richiesta | ci sta in sRGB (21:1)? |
|---:|---:|---|
| 5 | 5,0:1 | sì, con margine |
| 8 | 16,6:1 | al limite |
| **10** | **37,0:1** | **no** |

Sopra gli otto non c'è spazio fra il bianco e il nero. Una tavolozza a dieci è
quindi **un'altra cosa**: separata per tinta, garantita dalla distanza
percettiva, e **non leggibile in grigio** — misurato, ΔE 0,4 in chiaro e 0,0 in
scuro fra le due coppie più vicine. Chi deve stampare in B/N usa la rampa
monocroma `--chart-mono-1..5` — tolta anch'essa il 2026-09-21, perché era
l'unica cosa che mostrava quella proprietà e con la tavolozza a dieci non
serviva più a niente. La distinzione in B/N va portata con altro: tratteggi,
etichette sui dati, riempimenti a trama.

### Le tavolozze pubblicate, provate e scartate

Prima di cercarne di nuove si sono misurate quelle collaudate per il
daltonismo. Nessuna regge il **nostro** caso, e la ragione è sempre la stessa:
sono nate per **linee e punti su fondo bianco**, mentre qui servono
**riempimenti in due modalità**, e il vincolo raddoppia.

| candidata | ΔE min | dove si rompe |
|---|---:|---|
| Okabe-Ito 8, forzata a 3:1 | **0,1** | deuteranopia: arancio e giallo, portati alla stessa chiarezza, collassano |
| Tol *muted* 9, su card chiara | 10,4 | regge in chiaro… |
| Tol *light* 9, su card scura | **2,9** | …e il suo gemello per fondo scuro crolla in protanopia |

### Le dieci, e come sono state scelte

Semi fissi: arancio del brand, verde istituzionale, blu — e **un grigio caldo**
(rilievo di Francesco: «un grigio soddisfa ogni criterio»). Le altre sei
cercate massimizzando la distanza minima da tutte le già scelte, sotto le
quattro visioni e **in tutte e due le modalità** insieme.

Misurato sulla tavolozza finale (la story lo ricalcola a ogni apertura):

| | visione piena | deuteranopia | protanopia | tritanopia |
|---|---:|---:|---:|---:|
| chiaro | 18,9 | 12,5 | 12,5 | **11,0** |
| scuro | 17,4 | 12,8 | **8,5** | 11,0 |

Soglia del gate: **5**. Il collo di bottiglia non è mai una tinta cercata —
sono sempre le coppie del brand (arancio/verde, verde/blu), cioè un vincolo di
partenza e non una debolezza della ricerca.

**Due grigi erano il vero collo di bottiglia**, e toglierne uno è stata la
correzione che ha cambiato l'ordine di grandezza: `chart-4` e `chart-5` erano
due neutri vicini, la coppia più vicina di tutte, e c'erano solo per la
garanzia in grigio. Persa quella, restava un posto speso male.

### Il rosso, e cosa non è

`--chart-10` è un rosso caldo, e chiude un innesco di M4ter.2: Officina
distingue il «Guasto» in rosso, nella scala vecchia il rosso non c'era, e il
guasto aveva dovuto prendere l'arancio. **Non è `--destructive`**, ed è una
scelta: quello è il colore dell'**allarme**, e una categoria «Guasto» non è
un'azione distruttiva; una serie di grafico che capita rossa non deve leggersi
come un errore. Sono due rossi vicini di tinta (29 contro 27) e lontani di
ruolo. Provato anche `--destructive` tale e quale: funziona (ΔE min 9,2) ma è
peggiore **e** sovraccarica un significato.

### Un errore di misura, a verbale perché la lezione vale

La prima ricerca dava numeri **sbagliati**, e la conclusione era rovesciata:
proponeva come migliore la tavolozza che sotto protanopia aveva due tinte
**identiche** (ΔE 1,1). La causa: la memoria dei colori simulati era indicizzata
con `f.name`, che per una funzione freccia anonima è la **stringa vuota** —
quindi le quattro visioni condividevano lo stesso valore e i tre deficit
riportavano il numero della visione piena.

Il campanello c'era e non è stato raccolto al primo giro: **i quattro valori
uscivano identici**, che è un risultato impossibile. Lo ha smascherato la
pagina della style guide, che calcola senza memoria — cioè lo strumento
costruito per farla guardare a un umano ha corretto lo strumento costruito per
decidere. Da cui la regola: *quando quattro misure indipendenti danno lo stesso
numero, il sospetto va allo strumento, non ai dati.*

### Cosa cambia nel repo

- `scripts/hex-to-oklch.ts`: le dieci tinte sono **scritte**, non più derivate
  (`deriveSerie` e la costante `SERIE` sono state rimosse). La rampa monocroma
  resta derivata, perché *quella* è ancora una scala.
- `check:contrast`: due regole diverse per le due famiglie — la categorica non
  ha il passo in grigio e ha `minSuCard: 3`; la rampa tiene entrambi.
- `calendario.tsx`: `COLORI_EVENTO` passa da cinque nomi a **dieci**, e
  `ardesia` diventa `rosso`. Nella story di Officina il «Guasto» è rosso.
- `Tema/Tavolozza categorica` nella style guide: la pagina legge i token dal
  tema a runtime e rifà le misure, quindi non può divergere dalla palette.


---

## 50. Il Computo di Studio: non è l'indice che non compone, è il rettangolo (M4ter.12, 2026-09-21)

**Il difetto era già a verbale** — `data-table` ha l'albero e il sotto-totale ma
la tastiera di riga; `data-grid` ha la tastiera di cella e `getSottoRighe`
`Omit`-tato, perché naviga per indice sull'array piatto del motore. Quello che
questa sessione ha misurato è **quanto** di quel difetto sia l'indice, e la
risposta è: **poco.** L'indice è la metà facile. La metà che non si ripara è il
**rettangolo**.

### La misura che lo dice

`Blocchi/Data Table → Albero`, espanso, in Chromium vero (§32 — strumento
verificato prima: `visibilityState: "visible"`, `requestAnimationFrame` scatta).

| | misura |
|---|---|
| righe nel DOM | **20** (5 madri + 15 figlie) |
| righe nell'array dei dati | **5** |
| celle con `tabindex` | **0** su 20 righe |
| righe con `tabindex` | **0** |
| `role` della tabella | **nessuno** (l'albero non è una `grid`) |

Venti contro cinque: è l'indice, ed è la parte riparabile — una mappa
`idRiga → posizione nel modello reso` al posto di `indiceRiga`, e le frecce
tornerebbero a muoversi dove si guarda.

Poi però c'è questo, sulle stesse righe:

| col | intestazione | sulla riga-MADRE | sulla riga-FIGLIA |
|---:|---|---|---|
| 0 | *(senza nome)* | vuota | vuota |
| 1 | Voce / misurazione | `01.01 — Scavo di sbancamento` | `Piano terra — ambiente 1` |
| 2 | U.M. | **vuota** | `m³` |
| 3 | Quantità | `21,63` — **subtotale, derivato** | `8,81` — valore |
| 4 | Importo | `397,99 €` — **subtotale, derivato** | `162,10 €` — valore |

**Zero colonne su quattro vogliono dire la stessa cosa ai due livelli.** Due
sono derivate sulla madre e scritte sulla figlia (scriverci dentro non vuol dire
niente), una è vuota sulla madre, una porta due testi di natura diversa.

### Perché questo decide, e l'indice no

Cinque operazioni del motore sono **rettangoli `(r,c)`**, non spostamenti:
`serializzaSelezione`, `incolla`, `riempi`, `riempiInDirezione`,
`cancellaSelezione` (`registry/tassullo/blocks/data-grid.tsx`, il blocco fra
`cancellaSelezione` e `riempiInDirezione`). Un rettangolo presuppone una
**matrice omogenea**: che la colonna *c* voglia dire la stessa cosa su ogni riga
che attraversa. Su un albero a livelli eterogenei quella premessa è falsa, e
resta falsa qualunque indice si scelga.

Quindi, alla domanda che `PIANO.md` pone a questa sessione — *«incolla e
riempimento su una selezione che attraversa due livelli: o funzionano, o è
scritto a verbale che non compongono»* — la risposta è: **non compongono**, e
non è un limite di implementazione. Riordinare gli indici darebbe le frecce fra
i livelli e lascerebbe incolla e riempimento semanticamente vuoti sulle stesse
celle.

C'è un secondo scarto di forma, minore ma da sapere: `meta.sottototale` mette il
subtotale **sulla riga-madre**, che TanStack rende **sopra** i suoi figli
(`data-table.tsx`, `RigaTabellaCorpo`: la cella del subtotale prende il posto di
quella normale quando `riga.subRows.length > 0`). Il «SOMMANO» di Primus sta
**sotto** le misurazioni. Anche con l'indice ad albero, la forma del Computo non
si riprodurrebbe senza un secondo meccanismo — una coda di gruppo, che oggi non
c'è.

### Il Computo vero: cosa chiede davvero

Letto da un clone usa-e-getta via SSH, in sola lettura, cancellato a fine
sessione (la strada di M4ter.9).

| | misura | dove |
|---|---|---|
| voci di un computo reale | **144** (18 capitoli), computo PriMus di gara, 78 pagine | `tests/fixtures/capitolato_golden.json`, asserito in `tests/test_estrazione_computo.py` |
| tetto d'import | **600** voci (`MAX_VOCI`), **300** righe sull'ingest prezzi | `tasks/estrazione_computo.py`, `tasks/ingest_documento_prezzi.py` |
| tetto del computo nativo | **nessuno** — né `LIMIT` in lettura, né paginazione, né virtualizzazione | `db.py` (`list_computo_righe`), `ComputoTable.tsx` (`righe.map`) |
| misurazioni per voce | **non documentate**; fixture 1–3, minimo reso 1 (riga «ghost») | `VoceRowGroup.tsx` |
| livelli | **esattamente due** — nessun `parent_id`, nessun capitolo persistito | `scripts/ddl_f3_computo_estimativo.sql` |
| le **voci** si riordinano | sì, `moveRiga(i, ±1)` da menu | `useComputoState.ts` |
| le **misure** si riordinano | **no** — nessun `moveMisura`, nessun drag&drop in tutto il computo | `useComputoState.ts` |
| incolla da foglio di calcolo | **no** — nessun `onPaste`, nessuna lettura di `clipboardData` in tutto `frontend/src` | — |
| annulla/ripeti | **no** — un `useState` solo, nessuna pila di versioni | `useComputoState.ts` |

Righe rese: 144 voci × (1 testata + 1÷4 misure + «+ misurazione» + SOMMANO)
≈ **900–1150 `<tr>`**, tutte montate insieme.

E la tastiera che il Computo ha **oggi**, che è la sorpresa della sessione:

| celle scrivibili | quante | frecce |
|---|---:|---|
| testata voce — descrizione | 1 | **no** (`data-cell`, nessun `onKeyDown`) |
| misurazione — descrizione, par.ug., lung., larg., h/peso | 5 | sì: `Invio`/`↑`/`↓`, **stessa colonna, stessa voce** |
| SOMMANO — u.m. (`<select>`), prezzo unitario | 2 | **no** |

**Otto celle scrivibili, cinque con le frecce, e tutte e cinque sullo stesso
livello.** Niente `←`/`→`, niente passaggio da una voce all'altra, niente
copia/incolla, niente riempimento, niente annulla. La navigazione fra i livelli
che si stava per costruire in `data-grid` **non esiste nell'app che la
chiederebbe**.

### Le tre strade, pesate coi numeri

1. **Appiattire il dato** — una riga per misurazione, la voce in colonna, il
   totale in `piede`. La matrice delle misurazioni è **omogenea**: 5 colonne che
   vogliono dire la stessa cosa su ogni riga, ~576 righe a 144×4 — e
   `Blocchi/Data Grid → Computo` già regge **500 righe virtualizzate, 20
   montate**. Tastiera, incolla, riempimento, annulla/ripeti funzionano tutti,
   ed è **più** di quel che l'app ha oggi. Costo al registry: **zero** — la
   forma piatta esiste già come story, `Blocchi/Data Table → Con Piede`
   (`MISURAZIONI`, la voce riportata su ogni riga). Ciò che si perde: i campi di
   **voce** (descrizione, u.m., prezzo) non sono celle della matrice, e il
   «SOMMANO» per voce non è una riga del motore — vanno da un'altra parte
   (testata di gruppo, o scheda accanto). **È un cambio di forma del computo, e
   lo decide chi lo usa.**
2. **Indice ad albero in `data-grid`** — sedici punti del motore contano su
   «riga N = `motore.righe[N]`», di cui **cinque sono i rettangoli**. Riscrivere
   gli undici dà le frecce; i cinque restano senza significato, come sopra. Cara
   *e* incompleta.
3. **Un blocco terzo** — gradino 4 della regola 4bis: si propone, non si scrive.
   Questa sessione **non lo propone**, perché la (1) copre il bisogno misurato
   con zero item nuovi.

### Verdetto proposto (in attesa di Francesco)

**La (1), e non adesso.** Il Computo resta sul v1 e si riapre quando Studio
decide di migrarlo: la scelta è una scelta di **forma del computo** — se le
misurazioni possano stare in una matrice piatta con la voce in colonna — e
quella la fa chi lo usa, non il design system. `GUIDA-MIGRAZIONE.md` (M5.5) lo
nomina fra le pagine che non si migrano al primo giro.

**Il commento in testa a `data-grid.tsx` resta giusto e diventa più corto da
difendere**: non «l'albero non compone perché l'indice è piatto», ma «l'albero
non compone perché il rettangolo non attraversa i livelli». La seconda è una
ragione che non invita a riprovare.

### Revisione del §50, poche ore dopo, sull'app viva (2026-09-21)

Francesco ha aperto il Computo deployato. **Due conclusioni qui sopra vanno
corrette, e la seconda ribalta il verdetto.**

**(a) Il rettangolo è un problema molto più piccolo di come è scritto.** La
misura era su `Data Table → Albero`, dove il subtotale sta sulla riga-madre
**nelle stesse colonne dei figli**. Il Computo vero no: il SOMMANO è una riga a
parte e porta i suoi numeri in **colonne diverse** da quelle delle misure —
`colSpan={4}` copre PAR.UG./LUNG./LARG./H/PESO con **una cella vuota**. Le
colonne si spartiscono per tipo di riga invece di sovrapporsi, quindi un
rettangolo sulle quattro colonne di misura incontra **celle vuote, non celle in
conflitto**. Resta in conflitto la sola DESIGNAZIONE. *La misura era giusta
sull'oggetto misurato e l'ho portata su un oggetto con geometria diversa* — la
forma di §22 trasposta sulle colonne.

**(b) «L'app non ce l'ha» non vuol dire «l'app non ne ha bisogno».** Misurata la
tastiera vera, con la spia su `keydown` (i tasti passati come `"Down"` arrivano
con `key: ""`: la prima passata dava «il fuoco non si muove mai» su una tastiera
sana):

| gesto | esito |
|---|---|
| `Tab` per entrare nella tabella | **21 fermate** |
| frecce verticali | solo **fra misure della stessa voce**, stessa colonna |
| frecce orizzontali | **niente** |
| `Enter` | scende di una misura; **sull'ultima, niente** |
| `Tab` fra due misure | **due fermate**, quella in mezzo è **✕ «Rimuovi misura»** |
| SOMMANO (u.m., **prezzo**) e testata voce | **irraggiungibili con le frecce** |

Costo contato sul DOM: un gruppo con 3 misure sono **24 fermate di `Tab`**, 18
celle e **6 comandi**. A 144 voci: **~4300 fermate, ~1000 su comandi, 576 su
«Rimuovi misura»**. Il fondo di ogni gruppo è un vicolo cieco, e il **prezzo** —
la cella che determina l'importo — si raggiunge solo attraversando tutto il
resto col `Tab`.

**La navigazione fra i livelli è dunque ciò che manca, non ciò che non serve.**

**Verdetto rivisto: la (3).** Non appiattire (la forma di Primus si tiene) e non
l'indice ad albero dentro `data-grid` (quel motore è una matrice, e il Computo
non lo è): un blocco a sé, un **foglio a gruppi** — sequenza di gruppi con
testata, corpo omogeneo e piede, colonne spartite per zona. Gradino 1 verificato
a vuoto (niente di simile all'MCP, né `@shadcn` né `@tassullo`). Consumatore
**uno solo, Studio**: la motivazione non è «due app lo riscriverebbero» ma
«Studio lo migra e deve trovarlo pronto», e va scritta così.

**In attesa della conferma di Francesco sulla forma.**
`registry/componenti-propri.json` resta a 1.

Rilievo collaterale, misurato: a **951px** di viewport il foglio taglia **247px**
e fuori campo finiscono **Quantità, Prezzo e Importo**. Fascia di un portatile
13" col guscio aperto.

### Esito: `tassullo-foglio-gruppi` (approvato e scritto, 2026-09-21)

Francesco ha confermato la forma. Il blocco esiste, e queste sono le misure che
lo chiudono — non le promesse della proposta.

| | Computo di Studio, oggi | `tassullo-foglio-gruppi` |
|---|---|---|
| `Tab` dentro il foglio | **24 fermate** (gruppo da 3 righe) | **1** in tutto il foglio |
| comandi nell'ordine di `Tab` | 6 per gruppo, fra cui ✕ «Rimuovi» | **0** — `Shift+F10` |
| `ArrowDown` a fine gruppo | niente | entra nel gruppo dopo |
| piede e **prezzo** con le frecce | irraggiungibili | raggiunti |
| frecce orizzontali | niente | saltano alle colonne con una cella |

**Un difetto che solo la misura poteva trovare, e che ripete la famiglia da cui
il blocco nasce.** Alla prima stesura `[tabindex="0"]` valeva **0**: il fuoco
mobile partiva da `null`, nessuna cella era tabbabile, e `Tab` scavalcava la
tabella intera mentre le frecce funzionavano perfettamente. Da tastiera pura il
foglio era irraggiungibile, **e axe dava zero violazioni** — perché non c'era
niente di sbagliato da vedere: c'era una porta che non si apriva. È D15 in casa.
Chiuso con `primaPosizione`. La lezione è che la misura da tastiera non è un
collaudo finale: è l'unico modo di sapere se una griglia si usa.

**Il perimetro del difetto di §50 si è ristretto, non è stato smentito.** Il
blocco non fa copia/incolla, riempimento né annulla/ripeti: sono le operazioni a
**rettangolo** di `data-grid`, e su colonne che si spartiscono per zona un
rettangolo non ha significato. Un incolla *dentro un gruppo*, sulle sole colonne
del corpo — che lì sono omogenee — resta possibile e non è stato scritto perché
nessuno l'ha chiesto.

**Due cose dichiarate, non nascoste.** La prop `ancorata` (`sticky right-0`)
**non è esercitata** dalla story: misurato da 1440 a 600px, il foglio non scorre
mai perché `table-fixed` comprime la designazione, e le tre colonne del risultato
restano in campo a ogni larghezza. Serve a un consumatore che dichiari colonne
più larghe della somma disponibile. E il prezzo di quella compressione era lo
sbordamento: senza `truncate`, a 880px **otto celle sbordavano nella colonna
accanto** — la stessa lezione già scritta in `data-table`. Con `truncate`: **0
fino a 880px**, dodici sotto, e sotto sono puntini.

Il registro dei componenti nostri **resta a 1**: il blocco sta in `blocks/`, e
quel file è per ciò che prende il posto di una primitiva.

Numeri di chiusura: **95 item** (era 94), `test:a11y` **1508 scansioni su 377
story, 0 violazioni**, `misura:bersagli` **3255 su 377, 0 piccoli**, sette gate a
**0**, lint **26 avvisi** preesistenti.

## 51. La scala tipografica aveva disarmato la protezione anti-zoom di iOS (M4ter.12, coda, 2026-09-22)

**iOS Safari ingrandisce la pagina da solo** quando il fuoco entra in un campo il
cui testo sta **sotto i 16px**, e uscendo **non la rimpicciolisce**: l'utente
resta con la pagina zoomata dopo ogni cella toccata. Non è una preferenza, è il
comportamento del sistema, e l'unico modo di evitarlo — senza `maximum-scale`,
che toglie lo zoom anche a chi ne ha bisogno — è tenere il campo a 16px o più.

**shadcn lo sa e lo previene**: `ui/input.tsx` e `ui/textarea.tsx` nascono con
**`text-base md:text-sm`**, dove `text-base` vale **16px in Tailwind** ed è
scelto esattamente per stare sulla soglia; sopra `md` scende a `text-sm`, dove un
puntatore c'è e il problema non esiste.

**La nostra scala l'ha disarmata da un pixel.** D16 (M1.6, §30) tara
`--text-base` a **15px** in densità normale — un gradino più basso di Tailwind,
per una ragione buona e indipendente. Da allora `text-base` sui campi valeva 15px
e iOS zoomava, **in ogni app**. Il difetto non si vede da nessuna parte sulla
scrivania, non produce nessun errore, e nessun gate lo guarda: `check:registry`
confronta la forma con l'originale — che è **identica**, la classe è la stessa —
e axe non misura le grandezze.

### La misura

In Chromium vero, `Primitive/Input` e `Primitive/Textarea`, prima e dopo.

| | 390px, densità normale | 390px, touch | 900px, normale | 900px, touch |
|---|---|---|---|---|
| **prima** (`text-base md:text-sm`) | **15px — zooma** | 16px | 13px | 14px |
| **dopo** (`text-lg md:text-sm`) | **16px** | 17px | 13px | 14px |

La densità **touch** si salvava già da sé, perché lì `--text-base` è 16.

### La correzione, e perché è la minima possibile

**`text-lg md:text-sm`** su entrambi i file. `text-lg` è **16px** nella nostra
scala: rimette la soglia esattamente dove shadcn la voleva, con un **token del
tema** e senza valori arbitrari. È **una sola stringa per file**, cioè gradino 2
della regola 4bis — `check:registry` lo conferma: *«forma identica all'originale,
1 stringhe di classi ri-stilate»* — e **sopra `md` non cambia niente**, quindi
nessuna interfaccia da scrivania si muove di un pixel.

**Approvata da Francesco il 2026-09-22**, perché tocca i campi di ogni app: non
era una correzione da prendere di iniziativa dentro la sessione che l'ha trovata.

### Cosa resta da sapere

Il rimedio vive in **due file**, e un terzo campo che nascesse domani senza quelle
classi ripeterebbe il difetto in silenzio. Non c'è un controllo che lo impedisca,
e non se n'è aggiunto uno: un gate che misuri le grandezze rese vorrebbe un
browser e una passata sua, e sarebbe il primo del repo a farlo. **Se ne nasce un
terzo, la regola è questa riga.**

La lezione oltre il caso: **quando si sposta un gradino della scala tipografica,
si spostano anche le soglie che qualcun altro ci aveva appoggiato sopra.** D16 ha
cambiato `--text-base` per ragioni sue, giuste, e ha rotto a distanza una
protezione scritta in un file che non ha toccato.

## 52. Quello che sapevano solo le pagine delle primitive (M5.0b, 2026-09-22)

M5.0b ha riscritto per chi legge da fuori le pagine di 28 primitive, da `accordion` a `item`. Prima di togliere un paragrafo con una misura o un ragionamento, lo si è cercato qui e in `WORKLOG.md`: quasi tutto c'era già. Queste quattro cose stavano **solo** nelle story, e si portano qui prima di toglierle.

1. **La cella del calendario in touch è 42px, e non si è alzata.** `--cell-size: --spacing(7)` dà 28px in normale e 42 in touch. `--spacing(8)` darebbe 48 in touch, ma 32 in normale: un calendario più largo su ogni pagina da scrivania per un requisito che vale solo sul telefono. Lasciato al preset; `misura:bersagli` lo conta fra i bersagli sotto i 44px, non fra i piccoli.
2. **Le stringhe per il lettore di schermo si traducono senza uscire dal gradino 2.** `carousel` ha tradotto l'`sr-only` delle frecce e i due `aria-roledescription` («carosello», «diapositiva»); `breadcrumb` l'`aria-label` del `<nav>` («percorso di navigazione») e l'`sr-only` dell'ellissi («Altri livelli»). `check:registry` confronta la forma **azzerando il contenuto delle stringhe**, quindi tradurre non è una divergenza: sono le sole stringhe di quei componenti che arrivano a un utente, e le sente solo chi non può accorgersi che sono nella lingua sbagliata.
3. **La casella è piccola, il suo bersaglio no.** `checkbox` disegna `size-4` (16px in normale, 24 in touch), ma `after:-inset-x-3 after:-inset-y-2` stende un pseudo-elemento cliccabile tutt'intorno: resta premibile col guanto senza diventare un quadrato enorme.
4. **L'accordion non ha le frecce, e non è una dimenticanza.** Verificato su `@base-ui/react` installato: `Accordion.Root` ha ancora la prop `loopFocus`, ma è **deprecata e senza effetto** — Base UI ha tolto il fuoco a scorrimento seguendo l'aggiornamento dell'ARIA Authoring Practices (w3c/aria-practices#3434). Ogni intestazione è un bottone raggiunto col `Tab`, e la pagina lo scrive come comportamento.

## 53. Le pagine Docs seguono la Modalità attraverso il tema di Storybook (M5.0b, coda, 2026-09-22)

**Il difetto.** Da quando `autodocs` è acceso per tutti (coda di M5.0a) ogni componente ha una pagina Docs, e in Scuro quella pagina restava bianca: il `dark` arrivava sull'`<html>` dell'iframe — lo mettono i decorator delle scene — ma `.sbdocs-wrapper`, i titoli, il codice e la tabella delle prop si colorano col **tema di Storybook**, che restava chiaro. Le scene hanno fondo trasparente e si rendevano coi token scuri: chiaro su bianco. Misurato con axe (`color-contrast`) sulle pagine intere, dal manager: **47 violazioni in Scuro** su cinque pagine (Badge 5, Calendar 12, Dialog 5, Dropdown Menu 4, Combobox 21), minimo **1.17:1**; 0 in Chiaro. `test:a11y` non poteva vederlo: misura il canvas di ogni story, non le pagine Docs.

**La scelta: il tema, non regole CSS sulle classi di Storybook.** `parameters.docs.container` è un `DocsContainer` che a ogni resa legge il global `modalita` e passa `theme` chiaro o scuro, costruiti da `temaStorybook()` (`.storybook/tema-storybook.ts`) — la stessa funzione che tinge la cornice in `manager.ts`, dalla stessa `manager-palette.json` generata. Ripassare `.sbdocs-*` e `.docblock-*` a mano avrebbe voluto dire inseguire le classi interne di Storybook e lasciare fuori la colorazione sintattica, che classi da prendere non ne ha. Il tema non accetta `var(--…)` (passa i colori da `polished`, che su `var()` e `oklch()` lancia), quindi i valori sono gli esadecimali generati: nessuno scritto a mano.

**Tre cose da sapere, tutte misurate.**
1. **La modalità si legge dai globals, non dalla classe sull'`<html>`.** La classe la mettono i decorator mentre le scene si rendono, cioè *dopo* il contenitore: letta da lì sarebbe sfasata di un clic. Storybook rende di nuovo la pagina Docs a ogni cambio di global (`onUpdateGlobals` → `currentRender.rerender()`), quindi basta leggerlo a ogni resa. La via pubblica è `context.getStoryContext(context.storyById())`; una pagina MDX **senza story** (`Introduzione`) non ha una story principale e `storyById()` lancia, e lì si legge il negozio dei globals, che `DocsContextProps` non dichiara — con ripiego sul valore iniziale. Il contenitore applica anche la classe, o `Introduzione` restava nella modalità della pagina aperta prima.
2. **Il riquadro del codice va sulla card.** Col tema, `.docblock-source` prende il fondo della pagina (`--background`), e i colori di Prism — fissi, tarati sul bianco — scendevano a **4.26:1** (costanti), 4.28 e 4.42 su `Badge`. Su `--card` tornano a **4.53** il minimo. È l'unica regola su una classe interna di Storybook, in `preview.css`.
3. **La Superficie in Docs tinge le scene, non la pagina.** `.docs-story` prende `--card` o `--sidebar` come il `body` del canvas; la prosa resta sulla pagina. Il foglio che spiega un componente non è la superficie su cui il componente poggia.

**Da sapere sullo strumento.** L'iframe **aperto da solo** (`iframe.html?id=…&viewMode=docs`) **si ricarica** quando gli si manda `updateGlobals` sul canale, e riparte dai globals iniziali: la commutazione sembra non funzionare. Succede identico sulla build di partenza, quindi non è di questa modifica. Le pagine Docs si misurano **dal manager** (`/?path=/docs/…&globals=modalita:scuro`, o cliccando la barra): lì la commutazione regge chiaro → scuro → chiaro → scuro → chiaro, verificata cinque volte di fila.

**E un residuo trovato spostando il codice.** `manager.ts` passava a `create()` anche `sidebarBg`, `sidebarTextColor`, `sidebarSelectedColor`, `sidebarBorderColor`, col proposito — scritto nel commento — di dare alla colonna di sinistra l'antracite di `--sidebar`. **Storybook 10 non ha quei campi**: `convert()` destruttura solo quelli che conosce e scarta gli altri senza avviso, quindi la colonna è sempre stata su `appBg`. Tolti. I quattro token della sidebar restano in `manager-palette.json` (lo genera `hex-to-oklch.ts`), inutilizzati: se la cornice deve davvero diventare antracite, la strada non è il tema del manager.

## 54. Quello che sapevano solo le pagine delle primitive, seconda metà (M5.0c, 2026-09-23)

M5.0c ha riscritto per chi legge da fuori le 24 pagine da `kbd` a `tooltip`. Le misure con unità che le vecchie pagine portavano (`px`, `:1`, `%`) erano **tutte** già qui o in `WORKLOG.md`: le larghezze della sidebar (256/384, 48/72, 281px), il contrasto dell'etichetta di gruppo (4.41/4.21), le rese di `alignItemWithTrigger` (51px, y=347), il `1×16px a y=0` del separatore, i 452 → 421 → 341px delle schede, il pomello dello slider da 42 a 48px, i 18 × 32 dell'interruttore, 1.62 → 7.17:1 della descrizione del toast, i byte di acceso e sorvolato (236,234,232). Si portano qui le cose **senza numero** che stavano solo nelle story, e cinque comportamenti di tastiera **verificati sulla libreria installata** perché la pagina li scrive come garanzia — tre dei quali correggono ciò che la vecchia prosa diceva.

1. **`toggle-group`: `Tab` entra sul primo elemento, non su quello acceso.** Il gruppo è un `CompositeRoot` di Base UI con indice iniziale 0; il fuoco va all'elemento «attivo» solo se l'elemento lo dichiara con l'attributo `ACTIVE_COMPOSITE_ITEM`, e in `@base-ui/react` lo fa **solo `Radio`** (`radio/root/RadioRoot.js`), non `Toggle`. Quindi: `radio-group` entra sulla voce scelta, `toggle-group` sul primo elemento o sull'ultimo che aveva il fuoco. La vecchia pagina diceva «sull'unico acceso, a scelta singola». Il gruppo ha anche `Home` e `Fine` (`enableHomeAndEndKeys: true`), che la vecchia pagina non nominava.
2. **`tabs`: le frecce spostano il fuoco, non la scheda.** `activateOnFocus` su `Tabs.List` vale `false` di base: la scheda si apre con `Invio` o `Spazio`, e con `activateOnFocus` anche solo spostandoci il fuoco. La vecchia pagina diceva «le frecce spostano fra le schede», che si legge in tutti e due i modi.
3. **`popover`: `Tab` esce e chiude.** Senza un `PopoverClose` dentro, il gestore del fuoco non è modale (`modal !== false && hasClosePart`), e `closeOnFocusOut` vale `true` di base: il fuoco esce verso la pagina e il riquadro si chiude. Confermato ciò che la pagina già diceva.
4. **`scroll-area`: il riquadro è un fermo di tabulazione solo quando scorre.** `ScrollAreaViewport` scrive `tabIndex: 0` solo se il contenuto sborda in almeno una direzione, `-1` altrimenti: un riquadro che non scorre non aggiunge un `Tab` a vuoto.
5. **`sonner` e `spinner`, i due nomi che arrivano da fuori.** `sonner` risponde ad `Alt`+`T` (`hotkey = ['altKey', 'KeyT']`), annuncia in una regione `aria-live="polite"` e tiene un avviso 4 secondi; `spinner` porta di serie `aria-label="Loading"`, in inglese, e la pagina chiede di passarlo in italiano.
6. **`stepper`: prima di aver dato il fuoco a un passo, `Home` non fa niente.** Il `tabIndex` è `0` sul passo selezionato e `-1` sugli altri, e i tasti sono ascoltati sui bottoni dei passi: senza fuoco dentro la barra non c'è nessun elemento su cui agire. Non è un difetto. E le frecce chiamano `.focus()` e basta: il passo cambia solo con `Invio`, `Spazio` o un clic (attivazione manuale).
7. **Anagrafe aveva già scritto a mano due «chip» che filtri non sono**: `pdt-prod-chip` e `adm-ruolo-chip`, due collegamenti vestiti da pillole. Era scritto solo nella pagina di `toggle-group`, che non nomina più le app; serve alla guida di migrazione (M5.5) per riconoscere la forma.

## 55. Lo stepper resta identico a reui: la composizione accessibile si ripete (M5.0c, coda, 2026-09-23)

**La domanda, aperta da M4ter.1 (2026-09-19).** In `@reui/stepper` la radice `Stepper` porta `role="tablist"` e le schede stanno dentro lo `<nav>` di `StepperNav`, che spezza la catena fra la lista e le sue schede: axe dà `aria-required-children` sulla radice e `aria-required-parent` su ogni scheda. Due strade: comporre diversamente a ogni uso, oppure un'eccezione alla regola 4bis che sposti il ruolo dalla radice a `StepperNav`.

**Deciso da Francesco: la composizione resta, il componente non si tocca.** La pagina `Primitive/Stepper` la scrive come regola d'uso: radice con `role="group"` e `aria-orientation={undefined}`, schede in un elemento nostro con `role="tablist"` e `aria-label`, tutti i pannelli presenti con `id="stepper-panel-N"`. Oggi è ripetuta in due punti (`Primitive/Stepper`, `SchermateAccesso`), a zero violazioni.

**Perché l'eccezione costava più di «una riga», come la dava M4ter.1.** Misurato aprendo i file:
1. `check:registry` non ha un modo di accettare una divergenza di forma dichiarata: ogni spostamento di attributo su un file con originale lo manda in rosso. L'eccezione avrebbe chiesto infrastruttura nuova nel gate, per un solo caso.
2. `StepperNav` destruttura solo `children` e `className`: spostato lì il ruolo, il `tablist` non potrebbe ricevere un `aria-label` senza aprire anche le sue props — una seconda divergenza.
3. A ogni aggiornamento di reui la modifica andrebbe riportata a mano, sul primo componente di terzi del registry.
4. Il punto 3 di M4ter.1 — i pannelli che devono esserci tutti — resterebbe comunque: nessuna delle due strade lo toglie.

Si riapre se gli usi crescono al punto che la ripetizione diventa il difetto, o se reui corregge il componente a monte.

## 56. Quello che sapevano solo le pagine dei blocchi (M5.0d, 2026-09-23)

M5.0d ha riscritto per chi compone una pagina le 21 pagine di `registry/tassullo/blocks/`. Le misure con unità delle vecchie pagine erano già qui o in `WORKLOG.md` (i 214px della cella del calendario stanno nella tabella del commento su `monthRow`, in `calendario.tsx`; i 343px della carta a una colonna nella tabella di M4ter.7; le 24 fermate e i 576 passaggi del Computo in §50). I fatti sulle app che servono a M5.5 — le 190 righe di `Sidebar.css` di Anagrafe, le cinque pagine di Studio con la barra di contesto, `window.prompt` nei ChangeSets, le voci senza icona di Anagrafe — stanno in `WORKLOG.md` alle voci di M3.1, M3.4, M4ter.7, M4ter.9. Qui vanno le cose accertate in questa sessione, verificate sul sorgente o in Chromium (Playwright sullo Storybook costruito), che correggono la vecchia prosa o che la pagina scrive come garanzia.

1. **`tassullo-data-grid`: `Tab` non esce dalla griglia.** `onKeyDownCella` intercetta `Tab` sempre, non solo in modifica, e lo trasforma in `spostaOrizzontale`, che a fine riga passa alla riga dopo e all'ultima cella si ferma; `Maiusc`+`Tab` dalla prima cella va all'ultima colonna della prima riga. Misurato su `Blocchi/Data Grid → Editabile`: da tastiera pura il primo `Tab` va su «Colonne», gli undici seguenti restano tutti dentro la tabella. È il contrario di `tassullo-foglio-gruppi`, dove `Tab` esce al secondo colpo (misurato), e di ciò che una griglia ARIA chiede. **Chiuso in coda a M5.0d**: a celle chiuse `Tab` non si intercetta più, e la griglia è un fermo solo — misurato, il primo `Tab` entra sulla cella attiva e il secondo esce; dopo le frecce, `Tab` da una cella interna esce e `Maiusc`+`Tab` torna su quella cella. In modifica `Tab` conferma e passa accanto, come prima. Conseguenza sulla scena `Computo`: i bottoni «Elimina» di riga, fuori da `colonneId`, diventavano i fermi di `Tab` successivi (19 montati), e un bottone «Elimina» fuori dalla griglia non avrebbe risolto, perché a fuoco uscito la riga su cui si lavorava non era più segnata (rilievo di Francesco). **Deciso con lui: il cestino resta nella riga e diventa una cella della griglia.** `useDataGrid` accetta `colonneAzioneId`, colonne di comando in coda a `colonneId`: le frecce le raggiungono, copia, incolla, riempimento, svuotamento e selezione le saltano (il rettangolo si ferma all'ultima colonna dei dati), `Tab` non ci si ferma, e la maniglia di riempimento non ci compare. La cella si scrive con `colonnaAzioneGriglia` (`icona`, `etichetta` per riga, `onAzione(riga, motore)`), ed è il bottone stesso, per non essere `nested-interactive`. Dopo un'eliminazione la cella attiva passa alla stessa colonna della riga che prende il posto, non più alla prima cella della griglia. Misurato su `Computo`: `→` dall'ultima colonna porta a «Elimina C0001», `Invio` elimina (500 → 499 voci) e il fuoco va su «Elimina C0002»; `↓`, `Spazio`, `←` come atteso; `Maiusc`+`→` non estende la selezione sul comando; due `Ctrl`+`Z` riportano la riga; il clic sul cestino lascia il fuoco su quello della riga dopo; dalla griglia `Tab` esce al primo colpo.
2. **`tassullo-data-grid` formatta i numeri senza `useGrouping: 'always'`.** `CellaNumericaGriglia` usa `new Intl.NumberFormat("it-IT")`, quindi il separatore delle migliaia è intermittente (§47): `2086,93` accanto a `12.345,00`. **Chiuso in coda a M5.0d**: la cella usa `formattatore()` e `valuta()` dell'item `numeri`, e l'item `tassullo-data-grid` dichiara `@tassullo/numeri` fra le `registryDependencies`. Misurato scrivendo nelle celle: `12345` → `12.345`, `2086.93` → `2.086,93 €`.
3. **`tassullo-file-upload`: il fuoco va sul bottone, non sulla cornice.** La vecchia pagina diceva «`Tab` porta il fuoco sulla cornice, `Invio` o `Spazio` aprono il selettore»: la cornice è `noClick`/`noKeyboard` e non interattiva (il commento in testa al blocco spiega perché: `nested-interactive`), e il selettore lo apre un bottone dentro la cornice.
4. **`tassullo-rich-text-editor` ha anche il pedice e «Rimuovi formattazione».** La vecchia pagina elencava grassetto, corsivo, apice, elenchi e collegamento. Il contatore cambia colore a 50 caratteri dal limite (`residui <= 50`), e oltre il limite non si scrive (`CharacterCount` con `limit`).
5. **`tassullo-calendario`: la vecchia scena `Altezza variabile` diceva il contrario del blocco.** Scriveva «il mese non si scorre mai» e un pavimento di una corsia (64px); il blocco, da M4ter.11, ha il pavimento a tre eventi (`min-h-32`, 128px) e sotto quella misura il mese scorre. Riscritta sul sorgente. Accertato anche: un evento creato dal dialogo arriva in `onEventiChange` con un `id` provvisorio `evento-<ora>-<n>`, che l'app sostituisce con quello del backend; la pagina lo scrive fra le regole. E la griglia del mese è raggiungibile col `Tab` evento per evento, e con `modifica` anche sul «+» («Aggiungi evento») di ogni giorno: 42 fermate in più su un mese intero.
6. **Il Viewport di Storybook funziona sulla scena aperta da sola, non sulla pagina Docs.** Misurato: `Blocchi/App Shell → Telefono` aperta dal manager rende a `innerWidth` 375 con la colonna fuori dal DOM; nella pagina Docs la stessa scena rende a 1140, con la colonna. §46 resta vero per il canvas aperto per URL (`iframe.html`), che è come lo aprono i gate. Le pagine di `app-shell` e `foglio-gruppi` scrivono quindi «si vede aprendo la scena da sola», e non più «stringendo la finestra, non col Viewport».
7. **La tabella delle prop nelle pagine Docs mostra i JSDoc dei sorgenti dei blocchi.** `autodocs` rende, sotto la descrizione, la tabella di `react-docgen` coi commenti sulle prop: su 7 delle 21 pagine ci sono sigle, date e nomi, **58** occorrenze in tutto — 42 su `data-table` (`M3bis.*`, `D17`, «rilievo di Francesco»), 7 su `app-shell`, 3 su `calendario`, 2 su `barra-contesto` e `form-field`, 1 su `confirm-dialog` e `foglio-gruppi`. Il gate non la legge (legge le story, non i sorgenti), il `grep` di M5.0e su `storybook-static/` sì. In carico a **M5.0e**.
8. **L'interruttore booleano della tabella delle prop era sotto soglia in chiaro.** La voce spenta di «False / True» Storybook la scrive col testo al 50% di opacità, fisso: **3.37:1** sul fondo dell'interruttore, 2 nodi su `data-table` e 1 su `calendario`, solo in chiaro. Le primitive non avevano prop booleane nella tabella, quindi M5.0b e M5.0c non l'avevano incontrato. Corretto in `.storybook/preview.css` con `--muted-foreground`, come la regola sul fondo del codice (§53): axe `color-contrast` torna a 0 su tutte e 42 le combinazioni.
9. **La riga di lavoro della `data-grid` resta segnata a fuoco fuori** (coda di M5.0d, su richiesta di Francesco). Il motore ricorda la cella attiva anche quando il fuoco esce, ma la segnava solo con `focus-visible`, che dopo un clic col puntatore non si accende e a fuoco uscito sparisce. Ora ogni cella della griglia porta `data-attiva`, e `<DataGrid>` segue dove sta il fuoco rispetto alla `<table>` (`focusin` più `focusout` riletto al giro dopo, perché il fuoco che finisce sul `body` non dà `focusin`), in tre stati: `"mai"` non segna niente — o la prima riga comparirebbe scelta su una pagina appena aperta —, `"dentro"` dà alla cella attiva l'anello pieno (`ring-2 ring-ring`) anche dopo un clic, `"fuori"` un bordo sottile (`ring-1 ring-muted-foreground`) e il fondo `bg-muted` sulla riga intera, con `tr:has([data-attiva])`. Misurato su `Computo`: all'apertura nessun segno; clic su una cella, anello `oklch(0.795 …)` da 2px; fuoco su «Aggiungi riga», anello `oklch(0.5222 …)` da 1px e la riga tinta; `Maiusc`+`Tab` rientra sulla stessa cella. La coppia `muted`/`muted-foreground` è già a 4.55:1 in `check:contrast`; axe `color-contrast` 0 in chiaro e in scuro a fuoco fuori. In scuro `bg-muted` si staccava appena dalla card (1.13:1) e, su richiesta di Francesco, è diventato `bg-border-strong/70`: **1.48:1** dalla card, testo a 9.85:1, testo attenuato a **4.86:1**. È il grigio più deciso del tema che tenga il testo attenuato sopra soglia: `border-strong` pieno darebbe 1.78:1 dalla card ma 4.03:1 al testo attenuato. Axe `color-contrast` 0 in scuro col nuovo fondo.
10. **Tre difetti della `data-grid` presi da Francesco provandola** (coda di M5.0d), tutti verificati in Chromium prima e dopo.
    - **Cliccando fuori la cella restava arancione.** `useFuocoCellaGriglia` riporta il fuoco sulla cella attiva quando lo trova sul `body`, per i casi in cui è la griglia a perderlo (un campo che si chiude, una riga smontata dal virtualizzatore); ma anche un clic fuori lascia il fuoco sul `body`, e il render che segnava la riga «fuori» se lo riprendeva. Ora `<DataGrid>` tiene `fuoriRef`, scritta prima di `setFuoco`, e la cella non si riprende il fuoco se è uscito. Misurato: clic fuori → bordo grigio e fuoco sul `body`, anche dopo il mouse sulle righe e la rotella; `Invio` e `Esc` in modifica e 40 `↓` di fila tengono il fuoco nella cella.
    - **Le cifre di un numero si spostavano aprendo la modifica.** Due cause sommate. Il riquadro della cella in vista era `w-full` con `-m-2`: a larghezza fissa il margine negativo lo spostava a sinistra invece di allargarlo, e il testo finiva 16px prima del campo in modifica (vista 1168px, campo 1184 sulla stessa cella). Tolto `w-full`: il riquadro copre la cella intera, bordo compreso. E nelle celle di valuta il campo perdeva « €»: ora il simbolo resta accanto al campo, fuori da ciò che si scrive. Misurato: «20,78 €» e «20.78» + « €» finiscono entrambi a 1184px; «196,87» e «196.87» a 1019.
    - **Serviva il doppio clic per modificare.** Ora il primo clic sceglie la cella e il secondo, sulla cella già scelta e con il fuoco nelle celle, apre la modifica; il doppio clic resta. Il `mousedown` che apre la modifica blocca l'azione predefinita: senza, il browser dava il fuoco al nodo appena sostituito dal campo, il fuoco finiva sul `body` e il campo si richiudeva subito — il primo tentativo, misurato, restava «ARANCIO» invece di «IN MODIFICA». Su una cella rimasta segnata dopo un clic fuori il primo clic la riprende soltanto.
11. **Nella `data-grid` i numeri si scrivono con la virgola anche in modifica** (Francesco, coda di M5.0d). Il dato resta col punto (`20.78`), che è ciò che `Number()` e Zod leggono; cambia solo la scrittura. Il motore accetta per colonna un `FormatoCellaGriglia` — `perScrivere` dal dato al campo, `interpreta` dal testo al dato — registrato da `colonnaNumeroGriglia` e `colonnaValutaGriglia` come il validatore, e lo usa in quattro punti: apertura del campo (`20.78` → `20,78`), conferma (validatore e scrittura sul testo interpretato), incolla (ogni valore interpretato per la sua colonna) e copia (il valore per scrivere, quindi con la virgola). La regola di lettura: con la virgola, i punti sono migliaia (`1.234,5` → `1234.5`); senza virgola, il punto è migliaia se raggruppa esattamente tre cifre (`1.234` → `1234`), altrimenti è il decimale di chi scrive o incolla all'inglese (`20.78`); spazi ed `€` si ignorano; un numero si riscrive in forma canonica (`3,` → `3`). L'errore a schermo si calcola sul testo interpretato, o `20,78` risulterebbe non valido mentre lo si scrive. Misurato in Chromium su `Computo`: il campo si apre con `20,78`; `1.234,5` → `1.234,50 €`; `12,5`, `20.78`, `1.234`, `12.345.678,9` in Quantità → `12,5`, `20,78`, `1.234`, `12.345.678,9`; `abc` e `-4,2` restano aperti con `aria-invalid` (il secondo per il validatore «maggiore di zero»); la copia di `3` dà `3`, e incollare `7,25⇥9,99` scrive `7,25` e `9,99 €`. **L'ambiguità resta, dichiarata**: `1.234` scritto intendendo un decimale all'inglese diventa milleduecentotrentaquattro — la convenzione italiana vince, e la vista lo mostra subito come `1.234`.
12. **La stessa scrittura dei numeri nel foglio a gruppi** (Francesco: «facciamo la stessa cosa nel foglio a gruppi»). Il foglio accettava già la virgola, perché la scena teneva i dati come stringhe con la virgola e li leggeva con `parseFloat(v.replace(',', '.'))`; ma il punto delle migliaia si leggeva come decimale — misurato: `1.234,5` nel prezzo diventava **`1,23 €`** — e in modifica il prezzo perdeva « €» e le cifre saltavano di 12px. La regola di §56.11 è salita in `lib/numeri` (`leggiNumero`, `scriviNumero`), dove la usano tutti e due i blocchi. `CellaScrivibile` del foglio riceve due campi facoltativi: `formato` (`perScrivere`, `interpreta`, come `FormatoCellaGriglia` della griglia) e `suffisso`, il testo fisso accanto al campo. La scena tiene ora i dati col punto (`'0.5'`), mostra le misure con `formattatore()` e il prezzo con `valuta()` e `suffisso: '\u00a0€'`, e il cassetto della faccia stretta scrive e rilegge con le stesse due funzioni. Misurato in Chromium: il prezzo si apre con `28,82` e il simbolo resta a 1127px in vista e in modifica; `1.234,5` → `1.234,50 €` e l'importo si ricalcola (25.443,05 €); in H/Peso `0,75` → `0,75`, `1.5` → `1,5`, `2.000` → `2.000`, `abc` resta aperto con `aria-invalid`; nel cassetto il parziale segue `0,75` mentre si scrive (7,50) e la riga dopo la conferma mostra `0,75`.
13. **La riga di lavoro resta segnata anche nel foglio a gruppi, e due difetti presi facendolo** (Francesco: «sì», alla proposta di portarla). Il foglio non segnava niente a fuoco fuori; ora ha lo stesso stato `"mai" | "dentro" | "fuori"` e le stesse classi della `data-grid` (§56.9), con `data-attiva` sulla cella a fuoco e sul bottone della riga delle azioni. Due cose trovate misurando, e corrette in **tutti e due** i blocchi:
    - **Un clic fuori mentre si scrive riportava il fuoco nella cella.** Il campo si chiude per il `blur`, e la cella si ridava il fuoco nel render stesso, prima che `focusout` fosse riletto al giro dopo. Il `focusout` del campo non basta a distinguere: **Chrome lo manda identico** — nodo ancora attaccato, nessuna destinazione — anche quando il campo si chiude da sé con `Invio` o `Esc`, dove il fuoco deve tornare alla cella (misurato col registro degli eventi: `INPUT connesso=true verso=null` in tutti e due i casi). Si usa quindi il **`pointerdown` fuori dalla tabella**, in cattura, che arriva prima del `blur`. Nel foglio anche il bottone «+ misurazione», che si riprende il fuoco a ogni render, ora non lo fa a fuoco uscito.
    - **`Home` e `Fine` in un campo in modifica facevano scorrere il contenitore.** Nella `data-grid` un `Fine` portava `scrollTop` da 0 a **21.601**: la riga in modifica usciva dalla finestra virtualizzata, veniva smontata col campo, e il fuoco finiva sul `body`, a modifica persa. Nel foglio la pagina scorreva di 103px e il cursore restava all'inizio. `capoDelCampo` li fa a mano (cursore al capo, `Maiusc` estende la selezione), con `preventDefault`; nella `data-grid` non sui campi data, che `Home`/`Fine` li usano per le parti della data.
    Misurato dopo: foglio, clic fuori scrivendo → la cella segnata grigia col valore confermato, fuoco sul `body`, `Tab` rientra su quella cella (nel foglio è il solo fermo della pagina di prova, v. §56.14); `Esc` e `Invio` tengono il fuoco nella cella; axe `color-contrast` 0 a fuoco fuori in chiaro e in scuro. Griglia, clic fuori scrivendo → valore confermato e cella segnata; `Fine` in modifica → `scrollTop` 0, fuoco nel campo.
14. **Tre rilievi di Francesco provando in Safari** (coda di M5.0d; le sette prove della lista di verifica le ha date buone, tranne la seconda).
    - **«Dopo il clic fuori, `Tab` rientra sulla cella» era scritto male.** Misurato in Chromium e in WebKit: dopo un clic fuori il `Tab` riparte dal punto del clic e segue l'ordine della pagina. Nel foglio la cella è il primo fermo e ci arriva subito; nella griglia di `Computo` prima vengono «Colonne», «Aggiungi riga» e le maniglie di ridimensionamento delle intestazioni (una per colonna), poi la cella segnata. Il comportamento è quello giusto — il `Tab` non si dirotta — ma la frase prometteva di più: le due pagine ora dicono che il `Tab` arriva alla griglia dopo i controlli che la precedono ed entra sulla cella segnata.
    - **Aprendo la modifica il testo scendeva di un pixel**, in tutte le colonne della griglia, e nella tendina dell'unità di misura si spostava anche di 8px a destra. Il campo stava direttamente nel `<td>`, centrato in altezza, mentre il testo della cella chiusa sta in cima al suo riquadro (`-m-2 min-h-9 p-2`). Ora il campo sta in `RiquadroModifica`, lo stesso riquadro, e il grilletto della tendina ne copia la misura. Misurato sui pixel del testo, a scala 2, in Chromium e WebKit: vista e modifica coincidono al mezzo pixel su codice, descrizione, U.M., quantità e prezzo (prima: +1px in basso ovunque, +8px a destra sull'U.M.).
    - **L'anello della cella attiva nell'ultima riga era tagliato nell'angolo** dal riquadro arrotondato della tabella (schermata). Sull'ultima riga, prima e ultima colonna, l'anello prende la stessa curva (`rounded-bl-lg`, `rounded-br-lg`): misurato in WebKit, raggio 10px e bordo intero.
    Resta un caso vicino, non segnalato: nel foglio la colonna «Designazione» mostra le misure rientrate e in corsivo (lo decide `mostra` della scena), e il campo in modifica no, quindi lì il testo si sposta di 16px a sinistra aprendo la modifica. **Chiuso in §56.15.**
15. **Nel foglio la cella aperta si legge come la chiusa, per ogni cella modificabile** (Francesco: «il testo deve essere uguale a quello con modifica non abilitata anche a livello di proprietà (corsivo) che posizione. Così per tutte le celle modificabili»). La causa era di forma: lo stile stava dentro `mostra` della scena (`<span className="pl-4 italic">`, `font-semibold`, il «SOMMANO» in una `flex`), e il campo in modifica non poteva saperlo. Ora `CellaScrivibile` dichiara lo stile invece di disegnarlo: `classiTesto` (va sul testo della cella chiusa **e** sul campo), `prefisso` (testo fisso davanti al valore, in tutte e due), `allineamento` della singola cella; `mostra` resta per formattare il valore. Cella chiusa e aperta hanno lo stesso riquadro (`riquadro`: `px-2 py-1`, l'altezza di riga, `justify-end` a destra), e il campo ha `p-0` e le classi del valore; con un prefisso e il valore a destra il campo è `field-sizing-content`, largo quanto il testo. Misurato sui pixel del testo a scala 2, in Chromium e WebKit, su otto celle — designazione della voce (grassetto), della misura (corsivo e rientro), «SOMMANO m²», quattro misure e il prezzo: sette identiche al mezzo pixel, con lo stesso stile calcolato sul campo (`italic/400`, `normal/600`); il prezzo differisce di **mezzo pixel** in orizzontale, perché «28,82 €» in vista è una stringa sola e in modifica sono il campo e il simbolo accanto. Nella `data-grid` le celle non hanno uno stile proprio, e la misura di §56.14 le dà già identiche.
16. **Nella `data-grid` le maniglie delle colonne escono dall'ordine di `Tab`** (Francesco, provato in Chrome e Safari: «non mi interessa passare fra le maniglie delle colonne premendo tab»). Prima, da «Aggiungi riga» alla cella segnata c'erano cinque fermi, uno per maniglia. Ora la griglia passa a `DataTable` `internoGriglia.maniglieFuoriDalTab`, e `ManigliaRidimensiona` ha `tabIndex={-1}`: si trascinano ancora col puntatore. La loro via da tastiera, che non si toglie — la tastiera per il ridimensionamento era un requisito (il «quarto costo» di D17) —, passa dalla cella: **`Alt`+`←`/`→`** restringe o allarga di 16px la colonna della cella attiva, con gli stessi limiti della maniglia (`minSize`, `maxSize`); il motore lo riceve con `registraRidimensiona`, e `<DataGrid>` tiene l'istanza da `onTabellaPronta` (componendo quella della pagina, se c'è). Misurato in Chromium e WebKit: `Tab` da sopra la griglia → «Colonne» → «Aggiungi riga» → la cella segnata; maniglie `tabIndex` -1 su cinque; su «Descrizione», che prende lo spazio che avanza, la cella passa da 620 a 643px con due `Alt`+`→` e a 632 con un `Alt`+`←` (lo scarto dai 16px è la ridistribuzione della larghezza residua, come con la maniglia). In `tassullo-data-table`, fuori dalla griglia, le maniglie restano fermi di `Tab`: lì non c'è una cella attiva da cui comandarle.
17. **Le maniglie di ridimensionamento escono dal `Tab` in ogni tabella** (Francesco: «le maniglie le togliamo ovunque dal ciclo dei tab»). `ManigliaRidimensiona` ha sempre `tabIndex={-1}`, e l'opzione `internoGriglia.maniglieFuoriDalTab` di §56.16 è tolta perché non serve più. La tastiera non si perde — era il «quarto costo» di D17 —: in `tassullo-data-table` `Alt`+`←`/`→` su qualunque controllo dell'intestazione (il bottone che ordina, il grilletto «⋮», la maniglia di riordino) restringe o allarga la colonna di 16px entro `minSize`/`maxSize`; nella `data-grid` resta `Alt`+`←`/`→` dalla cella. Misurato in Chromium e WebKit su `Data Table → Ridimensionabile`: il `Tab` va da un bottone d'ordinamento al successivo senza fermarsi sulle maniglie (tutte e cinque `tabIndex` -1); sulla colonna «Codice», `Alt`+`→` la porta da 224 a 244px e due `Alt`+`←` a 202. Il tasto `Home` della maniglia (torna alla larghezza di partenza) resta solo per chi ci arriva col puntatore.

## 57. Quello che il sito costruito ha mostrato, e le pagine modello (M5.0e, 2026-09-23)

M5.0e ha riscritto le dieci pagine di `Pagine/` e armato `check:storybook`. Il `grep` dei token vietati sul sito costruito (`storybook-static/`) ha trovato **tre fonti di testo visibile che il gate non leggeva**, e due guasti del sito pubblicato. Qui i fatti, verificati in Chromium e WebKit (Playwright dalla cartella temporanea, sullo Storybook costruito servito in HTTP).

1. **La tabella delle prop mostra i JSDoc dei sorgenti, e Storybook li scrive nel JavaScript anche dove la tabella non c'è.** Il plugin `react-docgen` di `@storybook/react-vite` gira su **ogni** `.tsx` del bundle e appende a ogni componente esportato un `__docgenInfo` con la descrizione del componente e di ogni prop. Misurato con react-docgen stesso (stesso risolutore, `FindExportedDefinitionsResolver`): **94** occorrenze vietate in 14 sorgenti, 55 in `data-table.tsx` — 75 nei JSDoc delle prop, 19 nelle descrizioni di componente (anche di componenti che nessuna pagina mostra, come `SelettoreContesto` o `DataTableVirtualizedBody`). **Strada scelta da Francesco: separare.** Il `/** */` resta la frase per chi usa la prop — la stessa che l'editor dell'app mostra al passaggio —, e la nota interna diventa un blocco `//` **sopra** il JSDoc, dove react-docgen non guarda: `getDocblock` prende solo i `CommentBlock` che cominciano con `*`. Le note sono state trasformate in `//` parola per parola, niente di perso.
2. **Il tipo di una prop entra nella tabella col suo testo sorgente, commenti compresi — anche i `//`.** Se una prop ha per tipo un oggetto dichiarato a parte (`utenti: SezioneUtentiAdmin`, `percorso: LivelloPercorso[]`, `motore: MotoreFoglioGruppi`), `tsType.raw` porta il corpo intero del tipo: la nota separata al punto 1 su `RuoloAssegnabile.etichetta` ricompariva così nel bundle di `pagina-admin`. Dentro un tipo annidato la nota va **sopra la dichiarazione del tipo**, fuori dalle graffe. Nella colonna «tipo» il testo resta codice, `/**` compreso: non è markdown non reso.
3. **I commenti dentro l'oggetto di una story si leggono sotto «Show code».** Il plugin CSF pubblica il sorgente di ogni `export const <Nome>` come `parameters.docs.source.originalSource`, e la pagina Docs lo mostra così com'è. Misurato: **18** occorrenze vietate in 8 file, su 110 commenti scritti dentro le story. Riscritti i commenti, lasciato il codice.
4. **Il gate le legge tutte e tre.** `check:storybook` ha ora le fonti (e) — le descrizioni e i tipi che react-docgen estrae da `registry/tassullo/` e `.storybook/prove/` — e (f) — i commenti dentro le story. react-docgen è `devDependency` (8.0.4, la stessa che Storybook usa, deduplicata). **Un guasto preso scrivendolo**: con un importatore che lanciava un errore generico sui pacchetti esterni, react-docgen falliva su ogni file e il gate diceva **0 su tutto** — sembrava pulito. Ora un modulo non risolto lancia con `code: "MODULE_NOT_FOUND"`, che react-docgen salta, e ogni altro errore si fa vedere; l'autotest ha una prova apposta (un sorgente con la nota nel JSDoc di una prop → 3). Sulla versione di partenza il gate conta **204** (110 nelle story + 94 nei sorgenti); a fine sessione 0, in 2,3 secondi.
5. **Il `grep` ingenuo del piano dava falsi positivi sui tracciati SVG.** `M[0-9]\.[0-9]` prende `M3.59 3.59A…` e `M11.5.003h-6…` in `sb-manager` e nelle icone. L'espressione usata: una sigla seguita da una coordinata — spazio, virgola o punto facoltativi, poi una cifra — è un tracciato: `\bM[0-9]+(?:bis|ter)?\.[0-9]+[a-z]?\b(?![ ,.]?-?[0-9])`, con `perl` perché il `grep` di macOS non ha i lookahead. Una sigla vera seguita da un numero dopo la virgola e lo spazio («M2.9, 868 scansioni») resta presa.
6. **`storybook-static/` conteneva `public/` per intero.** `r/` e `fonts/` non venivano da `staticDirs` ma da Vite, che copia la sua `publicDir` (`public/`, la radice del workbench). Su Pages questo pubblicava una **terza copia del registry** (`/r/registry.json`, 200), e in una build locale anche i `.otf` di fonderia di `public/fonts/`, che nel repo non entrano. Tolta con `viteFinal: publicDir: false` in `.storybook/main.ts`; le immagini d'esempio, le sole cose di `public/` che le story usano, arrivano già da `staticDirs`. `tema/` ora serve il solo `inter.css`, l'unico file che il manager legge, invece di tutta la cartella del tema (col marchio e la sua nota di provenienza).
7. **Su Pages il carattere del manager e le immagini d'esempio puntavano alla radice del dominio.** La style guide sta sotto `/tassullo-design-system-v2/`, e `@import url("/tema/inter.css")` in `manager-head.html` e le `src="/esempi/…"` delle story andavano a `tassullo.github.io/tema/…`: **404**, misurato con `curl` (`/tassullo-design-system-v2/tema/inter.css` 200, `/tema/inter.css` 404; lo stesso per `sistema-cappotto.png`). Resi relativi: `tema/inter.css`, `esempi/…`. Valgono in locale e su Pages.
8. **Cosa il `grep` non guarda, e perché.** `tema/` ed `esempi/` sono cartelle di risorse, non pagine: il CSS del carattere, identico byte per byte al file del registry (i suoi commenti di testa sono quelli che riceve chi installa `tema-font`), e le immagini d'esempio col loro `LEGGIMI.md` per chi le mantiene. Nessuna pagina della style guide le mostra come testo. Il resto di `storybook-static/` — `assets/`, `sb-*`, `index.html`, `iframe.html`, `index.json` — è ciò che il browser del visitatore carica, e lì il `grep` dà **0 file**. Una passata con **tutte** le regole del gate sul JavaScript costruito trova solo falsi positivi (date di revisione nei dati, `D6` in un nome di file con hash, `check:` di zod) e la chiave `_nota` di `manager-palette.json`, che è una stringa di codice e non si mostra.
9. **`Pagine/Lista a due facce`, le larghezze.** Con nove colonne alle larghezze dichiarate la tabella è intera da **1160px** di riquadro in su (misura di M4ter.6). In finestra sono **1450px** col guscio aperto (1160 + 256 di colonna + 34 di padding e bordi) e **1242px** col guscio chiuso a icone: su un portatile da 1440 la tabella scorre di una decina di pixel, e chiudendo la colonna è intera. La pagina ora dice solo i 1160px; i due numeri di finestra stanno qui.
10. **La scena `Soglia della pagina` cambia forma anche con l'interruttore Viewport**, se aperta da sola (conferma di §56.6): misurato su `Pagine/Lista`, `Pagine/Prodotti` e `Pagine/Lista a due facce`, in Chromium e WebKit, a finestra 1440 la tabella, a 800 le schede, e col Viewport «Telefono» dal manager le schede. Le pagine lo scrivono come «si vede aprendo la scena da sola e stringendo la finestra, o con l'interruttore Viewport».
11. **`Pagine/Prodotti`: «Elimina» chiedeva conferma e poi offriva l'annullo.** Il testo del dialogo diceva «non si possono recuperare» e subito dopo l'avviso con «Annulla» rimetteva la riga, cioè il contrario della regola scritta nelle pagine di `confirm-dialog` e `toast-con-annullo` («mai tutti e due per la stessa azione»). **Deciso con Francesco: solo la conferma**, perché eliminare un prodotto non si disfa. Tolti dalla scena `toastConAnnullo` e il `<Toaster />`.
12. **I nomi nei dati d'esempio sono inventati**, uno fisso per persona: Stefano Bertolini (`sbertolini@esempio.it`, iniziali SB), Giorgio Pedrotti, Elisa Fontana, Davide Tomasi, Anna Moretti, Nicola Ferrari, Laura Zeni. Il dominio è `esempio.it`, lo stesso che `pagina-login` usava già come segnaposto; «Covi Costruzioni S.r.l.» è diventata «Impresa Esempio S.r.l.». «Mario Rossi» e «Maria Rossi» restano: sono i segnaposto per antonomasia. Decisione di Francesco: anche le persone oltre alle due del piano, e anche il dominio.
13. **`entity-image` mostra l'immagine intera di default** (Francesco, guardando `Primitive/EntityImage → Rapporti`: a `16:9` il sacco perdeva il nome). La prop nuova `adatta`: `"intera"`, il predefinito, dà `object-contain` — l'immagine si scala finché ci sta tutta, e attorno resta la superficie, perché il componente non dipinge un fondo —; `"riempi"` è l'`object-cover` di prima, per le fotografie con uno sfondo proprio, dove una banda vuota si vedrebbe. Scelta fra tre strade proposte; il default va sui soggetti scontornati perché tutta la libreria Tassullo lo è. Misurato in Chromium e WebKit: `Rapporti` tre `contain` (213×160, 213×120, 213×213 su una sorgente 640×640), `Fotografia` un `cover` e un `contain` sulla stessa foto 900×436. Nuova scena `Fotografia`: `test:a11y` passa a **386 story**. `registry/componenti-propri.json` aggiornato nella descrizione.
14. **L'anello del fuoco delle schede della faccia stretta si vedeva come una riga arancione** fra lo stato e il pannello (Francesco, in Safari). Il grilletto disegnava l'anello **fuori** dal bottone (`ring-2`, un `box-shadow`) dentro una `Card` che ritaglia (`overflow-hidden`): restava il solo lato di sotto, sopra il bordo del pannello aperto. Ora è **dentro** il bottone (`ring-inset`), con la curva della card (`rounded-xl`, e `data-[panel-open]:rounded-b-none` a pannello aperto), nelle tre pagine che hanno le schede (`Lista`, `Prodotti`, `Lista a due facce`). Visto in Chromium e WebKit, in chiaro e in scuro: l'anello intero attorno alla parte che si clicca.
15. **Le foto del parco macchine sono macchinari veri**, da Wikimedia Commons (Francesco: «cerca tu immagini di macchinari simili»). Otto fotografie a licenza libera — CC BY-SA, CC0, uso libero —, scaricate ridotte e riportate a 640px sul lato lungo con `sips`, 863 KB in tutto; autori, pagine d'origine e licenze in `public/esempi/LEGGIMI.md`, e un rimando in `README.md` §Licenze, perché fanno eccezione ai diritti riservati. Nelle miniature quadrate prendono `adatta="riempi"`. Le caselle vuote della prima schermata di Francesco **non** erano una pagina rimasta aperta, come avevo scritto: vedi il punto 16.
16. **In WebKit, dentro una cella di tabella, la foto di `entity-image` restava alta quanto il file.** Francesco, in Safari, con le foto nuove: nelle miniature del parco macchine si vedevano cielo e finestre. Misurato: in Chromium l'`<img>` è 48×48, in WebKit **48×640** — il riquadro prende l'altezza da `aspect-ratio`, e WebKit non risolve su quell'altezza l'`height: 100%` (`size-full`) dei figli quando il riquadro sta in una cella di tabella; `overflow-hidden` mostrava così la sola striscia in cima. Nella scena di `Primitive/EntityImage`, fuori da una tabella, WebKit era giusto, ed è lì che l'avevo misurato. Era anche la causa delle **caselle vuote** della sua prima schermata: la striscia in cima dei render scontornati è trasparente. Io l'avevo attribuita a una pagina rimasta aperta, misurando in Chromium soltanto: sbagliato, e la lezione è la solita — una prova in un motore solo non dice niente sull'altro. Correzione dentro il componente: l'`Avatar` interno è `absolute inset-0` invece di `size-full`, e un figlio assoluto ha l'altezza del riquadro in ogni motore. Misurato dopo, su dieci scene che usano `entity-image` (le sette della primitiva, due di `Lista a due facce`, `Scelta da catalogo`): **47 riquadri, foto o segnaposto della stessa misura del riquadro, in Chromium e in WebKit**.

## 58. `shadcn add` toglie i commenti di testa, e il testo che arriva a chi installa (M5.1a, 2026-09-23)

**La misura.** Installando con la CLI del lockfile (`shadcn` 4.21.0) in un'app Vite di prova, `rsc: false`:

| file | commenti di testa (prima della prima istruzione o regola) | commenti nel corpo |
|---|---|---|
| `.ts`, `.tsx` — `registry:ui`, `registry:lib`, `registry:hook`, `registry:component` | **tolti, tutti** | arrivano |
| `.css` `registry:theme` | **tolti, tutti** | arrivano |
| `.css` / `.txt` `registry:file` | arrivano | arrivano |

Provato su un item finto con due commenti di testa (`/* */` e `/** */`), due `//`, un commento nel corpo e uno in coda, e sugli item veri `tema` e `stepper`: in `tassullo-theme.css` spariscono 40 righe, cioè le due teste intere; in `stepper.tsx` sparisce l'intestazione SPDX di ReUI. Non lo fa `shadcn build` — l'artefatto in `public/r/` le ha — ma `add`.

**Rettifica a §11.** Là si era misurato «379 righe in casa, 357 nell'app» e se ne era dedotto che cadesse il *primo* commento. Il blocco pensato per viaggiare — come si installa, la palette di `shadcn init` che vince, le due trappole di `--primary` — **non arrivava**. Lo stesso per `inter.css` e `tassullo-logo.css`. Rimedio: le istruzioni stanno ora **dentro la prima regola** (`:root, .light {`, la prima `@font-face`, `@layer components {`), dove un commento arriva; in testa restano le sole note di repo. Verificato reinstallando: le tre arrivano, le note di repo no.

**Il gate che ne viene: `check:spedito`** (il decimo). Legge l'artefatto `public/r/` e controlla, con le regole di `check:storybook` — condivise in `scripts/note-interne.ts` —, `title`, `description` e `docs` di ogni item e il testo di ogni file spedito **tolte le teste che la CLI toglie**: commenti, testo JSX, stringhe. Le teste restano note per chi lavora nel repo. La premessa si rimisura **a ogni giro**: il gate installa un item finto con la CLI del lockfile in una cartella temporanea (circa un secondo) e fallisce se le teste cominciano ad arrivare — allora si leggono anche quelle — o se smettono di arrivare quelle dei `registry:file`. `baseColor: ""` nel `components.json` di prova serve a non toccare la rete: con un colore di base la CLI scarica `ui.shadcn.com/r/colors/<colore>.json` (provato con un proxy morto).

Scelta di Francesco fra le due strade: il gate guarda **solo ciò che arriva**, non tutto il testo del file. Per l'app le due sono identiche — la testa non arriva comunque —; cambia solo per chi lavora qui, dove le sigle nelle teste servono. In compenso, in M5.1b/c si verifica blocco per blocco che ciò che serve a **usare** un componente stia nel campo `docs` (che la CLI stampa a fine installazione) e non solo nella testa.

**L'intestazione MIT dei file ReUI** non arriva nell'app. Arriva però `tassullo-reui-MIT.txt` (`registry:file`), col testo della licenza e l'avviso di copyright: la condizione della MIT resta soddisfatta dal file che accompagna i sorgenti.

**Un'ottava regola**, comune ai due gate: «la regola 3», «regola 4bis, gradino 2» rimandano al `CLAUDE.md` del repo, che fuori non esiste. Si scrive la regola, non il suo numero.

**Le dipendenze.** `check:riferimenti` controlla ora anche gli **import** di ogni file spedito: un pacchetto npm dev'essere fra le `dependencies` dell'item o di un item della chiusura dei suoi `registryDependencies` — la chiusura è ciò che il tentativo di M4ter.10 non guardava, e da cui veniva il suo falso positivo —; un modulo del registry (`@/…` o relativo) deve appartenere a un item della chiusura. `react` e `react-dom` non si dichiarano. Gli import si leggono con `ts.preProcessFile`. Due difetti veri alla prima passata: `tassullo-pagina-errore` importava `lib/toni` senza `@tassullo/toni`, e `tassullo-data-table-filtro-data` importava `./data-table-filtro-sfaccettato` — a runtime, non solo i tipi — senza dichiararlo. In un'app, tutti e due: `add` riesce, la compilazione no.

**Rettifica di M5.1b: i commenti JSX.** Il gate non leggeva i `{/* … */}`: un'espressione JSX vuota non ha nodi, e il commento fra le due graffe non sta davanti a nessuno, quindi la lettura dei commenti «davanti a ogni nodo» lo saltava. Arrivano all'app come ogni altro commento nel corpo. Corretto leggendo dalla graffa aperta (e dopo l'espressione, se c'è), con una prova in più nell'autotest; senza la correzione l'autotest esce con 1. Alla prima passata: 24 note in più, di cui 13 in sei file di M5.1c (tetti alzati al conto vero), 9 nella famiglia della tabella e 2 in file che l'elenco dava per puliti (`ui/entity-image.tsx`, `pages/pagina-scheda.tsx`).

## 59. La Viewport nella pagina Docs: un riquadro che è una finestra (2026-09-24)

**Il difetto.** Nella pagina Docs le scene rendono dentro la pagina, e la finestra che vedono è quella della pagina, larga quanto lo schermo. Una media query, `useIsMobile` o `useSoglia` scelgono quindi la forma della scrivania anche con il telefono scelto nella barra o dichiarato dalla scena: il selettore Viewport ridimensiona l'iframe solo nella vista della scena da sola, e la pagina Docs lo ignora. Visto da Francesco su `Blocchi/App shell → Telefono`, che in Docs mostrava la colonna, e su `Blocchi/Foglio a gruppi` con la Viewport a 375. È la stessa famiglia di §46, sul lato della documentazione invece che del gate.

**Il rimedio: `withFinestraDocs`** (`.storybook/prove/finestra.tsx`), l'ultimo decoratore del `preview`. Solo con `viewMode === 'docs'`, legge il global `viewport` — della barra, o quello che la scena dichiara coi propri `globals` — e se la misura è più stretta della scrivania (1440) sostituisce la scena con un `<iframe>` di `iframe.html?id=<scena>&viewMode=story`, largo quanto la misura. Per la scena interna quella è la finestra vera: misurato, `innerWidth` 375 in tutte le pagine toccate. Il bordo sta dentro la larghezza dell'elemento, quindi l'iframe è largo due pixel in più (prima misura: 373). Modalità, densità e superficie passano nell'indirizzo. La misura si legge dalle `options` del `viewport` o, se scritta a mano, da `larghezza-altezza` (`375-413`).

**L'altezza.** Un guscio (`layout: 'fullscreen'`) e una scena con un popup (`play`) tengono l'altezza del telefono: il guscio riempie lo schermo, e il popup sta in un portale a posizione fissa, fuori dal corpo della pagina (misurato: il cassetto dava un riquadro alto 98px). Le altre scene prendono l'altezza del **corpo** della pagina interna, osservato con un `ResizeObserver`: non del documento, la cui altezza non scende mai sotto quella della finestra (misurato: tutte a 814).

**Le scene che mostrano la forma del telefono lo dichiarano** con `globals: { viewport: { value: 'telefono' } }`: `App shell → Telefono`, `Sidebar → Telefono`, `Foglio a gruppi → Due facce`, `Lista → Faccia stretta`, `Lista a due facce → Faccia stretta` (che prima simulava il telefono con un riquadro da 360px), `Prodotti → Faccia stretta`, `Dashboard → Attività, faccia stretta`, `Dialogo adattivo → Cassetto`. Le ultime quattro fissano la forma con una prop (`faccia`, `forma`): in Docs erano giuste nella forma, ma alla larghezza della pagina.

**Il gate non cambia.** `test:a11y` e `misura:bersagli` aprono le scene per URL, fuori dalla pagina Docs, dove il decoratore non fa niente; e lì, come dice §46, il global `viewport` non cambia la finestra.

## 60. Agganciare un'app nuova: cosa la prova da zero ha accertato (M5.2 + M5.3, 2026-09-24)

`docs/INTEGRAZIONE.md` è stato collaudato seguendolo e basta, da una cartella vuota, con la scorciatoia `tassullo/tassullo-design-system-v2/<item>` su `main` e la CLI `shadcn@latest` (4.21.0). Quattro fatti nuovi, che il documento ora dice e che vanno ricordati alla prossima versione della CLI.

- **`init` scrive già `"registries": {}`** in fondo a `components.json`. «Aggiungere il campo» produrrebbe una chiave doppia: il registry `@tassullo` si scrive **dentro** quel campo.
- **`add` di un item `registry:theme` chiede conferma** («You are about to install a new theme… Continue? y/N»), anche su un'app appena nata. `< /dev/null` lo fa terminare senza installare e senza errore: in uno script serve `yes y |`. Il secondo `add` che porta il tema come dipendenza non chiede niente, perché i file sono identici.
- **La palette di partenza da togliere è di quattro pezzi, non di due.** Il `docs` di `tema` (e il commento nella prima regola di `tassullo-theme.css`) diceva «il blocco `:root`/`.dark`, e le righe `--color-*` di `@theme inline`»: ma quell'`@theme inline` dichiara anche `--font-sans: 'Geist Variable'`, e sta dopo gli `@import` del tema, quindi seguendo alla lettera il carattere resterebbe Geist. Controllato che **ogni** variabile dell'`@theme inline` di `init` sia ridichiarata dal tema: nessuna manca, il blocco si toglie intero. Corretti il `docs` e lo script che genera il tema.
- **`vite.config.ts` usa `import.meta.dirname`, non `__dirname`.** Vite 8 compila la configurazione con `__dirname`, ma avvisa che il caricatore nativo, destinato a diventare il predefinito, non lo supporta. `import.meta.dirname` passa `tsc -b` coi tipi di Node del template.

**Il pin di versione funziona con la scorciatoia**: `…/button#<sha>` installa quella versione, un'etichetta che non esiste fallisce. Il pin va scritto in **due** posti allineati — il `#` nell'`add` e il ramo nell'URL di `components.json` —, perché il primo vale solo per l'item chiesto per nome e le dipendenze passano dal secondo. Il tag `v2.0.0` non esiste ancora (M5.6): il documento dice come si fissa e usa `main`.

**La ricetta dell'identità diversa è provata**, non solo scritta: ridefinendo `--primary` e `--sidebar-primary` in `:root` e `.dark` dopo gli `@import`, il bottone primario prende il colore nuovo in chiaro, in scuro e in touch.

## 61. Perché il v2 è fatto così: le cinque scelte che un'app eredita (M5.4, 2026-09-24)

Sintesi, non accertamento nuovo: le ragioni sono già scritte, sparse fra il piano e questo file, e qui si raccolgono con i rimandi. Serve a chi arriva da un'app e si chiede perché le regole del suo `CLAUDE.md` (il blocco di `docs/INTEGRAZIONE.md`, «Regole da inserire…») sono quelle.

**Perché non un pacchetto npm.** Il v1 era un pacchetto (`@tassullo/theme`, installato da GitHub con npm) e distribuiva **classi**, non componenti: ogni app riscriveva la logica di un dialogo, di una tabella ordinabile, di un select accessibile, e l'accessibilità non la garantiva nessuno (`PIANO.md` §0, i due limiti strutturali). shadcn è un **sistema di distribuzione di codice sorgente**: la CLI copia i file nell'app, che vede il codice che esegue. E combacia col vincolo che il v1 aveva già: **repo GitHub = registry**, senza server, senza pubblicazione su npm, senza token nelle CI — possibile perché il repo è pubblico (D4, `PIANO.md` §4) —, con la versione fissata da un'etichetta git. Il prezzo è che un componente copiato **non si aggiorna da solo**: è la ragione della regola «si ri-stilano solo le stringhe di classi» e del gate di aggiornabilità (`CLAUDE.md` 4bis, §19 e §23 qui), e, dal lato dell'app, della regola «non si modifica in casa» — l'aggiornamento è un `add --overwrite`, che riscrive senza chiedere niente, salvo la conferma del tema quando lo si chiede per nome (misurato in M5.4: quattro file modificati a mano — una primitiva, un blocco, la pagina, il tema — tornano all'originale reinstallando la sola pagina).

**Perché Base UI.** shadcn offre ogni primitiva in tre implementazioni parallele — Base UI, React Aria, Radix —, e mischiarle vorrebbe dire tre modelli di fuoco e tre insiemi di difetti nella stessa libreria. Base UI è la direzione di shadcn stesso ed è fatta dagli autori di Radix; React Aria è superiore su accessibilità e lingue ma più verbosa su ogni componente (D9, `PIANO.md` §0bis). La scelta **non è disciplina da ricordare**: è il campo `"style": "base-nova"` di `components.json`, scritto da `init --base base` e letto da ogni `add` (§1). Per questo la regola dell'app è una sola riga: quel campo non si cambia.

**Perché `primary` ≠ `accent`.** È la convenzione di shadcn, e la si segue per funzione e non per nome: `--primary` è il colore dell'azione principale, `--accent` il fondo tenue dell'hover nei menu. Nel v1 `--color-accent` **era** il brand, e tradurre il nome invece della funzione tingerebbe d'arancio metà degli hover (`PIANO.md` §2bis, «Le due trappole»). Con la stessa logica l'arancio **non si usa per il testo** — `text-primary` sul chiaro fa 1.79:1 —, e c'è un token a parte, `--accent-ink`, che coincide con `--primary` sullo scuro ed è leggibile in entrambe le modalità; e `--destructive` è un colore da fondo, con il testo d'errore affidato alla variante dei componenti (`CLAUDE.md`, §Le due trappole).

**Perché oklch.** Anzitutto perché è la forma dei token di shadcn con Tailwind v4 (`PIANO.md` §0bis): stare fuori dalla convenzione vorrebbe dire convertire a ogni aggiornamento. Ma rende anche, in pratica, due cose che in esadecimale non si fanno. La luminosità `L` di oklch è **percettiva**, quindi una correzione di contrasto è prevedibile e piccola: le tre coppie sotto soglia di M1.1 sono passate abbassando `L` di **0,006**, a occhio invisibile (`PIANO.md` §2bis, «Cinque rilievi»); e un colore mancante si **deriva** invece di inventarlo — `--info-border` è la media della banda dei bordi tenui alla tinta di `--info-subtle`, ricalcolata a ogni esecuzione (`PIANO.md` §2bis). La conversione non si fa a mano: la palette sta in esadecimale in una sola costante di `scripts/hex-to-oklch.ts`, il CSS del tema è il suo output e porta l'esadecimale in commento accanto a ogni valore, e lo stesso script è il gate di contrasto. Due costi, già noti: il browser restituisce i colori risolti in oklch, e una misura di contrasto va fatta risolvere al motore di resa (`CLAUDE.md`, «Due avvertenze di strumento»); e dove uno strumento non accetta oklch — il tema della cornice di Storybook — gli esadecimali sono generati, mai scritti (§53).

**Perché Inter viaggia dentro il tema, in data URI.** Inter e non Replica perché Replica non ha i pesi 500 e 600, e quattro gradini scritti ne renderebbero due (§14). Dentro il registry perché la licenza OFL lo permette e perché servirlo da Google manderebbe l'indirizzo di ogni visitatore a un terzo (§15, che chiude D3). In **data URI** perché il registry trasporta solo testo: un `.woff2` dichiarato come file arriva corrotto senza nessun errore, mentre in base64 arriva identico byte per byte, e un solo `add @tassullo/tema` porta tema, carattere e licenza (§15). Il tema stesso viaggia **come file intero** e non come variabili, perché `cssVars.theme` scriverebbe in `@theme inline` e spegnerebbe la densità (§11).

## 62. I codici in tabella stanno nel colore del testo, e `--accent-ink` si scurisce per la riga selezionata (2026-09-24)

**Decisa da Francesco**, guardando quattro varianti rese sulla stessa `DataTable`, in chiaro e in scuro, con una riga selezionata.

### I codici in tabella

La regola scritta fino a qui (§48, `Tema/Cifre` §3, il blocco per il `CLAUDE.md` delle app) diceva: codici in `text-sm text-muted-foreground`, perché «un identificativo non deve pesare quanto la voce che identifica». Le tabelle del design system però non la seguivano: in `Blocchi/Data Table`, `Pagine/Lista` e `Pagine/Prodotti` il codice era nel colore del testo, oppure un collegamento. Lo ha fatto notare la terza rilettura del blocco di M5.4. Le varianti messe a confronto:

| | codice della riga | codici secondari (BC) |
|---|---|---|
| **A** | colore del testo | colore del testo |
| B | tenue | tenue |
| C | colore del testo | tenue |
| D | collegamento | tenue |

**Scelta: A.** Se la riga apre una pagina, il collegamento sta su **una** colonna, il codice o il nome secondo la pagina, come `Button variant="link"` col `render` del collegamento. Sono le due forme che `Pagine/Lista` e `Pagine/Prodotti` avevano già. Fuori dalle tabelle la regola di §48 resta: un codice accanto a un nome prende `text-sm text-muted-foreground`. La ragione pratica di A: in un elenco il codice è spesso proprio la colonna che si cerca a occhio, e in grigio si trova peggio. Il grigio tenue su una riga selezionata stava a **4,55:1**, sulla soglia.

Cambiati: il blocco in `docs/INTEGRAZIONE.md`, la regola nella story di `Blocchi/Data Table`, `Tema/Cifre` §3 (tabella, testo e sorgente d'esempio), `CLAUDE.md`. Nessun componente.

### Il difetto trovato preparando gli esempi

Il collegamento (`text-accent-ink`) su una riga **selezionata** in chiaro faceva **4,30:1**: `--accent-ink` #B25105 su `--muted` #ECEAE8, lo sfondo che `ui/table.tsx` dà a `data-[state=selected]`. Era **latente**: le pagine modello col collegamento (`Pagine/Lista`, `Pagine/Prodotti`) non hanno la selezione, e la story con la selezione (`Blocchi/Data Table`) non ha collegamenti. Sarebbe comparso nella prima tabella di un'app che mette insieme le due cose, che è una combinazione normale. Nessun gate lo vedeva: `check:contrast` non aveva la coppia `muted`/`accent-ink`, e `test:a11y` apre le scene senza selezionare righe. Il passaggio del mouse (`bg-muted/50`) invece passava, a 4,67:1.

Le strade misurate:

| strada | riga selezionata | selezione contro card |
|---|---|---|
| oggi | 4,30:1 ✗ | 1,18 |
| **1. `--accent-ink` a #AD4C00 (L −0,015)** | **4,59:1** | 1,18 |
| 2. selezione su `primary-subtle` | 4,57:1 | 1,11 |
| 3. selezione su `muted` al 60% | 4,61:1 | 1,10, quasi uguale all'hover (50%) |

**Scelta: 1.** Ripara la coppia di token dovunque l'arancio stia sul grigio, non solo nelle tabelle, e non cambia l'aspetto di nessun componente. È la stessa mossa di M1.1, dove le tre coppie sotto soglia erano passate con una riduzione di `L` di 0,006. La coppia entra in `check:contrast` («link su riga selezionata»), che passa a **25 coppie per modalità, 50 in tutto**. Effetto sulle altre coppie: `primary-subtle` 4,57 → 4,89, `background` 4,77 → 5,09, `card` 5,07 → 5,42. In scuro `--accent-ink` non cambia (#F4AC3D, 7,79:1 sulla riga selezionata).
