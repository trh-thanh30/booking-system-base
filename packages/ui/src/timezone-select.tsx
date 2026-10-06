"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { cn } from "./lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type TimezoneSelectProps = {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  "aria-invalid"?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
};

function getTimezones() {
  const supportedValuesOf = (
    Intl as typeof Intl & {
      supportedValuesOf?: (key: "timeZone") => string[];
    }
  ).supportedValuesOf;
  return supportedValuesOf?.("timeZone") ?? ["UTC"];
}

function getOffset(timeZone: string) {
  const offset = new Intl.DateTimeFormat("en", {
    timeZone,
    timeZoneName: "longOffset",
  })
    .formatToParts(new Date())
    .find((part) => part.type === "timeZoneName")?.value;
  return offset?.replace("GMT", "UTC") ?? "UTC";
}

function getDisplayName(timeZone: string) {
  return timeZone.replaceAll("_", " ").replaceAll("/", " / ");
}

export function TimezoneSelect({
  value,
  onChange,
  disabled,
  id,
  name,
  "aria-invalid": ariaInvalid,
  placeholder = "Select timezone",
  searchPlaceholder = "Search timezone...",
  emptyMessage = "No timezone found.",
}: TimezoneSelectProps) {
  const [open, setOpen] = useState(false);
  const options = useMemo(
    () =>
      getTimezones().map((timeZone) => ({
        timeZone,
        offset: getOffset(timeZone),
      })),
    [],
  );
  const selected = options.find((option) => option.timeZone === value);

  return (
    <>
      {name ? (
        <input type="hidden" name={name} value={value ?? ""} readOnly />
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            aria-invalid={ariaInvalid}
            className="h-11 w-full justify-between border border-input bg-card px-3 font-normal text-foreground hover:bg-card"
            disabled={disabled}
            id={id}
            role="combobox"
            type="button"
            variant="outline"
          >
            <span
              className={cn("truncate", !selected && "text-muted-foreground")}
            >
              {selected
                ? `${selected.timeZone} (${selected.offset})`
                : placeholder}
            </span>
            <ChevronsUpDown
              aria-hidden="true"
              className="size-4 shrink-0 opacity-60"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-72">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              {options.map((option) => (
                <CommandItem
                  key={option.timeZone}
                  value={`${option.timeZone} ${option.offset}`}
                  onSelect={() => {
                    onChange(option.timeZone);
                    setOpen(false);
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {getDisplayName(option.timeZone)}
                    <span className="ml-2 text-muted-foreground">
                      ({option.offset})
                    </span>
                  </span>
                  <Check
                    aria-hidden="true"
                    className={cn(
                      "ml-2 size-4",
                      value === option.timeZone ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
