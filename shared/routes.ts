import { z } from "zod";
import { insertEvidenceLogSchema, evidenceLogs } from "./schema";

export const api = {
  evidence: {
    log: {
      method: "POST" as const,
      path: "/api/evidence/log" as const,
      input: insertEvidenceLogSchema,
      responses: {
        201: z.custom<typeof evidenceLogs.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    list: {
        method: "GET" as const,
        path: "/api/evidence/logs" as const,
        responses: {
            200: z.array(z.custom<typeof evidenceLogs.$inferSelect>()),
        }
    }
  },
};
