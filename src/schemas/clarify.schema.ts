import { z } from "zod";

export const ClarifyRequestSchema = z.object({
  selectedText: z.string().min(1).max(2000),
  contextText: z.string().min(1).max(5000),
  contentType: z.enum(["chat", "article", "code"]),
  question: z.string().min(1).max(500),
  pageUrl: z.string().url().optional(),
});

export type ClarifyRequest = z.infer<typeof ClarifyRequestSchema>;
