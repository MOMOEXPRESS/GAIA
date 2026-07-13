/**
 * Identity & Auth models.
 * Blueprint: Vol 5 §14 (Authentication & Authorization), Vol 6 §5.4 (Identity & Auth Service).
 */

/** RBAC roles embedded in JWT claims and validated by every service (Vol 5 §14). */
export type UserRole = 'patient' | 'doctor' | 'caregiver' | 'admin';

export interface User {
  id: string;
  email: string;
  /** First name only is collected during onboarding (Vol 3 §4.1 Step 2). */
  firstName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * Onboarding health goals (Vol 3 §4.1 Step 3 — "What brings you to Gaia?").
 * Multiple selections are allowed; they seed the initial dashboard configuration.
 */
export type HealthGoal =
  | 'understand_my_health'
  | 'manage_a_condition'
  | 'improve_fitness'
  | 'support_mental_wellness'
  | 'track_family_health'
  | 'just_explore';

export interface UserProfile {
  userId: string;
  healthGoals: HealthGoal[];
  /** Selected via the optional condition tag cloud; "I'd rather not say" yields an empty list. */
  managedConditions: string[];
  /** Vol 7 §7.1 — drives vocabulary and depth of AI explanations. */
  healthLiteracyLevel: 'low' | 'medium' | 'high' | 'clinician';
  appearance: 'light' | 'dark' | 'auto';
}

/** JWT pair: short-lived access (15 min) + long-lived refresh (30 days). Vol 6 §5.4. */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  /** Seconds until access token expiry. */
  expiresIn: number;
}

export interface AccessTokenClaims {
  sub: string;
  role: UserRole;
  iat: number;
  exp: number;
}
