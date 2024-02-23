const { Sequelize } = require('sequelize')
require('dotenv').config({ path: '../.env' })

const db_address = process.env.DB_ADDRESS
const db_dialect = process.env.DB_DIALECT
const db_name = process.env.DB_NAME
const db_password = process.env.DB_PASSWORD
const client_cert = process.env.CLIENT_CERT
const client_key = process.env.CLIENT_KEY
const server_ca = process.env.SERVER_CA

const sequelize = new Sequelize(db_name, db_name, db_password, {
  host: db_address,
  dialect: db_dialect,
  dialectModule: require('pg'),
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
      cert: client_cert,
      key: client_key,
      ca: server_ca,
    },
  },
  logging: false,
  retry: {
    max: 5,
    timeout: 20000,
    backoffBase: 1000,
  },
  pool: {
    min: 1,
    max: 40,
    acquire: 60000,
    evict: 20000,
    idle: 15000
  }
})

module.exports = sequelize

const testConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log('Connection established')
  } catch (error) {
    console.log('Connection failed', error)
  }
}

testConnection()