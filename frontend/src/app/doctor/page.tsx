"use client";

import { useEffect, useState } from "react";
import { Stethoscope, User } from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import { DisclaimerCard } from "@/components/DisclaimerBanner";

export default function DoctorPortalPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<{ patient_id: string; display_name: string }[]>([]);
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "doctor") {
      api.getDoctorPatients().then((p) => setPatients(p as { patient_id: string; display_name: string }[])).catch(() => {});
    }
  }, [user]);

  const loadSummary = async (patientId: string) => {
    setSelectedPatient(patientId);
    const s = await api.getPatientSummary(patientId);
    setSummary(s);
  };

  if (user?.role === "doctor") {
    return (
      <AuthGuard>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="font-display text-3xl font-bold text-gaia-950">Doctor Workspace</h1>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section>
              <h2 className="font-semibold text-gaia-900">Patients</h2>
              <ul className="mt-3 space-y-2">
                {patients.length === 0 && <li className="text-sm text-gaia-600">No linked patients yet.</li>}
                {patients.map((p) => (
                  <li key={p.patient_id}>
                    <button type="button" onClick={() => loadSummary(p.patient_id)} className="flex w-full items-center gap-2 rounded-lg border border-gaia-100 p-3 text-left hover:bg-gaia-50">
                      <User className="h-4 w-4" />
                      {p.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
            {summary && (
              <section className="rounded-xl border border-gaia-100 bg-white p-6">
                <h2 className="font-semibold text-gaia-900">AI Patient Summary</h2>
                <pre className="mt-3 whitespace-pre-wrap text-sm text-gaia-700">{summary.summary as string}</pre>
                {(summary.suggested_questions as string[])?.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gaia-800">Suggested questions</h3>
                    <ul className="mt-1 text-sm text-gaia-600">
                      {(summary.suggested_questions as string[]).map((q) => <li key={q}>• {q}</li>)}
                    </ul>
                  </div>
                )}
                <p className="mt-4 text-xs text-gaia-500">{summary.disclaimer as string}</p>
              </section>
            )}
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3">
        <Stethoscope className="h-8 w-8 text-gaia-600" />
        <div>
          <h1 className="font-display text-3xl font-bold text-gaia-950">Practitioner portal</h1>
          <p className="text-gaia-700">AI-powered patient summaries and collaboration</p>
        </div>
      </div>
      <div className="mt-8 space-y-6">
        <DisclaimerCard />
        <ul className="space-y-3 text-gaia-800">
          <li>• AI-generated patient summaries with suggested discussion topics</li>
          <li>• View patient timelines, symptoms, and protocols</li>
          <li>• Approve or modify protocols</li>
          <li>• Secure messaging via share codes</li>
        </ul>
        <Link href="/login" className="inline-block rounded-full bg-gaia-600 px-6 py-2 font-semibold text-white">Sign in as practitioner</Link>
      </div>
    </div>
  );
}
