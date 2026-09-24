# Integrazione col Design System Tassullo 2.0

> Blocco da inserire nel piano di sviluppo di ogni nuova app dello studio.
> È autosufficiente: contiene tutto il contesto necessario, anche per chi
> non conosce la storia del progetto.

## Contesto

Le app dello studio Tassullo condividono un solo stile grafico, allineato al
sito tassullo.it: nero `#141414`, superfici chiare su neutri caldi, accento
arancio `#F4AC3D` con il testo scuro sopra, carattere Inter. Lo stile vive in
un unico repository GitHub pubblico:

**https://github.com/tassullo/tassullo-design-system-v2**

e si guarda nella style guide:

**https://tassullo.github.io/tassullo-design-system-v2**

Non è un pacchetto npm. È un **registry shadcn/ui**: un catalogo da cui la
riga di comando di shadcn **copia il codice sorgente** dentro l'app. Dopo
l'installazione i file stanno nell'app e si leggono come codice suo, ma
**non si modificano lì**: un componente corretto in casa diverge dal catalogo
al primo aggiornamento. Se manca qualcosa, si aggiunge al design system e
l'app lo reinstalla.

Il catalogo contiene quattro famiglie di cose:

- il **tema**: i colori (chiaro e scuro), il carattere Inter, i raggi, la
  densità, il marchio. Arriva con un comando solo;
- le **primitive**: bottoni, campi, menu, dialoghi, tabelle… Sono i
  componenti di shadcn/ui costruiti su Base UI, ri-vestiti con i colori
  Tassullo;
- i **blocchi**: pezzi applicativi già composti — il guscio con la colonna di
  navigazione, l'intestazione di pagina, la tabella dati, il calendario, gli
  stati vuoto ed errore;
- le **pagine modello**: login, lista, scheda, cruscotto, amministrazione,
  pagina d'errore. Sono il punto da cui parte una pagina nuova.

Perché un registry e non un pacchetto: i componenti di shadcn sono pensati per
essere copiati e letti, non importati da una scatola chiusa. L'app vede il
codice che esegue, e il design system resta la sola fonte da cui quel codice
arriva.

Stack richiesto: **Vite + React 19 + TypeScript**, **Tailwind CSS v4**,
**Node recente** (22 o successivo).

## Task di setup (fase iniziale del progetto, ~10 minuti)

I tempi fra parentesi sono misurati su un Mac con la cache di npm già calda,
e sono il tempo dei comandi. Tutti i comandi, dalla cartella vuota fino a una
pagina lista nel guscio compilata per la produzione, fanno **meno di un
minuto**; il resto dei dieci minuti è leggere e fare le modifiche a mano. Si fanno **nell'ordine**:
alcuni passi, fatti in un ordine diverso, rompono in silenzio quelli dopo.

### 1. Scaffold dell'app (~10 s)

```bash
npm create vite@latest mia-app -- --template react-ts
cd mia-app
npm install
```

### 2. Tailwind v4, l'alias `@` e via i CSS demo del template (~5 s, più le modifiche)

```bash
npm install tailwindcss @tailwindcss/vite
npm install -D @types/node
```

(`@types/node` nei template recenti c'è già: il secondo comando allora non
cambia niente, e non fa danno.) Se npm avvisa che `fsevents` ha degli script
d'installazione non approvati, si ignora: è un pacchetto opzionale del Mac e
all'app non serve.

`vite.config.ts` diventa:

```ts
import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
})
```

L'alias `@/*` va dichiarato in **due** file, `tsconfig.json` (la radice) e
`tsconfig.app.json`, dentro `compilerOptions`:

```json
"compilerOptions": {
  "paths": { "@/*": ["./src/*"] }
}
```

Nel `tsconfig.json` alla radice `compilerOptions` di solito non c'è: si
aggiunge accanto a `files` e `references`. Serve alla CLI di shadcn: se l'alias
sta solo in `tsconfig.app.json`, la CLI non lo trova e scrive i componenti in
una cartella chiamata letteralmente `@/` invece che in `src/`. In
`tsconfig.app.json` serve invece al compilatore. **Non si aggiunge
`baseUrl`**: TypeScript 6 lo dichiara deprecato ed esce con errore.

