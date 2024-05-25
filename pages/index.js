import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Alert, Box, Button, CssBaseline, Fade, IconButton, Snackbar, Toolbar, Tooltip } from "@mui/material";
import { styled, useTheme } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import DefaultDrawer from "@/components/DefaultDrawer";
import Dropzone from "@/components/Dropzone";
import Results from "@/components/Results";
import CustomSnackbar from "@/components/CustomSnackbar";
import { useSnackbar } from "@/context/SnackbarContext";
import { pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
const drawerWidth = 240

const scrollbarStyle = `
  body::-webkit-scrollbar {
    width: 6px;
    background-color: transparent;
  }

  body::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 6px;
    border: 3px solid #f0f0f0;
  }
`;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open, width, results }) => ({
    display: 'flex',
    justifyContent: 'center',
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginTop: results && width <= 425 ? '-32px' : '64px',
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
    overflow: 'hidden',
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

const MAX_POLLING_TIME = 2 * 60 * 1000

export default function Home() {
  const { data: session, status } = useSession()
  const { open, message, severity, openSnackbar, closeSnackbar } = useSnackbar()
  const mainRef = useRef(null)
  const intervalRef = useRef(null)
  const theme = useTheme()
  const [file, setFile] = useState(null)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dropzoneScale, setDropzoneScale] = useState(false)
  const [globalLoading, setGlobalLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [listItems, setListItems] = useState([])

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = scrollbarStyle
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  //NOTE: Have to use useState instead of theme object because the component was rendering/mounting before the theme object had chance to change based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setViewportWidth(width)
      setDropzoneScale(width <= 425)

      theme.resultsScale = width <= 768
      theme.resultGridScale = width <= 425
      if ((width <= 1024 && results) || width <= 425) {
        setDrawerOpen(false)
      } else if (width > 425 && !results) {
        setDrawerOpen(true)
      }

      theme.palette = { ...theme.palette }
    }

    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }

  }, [results])

  useEffect(() => {
    if (results) {
      generateUrl(results)
    }
  }, [results])

  const generateUrl = useCallback(async (item) => {
    try {
      const payload = JSON.stringify({
        doc_name: item?.cloud_storage_id,
        bucket: item?.bucket
      })

      const res = await fetch(`/api/storage/${payload}`)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(`${res.status} - ${res.statusText} - ${data.error}`)
      }

      const generatedUrl = await res.json()
      setGeneratedUrl(generatedUrl)
    } catch (error) {
      console.log(`There was an error generating the url to view the analyzed document: ${error}`)
      openSnackbar({ message: 'There was an error previewing your analyzed document, please try again later', severity: 'error' })
    }
  })

  const fetchFirestoreAnalysis = async () => {
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
  }

  const validateUser = async (email) => {
    try {
      const storedUUID = localStorage.getItem('uuid')

      if (!storedUUID) {
        const res = await fetch(`/api/auth/validate/${email}`)

        if (!res.ok) {
          const data = await res.json()
          throw new Error(`${res.status} - ${res.statusText} - ${data.error}`)
        }

        const response = await res.json()
        const uuid = response.uuid

        localStorage.setItem('uuid', uuid)
      }

      await fetchFirestoreAnalysis()
    } catch (error) {
      console.error(`Error occurred when logging in user: ${error}`)
      openSnackbar({ message: 'Error signing in user', severity: 'error' })
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      const email = session.user.email
      validateUser(email)
    }
  }, [session, status])

  //NOTE: Couldn't figure out SSE or websockets so used polling instead. Can't exceed two minutes for polling for data though
  useEffect(() => {
    if (!globalLoading) {
      return
    }

    const pollData = async () => {
      try {
        const startTime = Date.now()

        const res = await fetch('/api/get-file-data', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(`${res.status} - ${res.statusText} - ${data.error}`)
        }

        const result = await res.json()

        if (result.status === 'ready') {
          setResults(result.data)
          clearInterval(intervalRef.current)
          setGlobalLoading(false)
          fetchFirestoreAnalysis()
        } else {
          const elapsedTime = Date.now() - startTime
          if (elapsedTime > MAX_POLLING_TIME) {
            throw new Error('Polling time exceeded 2 minutes')
          }
        }
      } catch (error) {
        console.error(`Error retrieving processed data from server: ${error}`)
        openSnackbar({ message: 'There was an error getting your processed data, please try again later', severity: 'error' })
        setGlobalLoading(false)
      }
    }

    intervalRef.current = setInterval(pollData, 2000)

    const timeout = setTimeout(() => {
      clearInterval(intervalRef.current)
      console.log('Polling stopped due to timeout.')
      openSnackbar({ message: 'Polling stopped due to timeout.', severity: 'error' })
      setGlobalLoading(false)
    }, MAX_POLLING_TIME)

    return () => {
      clearInterval(intervalRef.current)
      clearTimeout(timeout)
    }
  }, [globalLoading])

  const handleClearResults = () => {
    setResults(null)
    setGeneratedUrl('')
  }

  const handleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      <CssBaseline />
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
                  onClick={() => setGlobalLoading(prev => !prev)}
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
                onClick={handleClearResults}
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
        handleClearResults={handleClearResults}
        listItems={listItems}
        setListItems={setListItems}
        fetchFirestoreAnalysis={fetchFirestoreAnalysis}
        openSnackbar={openSnackbar}
        globalLoading={globalLoading}
        generateUrl={generateUrl}
      />

      <Main
        ref={mainRef}
        open={drawerOpen}
        width={viewportWidth}
        results={results}
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
            <DrawerHeader />
            <Dropzone
              session={session}
              file={file}
              setFile={setFile}
              openSnackbar={openSnackbar}
              globalLoading={globalLoading}
              setGlobalLoading={setGlobalLoading}
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
              generatedUrl={generatedUrl}
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

      <Snackbar
        open={globalLoading}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
      >
        <Alert severity='warning'>
          Your document is being processed, please be patient and do not close the page
        </Alert>
      </Snackbar>
    </Box >
  )
}