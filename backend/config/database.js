const { Sequelize } = require("sequelize")
require("dotenv").config()

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set!');
}

console.log(process.env.DATABASE_URL);

const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
})

module.exports = sequelize
