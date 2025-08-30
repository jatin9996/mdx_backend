import { bottomTableKpiIds, compIdToZoneName, compositeFieldsGroup, dealerFieldsGroup, EntityType, KPI_NAMES, mapKpiIdToTitle, moneyFlowKpiIds, netowrkRosKpis, networkBubbleChartKpis, networkChartKpis, networkLinesKpis, networkStatesKpis, networkStatesKpisToTitle, pieChartKpiIds, statesKpiIds, VIEW_Type } from "../const/index.js";
import { getCompositeKpiDataBySubmissionRange, getCompositeKPINetowrkDashValuesByMonth, getCompositionKPIValuesByMonth } from "../repository/compositeKPIValue.repository.js";
import { dealerNewNetowrkDashKpiByMonth, getDealerKpiDataBySubmissionRange, getDealerKPINetowrkDashValuesByMonth, getDealerKPIValuesByMonth } from "../repository/dealerKpiValue.repository.js";
import { cpmpositeNetowrkMapper, dealerCashFlowDataMapper, fillMissingMonths, getStartAndEndDatesFromMonthYear, getStartAndEndDatesOf24FromMonthYear, mapCompositionKpiDashboardData, mapDealerKpiDashboardData, mapDealerNetowrkData, mapNetowrkNetowrkData } from "../utils/utils.js";

export const getDashboardStatesByEntity = async (params) => {
    const {
        entityId,
        startDate,
        endDate,
        twelveMonthsAgo,
        entityType
    } = params;

    const res = {
        newVehicle: [],
        totalJobs: [],
        sra: [],
        netDiscount: [],
        grossProfit: [],
    };

    if (entityType === EntityType.DEALER || entityType === EntityType.COMPOSITE) {
        const isDealer = entityType === EntityType.DEALER;
        const getDataFn = isDealer ? getDealerKpiDataBySubmissionRange : getCompositeKpiDataBySubmissionRange;
        const idField = isDealer ? { dealerId: entityId } : { compId: entityId };
        const fieldsGroup = isDealer ? dealerFieldsGroup : compositeFieldsGroup;

        const [
            newVehicle,
            totalJobs,
            sra,
            netDiscount,
            grossProfit
        ] = await Promise.all([
            getDataFn({ ...idField, kpiName: KPI_NAMES.NEW_VEHICLE, startDate, endDate }),
            getDataFn({ ...idField, kpiName: KPI_NAMES.TOTAL_JOBS, startDate, endDate }),
            getDataFn({ ...idField, kpiName: KPI_NAMES.SRA, startDate, endDate }),
            getDataFn({ ...idField, kpiName: KPI_NAMES.NET_DISCOUNT, startDate, endDate, viewType: VIEW_Type.PER_UNIT }),
            getDataFn({ ...idField, kpiName: KPI_NAMES.GROSS_PROFIT, startDate: twelveMonthsAgo, endDate, viewType: VIEW_Type.TOTAL })
        ]);

        res.newVehicle = fillMissingMonths(newVehicle, startDate, endDate, fieldsGroup);
        res.totalJobs = fillMissingMonths(totalJobs, startDate, endDate, fieldsGroup);
        res.sra = fillMissingMonths(sra, startDate, endDate, fieldsGroup, true);
        res.netDiscount = fillMissingMonths(netDiscount, startDate, endDate, fieldsGroup);
        res.grossProfit = fillMissingMonths(grossProfit, twelveMonthsAgo, endDate, fieldsGroup);
    }

    return res;
};

