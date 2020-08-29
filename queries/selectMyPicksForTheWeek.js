// this gets the picks for a given user, group, season and week
const insertUser = `
SELECT 
      \`game_at\`,
      \`away_team\`,
      \`home_team\`,
      \`games\`.\`id\` AS \`game_id\`,
      ? AS \`group_id\`, -- returns the given group id so this will end up as a prop and it knows what group the component is for
      \`pick\`,
      \`winner\`
   FROM
      (SELECT 
         *
      FROM
         \`picks\`) as \`picks\`
	  RIGHT JOIN \`games\` ON \`picks\`.\`game_id\` = \`games\`.\`id\`
   WHERE
      (\`user_id\` = ? OR \`user_id\` is NULL) AND -- show null user_id ones so that the user can see the ones they need to pick
      (\`group_id\` = ? OR \`group_id\` is NULL) AND -- show null user_id ones so that the user can see the ones they need to pick
      \`season\` = ? AND
      \`week\` = ?
 ORDER BY
      \`game_at\` ASC; -- order by game time
`;

module.exports = insertUser;
