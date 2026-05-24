import { AuthForm } from "@/components/classmap/auth/AuthForm";
import { ClassmapShell } from "@/components/classmap/shell/ClassmapShell";

export const metadata = {
  title: "Create an account — ClassMap",
  description: "Open a ClassMap account.",
};

export default function ClassMapSignupPage() {
  return (
    <ClassmapShell bare>
      <main className="mx-auto w-full max-w-md px-5 py-10 sm:py-16">
        <AuthForm mode="signup" />
      </main>
    </ClassmapShell>
  );
}
