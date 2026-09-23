/**
 * ─────────────────────────────────────────────────────────────────────────────
 * check:riferimenti — il settimo gate: i riferimenti di `registry.json` risolvono
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * **Perché esiste.** È scattato due volte, e tutte e due le volte con gli altri
 * gate verdi:
 *
 *   - **M4.6** (2026-09-18): **26 `registryDependencies` rotte su 12 item** —
 *     dichiaravano il nome nudo (`@tassullo/data-table`) invece del nome
 *     **pubblicato** (`@tassullo/tassullo-data-table`). Il registry era
 *     *ininstallabile* per ogni blocco con dipendenze interne, cioè quasi tutti.
 *   - **M4ter.10** (2026-09-20): **1**, `tassullo-calendario` →
 *     `@tassullo/empty-state` invece di `@tassullo/tassullo-empty-state`. Il
 *     calendario, cioè il lavoro di due sessioni, non si installava.
 *
 * **Perché nessuno degli altri sei lo vede.** `check:registry` confronta la
 * **forma** dei componenti con l'originale shadcn; `check:registry-build`
 * confronta l'**artefatto** `public/r/` col sorgente — e un riferimento a un
 * nome che non esiste è JSON perfettamente valido per tutti e due, quindi passa
 * da entrambi senza una parola. Nemmeno `npx shadcn registry validate` lo vede:
 * controlla lo **schema**, non risolve i riferimenti, ed era verde su tutti e 94
 * gli item col difetto di M4ter.10 attivo.
 *
 * Finché non c'era questo file, il difetto si vedeva **solo installando da
 * fuori**, cioè una volta a fase — e in mezzo ci stanno settimane in cui il
 * registry pubblicato è rotto e nessuno lo sa.
 *
 * **Gli import dei file, dal 2026-09-23 (M5.1a).** Ogni `import` di ogni file
 * spedito dev'essere coperto da ciò che `add` installa insieme all'item:
 *
 *   - un pacchetto npm (`@tiptap/react`, `cn`, `date-fns/locale` → `date-fns`)
 *     sta fra le `dependencies` dell'item **o di un item della sua chiusura**
 *     di `registryDependencies`, perché `add` installa anche quelli;
 *   - un modulo del registry (`@/registry/tassullo/lib/toni`, o `./data-table`
 *     fra due blocchi) appartiene all'item stesso o a uno della chiusura.
 *
 * Senza, il difetto si vede solo nell'app: `add` riesce e poi **la compilazione
 * fallisce** su un modulo che non c'è. È la stessa famiglia dei riferimenti
 * rotti — JSON valido, gli altri gate verdi — e sta qui per la stessa ragione.
 *
 * La chiusura è la metà che conta. Il primo tentativo (M4ter.10) guardava le
 * sole `dependencies` dell'item e segnalava `tassullo-data-table-filtro-
 * sfaccettato`, che usa `@base-ui/react` e `cn` senza dichiararli: un falso
 * positivo, perché li porta `@tassullo/button`. Con la chiusura quel caso tace
 * — ed è una prova dell'autotest. La prima passata vera ha trovato invece un
 * difetto: `tassullo-pagina-errore` importava `lib/toni` senza dichiarare
 * `@tassullo/toni`.
 *
 * Gli import si leggono con `ts.preProcessFile`, non con un'espressione
 * regolare: un `import` scritto dentro un commento d'esempio non conta, e un
 * `import type` sì — l'app compila anche i tipi. `react` e `react-dom` non si
 * dichiarano: l'app li ha per costruzione. Una dipendenza dichiarata e non
 * usata **non** è un errore (shadcn dichiara `lucide-react` su `button` per
 * le icone che la CLI risolve all'installazione).
 *
 * Non raggiunge la rete: gli item di `@shadcn` e `@reui` non si scaricano per
 * verificarli, si controlla solo che il **namespace** sia dichiarato in
 * `components.json`. Un gate che dipende dalla rete è un gate che fallisce in
 * aereo e in CI il giorno che reui.io è giù.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import ts from "typescript";

const RADICE = process.cwd();
const REGISTRY = join(RADICE, "registry.json");
const COMPONENTS = join(RADICE, "components.json");

type Item = {
  name: string;
  registryDependencies?: string[];
  dependencies?: string[];
  files?: { path: string }[];
};

type Esito = { errori: string[]; avvisi: string[]; riferimenti: number; imports: number };

/** Il testo di un file del registry, o `null` se non esiste. */
type Lettore = (percorso: string) => string | null;

