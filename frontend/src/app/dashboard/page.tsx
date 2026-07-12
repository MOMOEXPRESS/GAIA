"use client";

import Link from "next/link";
import { BookOpen, ClipboardList, Leaf, AlertCircle } from "lucide-react";

const quickLinks = [
  {
    href: "/journal",
    icon: BookOpen,
    title: "Log symptoms",
    description: "Add a new micro-journal entry",
  },
  {
    href: "/onboarding",
    icon: ClipboardList,
    title: "Health profile",
    description: "Complete or update your intake form",
  },
  {
    href: "/protocols",
    icon: Leaf,
    title: "View protocols",
    description: "See your natural wellness plans",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-gaia-950">
        Your wellness dashboard
      </h1>
      <p className="mt-2 text-gaia-700">
        Track symptoms, review protocols, and manage your holistic health
        journey.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
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

      <div className="mt-8 rounded-xl border border-gaia-100 bg-white p-6">
        <h2 className="flex items-center gap-2 font-semibold text-gaia-900">
          <AlertCircle className="h-5 w-5 text-gaia-600" />
          Recent activity
        </h2>
        <p className="mt-4 text-sm text-gaia-600">
          No entries yet. Start by logging your first symptom or completing
          your health profile.
        </p>
      </div>
    </div>
  );
}
