import { Button } from "@/registry/tassullo/ui/button"

/* Le classi si scrivono per esteso: Tailwind v4 cerca nomi di classe interi
   nel sorgente, quindi una classe costruita con `bg-${t}` non verrebbe
   generata affatto e la prova renderebbe senza stile. */
const semantiche = [
  { label: "Successo", pieno: "bg-success text-success-foreground", tenue: "bg-success-subtle border-success-border text-success-subtle-foreground" },
  { label: "Avviso", pieno: "bg-warning text-warning-foreground", tenue: "bg-warning-subtle border-warning-border text-warning-subtle-foreground" },
  { label: "Informazione", pieno: "bg-info text-info-foreground", tenue: "bg-info-subtle border-info-border text-info-subtle-foreground" },
  { label: "Errore", pieno: "bg-destructive text-destructive-foreground", tenue: "bg-destructive-subtle border-destructive-border text-destructive-subtle-foreground" },
] as const

export default function App() {
  return (
    <main className="min-h-dvh bg-background p-8 text-foreground">
      <h1 className="text-title font-semibold">Tassullo Design System 2.0</h1>
      <p className="mt-2 max-w-prose text-muted-foreground">
        Workbench di sviluppo del registry. La style guide è Storybook (M0.3):
        questa pagina verifica che il tema Tassullo sia attivo. La pagina
        Palette completa, con click-to-copy, arriva in M1.5.
      </p>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Bottoni</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Il brand, e come NON si usa</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
            bg-primary text-primary-foreground
          </div>
          <div className="rounded-md bg-primary-subtle px-4 py-2 text-accent-ink">
            bg-primary-subtle text-accent-ink
          </div>
          <a href="#" className="text-accent-ink underline">
            Un link usa text-accent-ink, mai text-primary
          </a>
        </div>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          <code>--accent</code> non è il brand: è il grigio di hover dei menu.
          Eccolo, e si vede che è grigio →{" "}
          <span className="rounded-sm bg-accent px-2 py-1 text-accent-foreground">
            bg-accent
          </span>
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Stati semantici, due livelli</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {semantiche.map((s) => (
            <span key={s.label} className={`rounded-sm px-2 py-1 text-sm ${s.pieno}`}>
              {s.label}
            </span>
          ))}
        </div>
        <div className="mt-3 grid gap-2">
          {semantiche.map((s) => (
            <div key={s.label} className={`rounded-md border p-3 ${s.tenue}`}>
              {s.label} — livello tenue, quello degli alert (M2.4).
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Raggi e superfici</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="rounded-sm border border-border bg-card p-3 text-sm shadow-sm">rounded-sm 4px</div>
          <div className="rounded-md border border-border bg-card p-3 text-sm shadow-md">rounded-md 6px</div>
          <div className="rounded-lg border border-border-strong bg-card p-3 text-sm shadow-lg">rounded-lg 10px</div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Sidebar</h2>
        <div className="mt-3 w-64 overflow-hidden rounded-lg bg-sidebar p-2 text-sidebar-foreground">
          <div className="rounded-md px-3 py-2 text-sm">Voce a riposo</div>
          <div className="rounded-md bg-sidebar-accent px-3 py-2 text-sm text-sidebar-accent-foreground">
            Voce attiva
          </div>
        </div>
      </section>

      <section className="mt-6 max-w-page">
        <h2 className="text-xl font-semibold">Scala tipografica</h2>
        <div className="mt-3 space-y-1">
          <p className="text-xs">text-xs 11px</p>
          <p className="text-sm">text-sm 12px</p>
          <p className="text-md">text-md 13px</p>
          <p className="text-base">text-base 14px</p>
          <p className="text-lg">text-lg 15px</p>
          <p className="text-xl">text-xl 18px</p>
          <p className="text-title">text-title 26px</p>
        </div>
      </section>
    </main>
  )
}
