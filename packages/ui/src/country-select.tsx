"use client";

import { getAllCountries } from "countries-and-timezones";
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

export type CountrySelectProps = {
  value?: string;
  onChange: (value: string) => void;
  locale?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  "aria-invalid"?: boolean;
};

type CountryOption = {
  code: string;
  englishName: string;
  name: string;
};

function getFlag(code: string) {
  return code
    .toUpperCase()
    .split("")
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
}

function getNames(locale: string) {
  try {
    return new Intl.DisplayNames([locale.startsWith("en") ? "en" : "vi"], {
      type: "region",
    });
  } catch {
    return null;
  }
}

export function CountrySelect({
  value,
  onChange,
  locale = "en",
  disabled,
  id,
  name,
  placeholder = "Select country",
  searchPlaceholder = "Search country...",
  emptyMessage = "No country found.",
  "aria-invalid": ariaInvalid,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const options = useMemo<CountryOption[]>(() => {
    const names = getNames(locale);
    return Object.values(getAllCountries())
      .map((country) => ({
        code: country.id,
        englishName: country.name,
        name: names?.of(country.id) ?? country.name,
      }))
      .sort((left, right) => left.name.localeCompare(right.name, locale));
  }, [locale]);
  const selected = options.find(
    (option) =>
      option.code === value ||
      option.name === value ||
      option.englishName === value,
  );

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
              className={cn(
                "flex min-w-0 items-center gap-2 truncate",
                !selected && "text-muted-foreground",
              )}
            >
              {selected ? (
                <>
                  <span aria-hidden="true">{getFlag(selected.code)}</span>
                  <span className="truncate">{selected.name}</span>
                </>
              ) : (
                placeholder
              )}
            </span>
            <ChevronsUpDown
              aria-hidden="true"
              className="size-4 shrink-0 opacity-60"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-72 p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              {options.map((option) => (
                <CommandItem
                  key={option.code}
                  value={`${option.name} ${option.englishName} ${option.code}`}
                  onSelect={() => {
                    onChange(option.code);
                    setOpen(false);
                  }}
                >
                  <span aria-hidden="true" className="mr-2">
                    {getFlag(option.code)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {option.name}
                    {option.name !== option.englishName ? (
                      <span className="ml-2 text-muted-foreground">
                        {option.englishName}
                      </span>
                    ) : null}
                  </span>
                  <Check
                    aria-hidden="true"
                    className={cn(
                      "ml-2 size-4",
                      selected?.code === option.code
                        ? "opacity-100"
                        : "opacity-0",
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
