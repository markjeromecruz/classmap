import type { Day, SUBJECTS } from "@/lib/types";

type Subject = (typeof SUBJECTS)[number];

export const SUBJECT_LABELS: Record<Subject, string> = {
  math: "Math",
  reading: "Reading",
  writing: "Writing",
  science: "Science",
  history: "History",
  geography: "Geography",
  art: "Art",
  music: "Music",
  "physical-education": "PE",
  "foreign-language": "Language",
};

export const SUBJECT_COLORS: Record<
  Subject,
  { badge: string; accent: string; ring: string }
> = {
  math: {
    badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    accent: "border-l-blue-500",
    ring: "ring-blue-500/30",
  },
  reading: {
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    accent: "border-l-amber-500",
    ring: "ring-amber-500/30",
  },
  writing: {
    badge: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
    accent: "border-l-orange-500",
    ring: "ring-orange-500/30",
  },
  science: {
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    accent: "border-l-emerald-500",
    ring: "ring-emerald-500/30",
  },
  history: {
    badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    accent: "border-l-rose-500",
    ring: "ring-rose-500/30",
  },
  geography: {
    badge: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
    accent: "border-l-cyan-500",
    ring: "ring-cyan-500/30",
  },
  art: {
    badge: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
    accent: "border-l-fuchsia-500",
    ring: "ring-fuchsia-500/30",
  },
  music: {
    badge: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    accent: "border-l-violet-500",
    ring: "ring-violet-500/30",
  },
  "physical-education": {
    badge: "bg-lime-500/15 text-lime-700 dark:text-lime-300",
    accent: "border-l-lime-500",
    ring: "ring-lime-500/30",
  },
  "foreign-language": {
    badge: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
    accent: "border-l-teal-500",
    ring: "ring-teal-500/30",
  },
};

export const DAY_LABELS: Record<Day, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
};

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
