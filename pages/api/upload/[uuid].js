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

  const formPromise = await new Promise((resolve, reject) => {
    form.parse(req, async (error, files) => {
      if (error) {
        reject(error)
      }

      const selectedFile = files.file[0];

      const salt = crypto.randomBytes(16).toString('hex')
      const hashedFilename = crypto.createHash('sha256').update(selectedFile.originalFilename + salt).digest('hex')

      const bucket = storage.bucket(process.env.CLOUD_STORAGE_BUCKET_NAME)
      const blob = bucket.file(hashedFilename)

      const blobStream = createReadStream(selectedFile.filepath)
        .pipe(blob.createWriteStream({
          resumable: false,
          contentType: selectedFile.mimetype
        }))

      blobStream.on('finish', async () => {
        await blob.setMetadata({
          metadata: {
            UUID: uuid,
            FILE_NAME: selectedFile.originalFilename,
            CREATION_DATE: getDate(),
          }
        })

        cleanupStreams(blobStream, selectedFile.filepath)
      })

      resolve(blobStream)
    })
  })

  return res.json(formPromise)
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
