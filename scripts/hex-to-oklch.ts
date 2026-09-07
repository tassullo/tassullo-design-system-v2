/**
 * hex-to-oklch.ts — convertitore della palette Tassullo e gate di contrasto.
 *
 * Erede di `stylelint-config.cjs` del v1, stessa filosofia: senza un controllo
 * automatico la regola si perde in poche settimane.
 *
 * Fa due cose, e le fa da un'unica fonte (la costante PALETTE qui sotto):
 *   1. converte gli hex del v1 in `oklch`, emettendo i blocchi CSS pronti per
 *      `registry/tassullo/theme/tassullo-theme.css` (M1.2 light, M1.3 dark);
 *   2. calcola il rapporto di contrasto WCAG 2.1 di ogni coppia `X`/`X-foreground`
 *      ed **esce con codice 1** se una coppia non esente scende sotto 4.5:1.
 *
 * La conversione va fatta da qui, non a mano: quando la palette cambia deve
 * essere riproducibile. La mappa ragionata v1 → shadcn è in `PIANO.md` §2bis.
 *
 * Uso:
 *   npm run check:contrast              tabella dei contrasti + esito
 *   npm run check:contrast -- --css     emette i blocchi CSS in oklch
 *   npm run check:contrast -- --self-test   prova che il gate sa fallire
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { oklch, wcagContrast, formatHex, converter } from "culori";

const MIN_RATIO = 4.5;
const THEME_FILE = "registry/tassullo/theme/tassullo-theme.css";

// ───────────────────────────────────────────────────────────────────────────
// La palette. Chiave = nome del token shadcn (senza `--`), valore = hex v1.
// L'ordine è quello in cui i token usciranno nel CSS.
// ───────────────────────────────────────────────────────────────────────────

type Palette = Record<string, string>;

/** FASE 1 / M1.2 — modalità chiara. */
const light: Palette = {
  // ── Superfici e testo ────────────────────────────────────────────────────
  background: "#F6F6F4", // v1 --color-page-bg
  foreground: "#141414", // v1 --color-text
  card: "#FDFDFD", // v1 --color-surface
  "card-foreground": "#141414",
  popover: "#FDFDFD",
  "popover-foreground": "#141414",

  // ── Brand ────────────────────────────────────────────────────────────────
  primary: "#F4AC3D", // v1 --color-accent (NON --accent di shadcn)
  "primary-foreground": "#141414", // v1 --color-accent-text: nero, non bianco
  "primary-hover": "#E8990C", // v1 --color-accent-hover (custom: shadcn non ce l'ha)
  "primary-subtle": "#FCF0DB", // v1 --color-accent-light
  "primary-border": "#F5D9A8", // v1 --color-accent-border
  "accent-ink": "#B25105", // v1 --color-accent-ink #B45309, ΔL 0.006 per 4.5:1 su --primary-subtle

  // ── Neutri ───────────────────────────────────────────────────────────────
  secondary: "#ECEAE8", // v1 --color-surface-2
  "secondary-foreground": "#141414",
  muted: "#ECEAE8",
  "muted-foreground": "#6C6965", // v1 --color-text-muted #6E6B67, ΔL 0.006 per 4.5:1 su --muted
  accent: "#F4F3F1", // v1 --color-surface-3 — hover dei menu, NON il brand
  "accent-foreground": "#141414",
  border: "#DDDBDB", // v1 --color-border
  "border-strong": "#C4C4C4", // v1 --color-border-strong (custom)
  input: "#DDDBDB",
  ring: "#F4AC3D", // v1 --focus-ring, ridotto a colore (vedi §2bis)

  // ── Stati semantici, livello pieno ───────────────────────────────────────
  destructive: "#DC2626", // v1 --color-danger
  "destructive-foreground": "#FFFFFF", // v1 --color-on-dark
  success: "#1CAC7C", // v1 --color-success
  "success-foreground": "#141414", // divergenza dal v1: vedi §2bis
  warning: "#FBE8C4", // v1 --color-badge-warn-bg
  "warning-foreground": "#886300", // v1 --color-badge-warn-text #8A6500, ΔL 0.006 per 4.5:1
  info: "#1A5276", // v1 --color-info-text, qui usato come fondo pieno
  "info-foreground": "#FFFFFF",

  // ── Stati semantici, livello tenue (alert, banner) ───────────────────────
  "destructive-subtle": "#FEF2F2", // v1 --color-danger-bg
  "destructive-subtle-foreground": "#991B1B", // v1 --color-danger-text
  "destructive-border": "#FCA5A5", // v1 --color-danger-border
  "success-subtle": "#EAF7F2", // v1 --color-success-bg
  "success-subtle-foreground": "#0E7A57", // v1 --color-success-text
  "success-border": "#9FDFC8", // v1 --color-success-border
  "warning-subtle": "#FFF9EC", // v1 --color-warn-bg
  "warning-subtle-foreground": "#92400E", // v1 --color-warn-text
  "warning-border": "#F5D9A8", // v1 --color-warn-border
  "info-subtle": "#D6ECFB", // v1 --color-info-bg
  "info-subtle-foreground": "#1A5276", // v1 --color-info-text
  "info-border": "", // DERIVATO — riempito da deriveInfoBorder()

  // ── Sidebar ──────────────────────────────────────────────────────────────
  sidebar: "#141414", // v1 --color-sidebar-bg
  "sidebar-foreground": "#A8A8A8", // v1 --color-sidebar-text
  "sidebar-primary": "#F4AC3D",
  "sidebar-primary-foreground": "#141414",
  "sidebar-accent": "#262626", // v1 --color-sidebar-hover
  "sidebar-accent-foreground": "#EDEDEB", // v1 --color-sidebar-text-hi
  "sidebar-border": "#262626",
  "sidebar-ring": "#F4AC3D",

  // ── Velo delle modali ────────────────────────────────────────────────────
  overlay: "#14141473", // v1 --color-overlay: rgba(20, 20, 20, 0.45)

  // ── Serie dei grafici — PROVVISORI ───────────────────────────────────────
  // Ereditati dal preset `nova`, scala di grigi. Il v1 non ha una palette
  // categorica: la definisce M2.8, che deve renderne 5 distinguibili anche in
  // scala di grigi. Restano qui perché senza di loro le primitive che li
  // referenziano non renderebbero; non sono token Tassullo.
  "chart-1": "#C9C9C9",
  "chart-2": "#8F8F8F",
  "chart-3": "#6D6D6D",
  "chart-4": "#575757",
  "chart-5": "#3C3C3C",
};

