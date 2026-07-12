"use client";

import { useState } from "react";
import { Check, Circle } from "lucide-react";
import { api, Recommendation } from "@/utils/api";

export function TodayFocusCard({ recommendations }: { recommendations: Recommendation[] }) {
  const [items, setItems] = useState(recommendations);

  const toggle = async (id: string, status: string) => {
    await api.updateRecommendation(id, status).catch(() => {});
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-gaia-100 bg-white p-6">
        <h3 className="font-semibold text-gaia-900">Today&apos;s Focus</h3>
        <p className="mt-2 text-sm text-gaia-600">Complete your profile to get personalized daily goals.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gaia-100 bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-gaia-900">Today&apos;s Focus</h3>
      <ul className="mt-4 space-y-3">
        {items.map((rec) => (
          <li key={rec.id} className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => toggle(rec.id, rec.status === "completed" ? "pending" : "completed")}
              className="mt-0.5 text-gaia-500 hover:text-gaia-700"
            >
              {rec.status === "completed" ? <Check className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5" />}
            </button>
            <div>
              <p className={`font-medium ${rec.status === "completed" ? "text-gaia-400 line-through" : "text-gaia-900"}`}>
                {rec.title}
              </p>
              {rec.reason && <p className="text-sm text-gaia-600">{rec.reason}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
