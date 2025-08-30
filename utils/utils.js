import dayjs from 'dayjs';
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import utc from 'dayjs/plugin/utc.js';
import { networkBubbleChartKpis, networkChartKpis, networkLinesKpis, networkStatesKpis, networkStatesKpisToTitle } from '../const/index.js';

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

export function getDateRange(filterType, year, month) {
    const selectedYear = parseInt(year);
    const selectedMonth = parseInt(month);

    if (isNaN(selectedYear) || isNaN(selectedMonth) || selectedMonth < 1 || selectedMonth > 12) {
        throw new Error("Invalid year or month");
    }

    let fromDate, toDate;

    if (filterType === "MTH") {
        fromDate = new Date(selectedYear, selectedMonth - 1, 1);
        toDate = new Date(selectedYear, selectedMonth, 0);
    } else if (filterType === "YTH") {
        fromDate = new Date(selectedYear, 0, 1);
        toDate = new Date(selectedYear, selectedMonth, 0);
    } else {
        throw new Error("Invalid filterType, must be 'MTH' or 'YTH'");
    }

    return {
        fromDate: fromDate.toISOString().split("T")[0],
        toDate: toDate.toISOString().split("T")[0],
        prevYearFromDate: new Date(fromDate.setFullYear(fromDate.getFullYear() - 1)).toISOString().split("T")[0],
        prevYearToDate: new Date(toDate.setFullYear(toDate.getFullYear() - 1)).toISOString().split("T")[0]
    };
}


export function fillMissingMonths(data, startDate, endDate, expectedFields, inPercentage = false) {
    const result = [];
    const dataMap = new Map();

    data.forEach(item => {
        const key = dayjs(item.SubmissionTime).utc().format('YYYY-MM');
        dataMap.set(key, item);
    });

    let current = dayjs(endDate).utc().startOf('month');
    const start = dayjs(startDate).utc().startOf('month');

    while (current.isSame(start) || current.isAfter(start)) {
        const key = current.format('YYYY-MM');
        const item = dataMap.get(key);
        const filledItem = {
            date: current.toDate(),
            inPercentage
        };

        for (const field of expectedFields) {
            filledItem[field] = item?.[field] ?? 0;
        }

        result.push(filledItem);

        current = current.subtract(1, 'month');
    }

    return result;
}

export const dealerCashFlowDataMapper = (dataList, kpi, title) => {
    let MValue = 0;
    let YValue = 0;

    dataList.forEach((it) => {
        MValue += it.MValue;
        YValue += it.YValue;
    });

    return {
        kpi,
        title,
        MValue,
        YValue
    };
}

export function getStartAndEndDatesFromMonthYear(month, year) {
    const startDate = new Date(year - 1, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
    };
}

export function getStartAndEndDatesOf24FromMonthYear(month, year) {
    const startDate = new Date(year - 2, month, 1);
    const endDate = new Date(year, month, 0);

    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
    };
}

export function mapDealerKpiDashboardData(rawData) {
    const resultMap = new Map();
    for (const row of rawData) {
        const {
            Id,
            Department,
            KPIName,
            ViewType,
            Units,
            Goodness,
            DealerId,
            mValue,
            yValue,
            submissionMonth
        } = row;
        if (!resultMap.has(Id)) {
            resultMap.set(Id, {
                Id,
                Department,
                KPIName,
                ViewType,
                Units,
                Goodness,
                DealerId,
                data: []
            });
        }

        resultMap.get(Id).data.push({
            mValue,
            yValue,
            submissionMonth
        });
    }

    return Array.from(resultMap.values());
}

export function mapCompositionKpiDashboardData(rawData) {
    const resultMap = new Map();
    for (const row of rawData) {
        const {
            Id,
            Department,
            KPIName,
            ViewType,
            Units,
            Goodness,
            CompConfigId,
            AVGMValue,
            AVGYValue,
            CUMMValue,
            CUMYValue,
            submissionMonth
        } = row;
        if (!resultMap.has(Id)) {
            resultMap.set(Id, {
                Id,
                Department,
                KPIName,
                ViewType,
                Units,
                Goodness,
                CompConfigId,
                data: []
            });
        }

        resultMap.get(Id).data.push({
            AVGMValue,
            AVGYValue,
            CUMMValue,
            CUMYValue,
            submissionMonth
        });
    }

    return Array.from(resultMap.values());
}

