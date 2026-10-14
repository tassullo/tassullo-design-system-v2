/**
 * La scheda a blocchi della pagina d'esempio `Pagine/Scheda a blocchi`: l'albero
 * dei blocchi, le funzioni che lo cambiano e lo stato di una scheda che si
 * scrive, col suo riduttore. Tutto puro, senza React: la pagina lo usa con
 * `useReducer`. È la stessa forma della scheda tecnica di Anagrafe, senza il
 * server: il salvataggio lo fa la pagina, in memoria.
 *
 * Un blocco ha un titolo dell'elenco dei titoli, un livello (1 capitolo, 2
 * sottocapitolo, 3 titoletto) e un testo, anche vuoto. Un capitolo non ha
 * padre; un sottocapitolo sta sotto un capitolo; un titoletto sotto un capitolo
 * o sotto un sottocapitolo: il secondo livello si può saltare. I figli sono
 * nell'ordine di stampa.
 *
 * Ogni cambio restituisce un albero nuovo e lascia com'erano (stesso oggetto) i
 * rami che non tocca.
 */
import { FORMA_SEGNAPOSTO } from '@/registry/tassullo/lib/segnaposto'

const OGNI_SEGNAPOSTO = new RegExp(FORMA_SEGNAPOSTO.source, 'g')

export type Livello = 1 | 2 | 3

/** Come si chiama un blocco di quel livello. */
export const NOME_LIVELLO: Record<Livello, string> = { 1: 'Capitolo', 2: 'Sottocapitolo', 3: 'Titoletto' }

/** Come si chiama un blocco che non ha ancora un titolo: «capitolo senza titolo». */
export const nomeSenzaTitolo = (livello: Livello) => `${NOME_LIVELLO[livello].toLowerCase()} senza titolo`

/** Come si chiama un blocco dove serve un nome: il suo titolo, o che cos'è se il titolo non c'è ancora. */
export const nomeBlocco = (blocco: Pick<Blocco, 'titolo' | 'livello'>) => blocco.titolo?.titolo ?? nomeSenzaTitolo(blocco.livello)

/** Un titolo dell'elenco: i titoli sono una scelta fissa, e dalla scheda non se ne creano. */
export interface Titolo {
  id: number
  titolo: string
  /** Il livello a cui di solito si usa: serve solo a ordinare la tendina. */
  abituale: Livello
  /** La frase standard che gli fa da testo, se ce n'è una: il nome di un dato da citare. */
  frase?: string
}

/** Il titolo di un blocco. */
export type TitoloBlocco = Pick<Titolo, 'id' | 'titolo'>

/** Un blocco nella scheda. */
export interface Blocco {
  /** Il nome del blocco finché la pagina è aperta: non cambia quando il blocco si salva o si sposta. */
  chiave: string
  /** `null` finché il blocco non è salvato. */
  id: number | null
  livello: Livello
  /** `null` in un blocco appena aggiunto: senza titolo non si salva. */
  titolo: TitoloBlocco | null
  testo: string
  figli: Blocco[]
}

/** Un blocco da cui partire: lo schema comune, o la scheda di un'altra famiglia. */
export interface BloccoModello {
  livello: Livello
  titolo: TitoloBlocco
  testo?: string
  figli?: BloccoModello[]
}

let contatore = 0
const nuovaChiave = () => `nuovo-${++contatore}`
let ultimoId = 1000
/** Un `id` nuovo, come quelli che dà il server a un blocco salvato. */
export const nuovoId = () => ++ultimoId

/** Un blocco nuovo, senza titolo né testo. */
export function bloccoNuovo(livello: Livello): Blocco {
  return { chiave: nuovaChiave(), id: null, livello, titolo: null, testo: '', figli: [] }
}

/** Blocchi nuovi (non salvati) da un modello: lo schema comune, o la scheda di un'altra famiglia. */
export function daModello(blocchi: readonly BloccoModello[], conTesti: boolean): Blocco[] {
  return blocchi.map((b) => ({
    chiave: nuovaChiave(),
    id: null,
    livello: b.livello,
    titolo: b.titolo,
    testo: conTesti ? (b.testo ?? '') : '',
    figli: daModello(b.figli ?? [], conTesti),
  }))
}

