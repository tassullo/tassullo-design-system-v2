#!/usr/bin/env node
/**
 * Il controllo del Design System Tassullo 2.0, per le app.
 *
 * Si lancia dalla cartella dell'app che contiene `components.json`:
 *
 *   node scripts/tassullo-controllo.mjs              il controllo completo
 *   node scripts/tassullo-controllo.mjs --solo-stile senza rete: solo le regole sul codice
 *   node scripts/tassullo-controllo.mjs --self-test  prova che il controllo sa fallire
 *
 * Esce con codice 1 se trova anche una sola violazione. Va messo fra le
 * verifiche automatiche che l'app lancia a ogni push, accanto a `tsc` e alla build.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";

const RADICE = process.cwd();
const a = (p) => p.split(sep).join("/");

// ── Le regole sul codice dell'app ───────────────────────────────────────────
// Valgono per i file scritti dall'app, non per quelli installati dal design
// system. Una riga che deve fare eccezione porta, sulla riga stessa o su quella
// sopra, un commento `tassullo-controllo: <il motivo>`; senza motivo non vale.

const FILE_DI_CODICE = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css"]);
const COLORI =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone";

const REGOLE = [
  {
    id: "valore-arbitrario",
    cerca: /(?<![\w[&-])[a-z][a-z0-9]*(?:-[a-z0-9]+)*-\[[^\]\s]+\](?!:)/,
    dove: FILE_DI_CODICE,
    perché:
      "valore arbitrario: le utility si scrivono solo sui token del tema (`h-8`, non `h-[37px]`). " +
      "Le parentesi nei selettori (`[&_svg]:`, `has-[>svg]:`) vanno bene.",
  },
  {
    id: "esadecimale",
    cerca: /(?<![\w&#])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/,
    dove: FILE_DI_CODICE,
    perché: "colore esadecimale: i colori vengono dai token del tema (`bg-card`, `text-muted-foreground`).",
  },
  {
    id: "tavolozza-standard",
    cerca: new RegExp(
      `\\b(?:bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|divide|shadow|caret|placeholder)-(?:(?:${COLORI})-\\d{2,3}|white|black)\\b`
    ),
    dove: FILE_DI_CODICE,
    perché: "colore della tavolozza standard di Tailwind: non è un token del tema.",
  },
  {
    id: "arancio-o-rosso-come-testo",
    cerca: /\btext-(?:primary|destructive)(?![\w-])/,
    dove: FILE_DI_CODICE,
    perché:
      "`text-primary` e `text-destructive` non si leggono: il testo arancio è `text-accent-ink`, " +
      "il rosso passa dalla variante `destructive` del componente (o `text-destructive-subtle-foreground`).",
  },
  {
    id: "gradino-di-testo",
    cerca: /\btext-(?:md|title|[4-9]xl)\b/,
    dove: FILE_DI_CODICE,
    perché:
      "gradino di testo fuori dal tema: `text-md` e `text-title` non esistono (non fanno niente), " +
      "`text-4xl` e oltre non crescono con la densità. I gradini sono `text-xs` … `text-3xl`.",
  },
  {
    id: "numeri",
    cerca: /\bIntl\.NumberFormat\b|\.toLocaleString\(/,
    dove: FILE_DI_CODICE,
    perché:
      "i numeri si formattano con `intero()`, `decimale()`, `valuta()` di `@/lib/numeri`, che scrivono " +
      "sempre il punto delle migliaia. Per una data, `toLocaleDateString`.",
  },
  {
    id: "finestre-del-browser",
    cerca: /\bwindow\.(?:confirm|prompt|alert)\s*\(|(?<![\w.$])(?:confirm|prompt|alert)\s*\(/,
    dove: new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]),
    perché:
      "finestra del browser: una conferma è `tassullo-confirm-dialog` (anche col campo obbligatorio), " +
      "un messaggio è un `toast` o un `Alert`.",
  },
  {
    id: "tendina-nativa",
    cerca: /<(?:select|datalist)\b/,
    dove: new Set([".tsx", ".jsx"]),
    perché: "tendina nativa: si sceglie da una lista con `select` (corta) o `combobox` (lunga).",
  },
  {
    id: "design-system-precedente",
    cerca: /@tassullo\/theme\b/,
    dove: new Set([...FILE_DI_CODICE, ".json", ".html"]),
    perché: "`@tassullo/theme` è il design system precedente: l'app usa solo il Design System Tassullo 2.0.",
  },
  {
    id: "carattere-esterno",
    cerca: /@fontsource|fonts\.googleapis\.com|fonts\.gstatic\.com/,
    dove: new Set([...FILE_DI_CODICE, ".json", ".html"]),
    perché: "il carattere è Inter e arriva col tema: nessun altro carattere, nessuna richiesta di rete.",
  },
];

// ── Le regole sul tag intero ────────────────────────────────────────────────
// Alcune forme non stanno su una riga: un `<Button` si scrive spesso con le
// props a capo. Queste regole leggono il tag d'apertura intero, dal `<Nome`
// al suo `>`, contando le graffe e saltando le stringhe. L'eccezione vale sulla
// riga dove il tag comincia, o sul commento che sta da solo sopra.

const REGOLE_TAG = [
  {
    id: "collegamento-come-bottone",
    tag: "Button",
    // `render` di un `<a>` o di un componente che finisce per `Link` (`Link`,
    // `NavLink`…), scritto come prop o dentro un oggetto sparso nel tag.
    cerca: /\brender\s*(?:=\s*\{|:)\s*<\s*(?:a|(?:[A-Z]\w*)?Link)\b/,
    dove: new Set([".tsx", ".jsx"]),
    perché:
      "un collegamento non è un `Button`: `Button` col `render` di un `<a>` o di un `Link` scrive un errore " +
      "in console e mette `type=\"button\"` sul link, e con `nativeButton={false}` il link diventa un bottone. " +
      "Si usa il `Link` del router (o un `<a>`) con l'aspetto preso da `buttonVariants`: " +
      "`<Link to=\"…\" className={buttonVariants({ variant: \"outline\" })}>`.",
  },
];

/** I tag d'apertura `<Nome …>` di un testo, ciascuno con la riga dove comincia. */
function tagDApertura(testo, nome) {
  const trovati = [];
  const re = new RegExp(`<${nome}(?![\\w.])`, "g");
  let m;
  while ((m = re.exec(testo))) {
    let i = m.index + nome.length + 1;
    let graffe = 0;
    let stringa = null;
    for (; i < testo.length; i++) {
      const c = testo[i];
      if (stringa) {
        if (c === stringa && testo[i - 1] !== "\\") stringa = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") stringa = c;
      else if (c === "{") graffe++;
      else if (c === "}") graffe--;
      else if (c === ">" && graffe === 0) break;
    }
    const inizioRiga = testo.lastIndexOf("\n", m.index) + 1;
    // Un tag dentro un commento non è codice.
    if (/^\s*(?:\/\/|\*|\/\*)/.test(testo.slice(inizioRiga, m.index))) continue;
    trovati.push({ riga: testo.slice(0, m.index).split("\n").length, tag: testo.slice(m.index, i + 1) });
  }
  return trovati;
}

/** Le violazioni delle regole sul tag in un file, tolte quelle con un'eccezione motivata. */
function tagViolati(testo, estensione) {
  const righe = testo.split("\n");
  const violazioni = [];
  let eccezioni = 0;
  for (const regola of REGOLE_TAG) {
    if (!regola.dove.has(estensione)) continue;
    for (const { riga, tag } of tagDApertura(testo, regola.tag)) {
      if (!regola.cerca.test(tag)) continue;
      const qui = righe[riga - 1] ?? "";
      const sopra = riga > 1 ? righe[riga - 2] : "";
      const soloCommento = /^\s*(?:\/\/|\/\*|\{\/\*|\*)/.test(sopra);
      if (ECCEZIONE.test(qui) || (soloCommento && ECCEZIONE.test(sopra))) {
        eccezioni++;
        continue;
      }
      violazioni.push({ riga, regola, testo: tag.replace(/\s+/g, " ") });
    }
  }
  return { violazioni, eccezioni };
}

// Il motivo è testo: la chiusura di un commento subito dopo i due punti non conta.
const ECCEZIONE = /tassullo-controllo:\s*(?!\*\/)(\S.{2,})/;

/** Le violazioni di una riga, tolte quelle che portano un'eccezione motivata. */
function regoleViolate(riga, precedente, estensione) {
  // L'eccezione vale sulla riga che la porta, o sulla riga dopo un commento che sta da solo.
  const soloCommento = /^\s*(?:\/\/|\/\*|\{\/\*|\*)/.test(precedente);
  if (ECCEZIONE.test(riga) || (soloCommento && ECCEZIONE.test(precedente))) return { violate: [], eccezione: true };
  return {
    violate: REGOLE.filter((r) => r.dove.has(estensione) && r.cerca.test(riga)),
    eccezione: false,
  };
}

// ── components.json ─────────────────────────────────────────────────────────

function controllaConfigurazione(config) {
  const errori = [];
  if (config.style !== "base-nova")
    errori.push(`\`style\` vale \`${config.style}\`: deve valere \`base-nova\`, o le primitive installate non sono quelle Base UI.`);
  const url = config.registries?.["@tassullo"];
  const indirizzo = typeof url === "string" ? url : url?.url;
  if (!indirizzo) errori.push("manca il registry `@tassullo` fra i `registries`.");
  else if (/\/main\//.test(indirizzo))
    errori.push(
      "il registry `@tassullo` punta a `main`: in un'app in produzione si fissa un'etichetta di versione " +
        "(per esempio `v2.0.0`), o ogni installazione porta quello che c'è quel giorno."
    );
  return { errori, indirizzo };
}

// ── Dove finiscono nell'app i file del design system ───────────────────────

function cartellaDiAlias(alias, riserva) {
  const valore = alias ?? riserva;
  return valore.startsWith("@/") ? `src/${valore.slice(2)}` : valore;
}

function percorsiAttesi(indice, config) {
  const al = config.aliases ?? {};
  const cartelle = {
    ui: cartellaDiAlias(al.ui, "@/components/ui"),
    components: cartellaDiAlias(al.components, "@/components"),
    lib: cartellaDiAlias(al.lib, "@/lib"),
    hooks: cartellaDiAlias(al.hooks, "@/hooks"),
  };
  const attesi = new Map();
  for (const item of indice.items ?? []) {
    for (const f of item.files ?? []) {
      const nome = f.path.split("/").pop();
      let dove;
      if (f.target) {
        const t = f.target.replace(/^~\//, "");
        dove = f.target.startsWith("~/") || t.startsWith("src/") || !existsSync(join(RADICE, "src")) ? t : `src/${t}`;
      } else if (f.type === "registry:hook") dove = `${cartelle.hooks}/${nome}`;
      else if (f.type === "registry:lib") dove = `${cartelle.lib}/${nome}`;
      else if (f.type === "registry:ui") dove = `${cartelle.ui}/${nome}`;
      else dove = `${cartelle.components}/${nome}`;
      attesi.set(dove, item.name);
    }
  }
  return { attesi, cartelle };
}

// ── La riga di comando di shadcn, per confrontare i file installati ────────

function shadcn(argomenti) {
  const locale = join(RADICE, "node_modules", ".bin", process.platform === "win32" ? "shadcn.cmd" : "shadcn");
  const [cmd, pre] = existsSync(locale) ? [locale, []] : ["npx", ["--yes", "shadcn@latest"]];
  const r = spawnSync(cmd, [...pre, ...argomenti], {
    cwd: RADICE,
    input: "",
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 64 * 1024 * 1024,
  });
  return { codice: r.status, testo: `${r.stdout ?? ""}${r.stderr ?? ""}`.replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, "") };
}

/** Le righe del diff che contano: non l'intestazione e non `"use client"`, che la CLI mette e toglie da sé. */
function righeDiDiffCheContano(testo) {
  return testo
    .split("\n")
    .filter((r) => /^\s*│ │ [-+]/.test(r))
    .map((r) => r.replace(/^\s*│ │ /, ""))
    .filter((r) => !/^(?:---|\+\+\+) /.test(r))
    .filter((r) => r.slice(1).trim() !== "" && r.slice(1).trim() !== '"use client"');
}

function controllaFileInstallati(installati) {
  const errori = [];
  if (installati.size === 0) return errori;
  const nomi = [...installati].map((n) => `@tassullo/${n}`);
  const { codice, testo } = shadcn(["add", ...nomi, "--dry-run"]);
  if (codice !== 0 || !/Files \(\d+\)/.test(testo)) {
    errori.push(
      "non riesco a confrontare i file installati con il registry (la riga di comando di shadcn ha " +
        `risposto con un errore). Controlla la rete e l'indirizzo in \`components.json\`.\n${testo.trim().split("\n").slice(-6).join("\n")}`
    );
    return errori;
  }
  const modificati = [...testo.matchAll(/~\s+(\S+)\s+overwrite/g)].map((m) => m[1]);
  for (const file of modificati) {
    const diff = shadcn(["add", ...nomi, "--dry-run", "--diff", file]);
    const righe = righeDiDiffCheContano(diff.testo);
    if (righe.length === 0) continue;
    errori.push(
      `${file}: è diverso da quello del design system alla versione scritta in \`components.json\`. ` +
        "I file del design system non si modificano nell'app: se serve una modifica, si propone al design " +
        `system. Differenze:\n${righe.slice(0, 8).map((r) => `      ${r}`).join("\n")}` +
        (righe.length > 8 ? `\n      … e altre ${righe.length - 8} righe` : "")
    );
  }
  return errori;
}

// ── I file dell'app ─────────────────────────────────────────────────────────

function elenca(cartella) {
  const assoluta = join(RADICE, cartella);
  if (!existsSync(assoluta)) return [];
  const fuori = [];
  const giro = (d) => {
    for (const voce of readdirSync(d)) {
      if (voce === "node_modules" || voce.startsWith(".")) continue;
      const p = join(d, voce);
      if (statSync(p).isDirectory()) giro(p);
      else fuori.push(a(relative(RADICE, p)));
    }
  };
  giro(assoluta);
  return fuori;
}

function controllaCodice(fileDaLeggere) {
  const violazioni = [];
  let eccezioni = 0;
  for (const file of fileDaLeggere) {
    const est = extname(file);
    const testo = readFileSync(join(RADICE, file), "utf8");
    const righe = testo.split("\n");
    righe.forEach((riga, i) => {
      const { violate, eccezione } = regoleViolate(riga, i > 0 ? righe[i - 1] : "", est);
      if (eccezione) eccezioni++;
      for (const r of violate) violazioni.push({ file, riga: i + 1, regola: r, testo: riga.trim() });
    });
    const sulTag = tagViolati(testo, est);
    eccezioni += sulTag.eccezioni;
    for (const v of sulTag.violazioni) violazioni.push({ file, ...v });
  }
  return { violazioni, eccezioni };
}

// ── Il controllo completo ───────────────────────────────────────────────────

async function controlla({ soloStile }) {
  const percorsoConfig = join(RADICE, "components.json");
  if (!existsSync(percorsoConfig)) {
    console.error("✖ Non trovo components.json: il controllo si lancia dalla cartella dell'app che lo contiene.");
    process.exit(1);
  }
  const config = JSON.parse(readFileSync(percorsoConfig, "utf8"));
  const errori = [];

  const { errori: diConfig, indirizzo } = controllaConfigurazione(config);
  errori.push(...diConfig.map((e) => `components.json: ${e}`));

  let attesi = new Map();
  let cartelle = null;
  if (!soloStile && indirizzo) {
    const url = indirizzo.replace("{name}", "registry");
    let indice;
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`${r.status}`);
      indice = await r.json();
    } catch (e) {
      errori.push(`non riesco a leggere l'indice del registry (${url}): ${e.message}.`);
    }
    if (indice) {
      ({ attesi, cartelle } = percorsiAttesi(indice, config));
      const installati = new Set([...attesi].filter(([p]) => existsSync(join(RADICE, p))).map(([, n]) => n));

      // Nelle cartelle del design system stanno solo i suoi file.
      for (const cartella of [cartelle.ui, `${cartelle.components}/blocks`, `${cartelle.components}/pages`]) {
        for (const file of elenca(cartella)) {
          if (!attesi.has(file))
            errori.push(
              `${file}: in \`${cartella}/\` stanno solo i file del design system, e questo non viene dal registry ` +
                "`@tassullo`. Un componente dell'app va in un'altra cartella; una primitiva o un blocco che manca " +
                "si propone al design system. Anche un componente installato da shadcn senza `@tassullo/` finisce qui."
            );
        }
      }
      errori.push(...controllaFileInstallati(installati));
      console.log(`  ${installati.size} item del design system installati, confrontati col registry.`);
    }
  }

  // Le regole di stile, sui file scritti dall'app.
  // Nelle cartelle del design system non si leggono le regole di stile: un file che non è
  // suo è già un errore a sé.
  const delDesignSystem = new Set(attesi.keys());
  const sue = cartelle ? [cartelle.ui, `${cartelle.components}/blocks`, `${cartelle.components}/pages`].map((c) => `${c}/`) : [];
  const daLeggere = [
    ...elenca("src").filter(
      (f) =>
        FILE_DI_CODICE.has(extname(f)) &&
        !delDesignSystem.has(f) &&
        !sue.some((c) => f.startsWith(c)) &&
        !/\/tassullo-[^/]*\.css$/.test(f)
    ),
    ...["package.json", "index.html"].filter((f) => existsSync(join(RADICE, f))),
  ];
  const { violazioni, eccezioni } = controllaCodice(daLeggere);

  console.log(`  ${daLeggere.length} file dell'app letti con le regole di stile${eccezioni ? `, ${eccezioni} righe con un'eccezione motivata` : ""}.`);
  if (errori.length === 0 && violazioni.length === 0) {
    console.log("\n✔ L'app rispetta il Design System Tassullo 2.0.\n");
    return;
  }
  console.error("");
  for (const e of errori) console.error(`✖ ${e}\n`);
  const perRegola = Map.groupBy ? Map.groupBy(violazioni, (v) => v.regola.id) : raggruppa(violazioni);
  for (const [, vs] of perRegola) {
    console.error(`✖ ${vs[0].regola.perché}`);
    for (const v of vs) console.error(`    ${v.file}:${v.riga}  ${v.testo.slice(0, 110)}`);
    console.error("");
  }
  console.error(`${errori.length + violazioni.length} violazioni. Le regole sono quelle del blocco «Stile e design system» delle istruzioni dell'app.\n`);
  process.exit(1);
}

function raggruppa(violazioni) {
  const m = new Map();
  for (const v of violazioni) m.set(v.regola.id, [...(m.get(v.regola.id) ?? []), v]);
  return m;
}

// ── La prova che il controllo sa fallire ───────────────────────────────────

function selfTest() {
  const casi = [
    ["valore-arbitrario", '<div className="h-[37px]" />', true],
    ["valore-arbitrario", 'className="bg-[#F4AC3D] p-2"', true],
    ["valore-arbitrario", 'className="[&_svg]:size-4 has-[>svg]:px-2 data-[open]:bg-muted"', false],
    ["esadecimale", "color: #fff;", true],
    ["esadecimale", 'fill="#F4AC3D"', true],
    ["esadecimale", "// in attesa di tassullo-design-system-v2#123", false],
    ["tavolozza-standard", 'className="bg-red-500 text-white"', true],
    ["tavolozza-standard", 'className="bg-accent text-foreground"', false],
    ["arancio-o-rosso-come-testo", 'className="hover:text-primary"', true],
    ["arancio-o-rosso-come-testo", 'className="text-destructive"', true],
    ["arancio-o-rosso-come-testo", 'className="text-primary-foreground text-destructive-subtle-foreground"', false],
    ["gradino-di-testo", 'className="text-md"', true],
    ["gradino-di-testo", 'className="text-4xl"', true],
    ["gradino-di-testo", 'className="text-sm text-3xl"', false],
    ["numeri", 'new Intl.NumberFormat("it-IT").format(n)', true],
    ["numeri", "totale.toLocaleString()", true],
    ["numeri", "data.toLocaleDateString('it-IT')", false],
    ["finestre-del-browser", 'if (window.confirm("Eliminare?")) cancella()', true],
    ["finestre-del-browser", 'const motivo = prompt("Motivo")', true],
    ["finestre-del-browser", "setConfirm(true); onConfirm()", false],
    ["tendina-nativa", '<select value={x}>', true],
    ["tendina-nativa", '<Select value={x}>', false],
    ["design-system-precedente", "@import '@tassullo/theme/theme.css';", true],
    ["carattere-esterno", '<link href="https://fonts.googleapis.com/css2?family=Inter">', true],
  ];
  const est = (testo) => (testo.startsWith("<link") ? ".html" : testo.includes("@import") || /^color:/.test(testo) ? ".css" : ".tsx");
  let falliti = 0;
  for (const [id, testo, atteso] of casi) {
    const trovato = regoleViolate(testo, "", est(testo)).violate.some((r) => r.id === id);
    if (trovato !== atteso) {
      falliti++;
      console.error(`  ✖ ${id}: «${testo}» ${atteso ? "doveva" : "non doveva"} essere segnalato`);
    }
  }
  const eccezioni = [
    ['className="h-[37px]" // tassullo-controllo: misura imposta dal lettore di codici', false],
    ['className="h-[37px]" // tassullo-controllo:', true],
    ['className="h-[37px]" {/* tassullo-controllo: */}', true],
  ];
  for (const [testo, atteso] of eccezioni) {
    if (regoleViolate(testo, "", ".tsx").violate.length > 0 !== atteso) {
      falliti++;
      console.error(`  ✖ eccezione: «${testo}» ${atteso ? "doveva" : "non doveva"} essere segnalato`);
    }
  }
  // Un'eccezione in fondo a una riga vale per quella riga, non per la successiva;
  // un commento che sta da solo vale per la riga sotto.
  const dopo = [
    ['<div className="w-[1px]" /> {/* tassullo-controllo: misura imposta dal lettore */}', 'className="h-[37px]"', true],
    ["// tassullo-controllo: misura imposta dal lettore di codici", 'className="h-[37px]"', false],
  ];
  for (const [prima, testo, atteso] of dopo) {
    if (regoleViolate(testo, prima, ".tsx").violate.length > 0 !== atteso) {
      falliti++;
      console.error(`  ✖ eccezione: «${testo}» ${atteso ? "doveva" : "non doveva"} essere segnalato`);
    }
  }
  // Le regole sul tag intero: il tag su una riga e su più righe, la prop dentro
  // un oggetto sparso, un `NavLink`; e le forme che non devono scattare.
  const sulTag = [
    ['<Button variant="link" render={<a href="/prodotti" />}>Prodotti</Button>', 1],
    ['<Button\n  variant="outline"\n  nativeButton={false}\n  render={<Link to="/prodotti" />}\n>\n  Torna\n</Button>', 1],
    ['<Button size="sm" {...(href ? { render: <a href={href} /> } : {})}>Apri</Button>', 1],
    ['<Button render={<NavLink to="/" />} className="has-[>svg]:px-2">Home</Button>', 1],
    ['<DropdownMenuTrigger render={<Button variant="ghost" />}>Azioni</DropdownMenuTrigger>', 0],
    ['<BreadcrumbLink render={<Link to="/" />}>Home</BreadcrumbLink>', 0],
    ['<Button render={<div />} nativeButton={false}>Trascina</Button>', 0],
    ['<Button onClick={() => apri(x > 1)} variant="link">Apri</Button>', 0],
    ['<ButtonGroup render={<a href="#" />} />', 0],
    ['// tassullo-controllo: il link apre un file scaricato dal server\n<Button render={<a href="/f" />}>Scarica</Button>', 0],
    ['<Button render={<a href="/f" />}>Scarica</Button> {/* tassullo-controllo: */}', 1],
  ];
  for (const [testo, attese] of sulTag) {
    if (tagViolati(testo, ".tsx").violazioni.length !== attese) {
      falliti++;
      console.error(`  ✖ collegamento-come-bottone: «${testo.replace(/\n/g, "⏎")}» doveva dare ${attese} violazioni`);
    }
  }
  const configurazioni = [
    [{ style: "base-nova", registries: { "@tassullo": "https://esempio.it/x/v2.0.0/public/r/{name}.json" } }, 0],
    [{ style: "new-york", registries: { "@tassullo": "https://esempio.it/x/v2.0.0/public/r/{name}.json" } }, 1],
    [{ style: "base-nova", registries: { "@tassullo": "https://esempio.it/x/main/public/r/{name}.json" } }, 1],
    [{ style: "base-nova", registries: {} }, 1],
  ];
  for (const [config, attesi] of configurazioni) {
    if (controllaConfigurazione(config).errori.length !== attesi) {
      falliti++;
      console.error(`  ✖ components.json: ${JSON.stringify(config)} doveva dare ${attesi} errori`);
    }
  }
  const diff = '- Resolving items.\n│ │ -"use client"\n│ │ -\n│ │  import * as React from "react"';
  if (righeDiDiffCheContano(diff).length !== 0) {
    falliti++;
    console.error("  ✖ un diff fatto della sola riga \"use client\" doveva essere ignorato");
  }
  if (righeDiDiffCheContano('│ │ -  "rounded-md"\n│ │ +  "rounded-lg"').length !== 2) {
    falliti++;
    console.error("  ✖ un diff vero doveva essere segnalato");
  }
  const totale = casi.length + eccezioni.length + dopo.length + sulTag.length + configurazioni.length + 2;
  if (falliti) {
    console.error(`\n✖ self-test: ${falliti} casi su ${totale} sbagliati.\n`);
    process.exit(1);
  }
  console.log(`✔ self-test: ${totale} casi, il controllo segnala ciò che deve e solo quello.`);
}

const argomenti = new Set(process.argv.slice(2));
if (argomenti.has("--self-test")) selfTest();
else await controlla({ soloStile: argomenti.has("--solo-stile") });
