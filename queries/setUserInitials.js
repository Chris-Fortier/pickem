// this updates the initials of a user in the database

const setUserInitials = `
   UPDATE pickem_app.users 
   SET 
      initials = ?
   WHERE
      id = ?;
`;

module.exports = setUserInitials;
