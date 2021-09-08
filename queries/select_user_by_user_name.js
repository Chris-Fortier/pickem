// this runs a query on the database to get a user from an user_name
const select_user_by_user_name = `
   SELECT 
      *
   FROM
      users
   WHERE
      user_name = ?
   LIMIT 1;
   `;

module.exports = select_user_by_user_name;
