// get standings for a each user in a group season
// given group, season, week (week is string or '%' for any week in the season)
const select_standings = `
SELECT 
    \`user_id\`,
	\`team_name\`,
    \`initials\`,
    SUM(CASE WHEN \`pick\` = (CASE WHEN \`away_score\` > \`home_score\` THEN 0 WHEN \`away_score\` < \`home_score\` THEN 1 WHEN \`away_score\` = \`home_score\` THEN 2 ELSE NULL END) AND \`pick\` is not null THEN 1 ELSE 0 END) AS \`num_correct\`,
    SUM(CASE WHEN \`pick\` = (CASE WHEN \`away_score\` > \`home_score\` THEN 0 WHEN \`away_score\` < \`home_score\` THEN 1 WHEN \`away_score\` = \`home_score\` THEN 2 ELSE NULL END) AND \`pick\` is not null THEN \`value\` ELSE 0 END) AS \`num_points\`
FROM
    \`games\`
        RIGHT JOIN
    \`picks\` ON \`picks\`.\`game_id\` = \`games\`.\`id\`
    RIGHT JOIN
    \`users\` ON \`picks\`.\`user_id\` = \`users\`.\`id\`
WHERE
   \`group_id\` = ?
       AND \`season\` = ? AND \`week\` LIKE ? AND \`pick\` is not null
         GROUP BY \`user_id\` ORDER BY \`num_points\` DESC;
`;

module.exports = select_standings;
