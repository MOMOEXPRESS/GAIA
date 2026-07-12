"use client";

import { useEffect, useState } from "react";
import { Brain, MessageCircle, Sparkles } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { api, AIWorkspace } from "@/utils/api";

export default function AIPage() {
  const [workspace, setWorkspace] = useState<AIWorkspace | null>(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getAIWorkspace().then(setWorkspace).catch(() => {});
  }, []);

  const send = async () => {
    if (!message.trim() || loading) return;
    const userMsg = message;
    setMessage("");
    setChat((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await api.aiChat(userMsg);
      setChat((prev) => [...prev, { role: "assistant", text: res.response }]);
    } catch {
      setChat((prev) => [...prev, { role: "assistant", text: "Sorry, I couldn't process that request." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-gaia-600" />
          <div>
            <h1 className="font-display text-3xl font-bold text-gaia-950">AI Workspace</h1>
            <p className="text-gaia-700">Your intelligent health companion</p>
          </div>
        </div>

        {workspace && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <section className="rounded-xl border border-gaia-100 bg-white p-4">
              <h2 className="flex items-center gap-2 font-semibold text-gaia-900">
                <Sparkles className="h-4 w-4" /> Recommendations
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-gaia-700">
                {(workspace.recommendations ?? []).slice(0, 3).map((r) => (
                  <li key={r.id}>• {r.title}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-xl border border-gaia-100 bg-white p-4">
              <h2 className="font-semibold text-gaia-900">Memory</h2>
              <ul className="mt-2 space-y-1 text-sm text-gaia-700">
                {(workspace.memories ?? []).slice(0, 3).map((m, i) => (
                  <li key={i}>• {m.content}</li>
                ))}
              </ul>
            </section>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-gaia-100 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gaia-100 px-4 py-3">
            <MessageCircle className="h-5 w-5 text-gaia-600" />
            <h2 className="font-semibold text-gaia-900">Ask Gaia</h2>
          </div>
          <div className="max-h-96 overflow-y-auto p-4 space-y-4">
            {chat.length === 0 && (
              <p className="text-sm text-gaia-600">Ask about sleep, symptoms, wellness habits, or your health goals.</p>
            )}
            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                  msg.role === "user" ? "bg-gaia-600 text-white" : "bg-gaia-50 text-gaia-800"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <p className="text-sm text-gaia-500">Gaia is thinking...</p>}
          </div>
          <div className="flex gap-2 border-t border-gaia-100 p-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="How can I help your health today?"
              className="flex-1 rounded-lg border border-gaia-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={send}
              disabled={loading}
              className="rounded-full bg-gaia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gaia-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
        <p className="mt-4 text-xs text-gaia-500">{workspace?.disclaimer}</p>
      </div>
    </AuthGuard>
  );
}
