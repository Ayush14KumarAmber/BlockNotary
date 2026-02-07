import { evidenceLogs, type InsertEvidenceLog, type EvidenceLog } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  logEvidence(log: InsertEvidenceLog): Promise<EvidenceLog>;
  getEvidenceLogs(): Promise<EvidenceLog[]>;
}

export class DatabaseStorage implements IStorage {
  async logEvidence(log: InsertEvidenceLog): Promise<EvidenceLog> {
    const [newLog] = await db.insert(evidenceLogs).values(log).returning();
    return newLog;
  }

  async getEvidenceLogs(): Promise<EvidenceLog[]> {
    return await db.select().from(evidenceLogs).orderBy(evidenceLogs.createdAt);
  }
}

export const storage = new DatabaseStorage();