export const getDealerStatesData = async (query) => {
    const {
        baseEntityId,
        baseEntityType,
        comparisonEntityId,
        comparisonEntityType,
        startMonth,
        startYear,
        endMonth,
        endYear,
    } = query;

    const startDate = new Date(startYear, startMonth - 1, 1);
    const endDate = new Date(endYear, endMonth, 0);
    const twelveMonthsAgo = new Date(endDate.getFullYear(), endDate.getMonth() - 11, 1);

    const [baseStates, compositeStates] = await Promise.all([
        getDashboardStatesByEntity({
            entityId: baseEntityId,
            entityType: baseEntityType,
            startDate,
            endDate,
            twelveMonthsAgo
        }),
        getDashboardStatesByEntity({
            entityId: comparisonEntityId,
            entityType: comparisonEntityType,
            startDate,
            endDate,
            twelveMonthsAgo
        })
    ]);

    const result = {
        baseStates: [
            {
                title: "Vehicle Sold",
                data: baseStates.newVehicle
            },
            {
                title: "Total Repair Orders",
                data: baseStates.totalJobs
            },
            {
                title: "SAR (K-Factor)",
                data: baseStates.sra
            },
            {
                title: "Net Discount (Per Car)",
                data: baseStates.netDiscount
            },
        ],
        compositeStates: [
            {
                title: "Vehicle Sold",
                data: compositeStates.newVehicle
            },
            {
                title: "Total Repair Orders",
                data: compositeStates.totalJobs
            },
            {
                title: "SAR (K-Factor)",
                data: compositeStates.sra
            },
            {
                title: "Net Discount (Per Car)",
                data: compositeStates.netDiscount
            },
        ],
        grossProfit: {
            baseStates: baseStates.grossProfit,
            compositeStates: compositeStates.grossProfit
        }
    }

    return result;
}

export const getDealerCashflowData = async (params) => {
    const {
        dealerId,
        startMonth,
        startYear,
        endMonth,
        endYear,
    } = params;

    const startDate = new Date(startYear, startMonth - 1, 1);
    const endDate = new Date(endYear, endMonth, 0);

    const commonParam = {
        dealerId: dealerId,
        startDate,
        endDate,
        viewType: VIEW_Type.TOTAL
    }

    let [
        totalSalesTurnOver,
        totalPmgrTurnOver,
        totalBodyPaintsTurnover,
        totalPartsTurnover,
        personnelExpenses,
        rentExpense,
        ros,
        interestShortTerm,
        interestLongTerm,
        netMarketingExpenses,
        demoCarCourtesyCarExpenses,
        miscellaeousExpenses,
        totalDepreciation
    ] = await Promise.all([
        getDealerKpiDataBySubmissionRange({ ...commonParam, kpiName: KPI_NAMES.TOTAL_SALES_TURNOVER_NEW_PLUS_USED_VEHICLE }),
        getDealerKpiDataBySubmissionRange({ ...commonParam, kpiName: KPI_NAMES.TOTAL_PMGR_TURNOVER }),
        getDealerKpiDataBySubmissionRange({ ...commonParam, kpiName: KPI_NAMES.TOTAL_BODY_PAINTS_TURNOVER }),
        getDealerKpiDataBySubmissionRange({ ...commonParam, kpiName: KPI_NAMES.TOTAL_PARTS_TURNOVER }),
        getDealerKpiDataBySubmissionRange({ ...commonParam, kpiName: KPI_NAMES.PERSONNEL_EXPENSES }),
        getDealerKpiDataBySubmissionRange({ ...commonParam, kpiName: KPI_NAMES.RENT_EXPENSE }),
        getDealerKpiDataBySubmissionRange({ ...commonParam, kpiName: KPI_NAMES.ROS }),
        getDealerKpiDataBySubmissionRange({ ...commonParam, kpiName: KPI_NAMES.TNTEREST_SHORT_TERM }),
        getDealerKpiDataBySubmissionRange({ ...commonParam, kpiName: KPI_NAMES.INTEREST_LONG_TERM }),
        getDealerKpiDataBySubmissionRange({ ...commonParam, kpiName: KPI_NAMES.NET_MARKETING_EXPENSES }),
        getDealerKpiDataBySubmissionRange({ ...commonParam, kpiName: KPI_NAMES.DEMO_CAR_COURTESY_CAR_EXPENSES }),
        getDealerKpiDataBySubmissionRange({ ...commonParam, kpiName: KPI_NAMES.MISCELLANEOUS_EXPENSES }),
        getDealerKpiDataBySubmissionRange({ ...commonParam, kpiName: KPI_NAMES.TOTAL_DEPRECIATION }),
    ]);

    const states = [
        dealerCashFlowDataMapper(totalSalesTurnOver, KPI_NAMES.TOTAL_SALES_TURNOVER_NEW_PLUS_USED_VEHICLE, "Total Sales (Incl. Used)"),
        dealerCashFlowDataMapper(totalPmgrTurnOver, KPI_NAMES.TOTAL_PMGR_TURNOVER, "PMGR Revenue"),
        dealerCashFlowDataMapper(totalBodyPaintsTurnover, KPI_NAMES.TOTAL_BODY_PAINTS_TURNOVER, "Bodyshop Revenue"),
        dealerCashFlowDataMapper(totalPartsTurnover, KPI_NAMES.TOTAL_PARTS_TURNOVER, "Parts Revenue"),
        dealerCashFlowDataMapper(personnelExpenses, KPI_NAMES.PERSONNEL_EXPENSES, "Manpower"),
        dealerCashFlowDataMapper(rentExpense, KPI_NAMES.RENT_EXPENSE, "Rent"),
        dealerCashFlowDataMapper([...interestShortTerm, ...interestLongTerm], "", "Finance Cost"),
        dealerCashFlowDataMapper([...netMarketingExpenses, ...demoCarCourtesyCarExpenses, ...miscellaeousExpenses, ...totalDepreciation], "", "Other Expenses"),
    ];

    return {
        states,
        ros: dealerCashFlowDataMapper(ros, KPI_NAMES.ROS, "ROS"),
    };
}

