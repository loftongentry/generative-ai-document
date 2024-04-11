const { Firestore } = require('@google-cloud/firestore')

const projectId = process.env.PROJECT_ID
const firestoreSA = JSON.parse(process.env.GOOGLE_FIRESTORE_CREDENTIALS.toString())

const firestore = new Firestore({
  projectId: projectId,
  credentials: firestoreSA
})

module.exports = firestore