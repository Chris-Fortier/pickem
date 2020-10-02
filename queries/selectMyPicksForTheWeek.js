// this gets the picks for a given user, group, season and week
const selectMyPicksForTheWeek = `
SELECT 
    \`game_at\`,
    \`away_team\`,
    \`home_team\`,
    \`games\`.\`id\` AS \`game_id\`,
    ? AS \`group_id\`,
    \`pick\`,
    (CASE WHEN \`away_score\` > \`home_score\` THEN 0 WHEN \`away_score\` < \`home_score\` THEN 1 WHEN \`away_score\` = \`home_score\` THEN 2 ELSE NULL END) AS \`winner\`
FROM
    \`picks\`
        RIGHT JOIN
    \`games\` ON \`games\`.\`id\` = \`picks\`.\`game_id\`
        AND \`user_id\` = ?
WHERE
    \`season\` = ? AND \`week\` LIKE ?
ORDER BY
	\`game_at\` ASC;
`;

module.exports = selectMyPicksForTheWeek;
