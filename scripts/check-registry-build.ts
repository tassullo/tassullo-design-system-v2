/**
 * check-registry-build.ts — il controllo che `public/r/` sia l'artefatto dei
 * sorgenti, e non una fotografia vecchia.
 *
 * Il problema che risolve, e non è ipotetico. Il 2026-09-20, in M4ter.4, un
 * `npm run registry:build` di routine ha rigenerato
 * `public/r/entity-image.json`, che con quel task non c'entrava niente. La
 * causa stava due sessioni prima: la coda 2 di M4ter.3 aveva tolto
 * `bg-muted` dalla radice di `entity-image.tsx` — la regola «un componente
 * non dipinge un fondo che non gli è stato chiesto» — **senza rilanciare
 * `registry:build`**. Il registry *pubblicato* serviva quindi ancora la
 * versione col fondo: un'app che avesse installato `entity-image` quel
 * giorno avrebbe ricevuto esattamente ciò che quella sessione aveva deciso
 * di togliere.
 *
 * Nessuno dei cinque gate se n'era accorto, e non per svista: `check:registry`
 * confronta i **componenti** con `registry/.upstream/`, cioè il nostro codice
 * con l'originale shadcn. Nessuno confrontava l'**artefatto pubblicato** col
 * codice da cui nasce. È lo stesso difetto muto che `check:font` e
 * `check:logo` chiudono per i due CSS generati, e la forma qui è identica:
 * rigenerare e confrontare, uscendo con codice 1 se differisce.
 *
 * Perché è un difetto **muto**, che è la ragione per cui vuole un gate:
 * `public/r/` non si compila, non si esegue e non si guarda mai. Un JSON
 * vecchio lì dentro non rompe niente in casa — rompe nelle app, settimane
 * dopo, e nel modo peggiore: installano un componente che nel repo non esiste
 * più, e il `git log` del repo dice il contrario di quello che hanno in mano.
 *
 * ── Perché si rilancia il costruttore vero, invece di ricostruire in proprio
 *
 * La tentazione era leggere `registry.json`, rileggere i file e comporre i
 * JSON attesi a mano. Sarebbe stata una **seconda implementazione** del
 * formato di shadcn: alla prima versione in cui loro cambiano una chiave, il
 * gate darebbe 90 falsi positivi e si smetterebbe di leggerlo — che è la cosa
 * che il `CLAUDE.md` dice di non fare mai a un gate.
 *
 * Quindi si esegue **`shadcn build`, quello vero**, scrivendo in una cartella
 * temporanea **fuori dal repo**, e si confronta byte per byte con `public/r/`.
 * Il costruttore resta uno solo, e il gate non sa nulla del formato. Costa
 * 0,8 secondi e la CLI è una devDependency (`shadcn@^4.21.0`), quindi la
 * versione è quella bloccata dal lockfile e non serve la rete.
 *
 * **Non si scrive niente nel repo**: la cartella temporanea sta in
 * `os.tmpdir()` e viene cancellata in ogni caso, anche quando il confronto
 * fallisce.
 *
 * Uso:
 *   npm run check:registry-build                verifica l'allineamento
 *   npm run check:registry-build -- --self-test prova che il gate sa fallire
 *
 * Quando fallisce, il rimedio è sempre lo stesso: `npm run registry:build`,
 * e poi si committa `public/r/` — che si committa apposta, perché è ciò che
 * GitHub serve alla forma namespace del registry.
 */

import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const USCITA = "public/r";
const REGISTRY = "registry.json";
const CLI = join("node_modules", ".bin", "shadcn");

/** Una divergenza fra l'artefatto pubblicato e quello appena costruito. */
type Divergenza = {
  file: string;
  genere: "mancante" | "in-più" | "diverso";
  /** Per `diverso`: quale file *dentro* l'item è cambiato, quando si sa dirlo. */
  dettaglio?: string;
};

/**
 * Costruisce il registry in una cartella temporanea e restituisce il percorso.
 * Chi chiama è responsabile di cancellarla.
 */
