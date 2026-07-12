"use client";

import clsx from "clsx";

interface ChoiceChipsProps {
  options: string[];
  labels?: Record<string, string>;
  value: string | string[];
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
}

export function ChoiceChips({ options, labels, value, multiple, onChange }: ChoiceChipsProps) {
  const selected = multiple ? (value as string[]) || [] : [value as string];

  const toggle = (opt: string) => {
    if (multiple) {
      const current = (value as string[]) || [];
      if (opt === "none") {
        onChange(["none"]);
        return;
      }
      const without = current.filter((v) => v !== "none" && v !== opt);
      if (current.includes(opt)) {
        onChange(without);
      } else {
        onChange([...without, opt]);
      }
    } else {
      onChange(opt);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={clsx(
            "rounded-full border px-4 py-2 text-sm font-medium transition",
            selected.includes(opt)
              ? "border-gaia-600 bg-gaia-600 text-white"
              : "border-gaia-200 bg-white text-gaia-800 hover:border-gaia-400"
          )}
        >
          {labels?.[opt] ?? opt.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}
