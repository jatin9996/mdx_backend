export const EntityType = Object.freeze({
    DEALER: "DEALER",
    INVESTOR: "INVESTOR",
    COMPOSITE: 'COMPOSITE'
});

export const TimePeriod = Object.freeze({
    YTD: "YTD",
    MTD: "MTD",
    CUSTOM: "CUSTOM"
});

export const CompositeType = Object.freeze({
    CUM: "CUM",
    AVG: "AVG"
});

export const dealerFieldsGroup = ['MValue', 'YValue'];
export const compositeFieldsGroup = [
    'CUMMValue',
    'CUMYValue',
    'AVGYValue',
    'AVGMValue',
];

export const KPI_NAMES = Object.freeze({
    NEW_VEHICLE: "New Vehicle (Units Sold)",
    TOTAL_JOBS: "Total Jobs - (Incl. PMGR + Body Repairs)",
    SRA: "SAR (Service Absorption Ratio)",
    NET_DISCOUNT: "Net Discount",
    GROSS_PROFIT: "Total Dealership Gross Profit",
    TOTAL_SALES_TURNOVER_NEW_PLUS_USED_VEHICLE: "Total Sales Turnover (New + Used Vehicle)",
    TOTAL_PMGR_TURNOVER: "Total PMGR Turnover",
    TOTAL_BODY_PAINTS_TURNOVER: "Total Body Paints Turnover",
    TOTAL_PARTS_TURNOVER: "Total Parts Turnover",
    PERSONNEL_EXPENSES: "Personnel Expenses",
    RENT_EXPENSE: "Rent Expense",
    ROS: "RoS (Return on Sales)",
    TNTEREST_SHORT_TERM: "Interest - Short Term",
    INTEREST_LONG_TERM: "Interest - Long Term",
    NET_MARKETING_EXPENSES: "Net Marketing Expenses",
    DEMO_CAR_COURTESY_CAR_EXPENSES: "Demo Car / Courtesy Car Expenses",
    MISCELLANEOUS_EXPENSES: "Miscellaneous Expenses",
    TOTAL_DEPRECIATION: "Total Depreciation",
});

export const VIEW_Type = Object.freeze({
    PER_UNIT: "Per Unit",
    TOTAL: "Total"
});

export const statesKpiIds = [
    3321,
    3391,
    3405,
    3319
];

export const pieChartKpiIds = [
    3444,
    3453,
    3384,
    3386,
    3615
];

export const moneyFlowKpiIds = [
    3375,
    3341,
    3323,
    3380,
    3345,
    3349,
    3353,
    3457,
    3446,
    3314,
    3356,
    3358,
    3359,
    3357,
    3360,
    3362,
    3363,
    3361,
    3316
];

export const bottomTableKpiIds = [
    3408,
    3405,
    3847,
    3683,
    3332,
    3333,
    3323,
    3508,
    3509,
    3510,
    3535,
    3663,
    3664,
    3649,
    3661
];

export const mapKpiIdToTitle = {
    3321: "Vehicle Sold",
    3391: "Total Repair Orders",
    3405: "Net Discount",
    3319: "SAR (K-Factor)",
    3444: "NV Dept. GP- Per Unit",
    3453: "UV Dept. GP- Per Unit",
    3384: "PMGR Dept. GP- Per Unit",
    3386: "BP Dept. GP- Per Unit",
    3615: "Parts Dept. GP- Per Unit",
    3375: "New Vehicle",
    3341: "Pre Owned",
    3323: "Bonuses",
    3380: "F&I",
    3345: "PMGR (Incl Allied)",
    3349: "BP",
    3353: "Parts",
    3457: "Accessories",
    3446: "Other Income",
    3314: "Total Gross Profit",
    3356: "Manpower",
    3358: "Interest",
    3359: "Interest",
    3357: "Rent",
    3360: "Marketing",
    3362: "Depreciation",
    3363: "Miscellaneous",
    3361: "Test Drive/ Courtesy Cars",
    3316: "PBT",
}

export const networkChartKpis = [
    3316,
];

export const networkStatesKpis = [
    3318,
    3321,
    3391,
    3319
];

export const networkStatesKpisToTitle = {
    3318: "ROS (Return on Sales)(Total)",
    3321: "New Vehicle + Used Vehicle",
    3391: "Aftersales (PMGR + BP + PARTS)",
    3319: "SAR (Service Absorption Ratio)"
}

export const networkLinesKpis = [
    3408,
    3405
];

export const networkBubbleChartKpis = [3428, 3508, 3509, 3510, 3535, 3663, 3664, 3649, 3661];

export const netowrkRosKpis = [
    3318,
    3319
];

export const compIdToZoneName = {
    2: "North-Zone",
    2: "South-Zone",
    2: "West-Zone",
    2: "East-Zone",
}