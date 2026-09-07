import { Button } from "@/registry/tassullo/ui/button"

export default function App() {
  return (
    <main className="min-h-dvh bg-background p-8 text-foreground">
      <h1 className="text-2xl font-semibold">Tassullo Design System 2.0</h1>
      <p className="mt-2 max-w-prose text-muted-foreground">
        Workbench di sviluppo del registry. La style guide è Storybook (M0.3):
        questa pagina serve solo a verificare che Tailwind v4 sia attivo e che
        le primitive del registry si importino da <code>@/registry/…</code>.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>

      <p className="mt-6 rounded-md border border-border bg-card p-3 text-sm">
        Palette ancora quella di default di shadcn (neutral): il tema Tassullo
        arriva in FASE 1.
      </p>
    </main>
  )
}
