// this updates the email of a user in the database

const set_user_email = `
   UPDATE pickem_app.users 
   SET 
      email = ?
   WHERE
      id = ?;
`;

module.exports = set_user_email;
