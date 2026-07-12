"use client";

import { useEffect, useState } from "react";
import { Moon } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { api } from "@/utils/api";

export default function SleepPage() {
  const [logs, setLogs] = useState<{ id: string; sleep_date: string; duration_hours?: number; quality_score?: number }[]>([]);
  const [hours, setHours] = useState("7.5");
  const [quality, setQuality] = useState(7);

  const load = () => api.listSleep().then(setLogs).catch(() => setLogs([]));
  useEffect(() => { load(); }, []);

  const add = async () => {
    await api.createSleep({
      sleep_date: new Date().toISOString().split("T")[0],
      duration_hours: parseFloat(hours),
      quality_score: quality,
    });
    load();
  };

  const avg = logs.length ? logs.reduce((s, l) => s + (l.duration_hours ?? 0), 0) / logs.length : 0;

  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3">
          <Moon className="h-8 w-8 text-gaia-600" />
          <h1 className="font-display text-3xl font-bold text-gaia-950">Sleep Insights</h1>
        </div>
        {logs.length > 0 && (
          <p className="mt-4 text-gaia-700">Average sleep: <strong>{avg.toFixed(1)}h</strong> over last {logs.length} nights</p>
        )}
        <div className="mt-6 flex gap-2 items-end">
          <div>
            <label className="text-sm text-gaia-600">Hours</label>
            <input value={hours} onChange={(e) => setHours(e.target.value)} type="number" step="0.5" className="mt-1 w-24 rounded-lg border border-gaia-200 px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gaia-600">Quality (1-10)</label>
            <input value={quality} onChange={(e) => setQuality(Number(e.target.value))} type="number" min={1} max={10} className="mt-1 w-20 rounded-lg border border-gaia-200 px-3 py-2" />
          </div>
          <button type="button" onClick={add} className="rounded-full bg-gaia-600 px-4 py-2 text-sm font-semibold text-white">Log tonight</button>
        </div>
        <ul className="mt-6 space-y-2">
          {logs.map((l) => (
            <li key={l.id} className="flex justify-between rounded-lg border border-gaia-100 p-3 text-sm">
              <span>{l.sleep_date}</span>
              <span>{l.duration_hours}h · Quality {l.quality_score}/10</span>
            </li>
          ))}
        </ul>
      </div>
    </AuthGuard>
  );
}
