//TODO: Change how the latestlogin is updated because these can't be within the same route
import { User } from "@/database/models";
import { getDate } from "@/lib/getDate";

export default async function handler(req, res) {
  const { method, query: { email: email } } = req

  if (method === 'GET') {
    try {
      let user = await User.findOne({
        where: {
          email: email
        }
      })

      if (!user) {
        user = await User.create({
          email: email,
        })
      }

      await user.update({ latestLogin: getDate() })

      return res.status(200).json({ uuid: user.uuid })
    } catch (error) {
      console.error(`Error occurred when user logged in: ${error}`)
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}