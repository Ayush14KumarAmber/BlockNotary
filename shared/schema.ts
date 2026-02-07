import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We can store a local history of verifications or submissions for convenience,
// but the blockchain is the source of truth.
export const evidenceLogs = pgTable("evidence_logs", {
  id: serial("id").primaryKey(),
  evidenceHash: text("evidence_hash").notNull(),
  txHash: text("tx_hash").notNull(),
  submitter: text("submitter").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEvidenceLogSchema = createInsertSchema(evidenceLogs).omit({ 
  id: true, 
  createdAt: true 
});

export type InsertEvidenceLog = z.infer<typeof insertEvidenceLogSchema>;
export type EvidenceLog = typeof evidenceLogs.$inferSelect;
