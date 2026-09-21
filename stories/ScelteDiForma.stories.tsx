import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DatabaseIcon } from 'lucide-react'

import { Button } from '@/registry/tassullo/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/registry/tassullo/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/registry/tassullo/ui/table'
import { ConfirmDialog } from '@/registry/tassullo/blocks/confirm-dialog'
import { DataTable, IntestazioneColonna, creaColonne, type MetaColonna } from '@/registry/tassullo/blocks/data-table'
import { decimale, intero, valuta } from '@/registry/tassullo/lib/numeri'

/**
 * # Prove — le scelte di forma di M4ter.11
 *
 * **Questa sezione è temporanea e va cancellata quando le scelte si chiudono.**
 * Esiste per una ragione sola: una scelta di forma non si decide leggendo una
 * prop, si decide guardando le due forme sugli **stessi dati**. È il
 * precedente di M4.6, che mise le tre tabelle in card in una story `Prove/`
 * e la tolse appena Francesco ebbe scelto.
 *
 * Delle sette scelte in carico a M4ter.11, **cinque hanno già l'alternativa
 * costruita** dove stanno di casa, e si guardano lì:
 *
 * | # | cosa | dove | le due forme |
 * |---|---|---|---|
 * | 1 | il contatore accanto al titolo del percorso | `Blocchi/Intestazione di pagina` | `Contatore Nel Titolo` / `Contatore Come Badge` |
 * | 2 | la prop `descrizione` di `pagina-scheda` | `Pagine/Scheda` | `Con Dati` / `Con Descrizione` |
 * | 5 | il chip col conteggio accanto a «Filtri» | `Primitive/ToggleGroup` | `Filtri contro badge` / `Chip col conteggio` |
 * | 6 | la barra di contesto ruba la scena? | `Blocchi/Barra di contesto` | `Nel Guscio` |
 * | 7 | l'icona Lucide dice quel che diceva l'emoji? | `Blocchi/Barra di contesto` | `Predefinita` / `Altro Contesto` |
 *
 * Qui dentro stanno **le due che l'alternativa non ce l'avevano**: il totale
 * in coda alla tabella (3) e la conferma digitata su un caso vero (4).
 */
const meta = {
  title: 'Prove/Scelte di forma (M4ter.11)',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/* ────────────────────────────────────────────────────────────────────────
 * 3. Il totale in coda alla tabella
 * ──────────────────────────────────────────────────────────────────────── */

type Misurazione = {
  id: string
  voce: string
  ambiente: string
  udm: string
  quantita: number
  importo: number
}

const MISURAZIONI: Misurazione[] = [
  { id: 'm1', voce: '01.02', ambiente: 'Soggiorno piano terra', udm: 'm²', quantita: 42.5, importo: 1_284.5 },
  { id: 'm2', voce: '01.02', ambiente: 'Disimpegno', udm: 'm²', quantita: 8.8, importo: 265.76 },
  { id: 'm3', voce: '02.04', ambiente: 'Bagno padronale', udm: 'm²', quantita: 12.06, importo: 482.4 },
  { id: 'm4', voce: '02.04', ambiente: 'Bagno di servizio', udm: 'm²', quantita: 6.4, importo: 256 },
  { id: 'm5', voce: '03.05', ambiente: 'Facciata nord', udm: 'm²', quantita: 118.2, importo: 4_728 },
  { id: 'm6', voce: '03.05', ambiente: 'Facciata est', udm: 'm²', quantita: 96.4, importo: 3_856 },
]

const somma = (righe: Misurazione[], campo: 'quantita' | 'importo') =>
  righe.reduce((totale, riga) => totale + riga[campo], 0)

const col = creaColonne<Misurazione>()

const COLONNE = col.columns([
  col.accessor('voce', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Voce" />,
    meta: {
      titolo: 'Voce',
      larghezza: 'w-24',
      piede: (righe) => `Totale — ${intero(righe.length)} misurazioni filtrate`,
    } satisfies MetaColonna<Misurazione>,
    sortFn: 'alphanumeric',
  }),
  col.accessor('ambiente', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="Ambiente" />,
    meta: { titolo: 'Ambiente' },
    sortFn: 'text',
  }),
  col.accessor('udm', {
    header: ({ column }) => <IntestazioneColonna colonna={column} titolo="U.M." />,
    meta: { titolo: 'U.M.', larghezza: 'w-16' },
    enableGlobalFilter: false,
  }),
  col.accessor('quantita', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Quantità" allinea="fine" />
    ),
    meta: {
      titolo: 'Quantità',
      larghezza: 'w-28',
      piede: (righe) => (
        <div className="text-right font-semibold">{decimale(somma(righe, 'quantita'))}</div>
      ),
    } satisfies MetaColonna<Misurazione>,
    sortFn: 'basic',
    cell: ({ getValue }) => <div className="text-right">{decimale(getValue<number>())}</div>,
    enableGlobalFilter: false,
  }),
  col.accessor('importo', {
    header: ({ column }) => (
      <IntestazioneColonna colonna={column} titolo="Importo" allinea="fine" />
    ),
    meta: {
      titolo: 'Importo',
      larghezza: 'w-32',
      piede: (righe) => (
        <div className="text-right font-semibold">{valuta(somma(righe, 'importo'))}</div>
      ),
    } satisfies MetaColonna<Misurazione>,
    sortFn: 'basic',
    cell: ({ getValue }) => <div className="text-right">{valuta(getValue<number>())}</div>,
    enableGlobalFilter: false,
  }),
])

