//https://michaelangelo.io/blog/server-sent-events
export const runtime = 'nodejs'

export const dynamic = 'force-dynamic'

export default async function handler(req, res) {
  let responseStream = new TransformStream()
  const writer = responseStream.writable.getWriter()
  const encoder = new TextEncoder()

  const eventSource = new EventSource('https://insect-super-broadly.ngrok-free.app/api/getFileData')

  eventSource.onmessage = async (event) => {
    await writer.write(encoder.encode(`event: message\ndata: ${event.data}\n\n`))
  }

  eventSource.onerror = async () => {
    eventSource.close()
    eventSource.close()
  }

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Conteol': 'no-cache, no-transform'
    }
  })
}

// export default async function handler(req, res) {
//   try {
//     const workflowResponse = await req.body.data
//     if (workflowResponse) {
//       console.log(`Received Workflow Response: ${workflowResponse}`)

//       res.setHeader('Content-Type', 'text/event-stream')
//       res.setHeader('Cache-Control', 'no-cache')
//       res.setHeader(Connection, 'keep-alive')
//       res.write(`data: ${JSON.stringify(workflowResponse)}\n\n`)
//       res.end()

//       return res.status(200).json({ success: true })
//     }
//   } catch (error) {
//     console.error(`Error retrieving data from Google Workflows: ${error}`)
//     return res.status(500).json({ error: 'Internal Server Error' }).end()
//   }
// }