"use client";

import { Calendar, CreditCard, MessageSquare, Users } from "lucide-react";
import type { ChallengeMeta, ChallengeId } from "./types/Challenges.types";

const ICON_MAP = {
  calendar: Calendar,
  "credit-card": CreditCard,
  "message-square": MessageSquare,
  users: Users,
};

interface Props {
  challenges: ChallengeMeta[];
  activeId: ChallengeId | null;
  onSelect: (id: ChallengeId) => void;
}

export function ChallengeCards({ challenges, activeId, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-3 w-full select-none">
      {challenges.map((item) => {
        const Icon = ICON_MAP[item.iconName];
        const isActive = item.id === activeId;

        // Custom active icon animations
        let activeAnim = "";
        if (isActive) {
          if (item.tone === "red")
            activeAnim = "animate-[shake_0.5s_ease-in-out]";
          else if (item.tone === "yellow") activeAnim = "animate-bounce";
          else if (item.tone === "blue")
            activeAnim = "animate-[pulse_1s_infinite]";
          else if (item.tone === "purple")
            activeAnim = "animate-[spin_3s_linear_infinite]";
        }

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`group relative grid grid-cols-[auto_1fr_auto] items-center gap-4.5 overflow-hidden rounded-2xl border bg-surface p-4.5 text-left transition-all duration-300 cursor-pointer shadow-sm hover:shadow ${
              isActive
                ? "border-primary ring-[3.5px] ring-primary/8 shadow-md"
                : "border-border hover:border-input/50 hover:translate-x-0.5"
            }`}
          >
            {/* Active left bar */}
            <span
              className={`absolute left-0 top-0 bottom-0 w-[3px] bg-primary transition-transform duration-300 ${
                isActive ? "scale-y-100" : "scale-y-0"
              }`}
            />

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 transition-transform duration-300 ${activeAnim} ${
                item.tone === "red"
                  ? "bg-danger-surface text-danger-surface-foreground ring-danger-100/60"
                  : item.tone === "yellow"
                    ? "bg-warning-surface text-warning-surface-foreground ring-warning-100/60"
                    : item.tone === "blue"
                      ? "bg-accent text-accent-foreground ring-primary-100/60"
                      : "bg-info-surface text-info-surface-foreground ring-info-100/60"
              }`}
            >
              <Icon className="h-4.5 w-4.5 stroke-[1.8]" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-[14.5px] font-extrabold text-foreground tracking-tight">
                {item.title}
              </h3>
              <p className="text-[12px] leading-relaxed text-muted-foreground mt-0.5">
                {item.desc}
              </p>
            </div>

            <span
              className={`text-[13px] font-bold text-primary transition-all duration-300 ${
                isActive
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-1.5 opacity-0"
              }`}
            >
              →
            </span>
          </button>
        );
      })}
    </div>
  );
}
