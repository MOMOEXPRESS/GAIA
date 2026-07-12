"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { api } from "@/utils/api";

export default function PrivacyPage() {
  const [consents, setConsents] = useState<{ type: string; granted: boolean }[]>([]);
  const [dataSummary, setDataSummary] = useState<Record<string, unknown>>({});
  const [auditLog, setAuditLog] = useState<{ action: string; created_at: string }[]>([]);

  useEffect(() => {
    api.getConsents().then((r) => setConsents(r.consents)).catch(() => {});
    api.getDataSummary().then(setDataSummary).catch(() => {});
    api.getAuditLog().then(setAuditLog).catch(() => {});
  }, []);

  const toggle = async (type: string, granted: boolean) => {
    await api.updateConsent(type, granted);
    setConsents((prev) => prev.map((c) => (c.type === type ? { ...c, granted } : c)));
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-gaia-600" />
          <div>
            <h1 className="font-display text-3xl font-bold text-gaia-950">Privacy Center</h1>
            <p className="text-gaia-700">Control your data and how Gaia uses it</p>
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-gaia-100 bg-white p-6">
          <h2 className="font-semibold text-gaia-900">Your Data</h2>
          <p className="mt-2 text-sm text-gaia-600">{dataSummary.message as string}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {["timeline_events", "memories", "symptoms", "protocols"].map((key) => (
              <div key={key} className="rounded-lg bg-gaia-50 p-3 text-center">
                <p className="text-2xl font-bold text-gaia-700">{dataSummary[key] as number ?? 0}</p>
                <p className="text-xs capitalize text-gaia-500">{key.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gaia-100 bg-white p-6">
          <h2 className="font-semibold text-gaia-900">Consent Preferences</h2>
          <ul className="mt-4 space-y-3">
            {consents.map((c) => (
              <li key={c.type} className="flex items-center justify-between">
                <span className="text-sm capitalize text-gaia-800">{c.type.replace(/_/g, " ")}</span>
                <button
                  type="button"
                  onClick={() => toggle(c.type, !c.granted)}
                  className={`relative h-6 w-11 rounded-full transition ${c.granted ? "bg-gaia-600" : "bg-gaia-200"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${c.granted ? "left-5" : "left-0.5"}`} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-xl border border-gaia-100 bg-white p-6">
          <h2 className="font-semibold text-gaia-900">Recent Activity Log</h2>
          <ul className="mt-4 space-y-2">
            {auditLog.length === 0 && <li className="text-sm text-gaia-600">No activity logged yet.</li>}
            {auditLog.map((log, i) => (
              <li key={i} className="flex justify-between text-sm text-gaia-700">
                <span className="capitalize">{log.action.replace(/_/g, " ")}</span>
                <span className="text-gaia-400">{log.created_at ? new Date(log.created_at).toLocaleString() : ""}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AuthGuard>
  );
}
