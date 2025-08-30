import { getDealerCashflowData, getDealerStatesData, kpiCompositionDataByCompositionId, kpiDashboardData, kpiNetowrkDashboarDelarData, kpiNewNetworkDashBoardData, networkDashboardKPIDataOfAllDelaer, newDealerCompositeDataDashboardKpis, newDealerDashboardKpis } from "../services/dashboard.service.js";
import { sendSuccessWithData } from "../utils/responseHelper.js";

export const dealerDashboard = async (req, res) => {
    const query = {
        ...req.query,
        baseEntityId: Number(req.query.baseEntityId),
        comparisonEntityId: Number(req.query.comparisonEntityId),
        startMonth: Number(req.query.startMonth),
        startYear: Number(req.query.startYear),
        endMonth: Number(req.query.endMonth),
        endYear: Number(req.query.endYear)
    }

    const response = await getDealerStatesData(query);

    return sendSuccessWithData(res, "", response);
};

export const cashflowDashFlowData = async (req, res) => {
    const query = {
        dealerId: Number(req.query.dealerId),
        startMonth: Number(req.query.startMonth),
        startYear: Number(req.query.startYear),
        endMonth: Number(req.query.endMonth),
        endYear: Number(req.query.endYear)
    }

    const response = await getDealerCashflowData(query);

    return sendSuccessWithData(res, "", response);
}

export const networkDashBoardData = async (req, res) => {
    const query = {
        month: Number(req.query.month),
        year: Number(req.query.year),
    }

    const response = await networkDashboardKPIDataOfAllDelaer(query);

    return sendSuccessWithData(res, "", response);
}

export const kpiDealerDashBoard = async (req, res) => {
    const body = req.body;

    const response = await kpiDashboardData(body);

    return sendSuccessWithData(res, "", response);
}

export const kpiCompositionBoard = async (req, res) => {
    const body = req.body;

    const response = await kpiCompositionDataByCompositionId(body);

    return sendSuccessWithData(res, "", response);
}

export const kpiNewDealerDashBoard = async (req, res) => {
    const body = req.body;

    const [dealerData, compositeData] = await Promise.all([
        newDealerDashboardKpis(body),
        newDealerCompositeDataDashboardKpis(body)
    ]);

    return sendSuccessWithData(res, "", {
        dealerData,
        compositeData
    });
}

export const kpiNewNetworkDashBoard = async (req, res) => {
    const body = req.body;

    const [compositeData, dealerData] = await Promise.all([
        kpiNewNetworkDashBoardData(body),
        kpiNetowrkDashboarDelarData(body)
    ]);

    return sendSuccessWithData(res, "", { compositeData, dealerData });
}