/**
 * FASE 1 / M1.3 — modalità scura. Chiude D2.
 *
 * Il v1 non ha una palette scura: questa è progettata, non tradotta. Le tre
 * regole con cui è stata costruita, perché resti modificabile senza inventare:
 *
 *  1. **I neutri si invertono, partendo da ciò che il v1 ha già collaudato**:
 *     la sidebar antracite del v1 è l'unica superficie scura in produzione da
 *     due anni, e i suoi valori (#141414 fondo, #262626 hover, #EDEDEB testo
 *     alto, #A8A8A8 testo a riposo) diventano qui i neutri di pagina.
 *  2. **Il brand non cambia**: `--primary` resta l'arancio con testo nero, in
 *     entrambe le modalità. Cambia solo la direzione dell'hover — sul chiaro il
 *     v1 scurisce (ΔL −0.051), sul fondo scuro schiarire è la stessa mossa.
 *  3. **I tenui si specchiano a gradini fissi**, uguali per tutte le famiglie:
 *     alla tinta del pieno chiaro, `subtle` sta a `l 0.28 c 0.05`, il bordo a
 *     `l 0.42 c 0.10`, il testo a `l 0.85 c 0.08`. Un solo gradino per tutte
 *     significa che i quattro alert pesano uguale, che è il requisito di M2.4.
 *
 * I pieni semantici restano quelli del chiaro — un colore per stato in tutte le
 * app, che è il punto degli stati semantici — con **una sola eccezione
 * misurata**: `--info` (#1A5276) dà **2.20:1** sul fondo scuro, cioè un badge
 * invisibile. Ricalcolato alla propria tinta sulla banda media dei pieni chiari
 * (`l 0.725 c 0.134`, la stessa costruzione di `deriveInfoBorder`): #4BAFF2,
 * 7.64:1 sul fondo, testo nero come tutti i fondi saturi chiari.
 *
 * `--warning` invece resta il crema del v1 (#FBE8C4), pur essendo a l 0.937 la
 * cosa più luminosa della pagina scura, contro l 0.58–0.79 di tutti gli altri
 * pieni. È stata provata la correzione ovvia — riportarlo nella banda alla sua
 * tinta, come `--info` — e **scartata misurandola**: a l 0.725 il giallo
 * diventa #CE9E2F, che è a ΔL 0.07 e Δh 9.6 da `--primary` #F4AC3D. Un badge di
 * avviso indistinguibile dal brand è un difetto peggiore di un badge troppo
 * luminoso, e nella modalità chiara la stessa collisione non si vede solo
 * perché lì il crema è chiaro. La lightness alta è ciò che tiene `--warning`
 * separato dall'arancio: si tiene, sapendo perché.
 *
 * `--sidebar` è l'altro punto dove la misura non decide: alzato a #1C1C1C
 * invece di restare il #141414 del v1, perché in modalità scura la pagina è
 * già antracite e una sidebar dello stesso valore non si stacca più.
 */
