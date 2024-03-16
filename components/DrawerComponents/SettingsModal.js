import { useState } from "react";
import { Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, IconButton, Stack, Tab, Tabs, TextField, Typography } from "@mui/material"
import { ThemeSelector } from "@/context/ThemeContext";
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import FeedbackIcon from '@mui/icons-material/Feedback';

const SettingsModal = (props) => {
  const { settingsModalOpen, handleSettingsModalClose, viewportWidth } = props
  const [selectedSetting, setSelectedSetting] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    try {

    } catch (error) {

    } finally {
      setLoading(false)
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
          flexDirection: viewportWidth > 768 ? 'row' : 'column',
          alignItems: viewportWidth <= 768 ? 'center' : ''
        }}
      >
        <Tabs
          orientation={viewportWidth > 768 ? "vertical" : 'horizontal'}
          value={selectedSetting}
          onChange={(event, newValue) => setSelectedSetting(newValue)}
          sx={{
            borderRight: viewportWidth > 768 ? 1 : 0,
            borderColor: 'divider',
          }}
        >
          <Tab label={
            <Typography
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              Settings
              <SettingsIcon />
            </Typography>
          } {...a11yProps(0)} />
          <Tab label={
            <Typography
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              Feedback
              <FeedbackIcon />
            </Typography>
          } {...a11yProps(1)} />
        </Tabs>
        <TabPanel value={selectedSetting} index={0} viewportWidth={viewportWidth}>
          <Stack
            spacing={1}
          >
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
          </Stack>
        </TabPanel>
        <TabPanel value={selectedSetting} index={1} viewportWidth={viewportWidth}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <TextField
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              label='Feedback'
              multiline
              rows={4}
              sx={{
                width: '100%'
              }}
            />
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                minWidth: '180px',
              }}
            >
             {loading ? <CircularProgress size={24} /> : 'Submit Feedback'}
            </Button>
          </Box>
        </TabPanel>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsModal

const TabPanel = (props) => {
  const { children, value, index, viewportWidth } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      style={{
        flexGrow: 1,
        width: viewportWidth <= 768 ? '100%' : ''
      }}
    >
      {value === index && (
        <Box
          sx={{
            p: 2
          }}
        >
          {children}
        </Box>
      )}
    </div>
  )
}

const a11yProps = (index) => {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  }
}