import { google } from "googleapis";

export default async function serviceAccountAuth() {
  try{
    const key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)

    const jwtClient = new google.auth.JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: ['https://www.googleapis.com/auth/devstorage.full_control']
    })

    return jwtClient
  } catch(error){
    console.log(error)
  }
}