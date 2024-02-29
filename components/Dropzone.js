import { Box, Button, List, ListItem, Typography } from "@mui/material"
import Image from "next/image"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"

const Dropzone = (props) => {
  const { } = props
  const [files, setFiles] = useState([])

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  //TODO: Not receiving a response from api call
  const handleFileSubmit = async () => {
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
    <Box>
      <Box {...getRootProps({})}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography>Drop the files here...</Typography>
        ) : (
          <Typography>Drag and drop some files here, or click to select files</Typography>
        )}
      </Box>
      <ul style={{ display: 'flex', listStyleType: 'none', padding: 0 }}>
        {files.map(file => (
          <li key={file.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
            <Image
              src={file.preview}
              alt={file.name}
              width={300}
              height={300}
              onLoad={() => {
                URL.revokeObjectURL(file.preview)
              }}
              style={{ maxWidth: '70%', maxHeight: '70%', width: 'auto', height: 'auto', border: '2px gray solid', borderRadius: '10px' }}
            />
            <Typography>{file.name}</Typography>
            <Button
              sx={{ position: 'relative', top: '5px', right: '5px' }}
              onClick={() => removeFile(index)}
            >
              X
            </Button>
          </li>
        ))}
      </ul>
    </Box>
  )
}

export default Dropzone