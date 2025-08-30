export function getKpiDashboardQuery() {
    return `
    -- CTE to get raw KPI, Composite KPI, and previous Y/M values
    WITH FullData AS (
        SELECT 
            kd.Id AS Id,
            kd.KPIId,
            kd.KPIName,
            dkv.Department,
            kd.Calculation,
            dkv.DealerId AS UserId,
            dkv.SubmissionTime,
            dkv.YValue,
            dkv.MValue,
            LAG(dkv.YValue) OVER (PARTITION BY dkv.Id, dkv.DealerId ORDER BY dkv.SubmissionTime) AS prevYValue,
            LAG(dkv.MValue) OVER (PARTITION BY dkv.Id, dkv.DealerId ORDER BY dkv.SubmissionTime) AS prevMValue,
            ckv.AVGYValue,
            LAG(ckv.AVGYValue) OVER (PARTITION BY ckv.Id ORDER BY ckv.SubmissionTime) AS PrevAVGYValue,
            ckv.AVGMValue,
            LAG(ckv.AVGMValue) OVER (PARTITION BY ckv.Id ORDER BY ckv.SubmissionTime) AS PrevAVGMValue,
            ckv.CUMYValue,
            LAG(ckv.CUMYValue) OVER (PARTITION BY ckv.Id ORDER BY ckv.SubmissionTime) AS PrevCUMYValue,
            ckv.CUMMValue,
            LAG(ckv.CUMMValue) OVER (PARTITION BY ckv.Id ORDER BY ckv.SubmissionTime) AS PrevCUMMValue
        FROM DealerKPIValue dkv
        INNER JOIN KPIDetails kd ON dkv.Id = kd.Id
        LEFT JOIN CompositeKPIValue ckv 
            ON dkv.Id = ckv.Id 
            AND dkv.Department = ckv.Department 
            AND dkv.SubmissionTime = ckv.SubmissionTime
    )

    SELECT 
        f.SubmissionTime,
        f.KPIId,
        f.KPIName,
        f.Department,
        f.UserId,
        f.YValue,
        f.prevYValue,
        f.MValue,
        f.prevMValue,
        f.AVGYValue,
        f.PrevAVGYValue,
        CASE 
            WHEN f.PrevAVGYValue IS NOT NULL AND f.PrevAVGYValue != 0 
            THEN ((f.AVGYValue - f.PrevAVGYValue) / f.PrevAVGYValue) * 100
            ELSE NULL 
        END AS AVGY_YoY,
        f.AVGMValue,
        f.PrevAVGMValue,
        CASE 
            WHEN f.PrevAVGMValue IS NOT NULL AND f.PrevAVGMValue != 0 
            THEN ((f.AVGMValue - f.PrevAVGMValue) / f.PrevAVGMValue) * 100
            ELSE NULL 
        END AS AVGM_YoY,
        f.CUMYValue,
        f.PrevCUMYValue,
        CASE 
            WHEN f.PrevCUMYValue IS NOT NULL AND f.PrevCUMYValue != 0 
            THEN ((f.CUMYValue - f.PrevCUMYValue) / f.PrevCUMYValue) * 100
            ELSE NULL 
        END AS CUMY_YoY,
        f.CUMMValue,
        f.PrevCUMMValue,
        CASE 
            WHEN f.PrevCUMMValue IS NOT NULL AND f.PrevCUMMValue != 0 
            THEN ((f.CUMMValue - f.PrevCUMMValue) / f.PrevCUMMValue) * 100
            ELSE NULL 
        END AS CUMM_YoY
    FROM FullData f
    WHERE 
        f.SubmissionTime BETWEEN @fromDate AND @toDate
        AND (@userId IS NULL OR f.UserId = @userId)
        AND (@department IS NULL OR f.Department = @department)
        AND f.UserId != 45
    ORDER BY 
        f.SubmissionTime, 
        f.UserId, 
        f.KPIName
    OFFSET ((@pageNumber - 1) * @pageSize) ROWS
    FETCH NEXT @pageSize ROWS ONLY;
  `;
}
