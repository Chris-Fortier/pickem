// get the details of a single game form the game id
const selectGame = `
   SELECT * from \`games\` where \`id\` = ?;
`;

module.exports = selectGame;
