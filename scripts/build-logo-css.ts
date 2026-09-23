/**
 * build-logo-css.ts — emette `registry/tassullo/theme/tassullo-logo.css`, cioè
 * il marchio Tassullo come `mask-image` in data URI.
 *
 * Uso:
 *   npm run logo:build     rigenera il CSS dagli .svg in theme/marchio/
 *   npm run check:logo     verifica che il file non sia divergente
 *
 * ── Perché così, e non in uno dei due modi più ovvi (D13) ────────────────
 *
 * La domanda di D13 era: **come viaggia il marchio nel registry**. Tre strade,
 * e la scelta di Francesco (2026-09-10) è la terza.
 *
 * (a) Un componente `<MarchioT />`. Comodo, `currentColor` funziona da sé —
 *     ma è un componente **nostro senza originale shadcn**, cioè il gradino 4
 *     della scala 4bis: vorrebbe una riga in `registry/componenti-propri.json`,
 *     che oggi è vuoto ed è la condizione che il progetto dichiara «da
 *     difendere». Il marchio non è un motivo abbastanza forte per romperla:
 *     non ha comportamento, non ha stato, non ha varianti. È un disegno.
 *
 * (b) L'`.svg` come `registry:file` con `target` su `public/`. Zero componenti
 *     nostri — ma un `<img>` **non segue il colore del testo**: servirebbe un
 *     file per fondo chiaro e uno per fondo scuro, cioè due copie dello stesso
 *     tracciato da tenere allineate a mano. Un doppione è esattamente il tipo
 *     di deriva che il registry esiste per impedire.
 *
 * (c) Dentro il CSS del tema, come maschera. Il colore lo dà
 *     `background-color: currentColor`, quindi il marchio segue il testo che lo
 *     circonda — una copia sola, giusta in tutte e due le modalità e su
 *     qualunque fondo. Il precedente c'è già ed è `tema-font`, che porta Inter
 *     dentro un CSS per la stessa ragione: il registry sa portare **testo**.
 *
 * ── Perché percent-encoding e non base64 ─────────────────────────────────
 *
 * Perché un SVG è testo, e un data URI percent-encoded resta **leggibile**: si
 * apre il CSS e si vede il tracciato. In base64 non si vedrebbe niente, e
 * questo file è generato proprio perché ciò che non è ispezionabile a occhio
 * va messo sotto un controllo automatico. Costa anche meno: base64 gonfia di
 * un terzo, il percent-encoding di un SVG di poco più del 10%.
 *
 * ── Perché una maschera e non un `background-image` ──────────────────────
 *
 * Un `background-image` dipingerebbe il marchio col colore scritto nel file, e
 * si ricadrebbe nel problema della strada (b). Una maschera **ritaglia**: di
 * ciò che sta nel data URI conta solo il canale alfa, e il colore arriva da
 * `currentColor`. Per questo il tracciato in `theme/marchio/` non ha `fill`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "registry/tassullo/theme";
const USCITA = join(DIR, "tassullo-logo.css");

/**
 * I marchi che si distribuiscono, con le proporzioni del loro `viewBox`.
 *
 * `rapporto` non si deduce dal file a mano: lo si legge dal `viewBox`, o
 * un giorno il tracciato cambia e la classe resta a stirarlo. La T Tassullo è
 * **più alta che larga** (24×38, 0,63) — era la cosa che il segnaposto di M2.5
 * sbagliava di più.
 *
 * Il **marchio esteso** (la T accanto al logotipo) non è qui perché il file non
 * esiste: né Anagrafe né il v1 ne hanno uno. Nelle app il marchio esteso è
 * composto — la T più il nome dell'applicativo in Inter — ed è la forma che
 * `tassullo-app-shell` monta in testata. Se un giorno arriva un logotipo vero,
 * è una riga in più in questo elenco, non un meccanismo nuovo.
 */
const MARCHI = [{ classe: "marchio-t", file: "marchio/tassullo-t.svg" }] as const;

/**
 * Il data URI di un SVG. Si codifica **il minimo che serve** perché il valore
 * stia dentro `url("…")` di un CSS, e nient'altro: ogni carattere lasciato in
 * chiaro è un carattere che si legge.
 *
 * `#` è obbligatorio — in un URL apre il frammento, e un `#` non codificato
 * troncherebbe la maschera a metà, senza errore. `%` va per primo o
 * ri-codificherebbe le proprie uscite. Le virgolette doppie perché il valore
 * ci sta dentro; `<` e `>` per non far litigare i minificatori.
 */
function dataUri(svg: string): string {
  const codificato = svg
    .trim()
    .replace(/\s+/g, " ")
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/"/g, "%22");
  return `url("data:image/svg+xml,${codificato}")`;
}

