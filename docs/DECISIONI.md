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

`tassullo.it` dichiara Replicall in **300 Light, 400 Regular, 700 Bold** — `.otf` dal CDN Webflow (`ReplicaLL-Light/Regular/Bold.otf`), letto dalle sue `@font-face`. E non è che il sito ne usi solo alcuni: **Medium e Semibold non esistono nel carattere.** Replica LL (Lineto) ha quattro pesi — `ReplicaLL-Light`, `-Regular`, `-Bold`, `-Heavy` — più i corsivi `-LightItalic`, `-Italic`, `-BoldItalic`, `-HeavyItalic`, e un `ReplicaMonoLL-Regular` a parte. Verificato due volte e in due modi: sulla pagina della fonderia e sui nomi degli asset che quella pagina pubblica.

Il v1 costruisce però la gerarchia su **600** (×13 in `components.css`/`theme.css`/`styleguide.html`) e **500** (×2), e il v2 su `font-semibold` (×14) e `font-medium` (×3). Con la sostituzione prevista dal CSS — sopra 500 si sale, da 400 a 500 si scende — il risultato è:

| scritto | reso con Replicall |
|---|---|
| `font-medium` (500) | **400 Regular** — indistinguibile dal corpo del testo |
| `font-semibold` (600) | **700 Bold** |

Non è un guasto: è una gerarchia che, col font vero, ha **due gradini invece di quattro**. Va guardata prima di essere cotta dentro quaranta componenti — ed è la ragione più forte per caricare il font nel workbench adesso. **In carico a M2.1** (`typography`), che è il task che deve «riprodurre la scala v1».

Il gradino da cui ripartire c'è, ed è **Heavy 800**: un peso che il carattere offre e che né il sito né il v1 hanno mai usato. È dichiarato nel workbench apposta, perché la decisione di M2.1 si prenda vedendolo e non immaginandolo.

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

### La forma adottata

Sei `@font-face` in **`src/index.css`** — cioè nel workbench, non nel tema: ciò che sta in `src/` non viaggia col registry. I file vanno in `public/fonts/`, che il dev server di Vite serve sia sul workbench (5180) sia su Storybook (6006) — verificato, nessun `staticDirs` da aggiungere. I binari sono **esclusi dal repo** (`.gitignore`: `public/fonts/*` con l'eccezione del `LEGGIMI.md`; verificato mettendone uno e vedendo che `git add -A` indicizza solo il `LEGGIMI.md`).

Le facce dichiarate sono **sei**: 300, 400, 400 corsivo, 700, 700 corsivo, 800 — cioè ciò che la famiglia ha davvero, non ciò che il design system scrive. Ogni faccia accetta `.woff2` **o** `.otf`, in quest'ordine, così arriva quello che c'è senza toccare il codice: `.woff2` è il formato giusto per il web e pesa un terzo, `.otf` è quello che il sito serve oggi. Restano fuori `LightItalic` e `HeavyItalic`, che nessuno usa.

Finché i file mancano, la console mostra un 404 per peso e tutto degrada al font di sistema. È il comportamento voluto — ed è anche il modo di vedere a colpo d'occhio se i file ci sono.

**Il tema distribuito non cambia:** continua a dichiarare solo lo stack e a non portare nessun binario. **D3 resta chiusa al default del v1** (lo carica l'app), e questa decisione non la riapre.

### Prova

Messo un file di comodo al posto di un peso, `document.fonts` riporta quel peso `loaded` e gli altri `error`: i pesi presenti si attivano e i mancanti degradano **per quel peso soltanto**. Lo stack risolto sull'elemento radice parte da `Replicall`. Il file di comodo è stato rimosso. `public/fonts/` è servito sia dal workbench (5180) sia da Storybook (6006), quindi non serve toccare `staticDirs`. Il `.gitignore` è stato provato con un binario in cartella: `git add -A` indicizza **solo** il `LEGGIMI.md`.
