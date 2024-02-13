import { Storage } from '@google-cloud/storage';
import formidable from 'formidable';
import { createReadStream } from "fs";


export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const data = await new Promise(function (resolve, reject) {
        const form = formidable({})
        form.keepExtensions = true

        form.parse(req, function (err, fields, files) {
          if (err) return reject(err)
          resolve({ fields, files })
        })
      })

      const savedFile = data.files.file
      

      const storage = new Storage({
        projectId: process.env.PROJECT_ID,
        client_email: process.env.CLOUD_STORAGE_ADMIN_EMAIL,
        private_key: process.env.CLOUD_STORAGE_ADMIN_KEY
      })

      const bucket = storage.bucket(process.env.CLOUD_STORAGE_BUCKET_NAME)
      const blobStream = require('fs').createReadStream(savedFile.filepath)
        .pipe(blob.createWriteStream({
          resumable: false,
          contentType: savedFile.mimetype
        }))

      blobStream.on('error', (error) => {
        console.log(`Error: ${error.message}`)
        res.status(500).send({ message: error.message })
      })

      blobStream.on('finish', async () => {
        const publicURL = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

        try {
          await blob.makePublic()
        } catch (error) {
          res.status(500).send({ message: `Uploaded the file successfully: ${file.newFilename}, but public access is denied!`, url: publicURL })
        }

        res.status(200).send({ message: `Uploaded the file successfully: ${file.newFilename}`, url: publicURL, });
      })

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
