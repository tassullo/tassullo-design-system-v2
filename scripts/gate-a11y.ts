/**
 * gate-a11y.ts — axe-core su ogni story, e da M2.9 in CI.
 *
 * Il problema che risolve: fino a ieri l'audit di accessibilità era una cosa
 * da *ricordarsi*. Il pannello di Storybook c'è dal primo giorno e misura
 * bene — in M1.3 ha trovato 9 violazioni vere su una pagina appena scritta —
 * ma va aperto a mano, story per story, e nulla obbliga a farlo. Questo
 * script toglie di mezzo la memoria: `npm run test:a11y` misura tutto, e
 * esce con codice 1 se trova qualcosa.
 *
 * ── Perché quattro passate e non una ────────────────────────────────────
 *
 * Perché una misura fatta in una condizione sola non è una misura, e la
 * FASE 2 lo ha imparato due volte, con due assi diversi.
 *
 *   **La modalità.** `variant: link` del bottone dava 1.79:1 in chiaro e in
 *   scuro **non compariva affatto**: chi avesse misurato solo il tema scuro
 *   avrebbe dichiarato il bottone a posto.
 *
 *   **Lo stato del popup.** In M2.3 il conto è passato da 8 a 12 violazioni
 *   dentro la stessa sessione, appena l'imbracatura ha imparato ad aprire
 *   anche il `select` — le quattro nuove erano sempre state lì, dietro un
 *   pannello chiuso. E in M2.6 si è visto il rovescio: a elenco **aperto**
 *   Base UI rende inerte il grilletto del combobox, axe smette di guardarlo,
 *   e un `button-name` *critical* esiste **solo** nella passata chiusa.
 *
 * Da cui la matrice: {chiaro, scuro} × {chiuso, aperto}. Le due modalità le
 * sceglie `VITE_MODALITA`, i due stati `VITE_POPUP`, e a leggerli è
 * `.storybook/vitest.setup.ts`.
 *
 * ── Cosa dichiara, e perché è la parte che conta ────────────────────────
 *
 * Un popup non aperto non è un popup senza violazioni. Perciò lo script non
 * si limita a misurare: **dice quali popup ha aperto davvero**, leggendo le
 * dichiarazioni `@/prove/apri` nelle story, e le confronta con l'elenco dei
 * componenti che un popup ce l'hanno. Se un componente con popup non
 * dichiara di aprirlo, il gate lo **segnala**: è il solo modo di distinguere
 * «misurato e pulito» da «mai guardato».
 *
 * ── Una passata che non misura niente è rossa ───────────────────────────
 *
 * Il 2026-10-18, in un ambiente dove Playwright non trovava il suo browser,
 * il gate ha stampato «✔ 0 scansioni» ed è uscito con 0. Vitest era uscito
 * con 1, ma il suo rapporto JSON diceva `success: true` con zero test, e lo
 * script leggeva solo il rapporto. Un ambiente rotto passava per pulito.
 * Ora una passata è **guasta**, e il gate rosso, se non ha misurato nessuna
 * story o se vitest esce con errore senza un test fallito che lo spieghi; il
 * gate dice perché, con la prima riga d'errore di vitest. `valuta()` è la
 * regola, e `--self-test` la prova sui casi che la decidono.
 *
 * Uso:
 *   npm run test:a11y            le quattro passate
 *   npm run test:a11y -- --una   solo chiaro/chiuso, per iterare in fretta
 *   node scripts/gate-a11y.ts --self-test
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

/**
 * Dove stanno le story del registry. Da M3.1 sono **due** cartelle: le
 * primitive in `ui/`, i blocchi della FASE 3 in `blocks/`. Cercare le
 * dichiarazioni nella sola `ui/` avrebbe fatto passare per «senza popup» un
 * blocco che un popup ce l'ha — e il guscio ne ha uno, il menù utente.
 */
const STORIE_DIR = ["registry/tassullo/ui", "registry/tassullo/blocks"];