export const getNetworkDashboardStatesByEntity = async (params) => {
    const {
        entityId,
        startDate,
        endDate,
        entityType,
        entity
    } = params;

    const res = {
        ros: [],
        newVehicles: [],
        totalJobs: [],
        sra: []
    };

    if (entityType === EntityType.DEALER || entityType === EntityType.COMPOSITE) {
        const isDealer = entityType === EntityType.DEALER;
        const getDataFn = isDealer ? getDealerKpiDataBySubmissionRange : getCompositeKpiDataBySubmissionRange;
        const idField = isDealer ? { dealerId: entityId } : { compId: entityId };
        const fieldsGroup = isDealer ? dealerFieldsGroup : compositeFieldsGroup;

        const [
            ros,
            newVehicles,
            totalJobs,
            sra
        ] = await Promise.all([
            getDataFn({ ...idField, kpiName: KPI_NAMES.ROS, startDate, endDate, viewType: VIEW_Type.TOTAL }),
            getDataFn({ ...idField, kpiName: KPI_NAMES.NEW_VEHICLE, startDate, endDate, viewType: VIEW_Type.TOTAL }),
            getDataFn({ ...idField, kpiName: KPI_NAMES.TOTAL_JOBS, startDate, endDate, viewType: VIEW_Type.TOTAL }),
            getDataFn({ ...idField, kpiName: KPI_NAMES.SRA, startDate, endDate, viewType: VIEW_Type.TOTAL }),
        ]);

        console.log(ros[0]);
        console.log(newVehicles[0]);
        console.log(totalJobs[0]);
        console.log(sra[0]);


        res.ros = fillMissingMonths(ros, startDate, endDate, fieldsGroup, true);
        res.newVehicles = fillMissingMonths(newVehicles, startDate, endDate, fieldsGroup);
        res.totalJobs = fillMissingMonths(totalJobs, startDate, endDate, fieldsGroup);
        res.sra = fillMissingMonths(sra, startDate, endDate, fieldsGroup, true);
    }

    const result = {
        id: entityId,
        ...(entityType === EntityType.DEALER && {
            title: entity.DealerName,
            lat: entity?.LATCoordinate,
            long: entity?.LONCoordinate,
        }),
        ...(entityType === EntityType.COMPOSITE && {
            title: entity.DisplayName,
            fullName: entity.FullName
        }),
        kpis: [
            {
                name: "ROS (Return on Sales)",
                isPercentage: true,
                data: res.ros
            },
            {
                name: "New Vehicle (Units Sold)",
                isPercentage: true,
                data: res.newVehicles
            },
            {
                name: "Total Jobs",
                isPercentage: true,
                data: res.totalJobs
            },
            {
                name: "SAR (Absorption Ratio)",
                isPercentage: true,
                daa: res.sra
            }
        ]
    };

    return result;
};

