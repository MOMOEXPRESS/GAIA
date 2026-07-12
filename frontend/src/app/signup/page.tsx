"use client";

import Link from "next/link";
import { DisclaimerCard } from "@/components/DisclaimerBanner";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-gaia-950">
        Create account
      </h1>
      <p className="mt-2 text-gaia-700">
        Start your holistic wellness journey — free, always.
      </p>

      <form
        className="mt-8 space-y-4"
        action="#"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            minLength={8}
            className="mt-1 w-full rounded-lg border border-gaia-200 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-gaia-600 py-3 font-semibold text-white hover:bg-gaia-700"
        >
          Sign up
        </button>
      </form>

      <DisclaimerCard className="mt-6" />

      <p className="mt-6 text-center text-sm text-gaia-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-gaia-700 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
