/**
 * misura-bersagli.ts — quanto sono grandi i bersagli, in densità touch.
 *
 * Il residuo manuale del gate di M2.9: axe **non misura i bersagli**. Una
 * voce di menu alta 31px passa ogni regola di axe e resta un bersaglio che
 * in cantiere, col guanto, si manca. Il criterio del piano è **≥44px** —
 * WCAG 2.5.5 «Target Size (Enhanced)», più severo del 24px di 2.5.8 che il
 * set passa già tutto.
 *
 * ── Perché in un browser vero e sullo Storybook costruito ───────────────
 *
 * Perché l'altezza di un bersaglio è una misura di **resa**: dipende dal
 * font caricato, dalla densità applicata alla radice, dal padding risolto.
 * jsdom non ne sa nulla e restituirebbe zero ovunque — cioè un verde per
 * il motivo sbagliato, che è il modo tipico in cui questi controlli mentono.
 *
 * Si misura sullo Storybook **costruito** e non sul dev server perché è
 * l'artefatto che va in CI: se una story si costruisce diversamente da come
 * gira in sviluppo, è quella costruita a contare.
 *
 * Uso:
 *   npm run misura:bersagli          (vuole `npm run build-storybook` prima)
 */

import { createServer } from "node:http";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, normalize } from "node:path";

import { chromium } from "playwright";

const STATICO = "storybook-static";
const SOGLIA = 44;

/**
 * Le due pagine che **fissano la densità da sé**, con `data-density` sul
 * proprio sottoalbero: mostrano le due densità affiancate, quindi metà del
 * loro contenuto è normale per costruzione. Misurarle in touch non dice
 * niente sul set, dice solo che quella pagina fa il suo mestiere.
 */
const FISSANO_LA_DENSITA = ["Tema/Densità", "Tema/Tipografia"];

/**
 * **I popup vanno aperti anche qui**, e non è una ripetizione oziosa del
 * gate axe: una voce di menu esiste solo a menu aperto, quindi a menu chiuso
 * il bersaglio più piccolo del set semplicemente **non viene misurato**.
 * Scritto una prima volta, questo script dava un elenco pulito di venti
 * tipi e nessuna voce di menu dentro — cioè lo stesso verde per il motivo
 * sbagliato che la FASE 2 ha già pagato due volte.
 *
 * La dichiarazione di *come* si apre non si riscrive: si **legge dalle
 * story**, dove sta già per il gate axe (`play: apriCol('…', '…')`). Due
 * copie della stessa verità divergono alla prima modifica, e la seconda
 * copia sarebbe questa.
 */
type Apertura = { gesto: string; grilletto: string; contenuto: string };

/**
 * **Le stesse due cartelle del gate axe, e non una sola.** Fino a M4ter.2
 * questa funzione leggeva il solo `ui/`, mentre `scripts/gate-a11y.ts`
 * leggeva anche `blocks/`: i popup dei blocchi — il «+N altri» del
 * calendario, i menu di `data-table`, `app-shell`, `page-header` — non
 * risultavano dichiarati, quindi lo script **non li aspettava**. Storybook
 * esegue comunque le `play` nel canvas, perciò a volte erano aperti lo
 * stesso e a volte no: i loro bersagli finivano nel rapporto a seconda di
 * quanto ci metteva la pagina, che è il modo peggiore in cui un conto può
 * sbagliare — non zero, ma **un numero diverso a ogni esecuzione**.
 *
 * Le due liste vanno tenute uguali. Se un giorno divergono di nuovo, il
 * sintomo è questo: un tipo di bersaglio che compare e sparisce fra due
 * esecuzioni identiche.
 */
const STORIE_DIR = ["registry/tassullo/ui", "registry/tassullo/blocks"];

function aperture(): Map<string, Apertura> {
  const out = new Map<string, Apertura>();
  for (const dir of STORIE_DIR) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".stories.tsx")) continue;
      const testo = readFileSync(join(dir, f), "utf8");
      const titolo = testo.match(/title: '([^']+)'/);
      const play = testo.match(/play: (apri[A-Za-zÀ-ú]*)\(\s*'([^']+)',\s*'([^']+)'/);
      if (titolo && play) out.set(titolo[1], { gesto: play[1], grilletto: play[2], contenuto: play[3] });
    }
  }
  return out;
}

/** Gli elementi che si toccano. Un `div` non è un bersaglio, un `role` lo è. */
const BERSAGLI = [
  "button",
  "a[href]",
  "input:not([type=hidden])",
  "select",
  "textarea",
  "summary",
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
].join(",");

