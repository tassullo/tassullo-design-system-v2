/**
 * ─────────────────────────────────────────────────────────────────────────────
 * check:lint-app — il dodicesimo gate: i file installati passano il lint dell'app
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Nato dalla proposta #49 (Anagrafe, 2026-09-24): installata la `v2.0.0`, il
 * `npm run lint` dell'app — ESLint del template Vite, con
 * `eslint-plugin-react-hooks` 7 e `eslint-plugin-react-refresh` — trovava tre
 * errori in file che l'app **non può modificare**. Il lint del repository è
 * oxlint, e le regole di React 19 le dà come avvisi: nessuno le guardava.
 *
 * **Cosa fa.** Installa con la CLI del lockfile, in un'app finta in una
 * cartella temporanea, **tutti** i `.ts`/`.tsx` spediti da `public/r/`, cioè
 * i file come arrivano davvero (teste tolte, `"use client"` tolto, import
 * riscritti). Poi ci passa sopra:
 *
 *   - **ESLint** con la configurazione presa **da `docs/INTEGRAZIONE.md`**, il
 *     blocco dopo `<!-- lint-eslint -->`: è quella che le app copiano, quindi
 *     si prova quella e non una seconda copia;
 *   - **oxlint** con il blocco dopo `<!-- lint-oxlint -->`, che è il lint del
 *     template Vite di oggi (ESLint era quello fino a `create-vite` 8).
 *
 * Fallisce su ogni **errore**. Gli avvisi li stampa e non fallisce, come
 * `eslint .` in un'app.
 *
 * **E le eccezioni devono servire.** Ogni oggetto della configurazione che si
 * chiama `tassullo/…` (per oxlint, ogni voce di `overrides`) spegne delle
 * regole su dei file: il gate rifà il giro
 * senza quegli oggetti e controlla che ogni regola spenta, in ogni oggetto,
 * segnali almeno un file fra quelli che l'oggetto copre. Un'eccezione che non
 * serve più è un errore: le righe che le app copiano restano le minime.
 *
 * Uso:
 *   npm run check:lint-app                  tutto; esce con 1 se qualcosa non va
 *   npm run check:lint-app -- --self-test   prova che sa fallire
 *   npm run check:lint-app -- --conserva    lascia l'app di prova, per guardarci dentro
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, matchesGlob, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { ESLint, type Linter } from "eslint";

const RADICE = process.cwd();
const DOC = join(RADICE, "docs/INTEGRAZIONE.md");
const CLI = join(RADICE, "node_modules/.bin/shadcn");
const OXLINT = join(RADICE, "node_modules/.bin/oxlint");

type FileSpedito = { path: string; content: string; type?: string; target?: string };
type Messaggio = { file: string; riga: number; regola: string; errore: boolean; testo: string };

/** Il blocco di codice che segue il marcatore `<!-- nome -->` nel documento. */
function blocco(nome: string): string {
  const doc = readFileSync(DOC, "utf8");
  const m = new RegExp(`<!-- ${nome} -->\\s*\`\`\`\\w*\\n([\\s\\S]*?)\\n\`\`\``).exec(doc);
  if (!m) throw new Error(`in docs/INTEGRAZIONE.md manca il blocco dopo <!-- ${nome} -->`);
  return m[1]!;
}

/**
 * La configurazione ESLint del documento. Il file si scrive dentro
 * `node_modules/.cache/`, così i suoi `import` si risolvono sui pacchetti del
 * repository, gli stessi che un'app installa.
 */
async function configEslint(testo: string): Promise<Linter.Config[]> {
  const dir = join(RADICE, "node_modules/.cache/check-lint-app");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `eslint.config.${Date.now()}.mjs`);
  writeFileSync(file, testo);
  try {
    return (await import(pathToFileURL(file).href)).default as Linter.Config[];
  } finally {
    rmSync(file, { force: true });
  }
}

/** Tutti i `.ts`/`.tsx` spediti, uno per percorso. */
function spediti(): FileSpedito[] {
  const registry = JSON.parse(readFileSync(join(RADICE, "registry.json"), "utf8")) as { items: { name: string }[] };
  const perPercorso = new Map<string, FileSpedito>();
  for (const { name } of registry.items) {
    const p = join(RADICE, "public/r", `${name}.json`);
    if (!existsSync(p)) throw new Error(`manca public/r/${name}.json: si rilancia npm run registry:build`);
    for (const f of (JSON.parse(readFileSync(p, "utf8")) as { files: FileSpedito[] }).files) {
      if (/\.tsx?$/.test(f.path)) perPercorso.set(f.path, f);
    }
  }
  return [...perPercorso.values()];
}

