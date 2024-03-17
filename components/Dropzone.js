//Process Flow
/**
 * 1. If user succesfully submits document slides to slide with spinning loading symbol (disable mouse and ability to click)
 * 2. If GCP returns error, moves back to uploading page
 * 3. If succesful, slides to results slide
 * 4. On clear, slides back to submission pagey
 */
//TODO: Not receiving a response from api call
//TODO: Drag and drop icon button does not inherit changes in color (error appearing) (Maybe change to button, and change the styling of the inner text)
import { useState, useCallback, forwardRef } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Box, Button, CircularProgress, Fade, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography, Zoom } from "@mui/material"
import BackupIcon from '@mui/icons-material/Backup';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteForever from "@mui/icons-material/DeleteForever";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
const maxSize = 1024 * 1024 * 5

const Dropzone = forwardRef((props, ref) => {
  const { file, setFile, openSnackbar, valid, setSubmissionSuccess } = props
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length) {
      const file = acceptedFiles[0]
      setFile(Object.assign(file, { preview: URL.createObjectURL(file) }))
    }
  }, [])

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (rejectedFiles) => {
      const rejectedFile = rejectedFiles[0]
      if (rejectedFile) {
        if (rejectedFile.file.size > maxSize) {
          openSnackbar({ message: 'Document size too large', severity: 'error' })
        } else {
          openSnackbar({ message: 'Docoment type not supported', severity: 'error' })
        }
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxSize: maxSize
  })

  const determinePreview = (file) => {
    if (!file) {
      return
    }

    if (file.type === 'application/pdf') {
      return (
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
      )
    } else if (file.type.match('image\/(png|jpg|jpeg)')) {
      return (
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
      )
    }

    return (
      <Typography>
        {file.name}
      </Typography>
    )
  }

  const getBytes = (fileSize) => {
    const bytes = fileSize / 1024
    const size = Math.floor(bytes * 100) / 100

    if (size >= 1024) {
      const mbSize = (size / 1024).toFixed(2)
      return `${mbSize} MB`
    }

    return `${size} KB`
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      if (!valid) {
        throw new Error('User is not logged in, please log in before attempting to upload documents')
      }

      const uuid = localStorage.getItem('uuid')
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/upload/${uuid}`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        throw new Error(`${res.status} - ${res.statusText}`)
      }

      setSubmissionSuccess(true)
      URL.revokeObjectURL(file.preview)
      setFile(null)
    } catch (error) {
      console.error(`Error uploading document to google cloud: ${error}`)
      openSnackbar({ message: 'There was an error uploading your document, please try again later', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      ref={ref}
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
        disabled={!valid || file !== null}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <BackupIcon
            sx={{
              fontSize: 100,
            }}
          />
          <Typography>
            {isDragActive ? 'Drop the files here...' : 'Drag and drop some files here, or click to select files'}
          </Typography>
        </Box>
      </IconButton>

      {/* Error here with the 'out' prop */}
      <Fade in={file !== null} out={file === null}>
        <List>
          <ListItem
            key={file?.name}
            sx={{
              border: '2px #A9A9A9 dashed',
              borderRadius: '5px',
              width: '425px'
            }}
          >
            <Tooltip
              TransitionComponent={Zoom}
              title={determinePreview(file)}
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
                key={file?.name}
                sx={{
                  borderRadius: '5px'
                }}
              >
                <ListItemIcon >
                  <DescriptionIcon sx={{ fontSize: 40 }} />
                </ListItemIcon>
                <ListItemText
                  primary={file?.name}
                  secondary={getBytes(file?.size)}
                />
              </ListItemButton>
            </Tooltip>
            <IconButton onClick={() => setFile(null)}>
              <DeleteForever sx={{ fontSize: 40, color: 'red' }} />
            </IconButton>
          </ListItem>
        </List>
      </Fade>

      <Fade in={file !== null}>
        <Button
          variant='outlined'
          onClick={handleSubmit}
          size="large"
          disabled={loading}
          sx={{
            minWidth: '200px',
            height: '48px',
            position: 'relative'
          }}
        >
          {loading ? <CircularProgress size={30} /> : "Submit"}
        </Button>
      </Fade>
    </Box>
  )
})

export default Dropzone