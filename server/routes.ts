import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.evidence.log.path, async (req, res) => {
    try {
      const input = api.evidence.log.input.parse(req.body);
      const log = await storage.logEvidence(input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.evidence.list.path, async (req, res) => {
      const logs = await storage.getEvidenceLogs();
      res.json(logs);
  });

  return httpServer;
}
