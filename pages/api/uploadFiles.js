import { Storage } from '@google-cloud/storage'
import formidable from 'formidable'
import { createReadStream } from "fs"
require('dotenv').config({ path: '../../.env' })

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS.toString())
      const form = formidable({})
      form.keepExtensions = true

      form.parse(req, async (err, fields, files) => {
        res.status(400).send({ error: 'Error parsing through file' })

        const storage = new Storage({
          projectId: process.env.PROJECT_ID,
          credentials: {
            client_email: key.client_email,
            private_key: key.private_key.replace(/\\n/g, '\n')
          }
        })

        const bucket = storage.bucket(process.env.CLOUD_STORAGE_BUCKET_NAME)

        const selectedFile = files.file[0]

        const blob = bucket.file(selectedFile.originalFilename)

        const blobStream = createReadStream(selectedFile.filepath)
          .pipe(blob.createWriteStream({
            resumable: false,
            contentType: selectedFile.mimetype
          }))

        blobStream.on('error', (error) => {
          console.log(`Error: ${error.message}`)
          res.status(500).send({ message: error.message })
        })

        blobStream.on('finish', async () => {
          const publicURL = `https://storage.googleapis.com/${bucket.name}/${blob.name}`

          try {
            await blob.makePublic()
          } catch (error) {
            res.status(500).send({ message: `Uploaded the file successfully: ${selectedFile.newFilename}, but public access is denied!`, url: publicURL })
          }

          res.status(200).send({ message: `Uploaded the file successfully: ${selectedFile.newFilename}`, url: publicURL, })
        })
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: error })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
