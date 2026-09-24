/**
 * `tassullo-rich-text-editor` — barra ridotta, contenuto serializzato in
 * modo stabile, contatore col limite di BC (2048 caratteri per campo).
 *
 * ── D8: la libreria, terza scelta ─────────────────────────────────────────
 *
 * Chiesto all'MCP prima di scrivere (regola 4bis, gradino 1): shadcn non ha
 * un `editor` o `rich-text` — solo `toggle`/`toggle-group`, che qui si
 * riusano per la barra, e `popover`, riusato per l'inserimento del link.
 *
 * `@tiptap/react` è la scelta, e per lo stesso motivo di `react-dropzone` e
 * `react-pdf`: è **headless**. `useEditor` restituisce un'istanza su cui si
 * legge lo stato (`editor.isActive('bold')`) e si comandano i cambi
 * (`editor.chain().focus().toggleBold().run()`) — nessuna barra strumenti di
 * libreria da disfare, quindi la forma resta interamente nostra.
 *
 * **La barra ridotta non è un vincolo di stile: è lo schema del documento.**
 * `StarterKit` porta di suo titoli, citazioni, codice, riga orizzontale e
 * sottolineato — tutti spenti qui (`heading`, `blockquote`, `codeBlock`,
 * `horizontalRule`, `underline`, `code`: `false`). Non è solo che la barra
 * non li offre: **lo schema del documento non li accetta**, quindi un testo
 * incollato da Word che porta uno di questi non lo trascina dentro
 * "declassato" — ProseMirror lo scarta per costruzione, alla riga di analisi
 * dell'HTML incollato, senza bisogno di una pulizia scritta a mano. È la
 * stessa idea di §Regola permanente applicata allo schema anziché al CSS:
 * quello che il documento non sa rappresentare non sopravvive all'incolla.
 * `link` (con `openOnClick: false`, si legge non si segue da dentro
 * l'editor), `superscript` e `subscript` (`@tiptap/extension-superscript`,
 * `@tiptap/extension-subscript`, nessuno dei due in `StarterKit`) restano
 * gli unici marcatori oltre a grassetto e corsivo. Le due non si escludono
 * a vicenda di loro (nessuna `excludes` nella loro configurazione di
 * fabbrica): un testo può finire con **entrambi** i marcatori applicati,
 * cosa che non ha un significato tipografico. Non corretto qui — servirebbe
 * un mark proprio con `excludes` scritto a mano, un costo che il caso d'uso
 * (apice/pedice di formule o unità di misura, non testo matematico vero)
 * non giustifica — ma è il motivo per cui c'è un bottone "Rimuovi
 * formattazione" (`unsetAllMarks`): la via d'uscita quando capita.
 *
 * ── La serializzazione stabile ────────────────────────────────────────────
 *
 * Il valore che entra ed esce da questo componente è **JSON**, non HTML:
 * `JSON.stringify(editor.getJSON())`. Il documento di ProseMirror è un
 * albero con un ordine di chiavi fisso per costruzione (lo schema lo
 * definisce), quindi lo stesso contenuto produce sempre la stessa stringa —
 * la condizione che "serializzato in modo stabile" chiede, e che l'HTML non
 * garantirebbe da sé (l'ordine degli attributi, le entità, gli spazi non
 * sono normati). Chi consuma questo valore per il solo confronto (un
 * `diff-view`, M3.9) lo fa su questa stringa.
 *
 * ── Il limite di BC ────────────────────────────────────────────────────────
 *
 * `@tiptap/extension-character-count`, `mode: 'textSize'`: conta i caratteri
 * del testo, non i marcatori — lo stesso significato di `z.string().max(2048)`
 * su `form-field` (M3.4). Il contatore cambia colore prima del limite, non
 * solo al limite: `text-warning-subtle-foreground` da 50 caratteri residui,
 * `text-destructive-subtle-foreground` a zero — è "si vede prima di
 * sbatterci contro", non "si scopre quando è già successo". Oltre il limite
 * l'estensione impedisce la digitazione; `autoTrim` (default) tronca un
 * incolla che lo sfonda invece di rifiutarlo in silenzio.
 */
"use client"

