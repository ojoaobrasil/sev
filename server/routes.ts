import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "online", timestamp: new Date().toISOString() });
  });

  // System status endpoint
  app.get("/api/system-status", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    res.json({
      cpuUsage: 42,
      memoryUsage: 67,
      storageUsage: 23,
      networkUsage: 85,
      uptime: "45d 12h 36m",
      activeProcesses: [
        { name: "system_core.exe", status: "RUNNING" },
        { name: "security_monitor.exe", status: "RUNNING" },
        { name: "network_scan.exe", status: "SCANNING" },
        { name: "update_service.exe", status: "STANDBY" }
      ]
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
