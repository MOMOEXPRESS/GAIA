import { SymptomJournal } from "@/components/SymptomJournal";
import { AuthGuard } from "@/components/AuthGuard";

export default function JournalPage() {
  return (
    <AuthGuard>
      <SymptomJournal />
    </AuthGuard>
  );
}
