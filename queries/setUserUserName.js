// this updates the user_name of a user in the database

const setUserUserName = `
   UPDATE pickem_app.users 
   SET 
      user_name = ?
   WHERE
      id = ?;
`;

module.exports = setUserUserName;
