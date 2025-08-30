import { getDBPool } from "../config/db.js";

export const getAllDealers = async () => {
    const pool = getDBPool();
    
    const result = await pool.request()
        .input('isActive', 1)
        .input('isDeleted', 0)
        .query(`
            SELECT * FROM DealerMaster
            WHERE isActive = @isActive AND isDeleted = @isDeleted
        `);

    return result.recordset;
}