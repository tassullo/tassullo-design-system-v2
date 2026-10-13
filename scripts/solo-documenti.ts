/**
 * solo-documenti — una modifica di soli documenti salta i gate lenti
 *
 * **Perché esiste.** I tredici gate durano una decina di minuti, quasi tutti
 * nelle quattro passate di axe e in quella di WebKit. Una voce di diario o
 * una decisione messa a verbale non cambia nessuna scena: farle passare da
 * lì costava venticinque minuti a modifica, fra locale, PR e `main`, e il 13
 * ottobre 2026 quattro PR di soli documenti hanno occupato un pomeriggio.
 * Deciso da Francesco quel giorno (`docs/DECISIONI.md` §80).
 *
 * **Cosa decide.** Legge l'elenco dei file cambiati, uno per riga, e stampa
 * `documenti` o `codice`. È `documenti` solo se ogni file è un `.md` alla
 * radice del repository o in `docs/`. Tutto il resto è `codice`, e così un
 * elenco vuoto: nel dubbio i gate girano tutti.
 *
 * **Cosa resta fuori apposta.** I `.md` sotto `registry/` e `public/`
 * arrivano alle app; i `.mdx` sono pagine della style guide. Sono codice.
 *
 * **Cosa non salta.** Gli undici controlli statici girano sempre: due di loro
 * leggono proprio dei documenti (`check:checklist` legge `CHECKLIST.md`,
 * `check:lint-app` prende la configurazione da `docs/INTEGRAZIONE.md`).
 *
 *   git diff --name-only main...HEAD | node scripts/solo-documenti.ts
 *   node scripts/solo-documenti.ts --self-test
 */

import { readFileSync } from "node:fs";

const DOCUMENTO = /^(?:docs\/)?[^/]+\.md$/;

function decidi(file: string[]): "documenti" | "codice" {
  const cambiati = file.map((f) => f.trim()).filter(Boolean);
  if (cambiati.length === 0) return "codice";
  return cambiati.every((f) => DOCUMENTO.test(f)) ? "documenti" : "codice";
}

function autotest(): number {
  const casi: [file: string[], atteso: "documenti" | "codice"][] = [
    [["WORKLOG.md"], "documenti"],
    [["WORKLOG.md", "docs/DECISIONI.md", "CLAUDE.md", "CHECKLIST.md"], "documenti"],
    [["docs/INTEGRAZIONE.md"], "documenti"],
    [[], "codice"],
    [["", "  "], "codice"],
    [["WORKLOG.md", "registry.json"], "codice"],
    [["WORKLOG.md", "scripts/gate-a11y.ts"], "codice"],
    [["stories/Introduzione.mdx"], "codice"],
    [["registry/tassullo/theme/marchio/LEGGIMI.md"], "codice"],
    [["public/esempi/LEGGIMI.md"], "codice"],
    [["docs/sotto/nota.md"], "codice"],
    [["nota.md.ts"], "codice"],
    [[".github/workflows/gate.yml"], "codice"],
  ];
  let sbagliati = 0;
  for (const [file, atteso] of casi) {
    const esito = decidi(file);
    if (esito !== atteso) {
      sbagliati++;
      console.error(`  ✖ ${JSON.stringify(file)}: ${esito}, atteso ${atteso}`);
    }
  }
  console.log(
    sbagliati === 0
      ? `✔ self-test: ${casi.length} casi, soli documenti e codice si distinguono.`
      : `✖ self-test: ${sbagliati} caso/i sbagliato/i su ${casi.length}.`,
  );
  return sbagliati === 0 ? 0 : 1;
}

function main(): number {
  if (process.argv.includes("--self-test")) return autotest();
  console.log(decidi(readFileSync(0, "utf8").split("\n")));
  return 0;
}

process.exit(main());
