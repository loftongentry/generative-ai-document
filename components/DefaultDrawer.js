import { useEffect, useRef, useState } from "react";
import { IconButton, Avatar, Drawer, Popover, Typography, MenuItem, ListItemIcon, ListItemText, Divider, MenuList, Toolbar, ListItem, ListItemButton, List, Box, Input, CssBaseline } from '@mui/material';
import { signIn, signOut } from "next-auth/react";
import SettingsModal from "./DrawerComponents/SettingsModal";
import DeleteModal from "./DrawerComponents/DeleteModal"
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CreateIcon from '@mui/icons-material/Create';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SecurityIcon from '@mui/icons-material/Security';
import PrivacyPolicyModal from "./DrawerComponents/PrivacyPolicyModal";

const DefaultDrawer = (props) => {
  const {
    session,
    drawerOpen,
    handleDrawer,
    drawerWidth,
    viewportWidth,
    results,
    setResults,
    handleClearResults,
    listItems,
    setListItems,
    fetchFirestoreAnalysis,
    openSnackbar,
    globalLoading,
    generateUrl
  } = props
  const [profileAnchorEl, profileProfileAnchorEl] = useState(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [listItemAnchorEl, setListItemAnchorEl] = useState(null)
  const [listItemMenuOpen, setListItemMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [privacyPolicyModal, setPrivacyPolicyModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const valid = session?.user
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleProfileMenuOpen = (event) => {
    setProfileMenuOpen(true)
    profileProfileAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setProfileMenuOpen(false)
    profileProfileAnchorEl(null)
  }

  const handleListItemMenuOpen = (event, item) => {
    setListItemMenuOpen(true)
    setListItemAnchorEl(event.currentTarget)
    setSelectedItem(item)
  }

  const handleListItemMenuClose = () => {
    setListItemMenuOpen(false)
    setListItemAnchorEl(null)
  }

  const handleSettingsModalOpen = () => {
    setSettingsModalOpen(true)
    handleProfileMenuClose()
  }

  const handleSettingsModalClose = () => {
    setSettingsModalOpen(false)
  }

  const handlePrivacyPolicyModalOpen = () => {
    setPrivacyPolicyModal(true)
    handleProfileMenuClose()
  }

  const handlePrivacyPolicyModalClose = () => {
    setPrivacyPolicyModal(false)
  }

  const handleOpenDeleteModalOpen = () => {
    setDeleteModal(true)
    handleListItemMenuClose()
  }

  const handleDeleteModalClose = () => {
    setDeleteModal(false)
    setSelectedItem(null)
  }

  const handleSignOut = async () => {
    localStorage.removeItem('uuid')
    handleProfileMenuClose()
    signOut()
  }

  const handleChangeName = () => {
    setEditing(true)
    setEditedName(selectedItem.file_name)
    handleListItemMenuClose()
  }

  const handleSetResults = async (item) => {
    if (!editing) {
      setResults(item)
      await generateUrl(item)
    }
  }

  const handleSaveEdit = async () => {
    //NOTE: This is to make sure there isn't an unnecessary call to firestore if the name hasn't been changed
    if (selectedItem?.file_name === editedName) {
      handleCleanUp()
      return
    }

    try {
      const payload = JSON.stringify({
        doc_id: selectedItem.id,
        newName: editedName
      })

      const res = await fetch(`/api/firestore/update-name/${payload}`)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(`${res.status} - ${res.statusText} - ${data.error}`)
      }

      handleCleanUp()
      fetchFirestoreAnalysis()
    } catch (error) {
      console.error(`There was an error updating document's name in google firestore: ${error}`)
      openSnackbar({ message: `There was an error updating your document's analysis, please try again later`, severity: 'error' })
    }
  }

  const handleCleanUp = () => {
    setSelectedItem(null)
    setEditing(false)
    setEditedName('')
  }

  return (
    <Drawer
      sx={{
        pointerEvents: globalLoading ? 'none' : 'auto',
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant={viewportWidth >= 768 ? 'persistent' : 'temporary'}
      anchor="left"
      open={drawerOpen}
    >
      <CssBaseline />
      <Toolbar
        sx={{
          justifyContent: 'center',
        }}
      >
        <IconButton
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '95%',
            height: '80%',
            borderRadius: '5px',
            gap: '5px'
          }}
          disabled={!valid || results === null}
          onClick={handleClearResults}
        >
          <InsertDriveFileIcon />
          <Typography>
            New Upload
          </Typography>
        </IconButton>
        <IconButton onClick={handleDrawer}>
          <ArrowBackIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <Box
        sx={{
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '5px',
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: '8px',
            minHeight: '24px',
            backgroundColor: 'transparent'
          },
          '&:hover::-webkit-scrollbar-thumb': {
            backgroundColor: '#b7b7b7'
          }
        }}
      >
        <List>
          {listItems?.map((item, index) => (
            <ListItem
              key={item.id}
              sx={{
                marginBottom: index !== listItems.length - 1 ? '8px' : 0,
              }}
            >
              <ListItemButton
                onClick={() => handleSetResults(item)}
                selected={results?.id === item?.id}
                disableRipple={editing || results?.id === item?.id}
                sx={{
                  borderRadius: '5px',
                  height: '39px',
                  justifyContent: 'space-between'
                }}
              >
                {editing && selectedItem === item ? (
                  <Input
                    inputRef={inputRef}
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    disableUnderline
                    size={"small"}
                    onBlur={handleSaveEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit()
                      }
                    }}
                    sx={{
                      '& .MuiInput-input': {
                        paddingTop: '0px',
                        paddingBottom: '0px'
                      }
                    }}
                  />
                ) : (
                  <Typography noWrap>
                    {item.file_name}
                  </Typography>
                )}
                {!editing && (results?.id === item?.id) && (
                  <IconButton
                    onClick={(event) => {
                      event.stopPropagation()
                      handleListItemMenuOpen(event, item)
                    }}
                    edge='end'
                    disableRipple
                  >
                    <MoreVertIcon />
                  </IconButton>
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Popover
          open={listItemMenuOpen}
          anchorEl={listItemAnchorEl}
          onClose={handleListItemMenuClose}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
        >
          <MenuList>
            <MenuItem
              onClick={handleChangeName}
            >
              <ListItemIcon>
                <CreateIcon />
              </ListItemIcon>
              <ListItemText>Change Name</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={handleOpenDeleteModalOpen}
              sx={{ color: '#ff7f7f' }}
            >
              <ListItemIcon sx={{ color: '#ff7f7f' }}>
                <DeleteForeverIcon />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </MenuList>
        </Popover>
      </Box>
      <Box
        sx={{
          marginTop: 'auto',
        }}
      >
        <Divider />
        <Toolbar disableGutters>
          <IconButton onClick={handleProfileMenuOpen}>
            <Avatar
              src={session?.user?.image}
              alt={session?.user?.name}
            />
          </IconButton>
          <Typography>
            {session === null ? 'Please Login Here' : session?.user?.name}
          </Typography>
        </Toolbar>
        <Popover
          open={profileMenuOpen}
          anchorEl={profileAnchorEl}
          onClose={handleProfileMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
        >
          {session ? (
            <MenuList>
              <MenuItem onClick={handleSettingsModalOpen}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
              <MenuItem onClick={handlePrivacyPolicyModalOpen}>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText>Privacy Policy</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSignOut} >
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText>Log Out</ListItemText>
              </MenuItem>
            </MenuList>
          ) : (
            <MenuList>
              <MenuItem onClick={handlePrivacyPolicyModalOpen}>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText>Privacy Policy</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => signIn()}>
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText>Log In</ListItemText>
              </MenuItem>
            </MenuList>
          )}
        </Popover>
      </Box>
      <SettingsModal
        session={session}
        settingsModalOpen={settingsModalOpen}
        handleSettingsModalClose={handleSettingsModalClose}
        viewportWidth={viewportWidth}
        fetchFirestoreAnalysis={fetchFirestoreAnalysis}
        openSnackbar={openSnackbar}
        signOut={signOut}
        setListItems={setListItems}
      />
      <DeleteModal
        openDeleteModal={deleteModal}
        onClose={handleDeleteModalClose}
        selectedItem={selectedItem}
        results={results}
        setResults={setResults}
        setSelectedItem={setSelectedItem}
        fetchFirestoreAnalysis={fetchFirestoreAnalysis}
        openSnackbar={openSnackbar}
      />
      <PrivacyPolicyModal
        privacyPolicyModal={privacyPolicyModal}
        handlePrivacyPolicyModalClose={handlePrivacyPolicyModalClose}
      />
    </Drawer >
  )
}

export default DefaultDrawer