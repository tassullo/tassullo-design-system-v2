/**
 * ─────────────────────────────────────────────────────────────────────────────
 * check:spedito — il decimo gate: il testo che arriva a chi installa
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * `npx shadcn add` copia nell'app il file così com'è, commenti compresi, e
 * stampa a terminale `title`, `description` e `docs` dell'item. È testo che
 * legge **chi usa il componente**, in un repo che non ha `WORKLOG.md`,
 * `docs/DECISIONI.md` né la memoria delle sessioni: un «misurato in M3.2, v.
 * §32» lì è un rimando a niente. Il commento deve dire cosa fa il codice e
 * perché, non da quale sessione viene.
 *
 * Misurato il 2026-09-23 sull'artefatto: 90 note in `description`/`docs` di
 * 38 item, 596 in 258 blocchi di commento di 53 file su 105 — di cui 251 in
 * teste che all'app non arrivano.
 *
 * **Le regole sono quelle di `check:storybook`** (`note-interne.ts`, una
 * copia sola), con una differenza: qui contano anche i `//` e i commenti che
 * la style guide non mostra, perché nell'app li legge chiunque apra il file.
 *
 * **Tranne le teste.** `shadcn add` toglie tutto ciò che sta prima della prima
 * istruzione di un `.ts`/`.tsx` e della prima regola di un CSS
 * `registry:theme` (misurato il 2026-09-23, CLI 4.21.0 — `docs/DECISIONI.md`
 * §58). Le teste non arrivano, quindi il gate non le legge, e restano il posto
 * delle note di lavoro. La premessa non si ricorda: `provaCli()` la rimisura a
 * ogni giro con la CLI del lockfile, e il gate fallisce il giorno che cambia.
 *
 * **Perché un gate a sé e non una settima fonte di `check:storybook`.** Tre
 * ragioni. Il lettore è un altro, e con lui cambia cosa è visibile (tutto,
 * qui). Si legge **l'artefatto** `public/r/`, non i sorgenti: è ciò che arriva
 * davvero, tolte le teste che `shadcn add` toglie (§58) — e
 * `check:registry-build` garantisce già che l'artefatto corrisponda ai
 * sorgenti. E durante la ripulitura (M5.1a–c) è servito un elenco di file
 * ancora da fare, che la style guide non ha mai avuto.
 *
 * **Cosa legge**, per ogni item di `registry.json`:
 *
 *   - `title`, `description` e `docs`;
 *   - di ogni file spedito (`files[].content` in `public/r/<item>.json`): nei
 *     `.ts`/`.tsx` ogni commento, ogni testo JSX e ogni stringa — un testo
 *     dell'interfaccia arriva sullo schermo dell'app —, esclusi i percorsi
 *     degli `import` e i tracciati SVG (`M3.59 3.59…` sembra una sigla); nei
 *     `.css` i commenti; negli altri file tutto il testo.
 *
 * **Nessuna esenzione.** Durante la ripulitura c'era un elenco a tetto
 * (`DA_RIPULIRE`) dei file ancora da fare, che poteva solo scendere; si è
 * svuotato in M5.1c ed è stato tolto. Da allora una nota qualunque, in
 * qualunque file spedito, fa fallire il gate.
 *
 * Uso:
 *   npm run check:spedito                  tutto; esce con 1 se qualcosa non va
 *   npm run check:spedito -- --self-test   prova che sa fallire
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import ts from "typescript";
import { note } from "./note-interne.ts";

const RADICE = process.cwd();

type Item = { name: string; title?: string; description?: string; docs?: string; files?: { path: string }[] };
type FileSpedito = { path: string; content: string; type?: string };
type Nota = { dove: string; riga: number; tipo: string; trovato: string };

/** Un tracciato SVG: solo comandi di percorso, cifre, segni e spazi. */
const TRACCIATO = /^[MmLlHhVvCcSsQqTtAaZz\d.,\s-]+$/;

/**
 * Quanto del file la CLI toglie a `add`: i commenti di testa, cioè tutto ciò
 * che sta prima della prima istruzione di un `.ts`/`.tsx` o della prima regola
 * di un CSS `registry:theme`. Un `registry:file` arriva intero. È il
 * comportamento misurato — e rimisurato a ogni giro da `provaCli()` —, non
 * una supposizione.
 */
