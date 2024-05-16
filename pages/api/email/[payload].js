import generateTemplate from "@/lib/generate-template";
import { google } from "googleapis";
import { getToken } from "next-auth/jwt";

export default async function handler(req, res) {
  const { query: { payload } } = req
  const {
    userEmail,
    userName,
    subject,
    body,
    uuid
  } = JSON.parse(payload)
  const token = await getToken({ req })

  if (!token) {
    return res.status(401).json({ error: 'User access denied' })
  }

  try {
    const oauthClient = new google.auth.OAuth2({})
    oauthClient.setCredentials({
      access_token: token.accessToken
    })

    const gmail = google.gmail({ version: 'v1', auth: oauthClient })

    const emailContent = generateTemplate({ userEmail, userName, subject, body, uuid })
    const email = `From: <${userEmail}>\nTo: <cary.l.gentry.jr@gmail.com>\nSubject: Gen AI Feedback: ${subject}\nContent-Type: multipart/mixed; boundary="foo_bar_baz"\n\n--foo_bar_baz\nContent-Type: text/html; charset=utf-8\n\n${emailContent}\n--foo_bar_baz--`

    const encodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail
      }
    })

    return res.status(201).json({ success: true })
  } catch (error) {
    console.error(`Error occurring while sending email: ${error}`)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}