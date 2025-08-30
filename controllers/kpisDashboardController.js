import {
    sendSuccessWithData,
    sendBadRequest,
    sendServerError
} from "../utils/responseHelper.js";
import sql from 'mssql'
import { getDBPool } from "../config/db.js";
import { getKpiDashboardQuery } from "../queries/kpiDashboardQuery.js";
import { getDateRange } from "../utils/utils.js"
import { formatKpiDashboardResponse } from "../utils/responseFormatter.js"
import { kpiDashboardSchema } from "../schema/dashboard.model.js"
import { ValidateRequestData } from "../handlers/validateRequest.js"
export async function kpiDashboardData(req, res) {
    const { filterType, month, year, userId, viewType, department, pageNumber, pageSize } = req.body;

    const validationResult = await ValidateRequestData(kpiDashboardSchema, req.body);
    if (validationResult !== true) {
        return sendBadRequest(res, validationResult.message);
    }
    let fromDate, toDate;
    try {
        ({ fromDate, toDate } = getDateRange(filterType, year, month));
    } catch (err) {
        return sendBadRequest(res, err.message);
    }
    try {
        const pool = getDBPool();
        const request = pool.request();
        request.input("fromDate", sql.DateTime, fromDate);
        request.input("toDate", sql.DateTime, toDate);
        request.input("userId", sql.Int, userId || null);
        request.input("viewType", sql.NVarChar, viewType || null);
        request.input("department", sql.NVarChar, department || null);
        request.input("pageNumber", sql.Int, pageNumber || 1);
        request.input("pageSize", sql.Int, pageSize || 10);
        const query = getKpiDashboardQuery();
        const result = await request.query(query);
        const formattedResponse = formatKpiDashboardResponse(result.recordset, filterType);
        return sendSuccessWithData(res, "KPI Dashboard summary fetched", formattedResponse);
    } catch (err) {
        console.error(err);
        return sendServerError(res, "Failed to fetch KPI dashboard", err.message);
    }
}
