export const insertDealerMasterQuery = `
  INSERT INTO dbo.DealerMaster (
  BrandId, DealerId, DealerName, LookupName,
  Address1, Address2, City, State, Zipcode, Country,
  OpenDate, CloseDate, SellSource, DealerCode, DealerCodeAlternate,
  DealerType, LATCoordinate, LONCoordinate, PreviousBAC, AccountMapLocked,
  NationalComposite, RegionalComposite, DisableRisk, OEMDealer, Lookup,
  IsActive, IsDeleted, CreatedDate, CreatedBy, UpdatedDate, UpdatedBy
) VALUES (
  @BrandId, @DealerId, @DealerName, @LookupName,
  @Address1, @Address2, @City, @State, @Zipcode, @Country,
  @OpenDate, @CloseDate, @SellSource, @DealerCode, @DealerCodeAlternate,
  @DealerType, @LATCoordinate, @LONCoordinate, @PreviousBAC, @AccountMapLocked,
  @NationalComposite, @RegionalComposite, @DisableRisk, @OEMDealer, @Lookup,
  @IsActive, @IsDeleted, @CreatedDate, @CreatedBy, @UpdatedDate, @UpdatedBy
);

`;
