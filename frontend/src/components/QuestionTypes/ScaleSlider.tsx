"use client";

interface ScaleSliderProps {
  min: number;
  max: number;
  value: number;
  labels?: Record<string, string>;
  onChange: (value: number) => void;
}

export function ScaleSlider({ min, max, value, labels, onChange }: ScaleSliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm text-gaia-600">
        <span>{labels?.[String(min)] ?? min}</span>
        <span className="text-lg font-semibold text-gaia-800">{value}</span>
        <span>{labels?.[String(max)] ?? max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-gaia-600"
      />
    </div>
  );
}
