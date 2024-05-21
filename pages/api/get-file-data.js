//TODO: Need to test to make sure it works with sending errors
let workflowData = null

export default async function handler(req, res) {
  const method = req.method

  if (method === 'POST') {
    try {
      workflowData = req

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
        if (workflowData.code !== 200) {
          throw new Error('Error retrieving data from the google cloud workflow')
        }
        
        const data = workflowData.body.data
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