Poi via gli stili dimostrativi del template, che altrimenti restano sotto il
tema e lo sporcano:

- si cancella `src/App.css`;
- `src/index.css` si **svuota** e resta una riga sola:

  ```css
  @import "tailwindcss";
  ```

- `src/App.tsx` si riduce a un componente vuoto, che sarà sostituito dalla
  prima pagina vera:

  ```tsx
  export default function App() {
    return <main className="p-4">Mia app</main>
  }
  ```

### 3. `shadcn init` (~15 s)

```bash
npx shadcn@latest init --base base --preset nova --yes
```

I tre argomenti servono tutti. `--base base` sceglie le primitive **Base UI**,
che sono quelle del design system; `--preset nova` è il preset (il nome è
`nova`, non `base-nova`: passarlo così dà *Invalid preset*). Senza `--preset`
il comando apre un menu a tendina, e `--yes` non lo salta.

Nasce `components.json`. Il campo `"style"` deve valere **`"base-nova"`** e
non si cambia mai: è da lì che dipende che ogni componente installato sia
quello Base UI.

### 4. Il registry Tassullo dichiarato in `components.json` (a mano)

`init` lascia in fondo a `components.json` un campo `registries` vuoto
(`"registries": {}`). Lo si riempie così:

```json
"registries": {
  "@tassullo": "https://raw.githubusercontent.com/tassullo/tassullo-design-system-v2/v2.0.0/public/r/{name}.json"
}
```

Senza questa riga i componenti che dipendono da altri componenti del catalogo
— quasi tutti i blocchi e tutte le pagine — falliscono con
`Unknown registry "@tassullo"`, e l'MCP del passo 5 non vede il catalogo.

**La versione sta nell'indirizzo.** `v2.0.0` è l'etichetta della versione: fissata
lì, l'app riceve sempre gli stessi file, e non cambia niente finché non si decide di
aggiornare. Le etichette sono elencate nella pagina *Tags* del repository su GitHub;
una versione più recente si adotta cambiando l'etichetta nell'indirizzo (vedi
«Aggiornare»). Al posto dell'etichetta si può scrivere `main`, l'ultima versione
pubblicata: serve a provare, non a un'app in produzione, perché ogni `add` porterebbe
quello che c'è quel giorno.

Da qui in avanti ogni componente si installa con `npx shadcn@latest add
@tassullo/<item>`, che prende la versione **solo** da questo indirizzo. La forma
lunga, `tassullo/tassullo-design-system-v2/<item>`, non la legge: senza `#` prende
sempre `main`, e mescolerebbe due versioni.

### 5. L'MCP di shadcn (~2 s, più il riavvio di Claude Code)

```bash
npx shadcn@latest mcp init --client claude
```

Un server MCP è un programma che dà a Claude Code degli strumenti in più;
questo è quello di shadcn. Il comando scrive un `.mcp.json` nella radice
dell'app. **Si chiude e si riapre Claude Code**, perché i server MCP si
caricano all'avvio. Da quel momento Claude Code sa **elencare, cercare e
leggere** i componenti del catalogo Tassullo — li trova in `components.json`,
per questo il passo 4 viene prima —, e installarli. Basta chiederlo a parole:
«cerca nel registry Tassullo una pagina con una tabella».

Non è un accessorio. Senza, chi sviluppa deve ricordare a memoria cosa
contiene il design system, ed è esattamente così che si finisce a riscrivere
un componente che esisteva già. La regola, da qui in avanti: **prima di
scrivere un componente, si chiede all'MCP se c'è**.

### 6. Il tema, prima di scrivere la prima pagina (~10 s, con la prova a vuoto)

Prima si guarda cosa farebbe, senza scrivere niente:

```bash
npx shadcn@latest add @tassullo/tema --dry-run
```

poi si installa:

```bash
npx shadcn@latest add @tassullo/tema
```

La CLI chiede conferma: *You are about to install a new theme. Existing CSS
variables and components will be overwritten. Continue?* Si risponde **`y`**.
In un'app appena creata non c'è niente di nostro da perdere: la palette di
partenza che la CLI sta per coprire è proprio quella che il passo 7 toglie.

