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
  "@tassullo": "https://raw.githubusercontent.com/tassullo/tassullo-design-system-v2/main/public/r/{name}.json"
}
```

Senza questa riga i componenti che dipendono da altri componenti del catalogo
— quasi tutti i blocchi e tutte le pagine — falliscono con
`Unknown registry "@tassullo"`, e l'MCP del passo 5 non vede il catalogo.

**Fissare una versione.** `main` è l'ultima versione pubblicata, ed è quella
da usare finché il design system non ha un'etichetta di versione. Quando
l'etichetta c'è (per esempio `v2.0.0`), un'app in produzione la fissa in
**due** posti, sempre gli stessi due, allineati:

- nell'indirizzo di `components.json`, `main` diventa l'etichetta:
  `…/tassullo-design-system-v2/v2.0.0/public/r/{name}.json`;
- in coda a ogni comando `add` si scrive `#` e l'etichetta:
  `npx shadcn@latest add tassullo/tassullo-design-system-v2/tema#v2.0.0`.

Il primo fissa i componenti che arrivano **come dipendenze**, il secondo
quello che si chiede per nome. Se ne fissa uno solo, l'app mescola due
versioni.

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
npx shadcn@latest add tassullo/tassullo-design-system-v2/tema --dry-run
```

poi si installa:

```bash
npx shadcn@latest add tassullo/tassullo-design-system-v2/tema
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

## Da dove partire: le pagine modello

Una pagina nuova non si compone da zero: si parte dalla pagina modello che le
somiglia di più. Ognuna arriva **con tutti i blocchi e le primitive che le
servono**.

| item | per cosa | comando |
|---|---|---|
| `tassullo-app-shell` | il guscio: colonna di navigazione, fascia in alto, menu dell'utente. Si monta una volta, attorno a tutta l'app | `npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-app-shell` |
| `tassullo-pagina-lista` | un elenco da cercare, filtrare, aprire | `npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-pagina-lista` |
| `tassullo-pagina-scheda` | il dettaglio di un record, a schede, con lo storico | `npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-pagina-scheda` |
| `tassullo-pagina-dashboard` | il cruscotto: indicatori, due grafici, attività recenti | `npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-pagina-dashboard` |
| `tassullo-pagina-admin` | utenti e ruoli | `npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-pagina-admin` |
| `tassullo-pagina-login` | l'accesso, con Microsoft e/o credenziali | `npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-pagina-login` |
| `tassullo-pagina-errore` | 404, accesso negato, errore del server, manutenzione | `npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-pagina-errore` |

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
npx shadcn@latest add tassullo/tassullo-design-system-v2/tassullo-app-shell tassullo/tassullo-design-system-v2/tassullo-pagina-lista
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

Un componente si aggiorna reinstallandolo:

```bash
npx shadcn@latest add tassullo/tassullo-design-system-v2/<item> --overwrite
```

(con `#` e l'etichetta, se l'app ha fissato una versione). Poi si guarda il
diff: se l'app aveva modificato il file in casa, è qui che la modifica si
perde — ed è la ragione per cui non si modifica.
