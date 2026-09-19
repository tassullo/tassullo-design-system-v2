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

## 3. Punti aperti — da risolvere nella sessione che scrive

Sono il genere di cosa che, scoperta a metà lavoro, fa rifare l'API.

1. **La disponibilità è per via, non per pagina.** Oggi `configurato` è un booleano solo
   e vuol dire «l'app registration Entra ID c'è». Studio ne ha due: quella, e
   `accessoLocale = stato?.abilitata !== false` (`Login.tsx:44`) — l'accesso locale è
   spento finché il backend non ha il segreto. Con tre modi servono **due interruttori
   distinti**, ciascuno legato alla sua via. `configurato` va mantenuto col significato
   di oggi, o Anagrafe e Officina cambiano.
2. **L'errore deve sapere da quale via viene.** Oggi `stato: "errore"` è uno solo. In
   Studio l'errore del ritorno da Microsoft è catturato in `main.tsx` e mostrato in cima,
   mentre l'errore di credenziali sbagliate sta sul form. Indistinti, un accesso
   dipendente fallito colorerebbe di rosso il campo password — la cosa sbagliata da dire
   a chi ha sbagliato tutt'altro.
3. **Il logo Microsoft.** Studio usa un bottone **nero col logo a quattro quadrati**;
   `pagina-login` oggi usa il bottone primario con `LogInIcon` di Lucide. Sono due
   trattamenti dello stesso comando, e vanno pareggiati. Attenzione: il logo Microsoft è
   un marchio di terzi e ha quattro colori fissi — come SVG nel registry violerebbe la
   regola 3 sui valori arbitrari. Probabilmente entra come **nodo passato dall'app**, non
   come file del registry.
4. **Il campo nascosto** (`textbox type="hidden"` nell'albero di `/registrati`) è quasi
   certamente un honeypot anti-bot. Non è materia del design system: la pagina se lo
   scrive. Da non assorbire per distrazione.
