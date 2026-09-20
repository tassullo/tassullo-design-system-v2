# `pagina-login` — decisioni prese e cosa va implementato

> Deciso con Francesco in sessione il **2026-09-19**, guardando le pagine vere di
> Studio (`/registrati` e `/login`, pubbliche) e il sorgente di `Registrazione.tsx`.
> Il piano di dettaglio (numeri di task, ordine, dipendenze) si scrive a parte: questa
> sessione ha chiuso le decisioni, non la pianificazione.

## 1. Le decisioni

### 1.1 Chi usa cosa — informazione che non stava in nessun documento

| app | accesso |
|---|---|
| **Anagrafe** | **solo account Microsoft**. Confermato da Francesco |
| **Officina** | solo account Microsoft (MSAL, `Login.tsx` 40 righe) |
| **Studio** | **ibrido**: professionisti con email e password, dipendenti con Microsoft |

**Perché Studio è diverso, e perché non è una divergenza da correggere.**
`Login.tsx:20` lo dice: «i professionisti entrano con email e password sul posto; i
dipendenti hanno il loro pulsante Microsoft in fondo». `Registrazione.tsx:15`:
«Registrazione **professionisti** in tre passi», con categorie impresa / studio di
progettazione / libero professionista, partita IVA, iscrizione all'ordine.
Studio ha utenti **fuori dall'azienda**, e a un libero professionista non si dà un
account Entra ID. L'uscita «Studio si adatta e usa solo SSO» è impossibile, non
sconveniente.

### 1.2 `pagina-login` prende `modo`, un insieme chiuso di tre

Scelta di Francesco, contro la prima proposta dell'orchestratore (che era «una
sezione credenziali facoltativa in più»).

```ts
modo?: "microsoft" | "credenziali" | "entrambi"   // "microsoft" di default
```

**Perché l'insieme chiuso e non la prop facoltativa.** È la stessa mossa del rapporto
d'aspetto di D-A: si dichiara l'insieme invece di lasciarlo aperto. E qui c'è un
argomento in più, che si vede guardando `/login` di Studio: l'ordine sulla pagina è
credenziali → separatore «oppure» → bottone Microsoft sotto l'etichetta «TEAM
TASSULLO». **L'SSO è il caso secondario, quello in fondo.** Con una prop facoltativa
le credenziali sarebbero un accessorio dell'SSO e questo non sarebbe dicibile.

**`"credenziali"` non ha consumatori oggi** e va fatto lo stesso: è un *valore di una
prop*, non un componente, quindi la regola del secondo consumatore non si applica
(stesso ragionamento del 16:9 in D-A). E senza il caso puro, «entrambi» non si capisce
che è la somma di due vie: sembra un caso speciale.

**Il default su `"microsoft"` tiene Anagrafe e Officina immutate**: non passano niente
e ottengono esattamente la pagina di oggi.

### 1.3 Il guscio si apre: un guscio, più contenuti

`pagina-login` oggi **non è «la pagina di login»**: è il guscio dell'autenticazione con
dentro il bottone Microsoft. Il corpo è 15 righe su 50. Il guscio
(`pagina-login.tsx:118-135`) è: schermo centrato · `Card max-w-sm` · marchio `.marchio-t`
· `CardTitle` · `CardDescription` · `CardContent`.

**Verificato sulle pagine vere**: è identico, elemento per elemento, a `/registrati` e a
`/login` di Studio, e lo è anche alle tre schermate minime (password dimenticata,
reimposta password, verifica email), che sono lo stesso guscio con dentro un campo e un
messaggio.

Quindi: **il guscio resta di `pagina-login` e non cambia**; cambia cosa ci va dentro.
Non si scrive una famiglia di pagine modello nuove.

### 1.4 Il «wizard» non esiste come componente

Era il candidato C.1 da sospendere. **Cade**: guardando i tre passi della registrazione,
di un componente wizard non c'è niente da scrivere.

- I **segmenti di avanzamento** sono l'unico pezzo mancante (§2).
- Il **gating** — «non passare al passo 2 finché non valida» — dipende da quali campi ha
  quel passo, e nessun blocco può saperlo. **Resta codice della pagina**, come oggi.

Dei tre sospesi ne restano **due**: calendario a eventi e barra di contesto globale.

## 2. Cosa va implementato

### 2.1 Il solo pezzo nuovo: la barra a segmenti

`<div className="auth-passi" aria-hidden="true">` con N trattini, M accesi.