function testaTolta(f: FileSpedito): number {
  if (/\.tsx?$/.test(f.path)) {
    const sf = ts.createSourceFile(f.path, f.content, ts.ScriptTarget.Latest, true, f.path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    // Un file senza istruzioni non si sa cosa diventi: si legge tutto.
    return sf.statements.length ? sf.statements[0]!.getStart(sf) : 0;
  }
  if (f.path.endsWith(".css") && f.type === "registry:theme") return /^(?:\s*\/\*[\s\S]*?\*\/)*\s*/.exec(f.content)![0].length;
  return 0;
}

/**
 * Il testo che arriva nell'app: la testa tolta è sostituita da altrettante
 * righe vuote, così i numeri di riga restano quelli del sorgente.
 */
function arriva(f: FileSpedito): string {
  const fine = testaTolta(f);
  return "\n".repeat(f.content.slice(0, fine).split("\n").length - 1) + f.content.slice(fine);
}

/** I brani di testo di un file spedito, con la riga in cui cominciano. */
function brani(percorso: string, testo: string): { riga: number; testo: string }[] {
  const rigaDi = (pos: number) => testo.slice(0, pos).split("\n").length;

  if (percorso.endsWith(".css")) {
    return [...testo.matchAll(/\/\*[\s\S]*?\*\//g)].map((m) => ({ riga: rigaDi(m.index!), testo: m[0] }));
  }
  if (!/\.tsx?$/.test(percorso)) return [{ riga: 1, testo }];

  const sf = ts.createSourceFile(
    percorso,
    testo,
    ts.ScriptTarget.Latest,
    true,
    percorso.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const out: { riga: number; testo: string }[] = [];
  const visti = new Set<number>();
  const commenti = (pos: number) => {
    for (const leggi of [ts.getLeadingCommentRanges, ts.getTrailingCommentRanges]) {
      for (const c of leggi(testo, pos) ?? []) {
        if (visti.has(c.pos)) continue;
        visti.add(c.pos);
        out.push({ riga: rigaDi(c.pos), testo: testo.slice(c.pos, c.end) });
      }
    }
  };
  const visita = (n: ts.Node): void => {
    // Il testo JSX non ha commenti davanti: un `//` lì dentro è testo, e si
    // legge sotto come tale.
    if (!ts.isJsxText(n)) commenti(n.pos);
    // Un `{/* … */}` è un'espressione JSX vuota: il commento sta fra le due
    // graffe e non precede nessun nodo, quindi si legge dalla graffa aperta.
    // Lo stesso per un commento dopo l'espressione, prima della graffa chiusa.
    if (ts.isJsxExpression(n)) {
      commenti(n.getStart(sf) + 1);
      if (n.expression) commenti(n.expression.end);
    }
    if ((ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) && n.moduleSpecifier) {
      commenti(n.moduleSpecifier.pos);
      return;
    }
    if (
      ts.isJsxText(n) ||
      ts.isStringLiteral(n) ||
      ts.isNoSubstitutionTemplateLiteral(n) ||
      ts.isTemplateLiteralToken(n)
    ) {
      const t = n.getText(sf);
      if (!TRACCIATO.test(t.slice(1, -1))) out.push({ riga: rigaDi(n.getStart(sf)), testo: t });
    }
    ts.forEachChild(n, visita);
  };
  visita(sf);
  commenti(sf.endOfFileToken.pos);
  return out;
}

/** Le note di un item: i suoi campi e i suoi file spediti. */
function noteItem(item: Item, spediti: FileSpedito[]): { campi: Nota[]; file: Map<string, Nota[]> } {
  const campi: Nota[] = [];
  for (const campo of ["title", "description", "docs"] as const) {
    const righe = (item[campo] ?? "").split("\n");
    righe.forEach((r, i) => {
      for (const n of note(r)) campi.push({ dove: `${item.name} → ${campo}`, riga: i + 1, ...n });
    });
  }
  const file = new Map<string, Nota[]>();
  for (const f of spediti) {
    const lista: Nota[] = [];
    for (const b of brani(f.path, arriva(f))) {
      b.testo.split("\n").forEach((r, i) => {
        for (const n of note(r)) lista.push({ dove: f.path, riga: b.riga + i, ...n });
      });
    }
    file.set(f.path, lista);
  }
  return { campi, file };
}

type Esito = { errori: string[]; file: number };

function controlla(items: Item[], spediti: (i: Item) => FileSpedito[] | null): Esito {
  const errori: string[] = [];
  let file = 0;

  for (const item of items) {
    const fs = spediti(item);
    if (fs === null) {
      errori.push(`${item.name}: manca \`public/r/${item.name}.json\`. Si rilancia \`npm run registry:build\`.`);
      continue;
    }
    const { campi, file: perFile } = noteItem(item, fs);
    for (const n of campi) errori.push(`${n.dove}, riga ${n.riga}: ${n.tipo} «${n.trovato}»`);

    for (const lista of perFile.values()) {
      file++;
      for (const n of lista) errori.push(`${n.dove}:${n.riga}  ${n.tipo} «${n.trovato}»`);
    }
  }
  return { errori, file };
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * **La prova della CLI.** Saltare le teste è giusto solo finché la CLI le
 * toglie davvero, e questo non si ricorda: si misura a ogni giro. Installa
 * con la CLI del lockfile un item finto — un `.ts`, un `.tsx`, un CSS
 * `registry:theme` e uno `registry:file`, ognuno con una testa e un corpo
 * — in un'app finta in una cartella temporanea, e guarda cosa arriva.
 *
 * `baseColor: ""` non è un vezzo: con un colore di base la CLI scarica
 * `ui.shadcn.com/r/colors/<colore>.json`, e il gate dipenderebbe dalla rete.
 * Provato con un proxy morto: così non la tocca, e le teste cadono uguali.
 *
 * Restituisce l'elenco di ciò che non torna; vuoto se la CLI fa quello che
 * il gate suppone.
 */
function provaCli(): string[] {
  const cli = join(RADICE, "node_modules/.bin/shadcn");
  if (!existsSync(cli)) return [`manca ${cli}: senza la CLI del lockfile non si sa cosa arriva all'app.`];
  const dir = mkdtempSync(join(tmpdir(), "check-spedito-"));
  try {
    const scrivi = (p: string, t: string) => writeFileSync(join(dir, p), t);
    scrivi("package.json", `{"name":"prova","private":true}`);
    scrivi("tsconfig.json", `{"compilerOptions":{"baseUrl":".","paths":{"@/*":["./src/*"]}}}`);
    scrivi(
      "components.json",
      JSON.stringify({
        style: "base-nova",
        rsc: false,
        tsx: true,
        tailwind: { config: "", css: "src/index.css", baseColor: "", cssVariables: true, prefix: "" },
        iconLibrary: "lucide",
        aliases: { components: "@/components", ui: "@/components/ui", lib: "@/lib", utils: "@/lib/utils", hooks: "@/hooks" },
      }),
    );
    mkdirSync(join(dir, "src"));
    scrivi("src/index.css", `@import "tailwindcss";\n`);
    const js = `/* TESTA */\n// TESTA\n\nexport const x = 1\n// CORPO\n`;
    const css = `/* TESTA */\n:root { --x: 1; }\n/* CORPO */\n`;
    const file = [
      { path: "registry/p/lib/p-lib.ts", type: "registry:lib", content: js, testa: false },
      { path: "registry/p/blocks/p-blocco.tsx", type: "registry:component", target: "components/blocks/p-blocco.tsx", content: js, testa: false },
      { path: "registry/p/p-tema.css", type: "registry:theme", target: "src/p-tema.css", content: css, testa: false },
      { path: "registry/p/p-file.css", type: "registry:file", target: "src/p-file.css", content: css, testa: true },
      // Il carattere del tema sta in `public/`, fuori da `src/`: un `registry:file`
      // arriva intero anche lì, e il file generato non ha una testa di note.
      { path: "registry/p/p-pubblico.css", type: "registry:file", target: "~/public/p-pubblico.css", content: css, testa: true },
    ];
    scrivi("prova.json", JSON.stringify({ name: "prova", type: "registry:block", files: file.map((f) => ({ path: f.path, type: f.type, target: f.target, content: f.content })) }));
    execFileSync(cli, ["add", "./prova.json", "--yes", "--overwrite"], { cwd: dir, stdio: "pipe" });

    const trova = (nome: string): string | null => {
      const tutti = readdirSync(dir, { recursive: true }).map(String).filter((p) => !p.startsWith("node_modules"));
      const p = tutti.find((x) => basename(x) === nome);
      return p ? readFileSync(join(dir, p), "utf8") : null;
    };
    const problemi: string[] = [];
    for (const f of file) {
      const arrivato = trova(basename(f.path));
      if (arrivato === null) {
        problemi.push(`${f.type}: il file non è arrivato nell'app di prova.`);
        continue;
      }
      if (!arrivato.includes("CORPO")) problemi.push(`${f.type}: il commento nel corpo non arriva più.`);
      if (arrivato.includes("TESTA") !== f.testa) {
        problemi.push(
          f.testa
            ? `${f.type}: la testa non arriva più. Il gate legge più di quanto l'app riceve: si aggiorna \`testaTolta()\`.`
            : `${f.type}: la testa ADESSO ARRIVA nell'app. Il gate non la legge: si aggiorna \`testaTolta()\` e si ripuliscono le teste.`,
        );
      }
    }
    return problemi;
  } catch (e) {
    return [`la CLI non ha installato l'item di prova: ${(e as Error).message.split("\n")[0]}`];
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * **L'autotest.** Un gate che non si è mai visto fallire non si sa se
 * funziona. Le prove mettono in scena le fonti che legge, quelle che salta
 * (percorsi di import, tracciati SVG), le teste e i campi dell'item.
 */
function autotest(): number {
  const sporco = `// La testa la toglie la CLI: M3.2, D14, Francesco, v1 non arrivano.
import { cn } from "cn"
import { icona } from "./M3.2"

// Deciso da Francesco il 2026-09-08 (M3.2, D14): v. WORKLOG.

/** Il bottone del v1, controllato da check:contrast. */
export function Finto() {
  return <svg><path d="M3.59 3.59 L4 4" /><title>Chiuso in M4ter.4bis</title>{/* preso da Francesco */}</svg>
}
`;
  const pulito = `// Il bottone primario: un'azione che si esegue con un clic.
import { cn } from "cn"

/** Il testo arancione usa \`text-accent-ink\`, mai \`text-primary\`. */
export function Finto() {
  return <svg><path d="M3.59 3.59 L4 4" /><title>Chiudi</title></svg>
}
`;
  const css = `/* Il tema di M1.5, §11 */\n:root { --x: 1; }\n`;
  const cssCorpo = `${css}/* e qui D3 */\n`;
  const item = (extra: Partial<Item> = {}): Item => ({
    name: "finto",
    title: "Finto",
    description: "Un'azione che si esegue con un clic.",
    files: [{ path: "ui/finto.tsx" }],
    ...extra,
  });
  const con = (content: string, path = "ui/finto.tsx") => () => [{ path, content }];

  const prove: { nome: string; items: Item[]; spediti: (i: Item) => FileSpedito[] | null; attesi: number }[] = [
    { nome: "un file pulito", items: [item()], spediti: con(pulito), attesi: 0 },
    // Riga 5: persona, data, task, decisione, documento (5). Riga 7: v1 e
    // check:contrast (2). Riga 9: M4ter.4bis nel testo JSX (1) e la persona
    // in un commento JSX `{/* */}` (1). La testa, l'import `./M3.2` e il
    // tracciato `M3.59` non contano.
    { nome: "un file con note in commenti e testo JSX", items: [item()], spediti: con(sporco), attesi: 9 },
    { nome: "un CSS `registry:file`: arriva intero", items: [item()], spediti: con(css, "theme/finto.css"), attesi: 2 },
    {
      nome: "un CSS `registry:theme`: la testa no, il corpo sì",
      items: [item()],
      spediti: () => [{ path: "theme/finto.css", content: cssCorpo, type: "registry:theme" }],
      attesi: 1,
    },
    {
      nome: "una nota nella description e una nei docs",
      items: [item({ description: "Seconda pagina della FASE 4.", docs: "Vedi §32." })],
      spediti: con(pulito),
      attesi: 2,
    },
    { nome: "l'artefatto manca", items: [item()], spediti: () => null, attesi: 1 },
  ];

  let falliti = 0;
  console.log("\n  Autotest — il gate sa fallire nei modi che dichiara\n");
  for (const p of prove) {
    const { errori } = controlla(p.items, p.spediti);
    const ok = errori.length === p.attesi;
    if (!ok) falliti++;
    console.log(`    ${ok ? "✔" : "✖"} ${p.nome.padEnd(52)} ${errori.length} errore/i (atteso ${p.attesi})`);
    if (!ok) errori.forEach((e) => console.log(`        ${e}`));
  }
  console.log(
    falliti === 0
      ? "\n✔ L'autotest passa: il gate prende le note dove arrivano.\n"
      : `\n✖ L'autotest fallisce su ${falliti} prova/e: il gate non fa quello che dice.\n`,
  );
  return falliti === 0 ? 0 : 1;
}

// ─────────────────────────────────────────────────────────────────────────────

function main(): number {
  const argomenti = process.argv.slice(2);
  if (argomenti.includes("--self-test")) return autotest();

  const registry = JSON.parse(readFileSync(join(RADICE, "registry.json"), "utf8")) as { items: Item[] };
  const spediti = (i: Item): FileSpedito[] | null => {
    const p = join(RADICE, "public/r", `${i.name}.json`);
    return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as { files: FileSpedito[] }).files : null;
  };

  const cli = provaCli();
  const { errori, file } = controlla(registry.items, spediti);
  errori.unshift(...cli.map((p) => `prova della CLI — ${p}`));

  for (const e of errori) console.log(`  ✖ ${e}`);

  console.log(`\n  ${registry.items.length} item, ${file} file spediti letti dall'artefatto, senza le teste che la CLI toglie`);
  if (!cli.length) console.log("  prova della CLI: le teste dei .ts/.tsx e dei CSS del tema cadono ancora, il resto arriva");

  if (errori.length) {
    console.log(
      `\n✖ ${errori.length} problema/i nel testo che arriva a chi installa. ` +
        `Si riscrive per chi usa il file: cosa fa e perché, non da dove viene. ` +
        `Dopo aver corretto un sorgente si rilancia \`npm run registry:build\`: il gate legge \`public/r/\`.\n`,
    );
    return 1;
  }
  console.log(`\n✔ Nessuna nota interna nel testo che arriva a chi installa.\n`);
  return 0;
}

process.exit(main());
