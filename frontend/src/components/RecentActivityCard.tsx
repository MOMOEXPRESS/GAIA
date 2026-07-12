"use client";

import Link from "next/link";
import { TimelineEvent } from "@/utils/api";

export function RecentActivityCard({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-gaia-100 bg-white p-6">
        <h3 className="font-semibold text-gaia-900">Recent Activity</h3>
        <p className="mt-2 text-sm text-gaia-600">Your health timeline will appear here as you log data.</p>
        <Link href="/timeline" className="mt-2 inline-block text-sm font-medium text-gaia-700 underline">
          View timeline →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gaia-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gaia-900">Recent Activity</h3>
        <Link href="/timeline" className="text-sm font-medium text-gaia-600 hover:text-gaia-800">View all</Link>
      </div>
      <ul className="mt-4 space-y-3">
        {events.map((e) => (
          <li key={e.id} className="flex items-center justify-between border-b border-gaia-50 pb-2 last:border-0">
            <div>
              <p className="font-medium text-gaia-900">{e.title ?? e.event_type}</p>
              <p className="text-xs text-gaia-500 capitalize">{e.category} · {e.source?.replace(/_/g, " ")}</p>
            </div>
            <span className="text-xs text-gaia-400">
              {e.occurred_at ? new Date(e.occurred_at).toLocaleDateString() : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
