//TODO: Handle previewing a PDF file
//TODO: Prevent drop zone from behaving sporadically when passing document over and dramatically increasing in size after document uploaded
//TODO: Shows a different icon and message if user tries to hover over and drop a document that will not be accepted (i.e. .doc, .docx, .xlsx, etc.)
//TODO: For loading symbol, shows spinning loading logo on top of cloud
//TODO: On receiving succesful response from /api/getFileData, smoothly redirects to results (like a transition slide)
//TODO: Warning if user is trying to upload more than one document that it will take longer to evaluate
//TODO: Not receiving a response from api call
//TODO: Suppress "IconButton" error
import Image from "next/image"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Box, Button, Fade, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Tooltip, Typography, Zoom } from "@mui/material"
import BackupIcon from '@mui/icons-material/Backup';
import DescriptionIcon from '@mui/icons-material/Description';
import { DeleteForever } from "@mui/icons-material";

const Dropzone = (props) => {
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    validator: (newFile) => {
      const exists = files.some(file => file.name === newFile.name)

      if (!exists) {
        return false
      }

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
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <IconButton
        {...getRootProps({})}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          border: '2px #A9A9A9 dashed',
          borderRadius: '5px',
          padding: '20px'
        }}
      >
        <input
          {...getInputProps()}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <BackupIcon sx={{ fontSize: 100 }} />
          {isDragActive ? (
            <Typography>
              Drop the files here...
            </Typography>
          ) : (
            <Typography>
              Drag and drop some files here, or click to select files
            </Typography>
          )}
        </Box>
      </IconButton>

      <List>
        {files.map((file, index) => (
          <ListItemButton
            key={file.name}
            sx={{
              border: '2px #A9A9A9 dashed',
              borderRadius: '5px',
              marginBottom: index !== files.length - 1 ? '8px' : 0
            }}
          >
            <Tooltip
              TransitionComponent={Zoom}
              title={
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
              }
              followCursor
              componentProps={{
                tooltip: {
                  maxWidth: '100%',
                  padding: '10px',
                  borderRadius: '5px'
                }
              }}
            >
              <ListItem key={file.name}>
                <ListItemAvatar>
                  <DescriptionIcon />
                </ListItemAvatar>
                <ListItemText
                  primary={file.name}
                  secondary={file.size}
                />
              </ListItem>
            </Tooltip>
            <IconButton onClick={() => removeFile(file.name)}>
              <DeleteForever sx={{ fontSize: 40, color: 'red' }} />
            </IconButton>
          </ListItemButton>
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