Arrivano tre file in `src/` — `tassullo-theme.css` (i colori, i raggi, la
densità), `tassullo-inter.css` (il carattere) con la sua licenza
`tassullo-inter-OFL.txt`, e `tassullo-logo.css` (il marchio) — e i loro
`@import` in `src/index.css`. Il carattere viaggia **dentro** il CSS: l'app
non fa nessuna richiesta di rete per la tipografia, né a Google né altrove.
Nessuno dei tre file si modifica a mano: al prossimo aggiornamento verrebbero
riscritti.

### 7. Via la palette di partenza di shadcn (a mano)

È il passo che costa di più se si salta, perché **non dà nessun errore**.
`shadcn init` ha scritto in `src/index.css` la **propria** palette grigia, e
l'ha scritta **dopo** gli `@import` del tema: in CSS a parità di peso vince
l'ultima regola, quindi la palette di shadcn copre quella Tassullo. L'app
sembra vestita a metà: il bottone principale è grigio scuro invece che
arancio, il carattere è Geist invece di Inter, ma alcuni colori Tassullo si
vedono lo stesso — e proprio per questo non ci si accorge del guasto.

In `src/index.css` si tolgono:

- il blocco `@theme inline { … }`;
- il blocco `:root { … }`;
- il blocco `.dark { … }`;
- l'`@import` del carattere Geist (`@import "@fontsource-variable/geist";`),
  se c'è.

e si toglie anche il pacchetto di Geist, che a quel punto non usa più
nessuno:

```bash
npm uninstall @fontsource-variable/geist
```

Le istruzioni che la CLI stampa alla fine del passo 6 dicono la stessa cosa:
sono quattro cose da togliere, non una di meno.

Restano gli `@import` (Tailwind, eventuali altri di shadcn, i tre del tema),
la riga `@custom-variant dark …` e il blocco `@layer base { … }`, che dà alla
pagina lo sfondo e il colore del testo del tema. Non manca niente: il tema
Tassullo porta i propri `@theme` con colori, raggi e famiglie di carattere.

### 8. Verifica della pagina vuota

```bash
npm run dev
```

La pagina deve avere lo **sfondo `#F6F6F4`** (un bianco caldo, non il bianco
puro) e il testo in **Inter**. Una prova rapida, nella console del browser:

```js
getComputedStyle(document.body).backgroundColor  // "rgb(246, 246, 244)"
getComputedStyle(document.body).fontFamily       // comincia con "Inter"
```

Se lo sfondo è bianco puro e il carattere è Geist, il passo 7 non è stato
fatto per intero.

### 9. Densità «touch», solo se l'app si usa in campo

Se l'app si usa in cantiere o in officina — schermo piccolo, guanti —, in
`index.html`:

```html
<html lang="it" data-density="touch">
```

Bottoni, campi e voci di menu si ingrandiscono (il bottone standard passa da
32 a 48 pixel) e i testi crescono di un gradino. Le app da scrivania non
mettono l'attributo. Vedi sotto, «Densità e modalità scura».

### 10. Le regole nel `CLAUDE.md` dell'app, e le due voci nel piano

Il blocco della sezione «Regole da inserire nel CLAUDE.md della nuova app»,
più sotto, si copia **tal quale** nel `CLAUDE.md` dell'app. La voce di
manutenzione va nella roadmap e il paragrafo nella checklist (sezione «Nel
piano dell'app»). È il passo che tiene l'app agganciata nel tempo, non solo
al primo giorno.

### 11. Il controllo, fra le verifiche automatiche dell'app (~10 s, più la CI)

```bash
npx shadcn@latest add @tassullo/tassullo-controllo
```

Arriva un file solo, `scripts/tassullo-controllo.mjs`, nella cartella di
`components.json`. Si lancia con `node scripts/tassullo-controllo.mjs` e va
fra i passi che la CI dell'app esegue a ogni push, accanto a `tsc` e alla
build. Controlla tre cose:

- i file installati dal design system sono identici a quelli della versione
  scritta in `components.json` (li confronta la riga di comando di shadcn);
- in `src/components/ui/`, `blocks/` e `pages/` stanno solo file del design
  system: un componente scritto dall'app, o preso da shadcn senza `@tassullo/`,
  lì dentro è un errore;
- il codice dell'app segue le regole del blocco per il `CLAUDE.md` (valori
  arbitrari, esadecimali, `text-primary`, finestre del browser, tendine
  native, numeri…), e `components.json` ha `base-nova` e una versione fissata.

