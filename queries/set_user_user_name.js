// this updates the user_name of a user in the database

const set_user_user_name = `
   UPDATE pickem_app.users 
   SET 
      user_name = ?
   WHERE
      id = ?;
`;

module.exports = set_user_user_name;
