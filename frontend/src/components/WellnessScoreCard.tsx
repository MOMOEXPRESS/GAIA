"use client";

import { WellnessSnapshot } from "@/utils/api";

const DIMENSION_LABELS: Record<string, { label: string; max: number }> = {
  physical: { label: "Physical", max: 30 },
  mental: { label: "Mental", max: 25 },
  lifestyle: { label: "Lifestyle", max: 20 },
  environmental: { label: "Environment", max: 15 },
};

interface WellnessScoreCardProps {
  snapshot?: WellnessSnapshot;
  compact?: boolean;
}

export function WellnessScoreCard({ snapshot, compact }: WellnessScoreCardProps) {
  if (!snapshot?.overall_score) {
    return (
      <div className="rounded-xl border border-gaia-100 bg-white p-6 text-sm text-gaia-600">
        Complete your health profile to see your wellness estimate.
      </div>
    );
  }

  const dims = snapshot.dimensions ?? { physical: 0, mental: 0, lifestyle: 0, environmental: 0 };

  return (
    <div className="rounded-xl border border-gaia-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gaia-900">Overall Wellness</h3>
          <p className="text-xs text-amber-800">{snapshot.disclaimer}</p>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gaia-100">
          <span className="text-2xl font-bold text-gaia-700">{snapshot.overall_score}</span>
        </div>
      </div>

      {snapshot.bmi && (
        <p className="mt-3 text-sm text-gaia-700">
          BMI: <strong>{snapshot.bmi}</strong> ({snapshot.bmi_category?.replace(/_/g, " ")})
        </p>
      )}

      {!compact && (
        <div className="mt-4 space-y-3">
          {Object.entries(dims).map(([key, val]) => {
            const meta = DIMENSION_LABELS[key] ?? { label: key, max: 25 };
            const pct = Math.round((val / meta.max) * 100);
            return (
              <div key={key}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gaia-800">{meta.label}</span>
                  <span className="text-gaia-600">{val}/{meta.max}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-gaia-100">
                  <div className="h-2 rounded-full bg-gaia-500 transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {snapshot.insights && !compact && (
        <ul className="mt-4 space-y-1 text-sm text-gaia-700">
          {snapshot.insights.map((insight) => (
            <li key={insight}>• {insight}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
