"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { api } from "@/utils/api";

interface VoiceNoteProps {
  options: string[];
  labels?: Record<string, string>;
  onMatch: (matched: string) => void;
  onTranscript?: (transcript: string) => void;
}

export function VoiceNote({ options, labels, onMatch, onTranscript }: VoiceNoteProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [matchInfo, setMatchInfo] = useState<{ matched: string | null; confidence: number } | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const toggle = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      onTranscript?.(text);
      try {
        const result = await api.parseVoice(text, options);
        setMatchInfo({ matched: result.matched, confidence: result.confidence });
        if (result.matched) onMatch(result.matched);
      } catch {
        setMatchInfo({ matched: null, confidence: 0 });
      }
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <div className="rounded-lg border border-gaia-200 bg-gaia-50 p-4">
      <button
        type="button"
        onClick={toggle}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
          listening ? "bg-red-100 text-red-700" : "bg-gaia-600 text-white"
        }`}
      >
        {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        {listening ? "Listening..." : "Answer by voice"}
      </button>
      {transcript && (
        <p className="mt-3 text-sm text-gaia-700">
          Heard: &ldquo;{transcript}&rdquo;
        </p>
      )}
      {matchInfo?.matched && (
        <p className="mt-1 text-sm font-medium text-gaia-800">
          Matched: {labels?.[matchInfo.matched] ?? matchInfo.matched.replace(/_/g, " ")} ({Math.round(matchInfo.confidence * 100)}%)
        </p>
      )}
      {matchInfo && !matchInfo.matched && transcript && (
        <p className="mt-1 text-sm text-amber-700">No match — please tap an option above.</p>
      )}
    </div>
  );
}
