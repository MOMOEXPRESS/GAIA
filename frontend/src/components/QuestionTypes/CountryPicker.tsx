"use client";

import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { ChoiceChips } from "./ChoiceChips";

interface CountryPickerProps {
  value: string;
  onChange: (code: string) => void;
}

export function CountryPicker({ value, onChange }: CountryPickerProps) {
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    api.listCountries().then(setCountries).catch(() => {});
  }, []);

  const options = countries.map((c) => c.code);
  const labels = Object.fromEntries(countries.map((c) => [c.code, c.name]));

  if (!countries.length) return <p className="text-sm text-gaia-600">Loading countries...</p>;

  return <ChoiceChips options={options} labels={labels} value={value} onChange={(v) => onChange(v as string)} />;
}
