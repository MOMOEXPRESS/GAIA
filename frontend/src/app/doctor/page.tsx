"use client";

import { useState } from "react";
import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { DisclaimerCard } from "@/components/DisclaimerBanner";

export default function DoctorPortalPage() {
  const [tab, setTab] = useState<"overview" | "signup">("overview");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3">
        <Stethoscope className="h-8 w-8 text-gaia-600" />
        <div>
          <h1 className="font-display text-3xl font-bold text-gaia-950">
            Practitioner portal
          </h1>
          <p className="text-gaia-700">Free for licensed wellness practitioners</p>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {(["overview", "signup"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === t
                ? "bg-gaia-600 text-white"
                : "bg-gaia-100 text-gaia-700"
            }`}
          >
            {t === "overview" ? "Overview" : "Sign up"}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="mt-8 space-y-6">
          <DisclaimerCard />
          <div className="rounded-xl border border-gaia-100 bg-white p-6">
            <p className="text-sm font-medium text-amber-800">
              This is a wellness tool, not an EMR. Do not rely on it for clinical
              decisions without independent verification.
            </p>
          </div>
          <ul className="space-y-3 text-gaia-800">
            <li>• View patient timelines, symptom logs, and generated protocols</li>
            <li>• Approve or modify protocols — your version becomes official</li>
            <li>• Secure messaging with patients who link via share code</li>
            <li>• Red-flag alerts for urgent symptoms</li>
            <li>• Export protocols as PDF</li>
          </ul>
        </div>
      ) : (
        <form
          className="mt-8 max-w-md space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Doctor signup — connect Supabase auth with role=doctor");
          }}
        >
          <div>
            <label className="block text-sm font-medium">Full name</label>
            <input type="text" required className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input type="email" required className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">License number</label>
            <input type="text" required className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Specialty</label>
            <input type="text" className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2" />
          </div>
          <button
            type="submit"
            className="rounded-full bg-gaia-600 px-6 py-2 font-semibold text-white hover:bg-gaia-700"
          >
            Create practitioner account
          </button>
        </form>
      )}

      <p className="mt-8 text-sm text-gaia-600">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-gaia-700 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
