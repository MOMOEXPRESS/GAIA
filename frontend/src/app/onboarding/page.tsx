"use client";

import { useState } from "react";
import { DisclaimerCard } from "@/components/DisclaimerBanner";

const STEPS = [
  {
    id: "demographics",
    title: "Demographics",
    fields: [
      { key: "age", label: "Age", type: "number" },
      { key: "sex_at_birth", label: "Sex at birth", type: "select", options: ["female", "male", "intersex", "prefer_not_to_say"] },
      { key: "gender_identity", label: "Gender identity", type: "text" },
      { key: "height_cm", label: "Height (cm)", type: "number" },
      { key: "weight_kg", label: "Weight (kg)", type: "number" },
      { key: "blood_type", label: "Blood type", type: "select", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"] },
    ],
  },
  {
    id: "location",
    title: "Location & lifestyle",
    fields: [
      { key: "country", label: "Country", type: "text" },
      { key: "city", label: "City", type: "text" },
      { key: "occupation_type", label: "Occupation type", type: "text" },
      { key: "sedentary_hours", label: "Sedentary hours/day", type: "number" },
      { key: "shift_work", label: "Shift work", type: "checkbox" },
    ],
  },
  {
    id: "social",
    title: "Social & emotional",
    fields: [
      { key: "marital_status", label: "Marital status", type: "text" },
      { key: "household_size", label: "Household size", type: "number" },
      { key: "financial_stress", label: "Financial stress (1-10)", type: "number" },
      { key: "meditation_minutes", label: "Meditation (min/day)", type: "number" },
      { key: "time_in_nature_minutes", label: "Time in nature (min/day)", type: "number" },
    ],
  },
  {
    id: "health_history",
    title: "Health history",
    fields: [
      { key: "current_medications", label: "Current medications", type: "textarea" },
      { key: "allergies", label: "Allergies", type: "textarea" },
      { key: "past_illnesses", label: "Past illnesses", type: "textarea" },
      { key: "family_history", label: "Family history", type: "textarea" },
    ],
  },
];

type FormData = Record<string, string | number | boolean>;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});

  const currentStep = STEPS[step];

  const updateField = (key: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-gaia-950">
        Holistic health profile
      </h1>
      <p className="mt-2 text-gaia-700">
        Step {step + 1} of {STEPS.length}: {currentStep.title}
      </p>

      <div className="mt-4 h-2 rounded-full bg-gaia-100">
        <div
          className="h-2 rounded-full bg-gaia-600 transition-all"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="mt-8 space-y-4">
        {currentStep.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gaia-800">
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                value={(formData[field.key] as string) ?? ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
              />
            ) : field.type === "select" ? (
              <select
                value={(formData[field.key] as string) ?? ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
              >
                <option value="">Select</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <input
                type="checkbox"
                checked={!!formData[field.key]}
                onChange={(e) => updateField(field.key, e.target.checked)}
                className="mt-2 accent-gaia-600"
              />
            ) : (
              <input
                type={field.type}
                value={(formData[field.key] as string | number) ?? ""}
                onChange={(e) =>
                  updateField(
                    field.key,
                    field.type === "number"
                      ? Number(e.target.value)
                      : e.target.value
                  )
                }
                className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
              />
            )}
          </div>
        ))}
      </div>

      <DisclaimerCard className="mt-6" />

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 0}
          className="rounded-full border border-gaia-300 px-6 py-2 text-sm font-medium text-gaia-700 disabled:opacity-40"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-full bg-gaia-600 px-6 py-2 text-sm font-semibold text-white hover:bg-gaia-700"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={() => alert("Profile saved — connect Supabase auth in Week 1")}
            className="rounded-full bg-gaia-600 px-6 py-2 text-sm font-semibold text-white hover:bg-gaia-700"
          >
            Complete profile
          </button>
        )}
      </div>
    </div>
  );
}
