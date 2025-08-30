import { ValidateRequestData } from "../handlers/validateRequest.js";
import { sendBadRequest, sendSuccess, sendServerError } from "../utils/responseHelper.js";
import {getDBPool} from "../config/db.js";
import { insertUserTypeQuery } from "../queries/insertUserTypeQuery.js";
import { bindSqlParams } from "../utils/bindSqlParams.js";
import { insertUserTypeSchema } from "../schema/user.model.js";

export async function insertUserType(req, res) {
    const validationResult = await ValidateRequestData(insertUserTypeSchema, req.body);
    if (validationResult === true) {
        const {
            UserType
        } = req.body;
        try {
            const pool = getDBPool();
            const request = pool.request();
            const params = {
                UserType,
            };
            bindSqlParams(request, params);
            await request.query(insertUserTypeQuery);
            return sendSuccess(res, "User Type Inserted Successfully");
        } catch (error) {
            console.error("Insert Error:", error);
            return sendServerError(res, "Database insert error", error.message);
        }
    } else {
        return sendBadRequest(res, validationResult.message);
    }
}
