// this deletes an existing user

const deleteUser = `
   DELETE FROM pickem_app.users 
   WHERE
      id = ?;
`;

module.exports = deleteUser;
