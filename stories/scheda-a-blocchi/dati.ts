/**
 * I dati d'esempio della pagina `Pagine/Scheda a blocchi`: l'elenco dei
 * titoli, i dati che i testi possono citare, e le schede con cui la pagina si
 * apre. Tutto inventato: la famiglia, i testi, l'azienda.
 */
import type { VoceSegnaposto } from '@/registry/tassullo/blocks/testo-segnaposto'
import type { BloccoModello, Livello, Titolo, TitoloBlocco } from './struttura'

/** L'elenco dei titoli: una scelta fissa, con il livello a cui di solito si usano. */
export const TITOLI: Titolo[] = [
  { id: 1, titolo: 'Descrizione', abituale: 1 },
  { id: 2, titolo: "Destinazione d'uso", abituale: 1 },
  { id: 3, titolo: 'Campo di applicazione', abituale: 1 },
  { id: 4, titolo: 'Applicazione', abituale: 1 },
  { id: 5, titolo: 'Avvertenze', abituale: 1 },
  { id: 6, titolo: 'Stoccaggio', abituale: 1 },
  { id: 7, titolo: 'Manutenzione', abituale: 1 },
  { id: 8, titolo: 'Voce di capitolato', abituale: 1 },
  { id: 9, titolo: 'Dati tecnici', abituale: 1 },
  { id: 10, titolo: 'Preparazione del supporto', abituale: 2 },
  { id: 11, titolo: "Preparazione dell'impasto", abituale: 2 },
  { id: 12, titolo: 'Posa in opera', abituale: 2 },
  { id: 13, titolo: 'Finitura', abituale: 2 },
  { id: 14, titolo: 'Pulizia degli attrezzi', abituale: 2 },
  { id: 15, titolo: 'Supporti sporchi o inconsistenti', abituale: 3 },
  { id: 16, titolo: 'Supporti molto assorbenti', abituale: 3 },
  { id: 17, titolo: 'Supporti bagnati', abituale: 3 },
  { id: 18, titolo: 'Supporti a base gesso', abituale: 3 },
  { id: 19, titolo: 'Additivazioni', abituale: 3 },
  { id: 20, titolo: 'Spessori di applicazione', abituale: 3 },
  { id: 21, titolo: 'Lavorazioni successive', abituale: 3 },
  { id: 22, titolo: 'Protezione dal gelo', abituale: 3, frase: 'frase.protezione_gelo' },
  { id: 23, titolo: 'Alte temperature', abituale: 3 },
  { id: 24, titolo: 'Conservazione', abituale: 3, frase: 'frase.conservazione' },
  { id: 25, titolo: 'Sicurezza', abituale: 3, frase: 'frase.uso_professionale' },
  { id: 26, titolo: 'Fornitura', abituale: 3 },
  { id: 27, titolo: 'Movimentazione', abituale: 3 },
  { id: 28, titolo: 'Condizioni climatiche', abituale: 3 },
]

const t = (titolo: string): TitoloBlocco => {
  const trovato = TITOLI.find((x) => x.titolo === titolo)
  if (!trovato) throw new Error(`Titolo non in elenco: ${titolo}`)
  return { id: trovato.id, titolo: trovato.titolo }
}

const b = (livello: Livello, titolo: string, testo = '', figli?: BloccoModello[]): BloccoModello => ({
  livello,
  titolo: t(titolo),
  testo,
  ...(figli ? { figli } : {}),
})

