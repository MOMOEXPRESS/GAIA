"use client";

import { AlertTriangle } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";

export default function EmergencyPage() {
  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <h1 className="font-display text-3xl font-bold text-gaia-950">Emergency Profile</h1>
        </div>
        <div className="mt-6 rounded-xl border-2 border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-900">In an emergency, call your local emergency number immediately.</p>
          <p className="mt-2 text-sm text-red-800">Gaia is not an emergency service.</p>
        </div>
        <section className="mt-6 rounded-xl border border-gaia-100 bg-white p-6">
          <h2 className="font-semibold text-gaia-900">Critical Information</h2>
          <p className="mt-2 text-sm text-gaia-600">
            Your allergies, medications, and emergency contacts from your profile are available offline in a future PWA update.
            Complete your profile to ensure this information is ready.
          </p>
        </section>
      </div>
    </AuthGuard>
  );
}