function Riquadro({ titolo, nota, children }: { titolo: string; nota: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold">{titolo}</p>
      <p className="text-muted-foreground max-w-prose text-xs">{nota}</p>
      {children}
    </div>
  )
}

/**
 * **Il totale in coda alla tabella — com'è, contro le due alternative.**
 * Stessi dati, stesse colonne, stessi numeri: cambia solo dove il totale è
 * scritto.
 *
 * **(a) `<tfoot>`, la forma di oggi.** Il totale sta **dentro la tabella**,
 * sulle stesse colonne: 10.872,66 € è sotto «Importo» perché è la somma di
 * quella colonna, e non perché qualcuno l'ha messo lì. Con `altezza="ferma"`
 * o `perPagina="virtuale"` porta `sticky bottom-0` e resta in vista mentre le
 * righe scorrono. L'etichetta si fonde sulle colonne che non hanno un totale,
 * o si leggerebbe «Totale — 1…» (difetto preso a video in M4ter.8).
 *
 * **(b) La fascia sotto il riquadro.** Fuori dalla `<table>` le colonne non
 * esistono più, quindi il totale va etichettato a mano e **non è allineato a
 * niente**: per sapere che 10.872,66 € è l'importo bisogna leggere la parola
 * «Importo», non seguire la colonna. In compenso non tocca la tabella, e su
 * una tabella che scorre resta sempre visibile senza `sticky`.
 *
 * **(c) Gli indicatori sopra.** I totali diventano il titolo della vista.
 * Si leggono da lontano e reggono anche numeri che in una cella non ci
 * starebbero — ma si staccano dalla tabella: cambiando un filtro bisogna
 * guardare in due posti diversi per vedere cosa è cambiato.
 *
 * **Da provare, ed è la prova che conta**: scrivi «03.05» nella ricerca. In
 * (a) il totale cambia sotto la colonna; in (b) cambia in una riga di testo;
 * in (c) cambia lontano dalle righe che lo hanno cambiato.
 */