Esce con errore alla prima violazione e dice perché. Una riga che deve fare
eccezione porta un commento `tassullo-controllo: <il motivo>`. Vuole la rete
per leggere il registry; `--solo-stile` fa solo le regole sul codice, senza
rete. In un'app appena creata, alla fine del setup, deve passare pulito.

## Da dove partire: le pagine modello

Una pagina nuova non si compone da zero: si parte dalla pagina modello che le
somiglia di più. Ognuna arriva **con tutti i blocchi e le primitive che le
servono**.

| item | per cosa | comando |
|---|---|---|
| `tassullo-app-shell` | il guscio: colonna di navigazione, fascia in alto, menu dell'utente. Si monta una volta, attorno a tutta l'app | `npx shadcn@latest add @tassullo/tassullo-app-shell` |
| `tassullo-pagina-lista` | un elenco da cercare, filtrare, aprire | `npx shadcn@latest add @tassullo/tassullo-pagina-lista` |
| `tassullo-pagina-scheda` | il dettaglio di un record, a schede, con lo storico | `npx shadcn@latest add @tassullo/tassullo-pagina-scheda` |
| `tassullo-pagina-dashboard` | il cruscotto: indicatori, due grafici, attività recenti | `npx shadcn@latest add @tassullo/tassullo-pagina-dashboard` |
| `tassullo-pagina-admin` | utenti e ruoli | `npx shadcn@latest add @tassullo/tassullo-pagina-admin` |
| `tassullo-pagina-login` | l'accesso, con Microsoft e/o credenziali | `npx shadcn@latest add @tassullo/tassullo-pagina-login` |
| `tassullo-pagina-errore` | 404, accesso negato, errore del server, manutenzione | `npx shadcn@latest add @tassullo/tassullo-pagina-errore` |

Anche qui prima `--dry-run`, poi il comando vero. Più item si installano
insieme scrivendoli uno dopo l'altro nello stesso `add`. A fine installazione
la CLI **stampa le istruzioni d'uso** di ogni item: vanno lette, sono scritte
apposta per chi installa. Ogni pagina modello ha la sua pagina nella style
guide, sezione *Pagine*, con le scene e il codice.

I file arrivano in `src/components/`: le primitive in `src/components/ui/`, i
blocchi in `src/components/blocks/`, le pagine in `src/components/pages/`, e
si importano con l'alias `@/components/…`.

### Esempio: una lista dentro il guscio

```bash
npx shadcn@latest add @tassullo/tassullo-app-shell @tassullo/tassullo-pagina-lista
```

`src/App.tsx`:

```tsx
import { PackageIcon, PlusIcon, TruckIcon } from "lucide-react"

import { AppShell, type SezioneNav } from "@/components/blocks/app-shell"
import { creaColonne } from "@/components/blocks/data-table"
import { PaginaLista } from "@/components/pages/pagina-lista"

type Prodotto = { codice: string; nome: string; famiglia: string }

const SEZIONI: SezioneNav[] = [
  {
    voci: [
      { titolo: "Prodotti", icona: PackageIcon, attiva: true },
      { titolo: "Fornitori", icona: TruckIcon },
    ],
  },
]

const col = creaColonne<Prodotto>()
const COLONNE = col.columns([
  col.accessor("codice", { header: "Codice", meta: { larghezza: "w-32" } }),
  col.accessor("nome", { header: "Nome" }),
  col.accessor("famiglia", { header: "Famiglia", meta: { larghezza: "w-48" } }),
])

const PRODOTTI: Prodotto[] = [
  { codice: "TS-0101", nome: "Trave lamellare 12×24", famiglia: "Travi" },
  { codice: "TS-0102", nome: "Trave lamellare 14×28", famiglia: "Travi" },
  { codice: "TS-0210", nome: "Pannello X-Lam 100 mm", famiglia: "Pannelli" },
]

export default function App() {
  return (
    <AppShell
      applicazione="Prova"
      sezioni={SEZIONI}
      utente={{ nome: "Stefano", cognome: "Bertolini", email: "stefano.bertolini@esempio.it" }}
      contenuto="riempie"
    >
      <PaginaLista
        percorso={[{ titolo: "Prodotti" }]}
        azioni={[{ titolo: "Nuovo prodotto", icona: PlusIcon, ruolo: "primaria" }]}
        colonne={COLONNE}
        dati={PRODOTTI}
        cerca="Cerca codice, nome…"
        perPagina={25}
      />
    </AppShell>
  )
}
```

