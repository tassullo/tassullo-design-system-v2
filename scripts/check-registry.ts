/**
 * check-registry.ts — il controllo di aggiornabilità del registry.
 *
 * Il problema che risolve: i componenti shadcn non sono una dipendenza, sono
 * codice **copiato**. Quando esce una versione nuova non arriva da sola: va
 * riportata a mano. Riuscirci dipende da una cosa sola — che le nostre
 * divergenze dall'originale siano poche, dichiarate e di un tipo solo.
 *
 * La regola che questo script fa rispettare:
 *
 *   Di un componente shadcn si cambiano SOLO le stringhe di classi.
 *   Struttura, props, nomi delle varianti e delle taglie, export: quelli di
 *   shadcn, identici. Una variante in più o un prop in più non si vede più
 *   nel diff con l'originale, e alla prima versione nuova non si sa più cosa
 *   era nostro e cosa era loro.
 *
 * Come fa a saperlo: `registry/.upstream/` conserva il sorgente ORIGINALE di
 * ogni componente, scaricato da `shadcn view`. Il confronto azzera il
 * contenuto delle stringhe: se ciò che resta è identico, abbiamo solo
 * ri-stilato; se differisce, abbiamo toccato la struttura.
 *
 * Uso:
 *   npm run check:registry              esegue i sei controlli
 *   npm run check:registry -- --snapshot [nome…]   riscarica gli originali
 *
 * Alla prossima versione di shadcn: `--snapshot`, poi `git diff` su
 * `registry/.upstream/` dice cosa hanno cambiato loro, e questo script dice
 * se il nostro ri-stile ci si posa ancora sopra.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const UI_DIR = "registry/tassullo/ui";
const BLOCCHI_DIR = "registry/tassullo/blocks";
const PAGINE_DIR = "registry/tassullo/pages";
const LIB_DIR = "registry/tassullo/lib";
const UPSTREAM_DIR = "registry/.upstream";
const PROVENIENZE_FILE = join(UPSTREAM_DIR, "provenienze.json");
const THEME_FILE = "registry/tassullo/theme/tassullo-theme.css";
const PROPRI_FILE = "registry/componenti-propri.json";

/**
 * I registry da cui vengono gli originali di `registry/.upstream/`.
 *
 * Fino a M4ter.1 la provenienza era **una sola e implicita**: `snapshot()`
 * scriveva `@shadcn/${nome}` a mano e `PROVENIENZA.md` la dichiarava per
 * l'intera cartella. Con `@reui` (D21, D22) le provenienze diventano due, e
 * un file senza provenienza dichiarata sarebbe finito nel ramo «componente
 * nostro senza originale» — cioè il gate avrebbe chiesto una riga in
 * `componenti-propri.json` per un componente che un originale ce l'ha eccome.
 *
 * **Un terzo registry si aggiunge QUI, con una riga**, e da quella riga
 * discendono tutte e tre le cose che servono: da dove `--snapshot` scarica,
 * cosa `PROVENIENZA.md` dichiara, e se la licenza chiede di conservare un
 * avviso nei file che ridistribuiamo.
 *
 * `avvisoDaConservare` è la sola condizione che la MIT pone («The above
 * copyright notice … shall be included in all copies or substantial
 * portions»). Il nostro registry ridistribuisce quei file alle app: se
 * l'avviso sparisce dal sorgente, la ridistribuzione non è più coperta. Da qui
 * il controllo, che è un obbligo di licenza e non una convenzione interna.
 */
const REGISTRI_ORIGINE: Record<
  string,
  { etichetta: string; licenza: string; avvisoDaConservare?: string }
> = {
  "@shadcn": { etichetta: "shadcn/ui", licenza: "MIT — shadcn" },
  "@reui": {
    etichetta: "ReUI — Keenthemes",
    licenza: "MIT — Copyright (c) 2025 Keenthemes Inc",
    avvisoDaConservare: "Copyright (c) 2025 Keenthemes Inc",
  },
};

/** `stepper.tsx` → `@reui/stepper`. Una riga per file, letta da un file dati. */
function provenienze(): Record<string, string> {
  if (!existsSync(PROVENIENZE_FILE)) return {};
  return JSON.parse(readFileSync(PROVENIENZE_FILE, "utf8"));
}

/** `@reui/stepper` → `@reui`. */
function registryDi(item: string): string {
  return item.startsWith("@") ? item.slice(0, item.indexOf("/")) : "@shadcn";
}

/**
 * I 32 token che il preset `base-nova` scrive in `:root` a `init`.
 * Non vanno a memoria: estratti dal commit di scaffold (a435201, src/index.css)
 * prima che M1.2 li sostituisse. Sono la definizione operativa di "standard":
 * un componente shadcn non aggiornato può usare solo questi.
 */
const SHADCN_TOKENS = new Set([
  "background", "foreground", "card", "card-foreground", "popover", "popover-foreground",
  "primary", "primary-foreground", "secondary", "secondary-foreground", "muted",
  "muted-foreground", "accent", "accent-foreground", "destructive", "border", "input",
  "ring", "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "sidebar",
  "sidebar-foreground", "sidebar-primary", "sidebar-primary-foreground", "sidebar-accent",
  "sidebar-accent-foreground", "sidebar-border", "sidebar-ring", "radius",
]);

