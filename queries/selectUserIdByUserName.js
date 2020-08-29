// this runs a query on the database to get a user from an user_name
// this one doesn't return anything but the user id
const selectUserIdByUserName = `
   SELECT 
      id
   FROM
      users
   WHERE
      user_name = ?
   LIMIT 1;
   `;

module.exports = selectUserIdByUserName;
