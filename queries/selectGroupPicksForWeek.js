// this gets the picks of the entire group for a week
// given user, group, season and week
const selectGroupPicksForWeek = `
SELECT 
    \`game_at\`,
    \`away_team\`,
    \`home_team\`,
    \`games\`.\`id\` AS \`game_id\`,
    (CASE
        WHEN \`user_id\` = ? THEN \`pick\`
        WHEN \`game_at\` < (UNIX_TIMESTAMP() * 1000) THEN \`pick\`
        WHEN \`pick\` IS NOT NULL THEN 2
        ELSE NULL
    END) AS \`pick\`,
    \`winner\`,
    \`users\`.\`id\` AS \`user_id\`,
    \`users\`.\`initials\` AS \`user_initials\`
FROM
    \`games\`
        CROSS JOIN
    \`users\`
        LEFT JOIN
    \`picks\` ON \`games\`.\`id\` = \`picks\`.\`game_id\`
        AND \`users\`.\`id\` = \`picks\`.\`user_id\`
WHERE
    (\`group_id\` = ?
        OR \`group_id\` IS NULL)
        AND \`season\` = ?
        AND \`week\` LIKE ?
ORDER BY \`game_at\` ASC;
`;

module.exports = selectGroupPicksForWeek;
