"use client";

import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Leaf, AlertTriangle } from "lucide-react";

interface Protocol {
  id: string;
  based_on_imbalance: string;
  status: string;
  score: number;
  herbs: { name: string; dosage: string; frequency: string; caution?: string }[];
  nutrition: { meal_type: string; foods: string[]; avoid: string[] }[];
  lifestyle: { activity: string; duration: string; time_of_day: string }[];
  exercise: { type: string; intensity: string; duration: string; frequency: string }[];
  mind_body: { meditation?: string; breathwork?: string; journaling_prompts?: string[] };
}

export default function ProtocolsPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listProtocols()
      .then((data) => setProtocols(data as Protocol[]))
      .catch(() => setProtocols([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-gaia-600">
        Loading protocols...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-gaia-950">
        Your protocols
      </h1>
      <p className="mt-2 text-gaia-700">
        Natural wellness plans based on your symptom patterns.
      </p>

      {protocols.length === 0 ? (
        <div className="mt-8 rounded-xl border border-gaia-100 bg-white p-8 text-center">
          <Leaf className="mx-auto h-10 w-10 text-gaia-400" />
          <p className="mt-4 text-gaia-600">
            No protocols yet. Log symptoms in your journal, then generate a
            protocol from the dashboard.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {protocols.map((protocol) => (
            <article
              key={protocol.id}
              className="rounded-xl border border-gaia-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gaia-900">
                    {protocol.based_on_imbalance.replace(/_/g, " ")}
                  </h2>
                  <p className="text-sm text-gaia-600">
                    Status: {protocol.status} · Match score:{" "}
                    {Math.round(protocol.score * 100)}%
                  </p>
                </div>
              </div>

              {protocol.herbs?.length > 0 && (
                <section className="mt-4">
                  <h3 className="font-medium text-gaia-800">Herbs</h3>
                  <ul className="mt-2 space-y-2">
                    {protocol.herbs.map((herb) => (
                      <li key={herb.name} className="text-sm text-gaia-700">
                        <strong>{herb.name}</strong> — {herb.dosage},{" "}
                        {herb.frequency}
                        {herb.caution && (
                          <span className="ml-2 inline-flex items-center gap-1 text-amber-700">
                            <AlertTriangle className="h-3 w-3" />
                            {herb.caution}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {protocol.nutrition?.length > 0 && (
                <section className="mt-4">
                  <h3 className="font-medium text-gaia-800">Nutrition</h3>
                  {protocol.nutrition.map((n) => (
                    <div key={n.meal_type} className="mt-2 text-sm text-gaia-700">
                      <strong className="capitalize">{n.meal_type}:</strong>{" "}
                      {n.foods.join(", ")}
                      {n.avoid.length > 0 && (
                        <span className="text-gaia-500">
                          {" "}
                          · Avoid: {n.avoid.join(", ")}
                        </span>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {protocol.lifestyle?.length > 0 && (
                <section className="mt-4">
                  <h3 className="font-medium text-gaia-800">Lifestyle</h3>
                  <ul className="mt-2 text-sm text-gaia-700">
                    {protocol.lifestyle.map((l) => (
                      <li key={l.activity}>
                        {l.activity} — {l.duration} ({l.time_of_day})
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
  );
}
