# `pagina-login` — decisioni prese, e le schermate d'accesso composte

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

> **Rettifica del 2026-09-20 (M4ter.5), su due punti.**
>
> **(a) «Identico» vale per la forma, non per la larghezza.** Le tre schermate
> di registrazione hanno la card a **`max-w-lg`** (512px); login, password
> dimenticata, reimposta, verifica email e l'esito restano a **`max-w-sm`**
> (384px). La ragione è misurata e sta in §2.2: `Field orientation="responsive"`
> scatta a 448px di `FieldGroup`, e dentro `max-w-sm` il `FieldGroup` ne misura
> **352** — l'affiancamento di Nome+Cognome e di Città/Prov./CAP, che §2.2 dà
> per fatto, dentro una card stretta non sarebbe **mai** avvenuto. Scelta di
> Francesco il 2026-09-20, guardando le due versioni affiancate.
>
> **(b) Il guscio si ricompone, non si riusa.** `PaginaLogin` non accetta
> `children` e non esporta il guscio: una schermata che non sia il login lo
> **riscrive**, ed è dieci righe di codice di pagina (`GuscioAccesso` nella
> story). Non si è aggiunto `children` al componente perché è un cambio d'API,
> e M4ter.5 dichiarava zero componenti nuovi: resta una decisione da prendere
> apposta, se e quando un'app ne avrà bisogno davvero.

### 1.4 Il «wizard» non esiste come componente

Era il candidato C.1 da sospendere. **Cade**: guardando i tre passi della registrazione,
di un componente wizard non c'è niente da scrivere.

- I **segmenti di avanzamento** erano l'unico pezzo mancante. **Non lo sono più**:
  si adotta `@reui/stepper` (M4ter.1) e la barra a segmenti non è nemmeno una sua
  variante — vedi §2.1, riscritta.
- Il **gating** — «non passare al passo 2 finché non valida» — dipende da quali campi ha
  quel passo, e nessun blocco può saperlo. **Resta codice della pagina**, come oggi.

Dei tre sospesi ne restano **due**: calendario a eventi e barra di contesto globale.

## 2. Le cinque schermate — **fatte** in M4ter.5 (2026-09-20)

Erano «cosa va implementato» fino al 2026-09-19. Da M4ter.5 sono **sette scene
in Storybook**, sotto `Pagine/Schermate d'accesso`
(`stories/SchermateAccesso.stories.tsx`) — composte con le primitive che il
registry ha già, **zero componenti nuovi**, `registry.json` fermo a 90 item.

| schermata | scena |
|---|---|
| `/registrati` passo 1 | `Registrati — 1. Accesso` |
| `/registrati` passo 2 | `Registrati — 2. Profilo` |
| `/registrati` passo 3 | `Registrati — 3. Consensi` |
| l'esito della registrazione | `Registrati — esito` |
| password dimenticata | `Password dimenticata` |
| reimposta password | `Reimposta la password` |
| verifica email | `Verifica email` |

Stanno in `stories/` e non accanto a `pagina-login` perché **non sono scene di
`PaginaLogin`**: non ne esercitano una prop né un ramo. Sono composizione, e
metterle sotto il titolo del componente direbbe il falso.

### 2.1 La barra a segmenti — **non si scrive: esiste** (riscritta il 2026-09-20)

> La stesura del 2026-09-19 diceva: «`<div className="auth-passi">` con N
> trattini, M accesi, una decina di righe». **È caduta in M4ter.1**, e lasciarla
> in piedi manderebbe chi legge fra sei mesi a scrivere un componente che c'è
> già.

Si adotta **`@reui/stepper`** (M4ter.1, `registry/tassullo/ui/stepper.tsx`).
`Primitive/Stepper` ne mostra cinque forme, e **la barra a segmenti non è una
variante**: è lo stesso componente con l'indicatore ridotto a un trattino e il
titolo sopra o sotto. Le tre scene di registrazione usano la forma
`BarraConTitoli` — pallino tolto, trattino pieno, il titolo del passo sotto —
perché è quella che dice «sono al secondo di tre» senza doverlo leggere.

