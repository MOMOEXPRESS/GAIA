"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ClipboardList, Leaf, User } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { WellnessScoreCard } from "@/components/WellnessScoreCard";
import { LocationHealthCard } from "@/components/LocationHealthCard";
import { useAuth } from "@/contexts/AuthContext";
import { api, Profile } from "@/utils/api";

const quickLinks = [
  { href: "/journal", icon: BookOpen, title: "Log symptoms", description: "Add a new micro-journal entry" },
  { href: "/onboarding", icon: ClipboardList, title: "Health profile", description: "Complete or update your intake" },
  { href: "/protocols", icon: Leaf, title: "View protocols", description: "See your natural wellness plans" },
  { href: "/profile", icon: User, title: "Full profile", description: "View and edit everything" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    api.getProfile().then(setProfile).catch(() => {});
  }, []);

  const hasProfile = profile?.age && profile?.height_cm;

  return (
    <AuthGuard>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-gaia-950">
          Welcome{user?.display_name ? `, ${user.display_name}` : ""}
          {user?.is_demo && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-sm font-normal text-amber-800">
              Demo
            </span>
          )}
        </h1>
        <p className="mt-2 text-gaia-700">Your holistic wellness dashboard.</p>

        {!hasProfile && (
          <div className="mt-6 rounded-xl border border-gaia-300 bg-gaia-50 p-4">
            <p className="text-gaia-800">Complete your health profile to unlock wellness insights.</p>
            <Link href="/onboarding" className="mt-2 inline-block font-semibold text-gaia-700 underline">
              Start questionnaire →
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <WellnessScoreCard snapshot={profile?.wellness_snapshot} />
          {profile?.country_code && (
            <LocationHealthCard
              countryCode={profile.country_code}
              context={profile.location_context}
            />
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-gaia-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <link.icon className="h-6 w-6 text-gaia-600" />
              <h2 className="mt-3 font-semibold text-gaia-900">{link.title}</h2>
              <p className="mt-1 text-sm text-gaia-600">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
