/**
 * ─────────────────────────────────────────────────────────────────────────────
 * check:storybook — l'ottavo gate: la style guide si legge da fuori
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * La style guide pubblicata è il primo documento che apre chi non conosce il
 * repo. Deve dire **quale design si usa e come si applica** — non raccontare
 * come ci si è arrivati. Il racconto sta in `WORKLOG.md` e le ragioni in
 * `docs/DECISIONI.md`, che sono i posti dove si cercano.
 *
 * ══ IL CANONE DI PAGINA ══════════════════════════════════════════════════════
 *
 * **Descrizione di componente** (il JSDoc su `const meta`). Nell'ordine, e solo
 * le sezioni che servono:
 *
 *   1. **Cos'è e a cosa serve.** Una frase, per funzione e non per aspetto:
 *      «un'etichetta che si legge», «un filtro che si clicca».
 *   2. **Quando si usa, quando no.** Il confine col componente vicino:
 *      `badge`/`toggle-group`, `dialog`/`sheet`/`drawer`, `select`/`combobox`.
 *   3. **Come si installa.**
 *      `npx shadcn@latest add tassullo/tassullo-design-system-v2/<item>`
 *      (con `#v2.0.0` quando il tag esiste).
 *   4. **Varianti e taglie.** Cosa esiste, col nome della prop.
 *   5. **Regole d'uso.** Quelle valide oggi, scritte come regole e non come
 *      storia: «il testo arancione usa `text-accent-ink`, mai `text-primary`»,
 *      «i numeri in colonna vogliono `tabular-nums`», «i codici si scrivono nel
 *      carattere del testo, `text-sm text-muted-foreground`».
 *   6. **Tastiera e accessibilità.** Cosa il componente garantisce — frecce,
 *      `Esc`, dove va il fuoco — come comportamento, non come misura.
 *
 * **Descrizione di story** (il JSDoc su `export const <Nome>`): una o due frasi
 * su cosa mostra la scena e a cosa guardare.
 *
 * Niente «perché si è deciso», niente «prima era». Il lettore deve poter usare
 * il componente, non ricostruirne la storia.
 *
 * ══ COSA NON CI VA, E QUESTO SCRIPT LO VERIFICA ══════════════════════════════
 *
 *   1. sigle di task: `M<n>.<n>` (anche `bis`/`ter`), `FASE <n>`
 *   2. sigle di decisione e rimandi a paragrafo: `D<n>`, `§<n>`
 *   3. i documenti interni: `WORKLOG`, `PIANO`, `CHECKLIST`, `DECISIONI`,
 *      `CLAUDE.md`, `INTERFACCE`, `ROADMAP`, `ANALISI-COPERTURA`,
 *      `componenti-propri`, `registry/.upstream`
 *   4. date: ISO (`2026-09-22`) e in prosa («8 settembre 2026»)
 *   5. persone: `Francesco`, `Roberto`
 *   6. gli strumenti del repo: `npm run`, `check:…`, «il gate», «CI»
 *   7. il design system precedente: «v1», `styleguide.html`
 *
 * Restano legittimi i nomi delle librerie e degli standard — shadcn, Base UI,
 * Tailwind, reui, Recharts, WCAG, axe — e i nomi delle app Tassullo (Anagrafe,
 * Officina, Studio), che sono le destinatarie del design system.
 *
 * **Cosa non ci va ma lo decide chi scrive**, non lo script, perché darebbe
 * falsi positivi e un gate che grida al lupo si smette di leggere: «misurato»,
 * «sospeso», «per ora», «reversibile», «in carico a», «fino a … c'era
 * scritto», e ogni frase su cosa un'app fa *oggi*.
 *
 * ══ COSA LEGGE ═══════════════════════════════════════════════════════════════
 *
 * **Solo il testo che un visitatore vede**, e la differenza fra visibile e
 * invisibile è la *posizione* di un commento, non il suo contenuto:
 *
 *   (a) il JSDoc attaccato a `const meta` o a `export const <Nome>` in ogni
 *       `*.stories.tsx` — Storybook lo rende come descrizione;
 *   (b) i `parameters.docs.description` scritti a mano;
 *   (c) il corpo dei `.mdx`;
 *   (d) nei soli `stories/*.stories.tsx`, che sono pagine di prosa: i nodi di
 *       testo JSX e ogni stringa del file — anche quelle delle tabelle in testa
 *       che la pagina rende con un `.map()`.
 *
 * **Non legge** i commenti `//`, i `/* … *\/` non attaccati al meta o a una
 * story, i JSDoc delle funzioni di appoggio, le `play`, i dati d'esempio
 * dichiarati fuori dal JSX, i sorgenti dei componenti. Lì le note interne
 * sono al loro posto.
 *
 * Segnala file, riga, tipo ed espressione, e **non suggerisce niente**: non
 * c'è un «nome giusto» da proporre, c'è una frase da riscrivere per chi legge.
 * **Nessuna esenzione per token**: se un caso legittimo emerge, si stringe
 * l'espressione regolare, non si apre un'eccezione.
 *
 * Uso:
 *   npm run check:storybook                     tutto il repo; esce con 1
 *   npm run check:storybook -- --avvisa         stampa il conto, non fallisce
 *   npm run check:storybook -- <file|cartella>  solo quei percorsi
 *   npm run check:storybook -- --self-test      prova che sa fallire, e dove no
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import ts from "typescript";

const RADICE = process.cwd();
const CARTELLE = ["registry/tassullo/ui", "registry/tassullo/blocks", "registry/tassullo/pages", "stories"];

// ─────────────────────────────────────────────────────────────────────────────
// Le sette regole. L'ordine è quello del canone qui sopra, e l'autotest ne
// mette in scena una per tipo.

type Regola = { tipo: string; re: RegExp };

const MESI = "gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre";

const REGOLE: Regola[] = [
  // `m2.5` minuscolo non è una sigla, è un'unità: la M è maiuscola.
  { tipo: "sigla di task", re: /\bM\d+(?:bis|ter)?\.\d+[a-z]?\b|\bFASE\s+\d/g },
  // Le decisioni vanno da D1 a D29, e il tetto è voluto: `D30` è un modello di
  // miscelatore nei dati d'esempio. Il giorno che arriva D30, si alza qui.
  { tipo: "sigla di decisione", re: /\bD(?:[1-9]|[12]\d)\b|§\s*\d+/g },
  {
    tipo: "documento interno",
    re: /\b(?:WORKLOG|PIANO|CHECKLIST|DECISIONI|ROADMAP|INTERFACCE|ANALISI-COPERTURA)\b|\bCLAUDE\.md\b|componenti-propri|registry\/\.upstream/g,
  },
  { tipo: "data", re: new RegExp(`\\b20\\d\\d-\\d\\d-\\d\\d\\b|\\b(?:${MESI})\\s+20\\d\\d\\b`, "gi") },
  { tipo: "persona", re: /\b(?:Francesco|Roberto)\b/g },
  // `CI` resta maiuscolo e a sé: «ci» è una parola italiana.
  {
    tipo: "strumento del repo",
    re: /\bnpm run\b|\bcheck:[a-z][\w-]*|\b(?:[Ii]l|[Aa]l|[Dd]el|[Dd]al|[Nn]el|[Ss]ul)\s+gate\b|\bCI\b/g,
  },
  { tipo: "design system precedente", re: /\bv1\b|\bstyleguide\.html\b/g },
];

// ─────────────────────────────────────────────────────────────────────────────
// Le fonti del testo visibile.

type Brano = { riga: number; testo: string; fonte: string };
type Segnalazione = { file: string; riga: number; tipo: string; trovato: string; fonte: string };

/** Un blocco di testo, spezzato in righe con il loro numero nel file. */
function brani(sf: ts.SourceFile, inizio: number, testo: string, fonte: string): Brano[] {
  const prima = sf.getLineAndCharacterOfPosition(inizio).line + 1;
  return testo.split("\n").map((t, i) => ({ riga: prima + i, testo: t, fonte }));
}

