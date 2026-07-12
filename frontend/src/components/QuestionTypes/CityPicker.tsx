"use client";

import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { ChoiceChips } from "./ChoiceChips";

interface CityPickerProps {
  countryCode: string;
  value: string;
  onChange: (city: string) => void;
}

export function CityPicker({ countryCode, value, onChange }: CityPickerProps) {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (!countryCode) return;
    api.listCities(countryCode).then((r) => setCities(r.cities)).catch(() => {});
  }, [countryCode]);

  if (!countryCode) return <p className="text-sm text-gaia-600">Select a country first.</p>;
  if (!cities.length) return <p className="text-sm text-gaia-600">Loading cities...</p>;

  return (
    <div>
      <ChoiceChips
        options={["", ...cities]}
        labels={{ "": "Skip / not listed" }}
        value={value}
        onChange={(v) => onChange(v as string)}
      />
    </div>
  );
}