export const IlTotaleInCoda: Story = {
  name: '3 · Il totale in coda alla tabella',
  render: () => (
    <div className="flex flex-col gap-10">
      <Riquadro
        titolo="(a) Il piede dentro la tabella — la forma di oggi"
        nota="Il totale sta sulla stessa colonna che somma. Cambia col filtro e con la ricerca, non con l'ordinamento né con la pagina."
      >
        <DataTable
          colonne={COLONNE}
          dati={MISURAZIONI}
          cerca="Cerca per voce o ambiente…"
          piede
          colonneNascondibili={false}
          piePagina={false}
          nomeRighe={{ singolare: 'misurazione', plurale: 'misurazioni' }}
        />
      </Riquadro>

      <Riquadro
        titolo="(b) La fascia sotto il riquadro"
        nota="Fuori dalla tabella le colonne non ci sono più: il totale va etichettato a parole, e non sta sotto la colonna che somma."
      >
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voce</TableHead>
                  <TableHead>Ambiente</TableHead>
                  <TableHead>U.M.</TableHead>
                  <TableHead className="text-right">Quantità</TableHead>
                  <TableHead className="text-right">Importo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MISURAZIONI.map((riga) => (
                  <TableRow key={riga.id}>
                    <TableCell>{riga.voce}</TableCell>
                    <TableCell>{riga.ambiente}</TableCell>
                    <TableCell>{riga.udm}</TableCell>
                    <TableCell className="text-right">{decimale(riga.quantita)}</TableCell>
                    <TableCell className="text-right">{valuta(riga.importo)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-6 text-sm">
            <span className="text-muted-foreground">
              {intero(MISURAZIONI.length)} misurazioni filtrate
            </span>
            <span>
              Quantità{' '}
              <span className="font-semibold tabular-nums">
                {decimale(somma(MISURAZIONI, 'quantita'))}
              </span>
            </span>
            <span>
              Importo{' '}
              <span className="font-semibold tabular-nums">
                {valuta(somma(MISURAZIONI, 'importo'))}
              </span>
            </span>
          </div>
        </div>
      </Riquadro>

      <Riquadro
        titolo="(c) Gli indicatori sopra la tabella"
        nota="I totali diventano il titolo della vista: si leggono da lontano, ma si staccano dalle righe che li fanno cambiare."
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>Misurazioni filtrate</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {intero(MISURAZIONI.length)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Quantità</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {decimale(somma(MISURAZIONI, 'quantita'))}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Importo</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {valuta(somma(MISURAZIONI, 'importo'))}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voce</TableHead>
                  <TableHead>Ambiente</TableHead>
                  <TableHead>U.M.</TableHead>
                  <TableHead className="text-right">Quantità</TableHead>
                  <TableHead className="text-right">Importo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MISURAZIONI.map((riga) => (
                  <TableRow key={riga.id}>
                    <TableCell>{riga.voce}</TableCell>
                    <TableCell>{riga.ambiente}</TableCell>
                    <TableCell>{riga.udm}</TableCell>
                    <TableCell className="text-right">{decimale(riga.quantita)}</TableCell>
                    <TableCell className="text-right">{valuta(riga.importo)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Riquadro>
    </div>
  ),
}

/* ────────────────────────────────────────────────────────────────────────
 * 4. La conferma digitata, su un caso vero
 * ──────────────────────────────────────────────────────────────────────── */

const CHANGESET = 'CS-2026-0148'

function Esito({ testo }: { testo: string | null }) {
  return (
    <p className="text-muted-foreground text-sm">
      {testo === null ? 'Non ancora confermato.' : `Confermato con: «${testo}»`}
    </p>
  )
}

/**
 * **La conferma digitata, sul caso vero di Anagrafe.**
 *
 * `ChangeSets.tsx` ha oggi due guardie, e sono tutte e due finestre del
 * sistema operativo: `window.confirm('Scrivere queste modifiche su Business
 * Central?')` sul bottone «Applica su Business Central», e
 * `window.prompt('Motivo della respinta:')` su «Respingi». La seconda è già in
 * scena in `Blocchi/Dialogo di conferma → Motivo da scrivere`. **La prima non
 * lo era**, ed è quella che pesa: scrivere su Business Central esce dall'app,
 * e non si disfa da qui.
 *
 * Le tre forme, in ordine di attrito:
 *
 * **(a) Conferma semplice.** È `window.confirm` portato nel tema: due bottoni,
 * niente da digitare. Un clic di troppo e le modifiche sono su Business
 * Central.
 *
 * **(b) Conferma semplice, tono distruttivo.** Stesso attrito, colore diverso.
 * Ma applicare non è *distruggere*: il rosso qui direbbe una cosa che non è, e
 * a forza di rosso su azioni normali il rosso smette di voler dire qualcosa.
 *
 * **(c) Il codice da ricopiare.** Il numero del changeset va scritto a mano:
 * il bottone resta spento finché non c'è scritto esatto. Costa cinque secondi
 * e li costa **a ogni applicazione**, comprese le venti di fila di un
 * pomeriggio di allineamento — che è l'argomento contrario, e va pesato
 * provandolo qui, non immaginandolo.
 *
 * La domanda per Francesco è una sola: **quante volte al giorno si preme quel
 * bottone?** Se sono due, (c). Se sono venti, (a) — e la guardia vera sta
 * altrove, nel fatto che un changeset si applica solo da `approvato`, cioè
 * dopo due livelli di approvazione che l'app già impone.
 */
export const LaConfermaDigitata: Story = {
  name: '4 · La conferma digitata (ChangeSets)',
  render: function Render() {
    const [a, setA] = useState<string | null>(null)
    const [b, setB] = useState<string | null>(null)
    const [c, setC] = useState<string | null>(null)
    return (
      <div className="flex flex-col gap-10">
        <Riquadro
          titolo="(a) Conferma semplice — window.confirm portato nel tema"
          nota="Due bottoni. È l'attrito che ChangeSets ha oggi, con i colori e la tastiera del resto della pagina."
        >
          <div className="flex flex-col items-start gap-3">
            <ConfirmDialog
              titolo="Scrivere queste modifiche su Business Central?"
              descrizione={`Le 14 modifiche di ${CHANGESET} vengono scritte su Business Central. Da qui non si disfano.`}
              conferma="Applica"
              onConferma={() => setA('')}
            >
              <Button>
                <DatabaseIcon />
                Applica su Business Central
              </Button>
            </ConfirmDialog>
            <Esito testo={a} />
          </div>
        </Riquadro>

        <Riquadro
          titolo="(b) Conferma semplice, tono distruttivo"
          nota="Stesso attrito, colore diverso — e applicare non è distruggere: il rosso direbbe una cosa che non è."
        >
          <div className="flex flex-col items-start gap-3">
            <ConfirmDialog
              titolo="Scrivere queste modifiche su Business Central?"
              descrizione={`Le 14 modifiche di ${CHANGESET} vengono scritte su Business Central. Da qui non si disfano.`}
              conferma="Applica"
              tono="distruttivo"
              onConferma={() => setB('')}
            >
              <Button variant="destructive">
                <DatabaseIcon />
                Applica su Business Central
              </Button>
            </ConfirmDialog>
            <Esito testo={b} />
          </div>
        </Riquadro>

        <Riquadro
          titolo="(c) Il codice del changeset da ricopiare"
          nota="Il bottone resta spento finché il campo non contiene CS-2026-0148 esatto. Il valore digitato torna a chi ha chiamato."
        >
          <div className="flex flex-col items-start gap-3">
            <ConfirmDialog
              titolo="Scrivere queste modifiche su Business Central?"
              descrizione={`Le 14 modifiche di ${CHANGESET} vengono scritte su Business Central. Da qui non si disfano.`}
              conferma="Applica"
              campo={{ etichetta: 'Numero del changeset', parolaAttesa: CHANGESET }}
              onConferma={(valore) => setC(valore)}
            >
              <Button>
                <DatabaseIcon />
                Applica su Business Central
              </Button>
            </ConfirmDialog>
            <Esito testo={c} />
          </div>
        </Riquadro>
      </div>
    )
  },
}
