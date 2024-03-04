//TODO: Snackbar messages for success, warning, errors (using useContext)
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Box, IconButton } from "@mui/material";
import DefaultAppDrawer from "@/components/DefaultAppDrawer";
import Dropzone from "@/components/Dropzone";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function Home() {
  const { data: session, status } = useSession()
  const email = session?.user?.email
  const [files, setFiles] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(true)
  const drawerWidth = drawerOpen ? 240 : 0

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
        flexDirection: 'row',
        width: '100vw',
        height: '100vh'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <DefaultAppDrawer
          drawerWidth={drawerWidth}
        />
        <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
          {drawerOpen ? <ArrowBackIcon /> : <ArrowForwardIcon />}
        </IconButton>
      </Box>

      <Dropzone
        files={files}
        setFiles={setFiles}
        drawerOpen={drawerOpen}
        drawerWidth={drawerWidth}
      />
    </Box >
  )
}
