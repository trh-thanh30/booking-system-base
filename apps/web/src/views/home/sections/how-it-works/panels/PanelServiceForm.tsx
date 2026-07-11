"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

interface Staff {
  id: string;
  name: string;
}

const SEED_STAFF: Staff[] = [
  { id: "1", name: "Anna" },
  { id: "2", name: "Mia" },
];

export function PanelServiceForm() {
  const [name, setName] = useState("Haircut");
  const [price, setPrice] = useState(25);
  const [duration, setDuration] = useState(45);
  const [staff, setStaff] = useState<Staff[]>(SEED_STAFF);

  const addStaff = () => {
    const n = window.prompt("Staff name:");
    if (!n?.trim()) return;
    setStaff((s) => [
      ...s,
      { id: Math.random().toString(36).substring(2), name: n.trim() },
    ]);
  };

  const removeStaff = (id: string) => {
    setStaff((s) => s.filter((x) => x.id !== id));
  };

  return (
    <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
      <div className="space-y-4">
        <Field label="Service name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="e.g. Haircut"
          />
        </Field>

        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Price (USD)">
            <input
              type="number"
              value={price}
              min={0}
              onChange={(e) => setPrice(Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Duration (min)">
            <input
              type="number"
              value={duration}
              min={5}
              step={5}
              onChange={(e) => setDuration(Number(e.target.value))}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Assign staff">
          <div className="flex flex-wrap gap-1.5 items-center">
            {staff.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-border-light bg-bg-primary pl-2.5 pr-1 py-1 text-[12.5px] shadow-sm animate-chip-in"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-[10px] font-bold text-white uppercase">
                  {s.name[0]}
                </span>
                <span className="font-medium text-text-primary">{s.name}</span>
                <button
                  type="button"
                  onClick={() => removeStaff(s.id)}
                  className="text-text-muted hover:text-danger hover:bg-danger-bg p-0.5 rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={addStaff}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border-light bg-bg-primary px-3 py-1 text-[12.5px] text-text-muted hover:border-brand-blue hover:text-brand-blue cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add staff
            </button>
          </div>
        </Field>
      </div>

      <div>
        <div className="rounded-2xl border border-border-light bg-bg-secondary p-5 shadow-inner">
          <div className="mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-text-muted">
            Live preview
          </div>
          <div className="flex items-start justify-between gap-3 bg-bg-primary p-4 rounded-xl border border-border-light/60 shadow-sm transition-all duration-300">
            <div>
              <div className="text-[17px] font-bold text-text-primary leading-tight">
                {name || "Untitled Service"}
              </div>
              <div className="mt-1 text-[12.5px] text-text-muted">
                {duration} min ·{" "}
                {staff.length > 0
                  ? staff.map((s) => s.name).join(", ")
                  : "No staff assigned"}
              </div>
            </div>
            <div className="rounded-lg bg-brand-blue/10 px-3 py-1 text-[13.5px] font-bold text-brand-blue whitespace-nowrap">
              ${price}
            </div>
          </div>
        </div>
        <p className="mt-3 text-[12px] text-text-muted leading-relaxed">
          💡 Add as many services as you need. Each gets its own customizable
          booking rules and landing page.
        </p>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border-light bg-bg-primary px-3 py-2 text-[13.5px] text-text-primary transition focus:border-brand-blue focus:outline-none focus:ring-[3px] focus:ring-brand-blue/10";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <label className="mb-1.5 text-[12.5px] font-semibold text-text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