**Serve tre volte in due pagine**, ed è la ragione per cui vale la pena farlo una volta:
1. i passi in cima a `/registrati` («Passo 1 di 3 · Accesso»);
2. il **misuratore di robustezza della password**, sotto il campo, nella stessa schermata
   — stesso oggetto, N segmenti M accesi;
3. i passi di `TaskCalcoloStrutturale` (i cinque moduli di calcolo).

Dimensione: una decina di righe. **Non è `progress`**, che è una barra continua.

### 2.2 Tutto il resto compone con quello che c'è — verificato

**`/login` ibrido — zero elementi mancanti.**

| elemento | item |
|---|---|
| Email | `Field` + `Input` |
| Password col «Mostra» dentro il campo | `InputGroup` + `InputGroupButton` |
| «Accedi» | `Button` |
| «Password dimenticata?», «Registrati» | `Button variant="link"` |
| il filo con **«oppure»** al centro | **`FieldSeparator`** (`field.tsx:144`) — esiste apposta |
| «TEAM TASSULLO» | `FieldLegend` o `FieldDescription` |
| «Accedi con account aziendale» | il `Button` che `pagina-login` ha già |

**`/registrati`, passo 1** — `Field`+`Input` (codice invito, email, ripeti password),
`FieldDescription` (il testo sulla beta), `InputGroup`+`InputGroupButton` (password con
«Mostra»), `FieldError`, `Button`. Marchio, titolo e sottotitolo dal guscio.

**passo 2 — «Il tuo profilo»**

| elemento | item |
|---|---|
| le tre card selezionabili (impresa / studio / libero professionista) | **`FieldLabel` che avvolge un `radio-group`**. `field.tsx:107` porta già `has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border` e `has-data-checked:border-primary/30 has-data-checked:bg-primary/5`: **la scelta a card è dentro la primitiva** e si accende da sé |
| Nome+Cognome affiancati, Città/Provincia/CAP in riga | **`Field orientation="responsive"`** dentro `FieldGroup` (`field.tsx:60`): impila su stretto, affianca su largo, da solo |
| ragione sociale, P.IVA, albo | `Field` + `Input` |
| «Partita IVA non valida», «CAP non valido» | `FieldError` |
| Indietro / Avanti | `Button` |

**passo 3 — «Privacy e consensi»** — `Field orientation="horizontal"` + `Checkbox` +
`FieldContent` + `FieldDescription` per i tre consensi con la nota
«Obbligatorio»/«Facoltativo». `field.tsx:58` allinea già la casella in cima quando il
testo va a capo.

**La schermata d'esito** (📬 «Ti abbiamo mandato un link» + bottone per rispedirlo) è
**`Empty`**: icona, titolo, descrizione, azione. Corrispondenza esatta.

**Le tre schermate minime** (password dimenticata, reimposta, verifica email) sono il
guscio + un campo + un esito: `Field`+`Input`+`Button`, e `Empty`/`Alert` per l'esito.
Non serve codice nuovo: serve **una story** che lo mostri.

## 3. I quattro punti — **risolti** in M4ter.4 (2026-09-20)

Erano aperti fino al 2026-09-19, ed erano il genere di cosa che, scoperta a
metà lavoro, fa rifare l'API. Risolti **prima** di scrivere la firma, che è
l'unico momento in cui costano poco. La firma che ne esce sta in
`registry/tassullo/pages/pagina-login.tsx`; qui c'è il **perché**.

### 3.1 La disponibilità è per via → **due interruttori, e il vecchio non cambia**

Il problema: `configurato` era un booleano solo e voleva dire «l'app
registration Entra ID c'è». Studio ne ha due — quella, e
`accessoLocale = stato?.abilitata !== false` (`Login.tsx:44`), spento finché
il backend non ha il segreto.

**Risolto così.** `configurato` **mantiene esattamente il significato di
oggi** e governa la **sola via Microsoft**: Anagrafe e Officina non cambiano
di un carattere. La via locale ha il suo, nuovo: `credenzialiAbilitate`,
`true` di default.

E una decisione che il punto non poneva ma che si scopre scrivendolo: **una
via spenta si mostra disabilitata con un avviso, non nascosta**. È lo stesso
trattamento che `configurato={false}` dà da sempre all'altra via, e una via
che sparisce senza dire perché si legge come un guasto — l'utente non sa se
manca la funzione o se è rotta la pagina.

### 3.2 L'errore deve sapere da quale via viene → **`statoDi`, e vale anche per `in-corso`**