/**
 * I componenti che un popup ce l'hanno. Non si deduce dal codice: un
 * `data-slot` che finisce per `-trigger` c'è anche su `accordion` e `tabs`,
 * che popup non sono. È un elenco scritto a mano, ed è giusto che lo sia —
 * quando ne arriva uno nuovo, aggiungerlo qui è il gesto che ricorda di
 * dichiararne anche l'apertura.
 */
const CON_POPUP = [
  "alert-dialog",
  "app-shell",
  "barra-contesto",
  "calendario",
  "combobox",
  "confirm-dialog",
  "context-menu",
  "data-table",
  "dialog",
  "drawer",
  "dropdown-menu",
  "foglio-gruppi",
  "galleria-immagini",
  "hover-card",
  "page-header",
  "popover",
  "responsive-dialog",
  "rich-text-editor",
  "select",
  "sheet",
  "testo-segnaposto",
  "tooltip",
];

type Passata = { modalita: string; popup: string };

const PASSATE: Passata[] = [
  { modalita: "chiaro", popup: "chiuso" },
  { modalita: "chiaro", popup: "aperto" },
  { modalita: "scuro", popup: "chiuso" },
  { modalita: "scuro", popup: "aperto" },
];

/** Quali componenti dichiarano di aprire il proprio popup, e con che gesto. */
function dichiarazioni(): Map<string, string> {
  const trovate = new Map<string, string>();
  for (const dir of STORIE_DIR) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".stories.tsx")) continue;
      const testo = readFileSync(join(dir, f), "utf8");
      const m = testo.match(/play: (apri[A-Za-zÀ-ú]*)\(/);
      if (m) trovate.set(f.replace(".stories.tsx", ""), m[1]);
    }
  }
  return trovate;
}

// `scene`: quali scene sono fallite e perché, in una riga. Senza, una corsa
// rossa dice quante e non quali, e una prova instabile non si ritrova: è
// successo due volte su `main`, il 12 e il 13 ottobre 2026.
type Esito = {
  storie: number;
  falliti: number;
  regole: Map<string, number>;
  scene: string[];
  guasto?: string;
};

