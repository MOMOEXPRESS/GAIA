export const DISCLAIMER_TEXT =
  "This platform provides educational and supportive natural wellness information. It does not diagnose, treat, or prescribe. Always consult a licensed healthcare provider. In emergencies, call your local emergency number immediately.";

export function DisclaimerBanner() {
  return (
    <div
      role="note"
      aria-label="Medical disclaimer"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs leading-relaxed text-amber-900 sm:text-sm"
    >
      {DISCLAIMER_TEXT}
    </div>
  );
}

export function DisclaimerCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 ${className}`}
    >
      <p className="font-medium">Important notice</p>
      <p className="mt-1 leading-relaxed">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
