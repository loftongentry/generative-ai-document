//TODO: make the width of the dropzone and the file underneath it the same width
//TODO: Shows a different icon and message if user tries to hover over and drop a document that will not be accepted (i.e. .doc, .docx, .xlsx, etc.)
//TODO: For loading symbol, shows spinning loading logo on top of cloud, then once response is received, if succesful, show clod with checkmark, if failed, show something with an x
//TODO: On receiving succesful response from /api/getFileData, smoothly redirects to results (like a transition slide)
//TODO: User can only upload one document at a time
//TODO: Not receiving a response from api call
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Box, Button, CircularProgress, Fade, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography, Zoom } from "@mui/material"
import BackupIcon from '@mui/icons-material/Backup';
import DescriptionIcon from '@mui/icons-material/Description';
import { DeleteForever } from "@mui/icons-material";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const Dropzone = (props) => {
  const { drawerOpen, drawerWidth, openSnackbar } = props
  const { files, setFiles } = props

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length) {
      setFiles(prev => ([
        ...prev,
        ...acceptedFiles.map(file => (
          Object.assign(file, { preview: URL.createObjectURL(file) })
        ))
      ]))
    }
  }, [])

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    validator: (newFile) => {
      const exists = files.some(file => file.name === newFile.name)

      if (!exists) {
        return false
      }

      openSnackbar({ message: 'Cannot upload the same file twice', severity: 'error' })
      return true
    }
  })

  const removeFile = (name) => {
    setFiles(files => files.filter(file => file.name !== name))
  }

  const handleSubmit = async () => {
    try {
      const uuid = localStorage.getItem('uuid')
      const formData = new FormData()
      formData.append('file', files)

      const res = await fetch(`/api/upload/${uuid}`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        throw new Error(`${res.status} - ${res.statusText}`)
      }

    } catch (error) {
      console.error(`Error uploading document to google cloud: ${error}`)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: drawerOpen ? `calc(100vw - ${drawerWidth}px)` : '100vw',
      }}
    >
      <IconButton
        {...getRootProps({})}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          border: '2px #A9A9A9 dashed',
          borderRadius: '5px',
          padding: '20px',
          width: '425px'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <BackupIcon sx={{ fontSize: 100 }} />
          <Typography>
            {isDragActive ? 'Drop the files here...' : 'Drag and drop some files here, or click to select files'}
          </Typography>
        </Box>
      </IconButton>

      <List>
        {files.map((file, index) => (
          <ListItem
            key={file.name}
            sx={{
              border: '2px #A9A9A9 dashed',
              borderRadius: '5px',
              marginBottom: index !== files.length - 1 ? '8px' : 0
            }}
          >
            <Tooltip
              TransitionComponent={Zoom}
              title={file.type === 'application/pdf' ? (
                <Document
                  file={file.preview}
                  loading={
                    <Box 
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  }
                  error={'Failed to load PDF preview'}
                >
                  <Page 
                    pageNumber={1}
                    height={300}
                  />
                </Document>
              ) : (
                <Image
                  src={file.preview}
                  alt={file.name}
                  width={0}
                  height={0}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '5px'
                  }}
                />
              )}
              followCursor
              componentprops={{
                tooltip: {
                  maxWidth: '100%',
                  padding: '10px',
                  borderRadius: '5px'
                }
              }}
            >
              <ListItemButton
                key={file.name}
                sx={{
                  borderRadius: '5px'
                }}
              >
                <ListItemIcon >
                  <DescriptionIcon sx={{ fontSize: 40 }} />
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={file.size}
                />
              </ListItemButton>
            </Tooltip>
            <IconButton onClick={() => removeFile(file.name)}>
              <DeleteForever sx={{ fontSize: 40, color: 'red' }} />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Fade in={files.length > 0}>
        <Button variant='contained' onClick={handleSubmit}>
          Submit
        </Button>
      </Fade>
    </Box>
  )
}

export default Dropzone