/** Blocchi già salvati da un modello: sono i dati d'esempio con cui la scheda si apre. */
export function salvati(blocchi: readonly BloccoModello[]): Blocco[] {
  return blocchi.map((b) => {
    const id = nuovoId()
    return { chiave: `salvato-${id}`, id, livello: b.livello, titolo: b.titolo, testo: b.testo ?? '', figli: salvati(b.figli ?? []) }
  })
}

/** Ogni blocco dell'albero, dall'alto in basso. */
export function* tutti(albero: readonly Blocco[]): Generator<Blocco> {
  for (const b of albero) {
    yield b
    yield* tutti(b.figli)
  }
}

/** L'albero com'è salvato: due alberi con la stessa impronta si salvano uguali. */
export const impronta = (albero: readonly Blocco[]): string =>
  JSON.stringify(
    albero.map(function forma(b): unknown {
      return [b.id, b.titolo?.id ?? null, b.livello, b.testo, b.figli.map(forma)]
    })
  )

/** Il blocco e tutti quelli che contiene. */
export const conta = (blocco: Blocco): number => 1 + blocco.figli.reduce((n, f) => n + conta(f), 0)

/** Un blocco nell'ordine di stampa, con chi gli sta sopra. */
export interface Voce {
  blocco: Blocco
  padre: Blocco | null
  /** I padri, dal capitolo in giù. */
  antenati: readonly Blocco[]
}

/** Tutti i blocchi nell'ordine di stampa: è l'ordine dell'albero e di «precedente» e «successivo». */
export function inOrdine(albero: readonly Blocco[], antenati: readonly Blocco[] = []): Voce[] {
  return albero.flatMap((blocco) => [
    { blocco, padre: antenati.at(-1) ?? null, antenati },
    ...inOrdine(blocco.figli, [...antenati, blocco]),
  ])
}

/**
 * I livelli che un blocco può avere restando dov'è: il padre ha un livello più
 * basso di numero (senza padre è un capitolo), i figli uno più alto.
 */
export function livelliAmmessi(blocco: Blocco, padre: Blocco | null): Livello[] {
  return ([1, 2, 3] as const).filter(
    (livello) => (padre ? livello > padre.livello : livello === 1) && blocco.figli.every((f) => f.livello > livello)
  )
}

/** I segnaposto citati in un testo che non sono fra quelli che la scheda può citare. */
export function datiSconosciuti(testo: string, citabili: ReadonlySet<string>): string[] {
  return [...testo.matchAll(OGNI_SEGNAPOSTO)]
    .map(([scritto]) => scritto)
    .filter((scritto) => !citabili.has(scritto) && !citabili.has(scritto.replace(/\s+/g, '')))
}

/** Vero se il blocco è ancora da scrivere: senza testo e senza figli. */
export const daScrivere = (blocco: Blocco) => blocco.figli.length === 0 && blocco.testo.trim() === ''

/**
 * Come sta un blocco nell'albero: respinto all'ultimo salvataggio; con un dato
 * che la scheda non può citare; con testo; da scrivere; solo contenitore.
 */
export type SegnoBlocco = 'errore' | 'sconosciuto' | 'testo' | 'vuoto' | 'contenitore'

/** Ciò che l'albero mostra di un blocco: non il suo testo. */
export interface FormaBlocco {
  chiave: string
  titolo: string | null
  livello: Livello
  segno: SegnoBlocco
  /** Ancora da scrivere, qualunque sia il suo segno. */
  vuoto: boolean
  /** Quanti blocchi contiene. */
  dentro: number
  figli: FormaBlocco[]
}

/** La forma dell'albero. `errori` ha per chiave i blocchi respinti. */
export function formaAlbero(
  albero: readonly Blocco[],
  errori: Readonly<Record<string, unknown>>,
  citabili: ReadonlySet<string>
): FormaBlocco[] {
  return albero.map((b) => ({
    chiave: b.chiave,
    titolo: b.titolo?.titolo ?? null,
    livello: b.livello,
    segno:
      b.chiave in errori
        ? 'errore'
        : datiSconosciuti(b.testo, citabili).length > 0
          ? 'sconosciuto'
          : daScrivere(b)
            ? 'vuoto'
            : b.testo.trim() !== ''
              ? 'testo'
              : 'contenitore',
    vuoto: daScrivere(b),
    dentro: conta(b) - 1,
    figli: formaAlbero(b.figli, errori, citabili),
  }))
}

