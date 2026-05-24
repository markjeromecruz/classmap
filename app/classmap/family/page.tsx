import { FamilyList } from "@/components/classmap/family/FamilyList";
import { ClassmapShell } from "@/components/classmap/shell/ClassmapShell";

export const metadata = {
  title: "Family — ClassMap",
  description: "Children, profiles, and state homeschool requirements.",
};

export default function ClassMapFamilyPage() {
  return (
    <ClassmapShell>
      <FamilyList />
    </ClassmapShell>
  );
}
