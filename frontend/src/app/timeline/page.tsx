"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { api, TimelineEvent } from "@/utils/api";

const CATEGORIES = ["all", "medical", "wellness", "medication", "symptom"];

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = () => {
    const cat = category === "all" ? undefined : category;
    api.getTimeline(cat).then(setEvents).catch(() => setEvents([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [category]);

  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-gaia-950">Health Timeline</h1>
        <p className="mt-2 text-gaia-700">Your complete health story in one chronological view.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
                category === c ? "bg-gaia-600 text-white" : "bg-gaia-100 text-gaia-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="mt-8 text-gaia-600">Loading timeline...</p>
        ) : events.length === 0 ? (
          <p className="mt-8 text-gaia-600">No events yet. Log symptoms, complete your profile, or add health events to build your timeline.</p>
        ) : (
          <div className="relative mt-8">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gaia-200" />
            <ul className="space-y-6">
              {events.map((e) => (
                <li key={e.id} className="relative pl-10">
                  <div className="absolute left-2.5 top-2 h-3 w-3 rounded-full bg-gaia-500" />
                  <div className="rounded-xl border border-gaia-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gaia-900">{e.title ?? e.event_type}</p>
                        <p className="text-xs capitalize text-gaia-500">
                          {e.category} · {e.source?.replace(/_/g, " ")}
                        </p>
                      </div>
                      <span className="text-xs text-gaia-400">
                        {e.occurred_at ? new Date(e.occurred_at).toLocaleString() : ""}
                      </span>
                    </div>
                    {e.description && <p className="mt-2 text-sm text-gaia-700">{e.description}</p>}
                    {e.ai_summary && <p className="mt-2 text-sm italic text-gaia-600">{e.ai_summary}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
