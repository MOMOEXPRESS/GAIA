"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { WellnessScoreCard } from "@/components/WellnessScoreCard";
import { LocationHealthCard } from "@/components/LocationHealthCard";
import { HealthTimeline } from "@/components/HealthTimeline";
import { useAuth } from "@/contexts/AuthContext";
import { api, Profile } from "@/utils/api";

function ProfileField({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === "") return null;
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value).replace(/_/g, " ");
  return (
    <div>
      <p className="text-xs font-medium uppercase text-gaia-500">{label}</p>
      <p className="text-sm capitalize text-gaia-900">{display}</p>
    </div>
  );
}

function ListField({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase text-gaia-500">{label}</p>
      <p className="text-sm text-gaia-900">{items.map((i) => i.replace(/_/g, " ")).join(", ")}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<{ id: string; event_type: string; severity?: number; outcome?: string; tags: string[] }[]>([]);

  const load = useCallback(() => {
    api.getProfile().then(setProfile).catch(() => {});
    api.listHealthEvents().then(setEvents).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!profile) {
    return (
      <AuthGuard>
        <div className="py-16 text-center text-gaia-600">Loading profile...</div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-gaia-950">Your profile</h1>
            <p className="mt-1 text-gaia-700">{user?.email}</p>
            {user?.is_demo && (
              <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Demo account</span>
            )}
          </div>
          <Link
            href="/onboarding"
            className="rounded-full border border-gaia-300 px-4 py-2 text-sm font-medium text-gaia-700 hover:bg-gaia-50"
          >
            Edit via questionnaire
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <WellnessScoreCard snapshot={profile.wellness_snapshot} />
          {profile.country_code && (
            <LocationHealthCard countryCode={profile.country_code} context={profile.location_context} />
          )}
        </div>

        <section className="mt-8 rounded-xl border border-gaia-100 bg-white p-6">
          <h2 className="font-semibold text-gaia-900">Demographics</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <ProfileField label="Age" value={profile.age} />
            <ProfileField label="Sex at birth" value={profile.sex_at_birth} />
            <ProfileField label="Ethnicity" value={profile.ethnicity} />
            <ProfileField label="Blood type" value={profile.blood_type} />
            <ProfileField label="Height (cm)" value={profile.height_cm} />
            <ProfileField label="Weight (kg)" value={profile.weight_kg} />
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gaia-100 bg-white p-6">
          <h2 className="font-semibold text-gaia-900">Location</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <ProfileField label="Country" value={profile.country} />
            <ProfileField label="City" value={profile.city} />
            <ProfileField label="Climate zone" value={profile.climate_zone} />
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gaia-100 bg-white p-6">
          <h2 className="font-semibold text-gaia-900">Self-reported wellness indicators</h2>
          <p className="text-xs text-amber-800">Not a clinical mental health assessment.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <ProfileField label="Mood frequency" value={profile.mood_frequency} />
            <ProfileField label="Sleep quality" value={profile.sleep_quality} />
            <ProfileField label="Anxiety frequency" value={profile.anxiety_frequency} />
            <ProfileField label="Financial stress" value={profile.financial_stress} />
            <ProfileField label="Social support" value={profile.social_support_index} />
            <ProfileField label="Sense of purpose" value={profile.sense_of_purpose_score} />
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gaia-100 bg-white p-6">
          <h2 className="font-semibold text-gaia-900">Lifestyle</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <ProfileField label="Occupation" value={profile.occupation_type} />
            <ProfileField label="Sedentary hours/day" value={profile.sedentary_hours} />
            <ProfileField label="Shift work" value={profile.shift_work} />
            <ProfileField label="Meditation (min/day)" value={profile.meditation_minutes} />
            <ProfileField label="Time in nature (min/day)" value={profile.time_in_nature_minutes} />
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gaia-100 bg-white p-6">
          <h2 className="font-semibold text-gaia-900">Health history</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ListField label="Past illnesses" items={profile.past_illnesses} />
            <ListField label="Current medications" items={profile.current_medications} />
            <ListField label="Allergies" items={profile.allergies} />
            <ListField label="Family history" items={profile.family_history} />
            <ListField label="Health goals" items={profile.health_goals} />
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gaia-100 bg-white p-6">
          <h2 className="font-semibold text-gaia-900">Health modules</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { href: "/timeline", label: "Timeline" },
              { href: "/medications", label: "Medications" },
              { href: "/labs", label: "Labs" },
              { href: "/sleep", label: "Sleep" },
              { href: "/nutrition", label: "Nutrition" },
              { href: "/family", label: "Family" },
              { href: "/emergency", label: "Emergency" },
              { href: "/privacy", label: "Privacy Center" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="rounded-full bg-gaia-100 px-4 py-1.5 text-sm font-medium text-gaia-700 hover:bg-gaia-200">
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gaia-100 bg-white p-6">
          <HealthTimeline events={events} onUpdate={load} />
        </section>

        {profile.voice_notes && profile.voice_notes.length > 0 && (
          <section className="mt-6 rounded-xl border border-gaia-100 bg-white p-6">
            <h2 className="font-semibold text-gaia-900">Voice notes</h2>
            <ul className="mt-4 space-y-2">
              {profile.voice_notes.map((note, i) => (
                <li key={i} className="text-sm text-gaia-700">
                  <span className="font-medium">{note.question_id}:</span> {note.transcript}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AuthGuard>
  );
}
