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

**La seconda leva è la tipografia, e serviva perché `--spacing` non la tocca.** In touch la scala sale di **×1.08 arrotondato al pixel**: 11→12, 12→13, 13→14, 14→15, 15→16, 18→19, 26→28. Il fattore non è scelto a occhio — è quello che riproduce il passo del v1, che in touch alzava il testo del bottone di **un gradino** della scala (`--text-md` 13px → `--text-base` 14px). Applicato all'intera scala dà esattamente «il gradino successivo» dove i gradini distano 1px, e prosegue con la stessa proporzione sui titoli, dove i gradini sono più larghi e uno scatto secco romperebbe la gerarchia. Non ×1.5 come i bersagli: un bersaglio deve crescere del 50% per stare sotto un dito guantato, un testo a 13px è già leggibile e portarlo a 20px non lo migliora — rompe le colonne.

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

**`--chart-mono-1..5`** (M2.8, secondo giro). Sono **gli stessi cinque pioli** della scala categorica, tutti alla tinta dell'arancio del brand: `deriveMono` chiama `serieAlPiolo(primary, piolo)` sulle stesse altezze che usa `deriveSerie`. Non è una seconda palette da mantenere — è la stessa scala guardata a tinta unita — e per costruzione eredita il passo in grigio, quindi passa gli stessi quattro controlli senza che si debba verificare niente di nuovo (misurato comunque: passo 1.490–1.501, ΔE minimo **9.0** sotto tritanopia).

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
