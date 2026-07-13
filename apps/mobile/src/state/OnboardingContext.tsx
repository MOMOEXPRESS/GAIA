/**
 * Onboarding state — progress is saved so onboarding can be paused and resumed
 * (Vol 3 §4.1, Error & Exit Handling). Month 1 keeps state in memory; persistence
 * to encrypted storage follows with the offline layer (Vol 6 §4.4).
 */
import React, { createContext, useContext, useMemo, useState } from 'react';
import type { HealthGoal } from '@gaia/shared-types';

interface OnboardingState {
  firstName: string;
  healthGoals: HealthGoal[];
  connectedSources: string[];
  completed: boolean;
  setFirstName: (name: string) => void;
  toggleHealthGoal: (goal: HealthGoal) => void;
  connectSource: (source: string) => void;
  complete: () => void;
}

const OnboardingContext = createContext<OnboardingState | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [firstName, setFirstName] = useState('');
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([]);
  const [connectedSources, setConnectedSources] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  const value = useMemo<OnboardingState>(
    () => ({
      firstName,
      healthGoals,
      connectedSources,
      completed,
      setFirstName,
      toggleHealthGoal: (goal) =>
        setHealthGoals((prev) =>
          prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
        ),
      connectSource: (source) =>
        setConnectedSources((prev) => (prev.includes(source) ? prev : [...prev, source])),
      complete: () => setCompleted(true),
    }),
    [firstName, healthGoals, connectedSources, completed],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingState {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