/**
 * Un'app finta con i file installati dalla CLI vera. `baseColor: ""` tiene la
 * CLI lontana dalla rete (vedi `check-spedito.ts`), e l'item non dichiara
 * dipendenze, quindi non parte nessun `npm install`.
 */
function installa(file: FileSpedito[]): string {
  if (!existsSync(CLI)) throw new Error(`manca ${CLI}`);
  const dir = mkdtempSync(join(tmpdir(), "check-lint-app-"));
  const scrivi = (p: string, t: string) => writeFileSync(join(dir, p), t);
  scrivi("package.json", `{"name":"prova","private":true,"type":"module"}`);
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
  scrivi("tutto.json", JSON.stringify({ name: "tutto", type: "registry:block", files: file }));
  execFileSync(CLI, ["add", "./tutto.json", "--yes", "--overwrite"], { cwd: dir, stdio: "pipe" });
  return dir;
}

/** I file che un oggetto di configurazione copre, fra quelli installati. */
function coperti(obj: Linter.Config, installati: string[]): string[] {
  const globs = (obj.files ?? []).flat() as string[];
  return installati.filter((f) => globs.some((g) => matchesGlob(f, g)));
}

async function eslint(dir: string, config: Linter.Config[]): Promise<Messaggio[]> {
  const motore = new ESLint({ cwd: dir, overrideConfigFile: true, overrideConfig: config });
  const esiti = await motore.lintFiles(["src"]);
  return esiti.flatMap((e) =>
    e.messages.map((m) => ({
      file: relative(dir, e.filePath),
      riga: m.line,
      regola: m.ruleId ?? "(senza regola)",
      errore: m.severity === 2,
      testo: m.message.split("\n")[0]!,
    })),
  );
}

/**
 * Le eccezioni di oxlint che non servono. In `.oxlintrc.json` gli oggetti non
 * hanno un nome: ogni voce di `overrides` è un'eccezione.
 */
function eccezioniInutiliOx(config: string, senza: Messaggio[], installati: string[]): string[] {
  const overrides = (JSON.parse(config) as { overrides?: Linter.Config[] }).overrides ?? [];
  return eccezioniInutili(
    overrides.map((o, i) => ({ ...o, name: `tassullo/oxlint-${i + 1}` })),
    senza,
    installati,
  ).map((p) => `oxlint — ${p}`);
}

/** Le eccezioni `tassullo/…` che non servono: `[nome, regola]`. */
function eccezioniInutili(config: Linter.Config[], senza: Messaggio[], installati: string[]): string[] {
  const fuori: string[] = [];
  for (const obj of config) {
    if (!obj.name?.startsWith("tassullo/")) continue;
    const dentro = new Set(coperti(obj, installati));
    for (const regola of Object.keys(obj.rules ?? {})) {
      if (!senza.some((m) => m.regola === regola && dentro.has(m.file))) fuori.push(`${obj.name}: «${regola}» non serve più`);
    }
    if (dentro.size === 0) fuori.push(`${obj.name}: non copre nessun file installato`);
  }
  return fuori;
}

type OxRisultato = { diagnostics?: { filename: string; code: string; severity: string; message: string; labels?: { span: { line: number } }[] }[] };

