// Dati inventati per le scene delle due pagine del supporto. Fuori da ogni
// item: nessuna app li riceve.
import type {
  Richiesta,
  RichiestaAmministratore,
  RichiestaScheda,
  StatoCollegamento,
} from '@/registry/tassullo/lib/supporto'

export const RICHIESTE: Richiesta[] = [
  { id: 41, tipo: 'errore', titolo: 'Il listino 2027 non si salva: compare un errore rosso dopo «Salva»', descrizione: '', stato: 'in_lavorazione', creato_il: '2026-10-30T09:12:00+01:00', n_risposte: 3, non_lette: 2 },
  { id: 40, tipo: 'domanda', titolo: 'Come si esporta la scheda di un prodotto in PDF?', descrizione: '', stato: 'chiusa', creato_il: '2026-10-28T16:40:00+01:00', n_risposte: 2, non_lette: 0 },
  { id: 39, tipo: 'richiesta', titolo: 'Vorrei poter filtrare le famiglie per norma', descrizione: '', stato: 'aperta', creato_il: '2026-10-27T11:05:00+01:00', n_risposte: 1, non_lette: 1 },
  { id: 38, tipo: 'errore', titolo: 'La ricerca non trova i codici con il trattino', descrizione: '', stato: 'ricevuta', creato_il: '2026-10-27T08:30:00+01:00', n_risposte: 0, non_lette: 0 },
  { id: 37, tipo: 'domanda', titolo: 'Chi può approvare una pubblicazione?', descrizione: '', stato: 'chiusa', creato_il: '2026-10-22T14:18:00+02:00', n_risposte: 1, non_lette: 0 },
  { id: 36, tipo: 'richiesta', titolo: 'Ordinare le caratteristiche trascinandole', descrizione: '', stato: 'aperta', creato_il: '2026-10-20T10:02:00+02:00', n_risposte: 4, non_lette: 0 },
  { id: 35, tipo: 'errore', titolo: 'Nel tema scuro la tabella dei listini ha una riga bianca', descrizione: '', stato: 'chiusa', creato_il: '2026-10-15T17:45:00+02:00', n_risposte: 2, non_lette: 0 },
  { id: 34, tipo: 'domanda', titolo: 'Dove trovo le DoP superate?', descrizione: '', stato: 'chiusa', creato_il: '2026-10-09T09:20:00+02:00', n_risposte: 1, non_lette: 0 },
]

const RISPOSTE = [
  {
    id: 1,
    autore: 'Giorgio Pedrotti',
    testo: 'Grazie della segnalazione. Riesco a riprodurlo con il listino 2027: guardo e ti aggiorno qui.',
    creato_il: '2026-10-30T10:02:00+01:00',
  },
  {
    id: 2,
    autore: 'Giorgio Pedrotti',
    testo:
      "Trovato: il prezzo della riga 14 ha due virgole e il server lo rifiuta. Il messaggio però non lo dice, quindi lo correggo.\nIntanto puoi sistemare la riga a mano e salvare.\nDettagli: https://esempio.it/supporto/listini/errori-di-validazione-del-prezzo-con-due-separatori-decimali",
    creato_il: '2026-10-30T15:47:00+01:00',
  },
  {
    id: 3,
    autore: 'Giorgio Pedrotti',
    testo: 'La correzione è nella versione che esce stasera.',
    creato_il: '2026-10-31T09:10:00+01:00',
  },
]

