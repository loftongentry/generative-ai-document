//TODO: Feedback should also be in settings modal. Use a smooth transition between both portions of code
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, Grid, IconButton, Typography } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';
import { ThemeSelector } from "@/context/ThemeContext";

const SettingsModal = (props) => {
  const { settingsModalOpen, handleCloseSettingsModal } = props

  return (
    <Dialog
      fullWidth={true}
      maxWidth='sm'
      open={settingsModalOpen}
    >
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography>
            Settings
          </Typography>
          <IconButton onClick={handleCloseSettingsModal}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid
          container
          spacing={2}
        >
          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography>
              Theme
            </Typography>
            <ThemeSelector />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography>
              Delete All Document Analysis
            </Typography>
            <Button
              variant="outlined"
            >
              Delete Analysis
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography>
              Delete Account
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: 'red'
              }}
            >
              Delete Account
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsModal