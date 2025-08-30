import express from "express";
import { kpiDashboardData } from "../controllers/kpisDashboardController.js";
import { insertUser } from "../controllers/insertUserController.js";
import { insertUserType } from "../controllers/insertUserType.js";
import { insertDealer } from "../controllers/insertDealerMaster.js";
import v1Routes from "./v1/index.js";

const router = express.Router();

router.use('/api/v1', v1Routes);
router.post("/dashboard/kpi", kpiDashboardData);
router.post("/insertUser", insertUser);
router.post("/insertUserType", insertUserType);
router.post("/insertDealer", insertDealer);

export default router;
