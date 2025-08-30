import { getDBPool } from "../config/db.js";

export const getAllInvestor = async () => {
    const pool = getDBPool();
    
    const [rows] = await pool.execute(`
      SELECT * FROM InvestorMaster
      WHERE isActive = ? AND isDeleted = ?
    `, [1, 0]);

    return rows;
}