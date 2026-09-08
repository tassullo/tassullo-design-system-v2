/**
 * build-font-css.ts — emette `registry/tassullo/theme/inter.css`, cioè le
 * `@font-face` di Inter con i file inlinati in data URI.
 *
 * Uso:
 *   npm run font:build     rigenera il CSS dai .woff2 in theme/fonts/
 *   npm run check:font     verifica che il file non sia divergente
 *
 * ── Perché in data URI, e non come file separati ─────────────────────────
 *
 * Perché **il registry non sa portare binari**, accertato l'8 settembre 2026
 * e non supposto: `shadcn build` legge ogni file come UTF-8 e ne mette il
 * testo nel JSON. Provato con un `.woff2` da 73.016 byte: nel JSON ne
 * arrivano 69.186 caratteri, e ri-codificando non si torna all'originale.
 * Il font arriverebbe **corrotto**, e senza errore — la CLI copia una
 * stringa, non verifica di aver copiato un font.
 *
 * Il CSS invece è testo, e viaggia sul canale `registry:theme` che M1.5 ha
 * già dimostrato funzionare. Costa un terzo in più di byte rispetto al
 * binario (base64), e in cambio l'app non fa **nessuna richiesta di rete**
 * per il carattere: né a Google, né a noi.
 *
 * ── Perché un item a parte e non dentro tassullo-theme.css ───────────────
 *
 * Perché il tema è anche documentazione: ha più commenti che dichiarazioni,
 * e affogarlo sotto 200 KB di base64 lo renderebbe illeggibile. Stanno in
 * due file, e `tema` dichiara `tema-font` fra le proprie dipendenze di
 * registry: `add @tassullo/tema` li porta tutti e due.
 *
 * ── Perché solo il sottoinsieme `latin` ──────────────────────────────────
 *
 * Perché copre l'italiano e il tedesco — accentate e umlaut stanno in
 * U+0000-00FF. `latin-ext` aggiunge l'Europa centrale e costa il doppio
 * (130 KB contro 71). Se un giorno servisse, si scaricano i due file da
 * Google Fonts e si aggiungono a SOTTOINSIEMI qui sotto.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "registry/tassullo/theme";
const USCITA = join(DIR, "inter.css");

/** Le facce che si distribuiscono. `unicode-range` è quello di Google Fonts
 *  per il sottoinsieme `latin`, copiato senza ritocchi: descrive cosa c'è
 *  davvero dentro il file, e sbagliarlo farebbe scaricare la faccia per
 *  caratteri che non contiene. */
const RANGE_LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, " +
  "U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, " +
  "U+2212, U+2215, U+FEFF, U+FFFD";

const FACCE = [
  { file: "fonts/inter-latin.woff2", stile: "normal" },
  { file: "fonts/inter-latin-italic.woff2", stile: "italic" },
] as const;

/** Inter è variabile: un file solo copre tutti i pesi da 300 a 900. È anche
 *  la ragione per cui il peso 500 e il 600 rendono davvero diversi, che è il
 *  criterio su cui Replica non passava (docs/DECISIONI.md §14). */
const PESI = "300 900";

function costruisci(): string {
  const facce = FACCE.map(({ file, stile }) => {
    const b64 = readFileSync(join(DIR, file)).toString("base64");
    return `@font-face {
  font-family: 'Inter';
  font-style: ${stile};
  font-weight: ${PESI};
  font-display: swap;
  unicode-range: ${RANGE_LATIN};
  src: url(data:font/woff2;base64,${b64}) format('woff2');
}`;
  }).join("\n\n");

  return `/* ── NOTA DI REPO — questo commento NON arriva alle app ───────────────
   \`shadcn build\` scarta il PRIMO commento di un file del registry (M1.5).
   Qui sta ciò che vale solo dentro questo repo; nel commento successivo —
   che invece viaggia — ciò che deve leggere chi installa.

   GENERATO da scripts/build-font-css.ts dai .woff2 in theme/fonts/.
   Non modificare a mano: \`npm run check:font\` fallisce se diverge.

     npm run font:build     rigenera questo file
     npm run check:font     verifica che sia allineato ai .woff2

   In data URI perché il registry NON sa portare binari: \`shadcn build\`
   legge i file come UTF-8 e un .woff2 arriverebbe corrotto, senza errore.
   Misura in docs/DECISIONI.md §15.
   ────────────────────────────────────────────────────────────────────── */

/* ══════════════════════════════════════════════════════════════════════
   INTER — il carattere delle interfacce Tassullo

   Installato insieme al tema:  npx shadcn@latest add @tassullo/tema

   I file del carattere sono **dentro questo CSS**, in data URI: l'app non
   fa nessuna richiesta di rete per la tipografia, né a Google né a noi.
   È una scelta deliberata — servire i font da un terzo significa mandargli
   l'indirizzo IP di ogni visitatore (D3, chiusa il 2026-09-08).

   Sottoinsieme \`latin\`: copre italiano e tedesco. Variabile, un file per
   stile copre tutti i pesi da 300 a 900.

   ── Licenza ─────────────────────────────────────────────────────────────
   Inter — Copyright (c) 2016 The Inter Project Authors
   https://github.com/rsms/inter

   SIL Open Font License 1.1. Il testo integrale accompagna questo file
   (\`tassullo-inter-OFL.txt\`) e la licenza richiede che resti insieme al
   font: **non si cancella**. Il font può essere usato, modificato e
   ridistribuito liberamente; non può essere venduto per conto proprio.
   ══════════════════════════════════════════════════════════════════════ */

${facce}
`;
}

function main(): void {
  const atteso = costruisci();
  if (process.argv.includes("--write")) {
    writeFileSync(USCITA, atteso);
    const kb = Math.round(atteso.length / 1024);
    console.log(`\n✔ scritto ${USCITA} (${kb} KB, ${FACCE.length} facce)\n`);
    return;
  }

  let corrente = "";
  try {
    corrente = readFileSync(USCITA, "utf8");
  } catch {
    console.error(`\n✘ ${USCITA} non esiste. Esegui: npm run font:build\n`);
    process.exit(1);
  }
  if (corrente !== atteso) {
    console.error(
      `\n✘ ${USCITA} diverge dai .woff2 in ${DIR}/fonts/.\n` +
        `  È un file generato: rigeneralo con \`npm run font:build\`.\n`,
    );
    process.exit(1);
  }
  console.log(`\n✔ ${USCITA} allineato ai .woff2 (${FACCE.length} facce).\n`);
}

main();