`contenuto="riempie"` serve alla lista: il guscio si ferma all'altezza della
finestra e la tabella scorre al suo interno. Le voci di navigazione sono un
dato: `attiva` la calcola l'app, e i collegamenti si passano con `render` (un
`<NavLink>` di react-router, per esempio). Il resto delle prop è nelle
istruzioni che la CLI stampa e nella style guide.

Poi:

```bash
npx tsc -b
npm run build
```

devono passare senza errori. La build avvisa che il file JavaScript supera i
500 kB: è un avviso, non un errore, e si affronta quando l'app avrà più pagine
(caricandole con `import()` dinamico).

Se `npm run dev` era acceso durante l'`add`, alla prima visita il browser può
segnare due errori `504 (Outdated Optimize Dep)` e ricaricare la pagina da
solo: è Vite che prepara i pacchetti appena arrivati. Dopo il ricaricamento la
console è pulita.

## Densità e modalità scura

Sono due interruttori, e sono **attributi sulla radice** del documento
(`<html>`), non opzioni dei componenti: i componenti li seguono da soli.

- **Modalità scura**: la classe `dark` su `<html>`.

  ```ts
  document.documentElement.classList.toggle("dark", scuro)
  ```

  Per seguire l'impostazione del sistema operativo si legge
  `matchMedia("(prefers-color-scheme: dark)")`. Tutti i colori del tema hanno
  il loro valore scuro; nessun componente va toccato.

- **Densità**: l'attributo `data-density` su `<html>`. `touch` ingrandisce i
  bersagli e i testi per l'uso in campo; `normale` — o l'attributo assente — è
  la densità da scrivania. Funziona anche su un sottoalbero: un pannello
  `data-density="normale"` dentro un'app touch torna alla densità normale.

  ```html
  <html lang="it" data-density="touch">
  ```

Due regole, perché i colori reggano in entrambe le modalità:

- **`primary` è l'arancio del brand, `accent` è il grigio dell'hover dei
  menu.** Non si confondono: `bg-accent` non è arancio.
- **L'arancio non si usa mai per il testo.** Su fondo chiaro `text-primary` è
  illeggibile (1,79:1). Il testo arancio si scrive `text-accent-ink`, che è
  corretto in chiaro e in scuro. Lo stesso vale per il rosso: `destructive` è
  un colore da fondo, e per un testo d'errore si usa la variante
  `destructive` del componente, non una classe di colore.

## Se l'app avrà un'identità visiva diversa

Il tema non si modifica: `src/tassullo-theme.css` verrebbe riscritto al primo
aggiornamento. Si ridefiniscono **solo i token del brand**, in `src/index.css`,
**dopo** gli `@import` del tema, per la modalità chiara e per quella scura:

```css
:root {
  --primary: /* il nuovo colore del brand */;
  --primary-foreground: /* il testo sopra il brand */;
  --primary-hover: /* … */;
  --primary-subtle: /* un fondo tenue del brand */;
  --primary-border: /* … */;
  --accent-ink: /* il brand leggibile come testo, almeno 4,5:1 sul fondo */;
  --ring: /* l'anello del fuoco, di solito il brand */;
  --sidebar-primary: /* … */;
  --sidebar-primary-foreground: /* … */;
}

.dark {
  /* gli stessi nove, con i valori per il fondo scuro */
}
```

Superfici, testi, stati, carattere e componenti restano quelli di tutte le
altre app. Il rapporto di contrasto di `--primary-foreground` su `--primary` e
di `--accent-ink` sul fondo va misurato: deve essere almeno 4,5:1, in chiaro e
in scuro.

Se la nuova identità serve a più di un'app, non si ripete in ciascuna: si
propone al design system come variante del tema.

## Aggiornare