import * as React from "react"
import { EditorContent, useEditor, type Editor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { CharacterCount } from "@tiptap/extension-character-count"
import { Superscript } from "@tiptap/extension-superscript"
import { Subscript } from "@tiptap/extension-subscript"
import {
  BoldIcon,
  EraserIcon,
  ItalicIcon,
  LinkIcon,
  Link2OffIcon,
  ListIcon,
  ListOrderedIcon,
  SubscriptIcon,
  SuperscriptIcon,
} from "lucide-react"

import { cn } from "cn"
import { Button } from "@/registry/tassullo/ui/button"
import { Input } from "@/registry/tassullo/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/tassullo/ui/popover"
import { Separator } from "@/registry/tassullo/ui/separator"
import { Toggle } from "@/registry/tassullo/ui/toggle"

export type RichTextEditorProps = {
  /** JSON serializzato (`JSON.stringify(editor.getJSON())`), non HTML. Controllato. */
  value?: string
  /** Come `value`, ma non controllato — l'editor tiene lo stato da sé. */
  defaultValue?: string
  onChange?: (value: string) => void
  /** Caratteri di testo, marcatori esclusi. Il limite di BC è 2048. */
  limite?: number
  placeholder?: string
  disabilitato?: boolean
  /** Etichetta accessibile dell'area di modifica. */
  etichetta?: string
  className?: string
}

function serializza(editor: Editor) {
  return JSON.stringify(editor.getJSON())
}

function BarraStrumenti({ editor }: { editor: Editor }) {
  const [urlLink, setUrlLink] = React.useState("")
  const [popoverAperto, setPopoverAperto] = React.useState(false)

  const linkAttivo = editor.isActive("link")

  return (
    <div
      data-slot="rich-text-editor-toolbar"
      role="toolbar"
      aria-label="Formattazione"
      className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-input bg-muted/40 p-1"
    >
      <Toggle
        size="sm"
        aria-label="Grassetto"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().toggleBold()}
      >
        <BoldIcon />
      </Toggle>
      <Toggle
        size="sm"
        aria-label="Corsivo"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().toggleItalic()}
      >
        <ItalicIcon />
      </Toggle>
      <Toggle
        size="sm"
        aria-label="Apice"
        pressed={editor.isActive("superscript")}
        onPressedChange={() =>
          editor.chain().focus().toggleSuperscript().run()
        }
        disabled={!editor.can().toggleSuperscript()}
      >
        <SuperscriptIcon />
      </Toggle>
      <Toggle
        size="sm"
        aria-label="Pedice"
        pressed={editor.isActive("subscript")}
        onPressedChange={() =>
          editor.chain().focus().toggleSubscript().run()
        }
        disabled={!editor.can().toggleSubscript()}
      >
        <SubscriptIcon />
      </Toggle>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <Toggle
        size="sm"
        aria-label="Elenco puntato"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() =>
          editor.chain().focus().toggleBulletList().run()
        }
        disabled={!editor.can().toggleBulletList()}
      >
        <ListIcon />
      </Toggle>
      <Toggle
        size="sm"
        aria-label="Elenco numerato"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() =>
          editor.chain().focus().toggleOrderedList().run()
        }
        disabled={!editor.can().toggleOrderedList()}
      >
        <ListOrderedIcon />
      </Toggle>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <Popover
        open={popoverAperto}
        onOpenChange={(aperto) => {
          setPopoverAperto(aperto)
          if (aperto) setUrlLink(editor.getAttributes("link").href ?? "")
        }}
      >
        <PopoverTrigger
          render={
            <Toggle size="sm" aria-label="Collegamento" pressed={linkAttivo} />
          }
        >
          <LinkIcon />
        </PopoverTrigger>
        <PopoverContent
          className="w-64"
          aria-label={linkAttivo ? "Modifica collegamento" : "Inserisci collegamento"}
        >
          <form
            className="flex items-center gap-1.5"
            onSubmit={(evento) => {
              evento.preventDefault()
              if (!urlLink) return
              editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: urlLink })
                .run()
              setPopoverAperto(false)
            }}
          >
            <Input
              autoFocus
              type="url"
              inputMode="url"
              placeholder="https://…"
              aria-label="Indirizzo del collegamento"
              value={urlLink}
              onChange={(evento) => setUrlLink(evento.target.value)}
            />
            <Button type="submit" size="sm" disabled={!urlLink}>
              Applica
            </Button>
            {linkAttivo ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Rimuovi collegamento"
                onClick={() => {
                  editor.chain().focus().extendMarkRange("link").unsetLink().run()
                  setPopoverAperto(false)
                }}
              >
                <Link2OffIcon />
              </Button>
            ) : null}
          </form>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Rimuovi formattazione"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      >
        <EraserIcon />
      </Button>
    </div>
  )
}

