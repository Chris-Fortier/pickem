// this updates the last login time of a user in the database

const set_user_last_login_at = `
   UPDATE pickem_app.users 
   SET 
      last_login_at = ?
   WHERE
      id = ?;
`;

module.exports = set_user_last_login_at;
