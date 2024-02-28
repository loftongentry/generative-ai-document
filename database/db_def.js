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

let sequelizeInstance = null;

const initializeSequelize = () => {
  try {
    if (!sequelizeInstance) {
      console.log('Connecting to database through sequelize...')
      sequelizeInstance = new Sequelize(db_name, db_username, db_user_password, {
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
          acquire: 60000,
          evict: 20000,
          idle: 15000
        }
      })
    }
  } catch (error) {
    throw new Error(`Failed to initialize sequelize connection: ${error}`)
  }

  console.log('Connection established succesfully')
  return sequelizeInstance
}

const closeSequelize = async () => {
  try {
    if (sequelizeInstance) {
      console.log('Closing sequelize connection...')
      await sequelizeInstance.close()
      console.log('Sequelize connection closed succesfully')
      sequelizeInstance = null
    }
  } catch (error) {
    console.error(`Error closing sequelize connection: ${error}`)
  }
}

process.on('exit', async () => {
  console.log('Received exit signal. Closing Sequelize connection...')
  await closeSequelize()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('Received SIGINT signal. Closing Sequelize connection...')
  await closeSequelize()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM signal. Closing Sequelize connection...')
  await closeSequelize()
  process.exit(0)
})

process.on('uncaughtException', async (error) => {
  console.error(`Uncaught error: ${error}`)
  console.log('Closeing Sequelize connection...')
  await closeSequelize()
  process.exit(1)
})

module.exports = { initializeSequelize, closeSequelize }

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