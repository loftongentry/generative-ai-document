//TODO: Snackbar keep shifting items around. Need to review that
//TODO: Information icon in top right next to "Clear Results" button (Open modal explaning how to use the )
//TODO: Different way of updating last login for user since it can be within the same API route
//TODO: Handling retrieving new analysis data using SSE
//TODO: Review over how the useCallbacks and useEffects are being handled
//TODO (MAYBE): Use "getServerSideProps" when fetching data (post authorization) from firestore (https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props)
import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Box, Button, Fade, IconButton, Toolbar, Tooltip } from "@mui/material";
import { styled, useTheme } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import DefaultDrawer from "@/components/DefaultDrawer";
import Dropzone from "@/components/Dropzone";
import Results from "@/components/Results";
import CustomSnackbar from "@/components/CustomSnackbar";
import { useSnackbar } from "@/context/SnackbarContext";

const drawerWidth = 240

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open, width, height }) => ({
    height: `calc(${height}px - 64px)`,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginTop: `64px`,
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
    ...(width < 768 && {
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
  const theme = useTheme()
  const valid = session?.user
  const email = session?.user?.email
  const [file, setFile] = useState(null)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dropzoneScale, setDropzoneScale] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [listItems, setListItems] = useState([])

  //NOTE: Have to use useState instead of theme object because the component was rendering/mounting before the theme object had chance to change based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setViewportWidth(width)
      setViewportHeight(height)

      setDropzoneScale(width <= 425)

      theme.resultsScale = width <= 768
      theme.resultGridScale = width <= 425
      theme.palette = { ...theme.palette }
      if ((width <= 1024 && results) || width <= 425) {
        setDrawerOpen(false)
      } else if (width > 425 && !results) {
        setDrawerOpen(true)
      }
    }

    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }

  }, [results])

  //TODO: Gotta make sure this doesn't execute before there's an email
  const validateUser = useCallback(async () => {
    try {
      const res = await fetch(`/api/auth/validate/${email}`, {
        method: 'GET',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(`${res.status} - ${res.statusText} - ${data.error}`)
      }

      const response = await res.json()
      const uuid = response.uuid

      localStorage.setItem('uuid', uuid)
    } catch (error) {
      console.error(`Error occurred when logging in user: ${error}`)
      openSnackbar({ message: 'Error signing in user', severity: 'error' })
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      const uuid = localStorage.getItem('uuid')

      if (!uuid) {
        validateUser()
      } else {
        return
      }
    }
  }, [status, validateUser])

  const fetchFirestoreAnalysis = useCallback(async () => {
    try {
      const uuid = localStorage.getItem('uuid')
      const res = await fetch(`/api/fetch-analysis/${uuid}`)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(`${res.status} - ${res.statusText} - ${data.error}`)
      }

      const data = await res.json()
      setListItems(data)
    } catch (error) {
      console.error(`Error retrieving user's items from Firestore: ${error}`)
      openSnackbar({ message: `Unable to retrieve your document analysis, please try again later`, severity: 'error' })
    }
  }, [])

  useEffect(() => {
    if (valid) {
      fetchFirestoreAnalysis()
    } else {
      setListItems([])
    }
  }, [valid, fetchFirestoreAnalysis])

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

  const handleDrawer = () => {
    setDrawerOpen(!drawerOpen)
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
          <Tooltip
            open={session === null}
            title={(!drawerOpen && session === null) ? 'Please login before attempting to upload a document' : ''}
            placement="right"
          >
            <IconButton
              onClick={handleDrawer}
              color="inherit"
              edge="start"
              sx={{ mr: 2, ...(open && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
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
        session={session}
        drawerOpen={drawerOpen}
        handleDrawer={handleDrawer}
        drawerWidth={drawerWidth}
        viewportWidth={viewportWidth}
        results={results}
        setResults={setResults}
        listItems={listItems}
        setListItems={setListItems}
        fetchFirestoreAnalysis={fetchFirestoreAnalysis}
        openSnackbar={openSnackbar}
      />

      <Main
        ref={mainRef}
        open={drawerOpen}
        width={viewportWidth}
        height={viewportHeight}
      >
        <Fade
          container={mainRef.current}
          in={!results}
          out={`${results !== null}`}
          mountOnEnter
          unmountOnExit
          style={{
            position: 'relative',
            transform: dropzoneScale ? 'scale(0.8)' : 'none'
          }}
        >
          <div>
            <Dropzone
              session={session}
              file={file}
              setFile={setFile}
              openSnackbar={openSnackbar}
              loading={loading}
              setLoading={setLoading}
            />
          </div>
        </Fade>
        <Fade
          container={mainRef.current}
          in={results !== null}
          mountOnEnter
          unmountOnExit
          timeout={{ enter: 300, exit: 0 }}
          style={{
            transitionDelay: '250ms',
            position: 'absolute',
            zIndex: 1,
            transform: theme.resultsScale ? 'scale(0.8)' : 'none'
          }}
        >
          <div>
            <Results
              results={results}
              openSnackbar={openSnackbar}
              theme={theme}
              viewportWidth={viewportWidth}
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