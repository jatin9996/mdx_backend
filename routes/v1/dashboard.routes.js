import express from "express";
import { cashflowDashFlowData, dealerDashboard, kpiCompositionBoard, kpiDealerDashBoard, kpiNewDealerDashBoard, kpiNewNetworkDashBoard, networkDashBoardData } from "../../controllers/dashboard.controller.js";

const router = express.Router();

router.get('/dealer', dealerDashboard);
router.get('/cashflow', cashflowDashFlowData);
router.get('/network', networkDashBoardData);
router.post('/kpi/dealer', kpiDealerDashBoard);
router.post('/kpi/composition', kpiCompositionBoard);
router.post('/kpi/dealer/new', kpiNewDealerDashBoard);
router.post('/kpi/network/new', kpiNewNetworkDashBoard);

export default router;