const dark: Palette = {
  // ── Superfici e testo — i neutri della sidebar v1, promossi a pagina ──────
  background: "#141414", // v1 --color-sidebar-bg
  foreground: "#EDEDEB", // v1 --color-sidebar-text-hi
  card: "#1C1C1C", // superficie sollevata: un gradino sopra la pagina
  "card-foreground": "#EDEDEB",
  popover: "#1C1C1C",
  "popover-foreground": "#EDEDEB",

  // ── Brand — invariato, tranne la direzione dell'hover ────────────────────
  primary: "#F4AC3D",
  "primary-foreground": "#141414",
  "primary-hover": "#FFBE5A", // schiarito dello stesso ΔL con cui il v1 scurisce
  "primary-subtle": "#372508", // l 0.28 alla tinta del brand
  "primary-border": "#6D4300", // l 0.42
  "accent-ink": "#F4AC3D", // sul fondo scuro l'arancio leggibile È il brand (9.49:1)

  // ── Neutri ───────────────────────────────────────────────────────────────
  secondary: "#262626", // v1 --color-sidebar-hover
  "secondary-foreground": "#EDEDEB",
  muted: "#262626",
  "muted-foreground": "#A8A8A8", // v1 --color-sidebar-text
  accent: "#2E2E2E", // hover dei menu, NON il brand
  "accent-foreground": "#EDEDEB",
  border: "#2E2E2E",
  "border-strong": "#454545",
  input: "#2E2E2E",
  ring: "#F4AC3D",

  // ── Stati semantici, livello pieno — identici al chiaro tranne `info` ────
  destructive: "#DC2626", // 3.81:1 sul fondo: sopra la soglia 3:1 dei componenti
  "destructive-foreground": "#FFFFFF",
  success: "#1CAC7C",
  "success-foreground": "#141414",
  warning: "#FBE8C4",
  "warning-foreground": "#886300",
  info: "#4BAFF2", // UNICA eccezione: #1A5276 dà 2.20:1 sul fondo scuro
  "info-foreground": "#141414", // fondo saturo chiaro ⇒ testo nero, come primary e success

  // ── Stati semantici, livello tenue — specchiati a gradini fissi ──────────
  "destructive-subtle": "#3E1F1B",
  "destructive-subtle-foreground": "#FEBAB1",
  "destructive-border": "#7A342E",
  "success-subtle": "#0B3022",
  "success-subtle-foreground": "#9DDFC0",
  "success-border": "#005D3E",
  "warning-subtle": "#352607",
  "warning-subtle-foreground": "#E7CA91",
  "warning-border": "#674700",
  "info-subtle": "#0F2C3F",
  "info-subtle-foreground": "#9FD5FE",
  "info-border": "", // DERIVATO — riempito da deriveInfoBorder(), come nel chiaro

  // ── Sidebar ──────────────────────────────────────────────────────────────
  // Non resta #141414: in modalità scura la pagina è già antracite e una
  // sidebar dello stesso valore sparisce. Sale al livello della card.
  sidebar: "#1C1C1C",
  "sidebar-foreground": "#A8A8A8",
  "sidebar-primary": "#F4AC3D",
  "sidebar-primary-foreground": "#141414",
  "sidebar-accent": "#2E2E2E",
  "sidebar-accent-foreground": "#EDEDEB",
  "sidebar-border": "#2E2E2E",
  "sidebar-ring": "#F4AC3D",

  // ── Velo delle modali ────────────────────────────────────────────────────
  // Stesso nero Tassullo, opacità alzata da 0.45 a 0.70: sul fondo scuro un
  // velo al 45% dello stesso colore della pagina non separa più niente.
  overlay: "#141414B3",

  // ── Serie dei grafici — PROVVISORI, come nel chiaro ──────────────────────
  // Rampa ribaltata: quella chiara scende fino a #3C3C3C, che sul fondo scuro
  // non si vedrebbe. Cinque gradini, il più scuro ancora a 3.4:1. M2.8 li
  // sostituisce con la palette categorica vera.
  "chart-1": "#EDEDEB",
  "chart-2": "#C9C9C9",
  "chart-3": "#A8A8A8",
  "chart-4": "#8F8F8F",
  "chart-5": "#6D6D6D",
};

const THEMES: Array<{ name: string; selector: string; palette: Palette }> = [
  { name: "light", selector: ":root", palette: light },
  { name: "dark", selector: ".dark", palette: dark },
];