/** Il blocco con quella chiave. */
export function trova(albero: readonly Blocco[], chiave: string): Blocco | undefined {
  for (const b of tutti(albero)) if (b.chiave === chiave) return b
  return undefined
}

// Applica `cambia` all'elenco di fratelli che contiene il blocco. I rami non
// toccati restano lo stesso oggetto.
function neiFratelli(
  albero: readonly Blocco[],
  chiave: string,
  cambia: (fratelli: readonly Blocco[], indice: number) => readonly Blocco[]
): Blocco[] {
  const indice = albero.findIndex((b) => b.chiave === chiave)
  if (indice >= 0) return [...cambia(albero, indice)]
  let toccato = false
  const nuovo = albero.map((b) => {
    if (toccato || b.figli.length === 0) return b
    const figli = neiFratelli(b.figli, chiave, cambia)
    if (figli.length === b.figli.length && figli.every((f, i) => f === b.figli[i])) return b
    toccato = true
    return { ...b, figli }
  })
  return toccato ? nuovo : (albero as Blocco[])
}

/** L'albero con quel blocco cambiato. */
export function cambia(albero: readonly Blocco[], chiave: string, come: (blocco: Blocco) => Blocco): Blocco[] {
  return neiFratelli(albero, chiave, (fratelli, i) => fratelli.map((b, j) => (j === i ? come(b) : b)))
}

/** L'albero con un figlio in più, in fondo a quelli del padre; senza padre è un capitolo in fondo. */
function aggiungi(albero: readonly Blocco[], padre: string | null, nuovo: Blocco): Blocco[] {
  if (padre === null) return [...albero, nuovo]
  return cambia(albero, padre, (b) => ({ ...b, figli: [...b.figli, nuovo] }))
}

/**
 * L'albero col blocco portato a un altro posto fra i suoi fratelli (`indice`, da
 * 0: il posto di arrivo). Fuori dai fratelli si ferma al primo o all'ultimo posto.
 */
function sposta(albero: readonly Blocco[], chiave: string, indice: number): Blocco[] {
  return neiFratelli(albero, chiave, (fratelli, i) => {
    const arrivo = Math.min(fratelli.length - 1, Math.max(0, Math.trunc(indice)))
    if (arrivo === i) return fratelli
    const nuovi = [...fratelli]
    nuovi.splice(arrivo, 0, ...nuovi.splice(i, 1))
    return nuovi
  })
}

/** L'albero senza quel blocco e senza quelli che contiene. */
function togli(albero: readonly Blocco[], chiave: string): Blocco[] {
  return neiFratelli(albero, chiave, (fratelli, i) => fratelli.filter((_b, j) => j !== i))
}

/** L'albero con gli `id` dati ai blocchi nuovi: è ciò che torna da un salvataggio. */
export const conGliId = (albero: readonly Blocco[]): Blocco[] =>
  albero.map((b) => ({ ...b, id: b.id ?? nuovoId(), figli: conGliId(b.figli) }))

// Come si confronta un titolo con ciò che si cerca: senza spazi doppi, maiuscole né accenti.
const perCercare = (testo: string) =>
  testo
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('it')

/** Vero se il titolo contiene ciò che si è scritto nella tendina. */
export const titoloContiene = (titolo: string, cercato: string) => perCercare(titolo).includes(perCercare(cercato))

/** I titoli nell'ordine della tendina di un blocco di quel livello: prima quelli che di solito stanno lì. */
export function titoliPerLivello(titoli: readonly Titolo[], livello: Livello): Titolo[] {
  const abituale = (t: Titolo) => (t.abituale === livello ? 0 : 1)
  return [...titoli].sort((a, b) => abituale(a) - abituale(b) || a.titolo.localeCompare(b.titolo, 'it'))
}

// ── Lo stato di una scheda che si scrive ─────────────────────────────────────

