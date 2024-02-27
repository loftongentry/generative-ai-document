const { Sequelize, DataTypes } = require('sequelize')
const { getSequelizeInstance } = require('./db_def')

const sequelize = getSequelizeInstance()

const User = sequelize.define('userbase', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true
  },
  firstLogin: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
    field: 'first_login',
    comment: 'The first time the user logs in. This value should not change'
  },
  latestLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'latest_login',
    comment: 'The date and time of the last time a user logged in'
  },
  documentsEvaluated: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'documents_evaluated',
    comment: 'The total number of documents that a user has evaluated'
  },
  documentsDeleted: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'documents_deleted',
    comment: 'The total number of evaluated documents that the user has deleted'
  },
  documentsRemaining: {
    type: DataTypes.VIRTUAL,
    allowNull: true,
    get() {
      const evaluated = this.getDataValue('documentsEvaluated') || 0
      const deleted = this.getDataValue('documentsDeleted') || 0

      return evaluated - deleted
    },
    field: 'documents_remaining',
    comment: 'The number of active documents that the user can still see analysis results for'
  },
  firstUsed: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'first_used',
    comment: 'The first time the user actually uses the analyzer. This value should not change'
  },
  lastUsed: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_used',
    comment: 'The last time that the user uses the analyzer'
  },
  documentIds: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    field: 'document_ids',
    comment: `ID's for documents that are stored in cloud storage`
  }
},
  {
    freezeTableName: true
  }
)

// Leaving this here as a reminder on how to create a new table
// NOTE: Have to cd in the database folder then run 'node models.js' to create tables from models properly
// const create = async () => {
//   await sequelize.sync({ force: true })
// }

// create()

module.exports = { User }