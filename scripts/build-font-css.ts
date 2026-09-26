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
 * ── Perché in `public/`, collegato da `index.html` (#79, DECISIONI §70) ──
 *
 * Fino a v2.0.4 il file arrivava in `src/` e il campo `css` dell'item ne
 * aggiungeva l'`@import` al CSS globale. Vite però fonde l'`@import` nell'unico
 * CSS dell'app, che cambia nome a ogni rilascio: misurato su una build vera di
 * Anagrafe, 364 kB (174 brotli) di cui 204 di carattere, riscaricati per una
 * classe cambiata. Ora l'item mette lo stesso CSS in `public/`, con un nome che
 * cambia solo quando cambia il carattere, e l'app lo collega con un `<link>` in
 * `index.html`: a un rilascio si riscaricano 21 kB.
 *
 * **Il nome** è `tassullo-inter-<versione>.css`, con la versione di Inter
 * letta dai `.woff2` (tabella `head`, `fontRevision`: 4.001 → «4.1»), non
 * scritta a mano: cambia quando si sostituiscono i file del carattere, e solo
 * allora. Un'impronta del contenuto sarebbe più precisa (cambierebbe anche per
 * un sottoinsieme diverso a parità di versione), ma andrebbe riscritta in ogni
 * `index.html` e in ogni documento a ogni ritocco, e si leggerebbe come un
 * numero a caso; chi cambia il sottoinsieme senza cambiare Inter aggiunge un
 * suffisso a `SUFFISSO`. `check:font` verifica che `registry.json` installi il
 * file con quel nome.
 *
 * **Niente nota di repo in testa.** Un file `registry:file` in `public/`
 * arriva intero: la CLI non toglie la testa come fa coi CSS `registry:theme`
 * (misurato con la CLI del lockfile; `check:spedito` lo rimisura a ogni giro).
 * Le note di repo stanno quindi qui, e il file generato comincia con la prima
 * `@font-face`.
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
import { brotliDecompressSync } from "node:zlib";

const DIR = "registry/tassullo/theme";
const USCITA = join(DIR, "inter.css");

/** Da aggiungere al nome se cambia il file senza che cambi la versione di Inter. */
const SUFFISSO = "";

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

/**
 * Ciò che deve leggere chi installa. Sta DENTRO la prima \`@font-face\` e non
 * in testa al file, perché \`shadcn add\` toglie i commenti di testa di un CSS
 * \`registry:theme\` (docs/DECISIONI.md §58).
 */
const istruzioni = (nome: string) => `  /* ══════════════════════════════════════════════════════════════════════
     INTER — il carattere delle interfacce Tassullo

     Installato insieme al tema:  npx shadcn@latest add @tassullo/tema

     Si collega da index.html, nel <head>, e non si importa dal CSS:

       <link rel="stylesheet" href="/${nome}" />

     Importato dal CSS dell'app, finirebbe fuso nel suo file, che cambia
     nome a ogni rilascio: 200 KB di carattere riscaricati per una classe
     cambiata. Da qui, col nome che cambia solo con il carattere, resta
     nella cache del browser. Se il collegamento manca, il testo esce nel
     carattere di sistema senza nessun errore.

     I file del carattere sono **dentro questo CSS**, in data URI: l'app non
     fa nessuna richiesta di rete per la tipografia, né a Google né altrove.
     È una scelta deliberata — servire i font da un terzo significa mandargli
     l'indirizzo IP di ogni visitatore. Il file non si modifica: si aggiorna
     reinstallando il tema con --overwrite.

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
`;

/**
 * La versione di un `.woff2`, dalla tabella `head`: `fontRevision` è un
 * numero a virgola fissa 16.16 (4.001 per Inter 4.1). In un WOFF2 le tabelle
 * stanno in un solo flusso Brotli, dopo un indice a lunghezza variabile.
 */
