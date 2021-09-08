// this runs a query on the database to get a user from an user_name
// this one doesn't return anything but the user id
const select_user_id_by_user_name = `
   SELECT 
      id
   FROM
      users
   WHERE
      user_name = ?
   LIMIT 1;
   `;

module.exports = select_user_id_by_user_name;