Una versione nuova si adotta in due gesti. Prima si cambia l'etichetta
nell'indirizzo di `@tassullo` in `components.json` (per esempio da `v2.0.0` a
`v2.1.0`); poi si reinstallano gli item installati per nome, il tema per primo:

```bash
npx shadcn@latest add @tassullo/<item> --overwrite
```

Ogni comando riscrive anche gli item da cui quello dipende. Poi si guarda il
diff: se l'app aveva modificato un file in casa, è qui che la modifica si perde
— ed è la ragione per cui non si modifica. Cosa è cambiato fra due versioni lo
dice GitHub: `github.com/tassullo/tassullo-design-system-v2/compare/v2.0.0...v2.1.0`.

## Regole da inserire nel CLAUDE.md della nuova app

Si copiano **tal quali**, senza adattarle: servono a tenere l'aggancio nel
tempo, non solo al setup. Ciò che nominano — l'MCP, `components.json`, i file
`src/tassullo-*.css` — esiste nell'app dopo i passi di setup; l'unica cosa che
va installata a parte, e il blocco dice come, è la libreria dei numeri.

```markdown
## Stile e design system

Lo stile di questa app viene dal **Design System Tassullo 2.0**, un registry
shadcn/ui: https://github.com/tassullo/tassullo-design-system-v2 (style guide:
https://tassullo.github.io/tassullo-design-system-v2). La CLI di shadcn ne ha
copiato i file qui — in `src/components/ui/`, `src/components/blocks/`,
`src/components/pages/`, `src/lib/`, `src/hooks/` e i CSS `src/tassullo-*.css`
—, ma la loro unica fonte resta il design system. Sono del design system i file
installati, non le cartelle: un file nuovo dell'app può stare accanto a loro.

**Prima di scrivere, si cerca.**
- Prima di scrivere un componente si chiede all'MCP di shadcn se il registry
  Tassullo ce l'ha già. Se c'è, si installa: non si riscrive.
- Si installa con `npx shadcn@latest add @tassullo/<item>`, che prende la
  versione scritta in `components.json`. `npx shadcn@latest add button`, senza
  `@tassullo/`, porta il bottone di shadcn e non quello Tassullo.
- I nomi degli item: le primitive hanno il nome di shadcn (`badge`, `alert`,
  `dialog`…); blocchi e pagine cominciano con `tassullo-`
  (`tassullo-error-state`, `tassullo-pagina-lista`); il tema e la libreria dei
  numeri si chiamano `tema` e `numeri`. L'MCP e la style guide li elencano
  tutti. Ogni item installato per nome si annota nella checklist dell'app
  (`CHECKLIST.md`, sezione «Design system»): sono quelli da reinstallare a ogni
  aggiornamento, e le primitive arrivano con loro.
- Una pagina nuova parte dalla pagina modello più vicina
  (`tassullo-pagina-lista`, `-scheda`, `-dashboard`, `-admin`, `-login`,
  `-errore`): si installa e si usa il suo componente (`PaginaLista`, …) con le
  sue prop, senza copiarne il file. Se nessuna somiglia, si compone con i
  blocchi e le primitive.

**I file del design system non si modificano qui.**
- Si aggiornano dal registry e non si correggono in casa: una modifica locale
  sparisce al primo aggiornamento, senza avvisi.
- Se manca una variante, un token o un componente, o se ne trovi uno
  sbagliato, si apre una issue col modulo «Proposta»:
  https://github.com/tassullo/tassullo-design-system-v2/issues/new?template=proposta.yml.
  Da riga di comando: `gh issue create -R tassullo/tassullo-design-system-v2
  --label proposta --title "Proposta: …"`, con nel testo le stesse voci del
  modulo (app, cosa manca, cosa serve, cosa si è provato, cosa fa l'app nel
  frattempo). È pubblica: niente dati veri, né nomi di prodotti, clienti o persone, né
  schermate con dati reali. Nel frattempo si usa il componente più vicino così
  com'è, con un commento `// in attesa di tassullo-design-system-v2#<numero>`;
  quando la proposta è chiusa si reinstalla e il commento si toglie. Mai una
  versione «per ora» nell'app.
- In `components.json` il campo `"style"` resta `"base-nova"`: è ciò che fa
  arrivare le primitive Base UI.

