// this updates the password of a user in the database

const set_user_password = `
   UPDATE pickem_app.users 
   SET 
      password = ?
   WHERE
      id = ?;
`;

module.exports = set_user_password;