/**
 * Un valore arbitrario è una parentesi quadra che NON apre una variante.
 * Con i due punti dopo è una VARIANTE (`has-data-[icon=inline-end]:pr-2`,
 * `not-aria-[haspopup]:translate-y-px`): legittima, inevitabile, e non è ciò
 * che la regola 3 del CLAUDE.md vieta. Senza, è un valore fuori dal tema
 * (`text-[0.8rem]`, `h-[37px]`, `bg-[#F4AC3D]`): quello sì.
 *
 * Due forme che la prima versione di questa regex prendeva per valori e non
 * lo sono (trovate in M2.1 su `avatar` e `button-group`, 6 segnalazioni su 7
 * false — e un gate che grida al lupo è un gate che si smette di leggere):
 *
 *   · il NOME DI GRUPPO fra parentesi e due punti: `group-data-[size=sm]/avatar:size-2`
 *   · le parentesi ANNIDATE: `has-[>[data-slot=button-group]]:gap-2`
 */
const ARBITRARIO_RE = /[a-z-]+-\[(?:[^[\]]|\[[^\]]*\])*\](?!(?:\/[\w.-]+)?:)/g;

/**
 * ...e una terza forma, trovata in M2.2 su `slider`: l'ELENCO DI PROPRIETÀ.
 * `transition-[color,box-shadow]` è una parentesi quadra che non contiene
 * nessun valore — solo i nomi delle proprietà da animare. Non c'è dentro una
 * lunghezza, un colore o un numero: non è ciò che la regola 3 vieta, e non c'è
 * niente da «ripulire ri-stilando». Metterla in `transition-all`, che sarebbe
 * l'unica alternativa in utility, sul pomello dello slider è pure sbagliato:
 * animerebbe la traslazione, e il pomello resterebbe indietro rispetto al dito.
 */
const ELENCO_PROPRIETA_RE = /^[a-z-]+-\[[a-z-]+(?:,[a-z-]+)*\]$/;

/** Nomi che tradiscono un token del tema: un `*-mutedforeground` è un refuso. */
const FORMA_TOKEN =
  /(foreground|primary|secondary|muted|accent|destructive|success|warning|info|sidebar|popover|chart|overlay|border|ring|card)/;

/** Prefissi di utility Tailwind che puntano a un colore del tema. */
const COLOR_PREFIXES = [
  "bg", "text", "border", "ring", "fill", "stroke", "outline", "shadow", "divide",
  "caret", "decoration", "placeholder", "accent", "from", "via", "to",
];

type ComponenteProprio = {
  file: string;
  cosaFa: string;
  stradaShadcnProvata: string;
  approvatoDa: string;
  data: string;
};

function componentiPropri(): ComponenteProprio[] {
  if (!existsSync(PROPRI_FILE)) return [];
  return JSON.parse(readFileSync(PROPRI_FILE, "utf8")).componenti ?? [];
}

type Problem = { livello: "errore" | "avviso"; dove: string; cosa: string };
const problemi: Problem[] = [];
const err = (dove: string, cosa: string) => problemi.push({ livello: "errore", dove, cosa });
const warn = (dove: string, cosa: string) => problemi.push({ livello: "avviso", dove, cosa });

// ───────────────────────────────────────────────────────────────────────────
// Normalizzazione: si azzera il contenuto delle stringhe, si tolgono i commenti
// e si schiaccia lo spazio. Quel che resta è la FORMA del componente.
// ───────────────────────────────────────────────────────────────────────────

const STRING_RE = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g;

/**
 * Le stringhe e i commenti si separano con una **scansione**, non con due
 * espressioni regolari in fila — e la ragione è un difetto vero, trovato in
 * M4.7 il 2026-09-19.
 *
 * `STRING_RE` da sola riconosce `'…'` ovunque, **anche dentro un commento**.
 * I commenti di questo repo sono in italiano e pieni di apostrofi
 * (`l'originale`, `dell'app`): il primo apostrofo apriva una stringa fantasma
 * che ne inghiottiva un pezzo, la lista delle stringhe del file usciva più
 * lunga o più corta di quella dell'originale, `allineate` diventava falso e
 * **il conto del ri-stile scendeva a zero in silenzio**. Il rapporto scriveva
 * «forma identica all'originale, nessun ri-stile» — cioè la stessa frase di un
 * file mai toccato — su file che avevamo ri-stilato davvero.
 *
 * Non era un caso limite: quando il difetto è stato trovato, **`alert.tsx` era
 * già cieco** (il commento del ri-stile del 2026-09-18 contiene «l'originale»)
 * e con lui `item.tsx`. Un gate che tace su un ri-stile è peggio di un gate che
 * ne inventa uno: il primo lo si scopre alla prossima versione di shadcn, con
 * le modifiche già mescolate.
 *
 * Lo scanner attraversa il sorgente una volta sola tenendo conto di dove si
 * trova — testo, stringa (con gli escape), commento di riga, commento di
 * blocco — e restituisce le due cose separate. Non si può fare col solo
 * ordine delle regex: togliendo prima i commenti si romperebbe un `https://`
 * dentro una stringa, togliendo prima le stringhe si ricade qui.
 */
