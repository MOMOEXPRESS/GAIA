const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("gaia_token", token);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token =
    typeof window !== "undefined" ? localStorage.getItem("gaia_token") : null;
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    throw new ApiError(res.status, detail ?? "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  is_demo: boolean;
  role: string;
}

export interface Profile {
  id: string;
  user_id: string;
  age?: number;
  sex_at_birth?: string;
  ethnicity?: string;
  blood_type?: string;
  height_cm?: number;
  weight_kg?: number;
  country?: string;
  country_code?: string;
  city?: string;
  climate_zone?: string;
  occupation_type?: string;
  sedentary_hours?: number;
  shift_work?: boolean;
  marital_status?: string;
  household_size?: number;
  financial_stress?: number;
  social_support_index?: number;
  meditation_minutes?: number;
  time_in_nature_minutes?: number;
  sense_of_purpose_score?: number;
  mood_frequency?: string;
  sleep_quality?: string;
  anxiety_frequency?: string;
  current_medications?: string[];
  allergies?: string[];
  past_illnesses?: string[];
  family_history?: string[];
  questionnaire_answers?: Record<string, unknown>;
  voice_notes?: { question_id: string; transcript: string }[];
  wellness_snapshot?: WellnessSnapshot;
  location_context?: LocationContext;
  display_name?: string;
  email?: string;
  is_demo?: boolean;
}

export interface WellnessSnapshot {
  bmi?: number;
  bmi_category?: string;
  overall_score?: number;
  dimensions?: { physical: number; mental: number; lifestyle: number; environmental: number };
  insights?: string[];
  disclaimer?: string;
}

export interface LocationContext {
  country?: string;
  city?: string;
  climate_zone?: string;
  weather?: { temperature_c?: number; humidity_pct?: number; uv_index?: number };
  wellness_considerations?: string[];
  mental_health_factors?: string[];
  health_links?: { title: string; url: string }[];
  disclaimer?: string;
}

export interface Question {
  id: string;
  section: string;
  question: string;
  type: string;
  field?: string;
  options?: string[];
  labels?: Record<string, string>;
  min?: number;
  max?: number;
  default?: number;
  optional?: boolean;
}

export const api = {
  health: () => request<{ status: string; service: string }>("/health"),

  // Auth
  login: (email: string, password: string) =>
    request<{ access_token: string; user: AuthUser }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, display_name?: string) =>
    request<{ access_token: string; user: AuthUser }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, display_name }),
    }),
  createDemo: () =>
    request<{ access_token: string; email: string; password: string; user: AuthUser }>(
      "/api/v1/auth/demo",
      { method: "POST" }
    ),
  me: () => request<AuthUser>("/api/v1/auth/me"),

  // Profile
  getProfile: () => request<Profile>("/api/v1/profile"),
  updateProfile: (data: Partial<Profile>) =>
    request<Profile>("/api/v1/profile", { method: "PUT", body: JSON.stringify(data) }),
  getWellness: () => request<WellnessSnapshot>("/api/v1/profile/wellness"),
  getLocationContext: () => request<LocationContext>("/api/v1/profile/location-context"),
  previewLocation: (countryCode: string, city?: string) =>
    request<LocationContext>(`/api/v1/location-preview/${countryCode}${city ? `?city=${encodeURIComponent(city)}` : ""}`),

  // Countries
  listCountries: () => request<{ code: string; name: string; cities: string[] }[]>("/api/v1/countries"),
  listCities: (code: string) => request<{ cities: string[] }>(`/api/v1/countries/${code}/cities`),

  // Questionnaire
  startQuestionnaire: () =>
    request<{ session_id: string; question: Question; progress: { answered: number; total: number } }>(
      "/api/v1/questionnaire/session",
      { method: "POST" }
    ),
  getQuestionnaireSession: (sessionId: string) =>
    request<{ session_id: string; question: Question; answers: Record<string, unknown>; completed: boolean; progress: { answered: number; total: number } }>(
      `/api/v1/questionnaire/session/${sessionId}`
    ),
  submitAnswer: (sessionId: string, questionId: string, answer: unknown, voiceTranscript?: string) =>
    request<{ session_id: string; question: Question; completed: boolean; progress: { answered: number; total: number } }>(
      "/api/v1/questionnaire/answer",
      { method: "POST", body: JSON.stringify({ session_id: sessionId, question_id: questionId, answer, voice_transcript: voiceTranscript }) }
    ),
  parseVoice: (transcript: string, options: string[]) =>
    request<{ matched: string | null; confidence: number; transcript: string }>(
      "/api/v1/questionnaire/voice",
      { method: "POST", body: JSON.stringify({ transcript, options }) }
    ),

  // Health events
  listHealthEvents: () =>
    request<{ id: string; event_type: string; description?: string; severity?: number; outcome?: string; tags: string[] }[]>(
      "/api/v1/health-events"
    ),
  createHealthEvent: (data: Record<string, unknown>) =>
    request("/api/v1/health-events", { method: "POST", body: JSON.stringify(data) }),
  deleteHealthEvent: (id: string) =>
    request(`/api/v1/health-events/${id}`, { method: "DELETE" }),

  // Symptoms
  createSymptom: (data: Record<string, unknown>) =>
    request("/api/v1/symptoms", { method: "POST", body: JSON.stringify(data) }),
  listSymptoms: () => request<unknown[]>("/api/v1/symptoms"),

  // Protocols
  generateProtocol: (symptomIds: string[]) =>
    request("/api/v1/protocols/generate", {
      method: "POST",
      body: JSON.stringify({ symptom_ids: symptomIds }),
    }),
  listProtocols: () => request<unknown[]>("/api/v1/protocols"),

  // Shopping
  searchPrices: (items: string[]) =>
    request("/api/v1/shopping/search", { method: "POST", body: JSON.stringify({ items }) }),

  // Safety
  checkRedFlags: (text: string) =>
    request<{ has_red_flags: boolean; flags: string[] }>("/api/v1/safety/check", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
};
