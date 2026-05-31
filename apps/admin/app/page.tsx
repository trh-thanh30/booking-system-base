import { Activity, Settings, Users } from "lucide-react";
import { Card } from "@repo/ui/card";

const sections = [
  { title: "Users", value: "Core", icon: Users },
  { title: "Settings", value: "Ready", icon: Settings },
  { title: "Health", value: "Online", icon: Activity },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Operations shell</h1>
        </header>
        <section className="grid gap-4 md:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title} className="space-y-4">
                <Icon className="h-5 w-5 text-slate-600" />
                <div>
                  <h2 className="text-sm font-medium text-slate-600">{section.title}</h2>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">{section.value}</p>
                </div>
              </Card>
            );
          })}
        </section>
      </div>
    </main>
  );
}
