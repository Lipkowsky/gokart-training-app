import express from "express";
import secretRoutes from "./secret.js";
import trainingsRoutes from "./trainings.js";
import manageUsers from "./manageUsers.js"

const router = express.Router();

// Podroutery
router.use("/secret", secretRoutes);      // → /api/secret
router.use("/trainings", trainingsRoutes); // → /api/trainings
router.use('/manageUsers', manageUsers)

export default router;