function costruisciAltrove(): string {
  if (!existsSync(CLI)) {
    console.error(
      `\n✘ ${CLI} non esiste. Esegui \`npm install\`.\n` +
        `  Il gate usa la CLI shadcn dichiarata nelle devDependencies, non\n` +
        `  \`npx shadcn@latest\`: la versione dev'essere quella del lockfile,\n` +
        `  o il confronto misurerebbe la differenza fra due costruttori.\n`,
    );
    process.exit(1);
  }
  const dir = mkdtempSync(join(tmpdir(), "tassullo-registry-"));
  try {
    execFileSync(CLI, ["build", REGISTRY, "--output", dir], { stdio: "pipe" });
  } catch (errore) {
    rmSync(dir, { recursive: true, force: true });
    const e = errore as { stdout?: Buffer; stderr?: Buffer };
    console.error(
      `\n✘ \`shadcn build\` è fallito, quindi l'allineamento non è verificabile.\n\n` +
        `${(e.stderr?.toString() || e.stdout?.toString() || "").trim()}\n`,
    );
    process.exit(1);
  }
  return dir;
}

/**
 * Quale file *dentro* l'item è cambiato. È la differenza fra «qualcosa in
 * `entity-image.json` non torna» e «il contenuto di `entity-image.tsx` non è
 * quello pubblicato»: la seconda si corregge senza aprire niente.
 *
 * Se i due JSON non sono confrontabili in questa forma — perché shadcn ha
 * cambiato il formato, o perché a divergere è un campo e non un file — non si
 * inventa una spiegazione: si tace, e resta il verdetto «diverso».
 */
function dettaglio(atteso: string, corrente: string): string | undefined {
  type Item = { files?: { path: string; content?: string }[] };
  let a: Item;
  let c: Item;
  try {
    a = JSON.parse(atteso) as Item;
    c = JSON.parse(corrente) as Item;
  } catch {
    return undefined;
  }
  if (!Array.isArray(a.files) || !Array.isArray(c.files)) return undefined;

  const perPercorso = new Map(c.files.map((f) => [f.path, f.content]));
  const cambiati = a.files
    .filter((f) => !perPercorso.has(f.path) || perPercorso.get(f.path) !== f.content)
    .map((f) => f.path);
  const spariti = c.files
    .filter((f) => !a.files!.some((g) => g.path === f.path))
    .map((f) => `${f.path} (non più nell'item)`);

  const tutti = [...cambiati, ...spariti];
  if (tutti.length === 0) return "cambia un campo dell'item, non i file";
  return tutti.join(", ");
}

/**
 * Il cuore del gate, isolato apposta: è la stessa funzione che il `--self-test`
 * mette alla prova. Un controllo che si verifica per un'altra strada da quella
 * che usa davvero non prova niente.
 */
function confronta(dirAtteso: string, dirCorrente: string): Divergenza[] {
  const soloJson = (d: string) => readdirSync(d).filter((f) => f.endsWith(".json")).sort();
  const attesi = soloJson(dirAtteso);
  const correnti = new Set(soloJson(dirCorrente));
  const divergenze: Divergenza[] = [];

  for (const file of attesi) {
    if (!correnti.has(file)) {
      divergenze.push({ file, genere: "mancante" });
      continue;
    }
    const atteso = readFileSync(join(dirAtteso, file), "utf8");
    const corrente = readFileSync(join(dirCorrente, file), "utf8");
    if (atteso !== corrente) {
      divergenze.push({ file, genere: "diverso", dettaglio: dettaglio(atteso, corrente) });
    }
  }
  for (const file of correnti) {
    if (!attesi.includes(file)) divergenze.push({ file, genere: "in-più" });
  }
  return divergenze;
}

/**
 * `dove` è il nome della cartella confrontata, e non è pedanteria: nel
 * `--self-test` il confronto è fra due cartelle temporanee, e un messaggio
 * che dicesse `public/r/` starebbe nominando una cartella che quella prova
 * non ha nemmeno guardato.
 */
function stampa(divergenze: Divergenza[], dove: string) {
  for (const d of divergenze) {
    if (d.genere === "mancante") {
      console.error(`  • ${d.file}: l'item esiste in registry.json ma non in ${dove}`);
    } else if (d.genere === "in-più") {
      console.error(`  • ${d.file}: è in ${dove} ma non nasce più da registry.json`);
    } else {
      console.error(`  • ${d.file}: diverge dal sorgente${d.dettaglio ? ` — ${d.dettaglio}` : ""}`);
    }
  }
}

