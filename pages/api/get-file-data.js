let workflowData = null

export default async function handler(req, res) {
  const method = req.method

  if (method === 'POST') {
    try {
      workflowData = req.body.data

      console.log(workflowData)
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error(`Error trying to receive data from workflow: ${error}`)
      return res.status(400).json({ error: error })
    }
  }

  if (method === 'GET') {
    try {
      if (workflowData === null) {
        console.log('polling')
        return res.status(200).json({ status: 'pending' })
      } else {
        console.log('retrieved data')
        const data = workflowData
        workflowData = null
        return res.status(200).json({ status: 'ready', data: data })
      }
    } catch (error) {
      console.error(`Error trying to send data from workflow: ${error}`)
      return res.status(500).json({ error: error })
    }
  }

  return res.status(405).json({ error: `Method ${method} not allowed` })
}