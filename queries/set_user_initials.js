// this updates the initials of a user in the database

const set_user_initials = `
   UPDATE pickem_app.users 
   SET 
      initials = ?
   WHERE
      id = ?;
`;

module.exports = set_user_initials;
