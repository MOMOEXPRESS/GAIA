"use client";

import { useEffect, useState } from "react";
import { Cloud, Sun, Droplets, ExternalLink } from "lucide-react";
import { api, LocationContext } from "@/utils/api";

interface LocationHealthCardProps {
  countryCode?: string;
  context?: LocationContext;
}

export function LocationHealthCard({ countryCode, context: initialContext }: LocationHealthCardProps) {
  const [context, setContext] = useState<LocationContext | null>(initialContext ?? null);
  const [loading, setLoading] = useState(!!countryCode && !initialContext);

  useEffect(() => {
    if (initialContext) {
      setContext(initialContext);
      return;
    }
    if (!countryCode) return;
    setLoading(true);
    api.previewLocation(countryCode)
      .then(setContext)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [countryCode, initialContext]);

  if (loading) {
    return <div className="mt-4 rounded-xl border border-gaia-100 bg-white p-4 text-sm text-gaia-600">Loading regional context...</div>;
  }

  if (!context?.country) return null;

  return (
    <div className="mt-4 rounded-xl border border-gaia-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-gaia-900">
        Regional wellness context — {context.country}
      </h3>
      <p className="mt-1 text-xs text-amber-800">{context.disclaimer}</p>

      {context.weather && (
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gaia-700">
          {context.weather.temperature_c != null && (
            <span className="inline-flex items-center gap-1">
              <Sun className="h-4 w-4 text-amber-500" />
              {context.weather.temperature_c}°C
            </span>
          )}
          {context.weather.humidity_pct != null && (
            <span className="inline-flex items-center gap-1">
              <Droplets className="h-4 w-4 text-blue-500" />
              {context.weather.humidity_pct}% humidity
            </span>
          )}
          {context.climate_zone && (
            <span className="inline-flex items-center gap-1 capitalize">
              <Cloud className="h-4 w-4 text-gaia-500" />
              {context.climate_zone} climate
            </span>
          )}
        </div>
      )}

      {context.wellness_considerations && context.wellness_considerations.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-gaia-700">
          {context.wellness_considerations.map((tip) => (
            <li key={tip}>• {tip}</li>
          ))}
        </ul>
      )}

      {context.mental_health_factors && context.mental_health_factors.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase text-gaia-500">Mental wellness factors</p>
          <ul className="mt-1 space-y-1 text-sm text-gaia-700">
            {context.mental_health_factors.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
        </div>
      )}

      {context.health_links && (
        <div className="mt-4 flex flex-wrap gap-2">
          {context.health_links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-gaia-200 px-3 py-1 text-xs text-gaia-700 hover:bg-gaia-50"
            >
              {link.title}
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
