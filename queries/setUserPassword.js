// this updates the password of a user in the database

const setUserPassword = `
   UPDATE pickem_app.users 
   SET 
      password = ?
   WHERE
      id = ?;
`;

module.exports = setUserPassword;
