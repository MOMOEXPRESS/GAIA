"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Brain, ClipboardList, Leaf, Sparkles, User } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { WellnessScoreCard } from "@/components/WellnessScoreCard";
import { LocationHealthCard } from "@/components/LocationHealthCard";
import { DailyBriefingCard } from "@/components/DailyBriefingCard";
import { TodayFocusCard } from "@/components/TodayFocusCard";
import { RecentActivityCard } from "@/components/RecentActivityCard";
import { useAuth } from "@/contexts/AuthContext";
import { api, Briefing, Profile } from "@/utils/api";

const quickActions = [
  { href: "/journal", icon: BookOpen, title: "Log symptom", color: "bg-gaia-50" },
  { href: "/ai", icon: Brain, title: "Ask Gaia", color: "bg-blue-50" },
  { href: "/protocols", icon: Leaf, title: "Protocols", color: "bg-green-50" },
  { href: "/timeline", icon: ClipboardList, title: "Timeline", color: "bg-amber-50" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);

  useEffect(() => {
    api.getProfile().then(setProfile).catch(() => {});
    api.getBriefing().then(setBriefing).catch(() => {});
  }, []);

  const hasProfile = profile?.age && profile?.height_cm;

  return (
    <AuthGuard>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-gaia-950">
              {briefing?.greeting ?? "Welcome"}{user?.display_name ? `, ${user.display_name}` : ""}
            </h1>
            <p className="mt-1 text-gaia-600">Your health command center</p>
          </div>
          {user?.is_demo && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">Demo</span>
          )}
        </div>

        {!hasProfile && (
          <div className="mt-6 rounded-xl border border-gaia-300 bg-gaia-50 p-4">
            <p className="text-gaia-800">Complete your health profile to unlock personalized insights.</p>
            <Link href="/onboarding" className="mt-2 inline-block font-semibold text-gaia-700 underline">
              Start questionnaire →
            </Link>
          </div>
        )}

        {briefing && <DailyBriefingCard briefing={briefing} className="mt-6" />}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <WellnessScoreCard snapshot={briefing?.wellness ?? profile?.wellness_snapshot} />
          {profile?.country_code && (
            <LocationHealthCard countryCode={profile.country_code} context={profile.location_context} />
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <TodayFocusCard recommendations={briefing?.recommendations ?? []} />
          <RecentActivityCard events={briefing?.recent_timeline ?? []} />
        </div>

        <div className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-gaia-900">
            <Sparkles className="h-5 w-5 text-gaia-600" /> Quick actions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`flex items-center gap-3 rounded-xl border border-gaia-100 p-4 transition hover:shadow-md ${action.color}`}
              >
                <action.icon className="h-5 w-5 text-gaia-700" />
                <span className="font-medium text-gaia-800">{action.title}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/profile" className="inline-flex items-center gap-1 text-sm font-medium text-gaia-600 hover:text-gaia-800">
            <User className="h-4 w-4" /> Full profile & settings
          </Link>
        </div>
      </div>
    </AuthGuard>
  );
}
