// this gets the picks for a given user, group, season and week
const selectMyPicksForTheWeek = `
SELECT 
    \`game_at\`,
    \`away_team\`,
    \`home_team\`,
    \`games\`.\`id\` AS \`game_id\`,
    ? AS \`group_id\`,
    \`pick\`,
    \`winner\`
FROM
    \`picks\`
        RIGHT JOIN
    \`games\` ON \`games\`.\`id\` = \`picks\`.\`game_id\`
        AND \`user_id\` = ?
WHERE
    \`season\` = ? AND \`week\` = ?;
`;

module.exports = selectMyPicksForTheWeek;
