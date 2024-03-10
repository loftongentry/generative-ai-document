import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Box, IconButton, Toolbar } from "@mui/material";
import { styled, useTheme } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import DefaultDrawer from "@/components/DefaultDrawer";
import Dropzone from "@/components/Dropzone";
import CustomSnackbar from "@/components/CustomSnackbar";
import { useSnackbar } from "@/context/SnackbarContext";

const drawerWidth = 240

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open, viewportwidth }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
    ...(viewportwidth < 768 && {
      marginLeft: 0,
    }),
  }),
)

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}))

export default function Home() {
  const { data: session, status } = useSession()
  const { open, message, severity, openSnackbar, closeSnackbar } = useSnackbar()
  const theme = useTheme()
  const email = session?.user?.email
  const [files, setFiles] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [valid, setValid] = useState(true)
  const [viewportWidth, setViewportWidth] = useState(0)

  useEffect(() => {
    setViewportWidth(window.innerWidth)
    if (window.innerWidth >= 768) {
      setDrawerOpen(true)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      validateUser()
    }
  }, [status])

  const validateUser = useCallback(async () => {
    try {
      const res = await fetch(`/api/auth/validate/${email}`, {
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error(`${res.status} - ${res.statusText}`);
      }

      const response = await res.json();
      const uuid = response.uuid;

      localStorage.setItem('uuid', uuid);
      setValid(true);
    } catch (error) {
      console.error(`Error occurred when logging in user: ${error}`);
      openSnackbar({ message: 'Error signing in user', severity: 'error' });
    }
  }, [email, openSnackbar]);

  const handleDrawerOpen = () => {
    setDrawerOpen(!drawerOpen)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar>
        <Toolbar>
          <IconButton
            onClick={handleDrawerOpen}
            color="inherit"
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <DefaultDrawer
        drawerOpen={drawerOpen}
        handleDrawerOpen={handleDrawerOpen}
        drawerWidth={drawerWidth}
        viewportWidth={viewportWidth}
        valid={valid}
      />

      <Main
        open={drawerOpen}
        viewportwidth={viewportWidth}
      >
        <DrawerHeader />
        <Dropzone
          files={files}
          setFiles={setFiles}
          openSnackbar={openSnackbar}
          valid={valid}
        />
      </Main>

      <CustomSnackbar
        open={open}
        onClose={closeSnackbar}
        message={message}
        severity={severity}
      />
    </Box >
  )
}