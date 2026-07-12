"use client";

import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Leaf, AlertTriangle, Sparkles } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";

interface Protocol {
  id: string;
  based_on_imbalance: string;
  status: string;
  score: number;
  herbs: { name: string; dosage: string; frequency: string; caution?: string }[];
  nutrition: { meal_type: string; foods: string[]; avoid: string[] }[];
  lifestyle: { activity: string; duration: string; time_of_day: string }[];
}

export default function ProtocolsPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = () => {
    api.listProtocols().then((data) => setProtocols(data as Protocol[])).catch(() => setProtocols([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const symptoms = await api.listSymptoms() as { id: string }[];
      const ids = symptoms.map((s) => s.id);
      await api.generateProtocol(ids);
      load();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-gaia-950">Your protocols</h1>
            <p className="mt-2 text-gaia-700">Natural wellness plans based on your symptom patterns.</p>
          </div>
          <button
            type="button"
            onClick={generate}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-full bg-gaia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gaia-700 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? "Generating..." : "Generate"}
          </button>
        </div>

        {loading ? (
          <p className="mt-8 text-gaia-600">Loading protocols...</p>
        ) : protocols.length === 0 ? (
          <div className="mt-8 rounded-xl border border-gaia-100 bg-white p-8 text-center">
            <Leaf className="mx-auto h-10 w-10 text-gaia-400" />
            <p className="mt-4 text-gaia-600">No protocols yet. Log symptoms, then generate a protocol.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {protocols.map((protocol) => (
              <article key={protocol.id} className="rounded-xl border border-gaia-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gaia-900">{protocol.based_on_imbalance.replace(/_/g, " ")}</h2>
                <p className="text-sm text-gaia-600">Status: {protocol.status} · Match: {Math.round((protocol.score ?? 0) * 100)}%</p>
                {protocol.herbs?.length > 0 && (
                  <section className="mt-4">
                    <h3 className="font-medium text-gaia-800">Herbs</h3>
                    <ul className="mt-2 space-y-2">
                      {protocol.herbs.map((herb) => (
                        <li key={herb.name} className="text-sm text-gaia-700">
                          <strong>{herb.name}</strong> — {herb.dosage}, {herb.frequency}
                          {herb.caution && <span className="ml-2 inline-flex items-center gap-1 text-amber-700"><AlertTriangle className="h-3 w-3" />{herb.caution}</span>}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
