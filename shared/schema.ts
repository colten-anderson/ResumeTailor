import { z } from "zod";

export const resumeSessionSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  originalContent: z.string(),
  jobDescription: z.string().optional(),
  tailoredContent: z.string().optional(),
  createdAt: z.date(),
});

export const insertResumeSessionSchema = resumeSessionSchema.omit({
  id: true,
  createdAt: true,
});

export type ResumeSession = z.infer<typeof resumeSessionSchema>;
export type InsertResumeSession = z.infer<typeof insertResumeSessionSchema>;