export const networkDashboardKPIDataOfAllDelaer = async (query) => {
    const { month, year } = query;
    const { startDate, endDate, } = getStartAndEndDatesOf24FromMonthYear(month, year);
    const kpiIds = [3318, 3319, 3321, 3391];

    const [dealerDataList, compositeDataList] = await Promise.all([
        getDealerKPINetowrkDashValuesByMonth({
            startDate,
            endDate,
            kpiIds
        }),
        getCompositeKPINetowrkDashValuesByMonth({
            startDate,
            endDate,
            kpiIds
        })
    ]);

    return {
        dealerDataList: mapDealerNetowrkData(dealerDataList, true),
        compositeDataList: mapNetowrkNetowrkData(compositeDataList)
    };
}

export const kpiDashboardData = async (query) => {
    const { month, year, dealerId } = query;
    const { startDate, endDate, } = getStartAndEndDatesFromMonthYear(month, year);

    const result = await getDealerKPIValuesByMonth({
        dealerId,
        startDate,
        endDate,
    });

    return mapDealerKpiDashboardData(result);
}

export const kpiCompositionDataByCompositionId = async (query) => {
    const { month, year, compositionId } = query;
    const { startDate, endDate, } = getStartAndEndDatesFromMonthYear(month, year);

    const result = await getCompositionKPIValuesByMonth({
        compositionId,
        startDate,
        endDate
    });

    return mapCompositionKpiDashboardData(result);
}

export const newDealerDashboardKpis = async (query) => {
    const { month, year, dealerId } = query;
    const { startDate, endDate } = getStartAndEndDatesFromMonthYear(month, year);

    const kpiIds = [
        ...statesKpiIds,
        ...pieChartKpiIds,
        ...moneyFlowKpiIds,
        ...bottomTableKpiIds
    ];

    const [dealerDataList] = await Promise.all([
        getDealerKPIValuesByMonth({
            startDate,
            endDate,
            kpiIds,
            dealerId
        }),
    ]);

    const mappedKpiData = mapDealerKpiDashboardData(dealerDataList);
    const kpiIdToDataMap = Object.fromEntries(
        mappedKpiData.map(kpi => [kpi.Id, kpi])
    );

    const getKpiDataWithTitle = (id) => {
        const kpi = kpiIdToDataMap[id];
        return kpi ? {
            title: mapKpiIdToTitle[id] ?? "",
            ...kpi,
        } : null;
    };

    const buildSectionData = (ids) =>
        ids.map(id => getKpiDataWithTitle(id)).filter(Boolean);

    const statesKpiData = buildSectionData(statesKpiIds);
    const pieChartKpiData = buildSectionData(pieChartKpiIds);
    const bottomTableKpiData = buildSectionData(bottomTableKpiIds);

    const moneyFlowKpiData = [];

    for (let i = 0; i < moneyFlowKpiIds.length; i++) {
        const id = moneyFlowKpiIds[i];

        if (id === 3358) {
            const kpi3358 = kpiIdToDataMap[3358];
            const kpi3359 = kpiIdToDataMap[3359];

            if (kpi3358 && kpi3359) {
                const mergedData = kpi3358.data.map((entry, index) => {
                    const secondEntry = kpi3359.data[index] || {};
                    return {
                        submissionMonth: entry.submissionMonth,
                        mValue: (entry.mValue || 0) + (secondEntry.mValue || 0),
                        yValue: (entry.yValue || 0) + (secondEntry.yValue || 0)
                    };
                });

                moneyFlowKpiData.push({
                    ...kpi3358,
                    title: mapKpiIdToTitle[3358] ?? "",
                    data: mergedData
                });
            }
        } else if (id !== 3359) {
            const kpiItem = getKpiDataWithTitle(id);
            if (kpiItem) moneyFlowKpiData.push(kpiItem);
        }
        // Skips 3359 entirely
    }

    return {
        statesKpiData,
        pieChartKpiData,
        moneyFlowKpiData,
        bottomTableKpiData
    };
};

