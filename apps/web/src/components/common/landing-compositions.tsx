import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Button, Card, cn } from "@repo/ui";
import type { ButtonProps } from "@repo/ui/button";

export function LandingContainer({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-landing px-4 sm:px-6 lg:px-8",
        className,
      )}
      {...props}
    />
  );
}

export function LandingSection({
  className,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={cn("py-section-sm md:py-section scroll-mt-20", className)}
      {...props}
    />
  );
}

export function SectionHeading({
  title,
  description,
  eyebrow,
  align = "center",
}: {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "max-w-prose space-y-4",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow && (
        <p className="text-label font-semibold text-accent-foreground">
          {eyebrow}
        </p>
      )}
      <h2 className="text-heading-2 font-bold tracking-tight sm:text-heading-1">
        {title}
      </h2>
      {description && (
        <p className="text-body text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function MarketingButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      className={cn(
        "min-h-11 rounded-full px-6 text-label font-semibold",
        className,
      )}
      {...props}
    />
  );
}

export function FeatureCard({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Card>) {
  return (
    <Card
      className={cn(
        "p-6 transition-shadow duration-normal hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}

export function PricingCard({
  featured = false,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Card> & { featured?: boolean }) {
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col p-6",
        featured && "border-primary ring-1 ring-primary shadow-md",
        className,
      )}
      {...props}
    />
  );
}

export function TestimonialCard({
  quote,
  author,
  detail,
}: {
  quote: ReactNode;
  author: ReactNode;
  detail?: ReactNode;
}) {
  return (
    <Card className="p-6">
      <figure className="space-y-4">
        <blockquote className="text-body">{quote}</blockquote>
        <figcaption className="text-label font-semibold">
          {author}
          {detail && (
            <span className="mt-1 block text-caption font-normal text-muted-foreground">
              {detail}
            </span>
          )}
        </figcaption>
      </figure>
    </Card>
  );
}
