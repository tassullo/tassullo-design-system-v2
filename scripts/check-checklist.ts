/**
 * ─────────────────────────────────────────────────────────────────────────────
 * check:checklist — `CHECKLIST.md` resta una sintesi
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * **Perché esiste.** La regola «la riga in `CHECKLIST.md` è una sintesi di due
 * o tre righe, il resto va nel diario» è scritta in testa alla checklist e in
 * `CLAUDE.md` §Conduzione, ma nessun controllo la verificava, e una regola che
 * nessuno controlla smette di valere: la checklist era arrivata due volte a
 * righe da migliaia di caratteri. Una riga che non si legge a colpo d'occhio
 * smette di essere una fonte di verità.
 *
 * **Cosa misura.** Ogni riga del file — riga di tabella o paragrafo — ha al
 * massimo `TETTO` caratteri. Il tetto è in caratteri e non in byte, perché
 * l'italiano porta accenti e le frecce contano come un segno solo. Si contano
 * anche i segni del markdown (`**`, i backtick, le barre della tabella): il
 * tetto è sul testo del file, quello che si legge in un editor.
 *
 * **Cosa non misura.** Non giudica se una riga dice le cose giuste: verdetto,
 * numeri che contano e rimando al `WORKLOG.md` restano una scelta di chi
 * scrive. Il gate impedisce solo che la sintesi torni a essere un diario.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const FILE = join(process.cwd(), "CHECKLIST.md");
const TETTO = 500;

type Sforo = { riga: number; caratteri: number; inizio: string };

function controlla(testo: string): Sforo[] {
  return testo.split("\n").flatMap((riga, i) => {
    const caratteri = [...riga].length;
    if (caratteri <= TETTO) return [];
    return [{ riga: i + 1, caratteri, inizio: [...riga].slice(0, 70).join("") }];
  });
}

function autotest(): number {
  const prove: { nome: string; testo: string; atteso: number }[] = [
    { nome: "riga di tabella sotto il tetto", testo: `| M1.1 | DONE | | ${"a".repeat(400)} |`, atteso: 0 },
    { nome: "riga di tabella sopra il tetto", testo: `| M1.1 | DONE | | ${"a".repeat(600)} |`, atteso: 1 },
    { nome: "paragrafo sopra il tetto", testo: `Intro\n\n${"b".repeat(TETTO + 1)}\n`, atteso: 1 },
    // 500 lettere accentate sono 1000 byte: il tetto è in caratteri, quindi passa.
    { nome: "accenti contati come un carattere", testo: "è".repeat(TETTO), atteso: 0 },
  ];

  console.log("\n  Autotest — il gate sa fallire nei modi che dichiara\n");
  let falliti = 0;
  for (const p of prove) {
    const trovati = controlla(p.testo).length;
    const ok = trovati === p.atteso;
    if (!ok) falliti++;
    console.log(`  ${ok ? "✔" : "✖"} ${p.nome} (attesi ${p.atteso}, trovati ${trovati})`);
  }
  console.log(
    falliti === 0
      ? "\n✔ L'autotest passa: il gate prende le righe lunghe e tace su quelle giuste.\n"
      : `\n✖ L'autotest fallisce su ${falliti} prova/e: il gate non fa quello che dice.\n`
  );
  return falliti === 0 ? 0 : 1;
}

function main(): number {
  if (process.argv.includes("--self-test")) return autotest();

  const testo = readFileSync(FILE, "utf8");
  const sfori = controlla(testo);
  const righe = testo.split("\n").length;

  for (const s of sfori) {
    console.log(`  ✖ riga ${s.riga}: ${s.caratteri} caratteri — ${s.inizio}…`);
  }

  if (sfori.length > 0) {
    console.log(
      `\n✖ ${sfori.length} riga/e di CHECKLIST.md oltre i ${TETTO} caratteri. ` +
        `La checklist porta verdetto, numeri che contano e un rimando: ` +
        `il resto va in WORKLOG.md.\n`
    );
    return 1;
  }

  console.log(`\n✔ CHECKLIST.md: ${righe} righe, tutte entro i ${TETTO} caratteri.\n`);
  return 0;
}

process.exit(main());