/** Gli errori di un blocco: del titolo (manca) e del testo (quelli del salvataggio). */
export type ErroriBlocco = { titolo?: string; testo?: string[] }
/** Chi deve prendere il fuoco: il titolo o il testo del blocco scelto, o la sua riga nell'albero. */
export type Fuoco = 'titolo' | 'testo' | 'riga'

export interface Stato {
  /** L'albero salvato: è lì che torna «Annulla», ed è col suo che si decide se c'è qualcosa da salvare. */
  base: Blocco[]
  /** L'albero che si vede e si scrive. */
  albero: Blocco[]
  /** Il blocco scelto, quello che si vede a destra: c'è sempre, se la scheda ha blocchi. */
  scelto: string | null
  errori: Record<string, ErroriBlocco>
  /** Chi deve prendere il fuoco: è sempre del blocco scelto. */
  fuoco: Fuoco | null
}

export type Azione =
  | { tipo: 'salvata' }
  | { tipo: 'annulla' }
  | { tipo: 'titolo'; chiave: string; titolo: TitoloBlocco | null; frase: string | null; frasePrima: string | null }
  | { tipo: 'testo'; chiave: string; testo: string }
  | { tipo: 'livello'; chiave: string; livello: Livello }
  | { tipo: 'scegli'; chiave: string; fuoco: Fuoco | null }
  | { tipo: 'aggiungi'; padre: string | null; blocco: Blocco }
  | { tipo: 'sposta'; chiave: string; indice: number }
  | { tipo: 'togli'; chiave: string }
  | { tipo: 'carica'; blocchi: Blocco[] }
  | { tipo: 'respinta'; errori: Record<string, ErroriBlocco> }
  | { tipo: 'fuocoDato' }

/** All'apertura è scelto il primo blocco. */
export function statoDa(albero: Blocco[]): Stato {
  return { base: albero, albero, scelto: albero[0]?.chiave ?? null, errori: {}, fuoco: null }
}

// Un blocco che cambia non è più in errore: il messaggio era per ciò che c'era prima.
function senzaErrori(s: Stato, chiave: string): Stato {
  if (!(chiave in s.errori)) return s
  const errori = { ...s.errori }
  delete errori[chiave]
  return { ...s, errori }
}

/** Il testo di un blocco che è solo la frase predefinita del suo titolo. */
const soloLaFrase = (testo: string, frase: string | null) => frase !== null && testo.trim() === `{{${frase}}}`

/**
 * Il riduttore. Il blocco scelto c'è sempre: quello di prima, se esiste ancora,
 * sennò il primo. Senza blocchi non c'è chi prenda il fuoco.
 */
export function riduci(prima: Stato, a: Azione): Stato {
  const s = prossimo(prima, a)
  if (s.scelto !== null && trova(s.albero, s.scelto)) return s
  const scelto = s.albero[0]?.chiave ?? null
  return { ...s, scelto, fuoco: scelto ? s.fuoco : null }
}

