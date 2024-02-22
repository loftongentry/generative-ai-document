//Need to attach both user id and user email to metadata
import { Storage } from '@google-cloud/storage'
import formidable from 'formidable'
import { createReadStream } from "fs"
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'
const crypto = require('crypto')
require('dotenv').config({ path: '../../.env' })

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'User must be logged in to perform this action' })
  }

  if (req.method === 'POST') {
    try {
      const key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS.toString())
      const form = formidable({})
      form.keepExtensions = true

      form.parse(req, async (error, fields, files) => {
        if (error) {
          console.error(error)
          return res.status(400).send({ error: 'Error parsing through file' })
        }

        const id = session?.user?.id
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

        const blobStream = createReadStream(selectedFile.filepath)
          .pipe(blob.createWriteStream({
            resumable: false,
            contentType: selectedFile.mimetype
          }))

        blobStream.on('error', (error) => {
          console.log(`Error: ${error.message}`)
          return res.status(500).send({ message: error.message })
        })

        blobStream.on('finish', async () => {
          await blob.setMetadata({
            metadata: {
              userId: id,
              fileName: selectedFile.originalFilename,
              hashedFileName: hashedFilename,
              salt: salt,
            }
          })

          const publicURL = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
          return res.status(200).send({ message: `Uploaded the file successfully: ${selectedFile.newFilename}`, url: publicURL, })
        })
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: error })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}