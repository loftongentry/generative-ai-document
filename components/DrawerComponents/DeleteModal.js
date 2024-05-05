import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogActions, Button } from '@mui/material';

const DeleteModal = (props) => {
  const { openDeleteModal, onClose, selectedItem, results, setResults, setSelectedItem, fetchFirestoreAnalysis, openSnackbar } = props
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
        const data = await res.json()
        throw new Error(`${res.status} - ${res.statusText} - ${data.error}`)
      }

      if (selectedItem?.id === results?.id) {
        setResults(null)
      }

      setSelectedItem(null)
      onClose()
      fetchFirestoreAnalysis()
    } catch (error) {
      console.error(`There was an error deleting document in google firestore: ${error}`)
      openSnackbar({ message: 'There was an error deleting your analysis, please try again later', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={openDeleteModal}
      maxWidth='sm'
      fullWidth={true}
    >
      <DialogTitle>
        Delete Analysis
      </DialogTitle>
      <DialogContent dividers>
        This will delete the analysis for <b>{selectedItem?.file_name}</b>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
        >
          Close
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={loading}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteModal