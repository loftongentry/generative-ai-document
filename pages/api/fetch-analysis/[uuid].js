import { firestore } from '@/lib/firestore'
import { getToken } from 'next-auth/jwt'

const collection = process.env.NODE_ENV === 'development' ? 'Testing Storage' : ''

export default async function handler(req, res) {
  const { query: { uuid } } = req
  const token = await getToken({ req })

  if (!token) {
    return res.status(401).json({ error: 'User access denied' })
  }

  try {
    const querySnapshot = await firestore.collection(collection).where('user_uuid', '==', `${uuid}`).get()
    
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() 
    }))

    return res.status(200).json(data)
  } catch (error) {
    console.error(`Error retrieving data from firestore: ${error}`)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}