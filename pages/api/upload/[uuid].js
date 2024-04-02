//TODO: Need to increment documents evaluated by 1, mark last used by current timestamp
//TODO: Need to be properly returning API response
import { Storage } from '@google-cloud/storage';
import formidable from 'formidable';
import { createReadStream, unlink } from 'fs';
import { getDate } from '@/lib/getDate';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { getToken } from 'next-auth/jwt';

dotenv.config({ path: '../../.env' });

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req, res) {
  const { query: { uuid } } = req
  const token = await getToken({ req })
  const key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS.toString())

  if (!token) {
    return res.status(401).json({ error: 'User must be logged in to perform this action' })
  }

  const storage = new Storage({
    projectId: process.env.PROJECT_ID,
    credentials: {
      client_email: key.client_email,
      private_key: key.private_key.replace(/\\n/g, '\n')
    }
  })

  const form = formidable({
    keepExtensions: true,
  })

  form.parse(req, async (error, fields, files) => {
    const selectedFile = files.file[0];
    if (!selectedFile) {
      console.error('No file uploaded')
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const salt = crypto.randomBytes(16).toString('hex')
    const hashedFilename = crypto.createHash('sha256').update(selectedFile.originalFilename + salt).digest('hex')

    const bucket = storage.bucket(process.env.CLOUD_STORAGE_BUCKET_NAME)
    const blob = bucket.file(hashedFilename)

    const blobStream = createReadStream(selectedFile.filepath)
      .pipe(blob.createWriteStream({
        resumable: false,
        contentType: selectedFile.mimetype
      }))

    blobStream.on('error', (error) => {
      console.error(`Error uploading files to cloud storage: ${error}`)
      cleanupStreams(blobStream, selectedFile.filepath)
      return res.status(500).json({ error: 'Error uploading files to cloud storage' })
    })

    blobStream.on('finish', async () => {
      try {
        await blob.setMetadata({
          metadata: {
            UUID: uuid,
            FILE_NAME: selectedFile.originalFilename,
            CREATION_DATE: getDate(),
          }
        })

        cleanupStreams(blobStream, selectedFile.filepath)
        return res.status(201).json({ message: `Uploaded the file successfully: ${selectedFile.newFilename}` })
      } catch (error) {
        console.error(`Error setting metadata: ${error}`)
        cleanupStreams(blobStream, selectedFile.filepath)
        return res.status(500).json({ error: 'Error setting metadata' })
      }
    })

    form.on('error', (error) => {
      console.error(`Form parsing error: ${error}`)
      return res.status(500).json({ error: 'Form parsing error' })
    })
  })
}

function cleanupStreams(stream, filepath) {
  if (stream) {
    stream.end()
  }

  if (filepath) {
    unlink(filepath, (error) => {
      if (error) {
        console.error(`Error cleaning up stream: ${error}`)
      }
    })
  }
}
