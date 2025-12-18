import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import swaggerUi from "swagger-ui-express";
import pool from "./db/config";
import authRouter from "./routers/auth.router";
import auditRouter from "./routers/audit.router";
import { swaggerSpec } from "./swagger/swagger.config";
import logger from "./utils/logger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Serve static reports
app.use("/reports", express.static(path.join(process.cwd(), "reports")));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/audits", auditRouter);

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

export { app };

// Server Start and Database Connection Test
if (require.main === module) {
  // Test database connection before starting server
  pool
    .query("SELECT 1")
    .then(() => {
      logger.info("Database connected successfully");
      app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
        logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
      });
    })
    .catch((err) => {
      logger.error("Database connection failed", { error: err.message, stack: err.stack });
      process.exit(1);
    });
}
