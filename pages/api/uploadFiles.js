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
        const initVector = crypto.randomBytes(16)

        const encryptedName = selectedFile.originalFilename + salt

        const cipher = crypto.createCipheriv('aes-256-cbc', process.env.ENCRYPTION_KEY, initVector)
        let encrypted = cipher.update(encryptedName, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        
        const storage = new Storage({
          projectId: process.env.PROJECT_ID,
          credentials: {
            client_email: key.client_email,
            private_key: key.private_key.replace(/\\n/g, '\n')
          }
        })

        const bucket = storage.bucket(process.env.CLOUD_STORAGE_BUCKET_NAME)
        const blob = bucket.file(encryptedName)

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
              encryptFile: encryptedName,
              salt: salt,
              initVector: ''
            }
          })

          //const publicURL = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
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

const encryptFile = (fileName, salt) => {
  const encryptedFile = fileName + salt

  const cipher = crypto.createCipheriv('aes-256-cbc', process.env.ENCRYPTION_KEY, process.env.INITIALIZATION_VECTOR)
  let encrypted = cipher.update(encryptedFile, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return encrypted
}
