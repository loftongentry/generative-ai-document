import { useState } from "react";
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack, Tab, Tabs, TextField, Typography } from "@mui/material"
import { ThemeSelector } from "@/context/ThemeContext";
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import FeedbackIcon from '@mui/icons-material/Feedback';

const SettingsModal = (props) => {
  const { session, settingsModalOpen, handleSettingsModalClose, viewportWidth, fetchFirestoreAnalysis, openSnackbar, signOut, setListItems } = props
  const [selectedSetting, setSelectedSetting] = useState(0)
  const [subject, setSubject] = useState('')
  const [feedback, setFeedback] = useState('')
  const [confirmModal, setConfirmModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const uuid = localStorage.getItem('uuid')

  const handleOpenConfirmModal = (action) => {
    setConfirmModal(true)
    setModalType(action)
  }

  //NOTE: Unused because I didn't want to go through the process of verifying my app to use restricted scopes
  const handleSubmit = async () => {
    setLoading(true)

    if (subject === '' || feedback === '') {
      setLoading(false)
      openSnackbar({ message: 'Please fill out all form fields', severity: 'error' })
      return
    }

    const payload = JSON.stringify({
      userEmail: session?.user.email,
      userName: session?.user.name,
      subject,
      body: feedback,
      uuid
    })

    try {
      const res = await fetch(`/api/email/${payload}`)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(`${res.status} - ${res.statusText} - ${data.error}`)
      }

      setSubject('')
      setFeedback('')
      openSnackbar({ message: 'Feedback successfully submitted', severity: 'success' })
    } catch (error) {
      console.error(`There was an error submitting feedback: ${error}`)
      openSnackbar({ message: 'There was an error submitting your feedback, please try again later', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAnalysis = async () => {
    setModalLoading(true)

    try {
      const res = await fetch(`/api/firestore/delete-all/${uuid}`)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(`${res.status} - ${res.statusText} - ${data.error}`)
      }

      setConfirmModal(false)
      handleSettingsModalClose()
      fetchFirestoreAnalysis()
      openSnackbar({ message: 'All analysis successfully deleted', severity: 'success' })
    } catch (error) {
      console.error(`There was an error deleting the documents for account: ${uuid}: ${error}`)
      openSnackbar({ message: 'There was an error deleting all of your analysis, please try again later', severity: 'error' })
    } finally {
      setModalLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setModalLoading(true)

    try {
      const res = await fetch(`/api/auth/delete-account/${uuid}`)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(`${res.status} - ${res.statusText} - ${data.error}`)
      }

      localStorage.removeItem('uuid')
      signOut()
    } catch (error) {
      console.error(`There was an error deleting the account: ${uuid}: ${error}`)
      openSnackbar({ message: 'There was an error deleting your account, please try again later', severity: 'error' })
    } finally {
      setModalLoading(false)
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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <SettingsIcon />
            <Typography variant="h5">
              Settings
            </Typography>
          </Box>
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
        {/* <Tabs
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
        </Tabs> */}
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
                onClick={() => handleOpenConfirmModal('Delete Analysis')}
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
                onClick={() => handleOpenConfirmModal('Delete Account')}
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
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              label='Subject'
              fullWidth
            />
            <TextField
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              label='Feedback'
              multiline
              rows={4}
              fullWidth
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
      <Dialog open={confirmModal}>
        <DialogContent
          sx={{
            height: '80px',
            width: '350px',
            overflow: 'hidden'
          }}
        >
          <Typography>
            {modalLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              modalType === 'Delete Analysis' ? 'Are you sure you want to delete all analysis data?' : 'Are you sure you want to delete your account?'
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setConfirmModal(false)}
            disabled={modalLoading}
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              modalType === 'Delete Analysis' ? handleDeleteAnalysis() : handleDeleteAccount()
            }}
            disabled={modalLoading}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
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