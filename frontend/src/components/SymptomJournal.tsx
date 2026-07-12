"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Camera, AlertTriangle, Save } from "lucide-react";
import { api, ApiError } from "@/utils/api";
import { DisclaimerCard } from "@/components/DisclaimerBanner";

const QUALITY_OPTIONS = [
  "throbbing",
  "stabbing",
  "dull",
  "burning",
  "aching",
  "sharp",
  "tingling",
  "cramping",
  "pressure",
  "pulsating",
];

const BODY_REGIONS = [
  "head",
  "neck",
  "chest",
  "abdomen",
  "back",
  "pelvis",
  "left_arm",
  "right_arm",
  "left_leg",
  "right_leg",
  "whole_body",
];

interface SymptomForm {
  symptom_name: string;
  body_location: { region: string; side: string; description: string };
  quality: string;
  intensity: number;
  duration: string;
  context: string;
  modifiers_better: string;
  modifiers_worse: string;
  accompanying_symptoms: string;
  emotional_state: string;
  user_labels: string;
}

const initialForm: SymptomForm = {
  symptom_name: "",
  body_location: { region: "", side: "", description: "" },
  quality: "",
  intensity: 5,
  duration: "",
  context: "",
  modifiers_better: "",
  modifiers_worse: "",
  accompanying_symptoms: "",
  emotional_state: "",
  user_labels: "",
};

export function SymptomJournal() {
  const [form, setForm] = useState<SymptomForm>(initialForm);
  const [listening, setListening] = useState(false);
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const updateField = <K extends keyof SymptomForm>(
    key: K,
    value: SymptomForm[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const checkSafety = useCallback(async (text: string) => {
    try {
      const result = await api.checkRedFlags(text);
      setRedFlags(result.flags);
      return result.has_red_flags;
    } catch {
      return false;
    }
  }, []);

  const toggleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessage("Voice input is not supported in this browser.");
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ");
      updateField("symptom_name", transcript);
      checkSafety(transcript);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const fullText = [
      form.symptom_name,
      form.context,
      form.accompanying_symptoms,
      form.modifiers_worse,
    ].join(" ");

    const hasFlags = await checkSafety(fullText);
    if (hasFlags) {
      setMessage(
        "Emergency red flags detected. Please seek immediate medical attention."
      );
      setSaving(false);
      return;
    }

    try {
      await api.createSymptom({
        ...form,
        accompanying_symptoms: form.accompanying_symptoms
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        user_labels: form.user_labels
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setForm(initialForm);
      setMessage("Symptom entry saved successfully.");
    } catch (err) {
      setMessage(
        err instanceof ApiError ? err.message : "Failed to save entry."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-gaia-950">
        Symptom Micro-Journal
      </h1>
      <p className="mt-2 text-gaia-700">
        Describe your experience in as much detail as possible. Use voice input
        or type freely.
      </p>

      {redFlags.length > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Emergency warning</p>
            <p className="mt-1 text-sm">
              Detected: {redFlags.join(", ")}. Seek immediate medical care.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gaia-800">
            Symptom description
          </label>
          <div className="mt-1 flex gap-2">
            <textarea
              value={form.symptom_name}
              onChange={(e) => {
                updateField("symptom_name", e.target.value);
                checkSafety(e.target.value);
              }}
              rows={3}
              className="flex-1 rounded-lg border border-gaia-200 px-3 py-2 focus:border-gaia-500 focus:outline-none focus:ring-1 focus:ring-gaia-500"
              placeholder="e.g. dull ache behind left eye, worse with screen time"
              required
            />
            <button
              type="button"
              onClick={toggleVoice}
              className={`rounded-lg px-3 py-2 ${
                listening
                  ? "bg-red-100 text-red-700"
                  : "bg-gaia-100 text-gaia-700"
              }`}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
            >
              {listening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gaia-800">
              Body region
            </label>
            <select
              value={form.body_location.region}
              onChange={(e) =>
                updateField("body_location", {
                  ...form.body_location,
                  region: e.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
            >
              <option value="">Select region</option>
              {BODY_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gaia-800">
              Side
            </label>
            <select
              value={form.body_location.side}
              onChange={(e) =>
                updateField("body_location", {
                  ...form.body_location,
                  side: e.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
            >
              <option value="">N/A</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="bilateral">Bilateral</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gaia-800">
              Precise location
            </label>
            <input
              type="text"
              value={form.body_location.description}
              onChange={(e) =>
                updateField("body_location", {
                  ...form.body_location,
                  description: e.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
              placeholder="behind left eye"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gaia-800">
              Quality
            </label>
            <select
              value={form.quality}
              onChange={(e) => updateField("quality", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
            >
              <option value="">Select quality</option>
              {QUALITY_OPTIONS.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gaia-800">
              Intensity: {form.intensity}/10
            </label>
            <input
              type="range"
              min={0}
              max={10}
              value={form.intensity}
              onChange={(e) =>
                updateField("intensity", Number(e.target.value))
              }
              className="mt-2 w-full accent-gaia-600"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gaia-800">
              Duration
            </label>
            <input
              type="text"
              value={form.duration}
              onChange={(e) => updateField("duration", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
              placeholder="2 hours, 3 days, intermittent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gaia-800">
              Emotional state
            </label>
            <input
              type="text"
              value={form.emotional_state}
              onChange={(e) => updateField("emotional_state", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
              placeholder="anxious, calm, frustrated"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gaia-800">
            Context (what were you doing, eating, thinking?)
          </label>
          <textarea
            value={form.context}
            onChange={(e) => updateField("context", e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gaia-800">
              What makes it better?
            </label>
            <input
              type="text"
              value={form.modifiers_better}
              onChange={(e) => updateField("modifiers_better", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gaia-800">
              What makes it worse?
            </label>
            <input
              type="text"
              value={form.modifiers_worse}
              onChange={(e) => updateField("modifiers_worse", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gaia-800">
            Accompanying symptoms (comma-separated)
          </label>
          <input
            type="text"
            value={form.accompanying_symptoms}
            onChange={(e) =>
              updateField("accompanying_symptoms", e.target.value)
            }
            className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
            placeholder="nausea, light sensitivity"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gaia-800">
            Your labels (comma-separated)
          </label>
          <input
            type="text"
            value={form.user_labels}
            onChange={(e) => updateField("user_labels", e.target.value)}
            className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
            placeholder="migraine, stress headache"
          />
        </div>

        <div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gaia-700">
            <Camera className="h-4 w-4" />
            Photo upload (tongue, skin) — connect Supabase Storage in Week 4
          </label>
          <input
            type="file"
            accept="image/*"
            disabled
            className="mt-1 w-full text-sm text-gaia-500"
          />
        </div>

        <DisclaimerCard />

        <button
          type="submit"
          disabled={saving || redFlags.length > 0}
          className="inline-flex items-center gap-2 rounded-full bg-gaia-600 px-6 py-3 font-semibold text-white transition hover:bg-gaia-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save entry"}
        </button>

        {message && (
          <p className="text-sm text-gaia-700" role="status">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
