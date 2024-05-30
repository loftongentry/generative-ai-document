//NOTE: Pretty sure this will properly catch errors when they are received from google workflow, but we ball regardless
let workflowData = null

export default async function handler(req, res) {
  const method = req.method

  if (method === 'POST') {
    try {
      workflowData = req

      const body = workflowData.body
      const data = body.data

      if (data && typeof data === 'string' && data.includes('error')) {
        throw new Error(data)
      }

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error(`Error trying to receive data from workflow: ${error}`)
      return res.status(400).json({ success: false })
    }
  }

  if (method === 'GET') {
    try {
      if (workflowData === null) {
        console.log('polling')

        return res.status(200).json({ status: 'pending' })
      } else {
        console.log('retrieved data')

        const data = workflowData.body.data
        workflowData = null

        if (data.includes('error')) {
          throw new Error(data)
        }

        return res.status(200).json({ status: 'ready', data: data })
      }
    } catch (error) {
      console.error(`Error trying to send data from workflow: ${error}`)
      return res.status(500).json({ data: `${error}` })
    }
  }

  return res.status(405).json({ error: `Method ${method} not allowed` })
}