// this creates a new user on the database

// new syntax, with this method we just pass an object and the database will use it if all the keys match
const insertUser = `
   INSERT INTO users SET ?;
`;

module.exports = insertUser;
