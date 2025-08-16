import { z } from "zod";

export const ProgressEvent = z.object({
  phase: z.enum(["fetch", "resolve", "upsert", "done", "error"]),
  pct: z.number().min(0).max(100),
  message: z.string().optional(),
  meta: z.record(z.string(), z.any()).optional(),
});
export type ProgressEvent = z.infer<typeof ProgressEvent>;