/** I moduli che ogni app ha per costruzione, e che nessun item dichiara. */
const DELL_APP = new Set(["react", "react-dom"]);

/** `@tassullo/button` → `["@tassullo", "button"]`; `button` → `[null, "button"]`. */
function spezza(riferimento: string): [string | null, string] {
  const m = /^(@[^/]+)\/(.+)$/.exec(riferimento);
  return m ? [m[1]!, m[2]!] : [null, riferimento];
}

/** `@tiptap/react/menus` → `@tiptap/react`; `date-fns/locale` → `date-fns`; `x?url` → `x`. */
function pacchetto(specificatore: string): string {
  const parti = specificatore.split("?")[0]!.split("/");
  return specificatore.startsWith("@") ? parti.slice(0, 2).join("/") : parti[0]!;
}

/** `zod@^3.0.0` → `zod`; `@base-ui/react@1.8` → `@base-ui/react`. */
function senzaVersione(dipendenza: string): string {
  return dipendenza.replace(/^(@?[^@]+)@.*$/, "$1");
}

/** Gli item che `add <nome>` installa: lui e la chiusura dei suoi `@tassullo/…`. */
function chiusura(nome: string, per: Map<string, Item>, acc = new Set<string>()): Set<string> {
  if (acc.has(nome) || !per.has(nome)) return acc;
  acc.add(nome);
  for (const r of per.get(nome)!.registryDependencies ?? []) {
    const [ns, n] = spezza(r);
    if (ns === "@tassullo") chiusura(n, per, acc);
  }
  return acc;
}

/**
 * Ogni import di ogni file `.ts`/`.tsx` è coperto da ciò che `add` installa.
 * Un modulo del registry (`@/…` o relativo) si risolve al file dichiarato, e
 * da lì all'item che lo possiede.
 */
function controllaImport(registry: { items: Item[] }, leggi: Lettore): { errori: string[]; imports: number } {
  const errori: string[] = [];
  const per = new Map(registry.items.map((i) => [i.name, i]));
  const proprietario = new Map<string, string>();
  for (const i of registry.items) for (const f of i.files ?? []) proprietario.set(normalize(f.path), i.name);
  const aFile = (base: string) =>
    ["", ".tsx", ".ts", "/index.tsx", "/index.ts"].map((e) => normalize(base + e)).find((c) => proprietario.has(c));
  let imports = 0;

  for (const item of registry.items) {
    const installati = chiusura(item.name, per);
    const pacchetti = new Set(
      [...installati].flatMap((n) => (per.get(n)!.dependencies ?? []).map(senzaVersione))
    );

    for (const file of item.files ?? []) {
      if (!/\.tsx?$/.test(file.path)) continue;
      const testo = leggi(file.path);
      if (testo === null) continue; // lo segnala già il controllo dei file presenti
      const { importedFiles } = ts.preProcessFile(testo, true, true);

      for (const { fileName: s } of importedFiles) {
        imports++;
        if (s.startsWith("@/") || s.startsWith(".")) {
          const base = s.startsWith("@/") ? s.slice(2) : join(dirname(file.path), s);
          const trovato = aFile(base);
          const di = trovato && proprietario.get(trovato);
          if (!di) {
            errori.push(
              `${item.name} (${file.path}) importa \`${s}\`, che non è un file di nessun item: ` +
                `nell'app quel modulo non arriva.`
            );
          } else if (!installati.has(di)) {
            errori.push(
              `${item.name} (${file.path}) importa \`${s}\` da \`${di}\`, che non sta nella sua chiusura: ` +
                `manca \`@tassullo/${di}\` fra le \`registryDependencies\`, e nell'app **non compila**.`
            );
          }
          continue;
        }
        const p = pacchetto(s);
        if (DELL_APP.has(p) || pacchetti.has(p)) continue;
        errori.push(
          `${item.name} (${file.path}) importa \`${s}\`, e \`${p}\` non è fra le \`dependencies\` ` +
            `dell'item né di un item della sua chiusura: \`add\` non lo installa, e nell'app **non compila**.`
        );
      }
    }
  }
  return { errori, imports };
}

