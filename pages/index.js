//TODO: Handling use SSE
//TODO: Information icon in top right next to "Clear Results" button (Open modal explaning how to use the )
//TODO: Why does the content shift over when the snackbar appears?
//TODO: Use "getServerSideProps" when fetching data post authorization from firestore (https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props)
import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Box, Button, Fade, IconButton, Slide, Toolbar } from "@mui/material";
import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import DefaultDrawer from "@/components/DefaultDrawer";
import Dropzone from "@/components/Dropzone";
import Results from "@/components/Results";
import CustomSnackbar from "@/components/CustomSnackbar";
import { useSnackbar } from "@/context/SnackbarContext";
import { TestResult } from "@/test/TestResult";

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
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  useEffect(() => {
    setViewportWidth(window.innerWidth)
    if (window.innerWidth >= 768) {
      setDrawerOpen(true)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      //validateUser()
    }
  }, [status])

  // useEffect(() => {
  //   const eventSource = new EventSource('/api/getFileData')

  //   if (!loading) {
  //     eventSource.close()
  //     return
  //   }

  //   eventSource.onmessage('message', (event) => {
  //     const newData = JSON.parse(event.data)
  //     console.log(newData)
  //   })

  //   eventSource.onerror = (event) => {
  //     console.log(`Error retrieving results: ${error}`)
  //     openSnackbar({ message: 'There was an error retrieving your results, please try again later', severity: 'error' })
  //     eventSource.close()
  //   }

  //   return () => {
  //     setSubmissionSuccess(false)
  //     eventSource.close()
  //   }
  // }, [loading])

  const validateUser = useCallback(async () => {
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
  }, [email])

  const handleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleSetResults = () => {
    setResults((prevResults) => prevResults === null ? TestResult : null);
  }

  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      <AppBar>
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <IconButton
            onClick={handleDrawer}
            color="inherit"
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            sx={{
              display: 'flex',
              gap: '10px'
            }}
          >
            {process.env.NODE_ENV === 'development' && (
              <Box
                sx={{
                  display: 'flex',
                  gap: '10px'
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => setLoading(prev => !prev)}
                >
                  Change Loading State
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSetResults}
                >
                  Change Results State
                </Button>
              </Box>
            )}
            <Fade
              in={results !== null && !drawerOpen}
              unmountOnExit
            >
              <Button
                variant="contained"
                onClick={() => setResults(null)}
              >
                Clear Results
              </Button>
            </Fade>
          </Box>
        </Toolbar>
      </AppBar>

      <DefaultDrawer
        drawerOpen={drawerOpen}
        handleDrawer={handleDrawer}
        drawerWidth={drawerWidth}
        viewportWidth={viewportWidth}
        valid={valid}
        setResults={setResults}
      />

      <Main
        open={drawerOpen}
        viewportwidth={viewportWidth}
        ref={mainRef}
      >
        <Slide
          in={!results}
          out={`${results}`}
          container={mainRef.current}
          direction="up"
          mountOnEnter
          unmountOnExit
          easing={{
            enter: 'cubic-bezier(0, 1.5, .8, 1)',
          }}
          style={{ position: 'relative' }}
        >
          <Dropzone
            file={file}
            setFile={setFile}
            openSnackbar={openSnackbar}
            valid={valid}
            loading={loading}
            setLoading={setLoading}
            viewportwidth={viewportWidth}
          />
        </Slide>
        <Fade
          in={results !== null}
          container={mainRef.current}
          mountOnEnter
          unmountOnExit
          timeout={{ enter: 300, exit: 0 }}
          style={{
            transitionDelay: '250ms',
            position: 'absolute',
            zIndex: 1
          }}
        >
          <div>
            <Results
              results={results}
              viewportWidth={viewportWidth}
              openSnackbar={openSnackbar}
            />
          </div>
        </Fade>
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