**Colori e misure vengono solo dai token del tema.**
- Nel codice dell'app le utility Tailwind usano solo i nomi del tema
  (`bg-card`, `text-muted-foreground`, `border-border`, `p-4`, `rounded-lg`).
  Niente valori arbitrari (`h-[37px]`, `bg-[#F4AC3D]`, `text-[13px]`), niente
  esadecimali, niente tavolozza standard di Tailwind (`red-500`, `white`,
  `black`), anche negli `style={{…}}` e nei `fill`/`stroke` degli SVG. Le
  parentesi quadre nei selettori (`[&_svg]:`, `has-[>svg]:`) vanno bene: è il
  valore arbitrario dopo i due punti che non si scrive. Quelli che si trovano
  dentro i file del design system sono suoi, e non fanno testo.
- Le misure del testo sono `text-xs` … `text-3xl`: solo queste crescono con la
  densità touch. `text-4xl` e oltre non crescono; `text-md` non esiste e non fa
  niente, senza errori.
- `primary` è l'arancio del brand; `accent` è il grigio dell'hover dei menu.
  `bg-accent` non è arancio.
- Il testo arancio è sempre `text-accent-ink`, mai `text-primary`: sul chiaro
  `primary` non si legge, e `accent-ink` è giusto in chiaro e in scuro.
  Nonostante il nome, `accent-ink` non c'entra con `accent`.
- Lo stesso per il rosso: `destructive` è un colore da fondo, e
  `text-destructive` non si usa. Un'azione che cancella usa
  `variant="destructive"` (`Button`, le voci di `DropdownMenu` e
  `ContextMenu`); un errore da mostrare usa `Alert` o `Badge` con
  `variant="destructive"`, o il blocco `ErrorState` per una pagina intera. Se
  serve una classe per un testo rosso, è `text-destructive-subtle-foreground`.
- Modalità scura e densità sono la classe `dark` e l'attributo
  `data-density="touch"` su `<html>`: i componenti li seguono da soli, e
  `data-density="normale"` riporta un pezzo di pagina alla densità da
  scrivania. Con la densità crescono bersagli e testi; raggi, bordi, larghezze
  massime e la larghezza della colonna laterale restano uguali.
- Il carattere è Inter e arriva col tema: niente altri font, niente Google
  Fonts. `font-mono` solo per il codice sorgente mostrato in pagina.

**Il nome dice la funzione, non l'aspetto.** `badge` è un'etichetta che si
legge; `toggle-group` è un filtro che si clicca. Prima di scegliere un
componente ci si chiede cosa fa l'elemento, non a cosa somiglia.

**Numeri.**
- I numeri da confrontare in colonna hanno `tabular-nums`, non un altro
  carattere. `Table` e le tabelle dei blocchi lo hanno già; fuori (totali,
  indicatori) si scrive a mano.
- Si formattano con `intero()`, `decimale()`, `valuta()` di `@/lib/numeri`, o
  con `formattatore(opzioni)` per gli altri casi: il punto delle migliaia c'è
  sempre (`2.086,93 €`), mentre `Intl.NumberFormat("it-IT")` da solo scrive
  `2086,93`. Nel codice dell'app non si scrivono mai `Intl.NumberFormat` né
  `toLocaleString()` su un numero: hanno lo stesso difetto. Per i campi dove si
  digita un numero ci sono `leggiNumero("1.234,5")` → `"1234.5"` (dal testo
  scritto al valore) e `scriviNumero("20.78")` → `"20,78"` (il contrario). Se
  `src/lib/numeri.ts` non c'è, si installa
  (`npx shadcn@latest add @tassullo/numeri`) e si annota nella checklist.
- Anni, codici, identificativi e CAP non si formattano: sono stringhe fatte di
  cifre, e `2026` diventerebbe `2.026`.
- I codici (articolo, lotto, partita IVA) si scrivono nel carattere del testo,
  mai in `font-mono`. In una tabella hanno anche il colore del testo, come il
  resto della riga; fuori dalle tabelle, un codice accanto a un nome prende
  `text-sm text-muted-foreground`.
- Se una riga di tabella apre una pagina, il collegamento sta su una colonna
  sola — il codice o il nome — ed è un `Button variant="link"` col `render` del
  collegamento (`<a>` o il `Link` del router), non un testo colorato a mano.

