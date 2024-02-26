import { useEffect, useState } from "react";
import DefaultAppBar from "@/components/DefaultAppBar";
import { Box, Button } from "@mui/material";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession()
  const email = session?.user?.email
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    if (status === 'authenticated') {
      validateUser()
    }
  }, [status])

  const validateUser = async () => {
    try {
      const res = await fetch(`/api/auth/validate/${email}`, {
        method: 'GET',
      })

      if (!res.ok) {
        throw new Error(`${res.status} - ${res.statusText}`)
      }

      const response = await res.json()
      const uuid = response.uuid

      localStorage.setItem('uuid', uuid)

    } catch (error) {
      console.error(`Error occurred when logging in user: ${error}`)
    }
  }

  const handleFileUpload = (event) => {
    setSelectedFile(event.target.files[0])
  }

  //TODO: Not receiving a response from api call
  const handleFileSubmit = async () => {
    try {
      const uuid = localStorage.getItem('uuid')
      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await fetch(`/api/upload/${uuid}`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        throw new Error(`${res.status} - ${res.statusText}`)
      }

    } catch (error) {
      console.error(`Error uploading document to server: ${error}`)
    }
  }

  return (
    <Box>
      <DefaultAppBar />
      <input
        type="file"
        id="fileUpload"
        accept=".jpg,.jpeg,.png,.pdf"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
      <label htmlFor="fileUpload">
        <Button variant="contained" component="span">
          Upload File
        </Button>
      </label>
      <Button variant="contained" onClick={handleFileSubmit}>
        Submit
      </Button>
    </Box>
  )
}
