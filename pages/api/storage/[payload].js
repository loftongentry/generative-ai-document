//TODO: Need to test
import { storage } from "@/lib/storage";
import { getToken } from "next-auth/jwt";

export default async function handler(req, res) {
  const { query: { payload } } = req
  const { doc_name, bucket } = payload
  const token = await getToken({ req })

  if (!token) {
    return res.status(401).json({ error: 'User access denied' })
  }

  try {
    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() * 3600 * 1000
    }

    const [signedUrl] = await storage.bucket(bucket).file(doc_name).getSignedUrl(options)

    return res.status(200).json(signedUrl)
  } catch (error) {
    console.error(`Error generating signed url for document with doc_name: ${doc_name}: ${error}`)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}