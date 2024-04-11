import { initFirestore } from "@auth/firebase-adapter";
import { cert } from 'firebase-admin/app'

const key = JSON.parse(process.env.FIRESTORE_ADMIN_SDK.toString())

export const firestore = initFirestore({
  credential: cert({
    projectId: process.env.PROJECT_ID,
    clientEmail: key.client_email,
    privateKey: key.private_key.replace(/\\n/g, '\n')
  })
}) 