// ───────────────────────────────────────────────────────────────────────────
// Il solo valore non presente nel v1, derivato invece che inventato.
//
// Nel v1 le famiglie semantiche hanno tutte un bordo tenue tranne `info`.
// Convertiti in oklch, i tre bordi esistenti stanno in una banda stretta —
// success l.854 c.073, warning l.897 c.071, danger l.808 c.103 — ciascuno alla
// tinta della propria famiglia. `--info-border` è quindi la media di quella
// banda alla tinta di `--info-subtle`: ricavato dalla palette v1, riproducibile,
// e ricalcolato a ogni esecuzione se la palette cambia.
// ───────────────────────────────────────────────────────────────────────────

function deriveInfoBorder(p: Palette): string {
  const known = ["success-border", "warning-border", "destructive-border"].map((k) => oklch(p[k])!);
  const l = known.reduce((s, c) => s + c.l, 0) / known.length;
  const c = known.reduce((s, x) => s + x.c, 0) / known.length;
  const h = oklch(p["info-subtle"])!.h ?? 0;
  return formatHex({ mode: "oklch", l, c, h })!;
}

// ───────────────────────────────────────────────────────────────────────────
// Le coppie da verificare: [fondo, testo, a cosa serve].
// ───────────────────────────────────────────────────────────────────────────

type Pair = [bg: string, fg: string, uso: string];

const PAIRS: Pair[] = [
  ["background", "foreground", "testo di pagina"],
  ["card", "card-foreground", "testo su card"],
  ["popover", "popover-foreground", "testo su popover"],
  ["primary", "primary-foreground", "bottone primario"],
  ["primary-subtle", "accent-ink", "chip attivo"],
  ["secondary", "secondary-foreground", "bottone secondario"],
  ["muted", "muted-foreground", "testo attenuato su fondo tenue"],
  ["background", "muted-foreground", "testo attenuato su pagina"],
  ["card", "muted-foreground", "testo attenuato su card"],
  ["accent", "accent-foreground", "voce di menu in hover"],
  ["background", "accent-ink", "link su pagina"],
  ["card", "accent-ink", "link su card"],
  ["destructive", "destructive-foreground", "bottone distruttivo"],
  ["success", "success-foreground", "indicatore di successo"],
  ["warning", "warning-foreground", "badge di avviso"],
  ["info", "info-foreground", "badge informativo"],
  ["destructive-subtle", "destructive-subtle-foreground", "alert errore"],
  ["success-subtle", "success-subtle-foreground", "alert successo"],
  ["warning-subtle", "warning-subtle-foreground", "alert avviso"],
  ["info-subtle", "info-subtle-foreground", "alert informativo"],
  ["sidebar", "sidebar-foreground", "voce di sidebar a riposo"],
  ["sidebar", "sidebar-accent-foreground", "voce di sidebar attiva"],
  ["sidebar-accent", "sidebar-accent-foreground", "voce di sidebar in hover"],
  ["sidebar-primary", "sidebar-primary-foreground", "badge nella sidebar"],
];

/**
 * Esenzioni: coppie che NON fanno fallire il gate, con la ragione scritta.
 * Un'esenzione senza ragione è un contrasto rotto travestito da decisione.
 */
const EXEMPT: Record<string, string> = {
  // Vuoto, e va tenuto vuoto. Un'esenzione senza ragione scritta è un
  // contrasto rotto travestito da decisione. Il terzo livello di testo del v1
  // (--color-text-hint) non è stato esentato: è stato eliminato, perché a
  // 4.5:1 collassa su --muted-foreground (PIANO.md §2bis, rilievo 2).
};
// ───────────────────────────────────────────────────────────────────────────

const toOklch = converter("oklch");

function css(value: string): string {
  const c = toOklch(value)!;
  const r = (n: number, d: number) => Number(n.toFixed(d));
  const alpha = c.alpha === undefined || c.alpha === 1 ? "" : ` / ${r(c.alpha, 3)}`;
  return `oklch(${r(c.l, 4)} ${r(c.c, 4)} ${r(c.h ?? 0, 2)}${alpha})`;
}

