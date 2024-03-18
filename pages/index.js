//TODO: Websocket listening for responses from the cloud (open and close web socket based on submissionSuccess status?)
import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Box, Button, CircularProgress, Fade, IconButton, Slide, Toolbar } from "@mui/material";
import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import DefaultDrawer from "@/components/DefaultDrawer";
import Dropzone from "@/components/Dropzone";
import Results from "@/components/Results";
import CustomSnackbar from "@/components/CustomSnackbar";
import { useSnackbar } from "@/context/SnackbarContext";

const drawerWidth = 240

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open, viewportwidth }) => ({
    height: '100vh',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    overflow: 'hidden'
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

export default function Home() {
  const { data: session, status } = useSession()
  const { open, message, severity, openSnackbar, closeSnackbar } = useSnackbar()
  const mainRef = useRef(null)
  const email = session?.user?.email
  const [file, setFile] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [valid, setValid] = useState(true)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [submissionSuccess, setSubmissionSuccess] = useState(true)
  const [results, setResults] = useState(null)

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

  const handleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar>
        <Toolbar>
          <IconButton
            onClick={handleDrawer}
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
        handleDrawer={handleDrawer}
        drawerWidth={drawerWidth}
        viewportWidth={viewportWidth}
        valid={valid}
      />

      <Main
        open={drawerOpen}
        viewportwidth={viewportWidth}
        ref={mainRef}
      >
        <Slide
          in={!submissionSuccess}
          out={!submissionSuccess}
          container={mainRef.current}
          direction="up"
          mountOnEnter
          unmountOnExit
          easing={{
            enter: 'cubic-bezier(0, 1.5, .8, 1)'
          }}
        >
          <Dropzone
            file={file}
            setFile={setFile}
            openSnackbar={openSnackbar}
            valid={valid}
            setSubmissionSuccess={setSubmissionSuccess}
          />
        </Slide>
        {/* Temporarily commented out */}
        {/* {submissionSuccess && (
          <Fade
            in={submissionSuccess}
            container={mainRef.current}
            style={{
              transitionDelay: '250ms'
            }}
          >
            <CircularProgress />
          </Fade>
        )} */}
        <Slide
          in={results !== null}
          container={mainRef.current}
          direction="left"
        >
          <Results 
            results={results}
            setResults={setResults}
            viewportWidth={viewportWidth}
          />
        </Slide>
      </Main>

      <CustomSnackbar
        open={open}
        onClose={closeSnackbar}
        message={message}
        severity={severity}
      />
      <Button
        onClick={() => setSubmissionSuccess(!submissionSuccess)}
      >
        Click
      </Button>
    </Box >
  )
}