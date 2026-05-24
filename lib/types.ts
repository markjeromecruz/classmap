import { z } from "zod";

export const LEARNING_STYLES = [
  "visual",
  "auditory",
  "kinesthetic",
  "reading-writing",
] as const;

export const SUBJECTS = [
  "math",
  "reading",
  "writing",
  "science",
  "history",
  "geography",
  "art",
  "music",
  "physical-education",
  "foreign-language",
] as const;

export const lessonPlanInputSchema = z.object({
  childName: z.string().trim().min(1).max(40).optional(),
  childAge: z.number().int().min(3).max(18),
  learningStyle: z.enum(LEARNING_STYLES),
  subjects: z.array(z.enum(SUBJECTS)).min(1).max(SUBJECTS.length),
  hoursPerWeek: z.number().int().min(2).max(40),
  state: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(500).optional(),
});

export type LessonPlanInput = z.infer<typeof lessonPlanInputSchema>;

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
export type Day = (typeof DAYS)[number];

export const sessionSchema = z.object({
  subject: z.enum(SUBJECTS),
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(400),
  materials: z.array(z.string().min(1).max(60)).max(8),
  minutes: z.number().int().min(10).max(180),
});
export type Session = z.infer<typeof sessionSchema>;

export const daySchema = z.object({
  day: z.enum(DAYS),
  sessions: z.array(sessionSchema).min(1).max(6),
});
export type DayPlan = z.infer<typeof daySchema>;

export const lessonPlanSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  input: lessonPlanInputSchema,
  summary: z.string().min(1).max(600),
  days: z.array(daySchema).length(5),
});
export type LessonPlan = z.infer<typeof lessonPlanSchema>;
