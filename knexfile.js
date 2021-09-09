require("dotenv").config();

module.exports = {
   client: "mysql",
   connection: {
      host: process.env.RDS_HOST,
      user: process.env.RDS_USER,
      password: process.env.RDS_PASSWORD,
      database: process.env.RDS_DATABASE,
      charset: "utf8",
   },
   debug: true,
   pool: {
      min: 2,
      max: 20,
   },
   acquireConnectionTimeout: 10000,
};