/**
 * LA DENSITÀ, in una costante sola — M1.4.
 *
 * Due leve, e sono due perché misurano due cose diverse.
 *
 * `--spacing` scala i BERSAGLI. In Tailwind v4 ogni utility numerica di
 * dimensione è `calc(var(--spacing) * n)` — `h-*`, `w-*`, `size-*`, `p-*`,
 * `m-*`, `gap-*`, `space-*` — quindi una dichiarazione scala insieme altezze,
 * padding, gap e icone senza patchare nessuna primitiva. È il motivo per cui
 * la densità nel v2 costa due righe dove il v1 doveva scrivere nove regole
 * per-componente a mano.
 *
 * `--text-*` scala la LEGGIBILITÀ, e molto meno: ×1.08 arrotondato al pixel.
 * Non è un fattore scelto a occhio, è quello che riproduce il passo del v1,
 * che in touch alzava il testo del bottone di UN gradino della scala
 * (13px → 14px). Applicato all'intera scala dà 11→12, 12→13, 13→14, 14→15 —
 * cioè esattamente «il gradino successivo» dove i gradini distano 1px — e
 * prosegue con la stessa proporzione sui titoli (15→16, 18→19, 26→28), che è
 * ciò che tiene la gerarchia senza collisioni. Un bersaglio deve crescere del
 * 50% per stare sotto un dito guantato; un testo a 13px è già leggibile, e
 * portarlo a 20px non lo rende più leggibile: rompe le colonne.
 *
 * Le due densità stanno nella STESSA costante perché il CSS ne emette due
 * blocchi — `[data-density="touch"]` e `[data-density="normale"]` — e due
 * elenchi scritti a mano divergerebbero al primo ritocco. Il blocco
 * `normale` non è un doppione dei valori di `@theme`: serve a rimettere la
 * densità normale DENTRO una pagina touch, che è la sola forma in cui le due
 * si guardano affiancate (pagina `Tema/Densità` della style guide). È lo
 * stesso motivo per cui il chiaro si emette anche su `.light` (M1.3).
 */
const SPACING = { normale: "0.25rem", touch: "0.375rem" } as const;

const TIPOGRAFIA = [
  ["xs", "11px", "12px", "micro-etichette, sottotitoli sidebar"],
  ["sm", "12px", "13px", "meta, badge, voci sidebar"],
  ["md", "13px", "14px", "chip, breadcrumb, testi densi"],
  ["base", "14px", "15px", "corpo standard, input"],
  ["lg", "15px", "16px", "titoli card"],
  ["xl", "18px", "19px", "titoli sezione"],
  ["title", "26px", "28px", "titolo pagina"],
] as const;

/** I sette gradini per il blocco `@theme` (densità normale, con le note). */
function emitScala(): string {
  return TIPOGRAFIA.map(
    ([nome, normale, , nota]) => `  --text-${nome}: ${normale}; /* ${nota} */`
  ).join("\n");
}

/** Un blocco `[data-density="…"]`: la leva dei bersagli e quella del testo. */
function emitDensita(modo: "normale" | "touch"): string {
  const i = modo === "touch" ? 2 : 1;
  const testo = TIPOGRAFIA.map(([nome, ...v]) => `  --text-${nome}: ${v[i - 1]};`).join("\n");
  return `[data-density="${modo}"] {\n  --spacing: ${SPACING[modo]};\n\n${testo}\n}`;
}

function emitTokens(palette: Palette, selector: string): string {
  const width = Math.max(...Object.keys(palette).map((k) => k.length)) + 4;
  const body = Object.entries(palette)
    .map(([k, v]) => `  ${`--${k}:`.padEnd(width)} ${css(v)}; /* ${v.toUpperCase()} */`)
    .join("\n");
  return `${selector} {\n${body}\n}`;
}

