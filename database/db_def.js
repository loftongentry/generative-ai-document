//TODO: Preventing recreation of connections after dev server restarts
const { Sequelize } = require('sequelize')
require('dotenv').config({ path: '../.env' })

const db_address = process.env.DB_ADDRESS
const db_dialect = process.env.DB_DIALECT
const db_name = process.env.DB_NAME
const db_username = process.env.DB_USERNAME
const db_user_password = process.env.DB_USER_PASSWORD
const client_cert = process.env.CLIENT_CERT.replace(/\\n/g, '\n')
const client_key = process.env.CLIENT_KEY.replace(/\\n/g, '\n')
const server_ca = process.env.SERVER_CA.replace(/\\n/g, '\n')

console.log('Connecting to database through sequelize...')
const sequelize = new Sequelize(db_name, db_username, db_user_password, {
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
    max: 5,
    acquire: 5000,
    evict: 2000,
    idle: 100
  }
})
console.log('Connection through sequelize established')

const closeSequelize = async () => {
  try {
    await sequelize.close()
    console.log('Sequelize connection closed succesfully')
  } catch (error) {
    console.error(`Error closing sequelize connection: ${error}`)
  }
}

const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Closing sequelize connection...`)
  await closeSequelize()
  process.exit(0)
}

process.on('exit', () => gracefulShutdown('exit'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

process.on('uncaughtException', async (error) => {
  console.error(`Uncaught error: ${error}`)
  console.log('Closeing Sequelize connection...')
  await closeSequelize()
  process.exit(1)
})

module.exports = { sequelize, closeSequelize }

// Leaving this here as a reminder on how to test the connection
// NOTE: Have to cd in the database folder then run 'node db_def.js' to test properly
// const testConnection = async () => {
//   try {
//     await sequelize.authenticate()
//     console.log('Connection established')
//   } catch (error) {
//     console.log('Connection failed', error)
//   }
// }