**Due cose che la barra dei passi *non* è**, e sono la trappola del nome del
`CLAUDE.md` («il nome dice la funzione, non l'aspetto»):

1. **Non è il misuratore di robustezza della password.** Somiglia — N segmenti,
   M accesi — e non lo è: lo stepper è un `tablist` di schede che si cliccano e
   si navigano con le frecce; il misuratore non si naviga e non si seleziona.
   **Deciso da Francesco il 2026-09-19: resta dell'app**, occorrenza singola,
   codice di pagina. Non è in scena, apposta.
2. **Non è `progress`**, che è una barra continua.

I passi di `TaskCalcoloStrutturale` (i cinque moduli di calcolo) restano il caso
della forma `BarraASegmenti`, quella senza titoli — già in scena in
`Primitive/Stepper`.

**Il gating resta codice della pagina** (§1.4), e nella story è scritto come
tale e **funziona**: «Avanti» valida e non avanza, gli errori escono nei
`FieldError`, i passi non ancora raggiunti sono schede `disabled`. Misurato il
2026-09-20: premendo «Avanti» a vuoto sul passo 1 la scheda selezionata resta
`Passo 1 di 3`, e i passi 2 e 3 sono disabilitati.

### 2.1bis Il campo nascosto anti-bot **non è in scena**, ed è una scelta

§3.4 lo lascia alla pagina, e una story *è* codice di pagina: mostrarlo sarebbe
stato legittimo. Non è stato fatto perché **un honeypot vale finché il suo nome
non è prevedibile**, e questo repo è pubblico (D4): un campo che il registry
mostrasse a tutti sarebbe un campo che tutti riconoscono. Dirlo serve, mostrarlo
lo indebolisce — sta scritto nella testata della story.

### 2.1ter I requisiti della password sono un **controllo dinamico**

Aggiunto il 2026-09-20 su rilievo di Francesco, che ha guardato la riga fissa
«Almeno 10 caratteri.» sotto il campo e ha chiesto un controllo che si aggiorni
mentre si scrive — più un riscontro che le due password **coincidano**.

**Quello che si usa di solito e quello che si dovrebbe usare non coincidono**,
ed è la ragione per cui l'elenco non ha «una maiuscola, un numero, un carattere
speciale». Le regole di composizione sono ancora diffusissime, ma **NIST SP
800-63B e OWASP ASVS le sconsigliano esplicitamente**: producono `Password1!`,
che le soddisfa tutte ed è fra le password violate più comuni al mondo. La
raccomandazione corrente è **lunghezza** (8 minimo, 12–15 raccomandati, fino a
64 ammessi, tutti i caratteri accettati), **niente scadenza periodica**, e
**screening contro le password più usate e violate**.

Le tre regole in scena, in una costante sola:

| regola | perché |
|---|---|
| Almeno 12 caratteri | è la sola leva che aumenta davvero l'entropia |
| Non è fra le password più usate | in scena un elenco illustrativo; il vero screening è del backend, contro una lista di password violate |
| Non contiene il tuo indirizzo email | si confrontano i **pezzi** della parte locale (`mario`, `rossi`), non la stringa intera — o `mario` con email `mario.rossi@…` passerebbe |

La stessa costante alimenta il **riscontro a video** e il **rifiuto all'invio**,
quindi non possono divergere; e il rifiuto nomina quello che manca, non la
regola generica. La coincidenza si controlla **sempre**, non solo a password
valida: con un `else if` una password corta nascondeva anche la ripetizione
sbagliata, cioè due difetti al prezzo di un messaggio.

**Non è il misuratore di robustezza, e la decisione del 2026-09-19 regge.** Il
misuratore è una barra che dà un punteggio (debole/media/forte) e resta
dell'app; questo è il riscontro di una validazione — ed è comunque **codice di
pagina**, come il gating, non un componente del registry. Un requisito non
ancora soddisfatto è **muto, non rosso**: finché non si preme «Avanti» non è un
errore, è una cosa da fare.

Il verde è **`success-subtle-foreground`** e non `success`: quello è il colore
dei fondi, ed è la stessa trappola di `destructive` (`CLAUDE.md`).

Lo stesso modulo sta anche su **«Reimposta la password»**, che è l'altro punto
in cui una password si sceglie: se i due dicessero cose diverse, uno dei due
mentirebbe.

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
| Nome+Cognome affiancati, Città/Provincia/CAP in riga | **`Field orientation="responsive"`** dentro `FieldGroup` (`field.tsx:60`): impila su stretto, affianca su largo, da solo — **ma la soglia è del contenitore, vedi sotto** |
| ragione sociale, P.IVA, albo | `Field` + `Input` |
| «Partita IVA non valida», «CAP non valido» | `FieldError` |
| Indietro / Avanti | `Button` |

> **La soglia di `responsive`, misurata il 2026-09-20 (M4ter.5).** «Affianca su
> largo» guarda il **contenitore**, non la finestra: è `@md/field-group`, cioè
> **448px di `FieldGroup`**. Dentro `Card max-w-sm` il `FieldGroup` misura
> **352px** (384 di card meno 32 di riempimento) e **non ci arriva mai** — con
> quella larghezza la riga di questa tabella descriveva un'intenzione, non un
> rilievo. La prima larghezza che la fa scattare è **`max-w-lg`** (card 512 →
> contenuto 480); `max-w-md` non basta (448 → 416). Da cui la scelta di §1.3(a):
> le schermate di registrazione vanno a `max-w-lg`, e la tabella torna vera.
>
> Due ricadute viste solo **dopo** che la soglia scatta, e corrette al punto di
> chiamata: `responsive` centra i figli sull'asse verticale, quindi una riga in
> cui un campo ha una `FieldDescription` in più va rimessa a
> `@md/field-group:items-start` (senza, l'etichetta «Partita IVA» scende sotto
> quella accanto); e il campo lungo di una riga vuole `@md/field-group:flex-1`,
> o Città resta della misura di Prov. e la riga non riempie.

**passo 3 — «Privacy e consensi»** — `Field orientation="horizontal"` + `Checkbox` +
`FieldContent` + `FieldDescription` per i tre consensi con la nota
«Obbligatorio»/«Facoltativo». `field.tsx:58` allinea già la casella in cima quando il
testo va a capo.

**La schermata d'esito** (📬 «Ti abbiamo mandato un link» + bottone per rispedirlo) è
**`Empty`**: icona, titolo, descrizione, azione. Corrispondenza esatta.

**Le tre schermate minime** (password dimenticata, reimposta, verifica email) sono il
guscio + un campo + un esito: `Field`+`Input`+`Button`, e `Empty`/`Alert` per l'esito.
Non serve codice nuovo: serve **una story** che lo mostri — ed **è scritta**
(M4ter.5, la tabella di §2).

Una cosa vista a video e non misurabile: dentro il guscio, `CardTitle` **e**
`EmptyTitle` insieme danno due intestazioni che dicono la stessa cosa
(«Controlla la posta» sopra «Ti abbiamo mandato un link»). Nelle due scene
d'esito il titolo lo dà il guscio e l'`Empty` porta icona, descrizione e azione.

E le parole sono state controllate contro la lezione di M4ter.4 §3.2 —
**un messaggio deve descrivere un'azione che esiste**: da «Controlla la posta»
si rispedisce il link o si cambia indirizzo, e non c'è nessun «torna indietro»,
perché da lì un indietro non c'è; da «Verifica email» si va all'accesso, perché
ci si arriva da una mail e non da una pagina.

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

- `statoDi: "credenziali"` → l'`Alert` sta **dentro il form**, e i campi
  prendono `aria-invalid`.
- `statoDi: "microsoft"` → l'`Alert` sta **accanto al bottone Microsoft**,
  sotto l'etichetta del team, e i campi non si tingono. Con una via sola
  resta invece **in cima alla card**: lì non c'è niente da cui distinguerlo,
  è la pagina intera ad aver fallito — ed è anche ciò che tiene Anagrafe e
  Officina a DOM invariato.

**Sulla posizione, e perché si diverge da Studio.** La prima stesura lo
metteva sempre in cima, com'è in Studio. Rilievo di Francesco a video il
2026-09-20: in cima quell'avviso finisce **sopra il campo Email**, e chi lo
vede lì capisce «email sbagliata». **La posizione si legge prima delle
parole**, quindi un titolo esplicito non basta a recuperarla. Studio lo mostra
in cima perché lo cattura in `main.tsx` a pagina che si carica: era una
conseguenza di *dove lo si intercetta*, non una scelta di composizione — e su
questo il design system ha ragione contro l'app.

Un caso limite che vale la pena dire, perché il difetto sarebbe **muto**:
`modo="credenziali"` con `statoDi="microsoft"` è dichiarabile, e senza una
ricaduta esplicita l'avviso non avrebbe dove andare e **sparirebbe in
silenzio**. Ricade in cima.

Il default è **la via principale del modo**: `microsoft` per `"microsoft"`,
`credenziali` per `"credenziali"` e per `"entrambi"` — dove le credenziali
sono la via principale, che è l'ordine stesso della pagina. Col default,
`modo="microsoft"` rende la pagina di prima, identica.

**Le parole, e il titolo nomina la via solo quando ce n'è più d'una.** Con
una via sola «Accesso non riuscito» non è ambiguo, ed è il testo che Anagrafe
e Officina hanno sempre avuto: resta identico. In `"entrambi"` diventa
**«Accesso con Microsoft non riuscito»**, e il motivo è un rilievo di
Francesco a video il 2026-09-20 — l'avviso sta **sopra il campo Email**, e col
titolo generico chi lo legge capisce «email sbagliata», cioè proprio la
confusione che `statoDi` doveva togliere. La distinzione era corretta nel
codice e invisibile sullo schermo: `statoDi` funzionava, i campi non erano
tinti, a11y a zero — era una parola, e nessuna misura poteva prenderla.

La divisione dei compiti è la stessa nelle due vie: **il titolo dice cos'è
andato storto, il corpo cosa fare.**

| via | titolo | corpo (default) |
|---|---|---|
| credenziali | «Email o password non corretti» | «Controlla l'indirizzo e la password, poi riprova.» |
| Microsoft, una via sola | «Accesso non riuscito» | «Accesso non riuscito. Riprova.» *(testo di oggi, invariato)* |
| Microsoft, in `"entrambi"` | «Accesso con Microsoft non riuscito» | passato dall'app — la story usa «Torna indietro e riprova. Se succede ancora, contatta l'amministratore.» |

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
