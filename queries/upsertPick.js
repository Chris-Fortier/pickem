// upsert a pick (update or create)
const upsert_pick = `
INSERT INTO \`pickem_app\`.\`picks\` 
SET 
    \`user_id\` = ?,
    \`game_id\` = ?,
    \`group_id\` = ?,
    \`pick\` = ?
ON DUPLICATE KEY UPDATE \`pick\` = ?, \`last_change_at\` = UNIX_TIMESTAMP() * 1000;
`;

module.exports = upsert_pick;
