//TODO: Works with deleting item in firestore, but it won't increment the value in the userbase
import { sequelize } from "@/database/db_def";
import { User } from "@/database/models";
import { firestore } from "@/lib/firestore";
import { getToken } from "next-auth/jwt";

const collection = process.env.NODE_ENV === 'development' ? 'Testing Storage' : ''

export default async function handler(req, res) {
  const { query: { payload } } = req
  const { doc_id, uuid } = JSON.parse(payload)

  const token = await getToken({ req })

  if (!token) {
    return res.status(401).json({ error: 'User access denied' })
  }

  try {
    const deleteDoc = await firestore.collection(collection).doc(doc_id).delete()

    if (!deleteDoc) {
      throw new Error(`Error deleting document in firestore`)
    }

    await User.update(
      {
        documentsDeleted: sequelize.literal('documents_deleted + 1')
      },
      {
        where: {
          uuid: uuid
        }
      }
    )

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error(`Error attempting to delete documet with id: ${doc_id}: ${error}`)
    return res.status(500).json({ error: 'Internal server error' })
  }
}