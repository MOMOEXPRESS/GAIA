"use client";

import { Briefing } from "@/utils/api";

export function DailyBriefingCard({ briefing, className = "" }: { briefing: Briefing; className?: string }) {
  return (
    <div className={`rounded-xl border border-gaia-200 bg-gradient-to-br from-gaia-50 to-white p-6 shadow-sm ${className}`}>
      <h2 className="font-semibold text-gaia-900">Today&apos;s AI Insight</h2>
      <p className="mt-3 text-gaia-800 leading-relaxed">{briefing.ai_insight}</p>
      {briefing.risk_scores && briefing.risk_scores.length > 0 && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          {briefing.risk_scores[0].message}
        </div>
      )}
      <p className="mt-3 text-xs text-gaia-500">{briefing.disclaimer}</p>
    </div>
  );
}