function scansiona(src: string): { stringhe: string[]; senzaCommenti: string } {
  const stringhe: string[] = [];
  let fuori = "";
  let i = 0;
  while (i < src.length) {
    const c = src[i]!;
    const d = src[i + 1];
    if (c === "/" && d === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      fuori += " ";
      continue;
    }
    if (c === "/" && d === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i += 2;
      fuori += " ";
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const apice = c;
      let s = c;
      i++;
      while (i < src.length) {
        if (src[i] === "\\") {
          s += src[i]! + (src[i + 1] ?? "");
          i += 2;
          continue;
        }
        s += src[i]!;
        if (src[i] === apice) {
          i++;
          break;
        }
        i++;
      }
      stringhe.push(s);
      fuori += s;
      continue;
    }
    fuori += c;
    i++;
  }
  return { stringhe, senzaCommenti: fuori };
}

function estraiStringhe(src: string): string[] {
  return scansiona(src.replace(USE_CLIENT_RE, "")).stringhe.map(normalizzaClassi);
}

/**
 * Seconda trasformazione della CLI, accertata in M2.3: `shadcn view`
 * restituisce `cn-font-heading` sui titoli di `dialog`, `alert-dialog`,
 * `sheet` e `drawer`, e la CLI lo TOGLIE scrivendo il file. Non è un nostro
 * ri-stile — quei quattro file sono usciti dall'installazione e nessuno li
 * aveva ancora aperti — ma il gate li contava come tali: due stringhe
 * "ri-stilate" su `alert-dialog`, una su `drawer`. Stessa natura di
 * `"use client"`, e stessa cura.
 */
const CN_FONT_HEADING_RE = /cn-font-heading\s*/g;

/**
 * Terza trasformazione della CLI, accertata nella stessa sessione: gli import
 * fra componenti arrivano da `view` come `@/registry/base-nova/ui/x` e la CLI
 * li riscrive sull'alias di `components.json`, `@/registry/tassullo/ui/x`.
 * È una stringa, quindi finiva nel conto del ri-stile insieme alle classi —
 * ma non è una classe e non è nostra: è il percorso, e cambia da sé a ogni
 * `add`. Senza questa riga ogni componente che ne importa un altro risultava
 * "ri-stilato" di almeno una stringa anche appena uscito dall'installazione.
 */
const ALIAS_REGISTRY_RE = /@\/registry\/[a-z0-9-]+\//g;

function normalizzaClassi(s: string): string {
  return s.replace(CN_FONT_HEADING_RE, "").replace(ALIAS_REGISTRY_RE, "@/registry/·/");
}

/**
 * La direttiva `"use client"` non fa parte della forma del componente, e va
 * tolta da entrambi i lati prima di confrontare: `shadcn view` la restituisce
 * sempre, ma la CLI la RIMUOVE scrivendo il file in un progetto `rsc: false`
 * — che è il nostro. Senza questa riga il gate segnalava `separator.tsx` come
 * "diverge fuori dalle stringhe di classi" su un file che nessuno aveva
 * toccato (M2.1). Un falso positivo del gate è peggio di nessun gate: insegna
 * a non credergli.
 *
 * **L'ancora non è la prima riga del file — è la prima riga di CODICE**, e la
 * differenza si è vista solo con `@reui` (M4ter.1). Il loro `stepper.tsx`
 * apre con `un commento `eslint-disable`` e solo dopo
 * mette la direttiva: con `^\s*` la regex non la trovava, la direttiva
 * restava, e il gate dichiarava `stepper.tsx` «diverge fuori dalle stringhe di
 * classi» su un file mai toccato. Peggio del falso positivo era il secondo
 * effetto, muto: in `estraiStringhe` la direttiva sopravvissuta è una stringa
 * in più nella lista dell'originale e non nella nostra, le due liste non si
 * allineano più e **il conto del ri-stile scende a zero in silenzio** — lo
 * stesso guasto che M4.7 aveva già pagato con gli apostrofi nei commenti.
 * Quindi si consumano anche i commenti che la precedono; sono commenti, e il
 * confronto di forma li toglie comunque.
 */
