#!/usr/bin/env bash
# Aggiorna la conoscenza locale di `main` a inizio sessione.
# Lanciabile da qualunque cartella del repository (principale o worktree di feature).
# Non tocca mai i file della tua working directory corrente: aggiorna solo `main`
# (checkout diretto se sei tu su main, aggiornamento del ref altrimenti).
#
# Copiato da Anagrafe (2026-09-10, alla chiusura di D4), con una sola differenza:
# i file di conduzione qui sono altri — non c'è ROADMAP.md né docs/INTERFACCE.md,
# e c'è PIANO.md, che è il documento unico, più docs/DECISIONI.md.

set -euo pipefail

CONDUCTION_FILES=(CLAUDE.md PIANO.md CHECKLIST.md WORKLOG.md docs/DECISIONI.md)

echo "==> git fetch origin"
git fetch origin

CURRENT_BRANCH="$(git branch --show-current || true)"

if [ "$CURRENT_BRANCH" = "main" ]; then
  echo "==> Sei su main: aggiorno con pull --ff-only"
  if ! git status --porcelain | grep -q .; then
    if git pull --ff-only origin main; then
      echo "==> main aggiornato."
    else
      echo "!!  main locale e origin/main sono divergenti: niente pull automatico."
      echo "    Controlla manualmente (git log --oneline main..origin/main / origin/main..main)."
      exit 1
    fi
  else
    echo "!!  Ci sono modifiche non committate: niente pull automatico. Fai commit o stash prima."
    exit 1
  fi
else
  echo "==> Sei su '$CURRENT_BRANCH' (non main): aggiorno solo il riferimento a main, senza toccare i tuoi file"
  OLD_MAIN="$(git rev-parse main 2>/dev/null || echo "")"

  if git fetch origin main:main 2>/tmp/sync_main_fetch_err; then
    NEW_MAIN="$(git rev-parse main)"
    if [ "$OLD_MAIN" = "$NEW_MAIN" ]; then
      echo "==> main era già aggiornato."
    else
      echo "==> main aggiornato: $OLD_MAIN -> $NEW_MAIN"
      echo ""
      echo "==> Novità nei file di conduzione (${CONDUCTION_FILES[*]}):"
      CHANGED=false
      for f in "${CONDUCTION_FILES[@]}"; do
        if [ -n "$OLD_MAIN" ] && ! git diff --quiet "$OLD_MAIN" "$NEW_MAIN" -- "$f" 2>/dev/null; then
          CHANGED=true
          echo ""
          echo "--- $f ---"
          git diff "$OLD_MAIN" "$NEW_MAIN" -- "$f"
        fi
      done
      if [ "$CHANGED" = false ]; then
        echo "    (nessuna modifica ai file di conduzione, solo altri commit)"
      fi
    fi
  else
    echo "!!  Impossibile aggiornare il ref di main automaticamente:"
    cat /tmp/sync_main_fetch_err
    echo "    Probabile causa: main è checkato in un altro worktree con modifiche non fast-forward,"
    echo "    oppure main locale e origin/main sono divergenti. Controlla manualmente."
    rm -f /tmp/sync_main_fetch_err
    exit 1
  fi
  rm -f /tmp/sync_main_fetch_err
fi

# Le proposte aperte dalle app: le issue col modulo «Proposta» portano
# l'etichetta `proposta`. Si elencano qui perché guardarle non sia un ricordo.
# Senza `gh` o senza rete si tace: l'aggiornamento di main conta di più.
if command -v gh >/dev/null 2>&1; then
  PROPOSTE="$(gh issue list --label proposta --state open --limit 20 2>/dev/null || true)"
  echo ""
  if [ -n "$PROPOSTE" ]; then
    echo "==> Proposte aperte dalle app (etichetta «proposta»):"
    echo "$PROPOSTE"
  else
    echo "==> Nessuna proposta aperta dalle app."
  fi
fi
