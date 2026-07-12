"use client";

import { useEffect, useState } from "react";
import { Pill } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { api } from "@/utils/api";

export default function MedicationsPage() {
  const [meds, setMeds] = useState<{ id: string; name: string; dosage?: string; frequency?: string }[]>([]);
  const [name, setName] = useState("");

  const load = () => api.listMedications().then(setMeds).catch(() => setMeds([]));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    await api.createMedication({ name });
    setName("");
    load();
  };

  const logTaken = async (id: string) => {
    await api.logMedicationAdherence(id, true);
    load();
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3">
          <Pill className="h-8 w-8 text-gaia-600" />
          <h1 className="font-display text-3xl font-bold text-gaia-950">Medications</h1>
        </div>
        <div className="mt-6 flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Medication name" className="flex-1 rounded-lg border border-gaia-200 px-3 py-2" />
          <button type="button" onClick={add} className="rounded-full bg-gaia-600 px-4 py-2 text-sm font-semibold text-white">Add</button>
        </div>
        <ul className="mt-6 space-y-3">
          {meds.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-xl border border-gaia-100 p-4">
              <div>
                <p className="font-medium text-gaia-900">{m.name}</p>
                {m.dosage && <p className="text-sm text-gaia-600">{m.dosage} · {m.frequency}</p>}
              </div>
              <button type="button" onClick={() => logTaken(m.id)} className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">Log taken</button>
            </li>
          ))}
        </ul>
      </div>
    </AuthGuard>
  );
}