function oxlint(dir: string, config: string): Messaggio[] {
  writeFileSync(join(dir, ".oxlintrc.json"), config);
  let uscita: string;
  try {
    uscita = execFileSync(OXLINT, ["--format", "json", "src"], { cwd: dir, stdio: "pipe" }).toString();
  } catch (e) {
    uscita = (e as { stdout: Buffer }).stdout.toString();
  }
  const esito = JSON.parse(uscita) as OxRisultato;
  return (esito.diagnostics ?? []).map((d) => ({
    file: d.filename,
    riga: d.labels?.[0]?.span.line ?? 0,
    // oxlint scrive `react(refs)` quella che in configurazione è `react/refs`.
    regola: d.code.replace(/^([^(]+)\((.+)\)$/, "$1/$2"),
    errore: d.severity === "error",
    testo: d.message,
  }));
}

function stampa(titolo: string, messaggi: Messaggio[]): void {
  const errori = messaggi.filter((m) => m.errore);
  const avvisi = messaggi.filter((m) => !m.errore);
  console.log(`\n  ${titolo}: ${errori.length} errore/i, ${avvisi.length} avviso/i`);
  for (const m of errori) console.log(`    ✖ ${m.file}:${m.riga}  ${m.regola}  ${m.testo}`);
  for (const m of avvisi) console.log(`    · ${m.file}:${m.riga}  ${m.regola}  ${m.testo}`);
}

type Esito = { errori: string[]; inutili: string[] };

async function controlla(file: FileSpedito[], testoEslint: string, testoOxlint: string): Promise<Esito> {
  const dir = installa(file);
  try {
    const installati = readdirSync(join(dir, "src"), { recursive: true })
      .map((p) => join("src", String(p)))
      .filter((p) => /\.tsx?$/.test(p));
    const config = await configEslint(testoEslint);
    const conEccezioni = await eslint(dir, config);
    const senza = await eslint(dir, config.filter((o) => !o.name?.startsWith("tassullo/")));
    const ox = oxlint(dir, testoOxlint);
    const oxSenza = oxlint(dir, JSON.stringify({ ...JSON.parse(testoOxlint), overrides: [] }));

    console.log(`\n  ${installati.length} file installati nell'app di prova`);
    stampa("ESLint, configurazione di INTEGRAZIONE.md", conEccezioni);
    stampa("oxlint, configurazione di INTEGRAZIONE.md", ox);

    return {
      errori: [
        ...conEccezioni.filter((m) => m.errore).map((m) => `ESLint — ${m.file}:${m.riga} ${m.regola}`),
        ...ox.filter((m) => m.errore).map((m) => `oxlint — ${m.file}:${m.riga} ${m.regola}`),
      ],
      inutili: [
        ...eccezioniInutili(config, senza, installati).map((p) => `ESLint — ${p}`),
        ...eccezioniInutiliOx(testoOxlint, oxSenza, installati),
      ],
    };
  } finally {
    if (process.argv.includes("--conserva")) console.log(`\n  app di prova conservata in ${dir}`);
    else rmSync(dir, { recursive: true, force: true });
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * **L'autotest.** Su un'app di prova con un hook solo: se è pulito non dà
 * errori; se chiama `setState` dentro un effetto, ESLint dà l'errore della
 * proposta #49; un'eccezione su una cartella vuota è segnalata come inutile.
 * (Con un file solo, le eccezioni vere del documento risultano tutte inutili:
 * qui si guarda solo quella di prova.)
 */
async function autotest(): Promise<number> {
  const pulito = `import * as React from "react"\n\nexport function useUno() {\n  return React.useSyncExternalStore(() => () => {}, () => 1, () => 1)\n}\n`;
  const sporco = `import * as React from "react"\n\nexport function useUno() {\n  const [v, setV] = React.useState(0)\n  React.useEffect(() => {\n    setV(1)\n  }, [])\n  return v\n}\n`;
  const hook = (content: string): FileSpedito[] => [{ path: "registry/p/hooks/use-uno.ts", type: "registry:hook", content }];
  const eslintBase = blocco("lint-eslint");
  const oxBase = blocco("lint-oxlint");
  const conProva = eslintBase.replace(
    /\n\]\)\s*$/,
    `\n  { name: 'tassullo/prova', files: ['src/nessuno/**'], rules: { 'no-console': 'off' } },\n])\n`,
  );

  const prove: { nome: string; file: FileSpedito[]; eslint: string; ok: (e: Esito) => boolean }[] = [
    { nome: "un hook pulito: nessun errore", file: hook(pulito), eslint: eslintBase, ok: (e) => e.errori.length === 0 },
    {
      nome: "setState dentro un effetto: errore",
      file: hook(sporco),
      eslint: eslintBase,
      ok: (e) => e.errori.some((x) => x.includes("react-hooks/set-state-in-effect")),
    },
    {
      nome: "un'eccezione che non serve: segnalata",
      file: hook(pulito),
      eslint: conProva,
      ok: (e) => e.inutili.some((x) => x.includes("tassullo/prova")),
    },
  ];
  let falliti = 0;
  console.log("\n  Autotest — il gate sa fallire nei modi che dichiara");
  for (const p of prove) {
    const ok = p.ok(await controlla(p.file, p.eslint, oxBase));
    if (!ok) falliti++;
    console.log(`\n    ${ok ? "✔" : "✖"} ${p.nome}`);
  }
  console.log(falliti === 0 ? "\n✔ L'autotest passa.\n" : `\n✖ L'autotest fallisce su ${falliti} prova/e.\n`);
  return falliti === 0 ? 0 : 1;
}

async function main(): Promise<number> {
  if (process.argv.includes("--self-test")) return autotest();
  const { errori, inutili } = await controlla(spediti(), blocco("lint-eslint"), blocco("lint-oxlint"));
  const problemi = [...errori, ...inutili];
  if (problemi.length) {
    console.log(`\n✖ ${problemi.length} problema/i:`);
    for (const p of problemi) console.log(`  ✖ ${p}`);
    console.log(
      "\nUn file nostro si corregge. Un file di terzi (con un originale in registry/.upstream/) non si tocca:" +
        " l'eccezione va nel blocco di docs/INTEGRAZIONE.md, sul solo file e sulla sola regola.\n",
    );
    return 1;
  }
  console.log("\n✔ I file del design system passano il lint di un'app Vite, con le righe di INTEGRAZIONE.md.\n");
  return 0;
}

process.exit(await main());
