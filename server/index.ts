import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
// Import the db module and migrate-data function
import { db, testConnection } from "./db";
import { migrateData } from "./migrate-data";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Test database connection first
    log("Testing database connection...");
    await testConnection();
    
    // Run database migrations to create tables (if they don't exist)
    log("Running db:push to ensure database schema is up to date");
    const { $ } = await import("execa");
    await $`npm run db:push`;
    log("Database schema is up to date");
    
    // Then, migrate data from the JSON to the database
    log("Migrating parks data to PostgreSQL...");
    await migrateData();
    log("Data migration complete");
  } catch (error) {
    log(`Error during database setup: ${error}`);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try to determine the port from environment variables
  const port = parseInt(process.env.PORT || "5000", 10);
  
  // Log information about the port
  console.log(`Using port ${port} from environment variables (PORT=${process.env.PORT || 'not set'})`);
  
  // Simple direct approach to start the server
  server.listen(port, "0.0.0.0", () => {
    log(`Server is running on port ${port}`);
  });
  
  // Handle any server errors
  server.on('error', (err: any) => {
    log(`Error starting server on port ${port}: ${err.message}`);
    process.exit(1);
  });
})();
