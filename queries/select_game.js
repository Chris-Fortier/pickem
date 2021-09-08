// get the details of a single game form the game id
const select_game = `
   SELECT * from \`games\` where \`id\` = ?;
`;

module.exports = select_game;
