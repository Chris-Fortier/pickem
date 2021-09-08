// this deletes an existing user

const delete_user = `
   DELETE FROM pickem_app.users 
   WHERE
      id = ?;
`;

module.exports = delete_user;