function haExport(n: ts.Node): boolean {
  return ts.canHaveModifiers(n) && (ts.getModifiers(n) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}

/** (a) i JSDoc attaccati a `const meta` e a `export const <Nome>`. */
function jsdocVisibili(sf: ts.SourceFile): Brano[] {
  const out: Brano[] = [];
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    const nomi = st.declarationList.declarations.map((d) => d.name.getText(sf));
    const visibile = nomi.includes("meta") || haExport(st);
    if (!visibile) continue;
    // TypeScript attacca allo statement i soli `/** */` che lo precedono
    // direttamente: è la stessa regola con cui Storybook sceglie la descrizione.
    const doc = (st as unknown as { jsDoc?: ts.JSDoc[] }).jsDoc ?? [];
    for (const d of doc) {
      const fonte = nomi.includes("meta") ? "descrizione del componente" : `descrizione di ${nomi.join(", ")}`;
      out.push(...brani(sf, d.getStart(sf), sf.text.slice(d.getStart(sf), d.end), fonte));
    }
  }
  return out;
}

/** (b) `parameters.docs.description.{component,story}` scritti a mano. */
function descrizioniDocs(sf: ts.SourceFile): Brano[] {
  const out: Brano[] = [];
  const nomeDi = (p: ts.ObjectLiteralElementLike) =>
    ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) ? p.name.text : null;

  const visita = (n: ts.Node): void => {
    if (ts.isPropertyAssignment(n) && nomeDi(n) === "docs" && ts.isObjectLiteralExpression(n.initializer)) {
      for (const p of n.initializer.properties) {
        if (nomeDi(p) !== "description" || !ts.isPropertyAssignment(p)) continue;
        const valori = ts.isObjectLiteralExpression(p.initializer) ? p.initializer.properties : [];
        for (const v of valori) {
          if (!ts.isPropertyAssignment(v)) continue;
          out.push(...brani(sf, v.initializer.getStart(sf), v.initializer.getText(sf), "parameters.docs.description"));
        }
      }
    }
    ts.forEachChild(n, visita);
  };
  visita(sf);
  return out;
}

