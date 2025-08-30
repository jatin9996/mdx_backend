import { getDBPool } from "../config/db.js";

export const getCompositeKpiDataBySubmissionRange = async (param) => {
    const {
        compId,
        kpiName,
        startDate,
        endDate,
        viewType
    } = param;
    const pool = getDBPool();

    let query = `
        SELECT * FROM CompositeKPIValue
        WHERE 
            SubmissionTime >= ? AND
            SubmissionTime <= ? AND
            KPIName = ? AND
            CompConfigId = ?
    `;
    
    let params = [startDate, endDate, kpiName, compId];

    if (viewType) {
        query += ` AND ViewType = ?`;
        params.push(viewType);
    }

    query += ` ORDER BY SubmissionTime DESC`;

    const [rows] = await pool.execute(query, params);

    return rows;
}

export const getCompositionKPIValuesByMonth = async (params) => {
    const { compositionId, startDate, endDate } = params;

    const pool = await getDBPool();
    const request = pool.request();

    // Input parameters
    request.input("compConfigId", sql.Int, compositionId);
    request.input("startDate", sql.Date, startDate);
    request.input("endDate", sql.Date, endDate);

    const query = `
        -- Step 0: Input Parameters are passed via @compConfigId, @startDate, @endDate

        -- 🗓 Step 1: Generate list of first day of each month
        WITH Months AS (
            SELECT CAST(DATEADD(MONTH, 0, @startDate) AS DATE) AS submissionMonth
            UNION ALL
            SELECT DATEADD(MONTH, 1, submissionMonth)
            FROM Months
            WHERE DATEADD(MONTH, 1, submissionMonth) <= @endDate
        ),

        -- 🧩 Step 2: All combinations of (Month × KPI × Dealer)
        KPI_Dealer_Months AS (
            SELECT 
                m.submissionMonth,
                k.*, -- all fields from KPIDetails
                d.CompConfigId
            FROM Months m
            CROSS JOIN KPIDetails k
            CROSS JOIN (
                SELECT DISTINCT CompConfigId 
                FROM CompositeKPIValue 
                WHERE CompConfigId = @compConfigId
            ) d
        ),

        -- 📦 Step 3: Actual values submitted by the dealer
        ActualData AS (
            SELECT 
                DATEFROMPARTS(YEAR(SubmissionTime), MONTH(SubmissionTime), 1) AS submissionMonth,
                dv.* 
            FROM CompositeKPIValue dv
            WHERE dv.CompConfigId = @compConfigId
            AND dv.SubmissionTime BETWEEN @startDate AND EOMONTH(@endDate)
        )

        -- ✅ Step 4: Join and show sorted KPI → Month-wise
            SELECT 
                kdm.Department,
                kdm.KPIName,
                kdm.ViewType,
                kdm.Units,
                kdm.Goodness,
                kdm.submissionMonth,
                kdm.Id,
                kdm.CompConfigId,
                ISNULL(ad.AVGMValue, 0) AS AVGMValue,
                ISNULL(ad.AVGYValue, 0) AS AVGYValue,
                ISNULL(ad.CUMMValue, 0) AS CUMMValue,
                ISNULL(ad.CUMYValue, 0) AS CUMYValue
            FROM KPI_Dealer_Months kdm
            LEFT JOIN ActualData ad
                ON kdm.Id = ad.Id
                AND kdm.CompConfigId = ad.CompConfigId
                AND kdm.submissionMonth = ad.submissionMonth
            ORDER BY 
                kdm.KPIName ASC,
                ad.ViewType ASC,
                kdm.submissionMonth ASC
            OPTION (MAXRECURSION 1000);
    `;

    const result = await request.query(query);

    return result.recordset;
};

export const getCompositeKPINetowrkDashValuesByMonth = async (params) => {
    const { startDate, endDate, kpiIds } = params;

    const pool = await getDBPool();
    const request = pool.request();

    // Input parameters
    request.input("startDate", sql.Date, startDate);
    request.input("endDate", sql.Date, endDate);

    // Dynamically add each KPI ID as a separate input parameter
    const kpiIdParams = kpiIds.map((id, index) => {
        const paramName = `kpiId_${index}`;
        request.input(paramName, sql.Int, id);
        return `@${paramName}`;
    });
    const kpiIdCondition = kpiIdParams.length ? `WHERE Id IN (${kpiIdParams.join(", ")})` : "";

    const query = `
    -- 🗓 Step 1: Generate list of first day of each month
    WITH Months AS (
        SELECT @startDate AS submissionMonth
        UNION ALL
        SELECT DATEADD(MONTH, 1, submissionMonth)
        FROM Months
        WHERE DATEADD(MONTH, 1, submissionMonth) <= @endDate
    ),

    -- 🧩 Step 2: All combinations of (Month × KPI × Dealer)
    KPI_Dealer_Months AS (
        SELECT 
            m.submissionMonth,
            k.Id AS KPIId,
            k.KPIName,
            k.Department,
            k.ViewType,
            k.Units,
            k.Goodness,
            d.CompConfigId,
            d.DisplayName,
            d.FullName
        FROM Months m
        CROSS JOIN (
            SELECT Id, KPIName, Department, ViewType, Units, Goodness
            FROM KPIDetails
            ${kpiIdCondition}
        ) k
        CROSS JOIN (
            SELECT CompConfigId, DisplayName, FullName
            FROM CompositeConfigurationMaster
        ) d
    ),

    -- 📦 Step 3: Actual values submitted by the dealer
    ActualData AS (
        SELECT 
            DATEFROMPARTS(YEAR(SubmissionTime), MONTH(SubmissionTime), 1) AS submissionMonth,
            Id,
            CompConfigId,
            CUMMValue,
            CUMYValue,
            AVGMValue,
            AVGYValue
        FROM CompositeKPIValue
        WHERE SubmissionTime BETWEEN @startDate AND EOMONTH(@endDate)
    )

    -- ✅ Step 4: Final output
    SELECT 
        kdm.submissionMonth,
        kdm.KPIId AS Id,
        kdm.KPIName,
        kdm.CompConfigId,
        kdm.DisplayName,
        kdm.FullName,
        ISNULL(ad.CUMMValue, 0) AS CUMMValue,
        ISNULL(ad.CUMYValue, 0) AS CUMYValue,
        ISNULL(ad.AVGMValue, 0) AS AVGMValue,
        ISNULL(ad.AVGYValue, 0) AS AVGYValue,
        kdm.Department,
        kdm.Goodness,
        kdm.ViewType
    FROM KPI_Dealer_Months kdm
    LEFT JOIN ActualData ad
        ON kdm.KPIId = ad.Id
        AND kdm.CompConfigId = ad.CompConfigId
        AND kdm.submissionMonth = ad.submissionMonth
    ORDER BY 
        kdm.KPIId,
        kdm.CompConfigId,
        kdm.submissionMonth
    OPTION (MAXRECURSION 1000);
    `;

    const result = await request.query(query);

    return result.recordset;
};