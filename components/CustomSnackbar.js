import { Alert, Snackbar } from "@mui/material"

const CustomSnackbar = ({ open, onClose, severity, message }) => {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      autoHideDuration={4000}
    >
      <Alert severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  )
}

export default CustomSnackbar