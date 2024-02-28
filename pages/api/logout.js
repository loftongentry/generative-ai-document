import { closeSequelize } from "@/database/db_def"

export default async function handler(req, res) {
  const { method } = req
  if (method === 'POST') {
    try {
      await closeSequelize()

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error(`Error closing sequelize connection: ${error}`)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}