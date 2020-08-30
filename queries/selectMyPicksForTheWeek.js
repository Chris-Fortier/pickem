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
    \`games\`
        LEFT JOIN
    \`picks\` ON \`games\`.\`id\` = \`picks\`.\`game_id\`
        WHERE \`user_id\` = ?
        AND \`season\` = ?
        AND \`week\` = ?;
`;

module.exports = selectMyPicksForTheWeek;