export const SCHEDA: RichiestaScheda = {
  ...RICHIESTE[0],
  descrizione:
    'Apro il listino 2027, cambio il prezzo di una riga e premo «Salva». Compare un riquadro rosso con scritto «Errore di validazione» e le modifiche non restano.\n\nHo provato due volte, anche ricaricando la pagina.',
  utente_email: 'sbertolini@esempio.it',
  utente_nome: 'Stefano Bertolini',
  n_screenshot: 3,
  risposte: RISPOSTE,
  screenshot: [
    { id: 's1', nome: 'listino-2027.png' },
    { id: 's2', nome: 'errore-al-salvataggio.png' },
    { id: 's3', nome: null },
  ],
  pagina: '/listini/2027',
  versione_frontend: '1.18.0',
  versione_backend: '1.18.0',
  browser: {
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: '1440x900',
    densita: 'normale',
    scuro: false,
    lingua: 'it-IT',
  },
  errori_api: [
    {
      quando: '2026-10-30T09:11:20+01:00',
      metodo: 'PUT',
      percorso: '/api/listini/2027/righe/14',
      stato: 422,
      dettaglio: 'prezzo: valore non valido «12,50,0»',
    },
    {
      quando: '2026-10-30T09:11:48+01:00',
      metodo: 'PUT',
      percorso: '/api/listini/2027/righe/14',
      stato: 422,
      dettaglio: 'prezzo: valore non valido «12,50,0»',
    },
  ],
}

export const APPENA_RICEVUTA: RichiestaScheda = {
  ...RICHIESTE[3],
  descrizione: 'Cerco «TS-200» e non trovo niente, ma il prodotto c\'è: cercando «TS200» compare.',
  risposte: [],
  screenshot: [],
}

export const SCREENSHOT_TOLTI: RichiestaScheda = {
  ...RICHIESTE[6],
  descrizione: 'Nel tema scuro, fra la terza e la quarta riga della tabella dei listini, c\'è una linea bianca.',
  risposte: [
    { id: 9, autore: 'Giorgio Pedrotti', testo: 'Corretto, grazie!', creato_il: '2026-10-16T08:30:00+02:00' },
  ],
  screenshot: [],
  screenshot_tolti: 2,
}

const UTENTI = ['Stefano Bertolini', 'Giorgio Pedrotti', 'Chiara Zanon', 'Luca Moser']
const ISSUE = 'https://github.com/esempio/supporto/issues/'

// Le stesse richieste, viste dall'amministratore: due non sono partite.
export const RICHIESTE_ADMIN: RichiestaAmministratore[] = RICHIESTE.map((r, i) => {
  const utente = UTENTI[i % UTENTI.length]
  const email = `${utente.split(' ')[0].toLowerCase()}@esempio.it`
  if (r.stato === 'ricevuta') {
    return {
      ...r,
      utente_nome: utente,
      utente_email: email,
      invio_tentativi: 2,
      invio_ultimo_errore: 'GitHub ha risposto 401 Bad credentials',
    }
  }
  const numero = 57 - i
  return {
    ...r,
    utente_nome: utente,
    utente_email: email,
    github_numero: numero,
    github_url: `${ISSUE}${numero}`,
    invio_tentativi: i === 2 ? 4 : 1,
  }
})

RICHIESTE_ADMIN.splice(1, 0, {
  id: 42,
  tipo: 'errore',
  titolo: 'La stampa della scheda tecnica esce senza il marchio CE quando il prodotto ha più di una norma armonizzata',
  descrizione: '',
  stato: 'ricevuta',
  creato_il: '2026-10-31T18:22:00+01:00',
  n_risposte: 0,
  non_lette: 0,
  utente_nome: 'Chiara Zanon',
  utente_email: 'chiara@esempio.it',
  invio_tentativi: 1,
  invio_ultimo_errore:
    'POST https://api.github.com/repos/esempio/supporto/issues: 422 Unprocessable Entity — Validation Failed: {"resource":"Issue","code":"custom","field":"body","message":"body is too long (maximum is 65536 characters)"}',
})

export const COLLEGAMENTO: StatoCollegamento = {
  configurato: true,
  repo: 'esempio/supporto',
  token: { stato: 'valida', scadenza: '2027-03-31', giorni: 150 },
  preavviso_giorni: 14,
  non_inviate: 2,
  ultima_sincronizzazione: '2026-11-01T19:55:00+01:00',
}
