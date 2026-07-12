"use client";

import { WellnessSnapshot } from "@/utils/api";

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
          <h3 className="font-semibold text-gaia-900">Educational wellness estimate</h3>
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
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(dims).map(([key, val]) => (
            <div key={key}>
              <p className="text-xs capitalize text-gaia-500">{key}</p>
              <div className="mt-1 h-2 rounded-full bg-gaia-100">
                <div className="h-2 rounded-full bg-gaia-500" style={{ width: `${val}%` }} />
              </div>
              <p className="mt-0.5 text-sm font-medium text-gaia-800">{val}</p>
            </div>
          ))}
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
