import { Router } from "express";
import authRoutes from "./auth.routes";
import hospitalRoutes from "./hospital.routes";
import doctorRoutes from "./doctor.routes";
import patientRoutes from "./patient.routes";
import queueRoutes from "./queue.routes";
import documentRoutes from "./document.routes";
import locationRoutes from "./location.routes";
import { LocationController } from "../controllers/location.controller";

const router = Router();

router.use("/auth", authRoutes);
router.use("/hospitals", hospitalRoutes);
router.use("/doctors", doctorRoutes);
router.use("/patients", patientRoutes);
router.use("/queue", queueRoutes);
router.use("/documents", documentRoutes);
router.use("/locations", locationRoutes);
router.get("/states", LocationController.getStates);
router.get("/cities", LocationController.getCities);

export default router;
