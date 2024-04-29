//TODO: Need to increment documents evaluated by 1, mark last used by current timestamp
//TODO: Add comments explaining what's happening
import { getToken } from 'next-auth/jwt';
import formidable from 'formidable';
import { createReadStream, unlink } from 'fs';
import { storage } from '@/lib/storage';
import { getDate } from '@/lib/getDate';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req, res) {
  const { query: { uuid } } = req
  const token = await getToken({ req })

  if (!token) {
    return res.status(401).json({ error: 'User must be logged in to perform this action' })
  }

  const form = formidable({
    keepExtensions: true,
  })

  //NOTE: Need to use a promise here otherwise no response will be sent when parsing the form data
  try {
    const formPromise = await new Promise((resolve, reject) => {
      form.parse(req, async (error, files) => {
        if (error) {
          reject({ status: 400, error: 'Bad Request: Error parsing form data' })
        }

        const selectedFile = files.file[0]
        const filePath = selectedFile.filepath

        if (!selectedFile) {
          reject({ status: 404, error: 'File not found' })
        }

        const salt = crypto.randomBytes(16).toString('hex')
        const hashedFilename = crypto.createHash('sha256').update(selectedFile.originalFilename + salt).digest('hex')

        const bucket = storage.bucket(process.env.CLOUD_STORAGE_BUCKET_NAME)
        const blob = bucket.file(hashedFilename)

        const blobStream = createReadStream(filePath)
          .pipe(blob.createWriteStream({
            resumable: false,
            contentType: selectedFile.mimetype
          }))

        blobStream.on('error', (error) => {
          cleanupStreams(blobStream, filePath)
          reject({ status: 500, error: `Internal Server Error: Error with blobStream - ${error}` })
        })

        blobStream.on('finish', async () => {
          await blob.setMetadata({
            metadata: {
              UUID: uuid,
              FILE_NAME: selectedFile.originalFilename,
              CREATION_DATE: getDate(),
            }
          })

          cleanupStreams(blobStream, filePath)
        })

        resolve(blobStream)
      })
    })

    return res.status(200).json(formPromise)
  } catch (error) {
    const statusCode = error.status || 500
    console.error(`Error submitting document to Cloud Storage: ${error}`)
    return res.status(statusCode).json({ error: error.error || 'Internal Server Error' })
  }
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
