//Need to clean this function up so we close the read and write streams
import { Storage } from '@google-cloud/storage'
import formidable from 'formidable'
import { createReadStream } from "fs"
import { getServerSession } from 'next-auth'
import authOptions from '../auth/[...nextauth]'
import { getDate } from '@/lib/getDate'
const crypto = require('crypto')
require('dotenv').config({ path: '../../.env' })

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req, res) {
  const { method, query: { uuid: uuid } } = req
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'User must be logged in to perform this action' })
  }

  if (method === 'POST') {
    try {
      const key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS.toString())
      const form = formidable({})
      form.keepExtensions = true

      const storage = new Storage({
        projectId: process.env.PROJECT_ID,
        credentials: {
          client_email: key.client_email,
          private_key: key.private_key.replace(/\\n/g, '\n')
        }
      })

      form.parse(req, async (error, fields, files) => {
        const selectedFile = files.file[0]
        const salt = crypto.randomBytes(16).toString('hex')
        const hashedFilename = crypto.createHash('sha256').update(selectedFile.originalFilename + salt).digest('hex')

        const bucket = storage.bucket(process.env.CLOUD_STORAGE_BUCKET_NAME)
        const blob = bucket.file(hashedFilename)

        const blobStream = createReadStream(selectedFile.filepath).pipe(
          blob.createWriteStream({
            resumable: false,
            contentType: selectedFile.mimetype
          }))

        blobStream.on('error', (error) => {
          blobStream.end()
          console.error(`Error uploading files to cloud storage: ${error}}`)
          return res.status(500).send({ error: 'Error uploading files to cloud storage' })
        })

        //Not receiving the url returned from here even on succesful storage
        blobStream.on('finish', async () => {
          await blob.setMetadata({
            metadata: {
              UUID: uuid,
              FILE_NAME: selectedFile.originalFilename,
              FILE_TYPE: selectedFile.mimetype,
              CREATION_DATE: getDate(),
              HASHED_FILE_NAME: hashedFilename,
              SALT: salt,
            }
          })

          blobStream.end()
          fs.unlinkSync(selectedFile.filepath)
        })
      })

      return res.status(201).send({ message: `Uploaded the file successfully: ${selectedFile.newFilename}` })
    } catch (error) {
      console.error(`Error during file upload to cloud storage: ${error}`)
      return res.status(500).json({ error: 'Error during file upload to cloud storage' })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

