// this runs a query on the database to get a user from an user_name
const selectUserByUserName = `
   SELECT 
      *
   FROM
      users
   WHERE
      user_name = ?
   LIMIT 1;
   `;

module.exports = selectUserByUserName;
