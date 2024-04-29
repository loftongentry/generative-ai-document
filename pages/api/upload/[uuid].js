//TODO: Add comments explaining what's happening
import { getToken } from 'next-auth/jwt';
import formidable from 'formidable';
import { createReadStream, unlink } from 'fs';
import { storage } from '@/lib/storage';
import { getDate } from '@/lib/getDate';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { User } from '@/database/models';

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
      form.parse(req, async (error, fields, files) => {
        if (error) {
          return reject({ status: 400, error: 'Error parsing form data' })
        }

        if (!files || !files.file || !files.file[0]) {
          return reject({ status: 400, error: 'No file uploaded' });
        }

        const selectedFile = files.file[0]
        const filePath = selectedFile.filepath

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
          reject({ status: 500, error: `Error with blobStream - ${error}` })
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

        //Updating the user in the userbase with the last time they used the web app, as well as incrementing the number of documents they've evaluated by 1
        try {
          const user = await User.findOne({
            where: {
              uuid: uuid
            }
          })

          if (!user) {
            throw new Error('User does not exist')
          }

          user.documentsEvaluated += 1
          await user.save()
          await user.update({ lastUsed: getDate() })
        } catch (error) {
          console.error(`Error updating user: ${error}`)
        }

        resolve(blobStream)
      })
    })

    return res.json(formPromise)
  } catch (error) {
    const statusCode = error.status || 500
    console.error(`Error submitting document to Cloud Storage: ${error.error}`)
    return res.status(statusCode).json({ error: error.error || 'Internal Server Error' })
  }
}

const cleanupStreams = (stream, filepath) => {
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