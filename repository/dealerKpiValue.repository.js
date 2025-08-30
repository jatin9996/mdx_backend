import { getDBPool } from "../config/db.js";

export const getDealerKpiDataBySubmissionRange = async (param) => {
  const {
    dealerId,
    kpiName,
    startDate,
    endDate,
    viewType
  } = param;
  const pool = getDBPool();

  let query = `
    SELECT * FROM DealerKPIValue
    WHERE 
      SubmissionTime >= ? AND
      SubmissionTime <= ? AND
      KPIName = ? AND
      DealerId = ?
  `;
  
  let params = [startDate, endDate, kpiName, dealerId];

  if (viewType) {
    query += ` AND ViewType = ?`;
    params.push(viewType);
  }

  query += ` ORDER BY SubmissionTime DESC`;

  const [rows] = await pool.execute(query, params);

  return rows;
}

export const getDealerKpiDataByFilters = async (param) => {
  const {
    dealerIds,
    kpiName,
    startDate,
    endDate,
    viewType
  } = param;
  const pool = getDBPool();

  let query = `
    SELECT * FROM DealerKPIValue
    WHERE 
      SubmissionTime >= ? AND
      SubmissionTime <= ? AND
      KPIName = ? AND
      DealerId = ?
  `;
  
  let params = [startDate, endDate, kpiName, dealerId];

  if (viewType) {
    query += ` AND ViewType = ?`;
    params.push(viewType);
  }

  query += ` ORDER BY SubmissionTime DESC`;

  const [rows] = await pool.execute(query, params);

  return rows;
}

