import { ValidateRequestData } from "../handlers/validateRequest.js";
import { sendBadRequest, sendSuccess, sendServerError } from "../utils/responseHelper.js";
import {getDBPool} from "../config/db.js";
import { insertDealerMasterQuery } from "../queries/insertDealerMasterQuery.js";
import { bindSqlParams } from "../utils/bindSqlParams.js";
import { insertDealerMasterSchema } from "../schema/dealer.model.js";

export async function insertDealer(req, res) {
  const validationResult = await ValidateRequestData(insertDealerMasterSchema, req.body);

  if (validationResult === true) {
    try {
      const pool = getDBPool();
      const request = pool.request();

      const params = {
        BrandId: req.body.BrandId,
        DealerId: req.body.DealerId,
        DealerName: req.body.DealerName,
        LookupName: req.body.LookupName,
        Address1: req.body.Address1,
        Address2: req.body.Address2,
        City: req.body.City,
        State: req.body.State,
        Zipcode: req.body.Zipcode,
        Country: req.body.Country,
        OpenDate: req.body.OpenDate,
        CloseDate: req.body.CloseDate,
        SellSource: req.body.SellSource,
        DealerCode: req.body.DealerCode,
        DealerCodeAlternate: req.body.DealerCodeAlternate,
        DealerType: req.body.DealerType,
        LATCoordinate: req.body.LATCoordinate,
        LONCoordinate: req.body.LONCoordinate,
        PreviousBAC: req.body.PreviousBAC,
        AccountMapLocked: req.body.AccountMapLocked,
        NationalComposite: req.body.NationalComposite,
        RegionalComposite: req.body.RegionalComposite,
        DisableRisk: req.body.DisableRisk,
        OEMDealer: req.body.OEMDealer,
        Lookup: req.body.Lookup,
        IsActive: req.body.IsActive,
        IsDeleted: req.body.IsDeleted,
        CreatedDate: req.body.CreatedDate || new Date(),
        CreatedBy: req.body.CreatedBy,
        UpdatedDate: req.body.UpdatedDate,
        UpdatedBy: req.body.UpdatedBy
      };

      bindSqlParams(request, params);
      await request.query(insertDealerMasterQuery);

      return sendSuccess(res, "Dealer Inserted Successfully");
    } catch (error) {
      console.error("Insert Error:", error);
      return sendServerError(res, "Database Insert Error", error.message);
    }
  } else {
    return sendBadRequest(res, validationResult.message);
  }
}
