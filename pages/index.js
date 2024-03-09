//TODO: Properly position the arrow to open the drawer (Top of the drawer). Possibly make it hamburger menu that disappears when clicked
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Box, IconButton } from "@mui/material";
import { useSnackbar } from "@/context/SnackbarContext";
import DefaultAppDrawer from "@/components/DefaultAppDrawer";
import Dropzone from "@/components/Dropzone";
import CustomSnackbar from "@/components/CustomSnackbar";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function Home() {
  const { data: session, status } = useSession()
  const { open, message, severity, openSnackbar, closeSnackbar } = useSnackbar()
  const email = session?.user?.email
  const [files, setFiles] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [valid, setValid] = useState(false)
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
      setValid(true)
    } catch (error) {
      console.error(`Error occurred when logging in user: ${error}`)
      openSnackbar({ message: 'Error signing in user', severity: 'error' })
    }
  }

  const handleDrawerOpen = () => {
    setDrawerOpen(!drawerOpen)
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
          handleDrawerOpen={handleDrawerOpen}
          drawerWidth={drawerWidth}
          valid={valid}
        />
        <IconButton onClick={handleDrawerOpen}>
          {!drawerOpen && <ArrowForwardIcon />}
        </IconButton>
      </Box>

      <Dropzone
        files={files}
        setFiles={setFiles}
        drawerOpen={drawerOpen}
        drawerWidth={drawerWidth}
        openSnackbar={openSnackbar}
        valid={valid}
      />

      <CustomSnackbar
        open={open}
        onClose={closeSnackbar}
        message={message}
        severity={severity}
      />
    </Box >
  )
}
