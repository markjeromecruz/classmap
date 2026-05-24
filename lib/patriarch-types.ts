import { z } from "zod";

export const devotionalSchema = z.object({
  id: z.string().min(1),
  date: z.string(),
  theme: z.string().min(1).max(80),
  scriptureReference: z.string().min(1).max(60),
  scriptureText: z.string().min(1).max(600),
  reflection: z.string().min(1).max(1200),
  prompt: z.string().min(1).max(400),
  prayer: z.string().min(1).max(600),
});
export type Devotional = z.infer<typeof devotionalSchema>;

export const familyAltarSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(80),
  ageRange: z.string().min(1).max(40),
  minutes: z.number().int().min(5).max(45),
  scripture: z.object({
    reference: z.string().min(1).max(60),
    text: z.string().min(1).max(600),
  }),
  openingQuestion: z.string().min(1).max(300),
  activity: z.string().min(1).max(600),
  closingPrayer: z.string().min(1).max(400),
});
export type FamilyAltar = z.infer<typeof familyAltarSchema>;

export const journalEntrySchema = z.object({
  id: z.string().min(1),
  childName: z.string().min(1).max(40),
  date: z.string(),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(2400),
});
export type JournalEntry = z.infer<typeof journalEntrySchema>;
