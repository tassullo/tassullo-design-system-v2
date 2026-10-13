/**
 * I dati d'esempio di una «scheda a blocchi»: un albero di capitoli,
 * sottocapitoli e titoletti, ognuno con un testo. Li usano le scene
 * dell'albero, dell'elenco con dettaglio e della pagina d'esempio. Fuori dal
 * registry: nessun item li spedisce.
 */
export type BloccoScheda = {
  id: string
  titolo: string
  testo: string
  figli?: BloccoScheda[]
}

const TESTO =
  '{{famiglia.nome}} è una malta premiscelata conforme alla {{qualifica.norma}}. Si applica a mano o a macchina su supporti puliti e consistenti.'

const blocco = (id: string, titolo: string, testo = TESTO, figli?: BloccoScheda[]): BloccoScheda => ({
  id,
  titolo,
  testo,
  ...(figli ? { figli } : {}),
})

/** Una scheda corta: sei blocchi. */
export const SCHEDA_CORTA: BloccoScheda[] = [
  blocco('descrizione', 'Descrizione'),
  blocco('uso', "Destinazione d'uso"),
  blocco('applicazione', 'Applicazione', '', [
    blocco('supporto', 'Preparazione del supporto'),
    blocco('posa', 'Posa in opera', ''),
  ]),
  blocco('avvertenze', 'Avvertenze'),
]

/** Una scheda lunga: venti blocchi su tre livelli. */
export const SCHEDA_LUNGA: BloccoScheda[] = [
  blocco('descrizione', 'Descrizione'),
  blocco('uso', "Destinazione d'uso"),
  blocco('campo', 'Campo di applicazione'),
  blocco('applicazione', 'Applicazione', '', [
    blocco('supporto', 'Preparazione del supporto', TESTO, [
      blocco('sporchi', 'Supporti sporchi o inconsistenti, con parti in distacco o tracce di vecchie pitture'),
      blocco('assorbenti', 'Supporti molto assorbenti'),
      blocco('bagnati', 'Supporti bagnati'),
      blocco('gesso', 'Supporti a base gesso', ''),
    ]),
    blocco('impasto', "Preparazione dell'impasto", TESTO, [blocco('additivi', 'Additivazioni')]),
    blocco('posa', 'Posa in opera', TESTO, [
      blocco('spessori', 'Spessori di applicazione'),
      blocco('successive', 'Lavorazioni successive', ''),
    ]),
  ]),
  blocco('avvertenze', 'Avvertenze', '', [
    blocco('gelo', 'Protezione dal gelo'),
    blocco('caldo', 'Alte temperature'),
    blocco('vento', 'Vento e pioggia battente', ''),
  ]),
  blocco('stoccaggio', 'Stoccaggio'),
  blocco('capitolato', 'Voce di capitolato'),
]

/** Una scheda da quaranta blocchi: l'albero è più alto della finestra. */
export const SCHEDA_DA_QUARANTA: BloccoScheda[] = [
  ...SCHEDA_LUNGA,
  ...Array.from({ length: 4 }, (_, c) =>
    blocco(`extra-${c}`, `Capitolo aggiunto ${c + 1}`, '', [
      blocco(`extra-${c}-a`, 'Prima parte'),
      blocco(`extra-${c}-b`, 'Seconda parte'),
      blocco(`extra-${c}-c`, 'Terza parte', ''),
      blocco(`extra-${c}-d`, 'Quarta parte'),
    ])
  ),
]

/** I blocchi nell'ordine di lettura, ognuno col suo livello e i suoi padri. */
export function inOrdine(blocchi: BloccoScheda[], padri: BloccoScheda[] = []): { blocco: BloccoScheda; padri: BloccoScheda[] }[] {
  return blocchi.flatMap((b) => [{ blocco: b, padri }, ...inOrdine(b.figli ?? [], [...padri, b])])
}

/** Quanti blocchi contiene un blocco, a ogni livello. */
export const conta = (b: BloccoScheda): number => (b.figli ?? []).reduce((n, f) => n + 1 + conta(f), 0)

/** Sposta un blocco in un altro posto fra i suoi fratelli. */
export function sposta(blocchi: BloccoScheda[], mossa: { id: string; padre: string | null; indice: number }): BloccoScheda[] {
  const riordina = (fratelli: BloccoScheda[]) => {
    const da = fratelli.findIndex((b) => b.id === mossa.id)
    if (da < 0) return fratelli
    const nuovi = [...fratelli]
    nuovi.splice(mossa.indice, 0, ...nuovi.splice(da, 1))
    return nuovi
  }
  if (mossa.padre === null) return riordina(blocchi)
  return blocchi.map((b) =>
    b.id === mossa.padre ? { ...b, figli: riordina(b.figli ?? []) } : b.figli ? { ...b, figli: sposta(b.figli, mossa) } : b
  )
}

/** Cambia un blocco, ovunque sia. */
export function cambia(blocchi: BloccoScheda[], id: string, come: (b: BloccoScheda) => BloccoScheda): BloccoScheda[] {
  return blocchi.map((b) => (b.id === id ? come(b) : b.figli ? { ...b, figli: cambia(b.figli, id, come) } : b))
}

/** Toglie un blocco, coi suoi figli. */
export function togli(blocchi: BloccoScheda[], id: string): BloccoScheda[] {
  return blocchi.filter((b) => b.id !== id).map((b) => (b.figli ? { ...b, figli: togli(b.figli, id) } : b))
}
