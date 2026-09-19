# Sorgenti originali — NON modificare

Copia intatta dei componenti come il registry di origine li distribuisce,
scaricata con `shadcn view`. Serve a un solo scopo: sapere, alla prossima
versione, cosa è cambiato a monte e cosa invece avevamo cambiato noi.

**La provenienza è per file, non per cartella**, e sta in `provenienze.json`:
da M4ter.1 i registry di origine sono due. Quale file venga da quale item lo
dice quel file; qui sotto c'è solo il riassunto.

| | |
|---|---|
| CLI shadcn | 4.21.0 |
| `style` | base-nova |
| aggiornato il | 2026-09-19 |

## Registry di origine

| registry | chi | licenza | avviso da conservare nel file | file |
|---|---|---|---|---:|
| `@reui` | ReUI — Keenthemes | MIT — Copyright (c) 2025 Keenthemes Inc | sì — «Copyright (c) 2025 Keenthemes Inc» | 1 |
| `@shadcn` | shadcn/ui | MIT — shadcn | no | 50 |

Un terzo registry si aggiunge con **una riga** in `REGISTRI_ORIGINE`
(`scripts/check-registry.ts`), più una riga per file in `provenienze.json`.

Si rigenera con `npm run check:registry -- --snapshot`.