function versioneWoff2(percorso: string): string {
  const b = readFileSync(percorso);
  if (b.toString("latin1", 0, 4) !== "wOF2") throw new Error(`${percorso} non è un WOFF2`);
  const TAG_NOTI = ["cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post", "cvt ", "fpgm", "glyf", "loca", "prep", "CFF ", "VORG", "EBDT", "EBLC", "gasp", "hdmx", "kern", "LTSH", "PCLT", "VDMX", "vhea", "vmtx", "BASE", "GDEF", "GPOS", "GSUB", "EBSC", "JSTF", "MATH", "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar", "bdat", "bloc", "bsln", "cvar", "fdsc", "feat", "fmtx", "fvar", "gvar", "hsty", "just", "lcar", "mort", "morx", "opbd", "prop", "trak", "Zapf", "Silf", "Glat", "Gloc", "Feat", "Sill"];
  let o = 48;
  const base128 = () => {
    let v = 0;
    for (let i = 0; i < 5; i++) {
      const c = b[o++]!;
      v = v * 128 + (c & 0x7f);
      if (!(c & 0x80)) return v;
    }
    throw new Error(`${percorso}: indice WOFF2 illeggibile`);
  };
  const tabelle: { tag: string; lunghezza: number }[] = [];
  for (let i = 0, n = b.readUInt16BE(12); i < n; i++) {
    const flag = b[o++]!;
    let tag = TAG_NOTI[flag & 0x3f]!;
    if ((flag & 0x3f) === 63) {
      tag = b.toString("latin1", o, o + 4);
      o += 4;
    }
    const originale = base128();
    const trasformata = tag === "glyf" || tag === "loca" ? flag >> 6 === 0 : flag >> 6 !== 0;
    tabelle.push({ tag, lunghezza: trasformata ? base128() : originale });
  }
  const dati = brotliDecompressSync(b.subarray(o, o + b.readUInt32BE(20)));
  let p = 0;
  for (const t of tabelle) {
    if (t.tag === "head") {
      const rev = dati.readInt32BE(p + 4) / 65536;
      const maggiore = Math.floor(rev);
      return `${maggiore}.${Math.round((rev - maggiore) * 1000)}`;
    }
    p += t.lunghezza;
  }
  throw new Error(`${percorso}: manca la tabella head`);
}

/** Il nome del file nell'app: cambia solo quando cambia il carattere. */
function nomeNellApp(): string {
  const versioni = new Set(FACCE.map(({ file }) => versioneWoff2(join(DIR, file))));
  if (versioni.size !== 1) throw new Error(`le facce di Inter hanno versioni diverse: ${[...versioni].join(", ")}`);
  return `tassullo-inter-${[...versioni][0]}${SUFFISSO}.css`;
}

function costruisci(nome: string): string {
  const facce = FACCE.map(({ file, stile }, i) => {
    const b64 = readFileSync(join(DIR, file)).toString("base64");
    return `@font-face {
${i === 0 ? istruzioni(nome) : ""}  font-family: 'Inter';
  font-style: ${stile};
  font-weight: ${PESI};
  font-display: swap;
  unicode-range: ${RANGE_LATIN};
  src: url(data:font/woff2;base64,${b64}) format('woff2');
}`;
  }).join("\n\n");

  return `${facce}\n`;
}

/**
 * Che `registry.json` installi il file dove questo script dice: il CSS in
 * `public/` col nome giusto, la licenza accanto, e nessun campo `css` che
 * aggiunga l'`@import` al CSS globale dell'app.
 */
function controllaItem(nome: string): string[] {
  const registro = JSON.parse(readFileSync("registry.json", "utf8"));
  const item = registro.items.find((i: { name: string }) => i.name === "tema-font");
  if (!item) return ["registry.json non ha l'item `tema-font`."];
  const errori: string[] = [];
  const file = (percorso: string) => item.files?.find((f: { path: string }) => f.path === percorso);
  const css = file(USCITA);
  if (css?.target !== `~/public/${nome}`)
    errori.push(`\`tema-font\` installa ${USCITA} in \`${css?.target}\`: deve essere \`~/public/${nome}\`.`);
  if (css?.type !== "registry:file")
    errori.push(`\`tema-font\`: ${USCITA} dev'essere \`registry:file\`, come un file statico.`);
  const licenza = file(join(DIR, "tassullo-inter-OFL.txt"));
  if (licenza?.target !== "~/public/tassullo-inter-OFL.txt")
    errori.push("`tema-font`: la licenza va accanto al carattere, in `~/public/tassullo-inter-OFL.txt`.");
  if (item.css) errori.push("`tema-font` ha un campo `css`: il carattere non si importa dal CSS globale, si collega da index.html.");
  if (!String(item.docs ?? "").includes(`/${nome}`))
    errori.push(`le \`docs\` di \`tema-font\` non nominano \`/${nome}\`, il collegamento da scrivere in index.html.`);
  return errori;
}

function main(): void {
  const nome = nomeNellApp();
  const atteso = costruisci(nome);
  if (process.argv.includes("--write")) {
    writeFileSync(USCITA, atteso);
    const kb = Math.round(atteso.length / 1024);
    console.log(`\n✔ scritto ${USCITA} (${kb} KB, ${FACCE.length} facce); nell'app: public/${nome}\n`);
    const errori = controllaItem(nome);
    for (const e of errori) console.error(`✘ ${e}`);
    if (errori.length) process.exit(1);
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
  const errori = controllaItem(nome);
  if (errori.length) {
    console.error("");
    for (const e of errori) console.error(`✘ ${e}`);
    console.error("");
    process.exit(1);
  }
  console.log(`\n✔ ${USCITA} allineato ai .woff2 (${FACCE.length} facce); nell'app è public/${nome}.\n`);
}

main();
