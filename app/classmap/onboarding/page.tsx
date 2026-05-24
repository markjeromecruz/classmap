import { OnboardingWizard } from "@/components/classmap/onboarding/OnboardingWizard";
import { ClassmapShell } from "@/components/classmap/shell/ClassmapShell";

export const metadata = {
  title: "Onboarding — ClassMap",
  description: "Tell us about the child we’re planning for.",
};

export default function ClassMapOnboardingPage() {
  return (
    <ClassmapShell>
      <OnboardingWizard />
    </ClassmapShell>
  );
}
