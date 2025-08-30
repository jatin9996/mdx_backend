import express from "express";
import entityRoutes from "./entity.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = express.Router();

router.use('/entity', entityRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
