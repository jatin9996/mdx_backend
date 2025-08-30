import { EntityType } from "../const/index.js";
import { getAllComposite } from "../repository/CompositeConfigurationMaster.repository.js";
import { getAllDealers } from "../repository/dealerMaster.repository.js";
import { getAllInvestor } from "../repository/investorMaster.repository.js";
import { sendSuccessWithData } from "../utils/responseHelper.js"

export const getAllEntity = async (req, res) => {
    const allDealers = await getAllDealers();
    const investors = await getAllInvestor();
    const composites = await getAllComposite();

    const response = {
        dealers: allDealers.map(it => ({
            ...it,
            type: EntityType.DEALER,
            Id: it.DealerId
        })),
        investors: investors.map(it => ({
            ...it,
            type: EntityType.INVESTOR,
            Id: it.InvestorId
        })),
        composites: composites.map(it => ({
            ...it,
            type: EntityType.COMPOSITE,
            Id: it.CompConfigId
        })),
    }

    return sendSuccessWithData(res, "", response);
}