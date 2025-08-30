// utils/responseFormatter.js

/**
 * Formats KPI dashboard data based on the selected filter type (YTH/MTH).
 * Adds current/previous values, average, cumulative, and YoY comparison (all calculated).
 * 
 * @param {Array} records - Raw KPI records from the DB.
 * @param {String} filterType - Filter type: 'YTH' or 'MTH'.
 * @returns {Array} Formatted KPI data.
 */
export function formatKpiDashboardResponse(records, filterType) {
    
    return records.map((row) => {
        let currentValue, prevValue;
        let avgValue, prevAvgValue;
        let cumValue, prevCumValue;

        if (filterType === 'YTH') {
            currentValue = row.YValue;
            prevValue = row.prevYValue;

            avgValue = row.AVGYValue;
            prevAvgValue = row.PrevAVGYValue;

            cumValue = row.CUMYValue;
            prevCumValue = row.PrevCUMYValue;
        } else if (filterType === 'MTH') {
            currentValue = row.MValue;
            prevValue = row.prevMValue;

            avgValue = row.AVGMValue;
            prevAvgValue = row.PrevAVGMValue;

            cumValue = row.CUMMValue;
            prevCumValue = row.PrevCUMMValue;
        }

        // Calculate all YoY values safely
        const calculateYoY = (current, previous) => {
            if (previous !== 0 && previous != null && current != null) {
                return Number(((current - previous) / previous * 100).toFixed(2));
            }
            return null;
        };

        return {
            id: row.id,
            kpiId: row.KPIId,
            name: row.KPIName,
            department: row.Department,
            userId: row.UserId,
            submissionTime: row.SubmissionTime,
            rank: row.rank ?? null,

            currentValue: currentValue != null ? Number(currentValue) : null,
            prevValue: prevValue != null ? Number(prevValue) : null,
            yoy: calculateYoY(currentValue, prevValue),

            avgValue: avgValue != null ? Number(avgValue.toFixed(2)) : null,
            prevAvgValue: prevAvgValue != null ? Number(prevAvgValue.toFixed(2)) : null,
            avgYoY: calculateYoY(avgValue, prevAvgValue),

            cumValue: cumValue != null ? Number(cumValue.toFixed(2)) : null,
            prevCumValue: prevCumValue != null ? Number(prevCumValue.toFixed(2)) : null,
            cumYoY: calculateYoY(cumValue, prevCumValue),
        };
    });
}
