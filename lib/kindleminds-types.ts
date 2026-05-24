import { z } from "zod";

export const CURRICULUM_STYLES = [
  "classical",
  "charlotte-mason",
  "unschooling",
  "eclectic",
  "montessori",
] as const;

export const curriculumStyleSchema = z.enum(CURRICULUM_STYLES);
export type CurriculumStyle = z.infer<typeof curriculumStyleSchema>;

export const roomSchema = z.object({
  slug: curriculumStyleSchema,
  name: z.string().min(1).max(60),
  tradition: z.string().min(1).max(80),
  blurb: z.string().min(1).max(300),
  members: z.number().int().min(0),
  accent: z.string().min(1).max(40),
});
export type Room = z.infer<typeof roomSchema>;

export const replySchema = z.object({
  id: z.string().min(1),
  author: z.string().min(1).max(40),
  postedAt: z.string().datetime(),
  body: z.string().min(1).max(2000),
});
export type Reply = z.infer<typeof replySchema>;

export const threadSchema = z.object({
  id: z.string().min(1),
  roomSlug: curriculumStyleSchema,
  title: z.string().min(1).max(160),
  author: z.string().min(1).max(40),
  postedAt: z.string().datetime(),
  body: z.string().min(1).max(4000),
  replies: z.array(replySchema).max(50),
  views: z.number().int().min(0),
});
export type Thread = z.infer<typeof threadSchema>;