function controlla(registry: { items: Item[] }, namespaceNoti: Set<string>, leggi: Lettore): Esito {
  const errori: string[] = [];
  const avvisi: string[] = [];
  const nomi = new Set(registry.items.map((i) => i.name));
  let riferimenti = 0;

  for (const item of registry.items) {
    // ── 1. i riferimenti fra item ───────────────────────────────────────────
    for (const riferimento of item.registryDependencies ?? []) {
      riferimenti++;

      if (/^https?:\/\//.test(riferimento)) {
        avvisi.push(
          `${item.name}: riferimento per URL (${riferimento}). Funziona, ma si aggiorna da solo: ` +
            `nessun pin di versione, e il giorno che quell'URL cambia lo scopre l'app consumer.`
        );
        continue;
      }

      const [namespace, nome] = spezza(riferimento);

      if (namespace === null) {
        avvisi.push(
          `${item.name}: riferimento senza namespace (\`${riferimento}\`). La CLI lo risolve su ` +
            `\`@shadcn\`, ma qui dentro la convenzione è scriverlo per esteso: un nome nudo non ` +
            `dice da quale registry viene, ed è la forma in cui i difetti di M4.6 si mimetizzavano.`
        );
        continue;
      }

      if (namespace === "@tassullo") {
        if (!nomi.has(nome)) {
          // Il suggerimento è metà del valore: il difetto è quasi sempre il nome
          // NUDO al posto di quello PUBBLICATO, e il nome pubblicato è a un
          // prefisso di distanza.
          const vicini = [...nomi].filter(
            (n) => n === `tassullo-${nome}` || n.endsWith(`-${nome}`) || n.replace(/^tassullo-/, "") === nome
          );
          const forse = vicini.length ? ` Forse \`@tassullo/${vicini[0]}\`?` : "";
          errori.push(
            `${item.name} → \`${riferimento}\`: nessun item si chiama \`${nome}\`. ` +
              `La CLI risponde \`item not found\` e **l'item non si installa**.${forse}`
          );
        }
        continue;
      }

      if (!namespaceNoti.has(namespace)) {
        errori.push(
          `${item.name} → \`${riferimento}\`: il namespace \`${namespace}\` non è dichiarato in ` +
            `\`components.json\` → \`registries\`. La CLI risponde \`Unknown registry\`.`
        );
      }
    }

    // ── 2. i file dichiarati esistono davvero ───────────────────────────────
    for (const file of item.files ?? []) {
      if (leggi(file.path) === null) {
        errori.push(
          `${item.name}: il file \`${file.path}\` è dichiarato in \`registry.json\` e non esiste sul disco.`
        );
      }
    }
  }

  // ── 3. nessun ciclo fra item ──────────────────────────────────────────────
  // Un ciclo non è un errore di scrittura plausibile oggi, ma se entrasse
  // manderebbe la CLI a girare a vuoto invece di dire cosa non va — e costa
  // una visita in profondità scoprirlo qui.
  const per = new Map(registry.items.map((i) => [i.name, i]));
  const STATO = { APERTO: 1, CHIUSO: 2 } as const;
  const stato = new Map<string, number>();

  function visita(nome: string, percorso: string[]): void {
    if (stato.get(nome) === STATO.CHIUSO) return;
    if (stato.get(nome) === STATO.APERTO) {
      errori.push(`ciclo fra item: ${[...percorso, nome].join(" → ")}`);
      return;
    }
    stato.set(nome, STATO.APERTO);
    for (const r of per.get(nome)?.registryDependencies ?? []) {
      const [ns, n] = spezza(r);
      if (ns === "@tassullo" && per.has(n)) visita(n, [...percorso, nome]);
    }
    stato.set(nome, STATO.CHIUSO);
  }
  for (const item of registry.items) visita(item.name, []);

  // ── 4. gli import dei file sono coperti da ciò che `add` installa ───────────
  const { errori: diImport, imports } = controllaImport(registry, leggi);
  errori.push(...diImport);

  return { errori, avvisi, riferimenti, imports };
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * **L'autotest**, che è la parte che rende il gate credibile: un controllo che
 * non si è mai visto fallire non si sa se funziona. Rifà i difetti veri —
 * quello di M4.6, quello di M4ter.10, un namespace non dichiarato, e quello di
 * M5.1a sugli import — su un registry finto in memoria, verifica che li prenda
 * tutti, e che taccia su un registry sano e sul falso positivo che aveva fatto
 * scartare il primo controllo delle dipendenze npm.
 */
function autotest(): number {
  const namespaceNoti = new Set(["@shadcn", "@reui"]);
  const sano = {
    items: [
      { name: "button", registryDependencies: [], files: [{ path: "package.json" }] },
      { name: "tassullo-data-table", registryDependencies: ["@tassullo/button"], files: [] },
      { name: "tassullo-pagina-lista", registryDependencies: ["@tassullo/tassullo-data-table", "@shadcn/card"], files: [] },
    ],
  };

  // ── gli import: un piccolo registry con i sorgenti in memoria ──────────────
  const SORGENTI: Record<string, string> = {
    "package.json": "{}",
    "registry/tassullo/ui/button.tsx": `import * as React from "react"\nimport { Button as B } from "@base-ui/react/button"\nimport { cn } from "cn"\n`,
    "registry/tassullo/lib/toni.ts": `export const TONO = {}\n`,
    "registry/tassullo/blocks/data-table.tsx": `import type { Table } from "@tanstack/react-table"\nimport { Button } from "@/registry/tassullo/ui/button"\n`,
    // Il falso positivo di M4ter.10: `@base-ui/react` e `cn` li dichiara
    // `button`, che sta nella chiusura. Più un `import` in un commento, un
    // sottopercorso, un `?url` e `react-dom`, che non si dichiarano.
    "registry/tassullo/blocks/filtro.tsx":
      `import { Popover } from "@base-ui/react/popover"\nimport { cn } from "cn"\n` +
      `import type { Column } from "@tanstack/react-table"\nimport { createPortal } from "react-dom"\n` +
      `import { it } from "date-fns/locale"\nimport w from "pdfjs-dist/build/pdf.worker.min.mjs?url"\n` +
      `import type { Tabella } from "./data-table"\n/** Uso: import { X } from "@/lib/inesistente" */\n`,
    // Il difetto vero: `lib/toni` importato senza `@tassullo/toni`.
    "registry/tassullo/pages/pagina-errore.tsx": `import { TONO } from "@/registry/tassullo/lib/toni"\n`,
    "registry/tassullo/blocks/senza-pacchetto.tsx": `import type { Editor } from "@tiptap/react"\n`,
    "registry/tassullo/blocks/fuori.tsx": `import { X } from "@/registry/tassullo/ui/non-esiste"\n`,
  };
  const leggi: Lettore = (p) => SORGENTI[p] ?? null;
  const conImport = (extra: Item[]) => ({
    items: [
      { name: "button", dependencies: ["@base-ui/react", "cn@^0.2.6"], files: [{ path: "registry/tassullo/ui/button.tsx" }] },
      { name: "toni", files: [{ path: "registry/tassullo/lib/toni.ts" }] },
      {
        name: "tassullo-data-table",
        dependencies: ["@tanstack/react-table"],
        registryDependencies: ["@tassullo/button"],
        files: [{ path: "registry/tassullo/blocks/data-table.tsx" }],
      },
      {
        name: "tassullo-data-table-filtro",
        dependencies: ["date-fns", "pdfjs-dist"],
        registryDependencies: ["@tassullo/tassullo-data-table"],
        files: [{ path: "registry/tassullo/blocks/filtro.tsx" }],
      },
      ...extra,
    ],
  });

  const prove: { nome: string; registry: { items: Item[] }; attesi: number }[] = [
    { nome: "registry sano", registry: sano, attesi: 0 },
    {
      nome: "il difetto di M4.6 — nome nudo invece del pubblicato",
      registry: {
        items: [
          ...sano.items.slice(0, 2),
          { name: "tassullo-pagina-lista", registryDependencies: ["@tassullo/data-table"], files: [] },
        ],
      },
      attesi: 1,
    },
    {
      nome: "il difetto di M4ter.10 — `empty-state` per `tassullo-empty-state`",
      registry: {
        items: [
          { name: "tassullo-empty-state", registryDependencies: [], files: [] },
          { name: "tassullo-calendario", registryDependencies: ["@tassullo/empty-state"], files: [] },
        ],
      },
      attesi: 1,
    },
    {
      nome: "namespace non dichiarato in components.json",
      registry: { items: [{ name: "x", registryDependencies: ["@ignoto/qualcosa"], files: [] }] },
      attesi: 1,
    },
    {
      nome: "file dichiarato e assente dal disco",
      registry: { items: [{ name: "x", registryDependencies: [], files: [{ path: "non/esisto.tsx" }] }] },
      attesi: 1,
    },
    {
      nome: "ciclo fra item",
      registry: {
        items: [
          { name: "a", registryDependencies: ["@tassullo/b"], files: [] },
          { name: "b", registryDependencies: ["@tassullo/a"], files: [] },
        ],
      },
      attesi: 1, // un ciclo, un messaggio: al secondo capo i due nodi sono già CHIUSI
    },
    {
      nome: "import coperti dalla chiusura (il falso positivo di M4ter.10)",
      registry: conImport([]),
      attesi: 0,
    },
    {
      nome: "una dipendenza npm tolta a un item della chiusura",
      registry: {
        items: conImport([]).items.map((i) => (i.name === "tassullo-data-table" ? { ...i, dependencies: [] } : i)),
      },
      attesi: 2, // `@tanstack/react-table` manca a data-table e, per chiusura, al filtro
    },
    {
      nome: "un pacchetto importato e mai dichiarato (anche solo `import type`)",
      registry: conImport([{ name: "senza-pacchetto", files: [{ path: "registry/tassullo/blocks/senza-pacchetto.tsx" }] }]),
      attesi: 1,
    },
    {
      nome: "il difetto di M5.1a — `lib/toni` senza `@tassullo/toni`",
      registry: conImport([{ name: "tassullo-pagina-errore", files: [{ path: "registry/tassullo/pages/pagina-errore.tsx" }] }]),
      attesi: 1,
    },
    {
      nome: "un import relativo fuori dalla chiusura",
      registry: {
        items: conImport([]).items.map((i) =>
          i.name === "tassullo-data-table-filtro" ? { ...i, registryDependencies: ["@tassullo/button"] } : i
        ),
      },
      attesi: 2, // `./data-table` non arriva, e con lui `@tanstack/react-table`
    },
    {
      nome: "un import `@/` che non è un file di nessun item",
      registry: conImport([{ name: "fuori", files: [{ path: "registry/tassullo/blocks/fuori.tsx" }] }]),
      attesi: 1,
    },
  ];

  let falliti = 0;
  console.log("\n  Autotest — il gate sa fallire nei modi che dichiara\n");
  for (const prova of prove) {
    const { errori } = controlla(prova.registry, namespaceNoti, leggi);
    const ok = errori.length === prova.attesi;
    if (!ok) falliti++;
    console.log(
      `    ${ok ? "✔" : "✖"} ${prova.nome.padEnd(66)} ${errori.length} errore/i (atteso ${prova.attesi})`
    );
    if (!ok) errori.forEach((e) => console.log(`        ${e}`));
  }
  console.log(
    falliti === 0
      ? "\n✔ L'autotest passa: il gate prende i difetti veri e tace sul registry sano e sul falso positivo.\n"
      : `\n✖ L'autotest fallisce su ${falliti} prova/e: il gate non fa quello che dice.\n`
  );
  return falliti === 0 ? 0 : 1;
}

// ─────────────────────────────────────────────────────────────────────────────

function main(): number {
  if (process.argv.includes("--self-test")) return autotest();

  if (!existsSync(REGISTRY)) {
    console.error(`✖ ${REGISTRY} non trovato.`);
    return 1;
  }

  const registry = JSON.parse(readFileSync(REGISTRY, "utf8")) as { items: Item[] };
  const componentsJson = existsSync(COMPONENTS)
    ? (JSON.parse(readFileSync(COMPONENTS, "utf8")) as { registries?: Record<string, unknown> })
    : {};
  // `@shadcn` è implicito: la CLI ce l'ha dentro e non si dichiara.
  const namespaceNoti = new Set(["@shadcn", ...Object.keys(componentsJson.registries ?? {})]);

  const leggi: Lettore = (p) => (existsSync(join(RADICE, p)) ? readFileSync(join(RADICE, p), "utf8") : null);
  const { errori, avvisi, riferimenti, imports } = controlla(registry, namespaceNoti, leggi);

  console.log(`\n  ${registry.items.length} item, ${riferimenti} riferimenti fra item, ${imports} import nei file spediti`);
  console.log(`  namespace dichiarati: ${[...namespaceNoti].join(", ")}\n`);

  for (const a of avvisi) console.log(`  • ${a}`);
  for (const e of errori) console.log(`  ✖ ${e}`);

  if (errori.length > 0) {
    console.log(
      `\n✖ ${errori.length} riferimento/i che non risolve. ` +
        `Nessuno degli altri gate lo vede: si manifesta nell'app che installa — ` +
        `\`item not found\` o una compilazione che fallisce —, giorni dopo.\n`
    );
    return 1;
  }

  console.log(
    `\n✔ ${riferimenti} riferimenti fra item, tutti risolvono; ` +
      `${registry.items.reduce((n, i) => n + (i.files?.length ?? 0), 0)} file dichiarati, tutti presenti; ` +
      `nessun ciclo; ${imports} import, tutti coperti da ciò che \`add\` installa.${avvisi.length ? ` ${avvisi.length} avviso/i.` : ""}\n`
  );
  return 0;
}

process.exit(main());
