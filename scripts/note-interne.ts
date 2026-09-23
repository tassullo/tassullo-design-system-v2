/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Le note interne: cosa non entra nel testo che si legge da fuori
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Una sola copia delle regole per i due gate che le applicano a lettori
 * diversi: `check:storybook` al visitatore della style guide, `check:spedito`
 * a chi installa un item e apre il file nella sua app. Il canone — cosa ci va
 * e cosa no, e perché — sta in testa a `scripts/check-storybook.ts`.
 *
 * Una regola che si stringe qui si stringe per tutti e due: è il motivo per
 * cui è un modulo e non una copia.
 */

export type Regola = { tipo: string; re: RegExp };

const MESI = "gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre";

export const REGOLE: Regola[] = [
  // `m2.5` minuscolo non è una sigla, è un'unità: la M è maiuscola. Il suffisso
  // copre `M5.0e`, `M3bis.11b` e `M4ter.4bis`.
  { tipo: "sigla di task", re: /\bM\d+(?:bis|ter)?\.\d+(?:bis|ter|[a-z])?\b|\bFASE\s+\d/g },
  // Le decisioni vanno da D1 a D29, e il tetto è voluto: `D30` è un modello di
  // miscelatore nei dati d'esempio. Il giorno che arriva D30, si alza qui.
  { tipo: "sigla di decisione", re: /\bD(?:[1-9]|[12]\d)\b|§\s*\d+/g },
  {
    tipo: "documento interno",
    re: /\b(?:WORKLOG|PIANO|CHECKLIST|DECISIONI|ROADMAP|INTERFACCE|ANALISI-COPERTURA)\b|\bCLAUDE\.md\b|componenti-propri|registry\/\.upstream/g,
  },
  { tipo: "data", re: new RegExp(`\\b20\\d\\d-\\d\\d-\\d\\d\\b|\\b(?:${MESI})\\s+20\\d\\d\\b`, "gi") },
  { tipo: "persona", re: /\b(?:Francesco|Roberto)\b/g },
  // `CI` resta maiuscolo e a sé: «ci» è una parola italiana.
  {
    tipo: "strumento del repo",
    re: /\bnpm run\b|\bcheck:[a-z][\w-]*|\b(?:[Ii]l|[Aa]l|[Dd]el|[Dd]al|[Nn]el|[Ss]ul)\s+gate\b|\bCI\b/g,
  },
  { tipo: "design system precedente", re: /\bv1\b|\bstyleguide\.html\b/g },
  // Le regole numerate e la scala a gradini sono quelle del `CLAUDE.md` del
  // repo: fuori di qui «la regola 3» non rimanda a niente. Si scrive la
  // regola stessa («i colori escono dai token del tema»), non il suo numero.
  { tipo: "regola del repo", re: /\b[Rr]egola \d+(?:bis|ter)?\b|\bgradino \d\b/g },
];

/** Le note interne di un testo, nell'ordine delle regole. */
export function note(testo: string): { tipo: string; trovato: string }[] {
  const out: { tipo: string; trovato: string }[] = [];
  for (const r of REGOLE) for (const m of testo.matchAll(r.re)) out.push({ tipo: r.tipo, trovato: m[0] });
  return out;
}
