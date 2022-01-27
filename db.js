// const { JsonWebTokenError } = require("jsonwebtoken")
const {Sequelize} = require("sequelize")

// const db = new Sequelize(`postgres://postgres:${process.env.PASS}@localhost:5432/Project-FMR`) //!before heroku deployment

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    ssl: process.env.ENVIORNMENT === 'production'
})


module.exports = db