/** Il rapporto larghezza/altezza, letto dal `viewBox` e non scritto a mano. */
function rapporto(svg: string): string {
  const m = svg.match(/viewBox="([\d.\s-]+)"/);
  if (!m) throw new Error("SVG senza viewBox: la maschera non saprebbe scalare");
  const [, , w, h] = m[1].trim().split(/\s+/).map(Number);
  if (!w || !h) throw new Error(`viewBox illeggibile: ${m[1]}`);
  return `${w} / ${h}`;
}

function costruisci(): string {
  const comuni = MARCHI.map((m) => `.${m.classe}`).join(",\n  ");
  const blocchi = MARCHI.map(({ classe, file }) => {
    const svg = readFileSync(join(DIR, file), "utf8");
    return `  .${classe} {
    aspect-ratio: ${rapporto(svg)};
    mask-image: ${dataUri(svg)};
  }`;
  }).join("\n\n");

  return `/* ── NOTA DI REPO — questo commento NON arriva alle app ───────────────
   \`shadcn add\` toglie TUTTI i commenti di testa di un CSS \`registry:theme\`
   (docs/DECISIONI.md §58; \`npm run check:spedito\` lo rimisura a ogni
   giro). Qui stanno le note di repo; ciò che deve leggere chi installa sta
   DENTRO la prima regola, dove arriva.

   GENERATO da scripts/build-logo-css.ts dagli .svg in theme/marchio/.
   Non modificare a mano: \`npm run check:logo\` fallisce se diverge.

     npm run logo:build     rigenera questo file
     npm run check:logo     verifica che sia allineato agli .svg

   Il tracciato è in data URI per la stessa ragione del carattere: il
   registry sa portare TESTO, e un file accanto al CSS sarebbe una seconda
   copia da tenere allineata. Il ragionamento completo — e le due strade
   scartate — stanno in testa allo script. Decisione D13, 2026-09-10.
   ────────────────────────────────────────────────────────────────────── */

@layer components {
  /* ══════════════════════════════════════════════════════════════════════
     IL MARCHIO TASSULLO

     Installato insieme al tema:  npx shadcn@latest add @tassullo/tema

     Il marchio è una CLASSE, non un componente e non un file da mettere in
     \`public/\`. Si usa su un elemento vuoto:

       <span className="marchio-t size-6" aria-hidden />

     ── Il colore segue il testo, ed è il motivo per cui è fatto così ──────
     Il tracciato fa da MASCHERA e il colore lo dà \`currentColor\`: il marchio
     prende il colore del testo che lo circonda, quindi la stessa classe è
     giusta sulla sidebar antracite, su una pagina chiara e su una scura.
     Per cambiarne il colore si usa un'utility di testo — \`text-primary\`,
     \`text-sidebar-accent-foreground\` — non una di sfondo.

     ── La misura ─────────────────────────────────────────────────────────
     La T è PIÙ ALTA CHE LARGA (24×38). Con \`h-*\` la larghezza la calcola
     l'\`aspect-ratio\`; con \`size-*\` il marchio si allinea all'altezza e resta
     stretto dentro il quadrato, senza deformarsi. In mancanza d'altro è
     alto quanto una riga di testo (\`1em\`).

     ── È decorativo ──────────────────────────────────────────────────────
     Un elemento senza testo: va sempre accompagnato da \`aria-hidden\`, e il
     nome accessibile lo mette chi lo contiene (in \`tassullo-app-shell\` è
     l'\`aria-label\` del bottone di testata).
     ══════════════════════════════════════════════════════════════════════ */

  /* Ciò che tutti i marchi hanno in comune. Il \`mask-image\` — cioè il
     tracciato — e le proporzioni sono l'unica cosa che cambia da un marchio
     all'altro. */
  ${comuni} {
    display: inline-block;
    height: 1em;
    background-color: currentColor;
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: contain;
  }

${blocchi}
}
`;
}

function main(): void {
  const atteso = costruisci();
  if (process.argv.includes("--write")) {
    writeFileSync(USCITA, atteso);
    console.log(`\n✔ scritto ${USCITA} (${MARCHI.length} marchio/i, ${atteso.length} byte)\n`);
    return;
  }

  let corrente = "";
  try {
    corrente = readFileSync(USCITA, "utf8");
  } catch {
    console.error(`\n✘ ${USCITA} non esiste. Esegui: npm run logo:build\n`);
    process.exit(1);
  }
  if (corrente !== atteso) {
    console.error(
      `\n✘ ${USCITA} diverge dagli .svg in ${DIR}/marchio/.\n` +
        `  È un file generato: rigeneralo con \`npm run logo:build\`.\n`,
    );
    process.exit(1);
  }
  console.log(`\n✔ ${USCITA} allineato agli .svg (${MARCHI.length} marchio/i).\n`);
}

main();
