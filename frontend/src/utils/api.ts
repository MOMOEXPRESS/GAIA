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

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("gaia_token")
      : null;
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  health: () => request<{ status: string; service: string }>("/health"),

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

  // Profiles
  getProfile: () => request<Record<string, unknown>>("/api/v1/profile"),
  updateProfile: (data: Record<string, unknown>) =>
    request("/api/v1/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Shopping
  searchPrices: (items: string[]) =>
    request("/api/v1/shopping/search", {
      method: "POST",
      body: JSON.stringify({ items }),
    }),

  // Safety
  checkRedFlags: (text: string) =>
    request<{ has_red_flags: boolean; flags: string[] }>(
      "/api/v1/safety/check",
      { method: "POST", body: JSON.stringify({ text }) }
    ),
};
