import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogActions, Button, Box } from '@mui/material';
import CustomSnackbar from "@/components/CustomSnackbar";
import { useSnackbar } from "@/context/SnackbarContext";

const DeleteModal = (props) => {
  const { openDeleteModal, onClose, selectedItem, setSelectedItem } = props
  const { open, message, severity, openSnackbar, closeSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const uuid = localStorage.getItem('uuid')

    try {
      const payload = JSON.stringify({
        doc_id: selectedItem.id,
        uuid: uuid
      })

      const res = await fetch(`/api/firestore/delete-doc/${payload}`)

      if (!res.ok) {
        throw new Error(`${res.status} - ${res.statusText}`)
      }

      setSelectedItem(null)
      onClose()
    } catch (error) {
      console.error(`There was an error deleting document in google firestore: ${error}`)
      openSnackbar({ message: 'There was an error deleting your analysis, please try again', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Dialog
        open={openDeleteModal}
        maxWidth='sm'
        fullWidth={true}
      >
        <DialogTitle>
          Delete Analysis
        </DialogTitle>
        <DialogContent dividers>
          This will delete the analysis for <b>{selectedItem?.name}</b>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <CustomSnackbar
        open={open}
        onClose={closeSnackbar}
        message={message}
        severity={severity}
      />
    </Box>
  )
}

export default DeleteModal