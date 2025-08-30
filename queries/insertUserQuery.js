export const insertUserQuery = `
  INSERT INTO dbo.UserMaster (
    UserId, UserType, UserName, Password, FirstName, LastName, Email,
    Mobile, IsActive, IsDeleted, CreatedDate, CreatedBy, UpdatedDate, UpdatedBy
  ) VALUES (
    @UserId, @UserType, @UserName, @Password, @FirstName, @LastName, @Email,
    @Mobile, @IsActive, @IsDeleted, @CreatedDate, @CreatedBy, @UpdatedDate, @UpdatedBy
  )
`;
