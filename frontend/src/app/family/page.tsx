"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { api } from "@/utils/api";

export default function FamilyPage() {
  const [members, setMembers] = useState<{ id: string; name: string; relationship_type: string }[]>([]);
  const [name, setName] = useState("");
  const [rel, setRel] = useState("partner");

  const load = () => api.listFamily().then(setMembers).catch(() => setMembers([]));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    await api.addFamily({ name, relationship_type: rel });
    setName("");
    load();
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-gaia-600" />
          <h1 className="font-display text-3xl font-bold text-gaia-950">Family</h1>
        </div>
        <div className="mt-6 flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="flex-1 rounded-lg border border-gaia-200 px-3 py-2" />
          <select value={rel} onChange={(e) => setRel(e.target.value)} className="rounded-lg border border-gaia-200 px-3 py-2">
            <option value="partner">Partner</option>
            <option value="child">Child</option>
            <option value="parent">Parent</option>
            <option value="caregiver">Caregiver</option>
          </select>
          <button type="button" onClick={add} className="rounded-full bg-gaia-600 px-4 py-2 text-sm font-semibold text-white">Add</button>
        </div>
        <ul className="mt-6 space-y-3">
          {members.map((m) => (
            <li key={m.id} className="rounded-xl border border-gaia-100 p-4">
              <p className="font-medium text-gaia-900">{m.name}</p>
              <p className="text-sm capitalize text-gaia-600">{m.relationship_type}</p>
            </li>
          ))}
        </ul>
      </div>
    </AuthGuard>
  );
}
