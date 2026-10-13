import { Router } from "express";
import { LocationController } from "../controllers/location.controller";

const router = Router();

router.get("/states", LocationController.getStates);
router.get("/cities", LocationController.getCities);

export default router;
