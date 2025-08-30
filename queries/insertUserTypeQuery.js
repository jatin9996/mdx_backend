export const insertUserTypeQuery = `
  INSERT INTO dbo.UserTypeMaster (
    UserType
  ) VALUES (
    @UserType
  )
`;
