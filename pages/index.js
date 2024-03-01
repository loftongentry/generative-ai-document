//TODO: Snackbar messages for success, warning, errors (using useContext)
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Box } from "@mui/material";
import DefaultAppBar from "@/components/DefaultAppBar";
import Dropzone from "@/components/Dropzone";

export default function Home() {
  const { data: session, status } = useSession()
  const email = session?.user?.email
  const [files, setFiles] = useState([])

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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}
    >
      <DefaultAppBar />
      <Dropzone
        files={files}
        setFiles={setFiles}
      />
    </Box>
  )
}