const kpiIdToName = {
    3318: "ROS (Return on Sales)",
    3319: "SAR (Absorption Ratio)",
    3321: "New Vehicle (Units Sold)",
    3391: "Total Jobs"
};

export function mapDealerNetowrkData(dealerDataList, useKpiName = false) {
    const dealerMap = new Map();

    dealerDataList.forEach(item => {
        if (!dealerMap.has(item.DealerId)) {
            dealerMap.set(item.DealerId, {
                id: item.DealerId,
                title: item.DealerName,
                lat: item.LATCoordinate,
                long: item.LONCoordinate,
                compoId: item.CompConfigId,
                dealerName: item.DealerName,
                kpis: []
            });
        }

        const dealer = dealerMap.get(item.DealerId);
        const kpiName = useKpiName ? kpiIdToName[item.KPIId] : item.KPIName; // fallback to original name
        const isPercentage = item.KPIId === 3318;

        let kpi = dealer.kpis.find(k => k.name === kpiName);

        if (!kpi) {
            kpi = {
                kpiId: item.Id,
                name: kpiName,
                isPercentage,
                ViewType: item?.ViewType,
                Units: item?.Units,
                Goodness: item?.Goodness,
                department: item?.Department,
                data: [],
            };
            dealer.kpis.push(kpi);
        }

        kpi.data.push({
            date: item.submissionMonth,
            inPercentage: isPercentage,
            MValue: item.MValue,
            YValue: item.YValue
        });
    });

    // Optional: sort KPI data by date descending
    dealerMap.forEach(dealer => {
        dealer.kpis.forEach(kpi => {
            kpi.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        });
    });

    return Array.from(dealerMap.values());
}


export function mapNetowrkNetowrkData(compositeDataList) {
    const configMap = new Map();

    compositeDataList.forEach(item => {
        if (!configMap.has(item.CompConfigId)) {
            configMap.set(item.CompConfigId, {
                id: item.CompConfigId,
                title: item.DisplayName,
                fullName: item.FullName,
                kpis: []
            });
        }

        const config = configMap.get(item.CompConfigId);
        const kpiName = kpiIdToName[item.Id] || item.KPIName;
        const isPercentage = item.Id === 3318 || item.Id == 3319;
        const department = item.Department;
        const goodness = item.Goodness;
        const viewType = item.ViewType;
        const kpiId = item.Id;

        let kpi = config.kpis.find(k => k.kpiId === kpiId);

        if (!kpi) {
            kpi = {
                kpiId,
                name: kpiName,
                isPercentage,
                department,
                goodness,
                viewType,
                data: []
            };
            config.kpis.push(kpi);
        }

        kpi.data.push({
            date: item.submissionMonth,
            inPercentage: isPercentage,
            CUMMValue: item.CUMMValue,
            CUMYValue: item.CUMYValue,
            AVGMValue: item.AVGMValue,
            AVGYValue: item.AVGYValue
        });
    });

    // Sort each KPI's data by date in descending order
    configMap.forEach(config => {
        config.kpis.forEach(kpi => {
            kpi.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        });
    });

    return Array.from(configMap.values());
}

export const cpmpositeNetowrkMapper = (compositeKpiDataList) => {
    const result = [];

    compositeKpiDataList.forEach(it => {
        const kpiIdtoDataMap = {};
        it.kpis.forEach(kpiData => {
            kpiIdtoDataMap[kpiData.kpiId] = kpiData;
        });
        const chartKpi = kpiIdtoDataMap[networkChartKpis[0]];

        const statesKpis = [];
        networkStatesKpis.forEach(id => {
            statesKpis.push({
                title: networkStatesKpisToTitle[id],
                ...kpiIdtoDataMap[id]
            });
        });

        const linesKpis = [];
        networkLinesKpis.forEach(id => {
            linesKpis.push(kpiIdtoDataMap[id]);
        });

        const bubblechartKpis = [];
        networkBubbleChartKpis.forEach(id => {
            bubblechartKpis.push(kpiIdtoDataMap[id]);
        });

        delete it.kpis;
        result.push({
            ...it,
            kpis: {
                chartKpi,
                statesKpis,
                linesKpis,
                bubblechartKpis
            }
        })
    });

    return result;
}

