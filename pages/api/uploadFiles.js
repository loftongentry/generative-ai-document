//TODO: Have to change the name or it won't be saved properly into the database
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

      form.parse(req, async (error, fields, files) => {
        if(error){
          console.error(error)
          return res.status(400).send({ error: 'Error parsing through file' })
        }
        

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
          return res.status(500).send({ message: error.message })
        })

        blobStream.on('finish', async () => {
          const publicURL = `https://storage.googleapis.com/${bucket.name}/${blob.name}`

          try {
            await blob.makePublic()
          } catch (error) {
            return res.status(500).send({ message: `Uploaded the file successfully: ${selectedFile.newFilename}, but public access is denied!`, url: publicURL })
          }

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
