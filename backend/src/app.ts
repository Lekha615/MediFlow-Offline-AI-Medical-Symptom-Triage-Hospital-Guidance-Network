import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware";

import authRoutes from "./routes/auth.routes";
import hospitalRoutes from "./routes/hospital.routes";
import doctorRoutes from "./routes/doctor.routes";
import patientRoutes from "./routes/patient.routes";
import queueRoutes from "./routes/queue.routes";
import documentRoutes from "./routes/document.routes";
import locationRoutes from "./routes/location.routes";
import { LocationController } from "./controllers/location.controller";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

/**
 * Health check
 */
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 MediFlow Backend API is running successfully.",
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
app.use("/api/documents", documentRoutes);
app.use("/api/locations", locationRoutes);
app.get("/api/states", LocationController.getStates);
app.get("/api/cities", LocationController.getCities);

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