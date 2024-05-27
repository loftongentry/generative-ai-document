import { Storage } from '@google-cloud/storage';

const key = JSON.parse(process.env.CLOUD_STORAGE_ADMIN.toString())

export const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  credentials: {
    client_email: key.client_email,
    private_key: key.private_key.replace(/\\n/g, '\n')
  }
})