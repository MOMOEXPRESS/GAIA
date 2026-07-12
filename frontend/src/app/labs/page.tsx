"use client";

import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { api } from "@/utils/api";

export default function LabsPage() {
  const [labs, setLabs] = useState<{ id: string; test_name: string; value?: string; unit?: string; test_date?: string }[]>([]);
  const [testName, setTestName] = useState("");
  const [value, setValue] = useState("");

  const load = () => api.listLabs().then(setLabs).catch(() => setLabs([]));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!testName.trim()) return;
    await api.createLab({ test_name: testName, value, test_date: new Date().toISOString().split("T")[0] });
    setTestName("");
    setValue("");
    load();
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-8 w-8 text-gaia-600" />
          <h1 className="font-display text-3xl font-bold text-gaia-950">Lab Results</h1>
        </div>
        <div className="mt-6 flex gap-2">
          <input value={testName} onChange={(e) => setTestName(e.target.value)} placeholder="Test name" className="flex-1 rounded-lg border border-gaia-200 px-3 py-2" />
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" className="w-32 rounded-lg border border-gaia-200 px-3 py-2" />
          <button type="button" onClick={add} className="rounded-full bg-gaia-600 px-4 py-2 text-sm font-semibold text-white">Add</button>
        </div>
        <ul className="mt-6 space-y-3">
          {labs.map((l) => (
            <li key={l.id} className="rounded-xl border border-gaia-100 p-4">
              <p className="font-medium text-gaia-900">{l.test_name}</p>
              <p className="text-sm text-gaia-600">{l.value} {l.unit} · {l.test_date}</p>
            </li>
          ))}
        </ul>
      </div>
    </AuthGuard>
  );
}
