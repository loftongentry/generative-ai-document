//TODO: Feedback should also be in settings modal. Use a smooth transition between both portions of code
import { useState } from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, Grid, IconButton, List, ListItemButton, Stack, TextField, Typography } from "@mui/material"
import { ThemeSelector } from "@/context/ThemeContext";
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import FeedbackIcon from '@mui/icons-material/Feedback';

const SettingsModal = (props) => {
  const { settingsModalOpen, handleSettingsModalClose } = props
  const [selectedSetting, setSelectedSetting] = useState('Option 1')
  const [feedback, setFeedback] = useState('')

  const getSettingsContent = () => {
    switch (selectedSetting) {
      case 'Option 1':
        return (
          <>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography>
                Theme
              </Typography>
              <ThemeSelector />
            </Box>
            <Divider />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography>
                Delete Analysis Data
              </Typography>
              <Button
                variant="outlined"
                color='error'
                size="small"
              >
                Delete All
              </Button>
            </Box>
            <Divider />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography>
                Delete Account
              </Typography>
              <Button
                variant="contained"
                color="error"
                size="small"
              >
                Delete Account
              </Button>
            </Box>
          </>
        )
      case 'Option 2':
        return (
          <>
            <TextField
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              label='Feedback'
              multiline
              rows={4}
            />
            <Button
              variant='contained'
            >
              Submit Feedback
            </Button>
          </>
        )
      default:
        return null
    }
  }

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
          <Typography variant="h5">
            Settings
          </Typography>
          <IconButton onClick={handleSettingsModalClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <Grid
          container
        >
          <Grid item xs={3}>
            <List>
              <ListItemButton
                selected={selectedSetting === 'Option 1'}
                onClick={() => setSelectedSetting('Option 1')}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderRadius: '5px',
                  marginBottom: '5px',
                }}
              >
                Option 1
                <SettingsIcon />
              </ListItemButton>
              <ListItemButton
                selected={selectedSetting === 'Option 2'}
                onClick={() => setSelectedSetting('Option 2')}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderRadius: '5px'
                }}
              >
                Option 2
                <FeedbackIcon />
              </ListItemButton>
            </List>
          </Grid>
          <Grid item xs={1} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Divider orientation="vertical" />
          </Grid>
          <Grid item xs={8}>
            <Stack
              spacing={1}
            >
              {getSettingsContent()}
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsModal