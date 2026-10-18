# La procedura per ogni app: prima implementazione, proposte, riadozione

> È il procedimento seguito con Anagrafe fra settembre e ottobre 2026, reso standard per
> tutte le app (deciso da Francesco il 2026-10-18, `docs/DECISIONI.md` §84). I passi tecnici
> stanno in `docs/GUIDA-MIGRAZIONE.md` (app già sul v1) e in `docs/INTEGRAZIONE.md` (app
> nuova); qui c'è l'ordine del lavoro e chi fa cosa, dal primo giorno alle versioni
> successive.

## In breve

Tre momenti, sempre gli stessi per ogni app:

1. **Prima implementazione**: l'app passa al v2 tutta insieme, su un ramo solo. Niente v1 e
   v2 affiancati in produzione.
2. **Proposte**: ciò che manca al design system si chiede con una issue, mai si scrive
   nell'app. Nel frattempo l'app usa il componente più vicino così com'è.
3. **Riadozione**: il design system risponde con una versione nuova e un commento sulla
   issue che dice cosa reinstallare e cosa togliere; l'app la adotta e riferisce.

Il secondo e il terzo si ripetono finché l'app vive. Cominciano già durante la prima
implementazione: con Anagrafe le proposte sono arrivate a ondate mentre si riscrivevano le
pagine, e il design system è passato dalla `v2.0.1` alla `v2.0.19` in tre settimane.

## 1. Prima implementazione

**Un'app già sul v1** segue `docs/GUIDA-MIGRAZIONE.md`; **un'app nuova** segue
`docs/INTEGRAZIONE.md`. Per un'app sul v1 il passaggio si fa **in un colpo solo**: tutta
l'app su un ramo, il v1 tolto nello stesso lavoro, in produzione l'app finita. Le ragioni
sono misurate in §64: appena entra Tailwind le pagine v1 cambiano aspetto, e finché il v1 è
caricato anche le pagine v2 escono sbagliate. La convivenza dei due temi non si fa.

Le sessioni, nell'ordine in cui si sono fatte su Anagrafe:

| sessione | cosa | dove |
|---|---|---|
| **Passo 0** | `components.json` e `.mcp.json`, la riga sul v2 nel `CLAUDE.md` dell'app; se le regole dell'app vogliono rami brevi, l'eccezione per il ramo della migrazione, con la ragione. Una PR piccola, unita subito | guida, «Passo 0» |
| **Inventario** | le pagine una per una con la pagina d'esempio o il blocco che le sostituisce; i `grep`; ciò che a `grep` sfugge (azioni distruttive senza conferma, errori dietro le finestre, tab a mano) | guida, «Prima del ramo» |
| **Fondamenta e guscio** | apre il ramo: Tailwind, `init`, tema, carattere, `tassullo-app-shell`, `<Toaster />` | guida, passi 1–4 |
| **Pagine**, una sessione per gruppo | ogni pagina ricomposta partendo dalla pagina d'esempio più vicina, un commit per pagina, l'elenco degli item installati tenuto aggiornato | guida, passi 5–6 |
| **Chiusura** | via il v1, verifica, `tassullo-controllo` e lint nella CI dell'app, documenti dell'app | guida, passi 7–9; integrazione, passi 11–12 |

Tre regole valgono per tutta la durata del ramo:

- **Il ramo si riallinea spesso** al ramo principale dell'app. Se sull'app lavora anche
  qualcun altro, ci si accorda prima: le pagine in migrazione non si toccano altrove.
- **L'aspetto si giudica dopo aver tolto il v1**, non prima: con il v1 caricato le pagine v2
  si vedono un pixel più piccole, senza Inter e coi link senza arancio.
- **Il materiale che fotografa l'app vera** — schermate con dati, il piano con i numeri di
  riga, i prompt delle sessioni — sta fuori da questo repository, che è pubblico. Per
  Anagrafe stava in una cartella locale di Francesco (`transizione-anagrafe/`).

## 2. Proposte

### Dalla parte dell'app

1. **Prima si cerca**: con l'MCP di shadcn nel registry `@tassullo` e nella style guide.
   Se c'è, si installa.
2. **Se non c'è, si apre una issue** col modulo «Proposta»
   (`https://github.com/tassullo/tassullo-design-system-v2/issues/new?template=proposta.yml`,
   o `gh issue create -R tassullo/tassullo-design-system-v2 --label proposta --title
   "Proposta: …"`). Una issue per bisogno, descritto per funzione e non per aspetto, con
   cosa si è provato. È pubblica: niente dati veri, niente schermate con dati reali.
3. **Nel frattempo** l'app usa il componente più vicino così com'è, con
   `// in attesa di tassullo-design-system-v2#<n>` sulla riga. Mai una versione fatta in
   casa, mai un file del design system ritoccato: `tassullo-controllo` farebbe fallire la CI
   dell'app.
4. **Le proposte si mandano a gruppi**: lavorando un gruppo di pagine si raccolgono le
   lacune e si aprono insieme, quando la causa è capita. È così che il design system le
   lavora in un'ondata sola e risponde con una versione sola.

### Dalla parte del design system

5. **`sync.sh` elenca le proposte aperte** a ogni inizio sessione. Le valuta Francesco:
   - **accettata**: diventa una riga in `CHECKLIST.md`;
   - **respinta**: la issue si chiude con la ragione scritta, cioè cosa usare invece;
   - **da chiarire**: la domanda si scrive sulla issue.
6. **Si realizza su un ramo** `fras/proposta-<n>`, o `fras/proposte-ondata-<k>` per un
   gruppo. Per ogni issue:
   - si segue la scala della regola 4bis di `CLAUDE.md`: prima shadcn, poi le sole classi,
     poi si adatta il design system; un componente o una variante nostra solo con la
     conferma di Francesco;
   - **una prova** (una `play` con `expect` sulla scena) che fallisce sul codice di partenza
     e passa con la correzione, così resta nel gate;
   - **le scelte di forma** si portano a Francesco una a una, con le alternative rese
     affiancate e l'indirizzo della scena per provarle (§82). Si decide guardando, non
     leggendo;
   - **la nota per le app**: cosa reinstallare, quali ripieghi «in attesa di» togliere, e se
     cambia il comportamento predefinito per chi aggiorna («cambio di serie»). Va nel
     diario, e poi nel commento di adozione (punto 8).
7. **PR con `Closes #<n>`**, gate verde in CI, unione con la conferma di Francesco.

## 3. Riadozione

### La versione

8. **Dopo l'unione**, con la conferma di Francesco:
   - etichetta `vX.Y.Z` sul commit di unione, push della sola etichetta. Un'etichetta
     pubblicata non si sposta più (§66): una correzione è una versione nuova;
   - **verifica da fuori**: alla versione nuova rispondono 200 `registry.json` e gli item
     toccati, e `npx shadcn@latest view tassullo/tassullo-design-system-v2/<item>#vX.Y.Z`
     risolve;
   - **il commento di adozione** su ogni issue chiusa dalla versione: la versione, gli item
     da reinstallare, i ripieghi da togliere, i cambi di serie, cosa provare (in quali
     browser, Safari compreso quando conta) e se la versione **rompe o no** chi aggiorna
     dalla precedente.

### Nell'app

9. **L'adozione è il task ricorrente «Allineamento al design system»** del piano dell'app
   (`docs/INTEGRAZIONE.md`, «Nel piano dell'app»): si cambia l'etichetta in
   `components.json`, si reinstallano con `--overwrite` gli item già installati, `tema` per
   primo, si tolgono i commenti `// in attesa di …#<n>` delle issue chiuse e i ripieghi che
   li accompagnavano, si legge il diff, poi `tassullo-controllo`, `tsc -b`, build e un giro
   delle pagine toccate. Si reinstalla ciò che l'app ha già, non gli item nuovi della
   versione (`docs/INTEGRAZIONE.md`, «Aggiornare»).
10. **L'app riferisce sulla issue**: adottata, e con quale commit. Se qualcosa non va, lo
    scrive lì e la issue si riapre; il ciclo riparte dal punto 6. Un bisogno diverso è una
    proposta nuova, che cita la vecchia.

Una issue è finita quando la versione che la chiude è adottata nell'app e non resta nessun
`// in attesa di …#<n>` nel suo codice.
