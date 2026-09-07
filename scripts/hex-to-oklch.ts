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

import { oklch, wcagContrast, formatHex, converter } from "culori";

const MIN_RATIO = 4.5;

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
  "accent-ink": "#B45309", // v1 --color-accent-ink: l'arancio LEGGIBILE come testo

  // ── Neutri ───────────────────────────────────────────────────────────────
  secondary: "#ECEAE8", // v1 --color-surface-2
  "secondary-foreground": "#141414",
  muted: "#ECEAE8",
  "muted-foreground": "#6E6B67", // v1 --color-text-muted
  accent: "#F4F3F1", // v1 --color-surface-3 — hover dei menu, NON il brand
  "accent-foreground": "#141414",
  "foreground-hint": "#A8A5A1", // v1 --color-text-hint (custom)
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
  "warning-foreground": "#8A6500", // v1 --color-badge-warn-text
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
};

/** FASE 1 / M1.3 — modalità scura. Si compila lì, non qui (D2 aperta). */
const dark: Palette = {};

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
  ["background", "foreground-hint", "placeholder su pagina"],
  ["card", "foreground-hint", "placeholder su input"],
];

/**
 * Esenzioni: coppie che NON fanno fallire il gate, con la ragione scritta.
 * Un'esenzione senza ragione è un contrasto rotto travestito da decisione.
 */
const EXEMPT: Record<string, string> = {
  "background/foreground-hint":
    "placeholder: ereditato dal v1, sotto soglia. Decisione in M1.2 — alzare il colore o riservarlo alle sole meta-info non testuali.",
  "card/foreground-hint": "come sopra.",
};

// ───────────────────────────────────────────────────────────────────────────

const toOklch = converter("oklch");

function css(value: string): string {
  const c = toOklch(value)!;
  const r = (n: number, d: number) => Number(n.toFixed(d));
  return `oklch(${r(c.l, 4)} ${r(c.c, 4)} ${r(c.h ?? 0, 2)})`;
}

function emitCss(palette: Palette, selector: string): string {
  const width = Math.max(...Object.keys(palette).map((k) => k.length)) + 4;
  const body = Object.entries(palette)
    .map(([k, v]) => `  ${`--${k}:`.padEnd(width)} ${css(v)}; /* ${v.toUpperCase()} */`)
    .join("\n");
  return `${selector} {\n${body}\n}`;
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
    for (const { name, selector, palette } of THEMES) {
      if (Object.keys(palette).length === 0) {
        console.log(`/* ${selector} — palette "${name}" non ancora compilata (M1.3). */\n`);
        continue;
      }
      console.log(`/* Palette Tassullo — ${name}. Generato da scripts/hex-to-oklch.ts. */`);
      console.log(emitCss(palette, selector) + "\n");
    }
    return;
  }

  let failures = 0;
  for (const { name, palette } of THEMES) {
    if (Object.keys(palette).length === 0) {
      console.log(`\n${name} — palette non ancora compilata, controllo saltato.`);
      continue;
    }
    failures += check(palette, name);
  }

  const esenti = Object.keys(EXEMPT).length;
  console.log(
    `\n${failures === 0 ? "✔" : "✖"} ${failures} violazione/i sopra soglia` +
      (esenti ? `, ${esenti} coppia/e esente/i con motivazione.` : "."),
  );
  console.log(`  --info-border derivato: ${light["info-border"]}\n`);
  if (failures > 0) process.exit(1);
}

main();
