import Invitation from "@/components/Invitation";
import { LangProvider } from "@/lib/i18n";

export default function Page() {
  return (
    <LangProvider>
      <Invitation />
    </LangProvider>
  );
}