export const newDealerCompositeDataDashboardKpis = async (query) => {
    const { month, year } = query;
    const { startDate, endDate } = getStartAndEndDatesFromMonthYear(month, year);

    const kpiIds = [
        ...bottomTableKpiIds
    ];

    const [dealerDataList] = await Promise.all([
        getCompositeKPINetowrkDashValuesByMonth({
            startDate,
            endDate,
            kpiIds,
        }),
    ]);

    const compIdToKpiMap = {};

    dealerDataList.map(it => {
        if (!compIdToKpiMap[it?.CompConfigId]) {
            compIdToKpiMap[it?.CompConfigId] = [];
        }

        compIdToKpiMap[it?.CompConfigId].push(it);
    })

    const response = [];
    Object.entries(compIdToKpiMap).forEach(([key, value]) => {
        const bottomTableKpiData = mapCompositionKpiDashboardData(compIdToKpiMap[key]);
        const mappedKpiData = {};

        bottomTableKpiData.forEach(it => {
            mappedKpiData[it.Id] = it;
        });

        response.push(bottomTableKpiIds.map(it => mappedKpiData[it]));
    });


    return {
        bottomTableKpiData: response
    };
};

export const kpiNewNetworkDashBoardData = async (query) => {
    const { month, year } = query;
    const { startDate, endDate } = getStartAndEndDatesFromMonthYear(month, year);
    const kpiIds = [
        ...networkChartKpis,
        ...networkStatesKpis,
        ...networkLinesKpis,
        ...networkBubbleChartKpis
    ];

    const compositeKpiData = await getCompositeKPINetowrkDashValuesByMonth({
        startDate,
        endDate,
        kpiIds
    });

    const compositeMappedData = mapNetowrkNetowrkData(compositeKpiData);

    return cpmpositeNetowrkMapper(compositeMappedData);
}


export const kpiNetowrkDashboarDelarData = async (query) => {
    const { month, year } = query;
    const { startDate, endDate } = getStartAndEndDatesFromMonthYear(month, year);
    const kpiIds = [
        ...networkStatesKpis,
        ...netowrkRosKpis
    ];

    const data = await dealerNewNetowrkDashKpiByMonth({
        startDate,
        endDate,
        kpiIds
    });

    let mappedDealerData = mapDealerNetowrkData(data);
    mappedDealerData = mappedDealerData.map(dealer => {
        const map = {};
        dealer.kpis.forEach(it => {
            map[it.kpiId] = it;
        });
        const kpis = [];
        networkStatesKpis.forEach(id => {
            kpis.push({
                title: networkStatesKpisToTitle[id],
                ...(map[id] && map[id])
            });
        })

        return {
            ...dealer,
            zone: compIdToZoneName[dealer.compoId],
            kpis
        }
    })

    const compToDealerMap = {
        2: [],
        3: [],
        4: [],
        5: []
    };

    mappedDealerData.forEach(it => {
        compToDealerMap[it.compoId]?.push(it);
    })

    return {
        compToDealerMap,
        dealerList: mappedDealerData
    };
}