const USE_CLIENT_RE =
  /^(?:\s*(?:\/\*[\s\S]*?\*\/|\/\/[^\n]*))*\s*(["'])use client\1\s*;?\s*/;

/**
 * Quarta normalizzazione, accertata in M2.4 su `scroll-area.tsx`: shadcn
 * spedisce alcuni componenti con `import * as React from "react"` che il file
 * NON usa — lì tutti i tipi vengono da `ScrollAreaPrimitive.*.Props`. Sotto
 * `noUnusedLocals: true`, che è il nostro `tsconfig`, quel file **non
 * compila**: `tsc -b` esce con TS6133. Toglierlo non è un ri-stile e non è una
 * scelta, è l'unico modo di avere il componente; ma il confronto di forma lo
 * leggeva come divergenza strutturale, ed è un falso positivo — la stessa
 * famiglia di `"use client"`. Si azzera da entrambi i lati.
 *
 * Attenzione a cosa NON fa: toglie solo l'import *namespace* di React, cioè
 * la riga esatta che la CLI spedisce inutilizzata. Un import diverso, o
 * l'aggiunta di un import nostro, resta una divergenza e viene segnalata.
 */
const REACT_NAMESPACE_IMPORT_RE = /^\s*import \* as React from (["'])react\1\s*;?\s*$/m;

function forma(src: string): string {
  // Commenti e stringhe li separa lo scanner (v. `scansiona`): con le due
  // regex in fila, un apostrofo in un commento italiano falsava anche questo
  // confronto, non solo il conto del ri-stile.
  const senzaCommenti = scansiona(
    src.replace(USE_CLIENT_RE, "").replace(REACT_NAMESPACE_IMPORT_RE, ""),
  ).senzaCommenti;
  return senzaCommenti
    .replace(STRING_RE, '"·"')
    .replace(/\s+/g, " ")
    .trim();
}

// ───────────────────────────────────────────────────────────────────────────

function fileUi(): string[] {
  if (!existsSync(UI_DIR)) return [];
  return readdirSync(UI_DIR)
    .filter((f) => f.endsWith(".tsx") && !f.endsWith(".stories.tsx"))
    .map((f) => join(UI_DIR, f));
}

/**
 * I blocchi della FASE 3. Non hanno — e non possono avere — un originale
 * shadcn: sono i pattern che shadcn *non* copre, ed è la ragione per cui la
 * FASE 3 esiste. Il confronto di forma qui non ha senso, e nemmeno la riga in
 * `componenti-propri.json`, che è il registro dei **componenti** nostri, cioè
 * di ciò che sta al posto di una primitiva shadcn.
 *
 * Ma la regola 3 vale lo stesso, ed è il motivo di questa funzione: fino a
 * M3.1 il gate guardava solo `ui/`, quindi un valore arbitrario o un hex
 * dentro un blocco non lo avrebbe visto nessuno — e i blocchi saranno undici.
 * Un gate che tace su una cartella intera è peggio di un gate che grida.
 *
 * **Da M3.3 guarda anche `lib/`**, e per la stessa ragione portata all'estremo:
 * `lib/toni.ts` è un file fatto **di sole stringhe di classi**, cioè esattamente
 * ciò che la regola 3 governa, e restava l'unica cartella del registry in cui
 * un esadecimale sarebbe passato liscio.
 *
 * **Da M4.1 guarda anche `pages/`**: le pagine modello della FASE 4 sono
 * composizioni di blocchi, non hanno un originale shadcn per la stessa
 * ragione dei blocchi, e senza questa riga sarebbero state la prima cartella
 * del registry a restare invisibile al gate fin dal primo file che ci finiva.
 */
function fileBlocchi(): string[] {
  const fuori: string[] = [];
  for (const dir of [BLOCCHI_DIR, PAGINE_DIR, LIB_DIR]) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!/\.tsx?$/.test(f) || f.endsWith(".stories.tsx")) continue;
      fuori.push(join(dir, f));
    }
  }
  return fuori.sort();
}

/** Sui blocchi si controlla la sola regola 3: niente hex, niente arbitrari. */
function controllaBlocchi(): Set<string> {
  const tokenUsati = new Set<string>();
  for (const path of fileBlocchi()) {
    const nome = basename(path);
    const testo = readFileSync(path, "utf8");
    let arbitrari = 0;
    for (const s of estraiStringhe(testo)) {
      for (const m of s.matchAll(
        new RegExp(`(?:^|[\\s"'\`:\\[])(?:${COLOR_PREFIXES.join("|")})-([a-z][a-z0-9-]*)`, "g"),
      )) {
        tokenUsati.add(m[1]!);
      }
      if (/#[0-9a-fA-F]{3,8}\b/.test(s)) err(nome, `colore esadecimale nel sorgente: ${s}`);
      for (const m of s.matchAll(ARBITRARIO_RE)) {
        if (ELENCO_PROPRIETA_RE.test(m[0])) continue;
        arbitrari++;
        err(nome, `valore arbitrario in un blocco (regola 3 del CLAUDE.md): ${m[0]}`);
      }
    }
    console.log(
      `  ▪ ${nome.padEnd(24)} ${path.startsWith(LIB_DIR) ? "helper Tassullo" : path.startsWith(PAGINE_DIR) ? "pagina Tassullo" : "blocco Tassullo"} — nessun originale shadcn per costruzione` +
        (arbitrari > 0 ? `, ${arbitrari} valore/i arbitrario/i` : ""),
    );
  }
  return tokenUsati;
}

function snapshot(nomi: string[]): void {
  mkdirSync(UPSTREAM_DIR, { recursive: true });
  const mappa = provenienze();
  const daScaricare = nomi.length > 0 ? nomi : fileUi().map((f) => basename(f, ".tsx"));
  if (daScaricare.length === 0) {
    console.log("Nessun componente in " + UI_DIR + ": niente da scaricare.");
    return;
  }
  for (const nome of daScaricare) {
    // Da dove scaricare non è più `@shadcn` per costruzione: lo dice la mappa.
    // Un file che la mappa non conosce si scarica da @shadcn come prima, e il
    // controllo qui sotto lo segnalerà comunque alla prossima esecuzione.
    const item = mappa[`${nome}.tsx`] ?? `@shadcn/${nome}`;
    const out = execFileSync("npx", ["shadcn@latest", "view", item], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    const items = JSON.parse(out.slice(out.indexOf("[")));
    for (const file of items.flatMap((i: { files?: unknown[] }) => i.files ?? []) as {
      path: string;
      content: string;
    }[]) {
      const dest = join(UPSTREAM_DIR, basename(file.path));
      writeFileSync(dest, file.content);
      console.log(`✔ ${dest}  ←  ${item} (${file.path})`);
    }
  }
  const versione = execFileSync("npx", ["shadcn@latest", "--version"], { encoding: "utf8" }).trim();
  const style = JSON.parse(readFileSync("components.json", "utf8")).style;
  const usati = [...new Set(Object.values(mappa).map(registryDi))].sort();
  writeFileSync(
    join(UPSTREAM_DIR, "PROVENIENZA.md"),
    `# Sorgenti originali — NON modificare\n\n` +
      `Copia intatta dei componenti come il registry di origine li distribuisce,\n` +
      `scaricata con \`shadcn view\`. Serve a un solo scopo: sapere, alla prossima\n` +
      `versione, cosa è cambiato a monte e cosa invece avevamo cambiato noi.\n\n` +
      `**La provenienza è per file, non per cartella**, e sta in \`provenienze.json\`:\n` +
      `da M4ter.1 i registry di origine sono due. Quale file venga da quale item lo\n` +
      `dice quel file; qui sotto c'è solo il riassunto.\n\n` +
      `| | |\n|---|---|\n| CLI shadcn | ${versione} |\n| \`style\` | ${style} |\n` +
      `| aggiornato il | ${new Date().toISOString().slice(0, 10)} |\n\n` +
      `## Registry di origine\n\n` +
      `| registry | chi | licenza | avviso da conservare nel file | file |\n|---|---|---|---|---:|\n` +
      usati
        .map((r) => {
          const o = REGISTRI_ORIGINE[r];
          const n = Object.values(mappa).filter((i) => registryDi(i) === r).length;
          return `| \`${r}\` | ${o?.etichetta ?? "?"} | ${o?.licenza ?? "?"} | ${
            o?.avvisoDaConservare ? `sì — «${o.avvisoDaConservare}»` : "no"
          } | ${n} |`;
        })
        .join("\n") +
      `\n\nUn terzo registry si aggiunge con **una riga** in \`REGISTRI_ORIGINE\`\n` +
      `(\`scripts/check-registry.ts\`), più una riga per file in \`provenienze.json\`.\n\n` +
      `Si rigenera con \`npm run check:registry -- --snapshot\`.\n`,
  );
  console.log(`\n✔ ${join(UPSTREAM_DIR, "PROVENIENZA.md")} — CLI ${versione}, style ${style}`);
}

/**
 * La mappa delle provenienze è un file dati, quindi può essere sbagliata: un
 * file senza riga, una riga che punta a un registry che non esiste, una riga
 * rimasta dopo che il file è stato tolto. Tutti e tre i casi rompono
 * `--snapshot` in silenzio — scaricherebbe l'originale sbagliato, o nessuno — e
 * il confronto di forma che ne segue direbbe il falso con la faccia di sempre.
 *
 * Più l'obbligo di licenza: dove il registry d'origine chiede di conservare un
 * avviso, il nostro file lo deve contenere, o la ridistribuzione alle app non è
 * coperta. È l'unico controllo del gate che non guarda la *forma* ma il
 * *diritto* di spedire il file.
 */
function controllaProvenienze(): void {
  const mappa = provenienze();
  const presenti = new Set(fileUi().map((f) => basename(f)));

  for (const [file, item] of Object.entries(mappa)) {
    const reg = registryDi(item);
    const origine = REGISTRI_ORIGINE[reg];
    if (!origine) {
      err(
        PROVENIENZE_FILE,
        `\`${file}\` viene da \`${item}\`, ma \`${reg}\` non è fra i registry di origine ` +
          `(${Object.keys(REGISTRI_ORIGINE).join(", ")}). Se è un registry nuovo, va aggiunto ` +
          `a REGISTRI_ORIGINE in scripts/check-registry.ts — una riga — con la sua licenza.`,
      );
      continue;
    }
    if (!presenti.has(file)) {
      err(PROVENIENZE_FILE, `dichiara \`${file}\`, che in ${UI_DIR} non esiste (più?).`);
      continue;
    }
    if (!origine.avvisoDaConservare) continue;
    const testo = readFileSync(join(UI_DIR, file), "utf8");
    if (!testo.includes(origine.avvisoDaConservare)) {
      err(
        file,
        `viene da ${origine.etichetta} (${origine.licenza}) e NOI LO RIDISTRIBUIAMO alle app, ` +
          `ma l'avviso «${origine.avvisoDaConservare}» non è più nel file. È l'unica condizione ` +
          `che quella licenza pone: senza, la ridistribuzione non è coperta. Va rimesso.`,
      );
    }
  }

  for (const file of presenti) {
    if (mappa[file]) continue;
    if (!existsSync(join(UPSTREAM_DIR, file))) continue; // → ramo «componente nostro»
    err(
      PROVENIENZE_FILE,
      `\`${file}\` ha un originale in ${UPSTREAM_DIR} ma nessuna riga qui: non si sa da quale ` +
        `registry riscaricarlo, e \`--snapshot\` lo prenderebbe da @shadcn per inerzia.`,
    );
  }
}

// ── 1-3. Confronto con l'originale ─────────────────────────────────────────

function controllaComponenti(): { ristilati: number; token: Set<string> } {
  const tokenUsati = new Set<string>();
  let ristilati = 0;

  for (const path of fileUi()) {
    const nome = basename(path);
    const nostro = readFileSync(path, "utf8");
    const originalePath = join(UPSTREAM_DIR, nome);

    // 6. Token: cosa usa questo componente (dalle sole stringhe di classi).
    for (const s of estraiStringhe(nostro)) {
      for (const m of s.matchAll(
        new RegExp(`(?:^|[\\s"'\`:\\[])(?:${COLOR_PREFIXES.join("|")})-([a-z][a-z0-9-]*)`, "g"),
      )) {
        tokenUsati.add(m[1]!);
      }
      // Un hex dentro un selettore d'attributo — `[stroke='#ccc']` — non è un
      // colore che scriviamo: è un colore che *intercettiamo*. Recharts cuce
      // #ccc e #fff nel proprio SVG, e la sola via per rimpiazzarli coi token
      // è agganciarli per attributo (`chart.tsx`, M2.8). Toglierli non
      // ripulirebbe niente: spegnerebbe l'override e lascerebbe il grigio di
      // Recharts sulla griglia. Contati come colori nostri erano un falso
      // positivo, e un gate che ne dà si smette di leggere.
      if (/#[0-9a-fA-F]{3,8}\b/.test(s.replace(/\[[a-z-]+=['"]?#[0-9a-fA-F]{3,8}['"]?\]/g, "")))
        err(nome, `colore esadecimale nel sorgente: ${s}`);
    }

    if (!existsSync(originalePath)) {
      const proprio = componentiPropri().find((c) => c.file === nome);
      if (!proprio) {
        err(
          nome,
          `non ha un originale in ${UPSTREAM_DIR} e non è dichiarato in ${PROPRI_FILE}.\n` +
            `      Se viene da un registry: si aggiunge la riga in ${PROVENIENZE_FILE}\n` +
            `      (\`"${nome}": "@registry/item"\`), poi npm run check:registry -- --snapshot ${basename(nome, ".tsx")}\n` +
            `      — e va fatto PRIMA di ri-stilarlo, o l'originale registrato sarebbe già il nostro.\n` +
            `      Se è un componente nostro: non si scrive di iniziativa. Prima si esaurisce la scala\n` +
            `      della regola 4bis (default shadcn → ri-stile → adattare il design system), poi si\n` +
            `      PROPONE a Francesco, e solo con la sua conferma si aggiunge la riga nel registro.`,
        );
        continue;
      }
      const vuoti = (["cosaFa", "stradaShadcnProvata", "approvatoDa", "data"] as const).filter(
        (k) => !proprio[k],
      );
      if (vuoti.length > 0) {
        err(nome, `dichiarato in ${PROPRI_FILE} ma senza ${vuoti.join(", ")}.`);
      } else {
        console.log(
          `  ▣ ${nome.padEnd(24)} componente NOSTRO — ${proprio.cosaFa} (approvato da ${proprio.approvatoDa}, ${proprio.data})`,
        );
      }
      continue;
    }
    const originale = readFileSync(originalePath, "utf8");

    /*
     * Il segnaposto d'icona toglie la FORMA dal confronto, non le stringhe.
     *
     * Fino a M2.2 questo ramo usciva con `continue`, e si portava via anche il
     * controllo dei valori arbitrari (punto 4). Conseguenza: `spinner`,
     * `checkbox` e `select` erano gli unici file del registry dove un valore
     * arbitrario NOSTRO non sarebbe stato visto da nessuno — e con M2.2 quei
     * file diventano tre su venti. Un gate che tace su un file intero è peggio
     * di un gate che grida: nel secondo caso almeno si sa che c'è.
     */
    const segnaposto = originale.includes("IconPlaceholder");
    if (segnaposto) {
      warn(
        nome,
        "l'originale shadcn usa <IconPlaceholder>, che la CLI risolve a `add` sulla libreria " +
          "d'icone di components.json. Il confronto di FORMA qui non dice nulla (le stringhe di " +
          "classi sono controllate lo stesso): alla prossima versione di shadcn questo file va " +
          "riletto a mano.",
      );
    } else if (forma(nostro) !== forma(originale)) {
      err(
        nome,
        "diverge dall'originale FUORI dalle stringhe di classi: struttura, props, nomi di varianti o export. " +
          "È il tipo di modifica che non si riesce più a riportare su una versione nuova di shadcn.",
      );
      continue;
    }

    // 4. Valori arbitrari: nostri = errore, ereditati dall'originale = avviso.
    const nostreStringhe = estraiStringhe(nostro);
    const originaliStringhe = estraiStringhe(originale);
    const arbitrariOriginali = new Set(
      originaliStringhe.flatMap((s) => [...s.matchAll(ARBITRARIO_RE)].map((m) => m[0])),
    );
    const gia = new Set<string>();
    let diverse = 0;
    // Col segnaposto le due liste possono non allinearsi: il conto del ri-stile
    // si tiene solo se hanno la stessa lunghezza. Il set `arbitrariOriginali`
    // invece è per contenuto, quindi resta valido comunque.
    const allineate = nostreStringhe.length === originaliStringhe.length;
    for (let i = 0; i < nostreStringhe.length; i++) {
      if (allineate && nostreStringhe[i] !== originaliStringhe[i]) diverse++;
      for (const m of nostreStringhe[i]!.matchAll(ARBITRARIO_RE)) {
        if (gia.has(m[0])) continue;
        gia.add(m[0]);
        if (ELENCO_PROPRIETA_RE.test(m[0])) continue;
        if (arbitrariOriginali.has(m[0])) {
          warn(nome, `valore arbitrario ereditato da shadcn, da ripulire ri-stilando: ${m[0]}`);
        } else {
          err(nome, `valore arbitrario introdotto da noi (regola 3 del CLAUDE.md): ${m[0]}`);
        }
      }
    }
    if (diverse > 0) ristilati++;
    /*
     * Una riga sola per componente. Fino a M2.3 il ramo del segnaposto
     * stampava la sua riga e poi CADEVA QUI, aggiungendone una seconda che
     * diceva «forma identica all'originale» — cioè esattamente l'affermazione
     * che la riga sopra aveva appena dichiarato impossibile. Con undici
     * overlay in più erano sette componenti raccontati due volte, e in
     * contraddizione. Il conto del ri-stile, col segnaposto, non è affidabile
     * (le due liste di stringhe possono non allinearsi), quindi non si stampa.
     */
    const simbolo = segnaposto ? "◌" : diverse > 0 ? "◐" : "○";
    // Da M4ter.1 la provenienza si dice: con due registry, «l'originale» non è
    // più una cosa sola, e un file reui letto come shadcn sarebbe confrontato
    // con l'originale di qualcun altro.
    const item = provenienze()[nome];
    const da = item && registryDi(item) !== "@shadcn" ? ` [${item}]` : "";
    const nota = segnaposto
      ? "originale a segnaposto d'icona: la forma non è confrontabile"
      : diverse > 0
        ? `forma identica all'originale, ${diverse} stringhe di classi ri-stilate`
        : "forma identica all'originale, nessun ri-stile";
    console.log(`  ${simbolo} ${nome.padEnd(24)} ${nota}${da}`);
  }
  return { ristilati, token: tokenUsati };
}

// ── 5. Il tema deve continuare a definire tutti i token standard ───────────

function tokenDelTema(): Set<string> {
  if (!existsSync(THEME_FILE)) return new Set();
  const css = readFileSync(THEME_FILE, "utf8");
  const root = css.slice(css.indexOf(":root"), css.indexOf("@theme"));
  return new Set([...root.matchAll(/^\s+--([a-z0-9-]+):/gm)].map((m) => m[1]!));
}

/**
 * I nomi di corpo che Tailwind espone di suo. Servono a distinguere i due
 * difetti muti, che hanno rimedi opposti: un `text-4xl` ESISTE come utility e
 * rende — semplicemente non scala con la densità, perché i due blocchi
 * `[data-density]` ridichiarano i soli gradini che il tema tara; un `text-md`
 * non esiste affatto, non emette niente, e il testo eredita la misura del
 * genitore. Nessuno dei due è un errore di compilazione (M1.6, D16 §30).
 */
const CORPI_TAILWIND = new Set([
  "xs", "sm", "base", "lg", "xl",
  "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl",
]);

/**
 * `text-*` non è solo il corpo: è anche il colore (`text-muted-foreground`),
 * l'allineamento, l'andare a capo e il troncamento. Quelle qui sotto sono le
 * utility `text-` che NON sono né un corpo né un colore del tema, e vanno
 * elencate o il gate le scambierebbe per gradini inventati.
 */
const TEXT_NON_CORPO = new Set([
  "left", "center", "right", "justify", "start", "end",
  "wrap", "nowrap", "balance", "pretty",
  "ellipsis", "clip",
  "transparent", "current", "inherit", "black", "white",
]);

/** I gradini che il tema tara davvero, letti dal CSS generato. */
function corpiDelTema(): Set<string> {
  if (!existsSync(THEME_FILE)) return new Set();
  const css = readFileSync(THEME_FILE, "utf8");
  return new Set(
    [...css.matchAll(/--text-([a-z0-9]+)\s*:/g)].map((m) => m[1]!),
  );
}

/**
 * Regola 3 applicata ai corpi: ogni `text-*` scritto nel registry o è un
 * gradino che il tema tara, o è un colore, o è una delle utility qui sopra.
 * Tutto il resto è uno dei due difetti muti, e da qui in poi è un errore.
 */
function controllaCorpi(temaColori: Set<string>): void {
  const corpi = corpiDelTema();
  for (const path of [...fileUi(), ...fileBlocchi()]) {
    const nome = basename(path);
    for (const s of estraiStringhe(readFileSync(path, "utf8"))) {
      for (const m of s.matchAll(/(?:^|[\s"'`:[])text-([a-z0-9][a-z0-9-]*)/g)) {
        const n = m[1]!;
        if (corpi.has(n) || temaColori.has(n) || SHADCN_TOKENS.has(n)) continue;
        if (TEXT_NON_CORPO.has(n)) continue;
        if (CORPI_TAILWIND.has(n)) {
          err(
            nome,
            `\`text-${n}\` è un gradino di Tailwind che il tema NON tara: rende, ma ` +
              `NON scala con la densità — uguale in normale e in touch, senza avviso. ` +
              `Si tara in TIPOGRAFIA (scripts/hex-to-oklch.ts), o si usa un gradino tarato.`,
          );
        } else {
          err(
            nome,
            `\`text-${n}\` non è un'utility Tailwind e il tema non la definisce: ` +
              `non emette niente, e il testo eredita la misura del genitore. Refuso?`,
          );
        }
      }
    }
  }
}

function main(): void {
  const args = process.argv.slice(2);
  if (args.includes("--snapshot")) {
    snapshot(args.filter((a) => !a.startsWith("--")));
    return;
  }

  console.log("\nComponenti — forma rispetto all'originale del registry di origine\n");
  const { ristilati, token } = controllaComponenti();
  if (fileUi().length === 0) console.log("  (nessun componente: la FASE 2 non è iniziata)");

  if (fileBlocchi().length > 0) {
    console.log("\nBlocchi — solo regola 3 (niente hex, niente valori arbitrari)\n");
    for (const t of controllaBlocchi()) token.add(t);
  }

  // Voci del registro che non corrispondono più a un file: si tolgono.
  const presenti = new Set(fileUi().map((f) => basename(f)));
  for (const c of componentiPropri()) {
    if (!presenti.has(c.file)) {
      err(PROPRI_FILE, `dichiara \`${c.file}\`, che in ${UI_DIR} non esiste (più?).`);
    }
  }

  controllaProvenienze();

  const tema = tokenDelTema();
  controllaCorpi(tema);
  const mancanti = [...SHADCN_TOKENS].filter((t) => !tema.has(t));
  if (mancanti.length > 0) {
    err(
      THEME_FILE,
      `il tema non definisce più ${mancanti.length} token standard shadcn (${mancanti.join(", ")}). ` +
        "Un componente non ancora ri-stilato che li usa renderebbe senza colore.",
    );
  }
  const custom = [...tema].filter((t) => !SHADCN_TOKENS.has(t)).sort();

  // Solo i nomi che hanno la FORMA di un token: le utility Tailwind non-colore
  // (`border-transparent`, `shadow-sm`, `outline-none`) non sono refusi nostri.
  const ignoti = [...token].filter(
    (t) => !tema.has(t) && !SHADCN_TOKENS.has(t) && FORMA_TOKEN.test(t),
  );
  const suCustom = [...token].filter((t) => tema.has(t) && !SHADCN_TOKENS.has(t)).sort();

  console.log(`\nToken\n`);
  console.log(`  ${tema.size} definiti dal tema, di cui ${custom.length} custom Tassullo`);
  console.log(`  ${SHADCN_TOKENS.size - mancanti.length}/${SHADCN_TOKENS.size} token standard shadcn presenti`);
  console.log(
    `  ${suCustom.length} token custom usati DENTRO i componenti` +
      (suCustom.length > 0 ? `: ${suCustom.join(", ")}` : " — nessuno"),
  );
  if (suCustom.length > 0) {
    console.log(
      `    Non è un errore: è il costo di aggiornamento. Ogni token custom usato in un\n` +
        `    componente è una riga in più da riportare a mano quando shadcn lo aggiorna.`,
    );
  }
  for (const t of ignoti) {
    err("token", `\`*-${t}\` ha la forma di un token del tema ma il tema non lo definisce: refuso?`);
  }

  const errori = problemi.filter((p) => p.livello === "errore");
  const avvisi = problemi.filter((p) => p.livello === "avviso");
  console.log("");
  for (const p of [...errori, ...avvisi]) {
    console.log(`  ${p.livello === "errore" ? "✖" : "•"} ${p.dove}: ${p.cosa}`);
  }
  const propri = componentiPropri().length;
  console.log(
    `\n${errori.length === 0 ? "✔" : "✖"} ${errori.length} errore/i, ${avvisi.length} avviso/i` +
      `, ${propri} componente/i nostro/i dichiarato/i` +
      ` — ${ristilati} componente/i ri-stilato/i sopra una forma originale intatta.\n`,
  );
  if (errori.length > 0) process.exit(1);
}

main();
