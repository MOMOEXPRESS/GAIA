import Link from "next/link";
import {
  Leaf,
  BookOpen,
  Shield,
  Stethoscope,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Symptom Micro-Journal",
    description:
      "Capture symptoms in extreme detail — location, quality, intensity, triggers, voice memos, and tongue or skin photos.",
  },
  {
    icon: Leaf,
    title: "Natural Protocols",
    description:
      "Rule-based pattern matching maps your symptoms to holistic imbalances and generates herbs, nutrition, and lifestyle plans.",
  },
  {
    icon: ShoppingBag,
    title: "Price Hunting",
    description:
      "Find the cheapest sources for recommended natural items across AliExpress, Amazon, iHerb, and eBay.",
  },
  {
    icon: Stethoscope,
    title: "Doctor Portal",
    description:
      "Practitioners review timelines, approve protocols, and message patients securely — free for clinicians.",
  },
  {
    icon: Shield,
    title: "Safety First",
    description:
      "Emergency red-flag detection blocks unsafe self-care advice and directs you to professional care.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-gaia-50 via-earth-50 to-gaia-100 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gaia-100 px-4 py-1.5 text-sm font-medium text-gaia-800">
            <Leaf className="h-4 w-4" />
            Launching August 2026
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-gaia-950 sm:text-6xl">
            Your holistic health companion
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gaia-800">
            Gaia helps you understand your body through detailed symptom
            journaling, natural wellness protocols, and optional practitioner
            collaboration — built on open source, zero-cost infrastructure.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-gaia-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-gaia-700"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/doctor"
              className="inline-flex items-center gap-2 rounded-full border border-gaia-300 bg-white px-8 py-3 text-base font-semibold text-gaia-800 transition hover:bg-gaia-50"
            >
              Practitioner portal
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-bold text-gaia-950">
            Everything in one place
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gaia-700">
            From micro-journaling to protocol generation to price comparison —
            designed for natural wellness, not disease diagnosis.
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gaia-100 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <feature.icon className="h-8 w-8 text-gaia-600" />
                <h3 className="mt-4 text-lg font-semibold text-gaia-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gaia-700">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gaia-100 bg-gaia-950 px-6 py-16 text-center text-gaia-100">
        <h2 className="font-display text-2xl font-bold">Ready to begin?</h2>
        <p className="mx-auto mt-3 max-w-xl text-gaia-300">
          Complete your holistic health profile, start journaling symptoms, and
          receive your first natural protocol.
        </p>
        <Link
          href="/onboarding"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gaia-500 px-8 py-3 font-semibold text-white transition hover:bg-gaia-400"
        >
          Start health profile
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
