import { AuthForm } from "@/components/classmap/auth/AuthForm";
import { ClassmapShell } from "@/components/classmap/shell/ClassmapShell";

export const metadata = {
  title: "Sign in — ClassMap",
  description: "Sign in to ClassMap.",
};

export default function ClassMapLoginPage() {
  return (
    <ClassmapShell bare>
      <main className="mx-auto w-full max-w-md px-5 py-10 sm:py-16">
        <AuthForm mode="signin" />
      </main>
    </ClassmapShell>
  );
}
