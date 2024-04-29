import { firestore } from "@/lib/firestore"
import { getToken } from "next-auth/jwt"

const collection = process.env.NODE_ENV === 'development' ? 'Testing Storage' : ''

export default async function handler(req, res) {
  const { query: { uuid } } = req
  const token = await getToken({ req })

  if (!token) {
    return res.status(401).json({ error: 'User access denier' })
  }

  try {
    const querySnapshot = await firestore.collection(collection).where('user_uuid', '==', uuid).get()

    const batch = firestore.batch()

    querySnapshot.forEach(doc => {
      batch.delete(doc.ref)
    })

    await batch.commit()
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error(`Error deleting all analysis for user with ID: ${uuid}: ${error}`)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}