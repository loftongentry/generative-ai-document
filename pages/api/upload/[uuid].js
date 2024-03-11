import { Storage } from '@google-cloud/storage';
import formidable from 'formidable';
import { createReadStream, unlink } from 'fs';
import { getServerSession } from 'next-auth';
import authOptions from '../auth/[...nextauth]';
import { getDate } from '@/lib/getDate';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  const { method, query: { uuid } } = req;
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'User must be logged in to perform this action' });
  }

  if (method === 'POST') {
    try {
      const key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS.toString());
      const form = formidable({});
      form.keepExtensions = true;

      form.parse(req, async (error, fields, files) => {
        if (error) {
          console.error(`Error parsing form: ${error}`);
          return res.status(500).json({ error: 'Error parsing form' });
        }

        const storage = new Storage({
          projectId: process.env.PROJECT_ID,
          credentials: {
            client_email: key.client_email,
            private_key: key.private_key.replace(/\\n/g, '\n')
          }
        });

        const selectedFile = files.file[0];
        const salt = crypto.randomBytes(16).toString('hex');
        const hashedFilename = crypto.createHash('sha256').update(selectedFile.originalFilename + salt).digest('hex');

        const bucket = storage.bucket(process.env.CLOUD_STORAGE_BUCKET_NAME);
        const blob = bucket.file(hashedFilename);

        const blobStream = createReadStream(selectedFile.filepath)
          .pipe(blob.createWriteStream({
            resumable: false,
            contentType: selectedFile.mimetype
          }));

        blobStream.on('error', (error) => {
          console.error(`Error uploading files to cloud storage: ${error}`);
          cleanupStreams(blobStream, selectedFile.filepath);
          return res.status(500).json({ error: 'Error uploading files to cloud storage' });
        });

        blobStream.on('finish', async () => {
          try {
            await blob.setMetadata({
              metadata: {
                UUID: uuid,
                FILE_NAME: selectedFile.originalFilename,
                FILE_TYPE: selectedFile.mimetype,
                CREATION_DATE: getDate(),
                HASHED_FILE_NAME: hashedFilename,
                SALT: salt,
              }
            });
            cleanupStreams(blobStream, selectedFile.filepath);
            return res.status(201).json({ message: `Uploaded the file successfully: ${selectedFile.newFilename}` });
          } catch (error) {
            console.error(`Error setting metadata: ${error}`);
            cleanupStreams(blobStream, selectedFile.filepath);
            return res.status(500).json({ error: 'Error setting metadata' });
          }
        });
      });
    } catch (error) {
      console.error(`Error during file upload to cloud storage: ${error}`);
      return res.status(500).json({ error: 'Error during file upload to cloud storage' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

function cleanupStreams(stream, filepath) {
  if (stream) {
    stream.end();
  }
  if (filepath) {
    unlink(filepath, (err) => {
      if (err) {
        console.error(`Error deleting file: ${err}`);
      }
    });
  }
}