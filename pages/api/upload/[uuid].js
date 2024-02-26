//Need to attach both user id to metadata
//Need to clean this function up so we close the read and write streams
import { Storage } from '@google-cloud/storage'
import formidable from 'formidable'
import { createReadStream } from "fs"
import { getServerSession } from 'next-auth'
import authOptions from '../auth/[...nextauth]'
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

      form.parse(req, async (error, fields, files) => {
        if (error) {
          console.error(`Error parsing files: ${error}`)
          return res.status(400).send({ error: 'Error parsing through files' })
        }

        const selectedFile = files.file[0]
        const salt = crypto.randomBytes(16).toString('hex')
        const hashedFilename = crypto.createHash('sha256').update(selectedFile.originalFilename + salt).digest('hex')

        const storage = new Storage({
          projectId: process.env.PROJECT_ID,
          credentials: {
            client_email: key.client_email,
            private_key: key.private_key.replace(/\\n/g, '\n')
          }
        })

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

        //Not receiving the url returned from here. Will most likely have to move it elsewhere
        blobStream.on('finish', async () => {
          try {
            await blob.setMetadata({
              metadata: {
                userId: uuid,
                fileName: selectedFile.originalFilename,
                hashedFileName: hashedFilename,
                salt: salt,
              }
            })

            const publicURL = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            return res.status(201).send({ message: `Uploaded the file successfully: ${selectedFile.newFilename}`, url: publicURL, })
          } catch (error) {
            console.error(`Error setting metadata: ${error}`)
            return res.status(500).json({ error: 'Error setting metadata' })
          } finally {
            blobStream.end()
          }
        })
      })

    } catch (error) {
      console.error(`Error during file uploads to cloud storage: ${error}`)
      return res.status(500).json({ error: 'Error during file uploads to cloud storage' })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}