export const getDealerKPIValuesByMonth = async (params) => {
  const { dealerId, startDate, endDate, kpiIds } = params;

  const pool = await getDBPool();
  const request = pool.request();

  // Dynamically add each KPI ID as a separate input parameter
  const kpiIdParams = kpiIds?.map((id, index) => {
    const paramName = `kpiId_${index}`;
    request.input(paramName, sql.Int, id);
    return `@${paramName}`;
  });
  const kpiIdCondition = kpiIdParams?.length ? `WHERE Id IN (${kpiIdParams.join(", ")})` : "";

  // Input parameters
  request.input("dealerId", sql.Int, dealerId);
  request.input("startDate", sql.Date, startDate);
  request.input("endDate", sql.Date, endDate);

  const query = `
        -- Step 0: Input Parameters are passed via @dealerId, @startDate, @endDate

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
                k.*,
                d.DealerId
            FROM Months m
            CROSS JOIN (
                SELECT Id, KPIName, Department, ViewType, Units, Goodness
                FROM KPIDetails
                ${kpiIdCondition}
            ) k
            CROSS JOIN (
                SELECT DISTINCT DealerId 
                FROM DealerKPIValue 
                WHERE DealerId = @dealerId
            ) d
        ),

        -- 📦 Step 3: Actual values submitted by the dealer
        ActualData AS (
            SELECT 
                DATEFROMPARTS(YEAR(SubmissionTime), MONTH(SubmissionTime), 1) AS submissionMonth,
                dv.* 
            FROM DealerKPIValue dv
            WHERE dv.DealerId = @dealerId
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
            kdm.DealerId,
            ISNULL(ad.mValue, 0) AS mValue,
            ISNULL(ad.yValue, 0) AS yValue
        FROM KPI_Dealer_Months kdm
        LEFT JOIN ActualData ad
            ON kdm.Id = ad.Id
            AND kdm.DealerId = ad.DealerId
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

export const getDealerKPINetowrkDashValuesByMonth = async (params) => {
  const { startDate, endDate, kpiIds, dealerId } = params;

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

  // Optional dealerId input
  let dealerFilterCondition = "";
  if (dealerId !== undefined && dealerId !== null) {
    request.input("dealerId", sql.Int, dealerId);
    dealerFilterCondition = `WHERE DealerId = @dealerId`;
  }

  const query = `
       -- 🗓 Step 1: Generate list of first day of each month
        WITH Months AS (
            SELECT CAST(@startDate AS DATE) AS submissionMonth
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
                d.DealerId,
                d.DealerName,
                d.LATCoordinate,
                d.LONCoordinate
            FROM Months m
            CROSS JOIN (
                SELECT Id, KPIName, Department, ViewType, Units, Goodness
                FROM KPIDetails
                ${kpiIdCondition}
            ) k
            CROSS JOIN (
                SELECT DealerId, DealerName, LATCoordinate, LONCoordinate
                FROM DealerMaster
                ${dealerFilterCondition}
            ) d
        ),

        -- 📦 Step 3: Actual values submitted by the dealer
        ActualData AS (
            SELECT 
                DATEFROMPARTS(YEAR(SubmissionTime), MONTH(SubmissionTime), 1) AS submissionMonth,
                Id,
                DealerId,
                MValue,
                YValue
            FROM DealerKPIValue
            WHERE SubmissionTime BETWEEN @startDate AND EOMONTH(@endDate)
        )

        -- ✅ Step 4: Final output
        SELECT 
            kdm.submissionMonth,
            kdm.KPIId,
            kdm.KPIName,
            kdm.DealerId,
            ISNULL(ad.MValue, 0) AS MValue,
            ISNULL(ad.YValue, 0) AS YValue,
            kdm.DealerName,
            kdm.LATCoordinate,
            kdm.LONCoordinate
        FROM KPI_Dealer_Months kdm
        LEFT JOIN ActualData ad
            ON kdm.KPIId = ad.Id
            AND kdm.DealerId = ad.DealerId
            AND kdm.submissionMonth = ad.submissionMonth
        ORDER BY 
            kdm.KPIId,
            kdm.DealerId,
            kdm.submissionMonth
        OPTION (MAXRECURSION 1000);
    `;

  const result = await request.query(query);

  return result.recordset;
};

export const dealerNewNetowrkDashKpiByMonth = async (params) => {
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
        WITH Months AS (
            SELECT CAST(DATEADD(MONTH, 0, @startDate) AS DATE) AS submissionMonth
            UNION ALL
            SELECT DATEADD(MONTH, 1, submissionMonth)
            FROM Months
            WHERE DATEADD(MONTH, 1, submissionMonth) <= @endDate
        ),

        KPI_Dealer_Months AS (
            SELECT 
                m.submissionMonth,
                k.*,
                d.DealerId
            FROM Months m
            CROSS JOIN (
                SELECT Id, KPIName, Department, ViewType, Units, Goodness
                FROM KPIDetails
                ${kpiIdCondition}
            ) k
            CROSS JOIN (
                SELECT DISTINCT DealerId 
                FROM DealerKPIValue
            ) d
        ),

        ActualData AS (
            SELECT 
                DATEFROMPARTS(YEAR(SubmissionTime), MONTH(SubmissionTime), 1) AS submissionMonth,
                dv.*,
                cemn.CompConfigId,
                del.DealerName,
                del.LATCoordinate,
                del.LONCoordinate
            FROM DealerKPIValue dv
            INNER JOIN CompositeEntityMappingNormalized cemn
                ON dv.DealerId = cemn.EntityId AND cemn.CompConfigId != 1
            INNER JOIN DealerMaster del
                ON dv.DealerId = del.DealerId
            WHERE  dv.SubmissionTime BETWEEN @startDate AND EOMONTH(@endDate)
        )

        SELECT 
            kdm.Department,
            kdm.KPIName,
            kdm.ViewType,
            kdm.Units,
            kdm.Goodness,
            kdm.submissionMonth,
            kdm.Id,
            kdm.DealerId,
            ISNULL(ad.mValue, 0) AS MValue,
            ISNULL(ad.yValue, 0) AS YValue,
            ad.CompConfigId,
            ad.DealerName,
            ad.LATCoordinate,
            ad.LONCoordinate
        FROM KPI_Dealer_Months kdm
        LEFT JOIN ActualData ad
            ON kdm.Id = ad.Id
            AND kdm.DealerId = ad.DealerId
            AND kdm.submissionMonth = ad.submissionMonth
        WHERE ad.CompConfigId IS NOT NULL
        ORDER BY 
            kdm.KPIName ASC,
            ad.ViewType ASC,
            kdm.submissionMonth ASC
        OPTION (MAXRECURSION 1000);
    `;

  const result = await request.query(query);

  return result.recordset;
};

