import { firestore } from "@/lib/firestore"
import { getToken } from "next-auth/jwt"

const collection = process.env.NODE_ENV === 'development' ? 'Testing Storage' : ''

export default async function handler(req, res) {
  const { query: { payload } } = req
  const { doc_id, newName } = JSON.parse(payload)

  const token = await getToken({ req })

  if (!token) {
    return res.status(401).json({ error: 'User access denied' })
  }

  try {
    const doc = firestore.collection(collection).doc(doc_id)

    await doc.update({
      file_name: newName
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error(`There was an error updating the 'file_name' field for document with id: ${doc_id}: ${error}`)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}