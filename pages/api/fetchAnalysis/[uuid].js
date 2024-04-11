import { firestore } from '@/lib/firestore'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const { query: { uuid } } = req
  const token = await getToken({ req })

  if (!token) {
    return res.status(401).json({ error: 'User access denied' })
  }

  try {
    const querySnapshot = await firestore.collection('testing').get()
    const data = querySnapshot.docs.map(doc => doc.data())
    console.log(data)
  } catch (error) {
    console.error(`Error retrieving data from firestore: ${error}`)
    return res.status(500).json({ error: 'Internal server error' })
  }
}