function prossimo(s: Stato, a: Azione): Stato {
  switch (a.tipo) {
    case 'salvata': {
      // I blocchi nuovi ricevono il loro `id`; la chiave resta, e il campo non si rimonta.
      const albero = conGliId(s.albero)
      return { ...s, base: albero, albero, errori: {} }
    }
    case 'annulla':
      return { ...s, albero: s.base, errori: {} }
    case 'titolo':
      return senzaErrori(
        {
          ...s,
          albero: cambia(s.albero, a.chiave, (b) => ({
            ...b,
            titolo: a.titolo,
            // La frase predefinita del titolo entra nel testo se il testo è vuoto, o se è
            // ancora quella del titolo di prima: allora la segue (e sparisce, se il titolo
            // nuovo non ne ha una). Togliere il titolo non tocca il testo.
            testo:
              a.titolo !== null && (b.testo.trim() === '' || soloLaFrase(b.testo, a.frasePrima))
                ? a.frase
                  ? `{{${a.frase}}}`
                  : ''
                : b.testo,
          })),
        },
        a.chiave
      )
    case 'testo':
      if (trova(s.albero, a.chiave)?.testo === a.testo) return s
      return senzaErrori({ ...s, albero: cambia(s.albero, a.chiave, (b) => ({ ...b, testo: a.testo })) }, a.chiave)
    case 'livello': {
      // Solo i livelli che la struttura ammette: il padre più in alto, i figli più in basso.
      const voce = inOrdine(s.albero).find((v) => v.blocco.chiave === a.chiave)
      if (!voce || !livelliAmmessi(voce.blocco, voce.padre).includes(a.livello)) return s
      return senzaErrori({ ...s, albero: cambia(s.albero, a.chiave, (b) => ({ ...b, livello: a.livello })) }, a.chiave)
    }
    case 'scegli':
      return { ...s, scelto: a.chiave, fuoco: a.fuoco }
    case 'aggiungi': {
      // Solo dove ci sta: un capitolo in fondo, gli altri sotto un blocco di livello più alto
      // (i livelli sono tre, e sotto un titoletto non ci sta niente).
      const padre = a.padre === null ? null : trova(s.albero, a.padre)
      if (padre === undefined || (padre ? a.blocco.livello <= padre.livello : a.blocco.livello !== 1)) return s
      // Un blocco nuovo diventa quello scelto, col fuoco sul titolo.
      return { ...s, albero: aggiungi(s.albero, a.padre, a.blocco), scelto: a.blocco.chiave, fuoco: 'titolo' }
    }
    case 'sposta':
      return { ...s, albero: sposta(s.albero, a.chiave, a.indice) }
    case 'togli': {
      const tolto = trova(s.albero, a.chiave)
      if (!tolto) return s
      // Chi aveva il fuoco (il menu della riga, «Elimina il blocco») non c'è più: il fuoco va
      // alla riga scelta. Se sparisce il blocco scelto (o uno dei suoi padri) si sceglie
      // quello prima nell'ordine di stampa, o quello dopo.
      let scelto = s.scelto
      if (scelto && trova([tolto], scelto)) {
        const voci = inOrdine(s.albero)
        const posto = voci.findIndex((v) => v.blocco.chiave === a.chiave)
        scelto = (voci[posto - 1] ?? voci[posto + conta(tolto)])?.blocco.chiave ?? null
      }
      return { ...s, albero: togli(s.albero, a.chiave), scelto, fuoco: 'riga' }
    }
    case 'carica':
      // Lo schema comune (o la copia) entra solo in una scheda vuota: coprirebbe ciò che c'è.
      if (s.albero.length > 0) return s
      // Il bottone premuto sta nello stato vuoto, che sparisce: il fuoco va alla prima riga.
      return { ...s, albero: a.blocchi, scelto: a.blocchi[0]?.chiave ?? null, errori: {}, fuoco: 'riga' }
    case 'respinta': {
      // Il primo blocco respinto, nell'ordine in cui si leggono, diventa quello scelto, col fuoco.
      const primo = [...tutti(s.albero)].find((b) => b.chiave in a.errori)
      return {
        ...s,
        errori: a.errori,
        scelto: primo?.chiave ?? s.scelto,
        fuoco: primo ? (a.errori[primo.chiave].titolo ? 'titolo' : 'testo') : null,
      }
    }
    case 'fuocoDato':
      return s.fuoco ? { ...s, fuoco: null } : s
  }
}

/**
 * Il controllo del salvataggio: ciò che si respinge, blocco per blocco. Un blocco
 * senza titolo, e un testo che cita un dato che la scheda non può citare.
 */
export function controlla(albero: readonly Blocco[], citabili: ReadonlySet<string>): Record<string, ErroriBlocco> {
  // Prima i titoli, che si controllano senza mandare niente: se ne manca uno, il resto aspetta.
  const senzaTitolo = [...tutti(albero)].filter((b) => !b.titolo)
  if (senzaTitolo.length > 0) return Object.fromEntries(senzaTitolo.map((b) => [b.chiave, { titolo: 'Scegli un titolo.' }]))
  const errori: Record<string, ErroriBlocco> = {}
  for (const b of tutti(albero)) {
    const sconosciuti = datiSconosciuti(b.testo, citabili)
    if (sconosciuti.length > 0) {
      errori[b.chiave] = { testo: sconosciuti.map((scritto) => `${scritto}: non è fra i dati che questa scheda può citare.`) }
    }
  }
  return errori
}
