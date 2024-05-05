import { useCallback, forwardRef } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Box, Button, CircularProgress, Fade, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography, Zoom } from "@mui/material"
import BackupIcon from '@mui/icons-material/Backup';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteForever from "@mui/icons-material/DeleteForever";
import { Document, Page } from 'react-pdf';

const maxSize = 1024 * 1024 * 5

const Dropzone = forwardRef((props, ref) => {
  const { session, file, setFile, openSnackbar, loading, setLoading } = props
  const valid = session?.user

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
        setLoading(false)
        const data = await res.json()
        throw new Error(`${res.status} - ${res.statusText} - ${data.error}`)
      }

      URL.revokeObjectURL(file.preview)
      setFile(null)
    } catch (error) {
      console.error(`Error uploading document to google cloud: ${error}`)
      openSnackbar({ message: 'There was an error uploading your document, please try again later', severity: 'error' })
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
      onClick={() => {
        if (session === null) {
          openSnackbar({ message: 'You must be logged in before attempting to upload a document for analysis', severity: 'error' })
        }
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
          width: '425px',
          height: '175px',
        }}
        disabled={!valid || file !== null || loading}
      >
        <Fade
          in={!loading}
          out={`${loading}`}
          unmountOnExit
          timeout={{ enter: 250, exit: 0 }}
        >
          <Box>
            <BackupIcon
              sx={{
                fontSize: 100,
              }}
            />
            <Typography>
              {isDragActive ? 'Drop the file here...' : 'Drag and drop file here, or click to select file'}
            </Typography>
          </Box>
        </Fade>
        <Fade
          in={loading}
          out={`${!loading}`}
          unmountOnExit
          timeout={{ enter: 250, exit: 0 }}
        >
          <CircularProgress
            size={50}
          />
        </Fade>
      </IconButton>

      <Fade in={file !== null} out={`${file === null}`}>
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
                disabled={loading}
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
            <IconButton
              onClick={() => setFile(null)}
              disabled={loading}
            >
              <DeleteForever sx={{ fontSize: 40, color: 'red' }} />
            </IconButton>
          </ListItem>
        </List>
      </Fade>

      <Fade
        in={(file !== null) && !loading}
        out={`${loading}`}
      >
        <Button
          variant='contained'
          onClick={handleSubmit}
          size="large"
          sx={{
            minWidth: '200px',
            height: '48px',
            position: 'relative'
          }}
        >
          Submit
        </Button>
      </Fade>
    </Box>
  )
})

export default Dropzone