const TIPI: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

/** Un server statico minimo: Storybook va servito via HTTP, non da `file://`. */
function servi(porta: number) {
  const server = createServer((req, res) => {
    const percorso = decodeURIComponent((req.url ?? "/").split("?")[0]);
    let file = join(STATICO, normalize(percorso).replace(/^(\.\.[/\\])+/, ""));
    if (!existsSync(file) || file.endsWith("/")) file = join(file, "index.html");
    if (!existsSync(file)) {
      res.writeHead(404).end("no");
      return;
    }
    res.writeHead(200, { "content-type": TIPI[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  return new Promise<ReturnType<typeof createServer>>((ok) =>
    server.listen(porta, () => ok(server)),
  );
}

type Misura = { story: string; etichetta: string; alto: number; largo: number };

async function main() {
  if (!existsSync(join(STATICO, "index.json"))) {
    console.error(`✖ Manca ${STATICO}/index.json — esegui prima \`npm run build-storybook\`.`);
    process.exit(1);
  }

  const porta = 6199;
  const server = await servi(porta);
  const browser = await chromium.launch();
  const pagina = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const indice = JSON.parse(readFileSync(join(STATICO, "index.json"), "utf8"));
  const storie = Object.values(indice.entries as Record<string, { id: string; title: string; type: string }>)
    .filter((e) => e.type === "story");

  const daAprire = aperture();
  const sotto: Misura[] = [];
  let contate = 0;
  let aperti = 0;
  /** Chi ha dichiarato un popup e chi è riuscito davvero ad aprirlo. */
  const apertiPer = new Map<string, number>();
  const dichiaratiPer = new Map<string, number>();

  for (const s of storie) {
    if (FISSANO_LA_DENSITA.includes(s.title)) continue;
    // `globals` nell'URL è il modo in cui Storybook riceve le leve senza
    // interfaccia: qui si fissa la densità touch, che è la condizione in cui
    // il criterio dei 44px si applica.
    await pagina.goto(
      `http://localhost:${porta}/iframe.html?id=${s.id}&globals=density:touch&viewMode=story`,
      { waitUntil: "load" },
    );
    // A pagina **ferma**, non appena caricata. Due attese, e servono
    // entrambe: che la radice della story abbia davvero un figlio — Storybook
    // deve prima avviarsi, e un `load` arriva molto prima — e poi un respiro
    // per le `transition-*`, perché una misura presa a metà transizione
    // riporta numeri che non esistono in nessun fotogramma stabile.
    await pagina
      .waitForFunction(() => (document.querySelector("#storybook-root")?.childElementCount ?? 0) > 0, null, { timeout: 10_000 })
      .catch(() => {})
    // **I font, prima di misurare.** L'altezza di un controllo dipende dalla
    // riga di testo che contiene, e Inter arriva in data URI dentro il CSS
    // del tema: finché non è decodificato si misura il carattere di ripiego.
    // Senza questa attesa lo stesso bottone dava 47.88px in una esecuzione e
    // 47.48px in quella dopo — cioè misure che cambiano da sole, che è il
    // modo più rapido di rendere un rapporto inutile.
    await pagina.evaluate(() => document.fonts.ready).catch(() => {})
    await pagina.waitForTimeout(120)

    // ── Il popup: **non si apre, si aspetta** ────────────────────────────
    //
    // Storybook esegue le `play` anche nel canvas, non solo sotto test:
    // quindi le story che dichiarano un popup arrivano qui **già aperte**,
    // dalla stessa dichiarazione che serve al gate axe. Le prime stesure di
    // questo script cliccavano comunque il grilletto, e così facendo lo
    // **richiudevano** — misurato: `aria-expanded` valeva `true` *prima* del
    // clic e `false` dopo. Il rapporto perdeva le voci di menu proprio dei
    // componenti che aveva appena «aperto», mentre sui modali il clic
    // finiva sull'overlay e per caso non faceva danno. Da cui la forma
    // giusta: non toccare niente e limitarsi ad aspettare il pannello.
    const ap = daAprire.get(s.title);
    if (ap) {
      dichiaratiPer.set(s.title, (dichiaratiPer.get(s.title) ?? 0) + 1);
      // **L'eccezione: i popup che si aprono passandoci sopra.** `tooltip` e
      // `hover-card` restano chiusi, perché la `play` muove un puntatore
      // *sintetico* e Base UI, non trovando un mouse davvero fermo lì
      // sopra, li richiude. Sono gli unici due che vanno aperti a mano, con
      // un puntatore vero. Gli altri nove no: toccarli li richiuderebbe.
      if (ap.gesto === "apriPassandoci") {
        await pagina.locator(ap.grilletto).first().hover({ timeout: 2_000 }).catch(() => {});
      }
      // Fino a due secondi: `hover-card` ha un ritardo d'apertura di circa
      // un secondo, e a 150ms risultava chiusa quando era solo lenta.
      //
      // **Due secondi bastano, ed è stato verificato invece che supposto.**
      // Quando `Blocchi/Editor di testo` dava «0/4 story aperte» il sospetto
      // era il timeout, e alzarlo a cinque — e poi a nove — non cambiava
      // niente: la causa era un'altra, la `play` che cercava il grilletto
      // prima che Tiptap avesse montato la barra (corretto in
      // `.storybook/prove/apri.ts`). Alzare un'attesa è il rimedio che si
      // prova per primo e che quasi sempre nasconde la causa invece di
      // toglierla.
      const apertoDavvero = await pagina
        .waitForSelector(`[data-slot="${ap.contenuto}"]`, { timeout: 2_000, state: "attached" })
        .then(() => true)
        .catch(() => false);
      if (apertoDavvero) {
        aperti++;
        apertiPer.set(s.title, (apertiPer.get(s.title) ?? 0) + 1);
      }
    }

    const misure = await pagina.evaluate((sel) => {
      const out: { etichetta: string; alto: number; largo: number }[] = [];
      // Si misura **tutto il documento**, non `#storybook-root`: Base UI
      // monta i popup in un portale, cioè fuori dalla radice della story.
      // Restringere alla radice fa sparire dal rapporto proprio le voci di
      // menu, che sono i bersagli più piccoli del set. Qui non c'è cornice
      // di Storybook da escludere: `iframe.html` contiene solo la story.
      for (const el of Array.from(document.body.querySelectorAll(sel))) {
        const r = el.getBoundingClientRect();
        if (r.height === 0 || r.width === 0) continue;
        const stile = getComputedStyle(el as HTMLElement);
        if (stile.visibility === "hidden" || stile.display === "none") continue;
        // ── I campi nativi che Base UI tiene dietro ai controlli ──────────
        //
        // Checkbox, radio, switch e slider sono disegnati da noi, ma sotto
        // ciascuno Base UI monta un `input` nativo vero, perché è quello che
        // rende il controllo utilizzabile da tastiera e dai lettori di
        // schermo. **Non sono bersagli**: il bersaglio è il controllo
        // disegnato che gli sta sopra.
        //
        // Il primo filtro (trasparenti, o alti un pixel) ne prendeva 67 ma
        // **non tutti**, e quello che restava ha prodotto un falso allarme
        // finito a verbale: un `input[type=range]` di 22×22 segnalato come
        // bersaglio sotto la soglia minima, mentre il pomello vero dello
        // slider misura 24×24. Il segno che li distingue tutti è che **non
        // hanno classi**: ogni campo che vestiamo noi porta le proprie, questi
        // li genera la libreria e sono nudi.
        if (Number(stile.opacity) === 0 || r.height <= 2) continue;
        if (el.tagName === "INPUT" && el.className === "") continue;
        // Un collegamento dentro una frase è esente dal criterio di
        // dimensione (WCAG 2.5.5, eccezione «inline»): sta nel testo, e
        // ingrandirlo vorrebbe dire deformare la riga.
        if (el.tagName === "A" && stile.display.includes("inline")) continue;
        const nome = (el.getAttribute("data-slot") ?? el.tagName.toLowerCase()) as string;
        out.push({ etichetta: nome, alto: Math.round(r.height * 100) / 100, largo: Math.round(r.width * 100) / 100 });
      }
      return out;
    }, BERSAGLI);

    for (const m of misure) {
      contate++;
      if (m.alto < SOGLIA) sotto.push({ story: s.title + " → " + (s as { name?: string }).name, ...m });
    }
  }

  // ── Controllo dello strumento ────────────────────────────────────────
  //
  // Prima di credere a un solo numero: il bottone di default in densità
  // touch deve fare **48px**, che è l'altezza che il v1 dà a `.btn` ed è la
  // ragione per cui `--spacing` vale 0.375rem (M1.4). Se qui non fa 48, la
  // densità non è stata applicata e tutte le misure di sopra sono la
  // densità normale con un'altra etichetta — cioè un rapporto che sembra
  // pieno di difetti e non ne descrive nemmeno uno.
  await pagina.goto(
    `http://localhost:${porta}/iframe.html?id=primitive-button--predefinito&globals=density:touch&viewMode=story`,
    { waitUntil: "load" },
  );
  await pagina.waitForSelector("#storybook-root button", { timeout: 10_000 });
  await pagina.evaluate(() => document.fonts.ready).catch(() => {});
  await pagina.waitForTimeout(120);
  const bottone = await pagina.evaluate(
    () => document.querySelector("#storybook-root button")?.getBoundingClientRect().height ?? 0,
  );

  await browser.close();
  server.close();

  // Tolleranza di un pixel, e non è indulgenza: l'altezza del bottone non è
  // un numero tondo per costruzione — esce da `line-height` più padding,
  // entrambi derivati da `rem`, e il motore di resa la chiude a 47.9. Il
  // controllo serve a distinguere «densità touch» da «densità normale», che
  // sono 48 contro 36: un pixel di banda non confonde quei due.
  if (Math.abs(bottone - 48) > 1) {
    console.error(
      `\n✖ Controllo dello strumento fallito: il bottone di default in touch misura ` +
        `${bottone}px invece di 48. La densità non è stata applicata; le misure non valgono.\n`,
    );
    process.exit(1);
  }
  console.log(`\n  Controllo dello strumento: bottone di default in touch = ${bottone}px (atteso 48) ✔`);

  // Si raggruppa per tipo di bersaglio, non per story: lo stesso `data-slot`
  // sotto soglia in dieci story è **un** difetto, non dieci.
  const perSlot = new Map<string, { min: number; largo: number; quante: number; esempio: string }>();
  for (const m of sotto) {
    const p = perSlot.get(m.etichetta);
    if (!p) perSlot.set(m.etichetta, { min: m.alto, largo: m.largo, quante: 1, esempio: m.story });
    else {
      p.quante++;
      if (m.alto < p.min) {
        p.min = m.alto;
        p.largo = m.largo;
        p.esempio = m.story;
      }
    }
  }

  // **Quali popup si sono aperti davvero**, per componente. Senza questa
  // riga il rapporto non è verificabile: un menu che non si apre non ha voci
  // da misurare, e la sua assenza dall'elenco dei difetti si legge come
  // «a posto» invece che come «mai guardato». È successo scrivendo questo
  // script — `dropdown-menu` è sparito dal rapporto fra due esecuzioni, e
  // solo un conteggio esplicito lo ha reso visibile.
  console.log("\n  Popup dichiarati e aperti, per componente\n");
  for (const [titolo, quanti] of [...dichiaratiPer].sort()) {
    const ok = apertiPer.get(titolo) ?? 0;
    const segno = ok === quanti ? "✔" : ok === 0 ? "✖" : "•";
    console.log(`    ${segno} ${titolo.padEnd(24)} ${ok}/${quanti} story aperte`);
  }

  console.log(`\n  Bersagli sotto ${SOGLIA}px in densità touch\n`);
  if (perSlot.size === 0) console.log("    nessuno");
  for (const [slot, p] of [...perSlot].sort((a, b) => a[1].min - b[1].min)) {
    // Si stampa anche la **larghezza**, perché il criterio è un'area e non
    // un'altezza: un bersaglio basso ma largo — una voce di menu, un campo
    // di testo — non si manca come si manca un quadratino.
    //
    // Da cui due segni diversi, e la distinzione è quella che conta:
    //   `!!` piccolo in **entrambe** le direzioni → difficile da centrare
    //   `!`  basso ma largo → formalmente sotto i 24×24 di WCAG 2.5.8, ma
    //        in pratica coperto dall'eccezione di spaziatura
    // Confonderli è costato un falso allarme a verbale.
    const sottoAA = p.min < 24 && p.largo < 24 ? " !!" : p.min < 24 ? " ! " : "   ";
    console.log(
      `   ${sottoAA}${String(p.min).padStart(6)}px alto ×${String(Math.round(p.largo)).padStart(5)}px largo  ` +
        `${slot.padEnd(26)} ${String(p.quante).padStart(4)} occorrenze   es. ${p.esempio}`,
    );
  }
  const piccoliDavvero = [...perSlot.values()].filter((p) => p.min < 24 && p.largo < 24).length;
  console.log(
    `\n  ${contate} bersagli misurati su ${storie.length} story (${aperti} popup aperti); ` +
      `${sotto.length} sotto i ${SOGLIA}px, ${perSlot.size} tipi distinti, ` +
      `di cui **${piccoliDavvero}** piccoli in entrambe le direzioni.\n`,
  );
}

main()
