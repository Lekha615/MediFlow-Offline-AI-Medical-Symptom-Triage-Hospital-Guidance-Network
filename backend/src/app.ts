import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware";

import authRoutes from "./routes/auth.routes";
import hospitalRoutes from "./routes/hospital.routes";
import doctorRoutes from "./routes/doctor.routes";
import patientRoutes from "./routes/patient.routes";
import queueRoutes from "./routes/queue.routes";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Health check
 */
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message:
      "🚀 MediFlow Backend API is running successfully.",
    version: "1.0.0",
  });
});

/**
 * API Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/queue", queueRoutes);

/**
 * 404 Handler
 */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

/**
 * Global Error Handler
 */
app.use(errorHandler);

export default app;