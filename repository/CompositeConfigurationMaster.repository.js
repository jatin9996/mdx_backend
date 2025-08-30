import { getDBPool } from "../config/db.js";

export const getAllComposite = async () => {
    const pool = getDBPool();
    
    const [rows] = await pool.execute(`
      SELECT * FROM CompositeConfigurationMaster
      WHERE isActive = ? AND isDeleted = ?
    `, [1, 0]);

    return rows;
}