/**
 * (d) il testo delle pagine di prosa in `stories/`: i nodi di testo JSX **e
 * ogni stringa scritta nel file**. Non solo quelle dentro il JSX: una pagina
 * `Tema/*` tiene i suoi titoli e le sue note in tabelle dichiarate in testa e
 * le rende con un `.map()`, e il testo è visibile quanto quello scritto fra i
 * tag. Restano fuori i percorsi degli `import`.
 */
function testoPagina(sf: ts.SourceFile): Brano[] {
  const out: Brano[] = [];
  const visita = (n: ts.Node): void => {
    if (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) return;
    if (ts.isJsxText(n)) {
      if (n.text.trim()) out.push(...brani(sf, n.getStart(sf), n.text, "testo della pagina"));
    } else if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateLiteralToken(n)) {
      out.push(...brani(sf, n.getStart(sf), n.getText(sf), "testo della pagina"));
    }
    ts.forEachChild(n, visita);
  };
  visita(sf);
  return out;
}

/** (c) il corpo di un `.mdx`: tutto tranne le righe di `import`. */
function corpoMdx(testo: string): Brano[] {
  return testo
    .split("\n")
    .map((t, i) => ({ riga: i + 1, testo: t, fonte: "pagina mdx" }))
    .filter((b) => !/^\s*import\s/.test(b.testo));
}

