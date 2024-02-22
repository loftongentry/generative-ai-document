export default async function handler(req, res) {
  if (req.method === 'POST') {
    const workflowResponse = req.body
    console.log(`Workflow Response: ${workflowResponse}`)

    return res.status(200).json({ data: workflowResponse })
  } else {
    return res.status(405).send('Method not allowed')
  }
}