// this updates the last login time of a user in the database

const setUserLastLoginAt = `
   UPDATE pickem_app.users 
   SET 
      last_login_at = ?
   WHERE
      id = ?;
`;

module.exports = setUserLastLoginAt;