/** I dati che i testi di questa scheda possono citare, coi valori di oggi. */
export const VOCI: VoceSegnaposto[] = [
  { gruppo: 'Famiglia', etichetta: 'Nome', testo: '{{famiglia.nome}}', valore: 'Intonaco Alfa' },
  { gruppo: 'Famiglia', etichetta: 'Linea', testo: '{{famiglia.linea}}', valore: 'Linea Intonaci' },
  { gruppo: 'Famiglia', etichetta: 'Descrizione', testo: '{{famiglia.descrizione}}', valore: 'Intonaco di fondo per interni ed esterni' },
  { gruppo: 'Famiglia', etichetta: 'Marchio', testo: '{{famiglia.marchio}}', nota: 'Non è compilato.' },
  { gruppo: 'Qualifica', etichetta: 'Norma', testo: '{{qualifica.norma}}', valore: 'EN 998-1' },
  { gruppo: 'Qualifica', etichetta: 'Classe', testo: '{{qualifica.classe}}', valore: 'GP CS II' },
  { gruppo: 'Qualifica', etichetta: 'Sistema di valutazione', testo: '{{qualifica.sistema}}', valore: '4' },
  { gruppo: 'Prestazioni', etichetta: 'Resistenza a compressione', testo: '{{prestazione.compressione}}', valore: 'da 1,5 a 5,0 N/mm²' },
  { gruppo: 'Prestazioni', etichetta: 'Reazione al fuoco', testo: '{{prestazione.fuoco}}', valore: 'A1' },
  { gruppo: 'Prestazioni', etichetta: 'Assorbimento d’acqua', testo: '{{prestazione.assorbimento}}', nota: 'Nessun prodotto attivo.' },
  { gruppo: 'Confezione', etichetta: 'Peso del sacco', testo: '{{confezione.peso}}', valore: '25 kg' },
  { gruppo: 'Confezione', etichetta: 'Resa', testo: '{{confezione.resa}}', valore: '14 kg/m² per cm di spessore' },
  { gruppo: 'Frasi standard', etichetta: 'Conservazione', testo: '{{frase.conservazione}}', valore: 'Massimo 12 mesi in confezione originale e integra, in luogo coperto e asciutto.' },
  { gruppo: 'Frasi standard', etichetta: 'Protezione dal gelo', testo: '{{frase.protezione_gelo}}', valore: 'Non applicare con temperature inferiori a +5 °C o con rischio di gelo nelle 24 ore successive.' },
  { gruppo: 'Frasi standard', etichetta: 'Uso professionale', testo: '{{frase.uso_professionale}}', valore: 'Il prodotto è inteso per un uso professionale.' },
  { gruppo: 'Emittente', etichetta: 'Ragione sociale', testo: '{{emittente.ragione_sociale}}', valore: 'Azienda Esempio S.r.l.' },
  { gruppo: 'Emittente', etichetta: 'Sito', testo: '{{emittente.sito}}', valore: 'www.esempio.it' },
]

/** Il nome della famiglia: i valori citati sono i suoi. */
export const FAMIGLIA = 'Intonaco Alfa'

/** La scheda tecnica: venti blocchi su tre livelli, con tre titoletti messi direttamente sotto un capitolo. */
export const SCHEDA: BloccoModello[] = [
  b(
    1,
    'Descrizione',
    '{{famiglia.nome}} è un intonaco di fondo premiscelato in polvere, a base di calce idraulica naturale e sabbie selezionate, per murature in interno e in esterno. Si applica a mano o con intonacatrice e lascia respirare la muratura.\n{{frase.uso_professionale}}'
  ),
  b(1, "Destinazione d'uso", 'Intonacatura di fondo di murature nuove ed esistenti, come supporto per finiture minerali a base di calce. Conforme alla {{qualifica.norma}}, classe {{qualifica.classe}}.'),
  b(1, 'Campo di applicazione', 'Murature in laterizio, in pietra e miste, purché stagionate e stabili. Su calcestruzzo liscio applicare prima un rinzaffo di aggrappo.'),
  b(1, 'Applicazione', '', [
    b(2, 'Preparazione del supporto', 'Il supporto deve essere stagionato, pulito, consistente e privo di polvere, efflorescenze e parti in distacco.', [
      b(3, 'Supporti sporchi o inconsistenti', 'Rimuovere le parti incoerenti, i vecchi intonaci in distacco e ogni residuo che possa ridurre l’adesione.'),
      b(3, 'Supporti molto assorbenti', 'Bagnare a rifiuto il giorno prima dell’applicazione e di nuovo poco prima, fino a una superficie umida ma non bagnata.'),
      b(3, 'Supporti bagnati', 'Non applicare su supporti saturi d’acqua: attendere che la muratura torni umida ma non bagnata.'),
      b(3, 'Supporti a base gesso'),
    ]),
    b(2, "Preparazione dell'impasto", 'Versare nel contenitore circa tre quarti dell’acqua, aggiungere il prodotto e mescolare per tre minuti, poi completare con l’acqua rimasta.', [
      b(3, 'Additivazioni', 'Il prodotto è pronto all’uso: non aggiungere cemento, calce, inerti o additivi di cantiere.'),
    ]),
    b(2, 'Posa in opera', 'Applicare in strati successivi, attendendo che lo strato precedente abbia iniziato la presa. Staggiare a prodotto ancora fresco.', [
      b(3, 'Spessori di applicazione', 'Lo spessore minimo dell’intonaco finito è di 1,5 cm, quello massimo per strato di 2 cm.'),
      b(3, 'Lavorazioni successive'),
    ]),
  ]),
  b(1, 'Avvertenze', '', [
    b(3, 'Protezione dal gelo', '{{frase.protezione_gelo}}'),
    b(3, 'Alte temperature', 'Con temperature oltre i +30 °C, con vento forte o in pieno sole bagnare la superficie nelle 48 ore successive.'),
    b(3, 'Conservazione', '{{frase.conservazione}}'),
    b(3, 'Sicurezza', 'Il prodotto contiene calce: a contatto con l’acqua può irritare la pelle e gli occhi. Usare guanti e occhiali protettivi.'),
  ]),
  b(1, 'Manutenzione'),
]