/** I codici di colore del terminale via. */
function senzaColori(testo: string): string {
  return testo.replace(/\u001b\[[\d;]*m/g, "");
}

/**
 * Se la passata non ha misurato davvero, il perché; altrimenti `undefined`.
 * `stato` è il codice d'uscita di vitest, `uscita` il suo testo.
 */
function valuta(stato: number | null, storie: number, falliti: number, uscita: string): string | undefined {
  const primaRiga = senzaColori(uscita)
    .split("\n")
    .map((r) => r.trim())
    .find((r) => /error/i.test(r));
  const dettaglio = primaRiga ? `: ${primaRiga.slice(0, 200)}` : "";
  if (storie === 0) return `nessuna story misurata (vitest uscito con ${stato})${dettaglio}`;
  if (stato !== 0 && falliti === 0) return `vitest uscito con ${stato} senza un test fallito${dettaglio}`;
  return undefined;
}

function autotest() {
  const casi: [string, number | null, number, number, boolean][] = [
    ["browser che non parte: 0 story, uscita 1", 1, 0, 0, true],
    ["0 story, uscita 0", 0, 0, 0, true],
    ["processo ucciso: uscita null", null, 386, 0, true],
    ["errore senza test fallito", 1, 386, 0, true],
    ["violazioni vere", 1, 386, 2, false],
    ["passata pulita", 0, 386, 0, false],
  ];
  let ok = true;
  for (const [nome, stato, storie, falliti, guasta] of casi) {
    const g = valuta(stato, storie, falliti, "x\nError: browserType.launch: Executable doesn't exist\n");
    const giusto = Boolean(g) === guasta;
    ok &&= giusto;
    console.log(`  ${giusto ? "✔" : "✖"} ${nome}: ${g ?? "misurata"}`);
  }
  if (!ok) process.exit(1);
  console.log("\n✔ Il gate sa riconoscere una passata che non ha misurato niente.\n");
}

function esegui(p: Passata, cartella: string): Esito {
  const uscita = join(cartella, `${p.modalita}-${p.popup}.json`);
  const vitest = spawnSync(
    "npx",
    ["vitest", "run", "--project=storybook", "--reporter=json", `--outputFile=${uscita}`],
    {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
      env: { ...process.env, VITE_MODALITA: p.modalita, VITE_POPUP: p.popup },
    },
  );
  if (!existsSync(uscita)) throw new Error(`La passata ${p.modalita}/${p.popup} non ha prodotto un rapporto`);

  const dati = JSON.parse(readFileSync(uscita, "utf8"));
  const regole = new Map<string, number>();
  const scene: string[] = [];
  let storie = 0;
  let falliti = 0;
  for (const file of dati.testResults ?? []) {
    for (const t of file.assertionResults ?? []) {
      storie++;
      if (t.status === "passed") continue;
      falliti++;
      const msg = (t.failureMessages ?? []).join(" ");
      const ids = new Set([...msg.matchAll(/rules\/axe\/[\d.]+\/([a-z-]+)/g)].map((m) => m[1]));
      for (const id of ids.size > 0 ? ids : ["imbracatura"]) {
        regole.set(id, (regole.get(id) ?? 0) + 1);
      }
      // I colori del terminale via, e gli a capo: il perché sta in una riga.
      const perche = senzaColori(msg).replace(/\s+/g, " ").trim().slice(0, 300);
      scene.push(`${basename(String(file.name ?? ""))} › ${t.fullName ?? t.title}: ${perche}`);
    }
  }
  const guasto = valuta(vitest.status, storie, falliti, `${vitest.stderr ?? ""}\n${vitest.stdout ?? ""}`);
  return { storie, falliti, regole, scene, guasto };
}

function main() {
  if (process.argv.includes("--self-test")) return autotest();
  const soloUna = process.argv.includes("--una");
  const passate = soloUna ? PASSATE.slice(0, 1) : PASSATE;
  const cartella = mkdtempSync(join(tmpdir(), "gate-a11y-"));

  try {
    const dich = dichiarazioni();
    const scoperti = CON_POPUP.filter((c) => !dich.has(c));

    console.log("\n  Popup che l'imbracatura apre davvero\n");
    for (const c of CON_POPUP) {
      const come = dich.get(c);
      console.log(`    ${come ? "✔" : "✖"} ${c.padEnd(15)} ${come ?? "NESSUNA DICHIARAZIONE"}`);
    }

    let totScansioni = 0;
    let totFalliti = 0;
    let guaste = 0;
    const tutte = new Map<string, number>();
    const righe: string[] = [];

    for (const p of passate) {
      const e = esegui(p, cartella);
      totScansioni += e.storie;
      totFalliti += e.falliti;
      for (const [k, v] of e.regole) tutte.set(k, (tutte.get(k) ?? 0) + v);
      const dettaglio =
        e.regole.size === 0
          ? "—"
          : [...e.regole].map(([k, v]) => `${k}×${v}`).join(", ");
      righe.push(
        `    ${(p.modalita + "/" + p.popup).padEnd(16)} ${String(e.storie).padStart(4)} story` +
          `  ${String(e.falliti).padStart(3)} violazioni  ${dettaglio}`,
      );
      for (const scena of e.scene) righe.push(`      ✖ ${scena}`);
      if (e.guasto) {
        guaste++;
        righe.push(`      ✖ passata guasta, ${e.guasto}`);
      }
    }

    console.log("\n  Passate\n");
    for (const r of righe) console.log(r);

    const verde = totFalliti === 0 && scoperti.length === 0 && guaste === 0;
    console.log(
      `\n${verde ? "✔" : "✖"} ${totScansioni} scansioni` +
        ` (${passate.length} passate), ${totFalliti} violazioni` +
        (scoperti.length > 0 ? `, ${scoperti.length} popup mai aperto: ${scoperti.join(", ")}` : "") +
        (guaste > 0 ? `, ${guaste} passata/e guasta/e: il gate non ha misurato` : "") +
        "\n",
    );
    if (!verde) process.exit(1);
  } finally {
    rmSync(cartella, { recursive: true, force: true });
  }
}

main();