**Risolto così.** `statoDi?: "microsoft" | "credenziali"` dice a quale via si
riferisce `stato`. Non un secondo `stato`: **uno stato e la sua via**, o si
potrebbero dichiarare due stati che si contraddicono, che è la ragione per cui
`stato` era già un prop solo invece di tre booleani.

Scrivendolo si è visto che **il punto valeva più di quanto diceva**: non è
solo l'errore, è anche `in-corso`. L'indicatore va sul bottone che è stato
premuto, o in «entrambi» un accesso Microsoft in corso girerebbe la rotella
sopra «Accedi».

- `statoDi: "microsoft"` → `Alert variant="destructive"` **in cima alla
  card**, sopra il form, e i campi non si tingono. È l'errore che in Studio
  è catturato in `main.tsx`.
- `statoDi: "credenziali"` → l'`Alert` sta **dentro il form**, e i campi
  prendono `aria-invalid`.

Il default è **la via principale del modo**: `microsoft` per `"microsoft"`,
`credenziali` per `"credenziali"` e per `"entrambi"` — dove le credenziali
sono la via principale, che è l'ordine stesso della pagina. Col default,
`modo="microsoft"` rende la pagina di prima, identica.

**Le parole.** I due errori si distinguono da soli, senza che l'app passi
niente: «Email o password non corretti» / «Controlla l'indirizzo e la
password, poi riprova» contro «Accesso non riuscito» / «Accesso non riuscito.
Riprova.» — e quest'ultimo è il testo di oggi, invariato. La story
`ErroreMicrosoft` mostra la frase che Studio userebbe («Il rientro da
Microsoft non è andato a buon fine»).

### 3.3 Il logo Microsoft → **nodo passato dall'app, e un trattamento solo**

**Risolto così.** `logoMicrosoft?: ReactNode`. Nel registry non entra nessun
SVG: il marchio è di terzi e i suoi quattro colori sono **fissi per
specifica**, quindi in un file del registry sarebbero quattro esadecimali in
un `fill`, cioè la regola 3 violata in modo non sanabile — non esiste un
token del tema che possa diventare il rosso Microsoft senza smettere di
essere il rosso Microsoft. Senza il nodo resta il `LogInIcon` di Lucide che la
pagina ha sempre avuto, e la non-regressione è salva.

Per le story il logo sta in **`.storybook/prove/logo-microsoft.tsx`**, la
cartella che nessun item spedisce: le story lo passano come lo passerebbe
Studio, dal proprio codice di pagina.

**I due trattamenti pareggiati, e il criterio non è la via — è il ruolo.**
Studio usa un bottone nero, questa pagina il bottone primario. Il nero cade:
non è un token del tema, e sarebbe stato un terzo trattamento invece di uno.
Regola: **la via principale prende il `Button` primario, la secondaria
l'`outline`**. In `"microsoft"` e `"credenziali"` c'è una via sola ed è
primaria; in `"entrambi"` il primario è «Accedi» e Microsoft è `outline` —
che è anche il modo in cui l'ordine della pagina si vede invece di doverlo
leggere.

### 3.4 Il campo nascosto → **resta alla pagina, e non per pigrizia**

**Risolto così: non si assorbe.** L'honeypot è una contromisura che vive col
backend che la legge — il design system non sa, e non deve sapere, come quel
backend decide che un invio è di un bot. E c'è un argomento più forte della
separazione delle competenze: **un campo che il registry spedisse a tutte le
app sarebbe un campo riconoscibile a tutti**, cioè un honeypot inutile. Sta
scritto nel commento di testa del componente, sotto «quello che questa pagina
non fa», insieme alla validazione dei campi.

### 3.5 Una quinta cosa, che i quattro punti non ponevano

**La firma è un'unione discriminata su `modo`**, non tre gestori facoltativi:
`modo="entrambi"` senza `onAccediConCredenziali` **non compila**
(`TS2741`/`TS2322`, provato in entrambe le direzioni). È la lezione di
M4ter.3: quando una prop deve esserci, il solo controllo che la vede è il
**tipo** (`docs/DECISIONI.md` §45c) — axe non vede un gestore mancante, e
`build-storybook` passa da esbuild, che i tipi non li guarda. Da ieri
`npm run build` gira in CI apposta.

Il costo c'è ed è piccolo: uno spread di `args` di un'unione TypeScript non
si sa restringere, quindi la story `Interattiva` passa le props una per una.
Si paga in una story, non nelle app.
