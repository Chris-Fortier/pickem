// this runs a query on the database to get a user from a user id
const select_user_by_id = `
   SELECT 
      *
   FROM
      users
   WHERE
      id = ?
   LIMIT 1;
   `;
module.exports = select_user_by_id;
