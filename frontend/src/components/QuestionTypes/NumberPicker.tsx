"use client";

interface NumberPickerProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
}

export function NumberPicker({ min, max, value, onChange, unit }: NumberPickerProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-gaia-300 text-xl font-bold text-gaia-700 hover:bg-gaia-50"
      >
        −
      </button>
      <div className="text-center">
        <span className="text-4xl font-bold text-gaia-900">{value}</span>
        {unit && <span className="ml-1 text-gaia-600">{unit}</span>}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-gaia-300 text-xl font-bold text-gaia-700 hover:bg-gaia-50"
      >
        +
      </button>
    </div>
  );
}
