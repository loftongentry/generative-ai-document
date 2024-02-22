import { useState } from "react";
import DefaultAppBar from "@/components/DefaultAppBar";
import { Box, Button } from "@mui/material";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileUpload = (event) => {
    setSelectedFile(event.target.files[0])
  }

  const handleFileSubmit = async () => {
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await fetch('/api/uploadFiles', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        throw new Error(`${res.status} - ${res.statusText}`)
      }

    } catch (error) {
      console.error(`Error uploading document to server: ${err}`)
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
