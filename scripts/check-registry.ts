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
const UPSTREAM_DIR = "registry/.upstream";
const THEME_FILE = "registry/tassullo/theme/tassullo-theme.css";
const PROPRI_FILE = "registry/componenti-propri.json";

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

function estraiStringhe(src: string): string[] {
  return (src.replace(USE_CLIENT_RE, "").match(STRING_RE) ?? []).map(normalizzaClassi);
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
 */
const USE_CLIENT_RE = /^\s*(["'])use client\1\s*;?\s*/;

function forma(src: string): string {
  return src
    .replace(USE_CLIENT_RE, "")
    .replace(STRING_RE, '"·"')
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n]*/g, " ")
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

function snapshot(nomi: string[]): void {
  mkdirSync(UPSTREAM_DIR, { recursive: true });
  const daScaricare = nomi.length > 0 ? nomi : fileUi().map((f) => basename(f, ".tsx"));
  if (daScaricare.length === 0) {
    console.log("Nessun componente in " + UI_DIR + ": niente da scaricare.");
    return;
  }
  for (const nome of daScaricare) {
    const out = execFileSync("npx", ["shadcn@latest", "view", `@shadcn/${nome}`], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    const items = JSON.parse(out.slice(out.indexOf("[")));
    for (const item of items) {
      for (const file of item.files ?? []) {
        const dest = join(UPSTREAM_DIR, basename(file.path));
        writeFileSync(dest, file.content);
        console.log(`✔ ${dest}  ←  @shadcn/${nome} (${file.path})`);
      }
    }
  }
  const versione = execFileSync("npx", ["shadcn@latest", "--version"], { encoding: "utf8" }).trim();
  const style = JSON.parse(readFileSync("components.json", "utf8")).style;
  writeFileSync(
    join(UPSTREAM_DIR, "PROVENIENZA.md"),
    `# Sorgenti originali shadcn — NON modificare\n\n` +
      `Copia intatta dei componenti come shadcn li distribuisce, scaricata con\n` +
      `\`shadcn view\`. Serve a un solo scopo: sapere, alla prossima versione di\n` +
      `shadcn, cosa è cambiato a monte e cosa invece avevamo cambiato noi.\n\n` +
      `| | |\n|---|---|\n| CLI shadcn | ${versione} |\n| \`style\` | ${style} |\n` +
      `| aggiornato il | ${new Date().toISOString().slice(0, 10)} |\n\n` +
      `Si rigenera con \`npm run check:registry -- --snapshot\`.\n`,
  );
  console.log(`\n✔ ${join(UPSTREAM_DIR, "PROVENIENZA.md")} — CLI ${versione}, style ${style}`);
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
      if (/#[0-9a-fA-F]{3,8}\b/.test(s)) err(nome, `colore esadecimale nel sorgente: ${s}`);
    }

    if (!existsSync(originalePath)) {
      const proprio = componentiPropri().find((c) => c.file === nome);
      if (!proprio) {
        err(
          nome,
          `non ha un originale in ${UPSTREAM_DIR} e non è dichiarato in ${PROPRI_FILE}.\n` +
            `      Se viene da shadcn: npm run check:registry -- --snapshot ${basename(nome, ".tsx")}\n` +
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
    const nota = segnaposto
      ? "originale a segnaposto d'icona: la forma non è confrontabile"
      : diverse > 0
        ? `forma identica all'originale, ${diverse} stringhe di classi ri-stilate`
        : "forma identica all'originale, nessun ri-stile";
    console.log(`  ${simbolo} ${nome.padEnd(24)} ${nota}`);
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

function main(): void {
  const args = process.argv.slice(2);
  if (args.includes("--snapshot")) {
    snapshot(args.filter((a) => !a.startsWith("--")));
    return;
  }

  console.log("\nComponenti — forma rispetto all'originale shadcn\n");
  const { ristilati, token } = controllaComponenti();
  if (fileUi().length === 0) console.log("  (nessun componente: la FASE 2 non è iniziata)");

  // Voci del registro che non corrispondono più a un file: si tolgono.
  const presenti = new Set(fileUi().map((f) => basename(f)));
  for (const c of componentiPropri()) {
    if (!presenti.has(c.file)) {
      err(PROPRI_FILE, `dichiara \`${c.file}\`, che in ${UI_DIR} non esiste (più?).`);
    }
  }

  const tema = tokenDelTema();
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
      ` — ${ristilati} componente/i ri-stilato/i sopra una forma shadcn intatta.\n`,
  );
  if (errori.length > 0) process.exit(1);
}

main();
