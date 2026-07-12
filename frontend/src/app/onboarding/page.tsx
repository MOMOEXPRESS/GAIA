"use client";

import { ProgressiveQuestionnaire } from "@/components/ProgressiveQuestionnaire";
import { AuthGuard } from "@/components/AuthGuard";
import { DisclaimerCard } from "@/components/DisclaimerBanner";

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <DisclaimerCard className="mx-4 mt-4" />
      <ProgressiveQuestionnaire />
    </AuthGuard>
  );
}
