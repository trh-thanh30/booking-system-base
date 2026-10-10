import { Skeleton } from "@repo/ui";
import type { BusinessSetupStep } from "@repo/shared";
import { BOOKING_TEMPLATES } from "@repo/shared";

export function SetupLoadingSkeleton({
  label,
  formOnly = false,
  step,
}: {
  label: string;
  formOnly?: boolean;
  step?: BusinessSetupStep;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      className="mx-auto max-w-5xl space-y-8 sm:space-y-12"
    >
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="space-y-8 sm:space-y-10">
        {!formOnly ? (
          <>
            <div className="mx-auto flex max-w-2xl items-center gap-3 sm:gap-6">
              {[0, 1, 2].map((step) => (
                <div
                  key={step}
                  className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6"
                >
                  <div className="flex flex-1 flex-col items-center gap-3">
                    <Skeleton className="size-10 rounded-full motion-reduce:animate-none" />
                    <Skeleton className="h-4 w-full max-w-28 motion-reduce:animate-none" />
                  </div>
                  {step < 2 ? (
                    <Skeleton className="h-0.5 w-6 shrink-0 motion-reduce:animate-none sm:w-12" />
                  ) : null}
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-3 pt-2">
              <Skeleton className="h-4 w-36 motion-reduce:animate-none" />
              <Skeleton className="h-10 w-56 max-w-full motion-reduce:animate-none" />
              <Skeleton className="h-5 w-full max-w-lg motion-reduce:animate-none" />
            </div>
          </>
        ) : null}
        <Skeleton className="h-4 w-60 max-w-full motion-reduce:animate-none" />
        {step === "BOOKING_TEMPLATE" ? (
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BOOKING_TEMPLATES.map((template) => (
              <div
                key={template.id}
                data-template-placeholder
                className="space-y-3 rounded-xl border-2 border-border p-3"
              >
                <Skeleton className="aspect-video w-full motion-reduce:animate-none" />
                <Skeleton className="h-5 w-28 motion-reduce:animate-none" />
                <Skeleton className="h-4 w-full motion-reduce:animate-none" />
                <Skeleton className="h-4 w-3/4 motion-reduce:animate-none" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 7 }, (_, day) => (
              <div
                key={day}
                className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-[1fr_2fr] sm:items-center sm:p-5"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-10 shrink-0 rounded-full motion-reduce:animate-none" />
                  <Skeleton className="h-4 w-24 motion-reduce:animate-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-11 motion-reduce:animate-none" />
                  <Skeleton className="h-11 motion-reduce:animate-none" />
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Skeleton className="h-11 w-full motion-reduce:animate-none sm:w-40" />
          <Skeleton className="h-11 w-full motion-reduce:animate-none sm:w-44" />
        </div>
      </div>
    </div>
  );
}
