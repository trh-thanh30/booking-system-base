import { LoaderCircle } from "lucide-react";

export function AuthLoadingState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-lg border px-6 py-10 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <LoaderCircle
          aria-hidden="true"
          className="size-6 animate-spin motion-reduce:animate-none"
        />
      </span>
      <div className="space-y-1.5">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
