import express from "express";
import secretRoutes from "./secret.js";
import trainingsRoutes from "./trainings.js";

const router = express.Router();

// Podroutery
router.use("/secret", secretRoutes);      // → /api/secret
router.use("/trainings", trainingsRoutes); // → /api/trainings

export default router;
