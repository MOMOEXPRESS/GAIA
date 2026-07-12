"use client";

import { Utensils } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";

export default function NutritionPage() {
  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3">
          <Utensils className="h-8 w-8 text-gaia-600" />
          <h1 className="font-display text-3xl font-bold text-gaia-950">Nutrition Hub</h1>
        </div>
        <p className="mt-4 text-gaia-700">Track meals, macros, and hydration. Full meal logging coming in the next update.</p>
        <div className="mt-6 rounded-xl border border-gaia-100 bg-white p-6">
          <h2 className="font-semibold text-gaia-900">Today&apos;s hydration goal</h2>
          <p className="mt-2 text-gaia-600">Drink 2L of water — check off in your daily briefing on the home screen.</p>
        </div>
      </div>
    </AuthGuard>
  );
}