/**
 * La prova che il gate sa fallire, sul modello di `check:contrast --self-test`.
 * Non tocca né il repo né `public/r/`: lavora su **due copie temporanee**, una
 * delle quali viene guastata a mano in tre modi diversi, uno per ciascun
 * genere di divergenza che il gate dichiara di saper vedere.
 *
 * E si prova anche la direzione opposta — due cartelle identiche devono dare
 * **zero** divergenze — perché un confronto che segnala sempre è inutile
 * quanto uno che tace sempre.
 */
function selfTest(): never {
  const atteso = costruisciAltrove();
  const guasto = mkdtempSync(join(tmpdir(), "tassullo-registry-guasto-"));
  try {
    cpSync(atteso, guasto, { recursive: true });

    const pulito = confronta(atteso, guasto);
    console.log(
      `\nself-test, direzione 1 — due copie identiche: ${pulito.length} divergenza/e (attese 0)`,
    );

    const files = readdirSync(guasto).filter((f) => f.endsWith(".json")).sort();
    const daGuastare = files.find((f) => f !== "registry.json") ?? files[0];
    const daTogliere = files.filter((f) => f !== daGuastare && f !== "registry.json")[0];

    // (1) un contenuto cambiato, che è il caso vero di M4ter.3.
    const originale = JSON.parse(readFileSync(join(guasto, daGuastare), "utf8"));
    if (Array.isArray(originale.files) && originale.files[0]) {
      originale.files[0].content = `${originale.files[0].content ?? ""}\n/* guasto del self-test */\n`;
    } else {
      originale.description = `${originale.description ?? ""} (guasto del self-test)`;
    }
    writeFileSync(join(guasto, daGuastare), JSON.stringify(originale, null, 2));
    // (2) un item sparito dall'artefatto.
    rmSync(join(guasto, daTogliere));
    // (3) un item di troppo, rimasto da una rinomina di ieri.
    writeFileSync(join(guasto, "fantasma-di-ieri.json"), "{}\n");

    const trovate = confronta(atteso, guasto);
    console.log(
      `self-test, direzione 2 — copia guastata in tre modi: ${trovate.length} divergenza/e (attese 3)`,
    );
    stampa(trovate, "questa copia");

    const generi = new Set(trovate.map((d) => d.genere));
    const ok =
      pulito.length === 0 &&
      trovate.length === 3 &&
      generi.has("diverso") &&
      generi.has("mancante") &&
      generi.has("in-più");
    if (!ok) {
      console.error(
        `\n✖ self-test FALLITO: il gate non distingue i tre casi che dichiara.\n` +
          `  Un gate che non sa fallire non è un gate.\n`,
      );
      process.exit(1);
    }
    console.log(
      `\n✔ self-test superato: 0 divergenze fra copie identiche, 3 sulla copia guastata\n` +
        `  (contenuto cambiato, item mancante, item di troppo).\n`,
    );
    process.exit(0);
  } finally {
    rmSync(atteso, { recursive: true, force: true });
    rmSync(guasto, { recursive: true, force: true });
  }
}

function main() {
  if (process.argv.includes("--self-test")) selfTest();

  if (!existsSync(USCITA)) {
    console.error(`\n✘ ${USCITA}/ non esiste. Esegui: npm run registry:build\n`);
    process.exit(1);
  }

  const dir = costruisciAltrove();
  let divergenze: Divergenza[];
  try {
    divergenze = confronta(dir, USCITA);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  if (divergenze.length > 0) {
    console.error(
      `\n✘ ${USCITA}/ non corrisponde ai sorgenti — ${divergenze.length} item divergente/i:\n`,
    );
    stampa(divergenze, `${USCITA}/`);
    console.error(
      `\n  ${USCITA}/ è un artefatto generato **che si committa**: è ciò che GitHub\n` +
        `  serve come registry alla forma namespace. Rigeneralo e committalo:\n\n` +
        `      npm run registry:build\n`,
    );
    process.exit(1);
  }

  const quanti = readdirSync(USCITA).filter((f) => f.endsWith(".json")).length;
  console.log(`\n✔ ${USCITA}/ allineato ai sorgenti (${quanti} file, indice compreso).\n`);
}

main();
