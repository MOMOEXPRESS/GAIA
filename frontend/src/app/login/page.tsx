"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { DisclaimerCard } from "@/components/DisclaimerBanner";
import { ApiError } from "@/utils/api";

export default function LoginPage() {
  const { login, createDemo } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [demoInfo, setDemoInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError("");
    setLoading(true);
    try {
      const creds = await createDemo();
      setDemoInfo(`Demo account: ${creds.email} / ${creds.password}`);
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create demo account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-gaia-950">Sign in</h1>
      <p className="mt-2 text-gaia-700">Access your wellness dashboard and symptom journal.</p>

      <button
        type="button"
        onClick={handleDemo}
        disabled={loading}
        className="mt-6 w-full rounded-full border-2 border-gaia-500 bg-gaia-50 py-3 font-semibold text-gaia-800 hover:bg-gaia-100 disabled:opacity-50"
      >
        Try demo account (instant)
      </button>

      {demoInfo && <p className="mt-2 text-center text-xs text-gaia-600">{demoInfo}</p>}

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gaia-200" />
        <span className="text-sm text-gaia-500">or sign in</span>
        <div className="h-px flex-1 bg-gaia-200" />
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gaia-600 py-3 font-semibold text-white hover:bg-gaia-700 disabled:opacity-50"
        >
          Sign in
        </button>
      </form>

      <DisclaimerCard className="mt-6" />

      <p className="mt-6 text-center text-sm text-gaia-600">
        No account?{" "}
        <Link href="/signup" className="font-medium text-gaia-700 underline">Create one</Link>
      </p>
    </div>
  );
}
