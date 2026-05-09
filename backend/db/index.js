const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from the backend folder
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST || "localhost",
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
