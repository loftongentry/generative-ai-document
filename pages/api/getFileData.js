export default async function handler(req, res) {
  try {
    const workflowResponse = req.body.data
    console.log(workflowResponse)

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error(`Error retrieving data from Google Workflows: ${error}`)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}