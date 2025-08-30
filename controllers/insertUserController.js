import { ValidateRequestData } from "../handlers/validateRequest.js";
import { sendBadRequest, sendSuccess, sendServerError } from "../utils/responseHelper.js";
import { getDBPool } from "../config/db.js";
import { insertUserQuery } from "../queries/insertUserQuery.js";
import { bindSqlParams } from "../utils/bindSqlParams.js";
import { insertUserSchema } from "../schema/user.model.js";

export async function insertUser(req, res) {
    const validationResult = await ValidateRequestData(insertUserSchema, req.body);

    if (validationResult === true) {
        const {
            UserType,
            UserName,
            Password,
            FirstName,
            LastName,
            Email,
            Mobile,
            IsActive,
            IsDeleted,
            CreatedDate = new Date(),
            CreatedBy,
            UpdatedDate,
            UpdatedBy
        } = req.body;
        
        
        try {
            const pool = getDBPool();
            const request = pool.request();

            const params = {
                UserType,
                UserName,
                Password,
                FirstName,
                LastName,
                Email,
                Mobile,
                IsActive,
                IsDeleted,
                CreatedDate,
                CreatedBy,
                UpdatedDate,
                UpdatedBy
            };

            bindSqlParams(request, params);
            await request.query(insertUserQuery);

            return sendSuccess(res, "User Inserted Successfully.");
        } catch (error) {
            console.error("Insert Error:", error);
            return sendServerError(res, "Database insert error", error.message);
        }
    } else {
        return sendBadRequest(res, validationResult.message);
    }
}
