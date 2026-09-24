# Tassullo Design System 2.0

Fonte unica dello stile visivo delle app Tassullo — **Anagrafe, Studio, Officina** — in forma di **registry [shadcn/ui](https://ui.shadcn.com)**.

Non è un pacchetto da installare: è un catalogo da cui la CLI **copia il codice sorgente** dentro l'app che lo consuma. I componenti restano leggibili e modificabili nell'app, ma **si correggono qui** — un componente sistemato in casa è un componente che diverge al primo aggiornamento.

Stack: Vite + React 19 + TypeScript, Tailwind v4, [Base UI](https://base-ui.com) per le primitive, Storybook come style guide.

---

## Guardare la style guide

**In rete:** <https://tassullo.github.io/tassullo-design-system-v2> — pubblicata a ogni push su `main`.

**In locale**, se serve provarla mentre si sviluppa:

```bash
npm ci
npm run storybook
```

Va **servita via HTTP**: il doppio clic sul file, come nel v1, non funziona più. È il prezzo del fatto che qui i componenti React sono montati davvero, invece di essere imitati in HTML — cioè esattamente il difetto che aveva fatto divergere le app fino alla v1.1.0.

La style guide ha tre interruttori in barra, e vanno usati: **Modalità** (chiaro/scuro), **Superficie** (Pagina/Card/Sidebar — un componente si guarda sul fondo su cui starà davvero) e **Densità** (normale/touch, per il cantiere).

## Installare un componente in un'app

```bash
npx shadcn@latest add tassullo/tassullo-design-system-v2/button
```

Con il pin di versione, che è la forma da preferire nelle app in produzione:

```bash
npx shadcn@latest add tassullo/tassullo-design-system-v2/button#v2.0.0
```

Il tema si porta con un comando solo — `tema` dichiara fra le sue dipendenze `tema-font` (Inter in data URI) e `tema-logo` (il marchio):

```bash
npx shadcn@latest add tassullo/tassullo-design-system-v2/tema
```

### Portare un'app nuova sul design system

La procedura completa — da una cartella vuota a una pagina modello nel guscio, in stile Tassullo, con i passi che nessun comando fa da solo (Tailwind e l'alias `@` prima di `init`, `init` col preset `nova`, il registry `@tassullo` dichiarato in `components.json`, la palette di partenza di shadcn da togliere dopo il tema) — è in **[`docs/INTEGRAZIONE.md`](docs/INTEGRAZIONE.md)**, scritta per essere incollata nel piano della nuova app. I comandi, dalla cartella vuota alla build di produzione, fanno meno di un minuto.

L'app non fa **nessuna richiesta di rete per la tipografia**: niente Google Fonts, il font viaggia dentro il CSS.

> **Stato:** la prima versione, `v2.0.0`, è pubblicata: le app la fissano nell'indirizzo del registry (vedi [`docs/INTEGRAZIONE.md`](docs/INTEGRAZIONE.md), passo 4). Le app già sul v1 hanno la loro guida: [`docs/GUIDA-MIGRAZIONE.md`](docs/GUIDA-MIGRAZIONE.md).

## Consultare il registry senza installarlo

Il server MCP di shadcn sa **elencare, cercare e leggere** gli item. È il meccanismo con cui le app smettono di divergere: prima di scrivere un componente, si chiede se esiste già.

```bash
npx shadcn@latest mcp init --client claude
```

---

## La regola che tiene insieme tutto

**Nessuna app tiene una copia dei token o dei componenti.** Se a un'app serve un token nuovo, una variante o un pattern non coperto, si propone e si aggiunge **qui** — mai localmente "per ora" nell'app. La deriva delle app comincia sempre da un'eccezione temporanea.

Le utility Tailwind si usano **solo sui token del tema**: niente valori arbitrari (`h-[37px]`, `bg-[#F4AC3D]`), niente hex, mai.

## I gate

`npm run check` esegue i dieci controlli che girano anche in CI:

| Comando | Cosa verifica |
|---|---|
| `check:contrast` | il rapporto di contrasto delle **50 coppie di token** (25 per modalità), fallendo sotto 4.5:1 |
| `check:registry` | che i componenti divergano dall'originale shadcn **solo nelle stringhe di classi** — cioè che restino aggiornabili |
| `check:font` / `check:logo` | che i CSS generati siano allineati ai `.woff2` e agli `.svg` di partenza |
| `test:a11y` | axe-core su ogni story: **4 passate** (chiaro/scuro × popup chiuso/aperto), 1540 scansioni su 385 story |
| `check:riferimenti` | che ogni `registryDependencies` di `registry.json` risolva a un item dichiarato, che i file dichiarati esistano, che non ci siano cicli, e che ogni `import` dei file spediti sia coperto da ciò che `add` installa — le `dependencies` npm dell'item e della chiusura delle sue `registryDependencies` — **214 riferimenti e 510 import su 95 item**. È l'unico gate che vede un item ininstallabile o che nell'app non compila: `registry validate` no |
| `check:registry-build` | che `public/r/` — l'artefatto che le app installano davvero — corrisponda ai sorgenti, rilanciando `shadcn build` in una cartella temporanea e confrontando byte per byte |
| `check:storybook` | che la style guide si legga da fuori: nel testo che un visitatore vede — le descrizioni delle story, le pagine `.mdx`, la prosa delle pagine in `stories/`, le descrizioni dei componenti e delle prop che la tabella delle prop mostra, i commenti dentro il codice delle scene che «Show code» mostra — niente sigle di lavoro, rimandi ai documenti interni, date, nomi di persona, comandi del repo. Il canone di pagina è in testa a `scripts/check-storybook.ts` |
| `check:spedito` | che il testo che arriva a chi installa — `title`, `description` e `docs` degli item, e i file spediti tolte le teste che `shadcn add` toglie — non porti sigle di lavoro, documenti interni, date, nomi di persona. Rimisura a ogni giro, con la CLI vera, quali commenti arrivano |
| `check:checklist` | che ogni riga di `CHECKLIST.md` stia entro **500 caratteri**: la checklist porta verdetto, numeri che contano e un rimando, il resto va in `WORKLOG.md` |

Oggi sono tutti verdi, **0 violazioni**. C'è anche `npm run misura:bersagli`, che misura quanto sono grandi i bersagli in densità touch — una cosa che axe non guarda e che col guanto si sente.

## Documenti

| File | Cosa c'è |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | le regole operative: come si scrive il codice, le trappole già pagate |
| [`PIANO.md`](PIANO.md) | analisi, sei fasi, 42 sessioni con criteri di accettazione |
| [`CHECKLIST.md`](CHECKLIST.md) | **stato di avanzamento**: da leggere per sapere a che punto siamo |
| [`WORKLOG.md`](WORKLOG.md) | il diario: cosa è stato fatto, cosa è andato storto e perché |
| [`docs/DECISIONI.md`](docs/DECISIONI.md) | le decisioni tecniche accertate sul campo, con la prova che le sostiene |
| [`docs/INTEGRAZIONE.md`](docs/INTEGRAZIONE.md) | come si aggancia un'app nuova: da incollare nel suo piano di sviluppo |

Rapporto col v1 (`tassullo-design-system`, `@tassullo/theme`): **resta in produzione e non si tocca.** Le tre app ci restano sopra finché ognuna non decide di passare. Del v1 il v2 eredita solo l'identità visiva — palette, font, raggi, densità — tradotta nella convenzione shadcn.

---

## Licenze

Codice e documentazione: **© Tassullo**, tutti i diritti riservati. Il repo è pubblico perché la CLI shadcn e GitHub Pages lo richiedono, non perché il contenuto sia rilasciato.

Fa eccezione il carattere **Inter**, distribuito con l'item `tema-font` sotto **SIL Open Font License 1.1** — il testo della licenza viaggia con l'item, in [`registry/tassullo/theme/tassullo-inter-OFL.txt`](registry/tassullo/theme/tassullo-inter-OFL.txt).

Il carattere **Replica LL** (Lineto), usato nelle stampe, **non è in questo repo** e non si distribuisce col registry.

Fanno eccezione anche le fotografie dei macchinari in `public/esempi/macchina-*.jpg`, da Wikimedia Commons con le loro licenze (CC BY-SA, CC0, uso libero): autori e licenze in [`public/esempi/LEGGIMI.md`](public/esempi/LEGGIMI.md). Servono solo alla style guide, e nessun item del registry le spedisce.
