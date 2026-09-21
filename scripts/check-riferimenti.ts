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
 * **Cosa NON fa, e perché.** Non controlla le `dependencies` npm. Provato in
 * M4ter.10 su tutti e 94 gli item: l'unico caso segnalato —
 * `tassullo-data-table-filtro-sfaccettato`, che usa `@base-ui/react` e `cn`
 * senza dichiararli — è un **falso positivo**, perché i due pacchetti arrivano
 * dalla chiusura transitiva dei suoi `registryDependencies` (`@tassullo/button`
 * li dichiara, e `add` installa anche quello). Un gate che grida al lupo si
 * smette di leggere, quindi quel controllo resta fuori finché non si sa
 * distinguere i due casi senza rumore.
 *
 * Non raggiunge la rete: gli item di `@shadcn` e `@reui` non si scaricano per
 * verificarli, si controlla solo che il **namespace** sia dichiarato in
 * `components.json`. Un gate che dipende dalla rete è un gate che fallisce in
 * aereo e in CI il giorno che reui.io è giù.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const RADICE = process.cwd();
const REGISTRY = join(RADICE, "registry.json");
const COMPONENTS = join(RADICE, "components.json");

type Item = {
  name: string;
  registryDependencies?: string[];
  files?: { path: string }[];
};

type Esito = { errori: string[]; avvisi: string[]; riferimenti: number };

/** `@tassullo/button` → `["@tassullo", "button"]`; `button` → `[null, "button"]`. */
function spezza(riferimento: string): [string | null, string] {
  const m = /^(@[^/]+)\/(.+)$/.exec(riferimento);
  return m ? [m[1]!, m[2]!] : [null, riferimento];
}

function controlla(registry: { items: Item[] }, namespaceNoti: Set<string>): Esito {
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
      if (!existsSync(join(RADICE, file.path))) {
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

  return { errori, avvisi, riferimenti };
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * **L'autotest**, che è la parte che rende il gate credibile: un controllo che
 * non si è mai visto fallire non si sa se funziona. Rifà i tre difetti veri —
 * quello di M4.6, quello di M4ter.10 e un namespace non dichiarato — su un
 * registry finto in memoria, e verifica che li prenda tutti e tre e che su un
 * registry sano taccia.
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
  ];

  let falliti = 0;
  console.log("\n  Autotest — il gate sa fallire nei modi che dichiara\n");
  for (const prova of prove) {
    const { errori } = controlla(prova.registry, namespaceNoti);
    const ok = errori.length === prova.attesi;
    if (!ok) falliti++;
    console.log(
      `    ${ok ? "✔" : "✖"} ${prova.nome.padEnd(56)} ${errori.length} errore/i (atteso ${prova.attesi})`
    );
    if (!ok) errori.forEach((e) => console.log(`        ${e}`));
  }
  console.log(
    falliti === 0
      ? "\n✔ L'autotest passa: il gate prende i tre difetti veri e tace sul registry sano.\n"
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

  const { errori, avvisi, riferimenti } = controlla(registry, namespaceNoti);

  console.log(`\n  ${registry.items.length} item, ${riferimenti} riferimenti fra item`);
  console.log(`  namespace dichiarati: ${[...namespaceNoti].join(", ")}\n`);

  for (const a of avvisi) console.log(`  • ${a}`);
  for (const e of errori) console.log(`  ✖ ${e}`);

  if (errori.length > 0) {
    console.log(
      `\n✖ ${errori.length} riferimento/i che non risolve. ` +
        `Nessuno degli altri gate lo vede: si manifesta come \`item not found\` ` +
        `nell'app che installa, giorni dopo.\n`
    );
    return 1;
  }

  console.log(
    `\n✔ ${riferimenti} riferimenti fra item, tutti risolvono; ` +
      `${registry.items.reduce((n, i) => n + (i.files?.length ?? 0), 0)} file dichiarati, tutti presenti; ` +
      `nessun ciclo.${avvisi.length ? ` ${avvisi.length} avviso/i.` : ""}\n`
  );
  return 0;
}

process.exit(main());