/** Tutto il testo visibile di un file. `percorso` è relativo alla radice. */
function testoVisibile(percorso: string, testo: string): Brano[] {
  if (percorso.endsWith(".mdx")) return corpoMdx(testo);
  const sf = ts.createSourceFile(percorso, testo, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const out = [...jsdocVisibili(sf), ...descrizioniDocs(sf)];
  if (percorso.split(sep).join("/").startsWith("stories/")) out.push(...testoPagina(sf));
  return out;
}

function controlla(percorso: string, testo: string): Segnalazione[] {
  const out: Segnalazione[] = [];
  for (const b of testoVisibile(percorso, testo)) {
    for (const r of REGOLE) {
      for (const m of b.testo.matchAll(r.re)) {
        out.push({ file: percorso, riga: b.riga, tipo: r.tipo, trovato: m[0], fonte: b.fonte });
      }
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────

function elenca(percorso: string): string[] {
  const assoluto = join(RADICE, percorso);
  if (!existsSync(assoluto)) return [];
  if (statSync(assoluto).isFile()) return [percorso];
  return readdirSync(assoluto, { recursive: true })
    .map((f) => join(percorso, String(f)))
    .filter((f) => /\.stories\.tsx$|\.mdx$/.test(f))
    .sort();
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * **L'autotest.** Tre prove, e la terza è quella che conta di più: un gate che
 * leggesse anche i commenti `//` darebbe centinaia di falsi positivi sui
 * sorgenti, e verrebbe spento alla prima settimana.
 */
function autotest(): number {
  const sporco = `import type { Meta } from '@storybook/react-vite'

/**
 * Il bottone, chiuso in M2.1.
 * Lo spiega D14.
 * Il resto sta nel WORKLOG.
 * Deciso il 2026-09-08.
 * Lo ha chiesto Francesco.
 * Lo verifica check:contrast.
 * Era la classe .btn del v1.
 */
const meta = { title: 'Primitive/Finto' } satisfies Meta

export default meta
`;
  const pulito = `import type { Meta } from '@storybook/react-vite'

/**
 * Un'azione che si esegue con un clic. Si installa con
 * \`npx shadcn@latest add tassullo/tassullo-design-system-v2/button\`.
 * Il testo arancione usa \`text-accent-ink\`, mai \`text-primary\`.
 */
const meta = { title: 'Primitive/Finto' } satisfies Meta

export default meta

/** Le quattro varianti affiancate: si guardi il contrasto in scuro. */
export const Varianti = {}
`;
  const nascosto = `import type { Meta } from '@storybook/react-vite'

// Chiuso in M2.9 (D14, §22), deciso da Francesco il 2026-09-08: v. WORKLOG.
/* M3.1 — npm run check:registry, il gate del v1 */

/** Appoggio, non una story: M2.3, D9, §17, 2026-09-10, Roberto, CI, v1. */
function aiuto() { return null }

/** Un'azione che si esegue con un clic. */
const meta = { title: 'Primitive/Finto', component: aiuto } satisfies Meta

export default meta
`;

  const prove = [
    { nome: "un file finto con i sette tipi di violazione", file: "registry/tassullo/ui/finto.stories.tsx", testo: sporco, attesi: 7 },
    { nome: "un file pulito, scritto secondo il canone", file: "registry/tassullo/ui/finto.stories.tsx", testo: pulito, attesi: 0 },
    { nome: "le sigle dentro commenti che nessuno vede", file: "registry/tassullo/ui/finto.stories.tsx", testo: nascosto, attesi: 0 },
  ];

  let falliti = 0;
  console.log("\n  Autotest — il gate sa fallire, e sa dove non guardare\n");
  for (const p of prove) {
    const s = controlla(p.file, p.testo);
    const ok = s.length === p.attesi;
    if (!ok) falliti++;
    console.log(`    ${ok ? "✔" : "✖"} ${p.nome.padEnd(50)} ${s.length} segnalazione/i (atteso ${p.attesi})`);
    if (p.attesi === 7) {
      const tipi = new Set(s.map((x) => x.tipo));
      const mancanti = REGOLE.filter((r) => !tipi.has(r.tipo)).map((r) => r.tipo);
      if (mancanti.length) {
        falliti++;
        console.log(`        ✖ tipi non presi: ${mancanti.join(", ")}`);
      }
    }
    if (!ok) s.forEach((x) => console.log(`        riga ${x.riga}: ${x.tipo} «${x.trovato}»`));
  }
  console.log(
    falliti === 0
      ? "\n✔ L'autotest passa: sette tipi presi su sette, e i commenti invisibili restano fuori.\n"
      : `\n✖ L'autotest fallisce su ${falliti} prova/e: il gate non fa quello che dice.\n`,
  );
  return falliti === 0 ? 0 : 1;
}

// ─────────────────────────────────────────────────────────────────────────────

function main(): number {
  const argomenti = process.argv.slice(2);
  if (argomenti.includes("--self-test")) return autotest();
  const avvisa = argomenti.includes("--avvisa");
  const percorsi = argomenti.filter((a) => !a.startsWith("--"));

  const file = (percorsi.length ? percorsi : CARTELLE).flatMap((p) => elenca(relative(RADICE, join(RADICE, p))));
  if (file.length === 0) {
    console.error("✖ nessun file di story trovato nei percorsi indicati.");
    return 1;
  }

  const segnalazioni = file.flatMap((f) => controlla(f, readFileSync(join(RADICE, f), "utf8")));

  for (const s of segnalazioni) {
    console.log(`  ${s.file}:${s.riga}  ${s.tipo} «${s.trovato}»  (${s.fonte})`);
  }

  const perFile = new Map<string, number>();
  const perTipo = new Map<string, number>();
  for (const s of segnalazioni) {
    perFile.set(s.file, (perFile.get(s.file) ?? 0) + 1);
    perTipo.set(s.tipo, (perTipo.get(s.tipo) ?? 0) + 1);
  }

  console.log(`\n  ${file.length} file letti, ${perFile.size} con segnalazioni, ${segnalazioni.length} segnalazioni`);
  if (segnalazioni.length) {
    console.log("\n  per tipo:");
    for (const r of REGOLE) console.log(`    ${String(perTipo.get(r.tipo) ?? 0).padStart(5)}  ${r.tipo}`);
    for (const c of CARTELLE) {
      const n = segnalazioni.filter((s) => s.file.startsWith(c + sep) || s.file.startsWith(c + "/")).length;
      const f = [...perFile.keys()].filter((k) => k.startsWith(c + sep) || k.startsWith(c + "/")).length;
      if (n) console.log(`    ${String(n).padStart(5)}  in ${c}/ (${f} file)`);
    }
  }

  if (segnalazioni.length === 0) {
    console.log("\n✔ Nessuna nota interna nel testo che la style guide mostra.\n");
    return 0;
  }
  if (avvisa) {
    console.log("\n• Modalità avviso: il conto è stampato e il gate non fallisce.\n");
    return 0;
  }
  console.log(
    `\n✖ ${segnalazioni.length} nota/e interna/e nel testo visibile. ` +
      `Si riscrive la frase per chi legge da fuori, secondo il canone in testa a questo script.\n`,
  );
  return 1;
}

process.exit(main());
