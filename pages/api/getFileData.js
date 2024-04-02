export const runtime = 'nodejs'

export const dynamic = 'force-dynamic'

export default async function handler(req, res) {
  try {
    const workflowResponse = await req.body.data
    if (workflowResponse) {
      console.log(`Received Workflow Response: ${workflowResponse}`)

      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      res.write(`data: ${JSON.stringify(workflowResponse)}\n\n`)
      res.end()

      return res.status(200).json({ success: true })
    }
  } catch (error) {
    console.error(`Error retrieving data from Google Workflows: ${error}`)
    return res.status(500).json({ error: 'Internal Server Error' }).end()
  }
}