**Classi con `cn`.** Nel codice dell'app si importa da `@/lib/utils`; i file
del design system la prendono dal pacchetto `cn`, ed è la stessa funzione. Fra
due utility dello stesso tipo vince l'ultima scritta, e l'altra sparisce dal
DOM: `cn("mx-2 m-0")` perde `mx-2`. La classe che deve vincere si scrive per
ultima; se una classe «non fa niente», si guarda il DOM.

**Il controllo.** `node scripts/tassullo-controllo.mjs` è fra le verifiche
automatiche dell'app e deve passare: controlla i file del design system, le sue
cartelle e le regole di questa sezione. Una riga che deve fare eccezione porta
un commento `tassullo-controllo: <il motivo>`, e il motivo si scrive davvero.

**Aggiornare.**
- La versione del design system sta nell'indirizzo di `@tassullo` in
  `components.json`: un'etichetta git come `v2.0.0` (l'elenco è nella pagina
  *Tags* del repository su GitHub). `main`, l'ultima versione pubblicata, serve
  solo a provare.
- Un item si aggiorna reinstallandolo, poi si legge il diff:
  `npx shadcn@latest add @tassullo/<item> --overwrite`. Riscrive anche gli
  item da cui dipende. Il `tema` chiede conferma e si risponde `y`: lanciato
  senza nessuno che risponda, esce senza errore e non aggiorna niente.
- La forma lunga, `tassullo/tassullo-design-system-v2/<item>`, qui non serve.
  Senza `#` prende `main` qualunque cosa dica `components.json`, e un solo
  `add` porterebbe file di due versioni; se proprio si usa, porta `#` e la
  stessa versione (`…/badge#v2.0.0`).
```

## Nel piano dell'app

### La voce di manutenzione, per la roadmap

```markdown
**Allineamento al Design System Tassullo (ricorrente, a ogni nuova versione)**
- Prompt: "Il design system ha una versione nuova. Guarda su GitHub cosa è
  cambiato fra la versione installata e la nuova
  (`github.com/tassullo/tassullo-design-system-v2/compare/<installata>...<nuova>`).
  Cambia la versione nell'indirizzo di `@tassullo` in `components.json` e
  reinstalla con `npx shadcn@latest add @tassullo/<item> --overwrite` gli item
  elencati nella checklist, `tema` per primo (chiede conferma: `y`). Leggi il
  `git diff`: una differenza che non viene dal design system è una modifica
  fatta in casa, e si porta al design system invece di ripristinarla. Una riga
  `"use client"` che compare o sparisce in testa a un file non conta: la
  aggiunge e la toglie la riga di comando di shadcn. Poi `npx tsc -b`,
  `npm run build`, e un giro delle pagine in chiaro, in scuro e, se l'app la
  usa, in densità touch."
- File: `components.json`, `src/index.css`, `src/tassullo-*.css`,
  `src/components/`, `src/lib/`, `src/hooks/`.
- Accettazione: la versione nuova in `components.json`; `tsc -b` e build puliti;
  nessun file del design system diverso da quello della versione installata.
```

### Il paragrafo, per la checklist

```markdown
## Design system

> Lo stile viene dal Design System Tassullo 2.0
> (`tassullo/tassullo-design-system-v2`). **Versione installata: `v2.0.0`**,
> quella scritta in `components.json`. **Item installati per
> nome**: `tema`, `tassullo-controllo`, `tassullo-app-shell`, `tassullo-pagina-lista` — le primitive
> arrivano come dipendenze e non si elencano. Un item nuovo si aggiunge qui
> quando si installa. Le regole stanno nel `CLAUDE.md`, sezione «Stile e
> design system».

| Attività | Stato | Responsabile | Dipendenze | Criterio di accettazione (sintesi) |
|---|---|---|---|---|
| Setup del design system | TODO | | scaffold | pagina vuota con sfondo `#F6F6F4` e testo in Inter; l'MCP trova `tassullo-pagina-lista`; `tsc -b` e build puliti |
| Allineamento al design system (ricorrente) | TODO | | nuova versione | versione nuova in `components.json`; build pulita; ultima versione allineata e data nel diario |
```
