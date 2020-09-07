// this updates the team name of a user in the database

const setUserTeamName = `
   UPDATE pickem_app.users 
   SET 
      team_name = ?
   WHERE
      id = ?;
`;

module.exports = setUserTeamName;
