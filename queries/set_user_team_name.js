// this updates the team name of a user in the database

const set_user_team_name = `
   UPDATE pickem_app.users 
   SET 
      team_name = ?
   WHERE
      id = ?;
`;

module.exports = set_user_team_name;