function Contatore({ editor, limite }: { editor: Editor; limite: number }) {
  const caratteri = editor.storage.characterCount.characters() as number
  const residui = limite - caratteri

  return (
    <div
      data-slot="rich-text-editor-counter"
      className={cn(
        "px-2.5 py-1 text-right text-sm tabular-nums text-muted-foreground",
        residui <= 0 && "text-destructive-subtle-foreground",
        residui > 0 && residui <= 50 && "text-warning-subtle-foreground"
      )}
    >
      {caratteri}/{limite}
    </div>
  )
}

export function RichTextEditor({
  value,
  defaultValue,
  onChange,
  limite = 2048,
  placeholder,
  disabilitato,
  etichetta = "Testo formattato",
  className,
}: RichTextEditorProps) {
  const contenutoIniziale = React.useMemo(() => {
    const sorgente = value ?? defaultValue
    if (!sorgente) return ""
    try {
      return JSON.parse(sorgente)
    } catch {
      return ""
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Cosa abbiamo emesso noi per ultimo, non cosa dice `editor` in questo
   * istante. `shouldRerenderOnTransaction` fa ri-renderizzare questo
   * componente **appena** la transazione arriva — un giro prima che
   * `onChange` risalga a `value` attraverso lo stato del chiamante. In
   * quella finestra `value` è ancora il vecchio, l'effetto sotto lo
   * confronterebbe con `editor` (già aggiornato) troverebbe una differenza e
   * richiamerebbe `setContent` con il valore vecchio — cancellando il
   * carattere appena digitato. Confrontare con "l'ultimo che abbiamo
   * emesso noi", aggiornato in modo sincrono dentro `onUpdate`, non ha
   * questa finestra: un giro di rendering non lo sposta.
   */
  const ultimoEmesso = React.useRef(value ?? defaultValue)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        underline: false,
        code: false,
        link: { openOnClick: false, autolink: true },
      }),
      Superscript,
      Subscript,
      CharacterCount.configure({ limit: limite, mode: "textSize" }),
    ],
    content: contenutoIniziale,
    editable: !disabilitato,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": etichetta,
      },
    },
    onUpdate: ({ editor }) => {
      const serializzato = serializza(editor)
      ultimoEmesso.current = serializzato
      onChange?.(serializzato)
    },
    immediatelyRender: false,
    /**
     * `BarraStrumenti`/`Contatore` leggono `editor.isActive(...)` e
     * `editor.storage.characterCount` a ogni render di *questo* componente:
     * senza questa opzione `useEditor` non fa ri-renderizzare su ogni
     * transazione (di suo, di default, per le prestazioni) e lo stato del
     * marcatore attivo o del contatore resterebbe quello del primo render.
     */
    shouldRerenderOnTransaction: true,
  })

  React.useEffect(() => {
    if (!editor || value === undefined) return
    if (value === ultimoEmesso.current) return
    let contenuto: object | string
    try {
      contenuto = JSON.parse(value)
    } catch {
      return
    }
    ultimoEmesso.current = value
    editor.commands.setContent(contenuto)
  }, [editor, value])

  React.useEffect(() => {
    editor?.setEditable(!disabilitato)
  }, [editor, disabilitato])

  if (!editor) return null

  return (
    <div
      data-slot="rich-text-editor"
      data-disabled={disabilitato ? "" : undefined}
      className={cn("flex flex-col", className)}
    >
      <BarraStrumenti editor={editor} />
      <div className="relative">
        {placeholder && editor.isEmpty ? (
          <span
            aria-hidden="true"
            data-slot="rich-text-editor-placeholder"
            className="pointer-events-none absolute top-1.5 left-2.5 text-sm text-muted-foreground select-none"
          >
            {placeholder}
          </span>
        ) : null}
        <EditorContent
          editor={editor}
          data-slot="rich-text-editor-content"
          className={cn(
            "min-h-24 rounded-b-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30",
            "[&_.tiptap]:outline-none",
            "[&_p]:my-1 first:[&_p]:mt-0 last:[&_p]:mb-0",
            "[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5",
            "[&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5",
            "[&_a]:text-accent-ink [&_a]:underline [&_a]:underline-offset-2",
            disabilitato && "cursor-not-allowed opacity-50"
          )}
        />
      </div>
      <Contatore editor={editor} limite={limite} />
    </div>
  )
}