/** Ombre del v1, con il nero Tassullo convertito invece che riscritto a mano. */
function shadow(...layers: Array<[offset: string, alpha: number]>): string {
  return layers.map(([o, a]) => `${o} ${css(`#141414${Math.round(a * 255).toString(16).padStart(2, "0")}`)}`).join(", ");
}

/**
 * Il file del tema per intero: non solo i colori, ma anche raggi, font, scala
 * tipografica e ombre. È generato tutto da qui perché una metà generata e una
 * metà scritta a mano divergono alla prima modifica — ed è il motivo per cui la
 * palette sta nello script e non nel CSS.
 */
function buildTheme(): string {
  const colorMap = Object.keys(light)
    .map((k) => `  --color-${k}: var(--${k});`)
    .join("\n");

  return `/* ══════════════════════════════════════════════════════════════════════
   TASSULLO DESIGN SYSTEM 2.0 — tassullo-theme.css

   GENERATO da scripts/hex-to-oklch.ts. Non modificare a mano: la fonte
   unica della palette è quello script, e \`npm run check:contrast\` fallisce
   se questo file diverge da ciò che lo script produce.

     npm run theme:build       rigenera questo file
     npm run check:contrast    verifica contrasti e allineamento

   Identità visiva ereditata da @tassullo/theme v1.2.2, tradotta nella
   convenzione shadcn. La mappa ragionata token per token, con i rilievi e
   le divergenze deliberate dal v1, è in PIANO.md §2bis.

   Due trappole, se stai per usare un token:
   · --primary è l'ARANCIO DEL BRAND; --accent è il grigio di hover dei menu.
     Nel v1 --color-accent era il brand: confonderli tinge di arancione metà
     degli hover dell'interfaccia.
   · --primary NON è mai usabile per il testo. L'arancio leggibile su fondo
     chiaro è --accent-ink.
   ══════════════════════════════════════════════════════════════════════ */

${emitTokens(light, ":root,\n.light")}

:root {
  /* Raggio base. In shadcn --radius È il gradino \`lg\`, non \`md\`: vale quindi
     i 10px delle card del v1, e sm/md scendono ai 4px e 6px del v1 qui sotto.
     (PIANO.md §2bis rilievo 3 mappava --radius su --radius-md del v1: rettificato.) */
  --radius: 0.625rem;
}

/* Il blocco chiaro vale anche su \`.light\`, non solo su \`:root\`: serve a
   rimettere la modalità chiara **dentro** una pagina scura, che è la sola
   forma in cui le due palette si possono guardare affiancate (pagina Palette
   della style guide). Senza, in una pagina con \`.dark\` sulla radice non
   esisterebbe modo di tornare chiari su un sottoalbero. */

/* Modalità scura — M1.3, D2 chiusa. Il v1 non ha una palette scura: questa è
   progettata, e le tre regole con cui è costruita stanno nello script accanto
   alla palette. Il selettore è \`.dark\` sull'elemento radice, che è ciò che
   \`@custom-variant dark\` di src/index.css e l'interruttore di Storybook
   commutano. Qui si ridichiarano SOLO i token: raggi, font, scala tipografica
   e ombre non cambiano fra le due modalità. */

${emitTokens(dark, ".dark")}

@theme inline {
  /* ── Colori ──────────────────────────────────────────────────────────
     Generati da tutti i token della palette: aggiungerne uno allo script
     lo espone automaticamente come utility (bg-*, text-*, border-*). */
${colorMap}

  /* ── Raggi ───────────────────────────────────────────────────────────
     sm e md sono i valori del v1, NON la derivazione shadcn: con i fattori
     0.6/0.8 i bottoni verrebbero a 4.8px invece dei 6px del v1, e le
     primitive usano rounded-md. Da xl in su la derivazione shadcn resta. */
  --radius-sm: 0.25rem; /* 4px — badge, tag (v1 --radius-sm) */
  --radius-md: 0.375rem; /* 6px — bottoni, input (v1 --radius-md) */
  --radius-lg: var(--radius); /* 10px — card, pannelli, modali (v1 --radius-lg) */
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);

  /* ── Tipografia ──────────────────────────────────────────────────────
     Replicall è il font istituzionale (licenza Webflow del sito): lo stack
     lo usa se l'app lo carica via @font-face, altrimenti degrada al font di
     sistema. Il .woff NON si distribuisce con il registry (D3). */
  --font-sans: 'Replicall', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --font-heading: var(--font-sans);

  /* La scala tipografica NON sta in questo blocco: sta nel \`@theme\` semplice
     qui sotto, e la ragione è la densità (vedi il commento là). */

  /* ── Ombre ───────────────────────────────────────────────────────────── */
  --shadow-sm: ${shadow(["0 1px 2px", 0.04])};
  --shadow-md: ${shadow(["0 2px 8px", 0.06])};
  --shadow-lg: ${shadow(["0 8px 24px", 0.12])};
  --shadow-modal: ${shadow(["0 20px 60px", 0.25])};

  /* ── Larghezza massima del contenuto di pagina (v1 --page-max-width).
     Esposta come container per poter scrivere max-w-page e non un
     valore arbitrario. */
  --container-page: 1180px;
}

/* ── Tipografia: perché sta in un \`@theme\` SEMPLICE e non in \`@theme inline\`
   \`inline\` significa "risolvi il valore in fase di compilazione": in quel
   blocco Tailwind emette \`.text-sm { font-size: 12px }\`, il valore cotto
   dentro l'utility. Ridichiarare \`--text-sm\` a runtime — che è esattamente
   ciò che fa la densità qui sotto — non cambierebbe nulla, e il difetto è
   muto: nessun errore, il testo semplicemente non scatta. Senza \`inline\`
   l'utility esce come \`font-size: var(--text-sm)\` e l'override funziona.
   I colori restano \`inline\` perché lì l'indirezione serve al contrario
   (--color-primary: var(--primary)) e la densità non li tocca. */
@theme {
  /* La scala del v1, sette gradini. Sono i soli che i blocchi devono usare:
     i gradini Tailwind che restano oltre questi (text-2xl in su) non sono
     tarati su Tassullo. */
${emitScala()}
}

/* Non portati dal v1, di proposito:
   · --space-1…6 e --space-page: in Tailwind v4 le spaziature derivano da
     --spacing, che è anche il meccanismo della densità (M1.4). Il padding di
     pagina del v1 (32px 40px) si scrive py-8 px-10.
   · --transition-fast (0.15s): è già il default di Tailwind.
   · --color-text-hint: eliminato. A 4.5:1 collassa su --muted-foreground, che
     è il token da usare per placeholder e meta (PIANO.md §2bis rilievo 2). */

/* ══════════════════════════════════════════════════════════════════════
   DENSITÀ TOUCH — M1.4

   Opt-in dell'app, con una riga sola nell'HTML:

     <html data-density="touch">

   È la stessa interfaccia del v1, di proposito: Officina non deve cambiare
   niente per passare al v2. La scelta è l'attributo esplicito e NON
   \`@media (pointer: coarse)\`, perché è l'app a sapere se si usa in campo —
   un tablet in ufficio non deve prendere la densità da guanti.

   Non è un blocco fuori posto in un file di token: la densità È un token,
   e sta qui perché qui la ricevono le app che installano il tema.

   ── Due leve, e sono due perché misurano due cose diverse ─────────────

   1. \`--spacing\` scala i BERSAGLI. In Tailwind v4 ogni utility numerica di
      dimensione è \`calc(var(--spacing) * n)\` — \`h-*\`, \`w-*\`, \`size-*\`,
      \`p-*\`, \`m-*\`, \`gap-*\`, \`space-*\`. Una riga scala insieme altezze,
      padding, gap e icone, senza patchare nessuna primitiva: è la ragione
      per cui la densità nel v2 costa due dichiarazioni invece delle nove
      regole per-componente che il v1 doveva scrivere a mano.

      \`0.375rem\` = 6px, cioè ×1.5 sul default di 4px. Il bottone di default
      di questo preset è \`h-8\` (32px, NON \`h-9\` come stimava il piano) e
      arriva così a **48px**: la stessa altezza che il v1 dà a \`.btn\` in
      touch, collaudata in cantiere, e il minimo di Material. Il fattore
      1.375 basterebbe per i 44px di Apple, ma lascia mezzi pixel su ogni
      gradino dispari (\`h-7\` → 38,5px); a 6px tondi ogni gradino della scala
      cade su un intero.

   2. \`--text-*\` scala la LEGGIBILITÀ, e molto meno: **×1.08**, arrotondato
      al pixel. Non è un fattore scelto a occhio: è quello che riproduce il
      passo del v1, che in touch alzava il testo del bottone di UN gradino
      della scala (13px → 14px). Applicato all'intera scala dà 11→12, 12→13,
      13→14, 14→15 — cioè esattamente "il gradino successivo" dove i gradini
      distano 1px — e prosegue con la stessa proporzione sui titoli (15→16,
      18→19, 26→28), che è ciò che tiene la gerarchia senza collisioni.

      Perché non ×1.5 come i bersagli: un bersaglio deve crescere del 50%
      per stare sotto un dito guantato; un testo a 13px è già leggibile, e
      portarlo a 19–20px non lo rende più leggibile, rompe le colonne.

   ── Cosa NON scala, ed è voluto ───────────────────────────────────────

   Restano assoluti e quindi identici nelle due densità: i raggi
   (\`--radius-*\`, in rem), la larghezza massima di pagina
   (\`--container-page\`), le larghezze dei bordi, la scala \`--container-*\`
   di Tailwind da cui vengono \`max-w-md\` e simili. Un bottone in touch è
   più grande ma ha lo stesso raggio di 6px, e una pagina non diventa più
   larga: cresce il respiro dentro, non il contenitore.

   ── Perché esiste anche un blocco \`normale\` ──────────────────────────

   Non è un doppione dei valori di \`@theme\`: senza, la densità saprebbe solo
   crescere. Con \`[data-density="normale"]\` si può rimettere la densità
   normale DENTRO un sottoalbero touch, che è la sola forma in cui le due si
   guardano affiancate — pagina \`Tema/Densità\` della style guide. È lo stesso
   motivo per cui il chiaro si emette anche su \`.light\` (M1.3). I due blocchi
   escono dalla stessa costante nello script: due elenchi scritti a mano
   divergerebbero al primo ritocco.

   L'attributo vale su qualunque elemento, non solo su \`<html>\`: i due token
   si ereditano. Verificato che \`<body data-density="touch">\` — la forma
   letterale del v1 — funziona identico.

   Le eccezioni accertate a mano sono annotate in WORKLOG.md, M1.4.
   ══════════════════════════════════════════════════════════════════════ */
${emitDensita("touch")}

${emitDensita("normale")}
`;
}

/**
 * Le due palette devono dichiarare **gli stessi token, nello stesso ordine**.
 * Il blocco `@theme inline` espone le utility a partire dalle sole chiavi del
 * chiaro: un token presente solo lì resterebbe al valore chiaro in modalità
 * scura — cioè un colore sbagliato, non un colore mancante, che è peggio
 * perché non si nota. L'ordine conta per leggere il diff delle due palette
 * affiancate: se divergono, il confronto va fatto a mano.
 */
function checkParity(): number {
  const a = Object.keys(light);
  const b = Object.keys(dark);
  const soloChiaro = a.filter((k) => !(k in dark));
  const soloScuro = b.filter((k) => !(k in light));
  if (soloChiaro.length === 0 && soloScuro.length === 0) {
    if (a.join() === b.join()) return 0;
    console.error(`\n✖ le due palette hanno gli stessi token ma in ordine diverso.`);
    return 1;
  }
  if (soloChiaro.length) console.error(`\n✖ token presenti solo nel chiaro: ${soloChiaro.join(", ")}`);
  if (soloScuro.length) console.error(`✖ token presenti solo nello scuro: ${soloScuro.join(", ")}`);
  return 1;
}

function check(palette: Palette, theme: string): number {
  let failures = 0;
  const rows: string[] = [];

  for (const [bg, fg, uso] of PAIRS) {
    if (!palette[bg] || !palette[fg]) {
      console.error(`  ✖ ${bg}/${fg} — token assente nella palette "${theme}"`);
      failures++;
      continue;
    }
    const ratio = wcagContrast(palette[bg], palette[fg]);
    const key = `${bg}/${fg}`;
    const exempt = EXEMPT[key];
    const ok = ratio >= MIN_RATIO;
    const mark = ok ? "✔" : exempt ? "•" : "✖";
    if (!ok && !exempt) failures++;
    rows.push(
      `  ${mark} ${ratio.toFixed(2).padStart(5)}:1  ${key.padEnd(58)} ${uso}${
        !ok && exempt ? "  [esente]" : ""
      }`,
    );
  }

  console.log(`\n${theme} — ${PAIRS.length} coppie, soglia ${MIN_RATIO}:1\n`);
  console.log(rows.join("\n"));
  return failures;
}

function main(): void {
  const args = process.argv.slice(2);
  light["info-border"] = deriveInfoBorder(light);
  dark["info-border"] = deriveInfoBorder(dark);

  if (args.includes("--self-test")) {
    // Prova del gate stesso (criterio di accettazione di M1.1): forzando
    // --primary-foreground a bianco il controllo DEVE fallire.
    const forced: Palette = { ...light, "primary-foreground": "#FFFFFF" };
    const ratio = wcagContrast(forced.primary, forced["primary-foreground"]);
    const rilevato = ratio < MIN_RATIO;
    console.log(
      `\nself-test: --primary-foreground forzato a #FFFFFF su --primary ${light.primary}\n` +
        `  contrasto ${ratio.toFixed(2)}:1 (soglia ${MIN_RATIO}:1) → ${rilevato ? "RILEVATO" : "NON rilevato"}`,
    );
    const failures = check(forced, "light (self-test, palette alterata)");
    if (!rilevato || failures === 0) {
      console.error("\n✖ self-test FALLITO: il gate non ha rilevato la violazione.\n");
      process.exit(1);
    }
    console.log(`\n✔ self-test superato: ${failures} violazione/i rilevata/e come atteso.\n`);
    return;
  }

  if (args.includes("--css")) {
    console.log(buildTheme());
    return;
  }

  if (args.includes("--write")) {
    mkdirSync(dirname(THEME_FILE), { recursive: true });
    writeFileSync(THEME_FILE, buildTheme());
    console.log(`✔ scritto ${THEME_FILE}`);
    return;
  }

  let failures = checkParity();
  for (const { name, palette } of THEMES) {
    if (Object.keys(palette).length === 0) {
      console.log(`\n${name} — palette non ancora compilata, controllo saltato.`);
      continue;
    }
    failures += check(palette, name);
  }

  // Il file del tema è generato: se qualcuno lo modifica a mano, la modifica
  // sparirebbe al prossimo theme:build senza che nessuno se ne accorga.
  if (existsSync(THEME_FILE)) {
    if (readFileSync(THEME_FILE, "utf8") === buildTheme()) {
      console.log(`\n${THEME_FILE} allineato allo script.`);
    } else {
      console.error(
        `\n✖ ${THEME_FILE} NON corrisponde all'output dello script.\n` +
          `  È un file generato: le modifiche a mano vanno riportate nella palette\n` +
          `  di scripts/hex-to-oklch.ts, poi \`npm run theme:build\`.`,
      );
      failures++;
    }
  }

  const esenti = Object.keys(EXEMPT).length;
  console.log(
    `\n${failures === 0 ? "✔" : "✖"} ${failures} violazione/i sopra soglia` +
      (esenti ? `, ${esenti} coppia/e esente/i con motivazione.` : "."),
  );
  console.log(`  --info-border derivato: ${light["info-border"]} (chiaro), ${dark["info-border"]} (scuro)\n`);
  if (failures > 0) process.exit(1);
}

main();