const altri = (n: number): BloccoModello[] =>
  Array.from({ length: n }, (_, i) =>
    b(1, ['Stoccaggio', 'Dati tecnici', 'Voce di capitolato', 'Manutenzione'][i % 4], '', [
      b(2, 'Finitura', 'Rifinire con frattazzo di spugna a presa iniziata.'),
      b(3, 'Fornitura', 'Sacchi da {{confezione.peso}} su bancale.'),
      b(3, 'Movimentazione'),
      b(3, 'Condizioni climatiche', 'Applicare fra +5 °C e +30 °C.'),
    ])
  )

/** Una scheda lunga: quaranta blocchi, l'albero è più alto della finestra. */
export const SCHEDA_LUNGA: BloccoModello[] = [...SCHEDA, ...altri(5)]

/**
 * Una scheda che si legge soltanto, con un blocco che cita un dato che questa
 * scheda non può citare: nell'albero ha il triangolo.
 */
export const SCHEDA_DA_LEGGERE: BloccoModello[] = [
  b(1, 'Descrizione', SCHEDA[0].testo),
  b(1, "Destinazione d'uso", SCHEDA[1].testo),
  b(1, 'Dati tecnici', 'Resistenza al gelo e al disgelo: {{prestazione.gelo_disgelo}}. Reazione al fuoco: classe {{prestazione.fuoco}}.'),
  b(1, 'Applicazione', '', [b(2, 'Posa in opera', 'Applicare in strati successivi, attendendo che lo strato precedente abbia iniziato la presa.'), b(3, 'Spessori di applicazione')]),
  b(1, 'Avvertenze', '', [b(3, 'Protezione dal gelo', '{{frase.protezione_gelo}}'), b(3, 'Conservazione', '{{frase.conservazione}}')]),
]

/** Lo schema comune: i quattro capitoli da cui parte una scheda vuota, senza testi. */
export const SCHEMA_COMUNE: BloccoModello[] = [
  b(1, 'Descrizione'),
  b(1, "Destinazione d'uso"),
  b(1, 'Applicazione'),
  b(1, 'Avvertenze'),
]

/** Le famiglie da cui si può copiare la struttura. */
export const ALTRE_FAMIGLIE: { id: number; nome: string; blocchi: BloccoModello[] }[] = [
  { id: 2, nome: 'Intonaco Beta', blocchi: SCHEDA },
  { id: 3, nome: 'Rasante Gamma', blocchi: SCHEDA.slice(0, 3) },
]

/** I due testi a campi fissi della scheda di sostenibilità, la seconda card della tab. */
export const SOSTENIBILITA = [
  { sezione: 'descrizione', etichetta: 'Descrizione', testo: '{{famiglia.nome}} è prodotto con materie prime minerali e senza solventi.' },
  { sezione: 'uso', etichetta: "Destinazione d'uso", testo: '' },
]
