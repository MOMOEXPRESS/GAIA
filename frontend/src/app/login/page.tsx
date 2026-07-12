"use client";

import { useState } from "react";
import Link from "next/link";
import { DisclaimerCard } from "@/components/DisclaimerBanner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-gaia-950">Sign in</h1>
      <p className="mt-2 text-gaia-700">
        Access your wellness dashboard and symptom journal.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          alert("Connect Supabase Auth — see .env.example");
        }}
      >
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
        <button
          type="submit"
          className="w-full rounded-full bg-gaia-600 py-3 font-semibold text-white hover:bg-gaia-700"
        >
          Sign in
        </button>
      </form>

      <DisclaimerCard className="mt-6" />

      <p className="mt-6 text-center text-sm text-gaia-600">
        No account?{" "}
        <Link href="/signup" className="font-medium text-gaia-700 underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
