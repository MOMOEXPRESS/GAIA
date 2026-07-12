"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/utils/api";
import { ChoiceChips } from "./QuestionTypes/ChoiceChips";
import { ScaleSlider } from "./QuestionTypes/ScaleSlider";

const EVENT_TYPES = [
  "illness", "surgery", "accident", "diagnosis", "symptom_start", "life_event", "recovery",
];
const OUTCOMES = ["resolved", "ongoing", "chronic", "improving", "worsening"];

interface HealthEvent {
  id: string;
  event_type: string;
  description?: string;
  severity?: number;
  outcome?: string;
  tags: string[];
}

export function HealthTimeline({
  events,
  onUpdate,
}: {
  events: HealthEvent[];
  onUpdate: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [eventType, setEventType] = useState("");
  const [severity, setSeverity] = useState(5);
  const [outcome, setOutcome] = useState("ongoing");

  const handleAdd = async () => {
    if (!eventType) return;
    await api.createHealthEvent({
      event_type: eventType,
      severity,
      outcome,
      tags: [],
    });
    setAdding(false);
    setEventType("");
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    await api.deleteHealthEvent(id);
    onUpdate();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gaia-900">Health timeline</h3>
        <button
          type="button"
          onClick={() => setAdding(!adding)}
          className="inline-flex items-center gap-1 rounded-full bg-gaia-100 px-3 py-1 text-sm font-medium text-gaia-700"
        >
          <Plus className="h-4 w-4" /> Add event
        </button>
      </div>

      {adding && (
        <div className="mt-4 space-y-4 rounded-lg border border-gaia-200 p-4">
          <div>
            <p className="mb-2 text-sm font-medium text-gaia-800">Event type</p>
            <ChoiceChips options={EVENT_TYPES} value={eventType} onChange={(v) => setEventType(v as string)} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gaia-800">Severity (1–10)</p>
            <ScaleSlider min={1} max={10} value={severity} onChange={setSeverity} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gaia-800">Outcome</p>
            <ChoiceChips options={OUTCOMES} value={outcome} onChange={(v) => setOutcome(v as string)} />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-full bg-gaia-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Save event
          </button>
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {events.length === 0 && (
          <li className="text-sm text-gaia-600">No health events recorded yet.</li>
        )}
        {events.map((e) => (
          <li key={e.id} className="flex items-center justify-between rounded-lg border border-gaia-100 p-3">
            <div>
              <p className="font-medium capitalize text-gaia-900">{e.event_type.replace(/_/g, " ")}</p>
              <p className="text-sm text-gaia-600">
                Severity: {e.severity ?? "—"} · {e.outcome ?? "—"}
              </p>
            </div>
            <button type="button" onClick={() => handleDelete(e.id)} className="text-gaia-400 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
