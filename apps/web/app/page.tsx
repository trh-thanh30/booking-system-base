import { Button } from "@repo/ui/button";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-12">
      <div className="max-w-2xl space-y-6">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Monorepo base</p>
        <h1 className="text-4xl font-semibold tracking-normal text-slate-950">Public web app shell</h1>
        <p className="text-base leading-7 text-slate-600">
          Start domain work from a vertical slice: API route, shared contract, UI state, and verification.
        </p>
        <div className="flex items-center gap-3">
          <Button>Primary action</Button>
          <a className="text-sm font-medium text-slate-700 hover:text-slate-950" href={`${apiUrl}/docs`}>
            API docs
          </a>
        </div>
      </div>
    </main>
  );
}
