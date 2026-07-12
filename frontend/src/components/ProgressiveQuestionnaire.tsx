"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { api, Question } from "@/utils/api";
import { ChoiceChips } from "./QuestionTypes/ChoiceChips";
import { ScaleSlider } from "./QuestionTypes/ScaleSlider";
import { NumberPicker } from "./QuestionTypes/NumberPicker";
import { VoiceNote } from "./QuestionTypes/VoiceNote";
import { CountryPicker } from "./QuestionTypes/CountryPicker";
import { CityPicker } from "./QuestionTypes/CityPicker";
import { LocationHealthCard } from "./LocationHealthCard";

export function ProgressiveQuestionnaire() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const [question, setQuestion] = useState<Question | null>(null);
  const [progress, setProgress] = useState({ answered: 0, total: 24 });
  const [completed, setCompleted] = useState(false);
  const [answer, setAnswer] = useState<unknown>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastVoiceTranscript, setLastVoiceTranscript] = useState<string | undefined>();

  useEffect(() => {
    api.startQuestionnaire().then((res) => {
      setSessionId(res.session_id);
      setQuestion(res.question);
      setProgress(res.progress);
      initAnswer(res.question);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const initAnswer = (q: Question) => {
    if (q.type === "multi_choice") setAnswer([]);
    else if (q.type === "number_picker" || q.type === "scale") setAnswer(q.default ?? q.min ?? 0);
    else setAnswer("");
  };

  const countryCode = (answers["q_country"] as string) || (answer as string);

  const handleSubmit = useCallback(async () => {
    if (!sessionId || !question || submitting) return;
    if (question.type !== "complete" && question.optional && !answer) {
      setSubmitting(true);
      const res = await api.submitAnswer(sessionId, question.id, "");
      setQuestion(res.question);
      setProgress(res.progress);
      setCompleted(res.completed);
      if (res.completed) router.push("/dashboard");
      setSubmitting(false);
      return;
    }
    if (question.type !== "complete" && (answer === "" || answer === null)) return;

    setSubmitting(true);
    try {
      const res = await api.submitAnswer(sessionId, question.id, answer, lastVoiceTranscript);
      setLastVoiceTranscript(undefined);
      setAnswers((prev) => ({ ...prev, [question.id]: answer }));
      setQuestion(res.question);
      setProgress(res.progress);
      setCompleted(res.completed);
      if (res.completed) {
        router.push("/dashboard");
      } else if (res.question) {
        initAnswer(res.question);
      }
    } finally {
      setSubmitting(false);
    }
  }, [sessionId, question, answer, submitting, router]);

  if (loading) {
    return <div className="py-16 text-center text-gaia-600">Loading questionnaire...</div>;
  }

  if (!question) {
    return <div className="py-16 text-center text-gaia-600">Could not load questionnaire.</div>;
  }

  if (question.type === "complete" || completed) {
    return (
      <div className="py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-gaia-900">Profile complete!</h2>
        <p className="mt-2 text-gaia-700">Your wellness snapshot is ready.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mt-6 rounded-full bg-gaia-600 px-8 py-3 font-semibold text-white"
        >
          Go to dashboard
        </button>
      </div>
    );
  }

  const canContinue =
    question.optional ||
    (question.type === "multi_choice" && Array.isArray(answer) && answer.length > 0) ||
    (question.type !== "multi_choice" && answer !== "" && answer !== null);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-2 flex justify-between text-sm text-gaia-600">
        <span className="capitalize">{question.section.replace(/_/g, " ")}</span>
        <span>{progress.answered} / {progress.total}</span>
      </div>
      <div className="h-2 rounded-full bg-gaia-100">
        <div
          className="h-2 rounded-full bg-gaia-600 transition-all"
          style={{ width: `${(progress.answered / progress.total) * 100}%` }}
        />
      </div>

      <h2 className="mt-8 font-display text-2xl font-bold text-gaia-950">{question.question}</h2>

      <div className="mt-6 space-y-4">
        {question.type === "single_choice" && question.options && (
          <ChoiceChips
            options={question.options}
            labels={question.labels}
            value={answer as string}
            onChange={(v) => setAnswer(v)}
          />
        )}
        {question.type === "multi_choice" && question.options && (
          <ChoiceChips
            options={question.options}
            labels={question.labels}
            value={answer as string[]}
            multiple
            onChange={(v) => setAnswer(v)}
          />
        )}
        {question.type === "scale" && (
          <ScaleSlider
            min={question.min ?? 1}
            max={question.max ?? 10}
            value={answer as number}
            labels={question.labels}
            onChange={setAnswer}
          />
        )}
        {question.type === "number_picker" && (
          <NumberPicker
            min={question.min ?? 0}
            max={question.max ?? 100}
            value={answer as number}
            onChange={setAnswer}
          />
        )}
        {question.type === "country_picker" && (
          <>
            <CountryPicker value={answer as string} onChange={setAnswer} />
            {answer && <LocationHealthCard countryCode={answer as string} />}
          </>
        )}
        {question.type === "city_picker" && (
          <CityPicker
            countryCode={countryCode}
            value={answer as string}
            onChange={setAnswer}
          />
        )}

        {question.options && question.type !== "country_picker" && question.type !== "city_picker" && (
          <VoiceNote
            options={question.options}
            labels={question.labels}
            onMatch={(matched) => setAnswer(question.type === "multi_choice" ? [matched] : matched)}
            onTranscript={(text) => setLastVoiceTranscript(text)}
          />
        )}
      </div>

      <div className="mt-10 flex justify-between">
        {question.optional && (
          <button
            type="button"
            onClick={() => { setAnswer(""); handleSubmit(); }}
            className="text-sm text-gaia-600 underline"
          >
            Skip
          </button>
        )}
        <div className="ml-auto">
          <button
            type="button"
            disabled={!canContinue || submitting}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-full bg-gaia-600 px-6 py-3 font-semibold text-white disabled:opacity-40"
          >
            {submitting ? "Saving..." : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
